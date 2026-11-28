import type { StudioIconName } from "../components/StudioIcon";
import {
  STUDIO_PALETTES,
  type StudioPaletteId,
  type ThemeMode,
} from "../constants/theme";
import {
  isLessonLockedForUser,
  type Lesson,
  type ViewMode,
} from "../types/lesson";
import type { AmbientPresetId } from "./ambientSoundscapes";

export type CommandGroupId = "NAVIGATION" | "ARCADE" | "AUDIO & FOCUS" | "LESSONS";

export type CommandAction =
  | { type: "view_mode"; mode: ViewMode }
  | { type: "route"; href: "/explore" }
  | { type: "lesson"; lessonId: string }
  | { type: "toggle_theme" }
  | { type: "set_palette"; paletteId: StudioPaletteId }
  | { type: "toggle_lofi" }
  | { type: "ambient_preset"; presetId: AmbientPresetId }
  | { type: "toggle_pomodoro" }
  | { type: "toggle_zen" }
  | { type: "open_settings" }
  | { type: "open_profile" }
  | { type: "open_codex" };

export interface CommandPaletteItem {
  id: string;
  group: CommandGroupId;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: StudioIconName;
  badge?: string;
  shortcut?: string;
  featured?: boolean;
  action: CommandAction;
}

export interface CommandPaletteContext {
  lessons: Lesson[];
  completedLessons: Record<string, boolean>;
  isPremium: boolean;
  themeMode: ThemeMode;
  activePaletteId: StudioPaletteId;
  lofiPlaying: boolean;
  pomodoroRunning: boolean;
  pomodoroClockLabel: string;
}

function getTrackShortBadge(track: string): string {
  if (track === "algorithms") return "ALGO";
  if (track === "system_design") return "SYS";
  return "PY";
}

function getTrackIcon(track: string): StudioIconName {
  if (track === "algorithms") return "brain";
  if (track === "system_design") return "arch";
  return "python";
}

