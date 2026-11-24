import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { getCurriculumLessonSortKey } from "../constants/certificates";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
  TrackThemes,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  isLessonLockedForUser,
  type Lesson,
  type ViewMode,
} from "../types/lesson";
import {
  getArcadeRecordsState,
  getBlitzRankFromHits,
  subscribeArcadeRecords,
} from "../utils/arcadeRecords";
import type { LoftHighlightZone } from "../utils/loftGeometry";
import { computeLoftMilestoneTrophies } from "../utils/loftMilestones";
import { readCompletedMiniBuilds } from "../utils/miniBuilds";
import { playKeyClick } from "../utils/soundEffects";
import {
  buildDueReviewQueue,
  getReviewRetentionSummary,
  type ReviewScheduleEntry,
} from "../utils/spacedRepetition";
import {
  getOnboardingState,
  hydrateOnboardingState,
  shouldShowWelcomeCard,
  subscribeOnboarding,
  type UserOnboardingState,
} from "../utils/userOnboarding";
import HomeLoftStage from "./HomeLoftStage";
import HomeWisdomFlapBoard from "./HomeWisdomFlapBoard";
import RoadmapDailyQuestCard from "./RoadmapDailyQuestCard";
import RoadmapReviewCard from "./RoadmapReviewCard";
import RoadmapWelcomeCard from "./RoadmapWelcomeCard";
import { StudioIcon, type StudioIconName, Text } from "./StudioIcon";

