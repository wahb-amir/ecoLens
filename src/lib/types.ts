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
export type WasteCategory =
  | "plastic"
  | "paper"
  | "glass"
  | "metal"
  | "organic"
  | "other";

export interface EcoStats {
  totalScans: number;
  ecoScore: number;
  streak: number;
  categoryStats: {
    plastic: number;
    paper: number;
    glass: number;
    metal: number;
    organic: number;
    other: number;
  };
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  // Simplified type for Lucide icons
  icon: LucideIcon;
  isUnlocked: (stats: EcoStats) => boolean;
  type: "totalScans" | "ecoScore" | "category" | "streak";
  threshold: number;
  category?: WasteCategory;
}
