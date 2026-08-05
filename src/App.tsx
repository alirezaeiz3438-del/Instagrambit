import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { AIProfilesManager } from './components/AIProfilesManager';
import { StrategySettings } from './components/StrategySettings';
import { IdeaEngine } from './components/IdeaEngine';
import { ContentStudio } from './components/ContentStudio';
import { VideoStudio } from './components/VideoStudio';
import { ContentCalendar } from './components/ContentCalendar';
import { AdFilterSettings } from './components/AdFilterSettings';
import { AnalyticsFeedback } from './components/AnalyticsFeedback';
import { InstagramGraphApiConfigComponent } from './components/InstagramGraphApiConfig';
import { BrandAssetsManager } from './components/BrandAssetsManager';
import { InstallerScriptViewer } from './components/InstallerScriptViewer';
import { SystemLogsViewer } from './components/SystemLogsViewer';
import { api } from './lib/api';
import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  Calendar,
  Menu,
} from 'lucide-react';
import {
  AIProfile,
  PageStrategy,
  IdeaItem,
  PostItem,
  AdFilterConfig,
  BrandAssetConfig,
  InstagramApiConfig,
  SystemLog,
  AnalyticsSummary,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Application State
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
  const [strategy, setStrategy] = useState<PageStrategy | null>(null);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [adFilterConfig, setAdFilterConfig] = useState<AdFilterConfig | null>(null);
  const [brandAssets, setBrandAssets] = useState<BrandAssetConfig | null>(null);
  const [instagramConfig, setInstagramConfig] = useState<InstagramApiConfig | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [
        fetchedProfiles,
        fetchedStrategy,
        fetchedIdeas,
        fetchedPosts,
        fetchedAdConfig,
        fetchedAssets,
        fetchedIgConfig,
        fetchedAnalytics,
        fetchedLogs,
      ] = await Promise.all([
        api.getAIProfiles(),
        api.getStrategy(),
        api.getIdeas(),
        api.getPosts(),
        api.getAdFilterConfig(),
        api.getBrandAssets(),
        api.getInstagramConfig(),
        api.getAnalytics(),
        api.getLogs(),
      ]);

      setAiProfiles(fetchedProfiles);
      setStrategy(fetchedStrategy);
      setIdeas(fetchedIdeas);
      setPosts(fetchedPosts);
      setAdFilterConfig(fetchedAdConfig);
      setBrandAssets(fetchedAssets);
      setInstagramConfig(fetchedIgConfig);
      setAnalytics(fetchedAnalytics);
      setLogs(fetchedLogs);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleAddAIProfile = async (profile: Partial<AIProfile>) => {
    await api.addAIProfile(profile);
    await loadData();
  };

  const handleToggleAIProfile = async (id: string) => {
    await api.toggleAIProfile(id);
    await loadData();
  };

  const handleDeleteAIProfile = async (id: string) => {
    await api.deleteAIProfile(id);
    await loadData();
  };

  const handleSaveStrategy = async (updated: Partial<PageStrategy>) => {
    const newStrat = await api.updateStrategy(updated);
    setStrategy(newStrat);
  };

  const handleGenerateIdeas = async (count: number, topic?: string) => {
    await api.generateIdeas(count, topic);
    const newIdeas = await api.getIdeas();
    setIdeas(newIdeas);
  };

  const handleConvertIdeaToPost = async (idea: IdeaItem) => {
    await api.generatePost(idea.title, idea.description);
    await api.updateIdeaStatus(idea.id, 'converted');
    const newPosts = await api.getPosts();
    setPosts(newPosts);
    setActiveTab('content-studio'); // Jump to studio for human review!
  };

  const handleUpdateIdeaStatus = async (id: string, status: IdeaItem['status']) => {
    await api.updateIdeaStatus(id, status);
    const newIdeas = await api.getIdeas();
    setIdeas(newIdeas);
  };

  const handleUpdatePost = async (id: string, updated: Partial<PostItem>) => {
    await api.updatePost(id, updated);
    const newPosts = await api.getPosts();
    setPosts(newPosts);
  };

  const handleDeletePost = async (id: string) => {
    await api.deletePost(id);
    const newPosts = await api.getPosts();
    setPosts(newPosts);
  };

  const handlePublishPostNow = async (id: string) => {
    await api.publishPostNow(id);
    await loadData();
  };

  const handleSaveAdFilterConfig = async (updated: Partial<AdFilterConfig>) => {
    const newConfig = await api.updateAdFilterConfig(updated);
    setAdFilterConfig(newConfig);
  };

  const handleVerifyAdText = async (text: string) => {
    return api.verifyAdText(text);
  };

  const handleSaveInstagramConfig = async (updated: Partial<InstagramApiConfig>) => {
    const newConfig = await api.updateInstagramConfig(updated);
    setInstagramConfig(newConfig);
  };

  const handleSaveBrandAssets = async (updated: Partial<BrandAssetConfig>) => {
    const newAssets = await api.updateBrandAssets(updated);
    setBrandAssets(newAssets);
  };

  const handleOptimizePrompt = async () => {
    await api.optimizePromptFromAnalytics();
    await loadData();
  };

  const handleRunInstallerOption = async (option: number) => {
    return api.runInstallerOption(option);
  };

  const activeProfileCount = aiProfiles.filter((p) => p.isActive).length;

  return (
    <div dir="rtl" className="min-h-screen bg-[#09090b] text-[#fafafa] flex font-sans antialiased overflow-x-hidden relative">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pageNiche={strategy?.niche || 'پیج اتوماسیون اینستاگرام'}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Header
          activeProfileCount={activeProfileCount}
          instagramConfig={instagramConfig || { pageName: 'Studio Account', isSandboxMode: true } as any}
          onQuickGenerate={() => setActiveTab('idea-engine')}
          onRefreshData={loadData}
          isRefreshing={isRefreshing}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Tab Views */}
        <main className="p-3.5 sm:p-6 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && analytics && (
            <DashboardOverview
              analytics={analytics}
              aiProfiles={aiProfiles}
              posts={posts}
              logs={logs}
              onNavigate={setActiveTab}
              onQuickGenerate={() => setActiveTab('idea-engine')}
            />
          )}

          {activeTab === 'ai-keys' && (
            <AIProfilesManager
              profiles={aiProfiles}
              onAddProfile={handleAddAIProfile}
              onToggleProfile={handleToggleAIProfile}
              onDeleteProfile={handleDeleteAIProfile}
            />
          )}

          {activeTab === 'strategy' && strategy && (
            <StrategySettings strategy={strategy} onSaveStrategy={handleSaveStrategy} />
          )}

          {activeTab === 'idea-engine' && (
            <IdeaEngine
              ideas={ideas}
              onGenerateIdeas={handleGenerateIdeas}
              onConvertToPost={handleConvertIdeaToPost}
              onUpdateStatus={handleUpdateIdeaStatus}
            />
          )}

          {activeTab === 'video-studio' && (
            <VideoStudio
              posts={posts}
              onRefresh={loadData}
              onPublishNow={handlePublishPostNow}
              onUpdatePost={handleUpdatePost}
            />
          )}

          {activeTab === 'content-studio' && (
            <ContentStudio
              posts={posts}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
              onPublishNow={handlePublishPostNow}
              onNavigateToCalendar={() => setActiveTab('calendar')}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'calendar' && instagramConfig && (
            <ContentCalendar posts={posts} instagramConfig={instagramConfig} />
          )}

          {activeTab === 'ad-filter' && adFilterConfig && (
            <AdFilterSettings
              config={adFilterConfig}
              onSaveConfig={handleSaveAdFilterConfig}
              onVerifyText={handleVerifyAdText}
            />
          )}

          {activeTab === 'analytics' && analytics && (
            <AnalyticsFeedback analytics={analytics} onOptimizePrompt={handleOptimizePrompt} />
          )}

          {activeTab === 'instagram-api' && instagramConfig && (
            <InstagramGraphApiConfigComponent
              config={instagramConfig}
              onSaveConfig={handleSaveInstagramConfig}
            />
          )}

          {activeTab === 'brand-assets' && brandAssets && (
            <BrandAssetsManager assets={brandAssets} onSaveAssets={handleSaveBrandAssets} />
          )}

          {activeTab === 'installer' && (
            <InstallerScriptViewer onRunOption={handleRunInstallerOption} />
          )}

          {activeTab === 'logs' && <SystemLogsViewer logs={logs} onRefresh={loadData} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#18181b]/95 backdrop-blur-md border-t border-[#27272a] lg:hidden flex justify-around items-center px-1 py-2 text-[10px] font-medium text-[#a1a1aa]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'hover:text-[#fafafa]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>داشبورد</span>
        </button>

        <button
          onClick={() => setActiveTab('idea-engine')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'idea-engine' ? 'text-indigo-400 font-bold' : 'hover:text-[#fafafa]'
          }`}
        >
          <Lightbulb className="w-5 h-5" />
          <span>ایده‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('content-studio')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'content-studio' ? 'text-indigo-400 font-bold' : 'hover:text-[#fafafa]'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>استودیو</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'calendar' ? 'text-indigo-400 font-bold' : 'hover:text-[#fafafa]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>تقویم</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-[#a1a1aa] hover:text-[#fafafa] transition-all"
        >
          <Menu className="w-5 h-5 text-indigo-400" />
          <span>منو کل</span>
        </button>
      </nav>
    </div>
  );
}

