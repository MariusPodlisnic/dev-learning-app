import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MonoFont, StudioColors, TrackThemes } from "../constants/theme";

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
}

const TRACK_KEYS = ["python_basics", "algorithms", "system_design"] as const;

const CARD_WIDTH = 276;
const CARD_GAP = 28;
const BRANCH_SPAN = CARD_WIDTH + CARD_GAP;

function getDifficultyColor(difficulty?: string) {
  const norm = (difficulty || "").toLowerCase();
  if (norm === "easy" || norm === "beginner") {
    return {
      text: StudioColors.emeraldLight,
      bg: StudioColors.emeraldSoft,
      border: StudioColors.emeraldBorder,
    };
  }
  if (norm === "hard" || norm === "advanced") {
    return {
      text: "#F87171",
      bg: StudioColors.roseSoft,
      border: StudioColors.roseBorder,
    };
  }
  return {
    text: StudioColors.amber,
    bg: StudioColors.amberSoft,
    border: StudioColors.amberBorder,
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
  const lineColor = isCompleted ? accent : StudioColors.borderStrong;
  const dotBg = isCompleted ? accent : StudioColors.surfaceElevated;

  if (fromCount === 1 && toCount === 1) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: lineColor, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
        />
      </View>
    );
  }

  if (fromCount === 1 && toCount === 2) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: lineColor, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[
            styles.hLine,
            { width: BRANCH_SPAN, backgroundColor: lineColor },
          ]}
        />
        <View style={[styles.legsRow, { width: BRANCH_SPAN }]}>
          <View style={styles.legCol}>
            <View
              style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
            />
          </View>
          <View style={styles.legCol}>
            <View
              style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
            />
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
              style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
            />
            <View
              style={[
                styles.junctionDot,
                { borderColor: lineColor, backgroundColor: dotBg },
              ]}
            />
            <View
              style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
            />
          </View>
          <View style={styles.legCol}>
            <View
              style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
            />
            <View
              style={[
                styles.junctionDot,
                { borderColor: lineColor, backgroundColor: dotBg },
              ]}
            />
            <View
              style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
            />
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
            style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
          />
          <View
            style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
          />
        </View>
        <View
          style={[
            styles.hLine,
            { width: BRANCH_SPAN, backgroundColor: lineColor },
          ]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: lineColor, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
        />
      </View>
    );
  }

  return (
    <View style={styles.connectorContainer}>
      <View
        style={[styles.vLine, { height: 34, backgroundColor: lineColor }]}
      />
    </View>
  );
}

