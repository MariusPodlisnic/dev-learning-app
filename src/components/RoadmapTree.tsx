import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface LessonNode {
  id: string;
  title: string;
  track: string;
  category?: string;
  difficulty?: string;
  tree_row?: number;
  description: string;
  is_free: boolean;
  lesson_order: number;
}

interface RoadmapTreeProps {
  lessons: LessonNode[];
  completedLessons: Record<string, boolean>;
  isPremium: boolean;
  activeTrack: string;
  onSelectTrack: (track: string) => void;
  onSelectLesson: (lesson: LessonNode) => void;
}

const TRACK_META: Record<
  string,
  { title: string; subtitle: string; icon: string; accent: string }
> = {
  python_basics: {
    title: "Foundation Core",
    subtitle:
      "Master memory allocation, control flow, modular functions, and hash maps.",
    icon: "🐍",
    accent: "#38BDF8",
  },
  algorithms: {
    title: "Algorithmic Mastery",
    subtitle:
      "NeetCode-style data structure patterns for technical interviews.",
    icon: "⚡",
    accent: "#818CF8",
  },
  system_design: {
    title: "System Architecture",
    subtitle:
      "Distributed rate limiters, caching layers, and high-scale primitives.",
    icon: "🛰️",
    accent: "#34D399",
  },
};

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
  const masteryPercent = trackLessons.length
    ? Math.round((completedCount / trackLessons.length) * 100)
    : 0;

  const rowsMap: Record<number, LessonNode[]> = {};
  trackLessons.forEach((lesson) => {
    const r = lesson.tree_row || lesson.lesson_order || 1;
    if (!rowsMap[r]) rowsMap[r] = [];
    rowsMap[r].push(lesson);
  });

  const sortedRowKeys = Object.keys(rowsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const meta = TRACK_META[activeTrack] || TRACK_META.python_basics;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.trackSelectorRow}>
        {Object.entries(TRACK_META).map(([key, info]) => {
          const isSelected = activeTrack === key;
          const tLessons = lessons.filter((l) => l.track === key);
          const tDone = tLessons.filter((l) => completedLessons[l.id]).length;
          return (
            <Pressable
              key={key}
              style={[
                styles.trackCard,
                isSelected && {
                  borderColor: info.accent,
                  backgroundColor: "#131C2D",
                },
              ]}
              onPress={() => onSelectTrack(key)}
            >
              <View style={styles.trackCardHeader}>
                <Text style={styles.trackIcon}>{info.icon}</Text>
                <Text
                  style={[styles.trackProgressBadge, { color: info.accent }]}
                >
                  {tDone}/{tLessons.length} NODES
                </Text>
              </View>
              <Text style={styles.trackCardTitle}>{info.title}</Text>
              <Text style={styles.trackCardSub} numberOfLines={2}>
                {info.subtitle}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bannerCard}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerLabel, { color: meta.accent }]}>
            SKILL CONSTELLATION TREE
          </Text>
          <Text style={styles.bannerTitle}>
            {meta.icon} {meta.title}
          </Text>
          <Text style={styles.bannerDesc}>{meta.subtitle}</Text>
        </View>
        <View style={styles.masteryOrb}>
          <Text style={[styles.masteryValue, { color: meta.accent }]}>
            {masteryPercent}%
          </Text>
          <Text style={styles.masteryLabel}>MASTERY</Text>
        </View>
      </View>

      <View style={styles.treeCanvas}>
        {sortedRowKeys.map((rowNum, rIdx) => {
          const nodesInRow = rowsMap[rowNum];
          const isLastRow = rIdx === sortedRowKeys.length - 1;

          return (
            <View key={rowNum} style={styles.tierBlock}>
              <View style={styles.tierLabelPill}>
                <Text style={styles.tierLabelText}>TIER {rowNum}</Text>
              </View>

              <View style={styles.nodesRow}>
                {nodesInRow.map((node) => {
                  const isCompleted = completedLessons[node.id];
                  const isLocked = !node.is_free && !isPremium;

                  return (
                    <Pressable
                      key={node.id}
                      style={[
                        styles.nodeCard,
                        isCompleted && styles.nodeCardCompleted,
                        isLocked && styles.nodeCardLocked,
                      ]}
                      onPress={() => onSelectLesson(node)}
                    >
                      <View style={styles.nodeTopRow}>
                        <Text style={styles.categoryBadge}>
                          {node.category || "Core Concept"}
                        </Text>
                        <View
                          style={[
                            styles.diffBadge,
                            node.difficulty === "Medium" && styles.diffMedium,
                          ]}
                        >
                          <Text style={styles.diffText}>
                            {node.difficulty || "Easy"}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.nodeTitle}>{node.title}</Text>
                      <Text style={styles.nodeDesc} numberOfLines={2}>
                        {node.description}
                      </Text>

                      <View style={styles.nodeFooter}>
                        <View style={styles.statusRow}>
                          <Text style={styles.statusIcon}>
                            {isLocked ? "🔒" : isCompleted ? "✅" : "⚡"}
                          </Text>
                          <Text
                            style={[
                              styles.statusLabel,
                              isCompleted && { color: "#34D399" },
                              isLocked && { color: "#F59E0B" },
                            ]}
                          >
                            {isLocked
                              ? "PRO NODE"
                              : isCompleted
                                ? "MASTERED"
                                : "READY TO LAUNCH"}
                          </Text>
                        </View>
                        <Text style={styles.xpTag}>+50 XP</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {!isLastRow && (
                <View style={styles.connectorContainer}>
                  <View
                    style={[
                      styles.connectorLine,
                      { backgroundColor: meta.accent },
                    ]}
                  />
                  <View
                    style={[
                      styles.connectorArrow,
                      { borderColor: meta.accent },
                    ]}
                  >
                    <Text
                      style={[
                        styles.connectorArrowText,
                        { color: meta.accent },
                      ]}
                    >
                      ▼
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070A11" },
  contentContainer: { padding: 24, paddingBottom: 60 },
  trackSelectorRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  trackCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: "#0A0E17",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#1E293B",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  trackIcon: { fontSize: 24 },
  trackProgressBadge: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  trackCardTitle: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  trackCardSub: { color: "#64748B", fontSize: 12, lineHeight: 18 },
  bannerCard: {
    backgroundColor: "#0F1524",
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1E293B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  bannerTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  bannerDesc: { color: "#94A3B8", fontSize: 13, maxWidth: 600, lineHeight: 20 },
  masteryOrb: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#131C2D",
    borderWidth: 2,
    borderColor: "#223049",
    justifyContent: "center",
    alignItems: "center",
  },
  masteryValue: { fontSize: 22, fontWeight: "900" },
  masteryLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  treeCanvas: { alignItems: "center" },
  tierBlock: { alignItems: "center", width: "100%" },
  tierLabelPill: {
    backgroundColor: "#131C2D",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#223049",
    marginBottom: 14,
  },
  tierLabelText: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  nodesRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 20,
    width: "100%",
  },
  nodeCard: {
    width: 310,
    backgroundColor: "#0F1524",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#223049",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  nodeCardCompleted: {
    borderColor: "#10B981",
    backgroundColor: "#064E3B15",
  },
  nodeCardLocked: {
    borderColor: "#334155",
    opacity: 0.85,
  },
  nodeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    color: "#38BDF8",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  diffBadge: {
    backgroundColor: "#10B98120",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffMedium: { backgroundColor: "#F59E0B20" },
  diffText: { color: "#34D399", fontSize: 10, fontWeight: "800" },
  nodeTitle: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  nodeDesc: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  nodeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    paddingTop: 12,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusIcon: { fontSize: 12 },
  statusLabel: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  xpTag: { color: "#64748B", fontSize: 11, fontWeight: "800" },
  connectorContainer: { alignItems: "center", marginVertical: 12 },
  connectorLine: { width: 2, height: 28, opacity: 0.5 },
  connectorArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0F1524",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -4,
  },
  connectorArrowText: { fontSize: 9, fontWeight: "900" },
});
