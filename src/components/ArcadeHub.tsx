import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  type ArcadeGameMode,
  type ViewMode,
} from "../types/lesson";
import {
  type ArcadeRecordsState,
  getArcadeRecordsState,
  getBlitzRankFromHits,
  subscribeArcadeRecords,
} from "../utils/arcadeRecords";
import { readCompletedMiniBuilds } from "../utils/miniBuilds";
import {
  readSavedSnippets,
  subscribeScratchpadSnippets,
} from "../utils/scratchpadSnippets";
import { playKeyClick } from "../utils/soundEffects";
import { StudioIcon, type StudioIconName, Text } from "./StudioIcon";

export type ArcadeCategoryId = "all" | "sprints" | "recall" | "builds";

export interface ArcadeCartridgeMeta {
  id: ArcadeGameMode;
  category: Exclude<ArcadeCategoryId, "all">;
  code: string;
  title: string;
  shortTitle: string;
  tagline: string;
  durationBadge: string;
  icon: StudioIconName;
  accent: string;
  highlightTag: string;
  xpLabel: string;
}

export const ARCADE_CARTRIDGES: readonly ArcadeCartridgeMeta[] = [
  {
    id: "bughunt",
    category: "sprints",
    code: "CART-01",
    title: "Production Bug Hunt",
    shortTitle: "BUG HUNT",
    tagline:
      "Diagnose and patch broken Python & algorithm incidents with live test harnesses, Daily Seed, and Hard Mode.",
    durationBadge: "2–4 MIN · LIVE CODE",
    icon: "nav_bughunt",
    accent: StudioColors.coral,
    highlightTag: "DAILY SEED",
    xpLabel: "+40–75 XP",
  },
  {
    id: "blitz",
    category: "sprints",
    code: "CART-02",
    title: "60s Speed Blitz",
    shortTitle: "SPEED BLITZ",
    tagline:
      "Race the 60-second arcade clock to fill syntax blanks, spot Big-O traps, and chain combo multipliers.",
    durationBadge: "60 SEC · 48 CARDS",
    icon: "nav_blitz",
    accent: StudioColors.lime,
    highlightTag: "COMBO STREAK",
    xpLabel: "+30–90 XP",
  },
  {
    id: "flashcards",
    category: "recall",
    code: "CART-03",
    title: "Flashcards Concept Deck",
    shortTitle: "FLASH DECK",
    tagline:
      "Flip rapid-recall Python, Algorithms, and System Design cards with pitfalls & spaced misses review.",
    durationBadge: "1–2 MIN · NO TYPING",
    icon: "nav_flashcards",
    accent: StudioColors.mint,
    highlightTag: "RAPID RECALL",
    xpLabel: "+20–50 XP",
  },
  {
    id: "detective",
    category: "recall",
    code: "CART-04",
    title: "Output Detective",
    shortTitle: "DETECTIVE",
    tagline:
      "Read short Python & system traces, predict the exact output without typing, and inspect step-by-step clues.",
    durationBadge: "2 MIN · 18 CASES",
    icon: "nav_detective",
    accent: "#38BDF8",
    highlightTag: "CODE READING",
    xpLabel: "+30–85 XP",
  },
  {
    id: "minibuilds",
    category: "builds",
    code: "CART-05",
    title: "Cozy Mini-Builds",
    shortTitle: "MINI-BUILDS",
    tagline:
      "Code tiny Python tools—Password Meter, URL Shortener, and Dice RPG—and test them live in an interactive widget.",
    durationBadge: "5 MIN · LIVE WIDGET",
    icon: "nav_minibuilds",
    accent: StudioColors.violet,
    highlightTag: "BUILD A TOOL",
    xpLabel: "+60–90 XP",
  },
  {
    id: "playground",
    category: "builds",
    code: "CART-06",
    title: "Python Playground",
    shortTitle: "PLAYGROUND",
    tagline:
      "Experiment freely in a full-screen Python 3.11 scratchpad with 5 starter templates, instant output, and saved snippets.",
    durationBadge: "FREE PLAY · PY 3.11",
    icon: "terminal",
    accent: StudioColors.yellow,
    highlightTag: "FREE SANDBOX",
    xpLabel: "SANDBOX",
  },
] as const;

interface ArcadeHubProps {
  xpPoints: number;
  streakCount: number;
  solvedIncidents: Record<string, boolean>;
  isPremium: boolean;
  onLaunchGame: (mode: ArcadeGameMode) => void;
  onBackToMap?: () => void;
}

