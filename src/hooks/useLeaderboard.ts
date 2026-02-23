import useSWR from 'swr';
import { RankTrend } from '@/lib/leaderboard';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  ecoScore: number;
  totalScans: number;
  streak: number;
  trend: RankTrend;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLeaderboard() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: LeaderboardEntry[] }>(
    '/api/leaderboard',
    fetcher,
    {
      refreshInterval: 60000, // Auto-refresh every 60 seconds
      revalidateOnFocus: true, // Refresh when user switches back to the tab
    }
  );

  return {
    leaderboard: data?.data || [],
    isLoading,
    isError: error,
    mutate, // Expose mutate in case you want to force a refresh after a user scans something
  };
}