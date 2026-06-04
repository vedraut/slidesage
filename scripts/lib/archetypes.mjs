// One builder per slide archetype. Each takes (pptx, slide, sd, T) where `sd`
// is a storyboard slide object and `T` is the loaded style-token set.
import { hex } from "./style-loader.mjs";
import { SLIDE_W, SLIDE_H, contentBox, titleBox, bodyTop, bulletRuns } from "./layout.mjs";
import { addChart } from "./charts.mjs";

// ---- shared primitives -----------------------------------------------------

function background(slide, T, alt = false) {
  slide.background = { color: hex(alt ? (T.palette.bgAlt || T.palette.bg) : T.palette.bg) };
}

function kicker(slide, sd, T) {
  if (!sd.kicker) return;
  slide.addText(sd.kicker.toUpperCase(), {
    x: T.layout.marginX, y: T.layout.titleY - 0.38, w: SLIDE_W - 2 * T.layout.marginX, h: 0.3,
    fontFace: T.type.body, fontSize: T.type.scale.kicker, bold: true,
    color: hex(T.palette.accent), charSpacing: 2, align: "left",
  });
}

function title(slide, sd, T, opts = {}) {
  const b = titleBox(T);
  slide.addText(sd.actionTitle, {
    x: b.x, y: b.y, w: b.w, h: b.h,
    fontFace: T.type.heading, fontSize: opts.size || T.type.scale.title, bold: true,
    color: hex(opts.color || T.palette.ink), align: "left", valign: "top", lineSpacingMultiple: 1.02,
  });
  if (T.layout.rule) {
    // Sits below a two-line action title so it never strikes through wrapped text.
    slide.addShape(pptxRect, {
      x: b.x, y: b.y + 1.28, w: 1.4, h: 0.06,
      fill: { color: hex(T.palette.accent) }, line: { type: "none" },
    });
  }
}

// PptxGenJS exposes shape types on the instance; we capture the rect string lazily.
let pptxRect = "rect";
export function bindShapeTypes(pptx) { pptxRect = pptx.ShapeType.rect; }

function notes(slide, sd) { if (sd.notes) slide.addNotes(sd.notes); }

// ---- archetypes ------------------------------------------------------------

export function cover(pptx, slide, sd, T) {
  background(slide, T);
  const shape = T.decor.coverShape || "none";
  if (shape === "diagonal") {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: 0.18, fill: { color: hex(T.palette.accent) }, line: { type: "none" } });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: SLIDE_H - 0.18, w: SLIDE_W, h: 0.18, fill: { color: hex(T.palette.accent2 || T.palette.accent) }, line: { type: "none" } });
  } else if (shape === "block") {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.4, h: SLIDE_H, fill: { color: hex(T.palette.accent) }, line: { type: "none" } });
  } else if (shape === "circle") {
    slide.addShape(pptx.ShapeType.ellipse, { x: SLIDE_W - 3.2, y: -1.4, w: 4.2, h: 4.2, fill: { color: hex(T.palette.bgAlt || T.palette.accent) }, line: { type: "none" } });
  } else if (shape === "frame") {
    slide.addShape(pptx.ShapeType.rect, { x: 0.4, y: 0.4, w: SLIDE_W - 0.8, h: SLIDE_H - 0.8, fill: { type: "none" }, line: { color: hex(T.palette.accent), width: 1 } });
  }
  if (sd.kicker) {
    slide.addText(sd.kicker.toUpperCase(), {
      x: T.layout.marginX, y: 2.4, w: SLIDE_W - 2 * T.layout.marginX, h: 0.4,
      fontFace: T.type.body, fontSize: T.type.scale.kicker + 1, bold: true,
      color: hex(T.palette.accent), charSpacing: 3,
    });
  }
  slide.addText(sd.actionTitle, {
    x: T.layout.marginX, y: 2.85, w: SLIDE_W - 2 * T.layout.marginX, h: 2.2,
    fontFace: T.type.heading, fontSize: T.type.scale.coverTitle, bold: true,
    color: hex(T.palette.ink), valign: "top", lineSpacingMultiple: 1.0,
  });
  if (sd.body && sd.body[0]) {
    slide.addText(sd.body[0], {
      x: T.layout.marginX, y: 5.1, w: SLIDE_W - 2 * T.layout.marginX, h: 1.0,
      fontFace: T.type.body, fontSize: T.type.scale.body + 2, color: hex(T.palette.inkSoft),
    });
  }
  notes(slide, sd);
}

export function section(pptx, slide, sd, T) {
  background(slide, T, true);
  if (T.decor.sectionBand) {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: SLIDE_H / 2 - 0.02, w: SLIDE_W, h: 0.04, fill: { color: hex(T.palette.accent) }, line: { type: "none" } });
  }
  if (sd.kicker) {
    slide.addText(sd.kicker.toUpperCase(), {
      x: T.layout.marginX, y: 2.7, w: SLIDE_W - 2 * T.layout.marginX, h: 0.4,
      fontFace: T.type.body, fontSize: T.type.scale.kicker + 1, bold: true,
      color: hex(T.palette.accent), charSpacing: 3, align: "center",
    });
  }
  slide.addText(sd.actionTitle, {
    x: 1.0, y: 3.1, w: SLIDE_W - 2.0, h: 1.6,
    fontFace: T.type.heading, fontSize: T.type.scale.title + 6, bold: true,
    color: hex(T.palette.ink), align: "center", valign: "top",
  });
  notes(slide, sd);
}

