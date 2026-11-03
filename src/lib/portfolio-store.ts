// Personal stock portfolio: holdings, per-unit P&L and compound-growth projections.
// Projections are deterministic estimates (expected annual return or a user target price), not advice.

import { notifyDataChange } from "@/lib/finance-store";
import { parseCSV } from "@/lib/business-store";

export interface Holding {
  id: string;
  name: string;
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  expectedReturnPct: number; // annual, used for projection
  targetPrice?: number; // optional user target, overrides projection
}

const KEY = "finwell.portfolio.v1";

const seed: Holding[] = [
  { id: "h1", name: "Reliance Industries", symbol: "RELIANCE", qty: 10, avgPrice: 2450, currentPrice: 2910, expectedReturnPct: 12 },
  { id: "h2", name: "HDFC Bank", symbol: "HDFCBANK", qty: 20, avgPrice: 1520, currentPrice: 1705, expectedReturnPct: 13 },
  { id: "h3", name: "Infosys", symbol: "INFY", qty: 15, avgPrice: 1410, currentPrice: 1820, expectedReturnPct: 11 },
  { id: "h4", name: "Tata Motors", symbol: "TATAMOTORS", qty: 30, avgPrice: 890, currentPrice: 775, expectedReturnPct: 14 },
];

export function getHoldings(): Holding[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

export function saveHoldings(h: Holding[]) {
  localStorage.setItem(KEY, JSON.stringify(h));
  notifyDataChange();
}

export function buy(h: Holding[], symbol: string, name: string, qty: number, price: number, currentPrice?: number): Holding[] {
  const existing = h.find(x => x.symbol === symbol);
  if (existing) {
    const totalQty = existing.qty + qty;
    return h.map(x => x === existing ? { ...x, qty: totalQty, avgPrice: (x.avgPrice * x.qty + price * qty) / totalQty } : x);
  }
  return [...h, { id: `h${Date.now()}`, name: name || symbol, symbol, qty, avgPrice: price, currentPrice: currentPrice || price, expectedReturnPct: 12 }];
}

export function sell(h: Holding[], id: string, qty: number): Holding[] {
  return h.flatMap(x => (x.id !== id ? [x] : x.qty - qty > 0 ? [{ ...x, qty: x.qty - qty }] : []));
}

export function predictedPrice(x: Holding, years: number) {
  return x.targetPrice && x.targetPrice > 0 ? x.targetPrice : x.currentPrice * Math.pow(1 + x.expectedReturnPct / 100, years);
}

export function analyse(holdings: Holding[], years: number) {
  const rows = holdings.map(x => {
    const invested = x.qty * x.avgPrice;
    const current = x.qty * x.currentPrice;
    const pUnit = predictedPrice(x, years);
    const predicted = x.qty * pUnit;
    return {
      ...x,
      invested,
      current,
      pnl: current - invested,
      pnlPerUnit: x.currentPrice - x.avgPrice,
      pnlPct: invested ? (current - invested) / invested : 0,
      predictedUnit: pUnit,
      predicted,
      predictedGain: predicted - invested,
      predictedRoi: invested ? (predicted - invested) / invested : 0,
    };
  });
  const invested = rows.reduce((s, r) => s + r.invested, 0);
  const current = rows.reduce((s, r) => s + r.current, 0);
  const predicted = rows.reduce((s, r) => s + r.predicted, 0);
  const growth = Array.from({ length: 11 }, (_, i) => {
    const y = (years * i) / 10;
    return { label: `${y.toFixed(1)}y`, value: Math.round(holdings.reduce((s, x) => {
      const end = predictedPrice(x, years);
      return s + x.qty * x.currentPrice * Math.pow(end / x.currentPrice, y / years);
    }, 0)) };
  });
  return {
    rows,
    invested,
    current,
    pnl: current - invested,
    pnlPct: invested ? (current - invested) / invested : 0,
    predicted,
    predictedRoi: invested ? (predicted - invested) / invested : 0,
    growth,
  };
}

// Moneycontrol / broker portfolio export (CSV). Moneycontrol has no public API, so we import its export.
export function importPortfolioCSV(text: string, current: Holding[]): { holdings: Holding[]; count: number } {
  let holdings = current;
  let count = 0;
  for (const r of parseCSV(text)) {
    const symbol = (r["symbol"] || r["nse code"] || r["ticker"] || r["scrip"] || r["stock name"] || r["name"] || "").toUpperCase().trim();
    const qty = parseFloat((r["quantity"] || r["qty"] || r["shares"] || "0").replace(/,/g, ""));
    const avg = parseFloat((r["avg buy price"] || r["avg price"] || r["buy price"] || r["average price"] || "0").replace(/[₹,]/g, ""));
    const cur = parseFloat((r["current price"] || r["ltp"] || r["cmp"] || r["last price"] || "0").replace(/[₹,]/g, ""));
    if (!symbol || !qty) continue;
    const name = r["stock name"] || r["company"] || r["name"] || symbol;
    holdings = holdings.filter(h => h.symbol !== symbol);
    holdings = [...holdings, { id: `h${Date.now()}${count}`, name, symbol, qty, avgPrice: avg || cur, currentPrice: cur || avg, expectedReturnPct: 12 }];
    count++;
  }
  return { holdings, count };
}
