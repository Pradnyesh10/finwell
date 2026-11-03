"use client";

import { ShieldCheck, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { useState, useEffect, useCallback } from 'react';
import { getTransactions, calculateFinancialSnapshot, subscribeToDataChange } from '@/lib/finance-store';

export default function EmergencyFundPage() {
  const [snapshot, setSnapshot] = useState<ReturnType<typeof calculateFinancialSnapshot> | null>(null);

  const updateData = useCallback(() => {
    const transactions = getTransactions();
    setSnapshot(calculateFinancialSnapshot(transactions));
  }, []);

  useEffect(() => {
    updateData();
    return subscribeToDataChange(updateData);
  }, [updateData]);

  if (!snapshot) return null;

  const coverage = snapshot.liquidityMonths;
  const targetMonths = 6;
  const isHealthy = coverage >= targetMonths;
  const gap = Math.max(0, targetMonths - coverage);
  const gapAmount = gap * snapshot.monthlyExpenses;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-success" />
          Emergency Fund Smart Allocation
        </h1>
        <p className="text-muted-foreground mt-1">Goal: Protect you during emergencies while generating optimized returns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-success/10 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Coverage</p>
            <h2 className={cn("text-5xl font-black", isHealthy ? "text-success" : "text-warning")}>
              {coverage.toFixed(1)} <span className="text-2xl font-bold text-muted-foreground">Months</span>
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span>Goal Progress</span>
              <span>{Math.min(100, Math.round((coverage / targetMonths) * 100))}%</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-[var(--border)]">
              <div 
                className={cn("h-full transition-all duration-1000", isHealthy ? "bg-success" : "bg-warning")} 
                style={{ width: `${Math.min(100, (coverage / targetMonths) * 100)}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Info size={12} /> Target: {targetMonths} Months</span>
              <span>{isHealthy ? "Safety Zone Reached" : `Shortfall: ${gap.toFixed(1)} months`}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={cn(
            "glass-card p-6 border-l-4 flex items-start gap-4",
            isHealthy ? "border-l-success bg-success/5" : "border-l-warning bg-warning/5"
          )}>
            {isHealthy ? <ShieldCheck className="h-6 w-6 text-success shrink-0" /> : <AlertTriangle className="h-6 w-6 text-warning shrink-0" />}
            <div>
              <h3 className="font-bold text-lg">{isHealthy ? "Financial Fortress Active" : "Action Required"}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isHealthy 
                  ? "Your liquid reserves are sufficient to cover 6+ months of expenses. You can now shift focus to high-growth wealth engines."
                  : `You are ${gap.toFixed(1)} months short of your safety goal. We recommend adding ₹${Math.round(gapAmount).toLocaleString()} to your liquid reserves.`}
              </p>
            </div>
          </div>

          <div className="glass-card p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-bold">ML Allocation Strategy</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on your {snapshot.monthlyExpenses > 0 ? "spending velocity" : "profile"}, our ML engine suggests allocating:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Liquid Mutual Funds (6.5%)</span> <span className="font-medium text-foreground">40%</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Sweep-in FD (7.1%)</span> <span className="font-medium text-foreground">40%</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Treasury Bills (6.8%)</span> <span className="font-medium text-foreground">20%</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

