import React, { useState } from 'react';
import { Lightbulb, Sparkles, Send, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { IdeaItem } from '../types';

interface IdeaEngineProps {
  ideas: IdeaItem[];
  onGenerateIdeas: (count: number, topic?: string) => Promise<void>;
  onConvertToPost: (idea: IdeaItem) => Promise<void>;
  onUpdateStatus: (id: string, status: IdeaItem['status']) => Promise<void>;
}

export const IdeaEngine: React.FC<IdeaEngineProps> = ({
  ideas,
  onGenerateIdeas,
  onConvertToPost,
  onUpdateStatus,
}) => {
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    await onGenerateIdeas(3, customTopic);
    setCustomTopic('');
    setIsGenerating(false);
  };

  const handleConvert = async (idea: IdeaItem) => {
    setConvertingId(idea.id);
    await onConvertToPost(idea);
    setConvertingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Generator Box */}
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">موتور ایده و مانیتورینگ کانال‌های الهام (Idea Engine)</h2>
          </div>
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          تولید خودکار لیست ایده بر اساس موضوع پیج و مانیتورینگ کانال‌های مرتبط تلگرام (به‌عنوان الهام، نه کپی). پیام‌ها پیش از ایده شدن از فیلتر ضدتبلیغات AI عبور می‌کنند.
        </p>

        {/* Brainstorm Form */}
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="موضوع خاص برای ایده پردازی (اختیاری، مثلا: ابزارهای طراحی، افزایش فروش...)"
            className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'در حال ایده پردازی...' : 'تولید ۳ ایده جدید با AI'}</span>
          </button>
        </form>
      </div>

      {/* Ideas List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className={`bg-[#18181b] border p-5 rounded-3xl space-y-3 relative overflow-hidden transition-all ${
              idea.isAd ? 'border-rose-500/40 bg-rose-950/10' : 'border-[#27272a] hover:border-[#3f3f46]'
            }`}
          >
            {/* Source Badge & Ad Status */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#09090b] text-[#d4d4d8] border border-[#27272a] flex items-center gap-1">
                {idea.source === 'telegram' ? (
                  <>
                    <Send className="w-3 h-3 text-cyan-400" />
                    <span>تلگرام {idea.channelName}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>موتور هوش مصنوعی Gemini</span>
                  </>
                )}
              </span>

              {idea.isAd ? (
                <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <ShieldAlert className="w-3 h-3" />
                  <span>تبلیغاتی (رد شده)</span>
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>محتوای پاک</span>
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="font-bold text-sm text-[#fafafa]">{idea.title}</h3>
              <p className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">{idea.description}</p>
              {idea.adReason && (
                <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-xl mt-2 font-mono border border-rose-500/20">
                  علت فیلتر: {idea.adReason}
                </p>
              )}
            </div>

            {/* Action Bar */}
            {!idea.isAd && (
              <div className="pt-2 flex items-center justify-between border-t border-[#27272a]">
                <span className="text-[10px] text-[#71717a] font-mono">
                  {new Date(idea.createdAt).toLocaleTimeString('fa-IR')}
                </span>

                <button
                  onClick={() => handleConvert(idea)}
                  disabled={convertingId === idea.id}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-indigo-600/10"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{convertingId === idea.id ? 'در حال ساخت پست...' : 'تبدیل به پست و ورود به استودیو'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
