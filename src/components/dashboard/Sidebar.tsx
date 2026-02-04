'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, Recycle, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Network Overview", icon: Home, id: "NAV_01" },
  { href: "/dashboard/achievements", label: "Mission Protocols", icon: Star, id: "NAV_02" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar (visible on small screens) */}
      <div className="md:hidden w-full border-b border-slate-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Recycle className="h-6 w-6 text-emerald-600" />
            <span className="font-black tracking-tighter text-lg text-slate-900">
              ECO<span className="text-emerald-600">LENS</span>
            </span>
          </Link>

          <Button
            variant="ghost"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="h-10 w-10 p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block border-r border-slate-100 bg-white w-64 lg:w-72 relative">
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        <div className="relative flex h-full max-h-screen flex-col gap-4">
          <div className="flex h-14 items-center border-b border-slate-50 px-6 lg:h-[60px]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Recycle className="h-6 w-6 text-emerald-600 transition-transform group-hover:rotate-45" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <span className="font-black tracking-tighter text-xl text-slate-900">
                ECO<span className="text-emerald-600">LENS</span>
              </span>
            </Link>
          </div>

          <div className="flex-1 px-4">
            <div className="mb-4 px-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">
                Main Interface
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon, id }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href} className="relative block group">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-11 transition-all duration-300 relative z-10",
                        isActive
                          ? "bg-emerald-50 text-emerald-700 font-bold border-r-2 border-emerald-600 rounded-r-none"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-emerald-600" : "text-slate-400")} />
                      <span className="flex-1 text-left">{label}</span>
                      <span className="text-[8px] font-mono opacity-0 group-hover:opacity-40 transition-opacity">
                        {id}
                      </span>
                    </Button>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-emerald-50/50 -z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile slide-over panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.aside
              className="fixed z-50 left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-100 md:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-modal="true"
              role="dialog"
            >
              <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              />

              <div className="flex h-14 items-center justify-between px-4 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-3">
                  <Recycle className="h-6 w-6 text-emerald-600" />
                  <span className="font-black tracking-tighter text-lg text-slate-900">
                    ECO<span className="text-emerald-600">LENS</span>
                  </span>
                </Link>

                <Button variant="ghost" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="px-4 py-6">
                <div className="mb-4 px-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Main Interface
                  </span>
                </div>

                <nav className="space-y-1">
                  {navItems.map(({ href, label, icon: Icon, id }) => {
                    const isActive = pathname === href;
                    return (
                      <Link key={href} href={href} onClick={() => setOpen(false)} className="relative block group">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 h-11 transition-all duration-300 relative z-10",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 font-bold border-r-2 border-emerald-600 rounded-r-none"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", isActive ? "text-emerald-600" : "text-slate-400")} />
                          <span className="flex-1 text-left">{label}</span>
                          <span className="text-[8px] font-mono opacity-0 group-hover:opacity-40 transition-opacity">
                            {id}
                          </span>
                        </Button>
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 bg-emerald-50/50 -z-0"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
