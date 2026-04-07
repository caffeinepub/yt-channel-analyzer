import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VideoData } from "../types/youtube";
import { formatNumber } from "../utils/format";

interface ChartsSectionProps {
  videos: VideoData[];
}

interface ChartEntry {
  name: string;
  fullTitle: string;
  views: number;
  engagement: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: "#0F1726",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        maxWidth: "220px",
      }}
    >
      <p
        style={{
          color: "#9CA3AF",
          fontSize: "11px",
          marginBottom: "6px",
          wordBreak: "break-word",
          lineHeight: "1.4",
        }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "#9CA3AF" }}>{entry.name}</span>
          <span style={{ color: entry.color, fontWeight: 700 }}>
            {entry.name === "Views"
              ? formatNumber(entry.value)
              : `${entry.value.toFixed(2)}%`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartsSection({ videos }: ChartsSectionProps) {
  const data: ChartEntry[] = videos
    .slice()
    .reverse()
    .map((v) => ({
      name: v.title.length > 14 ? `${v.title.slice(0, 13)}\u2026` : v.title,
      fullTitle: v.title,
      views: v.viewCount,
      engagement: Math.round(v.engagementRate * 100) / 100,
    }));

  return (
    <div
      className="rounded-2xl border border-white/6 bg-[#101B2B] p-5"
      data-ocid="charts.panel"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#E5E7EB]">
            Views &amp; Engagement Trend
          </h3>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Latest {videos.length} videos \u2014 chronological order
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[#9CA3AF]">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#22B7FF]" />
            Views
          </span>
          <span className="flex items-center gap-1.5 text-[#9CA3AF]">
            <span
              className="inline-block h-0 w-4 border-t-2 border-dashed"
              style={{ borderColor: "#EF4444" }}
            />
            Engagement
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 48, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6B7280", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            interval={0}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fill: "#6B7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatNumber(v as number)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#6B7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ display: "none" }} />
          <Bar
            yAxisId="left"
            dataKey="views"
            name="Views"
            fill="#22B7FF"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="engagement"
            name="Engagement %"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: "#EF4444", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#EF4444" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
