import type { LessonEnrichment } from "../constants/curriculum";
import type { Lesson, PracticeChallenge } from "../types/lesson";

export interface ScaffoldStep {
  stepNumber: number;
  instruction: string;
  syntaxClue: string;
}

export interface GuidedScaffoldPlan {
  scaffoldCode: string;
  steps: ScaffoldStep[];
  blankCount: number;
  sourceKind: "structure" | "constraints";
}

function stripStringLiteralsAndComments(line: string): string {
  let out = "";
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = null;
      out += " ";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += " ";
      continue;
    }
    if (ch === "#") break;
    out += ch;
  }

  return out;
}

/**
 * Returns 1-based line numbers containing unfilled `___` scaffold blanks
 * outside string literals and comments.
 */
export function findUnfilledScaffoldLines(code: string): number[] {
  const result: number[] = [];
  const lines = (code || "").split("\n");
  lines.forEach((line, idx) => {
    const stripped = stripStringLiteralsAndComments(line);
    if (/\b___\b/.test(stripped)) {
      result.push(idx + 1);
    }
  });
  return result;
}

function deriveSyntaxClue(
  instruction: string,
  enrichment?: LessonEnrichment | null,
): string {
  const lower = instruction.toLowerCase();

  if (lower.includes("dict") || lower.includes("hash") || lower.includes("map") || lower.includes("seen")) {
    return "Initialize a dictionary (`seen = {}`) and check membership in O(1) with `if key in seen:`.";
  }
  if (lower.includes(".get(") || lower.includes("fallback") || lower.includes("default")) {
    return "Use `mapping.get(key, default_val)` so missing keys don't raise `KeyError`.";
  }
  if (lower.includes("set(") || lower.includes("unique") || lower.includes("duplicate")) {
    return "Convert to `set(items)` to deduplicate, or `sorted(set(items))` for a sorted list.";
  }
  if (lower.includes(".count(")) {
    return "Call `items.count(target)` to count matches cleanly in one step.";
  }
  if (lower.includes("pointer") || lower.includes("two pointer") || lower.includes("inward")) {
    return "Track `left = 0` and `right = len(items) - 1`, advancing inside `while left < right:`.";
  }
  if (lower.includes("loop") || lower.includes("iterate") || lower.includes("each") || lower.includes("every")) {
    return "Use `for item in items:` (or `for i, val in enumerate(items):` if you need indices).";
  }
  if (lower.includes("sort") || lower.includes("order")) {
    return "Use `sorted(items)` for a new sorted list or `items.sort(key=...)` for custom ordering.";
  }
  if (lower.includes("return")) {
    return "Make sure every execution path ends with `return <result>` (never `print()` only).";
  }
  if (lower.includes("if") || lower.includes("check") || lower.includes("guard") || lower.includes("empty")) {
    return "Add a boundary check (`if condition:` or `if not items:`) before indexing or updating state.";
  }
  if (lower.includes("try") || lower.includes("except") || lower.includes("error")) {
    return "Wrap risky conversion/division inside `try:` and handle failures in `except ValueError:` / `ZeroDivisionError:`.";
  }
  if (enrichment?.cheatSheet) {
    const firstNonComment = enrichment.cheatSheet
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#"));
    if (firstNonComment) {
      return `Pattern cue: \`${firstNonComment}\``;
    }
  }
  return "Translate this requirement into one concise Python statement at the indented level.";
}

