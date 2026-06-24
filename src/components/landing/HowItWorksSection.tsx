"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useTransform,
  useInView,
  useMotionValue,
  animate,
} from "framer-motion";
import { UploadCloud, Cpu, Award, BarChart, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    title: "Capture",
    desc: "AI identifies materials via mobile uplink.",
    Icon: UploadCloud,
  },
  {
    title: "Analyze",
    desc: "Neural processing determines protocols.",
    Icon: Cpu,
  },
  {
    title: "Log",
    desc: "Data committed to the secure ledger.",
    Icon: BarChart,
  },
  { title: "Reward", desc: "Eco-Points minted to your wallet.", Icon: Award },
];

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInView = useInView(containerRef, { once: true, margin: "-15% 0px" });
  const progress = useMotionValue(0);

  useEffect(() => {
    if (isInView) {
      // Snappier bottleneck: We reduced the time spent in the 'stuck' phase (0.25 to 0.45)
      animate(progress, [0, 0.35, 0.38, 0.85, 1], {
        duration: 4.8,
        times: [0, 0.25, 0.45, 0.85, 1],
        ease: ["easeOut", "linear", "circIn", "easeOut"],
      });
    }
  }, [isInView, progress]);

  // Spatial Transforms
  const desktopWidth = useTransform(progress, [0, 1], ["0%", "100%"]);
  const packetLeft = useTransform(progress, [0, 1], ["0%", "100%"]);
  const mobileHeight = useTransform(progress, [0, 1], ["0%", "100%"]);

  // Refined Pressure Transform
  const packetScale = useTransform(
    progress,
    [0, 0.3, 0.35, 0.38, 0.45, 1],
    [1, 1, 1.5, 1.7, 1, 1],
  );

  // Clean Eco-Tech Palette: Cyan to Emerald
  const packetColor = useTransform(
    progress,
    [0, 0.4, 0.8, 1],
    ["#06b6d4", "#2dd4bf", "#10b981", "#10b981"],
  );

  return (
    <motion.section
      className="relative w-full bg-[#fcfdfe] py-32 px-6 lg:py-48 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: mounted ? 1 : 0 }}
      transition={{ duration: 0.45 }}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div ref={containerRef} className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-32">
          <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter">
            The <span className="text-emerald-500 italic">Neural</span> Pipeline
          </h2>
        </div>

        <div className="relative">
          {/* DATA BUS - Emerald to Teal to Cyan */}
          <div className="hidden lg:block absolute top-[4.5rem] left-[10%] right-[10%] h-[2px] z-0">
            <div className="w-full h-full bg-slate-200/50 rounded-full" />
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              style={{ width: desktopWidth }}
            />

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-2xl z-10 flex items-center justify-center"
              style={{
                left: packetLeft,
                scale: packetScale,
                backgroundColor: "#ffffff",
                border: "2px solid",
                borderColor: packetColor,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full animate-ping opacity-60"
                style={{ backgroundColor: packetColor }}
              />
            </motion.div>
          </div>

          {/* MOBILE VERTICAL SPINE */}
          <div className="lg:hidden absolute left-8 top-12 bottom-12 w-[2px] z-0">
            <div className="w-full h-full bg-slate-200/50 rounded-full" />
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-cyan-400 via-teal-400 to-emerald-500"
              style={{ height: mobileHeight }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {STEPS.map((step, idx) => (
              <NodeCard key={idx} step={step} index={idx} progress={progress} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function NodeCard({
  step,
  index,
  progress,
}: {
  step: any;
  index: number;
  progress: any;
}) {
  const start = index * 0.25;
  const end = (index + 1) * 0.25;

  const sBig = clamp(start + 0.1);
  const eBig = clamp(end + 0.05);

  const isActiveMV = useTransform(
    progress,
    [start, sBig, end - 0.05, end],
    [0, 1, 1, 0],
  );
  const isDoneMV = useTransform(progress, [end - 0.01, eBig], [0, 1]);

  const y = useTransform(progress, [start, sBig, end, eBig], [0, -12, -12, 0]);
  const scale = useTransform(
    progress,
    [start, sBig, end, eBig],
    [1, 1.03, 1.03, 1],
  );

  const borderColor = useTransform(
    progress,
    [start, sBig, end],
    ["#f1f5f9", "#06b6d4", "#e2e8f0"],
  );
  const iconBg = useTransform(
    progress,
    [start, start + 0.05, end],
    ["#f8fafc", "#06b6d4", "#10b981"],
  );
  const iconColor = useTransform(
    progress,
    [start, start + 0.05],
    ["#94a3b8", "#ffffff"],
  );
  const barWidth = useTransform(progress, [start, end], ["0%", "100%"]);

  const [active, setActive] = useState(false);
  useEffect(() => {
    const unsub = isActiveMV.on("change", (v: number) => setActive(v > 0.5));
    return () => unsub();
  }, [isActiveMV]);

  return (
    <motion.div
      style={{ y, scale }}
      className="relative flex flex-col items-center"
    >
      <motion.div
        className="w-full p-8 rounded-[2.5rem] bg-white border-2 flex flex-col shadow-sm overflow-hidden relative"
        style={{ borderColor }}
      >
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500"
          style={{ width: barWidth }}
        />

        <div className="flex justify-between items-start mb-8">
          <motion.div
            style={{ backgroundColor: iconBg, color: iconColor }}
            className="p-4 rounded-2xl transition-colors duration-300 shadow-lg"
          >
            <step.Icon size={26} />
          </motion.div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono font-bold text-slate-300 tracking-tighter">
              NODE_0{index + 1}
            </span>
            <motion.div style={{ opacity: isDoneMV }} className="mt-1">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </motion.div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2">{step.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          {step.desc}
        </p>
      </motion.div>
    </motion.div>
  );
}

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}
