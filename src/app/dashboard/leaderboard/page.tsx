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
          // Scaled down for 320px support
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
      {/* Header - Narrow Layout Fix */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-3 xs:px-4 py-6 md:py-10">
          <header className="flex flex-col gap-4 items-center md:flex-col md:justify-between">
            <div className="text-center ">
              <h1 className="text-xl xs:text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Eco
                <span className="ml-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent italic">
                  Heroes.
                </span>
              </h1>
              <p className="text-slate-500 text-[10px] xs:text-xs md:text-sm mt-1.5">
                Making a global impact.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full max-w-[320px] md:max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs xs:text-sm transition-all"
                />
              </div>
              <button
                onClick={() =>
                  setSortBy((prev) => (prev === "score" ? "scans" : "score"))
                }
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </header>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-2 xs:px-4 mt-4 md:-mt-6">
        {/* Winning Stage - Ultra-Responsive Grid */}
        {!isSearching && topThree.length === 3 && (
          <div className="flex flex-row items-end justify-center gap-1.5 xs:gap-2 md:gap-4 mb-10 overflow-visible">
            {topThree.map((p, idx) => {
              const isFirst = p.rank === 1;
              const isSecond = p.rank === 2;
              const isThird = p.rank === 3;
              const trophyColor = isFirst
                ? "text-yellow-500"
                : isSecond
                  ? "text-slate-400"
                  : "text-orange-600";
              const borderColor = isFirst
                ? "border-yellow-200"
                : isSecond
                  ? "border-slate-200"
                  : "border-orange-200";

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "flex-1 flex flex-col items-center group min-w-0 max-w-[100px] xs:max-w-[140px] md:max-w-[240px]",
                    isFirst ? "z-10" : "opacity-95",
                  )}
                >
                  <div
                    className={cn(
                      "w-full bg-white rounded-xl md:rounded-[2rem] p-2 xs:p-3 md:p-6 shadow-lg border-2 flex flex-col items-center relative transition-transform",
                      borderColor,
                      isFirst ? "pb-6 md:pb-12 pt-4" : "pb-3 md:pb-6 pt-2",
                    )}
                  >
                    <div
                      className={cn(
                        "p-1 md:p-2 rounded-lg mb-2",
                        isFirst
                          ? "bg-yellow-50"
                          : isSecond
                            ? "bg-slate-50"
                            : "bg-orange-50",
                      )}
                    >
                      <Trophy
                        className={cn("w-3.5 h-3.5 md:w-6 md:h-6", trophyColor)}
                      />
                    </div>

                    <Avatar
                      seed={p.name}
                      large={isFirst}
                      className={isFirst ? "ring-2 ring-yellow-400" : ""}
                    />

                    <div className="mt-2 text-center w-full">
                      <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">
                        Rank {p.rank}
                      </p>
                      <h3 className="font-bold text-slate-900 text-[9px] xs:text-[11px] md:text-sm truncate px-1">
                        {p.isCurrentUser ? "You" : p.name}
                      </h3>
                      <p className="mt-0.5 text-xs md:text-xl font-black text-slate-900 leading-tight">
                        {p.ecoScore.toLocaleString()}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "absolute -bottom-1.5 left-2 right-2 h-1 rounded-full shadow-sm",
                        isFirst
                          ? "bg-yellow-400"
                          : isSecond
                            ? "bg-slate-300"
                            : "bg-orange-600",
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Table - Optimized for Narrow Viewports */}
        <section className="bg-white rounded-xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="pl-3 pr-1 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-8 text-center">
                  #
                </th>
                <th className="px-1 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Hero
                </th>
                <th className="px-1 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Points
                </th>
                <th className="pl-1 pr-3 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center w-10">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableList.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors",
                    row.isCurrentUser && "bg-emerald-50/50",
                  )}
                >
                  <td className="pl-3 pr-1 py-3 text-center">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{row.rank}
                    </span>
                  </td>
                  <td className="px-1 py-3">
                    <div className="flex items-center gap-1.5 xs:gap-2.5">
                      <Avatar seed={row.name} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] xs:text-sm truncate leading-none">
                          {row.name}
                        </p>
                        <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                          {row.totalScans} scans
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-1 py-3 text-right">
                    <span className="font-mono font-black text-slate-900 text-xs xs:text-sm whitespace-nowrap">
                      {row.ecoScore.toLocaleString()}
                    </span>
                  </td>
                  <td className="pl-1 pr-3 py-3 text-center shrink-0">
                    <TrendIcon trend={row.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Floating Bar - Width fix for 320px */}
      <AnimatePresence>
        {currentUser && currentUser.rank > 3 && !isSearching && (
          <motion.div
            initial={{ y: 50, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 50, x: "-50%", opacity: 0 }}
            className="fixed bottom-4 left-1/2 w-[95%] max-w-[340px] z-50"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 shadow-2xl flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white shrink-0 text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate leading-none">
                    {currentUser.name}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold mt-1">
                    Rank #{currentUser.rank}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-sm font-black text-emerald-400 leading-none">
                  {currentUser.ecoScore.toLocaleString()}
                </div>
                <div className="text-[8px] font-mono text-slate-500 uppercase">
                  Points
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
