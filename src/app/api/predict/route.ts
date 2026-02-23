// app/api/predict/route.ts
import { NextResponse } from "next/server";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";
import Scan from "@/Modal/scan";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/token";
import { Types } from "mongoose";
import { ACHIEVEMENT_RULES } from "@/lib/achievements/config";

// Helper to map AI labels to our DB categories
const mapLabelToCategory = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("plastic")) return "plastic";
  if (l.includes("paper") || l.includes("cardboard")) return "paper";
  if (l.includes("glass")) return "glass";
  if (l.includes("metal") || l.includes("can") || l.includes("aluminum"))
    return "metal";
  if (l.includes("food") || l.includes("organic") || l.includes("fruit"))
    return "organic";
  return "other";
};

const calculateStreak = (
  lastScanDate: Date | undefined,
  currentScanDate: Date,
): number | undefined => {
  if (!lastScanDate) return 1;

  const last = new Date(lastScanDate);
  const current = new Date(currentScanDate);

  last.setUTCHours(0, 0, 0, 0);
  current.setUTCHours(0, 0, 0, 0);

  const diffInMs = current.getTime() - last.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays === 1) return undefined; // consecutive -> increment
  if (diffInDays > 1) return 1; // gap -> reset to 1
  return 0; // same day -> no change
};

// NEW: treat unknown/mixed as no-match
const isNoMatchLabel = (label?: string | null): boolean => {
  if (!label) return true;
  const l = label.toString().trim().toLowerCase();
  if (!l) return true;
  // handle exact and slash variants and simple contains
  if (l === "unknown" || l === "mixed") return true;
  if (l.includes("unknown/mixed") || l.includes("mixed/unknown")) return true;
  // also protect simple contain case (e.g. "unknown - something")
  if (/\b(unknown|mixed)\b/.test(l) && !/\b(plastic|paper|glass|metal|food|organic|cardboard|aluminum|can)\b/.test(l)) {
    return true;
  }
  return false;
};

export async function POST(req: Request) {
  try {
    await connectToDb();
    const cookieStore = await cookies();
    const acesssToken = cookieStore.get("access_token")?.value;

    if (!acesssToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyAccessToken(acesssToken);
    if (!decoded || decoded.uid === undefined) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decoded.uid;

    const { dataUrl } = await req.json();
    if (!dataUrl)
      return NextResponse.json({ error: "Missing dataUrl" }, { status: 400 });

    // 2. AI PREDICTION (proxy)
    const target = "https://wahb-amir-ecolens.hf.space/run/predict";
    const proxied = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [dataUrl] }),
    });

    const payload = await proxied.json();

    // Normalize extraction logic
    let predictions: { label: string; prob: number }[] = [];
    if (payload?.data?.[0]?.confidences) {
      predictions = payload.data[0].confidences.map((c: any) => ({
        label: String(c.label),
        prob: Number(c.confidence),
      }));
    }

    if (predictions.length === 0) {
      return NextResponse.json(
        { error: "AI failed to identify item" },
        { status: 422 },
      );
    }

    const topMatch = predictions[0];

    // --- NEW: If the model returns Unknown / Mixed, DO NOT update DB or create a scan.
    if (isNoMatchLabel(topMatch.label)) {
      // Return the predictions and a noMatch flag so frontend can present "No match found"
      return NextResponse.json({
        predictions,
        noMatch: true,
        message: "No confident match",
      });
    }

    // proceed to map and update DB (only for valid matches)
    const category = mapLabelToCategory(topMatch.label);
    const pointsEarned = Math.round(topMatch.prob * 20); // Scale points by confidence

    const objectUserId = new Types.ObjectId(userId);
    const currentUser = await User.findById(objectUserId);

    if (!currentUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    const streakResult = calculateStreak(currentUser.lastScanDate, now);

    const updateQuery: any = {
      $inc: {
        totalScans: 1,
        ecoScore: pointsEarned,
        [`categoryStats.${category}`]: 1,
      },
      $set: { lastScanDate: now },
    };

    if (streakResult === undefined) {
      updateQuery.$inc.streak = 1;
    } else if (streakResult === 1) {
      updateQuery.$set.streak = 1;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: objectUserId },
      updateQuery,
      { new: true, upsert: true },
    );

    // ACHIEVEMENT ENGINE
    const newlyUnlocked: string[] = [];
    const existingAchievementIds = new Set(
      updatedUser.achievements.map((a: any) => a.achievementId),
    );

    for (const rule of ACHIEVEMENT_RULES) {
      if (existingAchievementIds.has(rule.id)) continue;

      let meetsThreshold = false;
      if (rule.type === "totalScans")
        meetsThreshold = updatedUser.totalScans >= rule.threshold;
      if (rule.type === "ecoScore")
        meetsThreshold = updatedUser.ecoScore >= rule.threshold;
      if (rule.type === "streak")
        meetsThreshold = updatedUser.streak >= rule.threshold;
      if (rule.type === "category")
        meetsThreshold =
          updatedUser.categoryStats[rule.category!] >= rule.threshold;

      if (meetsThreshold) {
        newlyUnlocked.push(rule.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      await User.updateOne(
        { _id: updatedUser._id },
        {
          $push: {
            achievements: {
              $each: newlyUnlocked.map((id) => ({
                achievementId: id,
                unlockedAt: new Date(),
              })),
            },
          },
        },
      );
    }

    // Persist scan history
    const scanLog = await Scan.create({
      userId: updatedUser._id,
      label: topMatch.label,
      confidence: topMatch.prob,
      pointsEarned,
      metadata: {
        inference_time: payload?.duration,
        raw_category: category,
      },
    });

    // Return enriched response
    return NextResponse.json({
      predictions,
      scanId: scanLog._id,
      pointsEarned,
      newAchievements: newlyUnlocked,
      userStats: {
        streak: updatedUser.streak,
        totalScans: updatedUser.totalScans,
        ecoScore: updatedUser.ecoScore,
        achievementsCount:
          updatedUser.achievements.length + newlyUnlocked.length,
      },
      inference_time: payload?.duration ?? null,
    });
  } catch (err: any) {
    console.error("Critical Backend Failure:", err);
    return NextResponse.json(
      { error: "Internal Pipeline Error" },
      { status: 500 },
    );
  }
}