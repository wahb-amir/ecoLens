// lib/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// Sub-interface for better organization
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

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verifyToken?: string;
  tokens: { token: string; createdAt: Date }[];
  
  // --- ECO-TRACKER FIELDS ---
  ecoScore: number;
  totalScans: number;
  streak: number;
  lastScanDate?: Date;
  categoryStats: ICategoryStats;
  achievements: IAchievement[];
  
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true }, // Indexed for performance
    password: { type: String, required: true, select: false }, // Security: Don't return password by default
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    tokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // --- ECO-TRACKER DATA ---
    ecoScore: { type: Number, default: 0, index: true }, // Indexing score for Leaderboards
    totalScans: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastScanDate: { type: Date },
    
    // Nested object for categorical analytics
    categoryStats: {
      plastic: { type: Number, default: 0 },
      paper: { type: Number, default: 0 },
      glass: { type: Number, default: 0 },
      metal: { type: Number, default: 0 },
      organic: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },

    // Achievement Tracking
    achievements: [
      {
        achievementId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { 
    timestamps: true,
    // Add this for performance when transforming to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
userSchema.methods.updateStreak = async function() {
  const now = new Date();
  
  if (!this.lastScanDate) {
    this.streak = 1;
  } else {
    const lastDate = new Date(this.lastScanDate);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastScanDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    
    const diffTime = today.getTime() - lastScanDay.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      this.streak += 1;
    } else if (diffDays > 1) {
      this.streak = 1;
    } 
  }

  this.lastScanDate = now;
  return this.save();
};
userSchema.index({ ecoScore: -1, totalScans: -1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;