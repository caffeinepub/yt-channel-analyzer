import type { AnalysisResult, ChannelData, VideoData } from "../types/youtube";
import { generateInsights } from "./insightsEngine";

const YT_BASE = "https://www.googleapis.com/youtube/v3";

export type ChannelIdentifier =
  | { type: "id"; value: string }
  | { type: "handle"; value: string }
  | { type: "username"; value: string };

// Extended type to carry the uploads playlist ID alongside ChannelData
type ChannelDataWithPlaylist = ChannelData & { _uploadsPlaylistId?: string };

export function extractChannelIdentifier(input: string): ChannelIdentifier {
  const trimmed = input.trim();

  // Full URL patterns
  try {
    const url = new URL(
      trimmed.includes("://") ? trimmed : `https://${trimmed}`,
    );
    const pathname = url.pathname;

    // /channel/UCxxxxx
    const channelMatch = pathname.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
    if (channelMatch) return { type: "id", value: channelMatch[1] };

    // /@handle
    const handleMatch = pathname.match(/\/@([a-zA-Z0-9_.-]+)/);
    if (handleMatch) return { type: "handle", value: handleMatch[1] };

    // /user/username
    const userMatch = pathname.match(/\/user\/([a-zA-Z0-9_.-]+)/);
    if (userMatch) return { type: "username", value: userMatch[1] };

    // /c/customName
    const customMatch = pathname.match(/^\/c\/([a-zA-Z0-9_.-]+)/);
    if (customMatch) return { type: "handle", value: customMatch[1] };

    // Just a path that looks like a handle
    const plainPath = pathname.replace("/", "");
    if (plainPath.startsWith("@"))
      return { type: "handle", value: plainPath.slice(1) };
    if (plainPath.startsWith("UC")) return { type: "id", value: plainPath };
    if (plainPath.length > 0) return { type: "handle", value: plainPath };
  } catch {
    // Not a URL, try other patterns
  }

  // @handle (bare)
  if (trimmed.startsWith("@")) {
    return { type: "handle", value: trimmed.slice(1) };
  }

  // UC... channel ID
  if (/^UC[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return { type: "id", value: trimmed };
  }

  // Default: treat as handle
  return { type: "handle", value: trimmed };
}

async function ytFetch(url: string): Promise<Response> {
  const res = await fetch(url);
  return res;
}

function handleApiError(status: number, data: Record<string, unknown>): never {
  if (status === 403) {
    const errors = (data?.error as Record<string, unknown>)?.errors as
      | Array<{ reason: string }>
      | undefined;
    const reason = errors?.[0]?.reason;
    if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
      throw new Error(
        "QUOTA_EXCEEDED: YouTube API daily quota has been exceeded. Please try again tomorrow.",
      );
    }
    throw new Error(
      "QUOTA_EXCEEDED: Access forbidden. Check your API key permissions.",
    );
  }
  if (status === 400) {
    throw new Error(
      "INVALID_KEY: Invalid API key. Please check your YouTube Data API v3 key in Settings.",
    );
  }
  if (status === 404) {
    throw new Error(
      "NOT_FOUND: Channel not found. Please verify the URL or handle.",
    );
  }
  throw new Error(`NETWORK: API request failed with status ${status}`);
}

export async function fetchChannelData(
  identifier: ChannelIdentifier,
  apiKey: string,
): Promise<ChannelData> {
  let queryParam: string;

  if (identifier.type === "id") {
    queryParam = `id=${encodeURIComponent(identifier.value)}`;
  } else if (identifier.type === "handle") {
    queryParam = `forHandle=${encodeURIComponent(identifier.value)}`;
  } else {
    queryParam = `forUsername=${encodeURIComponent(identifier.value)}`;
  }

  const url = `${YT_BASE}/channels?part=snippet,statistics,contentDetails&${queryParam}&key=${apiKey}`;
  const res = await ytFetch(url);

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    handleApiError(res.status, data);
  }

  const items = data.items as Array<Record<string, unknown>> | undefined;
  if (!items || items.length === 0) {
    // For handles, fall back to username lookup
    if (identifier.type === "handle") {
      const fallbackUrl = `${YT_BASE}/channels?part=snippet,statistics,contentDetails&forUsername=${encodeURIComponent(identifier.value)}&key=${apiKey}`;
      const fallbackRes = await ytFetch(fallbackUrl);
      const fallbackData = (await fallbackRes.json()) as Record<
        string,
        unknown
      >;
      const fallbackItems = fallbackData.items as
        | Array<Record<string, unknown>>
        | undefined;
      if (!fallbackItems || fallbackItems.length === 0) {
        throw new Error(
          "NOT_FOUND: Channel not found. Make sure the URL or handle is correct and the channel is public.",
        );
      }
      return parseChannelItem(fallbackItems[0]);
    }
    throw new Error(
      "NOT_FOUND: Channel not found. Make sure the URL or handle is correct and the channel is public.",
    );
  }

  return parseChannelItem(items[0]);
}

