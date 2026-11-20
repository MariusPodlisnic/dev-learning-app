"use no memo";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
  TrackThemes,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  buildFlashcardSessionDeck,
  computeFlashcardRoundReward,
  FLASHCARD_SPRINT_SIZE,
  type FlashcardItem,
  type FlashcardProgressState,
  type FlashcardTrackFilter,
  getFlashcardCatalog,
  hydrateFlashcardProgress,
  readFlashcardProgress,
  recordFlashcardRating,
  saveFlashcardProgress,
} from "../utils/flashcardDeck";
import {
  playKeyClick,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";
import { StudioIcon, Text } from "./StudioIcon";

interface FlashcardsArenaProps {
  isPremium: boolean;
  onRequirePro: () => void;
  onAwardFlashcardXp: (xpEarned: number, cardsMastered: number) => void;
  onBackToMap?: () => void;
}

const TRACK_FILTER_OPTIONS: readonly {
  id: FlashcardTrackFilter;
  label: string;
  shortLabel: string;
  accent: string;
  isProTrack: boolean;
}[] = [
  {
    id: "python_basics",
    label: "PYTHON BASICS",
    shortLabel: "PYTHON",
    accent: "#B8FF3B",
    isProTrack: false,
  },
  {
    id: "algorithms",
    label: "ALGORITHMS",
    shortLabel: "ALGO",
    accent: "#C4B5FD",
    isProTrack: true,
  },
  {
    id: "system_design",
    label: "SYSTEM DESIGN",
    shortLabel: "SYS DESIGN",
    accent: "#6EE7B7",
    isProTrack: true,
  },
  {
    id: "all",
    label: "MIXED DECK",
    shortLabel: "MIXED",
    accent: "#FFDE59",
    isProTrack: false,
  },
];

export default function FlashcardsArena({
  isPremium,
  onRequirePro,
  onAwardFlashcardXp,
  onBackToMap,
}: FlashcardsArenaProps) {
  const styles = useThemedStyles(createStyles);
  const catalog = useMemo(() => getFlashcardCatalog(), []);

  const [trackFilter, setTrackFilter] =
    useState<FlashcardTrackFilter>("python_basics");
  const [reviewOnly, setReviewOnly] = useState<boolean>(false);
  const [progress, setProgress] = useState<FlashcardProgressState>(() =>
    readFlashcardProgress(),
  );
  const [sessionSeed, setSessionSeed] = useState<string>("sprint-1");
  const [deck, setDeck] = useState<FlashcardItem[]>(() =>
    buildFlashcardSessionDeck({
      track: "python_basics",
      isPremium,
      progress: readFlashcardProgress(),
      reviewOnly: false,
      size: FLASHCARD_SPRINT_SIZE,
      seed: "sprint-1",
    }),
  );

  const [cardIdx, setCardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [roundGotIt, setRoundGotIt] = useState<number>(0);
  const [roundMissed, setRoundMissed] = useState<number>(0);
  const [roundStreak, setRoundStreak] = useState<number>(0);
  const [bestRoundStreak, setBestRoundStreak] = useState<number>(0);
  const [roundComplete, setRoundComplete] = useState<boolean>(false);
  const [lastXpAwarded, setLastXpAwarded] = useState<number>(0);

  // Animations for flip & swipe
  const [flipScaleX] = useState(() => new Animated.Value(1));
  const [cardSlideX] = useState(() => new Animated.Value(0));
  const [cardOpacity] = useState(() => new Animated.Value(1));
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    void hydrateFlashcardProgress().then((hydrated) => {
      if (!active) return;
      setProgress(hydrated);
    });
    return () => {
      active = false;
    };
  }, []);

  const startNewSprint = useCallback(
    (
      nextTrack: FlashcardTrackFilter,
      nextReviewOnly: boolean,
      nextProgress: FlashcardProgressState,
    ) => {
      const nextSeed = `sprint-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const nextDeck = buildFlashcardSessionDeck({
        track: nextTrack,
        isPremium,
        progress: nextProgress,
        reviewOnly: nextReviewOnly,
        size: FLASHCARD_SPRINT_SIZE,
        seed: nextSeed,
      });
      setSessionSeed(nextSeed);
      setDeck(nextDeck);
      setCardIdx(0);
      setIsFlipped(false);
      setRoundGotIt(0);
      setRoundMissed(0);
      setRoundStreak(0);
      setBestRoundStreak(0);
      setRoundComplete(false);
      setLastXpAwarded(0);
      cardSlideX.setValue(0);
      cardOpacity.setValue(1);
      flipScaleX.setValue(1);
    },
    [cardOpacity, cardSlideX, flipScaleX, isPremium],
  );

  const currentCard = deck[cardIdx] || null;

  const dueReviewCount = useMemo(() => {
    const scoped =
      trackFilter === "all"
        ? catalog
        : catalog.filter((c) => c.track === trackFilter);
    const accessible = isPremium ? scoped : scoped.filter((c) => !c.isPro);
    return accessible.filter((c) => progress.reviewIds[c.id]).length;
  }, [catalog, isPremium, progress.reviewIds, trackFilter]);

  const trackStats = useMemo(() => {
    const scoped =
      trackFilter === "all"
        ? catalog
        : catalog.filter((c) => c.track === trackFilter);
    const accessible = isPremium ? scoped : scoped.filter((c) => !c.isPro);
    const mastered = accessible.filter((c) => progress.masteredIds[c.id]).length;
    const lockedCount = scoped.length - accessible.length;
    return {
      total: scoped.length,
      accessible: accessible.length,
      mastered,
      lockedCount,
    };
  }, [catalog, isPremium, progress.masteredIds, trackFilter]);

  const handleFlip = useCallback(() => {
    if (!currentCard || roundComplete || isAnimating) return;
    playKeyClick();
    setIsAnimating(true);
    Animated.timing(flipScaleX, {
      toValue: 0.04,
      duration: 95,
      easing: Easing.in(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setIsFlipped((prev) => !prev);
      setIsAnimating(false);
      Animated.timing(flipScaleX, {
        toValue: 1,
        duration: 130,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: false,
      }).start();
    });
  }, [currentCard, flipScaleX, isAnimating, roundComplete]);

  const handleRateCard = useCallback(
    (rating: "got_it" | "review") => {
      if (!currentCard || roundComplete || isAnimating) return;
      setIsAnimating(true);
      flipScaleX.setValue(1);

      const nextStreak = rating === "got_it" ? roundStreak + 1 : 0;
      const nextBestStreak = Math.max(bestRoundStreak, nextStreak);
      const nextGotIt = rating === "got_it" ? roundGotIt + 1 : roundGotIt;
      const nextMissed = rating === "review" ? roundMissed + 1 : roundMissed;

      if (rating === "got_it") {
        playSuccessChime();
      } else {
        playKeyClick();
      }

      const nextProgress = recordFlashcardRating(
        progress,
        currentCard.id,
        rating,
        nextStreak,
      );
      setProgress(nextProgress);
      saveFlashcardProgress(nextProgress);

      const exitX = rating === "got_it" ? 160 : -160;
      Animated.parallel([
        Animated.timing(cardSlideX, {
          toValue: exitX,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setRoundStreak(nextStreak);
        setBestRoundStreak(nextBestStreak);
        setRoundGotIt(nextGotIt);
        setRoundMissed(nextMissed);

        const nextIdx = cardIdx + 1;
        if (nextIdx >= deck.length) {
          const xpEarned = computeFlashcardRoundReward({
            gotItCount: nextGotIt,
            totalCards: deck.length,
            bestRoundStreak: nextBestStreak,
          });
          setLastXpAwarded(xpEarned);
          setRoundComplete(true);
          if (xpEarned > 0) {
            playVictoryFanfare();
            onAwardFlashcardXp(xpEarned, nextGotIt);
          }
          cardSlideX.setValue(0);
          cardOpacity.setValue(1);
          setIsAnimating(false);
        } else {
          setCardIdx(nextIdx);
          setIsFlipped(false);
          cardSlideX.setValue(rating === "got_it" ? -40 : 40);
          Animated.parallel([
            Animated.timing(cardSlideX, {
              toValue: 0,
              duration: 170,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }),
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 160,
              useNativeDriver: false,
            }),
          ]).start(() => {
            setIsAnimating(false);
          });
        }
      });
    },
    [
      bestRoundStreak,
      cardIdx,
      cardOpacity,
      cardSlideX,
      currentCard,
      deck.length,
      flipScaleX,
      isAnimating,
      onAwardFlashcardXp,
      progress,
      roundComplete,
      roundGotIt,
      roundMissed,
      roundStreak,
    ],
  );

  // Desktop keyboard shortcuts (Space = flip, Left/1 = Still Learning, Right/2 = Got It)
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (roundComplete || !currentCard) return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && (e.key === "ArrowRight" || e.key === "2")) {
        e.preventDefault();
        handleRateCard("got_it");
      } else if (isFlipped && (e.key === "ArrowLeft" || e.key === "1")) {
        e.preventDefault();
        handleRateCard("review");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentCard, handleFlip, handleRateCard, isFlipped, roundComplete]);

  // Horizontal touch swipe gestures (Left = Review Again, Right = Got It)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          isFlipped &&
          Math.abs(gesture.dx) > 14 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
        onPanResponderMove: (_evt, gesture) => {
          const clamped = Math.max(-110, Math.min(110, gesture.dx * 0.7));
          cardSlideX.setValue(clamped);
        },
        onPanResponderRelease: (_evt, gesture) => {
          if (gesture.dx >= 58 || gesture.vx >= 0.45) {
            handleRateCard("got_it");
          } else if (gesture.dx <= -58 || gesture.vx <= -0.45) {
            handleRateCard("review");
          } else {
            Animated.spring(cardSlideX, {
              toValue: 0,
              friction: 6,
              tension: 120,
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(cardSlideX, {
            toValue: 0,
            friction: 6,
            tension: 120,
            useNativeDriver: false,
          }).start();
        },
      }),
    [cardSlideX, handleRateCard, isFlipped],
  );

  const cardRotate = cardSlideX.interpolate({
    inputRange: [-120, 0, 120],
    outputRange: ["-6deg", "0deg", "6deg"],
    extrapolate: "clamp",
  });

  const activeTrackMeta = currentCard
    ? TrackThemes[currentCard.track] || TrackThemes.python_basics
    : TrackThemes.python_basics;

  const accuracyPct =
    deck.length > 0 ? Math.round((roundGotIt / deck.length) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Arena Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerTopRow}>
          <View style={styles.bannerLeft}>
            <View style={styles.kickerPill}>
              <StudioIcon name="nav_flashcards" size={16} />
              <Text style={styles.kickerText}>
                CONCEPT DECK · RAPID RECALL
              </Text>
            </View>
            <Text style={styles.heading}>Flashcards Deck</Text>
            <Text style={styles.subHeading}>
              30-second tap &amp; swipe recall across Python, Algorithms, and
              System Design — zero typing required.
            </Text>
          </View>

          {onBackToMap ? (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                onBackToMap();
              }}
            >
              <Text style={styles.backBtnText}>← SKILL MAP</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Track Filter Pills */}
        <View style={styles.filterRow}>
          {TRACK_FILTER_OPTIONS.map((opt) => {
            const active = trackFilter === opt.id;
            return (
              <Pressable
                key={opt.id}
                accessibilityRole="button"
                accessibilityLabel={`Select ${opt.label} flashcard deck`}
                style={({ pressed }) => [
                  styles.trackChip,
                  active && [
                    styles.trackChipActive,
                    { backgroundColor: opt.accent },
                  ],
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  setTrackFilter(opt.id);
                  setReviewOnly(false);
                  startNewSprint(opt.id, false, progress);
                }}
              >
                <Text
                  style={[
                    styles.trackChipText,
                    active && styles.trackChipTextActive,
                  ]}
                >
                  {opt.label}
                  {opt.isProTrack && !isPremium ? " · PREVIEW" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Telemetry & Mode Strip */}
        <View style={styles.telemetryStrip}>
          <View style={styles.telemetryPills}>
            <View style={styles.statPill}>
              <Text style={styles.statPillText}>
                ✓ {trackStats.mastered}/{trackStats.accessible} MASTERED
              </Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillText}>
                🔥 {roundStreak} COMBO
              </Text>
            </View>
            {progress.bestStreak > 0 ? (
              <View style={styles.statPill}>
                <Text style={styles.statPillText}>
                  ★ BEST {progress.bestStreak}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.modeToggleRow}>
            <Pressable
              accessibilityRole="button"
              style={[
                styles.modeMiniBtn,
                !reviewOnly && styles.modeMiniBtnActive,
              ]}
              onPress={() => {
                playKeyClick();
                setReviewOnly(false);
                startNewSprint(trackFilter, false, progress);
              }}
            >
              <Text
                style={[
                  styles.modeMiniBtnText,
                  !reviewOnly && styles.modeMiniBtnTextActive,
                ]}
              >
                8-CARD SPRINT
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={dueReviewCount === 0}
              style={[
                styles.modeMiniBtn,
                reviewOnly && styles.modeMiniBtnActive,
                dueReviewCount === 0 && styles.modeMiniBtnDisabled,
              ]}
              onPress={() => {
                if (dueReviewCount === 0) return;
                playKeyClick();
                setReviewOnly(true);
                startNewSprint(trackFilter, true, progress);
              }}
            >
              <Text
                style={[
                  styles.modeMiniBtnText,
                  reviewOnly && styles.modeMiniBtnTextActive,
                ]}
              >
                ↻ REVIEW ({dueReviewCount})
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Pro Preview Notice when Free user browses Pro decks */}
      {trackStats.lockedCount > 0 && !isPremium ? (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.proBanner,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onRequirePro();
          }}
        >
          <Text style={styles.proBannerText}>
            ★ FREE PREVIEW ({trackStats.accessible} CARDS) — UNLOCK{" "}
            {trackStats.lockedCount} MORE PRO FLASHCARDS →
          </Text>
        </Pressable>
      ) : null}

      {/* Main Playable Card Stage OR Sprint Complete Summary */}
      {roundComplete ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryAccentBar} />
          <View style={styles.summaryBody}>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>
                🎉 FLASHCARD SPRINT COMPLETE
              </Text>
            </View>
            <Text style={styles.summaryTitle}>
              {accuracyPct === 100
                ? "Flawless Recall!"
                : accuracyPct >= 75
                  ? "Sharp Memory!"
                  : "Great Warm-Up!"}
            </Text>
            <Text style={styles.summarySub}>
              {lastXpAwarded > 0
                ? `You earned +${lastXpAwarded} XP and updated your mastered deck.`
                : "Missed cards were queued into Review Mode so you can lock them in."}
            </Text>

            <View style={styles.summaryStatsRow}>
              <View
                style={[styles.summaryStatBox, { backgroundColor: StudioColors.lime }]}
              >
                <Text style={styles.summaryStatVal}>+{lastXpAwarded} XP</Text>
                <Text style={styles.summaryStatLbl}>EARNED</Text>
              </View>
              <View
                style={[styles.summaryStatBox, { backgroundColor: StudioColors.yellow }]}
              >
                <Text style={styles.summaryStatVal}>{accuracyPct}%</Text>
                <Text style={styles.summaryStatLbl}>ACCURACY</Text>
              </View>
              <View
                style={[styles.summaryStatBox, { backgroundColor: StudioColors.pink }]}
              >
                <Text style={styles.summaryStatVal}>🔥 {bestRoundStreak}</Text>
                <Text style={styles.summaryStatLbl}>BEST COMBO</Text>
              </View>
            </View>

            <View style={styles.summaryActionsRow}>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primaryActionBtn,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  setReviewOnly(false);
                  startNewSprint(trackFilter, false, progress);
                }}
              >
                <Text style={styles.primaryActionBtnText}>
                  ↻ DEAL NEXT 8 CARDS →
                </Text>
              </Pressable>

              {dueReviewCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.secondaryActionBtn,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                  onPress={() => {
                    playKeyClick();
                    setReviewOnly(true);
                    startNewSprint(trackFilter, true, progress);
                  }}
                >
                  <Text style={styles.secondaryActionBtnText}>
                    🔁 DRILL {dueReviewCount} MISSED
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      ) : currentCard ? (
        <View style={styles.stageWrap} key={sessionSeed}>
          {/* Sprint Progress Meter */}
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>
              CARD {cardIdx + 1} OF {deck.length}
            </Text>
            <Text style={styles.progressHint}>
              {isFlipped
                ? "SWIPE OR TAP RATING BELOW"
                : "TAP CARD OR PRESS [SPACE] TO FLIP"}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(((cardIdx + (isFlipped ? 0.5 : 0)) / Math.max(1, deck.length)) * 100)}%`,
                  backgroundColor: activeTrackMeta.stickerBg,
                },
              ]}
            />
          </View>

          {/* Animated Tactile Flashcard */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.flashcardShell,
              {
                opacity: cardOpacity,
                transform: [
                  { translateX: cardSlideX },
                  { rotate: cardRotate },
                  { scaleX: flipScaleX },
                ],
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isFlipped
                  ? `Flashcard answer: ${currentCard.answerHeadline}. Tap to flip back`
                  : `Flashcard question: ${currentCard.prompt}. Tap to reveal answer`
              }
              style={styles.flashcardPressable}
              onPress={handleFlip}
            >
              {/* Card Top Accent Bar */}
              <View
                style={[
                  styles.cardAccentRibbon,
                  {
                    backgroundColor: isFlipped
                      ? StudioColors.mint
                      : currentCard.category === "PITFALL ALERT"
                        ? StudioColors.coral
                        : activeTrackMeta.stickerBg,
                  },
                ]}
              />

              {/* Card Header Tags */}
              <View style={styles.cardMetaRow}>
                <View style={styles.cardBadgesGroup}>
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor: isFlipped
                          ? StudioColors.mint
                          : currentCard.category === "PITFALL ALERT"
                            ? StudioColors.coral
                            : activeTrackMeta.stickerBg,
                      },
                    ]}
                  >
                    <Text style={styles.categoryBadgeText}>
                      {isFlipped ? "✓ ANSWER REVEALED" : currentCard.category}
                    </Text>
                  </View>
                  <View style={styles.trackMiniBadge}>
                    <Text style={styles.trackMiniBadgeText}>
                      {activeTrackMeta.icon} · {currentCard.topic.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sideIndicator}>
                  {isFlipped ? "BACK" : "FRONT"}
                </Text>
              </View>

              {/* Card Body (Front vs Back) */}
              {!isFlipped ? (
                <View style={styles.cardContentBody}>
                  <Text style={styles.questionText}>{currentCard.prompt}</Text>

                  {currentCard.frontCode ? (
                    <View style={styles.codeIsland}>
                      <Text style={styles.codeIslandLabel}>
                        BUGGY SNIPPET
                      </Text>
                      <Text style={styles.codeIslandText}>
                        {currentCard.frontCode}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.flipPromptFooter}>
                    <Text style={styles.flipPromptText}>
                      👆 TAP ANYWHERE ON CARD TO FLIP ↻
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.cardContentBody}>
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>KEY ANSWER</Text>
                    <Text style={styles.answerHeadline}>
                      {currentCard.answerHeadline}
                    </Text>
                  </View>

                  <Text style={styles.explanationText}>
                    {currentCard.explanation}
                  </Text>

                  {currentCard.backCode ? (
                    <View style={styles.codeIsland}>
                      <Text style={styles.codeIslandLabel}>
                        {currentCard.category === "PITFALL ALERT"
                          ? "CLEAN FIX"
                          : "QUICK PATTERN"}
                      </Text>
                      <Text style={styles.codeIslandText}>
                        {currentCard.backCode}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </Pressable>
          </Animated.View>

          {/* Action Buttons Under Card */}
          {!isFlipped ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Flip flashcard to reveal answer"
              style={({ pressed }) => [
                styles.flipBigBtn,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={handleFlip}
            >
              <Text style={styles.flipBigBtnText}>↻ FLIP CARD</Text>
            </Pressable>
          ) : (
            <View style={styles.ratingActionsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mark card as still learning"
                style={({ pressed }) => [
                  styles.rateReviewBtn,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => handleRateCard("review")}
              >
                <Text style={styles.rateBtnText}>↻ STILL LEARNING</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mark card as mastered"
                style={({ pressed }) => [
                  styles.rateGotItBtn,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => handleRateCard("got_it")}
              >
                <Text style={styles.rateBtnText}>✓ GOT IT! (+5 XP)</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyDeckBox}>
          <Text style={styles.emptyDeckTitle}>No cards left in Review!</Text>
          <Text style={styles.emptyDeckSub}>
            You cleared every card in your review queue. Switch back to an
            8-Card Sprint to keep leveling up!
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primaryActionBtn}
            onPress={() => {
              playKeyClick();
              setReviewOnly(false);
              startNewSprint(trackFilter, false, progress);
            }}
          >
            <Text style={styles.primaryActionBtnText}>
              ▶ START 8-CARD SPRINT →
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    contentContainer: {
      maxWidth: 820,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 96,
      gap: 14,
    },
    bannerCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 14,
      padding: 16,
      gap: 12,
      ...HardShadow,
    },
    bannerTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap",
    },
    bannerLeft: {
      flex: 1,
      minWidth: 220,
      gap: 4,
    },
    kickerPill: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 2,
    },
    kickerText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
    },
    heading: {
      color: StudioColors.textPrimary,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.4,
    },
    subHeading: {
      color: StudioColors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
    },
    backBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    backBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },
    trackChip: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    trackChipActive: {
      borderColor: StudioColors.ink,
      borderWidth: 2,
    },
    trackChipText: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    trackChipTextActive: {
      color: StudioColors.ink,
    },
    telemetryStrip: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      paddingTop: 6,
      borderTopWidth: 1.5,
      borderTopColor: StudioColors.borderSubtle,
    },
    telemetryPills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    statPill: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    statPillText: {
      color: StudioColors.textPrimary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    modeToggleRow: {
      flexDirection: "row",
      gap: 6,
    },
    modeMiniBtn: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 6,
      paddingHorizontal: 9,
      paddingVertical: 4,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    modeMiniBtnActive: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    modeMiniBtnDisabled: {
      opacity: 0.45,
      ...Platform.select({ web: { cursor: "not-allowed" } }),
    },
    modeMiniBtnText: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    modeMiniBtnTextActive: {
      color: StudioColors.ink,
    },
    proBanner: {
      backgroundColor: StudioColors.pink,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    proBannerText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
      textAlign: "center",
    },
    stageWrap: {
      gap: 10,
    },
    progressHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
      paddingHorizontal: 2,
    },
    progressLabel: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    progressHint: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "800",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    progressBarTrack: {
      height: 10,
      backgroundColor: StudioColors.surface,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
    },
    flashcardShell: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 16,
      overflow: "hidden",
      minHeight: 280,
      ...HardShadowHero,
    },
    flashcardPressable: {
      flex: 1,
      minHeight: 280,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    cardAccentRibbon: {
      height: 7,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
    },
    cardMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 10,
      borderBottomWidth: 1.5,
      borderBottomColor: StudioColors.borderSubtle,
    },
    cardBadgesGroup: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
      flex: 1,
    },
    categoryBadge: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    categoryBadgeText: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    trackMiniBadge: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    trackMiniBadgeText: {
      color: StudioColors.textSecondary,
      fontSize: 9.5,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    sideIndicator: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    cardContentBody: {
      flex: 1,
      padding: 20,
      justifyContent: "space-between",
      gap: 14,
    },
    questionText: {
      color: StudioColors.textPrimary,
      fontSize: 19,
      lineHeight: 27,
      fontWeight: "900",
      letterSpacing: -0.2,
    },
    answerBox: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 2,
      borderColor: StudioColors.mint,
      borderRadius: 12,
      padding: 14,
      gap: 4,
    },
    answerLabel: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    answerHeadline: {
      color: StudioColors.textPrimary,
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "900",
    },
    explanationText: {
      color: StudioColors.textSecondary,
      fontSize: 13.5,
      lineHeight: 20,
      fontWeight: "600",
    },
    codeIsland: {
      backgroundColor: StudioColors.codeBg,
      borderWidth: 1.5,
      borderColor: StudioColors.codeBorder,
      borderRadius: 10,
      padding: 12,
      gap: 5,
    },
    codeIslandLabel: {
      color: StudioColors.yellow,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
    },
    codeIslandText: {
      color: "#E8F5E9",
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    flipPromptFooter: {
      alignSelf: "center",
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginTop: 4,
    },
    flipPromptText: {
      color: StudioColors.textSecondary,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    flipBigBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      ...HardShadow,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    flipBigBtnText: {
      color: StudioColors.ink,
      fontSize: 13,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    ratingActionsRow: {
      flexDirection: "row",
      gap: 10,
    },
    rateReviewBtn: {
      flex: 1,
      backgroundColor: StudioColors.coral,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: "center",
      ...HardShadow,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    rateGotItBtn: {
      flex: 1,
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: "center",
      ...HardShadow,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    rateBtnText: {
      color: StudioColors.ink,
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    summaryCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2.5,
      borderColor: StudioColors.border,
      borderRadius: 16,
      overflow: "hidden",
      ...HardShadowHero,
    },
    summaryAccentBar: {
      height: 8,
      backgroundColor: StudioColors.mint,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
    },
    summaryBody: {
      padding: 22,
      alignItems: "center",
      gap: 12,
    },
    summaryBadge: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    summaryBadgeText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    summaryTitle: {
      color: StudioColors.textPrimary,
      fontSize: 24,
      fontWeight: "900",
    },
    summarySub: {
      color: StudioColors.textSecondary,
      fontSize: 13,
      textAlign: "center",
      fontWeight: "600",
      maxWidth: 440,
    },
    summaryStatsRow: {
      width: "100%",
      flexDirection: "row",
      gap: 10,
      marginVertical: 4,
    },
    summaryStatBox: {
      flex: 1,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: "center",
      gap: 3,
      ...HardShadowSm,
    },
    summaryStatVal: {
      color: StudioColors.ink,
      fontSize: 16,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    summaryStatLbl: {
      color: StudioColors.ink,
      fontSize: 9,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    summaryActionsRow: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 4,
    },
    primaryActionBtn: {
      flex: 1,
      minWidth: 190,
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingVertical: 13,
      paddingHorizontal: 14,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    primaryActionBtnText: {
      color: StudioColors.ink,
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    secondaryActionBtn: {
      flex: 1,
      minWidth: 170,
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingVertical: 13,
      paddingHorizontal: 14,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    secondaryActionBtnText: {
      color: StudioColors.ink,
      fontSize: 12,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    emptyDeckBox: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      gap: 10,
      ...HardShadow,
    },
    emptyDeckTitle: {
      color: StudioColors.textPrimary,
      fontSize: 18,
      fontWeight: "900",
    },
    emptyDeckSub: {
      color: StudioColors.textSecondary,
      fontSize: 13,
      textAlign: "center",
      fontWeight: "600",
    },
  });
