"use client";

import { ModeToggle } from '@/components/theme-toggle';
import { Scissors } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6" />
          <span className="font-medium">ImageCraft</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}