// lib/achievements/config.ts

export type AchievementType = "totalScans" | "ecoScore" | "category" | "streak";
export interface AchievementRule {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  threshold: number;
  category?: "plastic" | "paper" | "glass" | "metal" | "organic" | "other";
}

export const ACHIEVEMENT_RULES: AchievementRule[] = [
  // --- QUANTITY BASED ---
  {
    id: "ACH_first-step",
    name: "First Step",
    description: "Classify your first item.",
    type: "totalScans",
    threshold: 1,
  },
  {
    id: "ACH_recycling-rookie",
    name: "Recycling Rookie",
    description: "Classify 10 items.",
    type: "totalScans",
    threshold: 10,
  },
  {
    id: "ACH_eco-enthusiast",
    name: "Eco-Enthusiast",
    description: "Classify 25 items.",
    type: "totalScans",
    threshold: 25,
  },
  {
    id: "ACH_waste-warrior",
    name: "Waste Warrior",
    description: "Classify 50 items.",
    type: "totalScans",
    threshold: 50,
  },
  {
    id: "ACH_planet-protector",
    name: "Planet Protector",
    description: "Classify 100 items.",
    type: "totalScans",
    threshold: 100,
  },
  {
    id: "ACH_recycling-champion",
    name: "Recycling Champion",
    description: "Classify 250 items.",
    type: "totalScans",
    threshold: 250,
  },

  // --- SCORE BASED ---
  {
    id: "ACH_score-starter",
    name: "Score Starter",
    description: "Reach an Eco Score of 250.",
    type: "ecoScore",
    threshold: 250,
  },
  {
    id: "ACH_score-pro",
    name: "Score Pro",
    description: "Reach an Eco Score of 1000.",
    type: "ecoScore",
    threshold: 1000,
  },

  // --- CATEGORY SPECIFIC ---
  {
    id: "ACH_plastic-pioneer",
    name: "Plastic Pioneer",
    description: "Classify 10 plastic items.",
    type: "category",
    category: "plastic",
    threshold: 10,
  },
  {
    id: "ACH_paper-pro",
    name: "Paper Pro",
    description: "Classify 10 paper items.",
    type: "category",
    category: "paper",
    threshold: 10,
  },
  {
    id: "ACH_glass-guru",
    name: "Glass Guru",
    description: "Classify 10 glass items.",
    type: "category",
    category: "glass",
    threshold: 10,
  },
  {
    id: "ACH_metal-master",
    name: "Metal Master",
    description: "Classify 10 metal items.",
    type: "category",
    category: "metal",
    threshold: 10,
  },
];
