"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";

export function ClientAuthWrapper({ children }: { children: ReactNode }) {
  const { user,loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      // router.replace("/login");
    }
  }, [user, router,loading]);

  if (!user && !loading) return null;

  return <>{children}</>;
}
