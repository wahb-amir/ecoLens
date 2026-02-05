"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Exporting AuthLayout as a named export
export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* LEFT: Technical Side Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#020817] relative overflow-hidden flex-col justify-between p-12 text-white border-r border-emerald-500/10">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Animated Glow Effect */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 group cursor-default">
            <span className="font-black text-2xl tracking-tighter uppercase">
              Eco<span className="text-emerald-500">Lens</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl font-bold leading-[1.1] tracking-tight">
              Join the Global <br />{" "}
              <span className="text-emerald-500">Eco-Network.</span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg leading-relaxed font-medium">
              Real-time AI classification, carbon footprint analytics, and
              community-driven conservation protocols.
            </p>
          </motion.div>

         
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <span>© 2026 ECOLENS</span>
          <span className="w-2 h-2 bg-green-700 rounded-full animate-pulse" />
        </div>
      </div>

      {/* RIGHT: Interactive Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-[420px] space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-slate-500 text-lg font-medium">{subtitle}</p>
          </div>
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const StatusAlert = ({
  status,
  message,
}: {
  status: "error" | "success" | null;
  message: string;
}) => {
  if (!status) return null;

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border shadow-sm",
        status === "error"
          ? "bg-red-50 text-red-700 border-red-100"
          : "bg-emerald-50 text-emerald-700 border-emerald-100",
      )}
    >
      {status === "error" ? (
        <AlertCircle className="w-5 h-5 shrink-0" />
      ) : (
        <CheckCircle className="w-5 h-5 shrink-0" />
      )}
      {message}
    </motion.div>
  );
};
