import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  CertificateData,
  getUnlockedCertificates,
} from "../constants/certificates";
import { HardShadow, HardShadowSm, MonoFont, StudioColors, TrackThemes } from "../constants/theme";
import { buildChallengeUrl, shareOrCopyText } from "../utils/shareUtils";
import { playKeyClick } from "../utils/soundEffects";
import { Lesson } from "./RoadmapTree";

interface ProfileStatsModalProps {
  xpPoints: number;
  streakCount: number;
  isPremium: boolean;
  userEmail?: string;
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  onSelectTrack: (trackKey: string) => void;
  onOpenCertificate?: (certificate: CertificateData) => void;
  onOpenAuth: () => void;
  onClose: () => void;
}

const TRACK_KEYS = ["python_basics", "algorithms", "system_design"] as const;

export interface DeveloperRankInfo {
  level: number;
  title: string;
  tagline: string;
  nextTitle: string;
  badge: string;
  accent: string;
  xpIntoLevel: number;
  xpForNext: number;
  xpRemaining: number;
  progressPercent: number;
}

const FUNNY_RANKS: {
  title: string;
  tagline: string;
  badge: string;
  accent: string;
}[] = [
  {
    title: "Copy-Paste Apprentice",
    tagline: "Professional StackOverflow archaeologist & Ctrl+C specialist",
    badge: "I",
    accent: "#7CA5B8",
  },
  {
    title: "Indentation Wrangler",
    tagline: "Finally stopped mixing tabs and spaces (mostly)",
    badge: "II",
    accent: "#FFDE59",
  },
  {
    title: "Print-Statement Detective",
    tagline: "Debugging the universe one print('HERE 3') at a time",
    badge: "III",
    accent: "#FF90E8",
  },
  {
    title: "Infinite Loop Survivor",
    tagline: "Battle-tested veteran who knows where Ctrl+C lives",
    badge: "IV",
    accent: "#6EE7B7",
  },
  {
    title: "Bug Whisperer",
    tagline: "It is not a bug — it is an undocumented surprise feature",
    badge: "V",
    accent: "#C4B5FD",
  },
  {
    title: "O(1) Sorcerer",
    tagline: "Severely allergic to nested loops and slow lookups",
    badge: "VI",
    accent: "#A3E635",
  },
  {
    title: "Production Cowboy",
    tagline: "Ships clean code on Fridays without breaking a sweat",
    badge: "VII",
    accent: "#FB923C",
  },
  {
    title: "10x Keyboard Overlord",
    tagline: "Speaks fluent bytecode and dreams in hash maps",
    badge: "VIII",
    accent: "#38BDF8",
  },
];

export function getDeveloperRank(xp: number): DeveloperRankInfo {
  const xpPerLevel = 100;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const xpIntoLevel = xp % xpPerLevel;
  const xpForNext = xpPerLevel;
  const xpRemaining = xpForNext - xpIntoLevel;
  const progressPercent = Math.min(
    100,
    Math.round((xpIntoLevel / xpForNext) * 100),
  );

  const currentIdx = Math.min(level - 1, FUNNY_RANKS.length - 1);
  const nextIdx = Math.min(level, FUNNY_RANKS.length - 1);
  const currentMeta = FUNNY_RANKS[currentIdx];
  const nextMeta = FUNNY_RANKS[nextIdx];

  return {
    level,
    title: currentMeta.title,
    tagline: currentMeta.tagline,
    nextTitle:
      level >= FUNNY_RANKS.length
        ? "Supreme Architect of the Multiverse"
        : nextMeta.title,
    badge: currentMeta.badge,
    accent: currentMeta.accent,
    xpIntoLevel,
    xpForNext,
    xpRemaining,
    progressPercent,
  };
}

