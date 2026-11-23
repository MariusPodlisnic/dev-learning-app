import type { ChapterTierMeta } from "../constants/certificates";
import {
  getChapterForTrackLesson,
  getCurriculumLessonSortKey,
} from "../constants/certificates";
import type { StudioPaletteId, ThemeMode } from "../constants/theme";

export interface AstralLessonLike {
  id: string;
  title: string;
  track: string;
  lesson_order: number;
  tree_row?: number;
  is_recap?: boolean;
  recap_chapter?: number;
}

export interface AstralPaletteColors {
  skyTop: string;
  skyMid: string;
  skyBot: string;
  nebulaA: string;
  nebulaB: string;
  accent: string;
  accentSecondary: string;
  accentGold: string;
  accentCyan: string;
  ringStroke: string;
  filamentDim: string;
  starText: string;
  starTextDim: string;
  cardBg: string;
  cardBorder: string;
}

export interface AstralStarNode<T extends AstralLessonLike = AstralLessonLike> {
  lesson: T;
  id: string;
  chapterId: number;
  chapterRoman: string;
  rowIndex: number;
  x: number;
  y: number;
  radius: number;
  isBoss: boolean;
}

export interface AstralEdge {
  fromId: string;
  toId: string;
  crossChapter: boolean;
}

export interface AstralChapterCluster {
  chapter: ChapterTierMeta;
  cx: number;
  cy: number;
  radius: number;
  lessonIds: string[];
}

