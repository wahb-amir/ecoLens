'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Search, TrendingUp, TrendingDown, Minus, Flame, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-5 h-5 text-rose-500" />;
  return <Minus className="w-5 h-5 text-slate-300" />;
};

export default function EcoLeaderboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // FIX 1: Pass user?.id to the hook and destructure currentUser
  const { leaderboard, currentUser, isLoading, isError } = useLeaderboard(user?.id);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user && !loading) {
      router.replace("/login");
    }
  }, [user, router, loading]);

  if (isError) return (
    <div className="p-10 text-center flex flex-col items-center justify-center h-[70vh]">
      <div className="bg-rose-50 p-4 rounded-full mb-4">
        <Minus className="h-8 w-8 text-rose-500" />
      </div>
      <p className="text-slate-900 font-bold text-lg">Connection Lost</p>
      <p className="text-slate-500 text-sm mb-6">Unable to sync global rankings.</p>
      <button 
        onClick={() => window.location.reload()}
        className="text-sm bg-slate-900 hover:bg-slate-800 transition-colors text-white px-6 py-2.5 rounded-full font-medium"
      >
        Retry Connection
      </button>
    </div>
  );
  
  if (loading || (isLoading && !leaderboard.length)) return (
    <div className="flex h-screen items-center justify-center bg-slate-50/50">
      <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-slate-100" />
          <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
        <p className="text-sm font-mono font-medium text-emerald-600 animate-pulse tracking-widest uppercase">Syncing Uplink</p>
      </div>
    </div>
  );

  const filteredUsers = leaderboard.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredUsers.slice(0, 3);
  const restOfUsers = filteredUsers.slice(3);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-40">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-50/50 to-transparent -z-10" />

      <div className="max-w-5xl mx-auto p-6 space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200/50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Rankings
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              Global Leaderboard
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-lg">
              Recognizing our top contributors making a real-world ecological impact.
            </p>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search citizens..."
              className="bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 w-full md:w-80 shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-700 font-medium placeholder:font-normal"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Podium Section */}
        {searchTerm === '' && topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
            {topThree.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className={cn(
                  "relative bg-white p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center transition-all",
                  index === 0 
                    ? "h-[340px] md:-translate-y-8 border-b-[12px] border-emerald-500 shadow-emerald-500/10 z-10" 
                    : index === 1 
                      ? "h-[290px] border-b-8 border-blue-400 shadow-slate-200/50"
                      : "h-[270px] border-b-8 border-amber-400 shadow-slate-200/50",
                  item.isCurrentUser && "ring-4 ring-emerald-500/30 ring-offset-4"
                )}
              >
                {/* Rank Badge */}
                <div className={cn(
                  "absolute -top-6 h-14 w-14 bg-white rounded-2xl shadow-lg flex items-center justify-center font-black text-2xl border-2",
                  index === 0 ? "border-emerald-500 text-emerald-600" : index === 1 ? "border-blue-400 text-blue-500" : "border-amber-400 text-amber-500"
                )}>
                  {item.rank}
                </div>

                <div className="h-24 w-24 mt-2 rounded-full bg-slate-50 flex items-center justify-center text-3xl font-black text-slate-700 mb-5 border-4 border-white shadow-md relative group">
                  {item.avatar}
                  {index === 0 && <Award className="absolute -bottom-2 -right-2 h-8 w-8 text-emerald-500 drop-shadow-sm" />}
                </div>

                <h3 className="font-bold text-slate-900 text-xl truncate w-full text-center">
                  {item.isCurrentUser ? "You" : item.name}
                </h3>
                <p className={cn(
                  "font-mono text-3xl font-black mt-1",
                  index === 0 ? "text-emerald-600" : "text-slate-700"
                )}>
                  {item.ecoScore.toLocaleString()}
                </p>

                <div className="mt-auto flex gap-8 text-slate-400 w-full justify-center">
                  <div className="text-center flex flex-col items-center">
                    <p className="text-slate-900 font-bold text-sm">{item.totalScans}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Scans</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="text-center flex flex-col items-center">
                    <p className="text-orange-500 font-bold text-sm flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" /> {item.streak}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Streak</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No citizens found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
          </div>
        )}

        {/* List Table Section */}
        {restOfUsers.length > 0 && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr className="text-left text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-8 py-5 whitespace-nowrap">Rank</th>
                    <th className="px-8 py-5">Contributor</th>
                    <th className="px-8 py-5 text-right whitespace-nowrap">Eco Points</th>
                    <th className="px-8 py-5 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {restOfUsers.map((item) => (
                      <motion.tr 
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "group transition-all hover:bg-slate-50/80 relative",
                          item.isCurrentUser ? "bg-emerald-50/50" : ""
                        )}
                      >
                        {/* Current User Highlight Line */}
                        {item.isCurrentUser && (
                          <td className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
                        )}

                        <td className="px-8 py-5 font-mono font-bold text-slate-400 group-hover:text-emerald-600 transition-colors w-24">
                          {item.rank.toString().padStart(2, '0')}
                        </td>
                        
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm",
                              item.isCurrentUser ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-100 text-slate-600"
                            )}>
                              {item.avatar}
                            </div>
                            <div>
                              <p className={cn(
                                "font-bold text-base flex items-center gap-2", 
                                item.isCurrentUser ? "text-emerald-800" : "text-slate-800"
                              )}>
                                {item.name} 
                                {item.isCurrentUser && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                                    You
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                                <span>{item.totalScans} scans</span>
                                {item.streak >= 3 && (
                                  <span className="flex items-center gap-1 text-orange-500 font-medium">
                                    <Flame className="h-3 w-3" /> {item.streak}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5 text-right font-mono font-bold text-slate-900 text-lg">
                          {item.ecoScore.toLocaleString()}
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <TrendIcon trend={item.trend} />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* FIX 2: Restored Sticky User Rank Footer */}
      <AnimatePresence>
        {currentUser && currentUser.rank > 50 && (
          <motion.div 
            initial={{ y: 150, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 150, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 w-[90%] max-w-3xl z-50"
          >
            <div className="bg-slate-900 rounded-[2rem] p-4 pr-8 shadow-2xl shadow-slate-900/20 border border-slate-800 flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-colors cursor-default">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-[-2px]">Rank</span>
                  <span className="font-black text-2xl leading-none">{currentUser.rank}</span>
                </div>
                <div>
                  <p className="font-bold text-white text-lg flex items-center gap-2">
                    {currentUser.name}
                    <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">You</span>
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                    <span>{currentUser.totalScans} Total Scans</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-orange-400">
                      <Flame className="h-3 w-3" /> {currentUser.streak} Day Streak
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right relative z-10">
                <p className="text-3xl font-mono font-black text-emerald-400 leading-none mb-1">
                  {currentUser.ecoScore.toLocaleString()}
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Eco Points
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}