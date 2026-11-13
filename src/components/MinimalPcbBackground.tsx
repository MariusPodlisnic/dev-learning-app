import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  MonoFont,
  StudioColors,
  ThemeMode,
  ThemePalettes,
} from "../constants/theme";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

type MinimalPcbBackgroundProps = {
  accentColor?: string;
  themeMode?: ThemeMode;
  variant?: "roadmap" | "studio" | "arena";
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
  return `rgba(255, 222, 89, ${alpha})`;
}

type TracePulseProps = {
  side: "left" | "right";
  xOffset: number;
  startY: number;
  endY: number;
  elbowOffsetX?: number;
  elbowStartY?: number;
  elbowEndY?: number;
  durationMs: number;
  delayMs: number;
  pauseMs?: number;
  color: string;
  reduceMotion: boolean;
};

/**
 * Animated signal packet that glides smoothly along a PCB margin trace
 * (including 45-degree elbow bends) to evoke live circuit traffic.
 */
function TraceSignalPulse({
  side,
  xOffset,
  startY,
  endY,
  elbowOffsetX = 0,
  elbowStartY,
  elbowEndY,
  durationMs,
  delayMs,
  pauseMs = 1400,
  color,
  reduceMotion,
}: TracePulseProps) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(0.35);
      return;
    }

    progress.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(progress, {
          toValue: 1,
          duration: durationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(pauseMs),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delayMs, durationMs, pauseMs, progress, reduceMotion]);

  const hasElbow =
    elbowOffsetX !== 0 &&
    typeof elbowStartY === "number" &&
    typeof elbowEndY === "number";

  const span = Math.max(1, Math.abs(endY - startY));
  const t1 = hasElbow
    ? Math.min(0.85, Math.max(0.1, Math.abs((elbowStartY! - startY) / span)))
    : 0.5;
  const t2 = hasElbow
    ? Math.min(0.95, Math.max(t1 + 0.05, Math.abs((elbowEndY! - startY) / span)))
    : 0.5;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startY - 4, endY - 4],
  });

  const dirSign = side === "left" ? 1 : -1;
  const translateX = hasElbow
    ? progress.interpolate({
        inputRange: [0, t1, t2, 1],
        outputRange: [0, 0, dirSign * elbowOffsetX, dirSign * elbowOffsetX],
      })
    : null;

  const opacity = reduceMotion
    ? 0.45
    : progress.interpolate({
        inputRange: [0, 0.08, 0.88, 1],
        outputRange: [0, 0.95, 0.95, 0],
      });

  const scale = reduceMotion
    ? 1
    : progress.interpolate({
        inputRange: [0, 0.15, 0.85, 1],
        outputRange: [0.65, 1.15, 1.05, 0.65],
      });

  const anchorStyle =
    side === "left" ? { left: xOffset - 3 } : { right: xOffset - 3 };

  const transformSteps = translateX
    ? [{ translateX }, { translateY }, { scale }]
    : [{ translateY }, { scale }];

  return (
    <Animated.View
      style={[
        styles.signalPacketWrap,
        anchorStyle,
        {
          opacity,
          transform: transformSteps,
        },
      ]}
    >
      <View
        style={[
          styles.signalHalo,
          { backgroundColor: hexToRgba(color, 0.32) },
        ]}
      />
      <View style={[styles.signalCore, { backgroundColor: color }]} />
    </Animated.View>
  );
}

type PulseViaNodeProps = {
  style: object;
  accentColor: string;
  delayMs: number;
  reduceMotion: boolean;
};

