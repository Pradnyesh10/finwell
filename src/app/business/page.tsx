"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Sparkles, Mic, ArrowRight, Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import { businessProfile, calculateBusinessSnapshot, payables, receivables } from "@/lib/business-store";
import { formatCurrency } from "@/lib/finance-store";
import { getSession } from "@/lib/session";
import { StatusPill, timeLabel, useBusinessData } from "@/components/business/shared";
import { cn } from "@/lib/utils";

const compact = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`);

export default function BusinessHome() {
  const data = useBusinessData();
  const router = useRouter();
  const [q, setQ] = useState("");
  if (!data) return null;

  const b = calculateBusinessSnapshot(data.orders, data.products);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = getSession()?.name.split(" ")[0] ?? "";
  const ask = (question: string) => router.push(`/copilot?q=${encodeURIComponent(question)}`);

  const kpis = [
    { label: "Sessions", value: b.sessions.toLocaleString("en-IN") },
    { label: "Total sales", value: compact(b.totalSales) },
    { label: "Orders", value: b.orderCount },
    { label: "Conversion rate", value: `${(b.conversionRate * 100).toFixed(2)}%` },
    { label: "Avg order value", value: formatCurrency(Math.round(b.avgOrderValue)) },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-10">
      <div className="glass-card px-5 py-4 flex flex-wrap items-center gap-x-10 gap-y-3">
        <span className="text-sm text-muted-foreground">Last 30 days · All channels</span>
        {kpis.map(k => (
          <div key={k.label} className="text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="font-bold">{k.value}</p>
          </div>
        ))}
        <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          {businessProfile.name} <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </span>
      </div>

      <div className="text-center space-y-1 pt-4">
        <h1 className="text-3xl font-bold">{greeting}{name && `, ${name}`}!</h1>
        <h2 className="text-3xl font-bold">Let&apos;s continue growing your business.</h2>
      </div>

      <form
        onSubmit={e => { e.preventDefault(); if (q.trim()) ask(q); }}
        className="glass-card mx-auto w-full max-w-2xl p-4 space-y-3"
      >
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Ask your AI business assistant… e.g. How were sales this week?"
          className="w-full bg-transparent text-sm outline-none"
        />
        <div className="flex items-center justify-between">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <div className="flex items-center gap-3 text-muted-foreground">
            <Link href="/copilot" title="Ask by voice" className="hover:text-foreground"><Mic className="h-5 w-5" /></Link>
            <button type="submit" className="hover:text-foreground"><ArrowRight className="h-5 w-5" /></button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap justify-center gap-3 -mt-4">
        <Link href="/business/orders?filter=unfulfilled" className="glass-card px-4 py-2 text-sm font-medium hover:bg-white/5">
          Fulfill orders <span className="ml-2 rounded-md bg-white/10 px-2 py-0.5">{b.toFulfill}</span>
        </Link>
        <Link href="/business/orders?filter=pending" className="glass-card px-4 py-2 text-sm font-medium hover:bg-white/5">
          Capture payments <span className="ml-2 rounded-md bg-white/10 px-2 py-0.5">{b.toCapture}</span>
        </Link>
        {["Summarise my business this month", "Who are my best customers?"].map(s => (
          <button key={s} onClick={() => ask(s)} className="glass-card px-4 py-2 text-sm text-emerald-300 hover:bg-white/5">
            ✦ {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400" /> Sales over time</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={b.daily}>
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={4} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={compact} axisLine={false} tickLine={false} width={50} />
                <Tooltip formatter={v => formatCurrency(Number(v))} contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fill="url(#sales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Money</h3>
          {[
            ["Cash in bank", b.cashInBank, ""],
            ["Gross profit (30d)", b.grossProfit, `${(b.grossMarginPct * 100).toFixed(0)}% margin`],
            ["Operating expenses", b.operatingExpenses, "monthly"],
            ["Net profit (30d)", b.netProfit, ""],
          ].map(([label, value, note]) => (
            <div key={label as string} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn("font-semibold", label === "Net profit (30d)" && ((value as number) >= 0 ? "text-emerald-400" : "text-red-400"))}>
                {formatCurrency(value as number)} {note && <span className="text-xs text-muted-foreground font-normal">{note}</span>}
              </span>
            </div>
          ))}
          <div className="border-t border-[var(--border)] pt-3 space-y-2 text-sm">
            <p className="flex items-center gap-2 font-medium"><ArrowUpCircle className="h-4 w-4 text-red-400" /> You owe {formatCurrency(b.totalPayables)}</p>
            {payables.map(p => <p key={p.supplier} className="text-xs text-muted-foreground pl-6">{p.supplier} · due in {p.dueInDays}d</p>)}
            <p className="flex items-center gap-2 font-medium"><ArrowDownCircle className="h-4 w-4 text-emerald-400" /> Owed to you {formatCurrency(b.totalReceivables)}</p>
            {receivables.map(r => <p key={r.customer} className="text-xs text-muted-foreground pl-6">{r.customer} · {r.overdueDays}d overdue</p>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Recent orders</h3>
            <Link href="/business/orders" className="text-sm text-primary">View all</Link>
          </div>
          <div className="space-y-3">
            {data.orders.slice(0, 6).map(o => (
              <div key={o.id} className="flex items-center justify-between text-sm gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{o.id} · {o.customer}</p>
                  <p className="text-xs text-muted-foreground">{timeLabel(o.date)} · {o.channel}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={o.payment === "Paid" ? o.fulfillment : o.payment} />
                  <span className="font-semibold w-20 text-right">{formatCurrency(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Top products by sales</h3>
            <Link href="/business/products" className="text-sm text-primary">Manage</Link>
          </div>
          <div className="space-y-3">
            {b.topProducts.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 text-sm">
                <div className="h-9 w-9 rounded-md bg-white/10 overflow-hidden shrink-0 flex items-center justify-center text-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : p.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.unitsSold30d} sold</p>
                </div>
                <span className="font-semibold">{formatCurrency(p.revenue30d)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
