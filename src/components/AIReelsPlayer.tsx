import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Sparkles, Film, Layers, Camera } from 'lucide-react';
import { PostItem, VideoScene } from '../types';

interface AIReelsPlayerProps {
  post: PostItem;
}

export const AIReelsPlayer: React.FC<AIReelsPlayerProps> = ({ post }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [bgStyle, setBgStyle] = useState<'cyberpunk' | 'neon_waves' | 'abstract_particles' | '3d_grid'>('cyberpunk');

  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);

  const scenes: VideoScene[] = post.storyboard && post.storyboard.length > 0 ? post.storyboard : [
    { timestamp: '0:00 - 0:04', sceneDescription: 'قلاب بصری جذاب اولیه', voiceoverText: post.videoScript || post.title, visualPrompt: 'Hook opening' },
    { timestamp: '0:04 - 0:08', sceneDescription: 'معرفی راهکار کلیدی', voiceoverText: post.caption?.substring(0, 60) || post.title, visualPrompt: 'Main solution' },
    { timestamp: '0:08 - 0:12', sceneDescription: 'نتیجه‌گیری و نمایش راندمان', voiceoverText: 'با این ابزار سرعت کار شما ۵ برابر می‌شود!', visualPrompt: 'Results' },
    { timestamp: '0:12 - 0:15', sceneDescription: 'دعوت به فالو و ذخیره پست', voiceoverText: 'پیج را فالو کنید و این ویدیو را ذخیره کنید!', visualPrompt: 'CTA' },
  ];

  // Speech synthesis for Persian voiceover
  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fa-IR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Canvas Motion Video Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particleArray: { x: number; y: number; radius: number; vx: number; vy: number; color: string }[] = [];
    const width = 360;
    const height = 640;
    canvas.width = width;
    canvas.height = height;

    // Create particles for motion
    for (let i = 0; i < 40; i++) {
      particleArray.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color: ['#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)],
      });
    }

    let frameCount = 0;

    const render = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
      frameCount++;

      // Background Gradient Animation
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (bgStyle === 'cyberpunk') {
        const offset = Math.sin(frameCount * 0.02) * 50;
        grad.addColorStop(0, '#09090b');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#311042');
      } else if (bgStyle === 'neon_waves') {
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      } else if (bgStyle === '3d_grid') {
        grad.addColorStop(0, '#18002e');
        grad.addColorStop(1, '#000000');
      } else {
        grad.addColorStop(0, '#042f2e');
        grad.addColorStop(1, '#020617');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw Animated Particles
      particleArray.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Animated Geometric Waves
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const y = Math.sin((x + frameCount * 2) * 0.02) * 20 + height * 0.45;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Top Title Bar Overlay (Reels Header)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.roundRect(15, 15, width - 30, 42, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(post.title.substring(0, 32), width - 30, 38);

      // Current Scene Info
      const activeScene = scenes[currentSceneIdx] || scenes[0];

      // Draw Scene Visual Card Centerpiece
      ctx.save();
      const pulseScale = 1 + Math.sin(frameCount * 0.04) * 0.02;
      ctx.translate(width / 2, height * 0.45);
      ctx.scale(pulseScale, pulseScale);

      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 2;
      ctx.roundRect(-width * 0.4, -100, width * 0.8, 200, 16);
      ctx.fill();
      ctx.stroke();

      // Scene Badge
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`SCENE ${currentSceneIdx + 1} / ${scenes.length}`, 0, -70);

      // Scene Description Text
      ctx.fillStyle = '#fafafa';
      ctx.font = 'bold 13px Vazirmatn, Tahoma, sans-serif';
      ctx.fillText(activeScene.sceneDescription.substring(0, 35), 0, -40);

      // Visual Motion Prompt text
      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'italic 10px monospace';
      ctx.fillText(`[ Camera Motion: ${activeScene.visualPrompt.substring(0, 35)} ]`, 0, -15);

      ctx.restore();

      // Voiceover Subtitle Box at Bottom
      ctx.fillStyle = 'rgba(9, 9, 11, 0.9)';
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.roundRect(15, height - 150, width - 30, 120, 16);
      ctx.fill();
      ctx.stroke();

      // Voiceover Subtitle Header
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 11px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🎙 گوینده هوشمند AI:', width - 30, height - 128);

      // Subtitle Text Body
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Vazirmatn, Tahoma, sans-serif';
      const lineY = height - 102;
      ctx.fillText(activeScene.voiceoverText.substring(0, 42), width - 30, lineY);
      if (activeScene.voiceoverText.length > 42) {
        ctx.fillText(activeScene.voiceoverText.substring(42, 85), width - 30, lineY + 20);
      }

      // Progress bar at top
      const progress = ((currentSceneIdx + (elapsedSeconds % 3) / 3) / scenes.length) * 100;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 0, width, 4);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(0, 0, (width * Math.min(progress, 100)) / 100, 4);

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render(performance.now());

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, currentSceneIdx, bgStyle, post, scenes]);

  // Handle Play/Pause timer & scene progression
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      speakText(scenes[currentSceneIdx]?.voiceoverText || '');
      timer = setInterval(() => {
        setCurrentSceneIdx((prev) => {
          const next = (prev + 1) % scenes.length;
          speakText(scenes[next]?.voiceoverText || '');
          return next;
        });
      }, 4000);
    } else {
      window.speechSynthesis?.cancel();
    }
    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, currentSceneIdx]);

  // Export & Record Video Stream from Canvas
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setIsPlaying(true);
      recordedChunksRef.current = [];

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Stop after full scenes loop (16 seconds)
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          setIsPlaying(false);
        }
      }, scenes.length * 4000);
    } catch (err) {
      console.error('Recording error:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="font-bold text-xs text-[#fafafa]">موتور زنده رندر ویدیو و حرکت انیمیشن AI</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={bgStyle}
            onChange={(e: any) => setBgStyle(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded-lg text-[11px] text-zinc-300 px-2 py-1 focus:outline-none"
          >
            <option value="cyberpunk">تم سایبرپانک و نئون</option>
            <option value="neon_waves">امواج مدرن نئونی</option>
            <option value="3d_grid">شبکه 3D فضایی</option>
            <option value="abstract_particles">ذرات سه بعدی معلق</option>
          </select>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-zinc-300 hover:text-white"
            title={isMuted ? 'فعال‌سازی گوینده صوتی' : 'قطع صدا'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport & Reel Screen */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative aspect-[9/16] w-full max-w-[240px] rounded-2xl overflow-hidden bg-black border-2 border-indigo-500/30 shadow-2xl">
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {/* Watermark badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-indigo-300 font-mono border border-indigo-500/20">
            AI Video Reel
          </div>
        </div>
      </div>

      {/* Media Action Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
            } text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'توقف پخش ویدیو' : 'پخش ریلز هوشمند با گوینده صوتی'}</span>
          </button>

          <button
            onClick={() => setCurrentSceneIdx((prev) => (prev + 1) % scenes.length)}
            className="p-2.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-xl text-zinc-300"
            title="سکانس بعدی"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Export / Record Video Button */}
        <div className="pt-2 border-t border-[#27272a] flex items-center justify-between gap-2">
          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Film className={`w-4 h-4 ${isRecording ? 'animate-spin' : ''}`} />
            <span>{isRecording ? 'در حال رندر و ضبط کل ویدیو MP4...' : 'دانلود و رندر کل ویدیو ریلز (Export MP4)'}</span>
          </button>

          {recordedVideoUrl && (
            <a
              href={recordedVideoUrl}
              download={`${post.title}-reel.webm`}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
