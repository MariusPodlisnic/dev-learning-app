import { readLocalJson, writeLocalJson } from "./storage";

export type MiniBuildId = "password_meter" | "url_shortener" | "dice_rpg";

export interface MiniBuildProject {
  id: MiniBuildId;
  title: string;
  shortTitle: string;
  trackBadge: string;
  accent: string;
  xpReward: number;
  isPro: boolean;
  description: string;
  checklist: readonly string[];
  starterCode: string;
  solutionCode: string;
  verificationHarness: string;
  defaultInput: Record<string, string | number>;
}

export const STORAGE_MINIBUILDS_DONE_KEY = "devlearn_minibuilds_done_v1";
export const WIDGET_JSON_MARKER = "__DEVY_WIDGET_JSON__";

export const MINI_BUILD_PROJECTS: readonly MiniBuildProject[] = [
  {
    id: "password_meter",
    title: "Password Strength Meter",
    shortTitle: "PASSWORD METER",
    trackBadge: "PYTHON BASICS",
    accent: "#6EE7B7",
    xpReward: 60,
    isPro: false,
    description:
      "Write a live security scorer that grades any password from 0–100 and powers the meter widget beside your code.",
    checklist: [
      "Add +35 pts if len(pw) >= 8, +25 pts for any digit, +20 pts for uppercase, and +20 pts for a symbol (!@#$%^&*).",
      'Return label: "STRONG" (>= 80), "FAIR" (>= 50), or "WEAK" (< 50).',
      "Return a tips list describing any missing criteria.",
    ],
    starterCode: `def score_password(pw: str) -> dict:
    score = 0
    tips = []
    # TODO: +35 if len(pw) >= 8 else add a tip
    if len(pw) >= 8:
        score += 35
    else:
        tips.append("Use at least 8 characters")

    # TODO: check for a digit (+25), uppercase (+20), and symbol (+20)
    if any(c.isdigit() for c in pw):
        score += 25
    else:
        tips.append("Add a number")

    if any(c.isupper() for c in pw):
        score += 20
    else:
        tips.append("Add an uppercase letter")

    if any(c in "!@#$%^&*" for c in pw):
        score += 20
    else:
        tips.append("Add a symbol (!@#$%)")

    label = "STRONG" if score >= 80 else "FAIR" if score >= 50 else "WEAK"
    return {"score": score, "label": label, "tips": tips}`,
    solutionCode: `def score_password(pw: str) -> dict:
    score = 0
    tips = []
    if len(pw) >= 8:
        score += 35
    else:
        tips.append("Use at least 8 characters")
    if any(c.isdigit() for c in pw):
        score += 25
    else:
        tips.append("Add a number")
    if any(c.isupper() for c in pw):
        score += 20
    else:
        tips.append("Add an uppercase letter")
    if any(c in "!@#$%^&*" for c in pw):
        score += 20
    else:
        tips.append("Add a symbol (!@#$%)")
    label = "STRONG" if score >= 80 else "FAIR" if score >= 50 else "WEAK"
    return {"score": score, "label": label, "tips": tips}`,
    verificationHarness: `
__test_cases__ = [
    ("score_password('abc')['label']", lambda: score_password("abc")["label"], "WEAK"),
    ("score_password('Devy2026')['label']", lambda: score_password("Devy2026")["label"], "STRONG"),
    ("score_password('Devy2026!')['score']", lambda: score_password("Devy2026!")["score"], 100),
    ("len(score_password('Devy2026!')['tips'])", lambda: len(score_password("Devy2026!")["tips"]), 0),
]
`,
    defaultInput: { password: "Devy2026!" },
  },
  {
    id: "url_shortener",
    title: "Mini URL Shortener",
    shortTitle: "URL SHORTENER",
    trackBadge: "SYSTEM DESIGN",
    accent: "#38BDF8",
    xpReward: 75,
    isPro: false,
    description:
      "Build a deterministic base-36 link shortener that turns long URLs into clean devy.sh/<code> links with saved-character telemetry.",
    checklist: [
      "Compute a deterministic positive hash integer from long_url (e.g. rolling sum of ord(ch) * (i + 31)).",
      "Encode into slug_len characters using alphabet '0123456789abcdefghijklmnopqrstuvwxyz'.",
      "Return dict with 'code', 'short_url' ('devy.sh/' + code), and 'saved_chars' (max(0, len(long_url) - len(short_url))).",
    ],
    starterCode: `ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"

def shorten_url(long_url: str, slug_len: int = 6) -> dict:
    # Deterministic hash from characters
    h = 7
    for idx, ch in enumerate(long_url):
        h = (h * 31 + ord(ch) + idx) % (36 ** slug_len)

    chars = []
    num = h
    for _ in range(slug_len):
        chars.append(ALPHABET[num % 36])
        num //= 36
    code = "".join(reversed(chars))
    short_url = f"devy.sh/{code}"
    saved_chars = max(0, len(long_url) - len(short_url))
    return {"code": code, "short_url": short_url, "saved_chars": saved_chars}`,
    solutionCode: `ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"

def shorten_url(long_url: str, slug_len: int = 6) -> dict:
    h = 7
    for idx, ch in enumerate(long_url):
        h = (h * 31 + ord(ch) + idx) % (36 ** slug_len)
    chars = []
    num = h
    for _ in range(slug_len):
        chars.append(ALPHABET[num % 36])
        num //= 36
    code = "".join(reversed(chars))
    short_url = f"devy.sh/{code}"
    saved_chars = max(0, len(long_url) - len(short_url))
    return {"code": code, "short_url": short_url, "saved_chars": saved_chars}`,
    verificationHarness: `
__test_cases__ = [
    ("len(shorten_url('https://devy.app/python/loops')['code'])", lambda: len(shorten_url("https://devy.app/python/loops")["code"]), 6),
    ("shorten_url('https://devy.app/python/loops')['short_url'].startswith('devy.sh/')", lambda: shorten_url("https://devy.app/python/loops")["short_url"].startswith("devy.sh/"), True),
    ("deterministic check", lambda: shorten_url("https://devy.app/a")["code"] == shorten_url("https://devy.app/a")["code"], True),
    ("saved_chars > 0 for long URL", lambda: shorten_url("https://devy.app/tracks/system-design/sharding")["saved_chars"] > 10, True),
]
`,
    defaultInput: {
      url: "https://devy.app/tracks/python/chapter-1/loops",
    },
  },
  {
    id: "dice_rpg",
    title: "Cozy Dice RPG Roller",
    shortTitle: "DICE RPG",
    trackBadge: "ALGORITHMS · PRO",
    accent: "#FF90E8",
    xpReward: 90,
    isPro: true,
    description:
      "Code a deterministic d20 RPG encounter engine with critical hits, attack bonuses, and damage calculation powering a live battle console.",
    checklist: [
      "Compute d20 roll (1..20) deterministically: roll = ((seed * 17 + 13) % 20) + 1.",
      "total = roll + attack_bonus.",
      'Return outcome: "CRIT" if roll == 20, "HIT" if total >= 12, else "MISS", and damage: total * 2 on CRIT, total on HIT, 0 on MISS.',
    ],
    starterCode: `def roll_encounter(seed: int, attack_bonus: int = 3) -> dict:
    roll = ((abs(seed) * 17 + 13) % 20) + 1
    total = roll + attack_bonus
    if roll == 20:
        outcome = "CRIT"
        damage = total * 2
    elif total >= 12:
        outcome = "HIT"
        damage = total
    else:
        outcome = "MISS"
        damage = 0
    return {"roll": roll, "total": total, "outcome": outcome, "damage": damage}`,
    solutionCode: `def roll_encounter(seed: int, attack_bonus: int = 3) -> dict:
    roll = ((abs(seed) * 17 + 13) % 20) + 1
    total = roll + attack_bonus
    if roll == 20:
        outcome = "CRIT"
        damage = total * 2
    elif total >= 12:
        outcome = "HIT"
        damage = total
    else:
        outcome = "MISS"
        damage = 0
    return {"roll": roll, "total": total, "outcome": outcome, "damage": damage}`,
    verificationHarness: `
__test_cases__ = [
    ("1 <= roll <= 20", lambda: 1 <= roll_encounter(5, 2)["roll"] <= 20, True),
    ("crit check (seed=18 -> roll=20)", lambda: roll_encounter(18, 4)["outcome"], "CRIT"),
    ("crit damage doubles total", lambda: roll_encounter(18, 4)["damage"], 48),
    ("miss deals 0 damage", lambda: roll_encounter(2, 0)["damage"], 0),
]
`,
    defaultInput: { seed: 18, attackBonus: 4 },
  },
] as const;

