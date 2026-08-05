import React, { useState } from 'react';
import { Key, Plus, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { AIProfile } from '../types';

interface AIProfilesManagerProps {
  profiles: AIProfile[];
  onAddProfile: (profile: Partial<AIProfile>) => Promise<void>;
  onToggleProfile: (id: string) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
}

export const AIProfilesManager: React.FC<AIProfilesManagerProps> = ({
  profiles,
  onAddProfile,
  onToggleProfile,
  onDeleteProfile,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'imagen'>('gemini');
  const [dailyQuota, setDailyQuota] = useState(1500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !apiKey) return;
    setIsSubmitting(true);
    await onAddProfile({
      name,
      apiKey,
      provider,
      dailyQuota: Number(dailyQuota),
      model: provider === 'gemini' ? 'gemini-3.6-flash' : 'gemini-3.1-flash-lite-image',
    });
    setName('');
    setApiKey('');
    setShowAddModal(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Description Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181b] border border-[#27272a] p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">مدیریت چندگانه کلیدهای Google AI API (Multi-Profile)</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1 max-w-2xl leading-relaxed">
            سیستم به صورت خودکار با روش Round-Robin و Failover بین کلیدهای فعال چرخیده و در صورت برخورد به محدودیت نرخ (Rate-Limit)، بلافاصله روی کلید بعدی سوییچ می‌کند.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن پروفایل / کلید API جدید</span>
        </button>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {profiles.map((p) => {
          const usagePercent = Math.min(100, Math.round((p.usageToday / p.dailyQuota) * 100));
          const isHighUsage = usagePercent >= 80;

          return (
            <div
              key={p.id}
              className={`bg-[#18181b] border p-5 rounded-3xl space-y-4 transition-all ${
                isHighUsage ? 'border-amber-500/50' : 'border-[#27272a]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#fafafa]">{p.name}</span>
                    <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {p.provider.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#a1a1aa] mt-1">
                    کلید: {p.apiKey.substring(0, 8)}••••••••••••
                  </p>
                </div>

                <button
                  onClick={() => onDeleteProfile(p.id)}
                  className="p-1.5 text-[#71717a] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="حذف کلید"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Quota Progress */}
              <div className="space-y-1.5 bg-[#09090b] p-3.5 rounded-2xl border border-[#27272a]">
                <div className="flex justify-between text-xs font-mono text-[#d4d4d8]">
                  <span>سقف مصرف روزانه:</span>
                  <span>{p.usageToday} / {p.dailyQuota} درخواست</span>
                </div>
                <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isHighUsage ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  ></div>
                </div>
                {isHighUsage && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>هشدار: مصرف بیش از ۸۰٪ سقف روزانه</span>
                  </div>
                )}
              </div>

              {/* Status and Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
                <div className="text-[11px] text-[#71717a] font-mono">
                  <span>مدل: {p.model}</span>
                </div>

                <button
                  onClick={() => onToggleProfile(p.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    p.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-[#09090b] text-[#71717a] border-[#27272a] hover:bg-[#27272a]'
                  }`}
                >
                  {p.isActive ? 'فعال (آماده چرخش)' : 'غیرفعال شد'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Profile */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#fafafa] flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>افزودن کلید جدید Google AI API</span>
            </h3>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a1a1aa] mb-1">نام یا عنوان کلید</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلا: Gemini Account #3 - Marketing"
                  required
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[#a1a1aa] mb-1">Google AI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] mb-1">نوع سرویس</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini">Gemini (تولید متن و ایده)</option>
                    <option value="imagen">Imagen (تولید تصویر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a1a1aa] mb-1">سقف مصرف روزانه</label>
                  <input
                    type="number"
                    value={dailyQuota}
                    onChange={(e) => setDailyQuota(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[#a1a1aa] hover:text-[#fafafa]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-xl"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'ذخیره کلید'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
