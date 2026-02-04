'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Recycle } from "lucide-react";

export default function LandingHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Recycle className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">EcoLens</h1>
        </Link>
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="bg-transparent text-white border-white hover:bg-white hover:text-primary transition-colors duration-300"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </header>
  );
}
