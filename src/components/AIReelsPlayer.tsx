import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Sparkles, Film, RefreshCw, Radio, Camera } from 'lucide-react';
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
  const [loadedImagesCount, setLoadedImagesCount] = useState<number>(0);

  const [scenes, setScenes] = useState<(VideoScene & { imageUrl?: string })[]>(() => {
    if (post.storyboard && post.storyboard.length > 0) {
      return post.storyboard.map((s, idx) => {
        const cleanPrompt = encodeURIComponent(`High quality vertical 9:16 ${s.visualPrompt || post.title} scene ${idx + 1}`);
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
        visualPrompt: `Vertical 9:16 photography about ${post.title}`,
        imageUrl: post.imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(post.title)}?width=720&height=1280&nologo=true&model=flux&seed=100`,
      },
      {
        timestamp: '0:04 - 0:08',
        sceneDescription: 'معرفی راهکار کلیدی و نمایش جزئیات',
        voiceoverText: post.caption?.substring(0, 70) || post.title,
        visualPrompt: `Modern tech dashboard visualization about ${post.title}`,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Modern visual ${post.title}`)}?width=720&height=1280&nologo=true&model=flux&seed=200`,
      },
      {
        timestamp: '0:08 - 0:12',
        sceneDescription: 'تحلیل دقیق و نمایش نتیجه نهایی',
        voiceoverText: 'با این ابزار سرعت تولید محتوای شما ۵ برابر می‌شود!',
        visualPrompt: `Digital concept graph for ${post.title}`,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Digital concept ${post.title}`)}?width=720&height=1280&nologo=true&model=flux&seed=300`,
      },
      {
        timestamp: '0:12 - 0:15',
        sceneDescription: 'دعوت به فالو و ذخیره ویدیو',
        voiceoverText: 'پیج را فالو کنید و این ویدیو را ذخیره کنید!',
        visualPrompt: 'Instagram call to action follow and save visual',
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent('Instagram call to action follow and save')}?width=720&height=1280&nologo=true&model=flux&seed=400`,
      },
    ];
  });

  // Preload scene images reliably with fallback images
  useEffect(() => {
    scenes.forEach((scene, idx) => {
      if (!scene.imageUrl) return;

      const loadImage = (url: string) => {
        const img = new Image();
        // Do not set crossOrigin = 'anonymous' directly to avoid strict CORS block on Pollinations images
        img.src = url;
        img.onload = () => {
          sceneImagesRef.current[idx] = img;
          setLoadedImagesCount((prev) => prev + 1);
        };
        img.onerror = () => {
          // Fallback to high-quality Unsplash tech imagery matching topic
          const fallbackImg = new Image();
          const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=720&auto=format&fit=crop&q=80`;
          fallbackImg.src = fallbackUrl;
          fallbackImg.onload = () => {
            sceneImagesRef.current[idx] = fallbackImg;
            setLoadedImagesCount((prev) => prev + 1);
          };
        };
      };

      loadImage(scene.imageUrl);
    });
  }, [scenes]);

  // Web Audio synth effect for audio cues
  const playWebAudioBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // ignore
    }
  };

  // Robust Persian Speech synthesis for voiceover
  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window) || !text) return;

    try {
      window.speechSynthesis.cancel();
      playWebAudioBeep();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fa-IR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select Persian voice if available in user's browser
      const voices = window.speechSynthesis.getVoices();
      const faVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('fa') ||
          v.lang.toLowerCase().includes('persian') ||
          v.name.toLowerCase().includes('farsi') ||
          v.name.toLowerCase().includes('persian')
      );
      if (faVoice) {
        utterance.voice = faVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis issue:', err);
    }
  };

  // Dynamic Motion Canvas Video Renderer (Runs at 60 FPS with particles, graphics & image parallax)
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

      // 1. Draw Background or AI Scene Image
      if (sceneImg && sceneImg.complete && sceneImg.naturalWidth > 0) {
        ctx.save();
        // Cinematic Ken Burns Zoom & Pan Effect
        const scale = 1.06 + Math.sin(frameCount * 0.008) * 0.04;
        const offsetX = Math.cos(frameCount * 0.005) * 10;
        const offsetY = Math.sin(frameCount * 0.005) * 10;
        ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
        ctx.scale(scale, scale);
        ctx.drawImage(sceneImg, -width / 2, -height / 2, width, height);
        ctx.restore();
      } else {
        // Fallback procedural motion graphics background (Always active moving Reel scene!)
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        const hue1 = (frameCount * 0.5) % 360;
        const hue2 = (hue1 + 60) % 360;
        bgGrad.addColorStop(0, '#09090b');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#311042');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Ambient Motion Light Spheres
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const circle1X = width / 2 + Math.cos(frameCount * 0.02) * 80;
        const circle1Y = height / 3 + Math.sin(frameCount * 0.02) * 60;
        const g1 = ctx.createRadialGradient(circle1X, circle1Y, 10, circle1X, circle1Y, 180);
        g1.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
        g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(circle1X, circle1Y, 180, 0, Math.PI * 2);
        ctx.fill();

        const circle2X = width / 2 + Math.sin(frameCount * 0.025) * 70;
        const circle2Y = (height * 2) / 3 + Math.cos(frameCount * 0.025) * 50;
        const g2 = ctx.createRadialGradient(circle2X, circle2Y, 10, circle2X, circle2Y, 160);
        g2.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
        g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(circle2X, circle2Y, 160, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Center Animated Topic Icon / Visual Graphic
        ctx.save();
        ctx.translate(width / 2, height / 2 - 30);
        const pulse = 1 + Math.sin(frameCount * 0.08) * 0.08;
        ctx.scale(pulse, pulse);

        ctx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI REEL', 0, 0);
        ctx.restore();
      }

      // 2. Floating Motion Particles Across Scene
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let i = 0; i < 15; i++) {
        const px = (Math.sin(i * 99 + frameCount * 0.015) * 0.5 + 0.5) * width;
        const py = ((frameCount * (1 + (i % 3) * 0.5) + i * 40) % height);
        const pSize = 1.5 + (i % 3);
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Dark Vignette Overlays for High Contrast Typography
      const topGrad = ctx.createLinearGradient(0, 0, 0, 130);
      topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
      topGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 130);

      const bottomGrad = ctx.createLinearGradient(0, height - 210, 0, height);
      bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
      bottomGrad.addColorStop(0.3, 'rgba(0,0,0,0.85)');
      bottomGrad.addColorStop(1, 'rgba(0,0,0,0.98)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, height - 210, width, 210);

      // 4. Top Progress Indicator Bar
      const progress = ((currentSceneIdx + (elapsedSeconds % 4) / 4) / scenes.length) * 100;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(10, 10, width - 20, 3);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(10, 10, ((width - 20) * Math.min(progress, 100)) / 100, 3);

      // 5. Header Bar Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.roundRect(12, 20, width - 24, 38, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(post.title.substring(0, 28), width - 24, 42);

      // Scene Badge Top Left
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SCENE ${currentSceneIdx + 1}/${scenes.length}`, 24, 42);

      // 6. Active Subtitle & Voiceover Box at Bottom
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.roundRect(12, height - 150, width - 24, 120, 14);
      ctx.fill();
      ctx.stroke();

      // Voiceover Header & Active Indicator
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 11px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🎙 گوینده هوشمند AI:', width - 24, height - 126);

      // Subtitle Text Lines
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Vazirmatn, Tahoma, sans-serif';
      const text = activeScene.voiceoverText || '';
      ctx.fillText(text.substring(0, 38), width - 24, height - 102);
      if (text.length > 38) {
        ctx.fillText(text.substring(38, 76), width - 24, height - 82);
      }
      if (text.length > 76) {
        ctx.fillText(text.substring(76, 114), width - 24, height - 62);
      }

      // Animated Equalizer Audio Visualizer if playing
      if (isPlaying) {
        ctx.fillStyle = '#34d399';
        for (let i = 0; i < 5; i++) {
          const h = 6 + Math.sin(frameCount * 0.2 + i * 1.2) * 7;
          ctx.fillRect(24 + i * 5, height - 132, 3.5, h);
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
  }, [isPlaying, currentSceneIdx, post, scenes, loadedImagesCount]);

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
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, currentSceneIdx, scenes]);

  // Toggle Play Button with explicit user gesture triggering SpeechSynthesis
  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      speakText(scenes[currentSceneIdx]?.voiceoverText || '');
    }
  };

  // Regenerate image specifically for the selected scene
  const handleRegenerateSceneImage = async (sceneIdx: number) => {
    try {
      setIsRegeneratingScene(true);
      const scene = scenes[sceneIdx];
      const scenePrompt = `${scene.visualPrompt || post.title} scene ${sceneIdx + 1}`;
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
        img.src = res.imageUrl;
        img.onload = () => {
          sceneImagesRef.current[sceneIdx] = img;
          setLoadedImagesCount((prev) => prev + 1);
        };
      }
    } catch (err) {
      console.error('Failed to regenerate scene image:', err);
    } finally {
      setIsRegeneratingScene(false);
    }
  };

  // Take screenshot frame of current canvas state
  const handleTakeScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${post.title.substring(0, 15)}-scene${currentSceneIdx + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  };

  // Export & Record Video Stream from Canvas
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setIsPlaying(true);
      speakText(scenes[0]?.voiceoverText || '');
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
          <span className="font-bold text-xs text-[#fafafa]">رندر هوشمند ویدیو و گوینده صوتی AI</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className="p-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-zinc-300 hover:text-white transition-all flex items-center gap-1 text-[11px]"
            title={isMuted ? 'فعال‌سازی گوینده صوتی' : 'قطع صدا'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="text-zinc-400 text-[10px]">{isMuted ? 'صدا خاموش' : 'گوینده فعال'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport & Reel Screen */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative aspect-[9/16] w-full max-w-[250px] rounded-2xl overflow-hidden bg-black border-2 border-indigo-500/40 shadow-2xl group">
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {/* Watermark badge */}
          <div className="absolute top-4 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-indigo-300 font-mono border border-indigo-500/30 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-rose-400 animate-ping" />
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
            <span>{isRegeneratingScene ? 'در حال خَلق...' : 'بازتولید تصویر صحنه با Flux AI'}</span>
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 leading-relaxed truncate">
          سوژه ویدیو: {activeScene.visualPrompt}
        </p>
      </div>

      {/* Media Action Buttons */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`flex-1 ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
            } text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'توقف پخش' : 'پخش ویدیو با گوینده'}</span>
          </button>

          <button
            onClick={handleTakeScreenshot}
            className="p-2.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-xl text-rose-300 flex items-center gap-1 text-xs font-medium transition-all"
            title="ذخیره اسکرین‌شات عکس از فریم جاری"
          >
            <Camera className="w-4 h-4 text-rose-400" />
            <span className="text-[11px] font-semibold">عکس/اسکرین‌شات</span>
          </button>

          <button
            onClick={() => {
              const nextIdx = (currentSceneIdx + 1) % scenes.length;
              setCurrentSceneIdx(nextIdx);
              speakText(scenes[nextIdx]?.voiceoverText || '');
            }}
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
            <span>{isRecording ? 'در حال ضبط و دریافت فایل ویدیو...' : 'دانلود فایل رندر شده ویدیو (Export WebM / MP4)'}</span>
          </button>

          {recordedVideoUrl && (
            <a
              href={recordedVideoUrl}
              download={`${post.title}-reel.webm`}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>دانلود</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
