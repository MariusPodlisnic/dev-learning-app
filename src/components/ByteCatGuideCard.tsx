import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import { readLocalJson, writeLocalJson } from "../types/lesson";
import { playKeyClick } from "../utils/soundEffects";

const BYTE_CAT_IMAGE = require("../../assets/images/byte-cat.jpg");
const STORAGE_BYTECAT_QUOTE_KEY = "devlearn_bytecat_quote_state_v1";

export interface ByteCatQuote {
  id: number;
  quote: string;
  author: string;
  catNote: string;
  moodBadge: string;
  accentBg: string;
}

export const BYTE_CAT_QUOTES: ByteCatQuote[] = [
  {
    id: 1,
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    catNote: "Paws off the keyboard for 10 seconds—sketch your plan first, then pounce!",
    moodBadge: "=^._.^= STRATEGIC PAWS",
    accentBg: "#FFDE59",
  },
  {
    id: 2,
    quote: "Every master programmer was once a beginner who refused to quit on a syntax error.",
    author: "Byte-Cat Wisdom",
    catNote: "Red console text isn't failure—it's just the compiler meowing for attention.",
    moodBadge: "⚡ RESILIENT CODER",
    accentBg: "#A3E635",
  },
  {
    id: 3,
    quote: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    catNote: "If a 3-line loop does the job clearly, you don't need a 20-line hairball!",
    moodBadge: "✦ CLEAN SYNTAX",
    accentBg: "#6EE7B7",
  },
  {
    id: 4,
    quote: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    catNote: "Pass Test Case #1 first! We can groom and optimize the code after it runs.",
    moodBadge: "🚀 SHIP IT MODE",
    accentBg: "#FF90E8",
  },
  {
    id: 5,
    quote: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    catNote: "Even one 5-minute module today keeps your coding claws razor sharp!",
    moodBadge: "🐾 CLAWS ON KEYS",
    accentBg: "#FFDE59",
  },
  {
    id: 6,
    quote: "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
    catNote: "Reading docs is nice, but typing code into the console is where the magic clicks.",
    moodBadge: "⌨️ KEYCAP HERO",
    accentBg: "#C4B5FD",
  },
  {
    id: 7,
    quote: "Debugging is twice as hard as writing the code in the first place.",
    author: "Brian Kernighan",
    catNote: "When in doubt, drop a print() statement and follow the trail of pawprints.",
    moodBadge: "🔍 BUG STALKER",
    accentBg: "#6EE7B7",
  },
  {
    id: 8,
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    catNote: "1 module a day = 365 solved challenges a year. Keep that streak purring!",
    moodBadge: "🔥 STREAK GUARDIAN",
    accentBg: "#A3E635",
  },
  {
    id: 9,
    quote: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    catNote: "Pick variable names so clear that future-you will give present-you a treat.",
    moodBadge: "★ READABLE CODE",
    accentBg: "#FF90E8",
  },
  {
    id: 10,
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    catNote: "Your future teammates (and cats) appreciate clean indentation!",
    moodBadge: "💎 CRAFT MODE",
    accentBg: "#FFDE59",
  },
  {
    id: 11,
    quote: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
    catNote: "Every bug you squash today is a pattern you'll spot in 2 seconds tomorrow.",
    moodBadge: "⚡ XP GAINED",
    accentBg: "#C4B5FD",
  },
  {
    id: 12,
    quote: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
    catNote: "Check your edge cases (empty lists & zeroes) before they ambush you!",
    moodBadge: "🛡️ EDGE CASE READY",
    accentBg: "#6EE7B7",
  },
  {
    id: 13,
    quote: "Consistency beats intensity when you're building a superpower.",
    author: "Byte-Cat Protocol // 07",
    catNote: "Got 60 seconds? Knock out today's Warm-Up or a quick module to level up!",
    moodBadge: "=^._.^= DAILY BOOST",
    accentBg: "#A3E635",
  },
  {
    id: 14,
    quote: "Knowledge is power, but applied knowledge is a career.",
    author: "Developer Proverb",
    catNote: "Each node you unlock on this Skill Map is a real tool in your engineering kit.",
    moodBadge: "🎯 SKILL BUILDER",
    accentBg: "#FFDE59",
  },
];

