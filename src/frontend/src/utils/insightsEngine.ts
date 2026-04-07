import type {
  ChannelData,
  DayPlan,
  GrowthWeek,
  Insights,
  VideoData,
} from "../types/youtube";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "her",
  "was",
  "one",
  "our",
  "out",
  "had",
  "him",
  "his",
  "how",
  "did",
  "its",
  "let",
  "may",
  "nor",
  "per",
  "via",
  "any",
  "who",
  "yet",
  "now",
  "use",
  "set",
  "way",
  "put",
  "far",
  "few",
  "ago",
  "new",
  "old",
  "big",
  "bit",
  "end",
  "top",
  "see",
  "got",
  "get",
  "that",
  "this",
  "with",
  "from",
  "they",
  "will",
  "have",
  "what",
  "when",
  "just",
  "been",
  "also",
  "into",
  "more",
  "than",
  "then",
  "your",
  "my",
  "is",
  "it",
  "in",
  "of",
  "to",
  "a",
  "i",
  "be",
  "as",
  "at",
  "so",
  "if",
  "an",
  "or",
  "up",
  "do",
  "on",
  "by",
  "we",
  "no",
  "us",
  "me",
  "he",
  "she",
]);

const NICHE_KEYWORDS: Record<string, string[]> = {
  Gaming: [
    "game",
    "gaming",
    "play",
    "minecraft",
    "fortnite",
    "fps",
    "rpg",
    "stream",
    "twitch",
    "esports",
    "gamer",
    "playthrough",
    "gameplay",
    "valorant",
    "roblox",
  ],
  "Tech & Reviews": [
    "tech",
    "review",
    "iphone",
    "android",
    "app",
    "software",
    "coding",
    "programming",
    "tutorial",
    "laptop",
    "phone",
    "gadget",
    "unboxing",
    "specification",
    "comparison",
  ],
  "Finance & Investing": [
    "money",
    "invest",
    "crypto",
    "bitcoin",
    "stocks",
    "income",
    "passive",
    "wealth",
    "finance",
    "budget",
    "trading",
    "portfolio",
    "dividend",
    "forex",
    "economy",
  ],
  "Fitness & Health": [
    "workout",
    "fitness",
    "gym",
    "diet",
    "weight",
    "exercise",
    "health",
    "muscle",
    "training",
    "cardio",
    "nutrition",
    "yoga",
    "running",
    "calories",
    "protein",
  ],
  "Cooking & Food": [
    "recipe",
    "cook",
    "food",
    "eating",
    "restaurant",
    "vegan",
    "chef",
    "meal",
    "bake",
    "kitchen",
    "ingredient",
    "delicious",
    "cuisine",
    "dinner",
    "dessert",
  ],
  "Lifestyle & Vlogging": [
    "vlog",
    "day",
    "life",
    "travel",
    "family",
    "home",
    "decor",
    "style",
    "fashion",
    "haul",
    "routine",
    "morning",
    "night",
    "apartment",
    "organize",
  ],
  Education: [
    "learn",
    "study",
    "course",
    "explain",
    "science",
    "history",
    "math",
    "school",
    "university",
    "knowledge",
    "lesson",
    "education",
    "understand",
    "guide",
    "tips",
  ],
  "Business & Marketing": [
    "business",
    "marketing",
    "seo",
    "entrepreneur",
    "startup",
    "sales",
    "brand",
    "online",
    "ecommerce",
    "freelance",
    "client",
    "strategy",
    "growth",
    "revenue",
    "profit",
  ],
};

// ─── Niche-specific title templates ──────────────────────────────────────────

const NICHE_TITLE_TEMPLATES: Record<
  string,
  ((topic: string, year: number) => string)[]
> = {
  Gaming: [
    (t, _y) => `I Played ${t} for 24 Hours Straight — Here's What Happened`,
    (t, y) =>
      `The ${t} Strategy That No One Is Using (Win Every Match in ${y})`,
    (t, _y) => `Top 10 ${t} Mistakes That Kill Your Rank Instantly`,
    (t, y) => `${t} Tier List ${y}: Every Option Ranked From Worst to Best`,
    (t, _y) => `How I Hit Top 1% in ${t} Without Spending a Single Dollar`,
  ],
  "Tech & Reviews": [
    (t, _y) => `I Tested Every ${t} Under $500 — Only Buy This One`,
    (t, y) => `${t} in ${y}: Is It Still Worth Buying? (Honest Review)`,
    (t, _y) =>
      `The ${t} Features Nobody Tells You About (Hidden Settings Unlocked)`,
    (t, _y) => `${t} vs The Competition: I Ran 30 Tests to Find the Truth`,
    (t, _y) => `Stop Wasting Money on ${t} — Here's What Actually Matters`,
  ],
  "Finance & Investing": [
    (t, _y) => `I Invested $1,000 in ${t} for 30 Days — Exact Results Revealed`,
    (t, y) => `The ${t} Strategy That Turned $500 Into $5,000 in ${y}`,
    (t, _y) => `7 ${t} Mistakes That Are Destroying Your Portfolio Right Now`,
    (t, y) => `How to Start ${t} With Zero Experience (${y} Beginner Guide)`,
    (t, _y) => `Why Most People Fail at ${t} — The Truth Nobody Wants to Hear`,
  ],
  "Fitness & Health": [
    (t, _y) => `I Did ${t} Every Day for 30 Days — My Body Transformation`,
    (t, _y) => `The ${t} Workout No One Talks About (Burns 2x More Fat)`,
    (t, _y) => `Stop Doing ${t} Wrong — The Correct Form That Actually Works`,
    (t, _y) => `${t} for Beginners: From Zero to Results in 6 Weeks`,
    (t, _y) => `7 ${t} Myths That Are Keeping You From Getting Results`,
  ],
  "Cooking & Food": [
    (t, _y) => `I Made ${t} Every Day for a Week — The Recipe That Won`,
    (t, _y) => `The Perfect ${t} Under 30 Minutes (Restaurant Quality at Home)`,
    (t, _y) =>
      `Why Your ${t} Never Tastes Right — The One Mistake You're Making`,
    (t, _y) => `${t} From Scratch vs Shortcut: Which One Actually Wins?`,
    (t, _y) =>
      `7 ${t} Variations You've Never Tried That Are Absolutely Incredible`,
  ],
  "Lifestyle & Vlogging": [
    (t, _y) => `A Week of ${t} Completely Changed My Life (I'm Shocked)`,
    (t, y) => `My Honest ${t} Routine That Actually Works in ${y}`,
    (t, _y) =>
      `I Tried the ${t} Trend Everyone Is Talking About — Real Results`,
    (t, _y) => `How ${t} Helped Me Go From Burnout to Thriving (My Story)`,
    (t, _y) => `Everything I Spent on ${t} in a Month (Budget Breakdown)`,
  ],
  Education: [
    (t, _y) => `${t} Explained in 10 Minutes — You'll Finally Understand It`,
    (t, _y) => `The ${t} Concept That Schools Never Teach You`,
    (t, _y) => `I Studied ${t} for 100 Hours — Here's Everything I Learned`,
    (t, _y) => `Why You've Been Taught ${t} Wrong Your Entire Life`,
    (t, _y) => `The Simplest Way to Master ${t} (No Textbook Required)`,
  ],
  "Business & Marketing": [
    (t, _y) => `How I Used ${t} to Go From $0 to $10K/Month (Real Numbers)`,
    (t, y) => `The ${t} Strategy That Grew My Business 300% in ${y}`,
    (t, _y) => `7 ${t} Mistakes That Are Killing Your Growth Right Now`,
    (t, _y) => `Why Your ${t} Isn't Converting — And the Simple Fix That Works`,
    (t, _y) => `The Exact ${t} Framework I Use to Land High-Paying Clients`,
  ],
};

