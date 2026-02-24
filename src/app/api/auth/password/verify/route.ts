// app/api/auth/password/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";

export async function POST(req: Request) {
  try {
    await connectToDb();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // 1. Find user by email AND valid hashed OTP that hasn't expired
    const user = await User.findOne({
      email,
      resetOtp: hashedOtp,
      resetOtpExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // 2. Generate a secure Recovery Token (32 bytes = 64 hex characters)
    const recoveryToken = crypto.randomBytes(32).toString("hex");

    // 3. Clear the OTP so it can't be reused, and set the new token
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.resetToken = recoveryToken;
    // Optional: Add a short expiry for the token itself (e.g., 10 mins)
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    // 4. Return the token and userId for the frontend to use in the final step
    return NextResponse.json({ 
      message: "Code verified", 
      userId: user._id.toString(),
      recoveryToken 
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}