'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { achievements, getAchievementProgress } from '@/lib/achievements';
import type { EcoStats } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, ShieldCheck, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Balancer from 'react-wrap-balancer';
import { motion } from 'framer-motion';

interface AchievementsProps {
  stats: EcoStats;
}

export function Achievements({ stats }: AchievementsProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Enhanced Header with Telemetry vibe */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3 h-3 text-emerald-500 fill-current" />
           
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Mission Badges</h1>
          <p className="text-slate-500 max-w-xl mt-2 font-medium text-lg">
            <Balancer>
              Your environmental protocols are being logged. Unlock high-level badges by maintaining consistent waste classification.
            </Balancer>
          </p>
        </div>
      </div>

      {/* 2. Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach, index) => {
          const unlocked = ach.isUnlocked(stats);
          const progress = getAchievementProgress(ach, stats);
          const Icon = ach.icon;
          
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "group relative flex flex-col h-full transition-all duration-500 border-2 overflow-hidden",
                unlocked 
                  ? "border-emerald-500/20 bg-emerald-50/30 shadow-md shadow-emerald-500/5" 
                  : "border-slate-100 bg-white grayscale-[0.8] opacity-80 hover:grayscale-0 hover:opacity-100"
              )}>
                {/* Background ID Watermark */}
                <div className="absolute top-2 right-3 pointer-events-none text-[8px] font-mono font-bold text-slate-300 opacity-40 group-hover:opacity-100 transition-opacity">
                  ID: ACH_{String(ach.id).padStart(3, '0')}
                </div>

                <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
                  {/* Icon Container */}
                  <div className={cn(
                    'relative flex items-center justify-center p-4 rounded-xl w-16 h-16 transition-all duration-500',
                    unlocked 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 rotate-0' 
                      : 'bg-slate-100 text-slate-400 -rotate-3'
                  )}>
                    <Icon className="w-8 h-8" />
                    {unlocked && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full border-2 border-emerald-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <CardTitle className={cn(
                      "text-lg font-black tracking-tight transition-colors",
                      unlocked ? "text-emerald-900" : "text-slate-500"
                    )}>
                      {ach.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium leading-tight">
                      {ach.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow flex flex-col justify-end space-y-4">
                  {!unlocked && progress ? (
                    <div className="w-full space-y-2">
                      <div className="flex justify-between items-center font-mono text-[10px]">
                        <span className="font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Protocol_Pending
                        </span>
                        <span className="text-slate-900 font-bold">{progress.current} / {progress.target}</span>
                      </div>
                      <Progress 
                        value={progress.percentage} 
                        className="h-1.5 bg-slate-100" 
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest">Protocol_Verified</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600/60 uppercase">
                        SYNCED_OK
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}