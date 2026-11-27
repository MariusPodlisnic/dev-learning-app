import { ALGORITHMS_ENRICHMENTS } from "./curriculumData/algorithmsEnrichments";
import { ALGORITHMS_EXPANSION_LESSONS } from "./curriculumData/algorithmsLessons";
import { ALGORITHMS_PRACTICE_DRILLS } from "./curriculumData/algorithmsPracticeDrills";
import { getCurriculumLessonSortKey } from "./certificates";
import { CHAPTER_RECAP_ENRICHMENTS } from "./curriculumData/chapterRecapEnrichments";
import { CHAPTER_RECAP_LESSONS } from "./curriculumData/chapterRecapLessons";
import { PYTHON_BASICS_ENRICHMENTS } from "./curriculumData/pythonBasicsEnrichments";
import { PYTHON_BASICS_EXPANSION_LESSONS } from "./curriculumData/pythonBasicsLessons";
import { PYTHON_BASICS_PRACTICE_DRILLS } from "./curriculumData/pythonBasicsPracticeDrills";
import { SYSTEM_DESIGN_ENRICHMENTS } from "./curriculumData/systemDesignEnrichments";
import { SYSTEM_DESIGN_EXPANSION_LESSONS } from "./curriculumData/systemDesignLessons";
import { SYSTEM_DESIGN_PRACTICE_DRILLS } from "./curriculumData/systemDesignPracticeDrills";
import {
  CommonPitfall,
  EnrichedLessonData,
  LessonEnrichment,
  LessonQuiz,
} from "./curriculumData/types";

export type {
  CommonPitfall,
  EnrichedLessonData,
  LessonEnrichment,
  LessonQuiz,
};

export const LESSON_ENRICHMENTS: EnrichedLessonData[] = [
  ...PYTHON_BASICS_ENRICHMENTS,
  ...ALGORITHMS_ENRICHMENTS,
  ...SYSTEM_DESIGN_ENRICHMENTS,
  ...CHAPTER_RECAP_ENRICHMENTS,
];

export const EXPANSION_LESSONS = [
  ...PYTHON_BASICS_EXPANSION_LESSONS,
  ...ALGORITHMS_EXPANSION_LESSONS,
  ...SYSTEM_DESIGN_EXPANSION_LESSONS,
  ...CHAPTER_RECAP_LESSONS,
];

