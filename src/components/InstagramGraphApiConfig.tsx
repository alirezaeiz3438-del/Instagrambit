import React, { useState } from 'react';
import { Instagram, Key, ShieldCheck, Save } from 'lucide-react';
import { InstagramApiConfig } from '../types';

interface InstagramGraphApiConfigProps {
  config: InstagramApiConfig;
  onSaveConfig: (updated: Partial<InstagramApiConfig>) => Promise<void>;
}

export const InstagramGraphApiConfigComponent: React.FC<InstagramGraphApiConfigProps> = ({
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<InstagramApiConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveConfig(formData);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-pink-500 rounded-full"></span>
          <h2 className="text-lg font-bold text-[#fafafa]">اتصال به Instagram Graph API رسمی</h2>
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          تنظیمات اکانت تجاری (Business / Creator Account) جهت انتشار مستقیم پست و دریافت آمار Insights از متا.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-4 text-xs">
        <div>
          <label className="block text-[#a1a1aa] mb-1 font-medium">نام یا شناسه پیج اینستاگرام</label>
          <input
            type="text"
            value={formData.pageName}
            onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
            className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">Meta App ID</label>
            <input
              type="text"
              value={formData.appId}
              onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">Instagram Business Account ID</label>
            <input
              type="text"
              value={formData.businessAccountId}
              onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#a1a1aa] mb-1 font-medium">Page Access Token (Long-lived Token)</label>
          <input
            type="password"
            value={formData.accessToken}
            onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
            className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Sandbox Toggle */}
        <div className="bg-[#09090b] p-4 rounded-2xl border border-[#27272a] flex items-center justify-between">
          <div>
            <span className="font-bold text-[#fafafa] block">حالت تست و شبیه‌سازی API (Sandbox Test Mode)</span>
            <span className="text-[11px] text-[#a1a1aa]">
              در صورت فعال بودن، تمام رفتارهای انتشار و آنالیتیکس به صورت کاملاً بی‌خطر شبیه‌سازی می‌شوند.
            </span>
          </div>
          <input
            type="checkbox"
            checked={formData.isSandboxMode}
            onChange={(e) => setFormData({ ...formData, isSandboxMode: e.target.checked })}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-0 bg-[#18181b] border-[#27272a]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات اینستاگرام'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
