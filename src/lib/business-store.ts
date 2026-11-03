// Business side of FINWELL — a Shopify-style store (orders, products, customers) persisted in
// localStorage. All metrics are computed here in code; the LLM only explains them.

import { notifyDataChange } from "@/lib/finance-store";

export type PaymentStatus = "Paid" | "Payment pending" | "Refunded";
export type FulfillmentStatus = "Unfulfilled" | "Fulfilled";

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  inventory: number;
  status: "Active" | "Draft";
  image?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  date: string; // ISO
  customer: string;
  channel: string;
  items: OrderItem[];
  total: number;
  payment: PaymentStatus;
  fulfillment: FulfillmentStatus;
}

export interface BusinessExpense { name: string; amount: number }
export interface Payable { supplier: string; amount: number; dueInDays: number }
export interface Receivable { customer: string; amount: number; overdueDays: number }

export const businessProfile = {
  name: "Aroma House Perfumes",
  type: "Perfume retailer · Store + Online + Instagram",
  cashInBank: 285000,
  sessions30d: 838,
};

export const businessExpenses: BusinessExpense[] = [
  { name: "Shop rent", amount: 30000 },
  { name: "Staff salary (1)", amount: 22000 },
  { name: "Electricity & internet", amount: 5000 },
  { name: "Instagram ads", amount: 10000 },
  { name: "Packaging & shipping", amount: 5000 },
];

export const payables: Payable[] = [
  { supplier: "Kannauj Attar Co.", amount: 72000, dueInDays: 6 },
  { supplier: "Glass Bottle Works", amount: 31000, dueInDays: 18 },
];

export const receivables: Receivable[] = [
  { customer: "Corporate gifting – TechNova", amount: 48000, overdueDays: 21 },
  { customer: "Wedding order – Sharma", amount: 16500, overdueDays: 4 },
];

// ---------- seed data ----------

const seedProducts: Product[] = [
  { id: "p1", title: "Royal Oud 50ml", sku: "OUD-50", category: "Eau de Parfum", price: 3200, cost: 1400, inventory: 12, status: "Active" },
  { id: "p2", title: "Rose Musk 100ml", sku: "ROSE-100", category: "Eau de Parfum", price: 2400, cost: 900, inventory: 64, status: "Active" },
  { id: "p3", title: "Citrus Breeze 50ml", sku: "CITR-50", category: "Eau de Toilette", price: 1499, cost: 700, inventory: 140, status: "Active" },
  { id: "p4", title: "Amber Nights 100ml", sku: "AMBR-100", category: "Eau de Parfum", price: 2900, cost: 1300, inventory: 8, status: "Active" },
  { id: "p5", title: "Sandal Attar 12ml", sku: "ATTAR-12", category: "Attar", price: 899, cost: 300, inventory: 95, status: "Active" },
  { id: "p6", title: "Mini Gift Set", sku: "GIFT-SET", category: "Gift Set", price: 1799, cost: 1100, inventory: 75, status: "Active" },
  { id: "p7", title: "Jasmine Mist 30ml", sku: "JAS-30", category: "Body Mist", price: 699, cost: 250, inventory: 0, status: "Draft" },
];

const CUSTOMERS = [
  "Soniya Gangwani", "Taruna Kamlani", "Madhur Kankani", "Ankit Patel", "Drishti Kodwani", "Rahul Kamlani",
  "Priya Sharma", "Arjun Mehta", "Neha Iyer", "Karan Malhotra", "Sneha Reddy", "Vikram Singh", "Aisha Khan",
  "Rohan Desai", "Meera Nair",
];
const CHANNELS = ["Online Store", "Online Store", "Instagram", "Point of Sale", "Draft Orders"];

