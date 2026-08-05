import { AIProfile, PageStrategy, PostItem, IdeaItem, AdFilterConfig, BrandAssetConfig, InstagramApiConfig, SystemLog, AnalyticsSummary } from '../types';

export const initialAIProfiles: AIProfile[] = [
  {
    id: 'key-1',
    name: 'Gemini Primary (Studio Key)',
    apiKey: 'AIzaSyD-PRIMARY-KEY-GEMINI-8921',
    provider: 'gemini',
    model: 'gemini-3.6-flash',
    dailyQuota: 2000,
    usageToday: 340,
    totalUsage: 4820,
    isActive: true,
    isRateLimited: false,
    lastUsedAt: '10 min ago',
    errorCount: 0,
  },
  {
    id: 'key-2',
    name: 'Gemini Backup (Secondary Account)',
    apiKey: 'AIzaSyD-BACKUP-KEY-GEMINI-4102',
    provider: 'gemini',
    model: 'gemini-3.6-flash',
    dailyQuota: 1500,
    usageToday: 0,
    totalUsage: 1200,
    isActive: true,
    isRateLimited: false,
    lastUsedAt: 'Yesterday',
    errorCount: 0,
  },
  {
    id: 'key-3',
    name: 'Imagen Generator (Visual Asset Key)',
    apiKey: 'AIzaSyD-IMAGEN-VISUAL-KEY-7712',
    provider: 'imagen',
    model: 'gemini-3.1-flash-lite-image',
    dailyQuota: 500,
    usageToday: 85,
    totalUsage: 930,
    isActive: true,
    isRateLimited: false,
    lastUsedAt: '25 min ago',
    errorCount: 0,
  },
];

export const initialStrategy: PageStrategy = {
  niche: 'تکنولوژی، هوش مصنوعی و دیجیتال مارکتینگ',
  targetAudience: 'علاقه‌مندان به هوش مصنوعی، برنامه‌نویسان، صاحبان کسب‌وکارهای آنلاین و دانشجویان (۱۸ تا ۳۵ سال)',
  tone: 'friendly',
  visualStyle: 'مینیمال و مدرن، استفاده از رنگ‌های سورمه‌ای و بنفش با فونت یکنواخت و تصاویر باکیفیت هوش مصنوعی',
  customSystemPrompt: `شما یک استراتژیست ارشد محتوا و بلاگر باسابقه اینستاگرام هستید.
وظیفه شما تولید پست‌های پرتعامل (High Engagement)، جذاب و کاربردی به زبان فارسی است.
قوانین:
۱. قلاب (Hook) جذاب در اولین سطر برای جلب توجه کاربر.
۲. متن بدنه به‌صورت کوتاه، بخش‌بندی‌شده با ایموجی‌های مرتبط.
۳. فراخوان به عمل (CTA) صریح مثل: "این پست رو برای دوستت بفرست" یا "نظرته تو کامنت برام بنویس".
۴. هشتگ‌های کاملاً مرتبط با موضوع پلتفرم بدون اسپم.`,
  samplePosts: [
    '🤖 ۵ ابزار رایگان هوش مصنوعی که هفته‌ای ۱۰ ساعت زمانت رو ذخیره می‌کنه! (ورق بزن)',
    '💡 چطور با Gemini یک استراتژی محتوای ۳۰ روزه بنویسیم؟ راهنمای قدم‌به‌قدم + پرامپت آماده',
  ],
  defaultHashtags: ['#هوش_مصنوعی', '#تکنولوژی', '#دیجیتال_مارکتینگ', '#تولید_محتوا', '#ربات_اینستاگرام'],
  ctaPreference: 'حتما پست رو سیو کن و برای دوستای علاقه‌مندت بفرست!',
};

