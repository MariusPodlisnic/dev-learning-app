import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const { ThemeProvider } = loadTsModule("src/constants/themeContext.tsx");
const { default: MobileThumbNav } = loadTsModule("src/components/MobileThumbNav.tsx");
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
const { default: SuccessModal } = loadTsModule(
  "src/components/SuccessModal.tsx",
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

test("MobileThumbNav renders all 6 destinations and marks the active mode", () => {
  const freeHtml = renderThemed(
    React.createElement(MobileThumbNav, {
      viewMode: "blitz",
      isPremium: false,
      onChangeViewMode: () => {},
    }),
  );
  const freeText = visibleText(freeHtml);

  for (const label of ["Map", "Studio", "Bugs", "Blitz", "Lab", "Docs"]) {
    assert.ok(freeText.includes(label), `Missing MobileThumbNav label: ${label}`);
  }
  assert.ok(
    freeHtml.includes('aria-label="Speed Blitz" role="button" aria-selected="true"'),
    "Active Speed Blitz tab should carry aria-selected=true",
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
  assert.ok(desktopText.includes("SPEED BLITZ"));
  assert.ok(desktopText.includes("UPGRADE TO PRO"));
  assert.ok(desktopText.includes("ACCOUNT & RANK"));
  assert.ok(desktopText.includes("SETTINGS"));
  assert.ok(
    desktopText.indexOf("ACHIEVEMENTS") < desktopText.indexOf("UPGRADE TO PRO"),
    "Achievements should precede the Pro box in Free mode",
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
    proDesktopText.indexOf("ACHIEVEMENTS") < proDesktopText.indexOf("PRO MEMBER"),
    "Achievements and Pro boxes should keep their order when switching to Pro",
  );
  const headerSvgs = proHeaderHtml.match(/<svg[\s\S]*?<\/svg>/g) || [];
  assert.ok(
    new Set(headerSvgs).size >= 11,
    "Desktop header should render unique custom SVGs for Devy, menu buttons, Account & Rank, Pro Member, and Settings",
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
  assert.ok(missionText.includes("EXPECTED RETURN VALUE (EXAMPLE 01)"));
  assert.equal(missionText.includes("EXPECTED CONSOLE OUTPUT TARGET"), false);
  assert.ok(missionText.includes("NEW TO PYTHON? 3 QUICK RULES FOR THE EDITOR"));
  assert.ok(missionText.includes("GUIDED SCAFFOLDING MODE"));
  assert.ok(missionText.includes("LOAD SKELETON"));
  assert.ok(
    missionText.indexOf("EXAMPLE 01") <
      missionText.indexOf("GUIDED SCAFFOLDING MODE"),
    "Core Mission Brief should show examples before Guided Scaffolding Mode",
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
  assert.ok(!cardText.includes("#01/50"));
  assert.ok(!cardText.includes("STRATEGIC PAWS"));
});
