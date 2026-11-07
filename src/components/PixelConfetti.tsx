import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { StudioColors } from "../constants/theme";

const PIXEL_COLORS = [
  StudioColors.lime,
  StudioColors.yellow,
  StudioColors.pink,
  StudioColors.mint,
  StudioColors.violet,
  StudioColors.coral,
];

interface ParticleSpec {
  id: number;
  startX: number;
  dx: number;
  dyPeak: number;
  dyEnd: number;
  size: number;
  color: string;
  rotateDeg: number;
}

export default function PixelConfetti() {
  const progress = useRef(new Animated.Value(0)).current;

  const particles = useMemo<ParticleSpec[]>(() => {
    const list: ParticleSpec[] = [];
    for (let i = 0; i < 26; i++) {
      const angle = (i / 26) * Math.PI * 2;
      const spread = 55 + (i % 5) * 28;
      list.push({
        id: i,
        startX: ((i % 7) - 3) * 18,
        dx: Math.cos(angle) * spread,
        dyPeak: -45 - (i % 4) * 24,
        dyEnd: 140 + (i % 5) * 35,
        size: i % 3 === 0 ? 11 : 8,
        color: PIXEL_COLORS[i % PIXEL_COLORS.length],
        rotateDeg: (i % 2 === 0 ? 1 : -1) * (120 + (i % 4) * 60),
      });
    }
    return list;
  }, []);

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 1650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [progress]);

  return (
    <View style={styles.overlay} pointerEvents="none">
      {particles.map((p) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startX, p.startX + p.dx],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 0.35, 1],
          outputRange: [0, p.dyPeak, p.dyEnd],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.72, 1],
          outputRange: [1, 1, 0],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.2, 0.85, 1],
          outputRange: [0.4, 1.15, 1, 0.6],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${p.rotateDeg}deg`],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.pixel,
              {
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 28,
    left: 0,
    right: 0,
    height: 220,
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 30,
  },
  pixel: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 2,
  },
});
