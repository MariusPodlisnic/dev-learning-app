import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import {
  isLessonLockedForUser,
  isProTrackPreviewLesson,
  Lesson,
} from "../types/lesson";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

const TRACK_SIDEBAR_META: Record<
  "python_basics" | "algorithms" | "system_design",
  { emoji: string; hook: string }
> = {
  python_basics: {
    emoji: "🐍",
    hook: "Syntax, loops & mini-apps",
  },
  algorithms: {
    emoji: "⚡",
    hook: "Patterns, Big-O & logic",
  },
  system_design: {
    emoji: "🏗️",
    hook: "Caching, queues & scale",
  },
};

interface StudioSidebarProps {
  isCompactStudio: boolean;
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
  onBackToMap: () => void;
  activeTrack: string;
  isPremium: boolean;
  onSwitchTrack: (trackKey: string) => void;
  completedCount: number;
  currentLessons: Lesson[];
  progressPercent: number;
  loading: boolean;
  completedLessons: Record<string, boolean>;
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
}

/**
 * Shared spring-lift interactive box giving sidebar items the same
 * "comes forward when cursor hovers" feel as Skill Map cards.
 */
function SidebarInteractiveBox({
  isActive,
  zBoost = 12,
  liftY = -3,
  hoverScale = 1.028,
  marginBottom = 0,
  onPress,
  style,
  children,
}: {
  isActive?: boolean;
  zBoost?: number;
  liftY?: number;
  hoverScale?: number;
  marginBottom?: number;
  onPress: () => void;
  style?: (hovered: boolean) => StyleProp<ViewStyle>;
  children: (hovered: boolean) => React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [liftAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const targetLift = pressed ? 1 : hovered ? liftY : 0;
    const targetScale = pressed ? 0.985 : hovered ? hoverScale : 1;

    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: targetLift,
        friction: 6,
        tension: 185,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(scaleAnim, {
        toValue: targetScale,
        friction: 6,
        tension: 185,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [hovered, pressed, liftY, hoverScale, liftAnim, scaleAnim]);

  return (
    <Animated.View
      style={{
        marginBottom,
        transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
        zIndex: hovered ? zBoost : isActive ? 3 : 1,
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
        style={style ? style(hovered) : undefined}
      >
        {children(hovered)}
      </Pressable>
    </Animated.View>
  );
}

function SidebarTrackButton({
  trackKey,
  isSelected,
  isTrackLocked,
  onPress,
  styles,
}: {
  trackKey: "python_basics" | "algorithms" | "system_design";
  isSelected: boolean;
  isTrackLocked: boolean;
  onPress: () => void;
  styles: ReturnType<typeof getStyles>;
}) {
  const meta = TrackThemes[trackKey];
  const extra = TRACK_SIDEBAR_META[trackKey];

  return (
    <SidebarInteractiveBox
      isActive={isSelected}
      zBoost={15}
      liftY={-3.5}
      hoverScale={1.03}
      marginBottom={8}
      onPress={onPress}
      style={(hovered) => [
        styles.trackTab,
        isSelected && [
          styles.activeTrackTab,
          { backgroundColor: meta.stickerBg },
        ],
        hovered &&
          !isSelected && [
            styles.trackTabHovered,
            { borderColor: meta.stickerBg },
          ],
        hovered && isSelected && styles.trackTabActiveHovered,
      ]}
    >
      {(hovered) => (
        <View style={styles.trackTabInnerRow}>
          <View
            style={[
              styles.trackIconBadge,
              {
                backgroundColor: isSelected ? StudioColors.ink : meta.stickerBg,
              },
            ]}
          >
            <Text style={styles.trackIconEmoji}>{extra.emoji}</Text>
            <Text
              style={[
                styles.trackIconCode,
                isSelected && { color: meta.stickerBg },
              ]}
            >
              {meta.icon}
            </Text>
          </View>

          <View style={styles.trackTextCol}>
            <View style={styles.trackTitleRow}>
              <Text
                style={[
                  styles.trackTabText,
                  isSelected && {
                    color: StudioColors.ink,
                    fontWeight: "900",
                  },
                ]}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
              {isTrackLocked ? (
                <View style={styles.sidebarProPill}>
                  <Text style={styles.sidebarProText}>PRO</Text>
                </View>
              ) : isSelected ? (
                <View style={styles.trackActiveDot}>
                  <Text style={styles.trackActiveDotText}>ON</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.trackHookText,
                isSelected && { color: "rgba(17, 17, 17, 0.78)" },
              ]}
              numberOfLines={1}
            >
              {extra.hook}
            </Text>
          </View>

          <Text
            style={[
              styles.trackArrow,
              isSelected && { color: StudioColors.ink },
              hovered && !isSelected && { color: meta.stickerBg },
            ]}
          >
            →
          </Text>
        </View>
      )}
    </SidebarInteractiveBox>
  );
}

function SidebarModuleItem({
  lesson,
  index,
  isCompleted,
  isLocked,
  isFreeProPreview,
  isActive,
  accentBg,
  onPress,
  styles,
}: {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  isLocked: boolean;
  isFreeProPreview: boolean;
  isActive: boolean;
  accentBg: string;
  onPress: () => void;
  styles: ReturnType<typeof getStyles>;
}) {
  return (
    <SidebarInteractiveBox
      isActive={isActive}
      zBoost={12}
      liftY={-3}
      hoverScale={1.026}
      marginBottom={6}
      onPress={onPress}
      style={(hovered) => [
        styles.lessonCard,
        isCompleted && !isActive && styles.lessonCardCompleted,
        isActive && [
          styles.activeLessonCard,
          { backgroundColor: accentBg },
        ],
        hovered &&
          !isActive && [
            styles.lessonCardHovered,
            { borderColor: isCompleted ? StudioColors.cardDoneBorder : accentBg },
          ],
        hovered && isActive && styles.activeLessonCardHovered,
      ]}
    >
      {() => (
        <View style={styles.lessonCardLeft}>
          <View
            style={[
              styles.stepCircle,
              isCompleted && !isActive && styles.stepCircleCompleted,
              !isCompleted &&
                isActive && {
                  backgroundColor: StudioColors.ink,
                  borderColor: StudioColors.ink,
                },
              isCompleted && isActive && styles.stepCircleCompletedActive,
            ]}
          >
            <Text
              style={[
                styles.stepCircleText,
                isCompleted && !isActive && styles.stepCircleTextCompleted,
                !isCompleted && isActive && { color: accentBg },
                isCompleted && isActive && styles.stepCircleTextCompletedActive,
              ]}
            >
              {isLocked
                ? "🔒"
                : isCompleted
                  ? "✓"
                  : String(index + 1).padStart(2, "0")}
            </Text>
          </View>

          <Text
            style={[
              styles.lessonTitle,
              isCompleted && !isActive && styles.completedLessonTitle,
              isActive && styles.activeLessonTitle,
            ]}
            numberOfLines={2}
          >
            {lesson.title}
          </Text>

          {isCompleted && isActive && (
            <View style={styles.activeSolvedPill}>
              <Text style={styles.activeSolvedPillText}>SOLVED</Text>
            </View>
          )}
          {!isCompleted && isFreeProPreview && (
            <View style={styles.sidebarFreePreviewPill}>
              <Text style={styles.sidebarProText}>FREE TRY</Text>
            </View>
          )}
          {isLocked && (
            <View style={styles.sidebarProPill}>
              <Text style={styles.sidebarProText}>PRO</Text>
            </View>
          )}
        </View>
      )}
    </SidebarInteractiveBox>
  );
}

export default function StudioSidebar({
  isCompactStudio,
  sidebarCollapsed,
  mobileDrawerOpen,
  onCloseMobileDrawer,
  onBackToMap,
  activeTrack,
  isPremium,
  onSwitchTrack,
  completedCount,
  currentLessons,
  progressPercent,
  loading,
  completedLessons,
  selectedLesson,
  onSelectLesson,
}: StudioSidebarProps) {
  const styles = getStyles();
  const currentTrackTheme =
    TrackThemes[activeTrack] || TrackThemes.python_basics;

  function renderCurriculumList() {
    return (
      <>
        <SidebarInteractiveBox
          liftY={-2.5}
          hoverScale={1.02}
          marginBottom={16}
          onPress={() => {
            onCloseMobileDrawer();
            onBackToMap();
          }}
          style={(hovered) => [
            styles.backToMapBtn,
            hovered && styles.backToMapBtnHovered,
          ]}
        >
          {() => <Text style={styles.backToMapText}>← BACK TO SKILL MAP</Text>}
        </SidebarInteractiveBox>

        <Text style={styles.sectionTitle}>SWITCH TRACK</Text>
        {(["python_basics", "algorithms", "system_design"] as const).map(
          (tKey) => {
            const meta = TrackThemes[tKey];
            const isSelected = activeTrack === tKey;
            const isTrackLocked = meta.isPro && !isPremium;
            return (
              <SidebarTrackButton
                key={tKey}
                trackKey={tKey}
                isSelected={isSelected}
                isTrackLocked={isTrackLocked}
                onPress={() => onSwitchTrack(tKey)}
                styles={styles}
              />
            );
          },
        )}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {completedCount} of {currentLessons.length} Solved
            </Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
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

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>MODULES</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modulesScrollContent}
        >
          {loading ? (
            <ActivityIndicator
              color={StudioColors.textPrimary}
              style={{ marginTop: 12 }}
            />
          ) : (
            currentLessons.map((lesson, idx) => {
              const isCompleted = Boolean(completedLessons[lesson.id]);
              const isLocked = isLessonLockedForUser(lesson, isPremium);
              const isFreeProPreview =
                isProTrackPreviewLesson(lesson) && !isPremium;
              const isActive = selectedLesson?.id === lesson.id;
              return (
                <SidebarModuleItem
                  key={lesson.id}
                  lesson={lesson}
                  index={idx}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  isFreeProPreview={isFreeProPreview}
                  isActive={isActive}
                  accentBg={currentTrackTheme.stickerBg}
                  onPress={() => onSelectLesson(lesson)}
                  styles={styles}
                />
              );
            })
          )}
        </ScrollView>
      </>
    );
  }

  return (
    <>
      {!isCompactStudio && !sidebarCollapsed && (
        <View style={styles.sidebar}>{renderCurriculumList()}</View>
      )}

      {isCompactStudio && mobileDrawerOpen && (
        <View style={styles.drawerOverlay}>
          <View style={styles.mobileDrawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Curriculum Modules</Text>
              <Pressable
                style={styles.drawerCloseBtn}
                onPress={onCloseMobileDrawer}
              >
                <Text style={styles.drawerCloseText}>✕</Text>
              </Pressable>
            </View>
            {renderCurriculumList()}
          </View>
          <Pressable
            style={styles.drawerBackdrop}
            onPress={onCloseMobileDrawer}
          />
        </View>
      )}
    </>
  );
}

const getStyles = () =>
  StyleSheet.create({
    sidebar: {
      width: 280,
      borderRightWidth: 2,
      borderRightColor: StudioColors.border,
      backgroundColor: StudioColors.surface,
      padding: 14,
    },
    drawerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 250,
      flexDirection: "row",
    },
    mobileDrawer: {
      width: 292,
      maxWidth: "86%",
      backgroundColor: StudioColors.surface,
      borderRightWidth: 2,
      borderRightColor: StudioColors.border,
      padding: 14,
      zIndex: 252,
    },
    drawerBackdrop: {
      flex: 1,
      backgroundColor: "rgba(17, 17, 17, 0.55)",
      zIndex: 251,
    },
    drawerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      paddingBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
    },
    drawerTitle: {
      color: StudioColors.textPrimary,
      fontSize: 16,
      fontWeight: "900",
    },
    drawerCloseBtn: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    drawerCloseText: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "900",
    },
    backToMapBtn: {
      backgroundColor: StudioColors.bg,
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    backToMapBtnHovered: {
      backgroundColor: StudioColors.surfaceElevated,
      ...HardShadow,
    },
    backToMapText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    sectionTitle: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      marginBottom: 8,
      letterSpacing: 1.2,
      fontFamily: MonoFont,
    },
    trackTab: {
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    trackTabHovered: {
      backgroundColor: StudioColors.surfaceElevated,
      ...HardShadowSm,
    },
    activeTrackTab: {
      borderColor: StudioColors.ink,
      borderWidth: 2,
      ...HardShadowSm,
    },
    trackTabActiveHovered: {
      ...HardShadow,
    },
    trackTabInnerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
    trackIconBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    trackIconEmoji: {
      fontSize: 11,
    },
    trackIconCode: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    trackTextCol: {
      flex: 1,
      minWidth: 0,
    },
    trackTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    trackTabText: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      flexShrink: 1,
    },
    trackHookText: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "600",
      marginTop: 1,
    },
    trackActiveDot: {
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 3,
    },
    trackActiveDotText: {
      color: StudioColors.lime,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    trackArrow: {
      color: StudioColors.textMuted,
      fontSize: 13,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    progressCard: {
      backgroundColor: StudioColors.bg,
      padding: 11,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      marginTop: 6,
      ...HardShadowSm,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 7,
    },
    progressTitle: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "800",
    },
    progressPercent: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    progressBarTrack: {
      height: 8,
      backgroundColor: StudioColors.surface,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: StudioColors.mint,
      borderRightWidth: 1.5,
      borderRightColor: StudioColors.ink,
    },
    modulesScrollContent: {
      paddingTop: 5,
      paddingBottom: 16,
      paddingHorizontal: 5,
    },
    lessonCard: {
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 7,
      backgroundColor: StudioColors.bg,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    lessonCardCompleted: {
      backgroundColor: StudioColors.cardDoneBg,
      borderColor: StudioColors.cardDoneBorder,
    },
    lessonCardHovered: {
      backgroundColor: StudioColors.surfaceElevated,
      ...HardShadowSm,
    },
    activeLessonCard: {
      borderColor: StudioColors.ink,
      borderWidth: 2,
      ...HardShadowSm,
    },
    activeLessonCardHovered: {
      ...HardShadow,
    },
    lessonCardLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      flex: 1,
    },
    stepCircle: {
      width: 25,
      height: 25,
      borderRadius: 6,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    stepCircleCompleted: {
      backgroundColor: StudioColors.emeraldLight,
      borderColor: StudioColors.ink,
    },
    stepCircleCompletedActive: {
      backgroundColor: "#059669",
      borderColor: StudioColors.ink,
      borderWidth: 1.5,
    },
    stepCircleText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stepCircleTextCompleted: {
      color: StudioColors.ink,
      fontSize: 12,
    },
    stepCircleTextCompletedActive: {
      color: "#FFFFFF",
      fontSize: 12,
    },
    lessonTitle: {
      color: StudioColors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
      flex: 1,
    },
    completedLessonTitle: {
      color: StudioColors.textPrimary,
    },
    activeLessonTitle: {
      color: StudioColors.ink,
      fontWeight: "900",
    },
    activeSolvedPill: {
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: StudioColors.ink,
    },
    activeSolvedPillText: {
      color: StudioColors.mint,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    sidebarProPill: {
      backgroundColor: StudioColors.pink,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 3,
    },
    sidebarFreePreviewPill: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 3,
    },
    sidebarProText: {
      color: StudioColors.ink,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
  });
