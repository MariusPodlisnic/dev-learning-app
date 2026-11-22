import { router } from "expo-router";
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { HardShadow, HardShadowSm, MonoFont, StudioColors } from "../constants/theme";
import type { HologramShapeId } from "../utils/hologramShapes";
import { playKeyClick } from "../utils/soundEffects";
import ShowcaseOrbitBackdrop from "./ShowcaseOrbitBackdrop";
import { StudioIcon, type StudioIconName, Text } from "./StudioIcon";

interface ShowcaseFeatureItem {
  id: string;
  icon: StudioIconName;
  accent: string;
  tag: string;
  title: string;
  description: string;
  shape: HologramShapeId;
}

const SHOWCASE_FEATURES: readonly ShowcaseFeatureItem[] = [
  {
    id: "feat-ide",
    icon: "nav_studio",
    accent: "#38BDF8",
    tag: "IN-BROWSER IDE",
    title: "Live Python 3.11 Studio",
    description:
      "Run real Python instantly via WebAssembly Pyodide with automated unit tests, assertion diffs, smart indentation, and zero setup.",
    shape: "cyber_desk",
  },
  {
    id: "feat-algo",
    icon: "nav_algolab",
    accent: "#C084FC",
    tag: "8 TRACE ENGINES",
    title: "Visual Algorithm Lab",
    description:
      "Step frame-by-frame through Two Pointers, Binary Search, Recursion Stacks, Min-Heaps, Graph BFS, DP Tables, and live Big-O Races.",
    shape: "neural_crown",
  },
  {
    id: "feat-arcade",
    icon: "nav_arcade",
    accent: "#FF90E8",
    tag: "6 CARTRIDGES",
    title: "Cozy Mini-Game Arcade",
    description:
      "Play 60s Syntax Blitz, Bug Hunt Incidents, Output Detective, Rapid Flashcards, Python Playground, and playable Cozy Mini-Builds.",
    shape: "gamepad",
  },
  {
    id: "feat-map",
    icon: "nav_skillmap",
    accent: "#FFDE59",
    tag: "3 STRUCTURED TRACKS",
    title: "Guided Skill Map",
    description:
      "Follow a clear progression from Python Basics through Algorithms & Data Structures into Hyperscale System Design architecture labs.",
    shape: "code_orrery",
  },
  {
    id: "feat-lofi",
    icon: "devlearn_logo",
    accent: "#B8FF3B",
    tag: "COZY FLOW STATE",
    title: "Lo-Fi Dev Loft & Focus",
    description:
      "Code inside a living 2.5D isometric desk loft with a Pomodoro sprint timer, mechanical keycap acoustics, Lo-Fi radio, and 4 studio themes.",
    shape: "cyber_desk",
  },
  {
    id: "feat-garden",
    icon: "nav_achievements",
    accent: "#6EE7B7",
    tag: "RETENTION & PROOF",
    title: "Spaced Review & Pixel Garden",
    description:
      "Lock concepts into long-term memory with automatic spaced review queues, Weekly Leagues, PNG developer cards, and track diplomas.",
    shape: "neural_crown",
  },
] as const;

const FREE_TRACK_POINTS = [
  {
    lead: "Complete Track 01 (28 Modules):",
    detail: "7 chapters + practice drills + Chapter VI playable mini-apps",
  },
  {
    lead: "Browser Python 3.11 IDE:",
    detail: "Instant execution, unit tests, and beginner debug helpers",
  },
  {
    lead: "Cozy Arcade Access:",
    detail: "Python Blitz, Flashcards, Output Detective, Playground & Mini-Builds",
  },
  {
    lead: "Free Track Previews:",
    detail: "Starter lessons unlocked in Algorithms & System Design tracks",
  },
  {
    lead: "Habit & Progress Loop:",
    detail: "Daily Quests, Streaks, 12-Week Pixel Garden & Cloud Sync",
  },
] as const;

const PRO_TRACK_POINTS = [
  {
    lead: "Full Track 02 — Algorithms & DS:",
    detail: "Sliding Window, Hash Maps, Binary Search, Trees, Graphs, Heaps & DP",
  },
  {
    lead: "Full Track 03 — System Design Labs:",
    detail: "Interactive Load Balancers, Redis Caching, Rate Limiters, Sharding & Queues",
  },
  {
    lead: "8-Engine Algo Visualizer & Big-O Racer:",
    detail: "Live step-by-step pointer, memory, and throughput simulations",
  },
  {
    lead: "Full Bug Hunt & Elite Arcade Decks:",
    detail: "All 25 production Bug Hunt incidents + Algo & Systems Blitz decks",
  },
  {
    lead: "Verified Diplomas & Pro Themes:",
    detail: "Track Certificates, Solution Diffs, and 4 Studio Palettes",
  },
] as const;