// ─── 7-Day niche-specific plans ───────────────────────────────────────────────

const SEVEN_DAY_PLANS: Record<string, DayPlan[]> = {
  Gaming: [
    {
      day: "Day 1 — Monday",
      title: "Top 5 Tips to Rank Up Fast",
      topic: "Skill improvement & ranking tips",
      videoIdea:
        "Share 5 proven tips that helped you climb the ranks faster than average. Include clips of each tip in action with on-screen results.",
      thumbnailIdea:
        "Split screen: your rank badge (glowing) on left vs a frustrated player on right. Bold text: '5 TIPS TO RANK UP FAST'. Bright red/gold color scheme.",
      format: "Tutorial / Tips list (8-12 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "I Spent 24 Hours Playing Non-Stop — What Happened?",
      topic: "Challenge / marathon gaming video",
      videoIdea:
        "Document a 24-hour gaming challenge. Show your mental state, performance changes, funniest moments, and whether you improved or declined after hour 12.",
      thumbnailIdea:
        "You in front of a gaming setup, eyes red and wide, clock showing '24:00' in corner. Bright orange glow effect. Text: '24 HOURS STRAIGHT'.",
      format: "Challenge / Story vlog (10-15 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title: "Tier List: Every Character/Weapon Ranked for 2025",
      topic: "Tier list & meta breakdown",
      videoIdea:
        "Build a definitive tier list for the most popular game in your channel's niche. Explain why each pick is where it is with data and gameplay examples.",
      thumbnailIdea:
        "Colorful tier list (S through D rows) visible in background. Your face shocked/excited in foreground. Text: 'OFFICIAL TIER LIST 2025'. High contrast.",
      format: "Analysis / Tier list (10-20 min)",
    },
    {
      day: "Day 4 — Thursday",
      title: "Reacting to the Worst Gaming Takes on the Internet",
      topic: "Reaction / commentary video",
      videoIdea:
        "Find controversial or wrong gaming takes from social media/forums and react with your expertise. Mix humor with actual correction for high engagement.",
      thumbnailIdea:
        "You with shocked/laughing expression, social media posts visible behind you. Text: 'WORST TAKES EVER'. Red and yellow.",
      format: "Reaction / Commentary (12-18 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "How I Beat the Hardest Boss Without Taking Damage",
      topic: "Challenge run / skill showcase",
      videoIdea:
        "Attempt and complete a no-damage run or similar challenge. Build suspense, show failures, then the winning attempt. Great retention hook.",
      thumbnailIdea:
        "Boss monster on left, your character on right with a glowing shield or 'NO DAMAGE' badge. Dramatic lightning effect. Text: 'NO HIT RUN'.",
      format: "Challenge / Gameplay showcase (8-14 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "The Settings Pro Players Use That You Don't Know About",
      topic: "Pro settings / hidden tips",
      videoIdea:
        "Reveal lesser-known in-game settings, keybinds, or configurations that pros use but never share publicly. Include before/after gameplay comparison.",
      thumbnailIdea:
        "Settings menu screenshot in background with bright red arrows pointing to options. Your face in corner with 'mind blown' expression. Text: 'PRO SETTINGS REVEALED'.",
      format: "Tips / Tutorial (7-12 min)",
    },
    {
      day: "Day 7 — Sunday",
      title: "My Brutally Honest Gaming Channel Journey (1 Year Update)",
      topic: "Channel journey / community post",
      videoIdea:
        "Share your real stats, biggest wins, failures, and lessons from growing your channel. Be vulnerable and specific — audiences love authentic creator journeys.",
      thumbnailIdea:
        "Before/after growth chart behind you, your face looking confident. Text: '1 YEAR LATER — THE TRUTH'. Blue and white color scheme.",
      format: "Storytelling / Community (10-15 min)",
    },
  ],
  "Tech & Reviews": [
    {
      day: "Day 1 — Monday",
      title: "Top 5 Tech Gadgets Worth Every Penny in 2025",
      topic: "Product roundup / recommendations",
      videoIdea:
        "Curate 5 gadgets you genuinely use and love. Show real-world use cases, not just specs. Include price-to-value analysis and who each is best for.",
      thumbnailIdea:
        "5 products arranged neatly on white/dark desk. Your hand pointing to the best one. Bold text: '5 GADGETS WORTH BUYING'. Clean, minimal aesthetic.",
      format: "Roundup / Review (10-15 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "I Tested the Most-Hyped Phone of 2025 — Was It Worth It?",
      topic: "Flagship phone review",
      videoIdea:
        "Review the current most-talked-about phone with real-world tests: camera in various lighting, battery drain test, speed benchmark. Give a clear verdict.",
      thumbnailIdea:
        "Phone held up, half lit dramatically. Your face on right side skeptical. Text: 'WORTH $1,000?' Stark contrast, dark background.",
      format: "Deep-dive review (12-18 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title: "Budget vs Premium: Which Laptop Should You Actually Buy?",
      topic: "Comparison / buying guide",
      videoIdea:
        "Head-to-head comparison with real tasks: video rendering, gaming, browsing, battery life. Show results on screen and give a clear recommendation by budget.",
      thumbnailIdea:
        "Two laptops side by side, price tags visible. VS graphic between them. Your thumbs up pointing to a winner. Text: 'BUDGET vs PREMIUM'. Bold yellow/black.",
      format: "Comparison (12-16 min)",
    },
    {
      day: "Day 4 — Thursday",
      title: "5 Phone Settings You Should Change Right Now",
      topic: "Hidden settings / tips",
      videoIdea:
        "Walk through 5 settings most people leave at default that affect battery life, privacy, performance, or usability. Screen record each change.",
      thumbnailIdea:
        "Phone screen with settings visible, big red arrow pointing to a toggle. Your shocked face in corner. Text: 'CHANGE THESE NOW'. Red and white.",
      format: "Tips tutorial (7-10 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "I Bought the Cheapest Laptop on Amazon — Here's the Truth",
      topic: "Budget product challenge / honest review",
      videoIdea:
        "Buy the lowest-rated or cheapest version of a popular product category. Stress-test it. Be honest: is it terrible or surprisingly good? Create drama.",
      thumbnailIdea:
        "Cheap laptop with '$89' price tag sticker. You looking horrified or impressed. Text: 'THE CHEAPEST LAPTOP ON AMAZON'. Bright yellow/red.",
      format: "Challenge review (10-14 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "My Entire Tech Setup Tour (Under $1,000 Budget)",
      topic: "Setup tour / budget guide",
      videoIdea:
        "Showcase your full desk/tech setup with prices for every item. Explain your choices and alternatives. Include a total budget breakdown at the end.",
      thumbnailIdea:
        "Clean overhead desk shot or wide angle of setup. Price total in corner: 'TOTAL: $873'. Text: 'MY FULL SETUP TOUR'. Aesthetic, warm lighting.",
      format: "Setup tour / vlog (10-15 min)",
    },
    {
      day: "Day 7 — Sunday",
      title: "Tech That Looked Amazing But Completely Failed",
      topic: "Tech fails / retrospective",
      videoIdea:
        "Review 5 hyped products that turned out to be disappointments. Show real examples and why the marketing was misleading. Very shareable and discussion-worthy.",
      thumbnailIdea:
        "Products with big red X over them. Your disappointed face. Text: 'BIGGEST TECH FAILS'. Dark background, red X overlays.",
      format: "Commentary / List video (12-18 min)",
    },
  ],
  "Finance & Investing": [
    {
      day: "Day 1 — Monday",
      title: "How I Save $1,000/Month on an Average Salary (Real Budget)",
      topic: "Budgeting / personal finance basics",
      videoIdea:
        "Share your actual monthly budget broken down by category. Show the specific apps, rules, and habits you use. Use real numbers for maximum credibility.",
      thumbnailIdea:
        "$1,000 bills on desk. You in business casual pointing to them. Text: 'SAVE $1,000/MONTH'. Green color scheme, clean and professional.",
      format: "Educational / Personal story (10-14 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "I Invested $100 Every Week for 1 Year — Exact Portfolio Results",
      topic: "Investing challenge / portfolio reveal",
      videoIdea:
        "Show your real portfolio performance from a consistent $100/week investment strategy over 12 months. Include every stock/fund, gains, and losses.",
      thumbnailIdea:
        "Portfolio graph going up with '$100/week' label. Your face excited. Text: '1 YEAR RESULTS'. Green chart lines on dark background.",
      format: "Case study / portfolio review (12-16 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title: "5 Money Mistakes in Your 20s That Haunt You in Your 40s",
      topic: "Financial mistakes / education",
      videoIdea:
        "Cover 5 common financial mistakes with compound effect examples. Use animations/charts to show the long-term cost. Very shareable across all age groups.",
      thumbnailIdea:
        "Split: young person vs older person. Money flying away on one side. Text: '5 MISTAKES IN YOUR 20s'. Blue and red contrast.",
      format: "Educational list (10-14 min)",
    },
    {
      day: "Day 4 — Thursday",
      title: "Passive Income Streams That Actually Made Me Money (Honest)",
      topic: "Passive income / side hustles",
      videoIdea:
        "List only income streams you've personally tried and earned from. Give exact monthly numbers, time investment, and difficulty rating for each.",
      thumbnailIdea:
        "Money stacks with labels on each ('Dividends', 'Rental', 'YouTube'). You smiling confidently. Text: 'REAL PASSIVE INCOME'. Gold and green palette.",
      format: "Personal case study (12-18 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "Why 90% of People Never Become Wealthy (The Honest Reason)",
      topic: "Mindset / wealth psychology",
      videoIdea:
        "Explore the psychology and behavior patterns behind why most people struggle financially despite good intentions. Research-backed + personal insights.",
      thumbnailIdea:
        "90% / 10% pie chart graphic. Serious expression. Text: 'WHY 90% FAIL'. Dark, authoritative background.",
      format: "Educational / Opinion (10-15 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "Stock Market Explained Simply — Even Your Parents Will Get It",
      topic: "Beginner investing education",
      videoIdea:
        "Use simple analogies to explain how stocks, ETFs, and dividends work. Avoid jargon entirely. Best-performing education videos use real-life comparisons.",
      thumbnailIdea:
        "Simple stock graph with smiley face drawn on it. You with thumbs up. Text: 'STOCK MARKET SIMPLY EXPLAINED'. Bright, friendly colors.",
      format: "Explainer / Beginner guide (10-14 min)",
    },
    {
      day: "Day 7 — Sunday",
      title: "My Net Worth at 30 — Every Asset and Debt Revealed",
      topic: "Net worth reveal / transparency",
      videoIdea:
        "Share a complete breakdown of your net worth: assets, debts, investments, accounts. Transparency like this generates enormous trust and viewer loyalty.",
      thumbnailIdea:
        "Number (your net worth or a relatable one like '$47,382') bold on screen. Serious, professional look. Text: 'MY NET WORTH REVEALED'. Clean financial aesthetic.",
      format: "Personal finance / Transparency (12-18 min)",
    },
  ],
  "Fitness & Health": [
    {
      day: "Day 1 — Monday",
      title: "30-Day Transformation: What I Actually Ate and Did",
      topic: "Transformation / challenge reveal",
      videoIdea:
        "Show a real before/after with exact daily workout and meal plan used. Include progress photos and weekly weigh-in data for maximum credibility.",
      thumbnailIdea:
        "Side-by-side transformation photo. Bold text: '30 DAY TRANSFORMATION'. Red and white text on a dark gradient.",
      format: "Transformation story (12-18 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "The 20-Minute Home Workout That Beats an Hour at the Gym",
      topic: "Home workout tutorial",
      videoIdea:
        "A complete follow-along home workout with no equipment. Show modifications for beginners and advanced versions. Include calorie-burn comparison vs traditional gym.",
      thumbnailIdea:
        "You mid-exercise, sweating, in a living room. Text: '20 MIN = 1 HOUR GYM'. Orange fire background effect.",
      format: "Follow-along workout (20-25 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title: "I Ate Like a Fitness Model for 7 Days — Here's What I Learned",
      topic: "Diet challenge / nutrition experiment",
      videoIdea:
        "Follow a fitness model or athlete's exact meal plan for a week. Track hunger, energy, and body changes. Be honest about what was sustainable and what wasn't.",
      thumbnailIdea:
        "Meal prep containers + your face before/after. Text: '7 DAYS FITNESS MODEL DIET'. Clean, fresh greens and whites.",
      format: "Challenge / Nutrition (10-15 min)",
    },
    {
      day: "Day 4 — Thursday",
      title: "The 5 Exercises You're Doing Wrong (And the Right Way)",
      topic: "Form corrections / injury prevention",
      videoIdea:
        "Film common form mistakes for 5 popular exercises using side-by-side comparison. Include the injury risks of the wrong form and clear coaching cues for the right one.",
      thumbnailIdea:
        "Red X on wrong form left side, green check on correct form right side. Text: 'YOU'RE DOING IT WRONG'. High contrast, red/green.",
      format: "Tutorial / Form check (10-14 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "What Happens to Your Body If You Work Out Every Day for a Month",
      topic: "Science-based fitness education",
      videoIdea:
        "Explain the physiological changes that happen week by week when working out daily. Mix personal experience with research. Great for both beginners and enthusiasts.",
      thumbnailIdea:
        "Body outline with glowing transformation marks. Text: 'WORK OUT EVERY DAY FOR 30 DAYS'. Scientific/anatomical style.",
      format: "Educational / Science (10-15 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "Full Day of Eating for Muscle Gain (Every Meal Shown)",
      topic: "Nutrition / full day of eating",
      videoIdea:
        "Film every meal you eat in one day optimized for muscle gain. Show macros, preparation, and cost per day. Very high retention for fitness audiences.",
      thumbnailIdea:
        "Food flat lay with macro numbers visible. You looking lean and confident. Text: 'FULL DAY OF EATING FOR MUSCLE'. Clean white background, colorful food.",
      format: "Day-in-the-life / Nutrition (10-15 min)",
    },
    {
      day: "Day 7 — Sunday",
      title: "5 Fitness Myths That Are Ruining Your Progress",
      topic: "Myth busting / education",
      videoIdea:
        "Debunk 5 widely believed fitness myths with science-backed evidence. Target myths your audience likely believes (spot reduction, 'toning', no pain no gain, etc.).",
      thumbnailIdea:
        "Big red MYTH text crossed out. Your face confident with arms crossed. Text: '5 FITNESS MYTHS DEBUNKED'. Bold red and black.",
      format: "Education / Myth busting (10-14 min)",
    },
  ],
  "Cooking & Food": [
    {
      day: "Day 1 — Monday",
      title: "5 Meals Under $10 That Actually Taste Amazing",
      topic: "Budget cooking / meal ideas",
      videoIdea:
        "Cook 5 delicious meals with a strict $10 budget each. Show grocery receipts and every step. Perfect for students and budget-conscious viewers.",
      thumbnailIdea:
        "Beautiful plated meal next to a '$10' bill. Text: '5 MEALS UNDER $10'. Warm food photography lighting, rich colors.",
      format: "Cooking tutorial (12-18 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "I Tried the Most Viral Recipes of 2025 — Ranked",
      topic: "Viral recipe testing",
      videoIdea:
        "Test 5-7 of the most viral recipes from TikTok/Instagram. Rate each on taste, difficulty, and whether the hype is real. Very shareable format.",
      thumbnailIdea:
        "Collage of viral food dishes with a rating scale. Your surprised face. Text: 'VIRAL RECIPES RANKED'. Vibrant, appetizing colors.",
      format: "Taste test / Ranking (14-20 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title: "The Perfect Pasta From Scratch (No Store-Bought Allowed)",
      topic: "From-scratch cooking / technique",
      videoIdea:
        "Make pasta completely from scratch — flour, eggs, sauce, everything. Teach the technique step by step with common mistakes to avoid.",
      thumbnailIdea:
        "Hands rolling fresh pasta dough, flour dust visible. Text: 'PASTA FROM SCRATCH'. Rustic, warm Italian kitchen aesthetic.",
      format: "Recipe tutorial (15-20 min)",
    },
    {
      day: "Day 4 — Thursday",
      title: "I Meal Prepped for a Full Week in 1 Hour — Here's How",
      topic: "Meal prep / productivity cooking",
      videoIdea:
        "Show a complete 1-hour meal prep session for 5 days of lunches and dinners. Include shopping list, prep order strategy, and storage tips.",
      thumbnailIdea:
        "Rows of organized meal containers. Timer showing '1:00:00'. Text: '1 HOUR MEAL PREP FOR THE WEEK'. Clean, organized aesthetic.",
      format: "Meal prep guide (12-16 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "Restaurant vs Homemade: Which Tastes Better?",
      topic: "Comparison / blind taste test",
      videoIdea:
        "Recreate a signature dish from a popular restaurant and blind-taste-test it against the original with friends or family. Include the recipe.",
      thumbnailIdea:
        "Restaurant box on left, homemade plate on right, VS graphic. Text: 'RESTAURANT vs HOMEMADE'. Bold, appetite-inducing colors.",
      format: "Comparison / Taste test (10-15 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "10 Cooking Hacks That Professional Chefs Actually Use",
      topic: "Pro cooking techniques",
      videoIdea:
        "Share 10 real techniques from professional kitchens that home cooks don't know — knife skills, flavor layering, heat control. Demonstrate each one clearly.",
      thumbnailIdea:
        "Chef's knife on cutting board, professional kitchen blurred behind. Text: 'PRO CHEF SECRETS'. Dark, dramatic lighting with warm tones.",
      format: "Educational / Tips (10-14 min)",
    },
    {
      day: "Day 7 — Sunday",
      title: "My Family's Secret Recipe I've Never Shared Before",
      topic: "Heritage recipe / storytelling",
      videoIdea:
        "Share a personal family recipe with the story behind it. Combine cooking tutorial with emotional storytelling for maximum connection and shareability.",
      thumbnailIdea:
        "Old handwritten recipe card beside the finished dish. Warm, nostalgic home kitchen setting. Text: 'FAMILY SECRET RECIPE'. Sepia/warm tones.",
      format: "Storytelling / Recipe (12-18 min)",
    },
  ],
  "Lifestyle & Vlogging": [
    {
      day: "Day 1 — Monday",
      title: "My Morning Routine That Completely Changed My Life",
      topic: "Morning routine / productivity",
      videoIdea:
        "Film your actual morning routine from wake-up to ready. Be honest about what works, what you've tried and failed, and why this specific routine stuck.",
      thumbnailIdea:
        "You in morning light, coffee in hand, looking refreshed. Text: 'MORNING ROUTINE THAT CHANGED MY LIFE'. Warm sunrise color palette.",
      format: "Day-in-life / Tutorial (10-15 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "I Tried a $30 vs $300 Hotel for a Weekend — Big Difference?",
      topic: "Travel / comparison challenge",
      videoIdea:
        "Book a budget and luxury version of the same trip. Show real footage comparing quality, service, and experience. Let viewers decide if the price difference is worth it.",
      thumbnailIdea:
        "Two hotel rooms side by side, '$30' vs '$300' tags. Your shocked face. Text: 'BUDGET vs LUXURY HOTEL'. Clean travel aesthetic.",
      format: "Travel vlog / Comparison (15-20 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title: "How I Decluttered My Entire Life in One Weekend",
      topic: "Organization / minimalism",
      videoIdea:
        "Document a real declutter session with before/after shots of every space. Share your decision framework for what to keep vs discard. Very satisfying to watch.",
      thumbnailIdea:
        "Dramatic before/after of a room. Clean, organized version on right. Text: 'I DECLUTTERED EVERYTHING'. Fresh whites and neutrals.",
      format: "Vlog / Tutorial (12-18 min)",
    },
    {
      day: "Day 4 — Thursday",
      title: "A Day in My Life in [Your City] — Is It Really That Expensive?",
      topic: "City day-in-the-life / cost breakdown",
      videoIdea:
        "Vlog a full day in your city, tracking every expense. Show local spots, food, transport, activities. End with a total spend and honest verdict on cost of living.",
      thumbnailIdea:
        "City skyline or street shot. You with a surprised face next to a receipt. Text: 'HOW MUCH ONE DAY COSTS IN [CITY]'. Vibrant city colors.",
      format: "Day-in-life vlog (15-20 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "I Followed a Billionaire's Daily Routine for 7 Days",
      topic: "Challenge / productivity experiment",
      videoIdea:
        "Research a famous person's daily schedule (Elon Musk, Tim Cook, etc.) and follow it exactly for a week. Document the effects on your energy, productivity, and mood.",
      thumbnailIdea:
        "Newspaper headline photo of the person next to your face. Text: 'I COPIED [NAME]'S ROUTINE FOR 7 DAYS'. Bold, high contrast.",
      format: "Challenge / Experiment (12-18 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "My Honest Monthly Budget at 25 — Every Dollar Shown",
      topic: "Budget transparency / personal finance",
      videoIdea:
        "Break down your actual monthly income and spending honestly. Include rent, food, subscriptions, savings, fun money. Vulnerability resonates powerfully with this audience.",
      thumbnailIdea:
        "Budget spreadsheet visible. Your face earnest and open. Text: 'MY MONTHLY BUDGET REVEALED'. Clean finance aesthetic, green/white.",
      format: "Personal transparency / Education (10-15 min)",
    },
    {
      day: "Day 7 — Sunday",
      title: "The Habit That Transformed My Mental Health (Not What You Think)",
      topic: "Mental health / habits",
      videoIdea:
        "Share one specific habit that meaningfully improved your mental wellbeing. Be honest about what didn't work first. Use research to back it up and show your personal journey.",
      thumbnailIdea:
        "You looking calm and happy in natural setting. Text: 'THE HABIT THAT CHANGED EVERYTHING'. Soft, calming colors — greens and blues.",
      format: "Storytelling / Wellness (10-15 min)",
    },
  ],
  Education: [
    {
      day: "Day 1 — Monday",
      title: "The 80/20 Rule: How to Learn Anything in Half the Time",
      topic: "Study techniques / learning hacks",
      videoIdea:
        "Explain the Pareto principle applied to learning. Show specific examples across different subjects. Include actionable steps viewers can apply immediately.",
      thumbnailIdea:
        "80/20 pie chart with the 20% glowing. Your pointing to it. Text: 'LEARN ANYTHING FASTER'. Clean educational aesthetic, bright colors.",
      format: "Educational / How-to (10-14 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "Why Are We Still Teaching Things Schools Got Wrong?",
      topic: "Myth busting / educational critique",
      videoIdea:
        "Cover 3-5 things widely taught in schools that turned out to be wrong or outdated. Use primary sources and clear explanations. Very shareable and discussion-starting.",
      thumbnailIdea:
        "School chalkboard with big red X on formula or fact. Text: 'SCHOOLS TEACH THIS WRONG'. Authoritative but accessible look.",
      format: "Opinion / Education (12-18 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title: "[Complex Topic] Explained in 5 Minutes — Even a Child Gets It",
      topic: "Explainer / simplified science or history",
      videoIdea:
        "Take a notoriously complex concept (quantum physics, supply chains, the brain, etc.) and explain it using simple analogies and visuals in 5 minutes or under.",
      thumbnailIdea:
        "Complex diagram on left, simple stick figure illustration on right. Text: 'EXPLAINED IN 5 MINUTES'. Bright primary colors, clear layout.",
      format: "Explainer (5-8 min)",
    },
    {
      day: "Day 4 — Thursday",
      title:
        "The History Event That Changed Everything (You Were Never Taught)",
      topic: "Hidden history / untold stories",
      videoIdea:
        "Cover a genuinely fascinating historical event that most people don't know about. Connect it to modern implications for maximum relevance.",
      thumbnailIdea:
        "Historical photo with dramatic color grading. Text: 'THE EVENT THAT CHANGED HISTORY'. Sepia/dramatic tones with bold title.",
      format: "Historical documentary-style (12-20 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "How Your Brain Actually Works While You're Sleeping",
      topic: "Science / biology education",
      videoIdea:
        "Explain sleep science: what happens in each stage, why dreams occur, how memory consolidation works. Use animations or diagrams and connect to practical sleep tips.",
      thumbnailIdea:
        "Brain glowing while person sleeps. Text: 'WHAT YOUR BRAIN DOES AT NIGHT'. Dark blue/purple dreamy aesthetic.",
      format: "Science explainer (10-14 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "I Studied 8 Hours a Day Using This Method — Here's What Changed",
      topic: "Study experiment / productivity",
      videoIdea:
        "Apply a specific study technique (Pomodoro, Feynman method, spaced repetition) rigorously for a week. Track retention, focus, and energy. Share results honestly.",
      thumbnailIdea:
        "Desk with books and timer, focused study scene. Text: '8 HOURS A DAY — WHAT CHANGED'. Motivational, slightly intense aesthetic.",
      format: "Personal experiment (10-15 min)",
    },
    {
      day: "Day 7 — Sunday",
      title: "5 Books That Genuinely Changed How I Think About the World",
      topic: "Book recommendations / intellectual growth",
      videoIdea:
        "Share 5 books with genuine intellectual impact on your worldview. For each: summarize the core idea in 2 minutes, what you changed because of it, and who it's for.",
      thumbnailIdea:
        "5 book spines arranged neatly. Your face beside them. Text: '5 BOOKS THAT CHANGED MY THINKING'. Library/academic aesthetic.",
      format: "Recommendations / Review (12-16 min)",
    },
  ],
  "Business & Marketing": [
    {
      day: "Day 1 — Monday",
      title: "How I Got My First 10 Clients With $0 Marketing Budget",
      topic: "Business growth / client acquisition",
      videoIdea:
        "Share the exact outreach method, platform, and message template you used to land your first paying clients with no ad spend. Show real examples.",
      thumbnailIdea:
        "$0 budget label next to a client list or email inbox. Confident pose. Text: 'FIRST 10 CLIENTS WITH $0'. Green and professional.",
      format: "Case study / Tutorial (12-16 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "The Marketing Strategy That Grew My Audience 10x in 90 Days",
      topic: "Growth strategy / case study",
      videoIdea:
        "Break down one specific marketing strategy with exact steps, platforms, and results. Show your analytics as proof. Specific numbers make this highly credible.",
      thumbnailIdea:
        "Analytics chart with massive upward spike. Text: '10X GROWTH IN 90 DAYS'. Bold, data-driven aesthetic.",
      format: "Case study (12-18 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title:
        "Why 80% of Small Businesses Fail in Year 1 (And How to Be the 20%)",
      topic: "Business failure analysis / education",
      videoIdea:
        "Analyze the most common reasons small businesses fail using real data and examples. End with a practical checklist for avoiding each failure mode.",
      thumbnailIdea:
        "80% vs 20% graphic. Business closed sign on left, thriving shop on right. Text: 'WHY BUSINESSES FAIL'. Red and green contrast.",
      format: "Educational / Analysis (12-16 min)",
    },
    {
      day: "Day 4 — Thursday",
      title: "The Sales Script That Converts 3x More Leads (Word for Word)",
      topic: "Sales / conversion tactics",
      videoIdea:
        "Share an actual sales script or conversation framework that improved your close rate. Role-play it on camera and explain why each line works psychologically.",
      thumbnailIdea:
        "Script document with key lines highlighted in yellow. Text: 'SALES SCRIPT THAT CONVERTS'. Professional, sharp business aesthetic.",
      format: "Tutorial / How-to (10-15 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "I Analyzed the Top 10 Brand Strategies — Here's What They All Do",
      topic: "Brand analysis / marketing education",
      videoIdea:
        "Break down what Apple, Nike, Tesla, and other top brands do consistently in their marketing. Extract the 3-5 common principles every business can apply.",
      thumbnailIdea:
        "Logos of famous brands arranged around text: 'WHAT TOP BRANDS DO DIFFERENTLY'. Sleek, corporate aesthetic.",
      format: "Analysis / Education (14-20 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "The Side Hustle I Started for $100 That Now Makes $5,000/Month",
      topic: "Side hustle / income stream",
      videoIdea:
        "Detail the exact side hustle from start to current revenue. Include tools, platforms, first customer story, and what it took to scale. Be specific with numbers.",
      thumbnailIdea:
        "$100 bill transforming into a stack. Text: '$100 to $5K/MONTH'. Money transformation visual, gold tones.",
      format: "Personal story / Case study (12-18 min)",
    },
    {
      day: "Day 7 — Sunday",
      title: "Cold Email Templates That Get a 40% Reply Rate (Copy These)",
      topic: "Email marketing / outreach",
      videoIdea:
        "Share 3-5 cold email templates with real reply rate data. Explain the psychology behind each element — subject line, opener, offer, CTA. Show actual inboxes.",
      thumbnailIdea:
        "Email inbox with high reply rates visible. Bold text: '40% REPLY RATE'. Clean email/tech aesthetic.",
      format: "Tutorial / Resources (10-14 min)",
    },
  ],
  "General Content": [
    {
      day: "Day 1 — Monday",
      title: "The One Habit That Changed Everything for Me",
      topic: "Personal growth / habits",
      videoIdea:
        "Share a single powerful habit you've adopted and the measurable impact it had on your life. Be specific about how long it took, what obstacles appeared, and the result.",
      thumbnailIdea:
        "Before/after split of your mindset or life quality. Bold arrow pointing up. Text: 'THE HABIT THAT CHANGED MY LIFE'. Motivational, vibrant colors.",
      format: "Storytelling / Education (10-14 min)",
    },
    {
      day: "Day 2 — Tuesday",
      title: "I Tried 7 Viral Life Hacks — Which Ones Actually Worked?",
      topic: "Life hacks / testing viral content",
      videoIdea:
        "Test 7 popular life hacks that circulate online. Rate each on effort, effectiveness, and practicality. Very high engagement format — people love to see results.",
      thumbnailIdea:
        "Collage of life hack thumbnails with checkmarks and X marks. Text: 'VIRAL HACKS: DO THEY WORK?' High energy, grid layout.",
      format: "Testing / Listicle (12-18 min)",
    },
    {
      day: "Day 3 — Wednesday",
      title: "My Honest Opinion on [Trending Topic Everyone Is Talking About]",
      topic: "Opinion / commentary on trends",
      videoIdea:
        "Give your honest, well-researched take on a currently trending topic. Balance emotion with facts. End with a clear position to drive comment discussion.",
      thumbnailIdea:
        "Trending topic icon/graphic with your confident face. Text: 'MY HONEST OPINION'. Bold, clean, opinion-piece aesthetic.",
      format: "Opinion / Commentary (10-15 min)",
    },
    {
      day: "Day 4 — Thursday",
      title: "5 Things I Wish I Knew 5 Years Ago",
      topic: "Life lessons / retrospective",
      videoIdea:
        "Share 5 lessons from your personal or professional journey that would have saved you years of mistakes. Be vulnerable and specific — vague advice doesn't resonate.",
      thumbnailIdea:
        "You 5 years ago vs now (side by side). Arrow pointing forward. Text: '5 THINGS I WISH I KNEW'. Warm, reflective color palette.",
      format: "Personal story / Education (10-15 min)",
    },
    {
      day: "Day 5 — Friday",
      title: "The Documentary-Style Video About Something You're Obsessed With",
      topic: "Mini documentary / deep dive",
      videoIdea:
        "Make a short documentary about a topic you're passionate about. Include interviews, research, B-roll, and a narrative structure. High quality content with long watch time.",
      thumbnailIdea:
        "Cinematic wide shot or dramatic moment from topic. Text: 'THE UNTOLD STORY OF [TOPIC]'. Film grain, documentary aesthetic.",
      format: "Mini documentary (15-25 min)",
    },
    {
      day: "Day 6 — Saturday",
      title: "I Spent $1,000 Testing Whether Expensive = Better",
      topic: "Budget vs premium experiment",
      videoIdea:
        "Pick a product category and systematically test cheap vs expensive options. Present results blind whenever possible. Very shareable because everyone faces this choice.",
      thumbnailIdea:
        "Cheap product vs expensive product side by side. Price tags visible. Text: 'CHEAP vs EXPENSIVE: THE TRUTH'. Bold, high contrast.",
      format: "Experiment / Comparison (12-18 min)",
    },
    {
      day: "Day 7 — Sunday",
      title:
        "Full Transparency: What My Channel Really Looks Like Behind the Scenes",
      topic: "Creator transparency / community building",
      videoIdea:
        "Show your real workflow, how you come up with ideas, filming process, editing setup, and real analytics. Audiences love authenticity and the 'real' story.",
      thumbnailIdea:
        "Behind-the-scenes of your filming setup. Candid, natural look. Text: 'BEHIND THE SCENES: THE TRUTH'. Authentic, unfiltered aesthetic.",
      format: "Behind the scenes / Community (12-18 min)",
    },
  ],
};

