import assert from "node:assert/strict";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  POMODORO_PRESETS,
  completeCurrentPomodoroForTesting,
  formatPomodoroClock,
  getPomodoroState,
  pausePomodoro,
  resetPomodoro,
  resetPomodoroForTesting,
  selectPomodoroPreset,
  startPomodoro,
  subscribePomodoro,
  subscribePomodoroComplete,
  togglePomodoro,
} = loadTsModule("src/utils/pomodoroTimer.ts");

test("pomodoroTimer formats clocks cleanly and exposes 3 cozy presets", () => {
  assert.equal(POMODORO_PRESETS.length, 3);
  assert.deepEqual(
    POMODORO_PRESETS.map((p) => p.id),
    ["focus", "sprint", "break"],
  );
  assert.equal(formatPomodoroClock(1500), "25:00");
  assert.equal(formatPomodoroClock(65), "01:05");
  assert.equal(formatPomodoroClock(0), "00:00");
  assert.equal(formatPomodoroClock(-12), "00:00");
});

test("pomodoroTimer switches presets, starts/pauses, awards focus XP, and auto-queues tea break", () => {
  resetPomodoroForTesting();
  const stateEvents = [];
  const completionEvents = [];
  const unsubState = subscribePomodoro((s) => stateEvents.push(s));
  const unsubDone = subscribePomodoroComplete((e) => completionEvents.push(e));

  const init = getPomodoroState();
  assert.equal(init.presetId, "focus");
  assert.equal(init.remainingSeconds, 1500);
  assert.equal(init.isRunning, false);
  assert.equal(init.completedToday, 0);

  // Switch to 15m sprint
  const sprint = selectPomodoroPreset("sprint");
  assert.equal(sprint.presetId, "sprint");
  assert.equal(sprint.remainingSeconds, 900);

  // Start -> Pause -> Toggle
  assert.equal(startPomodoro().isRunning, true);
  assert.equal(pausePomodoro().isRunning, false);
  assert.equal(togglePomodoro().isRunning, true);

  // Completing a 15m sprint awards +20 XP, increments completedToday, and queues 5m tea break
  const afterSprint = completeCurrentPomodoroForTesting();
  assert.equal(afterSprint.isRunning, false);
  assert.equal(afterSprint.completedToday, 1);
  assert.equal(afterSprint.presetId, "break");
  assert.equal(afterSprint.remainingSeconds, 300);
  assert.equal(completionEvents.length, 1);
  assert.equal(completionEvents[0].rewardXp, 20);
  assert.equal(completionEvents[0].nextPresetId, "break");

  // Completing the tea break returns to the last focus preset (sprint) without extra XP
  const afterBreak = completeCurrentPomodoroForTesting();
  assert.equal(afterBreak.presetId, "sprint");
  assert.equal(afterBreak.remainingSeconds, 900);
  assert.equal(afterBreak.completedToday, 1);
  assert.equal(completionEvents.length, 2);
  assert.equal(completionEvents[1].rewardXp, 0);
  assert.equal(completionEvents[1].nextPresetId, "sprint");

  resetPomodoro();
  assert.equal(getPomodoroState().isRunning, false);

  unsubState();
  unsubDone();
  assert.ok(stateEvents.length >= 5);
  resetPomodoroForTesting();
});
