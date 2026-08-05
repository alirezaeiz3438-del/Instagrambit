import React, { useState } from 'react';
import { Video, Sparkles, Play, Pause, RefreshCw, Send, CheckCircle2, Film, Layers, Volume2, Clapperboard, Clock } from 'lucide-react';
import { PostItem } from '../types';
import { api } from '../lib/api';
import { AIReelsPlayer } from './AIReelsPlayer';

interface VideoStudioProps {
  posts: PostItem[];
  onRefresh: () => void;
  onPublishNow: (id: string) => Promise<void>;
  onUpdatePost: (id: string, updated: Partial<PostItem>) => Promise<void>;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  posts,
  onRefresh,
  onPublishNow,
  onUpdatePost,
}) => {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTopic, setVideoTopic] = useState('');
  const [duration, setDuration] = useState<number>(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const videoPosts = posts.filter((p) => p.postType === 'reels' || p.videoUrl);

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    try {
      setIsGenerating(true);
      await api.generateVideo(videoTitle, videoTopic, duration);
      setVideoTitle('');
      setVideoTopic('');
      onRefresh();
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (id: string) => {
    setIsPublishing(id);
    await onPublishNow(id);
    setIsPublishing(null);
  };

  const handleApprove = async (post: PostItem) => {
    await onUpdatePost(post.id, {
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner / Generator Header */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#fafafa] flex items-center gap-2">
              استودیو تولید ویدیو و ریلز هوشمند AI
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                Sora & Veo Prompt Engine
              </span>
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              تولید اتوماتیک سناریوی گویندگی، استوری‌بورد ۴ صحنه‌ای، پرامپت‌های حرکت دوربین و پیش‌نمایش ویدیو حرکت‌دار برای ریلز اینستاگرام.
            </p>
          </div>
        </div>

        {/* Video Form */}
        <form onSubmit={handleGenerateVideo} className="bg-[#09090b] p-4 rounded-2xl border border-[#27272a] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-[#a1a1aa] mb-1 font-medium">عنوان یا موضوع کلیدی ویدیو / ریلز</label>
              <input
                type="text"
                required
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="مثلا: ۵ ابزار هوش مصنوعی که شغل شما را دگرگون می‌کنند..."
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#a1a1aa] mb-1 font-medium">زمان ویدیو (ثانیه)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500 min-h-[44px]"
              >
                <option value={15}>۱۵ ثانیه (ریلز کوتاه و پربازدید)</option>
                <option value={30}>۳۰ ثانیه (ریلز تحلیلی و آموزشی)</option>
                <option value={60}>۶۰ ثانیه (ویدیو کامل با سناریو)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#a1a1aa] mb-1 font-medium">توضیحات تکمیلی یا درخواست خاص (اختیاری)</label>
            <input
              type="text"
              value={videoTopic}
              onChange={(e) => setVideoTopic(e.target.value)}
              placeholder="مثلا: با لحن هیجان‌انگیز، تاکید روی سرعت و همراه با فراخوان برای کامنت کلمه «هوش»"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500 min-h-[44px]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isGenerating || !videoTitle.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'در حال سناریونویس و تولید ویدیو AI...' : 'تولید ویدیو و ریلز کامل با AI'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Video Posts List */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-[#fafafa] flex items-center gap-2">
          <Clapperboard className="w-4 h-4 text-indigo-400" />
          <span>ویدیوها و ریلزهای تولید شده با AI ({videoPosts.length})</span>
        </h3>

        {videoPosts.length === 0 ? (
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 text-center space-y-3">
            <Film className="w-12 h-12 text-[#3f3f46] mx-auto" />
            <p className="text-xs text-[#a1a1aa]">هنوز هیچ ویدیویی ساخته نشده است. عنوان ویدیو را بالا وارد کنید و دکمه تولید را بزنید!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videoPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#18181b] border border-[#27272a] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl space-y-4 p-4 sm:p-5"
              >
                {/* Header Info */}
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <div className="flex items-center gap-2 truncate">
                    <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 shrink-0">
                      <Film className="w-4 h-4" />
                    </span>
                    <span className="font-bold text-xs text-[#fafafa] truncate">{post.title}</span>
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
                      ? 'منتشر شده در اینستاگرام'
                      : post.status === 'scheduled'
                      ? 'زمان‌بندی شده'
                      : 'منتظر تایید ادمین'}
                  </span>
                </div>

                {/* Main Player & Storyboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left: AI Reels Canvas & Video Player */}
                  <div className="md:col-span-6 flex flex-col items-center">
                    <AIReelsPlayer post={post} />
                  </div>

                  {/* Right: AI Voiceover & Storyboard */}
                  <div className="md:col-span-6 space-y-3 flex flex-col justify-between">
                    {/* Voiceover Script */}
                    {post.videoScript && (
                      <div className="bg-[#09090b] p-3 rounded-2xl border border-[#27272a] space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>سناریو و گویندگی AI (Voiceover)</span>
                        </div>
                        <p className="text-[11px] text-[#d4d4d8] leading-relaxed max-h-28 overflow-y-auto pl-1 no-scrollbar">
                          {post.videoScript}
                        </p>
                      </div>
                    )}

                    {/* Storyboard timeline */}
                    {post.storyboard && post.storyboard.length > 0 && (
                      <div className="bg-[#09090b] p-3 rounded-2xl border border-[#27272a] space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                          <Layers className="w-3.5 h-3.5" />
                          <span>استوری بورد صحنه‌ها ({post.storyboard.length} سکانس)</span>
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar pr-1">
                          {post.storyboard.map((scene, idx) => (
                            <div key={idx} className="bg-[#18181b] p-2 rounded-xl text-[10px] space-y-0.5 border border-[#27272a]">
                              <div className="flex items-center justify-between text-indigo-300 font-mono font-bold">
                                <span>سکانس {idx + 1}</span>
                                <span>{scene.timestamp}</span>
                              </div>
                              <p className="text-[#fafafa] font-medium">{scene.sceneDescription}</p>
                              <p className="text-[#a1a1aa] italic">🗣 "{scene.voiceoverText}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption preview */}
                <div className="bg-[#09090b] p-3 rounded-2xl border border-[#27272a] text-xs text-[#d4d4d8] whitespace-pre-line max-h-24 overflow-y-auto no-scrollbar">
                  <p>{post.caption}</p>
                  <p className="text-indigo-400 font-mono text-[11px] mt-1">{post.hashtags?.join(' ')}</p>
                </div>

                {/* Action Bar */}
                <div className="pt-2 border-t border-[#27272a] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#71717a] font-mono">پروفایل AI: {post.aiProfileUsed || 'Gemini'}</span>

                  <div className="flex items-center gap-2">
                    {post.status === 'pending_approval' && (
                      <button
                        onClick={() => handleApprove(post)}
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
                        className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-lg"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isPublishing === post.id ? 'در حال ارسال...' : 'انتشار ریلز در اینستاگرام'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
