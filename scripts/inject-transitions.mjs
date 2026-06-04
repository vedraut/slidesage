#!/usr/bin/env node
// OPTIONAL, off by default. Adds a subtle slide-level transition by injecting a
// <p:transition> element into each slide's XML inside the .pptx zip. This is the
// only "motion" SlideSage offers; the deck is static unless you run this.
//
//   node scripts/inject-transitions.mjs --in deck.pptx [--mode section-fade|all-fade] [--out deck.pptx]
//
// section-fade : fade only on section-divider slides (recommended).
// all-fade     : gentle fade on every slide.
import { readFileSync, writeFileSync } from "node:fs";
import JSZip from "jszip";

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const t = process.argv[i];
  if (t.startsWith("--")) args[t.slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : true;
}
const input = args.in;
if (!input) { console.error("Usage: node scripts/inject-transitions.mjs --in deck.pptx [--mode section-fade|all-fade] [--out file]"); process.exit(1); }
const mode = args.mode || "section-fade";
const out = args.out || input;

const TRANSITION = '<p:transition spd="med"><p:fade/></p:transition>';

// A slide is treated as a "section divider" if it has a centered single big line
// and no body placeholders — but the renderer marks dividers structurally, so we
// approximate by detecting slides whose XML lacks bullet bodies. To be precise,
// section-fade applies the fade to slides that contain our section marker comment.
function shouldFade(xml) {
  if (mode === "all-fade") return true;
  // generate.mjs leaves a marker on section slides via the master/no-footer path;
  // here we fall back to: fade slides that have a single large title and no list.
  return /<a:buChar/.test(xml) === false && /sz="(?:3[0-9]|4[0-9]|5[0-9])00"/.test(xml);
}

function inject(xml) {
  if (xml.includes("<p:transition")) return xml; // already present
  // <p:transition> must follow <p:cSld> ... </p:cSld> inside <p:sld>; insert before <p:clrMapOvr> or </p:sld>.
  if (xml.includes("<p:clrMapOvr")) return xml.replace("<p:clrMapOvr", `${TRANSITION}<p:clrMapOvr`);
  return xml.replace("</p:sld>", `${TRANSITION}</p:sld>`);
}

const zip = await JSZip.loadAsync(readFileSync(input));
const slideFiles = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
let touched = 0;
for (const f of slideFiles) {
  const xml = await zip.file(f).async("string");
  if (mode === "all-fade" || shouldFade(xml)) {
    const next = inject(xml);
    if (next !== xml) { zip.file(f, next); touched++; }
  }
}
const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
writeFileSync(out, buf);
console.log(`✓ Added "${mode}" transition to ${touched}/${slideFiles.length} slides → ${out}`);
