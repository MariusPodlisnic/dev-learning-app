import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LessonEnrichment } from "../constants/curriculum";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { Lesson } from "../types/lesson";

interface ProSolutionCardProps {
  selectedLesson: Lesson;
  lessonEnrichment: LessonEnrichment | null;
  isPremium: boolean;
  onLoadSolution: (solutionCode: string) => void;
  onOpenPaywall: () => void;
}

interface WalkthroughStep {
  lineNumber: number;
  codeLine: string;
  explanation: string;
}

function explainPythonLine(line: string): string {
  const trimmed = line.trim();

  if (trimmed.startsWith("def ")) {
    const match = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\((.*)\):/);
    if (match) {
      const fnName = match[1];
      const params = match[2] || "no inputs";
      return `Defines the function \`${fnName}\` and accepts (${params}) as input.`;
    }
    return "Defines the reusable function block.";
  }

  if (trimmed.startsWith("class ")) {
    return "Defines a class blueprint for creating structured objects.";
  }

  if (trimmed.startsWith("try:")) {
    return "Starts a safety block to attempt code that might raise an error.";
  }

  if (trimmed.startsWith("except")) {
    return "Catches the error safely and runs the fallback logic instead of crashing.";
  }

  if (trimmed.startsWith("for ") && trimmed.includes("enumerate(")) {
    return "Loops through each item while tracking both its position index and value in one pass.";
  }

  if (trimmed.startsWith("for ") && trimmed.endsWith(":")) {
    return "Loops through each item in the collection one by one.";
  }

  if (trimmed.startsWith("while ") && trimmed.endsWith(":")) {
    return "Repeats the indented block as long as the condition stays True.";
  }

  if (trimmed.startsWith("if ") || trimmed.startsWith("elif ")) {
    return "Checks whether this condition is True before running the indented line.";
  }

  if (trimmed === "else:") {
    return "Runs this fallback branch when the earlier if-condition was False.";
  }

  if (trimmed.startsWith("del ")) {
    return "Lazily evicts the expired or stale entry directly from memory.";
  }

  if (trimmed.startsWith("return ")) {
    const expr = trimmed.slice(7).trim();
    if (expr === "len(stack) == 0") {
      return "Returns True only if every opening bracket was matched and popped off the stack.";
    }
    if (expr.includes("dict(zip(")) {
      return "Pairs items at matching positions from both lists into a dictionary and returns it.";
    }
    if (expr.includes("len(") && expr.includes("set(")) {
      return "Compares total length against unique set size to detect duplicates in O(n) time.";
    }
    if (expr.includes("abs(")) {
      return "Returns the non-negative absolute difference regardless of operand order.";
    }
    if (expr.includes(".count(")) {
      return "Counts how many times the target value appears in the list and returns that number.";
    }
    if (expr.includes("sorted(set(")) {
      return "Removes duplicates with set() and returns the remaining items sorted in order.";
    }
    if (expr.includes("sorted(") && expr.includes("reverse=True")) {
      return "Sorts the items from highest to lowest (descending order) and returns the list.";
    }
    if (expr.includes(".join(")) {
      return "Glues all words in the list together using the separator string and returns the result.";
    }
    if (expr.includes("[:")) {
      return "Slices the list from the beginning up to the cutoff index and returns those items.";
    }
    if (expr.includes("[::-1]")) {
      return "Reverses the sequence with a negative slice step and checks symmetry.";
    }
    if (expr.includes(".replace(")) {
      return "Finds every match of the old word and swaps it with the new text.";
    }
    if (expr.includes("sum(")) {
      return "Adds all numbers in the list together and returns the total sum.";
    }
    if (expr.includes(".startswith(")) {
      return "Checks if the string begins with the given prefix and returns True or False.";
    }
    if (expr.includes(".get(")) {
      return "Safely looks up the key in the dictionary, returning the fallback default if missing.";
    }
    if (expr.includes("min(")) {
      return "Scans the values and returns the smallest (minimum) number.";
    }
    if (expr.includes("max(")) {
      return "Scans the values and returns the largest (maximum) number.";
    }
    if (expr.includes("for ") && expr.includes(" in ")) {
      return "Builds and returns a filtered list keeping only the items that match the rule.";
    }
    if (expr.includes(" in ")) {
      return "Checks whether the item exists inside the collection and returns True or False.";
    }
    if (expr.includes("// 2")) {
      return "Uses integer division (// 2) to jump straight to the middle index.";
    }
    return `Hands the final result (\`${expr}\`) back to whoever called the function.`;
  }

  if (trimmed.includes(".setdefault(")) {
    return "Initializes an empty bucket list on first sight and appends the current item.";
  }

  if (trimmed.includes(".append(")) {
    return "Adds the new value onto the end of the result list.";
  }

  if (trimmed.includes(".pop(")) {
    return "Removes and discards the top element from the stack in O(1) time.";
  }

  if (trimmed.includes("float(") && trimmed.includes("inf")) {
    return "Initializes a positive-infinity sentinel so the first real value always beats it.";
  }

  if (trimmed.includes("sorted(") && trimmed.includes("key=")) {
    return "Sorts items deterministically using a custom key selector function.";
  }

  if (trimmed.includes("min(capacity,")) {
    return "Refills tokens lazily from elapsed time while capping at maximum bucket capacity.";
  }

  if (trimmed.includes("self.")) {
    return "Reads or updates instance state persisted on the service object.";
  }

  if (trimmed.includes("+=")) {
    return "Adds the right-hand value into the running variable.";
  }

  if (trimmed.includes("-=")) {
    return "Decrements the running counter or pointer by the right-hand amount.";
  }

  if (trimmed.startsWith("print(")) {
    return "Prints the output to the console so you can verify the result.";
  }

  if (trimmed.includes("=")) {
    const parts = trimmed.split("=");
    const varName = parts[0].trim();
    return `Stores the value on the right inside \`${varName}\` so we can use it next.`;
  }

  return "Executes this step of the Python solution.";
}

