"use no memo";

import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "./StudioIcon";
import {
  ChapterTierMeta,
  getChapterForTrackLesson,
  getCurriculumLessonSortKey,
  isLessonInChapter,
  TRACK_CHAPTERS,
} from "../constants/certificates";
import {
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  getLessonStageProgress,
  getLessonStarRating,
  isLessonLockedForUser,
  isProTrackPreviewLesson,
  PracticeChallenge,
} from "../types/lesson";
import { playKeyClick } from "../utils/soundEffects";
import {
  buildDueReviewQueue,
  getReviewRetentionSummary,
  ReviewScheduleEntry,
} from "../utils/spacedRepetition";
import ByteCatGuideCard from "./ByteCatGuideCard";
import RoadmapDailyQuestCard from "./RoadmapDailyQuestCard";
import RoadmapRetroTv from "./RoadmapRetroTv";
import RoadmapReviewCard from "./RoadmapReviewCard";
import RoadmapScrollBackdrop from "./RoadmapScrollBackdrop";
import RoadmapWelcomeCard from "./RoadmapWelcomeCard";
import {
  getOnboardingState,
  hydrateOnboardingState,
  shouldShowWelcomeCard,
  subscribeOnboarding,
  type UserOnboardingState,
} from "../utils/userOnboarding";
import {
  getDifficultyColor,
  getShortLessonSummary,
  InteractiveLessonNode,
  ScrollRevealRow,
  TRACK_KEYS,
  TRACK_PITCH_META,
  TrackPathCard,
  TreeConnector,
} from "./RoadmapSubcomponents";
import { createRoadmapStyles } from "./roadmapStyles";

export interface Lesson {
  id: string;
  slug?: string;
  title: string;
  track: string;
  category?: string;
  difficulty?: string;
  tree_row?: number;
  prereq_names?: string;
  description: string;
  content?: string;
  assignment?: string;
  initial_code?: string;
  expected_output?: string;
  constraints?: string[];
  complexities?: { time?: string; space?: string };
  practiceChallenges?: PracticeChallenge[];
  is_recap?: boolean;
  recap_chapter?: number;
  recap_topics?: string[];
  is_free: boolean;
  lesson_order: number;
}

interface RoadmapTreeProps {
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  completedChallenges?: Record<string, boolean>;
  peekedSolutions?: Record<string, boolean>;
  reviewSchedule?: Record<string, ReviewScheduleEntry>;
  isPremium: boolean;
  activeTrack: string;
  onSelectTrack: (track: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  claimedChapters?: Record<string, boolean>;
  onClaimChapterBonus?: (chapterKey: string, bonusXp: number) => void;
  onClaimDailyQuestBonus?: () => void;
  isAuthenticated?: boolean;
  totalXp?: number;
  streakCount?: number;
  lastActiveDate?: string | null;
  totalSolvedCount?: number;
  onStartQuickMode?: (mode: "bughunt" | "blitz" | "algolab") => void;
  onSaveStreak?: () => void;
  onOpenAuth?: (mode?: "signup" | "signin", reason?: string) => void;
  onOpenPaywall?: () => void;
  onOpenTrackCertificate?: (trackKey: string) => void;
  onOpenChapterCertificate?: (trackKey: string, chapter: ChapterTierMeta) => void;
}


export default function RoadmapTree({
  lessons,
  completedLessons,
  completedChallenges = {},
  peekedSolutions = {},
  reviewSchedule = {},
  isPremium,
  activeTrack,
  onSelectTrack,
  onSelectLesson,
  claimedChapters = {},
  onClaimChapterBonus,
  onClaimDailyQuestBonus,
  totalXp = 0,
  streakCount = 0,
  lastActiveDate = null,
  totalSolvedCount = 0,
  onStartQuickMode,
  onOpenPaywall,
  onOpenChapterCertificate,
}: RoadmapTreeProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createRoadmapStyles);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const viewportWidth = windowWidth > 0 ? windowWidth : 1024;
  const viewportHeight = windowHeight > 0 ? windowHeight : 820;

