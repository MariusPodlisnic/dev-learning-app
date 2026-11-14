"use no memo";

import { Link, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import type { Metadata } from "expo-router/server";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import ExploreByteCatStage from "../components/ExploreByteCatStage";
import ExplorePythonSandbox from "../components/ExplorePythonSandbox";
import MinimalPcbBackground from "../components/MinimalPcbBackground";
import { Text } from "../components/StudioIcon";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  SerifFont,
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import { captureLandingAttribution } from "../utils/attribution";
import {
  playErrorBuzz,
  playKeyClick,
  playSuccessChime,
} from "../utils/soundEffects";

export function generateMetadata(): Metadata {
  return {
    title: "Curriculum Showcase & Pro Syllabus | DevLearn Arcade",
    description:
      "Explore Python Foundations, Algorithmic Mastery, System Architecture, interactive Algo Visualizer Labs, Bug Hunt, and DevLearn Pro membership.",
    openGraph: {
      title: "Curriculum Showcase & Pro Syllabus | DevLearn Arcade",
      description:
        "Master Python, Algorithms & System Design with browser-based code execution, visual roadmaps, and 60s arcade sprints.",
      type: "website",
      images: ["/og-preview.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Curriculum Showcase & Pro Syllabus | DevLearn Arcade",
      description:
        "Interactive coding roadmaps, playable Python mini-apps, and 60-second arcade sprints.",
      images: ["/og-preview.jpg"],
    },
  };
}

interface FeatureSpotlightItem {
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

const FEATURE_SPOTLIGHTS: FeatureSpotlightItem[] = [
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

const TRACK_SYLLABUS = [
  {
    key: "python_basics" as const,
    badge: "🐍 TRACK 01 · FREE",
    moduleTag: "24 MODULES",
    chapters: "6 Chapters · Basics through Playable Mini-Apps",
    chapterBreakdown: [
      { label: "Ch. I–II: Variables, Logic & Loops", tag: "8 Lessons", isPro: false },
      { label: "Ch. III–V: Lists, Dicts & Functions", tag: "12 Lessons", isPro: false },
      { label: "Ch. VI: Playable Python Mini-Apps", tag: "4 Boss Apps", isPro: false },
    ],
    ctaLabel: "START FREE TRACK →",
  },
  {
    key: "algorithms" as const,
    badge: "⚡ TRACK 02 · PRO + 1 FREE",
    moduleTag: "O(n) → O(1)",
    chapters: "Two Pointers, Hashing, Trees & Sliding Windows",
    chapterBreakdown: [
      { label: "🔓 Two Pointers & Array Scan", tag: "FREE PREVIEW", isPro: false },
      { label: "🔒 Sliding Window & Hash Maps", tag: "PRO", isPro: true },
      { label: "🔒 Binary Search, Trees & Graphs", tag: "PRO", isPro: true },
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

const MINI_APP_SHOWCASE = [
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

const ALGO_DEMO_NUMS = [2, 4, 6, 8, 10, 15];
const ALGO_DEMO_STATES = [
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

export default function ExploreScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width > 0 && width < 780;

  const [selectedFeatureIdx, setSelectedFeatureIdx] = useState<number>(0);
  const [algoStepIdx, setAlgoStepIdx] = useState<number>(0);
  const [pickedBugLine, setPickedBugLine] = useState<number | null>(null);
  const [proPlan, setProPlan] = useState<"annual" | "lifetime">("annual");

  const searchParams = useLocalSearchParams<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    ref?: string;
  }>();

  const {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    ref: refCode,
  } = searchParams;

  useEffect(() => {
    captureLandingAttribution({
      path: "/explore",
      searchParams: {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        ref: refCode,
      },
      milestone: "landed_explore",
    });
  }, [utm_source, utm_medium, utm_campaign, utm_content, utm_term, refCode]);

  const activeFeature = FEATURE_SPOTLIGHTS[selectedFeatureIdx];
  const currentAlgoState =
    ALGO_DEMO_STATES[algoStepIdx % ALGO_DEMO_STATES.length];

  function handleStepAlgoSimulator() {
    const nextIdx = (algoStepIdx + 1) % ALGO_DEMO_STATES.length;
    if (ALGO_DEMO_STATES[nextIdx].matched) {
      playSuccessChime();
    } else {
      playKeyClick();
    }
    setAlgoStepIdx(nextIdx);
  }

  function handlePickBugLine(lineNum: number) {
    setPickedBugLine(lineNum);
    if (lineNum === 1) {
      playSuccessChime();
    } else {
      playErrorBuzz();
    }
  }

  const pageTitle = "Curriculum Showcase & Pro Syllabus | DevLearn Arcade";
  const pageDesc =
    "Explore Python Foundations, Algorithmic Mastery, System Architecture, playable mini-apps, and DevLearn Pro membership.";

  return (
    <SafeAreaView style={styles.safeArea}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content="/og-preview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Head>

      <MinimalPcbBackground />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          isCompact && styles.containerCompact,
        ]}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>
                🚀 DEVLEARN // SYLLABUS &amp; PRO SHOWCASE
              </Text>
            </View>
            {!isCompact && (
              <View style={styles.runtimePill}>
                <Text style={styles.runtimePillText}>
                  🐍 PYTHON 3.11 IN-BROWSER · ZERO SETUP
                </Text>
              </View>
            )}
          </View>

          <View style={styles.topBarRight}>
            <Link href={{ pathname: "/", params: { paywall: "1" } }} asChild>
              <Pressable
                onPress={() => playKeyClick()}
                style={styles.unlockProTopBtn}
              >
                <Text style={styles.unlockProTopBtnText}>
                  💎 UNLOCK PRO ACCESS →
                </Text>
              </Pressable>
            </Link>

            <Link href="/" asChild>
              <Pressable onPress={() => playKeyClick()} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← BACK TO ARCADE</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* HERO SECTION (CONCEPT A + 4-OUTFIT INTERACTIVE BYTE-CAT STAGE) */}
        <View style={[styles.heroCard, isCompact && styles.heroCardCompact]}>
          <View style={styles.heroLeft}>
            <View style={styles.heroBadgesRow}>
              <View style={styles.kickerPill}>
                <Text style={styles.kickerPillText}>
                  ⚡ INTERACTIVE CODING ARCADE &amp; PRO LABS
                </Text>
              </View>
              <View style={styles.modulesCountPill}>
                <Text style={styles.modulesCountPillText}>
                  ★ 72+ HANDS-ON MODULES
                </Text>
              </View>
            </View>

            <Text
              style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}
            >
              Stop Watching Passive Tutorials.{" "}
              <Text style={styles.heroTitleHighlight}>
                Play, Debug &amp; Master
              </Text>{" "}
              Real Engineering.
            </Text>

            <Text style={styles.heroSubtitle}>
              Write live Python 3.11 in your browser, step through animated{" "}
              <Text style={{ color: "#38BDF8", fontWeight: "800" }}>
                O(1) Algorithm Visualizers
              </Text>
              , squash production bugs in{" "}
              <Text style={{ color: "#FB7185", fontWeight: "800" }}>
                Bug Hunt Arena
              </Text>
              , crush{" "}
              <Text style={{ color: "#FFDE59", fontWeight: "800" }}>
                60s Syntax Blitz
              </Text>{" "}
              sprints, and earn{" "}
              <Text style={{ color: "#C084FC", fontWeight: "800" }}>
                Verified Career Certificates
              </Text>
              .
            </Text>

            {/* 4-Pillar Telemetry Strip */}
            <View style={styles.heroStatsGrid}>
              <View style={styles.heroStatBox}>
                <Text style={[styles.heroStatValue, { color: "#34D399" }]}>
                  3 Tracks
                </Text>
                <Text style={styles.heroStatLabel}>
                  Python · Algos · SysDesign
                </Text>
              </View>
              <View style={styles.heroStatBox}>
                <Text style={[styles.heroStatValue, { color: "#38BDF8" }]}>
                  30+ Labs
                </Text>
                <Text style={styles.heroStatLabel}>
                  Step-by-Step Visualizers
                </Text>
              </View>
              <View style={styles.heroStatBox}>
                <Text style={[styles.heroStatValue, { color: "#FB7185" }]}>
                  100+ Bugs
                </Text>
                <Text style={styles.heroStatLabel}>
                  Bug Hunt &amp; 60s Blitz
                </Text>
              </View>
              <View style={styles.heroStatBox}>
                <Text style={[styles.heroStatValue, { color: "#FFDE59" }]}>
                  16 Badges
                </Text>
                <Text style={styles.heroStatLabel}>
                  Trophy Hall &amp; Diplomas
                </Text>
              </View>
            </View>

            {/* Primary & Quick-Mode CTAs */}
            <View style={styles.heroCtaRow}>
              <Link href={{ pathname: "/", params: { paywall: "1" } }} asChild>
                <Pressable
                  onPress={() => playKeyClick()}
                  style={styles.proHeroCtaBtn}
                >
                  <Text style={styles.proHeroCtaText}>
                    👑 UNLOCK PRO MEMBERSHIP →
                  </Text>
                </Pressable>
              </Link>

              <Link
                href={{ pathname: "/", params: { track: "python_basics" } }}
                asChild
              >
                <Pressable
                  onPress={() => playKeyClick()}
                  style={styles.primaryCtaBtn}
                >
                  <Text style={styles.primaryCtaText}>
                    🐍 START FREE TRACK →
                  </Text>
                </Pressable>
              </Link>

              <Link
                href={{ pathname: "/", params: { mode: "algolab" } }}
                asChild
              >
                <Pressable
                  onPress={() => playKeyClick()}
                  style={styles.secondaryCtaBtn}
                >
                  <Text style={styles.secondaryCtaText}>🔬 ALGO LAB</Text>
                </Pressable>
              </Link>

              <Link
                href={{ pathname: "/", params: { mode: "bughunt" } }}
                asChild
              >
                <Pressable
                  onPress={() => playKeyClick()}
                  style={styles.secondaryCtaBtn}
                >
                  <Text style={styles.secondaryCtaText}>🪲 BUG HUNT</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Right Column: Interactive 4-Outfit Byte-Cat Mascot Stage */}
          <View
            style={[styles.heroRight, isCompact && styles.heroRightCompact]}
          >
            <ExploreByteCatStage />
          </View>
        </View>

        {/* ================================================================= */}
        {/* CONCEPT B: TRY-BEFORE-YOU-BUY INTERACTIVE PRO MICRO-SIMULATORS    */}
        {/* ================================================================= */}
        <View style={styles.simulatorsSectionCard}>
          <View style={styles.simulatorsHeaderRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.tryProBadge}>
                <Text style={styles.tryProBadgeText}>
                  🎮 TEST-DRIVE PRO FEATURES LIVE
                </Text>
              </View>
              <Text style={styles.sectionHeading}>
                Don&apos;t Just Read the Syllabus — Touch the Pro Engine
              </Text>
              <Text style={styles.sectionSubheading}>
                Try our interactive Two-Pointer Algorithm Visualizer and 1-Click
                Bug Hunt right here on the page.
              </Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            {/* Simulator 1: Interactive Two-Pointer O(n) Visualizer */}
            <View style={[styles.simCard, { borderColor: "#38BDF8" }]}>
              <View style={styles.simTopRow}>
                <Text style={[styles.simEyebrow, { color: "#38BDF8" }]}>
                  🔬 PRO SIMULATOR 01 // ALGO VISUALIZER LAB
                </Text>
                <View style={styles.simComplexityPill}>
                  <Text style={styles.simComplexityText}>
                    Two-Sum Sorted · O(n)
                  </Text>
                </View>
              </View>

              <Text style={styles.simPromptText}>
                Target Sum ={" "}
                <Text style={{ color: "#FFDE59", fontWeight: "900" }}>14</Text>.
                Click{" "}
                <Text style={{ color: "#38BDF8", fontWeight: "900" }}>
                  STEP POINTERS ▶
                </Text>{" "}
                to watch Left (L) and Right (R) converge in O(n) time:
              </Text>

              <View style={styles.algoArrayRow}>
                {ALGO_DEMO_NUMS.map((num, idx) => {
                  const isL = idx === currentAlgoState.l;
                  const isR = idx === currentAlgoState.r;
                  const isHit = currentAlgoState.matched && (isL || isR);
                  return (
                    <View
                      key={num}
                      style={[
                        styles.algoCell,
                        (isL || isR) && styles.algoCellPointer,
                        isHit && styles.algoCellMatched,
                      ]}
                    >
                      <Text
                        style={[
                          styles.algoCellValue,
                          (isL || isR || isHit) && { color: StudioColors.ink },
                        ]}
                      >
                        {num}
                      </Text>
                      <Text
                        style={[
                          styles.algoCellTag,
                          (isL || isR || isHit) && { color: StudioColors.ink },
                        ]}
                      >
                        {isL ? "▲ L" : isR ? "▲ R" : `idx ${idx}`}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.simStatusBar}>
                <Text
                  style={[
                    styles.simStatusText,
                    currentAlgoState.matched && { color: "#34D399" },
                  ]}
                >
                  {currentAlgoState.msg}
                </Text>
              </View>

              <View style={styles.simActionsRow}>
                <Pressable
                  onPress={handleStepAlgoSimulator}
                  style={styles.simPrimaryBtnCyan}
                >
                  <Text style={styles.simPrimaryBtnText}>
                    {currentAlgoState.matched
                      ? "↺ REPLAY SCAN"
                      : "STEP POINTERS ▶"}
                  </Text>
                </Pressable>

                <Link
                  href={{ pathname: "/", params: { mode: "algolab" } }}
                  asChild
                >
                  <Pressable
                    onPress={() => playKeyClick()}
                    style={styles.simSecondaryBtn}
                  >
                    <Text style={styles.simSecondaryBtnText}>
                      OPEN FULL ALGO LAB (30+ LABS) →
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            {/* Simulator 2: Interactive 1-Click Bug Hunt */}
            <View style={[styles.simCard, { borderColor: "#FB7185" }]}>
              <View style={styles.simTopRow}>
                <Text style={[styles.simEyebrow, { color: "#FB7185" }]}>
                  🪲 PRO SIMULATOR 02 // BUG HUNT ARENA
                </Text>
                <View
                  style={[
                    styles.simComplexityPill,
                    { borderColor: "#FB7185" },
                  ]}
                >
                  <Text style={[styles.simComplexityText, { color: "#FB7185" }]}>
                    Tap the buggy line!
                  </Text>
                </View>
              </View>

              <Text style={styles.simPromptText}>
                Why does this audit logger leak events across separate requests?
                Tap the buggy line of Python below:
              </Text>

              <View style={styles.bugCodeLinesStack}>
                {[
                  {
                    line: 1,
                    code: "1  def record_audit(event, history=[]):",
                  },
                  {
                    line: 2,
                    code: "2      history.append(event)",
                  },
                  {
                    line: 3,
                    code: "3      return len(history)",
                  },
                ].map((item) => {
                  const isPicked = pickedBugLine === item.line;
                  const isCorrect = isPicked && item.line === 1;
                  const isWrong = isPicked && item.line !== 1;
                  return (
                    <Pressable
                      key={item.line}
                      onPress={() => handlePickBugLine(item.line)}
                      style={[
                        styles.bugCodeLineBtn,
                        isCorrect && styles.bugCodeLineCorrect,
                        isWrong && styles.bugCodeLineWrong,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bugCodeLineText,
                          (isCorrect || isWrong) && {
                            color: StudioColors.ink,
                            fontWeight: "900",
                          },
                        ]}
                      >
                        {item.code}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.simStatusBar}>
                <Text
                  style={[
                    styles.simStatusText,
                    pickedBugLine === 1
                      ? { color: "#34D399" }
                      : pickedBugLine !== null
                        ? { color: "#FB7185" }
                        : { color: "#FFDE59" },
                  ]}
                >
                  {pickedBugLine === null
                    ? "👆 Tap Line 1, 2, or 3 above to diagnose the production bug (+50 XP)"
                    : pickedBugLine === 1
                      ? "✅ BINGO! Mutable default list `history=[]` is shared across all calls! (+50 XP)"
                      : "❌ Not quite — inspect the default parameter in Line 1 (`history=[]`)!"}
                </Text>
              </View>

              <View style={styles.simActionsRow}>
                <Link
                  href={{ pathname: "/", params: { mode: "bughunt" } }}
                  asChild
                >
                  <Pressable
                    onPress={() => playKeyClick()}
                    style={styles.simPrimaryBtnCoral}
                  >
                    <Text style={styles.simPrimaryBtnText}>
                      HUNT ALL 100+ BUGS →
                    </Text>
                  </Pressable>
                </Link>

                <Link
                  href={{ pathname: "/", params: { mode: "achievements" } }}
                  asChild
                >
                  <Pressable
                    onPress={() => playKeyClick()}
                    style={styles.simSecondaryBtn}
                  >
                    <Text style={styles.simSecondaryBtnText}>
                      VIEW 100-BUG CENTURION BADGE →
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* CONCEPT A: 6-FEATURE INTERACTIVE COMMAND DECK                     */}
        {/* ================================================================= */}
        <View style={styles.commandDeckCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionEyebrow, { color: "#38BDF8" }]}>
              ★ INSIDE THE DEVLEARN ENGINE
            </Text>
            <Text style={styles.sectionHeading}>
              6 Gripping Features That Make Learning Addictive
            </Text>
          </View>

          {/* 6 Feature Tabs */}
          <View style={styles.featureTabsGrid}>
            {FEATURE_SPOTLIGHTS.map((item, idx) => {
              const isSelected = idx === selectedFeatureIdx;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    playKeyClick();
                    setSelectedFeatureIdx(idx);
                  }}
                  style={[
                    styles.featureTabCard,
                    isSelected && {
                      backgroundColor: "#232A45",
                      borderColor: item.accent,
                    },
                  ]}
                >
                  <Text
                    style={[styles.featureTabTag, { color: item.accent }]}
                  >
                    {item.tabTag}
                  </Text>
                  <Text style={styles.featureTabTitle}>{item.tabTitle}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Active Feature Stage */}
          <View
            style={[
              styles.featureStageBox,
              { borderColor: activeFeature.accent },
            ]}
          >
            <View style={styles.featureStageLeft}>
              <View
                style={[
                  styles.featureStageBadge,
                  { backgroundColor: activeFeature.accent },
                ]}
              >
                <Text style={styles.featureStageBadgeText}>
                  {activeFeature.badge}
                </Text>
              </View>
              <Text style={styles.featureStageTitle}>
                {activeFeature.title}
              </Text>
              <Text style={styles.featureStageDesc}>
                {activeFeature.description}
              </Text>
              <Text style={styles.featureStageProHook}>
                {activeFeature.proHook}
              </Text>

              <View style={styles.featureStageCtaRow}>
                <Link
                  href={{ pathname: "/", params: activeFeature.hrefParams }}
                  asChild
                >
                  <Pressable
                    onPress={() => playKeyClick()}
                    style={StyleSheet.flatten([
                      styles.featureStageBtn,
                      { backgroundColor: activeFeature.accent },
                    ])}
                  >
                    <Text style={styles.featureStageBtnText}>
                      {activeFeature.ctaLabel}
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            <View style={styles.featureStageRight}>
              <View style={styles.terminalHeaderBar}>
                <Text style={styles.terminalHeaderText}>
                  ● LIVE TELEMETRY PREVIEW
                </Text>
                <Text style={styles.terminalStatusText}>READY ✓</Text>
              </View>
              <Text style={styles.terminalCodeText}>
                {activeFeature.codePreview}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive Live Python Mini-Sandbox */}
        <ExplorePythonSandbox isCompact={isCompact} />

        {/* ================================================================= */}
        {/* SECTION 1: 3 STRUCTURED MASTERY TRACKS                            */}
        {/* ================================================================= */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>📚 FULL SYLLABUS BREAKDOWN</Text>
            <Text style={styles.sectionHeading}>
              3 Structured Mastery Tracks · From First Variable to System
              Architect
            </Text>
            <Text style={styles.sectionSubheading}>
              Start free with 24 Python Foundations modules, plus test-drive 1
              Free Preview Challenge in both Pro tracks.
            </Text>
          </View>

          <View style={styles.gridRow}>
            {TRACK_SYLLABUS.map((item) => {
              const theme = TrackThemes[item.key];
              return (
                <View
                  key={item.key}
                  style={[
                    styles.trackCard,
                    theme.isPro && { borderColor: theme.stickerBg },
                  ]}
                >
                  <View style={styles.trackCardTop}>
                    <View
                      style={[
                        styles.trackBadge,
                        { backgroundColor: theme.stickerBg },
                      ]}
                    >
                      <Text style={styles.trackBadgeText}>{item.badge}</Text>
                    </View>
                    <Text
                      style={[
                        styles.trackModuleTagText,
                        { color: theme.stickerBg },
                      ]}
                    >
                      {item.moduleTag}
                    </Text>
                  </View>

                  <Text style={styles.trackTitle}>{theme.label}</Text>
                  <Text style={styles.trackSub}>{item.chapters}</Text>
                  <Text style={styles.trackDesc}>{theme.subtitle}</Text>

                  <View style={styles.chapterBreakdownList}>
                    {item.chapterBreakdown.map((ch) => (
                      <View key={ch.label} style={styles.chapterBreakdownRow}>
                        <Text
                          style={[
                            styles.chapterBreakdownLabel,
                            !ch.isPro &&
                              theme.isPro && {
                                color: "#34D399",
                                fontWeight: "800",
                              },
                          ]}
                        >
                          {ch.label}
                        </Text>
                        <Text
                          style={[
                            styles.chapterBreakdownTag,
                            {
                              color: ch.isPro ? theme.stickerBg : "#34D399",
                            },
                          ]}
                        >
                          {ch.tag}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Link
                    href={{ pathname: "/", params: { track: item.key } }}
                    asChild
                  >
                    <Pressable
                      onPress={() => playKeyClick()}
                      style={StyleSheet.flatten([
                        styles.cardActionBtn,
                        { backgroundColor: theme.stickerBg },
                      ])}
                    >
                      <Text style={styles.cardActionText}>{item.ctaLabel}</Text>
                    </Pressable>
                  </Link>
                </View>
              );
            })}
          </View>
        </View>

        {/* ================================================================= */}
        {/* SECTION 2: CHAPTER VI PLAYABLE MINI-APPS                          */}
        {/* ================================================================= */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>🎮 CHAPTER VI SHOWCASE</Text>
            <Text style={styles.sectionHeading}>
              4 Playable Python Mini-Apps You Build &amp; Keep
            </Text>
          </View>

          <View style={styles.gridRow}>
            {MINI_APP_SHOWCASE.map((mini) => (
              <Link
                key={mini.id}
                href={{ pathname: "/", params: { lesson: mini.id } }}
                asChild
              >
                <Pressable
                  onPress={() => playKeyClick()}
                  style={styles.miniCard}
                >
                  <View
                    style={[
                      styles.miniTagPill,
                      { backgroundColor: mini.accent },
                    ]}
                  >
                    <Text style={styles.miniTagText}>{mini.tag}</Text>
                  </View>
                  <Text style={styles.miniTitle}>{mini.title}</Text>
                  <Text style={styles.miniSummary}>{mini.summary}</Text>
                  <Text style={styles.miniLaunchLink}>PLAY MINI-APP →</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* ================================================================= */}
        {/* GRIPPING PRO MEMBERSHIP COMPARISON VAULT                          */}
        {/* ================================================================= */}
        <View style={styles.proVaultCard}>
          <View style={styles.proVaultHeader}>
            <View style={styles.proVaultHeaderCopy}>
              <View style={styles.proVaultKicker}>
                <Text style={styles.proVaultKickerText}>
                  👑 DEVLEARN PRO MEMBERSHIP · FULL STUDIO UNLOCK
                </Text>
              </View>
              <Text style={styles.proVaultTitle}>
                Why Serious Learners Upgrade to{" "}
                <Text style={{ color: "#FFDE59" }}>DevLearn Pro</Text>
              </Text>
              <Text style={styles.proVaultSubtitle}>
                Unlock all 3 engineering tracks, 30+ interactive algorithm
                visualizers, unlimited Bug Hunt &amp; Blitz arenas, and official
                certificates.
              </Text>
            </View>

            {/* Billing Plan Switcher */}
            <View style={styles.planSwitcherBox}>
              <Pressable
                onPress={() => {
                  playKeyClick();
                  setProPlan("annual");
                }}
                style={[
                  styles.planSwitchBtn,
                  proPlan === "annual" && styles.planSwitchBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.planSwitchBtnText,
                    proPlan === "annual" && styles.planSwitchBtnTextActive,
                  ]}
                >
                  ANNUAL ($4.99/mo · SAVE 45%)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  playKeyClick();
                  setProPlan("lifetime");
                }}
                style={[
                  styles.planSwitchBtn,
                  proPlan === "lifetime" && styles.planSwitchBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.planSwitchBtnText,
                    proPlan === "lifetime" && styles.planSwitchBtnTextActive,
                  ]}
                >
                  LIFETIME ($79 ONCE)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Free vs Pro Columns */}
          <View style={styles.proComparisonRow}>
            {/* Free Tier Card */}
            <View style={styles.freeTierCard}>
              <View style={styles.tierHeaderRow}>
                <Text style={styles.tierLabelText}>STARTER PASS</Text>
                <Text style={styles.freePriceText}>$0 FOREVER</Text>
              </View>
              <Text style={styles.tierNameText}>Free Explorer Tier</Text>

              <View style={styles.tierPerksList}>
                <Text style={styles.tierPerkIncluded}>
                  ✓ Full Track 1: Python Foundations (24 Modules)
                </Text>
                <Text style={styles.tierPerkIncluded}>
                  ✓ All 4 Playable Chapter VI Python Mini-Apps
                </Text>
                <Text style={styles.tierPerkIncluded}>
                  ✓ 1 Free Preview Module in Algorithms &amp; System Design
                </Text>
                <Text style={styles.tierPerkLocked}>
                  🔒 Full Algorithmic Mastery Track (Locked)
                </Text>
                <Text style={styles.tierPerkLocked}>
                  🔒 Full System Architecture Track (Locked)
                </Text>
                <Text style={styles.tierPerkLocked}>
                  🔒 30+ Interactive Algo Visualizer Labs (Locked)
                </Text>
              </View>

              <Link
                href={{ pathname: "/", params: { track: "python_basics" } }}
                asChild
              >
                <Pressable
                  onPress={() => playKeyClick()}
                  style={styles.freeTierBtn}
                >
                  <Text style={styles.freeTierBtnText}>
                    START FREE PYTHON TRACK →
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Pro Tier Card */}
            <View style={styles.proTierCard}>
              <View style={styles.tierHeaderRow}>
                <View style={styles.mostPopularBadge}>
                  <Text style={styles.mostPopularBadgeText}>
                    👑 MOST POPULAR · ALL-ACCESS PRO
                  </Text>
                </View>
                <Text style={styles.proPriceText}>
                  {proPlan === "annual"
                    ? "$4.99 / month"
                    : "$79 Once · Forever"}
                </Text>
              </View>

              <Text style={styles.proTierNameText}>
                Complete 3-Track Engineering Mastery + Pro Labs
              </Text>

              <View style={styles.proPillarsGrid}>
                <View style={styles.proPillarBox}>
                  <Text style={styles.proPillarTitle}>
                    ★ All 72+ Modules Unlocked
                  </Text>
                  <Text style={styles.proPillarDesc}>
                    Full access to Python Foundations, Algorithmic Mastery &amp;
                    System Architecture.
                  </Text>
                </View>

                <View style={styles.proPillarBox}>
                  <Text style={[styles.proPillarTitle, { color: "#38BDF8" }]}>
                    ★ 30+ Algo Visualizer Labs
                  </Text>
                  <Text style={styles.proPillarDesc}>
                    Step-by-step pointer, sliding window, tree, and Big-O memory
                    animations.
                  </Text>
                </View>

                <View style={styles.proPillarBox}>
                  <Text style={[styles.proPillarTitle, { color: "#FB7185" }]}>
                    ★ Unlimited Bug Hunt &amp; Blitz
                  </Text>
                  <Text style={styles.proPillarDesc}>
                    Crush 100+ production bugs and unlock Hard Elite Centurion
                    trophies.
                  </Text>
                </View>

                <View style={styles.proPillarBox}>
                  <Text style={[styles.proPillarTitle, { color: "#34D399" }]}>
                    ★ Verified Track Diplomas
                  </Text>
                  <Text style={styles.proPillarDesc}>
                    Official shareable career certificates + instant AI Hint
                    unlocks.
                  </Text>
                </View>
              </View>

              <View style={styles.proTierFooterRow}>
                <Text style={styles.proGuaranteeText}>
                  ✓ Instant activation · Cancel anytime · Cloud progress sync
                </Text>

                <Link
                  href={{ pathname: "/", params: { paywall: "1" } }}
                  asChild
                >
                  <Pressable
                    onPress={() => playKeyClick()}
                    style={styles.joinProBtn}
                  >
                    <Text style={styles.joinProBtnText}>
                      💎 JOIN DEVLEARN PRO NOW →
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: StudioColors.bg,
  },
  scroll: {
    flex: 1,
  },
  container: {
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 72,
    gap: 32,
  },
  containerCompact: {
    paddingHorizontal: 16,
    gap: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  brandBadge: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    ...HardShadowSm,
  },
  brandBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11.5,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  runtimePill: {
    backgroundColor: "#141A2E",
    borderWidth: 1.5,
    borderColor: "#34D399",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  runtimePillText: {
    color: "#34D399",
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "800",
  },
  unlockProTopBtn: {
    backgroundColor: "#F472B6",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  unlockProTopBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11.5,
    fontWeight: "900",
  },
  backBtn: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  backBtnText: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 11.5,
    fontWeight: "900",
  },
  heroCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    backgroundColor: StudioColors.surface,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    borderRadius: 18,
    padding: 26,
    ...HardShadowHero,
  },
  heroCardCompact: {
    padding: 18,
  },
  heroLeft: {
    flex: 1.3,
    minWidth: 290,
    gap: 14,
  },
  heroBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  kickerPill: {
    backgroundColor: StudioColors.mint,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  kickerPillText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  modulesCountPill: {
    backgroundColor: "#232942",
    borderWidth: 1.5,
    borderColor: StudioColors.yellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modulesCountPillText: {
    color: StudioColors.yellow,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  heroTitle: {
    color: StudioColors.textPrimary,
    fontFamily: SerifFont,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroTitleCompact: {
    fontSize: 25,
    lineHeight: 31,
  },
  heroTitleHighlight: {
    color: StudioColors.yellow,
  },
  heroSubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 14.5,
    lineHeight: 22,
    fontWeight: "500",
  },
  heroStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  heroStatBox: {
    flexGrow: 1,
    flexBasis: 120,
    backgroundColor: "#0D101B",
    borderWidth: 2,
    borderColor: "#252C44",
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  heroStatValue: {
    fontFamily: MonoFont,
    fontSize: 16,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  heroCtaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  proHeroCtaBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  proHeroCtaText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12.5,
    fontWeight: "900",
  },
  primaryCtaBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  primaryCtaText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12.5,
    fontWeight: "900",
  },
  secondaryCtaBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  secondaryCtaText: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
  heroRight: {
    width: 340,
    maxWidth: "100%",
    alignItems: "center",
  },
  heroRightCompact: {
    width: "100%",
  },
  simulatorsSectionCard: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2.5,
    borderColor: "#34D399",
    borderRadius: 18,
    padding: 22,
    gap: 18,
    ...HardShadow,
  },
  simulatorsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
  },
  tryProBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#34D399",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  tryProBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10.5,
    fontWeight: "900",
  },
  simCard: {
    flexGrow: 1,
    flexBasis: 320,
    backgroundColor: "#0D101B",
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    ...HardShadowSm,
  },
  simTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  simEyebrow: {
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  simComplexityPill: {
    borderWidth: 1.5,
    borderColor: "#38BDF8",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  simComplexityText: {
    color: "#38BDF8",
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "800",
  },
  simPromptText: {
    color: "#E2E8F0",
    fontSize: 13,
    lineHeight: 19,
  },
  algoArrayRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  algoCell: {
    flex: 1,
    backgroundColor: "#161B2E",
    borderWidth: 2,
    borderColor: "#29304B",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    gap: 2,
  },
  algoCellPointer: {
    backgroundColor: "#FFDE59",
    borderColor: StudioColors.ink,
  },
  algoCellMatched: {
    backgroundColor: "#34D399",
    borderColor: StudioColors.ink,
  },
  algoCellValue: {
    color: "#FFFFFF",
    fontFamily: MonoFont,
    fontSize: 14,
    fontWeight: "900",
  },
  algoCellTag: {
    color: "#94A3B8",
    fontFamily: MonoFont,
    fontSize: 9.5,
    fontWeight: "800",
  },
  simStatusBar: {
    backgroundColor: "#14192B",
    borderWidth: 1.5,
    borderColor: "#252C44",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  simStatusText: {
    color: "#38BDF8",
    fontFamily: MonoFont,
    fontSize: 11.5,
    fontWeight: "800",
    lineHeight: 17,
  },
  simActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  simPrimaryBtnCyan: {
    backgroundColor: "#38BDF8",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  simPrimaryBtnCoral: {
    backgroundColor: "#FB7185",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  simPrimaryBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11.5,
    fontWeight: "900",
  },
  simSecondaryBtn: {
    backgroundColor: "#1B2138",
    borderWidth: 1.5,
    borderColor: "#333D63",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  simSecondaryBtnText: {
    color: "#E2E8F0",
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "800",
  },
  bugCodeLinesStack: {
    gap: 6,
  },
  bugCodeLineBtn: {
    backgroundColor: "#161B2E",
    borderWidth: 1.5,
    borderColor: "#29304B",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  bugCodeLineCorrect: {
    backgroundColor: "#34D399",
    borderColor: StudioColors.ink,
  },
  bugCodeLineWrong: {
    backgroundColor: "#FB7185",
    borderColor: StudioColors.ink,
  },
  bugCodeLineText: {
    color: "#E2E8F0",
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "700",
  },
  commandDeckCard: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    borderRadius: 18,
    padding: 22,
    gap: 16,
    ...HardShadow,
  },
  featureTabsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureTabCard: {
    flexGrow: 1,
    flexBasis: 145,
    backgroundColor: "#141829",
    borderWidth: 2,
    borderColor: "#29304B",
    borderRadius: 10,
    padding: 10,
    gap: 3,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  featureTabTag: {
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  featureTabTitle: {
    color: "#FFFFFF",
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
  featureStageBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    backgroundColor: "#0D101B",
    borderWidth: 2,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  featureStageLeft: {
    flex: 1.2,
    minWidth: 260,
    gap: 10,
  },
  featureStageBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  featureStageBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  featureStageTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },
  featureStageDesc: {
    color: "#CBD5E1",
    fontSize: 13.5,
    lineHeight: 20,
  },
  featureStageProHook: {
    color: "#FFDE59",
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "800",
  },
  featureStageCtaRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  featureStageBtn: {
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  featureStageBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
  featureStageRight: {
    flex: 1,
    minWidth: 250,
    backgroundColor: "#14192B",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    ...HardShadowSm,
  },
  terminalHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#26304F",
    paddingBottom: 6,
  },
  terminalHeaderText: {
    color: "#94A3B8",
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "800",
  },
  terminalStatusText: {
    color: "#34D399",
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  terminalCodeText: {
    color: "#34D399",
    fontFamily: MonoFont,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "700",
  },
  sectionBlock: {
    gap: 14,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionEyebrow: {
    color: StudioColors.yellow,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  sectionHeading: {
    color: StudioColors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    color: StudioColors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  trackCard: {
    flexGrow: 1,
    flexBasis: 290,
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 14,
    padding: 18,
    gap: 10,
    ...HardShadow,
  },
  trackCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  trackBadge: {
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trackBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  trackModuleTagText: {
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  trackTitle: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  trackSub: {
    color: StudioColors.textMuted,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "700",
  },
  trackDesc: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  chapterBreakdownList: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#262D47",
    marginTop: 2,
    marginBottom: 4,
    flex: 1,
  },
  chapterBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  chapterBreakdownLabel: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  chapterBreakdownTag: {
    fontFamily: MonoFont,
    fontSize: 10.5,
    fontWeight: "900",
  },
  cardActionBtn: {
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  cardActionText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
  miniCard: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  miniTagPill: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  miniTagText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  miniTitle: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  miniSummary: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  miniLaunchLink: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
  },
  proVaultCard: {
    backgroundColor: "#17182B",
    borderWidth: 2.5,
    borderColor: "#FFDE59",
    borderRadius: 18,
    padding: 24,
    gap: 20,
    ...HardShadowHero,
  },
  proVaultHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: "#2E3252",
    paddingBottom: 18,
  },
  proVaultHeaderCopy: {
    flex: 1,
    minWidth: 260,
    gap: 6,
  },
  proVaultKicker: {
    alignSelf: "flex-start",
    backgroundColor: "#FFDE59",
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  proVaultKickerText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10.5,
    fontWeight: "900",
  },
  proVaultTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  proVaultSubtitle: {
    color: "#CBD5E1",
    fontSize: 13.5,
    lineHeight: 20,
  },
  planSwitcherBox: {
    flexDirection: "row",
    backgroundColor: "#0D0F1A",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  planSwitchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  planSwitchBtnActive: {
    backgroundColor: "#FFDE59",
  },
  planSwitchBtnText: {
    color: "#CBD5E1",
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "800",
  },
  planSwitchBtnTextActive: {
    color: StudioColors.ink,
    fontWeight: "900",
  },
  proComparisonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "stretch",
  },
  freeTierCard: {
    flex: 1,
    minWidth: 270,
    backgroundColor: "#0E111D",
    borderWidth: 2,
    borderColor: "#29304B",
    borderRadius: 14,
    padding: 18,
    justifyContent: "space-between",
    gap: 14,
  },
  tierHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  tierLabelText: {
    color: "#94A3B8",
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  freePriceText: {
    color: "#34D399",
    fontFamily: MonoFont,
    fontSize: 16,
    fontWeight: "900",
  },
  tierNameText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  tierPerksList: {
    gap: 8,
    flex: 1,
  },
  tierPerkIncluded: {
    color: "#E2E8F0",
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 18,
  },
  tierPerkLocked: {
    color: "#64748B",
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 18,
  },
  freeTierBtn: {
    backgroundColor: "#1C2238",
    borderWidth: 2,
    borderColor: "#333D63",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  freeTierBtnText: {
    color: "#FFFFFF",
    fontFamily: MonoFont,
    fontSize: 11.5,
    fontWeight: "900",
  },
  proTierCard: {
    flex: 1.45,
    minWidth: 300,
    backgroundColor: "#1A1E36",
    borderWidth: 2.5,
    borderColor: "#FFDE59",
    borderRadius: 14,
    padding: 20,
    justifyContent: "space-between",
    gap: 16,
    ...HardShadow,
  },
  mostPopularBadge: {
    backgroundColor: "#FFDE59",
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mostPopularBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  proPriceText: {
    color: "#FFDE59",
    fontFamily: MonoFont,
    fontSize: 18,
    fontWeight: "900",
  },
  proTierNameText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },
  proPillarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  proPillarBox: {
    flexGrow: 1,
    flexBasis: 200,
    backgroundColor: "#0E111F",
    borderWidth: 1.5,
    borderColor: "#2E3658",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  proPillarTitle: {
    color: "#FFDE59",
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
  proPillarDesc: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 17,
  },
  proTierFooterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 6,
  },
  proGuaranteeText: {
    color: "#34D399",
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "800",
  },
  joinProBtn: {
    backgroundColor: "#FFDE59",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  joinProBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12.5,
    fontWeight: "900",
  },
});
