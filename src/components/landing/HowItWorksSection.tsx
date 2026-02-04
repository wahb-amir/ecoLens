'use client';

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


export default function HowItWorksSection() {
  const steps: HowItWorksStep[] = howItWorksSteps.map((s) => ({
    ...s,
    Icon: iconMap[s.iconName] || UploadCloud,
  }));

  return (
    <motion.section {...motionProps} className="w-full bg-white py-20 px-4 md:py-28 overflow-x-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          A simple, gamified process to make recycling more engaging and impactful.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { delay: index * 0.15, duration: 0.6, ease: "easeOut" },
              }}
              viewport={{ once: true, amount: 0.5 }}
              whileHover={{ y: -10, scale: 1.03, transition: { duration: 0.3 } }}
              className="overflow-hidden"
            >
              <Card className="h-full text-left shadow-lg border-2 border-transparent hover:border-primary transition-colors duration-300 overflow-hidden">
                <CardHeader>
                  <div className="bg-primary/10 text-primary p-4 rounded-lg w-fit mb-4">
                    {step.Icon && <step.Icon className="h-8 w-8" />}
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
