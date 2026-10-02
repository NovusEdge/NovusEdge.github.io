# In Search of Meaning: the sketchbook

A bespoke page for the `in-search-of-meaning-*` series, starting with
`in-search-of-meaning-01`. The page is a sketchbook that is still being drawn,
with one set piece in the middle: two voices arguing either side of a figure
whose head is full of scribbles. Implementation spec.

Mockup: `docs/superpowers/mockups/in-search-of-meaning/combo.html`. Its two
parents, `sketch.html` and `head.html`, and the parked lamp mockups
(`index.html`, `real.html`, `cord.html`) sit beside it.

## What it is

The series is existential essays that open on *cogito, ergo sum*. The page
draws its thinking in the margins as you read. Headings get scribbled
underlines, a phrase gets circled, doodles appear in the margins, and every
drawn line boils slightly, as hand-drawn animation does. The prose stays plain
type, so it reads like any other post on the site.

Partway through, a faint tangle of scribbles creeps in behind the text. At the
voices section it pulls into the figure's head and stays there while two voices
argue on either side. The tangle knots and speeds up as the argument heats and
loosens when it settles. After the last line it spills back out and fades,
leaving the clean sketchbook for the rest of the essay.

## Look

Site tokens, no new palette:

| role | light | dark |
| --- | --- | --- |
| paper | `--color-bone` `#f5f2eb` | `--color-charcoal` `#1a1a1a` |
| ink, drawings, left voice | `--color-charcoal` | `--color-bone` |
| accent, right voice, ring, hero underline | `--color-gold` `#d4a03c` | same |

Prose and headings in Supreme (`--font-prose`), the series kicker in Supreme
caps. Hand-lettering in two places only: the hero line and the voice lines.
The site's grain overlay stays on; the sketchbook is paper.

### Hand-lettering

The hero line is the owner's own handwriting traced to SVG, one file per post,
under `public/assets/blog/meaning/`. Until the file exists, the hero renders
the same text in Caveat. Voice lines are Caveat. Caveat has no CJK glyphs, so
`ja` and `zh` fall back to the site's existing display fallbacks (Zen Kaku
Gothic New, Noto Sans SC). Caveat is added to the Google Fonts request in
`index.html` at weights 500 and 700.

## Page structure

`MeaningPage` replaces the shared shell, as `PortalPage` does:

- Back link to the blog.
- Kicker: the post title, set small in caps ("IN SEARCH OF MEANING #1").
- Hero: the hand-lettered line with a gold underline that draws in after load.
- Body: `MeaningMarkdown`.
- Footer: `PostSignoff`, unchanged.

`post.tsx` routes every slug starting with `in-search-of-meaning-` to
`MeaningPage`, so later entries get the treatment without a code change. A
slug with no entry in the data file still renders: Caveat hero from the post's
`description`, no doodles, default voice agitation, no audio.

## Drawn elements

All drawn elements are SVG paths with `pathLength="1"`, drawn in with
`stroke-dashoffset` when they enter the viewport.

| element | placement | source |
| --- | --- | --- |
| heading underline | under every `##` | automatic |
| ring | around an inline phrase | markdown `[phrase](#ring)` |
| margin doodle | beside the first paragraph after a heading | data file, by heading id |
| divider squiggle | in place of `---` | automatic |
| end mark | after the last paragraph | automatic |

Doodle kinds: `question`, `spiral`, `arrow`, `star`. Doodles hide below
1000px, where there is no margin.

### Boil

Each drawing has three path variants, generated once with seeded jitter, and
a single shared ticker swaps the `d` attribute about eight times a second.
Rejected: the mockup's SVG `feTurbulence` filter with a cycling seed. It
re-rasterises every filtered element on every swap, which is the most
expensive part of the mockup on phones, and it blurs thin strokes. The ticker
only updates drawings that are on screen.

## The voices

### Authoring

The block is a blockquote that opens with `[!voices]`, one list item per line,
with an arrow for the side:

```markdown
> [!voices]
> - ← You're thinking. That much is certain.
> - → Thinking about what, though?
> - ← Doesn't matter. Something is doing the thinking.
```

`←` is the left voice in ink and `→` the right voice in gold. Where the block
sits in the markdown is where the section appears.

