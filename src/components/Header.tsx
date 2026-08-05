import React from 'react';
import { Key, Sparkles, Instagram, ShieldCheck, RefreshCw } from 'lucide-react';
import { AIProfile, InstagramApiConfig } from '../types';

interface HeaderProps {
  activeProfileCount: number;
  instagramConfig: InstagramApiConfig;
  onQuickGenerate: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfileCount,
  instagramConfig,
  onQuickGenerate,
  onRefreshData,
  isRefreshing,
}) => {
  return (
    <header className="h-16 bg-[#18181b]/90 backdrop-blur-md border-b border-[#27272a] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Info Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] px-3 py-1.5 rounded-xl text-xs text-[#d4d4d8]">
          <Key className="w-3.5 h-3.5 text-indigo-400" />
          <span>کلیدهای AI فعال:</span>
          <span className="font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            {activeProfileCount} کلید
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] px-3 py-1.5 rounded-xl text-xs text-[#d4d4d8]">
          <Instagram className="w-3.5 h-3.5 text-pink-500" />
          <span>پیج:</span>
          <span className="font-semibold text-[#fafafa]">{instagramConfig.pageName}</span>
          {instagramConfig.isSandboxMode && (
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-medium">
              حالت تست / Sandbox
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 text-[#a1a1aa] hover:text-[#fafafa] bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] rounded-xl transition-all"
          title="بروزرسانی داده‌ها"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        <button
          onClick={onQuickGenerate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>تولید محتوای هوشمند جدید</span>
        </button>
      </div>
    </header>
  );
};
