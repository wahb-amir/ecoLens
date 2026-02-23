// app/api/user/stats/route.ts
import { NextResponse } from "next/server";
import connectToDb from "@/lib/mongo";
import User from "@/Modal/user";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/token";
export async function GET() {
  try {
    // 1. Establish Database Connection
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

    // 3. Fetch User Data
    // We use .lean() for performance since we don't need Mongoose's save() methods here
    const user = await User.findById(decoded.uid).lean();

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }
    const stats = {
      totalScans: user.totalScans || 0,
      ecoScore: user.ecoScore || 0,
      streak: user.streak || 0,
      categoryStats: {
        plastic: user.categoryStats?.plastic || 0,
        paper: user.categoryStats?.paper || 0,
        glass: user.categoryStats?.glass || 0,
        metal: user.categoryStats?.metal || 0,
        organic: user.categoryStats?.organic || 0,
        other: user.categoryStats?.other || 0,
      },
      unlockedAchievements:
        user.achievements?.map((a: any) => a.achievementId) || [],
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching protocols" },
      { status: 500 },
    );
  }
}
