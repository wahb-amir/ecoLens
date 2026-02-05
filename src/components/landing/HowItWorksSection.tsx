"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Cpu, Award, BarChart } from "lucide-react";
import { motionProps, howItWorksSteps, HowItWorksStep } from "./SectionShared";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  UploadCloud,
  Cpu,
  Award,
  BarChart,
};

// Define an eco/planet-themed color palette
const colors = [
  {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    hoverBg: "group-hover:bg-emerald-200",
    hoverText: "group-hover:text-emerald-700",
  },
  {
    bg: "bg-blue-100",
    text: "text-blue-600",
    hoverBg: "group-hover:bg-blue-200",
    hoverText: "group-hover:text-blue-700",
  },
  {
    bg: "bg-lime-100",
    text: "text-lime-600",
    hoverBg: "group-hover:bg-lime-200",
    hoverText: "group-hover:text-lime-700",
  },
  {
    bg: "bg-teal-100",
    text: "text-teal-600",
    hoverBg: "group-hover:bg-teal-200",
    hoverText: "group-hover:text-teal-700",
  },
];

export default function HowItWorksSection() {
  const steps: HowItWorksStep[] = howItWorksSteps.map((s) => ({
    ...s,
    Icon: iconMap[s.iconName] || UploadCloud,
  }));

  return (
    <motion.section
      {...motionProps}
      className="w-full bg-white py-20 px-4 md:py-28 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">
          How it <span className="text-emerald-600">Works.</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          A simple, gamified process to make recycling more engaging and
          impactful.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const color = colors[index % colors.length]; // cycle through colors
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: index * 0.15,
                    duration: 0.6,
                    ease: "easeOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
                className="overflow-hidden"
              >
                <Card className="h-full text-left shadow-lg border-2 border-transparent hover:border-emerald-500 transition-all duration-300 overflow-hidden group">
                  <CardHeader>
                    <div
                      className={`${color.bg} ${color.text} p-4 rounded-lg w-fit mb-4 transition-colors duration-300 ${color.hoverBg}`}
                    >
                      {step.Icon && <step.Icon className="h-8 w-8" />}
                    </div>
                    <CardTitle
                      className={`${color.hoverText} transition-colors`}
                    >
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
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
