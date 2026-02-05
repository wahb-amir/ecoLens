"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Cpu, Award, BarChart, ChevronRight } from "lucide-react";
import { motionProps, howItWorksSteps } from "./SectionShared";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  UploadCloud,
  Cpu,
  Award,
  BarChart,
};

// Refined Technical Palette
const colorThemes = [
  { border: "hover:border-emerald-500", shadow: "hover:shadow-emerald-500/10", icon: "text-emerald-500", bg: "bg-emerald-50" },
  { border: "hover:border-blue-500", shadow: "hover:shadow-blue-500/10", icon: "text-blue-500", bg: "bg-blue-50" },
  { border: "hover:border-lime-500", shadow: "hover:shadow-lime-500/10", icon: "text-lime-500", bg: "bg-lime-50" },
  { border: "hover:border-sky-500", shadow: "hover:shadow-sky-500/10", icon: "text-sky-500", bg: "bg-sky-50" },
];

export default function HowItWorksSection() {
  const steps = howItWorksSteps.map((s) => ({
    ...s,
    Icon: iconMap[s.iconName] || UploadCloud,
  }));

  return (
    <motion.section
      {...motionProps}
      className="relative w-full bg-white py-24 px-6 md:py-32 overflow-hidden"
    >
      {/* Background Decorative "Data Flow" Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        

        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
          How it <span className="text-emerald-600">Works.</span>
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium leading-relaxed">
          From visual capture to ecological impact—our neural network processes 
          each scan to automate sustainable action.
        </p>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          {/* Connecting Arrows (Desktop Only) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none">
            <div className="flex justify-around px-12">
              {[1, 2, 3].map((i) => (
                <ChevronRight key={i} className="w-8 h-8 text-slate-100 animate-pulse" />
              ))}
            </div>
          </div>

          {steps.map((step, index) => {
            const theme = colorThemes[index % colorThemes.length];
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Vertical Step Number */}
                <div className="absolute -top-4 -left-2 text-4xl font-mono font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none select-none">
                  0{index + 1}
                </div>

                <Card className={cn(
                  "h-full bg-white border border-slate-100 transition-all duration-500 rounded-[2rem] shadow-sm",
                  theme.border,
                  theme.shadow,
                  "group-hover:-translate-y-2 group-hover:shadow-2xl"
                )}>
                  <CardHeader className="pb-2">
                    <div className={cn(
                      "p-4 rounded-2xl w-fit mb-4 transition-transform duration-500 group-hover:rotate-6 shadow-sm",
                      theme.bg
                    )}>
                      {step.Icon && <step.Icon className={cn("h-7 w-7", theme.icon)} />}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Phase 0{index + 1}</span>
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {step.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}