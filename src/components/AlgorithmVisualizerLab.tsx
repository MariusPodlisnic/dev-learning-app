import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text } from "./StudioIcon";
import {
  ALGORITHMS,
  type AlgoId,
  BFS_EDGES,
  BFS_HOP_GUIDES,
  BFS_NODE_COORDS,
} from "../constants/visualizerAlgorithms";
import { HardShadowSm, StudioColors } from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { playKeyClick, playVictoryFanfare } from "../utils/soundEffects";
import {
  AnimatedBarItem,
  AnimatedGraphCircle,
  AnimatedTile,
  PointerBadge,
} from "./VisualizerPrimitives";
import VisualizerExtendedStages from "./VisualizerExtendedStages";
import { createVisualizerStyles } from "./visualizerStyles";

export type { AlgoId };

interface AlgorithmVisualizerLabProps {
  isPremium: boolean;
  onRequirePro: () => void;
  onBackToMap: () => void;
}

export default function AlgorithmVisualizerLab({
  isPremium,
  onRequirePro,
  onBackToMap,
}: AlgorithmVisualizerLabProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createVisualizerStyles);
  const [selectedAlgoIdx, setSelectedAlgoIdx] = useState<number>(0);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Default to a calm, readable 2.8s pace so learners have time to read between iterations
  const [speedMs, setSpeedMs] = useState<number>(2800);

  const activeAlgo = ALGORITHMS[selectedAlgoIdx] || ALGORITHMS[0];
  const activePreset =
    activeAlgo.presets[selectedPresetIdx] || activeAlgo.presets[0];

  const steps = useMemo(() => activePreset.build(), [activePreset]);
  const safeStepIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const step = steps[safeStepIdx];
  const isLastStep = safeStepIdx >= steps.length - 1;

  const [popAnim] = useState(() => new Animated.Value(1));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [beatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    popAnim.setValue(0.965);
    Animated.spring(popAnim, {
      toValue: 1,
      friction: 6,
      tension: 110,
      useNativeDriver: false,
    }).start();

    const pct = steps.length > 1 ? safeStepIdx / (steps.length - 1) : 1;
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [safeStepIdx, steps.length, selectedAlgoIdx, selectedPresetIdx, popAnim, progressAnim]);

  useEffect(() => {
    if (!isPlaying) {
      pulseAnim.setValue(1);
      beatAnim.setValue(0);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    );
    pulseLoop.start();

    beatAnim.setValue(0);
    const beatTiming = Animated.timing(beatAnim, {
      toValue: 1,
      duration: speedMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    beatTiming.start();

    return () => {
      pulseLoop.stop();
      beatTiming.stop();
    };
  }, [isPlaying, safeStepIdx, speedMs, pulseAnim, beatAnim]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          playVictoryFanfare();
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(timer);
  }, [isPlaying, speedMs, steps.length]);

  function selectAlgo(idx: number) {
    playKeyClick();
    setIsPlaying(false);
    setSelectedAlgoIdx(idx);
    setSelectedPresetIdx(0);
    setStepIdx(0);
  }

  function selectPreset(idx: number) {
    playKeyClick();
    setIsPlaying(false);
    setSelectedPresetIdx(idx);
    setStepIdx(0);
  }

  function handleNext() {
    playKeyClick();
    setIsPlaying(false);
    if (safeStepIdx >= steps.length - 1) {
      setStepIdx(0);
    } else {
      setStepIdx(safeStepIdx + 1);
    }
  }

  function handlePrev() {
    playKeyClick();
    setIsPlaying(false);
    setStepIdx(Math.max(0, safeStepIdx - 1));
  }

  function handleTogglePlay() {
    playKeyClick();
    if (!isPlaying && isLastStep) {
      setStepIdx(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  }

  if (!isPremium) {
    return (
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
      >
        <View style={styles.lockHeroCard}>
          <View style={styles.lockTopRow}>
            <View style={styles.proSticker}>
              <Text style={styles.proStickerText}>★ PRO ONLY LAB</Text>
            </View>
            <Pressable style={styles.backBtn} onPress={onBackToMap}>
              <Text style={styles.backBtnText}>← SKILL MAP</Text>
            </Pressable>
          </View>

          <Text style={styles.lockTitle}>
            Interactive Algorithm Visualizer Lab
          </Text>
          <Text style={styles.lockDesc}>
            Watch the most-used interview algorithms execute visually with calm
            step pauses, animated pointers, sorting bars, hash buckets, and
            beginner-friendly explanations.
          </Text>

          <View style={styles.lockGrid}>
            {ALGORITHMS.map((algo) => (
              <View key={algo.id} style={styles.lockPreviewCard}>
                <View
                  style={[styles.lockCatPill, { backgroundColor: algo.accent }]}
                >
                  <Text style={styles.lockCatText}>{algo.category}</Text>
                </View>
                <Text style={styles.lockAlgoName}>{algo.name}</Text>
                <Text style={styles.lockAlgoMeta}>
                  ⚡ {algo.speedLabel} · 💾 {algo.memoryLabel}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.unlockCtaBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={() => {
              playKeyClick();
              onRequirePro();
            }}
          >
            <Text style={styles.unlockCtaText}>★ UNLOCK PRO ALGO LAB →</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const beatWidth = beatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ScrollView
      style={styles.pageScroll}
      contentContainerStyle={styles.pageContent}
    >
      {/* Top Hero Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadgeGroup}>
            <View style={styles.proSticker}>
              <Text style={styles.proStickerText}>★ PRO VISUAL LAB</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{activeAlgo.category}</Text>
            </View>
          </View>
          <Pressable style={styles.backBtn} onPress={onBackToMap}>
            <Text style={styles.backBtnText}>← SKILL MAP</Text>
          </Pressable>
        </View>

        <Text style={styles.heroTitle}>{activeAlgo.name}</Text>

        {/* Compact Brief Introduction Strip */}
        <View
          style={[
            styles.introBanner,
            { borderLeftColor: activeAlgo.accent },
          ]}
        >
          <Text style={styles.introTag}>💡 QUICK INTRO</Text>
          <Text style={styles.introText}>{activeAlgo.intro}</Text>
        </View>

        {/* Algorithm Selector Pills */}
        <View style={styles.algoTabsWrap}>
          {ALGORITHMS.map((algo, idx) => {
            const isSelected = idx === selectedAlgoIdx;
            return (
              <Pressable
                key={algo.id}
                style={[
                  styles.algoTab,
                  isSelected && {
                    backgroundColor: algo.accent,
                    borderColor: StudioColors.ink,
                    ...HardShadowSm,
                  },
                ]}
                onPress={() => selectAlgo(idx)}
              >
                <Text
                  style={[
                    styles.algoTabText,
                    isSelected && styles.algoTabTextActive,
                  ]}
                >
                  {algo.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Main Stage Card */}
      <View style={styles.stageCard}>
        <View style={styles.stageHeader}>
          <View style={styles.presetRow}>
            <Text style={styles.microLabel}>INPUT:</Text>
            {activeAlgo.presets.map((p, idx) => {
              const isActive = idx === selectedPresetIdx;
              return (
                <Pressable
                  key={p.label}
                  style={[styles.presetPill, isActive && styles.presetPillActive]}
                  onPress={() => selectPreset(idx)}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      isActive && styles.presetPillTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.bigOGroup}>
            <View style={styles.bigOPill}>
              <Text style={styles.bigOText}>⚡ {activeAlgo.speedLabel}</Text>
            </View>
            <View style={styles.bigOPill}>
              <Text style={styles.bigOText}>💾 {activeAlgo.memoryLabel}</Text>
            </View>
          </View>
        </View>

        {/* Animated Progress Rail + Inter-Iteration Pause Timer */}
        <View style={styles.progressTrackWrap}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: activeAlgo.accent },
              ]}
            />
          </View>
          <View style={styles.progressMetaRow}>
            <Text style={styles.stepLabelText}>
              STEP {safeStepIdx + 1} / {steps.length}
            </Text>
            {isPlaying ? (
              <View style={styles.liveBadge}>
                <Animated.View
                  style={[styles.liveDot, { opacity: pulseAnim }]}
                />
                <Text style={styles.liveText}>
                  READING PAUSE · {(speedMs / 1000).toFixed(1)}s
                </Text>
              </View>
            ) : (
              <Text style={styles.paceHintText}>
                Pace: {(speedMs / 1000).toFixed(1)}s / step
              </Text>
            )}
          </View>
          {isPlaying && (
            <View style={styles.beatTrack}>
              <Animated.View
                style={[styles.beatFill, { width: beatWidth }]}
              />
            </View>
          )}
        </View>

        {/* Visual Canvas Area */}
        <Animated.View
          style={[styles.canvasBox, { transform: [{ scale: popAnim }] }]}
        >
          {/* 1. BINARY SEARCH CANVAS — SORTED STEPPING STONES + MIDDLE CHOP */}
          {activeAlgo.id === "binary_search" && step.arr && (
            <View style={styles.stageWrap}>
              <View style={styles.legendGoalRow}>
                <View style={styles.bfsLegendRow}>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                    <Text style={styles.legendText}>Checking Mid</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.violet }]} />
                    <Text style={styles.legendText}>Search Zone</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: colors.surface }]} />
                    <Text style={styles.legendText}>Crossed Out</Text>
                  </View>
                </View>
                {step.targetVal !== undefined && (
                  <View style={styles.goalGoalBadge}>
                    <Text style={styles.goalGoalText}>🎯 FIND {step.targetVal}</Text>
                  </View>
                )}
              </View>

              <View style={styles.arrayRowWrap}>
                {(() => {
                  const maxVal = Math.max(...step.arr, 1);
                  return step.arr.map((val, idx) => {
                    const inRange =
                      step.lo !== undefined &&
                      step.hi !== undefined &&
                      idx >= step.lo &&
                      idx <= step.hi;
                    const isMid = step.mid === idx;
                    const isFound = step.foundIdx === idx;
                    const isLo = idx === step.lo;
                    const isHi = idx === step.hi;
                    const isHighlighted = isMid || isFound;
                    const sortedBarPct = Math.max(16, Math.round((val / maxVal) * 100));

                    let pointerEl: React.ReactNode = <View style={styles.pointerSpacer} />;
                    if (isFound) {
                      pointerEl = (
                        <PointerBadge
                          label="✓ FOUND"
                          bg={StudioColors.ink}
                          textColor={StudioColors.lime}
                        />
                      );
                    } else if (isMid) {
                      const midLabel =
                        isLo && isHi
                          ? "▸ MID ◂"
                          : isLo
                            ? "START · ▲ MID"
                            : isHi
                              ? "▲ MID · END"
                              : "▲ MID";
                      pointerEl = (
                        <PointerBadge
                          label={midLabel}
                          bg={StudioColors.ink}
                          textColor={StudioColors.yellow}
                        />
                      );
                    } else if (isLo && isHi) {
                      pointerEl = (
                        <PointerBadge
                          label="▸ ONLY 1 ◂"
                          bg={StudioColors.lime}
                          textColor={StudioColors.ink}
                        />
                      );
                    } else if (isLo) {
                      pointerEl = (
                        <PointerBadge
                          label="START ▸"
                          bg={StudioColors.violet}
                          textColor={StudioColors.ink}
                        />
                      );
                    } else if (isHi) {
                      pointerEl = (
                        <PointerBadge
                          label="◂ END"
                          bg={StudioColors.pink}
                          textColor={StudioColors.ink}
                        />
                      );
                    }

                    return (
                      <AnimatedTile
                        key={idx}
                        active={isHighlighted}
                        dimmed={!inRange && !isFound}
                        style={[
                          styles.arrayCell,
                          !inRange && !isFound && styles.arrayCellDim,
                          isLo && !isHighlighted && styles.arrayCellLoBorder,
                          isHi && !isHighlighted && styles.arrayCellHiBorder,
                          isMid && styles.arrayCellYellow,
                          isFound && styles.arrayCellMint,
                        ]}
                      >
                        <Text
                          style={[
                            styles.cellIndex,
                            isHighlighted && styles.inkMutedText,
                          ]}
                        >
                          [{idx}]
                        </Text>
                        <Text
                          style={[
                            styles.cellVal,
                            isHighlighted && styles.inkText,
                          ]}
                        >
                          {val}
                        </Text>
                        <View style={styles.sortedMeterTrack}>
                          <View
                            style={[
                              styles.sortedMeterFill,
                              {
                                width: `${sortedBarPct}%`,
                                backgroundColor: isHighlighted
                                  ? StudioColors.ink
                                  : StudioColors.violet,
                              },
                            ]}
                          />
                        </View>
                        <View style={styles.pointerSlot}>{pointerEl}</View>
                      </AnimatedTile>
                    );
                  });
                })()}
              </View>

              <View
                style={[
                  styles.visualDecisionStrip,
                  step.foundIdx !== null && step.foundIdx !== undefined && styles.decisionStripLime,
                ]}
              >
                <Text
                  style={[
                    styles.decisionStripText,
                    step.foundIdx !== null && step.foundIdx !== undefined && styles.inkText,
                  ]}
                >
                  {step.foundIdx !== null && step.foundIdx !== undefined
                    ? `🎉 Middle (${step.arr[step.foundIdx]}) equals ${step.targetVal} → Found!`
                    : step.mid !== null &&
                        step.mid !== undefined &&
                        step.targetVal !== undefined
                      ? step.arr[step.mid] < step.targetVal
                        ? `Mid ${step.arr[step.mid]} < ${step.targetVal} (too small) → Chop LEFT half ✕`
                        : `Mid ${step.arr[step.mid]} > ${step.targetVal} (too big) → Chop RIGHT half ✕`
                      : step.lo !== undefined && step.hi !== undefined && step.lo > step.hi
                        ? `Search zone is empty → ${step.targetVal} is not in this list`
                        : `Sorted ascending list ready — jumping straight to the middle next`}
                </Text>
              </View>
            </View>
          )}

          {/* 2. TWO POINTERS CANVAS — INWARD WALKERS + LIVE ADDITION SCALE */}
          {activeAlgo.id === "two_pointers" && step.arr && (
            <View style={styles.stageWrap}>
              <View style={styles.legendGoalRow}>
                <View style={styles.bfsLegendRow}>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                    <Text style={styles.legendText}>Left Finger</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.mint }]} />
                    <Text style={styles.legendText}>Right Finger</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: colors.surface }]} />
                    <Text style={styles.legendText}>Ruled Out</Text>
                  </View>
                </View>
                {step.targetVal !== undefined && (
                  <View style={styles.goalGoalBadge}>
                    <Text style={styles.goalGoalText}>🎯 SUM = {step.targetVal}</Text>
                  </View>
                )}
              </View>

              <View style={styles.arrayRowWrap}>
                {step.arr.map((val, idx) => {
                  const isL = idx === step.left;
                  const isR = idx === step.right;
                  const inSpan =
                    step.left !== undefined &&
                    step.right !== undefined &&
                    idx >= step.left &&
                    idx <= step.right;
                  const isMatched =
                    step.matchedPair &&
                    (idx === step.matchedPair[0] || idx === step.matchedPair[1]);
                  const isHighlighted = isL || isR || Boolean(isMatched);

                  let pointerEl: React.ReactNode = <View style={styles.pointerSpacer} />;
                  if (isMatched) {
                    pointerEl = (
                      <PointerBadge
                        label="✓ PAIR"
                        bg={StudioColors.ink}
                        textColor={StudioColors.lime}
                      />
                    );
                  } else if (isL) {
                    pointerEl = (
                      <PointerBadge
                        label="LEFT ▸"
                        bg={StudioColors.ink}
                        textColor={StudioColors.yellow}
                      />
                    );
                  } else if (isR) {
                    pointerEl = (
                      <PointerBadge
                        label="◂ RIGHT"
                        bg={StudioColors.ink}
                        textColor={StudioColors.mint}
                      />
                    );
                  }

                  return (
                    <AnimatedTile
                      key={idx}
                      active={isHighlighted}
                      dimmed={!inSpan && !isMatched}
                      style={[
                        styles.arrayCell,
                        !inSpan && !isMatched && styles.arrayCellDim,
                        isL && styles.arrayCellYellow,
                        isR && styles.arrayCellMint,
                        isMatched && styles.arrayCellLime,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellIndex,
                          isHighlighted && styles.inkMutedText,
                        ]}
                      >
                        [{idx}]
                      </Text>
                      <Text
                        style={[
                          styles.cellVal,
                          isHighlighted && styles.inkText,
                        ]}
                      >
                        {val}
                      </Text>
                      <View style={styles.pointerSlot}>{pointerEl}</View>
                    </AnimatedTile>
                  );
                })}
              </View>

              {step.left !== undefined &&
                step.right !== undefined &&
                step.targetVal !== undefined && (() => {
                  const lVal = step.arr[step.left];
                  const rVal = step.arr[step.right];
                  const sum = lVal + rVal;
                  const hit = sum === step.targetVal;
                  const tooSmall = sum < step.targetVal;
                  return (
                    <View
                      style={[
                        styles.visualDecisionStrip,
                        hit && styles.decisionStripLime,
                      ]}
                    >
                      <Text
                        style={[
                          styles.equationHeadline,
                          hit && styles.inkText,
                        ]}
                      >
                        {lVal} + {rVal} = {sum}  ·  Goal: {step.targetVal}
                      </Text>
                      <Text
                        style={[
                          styles.decisionStripText,
                          hit && styles.inkText,
                        ]}
                      >
                        {hit
                          ? "🎉 Exact Match! Both fingers found the pair!"
                          : tooSmall
                            ? `Too Small (${sum} < ${step.targetVal}) → Step LEFT finger right ▸`
                            : `Too Big (${sum} > ${step.targetVal}) → Step RIGHT finger left ◂`}
                      </Text>
                    </View>
                  );
                })()}
            </View>
          )}

          {/* 3. SLIDING WINDOW CANVAS — SPOTLIGHT FRAME + SCOREBOARD */}
          {activeAlgo.id === "sliding_window" && step.arr && (
            <View style={styles.stageWrap}>
              <View style={styles.bfsLegendRow}>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                  <Text style={styles.legendText}>Inside Frame</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.coral }]} />
                  <Text style={styles.legendText}>Slid Out (-)</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.lime }]} />
                  <Text style={styles.legendText}>Best Record 🏆</Text>
                </View>
              </View>

              <View style={styles.arrayRowWrap}>
                {step.arr.map((val, idx) => {
                  const inWin =
                    step.winStart !== undefined &&
                    step.winEnd !== undefined &&
                    idx >= step.winStart &&
                    idx <= step.winEnd;
                  const justDropped =
                    step.droppedVal !== null &&
                    step.droppedVal !== undefined &&
                    step.winStart !== undefined &&
                    idx === step.winStart - 1;
                  const justAdded =
                    step.addedVal !== null &&
                    step.addedVal !== undefined &&
                    idx === step.winEnd;

                  let pointerEl: React.ReactNode = <View style={styles.pointerSpacer} />;
                  if (justDropped) {
                    pointerEl = (
                      <PointerBadge
                        label={`-${val} OUT`}
                        bg={StudioColors.coral}
                        textColor={StudioColors.ink}
                      />
                    );
                  } else if (justAdded) {
                    pointerEl = (
                      <PointerBadge
                        label={`+${val} IN`}
                        bg={StudioColors.lime}
                        textColor={StudioColors.ink}
                      />
                    );
                  } else if (idx === step.winStart) {
                    pointerEl = (
                      <PointerBadge
                        label="[ START"
                        bg={StudioColors.ink}
                        textColor={StudioColors.lime}
                      />
                    );
                  } else if (idx === step.winEnd) {
                    pointerEl = (
                      <PointerBadge
                        label="END ]"
                        bg={StudioColors.ink}
                        textColor={StudioColors.lime}
                      />
                    );
                  } else if (inWin) {
                    pointerEl = (
                      <PointerBadge
                        label="FRAME"
                        bg={StudioColors.ink}
                        textColor={StudioColors.yellow}
                      />
                    );
                  }

                  return (
                    <AnimatedTile
                      key={idx}
                      active={inWin}
                      dimmed={!inWin && !justDropped}
                      style={[
                        styles.arrayCell,
                        inWin
                          ? step.isNewBest
                            ? styles.arrayCellLime
                            : styles.arrayCellYellow
                          : justDropped
                            ? styles.arrayCellDropped
                            : styles.arrayCellDim,
                      ]}
                    >
                      <Text
                        style={[styles.cellIndex, inWin && styles.inkMutedText]}
                      >
                        [{idx}]
                      </Text>
                      <Text style={[styles.cellVal, inWin && styles.inkText]}>
                        {val}
                      </Text>
                      <View style={styles.pointerSlot}>{pointerEl}</View>
                    </AnimatedTile>
                  );
                })}
              </View>

              {step.winSum !== undefined && step.bestSum !== undefined && (
                <View style={styles.scoreboardRow}>
                  <View style={styles.scoreCard}>
                    <Text style={styles.scoreCardLabel}>CURRENT FRAME</Text>
                    <Text style={styles.scoreCardVal}>{step.winSum}</Text>
                    {step.droppedVal !== null &&
                    step.droppedVal !== undefined &&
                    step.addedVal !== null &&
                    step.addedVal !== undefined ? (
                      <Text style={styles.scoreCardHint}>
                        Drop {step.droppedVal} · Add {step.addedVal}
                      </Text>
                    ) : (
                      <Text style={styles.scoreCardHint}>Initial total</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.scoreCard,
                      step.isNewBest && styles.scoreCardBestHighlight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreCardLabel,
                        step.isNewBest && styles.inkMutedText,
                      ]}
                    >
                      🏆 BEST RECORD
                    </Text>
                    <Text
                      style={[
                        styles.scoreCardVal,
                        step.isNewBest && styles.inkText,
                      ]}
                    >
                      {step.bestSum}
                    </Text>
                    <Text
                      style={[
                        styles.scoreCardHint,
                        step.isNewBest && styles.inkMutedText,
                      ]}
                    >
                      {step.isNewBest ? "New best hit!" : "Record stays"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 4. BUBBLE SORT BAR CHART CANVAS — ANIMATED BARS + PAIR DECISION */}
          {activeAlgo.id === "bubble_sort" && step.arr && (
            <View style={styles.stageWrap}>
              <View style={styles.bfsLegendRow}>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                  <Text style={styles.legendText}>Checking Pair</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.coral }]} />
                  <Text style={styles.legendText}>Swapped ⇄</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.mint }]} />
                  <Text style={styles.legendText}>Locked In ✓</Text>
                </View>
              </View>

              <View style={styles.barChartWrap}>
                {(() => {
                  const maxVal = Math.max(...step.arr, 1);
                  return step.arr.map((val, idx) => {
                    const isComparing = Boolean(
                      step.comparePair &&
                        (step.comparePair[0] === idx || step.comparePair[1] === idx),
                    );
                    const isSorted =
                      step.sortedFrom !== undefined && idx >= step.sortedFrom;
                    const heightPx = Math.max(28, Math.round((val / maxVal) * 126));

                    return (
                      <View key={idx} style={styles.barCol}>
                        <Text style={styles.barValLabel}>{val}</Text>
                        <AnimatedBarItem
                          heightPx={heightPx}
                          active={isComparing}
                          swapped={isComparing && Boolean(step.swapped)}
                          style={[
                            styles.barRect,
                            isSorted && styles.barSorted,
                            isComparing &&
                              (step.swapped ? styles.barSwapped : styles.barCompare),
                          ]}
                        >
                          <Text
                            style={[
                              styles.barTagText,
                              (isSorted || isComparing) && styles.inkText,
                            ]}
                          >
                            {isComparing
                              ? step.swapped
                                ? "⇄"
                                : "?"
                              : isSorted
                                ? "✓"
                                : ""}
                          </Text>
                        </AnimatedBarItem>
                        <Text style={styles.barIdxLabel}>[{idx}]</Text>
                      </View>
                    );
                  });
                })()}
              </View>

              <View
                style={[
                  styles.visualDecisionStrip,
                  step.sortedFrom === 0 && styles.decisionStripLime,
                ]}
              >
                <Text
                  style={[
                    styles.decisionStripText,
                    step.sortedFrom === 0 && styles.inkText,
                  ]}
                >
                  {step.sortedFrom === 0
                    ? "🎉 Every bar is sorted smallest → largest!"
                    : step.comparePair
                      ? step.swapped
                        ? `Swapped [${step.comparePair[0]}] & [${step.comparePair[1]}] ⇄ — taller bar moved right!`
                        : `Kept [${step.comparePair[0]}] & [${step.comparePair[1]}] ✓ — already in good order`
                      : "Comparing two neighbors at a time from left to right"}
                </Text>
              </View>
            </View>
          )}

          {/* 5. QUICK LOOKUP (TWO SUM) CANVAS — SCANNER + EQUATION + NOTEBOOK */}
          {activeAlgo.id === "hash_lookup" && step.arr && (
            <View style={styles.hashStage}>
              <View style={styles.legendGoalRow}>
                <View style={styles.bfsLegendRow}>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                    <Text style={styles.legendText}>Checking Now</Text>
                  </View>
                  <View style={styles.legendChip}>
                    <View style={[styles.legendDot, { backgroundColor: StudioColors.mint }]} />
                    <Text style={styles.legendText}>Partner Match</Text>
                  </View>
                </View>
                {step.targetVal !== undefined && (
                  <View style={styles.goalGoalBadge}>
                    <Text style={styles.goalGoalText}>🎯 SUM = {step.targetVal}</Text>
                  </View>
                )}
              </View>

              <View style={styles.arrayRowWrap}>
                {step.arr.map((val, idx) => {
                  const isCur = step.activeIdx === idx;
                  const isHitPartner = Boolean(
                    step.lookupHit && step.lookupHit.idx === idx,
                  );
                  const alreadyScanned =
                    step.activeIdx !== undefined && idx < step.activeIdx && !isHitPartner;
                  const isHighlighted = isCur || isHitPartner;

                  return (
                    <AnimatedTile
                      key={idx}
                      active={isHighlighted}
                      dimmed={alreadyScanned}
                      style={[
                        styles.arrayCell,
                        alreadyScanned && styles.arrayCellScanned,
                        isCur && styles.arrayCellYellow,
                        isHitPartner && styles.arrayCellMint,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellIndex,
                          isHighlighted && styles.inkMutedText,
                        ]}
                      >
                        [{idx}]
                      </Text>
                      <Text
                        style={[
                          styles.cellVal,
                          isHighlighted && styles.inkText,
                        ]}
                      >
                        {val}
                      </Text>
                      <View style={styles.pointerSlot}>
                        {isCur ? (
                          <PointerBadge
                            label="🔍 NOW"
                            bg={StudioColors.ink}
                            textColor={StudioColors.yellow}
                          />
                        ) : isHitPartner ? (
                          <PointerBadge
                            label="✓ MATCH"
                            bg={StudioColors.ink}
                            textColor={StudioColors.mint}
                          />
                        ) : alreadyScanned ? (
                          <PointerBadge
                            label="SAVED"
                            bg={colors.surface}
                            textColor={colors.textMuted}
                          />
                        ) : (
                          <View style={styles.pointerSpacer} />
                        )}
                      </View>
                    </AnimatedTile>
                  );
                })}
              </View>

              {step.activeIdx !== undefined &&
                step.activeIdx >= 0 &&
                step.targetVal !== undefined &&
                step.needVal !== undefined && (
                  <View
                    style={[
                      styles.visualDecisionStrip,
                      Boolean(step.lookupHit) && styles.decisionStripLime,
                    ]}
                  >
                    <Text
                      style={[
                        styles.equationHeadline,
                        Boolean(step.lookupHit) && styles.inkText,
                      ]}
                    >
                      Goal {step.targetVal} − Current {step.arr[step.activeIdx]} = Need {step.needVal}
                    </Text>
                    <Text
                      style={[
                        styles.decisionStripText,
                        Boolean(step.lookupHit) && styles.inkText,
                      ]}
                    >
                      {step.lookupHit
                        ? `⚡ Instant Hit! ${step.lookupHit.need} was waiting in Notebook at [${step.lookupHit.idx}]!`
                        : `Not in Notebook yet → Save "${step.arr[step.activeIdx]} → [${step.activeIdx}]" and move right`}
                    </Text>
                  </View>
                )}

              <View style={styles.hashBucketsBox}>
                <Text style={styles.microLabel}>NOTEBOOK (NUMBER → POSITION)</Text>
                <View style={styles.hashChipsRow}>
                  {step.hashMap && Object.keys(step.hashMap).length > 0 ? (
                    Object.entries(step.hashMap).map(([k, v]) => {
                      const isHit = Boolean(
                        step.lookupHit && String(step.lookupHit.need) === k,
                      );
                      return (
                        <AnimatedTile
                          key={k}
                          active={isHit}
                          style={[
                            styles.hashChip,
                            isHit && styles.hashChipHit,
                          ]}
                        >
                          <Text
                            style={[
                              styles.hashChipText,
                              isHit && styles.inkText,
                            ]}
                          >
                            {k} → pos [{v}]
                          </Text>
                        </AnimatedTile>
                      );
                    })
                  ) : (
                    <Text style={styles.emptyHashText}>
                      {"Notebook is empty — we'll jot down numbers as we walk"}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* 6. BEGINNER-FRIENDLY BFS CIRCULAR NODE GRAPH & WAITING LINE */}
          {activeAlgo.id === "bfs_graph" && (
            <View style={styles.bfsStage}>
              <View style={styles.bfsLegendRow}>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.lime }]} />
                  <Text style={styles.legendText}>Checking Now</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.yellow }]} />
                  <Text style={styles.legendText}>Waiting in Line</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: StudioColors.mint }]} />
                  <Text style={styles.legendText}>Already Checked</Text>
                </View>
              </View>

              <View style={styles.graphCard}>
                <View style={styles.graphCanvas}>
                  {/* Subtle horizontal hop-distance guide rows */}
                  {BFS_HOP_GUIDES.map((guide, rowIdx) => {
                    const activeRow =
                      (rowIdx === 0 && step.currentNode === "A") ||
                      (rowIdx === 1 && (step.currentNode === "B" || step.currentNode === "C")) ||
                      (rowIdx === 2 && (step.currentNode === "D" || step.currentNode === "E")) ||
                      (rowIdx === 3 && step.currentNode === "F");
                    return (
                      <View
                        key={guide.label}
                        style={[styles.hopGuideRow, { top: guide.cy - 10 }]}
                      >
                        <View
                          style={[
                            styles.hopGuideLine,
                            activeRow && styles.hopGuideLineActive,
                          ]}
                        />
                        <View
                          style={[
                            styles.hopBadge,
                            activeRow && styles.hopBadgeActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.hopBadgeText,
                              activeRow && styles.hopBadgeTextActive,
                            ]}
                          >
                            {guide.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                  {/* Connecting edge lines between circular nodes */}
                  {BFS_EDGES.map(([from, to]) => {
                    const p1 = BFS_NODE_COORDS[from];
                    const p2 = BFS_NODE_COORDS[to];
                    const dx = p2.cx - p1.cx;
                    const dy = p2.cy - p1.cy;
                    const length = Math.hypot(dx, dy);
                    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
                    const midX = (p1.cx + p2.cx) / 2;
                    const midY = (p1.cy + p2.cy) / 2;

                    const isExploringEdge =
                      step.currentNode === from &&
                      (Boolean(step.newlyQueued?.includes(to)) ||
                        Boolean(step.visited?.includes(to)));
                    const isDiscoveredEdge =
                      Boolean(step.visited?.includes(from)) &&
                      Boolean(step.visited?.includes(to));
                    const thickness = isExploringEdge ? 3.5 : isDiscoveredEdge ? 2.5 : 2;

                    return (
                      <View
                        key={`${from}-${to}`}
                        style={[
                          styles.graphEdge,
                          {
                            left: midX - length / 2,
                            top: midY - thickness / 2,
                            width: length,
                            height: thickness,
                            backgroundColor: isExploringEdge
                              ? StudioColors.lime
                              : isDiscoveredEdge
                                ? colors.mint
                                : colors.border,
                            opacity: isExploringEdge ? 1 : isDiscoveredEdge ? 0.9 : 0.72,
                            transform: [{ rotate: `${angleDeg}deg` }],
                          },
                        ]}
                      />
                    );
                  })}

                  {/* Circular nodes */}
                  {Object.entries(BFS_NODE_COORDS).map(([node, pos]) => {
                    const isCur = step.currentNode === node;
                    const isQueued = Boolean(step.queue?.includes(node));
                    const isVisited = Boolean(step.visited?.includes(node));
                    const isGoal = step.targetNode === node;
                    const isFound = Boolean(step.foundTarget && isCur);
                    const isBright = isCur || isQueued || isVisited || isFound;

                    const statusLabel = isFound
                      ? "FOUND!"
                      : isCur
                        ? "CHECKING"
                        : isQueued
                          ? "WAITING"
                          : isVisited
                            ? "DONE ✓"
                            : isGoal
                              ? "GOAL"
                              : "UNSEEN";

                    const statusColor = isFound
                      ? StudioColors.pink
                      : isCur
                        ? StudioColors.lime
                        : isQueued
                          ? StudioColors.yellow
                          : isVisited
                            ? StudioColors.mint
                            : isGoal
                              ? colors.pink
                              : colors.textMuted;

                    return (
                      <View
                        key={node}
                        style={[
                          styles.graphNodeSlot,
                          {
                            left: pos.cx - 34,
                            top: pos.cy - 24,
                            zIndex: isFound || isCur ? 5 : 3,
                          },
                        ]}
                      >
                        <AnimatedGraphCircle
                          active={isCur}
                          queued={isQueued}
                          found={isFound}
                          style={[
                            styles.graphCircle,
                            isVisited && styles.bfsNodeVisited,
                            isQueued && styles.bfsNodeQueued,
                            isCur && styles.bfsNodeCurrent,
                            isFound && styles.bfsNodeFound,
                          ]}
                        >
                          <Text
                            style={[
                              styles.bfsNodeText,
                              isBright && styles.inkText,
                            ]}
                          >
                            {node}
                          </Text>
                          {isGoal && (
                            <View style={styles.goalPinBadge}>
                              <Text style={styles.goalPinText}>🎯</Text>
                            </View>
                          )}
                        </AnimatedGraphCircle>
                        <View
                          style={[
                            styles.graphStatusPill,
                            (isBright || isGoal) && styles.graphStatusPillActive,
                            isFound && styles.graphStatusPillFound,
                          ]}
                        >
                          <Text
                            style={[
                              styles.graphStatusText,
                              {
                                color: isFound ? StudioColors.ink : statusColor,
                              },
                            ]}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Visual Waiting Line (Queue) Strip */}
              <View style={styles.queueStripBox}>
                <Text style={styles.microLabel}>
                  WAITING LINE (FIRST IN, FIRST OUT)
                </Text>
                <View style={styles.queueRow}>
                  {step.queue && step.queue.length > 0 ? (
                    step.queue.map((qNode, qIdx) => (
                      <View key={`${qNode}-${qIdx}`} style={styles.queuePill}>
                        <Text style={styles.queuePillOrder}>
                          {qIdx === 0 ? "NEXT →" : `#${qIdx + 1}`}
                        </Text>
                        <Text style={styles.queuePillNode}>{qNode}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyHashText}>
                      Line is empty — search complete!
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          <VisualizerExtendedStages
            algoId={activeAlgo.id}
            step={step}
            styles={styles}
          />
        </Animated.View>

        {/* Short Step-by-Step Explanation Card + Live Variables */}
        <Animated.View
          style={[styles.explainBox, { transform: [{ scale: popAnim }] }]}
        >
          <View style={styles.explainHeaderRow}>
            <View
              style={[styles.rulePill, { backgroundColor: activeAlgo.accent }]}
            >
              <Text style={styles.rulePillText}>{step.rule}</Text>
            </View>
          </View>
          <Text style={styles.explainTitle}>{step.title}</Text>
          <Text style={styles.explainBody}>{step.explanation}</Text>

          <View style={styles.varsRow}>
            {step.vars.map((v) => (
              <View
                key={v.label}
                style={[
                  styles.varChip,
                  v.highlight && {
                    backgroundColor: activeAlgo.accent,
                    borderColor: StudioColors.ink,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.varChipLabel,
                    v.highlight && styles.inkMutedText,
                  ]}
                >
                  {v.label}
                </Text>
                <Text
                  style={[styles.varChipVal, v.highlight && styles.inkText]}
                >
                  {v.value}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Playback Controls + Pace Selector */}
        <View style={styles.controlsRow}>
          <View style={styles.primaryControls}>
            <Pressable style={styles.ctrlBtn} onPress={handlePrev}>
              <Text style={styles.ctrlBtnText}>◀ Back</Text>
            </Pressable>
            <Pressable
              style={[styles.ctrlBtn, styles.ctrlBtnLime]}
              onPress={handleNext}
            >
              <Text style={styles.ctrlBtnInkText}>
                {isLastStep ? "↺ Restart" : "Step Next ▶"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.ctrlBtn, isPlaying && styles.ctrlBtnYellow]}
              onPress={handleTogglePlay}
            >
              <Text
                style={[
                  styles.ctrlBtnText,
                  isPlaying && styles.ctrlBtnInkText,
                ]}
              >
                {isPlaying ? "⏸ Pause" : isLastStep ? "▶ Replay" : "▶ Auto-Play"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.speedRow}>
            {[
              { label: "0.5x Slow", ms: 4200 },
              { label: "1x Calm", ms: 2800 },
              { label: "1.5x", ms: 1800 },
              { label: "2x Fast", ms: 1100 },
            ].map((sp) => {
              const active = speedMs === sp.ms;
              return (
                <Pressable
                  key={sp.label}
                  style={[styles.speedPill, active && styles.speedPillActive]}
                  onPress={() => {
                    playKeyClick();
                    setSpeedMs(sp.ms);
                  }}
                >
                  <Text
                    style={[
                      styles.speedPillText,
                      active && styles.ctrlBtnInkText,
                    ]}
                  >
                    {sp.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Numbered Step Scrubber */}
        <View style={styles.stepScrubberRow}>
          {steps.map((_, idx) => {
            const isCur = idx === safeStepIdx;
            const isPast = idx < safeStepIdx;
            return (
              <Pressable
                key={idx}
                style={[
                  styles.scrubPill,
                  isPast && styles.scrubPillPast,
                  isCur && styles.scrubPillCurrent,
                ]}
                onPress={() => {
                  playKeyClick();
                  setIsPlaying(false);
                  setStepIdx(idx);
                }}
              >
                <Text
                  style={[
                    styles.scrubPillText,
                    (isCur || isPast) && styles.inkText,
                  ]}
                >
                  {idx + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

