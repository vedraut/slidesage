# Deck Architecture

How to turn a spine (`narrative-frameworks.md`) into a concrete slide list.

## Archetypes (the `archetype` field)

| Archetype | Use for | Key fields |
|---|---|---|
| `cover` | Title slide | `actionTitle`, `kicker`, `body[0]` as subtitle |
| `agenda` | Roadmap of the talk | `body[]` (numbered automatically) |
| `section` | **Narrative transition / divider** | `actionTitle` (the bridge), `kicker` (act name) |
| `content` | One idea + supporting points | `body[]` (≤5) |
| `two-column` | Two related groups | `columns[]` or `body[]` (auto-split) |
| `comparison` | A vs B, before/after | `columns[]` (2, panelled) |
| `pipeline` | Architecture / sequence flow | `flow[]` (labelled boxes joined by arrows) |
| `data` | Chart, hero stat, or image | `visual` (+ optional `body[]` takeaways) |
| `quote` | Testimonial / principle | `quote.text`, `quote.attribution` |
| `worked-example` | *(education)* step-by-step | `body[]` (numbered steps) |
| `retrieval` | *(education)* check-for-understanding | `body[]` (questions) |
| `summary` | Recap / key takeaways | `body[]` |
| `callToAction` | The ask / next step | `actionTitle`, `body[]` |
| `references` | Sources | `citations[]` |

## Choosing the visual per slide

- A claim with a **number** → `data` with `visual.type: "stat"` (one hero number beats a sentence).
- A **trend or breakdown** → `data` with `visual.type: "chart"` (see `chart-design.md`).
- A **tension/choice** → `comparison`.
- A **conceptual relationship** → `two-column` or a `diagram` image.
- Otherwise → `content`. When in doubt, fewer words + one strong visual.

## Deck skeletons

### Business pitch (~12–16 slides)
```
cover → agenda
section "The setup"        (situation)
content (situation) → data (complication, a chart that shows the pain)
section "Why now"          (transition)
content (the insight) → data (stat: the prize)
section "Our answer"       (transition → resolution)
content (solution) → comparison (us vs status quo) → data (traction)
summary (the governing thought, restated) → callToAction (the ask) → references
```

### Education lesson (~10–14 slides)
```
cover (hook) → content (objectives)
section "Concept 1"
content (teach) → worked-example → retrieval
section "Concept 2"
content (teach) → two-column (compare) → worked-example → retrieval
summary (recap, spaced) → references
```

## Rules the renderer assumes

- `cover`, `section`, `quote`, `callToAction` are full-bleed (no footer/page number).
- All other archetypes get a footer with deck title + slide number.
- Keep `body` strings short — the renderer does not shrink-to-fit; ≤12 words per bullet renders cleanly.
