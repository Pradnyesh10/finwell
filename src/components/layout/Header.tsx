'use client';

import { Search, Bell, Moon, Sun, MessageSquareWarning } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
// Using document fallback for theme since we aren't using next-themes yet

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[rgba(15,23,42,0.4)] px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search transactions, insights..."
            className="h-9 w-full rounded-md border border-[var(--border)] bg-background/50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Real Time Financial Score Badge */}
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-background/50 px-3 py-1.5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-semibold text-foreground">Health: 88</span>
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <MessageSquareWarning className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>

        <button 
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} className="h-5 w-5" /> : <Moon size={20} className="h-5 w-5" />}
        </button>

        <div className="h-8 w-8 overflow-hidden rounded-full border border-[var(--border)]">
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pradnyesh"
            alt="User avatar"
            width={32}
            height={32}
            unoptimized
            className="h-full w-full object-cover bg-primary/20"
          />
        </div>
      </div>
    </header>
  );
}
