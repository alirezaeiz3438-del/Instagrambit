import React, { useState } from 'react';
import { Sparkles, Download, RefreshCw, Layers } from 'lucide-react';

interface AIPosterCanvasProps {
  title: string;
  prompt?: string;
  imageUrl?: string;
  badgeText?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const AIPosterCanvas: React.FC<AIPosterCanvasProps> = ({
  title,
  prompt,
  imageUrl,
  badgeText = 'AI Instagram Post',
  onRegenerate,
  isRegenerating = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Generate SVG Poster Data URI as a 100% guaranteed fallback image
  const generateSvgPoster = (text: string, subtext = '') => {
    const cleanTitle = text.substring(0, 45);
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09090b"/>
          <stop offset="50%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#311042"/>
        </linearGradient>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1080" height="1080" fill="url(#bgGrad)"/>

      <!-- Geometric Art Patterns -->
      <circle cx="900" cy="180" r="300" fill="#6366f1" opacity="0.15" filter="url(#shadow)"/>
      <circle cx="180" cy="900" r="250" fill="#ec4899" opacity="0.15"/>
      <rect x="140" y="140" width="800" height="800" rx="40" fill="none" stroke="url(#glowGrad)" stroke-width="4" opacity="0.4"/>

      <!-- Center Card Frame -->
      <rect x="200" y="240" width="680" height="600" rx="32" fill="#18181b" stroke="#27272a" stroke-width="3" filter="url(#shadow)" opacity="0.95"/>

      <!-- AI Badge -->
      <rect x="240" y="280" width="220" height="50" rx="25" fill="url(#glowGrad)"/>
      <text x="350" y="312" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${badgeText}</text>

      <!-- Main Title -->
      <text x="540" y="440" fill="#ffffff" font-family="Vazirmatn, Tahoma, sans-serif" font-size="44" font-weight="bold" text-anchor="middle">
        ${cleanTitle}
      </text>

      <!-- Subtext / Prompt -->
      <text x="540" y="520" fill="#a1a1aa" font-family="Vazirmatn, Tahoma, sans-serif" font-size="26" text-anchor="middle">
        ${subtext.substring(0, 50)}
      </text>

      <!-- Decorative Line -->
      <line x1="340" y1="580" x2="740" y2="580" stroke="url(#glowGrad)" stroke-width="4" stroke-linecap="round"/>

      <!-- Footer Brand -->
      <text x="540" y="740" fill="#818cf8" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle">
        INSTAGRAM AI CONTENT ENGINE
      </text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const svgBackupUrl = generateSvgPoster(title, prompt || 'تولید شده توسط هوش مصنوعی');

  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#09090b] border border-[#27272a] group shadow-xl">
      <img
        src={!imgError && imageUrl ? imageUrl : svgBackupUrl}
        alt={title}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay controls */}
      <div className="absolute inset-0 bg-[#09090b]/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4 gap-3">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'در حال خَلق تصویر هوشمند...' : 'بازتولید تصویر هوشمند با AI'}</span>
          </button>
        )}

        {prompt && (
          <span className="text-[10px] text-[#fafafa] bg-[#18181b] px-3 py-1.5 rounded-xl font-mono border border-[#27272a] max-w-[90%] text-center truncate">
            Prompt: {prompt}
          </span>
        )}
      </div>
    </div>
  );
};
