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
  HardShadowHero,
  HardShadowSm,
  MonoFont,
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
  isCompleted,
}: {
  fromCount: number;
  toCount: number;
  accent: string;
  isCompleted: boolean;
}) {
  const lineColor = StudioColors.border;
  const dotBg = isCompleted ? StudioColors.mint : StudioColors.surface;

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
      {/* Decorative Upper-Right Neo-Brutalist Blueprint & Geometric Arcade Backdrop */}
      <View style={styles.topRightBackdrop} pointerEvents="none">
        <View style={styles.backdropOrbitOuter} />
        <View style={styles.backdropOrbitMiddle} />
        <View style={styles.backdropOrbitInner} />
        <View
          style={[
            styles.backdropAccentDiamond,
            { backgroundColor: currentTrackMeta.stickerBg },
          ]}
        />
        <View style={styles.backdropCrosshairTop}>
          <Text style={styles.backdropCrosshairText}>+ SYS_GRID // 01</Text>
        </View>
        <View style={styles.backdropCrosshairBottom}>
          <Text style={styles.backdropCrosshairText}>+ 60HZ_SYNC</Text>
        </View>
      </View>

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

          {/* Right-Side Thematic Retro CRT & Code Cartridge Illustration */}
          <View style={styles.heroIllustrationWrap} pointerEvents="none">
            {/* Inserted ROM Cartridge on Top */}
            <View
              style={[
                styles.crtCartridge,
                { backgroundColor: currentTrackMeta.stickerBg },
              ]}
            >
              <View style={styles.crtCartridgeGrip} />
              <Text style={styles.crtCartridgeText}>
                ROM // {currentTrackMeta.tag}
              </Text>
            </View>

            {/* Retro Arcade Monitor Bezel */}
            <View style={styles.crtMonitorFrame}>
              <View style={styles.crtScreen}>
                <View style={styles.crtScreenTopBar}>
                  <Text style={styles.crtScreenTag}>
                    ● {activeTrack === "python_basics"
                      ? "PYTHON_KERNEL.PY"
                      : activeTrack === "algorithms"
                        ? "GRAPH_ENGINE.PY"
                        : "CLUSTER_MESH.PY"}
                  </Text>
                  <Text style={styles.crtScreenFps}>60Hz</Text>
                </View>

                {activeTrack === "python_basics" && (
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

                {activeTrack === "algorithms" && (
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

                {activeTrack === "system_design" && (
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
              </View>

              <View style={styles.crtMonitorChin}>
                <View style={styles.crtPowerLed} />
                <Text style={styles.crtMonitorBrand}>DEVLEARN // DECK-01</Text>
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
          </View>
        </View>

        {/* Tactile Color-Blocked Track Selector */}
        <View style={styles.trackTabsBar}>
          {TRACK_KEYS.map((trackKey) => {
            const meta = TrackThemes[trackKey];
            const isSelected = activeTrack === trackKey;
            const isTrackLocked = meta.isPro && !isPremium;
            const tLessons = lessons.filter((l) => l.track === trackKey);
            const tDone = tLessons.filter((l) => completedLessons[l.id]).length;

            return (
              <Pressable
                key={trackKey}
                style={({ pressed }) => [
                  styles.trackTabPill,
                  isSelected && [
                    styles.trackTabPillActive,
                    {
                      backgroundColor: meta.stickerBg,
                    },
                  ],
                  isTrackLocked && styles.trackTabPillLocked,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onPress={() => onSelectTrack(trackKey)}
              >
                <View
                  style={[
                    styles.trackCodeBadge,
                    isSelected && {
                      backgroundColor: StudioColors.ink,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.trackCodeText,
                      isSelected && { color: meta.stickerBg },
                    ]}
                  >
                    {isTrackLocked ? "🔒" : meta.tag}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.trackTabTitle,
                    isSelected && { color: StudioColors.ink, fontWeight: "900" },
                  ]}
                  numberOfLines={1}
                >
                  {meta.label}
                </Text>
                {isTrackLocked ? (
                  <View style={styles.trackProBadge}>
                    <Text style={styles.trackProBadgeText}>PRO</Text>
                  </View>
                ) : (
                  <View style={styles.trackCountBadge}>
                    <Text style={styles.trackCountText}>
                      {tDone}/{tLessons.length}
                    </Text>
                  </View>
                )}
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
    position: "relative",
  },
  content: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingBottom: 72,
    position: "relative",
  },
  topRightBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 340,
    height: 300,
    zIndex: 0,
    overflow: "hidden",
  },
  backdropOrbitOuter: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: StudioColors.borderSubtle,
  },
  backdropOrbitMiddle: {
    position: "absolute",
    top: -45,
    right: -45,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderColor: StudioColors.borderSubtle,
  },
  backdropOrbitInner: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: StudioColors.borderSubtle,
  },
  backdropAccentDiamond: {
    position: "absolute",
    top: 34,
    right: 42,
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    transform: [{ rotate: "45deg" }],
    opacity: 0.85,
  },
  backdropCrosshairTop: {
    position: "absolute",
    top: 18,
    right: 90,
  },
  backdropCrosshairBottom: {
    position: "absolute",
    top: 155,
    right: 22,
  },
  backdropCrosshairText: {
    color: StudioColors.textDim,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
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
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.border,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  trackTabPillActive: {
    borderColor: StudioColors.ink,
    ...HardShadow,
  },
  trackTabPillLocked: {
    opacity: 0.9,
  },
  trackCodeBadge: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackCodeText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  trackTabTitle: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
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
    backgroundColor: StudioColors.surface,
    borderRadius: 10,
    padding: 16,
    paddingTop: 18,
    borderWidth: 2,
    borderColor: StudioColors.border,
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
