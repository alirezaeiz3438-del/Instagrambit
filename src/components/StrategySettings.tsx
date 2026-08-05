import React, { useState } from 'react';
import { Sliders, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import { PageStrategy } from '../types';

interface StrategySettingsProps {
  strategy: PageStrategy;
  onSaveStrategy: (updated: Partial<PageStrategy>) => Promise<void>;
}

export const StrategySettings: React.FC<StrategySettingsProps> = ({ strategy, onSaveStrategy }) => {
  const [formData, setFormData] = useState<PageStrategy>({ ...strategy });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveStrategy(formData);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">تنظیمات هویت و استراتژی محتوایی پیج (General Setup)</h2>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>استراتژی با موفقیت ذخیره شد</span>
            </span>
          )}
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          موضوع پیج کاملاً عمومی و قابل تنظیم است. هرگونه تغییر در این قسمت بلافاصه روی تمام پرامپت‌های تولید ایده و کپشن در کل سیستم اعمال می‌شود.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-5 text-xs">
        {/* Niche & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-[#a1a1aa] mb-1.5">موضوع / نیچ اصلی پیج (Niche)</label>
            <input
              type="text"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              placeholder="مثلا: آشپزی سریع، هوش مصنوعی، فیتنس و تغذیه، اخبار محلی..."
              required
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-[#a1a1aa] mb-1.5">مخاطب هدف (Target Audience)</label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="شرح کوتاه سن و علایق مخاطب..."
              required
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tone & Visual Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-[#a1a1aa] mb-1.5">لحن بیان (Tone of Voice)</label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
            >
              <option value="friendly">صمیمی و پرانرژی (Friendly)</option>
              <option value="formal">رسمی و تحلیلی (Formal)</option>
              <option value="humorous">طنز و فان (Humorous)</option>
              <option value="professional">تخصصی و حرفه‌ای (Professional)</option>
              <option value="persuasive">اقناعی و فروشگاهی (Persuasive)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#a1a1aa] mb-2">سبک بصری و استایل گرافیکی تصاویر (Visual Style)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-3">
              {[
                { key: 'photorealistic', name: 'عکاسی واقع‌گرایانه', icon: '📸', desc: 'دوربین حرفه‌ای، نور طبیعی' },
                { key: 'cinematic', name: 'سینمایی و دراماتیک', icon: '🎬', desc: 'قاب هالیوودی، لنز آنامورفیک' },
                { key: 'modern_tech', name: 'تکنولوژی مدرن', icon: '💻', desc: 'فضای استودیویی و گجت‌ها' },
                { key: '3d_render', name: 'رندر ۳ بعدی', icon: '🧊', desc: 'استایل ایزومتریک و براق' },
                { key: 'cyberpunk', name: 'سایبرپانک و نئون', icon: '🌆', desc: 'نور نئون و فضاهای تاریک' },
                { key: 'flat_vector', name: 'تصویرسازی وکتور', icon: '🎨', desc: 'اشکال تمیز و گرادیان' },
                { key: 'minimal_luxury', name: 'مینیمال لوکس', icon: '✨', desc: 'پالت کرم و نود، استایل شیک' },
                { key: 'anime', name: 'انیمه و دیجیتال', icon: '🖼️', desc: 'نقاشی دیجیتال مفهومی' },
                { key: 'vintage', name: 'وینتیج دهه ۹۰', icon: '🎞️', desc: 'گرین نرم، فیلم آنالوگ' },
                { key: 'dark_mode', name: 'تاریک و نئونی', icon: '🌙', desc: 'کنتراست بالا، تم زغالی' },
              ].map((styleItem) => {
                const isSelected = formData.visualStyle?.toLowerCase().includes(styleItem.key) || formData.visualStyle === styleItem.name;
                return (
                  <button
                    key={styleItem.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, visualStyle: styleItem.name })}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between min-h-[90px] ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-[#09090b] border-[#27272a] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg">{styleItem.icon}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>}
                    </div>
                    <div>
                      <div className="font-bold text-[11px] text-[#fafafa]">{styleItem.name}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5 line-clamp-1">{styleItem.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={formData.visualStyle}
              onChange={(e) => setFormData({ ...formData, visualStyle: e.target.value })}
              placeholder="توضیح دلخواه و سفارشی سبک بصری یا پالت رنگی پیج..."
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <label className="block font-medium text-[#a1a1aa] mb-1.5">دستورالعمل پایه هوش مصنوعی (Base System Prompt)</label>
          <textarea
            rows={5}
            value={formData.customSystemPrompt}
            onChange={(e) => setFormData({ ...formData, customSystemPrompt: e.target.value })}
            className="w-full bg-[#09090b] border border-[#27272a] rounded-xl p-3.5 text-[#fafafa] font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
          ></textarea>
        </div>

        {/* CTA Preference */}
        <div>
          <label className="block font-medium text-[#a1a1aa] mb-1.5">فراخوان به عمل ترجیحی (Default CTA)</label>
          <input
            type="text"
            value={formData.ctaPreference}
            onChange={(e) => setFormData({ ...formData, ctaPreference: e.target.value })}
            className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره و اعمال استراتژی'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
