"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { achievements, getAchievementProgress } from "@/lib/achievements";
import type { EcoStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Zap,
  Trophy,
  Target,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Balancer from "react-wrap-balancer";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementsProps {
  stats?: EcoStats | null;
}

/**
 * ACHIEVEMENT CARD COMPONENT
 * Extracted for performance and cleaner reconciliation.
 */
const AchievementCard = ({
  ach,
  stats,
  index,
}: {
  ach: any;
  stats?: EcoStats | null;
  index: number;
}) => {
  // Determine unlocked status safely:
  const unlocked = useMemo(() => {
    // First, prefer explicit unlockedAchievements list on stats (fast)
    if (stats?.unlockedAchievements?.includes?.(ach.id)) return true;

    // Only call the achievement's isUnlocked when stats exists (avoid throwing)
    if (stats && typeof ach.isUnlocked === "function") {
      try {
        return Boolean(ach.isUnlocked(stats));
      } catch {
        return false;
      }
    }

    return false;
  }, [stats?.unlockedAchievements, ach]);

  // Safe progress: only call getAchievementProgress when stats exist,
  // otherwise supply a safe default object so the UI can render without checks.
  const progress = useMemo(() => {
    if (!stats) {
      return { current: 0, target: 0, percentage: 0 };
    }
    try {
      const p = getAchievementProgress(ach, stats);
      // normalize shape and guard against NaN/undefined fields
      return {
        current: Number(p?.current ?? 0),
        target: Number(p?.target ?? 0),
        percentage:
          typeof p?.percentage === "number" && Number.isFinite(p.percentage)
            ? Math.max(0, Math.min(100, p.percentage))
            : 0,
      };
    } catch {
      return { current: 0, target: 0, percentage: 0 };
    }
  }, [ach, stats]);

  const Icon = ach.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.03,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={cn(
          "group relative flex flex-col h-full transition-all duration-500 border-0 overflow-hidden",
          unlocked
            ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-emerald-500/20"
            : "bg-slate-50/50 ring-1 ring-slate-200/60 opacity-90",
        )}
      >
        {/* Subtle Gradient Background for Unlocked Items */}
        {unlocked && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%)]" />
        )}

        <div className="absolute top-3 right-4 pointer-events-none select-none">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300 group-hover:text-slate-400 transition-colors">
            {String(ach.id).replace("ACH_", "").toUpperCase()}
          </span>
        </div>

        <CardHeader className="relative flex-row items-center gap-5 space-y-0 pb-4 pt-6">
          {/* Hexagonal / Rounded Icon Shield */}
          <div
            className={cn(
              "relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-700 shadow-inner",
              unlocked
                ? "bg-emerald-600 text-white rotate-0 scale-110"
                : "bg-slate-200 text-slate-400 -rotate-6 scale-100",
            )}
          >
            <Icon className={cn("w-7 h-7", unlocked && "animate-pulse-slow")} />

            {unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
              </motion.div>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <CardTitle
              className={cn(
                "text-base font-bold tracking-tight",
                unlocked ? "text-slate-900" : "text-slate-500",
              )}
            >
              {ach.name}
            </CardTitle>
            <CardDescription className="text-xs leading-snug font-medium text-slate-400 line-clamp-2">
              {ach.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="relative flex-grow flex flex-col justify-end pb-6">
          {!unlocked && progress && progress.target > 0 ? (
            <div className="w-full space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                    <Target className="w-3 h-3" /> Progress
                  </span>
                  <span className="text-xs font-black text-slate-700 font-mono">
                    {(progress.current ?? 0).toLocaleString()}{" "}
                    <span className="text-slate-300">/</span>{" "}
                    {(progress.target ?? 0).toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {Math.round(progress?.percentage ?? 0)}%
                </span>
              </div>
              <div className="relative h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress?.percentage ?? 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
              <div className="flex items-center gap-2 text-emerald-600/80">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Authenticated
                </span>
              </div>
              <div className="p-1 rounded bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function Achievements({ stats }: AchievementsProps) {
  // Memoize summary to prevent recalculations and guard when stats missing
  const summary = useMemo(() => {
    if (!stats) {
      return {
        unlocked: 0,
        total: achievements.length,
        percentage: 0,
      };
    }

    const unlockedCount = achievements.filter((a) => {
      // prefer explicit unlockedAchievements list, fallback to function if present
      if (stats.unlockedAchievements?.includes?.(a.id)) return true;
      if (typeof a.isUnlocked === "function") {
        try {
          return Boolean(a.isUnlocked(stats));
        } catch {
          return false;
        }
      }
      return false;
    }).length;

    return {
      unlocked: unlockedCount,
      total: achievements.length,
      percentage: (unlockedCount / achievements.length) * 100,
    };
  }, [stats]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 md:px-0 py-8">
      {/* 1. Executive Summary Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
              Achievement System Active
            </span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900 lg:text-6xl">
            Protocol Status
          </h1>
          <p className="text-slate-500 max-w-lg font-medium text-lg leading-relaxed">
            <Balancer>
              Your environmental impact is quantified through our global
              classification system. Unlock performance badges to increase your
              standing.
            </Balancer>
          </p>
        </div>

        {/* Global Progress Widget */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-w-[280px]">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">
                {summary.unlocked}/{summary.total}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Badges Unlocked
              </p>
            </div>
          </div>
          <Progress value={summary.percentage} className="h-2 bg-slate-100" />
          <p className="mt-3 text-[11px] text-center font-bold text-slate-400 italic font-mono">
            {summary.percentage === 100
              ? "PREMIUM_USER_VERIFIED"
              : "SYSTEM_UPGRADE_IN_PROGRESS"}
          </p>
        </div>
      </header>

      {/* 2. Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {achievements.map((ach, index) => (
            <AchievementCard
              key={ach.id}
              ach={ach}
              stats={stats}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}