import { readLocalJson, writeLocalJson } from "./storage";

export type ScratchpadTemplateId =
  | "welcome"
  | "ascii_art"
  | "dice_sim"
  | "algo_bench"
  | "json_api";

export interface ScratchpadTemplate {
  id: ScratchpadTemplateId;
  title: string;
  shortLabel: string;
  description: string;
  code: string;
}

export interface SavedScratchpadSnippet {
  id: string;
  title: string;
  code: string;
  updatedAt: string;
}

export const STORAGE_SCRATCHPAD_DRAFT_KEY = "devlearn_scratchpad_draft_v1";
export const STORAGE_SCRATCHPAD_SNIPPETS_KEY = "devlearn_scratchpad_snippets_v1";
export const MAX_SAVED_SNIPPETS = 12;

export const SCRATCHPAD_TEMPLATES: readonly ScratchpadTemplate[] = [
  {
    id: "welcome",
    title: "Cozy Starter",
    shortLabel: "STARTER",
    description: "Clean Python 3.11 canvas ready for quick experiments.",
    code: `# Welcome to Devy playground.py!
# Write any Python 3.11 code and press RUN (or Cmd/Ctrl+Enter).

snacks = ["matcha", "espresso", "ramen", "cookies"]
for idx, item in enumerate(snacks, start=1):
    print(f"0{idx}. Fueling the coding session with {item}!")

print("Total snacks ready:", len(snacks))`,
  },
  {
    id: "ascii_art",
    title: "ASCII Banner",
    shortLabel: "ASCII BOX",
    description: "Generate a cozy framed ASCII terminal banner.",
    code: `def studio_banner(message: str) -> str:
    border = "+" + "-" * (len(message) + 4) + "+"
    box = [
        "  [ >_ ]  " + border,
        f"  DEVY    |  {message}  |",
        "          " + border,
    ]
    return "\\n".join(box)

print(studio_banner("SHIP CLEAN PYTHON TODAY!"))`,
  },
  {
    id: "dice_sim",
    title: "Dice Distribution",
    shortLabel: "DICE SIM",
    description: "Simulate 2d6 rolls deterministically and chart an ASCII histogram.",
    code: `import random

rng = random.Random(42)
counts = {s: 0 for s in range(2, 13)}
for _ in range(300):
    roll = rng.randint(1, 6) + rng.randint(1, 6)
    counts[roll] += 1

print("2d6 Roll Histogram (300 throws):")
for total, hits in counts.items():
    bar = "#" * (hits // 3)
    print(f"{total:2d} | {bar} ({hits})")`,
  },
  {
    id: "algo_bench",
    title: "O(n) vs O(1) Bench",
    shortLabel: "ALGO BENCH",
    description: "Compare linear list scans against O(1) hash-set lookups.",
    code: `import time

items = list(range(4000))
lookup_set = set(items)
targets = [3999, 2500, 1234, 9999] * 40

t0 = time.perf_counter()
list_hits = sum(1 for x in targets if x in items)
t_list = (time.perf_counter() - t0) * 1000

t1 = time.perf_counter()
set_hits = sum(1 for x in targets if x in lookup_set)
t_set = (time.perf_counter() - t1) * 1000

print(f"List O(n) hits={list_hits} in {t_list:.3f} ms")
print(f"Set  O(1) hits={set_hits} in {t_set:.3f} ms")`,
  },
  {
    id: "json_api",
    title: "JSON Log Parser",
    shortLabel: "JSON PARSER",
    description: "Parse a mock JSON payload and aggregate endpoint latency.",
    code: `import json

raw = '''[
  {"route": "/lessons", "ms": 22},
  {"route": "/run", "ms": 84},
  {"route": "/lessons", "ms": 18},
  {"route": "/league", "ms": 41}
]'''

events = json.loads(raw)
totals = {}
for ev in events:
    r = ev["route"]
    totals.setdefault(r, []).append(ev["ms"])

for route, times in sorted(totals.items()):
    avg = sum(times) / len(times)
    print(f"{route:10s} -> calls={len(times)} avg={avg:.1f}ms")`,
  },
] as const;

export function getScratchpadTemplate(
  id: ScratchpadTemplateId,
): ScratchpadTemplate {
  return (
    SCRATCHPAD_TEMPLATES.find((t) => t.id === id) || SCRATCHPAD_TEMPLATES[0]
  );
}

