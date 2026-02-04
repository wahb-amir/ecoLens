'use client';

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Wind, Cloud, Trash2 } from "lucide-react";
import { motionProps } from "./SectionShared";

interface Stat {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // <- fixed
  title: string;
  value: string | number;
  description?: string;
}

export default function LiveStatsSection() {
  const stats: Stat[] = [
    { icon: Wind, title: "Avg. Air Quality (AQI)", value: 42, description: "Good" },
    { icon: Cloud, title: "Atmospheric CO₂", value: 421, description: "ppm" },
    { icon: Trash2, title: "Ocean Plastic Waste", value: "11M", description: "tons/year" },
  ];

  return (
    <motion.section {...motionProps} className="w-full bg-white py-20 px-4 md:py-28 overflow-x-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Live Environmental Stats</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          A real-time snapshot of our planet's health. Data is for illustrative purposes.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.15, duration: 0.6, ease: "easeOut" },
                }}
                viewport={{ once: true, amount: 0.5 }}
                className="overflow-hidden"
              >
                <Card className="p-6 text-center shadow-md overflow-hidden">
                  <div className="flex justify-center mb-4">
                    <div className="bg-accent/10 text-accent p-4 rounded-full">
                      <Icon className="w-8 h-8" /> {/* ✅ now allowed */}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground">{stat.title}</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className="text-5xl font-bold text-[hsl(var(--foreground))] mt-2">{stat.value}</p>
                    {stat.description && (
                      <span className="text-md font-semibold text-muted-foreground">{stat.description}</span>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
