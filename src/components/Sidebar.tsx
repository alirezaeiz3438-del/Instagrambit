import React from 'react';
import {
  LayoutDashboard,
  Key,
  Sliders,
  Lightbulb,
  FileText,
  Calendar,
  ShieldAlert,
  BarChart3,
  Instagram,
  Palette,
  Terminal,
  Activity,
  Bot,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pageNiche: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pageNiche }) => {
  const menuItems = [
    { id: 'dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
    { id: 'ai-keys', label: 'مدیریت کلیدهای AI', icon: Key, badge: 'Multi-Key' },
    { id: 'strategy', label: 'هویت و استراتژی پیج', icon: Sliders },
    { id: 'idea-engine', label: 'موتور ایده و تلگرام', icon: Lightbulb },
    { id: 'content-studio', label: 'استودیو و تایید محتوا', icon: FileText, badge: 'Human Review' },
    { id: 'calendar', label: 'تقویم انتشار', icon: Calendar },
    { id: 'ad-filter', label: 'فیلتر تبلیغات (Ad Filter)', icon: ShieldAlert },
    { id: 'analytics', label: 'آنالیتیکس و یادگیری AI', icon: BarChart3 },
    { id: 'instagram-api', label: 'تنظیمات اینستاگرام API', icon: Instagram },
    { id: 'brand-assets', label: 'دارایی‌های برند', icon: Palette },
    { id: 'installer', label: 'اسکریپت نصب VPS (CLI)', icon: Terminal },
    { id: 'logs', label: 'لاگ‌های سیستم', icon: Activity },
  ];

  return (
    <aside className="w-72 bg-[#18181b] border-l border-[#27272a] flex flex-col justify-between shrink-0 select-none text-[#fafafa] min-h-screen">
      <div>
        {/* Logo Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#fafafa] flex items-center gap-1.5">
              InstaBot AI <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-bold">v2.5</span>
            </h1>
            <p className="text-xs text-[#a1a1aa] truncate max-w-[160px]" title={pageNiche}>
              {pageNiche || 'ربات اتوماسیون پیج'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#a1a1aa]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#09090b] text-indigo-400 border border-[#27272a]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border border-[#27272a] bg-[#09090b] m-3 rounded-2xl space-y-1">
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold">چرخش هوشمند کلیدها فعال</span>
        </div>
        <p className="text-[11px] text-[#71717a] leading-relaxed">
          اتصال رسمی Instagram Graph API & Gemini 3.6 Flash
        </p>
      </div>
    </aside>
  );
};
