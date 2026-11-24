import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import type { ArcadeGameMode } from "../types/lesson";
import { getDailyDateKey } from "../utils/arenaReplayability";
import {
  buildDailyGauntletRun,
  computeGauntletStagePoints,
  DAILY_GAUNTLET_SECONDS,
  type DailyGauntletRecord,
  evaluateDailyGauntletRank,
  type GauntletRankSummary,
  getDailyGauntletRecord,
  recordDailyGauntletFinish,
} from "../utils/dailyGauntlet";
import {
  playErrorBuzz,
  playKeyClick,
  playSuccessChime,
  playVictoryFanfare,
} from "../utils/soundEffects";
import type { ArcadeCartridgeMeta } from "./ArcadeHub";
import { StudioIcon, Text } from "./StudioIcon";

interface ArcadeLiveCrtDeckProps {
  cartridges: readonly ArcadeCartridgeMeta[];
  previewCart: ArcadeCartridgeMeta;
  previewStatLine: string;
  onSelectPreview: (id: ArcadeGameMode) => void;
  onLaunchCartridge: (id: ArcadeGameMode) => void;
}

export function ArcadeLiveCrtDeck({
  cartridges,
  previewCart,
  previewStatLine,
  onSelectPreview,
  onLaunchCartridge,
}: ArcadeLiveCrtDeckProps) {
  const styles = useThemedStyles(createStyles);
  const crtHostRef = useRef<any>(null);
  const liveCartRef = useRef<ArcadeCartridgeMeta>(previewCart);

  useEffect(() => {
    liveCartRef.current = previewCart;
  }, [previewCart]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const host = crtHostRef.current as HTMLElement | null;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    host.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      host.removeChild(canvas);
      return;
    }

    let W = 288;
    let H = 162;
    const sync = () => {
      const rect = host.getBoundingClientRect();
      W = Math.max(220, rect.width || 288);
      H = Math.max(136, rect.height || 162);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sync();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(sync);
      ro.observe(host);
    }

    let rafId = 0;
    const startTs = performance.now();

    const drawCrt = (now: number) => {
      const t = (now - startTs) * 0.001;
      const cart = liveCartRef.current;

      // Deep CRT phosphor backdrop
      ctx.fillStyle = "#060B14";
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(
        W * 0.5,
        H * 0.52,
        8,
        W * 0.5,
        H * 0.52,
        W * 0.65,
      );
      glow.addColorStop(0, `${cart.accent}24`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Top CRT ROM header strip
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(0, 0, W, 22);
      ctx.fillStyle = cart.accent;
      ctx.font = "900 9.5px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`ROM://${cart.code} · ${cart.shortTitle}`, 10, 14.5);
      ctx.fillStyle = Math.sin(t * 5) > 0 ? "#B8FF3B" : "rgba(184,255,59,0.35)";
      ctx.beginPath();
      ctx.arc(W - 13, 11, 3.2, 0, Math.PI * 2);
      ctx.fill();

      const cy = H * 0.56;

      // 6 Bespoke Live Pixel-Art Mini-Animations per Cartridge!
      if (cart.id === "bughunt") {
        // Code lines + pulsing pixel bug + sweeping radar target lock
        for (let r = 0; r < 4; r += 1) {
          const ly = 38 + r * 22;
          ctx.fillStyle = r === 2 ? "rgba(251, 113, 133, 0.22)" : "rgba(148, 163, 184, 0.22)";
          ctx.fillRect(18, ly, W * (0.42 + ((r * 17) % 3) * 0.14), 6);
        }
        const bugX = 18 + W * 0.34 + Math.sin(t * 2.2) * 26;
        const bugY = 82;
        const locked = Math.sin(t * 2.2) > 0.35;
        ctx.fillStyle = locked ? "#6EE7B7" : "#FB7185";
        ctx.fillRect(bugX - 5, bugY - 5, 10, 10);

        // Sweeping radar crosshair
        const scanX = W * 0.5 + Math.sin(t * 2.2) * (W * 0.24);
        ctx.strokeStyle = locked ? "#6EE7B7" : cart.accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(scanX, bugY, 15, 0, Math.PI * 2);
        ctx.moveTo(scanX - 21, bugY);
        ctx.lineTo(scanX + 21, bugY);
        ctx.moveTo(scanX, bugY - 21);
        ctx.lineTo(scanX, bugY + 21);
        ctx.stroke();

        ctx.fillStyle = locked ? "#6EE7B7" : "#FDA4AF";
        ctx.font = "900 10px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "right";
        ctx.fillText(locked ? "PATCHED ✓" : "SCANNING...", W - 14, H - 14);
      } else if (cart.id === "blitz") {
        // Falling syntax block snapping into [ ___ ] blank + combo meter
        const dropPhase = (t * 1.15) % 1;
        const snapped = dropPhase > 0.68;
        ctx.fillStyle = "#E2E8F0";
        ctx.font = "900 12px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("for x [     ] items:", W * 0.5, cy + 4);

        const tokY = snapped ? cy : 32 + (dropPhase / 0.68) * (cy - 32);
        ctx.fillStyle = cart.accent;
        ctx.fillRect(W * 0.5 - 19, tokY - 11, 32, 18);
        ctx.fillStyle = "#090B10";
        ctx.font = "900 11px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillText("in", W * 0.5 - 3, tokY + 2);

        // Combo bar at bottom
        const barW = W - 36;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(18, H - 22, barW, 7);
        ctx.fillStyle = snapped ? "#FFDE59" : cart.accent;
        ctx.fillRect(18, H - 22, barW * (0.45 + 0.5 * Math.abs(Math.sin(t * 1.4))), 7);
        ctx.font = "900 9.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(snapped ? "⚡ COMBO x4! +35 XP" : "60s SPRINT CLOCK", 18, H - 28);
      } else if (cart.id === "flashcards") {
        // Smooth 3D horizontally flipping concept card
        const flip = Math.cos(t * 2.1);
        const cardW = Math.max(6, Math.abs(flip) * 136);
        const isBack = flip < 0;
        ctx.fillStyle = isBack ? "#6EE7B7" : "#1E293B";
        ctx.strokeStyle = cart.accent;
        ctx.lineWidth = 2;
        ctx.fillRect(W * 0.5 - cardW * 0.5, cy - 30, cardW, 60);
        ctx.strokeRect(W * 0.5 - cardW * 0.5, cy - 30, cardW, 60);
        if (Math.abs(flip) > 0.38) {
          ctx.save();
          ctx.translate(W * 0.5, cy + 4);
          ctx.scale(Math.abs(flip), 1);
          ctx.fillStyle = isBack ? "#090B10" : "#F8FAFC";
          ctx.font = "900 11px 'JetBrains Mono', ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillText(isBack ? "O(1) LOOKUP ★" : "dict[key] = ?", 0, 0);
          ctx.restore();
        }
      } else if (cart.id === "detective") {
        // Magnifying trace lens gliding across 3 code lines -> revealing output
        const lines = ['w = "DEVY"', "p = w[1:4]", "print(p[::-1])"];
        const activeRow = Math.floor(t * 1.3) % 3;
        ctx.font = "800 10.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        lines.forEach((ln, idx) => {
          const y = 46 + idx * 20;
          ctx.fillStyle = idx === activeRow ? "#38BDF8" : "rgba(203,213,225,0.65)";
          ctx.fillText(`${idx + 1}  ${ln}`, 20, y);
        });
        const lensY = 42 + activeRow * 20;
        ctx.strokeStyle = "#FFDE59";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W - 58, lensY, 13, 0, Math.PI * 2);
        ctx.moveTo(W - 48, lensY + 9);
        ctx.lineTo(W - 38, lensY + 19);
        ctx.stroke();

        ctx.fillStyle = "#38BDF8";
        ctx.fillText('stdout >> "YVE"', 20, H - 15);
      } else if (cart.id === "minibuilds") {
        // Violet D6 RPG die + filling password meter widget
        const pipCount = (Math.floor(t * 2.4) % 6) + 1;
        ctx.fillStyle = cart.accent;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.6;
        ctx.fillRect(28, cy - 22, 38, 38);
        ctx.strokeRect(28, cy - 22, 38, 38);
        ctx.fillStyle = "#090B10";
        ctx.font = "900 16px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(pipCount), 47, cy + 3);

        // Live meter bars on right
        ctx.textAlign = "left";
        ctx.fillStyle = "#E2E8F0";
        ctx.font = "900 9.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillText("TOOL WIDGET LIVE", 82, cy - 10);
        for (let seg = 0; seg < 4; seg += 1) {
          const lit = seg <= Math.floor((t * 1.8) % 4);
          ctx.fillStyle = lit ? "#6EE7B7" : "rgba(255,255,255,0.14)";
          ctx.fillRect(82 + seg * 38, cy + 2, 32, 10);
        }
      } else {
        // Playground live Python >>> REPL typing animation
        const fullCmd = ">>> [n*n for n in range(4)]";
        const chars = Math.floor(((t * 9) % (fullCmd.length + 10)));
        const shown = fullCmd.slice(0, Math.min(fullCmd.length, chars));
        ctx.fillStyle = "#FFDE59";
        ctx.font = "900 10.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(shown, 16, cy - 8);
        if (chars >= fullCmd.length) {
          ctx.fillStyle = "#6EE7B7";
          ctx.fillText("[0, 1, 4, 9]", 16, cy + 16);
        } else if (Math.sin(t * 10) > 0) {
          const cw = ctx.measureText(shown).width;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(18 + cw, cy - 17, 6, 11);
        }
      }

      // Authentic subtle CRT horizontal scanlines
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      for (let sy = 24; sy < H; sy += 4) {
        ctx.fillRect(0, sy, W, 1.4);
      }

      rafId = window.requestAnimationFrame(drawCrt);
    };

    rafId = window.requestAnimationFrame(drawCrt);
    return () => {
      window.cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      if (canvas.parentNode === host) host.removeChild(canvas);
    };
  }, []);

  return (
    <View testID="arcade-crt-deck" style={styles.crtDeckCard}>
      <View style={styles.crtScreenCol}>
        <View style={[styles.crtBezel, { borderColor: previewCart.accent }]}>
          {Platform.OS === "web" ? (
            <View ref={crtHostRef} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.crtStaticFallback}>
              <StudioIcon name={previewCart.icon} size={28} />
              <Text style={styles.crtFallbackText}>
                {previewCart.code} · {previewCart.shortTitle}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.crtInfoCol}>
        <View style={styles.crtSlotTabsRow}>
          {cartridges.map((c) => {
            const selected = c.id === previewCart.id;
            return (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityLabel={`Preview ${c.title} on CRT`}
                style={[
                  styles.crtSlotChip,
                  selected && {
                    backgroundColor: c.accent,
                    borderColor: StudioColors.ink,
                  },
                ]}
                onPress={() => {
                  playKeyClick();
                  onSelectPreview(c.id);
                }}
              >
                <Text
                  style={[
                    styles.crtSlotChipText,
                    selected && { color: StudioColors.ink },
                  ]}
                >
                  {c.code.replace("CART-", "#")} {c.shortTitle}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.crtMetaHeader}>
          <Text style={styles.crtLoadedTitle}>{previewCart.title}</Text>
          <View style={styles.crtStatBadge}>
            <Text style={styles.crtStatBadgeText}>{previewStatLine}</Text>
          </View>
        </View>

        <Text style={styles.crtLoadedDesc} numberOfLines={2}>
          {previewCart.tagline}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Insert and play ${previewCart.title}`}
          style={({ pressed }) => [
            styles.crtInsertBtn,
            { backgroundColor: previewCart.accent },
            pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onLaunchCartridge(previewCart.id);
          }}
        >
          <StudioIcon name={previewCart.icon} size={15} />
          <Text style={styles.crtInsertBtnText}>
            INSERT &amp; PLAY {previewCart.shortTitle} →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface DailyGauntletProps {
  isPremium: boolean;
  onAwardXp?: (xp: number) => void;
}

export function DailyArcadeGauntletSection({
  isPremium,
  onAwardXp,
}: DailyGauntletProps) {
  const styles = useThemedStyles(createStyles);
  const todayKey = useMemo(() => getDailyDateKey(), []);
  const [record, setRecord] = useState<DailyGauntletRecord>(() =>
    getDailyGauntletRecord(todayKey),
  );
  const [isActive, setIsActive] = useState<boolean>(false);
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [combo, setCombo] = useState<number>(0);
  const [stagePoints, setStagePoints] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(DAILY_GAUNTLET_SECONDS);
  const [summary, setSummary] = useState<GauntletRankSummary | null>(null);
  const [newlyEarnedXp, setNewlyEarnedXp] = useState<number>(0);

  const stages = useMemo(
    () => buildDailyGauntletRun(todayKey, isPremium),
    [todayKey, isPremium],
  );

  useEffect(() => {
    if (!isActive || summary) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, summary]);

  const startGauntlet = () => {
    playKeyClick();
    setIsActive(true);
    setStageIdx(0);
    setPickedOption(null);
    setCombo(0);
    setStagePoints(0);
    setCorrectCount(0);
    setSecondsLeft(DAILY_GAUNTLET_SECONDS);
    setSummary(null);
    setNewlyEarnedXp(0);
  };

  const currentStage = stages[stageIdx];

  const handlePickOption = (optIdx: number) => {
    if (!currentStage || pickedOption !== null) return;
    setPickedOption(optIdx);
    const isCorrect = optIdx === currentStage.correctIndex;
    if (isCorrect) {
      playSuccessChime();
      const nextCombo = combo + 1;
      const pts = computeGauntletStagePoints(true, nextCombo);
      setCombo(nextCombo);
      setStagePoints((prev) => prev + pts);
      setCorrectCount((prev) => prev + 1);
    } else {
      playErrorBuzz();
      setCombo(0);
    }
  };

  const handleAdvanceStage = () => {
    playKeyClick();
    if (stageIdx + 1 < stages.length && secondsLeft > 0) {
      setStageIdx((prev) => prev + 1);
      setPickedOption(null);
      return;
    }
    const finalSummary = evaluateDailyGauntletRank(
      stagePoints,
      correctCount,
      stages.length,
      secondsLeft,
    );
    const saved = recordDailyGauntletFinish(todayKey, finalSummary, correctCount);
    setRecord(saved.record);
    setSummary(finalSummary);
    setNewlyEarnedXp(saved.newlyAwardedXp);
    playVictoryFanfare();
    if (saved.newlyAwardedXp > 0) {
      onAwardXp?.(saved.newlyAwardedXp);
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, "0");

  if (!isActive) {
    return (
      <View testID="daily-arcade-gauntlet-banner" style={styles.gauntletBanner}>
        <View style={styles.gauntletBannerLeft}>
          <View style={styles.gauntletKickerRow}>
            <View style={styles.gauntletSeedPill}>
              <StudioIcon name="bolt" size={13} />
              <Text style={styles.gauntletSeedText}>
                DAILY 3-MIN GAUNTLET · #{todayKey}
              </Text>
            </View>
            <View style={styles.gauntletRecordPill}>
              <Text style={styles.gauntletRecordText}>
                {record.bestRank
                  ? `BEST TODAY: ${record.bestRank} · ${record.bestScore} PTS`
                  : "UNPLAYED TODAY · UP TO +110 XP"}
              </Text>
            </View>
          </View>

          <Text style={styles.gauntletBannerTitle}>
            3 Speed Blitz → 1 Bug Spotter → 1 Output Detective
          </Text>
          <Text style={styles.gauntletBannerSub}>
            Chain all 5 stages on one 3-minute clock to build your combo
            multiplier and stamp today&apos;s C → S+ rank badge.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start Daily 3-Minute Arcade Gauntlet"
          style={({ pressed }) => [
            styles.gauntletStartBtn,
            pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
          ]}
          onPress={startGauntlet}
        >
          <StudioIcon name="mission_play" size={16} />
          <Text style={styles.gauntletStartBtnText}>
            {record.runsToday > 0 ? "REPLAY GAUNTLET →" : "START GAUNTLET →"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View testID="daily-arcade-gauntlet-stage" style={styles.gauntletArenaCard}>
      {/* Top Gauntlet Telemetry Bar */}
      <View style={styles.gauntletTopBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit Daily Gauntlet"
          style={styles.gauntletExitBtn}
          onPress={() => {
            playKeyClick();
            setIsActive(false);
          }}
        >
          <Text style={styles.gauntletExitText}>← EXIT</Text>
        </Pressable>

        <View style={styles.gauntletPipsRow}>
          {stages.map((st, idx) => {
            const done = idx < stageIdx || Boolean(summary);
            const current = idx === stageIdx && !summary;
            return (
              <View
                key={st.id}
                style={[
                  styles.stagePip,
                  done && { backgroundColor: StudioColors.mint },
                  current && { backgroundColor: st.accent },
                ]}
              >
                <Text
                  style={[
                    styles.stagePipText,
                    (done || current) && { color: StudioColors.ink },
                  ]}
                >
                  {st.kind === "blitz"
                    ? `⚡${idx + 1}`
                    : st.kind === "bug_spotter"
                      ? "🐛4"
                      : "🔍5"}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.gauntletHudRight}>
          {combo > 1 ? (
            <View style={styles.comboPill}>
              <Text style={styles.comboPillText}>
                {(1 + (combo - 1) * 0.25).toFixed(2)}x COMBO
              </Text>
            </View>
          ) : null}
          <View style={styles.clockPill}>
            <Text style={styles.clockPillText}>
              ⏱ {mins}:{secs} · {stagePoints} PTS
            </Text>
          </View>
        </View>
      </View>

      {summary ? (
        <View style={styles.summaryWrap}>
          <View style={styles.rankStampCircle}>
            <Text style={styles.rankStampText}>{summary.rank}</Text>
          </View>
          <Text style={styles.summaryHeadline}>{summary.headline}</Text>
          <Text style={styles.summaryStats}>
            {correctCount}/{stages.length} CLEARED · {summary.totalScore} TOTAL PTS
            (INCL. +{summary.timeBonus} SPEED BONUS)
          </Text>
          <View style={styles.summaryXpBadge}>
            <Text style={styles.summaryXpText}>
              {newlyEarnedXp > 0
                ? `+${newlyEarnedXp} XP AWARDED ★`
                : `DAILY XP CLAIMED (${record.xpClaimedToday} XP) · HIGH SCORE SAVED`}
            </Text>
          </View>

          <View style={styles.summaryActionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Replay Daily Gauntlet"
              style={styles.gauntletReplayBtn}
              onPress={startGauntlet}
            >
              <Text style={styles.gauntletReplayText}>↻ PLAY AGAIN</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Finish and return to Arcade shelf"
              style={styles.gauntletDoneBtn}
              onPress={() => {
                playKeyClick();
                setIsActive(false);
              }}
            >
              <Text style={styles.gauntletDoneText}>✓ BACK TO SHELF</Text>
            </Pressable>
          </View>
        </View>
      ) : currentStage ? (
        <View style={styles.stageBody}>
          <View style={styles.stageHeaderRow}>
            <View
              style={[
                styles.stageKickerBadge,
                { backgroundColor: currentStage.accent },
              ]}
            >
              <Text style={styles.stageKickerText}>{currentStage.kicker}</Text>
            </View>
            <Text style={styles.stageTitleText}>{currentStage.title}</Text>
          </View>

          <Text style={styles.stagePromptText}>{currentStage.prompt}</Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeBoxText}>{currentStage.code}</Text>
          </View>

          <View style={styles.optionsGrid}>
            {currentStage.options.map((opt, idx) => {
              const revealed = pickedOption !== null;
              const isCorrect = idx === currentStage.correctIndex;
              const isChosen = pickedOption === idx;
              return (
                <Pressable
                  key={`${currentStage.id}_opt_${idx}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Gauntlet option ${idx + 1}: ${opt}`}
                  disabled={revealed}
                  style={[
                    styles.optionBtn,
                    revealed && isCorrect && styles.optionBtnCorrect,
                    revealed && isChosen && !isCorrect && styles.optionBtnWrong,
                  ]}
                  onPress={() => handlePickOption(idx)}
                >
                  <Text style={styles.optionIndexBadge}>{idx + 1}</Text>
                  <Text
                    style={[
                      styles.optionBtnText,
                      revealed &&
                        (isCorrect || isChosen) && { color: StudioColors.ink },
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {pickedOption !== null ? (
            <View style={styles.feedbackBar}>
              <Text style={styles.feedbackText}>
                {pickedOption === currentStage.correctIndex ? "✓ " : "✕ "}
                {currentStage.explanation}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue to next Gauntlet stage"
                style={[
                  styles.nextStageBtn,
                  { backgroundColor: currentStage.accent },
                ]}
                onPress={handleAdvanceStage}
              >
                <Text style={styles.nextStageBtnText}>
                  {stageIdx + 1 < stages.length
                    ? "NEXT STAGE →"
                    : "SEE FINAL RANK →"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: StudioThemeColors) =>
  StyleSheet.create({
    crtDeckCard: {
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 15,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 16,
      ...HardShadow,
    },
    crtScreenCol: {
      width: 288,
      maxWidth: "100%",
      flexGrow: 0,
    },
    crtBezel: {
      width: "100%",
      height: 162,
      borderRadius: 13,
      borderWidth: 3,
      backgroundColor: "#060B14",
      overflow: "hidden",
      position: "relative",
      ...HardShadowSm,
    },
    crtStaticFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    crtFallbackText: {
      color: "#E2E8F0",
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "900",
    },
    crtInfoCol: {
      flex: 1,
      minWidth: 250,
      gap: 9,
    },
    crtSlotTabsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    crtSlotChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.4,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    crtSlotChipText: {
      color: colors.textSecondary,
      fontFamily: MonoFont,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    crtMetaHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    crtLoadedTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    crtStatBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.bg,
      borderWidth: 1.2,
      borderColor: colors.border,
    },
    crtStatBadgeText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "800",
    },
    crtLoadedDesc: {
      color: colors.textSecondary,
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "600",
    },
    crtInsertBtn: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    crtInsertBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 10.5,
      lineHeight: 13,
      includeFontPadding: false,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    gauntletBanner: {
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 14,
      ...HardShadow,
    },
    gauntletBannerLeft: {
      flex: 1,
      minWidth: 250,
      gap: 6,
    },
    gauntletKickerRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    gauntletSeedPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: StudioColors.yellow,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    gauntletSeedText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    gauntletRecordPill: {
      backgroundColor: colors.bg,
      borderWidth: 1.4,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    gauntletRecordText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "800",
    },
    gauntletBannerTitle: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    gauntletBannerSub: {
      color: colors.textSecondary,
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "600",
    },
    gauntletStartBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      backgroundColor: StudioColors.lime,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 11,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    gauntletStartBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 11,
      lineHeight: 14,
      includeFontPadding: false,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    gauntletArenaCard: {
      backgroundColor: colors.surface,
      borderWidth: 2.5,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      gap: 14,
      ...HardShadow,
    },
    gauntletTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
    },
    gauntletExitBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    gauntletExitText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
    },
    gauntletPipsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    stagePip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    stagePipText: {
      color: colors.textMuted,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    gauntletHudRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    comboPill: {
      backgroundColor: StudioColors.pink,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    comboPillText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    clockPill: {
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    clockPillText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 10,
      fontWeight: "900",
    },
    stageBody: {
      gap: 11,
    },
    stageHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 9,
    },
    stageKickerBadge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
    },
    stageKickerText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
    },
    stageTitleText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "900",
    },
    stagePromptText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 19,
    },
    codeBox: {
      backgroundColor: "#0B1020",
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      padding: 12,
    },
    codeBoxText: {
      color: "#F8FAFC",
      fontFamily: MonoFont,
      fontSize: 12,
      lineHeight: 18,
    },
    optionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
    },
    optionBtn: {
      width: "48.5%",
      minWidth: 220,
      flexGrow: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    optionBtnCorrect: {
      backgroundColor: StudioColors.mint,
      borderColor: StudioColors.ink,
    },
    optionBtnWrong: {
      backgroundColor: StudioColors.coral,
      borderColor: StudioColors.ink,
    },
    optionIndexBadge: {
      color: StudioColors.ink,
      backgroundColor: StudioColors.yellow,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: MonoFont,
      fontSize: 9.5,
      fontWeight: "900",
      overflow: "hidden",
    },
    optionBtnText: {
      flex: 1,
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 11.5,
      fontWeight: "700",
      lineHeight: 16,
    },
    feedbackBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 11,
    },
    feedbackText: {
      flex: 1,
      minWidth: 200,
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 17,
    },
    nextStageBtn: {
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    nextStageBtnText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
    },
    summaryWrap: {
      alignItems: "center",
      paddingVertical: 14,
      gap: 9,
    },
    rankStampCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: StudioColors.yellow,
      borderWidth: 3,
      borderColor: StudioColors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...HardShadowSm,
    },
    rankStampText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 24,
      fontWeight: "900",
    },
    summaryHeadline: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    summaryStats: {
      color: colors.textSecondary,
      fontFamily: MonoFont,
      fontSize: 11,
      fontWeight: "800",
      textAlign: "center",
    },
    summaryXpBadge: {
      backgroundColor: StudioColors.mint,
      borderWidth: 1.8,
      borderColor: StudioColors.ink,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 5,
    },
    summaryXpText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
    },
    summaryActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 4,
    },
    gauntletReplayBtn: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    gauntletReplayText: {
      color: colors.textPrimary,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
    },
    gauntletDoneBtn: {
      paddingHorizontal: 15,
      paddingVertical: 9,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      backgroundColor: StudioColors.lime,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    gauntletDoneText: {
      color: StudioColors.ink,
      fontFamily: MonoFont,
      fontSize: 10.5,
      fontWeight: "900",
    },
  });
