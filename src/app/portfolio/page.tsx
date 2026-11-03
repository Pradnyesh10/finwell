"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LineChart, Plus, Minus, Trash2, Link2, X, Upload, Calculator, Info } from "lucide-react";
import { analyse, buy, getHoldings, importPortfolioCSV, saveHoldings, sell, type Holding } from "@/lib/portfolio-store";
import { formatCurrency, subscribeToDataChange } from "@/lib/finance-store";
import { cn } from "@/lib/utils";

const pct = (n: number) => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
const inr = (n: number) => formatCurrency(Math.round(n));
const tone = (n: number) => (n >= 0 ? "text-emerald-400" : "text-red-400");

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [years, setYears] = useState(3);
  const [adding, setAdding] = useState(false);
  const [connect, setConnect] = useState(false);
  const [trade, setTrade] = useState<{ h: Holding; side: "buy" | "sell" } | null>(null);
  const [calc, setCalc] = useState({ symbol: "", amount: "50000" });

  const refresh = useCallback(() => setHoldings(getHoldings()), []);
  useEffect(() => { refresh(); return subscribeToDataChange(refresh); }, [refresh]);
  if (!holdings) return null;

  const a = analyse(holdings, years);
  const update = (id: string, patch: Partial<Holding>) => saveHoldings(holdings.map(h => (h.id === id ? { ...h, ...patch } : h)));

  const calcStock = holdings.find(h => h.symbol === calc.symbol) ?? holdings[0];
  const calcAmount = +calc.amount || 0;
  const calcRow = calcStock && a.rows.find(r => r.id === calcStock.id)!;
  const calcUnits = calcStock ? Math.floor(calcAmount / calcStock.currentPrice) : 0;
  const calcInvested = calcStock ? calcUnits * calcStock.currentPrice : 0;
  const calcFuture = calcRow ? calcUnits * calcRow.predictedUnit : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><LineChart className="h-8 w-8 text-primary" /> Stock Portfolio</h1>
          <p className="text-muted-foreground mt-1">Add or remove stocks, see per-unit profit, and project your ROI.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setConnect(true)} className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-white/10">
            <Link2 className="h-4 w-4" /> Connect Moneycontrol
          </button>
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Add stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Invested", inr(a.invested), ""],
          ["Current value", inr(a.current), ""],
          ["Total P&L", inr(a.pnl), pct(a.pnlPct)],
          [`Predicted in ${years}y`, inr(a.predicted), `ROI ${pct(a.predictedRoi)}`],
        ].map(([l, v, sub], i) => (
          <div key={l} className="glass-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p>
            <p className={cn("text-2xl font-black mt-1", i === 2 && tone(a.pnl), i === 3 && "text-primary")}>{v}</p>
            {sub && <p className={cn("text-sm font-semibold", tone(i === 2 ? a.pnl : a.predictedRoi))}>{sub}</p>}
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-wrap gap-2">
          <h2 className="font-semibold">Holdings</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Prediction horizon</span>
            {[1, 3, 5, 10].map(y => (
              <button key={y} onClick={() => setYears(y)} className={cn("rounded-md px-2.5 py-1", years === y ? "bg-primary text-white" : "hover:bg-white/10")}>{y}y</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left bg-white/5">
              <tr>
                {["Stock", "Qty", "Avg buy / unit", "Current / unit", "P&L / unit", "Invested", "Current value", "P&L", "Exp. return / yr", "Target / unit", `Predicted / unit (${years}y)`, "Predicted value", "ROI", ""].map(h => (
                  <th key={h} className="px-3 py-2.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.rows.map(r => (
                <tr key={r.id} className="border-t border-[var(--border)] hover:bg-white/5">
                  <td className="px-3 py-2.5"><p className="font-semibold">{r.symbol}</p><p className="text-xs text-muted-foreground">{r.name}</p></td>
                  <td className="px-3 py-2.5">{r.qty}</td>
                  <td className="px-3 py-2.5">{inr(r.avgPrice)}</td>
                  <td className="px-3 py-2.5">
                    <input type="number" value={r.currentPrice} onChange={e => update(r.id, { currentPrice: +e.target.value || 0 })} className="w-24 rounded-md bg-transparent border border-[var(--border)] px-2 py-1" />
                  </td>
                  <td className={cn("px-3 py-2.5 font-medium", tone(r.pnlPerUnit))}>{inr(r.pnlPerUnit)}</td>
                  <td className="px-3 py-2.5">{inr(r.invested)}</td>
                  <td className="px-3 py-2.5">{inr(r.current)}</td>
                  <td className={cn("px-3 py-2.5 font-medium whitespace-nowrap", tone(r.pnl))}>{inr(r.pnl)} <span className="text-xs">({pct(r.pnlPct)})</span></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <input type="number" value={r.expectedReturnPct} onChange={e => update(r.id, { expectedReturnPct: +e.target.value || 0 })} className="w-14 rounded-md bg-transparent border border-[var(--border)] px-2 py-1" />%
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <input type="number" placeholder="auto" value={r.targetPrice ?? ""} onChange={e => update(r.id, { targetPrice: e.target.value ? +e.target.value : undefined })} className="w-24 rounded-md bg-transparent border border-[var(--border)] px-2 py-1" />
                  </td>
                  <td className="px-3 py-2.5 font-medium text-primary">{inr(r.predictedUnit)}</td>
                  <td className="px-3 py-2.5">{inr(r.predicted)}</td>
                  <td className={cn("px-3 py-2.5 font-bold", tone(r.predictedRoi))}>{pct(r.predictedRoi)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap space-x-1">
                    <button onClick={() => setTrade({ h: r, side: "buy" })} title="Buy more" className="rounded-md border border-[var(--border)] p-1 hover:bg-emerald-500/20"><Plus className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setTrade({ h: r, side: "sell" })} title="Sell / remove units" className="rounded-md border border-[var(--border)] p-1 hover:bg-red-500/20"><Minus className="h-3.5 w-3.5" /></button>
                    <button onClick={() => confirm(`Remove ${r.symbol} from portfolio?`) && saveHoldings(holdings.filter(h => h.id !== r.id))} title="Remove stock" className="p-1 text-muted-foreground hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
              {!a.rows.length && <tr><td colSpan={14} className="px-4 py-10 text-center text-muted-foreground">No stocks yet — add one or connect Moneycontrol.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Projected portfolio value · next {years} year{years > 1 ? "s" : ""}</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.growth}>
                <defs>
                  <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} axisLine={false} tickLine={false} width={55} />
                <Tooltip formatter={v => inr(Number(v))} contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#pf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> If I invest…</h3>
          <select value={calcStock?.symbol ?? ""} onChange={e => setCalc(c => ({ ...c, symbol: e.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-slate-900 px-3 py-2 text-sm">
            {holdings.map(h => <option key={h.id} value={h.symbol}>{h.symbol} — {inr(h.currentPrice)}/unit</option>)}
          </select>
          <input type="number" value={calc.amount} onChange={e => setCalc(c => ({ ...c, amount: e.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm" placeholder="Amount ₹" />
          {calcStock && (
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span className="text-muted-foreground">Units you get</span><b>{calcUnits}</b></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Price per unit</span><b>{inr(calcStock.currentPrice)}</b></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Actually invested</span><b>{inr(calcInvested)}</b></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Predicted value in {years}y</span><b className="text-primary">{inr(calcFuture)}</b></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Expected gain / ROI</span>
                <b className={tone(calcFuture - calcInvested)}>{inr(calcFuture - calcInvested)} ({calcInvested ? pct((calcFuture - calcInvested) / calcInvested) : "0%"})</b>
              </p>
              <button
                disabled={!calcUnits}
                onClick={() => saveHoldings(buy(holdings, calcStock.symbol, calcStock.name, calcUnits, calcStock.currentPrice, calcStock.currentPrice))}
                className="w-full rounded-lg bg-primary py-2 font-semibold text-white disabled:opacity-40"
              >
                Add {calcUnits} units to portfolio
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0" />
        Predictions compound the current price at your expected annual return (or use your target price if set). They are estimates for planning, not investment advice. Edit current prices to keep values up to date.
      </p>

      {adding && <AddStock onClose={() => setAdding(false)} holdings={holdings} />}
      {trade && <Trade {...trade} holdings={holdings} onClose={() => setTrade(null)} />}
      {connect && <ConnectMoneycontrol holdings={holdings} onClose={() => setConnect(false)} />}
    </div>
  );
}

const field = "w-full rounded-lg border border-[var(--border)] bg-slate-900 px-3 py-2 text-sm outline-none focus:border-primary";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="glass-card bg-slate-900 w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddStock({ holdings, onClose }: { holdings: Holding[]; onClose: () => void }) {
  const [f, setF] = useState({ symbol: "", name: "", qty: "", price: "", current: "", ret: "12" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF(s => ({ ...s, [k]: e.target.value }));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = f.symbol.toUpperCase().trim();
    if (!symbol || !+f.qty || !+f.price) return;
    const next = buy(holdings, symbol, f.name.trim(), +f.qty, +f.price, +f.current || +f.price);
    saveHoldings(next.map(h => (h.symbol === symbol && !holdings.some(x => x.symbol === symbol) ? { ...h, expectedReturnPct: +f.ret || 12 } : h)));
    onClose();
  };
  return (
    <Modal title="Add stock" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input className={field} placeholder="Symbol (e.g. TCS) *" value={f.symbol} onChange={set("symbol")} required />
          <input className={field} placeholder="Company name" value={f.name} onChange={set("name")} />
          <input className={field} type="number" placeholder="Quantity *" value={f.qty} onChange={set("qty")} required />
          <input className={field} type="number" placeholder="Buy price / unit ₹ *" value={f.price} onChange={set("price")} required />
          <input className={field} type="number" placeholder="Current price / unit ₹" value={f.current} onChange={set("current")} />
          <input className={field} type="number" placeholder="Expected return %/yr" value={f.ret} onChange={set("ret")} />
        </div>
        {+f.qty > 0 && +f.price > 0 && <p className="text-sm text-muted-foreground">Investment: <b className="text-foreground">{inr(+f.qty * +f.price)}</b></p>}
        <button className="w-full rounded-lg bg-primary py-2 font-semibold text-white">Add to portfolio</button>
      </form>
    </Modal>
  );
}

function Trade({ h, side, holdings, onClose }: { h: Holding; side: "buy" | "sell"; holdings: Holding[]; onClose: () => void }) {
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState(String(h.currentPrice));
  const q = +qty || 0;
  const p = +price || 0;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q) return;
    saveHoldings(side === "buy" ? buy(holdings, h.symbol, h.name, q, p) : sell(holdings, h.id, Math.min(q, h.qty)));
    onClose();
  };
  return (
    <Modal title={`${side === "buy" ? "Buy more" : "Sell / remove"} ${h.symbol}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-sm text-muted-foreground">You hold {h.qty} units · avg {inr(h.avgPrice)} / unit</p>
        <div className="grid grid-cols-2 gap-3">
          <input className={field} type="number" min={1} max={side === "sell" ? h.qty : undefined} value={qty} onChange={e => setQty(e.target.value)} placeholder="Units" />
          <input className={field} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price / unit" />
        </div>
        <p className="text-sm">
          {side === "buy" ? "Cost" : "Proceeds"}: <b>{inr(q * p)}</b>
          {side === "sell" && <> · Realised P&amp;L: <b className={tone((p - h.avgPrice) * q)}>{inr((p - h.avgPrice) * Math.min(q, h.qty))}</b></>}
          {side === "buy" && <> · New avg: <b>{inr((h.avgPrice * h.qty + p * q) / (h.qty + q))}</b></>}
        </p>
        <button className={cn("w-full rounded-lg py-2 font-semibold text-white", side === "buy" ? "bg-emerald-600" : "bg-red-600")}>
          {side === "buy" ? "Add stock" : "Remove stock"}
        </button>
      </form>
    </Modal>
  );
}

function ConnectMoneycontrol({ holdings, onClose }: { holdings: Holding[]; onClose: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const onFile = async (file?: File) => {
    if (!file) return;
    const { holdings: next, count } = importPortfolioCSV(await file.text(), holdings);
    saveHoldings(next);
    setMsg(`Imported ${count} stocks from ${file.name}`);
  };
  return (
    <Modal title="Connect Moneycontrol" onClose={onClose}>
      <ol className="text-sm space-y-2 list-decimal pl-5 text-muted-foreground">
        <li>Open <b className="text-foreground">Moneycontrol → My Portfolio → Stocks</b>.</li>
        <li>Tap <b className="text-foreground">Download / Export</b> and save as CSV (or export holdings from your broker — Zerodha, Groww, Upstox all work).</li>
        <li>Upload it here. Columns like <i>Stock Name, Symbol, Quantity, Avg Buy Price, Current Price / LTP</i> are detected automatically.</li>
      </ol>
      <input ref={ref} type="file" accept=".csv" hidden onChange={e => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <button onClick={() => ref.current?.click()} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white">
        <Upload className="h-4 w-4" /> Upload portfolio CSV
      </button>
      <a href="/samples/moneycontrol-portfolio.csv" download className="block text-center text-xs text-primary">Download a sample Moneycontrol export</a>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      <p className="text-[11px] text-muted-foreground">Moneycontrol doesn&apos;t offer a public API for portfolios, so we import your export file — nothing leaves your browser.</p>
    </Modal>
  );
}
