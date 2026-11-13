import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  ChapterTierMeta,
  TRACK_CHAPTERS,
} from "../constants/certificates";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import {
  isLessonLockedForUser,
  isProTrackPreviewLesson,
  readLocalJson,
  STORAGE_QUICKSTART_DISMISSED_KEY,
  writeLocalJson,
} from "../types/lesson";
import { playCrtChannelSwitch, playKeyClick } from "../utils/soundEffects";
import ByteCatGuideCard from "./ByteCatGuideCard";
import StreakAtRiskBanner from "./StreakAtRiskBanner";

export interface Lesson {
  id: string;
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
  is_free: boolean;
  lesson_order: number;
}

interface RoadmapTreeProps {
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  isPremium: boolean;
  activeTrack: string;
  onSelectTrack: (track: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  claimedChapters?: Record<string, boolean>;
  onClaimChapterBonus?: (chapterKey: string, bonusXp: number) => void;
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

const TRACK_KEYS = ["python_basics", "algorithms", "system_design"] as const;

const TRACK_PITCH_META: Record<
  string,
  {
    emoji: string;
    badge: string;
    shortName: string;
    hook: string;
  }
> = {
  python_basics: {
    emoji: "🐍",
    badge: "START HERE",
    shortName: "Python Foundations",
    hook: "Variables, loops, lists & real functions from scratch",
  },
  algorithms: {
    emoji: "⚡",
    badge: "PATTERNS & INTERVIEWS",
    shortName: "Algorithms",
    hook: "Master Two Pointers, Sliding Window, Sorting & Graphs",
  },
  system_design: {
    emoji: "🏗️",
    badge: "REAL-WORLD SCALE",
    shortName: "System Design",
    hook: "Design fast caches, load balancers, queues & retries",
  },
};

const CARD_WIDTH = 292;
const CARD_GAP = 28;
const BRANCH_SPAN = CARD_WIDTH + CARD_GAP;

function getShortLessonSummary(lesson: Lesson): string {
  const raw = (lesson.description || "").replace(/`/g, "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  if (raw.length <= 135) return raw;
  const firstSentenceMatch = raw.match(/^(.{25,}?[.!?])(?:\s|$)/);
  if (firstSentenceMatch && firstSentenceMatch[1].length <= 135) {
    return firstSentenceMatch[1];
  }
  const clipped = raw.slice(0, 128);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 60 ? clipped.slice(0, lastSpace) : clipped).trim()}.`;
}

function getDifficultyColor(difficulty?: string) {
  const norm = (difficulty || "").toLowerCase();
  if (norm === "easy" || norm === "beginner") {
    return {
      text: "#111111",
      bg: "#6EE7B7",
      border: "#111111",
    };
  }
  if (norm === "hard" || norm === "advanced") {
    return {
      text: "#111111",
      bg: "#FF90E8",
      border: "#111111",
    };
  }
  return {
    text: "#111111",
    bg: "#FFDE59",
    border: "#111111",
  };
}

function TreeConnector({
  fromCount,
  toCount,
  accent,
  isCompleted,
}: {
  fromCount: number;
  toCount: number;
  accent: string;
  isCompleted: boolean;
}) {
  const lineColor = isCompleted ? StudioColors.mint : accent;
  const borderFrame = StudioColors.ink;
  const dotBg = isCompleted ? StudioColors.mint : StudioColors.surface;

  if (fromCount === 1 && toCount === 1) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[
            styles.vLine,
            { height: 22, backgroundColor: lineColor, borderColor: borderFrame },
          ]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: borderFrame, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[
            styles.vLine,
            { height: 20, backgroundColor: lineColor, borderColor: borderFrame },
          ]}
        />
        <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
      </View>
    );
  }

