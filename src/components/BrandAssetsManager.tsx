import React, { useState } from 'react';
import { Palette, Save, Image as ImageIcon } from 'lucide-react';
import { BrandAssetConfig } from '../types';

interface BrandAssetsManagerProps {
  assets: BrandAssetConfig;
  onSaveAssets: (updated: Partial<BrandAssetConfig>) => Promise<void>;
}

export const BrandAssetsManager: React.FC<BrandAssetsManagerProps> = ({ assets, onSaveAssets }) => {
  const [formData, setFormData] = useState<BrandAssetConfig>({ ...assets });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveAssets(formData);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
          <h2 className="text-lg font-bold text-[#fafafa]">بانک دارایی برند (Brand Asset Library)</h2>
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          تعریف پالت رنگی رسمی، فونت و موقعیت واترمارک برای ایجاد حس یکپارچگی و قالب یکدست در تصاویر هوش مصنوعی.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">رنگ اصلی برند (Primary)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-[#27272a]"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-[#fafafa] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">رنگ فرعی (Secondary)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-[#27272a]"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-[#fafafa] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">رنگ برجسته (Accent)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-[#27272a]"
              />
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-[#fafafa] font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">فونت رسمی برند</label>
            <input
              type="text"
              value={formData.fontName}
              onChange={(e) => setFormData({ ...formData, fontName: e.target.value })}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">موقعیت واترمارک روی تصویر</label>
            <select
              value={formData.watermarkPosition}
              onChange={(e) => setFormData({ ...formData, watermarkPosition: e.target.value as any })}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-[#fafafa] focus:outline-none focus:border-indigo-500"
            >
              <option value="bottom_right">پایین راست (Bottom Right)</option>
              <option value="bottom_left">پایین چپ (Bottom Left)</option>
              <option value="top_right">بالا راست (Top Right)</option>
              <option value="top_left">بالا چپ (Top Left)</option>
              <option value="center">مرکز تصویر (Center)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره دارایی‌های برند'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
