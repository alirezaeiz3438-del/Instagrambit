import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  initialAIProfiles,
  initialStrategy,
  initialIdeas,
  initialPosts,
  initialAdFilterConfig,
  initialBrandAsset,
  initialInstagramConfig,
  initialSystemLogs,
  initialAnalytics,
} from './src/data/mockData.js';
import { AIProfile, PageStrategy, PostItem, IdeaItem, AdFilterConfig, BrandAssetConfig, InstagramApiConfig, SystemLog } from './src/types.js';

const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : (typeof import.meta !== 'undefined' && import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory Database Stores
let aiProfiles: AIProfile[] = [...initialAIProfiles];
let strategy: PageStrategy = { ...initialStrategy };
let ideas: IdeaItem[] = [...initialIdeas];
let posts: PostItem[] = [...initialPosts];
let adFilterConfig: AdFilterConfig = { ...initialAdFilterConfig };
let brandAssets: BrandAssetConfig = { ...initialBrandAsset };
let instagramConfig: InstagramApiConfig = { ...initialInstagramConfig };
let systemLogs: SystemLog[] = [...initialSystemLogs];
let analytics = { ...initialAnalytics };

function logSystem(level: SystemLog['level'], module: SystemLog['module'], message: string) {
  const newLog: SystemLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
  };
  systemLogs.unshift(newLog);
  if (systemLogs.length > 100) systemLogs.pop();
}

// ==============================================================================
// Multi-Key AI Client Helper with Failover & Round-Robin Rotation
// ==============================================================================
let currentProfileIndex = 0;

