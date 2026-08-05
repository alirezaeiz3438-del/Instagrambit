import React, { useState } from 'react';
import { BarChart3, Sparkles, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AnalyticsSummary } from '../types';

interface AnalyticsFeedbackProps {
  analytics: AnalyticsSummary;
  onOptimizePrompt: () => Promise<void>;
}

export const AnalyticsFeedback: React.FC<AnalyticsFeedbackProps> = ({ analytics, onOptimizePrompt }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedSuccess, setOptimizedSuccess] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    await onOptimizePrompt();
    setIsOptimizing(false);
    setOptimizedSuccess(true);
    setTimeout(() => setOptimizedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-[#fafafa]">حلقه بازخورد آنالیتیکس و بهینه‌سازی خودکار AI (Analytics Feedback Loop)</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            دریافت داده‌های عملکرد از Instagram Insights API و تزریق هوشمند یادگیری‌ها به پرامپت‌های آینده جهت رشد ارگانیک.
          </p>
        </div>

        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isOptimizing ? 'در حال تحلیل و بهینه‌سازی...' : 'اجرای بهینه‌سازی هوشمند پرامپت با AI'}</span>
        </button>
      </div>

      {optimizedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>حلقه بازخورد با موفقیت اجرا شد! الگوهای پربازدید جدید به پرامپت پایه سیستم تزریق گردیدند.</span>
        </div>
      )}

      {/* AI Performance Insights */}
      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-3xl space-y-3">
        <h3 className="font-bold text-sm text-[#fafafa] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>تحلیل‌ها و توصیه‌های تولید محتوای AI برای پیج شما</span>
        </h3>

        <div className="space-y-2">
          {analytics.aiInsights.map((insight, idx) => (
            <div key={idx} className="bg-[#09090b] border border-[#27272a] p-3.5 rounded-2xl text-xs text-[#d4d4d8] leading-relaxed flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
