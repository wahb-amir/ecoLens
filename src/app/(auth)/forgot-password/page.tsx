"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, Loader2 } from "lucide-react";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      // Automatically redirect to OTP page after a delay usually
    }, 1500);
  };

  if (isSent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="We've sent a recovery code to your email."
      >
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-600">
            Did not receive the email? Check your spam filter or
            <button className="text-emerald-600 font-bold ml-1 hover:underline">
              try again
            </button>
          </p>
          <div className="w-full">
            <Link href="/otp-verify">
              <Button className="w-full bg-slate-900 text-white">
                Enter Code
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="mt-4 w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a 6-digit code."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <Link href="/login">
          <Button
            variant="ghost"
            type="button"
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}
