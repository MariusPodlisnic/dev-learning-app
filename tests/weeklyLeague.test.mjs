import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildGhostRivals,
  buildLeagueStandings,
  getDaysUntilWeekReset,
  getIsoWeekKey,
  getLeagueTierForWeeklyXp,
  LEAGUE_TIERS,
  recordWeeklyXpSnapshot,
  resetWeeklyLeagueForTesting,
  setWeeklyLeagueOptIn,
} = loadTsModule("src/utils/weeklyLeague.ts");

test("weeklyLeague computes ISO week keys, reset countdown, and 4 cozy tiers", () => {
  assert.equal(LEAGUE_TIERS.length, 4);
  assert.equal(getIsoWeekKey(new Date("2026-11-20T12:00:00Z")), "2026-W47");
  assert.equal(getIsoWeekKey(new Date("2026-11-23T00:00:00Z")), "2026-W48");
  assert.equal(getDaysUntilWeekReset(new Date("2026-11-22T12:00:00Z")), 1); // Sunday -> 1 day left
  assert.equal(getDaysUntilWeekReset(new Date("2026-11-23T12:00:00Z")), 7); // Monday -> 7 days left

  assert.equal(getLeagueTierForWeeklyXp(0).current.id, "spark");
  assert.equal(getLeagueTierForWeeklyXp(249).current.id, "spark");
  assert.equal(getLeagueTierForWeeklyXp(250).current.id, "neon");
  assert.equal(getLeagueTierForWeeklyXp(600).current.id, "arcade");
  assert.equal(getLeagueTierForWeeklyXp(1250).current.id, "grandmaster");
  assert.equal(getLeagueTierForWeeklyXp(1250).next, null);
});

test("weeklyLeague merges live players with deterministic Ghost Rivals and tracks weekly XP resets", () => {
  const ghostsA = buildGhostRivals("2026-W47", "spark");
  const ghostsB = buildGhostRivals("2026-W47", "spark");
  assert.equal(ghostsA.length, 9);
  assert.deepEqual(ghostsA, ghostsB, "Ghost rivals should be deterministic for the same week");

  const board = buildLeagueStandings({
    weekKey: "2026-W47",
    currentUser: {
      id: "user-me",
      displayName: "Marius",
      avatarLevel: 3,
      weeklyXp: 190,
      streakCount: 5,
    },
    liveEntries: [
      {
        id: "user-live-1",
        displayName: "AdaPy",
        avatarLevel: 6,
        weeklyXp: 240,
        streakCount: 12,
      },
    ],
    maxRows: 10,
  });

  assert.equal(board.standings.length, 10);
  assert.equal(board.livePlayerCount, 2);
  assert.ok(board.standings.some((r) => r.isCurrentUser && r.displayName === "Marius"));
  assert.ok(board.standings.some((r) => !r.isGhost && r.displayName === "AdaPy"));
  for (let i = 1; i < board.standings.length; i += 1) {
    assert.ok(
      board.standings[i - 1].weeklyXp >= board.standings[i].weeklyXp,
      "Standings should be sorted descending by weekly XP",
    );
  }
  assert.ok(board.rivalAhead && board.xpToPassRival > 0);

  // Weekly XP tracking & Monday week reset
  const wk1Date = new Date("2026-11-20T12:00:00Z");
  const wk2Date = new Date("2026-11-23T12:00:00Z");
  resetWeeklyLeagueForTesting(getIsoWeekKey(wk1Date));

  const s1 = recordWeeklyXpSnapshot(100, wk1Date);
  assert.equal(s1.weeklyXp, 0);
  const s2 = recordWeeklyXpSnapshot(220, wk1Date);
  assert.equal(s2.weeklyXp, 120);

  const opted = setWeeklyLeagueOptIn(true);
  assert.equal(opted.optedIn, true);

  // New ISO week resets weeklyXp to 0 while preserving opt-in preference
  const sNextWeek = recordWeeklyXpSnapshot(220, wk2Date);
  assert.equal(sNextWeek.weekKey, "2026-W48");
  assert.equal(sNextWeek.weeklyXp, 0);
  assert.equal(sNextWeek.optedIn, true);

  resetWeeklyLeagueForTesting();
});