export function getMiniBuildProject(id: MiniBuildId): MiniBuildProject {
  return (
    MINI_BUILD_PROJECTS.find((p) => p.id === id) || MINI_BUILD_PROJECTS[0]
  );
}

export function buildMiniBuildWidgetScript(
  projectId: MiniBuildId,
  userCode: string,
  input: Record<string, string | number>,
): string {
  const safeInputJson = JSON.stringify(input);
  let callExpr = "";
  if (projectId === "password_meter") {
    callExpr = `score_password(str(__in__.get("password", "")))`;
  } else if (projectId === "url_shortener") {
    callExpr = `shorten_url(str(__in__.get("url", "https://devy.app")))`;
  } else {
    callExpr = `roll_encounter(int(__in__.get("seed", 1)), int(__in__.get("attackBonus", 3)))`;
  }

  return `${userCode}

import json as __json__
__in__ = __json__.loads(${JSON.stringify(safeInputJson)})
__out__ = ${callExpr}
print(${JSON.stringify(WIDGET_JSON_MARKER)} + __json__.dumps(__out__))
`;
}

export function parseMiniBuildWidgetOutput(
  stdout: string,
): Record<string, any> | null {
  if (!stdout) return null;
  const lines = stdout.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (line.startsWith(WIDGET_JSON_MARKER)) {
      const jsonPart = line.slice(WIDGET_JSON_MARKER.length);
      try {
        const parsed = JSON.parse(jsonPart);
        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, any>;
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function readCompletedMiniBuilds(): Record<string, boolean> {
  return readLocalJson<Record<string, boolean>>(STORAGE_MINIBUILDS_DONE_KEY, {});
}

export function markMiniBuildCompleted(id: MiniBuildId): Record<string, boolean> {
  const prev = readCompletedMiniBuilds();
  if (prev[id]) return prev;
  const next = { ...prev, [id]: true };
  writeLocalJson(STORAGE_MINIBUILDS_DONE_KEY, next);
  return next;
}

export function resetMiniBuildsForTesting(): void {
  writeLocalJson(STORAGE_MINIBUILDS_DONE_KEY, {});
}
