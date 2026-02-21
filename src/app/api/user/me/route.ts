// app/api/user/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, rotateTokens } from "@/lib/token";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

function cookieOptsSeconds(maxAgeSeconds: number) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * GET /api/user
 * Returns 200 + { id } when authenticated, or 200 + null when not.
 * If access token is expired/invalid and a valid refresh token exists,
 * this route will rotate tokens (issue new cookies) and return the user.
 */
export async function GET(): Promise<Response> {
  try {
    const cookieStore =await cookies();
    const accessCookie = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshCookie = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    // Nothing provided -> unauthenticated
    if (!accessCookie && !refreshCookie) {
      return NextResponse.json(null, { status: 200 });
    }

    // Try access token first
    if (accessCookie) {
      const decoded = verifyAccessToken(accessCookie);
      if (decoded && decoded.uid) {
        return NextResponse.json({ id: decoded.uid }, { status: 200 });
      }
      // access invalid/expired -> fallthrough to refresh logic (if present)
    }

    // Try rotating using refresh token
    if (refreshCookie) {
      const rotated = await rotateTokens(refreshCookie); // { accessToken, refreshToken, user } | null
      if (!rotated) {
        // rotation failed -> unauthenticated
        return NextResponse.json(null, { status: 200 });
      }

      // rotation succeeded -> set new cookies and return user
      const res = NextResponse.json({ id: rotated.user?.id ?? null }, { status: 200 });

      // choose cookie lifetimes to match your tokens: access=15m, refresh=7d (seconds)
      res.cookies.set(ACCESS_TOKEN_COOKIE, rotated.accessToken, cookieOptsSeconds(15 * 60));
      res.cookies.set(REFRESH_TOKEN_COOKIE, rotated.refreshToken, cookieOptsSeconds(7 * 24 * 60 * 60));

      return res;
    }

    // No usable tokens -> unauthenticated
    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Auth route error:", err);
    // On error, do not leak details — return unauthenticated (same shape)
    return NextResponse.json(null, { status: 200 });
  }
}