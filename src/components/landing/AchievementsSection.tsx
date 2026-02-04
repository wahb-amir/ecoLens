"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Award, BarChart } from "lucide-react";
import { achievements } from "@/lib/achievements";
import { AnimatedCounter } from "./AnimatedCounter";
import { motionProps } from "./SectionShared";

interface Achievement {
  id: string | number;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function AchievementsSection() {
  const stats = [
    {
      icon: Leaf,
      value: 12845,
      label: "Total Items Recycled",
      // Emerald theme for recycling/nature
      colors: "text-emerald-600 bg-emerald-100 group-hover:bg-emerald-200",
      border: "hover:border-emerald-500",
    },
    {
      icon: Award,
      value: 432,
      label: "Active Eco-Warriors",
      // Sky blue theme for water/trust/community
      colors: "text-sky-600 bg-sky-100 group-hover:bg-sky-200",
      border: "hover:border-sky-500",
    },
    {
      icon: BarChart,
      value: 89,
      label: "Classification Accuracy",
      suffix: "%",
      // Indigo theme for technology/data
      colors: "text-indigo-600 bg-indigo-100 group-hover:bg-indigo-200",
      border: "hover:border-indigo-500",
    },
  ];

  return (
    <motion.section
      {...motionProps}
      className="w-full max-w-6xl py-20 px-4 md:py-28 text-center mx-auto overflow-x-hidden"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        Your Impact & Achievements
      </h2>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
        Every action matters. See our collective effort and unlock badges for
        your milestones.
      </p>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className={`flex flex-col items-center justify-center p-8 shadow-md overflow-hidden border-2 border-transparent transition-all duration-300 group ${stat.border}`}
          >
            <div
              className={`p-4 rounded-full mb-4 transition-colors duration-300 ${stat.colors}`}
            >
              <stat.icon className="w-12 h-12" />
            </div>
            <div className="flex items-baseline">
              <AnimatedCounter to={stat.value} className="text-5xl font-bold" />
              {stat.suffix && (
                <span className="text-5xl font-bold">{stat.suffix}</span>
              )}
            </div>
            <p className="text-muted-foreground mt-2 font-semibold transition-colors group-hover:text-foreground">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-20">
        <h3 className="text-2xl font-bold mb-8">Unlock Badges</h3>
        <div className="flex flex-wrap justify-center gap-8">
          {achievements.slice(0, 5).map((ach: Achievement) => {
            const Icon = ach.icon;
            return (
              <motion.div
                key={ach.id}
                className="flex flex-col items-center text-center w-28 overflow-hidden group"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {/* Badges get a subtle emerald tint as the default brand color */}
                <div className="p-5 bg-slate-100 text-slate-600 rounded-full shadow-inner group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all duration-300">
                  <Icon className="w-10 h-10" />
                </div>
                <p className="mt-3 font-bold text-md group-hover:text-emerald-700 transition-colors">
                  {ach.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ach.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
