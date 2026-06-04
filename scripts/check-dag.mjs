#!/usr/bin/env node
// Education mode: verify the concept prerequisite graph is acyclic AND that no
// slide teaches a concept before all its prerequisites have been taught.
//   node scripts/check-dag.mjs storyboard.json
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) { console.error("Usage: node scripts/check-dag.mjs <storyboard.json>"); process.exit(1); }
const sb = JSON.parse(readFileSync(file, "utf8"));

if ((sb.meta?.mode || "business") !== "education") {
  console.log("• Not education mode — DAG check skipped."); process.exit(0);
}
const concepts = sb.concepts || [];
if (!concepts.length) { console.log("• No concepts declared — nothing to check."); process.exit(0); }

const prereq = new Map(concepts.map((c) => [c.id, c.prerequisites || []]));
const assumed = new Set(concepts.filter((c) => c.assumed).map((c) => c.id));

// 1) cycle detection (DFS)
const WHITE = 0, GRAY = 1, BLACK = 2;
const color = new Map([...prereq.keys()].map((k) => [k, WHITE]));
const cycle = [];
function dfs(u, path) {
  color.set(u, GRAY);
  for (const v of prereq.get(u) || []) {
    if (!prereq.has(v)) { console.error(`✗ concept "${u}" lists unknown prerequisite "${v}"`); process.exitCode = 1; continue; }
    if (color.get(v) === GRAY) { cycle.push([...path, u, v].join(" → ")); return true; }
    if (color.get(v) === WHITE && dfs(v, [...path, u])) return true;
  }
  color.set(u, BLACK);
  return false;
}
for (const k of prereq.keys()) if (color.get(k) === WHITE && dfs(k, [])) break;
if (cycle.length) { console.error(`✗ prerequisite cycle: ${cycle[0]}`); process.exit(1); }

// 2) teaching order: prerequisites must appear in an earlier-or-equal slide
const firstTaught = new Map();
sb.slides.forEach((s, i) => (s.teaches || []).forEach((c) => { if (!firstTaught.has(c)) firstTaught.set(c, i); }));
const violations = [];
for (const [c, prereqs] of prereq) {
  if (!firstTaught.has(c)) continue;
  for (const p of prereqs) {
    if (assumed.has(p)) continue; // prior knowledge — no teaching slide required
    if (!firstTaught.has(p)) violations.push(`"${c}" (slide ${firstTaught.get(c) + 1}) needs "${p}" which is never taught (mark it "assumed": true if it is prior knowledge)`);
    else if (firstTaught.get(p) > firstTaught.get(c)) violations.push(`"${p}" taught (slide ${firstTaught.get(p) + 1}) AFTER its dependent "${c}" (slide ${firstTaught.get(c) + 1})`);
  }
}
if (violations.length) { console.error(`✗ ${violations.length} sequencing violation(s):`); violations.forEach((v) => console.error(`   - ${v}`)); process.exit(1); }
console.log(`✓ Concept DAG valid: ${concepts.length} concepts, acyclic, prerequisites respected.`);
