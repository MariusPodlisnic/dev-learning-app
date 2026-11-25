import assert from "node:assert/strict";
import test from "node:test";
import { openAppInBrowser } from "./helpers/playwrightHarness.mjs";

async function measureAccountHeaderBoxes(page) {
  return page.evaluate(() => {
    function findBoxContainer(startNode) {
      let cur = startNode;
      while (cur && cur !== document.body) {
        const cs = window.getComputedStyle(cur);
        const bw = parseFloat(cs.borderTopWidth || "0");
        const rect = cur.getBoundingClientRect();
        if (bw >= 1.5 && rect.height >= 26 && rect.height <= 48 && rect.width >= 32) {
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

    const brandEl = document.querySelector('[aria-label="Go to Devy Home Menu"]');
    let headerEl = brandEl?.parentElement;
    while (headerEl && headerEl.parentElement && headerEl.getBoundingClientRect().width < window.innerWidth - 20) {
      headerEl = headerEl.parentElement;
    }
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;

    function boxForSelector(selector) {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      };
    }

    const profBtn = document.querySelector('[aria-label="Open Profile and Stats"]');
    const boxes = {
      profile: profBtn?.children?.[0] ? findBoxContainer(profBtn.children[0]) : null,
      streak: profBtn?.children?.[1] ? findBoxContainer(profBtn.children[1]) : null,
      achievements: boxForSelector('[aria-label="Open Achievements Trophy Hall"]'),
      leaderboard: boxForSelector('[aria-label="Open Weekly League Leaderboard"]'),
      pro: boxForSelector('[aria-label="Upgrade to Devy Pro"]'),
      save: boxForSelector('[aria-label="Save progress and sign in"]'),
    };
    const trays = {
      coding: boxForSelector('[data-testid="header-tray-coding"]'),
      settings: boxForSelector('[data-testid="header-tray-settings"]'),
      account: boxForSelector('[data-testid="header-tray-account"]'),
    };

    return {
      boxes,
      trays,
      headerHeight,
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
    // Root URL (/) lands on the Lo-Fi Arcade Orbit Showcase first, then teleports to HOME on Begin Your Adventure
    await page.waitForSelector("text=Begin Your Adventure", { timeout: 10000 });
    const landingOverflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(landingOverflowX <= 1, `Expected no overflow on default Showcase landing, got ${landingOverflowX}`);
    await page.getByLabel("Begin Your Adventure", { exact: true }).click();

    await page.waitForSelector("text=ACCOUNT & RANK", { timeout: 10000 });
    await page.waitForSelector("text=UPGRADE TO PRO", { timeout: 10000 });

    const metrics = await measureAccountHeaderBoxes(page);
    assert.ok(
      metrics.overflowX <= 1,
      `Expected no desktop horizontal overflow, got scrollWidth=${metrics.scrollWidth}, innerWidth=${metrics.innerWidth}`,
    );
    assert.ok(
      metrics.headerHeight > 0 && metrics.headerHeight <= 145,
      `Expected organized 2-row tray desktop header <= 145px tall (never 3 lines), got ${metrics.headerHeight}px`,
    );

    // Row 1 holds CODING & LABS + SETTINGS side-by-side; Row 2 holds ACCOUNT & RANK cleanly below
    assert.ok(
      metrics.trays.coding && metrics.trays.settings && metrics.trays.account,
      `Expected all 3 categorized trays to render, got ${JSON.stringify(metrics.trays)}`,
    );
    assert.ok(
      Math.abs(metrics.trays.coding.y - metrics.trays.settings.y) <= 6,
      `Expected CODING & LABS and SETTINGS trays to share Row 1, got y=${metrics.trays.coding.y} vs ${metrics.trays.settings.y}`,
    );
    assert.ok(
      metrics.trays.coding.right < metrics.trays.settings.x,
      `Expected SETTINGS tray to sit to the right of CODING & LABS on Row 1`,
    );
    assert.ok(
      metrics.trays.account.y > metrics.trays.coding.y + 40,
      `Expected ACCOUNT & RANK tray to sit cleanly on Row 2 below Row 1`,
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
      assert.ok(
        metrics.boxes[key].height >= 34,
        `Expected comfy clickable button height >= 34px for ${key}, got ${metrics.boxes[key].height}px`,
      );
    }

    // All 6 Account & Rank telemetry cards align cleanly on Row 2 with matched heights and strict horizontal order
    const accountTops = [
      metrics.boxes.profile.y,
      metrics.boxes.streak.y,
      metrics.boxes.achievements.y,
      metrics.boxes.leaderboard.y,
      metrics.boxes.pro.y,
      metrics.boxes.save.y,
    ];
    assert.ok(
      Math.max(...accountTops) - Math.min(...accountTops) <= 4,
      `All Account & Rank boxes should align on Row 2, got y=${JSON.stringify(accountTops)}`,
    );
    assert.ok(metrics.boxes.profile.x < metrics.boxes.streak.x);
    assert.ok(metrics.boxes.streak.x < metrics.boxes.achievements.x);
    assert.ok(metrics.boxes.achievements.x < metrics.boxes.leaderboard.x);
    assert.ok(metrics.boxes.leaderboard.x < metrics.boxes.pro.x);
    assert.ok(metrics.boxes.pro.x < metrics.boxes.save.x);

    // HOME Main Menu showcases the interactive Living Lo-Fi Dev Loft & portal-linked room highlights
    await page.getByLabel("Interactive studio loft: LIVING LO-FI DEV LOFT").waitFor({ timeout: 10000 });
    await page.waitForSelector("text=OPEN SKILL MAP", { timeout: 5000 });
    await page.getByLabel("Open Mini-Game Arcade", { exact: true }).hover();
    await page.getByLabel("Interactive studio loft: RETRO ARCADE CABINET").waitFor({ timeout: 5000 });
    await page.getByLabel("Open Code Studio", { exact: true }).hover();
    await page.getByLabel("Interactive studio loft: CODE STUDIO DESK").waitFor({ timeout: 5000 });

    // Switch to Skill Map to verify dedicated Roadmap Tree + Retro TV dark/light mode response
    await page.getByText("SKILL MAP").first().click();
    await page.waitForSelector("text=CHOOSE YOUR LEARNING PATH", { timeout: 5000 });
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

    // Return to HOME Main Menu for Welcome, Daily Wisdom Board, and Loft checks
    await page.getByLabel("Open Devy Home Menu").click();
    await page.getByTestId("home-loft-stage").waitFor({ timeout: 5000 });

    const lightMetrics = await measureAccountHeaderBoxes(page);
    assert.ok(lightMetrics.overflowX <= 1);
    assert.ok(
      lightMetrics.boxes.achievements.x < lightMetrics.boxes.leaderboard.x &&
        lightMetrics.boxes.pro.x < lightMetrics.boxes.save.x,
      "Order should stay intact after switching theme and palette",
    );

    // Profile modal opens with Level 1 avatar, no excluded rank tagline, and working PNG card download
    await page.getByLabel("Open Profile and Stats").click();
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

    // Vintage Mechanical Split-Flap Daily Wisdom Board replaces the old mascot box cleanly
    await page.getByTestId("home-wisdom-flap-board").waitFor({ timeout: 5000 });
    await page.waitForSelector("text=DEVY LOFT · DAILY WISDOM BOARD", { timeout: 5000 });
    await page.waitForSelector("text=FIRST, SOLVE THE PROBLEM", { timeout: 5000 });
    await page.getByLabel("Next developer wisdom quote", { exact: true }).click();
    await page.waitForSelector("text=EVERY MASTER PROGRAMMER", { timeout: 5000 });
    await page.getByLabel("Save quote to favorites").click();
    await page.waitForSelector("text=★ SAVED", { timeout: 5000 });
    await page.waitForSelector("text=★ (1)", { timeout: 5000 });

    // Switch to SKILL MAP and verify Midnight Bubble Retro TV switches channels smoothly and keeps CH 04/05 animations alive on repeat laps
    await page.getByText("SKILL MAP").first().click();
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

    // Verify Interactive Astral Star Chart is the sole Skill Map view with zoom, recenter, and chapter jump
    await page.getByTestId("roadmap-astral-chart").waitFor({ timeout: 5000 });
    await page.waitForSelector("text=ASTRAL STAR CHART", { timeout: 5000 });
    await page.getByLabel("Zoom in star chart").click();
    await page.waitForSelector("text=115%", { timeout: 5000 });
    await page.getByLabel("Center star chart on active mission").click();
    await page.waitForSelector("text=100%", { timeout: 5000 });
    await page.getByLabel(/^Jump star chart to Chapter II:/).click();
    await page.getByTestId("astral-star-inspector").waitFor({ timeout: 5000 });

    // Auth modal exposes OAuth buttons & Forgot Password reset flow
    await page.getByLabel("Save progress and sign in").click();
    await page.waitForSelector("text=GitHub", { timeout: 5000 });
    await page.waitForSelector("text=Google", { timeout: 5000 });
    await page.getByText("Forgot password?").first().click();
    await page.waitForSelector("text=Reset Your Password", { timeout: 5000 });
    await page.getByText("Send Reset Link", { exact: false }).waitFor({ timeout: 5000 });
    await page.getByLabel("Close authentication modal").click();

    // Secondary lazy-loaded arenas hydrate cleanly via React.lazy + Suspense
    await page.getByLabel("Open Achievements Trophy Hall").click();
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
    await page.getByLabel("Load ASCII Banner template").click();
    await page.getByLabel("Snippet name input").fill("Studio Banner");
    await page.getByLabel("Save current playground snippet").click();
    await page.waitForSelector("text=Studio Banner", { timeout: 5000 });

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

    // Verify Code Studio workspace scrolls vertically (not static/locked)
    const studioScrollCheck = await page.evaluate(() => {
      const scrollEl = [...document.querySelectorAll("div")].find((d) => {
        const cs = window.getComputedStyle(d);
        return (
          (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
          d.innerText.includes("SUBMIT CODE") &&
          d.scrollHeight > d.clientHeight
        );
      });
      if (!scrollEl) return { found: false, moved: false };
      scrollEl.scrollTop = 180;
      return { found: true, moved: scrollEl.scrollTop > 0 };
    });
    assert.ok(
      studioScrollCheck.found && studioScrollCheck.moved,
      `Expected Code Studio workspace to scroll vertically, got ${JSON.stringify(studioScrollCheck)}`,
    );

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

test("Showcase route (/explore) renders Lo-Fi Arcade Orbit showcase cleanly and teleports to Home on Begin Your Adventure", async () => {
  const session = await openAppInBrowser({
    viewport: { width: 1280, height: 800 },
    pathName: "/explore",
  });

  try {
    const { page, pageErrors } = session;
    await page.waitForSelector("text=Begin Your Adventure", { timeout: 10000 });
    await page.waitForSelector("text=Live Python 3.11 Studio", { timeout: 5000 });
    await page.waitForSelector("text=FREE TRACK", { timeout: 5000 });
    await page.waitForSelector("text=DEVY PRO", { timeout: 5000 });

    const bodyText = await page.locator("body").innerText();
    assert.equal(bodyText.includes("01 // KEY FEATURES"), false);
    assert.equal(bodyText.includes("02 // FREE & PRO TRACKS"), false);

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(overflowX <= 1, `Expected no overflow on /explore, got ${overflowX}`);

    // Clicking Begin Your Adventure warps and teleports directly to HOME
    await page.getByLabel("Begin Your Adventure", { exact: true }).click();
    await page.getByTestId("home-loft-stage").waitFor({ timeout: 10000 });
    assert.deepEqual(pageErrors, []);
  } finally {
    await session.close();
  }
});

test("Mobile viewport (390x844): PWA manifest, compact header, Quick Jump, Pixel Garden, and Arcade screens render with zero horizontal overflow", async () => {
  const session = await openAppInBrowser({
    viewport: { width: 390, height: 844 },
    pathName: "/",
  });

  async function assertZeroMobileOverflow(page, screenName) {
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    assert.ok(
      dims.scrollWidth <= dims.innerWidth + 1,
      `Expected no horizontal overflow on ${screenName} at 390px, got scrollWidth=${dims.scrollWidth} (innerWidth=${dims.innerWidth})`,
    );
  }

  try {
    const { page, pageErrors } = session;
    // Root URL (/) opens the Lo-Fi Arcade Orbit Showcase first with zero horizontal overflow at 390px
    await page.waitForSelector("text=Begin Your Adventure", { timeout: 10000 });
    await assertZeroMobileOverflow(page, "Default Showcase Landing");
    await page.getByLabel("Begin Your Adventure", { exact: true }).click();

    await page.waitForSelector("text=GET PRO", { timeout: 10000 });
    await page.waitForSelector("text=LVL 1", { timeout: 5000 });

    // Verify installable PWA manifest link & valid JSON payload
    const manifestInfo = await page.evaluate(async () => {
      const link = document.querySelector('link[rel="manifest"]');
      const href = link ? link.getAttribute("href") : null;
      if (!href) return { href: null, ok: false };
      const resp = await fetch(href);
      const data = resp.ok ? await resp.json() : null;
      return {
        href,
        ok: resp.ok,
        display: data?.display,
        iconsCount: Array.isArray(data?.icons) ? data.icons.length : 0,
      };
    });
    assert.equal(manifestInfo.href, "/manifest.json");
    assert.equal(manifestInfo.ok, true);
    assert.equal(manifestInfo.display, "standalone");
    assert.ok(manifestInfo.iconsCount >= 2);

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("ACHIEVEMENTS"));
    assert.ok(bodyText.includes("LEAGUE"));
    assert.ok(bodyText.includes("SETTINGS"));
    assert.ok(bodyText.includes("GET PRO"));
    await page.getByTestId("home-loft-stage").waitFor({ timeout: 5000 });
    await assertZeroMobileOverflow(page, "Home Main Menu");

    // Mobile bottom thumb nav -> Dedicated Skill Map fits cleanly at 390px
    await page.getByLabel("Skill Map", { exact: true }).click();
    await page.waitForSelector("text=CHOOSE YOUR LEARNING PATH", { timeout: 5000 });
    await assertZeroMobileOverflow(page, "Skill Map");
    await page.getByLabel("Home Menu", { exact: true }).click();
    await page.getByTestId("home-loft-stage").waitFor({ timeout: 5000 });

    // Mobile Quick-Jump button opens Command Palette cleanly without overflow
    await page.getByLabel("Open Quick Command Palette").click();
    await page.getByLabel("Quick command palette search").waitFor({ timeout: 5000 });
    await assertZeroMobileOverflow(page, "Command Palette Modal");
    await page.getByLabel("Close command palette", { exact: true }).click();

    // Profile modal + 12-Week Cozy Pixel Garden fit cleanly inside 390px phone viewport
    await page.getByLabel("Open Profile and Stats").click();
    await page.waitForSelector("text=COZY PIXEL GARDEN · 12 WEEKS", { timeout: 5000 });
    await assertZeroMobileOverflow(page, "Profile & Pixel Garden");
    await page.getByLabel("Close profile modal").click();

    // Mobile bottom thumb nav -> Arcade Hub + Mini-Builds + Output Detective + Playground
    await page.getByLabel("Cozy Arcade Hub").click();
    await page.waitForSelector("text=Devy Mini-Game Arcade", { timeout: 10000 });
    await assertZeroMobileOverflow(page, "Arcade Hub");

    await page.getByLabel("Launch Cozy Mini-Builds").click();
    await page.waitForSelector("text=Password Strength Meter", { timeout: 10000 });
    await assertZeroMobileOverflow(page, "Cozy Mini-Builds");

    await page.getByLabel("Switch to Output Detective").click();
    await page.waitForSelector("text=CASE 1 OF 6", { timeout: 10000 });
    await assertZeroMobileOverflow(page, "Output Detective");

    await page.getByLabel("Switch to Python Playground").click();
    await page.waitForSelector("text=PLAYGROUND.PY · FREE PYTHON 3.11 SCRATCHPAD", { timeout: 10000 });
    await assertZeroMobileOverflow(page, "Python Playground");

    // Mobile bottom thumb nav -> Code Studio fits cleanly at 390px
    await page.getByLabel("Code Studio", { exact: true }).click();
    await page.waitForSelector("text=CODE EDITOR", { timeout: 10000 });
    await assertZeroMobileOverflow(page, "Code Studio (Lesson Pane)");
    await page.getByText("CODE EDITOR").first().click();
    await page.waitForSelector("text=SUBMIT CODE", { timeout: 5000 });
    await assertZeroMobileOverflow(page, "Code Studio (Editor Pane)");

    assert.deepEqual(pageErrors, [], `Unexpected mobile page errors: ${pageErrors.join("; ")}`);
  } finally {
    await session.close();
  }
});
