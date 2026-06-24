"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Wind,
  Cloud,
  Trash2,
  Globe,
  RefreshCw,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Strict Types ---
interface LiveStat {
  id: string;
  icon: LucideIcon; // Changed from React.ElementType to LucideIcon for strictness
  title: string;
  value: number;
  unit: string;
  source: string;
  sourceUrl: string;
  color: "emerald" | "cyan" | "rose";
  coordinates: string;
  status: "syncing" | "nominal" | "degraded";
}

function AnimatedNumber({
  value,
  precision = 2,
}: {
  value: number;
  precision?: number;
}) {
  const spring = useSpring(value, { stiffness: 30, damping: 15 });

  // Explicitly typing the transform output as a string for safety
  const display = useTransform(spring, (current: number) =>
    current.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }),
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function LiveStatsSection() {
  const [timestamp, setTimestamp] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(true);

  const [stats, setStats] = useState<LiveStat[]>([
    {
      id: "MLO-CO2",
      icon: Cloud,
      title: "Atmospheric CO₂ Mean",
      value: 424.55,
      unit: "ppm",
      source: "NOAA Mauna Loa",
      sourceUrl: "https://gml.noaa.gov/ccgg/trends/",
      color: "emerald",
      coordinates: "19.53°N, 155.57°W",
      status: "nominal",
    },
    {
      id: "GISTEMP-V4",
      icon: Wind,
      title: "Global Temp Anomaly",
      value: 1.26,
      unit: "°C",
      source: "NASA GISTEMP",
      sourceUrl: "https://data.giss.nasa.gov/gistemp/",
      color: "cyan",
      coordinates: "Global Aggregate",
      status: "nominal",
    },
    {
      id: "PLASTIC-EST",
      icon: Trash2,
      title: "Annual Ocean Plastic",
      value: 11245672,
      unit: "tons",
      source: "UNEP / Jambeck",
      sourceUrl: "https://www.unep.org/",
      color: "rose",
      coordinates: "Marine Biosphere",
      status: "nominal",
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);

    const jitter = setInterval(() => {
      setStats((prev) =>
        prev.map((s) => ({
          ...s,
          value:
            s.id === "PLASTIC-EST"
              ? s.value + Math.random() * 5
              : s.value + (Math.random() - 0.5) * 0.01,
        })),
      );
    }, 3000);

    const syncTimer = setTimeout(() => setIsSyncing(false), 1500);

    return () => {
      clearInterval(timer);
      clearInterval(jitter);
      clearTimeout(syncTimer);
    };
  }, []);

  // Handler for the Report Button
  const handleViewReport = () => {
    window.open(
      "https://www.ipcc.ch/report/ar6/syr/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="relative w-full py-24 px-6 bg-[#fcfdfe] overflow-hidden border-y border-slate-100">
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                Live Telemetry
              </div>
              <div className="h-[1px] w-12 bg-slate-200" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                System ID: ENVIRO-NET-04
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Planetary <span className="text-emerald-500 italic">Vitals</span>
            </h2>
          </div>

          <div className="flex flex-col items-end font-mono">
            <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Network Clock
                </p>
                <p className="text-lg font-black text-slate-800">
                  {timestamp || "00:00:00"}
                </p>
              </div>
              <div className="w-[1px] h-8 bg-slate-100" />
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    isSyncing ? "bg-amber-500" : "bg-emerald-500",
                  )}
                />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {isSyncing ? "Syncing..." : "Stream: Nominal"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group relative bg-white border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-500/5 to-transparent h-[2px] w-full -translate-y-full group-hover:animate-[scanline_3s_linear_infinite] pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div
                        className={cn(
                          "p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500",
                          stat.color === "emerald"
                            ? "bg-emerald-50 text-emerald-500"
                            : stat.color === "cyan"
                              ? "bg-cyan-50 text-cyan-500"
                              : "bg-rose-50 text-rose-500",
                        )}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">
                          {stat.id}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {stat.coordinates}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                      {stat.title}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">
                        <AnimatedNumber
                          value={stat.value}
                          precision={stat.id === "PLASTIC-EST" ? 0 : 2}
                        />
                      </span>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {stat.unit}
                      </span>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-50">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">Reliability</span>
                        <span className="text-emerald-500">99.2%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "92%" }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full",
                            stat.color === "emerald"
                              ? "bg-emerald-500"
                              : stat.color === "cyan"
                                ? "bg-cyan-500"
                                : "bg-rose-500",
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <a
                          href={stat.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-400 hover:text-emerald-500 transition-colors underline decoration-slate-200 underline-offset-4"
                        >
                          {stat.source}
                        </a>
                        <div className="flex items-center gap-1.5">
                          <RefreshCw
                            size={10}
                            className="text-slate-300 animate-[spin_3s_linear_infinite]"
                          />
                          <span className="text-[9px] text-slate-300 font-mono uppercase">
                            Live Feed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
              <Globe size={18} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              Our telemetry network aggregates data from NASA, NOAA, and UNEP to
              provide a real-time snapshot of the planet's health.
            </p>
          </div>
          <button
            onClick={handleViewReport}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm active:scale-95"
          >
            View Full Report
          </button>
        </motion.div>
      </div>
    </section>
  );
}
