import React, { useState } from 'react';
import { FileText, Instagram, Send, Clock, CheckCircle2, Edit3, Trash2, Sparkles, Heart, MessageCircle, Bookmark, Share2, Calendar } from 'lucide-react';
import { PostItem, PostStatus } from '../types';

interface ContentStudioProps {
  posts: PostItem[];
  onUpdatePost: (id: string, updated: Partial<PostItem>) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onPublishNow: (id: string) => Promise<void>;
  onNavigateToCalendar: () => void;
}

export const ContentStudio: React.FC<ContentStudioProps> = ({
  posts,
  onUpdatePost,
  onDeletePost,
  onPublishNow,
  onNavigateToCalendar,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  const filteredPosts = posts.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    await onUpdatePost(editingPost.id, {
      caption: editingPost.caption,
      hashtags: editingPost.hashtags,
      imagePrompt: editingPost.imagePrompt,
    });
    setEditingPost(null);
  };

  const handleApproveAndSchedule = async (post: PostItem) => {
    const defaultScheduleTime = new Date(Date.now() + 86400000 * 1).toISOString();
    await onUpdatePost(post.id, {
      status: 'scheduled',
      scheduledAt: defaultScheduleTime,
    });
  };

  const handlePublish = async (id: string) => {
    setIsPublishing(id);
    await onPublishNow(id);
    setIsPublishing(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181b] border border-[#27272a] p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">استودیو و لایه تایید انسانی محتوا (Human-in-the-Loop)</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            تمام محتوای جدید ابتدا وارد حالت "منتظر تایید" می‌شود تا قبل از انتشار در اینستاگرام، توسط ادمین ویرایش و تایید نهایی شود.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#09090b] p-1.5 rounded-2xl border border-[#27272a] text-xs">
          {[
            { id: 'all', label: 'همه پست‌ها' },
            { id: 'pending_approval', label: 'منتظر تایید ادمین' },
            { id: 'scheduled', label: 'زمان‌بندی شده' },
            { id: 'published', label: 'منتشر شده' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-[#a1a1aa] hover:text-[#fafafa]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[#18181b] border border-[#27272a] rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl"
          >
            {/* Top Bar Status */}
            <div className="p-4 border-b border-[#27272a] bg-[#09090b]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="font-bold text-xs text-[#fafafa] truncate max-w-[200px]">{post.title}</span>
              </div>

              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
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
                  : 'منتظر تایید ادمین'}
              </span>
            </div>

            {/* Instagram Mockup Render */}
            <div className="p-4 space-y-3">
              {/* Image Preview */}
              {post.imageUrl && (
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#09090b] border border-[#27272a] group">
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#09090b]/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-4">
                    <span className="text-[11px] text-[#fafafa] bg-[#18181b] px-3 py-1.5 rounded-xl font-mono border border-[#27272a]">
                      Imagen Prompt: {post.imagePrompt.substring(0, 50)}...
                    </span>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div className="bg-[#09090b] p-3.5 rounded-2xl border border-[#27272a] text-xs text-[#d4d4d8] space-y-2 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                <p>{post.caption}</p>
                <p className="text-indigo-400 font-mono text-[11px]">{post.hashtags?.join(' ')}</p>
              </div>

              {/* Metrics if published */}
              {post.metrics && (
                <div className="grid grid-cols-4 gap-2 bg-[#09090b] p-3 rounded-2xl border border-[#27272a] text-[11px] font-mono text-[#d4d4d8] text-center">
                  <div>
                    <span className="text-[#71717a] block text-[10px]">لایک</span>
                    <span className="font-bold text-rose-400">{post.metrics.likes}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[10px]">کامنت</span>
                    <span className="font-bold text-indigo-400">{post.metrics.comments}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[10px]">سیو</span>
                    <span className="font-bold text-amber-400">{post.metrics.saves}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[10px]">ریچ</span>
                    <span className="font-bold text-emerald-400">{post.metrics.reach}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-[#27272a] bg-[#09090b]/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingPost({ ...post })}
                  className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-xl transition-all"
                  title="ویرایش متن پست"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeletePost(post.id)}
                  className="p-2 text-[#a1a1aa] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {post.status === 'pending_approval' && (
                  <button
                    onClick={() => handleApproveAndSchedule(post)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تایید و زمان‌بندی</span>
                  </button>
                )}

                {post.status !== 'published' && (
                  <button
                    onClick={() => handlePublish(post.id)}
                    disabled={isPublishing === post.id}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPublishing === post.id ? 'در حال ارسال...' : 'انتشار آنی در اینستاگرام'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-400" />
              <span>ویرایش کپشن و هشتگ‌های پست</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">متن کامل کپشن</label>
                <textarea
                  rows={6}
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-sans focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">هشتگ‌ها (با فاصله)</label>
                <input
                  type="text"
                  value={editingPost.hashtags?.join(' ') || ''}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, hashtags: e.target.value.split(' ').filter(Boolean) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2 rounded-xl"
              >
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
