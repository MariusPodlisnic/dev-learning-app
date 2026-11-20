import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  getStudioPaletteMeta,
  HardShadow,
  HardShadowSm,
  isStudioPaletteUnlocked,
  MonoFont,
  STUDIO_PALETTES,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  getLofiChannelMeta,
  getLofiRadioState,
  LOFI_CHANNELS,
  type LofiRadioState,
  selectAndPlayLofiChannel,
  subscribeLofiRadio,
  toggleLofiRadio,
} from "../utils/lofiRadio";
import { getPythonRuntimeStatus } from "../utils/pyodideRunner";
import {
  isHapticsEnabled,
  isNativeMobilePlatform,
  isSoundEnabled,
  playCrtChannelSwitch,
  playKeyClick,
  playSuccessChime,
  setHapticsEnabled,
  setSoundEnabled,
  subscribeSoundPreferences,
} from "../utils/soundEffects";
import {
  getTypingSoundProfile,
  getTypingSoundProfileMeta,
  setTypingSoundProfile,
  subscribeTypingSound,
  TYPING_SOUND_PROFILES,
  type TypingSoundProfile,
} from "../utils/typingSounds";
import {
  getOnboardingState,
  updateDisplayName,
} from "../utils/userOnboarding";
import { StudioIcon, Text } from "./StudioIcon";

export type SettingsTabId = "appearance" | "audio" | "studio";

interface StudioSettingsModalProps {
  level: number;
  isPremium: boolean;
  pyodideReady?: boolean;
  initialTab?: SettingsTabId;
  onOpenPaywall?: () => void;
  onClose: () => void;
}

const SETTINGS_TABS: readonly {
  id: SettingsTabId;
  label: string;
  accent: string;
}[] = [
  { id: "appearance", label: "🎨 APPEARANCE", accent: "#FFDE59" },
  { id: "audio", label: "🎧 AUDIO", accent: "#6EE7B7" },
  { id: "studio", label: "⚙️ STUDIO", accent: "#C4B5FD" },
] as const;

