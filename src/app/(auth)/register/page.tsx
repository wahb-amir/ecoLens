"use client";

import React, { useState } from "react";
import Link from "next/link";; 
import { AuthLayout,StatusAlert } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {  Mail, Lock, Loader2,User } from "lucide-react"; // Added missing icons

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API
    setTimeout(() => {
      setIsLoading(false);
      setStatus({ type: 'success', msg: 'Account created! Please verify your email.' });
      // router.push('/verify-otp')
    }, 2000);
  };

  return (
    <AuthLayout title="Create an account" subtitle="Start your journey to zero waste today.">
      <form onSubmit={handleRegister} className="space-y-6">
        <StatusAlert status={status?.type || null} message={status?.msg || ''} />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input id="name" placeholder="John Doe" className="pl-10 h-11" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input id="email" type="email" placeholder="name@example.com" className="pl-10 h-11" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input id="password" type="password" className="pl-10 h-11" required />
            </div>
            <p className="text-[10px] text-slate-500">Must be at least 8 characters long.</p>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-slate-900 hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}