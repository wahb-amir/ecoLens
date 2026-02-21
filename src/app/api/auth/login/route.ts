// app/api/login/route.ts
import { NextResponse } from "next/server";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";
import Otp from "@/Modal/otp";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
} from "@/lib/token";
import { comparePassword } from "@/lib/password";
import sendOtpEmail from "@/lib/mail/sendOtpEmail";

interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(req: Request) {
  try {
    await connectToDb();

    const body = (await req
      .json()
      .catch(() => null)) as LoginRequestBody | null;
    if (!body) {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const { email, password } = body;

    // Basic validation (keep message generic for auth failures)
    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail }).exec();
    // If user not found -> generic 401 (do not reveal existence)
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password before doing any account-specific flows
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // If user exists and password correct but not verified -> OTP flow
    if (!user.isVerified) {
      // Look up existing OTP for this user
      const otpRecord = await Otp.findOne({
        userId: user._id,
        type: "email_verification",
      }).exec();

      if (otpRecord && otpRecord.codeHash) {
        // OTP already exists — tell frontend user must verify
        return NextResponse.json(
          {
            message: "Please verify your email",
            reason: "pending_verification",
          },
          { status: 200 },
        );
      }

      // No OTP found — generate and send a new one
      try {
        const otp = await Otp.createForUser(user._id, "email_verification", {
          length: 6,
          ttlSeconds: 60 * 60,
        });
        await sendOtpEmail(user.email, otp, {
          expiryMinutes: 60,
          origin: process.env.ORIGIN,
        });

        // Create verification token cookie
        const verificationToken = generateVerificationToken({
          uid: user._id.toString(),
          email: user.email,
        });
        const res = NextResponse.json(
          {
            message: "Verification code sent to your email",
            reason: "otp_sent",
          },
          { status: 200 },
        );

        const isProd = process.env.NODE_ENV === "production";
        res.cookies.set("verificationToken", verificationToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: "lax",
          maxAge: 60 * 60, // 1 hour
          path: "/",
        });

        return res;
      } catch (mailErr) {
        console.error("Failed to send OTP email during login flow:", mailErr);
        // Cleanup any partially created OTP
        await Otp.deleteMany({ userId: user._id, type: "email_verification" })
          .exec()
          .catch(() => null);

        return NextResponse.json(
          {
            message: "Failed to send verification email",
            reason: "otp_failed",
          },
          { status: 500 },
        );
      }
    }

    // User is verified -> proceed to issue tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.tokens = user.tokens || [];
    user.tokens.push({ token: accessToken, createdAt: new Date() });
    await user.save();

    // Build response and set cookies
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 },
    );
    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Error in login route:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
