import assert from "node:assert/strict";
import test from "node:test";
import { openAppInBrowser } from "./helpers/playwrightHarness.mjs";

async function measureAccountHeaderBoxes(page) {
  return page.evaluate(() => {
    const targets = [
      { key: "profile", needle: "MY PROFILE & STATS" },
      { key: "streak", needle: "DAILY STREAK" },
      { key: "achievements", needle: "ACHIEVEMENTS" },
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

    for (const key of ["profile", "streak", "achievements", "pro", "save"]) {
      assert.ok(metrics.boxes[key], `Expected bounding box for ${key}`);
    }

    // All 5 header boxes should share uniform height & vertical top alignment
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

    // Horizontal order: Profile -> Daily Streak -> Achievements -> Upgrade to Pro -> Save Progress
    assert.ok(metrics.boxes.profile.x < metrics.boxes.streak.x);
    assert.ok(metrics.boxes.streak.x < metrics.boxes.achievements.x);
    assert.ok(metrics.boxes.achievements.x < metrics.boxes.pro.x);
    assert.ok(metrics.boxes.pro.x < metrics.boxes.save.x);

    // Toggle Theme (Dark -> Light) and verify alignment, overflow, and Retro TV cabinet re-theming
    const darkTvBg = await page
      .getByTestId("retro-tv-cabinet")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    await page.getByText(/LIGHT|DARK/).first().click();
    await page.waitForTimeout(150);
    const lightTvBg = await page
      .getByTestId("retro-tv-cabinet")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    assert.notEqual(
      lightTvBg,
      darkTvBg,
      `Expected Retro TV cabinet to update between dark (${darkTvBg}) and light (${lightTvBg}) mode`,
    );
    const lightMetrics = await measureAccountHeaderBoxes(page);
    assert.ok(lightMetrics.overflowX <= 1);
    assert.ok(
      lightMetrics.boxes.achievements.x < lightMetrics.boxes.pro.x,
      "Order should stay intact after toggling theme",
    );

    // Profile modal opens with Level 1 avatar, no excluded rank tagline, and working PNG card download
    await page.getByText("MY PROFILE & STATS").first().click();
    await page.waitForSelector("text=LVL 1", { timeout: 5000 });
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

    // Settings modal opens from the SETTINGS header tray and switching palette re-themes the Retro TV
    await page.getByLabel("Open Studio Settings and Themes").click();
    await page.waitForSelector("text=STUDIO SETTINGS", { timeout: 5000 });
    await page.waitForSelector("text=STUDIO THEME PALETTE", { timeout: 5000 });
    await page.waitForSelector("text=Matcha Cozy", { timeout: 5000 });
    await page.waitForSelector("text=DISPLAY NAME", { timeout: 5000 });
    await page.getByText("Matcha Cozy").first().click();
    await page.waitForTimeout(100);
    await page.getByLabel("Close settings modal").click();
    const matchaTvBg = await page
      .getByTestId("retro-tv-cabinet")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    assert.notEqual(
      matchaTvBg,
      lightTvBg,
      `Expected Retro TV cabinet to update when switching to Matcha Cozy (${matchaTvBg} vs ${lightTvBg})`,
    );

    // 5-Second Welcome card renders for fresh visitors and can be skipped cleanly
    await page.waitForSelector("text=5-SECOND SETUP", { timeout: 5000 });
    await page.getByLabel("Skip welcome setup").click();

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
    await page.getByLabel("View Weekly League Leaderboard").click();
    await page.waitForSelector("text=TOP 3 WEEKLY PROMOTION ZONE", { timeout: 5000 });
    await page.waitForSelector("text=COZY GHOST RIVALS", { timeout: 5000 });

    await page.getByText("SPEED BLITZ").first().click();
    await page.waitForSelector("text=60s", { timeout: 10000 });

    await page.getByText("FLASH DECK").first().click();
    await page.waitForSelector("text=Flashcards Deck", { timeout: 10000 });
    await page.waitForSelector("text=CARD 1 OF 8", { timeout: 5000 });
    await page.getByLabel("Flip flashcard to reveal answer").click();
    await page.waitForSelector("text=KEY ANSWER", { timeout: 5000 });
    await page.getByLabel("Mark card as mastered").click();
    await page.waitForSelector("text=CARD 2 OF 8", { timeout: 5000 });

    await page.getByText("BUG HUNT").first().click();
    await page.waitForSelector("text=BUG HUNT", { timeout: 10000 });

    // Entering Code Studio from Skill Map works cleanly
    await page.getByText("SKILL MAP").first().click();
    await page.waitForSelector("text=CHOOSE YOUR LEARNING PATH", { timeout: 5000 });
    await page.getByText("CODE STUDIO").first().click();
    await page.waitForSelector("text=SUBMIT CODE", { timeout: 10000 });
    await page.waitForSelector("text=TEST RUN", { timeout: 5000 });
    await page.waitForSelector("text=TRACE", { timeout: 5000 });

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
    assert.ok(layout.bodyText.includes("GET PRO"));
    assert.deepEqual(pageErrors, []);
  } finally {
    await session.close();
  }
});
