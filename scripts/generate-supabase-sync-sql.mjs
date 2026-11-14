#!/usr/bin/env node
/**
 * Generates `supabase_sync_all.sql` directly from the TypeScript curriculum
 * source files (`pythonBasicsLessons.ts`, `pythonBasicsPracticeDrills.ts`,
 * `algorithmsLessons.ts`, `systemDesignLessons.ts`).
 *
 * Usage:
 *   npm run db:sync-sql
 *
 * Re-run this command any time you add or update lessons or practice challenges,
 * then execute `supabase_sync_all.sql` in the Supabase SQL Editor.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ROOT_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const DATA_DIR = path.join(ROOT_DIR, "src", "constants", "curriculumData");
const OUT_FILE = path.join(ROOT_DIR, "supabase_sync_all.sql");

function loadTsModule(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const mod = { exports: {} };
  const fn = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    outputText,
  );
  fn(
    mod.exports,
    (id) => {
      if (id.startsWith(".")) {
        const resolved = path.resolve(path.dirname(filePath), id);
        if (fs.existsSync(resolved + ".ts")) return loadTsModule(resolved + ".ts");
        if (fs.existsSync(resolved)) return loadTsModule(resolved);
      }
      return require(id);
    },
    mod,
    filePath,
    path.dirname(filePath),
  );
  return mod.exports;
}

function sqlDollar(str) {
  const text = String(str ?? "");
  let tag = "dl";
  let n = 0;
  while (text.includes(`$${tag}$`)) {
    n += 1;
    tag = `dl_${n}`;
  }
  return `$${tag}$${text}$${tag}$`;
}

function sqlJsonb(value, fallback = null) {
  if (value === undefined || value === null) {
    return fallback === null ? "NULL" : sqlJsonb(fallback);
  }
  return `${sqlDollar(JSON.stringify(value))}::jsonb`;
}

const pyMod = loadTsModule(path.join(DATA_DIR, "pythonBasicsLessons.ts"));
const pyDrillsMod = loadTsModule(
  path.join(DATA_DIR, "pythonBasicsPracticeDrills.ts"),
);
const algMod = loadTsModule(path.join(DATA_DIR, "algorithmsLessons.ts"));
const algDrillsMod = loadTsModule(
  path.join(DATA_DIR, "algorithmsPracticeDrills.ts"),
);
const sysMod = loadTsModule(path.join(DATA_DIR, "systemDesignLessons.ts"));
const sysDrillsMod = loadTsModule(
  path.join(DATA_DIR, "systemDesignPracticeDrills.ts"),
);
const recapMod = loadTsModule(path.join(DATA_DIR, "chapterRecapLessons.ts"));

const pyLessons = (pyMod.PYTHON_BASICS_EXPANSION_LESSONS || []).map((l) => ({
  ...l,
  slug: l.id,
  practice_challenges:
    (pyDrillsMod.PYTHON_BASICS_PRACTICE_DRILLS || {})[l.lesson_order] || [],
}));

const algLessons = (algMod.ALGORITHMS_EXPANSION_LESSONS || []).map((l) => ({
  ...l,
  slug: l.id,
  practice_challenges:
    l.practiceChallenges ||
    (algDrillsMod.ALGORITHMS_PRACTICE_DRILLS || {})[l.lesson_order] ||
    [],
}));

const sysLessons = (sysMod.SYSTEM_DESIGN_EXPANSION_LESSONS || []).map((l) => ({
  ...l,
  slug: l.id,
  practice_challenges:
    l.practiceChallenges ||
    (sysDrillsMod.SYSTEM_DESIGN_PRACTICE_DRILLS || {})[l.lesson_order] ||
    [],
}));

const recapLessons = (recapMod.CHAPTER_RECAP_LESSONS || []).map((l) => ({
  ...l,
  slug: l.id,
  practice_challenges: l.practiceChallenges || [],
}));

const allExportedLessons = [
  ...pyLessons,
  ...algLessons,
  ...sysLessons,
  ...recapLessons,
];

const proBaseDrillsMappings = [];
for (let order = 1; order <= 8; order += 1) {
  const algDrills = (algDrillsMod.ALGORITHMS_PRACTICE_DRILLS || {})[order];
  if (algDrills && algDrills.length > 0) {
    proBaseDrillsMappings.push(
      `  UPDATE public.lessons SET practice_challenges = ${sqlJsonb(algDrills, [])} WHERE track = 'algorithms' AND lesson_order = ${order};`,
    );
  }
  const sysDrills = (sysDrillsMod.SYSTEM_DESIGN_PRACTICE_DRILLS || {})[order];
  if (sysDrills && sysDrills.length > 0) {
    proBaseDrillsMappings.push(
      `  UPDATE public.lessons SET practice_challenges = ${sqlJsonb(sysDrills, [])} WHERE track = 'system_design' AND lesson_order = ${order};`,
    );
  }
}

const slugSyncMappings = allExportedLessons.map((l) => {
  return `  UPDATE public.lessons
    SET slug = ${sqlDollar(l.slug)}
    WHERE id = (
      SELECT id FROM public.lessons
      WHERE track = ${sqlDollar(l.track)}
        AND lesson_order = ${Number(l.lesson_order)}
        AND (slug IS NULL OR slug = '')
      ORDER BY id
      LIMIT 1
    )
    AND NOT EXISTS (SELECT 1 FROM public.lessons WHERE slug = ${sqlDollar(l.slug)});`;
});

const lessonRowsSql = allExportedLessons
  .map((l) => {
    return `(
  ${sqlDollar(l.slug)},
  ${sqlDollar(l.title)},
  ${sqlDollar(l.track)},
  ${sqlDollar(l.category || "")},
  ${sqlDollar(l.difficulty || "Easy")},
  ${Number(l.tree_row || l.lesson_order || 1)},
  ${sqlDollar(l.description || "")},
  ${sqlDollar(l.content || "")},
  ${sqlDollar(l.assignment || "")},
  ${sqlDollar((l.initial_code || "").replace(/\\n/g, "\n"))},
  ${sqlDollar(l.expected_output || "")},
  ${sqlDollar(l.hidden_tests || "")},
  ${sqlJsonb(l.examples || [], [])},
  ${sqlJsonb(l.constraints || [], [])},
  ${sqlJsonb(l.complexities || {}, {})},
  ${Boolean(l.is_free)},
  ${Number(l.lesson_order)},
  ${sqlDollar(l.visual_type || "memory")},
  ${sqlJsonb(l.visual_data || [], [])},
  ${sqlJsonb(l.hints || [], [])},
  ${sqlJsonb(l.practice_challenges || [], [])},
  ${Boolean(l.is_recap)},
  ${l.recap_chapter ? Number(l.recap_chapter) : "NULL"},
  ${sqlJsonb(l.recap_topics || [], [])}
)`;
  })
  .join(",\n");

const sqlOutput = `-- ============================================================================
-- DevLearn Arcade — Full Schema & Curriculum Sync (Generated)
-- Generated at: ${new Date().toISOString()}
-- Total synced curriculum modules: ${allExportedLessons.length}
--
-- Run this idempotent script in: Supabase Dashboard -> SQL Editor -> Run
-- Safe to re-run whenever new lessons or practice drills are added!
-- ============================================================================

-- 1. Upgrade profiles table with full JSONB cloud progress snapshot
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS progress_state jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Upgrade lessons table with canonical slug + multi-stage practice_challenges
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS tree_row integer,
  ADD COLUMN IF NOT EXISTS assignment text,
  ADD COLUMN IF NOT EXISTS hidden_tests text,
  ADD COLUMN IF NOT EXISTS examples jsonb,
  ADD COLUMN IF NOT EXISTS constraints jsonb,
  ADD COLUMN IF NOT EXISTS complexities jsonb,
  ADD COLUMN IF NOT EXISTS visual_type text,
  ADD COLUMN IF NOT EXISTS visual_data jsonb,
  ADD COLUMN IF NOT EXISTS hints jsonb,
  ADD COLUMN IF NOT EXISTS practice_challenges jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_recap boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recap_chapter integer,
  ADD COLUMN IF NOT EXISTS recap_topics jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS lessons_slug_uidx
  ON public.lessons (slug);

-- 3. Create unified relational progress table (works for UUID, exp-*, stage, bug, chapter keys)
CREATE TABLE IF NOT EXISTS public.user_curriculum_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('lesson', 'stage', 'bug_incident', 'chapter')),
  lesson_id text,
  completed boolean NOT NULL DEFAULT false,
  peeked_solution boolean NOT NULL DEFAULT false,
  stars smallint,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_key)
);

CREATE INDEX IF NOT EXISTS idx_user_curriculum_progress_user_type
  ON public.user_curriculum_progress (user_id, item_type);

ALTER TABLE public.user_curriculum_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own curriculum progress" ON public.user_curriculum_progress;
CREATE POLICY "Users read own curriculum progress"
  ON public.user_curriculum_progress
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own curriculum progress" ON public.user_curriculum_progress;
CREATE POLICY "Users insert own curriculum progress"
  ON public.user_curriculum_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own curriculum progress" ON public.user_curriculum_progress;
CREATE POLICY "Users update own curriculum progress"
  ON public.user_curriculum_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own curriculum progress" ON public.user_curriculum_progress;
CREATE POLICY "Users delete own curriculum progress"
  ON public.user_curriculum_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Tag existing DB rows with canonical slugs & attach Pro drills to base rows (1..8)
DO $$
BEGIN
${slugSyncMappings.join("\n")}
${proBaseDrillsMappings.join("\n")}
END $$;

-- 5. Idempotently upsert all ${allExportedLessons.length} curriculum modules & multi-stage practice drills
INSERT INTO public.lessons (
  slug,
  title,
  track,
  category,
  difficulty,
  tree_row,
  description,
  content,
  assignment,
  initial_code,
  expected_output,
  hidden_tests,
  examples,
  constraints,
  complexities,
  is_free,
  lesson_order,
  visual_type,
  visual_data,
  hints,
  practice_challenges,
  is_recap,
  recap_chapter,
  recap_topics
) VALUES
${lessonRowsSql}
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  track = EXCLUDED.track,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  tree_row = EXCLUDED.tree_row,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  assignment = EXCLUDED.assignment,
  initial_code = EXCLUDED.initial_code,
  expected_output = EXCLUDED.expected_output,
  hidden_tests = EXCLUDED.hidden_tests,
  examples = EXCLUDED.examples,
  constraints = EXCLUDED.constraints,
  complexities = EXCLUDED.complexities,
  is_free = EXCLUDED.is_free,
  lesson_order = EXCLUDED.lesson_order,
  visual_type = EXCLUDED.visual_type,
  visual_data = EXCLUDED.visual_data,
  hints = EXCLUDED.hints,
  practice_challenges = EXCLUDED.practice_challenges,
  is_recap = EXCLUDED.is_recap,
  recap_chapter = EXCLUDED.recap_chapter,
  recap_topics = EXCLUDED.recap_topics;
`;

fs.writeFileSync(OUT_FILE, sqlOutput, "utf8");
console.log(
  `Generated ${path.relative(ROOT_DIR, OUT_FILE)} with ${allExportedLessons.length} curriculum modules (${pyLessons.length} python_basics, ${algLessons.length} algorithms, ${sysLessons.length} system_design, ${recapLessons.length} chapter_recaps).`,
);
