#!/usr/bin/env node
/**
 * Audits all curriculum lessons, practice drills, enrichments, quizzes,
 * Bug Hunt incidents, Speed Blitz cards, and Visualizer engines.
 *
 * Usage:
 *   npm run content:audit
 *   npm run content:audit -- --json
 */
import { runFullContentAudit } from "./contentAuditCore.mjs";

const jsonMode = process.argv.includes("--json");
const report = runFullContentAudit();

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const { summary, errors } = report;
  console.log("=== Devy Content Quality Audit ===");
  console.log(`  Lessons & Practice Drills : ${summary.lessonsAndDrills}`);
  console.log(`  Verified Solution Snippets: ${summary.solutions}`);
  console.log(`  Enrichment Quizzes        : ${summary.quizzes}`);
  console.log(`  Bug Hunt Incidents        : ${summary.bugIncidents}`);
  console.log(`  Speed Blitz Cards         : ${summary.blitzCards}`);
  console.log(`  Visualizer Trace Engines  : ${summary.visualizerEngines}`);
  if (errors.length === 0) {
    console.log("✓ All content checks passed with 0 errors.");
  } else {
    console.error(`✕ Found ${errors.length} content issue(s):`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
  }
}

if (!report.ok) {
  process.exit(1);
}