export default function RoadmapTree({
  lessons,
  completedLessons,
  isPremium,
  activeTrack,
  onSelectTrack,
  onSelectLesson,
}: RoadmapTreeProps) {
  const trackLessons = lessons.filter((l) => l.track === activeTrack);
  const completedCount = trackLessons.filter(
    (l) => completedLessons[l.id],
  ).length;
  const progressPercent = trackLessons.length
    ? Math.round((completedCount / trackLessons.length) * 100)
    : 0;

  const currentTrackMeta =
    TrackThemes[activeTrack] || TrackThemes.python_basics;

  // Determine the "Next Up" recommended lesson in the current track
  const nextUpLesson =
    trackLessons.find(
      (l) => !completedLessons[l.id] && (l.is_free || isPremium),
    ) ||
    trackLessons.find((l) => !completedLessons[l.id]) ||
    trackLessons[0];

  const rowsMap: Record<number, Lesson[]> = {};
  trackLessons.forEach((lesson) => {
    const r = lesson.tree_row || lesson.lesson_order || 1;
    if (!rowsMap[r]) rowsMap[r] = [];
    rowsMap[r].push(lesson);
  });

  const sortedRows = Object.keys(rowsMap)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Hero & Track Selector Section */}
      <View style={styles.headerSection}>
        <View style={styles.eyebrowPill}>
          <View
            style={[
              styles.eyebrowDot,
              { backgroundColor: currentTrackMeta.accent },
            ]}
          />
          <Text style={[styles.eyebrow, { color: currentTrackMeta.accent }]}>
            CURRICULUM ROADMAP
          </Text>
        </View>

        <Text style={styles.mainHeading}>Select a path to master</Text>
        <Text style={styles.subHeading}>{currentTrackMeta.subtitle}</Text>

        {/* Sleek Segmented Track Selector */}
        <View style={styles.trackTabsBar}>
          {TRACK_KEYS.map((trackKey) => {
            const meta = TrackThemes[trackKey];
            const isSelected = activeTrack === trackKey;
            const tLessons = lessons.filter((l) => l.track === trackKey);
            const tDone = tLessons.filter((l) => completedLessons[l.id]).length;

            return (
              <Pressable
                key={trackKey}
                style={[
                  styles.trackTabPill,
                  isSelected && {
                    backgroundColor: StudioColors.surfaceElevated,
                    borderColor: meta.accent,
                  },
                ]}
                onPress={() => onSelectTrack(trackKey)}
              >
                <Text style={styles.trackTabIcon}>{meta.icon}</Text>
                <Text
                  style={[
                    styles.trackTag,
                    {
                      color: isSelected ? meta.accent : StudioColors.textDim,
                    },
                  ]}
                >
                  {meta.tag}
                </Text>
                <Text
                  style={[
                    styles.trackTabTitle,
                    isSelected && { color: StudioColors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {meta.shortLabel}
                </Text>
                <View
                  style={[
                    styles.trackCountBadge,
                    isSelected && {
                      backgroundColor: meta.accentSoft,
                      borderColor: meta.accentBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.trackCountText,
                      isSelected && { color: meta.accent },
                    ]}
                  >
                    {tDone}/{tLessons.length}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Track Mastery & Up Next Banner */}
        <View style={styles.overviewCard}>
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <View style={styles.progressTitleGroup}>
                <Text style={styles.progressLabel}>
                  {currentTrackMeta.label.toUpperCase()} PROGRESS
                </Text>
                <Text style={styles.progressSubtext}>
                  {completedCount} of {trackLessons.length} modules completed
                </Text>
              </View>
              <View
                style={[
                  styles.percentBadge,
                  {
                    backgroundColor: currentTrackMeta.accentSoft,
                    borderColor: currentTrackMeta.accentBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressPercentText,
                    { color: currentTrackMeta.accent },
                  ]}
                >
                  {progressPercent}%
                </Text>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: currentTrackMeta.accent,
                  },
                ]}
              />
            </View>
          </View>

          {nextUpLesson && (
            <View style={styles.upNextBanner}>
              <View style={styles.upNextLeft}>
                <View style={styles.upNextMetaRow}>
                  <Text
                    style={[
                      styles.upNextTag,
                      { color: currentTrackMeta.accent },
                    ]}
                  >
                    {completedCount === trackLessons.length &&
                    trackLessons.length > 0
                      ? "★ TRACK COMPLETED · REVIEW"
                      : "▶ UP NEXT FOR YOU"}
                  </Text>
                  <Text style={styles.upNextXpPill}>+50 XP</Text>
                </View>
                <Text style={styles.upNextTitle} numberOfLines={1}>
                  {nextUpLesson.title}
                </Text>
                <Text style={styles.upNextDesc} numberOfLines={1}>
                  {nextUpLesson.description}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.upNextButton,
                  { backgroundColor: currentTrackMeta.accent },
                ]}
                onPress={() => onSelectLesson(nextUpLesson)}
              >
                <Text style={styles.upNextButtonText}>
                  {completedLessons[nextUpLesson.id]
                    ? "Practice ➔"
                    : "Start ➔"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Skill Tree Canvas */}
      <View style={styles.treeCanvas}>
        {sortedRows.map((rowNum, idx) => {
          const rowNodes = rowsMap[rowNum];
          const isLastRow = idx === sortedRows.length - 1;
          const nextRowNodes = !isLastRow ? rowsMap[sortedRows[idx + 1]] : [];
          const rowCleared = rowNodes.some((n) => completedLessons[n.id]);

          return (
            <View key={rowNum} style={styles.rowWrapper}>
              <View style={styles.tierLabelWrapper}>
                <Text style={styles.tierLabelText}>TIER 0{idx + 1}</Text>
              </View>

              <View style={styles.nodesRow}>
                {rowNodes.map((node) => {
                  const isDone = Boolean(completedLessons[node.id]);
                  const isLocked = !node.is_free && !isPremium;
                  const isNextUp =
                    !isDone && !isLocked && nextUpLesson?.id === node.id;
                  const diffStyle = getDifficultyColor(node.difficulty);

                  return (
                    <Pressable
                      key={node.id}
                      style={[
                        styles.nodeCard,
                        isDone && styles.nodeCardDone,
                        isNextUp && {
                          borderColor: currentTrackMeta.accent,
                          backgroundColor: StudioColors.surfaceElevated,
                        },
                        isLocked && styles.nodeCardLocked,
                      ]}
                      onPress={() => onSelectLesson(node)}
                    >
                      {/* Top Status & Category Row */}
                      <View style={styles.nodeCardHeader}>
                        <View style={styles.nodeBadgeGroup}>
                          <View
                            style={[
                              styles.statusBadge,
                              isDone && styles.statusBadgeDone,
                              isNextUp && {
                                borderColor: currentTrackMeta.accent,
                                backgroundColor: currentTrackMeta.accentSoft,
                              },
                              !isDone &&
                                !isNextUp &&
                                !isLocked && {
                                  borderColor: currentTrackMeta.accentBorder,
                                  backgroundColor: StudioColors.surface,
                                },
                            ]}
                          >
                            {isLocked ? (
                              <Text style={styles.lockIcon}>🔒</Text>
                            ) : isDone ? (
                              <Text style={styles.statusIconDone}>✓</Text>
                            ) : (
                              <View
                                style={[
                                  styles.innerDot,
                                  {
                                    backgroundColor: currentTrackMeta.accent,
                                  },
                                ]}
                              />
                            )}
                          </View>

                          <Text
                            style={[
                              styles.nodeCategory,
                              !isLocked && {
                                color: isDone
                                  ? StudioColors.emeraldLight
                                  : currentTrackMeta.accent,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {node.category || `Module ${node.lesson_order}`}
                          </Text>
                        </View>

                        {isNextUp ? (
                          <View
                            style={[
                              styles.nextUpNodePill,
                              { backgroundColor: currentTrackMeta.accent },
                            ]}
                          >
                            <Text style={styles.nextUpNodePillText}>NEXT</Text>
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
                                borderColor: StudioColors.emeraldBorder,
                                backgroundColor: StudioColors.emeraldSoft,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.arrowIcon,
                                isDone && { color: StudioColors.emeraldLight },
                              ]}
                            >
                              ↗
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Main Title & Description */}
                      <Text style={styles.nodeTitle} numberOfLines={2}>
                        {node.title}
                      </Text>

                      {node.description ? (
                        <Text style={styles.nodeDesc} numberOfLines={2}>
                          {node.description}
                        </Text>
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

                        <Text style={styles.xpMiniLabel}>
                          {isDone ? "✓ +50 XP" : "+50 XP"}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {!isLastRow && (
                <TreeConnector
                  fromCount={rowNodes.length}
                  toCount={nextRowNodes.length}
                  accent={currentTrackMeta.accent}
                  isCompleted={rowCleared}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StudioColors.bg,
  },
  content: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingBottom: 72,
  },
  headerSection: {
    width: "100%",
    maxWidth: 620,
    alignItems: "center",
    marginBottom: 32,
  },
  eyebrowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: StudioColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: StudioColors.border,
    marginBottom: 12,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  mainHeading: {
    color: StudioColors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  subHeading: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 480,
    marginBottom: 22,
  },
  trackTabsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: StudioColors.surface,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: StudioColors.border,
    gap: 8,
    marginBottom: 18,
  },
  trackTabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackTabIcon: {
    fontSize: 14,
  },
  trackTag: {
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  trackTabTitle: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  trackCountBadge: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1,
    borderColor: StudioColors.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trackCountText: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  overviewCard: {
    width: "100%",
    backgroundColor: StudioColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  progressSection: {
    padding: 16,
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
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  progressSubtext: {
    color: StudioColors.textMuted,
    fontSize: 12,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: StudioColors.bg,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  upNextBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: StudioColors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: StudioColors.border,
    gap: 14,
    flexWrap: "wrap",
  },
  upNextLeft: {
    flex: 1,
    minWidth: 200,
    gap: 3,
  },
  upNextMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  upNextTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  upNextXpPill: {
    backgroundColor: StudioColors.emeraldSoft,
    color: StudioColors.emeraldLight,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  upNextTitle: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  upNextDesc: {
    color: StudioColors.textSecondary,
    fontSize: 12,
  },
  upNextButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  upNextButtonText: {
    color: StudioColors.bg,
    fontSize: 13,
    fontWeight: "900",
  },
  treeCanvas: {
    alignItems: "center",
    width: "100%",
  },
  rowWrapper: {
    alignItems: "center",
    width: "100%",
  },
  tierLabelWrapper: {
    marginBottom: 8,
  },
  tierLabelText: {
    color: StudioColors.textDim,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
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
    backgroundColor: StudioColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    gap: 10,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  nodeCardDone: {
    borderColor: StudioColors.emeraldBorder,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  nodeCardLocked: {
    opacity: 0.62,
    borderColor: StudioColors.borderSubtle,
  },
  nodeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nodeBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeDone: {
    backgroundColor: StudioColors.emerald,
    borderColor: StudioColors.emerald,
  },
  innerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  lockIcon: {
    fontSize: 11,
  },
  statusIconDone: {
    color: StudioColors.bg,
    fontSize: 13,
    fontWeight: "900",
  },
  nodeCategory: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    flex: 1,
  },
  nextUpNodePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nextUpNodePillText: {
    color: StudioColors.bg,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  proNodePill: {
    backgroundColor: StudioColors.indigoSoft,
    borderWidth: 1,
    borderColor: StudioColors.indigoBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proNodePillText: {
    color: StudioColors.indigoLight,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  arrowBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1,
    borderColor: StudioColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  nodeTitle: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
  nodeDesc: {
    color: StudioColors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  nodeFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    flexWrap: "wrap",
  },
  metaPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  metaPillText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  complexityMiniPill: {
    backgroundColor: StudioColors.surfaceElevated,
    borderColor: StudioColors.border,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  complexityMiniText: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontFamily: MonoFont,
    fontWeight: "600",
  },
  xpMiniLabel: {
    marginLeft: "auto",
    color: StudioColors.textDim,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  connectorContainer: {
    alignItems: "center",
    marginVertical: 2,
  },
  vLine: {
    width: 2,
  },
  hLine: {
    height: 2,
  },
  junctionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  legsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legCol: {
    alignItems: "center",
  },
});
