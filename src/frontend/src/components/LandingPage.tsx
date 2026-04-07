import {
  Clock,
  PlayCircle,
  Search,
  Settings,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type { HistoryEntry } from "../App";

interface LandingPageProps {
  onAnalyze: (input: string) => void;
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const EXAMPLE_CHANNELS = [
  { label: "@MrBeast", value: "@MrBeast" },
  { label: "@veritasium", value: "@veritasium" },
  { label: "@mkbhd", value: "@mkbhd" },
];

function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function LandingPage({
  onAnalyze,
  history,
  onClearHistory,
}: LandingPageProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onAnalyze(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed) onAnalyze(trimmed);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="mb-12 max-w-2xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E11D2E]/30 bg-[#E11D2E]/10 px-4 py-1.5">
          <TrendingUp size={14} className="text-[#E11D2E]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#E11D2E]">
            AI-Powered Channel Analysis
          </span>
        </div>

        <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-[#E5E7EB] sm:text-5xl">
          Analyze Any YouTube
          <span className="block text-[#E11D2E]">Channel Instantly</span>
        </h1>
        <p className="text-lg text-[#9CA3AF]">
          Get deep insights, AI-powered growth tips, engagement analytics, and
          data-driven strategies \u2014 all from real channel data.
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl"
        data-ocid="landing.section"
      >
        <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#101B2B] p-2 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/5 px-4">
            <Search size={18} className="shrink-0 text-[#6B7280]" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste YouTube channel URL or @handle..."
              className="w-full bg-transparent py-3 text-sm text-[#E5E7EB] placeholder-[#6B7280] outline-none"
              data-ocid="landing.search_input"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-xl bg-[#E11D2E] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#C0172A] hover:shadow-[0_0_20px_rgba(225,29,46,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
            data-ocid="landing.primary_button"
          >
            Analyze
          </button>
        </div>

        {/* Example chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#6B7280]">Try:</span>
          {EXAMPLE_CHANNELS.map((ch) => (
            <button
              key={ch.value}
              type="button"
              onClick={() => {
                setInput(ch.value);
                onAnalyze(ch.value);
              }}
              className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-medium text-[#9CA3AF] transition-all hover:border-white/15 hover:text-[#E5E7EB]"
              data-ocid="landing.secondary_button"
            >
              {ch.label}
            </button>
          ))}
        </div>
      </form>

      {/* Search History */}
      {history.length > 0 && (
        <div className="mt-10 w-full max-w-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#6B7280]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Recent Analyses
              </span>
            </div>
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-[#6B7280] transition-colors hover:text-[#EF4444]"
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {history.map((entry) => (
              <button
                key={`${entry.channelTitle}-${entry.analyzedAt}`}
                type="button"
                onClick={() => onAnalyze(entry.input)}
                className="group flex w-full items-center gap-3 rounded-xl border border-white/6 bg-[#101B2B] px-4 py-3 text-left transition-all hover:border-white/12 hover:bg-white/5"
              >
                <img
                  src={entry.thumbnail}
                  alt={entry.channelTitle}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#E5E7EB] group-hover:text-white">
                    {entry.channelTitle}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formatSubscribers(entry.subscribers)} subscribers
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#4B5563]">
                  {timeAgo(entry.analyzedAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Features grid */}
      <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {[
          {
            icon: <PlayCircle size={20} className="text-[#22B7FF]" />,
            title: "Video Analytics",
            desc: "Views, likes, comments, and engagement rate for every recent video",
          },
          {
            icon: <TrendingUp size={20} className="text-[#22C55E]" />,
            title: "Growth Insights",
            desc: "AI-powered tips on titles, SEO, posting strategy, and viral ideas",
          },
          {
            icon: <Settings size={20} className="text-[#E11D2E]" />,
            title: "30-Day Plan",
            desc: "Week-by-week action plan tailored to your channel\u2019s specific weaknesses",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-white/6 bg-[#101B2B] p-5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
              {f.icon}
            </div>
            <h3 className="mb-1 text-sm font-semibold text-[#E5E7EB]">
              {f.title}
            </h3>
            <p className="text-xs leading-relaxed text-[#9CA3AF]">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
