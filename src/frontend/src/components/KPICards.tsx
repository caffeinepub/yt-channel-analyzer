import { BarChart2, Eye, TrendingUp, Users, Video } from "lucide-react";
import type { AnalysisResult } from "../types/youtube";
import { formatEngagement, formatNumber } from "../utils/format";

interface KPICardsProps {
  result: AnalysisResult;
}

export function KPICards({ result }: KPICardsProps) {
  const { channel, insights } = result;
  const eng = insights.avgEngagementRate;

  const engColor =
    eng >= 3
      ? {
          val: "#22C55E",
          bg: "rgba(34,197,94,0.12)",
          border: "rgba(34,197,94,0.25)",
        }
      : eng >= 1
        ? {
            val: "#F59E0B",
            bg: "rgba(245,158,11,0.12)",
            border: "rgba(245,158,11,0.25)",
          }
        : {
            val: "#EF4444",
            bg: "rgba(239,68,68,0.12)",
            border: "rgba(239,68,68,0.25)",
          };

  const cards = [
    {
      id: "subscribers",
      label: "Subscribers",
      value: formatNumber(channel.subscriberCount),
      icon: <Users size={18} />,
      color: "#22C55E",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.2)",
      suffix:
        channel.subscriberCount >= 1_000_000 ? (
          <span className="flex items-center gap-1 text-xs text-[#22C55E]">
            <TrendingUp size={11} /> 1M+
          </span>
        ) : null,
    },
    {
      id: "views",
      label: "Total Views",
      value: formatNumber(channel.viewCount),
      icon: <Eye size={18} />,
      color: "#22B7FF",
      bg: "rgba(34,183,255,0.1)",
      border: "rgba(34,183,255,0.2)",
      suffix: null,
    },
    {
      id: "engagement",
      label: "Avg Engagement",
      value: formatEngagement(eng),
      icon: <BarChart2 size={18} />,
      color: engColor.val,
      bg: engColor.bg,
      border: engColor.border,
      suffix: (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: engColor.bg, color: engColor.val }}
        >
          {eng >= 3 ? "Excellent" : eng >= 1 ? "Average" : "Low"}
        </span>
      ),
    },
    {
      id: "videos",
      label: "Videos Published",
      value: formatNumber(channel.videoCount),
      icon: <Video size={18} />,
      color: "#A78BFA",
      bg: "rgba(167,139,250,0.1)",
      border: "rgba(167,139,250,0.2)",
      suffix: (
        <span className="text-xs text-[#9CA3AF]">
          {insights.postingFrequency}
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3" data-ocid="kpi.panel">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className="flex flex-col rounded-2xl border p-4"
          style={{
            background: "linear-gradient(135deg, #101B2B 0%, #0F1726 100%)",
            borderColor: card.border,
          }}
          data-ocid={`kpi.card.${i + 1}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">
              {card.label}
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: card.color }}>
            {card.value}
          </div>
          {card.suffix && <div className="mt-1.5">{card.suffix}</div>}
        </div>
      ))}
    </div>
  );
}
