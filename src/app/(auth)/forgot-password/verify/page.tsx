"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// 1. Internal component that safely uses useSearchParams
function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract email from URL
  const email = searchParams.get("email");
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Invalid session. Please enter your email again.");
      router.push("/forgot-password");
    }
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Please enter the full 6-digit code");

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/password/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Identity verified!");
        // Handover to reset page
        const query = new URLSearchParams({
          email: email || "",
          token: data.recoveryToken,
          uid: data.userId,
        }).toString();
        
        router.push(`/forgot-password/reset?${query}`);
      } else {
        toast.error(data.error || "Invalid or expired code");
      }
    } catch (err) {
      toast.error("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We've sent a 6-digit code to ${email || 'your inbox'}`}
    >
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-emerald-50 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center text-3xl tracking-[0.5em] font-mono h-16 border-2 focus:border-emerald-500"
              required
              autoFocus
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white"
          disabled={isLoading || otp.length < 6}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Verifying...
            </div>
          ) : (
            "Verify Code"
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
          >
            Change email address
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

// 2. Main export wrapped in Suspense for Next.js build optimization
export default function VerifyPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
        </div>
      }
    >
      <VerifyOTPForm />
    </Suspense>
  );
}