import type { LucideIcon } from "lucide-react";

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  avatar: string;
}

/**
 * Staff Engineer Tip: Define a strict Category type to prevent 
 * "stringly-typed" errors across the codebase.
 */
export type WasteCategory = 'plastic' | 'paper' | 'glass' | 'metal' | 'organic' | 'other';

export interface EcoStats {
  totalScans: number;
  ecoScore: number;
  streak: number;
  // Renamed for clarity and to match the MongoDB schema we created
  categoryStats: Record<WasteCategory, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  // Simplified type for Lucide icons
  icon: LucideIcon;
  isUnlocked: (stats: EcoStats) => boolean;
  type: 'totalScans' | 'ecoScore' | 'category';
  threshold: number;
  category?: WasteCategory;
}