import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  SCRATCHPAD_TEMPLATES,
  deleteScratchpadSnippet,
  readSavedSnippets,
  readScratchpadDraft,
  resetScratchpadForTesting,
  saveScratchpadSnippet,
  writeScratchpadDraft,
} = loadTsModule("src/utils/scratchpadSnippets.ts");

test("scratchpadSnippets templates all execute cleanly in real python3 with non-empty output", () => {
  assert.equal(SCRATCHPAD_TEMPLATES.length, 5);
  const ids = new Set();

  for (const tpl of SCRATCHPAD_TEMPLATES) {
    assert.ok(!ids.has(tpl.id), `Duplicate template id: ${tpl.id}`);
    ids.add(tpl.id);
    const out = execFileSync("python3", ["-c", tpl.code], {
      encoding: "utf8",
      timeout: 3000,
    }).trim();
    assert.ok(out.length > 0, `Template ${tpl.id} should print non-empty output`);
  }
});

test("scratchpadSnippets persists live draft and manages saved snippets cleanly", () => {
  resetScratchpadForTesting();

  // Default draft loads the Cozy Starter template
  assert.ok(readScratchpadDraft().includes("playground.py"));

  writeScratchpadDraft("print('hello devy')");
  assert.equal(readScratchpadDraft(), "print('hello devy')");

  assert.deepEqual(readSavedSnippets(), []);
  const afterSave = saveScratchpadSnippet({
    title: "My Test Script",
    code: "print(42)",
  });
  assert.equal(afterSave.length, 1);
  assert.equal(afterSave[0].title, "My Test Script");

  // Updating same title overwrites rather than duplicating
  const afterUpdate = saveScratchpadSnippet({
    title: "my test script",
    code: "print(99)",
  });
  assert.equal(afterUpdate.length, 1);
  assert.equal(afterUpdate[0].code, "print(99)");

  // Deleting removes cleanly
  const afterDelete = deleteScratchpadSnippet(afterUpdate[0].id);
  assert.deepEqual(afterDelete, []);

  resetScratchpadForTesting();
});
