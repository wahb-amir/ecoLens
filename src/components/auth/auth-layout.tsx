"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/AuthProvider";
import { Recycle } from "lucide-react";
/* ----------------- Helpers ----------------- */

// Splits text into lines to allow for sophisticated animation control
function splitHeadingLines(text: string): Array<[string, string]> {
  const lines = text.split("\n").map((l) => l.trim());
  return lines.map((line) => {
    if (!line) return ["", ""];
    const words = line.split(/\s+/);
    // Rough split: first half white, second half green
    const half = Math.ceil(words.length / 2);
    const left = words.slice(0, half).join(" ");
    const right = words.slice(half).join(" ");
    return [left, right];
  });
}

/* ----------------- Main Layout Component ----------------- */

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();

  // Safe fallback if hook isn't ready
  const { user } = useAuth() || { user: null };

  const handleLogoClick = () => {
    // Immediate navigation with error handling safety
    try {
      router.push(user ? "/dashboard" : "/");
    } catch (e) {
      console.error("Navigation failed:", e);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      {/* 1. The Smart Left Panel */}
      <LeftPanel onLogoClick={handleLogoClick} />

      {/* 2. The Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 relative">
        <div className="w-full max-w-[440px] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Sub-Component: Left Panel ----------------- */

function LeftPanel({ onLogoClick }: { onLogoClick: () => void }) {
  const pathnameRaw = usePathname() || "/";
  // Clean pathname to handle query params or trailing slashes
  const pathname = pathnameRaw.split("?")[0].replace(/\/$/, "") || "/";

  // Dynamic Copy Configuration
  const ROUTE_COPY: Record<string, { heading: string; paragraph: string }> = {
    "/": {
      heading: "Join the Global\nEco-Network.",
      paragraph:
        "Real-time AI classification, carbon footprint analytics, and community-driven conservation protocols.",
    },
    "/login": {
      heading: "Welcome back,\nOperative.",
      paragraph:
        "Sign in to access your dashboard, live telemetry, and personalized impact reports.",
    },
    "/register": {
      heading: "Begin your\nJourney.",
      paragraph:
        "Join the network — track your impact, earn badges, and help protect our oceans and air.",
    },
    "/verify": {
      heading: "Secure your\nConnection.",
      paragraph:
        "Enter the code we sent to confirm your identity and establish a secure link.",
    },
    "/forgot-password": {
      heading: "Recover your\nAccess.",
      paragraph: "We'll help you reset your credentials quickly and securely.",
    },
  };

  // Default to "/" text if route not found
  const active = ROUTE_COPY[pathname] ?? ROUTE_COPY["/"];
  const headingLines = splitHeadingLines(active.heading);

  return (
    <div className="hidden lg:flex w-1/2 bg-[#020817] relative overflow-hidden flex-col justify-between p-16 text-white border-r border-emerald-500/10">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Animated Glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.3, 0.2],
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Header / Logo */}
      <div className="relative z-10">
        <button
          type="button"
          onClick={onLogoClick}
          className="group flex items-center gap-2 focus:outline-none"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
            <Recycle className=" text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase text-white">
            Eco<span className="text-emerald-500">Lens</span>
          </span>
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="relative z-10 space-y-8 max-w-lg min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname} // triggers animation on route change
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Wrap heading in a relative container so underline can be full-width */}
            <div className="relative inline-block w-full">
              <h2 className="text-5xl font-bold leading-[1.1] tracking-tight mb-6">
                {headingLines.map(([left, right], i) => (
                  <span key={i} className="block">
                    <span className="text-white">{left}</span>{" "}
                    <span className="text-emerald-400">{right}</span>
                  </span>
                ))}
              </h2>

              {/* Fast underline that covers entire heading width */}
              <motion.div
                aria-hidden
                className="absolute left-0 right-0 h-1 bg-emerald-500 rounded origin-left"
                style={{ bottom: "-8px", transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ delay: 0.12, duration: 0.18, ease: "easeOut" }}
              />
            </div>

            <p className="text-slate-400 text-xl leading-relaxed font-medium mt-8">
              {active.paragraph}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        className="relative z-10 flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>© 2026 ECOLENS</span>
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-emerald-500/50">System_Online</span>
      </motion.div>
    </div>
  );
}

/* ----------------- StatusAlert Component ----------------- */

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
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      className={cn(
        "p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border shadow-sm mb-4",
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