function maskBodyLineForScaffold(
  rawLine: string,
  hintComment: string | null,
): string[] {
  const indentMatch = rawLine.match(/^([ \t]*)/);
  const indent = indentMatch ? indentMatch[1] : "";
  const trimmed = rawLine.trim();

  if (!trimmed) return [""];
  if (trimmed.startsWith("#")) return [rawLine];

  // Keep class/def signatures, decorators, and bare else/try/finally untouched
  if (
    trimmed.startsWith("def ") ||
    trimmed.startsWith("class ") ||
    trimmed.startsWith("@") ||
    trimmed === "else:" ||
    trimmed === "try:" ||
    trimmed === "finally:"
  ) {
    return [rawLine];
  }

  const linesOut: string[] = [];
  if (hintComment) {
    linesOut.push(`${indent}# TODO: ${hintComment}`);
  }

  // `for x, y in <iterable>:` -> keep loop header structure, mask iterable
  const forMatch = trimmed.match(/^for\s+(.+?)\s+in\s+(.+):$/);
  if (forMatch) {
    linesOut.push(`${indent}for ${forMatch[1]} in ___:`);
    return linesOut;
  }

  // `while <cond>:` -> mask condition
  if (/^while\s+.+:$/.test(trimmed)) {
    linesOut.push(`${indent}while ___:`);
    return linesOut;
  }

  // `if <cond>:` / `elif <cond>:` -> mask condition
  const ifMatch = trimmed.match(/^(if|elif)\s+(.+):$/);
  if (ifMatch) {
    linesOut.push(`${indent}${ifMatch[1]} ___:`);
    return linesOut;
  }

  // `except ...:` -> keep structure
  if (/^except\b.*:$/.test(trimmed)) {
    linesOut.push(rawLine);
    return linesOut;
  }

  // `return <expr>` -> mask returned value
  if (trimmed === "return") {
    linesOut.push(rawLine);
    return linesOut;
  }
  if (trimmed.startsWith("return ")) {
    linesOut.push(`${indent}return ___`);
    return linesOut;
  }

  // Compound assignment `x += ...`, `x -= ...` -> keep target variable
  const augMatch = trimmed.match(/^([a-zA-Z_][\w.\[\]]*)\s*(\+=|-=|\*=|\/=|\/\/=|%=)\s*(.+)$/);
  if (augMatch) {
    linesOut.push(`${indent}${augMatch[1]} ${augMatch[2]} ___`);
    return linesOut;
  }

  // Simple empty container initializer like `seen = {}` or `stack = []` -> keep variable, mask value
  const assignMatch = trimmed.match(/^([a-zA-Z_][\w., \[\]]*?)\s*=\s*(.+)$/);
  if (assignMatch && !assignMatch[1].includes("(")) {
    linesOut.push(`${indent}${assignMatch[1]} = ___`);
    return linesOut;
  }

  // Method call like `seen.append(...)` or `res.sort()` -> mask into TODO statement placeholder
  linesOut.push(`${indent}___`);
  return linesOut;
}

function buildStructureScaffoldFromSolution(
  solutionSource: string,
  constraints: string[],
  enrichment?: LessonEnrichment | null,
): string | null {
  const clean = solutionSource
    .split("# 💡 HELPFUL EXAMPLE:")[0]
    .replace(/\\n/g, "\n")
    .trim();
  if (!clean) return null;

  const lines = clean.split("\n");
  const resultLines: string[] = [];
  let constraintIdx = 0;
  let maskedBodyLines = 0;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      resultLines.push("");
      continue;
    }

    // Keep trailing top-level calls intact or omit if solution already runs inside function
    const isBodyLine = /^\s+/.test(rawLine);
    const isHeader =
      trimmed.startsWith("def ") ||
      trimmed.startsWith("class ") ||
      trimmed.startsWith("import ") ||
      trimmed.startsWith("from ");

    if (!isBodyLine && !isHeader) {
      // Mask top-level imperative statements cleanly if top-level script
      if (!trimmed.startsWith("#")) {
        const hint =
          constraintIdx < constraints.length ? constraints[constraintIdx++] : null;
        const masked = maskBodyLineForScaffold(rawLine, hint);
        if (masked.some((l) => /\b___\b/.test(l))) maskedBodyLines++;
        resultLines.push(...masked);
      } else {
        resultLines.push(rawLine);
      }
      continue;
    }

    if (trimmed.startsWith("# 👉")) {
      resultLines.push(rawLine.replace("# 👉", "# TODO:"));
      continue;
    }

    if (isHeader) {
      resultLines.push(rawLine);
      continue;
    }

    const hint =
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("def ") &&
      !trimmed.startsWith("class ") &&
      trimmed !== "else:" &&
      constraintIdx < constraints.length
        ? constraints[constraintIdx++]
        : null;

    const masked = maskBodyLineForScaffold(rawLine, hint);
    if (masked.some((l) => /\b___\b/.test(l))) maskedBodyLines++;
    resultLines.push(...masked);
  }

  // Fallback check: make sure at least one blank exists and we didn't produce the exact solution
  const joined = resultLines.join("\n").trim();
  if (!joined || maskedBodyLines === 0 || joined === clean) {
    // If single trivial line escaped masking, build from enrichment/initial fallback
    if (enrichment?.guidedCode && enrichment.guidedCode.includes("# 👉")) {
      return null;
    }
    return null;
  }

  return joined;
}

