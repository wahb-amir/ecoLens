"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, StatusAlert } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
export default function LoginPage() {
  const router = useRouter();
  const { user, syncUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "error" | "success";
    msg: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    // Extract data from form
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      await syncUser()
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      setStatus({
        type: "success",
        msg: data.message,
      });

      setTimeout(() => {
        if (data.requireMFA) {
          router.push(`/verify-otp`);
        } else {
          router.push("/dashboard");
        }
      }, 800);

    } catch (error: any) {
      setStatus({
        type: "error",
        msg: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your account."
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <StatusAlert
          status={status?.type || null}
          message={status?.msg || ""}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email" // Added name for FormData
                type="email"
                placeholder="name@example.com"
                className="pl-10 h-11 border-slate-200 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                name="password" // Added name for FormData
                type="password"
                className="pl-10 h-11 border-slate-200 focus:border-emerald-500"
                required
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-lg active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* ... divider and Google button stay the same ... */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
            <span className="bg-white px-4 text-slate-400">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full h-11 border-slate-200 hover:bg-slate-50 transition-colors"
          disabled={isLoading}
        >
          {/* Google SVG code here */}
          Google
        </Button>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-slate-900 hover:underline underline-offset-4 decoration-emerald-500"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}