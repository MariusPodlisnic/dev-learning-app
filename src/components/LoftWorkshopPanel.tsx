import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  countUnlockedLoftWorkshopItems,
  isLoftWorkshopItemUnlocked,
  LOFT_COMPANIONS,
  LOFT_KEYCAP_SETS,
  LOFT_MUG_STYLES,
  LOFT_WINDOW_WORLDS,
  type LoftCustomizationState,
  type LoftWorkshopSlot,
} from "../utils/loftCustomization";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import { Text } from "./StudioIcon";

interface LoftWorkshopPanelProps {
  customization: LoftCustomizationState;
  totalXp: number;
  devUnlockAll?: boolean;
  onSelectPatch: (patch: Partial<LoftCustomizationState>, label: string) => void;
  onClose: () => void;
}

const SLOT_TABS: readonly {
  id: LoftWorkshopSlot;
  label: string;
  badge: string;
}[] = [
  { id: "companion", label: "COMPANION", badge: "PET" },
  { id: "windowWorld", label: "WINDOW", badge: "VIEW" },
  { id: "keycaps", label: "KEYCAPS", badge: "DECK" },
  { id: "mugStyle", label: "MUG", badge: "BREW" },
] as const;

export default function LoftWorkshopPanel({
  customization,
  totalXp,
  devUnlockAll = false,
  onSelectPatch,
  onClose,
}: LoftWorkshopPanelProps) {
  const styles = useThemedStyles(createStyles);
  const [activeSlot, setActiveSlot] = useState<LoftWorkshopSlot>("companion");
  const counts = countUnlockedLoftWorkshopItems(totalXp, devUnlockAll);

  const items =
    activeSlot === "companion"
      ? LOFT_COMPANIONS.map((c) => ({
          id: c.id,
          label: c.label,
          description: c.description,
          unlockXp: c.unlockXp,
          swatchA: c.coatColor,
          swatchB: c.accentColor,
          swatchC: c.earInnerColor,
          equipped: customization.companion === c.id,
          patch: { companion: c.id } as Partial<LoftCustomizationState>,
        }))
      : activeSlot === "windowWorld"
        ? LOFT_WINDOW_WORLDS.map((w) => ({
            id: w.id,
            label: w.label,
            description: w.description,
            unlockXp: w.unlockXp,
            swatchA: w.swatchPrimary,
            swatchB: w.swatchSecondary,
            swatchC: "#FFDE59",
            equipped: customization.windowWorld === w.id,
            patch: { windowWorld: w.id } as Partial<LoftCustomizationState>,
          }))
        : activeSlot === "keycaps"
          ? LOFT_KEYCAP_SETS.map((k) => ({
              id: k.id,
              label: k.label,
              description: k.description,
              unlockXp: k.unlockXp,
              swatchA: k.caseTop,
              swatchB: k.escColor,
              swatchC: k.enterColor,
              equipped: customization.keycaps === k.id,
              patch: { keycaps: k.id } as Partial<LoftCustomizationState>,
            }))
          : LOFT_MUG_STYLES.map((m) => ({
              id: m.id,
              label: m.label,
              description: m.description,
              unlockXp: m.unlockXp,
              swatchA: m.bodyTop,
              swatchB: m.drinkColor,
              swatchC: m.bodyRight,
              equipped: customization.mugStyle === m.id,
              patch: { mugStyle: m.id } as Partial<LoftCustomizationState>,
            }));

  return (
    <View testID="loft-workshop-panel" style={styles.panel}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>✦ LOFT WORKSHOP</Text>
          </View>
          <Text style={styles.metaText}>
            {counts.unlocked}/{counts.total} UNLOCKED · ⚡ {totalXp.toLocaleString()} XP
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close Loft Workshop"
          style={({ pressed }) => [
            styles.closeBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onClose();
          }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* 4 Slot Category Tabs */}
      <View style={styles.tabsRow}>
        {SLOT_TABS.map((tab) => {
          const isActive = tab.id === activeSlot;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={`Workshop tab ${tab.label}`}
              style={({ pressed }) => [
                styles.tabBtn,
                isActive && styles.tabBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                setActiveSlot(tab.id);
              }}
            >
              <Text
                style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Swappable Items Grid */}
      <View style={styles.itemsGrid}>
        {items.map((item) => {
          const unlocked = isLoftWorkshopItemUnlocked(
            item.unlockXp,
            totalXp,
            devUnlockAll,
          );
          const xpNeeded = Math.max(0, item.unlockXp - totalXp);

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Equip ${item.label}`}
              style={({ pressed }) => [
                styles.itemCard,
                item.equipped && styles.itemCardEquipped,
                !unlocked && styles.itemCardLocked,
                pressed && unlocked && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                if (!unlocked) {
                  playKeyClick();
                  return;
                }
                if (item.equipped) {
                  playKeyClick();
                  return;
                }
                playSuccessChime();
                onSelectPatch(item.patch, item.label.toUpperCase());
              }}
            >
              <View style={styles.itemTopRow}>
                <View style={styles.swatchTriplet}>
                  <View
                    style={[styles.swatchDot, { backgroundColor: item.swatchA }]}
                  />
                  <View
                    style={[styles.swatchDot, { backgroundColor: item.swatchB }]}
                  />
                  <View
                    style={[styles.swatchDot, { backgroundColor: item.swatchC }]}
                  />
                </View>

                {item.equipped ? (
                  <View style={styles.equippedPill}>
                    <Text style={styles.equippedPillText}>ACTIVE ✓</Text>
                  </View>
                ) : unlocked ? (
                  <View style={styles.equipPill}>
                    <Text style={styles.equipPillText}>EQUIP</Text>
                  </View>
                ) : (
                  <View style={styles.lockedPill}>
                    <Text style={styles.lockedPillText}>
                      🔒 {item.unlockXp} XP
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.itemDesc} numberOfLines={2}>
                {unlocked
                  ? item.description
                  : `Earn ${xpNeeded.toLocaleString()} more XP to unlock.`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    panel: {
      marginTop: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 12,
      gap: 10,
      ...HardShadow,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      flex: 1,
      minWidth: 0,
    },
    kickerPill: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    kickerText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    metaText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: 7,
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    closeBtnText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "900",
    },
    tabsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    tabBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    tabBtnActive: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    tabBtnText: {
      color: colors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    tabBtnTextActive: {
      color: StudioColors.ink,
    },
    itemsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    itemCard: {
      flexGrow: 1,
      flexBasis: 170,
      minWidth: 150,
      backgroundColor: colors.bg,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: 10,
      gap: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    itemCardEquipped: {
      borderColor: StudioColors.lime,
      backgroundColor: colors.surfaceElevated,
      ...HardShadowSm,
    },
    itemCardLocked: {
      opacity: 0.72,
    },
    itemTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
    },
    swatchTriplet: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    swatchDot: {
      width: 12,
      height: 12,
      borderRadius: 99,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    equippedPill: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    equippedPillText: {
      color: StudioColors.ink,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    equipPill: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    equipPillText: {
      color: colors.textPrimary,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    lockedPill: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    lockedPillText: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    itemTitle: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: -0.1,
    },
    itemDesc: {
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "600",
    },
  });
