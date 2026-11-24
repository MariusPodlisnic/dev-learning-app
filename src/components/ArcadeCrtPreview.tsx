import React, { useEffect, useRef } from "react";
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
import { playKeyClick } from "../utils/soundEffects";
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
    let H = 156;
    const sync = () => {
      const rect = host.getBoundingClientRect();
      W = Math.max(220, rect.width || 288);
      H = Math.max(130, rect.height || 156);
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

      // Deep CRT phosphor backdrop (clean full-bleed screen without header text)
      ctx.fillStyle = "#060B14";
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(
        W * 0.5,
        H * 0.5,
        8,
        W * 0.5,
        H * 0.5,
        W * 0.65,
      );
      glow.addColorStop(0, `${cart.accent}24`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      const cy = H * 0.5;

      // 6 Bespoke Live Pixel-Art Mini-Animations per Cartridge!
      if (cart.id === "bughunt") {
        for (let r = 0; r < 4; r += 1) {
          const ly = 26 + r * 22;
          ctx.fillStyle =
            r === 2
              ? "rgba(251, 113, 133, 0.22)"
              : "rgba(148, 163, 184, 0.22)";
          ctx.fillRect(18, ly, W * (0.42 + ((r * 17) % 3) * 0.14), 6);
        }
        const bugX = 18 + W * 0.34 + Math.sin(t * 2.2) * 26;
        const bugY = 70;
        const locked = Math.sin(t * 2.2) > 0.35;
        ctx.fillStyle = locked ? "#6EE7B7" : "#FB7185";
        ctx.fillRect(bugX - 5, bugY - 5, 10, 10);

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
        const dropPhase = (t * 1.15) % 1;
        const snapped = dropPhase > 0.68;
        ctx.fillStyle = "#E2E8F0";
        ctx.font = "900 12px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("for x [     ] items:", W * 0.5, cy);

        const tokY = snapped ? cy - 4 : 18 + (dropPhase / 0.68) * (cy - 22);
        ctx.fillStyle = cart.accent;
        ctx.fillRect(W * 0.5 - 19, tokY - 11, 32, 18);
        ctx.fillStyle = "#090B10";
        ctx.font = "900 11px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillText("in", W * 0.5 - 3, tokY + 2);

        const barW = W - 36;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(18, H - 20, barW, 7);
        ctx.fillStyle = snapped ? "#FFDE59" : cart.accent;
        ctx.fillRect(
          18,
          H - 20,
          barW * (0.45 + 0.5 * Math.abs(Math.sin(t * 1.4))),
          7,
        );
        ctx.font = "900 9.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(
          snapped ? "⚡ COMBO x4! +35 XP" : "60s SPRINT CLOCK",
          18,
          H - 27,
        );
      } else if (cart.id === "flashcards") {
        const flip = Math.cos(t * 2.1);
        const cardW = Math.max(6, Math.abs(flip) * 142);
        const isBack = flip < 0;
        ctx.fillStyle = isBack ? "#6EE7B7" : "#1E293B";
        ctx.strokeStyle = cart.accent;
        ctx.lineWidth = 2;
        ctx.fillRect(W * 0.5 - cardW * 0.5, cy - 32, cardW, 64);
        ctx.strokeRect(W * 0.5 - cardW * 0.5, cy - 32, cardW, 64);
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
        const lines = ['w = "DEVY"', "p = w[1:4]", "print(p[::-1])"];
        const activeRow = Math.floor(t * 1.3) % 3;
        ctx.font = "800 10.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        lines.forEach((ln, idx) => {
          const y = 34 + idx * 21;
          ctx.fillStyle =
            idx === activeRow ? "#38BDF8" : "rgba(203,213,225,0.65)";
          ctx.fillText(`${idx + 1}  ${ln}`, 20, y);
        });
        const lensY = 30 + activeRow * 21;
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
        const pipCount = (Math.floor(t * 2.4) % 6) + 1;
        ctx.fillStyle = cart.accent;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.6;
        ctx.fillRect(28, cy - 19, 38, 38);
        ctx.strokeRect(28, cy - 19, 38, 38);
        ctx.fillStyle = "#090B10";
        ctx.font = "900 16px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(pipCount), 47, cy + 6);

        ctx.textAlign = "left";
        ctx.fillStyle = "#E2E8F0";
        ctx.font = "900 9.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillText("TOOL WIDGET LIVE", 82, cy - 6);
        for (let seg = 0; seg < 4; seg += 1) {
          const lit = seg <= Math.floor((t * 1.8) % 4);
          ctx.fillStyle = lit ? "#6EE7B7" : "rgba(255,255,255,0.14)";
          ctx.fillRect(82 + seg * 38, cy + 5, 32, 10);
        }
      } else {
        const fullCmd = ">>> [n*n for n in range(4)]";
        const chars = Math.floor((t * 9) % (fullCmd.length + 10));
        const shown = fullCmd.slice(0, Math.min(fullCmd.length, chars));
        ctx.fillStyle = "#FFDE59";
        ctx.font = "900 10.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(shown, 16, cy - 6);
        if (chars >= fullCmd.length) {
          ctx.fillStyle = "#6EE7B7";
          ctx.fillText("[0, 1, 4, 9]", 16, cy + 18);
        } else if (Math.sin(t * 10) > 0) {
          const cw = ctx.measureText(shown).width;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(18 + cw, cy - 15, 6, 11);
        }
      }

      // Authentic subtle CRT horizontal scanlines across entire screen
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      for (let sy = 2; sy < H; sy += 4) {
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
                {previewCart.shortTitle}
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
      height: 156,
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
  });
