import { Download, FileSpreadsheet, FileText } from "lucide-react";

const reports = [
  "Monthly Financial Summary",
  "EMI Burden Report",
  "Stress Trend Report",
  "Investment ROI Report",
  "Tax Friendly Summary",
  "Savings Growth Report",
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">Export-ready placeholders connected to your live dashboard data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((name) => (
          <div key={name} className="glass-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:bg-muted flex items-center gap-1">
                <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
              </button>
              <button className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:bg-muted flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
