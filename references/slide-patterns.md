# Slide Patterns

Concrete recipes for filling each archetype well. The renderer (`scripts/lib/archetypes.mjs`) handles layout;
your job is supplying the right fields.

## cover
```jsonc
{ "archetype": "cover", "kicker": "Series B", "actionTitle": "We turn idle capital into compounding returns.",
  "body": ["Investor briefing · June 2026"] }
```
One bold promise as the title; `kicker` = context; `body[0]` = subtitle/date.

## section (narrative transition)
```jsonc
{ "archetype": "section", "kicker": "Act II", "sectionId": "why-now",
  "actionTitle": "We've shown the pain — here's why the timing is finally right." }
```
The title is the *bridge*, not a label. Always answer where-we've-been → where-we're-going.

## content
```jsonc
{ "archetype": "content", "actionTitle": "Three forces make this market inflect in 2026.",
  "body": ["Regulation opened the data", "Compute costs fell 60%", "Buyers now expect AI-native tools"] }
```
≤5 bullets, ≤12 words each. The title carries the conclusion; bullets are the support.

## data — hero stat
```jsonc
{ "archetype": "data", "actionTitle": "Onboarding dropped from days to minutes.",
  "visual": { "type": "stat", "stat": "11 min", "caption": "median time-to-value, down from 3 days" },
  "body": ["94% of users finish unaided", "Support tickets −41%"] }
```

## data — chart (always cite the source)
```jsonc
{ "archetype": "data", "actionTitle": "Revenue compounds 3.2× across the plan.",
  "visual": { "type": "chart", "chartType": "bar",
    "data": [{ "name": "ARR ($M)", "labels": ["FY24","FY25","FY26"], "values": [4,9,21] }] },
  "citations": ["Internal finance model, May 2026"] }
```
See `chart-design.md`. One series unless a comparison is the point. Put the takeaway in the title.

## comparison
```jsonc
{ "archetype": "comparison", "actionTitle": "Our model wins where the status quo stalls.",
  "columns": [
    { "heading": "Status quo", "points": ["Manual review", "Days to decision", "Opaque"] },
    { "heading": "SlideSage way", "points": ["Automated", "Minutes", "Auditable"] }
  ] }
```

## worked-example (education)
```jsonc
{ "archetype": "worked-example", "actionTitle": "Trace factorial(3) one frame at a time.", "teaches": ["rec"],
  "body": ["factorial(3) calls factorial(2)", "factorial(2) calls factorial(1)", "factorial(1) returns 1", "unwind: 1·2·3 = 6"] }
```
Numbered steps render automatically. Keep each step atomic.

## retrieval (education)
```jsonc
{ "archetype": "retrieval", "actionTitle": "Can you predict the output before running it?", "covers": ["obj2"],
  "body": ["What does factorial(0) return, and why?", "Where would infinite recursion happen?"] }
```
Ask learners to *produce*, not recognise.

## summary / callToAction / references
- `summary`: restate the governing thought (business) or recap objectives (education) as ≤5 bullets.
- `callToAction`: one imperative title + the concrete ask in `body`.
- `references`: put sources in `citations[]`.
