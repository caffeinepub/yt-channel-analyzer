import { LayoutGrid, Lightbulb, PlayCircle } from "lucide-react";
import type { AnalysisResult } from "../types/youtube";
import { ChannelOverview } from "./ChannelOverview";
import { ChartsSection } from "./ChartsSection";
import { InsightsSection } from "./InsightsSection";
import { KPICards } from "./KPICards";
import { MonetizationCard, getCPM } from "./MonetizationCard";
import { VideoTable } from "./VideoTable";

interface DashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  onOpenSettings: () => void;
}

const NAV_ICONS = [
  { icon: <LayoutGrid size={20} />, label: "Dashboard", id: "dashboard" },
  { icon: <PlayCircle size={20} />, label: "Videos", id: "videos" },
  { icon: <Lightbulb size={20} />, label: "Insights", id: "insights" },
];

export function Dashboard({
  result,
  onReset,
  onOpenSettings: _onOpenSettings,
}: DashboardProps) {
  const { channel, videos, bestVideo, worstVideo, insights } = result;
  const cpmRange = getCPM(insights.niche);

  function handleNavClick(id: string) {
    const el = document.getElementById(`section-${id}`);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]" data-ocid="dashboard.page">
      <aside
        className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-64px)] w-16 flex-col items-center gap-2 border-r border-white/6 bg-[#0C1422] py-4 lg:flex"
        aria-label="Sidebar navigation"
        data-ocid="dashboard.panel"
      >
        {NAV_ICONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            title={item.label}
            className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
              item.id === "dashboard"
                ? "bg-[#E11D2E]/20 text-[#E11D2E]"
                : "text-[#6B7280] hover:bg-white/8 hover:text-[#9CA3AF]"
            }`}
            data-ocid="dashboard.link"
          >
            {item.icon}
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#0F1726] px-2.5 py-1.5 text-xs font-medium text-[#E5E7EB] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
          </button>
        ))}
      </aside>

      <main
        className="flex-1 px-4 py-6 lg:ml-16 lg:px-6"
        id="section-dashboard"
      >
        {/* Top row: channel overview + KPIs */}
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <ChannelOverview channel={channel} onReset={onReset} />
          </div>
          <div id="section-kpis">
            <KPICards result={result} />
          </div>
        </div>

        {/* Monetization / Income / Watch Time row — BEFORE AI Insights */}
        <div className="mb-5" data-ocid="monetization.section">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-[#E5E7EB]">
              Monetization &amp; Revenue Analytics
            </span>
            <span className="rounded-full bg-[#E11D2E]/15 px-2 py-0.5 text-[10px] font-medium text-[#E11D2E]">
              {insights.niche}
            </span>
          </div>
          <MonetizationCard
            channel={channel}
            videos={videos}
            niche={insights.niche}
          />
        </div>

        {/* AI Growth Analyzer — AFTER Monetization */}
        <div className="mb-5" id="section-insights">
          <InsightsSection insights={insights} />
        </div>

        {/* Charts + Video table */}
        <div
          className="grid grid-cols-1 gap-5 lg:grid-cols-5"
          id="section-videos"
        >
          <div className="lg:col-span-3">
            <ChartsSection videos={videos} />
          </div>
          <div className="lg:col-span-2">
            <VideoTable
              videos={videos}
              bestVideo={bestVideo}
              worstVideo={worstVideo}
              cpmRange={cpmRange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
