"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Star, 
  Recycle, 
  X, 
  Menu, 
  Trophy, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home, id: "01" },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy, id: "02" },
  { href: "/dashboard/achievements", label: "Achievements", icon: Star, id: "03" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  return (
    <>
      {/* MOBILE HEADER 
        Sticky and high z-index to stay above content 
      */}
      <header className="md:hidden sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Recycle className="h-5 w-5 text-white" />
            </div>
            <span className="font-black tracking-tighter text-lg">
              ECO<span className="text-emerald-600">LENS</span>
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="rounded-full hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </header>

      {/* DESKTOP SIDEBAR 
        Using 'sticky' instead of 'fixed' inside a flex container 
        allows it to occupy real space without overlapping main content.
      */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-100 bg-white h-screen sticky top-0 shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group mb-8">
            <div className="relative bg-emerald-50 p-2 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Recycle className="h-6 w-6 text-emerald-600 transition-transform group-hover:rotate-12" />
            </div>
            <span className="font-black tracking-tighter text-xl text-slate-900">
              ECO<span className="text-emerald-600">LENS</span>
            </span>
          </Link>

          <nav className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3 mb-4">
              Management
            </p>
            {navItems.map((item) => (
              <NavItem key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </nav>
        </div>

        {/* User / Bottom Section */}
        <div className="mt-auto p-4 border-t border-slate-50">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
            <LogOut className="h-4 w-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[50] bg-slate-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[51] w-[280px] bg-white shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-black tracking-tighter text-xl">
                    ECO<span className="text-emerald-600">LENS</span>
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavItem 
                      key={item.href} 
                      item={item} 
                      isActive={pathname === item.href} 
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ item, isActive, onClick }: { item: any; isActive: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  
  return (
    <Link 
      href={item.href} 
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isActive 
          ? "text-emerald-700 bg-emerald-50/80" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      {/* Animated Active Indicator Pillar */}
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute left-0 w-1 h-5 bg-emerald-600 rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      <Icon className={cn(
        "h-5 w-5 transition-colors",
        isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
      )} />
      
      <span className="flex-1">{item.label}</span>
      
      {isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
      )}
    </Link>
  );
}