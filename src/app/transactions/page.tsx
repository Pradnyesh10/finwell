"use client";

import { useMemo, useState } from "react";
import { Search, Download, Plus, RefreshCw, Tag, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  getTransactions,
  saveTransactions,
  type TransactionRecord,
} from "@/lib/finance-store";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>(getTransactions);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Income" | "Expense">("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "Expense" as "Income" | "Expense",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    mode: "UPI",
    isRecurring: false,
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesQuery =
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "All" || t.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [transactions, query, typeFilter]);

  const resetForm = () =>
    setForm({
      name: "",
      type: "Expense",
      category: "",
      date: new Date().toISOString().slice(0, 10),
      amount: "",
      mode: "UPI",
      isRecurring: false,
    });

  const upsertTransaction = () => {
    if (!form.name || !form.category || !form.amount) return;
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) return;

    const nextRecord: TransactionRecord = {
      id: editingId ?? Date.now().toString(),
      name: form.name,
      type: form.type,
      category: form.category,
      date: form.date,
      amount,
      mode: form.mode,
      status: "Completed",
      isRecurring: form.isRecurring,
    };

    const nextTransactions = editingId
      ? transactions.map((t) => (t.id === editingId ? nextRecord : t))
      : [nextRecord, ...transactions];

    setTransactions(nextTransactions);
    saveTransactions(nextTransactions);
    setEditingId(null);
    resetForm();
  };

  const startEdit = (record: TransactionRecord) => {
    setEditingId(record.id);
    setForm({
      name: record.name,
      type: record.type,
      category: record.category,
      date: record.date,
      amount: String(record.amount),
      mode: record.mode,
      isRecurring: record.isRecurring,
    });
  };

  const deleteTransaction = (id: string) => {
    const nextTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(nextTransactions);
    saveTransactions(nextTransactions);
  };

  const exportCsv = () => {
    const rows = [
      ["Name", "Type", "Category", "Date", "Amount", "Payment Mode", "Status"],
      ...filteredTransactions.map((t) => [
        t.name,
        t.type,
        t.category,
        t.date,
        String(t.amount),
        t.mode,
        t.status,
      ]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your income and expenses.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card p-6 border-primary/20 bg-primary/5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {editingId ? "Edit Transaction" : "Add New Transaction"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
          <div className="space-y-1.5 xl:col-span-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Transaction Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Netflix, Salary" className="w-full bg-background border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:border-primary outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "Income" | "Expense" })} className="w-full bg-background border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:border-primary outline-none">
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Food, EMI, Rent" className="w-full bg-background border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:border-primary outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Amount</label>
            <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" min="0" placeholder="0.00" className="w-full bg-background border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:border-primary outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Payment Mode</label>
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="w-full bg-background border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:border-primary outline-none">
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Auto Debit">Auto Debit</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase">Date</label>
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="w-full bg-background border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:border-primary outline-none" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={upsertTransaction}
              className="flex-1 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              {editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button
                onClick={() => { setEditingId(null); resetForm(); }}
                className="px-4 py-2 bg-muted rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-4 justify-between items-center bg-background/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-background border border-[var(--border)] rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "All" | "Income" | "Expense")}
            className="bg-background border border-[var(--border)] rounded-md px-3 py-2 text-sm"
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium">Payment Mode</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {t.name}
                      {t.isRecurring && (
                        <span className="group relative flex items-center justify-center cursor-help">
                          <RefreshCw className="h-3 w-3 text-primary" />
                          <span className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap bg-background border text-xs px-2 py-1 rounded">Auto-recurring bill</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1 rounded-full w-fit">
                      <Tag className="h-3 w-3" /> {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{t.date}</td>
                  <td className={cn(
                    "px-6 py-4 text-right font-semibold whitespace-nowrap",
                    t.type === 'Income' ? 'text-success' : 'text-foreground'
                  )}>
                    {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{t.mode}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-2 py-4">
                    <button onClick={() => startEdit(t)} className="p-2 hover:bg-muted rounded-md">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteTransaction(t.id)} className="p-2 hover:bg-danger/10 rounded-md text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm text-muted-foreground bg-background/50">
          <span>Showing {filteredTransactions.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-[var(--border)] rounded bg-background hover:bg-muted disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-[var(--border)] rounded bg-primary text-primary-foreground hover:bg-primary/90">1</button>
            <button className="px-3 py-1 border border-[var(--border)] rounded bg-background hover:bg-muted disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
