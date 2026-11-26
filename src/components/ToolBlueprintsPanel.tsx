import React, { useRef, useState } from "react";
import {
  Platform,
  Pressable,
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
import { parseMiniBuildWidgetOutput } from "../utils/miniBuilds";
import {
  type BlueprintProgressMap,
  buildBlueprintWidgetScript,
  getToolBlueprint,
  isBlueprintFullyShipped,
  markBlueprintStageCompleted,
  readBlueprintProgress,
  TOOL_BLUEPRINT_PROJECTS,
  type ToolBlueprintId,
} from "../utils/toolBlueprints";
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
import { Text } from "./StudioIcon";

interface ToolBlueprintsPanelProps {
  pyodideReady: boolean;
  isPremium: boolean;
  onRequirePro: () => void;
  onRunPython: (script: string) => Promise<string>;
  onVerifyBuild: (
    userCode: string,
    harness: string,
  ) => Promise<{
    allPassed: boolean;
    results: TestCaseResult[];
    stdout: string;
    errorMessage?: string;
  }>;
  onAwardBuildXp: (xpEarned: number) => void;
}

function stageCodeKey(id: ToolBlueprintId, stageNum: 1 | 2 | 3): string {
  return `${id}:s${stageNum}`;
}

export default function ToolBlueprintsPanel({
  pyodideReady,
  isPremium,
  onRequirePro,
  onRunPython,
  onVerifyBuild,
  onAwardBuildXp,
}: ToolBlueprintsPanelProps) {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth > 0 && windowWidth < 800;

  const [activeId, setActiveId] = useState<ToolBlueprintId>("autocomplete_trie");
  const [stageNumber, setStageNumber] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState<BlueprintProgressMap>(() =>
    readBlueprintProgress(),
  );
  const [codeMap, setCodeMap] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const bp of TOOL_BLUEPRINT_PROJECTS) {
      for (const st of bp.stages) {
        init[stageCodeKey(bp.id, st.stageNumber)] = st.starterCode;
      }
    }
    return init;
  });

  // Live Interactive Widget Inputs
  const [queryInput, setQueryInput] = useState<string>("py");
  const [limitInput, setLimitInput] = useState<number>(4);
  const [capacityInput, setCapacityInput] = useState<number>(5);
  const [rateInput, setRateInput] = useState<number>(2);
  const [burstInput, setBurstInput] = useState<number>(7);
  const [markdownInput, setMarkdownInput] = useState<string>(
    "# Devy Studio\n- Write **clean** Python\n- Run `pytest` fast",
  );

  const [widgetData, setWidgetData] = useState<Record<string, any> | null>(null);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [isRunningWidget, setIsRunningWidget] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{
    passed: boolean;
    summary: string;
    results: TestCaseResult[];
  } | null>(null);

  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const blueprint = getToolBlueprint(activeId);
  const stage =
    blueprint.stages.find((s) => s.stageNumber === stageNumber) ||
    blueprint.stages[0];
  const currentKey = stageCodeKey(activeId, stageNumber);
  const activeCode = codeMap[currentKey] ?? stage.starterCode;
  const completedStages = progress[activeId] || [];
  const isCurrentStageCleared = completedStages.includes(stageNumber);
  const isFullyShipped = isBlueprintFullyShipped(activeId, progress);

  function handleSelectBlueprint(nextId: ToolBlueprintId) {
    const target = getToolBlueprint(nextId);
    if (target.isPro && !isPremium) {
      playKeyClick();
      onRequirePro();
      return;
    }
    playKeyClick();
    setActiveId(nextId);
    setStageNumber(1);
    setWidgetData(null);
    setWidgetError(null);
    setVerifyFeedback(null);
  }

  function handleSelectStage(nextStage: 1 | 2 | 3) {
    playKeyClick();
    setStageNumber(nextStage);
    setWidgetData(null);
    setWidgetError(null);
    setVerifyFeedback(null);
  }

  function getActiveInput(): Record<string, string | number> {
    if (activeId === "autocomplete_trie") {
      return { query: queryInput, limit: limitInput };
    }
    if (activeId === "rate_limiter") {
      return {
        capacity: capacityInput,
        refillRate: rateInput,
        burstCount: burstInput,
      };
    }
    return { markdown: markdownInput };
  }

  async function handleRunWidget() {
    if (isRunningWidget) return;
    playKeyClick();
    setIsRunningWidget(true);
    setWidgetError(null);
    try {
      const script = buildBlueprintWidgetScript(
        blueprint,
        stageNumber,
        activeCode,
        getActiveInput(),
      );
      const stdout = await onRunPython(script);
      const parsed = parseMiniBuildWidgetOutput(stdout);
      if (parsed) {
        setWidgetData(parsed);
        playSuccessChime();
      } else {
        setWidgetError(
          stdout.trim() || "No structured JSON payload returned by your function.",
        );
        playErrorBuzz();
      }
    } catch (err: any) {
      setWidgetError(err?.message || "Failed to execute stage widget.");
      playErrorBuzz();
    } finally {
      setIsRunningWidget(false);
    }
  }

  async function handleVerifyStage() {
    if (isVerifying) return;
    playKeyClick();
    setIsVerifying(true);
    try {
      const verdict = await onVerifyBuild(activeCode, stage.verificationHarness);
      if (verdict.allPassed) {
        const alreadyCleared = completedStages.includes(stageNumber);
        const nextProgress = markBlueprintStageCompleted(activeId, stageNumber);
        setProgress(nextProgress);
        if (!alreadyCleared) {
          onAwardBuildXp(stage.xpReward);
        }
        const nowFull = isBlueprintFullyShipped(activeId, nextProgress);
        if (nowFull) {
          playVictoryFanfare();
        } else {
          playSuccessChime();
        }
        setVerifyFeedback({
          passed: true,
          summary: alreadyCleared
            ? `✓ Stage ${stageNumber} verified again!`
            : nowFull
              ? `🏆 All 3 stages shipped! Full ${blueprint.title} unlocked (+${stage.xpReward} XP)!`
              : `✓ Stage ${stageNumber} cleared (+${stage.xpReward} XP) — ${stage.unlocksWidgetFeature} unlocked!`,
          results: verdict.results,
        });
        await handleRunWidget();
      } else {
        playErrorBuzz();
        setVerifyFeedback({
          passed: false,
          summary:
            verdict.errorMessage ||
            "Some stage assertions failed — check the results below.",
          results: verdict.results,
        });
      }
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <View testID="tool-blueprints-panel" style={styles.root}>
      {/* Blueprint Selector Pills */}
      <View style={styles.blueprintRow}>
        {TOOL_BLUEPRINT_PROJECTS.map((bp) => {
          const isActive = bp.id === activeId;
          const doneCount = (progress[bp.id] || []).length;
          const locked = bp.isPro && !isPremium;
          return (
            <Pressable
              key={bp.id}
              accessibilityRole="button"
              accessibilityLabel={`Select 3-stage blueprint ${bp.title}`}
              style={({ pressed }) => [
                styles.blueprintPill,
                isActive && [
                  styles.blueprintPillActive,
                  { backgroundColor: bp.accent },
                ],
                locked && styles.blueprintPillLocked,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSelectBlueprint(bp.id)}
            >
              <Text
                style={[
                  styles.blueprintPillText,
                  isActive && styles.blueprintPillTextActive,
                ]}
              >
                {locked ? "🔒 " : ""}
                {bp.shortTitle} · {doneCount}/3
                {doneCount === 3 ? " ★" : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 3-Stage Milestone Stepper Bar */}
      <View style={styles.stepperCard}>
        <View style={styles.stepperHeader}>
          <View style={styles.stepperTitleGroup}>
            <View
              style={[styles.trackBadge, { backgroundColor: blueprint.accent }]}
            >
              <Text style={styles.trackBadgeText}>{blueprint.trackBadge}</Text>
            </View>
            <Text style={styles.blueprintTitle}>{blueprint.title}</Text>
          </View>
          <Text style={styles.widgetModulesBadge}>
            {isFullyShipped
              ? "★ 3/3 WIDGET MODULES LIVE"
              : `${completedStages.length}/3 WIDGET MODULES UNLOCKED`}
          </Text>
        </View>

        <View style={styles.stagesRow}>
          {blueprint.stages.map((st) => {
            const isCurrent = st.stageNumber === stageNumber;
            const isCleared = completedStages.includes(st.stageNumber);
            return (
              <Pressable
                key={st.stageNumber}
                accessibilityRole="button"
                accessibilityLabel={`Select blueprint stage ${st.stageNumber}: ${st.title}`}
                style={({ pressed }) => [
                  styles.stageStepBtn,
                  isCurrent && {
                    borderColor: blueprint.accent,
                    backgroundColor: colorsOrElevated,
                  },
                  isCurrent && styles.stageStepBtnActive,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => handleSelectStage(st.stageNumber)}
              >
                <View style={styles.stageStepTop}>
                  <Text
                    style={[
                      styles.stageNumText,
                      isCleared && { color: StudioColors.lime },
                    ]}
                  >
                    {isCleared ? "✓ " : `0${st.stageNumber} · `}
                    STAGE {st.stageNumber}
                  </Text>
                  <Text style={styles.stageXpBadge}>+{st.xpReward} XP</Text>
                </View>
                <Text style={styles.stageStepTitle} numberOfLines={1}>
                  {st.unlocksWidgetFeature}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2-Pane Blueprint Editor + Progressive Live Widget */}
      <View style={[styles.workbenchGrid, isNarrow && styles.workbenchColumn]}>
        {/* Left Pane: Stage Spec + Python 3.11 Editor */}
        <View style={[styles.pane, styles.editorCard]}>
          <View style={styles.stageSpecHeader}>
            <Text style={styles.stageTitle}>{stage.title}</Text>
            <View style={styles.stageUnlockPill}>
              <Text style={styles.stageUnlockText}>
                UNLOCKS: {stage.unlocksWidgetFeature.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.stageSummary}>{stage.summary}</Text>

          <View style={styles.checklistBox}>
            {stage.checklist.map((item, idx) => (
              <Text key={idx} style={styles.checklistItem}>
                {idx + 1}. {item}
              </Text>
            ))}
          </View>

          <View style={styles.codeBox}>
            <View style={styles.codeBoxHeader}>
              <Text style={styles.codeFilename}>
                {blueprint.id}_stage{stageNumber}.py
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset stage code to starter"
                style={styles.microBtn}
                onPress={() => {
                  playKeyClick();
                  setCodeMap((prev) => ({
                    ...prev,
                    [currentKey]: stage.starterCode,
                  }));
                }}
              >
                <Text style={styles.microBtnText}>↺ RESET</Text>
              </Pressable>
            </View>

            <TextInput
              accessibilityLabel={`${stage.title} Python editor`}
              value={activeCode}
              onChangeText={(next) =>
                setCodeMap((prev) => ({ ...prev, [currentKey]: next }))
              }
              onSelectionChange={(e) => {
                selectionRef.current = e.nativeEvent.selection;
              }}
              onKeyPress={(e: any) => {
                const nativeEvt = e?.nativeEvent;
                const key = nativeEvt?.key || "";
                const metaOrCtrl = Boolean(
                  nativeEvt?.metaKey || nativeEvt?.ctrlKey,
                );
                if (metaOrCtrl && key === "Enter") {
                  e.preventDefault?.();
                  void handleRunWidget();
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
                      setCodeMap((prev) => ({
                        ...prev,
                        [currentKey]: autoEdit.code,
                      }));
                    }
                  }
                }
              }}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              style={styles.codeInput}
            />
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Run stage live preview widget"
              disabled={isRunningWidget}
              style={({ pressed }) => [
                styles.runBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => void handleRunWidget()}
            >
              <Text style={styles.runBtnText}>
                {isRunningWidget ? "RUNNING..." : "▶ RUN STAGE WIDGET"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Verify blueprint stage"
              disabled={isVerifying}
              style={({ pressed }) => [
                styles.verifyBtn,
                { backgroundColor: blueprint.accent },
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => void handleVerifyStage()}
            >
              <Text style={styles.verifyBtnText}>
                {isVerifying
                  ? "VERIFYING..."
                  : isCurrentStageCleared
                    ? `✓ RE-VERIFY STAGE ${stageNumber}`
                    : `✓ VERIFY STAGE ${stageNumber} (+${stage.xpReward} XP)`}
              </Text>
            </Pressable>
          </View>

          {verifyFeedback ? (
            <View
              style={[
                styles.verifyBanner,
                verifyFeedback.passed
                  ? styles.verifyBannerPass
                  : styles.verifyBannerFail,
              ]}
            >
              <Text style={styles.verifyBannerTitle}>
                {verifyFeedback.summary}
              </Text>
              {verifyFeedback.results.map((r) => (
                <Text key={r.id} style={styles.verifyRowText}>
                  {r.passed ? "✓" : "✕"} {r.input} → {r.actual}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        {/* Right Pane: Progressive Live Interactive Widget */}
        <View style={[styles.pane, styles.widgetCard]}>
          <View
            style={[
              styles.widgetTopStrip,
              { backgroundColor: blueprint.accent },
            ]}
          >
            <Text style={styles.widgetTopText}>
              STAGE {stageNumber} LIVE WIDGET · {stage.unlocksWidgetFeature.toUpperCase()}
            </Text>
            <Text style={styles.widgetTopTag}>
              {pyodideReady ? "PY 3.11" : "LOADING"}
            </Text>
          </View>

          <View style={styles.widgetBody}>
            {activeId === "autocomplete_trie" ? (
              <View style={styles.widgetSection}>
                <Text style={styles.fieldLabel}>SEARCH PREFIX QUERY</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    accessibilityLabel="Autocomplete query input"
                    value={queryInput}
                    onChangeText={setQueryInput}
                    placeholder="Type prefix e.g. py, pi..."
                    placeholderTextColor="#7C8599"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.fieldInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Run autocomplete preview"
                    style={styles.goBtn}
                    onPress={() => void handleRunWidget()}
                  >
                    <Text style={styles.goBtnText}>SEARCH</Text>
                  </Pressable>
                </View>

                {stageNumber >= 2 ? (
                  <View style={styles.steppersRow}>
                    {[2, 3, 4, 6].map((k) => (
                      <Pressable
                        key={k}
                        style={[
                          styles.miniChip,
                          limitInput === k && styles.miniChipActive,
                        ]}
                        onPress={() => {
                          playKeyClick();
                          setLimitInput(k);
                        }}
                      >
                        <Text
                          style={[
                            styles.miniChipText,
                            limitInput === k && styles.miniChipTextActive,
                          ]}
                        >
                          TOP {k}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                {widgetData ? (
                  <View style={styles.outputCard}>
                    {stageNumber === 1 && Array.isArray(widgetData.matches) ? (
                      <View style={styles.chipsWrap}>
                        {widgetData.matches.length > 0 ? (
                          widgetData.matches.map((w: string) => (
                            <View key={w} style={styles.matchChip}>
                              <Text style={styles.matchChipText}>{w}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.emptyText}>No prefix matches.</Text>
                        )}
                      </View>
                    ) : stageNumber === 2 && Array.isArray(widgetData.ranked) ? (
                      <View style={styles.rankList}>
                        {widgetData.ranked.map(
                          (item: { word: string; score: number }) => (
                            <View key={item.word} style={styles.rankBarRow}>
                              <Text style={styles.rankWord}>{item.word}</Text>
                              <View style={styles.rankTrack}>
                                <View
                                  style={[
                                    styles.rankFill,
                                    {
                                      width: `${Math.min(100, item.score)}%`,
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={styles.rankScore}>{item.score}</Text>
                            </View>
                          ),
                        )}
                      </View>
                    ) : Array.isArray(widgetData.items) ? (
                      <View style={styles.rankList}>
                        <Text style={styles.telemetryNote}>
                          {widgetData.exact_match
                            ? "★ EXACT DICTIONARY MATCH"
                            : `✦ ${widgetData.total_matches ?? 0} TOTAL PREFIX HITS`}
                        </Text>
                        {widgetData.items.map(
                          (it: {
                            word: string;
                            head: string;
                            tail: string;
                            score: number;
                          }) => (
                            <View key={it.word} style={styles.splitRow}>
                              <Text style={styles.splitText}>
                                <Text style={styles.splitHead}>{it.head}</Text>
                                {it.tail}
                              </Text>
                              <Text style={styles.rankScore}>⚡ {it.score}</Text>
                            </View>
                          ),
                        )}
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      Tap ▶ RUN STAGE WIDGET to test your live autocomplete engine!
                    </Text>
                  </View>
                )}
              </View>
            ) : activeId === "rate_limiter" ? (
              <View style={styles.widgetSection}>
                <Text style={styles.fieldLabel}>
                  BUCKET CONTROLS (CAP {capacityInput} · RATE {rateInput}/s · BURST {burstInput})
                </Text>
                <View style={styles.steppersRow}>
                  {[3, 5, 8].map((cap) => (
                    <Pressable
                      key={`cap-${cap}`}
                      style={[
                        styles.miniChip,
                        capacityInput === cap && styles.miniChipActive,
                      ]}
                      onPress={() => {
                        playKeyClick();
                        setCapacityInput(cap);
                      }}
                    >
                      <Text
                        style={[
                          styles.miniChipText,
                          capacityInput === cap && styles.miniChipTextActive,
                        ]}
                      >
                        CAP {cap}
                      </Text>
                    </Pressable>
                  ))}
                  {[1, 2, 4].map((r) => (
                    <Pressable
                      key={`rate-${r}`}
                      style={[
                        styles.miniChip,
                        rateInput === r && styles.miniChipActive,
                      ]}
                      onPress={() => {
                        playKeyClick();
                        setRateInput(r);
                      }}
                    >
                      <Text
                        style={[
                          styles.miniChipText,
                          rateInput === r && styles.miniChipTextActive,
                        ]}
                      >
                        {r}/s
                      </Text>
                    </Pressable>
                  ))}
                  {[4, 7, 10].map((b) => (
                    <Pressable
                      key={`burst-${b}`}
                      style={[
                        styles.miniChip,
                        burstInput === b && styles.miniChipActive,
                      ]}
                      onPress={() => {
                        playKeyClick();
                        setBurstInput(b);
                      }}
                    >
                      <Text
                        style={[
                          styles.miniChipText,
                          burstInput === b && styles.miniChipTextActive,
                        ]}
                      >
                        BURST {b}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {widgetData ? (
                  <View style={styles.outputCard}>
                    {stageNumber === 1 ? (
                      <View style={styles.rankList}>
                        <Text style={styles.telemetryNote}>
                          BUCKET FILL: {widgetData.tokens}/{widgetData.capacity} TOKENS ({widgetData.fill_pct}%)
                        </Text>
                        <View style={styles.rankTrack}>
                          <View
                            style={[
                              styles.rankFill,
                              {
                                width: `${Math.max(4, Math.min(100, Number(widgetData.fill_pct ?? 0)))}%`,
                                backgroundColor: "#38BDF8",
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ) : stageNumber === 2 ? (
                      <View style={styles.rankList}>
                        <Text
                          style={[
                            styles.statusBigText,
                            {
                              color: widgetData.allowed
                                ? StudioColors.lime
                                : StudioColors.coral,
                            },
                          ]}
                        >
                          HTTP {widgetData.status} ·{" "}
                          {widgetData.allowed ? "ALLOWED ✓" : "THROTTLED ✕"}
                        </Text>
                        <Text style={styles.emptyText}>
                          Remaining Tokens: {widgetData.remaining}
                        </Text>
                      </View>
                    ) : Array.isArray(widgetData.events) ? (
                      <View style={styles.rankList}>
                        <Text style={styles.telemetryNote}>
                          ✓ {widgetData.allowed_count} OK · ✕ {widgetData.throttled_count} THROTTLED (429)
                        </Text>
                        <View style={styles.chipsWrap}>
                          {widgetData.events.map(
                            (ev: { req: number; status: number }) => (
                              <View
                                key={ev.req}
                                style={[
                                  styles.trafficBlock,
                                  {
                                    backgroundColor:
                                      ev.status === 200
                                        ? StudioColors.lime
                                        : StudioColors.coral,
                                  },
                                ]}
                              >
                                <Text style={styles.trafficBlockText}>
                                  #{ev.req} {ev.status}
                                </Text>
                              </View>
                            ),
                          )}
                        </View>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      Tap ▶ RUN STAGE WIDGET to simulate your Token-Bucket Rate Limiter!
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.widgetSection}>
                <Text style={styles.fieldLabel}>LIVE MARKDOWN INPUT</Text>
                <TextInput
                  accessibilityLabel="Live markdown input"
                  value={markdownInput}
                  onChangeText={setMarkdownInput}
                  multiline
                  style={styles.markdownArea}
                />
                {widgetData ? (
                  <View style={styles.outputCard}>
                    {stageNumber === 1 ? (
                      <Text style={styles.telemetryNote}>
                        [{String(widgetData.kind || "text").toUpperCase()}]{" "}
                        {String(widgetData.text || "")}
                      </Text>
                    ) : (
                      <View style={styles.rankList}>
                        {typeof widgetData.word_count === "number" ? (
                          <Text style={styles.telemetryNote}>
                            WORDS: {widgetData.word_count} · HEADINGS:{" "}
                            {Array.isArray(widgetData.outline)
                              ? widgetData.outline.length
                              : 0}
                          </Text>
                        ) : null}
                        {Array.isArray(widgetData.blocks)
                          ? widgetData.blocks.map(
                              (b: { kind: string; text: string }, idx: number) => (
                                <Text
                                  key={idx}
                                  style={
                                    b.kind === "h1"
                                      ? styles.mdH1
                                      : b.kind === "h2"
                                        ? styles.mdH2
                                        : styles.mdBody
                                  }
                                >
                                  {b.kind === "bullet" ? "• " : ""}
                                  {b.text}
                                </Text>
                              ),
                            )
                          : null}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      Tap ▶ RUN STAGE WIDGET to render your Markdown preview!
                    </Text>
                  </View>
                )}
              </View>
            )}

            {widgetError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{widgetError}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const colorsOrElevated = "rgba(184, 255, 59, 0.08)";

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    root: {
      gap: 12,
    },
    blueprintRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    blueprintPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    blueprintPillActive: {
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    blueprintPillLocked: {
      opacity: 0.72,
    },
    blueprintPillText: {
      color: colors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    blueprintPillTextActive: {
      color: StudioColors.ink,
    },
    stepperCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 14,
      gap: 10,
      ...HardShadowSm,
    },
    stepperHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    stepperTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    trackBadge: {
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    trackBadgeText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    blueprintTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "900",
    },
    widgetModulesBadge: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stagesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    stageStepBtn: {
      flex: 1,
      minWidth: 160,
      backgroundColor: colors.bg,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: 10,
      gap: 4,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    stageStepBtnActive: {
      ...HardShadowSm,
    },
    stageStepTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    stageNumText: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stageXpBadge: {
      color: StudioColors.yellow,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stageStepTitle: {
      color: colors.textPrimary,
      fontSize: 11.5,
      fontWeight: "800",
    },
    workbenchGrid: {
      flexDirection: "row",
      gap: 14,
      alignItems: "flex-start",
    },
    workbenchColumn: {
      flexDirection: "column",
    },
    pane: {
      flex: 1,
      minWidth: 0,
      width: "100%",
    },
    editorCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 14,
      gap: 10,
      ...HardShadow,
    },
    stageSpecHeader: {
      gap: 5,
    },
    stageTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "900",
    },
    stageUnlockPill: {
      alignSelf: "flex-start",
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: StudioColors.lime,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    stageUnlockText: {
      color: StudioColors.lime,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stageSummary: {
      color: colors.textSecondary,
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "600",
    },
    checklistBox: {
      backgroundColor: colors.bg,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      gap: 4,
    },
    checklistItem: {
      color: colors.textSecondary,
      fontSize: 11.5,
      lineHeight: 17,
      fontWeight: "600",
    },
    codeBox: {
      backgroundColor: colors.codeBg,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.codeBorder,
      overflow: "hidden",
    },
    codeBoxHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 7,
      backgroundColor: colors.codeSurface,
      borderBottomWidth: 1,
      borderBottomColor: colors.codeBorder,
    },
    codeFilename: {
      color: colors.codeText,
      fontSize: 10.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    microBtn: {
      backgroundColor: colors.codeBg,
      borderWidth: 1,
      borderColor: colors.codeBorder,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 3,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    microBtnText: {
      color: colors.codeText,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    codeInput: {
      minHeight: 200,
      padding: 12,
      color: colors.codeText,
      fontFamily: MonoFont,
      fontSize: 12.5,
      lineHeight: 19,
      textAlignVertical: "top",
      ...Platform.select({ web: { outlineStyle: "none" as any } }),
    },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    runBtn: {
      flex: 1,
      minWidth: 150,
      backgroundColor: colors.bg,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 9,
      paddingVertical: 10,
      paddingHorizontal: 10,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    runBtnText: {
      color: colors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    verifyBtn: {
      flex: 1.2,
      minWidth: 170,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingVertical: 10,
      paddingHorizontal: 10,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    verifyBtnText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    verifyBanner: {
      borderRadius: 9,
      borderWidth: 1.5,
      padding: 10,
      gap: 4,
    },
    verifyBannerPass: {
      backgroundColor: "rgba(110, 231, 183, 0.12)",
      borderColor: StudioColors.lime,
    },
    verifyBannerFail: {
      backgroundColor: "rgba(251, 113, 133, 0.12)",
      borderColor: StudioColors.coral,
    },
    verifyBannerTitle: {
      color: colors.textPrimary,
      fontSize: 11.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    verifyRowText: {
      color: colors.textSecondary,
      fontSize: 10.5,
      fontFamily: MonoFont,
    },
    widgetCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      overflow: "hidden",
      ...HardShadow,
    },
    widgetTopStrip: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
      gap: 8,
    },
    widgetTopText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      flex: 1,
    },
    widgetTopTag: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    widgetBody: {
      padding: 14,
      gap: 10,
    },
    widgetSection: {
      gap: 10,
    },
    fieldLabel: {
      color: colors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    inputRow: {
      flexDirection: "row",
      gap: 8,
    },
    fieldInput: {
      flex: 1,
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 12,
    },
    goBtn: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 12,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    goBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    steppersRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    miniChip: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    miniChipActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    miniChipText: {
      color: colors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    miniChipTextActive: {
      color: StudioColors.ink,
    },
    outputCard: {
      backgroundColor: colors.bg,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: 12,
      gap: 8,
    },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    matchChip: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.mint,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    matchChipText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    rankList: {
      gap: 7,
    },
    rankBarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rankWord: {
      width: 78,
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    rankTrack: {
      flex: 1,
      height: 8,
      backgroundColor: colors.surface,
      borderRadius: 4,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    rankFill: {
      height: "100%",
      backgroundColor: StudioColors.lime,
    },
    rankScore: {
      width: 36,
      textAlign: "right",
      color: StudioColors.yellow,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    telemetryNote: {
      color: StudioColors.lime,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    splitRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    splitText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: MonoFont,
      fontWeight: "700",
    },
    splitHead: {
      color: StudioColors.lime,
      fontWeight: "900",
    },
    statusBigText: {
      fontSize: 15,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    trafficBlock: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    trafficBlockText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    markdownArea: {
      minHeight: 82,
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 11.5,
      textAlignVertical: "top",
    },
    mdH1: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: "900",
    },
    mdH2: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
    },
    mdBody: {
      color: colors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
    },
    emptyBox: {
      backgroundColor: colors.bg,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: "dashed",
      padding: 16,
      alignItems: "center",
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 11.5,
      textAlign: "center",
      fontWeight: "600",
    },
    errorBox: {
      backgroundColor: "rgba(251, 113, 133, 0.14)",
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.coral,
      padding: 10,
    },
    errorText: {
      color: StudioColors.coral,
      fontSize: 11,
      fontFamily: MonoFont,
      fontWeight: "700",
    },
  });
