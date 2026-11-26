import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  HardShadow,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  type AstralPassportData,
  buildBonsaiEmblemSvgInner,
  buildMiniConstellationSvgInner,
  computePassportTilt,
  type PassportTiltState,
} from "../utils/astralPassport";
import { StudioIcon, type StudioIconName, Text } from "./StudioIcon";

export interface AstralDevPassportCardProps {
  passport: AstralPassportData;
  avatarIcon: StudioIconName;
  isMaxLevel?: boolean;
}

const RESTING_TILT: PassportTiltState = computePassportTilt(0, 0, false);

function InlineSvgGraphic({
  svgMarkup,
  width,
  height,
}: {
  svgMarkup: string;
  width: number | string;
  height: number;
}) {
  if (Platform.OS === "web") {
    return React.createElement("div", {
      style: {
        width: typeof width === "number" ? `${width}px` : width,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      },
      dangerouslySetInnerHTML: { __html: svgMarkup },
    });
  }

  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(
    svgMarkup.replace(/\s+/g, " ").trim(),
  )}`;
  return (
    <Image
      source={{ uri }}
      style={{
        width: typeof width === "number" ? width : "100%",
        height,
      }}
      contentFit="contain"
    />
  );
}

export default function AstralDevPassportCard({
  passport,
  avatarIcon,
  isMaxLevel = false,
}: AstralDevPassportCardProps) {
  const { paletteId } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [tilt, setTilt] = useState<PassportTiltState>(RESTING_TILT);

  const constellationSvg = useMemo(() => {
    const inner = buildMiniConstellationSvgInner(passport.constellations, 360, 108);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 108" width="100%" height="100%" style="display:block">${inner}</svg>`;
  }, [passport.constellations]);

  const bonsaiSvg = useMemo(() => {
    const inner = buildBonsaiEmblemSvgInner(passport.bonsai, paletteId);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84" width="100%" height="100%" style="display:block">${inner}</svg>`;
  }, [passport.bonsai, paletteId]);

  const cardInner = (
    <View
      testID="astral-dev-passport-card"
      style={[
        styles.passportShell,
        {
          borderColor: passport.rarity.foilPrimary,
        },
      ]}
    >
      {/* Top Holographic Foil Header Strip */}
      <View
        style={[
          styles.foilRibbon,
          { backgroundColor: passport.rarity.foilPrimary },
        ]}
      >
        <Text style={styles.foilRibbonTitle}>✦ ASTRAL DEV PASSPORT</Text>
        <View style={styles.foilRightGroup}>
          <Text style={styles.foilSerialText}>{passport.serialNumber}</Text>
          <View style={styles.rarityPill}>
            <Text
              style={[
                styles.rarityPillText,
                { color: passport.rarity.foilPrimary },
              ]}
            >
              {passport.rarity.badgeText}
            </Text>
          </View>
        </View>
      </View>

      {/* Subtle Web Holographic Specular Glare Layer */}
      {Platform.OS === "web" &&
        React.createElement("div", {
          "aria-hidden": "true",
          style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "12px",
            zIndex: 6,
            opacity: tilt.isHovering ? 1 : 0.35,
            transition: "opacity 220ms ease",
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.16) 0%, rgba(184,255,59,0.08) 28%, rgba(255,144,232,0.06) 52%, transparent 74%), linear-gradient(${tilt.foilAngle}deg, transparent 20%, rgba(255,255,255,0.07) 48%, transparent 76%)`,
          },
        })}

      <View style={styles.passportBody}>
        {/* Identity & Rank Crest Row */}
        <View style={styles.identityRow}>
          <View
            style={[
              styles.crestFrame,
              {
                borderColor: passport.rankAccent,
                backgroundColor: passport.rankAccent,
              },
            ]}
          >
            <StudioIcon name={avatarIcon} size={46} />
          </View>

          <View style={styles.identityTextCol}>
            <View style={styles.handleLine}>
              <Text style={styles.handleText} numberOfLines={1}>
                @{passport.handle}
              </Text>
              <View
                style={[
                  styles.membershipSeal,
                  passport.isPremium
                    ? styles.membershipSealPro
                    : styles.membershipSealFree,
                ]}
              >
                <Text style={styles.membershipSealText}>
                  {passport.isPremium ? "PRO ★" : "STUDIO"}
                </Text>
              </View>
            </View>
            <View style={styles.rankLine}>
              <View
                style={[
                  styles.levelChip,
                  { backgroundColor: passport.rankAccent },
                ]}
              >
                <Text style={styles.levelChipText}>
                  LVL {passport.rankLevel}
                  {isMaxLevel ? " · MAX" : ""}
                </Text>
              </View>
              <Text style={styles.rankTitleText} numberOfLines={1}>
                {passport.rankTitle.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Illuminated Mini Constellation Star Chart Viewport */}
        <View
          testID="passport-constellation-map"
          style={styles.constellationViewport}
        >
          <View style={styles.viewportHeader}>
            <Text style={styles.viewportKicker}>
              ✦ ILLUMINATED STAR CHART
            </Text>
            <Text style={styles.viewportMetric}>
              {passport.totalSolved}/{passport.totalLessons} STARS LIT
            </Text>
          </View>
          <InlineSvgGraphic svgMarkup={constellationSvg} width="100%" height={102} />
        </View>

        {/* Split Collector Deck: 5-Stage Bonsai Emblem + 4 Passport Visa Stamps */}
        <View style={styles.collectorSplitRow}>
          {/* Left: Potted Bonsai Growth Stage */}
          <View testID="passport-bonsai-stage" style={styles.bonsaiCard}>
            <View style={styles.bonsaiArtWrap}>
              <InlineSvgGraphic svgMarkup={bonsaiSvg} width={66} height={66} />
            </View>
            <Text style={styles.bonsaiStageTag}>
              STAGE {passport.bonsai.stageNumber}/5
            </Text>
            <Text style={styles.bonsaiStageLabel} numberOfLines={1}>
              {passport.bonsai.label}
            </Text>
          </View>

          {/* Right: 4 Collectible Observatory Visa Stamps */}
          <View testID="passport-stamps-grid" style={styles.stampsPanel}>
            <View style={styles.stampsHeader}>
              <Text style={styles.stampsKicker}>VISA STAMPS</Text>
              <Text style={styles.stampsCount}>
                {passport.stampsEarnedCount}/{passport.stamps.length}
              </Text>
            </View>
            <View style={styles.stampsGrid}>
              {passport.stamps.map((stamp) => (
                <View
                  key={stamp.id}
                  style={[
                    styles.stampSeal,
                    stamp.unlocked
                      ? {
                          borderColor: stamp.accent,
                          backgroundColor: "rgba(18, 22, 34, 0.92)",
                        }
                      : styles.stampSealLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.stampTagText,
                      {
                        color: stamp.unlocked ? stamp.accent : "#64748B",
                      },
                    ]}
                  >
                    {stamp.unlocked ? `★ ${stamp.shortTag}` : `○ ${stamp.shortTag}`}
                  </Text>
                  <Text
                    style={[
                      styles.stampLabelText,
                      !stamp.unlocked && styles.stampLabelLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {stamp.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Passport Telemetry Footer */}
        <View style={styles.passportFooter}>
          <Text style={styles.footerStatText}>
            ✦ CODEX {passport.codexIlluminated}/{passport.codexTotal}
          </Text>
          <Text style={styles.footerDot}>·</Text>
          <Text style={styles.footerStatText}>
            ★ {passport.companionLabel.toUpperCase()}
          </Text>
          <Text style={styles.footerDot}>·</Text>
          <Text style={styles.footerStatText}>
            ⚡ {passport.xpPoints.toLocaleString()} XP
          </Text>
        </View>
      </View>
    </View>
  );

  if (Platform.OS === "web") {
    return React.createElement(
      "div",
      {
        "data-testid": "astral-passport-tilt-stage",
        onPointerMove: (e: any) => {
          if (e.pointerType === "touch") return;
          const rect = e.currentTarget.getBoundingClientRect();
          if (!rect || rect.width <= 0 || rect.height <= 0) return;
          const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          setTilt(computePassportTilt(nx, ny, true));
        },
        onPointerLeave: () => setTilt(RESTING_TILT),
        style: {
          perspective: "920px",
          marginBottom: "12px",
          width: "100%",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.isHovering ? 1.012 : 1})`,
            transition: tilt.isHovering
              ? "transform 90ms ease-out"
              : "transform 340ms cubic-bezier(0.22, 1, 0.36, 1)",
            transformStyle: "preserve-3d",
            willChange: "transform",
          },
        },
        cardInner,
      ),
    );
  }

  return <View style={styles.nativeStageWrap}>{cardInner}</View>;
}

