import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { Lesson } from "../types/lesson";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import { getSystemDesignLabForLesson } from "../utils/systemDesignLabs";
import { Text } from "./StudioIcon";

interface SystemDesignLabPanelProps {
  lesson: Lesson;
}

function buildInitialParamState(lesson: Lesson): Record<string, number> {
  const spec = getSystemDesignLabForLesson(lesson);
  const out: Record<string, number> = {};
  for (const p of spec.params) {
    out[p.key] = p.defaultValue;
  }
  return out;
}

export default function SystemDesignLabPanel({
  lesson,
}: SystemDesignLabPanelProps) {
  const styles = useThemedStyles(createStyles);
  const spec = useMemo(() => getSystemDesignLabForLesson(lesson), [lesson]);
  const [paramState, setParamState] = useState<{
    lessonId: string;
    values: Record<string, number>;
  }>(() => ({
    lessonId: lesson.id,
    values: buildInitialParamState(lesson),
  }));

  const values =
    paramState.lessonId === lesson.id
      ? paramState.values
      : buildInitialParamState(lesson);

  const sim = spec.simulate(values);

  function updateParam(key: string, nextVal: number) {
    playKeyClick();
    const updated = { ...values, [key]: nextVal };
    const nextSim = spec.simulate(updated);
    if (nextSim.allSlaPassed && !sim.allSlaPassed) {
      playSuccessChime();
    }
    setParamState({ lessonId: lesson.id, values: updated });
  }

  function applyRecommendedPreset() {
    playSuccessChime();
    setParamState({
      lessonId: lesson.id,
      values: { ...spec.recommendedPreset },
    });
  }

  function resetDefaults() {
    playKeyClick();
    setParamState({
      lessonId: lesson.id,
      values: buildInitialParamState(lesson),
    });
  }

  const healthBadgeBg =
    sim.health === "HEALTHY"
      ? StudioColors.mint
      : sim.health === "DEGRADED"
        ? StudioColors.yellow
        : StudioColors.coral;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🏛️ {spec.badge}</Text>
        </View>
        <View style={[styles.healthPill, { backgroundColor: healthBadgeBg }]}>
          <Text style={styles.healthText}>{sim.health}</Text>
        </View>
      </View>

      <Text style={styles.title}>{spec.title}</Text>
      <Text style={styles.subtitle}>{spec.subtitle}</Text>

      <View style={styles.slaGoalBox}>
        <Text style={styles.slaGoalLabel}>ARCHITECTURE SLA TARGET</Text>
        <Text style={styles.slaGoalPrompt}>{spec.challengePrompt}</Text>
      </View>

      <View style={styles.paramsSection}>
        {spec.params.map((p) => {
          const curVal = values[p.key] ?? p.defaultValue;
          if (p.kind === "toggle") {
            const isOn = curVal === 1;
            return (
              <View key={p.key} style={styles.paramRow}>
                <View style={styles.paramInfo}>
                  <Text style={styles.paramLabel}>{p.label}</Text>
                  <Text style={styles.paramHint}>{p.hint}</Text>
                </View>
                <Pressable
                  style={[styles.toggleBtn, isOn && styles.toggleBtnOn]}
                  onPress={() => updateParam(p.key, isOn ? 0 : 1)}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      isOn && styles.toggleBtnTextOn,
                    ]}
                  >
                    {isOn ? "ENABLED ✓" : "OFF"}
                  </Text>
                </Pressable>
              </View>
            );
          }

          const min = p.min ?? 0;
          const max = p.max ?? 100;
          const step = p.step ?? 1;
          const unit = p.unit ? ` ${p.unit}` : "";

          return (
            <View key={p.key} style={styles.paramRow}>
              <View style={styles.paramInfo}>
                <Text style={styles.paramLabel}>{p.label}</Text>
                <Text style={styles.paramHint}>{p.hint}</Text>
              </View>
              <View style={styles.stepperWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.stepBtn,
                    curVal <= min && styles.stepBtnDisabled,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  disabled={curVal <= min}
                  onPress={() => updateParam(p.key, Math.max(min, curVal - step))}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </Pressable>
                <Text style={styles.stepValue}>
                  {curVal}
                  {unit}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.stepBtn,
                    curVal >= max && styles.stepBtnDisabled,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  disabled={curVal >= max}
                  onPress={() => updateParam(p.key, Math.min(max, curVal + step))}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.telemetryBox}>
        <Text style={styles.telemetryHeadline}>{sim.headline}</Text>
        <View style={styles.metricsList}>
          {sim.metrics.map((m) => {
            const barColor =
              m.tone === "good"
                ? StudioColors.mint
                : m.tone === "warn"
                  ? StudioColors.yellow
                  : StudioColors.coral;
            return (
              <View key={m.label} style={styles.metricRow}>
                <View style={styles.metricLabelRow}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricVal}>{m.valueText}</Text>
                </View>
                <View style={styles.meterTrack}>
                  <View
                    style={[
                      styles.meterFill,
                      {
                        width: `${Math.max(4, Math.min(100, m.fillPercent))}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.slaGrid}>
        {sim.slaChecks.map((check) => (
          <View
            key={check.label}
            style={[
              styles.slaCheckPill,
              check.passed ? styles.slaCheckPass : styles.slaCheckFail,
            ]}
          >
            <Text style={styles.slaCheckStatus}>
              {check.passed ? "✓ PASS" : "✕ MISS"}
            </Text>
            <Text style={styles.slaCheckName}>{check.label}</Text>
            <Text style={styles.slaCheckMeta}>
              {check.actual} (goal {check.target})
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footerActions}>
        <Pressable style={styles.actionBtn} onPress={applyRecommendedPreset}>
          <Text style={styles.actionBtnText}>AUTO-TUNE SLA</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={resetDefaults}>
          <Text style={styles.secondaryBtnText}>RESET</Text>
        </Pressable>
      </View>

      <Text style={styles.tradeoffNote}>💡 {sim.tradeoffNote}</Text>
    </View>
  );
}

function createStyles(colors: StudioThemeColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 16,
      marginBottom: 14,
      ...HardShadow,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },
    badge: {
      backgroundColor: StudioColors.sky,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
    },
    badgeText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 10,
      letterSpacing: 0.5,
    },
    healthPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
    },
    healthText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 10,
      letterSpacing: 0.6,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 4,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 12.5,
      lineHeight: 18,
      marginBottom: 12,
    },
    slaGoalBox: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      padding: 10,
      marginBottom: 12,
    },
    slaGoalLabel: {
      color: StudioColors.yellow,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 9.5,
      letterSpacing: 0.6,
      marginBottom: 3,
    },
    slaGoalPrompt: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 17,
    },
    paramsSection: {
      gap: 10,
      marginBottom: 14,
    },
    paramRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.bg,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      padding: 10,
    },
    paramInfo: {
      flex: 1,
      minWidth: 130,
    },
    paramLabel: {
      color: colors.textPrimary,
      fontSize: 12.5,
      fontWeight: "800",
    },
    paramHint: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
      marginTop: 2,
    },
    stepperWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    stepBtn: {
      width: 30,
      height: 30,
      borderRadius: 6,
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    stepBtnDisabled: {
      opacity: 0.4,
    },
    stepBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 16,
      lineHeight: 18,
    },
    stepValue: {
      minWidth: 74,
      textAlign: "center",
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 12,
    },
    toggleBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      backgroundColor: colors.surfaceElevated,
      ...HardShadowSm,
    },
    toggleBtnOn: {
      backgroundColor: StudioColors.lime,
    },
    toggleBtnText: {
      color: colors.textSecondary,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 10.5,
    },
    toggleBtnTextOn: {
      color: StudioColors.ink,
    },
    telemetryBox: {
      backgroundColor: StudioColors.codeBg,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      padding: 12,
      marginBottom: 12,
    },
    telemetryHeadline: {
      color: StudioColors.codeText,
      fontFamily: MonoFont,
      fontSize: 11.5,
      fontWeight: "800",
      lineHeight: 17,
      marginBottom: 10,
    },
    metricsList: {
      gap: 9,
    },
    metricRow: {
      gap: 4,
    },
    metricLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    metricLabel: {
      color: StudioColors.codeMuted,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "700",
    },
    metricVal: {
      color: StudioColors.codeText,
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
    },
    meterTrack: {
      height: 8,
      backgroundColor: StudioColors.codeSurface,
      borderRadius: 4,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#3A3A35",
    },
    meterFill: {
      height: "100%",
      borderRadius: 3,
    },
    slaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    slaCheckPill: {
      flexGrow: 1,
      minWidth: 125,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
    },
    slaCheckPass: {
      backgroundColor: "rgba(110, 231, 183, 0.16)",
      borderColor: StudioColors.mint,
    },
    slaCheckFail: {
      backgroundColor: "rgba(255, 107, 107, 0.14)",
      borderColor: StudioColors.coral,
    },
    slaCheckStatus: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 9.5,
      letterSpacing: 0.5,
    },
    slaCheckName: {
      color: colors.textPrimary,
      fontSize: 11.5,
      fontWeight: "800",
      marginTop: 2,
    },
    slaCheckMeta: {
      color: colors.textSecondary,
      fontFamily: MonoFont,
      fontSize: 10,
      marginTop: 2,
    },
    footerActions: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 10,
    },
    actionBtn: {
      backgroundColor: StudioColors.lime,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...HardShadowSm,
    },
    actionBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 10.5,
    },
    secondaryBtn: {
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
    },
    secondaryBtnText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontWeight: "900",
      fontSize: 10.5,
    },
    tradeoffNote: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
  });
}
