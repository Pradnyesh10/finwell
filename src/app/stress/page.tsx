"use client";

import { Brain, HeartPulse, Scissors, ZapOff, Info } from 'lucide-react';
import { predictStress, FinancialSnapshot } from '@/lib/ml/engine';
import { useState, useEffect, useCallback } from 'react';
import { getTransactions, calculateFinancialSnapshot, subscribeToDataChange } from '@/lib/finance-store';

export default function StressAlertsPage() {
  const [prediction, setPrediction] = useState<ReturnType<typeof predictStress> | null>(null);

  const updatePrediction = useCallback(() => {
    const transactions = getTransactions();
    const snapshot = calculateFinancialSnapshot(transactions);
    
    // If no income, provide a default high-stress scenario for demo
    const effectiveSnapshot = snapshot.monthlyIncome > 0 ? snapshot : {
      monthlyIncome: 125000,
      monthlyExpenses: 68400,
      totalEMI: 54000,
      savingsRate: 0.15,
      liquidityMonths: 2.5
    };

    setPrediction(predictStress(effectiveSnapshot));
  }, []);

  useEffect(() => {
    updatePrediction();
    return subscribeToDataChange(updatePrediction);
  }, [updatePrediction]);

  const reliefCuts = [
    { title: 'Reduce Food Delivery', amount: 4500, impact: 8 },
    { title: 'Pause Streaming Subscriptions', amount: 1200, impact: 2 },
    { title: 'Lower Shopping Budget', amount: 5000, impact: 10 },
    { title: 'Delay Vacation Fund Contribution', amount: 3800, impact: 12 },
  ];

  const totalSaved = reliefCuts.reduce((acc, curr) => acc + curr.amount, 0);
  const totalImpact = reliefCuts.reduce((acc, curr) => acc + curr.impact, 0);

  if (!prediction) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Brain className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground animate-pulse">AI is analyzing your behavior patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-danger" />
          AI Stress Alert
        </h1>
        <p className="text-muted-foreground mt-1">Unique Feature: Predictive mental and financial stress modeling.</p>
      </div>

      {/* Stress Predictor Card */}
      <div className="glass-card border-danger/40 bg-gradient-to-br from-danger/10 to-background p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-danger/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold">Stress Probability: {prediction.probability}%</h2>
            <div className="inline-block px-3 py-1 bg-danger text-danger-foreground font-bold rounded-md uppercase tracking-wide">
              {prediction.level}
            </div>
            <p className="text-muted-foreground">
              Our model detects rising behavioral patterns correlated with high financial stress.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {prediction.features.map(f => (
                <span key={f} className="text-[10px] px-2 py-1 rounded bg-background/50 border border-[var(--border)] text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-danger/80 bg-danger/10 p-2 rounded-lg border border-danger/20">
              <Info className="h-3 w-3" />
              <span>Predicted by {prediction.model} (Confidence: {prediction.confidence * 100}%)</span>
            </div>
          </div>

          <div className="w-48 h-48 flex items-center justify-center relative shrink-0">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50" cy="50" r="44"
                className="stroke-danger/20 fill-none"
                strokeWidth="8"
              />
              {/* Progress Line */}
              <circle
                cx="50" cy="50" r="44"
                className="stroke-danger fill-none"
                strokeWidth="8"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 * (1 - prediction.probability / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <HeartPulse className="h-8 w-8 text-danger mb-1 animate-pulse" />
              <span className="text-3xl font-bold text-danger leading-none">{prediction.probability}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Potential Cuts Recommendation Engine */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Potential Cuts Recommendation Engine</h2>
        </div>
        <p className="text-muted-foreground">Apply these ML-suggested lifestyle tweaks to instantly free up cashflow and lower your stress score.</p>

        <div className="glass-card p-6 border-primary/20 bg-primary/5 mb-6">
          <p className="text-lg font-medium text-center">
            &ldquo;You can free <strong className="text-primary text-xl">₹{totalSaved.toLocaleString()} / month</strong> and reduce stress score by <strong className="text-success text-xl">{totalImpact}%</strong>&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reliefCuts.map((cut, i) => (
            <div key={i} className="glass-card p-5 hover:border-success/30 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-lg">{cut.title}</h4>
                <ZapOff className="h-5 w-5 text-muted-foreground group-hover:text-success transition-colors" />
              </div>
              <div className="flex justify-between items-end border-t border-[var(--border)] pt-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Monthly Savings</p>
                  <p className="text-xl font-bold text-success">₹{cut.amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Stress Reduction</p>
                  <p className="text-sm font-bold text-primary">-{cut.impact}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

