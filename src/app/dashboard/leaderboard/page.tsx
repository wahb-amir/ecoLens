'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trophy, Search, TrendingUp, TrendingDown, Minus, UserX, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

// Small helper: trend icon
const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="w-5 h-5 text-emerald-500" aria-hidden />;
  if (trend === 'down') return <TrendingDown className="w-5 h-5 text-rose-500" aria-hidden />;
  return <Minus className="w-5 h-5 text-slate-300" aria-hidden />;
};

// Avatar generator fallback (letter avatar)
const Avatar = ({ seed, large = false }: { seed: string | number; large?: boolean }) => {
  const label = typeof seed === 'string' ? seed.charAt(0).toUpperCase() : String(seed);
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full shadow-md font-bold',
        large ? 'h-24 w-24 text-2xl' : 'h-10 w-10 text-sm',
        'bg-slate-100 text-slate-700'
      )}
      aria-hidden
    >
      {label}
    </div>
  );
};

export default function EcoLeaderboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { leaderboard = [], currentUser, isLoading, isError } = useLeaderboard(user?.id);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'scans' | 'rank'>('score');
  const debounceRef = useRef<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) router.replace('/login');
  }, [user, loading, router]);

  // Debounce search for nicer UX
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebounced(searchTerm.trim()), 200);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [searchTerm]);

  // Derived lists
  const filtered = useMemo(() => {
    const q = debounced.toLowerCase();
    let list = leaderboard.slice();
    if (q) list = list.filter(u => u.name?.toLowerCase().includes(q));

    // sort
    list.sort((a, b) => {
      if (sortBy === 'score') return b.ecoScore - a.ecoScore;
      if (sortBy === 'scans') return b.totalScans - a.totalScans;
      return a.rank - b.rank;
    });
    return list;
  }, [leaderboard, debounced, sortBy]);

  const isSearching = debounced.length > 0;
  const topThree = !isSearching ? filtered.slice(0, 3) : [];
  const tableList = !isSearching ? filtered.slice(3) : filtered;

  // Loading & error states
  if (isError) return (
    <div className="p-12 flex flex-col items-center justify-center h-[70vh]">
      <div className="bg-rose-50 p-4 rounded-full mb-4"><Minus className="h-8 w-8 text-rose-500" /></div>
      <h2 className="text-lg font-semibold text-slate-900">Connection Lost</h2>
      <p className="text-sm text-slate-500 mt-2">We couldn\'t fetch the leaderboard. Try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm shadow-sm"
      >Retry</button>
    </div>
  );

  if (loading || (isLoading && !leaderboard.length)) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
      <div className="space-y-4 w-full max-w-4xl p-6">
        <div className="h-6 w-1/2 rounded-full bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm animate-pulse h-44" />
          ))}
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse h-60" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-transparent pb-40">
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Global Leaderboard</h1>
            <p className="mt-1 text-slate-500">Top contributors making an ecological impact.</p>
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
            <label htmlFor="search" className="sr-only">Search contributors</label>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                aria-label="Search contributors"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>

            <div className="ml-2 relative">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm"
                onClick={() => setSortBy(prev => prev === 'score' ? 'scans' : prev === 'scans' ? 'rank' : 'score')}
                aria-label="Toggle sort"
              >
                <span className="text-xs font-mono text-slate-600">Sort:</span>
                <span className="font-semibold text-sm">{sortBy === 'score' ? 'Points' : sortBy === 'scans' ? 'Scans' : 'Rank'}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Podium */}
        {!isSearching && topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 items-end">
            {topThree.map((p, idx) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={cn('relative bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center', idx === 0 ? 'md:-translate-y-6 border-b-[10px] border-emerald-400' : 'border-b-4 border-slate-100')}
                aria-label={`Top ${idx + 1} ${p.name}`}
              >
                {/* medal */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center justify-center rounded-full p-3 bg-white shadow-md border border-slate-100">
                    <Trophy className={cn('h-6 w-6', idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-400' : 'text-amber-600/70')} />
                  </div>
                </div>

                <div className="mt-6 mb-2">
                  <Avatar seed={p.name || p.id} large />
                </div>

                <h3 className="text-lg font-bold text-slate-900">{p.isCurrentUser ? 'You' : p.name}</h3>
                <p className="text-emerald-600 font-mono text-2xl font-extrabold mt-2">{p.ecoScore.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">{p.totalScans.toLocaleString()} scans</p>
              </motion.article>
            ))}
          </div>
        )}

        {/* Table / Results */}
        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {filtered.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/60 text-xs font-mono text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Contributor</th>
                    <th className="px-6 py-4 text-right">Points</th>
                    <th className="px-6 py-4 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {tableList.map((row) => (
                      <motion.tr
                        key={row.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className={cn('group hover:bg-slate-50/70 transition-colors', row.isCurrentUser && 'bg-emerald-50/60')}
                      >
                        <td className="px-6 py-4 font-mono text-slate-400">#{row.rank}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={cn('flex items-center justify-center rounded-xl', row.isCurrentUser ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700', 'h-10 w-10 font-bold')}> 
                              {row.avatar || (row.name && row.name.charAt(0))}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">{row.name}</span>
                                {row.isCurrentUser && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">You</span>}
                              </div>
                              <div className="text-xs text-slate-400">{row.totalScans.toLocaleString()} scans</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-extrabold text-slate-900">{row.ecoScore.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center"><TrendIcon trend={row.trend} /></td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <UserX className="mx-auto h-12 w-12 text-slate-200" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No results</h3>
              <p className="text-slate-500 mt-2">We couldn\'t find any contributors matching "{debounced}"</p>
              <button onClick={() => setSearchTerm('')} className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-semibold">Clear search</button>
            </div>
          )}
        </section>
      </div>

      {/* Sticky current user quickbar: visible for users outside top 3 */}
      <AnimatePresence>
        {currentUser && currentUser.rank > 3 && !isSearching && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl z-50"
          >
            <div className="bg-slate-900/95 backdrop-blur rounded-2xl p-4 pr-6 flex items-center justify-between border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-white">{currentUser.avatar || currentUser.name.charAt(0)}</div>
                <div className="text-white font-semibold">{currentUser.name} <span className="text-xs text-slate-300">(You)</span></div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-extrabold text-emerald-400">{currentUser.ecoScore.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Rank #{currentUser.rank}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
