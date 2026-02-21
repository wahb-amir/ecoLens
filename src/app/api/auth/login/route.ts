import { NextResponse } from "next/server";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";
import { generateAccessToken, generateRefreshToken } from "@/lib/token";
import { comparePassword } from "@/lib/password";

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    await connectToDb();

    // Parse JSON safely
    const body: LoginRequestBody | null = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const { email, password } = body;

    // Validate input
    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 400 },
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (!user.isVerified)
      return NextResponse.json(
        { message: "Please verify your email first" },
        { status: 401 },
      );

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save auth token in user document
    user.tokens.push({ token: accessToken, createdAt: new Date() });
    await user.save();

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 },
    );

    // Set cookies
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 15 * 60,
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
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
