import { useState, useCallback } from 'react';
import type { EcoStats } from '@/lib/types';

const initialStats: EcoStats = {
  totalScans: 0,
  scansByType: {},
};

export function useEcoTracker() {
  const [stats] = useState<EcoStats>(initialStats);
  const addClassification = useCallback(() => {}, []);
  const resetStats = useCallback(() => {}, []);
  return { stats, addClassification, resetStats, isLoaded: true };
}
