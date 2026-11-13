import React, { useEffect, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { StudioColors, ThemeMode } from "../constants/theme";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

type StudioFocusBackgroundProps = {
  accentColor?: string;
  themeMode?: ThemeMode;
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return `rgba(110, 231, 183, ${alpha})`;
}

type FocusMoteConfig = {
  id: string;
  leftPct: `${number}%`;
  topPct: `${number}%`;
  size: number;
  driftY: number;
  driftX: number;
  durationMs: number;
  delayMs: number;
  tone: "warm" | "cool" | "horizon";
};

const FOCUS_MOTES: FocusMoteConfig[] = [
  {
    id: "mote-1",
    leftPct: "8%",
    topPct: "20%",
    size: 7,
    driftY: 34,
    driftX: 16,
    durationMs: 10500,
    delayMs: 0,
    tone: "warm",
  },
  {
    id: "mote-2",
    leftPct: "22%",
    topPct: "74%",
    size: 5,
    driftY: 28,
    driftX: -18,
    durationMs: 12000,
    delayMs: 1400,
    tone: "cool",
  },
  {
    id: "mote-3",
    leftPct: "36%",
    topPct: "16%",
    size: 8,
    driftY: 32,
    driftX: 14,
    durationMs: 13500,
    delayMs: 700,
    tone: "horizon",
  },
  {
    id: "mote-4",
    leftPct: "51%",
    topPct: "84%",
    size: 6,
    driftY: 26,
    driftX: -14,
    durationMs: 11200,
    delayMs: 2600,
    tone: "warm",
  },
  {
    id: "mote-5",
    leftPct: "68%",
    topPct: "24%",
    size: 7,
    driftY: 36,
    driftX: -16,
    durationMs: 12800,
    delayMs: 500,
    tone: "cool",
  },
  {
    id: "mote-6",
    leftPct: "86%",
    topPct: "62%",
    size: 9,
    driftY: 30,
    driftX: 14,
    durationMs: 11600,
    delayMs: 3100,
    tone: "warm",
  },
  {
    id: "mote-7",
    leftPct: "14%",
    topPct: "50%",
    size: 6,
    driftY: 24,
    driftX: 15,
    durationMs: 14000,
    delayMs: 1200,
    tone: "cool",
  },
  {
    id: "mote-8",
    leftPct: "44%",
    topPct: "48%",
    size: 5,
    driftY: 28,
    driftX: 18,
    durationMs: 10800,
    delayMs: 1900,
    tone: "horizon",
  },
  {
    id: "mote-9",
    leftPct: "77%",
    topPct: "78%",
    size: 6,
    driftY: 32,
    driftX: -15,
    durationMs: 12400,
    delayMs: 900,
    tone: "horizon",
  },
  {
    id: "mote-10",
    leftPct: "93%",
    topPct: "28%",
    size: 5,
    driftY: 26,
    driftX: -12,
    durationMs: 9800,
    delayMs: 2200,
    tone: "cool",
  },
  {
    id: "mote-11",
    leftPct: "31%",
    topPct: "39%",
    size: 6,
    driftY: 30,
    driftX: -14,
    durationMs: 13000,
    delayMs: 3500,
    tone: "warm",
  },
];

type LightStreakConfig = {
  id: string;
  leftPct: `${number}%`;
  topPct: `${number}%`;
  length: number;
  travel: number;
  durationMs: number;
  delayMs: number;
  pauseMs: number;
  tone: "warm" | "cool" | "horizon";
};

const LIGHT_STREAKS: LightStreakConfig[] = [
  {
    id: "streak-1",
    leftPct: "16%",
    topPct: "12%",
    length: 130,
    travel: 220,
    durationMs: 5200,
    delayMs: 400,
    pauseMs: 2400,
    tone: "cool",
  },
  {
    id: "streak-2",
    leftPct: "58%",
    topPct: "8%",
    length: 150,
    travel: 240,
    durationMs: 5800,
    delayMs: 2600,
    pauseMs: 2800,
    tone: "warm",
  },
  {
    id: "streak-3",
    leftPct: "82%",
    topPct: "34%",
    length: 115,
    travel: 200,
    durationMs: 4900,
    delayMs: 1400,
    pauseMs: 3100,
    tone: "horizon",
  },
  {
    id: "streak-4",
    leftPct: "34%",
    topPct: "54%",
    length: 125,
    travel: 210,
    durationMs: 5500,
    delayMs: 3900,
    pauseMs: 2600,
    tone: "cool",
  },
];

function SoftFocusMote({
  config,
  color,
  isDark,
  reduceMotion,
}: {
  config: FocusMoteConfig;
  color: string;
  isDark: boolean;
  reduceMotion: boolean;
}) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      anim.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delayMs),
        Animated.timing(anim, {
          toValue: 1,
          duration: config.durationMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: config.durationMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, config.delayMs, config.durationMs, reduceMotion]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [config.driftY, -config.driftY],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.driftX, config.driftX],
  });
  const scale = reduceMotion
    ? 1
    : anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.82, 1.24, 0.84],
      });
  const opacity = reduceMotion
    ? isDark
      ? 0.2
      : 0.22
    : anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: isDark ? [0.12, 0.36, 0.14] : [0.14, 0.34, 0.15],
      });

  return (
    <Animated.View
      style={[
        styles.moteWrap,
        {
          left: config.leftPct,
          top: config.topPct,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    >
      <View
        style={{
          width: config.size * 2.8,
          height: config.size * 2.8,
          borderRadius: config.size * 1.4,
          backgroundColor: hexToRgba(color, isDark ? 0.22 : 0.18),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: config.size,
            height: config.size,
            borderRadius: config.size / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </Animated.View>
  );
}

/**
 * Slow diagonal starlight/rain-like ambient streak gliding softly in the background.
 */
function SoftLightStreak({
  config,
  color,
  isDark,
  reduceMotion,
}: {
  config: LightStreakConfig;
  color: string;
  isDark: boolean;
  reduceMotion: boolean;
}) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(0.45);
      return;
    }
    progress.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delayMs),
        Animated.timing(progress, {
          toValue: 1,
          duration: config.durationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(config.pauseMs),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [config.delayMs, config.durationMs, config.pauseMs, progress, reduceMotion]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -config.travel * 0.85],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, config.travel * 0.52],
  });
  const opacity = reduceMotion
    ? 0
    : progress.interpolate({
        inputRange: [0, 0.18, 0.72, 1],
        outputRange: [0, isDark ? 0.34 : 0.26, isDark ? 0.28 : 0.2, 0],
      });

  const streakGradientStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `linear-gradient(90deg, ${hexToRgba(
            color,
            0.85,
          )} 0%, ${hexToRgba(color, 0.28)} 45%, transparent 100%)`,
        } as any)
      : { backgroundColor: hexToRgba(color, 0.45) };

  return (
    <Animated.View
      style={[
        styles.streakWrap,
        {
          left: config.leftPct,
          top: config.topPct,
          width: config.length,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: "-31deg" },
          ],
        },
        streakGradientStyle,
      ]}
    />
  );
}