function seedOrders(): Order[] {
  const now = Date.now();
  const orders: Order[] = [];
  for (let i = 0; i < 64; i++) {
    const n = 1021 - i;
    const p = seedProducts[(i * 5) % 6];
    const p2 = seedProducts[(i * 3 + 1) % 6];
    const items: OrderItem[] = [{ productId: p.id, title: p.title, qty: 1 + (i % 3 === 0 ? 1 : 0), price: p.price }];
    if (i % 4 === 1) items.push({ productId: p2.id, title: p2.title, qty: 1, price: p2.price });
    const total = items.reduce((s, it) => s + it.qty * it.price, 0);
    const payment: PaymentStatus = i % 11 === 3 ? "Refunded" : i % 7 === 2 ? "Payment pending" : "Paid";
    const fulfillment: FulfillmentStatus = i < 5 && payment === "Paid" ? "Unfulfilled" : payment === "Paid" ? "Fulfilled" : "Unfulfilled";
    orders.push({
      id: `#${n}`,
      date: new Date(now - i * 11 * 3600 * 1000 - (i % 5) * 3600 * 1000).toISOString(),
      customer: CUSTOMERS[i % CUSTOMERS.length],
      channel: CHANNELS[i % CHANNELS.length],
      items,
      total,
      payment,
      fulfillment,
    });
  }
  return orders;
}

// ---------- persistence ----------

const PRODUCTS_KEY = "finwell.biz.products.v1";
const ORDERS_KEY = "finwell.biz.orders.v2";

function load<T>(key: string, seed: () => T): T {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  const value = seed();
  save(key, value);
  return value;
}

function save<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    alert("Browser storage is full — try smaller images.");
  }
  notifyDataChange();
}

export const getProducts = () => load(PRODUCTS_KEY, () => seedProducts);
export const saveProducts = (p: Product[]) => save(PRODUCTS_KEY, p);
export const getOrders = () => load(ORDERS_KEY, seedOrders);
export const saveOrders = (o: Order[]) => save(ORDERS_KEY, o);

export function resetBusinessData() {
  saveProducts(seedProducts);
  saveOrders(seedOrders());
}

export function nextOrderId(orders: Order[]) {
  const max = orders.reduce((m, o) => Math.max(m, parseInt(o.id.replace(/\D/g, "")) || 0), 1000);
  return `#${max + 1}`;
}

// ---------- CSV import (simple headers or Shopify export headers) ----------

export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some(f => f.trim())) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some(f => f.trim())) rows.push(row);
  const [header, ...body] = rows;
  if (!header) return [];
  const keys = header.map(h => h.trim().toLowerCase());
  return body.map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const pick = (row: Record<string, string>, ...names: string[]) => {
  for (const n of names) if (row[n] !== undefined && row[n] !== "") return row[n];
  return "";
};
const num = (v: string) => parseFloat(v.replace(/[₹,\s]/g, "")) || 0;

export function importProductsCSV(text: string): number {
  const rows = parseCSV(text);
  const products = getProducts();
  let added = 0;
  for (const r of rows) {
    const title = pick(r, "title", "name", "product", "product name");
    if (!title) continue; // Shopify exports extra image/variant rows without a title
    const sku = pick(r, "sku", "variant sku") || title.toUpperCase().replace(/\W+/g, "-").slice(0, 12);
    const existing = products.find(p => p.sku === sku);
    const data: Product = {
      id: existing?.id ?? `p${Date.now()}${added}`,
      title,
      sku,
      category: pick(r, "category", "type", "product category") || "Uncategorized",
      price: num(pick(r, "price", "variant price", "selling price")),
      cost: num(pick(r, "cost", "cost per item", "purchase price")),
      inventory: Math.round(num(pick(r, "inventory", "stock", "quantity", "variant inventory qty"))),
      status: pick(r, "status").toLowerCase() === "draft" ? "Draft" : "Active",
      image: pick(r, "image", "image src", "image url") || existing?.image,
    };
    if (existing) Object.assign(existing, data);
    else products.push(data);
    added++;
  }
  saveProducts(products);
  return added;
}

