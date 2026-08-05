import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2, CheckCircle2, AlertOctagon, Sparkles, Search } from 'lucide-react';
import { AdFilterConfig } from '../types';

interface AdFilterSettingsProps {
  config: AdFilterConfig;
  onSaveConfig: (updated: Partial<AdFilterConfig>) => Promise<void>;
  onVerifyText: (text: string) => Promise<{ isAd: boolean; matchedKeywords: string[]; reason: string }>;
}

export const AdFilterSettings: React.FC<AdFilterSettingsProps> = ({
  config,
  onSaveConfig,
  onVerifyText,
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState<{ isAd: boolean; matchedKeywords: string[]; reason: string } | null>(
    null
  );
  const [isTesting, setIsTesting] = useState(false);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    const updatedKeywords = [...config.keywords, newKeyword.trim()];
    await onSaveConfig({ keywords: updatedKeywords });
    setNewKeyword('');
  };

  const handleRemoveKeyword = async (kw: string) => {
    const updatedKeywords = config.keywords.filter((k) => k !== kw);
    await onSaveConfig({ keywords: updatedKeywords });
  };

  const handleTestText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testText.trim()) return;
    setIsTesting(true);
    const result = await onVerifyText(testText);
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">فیلتر محتوای تبلیغاتی (Ad/Promo Filter Engine)</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            جلوگیری از ورود پیام‌های اسپانسری، تخفیف، و تبلیغاتی تلگرام به موتور ایده با ترکیب هوش مصنوعی Gemini و قوانین کلمات کلیدی.
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#d4d4d8] cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onSaveConfig({ enabled: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-[#09090b] border-[#27272a]"
            />
            <span>فیلتر تبلیغات فعال باشد</span>
          </label>
        </div>
      </div>

      {/* Keywords Manager & Live Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Manager */}
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm text-[#fafafa]">لیست کلمات کلیدی تبلیغاتی (Rule-based)</h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="کلمه کلیدی جدید (مثلا: سفارش دایرکت)"
              className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAddKeyword}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-xl"
            >
              افزودن
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {config.keywords.map((kw) => (
              <span
                key={kw}
                className="bg-[#09090b] border border-[#27272a] text-[#d4d4d8] text-xs px-3 py-1.5 rounded-full flex items-center gap-2 font-mono"
              >
                <span>{kw}</span>
                <button
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-[#71717a] hover:text-rose-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Live Ad Tester Box */}
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm text-[#fafafa] flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <span>تست زنده تشخیص تبلیغات با AI</span>
          </h3>

          <form onSubmit={handleTestText} className="space-y-3">
            <textarea
              rows={3}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="متن دلخواه خود را جهت تست فیلتر تبلیغات وارد کنید..."
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl p-3 text-xs text-[#fafafa] focus:outline-none focus:border-indigo-500"
            ></textarea>

            <button
              type="submit"
              disabled={isTesting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2 rounded-xl"
            >
              {isTesting ? 'در حال بررسی...' : 'بررسی متن با AI'}
            </button>
          </form>

          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-mono space-y-1 ${
                testResult.isAd
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="font-bold">
                {testResult.isAd ? '⚠️ متن تبلیغاتی تشخیص داده شد!' : '✔ متن پاک و غیرتبلیغاتی است.'}
              </div>
              <p className="text-[11px] leading-relaxed">{testResult.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Logged Filtered Ads Table */}
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-sm text-[#fafafa]">تاریخچه پیام‌های تبلیغاتی فیلترشده جهت بازبینی دستی</h3>

        <div className="space-y-2.5 font-mono text-xs">
          {config.loggedAds.map((ad) => (
            <div key={ad.id} className="bg-[#09090b] border border-[#27272a] p-3.5 rounded-2xl space-y-1">
              <div className="flex justify-between text-[#71717a] text-[10px]">
                <span>کانال: {ad.channel || '@Unknown'}</span>
                <span>{new Date(ad.detectedAt).toLocaleTimeString('fa-IR')}</span>
              </div>
              <p className="text-[#fafafa] text-xs font-sans leading-relaxed">{ad.text}</p>
              <p className="text-rose-400 text-[11px]">علت فیلتر: {ad.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
