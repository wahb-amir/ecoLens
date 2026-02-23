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
  if (l.includes("metal") || l.includes("can") || l.includes("aluminum")) return "metal";
  if (l.includes("food") || l.includes("organic") || l.includes("fruit")) return "organic";
  return "other";
};

export async function POST(req: Request) {
  try {
    await connectToDb();
    const cookieStore =await cookies();
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
    if (!dataUrl) return NextResponse.json({ error: "Missing dataUrl" }, { status: 400 });

    // 2. AI PREDICTION (Your existing proxy logic)
    const target = "https://wahb-amir-ecolens.hf.space/run/predict";
    const proxied = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [dataUrl] }),
    });

    const payload = await proxied.json();
    
    // Normalize extraction logic (Staff level: assume raw output needs cleaning)
    let predictions = [];
    if (payload?.data?.[0]?.confidences) {
      predictions = payload.data[0].confidences.map((c: any) => ({
        label: String(c.label),
        prob: Number(c.confidence),
      }));
    }

    if (predictions.length === 0) {
      return NextResponse.json({ error: "AI failed to identify item" }, { status: 422 });
    }

    const topMatch = predictions[0];
    const category = mapLabelToCategory(topMatch.label);
    const pointsEarned = Math.round(topMatch.prob * 20); // Scale points by confidence

    const objectUserId = new Types.ObjectId(userId);
    const updatedUser = await User.findOneAndUpdate(
      { _id: objectUserId },
      { 
        $inc: { 
          totalScans: 1, 
          ecoScore: pointsEarned,
          [`categoryStats.${category}`]: 1 
        },
        $set: { lastScanDate: new Date() }
      },
      { new: true, upsert: true }
    );

    // 4. ACHIEVEMENT ENGINE
    const newlyUnlocked: string[] = [];
    const existingAchievementIds = new Set(updatedUser.achievements.map((a: any) => a.achievementId));

    for (const rule of ACHIEVEMENT_RULES) {
      if (existingAchievementIds.has(rule.id)) continue;

      let meetsThreshold = false;
      if (rule.type === 'totalScans') meetsThreshold = updatedUser.totalScans >= rule.threshold;
      if (rule.type === 'ecoScore') meetsThreshold = updatedUser.ecoScore >= rule.threshold;
      if (rule.type === 'category') meetsThreshold = updatedUser.categoryStats[rule.category!] >= rule.threshold;

      if (meetsThreshold) {
        newlyUnlocked.push(rule.id);
      }
    }

    // If new achievements found, push them to the user document
    if (newlyUnlocked.length > 0) {
      await User.updateOne(
        { _id: updatedUser._id },
        { 
          $push: { 
            achievements: { 
              $each: newlyUnlocked.map(id => ({ achievementId: id, unlockedAt: new Date() })) 
            } 
          } 
        }
      );
    }

    // 5. PERSIST SCAN HISTORY
    const scanLog = await Scan.create({
      userId: updatedUser._id,
      label: topMatch.label,
      confidence: topMatch.prob,
      pointsEarned,
      metadata: { 
        inference_time: payload?.duration,
        raw_category: category 
      }
    });

    // 6. RETURN ENRICHED RESPONSE
    return NextResponse.json({
      predictions,
      scanId: scanLog._id,
      pointsEarned,
      newAchievements: newlyUnlocked,
      userStats: {
        totalScans: updatedUser.totalScans,
        ecoScore: updatedUser.ecoScore,
        achievementsCount: updatedUser.achievements.length + newlyUnlocked.length
      },
      inference_time: payload?.duration ?? null,
    });

  } catch (err: any) {
    console.error("Critical Backend Failure:", err);
    return NextResponse.json({ error: "Internal Pipeline Error" }, { status: 500 });
  }
}