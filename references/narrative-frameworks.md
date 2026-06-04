# Narrative Frameworks

The storyboard's *spine*. Pick one arc, then make every slide a beat in it. The single most important rule:
**a reader who sees only the action titles, in order, should understand the whole argument.**

## Action titles (non-negotiable)

Every content slide's `actionTitle` is a **complete sentence stating the takeaway**, not a topic label.

- ❌ "Market size"  → ✅ "The addressable market triples once mid-market is unlocked."
- ❌ "Results"      → ✅ "Onboarding time fell 38% after the redesign."

If you string the action titles together they should read like a paragraph that makes the case.

## Business mode (default) — Pyramid Principle + SCQA

Lead with the answer, then support it. Barbara Minto's structure:

1. **Governing thought** — the one-line recommendation the whole deck defends. Put it in `meta.governingThought`
   and on (or right after) the cover.
2. **Supporting pillars** — 3 (±1) MECE arguments (Mutually Exclusive, Collectively Exhaustive). Each becomes
   a `section`.
3. **Evidence** — under each pillar, data/examples/logic.

Frame the opening with **SCQA**:

| Beat | `narrativeRole` | Purpose |
|---|---|---|
| **Situation** | `situation` | The stable context everyone agrees on. |
| **Complication** | `complication` | What changed / the tension that demands a decision. |
| **Question** | `question` | The implicit question the complication raises. |
| **Answer** | `resolution` | Your governing thought — the recommendation. |
| **Ask** | `ask` | The specific decision/resource you want. (callToAction slide) |

Recommended business skeleton: `cover → agenda → [situation] → [complication] → section(pillar 1) → content/data
→ section(pillar 2) → … → summary → callToAction`.

## Education mode — lesson arc

Lead with the objective, scaffold to mastery. See `instructional-design.md` and `learning-science.md`.

| Beat | `narrativeRole` | Archetype |
|---|---|---|
| Hook | `situation` | cover / content |
| Objective | `instruct` | content |
| Concept | `instruct` | content / two-column |
| Worked example | `example` | worked-example |
| Retrieval check | `retrieve` | retrieval |
| Recap / spacing | `recap` | summary |

## Narrative transitions (this is our "transition" feature)

Because the deck has no motion, **section-divider slides** do the work of carrying the audience from one act
to the next. At every act boundary insert a `section` slide whose title states *the bridge*:

- ✅ "We've sized the prize — now here's why we can win it."
- ✅ "You can define recursion; next you'll trace one by hand."

Set `sectionId` on the slides within an act so the QA gate and (optional) fade injector can find boundaries.
A divider should answer two questions in one line: **where we've been → where we're going.**

## Length discipline

Target ~1 slide per ~1–1.5 minutes of talk time. If `meta.durationMin` is set, keep slide count near it.
One message per slide; if a slide needs two messages, split it.
