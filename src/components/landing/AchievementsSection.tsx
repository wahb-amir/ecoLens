"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Leaf, Award, BarChart, Zap, ShieldCheck, Trophy, Crown, Hammer, LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const achievements: Achievement[] = [
  { id: '1', name: 'First Step', description: 'Classify your first item.', icon: Zap, color: "text-amber-500" },
  { id: '2', name: 'Waste Warrior', description: 'Classify 50 items.', icon: ShieldCheck, color: "text-emerald-500" },
  { id: '3', name: 'Score Pro', description: 'Reach an Eco Score of 1000.', icon: Trophy, color: "text-blue-500" },
  { id: '4', name: 'Planet Protector', description: 'Classify 100 items.', icon: Crown, color: "text-cyan-500" },
  { id: '5', name: 'Metal Master', description: 'Classify 10 metal items.', icon: Hammer, color: "text-slate-600" },
];

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 45, damping: 20 });
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());
  useEffect(() => spring.set(value), [value, spring]);
  return <motion.span>{display}</motion.span>;
}

export default function AchievementsSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const stats = [
    { icon: Leaf, value: 12845, label: "Total Recycled", text: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Award, value: 432, label: "Eco-Warriors", text: "text-cyan-600", bg: "bg-cyan-50" },
    { icon: BarChart, value: 89, suffix: "%", label: "AI Accuracy", text: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    /* FIX 1: Removed 'isolate'
       FIX 2: Added 'z-50' to ensure this section sits above the Telemetry section
    */
    <section className="relative w-full py-24 px-6 lg:py-32 bg-white z-50">
      
      {/* Background Polish - Set to z-0 so it's behind everything */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-50/30 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-24">
          <motion.div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-emerald-500" />
            <span className="text-emerald-600 font-mono text-[10px] font-black uppercase tracking-[0.3em]">Milestones</span>
          </motion.div>
          <motion.h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter max-w-2xl">
            Your impact on the <span className="text-emerald-500">planet</span>, quantified.
          </motion.h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 relative">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="group p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100/80 hover:bg-white hover:shadow-2xl transition-all duration-500"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg)}>
                <stat.icon size={24} className={stat.text} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  <AnimatedNumber value={stat.value} />
                </span>
                {stat.suffix && <span className="text-xl font-bold text-slate-400">{stat.suffix}</span>}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Badges Container */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 relative">
          {achievements.map((ach) => {
            const isActive = selectedId === ach.id;
            return (
              <div 
                key={ach.id} 
                className="relative"
                /* FIX 3: Dynamic z-index on the wrapper so active badge is always top of the row */
                style={{ zIndex: isActive ? 100 : 10 }} 
                onMouseEnter={() => setSelectedId(ach.id)}
                onMouseLeave={() => setSelectedId(null)}
              >
                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                )}

                <motion.button
                  layout
                  onClick={() => setSelectedId(isActive ? null : ach.id)}
                  className={cn(
                    "relative z-30 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500",
                    "bg-white border-2",
                    isActive 
                      ? "border-emerald-500 shadow-2xl scale-110 ring-8 ring-emerald-50" 
                      : "border-slate-100 shadow-sm"
                  )}
                >
                  <ach.icon size={28} className={cn("transition-colors duration-500", isActive ? ach.color : "text-slate-300")} />
                </motion.button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      /* FIX 4: Use z-[9999] and ensure pointer events allow scrolling 
                      */
                      className="absolute top-[115%] left-1/2 -translate-x-1/2 w-72 p-6 bg-white border border-slate-100 shadow-[0_30px_70px_rgba(0,0,0,0.15)] rounded-[2.5rem] z-[9999] text-center pointer-events-none md:pointer-events-auto"
                    >
                      <div className={cn("mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-slate-50 shadow-inner", ach.color)}>
                        <ach.icon size={24} />
                      </div>
                      <h4 className="text-slate-900 font-black text-xl mb-2">{ach.name}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6">{ach.description}</p>
                      
                      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 rounded-2xl">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.15em]">Verified Milestone</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}