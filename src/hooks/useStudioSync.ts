import { Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { mergeCurriculumLessons } from "../constants/curriculum";
import { ThemeMode, TrackThemes } from "../constants/theme";
import {
  hydrateStorageKeys,
  isLessonLockedForUser,
  Lesson,
  readLocalJson,
  STORAGE_ATTRIBUTION_KEY,
  STORAGE_CLOUD_NUDGE_DISMISSED_KEY,
  STORAGE_DRAFTS_KEY,
  STORAGE_QUICKSTART_DISMISSED_KEY,
  STORAGE_STATE_KEY,
  writeLocalJson,
} from "../types/lesson";
import {
  getActivityHeatmapMap,
  replaceActivityHeatmapFromCloud,
  STORAGE_ACTIVITY_HEATMAP_KEY,
  subscribeActivityHeatmap,
} from "../utils/activityHeatmap";
import {
  getArcadeRecordsState,
  replaceArcadeRecordsFromCloud,
  STORAGE_ARCADE_RECORDS_KEY,
  subscribeArcadeRecords,
} from "../utils/arcadeRecords";
import {
  readCompletedMiniBuilds,
  STORAGE_MINIBUILDS_DONE_KEY,
} from "../utils/miniBuilds";
import { loadPyodideScript } from "../utils/pyodideRunner";
import {
  readSavedSnippets,
  replaceScratchpadSnippetsFromCloud,
  STORAGE_SCRATCHPAD_DRAFT_KEY,
  STORAGE_SCRATCHPAD_SNIPPETS_KEY,
  subscribeScratchpadSnippets,
} from "../utils/scratchpadSnippets";
import {
  hydrateSoundPreference,
  STORAGE_SOUND_KEY,
} from "../utils/soundEffects";
import type { ReviewScheduleEntry } from "../utils/spacedRepetition";
import {
  CloudProgressState,
  pullAndMergeCloudState,
  pushCloudProgressState,
  remapProgressKeysForLessons,
} from "../utils/supabaseSync";

const IS_DEV_MODE = typeof __DEV__ !== "undefined" && __DEV__;

interface CloudSyncSummary {
  mergedXp: number;
  mergedSolvedCount: number;
  hadGuestProgress: boolean;
}

interface UseStudioSyncOptions {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  selectedLessonId?: string;
  onInitialLessonResolved: (
    lesson: Lesson,
    initialCode: string,
    hasSavedDraft: boolean,
  ) => void;
  onAuthSignedIn?: () => void;
  onPasswordRecovery?: () => void;
  onCloudSyncComplete?: (summary: CloudSyncSummary) => void;
  pyodideRef: { current: any };
  onPyodideReady: () => void;
}

export function useStudioSync({
  themeMode,
  setThemeMode,
  selectedLessonId,
  onInitialLessonResolved,
  onAuthSignedIn,
  onPasswordRecovery,
  onCloudSyncComplete,
  pyodideRef,
  onPyodideReady,
}: UseStudioSyncOptions) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTrack, setActiveTrack] = useState<string>("python_basics");
  const [loading, setLoading] = useState<boolean>(true);

  const [completedLessons, setCompletedLessons] = useState<
    Record<string, boolean>
  >({});
  const [completedChallenges, setCompletedChallenges] = useState<
    Record<string, boolean>
  >({});
  const [peekedSolutions, setPeekedSolutions] = useState<
    Record<string, boolean>
  >({});
  const [solvedIncidents, setSolvedIncidents] = useState<
    Record<string, boolean>
  >({});
  const [xpPoints, setXpPoints] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [dailyCompletedDate, setDailyCompletedDate] = useState<string | null>(
    null,
  );
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const [claimedStreakMilestones, setClaimedStreakMilestones] = useState<
    Record<number, boolean>
  >({});
  const [streakShields, setStreakShields] = useState<number>(1);
  const [claimedChapters, setClaimedChapters] = useState<
    Record<string, boolean>
  >({});
  const [reviewSchedule, setReviewSchedule] = useState<
    Record<string, ReviewScheduleEntry>
  >({});

  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [devProOverride, setDevProOverride] = useState<boolean | null>(null);
  const effectiveIsPremium = IS_DEV_MODE
    ? (devProOverride ?? isPremium)
    : isPremium;

  const codeDraftsRef = useRef<Record<string, string>>({});
  const lessonsRef = useRef<Lesson[]>([]);
  const cloudSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedRef = useRef<boolean>(false);
  const cloudSyncCompletedRef = useRef<boolean>(false);
  const suppressCozyPushRef = useRef<boolean>(false);

  function readLocalCozyState() {
    return {
      activityHeatmap: getActivityHeatmapMap(),
      scratchpadSnippets: readSavedSnippets(),
      arcadeRecords: getArcadeRecordsState(),
      completedMiniBuilds: readCompletedMiniBuilds(),
    };
  }
  const latestGuestStateRef = useRef<CloudProgressState>({
    xpPoints: 0,
    streakCount: 0,
    completedLessons: {},
    completedChallenges: {},
    peekedSolutions: {},
    solvedIncidents: {},
    claimedChapters: {},
    claimedStreakMilestones: {},
    reviewSchedule: {},
    streakShields: 1,
    dailyCompletedDate: null,
    lastActiveDate: null,
    activeTrack: "python_basics",
    themeMode: "dark",
    codeDrafts: {},
    draftsVersion: 2,
    updatedAt: "",
  });

  const callbacksRef = useRef({
    setThemeMode,
    onInitialLessonResolved,
    onAuthSignedIn,
    onPasswordRecovery,
    onCloudSyncComplete,
    onPyodideReady,
  });
  useEffect(() => {
    callbacksRef.current = {
      setThemeMode,
      onInitialLessonResolved,
      onAuthSignedIn,
      onPasswordRecovery,
      onCloudSyncComplete,
      onPyodideReady,
    };
  });

  const syncHelpersRef = useRef({
    applyCloudSnapshotToState: (_snapshot: CloudProgressState) => {},
    fetchLessons: (
      _preferredTrack?: string,
      _preferredLessonId?: string,
      _initialPremiumFlag?: boolean,
    ) => {},
    syncCloudAndGuestAccount: (
      _userId: string,
      _userEmail?: string,
      _notifyCompletion?: boolean,
    ) => {},
  });

  function applyCloudSnapshotToState(snapshot: CloudProgressState) {
    latestGuestStateRef.current = snapshot;
    setCompletedLessons(snapshot.completedLessons);
    setCompletedChallenges(snapshot.completedChallenges);
    setPeekedSolutions(snapshot.peekedSolutions);
    setSolvedIncidents(snapshot.solvedIncidents);
    setClaimedChapters(snapshot.claimedChapters);
    setClaimedStreakMilestones(snapshot.claimedStreakMilestones);
    setReviewSchedule(snapshot.reviewSchedule || {});
    setStreakShields(snapshot.streakShields);
    setDailyCompletedDate(snapshot.dailyCompletedDate);
    setLastActiveDate(snapshot.lastActiveDate);
    setXpPoints(snapshot.xpPoints);
    setStreakCount(snapshot.streakCount);

    codeDraftsRef.current = snapshot.codeDrafts || {};
    writeLocalJson(STORAGE_DRAFTS_KEY, codeDraftsRef.current);

    suppressCozyPushRef.current = true;
    try {
      if (snapshot.activityHeatmap) {
        replaceActivityHeatmapFromCloud(snapshot.activityHeatmap);
      }
      if (snapshot.scratchpadSnippets) {
        replaceScratchpadSnippetsFromCloud(snapshot.scratchpadSnippets);
      }
      if (snapshot.arcadeRecords) {
        replaceArcadeRecordsFromCloud(snapshot.arcadeRecords);
      }
      if (snapshot.completedMiniBuilds) {
        writeLocalJson(STORAGE_MINIBUILDS_DONE_KEY, {
          ...readCompletedMiniBuilds(),
          ...snapshot.completedMiniBuilds,
        });
      }
    } finally {
      suppressCozyPushRef.current = false;
    }

    if (snapshot.activeTrack && TrackThemes[snapshot.activeTrack]) {
      setActiveTrack(snapshot.activeTrack);
    }
    if (snapshot.themeMode === "light" || snapshot.themeMode === "dark") {
      callbacksRef.current.setThemeMode(snapshot.themeMode);
    }
  }

  function scheduleBackgroundCloudSync(snapshot: CloudProgressState) {
    if (!session?.user?.id) return;
    if (cloudSyncTimerRef.current) {
      clearTimeout(cloudSyncTimerRef.current);
    }
    const uid = session.user.id;
    const email = session.user.email;
    const enrichedSnapshot: CloudProgressState = {
      ...snapshot,
      ...readLocalCozyState(),
    };
    latestGuestStateRef.current = enrichedSnapshot;
    cloudSyncTimerRef.current = setTimeout(() => {
      void pushCloudProgressState({
        userId: uid,
        userEmail: email,
        state: enrichedSnapshot,
      });
    }, 1200);
  }

  async function fetchLessons(
    preferredTrack?: string,
    preferredLessonId?: string,
    initialPremiumFlag?: boolean,
  ) {
    const canUnlockAll = initialPremiumFlag ?? effectiveIsPremium;
    try {
      let remoteLessons: Lesson[] = [];
      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("*")
          .order("lesson_order", { ascending: true });
        if (error) {
          console.warn("Falling back to local curriculum lessons:", error.message);
        } else if (Array.isArray(data)) {
          remoteLessons = data as Lesson[];
        }
      } catch (err) {
        console.warn("Offline lesson fetch fallback activated:", err);
      }

      const all = mergeCurriculumLessons<Lesson>(remoteLessons);

      lessonsRef.current = all;
      setLessons(all);

      const remappedSnapshot = remapProgressKeysForLessons(
        all,
        latestGuestStateRef.current,
      );
      if (remappedSnapshot !== latestGuestStateRef.current) {
        applyCloudSnapshotToState(remappedSnapshot);
      }

      const targetTrack =
        preferredTrack && TrackThemes[preferredTrack]
          ? preferredTrack
          : "python_basics";
      const resolvedPreferredId =
        remappedSnapshot.lastLessonId || preferredLessonId;
      const candidateById = resolvedPreferredId
        ? all.find((l) => l.id === resolvedPreferredId)
        : undefined;
      const allowedCandidate =
        candidateById && !isLessonLockedForUser(candidateById, canUnlockAll)
          ? candidateById
          : undefined;
      const initialLesson =
        allowedCandidate ||
        all.find(
          (l) =>
            l.track === targetTrack &&
            !isLessonLockedForUser(l, canUnlockAll),
        ) ||
        all.find((l) => l.track === "python_basics" && l.is_free) ||
        all.find((l) => l.track === "python_basics");
      if (initialLesson) {
        const defaultCode = (initialLesson.initial_code || "").replace(
          /\\n/g,
          "\n",
        );
        const draft = codeDraftsRef.current[initialLesson.id];
        callbacksRef.current.onInitialLessonResolved(
          initialLesson,
          draft !== undefined ? draft : defaultCode,
          draft !== undefined && draft !== defaultCode,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function syncCloudAndGuestAccount(
    userId: string,
    userEmail?: string,
    notifyCompletion = false,
  ) {
    try {
      const preSyncLocalXp = latestGuestStateRef.current.xpPoints || 0;
      const preSyncSolvedCount = Object.values(
        latestGuestStateRef.current.completedLessons || {},
      ).filter(Boolean).length;
      const hadGuestProgress = preSyncLocalXp > 0 || preSyncSolvedCount > 0;

      const { isPremium: cloudIsPremium, mergedState } =
        await pullAndMergeCloudState({
          userId,
          userEmail,
          localState: latestGuestStateRef.current,
          lessons: lessonsRef.current,
        });

      setIsPremium(cloudIsPremium);
      applyCloudSnapshotToState(mergedState);
      cloudSyncCompletedRef.current = true;
      if (notifyCompletion) {
        const mergedSolvedCount = Object.values(
          mergedState.completedLessons || {},
        ).filter(Boolean).length;
        callbacksRef.current.onCloudSyncComplete?.({
          mergedXp: mergedState.xpPoints || 0,
          mergedSolvedCount,
          hadGuestProgress,
        });
      }
    } catch (err) {
      console.error("Failed to sync account state:", err);
    }
  }

  useEffect(() => {
    syncHelpersRef.current = {
      applyCloudSnapshotToState,
      fetchLessons,
      syncCloudAndGuestAccount,
    };
  });

  // Mirror React state to latestGuestStateRef for synchronous cloud merges
  useEffect(() => {
    if (!hydratedRef.current) return;
    latestGuestStateRef.current = {
      completedLessons,
      completedChallenges,
      peekedSolutions,
      solvedIncidents,
      claimedChapters,
      claimedStreakMilestones,
      reviewSchedule,
      streakShields,
      dailyCompletedDate,
      lastActiveDate,
      xpPoints,
      streakCount,
      activeTrack,
      lastLessonId: selectedLessonId,
      themeMode,
      codeDrafts: codeDraftsRef.current,
      draftsVersion: 2,
      ...readLocalCozyState(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    completedLessons,
    completedChallenges,
    peekedSolutions,
    solvedIncidents,
    claimedChapters,
    claimedStreakMilestones,
    reviewSchedule,
    streakShields,
    dailyCompletedDate,
    lastActiveDate,
    xpPoints,
    streakCount,
    activeTrack,
    selectedLessonId,
    themeMode,
  ]);

  // Persist local state on change once hydrated
  useEffect(() => {
    if (!hydratedRef.current) return;
    const updatedAt = new Date().toISOString();
    writeLocalJson(STORAGE_STATE_KEY, {
      completedLessons,
      completedChallenges,
      peekedSolutions,
      solvedIncidents,
      claimedChapters,
      xpPoints,
      streakCount,
      dailyCompletedDate,
      lastActiveDate,
      claimedStreakMilestones,
      reviewSchedule,
      streakShields,
      devProOverride,
      activeTrack,
      lastLessonId: selectedLessonId,
      themeMode,
      updatedAt,
    });
  }, [
    completedLessons,
    completedChallenges,
    peekedSolutions,
    solvedIncidents,
    claimedChapters,
    xpPoints,
    streakCount,
    dailyCompletedDate,
    lastActiveDate,
    claimedStreakMilestones,
    reviewSchedule,
    streakShields,
    devProOverride,
    activeTrack,
    selectedLessonId,
    themeMode,
  ]);

  // Initial storage hydration, curriculum fetch, auth listener & Python runtime boot
  useEffect(() => {
    let cancelled = false;
    const hydrateAndBoot = async () => {
      await hydrateStorageKeys([
        STORAGE_DRAFTS_KEY,
        STORAGE_STATE_KEY,
        STORAGE_QUICKSTART_DISMISSED_KEY,
        STORAGE_CLOUD_NUDGE_DISMISSED_KEY,
        STORAGE_ATTRIBUTION_KEY,
        STORAGE_SOUND_KEY,
        STORAGE_ACTIVITY_HEATMAP_KEY,
        STORAGE_SCRATCHPAD_DRAFT_KEY,
        STORAGE_SCRATCHPAD_SNIPPETS_KEY,
        STORAGE_ARCADE_RECORDS_KEY,
        STORAGE_MINIBUILDS_DONE_KEY,
      ]);
      await hydrateSoundPreference();
      if (cancelled) return;

      const savedDrafts = readLocalJson<Record<string, string>>(
        STORAGE_DRAFTS_KEY,
        {},
      );
      codeDraftsRef.current = savedDrafts;

      const savedState = readLocalJson<{
        completedLessons?: Record<string, boolean>;
        completedChallenges?: Record<string, boolean>;
        peekedSolutions?: Record<string, boolean>;
        solvedIncidents?: Record<string, boolean>;
        claimedChapters?: Record<string, boolean>;
        xpPoints?: number;
        streakCount?: number;
        dailyCompletedDate?: string | null;
        lastActiveDate?: string | null;
        claimedStreakMilestones?: Record<number, boolean>;
        reviewSchedule?: Record<string, ReviewScheduleEntry>;
        streakShields?: number;
        devProOverride?: boolean | null;
        activeTrack?: string;
        lastLessonId?: string;
        themeMode?: ThemeMode;
      }>(STORAGE_STATE_KEY, {});

      if (savedState.completedLessons) {
        setCompletedLessons(savedState.completedLessons);
      }
      if (savedState.completedChallenges) {
        setCompletedChallenges(savedState.completedChallenges);
      }
      if (savedState.peekedSolutions) {
        setPeekedSolutions(savedState.peekedSolutions);
      }
      if (savedState.solvedIncidents) {
        setSolvedIncidents(savedState.solvedIncidents);
      }
      if (savedState.claimedChapters) {
        setClaimedChapters(savedState.claimedChapters);
      }
      if (typeof savedState.xpPoints === "number") {
        setXpPoints(savedState.xpPoints);
      }
      if (typeof savedState.streakCount === "number") {
        setStreakCount(savedState.streakCount);
      }
      if (savedState.dailyCompletedDate) {
        setDailyCompletedDate(savedState.dailyCompletedDate);
      }
      if (savedState.lastActiveDate) {
        setLastActiveDate(savedState.lastActiveDate);
      }
      if (savedState.claimedStreakMilestones) {
        setClaimedStreakMilestones(savedState.claimedStreakMilestones);
      }
      if (savedState.reviewSchedule) {
        setReviewSchedule(savedState.reviewSchedule);
      }
      if (typeof savedState.streakShields === "number") {
        setStreakShields(savedState.streakShields);
      }
      if (
        typeof savedState.devProOverride === "boolean" ||
        savedState.devProOverride === null
      ) {
        setDevProOverride(savedState.devProOverride);
      }
      const initialDevPremium = IS_DEV_MODE
        ? (savedState.devProOverride ?? false)
        : false;
      const initialTheme: ThemeMode =
        savedState.themeMode === "light" ? "light" : "dark";
      callbacksRef.current.setThemeMode(initialTheme);

      const safeInitialTrack =
        savedState.activeTrack && TrackThemes[savedState.activeTrack]
          ? savedState.activeTrack
          : "python_basics";
      setActiveTrack(safeInitialTrack);
      latestGuestStateRef.current = {
        completedLessons: savedState.completedLessons || {},
        completedChallenges: savedState.completedChallenges || {},
        peekedSolutions: savedState.peekedSolutions || {},
        solvedIncidents: savedState.solvedIncidents || {},
        claimedChapters: savedState.claimedChapters || {},
        claimedStreakMilestones: savedState.claimedStreakMilestones || {},
        reviewSchedule: savedState.reviewSchedule || {},
        streakShields:
          typeof savedState.streakShields === "number"
            ? savedState.streakShields
            : 1,
        dailyCompletedDate: savedState.dailyCompletedDate || null,
        lastActiveDate: savedState.lastActiveDate || null,
        xpPoints:
          typeof savedState.xpPoints === "number" ? savedState.xpPoints : 0,
        streakCount:
          typeof savedState.streakCount === "number" ? savedState.streakCount : 0,
        activeTrack: safeInitialTrack,
        lastLessonId: savedState.lastLessonId as string | undefined,
        themeMode: initialTheme,
        codeDrafts: savedDrafts,
        draftsVersion: 2,
        ...readLocalCozyState(),
        updatedAt: (savedState as any).updatedAt || "",
      };
      hydratedRef.current = true;

      syncHelpersRef.current.fetchLessons(
        safeInitialTrack,
        savedState.lastLessonId as string | undefined,
        initialDevPremium,
      );
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        setSession(session);
        if (session) {
          syncHelpersRef.current.syncCloudAndGuestAccount(
            session.user.id,
            session.user.email,
          );
        }
      });
    };
    const mountTimer = setTimeout(() => {
      void hydrateAndBoot();
    }, 0);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        setSession(nextSession);
        if (event === "PASSWORD_RECOVERY") {
          callbacksRef.current.onPasswordRecovery?.();
          return;
        }
        if (nextSession) {
          callbacksRef.current.onAuthSignedIn?.();
          syncHelpersRef.current.syncCloudAndGuestAccount(
            nextSession.user.id,
            nextSession.user.email,
            event === "SIGNED_IN",
          );
        } else {
          cloudSyncCompletedRef.current = false;
          setIsPremium(false);
          setActiveTrack("python_basics");
        }
      },
    );

    const unsubscribePyodide = loadPyodideScript(pyodideRef, () =>
      callbacksRef.current.onPyodideReady(),
    );
    return () => {
      cancelled = true;
      clearTimeout(mountTimer);
      unsubscribePyodide();
      authListener.subscription.unsubscribe();
    };
  }, [pyodideRef]);

  // Auto-sync cozy state (Pixel Garden, Playground snippets & Arcade records)
  const cozySyncRef = useRef(scheduleBackgroundCloudSync);
  useEffect(() => {
    cozySyncRef.current = scheduleBackgroundCloudSync;
  });

  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;
    const triggerCozyPush = () => {
      if (!hydratedRef.current || suppressCozyPushRef.current) return;
      cozySyncRef.current({
        ...latestGuestStateRef.current,
        updatedAt: new Date().toISOString(),
      });
    };
    const unsubHeatmap = subscribeActivityHeatmap(triggerCozyPush);
    const unsubSnippets = subscribeScratchpadSnippets(triggerCozyPush);
    const unsubRecords = subscribeArcadeRecords(triggerCozyPush);
    return () => {
      unsubHeatmap();
      unsubSnippets();
      unsubRecords();
    };
  }, [session?.user?.id]);

  return {
    lessons,
    lessonsRef,
    activeTrack,
    setActiveTrack,
    loading,
    completedLessons,
    setCompletedLessons,
    completedChallenges,
    setCompletedChallenges,
    peekedSolutions,
    setPeekedSolutions,
    solvedIncidents,
    setSolvedIncidents,
    xpPoints,
    setXpPoints,
    streakCount,
    setStreakCount,
    dailyCompletedDate,
    setDailyCompletedDate,
    lastActiveDate,
    setLastActiveDate,
    claimedStreakMilestones,
    setClaimedStreakMilestones,
    streakShields,
    setStreakShields,
    claimedChapters,
    setClaimedChapters,
    reviewSchedule,
    setReviewSchedule,
    session,
    isPremium,
    setIsPremium,
    devProOverride,
    setDevProOverride,
    effectiveIsPremium,
    codeDraftsRef,
    cloudSyncCompletedRef,
    latestGuestStateRef,
    applyCloudSnapshotToState,
    scheduleBackgroundCloudSync,
    fetchLessons,
    syncCloudAndGuestAccount,
  };
}
