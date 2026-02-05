
"use client";

import React, { useState,useEffect } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import {  Loader2 } from "lucide-react"; // Added missing icons
import { RefreshCw } from "lucide-react";
export default function OtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to focus previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock Verify
    setTimeout(() => {
      setIsLoading(false);
      alert(`Verifying Code: ${otp.join('')}`);
      // router.push('/dashboard')
    }, 1500);
  };

  return (
    <AuthLayout title="Verify Account" subtitle="Enter the 6-digit code sent to your email.">
      <form onSubmit={handleVerify} className="space-y-8">
        
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }} // Assign ref
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            />
          ))}
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white" 
          disabled={isLoading || otp.join('').length !== 6}
        >
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify Code'}
        </Button>

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
              Resend code in <span className="font-mono font-bold text-slate-900">00:{timer < 10 ? `0${timer}` : timer}</span>
            </p>
          ) : (
            <button 
              type="button" 
              onClick={() => setTimer(30)}
              className="text-sm font-bold text-emerald-600 hover:underline flex items-center justify-center gap-2 w-full"
            >
              <RefreshCw className="w-3 h-3" /> Resend Code
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}