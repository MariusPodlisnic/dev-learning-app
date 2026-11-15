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
const { getLessonEnrichment, mergeCurriculumLessons } = loadTsModule(
  "src/constants/curriculum.ts",
);
const { renderHighlightedPython } = loadTsModule(
  "src/components/FormattedText.tsx",
);
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

  const desktopText = visibleText(
    renderThemed(
      React.createElement(AppHeader, { ...baseProps, isCompactHeader: false }),
    ),
  );
  assert.ok(desktopText.includes("SKILL MAP"));
  assert.ok(desktopText.includes("SPEED BLITZ"));
  assert.ok(desktopText.includes("UPGRADE TO PRO"));

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

test("StudioCodeEditor renders editor chrome, quick inserts, scratchpad toggle, and assertion diff", () => {
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
  assert.ok(editorText.includes("EVAL"));
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
});
