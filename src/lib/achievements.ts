import type { Achievement, EcoStats } from '@/lib/types';
import { Award, Leaf, Sprout, Star } from 'lucide-react';

export const achievements: Achievement[] = [
  {
    id: 'first-scan',
    name: 'First Step',
    description: 'Classify your first item.',
    icon: Sprout,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 1,
  },
  {
    id: 'recycling-rookie',
    name: 'Recycling Rookie',
    description: 'Classify 10 items.',
    icon: Star,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 10,
  },
  {
    id: 'eco-enthusiast',
    name: 'Eco-Enthusiast',
    description: 'Classify 25 items.',
    icon: Leaf,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 25,
  },
  {
    id: 'waste-warrior',
    name: 'Waste Warrior',
    description: 'Classify 50 items.',
    icon: Award,
    isUnlocked: (stats: EcoStats) => stats.totalScans >= 50,
  },
  {
    id: 'plastic-pioneer',
    name: 'Plastic Pioneer',
    description: 'Classify 10 plastic items.',
    icon: Award,
    isUnlocked: (stats: EcoStats) => (stats.scansByType['plastic'] || 0) >= 10,
  },
  {
    id: 'paper-pro',
    name: 'Paper Pro',
    description: 'Classify 10 paper items.',
    icon: Award,
    isUnlocked: (stats: EcoStats) => (stats.scansByType['paper'] || 0) >= 10,
  },
];
