# SlideSage

**An open-source, agent-agnostic skill that turns a topic into a beautiful, static `.pptx` — with the
*structure* driven by storytelling and instructional design.**

No animation. Instead, SlideSage makes decks that *flow*: a deliberate narrative sequence, **action titles**
that tell the whole story on their own, and **section-divider "transition" beats** that carry the audience from
one idea to the next — exactly how a great keynote or lecture moves. It works with **any LLM agent** that can
read a `SKILL.md`, write a JSON file, and run a shell command (Claude, OpenAI Codex, and compatible tools).

```bash
npm install
node scripts/generate.mjs --in examples/business-pitch/storyboard.json --style futuristic-tech --out deck.pptx
```

## Why it's different

Most AI slide tools either **template the look** (pretty, empty) or **dump text** (a wall of bullets).
SlideSage separates **thinking** from **rendering**:

1. The LLM reasons out a **storyboard** — a declarative JSON contract (`schemas/storyboard.schema.json`)
   describing objectives, a concept-dependency graph, a narrative arc, and one message per slide.
2. A deterministic **Node/PptxGenJS renderer** turns that storyboard into a designed deck in one of six
   visual systems.

Because the reasoning is model-agnostic and only the renderer is fixed, output is consistent across providers.

## Two modes

| Mode | For | Engine |
|---|---|---|
| **`business`** *(default)* | pitches, keynotes, QBRs, strategy, reports | Pyramid Principle + Situation→Complication→Resolution, MECE pillars, hero stats |
| **`education`** *(toggle)* | lectures, courses, workshops | Bloom's-aligned objectives, prerequisite (DAG) sequencing, retrieval practice, worked examples, spacing |

## How it works (the pipeline)

```
brief → storyboard (story arc + objectives + concept DAG) → validate → pick a style → render .pptx → QA gate
```

1. **Brief** — `templates/brief.template.md`
2. **Storyboard** — author `storyboard.json`; validate with `scripts/validate-storyboard.mjs`
   (and `scripts/check-dag.mjs` in education mode)
3. **Style** — pick one of six systems (`references/style-systems/`)
4. **Render** — `scripts/generate.mjs`
5. **QA gate** — `scripts/qa-report.mjs` (fails the build on topic-label titles, overloaded slides,
   uncited charts, uncovered objectives, missing narrative transitions, …)
6. **Optional motion** *(off by default)* — `scripts/inject-transitions.mjs` adds a subtle section-only fade

See **`SKILL.md`** for the full agent-facing workflow and **`PLAN.md`** for the architecture.

## Visual styles

`futuristic-tech` · `minimalist-luxury` · `modern-illustration` · `soft-clay-3d` · `japanese-editorial` ·
`hand-drawn-editorial`. Each is a machine-readable token set in `assets/style-tokens/` plus a usage guide in
`references/style-systems/`.

## Examples

```bash
npm run example:business     # examples/business-pitch  → Series A pitch (futuristic-tech)
npm run example:education    # examples/education-lesson → recursion lesson (soft-clay-3d)
```

## Requirements

- **Node.js ≥ 18**
- `npm install` (PptxGenJS for rendering, JSZip for the optional fade). No network needed at render time.

## Using SlideSage as a skill

Drop this repo where your agent looks for skills (e.g. a `skills/` directory), or point your agent at
`SKILL.md`. The skill triggers on requests to build a presentation/deck/PowerPoint/pitch/lecture. The agent
fills a storyboard and runs the scripts above. Nothing is provider-specific.

## Project layout

```
SKILL.md            agent entry point (triggers + workflow)
schemas/            storyboard + style-token JSON schemas (the contracts)
scripts/            generate, validate, check-dag, qa-report, inject-transitions
references/         storytelling, instructional design, learning science, style systems
assets/             style tokens (+ optional SVG motifs)
templates/          brief + example storyboard
examples/           two end-to-end decks (business + education)
```

## Credits & inspiration

SlideSage stands on the shoulders of excellent open work. Visual design, content discipline, and pedagogy
ideas were studied and adapted from:

- **[software-ai-life/Awesome-PPT-Design-Skills](https://github.com/software-ai-life/Awesome-PPT-Design-Skills)**
  — the six visual design systems and the pre-delivery QA-checklist discipline.
- **[Gabberflast/academic-pptx-skill](https://github.com/Gabberflast/academic-pptx-skill)**
  — action titles, Situation→Complication→Resolution argument flow, citation standards, PptxGenJS rendering.
- **[GarethManning/claude-education-skills](https://github.com/GarethManning/claude-education-skills)**
  — evidence-based learning science (retrieval practice, spacing, interleaving, backward design).
- **[dmccreary/claude-skills](https://github.com/dmccreary/claude-skills)**
  — Bloom's-taxonomy alignment and concept-dependency (DAG) sequencing.
- **[course-designer (mcpmarket)](https://mcpmarket.com/tools/skills/course-designer-1)**
  — course/lesson scaffolding and backward-design framing.
- **[zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides)**
  — "show-don't-tell" style selection and design-taste inspiration (its HTML/animation engine is intentionally
  out of scope here, since SlideSage targets static `.pptx`).

Gratitude to all these authors. Any errors or opinions in SlideSage are its own.

## License

[MIT](LICENSE) © 2026 Ved Raut. Free for everyone, any LLM, any purpose.

## Contributing

Issues and PRs welcome — new style systems (add a token file + guide), more archetypes, or additional language
bindings for the renderer. Validate any new style against `schemas/style-tokens.schema.json`.
