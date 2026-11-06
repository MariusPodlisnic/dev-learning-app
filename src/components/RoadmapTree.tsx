import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  SerifFont,
  StudioColors,
  TrackThemes,
} from "../constants/theme";

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
  const lineColor = "#111111";
  const dotBg = isCompleted ? "#B8FF3B" : "#FFFFFF";

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
        </View>

        {/* Tactile Color-Blocked Track Selector */}
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
                  isSelected && [
                    styles.trackTabPillActive,
                    {
                      backgroundColor: meta.stickerBg,
                    },
                  ],
                ]}
                onPress={() => onSelectTrack(trackKey)}
              >
                <View
                  style={[
                    styles.trackCodeBadge,
                    isSelected && {
                      backgroundColor: "#111111",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.trackCodeText,
                      isSelected && { color: meta.stickerBg },
                    ]}
                  >
                    {meta.tag}
                  </Text>
                </View>
                <Text style={styles.trackTabTitle} numberOfLines={1}>
                  {meta.label}
                </Text>
                <View style={styles.trackCountBadge}>
                  <Text style={styles.trackCountText}>
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
                  {currentTrackMeta.label.toUpperCase()} MASTERY
                </Text>
                <Text style={styles.progressSubtext}>
                  {completedCount} of {trackLessons.length} modules solved
                </Text>
              </View>
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

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.max(progressPercent, 4)}%`,
                    backgroundColor: StudioColors.lime,
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
                style={styles.upNextButton}
                onPress={() => onSelectLesson(nextUpLesson)}
              >
                <Text style={styles.upNextButtonText}>
                  {completedLessons[nextUpLesson.id]
                    ? "REVIEW MODULE →"
                    : "START MISSION →"}
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
                <Text style={styles.tierLabelText}>STAGE 0{idx + 1}</Text>
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
                        isNextUp && styles.nodeCardNextUp,
                        isLocked && styles.nodeCardLocked,
                      ]}
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

                        {isNextUp ? (
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
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingBottom: 72,
  },
  headerSection: {
    width: "100%",
    maxWidth: 680,
    marginBottom: 28,
  },
  editorialTopRow: {
    marginBottom: 18,
  },
  editorialLeft: {
    alignItems: "flex-start",
    gap: 8,
  },
  eyebrowSticker: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#111111",
    ...HardShadowSm,
  },
  eyebrow: {
    color: "#111111",
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
  trackTabsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  trackTabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#111111",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackTabPillActive: {
    ...HardShadow,
  },
  trackCodeBadge: {
    backgroundColor: "#F4F0E6",
    borderWidth: 1.5,
    borderColor: "#111111",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackCodeText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  trackTabTitle: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "800",
  },
  trackCountBadge: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#111111",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackCountText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  overviewCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111111",
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
    color: "#111111",
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
    borderColor: "#111111",
  },
  progressPercentText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "#F4F0E6",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#111111",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRightWidth: 1.5,
    borderRightColor: "#111111",
  },
  upNextBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#F4F0E6",
    borderTopWidth: 2,
    borderTopColor: "#111111",
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
    backgroundColor: "#111111",
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
    borderColor: "#111111",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 4,
  },
  upNextXpPillText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  upNextTitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
  },
  upNextDesc: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  upNextButton: {
    backgroundColor: StudioColors.lime,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  upNextButtonText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
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
    backgroundColor: "#111111",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    paddingTop: 18,
    borderWidth: 2,
    borderColor: "#111111",
    gap: 10,
    position: "relative",
    overflow: "hidden",
    ...HardShadow,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  nodeTopRibbon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: "#111111",
  },
  nodeCardDone: {
    backgroundColor: "#F9FFF9",
  },
  nodeCardNextUp: {
    backgroundColor: "#FFFFFF",
  },
  nodeCardLocked: {
    opacity: 0.72,
    backgroundColor: "#EAE3D2",
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
    backgroundColor: "#F4F0E6",
    borderWidth: 1.5,
    borderColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeDone: {
    backgroundColor: StudioColors.mint,
  },
  statusNumberText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  lockIcon: {
    color: "#111111",
    fontSize: 8,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  statusIconDone: {
    color: "#111111",
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
    borderColor: "#111111",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextUpNodePillText: {
    color: "#111111",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    fontFamily: MonoFont,
  },
  proNodePill: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1.5,
    borderColor: "#111111",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proNodePillText: {
    color: "#111111",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    fontFamily: MonoFont,
  },
  arrowBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#F4F0E6",
    borderWidth: 1.5,
    borderColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "900",
  },
  nodeTitle: {
    color: "#111111",
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
    backgroundColor: "#F4F0E6",
    borderColor: "#111111",
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  complexityMiniText: {
    color: "#111111",
    fontSize: 9,
    fontFamily: MonoFont,
    fontWeight: "800",
  },
  xpMiniBadge: {
    marginLeft: "auto",
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: "#111111",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  xpMiniLabel: {
    color: "#111111",
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  connectorContainer: {
    alignItems: "center",
    marginVertical: 2,
  },
  vLine: {
    width: 2.5,
  },
  hLine: {
    height: 2.5,
  },
  junctionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
