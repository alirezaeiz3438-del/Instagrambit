import { AIProfile, PageStrategy, PostItem, IdeaItem, AdFilterConfig, BrandAssetConfig, InstagramApiConfig, SystemLog, AnalyticsSummary } from '../types';

export const api = {
  // AI Profiles
  getAIProfiles: async (): Promise<AIProfile[]> => {
    const res = await fetch('/api/ai-profiles');
    const data = await res.json();
    return data.profiles;
  },

  addAIProfile: async (profile: Partial<AIProfile>): Promise<AIProfile> => {
    const res = await fetch('/api/ai-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    return data.profile;
  },

  toggleAIProfile: async (id: string): Promise<AIProfile> => {
    const res = await fetch(`/api/ai-profiles/${id}/toggle`, { method: 'PUT' });
    const data = await res.json();
    return data.profile;
  },

  deleteAIProfile: async (id: string): Promise<void> => {
    await fetch(`/api/ai-profiles/${id}`, { method: 'DELETE' });
  },

  // Strategy
  getStrategy: async (): Promise<PageStrategy> => {
    const res = await fetch('/api/strategy');
    const data = await res.json();
    return data.strategy;
  },

  updateStrategy: async (strategy: Partial<PageStrategy>): Promise<PageStrategy> => {
    const res = await fetch('/api/strategy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategy),
    });
    const data = await res.json();
    return data.strategy;
  },

  // Ad Filter
  getAdFilterConfig: async (): Promise<AdFilterConfig> => {
    const res = await fetch('/api/ad-filter');
    const data = await res.json();
    return data.config;
  },

  updateAdFilterConfig: async (config: Partial<AdFilterConfig>): Promise<AdFilterConfig> => {
    const res = await fetch('/api/ad-filter', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    return data.config;
  },

  verifyAdText: async (text: string): Promise<{ isAd: boolean; matchedKeywords: string[]; reason: string }> => {
    const res = await fetch('/api/ad-filter/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // Ideas
  getIdeas: async (): Promise<IdeaItem[]> => {
    const res = await fetch('/api/ideas');
    const data = await res.json();
    return data.ideas;
  },

  generateIdeas: async (count: number = 3, topic?: string): Promise<IdeaItem[]> => {
    const res = await fetch('/api/ideas/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, topic }),
    });
    const data = await res.json();
    return data.ideas;
  },

  updateIdeaStatus: async (id: string, status: IdeaItem['status']): Promise<IdeaItem> => {
    const res = await fetch(`/api/ideas/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return data.idea;
  },

  // Posts Studio
  getPosts: async (): Promise<PostItem[]> => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    return data.posts;
  },

  generatePost: async (ideaTitle: string, ideaDescription?: string, postType: PostItem['postType'] = 'post'): Promise<PostItem> => {
    const res = await fetch('/api/posts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaTitle, ideaDescription, postType }),
    });
    const data = await res.json();
    return data.post;
  },

  updatePost: async (id: string, postData: Partial<PostItem>): Promise<PostItem> => {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    return data.post;
  },

  deletePost: async (id: string): Promise<void> => {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
  },

  publishPostNow: async (id: string): Promise<{ success: boolean; post: PostItem }> => {
    const res = await fetch(`/api/instagram/publish/${id}`, { method: 'POST' });
    return res.json();
  },

  // Instagram Config
  getInstagramConfig: async (): Promise<InstagramApiConfig> => {
    const res = await fetch('/api/instagram/config');
    const data = await res.json();
    return data.config;
  },

  updateInstagramConfig: async (config: Partial<InstagramApiConfig>): Promise<InstagramApiConfig> => {
    const res = await fetch('/api/instagram/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    return data.config;
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsSummary> => {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    return data.analytics;
  },

  optimizePromptFromAnalytics: async (): Promise<{ strategy: PageStrategy; insights: string[] }> => {
    const res = await fetch('/api/analytics/optimize-prompt', { method: 'POST' });
    return res.json();
  },

  // Brand Assets
  getBrandAssets: async (): Promise<BrandAssetConfig> => {
    const res = await fetch('/api/brand-assets');
    const data = await res.json();
    return data.assets;
  },

  updateBrandAssets: async (assets: Partial<BrandAssetConfig>): Promise<BrandAssetConfig> => {
    const res = await fetch('/api/brand-assets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assets),
    });
    const data = await res.json();
    return data.assets;
  },

  // Logs
  getLogs: async (): Promise<SystemLog[]> => {
    const res = await fetch('/api/logs');
    const data = await res.json();
    return data.logs;
  },

  // Installer Script CLI Test
  runInstallerOption: async (option: number): Promise<{ success: boolean; output: string }> => {
    const res = await fetch('/api/run-installer-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option }),
    });
    return res.json();
  },
};
