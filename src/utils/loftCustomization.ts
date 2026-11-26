import { readLocalJson, writeLocalJson } from "./storage";

export const STORAGE_LOFT_WORKSHOP_KEY = "devlearn_loft_workshop_v1";

export type LoftCompanionId =
  | "midnight_cat"
  | "calico_cat"
  | "shiba_pup"
  | "pixel_owl"
  | "robo_duck";

export type LoftWindowWorldId =
  | "neo_tokyo"
  | "starry_observatory"
  | "alpine_cabin"
  | "sakura_kyoto";

export type LoftKeycapSetId =
  | "arcade_neon"
  | "matcha_cream"
  | "sunset_amber"
  | "cyber_sakura";

export type LoftMugStyleId =
  | "ceramic_brew"
  | "matcha_whisk"
  | "pixel_heart"
  | "starlight_thermos";

export type LoftWorkshopSlot =
  | "companion"
  | "windowWorld"
  | "keycaps"
  | "mugStyle";

export interface LoftCustomizationState {
  companion: LoftCompanionId;
  windowWorld: LoftWindowWorldId;
  keycaps: LoftKeycapSetId;
  mugStyle: LoftMugStyleId;
}

export interface LoftCompanionMeta {
  id: LoftCompanionId;
  label: string;
  shortName: string;
  description: string;
  unlockXp: number;
  coatColor: string;
  bellyColor: string;
  earInnerColor: string;
  accentColor: string;
  pawColor: string;
  petToast: string;
  hintVerb: string;
}

export interface LoftWindowWorldMeta {
  id: LoftWindowWorldId;
  label: string;
  description: string;
  unlockXp: number;
  swatchPrimary: string;
  swatchSecondary: string;
  toastLabel: string;
}

export interface LoftKeycapSetMeta {
  id: LoftKeycapSetId;
  label: string;
  description: string;
  unlockXp: number;
  caseTop: string;
  caseLeft: string;
  caseRight: string;
  escColor: string;
  enterColor: string;
  alphaHighlight: string;
}

export interface LoftMugStyleMeta {
  id: LoftMugStyleId;
  label: string;
  description: string;
  unlockXp: number;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  drinkColor: string;
  sipToast: string;
}

export const DEFAULT_LOFT_CUSTOMIZATION: LoftCustomizationState = {
  companion: "midnight_cat",
  windowWorld: "neo_tokyo",
  keycaps: "arcade_neon",
  mugStyle: "ceramic_brew",
};

export const LOFT_COMPANIONS: readonly LoftCompanionMeta[] = [
  {
    id: "midnight_cat",
    label: "Midnight Cat",
    shortName: "CAT",
    description: "Original cozy studio cat with glowing visor & golden headphones.",
    unlockXp: 0,
    coatColor: "#2A2F46",
    bellyColor: "rgba(196, 181, 253, 0.18)",
    earInnerColor: "#FF90E8",
    accentColor: "#FFDE59",
    pawColor: "#3A4262",
    petToast: "MIDNIGHT CAT PURRS · +COZY VIBES ★",
    hintVerb: "PET CAT",
  },
  {
    id: "calico_cat",
    label: "Calico Cat",
    shortName: "CALICO",
    description: "Warm cream tabby with caramel patches and coral ears.",
    unlockXp: 250,
    coatColor: "#F4E8D4",
    bellyColor: "#FFF9EE",
    earInnerColor: "#FB7185",
    accentColor: "#EA8C3A",
    pawColor: "#E4C6A3",
    petToast: "CALICO CAT KNEADS THE RUG · PURR ★",
    hintVerb: "PET CALICO",
  },
  {
    id: "shiba_pup",
    label: "Shiba Pup",
    shortName: "SHIBA",
    description: "Fluffy golden shiba with cream cheeks and a wagging curled tail.",
    unlockXp: 600,
    coatColor: "#E59A4B",
    bellyColor: "#FFF3DC",
    earInnerColor: "#FCA5A5",
    accentColor: "#FFDE59",
    pawColor: "#F6DFC0",
    petToast: "SHIBA PUP WAGS TAIL · GOOD BOY ★",
    hintVerb: "PET SHIBA",
  },
  {
    id: "pixel_owl",
    label: "Pixel Owl",
    shortName: "OWL",
    description: "Nocturnal plum-violet owl with golden eyes and feathered tufts.",
    unlockXp: 1200,
    coatColor: "#4B3B6B",
    bellyColor: "#C4B5FD",
    earInnerColor: "#FDE047",
    accentColor: "#F59E0B",
    pawColor: "#F59E0B",
    petToast: "PIXEL OWL HOOTS SOFTLY · WHOO-HOO ★",
    hintVerb: "PET OWL",
  },
  {
    id: "robo_duck",
    label: "Mini Robo-Duck",
    shortName: "DUCK",
    description: "Rubber-duck debugging partner upgraded with chrome antenna & visor.",
    unlockXp: 2000,
    coatColor: "#FACC15",
    bellyColor: "#FEF08A",
    earInnerColor: "#FB923C",
    accentColor: "#38BDF8",
    pawColor: "#F97316",
    petToast: "ROBO-DUCK QUACKS IN BINARY · 0101 ★",
    hintVerb: "PET DUCK",
  },
] as const;

