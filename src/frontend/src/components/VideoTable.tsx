import {
  ArrowUpDown,
  Award,
  DollarSign,
  Eye,
  MessageCircle,
  ThumbsUp,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";
import type { VideoData } from "../types/youtube";
import { formatEngagement, formatNumber, timeAgo } from "../utils/format";

type SortKey = "views" | "engagement" | "date";

interface VideoTableProps {
  videos: VideoData[];
  bestVideo: VideoData;
  worstVideo: VideoData;
  /** CPM range [min, max] derived from niche detection */
  cpmRange?: [number, number];
}

function formatIncome(views: number, cpmRange: [number, number]): string {
  if (views === 0) return "$0";
  const CREATOR_SHARE = 0.45;
  const [cpmMin, cpmMax] = cpmRange;
  const low = Math.round((views / 1000) * cpmMin * CREATOR_SHARE);
  const high = Math.round((views / 1000) * cpmMax * CREATOR_SHARE);
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n}`;
  };
  return `${fmt(low)} – ${fmt(high)}`;
}

export function VideoTable({
  videos,
  bestVideo,
  worstVideo,
  cpmRange = [2, 5],
}: VideoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("views");

  const sorted = [...videos].sort((a, b) => {
    if (sortKey === "views") return b.viewCount - a.viewCount;
    if (sortKey === "engagement") return b.engagementRate - a.engagementRate;
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  function engBadgeStyle(rate: number) {
    if (rate >= 3) return { bg: "rgba(34,197,94,0.15)", color: "#22C55E" };
    if (rate >= 1) return { bg: "rgba(245,158,11,0.15)", color: "#F59E0B" };
    return { bg: "rgba(239,68,68,0.15)", color: "#EF4444" };
  }

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-white/6 bg-[#101B2B]"
      data-ocid="videos.panel"
    >
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
        <h3 className="text-sm font-bold text-[#E5E7EB]">Recent Videos</h3>
        <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/4 p-1">
          {(["views", "engagement", "date"] as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortKey(key)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition-all ${
                sortKey === key
                  ? "bg-[#E11D2E] text-white"
                  : "text-[#9CA3AF] hover:text-[#E5E7EB]"
              }`}
              data-ocid="videos.tab"
            >
              {key === "views" && <Eye size={10} />}
              {key === "engagement" && <ArrowUpDown size={10} />}
              {key === "date" && <span>&#128197;</span>}
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "480px" }}>
        {sorted.map((video, i) => {
          const isBest = video.id === bestVideo?.id;
          const isWorst = video.id === worstVideo?.id;
          const badgeStyle = engBadgeStyle(video.engagementRate);
          const incomeStr = formatIncome(video.viewCount, cpmRange);

          return (
            <div
              key={video.id}
              className={`border-b border-white/4 p-3 transition-colors last:border-b-0 hover:bg-white/3 ${
                isBest ? "best-video-glow" : ""
              } ${isWorst ? "worst-video-border" : ""}`}
              style={{
                borderLeft: isBest
                  ? "3px solid #22C55E"
                  : isWorst
                    ? "3px solid rgba(239,68,68,0.5)"
                    : "3px solid transparent",
              }}
              data-ocid={`videos.item.${i + 1}`}
            >
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <img
                    src={
                      video.thumbnailUrl ||
                      "https://placehold.co/80x45/101B2B/6B7280?text=Video"
                    }
                    alt=""
                    className="h-[45px] w-[80px] rounded-md object-cover"
                    loading="lazy"
                  />
                  {isBest && (
                    <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E]">
                      <Award size={11} className="text-white" />
                    </div>
                  )}
                  {isWorst && (
                    <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444]">
                      <TrendingDown size={11} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="mb-1.5 line-clamp-2 text-xs font-medium leading-snug text-[#E5E7EB]"
                    title={video.title}
                  >
                    {video.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                      <Eye size={9} className="text-[#22B7FF]" />
                      {formatNumber(video.viewCount)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                      <ThumbsUp size={9} className="text-[#22C55E]" />
                      {formatNumber(video.likeCount)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                      <MessageCircle size={9} className="text-[#A78BFA]" />
                      {formatNumber(video.commentCount)}
                    </span>

                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                      }}
                    >
                      {formatEngagement(video.engagementRate)}
                    </span>

                    {/* Est. Income badge */}
                    <span
                      className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{
                        background: "rgba(34,197,94,0.12)",
                        color: "#22C55E",
                      }}
                      title="Estimated creator income (45% revenue share)"
                    >
                      <DollarSign size={8} />
                      {incomeStr}
                    </span>

                    <span className="text-[10px] text-[#6B7280]">
                      {timeAgo(video.publishedAt)}
                    </span>
                  </div>

                  {isBest && (
                    <span className="mt-1 inline-block rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[9px] font-bold text-[#22C55E]">
                      Best Performer
                    </span>
                  )}
                  {isWorst && (
                    <span className="mt-1 inline-block rounded-full bg-[#EF4444]/15 px-2 py-0.5 text-[9px] font-bold text-[#EF4444]">
                      Lowest Engagement
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
