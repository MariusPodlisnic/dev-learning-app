import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "./StudioIcon";
import { StudioColors } from "../constants/theme";
import type { AlgoId, AlgoStep } from "../constants/visualizerAlgorithms";
import type { createVisualizerStyles } from "./visualizerStyles";

type VisualizerStyles = ReturnType<typeof createVisualizerStyles>;

interface ExtendedStageProps {
  algoId: AlgoId;
  step: AlgoStep;
  styles: VisualizerStyles;
}

function RecursionStackStage({
  step,
  styles,
}: {
  step: AlgoStep;
  styles: VisualizerStyles;
}) {
  const frames = step.stackFrames || [];
  // Render top-of-stack frame first so students read execution downward/unwinding intuitively.
  const displayFrames = [...frames].reverse();

  return (
    <View style={styles.extStageWrap}>
      <Text style={styles.microLabel}>
        ACTIVE CALL STACK (TOP FRAME RUNS FIRST)
      </Text>
      <View style={styles.stackTowerBox}>
        {displayFrames.map((frame, revIdx) => {
          const isInkCard =
            frame.state === "active" ||
            frame.state === "base" ||
            frame.state === "returning";
          const stateLabel =
            frame.state === "base"
              ? "BASE ✓"
              : frame.state === "returning"
                ? `RETURN ${frame.returnValue ?? ""}`
                : frame.state === "active"
                  ? "RUNNING"
                  : "PAUSED";
          return (
            <View
              key={frame.id}
              style={[
                styles.stackFrameCard,
                frame.state === "active" && styles.stackFrameActive,
                frame.state === "base" && styles.stackFrameBase,
                frame.state === "returning" && styles.stackFrameReturning,
              ]}
            >
              <View style={styles.stackFrameHeader}>
                <Text
                  style={[
                    styles.stackCallTitle,
                    isInkCard && styles.inkText,
                  ]}
                >
                  #{frames.length - revIdx} · {frame.callLabel}
                </Text>
                <View style={styles.stackStateTag}>
                  <Text style={styles.stackStateTagText}>{stateLabel}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.stackFrameNote,
                  isInkCard && styles.inkMutedText,
                ]}
              >
                {frame.note}
              </Text>
            </View>
          );
        })}
      </View>

      {step.memoEntries && step.memoEntries.length > 0 && (
        <View style={styles.hashBucketsBox}>
          <Text style={styles.microLabel}>MEMOIZATION CACHE (SAVED ANSWERS)</Text>
          <View style={styles.hashChipsRow}>
            {step.memoEntries.map((entry) => (
              <View key={entry.key} style={styles.hashChip}>
                <Text style={styles.hashChipText}>
                  {entry.key} → {entry.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function MinHeapStage({
  step,
  styles,
}: {
  step: AlgoStep;
  styles: VisualizerStyles;
}) {
  const heap = step.heap || [];
  const levels: { idx: number; val: number }[][] = [];
  let start = 0;
  let width = 1;
  while (start < heap.length) {
    const row: { idx: number; val: number }[] = [];
    for (let i = start; i < Math.min(start + width, heap.length); i++) {
      row.push({ idx: i, val: heap[i] });
    }
    levels.push(row);
    start += width;
    width *= 2;
  }

  return (
    <View style={styles.extStageWrap}>
      <Text style={styles.microLabel}>
        {step.heapActionLabel || "BINARY MIN-HEAP LEVELS (SMALLEST AT ROOT [0])"}
      </Text>
      <View style={styles.heapLevelRows}>
        {levels.map((row, depth) => (
          <View key={depth} style={styles.heapLevelRow}>
            {row.map(({ idx, val }) => {
              const isSwapped =
                step.swappedPair &&
                (step.swappedPair[0] === idx || step.swappedPair[1] === idx);
              const isActive = step.activeHeapIdx === idx;
              const isRoot = idx === 0;
              const isInkCard = Boolean(isSwapped || isActive);
              return (
                <View
                  key={idx}
                  style={[
                    styles.heapNodeTile,
                    isRoot && styles.heapNodeRoot,
                    isActive && styles.heapNodeActive,
                    isSwapped && styles.heapNodeSwapped,
                  ]}
                >
                  <Text
                    style={[
                      styles.heapNodeIdx,
                      isInkCard && styles.inkMutedText,
                    ]}
                  >
                    {isRoot ? "MIN [0]" : `[${idx}] ↑${Math.floor((idx - 1) / 2)}`}
                  </Text>
                  <Text
                    style={[
                      styles.heapNodeVal,
                      isInkCard && styles.inkText,
                    ]}
                  >
                    {val}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.hashBucketsBox}>
        <Text style={styles.microLabel}>
          UNDERLYING ARRAY STORAGE (PARENT = (i - 1) // 2)
        </Text>
        <View style={styles.hashChipsRow}>
          {heap.map((v, i) => (
            <View
              key={`${i}-${v}`}
              style={[
                styles.hashChip,
                step.activeHeapIdx === i && styles.hashChipHit,
              ]}
            >
              <Text
                style={[
                  styles.hashChipText,
                  step.activeHeapIdx === i && styles.inkText,
                ]}
              >
                [{i}]: {v}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {step.poppedValues && step.poppedValues.length > 0 && (
        <Text style={styles.emptyHashText}>
          Popped order so far: [{step.poppedValues.join(" → ")}]
        </Text>
      )}
    </View>
  );
}

function DpTableStage({
  step,
  styles,
}: {
  step: AlgoStep;
  styles: VisualizerStyles;
}) {
  const rows = step.dpGrid || [];
  const rowLabels = step.dpRowLabels || [];
  const colLabels = step.dpColLabels || [];
  const sourceSet = new Set(
    (step.sourceCells || []).map(([r, c]) => `${r}:${c}`),
  );

  return (
    <View style={styles.extStageWrap}>
      {step.dpFormula && (
        <View style={styles.dpFormulaBox}>
          <Text style={styles.dpFormulaText}>{step.dpFormula}</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.dpTableCard}>
          <View style={styles.dpRow}>
            <View style={styles.dpCornerCell}>
              <Text style={styles.dpHeaderText}>SUBPROBLEM</Text>
            </View>
            {colLabels.map((col) => (
              <View key={col} style={styles.dpColHeader}>
                <Text style={styles.dpHeaderText}>{col}</Text>
              </View>
            ))}
          </View>

          {rows.map((rowVals, rIdx) => (
            <View key={rIdx} style={styles.dpRow}>
              <View style={styles.dpRowHeader}>
                <Text style={styles.dpRowHeaderText} numberOfLines={1}>
                  {rowLabels[rIdx] || `Row ${rIdx}`}
                </Text>
              </View>
              {rowVals.map((val, cIdx) => {
                const isActive =
                  step.activeCell?.[0] === rIdx &&
                  step.activeCell?.[1] === cIdx;
                const isSource = sourceSet.has(`${rIdx}:${cIdx}`);
                return (
                  <View
                    key={cIdx}
                    style={[
                      styles.dpCell,
                      isSource && styles.dpCellSource,
                      isActive && styles.dpCellActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dpCellText,
                        (isActive || isSource) && styles.inkText,
                      ]}
                    >
                      {val === null ? "·" : val}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function SystemDesignStage({
  step,
  styles,
}: {
  step: AlgoStep;
  styles: VisualizerStyles;
}) {
  const nodes = step.sysNodes || [];
  const toneColor =
    step.sysOutcomeTone === "hit"
      ? StudioColors.lime
      : step.sysOutcomeTone === "throttled"
        ? StudioColors.coral
        : step.sysOutcomeTone === "replicated"
          ? StudioColors.mint
          : StudioColors.yellow;

  return (
    <View style={styles.extStageWrap}>
      <View style={styles.sysHeaderRow}>
        <Text style={styles.microLabel}>
          {step.sysFlowTitle || "REQUEST FLOW"} · END-TO-END LATENCY:{" "}
          {step.sysLatencyMs ?? 0}ms
        </Text>
        {step.sysOutcomeBadge && (
          <View
            style={[
              styles.sysOutcomePill,
              { backgroundColor: toneColor },
            ]}
          >
            <Text style={styles.sysOutcomeText}>{step.sysOutcomeBadge}</Text>
          </View>
        )}
      </View>

      <View style={styles.sysNodesGrid}>
        {nodes.map((node, idx) => {
          const barColor =
            node.status === "hit"
              ? StudioColors.emeraldLight
              : node.status === "shed"
                ? StudioColors.coral
                : node.status === "warn"
                  ? StudioColors.yellow
                  : node.status === "active"
                    ? StudioColors.lime
                    : StudioColors.borderSubtle;

          return (
            <View
              key={node.id}
              style={[
                styles.sysNodeCard,
                node.status === "hit" && styles.sysNodeHit,
                node.status === "shed" && styles.sysNodeShed,
                node.status === "warn" && styles.sysNodeWarn,
              ]}
            >
              <Text style={styles.heapNodeIdx}>
                TIER {idx + 1} · {node.status.toUpperCase()}
              </Text>
              <Text style={styles.sysNodeTitle}>{node.label}</Text>
              <Text style={styles.sysNodeRole}>{node.role}</Text>
              <Text style={styles.sysNodeMetric}>{node.metric}</Text>
              <View style={styles.sysLoadTrack}>
                <View
                  style={[
                    styles.sysLoadFill,
                    {
                      width: `${Math.min(100, Math.max(6, node.loadPct))}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function VisualizerExtendedStages({
  algoId,
  step,
  styles,
}: ExtendedStageProps) {
  if (algoId === "recursion_stack") {
    return <RecursionStackStage step={step} styles={styles} />;
  }
  if (algoId === "min_heap") {
    return <MinHeapStage step={step} styles={styles} />;
  }
  if (algoId === "dp_table") {
    return <DpTableStage step={step} styles={styles} />;
  }
  if (algoId === "system_design") {
    return <SystemDesignStage step={step} styles={styles} />;
  }
  return null;
}
