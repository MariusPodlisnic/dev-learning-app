import { readLocalJson, writeLocalJson } from "./storage";

export type ByteCatAccessorySlot = "head" | "eyewear" | "neck";

export type ByteCatAccessoryId =
  | "headphones"
  | "wizard_hat"
  | "sakura_beanie"
  | "crt_glasses"
  | "star_visor"
  | "sakura_scarf";

export type ByteCatMoodId = "cozy" | "focused" | "sleepy" | "hyped";

export interface ByteCatAccessoryMeta {
  id: ByteCatAccessoryId;
  slot: ByteCatAccessorySlot;
  name: string;
  shortName: string;
  icon: string;
  accent: string;
  minXp: number;
  minStreak?: number;
  unlockHint: string;
}

export interface ByteCatMoodMeta {
  id: ByteCatMoodId;
  label: string;
  chipLabel: string;
  icon: string;
  accent: string;
  whisper: string;
  crtFace: string;
}

export interface ByteCatEquippedAccessories {
  head: ByteCatAccessoryId | null;
  eyewear: ByteCatAccessoryId | null;
  neck: ByteCatAccessoryId | null;
}

export interface ByteCatWardrobeState {
  equipped: ByteCatEquippedAccessories;
  mood: ByteCatMoodId;
}

export interface ByteCatUnlockContext {
  xpPoints: number;
  streakCount: number;
  isPremium: boolean;
}

export const STORAGE_BYTECAT_WARDROBE_KEY = "devlearn_bytecat_wardrobe_v1";

export const BYTE_CAT_ACCESSORIES: readonly ByteCatAccessoryMeta[] = [
  {
    id: "headphones",
    slot: "head",
    name: "Studio Headphones",
    shortName: "Headphones",
    icon: "🎧",
    accent: "#FFDE59",
    minXp: 0,
    unlockHint: "Starter gear",
  },
  {
    id: "crt_glasses",
    slot: "eyewear",
    name: "CRT Pixel Glasses",
    shortName: "CRT Glasses",
    icon: "🕶️",
    accent: "#6EE7B7",
    minXp: 0,
    unlockHint: "Starter gear",
  },
  {
    id: "sakura_scarf",
    slot: "neck",
    name: "Sakura Knit Scarf",
    shortName: "Sakura Scarf",
    icon: "🧣",
    accent: "#FF90E8",
    minXp: 100,
    minStreak: 2,
    unlockHint: "100 XP or 2d streak",
  },
  {
    id: "wizard_hat",
    slot: "head",
    name: "Code Wizard Hat",
    shortName: "Wizard Hat",
    icon: "🧙",
    accent: "#C4B5FD",
    minXp: 200,
    unlockHint: "200 XP or Pro",
  },
  {
    id: "sakura_beanie",
    slot: "head",
    name: "Cozy Knit Beanie",
    shortName: "Knit Beanie",
    icon: "🧶",
    accent: "#FB923C",
    minXp: 500,
    minStreak: 3,
    unlockHint: "500 XP or 3d streak",
  },
  {
    id: "star_visor",
    slot: "eyewear",
    name: "Arcade Star Visor",
    shortName: "Star Visor",
    icon: "✨",
    accent: "#A3E635",
    minXp: 1000,
    minStreak: 5,
    unlockHint: "1,000 XP or 5d streak",
  },
] as const;

export const BYTE_CAT_MOODS: readonly ByteCatMoodMeta[] = [
  {
    id: "cozy",
    label: "Cozy Flow",
    chipLabel: "☕ COZY",
    icon: "☕",
    accent: "#6EE7B7",
    whisper: "☕ COZY LO-FI FLOW",
    crtFace: "( ^_ ^ )",
  },
  {
    id: "focused",
    label: "Deep Focus",
    chipLabel: "⚡ FOCUS",
    icon: "⚡",
    accent: "#38BDF8",
    whisper: "⚡ LOCKED IN & CODING",
    crtFace: "( ▀_▀ )",
  },
  {
    id: "sleepy",
    label: "Rainy Chill",
    chipLabel: "🌙 CHILL",
    icon: "🌙",
    accent: "#C4B5FD",
    whisper: "🌙 SOFT RAIN & CHILL",
    crtFace: "( -_- ) zZ",
  },
  {
    id: "hyped",
    label: "Ship-It Hype",
    chipLabel: "★ HYPE",
    icon: "★",
    accent: "#FFDE59",
    whisper: "★ READY TO SHIP CODE!",
    crtFace: "( ★_★ )",
  },
] as const;

const VALID_ACCESSORY_IDS = new Set<string>(
  BYTE_CAT_ACCESSORIES.map((item) => item.id),
);
const VALID_MOOD_IDS = new Set<string>(BYTE_CAT_MOODS.map((m) => m.id));

function createDefaultState(): ByteCatWardrobeState {
  return {
    equipped: {
      head: "headphones",
      eyewear: null,
      neck: null,
    },
    mood: "cozy",
  };
}