export default function StudioSettingsModal({
  level,
  isPremium,
  pyodideReady = true,
  initialTab = "appearance",
  onOpenPaywall,
  onClose,
}: StudioSettingsModalProps) {
  const { themeMode, setThemeMode, paletteId, setPaletteId } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const [sfxOn, setSfxOn] = useState<boolean>(() => isSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState<boolean>(() => isHapticsEnabled());
  const [typingProfile, setTypingProfile] = useState<TypingSoundProfile>(() =>
    getTypingSoundProfile(),
  );
  const [lofiState, setLofiState] = useState<LofiRadioState>(() =>
    getLofiRadioState(),
  );
  const [nameDraft, setNameDraft] = useState<string>(
    () => getOnboardingState().displayName,
  );
  const [nameSaved, setNameSaved] = useState<boolean>(false);
  const showHapticsToggle = isNativeMobilePlatform();

  useEffect(() => {
    const unsubLofi = subscribeLofiRadio(setLofiState);
    const unsubTyping = subscribeTypingSound(setTypingProfile);
    const unsubSound = subscribeSoundPreferences(() => {
      setSfxOn(isSoundEnabled());
      setHapticsOn(isHapticsEnabled());
    });
    return () => {
      unsubLofi();
      unsubTyping();
      unsubSound();
    };
  }, []);

  const activePalette = getStudioPaletteMeta(paletteId);
  const activeLofiMeta = getLofiChannelMeta(lofiState.channel);
  const activeTypingMeta = getTypingSoundProfileMeta(typingProfile);
  const runtimeStatus = getPythonRuntimeStatus(pyodideReady);
  const hasLockedPalettes = STUDIO_PALETTES.some(
    (pal) => !isStudioPaletteUnlocked(pal.id, level, isPremium),
  );

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.topAccentBar,
          { backgroundColor: activePalette.accent },
        ]}
      />

      {/* Modal Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.headerIconBadge,
              { backgroundColor: activePalette.accent },
            ]}
          >
            <StudioIcon name="menu_settings" size={22} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.title}>STUDIO SETTINGS</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {activePalette.name} · {themeMode === "dark" ? "Dark" : "Light"} ·{" "}
              {sfxOn ? "Audio ON" : "Muted"}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close settings modal"
          style={styles.closeIconBtn}
          onPress={() => {
            playKeyClick();
            onClose();
          }}
        >
          <Text style={styles.closeIconText}>✕</Text>
        </Pressable>
      </View>

      {/* Organized 3-Tab Category Bar */}
      <View style={styles.tabsRow} accessibilityRole="tablist">
        {SETTINGS_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={`Settings tab: ${tab.label}`}
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.tabBtn,
                isSelected && [
                  styles.tabBtnActive,
                  { backgroundColor: tab.accent },
                ],
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                setActiveTab(tab.id);
              }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  isSelected && styles.tabBtnTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Active Tab Content */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "appearance" ? (
          <View style={styles.tabSection}>
            {/* 1. Display Mode */}
            <Text style={styles.sectionHeading}>DISPLAY MODE</Text>
            <View style={styles.modeToggleRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Switch to Dark Mode"
                style={({ pressed }) => [
                  styles.modeChoiceBtn,
                  themeMode === "dark" && styles.modeChoiceBtnActive,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  setThemeMode("dark");
                }}
              >
                <StudioIcon name="moon" size={16} />
                <Text
                  style={[
                    styles.modeChoiceText,
                    themeMode === "dark" && styles.modeChoiceTextActive,
                  ]}
                >
                  DARK MODE
                </Text>
                {themeMode === "dark" ? (
                  <Text style={styles.modeChoiceCheck}>✓</Text>
                ) : null}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Switch to Light Mode"
                style={({ pressed }) => [
                  styles.modeChoiceBtn,
                  themeMode === "light" && styles.modeChoiceBtnActive,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  setThemeMode("light");
                }}
              >
                <StudioIcon name="sun" size={16} />
                <Text
                  style={[
                    styles.modeChoiceText,
                    themeMode === "light" && styles.modeChoiceTextActive,
                  ]}
                >
                  LIGHT MODE
                </Text>
                {themeMode === "light" ? (
                  <Text style={styles.modeChoiceCheck}>✓</Text>
                ) : null}
              </Pressable>
            </View>

            {/* 2. Studio Theme Palettes */}
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeading}>STUDIO THEME PALETTE</Text>
              <Text style={styles.sectionMeta}>
                {isPremium ? "ALL UNLOCKED ★" : `LVL ${level}`}
              </Text>
            </View>
            <View style={styles.paletteGrid}>
              {STUDIO_PALETTES.map((pal) => {
                const unlocked = isStudioPaletteUnlocked(
                  pal.id,
                  level,
                  isPremium,
                );
                const isSelected = paletteId === pal.id;
                return (
                  <Pressable
                    key={pal.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${pal.name} theme${unlocked ? "" : ` (unlocks at level ${pal.minLevel})`}`}
                    disabled={!unlocked}
                    onPress={() => {
                      if (!unlocked) return;
                      playKeyClick();
                      setPaletteId(pal.id);
                    }}
                    style={({ pressed }) => [
                      styles.paletteCard,
                      isSelected && [
                        styles.paletteCardActive,
                        { borderColor: pal.accent },
                      ],
                      !unlocked && styles.paletteCardLocked,
                      pressed && unlocked && { transform: [{ translateY: 1 }] },
                    ]}
                  >
                    <View style={styles.paletteTopRow}>
                      <View style={styles.paletteSwatchesRow}>
                        {pal.swatches.map((hex, sIdx) => (
                          <View
                            key={sIdx}
                            style={[
                              styles.paletteSwatchDot,
                              { backgroundColor: hex },
                            ]}
                          />
                        ))}
                      </View>
                      {isSelected ? (
                        <View
                          style={[
                            styles.paletteStatusPill,
                            { backgroundColor: pal.accent },
                          ]}
                        >
                          <Text style={styles.paletteStatusPillText}>
                            ✓ ACTIVE
                          </Text>
                        </View>
                      ) : !unlocked ? (
                        <View style={styles.paletteLockPill}>
                          <Text style={styles.paletteLockPillText}>
                            🔒 LVL {pal.minLevel}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.paletteName} numberOfLines={1}>
                      {pal.name}
                    </Text>
                    <Text style={styles.paletteSubtitle} numberOfLines={1}>
                      {pal.subtitle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {hasLockedPalettes && onOpenPaywall ? (
              <Pressable
                style={({ pressed }) => [
                  styles.unlockThemesHint,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  onClose();
                  onOpenPaywall();
                }}
              >
                <Text style={styles.unlockThemesHintText}>
                  Level up by solving lessons — or unlock all 4 cozy themes now
                  with Pro →
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : activeTab === "audio" ? (
          <View style={styles.tabSection}>
            {/* 1. Lo-Fi Focus Radio */}
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeading}>LO-FI FOCUS RADIO</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  lofiState.isPlaying
                    ? `Pause ${activeLofiMeta.label}`
                    : `Play ${activeLofiMeta.label}`
                }
                style={({ pressed }) => [
                  styles.lofiPlayPill,
                  lofiState.isPlaying && {
                    backgroundColor: activeLofiMeta.accentColor,
                  },
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  const playing = toggleLofiRadio();
                  if (!playing) {
                    playKeyClick();
                  }
                }}
              >
                <Text
                  style={[
                    styles.lofiPlayPillText,
                    lofiState.isPlaying && { color: StudioColors.ink },
                  ]}
                >
                  {lofiState.isPlaying ? "❚❚ PAUSE RADIO" : "▶ PLAY RADIO"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.lofiChannelsRow}>
              {LOFI_CHANNELS.map((ch) => {
                const active = lofiState.channel === ch.id;
                return (
                  <Pressable
                    key={ch.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Switch lo-fi radio to ${ch.label}`}
                    style={({ pressed }) => [
                      styles.lofiChannelBtn,
                      active && [
                        styles.lofiChannelBtnActive,
                        { borderColor: ch.accentColor },
                      ],
                      pressed && { transform: [{ translateY: 1 }] },
                    ]}
                    onPress={() => {
                      playCrtChannelSwitch();
                      selectAndPlayLofiChannel(ch.id);
                    }}
                  >
                    <Text style={styles.lofiChannelChip}>{ch.chipLabel}</Text>
                    <Text style={styles.lofiChannelSub} numberOfLines={1}>
                      {ch.subtitle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 2. Mechanical Keycap Typing */}
            <Text style={styles.sectionHeading}>MECHANICAL KEYCAP TYPING</Text>
            <View style={styles.typingProfileCard}>
              <View style={styles.settingRowLeft}>
                <StudioIcon name="keyboard" size={18} />
                <View style={styles.settingRowText}>
                  <Text style={styles.settingRowTitle}>
                    Editor Typing Acoustics
                  </Text>
                  <Text style={styles.settingRowDesc}>
                    Tap a profile to preview keycap sounds in Code Studio &amp;
                    Bug Hunt
                  </Text>
                </View>
              </View>
              <View style={styles.typingProfilesRow}>
                {TYPING_SOUND_PROFILES.map((prof) => {
                  const active = typingProfile === prof.id;
                  return (
                    <Pressable
                      key={prof.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Set typing sound to ${prof.label}`}
                      style={({ pressed }) => [
                        styles.typingProfileBtn,
                        active && styles.typingProfileBtnActive,
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                      onPress={() => {
                        setTypingSoundProfile(prof.id, { playPreview: true });
                      }}
                    >
                      <Text
                        style={[
                          styles.typingProfileBtnText,
                          active && styles.typingProfileBtnTextActive,
                        ]}
                      >
                        {prof.chipLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Master Sound & Haptics */}
            <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
              SOUND &amp; HAPTICS
            </Text>
            <View style={styles.toggleList}>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: sfxOn }}
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  setSoundEnabled(!sfxOn);
                }}
              >
                <View style={styles.settingRowLeft}>
                  <StudioIcon
                    name={sfxOn ? "sound_on" : "sound_off"}
                    size={18}
                  />
                  <View style={styles.settingRowText}>
                    <Text style={styles.settingRowTitle}>
                      Master Sound Effects
                    </Text>
                    <Text style={styles.settingRowDesc}>
                      Chimes on key clicks, wins, streaks &amp; Lo-Fi radio
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.switchBadge,
                    sfxOn ? styles.switchBadgeOn : styles.switchBadgeOff,
                  ]}
                >
                  <Text
                    style={[
                      styles.switchBadgeText,
                      sfxOn
                        ? styles.switchBadgeTextOn
                        : styles.switchBadgeTextOff,
                    ]}
                  >
                    {sfxOn ? "ON" : "MUTED"}
                  </Text>
                </View>
              </Pressable>

              {showHapticsToggle ? (
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: hapticsOn }}
                  style={({ pressed }) => [
                    styles.settingRow,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => {
                    setHapticsEnabled(!hapticsOn);
                  }}
                >
                  <View style={styles.settingRowLeft}>
                    <StudioIcon name="bolt" size={18} />
                    <View style={styles.settingRowText}>
                      <Text style={styles.settingRowTitle}>
                        Haptic Feedback
                      </Text>
                      <Text style={styles.settingRowDesc}>
                        Tactile taps when solving challenges on mobile
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.switchBadge,
                      hapticsOn ? styles.switchBadgeOn : styles.switchBadgeOff,
                    ]}
                  >
                    <Text
                      style={[
                        styles.switchBadgeText,
                        hapticsOn
                          ? styles.switchBadgeTextOn
                          : styles.switchBadgeTextOff,
                      ]}
                    >
                      {hapticsOn ? "ON" : "OFF"}
                    </Text>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.tabSection}>
            {/* 1. Byte-Cat & Leaderboard Display Name */}
            <Text style={styles.sectionHeading}>DEVELOPER DISPLAY NAME</Text>
            <View style={styles.studioInfoCard}>
              <Text style={styles.settingRowDesc}>
                Used by Byte-Cat greetings, PNG share cards, and the opt-in
                Weekly League leaderboard.
              </Text>
              <View style={styles.nameEditRow}>
                <TextInput
                  accessibilityLabel="Display name for Byte-Cat"
                  style={styles.nameEditInput}
                  value={nameDraft}
                  onChangeText={(txt) => {
                    setNameDraft(txt);
                    if (nameSaved) setNameSaved(false);
                  }}
                  placeholder="Your name or handle"
                  placeholderTextColor={StudioColors.textDim}
                  maxLength={24}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save display name"
                  style={({ pressed }) => [
                    styles.nameSaveBtn,
                    nameSaved && styles.nameSaveBtnDone,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => {
                    const saved = updateDisplayName(nameDraft);
                    setNameDraft(saved.displayName);
                    setNameSaved(true);
                    playSuccessChime();
                  }}
                >
                  <Text style={styles.nameSaveBtnText}>
                    {nameSaved ? "✓ SAVED" : "SAVE"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 2. Python Runtime Engine Status */}
            <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
              PYTHON ENGINE RUNTIME
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View
                  style={[
                    styles.engineStatusDot,
                    runtimeStatus.available
                      ? { backgroundColor: "#10B981" }
                      : runtimeStatus.mode === "web_only_notice"
                        ? { backgroundColor: "#6366F1" }
                        : { backgroundColor: "#F59E0B" },
                  ]}
                />
                <View style={styles.settingRowText}>
                  <Text style={styles.settingRowTitle}>
                    {runtimeStatus.badgeLabel}
                  </Text>
                  <Text style={styles.settingRowDesc}>
                    {runtimeStatus.available
                      ? "In-browser Python 3.11 + live sys.settrace debugger active"
                      : "Initializing local Python WebAssembly kernel..."}
                  </Text>
                </View>
              </View>
            </View>

            {/* 3. Active Setup Snapshot */}
            <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
              ACTIVE STUDIO SETUP
            </Text>
            <View style={styles.snapshotRow}>
              <View style={styles.snapshotBox}>
                <Text style={styles.snapshotLabel}>PALETTE</Text>
                <Text style={styles.snapshotVal} numberOfLines={1}>
                  {activePalette.name}
                </Text>
              </View>
              <View style={styles.snapshotBox}>
                <Text style={styles.snapshotLabel}>TYPING SFX</Text>
                <Text style={styles.snapshotVal} numberOfLines={1}>
                  {activeTypingMeta.shortLabel}
                </Text>
              </View>
              <View style={styles.snapshotBox}>
                <Text style={styles.snapshotLabel}>LO-FI DECK</Text>
                <Text style={styles.snapshotVal} numberOfLines={1}>
                  {lofiState.isPlaying ? activeLofiMeta.shortLabel : "STANDBY"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.doneBtn,
          pressed && { transform: [{ translateY: 1 }] },
        ]}
        onPress={() => {
          playKeyClick();
          onClose();
        }}
      >
        <Text style={styles.doneBtnText}>DONE</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    card: {
      width: "92%",
      maxWidth: 540,
      maxHeight: "90%",
      backgroundColor: StudioColors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: StudioColors.border,
      overflow: "hidden",
      ...HardShadow,
    },
    topAccentBar: {
      height: 7,
      backgroundColor: StudioColors.mint,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.border,
      backgroundColor: StudioColors.surfaceElevated,
      gap: 12,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    headerIconBadge: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    headerTextCol: {
      flex: 1,
      gap: 2,
    },
    title: {
      color: StudioColors.textPrimary,
      fontSize: 16,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    subtitle: {
      color: StudioColors.textMuted,
      fontSize: 11.5,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    closeIconBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    closeIconText: {
      color: StudioColors.textPrimary,
      fontSize: 14,
      fontWeight: "900",
    },
    tabsRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 10,
      backgroundColor: StudioColors.surface,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.borderSubtle,
    },
    tabBtn: {
      flex: 1,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingVertical: 8,
      paddingHorizontal: 6,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    tabBtnActive: {
      borderColor: StudioColors.ink,
      borderWidth: 2,
    },
    tabBtnText: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.45,
    },
    tabBtnTextActive: {
      color: StudioColors.ink,
    },
    scrollBody: {
      flexGrow: 0,
    },
    scrollContent: {
      padding: 18,
    },
    tabSection: {
      gap: 4,
    },
    sectionHeadingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
      gap: 8,
    },
    sectionHeading: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.3,
      fontFamily: MonoFont,
      marginBottom: 8,
    },
    sectionMeta: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      marginBottom: 8,
    },
    modeToggleRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    modeChoiceBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    modeChoiceBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
      borderWidth: 2,
    },
    modeChoiceText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    modeChoiceTextActive: {
      color: StudioColors.ink,
    },
    modeChoiceCheck: {
      color: StudioColors.ink,
      fontSize: 12,
      fontWeight: "900",
    },
    paletteGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },
    paletteCard: {
      flex: 1,
      minWidth: 190,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 10,
      padding: 10,
      gap: 4,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    paletteCardActive: {
      borderWidth: 2,
      backgroundColor: StudioColors.surfaceElevated,
    },
    paletteCardLocked: {
      opacity: 0.68,
      ...Platform.select({ web: { cursor: "not-allowed", userSelect: "none" } }),
    },
    paletteTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
      marginBottom: 2,
    },
    paletteSwatchesRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    paletteSwatchDot: {
      width: 14,
      height: 14,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    paletteStatusPill: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1.5,
    },
    paletteStatusPillText: {
      color: StudioColors.ink,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    paletteLockPill: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1.5,
    },
    paletteLockPillText: {
      color: StudioColors.textMuted,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    paletteName: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "900",
    },
    paletteSubtitle: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "600",
    },
    unlockThemesHint: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 10,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    unlockThemesHintText: {
      color: StudioColors.textSecondary,
      fontSize: 11,
      fontWeight: "700",
    },
    lofiPlayPill: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 9,
      paddingVertical: 4,
      marginBottom: 8,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    lofiPlayPillText: {
      color: StudioColors.textPrimary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    lofiChannelsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    lofiChannelBtn: {
      flex: 1,
      minWidth: 130,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingVertical: 8,
      paddingHorizontal: 10,
      gap: 2,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    lofiChannelBtnActive: {
      borderWidth: 2,
      backgroundColor: StudioColors.surfaceElevated,
    },
    lofiChannelChip: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    lofiChannelSub: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    toggleList: {
      gap: 8,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    settingRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    settingRowText: {
      flex: 1,
      gap: 1,
    },
    settingRowTitle: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "900",
    },
    settingRowDesc: {
      color: StudioColors.textMuted,
      fontSize: 11,
      fontWeight: "600",
    },
    switchBadge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
    },
    switchBadgeOn: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
    },
    switchBadgeOff: {
      backgroundColor: StudioColors.surfaceElevated,
      borderColor: StudioColors.border,
    },
    switchBadgeText: {
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    switchBadgeTextOn: {
      color: StudioColors.ink,
    },
    switchBadgeTextOff: {
      color: StudioColors.textMuted,
    },
    typingProfileCard: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 10,
      padding: 12,
      gap: 10,
      ...HardShadowSm,
    },
    typingProfilesRow: {
      flexDirection: "row",
      gap: 6,
    },
    typingProfileBtn: {
      flex: 1,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 8,
      paddingVertical: 7,
      paddingHorizontal: 6,
      alignItems: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    typingProfileBtnActive: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
      borderWidth: 2,
    },
    typingProfileBtnText: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    typingProfileBtnTextActive: {
      color: StudioColors.ink,
    },
    studioInfoCard: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 10,
      padding: 12,
      gap: 10,
      ...HardShadowSm,
    },
    nameEditRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    nameEditInput: {
      flex: 1,
      backgroundColor: StudioColors.surface,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingHorizontal: 11,
      paddingVertical: 9,
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      ...Platform.select({ web: { outlineStyle: "none" } as any }),
    },
    nameSaveBtn: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 9,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    nameSaveBtnDone: {
      backgroundColor: StudioColors.mint,
    },
    nameSaveBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    engineStatusDot: {
      width: 11,
      height: 11,
      borderRadius: 99,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    snapshotRow: {
      flexDirection: "row",
      gap: 8,
    },
    snapshotBox: {
      flex: 1,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 9,
      padding: 10,
      gap: 3,
      ...HardShadowSm,
    },
    snapshotLabel: {
      color: StudioColors.textMuted,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    snapshotVal: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    doneBtn: {
      marginHorizontal: 18,
      marginBottom: 16,
      marginTop: 4,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 2,
      borderColor: StudioColors.border,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    doneBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
  });
