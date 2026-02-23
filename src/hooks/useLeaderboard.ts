import useSWR, { KeyedMutator } from 'swr';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  ecoScore: number;
  totalScans: number;
  isCurrentUser: boolean;
  streak: number;
  trend: 'up' | 'down' | 'stable';
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null; // This allows the sticky footer to work
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLeaderboard(userId?: string) {
  // Pass the userId to the API so the backend can flag 'isCurrentUser'
  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    userId ? `/api/leaderboard?userId=${userId}` : '/api/leaderboard',
    fetcher,
    {
      refreshInterval: 60000, 
      revalidateOnFocus: true,
    }
  );

  return {
    leaderboard: data?.data || [],
    currentUser: data?.currentUser || null, // Explicitly return this
    isLoading,
    isError: error,
    mutate: mutate as KeyedMutator<LeaderboardResponse>,
  };
}