function isValidAccessoryForSlot(
  id: unknown,
  slot: ByteCatAccessorySlot,
): id is ByteCatAccessoryId {
  if (typeof id !== "string" || !VALID_ACCESSORY_IDS.has(id)) return false;
  const meta = BYTE_CAT_ACCESSORIES.find((item) => item.id === id);
  return Boolean(meta && meta.slot === slot);
}

function sanitizeWardrobeState(
  raw: Partial<ByteCatWardrobeState> | null | undefined,
): ByteCatWardrobeState {
  const def = createDefaultState();
  if (!raw || typeof raw !== "object") return def;

  const rawEquipped =
    raw.equipped && typeof raw.equipped === "object" ? raw.equipped : undefined;
  const head =
    rawEquipped && rawEquipped.head === null
      ? null
      : rawEquipped && isValidAccessoryForSlot(rawEquipped.head, "head")
        ? rawEquipped.head
        : def.equipped.head;
  const eyewear =
    rawEquipped && isValidAccessoryForSlot(rawEquipped.eyewear, "eyewear")
      ? rawEquipped.eyewear
      : null;
  const neck =
    rawEquipped && isValidAccessoryForSlot(rawEquipped.neck, "neck")
      ? rawEquipped.neck
      : null;

  const mood: ByteCatMoodId =
    typeof raw.mood === "string" && VALID_MOOD_IDS.has(raw.mood)
      ? (raw.mood as ByteCatMoodId)
      : def.mood;

  return {
    equipped: { head, eyewear, neck },
    mood,
  };
}

let currentState: ByteCatWardrobeState = sanitizeWardrobeState(
  readLocalJson<Partial<ByteCatWardrobeState>>(
    STORAGE_BYTECAT_WARDROBE_KEY,
    createDefaultState(),
  ),
);

const listeners = new Set<(state: ByteCatWardrobeState) => void>();

function cloneState(): ByteCatWardrobeState {
  return {
    equipped: { ...currentState.equipped },
    mood: currentState.mood,
  };
}

function notifyListeners(): void {
  const snapshot = cloneState();
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // Ignore subscriber errors
    }
  });
}

function persistState(): void {
  writeLocalJson(STORAGE_BYTECAT_WARDROBE_KEY, currentState);
}

export function getByteCatAccessoryMeta(
  id: ByteCatAccessoryId,
): ByteCatAccessoryMeta | undefined {
  return BYTE_CAT_ACCESSORIES.find((item) => item.id === id);
}

export function getByteCatMoodMeta(
  id: ByteCatMoodId = currentState.mood,
): ByteCatMoodMeta {
  return BYTE_CAT_MOODS.find((m) => m.id === id) || BYTE_CAT_MOODS[0];
}

export function isByteCatAccessoryUnlocked(
  id: ByteCatAccessoryId,
  ctx: ByteCatUnlockContext,
): boolean {
  const meta = getByteCatAccessoryMeta(id);
  if (!meta) return false;
  if (meta.minXp <= 0) return true;
  if (ctx.isPremium) return true;
  if (ctx.xpPoints >= meta.minXp) return true;
  if (typeof meta.minStreak === "number" && ctx.streakCount >= meta.minStreak) {
    return true;
  }
  return false;
}

export function getByteCatWardrobeState(): ByteCatWardrobeState {
  return cloneState();
}

export function subscribeByteCatWardrobe(
  listener: (state: ByteCatWardrobeState) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toggleByteCatAccessory(
  id: ByteCatAccessoryId,
  ctx: ByteCatUnlockContext,
): { changed: boolean; equippedNow: boolean; state: ByteCatWardrobeState } {
  const meta = getByteCatAccessoryMeta(id);
  if (!meta) {
    return { changed: false, equippedNow: false, state: cloneState() };
  }
  if (!isByteCatAccessoryUnlocked(id, ctx)) {
    return { changed: false, equippedNow: false, state: cloneState() };
  }

  const currentlyEquipped = currentState.equipped[meta.slot] === id;
  currentState = {
    ...currentState,
    equipped: {
      ...currentState.equipped,
      [meta.slot]: currentlyEquipped ? null : id,
    },
  };
  persistState();
  notifyListeners();
  return {
    changed: true,
    equippedNow: !currentlyEquipped,
    state: cloneState(),
  };
}

export function setByteCatMood(moodId: ByteCatMoodId): ByteCatWardrobeState {
  if (!VALID_MOOD_IDS.has(moodId)) return cloneState();
  if (currentState.mood === moodId) return cloneState();
  currentState = {
    ...currentState,
    mood: moodId,
  };
  persistState();
  notifyListeners();
  return cloneState();
}

export function getEquippedAccessoryList(
  state: ByteCatWardrobeState = currentState,
): ByteCatAccessoryMeta[] {
  const ids = [state.equipped.head, state.equipped.eyewear, state.equipped.neck];
  return ids
    .filter((id): id is ByteCatAccessoryId => Boolean(id))
    .map((id) => getByteCatAccessoryMeta(id))
    .filter((item): item is ByteCatAccessoryMeta => Boolean(item));
}

export function resetByteCatWardrobeForTesting(): void {
  currentState = createDefaultState();
  persistState();
  notifyListeners();
}
