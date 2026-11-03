"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox, Search, Upload, Download, Plus, X } from "lucide-react";
import { getOrders, importOrdersCSV, nextOrderId, ordersToCSV, saveOrders, type Order, type PaymentStatus, type Product } from "@/lib/business-store";
import { formatCurrency } from "@/lib/finance-store";
import { StatusPill, downloadFile, timeLabel, useBusinessData } from "@/components/business/shared";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "All" },
  { key: "unfulfilled", label: "Unfulfilled" },
  { key: "pending", label: "Payment pending" },
  { key: "fulfilled", label: "Fulfilled" },
];

export default function OrdersPage() {
  const data = useBusinessData();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("filter");
    if (f) setTab(f);
  }, []);

  if (!data) return null;
  const { orders, products } = data;
  const today = new Date().toISOString().slice(0, 10);
  const todays = orders.filter(o => o.date.slice(0, 10) === today);

  const visible = orders.filter(o => {
    if (tab === "unfulfilled" && !(o.fulfillment === "Unfulfilled" && o.payment === "Paid")) return false;
    if (tab === "pending" && o.payment !== "Payment pending") return false;
    if (tab === "fulfilled" && o.fulfillment !== "Fulfilled") return false;
    const s = search.toLowerCase();
    return !s || o.id.toLowerCase().includes(s) || o.customer.toLowerCase().includes(s) || o.channel.toLowerCase().includes(s);
  });

  const update = (id: string, patch: Partial<Order>) => saveOrders(getOrders().map(o => (o.id === id ? { ...o, ...patch } : o)));

  const onImport = async (file?: File) => {
    if (!file) return;
    const n = importOrdersCSV(await file.text());
    setNotice(`Imported ${n} orders from ${file.name}`);
  };

  const stats = [
    ["Orders today", todays.length],
    ["Items ordered", todays.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0)],
    ["Sales today", formatCurrency(todays.filter(o => o.payment === "Paid").reduce((s, o) => s + o.total, 0))],
    ["To fulfill", orders.filter(o => o.payment === "Paid" && o.fulfillment === "Unfulfilled").length],
    ["Payment pending", orders.filter(o => o.payment === "Payment pending").length],
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Inbox className="h-6 w-6" /> Orders</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => { onImport(e.target.files?.[0]); e.target.value = ""; }} />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-white/10">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <button onClick={() => downloadFile("orders.csv", ordersToCSV(orders))} className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-white/10">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg bg-white text-black px-3 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Create order
          </button>
        </div>
      </div>

      {notice && <p className="text-sm text-emerald-400">{notice}</p>}

      <div className="glass-card grid grid-cols-2 md:grid-cols-5 divide-x divide-[var(--border)]">
        {stats.map(([l, v]) => (
          <div key={l as string} className="p-4">
            <p className="text-sm font-semibold underline decoration-dotted decoration-muted-foreground underline-offset-4">{l}</p>
            <p className="text-lg mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-[var(--border)]">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("rounded-lg px-3 py-1.5 text-sm", tab === t.key ? "bg-white/15 font-semibold" : "text-muted-foreground hover:bg-white/5")}>
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search and filter" className="bg-transparent text-sm outline-none w-48" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left bg-white/5">
              <tr>
                {["Order", "Date", "Customer", "Channel", "Total", "Payment status", "Fulfillment status", "Items", "Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(o => {
                const cancelled = o.payment === "Refunded";
                return (
                  <tr key={o.id} className={cn("border-t border-[var(--border)] hover:bg-white/5", cancelled && "text-muted-foreground")}>
                    <td className={cn("px-4 py-2.5 font-semibold", cancelled && "line-through")}>{o.id}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{timeLabel(o.date)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{o.customer}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{o.channel}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-2.5"><StatusPill status={o.payment} /></td>
                    <td className="px-4 py-2.5"><StatusPill status={o.fulfillment} /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap" title={o.items.map(i => `${i.qty}× ${i.title}`).join(", ")}>
                      {o.items.reduce((s, i) => s + i.qty, 0)} item{o.items.reduce((s, i) => s + i.qty, 0) > 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap space-x-2">
                      {o.payment === "Payment pending" && (
                        <button onClick={() => update(o.id, { payment: "Paid" })} className="text-xs rounded-md bg-orange-400/20 text-orange-300 px-2 py-1">Mark paid</button>
                      )}
                      {o.payment === "Paid" && o.fulfillment === "Unfulfilled" && (
                        <button onClick={() => update(o.id, { fulfillment: "Fulfilled" })} className="text-xs rounded-md bg-yellow-400/20 text-yellow-300 px-2 py-1">Fulfill</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!visible.length && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No orders match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {creating && <CreateOrder products={products} onClose={() => setCreating(false)} />}
    </div>
  );
}

function CreateOrder({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const active = products.filter(p => p.status === "Active");
  const [customer, setCustomer] = useState("");
  const [productId, setProductId] = useState(active[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [channel, setChannel] = useState("Point of Sale");
  const [payment, setPayment] = useState<PaymentStatus>("Paid");
  const product = products.find(p => p.id === productId);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const orders = getOrders();
    orders.unshift({
      id: nextOrderId(orders),
      date: new Date().toISOString(),
      customer: customer.trim() || "No customer",
      channel,
      items: [{ productId: product.id, title: product.title, qty, price: product.price }],
      total: product.price * qty,
      payment,
      fulfillment: channel === "Point of Sale" ? "Fulfilled" : "Unfulfilled",
    });
    saveOrders(orders);
    onClose();
  };

  const field = "w-full rounded-lg border border-[var(--border)] bg-slate-900 px-3 py-2 text-sm outline-none focus:border-primary";
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={create} onClick={e => e.stopPropagation()} className="glass-card bg-slate-900 w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Create order</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <input className={field} placeholder="Customer name" value={customer} onChange={e => setCustomer(e.target.value)} />
        <select className={field} value={productId} onChange={e => setProductId(e.target.value)}>
          {active.map(p => <option key={p.id} value={p.id}>{p.title} — {formatCurrency(p.price)}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-3">
          <input className={field} type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, +e.target.value))} />
          <select className={field} value={channel} onChange={e => setChannel(e.target.value)}>
            {["Point of Sale", "Online Store", "Instagram", "Draft Orders"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select className={field} value={payment} onChange={e => setPayment(e.target.value as PaymentStatus)}>
            <option>Paid</option><option>Payment pending</option>
          </select>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="font-bold">Total: {formatCurrency((product?.price ?? 0) * qty)}</span>
          <button className="rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold">Create</button>
        </div>
      </form>
    </div>
  );
}