function resolveStudioPalette(accentColor: string, isDark: boolean) {
  const upper = accentColor.toUpperCase();

  if (isDark) {
    if (upper === "#C4B5FD") {
      return {
        warmWash: "#818CF8",
        coolWash: "#34D399",
        horizonTint: "#A78BFA",
        warmAlpha: 0.145,
        coolAlpha: 0.125,
        midAlpha: 0.08,
        gridColor: "rgba(244, 240, 230, 0.036)",
      };
    }
    if (upper === "#6EE7B7") {
      return {
        warmWash: "#38BDF8",
        coolWash: "#34D399",
        horizonTint: "#6EE7B7",
        warmAlpha: 0.135,
        coolAlpha: 0.135,
        midAlpha: 0.08,
        gridColor: "rgba(244, 240, 230, 0.036)",
      };
    }
    return {
      warmWash: "#F59E0B",
      coolWash: "#38BDF8",
      horizonTint: "#6EE7B7",
      warmAlpha: 0.13,
      coolAlpha: 0.125,
      midAlpha: 0.075,
      gridColor: "rgba(244, 240, 230, 0.036)",
    };
  }

  if (upper === "#C4B5FD") {
    return {
      warmWash: "#8B5CF6",
      coolWash: "#0EA5E9",
      horizonTint: "#7C3AED",
      warmAlpha: 0.15,
      coolAlpha: 0.125,
      midAlpha: 0.08,
      gridColor: "rgba(17, 17, 17, 0.048)",
    };
  }
  if (upper === "#6EE7B7") {
    return {
      warmWash: "#10B981",
      coolWash: "#0284C7",
      horizonTint: "#059669",
      warmAlpha: 0.145,
      coolAlpha: 0.125,
      midAlpha: 0.08,
      gridColor: "rgba(17, 17, 17, 0.048)",
    };
  }
  return {
    warmWash: "#F59E0B",
    coolWash: "#10B981",
    horizonTint: "#0EA5E9",
    warmAlpha: 0.155,
    coolAlpha: 0.125,
    midAlpha: 0.08,
    gridColor: "rgba(17, 17, 17, 0.048)",
  };
}

