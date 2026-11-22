import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const { ThemeProvider } = loadTsModule("src/constants/themeContext.tsx");
const { default: MobileThumbNav } = loadTsModule("src/components/MobileThumbNav.tsx");
const { default: ArcadeHub, ArcadeSubNavBar } = loadTsModule("src/components/ArcadeHub.tsx");
const { default: AppHeader } = loadTsModule("src/components/AppHeader.tsx");
const { default: BlitzMistakeReviewCard } = loadTsModule(
  "src/components/BlitzMistakeReviewCard.tsx",
);
const { createSyntaxBlitzStyles } = loadTsModule(
  "src/components/syntaxBlitzStyles.ts",
);
const { default: SyntaxBlitzArena } = loadTsModule(
  "src/components/SyntaxBlitzArena.tsx",
);
const { default: AlgorithmVisualizerLab } = loadTsModule(
  "src/components/AlgorithmVisualizerLab.tsx",
);
const { default: StudioCodeEditor } = loadTsModule(
  "src/components/StudioCodeEditor.tsx",
);
const { default: BugHuntArena } = loadTsModule(
  "src/components/BugHuntArena.tsx",
);
const { default: LessonProblemPanel } = loadTsModule(
  "src/components/LessonProblemPanel.tsx",
);
const { default: VisualLessonPanel } = loadTsModule(
  "src/components/VisualLessonPanel.tsx",
);
const { default: RoadmapReviewCard } = loadTsModule(
  "src/components/RoadmapReviewCard.tsx",
);
const { default: SystemDesignLabPanel } = loadTsModule(
  "src/components/SystemDesignLabPanel.tsx",
);
const { getLessonEnrichment, mergeCurriculumLessons } = loadTsModule(
  "src/constants/curriculum.ts",
);
const { renderHighlightedPython } = loadTsModule(
  "src/components/FormattedText.tsx",
);
const { getDeveloperRank, MAX_DEVELOPER_LEVEL, default: ProfileStatsModal } = loadTsModule(
  "src/components/ProfileStatsModal.tsx",
);
const { default: StudioSettingsModal } = loadTsModule(
  "src/components/StudioSettingsModal.tsx",
);
const { default: RoadmapWelcomeCard } = loadTsModule(
  "src/components/RoadmapWelcomeCard.tsx",
);
const { default: RoadmapRetroTv, RETRO_TV_CHANNELS } = loadTsModule(
  "src/components/RoadmapRetroTv.tsx",
);
const { default: FlashcardsArena } = loadTsModule(
  "src/components/FlashcardsArena.tsx",
);
const { default: OutputDetectiveArena } = loadTsModule(
  "src/components/OutputDetectiveArena.tsx",
);
const { default: MiniBuildsArena } = loadTsModule(
  "src/components/MiniBuildsArena.tsx",
);
const { default: PythonScratchpad } = loadTsModule(
  "src/components/PythonScratchpad.tsx",
);
const { default: CommandPaletteModal } = loadTsModule(
  "src/components/CommandPaletteModal.tsx",
);
const { default: WeeklyLeaguePanel } = loadTsModule(
  "src/components/WeeklyLeaguePanel.tsx",
);
const {
  completeOnboarding,
  resetOnboardingForTesting,
} = loadTsModule("src/utils/userOnboarding.ts");
const { default: SuccessModal } = loadTsModule(
  "src/components/SuccessModal.tsx",
);
const { default: StreakMilestoneModal } = loadTsModule(
  "src/components/StreakMilestoneModal.tsx",
);
const { default: StudioErrorBoundary } = loadTsModule(
  "src/components/StudioErrorBoundary.tsx",
);
const { default: Auth } = loadTsModule("src/components/Auth.tsx");
const { StudioIcon } = loadTsModule("src/components/StudioIcon.tsx");
loadTsModule("src/hooks/useArenaRewards.ts");
loadTsModule("src/hooks/useLessonExecution.ts");
const { StudioColors } = loadTsModule("src/constants/theme.ts");

function renderThemed(element) {
  return renderToStaticMarkup(
    React.createElement(ThemeProvider, null, element),
  );
}

