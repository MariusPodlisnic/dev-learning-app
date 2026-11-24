import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  ALGO_RACE_MATCHUPS,
  type AlgoRaceMatchupId,
  buildAlgorithmRace,
  type CustomArrayPresetKind,
  generatePresetArray,
  parseCustomNumberArray,
  type RaceFrame,
} from "../utils/algoRaceEngine";
import { playKeyClick, playVictoryFanfare } from "../utils/soundEffects";
import { StudioIcon, Text } from "./StudioIcon";

interface CustomAlgoInputBarProps {
  arrayText: string;
  onChangeArrayText: (val: string) => void;
  showTarget?: boolean;
  targetLabel?: string;
  targetText?: string;
  onChangeTargetText?: (val: string) => void;
  errorText?: string | null;
  onApply: () => void;
  onGeneratePreset: (kind: CustomArrayPresetKind) => void;
}

export function CustomAlgoInputBar({
  arrayText,
  onChangeArrayText,
  showTarget = false,
  targetLabel = "TARGET",
  targetText = "",
  onChangeTargetText,
  errorText = null,
  onApply,
  onGeneratePreset,
}: CustomAlgoInputBarProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View testID="algo-custom-input-bar" style={styles.inputBarWrap}>
      <View style={styles.inputTopRow}>
        <Text style={styles.inputLabel}>TRY YOUR OWN DATA:</Text>
        <View style={styles.generatorRow}>
          {(
            [
              { kind: "random" as const, label: "🎲 RANDOM" },
              { kind: "reversed" as const, label: "📉 REVERSED" },
              { kind: "nearly_sorted" as const, label: "📈 NEARLY SORTED" },
            ] as const
          ).map((g) => (
            <Pressable
              key={g.kind}
              accessibilityRole="button"
              accessibilityLabel={`Generate ${g.kind} dataset`}
              style={styles.genChip}
              onPress={() => {
                playKeyClick();
                onGeneratePreset(g.kind);
              }}
            >
              <Text style={styles.genChipText}>{g.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputControlsRow}>
        <TextInput
          accessibilityLabel="Custom comma-separated array numbers"
          value={arrayText}
          onChangeText={onChangeArrayText}
          placeholder="e.g. 42, 7, 19, 3, 88, 12"
          placeholderTextColor="#64748B"
          style={styles.arrayTextInput}
          onSubmitEditing={onApply}
        />

        {showTarget && onChangeTargetText ? (
          <View style={styles.targetInputGroup}>
            <Text style={styles.targetMiniLabel}>{targetLabel}:</Text>
            <TextInput
              accessibilityLabel={`Custom ${targetLabel} number`}
              value={targetText}
              onChangeText={onChangeTargetText}
              placeholder="48"
              placeholderTextColor="#64748B"
              style={styles.targetTextInput}
              onSubmitEditing={onApply}
            />
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Apply custom algorithm dataset"
          style={({ pressed }) => [
            styles.applyBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onApply();
          }}
        >
          <Text style={styles.applyBtnText}>APPLY →</Text>
        </Pressable>
      </View>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

function RaceLaneCard({
  name,
  bigO,
  accent,
  frame,
  isWinner,
}: {
  name: string;
  bigO: string;
  accent: string;
  frame: RaceFrame;
  isWinner: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  const maxVal = Math.max(1, ...frame.arr.map((n) => Math.abs(n)));

  return (
    <View
      style={[
        styles.laneCard,
        frame.finished && { borderColor: isWinner ? StudioColors.yellow : accent },
      ]}
    >
      <View style={styles.laneHeader}>
        <View style={styles.laneTitleGroup}>
          <Text style={styles.laneName}>{name}</Text>
          <View style={[styles.bigOBadge, { backgroundColor: accent }]}>
            <Text style={styles.bigOBadgeText}>{bigO}</Text>
          </View>
        </View>

        <View style={styles.opsPill}>
          <Text style={styles.opsPillText}>{frame.opsCount} OPS</Text>
        </View>
      </View>

      {frame.finished ? (
        <View
          style={[
            styles.finishBanner,
            {
              backgroundColor: isWinner
                ? StudioColors.yellow
                : "rgba(255,255,255,0.09)",
            },
          ]}
        >
          <Text
            style={[
              styles.finishBannerText,
              { color: isWinner ? StudioColors.ink : "#F8FAFC" },
            ]}
          >
            {isWinner
              ? `🏆 WINNER · DONE IN ${frame.opsCount} OPS!`
              : `✓ FINISHED · ${frame.opsCount} OPS`}
          </Text>
        </View>
      ) : null}

      <View style={styles.barsStage}>
        {frame.arr.map((val, idx) => {
          const isDone = frame.doneIndices.includes(idx);
          const isActive = frame.activeIndices.includes(idx);
          const isHi = frame.highlightIndices.includes(idx);
          const hPct = Math.max(15, Math.round((Math.abs(val) / maxVal) * 100));
          const barColor = isDone
            ? accent
            : isActive
              ? StudioColors.yellow
              : isHi
                ? "#38BDF8"
                : "#334155";
          return (
            <View key={`bar_${idx}`} style={styles.barCol}>
              <Text style={styles.barValueText}>{val}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${hPct}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.laneStatusText} numberOfLines={1}>
        {frame.statusText}
      </Text>
    </View>
  );
}

export function AlgorithmRaceArena() {
  const styles = useThemedStyles(createStyles);
  const [matchupId, setMatchupId] = useState<AlgoRaceMatchupId>(
    "quicksort_vs_bubble",
  );
  const spec =
    ALGO_RACE_MATCHUPS.find((m) => m.id === matchupId) ||
    ALGO_RACE_MATCHUPS[0];

  const [activeArray, setActiveArray] = useState<number[]>(() => [
    ...spec.defaultArray,
  ]);
  const [activeTarget, setActiveTarget] = useState<number>(spec.defaultTarget);
  const [arrayInput, setArrayInput] = useState<string>(() =>
    spec.defaultArray.join(", "),
  );
  const [targetInput, setTargetInput] = useState<string>(() =>
    String(spec.defaultTarget),
  );
  const [inputError, setInputError] = useState<string | null>(null);

  const [tick, setTick] = useState<number>(0);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [tickMs, setTickMs] = useState<number>(220);

  const race = useMemo(
    () => buildAlgorithmRace(matchupId, activeArray, activeTarget),
    [matchupId, activeArray, activeTarget],
  );

  const safeTick = Math.min(tick, race.maxTicks - 1);
  const leftFrame =
    race.leftFrames[Math.min(safeTick, race.leftFrames.length - 1)];
  const rightFrame =
    race.rightFrames[Math.min(safeTick, race.rightFrames.length - 1)];
  const bothFinished = safeTick >= race.maxTicks - 1;

  useEffect(() => {
    if (!isRacing) return;
    const id = setInterval(() => {
      setTick((prev) => {
        if (prev + 1 >= race.maxTicks) {
          setIsRacing(false);
          playVictoryFanfare();
          return race.maxTicks - 1;
        }
        return prev + 1;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [isRacing, race.maxTicks, tickMs]);

  const handleSelectMatchup = (id: AlgoRaceMatchupId) => {
    playKeyClick();
    const nextSpec =
      ALGO_RACE_MATCHUPS.find((m) => m.id === id) || ALGO_RACE_MATCHUPS[0];
    setMatchupId(id);
    setIsRacing(false);
    setTick(0);
    setActiveArray([...nextSpec.defaultArray]);
    setActiveTarget(nextSpec.defaultTarget);
    setArrayInput(nextSpec.defaultArray.join(", "));
    setTargetInput(String(nextSpec.defaultTarget));
    setInputError(null);
  };

  const handleApplyInput = () => {
    const parsed = parseCustomNumberArray(arrayInput, {
      minLen: 5,
      maxLen: 14,
      sortAscending: matchupId === "binary_vs_linear",
    });
    if (parsed.error) {
      setInputError(parsed.error);
      return;
    }
    const nextTarget = Number.isFinite(Number(targetInput))
      ? Math.round(Number(targetInput))
      : spec.defaultTarget;
    setInputError(null);
    setIsRacing(false);
    setTick(0);
    setActiveArray(parsed.values);
    setActiveTarget(nextTarget);
    setArrayInput(parsed.values.join(", "));
  };

  const handleGeneratePreset = (kind: CustomArrayPresetKind) => {
    const raw = generatePresetArray(kind, 10);
    const vals =
      matchupId === "binary_vs_linear" ? [...raw].sort((a, b) => a - b) : raw;
    const autoTarget =
      matchupId === "binary_vs_linear"
        ? vals[vals.length - 2]
        : matchupId === "hashmap_vs_bruteforce"
          ? vals[1] + vals[vals.length - 2]
          : spec.defaultTarget;
    setInputError(null);
    setIsRacing(false);
    setTick(0);
    setActiveArray(vals);
    setActiveTarget(autoTarget);
    setArrayInput(vals.join(", "));
    setTargetInput(String(autoTarget));
  };

  const leftOpsFinal =
    race.leftFrames[race.leftFrames.length - 1]?.opsCount || 1;
  const rightOpsFinal =
    race.rightFrames[race.rightFrames.length - 1]?.opsCount || 1;
  const leftWins = leftOpsFinal <= rightOpsFinal;

  return (
    <View testID="algorithm-race-arena" style={styles.arenaCard}>
      {/* Matchup Tabs */}
      <View style={styles.matchupRow}>
        {ALGO_RACE_MATCHUPS.map((m) => {
          const selected = m.id === matchupId;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={`Select race ${m.title}`}
              style={[
                styles.matchupTab,
                selected && {
                  backgroundColor: m.leftAccent,
                  borderColor: StudioColors.ink,
                  ...HardShadowSm,
                },
              ]}
              onPress={() => handleSelectMatchup(m.id)}
            >
              <Text
                style={[
                  styles.matchupTabText,
                  selected && { color: StudioColors.ink },
                ]}
              >
                🏁 {m.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.matchupSubtitle}>{spec.subtitle}</Text>

      {/* Custom Playground Data Strip */}
      <CustomAlgoInputBar
        arrayText={arrayInput}
        onChangeArrayText={setArrayInput}
        showTarget={spec.needsTarget}
        targetLabel={matchupId === "hashmap_vs_bruteforce" ? "SUM" : "FIND"}
        targetText={targetInput}
        onChangeTargetText={setTargetInput}
        errorText={inputError}
        onApply={handleApplyInput}
        onGeneratePreset={handleGeneratePreset}
      />

      {/* Synchronized Race Controls */}
      <View style={styles.controlsBar}>
        <View style={styles.controlsLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRacing ? "Pause algorithm race" : "Start algorithm race"}
            style={[styles.startRaceBtn, isRacing && { backgroundColor: StudioColors.yellow }]}
            onPress={() => {
              playKeyClick();
              if (!isRacing && bothFinished) {
                setTick(0);
                setIsRacing(true);
                return;
              }
              setIsRacing((p) => !p);
            }}
          >
            <StudioIcon name={isRacing ? "bolt" : "mission_play"} size={15} />
            <Text style={styles.startRaceBtnText}>
              {isRacing
                ? "⏸ PAUSE RACE"
                : bothFinished
                  ? "↻ RACE AGAIN"
                  : "▶ START RACE"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Step race forward"
            style={styles.secondaryRaceBtn}
            onPress={() => {
              playKeyClick();
              setIsRacing(false);
              setTick((prev) => (prev + 1 < race.maxTicks ? prev + 1 : 0));
            }}
          >
            <Text style={styles.secondaryRaceBtnText}>STEP →</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset algorithm race"
            style={styles.secondaryRaceBtn}
            onPress={() => {
              playKeyClick();
              setIsRacing(false);
              setTick(0);
            }}
          >
            <Text style={styles.secondaryRaceBtnText}>↺ RESET</Text>
          </Pressable>
        </View>

        <View style={styles.speedRow}>
          <Text style={styles.speedLabel}>SPEED:</Text>
          {(
            [
              { ms: 420, label: "1×" },
              { ms: 220, label: "2×" },
              { ms: 95, label: "4× TURBO" },
            ] as const
          ).map((sp) => {
            const active = tickMs === sp.ms;
            return (
              <Pressable
                key={sp.label}
                style={[styles.speedChip, active && styles.speedChipActive]}
                onPress={() => {
                  playKeyClick();
                  setTickMs(sp.ms);
                }}
              >
                <Text
                  style={[
                    styles.speedChipText,
                    active && { color: StudioColors.ink },
                  ]}
                >
                  {sp.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Side-by-Side Race Lanes */}
      <View style={styles.lanesRow}>
        <RaceLaneCard
          name={spec.leftName}
          bigO={spec.leftBigO}
          accent={spec.leftAccent}
          frame={leftFrame}
          isWinner={leftWins}
        />
        <RaceLaneCard
          name={spec.rightName}
          bigO={spec.rightBigO}
          accent={spec.rightAccent}
          frame={rightFrame}
          isWinner={!leftWins}
        />
      </View>

      {/* Live Big-O Speedup Takeaway Callout */}
      <View style={styles.takeawayBanner}>
        <Text style={styles.takeawayText}>
          ⚡{" "}
          {leftWins
            ? `${spec.leftName} (${spec.leftBigO}) completes this dataset in ${leftOpsFinal} ops vs. ${rightOpsFinal} ops for ${spec.rightName} — a ${race.speedupRatio}× operation advantage!`
            : `On this tiny sorted/lucky case, ${spec.rightName} finished in ${rightOpsFinal} ops vs. ${leftOpsFinal} ops — click 📉 REVERSED to see ${spec.leftBigO} crush ${spec.rightBigO}!`}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    inputBarWrap: {
      backgroundColor: colors.bg,
      borderWidth: 1.8,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 11,
      gap: 8,
    },
    inputTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    inputLabel: {
      color: colors.textMuted,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
      letterSpacing: 0.6,
    },
    generatorRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    genChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    genChipText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "900",
    },
    inputControlsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    arrayTextInput: {
      flex: 1,
      minWidth: 180,
      backgroundColor: colors.surface,
      borderWidth: 1.6,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 11.5,
      fontWeight: "700",
    },
    targetInputGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    targetMiniLabel: {
      color: colors.textSecondary,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    targetTextInput: {
      width: 58,
      backgroundColor: colors.surface,
      borderWidth: 1.6,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 7,
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 11.5,
      fontWeight: "800",
      textAlign: "center",
    },
    applyBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.8,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    applyBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
    },
    errorText: {
      color: StudioColors.coral,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "800",
    },
    arenaCard: {
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      gap: 13,
      ...HardShadow,
    },
    matchupRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    matchupTab: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 9,
      borderWidth: 1.8,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    matchupTabText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
    },
    matchupSubtitle: {
      color: colors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    controlsBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
    },
    controlsLeft: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    startRaceBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 13,
      paddingVertical: 8,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    startRaceBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
    },
    secondaryRaceBtn: {
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1.6,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    secondaryRaceBtnText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
    },
    speedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    speedLabel: {
      color: colors.textMuted,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    speedChip: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 6,
      borderWidth: 1.4,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    speedChipActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    speedChipText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    lanesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    laneCard: {
      flex: 1,
      minWidth: 270,
      backgroundColor: "#090D18",
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 13,
      padding: 13,
      gap: 10,
    },
    laneHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    laneTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 7,
    },
    laneName: {
      color: "#F8FAFC",
      fontSize: 15,
      fontWeight: "900",
    },
    bigOBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 5,
      borderWidth: 1.2,
      borderColor: StudioColors.ink,
    },
    bigOBadgeText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    opsPill: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    opsPillText: {
      color: StudioColors.yellow,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
    },
    finishBanner: {
      borderRadius: 7,
      paddingVertical: 5,
      paddingHorizontal: 9,
      alignItems: "center",
    },
    finishBannerText: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    barsStage: {
      height: 154,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 5,
      paddingTop: 12,
      paddingHorizontal: 2,
    },
    barCol: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 4,
    },
    barValueText: {
      color: "#CBD5E1",
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "800",
    },
    barTrack: {
      flex: 1,
      width: "100%",
      justifyContent: "flex-end",
      backgroundColor: "rgba(255,255,255,0.04)",
      borderRadius: 5,
      overflow: "hidden",
    },
    barFill: {
      width: "100%",
      borderRadius: 5,
      minHeight: 8,
    },
    laneStatusText: {
      color: "#94A3B8",
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "700",
    },
    takeawayBanner: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 11,
    },
    takeawayText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
    },
  });