function extractWords(titles: string[]): string[] {
  return titles
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

function wordFrequency(words: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return freq;
}

function detectNiche(titles: string[]): string {
  const allText = titles.join(" ").toLowerCase();
  const scores: Record<string, number> = {};

  for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
    scores[niche] = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}`, "gi");
      const matches = allText.match(regex);
      if (matches) scores[niche] += matches.length;
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] === 0) return "General Content";
  return sorted[0][0];
}

function calcPostingFrequency(videos: VideoData[]): {
  label: string;
  medianDays: number;
} {
  if (videos.length < 2) return { label: "Insufficient data", medianDays: 999 };

  const sorted = [...videos].sort(
    (a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (new Date(sorted[i].publishedAt).getTime() -
        new Date(sorted[i - 1].publishedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    gaps.push(diff);
  }

  const sorted_gaps = [...gaps].sort((a, b) => a - b);
  const mid = Math.floor(sorted_gaps.length / 2);
  const median =
    sorted_gaps.length % 2 === 0
      ? (sorted_gaps[mid - 1] + sorted_gaps[mid]) / 2
      : sorted_gaps[mid];

  let label: string;
  if (median < 4) label = "Daily uploads";
  else if (median < 8) label = "~2 videos/week";
  else if (median < 14) label = "~1 video/week";
  else if (median < 30) label = "~2 videos/month";
  else label = "~1 video/month or less";

  return { label, medianDays: median };
}

function calcStats(videos: VideoData[]) {
  const totalEngagement = videos.reduce((s, v) => s + v.engagementRate, 0);
  const avgEngagement = videos.length > 0 ? totalEngagement / videos.length : 0;

  const titleLengths = videos.map((v) => v.title.length);
  const avgTitleLength =
    titleLengths.length > 0
      ? titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length
      : 0;

  const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
  const totalComments = videos.reduce((s, v) => s + v.commentCount, 0);
  const avgCommentRate =
    totalViews > 0 ? (totalComments / totalViews) * 100 : 0;

  const views = videos.map((v) => v.viewCount);
  const meanViews =
    views.length > 0 ? views.reduce((a, b) => a + b, 0) / views.length : 0;
  const variance =
    views.length > 1
      ? views.reduce((s, v) => s + (v - meanViews) ** 2, 0) / views.length
      : 0;
  const stdDev = Math.sqrt(variance);
  const viewVarianceHigh = stdDev > meanViews;

  return {
    avgEngagement,
    avgTitleLength,
    avgCommentRate,
    viewVarianceHigh,
    meanViews,
  };
}

function generateMistakes(
  stats: ReturnType<typeof calcStats>,
  medianDays: number,
): string[] {
  const mistakes: string[] = [];

  if (stats.avgEngagement < 1) {
    mistakes.push(
      "Engagement below 1% — titles and thumbnails need stronger hooks to entice clicks",
    );
  } else if (stats.avgEngagement < 2) {
    mistakes.push(
      "Engagement between 1-2% — room to improve CTAs and audience connection in videos",
    );
  }

  if (medianDays > 14) {
    mistakes.push(
      "Inconsistent posting schedule — irregular uploads hurt algorithm ranking and subscriber retention",
    );
  }

  if (stats.avgTitleLength < 35) {
    mistakes.push(
      "Short titles miss SEO keywords — aim for 50-60 character titles that include target keywords",
    );
  } else if (stats.avgTitleLength > 70) {
    mistakes.push(
      "Titles are too long and get truncated in search results — keep under 60 characters",
    );
  }

  if (stats.avgCommentRate < 0.1) {
    mistakes.push(
      "Low comment engagement — add questions and calls-to-action in every video to spark discussion",
    );
  }

  if (stats.viewVarianceHigh) {
    mistakes.push(
      "High view count variance — inconsistent topics confuse the algorithm and audience expectations",
    );
  }

  mistakes.push(
    "Not leveraging community posts and YouTube Shorts for additional reach and discoverability",
  );
  mistakes.push(
    "Missing end screens, cards, and pinned comments that drive viewers to more content",
  );

  return mistakes.slice(0, 7);
}

function generateTitleSuggestions(
  videos: VideoData[],
  niche: string,
): string[] {
  const topVideos = [...videos]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  const year = new Date().getFullYear();

  // Extract meaningful topics from the channel's actual top videos
  const topics = topVideos.map((v) => {
    const words = v.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(" ")
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()))
      .slice(0, 3)
      .join(" ");
    return words || niche.split(" ")[0];
  });

  // Get niche-specific templates or fall back to general
  const templates = NICHE_TITLE_TEMPLATES[niche] ??
    NICHE_TITLE_TEMPLATES["General Content"] ?? [
      (t: string) =>
        `The Complete Guide to ${t} That Actually Works in ${year}`,
      (t: string) => `7 ${t} Mistakes You're Probably Making Right Now`,
      (t: string) => `How I Mastered ${t} in 30 Days (Step-by-Step Breakdown)`,
      (t: string) =>
        `Why Your ${t} Strategy Isn't Working (And How to Fix It Fast)`,
      (t: string) => `The Truth About ${t} Nobody Talks About`,
    ];

  return topics
    .slice(0, 5)
    .map((topic, i) => templates[i % templates.length](topic, year));
}