This is a blockquote, not a fenced block, because `translate-blog.mjs` skips
fenced code. A ```` ```voices ```` fence would leave the lines in English in
every translation. As a blockquote list the lines are translated with the rest
of the post.

Per-line agitation and audio live in the data file, keyed by line index, so
the markdown carries only text the translator should touch. A line with no
entry gets agitation from a default ramp.

### Stage

The section is `420vh` tall with a sticky `100vh` stage. Progress through the
section drives three phases:

| progress | what happens |
| --- | --- |
| 0 to 0.16 | the background tangle shrinks from filling the screen into the head; the figure fades in |
| 0.16 to 0.86 | lines appear one at a time, alternating sides; the newest two per side are full ink, older ones fade to 18% |
| 0.88 to 1 | the tangle spills back out of the head |

Agitation eases toward the current line's value at 5% per frame. It sets how
many strokes are drawn, how long they are, how far they jitter and how fast
they boil.

Before the section, the tangle fades in over the last 1.3 screens of prose at
low opacity with agitation rising from 0.2 to 0.7. After it, the tangle fades
out over 0.9 screens. Paragraphs and headings carry a paper-coloured backing
with a soft edge, so the tangle never crosses a line of text.

Reading order: lines render as one ordered list in DOM order. CSS grid places
each item in the left or right column. Two columns in the DOM would make a
screen reader read one voice's lines and then the other's.

Below 760px the stage stacks: left lines above the figure, right lines below,
all centred.

### Figure

A head-and-shoulders line drawing, front-on, as in the mockup. The component
takes the head ellipse (centre and radii, in the figure's own coordinates) as
a prop, so replacing the art with a sprite later means new art and new head
coordinates, nothing else. The figure boils with the same ticker.

### Tangle

One canvas drawing seeded random walks inside an ellipse, which interpolates
between "fills the screen" and "the head". Strokes are generated once per
mount from a fixed seed, so every visit draws the same tangle. Drawing runs
only while the tangle is visible; outside the zone the canvas is cleared once
and the loop stops.

The canvas lives in a sticky layer at the top of the page root
(`sticky top-0 h-lvh -mb-[100lvh]`), the same as the blips background. A
`position: fixed` canvas inside the route resolves against the whole page,
because `.page-enter` carries a transform. Portalling it to `body` would paint
it over the content.

### Audio

The owner records each line. Clips go in
`public/assets/blog/meaning/<slug>/voice-NN.mp3` and are listed in the data
file by line index. A "sound" toggle appears on the stage only when at least
one clip exists, and it starts off. With sound on, each line plays its clip
once when it first appears, panned 70% to its side. Scrolling back up does
not replay lines.

Audio plays only on the English page. Translated pages show translated text,
and English speech under it would contradict the text.

The mockup's placeholder tones do not ship. Until clips exist, the toggle is
hidden.

## Data

`src/lib/meaning-data.ts`, keyed by slug:

```ts
type MeaningPost = {
  hero: { text: string; svg?: string }
  doodles?: { after: string; kind: 'question' | 'spiral' | 'arrow' | 'star'; side: 'left' | 'right' }[]
  voices?: { agit?: number; audio?: string }[]
}
```

`after` is a `headingId()`. Renaming a heading drops its doodle, as with the
OpenJev states.

## Reduced motion

`prefersReducedMotion()`, or the site's `a11y-reduced-motion` class:

- Drawings render fully drawn, with no boil.
- The voices section is not sticky and not tall. All lines show beside a still
  figure with a still tangle in the head at agitation 0.5.
- No background tangle before or after the section.
- The sound toggle stays, and with it on each line has a play control. Nothing
  plays on its own.

## Accessibility

- Drawn SVGs and the tangle canvas are `aria-hidden`.
- The figure is `role="img"` with an `aria-label` from i18n.
- The hero SVG carries the hero text as its accessible name.
- A ring is a `<span>` around the phrase; the phrase stays plain text.
- The sound toggle is a real `<button>` with `aria-pressed`.

## Files

- `src/routes/blog/meaning-page.tsx`: the page.
- `src/components/meaning/markdown.tsx`: `MeaningMarkdown`; heading
  underlines, `#ring` links, `---` dividers, the voices blockquote.
- `src/components/meaning/voices.tsx`: stage, figure, tangle canvas, audio.
- `src/components/meaning/drawn.tsx`: drawn SVG primitives and their path
  variants.
- `src/lib/meaning-tangle.ts`: stroke generation and drawing, no React.
- `src/lib/boil.ts`: the shared ticker.
- `src/lib/meaning-data.ts`: per-post data.
- `src/routes/blog/post.tsx`: route the slug prefix.
- `src/styles/global.css`: `.ms-*` rules.
- `index.html`: add Caveat.
- i18n keys under `blog.meaning.*` for the sound toggle and figure label in
  every locale catalog. Run `npm run i18n:check`.

## Tests

- Voices parsing: a `[!voices]` blockquote yields lines with sides in order;
  an ordinary blockquote is left alone; a list item without an arrow is
  dropped.
- Data mismatch: more lines than data entries falls back to the default ramp;
  fewer is fine.
- Progress mapping: section progress maps to the shown-line count and the
  tangle ellipse at the phase boundaries.
- Stroke generation is deterministic for a seed.
- Reduced motion renders every line and no sticky stage.

## Out of scope

- The strikethrough animation. It is planned for a later pass and will be a
  new drawn element (a scribble-out over a phrase), authored the same way as
  the ring.
- The blog index card for the series.
- Finding or drawing a sprite for the figure.

## Open questions

- The hero line for #1 is *cogito, ergo sum*, and the post's markdown also
  opens with it. Remove it from the markdown, or keep it and drop the hero for
  this post.
- Doodle placement for #1, once the essay is written.

## Acceptance

- At 1440px: the tangle creeps in before the voices, pulls into the head,
  lines play in order both scrolling down and back up, and the tangle spills
  out and fades.
- At 390px the stacked stage fits with no horizontal overflow, and the page
  holds 60fps scrolling on a mid-range phone in Chrome's performance panel
  with 4x CPU throttling.
- Light and dark follow the site toggle, including the canvas ink.
- With reduced motion nothing animates and every line is visible.
- `de`, `fi`, `ja` and `zh` translations render the voices section with
  translated lines. Check after every `translate:blog` run that the
  `[!voices]` marker and arrows survived.
- `npx tsc --noEmit -p .` and `npm test` pass.
