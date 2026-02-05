"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Wind, Cloud, Trash2, Activity } from "lucide-react";
import { motionProps } from "./SectionShared";

interface LiveStat {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  baseValue: number;
  unit: string;
  source: string;
  color: string;
  borderColor: string;
  coordinates: string;
}

export default function LiveStatsSection() {
  const [timestamp, setTimestamp] = useState<string>("--:--:--");

  useEffect(() => {
    const update = () => setTimestamp(new Date().toLocaleTimeString());

    update(); 
    const timer = setInterval(update, 2500);
    return () => clearInterval(timer);
  }, []);

  // State for live fluctuating values
  const [stats, setStats] = useState<LiveStat[]>([
    {
      id: "SNS-AQI-042",
      icon: Wind,
      title: "Global Avg. Air Quality",
      baseValue: 42.4,
      unit: "AQI",
      source: "Copernicus Sentinel-5P",
      color: "text-emerald-500 bg-emerald-500/10",
      borderColor: "hover:border-emerald-500/50",
      coordinates: "40.7128° N, 74.0060° W",
    },
    {
      id: "SNS-CO2-991",
      icon: Cloud,
      title: "Atmospheric CO₂ Concentration",
      baseValue: 421.15,
      unit: "ppm",
      source: "NOAA Mauna Loa Obs.",
      color: "text-sky-500 bg-sky-500/10",
      borderColor: "hover:border-sky-500/50",
      coordinates: "19.5362° N, 155.5763° W",
    },
    {
      id: "SNS-PLST-882",
      icon: Trash2,
      title: "Annual Ocean Plastic Inflow",
      baseValue: 11245902,
      unit: "tons",
      source: "UNEP Marine Litter Tracker",
      color: "text-rose-500 bg-rose-500/10",
      borderColor: "hover:border-rose-500/50",
      coordinates: "Global Aggregate",
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString());
      setStats((prev) =>
        prev.map((s) => ({
          ...s,
          // Small realistic fluctuations: +/- 0.02%
          baseValue:
            s.baseValue + (Math.random() - 0.5) * (s.baseValue * 0.0001),
        })),
      );
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.section
      {...motionProps}
      className="w-full bg-[#fafafa] py-20 px-4 md:py-28 overflow-x-hidden border-t border-b border-slate-100"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Live Satellite Uplink
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Environmental Telemetry
            </h2>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-md font-mono text-xs flex items-center gap-4 shadow-sm">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              REF_CLOCK: {timestamp}
            </span>
            <span className="hidden md:inline text-emerald-300">|</span>
            <span className="hidden md:inline font-bold tracking-wider">
              STATUS: NOMINAL
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.id}
                className={`relative p-6 bg-white border-slate-200 transition-all duration-500 overflow-hidden group border-2 ${stat.borderColor}`}
              >
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(#000 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-slate-400 uppercase leading-none mb-1">
                        {stat.id}
                      </p>
                      <p className="text-[9px] font-mono text-slate-300">
                        {stat.coordinates}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-2">
                    {stat.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black font-mono tracking-tighter text-slate-900">
                      {stat.baseValue.toLocaleString(undefined, {
                        minimumFractionDigits: stat.unit === "tons" ? 0 : 2,
                        maximumFractionDigits: stat.unit === "tons" ? 0 : 2,
                      })}
                    </span>
                    <span className="text-sm font-bold text-slate-400 uppercase">
                      {stat.unit}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Source
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">
                        {stat.source}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${stat.color.split(" ")[0].replace("text", "bg")}`}
                        animate={{ width: ["40%", "60%", "45%"] }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">
          End of Transmission // Data Synced via Decentralized Environmental
          Nodes
        </p>
      </div>
    </motion.section>
  );
}
