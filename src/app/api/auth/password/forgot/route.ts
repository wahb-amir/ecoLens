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

    // Explicitly select security fields
    const user = await User.findOne({ email }).select("+resetOtpExpiry");

    // FAANG Security: Constant response to prevent account enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a code was sent.",
      });
    }

    // --- Rate Limiting Logic ---
    if (user.resetOtpExpiry) {
      const now = new Date();
      const expiry = new Date(user.resetOtpExpiry);

      // Calculate how long ago the code was sent.
      // OTP is valid for 15m. If > 14m left, they just requested it.
      const msLeft = expiry.getTime() - now.getTime();
      const cooldownMs = 1 * 60 * 1000; // 1 minute cooldown
      const totalWindowMs = 15 * 60 * 1000;

      const isWithinCooldown = msLeft > totalWindowMs - cooldownMs;

      if (isWithinCooldown) {
        const secondsToWait = Math.ceil(
          (msLeft - (totalWindowMs - cooldownMs)) / 1000,
        );
        return NextResponse.json(
          {
            error: `Please wait ${secondsToWait}s before requesting a new code.`,
          },
          { status: 429 }, // Too Many Requests
        );
      }
    }

    // 1. Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // 3. Update User
    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // 4. Send Email
    await sendOtpEmail(email, otp, {
      heading: "Reset your password",
      subHeading: "Use the code below to securely verify your identity.",
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
