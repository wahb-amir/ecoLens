import { NextResponse, NextRequest } from "next/server";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";

export async function GET(req: NextRequest) {
  try {
    await connectToDb();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Define the base filter to only include verified users
    const verifiedFilter = { isVerified: true };

    const [topUsers, currentUserDoc] = await Promise.all([
      // 1. Fetch only verified users for the top 50
      User.find(verifiedFilter)
        .sort({ ecoScore: -1, totalScans: -1 })
        .limit(50)
        .select("name ecoScore totalScans streak isVerified")
        .lean(),
      // 2. Fetch current user (verified or not, so we can handle the UI state)
      userId
        ? User.findById(userId)
            .select("name ecoScore totalScans streak isVerified")
            .lean()
        : null,
    ]);

    const top50Formatted = topUsers.map((user, index) => {
      const isMe = userId === user._id.toString();
      return {
        id: user._id.toString(),
        rank: index + 1,
        name: user.name,
        avatar: user.name.charAt(0).toUpperCase(),
        ecoScore: user.ecoScore,
        totalScans: user.totalScans,
        streak: user.streak,
        isCurrentUser: isMe,
        trend: user.streak >= 3 ? "up" : user.streak === 0 ? "down" : "stable",
      };
    });

    let userStats = null;

    // Only calculate/return user stats if the user exists AND is verified
    // Unverified users won't appear on the leaderboard at all
    if (currentUserDoc && currentUserDoc.isVerified) {
      const top50Entry = top50Formatted.find((u) => u.id === userId);

      if (top50Entry) {
        userStats = top50Entry;
      } else {
        // Calculate rank among VERIFIED users only
        const rank =
          (await User.countDocuments({
            ...verifiedFilter,
            $or: [
              { ecoScore: { $gt: currentUserDoc.ecoScore } },
              {
                ecoScore: currentUserDoc.ecoScore,
                totalScans: { $gt: currentUserDoc.totalScans },
              },
            ],
          })) + 1;

        userStats = {
          id: currentUserDoc._id.toString(),
          rank,
          name: currentUserDoc.name,
          avatar: currentUserDoc.name.charAt(0).toUpperCase(),
          ecoScore: currentUserDoc.ecoScore,
          totalScans: currentUserDoc.totalScans,
          streak: currentUserDoc.streak,
          isCurrentUser: true,
          trend: "stable",
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: top50Formatted,
      currentUser: userStats,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
