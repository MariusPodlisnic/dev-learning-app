import React, { useEffect, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { Text } from "./StudioIcon";
import { StudioColors } from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { playKeyClick } from "../utils/soundEffects";
import {
  BRANCH_SPAN,
  CARD_GAP,
  CARD_WIDTH,
  createRoadmapStyles,
} from "./roadmapStyles";

export { BRANCH_SPAN, CARD_GAP, CARD_WIDTH };

export const TRACK_KEYS = ["python_basics", "algorithms", "system_design"] as const;

export const TRACK_PITCH_META: Record<
  string,
  {
    emoji: string;
    badge: string;
    shortName: string;
    hook: string;
  }
> = {
  python_basics: {
    emoji: "🐍",
    badge: "START HERE",
    shortName: "Python Foundations",
    hook: "Variables, loops, lists & real functions from scratch",
  },
  algorithms: {
    emoji: "🧬",
    badge: "PATTERNS & INTERVIEWS",
    shortName: "Algorithms",
    hook: "Master Two Pointers, Sliding Window, Sorting & Graphs",
  },
  system_design: {
    emoji: "🏗️",
    badge: "REAL-WORLD SCALE",
    shortName: "System Design",
    hook: "Design fast caches, load balancers, queues & retries",
  },
};

export function getShortLessonSummary(lesson: { description?: string }): string {
  const raw = (lesson.description || "").replace(/`/g, "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  if (raw.length <= 135) return raw;
  const firstSentenceMatch = raw.match(/^(.{25,}?[.!?])(?:\s|$)/);
  if (firstSentenceMatch && firstSentenceMatch[1].length <= 135) {
    return firstSentenceMatch[1];
  }
  const clipped = raw.slice(0, 128);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 60 ? clipped.slice(0, lastSpace) : clipped).trim()}.`;
}

export function getDifficultyColor(difficulty?: string) {
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

export function TreeConnector({
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
  const { colors } = useTheme();
  const styles = useThemedStyles(createRoadmapStyles);
  const lineColor = isCompleted ? colors.mint : accent;
  const borderFrame = colors.ink;
  const dotBg = isCompleted ? colors.mint : colors.surface;

  if (fromCount === 1 && toCount === 1) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[
            styles.vLine,
            { height: 22, backgroundColor: lineColor, borderColor: borderFrame },
          ]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: borderFrame, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[
            styles.vLine,
            { height: 20, backgroundColor: lineColor, borderColor: borderFrame },
          ]}
        />
        <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
      </View>
    );
  }

  if (fromCount === 1 && toCount === 2) {
    return (
      <View style={styles.connectorContainer}>
        <View
          style={[
            styles.vLine,
            { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
          ]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: borderFrame, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[
            styles.hLine,
            {
              width: BRANCH_SPAN,
              backgroundColor: lineColor,
              borderColor: borderFrame,
            },
          ]}
        />
        <View style={[styles.legsRow, { width: BRANCH_SPAN }]}>
          <View style={styles.legCol}>
            <View
              style={[
                styles.vLine,
                { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
          </View>
          <View style={styles.legCol}>
            <View
              style={[
                styles.vLine,
                { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
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
              style={[
                styles.vLine,
                { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <View
              style={[
                styles.junctionDot,
                { borderColor: borderFrame, backgroundColor: dotBg },
              ]}
            />
            <View
              style={[
                styles.vLine,
                { height: 16, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
          </View>
          <View style={styles.legCol}>
            <View
              style={[
                styles.vLine,
                { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <View
              style={[
                styles.junctionDot,
                { borderColor: borderFrame, backgroundColor: dotBg },
              ]}
            />
            <View
              style={[
                styles.vLine,
                { height: 16, backgroundColor: lineColor, borderColor: borderFrame },
              ]}
            />
            <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
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
            style={[
              styles.vLine,
              { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
            ]}
          />
          <View
            style={[
              styles.vLine,
              { height: 18, backgroundColor: lineColor, borderColor: borderFrame },
            ]}
          />
        </View>
        <View
          style={[
            styles.hLine,
            {
              width: BRANCH_SPAN,
              backgroundColor: lineColor,
              borderColor: borderFrame,
            },
          ]}
        />
        <View
          style={[
            styles.junctionDot,
            { borderColor: borderFrame, backgroundColor: dotBg },
          ]}
        />
        <View
          style={[
            styles.vLine,
            { height: 16, backgroundColor: lineColor, borderColor: borderFrame },
          ]}
        />
        <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
      </View>
    );
  }

  return (
    <View style={styles.connectorContainer}>
      <View
        style={[
          styles.vLine,
          { height: 28, backgroundColor: lineColor, borderColor: borderFrame },
        ]}
      />
      <Text style={[styles.connectorArrowTip, { color: lineColor }]}>▼</Text>
    </View>
  );
}

export function ScrollRevealRow({
  rowIndex,
  treeOffsetY,
  scrollThresholdY,
  children,
}: {
  rowIndex: number;
  treeOffsetY: number;
  scrollThresholdY: number;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(createRoadmapStyles);
  const [rowY, setRowY] = useState<number | null>(null);
  const [opacityAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(rowIndex === 0 ? 14 : 26));
  const [scaleAnim] = useState(() => new Animated.Value(0.97));

  const shouldReveal =
    rowIndex === 0 ||
    (rowY !== null && treeOffsetY + rowY <= scrollThresholdY - 24);

  useEffect(() => {
    if (!shouldReveal) return;
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [shouldReveal, opacityAnim, slideAnim, scaleAnim]);

  return (
    <Animated.View
      onLayout={(e) => {
        const nextY = e.nativeEvent.layout.y;
        setRowY((prev) => (prev === null || Math.abs(prev - nextY) > 8 ? nextY : prev));
      }}
      style={[
        styles.rowWrapper,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function InteractiveLessonNode({
  isDone,
  isNextUp,
  isLocked,
  isRecap,
  accentColor,
  onPress,
  children,
}: {
  isDone: boolean;
  isNextUp: boolean;
  isLocked: boolean;
  isRecap?: boolean;
  accentColor: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(createRoadmapStyles);
  const [hovered, setHovered] = useState<boolean>(false);
  const [pressed, setPressed] = useState<boolean>(false);
  const [liftAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const targetLift = pressed ? 1 : hovered ? -6 : 0;
    const targetScale = pressed ? 0.985 : hovered ? 1.028 : 1;
    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: targetLift,
        friction: 6,
        tension: 170,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: targetScale,
        friction: 6,
        tension: 170,
        useNativeDriver: false,
      }),
    ]).start();
  }, [hovered, pressed, liftAnim, scaleAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
        zIndex: hovered ? 10 : 1,
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
        onPress={() => {
          playKeyClick();
          onPress();
        }}
        style={[
          styles.nodeCard,
          isRecap && styles.nodeCardRecap,
          isDone && styles.nodeCardDone,
          isRecap && isDone && styles.nodeCardRecapDone,
          isNextUp && styles.nodeCardNextUp,
          isLocked && styles.nodeCardLocked,
          hovered && [
            styles.nodeCardHovered,
            {
              borderColor: isRecap
                ? StudioColors.yellow
                : isNextUp
                  ? StudioColors.lime
                  : accentColor,
            },
          ],
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function TrackPathCard({
  isSelected,
  isTrackLocked,
  stickerBg,
  emoji,
  badge,
  shortName,
  hook,
  doneCount,
  totalCount,
  onPress,
}: {
  isSelected: boolean;
  isTrackLocked: boolean;
  stickerBg: string;
  emoji: string;
  badge: string;
  shortName: string;
  hook: string;
  doneCount: number;
  totalCount: number;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createRoadmapStyles);
  const [hovered, setHovered] = useState<boolean>(false);
  const [liftAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(liftAnim, {
      toValue: hovered ? -4 : 0,
      friction: 6,
      tension: 170,
      useNativeDriver: false,
    }).start();
  }, [hovered, liftAnim]);

  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <Animated.View
      style={[
        styles.trackCardAnimWrap,
        { transform: [{ translateY: liftAnim }] },
      ]}
    >
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          styles.trackPathCard,
          isSelected && [
            styles.trackPathCardActive,
            { backgroundColor: stickerBg },
          ],
          isTrackLocked && !isSelected && styles.trackTabPillLocked,
          hovered && !isSelected && styles.trackPathCardHover,
          pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
        ]}
        onPress={() => {
          playKeyClick();
          onPress();
        }}
      >
        <View style={styles.trackPathTopRow}>
          <View
            style={[
              styles.trackEmojiBadge,
              {
                backgroundColor: isSelected ? StudioColors.ink : stickerBg,
              },
            ]}
          >
            <Text style={styles.trackEmojiText}>{emoji}</Text>
            <Text
              style={[
                styles.trackTagMini,
                isSelected && { color: stickerBg },
              ]}
            >
              {badge}
            </Text>
          </View>

          {isTrackLocked ? (
            <View style={styles.trackProBadge}>
              <Text style={styles.trackProBadgeText}>🔒 PRO · 1 FREE</Text>
            </View>
          ) : (
            <View
              style={[
                styles.trackCountBadge,
                isSelected && { borderColor: StudioColors.ink },
              ]}
            >
              <Text style={styles.trackCountText}>
                {doneCount}/{totalCount}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.trackPathTitle,
            isSelected && { color: StudioColors.ink },
          ]}
        >
          {shortName}
        </Text>

        <Text
          style={[
            styles.trackPathHook,
            isSelected && { color: StudioColors.ink, opacity: 0.85 },
          ]}
        >
          {hook}
        </Text>

        <View
          style={[
            styles.trackPathMeterBg,
            isSelected && { borderColor: StudioColors.ink },
          ]}
        >
          <View
            style={[
              styles.trackPathMeterFill,
              {
                width: `${Math.max(pct, 5)}%`,
                backgroundColor: isSelected ? StudioColors.ink : stickerBg,
              },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

