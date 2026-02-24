'use client';

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import {
  Trophy,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  UserX,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

// Memoized Avatar for performance
const Avatar = memo(({ seed, large = false, className }: { seed: string | number; large?: boolean; className?: string }) => {
  const label = typeof seed === "string" ? seed.charAt(0).toUpperCase() : String(seed);
  return (
    <div className={cn(
      "flex items-center justify-center rounded-full shadow-inner font-bold shrink-0 transition-all",
      large ? "h-14 w-14 md:h-20 md:w-20 text-lg md:text-xl" : "h-9 w-9 text-xs",
      "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-2 border-white",
      className
    )}>
      {label}
    </div>
  );
});
Avatar.displayName = "Avatar";

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-300" />;
};

export default function EcoLeaderboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { leaderboard = [], currentUser, isLoading, isError } = useLeaderboard(user?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "scans" | "rank">("score");
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user && !loading) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebounced(searchTerm.trim()), 200);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
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
  
  // Podium Visual Order: 2nd, 1st, 3rd
  const topThree = useMemo(() => {
    if (isSearching || filtered.length < 3) return [];
    const top = filtered.slice(0, 3);
    return [top[1], top[0], top[2]];
  }, [filtered, isSearching]);

  const tableList = !isSearching ? filtered.slice(3) : filtered;

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <UserX className="h-10 w-10 text-rose-500 mb-3" />
      <h2 className="text-lg font-bold text-slate-900">Leaderboard Unavailable</h2>
      <button onClick={() => window.location.reload()} className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-40 overflow-x-hidden">
      {/* Header - Condensed for Mobile */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
          <header className="flex flex-col gap-4 items-center md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Eco Heroes</h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1">Top contributors making an impact.</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all"
                />
              </div>
              <button
                onClick={() => setSortBy(prev => prev === "score" ? "scans" : "score")}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                title="Sort leaderboard"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </header>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 -mt-6">
        {/* Winning Stage - Refined Visuals */}
        {!isSearching && topThree.length === 3 && (
          <div className="flex flex-row items-end justify-center gap-2 md:gap-4 mb-12 mt-4 overflow-visible">
            {topThree.map((p, idx) => {
              const isFirst = p.rank === 1;
              const isSecond = p.rank === 2;
              const isThird = p.rank === 3;

              // Colors & Heights
              const trophyColor = isFirst ? "text-yellow-500" : isSecond ? "text-slate-400" : "text-orange-600";
              const bgColor = isFirst ? "bg-yellow-50" : isSecond ? "bg-slate-50" : "bg-orange-50";
              const borderColor = isFirst ? "border-yellow-200" : isSecond ? "border-slate-200" : "border-orange-200";

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "flex-1 flex flex-col items-center group min-w-0 max-w-[160px] md:max-w-[240px]",
                    isFirst ? "z-10" : "opacity-95"
                  )}
                >
                  <div className={cn(
                    "w-full bg-white rounded-2xl md:rounded-[2rem] p-3 md:p-6 shadow-lg border-2 flex flex-col items-center relative transition-transform group-hover:scale-[1.02]",
                    borderColor,
                    isFirst ? "pb-8 md:pb-12" : "pb-4 md:pb-6"
                  )}>
                    <div className={cn("p-1.5 md:p-2 rounded-lg md:rounded-xl mb-3", bgColor)}>
                      <Trophy className={cn("w-4 h-4 md:w-6 md:h-6", trophyColor)} />
                    </div>

                    <Avatar seed={p.name} large={isFirst} className={isFirst ? "ring-2 ring-yellow-400" : ""} />
                    
                    <div className="mt-3 text-center w-full overflow-hidden">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">Rank {p.rank}</p>
                      <h3 className="font-bold text-slate-900 text-xs md:text-sm truncate leading-tight">
                        {p.isCurrentUser ? "You" : p.name}
                      </h3>
                      <p className="mt-1 text-sm md:text-xl font-black text-slate-900">{p.ecoScore.toLocaleString()}</p>
                    </div>

                    {/* Literal Podium Step */}
                    <div className={cn(
                      "absolute -bottom-2 left-4 right-4 h-1.5 rounded-full shadow-sm",
                      isFirst ? "bg-yellow-400" : isSecond ? "bg-slate-300" : "bg-orange-600"
                    )} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Simplified Table for Mobile */}
        <section className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="pl-4 pr-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-10 text-center">#</th>
                <th className="px-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hero</th>
                <th className="px-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Points</th>
                <th className="pl-2 pr-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-12">Trend</th>
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
                      row.isCurrentUser && "bg-emerald-50/50"
                    )}
                  >
                    <td className="pl-4 pr-2 py-3 text-center">
                      <span className="text-xs font-mono font-bold text-slate-400">#{row.rank}</span>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar seed={row.name} />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate leading-none">
                            {row.name}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">{row.totalScans} scans</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span className="font-mono font-black text-slate-900 text-sm">{row.ecoScore.toLocaleString()}</span>
                    </td>
                    <td className="pl-2 pr-4 py-3 text-center">
                      <TrendIcon trend={row.trend} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </section>
      </main>

      {/* Optimized Floating Quickbar */}
      <AnimatePresence>
        {currentUser && currentUser.rank > 3 && !isSearching && (
          <motion.div
            initial={{ y: 50, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 50, x: "-50%", opacity: 0 }}
            className="fixed bottom-6 left-1/2 w-[92%] max-w-sm z-50"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{currentUser.name}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Rank #{currentUser.rank}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="text-base font-black text-emerald-400 leading-none">{currentUser.ecoScore.toLocaleString()}</div>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Points</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}