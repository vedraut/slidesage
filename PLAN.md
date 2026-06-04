# SlideSage — Skill Plan

> **Working name:** `SlideSage` (repo `slidesage`).
> Tagline: *Instructional-design-driven, beautifully-designed, agent-agnostic PPTX generation.*
> Status: **DRAFT for Ved's approval — nothing published yet.**

---

## 1. Goal

An **open-source, provider-agnostic skill** that generates **static but stunning `.pptx` decks** whose
*structure* is driven by an **instructional-design + storytelling engine**. No motion/animation; instead,
slide **sequence and section "transition" beats** carry the narrative, exactly as a good lecture or keynote
flows from one idea to the next.

Works with **any LLM that supports the open Skill convention** (Claude, OpenAI Codex, and compatible agents),
because all the pedagogy/narrative reasoning is expressed as a **storyboard JSON contract** that any model can
fill, and a deterministic Node renderer turns that storyboard into the deck.

## 2. Why this is feasible without animation

"Transitions" has two meanings. We are dropping **motion transitions** (fade/wipe between slides) and keeping
**narrative transitions** — the logical handoffs between ideas, realised as designed *section-divider slides*
and as **action titles** that, read in order, tell the whole story. This is pure content/structure discipline
and fights nothing in the `.pptx` format. (A subtle slide-level fade is available as an *off-by-default* toggle
via OOXML injection — see §8.)

## 3. How each reference maps in

| Reference | Layer it feeds | What we take |
|---|---|---|
| **software-ai-life/Awesome-PPT-Design-Skills** | Visual design | The 6 style systems (palette, type, layout, chart rules) + the QA-checklist pattern, ported to PPTX style tokens. |
| **Gabberflast/academic-pptx-skill** | Storytelling + render | Action titles, Situation→Complication→Resolution arc, citation discipline; PptxGenJS rendering approach. |
| **GarethManning/claude-education-skills** | Pedagogy | Evidence-based learning science — retrieval practice, spacing, interleaving, backward design, metacognition. |
| **dmccreary/claude-skills** | Pedagogy + sequencing | Bloom's-taxonomy alignment + concept-dependency DAG ordering (no concept before its prerequisite). |
| **mcpmarket course-designer** | Pedagogy | Course/lesson scaffolding (backward design / ADDIE-lite lesson arc). |
| **zarazhangrui/frontend-slides** | (mostly out of scope) | Only the *design taste* / "show-don't-tell style selection" idea; its animation/HTML engine is intentionally **not** used. |

## 4. Design philosophy

1. **Understand content before style** (borrowed verbatim from the Awesome-PPT repo): the ID engine runs first;
   style is applied last.
2. **One message per slide**, stated as an **action title** (a full sentence takeaway, not a topic label).
3. **The deck is a lesson, not a document** — Bloom's-aligned objectives drive what appears and in what order.
4. **Separation of concerns:** *reasoning* (any LLM produces the storyboard) vs *rendering* (deterministic
   Node script). This is what makes it portable across providers.

## 5. Architecture — the 7-stage pipeline

```
  (1) INTAKE & BRIEF        templates/brief.template.md
        │   topic, audience, prior knowledge, goal, time budget, constraints, style pref
        ▼
  (2) INSTRUCTIONAL DESIGN ENGINE        references/instructional-design.md + learning-science.md
        │   • write learning objectives with Bloom's 2001 verbs
        │   • build + validate concept-dependency DAG        scripts/check-dag.mjs
        │   • choose narrative arc (S-C-R or Hook→Concept→Example→Retrieve→Summary)
        │   • place pedagogy beats: worked examples, retrieval checks, spaced recaps
        ▼
  (3) NARRATIVE SEQUENCING & TRANSITIONS        references/narrative-frameworks.md
        │   • order slides so title-only reading tells the story
        │   • insert section-divider / "where we've been → where we're going" beats
        │  ── emits ──▶  storyboard.json   (validated against schemas/storyboard.schema.json)
        ▼
  (4) VISUAL DESIGN SYSTEM        references/style-systems/* + assets/style-tokens/*.json
        │   pick 1 of 6 styles → load design tokens (palette, type scale, grid, chart styling)
        ▼
  (5) RENDER        scripts/generate.mjs  (PptxGenJS)
        │   storyboard.json + style tokens + slide-patterns → deck.pptx
        ▼
  (6) [OPTIONAL, OFF BY DEFAULT] SECTION FADE        scripts/inject-transitions.mjs
        │   inject <p:transition> XML at section boundaries only
        ▼
  (7) QA GATE        scripts/qa-report.mjs + references/qa-checklist.md
            one-message-per-slide · action titles · contrast · DAG order satisfied
            · objective coverage · citations present  → PASS/FAIL report
```

### The storyboard contract (the heart of the skill)

A single JSON object the LLM produces and the renderer consumes. Rough shape:

```jsonc
{
  "meta": { "title": "...", "audience": "...", "style": "futuristic-tech", "durationMin": 20 },
  "objectives": [
    { "id": "obj1", "bloom": "apply", "statement": "Learners can ..." }
  ],
  "concepts": [
    { "id": "c1", "label": "...", "prerequisites": [] },
    { "id": "c2", "label": "...", "prerequisites": ["c1"] }
  ],
  "slides": [
    {
      "archetype": "cover|section|content|data|quote|worked-example|retrieval|summary|references",
      "actionTitle": "Full-sentence takeaway.",
      "covers": ["obj1"], "teaches": ["c1"],
      "body": [ "point", "point" ],
      "visual": { "type": "chart|image|diagram|none", "spec": { } },
      "pedagogyRole": "instruct|example|retrieve|recap|transition",
      "notes": "speaker notes"
    }
  ]
}
```

