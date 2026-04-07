import {
  ChevronDown,
  ChevronUp,
  Eye,
  Globe,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { ChannelData } from "../types/youtube";
import { formatDate, formatNumber } from "../utils/format";

interface ChannelOverviewProps {
  channel: ChannelData;
  onReset: () => void;
}

export function ChannelOverview({ channel, onReset }: ChannelOverviewProps) {
  const [expanded, setExpanded] = useState(false);
  const descriptionLines = channel.description.split("\n").filter(Boolean);
  const shortDesc = descriptionLines.slice(0, 3).join(" ");
  const hasMore = channel.description.length > 200;

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-white/6 bg-[#101B2B] p-5"
      data-ocid="channel.card"
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={
              channel.thumbnailUrl ||
              "https://placehold.co/80x80/101B2B/E5E7EB?text=YT"
            }
            alt={channel.title}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-[#E11D2E] ring-offset-2 ring-offset-[#101B2B]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-[#E5E7EB]">
            {channel.title}
          </h2>
          {channel.customUrl && (
            <a
              href={`https://youtube.com/${channel.customUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#9CA3AF] transition-colors hover:text-[#22B7FF]"
            >
              <Globe size={11} />
              <span className="truncate">{channel.customUrl}</span>
            </a>
          )}
          <div className="mt-1 flex flex-wrap gap-3">
            <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
              <Users size={11} className="text-[#22C55E]" />
              <span className="font-semibold text-[#22C55E]">
                {formatNumber(channel.subscriberCount)}
              </span>{" "}
              subscribers
            </span>
            {channel.country && (
              <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                <MapPin size={11} /> {channel.country}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          {
            label: "Total Views",
            value: formatNumber(channel.viewCount),
            icon: <Eye size={12} className="text-[#22B7FF]" />,
          },
          {
            label: "Total Videos",
            value: formatNumber(channel.videoCount),
            icon: (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E11D2E"
                strokeWidth="2"
                aria-label="Videos"
                role="img"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon
                  points="10 8 16 12 10 16 10 8"
                  fill="#E11D2E"
                  stroke="none"
                />
              </svg>
            ),
          },
          {
            label: "Since",
            value: formatDate(channel.publishedAt).replace(/,.*$/, ""),
            icon: (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
                aria-label="Date"
                role="img"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg bg-white/4 px-3 py-2 text-center"
          >
            <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-[#6B7280]">
              {stat.icon}
              <span>{stat.label}</span>
            </div>
            <div className="text-sm font-bold text-[#E5E7EB]">{stat.value}</div>
          </div>
        ))}
      </div>

      {channel.description && (
        <div className="mt-4 flex-1">
          <p className="text-xs leading-relaxed text-[#9CA3AF]">
            {expanded ? channel.description : shortDesc}
            {hasMore && !expanded && "..."}
          </p>
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 flex items-center gap-1 text-xs font-medium text-[#22B7FF] hover:underline"
              data-ocid="channel.toggle"
            >
              {expanded ? (
                <>
                  <ChevronUp size={12} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={12} /> Show more
                </>
              )}
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E11D2E]/30 bg-[#E11D2E]/10 py-2.5 text-sm font-semibold text-[#E11D2E] transition-all hover:bg-[#E11D2E]/20"
        data-ocid="channel.secondary_button"
      >
        <RefreshCw size={14} />
        Analyze Another Channel
      </button>
    </div>
  );
}