export function content(pptx, slide, sd, T) {
  background(slide, T);
  kicker(slide, sd, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  if (sd.body && sd.body.length) {
    slide.addText(bulletRuns(sd.body, T, hex(T.palette.ink)), {
      x: box.x, y: top, w: box.w, h: SLIDE_H - top - T.layout.marginY, valign: "top",
    });
  }
  notes(slide, sd);
}

export function twoColumn(pptx, slide, sd, T) {
  background(slide, T);
  kicker(slide, sd, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  const gap = 0.6;
  const colW = (box.w - gap) / 2;
  const cols = sd.columns && sd.columns.length ? sd.columns : [
    { heading: "", points: (sd.body || []).slice(0, Math.ceil((sd.body || []).length / 2)) },
    { heading: "", points: (sd.body || []).slice(Math.ceil((sd.body || []).length / 2)) },
  ];
  cols.slice(0, 2).forEach((c, i) => {
    const x = box.x + i * (colW + gap);
    if (c.heading) {
      slide.addText(c.heading, {
        x, y: top, w: colW, h: 0.5, fontFace: T.type.heading,
        fontSize: T.type.scale.body + 3, bold: true, color: hex(T.palette.accent),
      });
    }
    slide.addText(bulletRuns(c.points || [], T, hex(T.palette.ink)), {
      x, y: top + (c.heading ? 0.55 : 0), w: colW, h: SLIDE_H - top - T.layout.marginY - 0.55, valign: "top",
    });
  });
  notes(slide, sd);
}

export function comparison(pptx, slide, sd, T) {
  // Like two-column but with a tinted panel behind each column.
  background(slide, T);
  kicker(slide, sd, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  const gap = 0.5;
  const colW = (box.w - gap) / 2;
  const cols = (sd.columns || []).slice(0, 2);
  cols.forEach((c, i) => {
    const x = box.x + i * (colW + gap);
    const accent = i === 0 ? T.palette.accent : (T.palette.accent2 || T.palette.inkSoft);
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: top, w: colW, h: SLIDE_H - top - T.layout.marginY,
      fill: { color: hex(T.palette.bgAlt || T.palette.bg) }, line: { color: hex(accent), width: 1 }, rectRadius: 0.08,
    });
    slide.addText(c.heading || "", {
      x: x + 0.25, y: top + 0.2, w: colW - 0.5, h: 0.5,
      fontFace: T.type.heading, fontSize: T.type.scale.body + 3, bold: true, color: hex(accent),
    });
    slide.addText(bulletRuns(c.points || [], T, hex(T.palette.ink)), {
      x: x + 0.25, y: top + 0.8, w: colW - 0.5, h: SLIDE_H - top - T.layout.marginY - 1.0, valign: "top",
    });
  });
  notes(slide, sd);
}

export function data(pptx, slide, sd, T) {
  background(slide, T);
  kicker(slide, sd, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  const v = sd.visual || {};
  const hasText = sd.body && sd.body.length;
  const chartW = hasText ? box.w * 0.58 : box.w;
  if (v.type === "stat" && v.stat) {
    slide.addText(v.stat, {
      x: box.x, y: top + 0.3, w: hasText ? chartW : box.w, h: 2.2,
      fontFace: T.type.heading, fontSize: T.type.scale.stat, bold: true,
      color: hex(T.palette.accent), align: "left",
    });
    if (v.caption) {
      slide.addText(v.caption, {
        x: box.x, y: top + 2.6, w: hasText ? chartW : box.w, h: 0.8,
        fontFace: T.type.body, fontSize: T.type.scale.body, color: hex(T.palette.inkSoft),
      });
    }
  } else if (v.type === "chart") {
    addChart(pptx, slide, v, T, { x: box.x, y: top, w: chartW, h: SLIDE_H - top - T.layout.marginY });
  } else if (v.type === "image" && v.imagePath) {
    slide.addImage({ path: v.imagePath, x: box.x, y: top, w: chartW, h: SLIDE_H - top - T.layout.marginY, sizing: { type: "contain", w: chartW, h: SLIDE_H - top - T.layout.marginY } });
  }
  if (hasText) {
    slide.addText(bulletRuns(sd.body, T, hex(T.palette.ink)), {
      x: box.x + chartW + 0.5, y: top, w: box.w - chartW - 0.5, h: SLIDE_H - top - T.layout.marginY, valign: "top",
    });
  }
  notes(slide, sd);
}

export function quote(pptx, slide, sd, T) {
  background(slide, T, true);
  const q = sd.quote || { text: sd.actionTitle };
  slide.addText(`“${q.text}”`, {
    x: 1.2, y: 2.2, w: SLIDE_W - 2.4, h: 2.6,
    fontFace: T.type.heading, fontSize: T.type.scale.title + 2, italic: true,
    color: hex(T.palette.ink), align: "left", valign: "top", lineSpacingMultiple: 1.1,
  });
  if (q.attribution) {
    slide.addText(`— ${q.attribution}`, {
      x: 1.2, y: 5.0, w: SLIDE_W - 2.4, h: 0.6,
      fontFace: T.type.body, fontSize: T.type.scale.body, bold: true, color: hex(T.palette.accent),
    });
  }
  notes(slide, sd);
}

export function agenda(pptx, slide, sd, T) {
  background(slide, T);
  kicker(slide, sd, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  (sd.body || []).forEach((item, i) => {
    const y = top + i * 0.78;
    slide.addText(String(i + 1).padStart(2, "0"), {
      x: box.x, y, w: 0.9, h: 0.6, fontFace: T.type.heading, fontSize: T.type.scale.body + 6,
      bold: true, color: hex(T.palette.accent),
    });
    slide.addText(item, {
      x: box.x + 1.0, y: y + 0.05, w: box.w - 1.0, h: 0.6,
      fontFace: T.type.body, fontSize: T.type.scale.body + 2, color: hex(T.palette.ink), valign: "middle",
    });
  });
  notes(slide, sd);
}

export function workedExample(pptx, slide, sd, T) {
  // Education: a worked example with a clear "step" treatment.
  background(slide, T);
  kicker(slide, { ...sd, kicker: sd.kicker || "Worked example" }, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  (sd.body || []).forEach((step, i) => {
    const y = top + i * 0.7;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: box.x, y, w: 0.42, h: 0.42, fill: { color: hex(T.palette.accent) }, line: { type: "none" },
    });
    slide.addText(String(i + 1), {
      x: box.x, y, w: 0.42, h: 0.42, align: "center", valign: "middle",
      fontFace: T.type.body, fontSize: T.type.scale.caption + 1, bold: true, color: hex(T.palette.bg),
    });
    slide.addText(step, {
      x: box.x + 0.6, y: y - 0.02, w: box.w - 0.6, h: 0.6,
      fontFace: T.type.body, fontSize: T.type.scale.body, color: hex(T.palette.ink), valign: "middle",
    });
  });
  notes(slide, sd);
}

export function retrieval(pptx, slide, sd, T) {
  // Education: a retrieval-practice / check-for-understanding slide.
  background(slide, T, true);
  kicker(slide, { ...sd, kicker: sd.kicker || "Check yourself" }, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  slide.addText(bulletRuns(sd.body || [], T, hex(T.palette.ink)), {
    x: box.x, y: top, w: box.w, h: SLIDE_H - top - T.layout.marginY, valign: "top",
  });
  notes(slide, sd);
}

export function summary(pptx, slide, sd, T) {
  background(slide, T);
  kicker(slide, { ...sd, kicker: sd.kicker || "In summary" }, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  slide.addText(bulletRuns(sd.body || [], T, hex(T.palette.ink)), {
    x: box.x, y: top, w: box.w, h: SLIDE_H - top - T.layout.marginY, valign: "top",
  });
  notes(slide, sd);
}

export function callToAction(pptx, slide, sd, T) {
  background(slide, T, true);
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.4, h: SLIDE_H, fill: { color: hex(T.palette.accent) }, line: { type: "none" } });
  slide.addText(sd.actionTitle, {
    x: 1.0, y: 2.6, w: SLIDE_W - 2.0, h: 1.8,
    fontFace: T.type.heading, fontSize: T.type.scale.title + 8, bold: true,
    color: hex(T.palette.ink), valign: "top",
  });
  if (sd.body && sd.body.length) {
    slide.addText(bulletRuns(sd.body, T, hex(T.palette.inkSoft)), {
      x: 1.0, y: 4.6, w: SLIDE_W - 2.0, h: 1.6, valign: "top",
    });
  }
  notes(slide, sd);
}

export function references(pptx, slide, sd, T) {
  background(slide, T);
  kicker(slide, { ...sd, kicker: sd.kicker || "References" }, T);
  title(slide, sd, T);
  const top = bodyTop(T);
  const box = contentBox(T);
  const refs = sd.citations && sd.citations.length ? sd.citations : (sd.body || []);
  slide.addText(refs.map((r) => ({
    text: r,
    options: { fontFace: T.type.body, fontSize: T.type.scale.caption + 1, color: hex(T.palette.inkSoft), breakLine: true, paraSpaceAfter: 8 },
  })), { x: box.x, y: top, w: box.w, h: SLIDE_H - top - T.layout.marginY, valign: "top" });
  notes(slide, sd);
}

export const BUILDERS = {
  cover, agenda, section, content,
  "two-column": twoColumn, comparison, data, quote,
  "worked-example": workedExample, retrieval, summary,
  callToAction, references,
};
