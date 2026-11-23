import React, { useEffect, useState } from "react";
import { Animated, Platform, Pressable, View } from "react-native";
import { StudioColors } from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { playKeyClick } from "../utils/soundEffects";
import { createRoadmapStyles } from "./roadmapStyles";
import { StudioIcon, Text } from "./StudioIcon";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

export const TRACK_KEYS = [
  "python_basics",
  "algorithms",
  "system_design",
] as const;

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
    badge: "INTERVIEW PREP",
    shortName: "Algorithms",
    hook: "Master Two Pointers, Sliding Window, Sorting & Graphs",
  },
  system_design: {
    emoji: "🏗️",
    badge: "SYSTEM SCALE",
    shortName: "System Design",
    hook: "Design fast caches, load balancers, queues & retries",
  },
};

export function getShortLessonSummary(lesson: { description?: string }): string {
  const raw = (lesson.description || "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
      useNativeDriver: USE_NATIVE_DRIVER,
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
              <StudioIcon name="lock" size={12} />
              <Text style={styles.trackProBadgeText}>PRO · 1 FREE</Text>
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
