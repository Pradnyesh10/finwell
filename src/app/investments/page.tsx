'use client';

import { ShieldCheck, TrendingUp, Zap, AlertCircle, ArrowUpRight, Award, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { predictROI } from '@/lib/ml/engine';
import { useState, useEffect } from 'react';

export default function InvestmentsPage() {
  const [predictions, setPredictions] = useState<ReturnType<typeof predictROI> | null>(null);

  useEffect(() => {
    // Simulate model loading
    const timer = setTimeout(() => {
      setPredictions(predictROI(['Mid-Cap IT Sector', 'Renewable Energy ETF', 'Dividend Yield Fund']));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const emergencyFunds = [
    { name: 'Liquid Mutual Funds', amount: '₹1,50,000', return: '6.5%', risk: 'Low', instantWithdrawal: true },
    { name: 'Sweep-in FD', amount: '₹1,00,000', return: '7.1%', risk: 'Very Low', instantWithdrawal: true },
    { name: 'Treasury Bills', amount: '₹50,000', return: '6.8%', risk: 'Risk-Free', instantWithdrawal: false },
  ];

  const wealthAssets = [
    { name: 'NIFTY 50 Index', type: 'ETF', roi: '14.5%', risk: 'Moderate', allocation: '40%', confidence: 92 },
    { name: 'Tech Growth Fund', type: 'Mutual Fund', roi: '18.2%', risk: 'High', allocation: '25%', confidence: 85 },
    { name: 'Sovereign Gold Bonds', type: 'Commodity', roi: '10.5%', risk: 'Low', allocation: '15%', confidence: 95 },
    { name: 'Bitcoin (BTC)', type: 'Crypto', roi: '45.0%', risk: 'Very High', allocation: '5%', confidence: 60 },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Investments</h1>
        <p className="text-muted-foreground mt-1">AI-driven wealth creation and emergency fund management.</p>
      </div>

      {/* Section A: Emergency Fund Smart Liquidity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            Section A: Emergency Fund Allocation
          </h2>
          
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border-warning/30 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <div>
              <p className="text-sm font-medium text-warning">Coverage: 4.5 Months</p>
              <p className="text-xs text-muted-foreground">Goal: 6 months. Urgent: Add ₹1L to reach safe zone.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyFunds.map((fund, i) => (
            <div key={i} className="glass-card p-5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{fund.name}</h3>
                {fund.instantWithdrawal && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30">
                    Withdraw Anytime
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold mb-4">{fund.amount}</p>
              <div className="flex justify-between items-center text-sm border-t border-[var(--border)] pt-3">
                <span className="text-muted-foreground">Expected Return: <span className="text-success font-medium">{fund.return}</span></span>
                <span className="text-muted-foreground">Risk: <span className="text-foreground">{fund.risk}</span></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ML ROI Prediction ENGINE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            ML ROI Prediction Engine
            <span className="text-xs font-normal text-muted-foreground ml-2 px-2 py-1 rounded-md bg-background/50 border">Trained on 5Y Data</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {!predictions ? (
            [1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 h-48 border-[var(--border)] animate-pulse flex items-center justify-center">
                <Zap className="h-6 w-6 text-warning/20 animate-bounce" />
              </div>
            ))
          ) : (
            predictions.map((pred, idx) => (
              <div key={pred.asset} className={cn(
                "glass-card p-5 border relative overflow-hidden transition-all hover:border-warning/50",
                idx === 0 ? "border-warning/50 bg-warning/5" : "border-[var(--border)]"
              )}>
                {idx === 0 && (
                  <div className="absolute top-0 right-0 p-3">
                    <Award className="h-10 w-10 text-warning opacity-20" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                    idx === 0 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {idx === 0 ? 'Top Predicted ROI' : idx === 1 ? 'Runner Up' : 'Stable Long Term Pick'}
                  </h4>
                </div>
                
                <h3 className="text-xl font-bold mb-1">{pred.asset}</h3>
                <p className="text-2xl font-bold text-success mb-2 flex items-center gap-1">
                  <ArrowUpRight className="h-5 w-5" /> +{pred.expectedROI}%
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-[var(--border)] pt-2 mt-2">
                  <span className="flex items-center gap-1">
                    <Info size={12} />
                    {pred.algorithm}
                  </span>
                  <span className="font-medium">Confidence: {pred.confidence}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section B: Wealth Creation Engine */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Section B: Wealth Creation Engine
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wealthAssets.map((asset, i) => (
            <div key={i} className="glass-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{asset.type}</span>
                <span className="text-xs px-2 py-0.5 rounded border border-[var(--border)] bg-background/50">
                  {asset.allocation} Alloc.
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-4">{asset.name}</h3>
              
              <div className="space-y-2 text-sm border-t border-[var(--border)] pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected ROI</span>
                  <span className="font-bold text-success">{asset.roi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Level</span>
                  <span className={cn(
                    "font-medium",
                    asset.risk.includes('High') ? "text-danger" : asset.risk.includes('Low') ? "text-success" : "text-warning"
                  )}>{asset.risk}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Confidence</span>
                  <span className="font-medium flex items-center gap-1">
                    {asset.confidence}%
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden ml-1">
                      <div className="h-full bg-primary" style={{ width: `${asset.confidence}%` }} />
                    </div>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

