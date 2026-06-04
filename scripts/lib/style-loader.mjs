// Loads and normalises a style-token file into the shape the renderer expects.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = join(here, "..", "..", "assets", "style-tokens");

const VALID = new Set([
  "japanese-editorial", "soft-clay-3d", "futuristic-tech",
  "minimalist-luxury", "modern-illustration", "hand-drawn-editorial",
]);

/** Strip a leading '#' so PptxGenJS gets a bare hex string. */
export const hex = (c) => (c || "").replace(/^#/, "");

export function loadStyle(styleId, tokensDir = TOKENS_DIR) {
  if (!VALID.has(styleId)) {
    throw new Error(`Unknown style "${styleId}". Valid: ${[...VALID].join(", ")}`);
  }
  const raw = JSON.parse(readFileSync(join(tokensDir, `${styleId}.json`), "utf8"));
  // Defensive defaults so a partial token file never crashes the renderer.
  raw.palette.chart ??= [raw.palette.accent, raw.palette.accent2 || raw.palette.ink];
  raw.layout ??= {};
  raw.layout.marginX ??= 0.7;
  raw.layout.marginY ??= 0.6;
  raw.layout.titleY ??= raw.layout.marginY;
  raw.layout.bodyGap ??= 0.34;
  raw.layout.bullet ??= "•";
  raw.decor ??= {};
  return raw;
}
