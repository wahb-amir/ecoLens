'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Award, BarChart } from "lucide-react";
import { achievements } from "@/lib/achievements";
import {AnimatedCounter} from "./AnimatedCounter";
import { motionProps } from "./SectionShared";

interface Achievement {
  id: string | number;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function AchievementsSection() {
  const stats = [
    { icon: Leaf, value: 12845, label: "Total Items Recycled" },
    { icon: Award, value: 432, label: "Active Eco-Warriors" },
    { icon: BarChart, value: 89, label: "Classification Accuracy", suffix: "%" },
  ];

  return (
    <motion.section {...motionProps} className="w-full max-w-6xl py-20 px-4 md:py-28 text-center mx-auto overflow-x-hidden">
      <h2 className="text-3xl md:text-4xl font-bold">Your Impact & Achievements</h2>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
        Every action matters. See our collective effort and unlock badges for your milestones.
      </p>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {stats.map((stat, idx) => (
          <Card key={idx} className="flex flex-col items-center justify-center p-8 shadow-md overflow-hidden">
            <stat.icon className="w-12 h-12 text-primary mb-4" />
            <div className="flex items-baseline">
              <AnimatedCounter to={stat.value} className="text-5xl font-bold" />
              {stat.suffix && <span className="text-5xl font-bold">{stat.suffix}</span>}
            </div>
            <p className="text-muted-foreground mt-2 font-semibold">{stat.label}</p>
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
                className="flex flex-col items-center text-center w-28 overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="p-5 bg-muted rounded-full text-primary/80 shadow-inner">
                  <Icon className="w-10 h-10" />
                </div>
                <p className="mt-3 font-bold text-md">{ach.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
