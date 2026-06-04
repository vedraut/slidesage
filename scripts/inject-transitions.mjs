#!/usr/bin/env node
// Adds slide-level transitions by injecting a <p:transition> element into each
// slide's XML inside the .pptx zip. This is the only "motion" SlideSage offers;
// decks are static unless you run this.
//
//   node scripts/inject-transitions.mjs --in deck.pptx [--storyboard storyboard.json] [--mode fade|all-fade|section-push] [--out deck.pptx]
//
// With --storyboard (recommended): section-divider slides get a directional
// push (a chapter turn), every other slide gets a gentle fade.
// Without it: --mode fade (default) applies a fade to every slide.
import { readFileSync, writeFileSync } from "node:fs";
import JSZip from "jszip";

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const t = process.argv[i];
  if (t.startsWith("--")) args[t.slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : true;
}
const input = args.in;
if (!input) { console.error("Usage: node scripts/inject-transitions.mjs --in deck.pptx [--storyboard file] [--mode fade|all-fade|section-push] [--out file]"); process.exit(1); }
const out = args.out || input;
const mode = args.mode || "fade";

const FADE = '<p:transition spd="med"><p:fade/></p:transition>';
const PUSH = '<p:transition spd="med"><p:push dir="l"/></p:transition>';

// Map a slide (by its 0-based order) to a transition. Section dividers turn like
// a page (push); everything else fades.
let archetypes = null;
if (args.storyboard) {
  try { archetypes = JSON.parse(readFileSync(args.storyboard, "utf8")).slides.map((s) => s.archetype); }
  catch (e) { console.warn(`  ! couldn't read storyboard (${e.message}); falling back to mode=${mode}`); }
}
function transitionFor(i) {
  if (archetypes) return archetypes[i] === "section" ? PUSH : FADE;
  return mode === "section-push" ? PUSH : FADE;
}

// CT_Slide order is cSld → clrMapOvr → transition → timing, so insert *after*
// clrMapOvr (or after cSld if there's no color map override).
function inject(xml, T) {
  if (xml.includes("<p:transition")) return xml; // idempotent
  if (xml.includes("</p:clrMapOvr>")) return xml.replace("</p:clrMapOvr>", `</p:clrMapOvr>${T}`);
  if (/<p:clrMapOvr\b[^>]*\/>/.test(xml)) return xml.replace(/(<p:clrMapOvr\b[^>]*\/>)/, `$1${T}`);
  if (xml.includes("</p:cSld>")) return xml.replace("</p:cSld>", `</p:cSld>${T}`);
  return xml.replace("</p:sld>", `${T}</p:sld>`);
}

const zip = await JSZip.loadAsync(readFileSync(input));
const slideFiles = Object.keys(zip.files)
  .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
  .sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1]));

let touched = 0, pushes = 0;
for (let i = 0; i < slideFiles.length; i++) {
  const f = slideFiles[i];
  const xml = await zip.file(f).async("string");
  const T = transitionFor(i);
  const next = inject(xml, T);
  if (next !== xml) { zip.file(f, next); touched++; if (T === PUSH) pushes++; }
}
const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
writeFileSync(out, buf);
console.log(`✓ Added transitions to ${touched}/${slideFiles.length} slides (${pushes} push, ${touched - pushes} fade) → ${out}`);
