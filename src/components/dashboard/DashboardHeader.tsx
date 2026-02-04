'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Star, Menu, Recycle, LogOut, Trophy } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/achievements", label: "Achievements", icon: Star },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function DashboardHeader() {
  const pathname = usePathname();
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Recycle className="h-6 w-6 text-primary" />
                <span>EcoLens</span>
            </Link>
            {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === href ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                    <Icon className="h-4 w-4" />
                    {label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {/* Can add search or other header items here */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
           </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
