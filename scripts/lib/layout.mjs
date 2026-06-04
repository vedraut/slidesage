// Geometry helpers. The deck is rendered on a 13.333 x 7.5 inch (16:9) canvas.
export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;

/** The usable content rectangle inside the style's margins. */
export function contentBox(T) {
  const x = T.layout.marginX;
  const y = T.layout.marginY;
  return { x, y, w: SLIDE_W - 2 * x, h: SLIDE_H - 2 * y };
}

// Space reserved on the right edge so titles don't run under a corner logo.
let rightGutter = 0;
export function setRightGutter(inches) { rightGutter = inches || 0; }

/** Standard title block geometry (used by most content archetypes). */
export function titleBox(T) {
  const x = T.layout.marginX;
  const right = Math.max(rightGutter, x);
  return { x, y: T.layout.titleY, w: SLIDE_W - x - right, h: 1.1 };
}

/** Y coordinate where body content should start, clearing a two-line title + optional rule. */
export function bodyTop(T) {
  return T.layout.titleY + (T.layout.rule ? 1.55 : 1.3);
}

/** Convert a list of strings into PptxGenJS bullet runs honouring the style's bullet glyph. */
export function bulletRuns(points, T, color) {
  const useGlyph = T.layout.bullet && T.layout.bullet !== "none";
  return points.map((p, i) => ({
    text: p,
    options: {
      color,
      fontFace: T.type.body,
      fontSize: T.type.scale.body,
      bullet: useGlyph ? { characterCode: glyphCode(T.layout.bullet) } : false,
      paraSpaceAfter: (T.type.scale.body || 16) * 0.6,
      breakLine: true,
      indentLevel: 0,
      ...(i === 0 ? {} : {}),
    },
  }));
}

// PptxGenJS wants a hex character code for custom bullets; map a few common glyphs.
function glyphCode(glyph) {
  const map = { "•": "2022", "–": "2013", "—": "2014", "・": "30FB", "▪": "25AA" };
  return map[glyph] || "2022";
}
