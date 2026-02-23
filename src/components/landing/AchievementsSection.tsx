'use client';

import React from "react";
import { motion, Variants } from "framer-motion";
import { Leaf, Award, BarChart,Zap,ShieldCheck,Trophy,Crown,Hammer, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Types & Interfaces ---
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

interface StatItem {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  colorClass: string;
}

// --- Mock Data (Replace with your actual import) ---
const achievements: Achievement[] = [
  { id: 'ACH_first-step', name: 'First Step', description: 'Classify your first item.', icon: Zap },
  { id: 'ACH_waste-warrior', name: 'Waste Warrior', description: 'Classify 50 items.', icon: ShieldCheck },
  { id: 'ACH_score-pro', name: 'Score Pro', description: 'Reach an Eco Score of 1000.', icon: Trophy },
  { id: 'ACH_planet-protector', name: 'Planet Protector', description: 'Classify 100 items.', icon: Crown },
  { id: 'ACH_metal-master', name: 'Metal Master', description: 'Classify 10 metal items.', icon: Hammer },
];

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// --- Sub-Components ---

const StatCard = ({ stat, index }: { stat: StatItem; index: number }) => {
  const Icon = stat.icon;
  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card className={cn(
        "relative h-full overflow-hidden border-none bg-white/60 backdrop-blur-xl p-8 transition-all duration-500 group",
        "ring-1 ring-slate-200/60 hover:ring-emerald-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
      )}>
        {/* Abstract Background Glow */}
        <div className={cn(
          "absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20",
          stat.colorClass.replace('text', 'bg')
        )} />

        <div className="relative z-10 flex flex-col items-center">
          <div className={cn(
            "mb-6 p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
            "bg-white ring-1 ring-slate-100",
            stat.colorClass
          )}>
            <Icon className="w-8 h-8" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900">
              {/* Replace with your <AnimatedCounter /> component */}
              {stat.value.toLocaleString()}
            </span>
            {stat.suffix && (
              <span className="text-2xl font-bold text-slate-400">{stat.suffix}</span>
            )}
          </div>

          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
            {stat.label}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default function AchievementsSection() {
  const stats: StatItem[] = [
    { icon: Leaf, value: 12845, label: "Total Recycled", colorClass: "text-emerald-600" },
    { icon: Award, value: 432, label: "Eco-Warriors", colorClass: "text-sky-600" },
    { icon: BarChart, value: 89, suffix: "%", label: "AI Accuracy", colorClass: "text-indigo-600" },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="relative w-full max-w-7xl py-24 px-6 md:py-40 mx-auto overflow-hidden"
    >
      {/* Background Polish */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-24 left-1/4 w-96 h-96 bg-emerald-50/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-24 right-1/4 w-96 h-96 bg-blue-50/50 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 text-center">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <span className="text-emerald-600 font-mono text-[11px] font-bold uppercase tracking-[0.3em] mb-4 block">
            Collective Metrics
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
            Your Impact & <span className="text-emerald-600 italic">Achievements</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-500 font-light leading-relaxed">
            Real-time data synchronization across our global network of sustainable contributors.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-3 mb-32">
          {stats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} index={idx} />
          ))}
        </div>

        {/* Badges Section */}
        <motion.div variants={itemVariants} className="pt-20 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">
            Protocol Milestones
          </h3>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {achievements.map((ach) => (
              <motion.div
                key={ach.id}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center group cursor-help"
              >
                <div className="relative">
                  {/* Badge "Plate" */}
                  <div className="p-6 rounded-full bg-gradient-to-b from-white to-slate-50 ring-1 ring-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:ring-emerald-200">
                    <ach.icon className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition-colors duration-300" />
                  </div>
                  {/* Active Indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white scale-0 group-hover:scale-100 transition-transform duration-300" />
                </div>
                
                <p className="mt-4 font-bold text-slate-800 text-sm tracking-tight">{ach.name}</p>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {ach.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}