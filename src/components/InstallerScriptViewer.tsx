import React, { useState } from 'react';
import { Terminal, Play, Download, ShieldCheck, Server, KeyRound, Copy, Check } from 'lucide-react';

interface InstallerScriptViewerProps {
  onRunOption: (option: number) => Promise<{ success: boolean; output: string }>;
}

export const InstallerScriptViewer: React.FC<InstallerScriptViewerProps> = ({ onRunOption }) => {
  const [activeMenuChoice, setActiveMenuChoice] = useState<number | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>(
    '======================================================================\n' +
      '   🤖 اسکریپت نصب و مدیریت ربات اتوماسیون هوشمند اینستاگرام (install.sh)\n' +
      '======================================================================\n' +
      'یک گزینه از منوی زیر را برای شبیه‌سازی یا اجرا روی سرور VPS انتخاب کنید...\n'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuItems = [
    { id: 1, label: '۱) نصب کامل + پیش‌نیازها (Full Install)', desc: 'نصب Docker, Nginx, ساخت فایل env و کانتینرها' },
    { id: 2, label: '۲) تعریف دامنه و صدور SSL', desc: 'بررسی A Record و دریافت گواهی Let\'s Encrypt' },
    { id: 3, label: '۳) بروزرسانی پروژه', desc: 'Git pull و بازسازی کانتینرها' },
    { id: 4, label: '۴) پشتیبان‌گیری دیتابیس', desc: 'گرفتن فشرده بکاپ در مسیر backups/' },
    { id: 5, label: '۵) مشاهده لاگ سرویس‌ها', desc: 'نمایش لاگ زنده docker compose' },
    { id: 6, label: '۶) حذف کامل ربات (Uninstall)', desc: 'پاکسازی کانتینرها و داده‌ها با سوال بکاپ' },
  ];

  const handleRun = async (optionId: number) => {
    setIsRunning(true);
    setActiveMenuChoice(optionId);
    setTerminalOutput((prev) => prev + `\n> Executing option [${optionId}] via install.sh...\n`);
    const res = await onRunOption(optionId);
    setTerminalOutput((prev) => prev + res.output + '\n');
    setIsRunning(false);
  };

  const handleCopyBash = () => {
    navigator.clipboard.writeText('chmod +x install.sh && ./install.sh');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">اسکریپت منودار نصب و مدیریت VPS (install.sh CLI)</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            اسکریپت منودار تعاملی خودکار به زبان Bash جهت راه‌اندازی سریع روی سرور مجازی شخصی (VPS).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#09090b] px-3.5 py-2 rounded-2xl border border-[#27272a] text-xs font-mono text-[#d4d4d8]">
          <span>دستور اجرا:</span>
          <code className="text-indigo-400 font-bold">chmod +x install.sh && ./install.sh</code>
          <button
            onClick={handleCopyBash}
            className="p-1 hover:text-white transition-all text-[#71717a]"
            title="کپی دستور"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Menu Options Grid & Terminal Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Controls */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[#fafafa] px-1">گزینه‌های منوی منودار VPS:</h3>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRun(item.id)}
              disabled={isRunning}
              className={`w-full text-right p-4 rounded-2xl border transition-all text-xs flex flex-col gap-1 ${
                activeMenuChoice === item.id
                  ? 'bg-indigo-600/20 border-indigo-500/60 text-white'
                  : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46] text-[#d4d4d8]'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>{item.label}</span>
                <Play className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </div>
              <span className="text-[11px] text-[#71717a] leading-relaxed">{item.desc}</span>
            </button>
          ))}
        </div>

        {/* Live Terminal Output Frame */}
        <div className="lg:col-span-2 bg-[#09090b] border border-[#27272a] rounded-3xl overflow-hidden flex flex-col font-mono text-xs shadow-2xl h-[480px]">
          {/* Terminal Window Header */}
          <div className="bg-[#18181b] border-b border-[#27272a] px-4 py-3 flex items-center justify-between text-[#a1a1aa] text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="text-[#fafafa] font-bold ml-2">root@vps-server:~/instabot# ./install.sh</span>
            </div>
            <span>bash / interactive</span>
          </div>

          {/* Terminal Output Stream */}
          <div className="p-4 overflow-y-auto flex-1 space-y-1 text-emerald-400 whitespace-pre-wrap leading-relaxed select-text">
            {terminalOutput}
            {isRunning && (
              <div className="text-indigo-400 animate-pulse font-bold mt-2">
                ⏳ در حال اجرای دستور روی سرور مجازی...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
