"use client";

import { useRef, useState } from "react";
import { Tag, Upload, Plus, Minus, ImagePlus, Trash2, X, Search } from "lucide-react";
import { calculateBusinessSnapshot, getProducts, importProductsCSV, saveProducts, type Product } from "@/lib/business-store";
import { formatCurrency } from "@/lib/finance-store";
import { StatusPill, readImageAsDataURL, useBusinessData } from "@/components/business/shared";

export default function ProductsPage() {
  const data = useBusinessData();
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const imgTarget = useRef<string | null>(null);

  if (!data) return null;
  const b = calculateBusinessSnapshot(data.orders, data.products);
  const sold = Object.fromEntries(b.topProducts.map(p => [p.id, p.unitsSold30d]));
  const visible = data.products.filter(p => (p.title + p.sku + p.category).toLowerCase().includes(search.toLowerCase()));

  const update = (id: string, patch: Partial<Product>) => saveProducts(getProducts().map(p => (p.id === id ? { ...p, ...patch } : p)));
  const adjust = (p: Product, delta: number) => update(p.id, { inventory: Math.max(0, p.inventory + delta) });

  const onImage = async (file?: File) => {
    if (!file || !imgTarget.current) return;
    update(imgTarget.current, { image: await readImageAsDataURL(file) });
  };

  const onCSV = async (file?: File) => {
    if (!file) return;
    setNotice(`Imported ${importProductsCSV(await file.text())} products from ${file.name}`);
  };

  const inventoryValue = data.products.reduce((s, p) => s + p.inventory * p.cost, 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <input ref={imgRef} type="file" accept="image/*" hidden onChange={e => { onImage(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={csvRef} type="file" accept=".csv" hidden onChange={e => { onCSV(e.target.files?.[0]); e.target.value = ""; }} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="h-6 w-6" /> Products &amp; Inventory</h1>
        <div className="flex gap-2">
          <button onClick={() => csvRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-white/10">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg bg-white text-black px-3 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      </div>

      {notice && <p className="text-sm text-emerald-400">{notice}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Products", data.products.length],
          ["Units in stock", data.products.reduce((s, p) => s + p.inventory, 0)],
          ["Inventory value (at cost)", formatCurrency(inventoryValue)],
          ["Retail value", formatCurrency(data.products.reduce((s, p) => s + p.inventory * p.price, 0))],
        ].map(([l, v]) => (
          <div key={l as string} className="glass-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{l}</p>
            <p className="text-xl font-bold mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-[var(--border)] flex">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products" className="bg-transparent text-sm outline-none w-56" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left bg-white/5">
              <tr>
                {["", "Product", "Status", "Inventory", "Price", "Cost", "Margin", "Sold (30d)", ""].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={p.id} className="border-t border-[var(--border)] hover:bg-white/5">
                  <td className="px-4 py-2">
                    <button
                      onClick={() => { imgTarget.current = p.id; imgRef.current?.click(); }}
                      title="Upload product photo"
                      className="h-11 w-11 rounded-md border border-dashed border-[var(--border)] overflow-hidden flex items-center justify-center hover:border-primary"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.sku} · {p.category}</p>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => update(p.id, { status: p.status === "Active" ? "Draft" : "Active" })}><StatusPill status={p.status} /></button>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => adjust(p, -1)} title="Remove stock" className="rounded-md border border-[var(--border)] p-1 hover:bg-white/10"><Minus className="h-3 w-3" /></button>
                      <input
                        type="number"
                        value={p.inventory}
                        onChange={e => update(p.id, { inventory: Math.max(0, Math.round(+e.target.value)) })}
                        className="w-16 rounded-md bg-transparent border border-[var(--border)] px-2 py-1 text-center"
                      />
                      <button onClick={() => adjust(p, 1)} title="Add stock" className="rounded-md border border-[var(--border)] p-1 hover:bg-white/10"><Plus className="h-3 w-3" /></button>
                    </div>
                  </td>
                  <td className="px-4 py-2">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-2">{formatCurrency(p.cost)}</td>
                  <td className="px-4 py-2">{p.price ? Math.round(((p.price - p.cost) / p.price) * 100) : 0}%</td>
                  <td className="px-4 py-2">{sold[p.id] ?? 0}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => confirm(`Delete ${p.title}?`) && saveProducts(getProducts().filter(x => x.id !== p.id))} className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adding && <AddProduct onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddProduct({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: "", sku: "", category: "", price: "", cost: "", inventory: "" });
  const [image, setImage] = useState<string | undefined>();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    saveProducts([
      ...getProducts(),
      {
        id: `p${Date.now()}`,
        title: form.title.trim(),
        sku: form.sku || form.title.toUpperCase().replace(/\W+/g, "-").slice(0, 12),
        category: form.category || "Uncategorized",
        price: +form.price || 0,
        cost: +form.cost || 0,
        inventory: Math.round(+form.inventory) || 0,
        status: "Active",
        image,
      },
    ]);
    onClose();
  };

  const field = "w-full rounded-lg border border-[var(--border)] bg-slate-900 px-3 py-2 text-sm outline-none focus:border-primary";
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={save} onClick={e => e.stopPropagation()} className="glass-card bg-slate-900 w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Add product</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <label className="flex items-center gap-4 cursor-pointer">
          <div className="h-20 w-20 rounded-lg border border-dashed border-[var(--border)] overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
          </div>
          <span className="text-sm text-primary">Upload product photo</span>
          <input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (f) setImage(await readImageAsDataURL(f)); }} />
        </label>
        <input className={field} placeholder="Product title *" value={form.title} onChange={set("title")} required />
        <div className="grid grid-cols-2 gap-3">
          <input className={field} placeholder="SKU" value={form.sku} onChange={set("sku")} />
          <input className={field} placeholder="Category" value={form.category} onChange={set("category")} />
          <input className={field} placeholder="Selling price ₹" type="number" value={form.price} onChange={set("price")} />
          <input className={field} placeholder="Cost per item ₹" type="number" value={form.cost} onChange={set("cost")} />
          <input className={field} placeholder="Stock quantity" type="number" value={form.inventory} onChange={set("inventory")} />
        </div>
        <div className="flex justify-end">
          <button className="rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold">Save product</button>
        </div>
      </form>
    </div>
  );
}
