#!/usr/bin/env node
// Pre-delivery QA gate. Runs the storyboard against the checklist in
// references/qa-checklist.md and prints PASS/FAIL. Non-zero exit on FAIL.
//   node scripts/qa-report.mjs --storyboard storyboard.json [--deck deck.pptx]
import { readFileSync, existsSync } from "node:fs";

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const t = process.argv[i];
  if (t.startsWith("--")) args[t.slice(2)] = process.argv[++i];
}
const file = args.storyboard || process.argv[2];
if (!file) { console.error("Usage: node scripts/qa-report.mjs --storyboard <storyboard.json> [--deck deck.pptx]"); process.exit(1); }
const sb = JSON.parse(readFileSync(file, "utf8"));
const mode = sb.meta?.mode || "business";

const checks = [];
const add = (name, pass, detail = "") => checks.push({ name, pass, detail });

// universal
add("Has a cover slide", sb.slides.some((s) => s.archetype === "cover"));
add("Has a closing (summary or callToAction)", sb.slides.some((s) => ["summary", "callToAction"].includes(s.archetype)));
const labels = sb.slides.filter((s) => !["cover", "section", "quote"].includes(s.archetype))
  .filter((s) => s.actionTitle && !/[.!?]$/.test(s.actionTitle.trim()));
add("Every content slide uses a full-sentence action title", labels.length === 0,
  labels.length ? `${labels.length} topic-label title(s)` : "");
const fat = sb.slides.filter((s) => (s.body || []).length > 6);
add("No slide exceeds ~5 bullets", fat.length === 0, fat.length ? `${fat.length} slide(s) overloaded` : "");
const longBullets = sb.slides.flatMap((s) => s.body || []).filter((b) => b.split(/\s+/).length > 16);
add("Bullets are scannable (<=16 words)", longBullets.length === 0, longBullets.length ? `${longBullets.length} long bullet(s)` : "");
const claimsWithoutCite = sb.slides.filter((s) => s.visual?.type === "chart" && !(s.citations?.length));
add("Data slides carry a source/citation", claimsWithoutCite.length === 0,
  claimsWithoutCite.length ? `${claimsWithoutCite.length} chart slide(s) missing citation` : "");

if (mode === "business") {
  add("A governing thought (one-line recommendation) is set", !!sb.meta?.governingThought);
  add("Deck has section dividers (narrative transitions)", sb.slides.some((s) => s.archetype === "section"));
} else {
  add("Learning objectives are declared", (sb.objectives || []).length > 0);
  // every objective covered by >=1 slide
  const covered = new Set(sb.slides.flatMap((s) => s.covers || []));
  const uncovered = (sb.objectives || []).map((o) => o.id).filter((id) => !covered.has(id));
  add("Every objective is covered by a slide", uncovered.length === 0, uncovered.length ? `uncovered: ${uncovered.join(", ")}` : "");
  add("Deck includes a retrieval/check slide", sb.slides.some((s) => s.archetype === "retrieval"));
}

if (args.deck) add("Rendered deck file exists", existsSync(args.deck), args.deck);

let fails = 0;
console.log(`\nSlideSage QA — ${file}  (mode: ${mode})\n`);
for (const c of checks) {
  const tag = c.pass ? "PASS" : "FAIL";
  if (!c.pass) fails++;
  console.log(`  [${tag}] ${c.name}${c.detail ? `  — ${c.detail}` : ""}`);
}
console.log(`\n${fails === 0 ? "✓ All checks passed." : `✗ ${fails} check(s) failed — fix before delivering.`}\n`);
process.exit(fails === 0 ? 0 : 1);