function buildConstraintsScaffoldFromStarter(
  starterCode: string,
  constraints: string[],
): string {
  const cleanStarter = (starterCode || "").replace(/\\n/g, "\n").trimEnd();
  const lines = cleanStarter.split("\n");
  const todos =
    constraints.length > 0
      ? constraints
      : ["Implement the logic described in the mission briefing"];

  // Find the first `pass` line to replace with indented TODO plan + `___` placeholder
  const passIdx = lines.findIndex((l) => l.trim() === "pass");
  if (passIdx !== -1) {
    const indent = lines[passIdx].match(/^([ \t]*)/)?.[1] || "    ";
    const block: string[] = todos.map(
      (c, idx) => `${indent}# TODO 0${idx + 1}: ${c}`,
    );
    block.push(`${indent}return ___  # Fill in your result expression`);
    const nextLines = [
      ...lines.slice(0, passIdx),
      ...block,
      ...lines.slice(passIdx + 1),
    ];
    return nextLines.join("\n");
  }

  const fallbackTodos = todos.map((c, idx) => `# TODO 0${idx + 1}: ${c}`);
  if (!cleanStarter) {
    return [...fallbackTodos, "___"].join("\n");
  }
  return [...lines, ...fallbackTodos, "    ___"].join("\n");
}

function extractSignatureName(code: string): string | null {
  const match = (code || "").match(/(?:class|def)\s+([a-zA-Z_]\w*)/);
  return match ? match[1] : null;
}

/**
 * Generates a non-spoiling Guided Scaffolding plan (fill-in-the-blank skeleton +
 * step-by-step syntax clues) for any lesson or practice challenge.
 * Never marks `peekedSolutions` as true.
 */
export function buildGuidedScaffoldPlan(
  lesson: Lesson,
  enrichment?: LessonEnrichment | null,
  activePractice?: PracticeChallenge,
): GuidedScaffoldPlan {
  const targetStarter = activePractice?.initial_code || lesson.initial_code || "";
  const constraints =
    activePractice?.constraints?.length
      ? activePractice.constraints
      : lesson.constraints || [];

  const steps: ScaffoldStep[] = (
    constraints.length > 0
      ? constraints
      : ["Break down the input, core logic, and returned output step by step."]
  ).map((instruction, idx) => ({
    stepNumber: idx + 1,
    instruction,
    syntaxClue: deriveSyntaxClue(instruction, enrichment),
  }));

  // Only derive structural fill-in-blanks from solutionCode when on the core stage
  // (or if activePractice explicitly provides its own guidedCode) and signatures match.
  const candidateSolution = activePractice
    ? activePractice.guidedCode || null
    : enrichment?.solutionCode || enrichment?.guidedCode || null;

  let scaffoldCode: string | null = null;
  let sourceKind: "structure" | "constraints" = "constraints";

  if (candidateSolution) {
    const starterSym = extractSignatureName(targetStarter);
    const solutionSym = extractSignatureName(candidateSolution);
    if (!starterSym || starterSym === solutionSym) {
      scaffoldCode = buildStructureScaffoldFromSolution(
        candidateSolution,
        constraints,
        enrichment,
      );
      if (scaffoldCode) {
        sourceKind = "structure";
      }
    }
  }

  if (!scaffoldCode) {
    scaffoldCode = buildConstraintsScaffoldFromStarter(targetStarter, constraints);
    sourceKind = "constraints";
  }

  const blankCount = Math.max(1, findUnfilledScaffoldLines(scaffoldCode).length);

  return {
    scaffoldCode,
    steps,
    blankCount,
    sourceKind,
  };
}
