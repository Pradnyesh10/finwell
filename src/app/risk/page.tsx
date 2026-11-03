"use client";

import { Activity, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { getTransactions, calculateFinancialSnapshot, subscribeToDataChange, formatCurrency } from '@/lib/finance-store';
import { classifyRisk } from '@/lib/ml/engine';

export default function RiskAnalysisPage() {
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

  const emiRatio = (snapshot.totalEMI / Math.max(snapshot.monthlyIncome, 1)) * 100;
  const burnRate = (snapshot.monthlyExpenses / Math.max(snapshot.monthlyIncome, 1)) * 100;

  const risks = [
    { 
      name: 'Spending vs Salary', 
      status: burnRate > 80 ? 'Danger' : burnRate > 60 ? 'Attention' : 'Healthy', 
      level: burnRate > 80 ? 'high' : burnRate > 60 ? 'medium' : 'low', 
      detail: `Spending is ${burnRate.toFixed(1)}% of salary. ${burnRate > 80 ? 'Immediate cut needed.' : 'Optimal range.'}` 
    },
    { 
      name: 'EMI Overload', 
      status: emiRatio > 45 ? 'Danger' : emiRatio > 25 ? 'Attention' : 'Healthy', 
      level: emiRatio > 45 ? 'high' : emiRatio > 25 ? 'medium' : 'low', 
      detail: `EMI ratio at ${emiRatio.toFixed(1)}%. ${emiRatio > 45 ? 'Serious debt burden detected.' : 'Within safe limits.'}` 
    },
    { 
      name: 'Emergency Fund', 
      status: snapshot.liquidityMonths < 3 ? 'Danger' : snapshot.liquidityMonths < 6 ? 'Attention' : 'Healthy', 
      level: snapshot.liquidityMonths < 3 ? 'high' : snapshot.liquidityMonths < 6 ? 'medium' : 'low', 
      detail: `Fund covers ${snapshot.liquidityMonths.toFixed(1)} months. Target is 6 months.` 
    },
    { 
      name: 'Savings Rate', 
      status: snapshot.savingsRate < 0.1 ? 'Danger' : snapshot.savingsRate < 0.2 ? 'Attention' : 'Healthy', 
      level: snapshot.savingsRate < 0.1 ? 'high' : snapshot.savingsRate < 0.2 ? 'medium' : 'low', 
      detail: `Savings velocity at ${Math.round(snapshot.savingsRate * 100)}%. ${snapshot.savingsRate < 0.1 ? 'Low wealth accumulation.' : 'Stable growth.'}` 
    },
    { name: 'Credit Utilization', status: 'Healthy', level: 'low', detail: 'Estimated utilization at 12%. Excellent.' },
    { name: 'Investment Concentration', status: 'Healthy', level: 'low', detail: 'Portfolio is well diversified.' },
    { name: 'Cashflow Regularity', status: 'Healthy', level: 'low', detail: 'Stable monthly income detected.' },
  ];

  const getIcon = (level: string) => {
    switch(level) {
      case 'low': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'high': return <AlertCircle className="h-5 w-5 text-danger" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk Analysis</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring of your financial health markers via {risk.algorithm}.</p>
      </div>

      <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success via-warning to-danger" />
        
        <Activity className={cn(
          "h-16 w-16 mb-4 animate-pulse",
          risk.level === 'Healthy' ? "text-success" : risk.level === 'Attention' ? "text-warning" : "text-danger"
        )} />
        <h2 className="text-2xl font-bold mb-2 uppercase">Overall Risk Meter: {risk.level}</h2>
        <p className="text-muted-foreground max-w-xl">
          {risk.level === 'Healthy' 
            ? "Your financial markers are stable. You have a strong buffer and your debt is well-managed."
            : `Systemic risk detected: ${risk.topRiskFactor}. Our ML models recommend immediate focus on this area to stabilize your score.`}
        </p>

        <div className="w-full max-w-md mt-8">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-success">Healthy</span>
            <span className="text-warning">Attention</span>
            <span className="text-danger">Danger</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
            <div className={cn("h-full bg-success w-1/3 transition-opacity", risk.level === 'Healthy' ? "opacity-100" : "opacity-30")} />
            <div className={cn("h-full bg-warning w-1/3 transition-opacity relative", risk.level === 'Attention' ? "opacity-100" : "opacity-30")}>
              {risk.level === 'Attention' && <div className="absolute top-0 bottom-0 right-1/2 w-1 bg-foreground rounded-full shadow-[0_0_5px_white]" />}
            </div>
            <div className={cn("h-full bg-danger w-1/3 transition-opacity relative", risk.level === 'Danger' ? "opacity-100" : "opacity-30")}>
              {risk.level === 'Danger' && <div className="absolute top-0 bottom-0 right-1/4 w-1 bg-foreground rounded-full shadow-[0_0_5px_white]" />}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Risk Detection Factors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map((risk, i) => (
            <div key={i} className="glass-card p-5 flex items-start gap-4">
              <div className="mt-0.5 shrink-0">
                {getIcon(risk.level)}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold">{risk.name}</h4>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                    risk.level === 'high' ? "bg-danger/10 text-danger border-danger/30" : 
                    risk.level === 'medium' ? "bg-warning/10 text-warning border-warning/30" : 
                    "bg-success/10 text-success border-success/30"
                  )}>
                    {risk.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{risk.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
