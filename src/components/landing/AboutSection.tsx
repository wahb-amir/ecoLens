'use client';

import React from "react";
import { motion, Variants } from "framer-motion";
import { Target, Globe, Zap, LucideIcon } from "lucide-react";

// --- Types ---
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// --- Sub-Components ---
const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, badge }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    className="group relative overflow-hidden p-8 rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md transition-all hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] hover:border-emerald-500/30 text-left"
  >
    {/* Card Glow Effect */}
    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-opacity group-hover:opacity-100" />
    
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-1 ring-emerald-100 group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white group-hover:ring-emerald-400 transition-all duration-300">
      <Icon className="w-6 h-6" />
    </div>

    {badge && (
      <span className="absolute top-8 right-8 font-mono text-[10px] font-bold text-emerald-600/40 uppercase tracking-widest">
        {badge}
      </span>
    )}

    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-[0.15em] mb-3">
      {title}
    </h4>
    <p className="text-[15px] text-slate-500 leading-relaxed font-normal">
      {description}
    </p>
  </motion.div>
);

export default function AboutSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="relative w-full max-w-7xl py-24 px-6 md:py-44 mx-auto overflow-hidden"
    >
      {/* 1. Background Layer: Grid + Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Subtle Mesh Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23065f46' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 40V39L0 39V40zm40-40V0L39 0V40H40V0z'/%3E%3C/g%3E%3C/svg%3E")` }} 
        />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* 2. Header Section */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-[0.25em] mb-8 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Intelligence Ver // 2.0.4
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold text-slate-800 tracking-tight mb-10 leading-[1.05]">
            The Intelligence Behind <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent italic">
              Sustainability.
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-light">
            EcoLens isn’t just an interface. It’s a 
            <span className="text-slate-800 font-semibold px-1">high-fidelity telemetry engine</span> 
            engineered to turn raw ecological data into actionable human impact.
          </p>
        </motion.div>

        {/* 3. Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard 
            icon={Target}
            title="Precision AI"
            badge="Edge-CV"
            description="Utilizing low-latency computer vision protocols to classify materials in real-time at the edge."
          />
          <FeatureCard 
            icon={Globe}
            title="Global Sync"
            badge="Syncing"
            description="Contributing to a decentralized environmental ledger that tracks carbon offset in real-time."
          />
          <FeatureCard 
            icon={Zap}
            title="Eco-Logic"
            badge="Active"
            description="Our proprietary gamification engine translates verfied actions into liquid social capital."
          />
        </div>

        {/* 4. "Data-Driven" Footer Detail */}
        <motion.div 
          variants={itemVariants}
          className="mt-28 flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-6 opacity-30 grayscale saturate-0">
             <div className="h-[1px] w-12 bg-slate-400" />
            
             <div className="h-[1px] w-12 bg-slate-400" />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}