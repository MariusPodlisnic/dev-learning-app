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
  { key: "python_basics", label: "🐍 Foundation Core", accent: "#38BDF8" },
  { key: "algorithms", label: "⚡ Algorithms", accent: "#818CF8" },
  { key: "system_design", label: "🛰️ System Design", accent: "#34D399" },
];

const CARD_WIDTH = 260;
const CARD_GAP = 24;
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
  const lineColor = isCompleted ? accent : "#223049";

  if (fromCount === 1 && toCount === 1) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[styles.vLine, { height: 36, backgroundColor: lineColor }]}
        />
        <Text style={[styles.downArrow, { color: lineColor }]}>▼</Text>
      </View>
    );
  }

  if (fromCount === 1 && toCount === 2) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
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
            <Text style={[styles.downArrow, { color: lineColor }]}>▼</Text>
          </View>
          <View style={styles.legCol}>
            <View
              style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
            />
            <Text style={[styles.downArrow, { color: lineColor }]}>▼</Text>
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
              style={[styles.vLine, { height: 36, backgroundColor: lineColor }]}
            />
            <Text style={[styles.downArrow, { color: lineColor }]}>▼</Text>
          </View>
          <View style={styles.legCol}>
            <View
              style={[styles.vLine, { height: 36, backgroundColor: lineColor }]}
            />
            <Text style={[styles.downArrow, { color: lineColor }]}>▼</Text>
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
          style={[styles.vLine, { height: 20, backgroundColor: lineColor }]}
        />
        <Text style={[styles.downArrow, { color: lineColor }]}>▼</Text>
      </View>
    );
  }

  return (
    <View style={styles.connectorContainer}>
      <View
        style={[styles.vLine, { height: 32, backgroundColor: lineColor }]}
      />
      <Text style={[styles.downArrow, { color: lineColor }]}>▼</Text>
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
        <View style={styles.trackTabs}>
          {TRACKS.map((track) => {
            const isSelected = activeTrack === track.key;
            return (
              <Pressable
                key={track.key}
                style={[
                  styles.trackPill,
                  isSelected && {
                    backgroundColor: "#1E293B",
                    borderColor: track.accent,
                  },
                ]}
                onPress={() => onSelectTrack(track.key)}
              >
                <Text
                  style={[
                    styles.trackPillText,
                    isSelected && { color: "#F8FAFC" },
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
            <Text style={styles.progressLabel}>Track Progress</Text>
            <Text
              style={[styles.progressCount, { color: currentTrackMeta.accent }]}
            >
              {completedCount} / {trackLessons.length} Completed (
              {progressPercent}%)
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
                              },
                          ]}
                        >
                          <Text style={styles.statusIcon}>
                            {isLocked ? "🔒" : isDone ? "✓" : ""}
                          </Text>
                        </View>
                        <View style={styles.nodeTextContainer}>
                          <Text style={styles.nodeCategory} numberOfLines={1}>
                            {node.category || `Step ${node.lesson_order}`}
                          </Text>
                          <Text style={styles.nodeTitle} numberOfLines={2}>
                            {node.title}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.arrowBadge}>
                        <Text
                          style={[
                            styles.arrowIcon,
                            { color: currentTrackMeta.accent },
                          ]}
                        >
                          →
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
    backgroundColor: "#070A11",
  },
  content: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerSection: {
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
    marginBottom: 44,
  },
  trackTabs: {
    flexDirection: "row",
    backgroundColor: "#0F1524",
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  trackPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackPillText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  progressContainer: {
    width: "100%",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  progressCount: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#131C2D",
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
    backgroundColor: "#0F1524",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#1E293B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  nodeCardDone: {
    borderColor: "#10B98180",
    backgroundColor: "#064E3B15",
  },
  nodeCardLocked: {
    opacity: 0.6,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#131C2D",
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  statusIcon: {
    color: "#070A11",
    fontSize: 11,
    fontWeight: "900",
  },
  nodeCategory: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  nodeTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  arrowBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#131C2D",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 13,
    fontWeight: "800",
  },
  connectorContainer: {
    alignItems: "center",
  },
  vLine: {
    width: 2,
  },
  hLine: {
    height: 2,
  },
  legsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legCol: {
    alignItems: "center",
  },
  downArrow: {
    fontSize: 9,
    lineHeight: 10,
    marginTop: -2,
    marginBottom: -1,
  },
});
