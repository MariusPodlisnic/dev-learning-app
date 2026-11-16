#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const skipBuild =
  args.has("--skip-build") || process.env.SKIP_E2E_BUILD === "1";

const distClient = path.resolve("dist/client");
const distServer = path.resolve("dist/server");
const hasExport = fs.existsSync(distClient) && fs.existsSync(distServer);

if (!skipBuild || !hasExport) {
  const expoHome = path.join(os.tmpdir(), "expo-home");
  fs.mkdirSync(expoHome, { recursive: true });
  const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";
  console.log("Exporting Expo web bundle to dist/ for Playwright E2E...");
  const build = spawnSync(npxBin, ["expo", "export", "-p", "web"], {
    stdio: "inherit",
    env: {
      ...process.env,
      HOME: expoHome,
      EXPO_NO_TELEMETRY: "1",
    },
  });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

console.log("Running Playwright browser layout & flow tests...");
const e2e = spawnSync(
  process.execPath,
  ["--test", "tests/e2e/browserLayout.e2e.mjs"],
  {
    stdio: "inherit",
    env: process.env,
  },
);
process.exit(e2e.status ?? 1);
