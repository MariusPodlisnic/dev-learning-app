import { Session } from "@supabase/supabase-js";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  ThemeMode,
} from "../constants/theme";
import { ViewMode } from "../types/lesson";
import {
  isSoundEnabled,
  playKeyClick,
  setSoundEnabled,
} from "../utils/soundEffects";

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
  const styles = getStyles();
  const [sfxOn, setSfxOn] = useState<boolean>(() => isSoundEnabled());

  function handleSwitchMode(mode: ViewMode) {
    playKeyClick();
    onChangeViewMode(mode);
  }

  function handleToggleSfx() {
    const next = !sfxOn;
    setSfxOn(next);
    setSoundEnabled(next);
  }

  return (
    <View style={[styles.header, isCompactHeader && styles.headerCompact]}>
      <View style={styles.headerLeft}>
        <Pressable
          style={styles.brandGroup}
          onPress={() => handleSwitchMode("roadmap")}
        >
          <View style={styles.brandIconBox}>
            <Text style={styles.brandIconText}>DEVLEARN</Text>
          </View>
        </Pressable>

        {/* Primary Navigation Mode Switcher */}
        <View style={styles.modeSwitcher}>
          <Pressable
            style={[
              styles.modeBtn,
              viewMode === "roadmap" && styles.modeBtnActive,
            ]}
            onPress={() => handleSwitchMode("roadmap")}
          >
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
            style={[
              styles.modeBtn,
              viewMode === "studio" && styles.modeBtnActive,
            ]}
            onPress={() => handleSwitchMode("studio")}
          >
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
            style={[
              styles.modeBtn,
              viewMode === "bughunt" && styles.modeBtnBugHuntActive,
            ]}
            onPress={() => handleSwitchMode("bughunt")}
          >
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
            style={[
              styles.modeBtn,
              viewMode === "blitz" && styles.modeBtnBlitzActive,
            ]}
            onPress={() => handleSwitchMode("blitz")}
          >
            <Text
              style={[
                styles.modeBtnText,
                viewMode === "blitz" && styles.modeBtnBlitzTextActive,
              ]}
            >
              ⚡ SPEED BLITZ
            </Text>
          </Pressable>
        </View>

        {!isCompactHeader && (
          <View style={styles.statusPill}>
            <View
              style={[
                styles.pulseDot,
                pyodideReady
                  ? { backgroundColor: "#10B981" }
                  : { backgroundColor: "#F59E0B" },
              ]}
            />
            <Text style={styles.statusText}>
              {pyodideReady ? "PY 3.11 READY" : "LOADING PY..."}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.headerRight}>
        <Pressable
          style={({ pressed }) => [
            styles.themeToggleBtn,
            pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
          ]}
          onPress={handleToggleSfx}
        >
          <Text style={styles.themeToggleBtnText}>
            {sfxOn ? "🔊 SFX" : "🔇 MUTE"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.themeToggleBtn,
            pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
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

        <Pressable
          style={({ pressed }) => [
            styles.gamificationHeader,
            pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
          ]}
          onPress={onOpenProfile}
        >
          {/* 1. Profile & Developer Rank Button */}
          <View style={styles.rankPill}>
            <View style={styles.rankLevelBadge}>
              <Text style={styles.rankLevelBadgeText}>
                LVL 0{devRank.level}
              </Text>
            </View>
            <View style={styles.headerBtnTextStack}>
              {!isCompactHeader && (
                <Text style={styles.headerBtnMicroLabel}>
                  MY PROFILE & STATS ↗
                </Text>
              )}
              <Text style={styles.rankPillText}>
                {isCompactHeader ? "PROFILE ↗" : devRank.title.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* 2. Daily Streak Telemetry Button */}
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
              <Text style={styles.proBadgeText}>★ PRO MEMBER</Text>
            </View>
          )}
        </Pressable>

        {!isCompactHeader && <View style={styles.headerActionDivider} />}

        {/* 3. Unlock Pro Primary CTA Button */}
        {!isPremium && (
          <Pressable
            style={({ pressed }) => [
              styles.upgradeHeaderBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={onOpenPaywall}
          >
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
              <Text style={styles.headerCtaKeycapPinkText}>★ PRO →</Text>
            </View>
          </Pressable>
        )}

        {/* 4. Cloud Sync / Save Progress Primary CTA Button */}
        {session ? (
          <View style={styles.userSection}>
            <Pressable
              style={({ pressed }) => [
                styles.authBtn,
                pressed && {
                  transform: [{ translateX: 1 }, { translateY: 1 }],
                },
              ]}
              onPress={onSignOut}
            >
              <View style={styles.headerBtnTextStack}>
                {!isCompactHeader && (
                  <Text style={styles.headerBtnMicroLabelMuted}>
                    CLOUD SYNCED ✓
                  </Text>
                )}
                <Text style={styles.authBtnText}>SIGN OUT</Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.authBtn,
              styles.loginBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={onOpenAuth}
          >
            <View style={styles.headerBtnTextStack}>
              {!isCompactHeader && (
                <Text style={styles.headerBtnMicroLabel}>
                  FREE CLOUD BACKUP
                </Text>
              )}
              <Text style={styles.loginBtnText}>
                {isCompactHeader ? "SAVE PROGRESS" : "SAVE MY PROGRESS"}
              </Text>
            </View>
            <View style={styles.headerCtaKeycap}>
              <Text style={styles.headerCtaKeycapLimeText}>SIGN IN →</Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const getStyles = () =>
  StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 101,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  brandIconBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: StudioColors.ink,
    borderWidth: 1.5,
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
    letterSpacing: 1,
  },
  modeSwitcher: {
    flexDirection: "row",
    gap: 6,
  },
  modeBtn: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 6,
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
  modeBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
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
  statusPill: {
    backgroundColor: StudioColors.bg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
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
    letterSpacing: 0.5,
  },
  themeToggleBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
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
    gap: 8,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  headerBtnTextStack: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 1,
  },
  headerBtnMicroLabel: {
    color: "rgba(17, 17, 17, 0.72)",
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  headerBtnMicroLabelMuted: {
    color: StudioColors.textMuted,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  rankPill: {
    backgroundColor: StudioColors.violet,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...HardShadowSm,
  },
  rankLevelBadge: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  rankLevelBadgeText: {
    color: StudioColors.violet,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  rankPillText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  statPill: {
    backgroundColor: StudioColors.yellow,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    justifyContent: "center",
    ...HardShadowSm,
  },
  statText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  proBadge: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    letterSpacing: 0.5,
  },
  headerActionDivider: {
    width: 2,
    height: 28,
    backgroundColor: StudioColors.border,
    marginHorizontal: 2,
    borderRadius: 1,
  },
  upgradeHeaderBtn: {
    backgroundColor: StudioColors.pink,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    ...HardShadow,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  upgradeHeaderBtnText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  headerCtaKeycap: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCtaKeycapPinkText: {
    color: StudioColors.pink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  headerCtaKeycapLimeText: {
    color: StudioColors.lime,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  userSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  authBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: StudioColors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  loginBtn: {
    backgroundColor: StudioColors.lime,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    ...HardShadow,
  },
  authBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.4,
  },
  loginBtnText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
});
