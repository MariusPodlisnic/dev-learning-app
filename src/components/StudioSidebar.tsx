import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
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
        <Pressable
          style={styles.backToMapBtn}
          onPress={() => {
            onCloseMobileDrawer();
            onBackToMap();
          }}
        >
          <Text style={styles.backToMapText}>← BACK TO SKILL MAP</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>SWITCH TRACK</Text>
        {(["python_basics", "algorithms", "system_design"] as const).map(
          (tKey) => {
            const meta = TrackThemes[tKey];
            const isSelected = activeTrack === tKey;
            const isTrackLocked = meta.isPro && !isPremium;
            return (
              <Pressable
                key={tKey}
                style={[
                  styles.trackTab,
                  isSelected && [
                    styles.activeTrackTab,
                    { backgroundColor: meta.stickerBg },
                  ],
                ]}
                onPress={() => onSwitchTrack(tKey)}
              >
                <View style={styles.trackTabInnerRow}>
                  <Text
                    style={[
                      styles.trackTabText,
                      isSelected && {
                        color: StudioColors.ink,
                        fontWeight: "900",
                      },
                    ]}
                  >
                    [{meta.icon}] {meta.label}
                  </Text>
                  {isTrackLocked && (
                    <View style={styles.sidebarProPill}>
                      <Text style={styles.sidebarProText}>PRO · 1 FREE</Text>
                    </View>
                  )}
                </View>
              </Pressable>
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

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>MODULES</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator
              color={StudioColors.textPrimary}
              style={{ marginTop: 12 }}
            />
          ) : (
            currentLessons.map((lesson, idx) => {
              const isCompleted = completedLessons[lesson.id];
              const isLocked = isLessonLockedForUser(lesson, isPremium);
              const isFreeProPreview =
                isProTrackPreviewLesson(lesson) && !isPremium;
              const isActive = selectedLesson?.id === lesson.id;
              return (
                <Pressable
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    isActive && [
                      styles.activeLessonCard,
                      { backgroundColor: currentTrackTheme.stickerBg },
                    ],
                  ]}
                  onPress={() => onSelectLesson(lesson)}
                >
                  <View style={styles.lessonCardLeft}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && styles.stepCircleCompleted,
                        isActive && {
                          backgroundColor: "#111111",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepCircleText,
                          isActive && { color: "#FFFFFF" },
                        ]}
                      >
                        {isLocked
                          ? "L"
                          : isCompleted
                            ? "✓"
                            : String(idx + 1).padStart(2, "0")}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.lessonTitle,
                        isActive && styles.activeLessonTitle,
                      ]}
                      numberOfLines={2}
                    >
                      {lesson.title}
                    </Text>
                    {isFreeProPreview && (
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
                </Pressable>
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
      width: 268,
      borderRightWidth: 2,
      borderRightColor: StudioColors.border,
      backgroundColor: StudioColors.surface,
      padding: 16,
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
      width: 280,
      maxWidth: "84%",
      backgroundColor: StudioColors.surface,
      borderRightWidth: 2,
      borderRightColor: StudioColors.border,
      padding: 16,
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
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      marginBottom: 18,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer" } }),
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
      padding: 10,
      borderRadius: 6,
      backgroundColor: StudioColors.bg,
      marginBottom: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    trackTabInnerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    activeTrackTab: {
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    trackTabText: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
    progressCard: {
      backgroundColor: StudioColors.bg,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      marginTop: 10,
      ...HardShadowSm,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
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
    lessonCard: {
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor: StudioColors.surface,
      marginBottom: 5,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: "transparent",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    activeLessonCard: {
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    lessonCardLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    stepCircle: {
      width: 24,
      height: 24,
      borderRadius: 5,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    stepCircleCompleted: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
    },
    stepCircleText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    lessonTitle: {
      color: StudioColors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
      flex: 1,
    },
    activeLessonTitle: { color: StudioColors.ink, fontWeight: "900" },
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
