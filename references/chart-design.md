# Chart Design

A chart earns its place only if it makes one point faster than words. The renderer styles charts from the
active style tokens (`palette.chart`, fonts, sizes) — your job is to choose the right chart and keep it clean.

## Choosing the chart type (`visual.chartType`)

| Intent | Type | Notes |
|---|---|---|
| Compare values across categories | `bar` | Default. Sort by value unless order is meaningful (e.g. time). |
| Trend over time | `line` | Few series; label endpoints in the title. |
| Cumulative/volume over time | `area` | Use sparingly; avoid stacking >3. |
| Part-to-whole, ≤5 parts | `pie` / `doughnut` | Only when shares sum to 100% and differences are large. |

If you'd reach for a table with many rows, that's a slide of its own or an appendix — not a chart.

## Rules

1. **Title states the takeaway**, the chart proves it. The chart has no internal title (the slide title is it).
2. **One message per chart.** If you're pointing at two things, make two charts.
3. **No chartjunk** — the renderer already drops gridlines and 3D. Don't add more series than you'll mention.
4. **Cite the source.** Every chart slide must have `citations[]`; the QA gate fails otherwise.
5. **Pre-compute values.** Provide final numbers in `values[]`; the renderer does no math.
6. **Color = meaning.** The first `palette.chart` color is the accent — put the series you want noticed first.

## Hero stats beat small charts

For a single number, prefer `visual.type: "stat"` over a one-bar chart — a big number is more memorable and
reads instantly. Use a chart only when the *shape* of the data (trend, gap, distribution) is the point.

## Data shape

```jsonc
"visual": {
  "type": "chart", "chartType": "line",
  "data": [
    { "name": "North", "labels": ["Q1","Q2","Q3","Q4"], "values": [12,15,19,26] },
    { "name": "South", "labels": ["Q1","Q2","Q3","Q4"], "values": [8,10,11,14] }
  ]
}
```
All series should share the same `labels`. Keep series ≤4 for legibility.