`check-dag.mjs` guarantees no slide `teaches` a concept before its prerequisites have appeared; `qa-report.mjs`
guarantees every objective is covered by ≥1 slide and every retrieval check maps back to a taught concept.

## 6. File tree

```
slidesage/
├── SKILL.md                       # entry point: triggers, workflow, routing (DRAFTED)
├── README.md                      # human docs, install, examples, license badge
├── LICENSE                        # MIT
├── CHANGELOG.md
│
├── references/                    # progressive-disclosure knowledge the agent reads
│   ├── instructional-design.md    # Bloom's 2001, backward design, objectives, ADDIE-lite
│   ├── learning-science.md        # retrieval, spacing, interleaving, worked examples, cognitive load
│   ├── concept-sequencing.md      # building/validating the prerequisite DAG
│   ├── narrative-frameworks.md    # S-C-R, pyramid principle, action titles, transition beats
│   ├── deck-architecture.md       # slide archetypes + deck skeletons per use-case
│   ├── slide-patterns.md          # per-archetype PptxGenJS layout recipes
│   ├── chart-design.md            # data-viz styling rules
│   ├── qa-checklist.md            # pre-delivery validation gate
│   └── style-systems/
│       ├── README.md              # how to choose a style
│       ├── japanese-editorial.md
│       ├── soft-clay-3d.md
│       ├── futuristic-tech.md
│       ├── minimalist-luxury.md
│       ├── modern-illustration.md
│       └── hand-drawn-editorial.md
│
├── assets/
│   ├── style-tokens/              # machine-readable design tokens, one per style
│   │   ├── japanese-editorial.json
│   │   ├── soft-clay-3d.json
│   │   ├── futuristic-tech.json
│   │   ├── minimalist-luxury.json
│   │   ├── modern-illustration.json
│   │   └── hand-drawn-editorial.json
│   └── svg/                       # decorative motifs per style (cover/section ornaments)
│
├── scripts/
│   ├── generate.mjs               # MAIN: storyboard.json + style → deck.pptx (PptxGenJS)
│   ├── lib/
│   │   ├── archetypes.mjs         # cover/section/content/data/quote/summary builders
│   │   ├── style-loader.mjs       # load + validate style tokens
│   │   ├── charts.mjs             # styled chart helpers
│   │   └── layout.mjs             # grid / spacing helpers
│   ├── validate-storyboard.mjs    # JSON-schema validate the storyboard
│   ├── check-dag.mjs              # verify concept prerequisite ordering (topological)
│   ├── inject-transitions.mjs     # OPTIONAL <p:transition> injection at section breaks
│   └── qa-report.mjs              # run QA checklist → PASS/FAIL
│
├── schemas/
│   ├── storyboard.schema.json
│   └── style-tokens.schema.json
│
├── templates/
│   ├── brief.template.md          # intake questionnaire
│   └── storyboard.example.json    # worked example storyboard
│
└── examples/
    ├── course-lesson/             # full worked example: educational deck
    │   ├── brief.md
    │   ├── storyboard.json
    │   └── preview.png
    └── conference-talk/           # full worked example: academic/business talk
        ├── brief.md
        ├── storyboard.json
        └── preview.png
```

## 7. Generation engine choice

**Primary: PptxGenJS (Node.js ≥ 18).** Reasons: richer, more reliable design fidelity than `python-pptx`;
it's what one of your references (academic-pptx-skill) already uses; single-runtime (the optional transition
injection is also done in Node via a zip lib, so no Python dependency). Node is available in the standard
Claude/Codex skill sandboxes.

## 8. Optional motion (off by default)

Even though we're static, a subtle **section-only fade** can be injected post-render by editing the slide XML
inside the `.pptx` zip (`<p:transition><p:fade/></p:transition>`). Shipped behind an explicit
`--transitions=section-fade` flag; default is fully static.

## 9. Build roadmap (after you approve this plan)

- **Phase 0** — repo scaffold, LICENSE (MIT), README, SKILL.md (this turn drafts SKILL.md).
- **Phase 1** — schemas + the storyboard contract + `validate-storyboard.mjs` + `check-dag.mjs`.
- **Phase 2** — pedagogy/narrative reference docs (ID engine, learning science, sequencing, narrative).
- **Phase 3** — renderer (`generate.mjs` + lib) for all archetypes, monochrome first.
- **Phase 4** — port the 6 style systems → tokens + `style-systems/*.md` + SVG motifs.
- **Phase 5** — `qa-report.mjs` + checklist; `inject-transitions.mjs`.
- **Phase 6** — two end-to-end worked examples + preview images.
- **Phase 7** — publish to GitHub `vedraut/slidesage` (public), CI to test render on push.

## 10. Decisions I made (flag if you disagree)

1. **Name:** `SlideSage` / repo `slidesage`. Alternatives if you'd rather: `storydeck`, `deckweave`, `pedadeck`.
2. **License:** MIT (most permissive, standard for the awesome-skills ecosystem).
3. **Engine:** PptxGenJS (Node), not python-pptx.
4. **Account:** `vedraut` (PAT at `~/.laracorp/secrets/github-pat.txt`), public repo, not pushed until you OK it.

## 11. Open questions for Ved

- Happy with the name **SlideSage** and **MIT** license?
- Audience scope: should the first release target **both** education *and* business/keynote decks (toggle in
  the brief), or education-only for v1?
- Attribution: do you want the README to credit the six reference repos explicitly (recommended for an
  open-source "stands on the shoulders of" skill)?
