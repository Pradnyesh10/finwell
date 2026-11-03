'use client';

import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { predictStress, FinancialSnapshot } from '@/lib/ml/engine';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const [mood, setMood] = useState<{ level: string; color: string }>({ level: 'Analyzing...', color: 'text-muted-foreground' });

  // Simulated live data snapshot
  const snapshot: FinancialSnapshot = {
    monthlyIncome: 125000,
    monthlyExpenses: 68400,
    totalEMI: 54000,
    savingsRate: 0.15,
    liquidityMonths: 2.5
  };

  useEffect(() => {
    const prediction = predictStress(snapshot);
    if (prediction.level === 'Calm') {
      setMood({ level: 'Stable & Growing', color: 'text-success' });
    } else if (prediction.level === 'Pressure Building') {
      setMood({ level: 'Stable', color: 'text-success' });
    } else {
      setMood({ level: 'Warning: High Stress', color: 'text-danger' });
    }
  }, []);

  return (
    <div className="glass-card p-6 mb-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Pradnyesh</h1>
            <Sparkles className="h-6 w-6 text-warning" />
          </div>
          <p className="text-muted-foreground">Here is your AI-powered financial overview for this month.</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-background/40 backdrop-blur-md p-4 rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-3 pr-4 border-r border-[var(--border)]">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Worth</p>
              <p className="text-xl font-bold">₹14,50,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mood.color.includes('success') ? "bg-success/20 text-success" : "bg-danger/20 text-danger")}>
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI Mood Indicator</p>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", mood.color.includes('success') ? "bg-success" : "bg-danger")}></span>
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", mood.color.includes('success') ? "bg-success" : "bg-danger")}></span>
                </span>
                <p className={cn("text-sm font-semibold", mood.color)}>{mood.level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

