import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { getLessonToolbox } from "../constants/curriculumData/lessonToolboxes";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { Lesson } from "../types/lesson";
import { playKeyClick } from "../utils/soundEffects";

interface LessonToolboxCardProps {
  selectedLesson: Lesson;
}

export default function LessonToolboxCard({
  selectedLesson,
}: LessonToolboxCardProps) {
  const tools = getLessonToolbox(selectedLesson);
  const [activeToolIdx, setActiveToolIdx] = useState<number>(0);

  useEffect(() => {
    setActiveToolIdx(0);
  }, [selectedLesson.id]);

  if (!tools || tools.length === 0) return null;

  const safeIdx = activeToolIdx < tools.length ? activeToolIdx : 0;
  const activeTool = tools[safeIdx];

  return (
    <View style={styles.card}>
      <View style={styles.topHeaderRow}>
        <View style={styles.headerBadgeGroup}>
          <View style={styles.toolboxSticker}>
            <Text style={styles.toolboxStickerText}>
              🧰 TOOLS NEEDED · SYNTAX & VARIATIONS
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {activeTool.variations.length} VARIATIONS
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.introSubtext}>
        Explore the different ways to use the exact Python tools required for
        this mission:
      </Text>

      {/* Tool Selector Tabs if multiple tools exist for this lesson */}
      {tools.length > 1 && (
        <View style={styles.toolTabsRow}>
          {tools.map((tool, idx) => {
            const isSelected = safeIdx === idx;
            return (
              <Pressable
                key={idx}
                style={[
                  styles.toolTabBtn,
                  isSelected && styles.toolTabBtnActive,
                ]}
                onPress={() => {
                  playKeyClick();
                  setActiveToolIdx(idx);
                }}
              >
                <Text
                  style={[
                    styles.toolTabBtnText,
                    isSelected && styles.toolTabBtnTextActive,
                  ]}
                  numberOfLines={1}
                >
                  TOOL 0{idx + 1}: {tool.toolName.split("—")[0].trim()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Selected Tool Overview & Syntax Formula */}
      <View style={styles.toolSummaryBanner}>
        <View style={styles.toolTitleRow}>
          <Text style={styles.toolTitleText}>{activeTool.toolName}</Text>
          <View style={styles.toolRoleBadge}>
            <Text style={styles.toolRoleBadgeText}>{activeTool.badge}</Text>
          </View>
        </View>
        <Text style={styles.toolPurposeText}>{activeTool.purpose}</Text>

        <View style={styles.anatomyBox}>
          <Text style={styles.anatomyLabel}>SYNTAX PATTERN:</Text>
          <Text style={styles.anatomyCode}>{activeTool.syntaxPattern}</Text>
        </View>
      </View>

      {/* Structured Variations Breakdown */}
      <View style={styles.variationsList}>
        {activeTool.variations.map((v, vIdx) => (
          <View key={vIdx} style={styles.variationCard}>
            <View style={styles.variationHeader}>
              <Text style={styles.variationLabelText}>{v.label}</Text>
            </View>

            <View style={styles.codeAndOutputRow}>
              <View style={styles.variationCodeBox}>
                <Text style={styles.boxMicroTag}>PYTHON CODE</Text>
                <Text style={styles.variationCodeText}>{v.code}</Text>
              </View>

              <View style={styles.variationOutputBox}>
                <Text style={styles.boxMicroTagOutput}>OUTPUT / RESULT</Text>
                <Text style={styles.variationOutputText}>{v.output}</Text>
              </View>
            </View>

            <View style={styles.variationNoteRow}>
              <Text style={styles.variationNoteText}>💡 {v.note}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 18,
    marginBottom: 16,
    gap: 12,
    ...HardShadow,
  },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  headerBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  toolboxSticker: {
    backgroundColor: StudioColors.mint,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
  },
  toolboxStickerText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  countPill: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countPillText: {
    color: StudioColors.textPrimary,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  introSubtext: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  toolTabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toolTabBtn: {
    flex: 1,
    minWidth: 150,
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  toolTabBtnActive: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  toolTabBtnText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  toolTabBtnTextActive: {
    color: StudioColors.ink,
  },
  toolSummaryBanner: {
    backgroundColor: StudioColors.bg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    padding: 12,
    gap: 6,
  },
  toolTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  toolTitleText: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  toolRoleBadge: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toolRoleBadgeText: {
    color: StudioColors.lime,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  toolPurposeText: {
    color: StudioColors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 18,
  },
  anatomyBox: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: StudioColors.codeBg,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  anatomyLabel: {
    color: StudioColors.yellow,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  anatomyCode: {
    color: StudioColors.codeText,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: MonoFont,
  },
  variationsList: {
    gap: 10,
  },
  variationCard: {
    backgroundColor: StudioColors.bg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  variationHeader: {
    backgroundColor: StudioColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.border,
  },
  variationLabelText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  codeAndOutputRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  variationCodeBox: {
    flex: 1.3,
    minWidth: 170,
    backgroundColor: StudioColors.codeBg,
    padding: 10,
    borderRightWidth: 1.5,
    borderRightColor: StudioColors.border,
    gap: 4,
  },
  variationOutputBox: {
    flex: 1,
    minWidth: 130,
    backgroundColor: "#1B222C",
    padding: 10,
    gap: 4,
  },
  boxMicroTag: {
    color: StudioColors.lime,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  boxMicroTagOutput: {
    color: StudioColors.yellow,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  variationCodeText: {
    color: StudioColors.codeText,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: MonoFont,
    lineHeight: 18,
  },
  variationOutputText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: MonoFont,
    lineHeight: 18,
  },
  variationNoteRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: StudioColors.borderSubtle,
    backgroundColor: StudioColors.bg,
  },
  variationNoteText: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
});
