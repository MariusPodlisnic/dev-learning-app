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

  if ((lesson.lesson_order || 0) >= 9) {
    const byExpansionOrder = LESSON_ENRICHMENTS.find(
      (item) =>
        item.matchTrack === track && item.matchOrder === lesson.lesson_order,
    );
    if (byExpansionOrder) {
      return attachDefaultPitfallAndGuided(
        byExpansionOrder,
        track,
        lesson.initial_code,
      );
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

  const byOrder = LESSON_ENRICHMENTS.find(
    (item) =>
      item.matchTrack === track && item.matchOrder === lesson.lesson_order,
  );
  if (byOrder) {
    return attachDefaultPitfallAndGuided(byOrder, track, lesson.initial_code);
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

export function mergeCurriculumLessons<
  T extends { id: string; track: string; lesson_order: number; title: string },
>(dbLessons: T[]): T[] {
  const merged = [...dbLessons];
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
