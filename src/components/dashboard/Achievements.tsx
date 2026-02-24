"use client";

import React, { useMemo, useState } from "react";
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
  ShieldCheck,
  Zap,
  Trophy,
  Target,
  ChevronDown,
  Activity,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Balancer from "react-wrap-balancer";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementsProps {
  stats?: EcoStats | null;
}

const AchievementCard = ({
  ach,
  stats,
  index,
  isExpanded,
  onToggle,
}: {
  ach: any;
  stats?: EcoStats | null;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const unlocked = useMemo(() => {
    if (stats?.unlockedAchievements?.includes?.(ach.id)) return true;
    if (stats && typeof ach.isUnlocked === "function") {
      try {
        return Boolean(ach.isUnlocked(stats));
      } catch {
        return false;
      }
    }
    return false;
  }, [stats?.unlockedAchievements, ach]);

  const progress = useMemo(() => {
    if (!stats) return { current: 0, target: 0, percentage: 0 };
    try {
      const p = getAchievementProgress(ach, stats);
      return {
        current: Number(p?.current ?? 0),
        target: Number(p?.target ?? 0),
        percentage: Math.max(0, Math.min(100, p?.percentage ?? 0)),
      };
    } catch {
      return { current: 0, target: 0, percentage: 0 };
    }
  }, [ach, stats]);

  const Icon = ach.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      <Card
        onClick={onToggle}
        className={cn(
          "group relative transition-all duration-300 border border-slate-200 shadow-sm cursor-pointer overflow-hidden",
          unlocked ? "bg-white ring-1 ring-emerald-500/10" : "bg-slate-50/50",
          isExpanded && "ring-2 ring-emerald-500 shadow-md",
        )}
      >
        <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4 pt-5">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl border transition-all duration-500",
              unlocked
                ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                : "bg-white border-slate-200 text-slate-400",
            )}
          >
            <Icon className={cn("w-6 h-6", unlocked && "animate-pulse")} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                #{String(ach.id).slice(-3)}
              </span>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-slate-300" />
              </motion.div>
            </div>
            <CardTitle
              className={cn(
                "text-sm font-bold truncate",
                unlocked ? "text-slate-900" : "text-slate-500",
              )}
            >
              {ach.name}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pb-5">
          {!unlocked ? (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold font-mono">
                <span className="text-slate-400">PROGRESS</span>
                <span className="text-emerald-600">
                  {Math.round(progress.percentage)}%
                </span>
              </div>
              <Progress
                value={progress.percentage}
                className="h-1 bg-slate-200"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Authenticated
              </span>
            </div>
          )}

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Mission Briefing
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        Status
                      </p>
                      <p className="text-[11px] font-bold text-slate-700">
                        {unlocked ? "Verified" : "Active"}
                      </p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        Impact
                      </p>
                      <p className="text-[11px] font-bold text-emerald-600">
                        +{ach.points || 50} XP
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function Achievements({ stats }: AchievementsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1500);
  };

  const filteredAchievements = useMemo(() => {
    return achievements.filter((ach) => {
      const isUnlocked = stats?.unlockedAchievements?.includes(ach.id);
      if (filter === "unlocked") return isUnlocked;
      if (filter === "locked") return !isUnlocked;
      return true;
    });
  }, [stats, filter]);

  return (
    <div className="bg-slate-50/30 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Protocol Active
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Eco Badges
            </h1>
            <p className="text-slate-500 text-sm max-w-md font-medium">
              Track your environmental milestones and protocol achievements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs - GREAT FOR VIDEO FILLER */}
            <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              {(["all", "unlocked", "locked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                    filter === f
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-600",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Scan Button - GREAT FOR VIDEO FILLER */}
            <button
              onClick={handleScan}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 text-slate-600",
                  isScanning && "animate-spin",
                )}
              />
            </button>
          </div>
        </header>

        {/* Global Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Global Rank
              </p>
              <p className="text-xl font-black text-slate-900">
                Elite Guardian
              </p>
            </div>
          </div>
          {/* Add more stats here to fill space if needed */}
        </div>

        {/* Achievements Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((ach, index) => (
              <AchievementCard
                key={ach.id}
                ach={ach}
                stats={stats}
                index={index}
                isExpanded={expandedId === ach.id}
                onToggle={() =>
                  setExpandedId(expandedId === ach.id ? null : ach.id)
                }
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
