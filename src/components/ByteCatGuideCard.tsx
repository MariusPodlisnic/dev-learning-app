import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getHoursUntilMidnight,
  getTodayDateKey,
} from "../constants/streaks";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { readLocalJson, writeLocalJson } from "../types/lesson";
import {
  playKeyClick,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";

const BYTE_CAT_IMAGE = require("../../assets/images/byte-cat.jpg");
const STORAGE_BYTECAT_QUOTE_KEY = "devlearn_bytecat_quote_state_v1";
const STORAGE_BYTECAT_QUOTE_PREFS_KEY = "devlearn_bytecat_quote_prefs_v1";
const STORAGE_BYTECAT_PET_KEY = "devlearn_bytecat_pet_v1";
const TREAT_XP_AMOUNT = 15;

export interface ByteCatQuote {
  id: number;
  quote: string;
  author: string;
  moodBadge: string;
  accentBg: string;
}

export const BYTE_CAT_QUOTES: ByteCatQuote[] = [
  {
    id: 1,
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    moodBadge: "=^._.^= STRATEGIC PAWS",
    accentBg: "#FFDE59",
  },
  {
    id: 2,
    quote:
      "Every master programmer was once a beginner who refused to quit on a syntax error.",
    author: "Byte-Cat Wisdom",
    moodBadge: "⚡ RESILIENT CODER",
    accentBg: "#A3E635",
  },
  {
    id: 3,
    quote: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    moodBadge: "✦ CLEAN SYNTAX",
    accentBg: "#6EE7B7",
  },
  {
    id: 4,
    quote: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    moodBadge: "🚀 SHIP IT MODE",
    accentBg: "#FF90E8",
  },
  {
    id: 5,
    quote: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    moodBadge: "🐾 CLAWS ON KEYS",
    accentBg: "#FFDE59",
  },
  {
    id: 6,
    quote:
      "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
    moodBadge: "⌨️ KEYCAP HERO",
    accentBg: "#C4B5FD",
  },
  {
    id: 7,
    quote:
      "Debugging is twice as hard as writing the code in the first place.",
    author: "Brian Kernighan",
    moodBadge: "🔍 BUG STALKER",
    accentBg: "#6EE7B7",
  },
  {
    id: 8,
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    moodBadge: "🔥 DAILY MOMENTUM",
    accentBg: "#A3E635",
  },
  {
    id: 9,
    quote: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    moodBadge: "★ READABLE CODE",
    accentBg: "#FF90E8",
  },
  {
    id: 10,
    quote:
      "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    moodBadge: "💎 CRAFT MODE",
    accentBg: "#FFDE59",
  },
  {
    id: 11,
    quote: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
    moodBadge: "⚡ XP GAINED",
    accentBg: "#C4B5FD",
  },
  {
    id: 12,
    quote: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
    moodBadge: "🛡️ EDGE CASE READY",
    accentBg: "#6EE7B7",
  },
  {
    id: 13,
    quote: "Consistency beats intensity when you're building a superpower.",
    author: "Byte-Cat Protocol // 07",
    moodBadge: "=^._.^= DAILY BOOST",
    accentBg: "#A3E635",
  },
  {
    id: 14,
    quote: "Knowledge is power, but applied knowledge is a career.",
    author: "Developer Proverb",
    moodBadge: "🎯 SKILL BUILDER",
    accentBg: "#FFDE59",
  },
  {
    id: 15,
    quote:
      "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    moodBadge: "📖 CLEAN READS",
    accentBg: "#C4B5FD",
  },
  {
    id: 16,
    quote: "Premature optimization is the root of all evil.",
    author: "Donald Knuth",
    moodBadge: "🧠 FOCUS FIRST",
    accentBg: "#FFDE59",
  },
  {
    id: 17,
    quote: "Testing shows the presence, not the absence of bugs.",
    author: "Edsger W. Dijkstra",
    moodBadge: "🔬 VERIFY LOGIC",
    accentBg: "#6EE7B7",
  },
  {
    id: 18,
    quote: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    moodBadge: "🏗️ SOLID SYSTEMS",
    accentBg: "#A3E635",
  },
  {
    id: 19,
    quote:
      "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
    moodBadge: "✂️ LESS IS MORE",
    accentBg: "#FF90E8",
  },
  {
    id: 20,
    quote:
      "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
    author: "Bill Gates",
    moodBadge: "⚖️ SIGNAL OVER NOISE",
    accentBg: "#FFDE59",
  },
  {
    id: 21,
    quote: "Deleted code is debugged code.",
    author: "Jeff Sickel",
    moodBadge: "🧹 ZERO BLOAT",
    accentBg: "#6EE7B7",
  },
  {
    id: 22,
    quote: "Before software can be reusable it first has to be usable.",
    author: "Ralph Johnson",
    moodBadge: "🔧 SHIP WORKING FIRST",
    accentBg: "#C4B5FD",
  },
  {
    id: 23,
    quote: "Truth can only be found in one place: the code.",
    author: "Robert C. Martin",
    moodBadge: "🔍 SOURCE OF TRUTH",
    accentBg: "#A3E635",
  },
  {
    id: 24,
    quote:
      "One of my most productive days was throwing away 1,000 lines of code.",
    author: "Ken Thompson",
    moodBadge: "🔥 REFACTOR HERO",
    accentBg: "#FF90E8",
  },
];

interface PetLevelTier {
  level: number;
  minXp: number;
  title: string;
  icon: string;
  perkTitle: string;
  perkDesc: string;
  accent: string;
}

const PET_LEVEL_TIERS: PetLevelTier[] = [
  {
    level: 1,
    minXp: 0,
    title: "KEYBOARD NAPPER",
    icon: "🐾",
    perkTitle: "Animated Stage",
    perkDesc: "Idle float, ear tilt & orbiting sparkles",
    accent: "#FFDE59",
  },
  {
    level: 2,
    minXp: 30,
    title: "MERGE CONFLICT CAT",
    icon: "🌈",
    perkTitle: "Prism Halo",
    perkDesc: "Cycles vibrant neon stage rings & unlocks 🐾 orbit badge",
    accent: "#FF90E8",
  },
  {
    level: 3,
    minXp: 75,
    title: "SUDO ROOT GREMLIN",
    icon: "🔮",
    perkTitle: "Neon Lava Lamp",
    perkDesc:
      "Equips a glowing retro lava lamp on the desk, fast equalizer & cyber whispers",
    accent: "#6EE7B7",
  },
  {
    level: 4,
    minXp: 135,
    title: "BUG WHACKER 9000",
    icon: "🪲",
    perkTitle: "Double Burst",
    perkDesc: "Upgrades sparkles to 🪲/💎 & triggers dual celebratory popups",
    accent: "#A3E635",
  },
  {
    level: 5,
    minXp: 210,
    title: "10X SENIOR CHONK",
    icon: "👑",
    perkTitle: "Golden Crown",
    perkDesc: "Floating 👑 crown sticker & gleaming gold portrait trim",
    accent: "#FBBF24",
  },
  {
    level: 6,
    minXp: 300,
    title: "PROD OVERLORD CAT",
    icon: "🚀",
    perkTitle: "Rainbow Legend",
    perkDesc: "Cycling rainbow arcade frame & ★ LEGEND trim on top bar",
    accent: "#C4B5FD",
  },
];

function getPetLevelProgress(petXp: number): {
  level: number;
  tier: PetLevelTier;
  nextTier: PetLevelTier | null;
  currentLevelFloorXp: number;
  nextLevelTargetXp: number;
  pctInLevel: number;
} {
  if (petXp >= 300) {
    const extraLevels = Math.floor((petXp - 300) / 100);
    const level = 6 + extraLevels;
    const floor = 300 + extraLevels * 100;
    const target = floor + 100;
    return {
      level,
      tier: PET_LEVEL_TIERS[5],
      nextTier: null,
      currentLevelFloorXp: floor,
      nextLevelTargetXp: target,
      pctInLevel: Math.max(8, ((petXp - floor) / 100) * 100),
    };
  }

  let currentIdx = 0;
  for (let i = 0; i < PET_LEVEL_TIERS.length; i += 1) {
    if (petXp >= PET_LEVEL_TIERS[i].minXp) {
      currentIdx = i;
    }
  }
  const tier = PET_LEVEL_TIERS[currentIdx];
  const nextTier = PET_LEVEL_TIERS[currentIdx + 1] || null;
  const floor = tier.minXp;
  const target = nextTier ? nextTier.minXp : floor + 100;
  const span = Math.max(1, target - floor);

  return {
    level: tier.level,
    tier,
    nextTier,
    currentLevelFloorXp: floor,
    nextLevelTargetXp: target,
    pctInLevel: Math.max(8, Math.min(100, ((petXp - floor) / span) * 100)),
  };
}

interface SyntaxSnack {
  title: string;
  tag: string;
  code: string;
  takeaway: string;
  accentBg: string;
}

const TRACK_SNACKS: Record<string, SyntaxSnack[]> = {
  python_basics: [
    {
      title: "Safe Dictionary Lookup",
      tag: "DICT PRO TIP",
      code: 'hp = stats.get("hp", 100)',
      takeaway:
        'Using .get() returns fallback 100 instead of raising a KeyError crash when "hp" is missing.',
      accentBg: "#FFDE59",
    },
    {
      title: "Index + Value in One Loop",
      tag: "CLEAN LOOP",
      code: "for i, item in enumerate(items):\n    print(i, item)",
      takeaway:
        "No manual counter needed—enumerate() yields both position and item cleanly.",
      accentBg: "#6EE7B7",
    },
    {
      title: "One-Line Variable Swap",
      tag: "PYTHONIC TRICK",
      code: "left, right = right, left",
      takeaway:
        "Tuple unpacking swaps values in one atomic step without needing a temp variable.",
      accentBg: "#FF90E8",
    },
    {
      title: "Readable F-String Formatting",
      tag: "OUTPUT FORMAT",
      code: 'print(f"Score: {xp:,} XP ({pct:.0f}%)")',
      takeaway:
        "Embed math, commas, and rounding right inside strings—no str(...) glue required.",
      accentBg: "#C4B5FD",
    },
  ],
  algorithms: [
    {
      title: "Two Pointers Pattern",
      tag: "O(N) SCAN",
      code: "l, r = 0, len(arr) - 1\nwhile l < r: ...",
      takeaway:
        "Move ends toward each other on sorted data to eliminate O(n^2) nested loops.",
      accentBg: "#6EE7B7",
    },
    {
      title: "Instant Frequency Counter",
      tag: "HASH MAP",
      code: "freq[x] = freq.get(x, 0) + 1",
      takeaway:
        "Turn repeated scans into O(1) dictionary lookups in one clean line.",
      accentBg: "#FFDE59",
    },
    {
      title: "Sliding Window Shrink",
      tag: "SUBARRAY",
      code: "while win_sum > k:\n    win_sum -= nums[left]\n    left += 1",
      takeaway:
        "Expand right, shrink left—every element enters and leaves the window once.",
      accentBg: "#C4B5FD",
    },
    {
      title: "Duplicate Check with Set",
      tag: "O(1) LOOKUP",
      code: "if target - n in seen:\n    return True\nseen.add(n)",
      takeaway:
        "Checking membership in a Python set takes O(1) average time vs O(n) for lists.",
      accentBg: "#A3E635",
    },
  ],
  system_design: [
    {
      title: "Cache-Aside Read Path",
      tag: "LOW LATENCY",
      code: "val = cache.get(k) or db.fetch(k)\ncache.set(k, val, ttl=60)",
      takeaway:
        "Serve hot reads straight from RAM first and fall back to disk only on a cache miss.",
      accentBg: "#FF90E8",
    },
    {
      title: "Exponential Backoff + Cap",
      tag: "RESILIENCE",
      code: "delay = min(cap, base * (2 ** attempt))",
      takeaway:
        "Spread out retries after outages so recovering servers don't get flooded.",
      accentBg: "#FFDE59",
    },
    {
      title: "Idempotency Safe Retries",
      tag: "PAYMENTS",
      code: "if req_id in seen:\n    return cached_response",
      takeaway:
        "Store request IDs so duplicate network retries never charge a user twice.",
      accentBg: "#6EE7B7",
    },
    {
      title: "Consistent Sharding Key",
      tag: "SCALING",
      code: "shard_id = hash(user_id) % num_shards",
      takeaway:
        "Route each user's writes predictably to keep lookups fast across database nodes.",
      accentBg: "#C4B5FD",
    },
  ],
};

interface MiniQuizItem {
  code: string;
  options: string[];
  answerIdx: number;
  why: string;
}

const TRACK_QUIZZES: Record<string, MiniQuizItem[]> = {
  python_basics: [
    {
      code: 'print("py" * 2 + "!")',
      options: ["pypy!", "py2!", "Error"],
      answerIdx: 0,
      why: "Strings repeat with * before + concatenates them: 'pypy' + '!'.",
    },
    {
      code: "len({1, 2, 2, 3})",
      options: ["3", "4", "2"],
      answerIdx: 0,
      why: "Curly braces create a set, automatically deduplicating 2 -> {1, 2, 3}.",
    },
    {
      code: "nums = [10, 20, 30]\nprint(nums[-1])",
      options: ["30", "10", "Error"],
      answerIdx: 0,
      why: "Negative index -1 grabs the very last element from the list cleanly.",
    },
    {
      code: "bool([])",
      options: ["False", "True", "None"],
      answerIdx: 0,
      why: "Empty collections ([], {}, '') evaluate to False in Python conditionals.",
    },
  ],
  algorithms: [
    {
      code: "Binary search max steps on 1,024 sorted items?",
      options: ["10 steps", "512 steps", "100 steps"],
      answerIdx: 0,
      why: "log2(1024) = 10 halving comparisons—why O(log n) scales effortlessly!",
    },
    {
      code: "Lookup average time for `key in my_dict`?",
      options: ["O(1)", "O(n)", "O(n log n)"],
      answerIdx: 0,
      why: "Python dictionaries hash keys directly to a bucket in constant O(1) time.",
    },
    {
      code: "Best structure to track `most recent undo action`?",
      options: ["Stack (LIFO)", "Queue (FIFO)", "Heap"],
      answerIdx: 0,
      why: "Stacks pop the last pushed state first (Last-In, First-Out).",
    },
  ],
  system_design: [
    {
      code: "Fastest place to serve hot read-heavy feed data?",
      options: ["In-Memory Cache (Redis)", "Cold Archive", "Primary Join"],
      answerIdx: 0,
      why: "In-memory caches respond in ~1ms vs disk queries taking 10–100ms+.",
    },
    {
      code: "Pattern to stop calling a failing downstream API?",
      options: ["Circuit Breaker", "Round Robin", "Sharding"],
      answerIdx: 0,
      why: "A Circuit Breaker trips open after repeated failures so your service fails fast.",
    },
    {
      code: "Best way to process heavy video uploads async?",
      options: ["Message Queue + Workers", "Block HTTP thread", "DNS TTL"],
      answerIdx: 0,
      why: "Enqueue the job and return 202 Accepted immediately while workers encode.",
    },
  ],
};

const TREAT_WHISPERS = [
  "🐟 CRUNCH! +15 PET XP",
  "♥ PURRS IN O(1)!",
  "⚡ SYNTAX FOCUS UP!",
  "★ HAPPY BYTE-CAT!",
];

const CYBER_WHISPERS = [
  "sudo purr --turbo",
  "01001101-EOW ⚡",
  "[O(1) SNACK CACHED]",
  "BYTE-OS // OVERDRIVE",
];

const HALO_CYCLE = ["#FFDE59", "#A3E635", "#6EE7B7", "#FF90E8", "#C4B5FD"];

type CompanionMode = "wisdom" | "snack" | "quiz" | "perks";
type IdleBreakAction = "sip" | "stretch" | "swat" | "jam" | null;

const IDLE_BREAK_ORDER: Exclude<IdleBreakAction, null>[] = [
  "sip",
  "stretch",
  "swat",
  "jam",
];

const IDLE_BREAK_META: Record<
  Exclude<IdleBreakAction, null>,
  { bubble: string; whisper: string }
> = {
  sip: { bubble: "☕ SIP... AHH!", whisper: "☕ SIPPING COFFEE..." },
  stretch: { bubble: "✨ BIIIG STRETCH!", whisper: "🙆‍♂️ BIG COZY STRETCH!" },
  swat: { bubble: "💥 BUG BOOPED!", whisper: "🪲 SWATTED A BUG!" },
  jam: { bubble: "✓ TESTS PASSED!", whisper: "🎧 CODE COMPILED JAM!" },
};

const KEYCAP_PALETTE = ["#FFDE59", "#6EE7B7", "#FF90E8", "#A3E635", "#38BDF8"];

const COZY_STAGE_CSS = `
  @keyframes bcHeadBob {
    0%, 100% { transform: translateY(0px) rotate(-1.6deg); }
    50% { transform: translateY(3.8px) rotate(1.8deg); }
  }
  @keyframes bcBodyBreathe {
    0%, 100% { transform: scaleY(1) scaleX(1); }
    50% { transform: scaleY(1.028) scaleX(0.985); }
  }
  @keyframes bcPawTapLeft {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    45% { transform: translateY(-7.5px) rotate(-9deg); }
    55% { transform: translateY(2.5px) rotate(4deg); }
  }
  @keyframes bcPawTapRight {
    0%, 100% { transform: translateY(2.5px) rotate(4deg); }
    45% { transform: translateY(0px) rotate(0deg); }
    90% { transform: translateY(-7.5px) rotate(9deg); }
  }
  @keyframes bcTailSway {
    0%, 100% { transform: rotate(-11deg); }
    50% { transform: rotate(15deg); }
  }
  @keyframes bcEarTwitchL {
    0%, 82%, 100% { transform: rotate(0deg); }
    88% { transform: rotate(-10deg); }
    94% { transform: rotate(4deg); }
  }
  @keyframes bcEarTwitchR {
    0%, 58%, 100% { transform: rotate(0deg); }
    64% { transform: rotate(9deg); }
    71% { transform: rotate(-3deg); }
  }
  @keyframes bcSteamRise {
    0% { transform: translateY(0px) translateX(0px) scale(0.85); opacity: 0; }
    35% { opacity: 0.85; }
    100% { transform: translateY(-20px) translateX(5px) scale(1.2); opacity: 0; }
  }
  @keyframes bcRainSlide {
    0% { transform: translateY(-18px) translateX(7px); opacity: 0; }
    25% { opacity: 0.75; }
    100% { transform: translateY(48px) translateX(-10px); opacity: 0; }
  }
  @keyframes bcNoteFloat {
    0% { transform: translateY(0px) translateX(0px) scale(0.75); opacity: 0; }
    25% { opacity: 0.95; }
    100% { transform: translateY(-26px) translateX(12px) scale(1.12); opacity: 0; }
  }
  @keyframes bcLampGlow {
    0%, 100% { opacity: 0.22; }
    50% { opacity: 0.34; }
  }
  @keyframes bcFairyTwinkle {
    0%, 100% { opacity: 0.45; transform: scale(0.88); }
    50% { opacity: 1; transform: scale(1.16); }
  }
  @keyframes bcLavaBlob {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-10px) scale(1.18); }
  }
  @keyframes bcSipHead {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25%, 75% { transform: translateY(-4px) rotate(8deg); }
  }
  @keyframes bcSipMugLift {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
    25%, 75% { transform: translate(42px, -38px) rotate(24deg); }
  }
  @keyframes bcSipPawLeft {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
    25%, 75% { transform: translate(8px, -34px) rotate(20deg); }
  }
  @keyframes bcStretchBody {
    0%, 100% { transform: scaleY(1) scaleX(1) translateY(0px); }
    30%, 70% { transform: scaleY(1.16) scaleX(0.92) translateY(-6px); }
  }
  @keyframes bcStretchHead {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    30%, 70% { transform: translateY(-10px) rotate(-4deg); }
  }
  @keyframes bcStretchPawL {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
    28%, 72% { transform: translate(-14px, -68px) rotate(-25deg); }
  }
  @keyframes bcStretchPawR {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
    28%, 72% { transform: translate(14px, -68px) rotate(25deg); }
  }
  @keyframes bcSwatHead {
    0%, 100% { transform: translateX(0px) rotate(0deg); }
    20%, 70% { transform: translateX(-8px) rotate(-7deg); }
  }
  @keyframes bcSwatPawL {
    0%, 100% { transform: translate(0px, 0px); }
    35% { transform: translate(-52px, -28px) scale(1.1); }
    50% { transform: translate(-46px, -18px) scale(0.95); }
    65% { transform: translate(-54px, -26px) scale(1.12); }
  }
  @keyframes bcBugFlyOff {
    0%, 40% { transform: translate(0px, 0px) scale(1); opacity: 1; }
    55% { transform: translate(-6px, -4px) scale(1.25); opacity: 1; }
    100% { transform: translate(-35px, -42px) rotate(-180deg) scale(0.2); opacity: 0; }
  }
  @keyframes bcJamHead {
    0%, 100% { transform: translateY(0px) rotate(-6deg); }
    25% { transform: translateY(-7px) rotate(6deg); }
    50% { transform: translateY(0px) rotate(-6deg); }
    75% { transform: translateY(-7px) rotate(6deg); }
  }
  @keyframes bcJamPawL {
    0%, 100% { transform: translateY(0px); }
    25%, 75% { transform: translate(-8px, -46px) rotate(-18deg); }
    50% { transform: translate(-4px, -24px) rotate(-8deg); }
  }
  @keyframes bcJamPawR {
    0%, 100% { transform: translateY(0px); }
    25%, 75% { transform: translate(8px, -46px) rotate(18deg); }
    50% { transform: translate(4px, -24px) rotate(8deg); }
  }

  .bc-cat-head { animation: bcHeadBob 1.35s ease-in-out infinite; transform-origin: 120px 104px; }
  .bc-cat-body { animation: bcBodyBreathe 1.8s ease-in-out infinite; transform-origin: 120px 142px; }
  .bc-paw-l { animation: bcPawTapLeft 0.33s ease-in-out infinite; transform-origin: 92px 138px; }
  .bc-paw-r { animation: bcPawTapRight 0.33s ease-in-out infinite; transform-origin: 148px 138px; }
  .bc-cat-tail { animation: bcTailSway 1.65s ease-in-out infinite; transform-origin: 72px 144px; }
  .bc-ear-l { animation: bcEarTwitchL 3.7s ease-in-out infinite; transform-origin: 92px 62px; }
  .bc-ear-r { animation: bcEarTwitchR 4.4s ease-in-out infinite; transform-origin: 148px 62px; }
  .bc-steam-1 { animation: bcSteamRise 2.3s ease-out infinite; }
  .bc-steam-2 { animation: bcSteamRise 2.3s ease-out 0.85s infinite; }
  .bc-rain-1 { animation: bcRainSlide 1.05s linear infinite; }
  .bc-rain-2 { animation: bcRainSlide 1.05s linear 0.35s infinite; }
  .bc-rain-3 { animation: bcRainSlide 1.05s linear 0.7s infinite; }
  .bc-rain-4 { animation: bcRainSlide 1.05s linear 0.52s infinite; }
  .bc-note-1 { animation: bcNoteFloat 2.3s ease-out infinite; }
  .bc-note-2 { animation: bcNoteFloat 2.3s ease-out 1.15s infinite; }
  .bc-lamp-cone { animation: bcLampGlow 2.4s ease-in-out infinite; }
  .bc-bulb-1 { animation: bcFairyTwinkle 1.8s ease-in-out infinite; transform-origin: center; }
  .bc-bulb-2 { animation: bcFairyTwinkle 2.2s ease-in-out 0.6s infinite; transform-origin: center; }
  .bc-bulb-3 { animation: bcFairyTwinkle 1.9s ease-in-out 1.1s infinite; transform-origin: center; }
  .bc-lava-bubble { animation: bcLavaBlob 1.9s ease-in-out infinite; transform-origin: 202px 125px; }

  .bc-state-sip .bc-cat-head { animation: bcSipHead 2.4s ease-in-out forwards; }
  .bc-state-sip .bc-mug-group { animation: bcSipMugLift 2.4s ease-in-out forwards; transform-origin: 57px 140px; }
  .bc-state-sip .bc-paw-l { animation: bcSipPawLeft 2.4s ease-in-out forwards; }
  .bc-state-sip .bc-paw-r { animation: none; }

  .bc-state-stretch .bc-cat-body { animation: bcStretchBody 2.4s ease-in-out forwards; }
  .bc-state-stretch .bc-cat-head { animation: bcStretchHead 2.4s ease-in-out forwards; }
  .bc-state-stretch .bc-paw-l { animation: bcStretchPawL 2.4s ease-in-out forwards; }
  .bc-state-stretch .bc-paw-r { animation: bcStretchPawR 2.4s ease-in-out forwards; }
  .bc-state-stretch .bc-cat-tail { animation-duration: 0.4s; }

  .bc-state-swat .bc-cat-head { animation: bcSwatHead 2.2s ease-in-out forwards; }
  .bc-state-swat .bc-paw-l { animation: bcSwatPawL 2.2s ease-in-out forwards; }
  .bc-state-swat .bc-screen-bug { animation: bcBugFlyOff 2.2s ease-in-out forwards; transform-origin: 36px 115px; }

  .bc-state-jam .bc-cat-head { animation: bcJamHead 2.4s ease-in-out forwards; }
  .bc-state-jam .bc-paw-l { animation: bcJamPawL 2.4s ease-in-out forwards; }
  .bc-state-jam .bc-paw-r { animation: bcJamPawR 2.4s ease-in-out forwards; }
  .bc-state-jam .bc-cat-tail { animation-duration: 0.45s; }
`;

function CozyCodingByteCatStage({
  idleBreak,
  isBlinking,
  hyperPurrActive,
  activeKeyStep,
}: {
  idleBreak: IdleBreakAction;
  isBlinking: boolean;
  hyperPurrActive: boolean;
  activeKeyStep: number;
}) {
  if (Platform.OS !== "web") {
    return (
      <Image
        source={BYTE_CAT_IMAGE}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    );
  }

  const effectiveAction: IdleBreakAction = hyperPurrActive ? "jam" : idleBreak;
  const stageClass = effectiveAction ? `bc-state-${effectiveAction}` : "";
  const getKeyFill = (idx: number) =>
    !effectiveAction && idx === activeKeyStep
      ? "#FFFFFF"
      : KEYCAP_PALETTE[(idx + activeKeyStep) % KEYCAP_PALETTE.length];

  const activeFace =
    effectiveAction === "sip"
      ? "sip"
      : effectiveAction === "stretch"
        ? "stretch"
        : effectiveAction === "swat"
          ? "swat"
          : effectiveAction === "jam"
            ? "jam"
            : isBlinking
              ? "sip"
              : "happy";

  const bubbleLabel = effectiveAction
    ? IDLE_BREAK_META[effectiveAction].bubble
    : null;

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "#171522" }}>
      <style>{COZY_STAGE_CSS}</style>
      <svg
        viewBox="0 0 240 190"
        className={stageClass}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <radialGradient id="bcWarmRoomGlow" cx="58%" cy="48%" r="58%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.24" />
            <stop offset="65%" stopColor="#F97316" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#171522" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bcDeskWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9A3412" />
            <stop offset="100%" stopColor="#5C1D0B" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="240" height="190" fill="url(#bcWarmRoomGlow)" />

        {/* 1. Rainy Night Window with Bokeh & Moon */}
        <g>
          <rect
            x="12"
            y="16"
            width="66"
            height="68"
            rx="10"
            fill="#0B1120"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <circle cx="25" cy="64" r="4.5" fill="#FBBF24" opacity="0.35" />
          <circle cx="36" cy="60" r="3.5" fill="#F472B6" opacity="0.35" />
          <circle cx="52" cy="66" r="5" fill="#FB923C" opacity="0.3" />
          <circle cx="64" cy="59" r="3.5" fill="#6EE7B7" opacity="0.3" />
          <circle cx="60" cy="30" r="8" fill="#FFDE59" />
          <circle cx="63.5" cy="27.5" r="7" fill="#0B1120" />
          <line
            x1="28"
            y1="26"
            x2="21"
            y2="40"
            stroke="#7DD3FC"
            strokeWidth="2"
            strokeLinecap="round"
            className="bc-rain-1"
          />
          <line
            x1="44"
            y1="22"
            x2="37"
            y2="36"
            stroke="#7DD3FC"
            strokeWidth="2"
            strokeLinecap="round"
            className="bc-rain-2"
          />
          <line
            x1="62"
            y1="30"
            x2="55"
            y2="44"
            stroke="#7DD3FC"
            strokeWidth="2"
            strokeLinecap="round"
            className="bc-rain-3"
          />
          <line
            x1="35"
            y1="36"
            x2="28"
            y2="50"
            stroke="#BAE6FD"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="bc-rain-4"
          />
          <line
            x1="45"
            y1="16"
            x2="45"
            y2="84"
            stroke="#111111"
            strokeWidth="2.2"
          />
          <line
            x1="12"
            y1="50"
            x2="78"
            y2="50"
            stroke="#111111"
            strokeWidth="2.2"
          />
          <rect
            x="9"
            y="81"
            width="72"
            height="6"
            rx="2"
            fill="#92400E"
            stroke="#111111"
            strokeWidth="2"
          />
        </g>

        {/* 2. Wooden Bookshelf & Trailing Ivy */}
        <g>
          <rect
            x="150"
            y="42"
            width="76"
            height="5.5"
            rx="2"
            fill="#92400E"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect
            x="155"
            y="24"
            width="9"
            height="18"
            rx="1.5"
            fill="#FF90E8"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect
            x="165"
            y="27"
            width="8"
            height="15"
            rx="1.5"
            fill="#FFDE59"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect
            x="174"
            y="22"
            width="10"
            height="20"
            rx="1.5"
            fill="#C4B5FD"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect
            x="198"
            y="28"
            width="16"
            height="14"
            rx="3"
            fill="#EA580C"
            stroke="#111111"
            strokeWidth="2"
          />
          <ellipse
            cx="201"
            cy="25"
            rx="6"
            ry="4"
            fill="#4ADE80"
            stroke="#111111"
            strokeWidth="1.8"
          />
          <ellipse
            cx="211"
            cy="26"
            rx="6"
            ry="4"
            fill="#22C55E"
            stroke="#111111"
            strokeWidth="1.8"
          />
          <path
            d="M212 36 Q220 48 215 60"
            fill="none"
            stroke="#22C55E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="216"
            cy="54"
            r="3.5"
            fill="#4ADE80"
            stroke="#111111"
            strokeWidth="1.5"
          />
        </g>

        {/* 3. Twinkling Fairy String Lights */}
        <g>
          <path
            d="M6 8 Q70 22 135 10 Q188 22 234 7"
            fill="none"
            stroke="#111111"
            strokeWidth="2"
          />
          <circle cx="34" cy="13" r="4" fill="#FFDE59" className="bc-bulb-1" />
          <circle cx="72" cy="16" r="4" fill="#FDBA74" className="bc-bulb-2" />
          <circle cx="108" cy="13" r="4" fill="#FF90E8" className="bc-bulb-3" />
          <circle cx="144" cy="12" r="4" fill="#FFDE59" className="bc-bulb-1" />
          <circle cx="182" cy="16" r="4" fill="#6EE7B7" className="bc-bulb-2" />
          <circle cx="216" cy="11" r="4" fill="#FDBA74" className="bc-bulb-3" />
        </g>

        {/* 4. Brass Desk Lamp & Golden Light Cone */}
        <g>
          <polygon
            points="196,58 140,148 236,148"
            fill="#FFDE59"
            className="bc-lamp-cone"
          />
          <path
            d="M214 146 L224 68 L198 56"
            fill="none"
            stroke="#111111"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M184 62 Q196 44 210 58 Z"
            fill="#F59E0B"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <circle cx="197" cy="61" r="3.5" fill="#FEF08A" />
        </g>

        {/* 5. Side Code Monitor (+ Crawling Bug during Swat Event) */}
        <g>
          <rect
            x="12"
            y="96"
            width="48"
            height="38"
            rx="5"
            fill="#0F172A"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <rect
            x="30"
            y="134"
            width="12"
            height="12"
            fill="#334155"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect x="18" y="103" width="22" height="3.5" rx="1.5" fill="#FF90E8" />
          <rect x="18" y="110" width="32" height="3.5" rx="1.5" fill="#6EE7B7" />
          <rect x="22" y="117" width="24" height="3.5" rx="1.5" fill="#FFDE59" />
          <rect x="18" y="124" width="16" height="3.5" rx="1.5" fill="#A3E635" />
          {effectiveAction === "swat" && (
            <g className="bc-screen-bug">
              <circle
                cx="38"
                cy="114"
                r="6"
                fill="#A3E635"
                stroke="#111111"
                strokeWidth="2"
              />
              <circle cx="36" cy="112" r="1.5" fill="#111111" />
              <circle cx="40" cy="112" r="1.5" fill="#111111" />
            </g>
          )}
        </g>

        {/* Floating Lo-Fi Notes */}
        <text
          x="166"
          y="64"
          fontSize="14"
          fontWeight="900"
          fill="#FFDE59"
          className="bc-note-1"
        >
          ♪
        </text>
        <text
          x="68"
          y="56"
          fontSize="13"
          fontWeight="900"
          fill="#FF90E8"
          className="bc-note-2"
        >
          ♫
        </text>

        {/* 6. ANIMATED BYTE-CAT RIG */}
        <g className="bc-cat-tail">
          <path
            d="M74 140 Q42 132 46 102"
            fill="none"
            stroke="#111111"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M74 140 Q42 132 46 102"
            fill="none"
            stroke="#F5EEDB"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <circle cx="48" cy="114" r="3" fill="#FFDE59" />
        </g>

        <g className="bc-cat-body">
          <rect
            x="72"
            y="90"
            width="96"
            height="56"
            rx="27"
            fill="#F5EEDB"
            stroke="#111111"
            strokeWidth="3"
          />
          <path
            d="M94 122 Q120 128 146 122"
            fill="none"
            stroke="#D6CCB8"
            strokeWidth="2"
          />
        </g>

        <g className="bc-cat-head">
          <path
            d="M68 82 A52 50 0 0 1 172 82"
            fill="none"
            stroke="#111111"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M68 82 A52 50 0 0 1 172 82"
            fill="none"
            stroke="#FFDE59"
            strokeWidth="6.5"
            strokeLinecap="round"
          />

          <g className="bc-ear-l">
            <polygon
              points="76,68 86,32 110,54"
              fill="#F5EEDB"
              stroke="#111111"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <polygon points="83,62 89,40 103,54" fill="#FF90E8" />
          </g>
          <g className="bc-ear-r">
            <polygon
              points="164,68 154,32 130,54"
              fill="#F5EEDB"
              stroke="#111111"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <polygon points="157,62 151,40 137,54" fill="#6EE7B7" />
          </g>

          <rect
            x="70"
            y="48"
            width="100"
            height="66"
            rx="31"
            fill="#F5EEDB"
            stroke="#111111"
            strokeWidth="3"
          />
          <rect
            x="57"
            y="66"
            width="17"
            height="34"
            rx="7.5"
            fill="#FFDE59"
            stroke="#111111"
            strokeWidth="3"
          />
          <rect
            x="166"
            y="66"
            width="17"
            height="34"
            rx="7.5"
            fill="#FFDE59"
            stroke="#111111"
            strokeWidth="3"
          />

          {/* Dark CRT Screen */}
          <rect
            x="82"
            y="59"
            width="76"
            height="44"
            rx="17"
            fill="#232936"
            stroke="#111111"
            strokeWidth="3"
          />
          <ellipse cx="97" cy="66" rx="6.5" ry="2" fill="#64748B" opacity="0.45" />

          {/* Rosy Cozy Blush */}
          <ellipse cx="91" cy="86" rx="5.5" ry="3" fill="#FB7185" opacity="0.75" />
          <ellipse cx="149" cy="86" rx="5.5" ry="3" fill="#FB7185" opacity="0.75" />

          {activeFace === "happy" && (
            <g>
              <path
                d="M93 80 Q100 70 107 80"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <path
                d="M133 80 Q140 70 147 80"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <path
                d="M114 85 Q117 89 120 85 Q123 89 126 85"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </g>
          )}

          {activeFace === "sip" && (
            <g>
              <path
                d="M92 78 Q99 83 107 78"
                fill="none"
                stroke="#FFDE59"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M133 78 Q140 83 148 78"
                fill="none"
                stroke="#FFDE59"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="120" cy="86" r="3" fill="#FF90E8" />
            </g>
          )}

          {activeFace === "stretch" && (
            <g>
              <polyline
                points="92,73 104,78 92,83"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="148,73 136,78 148,83"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ellipse
                cx="120"
                cy="86"
                rx="6"
                ry="7.5"
                fill="#FF90E8"
                stroke="#6EE7B7"
                strokeWidth="2"
              />
            </g>
          )}

          {activeFace === "swat" && (
            <g>
              <circle cx="95" cy="77" r="4.5" fill="#A3E635" />
              <circle cx="135" cy="77" r="4.5" fill="#A3E635" />
              <path
                d="M114 86 Q120 82 126 86"
                fill="none"
                stroke="#A3E635"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}

          {activeFace === "jam" && (
            <g>
              <text x="91" y="83" fontSize="14" fontWeight="900" fill="#FFDE59">
                ★
              </text>
              <text x="133" y="83" fontSize="14" fontWeight="900" fill="#FFDE59">
                ★
              </text>
              <path
                d="M111 83 Q120 93 129 83"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}
        </g>

        {/* Option D (Level 3 Perk): Cozy Neon Lava Lamp */}
        <g>
          <polygon
            points="194,142 210,142 206,102 198,102"
            fill="#312E81"
            stroke="#111111"
            strokeWidth="2.4"
          />
          <circle
            cx="202"
            cy="128"
            r="4.8"
            fill="#FF90E8"
            className="bc-lava-bubble"
          />
          <circle cx="202" cy="114" r="3.2" fill="#6EE7B7" />
          <polygon
            points="192,146 212,146 209,138 195,138"
            fill="#C4B5FD"
            stroke="#111111"
            strokeWidth="2.2"
          />
        </g>

        {/* 7. Warm Wooden Desk & Keyboard */}
        <rect
          x="4"
          y="144"
          width="232"
          height="42"
          rx="6"
          fill="url(#bcDeskWood)"
          stroke="#111111"
          strokeWidth="2.5"
        />
        <rect
          x="10"
          y="148"
          width="220"
          height="5"
          rx="2"
          fill="#B45309"
          opacity="0.65"
        />

        <rect
          x="78"
          y="136"
          width="84"
          height="15"
          rx="4.5"
          fill="#1E293B"
          stroke="#111111"
          strokeWidth="2.5"
        />
        <rect x="84" y="140" width="13" height="6" rx="1.5" fill={getKeyFill(0)} />
        <rect x="100" y="140" width="14" height="6" rx="1.5" fill={getKeyFill(1)} />
        <rect x="117" y="140" width="22" height="6" rx="1.5" fill={getKeyFill(2)} />
        <rect x="142" y="140" width="13" height="6" rx="1.5" fill={getKeyFill(3)} />

        {/* Steaming Paw-Mug (Lifts during Coffee Sip!) */}
        <g className="bc-mug-group">
          <path
            d="M54 126 Q57 117 52 110"
            fill="none"
            stroke="#F4F0E6"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="bc-steam-1"
          />
          <path
            d="M62 126 Q65 117 60 110"
            fill="none"
            stroke="#F4F0E6"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="bc-steam-2"
          />
          <rect
            x="46"
            y="130"
            width="22"
            height="20"
            rx="5"
            fill="#F43F5E"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <path
            d="M68 135 H73 A4.5 4.5 0 0 1 73 145 H68"
            fill="none"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <circle cx="57" cy="141" r="3" fill="#FFDE59" />
        </g>

        {/* Paws Rendered Over Keyboard & Mug */}
        <g className="bc-paw-l">
          <ellipse
            cx="92"
            cy="136"
            rx="12"
            ry="9"
            fill="#F5EEDB"
            stroke="#111111"
            strokeWidth="3"
          />
        </g>
        <g className="bc-paw-r">
          <ellipse
            cx="148"
            cy="136"
            rx="12"
            ry="9"
            fill="#F5EEDB"
            stroke="#111111"
            strokeWidth="3"
          />
        </g>

        {/* Floating Break Speech Pill */}
        {bubbleLabel && (
          <g>
            <rect
              x="58"
              y="14"
              width="124"
              height="22"
              rx="11"
              fill="#FFDE59"
              stroke="#111111"
              strokeWidth="2.2"
            />
            <text
              x="120"
              y="29"
              textAnchor="middle"
              fontSize="12"
              fontWeight="900"
              fill="#111111"
            >
              {bubbleLabel}
            </text>
          </g>
        )}
      </svg>
    </View>
  );
}

