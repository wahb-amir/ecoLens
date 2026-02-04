'use client';

import React from 'react';
import { Zap } from 'lucide-react';

export function Footer({ isLandingPage }: { isLandingPage: boolean }) {
  if (isLandingPage) return null;

  return (
    <footer className="w-full bg-white border-t border-slate-100 py-6">
      <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-emerald-600" aria-hidden />
          <span className="font-semibold text-slate-900">Ecolens</span>
        </div>

        {/* Short, neutral message */}
        <p className="text-sm text-slate-500 text-center md:text-left">
          Helping you recycle smarter. © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
