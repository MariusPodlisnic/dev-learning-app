import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";

export type BlitzDeckKey =
  | "python_basics"
  | "algorithms"
  | "system_design"
  | "all";

interface BlitzCardItem {
  id: string;
  deck: "python_basics" | "algorithms" | "system_design";
  tag: string;
  prompt: string;
  codeTemplate: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const BLITZ_CARDS: BlitzCardItem[] = [
  // Python Core Deck
  {
    id: "py-1",
    deck: "python_basics",
    tag: "VARIABLES",
    prompt: "Store the number 250 inside a variable named xp:",
    codeTemplate: "xp [ ___ ] 250\nprint(xp)",
    options: ["=", "==", "->", ":"],
    correctIndex: 0,
    explanation:
      "A single equals sign (=) assigns a value to a variable; == compares two values.",
  },
  {
    id: "py-2",
    deck: "python_basics",
    tag: "CONDITIONALS",
    prompt: "Check if score is at least 100 before unlocking the level:",
    codeTemplate: "if score >= 100[ ___ ]\n    print('Unlocked!')",
    options: [":", ";", "{", "then"],
    correctIndex: 0,
    explanation:
      "Every if, elif, else, for, while, and def header in Python must end with a colon (:).",
  },
  {
    id: "py-3",
    deck: "python_basics",
    tag: "LISTS",
    prompt: "Grab the VERY FIRST item ('sword') from the inventory list:",
    codeTemplate: "items = ['sword', 'shield', 'potion']\nprint(items[ ___ ])",
    options: ["[0]", "[1]", "[-1]", "(0)"],
    correctIndex: 0,
    explanation:
      "Python lists are zero-indexed, so index [0] always points to the first element.",
  },
  {
    id: "py-4",
    deck: "python_basics",
    tag: "LISTS",
    prompt: "Add 'gem' to the end of the loot list:",
    codeTemplate: "loot = ['coin', 'key']\nloot.[ ___ ]('gem')",
    options: ["append", "push", "add", "insert_end"],
    correctIndex: 0,
    explanation:
      "list.append(item) attaches a new item to the very end of a Python list.",
  },
  {
    id: "py-5",
    deck: "python_basics",
    tag: "FUNCTIONS",
    prompt: "Send the calculated total back to whoever called the function:",
    codeTemplate: "def double_xp(points):\n    [ ___ ] points * 2",
    options: ["return", "print", "give", "send"],
    correctIndex: 0,
    explanation:
      "return hands the result back to the caller so it can be saved or used in expressions.",
  },
  {
    id: "py-6",
    deck: "python_basics",
    tag: "STRINGS",
    prompt: "Remove accidental spaces from both ends of a username:",
    codeTemplate: "raw = '  ada_lovelace  '\nclean = raw.[ ___ ]()",
    options: ["strip", "trim", "clean", "pop"],
    correctIndex: 0,
    explanation:
      "str.strip() removes leading and trailing whitespace from a string.",
  },
  {
    id: "py-7",
    deck: "python_basics",
    tag: "DICTIONARIES",
    prompt: "Safely look up 'mana' with a fallback of 0 if missing:",
    codeTemplate: "stats = {'hp': 100}\nmana = stats.[ ___ ]('mana', 0)",
    options: ["get", "find", "fetch", "lookup"],
    correctIndex: 0,
    explanation:
      "dict.get(key, default) returns the default value instead of crashing with KeyError.",
  },
  {
    id: "py-8",
    deck: "python_basics",
    tag: "SLICING",
    prompt: "Reverse a list in one clean slice:",
    codeTemplate: "nums = [1, 2, 3, 4]\nrev = nums[ ___ ]",
    options: ["[::-1]", "[::-2]", "[1:-1]", "[:0]"],
    correctIndex: 0,
    explanation:
      "A step of -1 in [::-1] walks through the list backward from end to start.",
  },
  {
    id: "py-9",
    deck: "python_basics",
    tag: "SETS",
    prompt: "Remove all duplicate IDs from a list in one call:",
    codeTemplate: "ids = [4, 4, 9, 9, 1]\nunique_count = len([ ___ ](ids))",
    options: ["set", "dict", "tuple", "list"],
    correctIndex: 0,
    explanation:
      "Converting a list to a set(...) automatically drops every duplicate value.",
  },
  {
    id: "py-10",
    deck: "python_basics",
    tag: "SORTING",
    prompt: "Return a new list sorted from HIGHEST to LOWEST:",
    codeTemplate: "scores = [40, 95, 70]\ntop = sorted(scores, [ ___ ]=True)",
    options: ["reverse", "desc", "flip", "invert"],
    correctIndex: 0,
    explanation:
      "Passing reverse=True to sorted() orders items from largest to smallest.",
  },
  {
    id: "py-11",
    deck: "python_basics",
    tag: "LAMBDAS",
    prompt: "Create an inline 1-line anonymous function that triples x:",
    codeTemplate: "triple = [ ___ ] x: x * 3\nprint(triple(7))",
    options: ["lambda", "def", "func", "arrow"],
    correctIndex: 0,
    explanation:
      "lambda creates a quick one-line function without needing a full def block.",
  },
  {
    id: "py-12",
    deck: "python_basics",
    tag: "ZIPPING",
    prompt: "Pair a list of keys and a list of values into a dictionary:",
    codeTemplate: "roster = dict([ ___ ](names, scores))",
    options: ["zip", "pair", "merge", "join"],
    correctIndex: 0,
    explanation:
      "zip(a, b) pairs items at matching positions so dict() can turn them into key-value pairs.",
  },

  // Algorithms & Big-O Deck
  {
    id: "algo-1",
    deck: "algorithms",
    tag: "HASH MAP O(1)",
    prompt: "Calculate the complement needed to reach target in Two Sum:",
    codeTemplate: "need = [ ___ ] - num\nif need in seen:",
    options: ["target", "seen", "num * 2", "len(nums)"],
    correctIndex: 0,
    explanation:
      "If num + need == target, then the partner number we are looking for is target - num.",
  },
  {
    id: "algo-2",
    deck: "algorithms",
    tag: "TWO POINTERS",
    prompt: "Check if a cleaned string reads the same forward and backward:",
    codeTemplate: "is_palindrome = (clean == clean[ ___ ])",
    options: ["[::-1]", "[0:1]", "[1:]", "[-1]"],
    correctIndex: 0,
    explanation:
      "Comparing clean to its reversed slice clean[::-1] checks for a palindrome in one line.",
  },
  {
    id: "algo-3",
    deck: "algorithms",
    tag: "BINARY SEARCH",
    prompt: "Find the middle index between left and right using integer division:",
    codeTemplate: "mid = (left + right) [ ___ ] 2",
    options: ["//", "/", "%", "**"],
    correctIndex: 0,
    explanation:
      "Floor division (//) returns a whole integer index so Python can use it inside nums[mid].",
  },
  {
    id: "algo-4",
    deck: "algorithms",
    tag: "STACKS (LIFO)",
    prompt: "Remove and return the top item from a stack list:",
    codeTemplate: "top_bracket = stack.[ ___ ]()",
    options: ["pop", "shift", "remove_first", "peek"],
    correctIndex: 0,
    explanation:
      "list.pop() removes and returns the last (topmost) element in O(1) time.",
  },
  {
    id: "algo-5",
    deck: "algorithms",
    tag: "ANAGRAM CHECK",
    prompt: "Verify if two words contain the exact same letters and counts:",
    codeTemplate: "is_anagram = [ ___ ](word_a) == sorted(word_b)",
    options: ["sorted", "set", "len", "reversed"],
    correctIndex: 0,
    explanation:
      "Sorting both strings puts identical letters in alphabetical order so they can be compared with ==.",
  },
  {
    id: "algo-6",
    deck: "algorithms",
    tag: "DUPLICATE CHECK",
    prompt: "Detect if any number appears more than once in nums:",
    codeTemplate: "has_dup = len(nums) != len([ ___ ](nums))",
    options: ["set", "list", "tuple", "sorted"],
    correctIndex: 0,
    explanation:
      "Since set(nums) removes duplicates, a smaller set length means at least one duplicate existed.",
  },
  {
    id: "algo-7",
    deck: "algorithms",
    tag: "MISSING NUMBER",
    prompt: "Find the missing number in 0..n by subtracting actual sum from expected sum:",
    codeTemplate: "missing = sum(range(len(nums) + 1)) - [ ___ ](nums)",
    options: ["sum", "max", "len", "min"],
    correctIndex: 0,
    explanation:
      "Subtracting sum(nums) from the full 0..n sum leaves only the missing number.",
  },
  {
    id: "algo-8",
    deck: "algorithms",
    tag: "MAJORITY ELEMENT",
    prompt: "Grab the majority element (> 50% frequency) after sorting nums:",
    codeTemplate: "majority = sorted(nums)[len(nums) [ ___ ] 2]",
    options: ["//", "%", "*", "-"],
    correctIndex: 0,
    explanation:
      "An element appearing more than n/2 times is guaranteed to occupy the center index len(nums) // 2.",
  },

  // System Design Deck
  {
    id: "sys-1",
    deck: "system_design",
    tag: "LOAD BALANCER",
    prompt: "Wrap request index i around len(servers) for Round-Robin routing:",
    codeTemplate: "server = servers[i [ ___ ] len(servers)]",
    options: ["%", "//", "/", "**"],
    correctIndex: 0,
    explanation:
      "The modulo operator (%) wraps any counter neatly between 0 and len(servers) - 1.",
  },
  {
    id: "sys-2",
    deck: "system_design",
    tag: "DATABASE SHARDING",
    prompt: "Route user_id to one of num_shards database partitions:",
    codeTemplate: "shard_id = user_id [ ___ ] num_shards",
    options: ["%", "//", "+", "&"],
    correctIndex: 0,
    explanation:
      "user_id % num_shards deterministically maps every user to the same shard between 0 and num_shards - 1.",
  },
  {
    id: "sys-3",
    deck: "system_design",
    tag: "QUORUM CONSENSUS",
    prompt: "Calculate the strict majority of nodes needed for a valid quorum:",
    codeTemplate: "required_votes = (total_nodes // 2) [ ___ ] 1",
    options: ["+", "-", "*", "%"],
    correctIndex: 0,
    explanation:
      "Strict majority is half the cluster (floored) plus 1—for example, 3 out of 5 nodes.",
  },
  {
    id: "sys-4",
    deck: "system_design",
    tag: "EXPONENTIAL BACKOFF",
    prompt: "Double the retry wait time on each attempt (1, 2, 4, 8...):",
    codeTemplate: "wait_seconds = 2 [ ___ ] retry_attempt",
    options: ["**", "*", "//", "^"],
    correctIndex: 0,
    explanation:
      "In Python, ** is the exponent operator (2 ** 3 == 8), whereas ^ is bitwise XOR.",
  },
  {
    id: "sys-5",
    deck: "system_design",
    tag: "IDEMPOTENCY",
    prompt: "Skip charging a customer if request_id was already processed:",
    codeTemplate: "if request_id [ ___ ] processed_ids:\n    return 'DUPLICATE'",
    options: ["in", "==", "is", "has"],
    correctIndex: 0,
    explanation:
      "Checking `request_id in processed_ids` on a set takes O(1) time and prevents double charges.",
  },
  {
    id: "sys-6",
    deck: "system_design",
    tag: "CACHE TTL",
    prompt: "Check if a cached item is still fresh before its TTL expires:",
    codeTemplate: "is_valid = (now - saved_at) [ ___ ] ttl_seconds",
    options: ["<", ">", "==", "%"],
    correctIndex: 0,
    explanation:
      "If elapsed time (now - saved_at) is less than (<) ttl_seconds, the cache entry is still fresh.",
  },
];

const BLITZ_HIGHSCORE_KEY = "devlearn_blitz_highscore_v1";

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
  const [selectedDeck, setSelectedDeck] =
    useState<BlitzDeckKey>("python_basics");
  const [gameState, setGameState] = useState<"lobby" | "playing" | "finished">(
    "lobby",
  );
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [deckQueue, setDeckQueue] = useState<BlitzCardItem[]>([]);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);

  const [scoreXp, setScoreXp] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [bonusSecondsToast, setBonusSecondsToast] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = Number(window.localStorage.getItem(BLITZ_HIGHSCORE_KEY));
      return Number.isFinite(saved) ? saved : 0;
    }
    return 0;
  });

  const scoreXpRef = useRef<number>(0);
  scoreXpRef.current = scoreXp;

  const filteredPool = useMemo(() => {
    if (selectedDeck === "all") {
      return isPremium
        ? BLITZ_CARDS
        : BLITZ_CARDS.filter((c) => c.deck === "python_basics");
    }
    return BLITZ_CARDS.filter((c) => c.deck === selectedDeck);
  }, [selectedDeck, isPremium]);

  function startRound(deckKey: BlitzDeckKey = selectedDeck) {
    if (
      (deckKey === "algorithms" || deckKey === "system_design") &&
      !isPremium
    ) {
      onRequirePro();
      return;
    }
    const pool =
      deckKey === "all"
        ? isPremium
          ? BLITZ_CARDS
          : BLITZ_CARDS.filter((c) => c.deck === "python_basics")
        : BLITZ_CARDS.filter((c) => c.deck === deckKey);

    setDeckQueue(shuffleCards(pool));
    setCardIndex(0);
    setPickedOption(null);
    setScoreXp(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setAttemptCount(0);
    setTimeLeft(60);
    setGameState("playing");
  }

  function finishRound(finalXp: number) {
    setGameState("finished");
    if (finalXp > 0) {
      onAwardBlitzXp(finalXp);
    }
    if (finalXp > highScore) {
      setHighScore(finalXp);
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem(BLITZ_HIGHSCORE_KEY, String(finalXp));
        } catch (_e) {}
      }
    }
  }

  // Countdown timer effect
  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishRound(scoreXpRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const currentCard = deckQueue[cardIndex % Math.max(deckQueue.length, 1)];
  const multiplier = Math.min(4, Math.floor(combo / 2) + 1);

  function handleSelectOption(idx: number) {
    if (gameState !== "playing" || pickedOption !== null || !currentCard) {
      return;
    }
    setPickedOption(idx);
    setAttemptCount((prev) => prev + 1);

    const isRight = idx === currentCard.correctIndex;
    if (isRight) {
      const nextCombo = combo + 1;
      const nextMult = Math.min(4, Math.floor(nextCombo / 2) + 1);
      const earned = 10 * nextMult;
      const nextXp = scoreXp + earned;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCorrectCount((prev) => prev + 1);
      setScoreXp(nextXp);

      if (nextCombo % 3 === 0) {
        setTimeLeft((prev) => Math.min(60, prev + 2));
        setBonusSecondsToast(true);
        setTimeout(() => setBonusSecondsToast(false), 1100);
      }
    } else {
      setCombo(0);
    }
  }

  function handleNextCard() {
    if (gameState !== "playing") return;
    setPickedOption(null);
    if (cardIndex + 1 >= deckQueue.length) {
      setDeckQueue((prev) => [...prev, ...shuffleCards(filteredPool)]);
    }
    setCardIndex((prev) => prev + 1);
  }

  // Web keyboard support (1-4 to pick option, Enter/Space to advance)
  useEffect(() => {
    if (Platform.OS !== "web" || gameState !== "playing") return;
    function onKeyDown(e: KeyboardEvent) {
      if (pickedOption === null) {
        if (e.key === "1") handleSelectOption(0);
        if (e.key === "2") handleSelectOption(1);
        if (e.key === "3") handleSelectOption(2);
        if (e.key === "4") handleSelectOption(3);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleNextCard();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, pickedOption, cardIndex, combo, scoreXp]);

  const accuracyPct =
    attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 100;
  const rating = getBlitzSpeedRating(correctCount);

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
          <Text style={styles.highScoreLabel}>PERSONAL BEST</Text>
          <Text style={styles.highScoreValue}>⚡ {highScore} XP</Text>
        </View>
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
                setSelectedDeck(d.key);
                if (gameState === "playing") {
                  startRound(d.key);
                }
              }}
            >
              <Text
                style={[
                  styles.deckPillText,
                  isSelected && styles.deckPillTextActive,
                ]}
              >
                {d.label}
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

      {gameState === "lobby" && (
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
            onPress={() => startRound(selectedDeck)}
          >
            <Text style={styles.startBlitzBtnText}>
              INSERT COIN · START 60s BLITZ →
            </Text>
          </Pressable>
        </View>
      )}

      {gameState === "playing" && currentCard && (
        <View style={styles.arenaCard}>
          {/* Live Telemetry HUD */}
          <View style={styles.hudBar}>
            <View style={styles.hudTimerBox}>
              <Text style={styles.hudLabel}>TIME REMAINING</Text>
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
                  width: `${Math.max((timeLeft / 60) * 100, 2)}%`,
                  backgroundColor:
                    timeLeft > 30
                      ? StudioColors.lime
                      : timeLeft > 15
                        ? StudioColors.yellow
                        : StudioColors.coral,
                },
              ]}
            />
          </View>

          {/* Prompt & Code Card */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.topicTagPill}>
              <Text style={styles.topicTagText}>{currentCard.tag}</Text>
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
                    ? `✓ HIT! +${10 * multiplier} XP (${multiplier}x Multiplier)`
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
                <Text style={styles.nextCardBtnText}>NEXT CARD (↵) →</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {gameState === "finished" && (
        <View style={styles.scoreboardCard}>
          <View
            style={[
              styles.ratingBadgePill,
              { backgroundColor: rating.color },
            ]}
          >
            <Text style={styles.ratingBadgeText}>{rating.badge}</Text>
          </View>

          <Text style={styles.scoreboardTitle}>{rating.title}</Text>
          <Text style={styles.scoreboardSubtitle}>
            60-Second Blitz Complete · +{scoreXp} XP added to your developer
            profile!
          </Text>

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
              <Text style={styles.metricLabel}>ACCURACY</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.startBlitzBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={() => startRound(selectedDeck)}
          >
            <Text style={styles.startBlitzBtnText}>
              PLAY ANOTHER 60s ROUND ↻
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StudioColors.bg,
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
});