export default function ProfileStatsModal({
  xpPoints,
  streakCount,
  isPremium,
  userEmail,
  lessons,
  completedLessons,
  onSelectTrack,
  onOpenCertificate,
  onOpenAuth,
  onClose,
}: ProfileStatsModalProps) {
  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied" | "shared">("idle");
  const rank = getDeveloperRank(xpPoints);
  const totalLessons = lessons.length;
  const totalCompleted = lessons.filter((l) => completedLessons[l.id]).length;
  const unlockedCertificates = getUnlockedCertificates({
    lessons,
    completedLessons,
    xpPoints,
    streakCount,
    rankLabel: `L${rank.level} ${rank.title}`,
    userEmail,
  });

  async function handleShareDevCard() {
    playKeyClick();
    const url = buildChallengeUrl({ ref: "profile_card" });
    const message = [
      `🐾 DevLearn Developer Card`,
      `🏅 Level ${rank.level}: ${rank.title}`,
      `"${rank.tagline}"`,
      `⚡ ${xpPoints} XP · 🔥 ${streakCount}d streak · ✓ ${totalCompleted}/${totalLessons} modules solved`,
      `Join me on DevLearn 👉 ${url}`,
    ].join("\n");
    const outcome = await shareOrCopyText({
      title: `DevLearn Rank: ${rank.title}`,
      message,
      channel: "profile_card",
    });
    if (outcome !== "failed") {
      setShareFeedback(outcome);
      setTimeout(() => setShareFeedback("idle"), 2500);
    }
  }

  const pyLessons = lessons.filter((l) => l.track === "python_basics");
  const pyDone = pyLessons.filter((l) => completedLessons[l.id]).length;

  const achievements = [
    {
      id: "first_solve",
      icon: "01",
      title: "First Execution",
      desc: "Solve your first coding assignment",
      unlocked: totalCompleted >= 1,
    },
    {
      id: "streak_active",
      icon: "02",
      title: "Momentum Builder",
      desc: "Maintain an active daily streak",
      unlocked: streakCount >= 1,
    },
    {
      id: "xp_milestone",
      icon: "03",
      title: "200 XP Club",
      desc: "Earn 200+ total experience points",
      unlocked: xpPoints >= 200,
    },
    {
      id: "python_master",
      icon: "04",
      title: "Core Graduate",
      desc: "Complete all Python Foundations modules",
      unlocked: pyLessons.length > 0 && pyDone === pyLessons.length,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.topAccentBar} />

      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.levelBadgeCircle}>
            <Text style={styles.levelNumberText}>L{rank.level}</Text>
          </View>
          <View style={styles.headerTextCol}>
            <View style={styles.rankTitleRow}>
              <Text style={styles.rankTitle}>{rank.title}</Text>
              <View
                style={[
                  styles.tierBadge,
                  isPremium ? styles.tierBadgePro : styles.tierBadgeFree,
                ]}
              >
                <Text
                  style={[
                    styles.tierBadgeText,
                    { color: StudioColors.ink },
                  ]}
                >
                  {isPremium ? "PRO" : "FREE"}
                </Text>
              </View>
            </View>
            <Text style={styles.rankTagline} numberOfLines={2}>
              "{rank.tagline}"
            </Text>
            <Text style={styles.emailText} numberOfLines={1}>
              {userEmail ? userEmail : "Guest Profile · Not synced to cloud"}
            </Text>
          </View>
        </View>

        <Pressable style={styles.closeIconBtn} onPress={onClose}>
          <Text style={styles.closeIconText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Level XP Progress Bar */}
        <View style={styles.levelProgressBox}>
          <View style={styles.levelProgressHeader}>
            <Text style={styles.levelProgressLabel}>
              LEVEL {rank.level} · {rank.title.toUpperCase()}
            </Text>
            <Text style={styles.levelProgressCount}>
              {rank.xpIntoLevel} / {rank.xpForNext} XP
            </Text>
          </View>
          <View style={styles.levelBarTrack}>
            <View
              style={[
                styles.levelBarFill,
                { width: `${Math.max(rank.progressPercent, 5)}%` },
              ]}
            />
          </View>
          <Text style={styles.nextRankHintText}>
            ⚡ {rank.xpRemaining} XP until Level {rank.level + 1}:{" "}
            <Text style={styles.nextRankHighlight}>{rank.nextTitle}</Text>
          </Text>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: StudioColors.yellow }]}>
            <Text style={styles.statValue}>🔥 {streakCount}</Text>
            <Text style={styles.statLabel}>DAY STREAK</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: StudioColors.pink }]}>
            <Text style={styles.statValue}>⚡ {xpPoints}</Text>
            <Text style={styles.statLabel}>TOTAL XP</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: StudioColors.mint }]}>
            <Text style={styles.statValue}>
              ✓ {totalCompleted}/{totalLessons}
            </Text>
            <Text style={styles.statLabel}>SOLVED</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.shareCardBtn,
            shareFeedback !== "idle" && styles.shareCardBtnDone,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={handleShareDevCard}
        >
          <Text style={styles.shareCardBtnText}>
            {shareFeedback === "copied"
              ? "✓ DEVELOPER CARD COPIED TO CLIPBOARD!"
              : shareFeedback === "shared"
                ? "✓ DEVELOPER CARD SHARED!"
                : "📤 SHARE MY DEVELOPER CARD ↗"}
          </Text>
        </Pressable>

        {/* Track Mastery Breakdown */}
        <Text style={styles.sectionHeading}>TRACK MASTERY</Text>
        <View style={styles.tracksList}>
          {TRACK_KEYS.map((tKey) => {
            const meta = TrackThemes[tKey];
            const isTrackLocked = meta.isPro && !isPremium;
            const tLessons = lessons.filter((l) => l.track === tKey);
            const tDone = tLessons.filter((l) => completedLessons[l.id]).length;
            const pct = tLessons.length
              ? Math.round((tDone / tLessons.length) * 100)
              : 0;

            return (
              <Pressable
                key={tKey}
                style={styles.trackRowCard}
                onPress={() => {
                  onSelectTrack(tKey);
                  onClose();
                }}
              >
                <View style={styles.trackRowHeader}>
                  <Text style={styles.trackRowTitle}>
                    {isTrackLocked ? `🔒 ${meta.label}` : `[${meta.icon}] ${meta.label}`}
                  </Text>
                  <Text
                    style={[
                      styles.trackRowCount,
                      { color: StudioColors.textPrimary },
                    ]}
                  >
                    {isTrackLocked
                      ? "PRO TRACK"
                      : `${tDone}/${tLessons.length} (${pct}%)`}
                  </Text>
                </View>
                <View style={styles.trackRowBarBg}>
                  <View
                    style={[
                      styles.trackRowBarFill,
                      { width: `${pct}%`, backgroundColor: meta.stickerBg },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Unlockable Certificates */}
        <Text style={styles.sectionHeading}>
          CERTIFICATES & CREDENTIALS ({unlockedCertificates.length})
        </Text>
        {unlockedCertificates.length > 0 ? (
          <View style={styles.certsList}>
            {unlockedCertificates.map((cert) => (
              <Pressable
                key={cert.id}
                style={({ pressed }) => [
                  styles.certRowCard,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  onClose();
                  onOpenCertificate?.(cert);
                }}
              >
                <View
                  style={[styles.certIconBox, { backgroundColor: cert.accent }]}
                >
                  <Text style={styles.certIconText}>
                    {cert.kind === "track" ? "🎓" : "🏆"}
                  </Text>
                </View>
                <View style={styles.certCopyCol}>
                  <Text style={styles.certRowTitle} numberOfLines={1}>
                    {cert.title}
                  </Text>
                  <Text style={styles.certRowMeta} numberOfLines={1}>
                    ID: {cert.credentialCode} · {cert.completedCount} labs
                  </Text>
                </View>
                <View style={styles.certViewPill}>
                  <Text style={styles.certViewPillText}>SHARE ↗</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.certLockedTeaser}>
            <Text style={styles.certLockedTeaserText}>
              Complete any 4-module chapter or finish a full track to mint your
              first shareable Certificate & LinkedIn credential.
            </Text>
          </View>
        )}

        {/* Unlockable Achievements */}
        <Text style={styles.sectionHeading}>ACHIEVEMENT BADGES</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((ach) => (
            <View
              key={ach.id}
              style={[
                styles.achievementCard,
                ach.unlocked
                  ? styles.achievementCardUnlocked
                  : styles.achievementCardLocked,
              ]}
            >
              <View style={styles.achievementTop}>
                <Text style={styles.achievementIcon}>{ach.icon}</Text>
                <Text
                  style={[
                    styles.achievementStatus,
                    ach.unlocked
                      ? { color: StudioColors.emerald }
                      : { color: StudioColors.textMuted },
                  ]}
                >
                  {ach.unlocked ? "✓ UNLOCKED" : "LOCKED"}
                </Text>
              </View>
              <Text style={styles.achievementTitle}>{ach.title}</Text>
              <Text style={styles.achievementDesc}>{ach.desc}</Text>
            </View>
          ))}
        </View>

        {!userEmail && (
          <Pressable
            style={styles.syncCtaBtn}
            onPress={() => {
              onClose();
              onOpenAuth();
            }}
          >
            <Text style={styles.syncCtaText}>
              ☁️ Sign In to Save & Sync Your Progress ➔
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    padding: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    width: 450,
    maxWidth: "94%",
    maxHeight: "88%",
    overflow: "hidden",
    position: "relative",
    ...HardShadow,
  },
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: StudioColors.violet,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  levelBadgeCircle: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: 10,
    backgroundColor: StudioColors.violet,
    borderWidth: 2,
    borderColor: StudioColors.border,
    justifyContent: "center",
    alignItems: "center",
    ...HardShadowSm,
  },
  levelNumberText: {
    color: StudioColors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  rankTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  rankTitle: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  rankTagline: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    fontStyle: "italic",
    marginTop: 2,
  },
  nextRankHintText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
  nextRankHighlight: {
    color: StudioColors.textPrimary,
    fontWeight: "900",
  },
  tierBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  tierBadgePro: {
    backgroundColor: StudioColors.pink,
    borderColor: StudioColors.border,
  },
  tierBadgeFree: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.border,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
  },
  emailText: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 8,
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  closeIconText: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  scrollBody: {
    flexGrow: 0,
  },
  levelProgressBox: {
    backgroundColor: StudioColors.bg,
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.border,
    marginBottom: 14,
  },
  levelProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelProgressLabel: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    fontFamily: MonoFont,
  },
  levelProgressCount: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  levelBarTrack: {
    height: 10,
    backgroundColor: StudioColors.surface,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  levelBarFill: {
    height: "100%",
    backgroundColor: StudioColors.lime,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: StudioColors.bg,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    alignItems: "center",
    gap: 4,
    ...HardShadowSm,
  },
  statValue: {
    color: StudioColors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  statLabel: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  sectionHeading: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    fontFamily: MonoFont,
    marginBottom: 8,
  },
  tracksList: {
    gap: 8,
    marginBottom: 18,
  },
  trackRowCard: {
    backgroundColor: StudioColors.bg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    gap: 8,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  trackRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackRowTitle: {
    color: StudioColors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  trackRowCount: {
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  trackRowBarBg: {
    height: 8,
    backgroundColor: StudioColors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  trackRowBarFill: {
    height: "100%",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  achievementCard: {
    width: "48%",
    flexGrow: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 4,
  },
  achievementCardUnlocked: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.border,
  },
  achievementCardLocked: {
    backgroundColor: StudioColors.bg,
    borderColor: StudioColors.border,
    opacity: 0.7,
  },
  achievementTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  achievementIcon: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: MonoFont,
    color: StudioColors.textPrimary,
  },
  achievementStatus: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: MonoFont,
  },
  achievementTitle: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
  achievementDesc: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  syncCtaBtn: {
    marginTop: 10,
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  syncCtaText: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  shareCardBtn: {
    marginBottom: 16,
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  shareCardBtnDone: {
    backgroundColor: StudioColors.mint,
  },
  shareCardBtnText: {
    color: StudioColors.ink,
    fontSize: 11.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  certsList: {
    gap: 8,
    marginBottom: 16,
  },
  certRowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 10,
    padding: 10,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  certIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  certIconText: {
    fontSize: 16,
  },
  certCopyCol: {
    flex: 1,
    gap: 2,
  },
  certRowTitle: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
  certRowMeta: {
    color: StudioColors.textSecondary,
    fontFamily: MonoFont,
    fontSize: 9.5,
    fontWeight: "700",
  },
  certViewPill: {
    backgroundColor: StudioColors.lime,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  certViewPillText: {
    color: StudioColors.ink,
    fontFamily: MonoFont,
    fontSize: 9.5,
    fontWeight: "900",
  },
  certLockedTeaser: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  certLockedTeaserText: {
    color: StudioColors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },
});
