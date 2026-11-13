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
const STORAGE_BYTECAT_PET_KEY = "devlearn_bytecat_pet_v1";
const TREAT_XP_AMOUNT = 15;

export interface ByteCatQuote {
  id: number;
  quote: string;
  author: string;
  catNote: string;
  moodBadge: string;
  accentBg: string;
}

export const BYTE_CAT_QUOTES: ByteCatQuote[] = [
  {
    id: 1,
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    catNote:
      "Paws off the keyboard for 10 seconds—sketch your plan first, then pounce!",
    moodBadge: "=^._.^= STRATEGIC PAWS",
    accentBg: "#FFDE59",
  },
  {
    id: 2,
    quote:
      "Every master programmer was once a beginner who refused to quit on a syntax error.",
    author: "Byte-Cat Wisdom",
    catNote:
      "Red console text isn't failure—it's just the compiler meowing for attention.",
    moodBadge: "⚡ RESILIENT CODER",
    accentBg: "#A3E635",
  },
  {
    id: 3,
    quote: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    catNote:
      "If a 3-line loop does the job clearly, you don't need a 20-line hairball!",
    moodBadge: "✦ CLEAN SYNTAX",
    accentBg: "#6EE7B7",
  },
  {
    id: 4,
    quote: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    catNote:
      "Pass Test Case #1 first! We can groom and optimize the code after it runs.",
    moodBadge: "🚀 SHIP IT MODE",
    accentBg: "#FF90E8",
  },
  {
    id: 5,
    quote: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    catNote:
      "Even one 5-minute module today keeps your coding claws razor sharp!",
    moodBadge: "🐾 CLAWS ON KEYS",
    accentBg: "#FFDE59",
  },
  {
    id: 6,
    quote:
      "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
    catNote:
      "Reading docs is nice, but typing code into the console is where the magic clicks.",
    moodBadge: "⌨️ KEYCAP HERO",
    accentBg: "#C4B5FD",
  },
  {
    id: 7,
    quote:
      "Debugging is twice as hard as writing the code in the first place.",
    author: "Brian Kernighan",
    catNote:
      "When in doubt, drop a print() statement and follow the trail of pawprints.",
    moodBadge: "🔍 BUG STALKER",
    accentBg: "#6EE7B7",
  },
  {
    id: 8,
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    catNote:
      "1 module a day = 365 solved challenges a year. Keep that streak purring!",
    moodBadge: "🔥 STREAK GUARDIAN",
    accentBg: "#A3E635",
  },
  {
    id: 9,
    quote: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    catNote:
      "Pick variable names so clear that future-you will give present-you a treat.",
    moodBadge: "★ READABLE CODE",
    accentBg: "#FF90E8",
  },
  {
    id: 10,
    quote:
      "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    catNote: "Your future teammates (and cats) appreciate clean indentation!",
    moodBadge: "💎 CRAFT MODE",
    accentBg: "#FFDE59",
  },
  {
    id: 11,
    quote: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
    catNote:
      "Every bug you squash today is a pattern you'll spot in 2 seconds tomorrow.",
    moodBadge: "⚡ XP GAINED",
    accentBg: "#C4B5FD",
  },
  {
    id: 12,
    quote: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
    catNote:
      "Check your edge cases (empty lists & zeroes) before they ambush you!",
    moodBadge: "🛡️ EDGE CASE READY",
    accentBg: "#6EE7B7",
  },
  {
    id: 13,
    quote: "Consistency beats intensity when you're building a superpower.",
    author: "Byte-Cat Protocol // 07",
    catNote:
      "Got 60 seconds? Knock out today's Warm-Up or a quick module to level up!",
    moodBadge: "=^._.^= DAILY BOOST",
    accentBg: "#A3E635",
  },
  {
    id: 14,
    quote: "Knowledge is power, but applied knowledge is a career.",
    author: "Developer Proverb",
    catNote:
      "Each node you unlock on this Skill Map is a real tool in your engineering kit.",
    moodBadge: "🎯 SKILL BUILDER",
    accentBg: "#FFDE59",
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
    title: "ROOKIE KITTEN",
    icon: "🐾",
    perkTitle: "Animated Stage",
    perkDesc: "Idle float, ear tilt & orbiting sparkles",
    accent: "#FFDE59",
  },
  {
    level: 2,
    minXp: 30,
    title: "SPARK PAW",
    icon: "🌈",
    perkTitle: "Prism Halo",
    perkDesc: "Cycles vibrant neon stage rings & unlocks 🐾 orbit badge",
    accent: "#FF90E8",
  },
  {
    level: 3,
    minXp: 75,
    title: "CYBER WHISKER",
    icon: "⚡",
    perkTitle: "Hacker Visor",
    perkDesc: "Equips BYTE-OS visor overlay, fast equalizer & cyber whispers",
    accent: "#6EE7B7",
  },
  {
    level: 4,
    minXp: 135,
    title: "BUG BUSTER",
    icon: "🪲",
    perkTitle: "Double Burst",
    perkDesc: "Upgrades sparkles to 🪲/💎 & triggers dual celebratory popups",
    accent: "#A3E635",
  },
  {
    level: 5,
    minXp: 210,
    title: "SYNTAX KING",
    icon: "👑",
    perkTitle: "Golden Crown",
    perkDesc: "Floating 👑 crown sticker & gleaming gold portrait trim",
    accent: "#FBBF24",
  },
  {
    level: 6,
    minXp: 300,
    title: "ARCADE LEGEND",
    icon: "🚀",
    perkTitle: "Rainbow Legend",
    perkDesc: "Cycling rainbow arcade frame & ★ LEGEND crest on top bar",
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

const TRACK_TIPS: Record<string, string> = {
  python_basics:
    "Start with variables & loops—every tiny script builds muscle memory.",
  algorithms:
    "Look for the pattern first (pointers, window, or hash) before coding.",
  system_design:
    "Think about bottlenecks: caches, queues, and safe fallbacks keep apps fast.",
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

interface ByteCatGuideCardProps {
  completedCount: number;
  totalCount: number;
  activeTrack?: string;
  activeTrackLabel: string;
  activeTrackAccent?: string;
  totalXp?: number;
  streakCount?: number;
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
  totalXp = 0,
  streakCount = 0,
  isPremium = false,
  onOpenPaywall,
  nextLessonTitle,
  onPressNextLesson,
}: ByteCatGuideCardProps) {
  const styles = getStyles();

  const [mode, setMode] = useState<CompanionMode>("wisdom");
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
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
  const [whisperText, setWhisperText] = useState<string>("=^._.^= READY!");
  const [hyperPurrActive, setHyperPurrActive] = useState<boolean>(false);
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

  // Portrait & stage animations
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [tiltAnim] = useState(() => new Animated.Value(0));
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

  // Idle floating, head sway, halo pulse, expanding outer wave ring, LED pulse, and sparkles
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5.5,
          duration: 1450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    const tiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnim, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(tiltAnim, {
          toValue: -1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

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

    floatLoop.start();
    tiltLoop.start();
    haloLoop.start();
    ringWaveLoop.start();
    ledLoop.start();
    sparkleLoop.start();

    return () => {
      floatLoop.stop();
      tiltLoop.stop();
      haloLoop.stop();
      ringWaveLoop.stop();
      ledLoop.stop();
      sparkleLoop.stop();
    };
  }, [
    floatAnim,
    haloPulseAnim,
    ledPulseAnim,
    ringWaveAnim,
    sparkleAnim,
    tiltAnim,
  ]);

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
  const currentQuote = BYTE_CAT_QUOTES[quoteIndex] || BYTE_CAT_QUOTES[0];
  const currentSnack = snacks[snackIndex % snacks.length];
  const safeQuizIdx = quizIndex % quizzes.length;
  const currentQuiz = quizzes[safeQuizIdx];
  const currentQuizKey = `${activeTrack}-${safeQuizIdx}`;
  const selectedQuizOpt =
    quizSelection?.key === currentQuizKey ? quizSelection.optionIdx : null;

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
        const hoursLeft = getHoursUntilMidnight();
        setWhisperText("🐟 HAPPY & FULL!");
        spawnFloatingPopup(`=^._.^= PURR · ~${hoursLeft}H`);
        return;
      }
      handleTreatPet();
      return;
    }
    playKeyClick();
    triggerPlayfulBounce(false);
    setWhisperText("🔒 PRO UNLOCKS LVLS!");
    spawnFloatingPopup("=^._.^= MEOW!");
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
      advanceToFreshQuote(false);
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
      ? "ARCHITECT CAT"
      : completedCount >= 5
        ? "CODE STALKER"
        : completedCount >= 1
          ? "PAW CODER"
          : "NEW COMPANION";

  const trackTip = TRACK_TIPS[activeTrack] || TRACK_TIPS.python_basics;

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

  const combinedRotate = Animated.add(
    tiltAnim.interpolate({
      inputRange: [-1, 1],
      outputRange: [-2.2, 2.2],
    }),
    wiggleAnim.interpolate({
      inputRange: [-2, 2],
      outputRange: [-11, 11],
    }),
  ).interpolate({
    inputRange: [-15, 15],
    outputRange: ["-15deg", "15deg"],
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

        <View style={styles.companionBarRight}>
          <Pressable
            style={styles.telemetryChip}
            onPress={() =>
              handleSwitchMode(mode === "perks" ? "wisdom" : "perks")
            }
          >
            <Text style={styles.telemetryChipText}>
              {isPremium ? `🐾 PET LVL ${petLevel}` : "🔒 PRO PET"}
            </Text>
          </Pressable>
          {streakCount > 0 && (
            <View style={styles.telemetryChip}>
              <Text style={styles.telemetryChipText}>🔥 {streakCount}D</Text>
            </View>
          )}
          <View style={styles.telemetryChip}>
            <Text style={styles.telemetryChipText}>⚡ {totalXp} XP</Text>
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
                      { translateY: floatAnim },
                      { rotate: combinedRotate },
                      { scaleX: combinedScaleX },
                      { scaleY: combinedScaleY },
                    ],
                  },
                ]}
              >
                <Image
                  source={BYTE_CAT_IMAGE}
                  style={styles.avatarImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />

                {/* Level 3+ Hacker Visor Top Overlay */}
                {petLevel >= 3 && (
                  <View style={styles.hackerVisorTag}>
                    <Text style={styles.hackerVisorText}>⚡ BYTE-OS</Text>
                  </View>
                )}

                <View style={styles.avatarWhisperOverlay}>
                  <Text style={styles.avatarWhisperText} numberOfLines={1}>
                    {whisperText}
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>
          </Pressable>

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

          {/* Unified Single Daily Treat Button (Pro Only) + Shuffle Button */}
          <View style={styles.actionBtnRow}>
            <Pressable
              style={({ pressed }) => [
                styles.miniActionBtn,
                !isPremium
                  ? styles.treatLockedBtn
                  : treatedToday
                    ? styles.treatDoneTodayBtn
                    : styles.treatProBtn,
                pressed && styles.miniBtnPressed,
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
                    #{String(currentQuote.id).padStart(2, "0")}/
                    {String(BYTE_CAT_QUOTES.length).padStart(2, "0")}
                  </Text>
                </View>

                <View style={styles.quoteBodyWrap}>
                  <Text style={styles.quoteText}>
                    &ldquo;{currentQuote.quote}&rdquo;
                  </Text>
                  <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
                </View>

                <View style={styles.catNoteBox}>
                  <View style={styles.catNoteHeaderRow}>
                    <Text style={styles.catNotePrefix}>
                      🐾 BYTE-CAT BRIEFING
                    </Text>
                    <Text style={styles.catNoteTrackTag}>
                      {activeTrackLabel}
                    </Text>
                  </View>
                  <Text style={styles.catNoteText}>{trackTip}</Text>
                  <Text style={styles.catNoteSubText}>
                    {currentQuote.catNote}
                  </Text>
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
                            {tier.perkTitle}{" "}
                            <Text style={styles.perkTitleReq}>
                              · {tier.minXp} XP
                            </Text>
                          </Text>
                          <Text style={styles.perkDescLine}>{tier.perkDesc}</Text>
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
    companionBarRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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
    telemetryChip: {
      backgroundColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    telemetryChipText: {
      color: StudioColors.yellow,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
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
      gap: 8,
      width: 164,
    },
    stageTapTarget: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      paddingTop: 18,
      paddingHorizontal: 10,
      paddingBottom: 4,
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
      width: 140,
      height: 140,
      borderRadius: 28,
      borderWidth: 2.5,
    },
    avatarStageHalo: {
      padding: 8,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: StudioColors.textPrimary,
      ...HardShadowSm,
    },
    avatarFrame: {
      width: 124,
      height: 124,
      borderRadius: 16,
      borderWidth: 2.5,
      borderColor: StudioColors.ink,
      backgroundColor: StudioColors.surfaceElevated,
      overflow: "hidden",
      position: "relative",
    },
    avatarImage: {
      width: 120,
      height: 120,
    },
    hackerVisorTag: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: "rgba(17, 17, 17, 0.88)",
      borderWidth: 1,
      borderColor: StudioColors.lime,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 1.5,
    },
    hackerVisorText: {
      color: StudioColors.lime,
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    avatarWhisperOverlay: {
      position: "absolute",
      bottom: 4,
      left: 4,
      right: 4,
      backgroundColor: "rgba(17, 17, 17, 0.88)",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2.5,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.25)",
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
    quoteBodyWrap: {
      gap: 4,
    },
    quoteText: {
      color: StudioColors.textPrimary,
      fontSize: 15.5,
      fontWeight: "900",
      lineHeight: 22,
      letterSpacing: -0.2,
    },
    quoteAuthor: {
      color: StudioColors.textSecondary,
      fontSize: 11,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    catNoteBox: {
      backgroundColor: StudioColors.surface,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      paddingHorizontal: 12,
      paddingVertical: 9,
      gap: 3,
    },
    catNoteHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      flexWrap: "wrap",
    },
    catNotePrefix: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    catNoteTrackTag: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
      textTransform: "uppercase",
    },
    catNoteText: {
      color: StudioColors.textPrimary,
      fontSize: 12.5,
      fontWeight: "800",
      lineHeight: 18,
    },
    catNoteSubText: {
      color: StudioColors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 17,
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