  const [statusFilter, setStatusFilter] = useState<
    "all" | "unsolved" | "solved" | "due"
  >("all");
  const [chapterFilter, setChapterFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onboardingState, setOnboardingState] = useState<UserOnboardingState>(
    () => getOnboardingState(),
  );
  const [treeOffsetY, setTreeOffsetY] = useState<number>(620);

  useEffect(() => {
    void hydrateOnboardingState();
    return subscribeOnboarding(setOnboardingState);
  }, []);
  const [maxScrollBottomY, setMaxScrollBottomY] = useState<number>(viewportHeight);
  const [contentHeight, setContentHeight] = useState<number>(2000);
  const [scrollViewHeight, setScrollViewHeight] = useState<number>(viewportHeight);
  const [scrollAnim] = useState(() => new Animated.Value(0));

  const effectiveViewportHeight = Math.max(scrollViewHeight, viewportHeight);
  const scrollThresholdY = Math.max(maxScrollBottomY, effectiveViewportHeight);
  const maxScrollableDistance = Math.max(200, contentHeight - effectiveViewportHeight);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const onWinScroll = () => {
      const y = window.scrollY || 0;
      scrollAnim.setValue(y);
      const nextBottom = y + window.innerHeight;
      setMaxScrollBottomY((prev) => (nextBottom > prev + 24 ? nextBottom : prev));
    };
    window.addEventListener("scroll", onWinScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWinScroll);
  }, [scrollAnim]);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    scrollAnim.setValue(y);
    const viewH = e.nativeEvent.layoutMeasurement?.height || effectiveViewportHeight;
    const nextBottom = y + viewH;
    setMaxScrollBottomY((prev) => (nextBottom > prev + 24 ? nextBottom : prev));
  }

  const crtParallaxY = scrollAnim.interpolate({
    inputRange: [0, 260],
    outputRange: [0, -14],
    extrapolate: "clamp",
  });
  const crtScrollScale = scrollAnim.interpolate({
    inputRange: [0, 280],
    outputRange: [1, 0.96],
    extrapolate: "clamp",
  });
  const crtScrollOpacity = scrollAnim.interpolate({
    inputRange: [0, 320],
    outputRange: [1, 0.88],
    extrapolate: "clamp",
  });

  const trackLessons = lessons.filter((l) => l.track === activeTrack);
  const completedCount = trackLessons.filter(
    (l) => completedLessons[l.id],
  ).length;
  const unsolvedCount = trackLessons.length - completedCount;
  const progressPercent = trackLessons.length
    ? Math.round((completedCount / trackLessons.length) * 100)
    : 0;

  const currentTrackMeta =
    TrackThemes[activeTrack] || TrackThemes.python_basics;
  const trackChapters =
    TRACK_CHAPTERS[activeTrack] || TRACK_CHAPTERS.python_basics;

  function getChapterForLesson(lesson: Lesson): ChapterTierMeta {
    return getChapterForTrackLesson(activeTrack, lesson);
  }

  // Determine the "Next Up" recommended lesson in the current track
  const nextUpLesson =
    trackLessons.find(
      (l) => !completedLessons[l.id] && !isLessonLockedForUser(l, isPremium),
    ) ||
    trackLessons.find((l) => !completedLessons[l.id]) ||
    trackLessons[0];

  const isBrandNewHero = totalXp === 0 && totalSolvedCount === 0 && completedCount === 0;

  const dueReviewItems = buildDueReviewQueue({
    lessons,
    completedLessons,
    peekedSolutions,
    reviewSchedule,
    isPremium,
    trackFilter: activeTrack,
  });
  const dueReviewIdSet = new Set(dueReviewItems.map((item) => item.lesson.id));
  const reviewSummary = getReviewRetentionSummary({
    lessons,
    completedLessons,
    peekedSolutions,
    reviewSchedule,
    isPremium,
    trackFilter: activeTrack,
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTrackLessons = trackLessons.filter((lesson) => {
    const isDone = Boolean(completedLessons[lesson.id]);
    if (statusFilter === "unsolved" && isDone) return false;
    if (statusFilter === "solved" && !isDone) return false;
    if (statusFilter === "due" && !dueReviewIdSet.has(lesson.id)) return false;
    if (chapterFilter !== null) {
      const ch = getChapterForLesson(lesson);
      if (ch.id !== chapterFilter) return false;
    }
    if (normalizedQuery) {
      const matchTitle = lesson.title.toLowerCase().includes(normalizedQuery);
      const matchCat = (lesson.category || "")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchDesc = (lesson.description || "")
        .toLowerCase()
        .includes(normalizedQuery);
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  const rowsMap: Record<number, Lesson[]> = {};
  filteredTrackLessons.forEach((lesson) => {
    const r = lesson.tree_row || lesson.lesson_order || 1;
    if (!rowsMap[r]) rowsMap[r] = [];
    rowsMap[r].push(lesson);
  });

  const sortedRows = Object.keys(rowsMap)
    .map(Number)
    .sort(
      (a, b) =>
        getCurriculumLessonSortKey(activeTrack, rowsMap[a][0]) -
        getCurriculumLessonSortKey(activeTrack, rowsMap[b][0]),
    );

  return (
    <View style={styles.rootWrap}>
      <RoadmapScrollBackdrop
        scrollAnim={scrollAnim}
        viewportWidth={viewportWidth}
        viewportHeight={effectiveViewportHeight}
        maxScrollableDistance={maxScrollableDistance}
        accentColor={currentTrackMeta.stickerBg}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_w, h) => setContentHeight(h)}
      >
      {/* Top Neo-Brutalist Track Header & Selector */}
      <View style={styles.headerSection}>
        <View style={styles.editorialTopRow}>
          <View style={styles.editorialLeft}>
            <View
              style={[
                styles.eyebrowSticker,
                { backgroundColor: currentTrackMeta.stickerBg },
              ]}
            >
              <Text style={styles.eyebrow}>
                TRACK {currentTrackMeta.tag} · {currentTrackMeta.icon} INTERACTIVE PATH
              </Text>
            </View>
            <Text style={styles.mainHeading}>{currentTrackMeta.label}</Text>
            <Text style={styles.subHeading}>{currentTrackMeta.subtitle}</Text>

            {nextUpLesson ? (
              <View style={styles.heroActionRow}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.heroPrimaryBtn,
                    pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                  ]}
                  onPress={() => {
                    playKeyClick();
                    onSelectLesson(nextUpLesson);
                  }}
                >
                  <Text style={styles.heroPrimaryBtnText} numberOfLines={1}>
                    {isBrandNewHero
                      ? "▶ START LESSON 01 (+50 XP) →"
                      : completedCount === trackLessons.length && trackLessons.length > 0
                        ? "↻ REPLAY TRACK →"
                        : `▶ CONTINUE: ${nextUpLesson.title} →`}
                  </Text>
                </Pressable>

                {onStartQuickMode ? (
                  <View style={styles.heroQuickModesRow}>
                    <Pressable
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.heroSecondaryBtn,
                        pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                      ]}
                      onPress={() => {
                        playKeyClick();
                        onStartQuickMode("blitz");
                      }}
                    >
                      <Text style={styles.heroSecondaryBtnText}>⚡ 60S BLITZ</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.heroSecondaryBtn,
                        pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                      ]}
                      onPress={() => {
                        playKeyClick();
                        onStartQuickMode("bughunt");
                      }}
                    >
                      <Text style={styles.heroSecondaryBtnText}>🪲 BUG HUNT</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Right-Side Interactive 5-Channel Midnight Bubble Retro TV + VHS Slot */}
          <RoadmapRetroTv
            activeTrack={activeTrack}
            trackIconLabel={currentTrackMeta.icon}
            completedCount={completedCount}
            totalCount={trackLessons.length}
            progressPercent={progressPercent}
            nextUpLessonTitle={nextUpLesson?.title}
            scrollTranslateY={crtParallaxY}
            scrollScale={crtScrollScale}
            scrollOpacity={crtScrollOpacity}
          />
        </View>

        {/* 5-Second Interactive Welcome for First-Time Visitors */}
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

        {/* Byte-Cat Companion Hub & Interactive Quotes */}
        <ByteCatGuideCard
          completedCount={completedCount}
          totalCount={trackLessons.length}
          activeTrack={activeTrack}
          activeTrackLabel={currentTrackMeta.label}
          activeTrackAccent={currentTrackMeta.stickerBg}
          isPremium={isPremium}
          streakCount={streakCount}
          lastActiveDate={lastActiveDate}
          onOpenPaywall={onOpenPaywall}
        />

        {/* Suggestive 3-Path Track Switcher */}
        <View style={styles.trackSwitcherSection}>
          <Text style={styles.trackSectionKicker}>
            CHOOSE YOUR LEARNING PATH
          </Text>
          <View style={styles.trackTabsBar}>
            {TRACK_KEYS.map((trackKey) => {
              const meta = TrackThemes[trackKey];
              const pitch =
                TRACK_PITCH_META[trackKey] || TRACK_PITCH_META.python_basics;
              const isSelected = activeTrack === trackKey;
              const isTrackLocked = meta.isPro && !isPremium;
              const tLessons = lessons.filter((l) => l.track === trackKey);
              const tDone = tLessons.filter((l) => completedLessons[l.id]).length;

              return (
                <TrackPathCard
                  key={trackKey}
                  isSelected={isSelected}
                  isTrackLocked={isTrackLocked}
                  stickerBg={meta.stickerBg}
                  emoji={pitch.emoji}
                  badge={pitch.badge}
                  shortName={pitch.shortName}
                  hook={pitch.hook}
                  doneCount={tDone}
                  totalCount={tLessons.length}
                  onPress={() => onSelectTrack(trackKey)}
                />
              );
            })}
          </View>
        </View>

        {/* Today's 5-Min Daily Quest Strip */}
        <RoadmapDailyQuestCard
          onStartLessonStep={
            nextUpLesson ? () => onSelectLesson(nextUpLesson) : undefined
          }
          onStartArenaStep={
            onStartQuickMode ? (mode) => onStartQuickMode(mode) : undefined
          }
          onClaimBonus={onClaimDailyQuestBonus}
        />

        {/* Spaced Repetition Review Queue */}
        <RoadmapReviewCard
          dueItems={dueReviewItems}
          summary={reviewSummary}
          onStartReview={(lesson) => onSelectLesson(lesson)}
          onFilterDue={() =>
            setStatusFilter((prev) => (prev === "due" ? "all" : "due"))
          }
        />

        {/* Filter & Search Control Bar */}
        <View style={styles.filterToolbarCard}>
          <View style={styles.filterPillsRow}>
            {(
              [
                { id: "all", label: `ALL (${trackLessons.length})` },
                { id: "unsolved", label: `UNSOLVED (${unsolvedCount})` },
                { id: "solved", label: `SOLVED ✓ (${completedCount})` },
                ...(dueReviewItems.length > 0
                  ? [
                      {
                        id: "due" as const,
                        label: `🔁 REVIEW (${dueReviewItems.length})`,
                      },
                    ]
                  : []),
              ] as const
            ).map((f) => {
              const isSelected = statusFilter === f.id;
              return (
                <Pressable
                  key={f.id}
                  style={[
                    styles.filterPill,
                    isSelected && [
                      styles.filterPillActive,
                      { backgroundColor: currentTrackMeta.stickerBg },
                    ],
                  ]}
                  onPress={() => {
                    playKeyClick();
                    setStatusFilter(f.id);
                  }}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isSelected && styles.filterPillTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.filterDivider} />

            {trackChapters.map((ch) => {
              const isSelected = chapterFilter === ch.id;
              const chLessons = trackLessons.filter(
                (l) =>
                  l.lesson_order >= ch.minOrder &&
                  l.lesson_order <= ch.maxOrder,
              );
              const chCleared =
                chLessons.length > 0 &&
                chLessons.every((l) => completedLessons[l.id]);
              return (
                <Pressable
                  key={ch.id}
                  style={[
                    styles.filterPill,
                    isSelected && [
                      styles.filterPillActive,
                      { backgroundColor: StudioColors.yellow },
                    ],
                  ]}
                  onPress={() => {
                    playKeyClick();
                    setChapterFilter((prev) => (prev === ch.id ? null : ch.id));
                  }}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isSelected && styles.filterPillTextActive,
                    ]}
                  >
                    CH. {ch.roman}
                    {chCleared ? " ★" : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.searchBoxRow}>
            <Text style={styles.searchIconText}>⌕</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search modules by topic, keyword, or concept..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
            {(searchQuery.length > 0 ||
              statusFilter !== "all" ||
              chapterFilter !== null) && (
              <Pressable
                style={styles.clearFiltersBtn}
                onPress={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setChapterFilter(null);
                }}
              >
                <Text style={styles.clearFiltersText}>RESET ✕</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Skill Tree Canvas */}
      <View
        style={styles.treeCanvas}
        onLayout={(e) => setTreeOffsetY(e.nativeEvent.layout.y)}
      >
        <View style={styles.treeLegendBar}>
          <View style={styles.treeLegendItem}>
            <View style={[styles.treeLegendDot, { backgroundColor: StudioColors.lime }]} />
            <Text style={styles.treeLegendText}>UP NEXT</Text>
          </View>
          <View style={styles.treeLegendItem}>
            <View style={[styles.treeLegendDot, { backgroundColor: StudioColors.mint }]} />
            <Text style={styles.treeLegendText}>SOLVED ✓</Text>
          </View>
          <View style={styles.treeLegendItem}>
            <View style={[styles.treeLegendDot, { backgroundColor: StudioColors.pink }]} />
            <Text style={styles.treeLegendText}>PRO</Text>
          </View>
        </View>
        {sortedRows.length === 0 ? (
          <View style={styles.emptyFilterCard}>
            <Text style={styles.emptyFilterTitle}>
              No modules match your current filter
            </Text>
            <Text style={styles.emptyFilterSubtext}>
              Try clearing your search query or switching back to ALL modules.
            </Text>
            <Pressable
              style={styles.resetFilterCtaBtn}
              onPress={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setChapterFilter(null);
              }}
            >
              <Text style={styles.resetFilterCtaText}>SHOW ALL MODULES →</Text>
            </Pressable>
          </View>
        ) : (
          sortedRows.map((rowNum, idx) => {
            const rowNodes = rowsMap[rowNum];
            const isLastRow = idx === sortedRows.length - 1;
            const nextRowNodes = !isLastRow ? rowsMap[sortedRows[idx + 1]] : [];
            const rowCleared = rowNodes.some((n) => completedLessons[n.id]);

            const firstNodeInRow = rowNodes[0];
            const currentChapter = getChapterForLesson(firstNodeInRow);
            const prevChapter =
              idx > 0 ? getChapterForLesson(rowsMap[sortedRows[idx - 1]][0]) : null;
            const isFirstRowOfChapter =
              !prevChapter || prevChapter.id !== currentChapter.id;

            const chapterLessons = trackLessons.filter((l) =>
              isLessonInChapter(l, currentChapter),
            );
            const chapterDoneCount = chapterLessons.filter(
              (l) => completedLessons[l.id],
            ).length;
            const isChapterCleared =
              chapterLessons.length > 0 &&
              chapterDoneCount === chapterLessons.length;
            const chapterBonusKey = `${activeTrack}_ch_${currentChapter.id}`;
            const isChapterBonusClaimed = Boolean(
              claimedChapters[chapterBonusKey],
            );

            return (
              <ScrollRevealRow
                key={`${activeTrack}-${rowNum}`}
                rowIndex={idx}
                treeOffsetY={treeOffsetY}
                scrollThresholdY={scrollThresholdY}
              >
                {isFirstRowOfChapter && (
                  <View
                    style={[
                      styles.chapterBannerCard,
                      isChapterCleared && styles.chapterBannerCardCleared,
                    ]}
                  >
                    <View
                      style={[
                        styles.chapterTopAccent,
                        {
                          backgroundColor: isChapterCleared
                            ? StudioColors.yellow
                            : currentTrackMeta.stickerBg,
                        },
                      ]}
                    />
                    <View style={styles.chapterBannerRow}>
                      <View style={styles.chapterBannerLeft}>
                        <View style={styles.chapterRomanRow}>
                          <View style={styles.chapterRomanPill}>
                            <Text style={styles.chapterRomanText}>
                              CHAPTER {currentChapter.roman} · MODULES{" "}
                              {String(currentChapter.minOrder).padStart(2, "0")}–
                              {String(currentChapter.maxOrder).padStart(2, "0")}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.chapterBonusTagPill,
                              isChapterCleared && {
                                backgroundColor: StudioColors.mint,
                                borderColor: StudioColors.ink,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chapterBonusTagText,
                                isChapterCleared && { color: StudioColors.ink },
                              ]}
                            >
                              {isChapterCleared
                                ? "🏆 MILESTONE UNLOCKED"
                                : `🎁 +100 XP BONUS AT ${chapterLessons.length}/${chapterLessons.length}`}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.chapterBannerTitle}>
                          {currentChapter.title}
                        </Text>
                        <Text style={styles.chapterBannerSubtitle}>
                          {currentChapter.subtitle}
                        </Text>

                        {/* 4-Segment Chapter Progress Bar */}
                        <View style={styles.chapterSegmentsRow}>
                          {chapterLessons.map((chLesson) => {
                            const segDone = Boolean(
                              completedLessons[chLesson.id],
                            );
                            return (
                              <View
                                key={chLesson.id}
                                style={[
                                  styles.chapterSegmentBlock,
                                  segDone && {
                                    backgroundColor: StudioColors.mint,
                                  },
                                ]}
                              />
                            );
                          })}
                        </View>
                      </View>

                      <View style={styles.chapterRightCol}>
                        {isChapterCleared &&
                        !isChapterBonusClaimed &&
                        onClaimChapterBonus ? (
                          <Pressable
                            style={({ pressed }) => [
                              styles.claimChapterBonusBtn,
                              pressed && {
                                transform: [
                                  { translateX: 1 },
                                  { translateY: 1 },
                                ],
                              },
                            ]}
                            onPress={() =>
                              onClaimChapterBonus(chapterBonusKey, 100)
                            }
                          >
                            <Text style={styles.claimChapterBonusText}>
                              🎁 CLAIM +100 XP →
                            </Text>
                          </Pressable>
                        ) : (
                          <View
                            style={[
                              styles.chapterProgressBadge,
                              isChapterCleared && {
                                backgroundColor: StudioColors.yellow,
                                borderColor: StudioColors.ink,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chapterProgressBadgeText,
                                isChapterCleared && { color: StudioColors.ink },
                              ]}
                            >
                              {isChapterCleared
                                ? isChapterBonusClaimed
                                  ? "🏆 STAMPED · +100 XP ✓"
                                  : "★ CHAPTER CLEARED ✓"
                                : `${chapterDoneCount} / ${chapterLessons.length} SOLVED`}
                            </Text>
                          </View>
                        )}
                        {isChapterCleared && onOpenChapterCertificate ? (
                          <Pressable
                            style={({ pressed }) => [
                              styles.chapterCertBtn,
                              pressed && { transform: [{ translateY: 1 }] },
                            ]}
                            onPress={() => {
                              playKeyClick();
                              onOpenChapterCertificate(
                                activeTrack,
                                currentChapter,
                              );
                            }}
                          >
                            <Text style={styles.chapterCertBtnText}>
                              🎓 CERTIFICATE ↗
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.tierLabelWrapper}>
                  <Text style={styles.tierLabelText}>
                    {firstNodeInRow.is_recap
                      ? `🏆 CHAPTER ${currentChapter.roman} RECAP BOSS`
                      : `STAGE ${String(idx + 1).padStart(2, "0")}`}
                  </Text>
                </View>

              <View style={styles.nodesRow}>
                {rowNodes.map((node) => {
                  const isDone = Boolean(completedLessons[node.id]);
                  const isRecap = Boolean(node.is_recap);
                  const isFreePreview =
                    isProTrackPreviewLesson(node) && !isPremium;
                  const isLocked = isLessonLockedForUser(node, isPremium);
                  const isNextUp =
                    !isDone && !isLocked && nextUpLesson?.id === node.id;
                  const diffStyle = getDifficultyColor(node.difficulty);
                  const shortSummary = getShortLessonSummary(node);

                  return (
                    <InteractiveLessonNode
                      key={node.id}
                      isDone={isDone}
                      isNextUp={isNextUp}
                      isLocked={isLocked}
                      isRecap={isRecap}
                      accentColor={currentTrackMeta.stickerBg}
                      onPress={() => onSelectLesson(node)}
                    >
                      {/* Top Color-Blocked Ribbon */}
                      <View
                        style={[
                          styles.nodeTopRibbon,
                          {
                            backgroundColor: isDone
                              ? StudioColors.mint
                              : isRecap
                                ? StudioColors.yellow
                                : isNextUp
                                  ? StudioColors.lime
                                  : currentTrackMeta.stickerBg,
                          },
                        ]}
                      />

                      {/* Top Status & Category Row */}
                      <View style={styles.nodeCardHeader}>
                        <View style={styles.nodeBadgeGroup}>
                          <View
                            style={[
                              styles.statusBadge,
                              isRecap && !isDone && styles.statusBadgeRecap,
                              isDone && styles.statusBadgeDone,
                              isNextUp && !isRecap && {
                                backgroundColor: StudioColors.lime,
                              },
                            ]}
                          >
                            {isLocked ? (
                              <Text style={styles.lockIcon}>PRO</Text>
                            ) : isDone ? (
                              <Text style={styles.statusIconDone}>✓</Text>
                            ) : isRecap ? (
                              <Text style={styles.statusIconRecap}>🏆</Text>
                            ) : (
                              <Text style={styles.statusNumberText}>
                                {String(node.lesson_order).padStart(2, "0")}
                              </Text>
                            )}
                          </View>

                          <Text style={styles.nodeCategory} numberOfLines={1}>
                            {isRecap
                              ? `CHAPTER ${currentChapter.roman} CAPSTONE`
                              : node.category || `MODULE ${node.lesson_order}`}
                          </Text>
                        </View>

                        {isRecap && !isDone && !isLocked ? (
                          <View style={styles.recapNodePill}>
                            <Text style={styles.recapNodePillText}>
                              🏆 CHAPTER RECAP
                            </Text>
                          </View>
                        ) : dueReviewIdSet.has(node.id) ? (
                          <View style={styles.recapNodePill}>
                            <Text style={styles.recapNodePillText}>
                              🔁 REVIEW DUE
                            </Text>
                          </View>
                        ) : isFreePreview ? (
                          <View style={styles.nextUpNodePill}>
                            <Text style={styles.nextUpNodePillText}>
                              ★ FREE PREVIEW
                            </Text>
                          </View>
                        ) : isNextUp ? (
                          <View style={styles.nextUpNodePill}>
                            <Text style={styles.nextUpNodePillText}>
                              PLAY ★
                            </Text>
                          </View>
                        ) : isLocked ? (
                          <View style={styles.proNodePill}>
                            <Text style={styles.proNodePillText}>PRO</Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.arrowBadge,
                              isDone && {
                                backgroundColor: StudioColors.mint,
                              },
                            ]}
                          >
                            <Text style={styles.arrowIcon}>→</Text>
                          </View>
                        )}
                      </View>

                      {/* Main Title & Full Short Lesson Summary */}
                      <Text style={styles.nodeTitle}>{node.title}</Text>

                      {shortSummary ? (
                        <Text style={styles.nodeDesc}>{shortSummary}</Text>
                      ) : null}

                      {isRecap && node.recap_topics && node.recap_topics.length > 0 ? (
                        <View style={styles.nodeRecapTopicsRow}>
                          {node.recap_topics.map((topic, tIdx) => (
                            <View key={tIdx} style={styles.nodeRecapTopicChip}>
                              <Text style={styles.nodeRecapTopicText}>
                                {topic}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      {/* Footer Metadata Pills */}
                      <View style={styles.nodeFooter}>
                        {node.difficulty ? (
                          <View
                            style={[
                              styles.metaPill,
                              {
                                backgroundColor: diffStyle.bg,
                                borderColor: diffStyle.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.metaPillText,
                                { color: diffStyle.text },
                              ]}
                            >
                              {node.difficulty}
                            </Text>
                          </View>
                        ) : null}

                        {node.complexities?.time ? (
                          <View style={styles.complexityMiniPill}>
                            <Text style={styles.complexityMiniText}>
                              {node.complexities.time}
                            </Text>
                          </View>
                        ) : null}

                        {node.practiceChallenges &&
                        node.practiceChallenges.length > 0 ? (
                          <View style={styles.complexityMiniPill}>
                            <Text style={styles.complexityMiniText}>
                              🎯{" "}
                              {(() => {
                                const prog = getLessonStageProgress(
                                  node,
                                  completedLessons,
                                  completedChallenges,
                                );
                                return `${prog.solvedStages}/${prog.totalStages} STAGES`;
                              })()}
                            </Text>
                          </View>
                        ) : null}

                        {(() => {
                          const stars = getLessonStarRating(
                            node,
                            completedLessons,
                            completedChallenges,
                            peekedSolutions,
                          );
                          return (
                            <View
                              style={[
                                styles.nodeStarPill,
                                stars === 3 && styles.nodeStarPillGold,
                                stars > 0 && stars < 3 && styles.nodeStarPillPartial,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.nodeStarPillText,
                                  stars === 3 && styles.nodeStarPillTextGold,
                                  stars > 0 &&
                                    stars < 3 &&
                                    styles.nodeStarPillTextPartial,
                                ]}
                              >
                                {[1, 2, 3]
                                  .map((s) => (s <= stars ? "★" : "☆"))
                                  .join("")}
                              </Text>
                            </View>
                          );
                        })()}

                        <View
                          style={[
                            styles.xpMiniBadge,
                            isDone && { backgroundColor: StudioColors.mint },
                          ]}
                        >
                          <Text style={styles.xpMiniLabel}>
                            {isDone ? "✓ 50 XP" : "+50 XP"}
                          </Text>
                        </View>
                      </View>
                    </InteractiveLessonNode>
                  );
                })}
              </View>

              {!isLastRow && (
                <TreeConnector
                  fromCount={rowNodes.length}
                  toCount={nextRowNodes.length}
                  accent={currentTrackMeta.stickerBg}
                  isCompleted={rowCleared}
                />
              )}
            </ScrollRevealRow>
          );
          })
        )}
      </View>

      <View style={styles.showcaseFooterWrap}>
        <Link href="/explore" asChild>
          <Pressable style={styles.showcaseFooterBtn}>
            <Text style={styles.showcaseFooterText}>
              📖 View Track Syllabus &amp; Showcase →
            </Text>
          </Pressable>
        </Link>
      </View>
      </ScrollView>
    </View>
  );
}

