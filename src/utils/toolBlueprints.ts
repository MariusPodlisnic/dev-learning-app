import { WIDGET_JSON_MARKER } from "./miniBuilds";
import { readLocalJson, writeLocalJson } from "./storage";

export const STORAGE_BLUEPRINT_STAGES_KEY = "devlearn_blueprint_stages_v1";

export type ToolBlueprintId =
  | "autocomplete_trie"
  | "rate_limiter"
  | "markdown_preview";

export interface BlueprintStageSpec {
  stageNumber: 1 | 2 | 3;
  title: string;
  unlocksWidgetFeature: string;
  xpReward: number;
  summary: string;
  checklist: readonly string[];
  starterCode: string;
  solutionCode: string;
  verificationHarness: string;
  widgetCallExpr: string;
}

export interface ToolBlueprintProject {
  id: ToolBlueprintId;
  title: string;
  shortTitle: string;
  trackBadge: string;
  accent: string;
  isPro: boolean;
  description: string;
  defaultInput: Record<string, string | number>;
  stages: readonly [BlueprintStageSpec, BlueprintStageSpec, BlueprintStageSpec];
}

export type BlueprintProgressMap = Partial<Record<ToolBlueprintId, number[]>>;

export const TOOL_BLUEPRINT_PROJECTS: readonly ToolBlueprintProject[] = [
  {
    id: "autocomplete_trie",
    title: "Autocomplete Search Engine",
    shortTitle: "AUTOCOMPLETE",
    trackBadge: "ALGORITHMS · 3 STAGES",
    accent: "#6EE7B7",
    isPro: false,
    description:
      "Build a 3-stage prefix search engine from raw prefix matching to frequency ranking and highlighted search telemetry.",
    defaultInput: { query: "py", limit: 4 },
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Prefix Matcher",
        unlocksWidgetFeature: "Live Prefix Match Chips",
        xpReward: 35,
        summary:
          "Filter a dictionary of words case-insensitively to return all words starting with `prefix`, sorted alphabetically.",
        checklist: [
          "Normalize `prefix` with `.strip().lower()`.",
          "Match words whose lowercase form `.startswith(clean_prefix)`.",
          "Return a dict with `matches` (sorted list) and `count`.",
        ],
        starterCode: `CATALOG = ["python", "pytest", "pyodide", "pydantic", "pixel", "parse", "pipeline", "queue"]

def suggest_words(words: list, prefix: str) -> dict:
    clean = prefix.strip().lower()
    matches = sorted([w for w in words if w.lower().startswith(clean)])
    return {"matches": matches, "count": len(matches)}`,
        solutionCode: `CATALOG = ["python", "pytest", "pyodide", "pydantic", "pixel", "parse", "pipeline", "queue"]

def suggest_words(words: list, prefix: str) -> dict:
    clean = prefix.strip().lower()
    matches = sorted([w for w in words if w.lower().startswith(clean)])
    return {"matches": matches, "count": len(matches)}`,
        verificationHarness: `
__test_cases__ = [
    ("suggest 'py' count", lambda: suggest_words(["python", "pytest", "queue"], "py")["count"], 2),
    ("case-insensitive 'PY'", lambda: suggest_words(["Python", "pytest", "go"], "PY")["matches"], ["Python", "pytest"]),
    ("no match returns []", lambda: suggest_words(["python", "rust"], "zz")["matches"], []),
]
`,
        widgetCallExpr: `suggest_words(CATALOG, str(__in__.get("query", "py")))`,
      },
      {
        stageNumber: 2,
        title: "Stage 2: Frequency Ranker",
        unlocksWidgetFeature: "Popularity Rank Bars & Top-K Limit",
        xpReward: 40,
        summary:
          "Rank matching prefix suggestions by descending search popularity (breaking ties alphabetically) and slice to `limit`.",
        checklist: [
          "Filter `(word, score)` pairs from `freq_map` matching `prefix`.",
          "Sort by `(-score, word)` so hottest queries appear first.",
          "Return `ranked` list of `{'word': w, 'score': s}` capped at `limit`.",
        ],
        starterCode: `FREQ_CATALOG = {
    "python": 98,
    "pytest": 74,
    "pyodide": 85,
    "pydantic": 69,
    "pixel": 62,
    "pipeline": 55,
    "parse": 48,
}

def rank_suggestions(freq_map: dict, prefix: str, limit: int = 4) -> dict:
    clean = prefix.strip().lower()
    hits = [(w, s) for w, s in freq_map.items() if w.lower().startswith(clean)]
    hits.sort(key=lambda pair: (-pair[1], pair[0]))
    top = [{"word": w, "score": s} for w, s in hits[:max(1, limit)]]
    return {"ranked": top, "count": len(hits)}`,
        solutionCode: `FREQ_CATALOG = {
    "python": 98,
    "pytest": 74,
    "pyodide": 85,
    "pydantic": 69,
    "pixel": 62,
    "pipeline": 55,
    "parse": 48,
}

def rank_suggestions(freq_map: dict, prefix: str, limit: int = 4) -> dict:
    clean = prefix.strip().lower()
    hits = [(w, s) for w, s in freq_map.items() if w.lower().startswith(clean)]
    hits.sort(key=lambda pair: (-pair[1], pair[0]))
    top = [{"word": w, "score": s} for w, s in hits[:max(1, limit)]]
    return {"ranked": top, "count": len(hits)}`,
        verificationHarness: `
__test_cases__ = [
    ("top hit for 'py'", lambda: rank_suggestions({"pytest": 70, "python": 98, "go": 99}, "py", 2)["ranked"][0]["word"], "python"),
    ("respects limit=1", lambda: len(rank_suggestions({"pytest": 70, "python": 98}, "py", 1)["ranked"]), 1),
    ("tie breaks alphabetically", lambda: rank_suggestions({"pyb": 50, "pya": 50}, "py", 2)["ranked"][0]["word"], "pya"),
]
`,
        widgetCallExpr: `rank_suggestions(FREQ_CATALOG, str(__in__.get("query", "py")), int(__in__.get("limit", 4)))`,
      },
      {
        stageNumber: 3,
        title: "Stage 3: Prefix Highlight & Telemetry",
        unlocksWidgetFeature: "Highlighted Prefix Splits + Exact-Match Badge",
        xpReward: 45,
        summary:
          "Split each top suggestion into `head` (matched prefix) and `tail` (completion) and flag whether an exact dictionary hit exists.",
        checklist: [
          "Compute top ranked matches for `query`.",
          "For each match, attach `head = word[:len(clean)]` and `tail = word[len(clean):]`.",
          "Return `items`, `exact_match` boolean, and `total_matches`.",
        ],
        starterCode: `FREQ_CATALOG = {
    "python": 98,
    "pytest": 74,
    "pyodide": 85,
    "pydantic": 69,
    "pixel": 62,
    "pipeline": 55,
    "parse": 48,
}

def format_autocomplete(freq_map: dict, query: str, limit: int = 4) -> dict:
    clean = query.strip().lower()
    hits = [(w, s) for w, s in freq_map.items() if w.lower().startswith(clean)]
    hits.sort(key=lambda pair: (-pair[1], pair[0]))
    items = [
        {
            "word": w,
            "head": w[: len(clean)],
            "tail": w[len(clean) :],
            "score": s,
        }
        for w, s in hits[: max(1, limit)]
    ]
    exact = any(w.lower() == clean for w, _ in hits) if clean else False
    return {"items": items, "exact_match": exact, "total_matches": len(hits)}`,
        solutionCode: `FREQ_CATALOG = {
    "python": 98,
    "pytest": 74,
    "pyodide": 85,
    "pydantic": 69,
    "pixel": 62,
    "pipeline": 55,
    "parse": 48,
}

def format_autocomplete(freq_map: dict, query: str, limit: int = 4) -> dict:
    clean = query.strip().lower()
    hits = [(w, s) for w, s in freq_map.items() if w.lower().startswith(clean)]
    hits.sort(key=lambda pair: (-pair[1], pair[0]))
    items = [
        {
            "word": w,
            "head": w[: len(clean)],
            "tail": w[len(clean) :],
            "score": s,
        }
        for w, s in hits[: max(1, limit)]
    ]
    exact = any(w.lower() == clean for w, _ in hits) if clean else False
    return {"items": items, "exact_match": exact, "total_matches": len(hits)}`,
        verificationHarness: `
__test_cases__ = [
    ("splits head/tail cleanly", lambda: (format_autocomplete({"python": 98}, "py")["items"][0]["head"], format_autocomplete({"python": 98}, "py")["items"][0]["tail"]), ("py", "thon")),
    ("exact_match True on full word", lambda: format_autocomplete({"python": 98}, "python")["exact_match"], True),
    ("exact_match False on partial", lambda: format_autocomplete({"python": 98}, "py")["exact_match"], False),
]
`,
        widgetCallExpr: `format_autocomplete(FREQ_CATALOG, str(__in__.get("query", "py")), int(__in__.get("limit", 4)))`,
      },
    ],
  },
  {
    id: "rate_limiter",
    title: "Token-Bucket Rate Limiter",
    shortTitle: "RATE LIMITER",
    trackBadge: "SYSTEM DESIGN · 3 STAGES",
    accent: "#38BDF8",
    isPro: false,
    description:
      "Engineer a real API token-bucket rate limiter step-by-step: refill math, 200/429 admission gate, and burst traffic simulator.",
    defaultInput: { capacity: 5, refillRate: 2, burstCount: 7 },
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Token Refill Engine",
        unlocksWidgetFeature: "Live Token Bucket Fill Gauge",
        xpReward: 40,
        summary:
          "Refill bucket tokens at `rate` tokens/sec over `elapsed_sec`, capped strictly at `capacity`.",
        checklist: [
          "Add `elapsed_sec * rate` to `current_tokens`.",
          "Clamp the result to `min(capacity, ...)` and round to 2 decimals.",
          "Return `tokens`, `capacity`, and `fill_pct` (0..100).",
        ],
        starterCode: `def refill_tokens(current_tokens: float, elapsed_sec: float, rate: float, capacity: int) -> dict:
    updated = min(float(capacity), max(0.0, current_tokens + max(0.0, elapsed_sec) * rate))
    fill_pct = int(round((updated / max(1, capacity)) * 100))
    return {"tokens": round(updated, 2), "capacity": capacity, "fill_pct": fill_pct}`,
        solutionCode: `def refill_tokens(current_tokens: float, elapsed_sec: float, rate: float, capacity: int) -> dict:
    updated = min(float(capacity), max(0.0, current_tokens + max(0.0, elapsed_sec) * rate))
    fill_pct = int(round((updated / max(1, capacity)) * 100))
    return {"tokens": round(updated, 2), "capacity": capacity, "fill_pct": fill_pct}`,
        verificationHarness: `
__test_cases__ = [
    ("refills 2 tokens over 1s", lambda: refill_tokens(1.0, 1.0, 2.0, 5)["tokens"], 3.0),
    ("clamps strictly to capacity", lambda: refill_tokens(4.0, 5.0, 2.0, 5)["tokens"], 5.0),
    ("fill_pct hits 100 when full", lambda: refill_tokens(5.0, 0.0, 2.0, 5)["fill_pct"], 100),
]
`,
        widgetCallExpr: `refill_tokens(1.0, 1.5, float(__in__.get("refillRate", 2)), int(__in__.get("capacity", 5)))`,
      },
      {
        stageNumber: 2,
        title: "Stage 2: Request Gatekeeper",
        unlocksWidgetFeature: "200 OK vs 429 Throttled Admission Gate",
        xpReward: 40,
        summary:
          "Decide whether an incoming API request costing `cost` tokens is admitted (`200`) or throttled (`429`).",
        checklist: [
          "Allow request if `tokens >= cost` and subtract `cost` from `tokens`.",
          "Otherwise keep `tokens` unchanged and return HTTP status `429`.",
          "Return `allowed`, `status`, and `remaining`.",
        ],
        starterCode: `def consume_request(tokens: float, cost: float = 1.0) -> dict:
    if tokens >= cost:
        return {"allowed": True, "status": 200, "remaining": round(tokens - cost, 2)}
    return {"allowed": False, "status": 429, "remaining": round(tokens, 2)}`,
        solutionCode: `def consume_request(tokens: float, cost: float = 1.0) -> dict:
    if tokens >= cost:
        return {"allowed": True, "status": 200, "remaining": round(tokens - cost, 2)}
    return {"allowed": False, "status": 429, "remaining": round(tokens, 2)}`,
        verificationHarness: `
__test_cases__ = [
    ("allows when tokens >= cost", lambda: consume_request(3.0, 1.0), {"allowed": True, "status": 200, "remaining": 2.0}),
    ("throttles with 429 when empty", lambda: consume_request(0.5, 1.0), {"allowed": False, "status": 429, "remaining": 0.5}),
]
`,
        widgetCallExpr: `consume_request(max(0.0, float(__in__.get("capacity", 5)) - float(__in__.get("burstCount", 7)) + 2.0), 1.0)`,
      },
      {
        stageNumber: 3,
        title: "Stage 3: Burst Traffic Simulator",
        unlocksWidgetFeature: "Per-Request Live Traffic Timeline (200 / 429)",
        xpReward: 45,
        summary:
          "Simulate a burst of `burst_count` requests arriving 0.25s apart, refilling tokens each step and logging every `200` or `429`.",
        checklist: [
          "Start full with `tokens = float(capacity)`.",
          "For each request after the first, refill `0.25 * rate` capped at `capacity`.",
          "Record `200` if `tokens >= 1` (decrementing by 1) else `429`; return `events`, `allowed_count`, `throttled_count`.",
        ],
        starterCode: `def simulate_traffic(capacity: int, rate: float, burst_count: int) -> dict:
    tokens = float(capacity)
    events = []
    allowed = 0
    throttled = 0
    for idx in range(max(1, burst_count)):
        if idx > 0:
            tokens = min(float(capacity), tokens + 0.25 * rate)
        if tokens >= 1.0:
            tokens -= 1.0
            allowed += 1
            events.append({"req": idx + 1, "status": 200, "tokens": round(tokens, 2)})
        else:
            throttled += 1
            events.append({"req": idx + 1, "status": 429, "tokens": round(tokens, 2)})
    return {
        "events": events,
        "allowed_count": allowed,
        "throttled_count": throttled,
        "remaining": round(tokens, 2),
    }`,
        solutionCode: `def simulate_traffic(capacity: int, rate: float, burst_count: int) -> dict:
    tokens = float(capacity)
    events = []
    allowed = 0
    throttled = 0
    for idx in range(max(1, burst_count)):
        if idx > 0:
            tokens = min(float(capacity), tokens + 0.25 * rate)
        if tokens >= 1.0:
            tokens -= 1.0
            allowed += 1
            events.append({"req": idx + 1, "status": 200, "tokens": round(tokens, 2)})
        else:
            throttled += 1
            events.append({"req": idx + 1, "status": 429, "tokens": round(tokens, 2)})
    return {
        "events": events,
        "allowed_count": allowed,
        "throttled_count": throttled,
        "remaining": round(tokens, 2),
    }`,
        verificationHarness: `
__test_cases__ = [
    ("capacity 2 burst 4 throttles >= 1", lambda: simulate_traffic(2, 0.0, 4)["throttled_count"], 2),
    ("capacity 5 burst 3 allows all 3", lambda: simulate_traffic(5, 1.0, 3)["allowed_count"], 3),
    ("events length matches burst", lambda: len(simulate_traffic(3, 2.0, 6)["events"]), 6),
]
`,
        widgetCallExpr: `simulate_traffic(int(__in__.get("capacity", 5)), float(__in__.get("refillRate", 2)), int(__in__.get("burstCount", 7)))`,
      },
    ],
  },
  {
    id: "markdown_preview",
    title: "Markdown Live Previewer",
    shortTitle: "MARKDOWN",
    trackBadge: "PYTHON · 3 STAGES · PRO",
    accent: "#FF90E8",
    isPro: true,
    description:
      "Construct a 3-stage Markdown document parser that transforms headings, bullets, inline code, and reading-time stats live.",
    defaultInput: {
      markdown: "# Devy Studio\n- Write **clean** Python\n- Run `pytest` fast",
    },
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Heading Detector",
        unlocksWidgetFeature: "Live Heading & Text Classification",
        xpReward: 40,
        summary:
          "Classify a single Markdown line into `'h1'`, `'h2'`, `'bullet'`, or `'paragraph'` and strip its leading syntax marker.",
        checklist: [
          "Lines starting with `'# '` are `h1`, `'## '` are `h2`, `'- '` are `bullet`.",
          "Strip the leading marker cleanly.",
          "Return `kind` and `text`.",
        ],
        starterCode: `def classify_line(line: str) -> dict:
    s = line.strip()
    if s.startswith("## "):
        return {"kind": "h2", "text": s[3:].strip()}
    if s.startswith("# "):
        return {"kind": "h1", "text": s[2:].strip()}
    if s.startswith("- "):
        return {"kind": "bullet", "text": s[2:].strip()}
    return {"kind": "paragraph", "text": s}`,
        solutionCode: `def classify_line(line: str) -> dict:
    s = line.strip()
    if s.startswith("## "):
        return {"kind": "h2", "text": s[3:].strip()}
    if s.startswith("# "):
        return {"kind": "h1", "text": s[2:].strip()}
    if s.startswith("- "):
        return {"kind": "bullet", "text": s[2:].strip()}
    return {"kind": "paragraph", "text": s}`,
        verificationHarness: `
__test_cases__ = [
    ("h1 detection", lambda: classify_line("# Hello"), {"kind": "h1", "text": "Hello"}),
    ("h2 detection", lambda: classify_line("## Sub"), {"kind": "h2", "text": "Sub"}),
    ("bullet detection", lambda: classify_line("- Item"), {"kind": "bullet", "text": "Item"}),
]
`,
        widgetCallExpr: `classify_line(str(__in__.get("markdown", "# Devy")).splitlines()[0])`,
      },
      {
        stageNumber: 2,
        title: "Stage 2: Multi-Block Parser",
        unlocksWidgetFeature: "Structured Multi-Line Preview Cards",
        xpReward: 45,
        summary:
          "Parse every non-empty line in `markdown` into structured block objects with inline code & bold flags.",
        checklist: [
          "Skip empty lines.",
          "Flag `has_code` when backticks appear and `has_bold` when `**` appears.",
          "Return `blocks` list and `block_count`.",
        ],
        starterCode: `def parse_blocks(markdown: str) -> dict:
    blocks = []
    for raw in markdown.splitlines():
        s = raw.strip()
        if not s:
            continue
        if s.startswith("## "):
            kind, text = "h2", s[3:].strip()
        elif s.startswith("# "):
            kind, text = "h1", s[2:].strip()
        elif s.startswith("- "):
            kind, text = "bullet", s[2:].strip()
        else:
            kind, text = "paragraph", s
        blocks.append({
            "kind": kind,
            "text": text,
            "has_bold": "**" in text,
            "has_code": "\`" in text,
        })
    return {"blocks": blocks, "block_count": len(blocks)}`,
        solutionCode: `def parse_blocks(markdown: str) -> dict:
    blocks = []
    for raw in markdown.splitlines():
        s = raw.strip()
        if not s:
            continue
        if s.startswith("## "):
            kind, text = "h2", s[3:].strip()
        elif s.startswith("# "):
            kind, text = "h1", s[2:].strip()
        elif s.startswith("- "):
            kind, text = "bullet", s[2:].strip()
        else:
            kind, text = "paragraph", s
        blocks.append({
            "kind": kind,
            "text": text,
            "has_bold": "**" in text,
            "has_code": "\`" in text,
        })
    return {"blocks": blocks, "block_count": len(blocks)}`,
        verificationHarness: `
__test_cases__ = [
    ("parses 3 blocks", lambda: parse_blocks("# Title\\n- One\\n- Two")["block_count"], 3),
    ("detects bold flag", lambda: parse_blocks("Hi **dev**")["blocks"][0]["has_bold"], True),
    ("detects code flag", lambda: parse_blocks("Run \`py\`")["blocks"][0]["has_code"], True),
]
`,
        widgetCallExpr: `parse_blocks(str(__in__.get("markdown", "# Devy Studio")))`,
      },
      {
        stageNumber: 3,
        title: "Stage 3: Document Outline & Stats",
        unlocksWidgetFeature: "Full Document Renderer + Outline & Word Telemetry",
        xpReward: 50,
        summary:
          "Render the complete block tree alongside extracted heading `outline` titles and total `word_count`.",
        checklist: [
          "Collect all `h1`/`h2` texts into `outline`.",
          "Count total words across all non-empty blocks.",
          "Return `blocks`, `outline`, and `word_count`.",
        ],
        starterCode: `def render_document(markdown: str) -> dict:
    blocks = []
    outline = []
    words = 0
    for raw in markdown.splitlines():
        s = raw.strip()
        if not s:
            continue
        if s.startswith("## "):
            kind, text = "h2", s[3:].strip()
            outline.append(text)
        elif s.startswith("# "):
            kind, text = "h1", s[2:].strip()
            outline.append(text)
        elif s.startswith("- "):
            kind, text = "bullet", s[2:].strip()
        else:
            kind, text = "paragraph", s
        words += len(text.split())
        blocks.append({"kind": kind, "text": text})
    return {"blocks": blocks, "outline": outline, "word_count": words}`,
        solutionCode: `def render_document(markdown: str) -> dict:
    blocks = []
    outline = []
    words = 0
    for raw in markdown.splitlines():
        s = raw.strip()
        if not s:
            continue
        if s.startswith("## "):
            kind, text = "h2", s[3:].strip()
            outline.append(text)
        elif s.startswith("# "):
            kind, text = "h1", s[2:].strip()
            outline.append(text)
        elif s.startswith("- "):
            kind, text = "bullet", s[2:].strip()
        else:
            kind, text = "paragraph", s
        words += len(text.split())
        blocks.append({"kind": kind, "text": text})
    return {"blocks": blocks, "outline": outline, "word_count": words}`,
        verificationHarness: `
__test_cases__ = [
    ("extracts outline", lambda: render_document("# Intro\\n## Setup\\nBody")["outline"], ["Intro", "Setup"]),
    ("counts words accurately", lambda: render_document("# One Two\\n- Three")["word_count"], 3),
]
`,
        widgetCallExpr: `render_document(str(__in__.get("markdown", "# Devy Studio")))`,
      },
    ],
  },
] as const;

