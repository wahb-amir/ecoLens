"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// 1. Move the logic into a internal component
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token || !uid) {
      toast.error("Invalid or expired reset link. Please try again.");
      router.push("/forgot-password");
    }
  }, [token, uid, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters long");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        body: JSON.stringify({
          userId: uid,
          recoveryToken: token,
          newPassword: formData.password,
          email: email,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully!");
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 1500);
      } else {
        toast.error(
          data.error || "Failed to reset password. Link may be expired.",
        );
        setIsLoading(false);
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle={`Set a new secure password ${email ? `for ${email}` : ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="pl-10 pr-10 h-11"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              className="pl-10 h-11"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
          </div>
        </div>

        {formData.password && (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 p-2 rounded-md">
            <CheckCircle2 className="h-3 w-3" />
            Password meets security requirements
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all"
          disabled={isLoading || !formData.password}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              Updating Password...
            </div>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

// 2. Export the page wrapped in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