export const LOFT_WINDOW_WORLDS: readonly LoftWindowWorldMeta[] = [
  {
    id: "neo_tokyo",
    label: "Neo-Tokyo Skyline",
    description: "Glowing high-rise skyline with a gliding midnight commuter train.",
    unlockXp: 0,
    swatchPrimary: "#1E293B",
    swatchSecondary: "#FF90E8",
    toastLabel: "NEO-TOKYO SKYLINE",
  },
  {
    id: "starry_observatory",
    label: "Starry Observatory",
    description: "Cosmic aurora ribbon, twin observatory domes, and shooting stars.",
    unlockXp: 300,
    swatchPrimary: "#1B1538",
    swatchSecondary: "#38BDF8",
    toastLabel: "STARRY OBSERVATORY",
  },
  {
    id: "alpine_cabin",
    label: "Alpine Peaks",
    description: "Snow-capped mountain silhouettes, pine ridge, and aurora glow.",
    unlockXp: 750,
    swatchPrimary: "#132A38",
    swatchSecondary: "#6EE7B7",
    toastLabel: "ALPINE PEAKS",
  },
  {
    id: "sakura_kyoto",
    label: "Sakura Courtyard",
    description: "Pagoda eaves, warm paper lanterns, and drifting cherry petals.",
    unlockXp: 1500,
    swatchPrimary: "#2D1833",
    swatchSecondary: "#F472B6",
    toastLabel: "SAKURA COURTYARD",
  },
] as const;

export const LOFT_KEYCAP_SETS: readonly LoftKeycapSetMeta[] = [
  {
    id: "arcade_neon",
    label: "Arcade Neon",
    description: "Obsidian chassis with neon pink Esc and electric Enter accents.",
    unlockXp: 0,
    caseTop: "#2C3347",
    caseLeft: "#1F2434",
    caseRight: "#151926",
    escColor: "#FF90E8",
    enterColor: "#B8FF3B",
    alphaHighlight: "#475569",
  },
  {
    id: "matcha_cream",
    label: "Matcha Cream",
    description: "Warm cream PBT keycaps accented with ceremonial matcha green.",
    unlockXp: 200,
    caseTop: "#E8E2D2",
    caseLeft: "#CBC3B0",
    caseRight: "#A9A08C",
    escColor: "#4ADE80",
    enterColor: "#15803D",
    alphaHighlight: "#C6D8C0",
  },
  {
    id: "sunset_amber",
    label: "Sunset Amber",
    description: "Warm espresso deck topped with golden amber & coral keycaps.",
    unlockXp: 500,
    caseTop: "#422C22",
    caseLeft: "#301F18",
    caseRight: "#20140F",
    escColor: "#FB7185",
    enterColor: "#F59E0B",
    alphaHighlight: "#8A5A3E",
  },
  {
    id: "cyber_sakura",
    label: "Cyber Sakura",
    description: "Frosty lavender board with sakura blossom & cyan legends.",
    unlockXp: 1000,
    caseTop: "#3B284C",
    caseLeft: "#2A1C37",
    caseRight: "#1D1326",
    escColor: "#F472B6",
    enterColor: "#38BDF8",
    alphaHighlight: "#C4B5FD",
  },
] as const;

export const LOFT_MUG_STYLES: readonly LoftMugStyleMeta[] = [
  {
    id: "ceramic_brew",
    label: "Classic Ceramic",
    description: "Cozy stoneware mug filled with warm late-night coffee.",
    unlockXp: 0,
    bodyTop: "#F6F1E7",
    bodyLeft: "#DDD6C8",
    bodyRight: "#C2B9A8",
    drinkColor: "#6B4226",
    sipToast: "FRESH BREW · +10 FOCUS",
  },
  {
    id: "matcha_whisk",
    label: "Matcha Bowl",
    description: "Forest-glazed ceramic cup brimming with whisked matcha.",
    unlockXp: 150,
    bodyTop: "#335C45",
    bodyLeft: "#244332",
    bodyRight: "#182E22",
    drinkColor: "#86EFAC",
    sipToast: "CEREMONIAL MATCHA · CALM FLOW",
  },
  {
    id: "pixel_heart",
    label: "Blush Cocoa Cup",
    description: "Pastel sakura mug filled with steaming hot chocolate.",
    unlockXp: 450,
    bodyTop: "#FBCFE8",
    bodyLeft: "#F472B6",
    bodyRight: "#DB2777",
    drinkColor: "#78350F",
    sipToast: "WARM COCOA · +COZY ENERGY",
  },
  {
    id: "starlight_thermos",
    label: "Astral Tumbler",
    description: "Midnight obsidian thermos rimmed with liquid starlight.",
    unlockXp: 900,
    bodyTop: "#1E293B",
    bodyLeft: "#0F172A",
    bodyRight: "#090E1A",
    drinkColor: "#FFDE59",
    sipToast: "STARLIGHT ELIXIR · HYPERFOCUS",
  },
] as const;

