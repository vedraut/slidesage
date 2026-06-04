# Style Systems

Six curated visual systems, ported from the design language in
[Awesome-PPT-Design-Skills](https://github.com/software-ai-life/Awesome-PPT-Design-Skills). Pick **one** per
deck and keep it consistent. Each has a machine-readable token file in `assets/style-tokens/<id>.json` that the
renderer consumes; the `.md` next to this file explains when to use it.

## The golden rule
**Understand the content before choosing the style.** Build the storyboard first, then dress it.

## Choosing

| Style id | Vibe | Reach for it when… |
|---|---|---|
| `futuristic-tech` | Dark, sharp, data-forward | Product launches, strategy, fintech, anything metrics-heavy. **Business default.** |
| `minimalist-luxury` | Light, premium, airy | Brand/exec proposals, high-end pitches, board decks. |
| `modern-illustration` | Bright, bold, friendly-pro | Marketing, thought leadership, conference talks. |
| `soft-clay-3d` | Warm, rounded, approachable | Education, onboarding, internal enablement. **Education default.** |
| `japanese-editorial` | Calm, paper tones, editorial | Reflective/narrative decks, design-literate audiences. |
| `hand-drawn-editorial` | Organic, sketched, human | Workshops, ideation, informal teaching. |

## How a style maps to slides
Tokens define `palette` (bg/ink/accent + chart colors), `type` (fonts + a point-size scale), `layout`
(margins, bullet glyph, whether titles get an accent rule), and `decor` (cover shape, section band). The
renderer applies these uniformly across all archetypes, so a deck always looks like one system.

## Fonts
Tokens reference widely-available system fonts so decks render correctly without bundling files. To use a brand
font, set `type.heading`/`type.body` to its exact name and ensure it's installed where the deck is opened.

## Adding your own style
Copy any token file, edit values, validate against `schemas/style-tokens.schema.json`, drop it in
`assets/style-tokens/`, and add its id to the enum in that schema and `schemas/storyboard.schema.json`.