function generateSEOTips(videos: VideoData[], niche: string) {
  const allTitles = videos.map((v) => v.title);
  const words = extractWords(allTitles);
  const freq = wordFrequency(words);

  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w]) => w);

  const nicheTagMap: Record<string, string[]> = {
    Gaming: [
      "gaming",
      "gameplay",
      "gamer",
      "video games",
      "game review",
      "let's play",
      "gaming tips",
      "walkthrough",
      "gaming setup",
      "pro player",
    ],
    "Tech & Reviews": [
      "tech review",
      "unboxing",
      "best tech",
      "tech tips",
      "gadgets",
      "technology",
      "review",
      "specs",
      "tech comparison",
      "top picks",
    ],
    "Finance & Investing": [
      "investing tips",
      "personal finance",
      "make money",
      "passive income",
      "stock market",
      "financial freedom",
      "wealth building",
      "money tips",
      "budget",
      "savings",
    ],
    "Fitness & Health": [
      "workout routine",
      "fitness tips",
      "weight loss",
      "muscle building",
      "healthy lifestyle",
      "gym motivation",
      "home workout",
      "diet tips",
      "strength training",
      "cardio",
    ],
    "Cooking & Food": [
      "easy recipe",
      "cooking tips",
      "meal prep",
      "healthy eating",
      "food review",
      "cooking tutorial",
      "quick meals",
      "home cooking",
      "food hack",
      "delicious recipe",
    ],
    "Lifestyle & Vlogging": [
      "daily vlog",
      "lifestyle tips",
      "day in my life",
      "travel vlog",
      "lifestyle",
      "morning routine",
      "productivity",
      "self improvement",
      "motivation",
      "life tips",
    ],
    Education: [
      "educational video",
      "learn online",
      "study tips",
      "explained simply",
      "how it works",
      "science explained",
      "history facts",
      "knowledge",
      "educational content",
      "tutorial",
    ],
    "Business & Marketing": [
      "business tips",
      "marketing strategy",
      "entrepreneur",
      "online business",
      "digital marketing",
      "grow business",
      "make money online",
      "startup advice",
      "SEO tips",
      "social media marketing",
    ],
  };

  const nicheTags =
    nicheTagMap[niche] ?? keywords.slice(0, 10).map((k) => `${k} tips`);

  const allTags = [...new Set([...keywords.slice(0, 5), ...nicheTags])].slice(
    0,
    15,
  );

  const descriptionTips = [
    "Include your primary keyword in the first 2 lines of the description for better SEO",
    "Add 3-5 relevant links (website, social media, related videos) in every description",
    "End every description with a clear call-to-action (subscribe, comment, share)",
    "Use timestamps to improve watch time and make your videos more searchable",
  ];

  return { keywords: keywords.slice(0, 12), tags: allTags, descriptionTips };
}

