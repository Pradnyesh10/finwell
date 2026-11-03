"use client";

import { useEffect, useState } from "react";
import { Upload, FileSpreadsheet, ImagePlus, RotateCcw, Download, Trash2 } from "lucide-react";
import { importOrdersCSV, importProductsCSV, resetBusinessData } from "@/lib/business-store";
import { readImageAsDataURL } from "@/components/business/shared";

interface BillPhoto { id: string; name: string; image: string; note: string; date: string }
const BILLS_KEY = "finwell.biz.bills.v1";

function loadBills(): BillPhoto[] {
  try { return JSON.parse(localStorage.getItem(BILLS_KEY) ?? "[]"); } catch { return []; }
}
function saveBills(b: BillPhoto[]) {
  try { localStorage.setItem(BILLS_KEY, JSON.stringify(b)); } catch { alert("Browser storage is full."); }
}

export default function ImportPage() {
  const [log, setLog] = useState<string[]>([]);
  const [bills, setBills] = useState<BillPhoto[]>([]);
  useEffect(() => setBills(loadBills()), []);

  const push = (m: string) => setLog(l => [`${new Date().toLocaleTimeString("en-IN")} — ${m}`, ...l]);

  const onCSV = async (kind: "orders" | "products", files: FileList | null) => {
    for (const f of Array.from(files ?? [])) {
      const n = kind === "orders" ? importOrdersCSV(await f.text()) : importProductsCSV(await f.text());
      push(`${f.name}: imported ${n} ${kind}`);
    }
  };

  const onBills = async (files: FileList | null) => {
    const added: BillPhoto[] = [];
    for (const f of Array.from(files ?? [])) {
      added.push({ id: `${Date.now()}${f.name}`, name: f.name, image: await readImageAsDataURL(f, 900), note: "", date: new Date().toISOString() });
    }
    const next = [...added, ...bills];
    setBills(next);
    saveBills(next);
    push(`Uploaded ${added.length} bill photo(s)`);
  };

  const updateBill = (id: string, note: string) => {
    const next = bills.map(b => (b.id === id ? { ...b, note } : b));
    setBills(next);
    saveBills(next);
  };

  const cards = [
    { kind: "orders" as const, title: "Orders / sales CSV", hint: "Columns: order, date, customer, channel, product, quantity, total, payment, fulfillment — or a Shopify orders export.", sample: "/samples/orders.csv" },
    { kind: "products" as const, title: "Products / inventory CSV", hint: "Columns: title, sku, category, price, cost, inventory, status — or a Shopify products export.", sample: "/samples/products.csv" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Upload className="h-6 w-6" /> Import business data</h1>
          <p className="text-muted-foreground text-sm mt-1">Bring the data you already have — CSV exports from Excel, Shopify or your POS, and photos of bills.</p>
        </div>
        <button
          onClick={() => { if (confirm("Reset orders & products to demo data?")) { resetBusinessData(); push("Reset to demo data"); } }}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" /> Reset demo data
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map(c => (
          <label
            key={c.kind}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); onCSV(c.kind, e.dataTransfer.files); }}
            className="glass-card p-6 border-dashed border-2 cursor-pointer hover:border-primary transition flex flex-col items-center text-center gap-3"
          >
            <FileSpreadsheet className="h-10 w-10 text-emerald-400" />
            <p className="font-semibold">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.hint}</p>
            <span className="rounded-lg bg-white text-black px-3 py-1.5 text-sm font-semibold">Choose or drop CSV</span>
            <a href={c.sample} download onClick={e => e.stopPropagation()} className="text-xs text-primary flex items-center gap-1">
              <Download className="h-3 w-3" /> Download sample
            </a>
            <input type="file" accept=".csv" multiple hidden onChange={e => { onCSV(c.kind, e.target.files); e.target.value = ""; }} />
          </label>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold flex items-center gap-2"><ImagePlus className="h-5 w-5 text-primary" /> Bills, invoices &amp; register photos</h2>
            <p className="text-xs text-muted-foreground">Snap supplier invoices or handwritten registers and keep them with your records.</p>
          </div>
          <label className="rounded-lg bg-white text-black px-3 py-1.5 text-sm font-semibold cursor-pointer">
            Upload photos
            <input type="file" accept="image/*" multiple capture="environment" hidden onChange={e => { onBills(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bills.map(b => (
              <div key={b.id} className="rounded-lg border border-[var(--border)] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.name} className="h-36 w-full object-cover" />
                <div className="p-2 space-y-1">
                  <input value={b.note} onChange={e => updateBill(b.id, e.target.value)} placeholder="Note / amount" className="w-full bg-transparent text-xs outline-none border-b border-[var(--border)]" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span className="truncate">{b.name}</span>
                    <button onClick={() => { const next = bills.filter(x => x.id !== b.id); setBills(next); saveBills(next); }}><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {log.length > 0 && (
        <div className="glass-card p-4 text-sm space-y-1">
          {log.map((l, i) => <p key={i} className="text-emerald-400">{l}</p>)}
        </div>
      )}
    </div>
  );
}