export function buildCommandPaletteItems(
  ctx: CommandPaletteContext,
): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [
    // NAVIGATION
    {
      id: "nav-home",
      group: "NAVIGATION",
      title: "Home Menu & Dev Loft",
      subtitle: "Main studio dashboard with interactive isometric Lo-Fi loft & portals",
      keywords: ["home", "main", "menu", "loft", "desk", "room", "start", "lobby"],
      icon: "nav_home",
      badge: "HOME",
      featured: true,
      action: { type: "view_mode", mode: "home" },
    },
    {
      id: "nav-roadmap",
      group: "NAVIGATION",
      title: "Skill Map & Roadmap",
      subtitle: "Browse Python, Algorithms, and System Design tracks",
      keywords: ["map", "tracks", "roadmap", "path", "curriculum", "tree"],
      icon: "nav_skillmap",
      badge: "MAP",
      featured: true,
      action: { type: "view_mode", mode: "roadmap" },
    },
    {
      id: "nav-studio",
      group: "NAVIGATION",
      title: "Code Studio",
      subtitle: "Jump back into your active Python lesson workspace",
      keywords: ["code", "ide", "editor", "lesson", "studio", "python"],
      icon: "nav_studio",
      badge: "IDE",
      featured: true,
      action: { type: "view_mode", mode: "studio" },
    },
    {
      id: "nav-arcade",
      group: "NAVIGATION",
      title: "Devy Mini-Game Arcade",
      subtitle: "8 retro coding cartridges: interviews, sprints, recall & mini-builds",
      keywords: ["games", "arcade", "cabinet", "fun", "cartridges"],
      icon: "nav_arcade",
      badge: "8 CARTS",
      featured: true,
      action: { type: "view_mode", mode: "arcade" },
    },
    {
      id: "nav-algolab",
      group: "NAVIGATION",
      title: "Algorithm Visual Lab",
      subtitle: "Step-by-step interactive sorting, graph, DP & heap visualizers",
      keywords: ["algo", "visualizer", "lab", "graph", "sorting", "dp", "heap"],
      icon: ctx.isPremium ? "nav_algolab" : "lock",
      badge: ctx.isPremium ? "LAB" : "PRO",
      featured: true,
      action: { type: "view_mode", mode: "algolab" },
    },
    {
      id: "nav-codex",
      group: "NAVIGATION",
      title: "Constellation Field Guide & Syntax Codex",
      subtitle: "Unlockable Python, Algorithms & Architecture pattern blueprints",
      keywords: [
        "codex",
        "field guide",
        "cheatsheet",
        "syntax",
        "patterns",
        "grimoire",
        "reference",
        "book",
      ],
      icon: "book",
      badge: "CODEX",
      shortcut: "⌘J",
      featured: true,
      action: { type: "open_codex" },
    },
    {
      id: "nav-league",
      group: "NAVIGATION",
      title: "Weekly League Leaderboard",
      subtitle: "Check weekly XP standings, tier ladder, and Ghost Rivals",
      keywords: ["leaderboard", "rank", "league", "weekly", "rivals"],
      icon: "nav_leaderboard",
      badge: "RANK",
      action: { type: "view_mode", mode: "league" },
    },
    {
      id: "nav-achievements",
      group: "NAVIGATION",
      title: "Achievements & Trophy Hall",
      subtitle: "Inspect unlocked badges, milestones, and mastery streaks",
      keywords: ["trophies", "badges", "achievements", "awards"],
      icon: "nav_achievements",
      badge: "BADGES",
      action: { type: "view_mode", mode: "achievements" },
    },
    {
      id: "nav-showcase",
      group: "NAVIGATION",
      title: "Curriculum Showcase",
      subtitle: "Explore Devy's full 3-track interactive syllabus overview",
      keywords: ["docs", "showcase", "explore", "syllabus", "overview"],
      icon: "nav_showcase",
      badge: "DOCS",
      action: { type: "route", href: "/explore" },
    },

    // ARCADE CARTRIDGES
    {
      id: "arc-playground",
      group: "ARCADE",
      title: "Python Playground (playground.py)",
      subtitle: "CART-06 · Free Python 3.11 sandbox with 6 templates (incl. SQLite) & snippets",
      keywords: ["playground", "scratchpad", "sandbox", "free", "python", "snippets"],
      icon: "terminal",
      badge: "CART-06",
      featured: true,
      action: { type: "view_mode", mode: "playground" },
    },
    {
      id: "arc-bughunt",
      group: "ARCADE",
      title: "Production Bug Hunt",
      subtitle: "CART-01 · Patch broken Python incidents with Daily Seed & Hard Mode",
      keywords: ["bug", "hunt", "debug", "patch", "incident", "daily"],
      icon: "nav_bughunt",
      badge: "CART-01",
      featured: true,
      action: { type: "view_mode", mode: "bughunt" },
    },
    {
      id: "arc-blitz",
      group: "ARCADE",
      title: "60s Speed Blitz",
      subtitle: "CART-02 · Rapid-fire syntax blanks and Big-O traps against the clock",
      keywords: ["blitz", "speed", "60s", "fast", "combo", "quiz"],
      icon: "nav_blitz",
      badge: "CART-02",
      action: { type: "view_mode", mode: "blitz" },
    },
    {
      id: "arc-flashcards",
      group: "ARCADE",
      title: "Flashcards Concept Deck",
      subtitle: "CART-03 · No-typing rapid-recall cards with spaced misses review",
      keywords: ["flashcards", "cards", "memory", "recall", "study"],
      icon: "nav_flashcards",
      badge: "CART-03",
      action: { type: "view_mode", mode: "flashcards" },
    },
    {
      id: "arc-detective",
      group: "ARCADE",
      title: "Output Detective",
      subtitle: "CART-04 · Read Python & system traces and predict exact output",
      keywords: ["detective", "trace", "output", "predict", "reading"],
      icon: "nav_detective",
      badge: "CART-04",
      action: { type: "view_mode", mode: "detective" },
    },
    {
      id: "arc-minibuilds",
      group: "ARCADE",
      title: "Cozy Mini-Builds",
      subtitle: "CART-05 · Build Password Meter, URL Shortener & Dice RPG widgets",
      keywords: ["mini", "builds", "tools", "widget", "password", "dice", "url"],
      icon: "nav_minibuilds",
      badge: "CART-05",
      featured: true,
      action: { type: "view_mode", mode: "minibuilds" },
    },
    {
      id: "arc-refactor",
      group: "ARCADE",
      title: "Code Refactor & Big-O Golf",
      subtitle: "CART-07 · Optimize O(n²) Python under Line Par to score Gold Eagles",
      keywords: ["refactor", "golf", "big-o", "optimize", "par", "eagle", "complexity"],
      icon: "bolt",
      badge: "CART-07",
      featured: true,
      action: { type: "view_mode", mode: "refactor" },
    },
    {
      id: "arc-interview",
      group: "ARCADE",
      title: "Mock Technical Interview Simulator",
      subtitle: "CART-08 · 25-minute Algo + Systems loop with 100-pt Hiring Scorecard",
      keywords: ["interview", "mock", "hiring", "swe", "timed", "rubric", "career"],
      icon: "briefcase",
      badge: "CART-08",
      featured: true,
      action: { type: "view_mode", mode: "interview" },
    },

    // AUDIO, FOCUS & STUDIO CONTROLS
    {
      id: "ctrl-lofi",
      group: "AUDIO & FOCUS",
      title: ctx.lofiPlaying ? "Pause Lo-Fi Study Radio" : "Play Lo-Fi Study Radio",
      subtitle: "Toggle cozy procedural chillhop, rain & synthwave beats",
      keywords: ["lofi", "radio", "music", "beats", "audio", "play", "pause"],
      icon: "headphones",
      badge: ctx.lofiPlaying ? "ON" : "OFF",
      featured: true,
      action: { type: "toggle_lofi" },
    },
    {
      id: "ctrl-pomodoro",
      group: "AUDIO & FOCUS",
      title: ctx.pomodoroRunning
        ? `Pause Focus Timer (${ctx.pomodoroClockLabel})`
        : `Start Cozy Focus Timer (${ctx.pomodoroClockLabel})`,
      subtitle: "25m Pomodoro block with +25 XP bonus & 5m tea break",
      keywords: ["pomodoro", "timer", "focus", "tea", "break", "clock"],
      icon: "timer",
      badge: ctx.pomodoroRunning ? "LIVE" : "FOCUS",
      featured: true,
      action: { type: "toggle_pomodoro" },
    },
    {
      id: "ctrl-zen",
      group: "AUDIO & FOCUS",
      title: "Toggle Studio Zen / Focus Mode",
      subtitle: "Hide header & sidebar chrome for pure 50/50 coding focus",
      keywords: ["zen", "focus", "fullscreen", "distraction", "clean", "hide"],
      icon: "stretch",
      badge: "ZEN",
      shortcut: "⌘.",
      featured: true,
      action: { type: "toggle_zen" },
    },
    {
      id: "ctrl-theme",
      group: "AUDIO & FOCUS",
      title:
        ctx.themeMode === "dark"
          ? "Switch to Light Mode (Warm Cream)"
          : "Switch to Dark Mode (Midnight Obsidian)",
      subtitle: "Instant high-contrast theme switch across the entire studio",
      keywords: ["theme", "dark", "light", "mode", "appearance", "color"],
      icon: ctx.themeMode === "dark" ? "sun" : "moon",
      badge: ctx.themeMode === "dark" ? "LIGHT" : "DARK",
      featured: true,
      action: { type: "toggle_theme" },
    },
    {
      id: "ctrl-ambient-rain",
      group: "AUDIO & FOCUS",
      title: "Ambient Preset: Rainy Desk",
      subtitle: "Layer Soft Rain + gentle CRT Hum over your workspace",
      keywords: ["ambient", "rain", "rainy", "soundscape", "desk", "crt"],
      icon: "rain",
      badge: "MIX",
      action: { type: "ambient_preset", presetId: "rainy_night" },
    },
    {
      id: "ctrl-ambient-cafe",
      group: "AUDIO & FOCUS",
      title: "Ambient Preset: Cozy Coffee Shop",
      subtitle: "Warm Cafe Murmur + soft drizzle ambiance",
      keywords: ["ambient", "cafe", "coffee", "shop", "soundscape"],
      icon: "coffee",
      badge: "MIX",
      action: { type: "ambient_preset", presetId: "coffee_shop" },
    },
    {
      id: "ctrl-ambient-cabin",
      group: "AUDIO & FOCUS",
      title: "Ambient Preset: Cabin Fireplace",
      subtitle: "Crackling Fireplace + Soft Rain desk soundscape",
      keywords: ["ambient", "fireplace", "cabin", "fire", "cozy"],
      icon: "flame",
      badge: "MIX",
      action: { type: "ambient_preset", presetId: "cabin_code" },
    },
    {
      id: "ctrl-ambient-silent",
      group: "AUDIO & FOCUS",
      title: "Ambient Preset: Silence Mixer",
      subtitle: "Mute all ambient soundscape layers immediately",
      keywords: ["ambient", "mute", "silent", "stop", "quiet"],
      icon: "sound_off",
      badge: "MUTE",
      action: { type: "ambient_preset", presetId: "silent" },
    },
    {
      id: "ctrl-settings",
      group: "AUDIO & FOCUS",
      title: "Open Studio Settings",
      subtitle: "Palettes, typing keycap sounds, Lo-Fi radio & ambient mixer",
      keywords: ["settings", "preferences", "palettes", "keycap", "typing", "mixer"],
      icon: "menu_settings",
      badge: "MENU",
      action: { type: "open_settings" },
    },
    {
      id: "ctrl-profile",
      group: "AUDIO & FOCUS",
      title: "Open Profile & Pixel Garden",
      subtitle: "View Developer Rank, 12-week activity heatmap, and PNG Share Card",
      keywords: ["profile", "stats", "garden", "heatmap", "share", "card", "png", "rank"],
      icon: "menu_account_rank",
      badge: "STATS",
      action: { type: "open_profile" },
    },
  ];

  // Add Studio Theme Palette quick-switch items
  for (const palette of STUDIO_PALETTES) {
    const isCurrent = palette.id === ctx.activePaletteId;
    items.push({
      id: `palette-${palette.id}`,
      group: "AUDIO & FOCUS",
      title: `Theme Palette: ${palette.name}`,
      subtitle: palette.subtitle,
      keywords: ["palette", "theme", "color", palette.id, palette.name.toLowerCase()],
      icon: "star",
      badge: isCurrent ? "ACTIVE" : "PALETTE",
      action: { type: "set_palette", paletteId: palette.id },
    });
  }

  // Add all curriculum lessons for instant search-and-jump
  let featuredLessonCount = 0;
  for (const lesson of ctx.lessons) {
    const isDone = Boolean(ctx.completedLessons[lesson.id]);
    const isLocked = isLessonLockedForUser(lesson, ctx.isPremium);
    const shouldFeature = !isDone && !isLocked && featuredLessonCount < 3;
    if (shouldFeature) featuredLessonCount += 1;

    items.push({
      id: `lesson-${lesson.id}`,
      group: "LESSONS",
      title: lesson.title,
      subtitle: lesson.category
        ? `${lesson.category} · ${lesson.description}`
        : lesson.description,
      keywords: [
        lesson.track.replace("_", " "),
        lesson.category || "",
        lesson.slug || "",
        lesson.difficulty || "",
        isDone ? "completed" : "todo",
      ],
      icon: isLocked ? "lock" : getTrackIcon(lesson.track),
      badge: isDone
        ? `${getTrackShortBadge(lesson.track)} ✓`
        : isLocked
          ? `${getTrackShortBadge(lesson.track)} PRO`
          : getTrackShortBadge(lesson.track),
      featured: shouldFeature,
      action: { type: "lesson", lessonId: lesson.id },
    });
  }

  return items;
}

