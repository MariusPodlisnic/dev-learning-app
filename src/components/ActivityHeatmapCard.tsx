import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  type ActivityHeatmapMap,
  buildPixelGardenGrid,
  DEFAULT_HEATMAP_WEEKS,
  getActivityHeatmapMap,
  getGardenTilePalette,
  getHeatmapLevelLabel,
  mergeStreakBaselineIntoHeatmap,
  type PixelGardenCell,
  subscribeActivityHeatmap,
} from "../utils/activityHeatmap";
import { playKeyClick } from "../utils/soundEffects";
import { StudioIcon, Text } from "./StudioIcon";

interface ActivityHeatmapCardProps {
  streakCount?: number;
  lastActiveDate?: string | null;
  activityMapOverride?: ActivityHeatmapMap;
}

const DAY_ROW_LABELS = ["M", "", "W", "", "F", "", "S"] as const;

export default function ActivityHeatmapCard({
  streakCount = 0,
  lastActiveDate = null,
  activityMapOverride,
}: ActivityHeatmapCardProps) {
  const { isDark, paletteId } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [storedMap, setStoredMap] = useState<ActivityHeatmapMap>(() =>
    getActivityHeatmapMap(),
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  useEffect(() => {
    return subscribeActivityHeatmap(setStoredMap);
  }, []);

  const effectiveMap = useMemo(
    () =>
      mergeStreakBaselineIntoHeatmap(
        activityMapOverride ?? storedMap,
        streakCount,
        lastActiveDate,
      ),
    [activityMapOverride, lastActiveDate, storedMap, streakCount],
  );

  const garden = useMemo(
    () => buildPixelGardenGrid(effectiveMap, DEFAULT_HEATMAP_WEEKS),
    [effectiveMap],
  );

  const tileColors = useMemo(
    () => getGardenTilePalette(isDark, paletteId),
    [isDark, paletteId],
  );

  const selectedCell: PixelGardenCell | null = useMemo(() => {
    const allCells = garden.weeks.flatMap((w) => w.cells);
    if (selectedDateKey) {
      return allCells.find((c) => c.dateKey === selectedDateKey) || null;
    }
    return allCells.find((c) => c.isToday) || null;
  }, [garden.weeks, selectedDateKey]);

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <StudioIcon name="star" size={14} />
          <Text style={styles.heading}>COZY PIXEL GARDEN · 12 WEEKS</Text>
        </View>
        <View
          style={[
            styles.stagePill,
            { backgroundColor: tileColors[3] },
          ]}
        >
          <Text style={styles.stagePillText}>{garden.bloomStageLabel}</Text>
        </View>
      </View>

      {/* Summary Telemetry Strip */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <StudioIcon name="bolt" size={12} />
          <Text style={styles.summaryText}>
            {garden.totalActions} {garden.totalActions === 1 ? "WIN" : "WINS"}
          </Text>
        </View>
        <View style={styles.summaryChip}>
          <StudioIcon name="flame" size={12} />
          <Text style={styles.summaryText}>
            {garden.activeDays} ACTIVE {garden.activeDays === 1 ? "DAY" : "DAYS"}
          </Text>
        </View>
        <View style={styles.summaryChip}>
          <StudioIcon name="trophy" size={12} />
          <Text style={styles.summaryText}>BEST DAY: {garden.bestDayCount}</Text>
        </View>
      </View>

      {/* 12-Week Pixel Garden Matrix */}
      <View style={styles.matrixFrame}>
        {/* Month Labels */}
        <View style={styles.monthRow}>
          <View style={styles.dayAxisSpacer} />
          <View style={styles.weeksRow}>
            {garden.weeks.map((week) => (
              <View key={`m-${week.weekIndex}`} style={styles.monthSlot}>
                <Text style={styles.monthText} numberOfLines={1}>
                  {week.monthLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Grid Body: Day Axis + 12 Week Columns */}
        <View style={styles.gridBody}>
          <View style={styles.dayAxisCol}>
            {DAY_ROW_LABELS.map((lbl, idx) => (
              <View key={`dow-${idx}`} style={styles.dayAxisCell}>
                <Text style={styles.dayAxisText}>{lbl}</Text>
              </View>
            ))}
          </View>

          <View style={styles.weeksRow}>
            {garden.weeks.map((week) => (
              <View key={`w-${week.weekIndex}`} style={styles.weekCol}>
                {week.cells.map((cell) => {
                  const isSelected = selectedCell?.dateKey === cell.dateKey;
                  return (
                    <Pressable
                      key={cell.dateKey}
                      disabled={cell.isFuture}
                      accessibilityRole="button"
                      accessibilityLabel={`${cell.shortDateLabel}: ${cell.count} coding wins`}
                      onPress={() => {
                        playKeyClick();
                        setSelectedDateKey(cell.dateKey);
                      }}
                      style={[
                        styles.tile,
                        { backgroundColor: tileColors[cell.level] },
                        cell.isFuture && styles.tileFuture,
                        cell.isToday && styles.tileToday,
                        isSelected && styles.tileSelected,
                      ]}
                    >
                      {cell.level === 4 && !cell.isFuture ? (
                        <View style={styles.harvestSpark} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Selected Day Inspector + Legend */}
      <View style={styles.footerRow}>
        <Text style={styles.inspectorText} numberOfLines={1}>
          {selectedCell
            ? `${selectedCell.isToday ? "TODAY" : selectedCell.shortDateLabel} · ${selectedCell.count} ${selectedCell.count === 1 ? "WIN" : "WINS"} · ${getHeatmapLevelLabel(selectedCell.level)}`
            : "TAP ANY TILE TO INSPECT"}
        </Text>

        <View style={styles.legendRow}>
          <Text style={styles.legendLabel}>LESS</Text>
          {tileColors.map((hex, idx) => (
            <View
              key={`leg-${idx}`}
              style={[styles.legendTile, { backgroundColor: hex }]}
            />
          ))}
          <Text style={styles.legendLabel}>MORE</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      gap: 9,
      ...HardShadowSm,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    heading: {
      color: colors.textPrimary,
      fontSize: 11,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    stagePill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    stagePillText: {
      color: StudioColors.ink,
      fontSize: 9,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    summaryRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    summaryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 7,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    summaryText: {
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.3,
    },
    matrixFrame: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 9,
      gap: 5,
    },
    monthRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    dayAxisSpacer: {
      width: 16,
      marginRight: 6,
    },
    weeksRow: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 4,
    },
    monthSlot: {
      flex: 1,
      minWidth: 14,
    },
    monthText: {
      color: colors.textMuted,
      fontSize: 8,
      lineHeight: 10,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    gridBody: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    dayAxisCol: {
      width: 16,
      marginRight: 6,
      gap: 4,
    },
    dayAxisCell: {
      height: 15,
      justifyContent: "center",
    },
    dayAxisText: {
      color: colors.textMuted,
      fontSize: 8,
      lineHeight: 10,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    weekCol: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    tile: {
      width: "100%",
      maxWidth: 20,
      height: 15,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.22)",
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    tileFuture: {
      opacity: 0.25,
      ...Platform.select({ web: { cursor: "default" } }),
    },
    tileToday: {
      borderWidth: 1.5,
      borderColor: StudioColors.pink,
    },
    tileSelected: {
      borderWidth: 2,
      borderColor: colors.textPrimary,
      transform: [{ scale: 1.08 }],
    },
    harvestSpark: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: StudioColors.ink,
      opacity: 0.65,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    inspectorText: {
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "800",
      fontFamily: MonoFont,
      flexShrink: 1,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    legendLabel: {
      color: colors.textMuted,
      fontSize: 9,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    legendTile: {
      width: 11,
      height: 11,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.25)",
    },
  });
