'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Recycle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
       {!isLandingPage && (
        <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))]/40 bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Recycle className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                EcoLens
              </h1>
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </header>
      )}
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
