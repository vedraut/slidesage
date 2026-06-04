# Concept Sequencing (education mode)

Learners can't grasp a concept before its prerequisites. Model concepts as a **directed acyclic graph (DAG)**
and teach in a valid topological order. `scripts/check-dag.mjs` enforces this.

## Declare the graph

In the storyboard:
```jsonc
"concepts": [
  { "id": "var",   "label": "Variables",            "prerequisites": [] },
  { "id": "func",  "label": "Functions",            "prerequisites": ["var"] },
  { "id": "rec",   "label": "Recursion",            "prerequisites": ["func"] }
]
```
Mark **prior knowledge** with `"assumed": true` — it's a valid prerequisite without a teaching slide:
```jsonc
{ "id": "func", "label": "Functions", "prerequisites": [], "assumed": true }
```
`check-dag.mjs` skips the teaching-order rule for assumed concepts but still flags *unmarked* prerequisites
that are never taught (so genuine omissions are caught).

Each slide that introduces a concept lists it in `teaches`:
```jsonc
{ "archetype": "content", "actionTitle": "A function packages reusable steps.", "teaches": ["func"] }
```

## The two rules `check-dag.mjs` enforces

1. **Acyclic** — no concept may (transitively) require itself. A cycle means the breakdown is wrong; split or
   merge concepts.
2. **Prerequisite-before-dependent** — the first slide that `teaches` a concept must come *after* the first
   slide teaching each of its prerequisites.

## How to build a valid order

1. List concepts and, for each, the minimal set it directly depends on.
2. Topologically sort: repeatedly take any concept whose prerequisites are all already placed.
3. Lay slides in that order; insert a `section` divider whenever you move to a new cluster.
4. Run `node scripts/check-dag.mjs storyboard.json` and fix any reported violation.

## Granularity tips
- Aim for 4–9 concepts per lesson. More than ~9 and you likely have multiple lessons.
- A concept that needs everything as a prerequisite is probably the *summary*, not a concept.
- Prefer many small prerequisites over one giant one — it makes the teaching order obvious and the retrieval
  checks targeted.
