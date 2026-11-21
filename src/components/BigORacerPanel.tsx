import React, { useMemo, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from "react-native";
import {
  HardShadowSm,
  MonoFont,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import type { Lesson } from "../types/lesson";
import {
  analyzeUserCodeComplexity,
  BIG_O_INPUT_SIZES,
  buildRaceComparison,
  estimateOperations,
  formatOpsCount,
  resolveLessonRaceProfile,
} from "../utils/bigORacer";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import { StudioIcon, Text } from "./StudioIcon";

interface BigORacerPanelProps {
  lesson?: Lesson;
  userCode?: string;
}

export default function BigORacerPanel({
  lesson,
  userCode = "",
}: BigORacerPanelProps) {
  const styles = useThemedStyles(createStyles);
  const [inputSize, setInputSize] = useState<number>(1000);
  const [raceState, setRaceState] = useState<"idle" | "racing" | "done">("idle");
  const [optimalAnim] = useState(() => new Animated.Value(0));
  const [naiveAnim] = useState(() => new Animated.Value(0));

  const profile = useMemo(() => resolveLessonRaceProfile(lesson), [lesson]);
  const metrics = useMemo(
    () => buildRaceComparison(profile, inputSize),
    [inputSize, profile],
  );
  const codeHint = useMemo(
    () => analyzeUserCodeComplexity(userCode),
    [userCode],
  );

  function handleSelectSize(nextN: number) {
    playKeyClick();
    setInputSize(nextN);
    setRaceState("idle");
    optimalAnim.setValue(0);
    naiveAnim.setValue(0);
  }

  function handleRunRace() {
    playKeyClick();
    setRaceState("racing");
    optimalAnim.setValue(0);
    naiveAnim.setValue(0);

    Animated.parallel([
      Animated.timing(optimalAnim, {
        toValue: 1,
        duration: metrics.optimalDurationMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(naiveAnim, {
        toValue: 1,
        duration: metrics.naiveDurationMs,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setRaceState("done");
        playSuccessChime();
      }
    });
  }

  const optimalWidth = optimalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["4%", "100%"],
  });
  const naiveWidth = naiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["4%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Top Racer Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBadge}>
            <StudioIcon name="bolt" size={16} />
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.eyebrow}>BIG-O PERFORMANCE RACER</Text>
            <Text style={styles.title}>
              {profile.optimalClass} vs {profile.naiveClass}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.draftBadge,
            codeHint.isNestedLoop && styles.draftBadgeWarn,
          ]}
        >
          <Text
            style={[
              styles.draftBadgeText,
              codeHint.isNestedLoop && styles.draftBadgeTextWarn,
            ]}
          >
            {codeHint.badgeText}
          </Text>
        </View>
      </View>

      <Text style={styles.codeNoteText}>{codeHint.note}</Text>

      {/* Input Size Chips */}
      <View style={styles.sizeRow}>
        <Text style={styles.sizeLabel}>INPUT SIZE N:</Text>
        <View style={styles.sizeChips}>
          {BIG_O_INPUT_SIZES.map((n) => {
            const selected = inputSize === n;
            return (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`Set race input size to ${n.toLocaleString()}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.sizeChip,
                  selected && styles.sizeChipActive,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => handleSelectSize(n)}
              >
                <Text
                  style={[
                    styles.sizeChipText,
                    selected && styles.sizeChipTextActive,
                  ]}
                >
                  n={n >= 1000 ? `${n / 1000}K` : n}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Dual-Lane Visual Race Track */}
      <View style={styles.trackBox}>
        <View style={styles.trackHeaderRow}>
          <Text style={styles.trackHeading}>
            LIVE OPERATION RACE (N = {inputSize.toLocaleString()})
          </Text>
          <View style={styles.speedupPill}>
            <Text style={styles.speedupPillText}>{metrics.speedupLabel}</Text>
          </View>
        </View>

        {/* Lane 1: Optimal */}
        <View style={styles.laneBlock}>
          <View style={styles.laneLabelRow}>
            <Text style={styles.laneTitle}>
              {profile.optimalLabel} ({profile.optimalClass})
            </Text>
            <Text style={styles.laneOpsOptimal}>
              {formatOpsCount(metrics.optimalOps)}
            </Text>
          </View>
          <View style={styles.laneTrack}>
            <Animated.View
              style={[
                styles.laneFillOptimal,
                { width: raceState === "idle" ? "14%" : optimalWidth },
              ]}
            />
          </View>
        </View>

        {/* Lane 2: Naive */}
        <View style={styles.laneBlock}>
          <View style={styles.laneLabelRow}>
            <Text style={styles.laneTitle}>
              {profile.naiveLabel} ({profile.naiveClass})
            </Text>
            <Text style={styles.laneOpsNaive}>
              {formatOpsCount(metrics.naiveOps)}
            </Text>
          </View>
          <View style={styles.laneTrack}>
            <Animated.View
              style={[
                styles.laneFillNaive,
                { width: raceState === "idle" ? "14%" : naiveWidth },
              ]}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start Big-O performance race"
          style={({ pressed }) => [
            styles.raceBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={handleRunRace}
        >
          <StudioIcon name="rocket" size={14} />
          <Text style={styles.raceBtnText}>
            {raceState === "racing"
              ? "RACING..."
              : raceState === "done"
                ? `RACE AGAIN (${metrics.speedupLabel})`
                : "START COMPLEXITY RACE"}
          </Text>
        </Pressable>
      </View>

      {/* Scaling Growth Table */}
      <View style={styles.tableBox}>
        <Text style={styles.tableTitle}>SCALING CURVE SNAPSHOT</Text>
        <View style={styles.tableGrid}>
          {BIG_O_INPUT_SIZES.map((n) => (
            <View
              key={n}
              style={[
                styles.tableCol,
                n === inputSize && styles.tableColSelected,
              ]}
            >
              <Text style={styles.tableColN}>
                n={n >= 1000 ? `${n / 1000}K` : n}
              </Text>
              <Text style={styles.tableColOptimal}>
                {formatOpsCount(estimateOperations(profile.optimalClass, n))}
              </Text>
              <Text style={styles.tableColNaive}>
                {formatOpsCount(estimateOperations(profile.naiveClass, n))}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.takeawayText}>{profile.takeaway}</Text>
      </View>
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    container: {
      gap: 11,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    titleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    titleCol: {
      gap: 1,
    },
    eyebrow: {
      color: StudioColors.textMuted,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
    },
    title: {
      color: StudioColors.textPrimary,
      fontSize: 15,
      fontWeight: "900",
    },
    draftBadge: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.mint,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    draftBadgeWarn: {
      backgroundColor: "rgba(255, 107, 107, 0.16)",
      borderColor: StudioColors.coral,
    },
    draftBadgeText: {
      color: StudioColors.mint,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    draftBadgeTextWarn: {
      color: StudioColors.coral,
    },
    codeNoteText: {
      color: StudioColors.textSecondary,
      fontSize: 11.5,
      fontWeight: "700",
      lineHeight: 16,
    },
    sizeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    sizeLabel: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    sizeChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    sizeChip: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    sizeChipActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
      borderWidth: 2,
      ...HardShadowSm,
    },
    sizeChipText: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    sizeChipTextActive: {
      color: StudioColors.ink,
    },
    trackBox: {
      backgroundColor: StudioColors.bg,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 12,
      padding: 12,
      gap: 11,
      ...HardShadowSm,
    },
    trackHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
    },
    trackHeading: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    speedupPill: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2.5,
    },
    speedupPillText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    laneBlock: {
      gap: 5,
    },
    laneLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    laneTitle: {
      color: StudioColors.textPrimary,
      fontSize: 11.5,
      fontWeight: "900",
      flex: 1,
    },
    laneOpsOptimal: {
      color: StudioColors.lime,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    laneOpsNaive: {
      color: StudioColors.coral,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    laneTrack: {
      height: 14,
      borderRadius: 7,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    laneFillOptimal: {
      height: "100%",
      backgroundColor: StudioColors.lime,
    },
    laneFillNaive: {
      height: "100%",
      backgroundColor: StudioColors.coral,
    },
    raceBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 9,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    raceBtnText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    tableBox: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 11,
      padding: 11,
      gap: 8,
    },
    tableTitle: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    tableGrid: {
      flexDirection: "row",
      gap: 6,
    },
    tableCol: {
      flex: 1,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 8,
      paddingVertical: 7,
      paddingHorizontal: 5,
      alignItems: "center",
      gap: 3,
    },
    tableColSelected: {
      borderColor: StudioColors.yellow,
      borderWidth: 2,
    },
    tableColN: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    tableColOptimal: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    tableColNaive: {
      color: StudioColors.coral,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    takeawayText: {
      color: StudioColors.textSecondary,
      fontSize: 11.5,
      fontWeight: "700",
      lineHeight: 16,
    },
  });
