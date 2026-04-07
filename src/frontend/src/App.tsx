import {
  AlertTriangle,
  Clock,
  Loader2,
  Lock,
  RefreshCw,
  Settings,
  WifiOff,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { SettingsModal } from "./components/SettingsModal";
import { Toaster } from "./components/ui/sonner";
import type { AnalysisResult, ApiError, AppState } from "./types/youtube";
import { analyzeChannel } from "./utils/youtubeApi";

const BUILT_IN_KEY = ["AIzaSyAfo_oBE0N", "_Ge0G1panYqlTE1OlkEFGHFI"].join("");
const HISTORY_STORAGE = "yt_analyzer_history";

export type HistoryEntry = {
  input: string;
  channelTitle: string;
  channelHandle: string;
  thumbnail: string;
  subscribers: number;
  analyzedAt: number;
};

const LOADING_STEPS = [
  "Fetching channel info...",
  "Loading recent videos...",
  "Generating AI insights...",
];

function parseApiError(err: unknown): ApiError {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("NO_KEY")) {
    return {
      type: "no_key",
      message:
        "No API key configured. Please add your YouTube Data API v3 key in Settings.",
    };
  }
  if (msg.includes("QUOTA_EXCEEDED")) {
    return {
      type: "quota_exceeded",
      message:
        "YouTube API daily quota exceeded. The free tier allows 10,000 units/day. Please try again tomorrow.",
    };
  }
  if (msg.includes("INVALID_KEY")) {
    return {
      type: "invalid_url",
      message:
        "Invalid API key. Please double-check your YouTube Data API v3 key in Settings.",
    };
  }
  if (msg.includes("NOT_FOUND")) {
    return {
      type: "not_found",
      message:
        "Channel not found. Try a different URL format:\n\u2022 @handle (e.g. @mkbhd)\n\u2022 Full URL (e.g. https://youtube.com/@mkbhd)\n\u2022 Channel ID (starts with UC)",
    };
  }
  if (msg.includes("private") || msg.includes("PRIVATE")) {
    return {
      type: "private",
      message:
        "This channel is set to private. Only the channel owner can access private channel data.",
    };
  }
  if (
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("NETWORK")
  ) {
    return {
      type: "network",
      message:
        "Network error. Please check your internet connection and try again.",
    };
  }
  return {
    type: "network",
    message: `Something went wrong: ${msg}`,
  };
}

function ErrorIcon({ type }: { type: ApiError["type"] }) {
  switch (type) {
    case "quota_exceeded":
      return <Clock size={32} className="text-amber-400" />;
    case "private":
      return <Lock size={32} className="text-[#9CA3AF]" />;
    case "network":
      return <WifiOff size={32} className="text-[#EF4444]" />;
    default:
      return <AlertTriangle size={32} className="text-amber-400" />;
  }
}