function generateViralIdeas(niche: string, videos: VideoData[]): string[] {
  const topWords = extractWords(videos.map((v) => v.title)).slice(0, 5);
  const topic = topWords[0] ?? niche.split(" ")[0];
  const nicheShort = niche.split(" ")[0];

  const templates = [
    `I Spent 30 Days Mastering ${topic} — Here's What Happened (Shocking Results)`,
    `This ${topic} Hack Changed Everything — 1 Million People Got It Wrong`,
    `Reacting to the Worst ${nicheShort} Content on YouTube (So Bad It's Funny)`,
    `7 Things I Wish I Knew Before Starting ${nicheShort} (Save Yourself Years)`,
    `I Copied the #1 ${nicheShort} Creator's Strategy for 30 Days — Here's What I Learned`,
    `The ${topic} Trend Nobody Is Talking About Yet (Get In Early)`,
    `Extreme ${topic} Challenge: I Tried Every Method So You Don't Have To`,
    `Testing ${nicheShort} Products/Methods Ranked From Worst to Best (Honest Review)`,
    `The Dark Side of ${nicheShort} That Nobody Shows You`,
    `I Asked 100 People About ${topic} — Their Answers Will Surprise You`,
    `${nicheShort} Experts Are Wrong About This (Here's the Proof)`,
    `From Zero to ${nicheShort} Pro: My Complete Transformation Story`,
    `The Biggest ${topic} Myths Debunked (You've Been Lied To)`,
    `Why 90% of ${nicheShort} Beginners Fail (And How You Can Be the 10%)`,
    `I Tried Every Popular ${topic} Method — Here's What Actually Works`,
  ];

  return templates.slice(0, 12);
}

