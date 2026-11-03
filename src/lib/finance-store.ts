export type TransactionType = "Income" | "Expense";

export interface TransactionRecord {
  id: string;
  name: string;
  type: TransactionType;
  category: string;
  date: string;
  amount: number;
  mode: string;
  status: "Completed" | "Pending";
  isRecurring: boolean;
}

const STORAGE_KEY = "finwell.transactions.v2";
const DATA_CHANGE_EVENT = "finwell_data_changed";

export function notifyDataChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DATA_CHANGE_EVENT));
  }
}

export function subscribeToDataChange(callback: () => void) {
  if (typeof window !== "undefined") {
    window.addEventListener(DATA_CHANGE_EVENT, callback);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, callback);
  }
  return () => {};
}

// Test data: 3 months of household transactions, dated relative to today so
// "this month" metrics are always populated.
function seedTransactions(): TransactionRecord[] {
  const now = new Date();
  const day = (monthsAgo: number, d: number) =>
    new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.min(d, monthsAgo === 0 ? now.getDate() : 28))
      .toISOString()
      .slice(0, 10);
  const monthly: Omit<TransactionRecord, "id" | "date">[] = [
    { name: "Salary", type: "Income", category: "Salary", amount: 125000, mode: "Bank Transfer", status: "Completed", isRecurring: true },
    { name: "Home Loan EMI – HDFC", type: "Expense", category: "EMI", amount: 35000, mode: "Auto Debit", status: "Completed", isRecurring: true },
    { name: "Car Loan EMI", type: "Expense", category: "EMI", amount: 12500, mode: "Auto Debit", status: "Completed", isRecurring: true },
    { name: "SIP – Nifty 50 Index Fund", type: "Expense", category: "Investment", amount: 15000, mode: "Auto Debit", status: "Completed", isRecurring: true },
    { name: "Electricity – BESCOM", type: "Expense", category: "Utilities", amount: 3200, mode: "UPI", status: "Completed", isRecurring: true },
    { name: "Jio Fiber + Mobile", type: "Expense", category: "Utilities", amount: 1800, mode: "UPI", status: "Completed", isRecurring: true },
    { name: "Groceries – BigBasket", type: "Expense", category: "Food", amount: 9800, mode: "Credit Card", status: "Completed", isRecurring: false },
    { name: "Swiggy / Zomato", type: "Expense", category: "Food", amount: 4600, mode: "UPI", status: "Completed", isRecurring: false },
    { name: "Petrol", type: "Expense", category: "Transport", amount: 5200, mode: "Credit Card", status: "Completed", isRecurring: false },
    { name: "Term + Health Insurance", type: "Expense", category: "Insurance", amount: 4100, mode: "Auto Debit", status: "Completed", isRecurring: true },
    { name: "Netflix + Spotify", type: "Expense", category: "Entertainment", amount: 848, mode: "Credit Card", status: "Completed", isRecurring: true },
    { name: "Shopping – Myntra", type: "Expense", category: "Shopping", amount: 6400, mode: "Credit Card", status: "Completed", isRecurring: false },
  ];
  const days = [1, 5, 5, 7, 10, 12, 3, 14, 9, 15, 18, 20];
  const records: TransactionRecord[] = [];
  for (let m = 2; m >= 0; m--) {
    monthly.forEach((t, i) => {
      if (m === 0 && days[i] > now.getDate()) return;
      const jitter = t.isRecurring ? 1 : 0.85 + ((i * 7 + m * 3) % 30) / 100;
      records.push({ ...t, id: `${m}-${i}`, date: day(m, days[i]), amount: Math.round(t.amount * jitter) });
    });
  }
  records.push(
    { id: "x1", name: "Freelance Design", type: "Income", category: "Side Hustle", date: day(1, 18), amount: 24500, mode: "Bank Transfer", status: "Completed", isRecurring: false },
    { id: "x2", name: "Dividend – ITC", type: "Income", category: "Investment", date: day(0, 2), amount: 3200, mode: "Bank Transfer", status: "Completed", isRecurring: false },
    { id: "x3", name: "Hospital bill", type: "Expense", category: "Medical", date: day(1, 22), amount: 18500, mode: "Debit Card", status: "Completed", isRecurring: false },
    { id: "x4", name: "Diwali gifts & sweets", type: "Expense", category: "Shopping", date: day(0, 1), amount: 14200, mode: "UPI", status: "Completed", isRecurring: false },
    { id: "x5", name: "Credit card bill", type: "Expense", category: "Credit Card", date: day(0, 25), amount: 22000, mode: "Bank Transfer", status: "Pending", isRecurring: true },
  );
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

const defaultTransactions: TransactionRecord[] = seedTransactions();

export const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

export function getTransactions(): TransactionRecord[] {
  if (typeof window === "undefined") {
    return defaultTransactions;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTransactions));
    return defaultTransactions;
  }
  try {
    return JSON.parse(raw) as TransactionRecord[];
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTransactions));
    return defaultTransactions;
  }
}

export function saveTransactions(records: TransactionRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    notifyDataChange();
  }
}

export function calculateFinancialSnapshot(transactions: TransactionRecord[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEMI = transactions
    .filter(t => t.category.toLowerCase().includes("emi") || t.category.toLowerCase().includes("loan"))
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
  
  // Simulated liquidity buffer based on total savings (Income - Expense over all time / current monthly expense)
  const totalIncome = transactions.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const liquidityMonths = monthlyExpenses > 0 ? netSavings / monthlyExpenses : 0;

  return {
    monthlyIncome,
    monthlyExpenses,
    totalEMI,
    savingsRate,
    liquidityMonths: Math.max(liquidityMonths, 0)
  };
}
