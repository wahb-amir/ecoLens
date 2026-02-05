"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthLayout, StatusAlert } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";

function OtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "error" | "success";
    msg: string;
  } | null>(null);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Auto-read OTP from URL (?otp=123456)
  useEffect(() => {
    const otpFromUrl = searchParams.get("otp");
    if (otpFromUrl && otpFromUrl.length === 6 && /^\d+$/.test(otpFromUrl)) {
      const otpArray = otpFromUrl.split("");
      setOtp(otpArray);
      // Optional: Auto-submit if you want it to be instant
      // handleVerify(null, otpArray.join(""));
    }
  }, [searchParams]);

  // 2. Timer Logic
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
    // Only take the last character if user types over
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Paste Support Logic
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(data)) return; // Only accept exactly 6 digits

    const newOtp = data.split("");
    setOtp(newOtp);
    inputRefs.current[5]?.focus(); // Focus the last box
  };

  const handleVerify = async (e?: React.FormEvent, manualOtp?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = manualOtp || otp.join("");

    setIsLoading(true);
    setStatus(null);

    // MOCK BACKEND
    setTimeout(() => {
      setIsLoading(false);
      if (codeToVerify === "123456" || manualOtp) {
        // Example success check
        setStatus({
          type: "success",
          msg: "Account verified! Shielding up...",
        });
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setStatus({
          type: "error",
          msg: "Invalid or expired code. Please try again.",
        });
      }
    }, 2000);
  };

  return (
    <form onSubmit={(e) => handleVerify(e)} className="space-y-8">
      <StatusAlert status={status?.type || null} message={status?.msg || ""} />

      {/* The "Board" Container for boxes */}
      <div
        className="flex justify-between gap-2 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner"
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-full h-14 text-center text-2xl font-black rounded-xl border-2 border-white bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all border-black"
          />
        ))}
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition-all text-md font-bold"
          disabled={isLoading || otp.join("").length !== 6}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Verify Identity
            </span>
          )}
        </Button>

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
              New code available in{" "}
              <span className="font-mono font-bold text-slate-900">
                00:{timer < 10 ? `0${timer}` : timer}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setTimer(30)}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center justify-center gap-2 w-full transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Resend Verification Code
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// Wrapping in Suspense because useSearchParams() requires it in Next.js App Router
export default function OtpPage() {
  return (
    <AuthLayout
      title="Security Check"
      subtitle="We've sent a 6-digit verification code to your registered email."
    >
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-emerald-500" />
          </div>
        }
      >
        <OtpForm />
      </Suspense>
    </AuthLayout>
  );
}
