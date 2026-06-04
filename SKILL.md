---
name: slidesage
description: >-
  Generate beautiful, static .pptx presentations whose structure is driven by
  storytelling and instructional design — no animation, but a deliberate
  narrative sequence with section "transition" beats. Use when the user wants a
  slide deck, presentation, PowerPoint, .pptx, pitch, keynote, business review,
  report-out, lecture, course, or workshop. Defaults to a persuasive BUSINESS
  narrative; switch to EDUCATION mode for Bloom's-aligned, learning-science
  decks. Produces a storyboard, then renders a designed deck in one of six
  visual styles. Works with any LLM agent that supports the open Skill format.
license: MIT
---

# SlideSage

Turn a topic into a **static but stunning `.pptx`** whose order and content are driven by a
**storytelling + instructional-design engine**. You (the agent) reason out a *storyboard*; a deterministic
Node renderer turns it into a designed deck. No motion — the **sequence of slides and the section-divider
"transition" beats** carry the narrative.

Two modes:

- **`business`** *(default, priority)* — persuasive, executive-ready decks: pitches, keynotes, QBRs,
  strategy, reports. Narrative arc = Pyramid Principle / Situation→Complication→Resolution.
- **`education`** *(toggle)* — teaching decks with Bloom's-aligned objectives, prerequisite sequencing, and
  learning-science beats (retrieval practice, spacing, worked examples).

## When to use this skill

Trigger when the user asks to create a presentation, slide deck, PowerPoint, `.pptx`, pitch, keynote, business
review, report-out, lecture, course, or workshop. If the user explicitly wants **animated or web/HTML** slides,
this skill is the wrong tool (it is static `.pptx` by design) — say so and stop.

## Operating principles (read before generating)

1. **Understand content before style.** Run the storyboard steps first; apply visual style last.
2. **One message per slide**, written as an **action title** — a full-sentence takeaway, never a topic label.
   Reading the titles top-to-bottom must tell the whole story on its own.
3. **Lead with the answer (business) / lead with the objective (education).** In `business` mode use the
   Pyramid Principle: state the recommendation first, then support it. In `education` mode, objectives drive
   what appears and in what order.
4. **Separation of concerns.** Your job is the *storyboard* (`storyboard.json`); the script does the
   rendering. Never hand-write PPTX XML.

## Workflow

### Step 1 — Brief
Fill `templates/brief.template.md` with the user: topic, audience, the single goal (the decision you want, or
the thing learners can do after), `mode` (`business` default / `education`), time budget, hard constraints, and
a style preference. Ask only what you can't reasonably infer.

### Step 2 — Build the storyboard spine
- **business:** Read `references/narrative-frameworks.md`. Identify the **governing thought** (the one-line
  recommendation), then the supporting pillars (MECE), then evidence. Map to
  Situation→Complication→Question→Resolution→Ask.
- **education:** Additionally read `references/instructional-design.md` and `references/learning-science.md`.
  Write **learning objectives** with Bloom's 2001 verbs, list **concepts + prerequisites**, and place
  pedagogy beats (worked examples, retrieval checks, spaced recaps).

### Step 3 — Storyboard + narrative transitions
Read `references/deck-architecture.md`. Produce `storyboard.json` conforming to
`schemas/storyboard.schema.json`. Insert **section-divider slides** ("where we've been → where we're going")
at each act boundary — these are the narrative transitions. Validate:

```bash
node scripts/validate-storyboard.mjs storyboard.json
node scripts/check-dag.mjs storyboard.json   # education mode: no concept taught before its prerequisite
```

### Step 4 — Pick a visual style
Read `references/style-systems/README.md` and choose ONE of:
`japanese-editorial` · `soft-clay-3d` · `futuristic-tech` · `minimalist-luxury` · `modern-illustration` ·
`hand-drawn-editorial`. Tokens live in `assets/style-tokens/<style>.json`.

### Step 5 — Render
```bash
npm install            # first run only
node scripts/generate.mjs --in storyboard.json --style futuristic-tech --out deck.pptx
```

### Step 6 — (Optional) subtle section fade — OFF by default
Only if the user asks for *any* motion:
```bash
node scripts/inject-transitions.mjs --in deck.pptx --mode section-fade
```

### Step 7 — QA gate (always)
```bash
node scripts/qa-report.mjs --storyboard storyboard.json --deck deck.pptx
```
Fix every FAIL before delivering. Checklist source: `references/qa-checklist.md` (one message/slide, action
titles, contrast, MECE pillars, DAG order satisfied in education mode, citations present where claims are made).

## The storyboard contract

The single artifact you author. See `schemas/storyboard.schema.json` and `templates/storyboard.example.json`.
Each slide carries an `archetype`, an `actionTitle`, what it `covers`/`teaches`, a `visual` spec, a
`narrativeRole`, and speaker `notes`. Keep it declarative — describe intent, not PPTX primitives.

## Requirements

- **Node.js ≥ 18** and `npm install` in the skill root (PptxGenJS + a zip lib for the optional fade).
- No network needed at render time; fonts are embedded or substituted per style token.

## Provider portability

This skill is plain text + Node scripts following the open Skill convention. Any LLM agent that can read
`SKILL.md`, write a JSON file, and run a shell command can use it. The storytelling/pedagogy reasoning is
model-agnostic; only the renderer is fixed, so output is consistent across providers.

## Reference index (load on demand)

| File | Use it for |
|---|---|
| `references/narrative-frameworks.md` | Pyramid Principle, S-C-R, action titles, transition beats |
| `references/deck-architecture.md` | slide archetypes + deck skeletons (business & education) |
| `references/instructional-design.md` | Bloom's, backward design, objectives *(education)* |
| `references/learning-science.md` | retrieval, spacing, interleaving, cognitive load *(education)* |
| `references/concept-sequencing.md` | building/validating the prerequisite graph *(education)* |
| `references/slide-patterns.md` | per-archetype layout recipes |
| `references/chart-design.md` | data-visualisation styling |
| `references/style-systems/*` | the six visual systems + how to choose |
| `references/qa-checklist.md` | the pre-delivery gate |
