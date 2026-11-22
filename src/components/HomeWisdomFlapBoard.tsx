import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  BYTE_CAT_QUOTES,
  type ByteCatQuote,
} from "../constants/byteCatData";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { readLocalJsonAsync, writeLocalJson } from "../types/lesson";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import { Text } from "./StudioIcon";

const STORAGE_QUOTE_PREFS_KEY = "devlearn_bytecat_quote_prefs_v1";

interface SavedQuotePrefs {
  favoriteIds?: number[];
  lastQuoteId?: number;
}

/**
 * Splits a quote cleanly along word boundaries into individual mechanical
 * split-flap display rows so every line sits inside its own recessed slat
 * and no divider ever cuts through text characters.
 */
export function splitQuoteIntoFlapLines(
  quote: string,
  maxCharsPerLine = 52,
): string[] {
  const cleaned = `“${quote.trim()}”`;
  const limit = Math.max(18, maxCharsPerLine);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= limit || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function HomeWisdomFlapBoard() {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const isPhone = windowWidth > 0 && windowWidth < 560;

  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [savedOnly, setSavedOnly] = useState<boolean>(false);

  // Per-row flip animations (supports up to 4 mechanical slat rows smoothly)
  const [flapScales] = useState<Animated.Value[]>(() => [
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    void readLocalJsonAsync<SavedQuotePrefs>(STORAGE_QUOTE_PREFS_KEY, {}).then(
      (saved) => {
        if (!active || !saved) return;
        if (Array.isArray(saved.favoriteIds)) {
          const validFavs = saved.favoriteIds.filter(
            (id): id is number =>
              typeof id === "number" &&
              BYTE_CAT_QUOTES.some((q) => q.id === id),
          );
          setFavoriteIds(validFavs);
        }
        if (typeof saved.lastQuoteId === "number") {
          const foundIdx = BYTE_CAT_QUOTES.findIndex(
            (q) => q.id === saved.lastQuoteId,
          );
          if (foundIdx >= 0) setQuoteIndex(foundIdx);
        }
      },
    );
    return () => {
      active = false;
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, []);

  const persistPrefs = useCallback((nextFavs: number[], nextQuoteId: number) => {
    writeLocalJson(STORAGE_QUOTE_PREFS_KEY, {
      favoriteIds: nextFavs,
      lastQuoteId: nextQuoteId,
    });
  }, []);

  const activePool: ByteCatQuote[] = useMemo(() => {
    if (!savedOnly) return BYTE_CAT_QUOTES;
    const favSet = new Set(favoriteIds);
    const filtered = BYTE_CAT_QUOTES.filter((q) => favSet.has(q.id));
    return filtered.length > 0 ? filtered : BYTE_CAT_QUOTES;
  }, [favoriteIds, savedOnly]);

  const currentQuote: ByteCatQuote =
    BYTE_CAT_QUOTES[quoteIndex % BYTE_CAT_QUOTES.length] || BYTE_CAT_QUOTES[0];
  const isFavorited = favoriteIds.includes(currentQuote.id);

  const displayLines = useMemo(
    () =>
      splitQuoteIntoFlapLines(
        currentQuote.quote.toUpperCase(),
        isPhone ? 28 : 54,
      ),
    [currentQuote.quote, isPhone],
  );

  const runClackFlip = useCallback(
    (nextGlobalIndex: number) => {
      playKeyClick();

      // Staggered mechanical collapse -> swap text -> snap open
      flapScales.forEach((animVal, rowIdx) => {
        animVal.stopAnimation();
        Animated.sequence([
          Animated.delay(rowIdx * 36),
          Animated.timing(animVal, {
            toValue: 0.14,
            duration: 95,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animVal, {
            toValue: 1,
            duration: 135,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
        ]).start();
      });

      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
      swapTimerRef.current = setTimeout(() => {
        setQuoteIndex(nextGlobalIndex);
        const nextQuote = BYTE_CAT_QUOTES[nextGlobalIndex];
        if (nextQuote) {
          persistPrefs(favoriteIds, nextQuote.id);
        }
      }, 95);
    },
    [favoriteIds, flapScales, persistPrefs],
  );

  function handleStep(delta: 1 | -1) {
    const curPoolIdx = activePool.findIndex((q) => q.id === currentQuote.id);
    const baseIdx = curPoolIdx >= 0 ? curPoolIdx : 0;
    const nextPoolIdx =
      (baseIdx + delta + activePool.length) % activePool.length;
    const nextQuote = activePool[nextPoolIdx];
    const nextGlobalIdx = BYTE_CAT_QUOTES.findIndex(
      (q) => q.id === nextQuote.id,
    );
    if (nextGlobalIdx >= 0) runClackFlip(nextGlobalIdx);
  }

  function handleShuffle() {
    if (activePool.length <= 1) return;
    const candidates = activePool.filter((q) => q.id !== currentQuote.id);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const nextGlobalIdx = BYTE_CAT_QUOTES.findIndex((q) => q.id === pick.id);
    if (nextGlobalIdx >= 0) runClackFlip(nextGlobalIdx);
  }

  function handleToggleFavorite() {
    const exists = favoriteIds.includes(currentQuote.id);
    const nextFavs = exists
      ? favoriteIds.filter((id) => id !== currentQuote.id)
      : [...favoriteIds, currentQuote.id];
    setFavoriteIds(nextFavs);
    if (!exists) {
      playSuccessChime();
    } else {
      playKeyClick();
    }
    if (nextFavs.length === 0 && savedOnly) {
      setSavedOnly(false);
    }
    persistPrefs(nextFavs, currentQuote.id);
  }

  function handleToggleSavedOnly() {
    if (favoriteIds.length === 0) return;
    playKeyClick();
    const nextSavedOnly = !savedOnly;
    setSavedOnly(nextSavedOnly);
    if (nextSavedOnly && !favoriteIds.includes(currentQuote.id)) {
      const firstFavIdx = BYTE_CAT_QUOTES.findIndex((q) =>
        favoriteIds.includes(q.id),
      );
      if (firstFavIdx >= 0) runClackFlip(firstFavIdx);
    }
  }

  const entryLabel = `ENTRY ${String(quoteIndex + 1).padStart(2, "0")}/${String(
    BYTE_CAT_QUOTES.length,
  ).padStart(2, "0")}`;

  return (
    <View testID="home-wisdom-flap-board" style={styles.chassis}>
      {/* Top Brushed Mechanical Header Row */}
      <View style={styles.topRow}>
        <View style={styles.brandCluster}>
          <View style={styles.ledDot} />
          <Text style={styles.brandLabel}>DEVY LOFT · DAILY WISDOM BOARD</Text>
          {!isPhone ? (
            <View style={styles.entryBadge}>
              <Text style={styles.entryBadgeText}>{entryLabel}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous developer wisdom quote"
            style={({ pressed }) => [
              styles.ctrlBtn,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={() => handleStep(-1)}
          >
            <Text style={styles.ctrlBtnText}>← PREV</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next developer wisdom quote"
            style={({ pressed }) => [
              styles.ctrlBtn,
              styles.ctrlBtnPrimary,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={() => handleStep(1)}
          >
            <Text style={[styles.ctrlBtnText, styles.ctrlBtnTextDark]}>
              NEXT →
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Shuffle developer wisdom quote"
            style={({ pressed }) => [
              styles.ctrlBtn,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={handleShuffle}
          >
            <Text style={styles.ctrlBtnText}>SHUFFLE</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorited
                ? "Remove quote from saved favorites"
                : "Save quote to favorites"
            }
            style={({ pressed }) => [
              styles.ctrlBtn,
              isFavorited && styles.ctrlBtnSaved,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={handleToggleFavorite}
          >
            <Text
              style={[
                styles.ctrlBtnText,
                isFavorited && styles.ctrlBtnTextDark,
              ]}
            >
              {isFavorited ? "★ SAVED" : "☆ SAVE"}
            </Text>
          </Pressable>

          {favoriteIds.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filter saved wisdom quotes"
              style={({ pressed }) => [
                styles.ctrlBtn,
                savedOnly && styles.ctrlBtnFilterActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={handleToggleSavedOnly}
            >
              <Text
                style={[
                  styles.ctrlBtnText,
                  savedOnly && styles.ctrlBtnTextDark,
                ]}
              >
                {savedOnly
                  ? `SAVED ONLY (${favoriteIds.length})`
                  : `★ (${favoriteIds.length})`}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Recessed Mechanical Display Housing — Individual Slats Per Line (Never Cuts Text!) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Flip to next developer wisdom quote"
        style={styles.displayHousing}
        onPress={() => handleStep(1)}
      >
        <View style={styles.slatsStack}>
          {displayLines.map((lineText, rowIdx) => {
            const animScale =
              flapScales[Math.min(rowIdx, flapScales.length - 1)];
            return (
              <Animated.View
                key={`slat-${rowIdx}`}
                style={[
                  styles.slatRow,
                  { transform: [{ scaleY: animScale }] },
                ]}
              >
                {/* Mechanical left/right hinge pins sitting neatly outside the lettering */}
                <View pointerEvents="none" style={styles.hingePinLeft} />
                <Text
                  style={[styles.slatText, isPhone && styles.slatTextPhone]}
                >
                  {lineText}
                </Text>
                <View pointerEvents="none" style={styles.hingePinRight} />
              </Animated.View>
            );
          })}
        </View>
      </Pressable>

      {/* Bottom Bevel: Author Plate + Mood Badge */}
      <View style={styles.bottomRow}>
        <Text style={styles.authorLabel}>
          — {currentQuote.author.toUpperCase()}
        </Text>
        <View
          style={[
            styles.moodBadge,
            { backgroundColor: currentQuote.accentBg || StudioColors.yellow },
          ]}
        >
          <Text style={styles.moodBadgeText}>{currentQuote.moodBadge}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    chassis: {
      width: "100%",
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 16,
      gap: 12,
      ...HardShadow,
    },
    topRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    brandCluster: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 1,
    },
    ledDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: StudioColors.lime,
      borderWidth: 1,
      borderColor: StudioColors.ink,
    },
    brandLabel: {
      color: colors.textPrimary,
      fontSize: 10.5,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
      flexShrink: 1,
    },
    entryBadge: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    entryBadgeText: {
      color: colors.textMuted,
      fontSize: 9,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "800",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    controlsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
    },
    ctrlBtn: {
      minHeight: 30,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    ctrlBtnPrimary: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    ctrlBtnSaved: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    ctrlBtnFilterActive: {
      backgroundColor: StudioColors.pink,
      borderColor: StudioColors.ink,
    },
    ctrlBtnText: {
      color: colors.textPrimary,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    ctrlBtnTextDark: {
      color: StudioColors.ink,
    },
    displayHousing: {
      width: "100%",
      backgroundColor: "#080A10",
      borderWidth: 2.5,
      borderColor: StudioColors.ink,
      borderRadius: 13,
      padding: 10,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    slatsStack: {
      gap: 6,
    },
    slatRow: {
      position: "relative",
      width: "100%",
      minHeight: 42,
      backgroundColor: "#141824",
      borderWidth: 1.5,
      borderColor: "#242B3E",
      borderRadius: 7,
      paddingHorizontal: 18,
      paddingVertical: 9,
      justifyContent: "center",
    },
    hingePinLeft: {
      position: "absolute",
      left: 5,
      top: "50%",
      marginTop: -4,
      width: 4,
      height: 8,
      borderRadius: 2,
      backgroundColor: "#090B10",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.14)",
    },
    hingePinRight: {
      position: "absolute",
      right: 5,
      top: "50%",
      marginTop: -4,
      width: 4,
      height: 8,
      borderRadius: 2,
      backgroundColor: "#090B10",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.14)",
    },
    slatText: {
      color: "#FAF6EB",
      fontSize: 16.5,
      lineHeight: 22,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    slatTextPhone: {
      fontSize: 13.5,
      lineHeight: 19,
      letterSpacing: 0.25,
    },
    bottomRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    authorLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.65,
    },
    moodBadge: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 4,
      ...HardShadowSm,
    },
    moodBadgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
  });