function attachDefaultPitfallAndGuided(
  item: LessonEnrichment,
  track: "python_basics" | "algorithms" | "system_design",
  initialCode?: string,
): LessonEnrichment {
  const defaultPitfall: CommonPitfall =
    track === "algorithms"
      ? {
          title: "Returning inside the loop on the first step by mistake",
          wrongCode:
            "for x in nums:\n    return x  # Stops after checking only 1 item!",
          rightCode:
            "for x in nums:\n    if matches(x): return x\nreturn default",
          explanation:
            "Make sure your fallback `return` is unindented outside the `for` loop so every item gets checked!",
        }
      : track === "system_design"
        ? {
            title: "Forgetting fallback values when a server or key is missing",
            wrongCode:
              "return servers[key]  # Crashes with KeyError if missing!",
            rightCode: 'return servers.get(key, "fallback")',
            explanation:
              "Reliable cloud code always provides a safe fallback value.",
          }
        : {
            title: "Confusing '=' (save value) with '==' (compare values)",
            wrongCode: "if score = 100   # SyntaxError!",
            rightCode: "if score == 100: # Uses '==' and ends with ':'",
            explanation:
              "Use `=` to store a value in a variable, `==` to compare two values, and end `if`/`for`/`def` lines with `:`!",
          };

  const cleanStarter = (initialCode || "").replace(/\\n/g, "\n").trim();
  const defaultGuided =
    item.guidedCode ||
    (cleanStarter
      ? `${cleanStarter}\n\n# 💡 HELPFUL EXAMPLE:\n${item.cheatSheet
          .split("\n")
          .map((l) => (l.startsWith("#") ? l : `#   ${l}`))
          .join("\n")}`
      : item.cheatSheet);

  return {
    ...item,
    commonPitfall: item.commonPitfall || defaultPitfall,
    guidedCode: defaultGuided,
  };
}

export function getLessonEnrichment(lesson: {
  title?: string;
  track?: string;
  lesson_order?: number;
  initial_code?: string;
}): LessonEnrichment {
  const titleLower = (lesson.title || "").toLowerCase();
  const track = (lesson.track || "python_basics") as
    | "python_basics"
    | "algorithms"
    | "system_design";

  if (lesson.lesson_order !== undefined) {
    const byOrder = LESSON_ENRICHMENTS.find(
      (item) =>
        item.matchTrack === track && item.matchOrder === lesson.lesson_order,
    );
    if (byOrder) {
      return attachDefaultPitfallAndGuided(byOrder, track, lesson.initial_code);
    }
  }

  const byKeyword = LESSON_ENRICHMENTS.find(
    (item) =>
      item.matchTrack === track &&
      item.matchKeywords.some((kw) => titleLower.includes(kw)),
  );
  if (byKeyword) {
    return attachDefaultPitfallAndGuided(byKeyword, track, lesson.initial_code);
  }

  return attachDefaultPitfallAndGuided(
    {
      realWorldUse:
        "Core Python building block used in web apps, games, automation, and AI.",
      analogyTitle: "Step-by-Step Recipe Instructions",
      analogyText:
        "Python reads your code from top to bottom, just like following a simple recipe:\n\n1. **Read** the input values.\n2. **Update or check** them in 1–2 lines.\n3. **`return` or `print()`** the answer.",
      cheatSheet: `# Simple Python Function Pattern:
def solve(value):
    return value`,
      quiz: {
        question:
          "How does Python know which lines belong inside a block (like `if`, `for`, or `def`)?",
        options: [
          "By indentation (4 spaces at the start of the line)",
          "By wrapping everything in curly braces { }",
          "By writing END at the bottom",
        ],
        correctIndex: 0,
        explanation:
          "Python uses clean 4-space indentation to group lines inside functions, loops, and if-statements!",
      },
    },
    track,
    lesson.initial_code,
  );
}

const TWO_SUM_SANITIZED_PATCH = {
  title: "Two Sum",
  category: "HASH MAPS",
  difficulty: "Easy",
  tree_row: 1,
  is_free: true,
  description:
    "Find the indices of two numbers in an array that add up to a specific target in O(n) time.",
  content:
    "Given an array of integers `nums` and an integer `target`, find the two indices whose values add up to `target`.\n\nA brute-force double loop checks every pair in **O(n²)** time. Instead, walk through the list once with a dictionary `seen = {}` that remembers each visited value's index:\n\n```python\n# Sibling pattern: find two item prices adding up to a gift card\nseen_index = {}\nfor idx, price in enumerate(prices):\n    complement = gift_card - price\n    if complement in seen_index:\n        print([seen_index[complement], idx])\n    seen_index[price] = idx\n```\n\nChecking `if complement in seen_index:` takes **O(1)** instant hash-table lookup time!",
  assignment:
    "Implement `twoSum(self, nums, target)` inside the `Solution` class to return `[index1, index2]` of the two numbers that add up to `target`.",
  expected_output: "[0, 1]",
  complexities: { time: "O(n)", space: "O(n)" },
  examples: [
    {
      input: "nums = [2, 7, 11, 15], target = 9",
      output: "[0, 1]",
      explanation: "nums[0] + nums[1] == 2 + 7 == 9, so return [0, 1].",
    },
    {
      input: "nums = [3, 2, 4], target = 6",
      output: "[1, 2]",
      explanation: "nums[1] + nums[2] == 2 + 4 == 6, so return [1, 2].",
    },
  ],
  constraints: [
    "Store visited numbers and their indices in a dictionary `seen = {}`",
    "Compute `needed = target - num` before inserting `seen[num] = i` so the same index isn't reused",
    "Return `[seen[needed], i]` as soon as a match is found",
  ],
  visual_type: "hashmap",
  visual_data: [
    {
      label: "i=0 | num=2",
      value: "need 7 -> store seen[2] = 0",
      address: "0x7F9E0",
    },
    {
      label: "i=1 | num=7",
      value: "need 2 -> HIT seen[2] = 0!",
      address: "0x7F9E4",
    },
    {
      label: "result",
      value: "return [0, 1] ✓ (2 + 7 = 9)",
      address: "O(n) / O(1)",
    },
  ],
  hints: [
    "Create an empty dictionary `seen = {}` before your `for i, num in enumerate(nums):` loop.",
    "Inside the loop, calculate `needed = target - num` and check `if needed in seen:`.",
    "If found, `return [seen[needed], i]`. Otherwise record `seen[num] = i`.",
  ],
  initial_code: `class Solution:
    def twoSum(self, nums, target):
        pass`,
  hidden_tests: `import json
def __run_tests__():
    try:
        sol = Solution()
        cases = [
            (([2, 7, 11, 15], 9), [0, 1]),
            (([3, 2, 4], 6), [1, 2]),
            (([3, 3], 6), [0, 1]),
        ]
        results = []
        all_passed = True
        for i, ((nums, target), exp) in enumerate(cases):
            actual = sol.twoSum(nums[:], target)
            passed = actual == exp
            if not passed:
                all_passed = False
            results.append({
                "id": i + 1,
                "input": f"nums={nums}, target={target}",
                "expected": str(exp),
                "actual": str(actual),
                "passed": passed,
            })
        return json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
    except Exception as e:
        return json.dumps({"is_test_suite": True, "error": str(e)})
__run_tests__()`,
};

