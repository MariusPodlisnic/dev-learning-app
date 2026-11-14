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
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import { Text } from "./StudioIcon";

export type MascotOutfitId = 1 | 2 | 3 | 4;

interface OutfitMeta {
  id: MascotOutfitId;
  shortLabel: string;
  tag: string;
  moodBadge: string;
  accent: string;
  quotes: string[];
  perkLabel: string;
  leftCardTop: string;
  leftCardSub: string;
  rightCardTop: string;
  rightCardSub: string;
}

const OUTFITS: Record<MascotOutfitId, OutfitMeta> = {
  1: {
    id: 1,
    shortLabel: "🕶️ HOLO",
    tag: "🐾 BYTE-CAT // HOLO-ARCHITECT V3.0",
    moodBadge: "LVL 99 PRO",
    accent: "#38BDF8",
    quotes: [
      '"Wearing my AR Holo-Visor! Ready to visualize O(1) hash maps and system shards?"',
      '"Purr-fect O(1) lookup! Step through 30+ interactive Algo Labs with Pro!"',
      '"Why guess time complexity when you can watch pointers converge live?"',
    ],
    perkLabel: "⚡ Pro Perk: Holographic Step-by-Step Algorithm Visualizer",
    leftCardTop: "O(1) HASH",
    leftCardSub: "✓ PASS 2ms",
    rightCardTop: "👑 PRO LAB",
    rightCardSub: "+500 XP",
  },
  2: {
    id: 2,
    shortLabel: "🎧 DJ",
    tag: "🎧 BYTE-CAT // CYBER-DECK STUDIO DJ",
    moodBadge: "120 WPM FLOW",
    accent: "#34D399",
    quotes: [
      '"Dropping calm kalimba chords & clean Python functions at 120 WPM!"',
      '"Zero setup required — Python 3.11 runs right inside your browser!"',
      '"Can you beat my 12x combo multiplier in 60-Second Syntax Blitz?"',
    ],
    perkLabel: "🎵 Pro Perk: Cozy Kalimba Synth SFX + Unlimited 60s Blitz",
    leftCardTop: "def run():",
    leftCardSub: "🐍 PY 3.11",
    rightCardTop: "⚡ 60s BLITZ",
    rightCardSub: "COMBO x12",
  },
  3: {
    id: 3,
    shortLabel: "⚔️ SENSEI",
    tag: "⚔️ BYTE-CAT // DOJO BUG-SLAYER SENSEI",
    moodBadge: "100-BUG ELITE",
    accent: "#FFDE59",
    quotes: [
      '"100 Bugs enter the arena... 0 Bugs leave! Claim your Centurion Trophy!"',
      '"Mutable default arguments? Off-by-one loops? My jade katana slices them all!"',
      '"Unlock all 6 Hard Elite gold trophies in the new Achievements Hall!"',
    ],
    perkLabel: "🪲 Pro Perk: Unlimited Bug Hunt Arena + Hard Elite Trophies",
    leftCardTop: "🐍 TRACKS",
    leftCardSub: "72+ MODULES",
    rightCardTop: "🪲 100 BUGS",
    rightCardSub: "CENTURION",
  },
  4: {
    id: 4,
    shortLabel: "🚀 ASTRO",
    tag: "🚀 BYTE-CAT // ASTRO-CORE COMMANDER",
    moodBadge: "HYPERSCALE",
    accent: "#F472B6",
    quotes: [
      '"Scaling distributed Python clusters to 100,000 req/sec in zero gravity!"',
      '"Load balancers, Redis LRU caches, and consistent sharding — all hands-on!"',
      '"Complete any track to mint your verifiable DevLearn Career Diploma!"',
    ],
    perkLabel: "🏗️ Pro Perk: Full System Architecture Track + Verified Diplomas",
    leftCardTop: "REDIS LRU",
    leftCardSub: "99.9% HIT",
    rightCardTop: "SHARD // 04",
    rightCardSub: "100K REQ/S",
  },
};

