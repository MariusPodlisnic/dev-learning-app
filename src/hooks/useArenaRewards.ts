import type { Session } from "@supabase/supabase-js";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import {
  type ChapterTierMeta,
  TRACK_CHAPTERS,
} from "../constants/certificates";
import {
  computeStreakUpdate,
  type StreakMilestone,
} from "../constants/streaks";
import { trackFunnelMilestone } from "../utils/attribution";
import {
  claimDailyQuestBonus,
  recordDailyQuestStep,
} from "../utils/dailyQuests";
import { playVictoryFanfare } from "../utils/soundEffects";
import {
  type CloudProgressState,
  pushCloudProgressState,
} from "../utils/supabaseSync";

export interface UseArenaRewardsOptions {
  xpPoints: number;
  setXpPoints: Dispatch<SetStateAction<number>>;
  streakCount: number;
  setStreakCount: Dispatch<SetStateAction<number>>;
  lastActiveDate: string | null;
  setLastActiveDate: Dispatch<SetStateAction<string | null>>;
  claimedStreakMilestones: Record<number, boolean>;
  setClaimedStreakMilestones: Dispatch<SetStateAction<Record<number, boolean>>>;
  streakShields: number;
  setStreakShields: Dispatch<SetStateAction<number>>;
  setActiveStreakMilestone: Dispatch<SetStateAction<StreakMilestone | null>>;
  solvedIncidents: Record<string, boolean>;
  setSolvedIncidents: Dispatch<SetStateAction<Record<string, boolean>>>;
  claimedChapters: Record<string, boolean>;
  setClaimedChapters: Dispatch<SetStateAction<Record<string, boolean>>>;
  session: Session | null;
  latestGuestStateRef: MutableRefObject<CloudProgressState>;
  onOpenChapterCertificate: (
    trackKey: string,
    chapter: ChapterTierMeta,
    overrideXp?: number,
    overrideStreak?: number,
  ) => void;
}

/**
 * Encapsulates streak progression, XP awards for Bug Hunt & Syntax Blitz,
 * and chapter bonus claims with immediate cloud delta syncing.
 */
