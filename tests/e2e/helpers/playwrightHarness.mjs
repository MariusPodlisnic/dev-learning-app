import { Buffer } from "node:buffer";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { createRequestHandler } = require("expo-server/adapter/bun");
const { chromium } = require("playwright");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
};

/**
 * Resolves an installed Chromium / Chrome Headless Shell binary, preferring
 * Playwright's default path and falling back to cached ms-playwright installs.
 */
export function resolveChromiumExecutablePath() {
  if (
    process.env.CHROMIUM_EXECUTABLE_PATH &&
    fs.existsSync(process.env.CHROMIUM_EXECUTABLE_PATH)
  ) {
    return process.env.CHROMIUM_EXECUTABLE_PATH;
  }

  const defaultPath = chromium.executablePath();
  if (defaultPath && fs.existsSync(defaultPath)) {
    return defaultPath;
  }

  const cacheDir = path.join(os.homedir(), "Library", "Caches", "ms-playwright");
  if (fs.existsSync(cacheDir)) {
    const entries = fs
      .readdirSync(cacheDir)
      .filter((name) => name.startsWith("chromium"))
      .sort()
      .reverse();

    for (const dir of entries) {
      const candidates = [
        path.join(
          cacheDir,
          dir,
          "chrome-headless-shell-mac-arm64",
          "chrome-headless-shell",
        ),
        path.join(
          cacheDir,
          dir,
          "chrome-headless-shell-mac-x64",
          "chrome-headless-shell",
        ),
        path.join(
          cacheDir,
          dir,
          "chrome-mac-arm64",
          "Google Chrome for Testing.app",
          "Contents",
          "MacOS",
          "Google Chrome for Testing",
        ),
        path.join(
          cacheDir,
          dir,
          "chrome-linux",
          "chrome",
        ),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  return undefined;
}

export function loadE2eEnv() {
  const envFile = path.resolve(".env");
  if (fs.existsSync(envFile) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(envFile);
  }
  process.env.EXPO_PUBLIC_SUPABASE_URL ||= "https://offline-e2e.supabase.co";
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||= "offline-anon-key";
}

/**
 * Launches headless Chromium routed directly to the exported `dist/` Expo Router
 * server/client bundle in-memory (no open TCP ports or external network needed).
 */
export async function openAppInBrowser({
  viewport = { width: 1280, height: 800 },
  pathName = "/",
} = {}) {
  loadE2eEnv();

  const distDir = path.resolve("dist");
  const clientDir = path.join(distDir, "client");
  const serverDir = path.join(distDir, "server");

  if (!fs.existsSync(clientDir) || !fs.existsSync(serverDir)) {
    throw new Error(
      "Missing dist/ web export. Run `npm run test:e2e` or `npx expo export -p web` first.",
    );
  }

  const handleExpoRequest = createRequestHandler({ build: serverDir });
  const executablePath = resolveChromiumExecutablePath();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  const context = await browser.newContext({ viewport });
  await context.route("**/*", async (route) => {
    const reqUrl = new URL(route.request().url());
    if (reqUrl.hostname !== "devlearn.local") {
      return route.abort();
    }

    const urlPath = reqUrl.pathname;
    const filePath = path.join(clientDir, urlPath === "/" ? "" : urlPath);
    if (
      urlPath !== "/" &&
      filePath.startsWith(clientDir) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
    ) {
      return route.fulfill({
        status: 200,
        contentType:
          MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
        body: fs.readFileSync(filePath),
      });
    }

    const webRes = await handleExpoRequest(
      new Request(route.request().url(), {
        method: route.request().method(),
      }),
    );
    const body = Buffer.from(await webRes.arrayBuffer());
    return route.fulfill({
      status: webRes.status,
      contentType: webRes.headers.get("content-type") || "text/html",
      body,
    });
  });

  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (err) => {
    pageErrors.push(err?.message || String(err));
  });

  await page.goto(`https://devlearn.local${pathName}`, {
    waitUntil: "domcontentloaded",
  });

  return {
    browser,
    context,
    page,
    pageErrors,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}
