'use client';

import { motion } from "framer-motion";
import { motionProps } from "./SectionShared";
import { ScanSearch, Target, Globe } from "lucide-react";

export default function AboutSection() {
  return (
    <motion.section
      {...motionProps}
      className="relative w-full max-w-6xl py-24 px-4 md:py-32 text-center mx-auto overflow-hidden"
    >
      {/* 1. Subtle Background "Scanner" Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-[0.03] flex items-center justify-center">
        <div className="w-[500px] h-[500px] border-[1px] border-emerald-500 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[400px] h-[400px] border-[1px] border-dashed border-emerald-400 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      <div className="relative z-10">
        {/* 2. Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
          <ScanSearch className="w-3.5 h-3.5" />
          System Overview // Intelligence Unit
        </div>

        {/* 3. Improved Typography */}
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">
          The Intelligence Behind <span className="text-emerald-600">Sustainability.</span>
        </h2>

        {/* 4. Split Layout for better scannability */}
        <div className="max-w-4xl mx-auto">
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
            EcoLens isn't just an app—it's a real-time 
            <span className="text-slate-900 font-bold"> environmental telemetry </span> 
            engine designed to bridge the gap between human action and ecological data.
          </p>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-slate-100 pt-12">
            <div className="flex flex-col gap-3">
              <Target className="w-6 h-6 text-emerald-500" />
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Precision AI</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Instantly classify waste with high-accuracy computer vision protocols.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Globe className="w-6 h-6 text-emerald-500" />
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Global Sync</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Every item you scan contributes to a live, decentralized environmental impact map.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Gamified Logic</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Turn ecological responsibility into achievements with our Eco-Point reward system.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 5. "Nerdy" Bottom Border Detail */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </motion.section>
  );
}