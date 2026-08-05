import React from 'react';
import { Key, Sparkles, Instagram, RefreshCw, Menu } from 'lucide-react';
import { InstagramApiConfig } from '../types';

interface HeaderProps {
  activeProfileCount: number;
  instagramConfig: InstagramApiConfig;
  onQuickGenerate: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfileCount,
  instagramConfig,
  onQuickGenerate,
  onRefreshData,
  isRefreshing,
  onOpenMobileMenu,
}) => {
  return (
    <header className="min-h-16 bg-[#18181b]/95 backdrop-blur-md border-b border-[#27272a] px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30">
      {/* Left Info Badges & Mobile Menu Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#a1a1aa] hover:text-[#fafafa] bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] rounded-xl shrink-0 transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="منوی برنامه‌ها"
          aria-label="باز کردن منو"
        >
          <Menu className="w-5 h-5 text-indigo-400" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#09090b] border border-[#27272a] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs text-[#d4d4d8] shrink-0">
          <Key className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden xs:inline">کلیدها:</span>
          <span className="font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 text-[11px]">
            {activeProfileCount} فعال
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#09090b] border border-[#27272a] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs text-[#d4d4d8] shrink-0 max-w-[180px] sm:max-w-xs truncate">
          <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          <span className="font-semibold text-[#fafafa] truncate">{instagramConfig.pageName}</span>
          {instagramConfig.isSandboxMode && (
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium shrink-0 hidden sm:inline">
              Sandbox
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2.5 text-[#a1a1aa] hover:text-[#fafafa] bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="بروزرسانی داده‌ها"
          aria-label="بروزرسانی"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        <button
          onClick={onQuickGenerate}
          className="flex items-center gap-1.5 sm:gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 sm:px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 min-h-[44px]"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">تولید محتوای هوشمند</span>
          <span className="sm:hidden">تولید ایده</span>
        </button>
      </div>
    </header>
  );
};

