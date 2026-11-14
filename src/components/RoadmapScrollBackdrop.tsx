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

interface LearningStageConfig {
  id: string;
  worldY: number;
  leftTag: string;
  leftTitle: string;
  rightTag: string;
  rightTitle: string;
  kind:
    | "variables"
    | "control_flow"
    | "functions"
    | "data_structures"
    | "algorithms"
    | "systems";
}

const LEARNING_STAGES: LearningStageConfig[] = [
  {
    id: "stage-vars",
    worldY: 78,
    leftTag: "01 // MEM_SLOT",
    leftTitle: "x ➔ [ 42 ]",
    rightTag: "0x0B // BITS",
    rightTitle: "1 0 1 1",
    kind: "variables",
  },
  {
    id: "stage-flow",
    worldY: 310,
    leftTag: "02 // BRANCH",
    leftTitle: "if / else",
    rightTag: "CLK // LOOP",
    rightTitle: "while ↻",
    kind: "control_flow",
  },
  {
    id: "stage-funcs",
    worldY: 542,
    leftTag: "03 // LAMBDA",
    leftTitle: "f(x) ➔ y",
    rightTag: "LIFO // STACK",
    rightTitle: "push/pop",
    kind: "functions",
  },
  {
    id: "stage-ds",
    worldY: 774,
    leftTag: "04 // BST_NODE",
    leftTitle: "L ◄ ● ► R",
    rightTag: "HASH // O(1)",
    rightTitle: "k ➔ [idx]",
    kind: "data_structures",
  },
  {
    id: "stage-algo",
    worldY: 1006,
    leftTag: "05 // 2_PTRS",
    leftTitle: "[L ► • ◄ R]",
    rightTag: "ALU // SORT",
    rightTitle: "O(n log n)",
    kind: "algorithms",
  },
  {
    id: "stage-sys",
    worldY: 1238,
    leftTag: "06 // SCALE_LB",
    leftTitle: "1 ➔ 3 PODS",
    rightTag: "TEST // PASS",
    rightTitle: "ASSERT ✓",
    kind: "systems",
  },
];

