"use no memo";

import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  getStudioPaletteMeta,
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
  ThemeMode,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import { playCrtChannelSwitch } from "../utils/soundEffects";
import { StudioIcon, type StudioIconName, Text } from "./StudioIcon";

export type RetroTvChannel = 0 | 1 | 2 | 3 | 4;

interface ChannelMeta {
  id: RetroTvChannel;
  num: string;
  accent: string;
  charmIcon: StudioIconName;
  charmBg: string;
  charmBorder: string;
}

export const RETRO_TV_CHANNELS: readonly ChannelMeta[] = [
  {
    id: 0,
    num: "01",
    accent: "#B8FF3B",
    charmIcon: "crt_ch_kernel",
    charmBg: "rgba(184, 255, 59, 0.16)",
    charmBorder: "rgba(184, 255, 59, 0.5)",
  },
  {
    id: 1,
    num: "02",
    accent: "#38BDF8",
    charmIcon: "crt_ch_telemetry",
    charmBg: "rgba(56, 189, 248, 0.16)",
    charmBorder: "rgba(56, 189, 248, 0.5)",
  },
  {
    id: 2,
    num: "03",
    accent: "#C4B5FD",
    charmIcon: "crt_ch_bytecat",
    charmBg: "rgba(196, 181, 253, 0.18)",
    charmBorder: "rgba(196, 181, 253, 0.54)",
  },
  {
    id: 3,
    num: "04",
    accent: "#FF90E8",
    charmIcon: "crt_ch_lofi",
    charmBg: "rgba(255, 144, 232, 0.16)",
    charmBorder: "rgba(255, 144, 232, 0.5)",
  },
  {
    id: 4,
    num: "05",
    accent: "#6EE7B7",
    charmIcon: "crt_ch_brew",
    charmBg: "rgba(110, 231, 183, 0.16)",
    charmBorder: "rgba(110, 231, 183, 0.5)",
  },
] as const;

const SMPTE_BAR_COLORS = [
  "#FFDE59",
  "#6EE7B7",
  "#38BDF8",
  "#B8FF3B",
  "#FF90E8",
  "#C4B5FD",
] as const;

const EQ_BAR_COLORS = [
  "#C4B5FD",
  "#FF90E8",
  "#FFDE59",
  "#6EE7B7",
  "#38BDF8",
  "#B8FF3B",
  "#FF90E8",
  "#C4B5FD",
] as const;

interface RoadmapRetroTvProps {
  activeTrack: string;
  trackIconLabel: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  nextUpLessonTitle?: string;
  initialChannel?: RetroTvChannel;
  scrollTranslateY?: Animated.AnimatedInterpolation<number>;
  scrollScale?: Animated.AnimatedInterpolation<number>;
  scrollOpacity?: Animated.AnimatedInterpolation<number>;
}

