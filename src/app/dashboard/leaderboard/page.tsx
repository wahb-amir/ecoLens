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
          "flex items-center justify-center rounded-full shadow-inner font-bold shrink-0 transition-transform duration-500",
          large ? "h-16 w-16 md:h-20 md:w-20 text-xl" : "h-10 w-10 text-sm",
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

  // Podium Order: 2nd, 1st, 3rd
  const topThree = useMemo(() => {
    if (isSearching || filtered.length < 3) return [];
    const top = filtered.slice(0, 3);
    return [top[1], top[0], top[2]];
  }, [filtered, isSearching]);

  const tableList = !isSearching ? filtered.slice(3) : filtered;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <UserX className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Connection error</h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-slate-900 text-white px-8 py-2 rounded-full font-medium"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Header Container */}
      <div className="bg-white border-b border-slate-100 w-full">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <header className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider mx-auto md:mx-0">
                <Trophy className="w-3 h-3" /> Live Standings
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                Eco Heroes
              </h1>
              <p className="text-slate-500 text-sm md:text-base max-w-sm">
                The world's top contributors making a real impact.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all"
                />
              </div>
              <button
                onClick={() =>
                  setSortBy((prev) => (prev === "score" ? "scans" : "score"))
                }
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 text-sm hover:bg-slate-50 transition-colors"
              >
                Sort: {sortBy === "score" ? "Points" : "Scans"}
              </button>
            </div>
          </header>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-40">
        {/* Podium Section - Perfectly Centered */}
        {!isSearching && topThree.length === 3 && (
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-4 md:gap-2 mt-12 mb-16">
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
                    "w-full max-w-[280px] md:max-w-none md:flex-1 relative group",
                    isFirst
                      ? "z-10 order-1 md:order-2"
                      : isSecond
                        ? "order-2 md:order-1"
                        : "order-3",
                  )}
                >
                  <div
                    className={cn(
                      "bg-white rounded-[2rem] p-5 shadow-xl border border-slate-100 flex flex-col items-center relative transition-all duration-300 group-hover:translate-y-[-4px]",
                      isFirst
                        ? "md:min-h-[320px] pt-10 ring-2 ring-emerald-100"
                        : "md:min-h-[260px] md:opacity-90",
                    )}
                  >
                    {/* Rank Badge / Trophy */}
                    <div
                      className={cn(
                        "absolute -top-5 p-3 rounded-xl shadow-lg transition-transform group-hover:scale-110",
                        isFirst
                          ? "bg-amber-400 text-amber-900"
                          : isSecond
                            ? "bg-slate-300 text-slate-700"
                            : "bg-orange-700 text-orange-50",
                      )}
                    >
                      <Trophy className={isFirst ? "w-6 h-6" : "w-5 h-5"} />
                    </div>

                    <Avatar
                      seed={p.name}
                      large={isFirst}
                      className={isFirst ? "ring-4 ring-amber-400/20" : ""}
                    />

                    <div className="mt-4 text-center w-full">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Rank {p.rank}
                      </span>
                      <h3 className="font-bold text-slate-900 truncate px-2">
                        {p.isCurrentUser ? "You" : p.name}
                      </h3>
                      <div className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
                        {p.ecoScore.toLocaleString()}
                      </div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                        {p.totalScans} Scans
                      </p>
                    </div>

                    {/* Visual Stage Footer */}
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 h-2 rounded-b-[2rem]",
                        isFirst
                          ? "bg-amber-400"
                          : isSecond
                            ? "bg-slate-300"
                            : "bg-orange-700",
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* List View Container */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    #
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Hero
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Points
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
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
                        row.isCurrentUser && "bg-emerald-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-400">
                          #{row.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar seed={row.name} />
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-2 leading-none">
                              {row.name}
                              {row.isCurrentUser && (
                                <span className="bg-emerald-500 text-[8px] text-white px-1.5 py-0.5 rounded-md font-black">
                                  YOU
                                </span>
                              )}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {row.totalScans} scans
                            </span>
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

      {/* Perfectly Centered Sticky Quickbar */}
      <AnimatePresence>
        {currentUser && currentUser.rank > 3 && !isSearching && (
          <motion.div
            initial={{ y: 100, x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            exit={{ y: 100, x: "-50%" }}
            className="fixed bottom-6 left-1/2 w-[calc(100%-2rem)] max-w-lg z-50"
          >
            <div className="bg-slate-900 text-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black leading-none">
                    {currentUser.name}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mt-1">
                    Global Rank #{currentUser.rank}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400 leading-none">
                  {currentUser.ecoScore.toLocaleString()}
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase">
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
