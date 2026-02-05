"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Leaf, Award, BarChart } from "lucide-react";
import { achievements } from "@/lib/achievements";
import { AnimatedCounter } from "./AnimatedCounter";
import { motionProps } from "./SectionShared";

interface StatItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: number;
  label: string;
  suffix?: string;
  // explicit classes so Tailwind picks them up
  iconOuter: string;
  cardBase: string;
  borderBase: string;
  headingColor?: string;
}

export default function AchievementsSection() {
  const stats: StatItem[] = [
    {
      icon: Leaf,
      value: 12845,
      label: "Total Items Recycled",
      // emerald — noticeable even before hover
      iconOuter:
        "p-4 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      cardBase:
        "bg-gradient-to-br from-emerald-50 to-white transform -translate-y-1",
      borderBase: "border-emerald-100",
      headingColor: "text-emerald-800",
    },
    {
      icon: Award,
      value: 432,
      label: "Active Eco-Warriors",
      // sky blue — slightly different shape and tint
      iconOuter: "p-4 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-100",
      cardBase:
        "bg-gradient-to-br from-sky-50 to-white transform translate-y-0.5",
      borderBase: "border-sky-100",
      headingColor: "text-sky-800",
    },
    {
      icon: BarChart,
      value: 89,
      label: "Classification Accuracy",
      suffix: "%",
      // indigo — tech/data vibe
      iconOuter:
        "p-4 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
      cardBase:
        "bg-gradient-to-br from-indigo-50 to-white transform translate-y-1",
      borderBase: "border-indigo-100",
      headingColor: "text-indigo-800",
    },
  ];

  const badgePalettes = [
    {
      outer: "p-5 rounded-full shadow-inner bg-emerald-50 text-emerald-700",
      title: "text-emerald-800",
    },
    {
      outer: "p-5 rounded-full shadow-inner bg-sky-50 text-sky-700",
      title: "text-sky-800",
    },
    {
      outer: "p-5 rounded-full shadow-inner bg-indigo-50 text-indigo-700",
      title: "text-indigo-800",
    },
    {
      outer: "p-5 rounded-full shadow-inner bg-rose-50 text-rose-700",
      title: "text-rose-800",
    },
    {
      outer: "p-5 rounded-full shadow-inner bg-amber-50 text-amber-700",
      title: "text-amber-800",
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
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className={`flex flex-col items-center justify-center p-8 shadow-md overflow-hidden border-2 transition-all duration-300 group ${stat.borderBase} ${stat.cardBase}`}
            >
              <div
                className={`mb-4 transition-all duration-300 ${stat.iconOuter}`}
              >
                <Icon className="w-12 h-12" />
              </div>

              <div className="flex items-baseline gap-2">
                <AnimatedCounter
                  to={stat.value}
                  className="text-5xl font-bold"
                />
                {stat.suffix && (
                  <span className="text-3xl font-bold align-baseline">
                    {stat.suffix}
                  </span>
                )}
              </div>

              <p
                className={`mt-2 font-semibold transition-colors group-hover:text-foreground ${stat.headingColor || "text-slate-700"}`}
              >
                {stat.label}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mt-20">
        <h3 className="text-2xl font-bold mb-8">Unlock Badges</h3>
        <div className="flex flex-wrap justify-center gap-8">
          {achievements.slice(0, 5).map((ach, i) => {
            const Icon = ach.icon as React.ComponentType<
              React.SVGProps<SVGSVGElement>
            >;
            const palette = badgePalettes[i % badgePalettes.length];
            return (
              <motion.div
                key={ach.id}
                className="flex flex-col items-center text-center w-28 overflow-hidden group"
                whileHover={{ scale: 1.08, rotate: 3 }}
              >
                {/* Each badge has a different default tint before hover */}
                <div
                  className={`${palette.outer} transition-all duration-300`}
                  aria-hidden
                >
                  <Icon className="w-10 h-10" />
                </div>
                <p
                  className={`mt-3 font-bold text-md transition-colors ${palette.title}`}
                >
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
