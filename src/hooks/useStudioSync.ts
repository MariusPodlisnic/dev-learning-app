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
import { loadPyodideScript } from "../utils/pyodideRunner";
import {
  hydrateSoundPreference,
  STORAGE_SOUND_KEY,
} from "../utils/soundEffects";
import {
  CloudProgressState,
  pullAndMergeCloudState,
  pushCloudProgressState,
  remapProgressKeysForLessons,
} from "../utils/supabaseSync";

const IS_DEV_MODE = typeof __DEV__ !== "undefined" && __DEV__;

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
  pyodideRef: { current: any };
  onPyodideReady: () => void;
}

export function useStudioSync({
  themeMode,
  setThemeMode,
  selectedLessonId,
  onInitialLessonResolved,
  onAuthSignedIn,
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

  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [devProOverride, setDevProOverride] = useState<boolean | null>(null);
  const effectiveIsPremium = IS_DEV_MODE ? (devProOverride ?? true) : isPremium;

  const codeDraftsRef = useRef<Record<string, string>>({});
  const lessonsRef = useRef<Lesson[]>([]);
  const cloudSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedRef = useRef<boolean>(false);
  const cloudSyncCompletedRef = useRef<boolean>(false);
  const latestGuestStateRef = useRef<CloudProgressState>({
    xpPoints: 0,
    streakCount: 0,
    completedLessons: {},
    completedChallenges: {},
    peekedSolutions: {},
    solvedIncidents: {},
    claimedChapters: {},
    claimedStreakMilestones: {},
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
    onPyodideReady,
  });
  useEffect(() => {
    callbacksRef.current = {
      setThemeMode,
      onInitialLessonResolved,
      onAuthSignedIn,
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
    syncCloudAndGuestAccount: (_userId: string, _userEmail?: string) => {},
  });

  function applyCloudSnapshotToState(snapshot: CloudProgressState) {
    latestGuestStateRef.current = snapshot;
    setCompletedLessons(snapshot.completedLessons);
    setCompletedChallenges(snapshot.completedChallenges);
    setPeekedSolutions(snapshot.peekedSolutions);
    setSolvedIncidents(snapshot.solvedIncidents);
    setClaimedChapters(snapshot.claimedChapters);
    setClaimedStreakMilestones(snapshot.claimedStreakMilestones);
    setStreakShields(snapshot.streakShields);
    setDailyCompletedDate(snapshot.dailyCompletedDate);
    setLastActiveDate(snapshot.lastActiveDate);
    setXpPoints(snapshot.xpPoints);
    setStreakCount(snapshot.streakCount);

    codeDraftsRef.current = snapshot.codeDrafts || {};
    writeLocalJson(STORAGE_DRAFTS_KEY, codeDraftsRef.current);

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
    cloudSyncTimerRef.current = setTimeout(() => {
      void pushCloudProgressState({
        userId: uid,
        userEmail: email,
        state: snapshot,
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
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("lesson_order", { ascending: true });

      const all = error
        ? mergeCurriculumLessons<Lesson>([])
        : mergeCurriculumLessons<Lesson>((data as Lesson[]) || []);
      if (error) {
        console.error("Error fetching lessons:", error);
      }

      lessonsRef.current = all;
      setLessons(all);

      const remappedSnapshot = remapProgressKeysForLessons(
        all,
        latestGuestStateRef.current,
      );
      if (remappedSnapshot !== latestGuestStateRef.current) {
        applyCloudSnapshotToState(remappedSnapshot);
      }

      if (!error) {
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
      }
    } finally {
      setLoading(false);
    }
  }

  async function syncCloudAndGuestAccount(userId: string, userEmail?: string) {
    try {
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
      updatedAt: new Date().toISOString(),
    };
  }, [
    completedLessons,
    completedChallenges,
    peekedSolutions,
    solvedIncidents,
    claimedChapters,
    claimedStreakMilestones,
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
        ? (savedState.devProOverride ?? true)
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
      (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession) {
          callbacksRef.current.onAuthSignedIn?.();
          syncHelpersRef.current.syncCloudAndGuestAccount(
            nextSession.user.id,
            nextSession.user.email,
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
