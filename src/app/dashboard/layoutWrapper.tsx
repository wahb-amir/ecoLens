"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";

export function ClientAuthWrapper({ children }: { children: ReactNode }) {
  // 1. Destructure refreshTokens from your AuthProvider
  const { user, loading, refreshTokens } = useAuth();
  const router = useRouter();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!user && !loading) {
      router.replace("/login");
    }
  }, [user, router, loading]);
  useEffect(() => {
    if (!user) return;

    // 10 minutes in milliseconds
    const TEN_MINUTES_MS = 10 * 60 * 1000; 

    const intervalId = setInterval(async () => {
      console.log("Rotating access token...");
      
      const success = await refreshTokens();
      if (!success) {
        console.error("Token rotation failed, redirecting to login...");
        router.replace("/login");
      }
    }, TEN_MINUTES_MS);
    return () => clearInterval(intervalId);
  }, [user, refreshTokens, router]);

  if (!user && !loading) return null;

  return <>{children}</>;
}