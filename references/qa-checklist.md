# QA Checklist (pre-delivery gate)

Run `node scripts/qa-report.mjs --storyboard storyboard.json --deck deck.pptx` and fix every FAIL. The list
below is what that script enforces, plus human-judgement checks the script can't make.

## Automated (enforced by qa-report.mjs)

**Universal**
- [ ] Has a cover slide.
- [ ] Has a closing (`summary` or `callToAction`).
- [ ] Every content slide uses a full-sentence **action title** (ends with `.`/`!`/`?`).
- [ ] No slide exceeds ~5 bullets.
- [ ] Bullets are scannable (≤16 words).
- [ ] Every chart slide carries a `citations[]` source.

**Business mode**
- [ ] `meta.governingThought` (the one-line recommendation) is set.
- [ ] At least one `section` divider exists (narrative transitions present).

**Education mode**
- [ ] `objectives` are declared (with Bloom's levels).
- [ ] Every objective is `covers`-ed by ≥1 slide.
- [ ] At least one `retrieval` slide exists.
- [ ] (Separately) `check-dag.mjs` passes — prerequisites respected.

## Human judgement (read the deck once, top to bottom)

- [ ] **Title-only test:** reading just the action titles tells the whole story.
- [ ] **One message per slide** — nothing is doing two jobs.
- [ ] **Lead with the answer** (business) / **lead with the objective** (education).
- [ ] Each `section` title is a *bridge* (where we've been → where we're going), not a label.
- [ ] Visuals are purposeful, not decorative; the right ones are charts, the single numbers are stats.
- [ ] Consistent style: one style system throughout; colours used as meaning, not decoration.
- [ ] Contrast is legible (don't pair light ink on light bg — the style tokens are pre-checked, but verify any
      custom colours).
- [ ] Claims are sourced; numbers are real and pre-computed.
- [ ] Slide count ≈ `meta.durationMin` (≈1 slide/min).

Only deliver when automated checks PASS and the human checks are satisfied.