export function importOrdersCSV(text: string): number {
  const rows = parseCSV(text);
  const orders = getOrders();
  const products = getProducts();
  let added = 0;
  for (const r of rows) {
    const total = num(pick(r, "total", "amount", "order total"));
    const customer = pick(r, "customer", "billing name", "shipping name", "customer name");
    if (!total && !customer) continue;
    const id = pick(r, "order", "name", "order id", "id") || nextOrderId(orders);
    if (orders.some(o => o.id === (id.startsWith("#") ? id : `#${id}`))) continue;
    const productName = pick(r, "product", "lineitem name", "item");
    const qty = Math.round(num(pick(r, "quantity", "qty", "lineitem quantity"))) || 1;
    const product = products.find(p => p.title.toLowerCase() === productName.toLowerCase());
    const fin = pick(r, "payment", "financial status", "payment status").toLowerCase();
    const ful = pick(r, "fulfillment", "fulfillment status").toLowerCase();
    const date = new Date(pick(r, "date", "created at", "order date"));
    orders.push({
      id: id.startsWith("#") ? id : `#${id}`,
      date: isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
      customer: customer || "No customer",
      channel: pick(r, "channel", "source") || "CSV import",
      items: [{ productId: product?.id ?? "", title: productName || "Item", qty, price: total / qty }],
      total,
      payment: fin.includes("refund") ? "Refunded" : fin.includes("pend") ? "Payment pending" : "Paid",
      fulfillment: ful.startsWith("fulfilled") ? "Fulfilled" : "Unfulfilled",
    });
    added++;
  }
  orders.sort((a, b) => b.date.localeCompare(a.date));
  saveOrders(orders);
  return added;
}

export function ordersToCSV(orders: Order[]) {
  const head = "order,date,customer,channel,product,quantity,total,payment,fulfillment";
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [head, ...orders.map(o => [
    o.id, o.date.slice(0, 10), o.customer, o.channel,
    o.items.map(i => i.title).join(" + "), o.items.reduce((s, i) => s + i.qty, 0), o.total, o.payment, o.fulfillment,
  ].map(esc).join(","))].join("\n");
}

// ---------- metrics ----------

export function calculateBusinessSnapshot(orders = getOrders(), products = getProducts()) {
  const now = Date.now();
  const DAY = 86400000;
  const last30 = orders.filter(o => now - new Date(o.date).getTime() <= 30 * DAY);
  const sold = last30.filter(o => o.payment === "Paid");

  const totalSales = sold.reduce((s, o) => s + o.total, 0);
  const unitsByProduct: Record<string, number> = {};
  const revenueByProduct: Record<string, number> = {};
  for (const o of sold) for (const it of o.items) {
    unitsByProduct[it.productId] = (unitsByProduct[it.productId] ?? 0) + it.qty;
    revenueByProduct[it.productId] = (revenueByProduct[it.productId] ?? 0) + it.qty * it.price;
  }
  const cogs = products.reduce((s, p) => s + (unitsByProduct[p.id] ?? 0) * p.cost, 0);
  const grossProfit = totalSales - cogs;
  const operatingExpenses = businessExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPayables = payables.reduce((s, p) => s + p.amount, 0);
  const totalReceivables = receivables.reduce((s, r) => s + r.amount, 0);

  const daily = Array.from({ length: 30 }, (_, i) => {
    const start = now - (29 - i) * DAY;
    const d = new Date(start);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = sold.filter(o => o.date.slice(0, 10) === key);
    return { date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), sales: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length };
  });

  const customerMap = new Map<string, { name: string; orders: number; spent: number; last: string }>();
  for (const o of orders) {
    if (o.customer === "No customer") continue;
    const c = customerMap.get(o.customer) ?? { name: o.customer, orders: 0, spent: 0, last: o.date };
    c.orders++;
    if (o.payment === "Paid") c.spent += o.total;
    if (o.date > c.last) c.last = o.date;
    customerMap.set(o.customer, c);
  }

  return {
    totalSales,
    orderCount: last30.length,
    avgOrderValue: sold.length ? totalSales / sold.length : 0,
    sessions: businessProfile.sessions30d,
    conversionRate: last30.length / businessProfile.sessions30d,
    grossProfit,
    grossMarginPct: totalSales ? grossProfit / totalSales : 0,
    operatingExpenses,
    netProfit: grossProfit - operatingExpenses,
    cashInBank: businessProfile.cashInBank,
    totalPayables,
    totalReceivables,
    toFulfill: orders.filter(o => o.payment === "Paid" && o.fulfillment === "Unfulfilled").length,
    toCapture: orders.filter(o => o.payment === "Payment pending").length,
    daily,
    topProducts: products
      .map(p => ({ ...p, unitsSold30d: unitsByProduct[p.id] ?? 0, revenue30d: revenueByProduct[p.id] ?? 0 }))
      .sort((a, b) => b.revenue30d - a.revenue30d),
    customers: [...customerMap.values()].sort((a, b) => b.spent - a.spent),
  };
}