function PulseViaNode({
  style,
  accentColor,
  delayMs,
  reduceMotion,
}: PulseViaNodeProps) {
  const [ringAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      ringAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(2200),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delayMs, reduceMotion, ringAnim]);

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.7],
  });
  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.55, 0],
  });

  return (
    <View style={[styles.viaNode, style]}>
      {!reduceMotion && (
        <Animated.View
          style={[
            styles.viaPingRing,
            {
              borderColor: accentColor,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
      )}
    </View>
  );
}

type FloatingGlyphConfig = {
  id: string;
  label: string;
  side: "left" | "right";
  insetX: number;
  topPct: `${number}%`;
  driftY: number;
  durationMs: number;
  delayMs: number;
  tint: "accent" | "subtle";
};

const FLOATING_GLYPHS: FloatingGlyphConfig[] = [
  {
    id: "g-def",
    label: "def()",
    side: "left",
    insetX: 30,
    topPct: "16%",
    driftY: 14,
    durationMs: 9200,
    delayMs: 0,
    tint: "accent",
  },
  {
    id: "g-braces",
    label: "{ }",
    side: "left",
    insetX: 56,
    topPct: "48%",
    driftY: 18,
    durationMs: 11400,
    delayMs: 1400,
    tint: "subtle",
  },
  {
    id: "g-bits",
    label: "01",
    side: "left",
    insetX: 28,
    topPct: "77%",
    driftY: 12,
    durationMs: 10200,
    delayMs: 600,
    tint: "accent",
  },
  {
    id: "g-arrow",
    label: "=>",
    side: "right",
    insetX: 34,
    topPct: "21%",
    driftY: 16,
    durationMs: 10600,
    delayMs: 900,
    tint: "accent",
  },
  {
    id: "g-bigO",
    label: "O(n)",
    side: "right",
    insetX: 48,
    topPct: "53%",
    driftY: 15,
    durationMs: 12000,
    delayMs: 2100,
    tint: "subtle",
  },
  {
    id: "g-lambda",
    label: "λ",
    side: "right",
    insetX: 30,
    topPct: "81%",
    driftY: 13,
    durationMs: 9800,
    delayMs: 300,
    tint: "accent",
  },
];

function FloatingCodeGlyph({
  config,
  accentColor,
  textColor,
  isDark,
  reduceMotion,
}: {
  config: FloatingGlyphConfig;
  accentColor: string;
  textColor: string;
  isDark: boolean;
  reduceMotion: boolean;
}) {
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      floatAnim.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delayMs),
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: config.durationMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: config.durationMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [config.delayMs, config.durationMs, floatAnim, reduceMotion]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [config.driftY, -config.driftY],
  });
  const opacity = reduceMotion
    ? isDark
      ? 0.22
      : 0.26
    : floatAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: isDark ? [0.12, 0.34, 0.14] : [0.16, 0.38, 0.18],
      });

  const posStyle =
    config.side === "left"
      ? { left: config.insetX, top: config.topPct }
      : { right: config.insetX, top: config.topPct };

  const pillBorder =
    config.tint === "accent"
      ? hexToRgba(accentColor, isDark ? 0.5 : 0.65)
      : hexToRgba(textColor, isDark ? 0.22 : 0.18);
  const pillBg =
    config.tint === "accent"
      ? hexToRgba(accentColor, isDark ? 0.1 : 0.18)
      : hexToRgba(textColor, isDark ? 0.05 : 0.04);

  return (
    <Animated.View
      style={[
        styles.glyphChip,
        posStyle,
        {
          opacity,
          borderColor: pillBorder,
          backgroundColor: pillBg,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text
        style={[
          styles.glyphText,
          { color: config.tint === "accent" && isDark ? accentColor : textColor },
        ]}
      >
        {config.label}
      </Text>
    </Animated.View>
  );
}

const emptySubscribe = () => () => {};
const getClientHydrated = () => true;
const getServerHydrated = () => false;

/**
 * Ambient Studio Backdrop:
 * Combines a subtle architectural dot-matrix grid, slow-breathing track-tinted
 * ambient blooms, floating margin code glyphs, live PCB signal packets, and
 * subtle desktop cursor parallax — staying behind all UI (`zIndex: 0`).
 */
export default function MinimalPcbBackground({
  accentColor = StudioColors.yellow,
  themeMode = "light",
  variant = "roadmap",
}: MinimalPcbBackgroundProps) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientHydrated,
    getServerHydrated,
  );
  const { width } = useWindowDimensions();
  const effectiveWidth = isHydrated ? width : 0;
  const isCompact = effectiveWidth > 0 && effectiveWidth < 960;
  const isWideDesktop = effectiveWidth >= 1120;
  const isDark = themeMode === "dark";
  const palette = ThemePalettes[themeMode];

  const [reduceMotion, setReduceMotion] = useState(false);

  const [glowPulse] = useState(() => new Animated.Value(0));
  const [parallaxX] = useState(() => new Animated.Value(0));
  const [parallaxY] = useState(() => new Animated.Value(0));

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

  // Slow atmospheric breathing loop for ambient corner blooms
  useEffect(() => {
    if (reduceMotion) {
      glowPulse.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 6200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 6200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glowPulse, reduceMotion]);

  // Subtle Web mouse parallax with smooth RAF damping (zero React re-renders)
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || reduceMotion) {
      parallaxX.setValue(0);
      parallaxY.setValue(0);
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number | null = null;

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      parallaxX.setValue(currentX);
      parallaxY.setValue(currentY);

      if (
        Math.abs(targetX - currentX) > 0.08 ||
        Math.abs(targetY - currentY) > 0.08
      ) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const normX = e.clientX / vw - 0.5;
      const normY = e.clientY / vh - 0.5;
      targetX = normX * 18;
      targetY = normY * 14;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [parallaxX, parallaxY, reduceMotion]);

  const secondaryAccent = useMemo(() => {
    const upper = accentColor.toUpperCase();
    if (upper === "#6EE7B7") return "#C4B5FD"; // Mint -> Violet complement
    if (upper === "#C4B5FD") return "#6EE7B7"; // Violet -> Mint complement
    return "#6EE7B7"; // Yellow -> Mint complement
  }, [accentColor]);

  const primaryOrbDriftY = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 18],
  });
  const primaryOrbScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.08],
  });
  const secondaryOrbDriftY = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -16],
  });
  const secondaryOrbScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.06, 0.94],
  });
  const inverseParallaxX = parallaxX.interpolate({
    inputRange: [-20, 20],
    outputRange: [14, -14],
  });
  const inverseParallaxY = parallaxY.interpolate({
    inputRange: [-20, 20],
    outputRange: [10, -10],
  });

  const bloomIntensity = variant === "studio" ? 0.55 : 1;
  const primaryGlowAlpha = (isDark ? 0.16 : 0.24) * bloomIntensity;
  const secondaryGlowAlpha = (isDark ? 0.13 : 0.19) * bloomIntensity;

  const dotColor = isDark
    ? "rgba(244, 240, 230, 0.085)"
    : "rgba(17, 17, 17, 0.075)";
  const webDotMatrixStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `radial-gradient(${dotColor} 1.25px, transparent 1.25px)`,
          backgroundSize: "26px 26px",
        } as any)
      : null;

  const primaryBloomWebStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `radial-gradient(circle, ${hexToRgba(
            accentColor,
            primaryGlowAlpha,
          )} 0%, ${hexToRgba(accentColor, primaryGlowAlpha * 0.32)} 42%, transparent 72%)`,
        } as any)
      : {
          backgroundColor: hexToRgba(accentColor, primaryGlowAlpha * 0.48),
        };

  const secondaryBloomWebStyle =
    Platform.OS === "web"
      ? ({
          backgroundImage: `radial-gradient(circle, ${hexToRgba(
            secondaryAccent,
            secondaryGlowAlpha,
          )} 0%, ${hexToRgba(secondaryAccent, secondaryGlowAlpha * 0.3)} 42%, transparent 72%)`,
        } as any)
      : {
          backgroundColor: hexToRgba(secondaryAccent, secondaryGlowAlpha * 0.45),
        };

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* 1. Architectural Dot-Matrix Surface Grid */}
      {webDotMatrixStyle ? (
        <View style={[styles.dotMatrixLayer, webDotMatrixStyle]} />
      ) : null}

      {/* 2. Slow-Breathing Track-Tinted Ambient Blooms */}
      <Animated.View
        style={[
          styles.fullLayer,
          {
            transform: [
              { translateX: parallaxX },
              { translateY: parallaxY },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.ambientOrbPrimary,
            primaryBloomWebStyle,
            {
              transform: [
                { translateY: primaryOrbDriftY },
                { scale: primaryOrbScale },
              ],
            },
          ]}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.fullLayer,
          {
            transform: [
              { translateX: inverseParallaxX },
              { translateY: inverseParallaxY },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.ambientOrbSecondary,
            secondaryBloomWebStyle,
            {
              transform: [
                { translateY: secondaryOrbDriftY },
                { scale: secondaryOrbScale },
              ],
            },
          ]}
        />
      </Animated.View>

      {/* 3. Subtle Floating Developer Glyphs in Wide Outer Margins */}
      {isWideDesktop && variant !== "studio" ? (
        <Animated.View
          style={[
            styles.glyphLayer,
            {
              transform: [
                { translateX: parallaxX },
                { translateY: parallaxY },
              ],
            },
          ]}
        >
          {FLOATING_GLYPHS.map((glyph) => (
            <FloatingCodeGlyph
              key={glyph.id}
              config={glyph}
              accentColor={accentColor}
              textColor={palette.textPrimary}
              isDark={isDark}
              reduceMotion={reduceMotion}
            />
          ))}
        </Animated.View>
      ) : null}

      {/* 4. Left & Right PCB Margin Circuit Rails + Live Signal Packets */}
      <View
        style={[styles.pcbContainer, isCompact && styles.pcbContainerCompact]}
      >
        {/* Left Outer Margin PCB Traces */}
        <View style={styles.leftRail}>
          {/* Trace 1: Outer long vertical bus with elbow & vias */}
          <View style={[styles.vLine, { left: 22, top: 48, height: 260 }]} />
          <PulseViaNode
            style={{ left: 18.5, top: 42 }}
            accentColor={accentColor}
            delayMs={200}
            reduceMotion={reduceMotion}
          />
          <View
            style={[
              styles.diagSegmentDownRight,
              { left: 22, top: 306, width: 26 },
            ]}
          />
          <View style={[styles.vLine, { left: 40, top: 324, height: 180 }]} />
          <PulseViaNode
            style={{ left: 36.5, top: 504 }}
            accentColor={accentColor}
            delayMs={2400}
            reduceMotion={reduceMotion}
          />
          <TraceSignalPulse
            side="left"
            xOffset={22}
            startY={48}
            endY={504}
            elbowOffsetX={18}
            elbowStartY={306}
            elbowEndY={324}
            durationMs={3400}
            delayMs={300}
            pauseMs={1600}
            color={accentColor}
            reduceMotion={reduceMotion}
          />

          {/* Trace 2: Inner secondary trace with elbow */}
          <View style={[styles.vLine, { left: 54, top: 96, height: 130 }]} />
          <View style={[styles.viaNode, { left: 50.5, top: 90 }]} />
          <View
            style={[
              styles.diagSegmentDownRight,
              { left: 54, top: 224, width: 22 },
            ]}
          />
          <View style={[styles.vLine, { left: 70, top: 240, height: 95 }]} />
          <View style={[styles.viaNode, { left: 66.5, top: 335 }]} />
          <TraceSignalPulse
            side="left"
            xOffset={54}
            startY={96}
            endY={335}
            elbowOffsetX={16}
            elbowStartY={224}
            elbowEndY={240}
            durationMs={2600}
            delayMs={1800}
            pauseMs={2200}
            color={secondaryAccent}
            reduceMotion={reduceMotion}
          />

          {/* Trace 3: Lower margin return bus */}
          <View style={[styles.vLine, { left: 24, top: 560, height: 150 }]} />
          <View style={[styles.viaNode, { left: 20.5, top: 554 }]} />
          <View style={[styles.viaNode, { left: 20.5, top: 710 }]} />
          <TraceSignalPulse
            side="left"
            xOffset={24}
            startY={710}
            endY={560}
            durationMs={2200}
            delayMs={1100}
            pauseMs={2400}
            color={accentColor}
            reduceMotion={reduceMotion}
          />
        </View>

        {/* Right Outer Margin PCB Traces (Mirrored) */}
        <View style={styles.rightRail}>
          {/* Trace 1: Outer long vertical bus with elbow & vias */}
          <View style={[styles.vLine, { right: 22, top: 48, height: 260 }]} />
          <PulseViaNode
            style={{ right: 18.5, top: 42 }}
            accentColor={secondaryAccent}
            delayMs={1400}
            reduceMotion={reduceMotion}
          />
          <View
            style={[
              styles.diagSegmentDownLeft,
              { right: 22, top: 306, width: 26 },
            ]}
          />
          <View style={[styles.vLine, { right: 40, top: 324, height: 180 }]} />
          <PulseViaNode
            style={{ right: 36.5, top: 504 }}
            accentColor={accentColor}
            delayMs={3400}
            reduceMotion={reduceMotion}
          />
          <TraceSignalPulse
            side="right"
            xOffset={22}
            startY={48}
            endY={504}
            elbowOffsetX={18}
            elbowStartY={306}
            elbowEndY={324}
            durationMs={3600}
            delayMs={1500}
            pauseMs={1700}
            color={secondaryAccent}
            reduceMotion={reduceMotion}
          />

          {/* Trace 2: Inner secondary trace with elbow */}
          <View style={[styles.vLine, { right: 54, top: 96, height: 130 }]} />
          <View style={[styles.viaNode, { right: 50.5, top: 90 }]} />
          <View
            style={[
              styles.diagSegmentDownLeft,
              { right: 54, top: 224, width: 22 },
            ]}
          />
          <View style={[styles.vLine, { right: 70, top: 240, height: 95 }]} />
          <View style={[styles.viaNode, { right: 66.5, top: 335 }]} />
          <TraceSignalPulse
            side="right"
            xOffset={54}
            startY={96}
            endY={335}
            elbowOffsetX={16}
            elbowStartY={224}
            elbowEndY={240}
            durationMs={2500}
            delayMs={700}
            pauseMs={2300}
            color={accentColor}
            reduceMotion={reduceMotion}
          />

          {/* Trace 3: Lower margin return bus */}
          <View style={[styles.vLine, { right: 24, top: 560, height: 150 }]} />
          <View style={[styles.viaNode, { right: 20.5, top: 554 }]} />
          <View style={[styles.viaNode, { right: 20.5, top: 710 }]} />
          <TraceSignalPulse
            side="right"
            xOffset={24}
            startY={710}
            endY={560}
            durationMs={2300}
            delayMs={2400}
            pauseMs={2100}
            color={secondaryAccent}
            reduceMotion={reduceMotion}
          />
        </View>
      </View>
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
  dotMatrixLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  fullLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  ambientOrbPrimary: {
    position: "absolute",
    top: -120,
    left: -110,
    width: 480,
    height: 480,
    borderRadius: 240,
  },
  ambientOrbSecondary: {
    position: "absolute",
    bottom: -140,
    right: -110,
    width: 520,
    height: 520,
    borderRadius: 260,
  },
  glyphLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  glyphChip: {
    position: "absolute",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  glyphText: {
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  pcbContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.72,
  },
  pcbContainerCompact: {
    opacity: 0.28,
  },
  leftRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 110,
  },
  rightRail: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 110,
  },
  vLine: {
    position: "absolute",
    width: 1.5,
    backgroundColor: StudioColors.borderSubtle,
    borderRadius: 1,
  },
  diagSegmentDownRight: {
    position: "absolute",
    height: 1.5,
    backgroundColor: StudioColors.borderSubtle,
    transform: [{ rotate: "45deg" }],
    transformOrigin: "left center",
  },
  diagSegmentDownLeft: {
    position: "absolute",
    height: 1.5,
    backgroundColor: StudioColors.borderSubtle,
    transform: [{ rotate: "-45deg" }],
    transformOrigin: "right center",
  },
  viaNode: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: StudioColors.borderSubtle,
    backgroundColor: StudioColors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  viaPingRing: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  signalPacketWrap: {
    position: "absolute",
    width: 8,
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  signalHalo: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  signalCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
