import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  type StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";

export interface StudioErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
  fallbackTitle?: string;
}

interface StudioErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallbackCard({
  error,
  title,
  onRecover,
}: {
  error: Error | null;
  title: string;
  onRecover: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.topStrip} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SYSTEM INTERRUPT // RECOVERABLE</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>
          Devy hit an unexpected UI error. Your local progress and
          code drafts are safe.
        </Text>
        {error?.message ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText} numberOfLines={4}>
              {error.message}
            </Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
            ]}
            onPress={onRecover}
          >
            <Text style={styles.primaryBtnText}>↻ RECOVER STUDIO</Text>
          </Pressable>
          {Platform.OS === "web" && typeof window !== "undefined" ? (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onPress={() => window.location.reload()}
            >
              <Text style={styles.secondaryBtnText}>↺ RELOAD APP</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * Root React Error Boundary protecting the Expo Router stack and lazy arenas
 * so runtime errors present a clean recovery screen instead of a blank view.
 */
export default class StudioErrorBoundary extends React.Component<
  StudioErrorBoundaryProps,
  StudioErrorBoundaryState
> {
  constructor(props: StudioErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): StudioErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("StudioErrorBoundary caught render error:", error, info);
  }

  handleRecover = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackCard
          error={this.state.error}
          title={this.props.fallbackTitle ?? "Something tripped a circuit"}
          onRecover={this.handleRecover}
        />
      );
    }
    return this.props.children;
  }
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: StudioColors.bg,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    card: {
      width: "100%",
      maxWidth: 460,
      backgroundColor: StudioColors.surface,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: StudioColors.border,
      padding: 22,
      paddingTop: 28,
      overflow: "hidden",
      position: "relative",
      ...HardShadow,
    },
    topStrip: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 8,
      backgroundColor: StudioColors.coral,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
    },
    badge: {
      alignSelf: "flex-start",
      backgroundColor: StudioColors.coral,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 12,
    },
    badgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    title: {
      color: StudioColors.textPrimary,
      fontSize: 20,
      fontWeight: "900",
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    description: {
      color: StudioColors.textSecondary,
      fontSize: 13.5,
      lineHeight: 20,
      marginBottom: 14,
    },
    errorBox: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      padding: 10,
      marginBottom: 16,
    },
    errorText: {
      color: StudioColors.coral,
      fontSize: 11.5,
      lineHeight: 16,
      fontFamily: MonoFont,
      fontWeight: "700",
    },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    primaryBtn: {
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    primaryBtnText: {
      color: StudioColors.ink,
      fontSize: 11.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    secondaryBtn: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    secondaryBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 11.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
  });
