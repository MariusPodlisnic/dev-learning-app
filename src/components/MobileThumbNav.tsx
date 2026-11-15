"use no memo";

import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./StudioIcon";
import {
  HardShadowSm,
  MonoFont,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { ViewMode } from "../types/lesson";
import { MOBILE_NAV_ITEMS } from "../utils/mobileLayout";
import { playKeyClick } from "../utils/soundEffects";

interface MobileThumbNavProps {
  viewMode: ViewMode;
  isPremium: boolean;
  onChangeViewMode: (mode: ViewMode) => void;
}

function getActiveFillStyle(
  key: ViewMode,
  styles: ReturnType<typeof createStyles>,
) {
  switch (key) {
    case "bughunt":
      return styles.tabItemActiveCoral;
    case "blitz":
      return styles.tabItemActiveLime;
    case "algolab":
      return styles.tabItemActiveViolet;
    case "studio":
    case "roadmap":
    default:
      return styles.tabItemActiveYellow;
  }
}

export default function MobileThumbNav({
  viewMode,
  isPremium,
  onChangeViewMode,
}: MobileThumbNavProps) {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 6);

  return (
    <View
      style={[
        styles.dockContainer,
        { paddingBottom: bottomInset },
      ]}
      accessibilityRole="tablist"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = item.kind === "mode" && viewMode === item.key;
        const icon =
          item.key === "algolab" && !isPremium ? "🔒" : item.icon;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={item.accessibilityLabel}
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.tabItem,
              isActive && getActiveFillStyle(viewMode, styles),
              pressed && styles.tabItemPressed,
            ]}
            onPress={() => {
              playKeyClick();
              if (item.kind === "route") {
                router.push(item.href);
              } else {
                onChangeViewMode(item.key);
              }
            }}
          >
            <Text style={styles.tabIcon}>{icon}</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
            >
              {item.shortLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    dockContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
      paddingTop: 6,
      paddingHorizontal: 8,
      backgroundColor: StudioColors.surface,
      borderTopWidth: 2,
      borderTopColor: StudioColors.border,
      zIndex: 20,
    },
    tabItem: {
      flex: 1,
      minHeight: 44,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 4,
      paddingHorizontal: 2,
      gap: 2,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    tabItemPressed: {
      transform: [{ translateY: 1 }],
    },
    tabItemActiveYellow: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    tabItemActiveCoral: {
      backgroundColor: StudioColors.coral,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    tabItemActiveLime: {
      backgroundColor: StudioColors.lime,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    tabItemActiveViolet: {
      backgroundColor: StudioColors.violet,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
    },
    tabIcon: {
      fontSize: 14,
      lineHeight: 16,
    },
    tabLabel: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.2,
    },
    tabLabelActive: {
      color: StudioColors.ink,
    },
  });
