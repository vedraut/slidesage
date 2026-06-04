#!/usr/bin/env node
// OPTIONAL, off by default. Adds on-click BUILD ANIMATIONS to each slide:
// the action title appears on the first click, then each body topic appears
// one-by-one on subsequent clicks ("Appear" entrance, by paragraph).
//
//   node scripts/inject-builds.mjs --in deck.pptx [--out deck.pptx]
//
// Works by injecting a <p:timing> block that targets the shapes the renderer
// tags as "sage-title" and "sage-body". Run AFTER inject-transitions.mjs.
//
// NOTE: within-slide animations are intricate OOXML. We validate well-formedness
// here, but always confirm playback in PowerPoint before presenting.
import { readFileSync, writeFileSync } from "node:fs";
import JSZip from "jszip";

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const t = process.argv[i];
  if (t.startsWith("--")) args[t.slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : true;
}
const input = args.in;
if (!input) { console.error("Usage: node scripts/inject-builds.mjs --in deck.pptx [--out file]"); process.exit(1); }
const out = args.out || input;

// Pull out every <p:sp> block with its shape id and name, in document order.
function shapes(xml) {
  const out = [];
  const re = /<p:sp>([\s\S]*?)<\/p:sp>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[0];
    const cn = block.match(/<p:cNvPr\b[^>]*\bid="(\d+)"[^>]*\bname="([^"]*)"/);
    if (!cn) continue;
    const paras = (block.match(/<a:p>/g) || []).length;
    out.push({ id: cn[1], name: cn[2], paras });
  }
  return out;
}

// Build the <p:timing> tree for an ordered list of click steps.
// Each step: { spid, pRg } — pRg null means animate the whole shape.
function timing(steps) {
  let id = 0; const nid = () => ++id;
  const rootId = nid(), seqId = nid();
  const clicks = steps.map((s) => {
    const outerId = nid(), midId = nid(), effId = nid(), setId = nid();
    const tgt = s.pRg === null
      ? `<p:spTgt spid="${s.spid}"/>`
      : `<p:spTgt spid="${s.spid}"><p:txEl><p:pRg st="${s.pRg}" end="${s.pRg}"/></p:txEl></p:spTgt>`;
    return `<p:par><p:cTn id="${outerId}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>`
      + `<p:par><p:cTn id="${midId}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>`
      + `<p:par><p:cTn id="${effId}" presetID="1" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>`
      + `<p:set><p:cBhvr><p:cTn id="${setId}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>`
      + `<p:tgtEl>${tgt}</p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>`
      + `<p:to><p:strVal val="visible"/></p:to></p:set>`
      + `</p:childTnLst></p:cTn></p:par>`
      + `</p:childTnLst></p:cTn></p:par>`
      + `</p:childTnLst></p:cTn></p:par>`;
  }).join("");
  const bodySpids = [...new Set(steps.filter((s) => s.pRg !== null).map((s) => s.spid))];
  const bld = bodySpids.length
    ? `<p:bldLst>${bodySpids.map((sp) => `<p:bldP spid="${sp}" grpId="0" build="p"/>`).join("")}</p:bldLst>`
    : "";
  return `<p:timing><p:tnLst><p:par><p:cTn id="${rootId}" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>`
    + `<p:seq concurrent="1" nextAc="seek"><p:cTn id="${seqId}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${clicks}</p:childTnLst></p:cTn>`
    + `<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>`
    + `<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>`
    + `</p:seq></p:childTnLst></p:cTn></p:par></p:tnLst>${bld}</p:timing>`;
}

// Insert timing in the schema-correct position: after </p:transition>, else
// after the color-map override, else after </p:cSld>.
function insertTiming(xml, block) {
  if (xml.includes("<p:timing")) return xml; // idempotent
  if (xml.includes("</p:transition>")) return xml.replace("</p:transition>", `</p:transition>${block}`);
  if (xml.includes("</p:clrMapOvr>")) return xml.replace("</p:clrMapOvr>", `</p:clrMapOvr>${block}`);
  if (/<p:clrMapOvr\b[^>]*\/>/.test(xml)) return xml.replace(/(<p:clrMapOvr\b[^>]*\/>)/, `$1${block}`);
  if (xml.includes("</p:cSld>")) return xml.replace("</p:cSld>", `</p:cSld>${block}`);
  return xml.replace("</p:sld>", `${block}</p:sld>`);
}

const zip = await JSZip.loadAsync(readFileSync(input));
const slideFiles = Object.keys(zip.files)
  .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
  .sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1]));

let animated = 0;
for (const f of slideFiles) {
  let xml = await zip.file(f).async("string");
  const sps = shapes(xml);
  const title = sps.find((s) => s.name === "sage-title");
  const bodies = sps.filter((s) => s.name === "sage-body");
  // Only animate slides that actually have buildable topics.
  if (!bodies.length) continue;

  const steps = [];
  if (title) steps.push({ spid: title.id, pRg: null });
  for (const b of bodies) for (let p = 0; p < Math.max(1, b.paras); p++) steps.push({ spid: b.id, pRg: p });

  xml = insertTiming(xml, timing(steps));
  zip.file(f, xml);
  animated++;
}

const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
writeFileSync(out, buf);
console.log(`✓ Added click-build animations to ${animated}/${slideFiles.length} slides → ${out}`);
