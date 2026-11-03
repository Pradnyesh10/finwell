"use client";

import { Users } from "lucide-react";
import { calculateBusinessSnapshot } from "@/lib/business-store";
import { formatCurrency } from "@/lib/finance-store";
import { timeLabel, useBusinessData } from "@/components/business/shared";

export default function CustomersPage() {
  const data = useBusinessData();
  if (!data) return null;
  const { customers } = calculateBusinessSnapshot(data.orders, data.products);
  const repeat = customers.filter(c => c.orders > 1).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> Customers</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Customers", customers.length],
          ["Repeat customers", `${repeat} (${customers.length ? Math.round((repeat / customers.length) * 100) : 0}%)`],
          ["Lifetime revenue", formatCurrency(customers.reduce((s, c) => s + c.spent, 0))],
        ].map(([l, v]) => (
          <div key={l as string} className="glass-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{l}</p>
            <p className="text-xl font-bold mt-1">{v}</p>
          </div>
        ))}
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left bg-white/5">
            <tr>{["Customer", "Orders", "Amount spent", "Last order"].map(h => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.name} className="border-t border-[var(--border)] hover:bg-white/5">
                <td className="px-4 py-2.5 font-medium flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                    {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  {c.name}
                </td>
                <td className="px-4 py-2.5">{c.orders}</td>
                <td className="px-4 py-2.5">{formatCurrency(c.spent)}</td>
                <td className="px-4 py-2.5">{timeLabel(c.last)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