export function getToolBlueprint(id: ToolBlueprintId): ToolBlueprintProject {
  return (
    TOOL_BLUEPRINT_PROJECTS.find((p) => p.id === id) ||
    TOOL_BLUEPRINT_PROJECTS[0]
  );
}

export function buildBlueprintWidgetScript(
  blueprint: ToolBlueprintProject,
  stageNumber: 1 | 2 | 3,
  userCode: string,
  input: Record<string, string | number>,
): string {
  const stage =
    blueprint.stages.find((s) => s.stageNumber === stageNumber) ||
    blueprint.stages[0];
  const safeInputJson = JSON.stringify(input);
  return `${userCode}

import json as __json__
__in__ = __json__.loads(${JSON.stringify(safeInputJson)})
__out__ = ${stage.widgetCallExpr}
print(${JSON.stringify(WIDGET_JSON_MARKER)} + __json__.dumps(__out__))
`;
}

export function readBlueprintProgress(): BlueprintProgressMap {
  return readLocalJson<BlueprintProgressMap>(STORAGE_BLUEPRINT_STAGES_KEY, {});
}

export function markBlueprintStageCompleted(
  blueprintId: ToolBlueprintId,
  stageNumber: 1 | 2 | 3,
): BlueprintProgressMap {
  const current = readBlueprintProgress();
  const prevStages = Array.isArray(current[blueprintId])
    ? current[blueprintId]!
    : [];
  if (prevStages.includes(stageNumber)) return current;
  const nextStages = [...prevStages, stageNumber].sort((a, b) => a - b);
  const next: BlueprintProgressMap = {
    ...current,
    [blueprintId]: nextStages,
  };
  writeLocalJson(STORAGE_BLUEPRINT_STAGES_KEY, next);
  return next;
}

export function isBlueprintFullyShipped(
  blueprintId: ToolBlueprintId,
  progress: BlueprintProgressMap,
): boolean {
  const stages = progress[blueprintId] || [];
  return stages.includes(1) && stages.includes(2) && stages.includes(3);
}
