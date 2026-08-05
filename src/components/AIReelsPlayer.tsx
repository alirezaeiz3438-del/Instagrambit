import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Sparkles, Film, RefreshCw } from 'lucide-react';
import { PostItem, VideoScene } from '../types';
import { api } from '../lib/api';

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
  const [isRegeneratingScene, setIsRegeneratingScene] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);

  // Map to hold preloaded HTMLImageElements for each scene index
  const sceneImagesRef = useRef<{ [key: number]: HTMLImageElement }>({});

  const [scenes, setScenes] = useState<(VideoScene & { imageUrl?: string })[]>(() => {
    if (post.storyboard && post.storyboard.length > 0) {
      return post.storyboard.map((s, idx) => {
        const cleanPrompt = encodeURIComponent(`Cinematic vertical 9:16 ${s.visualPrompt || post.title} scene ${idx + 1}`);
        const seed = Math.floor(Math.random() * 999999) + idx * 1000;
        return {
          ...s,
          imageUrl: (s as any).imageUrl || `https://image.pollinations.ai/prompt/${cleanPrompt}?width=720&height=1280&nologo=true&model=flux&seed=${seed}`,
        };
      });
    }
    return [
      {
        timestamp: '0:00 - 0:04',
        sceneDescription: 'قلاب بصری جذاب اولیه',
        voiceoverText: post.videoScript || post.title,
        visualPrompt: `Cinematic vertical 9:16 portrait about ${post.title}`,
        imageUrl: post.imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(post.title)}?width=720&height=1280&nologo=true&model=flux&seed=100`,
      },
      {
        timestamp: '0:04 - 0:08',
        sceneDescription: 'معرفی راهکار کلیدی و نمایش جزئیات',
        voiceoverText: post.caption?.substring(0, 70) || post.title,
        visualPrompt: `Modern tech dashboard visualization about ${post.title}`,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Modern tech visual ${post.title}`)}?width=720&height=1280&nologo=true&model=flux&seed=200`,
      },
      {
        timestamp: '0:08 - 0:12',
        sceneDescription: 'تحلیل دقیق و نمایش نتیجه نهایی',
        voiceoverText: 'با این ابزار سرعت تولید محتوای شما ۵ برابر می‌شود!',
        visualPrompt: `High resolution digital concept graph for ${post.title}`,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Digital concept result ${post.title}`)}?width=720&height=1280&nologo=true&model=flux&seed=300`,
      },
      {
        timestamp: '0:12 - 0:15',
        sceneDescription: 'دعوت به فالو و ذخیره ویدیو',
        voiceoverText: 'پیج را فالو کنید و این ویدیو را ذخیره کنید!',
        visualPrompt: 'Instagram call to action follow and save 3D visual render',
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent('Instagram call to action follow and save')}?width=720&height=1280&nologo=true&model=flux&seed=400`,
      },
    ];
  });

  // Preload all scene images into memory
  useEffect(() => {
    scenes.forEach((scene, idx) => {
      if (scene.imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = scene.imageUrl;
        img.onload = () => {
          sceneImagesRef.current[idx] = img;
        };
      }
    });
  }, [scenes]);

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

  // Canvas Motion Video Render Loop with Scene AI Images & Ken Burns Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 360;
    const height = 640;
    canvas.width = width;
    canvas.height = height;

    let frameCount = 0;

    const render = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
      frameCount++;

      const activeScene = scenes[currentSceneIdx] || scenes[0];
      const sceneImg = sceneImagesRef.current[currentSceneIdx];

      // Draw Full 9:16 Scene AI Image with Cinematic Motion (Ken Burns Effect)
      if (sceneImg && sceneImg.complete && sceneImg.naturalWidth > 0) {
        ctx.save();
        const scale = 1.05 + Math.sin(frameCount * 0.008) * 0.04;
        const offsetX = Math.cos(frameCount * 0.005) * 8;
        const offsetY = Math.sin(frameCount * 0.005) * 8;
        ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
        ctx.scale(scale, scale);
        ctx.drawImage(sceneImg, -width / 2, -height / 2, width, height);
        ctx.restore();
      } else {
        // Fallback smooth gradient if image is still loading
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#09090b');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#311042');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Loading text
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '12px Vazirmatn, Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('در حال بارگذاری تصویر هوش مصنوعی...', width / 2, height / 2);
      }

      // Dark Vignette Overlays at Top & Bottom for Text Readability
      const topGrad = ctx.createLinearGradient(0, 0, 0, 120);
      topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
      topGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 120);

      const bottomGrad = ctx.createLinearGradient(0, height - 200, 0, height);
      bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
      bottomGrad.addColorStop(0.4, 'rgba(0,0,0,0.75)');
      bottomGrad.addColorStop(1, 'rgba(0,0,0,0.95)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, height - 200, width, 200);

      // Top Progress Bar
      const progress = ((currentSceneIdx + (elapsedSeconds % 4) / 4) / scenes.length) * 100;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(10, 8, width - 20, 3);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(10, 8, ((width - 20) * Math.min(progress, 100)) / 100, 3);

      // Top Title Bar Overlay (Reels Header)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.roundRect(12, 18, width - 24, 38, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(post.title.substring(0, 28), width - 24, 40);

      // Scene Badge Top Left
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SCENE ${currentSceneIdx + 1}/${scenes.length}`, 24, 40);

      // Active Subtitle / Voiceover Box at Bottom
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.roundRect(12, height - 145, width - 24, 115, 14);
      ctx.fill();
      ctx.stroke();

      // Voiceover Header & Icon
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 11px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🎙 گوینده هوشمند AI:', width - 24, height - 122);

      // Subtitle Text Lines
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Vazirmatn, Tahoma, sans-serif';
      const text = activeScene.voiceoverText || '';
      ctx.fillText(text.substring(0, 38), width - 24, height - 98);
      if (text.length > 38) {
        ctx.fillText(text.substring(38, 76), width - 24, height - 78);
      }
      if (text.length > 76) {
        ctx.fillText(text.substring(76, 114), width - 24, height - 58);
      }

      // Animated Sound Waves indicator if playing
      if (isPlaying) {
        ctx.fillStyle = '#34d399';
        for (let i = 0; i < 4; i++) {
          const h = 6 + Math.sin(frameCount * 0.15 + i) * 5;
          ctx.fillRect(24 + i * 5, height - 128, 3, h);
        }
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render(performance.now());

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, currentSceneIdx, post, scenes]);

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
  }, [isPlaying, currentSceneIdx, scenes]);

  // Regenerate image specifically for the selected scene
  const handleRegenerateSceneImage = async (sceneIdx: number) => {
    try {
      setIsRegeneratingScene(true);
      const scene = scenes[sceneIdx];
      const scenePrompt = `${scene.visualPrompt || post.title} - scene ${sceneIdx + 1}`;
      const res = await api.generateStandaloneImage(scenePrompt, 'cinematic', 720, 1280);

      if (res && res.imageUrl) {
        const updatedScenes = [...scenes];
        updatedScenes[sceneIdx] = {
          ...updatedScenes[sceneIdx],
          imageUrl: res.imageUrl,
        };
        setScenes(updatedScenes);

        // Load new image into memory map
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = res.imageUrl;
        img.onload = () => {
          sceneImagesRef.current[sceneIdx] = img;
        };
      }
    } catch (err) {
      console.error('Failed to regenerate scene image:', err);
    } finally {
      setIsRegeneratingScene(false);
    }
  };

  // Export & Record Video Stream from Canvas
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setIsPlaying(true);
      recordedChunksRef.current = [];

      const stream = canvas.captureStream(30);
      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        options = { mimeType: 'video/webm;codecs=vp9' };
      } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm')) {
        options = { mimeType: 'video/webm' };
      } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/mp4')) {
        options = { mimeType: 'video/mp4' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);

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

  const activeScene = scenes[currentSceneIdx] || scenes[0];

  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl w-full">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="font-bold text-xs text-[#fafafa]">رندر هوشمند ویدیو و تصاویر اختصاصی AI</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-zinc-300 hover:text-white transition-all"
            title={isMuted ? 'فعال‌سازی گوینده صوتی' : 'قطع صدا'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport & Reel Screen */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative aspect-[9/16] w-full max-w-[250px] rounded-2xl overflow-hidden bg-black border-2 border-indigo-500/40 shadow-2xl group">
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {/* Watermark badge */}
          <div className="absolute top-4 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-indigo-300 font-mono border border-indigo-500/30">
            Flux AI Reel
          </div>
        </div>
      </div>

      {/* Scene Navigation Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300">انتخاب صحنه ویدیو:</span>
          <span>صحنه {currentSceneIdx + 1} از {scenes.length}</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {scenes.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSceneIdx(idx);
                speakText(s.voiceoverText);
              }}
              className={`p-2 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center gap-1 border ${
                currentSceneIdx === idx
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-white'
              }`}
            >
              <span>صحنه {idx + 1}</span>
              <span className="text-[9px] text-zinc-500">{s.timestamp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Scene Action: Regenerate Image for Current Scene */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-300 font-semibold truncate max-w-[180px]">{activeScene.sceneDescription}</span>
          <button
            onClick={() => handleRegenerateSceneImage(currentSceneIdx)}
            disabled={isRegeneratingScene}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isRegeneratingScene ? 'animate-spin' : ''}`} />
            <span>{isRegeneratingScene ? 'در حال خَلق...' : 'تولید مجدد تصویر این صحنه با Flux AI'}</span>
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 leading-relaxed truncate">
          پرامپت تصویری: {activeScene.visualPrompt}
        </p>
      </div>

      {/* Media Action Buttons */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
            } text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'توقف پخش ویدیو' : 'پخش ویدیو ریلز با گوینده صوتی'}</span>
          </button>

          <button
            onClick={() => setCurrentSceneIdx((prev) => (prev + 1) % scenes.length)}
            className="p-2.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-xl text-zinc-300"
            title="صحنه بعدی"
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
            <span>{isRecording ? 'در حال ضبط و دانلود کامل ویدیو...' : 'دانلود فایل کامل ویدیو ریلز (Export MP4 / WebM)'}</span>
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