function stripTrailingCommentOutsideStrings(line: string): string {
  let quote: '"' | "'" | null = null;
  let escaped = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote) {
      if (ch === "\\") escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "#") {
      return line.slice(0, i).trimEnd();
    }
  }
  return line.trimEnd();
}

function measureParenBalance(text: string): number {
  let balance = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote) {
      if (ch === "\\") escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(" || ch === "[" || ch === "{") balance += 1;
    else if (ch === ")" || ch === "]" || ch === "}") balance -= 1;
  }
  return balance;
}

/**
 * Strip starter boilerplate down to just the function/class signature(s) and `pass`
 * so learners write solutions without pre-filled comments, hints, or sample calls.
 */
export function minimizeStarterCode(rawCode?: string): string {
  if (!rawCode) return "";
  const normalized = rawCode.replace(/\\n/g, "\n").replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const out: string[] = [];
  let inClass = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const noComment = stripTrailingCommentOutsideStrings(line);
    const trimmed = noComment.trim();
    const indentLen = (line.match(/^(\s*)/)?.[1] || "").length;

    if (/^class\s+[A-Za-z_][A-Za-z0-9_]*\b/.test(trimmed)) {
      let header = trimmed;
      let balance = measureParenBalance(header);
      while (i + 1 < lines.length && (!header.endsWith(":") || balance > 0)) {
        i += 1;
        const nextPart = stripTrailingCommentOutsideStrings(lines[i]).trim();
        if (nextPart) {
          header = `${header} ${nextPart}`;
          balance = measureParenBalance(header);
        }
      }
      if (header.endsWith(":")) {
        if (out.length > 0) out.push("");
        out.push(header);
        inClass = true;
      }
    } else if (/^(?:async\s+)?def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(trimmed)) {
      let header = trimmed;
      let balance = measureParenBalance(header);
      while (i + 1 < lines.length && (!header.endsWith(":") || balance > 0)) {
        i += 1;
        const nextPart = stripTrailingCommentOutsideStrings(lines[i]).trim();
        if (nextPart) {
          header = `${header} ${nextPart}`;
          balance = measureParenBalance(header);
        }
      }
      if (header.endsWith(":")) {
        if (inClass && indentLen > 0) {
          out.push(`    ${header}`);
          out.push("        pass");
        } else {
          inClass = false;
          if (out.length > 0) out.push("");
          out.push(header);
          out.push("    pass");
        }
      }
    }
    i += 1;
  }

  return out.length > 0 ? out.join("\n") : normalized;
}

const ORPHANED_DUPLICATE_LESSON_IDS = new Set([
  "ff06e344-6648-49a3-80a6-22b34f2faee3",
]);

export function mergeCurriculumLessons<
  T extends {
    id: string;
    slug?: string;
    track: string;
    lesson_order: number;
    title: string;
    initial_code?: string;
    practiceChallenges?: any[];
    practice_challenges?: any[];
  },
>(dbLessons: T[]): T[] {
  const seenTrackOrders = new Set<string>();
  const merged: T[] = [];

  for (const row of dbLessons) {
    if (ORPHANED_DUPLICATE_LESSON_IDS.has(row.id)) continue;
    const key = `${row.track}:${row.lesson_order}`;
    if (seenTrackOrders.has(key)) continue;
    seenTrackOrders.add(key);

    const rawDbPracticeChallenges = Array.isArray(row.practiceChallenges)
      ? row.practiceChallenges
      : Array.isArray(row.practice_challenges)
        ? row.practice_challenges
        : undefined;
    const dbPracticeChallenges = rawDbPracticeChallenges?.map((ch) =>
      ch && typeof ch === "object" && typeof ch.initial_code === "string"
        ? { ...ch, initial_code: minimizeStarterCode(ch.initial_code) }
        : ch,
    );

    if (row.track === "algorithms" && row.lesson_order === 1) {
      merged.push({
        ...row,
        ...TWO_SUM_SANITIZED_PATCH,
        slug: row.slug || "exp-alg-01",
        ...(dbPracticeChallenges ? { practiceChallenges: dbPracticeChallenges } : {}),
      } as T);
      continue;
    }

    merged.push({
      ...row,
      ...(typeof row.initial_code === "string"
        ? { initial_code: minimizeStarterCode(row.initial_code) }
        : {}),
      slug: row.slug || `${row.track}:${row.lesson_order}`,
      ...(dbPracticeChallenges ? { practiceChallenges: dbPracticeChallenges } : {}),
    });
  }

  for (const exp of EXPANSION_LESSONS) {
    let existingIdx = merged.findIndex(
      (item) =>
        item.id === exp.id ||
        item.slug === exp.id ||
        (item.track === exp.track &&
          item.title.toLowerCase() === exp.title.toLowerCase()),
    );
    if (existingIdx === -1) {
      existingIdx = merged.findIndex(
        (item) =>
          item.track === exp.track &&
          item.lesson_order === exp.lesson_order &&
          !item.id.startsWith("exp-") &&
          !item.slug?.startsWith("exp-"),
      );
    }
    if (existingIdx === -1) {
      merged.push({
        ...exp,
        slug: exp.id,
      } as unknown as T);
    } else {
      // Upgrade older DB rows with rich local curriculum while keeping DB id & any DB practice challenges.
      const existing = merged[existingIdx];
      const existingChallenges = existing.practiceChallenges;
      merged[existingIdx] = {
        ...exp,
        id: existing.id,
        slug: existing.slug || exp.id,
        ...(existingChallenges && existingChallenges.length > 0
          ? { practiceChallenges: existingChallenges }
          : {}),
      } as unknown as T;
    }
  }

  const drillsByTrack: Record<string, typeof PYTHON_BASICS_PRACTICE_DRILLS> = {
    python_basics: PYTHON_BASICS_PRACTICE_DRILLS,
    algorithms: ALGORITHMS_PRACTICE_DRILLS,
    system_design: SYSTEM_DESIGN_PRACTICE_DRILLS,
  };

  for (let i = 0; i < merged.length; i++) {
    const item = merged[i];
    if ((item as any).is_recap) continue;
    const trackDrills = drillsByTrack[item.track];
    const localDrills = trackDrills?.[item.lesson_order];
    if (localDrills && localDrills.length > 0) {
      if (!item.practiceChallenges || item.practiceChallenges.length === 0) {
        merged[i] = {
          ...item,
          practiceChallenges: localDrills,
        };
      } else {
        // Backfill missing examples/hints/constraints when DB rows carry older practiceChallenges JSON
        const enrichedChallenges = item.practiceChallenges.map((ch, idx) => {
          const fallback =
            localDrills.find((d) => d.id === ch?.id) || localDrills[idx];
          if (!fallback || !ch || typeof ch !== "object") return ch;
          const hasExamples =
            Array.isArray(ch.examples) && ch.examples.length > 0;
          const preferLocalExamples =
            Array.isArray(fallback.examples) &&
            fallback.examples.some((ex) => Boolean(ex?.explanation));
          const hasHints = Array.isArray(ch.hints) && ch.hints.length > 0;
          const hasConstraints =
            Array.isArray(ch.constraints) && ch.constraints.length > 0;
          return {
            ...fallback,
            ...ch,
            examples: preferLocalExamples
              ? fallback.examples
              : hasExamples
                ? ch.examples
                : fallback.examples,
            hints: hasHints ? ch.hints : fallback.hints,
            constraints: hasConstraints ? ch.constraints : fallback.constraints,
            expected_output: ch.expected_output || fallback.expected_output,
          };
        });
        merged[i] = {
          ...item,
          practiceChallenges: enrichedChallenges,
        };
      }
    }
  }

  for (let i = 0; i < merged.length; i++) {
    const item = merged[i];
    const cleanInitial =
      typeof item.initial_code === "string"
        ? minimizeStarterCode(item.initial_code)
        : item.initial_code;
    const cleanChallenges = item.practiceChallenges?.map((ch) => {
      if (!ch || typeof ch !== "object") return ch;
      const nextInitial =
        typeof ch.initial_code === "string"
          ? minimizeStarterCode(ch.initial_code)
          : ch.initial_code;
      const nextExamples = Array.isArray(ch.examples)
        ? ch.examples.map(
            (ex: { input: string; output: string; explanation?: string }) => {
              if (!ex || typeof ex !== "object") return ex;
              if (ex.explanation && ex.explanation.trim().length > 0) return ex;
              const cleanRule = (
                ch.constraints?.[0] ||
                ch.hints?.[0] ||
                ch.assignment ||
                ""
              )
                .replace(/`/g, "")
                .replace(/\.$/, "")
                .trim();
              const explanation = cleanRule
                ? `For ${ex.input}, applying the rule (${cleanRule.charAt(0).toLowerCase() + cleanRule.slice(1)}) produces ${ex.output}.`
                : `Evaluating ${ex.input} returns ${ex.output}.`;
              return { ...ex, explanation };
            },
          )
        : ch.examples;
      return {
        ...ch,
        ...(typeof nextInitial === "string" ? { initial_code: nextInitial } : {}),
        ...(nextExamples ? { examples: nextExamples } : {}),
      };
    });
    merged[i] = {
      ...item,
      ...(typeof cleanInitial === "string" ? { initial_code: cleanInitial } : {}),
      ...(cleanChallenges ? { practiceChallenges: cleanChallenges } : {}),
    };
  }

  return merged.sort(
    (a, b) =>
      getCurriculumLessonSortKey(a.track, a) -
      getCurriculumLessonSortKey(b.track, b),
  );
}
