#!/usr/bin/env node
// Lightweight JSON-schema-ish validator for storyboards (zero dependencies).
//   node scripts/validate-storyboard.mjs storyboard.json
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(readFileSync(join(here, "..", "schemas", "storyboard.schema.json"), "utf8"));

const STYLES = SCHEMA.properties.meta.properties.style.enum;
const ARCHE = SCHEMA.properties.slides.items.properties.archetype.enum;
const BLOOM = SCHEMA.properties.objectives.items.properties.bloom.enum;

const file = process.argv[2];
if (!file) { console.error("Usage: node scripts/validate-storyboard.mjs <storyboard.json>"); process.exit(1); }

const errors = [];
const warn = [];
let sb;
try { sb = JSON.parse(readFileSync(file, "utf8")); }
catch (e) { console.error(`✗ Not valid JSON: ${e.message}`); process.exit(1); }

if (!sb.meta) errors.push("missing `meta`");
else {
  if (!sb.meta.title) errors.push("meta.title is required");
  if (!STYLES.includes(sb.meta.style)) errors.push(`meta.style must be one of: ${STYLES.join(", ")}`);
  if (sb.meta.mode && !["business", "education"].includes(sb.meta.mode)) errors.push("meta.mode must be business|education");
  if ((sb.meta.mode || "business") === "business" && !sb.meta.governingThought)
    warn.push("business mode: meta.governingThought (the one-line recommendation) is recommended");
}

if (!Array.isArray(sb.slides) || sb.slides.length === 0) errors.push("`slides` must be a non-empty array");
else sb.slides.forEach((s, i) => {
  const at = `slides[${i}]`;
  if (!ARCHE.includes(s.archetype)) errors.push(`${at}.archetype "${s.archetype}" invalid`);
  if (!s.actionTitle || !s.actionTitle.trim()) errors.push(`${at}.actionTitle is required`);
  else if (!/[.!?]$/.test(s.actionTitle.trim()) && !["cover", "section"].includes(s.archetype))
    warn.push(`${at}.actionTitle should be a full sentence (action title), got: "${s.actionTitle}"`);
  if (s.body && s.body.length > 6) warn.push(`${at} has ${s.body.length} bullets; aim for <=5`);
});

if (sb.meta?.mode === "education") {
  if (!sb.objectives?.length) warn.push("education mode: no `objectives` defined");
  sb.objectives?.forEach((o, i) => { if (!BLOOM.includes(o.bloom)) errors.push(`objectives[${i}].bloom invalid`); });
}

for (const w of warn) console.log(`  ⚠  ${w}`);
if (errors.length) { console.error(`✗ ${errors.length} error(s):`); errors.forEach((e) => console.error(`   - ${e}`)); process.exit(1); }
console.log(`✓ Storyboard valid: ${sb.slides.length} slides, mode=${sb.meta.mode || "business"}, style=${sb.meta.style}` + (warn.length ? ` (${warn.length} warning(s))` : ""));