const INTER_STAGE_VIAS = [194, 426, 658, 890, 1122, 1354];

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
  const minActiveH = 56;
  const activeSpanH = Math.max(100, safeViewportH - minActiveH - 24);

  const animBindings = useMemo(() => {
    const activeRailHeight = scrollAnim.interpolate({
      inputRange: [0, safeMaxScroll],
      outputRange: [minActiveH, minActiveH + activeSpanH],
      extrapolate: "clamp",
    });

    const sparkTranslateY = scrollAnim.interpolate({
      inputRange: [0, safeMaxScroll],
      outputRange: [minActiveH - 10, minActiveH + activeSpanH - 10],
      extrapolate: "clamp",
    });

    const trailingPacketY = scrollAnim.interpolate({
      inputRange: [0, safeMaxScroll],
      outputRange: [Math.max(16, minActiveH - 52), minActiveH + activeSpanH - 52],
      extrapolate: "clamp",
    });

    const parallaxMidY = scrollAnim.interpolate({
      inputRange: [0, 4000],
      outputRange: [0, -2080],
      extrapolate: "extend",
    });

    const parallaxSlowY = scrollAnim.interpolate({
      inputRange: [0, 4000],
      outputRange: [0, -880],
      extrapolate: "extend",
    });

    const slopeDenom = 0.52 + activeSpanH / safeMaxScroll;

    const stageOpacities = LEARNING_STAGES.map((stage) => {
      const triggerY = Math.max(0, (stage.worldY - minActiveH) / slopeDenom);
      if (triggerY <= 12) {
        return scrollAnim.interpolate({
          inputRange: [0, 10],
          outputRange: [0.85, 1],
          extrapolate: "clamp",
        });
      }
      return scrollAnim.interpolate({
        inputRange: [Math.max(0, triggerY - 70), triggerY + 18],
        outputRange: [0.22, 1],
        extrapolate: "clamp",
      });
    });

    const stageScales = LEARNING_STAGES.map((stage) => {
      const triggerY = Math.max(0, (stage.worldY - minActiveH) / slopeDenom);
      if (triggerY <= 12) {
        return scrollAnim.interpolate({
          inputRange: [0, 10],
          outputRange: [1, 1],
          extrapolate: "clamp",
        });
      }
      return scrollAnim.interpolate({
        inputRange: [
          Math.max(0, triggerY - 60),
          triggerY,
          triggerY + 80,
        ],
        outputRange: [0.95, 1.04, 1],
        extrapolate: "clamp",
      });
    });

    return {
      activeRailHeight,
      sparkTranslateY,
      trailingPacketY,
      parallaxMidY,
      parallaxSlowY,
      stageOpacities,
      stageScales,
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
      {/* 1. Slow-Parallax Stepped Bus Sub-Rulers (Strictly Inward of railInset) */}
      <Animated.View
        style={[
          styles.fullLayer,
          { transform: [{ translateY: animBindings.parallaxSlowY }] },
        ]}
      >
        {INTER_STAGE_VIAS.map((yPos, idx) => {
          const tickLen = idx % 2 === 0 ? 12 : 8;
          return (
            <View key={`tick-${yPos}`} style={styles.fullLayer}>
              <View
                style={[
                  styles.inwardTick,
                  {
                    top: yPos,
                    left: railInset + 3,
                    width: tickLen,
                  },
                ]}
              />
              <View
                style={[
                  styles.inwardTick,
                  {
                    top: yPos,
                    right: railInset + 3,
                    width: tickLen,
                  },
                ]}
              />
            </View>
          );
        })}
      </Animated.View>

      {/* 2. Base Unlit Vertical Circuit Rails (Left & Right) */}
      <View style={[styles.mainRailBase, { left: railInset }]} />
      <View style={[styles.mainRailBase, { right: railInset }]} />

      {/* Stepped Parallel Data Bus Line (+10px inward) */}
      {isDesktopMargin ? (
        <>
          <View style={[styles.parallelBusLine, { left: railInset + 10 }]} />
          <View style={[styles.parallelBusLine, { right: railInset + 10 }]} />
        </>
      ) : null}

      {/* 3. Scroll-Energized Main Circuit Fill (Left & Right) */}
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

      {/* 4. Mid-Parallax CS Learning Modules & Schematic Nodes (0.52x Scroll Speed) */}
      <Animated.View
        style={[
          styles.fullLayer,
          { transform: [{ translateY: animBindings.parallaxMidY }] },
        ]}
      >
        {/* Inter-Stage Stepped Bypass Traces & Micro-Vias */}
        {INTER_STAGE_VIAS.map((viaY, idx) => {
          const viaColor =
            idx % 2 === 0 ? StudioColors.mint : accentColor;
          return (
            <View key={`via-${viaY}`} style={styles.fullLayer}>
              <View
                style={[
                  styles.interViaDot,
                  {
                    top: viaY - 4,
                    left: railInset - 3,
                    borderColor: viaColor,
                  },
                ]}
              />
              <View
                style={[
                  styles.interViaDot,
                  {
                    top: viaY - 4,
                    right: railInset - 3,
                    borderColor: viaColor,
                  },
                ]}
              />
            </View>
          );
        })}

        {/* 6 Progressive CS Learning Stages (Left & Right Schematic Cards) */}
        {showModules
          ? LEARNING_STAGES.map((stage, idx) => {
              const stageOpacity = animBindings.stageOpacities[idx];
              const stageScale = animBindings.stageScales[idx];
              const stageAccent =
                idx % 2 === 0 ? accentColor : StudioColors.mint;
              const moduleOffset = railInset + 22;

              return (
                <View key={stage.id} style={styles.fullLayer}>
                  {/* Left Connector Trace + Pin */}
                  <Animated.View
                    style={[
                      styles.moduleConnectorLine,
                      {
                        top: stage.worldY + 18,
                        left: railInset + 2,
                        width: 20,
                        backgroundColor: stageAccent,
                        opacity: stageOpacity,
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.railJunctionPin,
                      {
                        top: stage.worldY + 14,
                        left: railInset - 3.5,
                        borderColor: stageAccent,
                        opacity: stageOpacity,
                      },
                    ]}
                  />

                  {/* Left CS Schematic Module */}
                  <Animated.View
                    style={[
                      styles.csModuleCard,
                      {
                        top: stage.worldY,
                        left: moduleOffset,
                        borderColor: stageAccent,
                        opacity: stageOpacity,
                        transform: [{ scale: stageScale }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.csModuleHeaderStrip,
                        { backgroundColor: stageAccent },
                      ]}
                    >
                      <Text style={styles.csModuleTagText}>{stage.leftTag}</Text>
                    </View>
                    <View style={styles.csModuleBody}>
                      <Text style={styles.csModuleFormulaText}>
                        {stage.leftTitle}
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
                      ) : stage.kind === "data_structures" ? (
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
                      ) : stage.kind === "algorithms" ? (
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
                        <View style={styles.miniPodsRow}>
                          <View
                            style={[
                              styles.miniPodDot,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniPodDot,
                              { backgroundColor: accentColor },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniPodDot,
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                        </View>
                      )}
                    </View>
                  </Animated.View>

                  {/* Right Connector Trace + Pin */}
                  <Animated.View
                    style={[
                      styles.moduleConnectorLine,
                      {
                        top: stage.worldY + 18,
                        right: railInset + 2,
                        width: 20,
                        backgroundColor: stageAccent,
                        opacity: stageOpacity,
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.railJunctionPin,
                      {
                        top: stage.worldY + 14,
                        right: railInset - 3.5,
                        borderColor: stageAccent,
                        opacity: stageOpacity,
                      },
                    ]}
                  />

                  {/* Right CS Schematic Module */}
                  <Animated.View
                    style={[
                      styles.csModuleCard,
                      {
                        top: stage.worldY,
                        right: moduleOffset,
                        borderColor: stageAccent,
                        opacity: stageOpacity,
                        transform: [{ scale: stageScale }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.csModuleHeaderStrip,
                        { backgroundColor: stageAccent },
                      ]}
                    >
                      <Text style={styles.csModuleTagText}>{stage.rightTag}</Text>
                    </View>
                    <View style={styles.csModuleBody}>
                      <Text style={styles.csModuleFormulaText}>
                        {stage.rightTitle}
                      </Text>
                      {stage.kind === "variables" ? (
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
                      ) : stage.kind === "functions" ? (
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
                      ) : stage.kind === "data_structures" ? (
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
                              { backgroundColor: StudioColors.mint },
                            ]}
                          />
                          <View
                            style={[
                              styles.miniBitCell,
                              { backgroundColor: accentColor },
                            ]}
                          />
                        </View>
                      ) : stage.kind === "algorithms" ? (
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
                      ) : (
                        <View
                          style={[
                            styles.miniPassBadge,
                            { backgroundColor: StudioColors.mint },
                          ]}
                        >
                          <Text style={styles.miniPassText}>100%</Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                </View>
              );
            })
          : null}
      </Animated.View>

      {/* 5. Trailing Secondary Signal Bead & Leading Spark Transceiver Head */}
      <Animated.View
        style={[
          styles.trailingBead,
          {
            left: railInset - 2,
            backgroundColor: StudioColors.mint,
            transform: [{ translateY: animBindings.trailingPacketY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.trailingBead,
          {
            right: railInset - 2,
            backgroundColor: StudioColors.mint,
            transform: [{ translateY: animBindings.trailingPacketY }],
          },
        ]}
      />

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
  inwardTick: {
    position: "absolute",
    height: 1.5,
    backgroundColor: StudioColors.borderSubtle,
    opacity: 0.32,
    borderRadius: 1,
  },
  mainRailBase: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: StudioColors.borderSubtle,
    opacity: 0.42,
  },
  parallelBusLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: StudioColors.borderSubtle,
    opacity: 0.2,
  },
  mainRailActive: {
    position: "absolute",
    top: 0,
    width: 3,
    borderRadius: 1.5,
    opacity: 0.88,
  },
  interViaDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    backgroundColor: StudioColors.surface,
    opacity: 0.65,
  },
  moduleConnectorLine: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
  },
  railJunctionPin: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
    backgroundColor: StudioColors.surface,
  },
  csModuleCard: {
    position: "absolute",
    width: 94,
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
  miniPodsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2.5,
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
    width: 12,
    height: 3.5,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: StudioColors.ink,
  },
  miniWindowTrack: {
    width: 7,
    height: 2,
    backgroundColor: StudioColors.borderSubtle,
  },
  miniPassBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  miniPassText: {
    fontSize: 7,
    fontWeight: "900",
    fontFamily: MonoFont,
    color: StudioColors.ink,
  },
  trailingBead: {
    position: "absolute",
    top: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.75,
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
