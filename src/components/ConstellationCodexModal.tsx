import React, { useMemo, useState, useSyncExternalStore } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { mergeCurriculumLessons } from "../constants/curriculum";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import type { Lesson } from "../types/lesson";
import {
  type CodexFilterTab,
  CONSTELLATION_CODEX_ENTRIES,
  filterCodexEntries,
  findUnlockLessonForEntry,
  readPinnedCodexIds,
  resolveCodexEntries,
  togglePinnedCodexId,
} from "../utils/constellationCodex";
import { playKeyClick } from "../utils/soundEffects";
import { renderHighlightedPython } from "./FormattedText";
import { StudioIcon, Text } from "./StudioIcon";

const EMPTY_SUBSCRIBE = () => () => {};
const IS_DEV_MODE = typeof __DEV__ !== "undefined" && __DEV__;

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location?.hostname || "";
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.")
  );
}

interface ConstellationCodexModalProps {
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  isStudioActive?: boolean;
  onInsertSnippet?: (snippet: string) => void;
  onJumpToLesson: (lesson: Lesson) => void;
  onClose: () => void;
}

export default function ConstellationCodexModal({
  lessons,
  completedLessons,
  isStudioActive = false,
  onInsertSnippet,
  onJumpToLesson,
  onClose,
}: ConstellationCodexModalProps) {
  const styles = useThemedStyles(createStyles);
  const { width: winWidth } = useWindowDimensions();
  const isCompact = winWidth < 840;

  const isMounted = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false,
  );
  const showDevTools = isMounted && (IS_DEV_MODE || isLocalDevHost());

  const [devUnlockAll, setDevUnlockAll] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<CodexFilterTab>("all");
  const [query, setQuery] = useState<string>("");
  const [pinnedIds, setPinnedIds] = useState<string[]>(() =>
    readPinnedCodexIds(),
  );
  const [selectedId, setSelectedId] = useState<string>(
    CONSTELLATION_CODEX_ENTRIES[0].id,
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  const effectiveLessons = useMemo(
    () => (lessons.length > 0 ? lessons : mergeCurriculumLessons([])),
    [lessons],
  );

  const allResolved = useMemo(
    () =>
      resolveCodexEntries(
        effectiveLessons,
        completedLessons,
        pinnedIds,
        devUnlockAll,
      ),
    [effectiveLessons, completedLessons, pinnedIds, devUnlockAll],
  );

  const illuminatedCount = useMemo(
    () => allResolved.filter((r) => r.unlocked).length,
    [allResolved],
  );

  const filtered = useMemo(
    () => filterCodexEntries(allResolved, activeTab, query),
    [allResolved, activeTab, query],
  );

  const selectedResolved = useMemo(() => {
    return (
      filtered.find((r) => r.entry.id === selectedId) ||
      filtered[0] ||
      allResolved.find((r) => r.entry.id === selectedId) ||
      allResolved[0]
    );
  }, [filtered, allResolved, selectedId]);

  const progressPct = Math.round(
    (illuminatedCount / CONSTELLATION_CODEX_ENTRIES.length) * 100,
  );

  async function handleCopySnippet(entryId: string, codeSnippet: string) {
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(codeSnippet);
      }
      playKeyClick();
      setCopiedId(entryId);
      setTimeout(() => {
        setCopiedId((cur) => (cur === entryId ? null : cur));
      }, 1700);
    } catch {
      setCopiedId(null);
    }
  }

  function handleInsertSnippet(entryId: string, codeSnippet: string) {
    if (!onInsertSnippet) return;
    playKeyClick();
    onInsertSnippet(codeSnippet);
    setInsertedId(entryId);
    setTimeout(() => {
      setInsertedId((cur) => (cur === entryId ? null : cur));
    }, 1700);
  }

  function handleTogglePin(entryId: string) {
    playKeyClick();
    setPinnedIds((prev) => togglePinnedCodexId(prev, entryId));
  }

  const pyCount = allResolved.filter(
    (r) => r.entry.track === "python_basics",
  ).length;
  const algoCount = allResolved.filter(
    (r) => r.entry.track === "algorithms",
  ).length;
  const sysCount = allResolved.filter(
    (r) => r.entry.track === "system_design",
  ).length;

  const tabs: { id: CodexFilterTab; label: string }[] = [
    { id: "all", label: `✦ ALL (${allResolved.length})` },
    { id: "python_basics", label: `🐍 PYTHON (${pyCount})` },
    { id: "algorithms", label: `⚡ ALGORITHMS (${algoCount})` },
    { id: "system_design", label: `🏛 ARCHITECTURE (${sysCount})` },
    { id: "pinned", label: `★ PINNED (${pinnedIds.length})` },
  ];

  const unlockTargetLesson = useMemo(() => {
    if (!selectedResolved || selectedResolved.unlocked) return null;
    return findUnlockLessonForEntry(
      selectedResolved.entry,
      effectiveLessons,
      completedLessons,
    );
  }, [selectedResolved, effectiveLessons, completedLessons]);

  return (
    <View testID="constellation-codex-modal" style={styles.modalCard}>
      {/* Top Observatory Grimoire Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleCluster}>
          <View style={styles.bookBadgeIcon}>
            <StudioIcon name="book" size={18} />
          </View>
          <View style={styles.headerTextCol}>
            <View style={styles.kickerRow}>
              <Text style={styles.kickerText}>
                ✦ ASTRAL SYNTAX & PATTERN GRIMOIRE
              </Text>
              <View style={styles.shortcutPill}>
                <Text style={styles.shortcutPillText}>⌘J</Text>
              </View>
            </View>
            <Text style={styles.modalTitle}>Constellation Field Guide</Text>
          </View>
        </View>

        <View style={styles.headerRightCluster}>
          {/* Illumination Progress Meter */}
          <View style={styles.progressBox}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabelText}>
                {illuminatedCount} / {CONSTELLATION_CODEX_ENTRIES.length}{" "}
                ILLUMINATED
              </Text>
              <Text style={styles.progressPctText}>{progressPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(6, progressPct)}%` },
                ]}
              />
            </View>
          </View>

          {showDevTools ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dev toggle unlock all codex entries"
              style={[
                styles.devBtn,
                devUnlockAll && styles.devBtnActive,
              ]}
              onPress={() => {
                playKeyClick();
                setDevUnlockAll((prev) => !prev);
              }}
            >
              <Text
                style={[
                  styles.devBtnText,
                  devUnlockAll && styles.devBtnTextActive,
                ]}
              >
                {devUnlockAll ? "⚙ ALL UNLOCKED" : "⚙ DEV UNLOCK ALL"}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close Constellation Field Guide"
            style={styles.closeBtn}
            onPress={() => {
              playKeyClick();
              onClose();
            }}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* Search & Track Filter Strip */}
      <View style={styles.controlsStrip}>
        <View style={styles.searchBoxWrap}>
          <StudioIcon name="search" size={14} />
          <TextInput
            accessibilityLabel="Search Constellation Field Guide"
            value={query}
            onChangeText={setQuery}
            placeholder="Search syntax, dict.get, sliding window, BFS, token bucket..."
            placeholderTextColor="#64748B"
            style={styles.searchInput}
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear codex search"
              onPress={() => setQuery("")}
              style={styles.clearSearchBtn}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityLabel={t.label}
                style={[styles.tabPill, active && styles.tabPillActive]}
                onPress={() => {
                  playKeyClick();
                  setActiveTab(t.id);
                }}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    active && styles.tabPillTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Body: Master List + Grimoire Detail Sheet */}
      <View style={[styles.bodySplit, isCompact && styles.bodySplitCompact]}>
        {/* Left Master List */}
        <ScrollView
          style={[styles.listPane, isCompact && styles.listPaneCompact]}
          contentContainerStyle={styles.listContent}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No matching codex cards</Text>
              <Text style={styles.emptySub}>
                {activeTab === "pinned"
                  ? "Star any unlocked pattern card with ☆ PIN CARD to save it here."
                  : "Try another keyword like 'slice', 'stack', 'heap', or 'cache'."}
              </Text>
            </View>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedResolved?.entry.id === item.entry.id;
              return (
                <Pressable
                  key={item.entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.entry.title}${item.unlocked ? "" : " (Locked)"}`}
                  style={[
                    styles.entryRowCard,
                    !item.unlocked && styles.entryRowLocked,
                    isSelected && [
                      styles.entryRowSelected,
                      { borderColor: item.unlocked ? item.entry.accent : StudioColors.yellow },
                    ],
                  ]}
                  onPress={() => {
                    playKeyClick();
                    setSelectedId(item.entry.id);
                  }}
                >
                  <View style={styles.entryTopMeta}>
                    <Text
                      style={[
                        styles.entryConstellationTag,
                        {
                          color: item.unlocked
                            ? item.entry.accent
                            : "#64748B",
                        },
                      ]}
                    >
                      {item.unlocked ? "✦" : "🔒"} {item.entry.constellationName}{" "}
                      · CH. {item.entry.chapterRoman}
                    </Text>
                    <View style={styles.entryRightBadges}>
                      {item.pinned ? (
                        <Text style={styles.pinStarMini}>★</Text>
                      ) : null}
                      <Text style={styles.entryComplexityMini}>
                        {item.entry.complexityLabel}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.entryRowTitle,
                      !item.unlocked && styles.entryRowTitleLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {item.entry.title}
                  </Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        {/* Right Detail Grimoire Sheet */}
        {selectedResolved ? (
          <ScrollView
            style={styles.detailPane}
            contentContainerStyle={styles.detailContent}
          >
            {selectedResolved.unlocked ? (
              <>
                <View style={styles.detailStampBar}>
                  <View style={styles.detailBadgeRow}>
                    <View
                      style={[
                        styles.constellationPill,
                        { backgroundColor: selectedResolved.entry.accent },
                      ]}
                    >
                      <Text style={styles.constellationPillText}>
                        ✦ {selectedResolved.entry.constellationName} ·{" "}
                        {selectedResolved.entry.badge}
                      </Text>
                    </View>
                    <View style={styles.complexityBadge}>
                      <Text style={styles.complexityBadgeText}>
                        ⚡ {selectedResolved.entry.complexityLabel}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      selectedResolved.pinned
                        ? "Unpin codex card"
                        : "Pin codex card"
                    }
                    style={[
                      styles.pinBtn,
                      selectedResolved.pinned && styles.pinBtnActive,
                    ]}
                    onPress={() => handleTogglePin(selectedResolved.entry.id)}
                  >
                    <Text
                      style={[
                        styles.pinBtnText,
                        selectedResolved.pinned && styles.pinBtnTextActive,
                      ]}
                    >
                      {selectedResolved.pinned ? "★ PINNED" : "☆ PIN CARD"}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.detailTitle}>
                  {selectedResolved.entry.title}
                </Text>
                <Text style={styles.detailSummary}>
                  {selectedResolved.entry.summary}
                </Text>

                {/* Syntax-Highlighted Code Blueprint */}
                <View style={styles.codeCard}>
                  <View style={styles.codeCardHeader}>
                    <Text style={styles.codeCardLabel}>
                      BLUEPRINT.PY · READY TO REUSE
                    </Text>
                    <View style={styles.codeActionsRow}>
                      {isStudioActive && onInsertSnippet ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Append snippet to Studio editor"
                          style={[
                            styles.codeActionBtn,
                            styles.codeInsertBtn,
                          ]}
                          onPress={() =>
                            handleInsertSnippet(
                              selectedResolved.entry.id,
                              selectedResolved.entry.codeSnippet,
                            )
                          }
                        >
                          <Text style={styles.codeInsertBtnText}>
                            {insertedId === selectedResolved.entry.id
                              ? "✓ APPENDED!"
                              : "+ APPEND TO EDITOR"}
                          </Text>
                        </Pressable>
                      ) : null}

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Copy codex Python snippet"
                        style={styles.codeActionBtn}
                        onPress={() =>
                          handleCopySnippet(
                            selectedResolved.entry.id,
                            selectedResolved.entry.codeSnippet,
                          )
                        }
                      >
                        <Text style={styles.codeActionBtnText}>
                          {copiedId === selectedResolved.entry.id
                            ? "✓ COPIED!"
                            : "📋 COPY"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.codePreScroll}
                  >
                    <Text style={styles.codePreText}>
                      {renderHighlightedPython(
                        selectedResolved.entry.codeSnippet,
                      )}
                    </Text>
                  </ScrollView>
                </View>

                {/* Key Invariant + Classic Pitfall */}
                <View style={styles.insightsGrid}>
                  <View style={[styles.insightBox, styles.invariantBox]}>
                    <Text style={styles.invariantLabel}>
                      ⚡ KEY INVARIANT
                    </Text>
                    <Text style={styles.insightBody}>
                      {selectedResolved.entry.keyInvariant}
                    </Text>
                  </View>

                  <View style={[styles.insightBox, styles.pitfallBox]}>
                    <Text style={styles.pitfallLabel}>
                      ⚠ CLASSIC PITFALL
                    </Text>
                    <Text style={styles.insightBody}>
                      {selectedResolved.entry.pitfallWarning}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              /* Locked Mystery Constellation State */
              <View style={styles.lockedSheet}>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>
                    🔒 UNILLUMINATED CONSTELLATION ·{" "}
                    {selectedResolved.entry.constellationName} (CH.{" "}
                    {selectedResolved.entry.chapterRoman})
                  </Text>
                </View>

                <Text style={styles.lockedTitle}>
                  {selectedResolved.entry.title}
                </Text>

                <Text style={styles.lockedDesc}>
                  Solve at least 1 lesson inside{" "}
                  <Text style={styles.lockedHighlight}>
                    {selectedResolved.chapterTitle}
                  </Text>{" "}
                  to permanently illuminate this syntax blueprint, key
                  invariant, and pitfall checklist in your Field Guide!
                </Text>

                <View style={styles.redactedCodeBox}>
                  <Text style={styles.redactedCodeLine}>
                    # ✦ {selectedResolved.entry.constellationName} GRIMOIRE
                    ENCRYPTED ✦
                  </Text>
                  <Text style={styles.redactedCodeLine}>
                    def ████████████(██████, █████):
                  </Text>
                  <Text style={styles.redactedCodeLine}>
                    {"    "}# Complexity:{" "}
                    {selectedResolved.entry.complexityLabel}
                  </Text>
                  <Text style={styles.redactedCodeLine}>
                    {"    "}return ██████████████████
                  </Text>
                </View>

                {unlockTargetLesson ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Jump to lesson ${unlockTargetLesson.title}`}
                    style={({ pressed }) => [
                      styles.jumpUnlockBtn,
                      pressed && { transform: [{ translateY: 1 }] },
                    ]}
                    onPress={() => {
                      playKeyClick();
                      onJumpToLesson(unlockTargetLesson);
                      onClose();
                    }}
                  >
                    <Text style={styles.jumpUnlockBtnText}>
                      🚀 SOLVE &ldquo;{unlockTargetLesson.title}&rdquo; TO
                      ILLUMINATE →
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    modalCard: {
      width: "95%",
      maxWidth: 980,
      maxHeight: "90%",
      backgroundColor: StudioColors.surface,
      borderRadius: 16,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      overflow: "hidden",
      ...HardShadowHero,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.borderSubtle,
      backgroundColor: StudioColors.bg,
    },
    headerTitleCluster: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    bookBadgeIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      backgroundColor: StudioColors.yellow,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    headerTextCol: {
      gap: 2,
    },
    kickerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    kickerText: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    shortcutPill: {
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: StudioColors.border,
      backgroundColor: StudioColors.surface,
    },
    shortcutPillText: {
      color: StudioColors.textPrimary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    modalTitle: {
      color: StudioColors.textPrimary,
      fontSize: 19,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    headerRightCluster: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
    },
    progressBox: {
      minWidth: 165,
      gap: 4,
    },
    progressLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    progressLabelText: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    progressPctText: {
      color: StudioColors.mint,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    progressTrack: {
      height: 7,
      borderRadius: 4,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: StudioColors.mint,
    },
    devBtn: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.lime,
      backgroundColor: StudioColors.surface,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    devBtnActive: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    devBtnText: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    devBtnTextActive: {
      color: StudioColors.ink,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.border,
      backgroundColor: StudioColors.surface,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    closeBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    controlsStrip: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      gap: 9,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.borderSubtle,
      backgroundColor: StudioColors.surface,
    },
    searchBoxWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      backgroundColor: StudioColors.bg,
    },
    searchInput: {
      flex: 1,
      color: StudioColors.textPrimary,
      fontSize: 12.5,
      fontFamily: MonoFont,
      fontWeight: "700",
      paddingVertical: 2,
      ...Platform.select({ web: { outlineStyle: "none" as any } }),
    },
    clearSearchBtn: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    clearSearchText: {
      color: StudioColors.textMuted,
      fontSize: 11,
      fontWeight: "900",
    },
    tabsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    tabPill: {
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      backgroundColor: StudioColors.bg,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    tabPillActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    tabPillText: {
      color: StudioColors.textSecondary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    tabPillTextActive: {
      color: StudioColors.ink,
    },
    bodySplit: {
      flex: 1,
      minHeight: 420,
      maxHeight: 540,
      flexDirection: "row",
    },
    bodySplitCompact: {
      flexDirection: "column",
      maxHeight: 620,
    },
    listPane: {
      width: 315,
      maxWidth: 315,
      borderRightWidth: 1.5,
      borderRightColor: StudioColors.borderSubtle,
      backgroundColor: StudioColors.bg,
    },
    listPaneCompact: {
      width: "100%",
      maxWidth: "100%",
      maxHeight: 195,
      borderRightWidth: 0,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.borderSubtle,
    },
    listContent: {
      padding: 11,
      gap: 7,
    },
    emptyBox: {
      padding: 18,
      alignItems: "center",
      gap: 6,
    },
    emptyTitle: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "900",
    },
    emptySub: {
      color: StudioColors.textMuted,
      fontSize: 11.5,
      textAlign: "center",
      lineHeight: 17,
    },
    entryRowCard: {
      paddingHorizontal: 11,
      paddingVertical: 9,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      backgroundColor: StudioColors.surface,
      gap: 4,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    entryRowLocked: {
      opacity: 0.68,
      backgroundColor: StudioColors.cardLockedBg,
    },
    entryRowSelected: {
      borderWidth: 2,
      opacity: 1,
      ...HardShadowSm,
    },
    entryTopMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 6,
    },
    entryConstellationTag: {
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    entryRightBadges: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    pinStarMini: {
      color: StudioColors.yellow,
      fontSize: 11,
      fontWeight: "900",
    },
    entryComplexityMini: {
      color: StudioColors.textMuted,
      fontSize: 8.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    entryRowTitle: {
      color: StudioColors.textPrimary,
      fontSize: 12.5,
      fontWeight: "800",
    },
    entryRowTitleLocked: {
      color: StudioColors.textSecondary,
    },
    detailPane: {
      flex: 1,
      backgroundColor: StudioColors.surface,
    },
    detailContent: {
      padding: 18,
      gap: 14,
    },
    detailStampBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    detailBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 7,
    },
    constellationPill: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    constellationPillText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    complexityBadge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      backgroundColor: StudioColors.codeBg,
    },
    complexityBadgeText: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    pinBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      backgroundColor: StudioColors.bg,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    pinBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    pinBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    pinBtnTextActive: {
      color: StudioColors.ink,
    },
    detailTitle: {
      color: StudioColors.textPrimary,
      fontSize: 21,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    detailSummary: {
      color: StudioColors.textSecondary,
      fontSize: 13.5,
      fontWeight: "600",
      lineHeight: 20,
    },
    codeCard: {
      borderRadius: 11,
      borderWidth: 2,
      borderColor: StudioColors.codeBorder,
      backgroundColor: "#101218",
      overflow: "hidden",
      ...HardShadow,
    },
    codeCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderBottomWidth: 1.5,
      borderBottomColor: "#232736",
      backgroundColor: "#161923",
    },
    codeCardLabel: {
      color: "#94A3B8",
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    codeActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    codeActionBtn: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: "#334155",
      backgroundColor: "#1E2330",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    codeActionBtnText: {
      color: "#F8FAFC",
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    codeInsertBtn: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    codeInsertBtnText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    codePreScroll: {
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    codePreText: {
      color: "#F4F0E6",
      fontSize: 12.5,
      lineHeight: 19.5,
      fontFamily: MonoFont,
    },
    insightsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    insightBox: {
      flex: 1,
      minWidth: 230,
      borderRadius: 10,
      borderWidth: 1.5,
      padding: 12,
      gap: 5,
    },
    invariantBox: {
      backgroundColor: StudioColors.bg,
      borderColor: StudioColors.mint,
    },
    pitfallBox: {
      backgroundColor: StudioColors.bg,
      borderColor: StudioColors.coral,
    },
    invariantLabel: {
      color: StudioColors.mint,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    pitfallLabel: {
      color: StudioColors.coral,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    insightBody: {
      color: StudioColors.textPrimary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    lockedSheet: {
      padding: 20,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: StudioColors.borderSubtle,
      backgroundColor: StudioColors.bg,
      gap: 12,
    },
    lockedBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      backgroundColor: StudioColors.surface,
    },
    lockedBadgeText: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    lockedTitle: {
      color: StudioColors.textPrimary,
      fontSize: 20,
      fontWeight: "900",
    },
    lockedDesc: {
      color: StudioColors.textSecondary,
      fontSize: 13.5,
      lineHeight: 20,
      fontWeight: "600",
    },
    lockedHighlight: {
      color: StudioColors.yellow,
      fontWeight: "900",
    },
    redactedCodeBox: {
      padding: 14,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: "#232736",
      backgroundColor: "#101218",
      gap: 4,
    },
    redactedCodeLine: {
      color: "#475569",
      fontSize: 12,
      fontFamily: MonoFont,
    },
    jumpUnlockBtn: {
      alignSelf: "flex-start",
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      backgroundColor: StudioColors.yellow,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    jumpUnlockBtnText: {
      color: StudioColors.ink,
      fontSize: 11.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
  });
