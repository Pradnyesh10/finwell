'use client';

import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { getTransactions, calculateFinancialSnapshot, subscribeToDataChange, formatCurrency } from '@/lib/finance-store';
import { classifyRisk } from '@/lib/ml/engine';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  subtitle?: string;
  className?: string;
  valueClassName?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  subtitle,
  className,
  valueClassName
}: MetricCardProps) {
  return (
    <div className={cn("glass-card p-6 flex flex-col gap-2 relative overflow-hidden group hover:border-primary/50 transition-colors", className)}>
      <div className="absolute right-2 bottom-2 text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none">
        <Icon size={80} className="h-20 w-20" />
      </div>
      <div className="flex justify-between items-start relative z-10">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 rounded-lg bg-background/50 border border-[var(--border)]">
          <Icon size={16} className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="relative z-10 mt-2">
        <h2 className={cn("text-3xl font-bold tracking-tight text-foreground", valueClassName)}>{value}</h2>
        
        <div className="flex items-center gap-2 mt-2">
          {change && (
            <span className={cn(
              "text-xs font-medium flex items-center px-1.5 py-0.5 rounded-full bg-background/50 border",
              changeType === 'positive' && "text-success border-success/20",
              changeType === 'negative' && "text-danger border-danger/20",
              changeType === 'neutral' && "text-warning border-warning/20",
            )}>
              {changeType === 'positive' && <ArrowUpRight className="h-3 w-3 mr-1" />}
              {changeType === 'negative' && <ArrowDownRight className="h-3 w-3 mr-1" />}
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardMetrics() {
  const [snapshot, setSnapshot] = useState<ReturnType<typeof calculateFinancialSnapshot> | null>(null);
  const [risk, setRisk] = useState<ReturnType<typeof classifyRisk> | null>(null);

  const updateData = useCallback(() => {
    const transactions = getTransactions();
    const snap = calculateFinancialSnapshot(transactions);
    setSnapshot(snap);
    setRisk(classifyRisk(snap));
  }, []);

  useEffect(() => {
    updateData();
    return subscribeToDataChange(updateData);
  }, [updateData]);

  if (!snapshot || !risk) return null;

  const emiRatio = Math.round((snapshot.totalEMI / Math.max(snapshot.monthlyIncome, 1)) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <MetricCard
        title="Monthly Income"
        value={formatCurrency(snapshot.monthlyIncome)}
        change="+5.2%"
        changeType="positive"
        subtitle="Current month"
        icon={Wallet}
        className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2"
        valueClassName="neon-text-green"
      />
      <MetricCard
        title="Monthly Expense"
        value={formatCurrency(snapshot.monthlyExpenses)}
        change={snapshot.monthlyExpenses > snapshot.monthlyIncome ? "Over budget" : "Healthy"}
        changeType={snapshot.monthlyExpenses > snapshot.monthlyIncome ? "negative" : "positive"}
        subtitle="Current month"
        icon={ArrowDownRight}
        className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2"
      />
      <MetricCard
        title="EMI Burden"
        value={`${emiRatio}%`}
        change={emiRatio > 45 ? "Dangerous" : emiRatio > 25 ? "Moderate" : "Safe"}
        changeType={emiRatio > 45 ? "negative" : emiRatio > 25 ? "neutral" : "positive"}
        subtitle={formatCurrency(snapshot.totalEMI)}
        icon={AlertTriangle}
        className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2"
      />
      <MetricCard
        title="Investment Growth"
        value="₹4,50,000"
        change="+12.4%"
        changeType="positive"
        subtitle="Portfolio value"
        icon={TrendingUp}
        className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2"
      />
      <MetricCard
        title="Emergency Fund"
        value={`${snapshot.liquidityMonths.toFixed(1)} Months`}
        change={snapshot.liquidityMonths < 6 ? "Critical" : "Healthy"}
        changeType={snapshot.liquidityMonths < 6 ? "negative" : "positive"}
        subtitle="Liquid reserve coverage"
        icon={ShieldCheck}
        className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2"
      />
      <MetricCard
        title="Stress Risk Score"
        value={risk.level}
        change={risk.topRiskFactor}
        changeType={risk.level === 'Danger' ? 'negative' : risk.level === 'Attention' ? 'neutral' : 'positive'}
        subtitle={`ML: ${risk.algorithm}`}
        icon={Activity}
        className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2"
      />
    </div>
  );
}

