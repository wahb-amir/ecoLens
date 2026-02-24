"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Star, 
  Recycle, 
  X, 
  Menu, 
  Trophy, 
  LogOut,
  Loader2 // For loading state
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Prevent scroll when any modal/drawer is open
  useEffect(() => {
    if (isOpen || showLogoutModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen, showLogoutModal]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "GET" });
      if (response.ok) {
        router.push("/login");
        router.refresh(); 
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      {/* MOBILE HEADER */}
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
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="rounded-full">
            <Menu className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-100 bg-white h-screen sticky top-0 shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group mb-8">
            <div className="relative bg-emerald-50 p-2 rounded-xl">
              <Recycle className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="font-black tracking-tighter text-xl">
              ECO<span className="text-emerald-600">LENS</span>
            </span>
          </Link>

          <nav className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3 mb-4">Management</p>
            {navItems.map((item) => (
              <NavItem key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-50">
          <Button 
            variant="ghost" 
            onClick={() => setShowLogoutModal(true)}
            className="w-full justify-start gap-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop: put extremely high z so nothing can appear above it */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              // NOTE: using very high z-index to avoid stacking context surprises
              className="fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />

            {/* Drawer: full-height fixed panel with higher z-index than header/backdrop */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              // inset-0 ensures top:0 so it covers the sticky header; h-full for full coverage
              className="fixed inset-0 left-0 z-[9999] w-[280px] max-w-full bg-white md:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-black tracking-tighter text-xl text-slate-900">
                    ECO<span className="text-emerald-600">LENS</span>
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full"><X className="h-5 w-5" /></Button>
                </div>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavItem key={item.href} item={item} isActive={pathname === item.href} onClick={() => setIsOpen(false)} />
                  ))}
                </nav>
                <div className="mt-auto pt-4 border-t border-slate-50">
                   <Button 
                    variant="ghost" 
                    onClick={() => { setIsOpen(false); setShowLogoutModal(true); }}
                    className="w-full justify-start gap-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl text-center"
              role="dialog"
              aria-modal="true"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
                <LogOut className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Terminate Session?</h3>
              <p className="text-slate-500 text-sm mt-2">You will need to re-authenticate to access your dashboard protocols.</p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <Button 
                  variant="ghost" 
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutModal(false)}
                  className="rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                >
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Out"}
                </Button>
              </div>
            </motion.div>
          </div>
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
        isActive ? "text-emerald-700 bg-emerald-50/80" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      {isActive && (
        <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-5 bg-emerald-600 rounded-full" />
      )}
      <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
      <span className="flex-1 text-left">{item.label}</span>
      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />}
    </Link>
  );
}