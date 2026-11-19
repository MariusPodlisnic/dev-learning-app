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

    // Toggle Theme (Dark -> Light) and re-check alignment & overflow
    await page.getByText(/LIGHT|DARK/).first().click();
    await page.waitForTimeout(150);
    const lightMetrics = await measureAccountHeaderBoxes(page);
    assert.ok(lightMetrics.overflowX <= 1);
    assert.ok(
      lightMetrics.boxes.achievements.x < lightMetrics.boxes.pro.x,
      "Order should stay intact after toggling theme",
    );

    // Profile modal opens with Level 1 avatar & no excluded rank tagline
    await page.getByText("MY PROFILE & STATS").first().click();
    await page.waitForSelector("text=LVL 1", { timeout: 5000 });
    const modalText = await page.locator("body").innerText();
    assert.ok(
      !modalText.includes("Professional StackOverflow archaeologist"),
      "Profile modal should exclude rank taglines",
    );
    await page.getByLabel("Close profile modal").click();

    // Settings modal opens from the SETTINGS header tray and exposes Studio Theme Palettes
    await page.getByLabel("Open Studio Settings and Themes").click();
    await page.waitForSelector("text=STUDIO SETTINGS", { timeout: 5000 });
    await page.waitForSelector("text=STUDIO THEME PALETTE", { timeout: 5000 });
    await page.waitForSelector("text=Matcha Cozy", { timeout: 5000 });
    await page.waitForSelector("text=DISPLAY NAME", { timeout: 5000 });
    await page.getByLabel("Close settings modal").click();

    // 5-Second Welcome card renders for fresh visitors and can be skipped cleanly
    await page.waitForSelector("text=5-SECOND SETUP", { timeout: 5000 });
    await page.getByLabel("Skip welcome setup").click();

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

    await page.getByText("SPEED BLITZ").first().click();
    await page.waitForSelector("text=60s", { timeout: 10000 });

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
