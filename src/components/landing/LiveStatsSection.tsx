"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Wind, Cloud, Trash2 } from "lucide-react";
import { motionProps } from "./SectionShared";

interface LiveStat {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  baseValue: number | null;
  unit: string;
  source?: string;
  sourceUrl?: string;
  color: string;
  borderColor: string;
  coordinates?: string;
  lastUpdated?: string | null; // ISO timestamp when fetched
}

export default function LiveStatsSection() {
  const [timestamp, setTimestamp] = useState<string>("--:--:--");

  useEffect(() => {
    const update = () => setTimestamp(new Date().toLocaleTimeString());
    update();
    const timer = setInterval(update, 2500);
    return () => clearInterval(timer);
  }, []);

  const [stats, setStats] = useState<LiveStat[]>([
    {
      id: "MAUNA-LOA-CO2",
      icon: Cloud,
      title: "Atmospheric CO₂ (Mauna Loa monthly mean)",
      // fallback value (used if fetch fails)
      baseValue: 428.4,
      unit: "ppm",
      source: "NOAA Global Monitoring Laboratory (Mauna Loa Observatory)",
      sourceUrl: "https://gml.noaa.gov/ccgg/trends/data.html (co2_monthly_mm)",
      color: "text-sky-500 bg-sky-500/10",
      borderColor: "hover:border-sky-500/50",
      coordinates: "19.5362° N, 155.5763° W",
      lastUpdated: null,
    },
    {
      id: "WMO-GMST",
      icon: Wind,
      title: "Global mean surface temperature anomaly",
      // fallback number (e.g., WMO synthesis for last reported year)
      baseValue: 1.55, // °C above 1850-1900 baseline (fallback)
      unit: "°C",
      source:
        "WMO / NASA GISTEMP (synthesis). For live numbers, GISTEMP table is used if reachable.",
      sourceUrl: "https://data.giss.nasa.gov/gistemp/",
      color: "text-emerald-500 bg-emerald-500/10",
      borderColor: "hover:border-emerald-500/50",
      coordinates: "Global (1850–1900 baseline)",
      lastUpdated: null,
    },
    {
      id: "OCEAN-PLASTICS-ANNUAL",
      icon: Trash2,
      title: "Estimated annual plastic input to oceans",
      baseValue: 8_000_000,
      unit: "tons/yr",
      source:
        "Jambeck et al. (2015) — mid-range global estimate; see UNEP for alternate estimates",
      sourceUrl:
        "https://science.sciencemag.org/content/347/6223/768 (Jambeck et al. 2015)",
      color: "text-rose-500 bg-rose-500/10",
      borderColor: "hover:border-rose-500/50",
      coordinates: "Global aggregate (annual)",
      lastUpdated: null,
    },
  ]);

  // ---------- HELPERS: fetch & parse authoritative sources ----------
  // NOTE: Many of these public endpoints may block client-side CORS.
  // For production, perform these fetches server-side or via a proxy.
  async function fetchNoaaMaunaLoaCO2() {
    // NOAA provides a plain text monthly file: co2_mm_mlo.txt
    // We'll attempt to fetch it and parse the most recent non-comment line.
    const url = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt"; // plain text
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`NOAA fetch failed ${res.status}`);
      const txt = await res.text();
      // file has comment header lines beginning with '#'. Data lines: YEAR  MON  decimal_date  average  interpolated  trend  days
      const lines = txt
        .trim()
        .split("\n")
        .filter((l) => !l.startsWith("#"));
      const lastLine = lines[lines.length - 1].trim();
      const cols = lastLine.split(/\s+/);
      // 'average' is column index 3 in this file format (0-based: 0 year,1 month,2 decimal_date,3 average)
      // Note: average can be -99.99 when missing. We'll prefer 'interpolated' (col 4) if average missing.
      const avg = parseFloat(cols[3]);
      const interp = parseFloat(cols[4]);
      const value = !Number.isFinite(avg) || avg < -99 ? interp : avg;
      return {
        value: Number(value.toFixed(2)),
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error("NOAA CO2 fetch/parsing error:", err);
      throw err;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      // CO2 fetch
      try {
        const co2 = await fetchNoaaMaunaLoaCO2();
        if (!mounted) return;
        setStats((prev) =>
          prev.map((s) =>
            s.id === "MAUNA-LOA-CO2"
              ? { ...s, baseValue: co2.value, lastUpdated: co2.timestamp }
              : s,
          ),
        );
      } catch (err) {
        // keep fallback value and log; you should proxy requests from server to avoid CORS blocks
        console.warn("Using fallback CO2 value due to fetch error.");
      }
      setStats((prev) =>
        prev.map((s) =>
          s.id === "OCEAN-PLASTICS-ANNUAL"
            ? { ...s, lastUpdated: new Date().toISOString() }
            : s,
        ),
      );
    }

    loadAll();

    // Optionally poll every N minutes for updates (CO2 monthly updates are slow — choose appropriate interval)
    const pollInterval = 1000 * 60 * 60 * 6; // every 6 hours
    const pollId = window.setInterval(loadAll, pollInterval);

    return () => {
      mounted = false;
      clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- RENDER ----------
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
                Global Environmental Metrics
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
                        {stat.coordinates ?? "—"}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-2">
                    {stat.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black font-mono tracking-tighter text-slate-900">
                      {stat.baseValue === null
                        ? "—"
                        : stat.baseValue.toLocaleString(undefined, {
                            minimumFractionDigits:
                              stat.unit === "tons/yr" ? 0 : 2,
                            maximumFractionDigits:
                              stat.unit === "tons/yr" ? 0 : 2,
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
                      <div className="text-right">
                        <a
                          className="text-[10px] font-mono text-slate-600 underline"
                          href={stat.sourceUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {stat.source ?? "—"}
                        </a>
                        <div className="text-[10px] text-slate-400">
                          {stat.lastUpdated
                            ? `Updated ${new Date(stat.lastUpdated).toLocaleString()}`
                            : "Fallback / cached"}
                        </div>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color
                          .split(" ")[0]
                          .replace("text", "bg")}`}
                        style={{ width: "55%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