function LoadingScreen({ step }: { step: number }) {
  return (
    <div
      className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4"
      data-ocid="loading.loading_state"
    >
      <div className="relative mb-8">
        <div
          className="h-16 w-16 rounded-full border-4 border-white/8"
          style={{ borderTopColor: "#E11D2E" }}
        />
        <div
          className="spin-slow absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent"
          style={{ borderTopColor: "#E11D2E" }}
        />
        <Youtube
          size={24}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#E11D2E]"
        />
      </div>

      <h2 className="mb-6 text-lg font-bold text-[#E5E7EB]">
        Analyzing Channel...
      </h2>

      <div className="w-full max-w-xs space-y-3">
        {LOADING_STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
              i < step
                ? "bg-[#22C55E]/10"
                : i === step
                  ? "bg-white/5 step-appear"
                  : "opacity-30"
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i < step
                  ? "bg-[#22C55E] text-white"
                  : i === step
                    ? "border-2 border-[#E11D2E] text-[#E11D2E]"
                    : "border border-white/20 text-[#6B7280]"
              }`}
            >
              {i < step ? "\u2713" : i + 1}
            </div>
            <span
              className={`text-sm ${
                i < step
                  ? "text-[#22C55E]"
                  : i === step
                    ? "font-medium text-[#E5E7EB]"
                    : "text-[#6B7280]"
              }`}
            >
              {s}
            </span>
            {i === step && (
              <Loader2
                size={14}
                className="ml-auto animate-spin text-[#E11D2E]"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorScreen({
  error,
  onRetry,
  onOpenSettings,
}: {
  error: ApiError;
  onRetry: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4"
      data-ocid="error.error_state"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-[#101B2B] p-8 text-center">
        <div className="mb-4 flex justify-center">
          <ErrorIcon type={error.type} />
        </div>
        <h2 className="mb-2 text-lg font-bold text-[#E5E7EB]">
          {error.type === "no_key" && "API Key Required"}
          {error.type === "not_found" && "Channel Not Found"}
          {error.type === "quota_exceeded" && "Daily Quota Exceeded"}
          {error.type === "private" && "Private Channel"}
          {error.type === "network" && "Connection Error"}
          {error.type === "invalid_url" && "Invalid API Key"}
        </h2>
        <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-[#9CA3AF]">
          {error.message}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {error.type === "no_key" || error.type === "invalid_url" ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E11D2E] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#C0172A]"
              data-ocid="error.primary_button"
            >
              <Settings size={15} />
              Open Settings
            </button>
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E11D2E] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#C0172A]"
              data-ocid="error.primary_button"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          )}
          <button
            type="button"
            onClick={onRetry}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-[#9CA3AF] transition-colors hover:border-white/20 hover:text-[#E5E7EB]"
            data-ocid="error.cancel_button"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_STORAGE, JSON.stringify(entries));
}

export default function App() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  const apiKey = BUILT_IN_KEY;

  async function handleAnalyze(input: string) {
    setAppState("loading");
    setLoadingStep(0);
    setError(null);

    const t1 = setTimeout(() => setLoadingStep(1), 1500);
    const t2 = setTimeout(() => setLoadingStep(2), 3000);

    try {
      const data = await analyzeChannel(input, apiKey);
      clearTimeout(t1);
      clearTimeout(t2);
      setLoadingStep(3);
      setResult(data);

      // Save to history
      const entry: HistoryEntry = {
        input,
        channelTitle: data.channel.title,
        channelHandle: data.channel.customUrl || input,
        thumbnail: data.channel.thumbnailUrl,
        subscribers: data.channel.subscriberCount,
        analyzedAt: Date.now(),
      };
      setHistory((prev) => {
        // Remove duplicate if same channel
        const filtered = prev.filter(
          (h) => h.channelTitle !== entry.channelTitle,
        );
        const updated = [entry, ...filtered].slice(0, 10);
        saveHistory(updated);
        return updated;
      });

      setTimeout(() => setAppState("dashboard"), 400);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      const parsed = parseApiError(err);
      setError(parsed);
      setAppState("error");
    }
  }

  function handleReset() {
    setAppState("landing");
    setResult(null);
    setError(null);
    setLoadingStep(0);
  }

  function handleClearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE);
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #0B1220 0%, #0A0F1A 100%)",
      }}
    >
      <header
        className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/6 px-4 lg:px-6"
        style={{ background: "#0E1826", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E11D2E]">
            <Youtube size={18} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#E5E7EB]">
            YT Channel Analyzer
          </span>
        </div>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {["Dashboard", "Analytics", "Insights"].map((link) => (
            <button
              key={link}
              type="button"
              onClick={() =>
                appState === "dashboard" &&
                document
                  .getElementById(`section-${link.toLowerCase()}`)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-sm font-medium text-[#9CA3AF] transition-colors hover:text-[#E5E7EB]"
              data-ocid="header.link"
            >
              {link}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-[#9CA3AF] transition-all hover:border-white/20 hover:text-[#E5E7EB]"
            aria-label="About"
            data-ocid="header.settings_button"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {appState === "landing" && (
        <LandingPage
          onAnalyze={handleAnalyze}
          history={history}
          onClearHistory={handleClearHistory}
        />
      )}

      {appState === "loading" && <LoadingScreen step={loadingStep} />}

      {appState === "dashboard" && result && (
        <Dashboard
          result={result}
          onReset={handleReset}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {appState === "error" && error && (
        <ErrorScreen
          error={error}
          onRetry={handleReset}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <Toaster />
    </div>
  );
}
