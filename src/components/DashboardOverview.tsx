import React from 'react';
import {
  Users,
  TrendingUp,
  FileCheck2,
  CalendarCheck,
  Eye,
  Key,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { AnalyticsSummary, AIProfile, PostItem, SystemLog } from '../types';

interface DashboardOverviewProps {
  analytics: AnalyticsSummary;
  aiProfiles: AIProfile[];
  posts: PostItem[];
  logs: SystemLog[];
  onNavigate: (tab: string) => void;
  onQuickGenerate: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analytics,
  aiProfiles,
  posts,
  logs,
  onNavigate,
  onQuickGenerate,
}) => {
  const pendingCount = posts.filter((p) => p.status === 'pending_approval').length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner Notice - Bento Header */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-4 sm:p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 text-xs px-3 py-1 rounded-full font-medium border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>اتوماسیون ارگانیک فعال است</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#fafafa]">استودیو مدیریت هوشمند پیج اینستاگرام</h2>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            از ایده تا انتشار با API رسمی اینستاگرام، چرخش چندکلیدی Gemini API و تایید انسانی پیش از انتشار (Human-in-the-loop).
          </p>
        </div>

        <button
          onClick={onQuickGenerate}
          className="z-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl text-xs transition-all shadow-xl active:scale-95 shrink-0 flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>تولید ایده و پست جدید</span>
        </button>

        {/* Decorative Background Glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Primary Metrics Grid - Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium">کل فالوورها</p>
            <h3 className="text-2xl font-bold text-[#fafafa] mt-1 font-mono">
              {analytics.totalFollowers.toLocaleString('fa-IR')}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{analytics.followerGrowthWeek} این هفته</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium">نرخ تعامل (Engagement)</p>
            <h3 className="text-2xl font-bold text-[#fafafa] mt-1 font-mono">{analytics.avgEngagementRate}%</h3>
            <p className="text-xs text-emerald-400 mt-1 font-medium">عالی (بالاتر از میانگین بازار)</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('content-studio')}
          className="bg-[#18181b] border border-[#27272a] hover:border-amber-500/40 p-5 rounded-3xl flex items-center justify-between cursor-pointer transition-all group"
        >
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium">پست‌های منتظر تایید ادمین</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1 font-mono">{pendingCount} پست</h3>
            <p className="text-xs text-[#71717a] mt-1">جهت بررسی انسانی کلیک کنید</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('calendar')}
          className="bg-[#18181b] border border-[#27272a] hover:border-emerald-500/40 p-5 rounded-3xl flex items-center justify-between cursor-pointer transition-all group"
        >
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium">پست‌های زمان‌بندی‌شده</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{scheduledCount} پست</h3>
            <p className="text-xs text-[#71717a] mt-1">آماده ارسال خودکار</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Multi-Key Rotation Status & AI Profiles */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h3 className="font-bold text-base text-[#fafafa]">وضعیت کلیدهای AI (Multi-Profile Rate Limiting)</h3>
          </div>
          <button
            onClick={() => onNavigate('ai-keys')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>مدیریت کلیدها</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiProfiles.map((p) => {
            const usagePercent = Math.min(100, Math.round((p.usageToday / p.dailyQuota) * 100));
            const isHighUsage = usagePercent >= 80;

            return (
              <div key={p.id} className="bg-[#09090b] border border-[#27272a] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#fafafa] truncate">{p.name}</span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono ${
                      p.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-[#27272a] text-[#71717a]'
                    }`}
                  >
                    {p.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#a1a1aa] font-mono">
                    <span>مصرف امروز: {p.usageToday} / {p.dailyQuota}</span>
                    <span>{usagePercent}%</span>
                  </div>
                  <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isHighUsage ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-[10px] text-[#71717a] flex justify-between font-mono">
                  <span>آخرین استفاده: {p.lastUsedAt || 'به‌تازگی'}</span>
                  <span>مدل: {p.model}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Posts & Live System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts List */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#fafafa] flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-pink-500 rounded-full"></span>
                <span>پست‌های اخیر در استودیو</span>
              </h3>
              <button
                onClick={() => onNavigate('content-studio')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                مشاهده همه
              </button>
            </div>

            <div className="space-y-3">
              {posts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="bg-[#09090b] border border-[#27272a] p-3.5 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-[#27272a] shrink-0"
                      />
                    )}
                    <div className="truncate">
                      <h4 className="text-xs font-semibold text-[#fafafa] truncate">{post.title}</h4>
                      <p className="text-[11px] text-[#a1a1aa] truncate mt-0.5">{post.caption}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full shrink-0 font-medium ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : post.status === 'scheduled'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {post.status === 'published'
                      ? 'منتشر شده'
                      : post.status === 'scheduled'
                      ? 'زمان‌بندی شده'
                      : 'منتظر تایید'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live System Activity Logs */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#fafafa] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
              <span>لاگ‌های زنده رویدادهای سیستم</span>
            </h3>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              مشاهده لاگ کامل
            </button>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {logs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="bg-[#09090b] border border-[#27272a] p-3 rounded-2xl flex items-start gap-2.5"
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.level === 'success'
                      ? 'bg-emerald-400'
                      : log.level === 'warn'
                      ? 'bg-amber-400'
                      : log.level === 'error'
                      ? 'bg-rose-400'
                      : 'bg-indigo-400'
                  }`}
                ></span>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 text-[10px] text-[#71717a]">
                    <span>[{log.module}]</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('fa-IR')}</span>
                  </div>
                  <p className="text-[#d4d4d8] text-[11px] mt-0.5 leading-relaxed font-sans">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
