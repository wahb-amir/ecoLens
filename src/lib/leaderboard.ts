export type RankTrend = 'up' | 'down' | 'stable';

export interface EcoUser {
  id: string;
  name: string;
  avatar: string;
  ecoPoints: number;
  itemsRecycled: number;
  co2Saved: number; // in kg
  rank: number;
  trend: RankTrend;
}