function generateStrategyTips(
  videos: VideoData[],
  stats: ReturnType<typeof calcStats>,
  medianDays: number,
  niche: string,
): string[] {
  const tips: string[] = [];

  if (medianDays > 14) {
    tips.push(
      "Increase posting frequency to at least 1 video per week — consistency is the #1 algorithm signal for channel growth",
    );
  } else if (medianDays > 7) {
    tips.push(
      "Push from weekly to 2 videos/week — channels that double posting frequency typically see 40-60% more impressions",
    );
  } else {
    tips.push(
      "Maintain your current posting cadence — your upload frequency is already a competitive advantage in the algorithm",
    );
  }

  if (stats.avgEngagement < 2) {
    tips.push(
      "Boost engagement by asking a specific question at the 30-second mark and again at the end of every video",
    );
  } else {
    tips.push(
      "Your engagement rate is solid — reply to every comment in the first 48 hours to signal community activity to YouTube",
    );
  }

  const sorted = [...videos].sort((a, b) => b.viewCount - a.viewCount);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  if (best && worst) {
    const ratio =
      best.viewCount > 0
        ? (best.viewCount / Math.max(worst.viewCount, 1)).toFixed(0)
        : "10";
    tips.push(
      `Your best video gets ${ratio}x more views than your worst — study its title, thumbnail, and hook then replicate that formula`,
    );
  }

  tips.push(
    "Optimize every video's first 30 seconds to reduce audience drop-off — tease the main value and skip slow intros",
  );
  tips.push(
    `Collaborate with 2-3 similarly-sized ${niche} channels this month — cross-promotion is the fastest free growth tactic available`,
  );

  return tips;
}

