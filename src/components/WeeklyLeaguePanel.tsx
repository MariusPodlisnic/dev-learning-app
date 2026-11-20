import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
  StudioThemeColors,
} from "../constants/theme";
import { useThemedStyles } from "../constants/themeContext";
import { ViewMode } from "../types/lesson";
import { playKeyClick, playSuccessChime } from "../utils/soundEffects";
import { getOnboardingState } from "../utils/userOnboarding";
import {
  buildLeagueStandings,
  fetchWeeklyLeagueEntries,
  getDaysUntilWeekReset,
  getIsoWeekKey,
  getWeeklyLeagueLocalState,
  hydrateWeeklyLeagueLocalState,
  LEAGUE_TIERS,
  type LeagueEntry,
  leaveWeeklyLeague,
  recordWeeklyXpSnapshot,
  setWeeklyLeagueOptIn,
  subscribeWeeklyLeague,
  syncMyWeeklyLeagueEntry,
  type WeeklyLeagueLocalState,
} from "../utils/weeklyLeague";
import { getDeveloperRank } from "./ProfileStatsModal";
import { getLevelAvatarIcon, StudioIcon, Text } from "./StudioIcon";

interface WeeklyLeaguePanelProps {
  xpPoints: number;
  streakCount: number;
  sessionUserId?: string | null;
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onNavigateMode: (mode: ViewMode) => void;
}

