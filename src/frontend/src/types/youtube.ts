export interface ChannelData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  publishedAt: string;
  country?: string;
  customUrl?: string;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  duration?: string; // ISO 8601 e.g. "PT4M30S"
  tags?: string[];
}

export interface SEOTips {
  keywords: string[];
  tags: string[];
  descriptionTips: string[];
}

export interface GrowthWeek {
  week: string;
  goal: string;
  actions: string[];
}

export interface DayPlan {
  day: string;
  title: string;
  topic: string;
  videoIdea: string;
  thumbnailIdea: string;
  format: string;
}

export interface Insights {
  mistakes: string[];
  titleSuggestions: string[];
  seoTips: SEOTips;
  viralIdeas: string[];
  strategyTips: string[];
  growthPlan: GrowthWeek[];
  sevenDayPlan: DayPlan[];
  avgEngagementRate: number;
  postingFrequency: string;
  niche: string;
}

export interface AnalysisResult {
  channel: ChannelData;
  videos: VideoData[];
  bestVideo: VideoData;
  worstVideo: VideoData;
  insights: Insights;
}

export type AppState = "landing" | "loading" | "dashboard" | "error";

export interface ApiError {
  type:
    | "no_key"
    | "not_found"
    | "quota_exceeded"
    | "private"
    | "invalid_url"
    | "network";
  message: string;
}
