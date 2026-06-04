#!/usr/bin/env node
// SlideSage renderer: storyboard.json + style tokens -> deck.pptx
//
//   node scripts/generate.mjs --in storyboard.json --style futuristic-tech --out deck.pptx
//
import { readFileSync } from "node:fs";
import PptxGenJS from "pptxgenjs";
import { loadStyle, hex } from "./lib/style-loader.mjs";
import { BUILDERS, bindShapeTypes } from "./lib/archetypes.mjs";
import { SLIDE_W, SLIDE_H } from "./lib/layout.mjs";

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith("--")) { a[t.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true; }
  }
  return a;
}

function footer(pptx, T, title) {
  pptx.defineSlideMaster({
    title: "SAGE",
    background: { color: hex(T.palette.bg) },
    objects: [
      { text: { text: title, options: { x: T.layout.marginX, y: SLIDE_H - 0.4, w: SLIDE_W - 2.5, h: 0.3,
        fontFace: T.type.body, fontSize: T.type.scale.caption, color: hex(T.palette.inkSoft), align: "left" } } },
      { text: { text: "", options: { x: SLIDE_W - 1.2, y: SLIDE_H - 0.4, w: 0.8, h: 0.3,
        fontFace: T.type.body, fontSize: T.type.scale.caption, color: hex(T.palette.inkSoft), align: "right" } } },
    ],
    slideNumber: { x: SLIDE_W - 1.0, y: SLIDE_H - 0.4, w: 0.6, h: 0.3,
      fontFace: T.type.body, fontSize: T.type.scale.caption, color: hex(T.palette.inkSoft), align: "right" },
  });
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.in || !args.out) {
    console.error("Usage: node scripts/generate.mjs --in storyboard.json --style <style> --out deck.pptx");
    process.exit(1);
  }
  const sb = JSON.parse(readFileSync(args.in, "utf8"));
  const styleId = args.style || sb.meta?.style || "futuristic-tech";
  const T = loadStyle(styleId);

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "SAGE16x9", width: SLIDE_W, height: SLIDE_H });
  pptx.layout = "SAGE16x9";
  pptx.author = sb.meta?.author || "SlideSage";
  pptx.title = sb.meta?.title || "Presentation";
  bindShapeTypes(pptx);
  footer(pptx, T, sb.meta?.title || "");

  let n = 0;
  for (const sd of sb.slides) {
    const build = BUILDERS[sd.archetype];
    if (!build) { console.warn(`  ! unknown archetype "${sd.archetype}" — skipped`); continue; }
    // Cover/section/quote/CTA are full-bleed and skip the footer master.
    const fullBleed = ["cover", "section", "quote", "callToAction"].includes(sd.archetype);
    const slide = fullBleed ? pptx.addSlide() : pptx.addSlide({ masterName: "SAGE" });
    build(pptx, slide, sd, T);
    n++;
  }

  await pptx.writeFile({ fileName: args.out });
  console.log(`✓ Rendered ${n} slides → ${args.out}  [style: ${styleId}, mode: ${sb.meta?.mode || "business"}]`);
}

main().catch((e) => { console.error("Render failed:", e.message); process.exit(1); });
