import { Link } from "expo-router";
import Head from "expo-router/head";
import type { Metadata } from "expo-router/server";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import MinimalPcbBackground from "../components/MinimalPcbBackground";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  SerifFont,
  StudioColors,
  TrackThemes,
} from "../constants/theme";

export function generateMetadata(): Metadata {
  return {
    title: "Curriculum Showcase & Syllabus | DevLearn Arcade",
    description:
      "Explore Python Foundations, Algorithmic Mastery, System Architecture, playable Python mini-apps, Bug Hunt, and 60s Syntax Blitz on DevLearn Arcade.",
    openGraph: {
      title: "Curriculum Showcase & Syllabus | DevLearn Arcade",
      description:
        "Master Python, Algorithms & System Design with browser-based code execution, visual roadmaps, and 60s arcade sprints.",
      type: "website",
      images: ["/og-preview.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Curriculum Showcase & Syllabus | DevLearn Arcade",
      description:
        "Interactive coding roadmaps, playable Python mini-apps, and 60-second arcade sprints.",
      images: ["/og-preview.jpg"],
    },
  };
}

const TRACK_SYLLABUS = [
  {
    key: "python_basics" as const,
    badge: "FREE TRACK",
    chapters: "6 Chapters · Basics through Mini-Apps",
    highlights: [
      "Variables, formatting & clean logic",
      "Loops, lists, dicts & helper functions",
      "4 playable Chapter VI Mini-Apps",
    ],
  },
  {
    key: "algorithms" as const,
    badge: "PRO + 1 FREE PREVIEW",
    chapters: "Two Pointers, Hashing & Sliding Windows",
    highlights: [
      "Trace time & space complexity visually",
      "Real interview problem patterns",
      "Unlockable hint & test-case debugger",
    ],
  },
  {
    key: "system_design" as const,
    badge: "PRO + 1 FREE PREVIEW",
    chapters: "Scalability, Caching & Distributed Core",
    highlights: [
      "Load balancing, sharding & queues",
      "Rate limiting & fault tolerance trade-offs",
      "Hands-on architecture simulations",
    ],
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
    summary: "Validate character rules, entropy checks, and clear security scoring.",
    accent: StudioColors.mint,
  },
  {
    id: "exp-py-23",
    tag: "MINI-APP 03",
    title: "Restaurant Bill & Tip Splitter",
    summary: "Split checks cleanly across friends with tax and percentage rounding.",
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

const ARCADE_MODES = [
  {
    step: "01 // STUDIO",
    title: "Guided Sandbox",
    summary:
      "Write real Python in-browser, inspect animated trace state, and pass instant unit checks.",
    accent: StudioColors.lime,
    params: { track: "python_basics" } as const,
    cta: "OPEN STUDIO →",
  },
  {
    step: "02 // ARENA",
    title: "Bug Hunt",
    summary:
      "Diagnose real broken Python and algorithm snippets under pressure and share your clean streak.",
    accent: StudioColors.coral,
    params: { mode: "bughunt" } as const,
    cta: "HUNT BUGS →",
  },
  {
    step: "03 // SPRINT",
    title: "60s Syntax Blitz",
    summary:
      "Beat the 60-second clock predicting runtime output and share Wordle-style blitz scorecards.",
    accent: StudioColors.yellow,
    params: { mode: "blitz" } as const,
    cta: "PLAY 60S BLITZ →",
  },
];

export default function ExploreScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width > 0 && width < 760;

  const pageTitle = "Curriculum Showcase & Syllabus | DevLearn Arcade";
  const pageDesc =
    "Explore Python Foundations, Algorithmic Mastery, System Architecture, playable mini-apps, and coding arcade modes.";

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
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>DEVLEARN // SHOWCASE</Text>
          </View>

          <Link href="/" asChild>
            <Pressable style={styles.backBtn}>
              <Text style={styles.backBtnText}>← BACK TO ARCADE</Text>
            </Pressable>
          </Link>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroCard, isCompact && styles.heroCardCompact]}>
          <View style={styles.heroLeft}>
            <View style={styles.kickerPill}>
              <Text style={styles.kickerPillText}>
                INTERACTIVE CODING ARCADE
              </Text>
            </View>

            <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}>
              Code faster. Debug sharper. Play to master software.
            </Text>

            <Text style={styles.heroSubtitle}>
              Skip passive video lectures. Run real Python in your browser, solve
              visual algorithm roadmaps, crush 60-second Syntax Blitz sprints, and
              build playable Chapter VI mini-apps.
            </Text>

            <View style={styles.heroCtaRow}>
              <Link
                href={{ pathname: "/", params: { track: "python_basics" } }}
                asChild
              >
                <Pressable style={styles.primaryCtaBtn}>
                  <Text style={styles.primaryCtaText}>START CODING FREE →</Text>
                </Pressable>
              </Link>

              <Link href={{ pathname: "/", params: { mode: "blitz" } }} asChild>
                <Pressable style={styles.secondaryCtaBtn}>
                  <Text style={styles.secondaryCtaText}>⚡ 60S BLITZ</Text>
                </Pressable>
              </Link>

              <Link
                href={{ pathname: "/", params: { mode: "bughunt" } }}
                asChild
              >
                <Pressable style={styles.secondaryCtaBtn}>
                  <Text style={styles.secondaryCtaText}>🪲 BUG HUNT</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          <View style={styles.heroRight}>
            <View style={styles.mascotFrame}>
              <Image
                source={require("../../assets/images/byte-cat.jpg")}
                style={styles.mascotImage}
                resizeMode="cover"
                accessibilityLabel="Byte-Cat DevLearn Arcade mascot"
              />
              <View style={styles.mascotCaptionBar}>
                <Text style={styles.mascotCaptionTitle}>BYTE-CAT // V2.0</Text>
                <Text style={styles.mascotCaptionSub}>ZERO SETUP REQUIRED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 1: Curriculum Tracks */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>SYLLABUS OVERVIEW</Text>
            <Text style={styles.sectionHeading}>3 Focused Mastery Tracks</Text>
          </View>

          <View style={styles.gridRow}>
            {TRACK_SYLLABUS.map((item) => {
              const theme = TrackThemes[item.key];
              return (
                <View key={item.key} style={styles.trackCard}>
                  <View style={styles.trackCardTop}>
                    <View
                      style={[
                        styles.trackIconBox,
                        { backgroundColor: theme.stickerBg },
                      ]}
                    >
                      <Text style={styles.trackIconText}>{theme.icon}</Text>
                    </View>
                    <View
                      style={[
                        styles.trackBadge,
                        theme.isPro ? styles.trackBadgePro : styles.trackBadgeFree,
                      ]}
                    >
                      <Text style={styles.trackBadgeText}>{item.badge}</Text>
                    </View>
                  </View>

                  <Text style={styles.trackTitle}>{theme.label}</Text>
                  <Text style={styles.trackSub}>{item.chapters}</Text>
                  <Text style={styles.trackDesc}>{theme.subtitle}</Text>

                  <View style={styles.bulletList}>
                    {item.highlights.map((pt) => (
                      <Text key={pt} style={styles.bulletItem}>
                        ▪ {pt}
                      </Text>
                    ))}
                  </View>

                  <Link
                    href={{ pathname: "/", params: { track: item.key } }}
                    asChild
                  >
                    <Pressable
                      style={StyleSheet.flatten([
                        styles.cardActionBtn,
                        { backgroundColor: theme.accent },
                      ])}
                    >
                      <Text style={styles.cardActionText}>
                        EXPLORE TRACK →
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section 2: Chapter VI Mini-Apps */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>CHAPTER VI SHOWCASE</Text>
            <Text style={styles.sectionHeading}>
              Playable Python Mini-Apps
            </Text>
          </View>

          <View style={styles.gridRow}>
            {MINI_APP_SHOWCASE.map((mini) => (
              <Link
                key={mini.id}
                href={{ pathname: "/", params: { lesson: mini.id } }}
                asChild
              >
                <Pressable style={styles.miniCard}>
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

        {/* Section 3: Arcade Modes */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>HOW YOU TRAIN</Text>
            <Text style={styles.sectionHeading}>Three Ways to Level Up</Text>
          </View>

          <View style={styles.gridRow}>
            {ARCADE_MODES.map((mode) => (
              <View key={mode.step} style={styles.modeCard}>
                <View
                  style={[styles.modeStepPill, { backgroundColor: mode.accent }]}
                >
                  <Text style={styles.modeStepText}>{mode.step}</Text>
                </View>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeSummary}>{mode.summary}</Text>
                <Link href={{ pathname: "/", params: mode.params }} asChild>
                  <Pressable style={styles.modeBtn}>
                    <Text style={styles.modeBtnText}>{mode.cta}</Text>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCtaBanner}>
          <View style={styles.bottomCtaCopy}>
            <Text style={styles.bottomCtaTitle}>
              Free Python Foundations. Upgrade to Pro Anytime.
            </Text>
            <Text style={styles.bottomCtaSub}>
              Includes 1 free preview challenge from both Algorithmic Mastery
              and System Architecture so you can test Pro before upgrading.
            </Text>
          </View>

          <Link href="/" asChild>
            <Pressable style={styles.primaryCtaBtn}>
              <Text style={styles.primaryCtaText}>LAUNCH ARCADE →</Text>
            </Pressable>
          </Link>
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
    maxWidth: 1080,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 64,
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
  brandBadge: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    ...HardShadowSm,
  },
  brandBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
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
    fontSize: 12,
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
    borderRadius: 16,
    padding: 28,
    ...HardShadowHero,
  },
  heroCardCompact: {
    padding: 20,
  },
  heroLeft: {
    flex: 1,
    minWidth: 280,
    gap: 14,
  },
  kickerPill: {
    alignSelf: "flex-start",
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
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: StudioColors.textPrimary,
    fontFamily: SerifFont,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  heroTitleCompact: {
    fontSize: 26,
    lineHeight: 32,
  },
  heroSubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  heroCtaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  primaryCtaBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  primaryCtaText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 13,
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
    width: 240,
    alignItems: "center",
  },
  mascotFrame: {
    width: "100%",
    backgroundColor: StudioColors.yellow,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    borderRadius: 14,
    overflow: "hidden",
    ...HardShadow,
  },
  mascotImage: {
    width: "100%",
    height: 190,
    borderBottomWidth: 2,
    borderColor: StudioColors.ink,
  },
  mascotCaptionBar: {
    padding: 10,
    backgroundColor: StudioColors.yellow,
    gap: 2,
  },
  mascotCaptionTitle: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  mascotCaptionSub: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.8,
  },
  sectionBlock: {
    gap: 14,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionEyebrow: {
    color: StudioColors.textMuted,
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
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  trackCard: {
    flexGrow: 1,
    flexBasis: 280,
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
  },
  trackIconBox: {
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trackIconText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
  },
  trackBadge: {
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trackBadgeFree: {
    backgroundColor: StudioColors.mint,
  },
  trackBadgePro: {
    backgroundColor: StudioColors.violet,
  },
  trackBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
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
  bulletList: {
    gap: 4,
    marginTop: 2,
    marginBottom: 4,
    flex: 1,
  },
  bulletItem: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
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
  modeCard: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 14,
    padding: 18,
    gap: 8,
    ...HardShadowSm,
  },
  modeStepPill: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modeStepText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  modeTitle: {
    color: StudioColors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  modeSummary: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  modeBtn: {
    marginTop: 6,
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  modeBtnText: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  bottomCtaBanner: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    borderRadius: 14,
    padding: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    ...HardShadow,
  },
  bottomCtaCopy: {
    flex: 1,
    minWidth: 260,
    gap: 4,
  },
  bottomCtaTitle: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  bottomCtaSub: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
