'use client';

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, Cpu, Award, BarChart, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Interfaces ---
interface StepData {
  title: string;
  description: string;
  iconName: string;
}

interface Step extends StepData {
  Icon: LucideIcon;
}

// Mocking the shared data for strict TS safety
const howItWorksSteps: StepData[] = [
  { title: "Capture", description: "Upload a photo of your item via the EcoLens mobile interface.", iconName: "UploadCloud" },
  { title: "Analyze", description: "Our neural network identifies materials and recycling protocols.", iconName: "Cpu" },
  { title: "Log", description: "Data is synced to your decentralized environmental ledger.", iconName: "BarChart" },
  { title: "Reward", description: "Earn Eco-Points redeemable for sustainable brand partner perks.", iconName: "Award" },
];

const iconMap: Record<string, LucideIcon> = {
  UploadCloud,
  Cpu,
  Award,
  BarChart,
};

// --- Sub-Components ---

const ConnectionLine = () => (
  <div className="hidden lg:block absolute top-1/2 left-0 w-full -translate-y-16 pointer-events-none z-0">
    <svg width="100%" height="20" viewBox="0 0 1000 20" fill="none" className="opacity-20">
      <path 
        d="M0 10 Q 250 10 500 10 T 1000 10" 
        stroke="url(#gradient-line)" 
        strokeWidth="2" 
        strokeDasharray="8 8" 
      />
      <defs>
        <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const StepCard = ({ step, index }: { step: Step; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative z-10 group"
    >
      {/* Decorative Glow */}
      <div className="absolute -inset-2 bg-gradient-to-b from-emerald-100/50 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      
      <Card className="relative h-full bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-sm transition-all duration-500 rounded-[2rem] overflow-hidden group-hover:border-emerald-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 group-hover:-translate-y-2">
        <div className="p-8">
          {/* Icon Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner">
              <step.Icon className="h-6 w-6" />
            </div>
            <span className="font-mono text-[40px] leading-none font-black text-slate-100 group-hover:text-emerald-500/10 transition-colors duration-500">
              0{index + 1}
            </span>
          </div>

          <h4 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">
            {step.title}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed font-normal">
            {step.description}
          </p>
        </div>
        
        {/* Card Bottom Tech Accent */}
        <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-in-out" />
      </Card>
    </motion.div>
  );
};

export default function HowItWorksSection() {
  const steps: Step[] = howItWorksSteps.map((s) => ({
    ...s,
    Icon: iconMap[s.iconName] || UploadCloud,
  }));

  return (
    <section className="relative w-full bg-[#fcfdfd] py-24 px-6 md:py-40 overflow-hidden">
      {/* 1. Refined Background Texture */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ backgroundImage: `radial-gradient(#065f46 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 2. Header with Text Balance */}
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-emerald-600 font-mono text-[11px] font-bold uppercase tracking-[0.4em] mb-4 block"
          >
            Protocol Execution
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight mb-6 text-balance">
            Engineered for <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent italic">Impact.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-500 font-light leading-relaxed">
            A four-stage neural pipeline designed to bridge the gap between 
            visual recognition and global ecological sustainability.
          </p>
        </div>

        {/* 3. Steps Grid */}
        <div className="relative">
          <ConnectionLine />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>

        {/* 4. Technical Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-24 flex justify-center"
        >
          <div className="px-6 py-2 rounded-full border border-slate-200 bg-white shadow-sm flex items-center gap-4">
           
          </div>
        </motion.div>
      </div>
    </section>
  );
}