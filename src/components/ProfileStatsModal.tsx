import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { HardShadow, HardShadowSm, MonoFont, StudioColors, TrackThemes } from "../constants/theme";
import { Lesson } from "./RoadmapTree";

interface ProfileStatsModalProps {
  xpPoints: number;
  streakCount: number;
  isPremium: boolean;
  userEmail?: string;
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  onSelectTrack: (trackKey: string) => void;
  onOpenAuth: () => void;
  onClose: () => void;
}

const TRACK_KEYS = ["python_basics", "algorithms", "system_design"] as const;

export function getDeveloperRank(xp: number) {
  const level = Math.floor(xp / 150) + 1;
  const xpIntoLevel = xp % 150;
  const xpForNext = 150;
  const progressPercent = Math.min(
    100,
    Math.round((xpIntoLevel / xpForNext) * 100),
  );

  let title = "Python Initiate";
  let badge = "I";
  let accent = "#7CA5B8";
  if (level === 2) {
    title = "Logic Builder";
    badge = "II";
    accent = "#E07A5F";
  } else if (level === 3) {
    title = "Algorithm Engineer";
    badge = "III";
    accent = "#F2CC8F";
  } else if (level >= 4) {
    title = "Systems Architect";
    badge = "IV";
    accent = "#81B29A";
  }

  return {
    level,
    title,
    badge,
    accent,
    xpIntoLevel,
    xpForNext,
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
  onOpenAuth,
  onClose,
}: ProfileStatsModalProps) {
  const rank = getDeveloperRank(xpPoints);
  const totalLessons = lessons.length;
  const totalCompleted = lessons.filter((l) => completedLessons[l.id]).length;

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
          <View>
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
                    { color: StudioColors.textPrimary },
                  ]}
                >
                  {isPremium ? "PRO" : "FREE"}
                </Text>
              </View>
            </View>
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
              LEVEL {rank.level} PROGRESS
            </Text>
            <Text style={styles.levelProgressCount}>
              {rank.xpIntoLevel} / {rank.xpForNext} XP to Level {rank.level + 1}
            </Text>
          </View>
          <View style={styles.levelBarTrack}>
            <View
              style={[
                styles.levelBarFill,
                { width: `${rank.progressPercent}%` },
              ]}
            />
          </View>
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

        {/* Track Mastery Breakdown */}
        <Text style={styles.sectionHeading}>TRACK MASTERY</Text>
        <View style={styles.tracksList}>
          {TRACK_KEYS.map((tKey) => {
            const meta = TrackThemes[tKey];
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
                    {meta.icon} {meta.label}
                  </Text>
                  <Text
                    style={[styles.trackRowCount, { color: meta.accent }]}
                  >
                    {tDone}/{tLessons.length} ({pct}%)
                  </Text>
                </View>
                <View style={styles.trackRowBarBg}>
                  <View
                    style={[
                      styles.trackRowBarFill,
                      { width: `${pct}%`, backgroundColor: meta.accent },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

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
    alignItems: "center",
    marginBottom: 18,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  levelBadgeCircle: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: StudioColors.violet,
    borderWidth: 2,
    borderColor: StudioColors.border,
    justifyContent: "center",
    alignItems: "center",
    ...HardShadowSm,
  },
  levelNumberText: {
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  rankTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rankTitle: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
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
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  statLabel: {
    color: StudioColors.textPrimary,
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
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
});
