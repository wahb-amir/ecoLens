"use client";

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import {
  Trophy,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  UserX,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

// --- Components ---

const Avatar = memo(
  ({
    seed,
    large = false,
    className,
  }: {
    seed: string | number;
    large?: boolean;
    className?: string;
  }) => {
    const label =
      typeof seed === "string" ? seed.charAt(0).toUpperCase() : String(seed);
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full shadow-inner font-bold shrink-0 transition-all",
          large
            ? "h-12 w-12 xs:h-14 xs:w-14 md:h-20 md:w-20 text-base md:text-xl"
            : "h-8 w-8 xs:h-9 xs:w-9 text-[10px] xs:text-xs",
          "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-2 border-white",
          className,
        )}
      >
        {label}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up")
    return (
      <TrendingUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-emerald-500" />
    );
  if (trend === "down")
    return <TrendingDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-rose-500" />;
  return <Minus className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-slate-300" />;
};

const LeaderboardSkeleton = () => {
  const ShimmerLine = ({ className }: { className?: string }) => (
    <div className={cn("relative overflow-hidden bg-slate-200", className)}>
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
    </div>
  );

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-row items-end justify-center gap-2 md:gap-4 mb-10 h-48 md:h-72">
        {[2, 1, 3].map((rank) => (
          <div
            key={rank}
            className={cn(
              "flex-1 bg-white rounded-xl md:rounded-[2rem] border border-slate-100 flex flex-col items-center p-4 shadow-sm",
              rank === 1 ? "h-full" : rank === 2 ? "h-[85%]" : "h-[75%]",
            )}
          >
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-100 mb-4" />
            <ShimmerLine className="w-12 md:w-20 h-3 md:h-4 rounded-full mb-2" />
            <ShimmerLine className="w-8 md:w-12 h-2 md:h-3 rounded-full opacity-50" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl md:rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border-b border-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100" />
              <div className="space-y-2">
                <ShimmerLine className="w-24 h-3 rounded-full" />
                <ShimmerLine className="w-16 h-2 rounded-full opacity-50" />
              </div>
            </div>
            <ShimmerLine className="w-12 h-4 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Page ---

export default function EcoLeaderboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    leaderboard = [],
    currentUser,
    isLoading,
    isError,
  } = useLeaderboard(user?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "scans" | "rank">("score");

  useEffect(() => {
    if (!user && !authLoading) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(searchTerm.trim()), 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase();
    let list = [...leaderboard];
    if (q) list = list.filter((u) => u.name?.toLowerCase().includes(q));
    list.sort((a, b) =>
      sortBy === "score"
        ? b.ecoScore - a.ecoScore
        : sortBy === "scans"
          ? b.totalScans - a.totalScans
          : a.rank - b.rank,
    );
    return list;
  }, [leaderboard, debounced, sortBy]);

  const isSearching = debounced.length > 0;
  const topThree = useMemo(() => {
    if (isSearching || filtered.length < 3) return [];
    const top = filtered.slice(0, 3);
    return [top[1], top[0], top[2]];
  }, [filtered, isSearching]);

  const tableList = !isSearching ? filtered.slice(3) : filtered;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <UserX className="h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Unavailable</h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-full text-sm"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 overflow-x-hidden">
      {/* Top Progress Bar - Perfect for Video Intro */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-[100] shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        )}
      </AnimatePresence>

      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-3 xs:px-4 py-6 md:py-10">
          <header className="flex flex-col gap-4 items-center">
            <div className="text-center">
              <h1 className="text-xl xs:text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Eco
                <span className="ml-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent italic">
                  Heroes.
                </span>
              </h1>
              <p className="text-slate-500 text-[10px] xs:text-xs md:text-sm mt-1.5 font-medium tracking-wide">
                MAKING A GLOBAL IMPACT.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full max-w-[320px] md:max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search environmentalists..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs xs:text-sm transition-all shadow-inner"
                />
              </div>
              <button
                onClick={() =>
                  setSortBy((prev) => (prev === "score" ? "scans" : "score"))
                }
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-sm"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </header>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-2 xs:px-4 mt-4 md:-mt-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LeaderboardSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Podium Section */}
              {!isSearching && topThree.length === 3 && (
                <div className="flex flex-row items-end justify-center gap-1.5 xs:gap-2 md:gap-4 mb-10 overflow-visible">
                  {topThree.map((p, idx) => {
                    const isFirst = p.rank === 1;
                    const trophyColor = isFirst
                      ? "text-yellow-500"
                      : p.rank === 2
                        ? "text-slate-400"
                        : "text-orange-600";
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.15 }}
                        className={cn(
                          "flex-1 flex flex-col items-center group max-w-[240px]",
                          isFirst ? "z-10" : "opacity-95",
                        )}
                      >
                        <div
                          className={cn(
                            "w-full bg-white rounded-xl md:rounded-[2.5rem] p-3 md:p-6 shadow-xl border-2 flex flex-col items-center relative transition-all hover:translate-y-[-4px]",
                            isFirst
                              ? "border-yellow-200 pb-12 pt-4 shadow-yellow-500/10"
                              : "border-slate-100 pb-6 pt-2 shadow-slate-500/5",
                          )}
                        >
                          <div
                            className={cn(
                              "p-1.5 md:p-2 rounded-xl mb-3",
                              isFirst ? "bg-yellow-50" : "bg-slate-50",
                            )}
                          >
                            <Trophy
                              className={cn(
                                "w-4 h-4 md:w-6 md:h-6",
                                trophyColor,
                              )}
                            />
                          </div>
                          <Avatar
                            seed={p.name}
                            large={isFirst}
                            className={
                              isFirst ? "ring-4 ring-yellow-400/20" : ""
                            }
                          />
                          <div className="mt-3 text-center w-full">
                            <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                              Rank {p.rank}
                            </p>
                            <h3 className="font-bold text-slate-900 text-xs md:text-sm truncate">
                              {p.isCurrentUser ? "You" : p.name}
                            </h3>
                            <p className="mt-1 text-sm md:text-2xl font-black text-slate-900 tracking-tight">
                              {p.ecoScore.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Table Section */}
              <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="pl-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-12">
                        #
                      </th>
                      <th className="px-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Hero
                      </th>
                      <th className="px-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">
                        Points
                      </th>
                      <th className="pr-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center w-16">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tableList.map((row) => (
                      <tr
                        key={row.id}
                        className={cn(
                          "transition-colors hover:bg-slate-50/80",
                          row.isCurrentUser && "bg-emerald-50/40",
                        )}
                      >
                        <td className="pl-6 py-4">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{row.rank}
                          </span>
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar seed={row.name} />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-sm truncate">
                                {row.name}
                              </p>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                {row.totalScans} scans
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-right">
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {row.ecoScore.toLocaleString()}
                          </span>
                        </td>
                        <td className="pr-6 py-4 text-center">
                          <TrendIcon trend={row.trend} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bar - Premium Glass HUD */}
      <AnimatePresence>
        {currentUser && currentUser.rank > 3 && !isSearching && !isLoading && (
          <motion.div
            initial={{ y: 120, x: "-50%", opacity: 0, scale: 0.9 }}
            animate={{ y: 0, x: "-50%", opacity: 1, scale: 1 }}
            exit={{ y: 120, x: "-50%", opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 100,
              delay: 0.5,
            }}
            whileHover={{ scale: 1.02 }}
            className="fixed bottom-8 left-1/2 w-[94%] max-w-[420px] z-50 cursor-pointer"
          >
            <div className="group bg-slate-900/95 backdrop-blur-2xl text-white rounded-[2.5rem] p-3 pl-5 pr-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_rgba(16,185,129,0.1)] flex items-center justify-between border border-white/10 relative overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 5,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-1/2 -skew-x-12"
              />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <Avatar
                    seed={currentUser.name}
                    className="h-11 w-11 border-2 border-emerald-500/40"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-slate-900 shadow-lg"
                  >
                    <TrendIcon trend={currentUser.trend} />
                  </motion.div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black truncate uppercase italic tracking-tight">
                      {currentUser.name}
                    </p>
                    <span className="bg-emerald-500 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      YOU
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                    Rank <span className="text-white">#{currentUser.rank}</span>{" "}
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />{" "}
                    <span className="text-emerald-400/90">
                      {currentUser.totalScans} Scans
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 relative z-10">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white tabular-nums leading-none tracking-tighter">
                    {currentUser.ecoScore.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    Pts
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1 mt-1.5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                    Next Rank in{" "}
                    <span className="text-emerald-400">140 pts</span>
                  </p>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "72%" }}
                      transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
