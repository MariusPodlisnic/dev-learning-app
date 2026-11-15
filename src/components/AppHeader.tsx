"use no memo";

import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { StudioIcon, Text } from "./StudioIcon";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
  ThemeMode,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { ViewMode } from "../types/lesson";
import {
  hydrateSoundPreference,
  isHapticsEnabled,
  isNativeMobilePlatform,
  isSoundEnabled,
  playKeyClick,
  setHapticsEnabled,
  setSoundEnabled,
} from "../utils/soundEffects";
import { getPythonRuntimeStatus } from "../utils/pyodideRunner";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

interface AppHeaderProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isCompactHeader: boolean;
  pyodideReady: boolean;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  devRank: { level: number; title: string };
  streakCount: number;
  isPremium: boolean;
  session: Session | null;
  onOpenProfile: () => void;
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
    case "studio":
      return { primary: "#38BDF8", secondary: StudioColors.mint };
    case "bughunt":
      return { primary: StudioColors.coral, secondary: StudioColors.yellow };
    case "blitz":
      return { primary: StudioColors.lime, secondary: "#38BDF8" };
    case "algolab":
      return { primary: StudioColors.violet, secondary: StudioColors.pink };
    case "achievements":
      return { primary: StudioColors.yellow, secondary: StudioColors.coral };
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
  pyodideReady,
  themeMode,
  onToggleTheme,
  devRank,
  streakCount,
  isPremium,
  session,
  onOpenProfile,
  onOpenPaywall,
  onOpenAuth,
  onSignOut,
}: AppHeaderProps) {
  const styles = useThemedStyles(getStyles);
  const showHapticsToggle = isNativeMobilePlatform();
  const [sfxOn, setSfxOn] = useState<boolean>(() => isSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState<boolean>(() =>
    isHapticsEnabled()
  );

  useEffect(() => {
    let active = true;
    void hydrateSoundPreference().then((hydratedSound) => {
      if (!active) return;
      setSfxOn(hydratedSound);
      setHapticsOn(isHapticsEnabled());
    });
    return () => {
      active = false;
    };
  }, []);

  function handleSwitchMode(mode: ViewMode) {
    playKeyClick();
    onChangeViewMode(mode);
  }

  function handleToggleSfx() {
    const next = !sfxOn;
    setSfxOn(next);
    setSoundEnabled(next);
  }

  function handleToggleHaptics() {
    const next = !hapticsOn;
    setHapticsOn(next);
    setHapticsEnabled(next);
  }

  return (
    <View style={[styles.header, isCompactHeader && styles.headerCompact]}>
      {/* Cool Dynamic Studio Header Backdrop */}
      <HeaderDynamicBackdrop viewMode={viewMode} themeMode={themeMode} />

      {/* Left Cluster: Brand + Category 1 (Coding & Labs) */}
      <View style={styles.headerLeft}>
        <Pressable
          style={({ pressed }) => [
            styles.brandGroup,
            pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
          ]}
          onPress={() => handleSwitchMode("roadmap")}
        >
          <View style={styles.brandIconBox}>
            <StudioIcon name="devlearn_logo" size={22} />
            <Text style={styles.brandIconText}>DEVLEARN</Text>
          </View>
        </Pressable>

        {/* CATEGORY 1: CODING & LABS (desktop/tablet header; mobile uses MobileThumbNav) */}
        {!isCompactHeader && (
          <View style={styles.categoryGroupTray}>
            <View style={styles.categoryLabelPill}>
              <StudioIcon name="menu_coding" size={13} />
              <Text style={styles.categoryLabelText}>CODING &amp; LABS</Text>
            </View>

            <View style={styles.modeSwitcher}>
            <Pressable
              style={({ pressed }) => [
                styles.modeBtn,
                viewMode === "roadmap" && styles.modeBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("roadmap")}
            >
              <StudioIcon name="nav_skillmap" size={18} />
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
              <StudioIcon name="nav_studio" size={18} />
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
              style={({ pressed }) => [
                styles.modeBtn,
                viewMode === "bughunt" && styles.modeBtnBugHuntActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("bughunt")}
            >
              <StudioIcon name="nav_bughunt" size={18} />
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "bughunt" && styles.modeBtnBugHuntTextActive,
                ]}
              >
                BUG HUNT
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modeBtn,
                viewMode === "blitz" && styles.modeBtnBlitzActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => handleSwitchMode("blitz")}
            >
              <StudioIcon name="nav_blitz" size={18} />
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "blitz" && styles.modeBtnBlitzTextActive,
                ]}
              >
                SPEED BLITZ
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
                size={18}
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

            <Pressable
              style={({ pressed }) => [
                styles.modeBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                router.push("/explore");
              }}
            >
              <StudioIcon name="nav_showcase" size={18} />
              <Text style={styles.modeBtnText}>SHOWCASE</Text>
            </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Right Cluster: Category 2 (Account & Rank) + Category 3 (Settings & Engine) */}
      <View style={styles.headerRight}>
        {/* CATEGORY 2: ACCOUNT & PROGRESS */}
        <View
          style={[
            styles.categoryGroupTray,
            isCompactHeader && styles.categoryGroupTrayCompact,
          ]}
        >
          {!isCompactHeader && (
            <View style={styles.categoryLabelPill}>
              <StudioIcon name="menu_account_rank" size={13} />
              <Text style={styles.categoryLabelText}>ACCOUNT &amp; RANK</Text>
            </View>
          )}

          <View style={styles.categoryItemsRow}>
            <Pressable
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
              {/* 1. Profile & Developer Rank Box */}
              <View style={styles.rankPill}>
                <View style={styles.rankLevelBadge}>
                  <StudioIcon name="menu_account_rank" size={15} />
                  <Text style={styles.rankLevelBadgeText}>
                    LVL 0{devRank.level}
                  </Text>
                </View>
                <View style={styles.headerBtnTextStack}>
                  {!isCompactHeader && (
                    <Text style={styles.headerBtnMicroLabel}>
                      MY PROFILE &amp; STATS ↗
                    </Text>
                  )}
                  <Text style={styles.rankPillText}>
                    {isCompactHeader ? "PROFILE ↗" : devRank.title.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* 2. Daily Streak Telemetry Box */}
              <View style={styles.statPill}>
                <View style={styles.headerBtnTextStack}>
                  {!isCompactHeader && (
                    <Text style={styles.headerBtnMicroLabel}>DAILY STREAK</Text>
                  )}
                  <Text style={styles.statText}>
                    🔥 {streakCount}{" "}
                    {isCompactHeader ? "D" : streakCount === 1 ? "DAY" : "DAYS"}
                  </Text>
                </View>
              </View>

              {isPremium && (
                <View style={styles.proBadge}>
                  <StudioIcon name="pro_member" size={18} />
                  <Text style={styles.proBadgeText}>PRO MEMBER</Text>
                </View>
              )}
            </Pressable>

            {/* 2b. Dedicated Achievements Tab Button */}
            <Pressable
              style={({ pressed }) => [
                styles.achievementsTabBtn,
                viewMode === "achievements" && styles.achievementsTabBtnActive,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={() => handleSwitchMode("achievements")}
            >
              <View style={styles.achievementsBtnRow}>
                <StudioIcon name="nav_achievements" size={18} />
                <View style={styles.headerBtnTextStack}>
                  {!isCompactHeader && (
                    <Text
                      style={[
                        styles.headerBtnMicroLabelMuted,
                        viewMode === "achievements" &&
                          styles.headerBtnMicroLabel,
                      ]}
                    >
                      TROPHY HALL
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.achievementsTabBtnText,
                      viewMode === "achievements" &&
                        styles.achievementsTabBtnTextActive,
                    ]}
                  >
                    ACHIEVEMENTS
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* 3. Unlock Pro Primary CTA Box */}
            {!isPremium && (
              <Pressable
                style={({ pressed }) => [
                  styles.upgradeHeaderBtn,
                  pressed && {
                    transform: [{ translateX: 2 }, { translateY: 2 }],
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  onOpenPaywall();
                }}
              >
                <StudioIcon name="pro_member" size={19} />
                <View style={styles.headerBtnTextStack}>
                  {!isCompactHeader && (
                    <Text style={styles.headerBtnMicroLabel}>
                      UNLOCK ALL 3 TRACKS
                    </Text>
                  )}
                  <Text style={styles.upgradeHeaderBtnText}>
                    {isCompactHeader ? "GET PRO" : "UPGRADE TO PRO"}
                  </Text>
                </View>
                <View style={styles.headerCtaKeycap}>
                  <StudioIcon name="pro_member" size={14} />
                  <Text style={styles.headerCtaKeycapPinkText}>PRO →</Text>
                </View>
              </Pressable>
            )}

            {/* 4. Cloud Sync / Save Progress Box */}
            {session ? (
              <View style={styles.userSection}>
                <Pressable
                  style={({ pressed }) => [
                    styles.authBtn,
                    pressed && {
                      transform: [{ translateX: 1 }, { translateY: 1 }],
                    },
                  ]}
                  onPress={() => {
                    playKeyClick();
                    onSignOut();
                  }}
                >
                  <View style={styles.headerBtnTextStack}>
                    {!isCompactHeader && (
                      <Text style={styles.headerBtnMicroLabelMuted}>
                        ☁️ CLOUD SYNCED ✓
                      </Text>
                    )}
                    <Text style={styles.authBtnText}>🔒 SIGN OUT</Text>
                  </View>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.authBtn,
                  styles.loginBtn,
                  pressed && {
                    transform: [{ translateX: 2 }, { translateY: 2 }],
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  onOpenAuth();
                }}
              >
                <View style={styles.headerBtnTextStack}>
                  {!isCompactHeader && (
                    <Text style={styles.headerBtnMicroLabel}>
                      ☁️ FREE CLOUD BACKUP
                    </Text>
                  )}
                  <Text style={styles.loginBtnText}>
                    💾 {isCompactHeader ? "SAVE" : "SAVE PROGRESS"}
                  </Text>
                </View>
                <View style={styles.headerCtaKeycap}>
                  <Text style={styles.headerCtaKeycapLimeText}>SIGN IN →</Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* CATEGORY 3: SETTINGS & ENGINE */}
        <View
          style={[
            styles.categoryGroupTray,
            isCompactHeader && styles.categoryGroupTrayCompact,
          ]}
        >
          {!isCompactHeader && (
            <View style={styles.categoryLabelPill}>
              <StudioIcon name="menu_settings" size={13} />
              <Text style={styles.categoryLabelText}>SETTINGS</Text>
            </View>
          )}

          <View style={styles.categoryItemsRow}>
            {!isCompactHeader && (() => {
              const runtimeStatus = getPythonRuntimeStatus(pyodideReady);
              return (
                <View style={styles.statusPill}>
                  <View
                    style={[
                      styles.pulseDot,
                      runtimeStatus.available
                        ? { backgroundColor: "#10B981" }
                        : runtimeStatus.mode === "web_only_notice"
                          ? { backgroundColor: "#6366F1" }
                          : { backgroundColor: "#F59E0B" },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {runtimeStatus.badgeLabel}
                  </Text>
                </View>
              );
            })()}

            <Pressable
              style={({ pressed }) => [
                styles.themeToggleBtn,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={handleToggleSfx}
            >
              <Text style={styles.themeToggleBtnText}>
                {sfxOn ? "🔊 SFX" : "🔇 MUTE"}
              </Text>
            </Pressable>

            {showHapticsToggle ? (
              <Pressable
                style={({ pressed }) => [
                  styles.themeToggleBtn,
                  pressed && {
                    transform: [{ translateX: 1 }, { translateY: 1 }],
                  },
                ]}
                onPress={handleToggleHaptics}
              >
                <Text style={styles.themeToggleBtnText}>
                  {hapticsOn ? "📳 HAPTIC" : "📴 NO HAPTIC"}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.themeToggleBtn,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={() => {
                playKeyClick();
                onToggleTheme();
              }}
            >
              <Text style={styles.themeToggleBtnText}>
                {themeMode === "light" ? "☾ DARK" : "☀ LIGHT"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    header: {
      position: "relative",
      overflow: "hidden",
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
      backgroundColor: StudioColors.surface,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 100,
      flexWrap: "wrap",
      gap: 10,
    },
    headerCompact: {
      paddingHorizontal: 10,
      paddingVertical: 8,
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
      gap: 10,
      zIndex: 2,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
      zIndex: 2,
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
      paddingVertical: 8,
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
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    categoryGroupTray: {
      position: "relative",
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
      gap: 6,
    },
    modeSwitcher: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    modeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 7,
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
    modeBtnBugHuntActive: {
      backgroundColor: StudioColors.coral,
      borderColor: StudioColors.ink,
    },
    modeBtnBlitzActive: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
    },
    modeBtnAlgoLabActive: {
      backgroundColor: StudioColors.violet,
      borderColor: StudioColors.ink,
    },
    modeBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    modeBtnTextActive: { color: StudioColors.ink },
    modeBtnBugHuntTextActive: {
      color: StudioColors.ink,
      fontWeight: "900",
    },
    modeBtnBlitzTextActive: {
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
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    themeToggleBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
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
      gap: 1,
    },
    headerBtnMicroLabel: {
      color: "rgba(17, 17, 17, 0.72)",
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    headerBtnMicroLabelMuted: {
      color: StudioColors.textMuted,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    rankPill: {
      backgroundColor: StudioColors.violet,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      ...HardShadowSm,
    },
    rankLevelBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 5,
    },
    rankLevelBadgeText: {
      color: StudioColors.violet,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    rankPillText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    statPill: {
      backgroundColor: StudioColors.yellow,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      justifyContent: "center",
      ...HardShadowSm,
    },
    statText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    proBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.lime,
      justifyContent: "center",
    },
    proBadgeText: {
      color: StudioColors.lime,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    achievementsTabBtn: {
      backgroundColor: StudioColors.surface,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: StudioColors.border,
      justifyContent: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
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
    achievementsTabBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    achievementsTabBtnTextActive: {
      color: StudioColors.ink,
    },
    upgradeHeaderBtn: {
      backgroundColor: StudioColors.pink,
      paddingLeft: 10,
      paddingRight: 7,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      ...HardShadow,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    upgradeHeaderBtnText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    headerCtaKeycap: {
      flexDirection: "row",
      gap: 4,
      backgroundColor: StudioColors.ink,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    headerCtaKeycapPinkText: {
      color: StudioColors.pink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    headerCtaKeycapLimeText: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    userSection: { flexDirection: "row", alignItems: "center", gap: 8 },
    authBtn: {
      backgroundColor: StudioColors.surfaceElevated,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: StudioColors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    loginBtn: {
      backgroundColor: StudioColors.lime,
      paddingLeft: 10,
      paddingRight: 7,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      ...HardShadow,
    },
    authBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    loginBtnText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
  });
