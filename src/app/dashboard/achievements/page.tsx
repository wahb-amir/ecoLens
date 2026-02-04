'use client';

import { Achievements } from '@/components/dashboard/Achievements';
import { useEcoTracker } from '@/hooks/use-eco-tracker';

export default function AchievementsPage() {
    const { stats } = useEcoTracker();
    
    return <Achievements stats={stats} />
}
