import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  buildCertificateShareText,
  buildLinkedInCredentialText,
  CertificateData,
} from "../constants/certificates";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  SerifFont,
  StudioColors,
} from "../constants/theme";
import { shareOrCopyText } from "../utils/shareUtils";
import { playKeyClick } from "../utils/soundEffects";
import PixelConfetti from "./PixelConfetti";

interface CertificateModalProps {
  certificate: CertificateData;
  onClose: () => void;
}

export default function CertificateModal({
  certificate,
  onClose,
}: CertificateModalProps) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">(
    "idle",
  );
  const [linkedInCopied, setLinkedInCopied] = useState<boolean>(false);

  async function handleShareCertificate() {
    playKeyClick();
    const outcome = await shareOrCopyText({
      title: `DevLearn Arcade — ${certificate.title}`,
      message: buildCertificateShareText(certificate),
    });
    if (outcome !== "failed") {
      setShareStatus(outcome);
      setTimeout(() => setShareStatus("idle"), 2500);
    }
  }

  async function handleCopyLinkedIn() {
    playKeyClick();
    const outcome = await shareOrCopyText({
      title: certificate.title,
      message: buildLinkedInCredentialText(certificate),
    });
    if (outcome !== "failed") {
      setLinkedInCopied(true);
      setTimeout(() => setLinkedInCopied(false), 2500);
    }
  }

  return (
    <View style={styles.card}>
      <View
        style={[styles.topAccentBar, { backgroundColor: certificate.accent }]}
      />
      <PixelConfetti />

      {/* Top Row: Seal + Close Button */}
      <View style={styles.headerRow}>
        <View style={styles.sealRow}>
          <View
            style={[styles.sealBadge, { backgroundColor: certificate.accent }]}
          >
            <Text style={styles.sealBadgeText}>
              {certificate.kind === "track"
                ? "🎓 TRACK GRADUATE"
                : "🏆 CHAPTER CERTIFICATE"}
            </Text>
          </View>
          <View style={styles.codePill}>
            <Text style={styles.codePillText}>
              ID // {certificate.credentialCode}
            </Text>
          </View>
        </View>

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Framed Certificate Parchment */}
      <View style={styles.parchmentFrame}>
        <Text style={styles.issuerEyebrow}>
          DEVLEARN ARCADE · CERTIFICATE OF COMPLETION
        </Text>

        <Text style={styles.awardedLabel}>PROUDLY AWARDED TO</Text>
        <Text style={styles.recipientName} numberOfLines={1}>
          {certificate.recipientLabel}
        </Text>

        <View
          style={[
            styles.dividerBar,
            { backgroundColor: certificate.accent },
          ]}
        />

        <Text style={styles.certTitle}>{certificate.title}</Text>
        <Text style={styles.certSubtitle}>{certificate.subtitle}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricChip}>
            <Text style={styles.metricValue}>
              ✓ {certificate.completedCount} LABS
            </Text>
            <Text style={styles.metricLabel}>VERIFIED</Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricValue}>⚡ {certificate.xpPoints} XP</Text>
            <Text style={styles.metricLabel}>EARNED</Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricValue} numberOfLines={1}>
              {certificate.rankLabel}
            </Text>
            <Text style={styles.metricLabel}>ARCADE RANK</Text>
          </View>
        </View>

        <View style={styles.signatureFooter}>
          <View>
            <Text style={styles.signatureLabel}>ISSUED</Text>
            <Text style={styles.signatureValue}>{certificate.issuedDate}</Text>
          </View>
          <View style={styles.stampBadge}>
            <Text style={styles.stampText}>🐾 BYTE-CAT VERIFIED</Text>
          </View>
        </View>
      </View>

      {/* Share & Credential Actions */}
      <Pressable
        style={({ pressed }) => [
          styles.primaryShareBtn,
          shareStatus !== "idle" && styles.primaryShareBtnDone,
          pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
        ]}
        onPress={handleShareCertificate}
      >
        <Text style={styles.primaryShareText}>
          {shareStatus === "copied"
            ? "✓ CERTIFICATE POST COPIED!"
            : shareStatus === "shared"
              ? "✓ CERTIFICATE SHARED!"
              : "📤 SHARE CERTIFICATE ON X / DISCORD ↗"}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.linkedInBtn,
          linkedInCopied && styles.linkedInBtnDone,
          pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
        ]}
        onPress={handleCopyLinkedIn}
      >
        <Text style={styles.linkedInBtnText}>
          {linkedInCopied
            ? "✓ LINKEDIN CREDENTIAL COPIED TO CLIPBOARD!"
            : "💼 COPY LINKEDIN / RESUME CREDENTIAL"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    padding: 22,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    width: 490,
    maxWidth: "94%",
    overflow: "hidden",
    position: "relative",
    gap: 12,
    ...HardShadowHero,
  },
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.ink,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 6,
  },
  sealRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  sealBadge: {
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sealBadgeText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  codePill: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  codePillText: {
    color: StudioColors.textSecondary,
    fontFamily: MonoFont,
    fontSize: 9.5,
    fontWeight: "800",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  closeBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  parchmentFrame: {
    backgroundColor: StudioColors.bg,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    gap: 6,
    ...HardShadowSm,
  },
  issuerEyebrow: {
    color: StudioColors.textMuted,
    fontFamily: MonoFont,
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.9,
    textAlign: "center",
  },
  awardedLabel: {
    marginTop: 4,
    color: StudioColors.textSecondary,
    fontFamily: MonoFont,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  recipientName: {
    color: StudioColors.textPrimary,
    fontFamily: SerifFont,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  dividerBar: {
    width: 64,
    height: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: StudioColors.ink,
    marginVertical: 4,
  },
  certTitle: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  certSubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 390,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    width: "100%",
  },
  metricChip: {
    flexGrow: 1,
    minWidth: 110,
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  metricValue: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 10.5,
    fontWeight: "900",
  },
  metricLabel: {
    color: StudioColors.textMuted,
    fontFamily: MonoFont,
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  signatureFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: StudioColors.borderSubtle,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  signatureLabel: {
    color: StudioColors.textMuted,
    fontFamily: MonoFont,
    fontSize: 8.5,
    fontWeight: "800",
  },
  signatureValue: {
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
  stampBadge: {
    backgroundColor: StudioColors.mint,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stampText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 9.5,
    fontWeight: "900",
  },
  primaryShareBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    ...HardShadow,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  primaryShareBtnDone: {
    backgroundColor: StudioColors.mint,
  },
  primaryShareText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11.5,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  linkedInBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  linkedInBtnDone: {
    backgroundColor: StudioColors.mint,
  },
  linkedInBtnText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 11,
    fontWeight: "900",
  },
});