export function readScratchpadDraft(): string {
  const saved = readLocalJson<string | null>(STORAGE_SCRATCHPAD_DRAFT_KEY, null);
  if (typeof saved === "string" && saved.length > 0) {
    return saved;
  }
  return SCRATCHPAD_TEMPLATES[0].code;
}

export function writeScratchpadDraft(code: string): void {
  writeLocalJson(STORAGE_SCRATCHPAD_DRAFT_KEY, code);
}

export function readSavedSnippets(): SavedScratchpadSnippet[] {
  const raw = readLocalJson<SavedScratchpadSnippet[]>(
    STORAGE_SCRATCHPAD_SNIPPETS_KEY,
    [],
  );
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (s) =>
      s &&
      typeof s.id === "string" &&
      typeof s.title === "string" &&
      typeof s.code === "string",
  );
}

type SnippetsListener = (snippets: SavedScratchpadSnippet[]) => void;
const snippetListeners = new Set<SnippetsListener>();

function emitSnippets(next: SavedScratchpadSnippet[]): void {
  snippetListeners.forEach((fn) => fn(next));
}

export function subscribeScratchpadSnippets(
  listener: SnippetsListener,
): () => void {
  snippetListeners.add(listener);
  return () => {
    snippetListeners.delete(listener);
  };
}

export function mergeScratchpadSnippets(
  a?: SavedScratchpadSnippet[] | null,
  b?: SavedScratchpadSnippet[] | null,
): SavedScratchpadSnippet[] {
  const byId = new Map<string, SavedScratchpadSnippet>();
  for (const list of [a, b]) {
    if (!Array.isArray(list)) continue;
    for (const s of list) {
      if (!s || typeof s.id !== "string" || typeof s.title !== "string" || typeof s.code !== "string") {
        continue;
      }
      const prev = byId.get(s.id);
      const prevTs = prev ? Date.parse(prev.updatedAt || "") || 0 : -1;
      const nextTs = Date.parse(s.updatedAt || "") || 0;
      if (!prev || nextTs >= prevTs) {
        byId.set(s.id, {
          id: s.id,
          title: s.title.slice(0, 32),
          code: s.code,
          updatedAt: s.updatedAt || new Date().toISOString(),
        });
      }
    }
  }
  return Array.from(byId.values())
    .sort((x, y) => (Date.parse(y.updatedAt) || 0) - (Date.parse(x.updatedAt) || 0))
    .slice(0, MAX_SAVED_SNIPPETS);
}

export function replaceScratchpadSnippetsFromCloud(
  incoming?: SavedScratchpadSnippet[] | null,
): SavedScratchpadSnippet[] {
  const merged = mergeScratchpadSnippets(readSavedSnippets(), incoming);
  writeLocalJson(STORAGE_SCRATCHPAD_SNIPPETS_KEY, merged);
  emitSnippets(merged);
  return merged;
}

export function saveScratchpadSnippet(params: {
  title: string;
  code: string;
}): SavedScratchpadSnippet[] {
  const cleanTitle = params.title.trim().slice(0, 32) || "Untitled Snippet";
  const prev = readSavedSnippets();
  const existingIdx = prev.findIndex(
    (s) => s.title.toLowerCase() === cleanTitle.toLowerCase(),
  );
  const entry: SavedScratchpadSnippet = {
    id:
      existingIdx >= 0
        ? prev[existingIdx].id
        : `snip_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title: cleanTitle,
    code: params.code,
    updatedAt: new Date().toISOString(),
  };

  const withoutDup =
    existingIdx >= 0
      ? [...prev.slice(0, existingIdx), ...prev.slice(existingIdx + 1)]
      : prev;
  const next = [entry, ...withoutDup].slice(0, MAX_SAVED_SNIPPETS);
  writeLocalJson(STORAGE_SCRATCHPAD_SNIPPETS_KEY, next);
  emitSnippets(next);
  return next;
}

export function deleteScratchpadSnippet(id: string): SavedScratchpadSnippet[] {
  const next = readSavedSnippets().filter((s) => s.id !== id);
  writeLocalJson(STORAGE_SCRATCHPAD_SNIPPETS_KEY, next);
  emitSnippets(next);
  return next;
}

export function resetScratchpadForTesting(): void {
  writeLocalJson(STORAGE_SCRATCHPAD_DRAFT_KEY, null);
  writeLocalJson(STORAGE_SCRATCHPAD_SNIPPETS_KEY, []);
  emitSnippets([]);
}