export function ArcadeSubNavBar({
  activeMode,
  onSelectMode,
}: {
  activeMode: ArcadeGameMode;
  onSelectMode: (mode: ViewMode) => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.subNavBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Cozy Arcade Lobby"
        style={({ pressed }) => [
          styles.subNavBackBtn,
          pressed && { transform: [{ translateY: 1 }] },
        ]}
        onPress={() => {
          playKeyClick();
          onSelectMode("arcade");
        }}
      >
        <Text style={styles.subNavBackText}>← ARCADE LOBBY</Text>
      </Pressable>

      <View style={styles.subNavPillsRow}>
        {ARCADE_CARTRIDGES.map((cart) => {
          const isCurrent = activeMode === cart.id;
          return (
            <Pressable
              key={cart.id}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${cart.title}`}
              accessibilityState={{ selected: isCurrent }}
              style={({ pressed }) => [
                styles.subNavPill,
                isCurrent && [
                  styles.subNavPillActive,
                  { backgroundColor: cart.accent },
                ],
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                onSelectMode(cart.id);
              }}
            >
              <StudioIcon name={cart.icon} size={14} />
              <Text
                style={[
                  styles.subNavPillText,
                  isCurrent && styles.subNavPillTextActive,
                ]}
              >
                {cart.shortTitle}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ArcadeHub({
  xpPoints,
  streakCount,
  solvedIncidents,
  isPremium,
  onLaunchGame,
  onBackToMap,
}: ArcadeHubProps) {
  const styles = useThemedStyles(createStyles);
  const [category, setCategory] = useState<ArcadeCategoryId>("all");
  const [arcadeRecords, setArcadeRecords] = useState<ArcadeRecordsState>(() =>
    getArcadeRecordsState(),
  );
  const [savedSnippetCount, setSavedSnippetCount] = useState<number>(
    () => readSavedSnippets().length,
  );
  const shippedMiniBuildsCount = useMemo(
    () => Object.values(readCompletedMiniBuilds()).filter(Boolean).length,
    [],
  );

  useEffect(() => {
    const unsubRecords = subscribeArcadeRecords(setArcadeRecords);
    const unsubSnippets = subscribeScratchpadSnippets((list) =>
      setSavedSnippetCount(list.length),
    );
    return () => {
      unsubRecords();
      unsubSnippets();
    };
  }, []);

  const solvedBugCount = useMemo(
    () => Object.values(solvedIncidents || {}).filter(Boolean).length,
    [solvedIncidents],
  );

  const visibleCartridges = useMemo(
    () =>
      category === "all"
        ? ARCADE_CARTRIDGES
        : ARCADE_CARTRIDGES.filter((c) => c.category === category),
    [category],
  );

  function handleRandomLaunch() {
    playKeyClick();
    const pool = visibleCartridges.length > 0 ? visibleCartridges : ARCADE_CARTRIDGES;
    const pick = pool[Math.floor(Math.random() * pool.length)] || ARCADE_CARTRIDGES[0];
    onLaunchGame(pick.id);
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Cozy Retro Arcade Cabinet Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRibbon} />
          <View style={styles.heroBody}>
            <View style={styles.heroLeft}>
              <View style={styles.heroTitleRow}>
                <View style={styles.heroIconBadge}>
                  <StudioIcon name="nav_arcade" size={28} />
                </View>
                <View style={styles.heroTitleCol}>
                  <Text style={styles.heroEyebrow}>
                    COZY CODING CABINET · {ARCADE_CARTRIDGES.length} CARTRIDGES
                  </Text>
                  <Text style={styles.heroTitle}>Devy Mini-Game Arcade</Text>
                </View>
              </View>
              <Text style={styles.heroDesc}>
                Pick a cartridge for fast XP sprints, daily bug hunts, concept
                drills, mini-builds, or a free Python 3.11 playground.
              </Text>

              <View style={styles.telemetryRow}>
                <View style={styles.telemetryPill}>
                  <StudioIcon name="bug" size={14} />
                  <Text style={styles.telemetryText}>
                    {solvedBugCount}/25 BUGS SQUASHED
                  </Text>
                </View>
                <View style={styles.telemetryPill}>
                  <StudioIcon name="bolt" size={14} />
                  <Text style={styles.telemetryText}>
                    {xpPoints.toLocaleString()} XP
                  </Text>
                </View>
                <View style={styles.telemetryPill}>
                  <StudioIcon name="flame" size={14} />
                  <Text style={styles.telemetryText}>
                    {streakCount}D STREAK
                  </Text>
                </View>
                {isPremium && (
                  <View style={[styles.telemetryPill, styles.telemetryProPill]}>
                    <StudioIcon name="star" size={14} />
                    <Text style={styles.telemetryProText}>
                      ALL PRO DECKS OPEN
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.heroActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Play random arcade mini-game"
                style={({ pressed }) => [
                  styles.randomPlayBtn,
                  pressed && { transform: [{ translateY: 2 }] },
                ]}
                onPress={handleRandomLaunch}
              >
                <StudioIcon name="dice" size={15} />
                <Text style={styles.randomPlayBtnText}>PLAY RANDOM →</Text>
              </Pressable>

              {onBackToMap && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Return to Skill Map"
                  style={({ pressed }) => [
                    styles.backMapBtn,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => {
                    playKeyClick();
                    onBackToMap();
                  }}
                >
                  <Text style={styles.backMapBtnText}>← SKILL MAP</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Category Filter Shelf Bar */}
        <View style={styles.filterBar} accessibilityRole="tablist">
          {(
            [
              {
                id: "all" as const,
                icon: "star" as StudioIconName,
                label: `ALL GAMES (${ARCADE_CARTRIDGES.length})`,
              },
              {
                id: "sprints" as const,
                icon: "bolt" as StudioIconName,
                label: `QUICK SPRINTS (${ARCADE_CARTRIDGES.filter((c) => c.category === "sprints").length})`,
              },
              {
                id: "recall" as const,
                icon: "nav_flashcards" as StudioIconName,
                label: `MEMORY & RECALL (${ARCADE_CARTRIDGES.filter((c) => c.category === "recall").length})`,
              },
              {
                id: "builds" as const,
                icon: "toolbox" as StudioIconName,
                label: `SANDBOX & BUILDS (${ARCADE_CARTRIDGES.filter((c) => c.category === "builds").length})`,
              },
            ] as const
          ).map((tab) => {
            const active = category === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.filterTabBtn,
                  active && styles.filterTabBtnActive,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  setCategory(tab.id);
                }}
              >
                <StudioIcon name={tab.icon} size={14} />
                <Text
                  style={[
                    styles.filterTabText,
                    active && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Retro Cartridge Grid */}
        <View style={styles.cartGrid}>
          {visibleCartridges.map((cart) => {
            const statLine =
              cart.id === "bughunt"
                ? `${solvedBugCount}/25 INCIDENTS CLEARED`
                : cart.id === "blitz"
                  ? arcadeRecords.blitzBestHits > 0
                    ? `BEST: ${arcadeRecords.blitzBestHits} HITS · ${getBlitzRankFromHits(arcadeRecords.blitzBestHits)}`
                    : arcadeRecords.blitzBestXp > 0
                      ? `BEST RUN: ${arcadeRecords.blitzBestXp} XP`
                      : "PYTHON · ALGO · SYS DESIGN"
                  : cart.id === "detective"
                    ? arcadeRecords.detectiveCasesSolvedTotal > 0
                      ? `BEST ${arcadeRecords.detectiveBestScore}/6 · ${arcadeRecords.detectiveCasesSolvedTotal} SOLVED`
                      : "6-CASE TRACE INVESTIGATIONS"
                    : cart.id === "minibuilds"
                      ? shippedMiniBuildsCount > 0
                        ? `${shippedMiniBuildsCount}/3 TOOLS SHIPPED ✓`
                        : "3 LIVE PYTHON TOOLS"
                      : cart.id === "playground"
                        ? savedSnippetCount > 0
                          ? `${savedSnippetCount} SAVED ${savedSnippetCount === 1 ? "SNIPPET" : "SNIPPETS"} · 5 TEMPLATES`
                          : "5 TEMPLATES · SAVED SNIPPETS"
                        : arcadeRecords.flashcardsMasteredTotal > 0
                          ? `${arcadeRecords.flashcardsMasteredTotal} MASTERED · ${arcadeRecords.flashcardsRoundsCleared} ${arcadeRecords.flashcardsRoundsCleared === 1 ? "ROUND" : "ROUNDS"}`
                          : "8-CARD CONCEPT ROUNDS";

            return (
              <Pressable
                key={cart.id}
                accessibilityRole="button"
                accessibilityLabel={`Launch ${cart.title}`}
                style={({ pressed }) => [
                  styles.cartCard,
                  pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  onLaunchGame(cart.id);
                }}
              >
                {/* Cartridge Colored Top Spine with Grip Notches */}
                <View
                  style={[styles.cartSpine, { backgroundColor: cart.accent }]}
                >
                  <Text style={styles.cartCodeText}>{cart.code}</Text>
                  <View style={styles.cartGripNotches}>
                    <View style={styles.cartGripLine} />
                    <View style={styles.cartGripLine} />
                    <View style={styles.cartGripLine} />
                  </View>
                  <View style={styles.cartXpTag}>
                    <Text style={styles.cartXpTagText}>{cart.xpLabel}</Text>
                  </View>
                </View>

                <View style={styles.cartBody}>
                  <View style={styles.cartHeaderRow}>
                    <View
                      style={[
                        styles.cartIconBox,
                        { backgroundColor: cart.accent },
                      ]}
                    >
                      <StudioIcon name={cart.icon} size={24} />
                    </View>
                    <View style={styles.cartHeaderBadges}>
                      <View style={styles.cartMetaChip}>
                        <Text style={styles.cartMetaChipText}>
                          {cart.highlightTag}
                        </Text>
                      </View>
                      <Text style={styles.cartDurationText}>
                        {cart.durationBadge}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cartTitle}>{cart.title}</Text>
                  <Text style={styles.cartTagline}>{cart.tagline}</Text>

                  <View style={styles.cartFooterRow}>
                    <Text style={styles.cartStatText}>{statLine}</Text>
                    <View
                      style={[
                        styles.cartPlayBtn,
                        { backgroundColor: cart.accent },
                      ]}
                    >
                      <Text style={styles.cartPlayBtnText}>PLAY →</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 42,
      alignItems: "center",
    },
    container: {
      width: "100%",
      maxWidth: 1020,
      gap: 16,
    },
    heroCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 16,
      overflow: "hidden",
      ...HardShadow,
    },
    heroTopRibbon: {
      height: 7,
      backgroundColor: StudioColors.pink,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
    },
    heroBody: {
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16,
    },
    heroLeft: {
      flex: 1,
      minWidth: 260,
      gap: 10,
    },
    heroTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    heroIconBadge: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: StudioColors.pink,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    heroTitleCol: {
      flex: 1,
      gap: 2,
    },
    heroEyebrow: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1.1,
    },
    heroTitle: {
      color: StudioColors.textPrimary,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.4,
    },
    heroDesc: {
      color: StudioColors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 19,
    },
    telemetryRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 7,
    },
    telemetryPill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 30,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    telemetryText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    telemetryProPill: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    telemetryProText: {
      color: StudioColors.ink,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    heroActions: {
      gap: 8,
      alignItems: "stretch",
      minWidth: 170,
    },
    randomPlayBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 11,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    randomPlayBtnText: {
      color: StudioColors.ink,
      fontSize: 11.5,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    backMapBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 8,
      alignItems: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    backMapBtnText: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    filterBar: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    filterTabBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 34,
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 6,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    filterTabBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    filterTabText: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    filterTabTextActive: {
      color: StudioColors.ink,
    },
    cartGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
    },
    cartCard: {
      flex: 1,
      minWidth: 280,
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 15,
      overflow: "hidden",
      ...HardShadow,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    cartSpine: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
      gap: 8,
    },
    cartCodeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    cartGripNotches: {
      flexDirection: "row",
      gap: 3,
      alignItems: "center",
    },
    cartGripLine: {
      width: 14,
      height: 3,
      borderRadius: 2,
      backgroundColor: "rgba(17,17,17,0.35)",
    },
    cartXpTag: {
      backgroundColor: StudioColors.ink,
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    cartXpTagText: {
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    cartBody: {
      padding: 15,
      gap: 10,
      flex: 1,
      justifyContent: "space-between",
    },
    cartHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    cartIconBox: {
      width: 44,
      height: 44,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    cartHeaderBadges: {
      alignItems: "flex-end",
      gap: 3,
    },
    cartMetaChip: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    cartMetaChipText: {
      color: StudioColors.textPrimary,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    cartDurationText: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    cartTitle: {
      color: StudioColors.textPrimary,
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: -0.2,
    },
    cartTagline: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    cartFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      paddingTop: 8,
      borderTopWidth: 1.5,
      borderTopColor: StudioColors.borderSubtle,
    },
    cartStatText: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
      flex: 1,
    },
    cartPlayBtn: {
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      ...HardShadowSm,
    },
    cartPlayBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    subNavBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      maxWidth: "100%",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: StudioColors.surface,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
    },
    subNavBackBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 10,
      paddingVertical: 5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    subNavBackText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    subNavPillsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      maxWidth: "100%",
      gap: 6,
    },
    subNavPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    subNavPillActive: {
      borderColor: StudioColors.ink,
      borderWidth: 2,
      ...HardShadowSm,
    },
    subNavPillText: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    subNavPillTextActive: {
      color: StudioColors.ink,
    },
  });