export interface AstralStarGraph<T extends AstralLessonLike = AstralLessonLike> {
  nodes: AstralStarNode<T>[];
  edges: AstralEdge[];
  clusters: AstralChapterCluster[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export function getAstralPalette(
  paletteId: StudioPaletteId,
  themeMode: ThemeMode,
): AstralPaletteColors {
  const isLight = themeMode === "light";

  if (paletteId === "matcha") {
    return isLight
      ? {
          skyTop: "#0D1F1C",
          skyMid: "#142E2A",
          skyBot: "#0B1917",
          nebulaA: "rgba(110, 231, 183, 0.20)",
          nebulaB: "rgba(255, 222, 89, 0.12)",
          accent: "#6EE7B7",
          accentSecondary: "#FDE68A",
          accentGold: "#FFDE59",
          accentCyan: "#5EEAD4",
          ringStroke: "rgba(167, 243, 208, 0.14)",
          filamentDim: "rgba(148, 197, 184, 0.22)",
          starText: "#F0FDF4",
          starTextDim: "rgba(209, 250, 229, 0.56)",
          cardBg: "rgba(12, 28, 25, 0.92)",
          cardBorder: "rgba(110, 231, 183, 0.35)",
        }
      : {
          skyTop: "#06110F",
          skyMid: "#0D211E",
          skyBot: "#050D0C",
          nebulaA: "rgba(16, 185, 129, 0.22)",
          nebulaB: "rgba(251, 191, 36, 0.12)",
          accent: "#6EE7B7",
          accentSecondary: "#FFDE59",
          accentGold: "#FDE68A",
          accentCyan: "#34D399",
          ringStroke: "rgba(167, 243, 208, 0.09)",
          filamentDim: "rgba(148, 197, 184, 0.20)",
          starText: "#ECFDF5",
          starTextDim: "rgba(167, 243, 208, 0.50)",
          cardBg: "rgba(9, 22, 19, 0.92)",
          cardBorder: "rgba(110, 231, 183, 0.32)",
        };
  }

  if (paletteId === "amber") {
    return isLight
      ? {
          skyTop: "#1D140E",
          skyMid: "#2D1E15",
          skyBot: "#170F0A",
          nebulaA: "rgba(251, 191, 36, 0.22)",
          nebulaB: "rgba(249, 115, 22, 0.14)",
          accent: "#FBBF24",
          accentSecondary: "#FB923C",
          accentGold: "#FDE68A",
          accentCyan: "#6EE7B7",
          ringStroke: "rgba(253, 230, 138, 0.14)",
          filamentDim: "rgba(217, 180, 143, 0.24)",
          starText: "#FFFBEB",
          starTextDim: "rgba(254, 243, 199, 0.54)",
          cardBg: "rgba(26, 17, 11, 0.92)",
          cardBorder: "rgba(251, 191, 36, 0.35)",
        }
      : {
          skyTop: "#120B07",
          skyMid: "#21150E",
          skyBot: "#0C0805",
          nebulaA: "rgba(217, 119, 6, 0.22)",
          nebulaB: "rgba(244, 114, 182, 0.12)",
          accent: "#FBBF24",
          accentSecondary: "#FB923C",
          accentGold: "#FDE68A",
          accentCyan: "#6EE7B7",
          ringStroke: "rgba(253, 230, 138, 0.09)",
          filamentDim: "rgba(217, 180, 143, 0.20)",
          starText: "#FEF3C7",
          starTextDim: "rgba(253, 230, 138, 0.48)",
          cardBg: "rgba(20, 13, 8, 0.92)",
          cardBorder: "rgba(251, 191, 36, 0.32)",
        };
  }

  if (paletteId === "sakura") {
    return isLight
      ? {
          skyTop: "#1C1024",
          skyMid: "#2B1738",
          skyBot: "#150C1B",
          nebulaA: "rgba(255, 144, 232, 0.22)",
          nebulaB: "rgba(196, 181, 253, 0.18)",
          accent: "#FF90E8",
          accentSecondary: "#C4B5FD",
          accentGold: "#FFDE59",
          accentCyan: "#6EE7B7",
          ringStroke: "rgba(244, 180, 255, 0.14)",
          filamentDim: "rgba(216, 180, 254, 0.24)",
          starText: "#FDF4FF",
          starTextDim: "rgba(245, 208, 254, 0.56)",
          cardBg: "rgba(25, 13, 33, 0.92)",
          cardBorder: "rgba(255, 144, 232, 0.35)",
        }
      : {
          skyTop: "#110918",
          skyMid: "#1F112B",
          skyBot: "#0B0610",
          nebulaA: "rgba(219, 39, 119, 0.22)",
          nebulaB: "rgba(139, 92, 246, 0.18)",
          accent: "#FF90E8",
          accentSecondary: "#C4B5FD",
          accentGold: "#FFDE59",
          accentCyan: "#6EE7B7",
          ringStroke: "rgba(232, 180, 255, 0.09)",
          filamentDim: "rgba(216, 180, 254, 0.20)",
          starText: "#FAF5FF",
          starTextDim: "rgba(233, 213, 255, 0.50)",
          cardBg: "rgba(18, 9, 25, 0.92)",
          cardBorder: "rgba(255, 144, 232, 0.32)",
        };
  }

  // Default: Arcade Midnight Observatory
  return isLight
    ? {
        skyTop: "#11182C",
        skyMid: "#192240",
        skyBot: "#0E1324",
        nebulaA: "rgba(124, 58, 237, 0.22)",
        nebulaB: "rgba(56, 189, 248, 0.16)",
        accent: "#B8FF3B",
        accentSecondary: "#FF90E8",
        accentGold: "#FFDE59",
        accentCyan: "#38BDF8",
        ringStroke: "rgba(226, 232, 240, 0.13)",
        filamentDim: "rgba(148, 163, 184, 0.25)",
        starText: "#F8FAFC",
        starTextDim: "rgba(203, 213, 225, 0.56)",
        cardBg: "rgba(14, 20, 36, 0.92)",
        cardBorder: "rgba(184, 255, 59, 0.35)",
      }
    : {
        skyTop: "#070A14",
        skyMid: "#10162B",
        skyBot: "#070910",
        nebulaA: "rgba(124, 58, 237, 0.22)",
        nebulaB: "rgba(56, 189, 248, 0.15)",
        accent: "#B8FF3B",
        accentSecondary: "#FF90E8",
        accentGold: "#FFDE59",
        accentCyan: "#38BDF8",
        ringStroke: "rgba(226, 232, 240, 0.08)",
        filamentDim: "rgba(148, 163, 184, 0.21)",
        starText: "#F8FAFC",
        starTextDim: "rgba(148, 163, 184, 0.54)",
        cardBg: "rgba(11, 15, 27, 0.92)",
        cardBorder: "rgba(184, 255, 59, 0.32)",
      };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/**
 * Deterministically arranges track lessons into sweeping chapter constellations
 * with natural vertical branching for multi-module tree rows and curved spines.
 */
export function buildAstralStarGraph<T extends AstralLessonLike>(
  trackLessons: T[],
  chapters: ChapterTierMeta[],
  trackKey: string,
): AstralStarGraph<T> {
  if (trackLessons.length === 0) {
    return {
      nodes: [],
      edges: [],
      clusters: [],
      bounds: { minX: -200, maxX: 200, minY: -150, maxY: 150 },
    };
  }

  // Group into ordered rows exactly matching the curriculum sort key
  const rowsMap = new Map<number, T[]>();
  for (const lesson of trackLessons) {
    const rowNum = lesson.tree_row || lesson.lesson_order || 1;
    const arr = rowsMap.get(rowNum) || [];
    arr.push(lesson);
    rowsMap.set(rowNum, arr);
  }

  const sortedRowNums = Array.from(rowsMap.keys()).sort((a, b) => {
    const la = rowsMap.get(a)![0];
    const lb = rowsMap.get(b)![0];
    return (
      getCurriculumLessonSortKey(trackKey, la) -
      getCurriculumLessonSortKey(trackKey, lb)
    );
  });

  const nodes: AstralStarNode<T>[] = [];
  const edges: AstralEdge[] = [];
  const rowNodeGroups: AstralStarNode<T>[][] = [];

  const ROW_STEP_X = 178;
  const CHAPTER_GAP_X = 82;
  const BRANCH_SPACING_Y = 128;

  let cursorX = 0;
  let prevChapterId: number | null = null;

  sortedRowNums.forEach((rowNum, rowIndex) => {
    const rowLessons = rowsMap.get(rowNum)!;
    rowLessons.sort(
      (a, b) =>
        getCurriculumLessonSortKey(trackKey, a) -
        getCurriculumLessonSortKey(trackKey, b),
    );
    const ch = getChapterForTrackLesson(trackKey, rowLessons[0]);

    if (prevChapterId !== null && prevChapterId !== ch.id) {
      cursorX += CHAPTER_GAP_X;
    }
    prevChapterId = ch.id;

    // Gentle celestial sine river + subtle deterministic constellation offset
    const riverY =
      Math.sin(rowIndex * 0.62 + ch.id * 0.55) * 68 +
      (ch.id % 2 === 0 ? -18 : 18);

    const group: AstralStarNode<T>[] = [];
    const count = rowLessons.length;

    rowLessons.forEach((lesson, localIdx) => {
      const seed = hashSeed(`${trackKey}:${lesson.id}`);
      const isBoss = Boolean(lesson.is_recap);
      const offsetFrac = count === 1 ? 0 : localIdx - (count - 1) / 2;
      const staggerX = count > 1 ? (localIdx % 2 === 0 ? -14 : 14) : 0;
      const jitterY = count === 1 ? (seed - 0.5) * 34 : (seed - 0.5) * 16;

      const node: AstralStarNode<T> = {
        lesson,
        id: lesson.id,
        chapterId: ch.id,
        chapterRoman: ch.roman,
        rowIndex,
        x: cursorX + staggerX,
        y: riverY + offsetFrac * BRANCH_SPACING_Y + jitterY,
        radius: isBoss ? 24 : 16,
        isBoss,
      };
      nodes.push(node);
      group.push(node);
    });

    // Connect previous row group -> current row group cleanly
    if (rowNodeGroups.length > 0) {
      const prevGroup = rowNodeGroups[rowNodeGroups.length - 1];
      const crossChapter = prevGroup[0].chapterId !== group[0].chapterId;
      for (const prevNode of prevGroup) {
        for (const currNode of group) {
          edges.push({
            fromId: prevNode.id,
            toId: currNode.id,
            crossChapter,
          });
        }
      }
    }

    rowNodeGroups.push(group);
    cursorX += ROW_STEP_X;
  });

  // Recenter graph horizontally around X = 0 for symmetrical camera framing
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }
  const midX = (minX + maxX) * 0.5;
  const midY = (minY + maxY) * 0.5;
  for (const n of nodes) {
    n.x -= midX;
    n.y -= midY;
  }
  minX -= midX;
  maxX -= midX;
  minY -= midY;
  maxY -= midY;

  // Build chapter constellation halos
  const clusters: AstralChapterCluster[] = [];
  for (const chapter of chapters) {
    const chNodes = nodes.filter((n) => n.chapterId === chapter.id);
    if (chNodes.length === 0) continue;
    let sx = 0;
    let sy = 0;
    for (const n of chNodes) {
      sx += n.x;
      sy += n.y;
    }
    const cx = sx / chNodes.length;
    const cy = sy / chNodes.length;
    let maxDist = 75;
    for (const n of chNodes) {
      const d = Math.hypot(n.x - cx, n.y - cy) + 64;
      if (d > maxDist) maxDist = d;
    }
    clusters.push({
      chapter,
      cx,
      cy,
      radius: Math.min(310, maxDist + 10),
      lessonIds: chNodes.map((n) => n.id),
    });
  }

  return {
    nodes,
    edges,
    clusters,
    bounds: {
      minX: minX - 180,
      maxX: maxX + 180,
      minY: minY - 170,
      maxY: maxY + 170,
    },
  };
}

/**
 * Returns the set of all ancestor star IDs feeding into targetId
 * so hovering a star lights up its prerequisite constellation trail.
 */
export function getAstralAncestors(
  targetId: string,
  edges: AstralEdge[],
): Set<string> {
  const incoming = new Map<string, string[]>();
  for (const e of edges) {
    const list = incoming.get(e.toId) || [];
    list.push(e.fromId);
    incoming.set(e.toId, list);
  }
  const visited = new Set<string>();
  const stack = [targetId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (visited.has(cur)) continue;
    visited.add(cur);
    const parents = incoming.get(cur);
    if (parents) {
      for (const p of parents) {
        if (!visited.has(p)) stack.push(p);
      }
    }
  }
  return visited;
}

export function clampAstralCamera(
  x: number,
  y: number,
  bounds: AstralStarGraph["bounds"],
): { x: number; y: number } {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
  };
}