export default function ExploreByteCatStage() {
  const [outfitId, setOutfitId] = useState<MascotOutfitId>(1);
  const [quoteIdx, setQuoteIdx] = useState<number>(0);
  const [pokeCount, setPokeCount] = useState<number>(0);

  const [floatAnim] = useState(() => new Animated.Value(0));
  const [orbitAnim] = useState(() => new Animated.Value(0));
  const [pawAnim] = useState(() => new Animated.Value(0));
  const [bounceAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    const orbitLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbitAnim, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(orbitAnim, {
          toValue: 0,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    const pawLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pawAnim, {
          toValue: 1,
          duration: 320,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pawAnim, {
          toValue: 0,
          duration: 320,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );

    floatLoop.start();
    orbitLoop.start();
    pawLoop.start();

    return () => {
      floatLoop.stop();
      orbitLoop.stop();
      pawLoop.stop();
    };
  }, [floatAnim, orbitAnim, pawAnim]);

  const outfit = OUTFITS[outfitId];
  const currentQuote = outfit.quotes[quoteIdx % outfit.quotes.length];

  function triggerHappyBounce() {
    bounceAnim.setValue(0.94);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: false,
    }).start();
  }

  function handleSelectOutfit(nextId: MascotOutfitId) {
    playKeyClick();
    setOutfitId(nextId);
    setQuoteIdx(0);
    triggerHappyBounce();
  }

  function handleCycleOutfit() {
    const nextId = ((outfitId % 4) + 1) as MascotOutfitId;
    handleSelectOutfit(nextId);
  }

  function handlePokeCat() {
    playSuccessChime();
    setQuoteIdx((prev) => (prev + 1) % outfit.quotes.length);
    setPokeCount((prev) => prev + 1);
    triggerHappyBounce();
  }

  const headTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const leftCardY = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const rightCardY = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 4],
  });

  const leftPawY = pawAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const rightPawY = pawAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
  });

  return (
    <View style={styles.stageCard}>
      {/* Top Cartridge Header */}
      <View style={styles.topHeaderBar}>
        <Text style={[styles.stageTagText, { color: outfit.accent }]}>
          {outfit.tag}
        </Text>
        <View
          style={[styles.moodPill, { backgroundColor: outfit.accent }]}
        >
          <Text style={styles.moodPillText}>{outfit.moodBadge}</Text>
        </View>
      </View>

      {/* 4 Outfit Switcher Pills */}
      <View style={styles.outfitTabsRow}>
        {([1, 2, 3, 4] as const).map((id) => {
          const meta = OUTFITS[id];
          const isSelected = outfitId === id;
          return (
            <Pressable
              key={id}
              onPress={() => handleSelectOutfit(id)}
              style={[
                styles.outfitTabBtn,
                isSelected && {
                  backgroundColor: meta.accent,
                  borderColor: StudioColors.ink,
                },
              ]}
            >
              <Text
                style={[
                  styles.outfitTabText,
                  isSelected && { color: StudioColors.ink },
                ]}
              >
                {meta.shortLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Interactive Cat Viewport */}
      <Pressable onPress={handlePokeCat} style={styles.viewport}>
        {/* Speech Bubble Toast */}
        <View
          style={[
            styles.speechBubble,
            { borderColor: outfit.accent },
          ]}
        >
          <Text style={styles.speechText}>{currentQuote}</Text>
        </View>

        {/* Orbiting Left Hologram Badge */}
        <Animated.View
          style={[
            styles.holoCardLeft,
            {
              borderColor: outfit.accent,
              transform: [{ translateY: leftCardY }],
            },
          ]}
        >
          <Text style={[styles.holoCardTitle, { color: outfit.accent }]}>
            {outfit.leftCardTop}
          </Text>
          <Text style={styles.holoCardSub}>{outfit.leftCardSub}</Text>
        </Animated.View>

        {/* Orbiting Right Hologram Badge */}
        <Animated.View
          style={[
            styles.holoCardRight,
            {
              borderColor: StudioColors.yellow,
              transform: [{ translateY: rightCardY }],
            },
          ]}
        >
          <Text style={[styles.holoCardTitle, { color: StudioColors.yellow }]}>
            {outfit.rightCardTop}
          </Text>
          <Text style={styles.holoCardSub}>{outfit.rightCardSub}</Text>
        </Animated.View>

        {/* Animated Byte-Cat Character Art */}
        <Animated.View
          style={[
            styles.catCharacterWrap,
            { transform: [{ scale: bounceAnim }] },
          ]}
        >
          {/* Holo Base Projection Ring */}
          <View
            style={[
              styles.holoBaseRing,
              { borderColor: outfit.accent },
            ]}
          />

          {/* Outfit 1: Gold & Pink Pro Cape */}
          {outfitId === 1 && <View style={styles.proCape} />}

          {/* Outfit 3: Jade Debug Katana Behind Back */}
          {outfitId === 3 && (
            <View style={styles.jadeKatanaWrap}>
              <View style={styles.jadeKatanaBlade} />
              <View style={styles.jadeKatanaHilt} />
            </View>
          )}

          {/* Cat Torso / Outfit Body */}
          <View
            style={[
              styles.catTorso,
              outfitId === 2 && { backgroundColor: "#34D399" },
              outfitId === 3 && {
                backgroundColor: "#1E293B",
                borderColor: "#FFDE59",
              },
              outfitId === 4 && { backgroundColor: "#F8FAFC" },
            ]}
          >
            <View
              style={[
                styles.catBellyPatch,
                outfitId === 3 && {
                  backgroundColor: "#0F172A",
                  borderColor: "#FFDE59",
                },
                outfitId === 4 && {
                  backgroundColor: "#38BDF8",
                  borderRadius: 999,
                },
              ]}
            >
              <Text
                style={[
                  styles.catBellySymbol,
                  outfitId === 3 && { color: "#FFDE59" },
                ]}
              >
                {outfitId === 1
                  ? "</>"
                  : outfitId === 2
                    ? "PRO"
                    : outfitId === 3
                      ? "100X"
                      : "CORE"}
              </Text>
            </View>
          </View>

          {/* Floating Animated Cat Head */}
          <Animated.View
            style={[
              styles.catHeadGroup,
              { transform: [{ translateY: headTranslateY }] },
            ]}
          >
            {/* Outfit 4: Translucent Zero-G Space Helmet Dome */}
            {outfitId === 4 && <View style={styles.astroHelmetDome} />}

            {/* Outfit 2: Studio Headphone Arc */}
            {outfitId === 2 && <View style={styles.headphoneArc} />}

            {/* Left & Right Cat Ears */}
            <View style={styles.earsRow}>
              <View style={styles.earOuterLeft}>
                <View style={styles.earInner} />
              </View>
              <View style={styles.earOuterRight}>
                <View style={styles.earInner} />
              </View>
            </View>

            {/* Outfit 1: Gold Pro Crown */}
            {outfitId === 1 && (
              <View style={styles.proCrownBadge}>
                <Text style={styles.proCrownText}>👑</Text>
              </View>
            )}

            {/* Main Cat Head Box */}
            <View style={styles.catHeadBox}>
              {/* Outfit 3: Gold Dojo Sensei Headband */}
              {outfitId === 3 && (
                <View style={styles.senseiHeadband}>
                  <View style={styles.senseiHeadbandGem} />
                </View>
              )}

              {/* Outfit 2: Pink Studio Ear Cups */}
              {outfitId === 2 && (
                <>
                  <View style={styles.earCupLeft} />
                  <View style={styles.earCupRight} />
                </>
              )}

              {/* Eyes or AR Cyber Visor */}
              {outfitId === 1 ? (
                <View style={styles.arCyberVisor}>
                  <View style={styles.arVisorEyeLeft} />
                  <View style={styles.arVisorCenterDot} />
                  <View style={styles.arVisorEyeRight} />
                </View>
              ) : (
                <View style={styles.eyesRow}>
                  <View style={styles.catEye}>
                    <View style={styles.catEyeSparkle} />
                  </View>
                  <View style={styles.catEye}>
                    <View style={styles.catEyeSparkle} />
                  </View>
                </View>
              )}

              {/* Whiskers & Cute Mouth */}
              <View style={styles.muzzleRow}>
                <View style={styles.cheekBlush} />
                <View style={styles.noseTriangle} />
                <View style={styles.cheekBlush} />
              </View>
              <Text style={styles.catSmileText}>ω</Text>
            </View>
          </Animated.View>

          {/* Cyber-Deck / Holo Keyboard Desk */}
          <View style={styles.cyberDeskBar}>
            <View
              style={[styles.deskKeycap, { backgroundColor: "#FFDE59" }]}
            />
            <View
              style={[styles.deskKeycap, { backgroundColor: "#38BDF8" }]}
            />
            <View
              style={[styles.deskKeycap, { backgroundColor: "#F472B6" }]}
            />
            <View
              style={[styles.deskKeycap, { backgroundColor: "#34D399" }]}
            />
          </View>

          {/* Animated Tapping Paws */}
          <View style={styles.pawsRow}>
            <Animated.View
              style={[
                styles.catPaw,
                { transform: [{ translateY: leftPawY }] },
              ]}
            />
            <Animated.View
              style={[
                styles.catPaw,
                { transform: [{ translateY: rightPawY }] },
              ]}
            />
          </View>
        </Animated.View>

        {/* Interactive Tap Prompt Pill */}
        <View style={styles.tapHintPill}>
          <Text style={styles.tapHintText}>
            ✨ TAP CAT TO INTERACT{" "}
            {pokeCount > 0 ? `(+${pokeCount * 10} DOPAMINE XP)` : ""}
          </Text>
        </View>
      </Pressable>

      {/* Bottom Cartridge Perk & Cycle Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.perkCaptionText} numberOfLines={1}>
          {outfit.perkLabel}
        </Text>
        <Pressable onPress={handleCycleOutfit} style={styles.nextCatBtn}>
          <Text style={styles.nextCatBtnText}>NEXT CAT ↻</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stageCard: {
    width: "100%",
    backgroundColor: "#0C0E17",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    borderRadius: 16,
    overflow: "hidden",
    ...HardShadow,
  },
  topHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#191E31",
    borderBottomWidth: 2,
    borderColor: StudioColors.ink,
    gap: 8,
  },
  stageTagText: {
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
    flex: 1,
  },
  moodPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  moodPillText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 9.5,
    fontWeight: "900",
  },
  outfitTabsRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#121626",
    borderBottomWidth: 1.5,
    borderColor: "#232A42",
  },
  outfitTabBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "#1B2138",
    borderWidth: 1.5,
    borderColor: "#2E3654",
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  outfitTabText: {
    color: "#E2E8F0",
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  viewport: {
    height: 252,
    width: "100%",
    backgroundColor: "#0F1322",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 28,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  speechBubble: {
    position: "absolute",
    top: 8,
    left: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#1B2138",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  speechText: {
    color: "#FFDE59",
    fontFamily: MonoFont,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  holoCardLeft: {
    position: "absolute",
    left: 10,
    top: 66,
    backgroundColor: "#141A2E",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    zIndex: 5,
  },
  holoCardRight: {
    position: "absolute",
    right: 10,
    top: 66,
    backgroundColor: "#1D1830",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    zIndex: 5,
  },
  holoCardTitle: {
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
  holoCardSub: {
    color: "#34D399",
    fontFamily: MonoFont,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  catCharacterWrap: {
    width: 170,
    height: 158,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  holoBaseRing: {
    position: "absolute",
    bottom: 2,
    width: 156,
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
  },
  proCape: {
    position: "absolute",
    bottom: 18,
    width: 122,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#F472B6",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
  },
  jadeKatanaWrap: {
    position: "absolute",
    right: 6,
    bottom: 36,
    width: 14,
    height: 105,
    transform: [{ rotate: "28deg" }],
    alignItems: "center",
  },
  jadeKatanaBlade: {
    width: 9,
    height: 82,
    backgroundColor: "#34D399",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 4,
  },
  jadeKatanaHilt: {
    width: 20,
    height: 8,
    backgroundColor: "#FFDE59",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 3,
  },
  catTorso: {
    width: 92,
    height: 58,
    borderRadius: 24,
    backgroundColor: "#FF9F1C",
    borderWidth: 3,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    zIndex: 3,
  },
  catBellyPatch: {
    width: 54,
    height: 36,
    borderRadius: 14,
    backgroundColor: "#FFF3B0",
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  catBellySymbol: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  catHeadGroup: {
    position: "absolute",
    bottom: 54,
    alignItems: "center",
    zIndex: 6,
  },
  astroHelmetDome: {
    position: "absolute",
    top: -10,
    width: 128,
    height: 98,
    borderRadius: 999,
    backgroundColor: "rgba(56, 189, 248, 0.14)",
    borderWidth: 2,
    borderColor: "#38BDF8",
    zIndex: 10,
    pointerEvents: "none",
  },
  headphoneArc: {
    position: "absolute",
    top: -6,
    width: 118,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 5,
    borderColor: "#FFDE59",
    borderBottomWidth: 0,
  },
  earsRow: {
    width: 96,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: -8,
    zIndex: 1,
  },
  earOuterLeft: {
    width: 26,
    height: 26,
    backgroundColor: "#FF9F1C",
    borderWidth: 3,
    borderColor: StudioColors.ink,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 14,
    transform: [{ rotate: "-14deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  earOuterRight: {
    width: 26,
    height: 26,
    backgroundColor: "#FF9F1C",
    borderWidth: 3,
    borderColor: StudioColors.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 6,
    transform: [{ rotate: "14deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  earInner: {
    width: 12,
    height: 12,
    backgroundColor: "#F472B6",
    borderRadius: 3,
  },
  proCrownBadge: {
    position: "absolute",
    top: -14,
    zIndex: 9,
  },
  proCrownText: {
    fontSize: 18,
  },
  catHeadBox: {
    width: 104,
    height: 68,
    borderRadius: 28,
    backgroundColor: "#FF9F1C",
    borderWidth: 3,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
    paddingTop: 6,
  },
  senseiHeadband: {
    position: "absolute",
    top: 8,
    width: 100,
    height: 12,
    backgroundColor: "#FFDE59",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  senseiHeadbandGem: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FB7185",
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  earCupLeft: {
    position: "absolute",
    left: -12,
    top: 16,
    width: 16,
    height: 30,
    borderRadius: 7,
    backgroundColor: "#F472B6",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
  },
  earCupRight: {
    position: "absolute",
    right: -12,
    top: 16,
    width: 16,
    height: 30,
    borderRadius: 7,
    backgroundColor: "#F472B6",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
  },
  arCyberVisor: {
    width: 88,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#0B132B",
    borderWidth: 2,
    borderColor: "#38BDF8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  arVisorEyeLeft: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#34D399",
  },
  arVisorCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFDE59",
  },
  arVisorEyeRight: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#38BDF8",
  },
  eyesRow: {
    flexDirection: "row",
    width: 58,
    justifyContent: "space-between",
    marginTop: 6,
  },
  catEye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: StudioColors.ink,
    padding: 2,
  },
  catEyeSparkle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  muzzleRow: {
    flexDirection: "row",
    width: 64,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  cheekBlush: {
    width: 10,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FB7185",
  },
  noseTriangle: {
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: StudioColors.ink,
  },
  catSmileText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 12,
    fontWeight: "900",
    marginTop: -4,
  },
  cyberDeskBar: {
    position: "absolute",
    bottom: 4,
    width: 136,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#1E293B",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    zIndex: 4,
  },
  deskKeycap: {
    width: 22,
    height: 7,
    borderRadius: 2,
  },
  pawsRow: {
    position: "absolute",
    bottom: 14,
    width: 76,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 7,
  },
  catPaw: {
    width: 22,
    height: 14,
    borderRadius: 8,
    backgroundColor: "#FF9F1C",
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
  },
  tapHintPill: {
    position: "absolute",
    bottom: 5,
    backgroundColor: "rgba(21, 25, 41, 0.92)",
    borderWidth: 1,
    borderColor: "#38BDF8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tapHintText: {
    color: "#38BDF8",
    fontFamily: MonoFont,
    fontSize: 9.5,
    fontWeight: "900",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#151929",
    borderTopWidth: 2,
    borderColor: StudioColors.ink,
    gap: 8,
  },
  perkCaptionText: {
    color: "#E2E8F0",
    fontFamily: MonoFont,
    fontSize: 10.5,
    fontWeight: "800",
    flex: 1,
  },
  nextCatBtn: {
    backgroundColor: "#FFDE59",
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  nextCatBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
  },
});