type LoftCustomizationListener = (state: LoftCustomizationState) => void;
const listeners = new Set<LoftCustomizationListener>();

const VALID_COMPANIONS = new Set<string>(LOFT_COMPANIONS.map((c) => c.id));
const VALID_WINDOWS = new Set<string>(LOFT_WINDOW_WORLDS.map((w) => w.id));
const VALID_KEYCAPS = new Set<string>(LOFT_KEYCAP_SETS.map((k) => k.id));
const VALID_MUGS = new Set<string>(LOFT_MUG_STYLES.map((m) => m.id));

export function sanitizeLoftCustomization(raw: unknown): LoftCustomizationState {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_LOFT_CUSTOMIZATION };
  }
  const obj = raw as Record<string, unknown>;
  return {
    companion:
      typeof obj.companion === "string" && VALID_COMPANIONS.has(obj.companion)
        ? (obj.companion as LoftCompanionId)
        : DEFAULT_LOFT_CUSTOMIZATION.companion,
    windowWorld:
      typeof obj.windowWorld === "string" && VALID_WINDOWS.has(obj.windowWorld)
        ? (obj.windowWorld as LoftWindowWorldId)
        : DEFAULT_LOFT_CUSTOMIZATION.windowWorld,
    keycaps:
      typeof obj.keycaps === "string" && VALID_KEYCAPS.has(obj.keycaps)
        ? (obj.keycaps as LoftKeycapSetId)
        : DEFAULT_LOFT_CUSTOMIZATION.keycaps,
    mugStyle:
      typeof obj.mugStyle === "string" && VALID_MUGS.has(obj.mugStyle)
        ? (obj.mugStyle as LoftMugStyleId)
        : DEFAULT_LOFT_CUSTOMIZATION.mugStyle,
  };
}

function emit(state: LoftCustomizationState) {
  listeners.forEach((fn) => fn(state));
}

export function getLoftCustomizationState(): LoftCustomizationState {
  return sanitizeLoftCustomization(
    readLocalJson<Partial<LoftCustomizationState>>(
      STORAGE_LOFT_WORKSHOP_KEY,
      DEFAULT_LOFT_CUSTOMIZATION,
    ),
  );
}

export function updateLoftCustomization(
  patch: Partial<LoftCustomizationState>,
): LoftCustomizationState {
  const next = sanitizeLoftCustomization({
    ...getLoftCustomizationState(),
    ...patch,
  });
  writeLocalJson(STORAGE_LOFT_WORKSHOP_KEY, next);
  emit(next);
  return next;
}

export function subscribeLoftCustomization(
  listener: LoftCustomizationListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCompanionMeta(id: LoftCompanionId): LoftCompanionMeta {
  return LOFT_COMPANIONS.find((c) => c.id === id) || LOFT_COMPANIONS[0];
}

export function getWindowWorldMeta(id: LoftWindowWorldId): LoftWindowWorldMeta {
  return LOFT_WINDOW_WORLDS.find((w) => w.id === id) || LOFT_WINDOW_WORLDS[0];
}

export function getKeycapSetMeta(id: LoftKeycapSetId): LoftKeycapSetMeta {
  return LOFT_KEYCAP_SETS.find((k) => k.id === id) || LOFT_KEYCAP_SETS[0];
}

export function getMugStyleMeta(id: LoftMugStyleId): LoftMugStyleMeta {
  return LOFT_MUG_STYLES.find((m) => m.id === id) || LOFT_MUG_STYLES[0];
}

export function isLoftWorkshopItemUnlocked(
  unlockXp: number,
  totalXp: number,
  unlockAllOverride = false,
): boolean {
  if (unlockAllOverride) return true;
  return Math.max(0, Math.floor(totalXp || 0)) >= Math.max(0, unlockXp);
}

export function countUnlockedLoftWorkshopItems(
  totalXp: number,
  unlockAllOverride = false,
): { unlocked: number; total: number } {
  const allCosts = [
    ...LOFT_COMPANIONS.map((c) => c.unlockXp),
    ...LOFT_WINDOW_WORLDS.map((w) => w.unlockXp),
    ...LOFT_KEYCAP_SETS.map((k) => k.unlockXp),
    ...LOFT_MUG_STYLES.map((m) => m.unlockXp),
  ];
  const unlocked = allCosts.filter((cost) =>
    isLoftWorkshopItemUnlocked(cost, totalXp, unlockAllOverride),
  ).length;
  return { unlocked, total: allCosts.length };
}
