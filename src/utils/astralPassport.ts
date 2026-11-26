import type { StudioPaletteId } from "../constants/theme";
import type { Lesson } from "../types/lesson";
import { resolveCodexEntries } from "./constellationCodex";
import {
  getCompanionMeta,
  getLoftCustomizationState,
  type LoftCompanionId,
} from "./loftCustomization";
import { getLoftThemeColors } from "./loftGeometry";
import { computeLoftMilestoneTrophies } from "./loftMilestones";

export interface PassportLessonLike {
  id: string;
  track: string;
  lesson_order: number;
  is_recap?: boolean;
  recap_chapter?: number;
}

export type PassportBonsaiStageId =
  | "seedling"
  | "sprout"
  | "sapling"
  | "blossom"
  | "celestial";

export interface PassportBonsaiInfo {
  id: PassportBonsaiStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  label: string;
  caption: string;
  blossomCount: number;
}

export interface PassportStarPoint {
  nx: number;
  ny: number;
}

export interface PassportConstellationWing {
  trackKey: "python_basics" | "algorithms" | "system_design";
  shortCode: "PY" | "ALG" | "SYS";
  constellationName: string;
  accent: string;
  solvedCount: number;
  totalCount: number;
  pct: number;
  illuminatedStars: number;
  stars: readonly PassportStarPoint[];
  edges: readonly [number, number][];
}

export interface PassportStamp {
  id: "star_chart" | "bonfire" | "arcade_ace" | "codex_keeper";
  label: string;
  shortTag: string;
  accent: string;
  unlocked: boolean;
  requirement: string;
}

export type PassportRarityTier =
  | "INITIATE"
  | "VOYAGER"
  | "NAVIGATOR"
  | "ARCHITECT"
  | "CELESTIAL";

export interface PassportRarityInfo {
  tier: PassportRarityTier;
  badgeText: string;
  foilPrimary: string;
  foilSecondary: string;
}

export interface AstralPassportData {
  serialNumber: string;
  handle: string;
  rankLevel: number;
  rankTitle: string;
  rankAccent: string;
  isPremium: boolean;
  xpPoints: number;
  streakCount: number;
  totalSolved: number;
  totalLessons: number;
  codexIlluminated: number;
  codexTotal: number;
  companionId: LoftCompanionId;
  companionLabel: string;
  rarity: PassportRarityInfo;
  bonsai: PassportBonsaiInfo;
  constellations: readonly PassportConstellationWing[];
  stamps: readonly PassportStamp[];
  stampsEarnedCount: number;
}

export interface PassportTiltState {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
  foilAngle: number;
  isHovering: boolean;
}

export interface BuildAstralPassportInput {
  displayName?: string;
  userEmail?: string;
  rankLevel: number;
  rankTitle: string;
  rankAccent: string;
  isPremium: boolean;
  xpPoints: number;
  streakCount: number;
  lessons: readonly PassportLessonLike[];
  completedLessons: Record<string, boolean>;
  blitzBestHits?: number;
  solvedBugCount?: number;
  completedMiniBuildsCount?: number;
  companionId?: LoftCompanionId;
}