export default function RoadmapRetroTv({
  activeTrack,
  trackIconLabel,
  completedCount,
  totalCount,
  progressPercent,
  nextUpLessonTitle,
  initialChannel = 0,
  scrollTranslateY,
  scrollScale,
  scrollOpacity,
}: RoadmapRetroTvProps) {
  const { paletteId } = useTheme();
  const activePalette = getStudioPaletteMeta(paletteId);
  const styles = useThemedStyles(createStyles);
  const [channel, setChannel] = useState<RetroTvChannel>(initialChannel);

  // Ambient continuous animations
  const [scanSweepAnim] = useState(() => new Animated.Value(0));
  const [cozyFloatAnim] = useState(() => new Animated.Value(0));
  const [ledPulseAnim] = useState(() => new Animated.Value(0));
  const [cursorAnim] = useState(() => new Animated.Value(1));
  const [steamAnim1] = useState(() => new Animated.Value(0));
  const [steamAnim2] = useState(() => new Animated.Value(0));
  const [eqAnims] = useState(() => [
    new Animated.Value(0.35),
    new Animated.Value(0.8),
    new Animated.Value(0.55),
    new Animated.Value(0.9),
  ]);

  // Interactive channel-switch animations
  const [vhsGlitchAnim] = useState(() => new Animated.Value(0));
  const [vhsShiftAnim] = useState(() => new Animated.Value(0));
  const [tapePopAnim] = useState(() => new Animated.Value(0));
  const [earWiggleAnim] = useState(() => new Animated.Value(0));

  // Always-mounted ambient animations (scanline sweep, cozy orb float, VHS power LED)
  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.timing(scanSweepAnim, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cozyFloatAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(cozyFloatAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    const ledLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ledPulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(ledPulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    scanLoop.start();
    floatLoop.start();
    ledLoop.start();

    return () => {
      scanLoop.stop();
      floatLoop.stop();
      ledLoop.stop();
    };
  }, [cozyFloatAnim, ledPulseAnim, scanSweepAnim]);

  // Channel-scoped animations: restart cleanly every time the user returns to CH 01 / CH 04 / CH 05
  // (React Native Web stops Animated loops when their bound views unmount)
  useEffect(() => {
    if (channel === 0) {
      cursorAnim.setValue(1);
      const cursorLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorAnim, {
            toValue: 0,
            duration: 460,
            easing: Easing.step0,
            useNativeDriver: false,
          }),
          Animated.timing(cursorAnim, {
            toValue: 1,
            duration: 460,
            easing: Easing.step0,
            useNativeDriver: false,
          }),
        ]),
      );
      cursorLoop.start();
      return () => cursorLoop.stop();
    }

    if (channel === 3) {
      const initialHeights = [0.35, 0.8, 0.55, 0.9];
      const eqLoops = eqAnims.map((anim, idx) => {
        anim.setValue(initialHeights[idx] ?? 0.5);
        const speed = 320 + idx * 85;
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: speed,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.25,
              duration: speed,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: false,
            }),
          ]),
        );
      });
      eqLoops.forEach((loop) => loop.start());
      return () => {
        eqLoops.forEach((loop) => loop.stop());
      };
    }

    if (channel === 4) {
      steamAnim1.setValue(0);
      steamAnim2.setValue(0);
      const steamLoop1 = Animated.loop(
        Animated.timing(steamAnim1, {
          toValue: 1,
          duration: 1850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      );

      const steamLoop2 = Animated.loop(
        Animated.timing(steamAnim2, {
          toValue: 1,
          duration: 1850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      );

      steamLoop1.start();
      const steam2Timer = setTimeout(() => {
        steamLoop2.start();
      }, 700);
      return () => {
        clearTimeout(steam2Timer);
        steamLoop1.stop();
        steamLoop2.stop();
      };
    }

    return undefined;
  }, [channel, cursorAnim, eqAnims, steamAnim1, steamAnim2]);

  function triggerSwitchAnimations() {
    vhsGlitchAnim.setValue(1);
    vhsShiftAnim.setValue(-5);
    tapePopAnim.setValue(0);
    earWiggleAnim.setValue(0);

    Animated.parallel([
      // SMPTE pastel color-bar tracking flash
      Animated.sequence([
        Animated.timing(vhsGlitchAnim, {
          toValue: 0.85,
          duration: 90,
          useNativeDriver: false,
        }),
        Animated.timing(vhsGlitchAnim, {
          toValue: 0,
          duration: 210,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
      // Subtle horizontal tracking jitter
      Animated.sequence([
        Animated.timing(vhsShiftAnim, {
          toValue: 4,
          duration: 75,
          useNativeDriver: false,
        }),
        Animated.timing(vhsShiftAnim, {
          toValue: -2,
          duration: 75,
          useNativeDriver: false,
        }),
        Animated.timing(vhsShiftAnim, {
          toValue: 0,
          duration: 110,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      // VHS cassette click-pop in the bottom slot
      Animated.sequence([
        Animated.timing(tapePopAnim, {
          toValue: 1,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.spring(tapePopAnim, {
          toValue: 0,
          friction: 5,
          tension: 140,
          useNativeDriver: false,
        }),
      ]),
      // Cute cat-ear antenna bounce
      Animated.sequence([
        Animated.timing(earWiggleAnim, {
          toValue: 1,
          duration: 110,
          useNativeDriver: false,
        }),
        Animated.timing(earWiggleAnim, {
          toValue: -0.7,
          duration: 120,
          useNativeDriver: false,
        }),
        Animated.spring(earWiggleAnim, {
          toValue: 0,
          friction: 5,
          tension: 120,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }

  function handleCycleChannel() {
    playCrtChannelSwitch();
    setChannel((prev) => ((prev + 1) % 5) as RetroTvChannel);
    triggerSwitchAnimations();
  }

  function handleSelectChannel(target: RetroTvChannel) {
    if (target === channel) {
      handleCycleChannel();
      return;
    }
    playCrtChannelSwitch();
    setChannel(target);
    triggerSwitchAnimations();
  }

  const activeMeta = RETRO_TV_CHANNELS[channel];

  const scanTranslateY = scanSweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 136],
  });
  const leftEarRotate = earWiggleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-10deg", "-18deg", "-28deg"],
  });
  const rightEarRotate = earWiggleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["10deg", "18deg", "28deg"],
  });
  const tapeTranslateY = tapePopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4.5],
  });
  const cozyOrbTranslateY = cozyFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, -5],
  });
  const cozyOrbRotate = cozyFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-3deg", "4deg"],
  });
  const catBobY = cozyFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2.5],
  });
  const ledOpacity = ledPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });
  const steam1Y = steamAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [4, -7],
  });
  const steam1Op = steamAnim1.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.95, 0],
  });
  const steam2Y = steamAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [4, -7],
  });
  const steam2Op = steamAnim2.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.95, 0],
  });

  const channelTag =
    channel === 1
      ? "TELEMETRY.SH"
      : channel === 2
        ? "BYTE_CAT.EXE"
        : channel === 3
          ? "LOFI_MIXER.SYS"
          : channel === 4
            ? "COZY_BREW.MD"
            : activeTrack === "python_basics"
              ? "PYTHON_KERNEL.PY"
              : activeTrack === "algorithms"
                ? "GRAPH_ENGINE.PY"
                : "CLUSTER_MESH.PY";

  const filledSegments = Math.max(
    0,
    Math.min(8, Math.round((progressPercent / 100) * 8)),
  );

  const outerAnimStyle =
    scrollTranslateY && scrollScale && scrollOpacity
      ? {
          transform: [
            { translateY: scrollTranslateY },
            { scale: scrollScale },
          ],
          opacity: scrollOpacity,
        }
      : undefined;

  const leftEarAccent = activePalette.accent;
  const rightEarAccent =
    paletteId === "sakura"
      ? "#6EE7B7"
      : paletteId === "matcha"
        ? "#FFDE59"
        : paletteId === "amber"
          ? "#6EE7B7"
          : "#FF90E8";

  return (
    <Animated.View style={outerAnimStyle}>
      <View style={styles.tvWrap}>
        {/* Twin Byte-Cat Ear Antennas */}
        <View style={styles.antennasRow} pointerEvents="none">
          <Animated.View
            style={[
              styles.catEarAntenna,
              { transform: [{ rotate: leftEarRotate }] },
            ]}
          >
            <View
              style={[styles.catEarInner, { backgroundColor: leftEarAccent }]}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.catEarAntenna,
              { transform: [{ rotate: rightEarRotate }] },
            ]}
          >
            <View
              style={[styles.catEarInner, { backgroundColor: rightEarAccent }]}
            />
          </Animated.View>
        </View>

        {/* Theme-Reactive Bubble CRT Cabinet */}
        <View testID="retro-tv-cabinet" style={styles.bubbleCabinet}>
          {/* Recessed Tube Bezel (Tap screen to flip channel) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Retro CRT TV showing channel ${activeMeta.num}, ${channelTag}. Tap to switch channel`}
            style={({ pressed }) => [
              styles.tubeBezel,
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
            onPress={handleCycleChannel}
          >
            <View style={styles.crtGlass}>
              {/* Glass Corner Reflection Sheen */}
              <View style={styles.glassGlare} pointerEvents="none" />

              {/* Subtle Horizontal Scanline Stripes */}
              <View style={styles.scanlinesLayer} pointerEvents="none">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((lineIdx) => (
                  <View key={lineIdx} style={styles.scanlineStripe} />
                ))}
              </View>

              {/* Moving Phosphor Scanline Sweep */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.scanSweepBeam,
                  {
                    backgroundColor: activeMeta.accent,
                    transform: [{ translateY: scanTranslateY }],
                  },
                ]}
              />

              {/* SMPTE Pastel Color-Bar Glitch Overlay on Switch */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.vhsBarsOverlay,
                  {
                    opacity: vhsGlitchAnim,
                    transform: [{ translateX: vhsShiftAnim }],
                  },
                ]}
              >
                {SMPTE_BAR_COLORS.map((barColor) => (
                  <View
                    key={barColor}
                    style={[styles.vhsBarStripe, { backgroundColor: barColor }]}
                  />
                ))}
              </Animated.View>

              {/* Screen Top Status Strip */}
              <View style={styles.screenTopBar}>
                <Text style={styles.screenTag} numberOfLines={1}>
                  ● {channelTag}
                </Text>
                <Text
                  style={[styles.screenChannelNum, { color: activeMeta.accent }]}
                >
                  CH {activeMeta.num}/05
                </Text>
              </View>

              {/* Live Animated Channel Content */}
              <Animated.View
                style={[
                  styles.screenBody,
                  { transform: [{ translateX: vhsShiftAnim }] },
                ]}
              >
                {channel === 0 && activeTrack === "python_basics" && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeLineLime}>
                      {"def train_skill(dev):"}
                    </Text>
                    <Text style={styles.codeLineYellow}>
                      {"  while dev.curious:"}
                    </Text>
                    <View style={styles.codeCursorRow}>
                      <Text style={styles.codeLinePink}>
                        {"    yield level_up()"}
                      </Text>
                      <Animated.View
                        style={[styles.terminalCursor, { opacity: cursorAnim }]}
                      />
                    </View>
                  </View>
                )}

                {channel === 0 && activeTrack === "algorithms" && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeLineViolet}>
                      {"     [ROOT: 42]"}
                    </Text>
                    <Text style={styles.codeLineYellow}>
                      {"    /          \\"}
                    </Text>
                    <View style={styles.codeCursorRow}>
                      <Text style={styles.codeLineLime}>
                        {"[L: 18]      [R: 89]"}
                      </Text>
                      <Animated.View
                        style={[styles.terminalCursor, { opacity: cursorAnim }]}
                      />
                    </View>
                  </View>
                )}

                {channel === 0 && activeTrack === "system_design" && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeLinePink}>
                      {"[CDN] ──► [LB: NGINX]"}
                    </Text>
                    <Text style={styles.codeLineLime}>
                      {"  ├──► [API_NODE_01]"}
                    </Text>
                    <View style={styles.codeCursorRow}>
                      <Text style={styles.codeLineYellow}>
                        {"  └──► [REDIS_CACHE]"}
                      </Text>
                      <Animated.View
                        style={[styles.terminalCursor, { opacity: cursorAnim }]}
                      />
                    </View>
                  </View>
                )}

                {channel === 1 && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeLineLime}>
                      {`SOLVED: ${completedCount}/${totalCount} MODULES`}
                    </Text>
                    <View style={styles.telemetryBarRow}>
                      <View style={styles.telemetryBarTrack}>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((segIdx) => {
                          const isFilled = segIdx < filledSegments;
                          const isLeading =
                            segIdx === filledSegments && progressPercent < 100;
                          return (
                            <Animated.View
                              key={segIdx}
                              style={[
                                styles.telemetrySeg,
                                isFilled && {
                                  backgroundColor:
                                    segIdx < 4 ? "#B8FF3B" : "#FFDE59",
                                },
                                isLeading && {
                                  backgroundColor: "#38BDF8",
                                  opacity: ledOpacity,
                                },
                              ]}
                            />
                          );
                        })}
                      </View>
                      <Text style={styles.codeLineYellow}>
                        {progressPercent}%
                      </Text>
                    </View>
                    <Text style={styles.codeLinePink}>
                      {progressPercent === 100
                        ? "STATUS: TRACK CLEARED ★"
                        : "STATUS: KERNEL ACTIVE"}
                    </Text>
                  </View>
                )}

                {channel === 2 && (
                  <Animated.View
                    style={[
                      styles.codeBlock,
                      { transform: [{ translateY: catBobY }] },
                    ]}
                  >
                    <Text style={styles.codeLineViolet}>
                      {"  /\\_/\\   BYTE-CAT v2.0"}
                    </Text>
                    <Text style={styles.codeLineLime}>
                      {completedCount > 0
                        ? ' ( ★_★ )  "PURR-FECT!"'
                        : ' ( ^._.^ ) "LET\'S CODE!"'}
                    </Text>
                    <Text style={styles.codeLineYellow}>
                      {"  { _ }   [TAP TV ↻]"}
                    </Text>
                  </Animated.View>
                )}

                {channel === 3 && (
                  <View style={styles.lofiScreenWrap}>
                    <View style={styles.eqRow}>
                      {EQ_BAR_COLORS.map((barColor, idx) => {
                        const anim = eqAnims[idx % eqAnims.length];
                        const barHeight = anim.interpolate({
                          inputRange: [0.25, 1],
                          outputRange: [
                            idx % 2 === 0 ? 8 : 13,
                            idx % 3 === 0 ? 32 : 26,
                          ],
                        });
                        return (
                          <Animated.View
                            key={idx}
                            testID={idx === 0 ? "retro-tv-eq-bar-0" : undefined}
                            style={[
                              styles.eqBar,
                              {
                                backgroundColor: barColor,
                                height: barHeight,
                              },
                            ]}
                          />
                        );
                      })}
                    </View>
                    <Text style={styles.codeLineYellow}>
                      {"♪ LATE NIGHT · 72 BPM"}
                    </Text>
                  </View>
                )}

                {channel === 4 && (
                  <View style={styles.brewScreenRow}>
                    <View style={styles.cupColumn}>
                      <View style={styles.steamRow}>
                        <Animated.Text
                          testID="retro-tv-steam-0"
                          style={[
                            styles.steamChar,
                            {
                              opacity: steam1Op,
                              transform: [{ translateY: steam1Y }],
                            },
                          ]}
                        >
                          ~
                        </Animated.Text>
                        <Animated.Text
                          style={[
                            styles.steamChar,
                            {
                              opacity: steam2Op,
                              transform: [{ translateY: steam2Y }],
                            },
                          ]}
                        >
                          ~
                        </Animated.Text>
                      </View>
                      <View style={styles.matchaCupWrap}>
                        <View style={styles.matchaCupBody} />
                        <View style={styles.matchaCupHandle} />
                      </View>
                    </View>
                    <View style={styles.brewTextCol}>
                      <Text style={styles.codeLinePink}>
                        {"MATCHA + WARM CUP"}
                      </Text>
                      <Text style={styles.codeLineYellow}>
                        {completedCount >= 10
                          ? '"Quiet mastery grows"'
                          : '"Small steps build big"'}
                      </Text>
                      <Text style={styles.codeLineMint} numberOfLines={1}>
                        {nextUpLessonTitle
                          ? `NEXT: ${nextUpLessonTitle.slice(0, 15)}`
                          : "MODE: CALM & CURIOUS ✦"}
                      </Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            </View>
          </Pressable>

          {/* Integrated Glowing VHS / Cassette Deck */}
          <View style={styles.vhsDeck}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Eject and switch VHS channel"
              style={({ pressed }) => [
                styles.vhsSlot,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleCycleChannel}
            >
              <Animated.View
                style={[
                  styles.vhsTapeBar,
                  {
                    backgroundColor: activeMeta.accent,
                    transform: [{ translateY: tapeTranslateY }],
                  },
                ]}
              >
                <View style={styles.vhsTapeSpool} />
                <View style={styles.vhsTapeWindow} />
                <View style={styles.vhsTapeSpool} />
              </Animated.View>
            </Pressable>

            {/* 5 Interactive Channel Pips + Breathing Power LED */}
            <View style={styles.vhsRightCluster}>
              <View style={styles.channelPipsRow}>
                {RETRO_TV_CHANNELS.map((ch) => {
                  const isActive = ch.id === channel;
                  return (
                    <Pressable
                      key={ch.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Switch TV to channel ${ch.num}`}
                      hitSlop={4}
                      onPress={() => handleSelectChannel(ch.id)}
                      style={[
                        styles.channelPip,
                        isActive && {
                          backgroundColor: ch.accent,
                          borderColor: StudioColors.ink,
                          transform: [{ scale: 1.18 }],
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <View style={styles.vhsBadgeRow}>
                <Animated.View
                  style={[
                    styles.vhsLed,
                    {
                      backgroundColor: activeMeta.accent,
                      opacity: ledOpacity,
                    },
                  ]}
                />
                <Text style={styles.vhsBrandText}>VHS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rounded Cushion TV Feet */}
        <View style={styles.tvFeetRow} pointerEvents="none">
          <View style={styles.tvFoot} />
          <View style={styles.tvFoot} />
        </View>

        {/* Tilted Top-Left Track Sticker */}
        <View
          style={[
            styles.topLeftSticker,
            { backgroundColor: activePalette.accent },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.topLeftStickerText}>✦ {trackIconLabel}</Text>
        </View>

        {/* Floating Channel Cozy Charm Orb */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bottomRightCharm,
            {
              transform: [
                { translateY: cozyOrbTranslateY },
                { rotate: cozyOrbRotate },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.cozyFloatOrb,
              {
                backgroundColor: activeMeta.charmBg,
                borderColor: activeMeta.charmBorder,
              },
            ]}
          >
            <StudioIcon name={activeMeta.charmIcon} size={20} />
          </View>
          <Text style={styles.cozyFloatSpark}>✦</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const createStyles = (StudioColors: StudioThemeColors, themeMode: ThemeMode) =>
  StyleSheet.create({
    tvWrap: {
      position: "relative",
      width: 268,
      maxWidth: "100%",
      alignItems: "center",
      paddingTop: 2,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    antennasRow: {
      width: "100%",
      height: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: 42,
      marginBottom: -3,
      zIndex: 1,
    },
    catEarAntenna: {
      width: 15,
      height: 22,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: StudioColors.surfaceHover,
      borderWidth: 2,
      borderBottomWidth: 0,
      borderColor: StudioColors.border,
      alignItems: "center",
      paddingTop: 4,
    },
    catEarInner: {
      width: 5,
      height: 9,
      borderRadius: 4,
    },
    bubbleCabinet: {
      width: "100%",
      backgroundColor: StudioColors.surfaceElevated,
      borderRadius: 22,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      padding: 10,
      gap: 8,
      zIndex: 2,
      ...HardShadow,
    },
    tubeBezel: {
      backgroundColor: StudioColors.codeSurface,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      padding: 5,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    crtGlass: {
      position: "relative",
      backgroundColor: StudioColors.codeBg,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: StudioColors.codeBorder,
      padding: 9,
      minHeight: 102,
      overflow: "hidden",
      justifyContent: "space-between",
      gap: 6,
    },
    glassGlare: {
      position: "absolute",
      top: -22,
      left: -18,
      width: 150,
      height: 54,
      borderRadius: 24,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      transform: [{ rotate: "-12deg" }],
      zIndex: 2,
    },
    scanlinesLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: "space-between",
      opacity: 0.16,
      zIndex: 3,
    },
    scanlineStripe: {
      height: 1,
      backgroundColor: "#000000",
    },
    scanSweepBeam: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 20,
      opacity: 0.08,
      zIndex: 4,
    },
    vhsBarsOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      flexDirection: "row",
      zIndex: 9,
    },
    vhsBarStripe: {
      flex: 1,
      height: "100%",
    },
    screenTopBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: StudioColors.codeBorder,
      paddingBottom: 4,
      gap: 6,
      zIndex: 5,
    },
    screenTag: {
      flex: 1,
      color: "#9B97A8",
      fontSize: 8.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    screenChannelNum: {
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    screenBody: {
      flex: 1,
      justifyContent: "center",
      zIndex: 5,
    },
    codeBlock: {
      gap: 3,
      paddingVertical: 2,
    },
    codeCursorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    terminalCursor: {
      width: 6,
      height: 11,
      borderRadius: 1,
      backgroundColor: "#B8FF3B",
    },
    codeLineLime: {
      color: StudioColors.lime,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    codeLineYellow: {
      color: StudioColors.yellow,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    codeLinePink: {
      color: StudioColors.pink,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    codeLineViolet: {
      color: StudioColors.violet,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    codeLineMint: {
      color: StudioColors.mint,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    telemetryBarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginVertical: 2,
    },
    telemetryBarTrack: {
      flex: 1,
      height: 10,
      backgroundColor: StudioColors.codeSurface,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: StudioColors.codeBorder,
      padding: 1.5,
      flexDirection: "row",
      gap: 2,
    },
    telemetrySeg: {
      flex: 1,
      height: "100%",
      borderRadius: 1,
      backgroundColor: StudioColors.codeBorder,
    },
    lofiScreenWrap: {
      gap: 3,
      paddingVertical: 1,
    },
    eqRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      height: 34,
      gap: 4,
      paddingHorizontal: 2,
      marginBottom: 4,
    },
    eqBar: {
      flex: 1,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
    },
    brewScreenRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      paddingVertical: 2,
    },
    cupColumn: {
      alignItems: "center",
      width: 34,
    },
    steamRow: {
      flexDirection: "row",
      gap: 4,
      height: 12,
      alignItems: "center",
    },
    steamChar: {
      color: "#6EE7B7",
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      lineHeight: 12,
    },
    matchaCupWrap: {
      flexDirection: "row",
      alignItems: "center",
    },
    matchaCupBody: {
      width: 22,
      height: 16,
      backgroundColor: "#6EE7B7",
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    matchaCupHandle: {
      width: 6,
      height: 9,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
      borderWidth: 1.5,
      borderLeftWidth: 0,
      borderColor: "#6EE7B7",
      marginLeft: -1,
    },
    brewTextCol: {
      flex: 1,
      gap: 2,
    },
    vhsDeck: {
      backgroundColor:
        themeMode === "light" ? StudioColors.surface : StudioColors.codeSurface,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: StudioColors.border,
      paddingHorizontal: 8,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    vhsSlot: {
      flex: 1,
      height: 16,
      backgroundColor: StudioColors.codeBg,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: StudioColors.codeBorder,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    vhsTapeBar: {
      width: "86%",
      height: 8,
      borderRadius: 2,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 6,
    },
    vhsTapeSpool: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: StudioColors.ink,
    },
    vhsTapeWindow: {
      width: 22,
      height: 3,
      borderRadius: 1,
      backgroundColor: "rgba(17, 17, 17, 0.45)",
    },
    vhsRightCluster: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    channelPipsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3.5,
    },
    channelPip: {
      width: 7,
      height: 7,
      borderRadius: 2,
      backgroundColor:
        themeMode === "light"
          ? StudioColors.borderSubtle
          : StudioColors.codeBorder,
      borderWidth: 1,
      borderColor: StudioColors.border,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    vhsBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    vhsLed: {
      width: 7,
      height: 7,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: StudioColors.ink,
    },
    vhsBrandText: {
      color: themeMode === "light" ? StudioColors.textPrimary : "#F4F0E6",
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    tvFeetRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 34,
      marginTop: -2,
      zIndex: 1,
    },
    tvFoot: {
      width: 26,
      height: 8,
      backgroundColor:
        themeMode === "light"
          ? StudioColors.textSecondary
          : StudioColors.codeSurface,
      borderWidth: 2,
      borderTopWidth: 0,
      borderColor: StudioColors.border,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    topLeftSticker: {
      position: "absolute",
      top: 10,
      left: -10,
      backgroundColor: StudioColors.yellow,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      transform: [{ rotate: "-8deg" }],
      zIndex: 10,
      ...HardShadowSm,
    },
    topLeftStickerText: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    bottomRightCharm: {
      position: "absolute",
      bottom: -10,
      right: -12,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    cozyFloatOrb: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
    },
    cozyFloatSpark: {
      position: "absolute",
      top: -3,
      right: -1,
      fontSize: 10,
      fontWeight: "900",
      color: "#FFDE59",
    },
  });
