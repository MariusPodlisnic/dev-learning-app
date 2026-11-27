import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  type ConceptTinkerSpec,
  parseParameterAssignments,
} from "../utils/conceptTinkerXray";
import { playKeyClick } from "../utils/soundEffects";
import { renderHighlightedPython } from "./FormattedText";
import { StudioIcon, Text } from "./StudioIcon";

interface InteractiveConceptBoxProps {
  spec: ConceptTinkerSpec;
}

export default function InteractiveConceptBox({
  spec,
}: InteractiveConceptBoxProps) {
  const styles = useThemedStyles(createStyles);
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [xrayOpen, setXrayOpen] = useState<boolean>(false);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(0);

  const safeScenarioIdx = Math.min(
    scenarioIdx,
    Math.max(0, spec.scenarios.length - 1),
  );
  const activeScenario = spec.scenarios[safeScenarioIdx];
  const executedSet = new Set(activeScenario?.executedLineIndices || []);
  const paramChips = parseParameterAssignments(
    activeScenario?.inputDisplay || "",
  );

  const safeTokenIdx = Math.min(
    selectedTokenIdx,
    Math.max(0, spec.xrayTokens.length - 1),
  );
  const activeToken = spec.xrayTokens[safeTokenIdx];

  return (
    <View style={styles.wrapper}>
      {/* Compact Header Row (replaces static SIMPLE EXAMPLE header — 0px extra height!) */}
      <View style={styles.metaRow}>
        <View style={styles.badge}>
          <StudioIcon name="terminal" size={14} />
          <Text style={styles.badgeText}>SIMPLE EXAMPLE · TINKER LIVE</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            xrayOpen ? "Hide syntax X-Ray" : "Inspect syntax with X-Ray"
          }
          onPress={() => {
            playKeyClick();
            setXrayOpen((prev) => !prev);
          }}
          style={({ pressed }) => [
            styles.xrayToggleBtn,
            xrayOpen && styles.xrayToggleBtnActive,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text
            style={[
              styles.xrayToggleText,
              xrayOpen && styles.xrayToggleTextActive,
            ]}
          >
            {xrayOpen ? "🩻 X-RAY: ON" : "🩻 X-RAY SYNTAX"}
          </Text>
        </Pressable>
      </View>

      {/* Interactive Code Terminal */}
      <View style={styles.terminalBox}>
        {/* Scenario Input Switcher Bar */}
        <View style={styles.scenarioBar}>
          <Text style={styles.scenarioBarLabel}>TEST INPUT:</Text>
          <View style={styles.scenarioPillsRow}>
            {spec.scenarios.map((sc, idx) => {
              const isSelected = idx === safeScenarioIdx;
              return (
                <Pressable
                  key={idx}
                  onPress={() => {
                    playKeyClick();
                    setScenarioIdx(idx);
                  }}
                  style={({ pressed }) => [
                    styles.scenarioPill,
                    isSelected && styles.scenarioPillActive,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text
                    style={[
                      styles.scenarioPillText,
                      isSelected && styles.scenarioPillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {sc.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* X-Ray Clickable Token Bar (only unfolded when X-Ray is toggled ON) */}
        {xrayOpen && spec.xrayTokens.length > 0 && (
          <View style={styles.xrayDrawer}>
            <View style={styles.xrayChipsRow}>
              <Text style={styles.xrayChipsLabel}>TAP TOKEN:</Text>
              {spec.xrayTokens.map((tok, tIdx) => {
                const isActiveTok = tIdx === safeTokenIdx;
                return (
                  <Pressable
                    key={tok.id}
                    onPress={() => {
                      playKeyClick();
                      setSelectedTokenIdx(tIdx);
                    }}
                    style={[
                      styles.xrayChip,
                      isActiveTok && styles.xrayChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.xrayChipText,
                        isActiveTok && styles.xrayChipTextActive,
                      ]}
                    >
                      {tok.tokenLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {activeToken && (
              <View style={styles.xrayExplainCard}>
                <View style={styles.xrayExplainHeader}>
                  <Text style={styles.xrayCategoryTag}>
                    {activeToken.category}
                  </Text>
                  <Text style={styles.xrayTokenTitle}>
                    {activeToken.tokenLabel}
                  </Text>
                </View>
                <Text style={styles.xrayWhatText}>
                  <Text style={styles.xrayStrongMint}>✓ Does: </Text>
                  {activeToken.whatItDoes}
                </Text>
                <Text style={styles.xrayBreakText}>
                  <Text style={styles.xrayStrongCoral}>⚠ Without it: </Text>
                  {activeToken.whatBreaksWithoutIt}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* High-Visibility Active Parameters Banner */}
        <View style={styles.paramsBanner}>
          <Text style={styles.paramsBannerLabel}>📥 PARAMETERS PASSED IN:</Text>
          <View style={styles.paramsChipsWrap}>
            {paramChips.map((chip, cIdx) =>
              chip.name ? (
                <View key={cIdx} style={styles.paramChip}>
                  <Text style={styles.paramNameText}>{chip.name}</Text>
                  <Text style={styles.paramEqualsText}>=</Text>
                  <View style={styles.paramValuePill}>
                    <Text style={styles.paramValueText}>{chip.value}</Text>
                  </View>
                </View>
              ) : (
                <View key={cIdx} style={styles.paramChip}>
                  <Text style={styles.paramValueText}>{chip.value}</Text>
                </View>
              ),
            )}
          </View>
        </View>

        {/* Code Lines with Live Executed vs Skipped Branch Highlighting */}
        <View style={styles.codeLinesContainer}>
          <View style={styles.codeHeaderSubRow}>
            <Text style={styles.codeBlockLang}>🐍 CONCEPT IN ACTION</Text>
          </View>

          {spec.codeLines.map((line, lIdx) => {
            const didRun = executedSet.has(lIdx);
            return (
              <View
                key={lIdx}
                style={[
                  styles.codeLineRow,
                  didRun ? styles.codeLineExecuted : styles.codeLineSkipped,
                ]}
              >
                <Text
                  style={[
                    styles.lineMarker,
                    !didRun && styles.lineMarkerSkipped,
                  ]}
                >
                  {didRun ? "▶" : "·"}
                </Text>
                <Text style={styles.codeLineText}>
                  {renderHighlightedPython(line)}
                </Text>
                {!didRun && (
                  <Text style={styles.skippedTag}>SKIPPED</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Live Output & 1-Line Trace Footer */}
        <View style={styles.outputFooter}>
          <View style={styles.outputTopLine}>
            <Text style={styles.outputPrefix}>↳ RETURNS:</Text>
            <Text style={styles.outputValue}>
              {activeScenario.outputDisplay}
            </Text>
          </View>
          <Text style={styles.traceNoteText}>{activeScenario.traceNote}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (Colors: StudioThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginTop: 12,
      gap: 7,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: Colors.lime,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: Colors.ink,
    },
    badgeText: {
      color: Colors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    xrayToggleBtn: {
      backgroundColor: Colors.bg,
      borderWidth: 1.5,
      borderColor: Colors.yellow,
      paddingHorizontal: 9,
      paddingVertical: 3.5,
      borderRadius: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    xrayToggleBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: Colors.ink,
    },
    xrayToggleText: {
      color: Colors.yellow,
      fontSize: 9.5,
      fontFamily: MonoFont,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    xrayToggleTextActive: {
      color: Colors.ink,
    },
    terminalBox: {
      backgroundColor: Colors.codeBg,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: Colors.border,
      overflow: "hidden",
    },
    scenarioBar: {
      backgroundColor: Colors.codeSurface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: Colors.codeBorder,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    scenarioBarLabel: {
      color: Colors.textMuted,
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.6,
    },
    scenarioPillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
      flex: 1,
    },
    scenarioPill: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderWidth: 1,
      borderColor: Colors.codeBorder,
      borderRadius: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    scenarioPillActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: Colors.ink,
    },
    scenarioPillText: {
      color: Colors.codeText,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "800",
    },
    scenarioPillTextActive: {
      color: Colors.ink,
      fontWeight: "900",
    },
    xrayDrawer: {
      backgroundColor: "rgba(251, 191, 36, 0.07)",
      borderBottomWidth: 1,
      borderBottomColor: Colors.codeBorder,
      padding: 10,
      gap: 8,
    },
    xrayChipsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 5,
    },
    xrayChipsLabel: {
      color: Colors.yellow,
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "900",
      marginRight: 2,
    },
    xrayChip: {
      backgroundColor: Colors.codeSurface,
      borderWidth: 1,
      borderColor: Colors.codeBorder,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    xrayChipActive: {
      backgroundColor: StudioColors.lime,
      borderColor: Colors.ink,
    },
    xrayChipText: {
      color: Colors.codeText,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "800",
    },
    xrayChipTextActive: {
      color: Colors.ink,
      fontWeight: "900",
    },
    xrayExplainCard: {
      backgroundColor: Colors.codeSurface,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: Colors.codeBorder,
      padding: 9,
      gap: 4,
    },
    xrayExplainHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    xrayCategoryTag: {
      backgroundColor: "rgba(52, 211, 153, 0.16)",
      color: Colors.mint,
      fontFamily: MonoFont,
      fontSize: 8.5,
      fontWeight: "900",
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 4,
    },
    xrayTokenTitle: {
      color: Colors.codeText,
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
    },
    xrayWhatText: {
      color: Colors.codeText,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "500",
    },
    xrayBreakText: {
      color: "#CBD5E1",
      fontSize: 11.5,
      lineHeight: 16.5,
      fontWeight: "500",
    },
    xrayStrongMint: {
      color: Colors.lime,
      fontWeight: "900",
      fontFamily: MonoFont,
      fontSize: 10.5,
    },
    xrayStrongCoral: {
      color: Colors.coral,
      fontWeight: "900",
      fontFamily: MonoFont,
      fontSize: 10.5,
    },
    paramsBanner: {
      backgroundColor: "rgba(56, 189, 248, 0.08)",
      borderBottomWidth: 1.5,
      borderBottomColor: Colors.codeBorder,
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 6,
    },
    paramsBannerLabel: {
      color: "#7DD3FC",
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
    paramsChipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },
    paramChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.codeSurface,
      borderWidth: 1.5,
      borderColor: "rgba(125, 211, 252, 0.45)",
      borderRadius: 6,
      paddingLeft: 8,
      paddingRight: 4,
      paddingVertical: 3.5,
      gap: 5,
    },
    paramNameText: {
      color: "#7DD3FC",
      fontFamily: MonoFont,
      fontSize: 12,
      fontWeight: "900",
    },
    paramEqualsText: {
      color: Colors.textMuted,
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
    },
    paramValuePill: {
      backgroundColor: "rgba(251, 191, 36, 0.18)",
      borderWidth: 1,
      borderColor: StudioColors.yellow,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 1.5,
    },
    paramValueText: {
      color: StudioColors.yellow,
      fontFamily: MonoFont,
      fontSize: 12,
      fontWeight: "900",
    },
    codeLinesContainer: {
      paddingBottom: 6,
    },
    codeHeaderSubRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 8,
    },
    codeBlockLang: {
      color: Colors.lime,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
    },
    codeLineRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 2,
      gap: 6,
    },
    codeLineExecuted: {
      backgroundColor: "rgba(163, 230, 53, 0.08)",
      borderLeftWidth: 2.5,
      borderLeftColor: Colors.lime,
    },
    codeLineSkipped: {
      opacity: 0.42,
      borderLeftWidth: 2.5,
      borderLeftColor: "transparent",
    },
    lineMarker: {
      color: Colors.lime,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
      width: 11,
    },
    lineMarkerSkipped: {
      color: Colors.textMuted,
    },
    codeLineText: {
      color: Colors.codeText,
      fontFamily: MonoFont,
      fontSize: 12.5,
      lineHeight: 19,
      flex: 1,
      ...Platform.select({
        web: {
          whiteSpace: "pre-wrap" as any,
          wordBreak: "break-word" as any,
          overflowWrap: "anywhere" as any,
        },
      }),
    },
    skippedTag: {
      color: Colors.coral,
      fontFamily: MonoFont,
      fontSize: 8.5,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    outputFooter: {
      backgroundColor: Colors.codeSurface,
      borderTopWidth: 1,
      borderTopColor: Colors.codeBorder,
      paddingHorizontal: 10,
      paddingVertical: 7,
      gap: 2,
    },
    outputTopLine: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    outputPrefix: {
      color: Colors.mint,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    outputValue: {
      color: Colors.yellow,
      fontFamily: MonoFont,
      fontSize: 12,
      fontWeight: "900",
    },
    traceNoteText: {
      color: "#94A3B8",
      fontSize: 11.5,
      lineHeight: 16,
      fontWeight: "600",
    },
  });
