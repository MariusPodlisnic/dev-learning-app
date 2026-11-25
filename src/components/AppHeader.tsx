"use no memo";

import { Session } from "@supabase/supabase-js";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  getLevelAvatarIcon,
  StudioIcon,
  StudioIconName,
  Text,
} from "./StudioIcon";
import {
  getStudioPaletteMeta,
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
  ThemeMode,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { isArcadeSection, ViewMode } from "../types/lesson";
import {
  type AmbientMixerState,
  getAmbientMixerState,
  stopAmbientMixer,
  subscribeAmbientMixer,
} from "../utils/ambientSoundscapes";
import {
  getLofiChannelMeta,
  getLofiRadioState,
  type LofiRadioState,
  stopLofiRadio,
  subscribeLofiRadio,
} from "../utils/lofiRadio";
import {
  hydrateSoundPreference,
  playKeyClick,
} from "../utils/soundEffects";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

interface AppHeaderProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isCompactHeader: boolean;
  pyodideReady: boolean;
  themeMode: ThemeMode;
  onToggleTheme?: () => void;
  devRank: { level: number; title: string; avatarIcon?: StudioIconName };
  streakCount: number;
  isPremium: boolean;
  session: Session | null;
  onOpenProfile: () => void;
  onOpenSettings?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenCodex?: () => void;
  onOpenPaywall: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

const HEADER_FLOATING_TOKENS = [
  { id: "ht-1", label: "0x01", leftPct: "14%" as const, top: 8, dir: 1 },
  { id: "ht-2", label: "{ }", leftPct: "36%" as const, top: 42, dir: -1 },
  { id: "ht-3", label: "λ", leftPct: "54%" as const, top: 10, dir: 1 },
  { id: "ht-4", label: "=>", leftPct: "73%" as const, top: 40, dir: -1 },
  { id: "ht-5", label: "✦", leftPct: "90%" as const, top: 12, dir: 1 },
];

const HEADER_VIA_PCTS = [
  "10%",
  "24%",
  "42%",
  "58%",
  "76%",
  "91%",
] as const;

function getModeAccent(viewMode: ViewMode): {
  primary: string;
  secondary: string;
} {
  switch (viewMode) {
    case "home":
      return { primary: StudioColors.mint, secondary: StudioColors.yellow };
    case "studio":
      return { primary: "#38BDF8", secondary: StudioColors.mint };
    case "arcade":
      return { primary: StudioColors.pink, secondary: StudioColors.yellow };
    case "bughunt":
      return { primary: StudioColors.coral, secondary: StudioColors.yellow };
    case "blitz":
      return { primary: StudioColors.lime, secondary: "#38BDF8" };
    case "flashcards":
      return { primary: StudioColors.mint, secondary: StudioColors.pink };
    case "detective":
      return { primary: "#38BDF8", secondary: StudioColors.yellow };
    case "minibuilds":
      return { primary: StudioColors.violet, secondary: StudioColors.mint };
    case "playground":
      return { primary: StudioColors.yellow, secondary: StudioColors.mint };
    case "algolab":
      return { primary: StudioColors.violet, secondary: StudioColors.pink };
    case "achievements":
      return { primary: StudioColors.yellow, secondary: StudioColors.coral };
    case "league":
      return { primary: StudioColors.lime, secondary: StudioColors.yellow };
    case "roadmap":
    default:
      return { primary: StudioColors.yellow, secondary: StudioColors.mint };
  }
}

function HeaderDynamicBackdrop({
  viewMode,
  themeMode,
}: {
  viewMode: ViewMode;
  themeMode: ThemeMode;
}) {
  const styles = useThemedStyles(getStyles);
  const isDark = themeMode === "dark";
  const { primary, secondary } = getModeAccent(viewMode);

  const [scanAnim] = useState(() => new Animated.Value(0));
  const [reverseScanAnim] = useState(() => new Animated.Value(0));
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 5400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(900),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    const reverseLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(reverseScanAnim, {
          toValue: 1,
          duration: 6200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(800),
        Animated.timing(reverseScanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    scanLoop.start();
    reverseLoop.start();
    floatLoop.start();

    return () => {
      scanLoop.stop();
      reverseLoop.stop();
      floatLoop.stop();
    };
  }, [floatAnim, reverseScanAnim, scanAnim]);

  const animStyles = useMemo(() => {
    const primaryPulseX = scanAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-80, 1480],
    });
    const primaryPulseOpacity = scanAnim.interpolate({
      inputRange: [0, 0.08, 0.9, 1],
      outputRange: [0, 0.95, 0.95, 0],
    });

    const secondaryPulseX = reverseScanAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1480, -80],
    });
    const secondaryPulseOpacity = reverseScanAnim.interpolate({
      inputRange: [0, 0.08, 0.9, 1],
      outputRange: [0, 0.85, 0.85, 0],
    });

    const orbDriftX = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-18, 22],
    });
    const orbScale = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.94, 1.08],
    });

    const tokenDriftUp = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-3, 3],
    });
    const tokenDriftDown = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [3, -3],
    });

    return {
      primaryPulseX,
      primaryPulseOpacity,
      secondaryPulseX,
      secondaryPulseOpacity,
      orbDriftX,
      orbScale,
      tokenDriftUp,
      tokenDriftDown,
    };
  }, [floatAnim, reverseScanAnim, scanAnim]);

  const webGridStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: isDark
            ? "radial-gradient(rgba(244, 240, 230, 0.09) 1px, transparent 1px)"
            : "radial-gradient(rgba(17, 17, 17, 0.09) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        } as object)
      : null;

  return (
    <View style={styles.backdropContainer} pointerEvents="none">
      {/* 1. Subtle Architectural Micro-Dot Grid */}
      {webGridStyle ? (
        <View style={[styles.backdropFullLayer, webGridStyle]} />
      ) : null}

      {/* 2. Mode-Reactive Breathing Ambient Glow Orbs */}
      <Animated.View
        style={[
          styles.backdropOrbLeft,
          {
            backgroundColor: primary,
            opacity: isDark ? 0.11 : 0.16,
            transform: [
              { translateX: animStyles.orbDriftX },
              { scale: animStyles.orbScale },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.backdropOrbRight,
          {
            backgroundColor: secondary,
            opacity: isDark ? 0.1 : 0.14,
            transform: [
              { translateX: animStyles.orbDriftX },
              { scale: animStyles.orbScale },
            ],
          },
        ]}
      />

      {/* 3. Horizontal Motherboard Bus Lines + Solder Via Nodes */}
      <View style={styles.headerTopBusLine} />
      <View style={styles.headerBottomBusLine} />

      {HEADER_VIA_PCTS.map((leftPct, idx) => {
        const viaColor = idx % 2 === 0 ? primary : secondary;
        return (
          <View
            key={leftPct}
            style={[
              styles.headerViaNode,
              {
                left: leftPct,
                top: idx % 2 === 0 ? 15 : 45,
                borderColor: viaColor,
              },
            ]}
          />
        );
      })}

      {/* 4. Gliding Horizontal Signal Pulses Along Upper & Lower Bus Rails */}
      <Animated.View
        style={[
          styles.headerSignalPacketWrap,
          {
            top: 15,
            opacity: animStyles.primaryPulseOpacity,
            transform: [{ translateX: animStyles.primaryPulseX }],
          },
        ]}
      >
        <View
          style={[
            styles.headerSignalTail,
            { backgroundColor: primary },
          ]}
        />
        <View
          style={[
            styles.headerSignalCore,
            { backgroundColor: StudioColors.yellow, borderColor: primary },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.headerSignalPacketWrap,
          {
            top: 45,
            opacity: animStyles.secondaryPulseOpacity,
            transform: [{ translateX: animStyles.secondaryPulseX }],
          },
        ]}
      >
        <View
          style={[
            styles.headerSignalTail,
            { backgroundColor: secondary },
          ]}
        />
        <View
          style={[
            styles.headerSignalCore,
            { backgroundColor: secondary, borderColor: StudioColors.ink },
          ]}
        />
      </Animated.View>

      {/* 5. Gentle Floating Syntax Micro-Tokens */}
      {HEADER_FLOATING_TOKENS.map((tok, idx) => (
        <Animated.View
          key={tok.id}
          style={[
            styles.headerFloatingToken,
            {
              left: tok.leftPct,
              top: tok.top,
              borderColor: idx % 2 === 0 ? primary : secondary,
              transform: [
                {
                  translateY:
                    tok.dir > 0
                      ? animStyles.tokenDriftUp
                      : animStyles.tokenDriftDown,
                },
              ],
            },
          ]}
        >
          <Text
            style={[
              styles.headerFloatingTokenText,
              { color: idx % 2 === 0 ? primary : secondary },
            ]}
          >
            {tok.label}
          </Text>
        </Animated.View>
      ))}

      {/* 6. Mode-Tinted Bottom Edge Accent Strip */}
      <View
        style={[
          styles.headerBottomAccentBar,
          { backgroundColor: primary },
        ]}
      />
    </View>
  );
}

export default function AppHeader({
  viewMode,
  onChangeViewMode,
  isCompactHeader,
  themeMode,
  onToggleTheme,
  devRank,
  streakCount,
  isPremium,
  session,
  onOpenProfile,
  onOpenSettings,
  onOpenCommandPalette,
  onOpenCodex,
  onOpenPaywall,
  onOpenAuth,
  onSignOut,
}: AppHeaderProps) {
  const { paletteId } = useTheme();
  const activePalette = getStudioPaletteMeta(paletteId);
  const styles = useThemedStyles(getStyles);
  const [lofiState, setLofiState] = useState<LofiRadioState>(() =>
    getLofiRadioState(),
  );
  const [ambientState, setAmbientState] = useState<AmbientMixerState>(() =>
    getAmbientMixerState(),
  );
  const lofiMeta = getLofiChannelMeta(lofiState.channel);

  useEffect(() => {
    void hydrateSoundPreference();
    const unsubscribeLofi = subscribeLofiRadio(setLofiState);
    const unsubscribeAmbient = subscribeAmbientMixer(setAmbientState);
    return () => {
      unsubscribeLofi();
      unsubscribeAmbient();
    };
  }, []);

  function handleSwitchMode(mode: ViewMode) {
    playKeyClick();
    onChangeViewMode(mode);
  }

  return (
    <View style={[styles.header, isCompactHeader && styles.headerCompact]}>
      {/* Cool Dynamic Studio Header Backdrop */}
      <HeaderDynamicBackdrop viewMode={viewMode} themeMode={themeMode} />

      {/* TIER 1: Brand + Account & Studio Utility Bar */}
      <View
        style={[
          styles.headerTopRow,
          isCompactHeader && styles.headerTopRowCompact,
        ]}
      >
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to Devy Home Menu"
            style={({ pressed }) => [
              styles.brandGroup,
              pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
            ]}
            onPress={() => handleSwitchMode("home")}
          >
            <View style={styles.brandIconBox}>
              <StudioIcon name="devlearn_logo" size={isCompactHeader ? 18 : 21} />
              <Text style={styles.brandIconText}>DEVY</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.categoryItemsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Profile and Stats"
              style={({ pressed }) => [
                styles.gamificationHeader,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={() => {
                playKeyClick();
                onOpenProfile();
              }}
            >
              {/* Profile & Developer Rank */}
              <View
                style={[
                  styles.rankPill,
                  themeMode === "light"
                    ? styles.rankPillLight
                    : styles.rankPillDark,
                  isCompactHeader && styles.headerActionBoxCompact,
                ]}
              >
                <View style={styles.rankAvatarFrame}>
                  <StudioIcon
                    name={devRank.avatarIcon ?? getLevelAvatarIcon(devRank.level)}
                    size={isCompactHeader ? 18 : 20}
                  />
                </View>
                <Text style={[styles.headerMainBase, styles.rankPillText]}>
                  LVL {devRank.level}
                </Text>
              </View>

              {/* Daily Streak */}
              <View
                style={[
                  styles.statPill,
                  themeMode === "light"
                    ? styles.statPillLight
                    : styles.statPillDark,
                  isCompactHeader && styles.headerActionBoxCompact,
                ]}
              >
                <StudioIcon name="flame" size={isCompactHeader ? 15 : 16} />
                <Text
                  style={[
                    styles.headerMainBase,
                    styles.statText,
                    themeMode === "light"
                      ? styles.statTextLight
                      : styles.statTextDark,
                  ]}
                >
                  {streakCount} {isCompactHeader ? "D" : streakCount === 1 ? "DAY" : "DAYS"}
                </Text>
              </View>
            </Pressable>

            {/* Mobile-only Trophies & League pills (desktop places them cleanly on the Nav Rail) */}
            {isCompactHeader && (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open Achievements Trophy Hall"
                  style={({ pressed }) => [
                    styles.achievementsTabBtn,
                    themeMode === "light"
                      ? styles.achievementsTabBtnCalmLight
                      : styles.achievementsTabBtnCalmDark,
                    styles.headerActionBoxCompact,
                    viewMode === "achievements" &&
                      styles.achievementsTabBtnActive,
                    pressed && {
                      transform: [{ translateX: 1 }, { translateY: 1 }],
                    },
                  ]}
                  onPress={() => handleSwitchMode("achievements")}
                >
                  <View style={styles.achievementsBtnRow}>
                    <StudioIcon name="nav_achievements" size={15} />
                    <Text
                      style={[
                        styles.headerMainBase,
                        styles.achievementsTabBtnText,
                        viewMode === "achievements" &&
                          styles.achievementsTabBtnTextActive,
                      ]}
                    >
                      TROPHIES
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open Weekly League Leaderboard"
                  style={({ pressed }) => [
                    styles.achievementsTabBtn,
                    themeMode === "light"
                      ? styles.leaderboardTabBtnCalmLight
                      : styles.leaderboardTabBtnCalmDark,
                    styles.headerActionBoxCompact,
                    viewMode === "league" && styles.leaderboardTabBtnActive,
                    pressed && {
                      transform: [{ translateX: 1 }, { translateY: 1 }],
                    },
                  ]}
                  onPress={() => handleSwitchMode("league")}
                >
                  <View style={styles.achievementsBtnRow}>
                    <StudioIcon name="nav_leaderboard" size={15} />
                    <Text
                      style={[
                        styles.headerMainBase,
                        styles.achievementsTabBtnText,
                        viewMode === "league" &&
                          styles.achievementsTabBtnTextActive,
                      ]}
                    >
                      LEAGUE
                    </Text>
                  </View>
                </Pressable>
              </>
            )}

            {/* Pro Membership */}
            {isPremium ? (
              <View
                style={[
                  styles.proBadge,
                  themeMode === "light"
                    ? styles.proBadgeLight
                    : styles.proBadgeDark,
                  isCompactHeader && styles.headerActionBoxCompact,
                ]}
              >
                <StudioIcon name="pro_member" size={isCompactHeader ? 15 : 16} />
                <Text style={[styles.headerMainBase, styles.proBadgeText]}>
                  PRO ✓
                </Text>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Devy Pro"
                style={({ pressed }) => [
                  styles.upgradeHeaderBtn,
                  themeMode === "light"
                    ? styles.upgradeHeaderBtnLight
                    : styles.upgradeHeaderBtnDark,
                  isCompactHeader && styles.headerActionBoxCompact,
                  pressed && {
                    transform: [{ translateX: 1 }, { translateY: 1 }],
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  onOpenPaywall();
                }}
              >
                <StudioIcon name="pro_member" size={isCompactHeader ? 15 : 16} />
                <Text
                  style={[styles.headerMainBase, styles.upgradeHeaderBtnText]}
                >
                  GET PRO
                </Text>
              </Pressable>
            )}

            {/* Cloud Sync / Sign In */}
            {session ? (
              <View style={styles.userSection}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sign out of cloud sync"
                  style={({ pressed }) => [
                    styles.authBtn,
                    themeMode === "light"
                      ? styles.saveBtnLight
                      : styles.saveBtnDark,
                    isCompactHeader && styles.headerActionBoxCompact,
                    pressed && {
                      transform: [{ translateX: 1 }, { translateY: 1 }],
                    },
                  ]}
                  onPress={() => {
                    playKeyClick();
                    onSignOut();
                  }}
                >
                  <StudioIcon name="lock" size={isCompactHeader ? 14 : 16} />
                  <Text style={[styles.headerMainBase, styles.authBtnText]}>
                    SIGN OUT
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save progress and sign in"
                style={({ pressed }) => [
                  styles.authBtn,
                  themeMode === "light"
                    ? styles.saveBtnLight
                    : styles.saveBtnDark,
                  isCompactHeader && styles.headerActionBoxCompact,
                  pressed && {
                    transform: [{ translateX: 1 }, { translateY: 1 }],
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  onOpenAuth();
                }}
              >
                <StudioIcon name="cloud" size={isCompactHeader ? 15 : 16} />
                <Text style={[styles.headerMainBase, styles.loginBtnText]}>
                  {isCompactHeader ? "SAVE" : "SIGN IN"}
                </Text>
              </Pressable>
            )}

            {!isCompactHeader && <View style={styles.headerDivider} />}

            {/* Active Audio Pill (shown only when Lo-Fi or Ambient is playing) */}
            {(() => {
              const hasAmbient =
                ambientState.isPlaying && ambientState.activeCount > 0;
              const hasAudioPlaying = lofiState.isPlaying || hasAmbient;
              if (!hasAudioPlaying) return null;

              const audioAccent = lofiState.isPlaying
                ? lofiMeta.accentColor
                : StudioColors.mint;
              const audioMicro =
                lofiState.isPlaying && hasAmbient
                  ? `LO-FI + ${ambientState.activeCount} MIX`
                  : lofiState.isPlaying
                    ? lofiMeta.shortLabel
                    : `${ambientState.activeCount} AMBIENT`;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pause active studio audio"
                  style={({ pressed }) => [
                    styles.audioNowPlayingBtn,
                    {
                      borderColor:
                        themeMode === "light" ? StudioColors.ink : audioAccent,
                    },
                    isCompactHeader && styles.headerActionBoxCompact,
                    pressed && {
                      transform: [{ translateX: 1 }, { translateY: 1 }],
                    },
                  ]}
                  onPress={() => {
                    stopLofiRadio();
                    stopAmbientMixer();
                    playKeyClick();
                  }}
                >
                  <View
                    style={[
                      styles.pulseDot,
                      { backgroundColor: audioAccent },
                    ]}
                  />
                  <Text
                    style={[
                      styles.headerMainBase,
                      styles.settingsLaunchText,
                    ]}
                  >
                    ❚❚ {isCompactHeader ? "AUDIO" : audioMicro}
                  </Text>
                </Pressable>
              );
            })()}

            {/* Field Guide Codex Button */}
            {!isCompactHeader && onOpenCodex && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Constellation Field Guide Codex"
                style={({ pressed }) => [
                  styles.cmdKeycapBtn,
                  themeMode === "light"
                    ? styles.settingsLaunchBtnLight
                    : styles.settingsLaunchBtnDark,
                  pressed && {
                    transform: [{ translateX: 1 }, { translateY: 1 }],
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  onOpenCodex();
                }}
              >
                <StudioIcon name="book" size={16} />
                <Text style={styles.cmdKeycapText}>CODEX</Text>
                <Text style={styles.cmdKeycapHint}>⌘J</Text>
              </Pressable>
            )}

            {/* Command Palette Button */}
            {onOpenCommandPalette && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Quick Command Palette"
                style={({ pressed }) => [
                  styles.cmdKeycapBtn,
                  isCompactHeader && styles.cmdKeycapBtnCompact,
                  themeMode === "light"
                    ? styles.settingsLaunchBtnLight
                    : styles.settingsLaunchBtnDark,
                  pressed && {
                    transform: [{ translateX: 1 }, { translateY: 1 }],
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  onOpenCommandPalette();
                }}
              >
                <StudioIcon name="search" size={16} />
                {!isCompactHeader && (
                  <Text style={styles.cmdKeycapText}>⌘K</Text>
                )}
              </Pressable>
            )}

            {/* Unified Settings Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Studio Settings and Themes"
              style={({ pressed }) => [
                styles.settingsLaunchBtn,
                themeMode === "light"
                  ? styles.settingsLaunchBtnLight
                  : styles.settingsLaunchBtnDark,
                isCompactHeader && styles.headerActionBoxCompact,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={() => {
                playKeyClick();
                if (onOpenSettings) {
                  onOpenSettings();
                } else {
                  onToggleTheme?.();
                }
              }}
            >
              <StudioIcon name="menu_settings" size={isCompactHeader ? 15 : 16} />
              <Text style={[styles.headerMainBase, styles.settingsLaunchText]}>
                SETTINGS
              </Text>
              <View
                style={[
                  styles.paletteAccentDot,
                  { backgroundColor: activePalette.accent },
                ]}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* TIER 2: Dedicated Desktop Destination Navigation Rail */}
      {!isCompactHeader && (
        <View style={styles.headerNavRail}>
          <View style={styles.modeSwitcher}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Devy Home Menu"
              style={({ pressed }) => [
                styles.modeBtn,
                viewMode === "home" && styles.modeBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("home")}
            >
              <StudioIcon name="nav_home" size={17} />
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "home" && styles.modeBtnTextActive,
                ]}
              >
                HOME
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modeBtn,
                viewMode === "roadmap" && styles.modeBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("roadmap")}
            >
              <StudioIcon name="nav_skillmap" size={17} />
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "roadmap" && styles.modeBtnTextActive,
                ]}
              >
                SKILL MAP
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modeBtn,
                viewMode === "studio" && styles.modeBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("studio")}
            >
              <StudioIcon name="nav_studio" size={17} />
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "studio" && styles.modeBtnTextActive,
                ]}
              >
                CODE STUDIO
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Devy Mini-Game Arcade"
              style={({ pressed }) => [
                styles.modeBtn,
                isArcadeSection(viewMode) && styles.modeBtnArcadeActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("arcade")}
            >
              <StudioIcon name="nav_arcade" size={17} />
              <Text
                style={[
                  styles.modeBtnText,
                  isArcadeSection(viewMode) && styles.modeBtnArcadeTextActive,
                ]}
              >
                ARCADE
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modeBtn,
                viewMode === "algolab" && styles.modeBtnAlgoLabActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("algolab")}
            >
              <StudioIcon
                name={isPremium ? "nav_algolab" : "lock"}
                size={17}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "algolab" && styles.modeBtnAlgoLabTextActive,
                ]}
              >
                ALGO LAB
              </Text>
            </Pressable>
          </View>

          {/* Right side of Nav Rail: Progress & Community Destinations */}
          <View style={styles.navRailRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Achievements Trophy Hall"
              style={({ pressed }) => [
                styles.achievementsTabBtn,
                themeMode === "light"
                  ? styles.achievementsTabBtnCalmLight
                  : styles.achievementsTabBtnCalmDark,
                viewMode === "achievements" && styles.achievementsTabBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("achievements")}
            >
              <View style={styles.achievementsBtnRow}>
                <StudioIcon name="nav_achievements" size={17} />
                <Text
                  style={[
                    styles.modeBtnText,
                    styles.achievementsTabBtnText,
                    viewMode === "achievements" &&
                      styles.achievementsTabBtnTextActive,
                  ]}
                >
                  ACHIEVEMENTS
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Weekly League Leaderboard"
              style={({ pressed }) => [
                styles.achievementsTabBtn,
                themeMode === "light"
                  ? styles.leaderboardTabBtnCalmLight
                  : styles.leaderboardTabBtnCalmDark,
                viewMode === "league" && styles.leaderboardTabBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("league")}
            >
              <View style={styles.achievementsBtnRow}>
                <StudioIcon name="nav_leaderboard" size={17} />
                <Text
                  style={[
                    styles.modeBtnText,
                    styles.achievementsTabBtnText,
                    viewMode === "league" &&
                      styles.achievementsTabBtnTextActive,
                  ]}
                >
                  LEADERBOARD
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    header: {
      position: "relative",
      overflow: "hidden",
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
      backgroundColor: StudioColors.surface,
      flexDirection: "column",
      zIndex: 100,
    },
    headerCompact: {
      paddingVertical: 0,
    },
    headerTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      paddingVertical: 7,
      gap: 10,
      zIndex: 2,
    },
    headerTopRowCompact: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      gap: 6,
    },
    headerNavRail: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      paddingVertical: 6,
      gap: 10,
      backgroundColor: StudioColors.bg,
      borderTopWidth: 1.5,
      borderTopColor: StudioColors.borderSubtle,
      zIndex: 2,
    },
    navRailRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    backdropContainer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 0,
      overflow: "hidden",
    },
    backdropFullLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    backdropOrbLeft: {
      position: "absolute",
      top: -65,
      left: 80,
      width: 240,
      height: 160,
      borderRadius: 120,
    },
    backdropOrbRight: {
      position: "absolute",
      bottom: -70,
      right: 120,
      width: 260,
      height: 160,
      borderRadius: 130,
    },
    headerTopBusLine: {
      position: "absolute",
      top: 18,
      left: 0,
      right: 0,
      height: 1.5,
      backgroundColor: StudioColors.borderSubtle,
      opacity: 0.36,
    },
    headerBottomBusLine: {
      position: "absolute",
      top: 48,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: StudioColors.borderSubtle,
      opacity: 0.26,
    },
    headerViaNode: {
      position: "absolute",
      width: 7,
      height: 7,
      borderRadius: 3.5,
      borderWidth: 1.5,
      backgroundColor: StudioColors.surface,
      opacity: 0.48,
    },
    headerSignalPacketWrap: {
      position: "absolute",
      left: 0,
      width: 44,
      height: 7,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    headerSignalTail: {
      width: 34,
      height: 2,
      borderRadius: 1,
      opacity: 0.45,
    },
    headerSignalCore: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      borderWidth: 1.5,
    },
    headerFloatingToken: {
      position: "absolute",
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      borderWidth: 1,
      backgroundColor: StudioColors.surface,
      opacity: 0.22,
    },
    headerFloatingTokenText: {
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    headerBottomAccentBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 2,
      opacity: 0.55,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      maxWidth: "100%",
      gap: 5,
      zIndex: 2,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      maxWidth: "100%",
      gap: 4,
      zIndex: 2,
    },
    headerDivider: {
      width: 1.5,
      height: 18,
      alignSelf: "center",
      backgroundColor: StudioColors.borderSubtle,
      marginHorizontal: 1,
    },
    brandGroup: {
      flexDirection: "row",
      alignItems: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    brandIconBox: {
      flexDirection: "row",
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 6,
      minHeight: 36,
      borderRadius: 8,
      backgroundColor: StudioColors.ink,
      borderWidth: 2,
      borderColor: StudioColors.border,
      justifyContent: "center",
      alignItems: "center",
      ...HardShadowSm,
    },
    brandIconText: {
      color: StudioColors.lime,
      fontSize: 12.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    categoryGroupTray: {
      position: "relative",
      maxWidth: "100%",
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingTop: 11,
      paddingBottom: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    categoryGroupTrayCompact: {
      paddingTop: 5,
      paddingBottom: 5,
      paddingHorizontal: 6,
    },
    categoryLabelPill: {
      position: "absolute",
      top: -8,
      left: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1,
      borderColor: StudioColors.border,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 1,
      zIndex: 2,
    },
    categoryLabelText: {
      color: StudioColors.textSecondary,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    categoryItemsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 7,
    },
    modeSwitcher: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    modeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingHorizontal: 14,
      paddingVertical: 7,
      minHeight: 36,
      borderRadius: 8,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    modeBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    modeBtnArcadeActive: {
      backgroundColor: StudioColors.pink,
      borderColor: StudioColors.ink,
    },
    modeBtnAlgoLabActive: {
      backgroundColor: StudioColors.violet,
      borderColor: StudioColors.ink,
    },
    modeBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    modeBtnTextActive: { color: StudioColors.ink },
    modeBtnArcadeTextActive: {
      color: StudioColors.ink,
      fontWeight: "900",
    },
    modeBtnAlgoLabTextActive: {
      color: StudioColors.ink,
      fontWeight: "900",
    },
    statusPill: {
      backgroundColor: StudioColors.surface,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    pulseDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    themeToggleBtn: {
      backgroundColor: StudioColors.surfaceElevated,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    themeToggleBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      lineHeight: 12,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    audioNowPlayingBtn: {
      backgroundColor: StudioColors.surfaceElevated,
      paddingHorizontal: 11,
      paddingVertical: 6,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    paletteAccentDot: {
      width: 9,
      height: 9,
      borderRadius: 99,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    gamificationHeader: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: 6,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    headerBtnTextStack: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: 2,
    },
    headerMicroBase: {
      fontSize: 7.5,
      lineHeight: 10,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
      textAlign: "left",
    },
    headerMainBase: {
      fontSize: 10.5,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
      textAlign: "left",
    },
    headerBtnMicroLabel: {
      color: "rgba(17, 17, 17, 0.72)",
      fontSize: 7.5,
      lineHeight: 10,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    rankPill: {
      paddingHorizontal: 11,
      paddingVertical: 5,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      ...HardShadowSm,
    },
    rankPillDark: {
      backgroundColor: "#252138",
      borderColor: "#7D6BC4",
    },
    rankPillLight: {
      backgroundColor: "#EDE9FE",
      borderColor: StudioColors.ink,
    },
    rankMicroDark: {
      color: "#C4B5FD",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    rankMicroLight: {
      color: "#5B21B6",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    rankAvatarFrame: {
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      backgroundColor: StudioColors.ink,
      overflow: "hidden",
    },
    rankLevelBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 4,
    },
    rankLevelBadgeText: {
      color: StudioColors.violet,
      fontSize: 8.5,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    rankPillText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    statPill: {
      paddingHorizontal: 11,
      paddingVertical: 5,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      ...HardShadowSm,
    },
    statPillDark: {
      backgroundColor: "#2C2219",
      borderColor: "#B47B38",
    },
    statPillLight: {
      backgroundColor: StudioColors.amberSoft,
      borderColor: StudioColors.ink,
    },
    statMicroDark: {
      color: "#F3C677",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    statMicroLight: {
      color: "#92400E",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    statText: {
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    statTextDark: {
      color: StudioColors.textPrimary,
    },
    statTextLight: {
      color: StudioColors.ink,
    },
    headerActionBoxCompact: {
      minHeight: 30,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    proBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 5,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 2,
      justifyContent: "center",
      ...HardShadowSm,
    },
    proBadgeDark: {
      backgroundColor: "#1D2B1F",
      borderColor: "#72A83B",
    },
    proBadgeLight: {
      backgroundColor: "#ECFCCB",
      borderColor: StudioColors.ink,
    },
    proBadgeMicroDark: {
      color: StudioColors.lime,
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    proBadgeMicroLight: {
      color: "#3F6212",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    proBadgeText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    proStatusKeycap: {
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    proStatusKeycapDark: {
      backgroundColor: "rgba(184, 255, 59, 0.16)",
      borderColor: "rgba(184, 255, 59, 0.45)",
    },
    proStatusKeycapLight: {
      backgroundColor: StudioColors.ink,
      borderColor: StudioColors.ink,
    },
    proStatusKeycapText: {
      color: StudioColors.lime,
      fontSize: 8.5,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    achievementsTabBtn: {
      paddingHorizontal: 13,
      paddingVertical: 6,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 1.5,
      justifyContent: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    achievementsTabBtnCalmDark: {
      backgroundColor: "#1F2E2B",
      borderColor: "#4C796F",
    },
    achievementsTabBtnCalmLight: {
      backgroundColor: "#E0F2EA",
      borderColor: StudioColors.ink,
    },
    achievementsCalmMicroDark: {
      color: "#9FD8C7",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    achievementsCalmMicroLight: {
      color: "#295A4C",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    achievementsBtnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    achievementsTabBtnActive: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
    },
    leaderboardTabBtnCalmDark: {
      backgroundColor: "#252B1D",
      borderColor: "#7FA63C",
    },
    leaderboardTabBtnCalmLight: {
      backgroundColor: "#ECFCCB",
      borderColor: StudioColors.ink,
    },
    leaderboardCalmMicroDark: {
      color: "#C4F16E",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    leaderboardCalmMicroLight: {
      color: "#3F6212",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    leaderboardTabBtnActive: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    settingsLaunchBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    settingsLaunchBtnDark: {
      backgroundColor: StudioColors.surfaceElevated,
      borderColor: StudioColors.border,
    },
    settingsLaunchBtnLight: {
      backgroundColor: StudioColors.surfaceElevated,
      borderColor: StudioColors.ink,
    },
    settingsLaunchMicroDark: {
      color: StudioColors.textSecondary,
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    settingsLaunchMicroLight: {
      color: StudioColors.textSecondary,
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    settingsLaunchText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    cmdKeycapBtn: {
      paddingHorizontal: 11,
      paddingVertical: 5,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    cmdKeycapBtnCompact: {
      paddingHorizontal: 7,
      minHeight: 30,
      minWidth: 32,
    },
    cmdKeycapText: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    cmdKeycapHint: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    achievementsTabBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    achievementsTabBtnTextActive: {
      color: StudioColors.ink,
    },
    upgradeHeaderBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    upgradeHeaderBtnDark: {
      backgroundColor: "#2E1F2B",
      borderColor: "#B9639E",
    },
    upgradeHeaderBtnLight: {
      backgroundColor: "#FCE7F3",
      borderColor: StudioColors.ink,
    },
    upgradeMicroDark: {
      color: StudioColors.pink,
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    upgradeMicroLight: {
      color: "#9D174D",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    upgradeHeaderBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    headerCtaKeycap: {
      flexDirection: "row",
      gap: 4,
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    headerCtaKeycapPinkDark: {
      borderWidth: 1,
      borderColor: "rgba(255, 144, 232, 0.4)",
    },
    headerCtaKeycapLimeDark: {
      borderWidth: 1,
      borderColor: "rgba(184, 255, 59, 0.35)",
    },
    headerCtaKeycapPinkText: {
      color: StudioColors.pink,
      fontSize: 8.5,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    headerCtaKeycapLimeText: {
      color: StudioColors.lime,
      fontSize: 8.5,
      lineHeight: 11,
      includeFontPadding: false,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    userSection: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: 6,
    },
    authBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      minHeight: 36,
      borderRadius: 8,
      borderWidth: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    loginBtn: {
      paddingLeft: 9,
      paddingRight: 6,
      ...HardShadow,
    },
    saveBtnDark: {
      backgroundColor: "#1E292E",
      borderColor: "#4B8396",
    },
    saveBtnLight: {
      backgroundColor: "#E0F2FE",
      borderColor: StudioColors.ink,
    },
    saveMicroDark: {
      color: "#93D5EA",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    saveMicroLight: {
      color: "#075985",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    authBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    loginBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
  });
