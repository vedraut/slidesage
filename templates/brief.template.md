# SlideSage Brief

Fill this with the user before building the storyboard. Infer what you reasonably can; ask only what you can't.

- **Topic / subject:**
- **Mode:** `business` (default) | `education`
- **Audience:** (who, and their prior knowledge)
- **The single goal:**
  - business → the decision you want them to make / the ask
  - education → what learners can *do* afterwards (becomes the objectives)
- **Time budget (minutes):**  → target ~1 slide/minute
- **Style:** futuristic-tech | minimalist-luxury | modern-illustration | soft-clay-3d | japanese-editorial | hand-drawn-editorial
- **Hard constraints:** (brand colors/fonts, must-include data, length cap, tone)
- **Source material / data:** (links, numbers, quotes — must be real; the renderer does no math and invents nothing)

## Then
1. business → draft `meta.governingThought` (one-line recommendation).
   education → draft `objectives[]` (Bloom's verbs) + `concepts[]` (with prerequisites).
2. Build `storyboard.json` (see `schemas/storyboard.schema.json` + `templates/storyboard.example.json`).
3. `node scripts/validate-storyboard.mjs storyboard.json` (+ `check-dag.mjs` for education).
4. `node scripts/generate.mjs --in storyboard.json --style <style> --out deck.pptx`.
5. `node scripts/qa-report.mjs --storyboard storyboard.json --deck deck.pptx` → fix all FAILs.
