'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motionProps } from "./SectionShared";
import { CheckCircle, Zap, ShieldCheck, Terminal } from "lucide-react";

export default function CtaSection() {
  return (
    <motion.section 
      {...motionProps} 
      className="relative w-full bg-white py-24 md:py-32 overflow-hidden border-t border-slate-100"
    >
      {/* 1. Light-Mode Technical Grid */}
      <div className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `linear-gradient(#059669 5px, transparent 5px), linear-gradient(90deg, #059669 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }} 
      />
      
      {/* 2. Soft Radial Fade to keep the grid subtle */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_70%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* 3. High-Contrast Status Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-[10px] font-mono uppercase tracking-[0.2em] mb-8 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Eco-Lens: Online 
        </motion.div>

        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
          Initialize Your <span className="text-emerald-600">Eco-Impact.</span>
        </h2>
        
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
          The planet doesn't need more data—it needs more action. Join the global 
          telemetry network and start classifying waste in real-time.
        </p>

        {/* 4. The Action Hub */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            {/* Soft Shadow Glow for Light Mode */}
            <div className="absolute -inset-1 bg-emerald-400/20 rounded-xl blur-lg group-hover:bg-emerald-400/30 transition duration-300" />
            
            <Link href="/dashboard">
              <Button
                size="lg"
                className="relative bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-12 py-8 text-xl font-bold shadow-lg border-b-4 border-emerald-800 transition-all duration-200 active:border-b-0 active:translate-y-1"
              >
                Launch Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* 5. Details */}
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {[
              { icon: CheckCircle, text: "Instant AI Response" },
              { icon: ShieldCheck, text: "Secure Data Uplink" },
              { icon: Terminal, text: "Open Protocol" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-black text-xs font-mono uppercase tracking-wider">
                <item.icon className="w-4 h-4 text-emerald-500" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

       
      </div>
    </motion.section>
  );
}