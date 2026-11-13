import { ALGORITHMS_ENRICHMENTS } from "./curriculumData/algorithmsEnrichments";
import { ALGORITHMS_EXPANSION_LESSONS } from "./curriculumData/algorithmsLessons";
import { PYTHON_BASICS_ENRICHMENTS } from "./curriculumData/pythonBasicsEnrichments";
import { PYTHON_BASICS_EXPANSION_LESSONS } from "./curriculumData/pythonBasicsLessons";
import { SYSTEM_DESIGN_ENRICHMENTS } from "./curriculumData/systemDesignEnrichments";
import { SYSTEM_DESIGN_EXPANSION_LESSONS } from "./curriculumData/systemDesignLessons";
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
];

export const EXPANSION_LESSONS = [
  ...PYTHON_BASICS_EXPANSION_LESSONS,
  ...ALGORITHMS_EXPANSION_LESSONS,
  ...SYSTEM_DESIGN_EXPANSION_LESSONS,
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
    "Given an array of integers `nums` and an integer `target`, find the two indices whose values add up to `target`.\n\nA brute-force double loop checks every pair in **O(n²)** time. Instead, walk through `nums` once with a dictionary `seen = {}` that maps each visited value to its index:\n\n```python\nseen = {}\nfor i, num in enumerate(nums):\n    needed = target - num\n    if needed in seen:\n        return [seen[needed], i]\n    seen[num] = i\n```\n\nChecking `if needed in seen:` takes **O(1)** instant hash-table lookup time!",
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
        seen = {}
        # Loop with enumerate(nums), check needed = target - num
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

const ORPHANED_DUPLICATE_LESSON_IDS = new Set([
  "ff06e344-6648-49a3-80a6-22b34f2faee3",
]);

export function mergeCurriculumLessons<
  T extends { id: string; track: string; lesson_order: number; title: string },
>(dbLessons: T[]): T[] {
  const seenTrackOrders = new Set<string>();
  const merged: T[] = [];

  for (const row of dbLessons) {
    if (ORPHANED_DUPLICATE_LESSON_IDS.has(row.id)) continue;
    const key = `${row.track}:${row.lesson_order}`;
    if (seenTrackOrders.has(key)) continue;
    seenTrackOrders.add(key);

    if (row.track === "algorithms" && row.lesson_order === 1) {
      merged.push({
        ...row,
        ...TWO_SUM_SANITIZED_PATCH,
      } as T);
      continue;
    }

    merged.push(row);
  }

  for (const exp of EXPANSION_LESSONS) {
    const alreadyExists = merged.some(
      (item) =>
        item.id === exp.id ||
        (item.track === exp.track &&
          (item.lesson_order === exp.lesson_order ||
            item.title.toLowerCase() === exp.title.toLowerCase())),
    );
    if (!alreadyExists) {
      merged.push(exp as unknown as T);
    }
  }
  return merged.sort((a, b) => a.lesson_order - b.lesson_order);
}
