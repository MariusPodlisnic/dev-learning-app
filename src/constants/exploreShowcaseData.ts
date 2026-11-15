import { StudioColors } from "./theme";

export interface FeatureSpotlightItem {
  id: string;
  tabTag: string;
  tabTitle: string;
  accent: string;
  badge: string;
  title: string;
  description: string;
  proHook: string;
  codePreview: string;
  ctaLabel: string;
  hrefParams: Record<string, string>;
}

export const FEATURE_SPOTLIGHTS: FeatureSpotlightItem[] = [
  {
    id: "studio",
    tabTag: "01 // FREE+PRO",
    tabTitle: "⌨️ Py 3.11 Studio",
    accent: "#34D399",
    badge: "01 // IN-BROWSER PYTHON 3.11 STUDIO",
    title: "Write & Execute Real Python — Zero Setup Required",
    description:
      "Powered by WebAssembly Pyodide 3.11. Run real Python code in your browser, inspect variable state, toggle between Analogy, Guide, and Cheatsheet explanations from Byte-Cat, and pass automated unit tests in milliseconds.",
    proHook:
      "👑 Pro unlocks AI Hints, Solution Diffs & all 72+ Modules across 3 Tracks.",
    codePreview:
      "def top_k_frequent(nums, k):\n    counts = Counter(nums)\n    return [x for x, _ in counts.most_common(k)]\n\n# ✓ All 6 Unit Tests Passed in 4ms (+50 XP)",
    ctaLabel: "OPEN PYTHON STUDIO →",
    hrefParams: { track: "python_basics" },
  },
  {
    id: "algolab",
    tabTag: "02 // PRO LAB",
    tabTitle: "🔬 Algo Visualizer",
    accent: "#38BDF8",
    badge: "02 // INTERACTIVE ALGO VISUALIZER LAB (PRO)",
    title: "Watch Pointers, Sliding Windows & Trees Animate Live",
    description:
      "Don't just memorize code—see why O(n) beats O(n²). Step forward and backward through Two Pointers, Binary Search, Monotonic Stacks, and Graph BFS/DFS with live memory telemetry.",
    proHook:
      "👑 Exclusive to Pro: 30+ interactive algorithm visualizers & Big-O complexity labs.",
    codePreview:
      "[STEP 04/08] Left=1 (val=4), Right=4 (val=10)\nWindow Sum = 14 == Target ✓\nTime Complexity: O(n) · Space: O(1)",
    ctaLabel: "LAUNCH ALGO LAB →",
    hrefParams: { mode: "algolab" },
  },
  {
    id: "bughunt",
    tabTag: "03 // ARENA",
    tabTitle: "🪲 Bug Hunt 100",
    accent: "#FB7185",
    badge: "03 // BUG HUNT ARENA (100+ REAL BUGS)",
    title: "Sharpen Your Production Debugging Instincts",
    description:
      "Spot subtle off-by-one errors, mutable default args, race conditions, and broken recursion base cases. Patch the bug directly in the editor and climb toward The 100-Bug Centurion badge!",
    proHook:
      "👑 Pro unlocks Unlimited Daily Bug Hunts & Hard Elite Debugging Challenges.",
    codePreview:
      "❌ Bug Detected on Line 1: Mutable default arg 'cache={}'\n✅ Patch Verified: 'cache=None' -> Streak: 14 Bugs Squashed!",
    ctaLabel: "ENTER BUG HUNT ARENA →",
    hrefParams: { mode: "bughunt" },
  },
  {
    id: "blitz",
    tabTag: "04 // SPRINT",
    tabTitle: "⚡ 60s Blitz",
    accent: "#FFDE59",
    badge: "04 // 60-SECOND SYNTAX BLITZ ARENA",
    title: "High-Adrenaline 60s Code Output Sprints",
    description:
      "Beat the ticking 60-second clock by predicting exact Python runtime outputs, list comprehensions, and time complexities. Build combo multipliers and share Wordle-style scorecards.",
    proHook:
      "👑 Pro unlocks Algorithm & System Design Blitz Decks + Combo Shields.",
    codePreview:
      "⏱️ 42.8s LEFT · COMBO x5 FIRE! 🔥\nprint([x**2 for x in range(4) if x % 2 == 1])\n-> Correct: [1, 9] (+35 XP)",
    ctaLabel: "PLAY 60S BLITZ →",
    hrefParams: { mode: "blitz" },
  },
  {
    id: "miniapps",
    tabTag: "05 // CHAPTER VI",
    tabTitle: "🎮 4 Mini-Apps",
    accent: "#C084FC",
    badge: "05 // PLAYABLE CHAPTER VI MINI-APPS",
    title: "Build 4 Playable Mini-Apps You Can Actually Use",
    description:
      "Cap off Python Foundations by coding the engine behind an RPG Critical Hit Calculator, Password Entropy Auditor, Restaurant Bill Splitter, and Emoji Mood Chat Bot.",
    proHook:
      "🐍 100% Free in Chapter VI — plus Pro unlocks System Design Architecture Sims!",
    codePreview:
      "🗡️ RPG CRIT ENGINE READY:\nBase DMG: 120 · Crit Multiplier: 2.5x\n-> CRITICAL HIT: 300 DMG! (Boss Defeated)",
    ctaLabel: "PLAY RPG MINI-APP →",
    hrefParams: { lesson: "exp-py-21" },
  },
  {
    id: "trophies",
    tabTag: "06 // PRESTIGE",
    tabTitle: "🏅 Trophy & Certs",
    accent: "#FFDE59",
    badge: "06 // TROPHY HALL & VERIFIED CERTIFICATES",
    title: "16 Unlockable Badges + Official Track Diplomas",
    description:
      "Track your live progress toward Easy, Medium, and Hard Elite achievements (like The 100-Bug Centurion and O(1) Overlord) and claim verifiable Chapter & Track Certificates.",
    proHook:
      "👑 Pro unlocks all 3 Track Mastery Diplomas & Hard Elite Prestige Trophies.",
    codePreview:
      "🏅 UNLOCKED: THE 100-BUG CENTURION (HARD ELITE)\n🎓 CERTIFICATE ISSUED: Algorithmic Mastery Track",
    ctaLabel: "OPEN TROPHY HALL →",
    hrefParams: { mode: "achievements" },
  },
];

