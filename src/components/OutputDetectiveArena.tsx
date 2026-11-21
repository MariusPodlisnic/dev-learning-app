import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  buildDetectiveSession,
  computeDetectiveXp,
  type DetectiveTrack,
} from "../utils/outputDetective";
import {
  playErrorBuzz,
  playKeyClick,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";
import { renderHighlightedPython } from "./FormattedText";
import { StudioIcon, type StudioIconName, Text } from "./StudioIcon";

interface OutputDetectiveArenaProps {
  isPremium: boolean;
  onRequirePro: () => void;
  onAwardDetectiveXp: (xpEarned: number) => void;
  onBackToArcade?: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const TRACK_FILTER_ITEMS: readonly {
  id: DetectiveTrack;
  label: string;
  icon: StudioIconName;
}[] = [
  { id: "all", label: "ALL CASES", icon: "star" },
  { id: "python_basics", label: "PYTHON", icon: "python" },
  { id: "algorithms", label: "ALGORITHMS", icon: "algo" },
  { id: "system_design", label: "SYS DESIGN", icon: "arch" },
];

export default function OutputDetectiveArena({
  isPremium,
  onRequirePro,
  onAwardDetectiveXp,
  onBackToArcade,
}: OutputDetectiveArenaProps) {
  const styles = useThemedStyles(createStyles);

  const [track, setTrack] = useState<DetectiveTrack>("all");
  const [sessionSeed, setSessionSeed] = useState<number>(20261121);
  const [caseIdx, setCaseIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [isSummary, setIsSummary] = useState<boolean>(false);
  const [awardedXp, setAwardedXp] = useState<number>(0);

  const session = useMemo(
    () =>
      buildDetectiveSession({
        track,
        isPremium,
        count: 6,
        seed: sessionSeed,
      }),
    [isPremium, sessionSeed, track],
  );

  const activeCase = session.cases[caseIdx] || session.cases[0];
  const totalCases = session.cases.length;

  function startFreshCasebook(nextTrack: DetectiveTrack = track) {
    playKeyClick();
    setTrack(nextTrack);
    setSessionSeed((prev) => prev + 37);
    setCaseIdx(0);
    setSelectedOpt(null);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setIsSummary(false);
    setAwardedXp(0);
  }

  function handlePickOption(optIdx: number) {
    if (selectedOpt !== null || !activeCase) return;
    setSelectedOpt(optIdx);
    const isHit = optIdx === activeCase.correctIndex;
    if (isHit) {
      playSuccessChime();
      const nextStreak = streak + 1;
      setCorrectCount((prev) => prev + 1);
      setStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));
    } else {
      playErrorBuzz();
      setStreak(0);
    }
  }

  function handleAdvance() {
    playKeyClick();
    if (caseIdx + 1 < totalCases) {
      setCaseIdx((prev) => prev + 1);
      setSelectedOpt(null);
      return;
    }

    const earned = computeDetectiveXp({
      correctCount,
      totalCount: totalCases,
      maxStreak,
    });
    setAwardedXp(earned);
    setIsSummary(true);
    if (earned > 0) {
      playVictoryFanfare();
      onAwardDetectiveXp(earned);
    }
  }

  const accuracyPct =
    totalCases > 0 ? Math.round((correctCount / totalCases) * 100) : 0;
  const detectiveRank =
    accuracyPct === 100
      ? "S-RANK MASTER SLEUTH"
      : accuracyPct >= 67
        ? "A-RANK LEAD DETECTIVE"
        : "B-RANK JUNIOR SLEUTH";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Top Casebook Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconBadge}>
                <StudioIcon name="nav_detective" size={24} />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.eyebrow}>
                  ARCADE CART-04 · CODE READING SPRINT
                </Text>
                <Text style={styles.title}>Output Detective</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <StudioIcon name="flame" size={14} />
                <Text style={styles.statPillText}>{streak} STREAK</Text>
              </View>
              <View style={styles.statPill}>
                <StudioIcon name="check_box" size={14} />
                <Text style={styles.statPillText}>
                  {correctCount}/{totalCases} SOLVED
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.trackRow}>
            {TRACK_FILTER_ITEMS.map((item) => {
              const active = track === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter detective cases by ${item.label}`}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.trackPill,
                    active && styles.trackPillActive,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => startFreshCasebook(item.id)}
                >
                  <StudioIcon name={item.icon} size={13} />
                  <Text
                    style={[
                      styles.trackPillText,
                      active && styles.trackPillTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            {!isPremium && session.lockedCount > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Unlock Pro detective cases"
                style={({ pressed }) => [
                  styles.proUpsellPill,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  onRequirePro();
                }}
              >
                <StudioIcon name="lock" size={13} />
                <Text style={styles.proUpsellText}>
                  +{session.lockedCount} PRO CASES
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {isSummary ? (
          /* Round Summary Card */
          <View style={styles.summaryCard}>
            <View style={styles.summaryRibbon} />
            <View style={styles.summaryBody}>
              <View style={styles.rankPill}>
                <StudioIcon name="trophy" size={16} />
                <Text style={styles.rankPillText}>{detectiveRank}</Text>
              </View>
              <Text style={styles.summaryHeadline}>
                Casebook Closed: {correctCount}/{totalCases} Solved ({accuracyPct}%)
              </Text>
              <Text style={styles.summarySub}>
                Mental tracing sharpens debugging instincts faster than guessing in
                a terminal.
              </Text>

              <View style={styles.summaryMetricsRow}>
                <View
                  style={[
                    styles.summaryMetricBox,
                    { backgroundColor: StudioColors.lime },
                  ]}
                >
                  <Text style={styles.summaryMetricVal}>+{awardedXp} XP</Text>
                  <Text style={styles.summaryMetricLabel}>XP EARNED</Text>
                </View>
                <View
                  style={[
                    styles.summaryMetricBox,
                    { backgroundColor: StudioColors.yellow },
                  ]}
                >
                  <Text style={styles.summaryMetricVal}>{maxStreak}x</Text>
                  <Text style={styles.summaryMetricLabel}>BEST STREAK</Text>
                </View>
                <View
                  style={[
                    styles.summaryMetricBox,
                    { backgroundColor: StudioColors.mint },
                  ]}
                >
                  <Text style={styles.summaryMetricVal}>{accuracyPct}%</Text>
                  <Text style={styles.summaryMetricLabel}>ACCURACY</Text>
                </View>
              </View>

              <View style={styles.summaryBtnsRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Start new detective casebook"
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => startFreshCasebook(track)}
                >
                  <Text style={styles.primaryBtnText}>
                    PLAY NEW CASEBOOK ↻
                  </Text>
                </Pressable>

                {onBackToArcade && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Return to Arcade Lobby"
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      pressed && { transform: [{ translateY: 1 }] },
                    ]}
                    onPress={() => {
                      playKeyClick();
                      onBackToArcade();
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>← ARCADE LOBBY</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        ) : activeCase ? (
          /* Active Investigation Case Card */
          <View style={styles.caseCard}>
            <View style={styles.caseMetaRow}>
              <View style={styles.caseBadgeGroup}>
                <View style={styles.caseNumberPill}>
                  <Text style={styles.caseNumberText}>
                    CASE {caseIdx + 1} OF {totalCases}
                  </Text>
                </View>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>
                    {activeCase.category}
                  </Text>
                </View>
                <View style={styles.difficultyPill}>
                  <Text style={styles.difficultyPillText}>
                    {activeCase.difficulty}
                  </Text>
                </View>
              </View>
              <Text style={styles.caseTitle}>{activeCase.title}</Text>
            </View>

            {/* Line-Numbered Python Evidence Terminal */}
            <View style={styles.codeTerminal}>
              <View style={styles.codeTerminalTop}>
                <View style={styles.terminalDots}>
                  <View
                    style={[
                      styles.terminalDot,
                      { backgroundColor: StudioColors.coral },
                    ]}
                  />
                  <View
                    style={[
                      styles.terminalDot,
                      { backgroundColor: StudioColors.yellow },
                    ]}
                  />
                  <View
                    style={[
                      styles.terminalDot,
                      { backgroundColor: StudioColors.lime },
                    ]}
                  />
                </View>
                <Text style={styles.codeTerminalTitle}>
                  evidence_{String(caseIdx + 1).padStart(2, "0")}.py
                </Text>
                <Text style={styles.codeTerminalLang}>READ &amp; TRACE</Text>
              </View>

              <View style={styles.codeLinesWrap}>
                {activeCase.code.split("\n").map((line, idx) => {
                  const lineNum = idx + 1;
                  const isClueLine = activeCase.highlightLine === lineNum;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.codeLineRow,
                        isClueLine && styles.codeLineRowHighlight,
                      ]}
                    >
                      <Text style={styles.lineNumText}>
                        {String(lineNum).padStart(2, "0")}
                      </Text>
                      <Text style={styles.codeLineText}>
                        {renderHighlightedPython(line)}
                      </Text>
                      {isClueLine && (
                        <Text style={styles.clueLineTag}>← OUTPUT</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Investigation Prompt */}
            <View style={styles.questionBanner}>
              <StudioIcon name="search" size={16} />
              <Text style={styles.questionText}>{activeCase.question}</Text>
            </View>

            {/* 2x2 Option Grid */}
            <View style={styles.optionsGrid}>
              {activeCase.options.map((opt, idx) => {
                const isPicked = selectedOpt === idx;
                const isAnswer = idx === activeCase.correctIndex;
                const revealed = selectedOpt !== null;

                return (
                  <Pressable
                    key={idx}
                    accessibilityRole="button"
                    accessibilityLabel={`Predict option ${OPTION_LETTERS[idx]}: ${opt}`}
                    disabled={revealed}
                    style={({ pressed }) => [
                      styles.optionBtn,
                      revealed && isAnswer && styles.optionBtnCorrect,
                      revealed && isPicked && !isAnswer && styles.optionBtnWrong,
                      pressed && !revealed && { transform: [{ translateY: 1 }] },
                    ]}
                    onPress={() => handlePickOption(idx)}
                  >
                    <View
                      style={[
                        styles.optionLetterBox,
                        revealed &&
                          (isAnswer || isPicked) &&
                          styles.optionLetterBoxInk,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetterText,
                          revealed &&
                            (isAnswer || isPicked) &&
                            styles.optionLetterTextLight,
                        ]}
                      >
                        {OPTION_LETTERS[idx]}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionValueText,
                        revealed &&
                          (isAnswer || isPicked) &&
                          styles.optionValueTextInk,
                      ]}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Revealed Step-by-Step Trace Breakdown */}
            {selectedOpt !== null && (
              <View style={styles.traceBox}>
                <View style={styles.traceHeaderRow}>
                  <View style={styles.traceTitleGroup}>
                    <StudioIcon
                      name={
                        selectedOpt === activeCase.correctIndex
                          ? "check_box"
                          : "bulb"
                      }
                      size={16}
                    />
                    <Text style={styles.traceTitle}>
                      {selectedOpt === activeCase.correctIndex
                        ? "CASE CRACKED! STEP-BY-STEP TRACE"
                        : "TRACE BREAKDOWN — HERE'S WHAT PYTHON DID"}
                    </Text>
                  </View>
                </View>

                <View style={styles.traceStepsList}>
                  {activeCase.traceSteps.map((step, sIdx) => (
                    <Text key={sIdx} style={styles.traceStepText}>
                      {sIdx + 1}. {step}
                    </Text>
                  ))}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    caseIdx + 1 < totalCases
                      ? "Next detective case"
                      : "Finish casebook summary"
                  }
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={handleAdvance}
                >
                  <Text style={styles.primaryBtnText}>
                    {caseIdx + 1 < totalCases
                      ? "NEXT CASE →"
                      : "VIEW CASEBOOK SUMMARY →"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 42,
      alignItems: "center",
    },
    container: {
      width: "100%",
      maxWidth: 880,
      gap: 14,
    },
    headerCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 15,
      padding: 15,
      gap: 12,
      ...HardShadow,
    },
    headerTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
    },
    headerTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },
    headerIconBadge: {
      width: 42,
      height: 42,
      borderRadius: 11,
      backgroundColor: "#38BDF8",
      borderWidth: 2,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    headerTextCol: {
      gap: 2,
    },
    eyebrow: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    title: {
      color: StudioColors.textPrimary,
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      minHeight: 30,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statPillText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    trackRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 7,
    },
    trackPill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 31,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    trackPillActive: {
      backgroundColor: "#38BDF8",
      borderColor: StudioColors.ink,
      borderWidth: 2,
      ...HardShadowSm,
    },
    trackPillText: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    trackPillTextActive: {
      color: StudioColors.ink,
    },
    proUpsellPill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      minHeight: 31,
      backgroundColor: StudioColors.pink,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    proUpsellText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    caseCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 15,
      padding: 16,
      gap: 13,
      ...HardShadow,
    },
    caseMetaRow: {
      gap: 6,
    },
    caseBadgeGroup: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    caseNumberPill: {
      backgroundColor: "#38BDF8",
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    caseNumberText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    categoryPill: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    categoryPillText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    difficultyPill: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    difficultyPillText: {
      color: StudioColors.textMuted,
      fontSize: 9,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    caseTitle: {
      color: StudioColors.textPrimary,
      fontSize: 18,
      fontWeight: "900",
    },
    codeTerminal: {
      backgroundColor: "#14161F",
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 12,
      overflow: "hidden",
    },
    codeTerminalTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: "#1E2230",
      borderBottomWidth: 1.5,
      borderBottomColor: "#2E344A",
    },
    terminalDots: {
      flexDirection: "row",
      gap: 5,
    },
    terminalDot: {
      width: 9,
      height: 9,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: "#111111",
    },
    codeTerminalTitle: {
      color: "#E2E8F0",
      fontSize: 10.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    codeTerminalLang: {
      color: "#38BDF8",
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    codeLinesWrap: {
      paddingVertical: 10,
    },
    codeLineRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 3,
      gap: 12,
    },
    codeLineRowHighlight: {
      backgroundColor: "rgba(56, 189, 248, 0.14)",
      borderLeftWidth: 3,
      borderLeftColor: "#38BDF8",
      paddingLeft: 9,
    },
    lineNumText: {
      color: "#64748B",
      fontSize: 12,
      fontWeight: "700",
      fontFamily: MonoFont,
      width: 22,
    },
    codeLineText: {
      flex: 1,
      color: "#F8FAFC",
      fontSize: 13.5,
      lineHeight: 20,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    clueLineTag: {
      color: "#FFDE59",
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    questionBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    questionText: {
      color: StudioColors.textPrimary,
      fontSize: 14,
      fontWeight: "900",
      flex: 1,
    },
    optionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    optionBtn: {
      flex: 1,
      minWidth: 210,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: StudioColors.bg,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 11,
      paddingHorizontal: 12,
      paddingVertical: 12,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    optionBtnCorrect: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    optionBtnWrong: {
      backgroundColor: StudioColors.coral,
      borderColor: StudioColors.ink,
    },
    optionLetterBox: {
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    optionLetterBoxInk: {
      backgroundColor: StudioColors.ink,
      borderColor: StudioColors.ink,
    },
    optionLetterText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    optionLetterTextLight: {
      color: "#FFFFFF",
    },
    optionValueText: {
      color: StudioColors.textPrimary,
      fontSize: 14,
      fontWeight: "900",
      fontFamily: MonoFont,
      flex: 1,
    },
    optionValueTextInk: {
      color: StudioColors.ink,
    },
    traceBox: {
      backgroundColor: StudioColors.bg,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 12,
      padding: 13,
      gap: 10,
    },
    traceHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    traceTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    traceTitle: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    traceStepsList: {
      gap: 5,
    },
    traceStepText: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "700",
      lineHeight: 18,
    },
    primaryBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 11,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    primaryBtnText: {
      color: StudioColors.ink,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    secondaryBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 11,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    secondaryBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    summaryCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 16,
      overflow: "hidden",
      ...HardShadow,
    },
    summaryRibbon: {
      height: 7,
      backgroundColor: "#38BDF8",
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
    },
    summaryBody: {
      padding: 20,
      alignItems: "center",
      gap: 12,
    },
    rankPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    rankPillText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    summaryHeadline: {
      color: StudioColors.textPrimary,
      fontSize: 22,
      fontWeight: "900",
      textAlign: "center",
    },
    summarySub: {
      color: StudioColors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
      maxWidth: 520,
    },
    summaryMetricsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      width: "100%",
      marginTop: 4,
    },
    summaryMetricBox: {
      flex: 1,
      minWidth: 140,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 11,
      paddingVertical: 12,
      alignItems: "center",
      gap: 2,
      ...HardShadowSm,
    },
    summaryMetricVal: {
      color: StudioColors.ink,
      fontSize: 20,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    summaryMetricLabel: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    summaryBtnsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 6,
    },
  });