function parseChannelItem(
  item: Record<string, unknown>,
): ChannelDataWithPlaylist {
  const snippet = item.snippet as Record<string, unknown>;
  const statistics = item.statistics as Record<string, unknown>;
  const contentDetails = item.contentDetails as Record<string, unknown>;

  // Store uploadsPlaylistId alongside ChannelData
  const uploadsPlaylistId =
    ((contentDetails?.relatedPlaylists as Record<string, unknown>)
      ?.uploads as string) ?? "";

  const thumbnails = snippet?.thumbnails as
    | Record<string, Record<string, string>>
    | undefined;
  const thumbnailUrl =
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    "";

  const result: ChannelDataWithPlaylist = {
    id: item.id as string,
    title: (snippet?.title as string) ?? "Unknown Channel",
    description: (snippet?.description as string) ?? "",
    thumbnailUrl,
    subscriberCount:
      Number.parseInt((statistics?.subscriberCount as string) ?? "0", 10) || 0,
    viewCount:
      Number.parseInt((statistics?.viewCount as string) ?? "0", 10) || 0,
    videoCount:
      Number.parseInt((statistics?.videoCount as string) ?? "0", 10) || 0,
    publishedAt: (snippet?.publishedAt as string) ?? "",
    country: snippet?.country as string | undefined,
    customUrl: snippet?.customUrl as string | undefined,
    _uploadsPlaylistId: uploadsPlaylistId,
  };

  return result;
}

/** Parse ISO 8601 duration (e.g. "PT4M30S") into total seconds */
export function parseDurationToSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = Number.parseInt(match[1] ?? "0", 10);
  const m = Number.parseInt(match[2] ?? "0", 10);
  const s = Number.parseInt(match[3] ?? "0", 10);
  return h * 3600 + m * 60 + s;
}

export async function fetchRecentVideos(
  channelData: ChannelDataWithPlaylist,
  apiKey: string,
  maxResults = 15,
): Promise<VideoData[]> {
  const uploadsPlaylistId = channelData._uploadsPlaylistId;

  if (!uploadsPlaylistId) {
    // Fetch uploads playlist from channel details
    const chUrl = `${YT_BASE}/channels?part=contentDetails&id=${channelData.id}&key=${apiKey}`;
    const chRes = await ytFetch(chUrl);
    const chData = (await chRes.json()) as Record<string, unknown>;
    const items = chData.items as Array<Record<string, unknown>> | undefined;
    const playlistId = (
      (items?.[0]?.contentDetails as Record<string, unknown>)
        ?.relatedPlaylists as Record<string, string>
    )?.uploads;
    if (!playlistId) return [];
    return fetchPlaylistVideos(playlistId, apiKey, maxResults);
  }

  return fetchPlaylistVideos(uploadsPlaylistId, apiKey, maxResults);
}

async function fetchPlaylistVideos(
  playlistId: string,
  apiKey: string,
  maxResults: number,
): Promise<VideoData[]> {
  const listUrl = `${YT_BASE}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;
  const listRes = await ytFetch(listUrl);
  const listData = (await listRes.json()) as Record<string, unknown>;

  if (!listRes.ok) handleApiError(listRes.status, listData);

  const playlistItems = listData.items as
    | Array<Record<string, unknown>>
    | undefined;
  if (!playlistItems || playlistItems.length === 0) return [];

  const videoIds = playlistItems
    .map(
      (item) =>
        (item.contentDetails as Record<string, unknown>)?.videoId as string,
    )
    .filter(Boolean);

  if (videoIds.length === 0) return [];

  // Fetch snippet, statistics AND contentDetails (for duration)
  const videosUrl = `${YT_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
  const videosRes = await ytFetch(videosUrl);
  const videosData = (await videosRes.json()) as Record<string, unknown>;

  if (!videosRes.ok) handleApiError(videosRes.status, videosData);

  const videoItems = videosData.items as
    | Array<Record<string, unknown>>
    | undefined;
  if (!videoItems) return [];

  return videoItems.map((item) => {
    const snippet = item.snippet as Record<string, unknown>;
    const stats = item.statistics as Record<string, unknown>;
    const contentDetails = item.contentDetails as Record<string, unknown>;

    const viewCount =
      Number.parseInt((stats?.viewCount as string) ?? "0", 10) || 0;
    const likeCount =
      Number.parseInt((stats?.likeCount as string) ?? "0", 10) || 0;
    const commentCount =
      Number.parseInt((stats?.commentCount as string) ?? "0", 10) || 0;
    const engagementRate =
      viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;

    const thumbnails = snippet?.thumbnails as
      | Record<string, Record<string, string>>
      | undefined;
    const thumbnailUrl =
      thumbnails?.medium?.url ?? thumbnails?.default?.url ?? "";

    const duration = (contentDetails?.duration as string) ?? undefined;

    return {
      id: item.id as string,
      title: (snippet?.title as string) ?? "Untitled",
      description: (snippet?.description as string) ?? "",
      thumbnailUrl,
      publishedAt: (snippet?.publishedAt as string) ?? "",
      viewCount,
      likeCount,
      commentCount,
      engagementRate,
      duration,
      tags: snippet?.tags as string[] | undefined,
    } satisfies VideoData;
  });
}

export async function analyzeChannel(
  input: string,
  apiKey: string,
): Promise<AnalysisResult> {
  if (!apiKey || apiKey.trim().length < 10) {
    throw new Error(
      "NO_KEY: No API key configured. Please add your YouTube Data API v3 key in Settings.",
    );
  }

  const identifier = extractChannelIdentifier(input);
  const channelData = await fetchChannelData(identifier, apiKey);
  const videos = await fetchRecentVideos(
    channelData as ChannelDataWithPlaylist,
    apiKey,
    15,
  );

  const sortedByViews = [...videos].sort((a, b) => b.viewCount - a.viewCount);
  const bestVideo = sortedByViews[0] ?? videos[0];
  const worstVideo =
    sortedByViews[sortedByViews.length - 1] ?? videos[videos.length - 1];

  const insights = generateInsights(channelData, videos);

  return { channel: channelData, videos, bestVideo, worstVideo, insights };
}
