import { NextResponse, NextRequest } from 'next/server';
import connectToDb from '@/lib/mongo';
import User from '@/Modal/user';

// const maskName = (name: string) => {
//   if (!name) return 'Anonymous';
//   const parts = name.trim().split(/\s+/);
//   if (parts.length === 1) {
//     return parts[0].charAt(0) + '*'.repeat(Math.max(0, parts[0].length - 1));
//   }
//   return parts
//     .map(word => word.charAt(0).toUpperCase() + '*'.repeat(Math.max(0, word.length - 1)))
//     .join(' ');
// };

export async function GET(req: NextRequest) {
  try {
    await connectToDb();

    // 1. Get current User ID from query params or session 
    // (In a real app, get this from your Auth middleware)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); 

    // 2. Run queries in parallel for maximum performance
    const [topUsers, currentUser] = await Promise.all([
      User.find({})
        .sort({ ecoScore: -1, totalScans: -1 })
        .limit(50)
        .select('name ecoScore totalScans streak')
        .lean(),
      userId ? User.findById(userId).select('name ecoScore totalScans streak').lean() : null
    ]);

    // 3. Format the Top 50
    const top50Formatted = topUsers.map((user, index) => ({
      id: user._id.toString(),
      rank: index + 1,
      name: user.name,
      avatar: user.name.charAt(0).toUpperCase(),
      ecoScore: user.ecoScore,
      totalScans: user.totalScans,
      streak: user.streak,
      isCurrentUser: userId === user._id.toString(),
      trend: user.streak >= 3 ? 'up' : user.streak === 0 ? 'down' : 'stable',
    }));

    let userStats = null;

    // 4. If user exists but isn't in Top 50, calculate their rank
    if (currentUser) {
      const isNotInTop50 = !topUsers.some(u => u._id.toString() === userId);

      if (isNotInTop50) {
        // Count how many people have a higher score than the current user
        // We use the same sort logic: higher ecoScore OR (same score AND more scans)
        const rank = await User.countDocuments({
          $or: [
            { ecoScore: { $gt: currentUser.ecoScore } },
            { ecoScore: currentUser.ecoScore, totalScans: { $gt: currentUser.totalScans } }
          ]
        }) + 1;

        userStats = {
          id: currentUser._id.toString(),
          rank,
          name: currentUser.name, // We don't mask the user's own name for their own UI
          avatar: currentUser.name.charAt(0).toUpperCase(),
          ecoScore: currentUser.ecoScore,
          totalScans: currentUser.totalScans,
          streak: currentUser.streak,
          isCurrentUser: true,
          trend: currentUser.streak >= 3 ? 'up' : currentUser.streak === 0 ? 'down' : 'stable',
        };
      } else {
        // If they ARE in the top 50, find their formatted record
        userStats = top50Formatted.find(u => u.id === userId);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: top50Formatted,
      currentUser: userStats // This allows the UI to show a "Your Rank" sticky bar
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}