"use client";

import { AlertTriangle, Info, ShieldAlert, BadgeInfo, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { getTransactions, calculateFinancialSnapshot, subscribeToDataChange, formatCurrency } from '@/lib/finance-store';

export default function LoansPage() {
  const [snapshot, setSnapshot] = useState<ReturnType<typeof calculateFinancialSnapshot> | null>(null);
  const [recentEmiPayments, setRecentEmiPayments] = useState<any[]>([]);

  const updateData = useCallback(() => {
    const transactions = getTransactions();
    setSnapshot(calculateFinancialSnapshot(transactions));
    
    // Get recent EMI/Loan payments
    const emiPayments = transactions
      .filter(t => t.category.toLowerCase().includes('emi') || t.category.toLowerCase().includes('loan'))
      .slice(0, 5);
    setRecentEmiPayments(emiPayments);
  }, []);

  useEffect(() => {
    updateData();
    return subscribeToDataChange(updateData);
  }, [updateData]);

  if (!snapshot) return null;

  const emiRatio = Math.round((snapshot.totalEMI / Math.max(snapshot.monthlyIncome, 1)) * 100);
  const riskLevel = emiRatio > 45 ? 'Danger' : emiRatio > 25 ? 'Moderate' : 'Safe';

  const loans = [
    {
      id: 1,
      name: 'Home Loan',
      balance: '₹42,50,000',
      emi: '₹35,000',
      dueDate: '5th Every Month',
      interest: '8.5%',
      tenure: '15 Years',
      suggestion: 'Consider partial prepayment of ₹2L to save ₹8L in interest.',
      type: 'secured',
    },
    {
      id: 2,
      name: 'Personal Loan',
      balance: '₹3,20,000',
      emi: '₹12,400',
      dueDate: '12th Every Month',
      interest: '14.2%',
      tenure: '3 Years',
      suggestion: 'High-interest loan. Prioritize closing this early.',
      type: 'unsecured',
    },
    {
      id: 3,
      name: 'Car Loan',
      balance: '₹6,80,000',
      emi: '₹14,500',
      dueDate: '20th Every Month',
      interest: '9.2%',
      tenure: '4 Years',
      suggestion: 'Refinance available at 8.8% to save ₹12,000.',
      type: 'secured',
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart EMI & Loans</h1>
          <p className="text-muted-foreground mt-1">Manage your debt burden and optimize interest payments.</p>
        </div>
        
        <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-4 border-primary/20">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Real-time EMI Ratio</p>
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-3xl font-black",
                riskLevel === 'Danger' ? "text-danger" : riskLevel === 'Moderate' ? "text-warning" : "text-success"
              )}>{emiRatio}%</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full border font-bold uppercase",
                riskLevel === 'Danger' ? "bg-danger/10 text-danger border-danger/30" : 
                riskLevel === 'Moderate' ? "bg-warning/10 text-warning border-warning/30" : 
                "bg-success/10 text-success border-success/30"
              )}>{riskLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 border-warning/50 bg-warning/5 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div>
            <h4 className="font-semibold text-warning">Upcoming Due Date</h4>
            <p className="text-sm text-muted-foreground">Home Loan EMI is due in 3 days. Ensure liquidity.</p>
          </div>
        </div>
        <div className="glass-card p-4 border-danger/50 bg-danger/5 flex gap-3">
          <ShieldAlert className="h-5 w-5 text-danger shrink-0" />
          <div>
            <h4 className="font-semibold text-danger">Debt Limit Warning</h4>
            <p className="text-sm text-muted-foreground">Current ratio is {emiRatio}%. Avoid new credit until debt is &lt;30%.</p>
          </div>
        </div>
        <div className="glass-card p-4 border-primary/50 bg-primary/5 flex gap-3">
          <BadgeInfo className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h4 className="font-semibold text-primary">Prepayment Plan</h4>
            <p className="text-sm text-muted-foreground">A 10% prepayment on PL can save ₹18k interest.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">Active Loans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map(loan => (
                <div key={loan.id} className="glass-card p-5 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{loan.name}</h3>
                      <p className="text-sm text-muted-foreground">Due: {loan.dueDate}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full border font-medium",
                      loan.type === 'secured' ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                    )}>
                      {loan.interest} APR
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm border-b border-[var(--border)] pb-2">
                      <span className="text-muted-foreground">Remaining Balance</span>
                      <span className="font-semibold">{loan.balance}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-[var(--border)] pb-2">
                      <span className="text-muted-foreground">Monthly EMI</span>
                      <span className="font-semibold text-danger">{loan.emi}</span>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-3 text-sm flex gap-2 items-start border border-primary/10">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-tight">
                      <strong className="text-foreground font-medium">AI Tip:</strong> {loan.suggestion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recent Payment History
            </h2>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-3">Loan/EMI Name</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentEmiPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">No recent EMI payments detected in transactions.</td>
                    </tr>
                  ) : (
                    recentEmiPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{p.date}</td>
                        <td className="px-6 py-4 text-right font-bold text-danger">-{formatCurrency(p.amount)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">Verified</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">AI Debt Reduction Plan</h2>
          <div className="glass-card p-5">
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
                <div className="relative flex items-start gap-4 mb-6">
                  <div className="bg-background border border-primary text-primary h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-[0_0_10px_rgba(59,130,246,0.3)] font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Close Personal Loan</h4>
                    <p className="text-sm text-muted-foreground mt-1">High-interest (14.2%) debt detected. Prepay ₹1.5L using annual bonus.</p>
                  </div>
                </div>
                <div className="relative flex items-start gap-4 mb-6">
                  <div className="bg-background border border-[var(--border)] text-muted-foreground h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Refinance Car Loan</h4>
                    <p className="text-sm text-muted-foreground mt-1">Market rates dropped to 8.8%. Refinance to save ₹1,200 monthly.</p>
                  </div>
                </div>
                <div className="relative flex items-start gap-4">
                  <div className="bg-background border border-[var(--border)] text-muted-foreground h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Accelerated Home Loan</h4>
                    <p className="text-sm text-muted-foreground mt-1">Add ₹5k extra to monthly EMI to close 2.5 years earlier.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
