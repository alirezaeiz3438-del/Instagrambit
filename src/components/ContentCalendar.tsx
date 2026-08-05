import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { PostItem, InstagramApiConfig } from '../types';

interface ContentCalendarProps {
  posts: PostItem[];
  instagramConfig: InstagramApiConfig;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({ posts, instagramConfig }) => {
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled');
  const publishedPosts = posts.filter((p) => p.status === 'published');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181b] border border-[#27272a] p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">تقویم زمان‌بندی و ساعات اوج فعالیت (Content Calendar)</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            مشاهده زمان‌بندی پست‌ها و انتخاب ساعات برتر بر اساس آنالیز تعامل مخاطبان پیج شما در Instagram Insights.
          </p>
        </div>

        {/* Best Hours Badge */}
        <div className="bg-[#09090b] p-3.5 rounded-2xl border border-[#27272a] flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="text-[#a1a1aa] block font-medium">ساعات طلایی انتشار:</span>
            <span className="text-amber-400 font-mono font-bold">
              {instagramConfig.bestPostingHours?.join(' | ') || '۱۲:۳۰ | ۱۸:۰۰ | ۲۱:۳۰'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Scheduled Queue & Calendar List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Posts */}
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm text-[#fafafa] flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>صف پست‌های زمان‌بندی‌شده ({scheduledPosts.length})</span>
          </h3>

          <div className="space-y-3">
            {scheduledPosts.length === 0 ? (
              <p className="text-xs text-[#71717a] py-6 text-center">پستی در صف زمان‌بندی وجود ندارد.</p>
            ) : (
              scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#09090b] border border-[#27272a] p-4 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#27272a] shrink-0" />
                    )}
                    <div className="truncate">
                      <h4 className="font-semibold text-xs text-[#fafafa] truncate">{post.title}</h4>
                      <p className="text-[11px] text-[#a1a1aa] truncate mt-0.5">{post.caption}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full shrink-0">
                    فردا {instagramConfig.bestPostingHours?.[0] || '18:00'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Published Timeline */}
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm text-[#fafafa] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>پست‌های اخیر منتشر شده ({publishedPosts.length})</span>
          </h3>

          <div className="space-y-3">
            {publishedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#09090b] border border-[#27272a] p-4 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#27272a] shrink-0" />
                  )}
                  <div className="truncate">
                    <h4 className="font-semibold text-xs text-[#fafafa] truncate">{post.title}</h4>
                    <p className="text-[11px] text-[#a1a1aa] truncate mt-0.5">شناسه: {post.instagramPostId}</p>
                  </div>
                </div>

                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                  منتشر شد
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
