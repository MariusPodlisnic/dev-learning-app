import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

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

const TRACKS = [
  {
    key: "python_basics",
    label: "Foundation Core",
    tag: "01",
    accent: "#F59E0B",
  },
  { key: "algorithms", label: "Algorithms", tag: "02", accent: "#6366F1" },
  {
    key: "system_design",
    label: "System Design",
    tag: "03",
    accent: "#10B981",
  },
];

const CARD_WIDTH = 270;
const CARD_GAP = 28;
const BRANCH_SPAN = CARD_WIDTH + CARD_GAP;

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
  const lineColor = isCompleted ? accent : "#27272A";

  if (fromCount === 1 && toCount === 1) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[styles.vLine, { height: 34, backgroundColor: lineColor }]}
        />
        <Text style={[styles.downArrow, { color: lineColor }]}>▾</Text>
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
            styles.hLine,
            { width: BRANCH_SPAN, backgroundColor: lineColor },
          ]}
        />
        <View style={[styles.legsRow, { width: BRANCH_SPAN }]}>
          <View style={styles.legCol}>
            <View
              style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
            />
            <Text style={[styles.downArrow, { color: lineColor }]}>▾</Text>
          </View>
          <View style={styles.legCol}>
            <View
              style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
            />
            <Text style={[styles.downArrow, { color: lineColor }]}>▾</Text>
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
              style={[styles.vLine, { height: 34, backgroundColor: lineColor }]}
            />
            <Text style={[styles.downArrow, { color: lineColor }]}>▾</Text>
          </View>
          <View style={styles.legCol}>
            <View
              style={[styles.vLine, { height: 34, backgroundColor: lineColor }]}
            />
            <Text style={[styles.downArrow, { color: lineColor }]}>▾</Text>
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
            style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
          />
          <View
            style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
          />
        </View>
        <View
          style={[
            styles.hLine,
            { width: BRANCH_SPAN, backgroundColor: lineColor },
          ]}
        />
        <View
          style={[styles.vLine, { height: 18, backgroundColor: lineColor }]}
        />
        <Text style={[styles.downArrow, { color: lineColor }]}>▾</Text>
      </View>
    );
  }

  return (
    <View style={styles.connectorContainer}>
      <View
        style={[styles.vLine, { height: 32, backgroundColor: lineColor }]}
      />
      <Text style={[styles.downArrow, { color: lineColor }]}>▾</Text>
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
    TRACKS.find((t) => t.key === activeTrack) || TRACKS[0];

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.eyebrow}>CURRICULUM ROADMAP</Text>
        <Text style={styles.mainHeading}>Select a path to master</Text>

        <View style={styles.trackTabs}>
          {TRACKS.map((track) => {
            const isSelected = activeTrack === track.key;
            return (
              <Pressable
                key={track.key}
                style={[
                  styles.trackPill,
                  isSelected && {
                    backgroundColor: "#18181B",
                    borderColor: track.accent,
                  },
                ]}
                onPress={() => onSelectTrack(track.key)}
              >
                <Text
                  style={[
                    styles.trackTag,
                    { color: isSelected ? track.accent : "#52525B" },
                  ]}
                >
                  {track.tag}
                </Text>
                <Text
                  style={[
                    styles.trackPillText,
                    isSelected && { color: "#FAFAFA" },
                  ]}
                >
                  {track.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>MASTERY PROGRESS</Text>
            <Text
              style={[styles.progressCount, { color: currentTrackMeta.accent }]}
            >
              {completedCount} of {trackLessons.length} completed ·{" "}
              {progressPercent}%
            </Text>
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
      </View>

      <View style={styles.treeCanvas}>
        {sortedRows.map((rowNum, idx) => {
          const rowNodes = rowsMap[rowNum];
          const isLastRow = idx === sortedRows.length - 1;
          const nextRowNodes = !isLastRow ? rowsMap[sortedRows[idx + 1]] : [];
          const rowCleared = rowNodes.some((n) => completedLessons[n.id]);

          return (
            <View key={rowNum} style={styles.rowWrapper}>
              <View style={styles.nodesRow}>
                {rowNodes.map((node) => {
                  const isDone = completedLessons[node.id];
                  const isLocked = !node.is_free && !isPremium;

                  return (
                    <Pressable
                      key={node.id}
                      style={[
                        styles.nodeCard,
                        isDone && styles.nodeCardDone,
                        !isDone && !isLocked && { borderColor: "#27272A" },
                        isLocked && styles.nodeCardLocked,
                      ]}
                      onPress={() => onSelectLesson(node)}
                    >
                      <View style={styles.nodeLeft}>
                        <View
                          style={[
                            styles.statusBadge,
                            isDone && styles.statusBadgeDone,
                            !isDone &&
                              !isLocked && {
                                borderColor: currentTrackMeta.accent,
                                backgroundColor: currentTrackMeta.accent + "12",
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
                                { backgroundColor: currentTrackMeta.accent },
                              ]}
                            />
                          )}
                        </View>
                        <View style={styles.nodeTextContainer}>
                          <Text
                            style={[
                              styles.nodeCategory,
                              !isLocked && { color: currentTrackMeta.accent },
                            ]}
                            numberOfLines={1}
                          >
                            {node.category || `Module ${node.lesson_order}`}
                          </Text>
                          <Text style={styles.nodeTitle} numberOfLines={2}>
                            {node.title}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.arrowBadge}>
                        <Text style={styles.arrowIcon}>↗</Text>
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
    backgroundColor: "#09090B",
  },
  content: {
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerSection: {
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
    marginBottom: 44,
  },
  eyebrow: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 6,
  },
  mainHeading: {
    color: "#FAFAFA",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  trackTabs: {
    flexDirection: "row",
    backgroundColor: "#121215",
    padding: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272A",
    gap: 6,
    marginBottom: 28,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  trackPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackTag: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  trackPillText: {
    color: "#71717A",
    fontSize: 13,
    fontWeight: "700",
  },
  progressContainer: {
    width: "100%",
    backgroundColor: "#121215",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  progressCount: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 5,
    backgroundColor: "#18181B",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  treeCanvas: {
    alignItems: "center",
    width: "100%",
  },
  rowWrapper: {
    alignItems: "center",
    width: "100%",
  },
  nodesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: CARD_GAP,
  },
  nodeCard: {
    width: CARD_WIDTH,
    backgroundColor: "#121215",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  nodeCardDone: {
    borderColor: "#10B98150",
    backgroundColor: "#10B9810A",
  },
  nodeCardLocked: {
    opacity: 0.55,
  },
  nodeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  nodeTextContainer: {
    flex: 1,
  },
  statusBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#18181B",
    borderWidth: 1.5,
    borderColor: "#3F3F46",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  lockIcon: {
    fontSize: 10,
  },
  statusIconDone: {
    color: "#09090B",
    fontSize: 12,
    fontWeight: "900",
  },
  nodeCategory: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  nodeTitle: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  arrowBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
  },
  connectorContainer: {
    alignItems: "center",
  },
  vLine: {
    width: 1.5,
  },
  hLine: {
    height: 1.5,
  },
  legsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legCol: {
    alignItems: "center",
  },
  downArrow: {
    fontSize: 12,
    lineHeight: 12,
    marginTop: -4,
    marginBottom: -2,
  },
});
