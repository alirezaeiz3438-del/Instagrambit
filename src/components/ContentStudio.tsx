import React, { useState } from 'react';
import {
  FileText,
  Instagram,
  Send,
  Clock,
  CheckCircle2,
  Edit3,
  Trash2,
  Sparkles,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Calendar,
  RefreshCw,
  Film,
  Volume2,
  Layers,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react';
import { PostItem, PostStatus, CarouselSlide } from '../types';
import { api } from '../lib/api';
import { AIPosterCanvas } from './AIPosterCanvas';
import { AIReelsPlayer } from './AIReelsPlayer';

interface ContentStudioProps {
  posts: PostItem[];
  onUpdatePost: (id: string, updated: Partial<PostItem>) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onPublishNow: (id: string) => Promise<void>;
  onNavigateToCalendar: () => void;
  onRefresh?: () => void;
}

const CarouselViewer: React.FC<{ post: PostItem }> = ({ post }) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const slides = post.carouselSlides || [];

  if (slides.length === 0) return null;
  const currentSlide = slides[currentSlideIdx] || slides[0];

  return (
    <div className="bg-[#09090b] rounded-2xl border border-[#27272a] p-3 space-y-3">
      {/* Slide Image Frame */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-[#27272a]">
        <img src={currentSlide.imageUrl} alt="" className="w-full h-full object-cover" />

        {/* Slide Badge */}
        <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-indigo-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1">
          <Layers className="w-3 h-3 text-indigo-400" />
          <span>
            اسلاید {currentSlide.slideNumber} از {slides.length}
          </span>
        </div>

        {/* Slide Text Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-8 space-y-1">
          <h4 className="text-sm font-bold text-white">{currentSlide.title}</h4>
          {currentSlide.bodyText && (
            <p className="text-xs text-zinc-300 leading-snug line-clamp-3">{currentSlide.bodyText}</p>
          )}
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIdx === 0}
          className="p-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-xl text-xs text-zinc-300 disabled:opacity-30 flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4" />
          <span>قبلی</span>
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlideIdx === idx ? 'bg-indigo-500 w-6' : 'bg-zinc-700 hover:bg-zinc-500 w-2'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlideIdx === slides.length - 1}
          className="p-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-xl text-xs text-zinc-300 disabled:opacity-30 flex items-center gap-1"
        >
          <span>بعدی</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ContentStudio: React.FC<ContentStudioProps> = ({
  posts,
  onUpdatePost,
  onDeletePost,
  onPublishNow,
  onNavigateToCalendar,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [regeneratingImageId, setRegeneratingImageId] = useState<string | null>(null);

  // Direct Generator Form state
  const [genTitle, setGenTitle] = useState('');
  const [genTopic, setGenTopic] = useState('');
  const [genType, setGenType] = useState<'post' | 'carousel' | 'reels'>('post');
  const [isCreating, setIsCreating] = useState(false);

  const filteredPosts = posts.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) return;

    try {
      setIsCreating(true);
      if (genType === 'carousel') {
        await api.generateCarousel(genTitle, genTopic, 5);
      } else if (genType === 'reels') {
        await api.generateVideo(genTitle, genTopic, 15);
      } else {
        await api.generatePost(genTitle, genTopic, 'post');
      }

      setGenTitle('');
      setGenTopic('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error creating content:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    await onUpdatePost(editingPost.id, {
      caption: editingPost.caption,
      hashtags: editingPost.hashtags,
      imagePrompt: editingPost.imagePrompt,
    });
    setEditingPost(null);
  };

  const handleRegenerateImage = async (postId: string) => {
    try {
      setRegeneratingImageId(postId);
      const res = await api.regenerateImage(postId);
      if (res.imageUrl) {
        await onUpdatePost(postId, { imageUrl: res.imageUrl });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Image regeneration error:', err);
    } finally {
      setRegeneratingImageId(null);
    }
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
      {/* Quick Media Creation Bar */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#fafafa]">موتور خلق عکس، فیلم و کاروسل هوشمند</h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                تولید مستقیم پست تک‌عکس، کاروسل چند اسلایدی و ریلز ویدیویی با هوش مصنوعی
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateMedia} className="bg-[#09090b] p-4 rounded-2xl border border-[#27272a] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <label className="block text-xs text-[#a1a1aa] mb-1 font-medium">عنوان محتوا یا ایده</label>
              <input
                type="text"
                required
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="مثلا: ۷ ترفند افزایش فالوور واقعی اینستاگرام..."
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500 min-h-[44px]"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs text-[#a1a1aa] mb-1 font-medium">توضیحات تکمیلی (اختیاری)</label>
              <input
                type="text"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="توضیحات کوتاه یا نکات کلیدی..."
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500 min-h-[44px]"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs text-[#a1a1aa] mb-1 font-medium">نوع فرمت محتوا</label>
              <select
                value={genType}
                onChange={(e: any) => setGenType(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2.5 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500 min-h-[44px]"
              >
                <option value="post">📷 پست تک‌عکس (Single Post)</option>
                <option value="carousel">📚 کاروسل ۵ اسلایدی (Carousel)</option>
                <option value="reels">🎬 ویدیو و ریلز (Reel/Video)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isCreating || !genTitle.trim()}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Sparkles className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
              <span>
                {isCreating
                  ? 'در حال تولید محتوای AI...'
                  : genType === 'carousel'
                  ? 'تولید اسلایدهای کاروسل با AI'
                  : genType === 'reels'
                  ? 'تولید ویدیو و ریلز کامل'
                  : 'تولید پست عکس و کپشن'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181b] border border-[#27272a] p-4 sm:p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h2 className="text-base sm:text-lg font-bold text-[#fafafa]">
              استودیو و لایه تایید انسانی محتوا (Human-in-the-Loop)
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            تمام محتوای جدید ابتدا وارد حالت "منتظر تایید" می‌شود تا قبل از انتشار در اینستاگرام، توسط ادمین ویرایش و تایید نهایی شود.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#09090b] p-1.5 rounded-2xl border border-[#27272a] text-xs overflow-x-auto max-w-full no-scrollbar">
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
              <div className="flex items-center gap-2 truncate">
                <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="font-bold text-xs text-[#fafafa] truncate">{post.title}</span>
                {post.postType === 'carousel' && (
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono shrink-0">
                    کاروسل
                  </span>
                )}
                {post.postType === 'reels' && (
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md font-mono shrink-0">
                    ریلز
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 ${
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
              {/* Media Preview: Carousel, Video Reel or Image Canvas */}
              {post.carouselSlides && post.carouselSlides.length > 0 ? (
                <CarouselViewer post={post} />
              ) : post.postType === 'reels' || post.videoScript ? (
                <AIReelsPlayer post={post} />
              ) : (
                <AIPosterCanvas
                  title={post.title}
                  prompt={post.imagePrompt}
                  imageUrl={post.imageUrl}
                  badgeText={post.postType === 'story' ? 'Instagram Story' : 'Instagram Post'}
                  onRegenerate={() => handleRegenerateImage(post.id)}
                  isRegenerating={regeneratingImageId === post.id}
                />
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
