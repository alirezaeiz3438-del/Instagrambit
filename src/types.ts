export type AIProvider = 'gemini' | 'imagen';

export interface AIProfile {
  id: string;
  name: string;
  apiKey: string; // Masked on frontend
  provider: AIProvider;
  model: string;
  dailyQuota: number; // e.g. 1500 requests or tokens
  usageToday: number;
  totalUsage: number;
  isActive: boolean;
  isRateLimited: boolean;
  rateLimitResetTime?: string;
  lastUsedAt?: string;
  errorCount: number;
}

export interface PageStrategy {
  niche: string; // e.g., 'آشپزی و دستور غذا', 'تکنولوژی و هوش مصنوعی', 'انگیزشی و رشد فردی', 'اخبار محلی و تحلیلی'
  targetAudience: string; // e.g. 'جوانان ۲۰ تا ۳۵ سال علاقه‌مند به یادگیری و پیشرفت'
  tone: 'formal' | 'friendly' | 'humorous' | 'professional' | 'persuasive'; // لحن
  visualStyle: string; // e.g. 'مینیمال، با رنگ‌های روشن و فونت خوانا'
  customSystemPrompt: string;
  samplePosts: string[];
  defaultHashtags: string[];
  ctaPreference: string;
}

export type PostStatus = 'draft' | 'pending_approval' | 'scheduled' | 'published' | 'failed';
export type PostType = 'post' | 'reels' | 'story' | 'carousel';

export interface PostMetrics {
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
  engagementRate: number;
}

export interface CarouselSlide {
  slideNumber: number;
  title: string;
  bodyText: string;
  imagePrompt: string;
  imageUrl: string;
}

export interface VideoScene {
  timestamp: string;
  sceneDescription: string;
  voiceoverText: string;
  visualPrompt: string;
}

export interface PostItem {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  imageUrl?: string;
  carouselSlides?: CarouselSlide[];
  videoUrl?: string;
  videoPrompt?: string;
  videoScript?: string;
  storyboard?: VideoScene[];
  postType: PostType;
  status: PostStatus;
  createdAt: string;
  scheduledAt?: string;
  publishedAt?: string;
  instagramPostId?: string;
  metrics?: PostMetrics;
  feedbackApplied?: boolean;
  aiProfileUsed?: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  source: 'telegram' | 'ai_trend' | 'manual' | 'holiday_calendar';
  channelName?: string;
  rawText?: string;
  isAd: boolean;
  adReason?: string;
  status: 'new' | 'approved' | 'rejected' | 'converted';
  createdAt: string;
}

export interface AdFilterConfig {
  enabled: boolean;
  aiCheckEnabled: boolean;
  aiSensitivity: 'low' | 'medium' | 'high';
  keywords: string[];
  loggedAds: {
    id: string;
    text: string;
    channel?: string;
    detectedAt: string;
    reason: string;
    isAd: boolean;
  }[];
}

export interface BrandAssetConfig {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontName: string;
  watermarkPosition: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center';
  watermarkOpacity: number;
  templateStyle: 'minimal' | 'bold_headline' | 'quote_card' | 'gradient_overlay';
}

export interface InstagramApiConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  businessAccountId: string;
  pageName: string;
  isSandboxMode: boolean; // Simulates Instagram API without throwing credentials error
  autoPublishEnabled: boolean;
  bestPostingHours: string[]; // e.g. ['12:00', '18:00', '21:00']
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  module: 'ai_engine' | 'instagram' | 'telegram' | 'ad_filter' | 'system';
  message: string;
}

export interface AnalyticsSummary {
  totalFollowers: number;
  followerGrowthWeek: number;
  avgEngagementRate: number;
  totalPostsPublished: number;
  totalReachWeek: number;
  aiInsights: string[];
  topPerformingPosts: PostItem[];
}
