import React, { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
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
import { TestCaseResult } from "../types/lesson";
import { computePythonAutoEdit } from "../utils/editorHelpers";
import {
  buildMiniBuildWidgetScript,
  getMiniBuildProject,
  markMiniBuildCompleted,
  MINI_BUILD_PROJECTS,
  type MiniBuildId,
  parseMiniBuildWidgetOutput,
  readCompletedMiniBuilds,
} from "../utils/miniBuilds";
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
import { StudioIcon, type StudioIconName, Text } from "./StudioIcon";

interface MiniBuildsArenaProps {
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

function getBuildIcon(id: MiniBuildId): StudioIconName {
  if (id === "password_meter") return "shield";
  if (id === "url_shortener") return "cloud";
  return "dice";
}

export default function MiniBuildsArena({
  pyodideReady,
  isPremium,
  onRequirePro,
  onRunPython,
  onVerifyBuild,
  onAwardBuildXp,
}: MiniBuildsArenaProps) {
  const styles = useThemedStyles(createStyles);

  const [activeId, setActiveId] = useState<MiniBuildId>("password_meter");
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() =>
    readCompletedMiniBuilds(),
  );
  const [codeByProject, setCodeByProject] = useState<Record<MiniBuildId, string>>(
    () => ({
      password_meter: getMiniBuildProject("password_meter").starterCode,
      url_shortener: getMiniBuildProject("url_shortener").starterCode,
      dice_rpg: getMiniBuildProject("dice_rpg").starterCode,
    }),
  );

  // Live preview inputs
  const [pwInput, setPwInput] = useState<string>("Devy2026!");
  const [urlInput, setUrlInput] = useState<string>(
    "https://devy.app/tracks/python/chapter-1/loops",
  );
  const [rpgSeed, setRpgSeed] = useState<number>(18);
  const [rpgBonus, setRpgBonus] = useState<number>(4);

  const [widgetData, setWidgetData] = useState<Record<string, any> | null>(null);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [isRunningWidget, setIsRunningWidget] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{
    passed: boolean;
    summary: string;
    results: TestCaseResult[];
  } | null>(null);
  const editorRef = useRef<any>(null);
  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const project = getMiniBuildProject(activeId);
  const activeCode = codeByProject[activeId];
  const isCompleted = Boolean(completedMap[activeId]);

  function handleSelectProject(nextId: MiniBuildId) {
    const target = getMiniBuildProject(nextId);
    if (target.isPro && !isPremium) {
      playKeyClick();
      onRequirePro();
      return;
    }
    playKeyClick();
    setActiveId(nextId);
    setWidgetData(null);
    setWidgetError(null);
    setVerifyFeedback(null);
  }

  function getActiveWidgetInput(overrides?: {
    seed?: number;
    attackBonus?: number;
  }): Record<string, string | number> {
    if (activeId === "password_meter") {
      return { password: pwInput };
    }
    if (activeId === "url_shortener") {
      return { url: urlInput };
    }
    return {
      seed: overrides?.seed ?? rpgSeed,
      attackBonus: overrides?.attackBonus ?? rpgBonus,
    };
  }

  async function handleRunLiveWidget(overrides?: {
    seed?: number;
    attackBonus?: number;
  }) {
    if (isRunningWidget) return;
    playKeyClick();
    setIsRunningWidget(true);
    setWidgetError(null);
    try {
      const script = buildMiniBuildWidgetScript(
        activeId,
        activeCode,
        getActiveWidgetInput(overrides),
      );
      const rawOut = await onRunPython(script);
      const parsed = parseMiniBuildWidgetOutput(rawOut);
      if (parsed) {
        setWidgetData(parsed);
        playSuccessChime();
      } else {
        setWidgetData(null);
        setWidgetError(
          rawOut.trim() ||
            "Your function ran but did not return a valid dict payload.",
        );
        playErrorBuzz();
      }
    } catch (err: any) {
      setWidgetError(err?.message || "Could not run live widget.");
      playErrorBuzz();
    } finally {
      setIsRunningWidget(false);
    }
  }

  async function handleVerifyAndShip() {
    if (isVerifying) return;
    playKeyClick();
    setIsVerifying(true);
    setVerifyFeedback(null);
    try {
      const outcome = await onVerifyBuild(
        activeCode,
        project.verificationHarness,
      );
      if (outcome.allPassed) {
        const alreadyDone = Boolean(completedMap[activeId]);
        const nextMap = markMiniBuildCompleted(activeId);
        setCompletedMap(nextMap);
        playVictoryFanfare();
        if (!alreadyDone) {
          onAwardBuildXp(project.xpReward);
        }
        setVerifyFeedback({
          passed: true,
          summary: alreadyDone
            ? "ALL CHECKS PASSED · TOOL VERIFIED!"
            : `SHIPPED! +${project.xpReward} XP EARNED`,
          results: outcome.results,
        });
        // Also refresh the live preview widget right away
        void handleRunLiveWidget();
      } else {
        playErrorBuzz();
        const passCount = outcome.results.filter((r) => r.passed).length;
        setVerifyFeedback({
          passed: false,
          summary:
            outcome.errorMessage ||
            `${passCount}/${outcome.results.length} spec checks passed — adjust your Python logic and retry.`,
          results: outcome.results,
        });
      }
    } catch (err: any) {
      playErrorBuzz();
      setVerifyFeedback({
        passed: false,
        summary: err?.message || "Verification failed.",
        results: [],
      });
    } finally {
      setIsVerifying(false);
    }
  }

  const completedCount = MINI_BUILD_PROJECTS.filter(
    (p) => completedMap[p.id],
  ).length;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Header & Project Selector */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconBadge}>
                <StudioIcon name="nav_minibuilds" size={24} />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.eyebrow}>
                  ARCADE CART-05 · INTERACTIVE PYTHON SANDBOXES
                </Text>
                <Text style={styles.title}>Cozy Mini-Builds</Text>
              </View>
            </View>

            <View style={styles.completedPill}>
              <StudioIcon name="trophy" size={14} />
              <Text style={styles.completedPillText}>
                {completedCount}/{MINI_BUILD_PROJECTS.length} SHIPPED
              </Text>
            </View>
          </View>

          <View style={styles.projectTabsRow}>
            {MINI_BUILD_PROJECTS.map((item) => {
              const selected = activeId === item.id;
              const locked = item.isPro && !isPremium;
              const done = Boolean(completedMap[item.id]);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select mini-build ${item.title}`}
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.projectTabBtn,
                    selected && [
                      styles.projectTabBtnActive,
                      { backgroundColor: item.accent },
                    ],
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => handleSelectProject(item.id)}
                >
                  <StudioIcon
                    name={locked ? "lock" : getBuildIcon(item.id)}
                    size={14}
                  />
                  <Text
                    style={[
                      styles.projectTabText,
                      selected && styles.projectTabTextActive,
                    ]}
                  >
                    {item.shortTitle}
                  </Text>
                  {done && (
                    <View style={styles.shippedMicroBadge}>
                      <Text style={styles.shippedMicroText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Split Workbench: Code Editor + Live Powered Preview Widget */}
        <View style={styles.workbenchGrid}>
          {/* Left Pane: Blueprint & Python Code */}
          <View style={styles.editorCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <View
                  style={[
                    styles.trackTag,
                    { backgroundColor: project.accent },
                  ]}
                >
                  <Text style={styles.trackTagText}>{project.trackBadge}</Text>
                </View>
                <Text style={styles.projectTitle}>{project.title}</Text>
              </View>
              <Text style={styles.xpHintText}>
                {isCompleted ? "✓ SHIPPED" : `+${project.xpReward} XP`}
              </Text>
            </View>

            <Text style={styles.projectDesc}>{project.description}</Text>

            <View style={styles.checklistBox}>
              {project.checklist.map((step, idx) => (
                <Text key={idx} style={styles.checklistItem}>
                  {idx + 1}. {step}
                </Text>
              ))}
            </View>

            <View style={styles.codeBox}>
              <View style={styles.codeBoxHeader}>
                <Text style={styles.codeFilename}>{project.id}.py</Text>
                <View style={styles.codeBoxActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Reset mini-build code"
                    style={styles.microBtn}
                    onPress={() => {
                      playKeyClick();
                      setCodeByProject((prev) => ({
                        ...prev,
                        [activeId]: project.starterCode,
                      }));
                    }}
                  >
                    <Text style={styles.microBtnText}>↺ RESET</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Load reference solution"
                    style={styles.microBtn}
                    onPress={() => {
                      playKeyClick();
                      setCodeByProject((prev) => ({
                        ...prev,
                        [activeId]: project.solutionCode,
                      }));
                    }}
                  >
                    <Text style={styles.microBtnText}>SOLUTION</Text>
                  </Pressable>
                </View>
              </View>

              <TextInput
                ref={editorRef}
                accessibilityLabel={`${project.title} Python editor`}
                value={activeCode}
                onChangeText={(next) =>
                  setCodeByProject((prev) => ({ ...prev, [activeId]: next }))
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
                    if (nativeEvt?.shiftKey) {
                      void handleVerifyAndShip();
                    } else {
                      void handleRunLiveWidget();
                    }
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
                        setCodeByProject((prev) => ({
                          ...prev,
                          [activeId]: autoEdit.code,
                        }));
                      }
                      setTimeout(() => {
                        try {
                          editorRef.current?.setSelectionRange?.(
                            autoEdit.selectionStart,
                            autoEdit.selectionEnd,
                          );
                        } catch {}
                      }, 0);
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

            <View style={styles.actionButtonsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Run live preview widget"
                disabled={isRunningWidget}
                style={({ pressed }) => [
                  styles.runWidgetBtn,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => void handleRunLiveWidget()}
              >
                <Text style={styles.runWidgetBtnText}>
                  {isRunningWidget ? "RUNNING..." : "▶ TEST LIVE WIDGET"}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Verify and ship mini-build"
                disabled={isVerifying}
                style={({ pressed }) => [
                  styles.verifyBtn,
                  { backgroundColor: project.accent },
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => void handleVerifyAndShip()}
              >
                <Text style={styles.verifyBtnText}>
                  {isVerifying
                    ? "VERIFYING..."
                    : isCompleted
                      ? "✓ RE-VERIFY TOOL"
                      : `✓ VERIFY & SHIP (+${project.xpReward} XP)`}
                </Text>
              </Pressable>
            </View>

            {verifyFeedback && (
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
                {verifyFeedback.results.length > 0 && (
                  <View style={styles.verifyList}>
                    {verifyFeedback.results.map((r) => (
                      <Text key={r.id} style={styles.verifyRowText}>
                        {r.passed ? "✓" : "✕"} {r.input} → {r.actual}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Right Pane: Live Powered Mini-App Widget */}
          <View style={styles.widgetCard}>
            <View
              style={[
                styles.widgetTopStrip,
                { backgroundColor: project.accent },
              ]}
            >
              <Text style={styles.widgetTopStripText}>
                LIVE PREVIEW WIDGET · POWERED BY YOUR PYTHON
              </Text>
              <Text style={styles.widgetEngineTag}>
                {pyodideReady ? "PY 3.11 LIVE" : "LOADING PY"}
              </Text>
            </View>

            <View style={styles.widgetBody}>
              {activeId === "password_meter" ? (
                <View style={styles.widgetSection}>
                  <Text style={styles.widgetFieldLabel}>
                    TRY ANY PASSWORD BELOW
                  </Text>
                  <View style={styles.widgetInputRow}>
                    <TextInput
                      accessibilityLabel="Test password input"
                      value={pwInput}
                      onChangeText={setPwInput}
                      placeholder="Type a password to test..."
                      placeholderTextColor="#7C8599"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.widgetInput}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Score password now"
                      style={styles.widgetGoBtn}
                      onPress={() => void handleRunLiveWidget()}
                    >
                      <Text style={styles.widgetGoBtnText}>CHECK</Text>
                    </Pressable>
                  </View>

                  {widgetData ? (
                    <View style={styles.widgetOutputCard}>
                      <View style={styles.meterHeaderRow}>
                        <Text style={styles.meterScoreText}>
                          {Number(widgetData.score ?? 0)} / 100
                        </Text>
                        <View
                          style={[
                            styles.meterLabelPill,
                            {
                              backgroundColor:
                                widgetData.label === "STRONG"
                                  ? StudioColors.lime
                                  : widgetData.label === "FAIR"
                                    ? StudioColors.yellow
                                    : StudioColors.coral,
                            },
                          ]}
                        >
                          <Text style={styles.meterLabelPillText}>
                            {String(widgetData.label || "UNKNOWN")}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.meterTrack}>
                        <View
                          style={[
                            styles.meterFill,
                            {
                              width: `${Math.max(4, Math.min(100, Number(widgetData.score ?? 0)))}%`,
                              backgroundColor:
                                widgetData.label === "STRONG"
                                  ? StudioColors.lime
                                  : widgetData.label === "FAIR"
                                    ? StudioColors.yellow
                                    : StudioColors.coral,
                            },
                          ]}
                        />
                      </View>
                      {Array.isArray(widgetData.tips) &&
                      widgetData.tips.length > 0 ? (
                        <View style={styles.tipsList}>
                          {widgetData.tips.map((tip: string, idx: number) => (
                            <Text key={idx} style={styles.tipItemText}>
                              • {tip}
                            </Text>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.tipSuccessText}>
                          ✓ Rock-solid password — zero weak spots!
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.widgetEmptyBox}>
                      <Text style={styles.widgetEmptyText}>
                        Tap ▶ TEST LIVE WIDGET to power this meter with your
                        score_password() function!
                      </Text>
                    </View>
                  )}
                </View>
              ) : activeId === "url_shortener" ? (
                <View style={styles.widgetSection}>
                  <Text style={styles.widgetFieldLabel}>
                    PASTE ANY LONG URL
                  </Text>
                  <View style={styles.widgetInputRow}>
                    <TextInput
                      accessibilityLabel="Long URL input"
                      value={urlInput}
                      onChangeText={setUrlInput}
                      placeholder="https://example.com/very/long/path"
                      placeholderTextColor="#7C8599"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.widgetInput}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Shorten URL now"
                      style={styles.widgetGoBtn}
                      onPress={() => void handleRunLiveWidget()}
                    >
                      <Text style={styles.widgetGoBtnText}>MINT</Text>
                    </Pressable>
                  </View>

                  {widgetData ? (
                    <View style={styles.widgetOutputCard}>
                      <Text style={styles.shortUrlCaption}>
                        GENERATED SHORT LINK
                      </Text>
                      <View style={styles.shortUrlPill}>
                        <Text style={styles.shortUrlText}>
                          {String(widgetData.short_url || "devy.sh/------")}
                        </Text>
                      </View>
                      <View style={styles.urlStatsRow}>
                        <Text style={styles.urlStatChip}>
                          SLUG: {String(widgetData.code || "---")}
                        </Text>
                        <Text style={styles.urlStatChip}>
                          SAVED {Number(widgetData.saved_chars ?? 0)} CHARS
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.widgetEmptyBox}>
                      <Text style={styles.widgetEmptyText}>
                        Tap ▶ TEST LIVE WIDGET or MINT to run shorten_url() on
                        your input!
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.widgetSection}>
                  <Text style={styles.widgetFieldLabel}>
                    ENCOUNTER CONTROLS
                  </Text>
                  <View style={styles.rpgControlsRow}>
                    <View style={styles.rpgStatChip}>
                      <Text style={styles.rpgStatText}>SEED #{rpgSeed}</Text>
                    </View>
                    <View style={styles.rpgStatChip}>
                      <Text style={styles.rpgStatText}>ATK +{rpgBonus}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Roll new RPG encounter"
                      style={styles.widgetGoBtn}
                      onPress={() => {
                        const nextSeed = ((rpgSeed + 5) % 97) + 1;
                        setRpgSeed(nextSeed);
                        void handleRunLiveWidget({ seed: nextSeed });
                      }}
                    >
                      <Text style={styles.widgetGoBtnText}>ROLL D20</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Increase attack bonus"
                      style={styles.microBtn}
                      onPress={() => {
                        const nextBonus = (rpgBonus + 1) % 9;
                        setRpgBonus(nextBonus);
                        void handleRunLiveWidget({ attackBonus: nextBonus });
                      }}
                    >
                      <Text style={styles.microBtnText}>+ATK</Text>
                    </Pressable>
                  </View>

                  {widgetData ? (
                    <View style={styles.widgetOutputCard}>
                      <View style={styles.rpgResultRow}>
                        <View style={styles.d20Badge}>
                          <Text style={styles.d20Label}>D20</Text>
                          <Text style={styles.d20Val}>
                            {Number(widgetData.roll ?? 0)}
                          </Text>
                        </View>
                        <View style={styles.rpgOutcomeCol}>
                          <View
                            style={[
                              styles.meterLabelPill,
                              {
                                alignSelf: "flex-start",
                                backgroundColor:
                                  widgetData.outcome === "CRIT"
                                    ? StudioColors.yellow
                                    : widgetData.outcome === "HIT"
                                      ? StudioColors.lime
                                      : StudioColors.coral,
                              },
                            ]}
                          >
                            <Text style={styles.meterLabelPillText}>
                              {String(widgetData.outcome || "MISS")}
                            </Text>
                          </View>
                          <Text style={styles.rpgDamageText}>
                            {Number(widgetData.damage ?? 0)} DMG (TOTAL{" "}
                            {Number(widgetData.total ?? 0)})
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.widgetEmptyBox}>
                      <Text style={styles.widgetEmptyText}>
                        Tap ▶ TEST LIVE WIDGET or ROLL D20 to run
                        roll_encounter()!
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {widgetError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{widgetError}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
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
      maxWidth: 1060,
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
      backgroundColor: StudioColors.violet,
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
    completedPill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 30,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    completedPillText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    projectTabsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    projectTabBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 34,
      backgroundColor: StudioColors.bg,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 6,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    projectTabBtnActive: {
      borderColor: StudioColors.ink,
    },
    projectTabText: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    projectTabTextActive: {
      color: StudioColors.ink,
    },
    shippedMicroBadge: {
      backgroundColor: StudioColors.ink,
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    shippedMicroText: {
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
    },
    workbenchGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
      alignItems: "flex-start",
    },
    editorCard: {
      flex: 1.35,
      minWidth: 300,
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 15,
      padding: 15,
      gap: 11,
      ...HardShadow,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    sectionTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    trackTag: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2.5,
    },
    trackTagText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    projectTitle: {
      color: StudioColors.textPrimary,
      fontSize: 16,
      fontWeight: "900",
    },
    xpHintText: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    projectDesc: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    checklistBox: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 9,
      padding: 10,
      gap: 4,
    },
    checklistItem: {
      color: StudioColors.textSecondary,
      fontSize: 11.5,
      fontWeight: "700",
      lineHeight: 17,
    },
    codeBox: {
      backgroundColor: "#14161F",
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 11,
      overflow: "hidden",
    },
    codeBoxHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 11,
      paddingVertical: 7,
      backgroundColor: "#1E2230",
      borderBottomWidth: 1.5,
      borderBottomColor: "#2E344A",
    },
    codeFilename: {
      color: "#E2E8F0",
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    codeBoxActions: {
      flexDirection: "row",
      gap: 6,
    },
    microBtn: {
      backgroundColor: "#2B3144",
      borderWidth: 1.5,
      borderColor: "#475569",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    microBtnText: {
      color: "#F8FAFC",
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    codeInput: {
      minHeight: 220,
      padding: 12,
      color: "#F8FAFC",
      fontSize: 12.5,
      lineHeight: 19,
      fontFamily: MonoFont,
      textAlignVertical: "top",
      ...Platform.select({ web: { outlineStyle: "none" } as any }),
    },
    actionButtonsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    runWidgetBtn: {
      flex: 1,
      minWidth: 150,
      backgroundColor: StudioColors.bg,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    runWidgetBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    verifyBtn: {
      flex: 1.2,
      minWidth: 170,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    verifyBtnText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    verifyBanner: {
      borderWidth: 2,
      borderRadius: 10,
      padding: 10,
      gap: 6,
    },
    verifyBannerPass: {
      backgroundColor: "rgba(184, 255, 59, 0.14)",
      borderColor: StudioColors.lime,
    },
    verifyBannerFail: {
      backgroundColor: "rgba(255, 107, 107, 0.14)",
      borderColor: StudioColors.coral,
    },
    verifyBannerTitle: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    verifyList: {
      gap: 3,
    },
    verifyRowText: {
      color: StudioColors.textSecondary,
      fontSize: 10.5,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    widgetCard: {
      flex: 1,
      minWidth: 280,
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 15,
      overflow: "hidden",
      ...HardShadow,
    },
    widgetTopStrip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
      gap: 8,
    },
    widgetTopStripText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
      flex: 1,
    },
    widgetEngineTag: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    widgetBody: {
      padding: 15,
      gap: 12,
    },
    widgetSection: {
      gap: 10,
    },
    widgetFieldLabel: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    widgetInputRow: {
      flexDirection: "row",
      gap: 7,
      alignItems: "center",
    },
    widgetInput: {
      flex: 1,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      fontFamily: MonoFont,
      ...Platform.select({ web: { outlineStyle: "none" } as any }),
    },
    widgetGoBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 8,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    widgetGoBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    widgetOutputCard: {
      backgroundColor: StudioColors.bg,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 11,
      padding: 13,
      gap: 10,
    },
    meterHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    meterScoreText: {
      color: StudioColors.textPrimary,
      fontSize: 20,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    meterLabelPill: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    meterLabelPillText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    meterTrack: {
      height: 12,
      borderRadius: 6,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    meterFill: {
      height: "100%",
    },
    tipsList: {
      gap: 4,
    },
    tipItemText: {
      color: StudioColors.textSecondary,
      fontSize: 11.5,
      fontWeight: "700",
    },
    tipSuccessText: {
      color: StudioColors.lime,
      fontSize: 11.5,
      fontWeight: "800",
    },
    shortUrlCaption: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    shortUrlPill: {
      backgroundColor: "#14161F",
      borderWidth: 2,
      borderColor: "#38BDF8",
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    shortUrlText: {
      color: "#6EE7B7",
      fontSize: 16,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    urlStatsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    urlStatChip: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    rpgControlsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 7,
    },
    rpgStatChip: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    rpgStatText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    rpgResultRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    d20Badge: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: StudioColors.violet,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    d20Label: {
      color: StudioColors.ink,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    d20Val: {
      color: StudioColors.ink,
      fontSize: 20,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    rpgOutcomeCol: {
      flex: 1,
      gap: 5,
    },
    rpgDamageText: {
      color: StudioColors.textPrimary,
      fontSize: 14,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    widgetEmptyBox: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 10,
      padding: 14,
    },
    widgetEmptyText: {
      color: StudioColors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
    },
    errorBox: {
      backgroundColor: "rgba(255, 107, 107, 0.14)",
      borderWidth: 1.5,
      borderColor: StudioColors.coral,
      borderRadius: 9,
      padding: 10,
    },
    errorText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
  });
