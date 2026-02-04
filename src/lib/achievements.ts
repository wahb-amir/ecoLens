import type { Achievement, EcoStats } from '@/lib/types';
import { Award, Leaf, Sprout, Star, ShieldCheck, Trophy, Gem, Crown, Recycle, Package, GlassWater } from 'lucide-react';

export const achievements: Achievement[] = [
  {
    id: 'first-scan',
    name: 'First Step',
    description: 'Classify your first item.',
    icon: Sprout,
    goal: 1,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 1,
  },
  {
    id: 'recycling-rookie',
    name: 'Recycling Rookie',
    description: 'Classify 10 items.',
    icon: Star,
    goal: 10,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 10,
  },
  {
    id: 'eco-enthusiast',
    name: 'Eco-Enthusiast',
    description: 'Classify 25 items.',
    icon: Leaf,
    goal: 25,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 25,
  },
  {
    id: 'waste-warrior',
    name: 'Waste Warrior',
    description: 'Classify 50 items.',
    icon: Award,
    goal: 50,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 50,
  },
  {
    id: 'planet-protector',
    name: 'Planet Protector',
    description: 'Classify 100 items.',
    icon: ShieldCheck,
    goal: 100,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 100,
  },
  {
    id: 'recycling-champion',
    name: 'Recycling Champion',
    description: 'Classify 250 items.',
    icon: Trophy,
    goal: 250,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 250,
  },
  {
    id: 'score-starter',
    name: 'Score Starter',
    description: 'Reach an Eco Score of 250.',
    icon: Gem,
    goal: 250,
    isUnlocked: (stats: EcoStats) => stats.ecoScore >= 250,
  },
  {
    id: 'score-pro',
    name: 'Score Pro',
    description: 'Reach an Eco Score of 1000.',
    icon: Crown,
    goal: 1000,
    isUnlocked: (stats: EcoStats) => stats.ecoScore >= 1000,
  },
  {
    id: 'plastic-pioneer',
    name: 'Plastic Pioneer',
    description: 'Classify 10 plastic items.',
    icon: Recycle,
    goal: 10,
    isUnlocked: (stats: EcoStats) => (stats.scansByType['plastic'] || 0) >= 10,
  },
  {
    id: 'paper-pro',
    name: 'Paper Pro',
    description: 'Classify 10 paper items.',
    icon: Package,
    goal: 10,
    isUnlocked: (stats: EcoStats) => (stats.scansByType['paper'] || 0) >= 10,
  },
   {
    id: 'glass-guru',
    name: 'Glass Guru',
    description: 'Classify 10 glass items.',
    icon: GlassWater,
    goal: 10,
    isUnlocked: (stats: EcoStats) => (stats.scansByType['glass'] || 0) >= 10,
  },
  {
    id: 'metal-master',
    name: 'Metal Master',
    description: 'Classify 10 metal items.',
    icon: Award, // Re-using icon, can be changed
    goal: 10,
    isUnlocked: (stats: EcoStats) => (stats.scansByType['metal'] || 0) >= 10,
  },
];


export function getAchievementProgress(achievement: Achievement, stats: EcoStats) {
    if (achievement.isUnlocked(stats)) return null;

    let current = 0;
    const target = achievement.goal;

    if (achievement.id.startsWith('score-')) {
        current = stats.ecoScore;
    } else if (achievement.id.includes('-')) {
        const wasteType = achievement.id.split('-')[0];
        if (Object.keys(stats.scansByType).includes(wasteType)) {
             current = stats.scansByType[wasteType] || 0;
        } else {
             current = stats.totalScans;
        }
    }

    if (current > target) current = target;
    
    return {
        current,
        target,
        percentage: (current / target) * 100,
    };
}
