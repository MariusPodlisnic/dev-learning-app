import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
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
import type { TestCaseResult } from "../types/lesson";
import { computePythonAutoEdit } from "../utils/editorHelpers";
import {
  calculateInterviewXpReward,
  estimateInterviewComplexity,
  formatInterviewClock,
  getInterviewLoop,
  getVerdictBadgeLabel,
  gradeMockInterviewSession,
  type InterviewLoopId,
  type InterviewScorecard,
  MOCK_INTERVIEW_LOOPS,
  type MockInterviewRecordsMap,
  readMockInterviewRecords,
  type RoundSubmissionSnapshot,
  saveMockInterviewRecord,
} from "../utils/mockInterview";
import {
  playErrorBuzz,
  playKeyClick,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";
import {
  classifyTypingKey,
  playMechanicalKeystroke,
} from "../utils/typingSounds";
import { StudioIcon, Text } from "./StudioIcon";

interface MockInterviewArenaProps {
  pyodideReady: boolean;
  isPremium: boolean;
  onRequirePro: () => void;
  onVerifyCandidateCode: (
    userCode: string,
    harness: string,
  ) => Promise<{
    allPassed: boolean;
    results: TestCaseResult[];
    stdout: string;
    error?: string;
  }>;
  onAwardInterviewXp: (xpEarned: number) => void;
}

type InterviewPhase = "lobby" | "active" | "scorecard";

export default function MockInterviewArena({
  pyodideReady,
  isPremium,
  onRequirePro,
  onVerifyCandidateCode,
  onAwardInterviewXp,
}: MockInterviewArenaProps) {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth > 0 && windowWidth < 860;

  const [phase, setPhase] = useState<InterviewPhase>("lobby");
  const [selectedLoopId, setSelectedLoopId] = useState<InterviewLoopId>(
    "intern_backend_loop",
  );
  const [records, setRecords] = useState<MockInterviewRecordsMap>(() =>
    readMockInterviewRecords(),
  );

  // Active interview session state
  const [activeRoundIdx, setActiveRoundIdx] = useState<0 | 1>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [drafts, setDrafts] = useState<[string, string]>(["", ""]);
  const [resultsByRound, setResultsByRound] = useState<
    [TestCaseResult[], TestCaseResult[]]
  >([[], []]);
  const [passedByRound, setPassedByRound] = useState<[boolean, boolean]>([
    false,
    false,
  ]);
  const [errorsByRound, setErrorsByRound] = useState<
    [string | null, string | null]
  >([null, null]);
  const [nudgesByRound, setNudgesByRound] = useState<[boolean, boolean]>([
    false,
    false,
  ]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // Final scorecard state
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);
  const [lastXpEarned, setLastXpEarned] = useState<number>(0);

  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const activeLoop = useMemo(
    () => getInterviewLoop(selectedLoopId),
    [selectedLoopId],
  );
  const activeRound = activeLoop.rounds[activeRoundIdx];
  const activeCode = drafts[activeRoundIdx];
  const activeResults = resultsByRound[activeRoundIdx];
  const activeError = errorsByRound[activeRoundIdx];
  const activeUsedNudge = nudgesByRound[activeRoundIdx];

  const liveComplexity = useMemo(
    () => estimateInterviewComplexity(activeCode),
    [activeCode],
  );

  const offersEarnedCount = useMemo(
    () =>
      Object.values(records).filter(
        (rec) =>
          rec &&
          (rec.bestVerdict === "strong_hire" || rec.bestVerdict === "hire"),
      ).length,
    [records],
  );

  const finalizePacket = useCallback(
    (finalSecondsLeft: number) => {
      const loop = getInterviewLoop(selectedLoopId);
      const snapshots: [RoundSubmissionSnapshot, RoundSubmissionSnapshot] = [
        {
          code: drafts[0],
          results: resultsByRound[0],
          allPassed: passedByRound[0],
          usedNudge: nudgesByRound[0],
        },
        {
          code: drafts[1],
          results: resultsByRound[1],
          allPassed: passedByRound[1],
          usedNudge: nudgesByRound[1],
        },
      ];
      const computed = gradeMockInterviewSession(
        loop,
        snapshots,
        finalSecondsLeft,
      );
      const prevRecord = records[selectedLoopId];
      const xpEarned = calculateInterviewXpReward(loop, computed, prevRecord);
      const updatedRecords = saveMockInterviewRecord(selectedLoopId, computed);

      setRecords(updatedRecords);
      setScorecard(computed);
      setLastXpEarned(xpEarned);
      setPhase("scorecard");

      if (xpEarned > 0) {
        onAwardInterviewXp(xpEarned);
      }
      if (
        computed.verdict === "strong_hire" ||
        computed.verdict === "hire"
      ) {
        playVictoryFanfare();
      } else if (computed.verdict === "lean_hire") {
        playSuccessChime();
      }
    },
    [
      drafts,
      nudgesByRound,
      onAwardInterviewXp,
      passedByRound,
      records,
      resultsByRound,
      selectedLoopId,
    ],
  );

  const finalizeRef = useRef(finalizePacket);
  useEffect(() => {
    finalizeRef.current = finalizePacket;
  }, [finalizePacket]);

  // 25:00 live countdown timer while in active interview
  useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => finalizeRef.current(0), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  function startInterviewLoop(loopId: InterviewLoopId) {
    const loop = getInterviewLoop(loopId);
    if (loop.isPro && !isPremium) {
      playKeyClick();
      onRequirePro();
      return;
    }
    playKeyClick();
    setSelectedLoopId(loopId);
    setActiveRoundIdx(0);
    setSecondsRemaining(loop.durationSec);
    setDrafts([loop.rounds[0].starterCode, loop.rounds[1].starterCode]);
    setResultsByRound([[], []]);
    setPassedByRound([false, false]);
    setErrorsByRound([null, null]);
    setNudgesByRound([false, false]);
    setScorecard(null);
    setLastXpEarned(0);
    setPhase("active");
  }

  function handleDraftChange(nextText: string) {
    setDrafts((prev) =>
      activeRoundIdx === 0 ? [nextText, prev[1]] : [prev[0], nextText],
    );
  }

  function handleResetCurrentRound() {
    playKeyClick();
    const freshStub = activeLoop.rounds[activeRoundIdx].starterCode;
    handleDraftChange(freshStub);
    setErrorsByRound((prev) =>
      activeRoundIdx === 0 ? [null, prev[1]] : [prev[0], null],
    );
  }

  function handleRequestNudge() {
    playKeyClick();
    setNudgesByRound((prev) =>
      activeRoundIdx === 0 ? [true, prev[1]] : [prev[0], true],
    );
  }

  async function handleRunRoundTests() {
    if (isRunningTests) return;
    playKeyClick();
    setIsRunningTests(true);
    try {
      const verdict = await onVerifyCandidateCode(
        activeCode,
        activeRound.verificationHarness,
      );
      setResultsByRound((prev) =>
        activeRoundIdx === 0
          ? [verdict.results, prev[1]]
          : [prev[0], verdict.results],
      );
      setPassedByRound((prev) =>
        activeRoundIdx === 0
          ? [verdict.allPassed, prev[1]]
          : [prev[0], verdict.allPassed],
      );
      setErrorsByRound((prev) =>
        activeRoundIdx === 0
          ? [verdict.error || null, prev[1]]
          : [prev[0], verdict.error || null],
      );
      if (verdict.allPassed) {
        playSuccessChime();
      } else {
        playErrorBuzz();
      }
    } finally {
      setIsRunningTests(false);
    }
  }

  // =========================================================================
  // PHASE 1: INTERVIEW LOBBY
  // =========================================================================
  if (phase === "lobby") {
    return (
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerCard}>
          <View style={styles.bannerTop}>
            <View style={styles.bannerTitleGroup}>
              <View style={styles.bannerIconBox}>
                <StudioIcon name="briefcase" size={22} />
              </View>
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerKicker}>
                  CART-08 · MOCK TECHNICAL INTERVIEW SIMULATOR
                </Text>
                <Text style={styles.bannerTitle}>
                  25-Minute Engineering Interview Loops
                </Text>
              </View>
            </View>
            <View style={styles.bannerStatsRow}>
              <View style={styles.bannerStatPill}>
                <Text style={styles.bannerStatText}>
                  🏅 {offersEarnedCount}/{MOCK_INTERVIEW_LOOPS.length} OFFERS
                  EARNED
                </Text>
              </View>
              <View style={[styles.bannerStatPill, styles.bannerRulePill]}>
                <Text style={styles.bannerRuleText}>
                  2 ROUNDS · NO SOLUTION PEEKS · 100-PT RUBRIC
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.loopGrid, isNarrow && styles.loopGridNarrow]}>
          {MOCK_INTERVIEW_LOOPS.map((loop) => {
            const locked = loop.isPro && !isPremium;
            const rec = records[loop.id];
            return (
              <View
                key={loop.id}
                style={[
                  styles.loopCard,
                  isNarrow && styles.loopCardNarrow,
                  rec?.bestVerdict === "strong_hire" && {
                    borderColor: loop.accent,
                  },
                ]}
              >
                <View
                  style={[styles.loopRibbon, { backgroundColor: loop.accent }]}
                />
                <View style={styles.loopBody}>
                  <View style={styles.loopMetaRow}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>
                        {loop.levelBadge}
                      </Text>
                    </View>
                    <View style={styles.loopMetaRight}>
                      {rec && (
                        <View style={styles.bestVerdictPill}>
                          <Text style={styles.bestVerdictText}>
                            {getVerdictBadgeLabel(rec.bestVerdict)} ·{" "}
                            {rec.bestScore}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.tierPill,
                          loop.isPro ? styles.tierPillPro : styles.tierPillFree,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tierPillText,
                            loop.isPro
                              ? styles.tierPillTextPro
                              : styles.tierPillTextFree,
                          ]}
                        >
                          {loop.isPro ? (locked ? "🔒 PRO" : "PRO") : "FREE TRY"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.loopTitle}>{loop.title}</Text>
                  <Text style={styles.loopSubtitle}>{loop.subtitle}</Text>

                  <View style={styles.roundPreviewBox}>
                    {loop.rounds.map((r) => (
                      <View key={r.id} style={styles.roundPreviewRow}>
                        <Text style={styles.roundPreviewTag}>
                          R{r.roundNumber}
                        </Text>
                        <Text
                          style={styles.roundPreviewTitle}
                          numberOfLines={1}
                        >
                          {r.title}
                        </Text>
                        <Text style={styles.roundPreviewTarget}>
                          {r.targetComplexity}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.loopFooterRow}>
                    <Text style={styles.loopMetaFoot}>
                      ⏱ 25:00 · UP TO +{loop.baseXp} XP
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Start ${loop.title}`}
                      style={({ pressed }) => [
                        styles.startLoopBtn,
                        { backgroundColor: locked ? StudioColors.yellow : loop.accent },
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                      onPress={() => startInterviewLoop(loop.id)}
                    >
                      <Text style={styles.startLoopBtnText}>
                        {locked ? "UNLOCK PRO →" : "START 25:00 LOOP →"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // =========================================================================
  // PHASE 3: HIRING COMMITTEE SCORECARD
  // =========================================================================
  if (phase === "scorecard" && scorecard) {
    const rubricBars = [
      {
        label: "Correctness & Edge Cases",
        pts: scorecard.correctnessScore,
        max: 45,
        color: StudioColors.mint,
      },
      {
        label: "Big-O Target Alignment",
        pts: scorecard.complexityScore,
        max: 25,
        color: "#38BDF8",
      },
      {
        label: "Autonomy (Zero Hints)",
        pts: scorecard.autonomyScore,
        max: 15,
        color: StudioColors.yellow,
      },
      {
        label: "Pacing & Time Margin",
        pts: scorecard.pacingScore,
        max: 15,
        color: "#C4B5FD",
      },
    ];

    return (
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scorecardHero}>
          <View style={styles.scorecardHeaderRow}>
            <View>
              <Text style={styles.scorecardKicker}>
                HIRING COMMITTEE PACKET · {activeLoop.levelBadge}
              </Text>
              <Text style={styles.scorecardVerdictTitle}>
                {scorecard.verdictLabel}
              </Text>
            </View>
            <View style={styles.totalScoreBox}>
              <Text style={styles.totalScoreNumber}>
                {scorecard.totalScore}
              </Text>
              <Text style={styles.totalScoreDenom}>/ 100</Text>
            </View>
          </View>

          <Text style={styles.scorecardSummary}>{scorecard.verdictSummary}</Text>

          <View style={styles.scoreMetaRow}>
            <View style={styles.bannerStatPill}>
              <Text style={styles.bannerStatText}>
                ⏱ TIME USED: {formatInterviewClock(scorecard.secondsUsed)} /
                25:00
              </Text>
            </View>
            {lastXpEarned > 0 && (
              <View style={[styles.bannerStatPill, styles.xpEarnedPill]}>
                <Text style={styles.xpEarnedPillText}>
                  ⚡ +{lastXpEarned} XP EARNED
                </Text>
              </View>
            )}
          </View>

          <View style={styles.rubricBarsWrap}>
            {rubricBars.map((item) => {
              const pct = Math.round((item.pts / item.max) * 100);
              return (
                <View key={item.label} style={styles.rubricRow}>
                  <View style={styles.rubricLabelRow}>
                    <Text style={styles.rubricLabelText}>{item.label}</Text>
                    <Text style={styles.rubricPtsText}>
                      {item.pts} / {item.max}
                    </Text>
                  </View>
                  <View style={styles.rubricTrack}>
                    <View
                      style={[
                        styles.rubricFill,
                        { width: `${pct}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[styles.debriefGrid, isNarrow && styles.loopGridNarrow]}>
            {scorecard.roundReports.map((rep, idx) => (
              <View
                key={rep.roundId}
                style={[styles.debriefCard, isNarrow && styles.loopCardNarrow]}
              >
                <View style={styles.debriefTopRow}>
                  <Text style={styles.debriefRoundBadge}>
                    ROUND {idx + 1} · {rep.passedCount}/{rep.totalCount} CASES
                  </Text>
                  <Text
                    style={[
                      styles.debriefCompPill,
                      rep.meetsComplexity
                        ? styles.compPillPass
                        : styles.compPillWarn,
                    ]}
                  >
                    EST {rep.estimatedComplexity} (TARGET {rep.targetComplexity})
                  </Text>
                </View>
                <Text style={styles.debriefTitle}>{rep.title}</Text>
                <Text style={styles.debriefNote}>{rep.debriefNote}</Text>
              </View>
            ))}
          </View>

          <View style={styles.scoreActionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry this interview loop"
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => startInterviewLoop(selectedLoopId)}
            >
              <Text style={styles.retryBtnText}>↻ RETRY LOOP</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return to Interview Lobby"
              style={({ pressed }) => [
                styles.lobbyReturnBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                setPhase("lobby");
              }}
            >
              <Text style={styles.lobbyReturnBtnText}>
                ← BACK TO INTERVIEW LOBBY
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  // =========================================================================
  // PHASE 2: ACTIVE LIVE INTERVIEW WORKSPACE
  // =========================================================================
  const isClockUrgent = secondsRemaining <= 60;
  const isClockWarning = secondsRemaining > 60 && secondsRemaining <= 5 * 60;
  const passedCasesCount = activeResults.filter((r) => r.passed).length;

  return (
    <ScrollView
      style={styles.pageScroll}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Slim Live Interview Control Bar */}
      <View style={styles.liveTopBar}>
        <View style={styles.liveTopLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Exit active interview"
            style={styles.exitBtn}
            onPress={() => {
              playKeyClick();
              setPhase("lobby");
            }}
          >
            <Text style={styles.exitBtnText}>✕ EXIT</Text>
          </Pressable>
          <Text style={styles.liveLoopLabel} numberOfLines={1}>
            {activeLoop.shortTitle}
          </Text>
        </View>

        <View style={styles.roundTabsRow}>
          {([0, 1] as const).map((idx) => {
            const isCurrent = activeRoundIdx === idx;
            const roundCleared = passedByRound[idx];
            return (
              <Pressable
                key={idx}
                accessibilityRole="button"
                accessibilityState={{ selected: isCurrent }}
                style={[
                  styles.roundTabPill,
                  isCurrent && [
                    styles.roundTabPillActive,
                    { backgroundColor: activeLoop.accent },
                  ],
                ]}
                onPress={() => {
                  playKeyClick();
                  setActiveRoundIdx(idx);
                }}
              >
                <Text
                  style={[
                    styles.roundTabText,
                    isCurrent && styles.roundTabTextActive,
                  ]}
                >
                  ROUND {idx + 1}
                  {idx === 0 ? " · ALGO" : " · SYSTEMS"}
                  {roundCleared ? " ✓" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.liveTopRight}>
          <View
            style={[
              styles.clockPill,
              isClockWarning && styles.clockPillWarn,
              isClockUrgent && styles.clockPillUrgent,
            ]}
          >
            <Text
              style={[
                styles.clockText,
                (isClockWarning || isClockUrgent) && styles.clockTextDark,
              ]}
            >
              ⏱ {formatInterviewClock(secondsRemaining)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit interview packet for grading"
            style={({ pressed }) => [
              styles.submitPacketBtn,
              passedByRound[0] &&
                passedByRound[1] &&
                styles.submitPacketBtnReady,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={() => {
              playKeyClick();
              finalizePacket(secondsRemaining);
            }}
          >
            <Text style={styles.submitPacketBtnText}>SUBMIT PACKET →</Text>
          </Pressable>
        </View>
      </View>

      {/* Split Candidate Workspace */}
      <View
        style={[
          styles.workspaceRow,
          isNarrow && styles.workspaceRowNarrow,
        ]}
      >
        {/* Left: Concise Interviewer Prompt */}
        <View style={[styles.promptPane, isNarrow && styles.paneFullWidth]}>
          <View style={styles.promptBadgeRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>
                {activeRound.categoryBadge}
              </Text>
            </View>
            <View style={styles.targetBigOTag}>
              <Text style={styles.targetBigOText}>
                TARGET: {activeRound.targetComplexity}
              </Text>
            </View>
          </View>

          <Text style={styles.roundProblemTitle}>{activeRound.title}</Text>
          <Text style={styles.roundPromptText}>{activeRound.prompt}</Text>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleHeader}>SAMPLE I/O</Text>
            <Text style={styles.exampleCode}>IN : {activeRound.exampleInput}</Text>
            <Text style={styles.exampleOut}>OUT: {activeRound.exampleOutput}</Text>
            <Text style={styles.exampleWhy}>{activeRound.exampleNote}</Text>
          </View>

          <View style={styles.constraintsBox}>
            <Text style={styles.exampleHeader}>INTERVIEW CONSTRAINTS</Text>
            {activeRound.constraints.map((line) => (
              <Text key={line} style={styles.constraintBullet}>
                • {line}
              </Text>
            ))}
          </View>

          {/* Optional Interviewer Nudge (Zero Solution Spoilers) */}
          {!activeUsedNudge ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ask interviewer for a conceptual nudge"
              style={styles.nudgeTriggerBtn}
              onPress={handleRequestNudge}
            >
              <Text style={styles.nudgeTriggerText}>
                💬 ASK INTERVIEWER FOR NUDGE (-7 RUBRIC PTS)
              </Text>
            </Pressable>
          ) : (
            <View style={styles.nudgeCard}>
              <Text style={styles.nudgeHeader}>💬 INTERVIEWER NUDGE</Text>
              <Text style={styles.nudgeBody}>
                {activeRound.interviewerNudge}
              </Text>
            </View>
          )}
        </View>

        {/* Right: Candidate Python Editor & Suite Verdict */}
        <View style={[styles.editorPane, isNarrow && styles.paneFullWidth]}>
          <View style={styles.editorChrome}>
            <Text style={styles.editorFileName}>
              round_{activeRound.roundNumber}_candidate.py
            </Text>
            <View style={styles.editorChromeRight}>
              <View style={styles.liveEstPill}>
                <Text style={styles.liveEstText}>EST: {liveComplexity}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset current round starter code"
                style={styles.resetStubBtn}
                onPress={handleResetCurrentRound}
              >
                <Text style={styles.resetStubBtnText}>RESET</Text>
              </Pressable>
            </View>
          </View>

          <TextInput
            value={activeCode}
            onChangeText={handleDraftChange}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            style={styles.codeInput}
            onSelectionChange={(e) => {
              selectionRef.current = e.nativeEvent.selection;
            }}
            onKeyPress={(e: any) => {
              const nativeEvt = e?.nativeEvent;
              const key: string = nativeEvt?.key || "";
              const metaOrCtrl = Boolean(
                nativeEvt?.metaKey || nativeEvt?.ctrlKey,
              );
              if (metaOrCtrl && key === "Enter") {
                e.preventDefault?.();
                void handleRunRoundTests();
                return;
              }
              if (!metaOrCtrl && !nativeEvt?.altKey) {
                const kind = classifyTypingKey(key);
                if (kind) playMechanicalKeystroke(kind);
              }
              if (Platform.OS === "web") {
                const autoEdit = computePythonAutoEdit({
                  code: activeCode,
                  selectionStart: selectionRef.current.start,
                  selectionEnd: selectionRef.current.end,
                  key,
                  shiftKey: Boolean(nativeEvt?.shiftKey),
                  metaOrCtrlKey: metaOrCtrl,
                  altKey: Boolean(nativeEvt?.altKey),
                });
                if (autoEdit) {
                  e.preventDefault?.();
                  selectionRef.current = {
                    start: autoEdit.selectionStart,
                    end: autoEdit.selectionEnd,
                  };
                  if (autoEdit.code !== activeCode) {
                    handleDraftChange(autoEdit.code);
                  }
                }
              }
            }}
          />

          <View style={styles.editorActionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Run candidate test suite"
              disabled={!pyodideReady || isRunningTests}
              style={({ pressed }) => [
                styles.runTestsBtn,
                (!pyodideReady || isRunningTests) && { opacity: 0.65 },
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={handleRunRoundTests}
            >
              <Text style={styles.runTestsBtnText}>
                {!pyodideReady
                  ? "WARMING PYTHON..."
                  : isRunningTests
                    ? "RUNNING SUITE..."
                    : "▶ RUN CANDIDATE TESTS"}
              </Text>
            </Pressable>

            {passedByRound[activeRoundIdx] && activeRoundIdx === 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Advance to Round 2 Systems"
                style={styles.nextRoundBtn}
                onPress={() => {
                  playKeyClick();
                  setActiveRoundIdx(1);
                }}
              >
                <Text style={styles.nextRoundBtnText}>ROUND 2 →</Text>
              </Pressable>
            )}
          </View>

          {/* Compact Candidate Test Output */}
          <View style={styles.resultsBox}>
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.exampleHeader}>CANDIDATE SUITE VERDICT</Text>
              {activeResults.length > 0 && (
                <Text
                  style={[
                    styles.resultsSummaryPill,
                    passedByRound[activeRoundIdx]
                      ? styles.compPillPass
                      : styles.compPillWarn,
                  ]}
                >
                  {passedCasesCount}/{activeResults.length} PASSED
                </Text>
              )}
            </View>

            {activeError ? (
              <Text style={styles.runtimeErrorText}>{activeError}</Text>
            ) : activeResults.length === 0 ? (
              <Text style={styles.emptyResultsHint}>
                Run the candidate suite to verify standard &amp; hidden boundary
                cases before submitting your packet.
              </Text>
            ) : (
              activeResults.map((tc) => (
                <View key={tc.id} style={styles.testCaseRow}>
                  <Text
                    style={[
                      styles.testCaseIcon,
                      { color: tc.passed ? "#6EE7B7" : "#FB7185" },
                    ]}
                  >
                    {tc.passed ? "✓" : "✕"}
                  </Text>
                  <View style={styles.testCaseBody}>
                    <Text style={styles.testCaseLabel}>{tc.input}</Text>
                    {!tc.passed && (
                      <Text style={styles.testCaseDiff}>
                        Expected {tc.expected} · Got {tc.actual}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: StudioThemeColors) {
  return StyleSheet.create({
    pageScroll: {
      flex: 1,
    },
    pageContent: {
      padding: 16,
      paddingBottom: 42,
      maxWidth: 1180,
      width: "100%",
      alignSelf: "center",
      gap: 14,
    },
    bannerCard: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      ...HardShadow,
    },
    bannerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    },
    bannerTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    bannerIconBox: {
      width: 44,
      height: 44,
      borderRadius: 11,
      backgroundColor: "#C4B5FD",
      borderWidth: 2,
      borderColor: "#111111",
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    bannerTextCol: {
      gap: 2,
    },
    bannerKicker: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
      color: colors.textMuted,
      letterSpacing: 0.7,
    },
    bannerTitle: {
      fontSize: 19,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    bannerStatsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    bannerStatPill: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    bannerStatText: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    bannerRulePill: {
      backgroundColor: "rgba(196, 181, 253, 0.16)",
    },
    bannerRuleText: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "800",
      color: colors.textSecondary,
    },
    loopGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
    },
    loopGridNarrow: {
      flexDirection: "column",
    },
    loopCard: {
      width: "48.8%",
      flexGrow: 1,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 14,
      overflow: "hidden",
      ...HardShadow,
    },
    loopCardNarrow: {
      width: "100%",
    },
    loopRibbon: {
      height: 7,
      borderBottomWidth: 1.5,
      borderBottomColor: "#111111",
    },
    loopBody: {
      padding: 15,
      gap: 10,
    },
    loopMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
    },
    loopMetaRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    levelBadge: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    levelBadgeText: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    bestVerdictPill: {
      backgroundColor: "rgba(110, 231, 183, 0.16)",
      borderWidth: 1.5,
      borderColor: "#10B981",
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    bestVerdictText: {
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    tierPill: {
      borderWidth: 1.5,
      borderColor: "#111111",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2.5,
    },
    tierPillFree: {
      backgroundColor: StudioColors.mint,
    },
    tierPillPro: {
      backgroundColor: StudioColors.yellow,
    },
    tierPillText: {
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    tierPillTextFree: {
      color: "#090B10",
    },
    tierPillTextPro: {
      color: "#090B10",
    },
    loopTitle: {
      fontSize: 16.5,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    loopSubtitle: {
      fontSize: 12.5,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    roundPreviewBox: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.borderSubtle,
      borderRadius: 9,
      padding: 9,
      gap: 6,
    },
    roundPreviewRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    roundPreviewTag: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: colors.textMuted,
      width: 22,
    },
    roundPreviewTitle: {
      flex: 1,
      fontSize: 12,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    roundPreviewTarget: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: colors.textSecondary,
    },
    loopFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
      gap: 8,
    },
    loopMetaFoot: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "800",
      color: colors.textMuted,
    },
    startLoopBtn: {
      borderWidth: 2,
      borderColor: "#111111",
      borderRadius: 9,
      paddingHorizontal: 13,
      paddingVertical: 8,
      ...HardShadowSm,
    },
    startLoopBtnText: {
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
      color: "#090B10",
    },

    // Active Interview Workspace
    liveTopBar: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
      ...HardShadowSm,
    },
    liveTopLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    exitBtn: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    exitBtnText: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    liveLoopLabel: {
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
      color: colors.textMuted,
    },
    roundTabsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    roundTabPill: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },
    roundTabPillActive: {
      borderColor: "#111111",
      borderWidth: 2,
    },
    roundTabText: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
      color: colors.textSecondary,
    },
    roundTabTextActive: {
      color: "#090B10",
    },
    liveTopRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    clockPill: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    clockPillWarn: {
      backgroundColor: StudioColors.yellow,
      borderColor: "#111111",
    },
    clockPillUrgent: {
      backgroundColor: StudioColors.coral,
      borderColor: "#111111",
    },
    clockText: {
      fontFamily: MonoFont,
      fontSize: 12,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    clockTextDark: {
      color: "#090B10",
    },
    submitPacketBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: "#111111",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      ...HardShadowSm,
    },
    submitPacketBtnReady: {
      backgroundColor: StudioColors.lime,
    },
    submitPacketBtnText: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
      color: "#090B10",
    },
    workspaceRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    workspaceRowNarrow: {
      flexDirection: "column",
    },
    promptPane: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 15,
      gap: 11,
      ...HardShadow,
    },
    editorPane: {
      flex: 1.18,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 14,
      overflow: "hidden",
      ...HardShadow,
    },
    paneFullWidth: {
      width: "100%",
    },
    promptBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
    },
    categoryTag: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    categoryTagText: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    targetBigOTag: {
      backgroundColor: "rgba(56, 189, 248, 0.16)",
      borderWidth: 1.5,
      borderColor: "#38BDF8",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    targetBigOText: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    roundProblemTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    roundPromptText: {
      fontSize: 13.5,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    exampleBox: {
      backgroundColor: "#0B101B",
      borderWidth: 1.5,
      borderColor: "#263248",
      borderRadius: 10,
      padding: 11,
      gap: 4,
    },
    exampleHeader: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: "#94A3B8",
      letterSpacing: 0.5,
    },
    exampleCode: {
      fontFamily: MonoFont,
      fontSize: 11.5,
      color: "#E2E8F0",
    },
    exampleOut: {
      fontFamily: MonoFont,
      fontSize: 11.5,
      fontWeight: "800",
      color: "#6EE7B7",
    },
    exampleWhy: {
      fontSize: 11.5,
      color: "#94A3B8",
      marginTop: 2,
    },
    constraintsBox: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.borderSubtle,
      borderRadius: 9,
      padding: 10,
      gap: 4,
    },
    constraintBullet: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.textSecondary,
    },
    nudgeTriggerBtn: {
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: 9,
      paddingVertical: 8,
      paddingHorizontal: 10,
      alignItems: "center",
    },
    nudgeTriggerText: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "800",
      color: colors.textMuted,
    },
    nudgeCard: {
      backgroundColor: "rgba(255, 222, 89, 0.14)",
      borderWidth: 1.5,
      borderColor: "#F59E0B",
      borderRadius: 9,
      padding: 10,
      gap: 4,
    },
    nudgeHeader: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    nudgeBody: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    editorChrome: {
      backgroundColor: "#090D16",
      borderBottomWidth: 1.5,
      borderBottomColor: "#1E293B",
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    editorFileName: {
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "800",
      color: "#CBD5E1",
    },
    editorChromeRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    liveEstPill: {
      backgroundColor: "#1E293B",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    liveEstText: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: "#38BDF8",
    },
    resetStubBtn: {
      borderWidth: 1,
      borderColor: "#334155",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    resetStubBtnText: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "800",
      color: "#94A3B8",
    },
    codeInput: {
      backgroundColor: "#0B101B",
      color: "#F8FAFC",
      fontFamily: MonoFont,
      fontSize: 13,
      lineHeight: 20,
      minHeight: 225,
      padding: 13,
      textAlignVertical: "top",
    },
    editorActionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 11,
      backgroundColor: colors.bg,
      borderTopWidth: 1.5,
      borderBottomWidth: 1.5,
      borderColor: colors.borderSubtle,
      gap: 10,
    },
    runTestsBtn: {
      backgroundColor: StudioColors.mint,
      borderWidth: 2,
      borderColor: "#111111",
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 8,
      ...HardShadowSm,
    },
    runTestsBtnText: {
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
      color: "#090B10",
    },
    nextRoundBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: "#111111",
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 8,
      ...HardShadowSm,
    },
    nextRoundBtnText: {
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
      color: "#090B10",
    },
    resultsBox: {
      backgroundColor: "#090D16",
      padding: 12,
      gap: 7,
      minHeight: 110,
    },
    resultsHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    resultsSummaryPill: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 5,
      overflow: "hidden",
    },
    emptyResultsHint: {
      fontSize: 12,
      color: "#94A3B8",
      lineHeight: 17,
    },
    runtimeErrorText: {
      fontFamily: MonoFont,
      fontSize: 11.5,
      color: "#FDA4AF",
      lineHeight: 17,
    },
    testCaseRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      paddingVertical: 3,
    },
    testCaseIcon: {
      fontFamily: MonoFont,
      fontSize: 12,
      fontWeight: "900",
    },
    testCaseBody: {
      flex: 1,
      gap: 2,
    },
    testCaseLabel: {
      fontFamily: MonoFont,
      fontSize: 11.5,
      color: "#E2E8F0",
    },
    testCaseDiff: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      color: "#FDA4AF",
    },

    // Scorecard Phase
    scorecardHero: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 18,
      gap: 14,
      ...HardShadow,
    },
    scorecardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
    },
    scorecardKicker: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
      color: colors.textMuted,
    },
    scorecardVerdictTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.textPrimary,
      marginTop: 2,
    },
    totalScoreBox: {
      flexDirection: "row",
      alignItems: "baseline",
      backgroundColor: "#0B101B",
      borderWidth: 2,
      borderColor: "#111111",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
      gap: 4,
    },
    totalScoreNumber: {
      fontFamily: MonoFont,
      fontSize: 26,
      fontWeight: "900",
      color: StudioColors.lime,
    },
    totalScoreDenom: {
      fontFamily: MonoFont,
      fontSize: 12,
      fontWeight: "800",
      color: "#94A3B8",
    },
    scorecardSummary: {
      fontSize: 13.5,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    scoreMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    xpEarnedPill: {
      backgroundColor: StudioColors.lime,
      borderColor: "#111111",
    },
    xpEarnedPillText: {
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
      color: "#090B10",
    },
    rubricBarsWrap: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.borderSubtle,
      borderRadius: 11,
      padding: 12,
      gap: 9,
    },
    rubricRow: {
      gap: 4,
    },
    rubricLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    rubricLabelText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    rubricPtsText: {
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
      color: colors.textSecondary,
    },
    rubricTrack: {
      height: 8,
      backgroundColor: "rgba(15, 23, 42, 0.25)",
      borderRadius: 5,
      overflow: "hidden",
    },
    rubricFill: {
      height: "100%",
      borderRadius: 5,
    },
    debriefGrid: {
      flexDirection: "row",
      gap: 12,
    },
    debriefCard: {
      flex: 1,
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 11,
      padding: 12,
      gap: 6,
    },
    debriefTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
    },
    debriefRoundBadge: {
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
      color: colors.textMuted,
    },
    debriefCompPill: {
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
      overflow: "hidden",
    },
    compPillPass: {
      backgroundColor: "rgba(110, 231, 183, 0.2)",
      color: "#10B981",
    },
    compPillWarn: {
      backgroundColor: "rgba(251, 113, 133, 0.2)",
      color: "#FB7185",
    },
    debriefTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    debriefNote: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.textSecondary,
    },
    scoreActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 2,
    },
    retryBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: "#111111",
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 9,
      ...HardShadowSm,
    },
    retryBtnText: {
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
      color: "#090B10",
    },
    lobbyReturnBtn: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    lobbyReturnBtnText: {
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
      color: colors.textPrimary,
    },
  });
}
