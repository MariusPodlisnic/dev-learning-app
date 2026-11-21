import type { Lesson } from "../types/lesson";

export type ComplexityClass =
  | "O(1)"
  | "O(log n)"
  | "O(n)"
  | "O(n log n)"
  | "O(n²)";

export interface BigORaceProfile {
  lessonTitle: string;
  optimalLabel: string;
  optimalClass: ComplexityClass;
  naiveLabel: string;
  naiveClass: ComplexityClass;
  takeaway: string;
}

export interface BigORaceMetrics {
  n: number;
  optimalOps: number;
  naiveOps: number;
  speedupFactor: number;
  speedupLabel: string;
  optimalDurationMs: number;
  naiveDurationMs: number;
}

export interface UserCodeComplexityHint {
  estimatedClass: ComplexityClass;
  badgeText: string;
  note: string;
  isNestedLoop: boolean;
}

export const BIG_O_INPUT_SIZES = [10, 100, 1000, 10000] as const;

export function estimateOperations(
  complexity: ComplexityClass,
  n: number,
): number {
  const safeN = Math.max(1, Math.floor(n));
  switch (complexity) {
    case "O(1)":
      return 1;
    case "O(log n)":
      return Math.max(1, Math.ceil(Math.log2(safeN)));
    case "O(n)":
      return safeN;
    case "O(n log n)":
      return Math.max(1, Math.round(safeN * Math.log2(safeN)));
    case "O(n²)":
      return safeN * safeN;
  }
}

export function formatOpsCount(ops: number): string {
  if (ops >= 1_000_000) {
    const m = ops / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1)}M ops`;
  }
  if (ops >= 1_000) {
    const k = ops / 1_000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1)}K ops`;
  }
  return `${ops} ops`;
}

function normalizeComplexityClass(raw?: string): ComplexityClass {
  const text = (raw || "").toLowerCase().replace(/\s+/g, "");
  if (text.includes("o(1)")) return "O(1)";
  if (text.includes("nlogn") || text.includes("n*logn")) return "O(n log n)";
  if (text.includes("logn")) return "O(log n)";
  if (text.includes("n^2") || text.includes("n²") || text.includes("n*n")) {
    return "O(n²)";
  }
  return "O(n)";
}

export function resolveLessonRaceProfile(lesson?: Lesson): BigORaceProfile {
  const title = lesson?.title || "Algorithm Challenge";
  const timeStr = lesson?.complexities?.time || "";
  const category = (lesson?.category || "").toLowerCase();
  const titleLower = title.toLowerCase();

  const targetClass = normalizeComplexityClass(timeStr);

  if (
    targetClass === "O(log n)" ||
    titleLower.includes("binary search") ||
    category.includes("binary")
  ) {
    return {
      lessonTitle: title,
      optimalLabel: "Binary Search Halving",
      optimalClass: "O(log n)",
      naiveLabel: "Linear Left-to-Right Scan",
      naiveClass: "O(n)",
      takeaway:
        "Cutting the search space in half each step turns 10,000 checks into just 14.",
    };
  }

  if (
    targetClass === "O(n log n)" ||
    titleLower.includes("sort") ||
    titleLower.includes("heap") ||
    category.includes("sort")
  ) {
    return {
      lessonTitle: title,
      optimalLabel: "Divide & Conquer / Heap",
      optimalClass: "O(n log n)",
      naiveLabel: "Quadratic Pairwise Sort",
      naiveClass: "O(n²)",
      takeaway:
        "O(n log n) scales smoothly to millions of records where O(n²) stalls out.",
    };
  }

  if (targetClass === "O(1)") {
    return {
      lessonTitle: title,
      optimalLabel: "Direct Hash / Formula",
      optimalClass: "O(1)",
      naiveLabel: "Full Collection Scan",
      naiveClass: "O(n)",
      takeaway:
        "Constant-time O(1) lookup takes 1 step whether you have 10 or 10,000 items.",
    };
  }

  return {
    lessonTitle: title,
    optimalLabel: "Single-Pass / Hash Map",
    optimalClass: "O(n)",
    naiveLabel: "Nested Brute-Force Loops",
    naiveClass: "O(n²)",
    takeaway:
      "Trading a nested loop for a hash map or two pointers eliminates quadratic blow-up.",
  };
}

export function buildRaceComparison(
  profile: BigORaceProfile,
  n: number,
): BigORaceMetrics {
  const optimalOps = estimateOperations(profile.optimalClass, n);
  const naiveOps = Math.max(
    optimalOps,
    estimateOperations(profile.naiveClass, n),
  );
  const speedupFactor = Math.max(1, Math.round(naiveOps / Math.max(1, optimalOps)));
  const speedupLabel =
    speedupFactor >= 1000
      ? `${(speedupFactor / 1000).toFixed(speedupFactor >= 10000 ? 0 : 1)}K× FASTER`
      : `${speedupFactor}× FASTER`;

  // Smooth visual animation durations (optimal zips cleanly, naive slows down dramatically)
  const optimalDurationMs = 340;
  const logRatio = Math.log10(Math.max(1.5, speedupFactor));
  const naiveDurationMs = Math.min(2600, Math.round(520 + logRatio * 640));

  return {
    n,
    optimalOps,
    naiveOps,
    speedupFactor,
    speedupLabel,
    optimalDurationMs,
    naiveDurationMs,
  };
}

export function analyzeUserCodeComplexity(code: string): UserCodeComplexityHint {
  const lines = (code || "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith("#"));

  let maxLoopDepth = 0;
  const loopIndents: number[] = [];

  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    while (
      loopIndents.length > 0 &&
      indent <= loopIndents[loopIndents.length - 1]
    ) {
      loopIndents.pop();
    }
    if (/^(for|while)\s+/.test(trimmed)) {
      loopIndents.push(indent);
      maxLoopDepth = Math.max(maxLoopDepth, loopIndents.length);
    }
  }

  const joined = lines.join("\n");
  const hasSort = /\.sort\(|sorted\(/.test(joined);
  const hasMidpointHalving = /\/\/\s*2/.test(joined) && /\bwhile\b/.test(joined);

  if (maxLoopDepth >= 2) {
    return {
      estimatedClass: "O(n²)",
      badgeText: "YOUR DRAFT: ~O(n²)",
      note: "Nested loop detected — check if a dict/set or two pointers can make it single-pass!",
      isNestedLoop: true,
    };
  }
  if (hasSort) {
    return {
      estimatedClass: "O(n log n)",
      badgeText: "YOUR DRAFT: ~O(n log n)",
      note: "Uses Python Timsort — clean O(n log n) scaling.",
      isNestedLoop: false,
    };
  }
  if (hasMidpointHalving && maxLoopDepth === 1) {
    return {
      estimatedClass: "O(log n)",
      badgeText: "YOUR DRAFT: ~O(log n)",
      note: "Halving loop detected — logarithmic speed!",
      isNestedLoop: false,
    };
  }
  if (maxLoopDepth === 1) {
    return {
      estimatedClass: "O(n)",
      badgeText: "YOUR DRAFT: ~O(n)",
      note: "Single-pass loop — linear time scaling.",
      isNestedLoop: false,
    };
  }
  return {
    estimatedClass: "O(1)",
    badgeText: "YOUR DRAFT: ~O(1)",
    note: "No loops detected yet — constant-time draft.",
    isNestedLoop: false,
  };
}
