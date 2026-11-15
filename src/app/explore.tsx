"use no memo";

import { Link, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import type { Metadata } from "expo-router/server";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getKeyboardAvoidingBehavior } from "../utils/mobileLayout";
import ExploreByteCatStage from "../components/ExploreByteCatStage";
import ExplorePythonSandbox from "../components/ExplorePythonSandbox";
import MinimalPcbBackground from "../components/MinimalPcbBackground";
import { Text } from "../components/StudioIcon";
import {
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  ALGO_DEMO_NUMS,
  ALGO_DEMO_STATES,
  FEATURE_SPOTLIGHTS,
  MINI_APP_SHOWCASE,
  TRACK_SYLLABUS,
} from "../constants/exploreShowcaseData";
import { createExploreStyles } from "../components/exploreStyles";
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


export default function ExploreScreen() {
  const { themeMode } = useTheme();
  const styles = useThemedStyles(createExploreStyles);
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

      <MinimalPcbBackground themeMode={themeMode} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={getKeyboardAvoidingBehavior(Platform.OS)}
      >
        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

