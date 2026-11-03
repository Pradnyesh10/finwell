import { HeroSection } from "@/components/dashboard/HeroSection";
import { DashboardMetrics } from "@/components/dashboard/MetricCards";
import { DashboardCharts } from "@/components/dashboard/Charts";
import { LayoutDashboard, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <HeroSection />
      
      <div>
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <LayoutDashboard size={20} />
          </div>
          Financial Overview
        </h2>
        <DashboardMetrics />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <BarChart3 size={20} />
          </div>
          Insights & Trends
        </h2>
        <DashboardCharts />
      </div>
    </div>
  );
}