export const TRACK_SYLLABUS = [
  {
    key: "python_basics" as const,
    badge: "🐍 TRACK 01 · FREE",
    moduleTag: "28 MODULES · 7 RECAPPERS",
    chapters: "7 Chapters · Basics, Modern Python & Mini-Apps",
    chapterBreakdown: [
      { label: "Ch. I–III: Variables, Loops, Dicts & OOP", tag: "12 Lessons", isPro: false },
      { label: "Ch. IV–VI: Builtins, Mini-Apps & Recaps", tag: "12 Lessons", isPro: false },
      { label: "Ch. VII: Comprehensions, Classes, Regex & Decorators", tag: "4 Modern Labs", isPro: false },
    ],
    ctaLabel: "START FREE TRACK →",
  },
  {
    key: "algorithms" as const,
    badge: "🧬 TRACK 02 · PRO + 1 FREE",
    moduleTag: "O(n) → DP",
    chapters: "Two Pointers, Hashing, Trees, Graphs, Heaps & DP",
    chapterBreakdown: [
      { label: "🔓 Two Pointers & Array Scan", tag: "FREE PREVIEW", isPro: false },
      { label: "🔒 Sliding Window, Hash Maps & Binary Search", tag: "PRO", isPro: true },
      { label: "🔒 Trees/BST, Graph BFS, Heaps & Dynamic Prog.", tag: "PRO", isPro: true },
    ],
    ctaLabel: "👑 TRY PREVIEW / UNLOCK PRO →",
  },
  {
    key: "system_design" as const,
    badge: "🏗️ TRACK 03 · PRO + 1 FREE",
    moduleTag: "HYPERSCALE",
    chapters: "Scalability, Caching, Sharding & Distributed Queues",
    chapterBreakdown: [
      { label: "🔓 Load Balancers & Health Checks", tag: "FREE PREVIEW", isPro: false },
      { label: "🔒 Redis LRU Caching & Rate Limiters", tag: "PRO", isPro: true },
      { label: "🔒 Sharding, Queues & Retries", tag: "PRO", isPro: true },
    ],
    ctaLabel: "👑 TRY PREVIEW / UNLOCK PRO →",
  },
];

export const MINI_APP_SHOWCASE = [
  {
    id: "exp-py-21",
    tag: "MINI-APP 01",
    title: "RPG Critical Hit Calculator",
    summary: "Calculate base damage, crit multipliers, and combat roll stats.",
    accent: StudioColors.yellow,
  },
  {
    id: "exp-py-22",
    tag: "MINI-APP 02",
    title: "Password Strength Checker",
    summary: "Validate character rules, entropy checks, and security scoring.",
    accent: StudioColors.mint,
  },
  {
    id: "exp-py-23",
    tag: "MINI-APP 03",
    title: "Restaurant Bill & Tip Splitter",
    summary: "Split checks cleanly across friends with tax and rounding.",
    accent: StudioColors.pink,
  },
  {
    id: "exp-py-24",
    tag: "MINI-APP 04",
    title: "Emoji Mood Chat Bot",
    summary: "Match user keywords to dynamic reactions using clean Python dicts.",
    accent: StudioColors.violet,
  },
];

export const ALGO_DEMO_NUMS = [2, 4, 6, 8, 10, 15];
export const ALGO_DEMO_STATES = [
  {
    l: 0,
    r: 5,
    matched: false,
    msg: "Step 1/3: L=0 (2) + R=5 (15) = 17 > 14 → Sum too high, move R left!",
  },
  {
    l: 0,
    r: 4,
    matched: false,
    msg: "Step 2/3: L=0 (2) + R=4 (10) = 12 < 14 → Sum too low, move L right!",
  },
  {
    l: 1,
    r: 4,
    matched: true,
    msg: "🎯 Step 3/3: MATCH! L=1 (4) + R=4 (10) == 14 solved in O(n) time!",
  },
];
