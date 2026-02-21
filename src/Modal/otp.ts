import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

const OTP_TTL_SECONDS = 60 * 60; // 1 hour
const OTP_LENGTH = 6;

export function generateNumericOtp(length = OTP_LENGTH): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function hashOtp(otp: string | number): string {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

// ---------------- TypeScript interfaces ----------------
export interface IOtp extends Document {
  userId: mongoose.Types.ObjectId;
  type: "email_verification" | "password_reset";
  codeHash: string;
  expiresAt: Date;
  attempts: number;
}

export interface OtpModel extends Model<IOtp> {
  createForUser(
    userId: mongoose.Types.ObjectId | string,
    type?: "email_verification" | "password_reset",
    options?: { length?: number; ttlSeconds?: number; expiresAt?: Date }
  ): Promise<string>;

  verifyForUser(
    userId: mongoose.Types.ObjectId | string,
    candidateOtp: string | number,
    type?: "email_verification" | "password_reset",
    options?: { maxAttempts?: number }
  ): Promise<{ ok: true } | { ok: false; reason: "no_otp" | "expired" | "invalid" | "too_many_attempts" }>;

  clearForUser(userId: mongoose.Types.ObjectId | string, type?: string | null): Promise<void>;
}

// ---------------- Schema ----------------
// NOTE: pass OtpModel as the second generic so statics have correct `this` type
const otpSchema = new Schema<IOtp, OtpModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["email_verification", "password_reset"],
      default: "email_verification",
      required: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + OTP_TTL_SECONDS * 1000),
    },
    attempts: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: false,
  }
);

// Indexes
otpSchema.index({ userId: 1, type: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ---------------- Static methods ----------------
otpSchema.statics.createForUser = async function (
  this: OtpModel,
  userId: mongoose.Types.ObjectId | string,
  type: "email_verification" | "password_reset" = "email_verification",
  options: { length?: number; ttlSeconds?: number; expiresAt?: Date } = {}
): Promise<string> {
  const length = options.length ?? OTP_LENGTH;
  const otp = generateNumericOtp(length);
  const codeHash = hashOtp(otp);
  const expiresAt = options.expiresAt ?? new Date(Date.now() + ((options.ttlSeconds ?? OTP_TTL_SECONDS) * 1000));

  await this.findOneAndUpdate(
    { userId, type },
    { codeHash, expiresAt, attempts: 0 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).exec();

  return otp;
};

otpSchema.statics.verifyForUser = async function (
  this: OtpModel,
  userId: mongoose.Types.ObjectId | string,
  candidateOtp: string | number,
  type: "email_verification" | "password_reset" = "email_verification",
  options: { maxAttempts?: number } = {}
): Promise<{ ok: true } | { ok: false; reason: "no_otp" | "expired" | "invalid" | "too_many_attempts" }> {
  const maxAttempts = options.maxAttempts ?? 10;
  const record = await this.findOne({ userId, type }).exec();
  if (!record) return { ok: false, reason: "no_otp" };

  // explicit expiry check (TTL index may not have run yet)
  if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
    await this.deleteOne({ _id: record._id }).exec();
    return { ok: false, reason: "expired" };
  }

  if (record.attempts >= maxAttempts) {
    await this.deleteOne({ _id: record._id }).exec();
    return { ok: false, reason: "too_many_attempts" };
  }

  if (hashOtp(candidateOtp) !== record.codeHash) {
    await this.updateOne({ _id: record._id }, { $inc: { attempts: 1 } }).exec();
    return { ok: false, reason: "invalid" };
  }

  // success — one-time use
  await this.deleteOne({ _id: record._id }).exec();
  return { ok: true };
};

otpSchema.statics.clearForUser = async function (
  this: OtpModel,
  userId: mongoose.Types.ObjectId | string,
  type: string | null = null
): Promise<void> {
  const q: Record<string, unknown> = { userId };
  if (type) q.type = type;
  await this.deleteMany(q).exec();
};

// ---------------- Export model ----------------
const OtpModel =
  (mongoose.models.Otp as OtpModel) || mongoose.model<IOtp, OtpModel>("Otp", otpSchema);

export default OtpModel;