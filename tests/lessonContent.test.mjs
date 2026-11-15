import assert from "node:assert/strict";
import test from "node:test";
import { buildOrganizedLearnView } from "../src/utils/lessonContent.ts";

test("buildOrganizedLearnView separates fenced code from prose and picks one example", () => {
  const content = [
    "Lists keep items in order:",
    "",
    "```python",
    "items = [1, 2, 3]",
    "print(items[0])",
    "```",
  ].join("\n");

  const view = buildOrganizedLearnView(content, {
    realWorldUse: "Store queues and playlists.",
    analogyTitle: "Row of Lockers",
    analogyText: "Each slot has an index.",
    cheatSheet: "other = [9, 8]",
    quiz: {
      question: "First index?",
      options: ["0", "1"],
      correctIndex: 0,
      explanation: "Zero-indexed.",
    },
  });

  assert.equal(view.explanationText, "Lists keep items in order.");
  assert.equal(view.singleExampleCode, "items = [1, 2, 3]\nprint(items[0])");
  assert.equal(view.cheatSheetCode, "other = [9, 8]");
  assert.equal(view.realWorldUse, "Store queues and playlists.");
});

test("buildOrganizedLearnView falls back to cheatSheet when lesson content has prose only", () => {
  const view = buildOrganizedLearnView(
    "Use a dictionary for instant O(1) key lookup.",
    {
      realWorldUse: "User session cache.",
      analogyTitle: "Phonebook",
      analogyText: "Look up by name.",
      cheatSheet: "seen = {}\nseen['k'] = 1",
      quiz: {
        question: "Lookup speed?",
        options: ["O(1)", "O(n)"],
        correctIndex: 0,
        explanation: "Hashing gives O(1) average lookup.",
      },
    },
  );

  assert.equal(
    view.explanationText,
    "Use a dictionary for instant O(1) key lookup.",
  );
  assert.equal(view.singleExampleCode, "seen = {}\nseen['k'] = 1");
});