export function useArenaRewards({
  xpPoints,
  setXpPoints,
  streakCount,
  setStreakCount,
  lastActiveDate,
  setLastActiveDate,
  claimedStreakMilestones,
  setClaimedStreakMilestones,
  streakShields,
  setStreakShields,
  setActiveStreakMilestone,
  solvedIncidents,
  setSolvedIncidents,
  claimedChapters,
  setClaimedChapters,
  session,
  latestGuestStateRef,
  onOpenChapterCertificate,
}: UseArenaRewardsOptions) {
  function recordActiveDevSession(bonusXp = 0): {
    newXp: number;
    newStreak: number;
    newLastActiveDate: string;
  } {
    const streakUpdate = computeStreakUpdate({
      currentStreak: streakCount,
      lastActiveDate,
      claimedMilestones: claimedStreakMilestones,
      streakShields,
    });

    const milestoneXp = streakUpdate.unlockedMilestone
      ? streakUpdate.unlockedMilestone.bonusXp
      : 0;
    const newXp = xpPoints + bonusXp + milestoneXp;
    const newStreak = streakUpdate.newStreak;
    const newLastActiveDate = streakUpdate.newLastActiveDate;

    setStreakCount(newStreak);
    setLastActiveDate(newLastActiveDate);
    setStreakShields(streakUpdate.remainingShields);
    if (bonusXp > 0 || milestoneXp > 0) {
      setXpPoints(newXp);
    }

    if (streakUpdate.unlockedMilestone) {
      const milestoneDays = streakUpdate.unlockedMilestone.days;
      setClaimedStreakMilestones((prev) => ({
        ...prev,
        [milestoneDays]: true,
      }));
      setActiveStreakMilestone(streakUpdate.unlockedMilestone);
      trackFunnelMilestone("share_triggered", {
        channel: `streak_milestone_${milestoneDays}`,
      });
    }

    return { newXp, newStreak, newLastActiveDate };
  }

  async function handleAwardBugHuntXp(xpEarned: number, incidentId: string) {
    recordDailyQuestStep("bughunt");
    const alreadySolved = solvedIncidents[incidentId];
    const nextSolvedIncidents = { ...solvedIncidents, [incidentId]: true };
    setSolvedIncidents(nextSolvedIncidents);
    if (alreadySolved) return;

    const { newXp, newStreak, newLastActiveDate } =
      recordActiveDevSession(xpEarned);
    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      solvedIncidents: nextSolvedIncidents,
      xpPoints: newXp,
      streakCount: newStreak,
      lastActiveDate: newLastActiveDate,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
        deltaItems: [
          {
            itemKey: incidentId,
            itemType: "bug_incident",
            completed: true,
          },
        ],
      });
    }
  }

  async function handleAwardBlitzXp(xpEarned: number) {
    if (xpEarned <= 0) return;
    recordDailyQuestStep("blitz");
    const { newXp, newStreak, newLastActiveDate } =
      recordActiveDevSession(xpEarned);
    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      xpPoints: newXp,
      streakCount: newStreak,
      lastActiveDate: newLastActiveDate,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
      });
    }
  }

  async function handleAwardFlashcardXp(xpEarned: number) {
    if (xpEarned <= 0) return;
    const { newXp, newStreak, newLastActiveDate } =
      recordActiveDevSession(xpEarned);
    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      xpPoints: newXp,
      streakCount: newStreak,
      lastActiveDate: newLastActiveDate,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
      });
    }
  }

  async function handleAwardFocusXp(xpEarned: number) {
    if (xpEarned <= 0) return;
    const { newXp, newStreak, newLastActiveDate } =
      recordActiveDevSession(xpEarned);
    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      xpPoints: newXp,
      streakCount: newStreak,
      lastActiveDate: newLastActiveDate,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
      });
    }
  }

  async function handleClaimChapterBonus(chapterKey: string, bonusXp: number) {
    if (claimedChapters[chapterKey]) return;
    playVictoryFanfare();
    const newXp = xpPoints + bonusXp;
    const newStreak = streakCount === 0 ? 1 : streakCount;
    const nextClaimedChapters = { ...claimedChapters, [chapterKey]: true };
    setClaimedChapters(nextClaimedChapters);
    setXpPoints(newXp);
    setStreakCount(newStreak);

    const [trackKey, chIdRaw] = chapterKey.split("_ch_");
    const chapterMeta = (TRACK_CHAPTERS[trackKey] || []).find(
      (c) => String(c.id) === chIdRaw,
    );
    if (chapterMeta) {
      onOpenChapterCertificate(trackKey, chapterMeta, newXp, newStreak);
    }

    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      claimedChapters: nextClaimedChapters,
      xpPoints: newXp,
      streakCount: newStreak,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
        deltaItems: [
          {
            itemKey: chapterKey,
            itemType: "chapter",
            completed: true,
          },
        ],
      });
    }
  }

  async function handleClaimDailyQuestBonus() {
    const awardedXp = claimDailyQuestBonus();
    if (awardedXp <= 0) return;
    playVictoryFanfare();
    const { newXp, newStreak, newLastActiveDate } =
      recordActiveDevSession(awardedXp);
    const nextSnapshot: CloudProgressState = {
      ...latestGuestStateRef.current,
      xpPoints: newXp,
      streakCount: newStreak,
      lastActiveDate: newLastActiveDate,
      updatedAt: new Date().toISOString(),
    };
    latestGuestStateRef.current = nextSnapshot;

    if (session) {
      await pushCloudProgressState({
        userId: session.user.id,
        userEmail: session.user.email,
        state: nextSnapshot,
      });
    }
  }

  return {
    recordActiveDevSession,
    handleAwardBugHuntXp,
    handleAwardBlitzXp,
    handleAwardFlashcardXp,
    handleAwardFocusXp,
    handleClaimChapterBonus,
    handleClaimDailyQuestBonus,
  };
}
