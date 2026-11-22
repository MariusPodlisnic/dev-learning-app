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
  WISDOM_QUOTES,
  type WisdomQuote,
} from "../constants/wisdomQuotes";
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
const USE_NATIVE_DRIVER = Platform.OS !== "web";

interface SavedQuotePrefs {
  favoriteIds?: number[];
  lastQuoteId?: number;
}

export default function HomeWisdomFlapBoard() {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const isPhone = windowWidth > 0 && windowWidth < 560;

  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [savedOnly, setSavedOnly] = useState<boolean>(false);

  const [flapScale] = useState<Animated.Value>(() => new Animated.Value(1));
  const [flapOpacity] = useState<Animated.Value>(() => new Animated.Value(1));
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
              WISDOM_QUOTES.some((q) => q.id === id),
          );
          setFavoriteIds(validFavs);
        }
        if (typeof saved.lastQuoteId === "number") {
          const foundIdx = WISDOM_QUOTES.findIndex(
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

  const activePool: WisdomQuote[] = useMemo(() => {
    if (!savedOnly) return WISDOM_QUOTES;
    const favSet = new Set(favoriteIds);
    const filtered = WISDOM_QUOTES.filter((q) => favSet.has(q.id));
    return filtered.length > 0 ? filtered : WISDOM_QUOTES;
  }, [favoriteIds, savedOnly]);

  const currentQuote: WisdomQuote =
    WISDOM_QUOTES[quoteIndex % WISDOM_QUOTES.length] || WISDOM_QUOTES[0];
  const isFavorited = favoriteIds.includes(currentQuote.id);

  const runClackFlip = useCallback(
    (nextGlobalIndex: number) => {
      playKeyClick();
      flapScale.stopAnimation();
      flapOpacity.stopAnimation();

      Animated.parallel([
        Animated.sequence([
          Animated.timing(flapScale, {
            toValue: 0.16,
            duration: 90,
            easing: Easing.in(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(flapScale, {
            toValue: 1,
            duration: 140,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.sequence([
          Animated.timing(flapOpacity, {
            toValue: 0.55,
            duration: 90,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(flapOpacity, {
            toValue: 1,
            duration: 130,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]).start();

      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
      swapTimerRef.current = setTimeout(() => {
        setQuoteIndex(nextGlobalIndex);
        const nextQuote = WISDOM_QUOTES[nextGlobalIndex];
        if (nextQuote) {
          persistPrefs(favoriteIds, nextQuote.id);
        }
      }, 90);
    },
    [favoriteIds, flapOpacity, flapScale, persistPrefs],
  );

  function handleStep(delta: 1 | -1) {
    const curPoolIdx = activePool.findIndex((q) => q.id === currentQuote.id);
    const baseIdx = curPoolIdx >= 0 ? curPoolIdx : 0;
    const nextPoolIdx =
      (baseIdx + delta + activePool.length) % activePool.length;
    const nextQuote = activePool[nextPoolIdx];
    const nextGlobalIdx = WISDOM_QUOTES.findIndex(
      (q) => q.id === nextQuote.id,
    );
    if (nextGlobalIdx >= 0) runClackFlip(nextGlobalIdx);
  }

  function handleShuffle() {
    if (activePool.length <= 1) return;
    const candidates = activePool.filter((q) => q.id !== currentQuote.id);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const nextGlobalIdx = WISDOM_QUOTES.findIndex((q) => q.id === pick.id);
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
      const firstFavIdx = WISDOM_QUOTES.findIndex((q) =>
        favoriteIds.includes(q.id),
      );
      if (firstFavIdx >= 0) runClackFlip(firstFavIdx);
    }
  }

  const entryLabel = `ENTRY ${String(quoteIndex + 1).padStart(2, "0")}/${String(
    WISDOM_QUOTES.length,
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

      {/* Unified Recessed Mechanical Display Panel (Clean single flow, zero mid-text cuts!) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Flip to next developer wisdom quote"
        style={styles.displayHousing}
        onPress={() => handleStep(1)}
      >
        <Animated.View
          style={[
            styles.displayPlate,
            {
              opacity: flapOpacity,
              transform: [{ scaleY: flapScale }],
            },
          ]}
        >
          <View pointerEvents="none" style={styles.hingePinLeft} />
          <Text style={[styles.quoteText, isPhone && styles.quoteTextPhone]}>
            “{currentQuote.quote.toUpperCase()}”
          </Text>
          <View pointerEvents="none" style={styles.hingePinRight} />
        </Animated.View>
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
      backgroundColor: "#07090E",
      borderWidth: 2.5,
      borderColor: StudioColors.ink,
      borderRadius: 14,
      padding: 8,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    displayPlate: {
      position: "relative",
      width: "100%",
      minHeight: 74,
      backgroundColor: "#121622",
      borderWidth: 1.5,
      borderColor: "#232A3E",
      borderBottomWidth: 3,
      borderBottomColor: "#090B10",
      borderRadius: 9,
      paddingHorizontal: 24,
      paddingVertical: 18,
      justifyContent: "center",
    },
    hingePinLeft: {
      position: "absolute",
      left: 7,
      top: "50%",
      marginTop: -6,
      width: 5,
      height: 12,
      borderRadius: 2,
      backgroundColor: "#080A10",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.15)",
    },
    hingePinRight: {
      position: "absolute",
      right: 7,
      top: "50%",
      marginTop: -6,
      width: 5,
      height: 12,
      borderRadius: 2,
      backgroundColor: "#080A10",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.15)",
    },
    quoteText: {
      color: "#FAF6EB",
      fontSize: 18,
      lineHeight: 27,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    quoteTextPhone: {
      fontSize: 14.5,
      lineHeight: 22,
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
