// app/api/predict/route.ts
import { NextResponse } from "next/server";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";
import Scan from "@/Modal/scan";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/token";
import { Types } from "mongoose";
import { ACHIEVEMENT_RULES } from "@/lib/achievements/config";

/* ---------- helpers (same as yours, but slightly clearer) ---------- */

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

const isNoMatchLabel = (label?: string | null): boolean => {
  if (!label) return true;
  const l = label.toString().trim().toLowerCase();
  if (!l) return true;

  const invalidLabels = ["unknown", "mixed", "no_waste", "no-waste", "none"];
  if (invalidLabels.includes(l)) return true;
  if (l.includes("unknown/mixed") || l.includes("mixed/unknown")) return true;

  if (
    /\b(unknown|mixed|no_waste|no-waste)\b/.test(l) &&
    !/\b(plastic|paper|glass|metal|food|organic|cardboard|aluminum|can)\b/.test(
      l,
    )
  ) {
    return true;
  }
  return false;
};

/**
 * Calculate what to do with the streak based on previous lastScanDate.
 * Returns: { action: 'increment' | 'reset' | 'noop', newStreak?: number }
 */
const decideStreakUpdate = (
  lastScanDate: Date | undefined | null,
  now: Date,
): { action: "increment" | "reset" | "noop" | "init"; newStreak?: number } => {
  if (!lastScanDate) return { action: "init", newStreak: 1 };

  const last = new Date(lastScanDate);
  const current = new Date(now);

  last.setUTCHours(0, 0, 0, 0);
  current.setUTCHours(0, 0, 0, 0);

  const diffInMs = current.getTime() - last.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return { action: "noop" }; // same day
  if (diffInDays === 1) return { action: "increment" }; // consecutive
  return { action: "reset", newStreak: 1 }; // gap
};

/* -------------------- route handler -------------------- */
export async function POST(req: Request) {
  try {
    await connectToDb();

    // auth
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyAccessToken(accessToken);
    if (!decoded || decoded.uid === undefined) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decoded.uid;

    // payload
    const { dataUrl } = await req.json();
    if (!dataUrl) {
      return NextResponse.json({ error: "Missing dataUrl" }, { status: 400 });
    }

    // 1) call HF Space (proxy)
    const target = "https://wahb-amir-ecolens.hf.space/run/predict";
    const proxied = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [dataUrl] }),
    });
    const payload = await proxied.json();

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
    if (isNoMatchLabel(topMatch.label)) {
      return NextResponse.json({
        predictions,
        noMatch: true,
        message: "No confident match",
      });
    }

    // prepare values
    const category = mapLabelToCategory(topMatch.label);
    const pointsEarned = Math.round(topMatch.prob * 20);
    const objectUserId = new Types.ObjectId(userId);

    const currentUser = await User.findById(objectUserId)
      .select(
        "lastScanDate streak achievements totalScans ecoScore categoryStats",
      )
      .lean();

    const now = new Date();
    const streakDecision = decideStreakUpdate(currentUser?.lastScanDate, now);

    const updateQuery: any = {
      $inc: {
        totalScans: 1,
        ecoScore: pointsEarned,
        // dynamic nested increment for category stats
        [`categoryStats.${category}`]: 1,
      },
      $set: {
        lastScanDate: now,
      },
    };

    if (streakDecision.action === "increment") {
      updateQuery.$inc.streak = 1;
    } else if (
      streakDecision.action === "reset" ||
      streakDecision.action === "init"
    ) {
      updateQuery.$set.streak = streakDecision.newStreak ?? 1;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: objectUserId },
      updateQuery,
      { returnDocument: "after", upsert: true },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    // 4) Achievement evaluation (based on updated values)
    const newlyUnlocked: string[] = [];
    const existingAchievementIds = new Set(
      (updatedUser.achievements || []).map((a: any) => a.achievementId),
    );

    for (const rule of ACHIEVEMENT_RULES) {
      if (existingAchievementIds.has(rule.id)) continue;

      let meetsThreshold = false;
      if (rule.type === "totalScans")
        meetsThreshold = (updatedUser.totalScans ?? 0) >= rule.threshold;
      if (rule.type === "ecoScore")
        meetsThreshold = (updatedUser.ecoScore ?? 0) >= rule.threshold;
      if (rule.type === "streak")
        meetsThreshold = (updatedUser.streak ?? 0) >= rule.threshold;
      if (rule.type === "category")
        meetsThreshold =
          (updatedUser.categoryStats?.[rule.category!] ?? 0) >= rule.threshold;

      if (meetsThreshold) newlyUnlocked.push(rule.id);
    }

    // 5) persist scan log + push achievements (both can run in parallel)
    const scanDoc = {
      userId: updatedUser._id,
      label: topMatch.label,
      confidence: topMatch.prob,
      pointsEarned,
      metadata: {
        inference_time: payload?.duration ?? null,
        raw_category: category,
      },
    };

    const writes: Promise<any>[] = [];

    // create scan
    writes.push(Scan.create(scanDoc));

    // push achievements (if any)
    if (newlyUnlocked.length > 0) {
      const toPush = newlyUnlocked.map((id) => ({
        achievementId: id,
        unlockedAt: new Date(),
      }));
      writes.push(
        User.updateOne(
          { _id: updatedUser._id },
          { $push: { achievements: { $each: toPush } } },
        ),
      );
    }

    const [scanLog] = await Promise.all(writes);

    // 6) Respond (note: achievementsCount is current achievements + newlyUnlocked)
    return NextResponse.json({
      predictions,
      scanId: scanLog?._id ?? null,
      pointsEarned,
      newAchievements: newlyUnlocked,
      userStats: {
        streak: updatedUser.streak,
        totalScans: updatedUser.totalScans,
        ecoScore: updatedUser.ecoScore,
        achievementsCount:
          (updatedUser.achievements?.length ?? 0) + newlyUnlocked.length,
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
