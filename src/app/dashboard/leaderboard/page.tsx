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
  X,
  Medal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

// Performance: Memoize Avatar to prevent re-renders during list filtering
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
          "flex items-center justify-center rounded-full shadow-inner font-bold shrink-0",
          large
            ? "h-16 w-16 md:h-24 md:w-24 text-xl md:text-2xl"
            : "h-10 w-10 text-sm",
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
    return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (trend === "down")
    return <TrendingDown className="w-4 h-4 text-rose-500" />;
  return <Minus className="w-4 h-4 text-slate-300" />;
};

export default function EcoLeaderboard() {
  const { user, loading } = useAuth();
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
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user && !loading) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(
      () => setDebounced(searchTerm.trim()),
      200,
    );
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase();
    let list = [...leaderboard];
    if (q) list = list.filter((u) => u.name?.toLowerCase().includes(q));

    list.sort((a, b) => {
      if (sortBy === "score") return b.ecoScore - a.ecoScore;
      if (sortBy === "scans") return b.totalScans - a.totalScans;
      return a.rank - b.rank;
    });
    return list;
  }, [leaderboard, debounced, sortBy]);

  const isSearching = debounced.length > 0;
  // Reorder for visual podium: [2nd, 1st, 3rd]
  const topThree = useMemo(() => {
    if (isSearching || filtered.length < 3) return [];
    const top = filtered.slice(0, 3);
    return [top[1], top[0], top[2]];
  }, [filtered, isSearching]);

  const tableList = !isSearching ? filtered.slice(3) : filtered;

  if (isError)
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-rose-50 p-4 rounded-full mb-4">
          <UserX className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Failed to load rankings
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-full font-medium"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Header - Fixed responsiveness */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-3 h-3" /> Live Rankings
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                Eco Heroes
              </h1>
              <p className="text-slate-500 max-w-md">
                The top contributors fighting for a greener planet through
                consistent action.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find a contributor..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <button
                onClick={() =>
                  setSortBy((prev) => (prev === "score" ? "scans" : "score"))
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs text-slate-400 uppercase">
                  Sort by
                </span>
                {sortBy === "score" ? "Points" : "Scans"}
              </button>
            </div>
          </header>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 -mt-8">
        {/* Winning Stage (Podium) */}
        {!isSearching && topThree.length === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 items-end mb-12">
            {topThree.map((p, idx) => {
              const isFirst = p.rank === 1;
              const isSecond = p.rank === 2;
              const isThird = p.rank === 3;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "relative flex flex-col items-center group",
                    isFirst
                      ? "z-20 order-1 md:order-2"
                      : isSecond
                        ? "order-2 md:order-1"
                        : "order-3",
                  )}
                >
                  {/* Podium Base */}
                  <div
                    className={cn(
                      "w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center transition-transform group-hover:scale-[1.02]",
                      isFirst
                        ? "md:h-80 border-b-8 border-b-amber-400 pt-12"
                        : "md:h-64 mt-4 border-b-8",
                      isSecond
                        ? "border-b-slate-300"
                        : isThird
                          ? "border-b-amber-700/50"
                          : "",
                    )}
                  >
                    {/* Trophy Icon */}
                    <div
                      className={cn(
                        "absolute -top-6 p-4 rounded-2xl shadow-lg",
                        isFirst
                          ? "bg-amber-400 text-white animate-bounce-slow"
                          : isSecond
                            ? "bg-slate-300 text-slate-600"
                            : "bg-amber-700 text-amber-50",
                      )}
                    >
                      <Trophy className={isFirst ? "w-8 h-8" : "w-6 h-6"} />
                    </div>

                    <Avatar
                      seed={p.name}
                      large={isFirst}
                      className={isFirst ? "ring-4 ring-amber-100" : ""}
                    />

                    <div className="mt-4 text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Rank {p.rank}
                      </p>
                      <h3 className="font-bold text-slate-900 truncate max-w-[150px]">
                        {p.isCurrentUser ? "You" : p.name}
                      </h3>
                      <div className="mt-2 text-2xl font-black text-slate-900">
                        {p.ecoScore.toLocaleString()}
                      </div>
                      <p className="text-xs text-emerald-600 font-medium">
                        {p.totalScans} total scans
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* List View */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Rank
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Contributor
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Points
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {tableList.map((row) => (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "hover:bg-slate-50/80 transition-colors group",
                        row.isCurrentUser && "bg-emerald-50/40",
                      )}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                          #{row.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar seed={row.name} />
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-2">
                              {row.name}
                              {row.isCurrentUser && (
                                <span className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-full">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              {row.totalScans} scans
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-black text-slate-900">
                          {row.ecoScore.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <TrendIcon trend={row.trend} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Improved Sticky Quickbar */}
      <AnimatePresence>
        {currentUser && currentUser.rank > 3 && !isSearching && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    Current Position
                  </p>
                </div>
              </div>
              <div className="text-right px-2">
                <div className="text-xl font-black text-emerald-400">
                  #{currentUser.rank}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {currentUser.ecoScore.toLocaleString()} PTS
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
