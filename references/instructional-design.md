# Instructional Design (education mode)

Apply when `meta.mode === "education"`. Grounded in **backward design** (Wiggins & McTighe) and **Bloom's
taxonomy, 2001 revision**. Avoid debunked ideas (e.g. "learning styles" / VAK) — see `learning-science.md`.

## Backward design — plan in this order

1. **Identify desired results** → write learning objectives.
2. **Determine acceptable evidence** → design the retrieval checks that prove the objective.
3. **Plan learning experiences** → only now choose the explanatory slides.

This is why the storyboard lists `objectives` *before* `slides`, and why every objective must be `covers`-ed by
at least one slide and probed by at least one `retrieval` slide.

## Writing objectives with Bloom's verbs

Form: **"By the end, learners can [verb] [content] [condition/criterion]."** Use a verb at the intended level:

| Level | `bloom` | Sample verbs |
|---|---|---|
| Remember | `remember` | define, list, recall, name |
| Understand | `understand` | explain, summarise, classify, paraphrase |
| Apply | `apply` | use, compute, solve, demonstrate |
| Analyze | `analyze` | compare, differentiate, debug, attribute |
| Evaluate | `evaluate` | critique, justify, judge, prioritise |
| Create | `create` | design, compose, construct, plan |

Pick the **highest level the lesson truly targets** and build evidence for it. Don't claim `create` if the
check only asks learners to `recall`.

## Mapping objectives → archetypes

- `remember`/`understand` → `content`, `two-column`, `quote`.
- `apply` → `worked-example` (model it), then `retrieval` (they try one).
- `analyze`/`evaluate` → `comparison`, `data` (interpret a chart), `retrieval` with a judgement prompt.
- `create` → an end-of-lesson task framed on a `callToAction`/`summary`.

## ADDIE-lite checkpoint

Analyse (audience + prior knowledge in the brief) → Design (objectives + sequence) → Develop (storyboard) →
Implement (render) → Evaluate (QA gate + the retrieval checks themselves). Keep it lightweight; the brief and
QA steps already cover Analyse and Evaluate.

See `concept-sequencing.md` for ordering concepts by prerequisite, and `learning-science.md` for the beats
(retrieval, spacing, worked examples) that make it stick.
