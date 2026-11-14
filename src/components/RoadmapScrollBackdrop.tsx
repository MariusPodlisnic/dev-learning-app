"use no memo";

import React, { useMemo, useSyncExternalStore } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { MonoFont, StudioColors } from "../constants/theme";

const emptySubscribe = () => () => {};
const getClientHydrated = () => true;
const getServerHydrated = () => false;

interface RoadmapScrollBackdropProps {
  scrollAnim: Animated.Value;
  viewportWidth: number;
  viewportHeight: number;
  maxScrollableDistance: number;
  accentColor: string;
}

type StageVisualKind =
  | "variables"
  | "types"
  | "control_flow"
  | "loops"
  | "arrays"
  | "hashmap"
  | "functions"
  | "stack"
  | "tree"
  | "two_pointers"
  | "sorting"
  | "systems";

interface LearningStageConfig {
  id: string;
  frac: number;
  side: "left" | "right";
  tag: string;
  title: string;
  kind: StageVisualKind;
}

// 12 connected CS Learning Stages distributed evenly from top (6%) to bottom (94%) of the page.
// Every node on the rail connects directly to a learning box (zero unconnected/obsolete nodes).
const LEARNING_STAGES: LearningStageConfig[] = [
  {
    id: "stage-01-vars",
    frac: 0.06,
    side: "left",
    tag: "01 // MEM_SLOT",
    title: "x ➔ [ 42 ]",
    kind: "variables",
  },
  {
    id: "stage-02-types",
    frac: 0.14,
    side: "right",
    tag: "02 // BIT_TYPE",
    title: "int | str",
    kind: "types",
  },
  {
    id: "stage-03-branch",
    frac: 0.22,
    side: "left",
    tag: "03 // IF_GATE",
    title: "if / else",
    kind: "control_flow",
  },
  {
    id: "stage-04-loop",
    frac: 0.3,
    side: "right",
    tag: "04 // LOOP_CLK",
    title: "while ↻",
    kind: "loops",
  },
  {
    id: "stage-05-array",
    frac: 0.38,
    side: "left",
    tag: "05 // LIST_ARR",
    title: "a[0 : n]",
    kind: "arrays",
  },
  {
    id: "stage-06-hash",
    frac: 0.46,
    side: "right",
    tag: "06 // DICT_MAP",
    title: "k ➔ [idx]",
    kind: "hashmap",
  },
  {
    id: "stage-07-func",
    frac: 0.54,
    side: "left",
    tag: "07 // LAMBDA",
    title: "f(x) ➔ ret",
    kind: "functions",
  },
  {
    id: "stage-08-stack",
    frac: 0.62,
    side: "right",
    tag: "08 // CALL_STK",
    title: "push / pop",
    kind: "stack",
  },
  {
    id: "stage-09-tree",
    frac: 0.7,
    side: "left",
    tag: "09 // BST_TREE",
    title: "L ◄ ● ► R",
    kind: "tree",
  },
  {
    id: "stage-10-ptrs",
    frac: 0.78,
    side: "right",
    tag: "10 // TWO_PTRS",
    title: "[L ► • ◄ R]",
    kind: "two_pointers",
  },
  {
    id: "stage-11-sort",
    frac: 0.86,
    side: "left",
    tag: "11 // ALU_SORT",
    title: "O(n log n)",
    kind: "sorting",
  },
  {
    id: "stage-12-sys",
    frac: 0.94,
    side: "right",
    tag: "12 // ASSERT",
    title: "PASS ✓ 100%",
    kind: "systems",
  },
];

const PARALLAX_FACTOR = 0.45;

