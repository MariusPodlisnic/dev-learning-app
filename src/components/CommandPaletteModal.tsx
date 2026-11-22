import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import type { Lesson } from "../types/lesson";
import {
  buildCommandPaletteItems,
  type CommandAction,
  type CommandGroupId,
  type CommandPaletteItem,
  filterCommandPaletteItems,
} from "../utils/commandPalette";
import { getLofiRadioState, subscribeLofiRadio } from "../utils/lofiRadio";
import {
  formatPomodoroClock,
  getPomodoroState,
  subscribePomodoro,
} from "../utils/pomodoroTimer";
import { playKeyClick } from "../utils/soundEffects";
import { StudioIcon, Text } from "./StudioIcon";

interface CommandPaletteModalProps {
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  isPremium: boolean;
  onExecuteAction: (action: CommandAction) => void;
  onClose: () => void;
}

type FilterGroup = "ALL" | CommandGroupId;

const FILTER_GROUPS: readonly { id: FilterGroup; label: string }[] = [
  { id: "ALL", label: "ALL" },
  { id: "NAVIGATION", label: "NAV" },
  { id: "ARCADE", label: "ARCADE" },
  { id: "AUDIO & FOCUS", label: "STUDIO" },
  { id: "LESSONS", label: "LESSONS" },
] as const;

