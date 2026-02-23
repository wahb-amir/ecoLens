'use server';

import mongoose from 'mongoose';
import connectToDb from '@/lib/mongo';
import Scan from '@/Modal/scan';
import User from '@/Modal/user';

import { WASTE_POINTS, labelToCategory } from '@/lib/eco-points';
import { revalidatePath } from 'next/cache';

interface ScanPayload {
  userId: string;
  label: string;
  confidence: number;
  imageUrl?: string;
}

export async function processWasteScan(payload: ScanPayload) {
  await connectToDb();
  
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, label, confidence, imageUrl } = payload;
    const category = labelToCategory(label);
    const points = WASTE_POINTS[category] || 5;

    // 1. Create the Scan History entry
    const newScan = await Scan.create([{
      userId,
      label,
      confidence,
      imageUrl,
      pointsEarned: points,
      metadata: { category, processedAt: new Date() }
    }], { session });

    // 2. Update User Stats & Streak
    // We use $inc to avoid "race conditions" where two scans happen at once
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          ecoScore: points,
          totalScans: 1,
          [`categoryStats.${category}`]: 1
        },
      },
      { session, new: true }
    );

    if (!updatedUser) throw new Error("User not found");

    // 3. Handle Streak Logic (using the method you defined in your model)
    await updatedUser.updateStreak(); 

    // Commit all changes
    await session.commitTransaction();
    
    // Purge the Next.js cache so the leaderboard reflects new scores immediately
    revalidatePath('/leaderboard');

    return { 
      success: true, 
      pointsEarned: points, 
      newTotal: updatedUser.ecoScore 
    };

  } catch (error) {
    await session.abortTransaction();
    console.error("Scan Processing Failed:", error);
    return { success: false, error: "Transaction aborted. Data remains consistent." };
  } finally {
    session.endSession();
  }
}