export default function RoadmapScrollBackdrop({
  scrollAnim,
  viewportWidth,
  viewportHeight,
  maxScrollableDistance,
  accentColor,
}: RoadmapScrollBackdropProps) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientHydrated,
    getServerHydrated,
  );
  const effectiveWidth = isHydrated ? viewportWidth : 0;
  const effectiveHeight = isHydrated ? viewportHeight : 820;

  // Keep strictly clear of MinimalPcbBackground's outer 0..75px zone
  // and clear of the central 780px Roadmap column.
  const isDesktopMargin = effectiveWidth >= 1080;
  const showModules = effectiveWidth >= 1140;

  const railInset = isDesktopMargin
    ? Math.max(92, Math.min(132, Math.round((effectiveWidth - 820) * 0.22)))
    : 82;

  const safeMaxScroll = Math.max(
    240,
    (isHydrated ? maxScrollableDistance : 1180) || 1180,
  );
  const safeViewportH = Math.max(400, effectiveHeight || 820);
  const minActiveH = 52;
  const activeSpanH = Math.max(100, safeViewportH - minActiveH - 24);

  const animBindings = useMemo(() => {
    const activeRailHeight = scrollAnim.interpolate({
      inputRange: [0, safeMaxScroll],
      outputRange: [minActiveH, minActiveH + activeSpanH],
      extrapolate: "clamp",
    });

    const sparkTranslateY = scrollAnim.interpolate({
      inputRange: [0, safeMaxScroll],
      outputRange: [minActiveH - 9, minActiveH + activeSpanH - 9],
      extrapolate: "clamp",
    });

    const parallaxMidY = scrollAnim.interpolate({
      inputRange: [0, 10000],
      outputRange: [0, -10000 * PARALLAX_FACTOR],
      extrapolate: "extend",
    });

    // Each connected junction node & CS box lights up right as the dynamic circuit
    // passes downward through `frac * safeMaxScroll`, and unlights when scrolling back up.
    const stages = LEARNING_STAGES.map((stage, idx) => {
      const triggerY = stage.frac * safeMaxScroll;
      const screenMeetY = minActiveH + stage.frac * activeSpanH;
      const pinWorldY = Math.round(screenMeetY + PARALLAX_FACTOR * triggerY);
      const cardWorldY = pinWorldY - 18;

      const litOpacity = scrollAnim.interpolate({
        inputRange: [Math.max(0, triggerY - 22), triggerY + 10],
        outputRange: [0, 1],
        extrapolate: "clamp",
      });

      const pinScale = scrollAnim.interpolate({
        inputRange: [
          Math.max(0, triggerY - 22),
          triggerY,
          triggerY + 28,
        ],
        outputRange: [0.85, 1.28, 1],
        extrapolate: "clamp",
      });

      const cardOpacity = scrollAnim.interpolate({
        inputRange: [Math.max(0, triggerY - 26), triggerY + 12],
        outputRange: [0.2, 1],
        extrapolate: "clamp",
      });

      const cardScale = scrollAnim.interpolate({
        inputRange: [
          Math.max(0, triggerY - 26),
          triggerY + 4,
          triggerY + 44,
        ],
        outputRange: [0.95, 1.03, 1],
        extrapolate: "clamp",
      });

      return {
        ...stage,
        idx,
        pinWorldY,
        cardWorldY,
        litOpacity,
        pinScale,
        cardOpacity,
        cardScale,
      };
    });

    return {
      activeRailHeight,
      sparkTranslateY,
      parallaxMidY,
      stages,
    };
  }, [scrollAnim, safeMaxScroll, activeSpanH]);

  return (
    <View
      style={[
        styles.overlay,
        { opacity: isDesktopMargin ? 0.92 : 0.28 },
      ]}
      pointerEvents="none"
    >
      {/* 1. Base Unlit Vertical Circuit Rails (Left & Right) */}
      <View style={[styles.mainRailBase, { left: railInset }]} />
      <View style={[styles.mainRailBase, { right: railInset }]} />

      {/* 2. Scroll-Energized Main Circuit Fill (Left & Right) */}
      <Animated.View
        style={[
          styles.mainRailActive,
          {
            left: railInset - 0.5,
            height: animBindings.activeRailHeight,
            backgroundColor: accentColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.mainRailActive,
          {
            right: railInset - 0.5,
            height: animBindings.activeRailHeight,
            backgroundColor: accentColor,
          },
        ]}
      />

      {/* 3. Connected Junction Nodes & 12 CS Learning Boxes (6% -> 94% Full Page Extent) */}
      <Animated.View
        style={[
          styles.fullLayer,
          { transform: [{ translateY: animBindings.parallaxMidY }] },
        ]}
      >
        {showModules
          ? animBindings.stages.map((stage) => {
              const stageAccent =
                stage.idx % 2 === 0 ? accentColor : StudioColors.mint;
              const moduleOffset = railInset + 22;
              const isLeft = stage.side === "left";

              const connectorPos = isLeft
                ? { left: railInset + 2 }
                : { right: railInset + 2 };
              const pinPos = isLeft
                ? { left: railInset - 4 }
                : { right: railInset - 4 };
              const cardPos = isLeft
                ? { left: moduleOffset }
                : { right: moduleOffset };

              return (
                <View key={stage.id} style={styles.fullLayer}>
                  {/* Connected Branch Trace (Unlit Base -> Lights Up with Circuit) */}
                  <View
                    style={[
                      styles.moduleConnectorBase,
                      { top: stage.pinWorldY - 1, width: 20 },
                      connectorPos,
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.connectorLitFill,
                        {
                          backgroundColor: stageAccent,
                          opacity: stage.litOpacity,
                        },
                      ]}
                    />
                  </View>

                  {/* Connected Rail Junction Node (Lights up on pass-through, unlights on scroll-back) */}
                  <View
                    style={[
                      styles.railJunctionPinUnlit,
                      { top: stage.pinWorldY - 5 },
                      pinPos,
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.railJunctionPinLitWrap,
                        {
                          opacity: stage.litOpacity,
                          transform: [{ scale: stage.pinScale }],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.railJunctionPinHalo,
                          { backgroundColor: stageAccent },
                        ]}
                      />
                      <View
                        style={[
                          styles.railJunctionPinLit,
                          {
                            borderColor: stageAccent,
                            backgroundColor: StudioColors.yellow,
                          },
                        ]}
                      />
                    </Animated.View>
                  </View>

                  {/* Connected CS Schematic Module Card */}
                  <Animated.View
                    style={[
                      styles.csModuleCard,
                      {
                        top: stage.cardWorldY,
                        borderColor: stageAccent,
                        opacity: stage.cardOpacity,
                        transform: [{ scale: stage.cardScale }],
                      },
                      cardPos,
                    ]}
                  >
                    <View
                      style={[
                        styles.csModuleHeaderStrip,
                        { backgroundColor: stageAccent },
                      ]}
                    >
                      <Text style={styles.csModuleTagText}>{stage.tag}</Text>
                    </View>
                    <View style={styles.csModuleBody}>
                      <Text style={styles.csModuleFormulaText}>
                        {stage.title}
                      </Text>
                      {stage.kind === "variables" ? (
                        <View style={styles.miniBitRow}>
                          <View
                            style={[
                              styles.miniBitCell,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniBitCell,
                              { backgroundColor: accentColor },
                            ]}
                          />
                          <View style={styles.miniBitCellOff} />
                        </View>
                      ) : stage.kind === "types" ? (
                        <View style={styles.miniBitRow}>
                          <View
                            style={[
                              styles.miniBitCell,
                              { backgroundColor: accentColor },
                            ]}
                          />
                          <View style={styles.miniBitCellOff} />
                          <View
                            style={[
                              styles.miniBitCell,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                        </View>
                      ) : stage.kind === "control_flow" ? (
                        <View style={styles.miniBranchRow}>
                          <View style={styles.miniDiamond} />
                          <View style={styles.miniForkCol}>
                            <View
                              style={[
                                styles.miniForkBar,
                                { backgroundColor: StudioColors.mint },
                              ]}
                            />
                            <View
                              style={[
                                styles.miniForkBar,
                                { backgroundColor: accentColor },
                              ]}
                            />
                          </View>
                        </View>
                      ) : stage.kind === "loops" ? (
                        <View style={styles.miniWaveRow}>
                          <View style={styles.miniWaveStepLow} />
                          <View
                            style={[
                              styles.miniWaveStepHigh,
                              { borderColor: stageAccent },
                            ]}
                          />
                          <View style={styles.miniWaveStepLow} />
                        </View>
                      ) : stage.kind === "arrays" ? (
                        <View style={styles.miniBitRow}>
                          <View
                            style={[
                              styles.miniArrayCell,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniArrayCell,
                              { backgroundColor: accentColor },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniArrayCell,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                        </View>
                      ) : stage.kind === "hashmap" ? (
                        <View style={styles.miniStackCol}>
                          <View
                            style={[
                              styles.miniForkBar,
                              { backgroundColor: accentColor },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniForkBar,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                        </View>
                      ) : stage.kind === "functions" ? (
                        <View style={styles.miniPipeRow}>
                          <View style={styles.miniPinDot} />
                          <View
                            style={[
                              styles.miniChipBox,
                              { borderColor: stageAccent },
                            ]}
                          >
                            <Text style={styles.miniChipText}>λ</Text>
                          </View>
                          <View style={styles.miniPinDot} />
                        </View>
                      ) : stage.kind === "stack" ? (
                        <View style={styles.miniStackCol}>
                          <View
                            style={[
                              styles.miniStackPlate,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniStackPlate,
                              { backgroundColor: accentColor },
                            ]}
                          />
                        </View>
                      ) : stage.kind === "tree" ? (
                        <View style={styles.miniTreeWrap}>
                          <View
                            style={[
                              styles.miniTreeNode,
                              { backgroundColor: stageAccent },
                            ]}
                          />
                          <View style={styles.miniTreeChildrenRow}>
                            <View
                              style={[
                                styles.miniTreeNodeSm,
                                { backgroundColor: StudioColors.mint },
                              ]}
                            />
                            <View
                              style={[
                                styles.miniTreeNodeSm,
                                { backgroundColor: accentColor },
                              ]}
                            />
                          </View>
                        </View>
                      ) : stage.kind === "two_pointers" ? (
                        <View style={styles.miniPipeRow}>
                          <View
                            style={[
                              styles.miniPodDot,
                              { backgroundColor: accentColor },
                            ]}
                          />
                          <View style={styles.miniWindowTrack} />
                          <View
                            style={[
                              styles.miniPodDot,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                        </View>
                      ) : stage.kind === "sorting" ? (
                        <View style={styles.miniBarsRow}>
                          <View
                            style={[
                              styles.miniSortBar,
                              { height: 5, backgroundColor: StudioColors.mint },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniSortBar,
                              { height: 8, backgroundColor: accentColor },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniSortBar,
                              { height: 11, backgroundColor: StudioColors.mint },
                            ]}
                          />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.miniPassBadge,
                            { backgroundColor: StudioColors.mint },
                          ]}
                        >
                          <Text style={styles.miniPassText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                </View>
              );
            })
          : null}
      </Animated.View>

      {/* 4. Leading Spark Transceiver Head */}
      <Animated.View
        style={[
          styles.sparkHeadWrap,
          {
            left: railInset - 8,
            transform: [{ translateY: animBindings.sparkTranslateY }],
          },
        ]}
      >
        <View
          style={[
            styles.sparkOuterRing,
            { borderColor: accentColor, backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            styles.sparkInnerCore,
            { backgroundColor: StudioColors.yellow },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sparkHeadWrap,
          {
            right: railInset - 8,
            transform: [{ translateY: animBindings.sparkTranslateY }],
          },
        ]}
      >
        <View
          style={[
            styles.sparkOuterRing,
            { borderColor: accentColor, backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            styles.sparkInnerCore,
            { backgroundColor: StudioColors.yellow },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    overflow: "hidden",
  },
  fullLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  mainRailBase: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: StudioColors.borderSubtle,
    opacity: 0.42,
  },
  mainRailActive: {
    position: "absolute",
    top: 0,
    width: 3,
    borderRadius: 1.5,
    opacity: 0.88,
  },
  moduleConnectorBase: {
    position: "absolute",
    height: 2,
    backgroundColor: StudioColors.borderSubtle,
    opacity: 0.55,
    borderRadius: 1,
    overflow: "hidden",
  },
  connectorLitFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  railJunctionPinUnlit: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: StudioColors.borderSubtle,
    backgroundColor: StudioColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  railJunctionPinLitWrap: {
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  railJunctionPinHalo: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.28,
  },
  railJunctionPinLit: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  csModuleCard: {
    position: "absolute",
    width: 96,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: StudioColors.surface,
    overflow: "hidden",
  },
  csModuleHeaderStrip: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: StudioColors.ink,
  },
  csModuleTagText: {
    fontSize: 7.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    color: StudioColors.ink,
    letterSpacing: 0.4,
  },
  csModuleBody: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  csModuleFormulaText: {
    fontSize: 8.5,
    fontWeight: "800",
    fontFamily: MonoFont,
    color: StudioColors.textPrimary,
    letterSpacing: 0.2,
  },
  miniBitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  miniBitCell: {
    width: 5,
    height: 8,
    borderRadius: 1.5,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  miniBitCellOff: {
    width: 5,
    height: 8,
    borderRadius: 1.5,
    borderWidth: 1,
    borderColor: StudioColors.borderSubtle,
    backgroundColor: StudioColors.bg,
  },
  miniArrayCell: {
    width: 5,
    height: 6,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  miniBranchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  miniDiamond: {
    width: 7,
    height: 7,
    backgroundColor: StudioColors.yellow,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    transform: [{ rotate: "45deg" }],
  },
  miniForkCol: {
    flexDirection: "column",
    gap: 2,
  },
  miniForkBar: {
    width: 8,
    height: 2.5,
    borderRadius: 1,
  },
  miniPipeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  miniPinDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: StudioColors.textSecondary,
  },
  miniChipBox: {
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    borderRadius: 3,
    borderWidth: 1,
    backgroundColor: StudioColors.surfaceElevated,
  },
  miniChipText: {
    fontSize: 7.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    color: StudioColors.textPrimary,
  },
  miniTreeWrap: {
    alignItems: "center",
    gap: 2,
  },
  miniTreeNode: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  miniTreeChildrenRow: {
    flexDirection: "row",
    gap: 4,
  },
  miniTreeNodeSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  miniBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  miniSortBar: {
    width: 4,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: StudioColors.ink,
  },
  miniPodDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  miniWaveRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  miniWaveStepLow: {
    width: 4,
    height: 2,
    backgroundColor: StudioColors.borderSubtle,
  },
  miniWaveStepHigh: {
    width: 7,
    height: 7,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
  },
  miniStackCol: {
    flexDirection: "column",
    gap: 2,
  },
  miniStackPlate: {
    width: 11,
    height: 3,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: StudioColors.ink,
  },
  miniWindowTrack: {
    width: 6,
    height: 2,
    backgroundColor: StudioColors.borderSubtle,
  },
  miniPassBadge: {
    paddingHorizontal: 3.5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  miniPassText: {
    fontSize: 7.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    color: StudioColors.ink,
  },
  sparkHeadWrap: {
    position: "absolute",
    top: 0,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkOuterRing: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    opacity: 0.3,
  },
  sparkInnerCore: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
    borderColor: StudioColors.ink,
  },
});
