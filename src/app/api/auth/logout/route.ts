import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const cookieOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax" as const,
    };

    const tokensToClear = ["access_token", "refresh_token", "session_id"];

    tokensToClear.forEach((tokenName) => {
      cookieStore.delete({
        name: tokenName,
        ...cookieOptions,
      });
    });
    const response = NextResponse.json(
      {
        success: true,
        message: "Session terminated successfully",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );

    response.headers.set("Clear-Site-Data", '"cookies", "storage"');
    response.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate",
    );
    response.headers.set("Pragma", "no-cache");

    return response;
  } catch (error) {
    // Log to an external service like Sentry or Datadog in production
    console.error(
      "[AUTH_LOGOUT_ERROR]:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error during session termination",
      },
      { status: 500 },
    );
  }
}
