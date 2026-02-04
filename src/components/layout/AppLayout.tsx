'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Recycle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuthProvider,useAuth } from '@/app/providers/AuthProvider';
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

/**
 * Split into inner component so we can use the hook
 */
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';


  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1">{children}</main>

      {!isLandingPage && (
        <footer className="py-6 md:px-8 md:py-0 border-t">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with passion. Saving the planet, one classification at a time.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
