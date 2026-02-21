// app/api/register/route.ts
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectToDb from "@/lib/mongo"; // adjust path if needed
import User from "@/Modal/user"; // adjust path if needed
import Otp from "@/Modal/otp"; // adjust path if needed
import { generateVerificationToken, generateOtp, hashOtp } from "@/lib/token";
import sendOtpEmail from "@/lib/mail/sendOtpEmail";
import hashPassword from "@/lib/password";

type RegisterBody = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
};

type CreatedUser = {
  _id: mongoose.Types.ObjectId;
  email: string;
  // include other fields you expect; kept minimal here
};

export async function POST(req: Request): Promise<Response> {
  await connectToDb();

  // Safe JSON parse
  const raw = await req.json().catch(() => null);
  const body = (raw as RegisterBody) ?? null;
  if (!body) {
    return NextResponse.json({ msg: "Invalid JSON" }, { status: 400 });
  }

  let { email, password, name } = body;

  // Basic existence + type checks
  if (!email || !password || !name) {
    return NextResponse.json(
      { msg: "All fields are required" },
      { status: 400 },
    );
  }
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string"
  ) {
    return NextResponse.json(
      { msg: "Credentials must be strings" },
      { status: 400 },
    );
  }

  email = email.trim().toLowerCase();
  name = name.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email as string)) {
    return NextResponse.json({ msg: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { msg: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    // Check for existing user inside the transaction
    const existing = await User.findOne({ email: email as string }).session(session).exec();
    if (existing) {
      await session.abortTransaction();
      return NextResponse.json(
        { msg: "User with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create the user document in the transaction
    // Note: create returns an array when passing array of docs
    const created = await User.create(
      [{ name: name as string, email: email as string, password: hashedPassword }],
      { session },
    );
    const user = (created && created[0]) as unknown as CreatedUser;

    // Generate OTP and store hashed OTP in DB (transactional)
    const otp = generateOtp(6);
    await Otp.deleteMany({ userId: user._id }).session(session).exec();
    await Otp.create(
      [
        {
          userId: user._id,
          codeHash: hashOtp(otp),
        },
      ],
      { session },
    );

    // Commit transaction BEFORE sending email (keeps original behavior)
    await session.commitTransaction();

    // Create a verification token cookie
    const verificationToken = generateVerificationToken({
      uid: user._id.toString(),
      email: user.email,
    });

    // Send OTP email; if it fails, roll back by deleting user + otps (best-effort)
    try {
      await sendOtpEmail(email as string, otp, { expiryMinutes: 60 });
    } catch (mailErr) {
      console.error("Email failed, rolling back user + otp:", mailErr);

      // Best-effort cleanup since transaction already committed
      await Promise.allSettled([
        User.deleteOne({ _id: user._id }).exec(),
        Otp.deleteMany({ userId: user._id }).exec(),
      ]);

      return NextResponse.json(
        { msg: "Failed to send verification email" },
        { status: 500 },
      );
    }

    // Successful response with cookie set
    const res = NextResponse.json(
      { msg: `Account created. Verification code sent to ${email}` },
      { status: 201 },
    );

    const isProd = process.env.NODE_ENV === "production";
    // maxAge is in seconds for NextResponse.cookies
    res.cookies.set("verificationToken", verificationToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour (seconds)
      path: "/",
    });

    return res;
  } catch (e: any) {
    // Abort transaction if it's still active
    try {
      await session.abortTransaction();
    } catch {
      /* ignore */
    }
    console.error("Error in register route:", e);

    // Duplicate key (unique email) error
    if (e?.code === 11000) {
      return NextResponse.json(
        { msg: "User with this email already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  } finally {
    // Always end session to free server resources
    try {
      session.endSession();
    } catch {
      /* ignore */
    }
  }
}
