'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEcoTracker } from '@/hooks/use-eco-tracker';
import { WasteDistributionChart } from '@/components/dashboard/WasteDistributionChart';
import { Activity, BarChart3, Database, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { stats } = useEcoTracker();

  const getRecyclingRate = () => {
    if (!stats || stats.totalScans === 0) return 0;
    const recyclableItems =
      (stats.scansByType['plastic'] || 0) +
      (stats.scansByType['paper'] || 0) +
      (stats.scansByType['metal'] || 0) +
      (stats.scansByType['glass'] || 0);
    return Math.round((recyclableItems / stats.totalScans) * 100);
  };

  const getTopCategory = () => {
    const keys = Object.keys(stats.scansByType || {});
    if (keys.length === 0) return 'N/A';
    return keys.reduce((a, b) =>
      (stats.scansByType[a] || 0) > (stats.scansByType[b] || 0) ? a : b
    );
  };

  const recyclingRate = getRecyclingRate();

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600">
              User Telemetry: Active
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Eco Dashboard</h1>
          <p className="text-slate-500 font-medium">Monitoring your environmental footprint in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-3">
          <Card className="border-2 border-slate-100 shadow-sm overflow-hidden min-h-[420px]">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg">Waste Distribution</CardTitle>
              </div>
              <CardDescription>Global classification breakdown by material type.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <WasteDistributionChart stats={stats} />
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel (non-shrinking on wide screens) */}
        <div className="lg:col-span-2 flex-shrink-0 flex flex-col gap-6 min-w-[300px]">
          <Card className="border-2 border-slate-100 shadow-lg relative overflow-hidden bg-white min-h-[420px]">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <CardHeader className="relative z-10 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg">Metric Overview</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 p-6 space-y-6">
              {/* Total Scans */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-md text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Scans</span>
                </div>
                <span className="text-2xl font-black font-mono text-slate-900">{stats.totalScans ?? 0}</span>
              </div>

              {/* Eco Score */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-50 rounded-md text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Eco Score</span>
                </div>
                <span className="text-2xl font-black font-mono text-slate-900">{stats.ecoScore ?? 0}</span>
              </div>

              {/* Recycling Rate */}
              <div className="pt-4 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recycling Rate</span>
                  <span className="text-xl font-black font-mono text-emerald-600">{recyclingRate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${recyclingRate}%` }}
                  />
                </div>
              </div>

              {/* Top Category */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dominant Stream</p>
                  <p className="text-lg font-black text-slate-900 capitalize">{getTopCategory()}</p>
                </div>
                <ShieldCheck className="w-8 h-8 text-slate-200" />
              </div>
            </CardContent>
          </Card>

          {/* Removed mini notification as requested */}
        </div>
      </div>
    </div>
  );
}
