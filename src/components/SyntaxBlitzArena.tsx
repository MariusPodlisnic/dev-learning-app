import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "./StudioIcon";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import {
  BLITZ_CARDS,
  type BlitzCardItem,
  type BlitzDeckKey,
} from "../constants/curriculumData/syntaxBlitzCards";
import { buildChallengeUrl, shareOrCopyText } from "../utils/shareUtils";
import {
  readLocalJson,
  readLocalJsonAsync,
  writeLocalJson,
} from "../types/lesson";
import {
  BLITZ_ROUND_SECONDS,
  buildMistakeReviewDeck,
  buildSeededDeck,
  clearMistakeId,
  computeBlitzHitReward,
  filterBlitzPool,
  formatBlitzDeckLabel,
  getDailyDateKey,
  getNextBlitzRankTarget,
  recordMistakeId,
} from "../utils/arenaReplayability";
import {
  playErrorBuzz,
  playKeyClick,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";

export type { BlitzDeckKey };

type BlitzMode = "standard" | "daily" | "mistakes";

const BLITZ_HIGHSCORE_KEY = "devlearn_blitz_highscore_v1";
const BLITZ_MISTAKES_KEY = "devlearn_blitz_mistakes_v1";
const BLITZ_DAILY_KEY = "devlearn_blitz_daily_v1";

interface SyntaxBlitzArenaProps {
  isPremium: boolean;
  onRequirePro: () => void;
  onAwardBlitzXp: (xpEarned: number) => void;
}

function shuffleCards(cards: BlitzCardItem[]): BlitzCardItem[] {
  const arr = cards.map((card) => {
    const correctVal = card.options[card.correctIndex];
    const shuffledOpts = [...card.options];
    for (let i = shuffledOpts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffledOpts[i];
      shuffledOpts[i] = shuffledOpts[j];
      shuffledOpts[j] = tmp;
    }
    return {
      ...card,
      options: shuffledOpts,
      correctIndex: shuffledOpts.indexOf(correctVal),
    };
  });
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export function getBlitzSpeedRating(cleared: number) {
  if (cleared >= 12) {
    return {
      title: "Overclocked 60Hz Silicon God",
      badge: "S-RANK // TURBO",
      color: StudioColors.lime,
    };
  }
  if (cleared >= 8) {
    return {
      title: "Turbo-Charged Bytecode Ninja",
      badge: "A-RANK // FAST",
      color: StudioColors.mint,
    };
  }
  if (cleared >= 4) {
    return {
      title: "Caffeinated Junior Compiler",
      badge: "B-RANK // SOLID",
      color: StudioColors.yellow,
    };
  }
  return {
    title: "Dial-Up Modem Warm-Up",
    badge: "C-RANK // KEEP GOING",
    color: StudioColors.pink,
  };
}

export default function SyntaxBlitzArena({
  isPremium,
  onRequirePro,
  onAwardBlitzXp,
}: SyntaxBlitzArenaProps) {
  const styles = useThemedStyles(createStyles);
  const [selectedDeck, setSelectedDeck] =
    useState<BlitzDeckKey>("python_basics");
  const [blitzMode, setBlitzMode] = useState<BlitzMode>("standard");
  const [gameState, setGameState] = useState<"lobby" | "playing" | "finished">(
    "lobby",
  );
  const [roundId, setRoundId] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [endedEarly, setEndedEarly] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(BLITZ_ROUND_SECONDS);
  const [deckQueue, setDeckQueue] = useState<BlitzCardItem[]>([]);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);

  const [scoreXp, setScoreXp] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [fastHitCount, setFastHitCount] = useState<number>(0);
  const [lastHitInfo, setLastHitInfo] = useState<{
    earnedXp: number;
    multiplier: number;
    quickDrawBonusXp: number;
  } | null>(null);
  const [answerGrid, setAnswerGrid] = useState<("🟩" | "🟥")[]>([]);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied" | "shared">("idle");
  const [bonusSecondsToast, setBonusSecondsToast] = useState<boolean>(false);
  const [roundTargetBest, setRoundTargetBest] = useState<number>(0);
  const [newBestAchieved, setNewBestAchieved] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = Number(readLocalJson<number>(BLITZ_HIGHSCORE_KEY, 0));
    return Number.isFinite(saved) ? saved : 0;
  });
  const [mistakeIds, setMistakeIds] = useState<string[]>(() =>
    readLocalJson<string[]>(BLITZ_MISTAKES_KEY, []),
  );
  const todayDateKey = getDailyDateKey();
  const [dailyRecord, setDailyRecord] = useState<{ date: string; xp: number }>(
    () =>
      readLocalJson<{ date: string; xp: number }>(BLITZ_DAILY_KEY, {
        date: "",
        xp: 0,
      }),
  );
  const dailyBestXp =
    dailyRecord.date === todayDateKey ? dailyRecord.xp : 0;

  useEffect(() => {
    let cancelled = false;
    readLocalJsonAsync<number>(BLITZ_HIGHSCORE_KEY, 0).then((saved) => {
      if (!cancelled && Number.isFinite(saved) && saved > 0) {
        setHighScore((prev) => Math.max(prev, saved));
      }
    });
    readLocalJsonAsync<string[]>(BLITZ_MISTAKES_KEY, []).then((savedIds) => {
      if (!cancelled && Array.isArray(savedIds)) {
        setMistakeIds(savedIds);
      }
    });
    readLocalJsonAsync<{ date: string; xp: number }>(BLITZ_DAILY_KEY, {
      date: "",
      xp: 0,
    }).then((savedDaily) => {
      if (!cancelled && savedDaily?.date) {
        setDailyRecord(savedDaily);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const scoreXpRef = useRef<number>(0);
  useEffect(() => {
    scoreXpRef.current = scoreXp;
  }, [scoreXp]);

  const cardActiveStartRef = useRef<number>(0);
  const cardAccumulatedMsRef = useRef<number>(0);
  const bonusToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundTargetBestRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (bonusToastTimerRef.current) {
        clearTimeout(bonusToastTimerRef.current);
      }
    };
  }, []);

  const prevCardKeyRef = useRef<string>("");
  useEffect(() => {
    const cardKey = `${roundId}:${cardIndex}`;
    if (prevCardKeyRef.current !== cardKey || gameState !== "playing") {
      cardAccumulatedMsRef.current = 0;
      prevCardKeyRef.current = cardKey;
    }
    if (gameState !== "playing" || isPaused) {
      return;
    }
    const activeStart = Date.now();
    cardActiveStartRef.current = activeStart;
    return () => {
      cardAccumulatedMsRef.current += Date.now() - activeStart;
    };
  }, [gameState, isPaused, cardIndex, roundId]);

  const accessiblePool = useMemo(
    () =>
      isPremium
        ? BLITZ_CARDS
        : BLITZ_CARDS.filter((c) => c.deck === "python_basics"),
    [isPremium],
  );

  const filteredPool = useMemo(
    () => filterBlitzPool(BLITZ_CARDS, selectedDeck, isPremium),
    [selectedDeck, isPremium],
  );

  const mistakeReviewPool = useMemo(
    () => buildMistakeReviewDeck(accessiblePool, mistakeIds),
    [accessiblePool, mistakeIds],
  );

  function clearToastTimer() {
    if (bonusToastTimerRef.current) {
      clearTimeout(bonusToastTimerRef.current);
      bonusToastTimerRef.current = null;
    }
    setBonusSecondsToast(false);
  }

  function resetArenaToLobby() {
    clearToastTimer();
    setIsPaused(false);
    setEndedEarly(false);
    setDeckQueue([]);
    setCardIndex(0);
    setPickedOption(null);
    setScoreXp(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setAttemptCount(0);
    setFastHitCount(0);
    setLastHitInfo(null);
    setAnswerGrid([]);
    setShareFeedback("idle");
    setRoundTargetBest(0);
    roundTargetBestRef.current = 0;
    setNewBestAchieved(false);
    setTimeLeft(BLITZ_ROUND_SECONDS);
    setGameState("lobby");
  }

  function startRound(
    deckKey: BlitzDeckKey = selectedDeck,
    modeOverride: BlitzMode = blitzMode,
  ) {
    if (modeOverride === "mistakes") {
      resetArenaToLobby();
      return;
    }
    if (
      (deckKey === "algorithms" || deckKey === "system_design") &&
      !isPremium
    ) {
      onRequirePro();
      return;
    }

    const pool = filterBlitzPool(BLITZ_CARDS, deckKey, isPremium);
    const queue =
      modeOverride === "daily"
        ? buildSeededDeck(pool, `${todayDateKey}:${deckKey}`)
        : shuffleCards(pool);

    const targetBest = modeOverride === "daily" ? dailyBestXp : highScore;
    roundTargetBestRef.current = targetBest;
    setRoundTargetBest(targetBest);
    setNewBestAchieved(false);

    clearToastTimer();
    setIsPaused(false);
    setEndedEarly(false);
    setDeckQueue(queue);
    setCardIndex(0);
    setPickedOption(null);
    setScoreXp(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setAttemptCount(0);
    setFastHitCount(0);
    setLastHitInfo(null);
    setAnswerGrid([]);
    setShareFeedback("idle");
    setTimeLeft(BLITZ_ROUND_SECONDS);
    cardAccumulatedMsRef.current = 0;
    setRoundId((prev) => prev + 1);
    setGameState("playing");
  }

  function handleDismissMistake(cardId: string) {
    playKeyClick();
    setMistakeIds((prev) => {
      const next = clearMistakeId(prev, cardId);
      writeLocalJson(BLITZ_MISTAKES_KEY, next);
      return next;
    });
  }

  function handleClearAllMistakes() {
    playSuccessChime();
    const visibleIds = new Set(mistakeReviewPool.map((c) => c.id));
    setMistakeIds((prev) => {
      const next = prev.filter((id) => !visibleIds.has(id));
      writeLocalJson(BLITZ_MISTAKES_KEY, next);
      return next;
    });
  }

  function finishRound(finalXp: number, earlyExit: boolean = false) {
    clearToastTimer();
    setIsPaused(false);
    setEndedEarly(earlyExit);
    setGameState("finished");
    playVictoryFanfare();
    if (finalXp > 0) {
      onAwardBlitzXp(finalXp);
    }
    if (finalXp > roundTargetBestRef.current && finalXp > 0) {
      setNewBestAchieved(true);
    }
    if (finalXp > highScore) {
      setHighScore(finalXp);
      writeLocalJson(BLITZ_HIGHSCORE_KEY, finalXp);
    }
    if (blitzMode === "daily" && finalXp > dailyBestXp) {
      const nextDaily = { date: todayDateKey, xp: finalXp };
      setDailyRecord(nextDaily);
      writeLocalJson(BLITZ_DAILY_KEY, nextDaily);
    }
  }

  function handleEndChallenge() {
    if (gameState !== "playing") return;
    playKeyClick();
    if (attemptCount === 0) {
      resetArenaToLobby();
      return;
    }
    finishRound(scoreXpRef.current, true);
  }

  function handleRestartFresh() {
    playKeyClick();
    startRound(selectedDeck, blitzMode);
  }

  function handleTogglePause() {
    if (gameState !== "playing") return;
    playKeyClick();
    setIsPaused((prev) => !prev);
  }

  const finishRoundRef = useRef(finishRound);
  useEffect(() => {
    finishRoundRef.current = finishRound;
  });

  // Countdown timer effect
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishRoundRef.current(scoreXpRef.current, false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, isPaused]);

  const currentCard = deckQueue[cardIndex % Math.max(deckQueue.length, 1)];
  const multiplier = Math.min(4, Math.floor(combo / 2) + 1);
  const nextRankTarget = getNextBlitzRankTarget(correctCount);

  function handleSelectOption(idx: number) {
    if (
      gameState !== "playing" ||
      isPaused ||
      pickedOption !== null ||
      !currentCard
    ) {
      return;
    }
    const responseMs =
      cardAccumulatedMsRef.current + (Date.now() - cardActiveStartRef.current);

    setPickedOption(idx);
    setAttemptCount((prev) => prev + 1);

    const isRight = idx === currentCard.correctIndex;
    setAnswerGrid((prev) => [...prev, isRight ? "🟩" : "🟥"]);
    if (isRight) {
      playSuccessChime();
      const reward = computeBlitzHitReward({
        currentCombo: combo,
        responseMs,
      });
      const nextXp = scoreXp + reward.earnedXp;
      setCombo(reward.nextCombo);
      setMaxCombo((prev) => Math.max(prev, reward.nextCombo));
      setCorrectCount((prev) => prev + 1);
      if (reward.quickDrawBonusXp > 0) {
        setFastHitCount((prev) => prev + 1);
      }
      setLastHitInfo({
        earnedXp: reward.earnedXp,
        multiplier: reward.multiplier,
        quickDrawBonusXp: reward.quickDrawBonusXp,
      });
      setScoreXp(nextXp);
      if (roundTargetBestRef.current > 0 && nextXp > roundTargetBestRef.current) {
        setNewBestAchieved(true);
      }

      if (reward.timeBonusSec > 0) {
        setTimeLeft((prev) => Math.min(BLITZ_ROUND_SECONDS, prev + reward.timeBonusSec));
        setBonusSecondsToast(true);
        if (bonusToastTimerRef.current) {
          clearTimeout(bonusToastTimerRef.current);
        }
        bonusToastTimerRef.current = setTimeout(
          () => setBonusSecondsToast(false),
          1100,
        );
      }
    } else {
      playErrorBuzz();
      setCombo(0);
      setLastHitInfo(null);
      setMistakeIds((prev) => {
        const next = recordMistakeId(prev, currentCard.id);
        writeLocalJson(BLITZ_MISTAKES_KEY, next);
        return next;
      });
    }
  }

  function handleNextCard() {
    if (gameState !== "playing" || isPaused) return;
    playKeyClick();
    setPickedOption(null);
    setLastHitInfo(null);
    if (cardIndex + 1 >= deckQueue.length) {
      if (blitzMode === "daily") {
        setDeckQueue((prev) => [
          ...prev,
          ...buildSeededDeck(filteredPool, `${todayDateKey}:${selectedDeck}:${prev.length}`),
        ]);
      } else {
        setDeckQueue((prev) => [...prev, ...shuffleCards(filteredPool)]);
      }
    }
    cardAccumulatedMsRef.current = 0;
    setCardIndex((prev) => prev + 1);
  }

  const keyActionsRef = useRef({
    handleSelectOption,
    handleNextCard,
    handleTogglePause,
  });
  useEffect(() => {
    keyActionsRef.current = {
      handleSelectOption,
      handleNextCard,
      handleTogglePause,
    };
  });

  // Web keyboard support (1-4 to pick option, Enter/Space to advance, Esc to pause/resume)
  useEffect(() => {
    if (Platform.OS !== "web" || gameState !== "playing") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        keyActionsRef.current.handleTogglePause();
        return;
      }
      if (isPaused) return;
      if (pickedOption === null) {
        if (e.key === "1") keyActionsRef.current.handleSelectOption(0);
        if (e.key === "2") keyActionsRef.current.handleSelectOption(1);
        if (e.key === "3") keyActionsRef.current.handleSelectOption(2);
        if (e.key === "4") keyActionsRef.current.handleSelectOption(3);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        keyActionsRef.current.handleNextCard();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, pickedOption, isPaused]);

  const accuracyPct =
    attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 100;
  const rating = getBlitzSpeedRating(correctCount);

  const emojiGridLines: string[] = [];
  const cappedGrid = answerGrid.slice(0, 24);
  for (let i = 0; i < cappedGrid.length; i += 8) {
    emojiGridLines.push(cappedGrid.slice(i, i + 8).join(""));
  }
  if (answerGrid.length > 24) {
    emojiGridLines.push(`+${answerGrid.length - 24} more`);
  }
  const formattedEmojiGrid = emojiGridLines.join("\n");

  async function handleShareScore() {
    playKeyClick();
    const url = buildChallengeUrl({ mode: "blitz", ref: "blitz_card" });
    const modeLabel =
      blitzMode === "daily"
        ? ` [📅 DAILY SEED ${todayDateKey}]`
        : blitzMode === "mistakes"
          ? " [🔁 MISTAKE DRILL]"
          : "";
    const message = [
      `⚡ DevLearn Speed Blitz${modeLabel} — ${rating.badge}`,
      `🏆 ${rating.title}`,
      `+${scoreXp} XP · ${correctCount} cleared · ${maxCombo}x streak · ${accuracyPct}% accuracy`,
      ...(formattedEmojiGrid ? [formattedEmojiGrid] : []),
      `Beat my 60s score 👉 ${url}`,
    ].join("\n");
    const outcome = await shareOrCopyText({
      title: `DevLearn Speed Blitz — +${scoreXp} XP`,
      message,
      channel: "blitz_card",
    });
    if (outcome !== "failed") {
      setShareFeedback(outcome);
      setTimeout(() => setShareFeedback("idle"), 2500);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Arcade Header Banner */}
      <View style={styles.heroHeader}>
        <View style={styles.heroLeft}>
          <View style={styles.arcadeSticker}>
            <Text style={styles.arcadeStickerText}>
              ⚡ ARCADE MODE // 60-SECOND SYNTAX BLITZ
            </Text>
          </View>
          <Text style={styles.heroTitle}>Rapid-Fire Code Reflexes</Text>
          <Text style={styles.heroSubtitle}>
            Fill in the missing Python token before the 60-second clock hits
            zero. Chain consecutive hits for up to a 4x XP Overdrive multiplier
            and +2s time bonuses!
          </Text>
        </View>

        <View style={styles.highScoreBox}>
          <Text style={styles.highScoreLabel}>
            {blitzMode === "daily" ? `DAILY BEST (${todayDateKey})` : "PERSONAL BEST"}
          </Text>
          <Text style={styles.highScoreValue}>
            ⚡ {blitzMode === "daily" ? dailyBestXp : highScore} XP
          </Text>
        </View>
      </View>

      {/* Replay Mode Switcher */}
      <View style={styles.blitzModeRow}>
        {(
          [
            { key: "standard", label: "⚡ STANDARD SHUFFLE" },
            { key: "daily", label: `📅 DAILY SEED (${todayDateKey})` },
            { key: "mistakes", label: `🔁 MISTAKE REVIEW (${mistakeReviewPool.length})` },
          ] as const
        ).map((m) => {
          const active = blitzMode === m.key;
          return (
            <Pressable
              key={m.key}
              style={[styles.modePill, active && styles.modePillActive]}
              onPress={() => {
                playKeyClick();
                setBlitzMode(m.key);
                if (m.key === "mistakes") {
                  resetArenaToLobby();
                } else if (gameState !== "lobby") {
                  resetArenaToLobby();
                }
              }}
            >
              <Text
                style={[
                  styles.modePillText,
                  active && styles.modePillTextActive,
                ]}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Deck Selector Bar */}
      <View style={styles.deckSelectorRow}>
        {(
          [
            {
              key: "python_basics",
              label: "🐍 PYTHON CORE",
              isProDeck: false,
            },
            {
              key: "algorithms",
              label: "⚡ ALGORITHMS & BIG-O",
              isProDeck: true,
            },
            {
              key: "system_design",
              label: "🏛️ SYSTEM DESIGN",
              isProDeck: true,
            },
            {
              key: "all",
              label: "🔥 MEGA SHUFFLE",
              isProDeck: false,
            },
          ] as const
        ).map((d) => {
          const isSelected = selectedDeck === d.key;
          const locked = d.isProDeck && !isPremium;
          const cardCount =
            d.key === "all"
              ? isPremium
                ? BLITZ_CARDS.length
                : BLITZ_CARDS.filter((c) => c.deck === "python_basics").length
              : BLITZ_CARDS.filter((c) => c.deck === d.key).length;
          return (
            <Pressable
              key={d.key}
              style={[
                styles.deckPill,
                isSelected && styles.deckPillActive,
                locked && styles.deckPillLocked,
              ]}
              onPress={() => {
                if (locked) {
                  onRequirePro();
                  return;
                }
                playKeyClick();
                setSelectedDeck(d.key);
                if (gameState !== "lobby") {
                  resetArenaToLobby();
                }
              }}
            >
              <Text
                style={[
                  styles.deckPillText,
                  isSelected && styles.deckPillTextActive,
                ]}
              >
                {d.label} ({cardCount})
              </Text>
              {locked && (
                <View style={styles.proMiniTag}>
                  <Text style={styles.proMiniTagText}>PRO</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {blitzMode === "mistakes" && (
        <View style={styles.lobbyCard}>
          <View style={styles.mistakeStudyHeader}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.mistakeStudyTitle}>
                📖 MISTAKE REVIEW & EXPLANATIONS ({mistakeReviewPool.length})
              </Text>
              <Text style={styles.mistakeStudySub}>
                No timer — read through the exact answer and explanation for each
                card you missed, then clear them when ready.
              </Text>
            </View>
            {mistakeReviewPool.length > 0 && (
              <Pressable
                style={styles.clearAllMistakesBtn}
                onPress={handleClearAllMistakes}
              >
                <Text style={styles.clearAllMistakesText}>
                  ✓ CLEAR ALL ({mistakeReviewPool.length})
                </Text>
              </Pressable>
            )}
          </View>

          {mistakeReviewPool.length === 0 ? (
            <View style={styles.emptyMistakeStudyBox}>
              <Text style={styles.emptyMistakeStudyTitle}>
                ✓ ALL CAUGHT UP — ZERO MISTAKES QUEUED
              </Text>
              <Text style={styles.emptyMistakeStudyDesc}>
                Any wrong pick during Standard or Daily Seed Blitz is saved here
                with its full solution and explanation.
              </Text>
              <Pressable
                style={styles.startBlitzBtn}
                onPress={() => {
                  playKeyClick();
                  setBlitzMode("standard");
                }}
              >
                <Text style={styles.startBlitzBtnText}>
                  ← BACK TO 60s BLITZ LOBBY
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.mistakeCardsList}>
              {mistakeReviewPool.map((card, idx) => {
                const correctToken = card.options[card.correctIndex];
                const solvedSnippet = card.codeTemplate.replace(
                  "[ ___ ]",
                  correctToken,
                );
                return (
                  <View key={card.id} style={styles.mistakeStudyCard}>
                    <View style={styles.mistakeCardTop}>
                      <View style={styles.topicTagPill}>
                        <Text style={styles.topicTagText}>
                          #{idx + 1} · {formatBlitzDeckLabel(card.deck)} · {card.tag}
                        </Text>
                      </View>
                      <Pressable
                        style={styles.dismissMistakeBtn}
                        onPress={() => handleDismissMistake(card.id)}
                      >
                        <Text style={styles.dismissMistakeText}>
                          ✓ MARK READ & REMOVE
                        </Text>
                      </Pressable>
                    </View>

                    <Text style={styles.mistakeCardPrompt}>{card.prompt}</Text>

                    <View style={styles.codeTerminalBox}>
                      <Text style={styles.codeTerminalText}>
                        {solvedSnippet}
                      </Text>
                    </View>

                    <View style={styles.mistakeAnswerBox}>
                      <Text style={styles.mistakeAnswerLabel}>
                        ✓ CORRECT TOKEN: {correctToken}
                      </Text>
                      <Text style={styles.mistakeAnswerExplain}>
                        {card.explanation}
                      </Text>
                    </View>
                  </View>
                );
              })}

              <Pressable
                style={({ pressed }) => [
                  styles.startBlitzBtn,
                  pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                ]}
                onPress={handleClearAllMistakes}
              >
                <Text style={styles.startBlitzBtnText}>
                  ✓ I READ EVERYTHING — EMPTY MISTAKE LIST →
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {blitzMode !== "mistakes" && gameState === "lobby" && (
        <View style={styles.lobbyCard}>
          <View style={styles.lobbyRulesGrid}>
            <View
              style={[
                styles.ruleBox,
                { backgroundColor: StudioColors.yellow },
              ]}
            >
              <Text style={styles.ruleIcon}>⏱️ 60 SECONDS</Text>
              <Text style={styles.ruleDesc}>
                Race the clock through rapid-fire 1-line code blanks
              </Text>
            </View>
            <View
              style={[styles.ruleBox, { backgroundColor: StudioColors.lime }]}
            >
              <Text style={styles.ruleIcon}>🔥 4x COMBO</Text>
              <Text style={styles.ruleDesc}>
                Every 2 consecutive hits levels up your XP multiplier
              </Text>
            </View>
            <View
              style={[styles.ruleBox, { backgroundColor: StudioColors.mint }]}
            >
              <Text style={styles.ruleIcon}>+2s TIME BOOST</Text>
              <Text style={styles.ruleDesc}>
                Every 3-streak adds +2 bonus seconds to your timer
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.startBlitzBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={() => startRound(selectedDeck, blitzMode)}
          >
            <Text style={styles.startBlitzBtnText}>
              {blitzMode === "daily"
                ? `PLAY TODAY'S SEEDED BLITZ (${todayDateKey}) →`
                : "INSERT COIN · START 60s BLITZ →"}
            </Text>
          </Pressable>
        </View>
      )}

      {blitzMode !== "mistakes" && gameState === "playing" && currentCard && (
        <View
          style={[
            styles.arenaCard,
            multiplier >= 3 && styles.arenaCardOverdrive,
          ]}
        >
          {/* Round Control & Target Strip */}
          <View style={styles.arenaControlBar}>
            <View
              style={[
                styles.targetGoalBadge,
                newBestAchieved && styles.targetGoalBadgeBeaten,
              ]}
            >
              <Text
                style={[
                  styles.targetGoalText,
                  newBestAchieved && { color: StudioColors.ink },
                ]}
              >
                {newBestAchieved
                  ? "🏆 NEW RECORD PACE!"
                  : roundTargetBest > 0
                    ? `🎯 BEAT BEST: ${roundTargetBest} XP`
                    : "⚡ QUICK DRAW <=3.2s: +5 XP"}
              </Text>
            </View>

            <View style={styles.arenaActionGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.arenaControlBtn,
                  isPaused && styles.arenaControlBtnActive,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onPress={handleTogglePause}
              >
                <Text
                  style={[
                    styles.arenaControlBtnText,
                    isPaused && { color: StudioColors.ink },
                  ]}
                >
                  {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.arenaControlBtn,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onPress={handleRestartFresh}
              >
                <Text style={styles.arenaControlBtnText}>↻ RESTART</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.arenaEndBtn,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onPress={handleEndChallenge}
              >
                <Text style={styles.arenaEndBtnText}>⏹ END</Text>
              </Pressable>
            </View>
          </View>

          {/* Live Telemetry HUD */}
          <View style={styles.hudBar}>
            <View style={styles.hudTimerBox}>
              <Text style={styles.hudLabel}>
                {isPaused ? "CLOCK PAUSED" : "TIME REMAINING"}
              </Text>
              <View style={styles.timerValueRow}>
                <Text
                  style={[
                    styles.timerValueText,
                    timeLeft <= 15 && { color: StudioColors.coral },
                  ]}
                >
                  00:{String(timeLeft).padStart(2, "0")}
                </Text>
                {bonusSecondsToast && (
                  <View style={styles.timeBonusPill}>
                    <Text style={styles.timeBonusPillText}>+2s STREAK!</Text>
                  </View>
                )}
              </View>
            </View>

            <View
              style={[
                styles.comboBadgeBox,
                multiplier >= 3 && { backgroundColor: StudioColors.pink },
                multiplier === 2 && { backgroundColor: StudioColors.yellow },
              ]}
            >
              <Text style={styles.hudLabel}>COMBO MULTIPLIER</Text>
              <Text style={styles.comboValueText}>
                {multiplier}x {combo >= 4 ? "🔥 OVERDRIVE" : `(${combo} STREAK)`}
              </Text>
            </View>

            <View style={styles.hudScoreBox}>
              <Text style={styles.hudLabel}>RUN SCORE</Text>
              <Text style={styles.scoreValueText}>+{scoreXp} XP</Text>
            </View>
          </View>

          {/* Timer Progress Strip */}
          <View style={styles.timerTrack}>
            <View
              style={[
                styles.timerFill,
                {
                  width: `${Math.max((timeLeft / BLITZ_ROUND_SECONDS) * 100, 2)}%`,
                  backgroundColor: isPaused
                    ? StudioColors.yellow
                    : timeLeft > 30
                      ? StudioColors.lime
                      : timeLeft > 15
                        ? StudioColors.yellow
                        : StudioColors.coral,
                },
              ]}
            />
          </View>

          {isPaused ? (
            <View style={styles.arenaPausedCard}>
              <Text style={styles.arenaPausedTitle}>⏸ CHALLENGE PAUSED</Text>
              <Text style={styles.arenaPausedDesc}>
                Clock is frozen with 00:{String(timeLeft).padStart(2, "0")} left.
                Resume your run, restart fresh with a clean 60s deck, or end the
                challenge now.
              </Text>
              <View style={styles.arenaPausedActions}>
                <Pressable
                  style={styles.pauseResumeBtn}
                  onPress={handleTogglePause}
                >
                  <Text style={styles.pauseActionBtnText}>▶ RESUME BLITZ</Text>
                </Pressable>
                <Pressable
                  style={styles.pauseRestartBtn}
                  onPress={handleRestartFresh}
                >
                  <Text style={styles.pauseActionBtnText}>
                    ↻ RESTART FRESH
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.pauseEndBtn}
                  onPress={handleEndChallenge}
                >
                  <Text style={styles.pauseActionBtnText}>
                    ⏹ END CHALLENGE
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {/* Prompt & Code Card */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.topicTagPill}>
                  <Text style={styles.topicTagText}>
                    {formatBlitzDeckLabel(currentCard.deck)} · {currentCard.tag}
                  </Text>
                </View>
                <Text style={styles.cardCounterText}>
                  CARD #{cardIndex + 1} · CLEARED: {correctCount}
                </Text>
              </View>

              <Text style={styles.promptTitle}>{currentCard.prompt}</Text>

              <View style={styles.codeTerminalBox}>
                <View style={styles.codeTerminalHeader}>
                  <Text style={styles.codeTerminalHeaderLabel}>
                    FILL IN THE [ ___ ] BLANK
                  </Text>
                </View>
                <Text style={styles.codeTerminalText}>
                  {currentCard.codeTemplate}
                </Text>
              </View>

              {/* 4 Keycap Options */}
              <View style={styles.optionsGrid}>
                {currentCard.options.map((opt, idx) => {
                  const isPicked = pickedOption === idx;
                  const isRight = idx === currentCard.correctIndex;
                  const revealRight = pickedOption !== null && isRight;
                  const revealWrong = isPicked && !isRight;

                  return (
                    <Pressable
                      key={idx}
                      style={({ pressed }) => [
                        styles.optionKeycapBtn,
                        revealRight && styles.optionKeycapRight,
                        revealWrong && styles.optionKeycapWrong,
                        pressed &&
                          pickedOption === null && {
                            transform: [{ translateX: 1 }, { translateY: 1 }],
                          },
                      ]}
                      onPress={() => handleSelectOption(idx)}
                      disabled={pickedOption !== null}
                    >
                      <View style={styles.keycapNumberBox}>
                        <Text style={styles.keycapNumberText}>{idx + 1}</Text>
                      </View>
                      <Text
                        style={[
                          styles.optionCodeText,
                          (revealRight || revealWrong) && {
                            color: StudioColors.ink,
                            fontWeight: "900",
                          },
                        ]}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Instant Feedback & Next Card Bar */}
              {pickedOption !== null && (
                <View
                  style={[
                    styles.feedbackBar,
                    pickedOption === currentCard.correctIndex
                      ? styles.feedbackBarSuccess
                      : styles.feedbackBarWrong,
                  ]}
                >
                  <View style={styles.feedbackTextCol}>
                    <Text style={styles.feedbackHeadline}>
                      {pickedOption === currentCard.correctIndex
                        ? `✓ HIT! +${lastHitInfo?.earnedXp ?? 10 * multiplier} XP (${lastHitInfo?.multiplier ?? multiplier}x${lastHitInfo && lastHitInfo.quickDrawBonusXp > 0 ? ` · +${lastHitInfo.quickDrawBonusXp} ⚡ QUICK DRAW!` : ""})`
                        : `✕ MISSED! Correct answer: ${currentCard.options[currentCard.correctIndex]}`}
                    </Text>
                    <Text style={styles.feedbackExplanation}>
                      {currentCard.explanation}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.nextCardBtn}
                    onPress={handleNextCard}
                  >
                    <Text style={styles.nextCardBtnText}>
                      NEXT CARD (↵) →
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {blitzMode !== "mistakes" && gameState === "finished" && (
        <View style={styles.scoreboardCard}>
          <View style={styles.scoreboardBadgesRow}>
            <View
              style={[
                styles.ratingBadgePill,
                { backgroundColor: rating.color },
              ]}
            >
              <Text style={styles.ratingBadgeText}>{rating.badge}</Text>
            </View>
            {newBestAchieved && (
              <View style={styles.newRecordBadge}>
                <Text style={styles.ratingBadgeText}>
                  {blitzMode === "daily"
                    ? "📅 NEW DAILY BEST!"
                    : "🏆 NEW PERSONAL BEST!"}
                </Text>
              </View>
            )}
            {endedEarly && (
              <View style={styles.endedEarlyBadge}>
                <Text style={styles.ratingBadgeText}>⏹ ENDED EARLY</Text>
              </View>
            )}
          </View>

          <Text style={styles.scoreboardTitle}>{rating.title}</Text>
          <Text style={styles.scoreboardSubtitle}>
            {endedEarly
              ? `Challenge stopped with ${timeLeft}s on the clock · +${scoreXp} XP banked!`
              : `60-Second Blitz Complete · +${scoreXp} XP added to your developer profile!`}
          </Text>

          {nextRankTarget ? (
            <Text style={styles.nextRankHintText}>
              Next tier: {nextRankTarget.nextRankLabel} in{" "}
              {nextRankTarget.remainingClears} more{" "}
              {nextRankTarget.remainingClears === 1 ? "clear" : "clears"}!
            </Text>
          ) : (
            <Text style={styles.nextRankHintText}>
              ⚡ Maximum S-RANK Turbo tier unlocked!
            </Text>
          )}

          <View style={styles.metricsRow}>
            <View
              style={[
                styles.metricBox,
                { backgroundColor: StudioColors.lime },
              ]}
            >
              <Text style={styles.metricValue}>+{scoreXp} XP</Text>
              <Text style={styles.metricLabel}>XP EARNED</Text>
            </View>
            <View
              style={[
                styles.metricBox,
                { backgroundColor: StudioColors.yellow },
              ]}
            >
              <Text style={styles.metricValue}>{correctCount}</Text>
              <Text style={styles.metricLabel}>CARDS CLEARED</Text>
            </View>
            <View
              style={[
                styles.metricBox,
                { backgroundColor: StudioColors.pink },
              ]}
            >
              <Text style={styles.metricValue}>{maxCombo}x</Text>
              <Text style={styles.metricLabel}>MAX STREAK</Text>
            </View>
            <View
              style={[
                styles.metricBox,
                { backgroundColor: StudioColors.mint },
              ]}
            >
              <Text style={styles.metricValue}>{accuracyPct}%</Text>
              <Text style={styles.metricLabel}>
                {fastHitCount > 0 ? `ACC (${fastHitCount} ⚡ FAST)` : "ACCURACY"}
              </Text>
            </View>
          </View>

          {formattedEmojiGrid ? (
            <View style={styles.emojiGridBox}>
              <Text style={styles.emojiGridLabel}>RUN TELEMETRY GRID</Text>
              <Text style={styles.emojiGridText}>{formattedEmojiGrid}</Text>
            </View>
          ) : null}

          <View style={styles.scoreboardActions}>
            <Pressable
              style={({ pressed }) => [
                styles.shareScoreBtn,
                shareFeedback !== "idle" && styles.shareScoreBtnDone,
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
              onPress={handleShareScore}
            >
              <Text style={styles.shareScoreBtnText}>
                {shareFeedback === "copied"
                  ? "✓ SCORE GRID COPIED!"
                  : shareFeedback === "shared"
                    ? "✓ SCORE SHARED!"
                    : "📤 SHARE SCORE GRID ↗"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.startBlitzBtn,
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
              onPress={handleRestartFresh}
            >
              <Text style={styles.startBlitzBtnText}>
                START FRESH 60s ROUND ↻
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.exitLobbyBtn,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onPress={() => {
                playKeyClick();
                resetArenaToLobby();
              }}
            >
              <Text style={styles.exitLobbyBtnText}>
                ← RETURN TO BLITZ LOBBY
              </Text>
            </Pressable>
          </View>
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
  content: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    paddingBottom: 64,
  },
  heroHeader: {
    width: "100%",
    maxWidth: 760,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 18,
  },
  heroLeft: {
    flex: 1,
    minWidth: 260,
    gap: 6,
  },
  arcadeSticker: {
    alignSelf: "flex-start",
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    ...HardShadowSm,
  },
  arcadeStickerText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: StudioColors.textPrimary,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  heroSubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  highScoreBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    ...HardShadowSm,
  },
  highScoreLabel: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  highScoreValue: {
    color: StudioColors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: MonoFont,
    marginTop: 2,
  },
  deckSelectorRow: {
    width: "100%",
    maxWidth: 760,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  deckPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  deckPillActive: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  deckPillLocked: {
    opacity: 0.85,
  },
  deckPillText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  deckPillTextActive: {
    color: StudioColors.ink,
  },
  proMiniTag: {
    backgroundColor: StudioColors.pink,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  proMiniTagText: {
    color: StudioColors.ink,
    fontSize: 8,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  lobbyCard: {
    width: "100%",
    maxWidth: 760,
    backgroundColor: StudioColors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 24,
    gap: 20,
    ...HardShadow,
  },
  lobbyRulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  ruleBox: {
    flex: 1,
    minWidth: 190,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    padding: 14,
    gap: 4,
    ...HardShadowSm,
  },
  ruleIcon: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  ruleDesc: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  startBlitzBtn: {
    backgroundColor: StudioColors.lime,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    paddingVertical: 16,
    alignItems: "center",
    ...HardShadowHero,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  startBlitzBtnText: {
    color: StudioColors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  arenaCard: {
    width: "100%",
    maxWidth: 760,
    backgroundColor: StudioColors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 22,
    gap: 14,
    ...HardShadow,
  },
  hudBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  hudTimerBox: {
    flex: 1,
    minWidth: 150,
    backgroundColor: StudioColors.bg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    padding: 10,
  },
  timerValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerValueText: {
    color: StudioColors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  timeBonusPill: {
    backgroundColor: StudioColors.mint,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeBonusPillText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  comboBadgeBox: {
    flex: 1,
    minWidth: 150,
    backgroundColor: StudioColors.bg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    padding: 10,
  },
  comboValueText: {
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: MonoFont,
    marginTop: 2,
  },
  hudScoreBox: {
    flex: 1,
    minWidth: 130,
    backgroundColor: StudioColors.bg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    padding: 10,
    alignItems: "flex-end",
  },
  scoreValueText: {
    color: StudioColors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  hudLabel: {
    color: StudioColors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  timerTrack: {
    height: 10,
    backgroundColor: StudioColors.bg,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  timerFill: {
    height: "100%",
    borderRightWidth: 1.5,
    borderRightColor: StudioColors.ink,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  topicTagPill: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
  },
  topicTagText: {
    color: StudioColors.lime,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  cardCounterText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  promptTitle: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  codeTerminalBox: {
    backgroundColor: StudioColors.codeBg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    overflow: "hidden",
  },
  codeTerminalHeader: {
    backgroundColor: StudioColors.codeSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: StudioColors.codeBorder,
  },
  codeTerminalHeaderLabel: {
    color: StudioColors.yellow,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  codeTerminalText: {
    color: StudioColors.codeText,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: MonoFont,
    lineHeight: 25,
    padding: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionKeycapBtn: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: StudioColors.bg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.border,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  optionKeycapRight: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
  },
  optionKeycapWrong: {
    backgroundColor: "#FECDD3",
    borderColor: StudioColors.ink,
  },
  keycapNumberBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: StudioColors.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  keycapNumberText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  optionCodeText: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  feedbackBar: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  feedbackBarSuccess: {
    backgroundColor: "#D1FAE5",
  },
  feedbackBarWrong: {
    backgroundColor: "#FEF3C7",
  },
  feedbackTextCol: {
    flex: 1,
    minWidth: 220,
    gap: 3,
  },
  feedbackHeadline: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  feedbackExplanation: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  nextCardBtn: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  nextCardBtnText: {
    color: StudioColors.lime,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  scoreboardCard: {
    width: "100%",
    maxWidth: 760,
    backgroundColor: StudioColors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 28,
    alignItems: "center",
    gap: 14,
    ...HardShadow,
  },
  ratingBadgePill: {
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingBadgeText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  scoreboardTitle: {
    color: StudioColors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  scoreboardSubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  metricsRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 8,
  },
  metricBox: {
    flex: 1,
    minWidth: 140,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    padding: 14,
    alignItems: "center",
    gap: 4,
    ...HardShadowSm,
  },
  metricValue: {
    color: StudioColors.ink,
    fontSize: 22,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  metricLabel: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  emojiGridBox: {
    alignSelf: "stretch",
    backgroundColor: StudioColors.bg,
    borderWidth: 2,
    borderColor: StudioColors.border,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  emojiGridLabel: {
    color: StudioColors.textMuted,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  emojiGridText: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    letterSpacing: 2,
  },
  scoreboardActions: {
    width: "100%",
    gap: 10,
    marginTop: 6,
  },
  shareScoreBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  shareScoreBtnDone: {
    backgroundColor: StudioColors.mint,
  },
  shareScoreBtnText: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  blitzModeRow: {
    width: "100%",
    maxWidth: 760,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  modePill: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  modePillActive: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
    ...HardShadowSm,
  },
  modePillText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  modePillTextActive: {
    color: StudioColors.ink,
  },
  mistakeStudyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
  },
  mistakeStudyTitle: {
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  mistakeStudySub: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  clearAllMistakesBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  clearAllMistakesText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  emptyMistakeStudyBox: {
    gap: 12,
    padding: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    backgroundColor: StudioColors.bg,
  },
  emptyMistakeStudyTitle: {
    color: StudioColors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  emptyMistakeStudyDesc: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  mistakeCardsList: {
    gap: 14,
  },
  mistakeStudyCard: {
    backgroundColor: StudioColors.bg,
    borderWidth: 2,
    borderColor: StudioColors.border,
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  mistakeCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  dismissMistakeBtn: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  dismissMistakeText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  mistakeCardPrompt: {
    color: StudioColors.textPrimary,
    fontSize: 14.5,
    fontWeight: "800",
    lineHeight: 20,
  },
  mistakeAnswerBox: {
    backgroundColor: "rgba(184, 255, 59, 0.14)",
    borderWidth: 1.5,
    borderColor: StudioColors.lime,
    borderRadius: 8,
    padding: 11,
    gap: 4,
  },
  mistakeAnswerLabel: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  mistakeAnswerExplain: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  arenaCardOverdrive: {
    borderColor: StudioColors.pink,
  },
  arenaControlBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 4,
  },
  targetGoalBadge: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  targetGoalBadgeBeaten: {
    backgroundColor: StudioColors.lime,
    borderColor: StudioColors.ink,
  },
  targetGoalText: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  arenaActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  arenaControlBtn: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  arenaControlBtnActive: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  arenaControlBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  arenaEndBtn: {
    backgroundColor: StudioColors.coral,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  arenaEndBtnText: {
    color: StudioColors.ink,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  arenaPausedCard: {
    backgroundColor: StudioColors.bg,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    ...HardShadowSm,
  },
  arenaPausedTitle: {
    color: StudioColors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  arenaPausedDesc: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    textAlign: "center",
  },
  arenaPausedActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  pauseResumeBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  pauseRestartBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  pauseEndBtn: {
    backgroundColor: StudioColors.coral,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  pauseActionBtnText: {
    color: StudioColors.ink,
    fontSize: 11.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  scoreboardBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  newRecordBadge: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  endedEarlyBadge: {
    backgroundColor: StudioColors.coral,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nextRankHintText: {
    color: StudioColors.textPrimary,
    fontSize: 11.5,
    fontWeight: "800",
    fontFamily: MonoFont,
    textAlign: "center",
  },
  exitLobbyBtn: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.border,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  exitLobbyBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
});