const TRACK_TIPS: Record<string, string> = {
  python_basics:
    "Start with variables & loops—every tiny script builds muscle memory.",
  algorithms:
    "Look for the pattern first (pointers, window, or hash) before coding.",
  system_design:
    "Think about bottlenecks: caches, queues, and safe fallbacks keep apps fast.",
};

const PET_REACTIONS = [
  "PURR MODE ★",
  "PAWS READY 🐾",
  "CODING FOCUS ⚡",
  "HIGH FIVE! ✨",
];

interface ByteCatGuideCardProps {
  completedCount: number;
  totalCount: number;
  activeTrack?: string;
  activeTrackLabel: string;
  activeTrackAccent?: string;
  totalXp?: number;
  streakCount?: number;
  nextLessonTitle?: string;
  onPressNextLesson?: () => void;
}

export default function ByteCatGuideCard({
  completedCount,
  totalCount,
  activeTrack = "python_basics",
  activeTrackLabel,
  activeTrackAccent = StudioColors.yellow,
  totalXp = 0,
  streakCount = 0,
  nextLessonTitle,
  onPressNextLesson,
}: ByteCatGuideCardProps) {
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [petCount, setPetCount] = useState<number>(0);
  const [avatarHovered, setAvatarHovered] = useState<boolean>(false);
  const [bounceAnim] = useState(() => new Animated.Value(1));
  const [hoverAnim] = useState(() => new Animated.Value(1));
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [appStateValue, setAppStateValue] = useState<string>(
    AppState.currentState || "active",
  );

  useEffect(() => {
    const idleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    idleLoop.start();
    return () => idleLoop.stop();
  }, [floatAnim]);

  useEffect(() => {
    Animated.spring(hoverAnim, {
      toValue: avatarHovered ? 1.04 : 1,
      friction: 6,
      tension: 150,
      useNativeDriver: false,
    }).start();
  }, [avatarHovered, hoverAnim]);

  const avatarScale = Animated.multiply(bounceAnim, hoverAnim);

  const triggerBounce = useCallback(() => {
    bounceAnim.setValue(0.92);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 150,
      useNativeDriver: false,
    }).start();
  }, [bounceAnim]);

  const advanceToFreshQuote = useCallback(
    (playAudio = false) => {
      if (playAudio) {
        playKeyClick();
        triggerBounce();
        setPetCount((c) => c + 1);
      }
      setQuoteIndex((prev) => {
        // Pick a new quote index different from the current one
        const offset =
          1 + Math.floor(Math.random() * (BYTE_CAT_QUOTES.length - 1));
        const nextIdx = (prev + offset) % BYTE_CAT_QUOTES.length;
        writeLocalJson(STORAGE_BYTECAT_QUOTE_KEY, {
          lastIndex: nextIdx,
          updatedAt: Date.now(),
        });
        return nextIdx;
      });
    },
    [triggerBounce],
  );

  // On app open / mount: load previous quote index and advance by 1+ so every reopen shows a new quote
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = readLocalJson<{ lastIndex?: number }>(
        STORAGE_BYTECAT_QUOTE_KEY,
        {},
      );
      const prevIdx =
        typeof saved.lastIndex === "number" ? saved.lastIndex : -1;
      const nextIdx = (prevIdx + 1) % BYTE_CAT_QUOTES.length;
      setQuoteIndex(nextIdx);
      writeLocalJson(STORAGE_BYTECAT_QUOTE_KEY, {
        lastIndex: nextIdx,
        updatedAt: Date.now(),
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Also advance to a fresh quote whenever the user reopens/foregrounds the app or tab
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          advanceToFreshQuote(false);
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    }

    const sub = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateValue.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        advanceToFreshQuote(false);
      }
      setAppStateValue(nextAppState);
    });

    return () => {
      sub.remove();
    };
  }, [advanceToFreshQuote, appStateValue]);

  const currentQuote =
    BYTE_CAT_QUOTES[quoteIndex] || BYTE_CAT_QUOTES[0];
  const trackPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const mascotRank =
    completedCount >= 10
      ? "ARCHITECT CAT"
      : completedCount >= 5
        ? "CODE STALKER"
        : completedCount >= 1
          ? "PAW CODER"
          : "NEW COMPANION";
  const petReactionLabel =
    petCount > 0
      ? PET_REACTIONS[(petCount - 1) % PET_REACTIONS.length]
      : "TAP CAT FOR TIP";
  const trackTip =
    TRACK_TIPS[activeTrack] || TRACK_TIPS.python_basics;

  const guideStatusText =
    totalCount > 0 && completedCount === totalCount
      ? `Purr-fect! All ${totalCount} ${activeTrackLabel} lessons cleared!`
      : completedCount === 0
        ? `Ready to guide you through ${activeTrackLabel}!`
        : `${completedCount}/${totalCount} solved (${trackPct}%) in ${activeTrackLabel}`;

  return (
    <View style={styles.card}>
      {/* Top Companion Ribbon */}
      <View
        style={[
          styles.companionTopBar,
          { backgroundColor: activeTrackAccent },
        ]}
      >
        <View style={styles.companionBarLeft}>
          <View style={styles.liveDotBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveDotText}>CO-PILOT ONLINE</Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>★ {mascotRank}</Text>
          </View>
        </View>
        <View style={styles.companionBarRight}>
          {streakCount > 0 && (
            <View style={styles.telemetryChip}>
              <Text style={styles.telemetryChipText}>🔥 {streakCount}D</Text>
            </View>
          )}
          <View style={styles.telemetryChip}>
            <Text style={styles.telemetryChipText}>⚡ {totalXp} XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBodyRow}>
        {/* Left Column: Larger Animated Byte-Cat Stage */}
        <Pressable
          style={({ pressed }) => [
            styles.avatarColumn,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onHoverIn={() => setAvatarHovered(true)}
          onHoverOut={() => setAvatarHovered(false)}
          onPress={() => advanceToFreshQuote(true)}
        >
          <View
            style={[
              styles.avatarStageHalo,
              { backgroundColor: currentQuote.accentBg },
            ]}
          >
            <Animated.View
              style={[
                styles.avatarFrame,
                {
                  transform: [
                    { translateY: floatAnim },
                    { scale: avatarScale },
                  ],
                },
              ]}
            >
              <Image
                source={BYTE_CAT_IMAGE}
                style={styles.avatarImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </Animated.View>
          </View>

          <View style={styles.nameplatePill}>
            <Text style={styles.nameplateText}>BYTE-CAT</Text>
          </View>
          <View style={styles.petReactionPill}>
            <Text style={styles.petReactionText}>{petReactionLabel}</Text>
          </View>
        </Pressable>

        {/* Right Column: Interactive Companion Briefing & Quote Bubble */}
        <View style={styles.speechBubble}>
          {/* Top Header Bar inside Speech Bubble */}
          <View style={styles.bubbleTopRow}>
            <View style={styles.bubbleBadgeGroup}>
              <View
                style={[
                  styles.moodSticker,
                  { backgroundColor: currentQuote.accentBg },
                ]}
              >
                <Text style={styles.moodStickerText}>
                  {currentQuote.moodBadge}
                </Text>
              </View>
              <Text style={styles.quoteCounterText}>
                #{String(currentQuote.id).padStart(2, "0")}/
                {String(BYTE_CAT_QUOTES.length).padStart(2, "0")}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.nextQuoteBtn,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onPress={() => advanceToFreshQuote(true)}
            >
              <Text style={styles.nextQuoteBtnText}>NEW WISDOM ↻</Text>
            </Pressable>
          </View>

          {/* Main Inspirational Quote */}
          <View style={styles.quoteBodyWrap}>
            <Text style={styles.quoteText}>
              &ldquo;{currentQuote.quote}&rdquo;
            </Text>
            <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
          </View>

          {/* Byte-Cat's Track Tip + Personal Note */}
          <View style={styles.catNoteBox}>
            <View style={styles.catNoteHeaderRow}>
              <Text style={styles.catNotePrefix}>🐾 BYTE-CAT BRIEFING</Text>
              <Text style={styles.catNoteTrackTag}>{activeTrackLabel}</Text>
            </View>
            <Text style={styles.catNoteText}>{trackTip}</Text>
            <Text style={styles.catNoteSubText}>{currentQuote.catNote}</Text>
          </View>

          {/* Progress Strip + Quick Jump to Next Mission */}
          <View style={styles.guideFooterRow}>
            <View style={styles.guideProgressWrap}>
              <Text style={styles.guideStatusText} numberOfLines={1}>
                ● {guideStatusText}
              </Text>
              <View style={styles.miniTrackMeterBg}>
                <View
                  style={[
                    styles.miniTrackMeterFill,
                    {
                      width: `${Math.max(trackPct, 4)}%`,
                      backgroundColor: activeTrackAccent,
                    },
                  ]}
                />
              </View>
            </View>

            {nextLessonTitle && onPressNextLesson && (
              <Pressable
                style={({ pressed }) => [
                  styles.jumpMissionChip,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onPress={onPressNextLesson}
              >
                <Text style={styles.jumpMissionChipText} numberOfLines={1}>
                  ▶ {nextLessonTitle.toUpperCase()} →
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: StudioColors.border,
    marginBottom: 20,
    overflow: "hidden",
    ...HardShadow,
  },
  companionTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.ink,
  },
  companionBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  companionBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rankBadge: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rankBadgeText: {
    color: StudioColors.textPrimary,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  telemetryChip: {
    backgroundColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  telemetryChipText: {
    color: StudioColors.yellow,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  cardBodyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
    flexWrap: "wrap",
  },
  avatarColumn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  avatarStageHalo: {
    padding: 7,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  avatarFrame: {
    width: 122,
    height: 122,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    backgroundColor: StudioColors.surfaceElevated,
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    width: 118,
    height: 118,
  },
  liveDotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A3E635",
  },
  liveDotText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  nameplatePill: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    marginTop: 2,
  },
  nameplateText: {
    color: StudioColors.ink,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  petReactionPill: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  petReactionText: {
    color: StudioColors.textSecondary,
    fontSize: 8.5,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  speechBubble: {
    flex: 1,
    minWidth: 250,
    backgroundColor: StudioColors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 14,
    gap: 10,
  },
  bubbleTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  bubbleBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  moodSticker: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  moodStickerText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  quoteCounterText: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  nextQuoteBtn: {
    backgroundColor: StudioColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  nextQuoteBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  quoteBodyWrap: {
    gap: 4,
  },
  quoteText: {
    color: StudioColors.textPrimary,
    fontSize: 15.5,
    fontWeight: "900",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  quoteAuthor: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  catNoteBox: {
    backgroundColor: StudioColors.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 3,
  },
  catNoteHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  catNotePrefix: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  catNoteTrackTag: {
    color: StudioColors.textMuted,
    fontSize: 9.5,
    fontWeight: "800",
    fontFamily: MonoFont,
    textTransform: "uppercase",
  },
  catNoteText: {
    color: StudioColors.textPrimary,
    fontSize: 12.5,
    fontWeight: "800",
    lineHeight: 18,
  },
  catNoteSubText: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  guideFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 2,
  },
  guideProgressWrap: {
    flex: 1,
    minWidth: 170,
    gap: 4,
  },
  guideStatusText: {
    color: StudioColors.textSecondary,
    fontSize: 10.5,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  miniTrackMeterBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: StudioColors.surface,
    borderWidth: 1,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  miniTrackMeterFill: {
    height: "100%",
  },
  jumpMissionChip: {
    backgroundColor: StudioColors.lime,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  jumpMissionChipText: {
    color: StudioColors.ink,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
});