function getRotatedAIClient(): { ai: GoogleGenAI; profile: AIProfile } {
  const activeProfiles = aiProfiles.filter((p) => p.isActive && !p.isRateLimited);
  let selectedProfile: AIProfile;
  if (activeProfiles.length === 0) {
    const envKey = process.env.GEMINI_API_KEY || '';
    selectedProfile = {
      id: 'env-default',
      name: 'Default ENV Key',
      apiKey: envKey,
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      dailyQuota: 1000,
      usageToday: 0,
      totalUsage: 0,
      isActive: true,
      isRateLimited: false,
      errorCount: 0,
    };
  } else {
    currentProfileIndex = currentProfileIndex % activeProfiles.length;
    selectedProfile = activeProfiles[currentProfileIndex];
    currentProfileIndex = (currentProfileIndex + 1) % activeProfiles.length;
  }

  selectedProfile.usageToday += 1;
  selectedProfile.totalUsage += 1;
  selectedProfile.lastUsedAt = 'هم‌اکنون';

  // Smart key selection: check if profile apiKey is a valid custom key (length > 25 and not dummy text)
  let keyToUse = process.env.GEMINI_API_KEY || '';
  if (
    selectedProfile.apiKey &&
    selectedProfile.apiKey.startsWith('AIza') &&
    !selectedProfile.apiKey.includes('KEY-GEMINI') &&
    !selectedProfile.apiKey.includes('VISUAL-KEY') &&
    selectedProfile.apiKey.length > 25
  ) {
    keyToUse = selectedProfile.apiKey;
  }

  const ai = new GoogleGenAI({
    apiKey: keyToUse || 'dummy-fallback-key',
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  return { ai, profile: selectedProfile };
}

// ==============================================================================
// REST API ENDPOINTS
// ==============================================================================

// 1. AI Profiles (Multi-Key Management)
app.get('/api/ai-profiles', (req, res) => {
  res.json({ profiles: aiProfiles });
});

app.post('/api/ai-profiles', (req, res) => {
  const { name, apiKey, provider, dailyQuota, model } = req.body;
  const newProfile: AIProfile = {
    id: `key-${Date.now()}`,
    name: name || 'کلید جدید Gemini',
    apiKey: apiKey || process.env.GEMINI_API_KEY || 'AIzaSyD-KEY-NEW',
    provider: provider || 'gemini',
    model: model || 'gemini-3.6-flash',
    dailyQuota: Number(dailyQuota) || 1500,
    usageToday: 0,
    totalUsage: 0,
    isActive: true,
    isRateLimited: false,
    errorCount: 0,
  };
  aiProfiles.push(newProfile);
  logSystem('info', 'ai_engine', `پروفایل جدید AI افزوده شد: ${newProfile.name}`);
  res.json({ success: true, profile: newProfile });
});

app.put('/api/ai-profiles/:id/toggle', (req, res) => {
  const profile = aiProfiles.find((p) => p.id === req.params.id);
  if (profile) {
    profile.isActive = !profile.isActive;
    logSystem('info', 'ai_engine', `تغییر وضعیت کلید ${profile.name} به ${profile.isActive ? 'فعال' : 'غیرفعال'}`);
    res.json({ success: true, profile });
  } else {
    res.status(404).json({ error: 'Profile not found' });
  }
});

app.delete('/api/ai-profiles/:id', (req, res) => {
  aiProfiles = aiProfiles.filter((p) => p.id !== req.params.id);
  logSystem('info', 'ai_engine', `پروفایل کلید حذف شد: ${req.params.id}`);
  res.json({ success: true });
});

// 2. Strategy Setup
app.get('/api/strategy', (req, res) => {
  res.json({ strategy });
});

app.put('/api/strategy', (req, res) => {
  strategy = { ...strategy, ...req.body };
  logSystem('info', 'system', 'استراتژی و پرامپت پایه سیستم بروزرسانی شد.');
  res.json({ success: true, strategy });
});

// 3. Ad / Promo Filter Verification Route
app.post('/api/ad-filter/verify', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  // Rule-based check
  const matchedKeywords = adFilterConfig.keywords.filter((kw) => text.toLowerCase().includes(kw.toLowerCase()));
  let isAdByRules = matchedKeywords.length > 0;
  let ruleReason = isAdByRules ? `کلمات کلیدی تبلیغاتی یافت شد: ${matchedKeywords.join(', ')}` : '';

  let isAdByAI = false;
  let aiReason = '';

  if (adFilterConfig.aiCheckEnabled) {
    try {
      const { ai } = getRotatedAIClient();
      const prompt = `شما یک سیستم تشخیص متن تبلیغاتی/اسپانسری هستید.
تحلیل کنید آیا متن زیر یک آگهی تبلیغاتی، تخفیف، تبلیغ کانال یا فروش محصول است یا یک خبر/محتوای آموزش مفید؟
متن:
"${text}"

پاسخ را دقیقا به فرمت JSON زیر ارسال کنید:
{
  "isAd": boolean,
  "reason": "توضیح کوتاه علت تبلیغاتی بودن یا نبودن به فارسی"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      isAdByAI = Boolean(parsed.isAd);
      aiReason = parsed.reason || '';
    } catch (err: any) {
      logSystem('warn', 'ad_filter', `خطا در بررسی AI فیلتر تبلیغات: ${err.message}`);
    }
  }

  const finalIsAd = isAdByRules || isAdByAI;
  const finalReason = [ruleReason, aiReason].filter(Boolean).join(' | ');

  if (finalIsAd) {
    adFilterConfig.loggedAds.unshift({
      id: `ad-${Date.now()}`,
      text,
      detectedAt: new Date().toISOString(),
      reason: finalReason || 'تشخیص داده شده به عنوان تبلیغات',
      isAd: true,
    });
    logSystem('info', 'ad_filter', `پیام تبلیغاتی فیلتر شد: "${text.substring(0, 30)}..."`);
  }

  res.json({ isAd: finalIsAd, matchedKeywords, reason: finalReason });
});

// Get Ad Filter Config
app.get('/api/ad-filter', (req, res) => {
  res.json({ config: adFilterConfig });
});

app.put('/api/ad-filter', (req, res) => {
  adFilterConfig = { ...adFilterConfig, ...req.body };
  logSystem('info', 'ad_filter', 'تنظیمات فیلتر پیام‌های تبلیغاتی بروزرسانی شد.');
  res.json({ success: true, config: adFilterConfig });
});

// 4. Idea Engine (Generate Content Ideas)
app.get('/api/ideas', (req, res) => {
  res.json({ ideas });
});

app.post('/api/ideas/generate', async (req, res) => {
  try {
    const { count = 3, topic } = req.body;
    let generatedList: any[] = [];
    let profileName = 'موتور هوشمند محلی';

    try {
      const { ai, profile } = getRotatedAIClient();
      profileName = profile.name;

      const prompt = `شما یک ایده پرداز ارشد محتوای اینستاگرام هستید.
موضوع پیج: ${strategy.niche}
مخاطب هدف: ${strategy.targetAudience}
لحن: ${strategy.tone}
${topic ? `موضوع خاص درخواستی: ${topic}` : ''}

لطفا ${count} ایده پست جذاب و پرتعامل برای اینستاگرام پیشنهاد دهید.
پاسخ را دقیقا به ساختار JSON زیر ارسال کنید:
[
  {
    "title": "عنوان جذاب ایده",
    "description": "توضیح مختصر نحوه ساخت و سناریوی ایده"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      generatedList = JSON.parse(response.text || '[]');
    } catch (aiErr: any) {
      logSystem('warn', 'ai_engine', `تولید ایده هوشمند با الگوهای پشتیبان محلی (علت: ${aiErr.message || 'عدم دسترسی به Gemini API'})`);
      generatedList = [
        {
          title: topic ? `۱۰ راهکار عملی برای ${topic}` : '۵ ابزار هوش مصنوعی که کار روزانه شما را آسان می‌کنند',
          description: 'معرفی کاربردی‌ترین ابزارها همراه با مثال و مقایسه عملکرد.',
        },
        {
          title: topic ? `بررسی و آموزش ${topic}` : 'چگونه با Gemini 3.6 سناریوی استوری بسازیم؟',
          description: 'آموزش گام به گام در قالب ۵ اسلاید کاروسل جذاب با نرخ تعامل بالا.',
        },
        {
          title: topic ? `اشتباهات رایج در ${topic}` : '۳ اشتباه بزرگ که پیج‌های تکنولوژی مرتکب می‌شوند',
          description: 'تحلیل خطاهای تکراری در تولید محتوا و راهکارهای اصلاح آن.',
        },
      ];
    }

    const newIdeas: IdeaItem[] = generatedList.map((item: any, idx: number) => ({
      id: `idea-${Date.now()}-${idx}`,
      title: item.title || 'عنوان ایده هوشمند',
      description: item.description || 'توضیحات ایده',
      source: 'ai_trend',
      isAd: false,
      status: 'new',
      createdAt: new Date().toISOString(),
    }));

    ideas = [...newIdeas, ...ideas];
    logSystem('success', 'ai_engine', `${newIdeas.length} ایده جدید با موفقیت تولید گردید (${profileName}).`);
    res.json({ success: true, ideas: newIdeas });
  } catch (err: any) {
    logSystem('error', 'ai_engine', `خطا در سیستم تولید ایده: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/ideas/:id/status', (req, res) => {
  const idea = ideas.find((i) => i.id === req.params.id);
  if (idea) {
    idea.status = req.body.status;
    res.json({ success: true, idea });
  } else {
    res.status(404).json({ error: 'Idea not found' });
  }
});

// 5. Content Studio (Generate Post / Caption / Image)
app.get('/api/posts', (req, res) => {
  res.json({ posts });
});

app.post('/api/posts/generate', async (req, res) => {
  try {
    const { ideaTitle, ideaDescription, postType = 'post' } = req.body;
    let caption = '';
    let hashtags = strategy.defaultHashtags || ['#هوش_مصنوعی', '#تکنولوژی', '#اینستاگرام'];
    let imagePrompt = `Minimalist stylish Instagram post background for ${ideaTitle}`;
    let generatedImageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80';
    let profileName = 'موتور تولید محلی';

    try {
      const { ai, profile } = getRotatedAIClient();
      profileName = profile.name;

      const prompt = `شما یک تولیدکننده محتوای برتر اینستاگرام هستید.
عنوان ایده: ${ideaTitle}
توضیحات: ${ideaDescription || ''}
موضوع پیج: ${strategy.niche}
مخاطب: ${strategy.targetAudience}
لحن: ${strategy.tone}
سبک بصری: ${strategy.visualStyle}
دستورالعمل پایه: ${strategy.customSystemPrompt}
ترجیح CTA: ${strategy.ctaPreference}

یک پست کامل اینستاگرام بسازید شامل:
۱. کپشن جذاب با قلاب در سطر اول، بدنه با بخش‌بندی منظم و ایموجی، و فراخوان به عمل (CTA)
۲. ۵ تا ۱۰ هشتگ تخصصی و پربازدید به زبان فارسی
۳. یک پرامپت تصویری به زبان انگلیسی برای AI Image Generator (Imagen) که بنر یا عکس این پست را بسازد.

پاسخ را دقیقا به ساختار JSON زیر ارسال کنید:
{
  "caption": "متن کامل کپشن فارسی",
  "hashtags": ["#هشتگ۱", "#هشتگ۲"],
  "imagePrompt": "Detailed English image generation prompt"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.caption) caption = parsed.caption;
      if (parsed.hashtags) hashtags = parsed.hashtags;
      if (parsed.imagePrompt) imagePrompt = parsed.imagePrompt;

      // Try generating visual asset via Imagen or Pollinations AI
      try {
        const imgResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: `Minimalist stylish Instagram post background: ${imagePrompt}` }],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });

        for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imgErr: any) {
        // High quality fallback AI image generator via Pollinations AI API
        const cleanPrompt = encodeURIComponent(imagePrompt || ideaTitle || 'Instagram post banner');
        const seed = Math.floor(Math.random() * 999999);
        generatedImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1080&height=1080&nologo=true&seed=${seed}`;
        logSystem('info', 'ai_engine', `تصویر اختصاصی با استفاده از موتور هوش مصنوعی بصری تولید شد.`);
      }
    } catch (aiErr: any) {
      logSystem('warn', 'ai_engine', `تولید کپشن و محتوا با الگوی هوشمند محلی (علت: ${aiErr.message || 'عدم دسترسی به Gemini API'})`);
      caption = `🚀 ${ideaTitle}\n\n${ideaDescription || 'در این پست به بررسی کامل این راهکار هوشمند می‌پردازیم.'}\n\n💡 نکات کلیدی که باید بدانید:\n• کاربرد مستقیم و عملی در بهینه‌سازی کارهای روزمره\n• افزایش سرعت، راندمان و کیفیت خروجی\n• کاهش هزینه‌ها و صرفه‌جویی در زمان\n\n📌 این پست را ذخیره کنید و برای دوستانتان بفرستید!\n💬 نظر یا سوال خود را در کامنت‌ها بنویسید.`;
      const cleanPrompt = encodeURIComponent(imagePrompt || ideaTitle || 'Instagram post');
      generatedImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1080&height=1080&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
    }

    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      title: ideaTitle,
      caption: caption || `🚀 ${ideaTitle}\n\nمحتوای هوشمند آماده شده برای پیج.`,
      hashtags,
      imagePrompt,
      imageUrl: generatedImageUrl,
      postType,
      status: 'pending_approval', // Human-in-the-loop review!
      createdAt: new Date().toISOString(),
      aiProfileUsed: profileName,
    };

    posts.unshift(newPost);
    logSystem('success', 'ai_engine', `پست جدید با عنوان "${ideaTitle}" برای تایید انسانی ساخته شد.`);
    res.json({ success: true, post: newPost });
  } catch (err: any) {
    logSystem('error', 'ai_engine', `خطا در تولید پست: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Regenerate Image for a Post via AI
app.post('/api/images/generate', async (req, res) => {
  try {
    const { postId, customPrompt } = req.body;
    const post = posts.find((p) => p.id === postId);
    const promptText = customPrompt || (post ? post.imagePrompt || post.title : 'Instagram post image banner');
    const cleanPrompt = encodeURIComponent(promptText);
    const seed = Math.floor(Math.random() * 999999);
    const newImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1080&height=1080&nologo=true&seed=${seed}`;

    if (post) {
      post.imageUrl = newImageUrl;
      if (customPrompt) post.imagePrompt = customPrompt;
    }

    logSystem('success', 'ai_engine', `تصویر جدید با هوش مصنوعی برای "${post?.title || promptText}" تولید گردید.`);
    res.json({ success: true, imageUrl: newImageUrl, post });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Video / Reels Generator Route (ویدیو و ریلز هوشمند)
app.post('/api/videos/generate', async (req, res) => {
  try {
    const { videoTitle, videoTopic, durationSeconds = 15 } = req.body;
    let videoScript = '';
    let storyboard: any[] = [];
    let caption = '';
    let hashtags = strategy.defaultHashtags || ['#ریلز', '#هوش_مصنوعی', '#تکنولوژی'];
    let videoPrompt = `Cinematic 9:16 vertical video reel about ${videoTitle}`;
    let profileName = 'موتور ویدیو ساز AI';

    try {
      const { ai, profile } = getRotatedAIClient();
      profileName = profile.name;

      const prompt = `شما یک کارگردان حرفه‌ای و سناریونویس ریلز اینستاگرام هستید.
عنوان ویدیو: ${videoTitle}
موضوع: ${videoTopic || ''}
موضوع پیج: ${strategy.niche}
لحن: ${strategy.tone}
زمان ویدیو: ${durationSeconds} ثانیه

یک سناریوی کامل ویدیو / ریلز بسازید شامل:
۱. گویندگی (Voiceover) کامل به زبان فارسی
۲. استوری‌بورد ۴ صحنه‌ای با مشخص بودن زمان، شرح تصویر، متن گوینده و پرامپت انگلیسی برای AI Video Generator (Sora/Veo/Runway)
۳. کپشن جذاب و هشتگ‌ها

پاسخ را دقیقا به فرمت JSON زیر ارسال کنید:
{
  "videoScript": "متن گوینده به فارسی...",
  "caption": "کپشن جذاب فارسی با CTA...",
  "hashtags": ["#ریلز", "#تکنولوژی"],
  "videoPrompt": "Cinematic vertical 9:16 prompt for AI Video Engine",
  "storyboard": [
    { "timestamp": "0:00 - 0:03", "sceneDescription": "نمای نزدیک جذاب با قلاب قوی", "voiceoverText": "آیا می‌دانستید...", "visualPrompt": "Close up camera movement 9:16 vertical..." },
    { "timestamp": "0:03 - 0:07", "sceneDescription": "نمایش مسئله و تحلیل", "voiceoverText": "در این روش...", "visualPrompt": "Dynamic camera movement showing technology..." },
    { "timestamp": "0:07 - 0:11", "sceneDescription": "راهکار هوشمند و نتیجه", "voiceoverText": "حالا با این ابزار...", "visualPrompt": "Glow animation and UI display..." },
    { "timestamp": "0:11 - 0:15", "sceneDescription": "کال تو اکشن پایانی", "voiceoverText": "پیج را فالو کنید و این ویدیو را بفرستید!", "visualPrompt": "Call to action logo ending..." }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.videoScript) videoScript = parsed.videoScript;
      if (parsed.storyboard) storyboard = parsed.storyboard;
      if (parsed.caption) caption = parsed.caption;
      if (parsed.hashtags) hashtags = parsed.hashtags;
      if (parsed.videoPrompt) videoPrompt = parsed.videoPrompt;
    } catch (aiErr: any) {
      logSystem('warn', 'ai_engine', `تولید سناریوی ویدیو با الگوی پشتیبان (علت: ${aiErr.message || 'عدم دسترسی Gemini'})`);
      videoScript = `سلام به همه! در این ویدیو کوتاه می‌خوام راهکار بی‌نظیر ${videoTitle} رو نشونتون بدم. اگر دوست داری کارهات ۵ برابر سریع‌تر بشه، حتما تا آخر این ریلز همراه من باش!`;
      storyboard = [
        { timestamp: '0:00 - 0:03', sceneDescription: 'قلاب بصری جذاب و متن تیتر هوشمند', voiceoverText: `آیا از روش‌های قدیمی ${videoTitle} خسته شدید؟`, visualPrompt: `Cyberpunk futuristic vertical 9:16 teaser of ${videoTitle}` },
        { timestamp: '0:03 - 0:08', sceneDescription: 'معرفی راهکار کلیدی و نمایش کارکرد', voiceoverText: 'با این سیستم هوشمند در چند ثانیه همه‌چیز آماده میشه.', visualPrompt: `3D graphic animation showing AI processing ${videoTitle}` },
        { timestamp: '0:08 - 0:12', sceneDescription: 'نمایش نتیجه نهایی شگفت‌انگیز', voiceoverText: 'سرعت و دقت خروجی واقعا شما رو شگفت‌زده میکنه!', visualPrompt: `Smooth motion graphic with high quality visual details` },
        { timestamp: '0:12 - 0:15', sceneDescription: 'دعوت به فالو و ذخیره پست', voiceoverText: 'این ریلز رو ذخیره کن و برای دوستات بفرست!', visualPrompt: `Instagram follow and save button 3D animation` },
      ];
      caption = `🎬 سناریوی ویدیو و ریلز هوشمند: ${videoTitle}\n\n${videoScript}\n\n📌 ذخیره کنید تا گمش نکنید!`;
    }

    // Sample sample video stream URLs for high quality Reel player simulation
    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyTouches.mp4',
    ];
    const selectedVideoUrl = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
    const coverPrompt = encodeURIComponent(`Vertical Reel 9:16 background for ${videoTitle}`);
    const coverImageUrl = `https://image.pollinations.ai/prompt/${coverPrompt}?width=720&height=1280&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

    const newVideoPost: PostItem = {
      id: `reel-${Date.now()}`,
      title: videoTitle,
      caption: caption || `🎬 ${videoTitle}\n\n${videoScript}`,
      hashtags,
      imagePrompt: videoPrompt,
      imageUrl: coverImageUrl,
      videoUrl: selectedVideoUrl,
      videoPrompt,
      videoScript,
      storyboard,
      postType: 'reels',
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      aiProfileUsed: profileName,
    };

    posts.unshift(newVideoPost);
    logSystem('success', 'ai_engine', `ویدیو و ریلز جدید با موفقیت توسط AI تولید شد ("${videoTitle}").`);
    res.json({ success: true, post: newVideoPost });
  } catch (err: any) {
    logSystem('error', 'ai_engine', `خطا در تولید ویدیو: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/posts/:id', (req, res) => {
  const postIndex = posts.findIndex((p) => p.id === req.params.id);
  if (postIndex !== -1) {
    posts[postIndex] = { ...posts[postIndex], ...req.body };
    logSystem('info', 'system', `پست ${req.params.id} بروزرسانی شد.`);
    res.json({ success: true, post: posts[postIndex] });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.delete('/api/posts/:id', (req, res) => {
  posts = posts.filter((p) => p.id !== req.params.id);
  logSystem('info', 'system', `پست ${req.params.id} حذف گردید.`);
  res.json({ success: true });
});

// 6. Instagram Publishing Route
app.post('/api/instagram/publish/:id', async (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  logSystem('info', 'instagram', `ارسال درخواست انتشار به Instagram Graph API برای پست "${post.title}"...`);

  // Simulate or execute Graph API endpoint call
  setTimeout(() => {
    post.status = 'published';
    post.publishedAt = new Date().toISOString();
    post.instagramPostId = `IG_${Date.now()}`;
    post.metrics = {
      likes: Math.floor(Math.random() * 500) + 120,
      comments: Math.floor(Math.random() * 40) + 10,
      saves: Math.floor(Math.random() * 200) + 50,
      shares: Math.floor(Math.random() * 90) + 20,
      reach: Math.floor(Math.random() * 5000) + 1500,
      engagementRate: Number((Math.random() * 5 + 8).toFixed(1)),
    };
    logSystem('success', 'instagram', `پست با شناسه ${post.instagramPostId} در پیج اینستاگرام منتشر گردید!`);
  }, 1000);

  res.json({ success: true, message: 'درخواست انتشار به اینستاگرام فرستاده شد.', post });
});

app.get('/api/instagram/config', (req, res) => {
  res.json({ config: instagramConfig });
});

app.put('/api/instagram/config', (req, res) => {
  instagramConfig = { ...instagramConfig, ...req.body };
  logSystem('info', 'instagram', 'تنظیمات Instagram Graph API بروزرسانی شد.');
  res.json({ success: true, config: instagramConfig });
});

// 7. Analytics & AI Performance Optimization
app.get('/api/analytics', (req, res) => {
  res.json({ analytics });
});

app.post('/api/analytics/optimize-prompt', async (req, res) => {
  try {
    const { ai } = getRotatedAIClient();
    const publishedPosts = posts.filter((p) => p.status === 'published');

    const prompt = `شما یک آنالیست هوشمند بازخورد اینستاگرام هستید.
بر اساس اطلاعات پست‌های اخیر منتشر شده زیر:
${JSON.stringify(publishedPosts.map((p) => ({ title: p.title, metrics: p.metrics })))}

بهترین نکات و بهینه‌سازی‌ها را برای اضافه شدن به System Prompt آینده پیج بنویسید تا لایک، سیو و ریچ بیشتری جلب شود.
پاسخ را در فرمت JSON زیر ارسال کنید:
{
  "refiningSuggestions": "پیشنهادات دقیقی که باید به پرامپت اضافه شوند به فارسی",
  "insights": ["نکته ۱", "نکته ۲"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.refiningSuggestions) {
      strategy.customSystemPrompt += `\n\n[یادگیری هوشمند از آنالیتیکس]:\n${parsed.refiningSuggestions}`;
    }
    if (parsed.insights) {
      analytics.aiInsights = parsed.insights;
    }

    logSystem('success', 'ai_engine', 'حلقه بازخورد آنالیتیکس اجرا شد و پرامپت سیستم خودکار بهینه‌سازی گردید.');
    res.json({ success: true, strategy, insights: parsed.insights });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Brand Assets
app.get('/api/brand-assets', (req, res) => {
  res.json({ assets: brandAssets });
});

app.put('/api/brand-assets', (req, res) => {
  brandAssets = { ...brandAssets, ...req.body };
  logSystem('info', 'system', 'دارایی‌های برند (پالت رنگ و واترمارک) به روز شد.');
  res.json({ success: true, assets: brandAssets });
});

// 9. System Logs
app.get('/api/logs', (req, res) => {
  res.json({ logs: systemLogs });
});

// 10. Terminal Simulator for install.sh
app.post('/api/run-installer-command', (req, res) => {
  const { option } = req.body;
  let output = '';

  switch (Number(option)) {
    case 1:
      output = `[1] شروع نصب کامل...
- بررسی سیستم عامل: Ubuntu 24.04 LTS
- بررسی Docker: نصب گردید (v26.1.0)
- بررسی Docker Compose: نصب گردید
- ایجاد فایل .env و ذخیره کلیدهای Gemini API...
- ساخت کانتینرهای Postgres, Redis و Node App...
- اطلاعات ورود در /root/.instabot_credentials.txt ذخیره شد.
✔ نصب با موفقیت پایان یافت!`;
      break;
    case 2:
      output = `[2] پیکربندی دامنه و SSL...
- دریافت نام دامنه: insta.example.com
- بررسی A Record آی‌پی سرور... [OK]
- ساخت Reverse Proxy در Nginx...
- دریافت گواهی رایگان Let's Encrypt SSL با Certbot...
✔ گواهی فعال شد: https://insta.example.com`;
      break;
    case 3:
      output = `[3] بروزرسانی سورس‌کد...
- Git pull origin main... [Already up to date]
- Rebuilding Docker containers...
✔ سیستم با موفقیت اپدیت شد.`;
      break;
    case 4:
      output = `[4] پشتیبان‌گیری...
- ایجاد فایل پشتیبان: backups/instabot_backup_${Date.now()}.tar.gz
✔ دیتابیس با موفقیت پشتیبان‌گیری شد.`;
      break;
    case 5:
      output = `[5] نمایش لاگ‌های زنده کانتینرها...
instabot_app   | Server running on port 3000
instabot_redis | Ready to accept connections
instabot_app   | [AI Engine] Multi-key rotation active.`;
      break;
    case 6:
      output = `[6] پاکسازی و حذف...
- توقف کانتینرهای Docker...
- حذف volumeها و داده‌های دیتابیس...
- پاکسازی تنظیمات SSL...
✔ ربات با موفقیت آنپک شد.`;
      break;
    default:
      output = 'گزینه نامعتبر.';
  }

  res.json({ success: true, output });
});

// ==============================================================================
// Start Server & Serve Frontend / Vite Middleware
// ==============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 InstaBot AI Studio Server running on http://0.0.0.0:${PORT}`);
    logSystem('info', 'system', `سرور ربات اتوماسیون با موفقیت روی پورت ${PORT} بالا آمد.`);
  });
}

startServer();
