import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { Text } from "./StudioIcon";
import { useThemedStyles } from "../constants/themeContext";
import { createVisualizerStyles } from "./visualizerStyles";

export function PointerBadge({
  label,
  bg,
  textColor,
}: {
  label: string;
  bg: string;
  textColor: string;
}) {
  const styles = useThemedStyles(createVisualizerStyles);
  return (
    <View style={[styles.pointerPill, { backgroundColor: bg }]}>
      <Text style={[styles.pointerPillText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function AnimatedTile({
  active = false,
  dimmed = false,
  style,
  children,
}: {
  active?: boolean;
  dimmed?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const [scaleAnim] = useState(() => new Animated.Value(active ? 1.07 : dimmed ? 0.94 : 1));
  const [liftAnim] = useState(() => new Animated.Value(active ? -4 : 0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: active ? 1.07 : dimmed ? 0.94 : 1,
        friction: 6,
        tension: 140,
        useNativeDriver: false,
      }),
      Animated.spring(liftAnim, {
        toValue: active ? -4 : 0,
        friction: 6,
        tension: 140,
        useNativeDriver: false,
      }),
    ]).start();
  }, [active, dimmed, scaleAnim, liftAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function AnimatedBarItem({
  heightPx,
  active,
  swapped,
  style,
  children,
}: {
  heightPx: number;
  active: boolean;
  swapped: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const [heightAnim] = useState(() => new Animated.Value(heightPx));
  const [liftAnim] = useState(() => new Animated.Value(active ? -6 : 0));
  const [scaleAnim] = useState(() => new Animated.Value(swapped ? 1.07 : active ? 1.03 : 1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: heightPx,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(liftAnim, {
        toValue: active ? -6 : 0,
        friction: 6,
        tension: 130,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: swapped ? 1.07 : active ? 1.03 : 1,
        friction: 5,
        tension: 140,
        useNativeDriver: false,
      }),
    ]).start();
  }, [heightPx, active, swapped, heightAnim, liftAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          height: heightAnim,
          transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function AnimatedGraphCircle({
  active,
  queued,
  found,
  style,
  children,
}: {
  active: boolean;
  queued: boolean;
  found: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const targetScale = found ? 1.14 : active ? 1.1 : queued ? 1.04 : 1;
  const [scaleAnim] = useState(() => new Animated.Value(targetScale));

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: targetScale,
      friction: 5,
      tension: 145,
      useNativeDriver: false,
    }).start();
  }, [targetScale, scaleAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

