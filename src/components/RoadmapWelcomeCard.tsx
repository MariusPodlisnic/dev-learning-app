import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import {
  completeOnboarding,
  isValidGoalTrack,
  ONBOARDING_GOAL_OPTIONS,
  type OnboardingGoalTrack,
  sanitizeDisplayName,
  skipOnboarding,
} from "../utils/userOnboarding";
import { StudioIcon, Text } from "./StudioIcon";

interface RoadmapWelcomeCardProps {
  initialGoalTrack?: string;
  onCompleteWelcome: (payload: {
    displayName: string;
    goalTrack: OnboardingGoalTrack;
  }) => void;
  onSkipWelcome?: () => void;
}

export default function RoadmapWelcomeCard({
  initialGoalTrack = "python_basics",
  onCompleteWelcome,
  onSkipWelcome,
}: RoadmapWelcomeCardProps) {
  const styles = useThemedStyles(createStyles);
  const [nameInput, setNameInput] = useState<string>("");
  const [selectedGoal, setSelectedGoal] = useState<OnboardingGoalTrack>(
    isValidGoalTrack(initialGoalTrack) ? initialGoalTrack : "python_basics",
  );

  const activeOption =
    ONBOARDING_GOAL_OPTIONS.find((opt) => opt.id === selectedGoal) ||
    ONBOARDING_GOAL_OPTIONS[0];
  const previewName = sanitizeDisplayName(nameInput);

  function handleStartQuest() {
    playSuccessChime();
    const saved = completeOnboarding({
      displayName: nameInput,
      goalTrack: selectedGoal,
    });
    onCompleteWelcome({
      displayName: saved.displayName,
      goalTrack: saved.goalTrack,
    });
  }

  function handleSkip() {
    playKeyClick();
    skipOnboarding();
    onSkipWelcome?.();
  }

  return (
    <View style={styles.card}>
      <View style={styles.topAccentStrip} />

      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.kickerPill}>
              <StudioIcon name="crt_ch_bytecat" size={15} />
              <Text style={styles.kickerText}>5-SECOND SETUP</Text>
            </View>
            <Text style={styles.title}>
              {previewName
                ? `Welcome, ${previewName}! Pick your coding goal`
                : "Personalize Byte-Cat & pick your goal"}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip welcome setup"
            style={({ pressed }) => [
              styles.skipBtn,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={handleSkip}
          >
            <Text style={styles.skipBtnText}>SKIP</Text>
          </Pressable>
        </View>

        {/* Step 1: Optional display name */}
        <View style={styles.nameRow}>
          <Text style={styles.fieldLabel}>WHAT SHOULD BYTE-CAT CALL YOU?</Text>
          <TextInput
            accessibilityLabel="Your name or developer handle"
            style={styles.nameInput}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Your name or handle (optional)"
            placeholderTextColor={StudioColors.textDim}
            maxLength={24}
            returnKeyType="done"
          />
        </View>

        {/* Step 2: 3 visual goal tiles */}
        <Text style={styles.fieldLabel}>PICK YOUR STARTING QUEST</Text>
        <View style={styles.goalsRow}>
          {ONBOARDING_GOAL_OPTIONS.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            return (
              <Pressable
                key={goal.id}
                accessibilityRole="button"
                accessibilityLabel={`Choose ${goal.title} goal`}
                style={({ pressed }) => [
                  styles.goalCard,
                  isSelected && [
                    styles.goalCardSelected,
                    { borderColor: goal.accent },
                  ],
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  setSelectedGoal(goal.id);
                }}
              >
                <View style={styles.goalTopRow}>
                  <View
                    style={[
                      styles.goalIconWrap,
                      { backgroundColor: goal.accent },
                    ]}
                  >
                    <StudioIcon name={goal.icon} size={18} />
                  </View>
                  <View style={styles.goalBadge}>
                    <Text style={styles.goalBadgeText}>{goal.badge}</Text>
                  </View>
                </View>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Footer CTA */}
        <View style={styles.footerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Personalize and start ${activeOption.title}`}
            style={({ pressed }) => [
              styles.startBtn,
              { backgroundColor: activeOption.accent },
              pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
            ]}
            onPress={handleStartQuest}
          >
            <Text style={styles.startBtnText}>
              {`✨ START ${activeOption.title.toUpperCase()} →`}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.browseBtn,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
            onPress={handleSkip}
          >
            <Text style={styles.browseBtnText}>Just browsing</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 14,
      marginBottom: 14,
      overflow: "hidden",
      ...HardShadow,
    },
    topAccentStrip: {
      height: 5,
      backgroundColor: StudioColors.lime,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.border,
    },
    inner: {
      padding: 16,
      gap: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    headerLeft: {
      flex: 1,
      gap: 6,
    },
    kickerPill: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    kickerText: {
      color: StudioColors.textPrimary,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
    },
    title: {
      color: StudioColors.textPrimary,
      fontSize: 16,
      fontWeight: "900",
      letterSpacing: -0.2,
    },
    skipBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    skipBtnText: {
      color: StudioColors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    nameRow: {
      gap: 6,
    },
    fieldLabel: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    nameInput: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 9,
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
      ...Platform.select({ web: { outlineStyle: "none" } as any }),
    },
    goalsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    goalCard: {
      flex: 1,
      minWidth: 175,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 10,
      padding: 11,
      gap: 5,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    goalCardSelected: {
      borderWidth: 2,
      backgroundColor: StudioColors.surfaceElevated,
    },
    goalTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
      marginBottom: 2,
    },
    goalIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
    },
    goalBadge: {
      backgroundColor: StudioColors.surface,
      borderWidth: 1,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    goalBadgeText: {
      color: StudioColors.textMuted,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    goalTitle: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "900",
    },
    goalSubtitle: {
      color: StudioColors.textSecondary,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "600",
    },
    footerRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 2,
    },
    startBtn: {
      flexGrow: 1,
      minWidth: 210,
      paddingVertical: 11,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    startBtnText: {
      color: StudioColors.ink,
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    browseBtn: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    browseBtnText: {
      color: StudioColors.textMuted,
      fontSize: 11,
      fontWeight: "800",
      textDecorationLine: "underline",
    },
  });
