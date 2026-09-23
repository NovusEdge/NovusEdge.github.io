# OpenJev: the board

A bespoke page for `/blog/fine-tuning-openjev-on-62695-ab-tests`, typeset in
Plan A's paper and driven by a scroll-linked leaderboard in the right rail.
Implementation spec.

## What it is

The post is a weights release and a correction. Its first number, 0.704, was
wrong, and the page's figure shows that on the board itself. The figure is a
leaderboard that the reader watches get revised as they read: the headline
entry slides down to its real value, the splits reveal they share one period,
the ablations grow in, and the board settles at 0.812 with 90.3% as the claim
worth quoting.

The board merges the two lab variants the owner picked. From the Leaderboard
variant it takes the ranked rows, the chance line and the struck-through
withdrawn entry. From the W&B variant it takes the runs, the ablation bars and
the flat DeBERTa loss next to the live one.

## Look

Plan A's page, unchanged in palette and type:

| role | token | light | dark |
| --- | --- | --- | --- |
| ink | `--pa-ink` | `#111111` | `#e9e5da` |
| ground | `--pa-ground` | `#fffff8` | `#1c1b18` |
| accent | `--pa-ox` | `#93392a` | `#e49c85` |
| figure mark | `--pa-ox-mark` | `#c0522f` | `#df896a` |
| rule | `--pa-rule` | ink at 22% | ink at 22% |

ET Book for prose and headings, the site mono for every number in the figure.
Sidenotes for external links, exactly as `PlanAMarkdown` builds them. No grain
shader on this route.

Oxide marks this post's own entries. Everything else on the board is ink. There
is no second accent.

## Why SVG and GSAP

The figure is at most a dozen bars, one axis, one small line chart and text
labels. SVG draws that as ink on paper with real text, which a screen reader
and text selection can use. GSAP ScrollTrigger drives it, the same way the Plan
A fence is driven, and both are already in the bundle.

Rejected: react-three-fiber (the fence needed 540 instanced marks; this needs
twelve rects), anime.js (installed, but the blog's scroll-driven figures all use
ScrollTrigger and mixing drivers on one page doubles the reduced-motion paths),
framer-motion layout animation (reads as web UI on a print pastiche).

## Page structure

Mirror `PlanAPage`:

- `.pa` root, `plan-a-paper` on `<html>` for the page ground and nav repaint.
- Masthead: back link to the blog, and a right-hand link to the Hugging Face
  repo in place of "the document in question".
- Header: title, byline, date, standfirst. The header figure is the
  "cost" strip: `$0.40` for the first run against `$4` for the whole project,
  drawn like Plan A's runway. It carries the title's joke without a sentence.
- Contents list, numbered, as Plan A.
- `.pa-spread` with the body in `.pa-col .pa-body` and the board in `.pa-rail`.
- Footer line in the Plan A position. Text to be written with the owner.

The page reuses Plan A's `.pa-*` layout classes and `PlanAMarkdown` as they are.
Figure styles go under `.oj-*`. If a third post takes this treatment, rename
`.pa` to a shared paper scope then.

The post has tables and fenced code blocks, and Plan A has neither. Add `.pa
table`, `.pa th`, `.pa td` and `.pa pre` rules: hairline rules in `--pa-rule`,
mono numerals right-aligned, no zebra fill, code on the ground colour with a
left rule in oxide.

## The board

Axis runs from 0.40 to 0.85 pairwise accuracy. A dashed ink line marks chance
at 0.50 and is labelled "chance". Each row is a label, a bar and a mono value.
Rows reorder by value with a FLIP translate so a row's movement is visible.

Humans are drawn as a tick at 0.50 labelled "~chance", never as a 0.500 bar.

## States

Ids are `headingId()` of the post's `##` headings. Renaming a heading drops its
trigger, so both move together.

