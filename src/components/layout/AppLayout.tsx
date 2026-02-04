"use client";

import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/app/providers/AuthProvider";
import { Footer } from "../Footer";
type User = {
  id?: string;
  email?: string;
  role?: string;
} | null;

export function AppLayout({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User;
}) {
  return (
    <AuthProvider initialUser={initialUser}>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      {!isLandingPage && <Footer isLandingPage={isLandingPage} />}
    </div>
  );
}
