// app/api/auth/password/forgot/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";
import { sendOtpEmail } from "@/lib/mail/sendOtpEmail";

export async function POST(req: Request) {
  try {
    await connectToDb();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    // FAANG Security: Always return 200 to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a code was sent.",
      });
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash OTP before storing (Security Best Practice)
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // 3. Save to database with 15-minute expiry
    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // 4. Send the email using your existing utility
    await sendOtpEmail(email, otp, {
      heading: "Reset your password",
      subHeading:
        "We received a request to reset your password. Use the code below to securely verify your identity.",
      verifyPath: "/forgot-password/verify",
      verifyLinkText: "Verify & Reset Password",
      includeEmailInRedirect: email,
      expiryMinutes: 15,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
