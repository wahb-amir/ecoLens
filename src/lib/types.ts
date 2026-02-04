import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";


export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  avatar: string;
}

export interface EcoStats {
  totalScans: number;
  scansByType: Record<string, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: ForwardRefExoticComponent<SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>>;
  isUnlocked: (stats: EcoStats) => boolean;
  goal?: number; // optional property
}