const createStyles = (_StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    nativeStageWrap: {
      marginBottom: 12,
      width: "100%",
    },
    passportShell: {
      position: "relative",
      borderRadius: 14,
      borderWidth: 2,
      backgroundColor: "#111422",
      overflow: "hidden",
      ...HardShadow,
    },
    foilRibbon: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
      gap: 6,
    },
    foilRibbonTitle: {
      color: StudioColors.ink,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.9,
    },
    foilRightGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
    },
    foilSerialText: {
      color: StudioColors.ink,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    rarityPill: {
      backgroundColor: StudioColors.ink,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    rarityPillText: {
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    passportBody: {
      padding: 12,
      gap: 10,
    },
    identityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    crestFrame: {
      width: 50,
      height: 50,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      flexShrink: 0,
    },
    identityTextCol: {
      flex: 1,
      minWidth: 0,
      gap: 5,
    },
    handleLine: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
    },
    handleText: {
      color: "#F8FAFC",
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: -0.2,
      flexShrink: 1,
    },
    membershipSeal: {
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      paddingHorizontal: 6,
      paddingVertical: 2,
      flexShrink: 0,
    },
    membershipSealPro: {
      backgroundColor: "#FF90E8",
    },
    membershipSealFree: {
      backgroundColor: "#FFDE59",
    },
    membershipSealText: {
      color: StudioColors.ink,
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    rankLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    levelChip: {
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      flexShrink: 0,
    },
    levelChipText: {
      color: StudioColors.ink,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    rankTitleText: {
      color: "#CBD5E1",
      fontSize: 10,
      fontWeight: "800",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
      flexShrink: 1,
    },
    constellationViewport: {
      backgroundColor: "#090C16",
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: "#26304A",
      paddingHorizontal: 8,
      paddingTop: 6,
      paddingBottom: 4,
    },
    viewportHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    viewportKicker: {
      color: "#94A3B8",
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    viewportMetric: {
      color: "#B8FF3B",
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.6,
    },
    collectorSplitRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "stretch",
    },
    bonsaiCard: {
      width: 118,
      backgroundColor: "#171C2E",
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: "#2B3552",
      paddingVertical: 7,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      flexShrink: 0,
    },
    bonsaiArtWrap: {
      width: 66,
      height: 66,
      alignItems: "center",
      justifyContent: "center",
    },
    bonsaiStageTag: {
      color: "#6EE7B7",
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    bonsaiStageLabel: {
      color: "#F8FAFC",
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.3,
      textAlign: "center",
    },
    stampsPanel: {
      flex: 1,
      minWidth: 0,
      backgroundColor: "#171C2E",
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: "#2B3552",
      padding: 8,
      justifyContent: "space-between",
      gap: 6,
    },
    stampsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    stampsKicker: {
      color: "#94A3B8",
      fontSize: 8,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.8,
    },
    stampsCount: {
      color: "#FFDE59",
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    stampsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    stampSeal: {
      width: "47.5%",
      borderRadius: 7,
      borderWidth: 1.5,
      paddingHorizontal: 6,
      paddingVertical: 5,
      gap: 2,
    },
    stampSealLocked: {
      borderColor: "#334155",
      borderStyle: "dashed",
      backgroundColor: "rgba(9, 12, 22, 0.55)",
    },
    stampTagText: {
      fontSize: 7.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    stampLabelText: {
      color: "#F1F5F9",
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.3,
    },
    stampLabelLocked: {
      color: "#64748B",
    },
    passportFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: "#232B42",
    },
    footerStatText: {
      color: "#CBD5E1",
      fontSize: 8.5,
      fontWeight: "800",
      fontFamily: MonoFont,
      letterSpacing: 0.4,
    },
    footerDot: {
      color: "#475569",
      fontSize: 9,
      fontWeight: "900",
    },
  });
