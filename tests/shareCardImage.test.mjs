import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildShareCardFilename,
  buildShareCardSvg,
  escapeXml,
  wrapCardHeadline,
} = loadTsModule("src/utils/shareCardImage.ts");

test("shareCardImage escapes XML safely, wraps long headlines, and creates clean PNG filenames", () => {
  assert.equal(escapeXml(`A <B> & "C" 'D'`), "A &lt;B&gt; &amp; &quot;C&quot; &apos;D&apos;");

  const wrapped = wrapCardHeadline(
    "Distributed Consistent Hashing & Cache Eviction",
    22,
  );
  assert.equal(wrapped.length, 2);
  assert.ok(wrapped[0].length <= 22);
  assert.ok(wrapped[1].endsWith("…"));

  assert.equal(
    buildShareCardFilename({
      variant: "lesson_win",
      eyebrow: "WIN",
      headline: "Two Sum & Hash Maps!",
      rankLevel: 3,
      rankTitle: "Code Alchemist",
      xpPoints: 500,
      streakCount: 4,
      metric3Label: "STARS",
      metric3Value: "★★★",
    }),
    "devy-win-two-sum-hash-maps.png",
  );

  assert.equal(
    buildShareCardFilename({
      variant: "streak_milestone",
      eyebrow: "STREAK",
      headline: "7-DAY STREAK!",
      rankLevel: 2,
      rankTitle: "Loop Wrangler",
      xpPoints: 400,
      streakCount: 7,
      metric3Label: "BONUS",
      metric3Value: "+150 XP",
    }),
    "devy-streak-7-day-streak.png",
  );
});

test("buildShareCardSvg produces valid 1200x630 themed SVGs across all 3 variants and 4 palettes", () => {
  const palettes = ["arcade", "matcha", "amber", "sakura"];
  const svgsByPalette = new Set();

  for (const paletteId of palettes) {
    const svg = buildShareCardSvg({
      variant: "lesson_win",
      eyebrow: "MISSION CLEARED · +50 XP",
      headline: "Binary Search & <Trees>",
      subtitle: "O(log n) divide-and-conquer",
      displayName: "Marius",
      rankLevel: 4,
      rankTitle: "Stack Architect",
      xpPoints: 1850,
      streakCount: 9,
      metric3Label: "MASTERY",
      metric3Value: "★★★ 3/3",
      paletteId,
      footerUrl: "https://devy.app/?lesson=exp-alg-01",
    });

    assert.ok(svg.startsWith("<svg "));
    assert.ok(svg.endsWith("</svg>"));
    assert.ok(svg.includes('width="1200" height="630"'));
    assert.ok(svg.includes("Binary Search &amp; &lt;Trees&gt;"));
    assert.ok(svg.includes("@Marius"));
    assert.ok(svg.includes("9 DAYS"));
    assert.ok(svg.includes("1,850 XP"));
    assert.ok(svg.includes("12W PIXEL GARDEN"));
    assert.ok(svg.includes("devy.app/?lesson=exp-alg-01"));
    svgsByPalette.add(svg);
  }

  assert.equal(
    svgsByPalette.size,
    4,
    "Each of the 4 Studio Theme Palettes should render a distinct visual share card",
  );

  const streakSvg = buildShareCardSvg({
    variant: "streak_milestone",
    eyebrow: "7-DAY SPARK",
    headline: "7-DAY STREAK!",
    rankLevel: 2,
    rankTitle: "Loop Wrangler",
    xpPoints: 720,
    streakCount: 7,
    metric3Label: "MILESTONE",
    metric3Value: "+150 XP",
  });
  assert.ok(streakSvg.includes("STREAK MILESTONE"));

  const { buildAstralPassportData } = loadTsModule("src/utils/astralPassport.ts");
  const passport = buildAstralPassportData({
    displayName: "Alex",
    rankLevel: 5,
    rankTitle: "System Shaper",
    rankAccent: "#C4B5FD",
    isPremium: true,
    xpPoints: 3200,
    streakCount: 14,
    lessons: [
      { id: "py-1", track: "python_basics", lesson_order: 1, title: "L1" },
      { id: "alg-1", track: "algorithms", lesson_order: 1, title: "A1" },
      { id: "sys-1", track: "system_design", lesson_order: 1, title: "S1" },
    ],
    completedLessons: { "py-1": true },
    blitzBestHits: 12,
  });

  const profileSvg = buildShareCardSvg({
    variant: "profile_card",
    eyebrow: "ASTRAL PASSPORT · LVL 5",
    headline: "Alex",
    rankLevel: 5,
    rankTitle: "System Shaper",
    xpPoints: 3200,
    streakCount: 14,
    metric3Label: "SOLVED",
    metric3Value: "24/64",
    passport,
  });
  assert.ok(profileSvg.includes("DEVELOPER CARD"));
  assert.ok(profileSvg.includes("24/64"));
  assert.ok(profileSvg.includes("[ &gt;_ DEVY ]"));
  assert.ok(profileSvg.includes("RANK LVL 5"));
  assert.ok(profileSvg.includes("ASTRAL PASSPORT"));
  assert.ok(profileSvg.includes("SERPENS · 100%"));
  assert.ok(profileSvg.includes("BONSAI STAGE 4/5"));
  assert.ok(profileSvg.includes(passport.serialNumber));
  assert.ok(profileSvg.includes("DEVY STUDIO"));
});
