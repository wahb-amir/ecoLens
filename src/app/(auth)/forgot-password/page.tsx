// app/auth/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner"; 

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setIsSent(true);
        toast.success("Security code sent!");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to send code");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthLayout title="Check your inbox" subtitle={`We've sent a code to ${email}`}>
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="w-full">
            <Button 
              className="w-full bg-slate-900 text-white"
              onClick={() => router.push(`/forgot-password/verify?email=${email}`)}
            >
              Enter 6-Digit Code
            </Button>
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setIsSent(false)}>
              Try a different email
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a 6-digit code.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="pl-10 h-11"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-11 bg-slate-900 text-white" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Reset Link"}
        </Button>
        <Link href="/login">
          <Button variant="ghost" type="button" className="w-full flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}