const WING_TEMPLATES: readonly {
  trackKey: "python_basics" | "algorithms" | "system_design";
  shortCode: "PY" | "ALG" | "SYS";
  constellationName: string;
  accent: string;
  stars: readonly PassportStarPoint[];
  edges: readonly [number, number][];
}[] = [
  {
    trackKey: "python_basics",
    shortCode: "PY",
    constellationName: "SERPENS",
    accent: "#FFDE59",
    stars: [
      { nx: 0.08, ny: 0.72 },
      { nx: 0.14, ny: 0.44 },
      { nx: 0.21, ny: 0.56 },
      { nx: 0.26, ny: 0.28 },
      { nx: 0.31, ny: 0.44 },
      { nx: 0.28, ny: 0.74 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [2, 5],
    ],
  },
  {
    trackKey: "algorithms",
    shortCode: "ALG",
    constellationName: "DRACO",
    accent: "#C4B5FD",
    stars: [
      { nx: 0.4, ny: 0.68 },
      { nx: 0.45, ny: 0.36 },
      { nx: 0.52, ny: 0.22 },
      { nx: 0.59, ny: 0.42 },
      { nx: 0.53, ny: 0.62 },
      { nx: 0.63, ny: 0.74 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [3, 5],
    ],
  },
  {
    trackKey: "system_design",
    shortCode: "SYS",
    constellationName: "NEXUS",
    accent: "#6EE7B7",
    stars: [
      { nx: 0.72, ny: 0.48 },
      { nx: 0.78, ny: 0.24 },
      { nx: 0.86, ny: 0.44 },
      { nx: 0.93, ny: 0.28 },
      { nx: 0.91, ny: 0.66 },
      { nx: 0.79, ny: 0.74 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [4, 5],
      [5, 0],
    ],
  },
];

function hashStringToHex(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

export function buildPassportSerial(
  identitySeed: string,
  rankLevel: number,
): string {
  const lvl = String(Math.max(1, Math.min(99, Math.floor(rankLevel)))).padStart(
    2,
    "0",
  );
  const cleanSeed = identitySeed.trim().toLowerCase();
  const suffix = cleanSeed ? hashStringToHex(`devy:${cleanSeed}`) : "STAR";
  return `DVY-${lvl}-${suffix}`;
}

export function computePassportRarity(rankLevel: number): PassportRarityInfo {
  if (rankLevel >= 9) {
    return {
      tier: "CELESTIAL",
      badgeText: "✦ CELESTIAL",
      foilPrimary: "#B8FF3B",
      foilSecondary: "#FF90E8",
    };
  }
  if (rankLevel >= 7) {
    return {
      tier: "ARCHITECT",
      badgeText: "◆ ARCHITECT",
      foilPrimary: "#38BDF8",
      foilSecondary: "#C4B5FD",
    };
  }
  if (rankLevel >= 5) {
    return {
      tier: "NAVIGATOR",
      badgeText: "★ NAVIGATOR",
      foilPrimary: "#C4B5FD",
      foilSecondary: "#6EE7B7",
    };
  }
  if (rankLevel >= 3) {
    return {
      tier: "VOYAGER",
      badgeText: "▲ VOYAGER",
      foilPrimary: "#FF90E8",
      foilSecondary: "#FFDE59",
    };
  }
  return {
    tier: "INITIATE",
    badgeText: "● INITIATE",
    foilPrimary: "#FFDE59",
    foilSecondary: "#6EE7B7",
  };
}

export function computePassportBonsaiStage(
  streakCount: number,
  totalSolved: number,
): PassportBonsaiInfo {
  const safeStreak = Math.max(0, Math.floor(streakCount || 0));
  const safeSolved = Math.max(0, Math.floor(totalSolved || 0));

  if (safeStreak >= 21 || safeSolved >= 35) {
    return {
      id: "celestial",
      stageNumber: 5,
      label: "CELESTIAL BONSAI",
      caption: "Radiant star-crowned canopy",
      blossomCount: 7,
    };
  }
  if (safeStreak >= 10 || safeSolved >= 18) {
    return {
      id: "blossom",
      stageNumber: 4,
      label: "BLOOMING BONSAI",
      caption: "Full streak petals in bloom",
      blossomCount: 5,
    };
  }
  if (safeStreak >= 5 || safeSolved >= 8) {
    return {
      id: "sapling",
      stageNumber: 3,
      label: "COZY SAPLING",
      caption: "Sculpted loft canopy",
      blossomCount: 3,
    };
  }
  if (safeStreak >= 2 || safeSolved >= 3) {
    return {
      id: "sprout",
      stageNumber: 2,
      label: "YOUNG SPROUT",
      caption: "Twin leaves reaching light",
      blossomCount: 1,
    };
  }
  return {
    id: "seedling",
    stageNumber: 1,
    label: "FRESH SEEDLING",
    caption: "Planted in terracotta soil",
    blossomCount: 0,
  };
}

export function computePassportTilt(
  normX: number,
  normY: number,
  isHovering = true,
): PassportTiltState {
  if (!isHovering) {
    return {
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      foilAngle: 125,
      isHovering: false,
    };
  }
  const cx = Math.max(-1, Math.min(1, Number.isFinite(normX) ? normX : 0));
  const cy = Math.max(-1, Math.min(1, Number.isFinite(normY) ? normY : 0));
  const rotateY = Math.round(cx * 7.5 * 100) / 100;
  const rotateX = Math.round(-cy * 6.5 * 100) / 100;
  const glareX = Math.round((cx * 0.5 + 0.5) * 100);
  const glareY = Math.round((cy * 0.5 + 0.5) * 100);
  const foilAngle = Math.round(125 + cx * 32 - cy * 18);
  return {
    rotateX,
    rotateY,
    glareX,
    glareY,
    foilAngle,
    isHovering: true,
  };
}

export function buildAstralPassportData(
  input: BuildAstralPassportInput,
): AstralPassportData {
  const {
    displayName,
    userEmail,
    rankLevel,
    rankTitle,
    rankAccent,
    isPremium,
    xpPoints,
    streakCount,
    lessons,
    completedLessons,
    blitzBestHits = 0,
    solvedBugCount = 0,
    completedMiniBuildsCount = 0,
    companionId,
  } = input;

  const totalLessons = lessons.length;
  const totalSolved = lessons.filter((l) => completedLessons[l.id]).length;

  const constellations: PassportConstellationWing[] = WING_TEMPLATES.map(
    (tpl) => {
      const trackLessons = lessons.filter((l) => l.track === tpl.trackKey);
      const solvedCount = trackLessons.filter(
        (l) => completedLessons[l.id],
      ).length;
      const totalCount = trackLessons.length;
      const pct =
        totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
      const starCount = tpl.stars.length;
      const illuminatedStars =
        solvedCount <= 0
          ? 0
          : Math.min(
              starCount,
              Math.max(1, Math.round((solvedCount / Math.max(1, totalCount)) * starCount)),
            );

      return {
        trackKey: tpl.trackKey,
        shortCode: tpl.shortCode,
        constellationName: tpl.constellationName,
        accent: tpl.accent,
        solvedCount,
        totalCount,
        pct,
        illuminatedStars,
        stars: tpl.stars,
        edges: tpl.edges,
      };
    },
  );

  const codexEntries = resolveCodexEntries(
    lessons as unknown as readonly Lesson[],
    completedLessons,
  );
  const codexIlluminated = codexEntries.filter((e) => e.unlocked).length;
  const codexTotal = codexEntries.length;
  const trophies = computeLoftMilestoneTrophies({
    lessons,
    completedLessons,
    streakCount,
    blitzBestHits,
    solvedBugCount,
    completedMiniBuildsCount,
  });

  const stamps: PassportStamp[] = [
    {
      id: "star_chart",
      label: "STAR CHART",
      shortTag: "CH. I",
      accent: "#FFDE59",
      unlocked: trophies.serpensPoster,
      requirement: "Clear Ch. I or 5+ labs",
    },
    {
      id: "bonfire",
      label: "BONFIRE",
      shortTag: "5D+",
      accent: "#FB923C",
      unlocked: trophies.fairyLights,
      requirement: "Reach a 5-day streak",
    },
    {
      id: "arcade_ace",
      label: "ARCADE ACE",
      shortTag: "S-RNK",
      accent: "#FF90E8",
      unlocked: trophies.arcadeTrophy,
      requirement: "Blitz S-Rank or 5+ bugs",
    },
    {
      id: "codex_keeper",
      label: "CODEX",
      shortTag: "GRIM",
      accent: "#6EE7B7",
      unlocked: codexIlluminated >= 5 || trophies.holoPrism,
      requirement: "Illuminate 5+ Codex cards",
    },
  ];

  const handle =
    displayName?.trim() ||
    (userEmail ? userEmail.split("@")[0] : "") ||
    "Devy Voyager";

  const activeCompanionId = companionId || getLoftCustomizationState().companion;
  const companionMeta = getCompanionMeta(activeCompanionId);

  return {
    serialNumber: buildPassportSerial(displayName || userEmail || "", rankLevel),
    handle,
    rankLevel,
    rankTitle,
    rankAccent,
    isPremium,
    xpPoints,
    streakCount,
    totalSolved,
    totalLessons,
    codexIlluminated,
    codexTotal,
    companionId: companionMeta.id,
    companionLabel: companionMeta.label,
    rarity: computePassportRarity(rankLevel),
    bonsai: computePassportBonsaiStage(streakCount, totalSolved),
    constellations,
    stamps,
    stampsEarnedCount: stamps.filter((s) => s.unlocked).length,
  };
}

/**
 * Generates crisp self-contained SVG inner elements for the illuminated mini constellation map.
 * Works identically in AstralDevPassportCard (viewBox 0 0 360 112) and shareCardImage PNG export.
 */
export function buildMiniConstellationSvgInner(
  constellations: readonly PassportConstellationWing[],
  width = 360,
  height = 112,
  labelFontSize = 8.5,
): string {
  // Subtle ambient background starfield dust (deterministic positions)
  const dustCoords: [number, number, number, number][] = [
    [0.04, 0.18, 1.0, 0.35],
    [0.12, 0.86, 1.2, 0.28],
    [0.19, 0.15, 0.9, 0.4],
    [0.34, 0.2, 1.1, 0.3],
    [0.37, 0.85, 1.0, 0.35],
    [0.48, 0.82, 1.3, 0.26],
    [0.56, 0.14, 1.0, 0.42],
    [0.67, 0.22, 1.1, 0.32],
    [0.69, 0.86, 0.9, 0.3],
    [0.83, 0.14, 1.2, 0.38],
    [0.96, 0.45, 1.0, 0.34],
    [0.95, 0.84, 1.1, 0.28],
  ];

  const dustSvg = dustCoords
    .map(
      ([nx, ny, r, op]) =>
        `<circle cx="${(nx * width).toFixed(1)}" cy="${(ny * height).toFixed(1)}" r="${r}" fill="#E2E8F0" fill-opacity="${op}" />`,
    )
    .join("");

  // Soft nebula washes under each track wing
  const nebulaSvg = constellations
    .map((wing, idx) => {
      const cx = (0.19 + idx * 0.315) * width;
      const cy = 0.5 * height;
      const op = wing.illuminatedStars > 0 ? 0.14 : 0.05;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(width * 0.15).toFixed(1)}" ry="${(height * 0.38).toFixed(1)}" fill="${wing.accent}" fill-opacity="${op}" />`;
    })
    .join("");

  const wingsSvg = constellations
    .map((wing) => {
      const pts = wing.stars.map((s) => ({
        x: s.nx * width,
        y: s.ny * (height - 18) + 4,
      }));

      const edgesHtml = wing.edges
        .map(([a, b]) => {
          const p1 = pts[a];
          const p2 = pts[b];
          if (!p1 || !p2) return "";
          const lit = a < wing.illuminatedStars && b < wing.illuminatedStars;
          return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${lit ? wing.accent : "#64748B"}" stroke-width="${lit ? "1.8" : "1"}" stroke-opacity="${lit ? "0.9" : "0.32"}"${lit ? "" : ' stroke-dasharray="2.5 2.5"'} />`;
        })
        .join("");

      const nodesHtml = pts
        .map((p, idx) => {
          const lit = idx < wing.illuminatedStars;
          if (lit) {
            return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${wing.accent}" fill-opacity="0.24" /><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.1" fill="${wing.accent}" stroke="#090B10" stroke-width="1" />`;
          }
          return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.2" fill="#1E293B" stroke="#64748B" stroke-opacity="0.65" stroke-width="1" />`;
        })
        .join("");

      const labelX =
        pts.reduce((acc, p) => acc + p.x, 0) / Math.max(1, pts.length);
      const labelHtml = `<text x="${labelX.toFixed(1)}" y="${(height - 5).toFixed(1)}" text-anchor="middle" fill="${wing.illuminatedStars > 0 ? wing.accent : "#94A3B8"}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="${labelFontSize}" font-weight="900" letter-spacing="${labelFontSize < 7.5 ? "0.3" : "0.8"}">${wing.constellationName} · ${wing.pct}%</text>`;

      return edgesHtml + nodesHtml + labelHtml;
    })
    .join("");

  return nebulaSvg + dustSvg + wingsSvg;
}

/**
 * Generates crisp self-contained SVG inner elements (viewBox 0 0 84 84) for the 5-stage Potted Bonsai Emblem.
 */
export function buildBonsaiEmblemSvgInner(
  bonsai: PassportBonsaiInfo,
  paletteId: StudioPaletteId = "arcade",
): string {
  const pal = getLoftThemeColors(paletteId, "dark");
  const stage = bonsai.stageNumber;

  // Celestial aura ring for stage 5
  const auraSvg =
    stage >= 5
      ? `<circle cx="42" cy="34" r="28" fill="${pal.bonsaiBlossom}" fill-opacity="0.14" stroke="${pal.bonsaiBlossom}" stroke-opacity="0.45" stroke-width="1.2" stroke-dasharray="3 3" />`
      : stage >= 4
        ? `<circle cx="42" cy="36" r="24" fill="${pal.bonsaiLeafHi}" fill-opacity="0.10" />`
        : "";

  // Terracotta planter pot grounded cleanly at bottom
  const potSvg = `
    <ellipse cx="42" cy="74" rx="22" ry="4" fill="#000000" fill-opacity="0.35" />
    <path d="M25 58 L59 58 L54 73 L30 73 Z" fill="#B86340" stroke="#090B10" stroke-width="2" stroke-linejoin="round" />
    <rect x="22" y="54" width="40" height="6" rx="2.5" fill="#C9734E" stroke="#090B10" stroke-width="2" />
    <ellipse cx="42" cy="54" rx="16" ry="2.4" fill="#3B2A1E" />
  `;

  // Trunk + branches scaled by stage 1..5
  let treeSvg = "";
  if (stage === 1) {
    // Stage 1: Seedling
    treeSvg = `
      <path d="M42 54 Q41 44 43 38" fill="none" stroke="#5A3A28" stroke-width="3.5" stroke-linecap="round" />
      <ellipse cx="37" cy="38" rx="6.5" ry="4" transform="rotate(-24 37 38)" fill="${pal.bonsaiLeaf}" stroke="#090B10" stroke-width="1.5" />
      <ellipse cx="48" cy="37" rx="6.5" ry="4" transform="rotate(22 48 37)" fill="${pal.bonsaiLeafHi}" stroke="#090B10" stroke-width="1.5" />
    `;
  } else if (stage === 2) {
    // Stage 2: Young Sprout
    treeSvg = `
      <path d="M42 54 Q38 42 44 30" fill="none" stroke="#5A3A28" stroke-width="4.5" stroke-linecap="round" />
      <path d="M40 43 Q32 39 29 34" fill="none" stroke="#5A3A28" stroke-width="3" stroke-linecap="round" />
      <circle cx="44" cy="28" r="10" fill="${pal.bonsaiLeaf}" stroke="#090B10" stroke-width="1.6" />
      <circle cx="52" cy="32" r="7.5" fill="${pal.bonsaiLeafHi}" stroke="#090B10" stroke-width="1.6" />
      <circle cx="29" cy="33" r="7.5" fill="${pal.bonsaiLeafHi}" stroke="#090B10" stroke-width="1.6" />
      <circle cx="45" cy="26" r="2.2" fill="${pal.bonsaiBlossom}" />
    `;
  } else {
    // Stage 3..5: Full Sculpted Bonsai Canopy + progressive blossoms & celestial stars
    treeSvg = `
      <path d="M42 54 Q34 42 44 26" fill="none" stroke="#5A3A28" stroke-width="5.5" stroke-linecap="round" />
      <path d="M39 42 Q28 38 24 31" fill="none" stroke="#5A3A28" stroke-width="3.6" stroke-linecap="round" />
      <path d="M43 34 Q54 32 59 27" fill="none" stroke="#5A3A28" stroke-width="3.2" stroke-linecap="round" />
      <circle cx="43" cy="22" r="12.5" fill="${pal.bonsaiLeaf}" stroke="#090B10" stroke-width="1.6" />
      <circle cx="32" cy="26" r="9.5" fill="${pal.bonsaiLeaf}" stroke="#090B10" stroke-width="1.6" />
      <circle cx="54" cy="26" r="10" fill="${pal.bonsaiLeafHi}" stroke="#090B10" stroke-width="1.6" />
      <circle cx="23" cy="32" r="8.5" fill="${pal.bonsaiLeafHi}" stroke="#090B10" stroke-width="1.6" />
      <circle cx="60" cy="31" r="8" fill="${pal.bonsaiLeaf}" stroke="#090B10" stroke-width="1.6" />
    `;

    const blossomPositions: [number, number][] = [
      [42, 18],
      [54, 24],
      [25, 30],
      [34, 23],
      [59, 30],
      [48, 28],
      [37, 15],
    ];
    for (let i = 0; i < Math.min(bonsai.blossomCount, blossomPositions.length); i += 1) {
      const [bx, by] = blossomPositions[i];
      treeSvg += `<circle cx="${bx}" cy="${by}" r="${stage >= 5 ? "2.8" : "2.4"}" fill="${pal.bonsaiBlossom}" stroke="#090B10" stroke-width="0.8" />`;
    }

    if (stage >= 5) {
      // Twinkling golden celestial crown sparkles
      treeSvg += `
        <path d="M42 5 L43.4 9.2 L47.6 10.6 L43.4 12 L42 16.2 L40.6 12 L36.4 10.6 L40.6 9.2 Z" fill="#FFDE59" stroke="#090B10" stroke-width="0.8" />
        <circle cx="17" cy="18" r="1.8" fill="#B8FF3B" />
        <circle cx="67" cy="19" r="1.8" fill="#FF90E8" />
      `;
    }
  }

  return auraSvg + potSvg + treeSvg;
}
