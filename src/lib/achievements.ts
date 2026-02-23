// lib/achievements.ts
import { ACHIEVEMENT_RULES, AchievementRule } from './achievements/config';
import { EcoStats } from './types'; // Ensure this matches your EcoStats interface
import { 
  Trophy, 
  Flame, 
  Leaf, 
  Zap, 
  ShieldCheck, 
  Target, 
  Award,
  Star,
  ZapOff,
  Box,
  FileText,
  GlassWater,
  Coins
} from 'lucide-react';

/**
 * Maps IDs to Lucide Icons for a unified look.
 * Staff Engineering tip: Keeping icons in a map prevents 
 * large switch statements in your JSX.
 */
const ICON_MAP: Record<string, any> = {
  'ACH_first-step': Zap,
  'ACH_recycling-rookie': Leaf,
  'ACH_eco-enthusiast': Flame,
  'ACH_waste-warrior': Target,
  'ACH_planet-protector': ShieldCheck,
  'ACH_recycling-champion': Trophy,
  'ACH_score-starter': Star,
  'ACH_score-pro': Award,
  'ACH_plastic-pioneer': Box,
  'ACH_paper-pro': FileText,
  'ACH_glass-guru': GlassWater,
  'ACH_metal-master': Coins,
};

/**
 * The unified Achievement object used by the UI
 */
export const achievements = ACHIEVEMENT_RULES.map((rule) => ({
  ...rule,
  icon: ICON_MAP[rule.id] || Award,
  // Helper to check if a specific achievement is unlocked based on user stats
  isUnlocked: (stats: EcoStats) => {
    if (rule.type === 'totalScans') return stats.totalScans >= rule.threshold;
    if (rule.type === 'ecoScore') return stats.ecoScore >= rule.threshold;
    if (rule.type === 'category' && rule.category) {
      return (stats.categoryStats?.[rule.category] || 0) >= rule.threshold;
    }
    return false;
  },
}));

/**
 * Calculates current progress percentage and raw numbers
 * Professional UI depends on accurate math here.
 */
export function getAchievementProgress(achievement: typeof achievements[0], stats: EcoStats) {
  let current = 0;

  if (achievement.type === 'totalScans') {
    current = stats.totalScans;
  } else if (achievement.type === 'ecoScore') {
    current = stats.ecoScore;
  } else if (achievement.type === 'category' && achievement.category) {
    current = stats.categoryStats?.[achievement.category] || 0;
  }

  return {
    current,
    target: achievement.threshold,
    percentage: Math.min((current / achievement.threshold) * 100, 100),
  };
}