import assert from "node:assert/strict";
import test from "node:test";
import { openAppInBrowser } from "./helpers/playwrightHarness.mjs";

async function measureAccountHeaderBoxes(page) {
  return page.evaluate(() => {
    const targets = [
      { key: "profile", needle: "MY PROFILE & STATS" },
      { key: "streak", needle: "DAILY STREAK" },
      { key: "achievements", needle: "ACHIEVEMENTS" },
      { key: "leaderboard", needle: "LEADERBOARD" },
      { key: "pro", needle: "UPGRADE TO PRO" },
      { key: "save", needle: "SAVE PROGRESS" },
    ];

    function findBoxContainer(startNode) {
      let cur = startNode;
      while (cur && cur !== document.body) {
        const cs = window.getComputedStyle(cur);
        const bw = parseFloat(cs.borderTopWidth || "0");
        const rect = cur.getBoundingClientRect();
        if (bw >= 1.5 && rect.height >= 28 && rect.height <= 64 && rect.width >= 50) {
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom,
          };
        }
        cur = cur.parentElement;
      }
      return null;
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      const txt = (node.nodeValue || "").trim();
      if (txt) textNodes.push({ node, txt });
    }

    const boxes = {};
    for (const target of targets) {
      const match = textNodes.find((entry) => entry.txt.includes(target.needle));
      if (match?.node.parentElement) {
        boxes[target.key] = findBoxContainer(match.node.parentElement);
      }
    }

    return {
      boxes,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
}

test("Desktop browser layout: header boxes align uniformly, themes toggle, and lazy arenas render cleanly", async () => {
  const session = await openAppInBrowser({
    viewport: { width: 1280, height: 800 },
    pathName: "/",
  });

  try {
    const { page, pageErrors } = session;
    await page.waitForSelector("text=ACCOUNT & RANK", { timeout: 10000 });
    await page.waitForSelector("text=UPGRADE TO PRO", { timeout: 10000 });

    const metrics = await measureAccountHeaderBoxes(page);
    assert.ok(
      metrics.overflowX <= 1,
      `Expected no desktop horizontal overflow, got scrollWidth=${metrics.scrollWidth}, innerWidth=${metrics.innerWidth}`,
    );

    for (const key of [
      "profile",
      "streak",
      "achievements",
      "leaderboard",
      "pro",
      "save",
    ]) {
      assert.ok(metrics.boxes[key], `Expected bounding box for ${key}`);
    }

    // All 6 Account & Rank header boxes should share uniform height & vertical top alignment
    const heights = Object.values(metrics.boxes).map((b) => b.height);
    const tops = Object.values(metrics.boxes).map((b) => b.y);
    assert.ok(
      Math.max(...heights) - Math.min(...heights) <= 4,
      `Header boxes should have matched heights, got ${JSON.stringify(heights)}`,
    );
    assert.ok(
      Math.max(...tops) - Math.min(...tops) <= 4,
      `Header boxes should align vertically on the same row, got y=${JSON.stringify(tops)}`,
    );

    // Horizontal order: Profile -> Daily Streak -> Achievements -> Leaderboard -> Upgrade to Pro -> Save Progress
    assert.ok(metrics.boxes.profile.x < metrics.boxes.streak.x);
    assert.ok(metrics.boxes.streak.x < metrics.boxes.achievements.x);
    assert.ok(metrics.boxes.achievements.x < metrics.boxes.leaderboard.x);
    assert.ok(metrics.boxes.leaderboard.x < metrics.boxes.pro.x);
    assert.ok(metrics.boxes.pro.x < metrics.boxes.save.x);

    // Unified Settings menu organizes Appearance (Dark/Light + 4 Palettes), Audio, and Studio tabs
    const darkTvBg = await page
      .getByTestId("retro-tv-cabinet")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    await page.getByLabel("Open Studio Settings and Themes").click();
    await page.waitForSelector("text=STUDIO SETTINGS", { timeout: 5000 });
    await page.waitForSelector("text=DISPLAY MODE", { timeout: 5000 });
    await page.waitForSelector("text=STUDIO THEME PALETTE", { timeout: 5000 });
    await page.getByLabel("Switch to Light Mode").click();
    await page.waitForTimeout(150);
    const lightTvBg = await page
      .getByTestId("retro-tv-cabinet")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    assert.notEqual(
      lightTvBg,
      darkTvBg,
      `Expected Retro TV cabinet to update between dark (${darkTvBg}) and light (${lightTvBg}) mode`,
    );

    // Switch palette to Matcha Cozy and verify Audio + Studio tabs inside Settings
    await page.getByText("Matcha Cozy").first().click();
    await page.waitForTimeout(100);
    await page.getByLabel("Settings tab: 🎧 AUDIO").click();
    await page.waitForSelector("text=LO-FI FOCUS RADIO", { timeout: 5000 });
    await page.waitForSelector("text=AMBIENT DESK MIXER", { timeout: 5000 });
    await page.waitForSelector("text=Soft Rain", { timeout: 5000 });
    await page.getByText("▶ PLAY RADIO").click();
    await page.getByLabel("Apply ambient preset 🌧️ Rainy Night").click();
    await page.waitForSelector("text=❚❚ MUTE MIX (3)", { timeout: 5000 });
    await page.waitForSelector("text=MECHANICAL KEYCAP TYPING", { timeout: 5000 });
    await page.getByLabel("Settings tab: ⚙️ STUDIO").click();
    await page.waitForSelector("text=DEVELOPER DISPLAY NAME", { timeout: 5000 });
    await page.waitForSelector("text=PYTHON ENGINE RUNTIME", { timeout: 5000 });
    await page.getByLabel("Close settings modal").click();

    // When both Lo-Fi + Ambient are playing, header shows ONE unified pause pill and never clips SETTINGS
    await page.waitForSelector("text=LO-FI + 3 MIX", { timeout: 5000 });
    const settingsBtnBox = await page
      .getByLabel("Open Studio Settings and Themes")
      .boundingBox();
    assert.ok(settingsBtnBox, "Expected SETTINGS button bounding box");
    assert.ok(
      settingsBtnBox.x + settingsBtnBox.width <= 1280,
      `Expected SETTINGS button not to clip off-screen when audio is playing, got right=${settingsBtnBox.x + settingsBtnBox.width}`,
    );
    await page.getByLabel("Pause active studio audio").click();
    await page.waitForTimeout(100);

    const matchaTvBg = await page
      .getByTestId("retro-tv-cabinet")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    assert.notEqual(
      matchaTvBg,
      lightTvBg,
      `Expected Retro TV cabinet to update when switching to Matcha Cozy (${matchaTvBg} vs ${lightTvBg})`,
    );

    const lightMetrics = await measureAccountHeaderBoxes(page);
    assert.ok(lightMetrics.overflowX <= 1);
    assert.ok(
      lightMetrics.boxes.achievements.x < lightMetrics.boxes.leaderboard.x &&
        lightMetrics.boxes.leaderboard.x < lightMetrics.boxes.pro.x,
      "Order should stay intact after switching theme and palette",
    );

    // Profile modal opens with Level 1 avatar, no excluded rank tagline, and working PNG card download
    await page.getByText("MY PROFILE & STATS").first().click();
    await page.waitForSelector("text=LVL 1", { timeout: 5000 });
    await page.waitForSelector("text=COZY PIXEL GARDEN · 12 WEEKS", { timeout: 5000 });
    await page.waitForSelector("text=SAVE PNG CARD", { timeout: 5000 });
    const modalText = await page.locator("body").innerText();
    assert.ok(
      !modalText.includes("Professional StackOverflow archaeologist"),
      "Profile modal should exclude rank taglines",
    );
    const [pngDownload] = await Promise.all([
      page.waitForEvent("download", { timeout: 5000 }),
      page.getByLabel("Save visual PNG developer card").click(),
    ]);
    assert.ok(
      pngDownload.suggestedFilename().endsWith(".png"),
      `Expected PNG share card download, got ${pngDownload.suggestedFilename()}`,
    );
    await page.getByLabel("Close profile modal").click();

    // 5-Second Welcome card renders for fresh visitors and can be skipped cleanly
    await page.waitForSelector("text=5-SECOND SETUP", { timeout: 5000 });
    await page.getByLabel("Skip welcome setup").click();

    // Byte-Cat Interactive Style Wardrobe: verify all 5 tabs align identically, equip CRT Pixel Glasses & switch mood
    const styleTabYs = await page.evaluate(() => {
      const labels = ["WISDOM", "SNACK", "QUIZ", "STYLE", "PERKS"];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const found = {};
      let n;
      while ((n = walker.nextNode())) {
        const t = (n.nodeValue || "").trim();
        if (labels.includes(t) && !found[t] && n.parentElement) {
          found[t] = Math.round(n.parentElement.getBoundingClientRect().y * 10) / 10;
        }
      }
      return found;
    });
    const tabYVals = Object.values(styleTabYs);
    assert.equal(tabYVals.length, 5, `Expected all 5 Byte-Cat tabs, got ${JSON.stringify(styleTabYs)}`);
    assert.ok(
      Math.max(...tabYVals) - Math.min(...tabYVals) <= 2,
      `Expected Byte-Cat tabs to align identically vertically, got ${JSON.stringify(styleTabYs)}`,
    );
    await page.getByText("STYLE", { exact: true }).first().click();
    await page.waitForSelector("text=COZY WARDROBE", { timeout: 5000 });
    await page.getByLabel("Set Byte-Cat mood to Ship-It Hype").click();
    await page.getByLabel("Equip CRT Pixel Glasses").click();
    await page.getByTestId("bytecat-acc-crt_glasses").waitFor({ timeout: 5000 });

    // Pomodoro Cozy Focus Timer: switch to 15m sprint, start, pause, and reset cleanly
    await page.getByLabel("Select 15m Sprint timer").click();
    await page.waitForSelector("text=15:00", { timeout: 5000 });
    await page.getByLabel("Start Pomodoro focus timer").click();
    await page.getByLabel("Pause Pomodoro focus timer").waitFor({ timeout: 5000 });
    await page.getByLabel("Pause Pomodoro focus timer").click();
    await page.getByLabel("Select 25m Focus timer").click();

    // Midnight Bubble Retro TV switches channels smoothly and keeps CH 04/05 animations alive on repeat laps
    await page.waitForSelector("text=CH 01/05", { timeout: 5000 });
    for (let step = 0; step < 8; step += 1) {
      const expectedBefore = `CH 0${(step % 5) + 1}/05`;
      const expectedAfter = `CH 0${((step + 1) % 5) + 1}/05`;
      await page.getByText(expectedBefore).first().click();
      await page.waitForSelector(`text=${expectedAfter}`, { timeout: 5000 });
    }
    // We are now on the 2nd visit to CH 04 (index 3)
    const ch4Text = await page.locator("body").innerText();
    assert.ok(
      !ch4Text.includes("COZY RAIN"),
      "CH 04 should not display COZY RAIN · FLOW",
    );
    const eqHeights = [];
    for (let i = 0; i < 4; i += 1) {
      const h = await page
        .getByTestId("retro-tv-eq-bar-0")
        .evaluate((el) => el.getBoundingClientRect().height);
      eqHeights.push(Math.round(h * 10) / 10);
      await page.waitForTimeout(120);
    }
    assert.ok(
      new Set(eqHeights).size > 1,
      `Expected CH 04 equalizer to keep animating on 2nd lap, got heights=${JSON.stringify(eqHeights)}`,
    );

    // Advance to 2nd visit of CH 05 and verify coffee/matcha steam keeps animating
    await page.getByText("CH 04/05").first().click();
    await page.waitForSelector("text=CH 05/05", { timeout: 5000 });
    const steamTransforms = [];
    for (let i = 0; i < 4; i += 1) {
      const tf = await page
        .getByTestId("retro-tv-steam-0")
        .evaluate((el) => window.getComputedStyle(el).transform);
      steamTransforms.push(tf);
      await page.waitForTimeout(140);
    }
    assert.ok(
      new Set(steamTransforms).size > 1,
      `Expected CH 05 steam to keep animating on 2nd lap, got transforms=${JSON.stringify(steamTransforms)}`,
    );

    // Auth modal exposes OAuth buttons & Forgot Password reset flow
    await page.getByText("SAVE PROGRESS").first().click();
    await page.waitForSelector("text=GitHub", { timeout: 5000 });
    await page.waitForSelector("text=Google", { timeout: 5000 });
    await page.getByText("Forgot password?").first().click();
    await page.waitForSelector("text=Reset Your Password", { timeout: 5000 });
    await page.getByText("Send Reset Link", { exact: false }).waitFor({ timeout: 5000 });
    await page.getByLabel("Close authentication modal").click();

    // Secondary lazy-loaded arenas hydrate cleanly via React.lazy + Suspense
    await page.getByText("ACHIEVEMENTS").first().click();
    await page.waitForSelector("text=TROPHY HALL", { timeout: 10000 });

    // Dedicated top-level Leaderboard menu button opens Weekly League directly
    await page.getByLabel("Open Weekly League Leaderboard").click();
    await page.waitForSelector("text=TOP 3 WEEKLY PROMOTION ZONE", { timeout: 10000 });
    await page.waitForSelector("text=COZY GHOST RIVALS", { timeout: 5000 });

    // Dedicated Cozy Arcade Hub organizes all mini-games cleanly with 1-tap cartridge switching
    await page.getByLabel("Open Devy Mini-Game Arcade").click();
    await page.waitForSelector("text=Devy Mini-Game Arcade", { timeout: 10000 });
    const arcadeAlign = await page.evaluate(() => {
      const filterLabels = [
        "ALL GAMES (6)",
        "QUICK SPRINTS (2)",
        "MEMORY & RECALL (2)",
        "SANDBOX & BUILDS (2)",
      ];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const ys = {};
      let n;
      while ((n = walker.nextNode())) {
        const t = (n.nodeValue || "").trim();
        if (filterLabels.includes(t) && !ys[t] && n.parentElement) {
          ys[t] = Math.round(n.parentElement.getBoundingClientRect().y * 10) / 10;
        }
      }
      return ys;
    });
    const arcadeYVals = Object.values(arcadeAlign);
    assert.equal(arcadeYVals.length, 4, `Expected all 4 Arcade filter tabs, got ${JSON.stringify(arcadeAlign)}`);
    assert.ok(
      Math.max(...arcadeYVals) - Math.min(...arcadeYVals) <= 2,
      `Expected Arcade filter tab labels to align identically, got ${JSON.stringify(arcadeAlign)}`,
    );

    // Launch Cozy Mini-Builds (CART-05) and verify both free sandboxes switch cleanly
    await page.getByLabel("Launch Cozy Mini-Builds").click();
    await page.waitForSelector("text=Password Strength Meter", { timeout: 10000 });
    await page.waitForSelector("text=LIVE PREVIEW WIDGET", { timeout: 5000 });
    await page.getByLabel("Select mini-build Mini URL Shortener").click();
    await page.waitForSelector("text=Mini URL Shortener", { timeout: 5000 });

    // Switch to Python Playground (CART-06) directly via ArcadeSubNavBar and test template + saved snippet flow
    await page.getByLabel("Switch to Python Playground").click();
    await page.waitForSelector("text=PLAYGROUND.PY · FREE PYTHON 3.11 SCRATCHPAD", { timeout: 10000 });
    await page.waitForSelector("text=RUN PLAYGROUND", { timeout: 5000 });
    await page.getByLabel("Load ASCII Byte-Cat template").click();
    await page.getByLabel("Snippet name input").fill("ByteCat Banner");
    await page.getByLabel("Save current playground snippet").click();
    await page.waitForSelector("text=ByteCat Banner", { timeout: 5000 });

    // Switch to Output Detective (CART-04), answer case 1, inspect trace breakdown, advance to case 2
    await page.getByLabel("Switch to Output Detective").click();
    await page.waitForSelector("text=CASE 1 OF 6", { timeout: 10000 });
    await page.getByLabel(/^Predict option A:/).first().click();
    await page.getByLabel("Next detective case").waitFor({ timeout: 5000 });
    await page.getByLabel("Next detective case").click();
    await page.waitForSelector("text=CASE 2 OF 6", { timeout: 5000 });

    await page.getByLabel("Switch to 60s Speed Blitz").click();
    await page.waitForSelector("text=60s", { timeout: 10000 });

    await page.getByLabel("Switch to Flashcards Concept Deck").click();
    await page.waitForSelector("text=Flashcards Deck", { timeout: 10000 });
    await page.waitForSelector("text=CARD 1 OF 8", { timeout: 5000 });
    await page.getByLabel("Flip flashcard to reveal answer").click();
    await page.waitForSelector("text=KEY ANSWER", { timeout: 5000 });
    await page.getByLabel("Mark card as mastered").click();
    await page.waitForSelector("text=CARD 2 OF 8", { timeout: 5000 });

    await page.getByLabel("Switch to Production Bug Hunt").click();
    await page.waitForSelector("text=BUG HUNT", { timeout: 10000 });
    await page.getByLabel("Back to Cozy Arcade Lobby").click();
    await page.waitForSelector("text=Devy Mini-Game Arcade", { timeout: 5000 });

    // Entering Code Studio from Skill Map works cleanly (lesson-focused without scratchpad tab clutter)
    await page.getByText("SKILL MAP").first().click();
    await page.waitForSelector("text=CHOOSE YOUR LEARNING PATH", { timeout: 5000 });
    await page.getByText("CODE STUDIO").first().click();
    await page.waitForSelector("text=SUBMIT CODE", { timeout: 10000 });
    await page.waitForSelector("text=TEST RUN", { timeout: 5000 });
    await page.waitForSelector("text=TRACE", { timeout: 5000 });

    // Keyboard Command Palette opens with Ctrl+K, filters commands, and jumps cleanly to Playground
    await page.keyboard.press("Control+k");
    await page.getByLabel("Quick command palette search").waitFor({ timeout: 5000 });
    await page.getByLabel("Quick command palette search").fill("playground");
    await page.getByLabel("Run command: Python Playground (playground.py)").click();
    await page.waitForSelector("text=PLAYGROUND.PY · FREE PYTHON 3.11 SCRATCHPAD", { timeout: 5000 });

    assert.deepEqual(pageErrors, [], `Unexpected page errors: ${pageErrors.join("; ")}`);
  } finally {
    await session.close();
  }
});

test("Showcase route (/explore) renders cleanly without horizontal overflow or runtime errors", async () => {
  const session = await openAppInBrowser({
    viewport: { width: 1280, height: 800 },
    pathName: "/explore",
  });

  try {
    const { page, pageErrors } = session;
    await page.waitForSelector("text=Devy", { timeout: 10000 });
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(overflowX <= 1, `Expected no overflow on /explore, got ${overflowX}`);
    assert.deepEqual(pageErrors, []);
  } finally {
    await session.close();
  }
});

test("Mobile viewport (390x844): compact header & bottom thumb nav render with zero horizontal overflow", async () => {
  const session = await openAppInBrowser({
    viewport: { width: 390, height: 844 },
    pathName: "/",
  });

  try {
    const { page, pageErrors } = session;
    await page.waitForSelector("text=GET PRO", { timeout: 10000 });
    await page.waitForSelector("text=PROFILE ↗", { timeout: 5000 });

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyText: document.body.innerText,
    }));

    assert.ok(
      layout.scrollWidth <= layout.innerWidth + 1,
      `Expected no horizontal overflow at 390px width, got scrollWidth=${layout.scrollWidth}`,
    );
    assert.ok(layout.bodyText.includes("ACHIEVEMENTS"));
    assert.ok(layout.bodyText.includes("LEAGUE"));
    assert.ok(layout.bodyText.includes("SETTINGS"));
    assert.ok(layout.bodyText.includes("GET PRO"));
    assert.deepEqual(pageErrors, []);
  } finally {
    await session.close();
  }
});
