'use client';

import React, { useState } from 'react';
import { Leaf, Trophy, Search, TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-rose-500" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
};

export default function EcoLeaderboard() {
  const { leaderboard, isLoading, isError } = useLeaderboard();
  const [searchTerm, setSearchTerm] = useState('');

  if (isError) return <div className="p-6 text-center text-rose-500">Failed to load leaderboard.</div>;
  
  if (isLoading) return (
    <div className="max-w-5xl mx-auto p-6 flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  const filteredUsers = leaderboard.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredUsers.slice(0, 3);
  const restOfUsers = filteredUsers.slice(3);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Leaf className="text-emerald-600" />
            Top Recyclers
          </h1>
          <p className="text-slate-500 mt-1">Names are anonymized to protect privacy.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search ranks..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full w-full md:w-64 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Podium Section */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
          {topThree.map((user, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={user.id}
              className={`relative p-6 rounded-2xl bg-white border-b-4 shadow-sm flex flex-col items-center ${
                index === 0 ? 'border-emerald-500 md:order-2 h-72' : 
                index === 1 ? 'border-blue-400 md:order-1 h-64' : 'border-amber-400 md:order-3 h-64'
              }`}
            >
              {index === 0 && <Trophy className="w-10 h-10 text-emerald-500 absolute -top-5 bg-white rounded-full p-1" />}
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 mb-4 border-4 border-white shadow-md">
                {user.avatar}
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
              <div className="text-emerald-600 font-mono font-bold text-2xl mt-2">
                {user.ecoScore.toLocaleString()} <span className="text-sm">pts</span>
              </div>
              <div className="mt-auto flex gap-4 text-xs text-slate-500 font-medium uppercase tracking-wider">
                <span className="flex flex-col items-center">
                  <span className="text-slate-900">{user.totalScans}</span>
                  Scans
                </span>
                <span className="flex flex-col items-center">
                  <span className="text-orange-500 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {user.streak}
                  </span>
                  Day Streak
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Rank</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Points</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right hidden md:table-cell">Scans</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {restOfUsers.map((user) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={user.id} 
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    #{user.rank}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                      {user.avatar}
                    </div>
                    <span className="font-medium text-slate-700">{user.name}</span>
                    {user.streak > 3 && (
                      <span title={`${user.streak} Day Streak!`}><Flame className="w-4 h-4 text-orange-400" /></span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    {user.ecoScore.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 hidden md:table-cell">
                    {user.totalScans}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <TrendIcon trend={user.trend} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}