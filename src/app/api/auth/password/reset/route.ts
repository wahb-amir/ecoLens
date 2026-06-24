// app/api/auth/password/reset/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";

export async function POST(req: Request) {
  try {
    await connectToDb();
    const { userId, recoveryToken, newPassword } = await req.json();

    if (!userId || !recoveryToken || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Find user by ID, ensuring the recovery token matches and isn't expired
    const user = await User.findOne({
      _id: userId,
      resetToken: recoveryToken,
      resetTokenExpiry: { $gt: new Date() }, // If you implemented token expiry
    }).select("+password"); // Need to select password if it's set to 'select: false' in schema

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired recovery session" },
        { status: 401 },
      );
    }

    // 2. Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update the password and clear all recovery fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