| # | heading id | board | caption |
| --- | --- | --- | --- |
| 0 | `the-setup` | ModernBERT MSE at 0.704 in oxide, above SOTA 0.544, humans ~chance, Llama-3-8B 0.469 | Sixteen points over the published number. |
| 1 | `and-yet` | The 0.704 row splits into three: confirmatory 2015 0.704, holdout 0.637, exploratory 0.624. The 0.704 value is struck through. | Two splits it never saw agree with each other. |
| 2 | `the-time-machine-that-only-travels-sideways` | Bars give way to three date bands, Jan 2013 to Apr 2015, each shaded to its pre-2015 share (83.5, 82.8, 83.8%), with a rule at 1 Jan 2015. | All three splits cover the same dates. |
| 3 | `two-hypotheses-both-backwards` | Back to the board. Holdout 0.637 in oxide, the struck 0.704 above it marked "withdrawn". | Leakage and label noise both point the wrong way. |
| 4 | `the-part-that-actually-mattered` | Ablation rows grow in order: phase-0 0.637, more data 0.724, Bradley-Terry 0.775, both 0.787. A small loss inset shows DeBERTa at lr 2e-5 flat at ln 2 for 4,804 steps, then lr 6e-6 through its four logged checkpoints to 0.360. The 0.812 row lands on top. | Changing the loss beat adding data by double. |
| 5 | `but-what-does-0812-actually-mean` | Final board: 0.812, 0.544, ~chance, 0.469. Below it, 90.3% set large, labelled "avoids the worst variant". | The claim worth making is 90.3%. |
| 6 | `okay-heres-where-i-ruin-it` | Final board holds. A dashed empty row appears at the bottom: "email subject lines", value "no public data". | All of it is one publisher, 2013 to 2015. |

Later headings keep state 6.

The loss inset plots checkpoints evenly and says so in its label. The post does
not give their step positions. Nothing is drawn between checkpoints.

## Driving it

One `ScrollTrigger` over `.pa-body`. `onUpdate` and `onRefresh` read the state
from heading positions against a line at 60% of the viewport, the same as
`stateAtScroll()` in the fence. A reflow can cross several headings in one
update, so the figure reads the current section instead of counting callbacks.

State changes run as one GSAP timeline per transition: bar widths as `scaleX`
from the left, row reorder as `y`, new rows fade and grow in, removed rows fade
out. 0.6s per transition with a 0.05s stagger. The caption fades out, swaps
text, and fades in over 0.4s.

## Reduced motion

`prefersReducedMotion()` renders state 5 plus the state 6 row, with no
ScrollTrigger and no transitions. The caption shows the state 5 text.

## Below 1024px

No rail and no scroll states. The final board, state 5 plus the state 6 row,
renders once inline between the contents list and the body. The board is the
post's evidence, so phones keep it.

## Accessibility

The SVG carries `role="img"` and an `aria-label` naming the current state.
A visually hidden table after the figure lists every entry and value, and it
does not change with scroll.

## Files

- `src/routes/blog/openjev-page.tsx`: the page, mirroring `plan-a-page.tsx`.
- `src/components/openjev-board.tsx`: the figure, its states and the driver.
- `src/lib/openjev-data.ts`: board rows, ablations, loss values. Moves the
  numbers out of `src/routes/lab/openjev/data.ts`.
- `src/routes/blog/post.tsx`: route the slug to `OpenJevPage`.
- `src/App.tsx`: suppress the grain shader on this route.
- `src/styles/global.css`: `.oj-*` figure rules and the `.pa` table and code
  rules.
- i18n keys under `blog.openjev.*` for masthead, captions and figure labels in
  every locale catalog, as Plan A does. Run `npm run i18n:check`.
- Delete `src/routes/lab/` and the lab route in `App.tsx` once this ships.

The slug has changed three times today. `post.tsx`, `thumbnails.ts` and the
state table all key on it and on heading text.

## Out of scope

The featured card on the blog index. It gets its own design pass after the page.

## Open questions

- The post's PNG charts (`splits.png`, `ablations.png`) show what the board
  shows. Keep them for readers without the rail, or drop them now that phones
  get the inline board.
- Footer line text.

## Acceptance

- At 1440px the board sits in the rail and changes state at each heading in
  the table, both scrolling down and back up.
- At 390px the static board renders inline and nothing overflows horizontally.
- Light and dark themes both follow the site toggle.
- With reduced motion the board renders its final state and never animates.
- Every number on the page appears in the post.
- `npx tsc --noEmit -p .` and `npm test` pass.