const EMPTY_SUBSCRIBE = () => () => {};

interface ShowcaseLandingScreenProps {
  onEnterHome?: () => void;
}

export default function ShowcaseLandingScreen({
  onEnterHome,
}: ShowcaseLandingScreenProps = {}) {
  const isMounted = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false,
  );
  const { width: rawWindowWidth, height: rawWindowHeight } = useWindowDimensions();
  const windowWidth = isMounted && rawWindowWidth > 0 ? rawWindowWidth : 1280;
  const windowHeight = isMounted && rawWindowHeight > 0 ? rawWindowHeight : 800;
  const isCompact = windowWidth > 0 && windowWidth < 860;
  const isPhone = windowWidth > 0 && windowWidth < 560;

  const [activeShape, setActiveShape] = useState<HologramShapeId>("code_orrery");
  const [activeSection, setActiveSection] = useState<"top" | "features" | "tracks">("top");
  const [isWarping, setIsWarping] = useState<boolean>(false);

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const featuresYRef = useRef<number>(720);
  const tracksYRef = useRef<number>(1420);
  const warpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (warpTimerRef.current) {
        clearTimeout(warpTimerRef.current);
      }
    };
  }, []);

  function handleBeginAdventure() {
    if (isWarping) return;
    playKeyClick();
    setIsWarping(true);
    warpTimerRef.current = setTimeout(() => {
      if (onEnterHome) {
        onEnterHome();
      } else {
        router.push("/?home=1");
      }
    }, 420);
  }

  function scrollToSection(section: "top" | "features" | "tracks") {
    playKeyClick();
    setActiveSection(section);
    const targetY =
      section === "top"
        ? 0
        : section === "features"
          ? Math.max(0, featuresYRef.current - 72)
          : Math.max(0, tracksYRef.current - 72);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }

  const heroMinHeight = Math.max(540, Math.min(windowHeight || 780, 920));

  return (
    <View style={styles.root}>
      {/* Live 3D WebGL Lo-Fi Arcade Orbit + Cel-Shaded Parallax Backdrop */}
      <ShowcaseOrbitBackdrop activeShape={activeShape} isWarping={isWarping} />

      {/* Minimal Top Navigation Bar */}
      <View
        style={[
          styles.topBar,
          isPhone && styles.topBarPhone,
          Platform.OS === "web" ? ({ position: "fixed" } as any) : null,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scroll to top of Devy Showcase"
          style={styles.brandGroup}
          onPress={() => scrollToSection("top")}
        >
          <View style={styles.brandSquare}>
            <StudioIcon name="devlearn_logo" size={18} />
          </View>
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>DEVY</Text>
            {!isPhone ? (
              <Text style={styles.brandSub}>Interactive Studio</Text>
            ) : null}
          </View>
        </Pressable>

        <View style={styles.topActions}>
          {!isPhone ? (
            <>
              <Pressable
                accessibilityRole="button"
                style={styles.topGhostBtn}
                onPress={() => scrollToSection("features")}
              >
                <Text style={styles.topGhostText}>Features</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.topGhostBtn}
                onPress={() => scrollToSection("tracks")}
              >
                <Text style={styles.topGhostText}>Free vs Pro</Text>
              </Pressable>
            </>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Devy Studio Home"
            style={({ pressed }) => [
              styles.topPrimaryBtn,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={handleBeginAdventure}
          >
            <Text style={styles.topPrimaryText}>Open Studio</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (y >= tracksYRef.current - 320) {
            setActiveSection("tracks");
          } else if (y >= featuresYRef.current - 320) {
            setActiveSection("features");
          } else {
            setActiveSection("top");
          }
        }}
      >
        {/* FULL-BLEED CINEMATIC HERO — 100% open over the live 3D hologram */}
        <View
          style={[
            styles.heroSection,
            { minHeight: heroMinHeight },
            isPhone && styles.heroSectionPhone,
          ]}
        >
          <View style={styles.heroInner}>
            <View style={styles.heroEyebrow}>
              <View style={styles.liveDot} />
              <Text style={styles.heroEyebrowText}>
                LO-FI CODING STUDIO · 249 INTERACTIVE LESSONS & DRILLS
              </Text>
            </View>

            <Text
              style={[
                styles.heroHeadline,
                isCompact && styles.heroHeadlineCompact,
                isPhone && styles.heroHeadlinePhone,
                Platform.OS === "web"
                  ? ({
                      textShadow:
                        "0 3px 0 #090616, 0 8px 26px rgba(5, 2, 14, 0.98), 0 0 44px rgba(5, 2, 14, 0.95)",
                    } as any)
                  : null,
              ]}
            >
              {"Code Like It's\n"}
              <Text style={styles.heroAccentWord}>an Adventure.</Text>
            </Text>

            <Text
              style={[
                styles.heroSubtitle,
                isPhone && styles.heroSubtitlePhone,
                Platform.OS === "web"
                  ? ({
                      textShadow:
                        "0 2px 14px rgba(4, 2, 12, 1), 0 0 28px rgba(4, 2, 12, 0.96), 0 1px 2px rgba(0, 0, 0, 1)",
                    } as any)
                  : null,
              ]}
            >
              Cozy retro vibes meet serious engineering — write live Python 3.11
              in your browser, step through 8 visual algorithm engines, play 6
              coding mini-games, and earn track diplomas.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Begin Your Adventure"
              style={({ pressed }) => [
                styles.adventureBtn,
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
              onHoverIn={() => setActiveShape("cyber_desk")}
              onPress={handleBeginAdventure}
            >
              <Text style={styles.adventureBtnText}>Begin Your Adventure</Text>
              <View style={styles.adventureArrowBox}>
                <Text style={styles.adventureArrowText}>→</Text>
              </View>
            </Pressable>

            <View style={styles.microStatsRow}>
              {[
                "PYTHON 3.11 IN BROWSER",
                "8 VISUALIZER ENGINES",
                "6 ARCADE CARTRIDGES",
                "3 CAREER TRACKS",
              ].map((stat) => (
                <View key={stat} style={styles.microPill}>
                  <Text style={styles.microPillText}>{stat}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* KEY FEATURES SECTION (No kicker label) */}
        <View
          style={[styles.sectionWrap, isPhone && styles.sectionWrapPhone]}
          onLayout={(e) => {
            featuresYRef.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                isPhone && styles.sectionTitlePhone,
                Platform.OS === "web"
                  ? ({
                      textShadow:
                        "0 2px 0 #090616, 0 6px 24px rgba(5, 2, 14, 0.98), 0 0 32px rgba(5, 2, 14, 0.92)",
                    } as any)
                  : null,
              ]}
            >
              Everything built to make concepts click.
            </Text>
            <Text
              style={[
                styles.sectionLead,
                Platform.OS === "web"
                  ? ({
                      textShadow:
                        "0 2px 12px rgba(4, 2, 12, 1), 0 0 24px rgba(4, 2, 12, 0.95)",
                    } as any)
                  : null,
              ]}
            >
              Hover any card to morph the live 3D particle sculpture behind the
              page. Every studio mode syncs XP, streaks, and your 12-week Cozy
              Pixel Garden.
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {SHOWCASE_FEATURES.map((feat) => (
              <Pressable
                key={feat.id}
                accessibilityRole="button"
                accessibilityLabel={feat.title}
                style={({ pressed }) => [
                  styles.featureCard,
                  isCompact && styles.featureCardCompact,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onHoverIn={() => setActiveShape(feat.shape)}
                onPress={() => setActiveShape(feat.shape)}
              >
                <View style={styles.featureTopRow}>
                  <View
                    style={[
                      styles.featureIconBox,
                      { backgroundColor: feat.accent },
                    ]}
                  >
                    <StudioIcon name={feat.icon} size={18} />
                  </View>
                  <View style={styles.featureTagChip}>
                    <Text style={styles.featureTagText}>{feat.tag}</Text>
                  </View>
                </View>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FREE VS PRO TRACKS SECTION (No kicker label) */}
        <View
          style={[styles.sectionWrap, isPhone && styles.sectionWrapPhone]}
          onLayout={(e) => {
            tracksYRef.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                isPhone && styles.sectionTitlePhone,
                Platform.OS === "web"
                  ? ({
                      textShadow:
                        "0 2px 0 #090616, 0 6px 24px rgba(5, 2, 14, 0.98), 0 0 32px rgba(5, 2, 14, 0.92)",
                    } as any)
                  : null,
              ]}
            >
              Start free forever. Go Pro when you want depth.
            </Text>
            <Text
              style={[
                styles.sectionLead,
                Platform.OS === "web"
                  ? ({
                      textShadow:
                        "0 2px 12px rgba(4, 2, 12, 1), 0 0 24px rgba(4, 2, 12, 0.95)",
                    } as any)
                  : null,
              ]}
            >
              No credit card needed to launch the studio. The full Python
              Foundations track and core Arcade cartridges are open from minute
              one.
            </Text>
          </View>

          <View style={[styles.tracksGrid, isCompact && styles.tracksGridCompact]}>
            {/* FREE TRACK CARD */}
            <Pressable
              style={[styles.trackCard, isCompact && styles.trackCardCompact]}
              onHoverIn={() => setActiveShape("cyber_desk")}
            >
              <View style={styles.trackTopRow}>
                <View style={styles.tierPillFree}>
                  <Text style={styles.tierPillDarkText}>FREE TRACK</Text>
                </View>
                <Text style={styles.trackPriceText}>$0 FOREVER</Text>
              </View>

              <Text style={styles.trackTitle}>Python Foundations & Arcade</Text>
              <Text style={styles.trackSummary}>
                Master Python from your very first variable to comprehensions,
                OOP, decorators, and 4 playable mini-apps — plus free preview
                lessons in Algorithms & System Design.
              </Text>

              <View style={styles.trackBullets}>
                {FREE_TRACK_POINTS.map((item) => (
                  <View key={item.lead} style={styles.bulletRow}>
                    <View style={styles.checkFreeBox}>
                      <Text style={styles.checkFreeText}>✓</Text>
                    </View>
                    <Text style={styles.bulletText}>
                      <Text style={styles.bulletLead}>{item.lead} </Text>
                      {item.detail}
                    </Text>
                  </View>
                ))}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start Free Adventure"
                style={({ pressed }) => [
                  styles.trackCtaFree,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={handleBeginAdventure}
              >
                <Text style={styles.trackCtaFreeText}>START FREE ADVENTURE →</Text>
              </Pressable>
            </Pressable>

            {/* PRO TRACK CARD */}
            <Pressable
              style={[
                styles.trackCard,
                styles.trackCardPro,
                isCompact && styles.trackCardCompact,
              ]}
              onHoverIn={() => setActiveShape("neural_crown")}
            >
              <View style={styles.trackTopRow}>
                <View style={styles.tierPillPro}>
                  <Text style={styles.tierPillDarkText}>DEVY PRO</Text>
                </View>
                <Text style={styles.trackPriceTextPro}>FULL SYSTEMS SUITE</Text>
              </View>

              <Text style={styles.trackTitle}>Algorithms, Systems & Elite Labs</Text>
              <Text style={styles.trackSummary}>
                Unlock the complete interview and backend architecture
                curriculum — built for engineers leveling up to senior
                algorithmic and distributed-systems fluency.
              </Text>

              <View style={styles.trackBullets}>
                {PRO_TRACK_POINTS.map((item) => (
                  <View key={item.lead} style={styles.bulletRow}>
                    <View style={styles.checkProBox}>
                      <Text style={styles.checkProText}>★</Text>
                    </View>
                    <Text style={styles.bulletText}>
                      <Text style={styles.bulletLead}>{item.lead} </Text>
                      {item.detail}
                    </Text>
                  </View>
                ))}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Explore Studio and Pro"
                style={({ pressed }) => [
                  styles.trackCtaPro,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={handleBeginAdventure}
              >
                <Text style={styles.trackCtaProText}>EXPLORE STUDIO & PRO →</Text>
              </Pressable>
            </Pressable>
          </View>
        </View>

        {/* CLOSING TELEPORT CTA BAND */}
        <View style={[styles.sectionWrap, styles.footerWrap, isPhone && styles.sectionWrapPhone]}>
          <View style={[styles.footerBand, isCompact && styles.footerBandCompact]}>
            <View style={styles.footerCopyWrap}>
              <Text style={styles.footerTitle}>
                Teleport straight to your interactive coding desk.
              </Text>
              <Text style={styles.footerSub}>
                Zero downloads. Instant Python 3.11, Lo-Fi Focus Studio, and all 3 skill tracks.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Begin Your Adventure from footer"
              style={({ pressed }) => [
                styles.adventureBtn,
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
              onPress={handleBeginAdventure}
            >
              <Text style={styles.adventureBtnText}>Begin Your Adventure</Text>
              <View style={styles.adventureArrowBox}>
                <Text style={styles.adventureArrowText}>→</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Quick-Jump Dock */}
      <View
        style={[
          styles.dockWrap,
          Platform.OS === "web" ? ({ position: "fixed" } as any) : null,
        ]}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.floatingDock,
            isPhone && styles.floatingDockPhone,
          ]}
        >
          {!isPhone ? <Text style={styles.dockLogo}>D.</Text> : null}
          <Pressable
            accessibilityRole="button"
            style={[
              styles.dockBtn,
              activeSection === "top" && styles.dockBtnActive,
            ]}
            onPress={() => scrollToSection("top")}
          >
            <Text
              style={[
                styles.dockBtnText,
                activeSection === "top" && styles.dockBtnTextActive,
              ]}
            >
              Overview
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.dockBtn,
              activeSection === "features" && styles.dockBtnActive,
            ]}
            onPress={() => scrollToSection("features")}
          >
            <Text
              style={[
                styles.dockBtnText,
                activeSection === "features" && styles.dockBtnTextActive,
              ]}
            >
              Features
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.dockBtn,
              activeSection === "tracks" && styles.dockBtnActive,
            ]}
            onPress={() => scrollToSection("tracks")}
          >
            <Text
              style={[
                styles.dockBtnText,
                activeSection === "tracks" && styles.dockBtnTextActive,
              ]}
            >
              Free vs Pro
            </Text>
          </Pressable>
          {!isPhone ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Teleport to Home from dock"
              style={styles.dockCta}
              onPress={handleBeginAdventure}
            >
              <Text style={styles.dockCtaText}>Begin Adventure →</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Hyperspace Warp Flash Overlay While Teleporting */}
      {isWarping ? (
        <View
          testID="showcase-warp-overlay"
          style={[
            styles.warpOverlay,
            Platform.OS === "web" ? ({ position: "fixed" } as any) : null,
          ]}
        >
          <Text style={styles.warpLabel}>TELEPORTING TO DEVY HOME STUDIO...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#090616",
  },
  topBar: {
    position: "absolute",
    top: 14,
    left: 20,
    right: 20,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "rgba(11, 8, 24, 0.86)",
    borderWidth: 2,
    borderColor: "#090B10",
    ...HardShadowSm,
  },
  topBarPhone: {
    top: 10,
    left: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  brandSquare: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  brandSub: {
    color: "#D9D2EC",
    fontSize: 12,
    fontWeight: "700",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topGhostBtn: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  topGhostText: {
    color: "#F3EEFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  topPrimaryBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  topPrimaryText: {
    color: StudioColors.ink,
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  scroll: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 112,
  },
  heroSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 96,
    paddingBottom: 92,
    paddingHorizontal: 20,
  },
  heroSectionPhone: {
    paddingTop: 84,
    paddingBottom: 80,
    paddingHorizontal: 12,
  },
  heroInner: {
    width: "100%",
    maxWidth: 820,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  heroEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(18, 12, 36, 0.94)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 222, 89, 0.48)",
    marginBottom: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: StudioColors.lime,
  },
  heroEyebrowText: {
    color: "#FFF4C2",
    fontSize: 10.5,
    lineHeight: 13,
    includeFontPadding: false,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.9,
    textAlign: "center",
    flexShrink: 1,
  },
  heroHeadline: {
    color: "#FFFFFF",
    fontSize: 68,
    lineHeight: 72,
    fontWeight: "900",
    letterSpacing: -1.8,
    textAlign: "center",
    marginBottom: 18,
    textShadowColor: "rgba(4, 2, 12, 0.98)",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 20,
  },
  heroHeadlineCompact: {
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.2,
  },
  heroHeadlinePhone: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.9,
  },
  heroAccentWord: {
    color: "#FFDE59",
  },
  heroSubtitle: {
    color: "#FFFFFF",
    fontSize: 17.5,
    lineHeight: 27,
    fontWeight: "700",
    textAlign: "center",
    maxWidth: 620,
    marginBottom: 28,
    textShadowColor: "rgba(4, 2, 12, 0.98)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 14,
  },
  heroSubtitlePhone: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  adventureBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingLeft: 22,
    paddingRight: 7,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "#141026",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    ...HardShadow,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  adventureBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 18,
    includeFontPadding: false,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  adventureArrowBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  adventureArrowText: {
    color: StudioColors.ink,
    fontSize: 18,
    lineHeight: 20,
    includeFontPadding: false,
    fontWeight: "900",
  },
  microStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  microPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(18, 12, 36, 0.92)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  microPillText: {
    color: "#F3EEFF",
    fontSize: 10,
    lineHeight: 12,
    includeFontPadding: false,
    fontWeight: "800",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  sectionWrap: {
    width: "100%",
    maxWidth: 1120,
    paddingHorizontal: 22,
    paddingVertical: 38,
    gap: 22,
  },
  sectionWrapPhone: {
    paddingHorizontal: 14,
    paddingVertical: 28,
  },
  sectionHeader: {
    alignSelf: "flex-start",
    maxWidth: 680,
    gap: 8,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -0.9,
    textShadowColor: "rgba(4, 2, 12, 0.96)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  sectionTitlePhone: {
    fontSize: 26,
    lineHeight: 31,
  },
  sectionLead: {
    color: "#F8F4FF",
    fontSize: 15.5,
    lineHeight: 24,
    fontWeight: "700",
    textShadowColor: "rgba(4, 2, 12, 0.95)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    width: "100%",
  },
  featureCard: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 280,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "rgba(15, 11, 32, 0.94)",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    gap: 10,
    ...HardShadow,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  featureCardCompact: {
    minWidth: "100%",
    flexBasis: "100%",
  },
  featureTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 4,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTagChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  featureTagText: {
    color: "#FFF4C2",
    fontSize: 9.5,
    lineHeight: 12,
    includeFontPadding: false,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  featureDesc: {
    color: "#E4DEF5",
    fontSize: 13.5,
    lineHeight: 21,
    fontWeight: "500",
  },
  tracksGrid: {
    flexDirection: "row",
    gap: 18,
    width: "100%",
  },
  tracksGridCompact: {
    flexDirection: "column",
  },
  trackCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(14, 10, 30, 0.95)",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    gap: 14,
    ...HardShadow,
  },
  trackCardPro: {
    backgroundColor: "rgba(26, 15, 52, 0.96)",
    borderColor: StudioColors.yellow,
  },
  trackCardCompact: {
    flex: 0,
    width: "100%",
  },
  trackTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  tierPillFree: {
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  tierPillPro: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  tierPillDarkText: {
    color: StudioColors.ink,
    fontSize: 10.5,
    lineHeight: 12,
    includeFontPadding: false,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  trackPriceText: {
    color: "#D8F9B0",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  trackPriceTextPro: {
    color: "#FFF0A6",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  trackTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  trackSummary: {
    color: "#ECE6FC",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  trackBullets: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.16)",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkFreeBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: "rgba(184, 255, 59, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkFreeText: {
    color: "#B8FF3B",
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
    fontWeight: "900",
  },
  checkProBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: "rgba(255, 222, 89, 0.24)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkProText: {
    color: "#FFDE59",
    fontSize: 11,
    lineHeight: 13,
    includeFontPadding: false,
    fontWeight: "900",
  },
  bulletText: {
    flex: 1,
    color: "#E8E2F8",
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "500",
  },
  bulletLead: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  trackCtaFree: {
    marginTop: "auto",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.34)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackCtaFreeText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  trackCtaPro: {
    marginTop: "auto",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 11,
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackCtaProText: {
    color: StudioColors.ink,
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  footerWrap: {
    paddingTop: 12,
  },
  footerBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 18,
    padding: 26,
    borderRadius: 22,
    backgroundColor: "rgba(14, 10, 30, 0.94)",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    ...HardShadow,
  },
  footerBandCompact: {
    alignItems: "flex-start",
  },
  footerCopyWrap: {
    flexShrink: 1,
    gap: 6,
  },
  footerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  footerSub: {
    color: "#DDD5F4",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  dockWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 18,
    zIndex: 60,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  floatingDock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
    borderRadius: 16,
    backgroundColor: "rgba(13, 10, 26, 0.96)",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    ...HardShadow,
  },
  floatingDockPhone: {
    maxWidth: "100%",
    gap: 4,
    padding: 5,
  },
  dockLogo: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    fontFamily: MonoFont,
    paddingHorizontal: 10,
  },
  dockBtn: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  dockBtnActive: {
    backgroundColor: "rgba(255, 222, 89, 0.16)",
    borderColor: StudioColors.yellow,
  },
  dockBtnText: {
    color: "#EDE8FA",
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
    fontWeight: "800",
  },
  dockBtnTextActive: {
    color: StudioColors.yellow,
  },
  dockCta: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  dockCtaText: {
    color: StudioColors.ink,
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  warpOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
    backgroundColor: "rgba(9, 6, 22, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  warpLabel: {
    color: StudioColors.lime,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1.4,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(11, 8, 26, 0.92)",
    borderWidth: 2,
    borderColor: StudioColors.lime,
  },
});
