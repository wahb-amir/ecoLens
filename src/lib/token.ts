// lib/token.ts
import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * NOTE:
 * - If you use jsonwebtoken v8 you can `pnpm add -D @types/jsonwebtoken`.
 * - If you use v9 (pure ESM, may lack types), add a minimal declaration file:
 *    // types/jsonwebtoken.d.ts
 *    declare module "jsonwebtoken";
 *
 * The code below uses a tiny local cast so it works either way.
 */

/* ---------- minimal typed wrappers around jsonwebtoken ---------- */
type JwtSignFn = (payload: string | object | Buffer, secret: string, options?: { expiresIn?: string | number }) => string;
type JwtVerifyFn = (token: string, secret: string) => any;

const jwtSign = (jwt as unknown as { sign: JwtSignFn }).sign;
const jwtVerify = (jwt as unknown as { verify: JwtVerifyFn }).verify;

/* ---------- env helpers (fail fast in prod) ---------- */
function getEnv(name: "ACCESS_TOKEN_SECRET" | "REFRESH_TOKEN_SECRET" | "VERIFICATION_TOKEN_SECRET"): string {
  const v = process.env[name];
  if (!v || typeof v !== "string" || v.length === 0) {
    // Fail fast: missing secrets are a critical misconfiguration
    throw new Error(`Missing required env var ${name}`);
  }
  return v;
}

/* ---------- types ---------- */
export type TokenPayload = {
  uid: string;
  iat?: number;
  exp?: number;
  [k: string]: any;
};

export type RotateResult = {
  accessToken: string;
  refreshToken: string;
  user: { id: string };
} | null;

/* ---------- JWT helpers ---------- */
export function generateAccessToken(userId: string): string {
  const secret = getEnv("ACCESS_TOKEN_SECRET");
  return jwtSign({ uid: userId }, secret, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string): string {
  const secret = getEnv("REFRESH_TOKEN_SECRET");
  return jwtSign({ uid: userId }, secret, { expiresIn: "7d" });
}

export function generateVerificationToken(payload: object): string {
  const secret = getEnv("VERIFICATION_TOKEN_SECRET");
  return jwtSign(payload, secret, { expiresIn: "1h" });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const secret = getEnv("ACCESS_TOKEN_SECRET");
    const decoded = jwtVerify(token, secret);
    return typeof decoded === "object" && decoded !== null ? (decoded as TokenPayload) : null;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const secret = getEnv("REFRESH_TOKEN_SECRET");
    const decoded = jwtVerify(token, secret);
    return typeof decoded === "object" && decoded !== null ? (decoded as TokenPayload) : null;
  } catch {
    return null;
  }
}

export function verifyVerificationToken(token: string): TokenPayload | null {
  try {
    const secret = getEnv("VERIFICATION_TOKEN_SECRET");
    const decoded = jwtVerify(token, secret);
    return typeof decoded === "object" && decoded !== null ? (decoded as TokenPayload) : null;
  } catch {
    return null;
  }
}

/* ---------- OTP helpers ---------- */
export function generateOtp(length = 6): string {
  // crypto.randomInt(0, 10**length) -> ensures uniform numeric OTP
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(length, "0");
}

export function hashOtp(otp: string | number): string {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export function verifyOtp(
  user: { verificationOtp?: { codeHash: string; expiresAt: Date } | null } | null | undefined,
  otp: string | number
): boolean {
  if (!user || !user.verificationOtp) return false;

  const { codeHash, expiresAt } = user.verificationOtp;
  if (!expiresAt || Date.now() > expiresAt.getTime()) return false;

  return hashOtp(otp) === codeHash;
}

/* ---------- rotate tokens ---------- */
export async function rotateTokens(refreshToken?: string | null): Promise<RotateResult> {
  if (!refreshToken) return null;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.uid) return null;

    const userId = String(decoded.uid);
    // In production: fetch user from DB, ensure token still valid, check token revocation, etc.
    // Here we return a fresh pair:
    const accessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: { id: userId },
    };
  } catch {
    return null;
  }
}