function generateGrowthPlan(
  stats: ReturnType<typeof calcStats>,
  medianDays: number,
): GrowthWeek[] {
  return [
    {
      week: "Week 1 — Audit & Optimize",
      goal: "Fix existing content to maximize performance of current videos",
      actions: [
        "Rewrite titles of your top 5 most-viewed videos using the suggested title templates",
        "Update thumbnails with high-contrast text overlays and emotional facial expressions",
        "Add end screens and cards to all recent 10 videos pointing to related content",
        ...(stats.avgEngagement < 2
          ? ["Add a pinned comment asking viewers a question on every video"]
          : ["Respond to all unanswered comments from the past 30 days"]),
      ],
    },
    {
      week: "Week 2-3 — Content Push",
      goal: "Publish 2 highly-optimized videos using top-performing formats",
      actions: [
        "Use the suggested title templates for both new video titles",
        "Film videos where you ask viewers a direct question at 30 seconds and at the end",
        "Include keyword-rich descriptions with timestamps and relevant links",
        ...(medianDays > 14
          ? [
              "Schedule uploads for the same day/time each week to train the algorithm",
            ]
          : [
              "Test a different upload day/time to reach a new audience segment",
            ]),
      ],
    },
    {
      week: "Week 4 — Community & Promotion",
      goal: "Amplify reach and build a loyal community",
      actions: [
        "Post 3 community posts: poll, behind-the-scenes photo, and a teaser for next video",
        "Share your best-performing new video to 3 relevant online communities (Reddit, Facebook Groups)",
        "Analyze which of the 2 new videos performed better — double down on that format",
        "Reply to every comment on both new videos within 24 hours of uploading",
      ],
    },
  ];
}

function generateSevenDayPlan(niche: string): DayPlan[] {
  return SEVEN_DAY_PLANS[niche] ?? SEVEN_DAY_PLANS["General Content"] ?? [];
}

export function generateInsights(
  channel: ChannelData,
  videos: VideoData[],
): Insights {
  const niche = detectNiche(videos.map((v) => v.title));
  const { label: postingFrequency, medianDays } = calcPostingFrequency(videos);
  const stats = calcStats(videos);

  const mistakes = generateMistakes(stats, medianDays);
  const titleSuggestions = generateTitleSuggestions(videos, niche);
  const seoTips = generateSEOTips(videos, niche);
  const viralIdeas = generateViralIdeas(niche, videos);
  const strategyTips = generateStrategyTips(videos, stats, medianDays, niche);
  const growthPlan = generateGrowthPlan(stats, medianDays);
  const sevenDayPlan = generateSevenDayPlan(niche);

  void channel;

  return {
    mistakes,
    titleSuggestions,
    seoTips,
    viralIdeas,
    strategyTips,
    growthPlan,
    sevenDayPlan,
    avgEngagementRate: stats.avgEngagement,
    postingFrequency,
    niche,
  };
}
