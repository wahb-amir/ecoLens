import mongoose, { Schema, Document, Model, Types } from "mongoose";

// 1. Data Interface (The "What")
export interface IAchievement {
  achievementId: string;
  unlockedAt: Date;
}

export interface ICategoryStats {
  plastic: number;
  paper: number;
  glass: number;
  metal: number;
  organic: number;
  other: number;
}

export interface IUser {
  name: string;
  email: string;
  password?: string; // Optional because of 'select: false'
  isVerified: boolean;
  verifyToken?: string;
  tokens: { token: string; createdAt: Date }[];
  ecoScore: number;
  totalScans: number;
  streak: number;
  lastScanDate?: Date;
  categoryStats: ICategoryStats;
  achievements: IAchievement[];
  resetOtp?: string | null;
  resetOtpExpiry?: Date | null;
  resetToken?: string | null; // For the final password change step
  resetTokenExpiry?: Date;
}

// 2. Methods Interface (The "Behavior")
export interface IUserMethods {
  updateStreak(): Promise<UserDocument>;
}

// 3. The "Hydrated Document" Type
// This combines the data, the methods, and Mongoose's Document properties
export type UserDocument = Document<unknown, {}, IUser> &
  IUser &
  IUserMethods & {
    _id: Types.ObjectId;
  };

// 4. Schema Definition
// Notice the Generics: <Data, Model, Methods>
const userSchema = new Schema<
  IUser,
  Model<IUser, any, IUserMethods>,
  IUserMethods
>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    resetOtp: { type: String, default: null, select: false },
    resetOtpExpiry: { type: Date, default: null, select: false },
    resetToken: { type: String, default: null, select: false },
    resetTokenExpiry: { type: Date, select: false },
    ecoScore: { type: Number, default: 0, index: true },
    totalScans: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastScanDate: { type: Date },
    categoryStats: {
      plastic: { type: Number, default: 0 },
      paper: { type: Number, default: 0 },
      glass: { type: Number, default: 0 },
      metal: { type: Number, default: 0 },
      organic: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    achievements: [
      {
        achievementId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 5. Implementing the Method
userSchema.methods.updateStreak = async function (this: UserDocument) {
  const now = new Date();

  if (!this.lastScanDate) {
    this.streak = 1;
  } else {
    const lastDate = new Date(this.lastScanDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastScanDay = new Date(
      lastDate.getFullYear(),
      lastDate.getMonth(),
      lastDate.getDate(),
    );

    const diffTime = today.getTime() - lastScanDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.streak += 1;
    } else if (diffDays > 1) {
      this.streak = 1;
    }
    // If diffDays === 0, it's the same day, we do nothing to the streak
  }

  this.lastScanDate = now;
  return this.save();
};

userSchema.index({ ecoScore: -1, totalScans: -1 });

// 6. Model Export
const User =
  (mongoose.models.User as Model<IUser, {}, IUserMethods>) ||
  mongoose.model<IUser, Model<IUser, {}, IUserMethods>>("User", userSchema);

export default User;