function visibleText(html) {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

test("MobileThumbNav renders all 5 destinations and marks Arcade active for mini-game modes", () => {
  const freeHtml = renderThemed(
    React.createElement(MobileThumbNav, {
      viewMode: "blitz",
      isPremium: false,
      onChangeViewMode: () => {},
    }),
  );
  const freeText = visibleText(freeHtml);

  for (const label of ["Map", "Studio", "Arcade", "Lab", "Docs"]) {
    assert.ok(freeText.includes(label), `Missing MobileThumbNav label: ${label}`);
  }
  assert.ok(
    freeHtml.includes('aria-label="Cozy Arcade Hub" role="button" aria-selected="true"'),
    "Arcade tab should carry aria-selected=true when inside a mini-game like Speed Blitz",
  );

  const proHtml = renderThemed(
    React.createElement(MobileThumbNav, {
      viewMode: "algolab",
      isPremium: true,
      onChangeViewMode: () => {},
    }),
  );
  assert.ok(
    proHtml.includes(
      'aria-label="Algorithm Visual Lab" role="button" aria-selected="true"',
    ),
  );
  // Locked Lab icon differs cleanly from unlocked Lab microscope icon
  assert.notEqual(
    freeHtml.match(/aria-label="Algorithm Visual Lab"[\s\S]*?<\/button>/)?.[0],
    proHtml.match(/aria-label="Algorithm Visual Lab"[\s\S]*?<\/button>/)?.[0],
  );
});

test("AppHeader toggles desktop navigation vs compact phone header cleanly", () => {
  const baseProps = {
    viewMode: "roadmap",
    onChangeViewMode: () => {},
    pyodideReady: true,
    themeMode: "light",
    onToggleTheme: () => {},
    devRank: { level: 3, title: "Script Crafter" },
    streakCount: 4,
    isPremium: false,
    session: null,
    onOpenProfile: () => {},
    onOpenPaywall: () => {},
    onOpenAuth: () => {},
    onSignOut: () => {},
  };

  const desktopHtml = renderThemed(
    React.createElement(AppHeader, { ...baseProps, isCompactHeader: false }),
  );
  const desktopText = visibleText(desktopHtml);
  assert.ok(desktopText.includes("SKILL MAP"));
  assert.ok(desktopText.includes("CODE STUDIO"));
  assert.ok(desktopText.includes("ARCADE"));
  assert.ok(desktopText.includes("ALGO LAB"));
  assert.ok(
    !desktopText.includes("SPEED BLITZ") && !desktopText.includes("FLASH DECK"),
    "Mini-games should live inside the dedicated Arcade Hub rather than cluttering the top menu",
  );
  assert.ok(desktopText.includes("LEADERBOARD"));
  assert.ok(desktopText.includes("UPGRADE TO PRO"));
  assert.ok(desktopText.includes("ACCOUNT & RANK"));
  assert.ok(desktopText.includes("SETTINGS"));
  assert.ok(
    !desktopText.includes("THEMES") && !desktopText.includes("SFX"),
    "Cluttered loose Settings pills should be consolidated into the unified Settings menu",
  );
  assert.ok(
    desktopText.indexOf("ACHIEVEMENTS") < desktopText.indexOf("LEADERBOARD") &&
      desktopText.indexOf("LEADERBOARD") < desktopText.indexOf("UPGRADE TO PRO"),
    "Achievements and Leaderboard should precede the Pro box in Free mode",
  );

  const proHeaderHtml = renderThemed(
    React.createElement(AppHeader, {
      ...baseProps,
      isCompactHeader: false,
      isPremium: true,
    }),
  );
  const proDesktopText = visibleText(proHeaderHtml);
  assert.ok(proDesktopText.includes("PRO MEMBER"));
  assert.ok(
    proDesktopText.indexOf("ACHIEVEMENTS") < proDesktopText.indexOf("LEADERBOARD") &&
      proDesktopText.indexOf("LEADERBOARD") < proDesktopText.indexOf("PRO MEMBER"),
    "Achievements, Leaderboard, and Pro boxes should keep their order when switching to Pro",
  );
  const headerSvgs = proHeaderHtml.match(/<svg[\s\S]*?<\/svg>/g) || [];
  assert.ok(
    new Set(headerSvgs).size >= 9,
    "Desktop header should render unique custom SVGs for Devy, menu buttons, Account & Rank, Leaderboard, Pro Member, and Settings",
  );

  const mobileText = visibleText(
    renderThemed(
      React.createElement(AppHeader, { ...baseProps, isCompactHeader: true }),
    ),
  );
  assert.ok(
    !mobileText.includes("CODING & LABS"),
    "Compact mobile header should hide duplicate desktop nav row",
  );
  assert.ok(mobileText.includes("LEAGUE"));
  assert.ok(mobileText.includes("SETTINGS"));
  assert.ok(mobileText.includes("GET PRO"));
  assert.ok(mobileText.includes("4 D"));
});

test("BlitzMistakeReviewCard renders explanations when populated and empty state when cleared", () => {
  const styles = createSyntaxBlitzStyles(StudioColors);
  const populatedText = visibleText(
    renderThemed(
      React.createElement(BlitzMistakeReviewCard, {
        styles,
        cards: [
          {
            id: "py-1",
            deck: "python_basics",
            tag: "VARIABLES",
            prompt: "Assign 250 to xp",
            codeTemplate: "xp [ ___ ] 250",
            options: ["=", "==", "->", ":"],
            correctIndex: 0,
            explanation: "Use single = for assignment.",
          },
        ],
        onDismissCard: () => {},
        onClearAll: () => {},
        onBackToLobby: () => {},
      }),
    ),
  );
  assert.ok(populatedText.includes("MISTAKE REVIEW & EXPLANATIONS (1)"));
  assert.ok(populatedText.includes("xp = 250"));
  assert.ok(populatedText.includes("Use single = for assignment."));
  assert.ok(populatedText.includes("I READ EVERYTHING"));

  const emptyText = visibleText(
    renderThemed(
      React.createElement(BlitzMistakeReviewCard, {
        styles,
        cards: [],
        onDismissCard: () => {},
        onClearAll: () => {},
        onBackToLobby: () => {},
      }),
    ),
  );
  assert.ok(emptyText.includes("ALL CAUGHT UP"));
  assert.ok(emptyText.includes("BACK TO 60s BLITZ LOBBY"));
});

test("SyntaxBlitzArena, BugHuntArena, and AlgorithmVisualizerLab render full trees without crashing", () => {
  const blitzText = visibleText(
    renderThemed(
      React.createElement(SyntaxBlitzArena, {
        isPremium: true,
        onRequirePro: () => {},
        onAwardBlitzXp: () => {},
      }),
    ),
  );
  assert.ok(blitzText.includes("60-SECOND SYNTAX BLITZ"));
  assert.ok(blitzText.includes("PYTHON CORE"));
  assert.ok(blitzText.includes("ALGORITHMS & BIG-O"));
  assert.ok(blitzText.includes("SYSTEM DESIGN"));
  assert.ok(blitzText.includes("INSERT COIN"));

  const labText = visibleText(
    renderThemed(
      React.createElement(AlgorithmVisualizerLab, {
        isPremium: true,
        onRequirePro: () => {},
        onBackToMap: () => {},
      }),
    ),
  );
  assert.ok(labText.includes("Binary Search"));
  assert.ok(labText.includes("Recursion & Call Stack"));
  assert.ok(labText.includes("Min-Heap Priority Queue"));
  assert.ok(labText.includes("Dynamic Programming Grid"));
  assert.ok(labText.includes("System Design Flow"));

  const bugText = visibleText(
    renderThemed(
      React.createElement(BugHuntArena, {
        pyodideReady: true,
        isPremium: true,
        onRequirePro: () => {},
        onExecutePatch: async () => ({
          allPassed: true,
          results: [],
          stdout: "",
        }),
        onAwardBugHuntXp: () => {},
        solvedIncidents: {},
        renderHighlightedPython,
      }),
    ),
  );
  assert.ok(bugText.includes("Production Bug Hunt"));
  assert.ok(bugText.includes("DAILY SEED"));
});

test("StudioCodeEditor renders editor chrome, quick inserts, trace control, and assertion diff", () => {
  const editorText = visibleText(
    renderThemed(
      React.createElement(StudioCodeEditor, {
        selectedLesson: {
          id: "test-1",
          track: "python_basics",
          lesson_order: 1,
          title: "Test Module",
          description: "Test description",
          initial_code: "def solve():\n    pass",
          is_free: true,
        },
        code: "def solve():\n    return 41",
        onChangeCode: () => {},
        hasSavedDraft: true,
        pyodideReady: true,
        isExecuting: false,
        onTraceCode: () => {},
        onRunPlaygroundOnly: () => {},
        onRunPythonCode: () => {},
        bottomTab: "tests",
        onChangeBottomTab: () => {},
        output: "",
        onClearOutput: () => {},
        testResults: [
          {
            id: 1,
            input: "solve()",
            expected: "42",
            actual: "41",
            passed: false,
          },
        ],
        selectedTestIndex: 0,
        onSelectTestIndex: () => {},
      }),
    ),
  );
  assert.ok(editorText.includes("solution.py"));
  assert.ok(editorText.includes("25:00"));
  assert.ok(editorText.includes("THOCK"));
  assert.ok(editorText.includes("DRAFT SAVED"));
  assert.ok(editorText.includes("# Comment"));
  assert.ok(!editorText.includes("EVAL"));
  assert.ok(editorText.includes("TRACE"));
  assert.ok(editorText.includes("TEST RUN"));
  assert.ok(editorText.includes("SUBMIT CODE (+50 XP)"));
  assert.ok(editorText.includes("0 OF 1 CHECKS PASSED"));
  assert.ok(editorText.includes("FIRST DIFFERENCE"));
  assert.ok(editorText.includes("OFF BY ONE"));
  assert.ok(editorText.includes("YOUR OUTPUT · MISMATCH"));
  assert.ok(
    !editorText.includes("BYTE-CAT CLUE"),
    "Stuck clue should stay hidden until 2+ failed attempts",
  );

  const stuckEditorText = visibleText(
    renderThemed(
      React.createElement(StudioCodeEditor, {
        selectedLesson: {
          id: "test-1",
          track: "python_basics",
          lesson_order: 1,
          title: "Test Module",
          description: "Test description",
          initial_code: "def solve():\n    pass",
          is_free: true,
        },
        code: "def solve():\n    return 41",
        onChangeCode: () => {},
        hasSavedDraft: true,
        pyodideReady: true,
        isExecuting: false,
        onRunPlaygroundOnly: () => {},
        onRunPythonCode: () => {},
        bottomTab: "tests",
        onChangeBottomTab: () => {},
        output: "",
        onClearOutput: () => {},
        testResults: [
          {
            id: 1,
            input: "solve()",
            expected: "42",
            actual: "41",
            passed: false,
          },
        ],
        selectedTestIndex: 0,
        onSelectTestIndex: () => {},
        failedAttemptCount: 2,
        lessonHints: ["Return 42 directly instead of 41."],
      }),
    ),
  );
  assert.ok(stuckEditorText.includes("BYTE-CAT CLUE · TRY #2"));
  assert.ok(stuckEditorText.includes("Return 42 directly instead of 41."));
});

test("LessonProblemPanel renders organized Full Guide (without Toolbox clutter) and limits Concept Check to Full Guide", () => {
  const firstLesson = mergeCurriculumLessons([]).find(
    (l) => l.id === "exp-py-01",
  );
  assert.ok(firstLesson);
  const enrichment = getLessonEnrichment(firstLesson);
  const baseProps = {
    selectedLesson: firstLesson,
    activeTrack: firstLesson.track,
    completedLessons: {},
    activeTab: "problem",
    onChangeActiveTab: () => {},
    onChangeExplainStyle: () => {},
    lessonEnrichment: enrichment,
    onLoadGuidedSteps: () => {},
    testResults: null,
    isPremium: true,
    onOpenPaywall: () => {},
  };

  const fullGuideHtml = renderThemed(
    React.createElement(LessonProblemPanel, {
      ...baseProps,
      explainStyle: "guide",
    }),
  );
  const fullGuideText = visibleText(fullGuideHtml);
  assert.ok(
    fullGuideText.indexOf("01. LEARN & TOOLS") <
      fullGuideText.indexOf("02. MISSION BRIEF"),
    "Learn tab should come before Mission tab for beginner flow",
  );
  assert.equal(
    fullGuideText.includes("TIME: O(1)"),
    false,
    "Python Basics lessons should hide Big-O header badges",
  );
  assert.ok(fullGuideText.includes("SIMPLE EXAMPLE"));
  assert.ok(fullGuideText.includes("COMMON PITFALL TO AVOID"));
  assert.ok(fullGuideText.includes("CONCEPT CHECK · QUICK RECALL"));
  assert.ok(fullGuideText.includes(enrichment.quiz.question));
  assert.equal(fullGuideText.includes("WHY THIS MATTERS"), false);
  assert.equal(fullGuideText.includes("TOOLS USED IN THIS LESSON"), false);
  assert.equal(fullGuideText.includes("TOOLS NEEDED"), false);
  assert.equal(fullGuideText.includes("TOOLBOX"), false);
  assert.equal(
    fullGuideText.includes("PROGRESSIVE CLUES"),
    false,
    "Progressive Clues should be hidden on the Learn & Tools tab",
  );
  assert.equal(fullGuideHtml.includes("💻"), false);

  const analogyText = visibleText(
    renderThemed(
      React.createElement(LessonProblemPanel, {
        ...baseProps,
        explainStyle: "analogy",
      }),
    ),
  );
  assert.ok(analogyText.includes(enrichment.analogyTitle));
  assert.equal(analogyText.includes("CONCEPT CHECK · QUICK RECALL"), false);
  assert.equal(analogyText.includes("COMMON PITFALL TO AVOID"), false);

  const cheatText = visibleText(
    renderThemed(
      React.createElement(LessonProblemPanel, {
        ...baseProps,
        explainStyle: "cheatsheet",
      }),
    ),
  );
  assert.ok(cheatText.includes("PYTHON SYNTAX PATTERN"));
  assert.equal(cheatText.includes("CONCEPT CHECK · QUICK RECALL"), false);
  assert.equal(cheatText.includes("COMMON PITFALL TO AVOID"), false);

  const missionText = visibleText(
    renderThemed(
      React.createElement(LessonProblemPanel, {
        ...baseProps,
        activeTab: "mission",
        userCode: firstLesson.initial_code,
        onApplyScaffold: () => {},
      }),
    ),
  );
  assert.ok(missionText.includes("EXAMPLE 01"));
  assert.equal(
    missionText.includes("EXPECTED RETURN VALUE (EXAMPLE 01)"),
    false,
    "Redundant EXPECTED RETURN VALUE box should be omitted when EXAMPLE 01 is present",
  );
  assert.equal(missionText.includes("EXPECTED CONSOLE OUTPUT TARGET"), false);
  assert.ok(missionText.includes("NEW TO PYTHON? 3 QUICK RULES FOR THE EDITOR"));
  assert.ok(missionText.includes("PROGRESSIVE CLUES"));
  assert.ok(missionText.includes("GUIDED SCAFFOLDING MODE"));
  assert.ok(missionText.includes("LOAD SKELETON"));
  assert.ok(
    missionText.indexOf("EXAMPLE 01") <
      missionText.indexOf("GUIDED SCAFFOLDING MODE"),
    "Core Mission Brief should show examples before Guided Scaffolding Mode",
  );

  // Fallback targetOutputTerminal renders when a lesson has no examples array
  const noExamplesMissionText = visibleText(
    renderThemed(
      React.createElement(LessonProblemPanel, {
        ...baseProps,
        selectedLesson: { ...firstLesson, examples: [] },
        activeTab: "mission",
        userCode: firstLesson.initial_code,
      }),
    ),
  );
  assert.ok(
    noExamplesMissionText.includes("EXPECTED RETURN VALUE (EXAMPLE 01)"),
    "Fallback EXPECTED RETURN VALUE box should render when examples array is empty",
  );

  // Action plan steps should not show false-positive checkmarks when only 1 of 2 tests passes
  const partialTestMissionText = visibleText(
    renderThemed(
      React.createElement(LessonProblemPanel, {
        ...baseProps,
        activeTab: "mission",
        userCode: firstLesson.initial_code,
        testResults: [
          { id: 1, passed: true, expected: "1", actual: "1" },
          { id: 2, passed: false, expected: "2", actual: "0" },
        ],
      }),
    ),
  );
  assert.ok(
    partialTestMissionText.includes("01") && partialTestMissionText.includes("02"),
    "Step numbers should stay un-checked when any test case fails",
  );

  // Algorithms lessons with class Solution wrapper should show the class Solution & self beginner tip
  const algoSolutionText = visibleText(
    renderThemed(
      React.createElement(LessonProblemPanel, {
        ...baseProps,
        activeTrack: "algorithms",
        selectedLesson: {
          ...firstLesson,
          track: "algorithms",
          initial_code: "class Solution:\n    def twoSum(self, nums, target):\n        pass",
        },
        activeTab: "mission",
        userCode: "class Solution:\n    def twoSum(self, nums, target):\n        pass",
      }),
    ),
  );
  assert.ok(
    algoSolutionText.includes("USING CLASS SOLUTION & SELF"),
    "Algorithms lessons with class Solution should explain class Solution and self",
  );

  const practiceHtml = renderThemed(
    React.createElement(LessonProblemPanel, {
      ...baseProps,
      activeTab: "mission",
      activeChallengeIdx: 1,
      userCode: firstLesson.practiceChallenges?.[0]?.initial_code || "",
      onApplyScaffold: () => {},
    }),
  );
  const practiceText = visibleText(practiceHtml);
  assert.ok(practiceText.includes("EXAMPLE 01"));
  assert.ok(
    practiceText.includes("Why:"),
    "Practice drill EXAMPLE 01 should include a Why explanation line",
  );
  assert.ok(
    practiceText.indexOf("EXAMPLE 01") <
      practiceText.indexOf("GUIDED SCAFFOLDING MODE"),
    "Practice stage should show examples before Guided Scaffolding Mode",
  );
  // Core Lesson + Practice stages render distinct custom inline SVG icons
  const stageSvgs = practiceHtml.match(/<svg[\s\S]*?<\/svg>/g) || [];
  assert.ok(new Set(stageSvgs).size >= 4);

  const liveTraceText = visibleText(
    renderThemed(
      React.createElement(VisualLessonPanel, {
        type: "memory",
        data: [{ label: "score", value: "100", type: "int" }],
        userCode: "x = 5\nprint(x)",
        onRunLiveTrace: () => {},
        liveTraceResult: {
          ok: true,
          totalSteps: 2,
          truncated: false,
          driverUsed: "",
          finalStdout: "5",
          frames: [
            {
              stepIndex: 0,
              line: 1,
              codeLine: "x = 5",
              event: "line",
              funcName: "<module>",
              depth: 0,
              callStack: ["<module>"],
              locals: {},
              changedVars: [],
              returnValue: null,
              exception: null,
              stdout: "",
            },
            {
              stepIndex: 1,
              line: 2,
              codeLine: "print(x)",
              event: "line",
              funcName: "<module>",
              depth: 0,
              callStack: ["<module>"],
              locals: { x: { value: "5", type: "int", changed: true } },
              changedVars: ["x"],
              returnValue: null,
              exception: null,
              stdout: "5\n",
            },
          ],
        },
      }),
    ),
  );
  assert.ok(liveTraceText.includes("LIVE EXECUTION TRACE"));
  assert.ok(liveTraceText.includes("CALL STACK"));
  assert.ok(liveTraceText.includes("VARIABLES AT STEP 1"));
});

test("RoadmapReviewCard and SystemDesignLabPanel render spaced review and architecture lab controls", () => {
  const lessons = mergeCurriculumLessons([]);
  const firstLesson = lessons[0];
  const sysLesson = lessons.find((l) => l.track === "system_design");
  assert.ok(firstLesson);
  assert.ok(sysLesson);

  const reviewHtml = renderThemed(
    React.createElement(RoadmapReviewCard, {
      dueItems: [
        {
          lesson: firstLesson,
          entry: {
            lessonId: firstLesson.id,
            intervalDays: 1,
            reps: 1,
            lastReviewedAt: "2026-11-14T00:00:00.000Z",
            nextReviewAt: "2026-11-15",
            weakSignalCount: 1,
            reason: "peeked",
          },
          overdueDays: 0,
          priorityScore: 40,
          isImplicitPeek: false,
        },
      ],
      summary: {
        dueNowCount: 1,
        scheduledCount: 2,
        masteredCount: 1,
        weakCount: 1,
        nextUpcomingDays: 7,
      },
      onStartReview: () => {},
      onFilterDue: () => {},
    }),
  );
  const reviewText = visibleText(reviewHtml);
  assert.ok(reviewText.includes("SPACED REVIEW"));
  assert.ok(reviewText.includes("PEEKED SOLUTION"));
  assert.ok(reviewText.includes("+15 XP"));

  const labText = visibleText(
    renderThemed(
      React.createElement(SystemDesignLabPanel, {
        lesson: sysLesson,
      }),
    ),
  );
  assert.ok(labText.includes("ARCHITECTURE SLA TARGET"));
  assert.ok(labText.includes("AUTO-TUNE SLA"));

  const panelWithLabText = visibleText(
    renderThemed(
      React.createElement(VisualLessonPanel, {
        type: "memory",
        data: [],
        lesson: sysLesson,
      }),
    ),
  );
  assert.ok(panelWithLabText.includes("ARCH LAB"));

  const algoLesson = lessons.find((l) => l.track === "algorithms");
  assert.ok(algoLesson);
  const panelWithBigOText = visibleText(
    renderThemed(
      React.createElement(VisualLessonPanel, {
        type: "hashmap",
        data: [],
        lesson: algoLesson,
        userCode: "for i in nums:\n    for j in nums:\n        pass",
      }),
    ),
  );
  assert.ok(panelWithBigOText.includes("BIG-O RACER"));
  assert.ok(panelWithBigOText.includes("BIG-O PERFORMANCE RACER"));
  assert.ok(panelWithBigOText.includes("YOUR DRAFT: ~O(n²)"));
  assert.ok(panelWithBigOText.includes("START COMPLEXITY RACE"));
});

test("10-level developer rank system enforces wider XP gaps, caps at Level 10, and renders unique profile avatars", () => {
  assert.equal(MAX_DEVELOPER_LEVEL, 10);

  const l1 = getDeveloperRank(0);
  assert.equal(l1.level, 1);
  assert.equal(l1.badge, "LVL 1");
  assert.equal(l1.xpRemaining, 500);
  assert.equal(l1.avatarIcon, "level_avatar_1");
  assert.equal(l1.isMaxLevel, false);

  const almostL2 = getDeveloperRank(499);
  assert.equal(almostL2.level, 1);
  assert.equal(almostL2.xpRemaining, 1);

  const l2 = getDeveloperRank(500);
  assert.equal(l2.level, 2);
  assert.equal(l2.badge, "LVL 2");
  assert.equal(l2.xpForNext, 1000);
  assert.equal(l2.avatarIcon, "level_avatar_2");

  const l8 = getDeveloperRank(21000);
  assert.equal(l8.level, 8);
  assert.equal(l8.avatarIcon, "level_avatar_8");

  const l10 = getDeveloperRank(45000);
  assert.equal(l10.level, 10);
  assert.equal(l10.badge, "LVL 10");
  assert.equal(l10.avatarIcon, "level_avatar_10");
  assert.equal(l10.isMaxLevel, true);
  assert.equal(l10.xpRemaining, 0);
  assert.equal(l10.progressPercent, 100);

  const capped = getDeveloperRank(999999);
  assert.equal(capped.level, 10);
  assert.equal(capped.isMaxLevel, true);

  // Verify ProfileStatsModal & SuccessModal render Level 10 MAX without Level 11 overflow or Roman numerals
  const profileHtml = renderThemed(
    React.createElement(ProfileStatsModal, {
      xpPoints: 52000,
      streakCount: 12,
      isPremium: true,
      lessons: [],
      completedLessons: {},
      onSelectTrack: () => {},
      onOpenAuth: () => {},
      onClose: () => {},
    }),
  );
  const profileText = visibleText(profileHtml);
  assert.ok(profileText.includes("LVL 10 · MAX"));
  assert.ok(profileText.includes("MAX LEVEL 10 REACHED"));
  assert.ok(profileText.includes("COZY PIXEL GARDEN · 12 WEEKS"));
  assert.ok(profileText.includes("12 ACTIVE DAYS"));
  assert.ok(!profileText.includes("LVL 11"));

  for (const xp of [0, 500, 1500, 3000, 5500, 9000, 14000, 21000, 30000, 45000]) {
    const rank = getDeveloperRank(xp);
    const levelProfileText = visibleText(
      renderThemed(
        React.createElement(ProfileStatsModal, {
          xpPoints: xp,
          streakCount: 1,
          isPremium: false,
          lessons: [],
          completedLessons: {},
          onSelectTrack: () => {},
          onOpenAuth: () => {},
          onClose: () => {},
        }),
      ),
    );
    assert.ok(!levelProfileText.includes(rank.tagline));
    assert.ok(!levelProfileText.includes("STUDIO THEME PALETTE"));
  }

  const successHtml = renderThemed(
    React.createElement(SuccessModal, {
      xpEarned: 50,
      totalXp: 45020,
      lessonTitle: "Two Sum",
      hasNextLesson: false,
      onNextLesson: () => {},
      onClose: () => {},
    }),
  );
  const successText = visibleText(successHtml);
  assert.ok(successText.includes("LVL 10 · MAX"));
  assert.ok(successText.includes("MAX LEVEL 10 REACHED"));
  assert.ok(successText.includes("SAVE PNG CARD"));

  const streakModalText = visibleText(
    renderThemed(
      React.createElement(StreakMilestoneModal, {
        milestone: {
          days: 7,
          badge: "7-DAY FLAME",
          title: "Unstoppable Rhythm",
          tagline: "One full week of daily code.",
          icon: "🔥",
          accent: "#FFDE59",
          bonusXp: 150,
        },
        streakCount: 7,
        xpPoints: 650,
        rankTitle: "L2 Loop Wrangler",
        onClose: () => {},
      }),
    ),
  );
  assert.ok(streakModalText.includes("7-DAY STREAK!"));
  assert.ok(streakModalText.includes("SAVE PNG CARD"));

  // Ensure all 10 levels produce unique avatar SVGs in AppHeader
  const headerAvatars = Array.from({ length: 10 }, (_, idx) => {
    const rank = { level: idx + 1, title: `Rank ${idx + 1}` };
    const html = renderThemed(
      React.createElement(AppHeader, {
        viewMode: "roadmap",
        onChangeViewMode: () => {},
        isCompactHeader: false,
        pyodideReady: true,
        themeMode: "dark",
        onToggleTheme: () => {},
        devRank: rank,
        streakCount: 1,
        isPremium: false,
        session: null,
        onOpenProfile: () => {},
        onOpenPaywall: () => {},
        onOpenAuth: () => {},
        onSignOut: () => {},
      }),
    );
    assert.ok(visibleText(html).includes(`LVL ${idx + 1}`));
    assert.ok(!visibleText(html).includes(`LVL 0${idx + 1}`));
    return html.match(/viewBox="0 0 64 64"[\s\S]*?<\/svg>/)?.[0];
  });
  assert.equal(new Set(headerAvatars.filter(Boolean)).size, 10);
});

test("StudioErrorBoundary recovers cleanly and split StudioIcon dictionaries render all icon groups", () => {
  const normalText = visibleText(
    renderThemed(
      React.createElement(
        StudioErrorBoundary,
        null,
        React.createElement("div", null, "STUDIO OK"),
      ),
    ),
  );
  assert.ok(normalText.includes("STUDIO OK"));

  const derivedState = StudioErrorBoundary.getDerivedStateFromError(
    new Error("Circuit tripped"),
  );
  assert.equal(derivedState.hasError, true);
  assert.equal(derivedState.error.message, "Circuit tripped");

  let resetCalled = false;
  const boundary = new StudioErrorBoundary({
    children: React.createElement("div", null, "OK"),
    fallbackTitle: "Arena tripped",
    onReset: () => {
      resetCalled = true;
    },
  });
  boundary.state = derivedState;
  const fallbackHtml = renderThemed(boundary.render());
  const fallbackText = visibleText(fallbackHtml);
  assert.ok(fallbackText.includes("SYSTEM INTERRUPT // RECOVERABLE"));
  assert.ok(fallbackText.includes("Arena tripped"));
  assert.ok(fallbackText.includes("Circuit tripped"));
  assert.ok(fallbackText.includes("RECOVER STUDIO"));

  boundary.setState = (next) => {
    boundary.state = { ...boundary.state, ...next };
  };
  boundary.handleRecover();
  assert.equal(boundary.state.hasError, false);
  assert.equal(boundary.state.error, null);
  assert.equal(resetCalled, true);

  for (const iconName of [
    "crown",
    "devlearn_logo",
    "crt_ch_lofi",
    "level_avatar_8",
    "daily_quest",
  ]) {
    const iconHtml = renderThemed(
      React.createElement(StudioIcon, { name: iconName, size: 24 }),
    );
    assert.ok(
      iconHtml.includes("<svg"),
      `Expected SVG output for split icon ${iconName}`,
    );
  }
});

test("Auth renders password reset, OAuth providers, recovery update, and top-right close button cleanly", () => {
  const signInText = visibleText(
    renderThemed(
      React.createElement(Auth, {
        defaultMode: "signin",
        guestXp: 350,
        guestSolvedCount: 5,
        onClose: () => {},
      }),
    ),
  );
  assert.ok(signInText.includes("Welcome Back"));
  assert.ok(signInText.includes("✕"));
  assert.ok(!signInText.includes("CLOUD SYNC ·"));
  assert.ok(!signInText.includes("higher progress is always kept"));
  assert.ok(signInText.includes("Forgot password?"));
  assert.ok(signInText.includes("GitHub"));
  assert.ok(signInText.includes("Google"));

  const forgotText = visibleText(
    renderThemed(
      React.createElement(Auth, {
        defaultMode: "forgot",
      }),
    ),
  );
  assert.ok(forgotText.includes("Reset Your Password"));
  assert.ok(forgotText.includes("Send Reset Link"));
  assert.ok(forgotText.includes("Back to Sign In"));
  assert.ok(!forgotText.includes("GitHub"));

  const recoveryText = visibleText(
    renderThemed(
      React.createElement(Auth, {
        defaultMode: "update_password",
      }),
    ),
  );
  assert.ok(recoveryText.includes("Choose a New Password"));
  assert.ok(recoveryText.includes("Update Password"));
});

test("ByteCat quotes catalog has unique IDs, no duplicate quotes, and ByteCatGuideCard renders quote without top badge/counter strip", () => {
  const { BYTE_CAT_QUOTES } = loadTsModule("src/constants/byteCatData.ts");
  assert.equal(BYTE_CAT_QUOTES.length, 50);

  const ids = new Set();
  const normalizedQuotes = new Set();
  for (const item of BYTE_CAT_QUOTES) {
    assert.ok(item.id > 0 && !ids.has(item.id), `Duplicate or invalid id: ${item.id}`);
    ids.add(item.id);
    const norm = item.quote.trim().toLowerCase();
    assert.ok(norm.length > 0 && !normalizedQuotes.has(norm), `Duplicate or empty quote: ${item.quote}`);
    normalizedQuotes.add(norm);
    assert.ok(item.author.trim().length > 0, `Missing author on quote ${item.id}`);
    assert.ok(item.moodBadge.trim().length > 0, `Missing moodBadge on quote ${item.id}`);
    assert.match(item.accentBg, /^#[0-9A-Fa-f]{6}$/, `Invalid accentBg on quote ${item.id}`);
  }

  const { getTodayDateKey } = loadTsModule("src/constants/streaks.ts");
  const { default: ByteCatGuideCard } = loadTsModule("src/components/ByteCatGuideCard.tsx");
  const todayKey = getTodayDateKey();
  const cardText = visibleText(
    renderThemed(
      React.createElement(ByteCatGuideCard, {
        completedCount: 3,
        totalCount: 20,
        activeTrack: "python_basics",
        activeTrackLabel: "PYTHON BASICS",
        streakCount: 3,
        lastActiveDate: todayKey,
      }),
    ),
  );
  assert.ok(cardText.includes(BYTE_CAT_QUOTES[0].quote));
  assert.ok(cardText.includes(BYTE_CAT_QUOTES[0].author));
  assert.ok(cardText.includes("♪") && cardText.includes("♫"));
  assert.ok(cardText.includes("3D STREAK"));
  assert.ok(cardText.includes("STYLE"));
  assert.ok(cardText.includes("25:00"));
  assert.ok(cardText.includes("5m TEA"));
  assert.ok(!cardText.includes("#01/50"));
  assert.ok(!cardText.includes("STRATEGIC PAWS"));
});

test("RoadmapDailyQuestCard renders 3-step daily quest, claim button at 3/3, and claimed state", () => {
  const { default: RoadmapDailyQuestCard } = loadTsModule(
    "src/components/RoadmapDailyQuestCard.tsx",
  );
  const partialText = visibleText(
    renderThemed(
      React.createElement(RoadmapDailyQuestCard, {
        initialQuestState: {
          dateKey: "2026-11-19",
          steps: { lesson: true, bughunt: false, blitz: false },
          claimed: false,
        },
      }),
    ),
  );
  assert.ok(partialText.includes("5-MIN QUEST · 1/3"));
  assert.ok(partialText.includes("Clear 1 Lesson or Drill"));
  assert.ok(partialText.includes("Squash 1 Bug"));
  assert.ok(partialText.includes("Play 60s Blitz"));
  assert.ok(partialText.includes("REWARD: +75 XP"));

  const readyText = visibleText(
    renderThemed(
      React.createElement(RoadmapDailyQuestCard, {
        initialQuestState: {
          dateKey: "2026-11-19",
          steps: { lesson: true, bughunt: true, blitz: true },
          claimed: false,
        },
      }),
    ),
  );
  assert.ok(readyText.includes("CLAIM +75 XP"));

  const claimedText = visibleText(
    renderThemed(
      React.createElement(RoadmapDailyQuestCard, {
        initialQuestState: {
          dateKey: "2026-11-19",
          steps: { lesson: true, bughunt: true, blitz: true },
          claimed: true,
        },
      }),
    ),
  );
  assert.ok(claimedText.includes("DAILY QUEST CLEARED"));
  assert.ok(claimedText.includes("+75 XP CLAIMED"));
  assert.ok(claimedText.includes("STEPS"));
  assert.ok(
    !claimedText.includes("Squash 1 Bug"),
    "Claimed daily quest should auto-collapse the 3-step tile row until expanded",
  );
});

test("StudioSettingsModal renders organized 3-tab menu (Appearance, Audio, Studio)", () => {
  const appearanceText = visibleText(
    renderThemed(
      React.createElement(StudioSettingsModal, {
        level: 1,
        isPremium: false,
        initialTab: "appearance",
        onOpenPaywall: () => {},
        onClose: () => {},
      }),
    ),
  );
  assert.ok(appearanceText.includes("STUDIO SETTINGS"));
  assert.ok(appearanceText.includes("APPEARANCE"));
  assert.ok(appearanceText.includes("AUDIO"));
  assert.ok(appearanceText.includes("STUDIO"));
  assert.ok(appearanceText.includes("DISPLAY MODE"));
  assert.ok(appearanceText.includes("DARK MODE"));
  assert.ok(appearanceText.includes("LIGHT MODE"));
  assert.ok(appearanceText.includes("STUDIO THEME PALETTE"));
  assert.ok(appearanceText.includes("Midnight Arcade"));
  assert.ok(appearanceText.includes("Matcha Cozy"));
  assert.ok(appearanceText.includes("Amber CRT"));
  assert.ok(appearanceText.includes("Sakura Terminal"));
  assert.ok(appearanceText.includes("LVL 2"));

  const audioText = visibleText(
    renderThemed(
      React.createElement(StudioSettingsModal, {
        level: 1,
        isPremium: false,
        initialTab: "audio",
        onClose: () => {},
      }),
    ),
  );
  assert.ok(audioText.includes("LO-FI FOCUS RADIO"));
  assert.ok(audioText.includes("AMBIENT DESK MIXER"));
  assert.ok(audioText.includes("Soft Rain"));
  assert.ok(audioText.includes("Cafe Murmur"));
  assert.ok(audioText.includes("Fireplace"));
  assert.ok(audioText.includes("CRT Hum"));
  assert.ok(audioText.includes("Rainy Night"));
  assert.ok(audioText.includes("MECHANICAL KEYCAP TYPING"));
  assert.ok(audioText.includes("THOCK"));
  assert.ok(audioText.includes("CLICK"));
  assert.ok(audioText.includes("Master Sound Effects"));

  const studioText = visibleText(
    renderThemed(
      React.createElement(StudioSettingsModal, {
        level: 1,
        isPremium: false,
        pyodideReady: true,
        initialTab: "studio",
        onClose: () => {},
      }),
    ),
  );
  assert.ok(studioText.includes("DEVELOPER DISPLAY NAME"));
  assert.ok(studioText.includes("PYTHON ENGINE RUNTIME"));

  const proSettingsText = visibleText(
    renderThemed(
      React.createElement(StudioSettingsModal, {
        level: 1,
        isPremium: true,
        onClose: () => {},
      }),
    ),
  );
  assert.ok(proSettingsText.includes("ALL UNLOCKED ★"));
});

test("RoadmapWelcomeCard renders 5-second setup with 3 goals and ByteCatGuideCard personalizes greeting", () => {
  resetOnboardingForTesting();
  const welcomeText = visibleText(
    renderThemed(
      React.createElement(RoadmapWelcomeCard, {
        initialGoalTrack: "python_basics",
        onCompleteWelcome: () => {},
      }),
    ),
  );
  assert.ok(welcomeText.includes("5-SECOND SETUP"));
  assert.ok(welcomeText.includes("Total Beginner"));
  assert.ok(welcomeText.includes("Algorithms"));
  assert.ok(welcomeText.includes("System Design"));
  assert.ok(welcomeText.includes("START TOTAL BEGINNER"));

  completeOnboarding({ displayName: "Alex", goalTrack: "python_basics" });
  const { default: ByteCatGuideCard } = loadTsModule(
    "src/components/ByteCatGuideCard.tsx",
  );
  const personalizedByteCat = visibleText(
    renderThemed(
      React.createElement(ByteCatGuideCard, {
        completedCount: 0,
        totalCount: 20,
        activeTrack: "python_basics",
        activeTrackLabel: "Python Basics",
      }),
    ),
  );
  assert.ok(
    personalizedByteCat.includes("Alex"),
    "ByteCatGuideCard should greet the user by their personalized display name",
  );
  resetOnboardingForTesting();
});

test("RoadmapRetroTv renders Midnight Bubble CRT with VHS slot across all 5 channels", () => {
  assert.equal(RETRO_TV_CHANNELS.length, 5);
  const expectedSnippets = [
    "PYTHON_KERNEL.PY",
    "TELEMETRY.SH",
    "BYTE_CAT.EXE",
    "LOFI_MIXER.SYS",
    "COZY_BREW.MD",
  ];
  for (let ch = 0; ch < 5; ch += 1) {
    const tvText = visibleText(
      renderThemed(
        React.createElement(RoadmapRetroTv, {
          activeTrack: "python_basics",
          trackIconLabel: "PY",
          completedCount: 4,
          totalCount: 20,
          progressPercent: 20,
          nextUpLessonTitle: "Variables",
          initialChannel: ch,
        }),
      ),
    );
    assert.ok(tvText.includes(expectedSnippets[ch]));
    assert.ok(tvText.includes(`CH 0${ch + 1}/05`));
    assert.ok(tvText.includes("VHS"));
    if (ch === 3) {
      assert.ok(
        !tvText.includes("COZY RAIN"),
        "CH 04 should not render COZY RAIN · FLOW subtitle",
      );
    }
  }
});

test("FlashcardsArena renders rapid-recall concept deck controls and flip card cleanly", () => {
  const flashText = visibleText(
    renderThemed(
      React.createElement(FlashcardsArena, {
        isPremium: false,
        onRequirePro: () => {},
        onAwardFlashcardXp: () => {},
        onBackToMap: () => {},
      }),
    ),
  );
  assert.ok(flashText.includes("Flashcards Deck"));
  assert.ok(flashText.includes("PYTHON BASICS"));
  assert.ok(flashText.includes("ALGORITHMS"));
  assert.ok(flashText.includes("SYSTEM DESIGN"));
  assert.ok(flashText.includes("CARD 1 OF 8"));
  assert.ok(flashText.includes("FLIP CARD"));

  const iconHtml = renderThemed(
    React.createElement(StudioIcon, { name: "nav_flashcards", size: 20 }),
  );
  assert.ok(iconHtml.includes("<svg"));
});

test("WeeklyLeaguePanel renders tier ladder, Ghost Rivals, promotion zone, and opt-in CTA", () => {
  const leagueText = visibleText(
    renderThemed(
      React.createElement(WeeklyLeaguePanel, {
        xpPoints: 150,
        streakCount: 4,
        sessionUserId: null,
        onOpenAuth: () => {},
        onNavigateMode: () => {},
      }),
    ),
  );
  assert.ok(leagueText.includes("Spark League"));
  assert.ok(leagueText.includes("TOP 3 WEEKLY PROMOTION ZONE"));
  assert.ok(leagueText.includes("GHOST"));
  assert.ok(leagueText.includes("YOU"));
  assert.ok(leagueText.includes("SIGN IN FOR LIVE BOARD"));
  const leaderboardIconHtml = renderThemed(
    React.createElement(StudioIcon, { name: "nav_leaderboard", size: 20 }),
  );
  assert.ok(leaderboardIconHtml.includes("<svg"));
});

test("ArcadeHub and ArcadeSubNavBar render cozy retro cartridge shelf and quick switcher", () => {
  const hubText = visibleText(
    renderThemed(
      React.createElement(ArcadeHub, {
        xpPoints: 450,
        streakCount: 5,
        solvedIncidents: { "bug-1": true, "bug-2": true },
        isPremium: false,
        onLaunchGame: () => {},
        onBackToMap: () => {},
      }),
    ),
  );
  assert.ok(hubText.includes("Devy Mini-Game Arcade"));
  assert.ok(hubText.includes("2/25 BUGS SQUASHED"));
  assert.ok(hubText.includes("PLAY RANDOM"));
  assert.ok(hubText.includes("Production Bug Hunt"));
  assert.ok(hubText.includes("60s Speed Blitz"));
  assert.ok(hubText.includes("Flashcards Concept Deck"));
  assert.ok(hubText.includes("Output Detective"));
  assert.ok(hubText.includes("Cozy Mini-Builds"));
  assert.ok(hubText.includes("Python Playground"));
  assert.ok(hubText.includes("SANDBOX & BUILDS (2)"));

  const subNavText = visibleText(
    renderThemed(
      React.createElement(ArcadeSubNavBar, {
        activeMode: "blitz",
        onSelectMode: () => {},
      }),
    ),
  );
  assert.ok(subNavText.includes("ARCADE LOBBY"));
  assert.ok(subNavText.includes("BUG HUNT"));
  assert.ok(subNavText.includes("SPEED BLITZ"));
  assert.ok(subNavText.includes("FLASH DECK"));
  assert.ok(subNavText.includes("DETECTIVE"));
  assert.ok(subNavText.includes("MINI-BUILDS"));
  assert.ok(subNavText.includes("PLAYGROUND"));

  const detectiveText = visibleText(
    renderThemed(
      React.createElement(OutputDetectiveArena, {
        isPremium: false,
        onRequirePro: () => {},
        onAwardDetectiveXp: () => {},
        onBackToArcade: () => {},
      }),
    ),
  );
  assert.ok(detectiveText.includes("Output Detective"));
  assert.ok(detectiveText.includes("CASE 1 OF 6"));
  assert.ok(detectiveText.includes("READ & TRACE"));

  const miniBuildsText = visibleText(
    renderThemed(
      React.createElement(MiniBuildsArena, {
        pyodideReady: true,
        isPremium: false,
        onRequirePro: () => {},
        onRunPython: async () => "",
        onVerifyBuild: async () => ({ allPassed: true, results: [], stdout: "" }),
        onAwardBuildXp: () => {},
      }),
    ),
  );
  assert.ok(miniBuildsText.includes("Cozy Mini-Builds"));
  assert.ok(miniBuildsText.includes("PASSWORD METER"));
  assert.ok(miniBuildsText.includes("URL SHORTENER"));
  assert.ok(miniBuildsText.includes("DICE RPG"));
  assert.ok(miniBuildsText.includes("LIVE PREVIEW WIDGET"));

  const arcadeIconHtml = renderThemed(
    React.createElement(StudioIcon, { name: "nav_arcade", size: 20 }),
  );
  assert.ok(arcadeIconHtml.includes("<svg"));
  const detectiveIconHtml = renderThemed(
    React.createElement(StudioIcon, { name: "nav_detective", size: 20 }),
  );
  assert.ok(detectiveIconHtml.includes("<svg"));
  const miniBuildsIconHtml = renderThemed(
    React.createElement(StudioIcon, { name: "nav_minibuilds", size: 20 }),
  );
  assert.ok(miniBuildsIconHtml.includes("<svg"));

  const scratchpadText = visibleText(
    renderThemed(
      React.createElement(PythonScratchpad, {
        pyodideReady: true,
        onRunPython: async () => "ok",
      }),
    ),
  );
  assert.ok(scratchpadText.includes("PLAYGROUND.PY"));
  assert.ok(scratchpadText.includes("ASCII CAT"));
  assert.ok(scratchpadText.includes("DICE SIM"));
  assert.ok(scratchpadText.includes("ALGO BENCH"));
  assert.ok(scratchpadText.includes("RUN PLAYGROUND"));
  assert.ok(scratchpadText.includes("SAVED SNIPPETS"));
});

test("CommandPaletteModal renders quick switcher groups, search box, and keyboard hints", () => {
  const paletteText = visibleText(
    renderThemed(
      React.createElement(CommandPaletteModal, {
        lessons: [
          {
            id: "py-01",
            title: "Variables & Data Types",
            track: "python_basics",
            category: "Foundations",
            description: "Store values cleanly.",
            content: "",
            initial_code: "",
            expected_output: "",
            is_free: true,
            lesson_order: 1,
          },
        ],
        completedLessons: {},
        isPremium: false,
        onExecuteAction: () => {},
        onClose: () => {},
      }),
    ),
  );
  assert.ok(paletteText.includes("NAVIGATION"));
  assert.ok(paletteText.includes("ARCADE"));
  assert.ok(paletteText.includes("AUDIO & FOCUS"));
  assert.ok(paletteText.includes("Python Playground"));
  assert.ok(paletteText.includes("Variables & Data Types"));
  assert.ok(paletteText.includes("NAVIGATE"));
});
