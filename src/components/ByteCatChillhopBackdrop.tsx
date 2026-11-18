import React, { useEffect, useState } from "react";
import { Animated, Easing, Text as RNText, StyleSheet, View } from "react-native";

interface ByteCatChillhopBackdropProps {
  accentColor: string;
  isDark: boolean;
}

interface FloatingNoteSpec {
  glyph: string;
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  phaseIndex: 0 | 1 | 2;
  sway: number;
  useViolet: boolean;
}

const FLOATING_NOTES: FloatingNoteSpec[] = [
  { glyph: "♫", left: "34%", top: "14%", size: 15, phaseIndex: 0, sway: 8, useViolet: true },
  { glyph: "♪", left: "68%", top: "11%", size: 15, phaseIndex: 2, sway: -7, useViolet: false },
  { glyph: "✦", left: "92%", top: "19%", size: 13, phaseIndex: 1, sway: 6, useViolet: false },
  { glyph: "♪", left: "31%", top: "83%", size: 16, phaseIndex: 1, sway: 9, useViolet: false },
  { glyph: "♫", left: "58%", top: "87%", size: 15, phaseIndex: 0, sway: -8, useViolet: true },
  { glyph: "♪", left: "86%", top: "81%", size: 15, phaseIndex: 2, sway: 7, useViolet: false },
];

const PHASE_DURATIONS = [5600, 6400, 6000] as const;

/**
 * Calm chillhop sound-ripple rings and drifting musical notes rendered behind
 * Byte-Cat's studio columns without interfering with pointer events or text legibility.
 */
export default function ByteCatChillhopBackdrop({
  accentColor,
  isDark,
}: ByteCatChillhopBackdropProps) {
  const [waveAnim] = useState(() => new Animated.Value(0));
  const [phaseAnims] = useState(() => [
    new Animated.Value(0),
    new Animated.Value(0.38),
    new Animated.Value(0.72),
  ]);

  useEffect(() => {
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    const noteLoops = phaseAnims.map((anim, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: PHASE_DURATIONS[idx],
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
      ),
    );

    waveLoop.start();
    for (const loop of noteLoops) loop.start();

    return () => {
      waveLoop.stop();
      for (const loop of noteLoops) loop.stop();
    };
  }, [phaseAnims, waveAnim]);

  const primaryTint = isDark ? accentColor : "#059669";
  const secondaryTint = isDark ? "#C4B5FD" : "#7C3AED";

  const innerRingScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.07],
  });
  const innerRingOpacity = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isDark ? [0.14, 0.3] : [0.16, 0.32],
  });
  const outerRingScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.05, 0.95],
  });
  const outerRingOpacity = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isDark ? [0.22, 0.1] : [0.24, 0.12],
  });

  return (
    <View style={styles.layer} pointerEvents="none">
      {/* Concentric Lo-Fi Sound Ripples */}
      <Animated.View
        style={[
          styles.innerRing,
          {
            borderColor: primaryTint,
            opacity: innerRingOpacity,
            transform: [{ scale: innerRingScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: secondaryTint,
            opacity: outerRingOpacity,
            transform: [{ scale: outerRingScale }],
          },
        ]}
      />

      {/* Drifting Chillhop Musical Notes & Sparkles */}
      {FLOATING_NOTES.map((note, idx) => {
        const anim = phaseAnims[note.phaseIndex];
        const opacity = anim.interpolate({
          inputRange: [0, 0.2, 0.78, 1],
          outputRange: [0, 0.34, 0.24, 0],
        });
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, -38],
        });
        const translateX = anim.interpolate({
          inputRange: [0, 0.55, 1],
          outputRange: [0, note.sway, -note.sway * 0.4],
        });
        const rotate = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ["-6deg", "6deg", "-4deg"],
        });

        return (
          <Animated.View
            key={idx}
            style={[
              styles.noteWrap,
              {
                left: note.left,
                top: note.top,
                opacity,
                transform: [{ translateY }, { translateX }, { rotate }],
              },
            ]}
          >
            <RNText
              style={[
                styles.noteGlyph,
                {
                  fontSize: note.size,
                  color: note.useViolet ? secondaryTint : primaryTint,
                },
              ]}
            >
              {note.glyph}
            </RNText>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  innerRing: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1.5,
    right: "10%",
    top: "6%",
  },
  outerRing: {
    position: "absolute",
    width: 370,
    height: 370,
    borderRadius: 185,
    borderWidth: 1.5,
    borderStyle: "dashed",
    right: "3%",
    top: "-10%",
  },
  noteWrap: {
    position: "absolute",
  },
  noteGlyph: {
    fontWeight: "900",
  },
});
