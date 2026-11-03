'use client';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const incomeExpenseData = [
  { name: 'Jan', income: 110000, expense: 75000 },
  { name: 'Feb', income: 115000, expense: 78000 },
  { name: 'Mar', income: 115000, expense: 82000 },
  { name: 'Apr', income: 120000, expense: 70000 },
  { name: 'May', income: 125000, expense: 65000 },
  { name: 'Jun', income: 125000, expense: 68400 },
];

const expenseCategoryData = [
  { name: 'Housing', value: 25000, color: '#3b82f6' },
  { name: 'EMI', value: 35000, color: '#ef4444' },
  { name: 'Food', value: 12000, color: '#10b981' },
  { name: 'Transport', value: 5000, color: '#f59e0b' },
  { name: 'Lifestyle', value: 8000, color: '#8b5cf6' },
  { name: 'Others', value: 5400, color: '#64748b' },
];

const formatCurrency = (value: number | string | undefined) => {
  const numericValue =
    typeof value === "number" ? value : Number(value ?? 0);
  return `₹${numericValue.toLocaleString("en-IN")}`;
};

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="glass-card p-6 col-span-1 lg:col-span-2 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Income vs Expense Trend</h3>
          <p className="text-sm text-muted-foreground">Monthly cashflow overview</p>
        </div>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeExpenseData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(value) => [formatCurrency(value as number | string | undefined), "Amount"]}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Expense Breakdown</h3>
          <p className="text-sm text-muted-foreground">Where your money goes</p>
        </div>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {expenseCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value) => [formatCurrency(value as number | string | undefined), "Amount"]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
