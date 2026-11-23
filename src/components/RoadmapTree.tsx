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
import {
  ChapterTierMeta,
  getChapterForTrackLesson,
  TRACK_CHAPTERS,
} from "../constants/certificates";
import { StudioColors, TrackThemes } from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { isLessonLockedForUser, PracticeChallenge } from "../types/lesson";
import { playKeyClick } from "../utils/soundEffects";
import {
  buildDueReviewQueue,
  ReviewScheduleEntry,
} from "../utils/spacedRepetition";
import RoadmapAstralChart from "./RoadmapAstralChart";
import RoadmapRetroTv from "./RoadmapRetroTv";
import RoadmapScrollBackdrop from "./RoadmapScrollBackdrop";
import {
  TRACK_KEYS,
  TRACK_PITCH_META,
  TrackPathCard,
} from "./RoadmapSubcomponents";
import { createRoadmapStyles } from "./roadmapStyles";
import { StudioIcon, Text } from "./StudioIcon";

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
  resumeLesson?: Lesson | null;
  onStartQuickMode?: (
    mode: "arcade" | "bughunt" | "blitz" | "flashcards" | "algolab",
  ) => void;
  onSaveStreak?: () => void;
  onOpenAuth?: (mode?: "signup" | "signin", reason?: string) => void;
  onOpenTrackCertificate?: (trackKey: string) => void;
  onOpenChapterCertificate?: (
    trackKey: string,
    chapter: ChapterTierMeta,
  ) => void;
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
  totalXp = 0,
  totalSolvedCount = 0,
  resumeLesson = null,
  onStartQuickMode,
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
  const [contentHeight, setContentHeight] = useState<number>(1400);
  const [scrollViewHeight, setScrollViewHeight] =
    useState<number>(viewportHeight);
  const [scrollAnim] = useState(() => new Animated.Value(0));

  const effectiveViewportHeight = Math.max(scrollViewHeight, viewportHeight);
  const maxScrollableDistance = Math.max(
    200,
    contentHeight - effectiveViewportHeight,
  );

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const onWinScroll = () => {
      scrollAnim.setValue(window.scrollY || 0);
    };
    window.addEventListener("scroll", onWinScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWinScroll);
  }, [scrollAnim]);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollAnim.setValue(e.nativeEvent.contentOffset.y);
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

  const nextUpLesson =
    trackLessons.find(
      (l) => !completedLessons[l.id] && !isLessonLockedForUser(l, isPremium),
    ) ||
    trackLessons.find((l) => !completedLessons[l.id]) ||
    trackLessons[0];

  const heroTargetLesson =
    resumeLesson &&
    resumeLesson.track === activeTrack &&
    !completedLessons[resumeLesson.id] &&
    !isLessonLockedForUser(resumeLesson, isPremium)
      ? resumeLesson
      : nextUpLesson;
  const isResumingDraft =
    Boolean(resumeLesson) && heroTargetLesson?.id === resumeLesson?.id;
  const isBrandNewHero =
    totalXp === 0 && totalSolvedCount === 0 && completedCount === 0;

  const dueReviewItems = buildDueReviewQueue({
    lessons,
    completedLessons,
    peekedSolutions,
    reviewSchedule,
    isPremium,
    trackFilter: activeTrack,
  });
  const dueReviewIdSet = new Set(dueReviewItems.map((item) => item.lesson.id));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasActiveFilter =
    statusFilter !== "all" ||
    chapterFilter !== null ||
    normalizedQuery.length > 0;

  const filteredTrackLessons = trackLessons.filter((lesson) => {
    const isDone = Boolean(completedLessons[lesson.id]);
    if (statusFilter === "unsolved" && isDone) return false;
    if (statusFilter === "solved" && !isDone) return false;
    if (statusFilter === "due" && !dueReviewIdSet.has(lesson.id)) return false;
    if (chapterFilter !== null) {
      const ch = getChapterForTrackLesson(activeTrack, lesson);
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
  const filteredLessonIds = new Set(filteredTrackLessons.map((l) => l.id));

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

              {heroTargetLesson ? (
                <View style={styles.heroActionRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isResumingDraft
                        ? `Resume draft lesson ${heroTargetLesson.title}`
                        : `Continue learning ${heroTargetLesson.title}`
                    }
                    style={({ pressed }) => [
                      styles.heroPrimaryBtn,
                      pressed && {
                        transform: [{ translateX: 1 }, { translateY: 1 }],
                      },
                    ]}
                    onPress={() => {
                      playKeyClick();
                      onSelectLesson(heroTargetLesson);
                    }}
                  >
                    <StudioIcon name="bolt" size={14} />
                    <Text style={styles.heroPrimaryBtnText} numberOfLines={1}>
                      {isResumingDraft
                        ? `RESUME DRAFT: ${heroTargetLesson.title} →`
                        : isBrandNewHero
                          ? "START LESSON 01 (+50 XP) →"
                          : completedCount === trackLessons.length &&
                              trackLessons.length > 0
                            ? "REPLAY TRACK →"
                            : `CONTINUE: ${heroTargetLesson.title} →`}
                    </Text>
                  </Pressable>

                  {onStartQuickMode ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open Devy Mini-Game Arcade"
                      style={({ pressed }) => [
                        styles.heroSecondaryBtn,
                        pressed && {
                          transform: [{ translateX: 1 }, { translateY: 1 }],
                        },
                      ]}
                      onPress={() => {
                        playKeyClick();
                        onStartQuickMode("arcade");
                      }}
                    >
                      <StudioIcon name="nav_arcade" size={15} />
                      <Text style={styles.heroSecondaryBtnText}>
                        ARCADE (6 GAMES) →
                      </Text>
                    </Pressable>
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
                const tDone = tLessons.filter(
                  (l) => completedLessons[l.id],
                ).length;

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
                placeholder="Search stars by topic, keyword, or concept..."
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
              {hasActiveFilter ? (
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
              ) : null}
            </View>
          </View>
        </View>

        {/* Interactive Astral Star Chart Observatory */}
        <View style={styles.treeCanvas}>
          <View style={styles.treeLegendBar}>
            <View style={styles.treeLegendGroup}>
              <View style={styles.treeLegendItem}>
                <View
                  style={[
                    styles.treeLegendDot,
                    { backgroundColor: StudioColors.yellow },
                  ]}
                />
                <Text style={styles.treeLegendText}>UP NEXT</Text>
              </View>
              <View style={styles.treeLegendItem}>
                <View
                  style={[
                    styles.treeLegendDot,
                    { backgroundColor: StudioColors.lime },
                  ]}
                />
                <Text style={styles.treeLegendText}>SOLVED ✓</Text>
              </View>
              <View style={styles.treeLegendItem}>
                <View
                  style={[
                    styles.treeLegendDot,
                    { backgroundColor: StudioColors.pink },
                  ]}
                />
                <Text style={styles.treeLegendText}>PRO</Text>
              </View>
            </View>

            <Text style={styles.legendHintText}>
              ✦ HOVER A STAR TO TRACE PREREQUISITES
            </Text>
          </View>

          {filteredTrackLessons.length === 0 ? (
            <View style={styles.emptyFilterCard}>
              <Text style={styles.emptyFilterTitle}>
                No stars match your current filter
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
                <Text style={styles.resetFilterCtaText}>SHOW ALL STARS →</Text>
              </Pressable>
            </View>
          ) : (
            <RoadmapAstralChart
              activeTrack={activeTrack}
              trackLabel={currentTrackMeta.label}
              trackAccent={currentTrackMeta.stickerBg}
              trackLessons={trackLessons}
              filteredLessonIds={filteredLessonIds}
              hasActiveFilter={hasActiveFilter}
              chapters={trackChapters}
              completedLessons={completedLessons}
              completedChallenges={completedChallenges}
              peekedSolutions={peekedSolutions}
              dueReviewIdSet={dueReviewIdSet}
              claimedChapters={claimedChapters}
              isPremium={isPremium}
              nextUpLesson={nextUpLesson || null}
              focusedChapterId={chapterFilter}
              onSelectLesson={onSelectLesson}
              onClaimChapterBonus={onClaimChapterBonus}
              onOpenChapterCertificate={onOpenChapterCertificate}
            />
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