function buildCleanSolutionAndSteps(
  selectedLesson: Lesson,
  lessonEnrichment: LessonEnrichment | null,
): { cleanCode: string; steps: WalkthroughStep[] } {
  const rawSource =
    lessonEnrichment?.solutionCode ||
    lessonEnrichment?.guidedCode ||
    lessonEnrichment?.cheatSheet ||
    selectedLesson.initial_code ||
    "";

  // Remove the "# 💡 HELPFUL EXAMPLE:" footer if present and strip "# 👉" hint comments
  const beforeHelpfulFooter = rawSource.split("# 💡 HELPFUL EXAMPLE:")[0];
  const rawLines = beforeHelpfulFooter.replace(/\\n/g, "\n").split("\n");

  const keptLines = rawLines.filter((line) => {
    const t = line.trim();
    if (t.startsWith("# 👉")) return false;
    return true;
  });

  const cleanCode = keptLines.join("\n").trim();
  const finalLines = cleanCode.split("\n");

  const steps: WalkthroughStep[] = [];
  finalLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    steps.push({
      lineNumber: idx + 1,
      codeLine: line,
      explanation: explainPythonLine(line),
    });
  });

  return { cleanCode, steps };
}

export default function ProSolutionCard({
  selectedLesson,
  lessonEnrichment,
  isPremium,
  onLoadSolution,
  onOpenPaywall,
}: ProSolutionCardProps) {
  const styles = getStyles();
  const [revealedLessonId, setRevealedLessonId] = useState<string | null>(null);
  const revealed = revealedLessonId === selectedLesson.id;

  const { cleanCode, steps } = buildCleanSolutionAndSteps(
    selectedLesson,
    lessonEnrichment,
  );
  const firstStep = steps[0];
  const remainingStepsCount = Math.max(steps.length - 1, 1);

  const insights = lessonEnrichment?.proInsights;
  const displayTime =
    insights?.timeComplexity || selectedLesson.complexities?.time || "";
  const displaySpace =
    insights?.spaceComplexity || selectedLesson.complexities?.space || "";

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.proSticker}>
          <Text style={styles.proStickerText}>
            ★ PRO SOLUTION & WALKTHROUGH
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            isPremium ? styles.statusBadgeUnlocked : styles.statusBadgeLocked,
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {isPremium ? "✓ PRO UNLOCKED" : "🔒 PRO FEATURE"}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>
        Stuck? Inspect the Official Line-by-Line Solution
      </Text>
      <Text style={styles.cardSubtitle}>
        See the exact reference code with a plain-English explanation for every
        single line.
      </Text>

      {isPremium ? (
        <>
          <Pressable
            style={({ pressed }) => [
              styles.revealToggleBtn,
              revealed && styles.revealToggleBtnActive,
              pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
            ]}
            onPress={() =>
              setRevealedLessonId((prev) =>
                prev === selectedLesson.id ? null : selectedLesson.id,
              )
            }
          >
            <Text style={styles.revealToggleBtnText}>
              {revealed
                ? "🙈 HIDE OFFICIAL SOLUTION"
                : "👁 REVEAL OFFICIAL SOLUTION & WALKTHROUGH"}
            </Text>
          </Pressable>

          {revealed && (
            <View style={styles.solutionBody}>
              {(insights || displayTime || displaySpace) && (
                <View style={styles.insightsCard}>
                  <View style={styles.insightsTopRow}>
                    <Text style={styles.insightsBadge}>
                      COMPLEXITY & TRADE-OFF BRIEF
                    </Text>
                    <View style={styles.complexityPillsRow}>
                      {!!displayTime && (
                        <View style={styles.complexityPill}>
                          <Text style={styles.complexityPillText}>
                            TIME: {displayTime}
                          </Text>
                        </View>
                      )}
                      {!!displaySpace && (
                        <View style={styles.complexityPill}>
                          <Text style={styles.complexityPillText}>
                            SPACE: {displaySpace}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {insights?.tradeoff && (
                    <Text style={styles.insightsTradeoff}>
                      {insights.tradeoff}
                    </Text>
                  )}
                  {insights?.followUp && (
                    <View style={styles.followUpBox}>
                      <Text style={styles.followUpLabel}>
                        INTERVIEW FOLLOW-UP
                      </Text>
                      <Text style={styles.followUpText}>
                        {insights.followUp}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Step-by-Step Line Breakdown */}
              <Text style={styles.sectionLabel}>
                LINE-BY-LINE PLAIN-ENGLISH BREAKDOWN
              </Text>
              <View style={styles.stepsList}>
                {steps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={styles.stepTopLine}>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>
                          LINE {String(step.lineNumber).padStart(2, "0")}
                        </Text>
                      </View>
                      <Text style={styles.stepCodeSnippet}>
                        {step.codeLine.trim()}
                      </Text>
                    </View>
                    <Text style={styles.stepExplanation}>
                      → {step.explanation}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Full Reference Code Block */}
              <View style={styles.codeBox}>
                <View style={styles.codeBoxHeader}>
                  <Text style={styles.codeBoxHeaderLabel}>
                    OFFICIAL VERIFIED SOLUTION (PYTHON 3.11)
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.loadEditorBtn,
                      pressed && {
                        transform: [{ translateX: 1 }, { translateY: 1 }],
                      },
                    ]}
                    onPress={() => onLoadSolution(cleanCode)}
                  >
                    <Text style={styles.loadEditorBtnText}>
                      ⚡ LOAD INTO EDITOR
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.codeBoxText}>{cleanCode}</Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.teaserContainer}>
          {/* Free Teaser: Show Step 1 Unlocked */}
          {firstStep && (
            <View style={styles.stepItem}>
              <View style={styles.stepTopLine}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>
                    STEP 01 PREVIEW
                  </Text>
                </View>
                <Text style={styles.stepCodeSnippet}>
                  {firstStep.codeLine.trim()}
                </Text>
              </View>
              <Text style={styles.stepExplanation}>
                → {firstStep.explanation}
              </Text>
            </View>
          )}

          {/* Locked Remaining Steps & 1-Click Solution Loader */}
          <View style={styles.lockedTeaserBox}>
            <View style={styles.lockedTeaserTop}>
              <Text style={styles.lockedTeaserTitle}>
                🔒 +{remainingStepsCount} MORE STEP EXPLANATIONS & FULL RUNNABLE
                SOLUTION
              </Text>
              <Text style={styles.lockedTeaserDesc}>
                Upgrade to Pro to unlock line-by-line solution breakdowns,
                1-click solution loading, and all 48 modules across every track.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.unlockProBtn,
                pressed && {
                  transform: [{ translateX: 2 }, { translateY: 2 }],
                },
              ]}
              onPress={onOpenPaywall}
            >
              <Text style={styles.unlockProBtnText}>
                ★ UNLOCK OFFICIAL SOLUTIONS & WALKTHROUGHS
              </Text>
              <View style={styles.unlockProKeycap}>
                <Text style={styles.unlockProKeycapText}>PRO →</Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    card: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 10,
      padding: 18,
      marginTop: 14,
      marginBottom: 16,
      gap: 10,
      overflow: "hidden",
      ...HardShadow,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    proSticker: {
      backgroundColor: StudioColors.pink,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 4,
    },
    proStickerText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    statusBadgeUnlocked: {
      backgroundColor: StudioColors.lime,
    },
    statusBadgeLocked: {
      backgroundColor: StudioColors.yellow,
    },
    statusBadgeText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    cardTitle: {
      color: StudioColors.textPrimary,
      fontSize: 15,
      fontWeight: "900",
      lineHeight: 21,
    },
    cardSubtitle: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    revealToggleBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      alignItems: "center",
      marginTop: 2,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    revealToggleBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    revealToggleBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    solutionBody: {
      gap: 12,
      marginTop: 4,
    },
    insightsCard: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      padding: 12,
      gap: 8,
    },
    insightsTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    insightsBadge: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    complexityPillsRow: {
      flexDirection: "row",
      gap: 6,
      flexWrap: "wrap",
    },
    complexityPill: {
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    complexityPillText: {
      color: StudioColors.amber,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    insightsTradeoff: {
      color: StudioColors.textPrimary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    followUpBox: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1,
      borderColor: StudioColors.border,
      borderRadius: 6,
      padding: 9,
      gap: 3,
    },
    followUpLabel: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    followUpText: {
      color: StudioColors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 17,
    },
    sectionLabel: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    stepsList: {
      gap: 8,
    },
    stepItem: {
      backgroundColor: StudioColors.bg,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      padding: 11,
      gap: 6,
      overflow: "hidden",
    },
    stepTopLine: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    stepBadge: {
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    stepBadgeText: {
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    stepCodeSnippet: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      fontFamily: MonoFont,
      flexShrink: 1,
      ...Platform.select({
        web: {
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    stepExplanation: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    codeBox: {
      backgroundColor: StudioColors.codeBg,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    codeBoxHeader: {
      backgroundColor: StudioColors.codeSurface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.codeBorder,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    codeBoxHeaderLabel: {
      color: StudioColors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    loadEditorBtn: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    loadEditorBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    codeBoxText: {
      color: StudioColors.codeText,
      fontSize: 13,
      lineHeight: 20,
      fontFamily: MonoFont,
      padding: 12,
      ...Platform.select({
        web: {
          whiteSpace: "pre-wrap" as any,
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    teaserContainer: {
      gap: 10,
      marginTop: 2,
    },
    lockedTeaserBox: {
      backgroundColor: StudioColors.bg,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderStyle: "dashed",
      padding: 14,
      gap: 12,
    },
    lockedTeaserTop: {
      gap: 4,
    },
    lockedTeaserTitle: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    lockedTeaserDesc: {
      color: StudioColors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 18,
    },
    unlockProBtn: {
      backgroundColor: StudioColors.pink,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    unlockProBtnText: {
      color: StudioColors.ink,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
      flexShrink: 1,
    },
    unlockProKeycap: {
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 5,
    },
    unlockProKeycapText: {
      color: StudioColors.pink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
  });
