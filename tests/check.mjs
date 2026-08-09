import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { GROUPS, QUESTIONS, assess, buildReport } from "../scoring.mjs";

assert.equal(GROUPS.length, 4);
assert.equal(QUESTIONS.length, 12);
assert.equal(new Set(QUESTIONS.map((question) => question.id)).size, QUESTIONS.length);
assert.equal(QUESTIONS.reduce((sum, question) => sum + question.weight, 0), 100);

const allYes = Object.fromEntries(QUESTIONS.map((question) => [question.id, "yes"]));
const allUnknown = Object.fromEntries(QUESTIONS.map((question) => [question.id, "unknown"]));
const strong = assess(allYes);
assert.equal(strong.score, 100);
assert.equal(strong.blockers.length, 0);
assert.equal(strong.level, "Evidence-grade foundation");

const unknown = assess(allUnknown);
assert.equal(unknown.score, 0);
assert.equal(unknown.unknownCount, 12);
assert.ok(unknown.blockers.length >= 4);
assert.equal(unknown.level, "At-risk evidence path");

const report = buildReport({ monitor_name: "test" }, allYes, strong);
assert.equal(report.schema, "clockproof.assessment.v1");
assert.match(report.generated_at, /^\d{4}-\d{2}-\d{2}T/);

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const app = await readFile(new URL("../app.mjs", import.meta.url), "utf8");
const request = await readFile(new URL("../request/index.html", import.meta.url), "utf8");
for (const required of [
  "A green dashboard cannot reconstruct a missed observation.",
  "$1,500",
  "Five business days",
  "public-data-monitor-readiness-checker",
  "No checkout is exposed while this offer is being tested.",
]) assert.ok(html.includes(required), `missing required page text: ${required}`);
assert.ok(html.includes('href="styles.css"'));
assert.ok(html.includes('src="app.mjs"'));
assert.ok(css.length > 8000, "stylesheet unexpectedly thin");
assert.ok(app.includes("navigator.clipboard"));
assert.ok(!html.match(/<script[^>]+src=["']https?:/), "unexpected third-party script");
assert.ok(!html.includes("?interest="), "generic partner path would drop the offer token");
assert.ok(html.includes('href="request/"'));
assert.ok(request.includes("Offer ID: public-data-monitor-readiness-checker"));
assert.ok(request.includes("Nothing is sent automatically"));
assert.ok(request.includes("mailto:operations@ustechautomations.com"));

console.log("clockproof checks: PASS");
