import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  View,
} from "react-native";
import { Text } from "./StudioIcon";
import {
  buildWeeklyRhythmDays,
  getHoursUntilMidnight,
  getTodayDateKey,
} from "../constants/streaks";
import {
  StudioColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  readLocalJsonAsync,
  writeLocalJson,
} from "../types/lesson";
import {
  getLofiChannelMeta,
  getLofiRadioState,
  hydrateLofiChannelPreference,
  LOFI_CHANNELS,
  type LofiRadioState,
  selectAndPlayLofiChannel,
  subscribeLofiRadio,
  toggleLofiRadio,
} from "../utils/lofiRadio";
import {
  playCrtChannelSwitch,
  playKeyClick,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";
import ByteCatChillhopBackdrop from "./ByteCatChillhopBackdrop";
import CozyCodingByteCatStage from "./ByteCatCozyStage";
import { getByteCatStyles } from "./byteCatStyles";
import {
  BYTE_CAT_QUOTES,
  type ByteCatQuote,
  type CompanionMode,
  CYBER_WHISPERS,
  getPetLevelProgress,
  IDLE_BREAK_META,
  IDLE_BREAK_ORDER,
  type IdleBreakAction,
  PET_LEVEL_TIERS,
  TRACK_QUIZZES,
  TRACK_SNACKS,
  TREAT_WHISPERS,
} from "../constants/byteCatData";

const STORAGE_BYTECAT_QUOTE_KEY = "devlearn_bytecat_quote_state_v1";
const STORAGE_BYTECAT_QUOTE_PREFS_KEY = "devlearn_bytecat_quote_prefs_v1";
const STORAGE_BYTECAT_PET_KEY = "devlearn_bytecat_pet_v1";
const TREAT_XP_AMOUNT = 15;

export { BYTE_CAT_QUOTES, type ByteCatQuote };

interface ByteCatGuideCardProps {
  completedCount: number;
  totalCount: number;
  activeTrack?: string;
  activeTrackLabel: string;
  activeTrackAccent?: string;
  isPremium?: boolean;
  streakCount?: number;
  lastActiveDate?: string | null;
  onOpenPaywall?: () => void;
}

export default function ByteCatGuideCard({
  completedCount,
  totalCount,
  activeTrack = "python_basics",
  activeTrackLabel,
  activeTrackAccent = StudioColors.yellow,
  isPremium = false,
  streakCount = 0,
  lastActiveDate = null,
  onOpenPaywall,
}: ByteCatGuideCardProps) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(getByteCatStyles);

  const [mode, setMode] = useState<CompanionMode>("wisdom");
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [savedQuoteIds, setSavedQuoteIds] = useState<number[]>([]);
  const [quoteFilter, setQuoteFilter] = useState<"all" | "saved">("all");
  const [snackIndex, setSnackIndex] = useState<number>(0);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizSelection, setQuizSelection] = useState<{
    key: string;
    optionIdx: number;
  } | null>(null);
  const [quizSolvedCount, setQuizSolvedCount] = useState<number>(0);

  const [petXp, setPetXp] = useState<number>(0);
  const [treatsGiven, setTreatsGiven] = useState<number>(0);
  const [lastTreatDate, setLastTreatDate] = useState<string | null>(null);
  const [todayKey, setTodayKey] = useState<string>("");
  const [whisperText, setWhisperText] = useState<string>("⌨️ CODING IN THE ZONE");
  const [hyperPurrActive, setHyperPurrActive] = useState<boolean>(false);
  const [idleBreakAction, setIdleBreakAction] = useState<IdleBreakAction>(null);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [activeKeyStep, setActiveKeyStep] = useState<number>(0);
  const [avatarHovered, setAvatarHovered] = useState<boolean>(false);
  const [cardHovered, setCardHovered] = useState<boolean>(false);
  const [appStateValue, setAppStateValue] = useState<string>(
    AppState.currentState || "active",
  );

  // Floating popup labels (4 recycled animated slots so bursts animate smoothly)
  const [popupLabels, setPopupLabels] = useState<
    [string, string, string, string]
  >(["", "", "", ""]);
  const [popupAnims] = useState(() => [
    { y: new Animated.Value(0), op: new Animated.Value(0), sc: new Animated.Value(0.7) },
    { y: new Animated.Value(0), op: new Animated.Value(0), sc: new Animated.Value(0.7) },
    { y: new Animated.Value(0), op: new Animated.Value(0), sc: new Animated.Value(0.7) },
    { y: new Animated.Value(0), op: new Animated.Value(0), sc: new Animated.Value(0.7) },
  ]);
  const nextPopupSlotRef = useRef<number>(0);
  const hyperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breakStepRef = useRef<number>(0);
  const breakResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteSwapSeqRef = useRef<number>(0);
  const stepQuoteRef = useRef<(direction: -1 | 1) => void>(() => {});

  // Stage animations
  const [wiggleAnim] = useState(() => new Animated.Value(0));
  const [squishXAnim] = useState(() => new Animated.Value(1));
  const [squishYAnim] = useState(() => new Animated.Value(1));
  const [hoverScaleAnim] = useState(() => new Animated.Value(1));
  const [cardLiftAnim] = useState(() => new Animated.Value(0));
  const [ledPulseAnim] = useState(() => new Animated.Value(0));
  const [sparkleAnim] = useState(() => new Animated.Value(0));
  const [eqAnim1] = useState(() => new Animated.Value(0.35));
  const [eqAnim2] = useState(() => new Animated.Value(0.75));
  const [eqAnim3] = useState(() => new Animated.Value(0.5));
  const [contentFadeAnim] = useState(() => new Animated.Value(1));
  const [contentSlideAnim] = useState(() => new Animated.Value(0));
  const [quoteFadeAnim] = useState(() => new Animated.Value(1));
  const [quoteSlideXAnim] = useState(() => new Animated.Value(0));
  const [quoteScaleAnim] = useState(() => new Animated.Value(1));
  const [quoteMarkPopAnim] = useState(() => new Animated.Value(1));
  const [quoteMarkFloatAnim] = useState(() => new Animated.Value(0));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [petBarAnim] = useState(() => new Animated.Value(8));
  const [lofiState, setLofiState] = useState<LofiRadioState>(() =>
    getLofiRadioState(),
  );
  const activeLofiMeta = getLofiChannelMeta(lofiState.channel);

  useEffect(() => {
    void hydrateLofiChannelPreference();
    return subscribeLofiRadio(setLofiState);
  }, []);

  const petProgress = isPremium
    ? getPetLevelProgress(petXp)
    : getPetLevelProgress(0);
  const petLevel = petProgress.level;
  const activeTier = petProgress.tier;
  const treatedToday = Boolean(isPremium && todayKey && lastTreatDate === todayKey);

  const trackPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const weeklyRhythm = useMemo(
    () =>
      buildWeeklyRhythmDays({
        streakCount,
        lastActiveDate,
        todayKey: todayKey || undefined,
      }),
    [lastActiveDate, streakCount, todayKey],
  );

  // Top bar LED pulse and subtle crown/ambient drift
  useEffect(() => {
    const ledLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ledPulseAnim, {
          toValue: 1,
          duration: 950,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(ledPulseAnim, {
          toValue: 0,
          duration: 950,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    const quoteFloatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(quoteMarkFloatAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(quoteMarkFloatAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    ledLoop.start();
    sparkleLoop.start();
    quoteFloatLoop.start();

    return () => {
      ledLoop.stop();
      sparkleLoop.stop();
      quoteFloatLoop.stop();
    };
  }, [ledPulseAnim, quoteMarkFloatAnim, sparkleAnim]);

  // Mini equalizer waveform loop (active rhythm when Lo-Fi Radio is playing; gentle idle otherwise)
  useEffect(() => {
    if (!lofiState.isPlaying && !hyperPurrActive) {
      eqAnim1.setValue(0.32);
      eqAnim2.setValue(0.55);
      eqAnim3.setValue(0.4);
      return;
    }
    const fastWave = hyperPurrActive || lofiState.isPlaying;
    const speed = hyperPurrActive ? 170 : 280;
    const eqLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(eqAnim1, {
            toValue: fastWave ? 1 : 0.85,
            duration: speed,
            useNativeDriver: false,
          }),
          Animated.timing(eqAnim1, {
            toValue: 0.28,
            duration: speed,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(eqAnim2, {
            toValue: 0.3,
            duration: speed * 0.85,
            useNativeDriver: false,
          }),
          Animated.timing(eqAnim2, {
            toValue: 1,
            duration: speed * 0.85,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(eqAnim3, {
            toValue: fastWave ? 0.95 : 0.78,
            duration: speed * 1.1,
            useNativeDriver: false,
          }),
          Animated.timing(eqAnim3, {
            toValue: 0.25,
            duration: speed * 1.1,
            useNativeDriver: false,
          }),
        ]),
      ]),
    );
    eqLoop.start();
    return () => eqLoop.stop();
  }, [eqAnim1, eqAnim2, eqAnim3, hyperPurrActive, lofiState.isPlaying]);

  // Avatar & card hover springs
  useEffect(() => {
    Animated.spring(hoverScaleAnim, {
      toValue: avatarHovered ? 1.07 : 1,
      friction: 5,
      tension: 180,
      useNativeDriver: false,
    }).start();
  }, [avatarHovered, hoverScaleAnim]);

  useEffect(() => {
    Animated.spring(cardLiftAnim, {
      toValue: cardHovered ? -3 : 0,
      friction: 7,
      tension: 180,
      useNativeDriver: false,
    }).start();
  }, [cardHovered, cardLiftAnim]);

  // Animated progress & pet XP bar glides
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.max(trackPct, 4),
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, trackPct]);

  useEffect(() => {
    Animated.timing(petBarAnim, {
      toValue: petProgress.pctInLevel,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [petBarAnim, petProgress.pctInLevel]);

  const triggerIdleBreak = useCallback(
    (action?: Exclude<IdleBreakAction, null>) => {
      const chosen =
        action ||
        IDLE_BREAK_ORDER[breakStepRef.current % IDLE_BREAK_ORDER.length];
      breakStepRef.current += 1;

      if (breakResetTimerRef.current) {
        clearTimeout(breakResetTimerRef.current);
      }
      setIdleBreakAction(chosen);
      setWhisperText(IDLE_BREAK_META[chosen].whisper);

      breakResetTimerRef.current = setTimeout(() => {
        setIdleBreakAction(null);
        setWhisperText("⌨️ CODING IN THE ZONE");
      }, 2400);
    },
    [],
  );

  // Automatic 10-second loop cycling Coffee Sip -> Big Stretch -> Bug Swat -> Eureka Jam
  useEffect(() => {
    const breakInterval = setInterval(() => {
      triggerIdleBreak();
    }, 10000);

    return () => {
      clearInterval(breakInterval);
      if (breakResetTimerRef.current) clearTimeout(breakResetTimerRef.current);
    };
  }, [triggerIdleBreak]);

  // Natural eye blink & mechanical keycap lighting cycle while coding
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
      }, 150);
    }, 3200);

    const keyInterval = setInterval(() => {
      setActiveKeyStep((prev) => (prev + 1) % 4);
    }, 240);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(keyInterval);
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hyperTimerRef.current) clearTimeout(hyperTimerRef.current);
    };
  }, []);

  const triggerContentTransition = useCallback(() => {
    contentFadeAnim.setValue(0.25);
    contentSlideAnim.setValue(8);
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 210,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.spring(contentSlideAnim, {
        toValue: 0,
        friction: 7,
        tension: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [contentFadeAnim, contentSlideAnim]);

  const animateQuoteSwap = useCallback(
    (direction: -1 | 0 | 1, applyQuote: () => void) => {
      quoteSwapSeqRef.current += 1;
      const seq = quoteSwapSeqRef.current;

      quoteFadeAnim.stopAnimation();
      quoteSlideXAnim.stopAnimation();
      quoteScaleAnim.stopAnimation();
      quoteMarkPopAnim.stopAnimation();

      const exitX = direction === 0 ? 0 : -direction * 24;
      const enterX = direction === 0 ? 0 : direction * 28;

      Animated.parallel([
        Animated.timing(quoteFadeAnim, {
          toValue: 0,
          duration: 115,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(quoteSlideXAnim, {
          toValue: exitX,
          duration: 115,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(quoteScaleAnim, {
          toValue: 0.965,
          duration: 115,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(quoteMarkPopAnim, {
          toValue: 0.86,
          duration: 115,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (!finished || seq !== quoteSwapSeqRef.current) return;
        applyQuote();
        quoteSlideXAnim.setValue(enterX);
        quoteFadeAnim.setValue(0);
        quoteScaleAnim.setValue(0.965);
        quoteMarkPopAnim.setValue(0.86);

        Animated.parallel([
          Animated.timing(quoteFadeAnim, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(quoteSlideXAnim, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(quoteScaleAnim, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.spring(quoteMarkPopAnim, {
            toValue: 1,
            friction: 7,
            tension: 160,
            useNativeDriver: false,
          }),
        ]).start();
      });
    },
    [quoteFadeAnim, quoteMarkPopAnim, quoteScaleAnim, quoteSlideXAnim],
  );

  const quotePanResponder = useMemo(() => {
    const snapQuoteBack = () => {
      Animated.parallel([
        Animated.timing(quoteSlideXAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(quoteFadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: false,
        }),
        Animated.timing(quoteScaleAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: false,
        }),
      ]).start();
    };

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 10 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
      onPanResponderMove: (_evt, gesture) => {
        const clampedDx = Math.max(-56, Math.min(56, gesture.dx * 0.5));
        quoteSlideXAnim.setValue(clampedDx);
        quoteFadeAnim.setValue(Math.max(0.45, 1 - Math.abs(gesture.dx) / 200));
        quoteScaleAnim.setValue(
          Math.max(0.97, 1 - Math.abs(gesture.dx) / 1400),
        );
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dx <= -34 || gesture.vx <= -0.35) {
          stepQuoteRef.current(1);
        } else if (gesture.dx >= 34 || gesture.vx >= 0.35) {
          stepQuoteRef.current(-1);
        } else {
          snapQuoteBack();
        }
      },
      onPanResponderTerminate: snapQuoteBack,
    });
  }, [quoteFadeAnim, quoteScaleAnim, quoteSlideXAnim]);

  const spawnFloatingPopup = useCallback(
    (label: string, delayMs = 0) => {
      const slotIdx = nextPopupSlotRef.current % 4;
      nextPopupSlotRef.current += 1;

      setPopupLabels((prev) => {
        const next: [string, string, string, string] = [...prev] as [
          string,
          string,
          string,
          string,
        ];
        next[slotIdx] = label;
        return next;
      });

      const slot = popupAnims[slotIdx];
      slot.y.setValue(0);
      slot.op.setValue(delayMs > 0 ? 0 : 1);
      slot.sc.setValue(0.65);

      const startSequence = Animated.parallel([
        Animated.timing(slot.y, {
          toValue: -38,
          duration: 820,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.spring(slot.sc, {
            toValue: 1.08,
            friction: 5,
            tension: 200,
            useNativeDriver: false,
          }),
          Animated.timing(slot.sc, {
            toValue: 0.95,
            duration: 420,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(slot.op, {
            toValue: 1,
            duration: 90,
            useNativeDriver: false,
          }),
          Animated.delay(220),
          Animated.timing(slot.op, {
            toValue: 0,
            duration: 510,
            useNativeDriver: false,
          }),
        ]),
      ]);

      if (delayMs > 0) {
        Animated.sequence([Animated.delay(delayMs), startSequence]).start();
      } else {
        startSequence.start();
      }
    },
    [popupAnims],
  );

  const triggerPlayfulBounce = useCallback(
    (strong = false) => {
      squishXAnim.setValue(strong ? 1.18 : 1.11);
      squishYAnim.setValue(strong ? 0.84 : 0.9);
      wiggleAnim.setValue(0);

      Animated.parallel([
        Animated.spring(squishXAnim, {
          toValue: 1,
          friction: 4,
          tension: 190,
          useNativeDriver: false,
        }),
        Animated.spring(squishYAnim, {
          toValue: 1,
          friction: 4,
          tension: 190,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(wiggleAnim, {
            toValue: strong ? 1.5 : 1,
            duration: 65,
            useNativeDriver: false,
          }),
          Animated.timing(wiggleAnim, {
            toValue: strong ? -1.5 : -1,
            duration: 80,
            useNativeDriver: false,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0.7,
            duration: 75,
            useNativeDriver: false,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0,
            duration: 80,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    },
    [squishXAnim, squishYAnim, wiggleAnim],
  );

  const triggerHeadShake = useCallback(() => {
    wiggleAnim.setValue(0);
    Animated.sequence([
      Animated.timing(wiggleAnim, {
        toValue: -1.3,
        duration: 60,
        useNativeDriver: false,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 1.3,
        duration: 70,
        useNativeDriver: false,
      }),
      Animated.timing(wiggleAnim, {
        toValue: -0.8,
        duration: 65,
        useNativeDriver: false,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 0,
        duration: 65,
        useNativeDriver: false,
      }),
    ]).start();
  }, [wiggleAnim]);

  const advanceToFreshQuote = useCallback(
    (animate = false) => {
      const applyNext = () => {
        setQuoteIndex((prev) => {
          const offset =
            1 + Math.floor(Math.random() * (BYTE_CAT_QUOTES.length - 1));
          const nextIdx = (prev + offset) % BYTE_CAT_QUOTES.length;
          writeLocalJson(STORAGE_BYTECAT_QUOTE_KEY, {
            lastIndex: nextIdx,
            updatedAt: Date.now(),
          });
          return nextIdx;
        });
      };

      if (animate) {
        playKeyClick();
        animateQuoteSwap(1, applyNext);
      } else {
        applyNext();
      }
    },
    [animateQuoteSwap],
  );

  // On mount: load persisted quote state & Pro Pet XP state asynchronously
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      readLocalJsonAsync<{ lastIndex?: number }>(STORAGE_BYTECAT_QUOTE_KEY, {}),
      readLocalJsonAsync<{ savedIds?: number[] }>(
        STORAGE_BYTECAT_QUOTE_PREFS_KEY,
        {},
      ),
      readLocalJsonAsync<{
        petXp?: number;
        treatsGiven?: number;
        lastTreatDate?: string;
      }>(STORAGE_BYTECAT_PET_KEY, {}),
    ]).then(([savedQuote, savedPrefs, savedPet]) => {
      if (cancelled) return;
      const prevIdx =
        typeof savedQuote.lastIndex === "number" ? savedQuote.lastIndex : -1;
      const nextIdx = (prevIdx + 1) % BYTE_CAT_QUOTES.length;
      setQuoteIndex(nextIdx);
      writeLocalJson(STORAGE_BYTECAT_QUOTE_KEY, {
        lastIndex: nextIdx,
        updatedAt: Date.now(),
      });

      if (Array.isArray(savedPrefs.savedIds)) {
        setSavedQuoteIds(
          savedPrefs.savedIds.filter((id) => typeof id === "number"),
        );
      }

      const currentDayKey = getTodayDateKey();
      setTodayKey(currentDayKey);

      if (typeof savedPet.petXp === "number" && savedPet.petXp > 0) {
        setPetXp(savedPet.petXp);
      }
      if (typeof savedPet.treatsGiven === "number" && savedPet.treatsGiven > 0) {
        setTreatsGiven(savedPet.treatsGiven);
      }
      if (typeof savedPet.lastTreatDate === "string" && savedPet.lastTreatDate) {
        setLastTreatDate(savedPet.lastTreatDate);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh quote & daily treat day check on tab / app foregrounding
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          setTodayKey(getTodayDateKey());
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
        setTodayKey(getTodayDateKey());
        advanceToFreshQuote(false);
      }
      setAppStateValue(nextAppState);
    });

    return () => {
      sub.remove();
    };
  }, [advanceToFreshQuote, appStateValue]);

  const snacks = TRACK_SNACKS[activeTrack] || TRACK_SNACKS.python_basics;
  const quizzes = TRACK_QUIZZES[activeTrack] || TRACK_QUIZZES.python_basics;
  const savedQuotes = BYTE_CAT_QUOTES.filter((q) =>
    savedQuoteIds.includes(q.id),
  );
  const usingSavedFilter = quoteFilter === "saved" && savedQuotes.length > 0;
  const activeQuotePool = usingSavedFilter ? savedQuotes : BYTE_CAT_QUOTES;
  const rawQuote = BYTE_CAT_QUOTES[quoteIndex] || BYTE_CAT_QUOTES[0];
  const currentQuote = usingSavedFilter
    ? savedQuotes.find((q) => q.id === rawQuote.id) || savedQuotes[0]
    : rawQuote;
  const isCurrentQuoteSaved = savedQuoteIds.includes(currentQuote.id);
  const activePoolIdx = Math.max(
    0,
    activeQuotePool.findIndex((q) => q.id === currentQuote.id),
  );
  const currentSnack = snacks[snackIndex % snacks.length];
  const safeQuizIdx = quizIndex % quizzes.length;
  const currentQuiz = quizzes[safeQuizIdx];
  const currentQuizKey = `${activeTrack}-${safeQuizIdx}`;
  const selectedQuizOpt =
    quizSelection?.key === currentQuizKey ? quizSelection.optionIdx : null;

  const stepQuote = useCallback(
    (direction: -1 | 1) => {
      playKeyClick();
      const nextPoolIdx =
        (activePoolIdx + direction + activeQuotePool.length) %
        activeQuotePool.length;
      const nextQuote = activeQuotePool[nextPoolIdx] || BYTE_CAT_QUOTES[0];
      const nextGlobalIdx = Math.max(
        0,
        BYTE_CAT_QUOTES.findIndex((q) => q.id === nextQuote.id),
      );
      animateQuoteSwap(direction, () => {
        setQuoteIndex(nextGlobalIdx);
        writeLocalJson(STORAGE_BYTECAT_QUOTE_KEY, {
          lastIndex: nextGlobalIdx,
          updatedAt: Date.now(),
        });
      });
      setWhisperText(direction > 0 ? "▶ NEXT QUOTE!" : "◀ PREV QUOTE!");
    },
    [activePoolIdx, activeQuotePool, animateQuoteSwap],
  );

  useEffect(() => {
    stepQuoteRef.current = stepQuote;
  }, [stepQuote]);

  function handleToggleSaveQuote() {
    const exists = savedQuoteIds.includes(currentQuote.id);
    const nextSaved = exists
      ? savedQuoteIds.filter((id) => id !== currentQuote.id)
      : [...savedQuoteIds, currentQuote.id];
    setSavedQuoteIds(nextSaved);
    if (exists && quoteFilter === "saved" && nextSaved.length === 0) {
      setQuoteFilter("all");
    }
    writeLocalJson(STORAGE_BYTECAT_QUOTE_PREFS_KEY, {
      savedIds: nextSaved,
    });
    if (exists) {
      playKeyClick();
      setWhisperText("☆ REMOVED PIN");
      spawnFloatingPopup("QUOTE UNSAVED");
    } else {
      playSuccessChime();
      triggerPlayfulBounce(false);
      setWhisperText("★ QUOTE PINNED!");
      spawnFloatingPopup("★ SAVED TO FAVS");
    }
  }

  function handleToggleQuoteFilter() {
    playKeyClick();
    if (quoteFilter === "saved") {
      animateQuoteSwap(0, () => {
        setQuoteFilter("all");
      });
      setWhisperText(`📚 ALL ${BYTE_CAT_QUOTES.length} QUOTES`);
      return;
    }
    if (savedQuotes.length === 0) return;
    const firstSavedGlobalIdx = Math.max(
      0,
      BYTE_CAT_QUOTES.findIndex((q) => q.id === savedQuotes[0].id),
    );
    animateQuoteSwap(0, () => {
      setQuoteFilter("saved");
      setQuoteIndex(firstSavedGlobalIdx);
    });
    setWhisperText(`★ ${savedQuotes.length} SAVED`);
  }

  function activateHyperPurr(durationMs = 1800) {
    setHyperPurrActive(true);
    if (hyperTimerRef.current) clearTimeout(hyperTimerRef.current);
    hyperTimerRef.current = setTimeout(() => {
      setHyperPurrActive(false);
    }, durationMs);
  }

  function handleTreatPet() {
    if (!isPremium) {
      playKeyClick();
      triggerHeadShake();
      setWhisperText("🔒 PRO PET FEATURE!");
      spawnFloatingPopup("🔒 PRO ONLY");
      onOpenPaywall?.();
      return;
    }

    const currentDayKey = getTodayDateKey();
    if (currentDayKey !== todayKey) {
      setTodayKey(currentDayKey);
    }

    if (lastTreatDate === currentDayKey) {
      const hoursLeft = getHoursUntilMidnight();
      playKeyClick();
      triggerPlayfulBounce(false);
      setWhisperText("🐟 FULL UNTIL TOMORROW!");
      spawnFloatingPopup(`✓ NEXT IN ~${hoursLeft}H`);
      return;
    }

    const nextXp = petXp + TREAT_XP_AMOUNT;
    const nextTreats = treatsGiven + 1;
    const prevLevel = getPetLevelProgress(petXp).level;
    const nextProgress = getPetLevelProgress(nextXp);
    const leveledUp = nextProgress.level > prevLevel;

    setPetXp(nextXp);
    setTreatsGiven(nextTreats);
    setLastTreatDate(currentDayKey);
    writeLocalJson(STORAGE_BYTECAT_PET_KEY, {
      petXp: nextXp,
      treatsGiven: nextTreats,
      lastTreatDate: currentDayKey,
    });

    if (leveledUp) {
      playVictoryFanfare();
      triggerPlayfulBounce(true);
      activateHyperPurr(2600);
      setWhisperText(
        `🎉 LVL ${nextProgress.level}: ${nextProgress.tier.perkTitle.toUpperCase()}!`,
      );
      spawnFloatingPopup(`★ LEVEL ${nextProgress.level}!`);
      spawnFloatingPopup(
        `${nextProgress.tier.icon} ${nextProgress.tier.perkTitle.toUpperCase()}`,
        120,
      );
    } else {
      playSuccessChime();
      triggerPlayfulBounce(true);
      activateHyperPurr(1800);
      const whisperPool =
        nextProgress.level >= 3 ? CYBER_WHISPERS : TREAT_WHISPERS;
      setWhisperText(whisperPool[(nextTreats - 1) % whisperPool.length]);
      spawnFloatingPopup(`🐟 +${TREAT_XP_AMOUNT} PET XP`);
      if (nextProgress.level >= 4) {
        spawnFloatingPopup("🪲 CRUNCH BURST!", 110);
      }
    }
  }

  function handleTapAvatarPortrait() {
    if (isPremium) {
      const currentDayKey = getTodayDateKey();
      if (currentDayKey !== todayKey) {
        setTodayKey(currentDayKey);
      }
      if (lastTreatDate === currentDayKey) {
        playKeyClick();
        triggerPlayfulBounce(false);
        triggerIdleBreak();
        return;
      }
      handleTreatPet();
      return;
    }
    playKeyClick();
    triggerPlayfulBounce(false);
    triggerIdleBreak();
  }

  function handleShuffleActiveMode() {
    playKeyClick();

    if (mode === "wisdom" || mode === "perks") {
      if (mode === "perks") {
        triggerContentTransition();
        setMode("wisdom");
      }
      if (usingSavedFilter && activeQuotePool.length > 1) {
        const offset =
          1 + Math.floor(Math.random() * (activeQuotePool.length - 1));
        const nextSaved =
          activeQuotePool[(activePoolIdx + offset) % activeQuotePool.length];
        const nextGlobal = Math.max(
          0,
          BYTE_CAT_QUOTES.findIndex((q) => q.id === nextSaved.id),
        );
        animateQuoteSwap(1, () => {
          setQuoteIndex(nextGlobal);
        });
      } else {
        animateQuoteSwap(1, () => {
          advanceToFreshQuote(false);
        });
      }
      setWhisperText("💬 FRESH WISDOM!");
      spawnFloatingPopup("💬 WISDOM ↻");
    } else if (mode === "snack") {
      triggerPlayfulBounce(false);
      triggerContentTransition();
      setSnackIndex((prev) => (prev + 1) % snacks.length);
      setWhisperText("💡 NEW SNACK LOADED!");
      spawnFloatingPopup("💡 SYNTAX TIP");
    } else {
      triggerPlayfulBounce(false);
      triggerContentTransition();
      setQuizSelection(null);
      setQuizIndex((prev) => (prev + 1) % quizzes.length);
      setWhisperText("⚡ QUIZ RESET!");
      spawnFloatingPopup("⚡ NEW QUIZ");
    }
  }

  function handleSwitchMode(nextMode: CompanionMode) {
    if (nextMode === mode) return;
    playKeyClick();
    triggerContentTransition();
    setMode(nextMode);
    if (nextMode === "quiz") {
      setQuizSelection(null);
      setWhisperText("🧠 TEST YOUR BRAIN!");
    } else if (nextMode === "snack") {
      setWhisperText("💡 BITE-SIZE CODE!");
    } else if (nextMode === "perks") {
      setWhisperText(`★ PET LVL ${petLevel} PERKS`);
    } else {
      setWhisperText("=^._.^= WISDOM");
    }
  }

  function handleSelectQuizOption(optIdx: number) {
    if (selectedQuizOpt !== null) return;
    setQuizSelection({ key: currentQuizKey, optionIdx: optIdx });
    const isCorrect = optIdx === currentQuiz.answerIdx;
    if (isCorrect) {
      playSuccessChime();
      triggerPlayfulBounce(true);
      activateHyperPurr(1800);
      setQuizSolvedCount((c) => c + 1);
      setWhisperText("★ PURR-FECT ANSWER!");
      spawnFloatingPopup("✓ +BRAIN XP!");
    } else {
      playKeyClick();
      triggerHeadShake();
      setWhisperText("🐾 CHECK THE HINT!");
      spawnFloatingPopup("✕ CLOSE TRY!");
    }
  }

  // Stationary, cozy twilight studio window frame colors (matches StudioColors & rainy room palette)
  const cozyOuterFrameBg = hyperPurrActive
    ? "#23293A"
    : petLevel >= 5
      ? "#26213A"
      : "#1E1B2E";
  const cozyOuterBorderColor = hyperPurrActive
    ? colors.mint
    : petLevel >= 5
      ? colors.yellow
      : colors.border;
  const cozyInnerBezelColor = hyperPurrActive
    ? StudioColors.mint
    : petLevel >= 5
      ? StudioColors.yellow
      : "#3D3656";

  const guideStatusText =
    totalCount > 0 && completedCount === totalCount
      ? `Purr-fect! All ${totalCount} ${activeTrackLabel} modules cleared!`
      : completedCount === 0
        ? `Ready to guide you through ${activeTrackLabel}!`
        : `${completedCount}/${totalCount} solved (${trackPct}%) in ${activeTrackLabel}`;

  const wiggleRotate = wiggleAnim.interpolate({
    inputRange: [-2, 2],
    outputRange: ["-6deg", "6deg"],
  });

  const combinedScaleX = Animated.multiply(squishXAnim, hoverScaleAnim);
  const combinedScaleY = Animated.multiply(squishYAnim, hoverScaleAnim);

  const ledRingScale = ledPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.1],
  });
  const ledRingOpacity = ledPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 0],
  });
  const sparkleDriftY1 = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, -4],
  });
  const eqHeight1 = eqAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 12],
  });
  const eqHeight2 = eqAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 12],
  });
  const eqHeight3 = eqAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 12],
  });
  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });
  const animatedPetBarWidth = petBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const webHoverProps =
    Platform.OS === "web"
      ? ({
          onMouseEnter: () => setCardHovered(true),
          onMouseLeave: () => setCardHovered(false),
        } as any)
      : {};

  return (
    <Animated.View
      {...webHoverProps}
      style={[
        styles.card,
        cardHovered && styles.cardHovered,
        hyperPurrActive && { borderColor: StudioColors.mint },
        { transform: [{ translateY: cardLiftAnim }] },
      ]}
    >
      {/* Top Cozy Lo-Fi Study Ribbon */}
      <View
        style={[
          styles.companionTopBar,
          hyperPurrActive && { borderBottomColor: StudioColors.mint },
        ]}
      >
        <View style={styles.companionBarLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              lofiState.isPlaying
                ? `Pause ${activeLofiMeta.label}`
                : `Play ${activeLofiMeta.label}`
            }
            onPress={() => {
              const nowPlaying = toggleLofiRadio();
              if (nowPlaying) {
                setWhisperText(`🎧 ${activeLofiMeta.subtitle}`);
                spawnFloatingPopup(`♫ ${activeLofiMeta.shortLabel}`);
              } else {
                playKeyClick();
                setWhisperText("🔇 RADIO PAUSED");
              }
            }}
            style={({ pressed }) => [
              styles.liveDotBadge,
              lofiState.isPlaying && [
                styles.liveDotBadgePlaying,
                { borderColor: activeLofiMeta.accentColor },
              ],
              pressed && { transform: [{ translateY: 1 }] },
            ]}
          >
            <View style={styles.liveDotWrap}>
              {lofiState.isPlaying && (
                <Animated.View
                  style={[
                    styles.liveDotHalo,
                    {
                      backgroundColor: activeLofiMeta.accentColor,
                      opacity: ledRingOpacity,
                      transform: [{ scale: ledRingScale }],
                    },
                  ]}
                />
              )}
              <View
                style={[
                  styles.liveDot,
                  {
                    backgroundColor: lofiState.isPlaying
                      ? activeLofiMeta.accentColor
                      : "#64748B",
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.lofiStateGlyph,
                lofiState.isPlaying && [
                  styles.lofiStateGlyphActive,
                  { color: activeLofiMeta.accentColor },
                ],
              ]}
            >
              {lofiState.isPlaying ? "❚❚" : "▶"}
            </Text>
            <Text style={styles.liveDotText}>
              {hyperPurrActive
                ? "☕ HYPER PURR FLOW"
                : `🎧 ${activeLofiMeta.label}`}
            </Text>
            <View style={styles.eqWrap}>
              <Animated.View
                style={[
                  styles.eqBar,
                  {
                    height: eqHeight1,
                    backgroundColor: lofiState.isPlaying
                      ? activeLofiMeta.accentColor
                      : "#64748B",
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.eqBar,
                  {
                    height: eqHeight2,
                    backgroundColor: lofiState.isPlaying
                      ? activeLofiMeta.accentColor
                      : "#64748B",
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.eqBar,
                  {
                    height: eqHeight3,
                    backgroundColor: lofiState.isPlaying
                      ? activeLofiMeta.accentColor
                      : "#64748B",
                  },
                ]}
              />
            </View>
          </Pressable>

          <View style={styles.lofiStationTray} accessibilityLabel="Lo-Fi radio stations">
            {LOFI_CHANNELS.map((station) => {
              const isSelected = lofiState.channel === station.id;
              const isLiveStation = isSelected && lofiState.isPlaying;
              return (
                <Pressable
                  key={station.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch music to ${station.label}`}
                  onPress={() => {
                    playCrtChannelSwitch();
                    selectAndPlayLofiChannel(station.id);
                    setWhisperText(`📻 ${station.subtitle}`);
                    spawnFloatingPopup(`📻 ${station.shortLabel}`);
                  }}
                  style={({ pressed }) => [
                    styles.lofiStationChip,
                    isSelected && [
                      styles.lofiStationChipActive,
                      {
                        borderColor: isLiveStation
                          ? station.accentColor
                          : "#4B4468",
                      },
                    ],
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                >
                  <Text
                    style={[
                      styles.lofiStationChipText,
                      isSelected && styles.lofiStationChipTextActive,
                      isLiveStation && { color: station.accentColor },
                    ]}
                  >
                    {station.chipLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Option 03: Minimal 7-Day Study Rhythm & Streak Chip */}
        <View style={styles.companionBarRight}>
          <View style={styles.rhythmDotsRow}>
            {weeklyRhythm.days.map((day) => (
              <View
                key={day.dateKey}
                accessibilityLabel={`${day.label}: ${day.done ? "completed" : day.isToday ? "today" : "pending"}`}
                style={[
                  styles.rhythmDot,
                  day.done && styles.rhythmDotDone,
                  day.isToday && styles.rhythmDotToday,
                ]}
              />
            ))}
          </View>
          <View style={styles.rhythmStreakPill}>
            <Text
              style={[
                styles.rhythmStreakText,
                weeklyRhythm.activeStreak === 0 && styles.rhythmStreakTextIdle,
              ]}
            >
              {weeklyRhythm.activeStreak > 0
                ? `${weeklyRhythm.activeStreak}D STREAK`
                : "READY TODAY"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBodyRow}>
        {/* Ambient Chillhop Ripples & Floating Notes Backdrop */}
        <ByteCatChillhopBackdrop
          accentColor={currentQuote.accentBg}
          isDark={isDark}
        />

        {/* Left Column: Cozy Wooden Framed Animated Byte-Cat Stage */}
        <View style={styles.avatarColumn}>
          <Pressable
            onHoverIn={() => setAvatarHovered(true)}
            onHoverOut={() => setAvatarHovered(false)}
            onPress={handleTapAvatarPortrait}
            style={styles.stageTapTarget}
          >
            {/* Floating Reaction Popups */}
            <View style={styles.popupAnchor} pointerEvents="none">
              {popupAnims.map((slot, idx) =>
                popupLabels[idx] ? (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.floatingPopupPill,
                      {
                        opacity: slot.op,
                        transform: [
                          { translateY: slot.y },
                          { scale: slot.sc },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.floatingPopupText}>
                      {popupLabels[idx]}
                    </Text>
                  </Animated.View>
                ) : null,
              )}
            </View>

            {/* Level 5+ Golden Crown Perk perched at Top */}
            {petLevel >= 5 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.crownBadge,
                  { transform: [{ translateY: sparkleDriftY1 }] },
                ]}
              >
                <Text style={styles.crownBadgeText}>👑</Text>
              </Animated.View>
            )}

            {/* Calm, Stationary Cozy Walnut & Brass Window Frame */}
            <View
              style={[
                styles.avatarStageHalo,
                {
                  backgroundColor: cozyOuterFrameBg,
                  borderColor: cozyOuterBorderColor,
                },
              ]}
            >
              {/* Warm Brass Corner Rivets */}
              <View style={[styles.cozyFrameRivet, styles.cozyFrameRivetTL]} />
              <View style={[styles.cozyFrameRivet, styles.cozyFrameRivetTR]} />
              <View style={[styles.cozyFrameRivet, styles.cozyFrameRivetBL]} />
              <View style={[styles.cozyFrameRivet, styles.cozyFrameRivetBR]} />

              <Animated.View
                style={[
                  styles.avatarFrame,
                  { borderColor: cozyInnerBezelColor },
                  {
                    transform: [
                      { rotate: wiggleRotate },
                      { scaleX: combinedScaleX },
                      { scaleY: combinedScaleY },
                    ],
                  },
                ]}
              >
                <CozyCodingByteCatStage
                  idleBreak={idleBreakAction}
                  isBlinking={isBlinking}
                  hyperPurrActive={hyperPurrActive}
                  activeKeyStep={activeKeyStep}
                />
              </Animated.View>

              {/* Cozy Wooden Windowsill Ledge */}
              <View style={styles.cozyWindowSill}>
                <View style={styles.cozyWindowSillPlaque}>
                  <Text style={styles.cozyWindowSillText}>
                    BYTE-CAT STUDIO · EST. 1998
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>

          <View style={styles.cozyWhisperStrip}>
            <Text style={styles.avatarWhisperText} numberOfLines={1}>
              {whisperText}
            </Text>
          </View>

          {/* Compact Pet XP Meter & Current/Next Level Perk Peek */}
          <View style={styles.bondMeterWrap}>
            <View style={styles.bondMeterTop}>
              <Text style={styles.bondMeterLabel}>
                {isPremium ? `PET LVL ${petLevel}` : "PRO PET XP"}
              </Text>
              <Text style={styles.bondMeterLv}>
                {isPremium
                  ? `${petXp}/${petProgress.nextLevelTargetXp} XP`
                  : "LOCKED"}
              </Text>
            </View>
            <View style={styles.bondMeterTrack}>
              <Animated.View
                style={[
                  styles.bondMeterFill,
                  {
                    width: animatedPetBarWidth,
                    backgroundColor: activeTier.accent,
                  },
                ]}
              />
            </View>
          </View>

          {/* Unified Single Daily Treat Button (Pro Only, locked after daily use) + Shuffle Button */}
          <View style={styles.actionBtnRow}>
            <Pressable
              disabled={treatedToday}
              accessibilityState={{ disabled: treatedToday }}
              style={({ pressed }) => [
                styles.miniActionBtn,
                !isPremium
                  ? styles.treatLockedBtn
                  : treatedToday
                    ? styles.treatDoneTodayBtn
                    : styles.treatProBtn,
                pressed && !treatedToday && styles.miniBtnPressed,
              ]}
              onPress={handleTreatPet}
            >
              <Text
                numberOfLines={1}
                style={
                  !isPremium
                    ? styles.miniActionBtnTextLocked
                    : treatedToday
                      ? styles.miniActionBtnTextDone
                      : styles.miniActionBtnTextDark
                }
              >
                {!isPremium
                  ? "🔒 🐟 TREAT · PRO"
                  : treatedToday
                    ? "✓ TREATED TODAY"
                    : `🐟 TREAT (+${TREAT_XP_AMOUNT} XP)`}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.miniActionBtn,
                styles.rollBtn,
                pressed && styles.miniBtnPressed,
              ]}
              onPress={handleShuffleActiveMode}
            >
              <Text style={styles.miniActionBtnText}>🎲</Text>
            </Pressable>
          </View>
        </View>

        {/* Right Column: Cozy Study Notebook & Interactive Speech Bubble */}
        <View style={styles.speechBubble}>
          {/* Mode Tabs + Next Trigger */}
          <View style={styles.bubbleTopRow}>
            <View style={styles.modeTabsBar}>
              {(
                [
                  { id: "wisdom", label: "💬 WISDOM" },
                  { id: "snack", label: "💡 SNACK" },
                  { id: "quiz", label: "⚡ QUIZ" },
                  { id: "perks", label: "🐾 PERKS" },
                ] as const
              ).map((tab) => {
                const isSelected = mode === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    style={[
                      styles.modeTabBtn,
                      isSelected && styles.modeTabBtnActive,
                    ]}
                    onPress={() => handleSwitchMode(tab.id)}
                  >
                    <Text
                      style={[
                        styles.modeTabText,
                        isSelected && styles.modeTabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.nextQuoteBtn,
                pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
              ]}
              onPress={handleShuffleActiveMode}
            >
              <Text style={styles.nextQuoteBtnText}>
                {mode === "snack"
                  ? "NEXT SNACK ↻"
                  : mode === "quiz"
                    ? "NEXT QUIZ ↻"
                    : "NEW WISDOM ↻"}
              </Text>
            </Pressable>
          </View>

          {/* Animated Mode Content Body */}
          <Animated.View
            style={{
              opacity: contentFadeAnim,
              transform: [{ translateY: contentSlideAnim }],
              gap: 10,
            }}
          >
            {mode === "wisdom" ? (
              <>
                <View
                  {...quotePanResponder.panHandlers}
                  style={[
                    styles.quoteSpotlightBox,
                    {
                      borderLeftColor: currentQuote.accentBg,
                      overflow: "hidden",
                    },
                  ]}
                >
                  <Animated.View
                    style={{
                      gap: 9,
                      opacity: quoteFadeAnim,
                      transform: [
                        { translateX: quoteSlideXAnim },
                        { scale: quoteScaleAnim },
                      ],
                    }}
                  >
                    <View style={styles.quoteSpotlightTopRow}>
                      <Animated.View
                        style={[
                          styles.quoteCornerMark,
                          {
                            backgroundColor: currentQuote.accentBg,
                            transform: [
                              {
                                translateY: quoteMarkFloatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -2.5],
                                }),
                              },
                              { scale: quoteMarkPopAnim },
                            ],
                          },
                        ]}
                      >
                        <Text style={styles.quoteCornerMarkText}>&ldquo;</Text>
                      </Animated.View>
                      <Text style={styles.quoteAuthor}>
                        — {currentQuote.author}
                      </Text>
                    </View>
                    <Text style={styles.quoteText}>
                      {currentQuote.quote}
                    </Text>
                  </Animated.View>
                </View>

                <View style={styles.quoteInteractiveBar}>
                  <View style={styles.quoteNavGroup}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.quoteStepBtn,
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                      onPress={() => stepQuote(-1)}
                    >
                      <Text style={styles.quoteStepBtnText}>◀</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.quoteStepBtn,
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                      onPress={() => stepQuote(1)}
                    >
                      <Text style={styles.quoteStepBtnText}>▶</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.quoteActionChip,
                        isCurrentQuoteSaved && styles.quoteActionChipSaved,
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                      onPress={handleToggleSaveQuote}
                    >
                      <Text
                        style={[
                          styles.quoteActionChipText,
                          isCurrentQuoteSaved && styles.quoteActionChipTextInk,
                        ]}
                      >
                        {isCurrentQuoteSaved ? "★ SAVED" : "☆ SAVE"}
                      </Text>
                    </Pressable>
                    {savedQuoteIds.length > 0 && (
                      <Pressable
                        style={[
                          styles.quoteFilterPill,
                          usingSavedFilter && styles.quoteFilterPillActive,
                        ]}
                        onPress={handleToggleQuoteFilter}
                      >
                        <Text
                          style={[
                            styles.quoteFilterPillText,
                            usingSavedFilter && styles.quoteFilterPillTextActive,
                          ]}
                        >
                          ★ FAVS ({savedQuoteIds.length})
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </>
            ) : mode === "snack" ? (
              <View style={styles.snackPanel}>
                <View style={styles.bubbleBadgeGroup}>
                  <View
                    style={[
                      styles.moodSticker,
                      { backgroundColor: currentSnack.accentBg },
                    ]}
                  >
                    <Text style={styles.moodStickerText}>
                      {currentSnack.tag}
                    </Text>
                  </View>
                  <Text style={styles.snackTitleText}>
                    {currentSnack.title}
                  </Text>
                  <Text style={styles.quoteCounterText}>
                    0{(snackIndex % snacks.length) + 1}/0{snacks.length}
                  </Text>
                </View>

                <View style={styles.snackCodeBox}>
                  <Text style={styles.snackCodeText}>{currentSnack.code}</Text>
                </View>

                <Text style={styles.snackTakeawayText}>
                  💡 {currentSnack.takeaway}
                </Text>
              </View>
            ) : mode === "quiz" ? (
              <View style={styles.quizPanel}>
                <View style={styles.bubbleBadgeGroup}>
                  <View
                    style={[
                      styles.moodSticker,
                      { backgroundColor: "#FDBA74" },
                    ]}
                  >
                    <Text style={styles.moodStickerText}>
                      ⚡ 3-SECOND CHECK
                    </Text>
                  </View>
                  <Text style={styles.quoteCounterText}>
                    SOLVED THIS SESSION: {quizSolvedCount}
                  </Text>
                </View>

                <View style={styles.snackCodeBox}>
                  <Text style={styles.snackCodeText}>{currentQuiz.code}</Text>
                </View>

                <View style={styles.quizOptionsRow}>
                  {currentQuiz.options.map((opt, idx) => {
                    const isPicked = selectedQuizOpt === idx;
                    const isAnswer = idx === currentQuiz.answerIdx;
                    const showOutcome = selectedQuizOpt !== null;

                    return (
                      <Pressable
                        key={idx}
                        style={({ pressed }) => [
                          styles.quizOptionBtn,
                          showOutcome && isAnswer && styles.quizOptionCorrect,
                          showOutcome &&
                            isPicked &&
                            !isAnswer &&
                            styles.quizOptionWrong,
                          pressed &&
                            selectedQuizOpt === null &&
                            styles.miniBtnPressed,
                        ]}
                        onPress={() => handleSelectQuizOption(idx)}
                      >
                        <Text
                          style={[
                            styles.quizOptionText,
                            showOutcome &&
                              (isAnswer || isPicked) &&
                              styles.quizOptionTextSelected,
                          ]}
                        >
                          {showOutcome && isAnswer
                            ? `✓ ${opt}`
                            : showOutcome && isPicked && !isAnswer
                              ? `✕ ${opt}`
                              : opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {selectedQuizOpt !== null ? (
                  <View style={styles.quizFeedbackBox}>
                    <Text style={styles.quizFeedbackText}>
                      {selectedQuizOpt === currentQuiz.answerIdx
                        ? `★ Purr-fect! ${currentQuiz.why}`
                        : `🐾 Not quite — ${currentQuiz.why}`}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.quizPromptHint}>
                    Tap an option above to test your instinct!
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.perksPanel}>
                <View style={styles.perksHeaderRow}>
                  <View
                    style={[
                      styles.moodSticker,
                      { backgroundColor: activeTier.accent },
                    ]}
                  >
                    <Text style={styles.moodStickerText}>
                      🐾 PET LEVEL PERKS · PRO
                    </Text>
                  </View>
                  {!isPremium && onOpenPaywall && (
                    <Pressable
                      style={styles.unlockPerksMiniBtn}
                      onPress={() => {
                        playKeyClick();
                        onOpenPaywall();
                      }}
                    >
                      <Text style={styles.unlockPerksMiniText}>
                        UNLOCK PRO →
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.perksDailyNote}>
                  {isPremium
                    ? treatedToday
                      ? "✓ Today's treat claimed! Come back tomorrow for +15 Pet XP."
                      : `🐟 Daily Treat ready: +${TREAT_XP_AMOUNT} Pet XP once per day to unlock new perks.`
                    : `🐟 Pro members can treat Byte-Cat once per day (+${TREAT_XP_AMOUNT} XP) to unlock perks.`}
                </Text>

                <View style={styles.perksGrid}>
                  {PET_LEVEL_TIERS.map((tier) => {
                    const isUnlocked = isPremium && petLevel >= tier.level;
                    return (
                      <View
                        key={tier.level}
                        style={[
                          styles.perkRowCard,
                          isUnlocked && {
                            backgroundColor: colors.cardDoneBg,
                            borderColor: colors.cardDoneBorder,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.perkLevelBadge,
                            {
                              backgroundColor: isUnlocked
                                ? tier.accent
                                : colors.bg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.perkLevelBadgeText,
                              !isUnlocked && { color: colors.textMuted },
                            ]}
                          >
                            {isUnlocked ? `${tier.icon} L${tier.level}` : `L${tier.level}`}
                          </Text>
                        </View>
                        <View style={styles.perkCopyCol}>
                          <Text style={styles.perkTitleLine}>
                            {tier.title}{" "}
                            <Text style={styles.perkTitleReq}>
                              · {tier.minXp} XP
                            </Text>
                          </Text>
                          <Text style={styles.perkDescLine}>
                            <Text style={styles.perkBonusLabel}>
                              {tier.perkTitle}:
                            </Text>{" "}
                            {tier.perkDesc}
                          </Text>
                        </View>
                        <Text style={styles.perkStatusMark}>
                          {isUnlocked ? "✓" : "🔒"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </Animated.View>

          {/* Full-Width Track Progress Strip */}
          <View style={styles.guideFooterRow}>
            <View style={styles.guideProgressWrap}>
              <Text style={styles.guideStatusText} numberOfLines={1}>
                ● {guideStatusText}
              </Text>
              <View style={styles.miniTrackMeterBg}>
                <Animated.View
                  style={[
                    styles.miniTrackMeterFill,
                    {
                      width: animatedProgressWidth,
                      backgroundColor: activeTrackAccent,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