/**
 * Chill, comfy, productive animated background tailored for the Code Studio view.
 * Combines 3 drifting lofi auroras, gentle diagonal starlight trails, sweeping edge
 * horizon beams, a soft desk-mat grid, and breathing bokeh focus motes.
 */
export default function StudioFocusBackground({
  accentColor = StudioColors.yellow,
  themeMode = "dark",
}: StudioFocusBackgroundProps) {
  const isDark = themeMode === "dark";
  const [reduceMotion, setReduceMotion] = useState(false);

  const [auroraA] = useState(() => new Animated.Value(0));
  const [auroraB] = useState(() => new Animated.Value(0));
  const [auroraC] = useState(() => new Animated.Value(0));
  const [horizonSweep] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(Boolean(enabled));
      })
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (enabled) => {
        setReduceMotion(Boolean(enabled));
      },
    );

    let mq: MediaQueryList | null = null;
    const onMqChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
      mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener?.("change", onMqChange);
    }

    return () => {
      active = false;
      sub?.remove?.();
      mq?.removeEventListener?.("change", onMqChange);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      auroraA.setValue(0.5);
      auroraB.setValue(0.5);
      auroraC.setValue(0.5);
      horizonSweep.setValue(0.5);
      return;
    }

    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(auroraA, {
          toValue: 1,
          duration: 7200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(auroraA, {
          toValue: 0,
          duration: 7200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(auroraB, {
          toValue: 1,
          duration: 8800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(auroraB, {
          toValue: 0,
          duration: 8800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    const loopC = Animated.loop(
      Animated.sequence([
        Animated.timing(auroraC, {
          toValue: 1,
          duration: 6500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(auroraC, {
          toValue: 0,
          duration: 6500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    const loopSweep = Animated.loop(
      Animated.sequence([
        Animated.timing(horizonSweep, {
          toValue: 1,
          duration: 5400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(horizonSweep, {
          toValue: 0,
          duration: 5400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    loopA.start();
    loopB.start();
    loopC.start();
    loopSweep.start();

    return () => {
      loopA.stop();
      loopB.stop();
      loopC.stop();
      loopSweep.stop();
    };
  }, [auroraA, auroraB, auroraC, horizonSweep, reduceMotion]);

  const palette = useMemo(
    () => resolveStudioPalette(accentColor, isDark),
    [accentColor, isDark],
  );

  const warmTranslateX = auroraA.interpolate({
    inputRange: [0, 1],
    outputRange: [-44, 58],
  });
  const warmTranslateY = auroraA.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 40],
  });
  const warmScale = auroraA.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.12],
  });

  const coolTranslateX = auroraB.interpolate({
    inputRange: [0, 1],
    outputRange: [50, -52],
  });
  const coolTranslateY = auroraB.interpolate({
    inputRange: [0, 1],
    outputRange: [34, -36],
  });
  const coolScale = auroraB.interpolate({
    inputRange: [0, 1],
    outputRange: [1.1, 0.91],
  });

  const midTranslateX = auroraC.interpolate({
    inputRange: [0, 1],
    outputRange: [-42, 46],
  });
  const midTranslateY = auroraC.interpolate({
    inputRange: [0, 1],
    outputRange: [32, -28],
  });
  const midScale = auroraC.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.09],
  });

  const topBeamTranslateX = horizonSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });
  const bottomBeamTranslateX = horizonSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [180, -180],
  });

  const webDeskGridStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `linear-gradient(to right, ${palette.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${palette.gridColor} 1px, transparent 1px)`,
          backgroundSize: "42px 42px",
        } as any)
      : null;

  const webBaseGradientStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: isDark
            ? "linear-gradient(160deg, rgba(24, 27, 38, 0.55) 0%, rgba(17, 18, 23, 0) 55%, rgba(14, 22, 24, 0.5) 100%)"
            : "linear-gradient(160deg, rgba(255, 252, 246, 0.65) 0%, rgba(244, 240, 230, 0) 55%, rgba(232, 236, 228, 0.55) 100%)",
        } as any)
      : null;

  const warmAuroraStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `radial-gradient(circle, ${hexToRgba(
            palette.warmWash,
            palette.warmAlpha,
          )} 0%, ${hexToRgba(palette.warmWash, palette.warmAlpha * 0.38)} 45%, transparent 72%)`,
        } as any)
      : { backgroundColor: hexToRgba(palette.warmWash, palette.warmAlpha * 0.55) };

  const coolAuroraStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `radial-gradient(circle, ${hexToRgba(
            palette.coolWash,
            palette.coolAlpha,
          )} 0%, ${hexToRgba(palette.coolWash, palette.coolAlpha * 0.38)} 45%, transparent 72%)`,
        } as any)
      : { backgroundColor: hexToRgba(palette.coolWash, palette.coolAlpha * 0.55) };

  const midAuroraStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `radial-gradient(circle, ${hexToRgba(
            palette.horizonTint,
            palette.midAlpha,
          )} 0%, ${hexToRgba(palette.horizonTint, palette.midAlpha * 0.35)} 45%, transparent 72%)`,
        } as any)
      : { backgroundColor: hexToRgba(palette.horizonTint, palette.midAlpha * 0.55) };

  const horizonBeamWebStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `linear-gradient(90deg, transparent 0%, ${hexToRgba(
            palette.horizonTint,
            0.75,
          )} 50%, transparent 100%)`,
        } as any)
      : { backgroundColor: hexToRgba(palette.horizonTint, 0.45) };

  function pickToneColor(tone: "warm" | "cool" | "horizon"): string {
    if (tone === "warm") return palette.warmWash;
    if (tone === "cool") return palette.coolWash;
    return palette.horizonTint;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* 1. Soft Ambient Tone Gradient */}
      {webBaseGradientStyle ? (
        <View style={[styles.fullLayer, webBaseGradientStyle]} />
      ) : null}

      {/* 2. Whisper-Soft Architectural Desk Grid */}
      {webDeskGridStyle ? (
        <View style={[styles.fullLayer, webDeskGridStyle]} />
      ) : null}

      {/* 3. Three Drifting Lofi Focus Auroras */}
      <Animated.View
        style={[
          styles.warmAuroraOrb,
          warmAuroraStyle,
          {
            transform: [
              { translateX: warmTranslateX },
              { translateY: warmTranslateY },
              { scale: warmScale },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.midAuroraOrb,
          midAuroraStyle,
          {
            transform: [
              { translateX: midTranslateX },
              { translateY: midTranslateY },
              { scale: midScale },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.coolAuroraOrb,
          coolAuroraStyle,
          {
            transform: [
              { translateX: coolTranslateX },
              { translateY: coolTranslateY },
              { scale: coolScale },
            ],
          },
        ]}
      />

      {/* 4. Sweeping Focus Horizon Beams (Top & Bottom Frame Edges) */}
      <View style={styles.horizonTrackTop}>
        <Animated.View
          style={[
            styles.horizonBeam,
            horizonBeamWebStyle,
            { transform: [{ translateX: topBeamTranslateX }] },
          ]}
        />
      </View>
      <View style={styles.horizonTrackBottom}>
        <Animated.View
          style={[
            styles.horizonBeam,
            horizonBeamWebStyle,
            { transform: [{ translateX: bottomBeamTranslateX }] },
          ]}
        />
      </View>

      {/* 5. Gentle Diagonal Starlight Trails */}
      {LIGHT_STREAKS.map((streak) => (
        <SoftLightStreak
          key={streak.id}
          config={streak}
          color={pickToneColor(streak.tone)}
          isDark={isDark}
          reduceMotion={reduceMotion}
        />
      ))}

      {/* 6. Breathing Bokeh Focus Motes */}
      {FOCUS_MOTES.map((mote) => (
        <SoftFocusMote
          key={mote.id}
          config={mote}
          color={pickToneColor(mote.tone)}
          isDark={isDark}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    overflow: "hidden",
  },
  fullLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  warmAuroraOrb: {
    position: "absolute",
    top: -150,
    left: -110,
    width: 680,
    height: 680,
    borderRadius: 340,
  },
  midAuroraOrb: {
    position: "absolute",
    top: "18%",
    left: "32%",
    width: 540,
    height: 540,
    borderRadius: 270,
  },
  coolAuroraOrb: {
    position: "absolute",
    bottom: -170,
    right: -100,
    width: 720,
    height: 720,
    borderRadius: 360,
  },
  horizonTrackTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    alignItems: "center",
    overflow: "hidden",
  },
  horizonTrackBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    alignItems: "center",
    overflow: "hidden",
  },
  horizonBeam: {
    width: 280,
    height: 2,
  },
  streakWrap: {
    position: "absolute",
    height: 1.5,
    borderRadius: 1,
  },
  moteWrap: {
    position: "absolute",
  },
});
