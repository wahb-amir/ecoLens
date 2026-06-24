"use client";

import { Achievements } from "@/components/dashboard/Achievements";
import { useUserStats } from "@/lib/use-user-stats";
export default function AchievementsPage() {
  const { stats } = useUserStats();
  return <Achievements stats={stats} />;
}
