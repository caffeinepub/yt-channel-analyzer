import { CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react";
import type { ChannelData, VideoData } from "../types/youtube";
import { parseDurationToSeconds } from "../utils/youtubeApi";

interface MonetizationCardProps {
  channel: ChannelData;
  videos: VideoData[];
  niche: string;
}

// Niche CPM ranges [min, max]
const NICHE_CPM: Record<string, [number, number]> = {
  finance: [8, 15],
  business: [8, 15],
  investing: [8, 15],
  tech: [5, 10],
  software: [5, 10],
  programming: [5, 10],
  education: [4, 8],
  tutorial: [4, 8],
  health: [3, 6],
  fitness: [3, 6],
  wellness: [3, 6],
  gaming: [2, 4],
  game: [2, 4],
  lifestyle: [2, 4],
  vlog: [2, 4],
  cooking: [2, 5],
  food: [2, 5],
  recipe: [2, 5],
  music: [1, 3],
};

export function getCPM(niche: string): [number, number] {
  const lower = niche.toLowerCase();
  for (const [key, cpm] of Object.entries(NICHE_CPM)) {
    if (lower.includes(key)) return cpm;
  }
  return [2, 5]; // default
}

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatHours(hours: number): string {
  if (hours >= 1_000_000) return `${(hours / 1_000_000).toFixed(1)}M hrs`;
  if (hours >= 1_000) return `${(hours / 1_000).toFixed(1)}K hrs`;
  return `${Math.round(hours).toLocaleString()} hrs`;
}

/** Filter videos to those published within the last 365 days (rolling window) */
function filterLast365Days(videos: VideoData[]): VideoData[] {
  const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
  return videos.filter((v) => new Date(v.publishedAt).getTime() >= cutoff);
}

function calcWatchTimeHours(videos: VideoData[]): {
  totalHours: number;
  avgMinutes: number;
  videoCount: number;
} {
  if (videos.length === 0)
    return { totalHours: 0, avgMinutes: 8, videoCount: 0 };

  const DEFAULT_DURATION_SECS = 8 * 60;

  let totalSecs = 0;

  for (const v of videos) {
    const secs = v.duration
      ? parseDurationToSeconds(v.duration)
      : DEFAULT_DURATION_SECS;
    totalSecs += secs * v.viewCount;
  }

  const avgDurationSecs =
    videos.reduce((sum, v) => {
      return (
        sum +
        (v.duration
          ? parseDurationToSeconds(v.duration)
          : DEFAULT_DURATION_SECS)
      );
    }, 0) / videos.length;

  const totalHours = totalSecs / 3600;
  const avgMinutes = Math.round(avgDurationSecs / 60);

  return { totalHours, avgMinutes, videoCount: videos.length };
}

function calcMonthlyViews(videos: VideoData[]): number {
  if (videos.length === 0) return 0;
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentViews = videos
    .filter((v) => new Date(v.publishedAt).getTime() >= thirtyDaysAgo)
    .reduce((sum, v) => sum + v.viewCount, 0);
  // If no recent videos in last 30 days, estimate from weekly average of all fetched
  if (recentViews === 0) {
    const totalFetchedViews = videos.reduce((s, v) => s + v.viewCount, 0);
    return Math.round((totalFetchedViews / videos.length) * 4);
  }
  return recentViews;
}

function ProgressBar({
  value,
  max,
  done,
}: {
  value: number;
  max: number;
  done: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full transition-all duration-700 ${done ? "bg-[#22C55E]" : "bg-amber-400"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MonetizationCard({
  channel,
  videos,
  niche,
}: MonetizationCardProps) {
  const [cpmMin, cpmMax] = getCPM(niche);
  const CREATOR_SHARE = 0.55;

  // Lifetime income
  const totalViews = channel.viewCount;
  const lifetimeMin = Math.round((totalViews / 1000) * cpmMin * CREATOR_SHARE);
  const lifetimeMax = Math.round((totalViews / 1000) * cpmMax * CREATOR_SHARE);

  // Monthly income
  const monthlyViews = calcMonthlyViews(videos);
  const monthlyMin = Math.round((monthlyViews / 1000) * cpmMin * CREATOR_SHARE);
  const monthlyMax = Math.round((monthlyViews / 1000) * cpmMax * CREATOR_SHARE);

  // Watch time — last 365 days only (rolling window)
  const videos365 = filterLast365Days(videos);
  const { totalHours, avgMinutes } = calcWatchTimeHours(videos365);

  // YPP criteria (uses all-time channel watch hours estimate via total channel views)
  const allTimeWatchHours = (() => {
    if (videos.length === 0) return 0;
    const DEFAULT_SECS = 8 * 60;
    const avgDur =
      videos.reduce(
        (s, v) =>
          s + (v.duration ? parseDurationToSeconds(v.duration) : DEFAULT_SECS),
        0,
      ) / videos.length;
    const avgViews = channel.viewCount / Math.max(channel.videoCount, 1);
    return (avgViews * channel.videoCount * avgDur) / 3600;
  })();

  const SUB_GOAL = 1000;
  const WATCH_GOAL = 4000;
  const subsDone = channel.subscriberCount >= SUB_GOAL;
  const watchDone = allTimeWatchHours >= WATCH_GOAL;
  const subsLeft = Math.max(0, SUB_GOAL - channel.subscriberCount);
  const watchLeft = Math.max(0, WATCH_GOAL - allTimeWatchHours);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Income Card */}
      <div
        className="col-span-1 rounded-2xl border border-white/8 bg-[#101B2B] p-5"
        data-ocid="monetization.income"
      >
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/15">
            <DollarSign size={18} className="text-[#22C55E]" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
              Income Estimates
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-0.5 text-xs text-[#6B7280]">Monthly</p>
            <p className="text-xl font-bold text-[#22C55E]">
              {formatMoney(monthlyMin)} – {formatMoney(monthlyMax)}
            </p>
          </div>
          <div className="h-px bg-white/6" />
          <div>
            <p className="mb-0.5 text-xs text-[#6B7280]">Lifetime Total</p>
            <p className="text-xl font-bold text-[#22C55E]">
              {formatMoney(lifetimeMin)} – {formatMoney(lifetimeMax)}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-[#4B5563]">
          Estimates based on {niche} CPM averages (${cpmMin}–${cpmMax}) · 55%
          creator share
        </p>
      </div>

      {/* Watch Time Card */}
      <div
        className="col-span-1 rounded-2xl border border-white/8 bg-[#101B2B] p-5"
        data-ocid="monetization.watchtime"
      >
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22B7FF]/15">
            <Clock size={18} className="text-[#22B7FF]" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
              Watch Time
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-0.5 text-xs text-[#6B7280]">
              Last 365 Days Watch Time
            </p>
            <p className="text-xl font-bold text-[#22B7FF]">
              {formatHours(totalHours)}
            </p>
            <p className="mt-0.5 text-[10px] text-[#4B5563]">
              Rolling 12-month window
            </p>
          </div>
          <div className="h-px bg-white/6" />
          <div>
            <p className="mb-0.5 text-xs text-[#6B7280]">Avg Video Length</p>
            <p className="text-xl font-bold text-[#22B7FF]">{avgMinutes} min</p>
          </div>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-[#4B5563]">
          Based on {videos365.length} video{videos365.length !== 1 ? "s" : ""}{" "}
          published in the past 365 days
        </p>
      </div>

      {/* YPP Eligibility Card */}
      <div
        className="col-span-1 rounded-2xl border border-white/8 bg-[#101B2B] p-5"
        data-ocid="monetization.ypp"
      >
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E11D2E]/15">
            <TrendingUp size={18} className="text-[#E11D2E]" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
              YPP Eligibility
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Subscribers */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs text-[#9CA3AF]">Subscribers</p>
              {subsDone ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#22C55E]">
                  <CheckCircle2 size={13} /> Done
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-400">
                  {subsLeft.toLocaleString()} left
                </span>
              )}
            </div>
            <ProgressBar
              value={channel.subscriberCount}
              max={SUB_GOAL}
              done={subsDone}
            />
            <div className="mt-1 flex justify-between">
              <span className="text-[10px] text-[#6B7280]">
                {channel.subscriberCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B7280]">1,000 required</span>
            </div>
          </div>

          {/* Watch Hours */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs text-[#9CA3AF]">Watch Hours (4K)</p>
              {watchDone ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#22C55E]">
                  <CheckCircle2 size={13} /> Done
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-400">
                  {Math.round(watchLeft).toLocaleString()} hrs left
                </span>
              )}
            </div>
            <ProgressBar
              value={allTimeWatchHours}
              max={WATCH_GOAL}
              done={watchDone}
            />
            <div className="mt-1 flex justify-between">
              <span className="text-[10px] text-[#6B7280]">
                {formatHours(allTimeWatchHours)}
              </span>
              <span className="text-[10px] text-[#6B7280]">4,000 required</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-[#4B5563]">
          {subsDone && watchDone
            ? "✓ Meets both YPP requirements"
            : "Requirements for YouTube Partner Program"}
        </p>
      </div>
    </div>
  );
}
