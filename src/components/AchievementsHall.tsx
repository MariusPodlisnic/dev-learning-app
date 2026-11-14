import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { StudioIcon, StudioIconName, Text } from "./StudioIcon";
import {
  HardShadow,
  HardShadowSm,
  MonoFont,
  StudioColors,
} from "../constants/theme";
import {
  getLessonStarRating,
  Lesson,
  ViewMode,
} from "../types/lesson";
import { playKeyClick } from "../utils/soundEffects";

interface AchievementsHallProps {
  xpPoints: number;
  streakCount: number;
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  completedChallenges?: Record<string, boolean>;
  peekedSolutions?: Record<string, boolean>;
  solvedIncidents: Record<string, boolean>;
  onNavigateMode: (mode: ViewMode) => void;
}

type AchievementDifficulty = "easy" | "medium" | "hard";

interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  howToObtain: string;
  rewardLabel: string;
  icon: StudioIconName;
  crestBg: string;
  crestSecondary: string;
  difficulty: AchievementDifficulty;
  current: number;
  target: number;
  unit: string;
  actionMode: ViewMode;
  actionLabel: string;
}

type FilterTab = "all" | "hard" | "easy_med" | "unlocked" | "in_progress";

export default function AchievementsHall({
  xpPoints,
  streakCount,
  lessons,
  completedLessons,
  completedChallenges = {},
  peekedSolutions = {},
  solvedIncidents,
  onNavigateMode,
}: AchievementsHallProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const totalSolvedCount = useMemo(
    () => lessons.filter((l) => completedLessons[l.id]).length,
    [lessons, completedLessons],
  );

  const threeStarSolvedCount = useMemo(
    () =>
      lessons.filter(
        (l) =>
          getLessonStarRating(
            l,
            completedLessons,
            completedChallenges,
            peekedSolutions,
          ) === 3,
      ).length,
    [lessons, completedLessons, completedChallenges, peekedSolutions],
  );

  const pyLessons = useMemo(
    () => lessons.filter((l) => l.track === "python_basics"),
    [lessons],
  );
  const pySolvedCount = useMemo(
    () => pyLessons.filter((l) => completedLessons[l.id]).length,
    [pyLessons, completedLessons],
  );

  const algoLessons = useMemo(
    () => lessons.filter((l) => l.track === "algorithms"),
    [lessons],
  );
  const algoSolvedCount = useMemo(
    () => algoLessons.filter((l) => completedLessons[l.id]).length,
    [algoLessons, completedLessons],
  );

  const sysLessons = useMemo(
    () => lessons.filter((l) => l.track === "system_design"),
    [lessons],
  );
  const sysSolvedCount = useMemo(
    () => sysLessons.filter((l) => completedLessons[l.id]).length,
    [sysLessons, completedLessons],
  );

  const bugsSolvedCount = useMemo(
    () => Object.values(solvedIncidents || {}).filter(Boolean).length,
    [solvedIncidents],
  );

  const recapLessons = useMemo(
    () => lessons.filter((l) => Boolean(l.is_recap)),
    [lessons],
  );
  const recapSolvedCount = useMemo(
    () => recapLessons.filter((l) => completedLessons[l.id]).length,
    [recapLessons, completedLessons],
  );
  const pyRecapSolvedCount = useMemo(
    () =>
      pyLessons.filter((l) => Boolean(l.is_recap) && completedLessons[l.id])
        .length,
    [pyLessons, completedLessons],
  );
  const algoRecapSolvedCount = useMemo(
    () =>
      algoLessons.filter((l) => Boolean(l.is_recap) && completedLessons[l.id])
        .length,
    [algoLessons, completedLessons],
  );
  const sysRecapSolvedCount = useMemo(
    () =>
      sysLessons.filter((l) => Boolean(l.is_recap) && completedLessons[l.id])
        .length,
    [sysLessons, completedLessons],
  );

  const achievements: AchievementItem[] = useMemo(() => {
    const pyTotal = Math.max(30, pyLessons.length);
    const algoTotal = Math.max(26, algoLessons.length);
    const sysTotal = Math.max(26, sysLessons.length);
    const allTotal = Math.max(82, lessons.length);
    const pyRecapTotal = Math.max(
      6,
      pyLessons.filter((l) => Boolean(l.is_recap)).length,
    );
    const algoRecapTotal = Math.max(
      6,
      algoLessons.filter((l) => Boolean(l.is_recap)).length,
    );
    const sysRecapTotal = Math.max(
      6,
      sysLessons.filter((l) => Boolean(l.is_recap)).length,
    );
    const allRecapTotal = Math.max(18, recapLessons.length);

    return [
      // 1. EASY
      {
        id: "first_execution",
        title: "Hello, World! Execution",
        subtitle: "FIRST MODULE CLEARED",
        howToObtain:
          "Open any coding module on the Skill Map, write valid Python code in the Studio, and pass all verification tests.",
        rewardLabel: "+50 XP BADGE",
        icon: "rocket",
        crestBg: StudioColors.mint,
        crestSecondary: "#38BDF8",
        difficulty: "easy",
        current: Math.min(1, totalSolvedCount),
        target: 1,
        unit: "MODULE SOLVED",
        actionMode: "roadmap",
        actionLabel: "GO TO SKILL MAP →",
      },
      // 2. EASY
      {
        id: "daily_spark",
        title: "Daily Ignition Spark",
        subtitle: "STREAK STARTER",
        howToObtain:
          "Start your daily coding habit by solving 1 lesson or completing the 60-second Daily Warm-Up.",
        rewardLabel: "STREAK SHIELD",
        icon: "flame",
        crestBg: StudioColors.yellow,
        crestSecondary: StudioColors.coral,
        difficulty: "easy",
        current: Math.min(1, streakCount),
        target: 1,
        unit: "DAY STREAK",
        actionMode: "roadmap",
        actionLabel: "KEEP STREAK ALIVE →",
      },
      // 3. EASY
      {
        id: "first_bug_patch",
        title: "First Incident Patched",
        subtitle: "JUNIOR DEBUGGER",
        howToObtain:
          "Enter the Bug Hunt Arena, inspect a broken production snippet, and deploy your first passing fix.",
        rewardLabel: "+35 XP PATCH",
        icon: "bug",
        crestBg: StudioColors.coral,
        crestSecondary: StudioColors.yellow,
        difficulty: "easy",
        current: Math.min(1, bugsSolvedCount),
        target: 1,
        unit: "BUG PATCHED",
        actionMode: "bughunt",
        actionLabel: "HUNT BUGS →",
      },
      // 4. HARD (HIGHLIGHTED!)
      {
        id: "bug_centurion_100",
        title: "The 100-Bug Centurion",
        subtitle: "ELITE PRODUCTION EXTERMINATOR",
        howToObtain:
          "Track down, diagnose, and patch 100 broken code incidents across the Bug Hunt Arena.",
        rewardLabel: "★ LEGENDARY CENTURION CREST",
        icon: "shield",
        crestBg: StudioColors.yellow,
        crestSecondary: StudioColors.coral,
        difficulty: "hard",
        current: Math.min(100, bugsSolvedCount),
        target: 100,
        unit: "BUGS PATCHED",
        actionMode: "bughunt",
        actionLabel: "ENTER BUG HUNT →",
      },
      // 5. EASY
      {
        id: "python_chapter_1",
        title: "Pythonic Foundations I",
        subtitle: "CHAPTER I GRADUATE",
        howToObtain:
          "Complete the first 4 modules in the Python Foundations track covering variables, types, and control flow.",
        rewardLabel: "+100 XP BONUS",
        icon: "python",
        crestBg: "#38BDF8",
        crestSecondary: StudioColors.yellow,
        difficulty: "easy",
        current: Math.min(4, pySolvedCount),
        target: 4,
        unit: "PYTHON MODULES",
        actionMode: "roadmap",
        actionLabel: "CONTINUE PYTHON →",
      },
      // 6.EASY
      {
        id: "xp_250_starter",
        title: "250 XP Terminal Runner",
        subtitle: "EARLY MOMENTUM",
        howToObtain:
          "Earn 250 total XP by completing lessons, claiming chapter bonuses, or running Speed Blitz sprints.",
        rewardLabel: "RANK UP BOOST",
        icon: "bolt",
        crestBg: StudioColors.lime,
        crestSecondary: StudioColors.mint,
        difficulty: "easy",
        current: Math.min(250, xpPoints),
        target: 250,
        unit: "TOTAL XP",
        actionMode: "blitz",
        actionLabel: "PLAY SPEED BLITZ →",
      },
      // 7. MEDIUM
      {
        id: "streak_7_days",
        title: "7-Day Lo-Fi Flow State",
        subtitle: "FULL WEEK CONSISTENCY",
        howToObtain:
          "Maintain an unbroken 7-day coding streak by solving at least one challenge every single day for a week.",
        rewardLabel: "COZY BREW BADGE",
        icon: "coffee",
        crestBg: StudioColors.pink,
        crestSecondary: StudioColors.violet,
        difficulty: "medium",
        current: Math.min(7, streakCount),
        target: 7,
        unit: "CONSECUTIVE DAYS",
        actionMode: "roadmap",
        actionLabel: "EXTEND STREAK →",
      },
      // 8. MEDIUM
      {
        id: "bug_squad_25",
        title: "25-Bug Triage Specialist",
        subtitle: "INCIDENT COMMANDER",
        howToObtain:
          "Resolve 25 production bugs in the Bug Hunt Arena without breaking existing unit test harnesses.",
        rewardLabel: "DEBUGGER SEAL",
        icon: "toolbox",
        crestBg: StudioColors.coral,
        crestSecondary: "#38BDF8",
        difficulty: "medium",
        current: Math.min(25, bugsSolvedCount),
        target: 25,
        unit: "BUGS PATCHED",
        actionMode: "bughunt",
        actionLabel: "OPEN BUG HUNT →",
      },
      // 9. HARD (HIGHLIGHTED!)
      {
        id: "python_track_master",
        title: "Python Core Architect",
        subtitle: "FULL PYTHON TRACK MASTERY",
        howToObtain:
          "Solve all 24 modules in the Python Foundations track from basic variables to functions and data structures.",
        rewardLabel: "★ PYTHON CERTIFICATE & SEAL",
        icon: "grad",
        crestBg: StudioColors.yellow,
        crestSecondary: "#38BDF8",
        difficulty: "hard",
        current: Math.min(pyTotal, pySolvedCount),
        target: pyTotal,
        unit: "PYTHON MODULES",
        actionMode: "roadmap",
        actionLabel: "MASTER PYTHON →",
      },
      // 10. MEDIUM
      {
        id: "algo_explorer_10",
        title: "Big-O Pattern Seeker",
        subtitle: "ALGORITHMS HALFWAY MARK",
        howToObtain:
          "Solve 10 modules in the Algorithms track (Two Pointers, Sliding Window, Binary Search, and Recursion).",
        rewardLabel: "ALGO INSIGHT",
        icon: "brain",
        crestBg: StudioColors.violet,
        crestSecondary: StudioColors.pink,
        difficulty: "medium",
        current: Math.min(10, algoSolvedCount),
        target: 10,
        unit: "ALGO MODULES",
        actionMode: "roadmap",
        actionLabel: "STUDY ALGORITHMS →",
      },
      // 11. HARD (HIGHLIGHTED!)
      {
        id: "algo_overlord_all",
        title: "O(1) Algorithm Overlord",
        subtitle: "ELITE ALGORITHMIC MASTERY",
        howToObtain:
          "Conquer all 20 modules in the Algorithms track and master optimal time & space complexity.",
        rewardLabel: "★ GRAND ALGO SWORDS",
        icon: "swords",
        crestBg: StudioColors.violet,
        crestSecondary: StudioColors.yellow,
        difficulty: "hard",
        current: Math.min(algoTotal, algoSolvedCount),
        target: algoTotal,
        unit: "ALGO MODULES",
        actionMode: "algolab",
        actionLabel: "OPEN ALGO LAB →",
      },
      // 12. MEDIUM
      {
        id: "sys_builder_10",
        title: "Distributed Node Architect",
        subtitle: "SYSTEM DESIGN BUILDER",
        howToObtain:
          "Complete 10 modules in the System Design track covering caches, load balancers, rate limiters, and queues.",
        rewardLabel: "BLUEPRINT STAMP",
        icon: "arch",
        crestBg: StudioColors.mint,
        crestSecondary: "#38BDF8",
        difficulty: "medium",
        current: Math.min(10, sysSolvedCount),
        target: 10,
        unit: "SYSTEM MODULES",
        actionMode: "roadmap",
        actionLabel: "DESIGN SYSTEMS →",
      },
      // 13. HARD (HIGHLIGHTED!)
      {
        id: "sys_design_titan",
        title: "Hyperscale Principal Engineer",
        subtitle: "FULL SYSTEM DESIGN MASTERY",
        howToObtain:
          "Complete all 20 System Design modules and prove you can architect fault-tolerant distributed systems.",
        rewardLabel: "★ PRINCIPAL ARCHITECT CROWN",
        icon: "trophy",
        crestBg: StudioColors.mint,
        crestSecondary: StudioColors.yellow,
        difficulty: "hard",
        current: Math.min(sysTotal, sysSolvedCount),
        target: sysTotal,
        unit: "SYSTEM MODULES",
        actionMode: "roadmap",
        actionLabel: "OPEN SYSTEM TRACK →",
      },
      // 14. MEDIUM
      {
        id: "xp_1500_veteran",
        title: "1,500 XP Keyboard Tactician",
        subtitle: "HIGH-VELOCITY CODER",
        howToObtain:
          "Accumulate 1,500 total XP across all tracks, daily warm-ups, Bug Hunt incidents, and Speed Blitzes.",
        rewardLabel: "TACTICIAN MEDAL",
        icon: "medal",
        crestBg: "#38BDF8",
        crestSecondary: StudioColors.lime,
        difficulty: "medium",
        current: Math.min(1500, xpPoints),
        target: 1500,
        unit: "TOTAL XP",
        actionMode: "blitz",
        actionLabel: "EARN XP IN BLITZ →",
      },
      // 15. HARD (HIGHLIGHTED!)
      {
        id: "streak_30_immortal",
        title: "30-Day Unbreakable Habit",
        subtitle: "IRONCLAD ENGINEERING DISCIPLINE",
        howToObtain:
          "Maintain a 30-day continuous coding streak without a single reset.",
        rewardLabel: "★ IMMORTAL LAVA LAMP",
        icon: "lava",
        crestBg: StudioColors.pink,
        crestSecondary: StudioColors.yellow,
        difficulty: "hard",
        current: Math.min(30, streakCount),
        target: 30,
        unit: "DAY STREAK",
        actionMode: "roadmap",
        actionLabel: "KEEP CODING →",
      },
      // 16. HARD (HIGHLIGHTED!)
      {
        id: "full_curriculum_grandmaster",
        title: "Supreme DevLearn Grandmaster",
        subtitle: "100% ALL-TRACK COMPLETION + 10K XP",
        howToObtain:
          "Solve all 64 modules across Python Foundations, Algorithms, and System Design to complete the entire academy.",
        rewardLabel: "★ SUPREME SOVEREIGN CROWN",
        icon: "crown",
        crestBg: StudioColors.yellow,
        crestSecondary: StudioColors.violet,
        difficulty: "hard",
        current: Math.min(allTotal, totalSolvedCount),
        target: allTotal,
        unit: "TOTAL MODULES",
        actionMode: "roadmap",
        actionLabel: "VIEW SKILL MAP →",
      },
      // 17. EASY — 3-STAR MASTERY (SMALL AMOUNT)
      {
        id: "three_star_starter_5",
        title: "3-Star Rising Constellation",
        subtitle: "5 PERFECT 3-STAR MODULES",
        howToObtain:
          "Earn a 3-Star Mastery rating (★★★) on 5 lessons by clearing all practice stages without loading the reference solution.",
        rewardLabel: "+150 XP STAR CREST",
        icon: "star",
        crestBg: StudioColors.yellow,
        crestSecondary: StudioColors.mint,
        difficulty: "easy",
        current: Math.min(5, threeStarSolvedCount),
        target: 5,
        unit: "3-STAR MODULES",
        actionMode: "roadmap",
        actionLabel: "EARN 3 STARS →",
      },
      // 18. MEDIUM — 3-STAR MASTERY (MEDIUM AMOUNT)
      {
        id: "three_star_medium_15",
        title: "3-Star Mastery Tactician",
        subtitle: "15 PERFECT 3-STAR MODULES",
        howToObtain:
          "Achieve a perfect 3-Star Mastery rating (★★★) across 15 lessons by conquering every practice drill and boss stage on your own.",
        rewardLabel: "CONSTELLATION MEDAL",
        icon: "medal",
        crestBg: StudioColors.yellow,
        crestSecondary: "#38BDF8",
        difficulty: "medium",
        current: Math.min(15, threeStarSolvedCount),
        target: 15,
        unit: "3-STAR MODULES",
        actionMode: "roadmap",
        actionLabel: "MASTER DRILLS →",
      },
      // 19. HARD (HIGHLIGHTED!) — 3-STAR MASTERY (ALL LESSONS)
      {
        id: "three_star_all_lessons",
        title: "Astral 3-Star Perfectionist",
        subtitle: "100% 3-STAR ACADEMY PERFECTION",
        howToObtain:
          "Earn all 3 Stars (★★★) on every single lesson across the entire curriculum—clearing every core lesson, practice stage, and boss drill with zero solution spoilers.",
        rewardLabel: "★ CELESTIAL 3-STAR CROWN",
        icon: "crown",
        crestBg: StudioColors.yellow,
        crestSecondary: StudioColors.pink,
        difficulty: "hard",
        current: Math.min(allTotal, threeStarSolvedCount),
        target: allTotal,
        unit: "3-STAR MODULES",
        actionMode: "roadmap",
        actionLabel: "PERFECT ALL LESSONS →",
      },
      // 20. EASY — FIRST CHAPTER RECAP PASSED
      {
        id: "first_chapter_recap",
        title: "Chapter Boss Conqueror",
        subtitle: "FIRST CHAPTER RECAP CLEARED",
        howToObtain:
          "Pass any Chapter Recap Capstone lesson at the end of a chapter by combining all concepts taught in that chapter.",
        rewardLabel: "+100 XP CHAPTER SEAL",
        icon: "trophy",
        crestBg: StudioColors.yellow,
        crestSecondary: StudioColors.mint,
        difficulty: "easy",
        current: Math.min(1, recapSolvedCount),
        target: 1,
        unit: "CHAPTER RECAP",
        actionMode: "roadmap",
        actionLabel: "TACKLE RECAP BOSS →",
      },
      // 21. MEDIUM — PYTHON ALL 6 CHAPTER RECAPS
      {
        id: "python_all_recaps",
        title: "Python Chapter Sovereign",
        subtitle: "ALL 6 PYTHON CHAPTER RECAPS",
        howToObtain:
          "Pass all 6 cumulative Chapter Recap Boss challenges in the Python Foundations track.",
        rewardLabel: "PYTHON CHAPTER MEDAL",
        icon: "python",
        crestBg: StudioColors.yellow,
        crestSecondary: "#38BDF8",
        difficulty: "medium",
        current: Math.min(pyRecapTotal, pyRecapSolvedCount),
        target: pyRecapTotal,
        unit: "PYTHON RECAPS",
        actionMode: "roadmap",
        actionLabel: "CONQUER PYTHON RECAPS →",
      },
      // 22. MEDIUM — ALGORITHMS ALL 6 CHAPTER RECAPS
      {
        id: "algo_all_recaps",
        title: "Algorithm Chapter Master",
        subtitle: "ALL 6 ALGO CHAPTER RECAPS",
        howToObtain:
          "Pass all 6 cumulative Chapter Recap Boss challenges across Patterns, Graphs, Dynamic Programming, and Tries.",
        rewardLabel: "ALGO CAPSTONE SEAL",
        icon: "swords",
        crestBg: StudioColors.violet,
        crestSecondary: StudioColors.yellow,
        difficulty: "medium",
        current: Math.min(algoRecapTotal, algoRecapSolvedCount),
        target: algoRecapTotal,
        unit: "ALGO RECAPS",
        actionMode: "roadmap",
        actionLabel: "CONQUER ALGO RECAPS →",
      },
      // 23. MEDIUM — SYSTEM DESIGN ALL 6 CHAPTER RECAPS
      {
        id: "sys_all_recaps",
        title: "Architecture Chapter Laureate",
        subtitle: "ALL 6 SYSTEM CHAPTER RECAPS",
        howToObtain:
          "Pass all 6 cumulative Chapter Recap Boss challenges across Caching, Sharding, Messaging, and Resiliency.",
        rewardLabel: "ARCHITECT CAPSTONE",
        icon: "arch",
        crestBg: StudioColors.mint,
        crestSecondary: StudioColors.yellow,
        difficulty: "medium",
        current: Math.min(sysRecapTotal, sysRecapSolvedCount),
        target: sysRecapTotal,
        unit: "SYSTEM RECAPS",
        actionMode: "roadmap",
        actionLabel: "CONQUER SYSTEM RECAPS →",
      },
      // 24. HARD (HIGHLIGHTED!) — ALL 18 CHAPTER RECAPS CLEARED
      {
        id: "all_chapters_recap_grand",
        title: "Grand Chapter Capstone Champion",
        subtitle: "ALL 18 CHAPTER RECAPS CLEARED",
        howToObtain:
          "Complete every Chapter Recap Boss challenge across all 18 chapters of Python Foundations, Algorithms, and System Design.",
        rewardLabel: "★ GRAND CAPSTONE CROWN",
        icon: "crown",
        crestBg: StudioColors.yellow,
        crestSecondary: StudioColors.coral,
        difficulty: "hard",
        current: Math.min(allRecapTotal, recapSolvedCount),
        target: allRecapTotal,
        unit: "CHAPTER RECAPS",
        actionMode: "roadmap",
        actionLabel: "FINISH ALL RECAPS →",
      },
    ];
  }, [
    pyLessons,
    algoLessons,
    sysLessons,
    recapLessons.length,
    lessons.length,
    totalSolvedCount,
    threeStarSolvedCount,
    recapSolvedCount,
    pyRecapSolvedCount,
    algoRecapSolvedCount,
    sysRecapSolvedCount,
    streakCount,
    bugsSolvedCount,
    pySolvedCount,
    xpPoints,
    algoSolvedCount,
    sysSolvedCount,
  ]);

  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.current >= a.target).length,
    [achievements],
  );
  const hardAchievements = useMemo(
    () => achievements.filter((a) => a.difficulty === "hard"),
    [achievements],
  );
  const hardUnlockedCount = useMemo(
    () => hardAchievements.filter((a) => a.current >= a.target).length,
    [hardAchievements],
  );

  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const isDone = item.current >= item.target;
      if (activeFilter === "hard") return item.difficulty === "hard";
      if (activeFilter === "easy_med") return item.difficulty !== "hard";
      if (activeFilter === "unlocked") return isDone;
      if (activeFilter === "in_progress") return !isDone;
      return true;
    });
  }, [achievements, activeFilter]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Banner & Telemetry Summary */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRibbon} />
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroTitleCol}>
            <View style={styles.eyebrowPill}>
              <Text style={styles.eyebrowText}>
                🏆 HALL OF ACHIEVEMENTS &amp; MILESTONES
              </Text>
            </View>
            <Text style={styles.heroTitle}>Developer Achievements</Text>
            <Text style={styles.heroSubtitle}>
              Complete coding modules, squash production bugs, and build your
              streak to unlock easy, medium, and highlighted{" "}
              <Text style={styles.heroSubtitleHighlight}>
                ★ HARD ELITE CHALLENGES
              </Text>
              .
            </Text>
          </View>

          <View style={styles.summaryStatsRow}>
            <View
              style={[
                styles.summaryStatBox,
                { backgroundColor: StudioColors.yellow },
              ]}
            >
              <Text style={styles.summaryStatNumber}>
                🏆 {unlockedCount}/{achievements.length}
              </Text>
              <Text style={styles.summaryStatLabel}>UNLOCKED</Text>
            </View>

            <View
              style={[
                styles.summaryStatBox,
                { backgroundColor: StudioColors.coral },
              ]}
            >
              <Text style={styles.summaryStatNumber}>
                👑 {hardUnlockedCount}/{hardAchievements.length}
              </Text>
              <Text style={styles.summaryStatLabel}>HARD ELITE</Text>
            </View>

            <View
              style={[
                styles.summaryStatBox,
                { backgroundColor: StudioColors.mint },
              ]}
            >
              <Text style={styles.summaryStatNumber}>🪲 {bugsSolvedCount}</Text>
              <Text style={styles.summaryStatLabel}>BUGS PATCHED</Text>
            </View>
          </View>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterRow}>
          {(
            [
              { id: "all", label: `✨ ALL (${achievements.length})` },
              {
                id: "hard",
                label: `🔥 HARD ELITE (${hardAchievements.length})`,
              },
              {
                id: "easy_med",
                label: `🎯 EASY & MEDIUM (${
                  achievements.length - hardAchievements.length
                })`,
              },
              { id: "unlocked", label: `✅ UNLOCKED (${unlockedCount})` },
              {
                id: "in_progress",
                label: `⏱️ IN PROGRESS (${
                  achievements.length - unlockedCount
                })`,
              },
            ] as const
          ).map((tab) => {
            const isSelected = activeFilter === tab.id;
            const isHardTab = tab.id === "hard";
            return (
              <Pressable
                key={tab.id}
                style={({ pressed }) => [
                  styles.filterPill,
                  isHardTab && styles.filterPillHard,
                  isSelected &&
                    (isHardTab
                      ? styles.filterPillHardActive
                      : styles.filterPillActive),
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
                onPress={() => {
                  playKeyClick();
                  setActiveFilter(tab.id);
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Achievements Grid */}
      <View style={styles.gridWrap}>
        {filteredAchievements.map((ach) => {
          const isUnlocked = ach.current >= ach.target;
          const isHard = ach.difficulty === "hard";
          const pct = Math.min(
            100,
            Math.round((ach.current / Math.max(1, ach.target)) * 100),
          );
          const remaining = Math.max(0, ach.target - ach.current);

          const diffMeta =
            ach.difficulty === "hard"
              ? {
                  label: "🔥 HARD · ELITE",
                  bg: StudioColors.yellow,
                  text: StudioColors.ink,
                }
              : ach.difficulty === "medium"
                ? {
                    label: "⚡ MEDIUM",
                    bg: StudioColors.violet,
                    text: StudioColors.ink,
                  }
                : {
                    label: "🌱 EASY",
                    bg: StudioColors.mint,
                    text: StudioColors.ink,
                  };

          return (
            <View
              key={ach.id}
              style={[
                styles.achCard,
                isHard && styles.achCardHardHighlighted,
                isUnlocked && styles.achCardUnlocked,
              ]}
            >
              {/* Special Highlighted Top Banner for HARD Achievements */}
              {isHard ? (
                <View style={styles.hardSpotlightRibbon}>
                  <Text style={styles.hardSpotlightRibbonText}>
                    👑 FEATURED HARD CHALLENGE · HIGH PRESTIGE
                  </Text>
                  <Text style={styles.hardSpotlightRewardText}>
                    {ach.rewardLabel}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.standardTopStrip,
                    { backgroundColor: ach.crestBg },
                  ]}
                />
              )}

              <View style={styles.achCardInner}>
                {/* Top Row: Illustrated Emblem Image + Title + Difficulty/Status */}
                <View style={styles.achHeaderRow}>
                  {/* Custom Illustrated Achievement Emblem Box */}
                  <View
                    style={[
                      styles.emblemFrame,
                      { backgroundColor: ach.crestBg },
                      isHard && styles.emblemFrameHard,
                    ]}
                  >
                    <View
                      style={[
                        styles.emblemInnerCircle,
                        { borderColor: ach.crestSecondary },
                      ]}
                    >
                      <StudioIcon name={ach.icon} size={36} />
                    </View>
                    {/* Corner Rivets */}
                    <View style={[styles.emblemRivet, { top: 4, left: 4 }]} />
                    <View style={[styles.emblemRivet, { top: 4, right: 4 }]} />
                    <View
                      style={[styles.emblemRivet, { bottom: 4, left: 4 }]}
                    />
                    <View
                      style={[styles.emblemRivet, { bottom: 4, right: 4 }]}
                    />
                    {isHard && (
                      <View style={styles.emblemHardCrownTag}>
                        <Text style={styles.emblemHardCrownTagText}>★</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.achTitleCol}>
                    <View style={styles.badgesTopRow}>
                      <View
                        style={[
                          styles.diffBadge,
                          { backgroundColor: diffMeta.bg },
                          isHard && styles.diffBadgeHard,
                        ]}
                      >
                        <Text
                          style={[
                            styles.diffBadgeText,
                            { color: diffMeta.text },
                          ]}
                        >
                          {diffMeta.label}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          isUnlocked
                            ? styles.statusBadgeUnlocked
                            : styles.statusBadgeLocked,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isUnlocked && { color: StudioColors.ink },
                          ]}
                        >
                          {isUnlocked ? "✅ UNLOCKED" : `${pct}% DONE`}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.achTitle,
                        isHard && styles.achTitleHard,
                      ]}
                    >
                      {ach.title}
                    </Text>
                    <Text style={styles.achSubtitle}>{ach.subtitle}</Text>
                  </View>
                </View>

                {/* How to Obtain Description Box */}
                <View
                  style={[
                    styles.howToObtainBox,
                    isHard && styles.howToObtainBoxHard,
                  ]}
                >
                  <Text style={styles.howToObtainLabel}>
                    🎯 HOW TO OBTAIN:
                  </Text>
                  <Text style={styles.howToObtainDesc}>{ach.howToObtain}</Text>
                </View>

                {/* Live Progress Telemetry Section */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.progressCounterText}>
                      {ach.current} / {ach.target} {ach.unit}
                    </Text>
                    <Text
                      style={[
                        styles.progressRemainingText,
                        isUnlocked && { color: StudioColors.mint },
                      ]}
                    >
                      {isUnlocked
                        ? "🏆 COMPLETED!"
                        : `${remaining} MORE TO UNLOCK`}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.progressTrack,
                      isHard && styles.progressTrackHard,
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.max(pct, ach.current > 0 ? 6 : 0)}%`,
                          backgroundColor: isUnlocked
                            ? StudioColors.mint
                            : isHard
                              ? StudioColors.yellow
                              : ach.crestBg,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Footer Action & Reward Row */}
                <View style={styles.cardFooterRow}>
                  <View style={styles.rewardTagPill}>
                    <Text style={styles.rewardTagText}>
                      🎁 {ach.rewardLabel}
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.jumpActionBtn,
                      isHard && styles.jumpActionBtnHard,
                      pressed && { transform: [{ translateY: 1 }] },
                    ]}
                    onPress={() => {
                      playKeyClick();
                      onNavigateMode(ach.actionMode);
                    }}
                  >
                    <Text
                      style={[
                        styles.jumpActionBtnText,
                        isHard && { color: StudioColors.ink },
                      ]}
                    >
                      {ach.actionLabel}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    paddingBottom: 80,
  },
  heroCard: {
    width: "100%",
    maxWidth: 1080,
    backgroundColor: StudioColors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: StudioColors.border,
    overflow: "hidden",
    marginBottom: 24,
    ...HardShadow,
  },
  heroTopRibbon: {
    height: 8,
    backgroundColor: StudioColors.yellow,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.ink,
  },
  heroHeaderRow: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 18,
  },
  heroTitleCol: {
    flex: 1,
    minWidth: 280,
    gap: 6,
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    ...HardShadowSm,
  },
  eyebrowText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: StudioColors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  heroSubtitleHighlight: {
    color: StudioColors.yellow,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  summaryStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryStatBox: {
    minWidth: 112,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    gap: 2,
    ...HardShadowSm,
  },
  summaryStatNumber: {
    color: StudioColors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  summaryStatLabel: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.7,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  filterPillHard: {
    borderColor: StudioColors.yellow,
  },
  filterPillActive: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  filterPillHardActive: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  filterPillText: {
    color: StudioColors.textPrimary,
    fontSize: 10.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  filterPillTextActive: {
    color: StudioColors.ink,
  },
  gridWrap: {
    width: "100%",
    maxWidth: 1080,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  achCard: {
    width: "48.5%",
    minWidth: 310,
    flexGrow: 1,
    backgroundColor: StudioColors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.border,
    overflow: "hidden",
    ...HardShadow,
  },
  achCardHardHighlighted: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 2.5,
    borderColor: StudioColors.yellow,
  },
  achCardUnlocked: {
    borderColor: StudioColors.mint,
  },
  standardTopStrip: {
    height: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.ink,
  },
  hardSpotlightRibbon: {
    backgroundColor: StudioColors.yellow,
    borderBottomWidth: 2,
    borderBottomColor: StudioColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  hardSpotlightRibbonText: {
    color: StudioColors.ink,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  hardSpotlightRewardText: {
    color: StudioColors.ink,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    backgroundColor: StudioColors.coral,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: StudioColors.ink,
  },
  achCardInner: {
    padding: 16,
    gap: 12,
  },
  achHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  emblemFrame: {
    width: 68,
    height: 68,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
    ...HardShadowSm,
  },
  emblemFrameHard: {
    width: 72,
    height: 72,
    borderWidth: 2.5,
  },
  emblemInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    backgroundColor: StudioColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  emblemRivet: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: StudioColors.ink,
    opacity: 0.65,
  },
  emblemHardCrownTag: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: StudioColors.coral,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  emblemHardCrownTagText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
  },
  achTitleCol: {
    flex: 1,
    gap: 3,
  },
  badgesTopRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  diffBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  diffBadgeHard: {
    borderWidth: 2,
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  statusBadgeUnlocked: {
    backgroundColor: StudioColors.mint,
    borderColor: StudioColors.ink,
  },
  statusBadgeLocked: {
    backgroundColor: StudioColors.bg,
    borderColor: StudioColors.borderSubtle,
  },
  statusBadgeText: {
    color: StudioColors.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  achTitle: {
    color: StudioColors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  achTitleHard: {
    color: StudioColors.yellow,
    fontSize: 17,
  },
  achSubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
  howToObtainBox: {
    backgroundColor: StudioColors.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: StudioColors.borderSubtle,
    padding: 11,
    gap: 4,
  },
  howToObtainBoxHard: {
    borderColor: StudioColors.yellow,
  },
  howToObtainLabel: {
    color: StudioColors.textPrimary,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.6,
  },
  howToObtainDesc: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  progressSection: {
    gap: 6,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  progressCounterText: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  progressRemainingText: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  progressTrack: {
    height: 11,
    backgroundColor: StudioColors.bg,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  progressTrackHard: {
    height: 13,
    borderColor: StudioColors.yellow,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  rewardTagPill: {
    backgroundColor: StudioColors.bg,
    borderWidth: 1,
    borderColor: StudioColors.borderSubtle,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rewardTagText: {
    color: StudioColors.textSecondary,
    fontSize: 9.5,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  jumpActionBtn: {
    backgroundColor: StudioColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  jumpActionBtnHard: {
    backgroundColor: StudioColors.yellow,
    borderColor: StudioColors.ink,
  },
  jumpActionBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 9.5,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.5,
  },
});
