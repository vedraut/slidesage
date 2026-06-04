// Styled chart helper. Maps a storyboard `visual` block to a PptxGenJS chart.
import { hex } from "./style-loader.mjs";

const TYPE_MAP = {
  bar: "bar",
  line: "line",
  area: "area",
  pie: "pie",
  doughnut: "doughnut",
};

export function addChart(pptx, slide, visual, T, box) {
  const chartType = TYPE_MAP[visual.chartType] || "bar";
  const series = (visual.data || []).map((s) => ({
    name: s.name || "Series",
    labels: s.labels || [],
    values: s.values || [],
  }));
  if (series.length === 0) return;

  const colors = (T.palette.chart || [T.palette.accent]).map(hex);

  slide.addChart(pptx.ChartType[chartType] || pptx.ChartType.bar, series, {
    x: box.x, y: box.y, w: box.w, h: box.h,
    chartColors: colors,
    showLegend: series.length > 1,
    legendPos: "b",
    legendColor: hex(T.palette.inkSoft),
    legendFontFace: T.type.body,
    legendFontSize: T.type.scale.caption,
    showTitle: false,
    showValue: chartType === "pie" || chartType === "doughnut",
    dataLabelColor: hex(T.palette.bg),
    dataLabelFontFace: T.type.body,
    dataLabelFontSize: T.type.scale.caption,
    catAxisLabelColor: hex(T.palette.inkSoft),
    catAxisLabelFontFace: T.type.body,
    catAxisLabelFontSize: T.type.scale.caption,
    valAxisLabelColor: hex(T.palette.inkSoft),
    valAxisLabelFontFace: T.type.body,
    valAxisLabelFontSize: T.type.scale.caption,
    valGridLine: { style: "none" },
    catGridLine: { style: "none" },
    barDir: "col",
    chartColorsOpacity: 100,
    holeSize: chartType === "doughnut" ? 60 : undefined,
  });
}
