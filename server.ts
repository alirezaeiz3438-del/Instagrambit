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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  if (activeProfiles.length === 0) {
    // Fallback to environment variable key if present
    const envKey = process.env.GEMINI_API_KEY || 'MY_GEMINI_API_KEY';
    logSystem('warn', 'ai_engine', 'هیچ پروفایل فعال یافت نشد، استفاده از کلید محیطی پیش‌فرض.');
    const ai = new GoogleGenAI({
      apiKey: envKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    return {
      ai,
      profile: {
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
      },
    };
  }

  currentProfileIndex = currentProfileIndex % activeProfiles.length;
  const selectedProfile = activeProfiles[currentProfileIndex];
  currentProfileIndex = (currentProfileIndex + 1) % activeProfiles.length;

  selectedProfile.usageToday += 1;
  selectedProfile.totalUsage += 1;
  selectedProfile.lastUsedAt = 'هم‌اکنون';

  const keyToUse = selectedProfile.apiKey.startsWith('AIza') ? selectedProfile.apiKey : (process.env.GEMINI_API_KEY || selectedProfile.apiKey);

  const ai = new GoogleGenAI({
    apiKey: keyToUse,
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
    const { ai, profile } = getRotatedAIClient();

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

    const generatedList = JSON.parse(response.text || '[]');
    const newIdeas: IdeaItem[] = generatedList.map((item: any, idx: number) => ({
      id: `idea-${Date.now()}-${idx}`,
      title: item.title,
      description: item.description,
      source: 'ai_trend',
      isAd: false,
      status: 'new',
      createdAt: new Date().toISOString(),
    }));

    ideas = [...newIdeas, ...ideas];
    logSystem('success', 'ai_engine', `${newIdeas.length} ایده جدید با استفاده از ${profile.name} تولید شد.`);
    res.json({ success: true, ideas: newIdeas });
  } catch (err: any) {
    logSystem('error', 'ai_engine', `خطا در تولید ایده: ${err.message}`);
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
    const { ai, profile } = getRotatedAIClient();

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

    // Generate Visual Asset via Gemini Image Model
    let generatedImageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80';
    try {
      const imgResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: `Minimalist stylish Instagram post background: ${parsed.imagePrompt || ideaTitle}` }],
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
      logSystem('warn', 'ai_engine', `تولید تصویر اختصاصی Imagen با خطا مواجه شد، استفاده از پس‌زمینه گرافیکی آماده: ${imgErr.message}`);
    }

    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      title: ideaTitle,
      caption: parsed.caption || 'کپشن تولید شده',
      hashtags: parsed.hashtags || strategy.defaultHashtags,
      imagePrompt: parsed.imagePrompt || 'Minimal abstract banner',
      imageUrl: generatedImageUrl,
      postType,
      status: 'pending_approval', // Human-in-the-loop review!
      createdAt: new Date().toISOString(),
      aiProfileUsed: profile.name,
    };

    posts.unshift(newPost);
    logSystem('success', 'ai_engine', `پست جدید با عنوان "${ideaTitle}" برای تایید انسانی ساخته شد.`);
    res.json({ success: true, post: newPost });
  } catch (err: any) {
    logSystem('error', 'ai_engine', `خطا در تولید پست: ${err.message}`);
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