  if (fromCount === 1 && toCount === 2) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[
            styles.vLine,
            { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
          ]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: borderFrame, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[
            styles.hLine,
            {
              width: BRANCH_SPAN,
              backgroundColor: lineColor,
              borderColor: borderFrame,
            },
          ]}
        />
        <View style={[styles.legsRow, { width: BRANCH_SPAN }]}>
          <View style={styles.legCol}>
            <View
              style={[
                styles.vLine,
                { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
          </View>
          <View style={styles.legCol}>
            <View
              style={[
                styles.vLine,
                { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
          </View>
        </View>
      </View>
    );
  }

  if (fromCount === 2 && toCount === 2) {
    return (
      <View style={styles.connectorContainer}>
        <View style={[styles.legsRow, { width: BRANCH_SPAN }]}>
          <View style={styles.legCol}>
            <View
              style={[
                styles.vLine,
                { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <View
              style={[
                styles.junctionDot,
                { borderColor: borderFrame, backgroundColor: dotBg },
              ]}
            />
            <View
              style={[
                styles.vLine,
                { height: 16, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
          </View>
          <View style={styles.legCol}>
            <View
              style={[
                styles.vLine,
                { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <View
              style={[
                styles.junctionDot,
                { borderColor: borderFrame, backgroundColor: dotBg },
              ]}
            />
            <View
              style={[
                styles.vLine,
                { height: 16, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
          </View>
        </View>
      </View>
    );
  }

  if (fromCount === 2 && toCount === 1) {
    return (
      <View style={styles.connectorContainer}>
        <View style={[styles.legsRow, { width: BRANCH_SPAN }]}>
          <View
            style={[
              styles.vLine,
              { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
            ]}
          />
          <View
            style={[
              styles.vLine,
              { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
            ]}
          />
        </View>
        <View
          style={[
            styles.hLine,
            {
              width: BRANCH_SPAN,
              backgroundColor: lineColor,
              borderColor: borderFrame,
            },
          ]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: borderFrame, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[
            styles.vLine,
            { height: 16, backgroundColor: lineColor, borderColor: borderFrame },
          ]}
        />
        <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
      </View>
    );
  }

  return (
    <View style={styles.connectorContainer}>
      <View
        style={[
          styles.vLine,
          { height: 28, backgroundColor: lineColor, borderColor: borderFrame },
        ]}
      />
      <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
    </View>
  );
}

function ScrollRevealRow({
  rowIndex,
  treeOffsetY,
  scrollThresholdY,
  children,
}: {
  rowIndex: number;
  treeOffsetY: number;
  scrollThresholdY: number;
  children: React.ReactNode;
}) {
  const [rowY, setRowY] = useState<number | null>(null);
  const [opacityAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(rowIndex === 0 ? 14 : 26));
  const [scaleAnim] = useState(() => new Animated.Value(0.97));

  const shouldReveal =
    rowIndex === 0 ||
    (rowY !== null && treeOffsetY + rowY <= scrollThresholdY - 24);

  useEffect(() => {
    if (!shouldReveal) return;
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [shouldReveal, opacityAnim, slideAnim, scaleAnim]);

  return (
    <Animated.View
      onLayout={(e) => {
        const nextY = e.nativeEvent.layout.y;
        setRowY((prev) => (prev === null || Math.abs(prev - nextY) > 8 ? nextY : prev));
      }}
      style={[
        styles.rowWrapper,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function InteractiveLessonNode({
  isDone,
  isNextUp,
  isLocked,
  accentColor,
  onPress,
  children,
}: {
  isDone: boolean;
  isNextUp: boolean;
  isLocked: boolean;
  accentColor: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [pressed, setPressed] = useState<boolean>(false);
  const [liftAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const targetLift = pressed ? 1 : hovered ? -6 : 0;
    const targetScale = pressed ? 0.985 : hovered ? 1.028 : 1;
    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: targetLift,
        friction: 6,
        tension: 170,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: targetScale,
        friction: 6,
        tension: 170,
        useNativeDriver: false,
      }),
    ]).start();
  }, [hovered, pressed, liftAnim, scaleAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
        zIndex: hovered ? 10 : 1,
      }}
    >
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
        style={[
          styles.nodeCard,
          isDone && styles.nodeCardDone,
          isNextUp && styles.nodeCardNextUp,
          isLocked && styles.nodeCardLocked,
          hovered && [
            styles.nodeCardHovered,
            { borderColor: isNextUp ? StudioColors.lime : accentColor },
          ],
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function TrackPathCard({
  isSelected,
  isTrackLocked,
  stickerBg,
  emoji,
  badge,
  shortName,
  hook,
  doneCount,
  totalCount,
  onPress,
}: {
  isSelected: boolean;
  isTrackLocked: boolean;
  stickerBg: string;
  emoji: string;
  badge: string;
  shortName: string;
  hook: string;
  doneCount: number;
  totalCount: number;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [liftAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(liftAnim, {
      toValue: hovered ? -4 : 0,
      friction: 6,
      tension: 170,
      useNativeDriver: false,
    }).start();
  }, [hovered, liftAnim]);

  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <Animated.View
      style={[
        styles.trackCardAnimWrap,
        { transform: [{ translateY: liftAnim }] },
      ]}
    >
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          styles.trackPathCard,
          isSelected && [
            styles.trackPathCardActive,
            { backgroundColor: stickerBg },
          ],
          isTrackLocked && !isSelected && styles.trackTabPillLocked,
          hovered && !isSelected && styles.trackPathCardHover,
          pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
        ]}
        onPress={onPress}
      >
        <View style={styles.trackPathTopRow}>
          <View
            style={[
              styles.trackEmojiBadge,
              {
                backgroundColor: isSelected ? StudioColors.ink : stickerBg,
              },
            ]}
          >
            <Text style={styles.trackEmojiText}>{emoji}</Text>
            <Text
              style={[
                styles.trackTagMini,
                isSelected && { color: stickerBg },
              ]}
            >
              {badge}
            </Text>
          </View>

          {isTrackLocked ? (
            <View style={styles.trackProBadge}>
              <Text style={styles.trackProBadgeText}>🔒 PRO · 1 FREE</Text>
            </View>
          ) : (
            <View
              style={[
                styles.trackCountBadge,
                isSelected && { borderColor: StudioColors.ink },
              ]}
            >
              <Text style={styles.trackCountText}>
                {doneCount}/{totalCount}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.trackPathTitle,
            isSelected && { color: StudioColors.ink },
          ]}
        >
          {shortName}
        </Text>

        <Text
          style={[
            styles.trackPathHook,
            isSelected && { color: StudioColors.ink, opacity: 0.85 },
          ]}
        >
          {hook}
        </Text>

        <View
          style={[
            styles.trackPathMeterBg,
            isSelected && { borderColor: StudioColors.ink },
          ]}
        >
          <View
            style={[
              styles.trackPathMeterFill,
              {
                width: `${Math.max(pct, 5)}%`,
                backgroundColor: isSelected ? StudioColors.ink : stickerBg,
              },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function RoadmapTree({
  lessons,
  completedLessons,
  isPremium,
  activeTrack,
  onSelectTrack,
  onSelectLesson,
  claimedChapters = {},
  onClaimChapterBonus,
  totalXp = 0,
  streakCount = 0,
  lastActiveDate = null,
  totalSolvedCount = 0,
  onStartQuickMode,
  onSaveStreak,
  onOpenPaywall,
  onOpenTrackCertificate,
  onOpenChapterCertificate,
}: RoadmapTreeProps) {
  const { height: windowHeight } = useWindowDimensions();
  const viewportHeight = windowHeight > 0 ? windowHeight : 820;

  const [statusFilter, setStatusFilter] = useState<"all" | "unsolved" | "solved">("all");
  const [chapterFilter, setChapterFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [crtChannel, setCrtChannel] = useState<0 | 1 | 2>(0);
  const [quickstartDismissed, setQuickstartDismissed] = useState<boolean>(false);
  const [treeOffsetY, setTreeOffsetY] = useState<number>(620);
  const [maxScrollBottomY, setMaxScrollBottomY] = useState<number>(viewportHeight);
  const [contentHeight, setContentHeight] = useState<number>(2000);
  const [scrollViewHeight, setScrollViewHeight] = useState<number>(viewportHeight);
  const [scrollAnim] = useState(() => new Animated.Value(0));

  const effectiveViewportHeight = Math.max(scrollViewHeight, viewportHeight);
  const scrollThresholdY = Math.max(maxScrollBottomY, effectiveViewportHeight);
  const maxScrollableDistance = Math.max(200, contentHeight - effectiveViewportHeight);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuickstartDismissed(
        readLocalJson<boolean>(STORAGE_QUICKSTART_DISMISSED_KEY, false),
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
  const scrollBarWidth = scrollAnim.interpolate({
    inputRange: [0, maxScrollableDistance],
    outputRange: ["0%", "100%"],
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

  function getChapterForLesson(lessonOrder: number): ChapterTierMeta {
    return (
      trackChapters.find(
        (ch) => lessonOrder >= ch.minOrder && lessonOrder <= ch.maxOrder,
      ) || trackChapters[trackChapters.length - 1]
    );
  }

  // Determine the "Next Up" recommended lesson in the current track
  const nextUpLesson =
    trackLessons.find(
      (l) => !completedLessons[l.id] && !isLessonLockedForUser(l, isPremium),
    ) ||
    trackLessons.find((l) => !completedLessons[l.id]) ||
    trackLessons[0];

  const quickstartLesson =
    lessons.find(
      (l) => l.track === "python_basics" && !isLessonLockedForUser(l, isPremium),
    ) || nextUpLesson;

  const showFirstVisitQuickstart =
    !quickstartDismissed && totalXp === 0 && totalSolvedCount === 0 && Boolean(quickstartLesson);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTrackLessons = trackLessons.filter((lesson) => {
    const isDone = Boolean(completedLessons[lesson.id]);
    if (statusFilter === "unsolved" && isDone) return false;
    if (statusFilter === "solved" && !isDone) return false;
    if (chapterFilter !== null) {
      const ch = getChapterForLesson(lesson.lesson_order);
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
    .sort((a, b) => a - b);

  return (
    <View style={styles.rootWrap}>
      {/* Subtle Top Scroll Depth Progress Rail */}
      <View style={styles.topScrollRailBg}>
        <Animated.View
          style={[
            styles.topScrollRailFill,
            {
              width: scrollBarWidth,
              backgroundColor: currentTrackMeta.stickerBg,
            },
          ]}
        />
      </View>
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
          </View>

          {/* Right-Side Interactive 3-Channel Retro CRT & Code Cartridge */}
          <Animated.View
            style={{
              transform: [{ translateY: crtParallaxY }, { scale: crtScrollScale }],
              opacity: crtScrollOpacity,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.heroIllustrationWrap,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onPress={() => {
                playCrtChannelSwitch();
                setCrtChannel((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
              }}
            >
            {/* Inserted ROM Cartridge on Top */}
            <View
              style={[
                styles.crtCartridge,
                { backgroundColor: currentTrackMeta.stickerBg },
              ]}
            >
              <View style={styles.crtCartridgeGrip} />
              <Text style={styles.crtCartridgeText}>
                ROM // CH-0{crtChannel + 1}
              </Text>
            </View>

            {/* Retro Arcade Monitor Bezel */}
            <View style={styles.crtMonitorFrame}>
              <View style={styles.crtScreen}>
                <View style={styles.crtScreenTopBar}>
                  <Text style={styles.crtScreenTag}>
                    ●{" "}
                    {crtChannel === 1
                      ? "SYS_TELEMETRY.SH"
                      : crtChannel === 2
                        ? "BYTE_CAT_OS.EXE"
                        : activeTrack === "python_basics"
                          ? "PYTHON_KERNEL.PY"
                          : activeTrack === "algorithms"
                            ? "GRAPH_ENGINE.PY"
                            : "CLUSTER_MESH.PY"}
                  </Text>
                  <Text style={styles.crtScreenFps}>
                    CH 0{crtChannel + 1}/03
                  </Text>
                </View>

                {crtChannel === 0 && activeTrack === "python_basics" && (
                  <View style={styles.crtCodeBlock}>
                    <Text style={styles.crtCodeLineLime}>
                      {"def train_skill(dev):"}
                    </Text>
                    <Text style={styles.crtCodeLineYellow}>
                      {"  while dev.curious:"}
                    </Text>
                    <Text style={styles.crtCodeLinePink}>
                      {"    yield dev.level_up()"}
                    </Text>
                  </View>
                )}

                {crtChannel === 0 && activeTrack === "algorithms" && (
                  <View style={styles.crtCodeBlock}>
                    <Text style={styles.crtCodeLineViolet}>
                      {"      [ROOT: 42]"}
                    </Text>
                    <Text style={styles.crtCodeLineYellow}>
                      {"     /          \\"}
                    </Text>
                    <Text style={styles.crtCodeLineLime}>
                      {" [L: 18]      [R: 89]"}
                    </Text>
                  </View>
                )}

                {crtChannel === 0 && activeTrack === "system_design" && (
                  <View style={styles.crtCodeBlock}>
                    <Text style={styles.crtCodeLinePink}>
                      {"[CDN] ──► [LB: NGINX]"}
                    </Text>
                    <Text style={styles.crtCodeLineLime}>
                      {"  ├──► [API_NODE_01]"}
                    </Text>
                    <Text style={styles.crtCodeLineYellow}>
                      {"  └──► [REDIS_CACHE]"}
                    </Text>
                  </View>
                )}

                {crtChannel === 1 && (
                  <View style={styles.crtCodeBlock}>
                    <Text style={styles.crtCodeLineLime}>
                      {`SOLVED: ${completedCount}/${trackLessons.length} MODULES`}
                    </Text>
                    <Text style={styles.crtCodeLineYellow}>
                      {`METER : [${"█".repeat(
                        Math.round((progressPercent / 100) * 8),
                      )}${"░".repeat(
                        Math.max(
                          0,
                          8 - Math.round((progressPercent / 100) * 8),
                        ),
                      )}] ${progressPercent}%`}
                    </Text>
                    <Text style={styles.crtCodeLinePink}>
                      {progressPercent === 100
                        ? "STATUS: TRACK CLEARED ★"
                        : "STATUS: KERNEL ACTIVE"}
                    </Text>
                  </View>
                )}

                {crtChannel === 2 && (
                  <View style={styles.crtCodeBlock}>
                    <Text style={styles.crtCodeLineViolet}>
                      {"  /\\_/\\   BYTE-CAT v1.0"}
                    </Text>
                    <Text style={styles.crtCodeLineLime}>
                      {completedCount > 0
                        ? ' ( ★_★ )  "PURR-FECT CODE!"'
                        : ' ( ^._.^ ) "LET\'S PAW-GRAM!"'}
                    </Text>
                    <Text style={styles.crtCodeLineYellow}>
                      {"  { _ }   [TAP CRT ↻]"}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.crtMonitorChin}>
                <View style={styles.crtPowerLed} />
                <Text style={styles.crtMonitorBrand}>
                  DECK-01 · TAP SCREEN ↻
                </Text>
                <View style={styles.crtVentSlots}>
                  <View style={styles.crtVentSlot} />
                  <View style={styles.crtVentSlot} />
                  <View style={styles.crtVentSlot} />
                </View>
              </View>
            </View>

            {/* Decorative Floating Arcade Stickers */}
            <View style={styles.heroArtStickerTopLeft}>
              <Text style={styles.heroArtStickerText}>✦ {currentTrackMeta.icon}</Text>
            </View>
            <View style={styles.heroArtStickerBottomRight}>
              <Text style={styles.heroArtStickerText}>⚡ XP+50</Text>
            </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Byte-Cat Companion Hub & Interactive Briefing */}
        <ByteCatGuideCard
          completedCount={completedCount}
          totalCount={trackLessons.length}
          activeTrack={activeTrack}
          activeTrackLabel={currentTrackMeta.label}
          activeTrackAccent={currentTrackMeta.stickerBg}
          totalXp={totalXp}
          streakCount={streakCount}
          isPremium={isPremium}
          onOpenPaywall={onOpenPaywall}
          nextLessonTitle={nextUpLesson?.title}
          onPressNextLesson={
            nextUpLesson ? () => onSelectLesson(nextUpLesson) : undefined
          }
        />

        {showFirstVisitQuickstart && quickstartLesson ? (
          <View style={styles.onboardingBannerCard}>
            <View style={styles.onboardingHeaderRow}>
              <View style={styles.onboardingBadge}>
                <Text style={styles.onboardingBadgeText}>
                  ⚡ 30-SECOND QUICKSTART · ZERO SETUP
                </Text>
              </View>
              <Pressable
                style={styles.onboardingDismissBtn}
                onPress={() => {
                  playKeyClick();
                  setQuickstartDismissed(true);
                  writeLocalJson(STORAGE_QUICKSTART_DISMISSED_KEY, true);
                }}
              >
                <Text style={styles.onboardingDismissText}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.onboardingTitle}>
              Claim your first +50 XP in under 30 seconds
            </Text>
            <Text style={styles.onboardingSubtext}>
              Run real Python right in your browser or jump straight into an
              arcade sprint—no account required to start.
            </Text>

            <View style={styles.onboardingActionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.onboardingPrimaryBtn,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  onSelectLesson(quickstartLesson);
                }}
              >
                <Text style={styles.onboardingPrimaryBtnText}>
                  ▶ LESSON 01 (+50 XP) →
                </Text>
              </Pressable>

              {onStartQuickMode ? (
                <>
                  <Pressable
                    style={styles.onboardingSecondaryBtn}
                    onPress={() => {
                      playKeyClick();
                      onStartQuickMode("blitz");
                    }}
                  >
                    <Text style={styles.onboardingSecondaryBtnText}>
                      ⚡ 60S BLITZ
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.onboardingSecondaryBtn}
                    onPress={() => {
                      playKeyClick();
                      onStartQuickMode("bughunt");
                    }}
                  >
                    <Text style={styles.onboardingSecondaryBtnText}>
                      🪲 BUG HUNT
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.onboardingSecondaryBtn}
                    onPress={() => {
                      playKeyClick();
                      onStartQuickMode("algolab");
                    }}
                  >
                    <Text style={styles.onboardingSecondaryBtnText}>
                      ★ ALGO LAB
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          </View>
        ) : null}

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

        {/* Track Mastery & Up Next Banner */}
        <View style={styles.overviewCard}>
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <View style={styles.progressTitleGroup}>
                <Text style={styles.progressLabel}>
                  {currentTrackMeta.label.toUpperCase()} MASTERY
                </Text>
                <Text style={styles.progressSubtext}>
                  {completedCount} of {trackLessons.length} modules solved
                </Text>
              </View>
              <View style={styles.trackBadgesRightRow}>
                {completedCount === trackLessons.length &&
                trackLessons.length > 0 &&
                onOpenTrackCertificate ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.trackCertPillBtn,
                      pressed && { transform: [{ translateY: 1 }] },
                    ]}
                    onPress={() => {
                      playKeyClick();
                      onOpenTrackCertificate(activeTrack);
                    }}
                  >
                    <Text style={styles.trackCertPillText}>
                      🎓 CERTIFICATE ↗
                    </Text>
                  </Pressable>
                ) : null}
                <View
                  style={[
                    styles.percentBadge,
                    {
                      backgroundColor: currentTrackMeta.stickerBg,
                    },
                  ]}
                >
                  <Text style={styles.progressPercentText}>
                    {progressPercent}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.max(progressPercent, 4)}%`,
                    backgroundColor: StudioColors.mint,
                  },
                ]}
              />
            </View>
          </View>

          {nextUpLesson && (
            <View style={styles.upNextBanner}>
              <View style={styles.upNextLeft}>
                <View style={styles.upNextMetaRow}>
                  <View style={styles.upNextSticker}>
                    <Text style={styles.upNextTag}>
                      {completedCount === trackLessons.length &&
                      trackLessons.length > 0
                        ? "TRACK COMPLETE · REVIEW"
                        : "UP NEXT MISSION"}
                    </Text>
                  </View>
                  <View style={styles.upNextXpPill}>
                    <Text style={styles.upNextXpPillText}>+50 XP</Text>
                  </View>
                </View>
                <Text style={styles.upNextTitle} numberOfLines={1}>
                  {nextUpLesson.title}
                </Text>
                <Text style={styles.upNextDesc} numberOfLines={1}>
                  {nextUpLesson.description}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.upNextButton,
                  pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                ]}
                onPress={() => onSelectLesson(nextUpLesson)}
              >
                <Text style={styles.upNextButtonText}>
                  {completedLessons[nextUpLesson.id]
                    ? "REVIEW MODULE"
                    : "START MISSION"}
                </Text>
                <View style={styles.upNextArrowCapsule}>
                  <Text style={styles.upNextArrowCapsuleText}>→</Text>
                </View>
              </Pressable>
            </View>
          )}
        </View>

        {/* Streak At-Risk / Protected Banner */}
        <StreakAtRiskBanner
          streakCount={streakCount}
          lastActiveDate={lastActiveDate}
          onSaveStreak={() => {
            if (onSaveStreak) {
              onSaveStreak();
            } else if (nextUpLesson) {
              onSelectLesson(nextUpLesson);
            }
          }}
        />

        {/* Filter & Search Control Bar */}
        <View style={styles.filterToolbarCard}>
          <View style={styles.filterPillsRow}>
            {(
              [
                { id: "all", label: `ALL (${trackLessons.length})` },
                { id: "unsolved", label: `UNSOLVED (${unsolvedCount})` },
                { id: "solved", label: `SOLVED ✓ (${completedCount})` },
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
                  onPress={() => setStatusFilter(f.id)}
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
                  onPress={() =>
                    setChapterFilter((prev) => (prev === ch.id ? null : ch.id))
                  }
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
              placeholderTextColor={StudioColors.textMuted}
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
            const currentChapter = getChapterForLesson(
              firstNodeInRow.lesson_order,
            );
            const prevChapter =
              idx > 0
                ? getChapterForLesson(
                    rowsMap[sortedRows[idx - 1]][0].lesson_order,
                  )
                : null;
            const isFirstRowOfChapter =
              !prevChapter || prevChapter.id !== currentChapter.id;

            const chapterLessons = trackLessons.filter(
              (l) =>
                l.lesson_order >= currentChapter.minOrder &&
                l.lesson_order <= currentChapter.maxOrder,
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
                                : "🎁 +100 XP BONUS AT 4/4"}
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
                    STAGE {String(idx + 1).padStart(2, "0")}
                  </Text>
                </View>

              <View style={styles.nodesRow}>
                {rowNodes.map((node) => {
                  const isDone = Boolean(completedLessons[node.id]);
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
                              isDone && styles.statusBadgeDone,
                              isNextUp && {
                                backgroundColor: StudioColors.lime,
                              },
                            ]}
                          >
                            {isLocked ? (
                              <Text style={styles.lockIcon}>PRO</Text>
                            ) : isDone ? (
                              <Text style={styles.statusIconDone}>✓</Text>
                            ) : (
                              <Text style={styles.statusNumberText}>
                                {String(node.lesson_order).padStart(2, "0")}
                              </Text>
                            )}
                          </View>

                          <Text style={styles.nodeCategory} numberOfLines={1}>
                            {node.category || `MODULE ${node.lesson_order}`}
                          </Text>
                        </View>

                        {isFreePreview ? (
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

const styles = StyleSheet.create({
  rootWrap: {
    flex: 1,
    position: "relative",
  },
  topScrollRailBg: {
    height: 3,
    width: "100%",
    backgroundColor: StudioColors.borderSubtle,
    zIndex: 20,
  },
  topScrollRailFill: {
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    position: "relative",
  },
  content: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingBottom: 72,
    position: "relative",
  },
  headerSection: {
    width: "100%",
    maxWidth: 780,
    marginBottom: 28,
    zIndex: 2,
  },
  editorialTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 22,
  },
  editorialLeft: {
    flex: 1,
    minWidth: 280,
    alignItems: "flex-start",
    gap: 8,
  },
  heroIllustrationWrap: {
    position: "relative",
    width: 248,
    alignItems: "center",
    paddingTop: 14,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  crtCartridge: {
    width: 136,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: StudioColors.ink,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  crtCartridgeGrip: {
    width: 22,
    height: 6,
    borderRadius: 2,
    backgroundColor: StudioColors.ink,
    opacity: 0.35,
  },
  crtCartridgeText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  crtMonitorFrame: {
    width: "100%",
    backgroundColor: StudioColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    padding: 10,
    ...HardShadow,
  },
  crtScreen: {
    backgroundColor: "#121216",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    padding: 10,
    gap: 6,
  },
  crtScreenTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2E3B",
    paddingBottom: 4,
  },
  crtScreenTag: {
    color: "#8E8B82",
    fontSize: 8.5,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  crtScreenFps: {
    color: StudioColors.lime,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  crtCodeBlock: {
    gap: 2,
    paddingVertical: 2,
  },
  crtCodeLineLime: {
    color: StudioColors.lime,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  crtCodeLineYellow: {
    color: StudioColors.yellow,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  crtCodeLinePink: {
    color: StudioColors.pink,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  crtCodeLineViolet: {
    color: StudioColors.violet,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  crtMonitorChin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 7,
    paddingHorizontal: 2,
  },
  crtPowerLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  crtMonitorBrand: {
    color: StudioColors.textPrimary,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  crtVentSlots: {
    flexDirection: "row",
    gap: 3,
  },
  crtVentSlot: {
    width: 4,
    height: 9,
    borderRadius: 1,
    backgroundColor: StudioColors.border,
  },
  heroArtStickerTopLeft: {
    position: "absolute",
    top: 4,
    left: -10,
    backgroundColor: StudioColors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    transform: [{ rotate: "-8deg" }],
    ...HardShadowSm,
  },
  heroArtStickerBottomRight: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: StudioColors.lime,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    transform: [{ rotate: "6deg" }],
    ...HardShadowSm,
  },
  heroArtStickerText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  eyebrowSticker: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  eyebrow: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    fontFamily: MonoFont,
  },
  mainHeading: {
    color: StudioColors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subHeading: {
    color: StudioColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    maxWidth: 560,
  },
  trackSwitcherSection: {
    gap: 8,
    marginBottom: 18,
  },
  trackSectionKicker: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1.1,
  },
  trackTabsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  trackCardAnimWrap: {
    flex: 1,
    minWidth: 220,
  },
  trackPathCard: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 13,
    gap: 7,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackPathCardActive: {
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    ...HardShadow,
  },
  trackPathCardHover: {
    ...HardShadow,
  },
  trackPathTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  trackEmojiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  trackEmojiText: {
    fontSize: 12,
  },
  trackTagMini: {
    color: StudioColors.ink,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  trackPathTitle: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  trackPathHook: {
    color: StudioColors.textSecondary,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "600",
  },
  trackPathMeterBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
    marginTop: 2,
  },
  trackPathMeterFill: {
    height: "100%",
  },
  trackTabPillLocked: {
    opacity: 0.92,
  },
  trackCountBadge: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackCountText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  trackProBadge: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackProBadgeText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  overviewCard: {
    width: "100%",
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    overflow: "hidden",
    ...HardShadow,
  },
  progressSection: {
    padding: 18,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressTitleGroup: {
    gap: 2,
  },
  progressLabel: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  progressSubtext: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  progressPercentText: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: StudioColors.bg,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRightWidth: 1.5,
    borderRightColor: StudioColors.ink,
  },
  upNextBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: StudioColors.surfaceElevated,
    borderTopWidth: 2,
    borderTopColor: StudioColors.border,
    gap: 14,
    flexWrap: "wrap",
  },
  upNextLeft: {
    flex: 1,
    minWidth: 200,
    gap: 4,
  },
  upNextMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  upNextSticker: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  upNextTag: {
    color: StudioColors.lime,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.9,
  },
  upNextXpPill: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 4,
  },
  upNextXpPillText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  upNextTitle: {
    color: StudioColors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  upNextDesc: {
    color: StudioColors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  upNextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: StudioColors.lime,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    justifyContent: "center",
    ...HardShadowHero,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  upNextButtonText: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  upNextArrowCapsule: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  upNextArrowCapsuleText: {
    color: StudioColors.lime,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  treeCanvas: {
    alignItems: "center",
    width: "100%",
  },
  treeLegendBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 6,
    ...HardShadowSm,
  },
  treeLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  treeLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  treeLegendText: {
    color: StudioColors.textSecondary,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  rowWrapper: {
    alignItems: "center",
    width: "100%",
  },
  tierLabelWrapper: {
    marginBottom: 8,
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tierLabelText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    fontFamily: MonoFont,
  },
  nodesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: CARD_GAP,
    flexWrap: "wrap",
  },
  nodeCard: {
    width: CARD_WIDTH,
    maxWidth: "100%",
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    padding: 16,
    paddingTop: 19,
    borderWidth: 2,
    borderColor: StudioColors.border,
    gap: 10,
    position: "relative",
    overflow: "hidden",
    ...HardShadow,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  nodeCardHovered: {
    borderWidth: 2.5,
    ...HardShadowHero,
  },
  nodeTopRibbon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 7,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.border,
  },
  nodeCardDone: {
    backgroundColor: StudioColors.cardDoneBg,
  },
  nodeCardNextUp: {
    borderWidth: 2.5,
    borderColor: StudioColors.border,
    ...HardShadowHero,
  },
  nodeCardLocked: {
    opacity: 0.72,
    backgroundColor: StudioColors.cardLockedBg,
  },
  nodeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 2,
  },
  nodeBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeDone: {
    backgroundColor: StudioColors.mint,
  },
  statusNumberText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  lockIcon: {
    color: StudioColors.ink,
    fontSize: 8,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  statusIconDone: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  nodeCategory: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: MonoFont,
    flex: 1,
  },
  nextUpNodePill: {
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 5,
    ...HardShadowSm,
  },
  nextUpNodePillText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    fontFamily: MonoFont,
  },
  proNodePill: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proNodePillText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    fontFamily: MonoFont,
  },
  arrowBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  nodeTitle: {
    color: StudioColors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  nodeDesc: {
    color: StudioColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
  },
  nodeFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    flexWrap: "wrap",
  },
  metaPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  metaPillText: {
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    textTransform: "uppercase",
  },
  complexityMiniPill: {
    backgroundColor: StudioColors.surfaceElevated,
    borderColor: StudioColors.border,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  complexityMiniText: {
    color: StudioColors.textPrimary,
    fontSize: 9,
    fontFamily: MonoFont,
    fontWeight: "800",
  },
  xpMiniBadge: {
    marginLeft: "auto",
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  xpMiniLabel: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  connectorContainer: {
    alignItems: "center",
    marginVertical: 3,
  },
  vLine: {
    width: 5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 2,
  },
  hLine: {
    height: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 2,
  },
  junctionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  connectorArrowTip: {
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 12,
    marginTop: -2,
  },
  legsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legCol: {
    alignItems: "center",
  },
  filterToolbarCard: {
    marginTop: 14,
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 12,
    gap: 10,
    ...HardShadowSm,
  },
  filterPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  filterPill: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  filterPillActive: {
    borderColor: StudioColors.ink,
  },
  filterPillText: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  filterPillTextActive: {
    color: StudioColors.ink,
  },
  filterDivider: {
    width: 1.5,
    height: 18,
    backgroundColor: StudioColors.borderSubtle,
    marginHorizontal: 2,
  },
  searchBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchIconText: {
    color: StudioColors.textSecondary,
    fontSize: 14,
    fontWeight: "900",
  },
  searchInput: {
    flex: 1,
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 2,
    ...Platform.select({
      web: { outlineStyle: "none" as any },
    }),
  },
  clearFiltersBtn: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  clearFiltersText: {
    color: StudioColors.textPrimary,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  chapterBannerCard: {
    width: "100%",
    maxWidth: 590,
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 16,
    paddingTop: 20,
    marginTop: 14,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
    ...HardShadow,
  },
  chapterBannerCardCleared: {
    backgroundColor: StudioColors.cardDoneBg,
  },
  chapterTopAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 7,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.ink,
  },
  chapterBannerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  chapterBannerLeft: {
    flex: 1,
    minWidth: 220,
    gap: 3,
  },
  chapterRomanRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  chapterRomanPill: {
    alignSelf: "flex-start",
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chapterBonusTagPill: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  chapterBonusTagText: {
    color: StudioColors.textPrimary,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  chapterSegmentsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    maxWidth: 200,
  },
  chapterSegmentBlock: {
    flex: 1,
    height: 7,
    borderRadius: 3,
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
  },
  chapterRightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },
  chapterCertBtn: {
    backgroundColor: StudioColors.violet,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  chapterCertBtnText: {
    color: StudioColors.ink,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  claimChapterBonusBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    ...HardShadowSm,
  },
  claimChapterBonusText: {
    color: StudioColors.ink,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  chapterRomanText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  chapterBannerTitle: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  chapterBannerSubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  chapterProgressBadge: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  chapterProgressBadgeText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  emptyFilterCard: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 28,
    alignItems: "center",
    gap: 8,
    maxWidth: 460,
    ...HardShadowSm,
  },
  emptyFilterTitle: {
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyFilterSubtext: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  resetFilterCtaBtn: {
    marginTop: 6,
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  resetFilterCtaText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  showcaseFooterWrap: {
    marginTop: 28,
    alignItems: "center",
    zIndex: 2,
  },
  showcaseFooterBtn: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  showcaseFooterText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  onboardingBannerCard: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    gap: 8,
    ...HardShadow,
  },
  onboardingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  onboardingBadge: {
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  onboardingBadgeText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  onboardingDismissBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  onboardingDismissText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
  },
  onboardingTitle: {
    color: StudioColors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  onboardingSubtext: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  onboardingActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  onboardingPrimaryBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  onboardingPrimaryBtnText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  onboardingSecondaryBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  onboardingSecondaryBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  trackBadgesRightRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  trackCertPillBtn: {
    backgroundColor: StudioColors.violet,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackCertPillText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
});
