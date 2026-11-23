import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildAstralStarGraph,
  clampAstralCamera,
  getAstralAncestors,
  getAstralPalette,
} = loadTsModule("src/utils/astralChartGeometry.ts");
const { mergeCurriculumLessons } = loadTsModule("src/constants/curriculum.ts");
const { TRACK_CHAPTERS } = loadTsModule("src/constants/certificates.ts");

test("buildAstralStarGraph generates valid constellation nodes, edges, and chapter clusters across all 3 tracks", () => {
  const allLessons = mergeCurriculumLessons([]);
  const tracks = ["python_basics", "algorithms", "system_design"];

  for (const trackKey of tracks) {
    const trackLessons = allLessons.filter((l) => l.track === trackKey);
    const chapters = TRACK_CHAPTERS[trackKey];
    const graph = buildAstralStarGraph(trackLessons, chapters, trackKey);

    assert.equal(graph.nodes.length, trackLessons.length);
    assert.ok(graph.edges.length >= trackLessons.length - 1);
    assert.ok(graph.clusters.length > 0);

    for (const node of graph.nodes) {
      assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
      assert.ok(node.x >= graph.bounds.minX && node.x <= graph.bounds.maxX);
      assert.ok(node.y >= graph.bounds.minY && node.y <= graph.bounds.maxY);
    }

    // Ancestor chain of the final lesson should trace back to the first lesson
    const firstId = graph.nodes[0].id;
    const lastId = graph.nodes[graph.nodes.length - 1].id;
    const ancestors = getAstralAncestors(lastId, graph.edges);
    assert.ok(ancestors.has(lastId));
    assert.ok(ancestors.has(firstId));

    // Camera clamping keeps pan strictly inside world bounds
    const clampedFar = clampAstralCamera(999999, -999999, graph.bounds);
    assert.equal(clampedFar.x, graph.bounds.maxX);
    assert.equal(clampedFar.y, graph.bounds.minY);
  }
});

test("getAstralPalette returns distinct themed observatory palettes across all 4 studio palettes and 2 modes", () => {
  const palettes = ["arcade", "matcha", "amber", "sakura"];
  const modes = ["dark", "light"];
  const accents = new Set();

  for (const palId of palettes) {
    for (const mode of modes) {
      const p = getAstralPalette(palId, mode);
      assert.match(p.skyTop, /^#[0-9A-Fa-f]{6}$/);
      assert.match(p.accent, /^#[0-9A-Fa-f]{6}$/);
      assert.ok(p.nebulaA.startsWith("rgba("));
      if (mode === "dark") accents.add(p.accent);
    }
  }
  assert.equal(accents.size, 4);
});
