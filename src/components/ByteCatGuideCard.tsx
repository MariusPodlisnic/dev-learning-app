import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
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

interface ByteCatGuideCardProps {
  completedCount: number;
  totalCount: number;
  activeTrackLabel: string;
  nextLessonTitle?: string;
  onPressNextLesson?: () => void;
}

export default function ByteCatGuideCard({
  completedCount,
  totalCount,
  activeTrackLabel,
  nextLessonTitle,
  onPressNextLesson,
}: ByteCatGuideCardProps) {
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const appStateRef = useRef<string>(AppState.currentState || "active");

  const triggerBounce = useCallback(() => {
    bounceAnim.setValue(0.95);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [bounceAnim]);

  const advanceToFreshQuote = useCallback(
    (playAudio = false) => {
      if (playAudio) {
        playKeyClick();
        triggerBounce();
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
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        advanceToFreshQuote(false);
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      sub.remove();
    };
  }, [advanceToFreshQuote]);

  const currentQuote =
    BYTE_CAT_QUOTES[quoteIndex] || BYTE_CAT_QUOTES[0];

  const guideStatusText =
    totalCount > 0 && completedCount === totalCount
      ? `Purr-fect! You cleared all ${totalCount} modules in ${activeTrackLabel}!`
      : completedCount === 0
        ? `Welcome back! Ready to start ${activeTrackLabel}?`
        : `${completedCount}/${totalCount} modules cleared in ${activeTrackLabel}—keep the combo going!`;

  return (
    <View style={styles.card}>
      {/* Left Column: Byte-Cat Framed Character Portrait */}
      <Pressable
        style={({ pressed }) => [
          styles.avatarColumn,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => advanceToFreshQuote(true)}
      >
        <Animated.View
          style={[
            styles.avatarFrame,
            { transform: [{ scale: bounceAnim }] },
          ]}
        >
          <Image
            source={BYTE_CAT_IMAGE}
            style={styles.avatarImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <View style={styles.liveDotBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveDotText}>GUIDE</Text>
          </View>
        </Animated.View>

        <View style={styles.nameplatePill}>
          <Text style={styles.nameplateText}>BYTE-CAT v1.0</Text>
        </View>
      </Pressable>

      {/* Speech Bubble Pointer Triangle (Desktop/Tablet) */}
      <View style={styles.speechTailOuter}>
        <View style={styles.speechTailInner} />
      </View>

      {/* Right Column: Speech Bubble with Inspirational Quote & Guide Tip */}
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
              QUOTE #{String(currentQuote.id).padStart(2, "0")}/
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
            <Text style={styles.nextQuoteBtnText}>MEOW QUOTE ↻</Text>
          </Pressable>
        </View>

        {/* Main Inspirational Quote */}
        <View style={styles.quoteBodyWrap}>
          <Text style={styles.quoteText}>
            &ldquo;{currentQuote.quote}&rdquo;
          </Text>
          <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
        </View>

        {/* Byte-Cat's Personal Companion Note */}
        <View style={styles.catNoteBox}>
          <Text style={styles.catNotePrefix}>🐾 BYTE-CAT SAYS:</Text>
          <Text style={styles.catNoteText}>{currentQuote.catNote}</Text>
        </View>

        {/* Dynamic Guide Footer: Track Status + Quick Jump to Next Mission */}
        <View style={styles.guideFooterRow}>
          <Text style={styles.guideStatusText} numberOfLines={1}>
            ● {guideStatusText}
          </Text>
          {nextLessonTitle && onPressNextLesson && (
            <Pressable
              style={({ pressed }) => [
                styles.jumpMissionChip,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onPress={onPressNextLesson}
            >
              <Text style={styles.jumpMissionChipText} numberOfLines={1}>
                🎯 NEXT: {nextLessonTitle.toUpperCase()} →
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: StudioColors.border,
    padding: 16,
    marginBottom: 18,
    gap: 12,
    flexWrap: "wrap",
    ...HardShadow,
  },
  avatarColumn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  avatarFrame: {
    width: 112,
    height: 112,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: StudioColors.border,
    backgroundColor: "#F4F0E6",
    overflow: "hidden",
    position: "relative",
    ...HardShadowSm,
  },
  avatarImage: {
    width: 108,
    height: 108,
  },
  liveDotBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    fontSize: 8,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  nameplatePill: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  nameplateText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  speechTailOuter: {
    width: 10,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -6,
  },
  speechTailInner: {
    width: 12,
    height: 12,
    backgroundColor: "#F4F0E6",
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: StudioColors.border,
    transform: [{ rotate: "45deg" }],
  },
  speechBubble: {
    flex: 1,
    minWidth: 250,
    backgroundColor: "#F4F0E6",
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
    borderColor: StudioColors.border,
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
    fontSize: 16,
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
    paddingHorizontal: 11,
    paddingVertical: 8,
    gap: 2,
  },
  catNotePrefix: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  catNoteText: {
    color: StudioColors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
  },
  guideFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 2,
  },
  guideStatusText: {
    color: StudioColors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: MonoFont,
    flexShrink: 1,
  },
  jumpMissionChip: {
    backgroundColor: StudioColors.lime,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
  },
  jumpMissionChipText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
});