export default function CommandPaletteModal({
  lessons,
  completedLessons,
  isPremium,
  onExecuteAction,
  onClose,
}: CommandPaletteModalProps) {
  const { themeMode, paletteId, colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [query, setQuery] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<FilterGroup>("ALL");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [lofiPlaying, setLofiPlaying] = useState<boolean>(
    () => getLofiRadioState().isPlaying,
  );
  const [pomodoroState, setPomodoroState] = useState(() => getPomodoroState());

  useEffect(() => {
    const unsubLofi = subscribeLofiRadio((s) => setLofiPlaying(s.isPlaying));
    const unsubPomo = subscribePomodoro(setPomodoroState);
    return () => {
      unsubLofi();
      unsubPomo();
    };
  }, []);

  const allItems = useMemo(
    () =>
      buildCommandPaletteItems({
        lessons,
        completedLessons,
        isPremium,
        themeMode,
        activePaletteId: paletteId,
        lofiPlaying,
        pomodoroRunning: pomodoroState.isRunning,
        pomodoroClockLabel: formatPomodoroClock(pomodoroState.remainingSeconds),
      }),
    [
      completedLessons,
      isPremium,
      lessons,
      lofiPlaying,
      paletteId,
      pomodoroState.isRunning,
      pomodoroState.remainingSeconds,
      themeMode,
    ],
  );

  const results = useMemo(() => {
    const scoped =
      groupFilter === "ALL"
        ? allItems
        : allItems.filter((item) => item.group === groupFilter);

    if (!query.trim() && groupFilter !== "ALL") {
      return scoped.slice(0, 18);
    }
    return filterCommandPaletteItems(scoped, query, 18);
  }, [allItems, groupFilter, query]);

  const safeActiveIndex =
    results.length > 0 ? Math.min(activeIndex, results.length - 1) : 0;

  function handleSelectItem(item: CommandPaletteItem) {
    playKeyClick();
    onClose();
    onExecuteAction(item.action);
  }

  function handleKeyDown(e: any) {
    const key = e?.nativeEvent?.key || e?.key;
    if (key === "Escape") {
      e?.preventDefault?.();
      onClose();
      return;
    }
    if (key === "ArrowDown") {
      e?.preventDefault?.();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
      return;
    }
    if (key === "ArrowUp") {
      e?.preventDefault?.();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
      return;
    }
    if (key === "Enter") {
      const target = results[safeActiveIndex];
      if (target) {
        e?.preventDefault?.();
        handleSelectItem(target);
      }
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRibbon} />

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchIconBox}>
          <StudioIcon name="search" size={16} />
        </View>
        <TextInput
          accessibilityLabel="Quick command palette search"
          value={query}
          onChangeText={(next) => {
            setQuery(next);
            setActiveIndex(0);
          }}
          onKeyPress={handleKeyDown}
          placeholder="Jump to a lesson, Arcade game, Lo-Fi, or theme..."
          placeholderTextColor={colors.textMuted}
          autoFocus={Platform.OS === "web"}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear command search"
            style={styles.clearBtn}
            onPress={() => {
              playKeyClick();
              setQuery("");
              setActiveIndex(0);
            }}
          >
            <Text style={styles.clearBtnText}>CLEAR</Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close command palette"
          style={styles.closeBtn}
          onPress={() => {
            playKeyClick();
            onClose();
          }}
        >
          <Text style={styles.closeBtnText}>ESC</Text>
        </Pressable>
      </View>

      {/* Group Filter Pills */}
      <View style={styles.filterRow} accessibilityRole="tablist">
        {FILTER_GROUPS.map((tab) => {
          const active = groupFilter === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.filterPill,
                active && styles.filterPillActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                setGroupFilter(tab.id);
                setActiveIndex(0);
              }}
            >
              <Text
                style={[
                  styles.filterPillText,
                  active && styles.filterPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Results List */}
      <ScrollView
        style={styles.resultsScroll}
        contentContainerStyle={styles.resultsContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {results.length === 0 ? (
          <View style={styles.emptyBox}>
            <StudioIcon name="paw" size={24} />
            <Text style={styles.emptyTitle}>
              No commands match &ldquo;{query.trim()}&rdquo;
            </Text>
            <Text style={styles.emptyHint}>
              Try &ldquo;playground&rdquo;, &ldquo;binary search&rdquo;,
              &ldquo;rain&rdquo;, &ldquo;pomodoro&rdquo;, or &ldquo;sakura&rdquo;.
            </Text>
          </View>
        ) : (
          results.map((item, idx) => {
            const isHighlighted = idx === safeActiveIndex;
            const prevGroup = idx > 0 ? results[idx - 1].group : null;
            const showGroupHeader = item.group !== prevGroup;

            return (
              <View key={item.id}>
                {showGroupHeader && (
                  <Text style={styles.groupHeading}>{item.group}</Text>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Run command: ${item.title}`}
                  style={({ pressed }) => [
                    styles.itemRow,
                    isHighlighted && styles.itemRowActive,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => handleSelectItem(item)}
                  onHoverIn={() => setActiveIndex(idx)}
                >
                  <View
                    style={[
                      styles.itemIconBox,
                      isHighlighted && styles.itemIconBoxActive,
                    ]}
                  >
                    <StudioIcon name={item.icon} size={16} />
                  </View>

                  <View style={styles.itemTextCol}>
                    <Text
                      style={[
                        styles.itemTitle,
                        isHighlighted && styles.itemTitleActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.itemSubtitle,
                        isHighlighted && styles.itemSubtitleActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.subtitle}
                    </Text>
                  </View>

                  {item.badge ? (
                    <View
                      style={[
                        styles.itemBadge,
                        isHighlighted && styles.itemBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemBadgeText,
                          isHighlighted && styles.itemBadgeTextActive,
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Keyboard Hints Footer */}
      <View style={styles.footerBar}>
        <Text style={styles.footerText}>
          ↑↓ NAVIGATE · ↵ SELECT · ESC CLOSE · ⌘K / CTRL+K
        </Text>
        <Text style={styles.footerCount}>
          {results.length} {results.length === 1 ? "RESULT" : "RESULTS"}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    card: {
      width: "100%",
      maxWidth: 640,
      maxHeight: "82%",
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: "hidden",
      ...HardShadow,
    },
    topRibbon: {
      height: 5,
      backgroundColor: StudioColors.yellow,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.ink,
    },
    searchHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.surfaceElevated,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.border,
    },
    searchIconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
      paddingVertical: 6,
      ...Platform.select({ web: { outlineStyle: "none" } as any }),
    },
    clearBtn: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    clearBtnText: {
      color: colors.textSecondary,
      fontSize: 9,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    closeBtn: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    closeBtnText: {
      color: colors.textPrimary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    filterPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 7,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.border,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    filterPillActive: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
    },
    filterPillText: {
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    filterPillTextActive: {
      color: StudioColors.ink,
    },
    resultsScroll: {
      maxHeight: 380,
    },
    resultsContent: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 4,
    },
    groupHeading: {
      color: colors.textMuted,
      fontSize: 9,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
      marginTop: 6,
      marginBottom: 4,
      paddingHorizontal: 6,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: "transparent",
      backgroundColor: "transparent",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    itemRowActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    itemIconBox: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    itemIconBoxActive: {
      backgroundColor: "#FFFFFF",
      borderColor: StudioColors.ink,
    },
    itemTextCol: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    itemTitle: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 16,
      includeFontPadding: false,
      fontWeight: "800",
    },
    itemTitleActive: {
      color: StudioColors.ink,
    },
    itemSubtitle: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "600",
    },
    itemSubtitleActive: {
      color: "#222222",
    },
    itemBadge: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    itemBadgeActive: {
      backgroundColor: StudioColors.ink,
      borderColor: StudioColors.ink,
    },
    itemBadgeText: {
      color: colors.textSecondary,
      fontSize: 9,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    itemBadgeTextActive: {
      color: StudioColors.yellow,
    },
    emptyBox: {
      alignItems: "center",
      paddingVertical: 30,
      paddingHorizontal: 20,
      gap: 8,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    emptyHint: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
    },
    footerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.surfaceElevated,
      borderTopWidth: 1.5,
      borderTopColor: colors.border,
    },
    footerText: {
      color: colors.textMuted,
      fontSize: 9,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    footerCount: {
      color: colors.textSecondary,
      fontSize: 9,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
  });
