import {
  AlertTriangle,
  BarChart2,
  Calendar,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Flame,
  Image,
  Pencil,
  Search,
  Video,
} from "lucide-react";
import { useState } from "react";
import type { Insights } from "../types/youtube";

interface InsightsSectionProps {
  insights: Insights;
}

type TabId =
  | "mistakes"
  | "titles"
  | "seo"
  | "viral"
  | "strategy"
  | "plan"
  | "week";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "mistakes", label: "Mistakes", icon: <AlertTriangle size={13} /> },
  { id: "titles", label: "Title Ideas", icon: <Pencil size={13} /> },
  { id: "seo", label: "SEO Tips", icon: <Search size={13} /> },
  { id: "viral", label: "Viral Ideas", icon: <Flame size={13} /> },
  { id: "strategy", label: "Strategy", icon: <BarChart2 size={13} /> },
  { id: "plan", label: "30-Day Plan", icon: <Calendar size={13} /> },
  { id: "week", label: "7-Day Content", icon: <CalendarDays size={13} /> },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-white/8 hover:text-[#9CA3AF]"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckCheck size={12} className="text-[#22C55E]" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

function AccordionItem({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/6 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-[#9CA3AF]">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-[#E5E7EB]">
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-[#6B7280]" />
        ) : (
          <ChevronDown size={14} className="text-[#6B7280]" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

const DAY_COLORS = [
  {
    bg: "rgba(225,29,46,0.15)",
    border: "rgba(225,29,46,0.3)",
    text: "#E11D2E",
    badge: "rgba(225,29,46,0.2)",
  },
  {
    bg: "rgba(34,183,255,0.1)",
    border: "rgba(34,183,255,0.25)",
    text: "#22B7FF",
    badge: "rgba(34,183,255,0.2)",
  },
  {
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
    text: "#A855F7",
    badge: "rgba(168,85,247,0.2)",
  },
  {
    bg: "rgba(251,146,60,0.1)",
    border: "rgba(251,146,60,0.25)",
    text: "#FB923C",
    badge: "rgba(251,146,60,0.2)",
  },
  {
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    text: "#22C55E",
    badge: "rgba(34,197,94,0.2)",
  },
  {
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.25)",
    text: "#EAB308",
    badge: "rgba(234,179,8,0.2)",
  },
  {
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.25)",
    text: "#EC4899",
    badge: "rgba(236,72,153,0.2)",
  },
];

export function InsightsSection({ insights }: InsightsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("mistakes");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile) {
    return (
      <div
        className="rounded-2xl border border-white/6 bg-[#101B2B]"
        data-ocid="insights.panel"
      >
        <div className="border-b border-white/6 px-5 py-4">
          <h3 className="text-sm font-bold text-[#E5E7EB]">
            AI Growth Insights
          </h3>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Niche: <span className="text-[#22B7FF]">{insights.niche}</span>
          </p>
        </div>
        {TABS.map((tab, i) => (
          <AccordionItem
            key={tab.id}
            title={tab.label}
            icon={tab.icon}
            defaultOpen={i === 0}
          >
            <TabContent tab={tab.id} insights={insights} />
          </AccordionItem>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-white/6 bg-[#101B2B]"
      data-ocid="insights.panel"
    >
      <div className="border-b border-white/6 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#E5E7EB]">
            AI Growth Insights
          </h3>
          <span className="rounded-full bg-[#22B7FF]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#22B7FF]">
            {insights.niche}
          </span>
        </div>
      </div>

      <div className="flex gap-0.5 overflow-x-auto border-b border-white/6 bg-white/2 px-4 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-[#E11D2E] text-white"
                : "text-[#9CA3AF] hover:bg-white/6 hover:text-[#E5E7EB]"
            }`}
            data-ocid="insights.tab"
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <TabContent tab={activeTab} insights={insights} />
      </div>
    </div>
  );
}

function TabContent({ tab, insights }: { tab: TabId; insights: Insights }) {
  switch (tab) {
    case "mistakes":
      return (
        <ol className="space-y-3">
          {insights.mistakes.map((m) => (
            <li key={m} className="flex items-start gap-3">
              <AlertTriangle
                size={13}
                className="mt-0.5 shrink-0 text-amber-400"
              />
              <p className="text-xs leading-relaxed text-[#9CA3AF]">{m}</p>
            </li>
          ))}
        </ol>
      );

    case "titles":
      return (
        <div className="space-y-2.5">
          <p className="mb-3 text-[11px] text-[#6B7280]">
            Titles generated specifically for{" "}
            <span className="font-semibold text-[#22B7FF]">
              {insights.niche}
            </span>{" "}
            channels based on your top-performing videos.
          </p>
          {insights.titleSuggestions.map((title) => (
            <div
              key={title}
              className="flex items-start gap-2 rounded-xl border border-white/6 bg-white/3 p-3"
            >
              <p className="flex-1 text-xs leading-relaxed text-[#E5E7EB]">
                {title}
              </p>
              <CopyButton text={title} />
            </div>
          ))}
        </div>
      );

    case "seo":
      return (
        <div className="space-y-5">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Top Keywords
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {insights.seoTips.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-[#22B7FF]/25 bg-[#22B7FF]/10 px-3 py-1 text-xs font-medium text-[#22B7FF]"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Suggested Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {insights.seoTips.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#9CA3AF]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Description Tips
            </h4>
            <ul className="space-y-2">
              {insights.seoTips.descriptionTips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-xs text-[#9CA3AF]"
                >
                  <span className="mt-0.5 text-[#22C55E]">\u2713</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "viral":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {insights.viralIdeas.map((idea) => (
            <div
              key={idea}
              className="flex items-start gap-2.5 rounded-xl border border-white/6 bg-white/3 p-3"
            >
              <p className="text-xs leading-relaxed text-[#9CA3AF]">{idea}</p>
            </div>
          ))}
        </div>
      );

    case "strategy":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-[#22B7FF]/20 bg-[#22B7FF]/8 p-4">
            <BarChart2 size={18} className="shrink-0 text-[#22B7FF]" />
            <div>
              <p className="text-xs font-semibold text-[#E5E7EB]">
                Current Posting Frequency
              </p>
              <p className="text-lg font-bold text-[#22B7FF]">
                {insights.postingFrequency}
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {insights.strategyTips.map((tip) => (
              <li key={tip} className="flex items-start gap-3">
                <span className="mt-0.5 text-[#22C55E]">\u2022</span>
                <p className="text-xs leading-relaxed text-[#9CA3AF]">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      );

    case "plan":
      return (
        <div className="space-y-3">
          {insights.growthPlan.map((week, i) => (
            <div
              key={week.week}
              className="rounded-xl border border-white/6 bg-white/3 p-4"
              data-ocid={`insights.panel.${i + 1}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background:
                      i === 0
                        ? "rgba(225,29,46,0.2)"
                        : i === 1
                          ? "rgba(34,183,255,0.2)"
                          : "rgba(34,197,94,0.2)",
                    color:
                      i === 0 ? "#E11D2E" : i === 1 ? "#22B7FF" : "#22C55E",
                  }}
                >
                  {i + 1}
                </span>
                <h4 className="text-sm font-bold text-[#E5E7EB]">
                  {week.week}
                </h4>
              </div>
              <p className="mb-2 text-xs font-medium text-[#9CA3AF]">
                {week.goal}
              </p>
              <ul className="space-y-1.5">
                {week.actions.map((action) => (
                  <li
                    key={action}
                    className="flex items-start gap-2 text-xs text-[#9CA3AF]"
                  >
                    <span className="mt-0.5 shrink-0 text-[#6B7280]">
                      \u2022
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "week":
      return (
        <div className="space-y-3">
          <div className="mb-4 rounded-xl border border-[#22B7FF]/20 bg-[#22B7FF]/8 px-4 py-3">
            <p className="text-[11px] font-semibold text-[#22B7FF]">
              7-Day Content Plan for{" "}
              <span className="font-bold">{insights.niche}</span> channels
            </p>
            <p className="mt-0.5 text-[10px] text-[#6B7280]">
              Each day includes a topic, video idea, thumbnail concept, and
              format — all tailored to your channel type.
            </p>
          </div>
          {insights.sevenDayPlan.map((day, i) => {
            const color = DAY_COLORS[i % DAY_COLORS.length];
            return (
              <div
                key={day.day}
                className="rounded-xl border p-4"
                style={{ borderColor: color.border, background: color.bg }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: color.badge, color: color.text }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: color.text }}
                  >
                    {day.day}
                  </span>
                </div>

                <div className="mb-2 flex items-start gap-2 rounded-lg border border-white/8 bg-black/20 p-2.5">
                  <Pencil
                    size={11}
                    className="mt-0.5 shrink-0 text-[#E5E7EB]"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Video Title
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-[#E5E7EB]">
                      {day.title}
                    </p>
                  </div>
                  <CopyButton text={day.title} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Video
                      size={11}
                      className="mt-0.5 shrink-0 text-[#9CA3AF]"
                    />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Topic
                      </p>
                      <p className="mt-0.5 text-xs text-[#9CA3AF]">
                        {day.topic}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Flame
                      size={11}
                      className="mt-0.5 shrink-0 text-[#9CA3AF]"
                    />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Video Idea
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#9CA3AF]">
                        {day.videoIdea}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Image
                      size={11}
                      className="mt-0.5 shrink-0 text-[#9CA3AF]"
                    />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Thumbnail Idea
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#9CA3AF]">
                        {day.thumbnailIdea}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={11}
                      className="shrink-0 text-[#9CA3AF]"
                    />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Format
                      </p>
                      <p className="mt-0.5 text-xs text-[#9CA3AF]">
                        {day.format}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );

    default:
      return null;
  }
}
