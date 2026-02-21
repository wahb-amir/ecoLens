// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose, { HydratedDocument } from "mongoose";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";
import Otp from "@/Modal/otp";
import {
  verifyVerificationToken,
  generateAccessToken,
  generateRefreshToken,
  hashOtp,
} from "@/lib/token";

type VerifyBody = {
  otp?: unknown;
  email?: unknown;
};

function cookieOpts(ms: number) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict" as const,
    maxAge: Math.floor(ms / 1000), // NextResponse cookie maxAge is in seconds
    path: "/",
  };
}

export async function POST(req: Request): Promise<Response> {
  try {
    await connectToDb();

    const body = (await req.json().catch(() => null)) as VerifyBody | null;
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON", reason: "invalid_json" },
        { status: 400 }
      );
    }

    const { otp: otpRaw, email: emailFromBody } = body;

    if (!otpRaw || typeof otpRaw !== "string" || !/^\d{6}$/.test(otpRaw.trim())) {
      return NextResponse.json(
        { error: "OTP is required and must be a 6-digit string", reason: "invalid_otp_format" },
        { status: 400 }
      );
    }
    const otpValue = otpRaw.trim();

    // Resolve user: prefer verificationToken cookie, fallback to email in body
    let user: HydratedDocument<any> | null = null;
    const cookieStore =await cookies();
    const tokenCookie = cookieStore.get("verificationToken")?.value;

    if (tokenCookie) {
      const decoded = verifyVerificationToken(tokenCookie);
      if (!decoded || !decoded.uid) {
        return NextResponse.json(
          { error: "Invalid verification token", reason: "invalid_verification_token" },
          { status: 401 }
        );
      }
      user = await User.findById(decoded.uid).exec();
    } else if (emailFromBody && typeof emailFromBody === "string") {
      user = await User.findOne({ email: (emailFromBody as string).toLowerCase().trim() }).exec();
    } else {
      return NextResponse.json(
        { error: "No verification token or email provided", reason: "missing_identifier" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found", reason: "user_not_found" }, { status: 404 });
    }

    const MAX_ATTEMPTS = 10;
    const otpRecord = await Otp.findOne({ userId: user._id, type: "email_verification" }).exec();

    let verificationOk = false;
    let reason: "not_set" | "expired" | "invalid" | "too_many_attempts" | undefined = "invalid";

    if (!otpRecord) {
      reason = "not_set";
    } else {
      // expiry check
      if (otpRecord.expiresAt && otpRecord.expiresAt.getTime() <= Date.now()) {
        try {
          await Otp.deleteOne({ _id: otpRecord._id }).exec();
        } catch (err) {
          console.error("Failed to delete expired OTP record:", err);
        }
        reason = "expired";
      } else if (otpRecord.attempts >= MAX_ATTEMPTS) {
        try {
          await Otp.deleteOne({ _id: otpRecord._id }).exec();
        } catch (err) {
          console.error("Failed to delete OTP after too many attempts:", err);
        }
        reason = "too_many_attempts";
      } else {
        try {
          const candidateHash = hashOtp(otpValue);
          if (candidateHash === otpRecord.codeHash) {
            // success: delete OTP record (one-time)
            try {
              await Otp.deleteOne({ _id: otpRecord._id }).exec();
            } catch (err) {
              console.error("Failed to delete OTP record after success:", err);
            }
            verificationOk = true;
            reason = undefined;
          } else {
            // incorrect: increment attempts
            try {
              await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } }).exec();
            } catch (err) {
              console.error("Failed to increment OTP attempts:", err);
            }
            reason = "invalid";
          }
        } catch (err) {
          console.error("Error while comparing OTP hashes:", err);
          return NextResponse.json(
            { error: "Internal Server Error", reason: "server_error" },
            { status: 500 }
          );
        }
      }
    }

    // Map reasons -> HTTP status + payload
    if (!verificationOk) {
      if (reason === "expired") {
        return NextResponse.json({ error: "OTP expired", reason: "expired" }, { status: 410 });
      }
      if (reason === "invalid") {
        return NextResponse.json({ error: "Incorrect OTP", reason: "invalid" }, { status: 401 });
      }
      if (reason === "not_set") {
        return NextResponse.json({ error: "No OTP issued for this user", reason: "not_set" }, { status: 400 });
      }
      if (reason === "too_many_attempts") {
        return NextResponse.json(
          { error: "Too many attempts. A new OTP is required.", reason: "too_many_attempts" },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: "OTP verification failed", reason: "failed" }, { status: 400 });
    }

    // OTP valid -> finalize verification
    // adapt property name if your User schema uses `verified` vs `isVerified`
    if (!(user as any).isVerified) {
      (user as any).isVerified = true;
      (user as any).verifiedAt = new Date();
      await (user as any).save();
    }

    // Ensure any existing OTP records for this user/type are removed (best-effort)
    try {
      await Otp.deleteMany({ userId: user._id, type: "email_verification" }).exec();
    } catch (err) {
      console.error("Failed to remove OTP records:", err);
    }

    // Generate tokens and set cookies
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    const res = NextResponse.json(
      {
        message: "Account verified and logged in",
        user: {
          id: user._id.toString(),
          email: (user as any).email,
          role: (user as any).role ?? "user",
        },
      },
      { status: 200 }
    );

    // Access token: short lived (15 minutes)
    res.cookies.set("accessToken", accessToken, cookieOpts(15 * 60 * 1000)); // ms -> maxAge seconds

    // Refresh token: long lived (7 days)
    res.cookies.set("refreshToken", refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));

    // Clear verificationToken cookie (set to empty + maxAge 0)
    res.cookies.set("verificationToken", "", { path: "/", maxAge: 0 });

    return res;
  } catch (e) {
    console.error("error in verify POST /:", e);
    return NextResponse.json({ error: "Internal Server Error", reason: "server_error" }, { status: 500 });
  }
}