interface HomeMenuScreenProps {
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  peekedSolutions?: Record<string, boolean>;
  reviewSchedule?: Record<string, ReviewScheduleEntry>;
  solvedIncidents?: Record<string, boolean>;
  isPremium: boolean;
  activeTrack: string;
  totalXp: number;
  streakCount: number;
  lastActiveDate?: string | null;
  totalSolvedCount: number;
  resumeLesson?: Lesson | null;
  onSelectTrack: (track: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onNavigateMode: (mode: ViewMode) => void;
  onClaimDailyQuestBonus?: () => void;
  recentVictoryLessonId?: string | null;
  onConsumeVictory?: () => void;
  enableDevTools?: boolean;
}

interface PortalCardMeta {
  id: string;
  title: string;
  tag: string;
  stat: string;
  icon: StudioIconName;
  accent: string;
  loftZone: Exclude<LoftHighlightZone, null>;
  targetMode: ViewMode;
}

export default function HomeMenuScreen({
  lessons,
  completedLessons,
  peekedSolutions = {},
  reviewSchedule = {},
  solvedIncidents = {},
  isPremium,
  activeTrack,
  totalXp,
  streakCount,
  totalSolvedCount,
  resumeLesson = null,
  onSelectTrack,
  onSelectLesson,
  onNavigateMode,
  onClaimDailyQuestBonus,
  recentVictoryLessonId = null,
  onConsumeVictory,
  enableDevTools = false,
}: HomeMenuScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth > 0 && windowWidth < 860;
  const isPhone = windowWidth > 0 && windowWidth < 560;

  const [activeZone, setActiveZone] = useState<LoftHighlightZone>(null);
  const [onboardingState, setOnboardingState] = useState<UserOnboardingState>(
    () => getOnboardingState(),
  );
  const [arcadeRecords, setArcadeRecords] = useState(() =>
    getArcadeRecordsState(),
  );

  useEffect(() => {
    void hydrateOnboardingState();
    const unsubOnboarding = subscribeOnboarding(setOnboardingState);
    const unsubArcade = subscribeArcadeRecords(setArcadeRecords);
    return () => {
      unsubOnboarding();
      unsubArcade();
    };
  }, []);

  const currentTrackMeta =
    TrackThemes[activeTrack] || TrackThemes.python_basics;
  const trackLessons = useMemo(
    () => lessons.filter((l) => l.track === activeTrack),
    [activeTrack, lessons],
  );

  const nextUpLesson = useMemo(() => {
    return (
      trackLessons.find(
        (l) => !completedLessons[l.id] && !isLessonLockedForUser(l, isPremium),
      ) ||
      trackLessons.find((l) => !completedLessons[l.id]) ||
      trackLessons[0] ||
      lessons[0]
    );
  }, [completedLessons, isPremium, lessons, trackLessons]);

  const heroLesson =
    resumeLesson &&
    !completedLessons[resumeLesson.id] &&
    !isLessonLockedForUser(resumeLesson, isPremium)
      ? resumeLesson
      : nextUpLesson;
  const isResumingDraft =
    Boolean(resumeLesson) && heroLesson?.id === resumeLesson?.id;
  const isBrandNew = totalXp === 0 && totalSolvedCount === 0;

  const solvedBugCount = useMemo(
    () => Object.values(solvedIncidents || {}).filter(Boolean).length,
    [solvedIncidents],
  );

  const completedMiniBuildsCount = useMemo(
    () => Object.values(readCompletedMiniBuilds()).filter(Boolean).length,
    [],
  );

  const loftMilestones = useMemo(
    () =>
      computeLoftMilestoneTrophies({
        lessons,
        completedLessons,
        streakCount,
        blitzBestHits: arcadeRecords.blitzBestHits,
        solvedBugCount,
        completedMiniBuildsCount,
      }),
    [
      arcadeRecords.blitzBestHits,
      completedLessons,
      completedMiniBuildsCount,
      lessons,
      solvedBugCount,
      streakCount,
    ],
  );

  const dueReviewItems = useMemo(
    () =>
      buildDueReviewQueue({
        lessons,
        completedLessons,
        peekedSolutions,
        reviewSchedule,
        isPremium,
      }),
    [completedLessons, isPremium, lessons, peekedSolutions, reviewSchedule],
  );
  const reviewSummary = useMemo(
    () =>
      getReviewRetentionSummary({
        lessons,
        completedLessons,
        peekedSolutions,
        reviewSchedule,
        isPremium,
      }),
    [completedLessons, isPremium, lessons, peekedSolutions, reviewSchedule],
  );

  const portals: PortalCardMeta[] = useMemo(
    () => [
      {
        id: "portal-map",
        title: "Skill Map",
        tag: "3 TRACKS",
        stat: `${totalSolvedCount}/${lessons.length || 64} MODULES SOLVED`,
        icon: "nav_skillmap",
        accent: StudioColors.yellow,
        loftZone: "roadmap",
        targetMode: "roadmap",
      },
      {
        id: "portal-studio",
        title: "Code Studio",
        tag: "PY 3.11 IDE",
        stat: heroLesson ? heroLesson.title.toUpperCase() : "INTERACTIVE WORKSPACE",
        icon: "nav_studio",
        accent: "#38BDF8",
        loftZone: "studio",
        targetMode: "studio",
      },
      {
        id: "portal-arcade",
        title: "Mini-Game Arcade",
        tag: "6 CARTRIDGES",
        stat:
          arcadeRecords.blitzBestHits > 0
            ? `BEST BLITZ: ${arcadeRecords.blitzBestHits} HITS · ${getBlitzRankFromHits(arcadeRecords.blitzBestHits)}`
            : `${solvedBugCount}/25 BUGS · PLAYGROUND & BUILDS`,
        icon: "nav_arcade",
        accent: StudioColors.pink,
        loftZone: "arcade",
        targetMode: "arcade",
      },
      {
        id: "portal-lab",
        title: "Algorithm Lab",
        tag: isPremium ? "8 ENGINES" : "PRO PREVIEW",
        stat: "VISUAL SORT · GRAPH · HEAP · DP",
        icon: isPremium ? "nav_algolab" : "lock",
        accent: StudioColors.violet,
        loftZone: "algolab",
        targetMode: "algolab",
      },
    ],
    [
      arcadeRecords.blitzBestHits,
      heroLesson,
      isPremium,
      lessons.length,
      solvedBugCount,
      totalSolvedCount,
    ],
  );

  const displayName = onboardingState.displayName.trim();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* HERO SECTION: Clean Welcome + Live 3D Hologram Stage */}
        <View
          style={[
            styles.heroShell,
            isNarrow && styles.heroShellNarrow,
          ]}
        >
          {/* Left: High-Impact Editorial Welcome & Primary Actions */}
          <View
            style={[
              styles.heroCopyCol,
              isNarrow && styles.narrowFullWidth,
            ]}
          >
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowPill}>
                <StudioIcon name="devlearn_logo" size={14} />
                <Text style={styles.eyebrowText}>
                  {displayName
                    ? `WELCOME BACK, ${displayName.toUpperCase()}`
                    : "DEVY · INTERACTIVE CODING STUDIO"}
                </Text>
              </View>
            </View>

            <Text style={[styles.heroHeadline, isPhone && styles.heroHeadlinePhone]}>
              {isBrandNew
                ? "Master Python, Algorithms & Systems — by building."
                : `Ready for your next ${currentTrackMeta.label} session?`}
            </Text>

            <Text style={styles.heroSubtitle}>
              Live Python 3.11 in your browser, visual algorithm labs, retro
              coding mini-games, and your cozy interactive Lo-Fi desk loft.
            </Text>

            {/* Primary + Secondary Hero Actions */}
            <View style={styles.heroActionsRow}>
              {heroLesson ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isResumingDraft
                      ? `Resume draft ${heroLesson.title}`
                      : `Start or continue ${heroLesson.title}`
                  }
                  style={({ pressed }) => [
                    styles.primaryCtaBtn,
                    pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                  ]}
                  onHoverIn={() => setActiveZone("studio")}
                  onHoverOut={() => setActiveZone(null)}
                  onPress={() => {
                    playKeyClick();
                    onSelectLesson(heroLesson);
                  }}
                >
                  <StudioIcon name="mission_play" size={16} />
                  <Text style={styles.primaryCtaText} numberOfLines={1}>
                    {isResumingDraft
                      ? `RESUME DRAFT: ${heroLesson.title} →`
                      : isBrandNew
                        ? "START LESSON 01 (+50 XP) →"
                        : `CONTINUE: ${heroLesson.title} →`}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Skill Map Roadmap"
                style={({ pressed }) => [
                  styles.secondaryCtaBtn,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onHoverIn={() => setActiveZone("roadmap")}
                onHoverOut={() => setActiveZone(null)}
                onPress={() => {
                  playKeyClick();
                  onNavigateMode("roadmap");
                }}
              >
                <StudioIcon name="nav_skillmap" size={15} />
                <Text style={styles.secondaryCtaText}>OPEN SKILL MAP →</Text>
              </Pressable>
            </View>

            {/* Compact Telemetry Pills */}
            <View style={styles.statsStrip}>
              <View style={styles.statChip}>
                <StudioIcon name="check_box" size={13} />
                <Text style={styles.statChipText}>
                  {totalSolvedCount}/{lessons.length || 64} SOLVED
                </Text>
              </View>
              <View style={styles.statChip}>
                <StudioIcon name="flame" size={13} />
                <Text style={styles.statChipText}>
                  {streakCount}D STREAK
                </Text>
              </View>
              <View style={styles.statChip}>
                <StudioIcon name="bolt" size={13} />
                <Text style={styles.statChipText}>
                  {totalXp.toLocaleString()} XP
                </Text>
              </View>
            </View>
          </View>

          {/* Right: Interactive Living Isometric Lo-Fi Dev Loft */}
          <View
            style={[
              styles.heroStageCol,
              isNarrow && styles.narrowFullWidth,
            ]}
          >
            <HomeLoftStage
              activeZone={activeZone}
              streakCount={streakCount}
              compact={isPhone}
              milestones={loftMilestones}
              recentVictoryLessonId={recentVictoryLessonId}
              onConsumeVictory={onConsumeVictory}
              enableDevTools={enableDevTools}
            />
          </View>
        </View>

        {/* 4 ZONE-LINKED DESTINATION PORTALS */}
        <View style={styles.portalsGrid}>
          {portals.map((portal) => (
            <Pressable
              key={portal.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${portal.title}`}
              style={({ pressed }) => [
                styles.portalCard,
                isPhone && styles.portalCardPhone,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onHoverIn={() => setActiveZone(portal.loftZone)}
              onHoverOut={() => setActiveZone(null)}
              onPress={() => {
                playKeyClick();
                onNavigateMode(portal.targetMode);
              }}
            >
              <View
                style={[styles.portalAccentBar, { backgroundColor: portal.accent }]}
              />
              <View style={styles.portalBody}>
                <View style={styles.portalTopRow}>
                  <View
                    style={[
                      styles.portalIconBox,
                      { backgroundColor: portal.accent },
                    ]}
                  >
                    <StudioIcon name={portal.icon} size={18} />
                  </View>
                  <View style={styles.portalTagChip}>
                    <Text style={styles.portalTagText}>{portal.tag}</Text>
                  </View>
                </View>

                <Text style={styles.portalTitle}>{portal.title}</Text>
                <Text style={styles.portalStat} numberOfLines={1}>
                  {portal.stat}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* First-Time 5-Second Welcome Setup (auto-hides once done or solved) */}
        {shouldShowWelcomeCard(onboardingState, totalSolvedCount, totalXp) ? (
          <RoadmapWelcomeCard
            initialGoalTrack={activeTrack}
            onCompleteWelcome={({ goalTrack }) => {
              onSelectTrack(goalTrack);
              const goalLessons = lessons
                .filter((l) => l.track === goalTrack)
                .sort(
                  (a, b) =>
                    getCurriculumLessonSortKey(goalTrack, a) -
                    getCurriculumLessonSortKey(goalTrack, b),
                );
              const firstStarter = goalLessons.find(
                (l) => !isLessonLockedForUser(l, isPremium),
              );
              if (firstStarter) {
                onSelectLesson(firstStarter);
              }
            }}
          />
        ) : null}

        {/* Today's 5-Min Daily Quest (Auto-collapses when claimed) */}
        <RoadmapDailyQuestCard
          onStartLessonStep={
            heroLesson ? () => onSelectLesson(heroLesson) : undefined
          }
          onStartArenaStep={(mode) => onNavigateMode(mode)}
          onClaimBonus={onClaimDailyQuestBonus}
        />

        {/* Spaced Review Queue (Auto-hides when empty) */}
        <RoadmapReviewCard
          dueItems={dueReviewItems}
          summary={reviewSummary}
          onStartReview={(lesson) => onSelectLesson(lesson)}
          onFilterDue={() => onNavigateMode("roadmap")}
        />

        {/* Vintage Mechanical Split-Flap Daily Wisdom Board (Hovering perks up the loft cat!) */}
        <View
          onPointerEnter={
            Platform.OS === "web"
              ? () => setActiveZone("cat")
              : undefined
          }
          onPointerLeave={
            Platform.OS === "web"
              ? () => setActiveZone(null)
              : undefined
          }
        >
          <HomeWisdomFlapBoard />
        </View>

        {/* Minimal Footer Strip with Curriculum Showcase Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerNote}>
            TIP: PRESS ⌘K / CTRL+K ANYTIME TO JUMP TO ANY LESSON, GAME, OR THEME
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Curriculum Showcase"
            style={styles.showcaseLinkBtn}
            onPress={() => {
              playKeyClick();
              router.push("/explore");
            }}
          >
            <StudioIcon name="nav_showcase" size={14} />
            <Text style={styles.showcaseLinkText}>CURRICULUM SHOWCASE →</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 46,
      alignItems: "center",
    },
    container: {
      width: "100%",
      maxWidth: 1180,
      gap: 14,
    },
    heroShell: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 18,
      ...HardShadow,
    },
    heroShellNarrow: {
      flexDirection: "column",
      alignItems: "stretch",
      padding: 14,
      gap: 14,
    },
    heroCopyCol: {
      flex: 0.9,
      minWidth: 0,
      gap: 11,
    },
    heroStageCol: {
      flex: 1.45,
      minWidth: 0,
    },
    narrowFullWidth: {
      flex: 0,
      width: "100%",
      minWidth: 0,
      maxWidth: "100%",
    },
    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    eyebrowPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 4,
      ...HardShadowSm,
    },
    eyebrowText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.55,
    },
    heroHeadline: {
      color: colors.textPrimary,
      fontSize: 28,
      lineHeight: 33,
      fontWeight: "900",
      letterSpacing: -0.6,
    },
    heroHeadlinePhone: {
      fontSize: 22,
      lineHeight: 27,
    },
    heroSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "600",
    },
    heroActionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 9,
      marginTop: 2,
    },
    primaryCtaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      minHeight: 40,
      maxWidth: "100%",
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      ...HardShadow,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    primaryCtaText: {
      color: StudioColors.ink,
      fontSize: 11,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
      flexShrink: 1,
    },
    secondaryCtaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      minHeight: 40,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 13,
      paddingVertical: 9,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    secondaryCtaText: {
      color: colors.textPrimary,
      fontSize: 10.5,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    statsStrip: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 7,
      marginTop: 2,
    },
    statChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      minHeight: 28,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    statChipText: {
      color: colors.textSecondary,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    portalsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 11,
      width: "100%",
    },
    portalCard: {
      flex: 1,
      minWidth: 220,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 13,
      overflow: "hidden",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    portalCardPhone: {
      minWidth: "100%",
      flex: 0,
    },
    portalAccentBar: {
      height: 4,
      width: "100%",
      borderBottomWidth: 1,
      borderBottomColor: StudioColors.ink,
    },
    portalBody: {
      padding: 12,
      gap: 6,
    },
    portalTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    portalIconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
    },
    portalTagChip: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    portalTagText: {
      color: colors.textSecondary,
      fontSize: 9,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    portalTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: -0.2,
    },
    portalStat: {
      color: colors.textMuted,
      fontSize: 9.5,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.3,
    },
    footerRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      paddingTop: 6,
      paddingHorizontal: 4,
    },
    footerNote: {
      color: colors.textMuted,
      fontSize: 9.5,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "800",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
      flexShrink: 1,
    },
    showcaseLinkBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    showcaseLinkText: {
      color: colors.textPrimary,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
  });
