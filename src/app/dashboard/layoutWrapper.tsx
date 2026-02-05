"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";

export function ClientAuthWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      console.log(user);
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return <>{children}</>;
}