export const initialIdeas: IdeaItem[] = [
  {
    id: 'idea-1',
    title: 'مقایسه سرعت مدل‌های جدید Gemini 3.6 Flash با رقبای بازار',
    description: 'توضیح تصویری به‌همراه بنر گرافیکی از کارایی و کاهش هزینه‌های پردازش AI برای کسب‌وکارها',
    source: 'ai_trend',
    isAd: false,
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'idea-2',
    title: '۵ تکنیک طلایی برای افزایش الگوریتمی ریچ (Reach) در ریلزهای جدید',
    description: 'تحلیل داده‌های اخیر اینستاگرام و زمان‌بندی انتشار ویدیو بر اساس تایم فعالیت فالوورها',
    source: 'manual',
    isAd: false,
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'idea-3',
    title: 'تخفیف ۵۰ درصدی پکیج VIP آموزش هوش مصنوعی (فقط تا امشب)',
    description: 'پیام دریافت شده از کانال تلگرام: تبلیغاتی تشخیص داده شده است.',
    source: 'telegram',
    channelName: '@TechNews_IR',
    rawText: 'پکیج ویژه آموزش هوش مصنوعی با تخفیف ۵۰٪! ثبت‌نام سریع از طریق آیدی یا لینک بیو.',
    isAd: true,
    adReason: 'شامل کلمات کلیدی تبلیغاتی (تخفیف، ثبت‌نام، لینک بیو)',
    status: 'rejected',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'idea-4',
    title: 'معرفی ویژگی‌های نسخه جدید Python 3.13 برای برنامه‌نویسان AI',
    description: 'الهام گرفته از خبر جدید کانال‌های برنامه‌نویسی تلگرام بدون کپی مستقیم',
    source: 'telegram',
    channelName: '@PythonIran',
    rawText: 'نسخه جدید پایتون با قابلیت JIT compiler منتشر شد و سرعت اجرای برنامه‌ها را تا ۲۰٪ افزایش می‌دهد.',
    isAd: false,
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const initialPosts: PostItem[] = [
  {
    id: 'post-1',
    title: '۵ ابزار هوش مصنوعی کاربردی در سال ۲۰۲۶',
    caption: `🚀 ۵ ابزار فوق‌العاده هوش مصنوعی که کارتو ۱۰ برابر سریع‌تر می‌کنه!

اگه می‌خوای تو کار و کسب‌و‌کارت از بقیه جلوتر باشی، این ۵ ابزار رو حتما ذخیره کن:

1️⃣ Gemini Flash - برای خلاصه کردن فایل‌ها و تحلیل سریع
2️⃣ Midjourney v6 - برای طراحی بنرهای حرفه‌ای
3️⃣ ElevenLabs - برای تولید صدای طبیعی فارسی
4️⃣ Notion AI - برای مدیریت پروژه‌ها و یادداشت‌ها
5️⃣ Canva Magic - برای ادیت و تولید محتوای هوشمند

📌 کدوم ابزار رو تا حالا استفاده کردی؟ تو کامنت‌ها برام بنویس!`,
    hashtags: ['#هوش_مصنوعی', '#تکنولوژی_روز', '#تولیدمحتوا', '#ابزار_هوش_مصنوعی', '#اینستاگرام'],
    imagePrompt: 'A glowing futuristic smartphone surrounded by holographic AI tools icons, dark violet background, sleek minimal 3d renders',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    postType: 'post',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    instagramPostId: 'IG_17928391023847',
    metrics: {
      likes: 1240,
      comments: 184,
      saves: 890,
      shares: 310,
      reach: 18400,
      engagementRate: 14.2,
    },
    feedbackApplied: true,
    aiProfileUsed: 'Gemini Primary (Studio Key)',
  },
  {
    id: 'post-2',
    title: 'چگونه ربات اتوماسیون پیج اینستاگرام بسازیم؟',
    caption: `🤖 خودکارسازی پیج اینستاگرام بدون هیچ اسپم یا ریسک بن شدن!

تولید محتوای منظم راز اصلی رشد ارگانیک اینستاگرامه. تو این پست بررسی کردیم چطور با استفاده از APIهای رسمی و AI، خط تولید محتوای پیجت رو منظم کنی.

💡 نکات کلیدی:
• استفاده فقط از Graph API رسمی
• تایید انسانی قبل از انتشار برای کیفیت عالی
• زمان‌بندی بر اساس ساعت فعالیت مخاطب‌ها

نظرت چیه؟ دوست داری ربات برای پیجت محتوا بسازه؟`,
    hashtags: ['#اتوماسیون', '#ربات_اینستاگرام', '#کسب_و_کار_آنلاین', '#اینستاگرام_مارکتینگ'],
    imagePrompt: 'Sleek dark automation dashboard with artificial intelligence core glowing with purple cyan light, isometric design',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    postType: 'post',
    status: 'scheduled',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(),
    aiProfileUsed: 'Gemini Primary (Studio Key)',
  },
  {
    id: 'post-3',
    title: 'چک‌لیست امنیت و جلوگیری از محدودیت پیج',
    caption: `⚠️ این ۳ اشتباه پیجت رو به خطر می‌ندازه!

خیلی‌ها فکر می‌کنند استفاده از نرم‌افزارهای غیرمجاز فالووربگیر کار درستیه، اما در واقع اینستاگرام پیج رو Shadowban می‌کنه!

✅ راه‌حل درست:
۱. تولید محتوای اصیل و ارزشمند
۲. پاسخ منظم به کامنت‌ها
۳. استفاده از ابزارهای اتوماسیون مجاز با API رسمی

پست رو سیو کن که بعدا حتما چکش کنی!`,
    hashtags: ['#امنیت_اینستاگرام', '#رشد_ارگانیک', '#الگوریتم_اینستاگرام'],
    imagePrompt: 'Cyber security shield glowing with futuristic light and checkmarks, modern tech background',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
    postType: 'post',
    status: 'pending_approval',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    aiProfileUsed: 'Gemini Primary (Studio Key)',
  },
];

export const initialAdFilterConfig: AdFilterConfig = {
  enabled: true,
  aiCheckEnabled: true,
  aiSensitivity: 'medium',
  keywords: [
    'تخفیف',
    'کد تخفیف',
    'سفارش دهید',
    'لینک در بیو',
    'اسپانسری',
    'تلفن تماس',
    'آیدی سفارش',
    'قیمت دایرکت',
    'خرید آنلاین',
    'پیشنهاد ویژه',
    'VIP',
  ],
  loggedAds: [
    {
      id: 'ad-log-1',
      text: 'پیشنهاد شگفت‌انگیز! ۵۰ درصد تخفیف دوره برنامه‌نویسی پایتون فقط برای ۱۰ نفر اول. جهت ثبت نام پیام دهید.',
      channel: '@TechNews_IR',
      detectedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      reason: 'کلمات کلیدی: تخفیف، ثبت نام + AI Classification score: 98% Ad',
      isAd: true,
    },
    {
      id: 'ad-log-2',
      text: 'برای سفارش تبلیغ در این کانال با آیدی @AdsAdmin تماس بگیرید.',
      channel: '@DailyCrypto_News',
      detectedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      reason: 'کلمات کلیدی: سفارش، تبلیغ، آیدی',
      isAd: true,
    },
  ],
};

export const initialBrandAsset: BrandAssetConfig = {
  logoUrl: '',
  primaryColor: '#4f46e5',
  secondaryColor: '#06b6d4',
  accentColor: '#ec4899',
  fontName: 'Vazirmatn / Plus Jakarta Sans',
  watermarkPosition: 'bottom_right',
  watermarkOpacity: 80,
  templateStyle: 'bold_headline',
};

export const initialInstagramConfig: InstagramApiConfig = {
  appId: '1098237492103847',
  appSecret: '••••••••••••••••••••••••••••••••',
  accessToken: 'EAAO8237492103847...VALID_SHORT_TOKEN',
  businessAccountId: '17841400923847123',
  pageName: 'InstaBot AI Official Studio',
  isSandboxMode: true, // Allows seamless interactive testing without Graph API authorization errors
  autoPublishEnabled: false,
  bestPostingHours: ['12:30', '18:00', '21:30'],
};

export const initialSystemLogs: SystemLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
    level: 'success',
    module: 'ai_engine',
    message: 'چرخش هوشمند کلید Gemini Primary انجام شد. درخواست با کد ۲۰۰ تکمیل گردید.',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 60000 * 25).toISOString(),
    level: 'info',
    module: 'ad_filter',
    message: 'پیام تلگرام پردازش شد: پیام تبلیغاتی تشخیص داده شد و فیلتر گردید.',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 60000 * 60).toISOString(),
    level: 'info',
    module: 'instagram',
    message: 'انتشار پست زمان‌بندی‌شده شماره IG_17928391023847 با موفقیت انجام شد.',
  },
];

export const initialAnalytics: AnalyticsSummary = {
  totalFollowers: 14280,
  followerGrowthWeek: 840,
  avgEngagementRate: 11.4,
  totalPostsPublished: 42,
  totalReachWeek: 68500,
  aiInsights: [
    'پست‌های ویدئویی و کاروسل با موضوع "ابزار هوش مصنوعی" ۴۵٪ ریچ بیشتری نسبت به تک عکس ایجاد کرده‌اند.',
    'بیشترین تعامل مخاطبان شما بین ساعت ۱۸:۰۰ تا ۲۱:۳۰ است. زمان‌بندی انتشار پیشنهاد می‌شود به این ساعات منتقل شود.',
    'هشتگ‌های #ابزار_هوش_مصنوعی و #اتوماسیون بالاترین لایک و سیو را جلب کرده‌اند.',
  ],
  topPerformingPosts: initialPosts,
};
