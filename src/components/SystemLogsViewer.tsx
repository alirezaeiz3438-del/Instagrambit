import React, { useState } from 'react';
import { Activity, RefreshCw, Filter } from 'lucide-react';
import { SystemLog } from '../types';

interface SystemLogsViewerProps {
  logs: SystemLog[];
  onRefresh: () => void;
}

export const SystemLogsViewer: React.FC<SystemLogsViewerProps> = ({ logs, onRefresh }) => {
  const [filterModule, setFilterModule] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterModule === 'all') return true;
    return log.module === filterModule;
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">لاگ‌های سیستم و سرویس‌های پشتی (System Logs)</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            مشاهده رویدادهای زنده سیستم شامل چرخش کلیدها، فیلتر آگهی، درخواست‌های Instagram Graph API و خطاهای احتمالی.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2.5 text-[#a1a1aa] hover:text-white bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] rounded-xl transition-all self-start md:self-auto"
          title="بروزرسانی لاگ‌ها"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs">
        {['all', 'ai_engine', 'instagram', 'telegram', 'ad_filter', 'system'].map((mod) => (
          <button
            key={mod}
            onClick={() => setFilterModule(mod)}
            className={`px-3.5 py-2 rounded-xl transition-all font-mono whitespace-nowrap ${
              filterModule === mod
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            {mod === 'all' ? 'همه ماژول‌ها' : mod}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 font-mono text-xs space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-[#09090b] border border-[#27272a] p-3.5 rounded-2xl flex items-start gap-3"
          >
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                log.level === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : log.level === 'warn'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : log.level === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}
            >
              {log.level}
            </span>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 text-[10px] text-[#71717a]">
                <span>[{log.module}]</span>
                <span>{new Date(log.timestamp).toLocaleString('fa-IR')}</span>
              </div>
              <p className="text-[#fafafa] text-xs mt-1 leading-relaxed font-sans">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