function scoreCommandMatch(item: CommandPaletteItem, tokens: string[]): number {
  const titleLower = item.title.toLowerCase();
  const subtitleLower = item.subtitle.toLowerCase();
  const groupLower = item.group.toLowerCase();
  const keywordsLower = item.keywords.join(" ").toLowerCase();
  const fullHaystack = `${titleLower} ${subtitleLower} ${keywordsLower} ${groupLower}`;

  let totalScore = 0;
  for (const token of tokens) {
    if (!fullHaystack.includes(token)) {
      return 0;
    }
    if (titleLower === token) {
      totalScore += 120;
    } else if (titleLower.startsWith(token)) {
      totalScore += 90;
    } else if (titleLower.includes(` ${token}`) || titleLower.includes(`-${token}`)) {
      totalScore += 70;
    } else if (titleLower.includes(token)) {
      totalScore += 55;
    } else if (keywordsLower.includes(token)) {
      totalScore += 35;
    } else if (groupLower.includes(token)) {
      totalScore += 25;
    } else {
      totalScore += 15;
    }
  }

  // Slight tie-breaker favoring core navigation & arcade actions over deep lessons
  if (item.group === "NAVIGATION") totalScore += 6;
  else if (item.group === "ARCADE") totalScore += 5;
  else if (item.group === "AUDIO & FOCUS") totalScore += 4;
  return totalScore;
}

export function filterCommandPaletteItems(
  items: CommandPaletteItem[],
  query: string,
  maxResults = 16,
): CommandPaletteItem[] {
  const cleaned = query.trim().toLowerCase();
  if (!cleaned) {
    return items.filter((item) => item.featured).slice(0, maxResults);
  }

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return items.filter((item) => item.featured).slice(0, maxResults);
  }

  const scored: { item: CommandPaletteItem; score: number }[] = [];
  for (const item of items) {
    const score = scoreCommandMatch(item, tokens);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map((entry) => entry.item);
}
