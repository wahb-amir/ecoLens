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
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); 

    const [topUsers, currentUser] = await Promise.all([
      User.find({})
        .sort({ ecoScore: -1, totalScans: -1 })
        .limit(50)
        .select('name ecoScore totalScans streak')
        .lean(),
      userId ? User.findById(userId).select('name ecoScore totalScans streak').lean() : null
    ]);

    const top50Formatted = topUsers.map((user, index) => {
      const isMe = userId === user._id.toString();
      return {
        id: user._id.toString(),
        rank: index + 1,
        // We mask others, but if it's "Me", show the full name
        name:  user.name,
        avatar: user.name.charAt(0).toUpperCase(),
        ecoScore: user.ecoScore,
        totalScans: user.totalScans,
        streak: user.streak,
        isCurrentUser: isMe, // CRITICAL FLAG
        trend: user.streak >= 3 ? 'up' : user.streak === 0 ? 'down' : 'stable',
      };
    });

    let userStats = null;
    if (currentUser) {
      // Find if user is already in the top 50 array
      const top50Entry = top50Formatted.find(u => u.id === userId);
      
      if (top50Entry) {
        userStats = top50Entry;
      } else {
        // Calculate rank if outside top 50
        const rank = await User.countDocuments({
          $or: [
            { ecoScore: { $gt: currentUser.ecoScore } },
            { ecoScore: currentUser.ecoScore, totalScans: { $gt: currentUser.totalScans } }
          ]
        }) + 1;

        userStats = {
          id: currentUser._id.toString(),
          rank,
          name: currentUser.name,
          avatar: currentUser.name.charAt(0).toUpperCase(),
          ecoScore: currentUser.ecoScore,
          totalScans: currentUser.totalScans,
          streak: currentUser.streak,
          isCurrentUser: true,
          trend: 'stable',
        };
      }
    }

    return NextResponse.json({ success: true, data: top50Formatted, currentUser: userStats });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}