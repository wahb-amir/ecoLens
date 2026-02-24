"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function PasswordVerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get email from URL: http://localhost:3000/.../verify?email=op422010@gmail.com
  const email = searchParams.get("email");
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Invalid session. Please enter your email again.");
      router.push("/auth/forgot-password");
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
        // FAANG Flow: Move to the reset page with the recoveryToken and userId
        // We pass these in the URL for the next page to consume
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
      subtitle={`We've sent a 6-digit code to ${email}`}
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
              className="text-center text-3xl tracking-[0.5em] font-mono h-16 border-2 focus:border-emerald-500 focus:ring-emerald-500"
              required
              autoFocus
            />
            <p className="text-center text-sm text-slate-500">
              Enter the code sent to your inbox
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white text-lg font-medium transition-all"
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
            onClick={() => router.back()}
            className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
          >
            Change email address
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}