export default function WeeklyLeaguePanel({
  xpPoints,
  streakCount,
  sessionUserId = null,
  userEmail = null,
  onOpenAuth,
  onNavigateMode,
}: WeeklyLeaguePanelProps) {
  const styles = useThemedStyles(createStyles);
  const weekKey = useMemo(() => getIsoWeekKey(), []);
  const daysLeft = useMemo(() => getDaysUntilWeekReset(), []);
  const devRank = useMemo(() => getDeveloperRank(xpPoints), [xpPoints]);

  const [localState, setLocalState] = useState<WeeklyLeagueLocalState>(() =>
    getWeeklyLeagueLocalState(),
  );
  const [liveEntries, setLiveEntries] = useState<
    Omit<LeagueEntry, "isGhost" | "isCurrentUser" | "rank">[]
  >([]);
  const [liveAvailable, setLiveAvailable] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  const displayName = useMemo(() => {
    const onboardingName = getOnboardingState().displayName;
    if (onboardingName) return onboardingName;
    if (userEmail) {
      const prefix = userEmail.split("@")[0]?.trim();
      if (prefix) return prefix.slice(0, 20);
    }
    return "You";
  }, [userEmail]);

  useEffect(() => {
    void hydrateWeeklyLeagueLocalState().then(() => {
      recordWeeklyXpSnapshot(xpPoints);
    });
    return subscribeWeeklyLeague(setLocalState);
  }, [xpPoints]);

  const refreshLiveBoard = useCallback(async () => {
    const res = await fetchWeeklyLeagueEntries(weekKey);
    setLiveEntries(res.entries);
    setLiveAvailable(res.liveAvailable);
  }, [weekKey]);

  useEffect(() => {
    let active = true;
    void fetchWeeklyLeagueEntries(weekKey).then((res) => {
      if (!active) return;
      setLiveEntries(res.entries);
      setLiveAvailable(res.liveAvailable);
    });
    return () => {
      active = false;
    };
  }, [weekKey]);

  // If signed in and opted in, keep user's live weekly score synced
  useEffect(() => {
    if (!sessionUserId || !localState.optedIn) return;
    void syncMyWeeklyLeagueEntry({
      userId: sessionUserId,
      displayName,
      avatarLevel: devRank.level,
      weeklyXp: localState.weeklyXp,
      streakCount,
      weekKey,
    }).then((ok) => {
      if (ok) void refreshLiveBoard();
    });
  }, [
    devRank.level,
    displayName,
    localState.optedIn,
    localState.weeklyXp,
    refreshLiveBoard,
    sessionUserId,
    streakCount,
    weekKey,
  ]);

  async function handleToggleOptIn() {
    playKeyClick();
    if (!sessionUserId) {
      onOpenAuth?.();
      return;
    }
    setSyncing(true);
    try {
      const nextOptIn = !localState.optedIn;
      setWeeklyLeagueOptIn(nextOptIn);
      if (nextOptIn) {
        const ok = await syncMyWeeklyLeagueEntry({
          userId: sessionUserId,
          displayName,
          avatarLevel: devRank.level,
          weeklyXp: localState.weeklyXp,
          streakCount,
          weekKey,
        });
        if (ok) playSuccessChime();
      } else {
        await leaveWeeklyLeague(sessionUserId, weekKey);
      }
      await refreshLiveBoard();
    } finally {
      setSyncing(false);
    }
  }

  const league = useMemo(
    () =>
      buildLeagueStandings({
        weekKey,
        currentUser: {
          id: sessionUserId || "local-current-user",
          displayName,
          avatarLevel: devRank.level,
          weeklyXp: localState.weeklyXp,
          streakCount,
        },
        liveEntries,
        maxRows: 10,
      }),
    [
      devRank.level,
      displayName,
      liveEntries,
      localState.weeklyXp,
      sessionUserId,
      streakCount,
      weekKey,
    ],
  );

  return (
    <View style={styles.wrap}>
      {/* League Tier Header Card */}
      <View style={styles.tierCard}>
        <View
          style={[
            styles.tierTopRibbon,
            { backgroundColor: league.tier.accent },
          ]}
        />
        <View style={styles.tierBody}>
          <View style={styles.tierHeaderRow}>
            <View style={styles.tierLeftCol}>
              <View style={styles.tierPillsRow}>
                <View
                  style={[
                    styles.tierBadgePill,
                    { backgroundColor: league.tier.accent },
                  ]}
                >
                  <Text style={styles.tierBadgeText}>{league.tier.badge}</Text>
                </View>
                <View style={styles.weekMetaPill}>
                  <Text style={styles.weekMetaText}>
                    {weekKey} · RESETS IN {daysLeft}
                    {daysLeft === 1 ? " DAY" : " DAYS"}
                  </Text>
                </View>
              </View>
              <Text style={styles.tierTitle}>
                {league.tier.name} · Rank #{league.myRank}
              </Text>
              <Text style={styles.tierSubtitle}>{league.tier.tagline}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                !sessionUserId
                  ? "Sign in to join live Weekly League"
                  : localState.optedIn
                    ? "Leave live Weekly League leaderboard"
                    : "Join live Weekly League leaderboard"
              }
              disabled={syncing}
              style={({ pressed }) => [
                styles.optInBtn,
                sessionUserId && localState.optedIn && styles.optInBtnActive,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
              onPress={handleToggleOptIn}
            >
              <Text
                style={[
                  styles.optInBtnText,
                  sessionUserId &&
                    localState.optedIn &&
                    styles.optInBtnTextActive,
                ]}
              >
                {syncing
                  ? "SYNCING..."
                  : !sessionUserId
                    ? "🌐 SIGN IN FOR LIVE BOARD →"
                    : localState.optedIn
                      ? "✓ OPTED IN (LIVE)"
                      : "🌐 JOIN LIVE BOARD"}
              </Text>
            </Pressable>
          </View>

          {/* 4-Tier League Ladder */}
          <View style={styles.ladderRow}>
            {LEAGUE_TIERS.map((tier) => {
              const isCurrent = tier.id === league.tier.id;
              return (
                <View
                  key={tier.id}
                  style={[
                    styles.ladderStep,
                    isCurrent && [
                      styles.ladderStepActive,
                      {
                        borderColor: tier.accent,
                        backgroundColor: StudioColors.surfaceElevated,
                      },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.ladderStepText,
                      isCurrent && { color: StudioColors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {tier.badge}
                  </Text>
                  <Text style={styles.ladderStepXp}>
                    {tier.minWeeklyXp}+ XP
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Weekly Tier Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelsRow}>
              <Text style={styles.progressStatLabel}>
                THIS WEEK: {localState.weeklyXp.toLocaleString()} XP
              </Text>
              <Text style={styles.progressStatRight}>
                {league.nextTier
                  ? `+${league.xpToNextTier} XP TO ${league.nextTier.name.toUpperCase()}`
                  : "★ TOP GRANDMASTER TIER"}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(6, league.progressPercent)}%`,
                    backgroundColor: league.tier.accent,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Next Rival Motivation Strip */}
      <View style={styles.rivalBanner}>
        <Text style={styles.rivalBannerText}>
          {league.rivalAhead
            ? `🎯 Earn ${league.xpToPassRival} more XP this week to pass ${league.rivalAhead.displayName} for #${league.rivalAhead.rank}!`
            : `👑 You're leading #1 in ${league.tier.name} this week — keep your streak blazing!`}
        </Text>
        <Text style={styles.boardModeTag}>
          {liveAvailable && liveEntries.length > 0
            ? `🌐 ${league.livePlayerCount} LIVE + GHOSTS`
            : "👻 COZY GHOST RIVALS"}
        </Text>
      </View>

      {/* Standings Board */}
      <View style={styles.boardCard}>
        {league.standings.map((entry, idx) => {
          const rankNum = entry.rank ?? idx + 1;
          const medal =
            rankNum === 1
              ? "🥇"
              : rankNum === 2
                ? "🥈"
                : rankNum === 3
                  ? "🥉"
                  : `#${rankNum}`;
          const isTop3 = rankNum <= 3;

          return (
            <React.Fragment key={entry.id}>
              <View
                style={[
                  styles.row,
                  entry.isCurrentUser && styles.rowCurrentUser,
                  idx > 0 && styles.rowBorderTop,
                ]}
              >
                <View style={styles.rowLeft}>
                  <View
                    style={[
                      styles.rankChip,
                      isTop3 && styles.rankChipTop3,
                    ]}
                  >
                    <Text style={styles.rankChipText}>{medal}</Text>
                  </View>

                  <View style={styles.avatarFrame}>
                    <StudioIcon
                      name={getLevelAvatarIcon(entry.avatarLevel)}
                      size={26}
                    />
                  </View>

                  <View style={styles.identityCol}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[
                          styles.playerName,
                          entry.isCurrentUser && styles.playerNameCurrent,
                        ]}
                        numberOfLines={1}
                      >
                        {entry.displayName}
                      </Text>
                      {entry.isCurrentUser ? (
                        <View style={styles.youPill}>
                          <Text style={styles.youPillText}>YOU</Text>
                        </View>
                      ) : entry.isGhost ? (
                        <View style={styles.ghostPill}>
                          <Text style={styles.ghostPillText}>GHOST</Text>
                        </View>
                      ) : (
                        <View style={styles.livePill}>
                          <Text style={styles.livePillText}>LIVE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.playerMeta}>
                      LVL {entry.avatarLevel} · 🔥 {entry.streakCount}d streak
                    </Text>
                  </View>
                </View>

                <View style={styles.xpCol}>
                  <Text
                    style={[
                      styles.xpValue,
                      entry.isCurrentUser && styles.xpValueCurrent,
                    ]}
                  >
                    {entry.weeklyXp.toLocaleString()} XP
                  </Text>
                </View>
              </View>

              {rankNum === 3 && idx < league.standings.length - 1 ? (
                <View style={styles.promotionDivider}>
                  <Text style={styles.promotionDividerText}>
                    ▲ TOP 3 WEEKLY PROMOTION ZONE ▲
                  </Text>
                </View>
              ) : null}
            </React.Fragment>
          );
        })}
      </View>

      {/* Quick Earn XP Action Row */}
      <View style={styles.boostRow}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.boostBtn,
            { backgroundColor: StudioColors.lime },
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onNavigateMode("roadmap");
          }}
        >
          <Text style={styles.boostBtnText}>▶ SOLVE LESSON (+50 XP)</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.boostBtn,
            { backgroundColor: StudioColors.mint },
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onNavigateMode("flashcards");
          }}
        >
          <Text style={styles.boostBtnText}>🃏 FLASH DECK (+45 XP)</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.boostBtn,
            { backgroundColor: StudioColors.yellow },
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          onPress={() => {
            playKeyClick();
            onNavigateMode("blitz");
          }}
        >
          <Text style={styles.boostBtnText}>⚡ 60S BLITZ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    wrap: {
      gap: 14,
    },
    tierCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 14,
      overflow: "hidden",
      ...HardShadow,
    },
    tierTopRibbon: {
      height: 6,
      borderBottomWidth: 2,
      borderBottomColor: StudioColors.ink,
    },
    tierBody: {
      padding: 16,
      gap: 12,
    },
    tierHeaderRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    tierLeftCol: {
      flex: 1,
      minWidth: 220,
      gap: 5,
    },
    tierPillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
    },
    tierBadgePill: {
      borderWidth: 1.5,
      borderColor: StudioColors.ink,
      borderRadius: 6,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    tierBadgeText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.7,
    },
    weekMetaPill: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    weekMetaText: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    tierTitle: {
      color: StudioColors.textPrimary,
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    tierSubtitle: {
      color: StudioColors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
    },
    optInBtn: {
      backgroundColor: StudioColors.yellow,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 9,
      paddingHorizontal: 12,
      paddingVertical: 8,
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    optInBtnActive: {
      backgroundColor: StudioColors.mint,
    },
    optInBtnText: {
      color: StudioColors.ink,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    optInBtnTextActive: {
      color: StudioColors.ink,
    },
    ladderRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    ladderStep: {
      flex: 1,
      minWidth: 108,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 8,
      alignItems: "center",
      gap: 2,
    },
    ladderStepActive: {
      borderWidth: 2,
    },
    ladderStepText: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    ladderStepXp: {
      color: StudioColors.textDim,
      fontSize: 9,
      fontWeight: "800",
      fontFamily: MonoFont,
    },
    progressSection: {
      gap: 6,
    },
    progressLabelsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    progressStatLabel: {
      color: StudioColors.textPrimary,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    progressStatRight: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    progressTrack: {
      height: 10,
      backgroundColor: StudioColors.bg,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
    },
    rivalBanner: {
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    rivalBannerText: {
      color: StudioColors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      flex: 1,
      minWidth: 220,
    },
    boardModeTag: {
      color: StudioColors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
    boardCard: {
      backgroundColor: StudioColors.surface,
      borderWidth: 2,
      borderColor: StudioColors.border,
      borderRadius: 14,
      overflow: "hidden",
      ...HardShadow,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 11,
      gap: 10,
    },
    rowCurrentUser: {
      backgroundColor: StudioColors.surfaceElevated,
    },
    rowBorderTop: {
      borderTopWidth: 1,
      borderTopColor: StudioColors.borderSubtle,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    rankChip: {
      width: 34,
      height: 28,
      borderRadius: 7,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    rankChipTop3: {
      backgroundColor: StudioColors.yellow,
      borderColor: StudioColors.ink,
    },
    rankChipText: {
      color: StudioColors.textPrimary,
      fontSize: 11,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    avatarFrame: {
      width: 34,
      height: 34,
      borderRadius: 9,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    identityCol: {
      flex: 1,
      gap: 2,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    playerName: {
      color: StudioColors.textPrimary,
      fontSize: 13.5,
      fontWeight: "800",
      flexShrink: 1,
    },
    playerNameCurrent: {
      fontWeight: "900",
    },
    youPill: {
      backgroundColor: StudioColors.lime,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    youPillText: {
      color: StudioColors.ink,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    ghostPill: {
      backgroundColor: StudioColors.bg,
      borderWidth: 1,
      borderColor: StudioColors.borderSubtle,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    ghostPillText: {
      color: StudioColors.textDim,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    livePill: {
      backgroundColor: StudioColors.mint,
      borderWidth: 1,
      borderColor: StudioColors.ink,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    livePillText: {
      color: StudioColors.ink,
      fontSize: 8.5,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    playerMeta: {
      color: StudioColors.textMuted,
      fontSize: 10.5,
      fontWeight: "700",
      fontFamily: MonoFont,
    },
    xpCol: {
      alignItems: "flex-end",
    },
    xpValue: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "900",
      fontFamily: MonoFont,
    },
    xpValueCurrent: {
      color: StudioColors.lime,
    },
    promotionDivider: {
      backgroundColor: StudioColors.bg,
      borderTopWidth: 1.5,
      borderBottomWidth: 1.5,
      borderColor: StudioColors.mint,
      borderStyle: "dashed",
      paddingVertical: 5,
      alignItems: "center",
    },
    promotionDividerText: {
      color: StudioColors.mint,
      fontSize: 9.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 1,
    },
    boostRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    boostBtn: {
      flex: 1,
      minWidth: 150,
      borderWidth: 2,
      borderColor: StudioColors.ink,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 10,
      alignItems: "center",
      ...HardShadowSm,
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    boostBtnText: {
      color: StudioColors.ink,
      fontSize: 10.5,
      fontWeight: "900",
      fontFamily: MonoFont,
      letterSpacing: 0.5,
    },
  });