interface ByteCatGuideCardProps {
  completedCount: number;
  totalCount: number;
  activeTrack?: string;
  activeTrackLabel: string;
  activeTrackAccent?: string;
  isPremium?: boolean;
  onOpenPaywall?: () => void;
  nextLessonTitle?: string;
  onPressNextLesson?: () => void;
}

export default function ByteCatGuideCard({
  completedCount,
  totalCount,
  activeTrack = "python_basics",
  activeTrackLabel,
  activeTrackAccent = StudioColors.yellow,
  isPremium = false,
  onOpenPaywall,
  nextLessonTitle,
  onPressNextLesson,
}: ByteCatGuideCardProps) {
  const styles = getStyles();

  const [mode, setMode] = useState<CompanionMode>("wisdom");
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [savedQuoteIds, setSavedQuoteIds] = useState<number[]>([]);
  const [quoteFilter, setQuoteFilter] = useState<"all" | "saved">("all");
  const [quoteVibeCount, setQuoteVibeCount] = useState<number>(0);
  const [snackIndex, setSnackIndex] = useState<number>(0);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizSelection, setQuizSelection] = useState<{
    key: string;
    optionIdx: number;
  } | null>(null);
  const [quizSolvedCount, setQuizSolvedCount] = useState<number>(0);

  const [petXp, setPetXp] = useState<number>(0);
  const [treatsGiven, setTreatsGiven] = useState<number>(0);
  const [lastTreatDate, setLastTreatDate] = useState<string | null>(null);
  const [todayKey, setTodayKey] = useState<string>("");
  const [haloIdx, setHaloIdx] = useState<number>(0);
  const [whisperText, setWhisperText] = useState<string>("⌨️ CODING IN THE ZONE");
  const [hyperPurrActive, setHyperPurrActive] = useState<boolean>(false);
  const [idleBreakAction, setIdleBreakAction] = useState<IdleBreakAction>(null);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [activeKeyStep, setActiveKeyStep] = useState<number>(0);
  const [avatarHovered, setAvatarHovered] = useState<boolean>(false);
  const [cardHovered, setCardHovered] = useState<boolean>(false);
  const [appStateValue, setAppStateValue] = useState<string>(
    AppState.currentState || "active",
  );

  // Floating popup labels (4 recycled animated slots so bursts animate smoothly)
  const [popupLabels, setPopupLabels] = useState<
    [string, string, string, string]
  >(["", "", "", ""]);
  const [popupAnims] = useState(() => [
    { y: new Animated.Value(0), op: new Animated.Value(0), sc: new Animated.Value(0.7) },
    { y: new Animated.Value(0), op: new Animated.Value(0), sc: new Animated.Value(0.7) },
    { y: new Animated.Value(0), op: new Animated.Value(0), sc: new Animated.Value(0.7) },
    { y: new Animated.Value(0), op: new Animated.Value(0), sc: new Animated.Value(0.7) },
  ]);
  const nextPopupSlotRef = useRef<number>(0);
  const hyperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breakStepRef = useRef<number>(0);
  const breakResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stage animations
  const [wiggleAnim] = useState(() => new Animated.Value(0));
  const [squishXAnim] = useState(() => new Animated.Value(1));
  const [squishYAnim] = useState(() => new Animated.Value(1));
  const [hoverScaleAnim] = useState(() => new Animated.Value(1));
  const [cardLiftAnim] = useState(() => new Animated.Value(0));
  const [haloPulseAnim] = useState(() => new Animated.Value(0));
  const [ringWaveAnim] = useState(() => new Animated.Value(0));
  const [ledPulseAnim] = useState(() => new Animated.Value(0));
  const [sparkleAnim] = useState(() => new Animated.Value(0));
  const [eqAnim1] = useState(() => new Animated.Value(0.35));
  const [eqAnim2] = useState(() => new Animated.Value(0.75));
  const [eqAnim3] = useState(() => new Animated.Value(0.5));
  const [contentFadeAnim] = useState(() => new Animated.Value(1));
  const [contentSlideAnim] = useState(() => new Animated.Value(0));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [petBarAnim] = useState(() => new Animated.Value(8));

  const petProgress = isPremium
    ? getPetLevelProgress(petXp)
    : getPetLevelProgress(0);
  const petLevel = petProgress.level;
  const activeTier = petProgress.tier;
  const treatedToday = Boolean(isPremium && todayKey && lastTreatDate === todayKey);

  const trackPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Halo pulse, expanding outer wave ring, LED pulse, and sparkles
  useEffect(() => {
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulseAnim, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(haloPulseAnim, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );

    const ringWaveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringWaveAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(ringWaveAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    );

    const ledLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ledPulseAnim, {
          toValue: 1,
          duration: 950,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(ledPulseAnim, {
          toValue: 0,
          duration: 950,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    haloLoop.start();
    ringWaveLoop.start();
    ledLoop.start();
    sparkleLoop.start();

    return () => {
      haloLoop.stop();
      ringWaveLoop.stop();
      ledLoop.stop();
      sparkleLoop.stop();
    };
  }, [haloPulseAnim, ledPulseAnim, ringWaveAnim, sparkleAnim]);

  // Mini equalizer waveform loop (speeds up in Hyper Purr or Level 3+ Cyber Whisker)
  useEffect(() => {
    const fastWave = hyperPurrActive || petLevel >= 3;
    const speed = hyperPurrActive ? 170 : fastWave ? 260 : 420;
    const eqLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(eqAnim1, {
            toValue: fastWave ? 1 : 0.85,
            duration: speed,
            useNativeDriver: false,
          }),
          Animated.timing(eqAnim1, {
            toValue: 0.28,
            duration: speed,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(eqAnim2, {
            toValue: 0.3,
            duration: speed * 0.85,
            useNativeDriver: false,
          }),
          Animated.timing(eqAnim2, {
            toValue: 1,
            duration: speed * 0.85,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(eqAnim3, {
            toValue: fastWave ? 0.95 : 0.78,
            duration: speed * 1.1,
            useNativeDriver: false,
          }),
          Animated.timing(eqAnim3, {
            toValue: 0.25,
            duration: speed * 1.1,
            useNativeDriver: false,
          }),
        ]),
      ]),
    );
    eqLoop.start();
    return () => eqLoop.stop();
  }, [eqAnim1, eqAnim2, eqAnim3, hyperPurrActive, petLevel]);

  // Avatar & card hover springs
  useEffect(() => {
    Animated.spring(hoverScaleAnim, {
      toValue: avatarHovered ? 1.07 : 1,
      friction: 5,
      tension: 180,
      useNativeDriver: false,
    }).start();
  }, [avatarHovered, hoverScaleAnim]);

  useEffect(() => {
    Animated.spring(cardLiftAnim, {
      toValue: cardHovered ? -3 : 0,
      friction: 7,
      tension: 180,
      useNativeDriver: false,
    }).start();
  }, [cardHovered, cardLiftAnim]);

  // Animated progress & pet XP bar glides
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.max(trackPct, 4),
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, trackPct]);

  useEffect(() => {
    Animated.timing(petBarAnim, {
      toValue: petProgress.pctInLevel,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [petBarAnim, petProgress.pctInLevel]);

  const triggerIdleBreak = useCallback(
    (action?: Exclude<IdleBreakAction, null>) => {
      const chosen =
        action ||
        IDLE_BREAK_ORDER[breakStepRef.current % IDLE_BREAK_ORDER.length];
      breakStepRef.current += 1;

      if (breakResetTimerRef.current) {
        clearTimeout(breakResetTimerRef.current);
      }
      setIdleBreakAction(chosen);
      setWhisperText(IDLE_BREAK_META[chosen].whisper);

      breakResetTimerRef.current = setTimeout(() => {
        setIdleBreakAction(null);
        setWhisperText("⌨️ CODING IN THE ZONE");
      }, 2400);
    },
    [],
  );

  // Automatic 10-second loop cycling Coffee Sip -> Big Stretch -> Bug Swat -> Eureka Jam
  useEffect(() => {
    const breakInterval = setInterval(() => {
      triggerIdleBreak();
    }, 10000);

    return () => {
      clearInterval(breakInterval);
      if (breakResetTimerRef.current) clearTimeout(breakResetTimerRef.current);
    };
  }, [triggerIdleBreak]);

  // Natural eye blink & mechanical keycap lighting cycle while coding
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
      }, 150);
    }, 3200);

    const keyInterval = setInterval(() => {
      setActiveKeyStep((prev) => (prev + 1) % 4);
    }, 240);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(keyInterval);
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hyperTimerRef.current) clearTimeout(hyperTimerRef.current);
    };
  }, []);

  const triggerContentTransition = useCallback(() => {
    contentFadeAnim.setValue(0.25);
    contentSlideAnim.setValue(8);
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 210,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.spring(contentSlideAnim, {
        toValue: 0,
        friction: 7,
        tension: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [contentFadeAnim, contentSlideAnim]);

  const spawnFloatingPopup = useCallback(
    (label: string, delayMs = 0) => {
      const slotIdx = nextPopupSlotRef.current % 4;
      nextPopupSlotRef.current += 1;

      setPopupLabels((prev) => {
        const next: [string, string, string, string] = [...prev] as [
          string,
          string,
          string,
          string,
        ];
        next[slotIdx] = label;
        return next;
      });

      const slot = popupAnims[slotIdx];
      slot.y.setValue(0);
      slot.op.setValue(delayMs > 0 ? 0 : 1);
      slot.sc.setValue(0.65);

      const startSequence = Animated.parallel([
        Animated.timing(slot.y, {
          toValue: -38,
          duration: 820,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.spring(slot.sc, {
            toValue: 1.08,
            friction: 5,
            tension: 200,
            useNativeDriver: false,
          }),
          Animated.timing(slot.sc, {
            toValue: 0.95,
            duration: 420,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(slot.op, {
            toValue: 1,
            duration: 90,
            useNativeDriver: false,
          }),
          Animated.delay(220),
          Animated.timing(slot.op, {
            toValue: 0,
            duration: 510,
            useNativeDriver: false,
          }),
        ]),
      ]);

      if (delayMs > 0) {
        Animated.sequence([Animated.delay(delayMs), startSequence]).start();
      } else {
        startSequence.start();
      }
    },
    [popupAnims],
  );

  const triggerPlayfulBounce = useCallback(
    (strong = false) => {
      squishXAnim.setValue(strong ? 1.18 : 1.11);
      squishYAnim.setValue(strong ? 0.84 : 0.9);
      wiggleAnim.setValue(0);

      Animated.parallel([
        Animated.spring(squishXAnim, {
          toValue: 1,
          friction: 4,
          tension: 190,
          useNativeDriver: false,
        }),
        Animated.spring(squishYAnim, {
          toValue: 1,
          friction: 4,
          tension: 190,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(wiggleAnim, {
            toValue: strong ? 1.5 : 1,
            duration: 65,
            useNativeDriver: false,
          }),
          Animated.timing(wiggleAnim, {
            toValue: strong ? -1.5 : -1,
            duration: 80,
            useNativeDriver: false,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0.7,
            duration: 75,
            useNativeDriver: false,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0,
            duration: 80,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    },
    [squishXAnim, squishYAnim, wiggleAnim],
  );

  const triggerHeadShake = useCallback(() => {
    wiggleAnim.setValue(0);
    Animated.sequence([
      Animated.timing(wiggleAnim, {
        toValue: -1.3,
        duration: 60,
        useNativeDriver: false,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 1.3,
        duration: 70,
        useNativeDriver: false,
      }),
      Animated.timing(wiggleAnim, {
        toValue: -0.8,
        duration: 65,
        useNativeDriver: false,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 0,
        duration: 65,
        useNativeDriver: false,
      }),
    ]).start();
  }, [wiggleAnim]);

  const advanceToFreshQuote = useCallback(
    (playAudio = false) => {
      if (playAudio) {
        playKeyClick();
        triggerPlayfulBounce(false);
        triggerContentTransition();
      }
      setQuoteIndex((prev) => {
        const offset =
          1 + Math.floor(Math.random() * (BYTE_CAT_QUOTES.length - 1));
        const nextIdx = (prev + offset) % BYTE_CAT_QUOTES.length;
        writeLocalJson(STORAGE_BYTECAT_QUOTE_KEY, {
          lastIndex: nextIdx,
          updatedAt: Date.now(),
        });
        return nextIdx;
      });
    },
    [triggerContentTransition, triggerPlayfulBounce],
  );

  // On mount: load persisted quote state & Pro Pet XP state asynchronously
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedQuote = readLocalJson<{ lastIndex?: number }>(
        STORAGE_BYTECAT_QUOTE_KEY,
        {},
      );
      const prevIdx =
        typeof savedQuote.lastIndex === "number" ? savedQuote.lastIndex : -1;
      const nextIdx = (prevIdx + 1) % BYTE_CAT_QUOTES.length;
      setQuoteIndex(nextIdx);
      writeLocalJson(STORAGE_BYTECAT_QUOTE_KEY, {
        lastIndex: nextIdx,
        updatedAt: Date.now(),
      });

      const savedPrefs = readLocalJson<{
        savedIds?: number[];
        vibeCount?: number;
      }>(STORAGE_BYTECAT_QUOTE_PREFS_KEY, {});
      if (Array.isArray(savedPrefs.savedIds)) {
        setSavedQuoteIds(
          savedPrefs.savedIds.filter((id) => typeof id === "number"),
        );
      }
      if (typeof savedPrefs.vibeCount === "number" && savedPrefs.vibeCount > 0) {
        setQuoteVibeCount(savedPrefs.vibeCount);
      }

      const currentDayKey = getTodayDateKey();
      setTodayKey(currentDayKey);

      const savedPet = readLocalJson<{
        petXp?: number;
        treatsGiven?: number;
        lastTreatDate?: string;
      }>(STORAGE_BYTECAT_PET_KEY, {});
      if (typeof savedPet.petXp === "number" && savedPet.petXp > 0) {
        setPetXp(savedPet.petXp);
      }
      if (typeof savedPet.treatsGiven === "number" && savedPet.treatsGiven > 0) {
        setTreatsGiven(savedPet.treatsGiven);
      }
      if (typeof savedPet.lastTreatDate === "string" && savedPet.lastTreatDate) {
        setLastTreatDate(savedPet.lastTreatDate);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Refresh quote & daily treat day check on tab / app foregrounding
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          setTodayKey(getTodayDateKey());
          advanceToFreshQuote(false);
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    }

    const sub = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateValue.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        setTodayKey(getTodayDateKey());
        advanceToFreshQuote(false);
      }
      setAppStateValue(nextAppState);
    });

    return () => {
      sub.remove();
    };
  }, [advanceToFreshQuote, appStateValue]);

  const snacks = TRACK_SNACKS[activeTrack] || TRACK_SNACKS.python_basics;
  const quizzes = TRACK_QUIZZES[activeTrack] || TRACK_QUIZZES.python_basics;
  const savedQuotes = BYTE_CAT_QUOTES.filter((q) =>
    savedQuoteIds.includes(q.id),
  );
  const usingSavedFilter = quoteFilter === "saved" && savedQuotes.length > 0;
  const activeQuotePool = usingSavedFilter ? savedQuotes : BYTE_CAT_QUOTES;
  const rawQuote = BYTE_CAT_QUOTES[quoteIndex] || BYTE_CAT_QUOTES[0];
  const currentQuote = usingSavedFilter
    ? savedQuotes.find((q) => q.id === rawQuote.id) || savedQuotes[0]
    : rawQuote;
  const isCurrentQuoteSaved = savedQuoteIds.includes(currentQuote.id);
  const activePoolIdx = Math.max(
    0,
    activeQuotePool.findIndex((q) => q.id === currentQuote.id),
  );
  const currentSnack = snacks[snackIndex % snacks.length];
  const safeQuizIdx = quizIndex % quizzes.length;
  const currentQuiz = quizzes[safeQuizIdx];
  const currentQuizKey = `${activeTrack}-${safeQuizIdx}`;
  const selectedQuizOpt =
    quizSelection?.key === currentQuizKey ? quizSelection.optionIdx : null;

  function stepQuote(direction: -1 | 1) {
    playKeyClick();
    triggerPlayfulBounce(false);
    triggerContentTransition();
    const nextPoolIdx =
      (activePoolIdx + direction + activeQuotePool.length) %
      activeQuotePool.length;
    const nextQuote = activeQuotePool[nextPoolIdx] || BYTE_CAT_QUOTES[0];
    const nextGlobalIdx = Math.max(
      0,
      BYTE_CAT_QUOTES.findIndex((q) => q.id === nextQuote.id),
    );
    setQuoteIndex(nextGlobalIdx);
    writeLocalJson(STORAGE_BYTECAT_QUOTE_KEY, {
      lastIndex: nextGlobalIdx,
      updatedAt: Date.now(),
    });
    setWhisperText(direction > 0 ? "▶ NEXT QUOTE!" : "◀ PREV QUOTE!");
  }

  function handleToggleSaveQuote() {
    const exists = savedQuoteIds.includes(currentQuote.id);
    const nextSaved = exists
      ? savedQuoteIds.filter((id) => id !== currentQuote.id)
      : [...savedQuoteIds, currentQuote.id];
    setSavedQuoteIds(nextSaved);
    if (exists && quoteFilter === "saved" && nextSaved.length === 0) {
      setQuoteFilter("all");
    }
    writeLocalJson(STORAGE_BYTECAT_QUOTE_PREFS_KEY, {
      savedIds: nextSaved,
      vibeCount: quoteVibeCount,
    });
    if (exists) {
      playKeyClick();
      setWhisperText("☆ REMOVED PIN");
      spawnFloatingPopup("QUOTE UNSAVED");
    } else {
      playSuccessChime();
      triggerPlayfulBounce(false);
      setWhisperText("★ QUOTE PINNED!");
      spawnFloatingPopup("★ SAVED TO FAVS");
    }
  }

  function handleToggleQuoteFilter() {
    playKeyClick();
    triggerContentTransition();
    if (quoteFilter === "saved") {
      setQuoteFilter("all");
      setWhisperText(`📚 ALL ${BYTE_CAT_QUOTES.length} QUOTES`);
      return;
    }
    if (savedQuotes.length === 0) return;
    setQuoteFilter("saved");
    const firstSavedGlobalIdx = Math.max(
      0,
      BYTE_CAT_QUOTES.findIndex((q) => q.id === savedQuotes[0].id),
    );
    setQuoteIndex(firstSavedGlobalIdx);
    setWhisperText(`★ ${savedQuotes.length} SAVED`);
  }

  function handleVibeQuote() {
    const nextCount = quoteVibeCount + 1;
    setQuoteVibeCount(nextCount);
    writeLocalJson(STORAGE_BYTECAT_QUOTE_PREFS_KEY, {
      savedIds: savedQuoteIds,
      vibeCount: nextCount,
    });
    playKeyClick();
    triggerPlayfulBounce(false);
    setWhisperText("🐾 PURR-APPROVED!");
    spawnFloatingPopup("🐾 +1 VIBE");
  }

  function activateHyperPurr(durationMs = 1800) {
    setHyperPurrActive(true);
    if (hyperTimerRef.current) clearTimeout(hyperTimerRef.current);
    hyperTimerRef.current = setTimeout(() => {
      setHyperPurrActive(false);
    }, durationMs);
  }

  function handleTreatPet() {
    if (!isPremium) {
      playKeyClick();
      triggerHeadShake();
      setWhisperText("🔒 PRO PET FEATURE!");
      spawnFloatingPopup("🔒 PRO ONLY");
      onOpenPaywall?.();
      return;
    }

    const currentDayKey = getTodayDateKey();
    if (currentDayKey !== todayKey) {
      setTodayKey(currentDayKey);
    }

    if (lastTreatDate === currentDayKey) {
      const hoursLeft = getHoursUntilMidnight();
      playKeyClick();
      triggerPlayfulBounce(false);
      setWhisperText("🐟 FULL UNTIL TOMORROW!");
      spawnFloatingPopup(`✓ NEXT IN ~${hoursLeft}H`);
      return;
    }

    const nextXp = petXp + TREAT_XP_AMOUNT;
    const nextTreats = treatsGiven + 1;
    const prevLevel = getPetLevelProgress(petXp).level;
    const nextProgress = getPetLevelProgress(nextXp);
    const leveledUp = nextProgress.level > prevLevel;

    setPetXp(nextXp);
    setTreatsGiven(nextTreats);
    setLastTreatDate(currentDayKey);
    writeLocalJson(STORAGE_BYTECAT_PET_KEY, {
      petXp: nextXp,
      treatsGiven: nextTreats,
      lastTreatDate: currentDayKey,
    });

    if (nextProgress.level >= 2) {
      setHaloIdx((h) => (h + 1) % HALO_CYCLE.length);
    }

    if (leveledUp) {
      playVictoryFanfare();
      triggerPlayfulBounce(true);
      activateHyperPurr(2600);
      setWhisperText(
        `🎉 LVL ${nextProgress.level}: ${nextProgress.tier.perkTitle.toUpperCase()}!`,
      );
      spawnFloatingPopup(`★ LEVEL ${nextProgress.level}!`);
      spawnFloatingPopup(
        `${nextProgress.tier.icon} ${nextProgress.tier.perkTitle.toUpperCase()}`,
        120,
      );
    } else {
      playSuccessChime();
      triggerPlayfulBounce(true);
      activateHyperPurr(1800);
      const whisperPool =
        nextProgress.level >= 3 ? CYBER_WHISPERS : TREAT_WHISPERS;
      setWhisperText(whisperPool[(nextTreats - 1) % whisperPool.length]);
      spawnFloatingPopup(`🐟 +${TREAT_XP_AMOUNT} PET XP`);
      if (nextProgress.level >= 4) {
        spawnFloatingPopup("🪲 CRUNCH BURST!", 110);
      }
    }
  }

  function handleTapAvatarPortrait() {
    if (isPremium) {
      const currentDayKey = getTodayDateKey();
      if (currentDayKey !== todayKey) {
        setTodayKey(currentDayKey);
      }
      if (lastTreatDate === currentDayKey) {
        playKeyClick();
        triggerPlayfulBounce(false);
        triggerIdleBreak();
        return;
      }
      handleTreatPet();
      return;
    }
    playKeyClick();
    triggerPlayfulBounce(false);
    triggerIdleBreak();
  }

  function handleShuffleActiveMode() {
    playKeyClick();
    triggerPlayfulBounce(false);
    triggerContentTransition();
    if (petLevel >= 2) {
      setHaloIdx((h) => (h + 1) % HALO_CYCLE.length);
    }

    if (mode === "wisdom" || mode === "perks") {
      if (mode === "perks") setMode("wisdom");
      if (usingSavedFilter && activeQuotePool.length > 1) {
        const offset =
          1 + Math.floor(Math.random() * (activeQuotePool.length - 1));
        const nextSaved =
          activeQuotePool[(activePoolIdx + offset) % activeQuotePool.length];
        const nextGlobal = Math.max(
          0,
          BYTE_CAT_QUOTES.findIndex((q) => q.id === nextSaved.id),
        );
        setQuoteIndex(nextGlobal);
      } else {
        advanceToFreshQuote(false);
      }
      setWhisperText("💬 FRESH WISDOM!");
      spawnFloatingPopup("💬 WISDOM ↻");
    } else if (mode === "snack") {
      setSnackIndex((prev) => (prev + 1) % snacks.length);
      setWhisperText("💡 NEW SNACK LOADED!");
      spawnFloatingPopup("💡 SYNTAX TIP");
    } else {
      setQuizSelection(null);
      setQuizIndex((prev) => (prev + 1) % quizzes.length);
      setWhisperText("⚡ QUIZ RESET!");
      spawnFloatingPopup("⚡ NEW QUIZ");
    }
  }

  function handleSwitchMode(nextMode: CompanionMode) {
    if (nextMode === mode) return;
    playKeyClick();
    triggerContentTransition();
    setMode(nextMode);
    if (nextMode === "quiz") {
      setQuizSelection(null);
      setWhisperText("🧠 TEST YOUR BRAIN!");
    } else if (nextMode === "snack") {
      setWhisperText("💡 BITE-SIZE CODE!");
    } else if (nextMode === "perks") {
      setWhisperText(`★ PET LVL ${petLevel} PERKS`);
    } else {
      setWhisperText("=^._.^= WISDOM");
    }
  }

  function handleSelectQuizOption(optIdx: number) {
    if (selectedQuizOpt !== null) return;
    setQuizSelection({ key: currentQuizKey, optionIdx: optIdx });
    const isCorrect = optIdx === currentQuiz.answerIdx;
    if (isCorrect) {
      playSuccessChime();
      triggerPlayfulBounce(true);
      activateHyperPurr(1800);
      setQuizSolvedCount((c) => c + 1);
      setWhisperText("★ PURR-FECT ANSWER!");
      spawnFloatingPopup("✓ +BRAIN XP!");
    } else {
      playKeyClick();
      triggerHeadShake();
      setWhisperText("🐾 CHECK THE HINT!");
      spawnFloatingPopup("✕ CLOSE TRY!");
    }
  }

  const mascotRank = isPremium
    ? activeTier.title
    : completedCount >= 10
      ? "SENIOR PURRCHITECT"
      : completedCount >= 5
        ? "BRANCH SLAPPER"
        : completedCount >= 1
          ? "CONSOLE STALKER"
          : "KEYCAP INTERN";

  // Prism Halo (Lvl 2+) & Legend Rainbow Frame (Lvl 6+)
  const activeHaloColor = hyperPurrActive
    ? "#B8FF3B"
    : petLevel >= 2
      ? HALO_CYCLE[haloIdx % HALO_CYCLE.length]
      : mode === "snack"
        ? currentSnack.accentBg
        : mode === "wisdom"
          ? currentQuote.accentBg
          : activeTier.accent;

  const frameRimColor =
    petLevel >= 6
      ? HALO_CYCLE[(haloIdx + 2) % HALO_CYCLE.length]
      : petLevel >= 5
        ? "#FFDE59"
        : StudioColors.ink;

  // Upgraded orbiting glyphs per level
  const leftOrbitGlyph =
    petLevel >= 6
      ? "🚀"
      : petLevel >= 4
        ? "🪲"
        : petLevel >= 2
          ? "🐾"
          : "{ }";
  const rightOrbitGlyph = hyperPurrActive
    ? "⚡"
    : petLevel >= 4
      ? "💎"
      : petLevel >= 3
        ? "⚡"
        : "✦";

  const guideStatusText =
    totalCount > 0 && completedCount === totalCount
      ? `Purr-fect! All ${totalCount} ${activeTrackLabel} modules cleared!`
      : completedCount === 0
        ? `Ready to guide you through ${activeTrackLabel}!`
        : `${completedCount}/${totalCount} solved (${trackPct}%) in ${activeTrackLabel}`;

  const wiggleRotate = wiggleAnim.interpolate({
    inputRange: [-2, 2],
    outputRange: ["-6deg", "6deg"],
  });

  const combinedScaleX = Animated.multiply(squishXAnim, hoverScaleAnim);
  const combinedScaleY = Animated.multiply(squishYAnim, hoverScaleAnim);

  const haloScale = haloPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.05],
  });
  const waveRingScale = ringWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.2],
  });
  const waveRingOpacity = ringWaveAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.75, 0.45, 0],
  });
  const ledRingScale = ledPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.1],
  });
  const ledRingOpacity = ledPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 0],
  });
  const sparkleDriftY1 = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, -7],
  });
  const sparkleDriftY2 = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 4],
  });
  const eqHeight1 = eqAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 12],
  });
  const eqHeight2 = eqAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 12],
  });
  const eqHeight3 = eqAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 12],
  });
  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });
  const animatedPetBarWidth = petBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const webHoverProps =
    Platform.OS === "web"
      ? ({
          onMouseEnter: () => setCardHovered(true),
          onMouseLeave: () => setCardHovered(false),
        } as any)
      : {};

  return (
    <Animated.View
      {...webHoverProps}
      style={[
        styles.card,
        cardHovered && styles.cardHovered,
        hyperPurrActive && { borderColor: StudioColors.lime },
        { transform: [{ translateY: cardLiftAnim }] },
      ]}
    >
      {/* Top Companion Ribbon */}
      <View
        style={[
          styles.companionTopBar,
          {
            backgroundColor: hyperPurrActive
              ? StudioColors.lime
              : activeTrackAccent,
          },
        ]}
      >
        <View style={styles.companionBarLeft}>
          <View style={styles.liveDotBadge}>
            <View style={styles.liveDotWrap}>
              <Animated.View
                style={[
                  styles.liveDotHalo,
                  {
                    opacity: ledRingOpacity,
                    transform: [{ scale: ledRingScale }],
                  },
                ]}
              />
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.liveDotText}>
              {hyperPurrActive
                ? "HYPER PURR"
                : petLevel >= 3
                  ? "BYTE-OS ONLINE"
                  : "CO-PILOT ONLINE"}
            </Text>
            <View style={styles.eqWrap}>
              <Animated.View style={[styles.eqBar, { height: eqHeight1 }]} />
              <Animated.View style={[styles.eqBar, { height: eqHeight2 }]} />
              <Animated.View style={[styles.eqBar, { height: eqHeight3 }]} />
            </View>
          </View>

          <View
            style={[
              styles.rankBadge,
              petLevel >= 5 && styles.rankBadgeLegend,
            ]}
          >
            <Text style={styles.rankBadgeText}>
              {activeTier.icon} {mascotRank}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBodyRow}>
        {/* Left Column: Interactive Animated Byte-Cat Stage */}
        <View style={styles.avatarColumn}>
          <Pressable
            onHoverIn={() => setAvatarHovered(true)}
            onHoverOut={() => setAvatarHovered(false)}
            onPress={handleTapAvatarPortrait}
            style={styles.stageTapTarget}
          >
            {/* Floating Reaction Popups */}
            <View style={styles.popupAnchor} pointerEvents="none">
              {popupAnims.map((slot, idx) =>
                popupLabels[idx] ? (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.floatingPopupPill,
                      {
                        opacity: slot.op,
                        transform: [
                          { translateY: slot.y },
                          { scale: slot.sc },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.floatingPopupText}>
                      {popupLabels[idx]}
                    </Text>
                  </Animated.View>
                ) : null,
              )}
            </View>

            {/* Level 5+ Golden Crown Perk perched at Top */}
            {petLevel >= 5 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.crownBadge,
                  { transform: [{ translateY: sparkleDriftY1 }] },
                ]}
              >
                <Text style={styles.crownBadgeText}>👑</Text>
              </Animated.View>
            )}

            {/* High-Contrast Ambient Orbiting Code Sparkles (visible in both dark & light themes) */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.sparkleBadgeTopLeft,
                { transform: [{ translateY: sparkleDriftY1 }] },
              ]}
            >
              <Text style={styles.sparkleBadgeText}>{leftOrbitGlyph}</Text>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.sparkleBadgeTopRight,
                { transform: [{ translateY: sparkleDriftY2 }] },
              ]}
            >
              <Text style={styles.sparkleBadgeText}>{rightOrbitGlyph}</Text>
            </Animated.View>

            {/* Expanding Glowing Pulse Ring Behind Avatar (vivid on dark theme) */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.stagePulseRing,
                {
                  borderColor: activeHaloColor,
                  opacity: waveRingOpacity,
                  transform: [{ scale: waveRingScale }],
                },
              ]}
            />

            {/* Pulsing Halo & Animated Portrait Frame */}
            <Animated.View
              style={[
                styles.avatarStageHalo,
                {
                  backgroundColor: activeHaloColor,
                  borderColor: frameRimColor,
                  transform: [{ scale: haloScale }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.avatarFrame,
                  { borderColor: frameRimColor },
                  {
                    transform: [
                      { rotate: wiggleRotate },
                      { scaleX: combinedScaleX },
                      { scaleY: combinedScaleY },
                    ],
                  },
                ]}
              >
                <CozyCodingByteCatStage
                  idleBreak={idleBreakAction}
                  isBlinking={isBlinking}
                  hyperPurrActive={hyperPurrActive}
                  activeKeyStep={activeKeyStep}
                />
              </Animated.View>
            </Animated.View>
          </Pressable>

          <View style={styles.cozyWhisperStrip}>
            <Text style={styles.avatarWhisperText} numberOfLines={1}>
              {whisperText}
            </Text>
          </View>

          {/* Compact Pet XP Meter & Current/Next Level Perk Peek */}
          <View style={styles.bondMeterWrap}>
            <View style={styles.bondMeterTop}>
              <Text style={styles.bondMeterLabel}>
                {isPremium ? `PET LVL ${petLevel}` : "PRO PET XP"}
              </Text>
              <Text style={styles.bondMeterLv}>
                {isPremium
                  ? `${petXp}/${petProgress.nextLevelTargetXp} XP`
                  : "LOCKED"}
              </Text>
            </View>
            <View style={styles.bondMeterTrack}>
              <Animated.View
                style={[
                  styles.bondMeterFill,
                  {
                    width: animatedPetBarWidth,
                    backgroundColor: activeHaloColor,
                  },
                ]}
              />
            </View>

            <Pressable
              style={styles.perkPeekPill}
              onPress={() =>
                handleSwitchMode(mode === "perks" ? "wisdom" : "perks")
              }
            >
              <Text style={styles.perkPeekText} numberOfLines={1}>
                {isPremium
                  ? petProgress.nextTier
                    ? `NEXT LVL ${petProgress.nextTier.level}: ${petProgress.nextTier.icon} ${petProgress.nextTier.perkTitle}`
                    : `🚀 LVL ${petLevel} · ALL PERKS ACTIVE`
                  : "✨ VIEW 6 PRO LEVEL PERKS →"}
              </Text>
            </Pressable>
          </View>

          {/* Unified Single Daily Treat Button (Pro Only, locked after daily use) + Shuffle Button */}
          <View style={styles.actionBtnRow}>
            <Pressable
              disabled={treatedToday}
              accessibilityState={{ disabled: treatedToday }}
              style={({ pressed }) => [
                styles.miniActionBtn,
                !isPremium
                  ? styles.treatLockedBtn
                  : treatedToday
                    ? styles.treatDoneTodayBtn
                    : styles.treatProBtn,
                pressed && !treatedToday && styles.miniBtnPressed,
              ]}
              onPress={handleTreatPet}
            >
              <Text
                numberOfLines={1}
                style={
                  !isPremium
                    ? styles.miniActionBtnTextLocked
                    : treatedToday
                      ? styles.miniActionBtnTextDone
                      : styles.miniActionBtnTextDark
                }
              >
                {!isPremium
                  ? "🔒 🐟 TREAT · PRO"
                  : treatedToday
                    ? "✓ TREATED TODAY"
                    : `🐟 TREAT (+${TREAT_XP_AMOUNT} XP)`}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.miniActionBtn,
                styles.rollBtn,
                pressed && styles.miniBtnPressed,
              ]}
              onPress={handleShuffleActiveMode}
            >
              <Text style={styles.miniActionBtnText}>🎲</Text>
            </Pressable>
          </View>
        </View>

        {/* Right Column: Interactive Speech Bubble */}
        <View style={styles.speechBubble}>
          {/* Mode Tabs + Next Trigger */}
          <View style={styles.bubbleTopRow}>
            <View style={styles.modeTabsBar}>
              {(
                [
                  { id: "wisdom", label: "💬 WISDOM" },
                  { id: "snack", label: "💡 SNACK" },
                  { id: "quiz", label: "⚡ QUIZ" },
                  { id: "perks", label: "🐾 PERKS" },
                ] as const
              ).map((tab) => {
                const isSelected = mode === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    style={[
                      styles.modeTabBtn,
                      isSelected && [
                        styles.modeTabBtnActive,
                        { backgroundColor: activeHaloColor },
                      ],
                    ]}
                    onPress={() => handleSwitchMode(tab.id)}
                  >
                    <Text
                      style={[
                        styles.modeTabText,
                        isSelected && styles.modeTabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.nextQuoteBtn,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onPress={handleShuffleActiveMode}
            >
              <Text style={styles.nextQuoteBtnText}>
                {mode === "snack"
                  ? "NEXT SNACK ↻"
                  : mode === "quiz"
                    ? "NEXT QUIZ ↻"
                    : "NEW WISDOM ↻"}
              </Text>
            </Pressable>
          </View>

          {/* Animated Mode Content Body */}
          <Animated.View
            style={{
              opacity: contentFadeAnim,
              transform: [{ translateY: contentSlideAnim }],
              gap: 10,
            }}
          >
            {mode === "wisdom" ? (
              <>
                <View style={styles.bubbleBadgeGroup}>
                  <View
                    style={[
                      styles.moodSticker,
                      { backgroundColor: currentQuote.accentBg },
                    ]}
                  >
                    <Text style={styles.moodStickerText}>
                      {currentQuote.moodBadge}
                    </Text>
                  </View>
                  <Text style={styles.quoteCounterText}>
                    {usingSavedFilter
                      ? `★ ${activePoolIdx + 1}/${activeQuotePool.length} SAVED`
                      : `#${String(currentQuote.id).padStart(2, "0")}/${String(BYTE_CAT_QUOTES.length).padStart(2, "0")}`}
                  </Text>
                  {savedQuoteIds.length > 0 && (
                    <Pressable
                      style={[
                        styles.quoteFilterPill,
                        usingSavedFilter && styles.quoteFilterPillActive,
                      ]}
                      onPress={handleToggleQuoteFilter}
                    >
                      <Text
                        style={[
                          styles.quoteFilterPillText,
                          usingSavedFilter && styles.quoteFilterPillTextActive,
                        ]}
                      >
                        ★ FAVS ({savedQuoteIds.length})
                      </Text>
                    </Pressable>
                  )}
                </View>

                <View
                  style={[
                    styles.quoteSpotlightBox,
                    { borderLeftColor: currentQuote.accentBg },
                  ]}
                >
                  <View style={styles.quoteSpotlightTopRow}>
                    <View
                      style={[
                        styles.quoteCornerMark,
                        { backgroundColor: currentQuote.accentBg },
                      ]}
                    >
                      <Text style={styles.quoteCornerMarkText}>&ldquo;</Text>
                    </View>
                    <Text style={styles.quoteAuthor}>
                      — {currentQuote.author}
                    </Text>
                  </View>
                  <Text style={styles.quoteText}>
                    {currentQuote.quote}
                  </Text>
                </View>

                <View style={styles.quoteInteractiveBar}>
                  <View style={styles.quoteNavGroup}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.quoteStepBtn,
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                      onPress={() => stepQuote(-1)}
                    >
                      <Text style={styles.quoteStepBtnText}>◀</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.quoteStepBtn,
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                      onPress={() => stepQuote(1)}
                    >
                      <Text style={styles.quoteStepBtnText}>▶</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.quoteActionChip,
                        isCurrentQuoteSaved && styles.quoteActionChipSaved,
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                      onPress={handleToggleSaveQuote}
                    >
                      <Text
                        style={[
                          styles.quoteActionChipText,
                          isCurrentQuoteSaved && styles.quoteActionChipTextInk,
                        ]}
                      >
                        {isCurrentQuoteSaved ? "★ SAVED" : "☆ SAVE"}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.quoteVibeBtn,
                      pressed && { transform: [{ translateY: 1 }] },
                    ]}
                    onPress={handleVibeQuote}
                  >
                    <Text style={styles.quoteVibeBtnText}>
                      🐾 PURR{quoteVibeCount > 0 ? ` · ${quoteVibeCount}` : " +1"}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : mode === "snack" ? (
              <View style={styles.snackPanel}>
                <View style={styles.bubbleBadgeGroup}>
                  <View
                    style={[
                      styles.moodSticker,
                      { backgroundColor: currentSnack.accentBg },
                    ]}
                  >
                    <Text style={styles.moodStickerText}>
                      {currentSnack.tag}
                    </Text>
                  </View>
                  <Text style={styles.snackTitleText}>
                    {currentSnack.title}
                  </Text>
                  <Text style={styles.quoteCounterText}>
                    0{(snackIndex % snacks.length) + 1}/0{snacks.length}
                  </Text>
                </View>

                <View style={styles.snackCodeBox}>
                  <Text style={styles.snackCodeText}>{currentSnack.code}</Text>
                </View>

                <Text style={styles.snackTakeawayText}>
                  💡 {currentSnack.takeaway}
                </Text>
              </View>
            ) : mode === "quiz" ? (
              <View style={styles.quizPanel}>
                <View style={styles.bubbleBadgeGroup}>
                  <View
                    style={[
                      styles.moodSticker,
                      { backgroundColor: StudioColors.lime },
                    ]}
                  >
                    <Text style={styles.moodStickerText}>
                      ⚡ 3-SECOND CHECK
                    </Text>
                  </View>
                  <Text style={styles.quoteCounterText}>
                    SOLVED THIS SESSION: {quizSolvedCount}
                  </Text>
                </View>

                <View style={styles.snackCodeBox}>
                  <Text style={styles.snackCodeText}>{currentQuiz.code}</Text>
                </View>

                <View style={styles.quizOptionsRow}>
                  {currentQuiz.options.map((opt, idx) => {
                    const isPicked = selectedQuizOpt === idx;
                    const isAnswer = idx === currentQuiz.answerIdx;
                    const showOutcome = selectedQuizOpt !== null;

                    return (
                      <Pressable
                        key={idx}
                        style={({ pressed }) => [
                          styles.quizOptionBtn,
                          showOutcome && isAnswer && styles.quizOptionCorrect,
                          showOutcome &&
                            isPicked &&
                            !isAnswer &&
                            styles.quizOptionWrong,
                          pressed &&
                            selectedQuizOpt === null &&
                            styles.miniBtnPressed,
                        ]}
                        onPress={() => handleSelectQuizOption(idx)}
                      >
                        <Text
                          style={[
                            styles.quizOptionText,
                            showOutcome &&
                              (isAnswer || isPicked) &&
                              styles.quizOptionTextSelected,
                          ]}
                        >
                          {showOutcome && isAnswer
                            ? `✓ ${opt}`
                            : showOutcome && isPicked && !isAnswer
                              ? `✕ ${opt}`
                              : opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {selectedQuizOpt !== null ? (
                  <View style={styles.quizFeedbackBox}>
                    <Text style={styles.quizFeedbackText}>
                      {selectedQuizOpt === currentQuiz.answerIdx
                        ? `★ Purr-fect! ${currentQuiz.why}`
                        : `🐾 Not quite — ${currentQuiz.why}`}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.quizPromptHint}>
                    Tap an option above to test your instinct!
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.perksPanel}>
                <View style={styles.perksHeaderRow}>
                  <View
                    style={[
                      styles.moodSticker,
                      { backgroundColor: activeTier.accent },
                    ]}
                  >
                    <Text style={styles.moodStickerText}>
                      🐾 PET LEVEL PERKS · PRO
                    </Text>
                  </View>
                  {!isPremium && onOpenPaywall && (
                    <Pressable
                      style={styles.unlockPerksMiniBtn}
                      onPress={() => {
                        playKeyClick();
                        onOpenPaywall();
                      }}
                    >
                      <Text style={styles.unlockPerksMiniText}>
                        UNLOCK PRO →
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.perksDailyNote}>
                  {isPremium
                    ? treatedToday
                      ? "✓ Today's treat claimed! Come back tomorrow for +15 Pet XP."
                      : `🐟 Daily Treat ready: +${TREAT_XP_AMOUNT} Pet XP once per day to unlock new perks.`
                    : `🐟 Pro members can treat Byte-Cat once per day (+${TREAT_XP_AMOUNT} XP) to unlock perks.`}
                </Text>

                <View style={styles.perksGrid}>
                  {PET_LEVEL_TIERS.map((tier) => {
                    const isUnlocked = isPremium && petLevel >= tier.level;
                    return (
                      <View
                        key={tier.level}
                        style={[
                          styles.perkRowCard,
                          isUnlocked && {
                            backgroundColor: StudioColors.cardDoneBg,
                            borderColor: StudioColors.cardDoneBorder,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.perkLevelBadge,
                            {
                              backgroundColor: isUnlocked
                                ? tier.accent
                                : StudioColors.bg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.perkLevelBadgeText,
                              !isUnlocked && { color: StudioColors.textMuted },
                            ]}
                          >
                            {isUnlocked ? `${tier.icon} L${tier.level}` : `L${tier.level}`}
                          </Text>
                        </View>
                        <View style={styles.perkCopyCol}>
                          <Text style={styles.perkTitleLine}>
                            {tier.title}{" "}
                            <Text style={styles.perkTitleReq}>
                              · {tier.minXp} XP
                            </Text>
                          </Text>
                          <Text style={styles.perkDescLine}>
                            <Text style={styles.perkBonusLabel}>
                              {tier.perkTitle}:
                            </Text>{" "}
                            {tier.perkDesc}
                          </Text>
                        </View>
                        <Text style={styles.perkStatusMark}>
                          {isUnlocked ? "✓" : "🔒"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </Animated.View>

          {/* Progress Strip + Quick Jump to Next Mission */}
          <View style={styles.guideFooterRow}>
            <View style={styles.guideProgressWrap}>
              <Text style={styles.guideStatusText} numberOfLines={1}>
                ● {guideStatusText}
              </Text>
              <View style={styles.miniTrackMeterBg}>
                <Animated.View
                  style={[
                    styles.miniTrackMeterFill,
                    {
                      width: animatedProgressWidth,
                      backgroundColor: activeTrackAccent,
                    },
                  ]}
                />
              </View>
            </View>

            {nextLessonTitle && onPressNextLesson && (
              <Pressable
                style={({ pressed }) => [
                  styles.jumpMissionChip,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onPress={onPressNextLesson}
              >
                <Text style={styles.jumpMissionChipText} numberOfLines={1}>
                  ▶ {nextLessonTitle.toUpperCase()} →
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    card: {
      backgroundColor: StudioColors.surface,
      borderRadius: 18,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      marginBottom: 20,
      overflow: "hidden",
      ...HardShadow,
    },
    cardHovered: {
      borderColor: StudioColors.yellow,
    },
    companionTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
    },
    companionBarLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    rankBadge: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    rankBadgeLegend: {
      borderColor: "#FFDE59",
    },
    rankBadgeText: {
      color: StudioColors.textPrimary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    cardBodyRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 18,
      flexWrap: "wrap",
    },
    avatarColumn: {
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      width: 214,
    },
    stageTapTarget: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      paddingTop: 18,
      paddingHorizontal: 6,
      paddingBottom: 2,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    popupAnchor: {
      position: "absolute",
      top: 4,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 40,
    },
    floatingPopupPill: {
      position: "absolute",
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 2,
      ...HardShadowSm,
    },
    floatingPopupText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    crownBadge: {
      position: "absolute",
      top: 0,
      zIndex: 35,
      backgroundColor: "#FFDE59",
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 1,
      ...HardShadowSm,
    },
    crownBadgeText: {
      fontSize: 11,
    },
    sparkleBadgeTopLeft: {
      position: "absolute",
      top: 16,
      left: -2,
      zIndex: 30,
      backgroundColor: StudioColors.violet,
      borderWidth: 1.5,
      borderColor: StudioColors.textPrimary,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      ...HardShadowSm,
    },
    sparkleBadgeTopRight: {
      position: "absolute",
      top: 28,
      right: -4,
      zIndex: 30,
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.textPrimary,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      ...HardShadowSm,
    },
    sparkleBadgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stagePulseRing: {
      position: "absolute",
      top: 18,
      width: 204,
      height: 164,
      borderRadius: 24,
      borderWidth: 2.5,
    },
    avatarStageHalo: {
      padding: 6,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: StudioColors.textPrimary,
      ...HardShadowSm,
    },
    avatarFrame: {
      width: 190,
      height: 150,
      borderRadius: 14,
      borderWidth: 2.5,
      borderColor: StudioColors.ink,
      backgroundColor: "#171522",
      overflow: "hidden",
      position: "relative",
    },
    cozyWhisperStrip: {
      width: "100%",
      backgroundColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignItems: "center",
      borderWidth: 1,
      borderColor: StudioColors.border,
    },
    avatarWhisperText: {
      color: "#FFDE59",
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    liveDotBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    liveDotWrap: {
      width: 8,
      height: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    liveDotHalo: {
      position: "absolute",
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#A3E635",
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#A3E635",
    },
    liveDotText: {
      color: "#FFFFFF",
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    eqWrap: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 2,
      height: 12,
      marginLeft: 2,
    },
    eqBar: {
      width: 2.5,
      borderRadius: 1.5,
      backgroundColor: "#A3E635",
    },
    bondMeterWrap: {
      width: "100%",
      gap: 4,
      paddingHorizontal: 2,
    },
    bondMeterTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    bondMeterLabel: {
      color: StudioColors.textMuted,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    bondMeterLv: {
      color: StudioColors.textPrimary,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    bondMeterTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    bondMeterFill: {
      height: "100%",
    },
    perkPeekPill: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
      alignItems: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    perkPeekText: {
      color: StudioColors.textSecondary,
      fontSize: 8,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    actionBtnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      width: "100%",
    },
    miniActionBtn: {
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    miniBtnPressed: {
      transform: [{ translateX: 1 }, { translateY: 1 }],
    },
    treatProBtn: {
      flex: 1,
      backgroundColor: StudioColors.yellow,
    },
    treatDoneTodayBtn: {
      flex: 1,
      backgroundColor: StudioColors.cardDoneBg,
      borderColor: StudioColors.cardDoneBorder,
      opacity: 0.92,
      ...Platform.select({
        web: { cursor: "default", userSelect: "none", boxShadow: "none" } as any,
        default: {},
      }),
    },
    treatLockedBtn: {
      flex: 1,
      backgroundColor: StudioColors.surfaceElevated,
      borderColor: StudioColors.border,
    },
    rollBtn: {
      backgroundColor: StudioColors.surfaceElevated,
      borderColor: StudioColors.border,
      paddingHorizontal: 9,
    },
    miniActionBtnTextDark: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.3,
    },
    miniActionBtnTextDone: {
      color: StudioColors.textPrimary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.2,
    },
    miniActionBtnTextLocked: {
      color: StudioColors.textPrimary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    miniActionBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    speechBubble: {
      flex: 1,
      minWidth: 260,
      backgroundColor: StudioColors.surfaceElevated,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 14,
      gap: 11,
    },
    bubbleTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    modeTabsBar: {
      flexDirection: "row",
      flexWrap: "wrap",
      backgroundColor: StudioColors.bg,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      padding: 2.5,
      gap: 3,
    },
    modeTabBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    modeTabBtnActive: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    modeTabText: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    modeTabTextActive: {
      color: StudioColors.ink,
    },
    bubbleBadgeGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    moodSticker: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    moodStickerText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    quoteCounterText: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    nextQuoteBtn: {
      backgroundColor: StudioColors.surface,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    nextQuoteBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    quoteFilterPill: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    quoteFilterPillActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    quoteFilterPillText: {
      color: StudioColors.textSecondary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    quoteFilterPillTextActive: {
      color: StudioColors.ink,
    },
    quoteSpotlightBox: {
      backgroundColor: StudioColors.surface,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderLeftWidth: 5,
      paddingHorizontal: 14,
      paddingVertical: 13,
      gap: 9,
    },
    quoteSpotlightTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      flexWrap: "wrap",
    },
    quoteCornerMark: {
      width: 24,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
    },
    quoteCornerMarkText: {
      color: StudioColors.ink,
      fontSize: 17,
      fontWeight: "900",
      lineHeight: 20,
      marginTop: 2,
    },
    quoteText: {
      color: StudioColors.textPrimary,
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 26,
      letterSpacing: -0.2,
    },
    quoteAuthor: {
      color: StudioColors.textSecondary,
      fontSize: 11.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    quoteInteractiveBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    quoteNavGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
    },
    quoteStepBtn: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 4.5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    quoteStepBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    quoteActionChip: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 4.5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    quoteActionChipSaved: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    quoteActionChipText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    quoteActionChipTextInk: {
      color: StudioColors.ink,
    },
    quoteVibeBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 10,
      paddingVertical: 4.5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    quoteVibeBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    snackPanel: {
      gap: 9,
    },
    snackTitleText: {
      color: StudioColors.textPrimary,
      fontSize: 14,
      fontWeight: "900",
    },
    snackCodeBox: {
      backgroundColor: StudioColors.codeBg,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    snackCodeText: {
      color: StudioColors.lime,
      fontSize: 12.5,
      fontWeight: "700",
      fontFamily: MonoFont,
      lineHeight: 19,
    },
    snackTakeawayText: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    quizPanel: {
      gap: 9,
    },
    quizOptionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    quizOptionBtn: {
      flex: 1,
      minWidth: 100,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    quizOptionCorrect: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    quizOptionWrong: {
      backgroundColor: StudioColors.coral,
      borderColor: StudioColors.ink,
    },
    quizOptionText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    quizOptionTextSelected: {
      color: StudioColors.ink,
    },
    quizFeedbackBox: {
      backgroundColor: StudioColors.surface,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    quizFeedbackText: {
      color: StudioColors.textPrimary,
      fontSize: 11.5,
      fontWeight: "700",
      lineHeight: 17,
    },
    quizPromptHint: {
      color: StudioColors.textMuted,
      fontSize: 11,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    perksPanel: {
      gap: 8,
    },
    perksHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    unlockPerksMiniBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 9,
      paddingVertical: 4,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    unlockPerksMiniText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    perksDailyNote: {
      color: StudioColors.textSecondary,
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 15,
    },
    perksGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },
    perkRowCard: {
      flex: 1,
      minWidth: 215,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },
    perkLevelBadge: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 3,
      minWidth: 38,
      alignItems: "center",
    },
    perkLevelBadgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    perkCopyCol: {
      flex: 1,
      gap: 1,
    },
    perkTitleLine: {
      color: StudioColors.textPrimary,
      fontSize: 11.5,
      fontWeight: "900",
    },
    perkTitleReq: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    perkDescLine: {
      color: StudioColors.textSecondary,
      fontSize: 10.5,
      fontWeight: "600",
      lineHeight: 14,
    },
    perkBonusLabel: {
      color: StudioColors.textPrimary,
      fontWeight: "800",
    },
    perkStatusMark: {
      fontSize: 11,
      fontWeight: "900",
    },
    guideFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
      paddingTop: 2,
    },
    guideProgressWrap: {
      flex: 1,
      minWidth: 170,
      gap: 4,
    },
    guideStatusText: {
      color: StudioColors.textSecondary,
      fontSize: 10.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    miniTrackMeterBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: StudioColors.surface,
      borderWidth: 1,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    miniTrackMeterFill: {
      height: "100%",
    },
    jumpMissionChip: {
      backgroundColor: StudioColors.lime,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    jumpMissionChipText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
  });
