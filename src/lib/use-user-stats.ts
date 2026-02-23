// hooks/use-user-stats.ts
import useSWR from 'swr';
import { EcoStats } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUserStats() {
  const { data, error, mutate, isLoading } = useSWR<EcoStats>(
    '/api/user/stats', 
    fetcher,
    {
      revalidateOnFocus: true, 
      refreshInterval: 30000,  
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    refreshStats: mutate,
  };
}