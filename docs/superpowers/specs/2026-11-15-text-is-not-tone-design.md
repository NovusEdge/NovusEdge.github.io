# Text != Tone: bespoke post page

Status: design approved by the author on 2026-11-15 after seven mock passes, revised the same day after a spec review. The approved mock is `2026-11-15-text-is-not-tone/mock-a7.html` (the notes call it `direction-a7.html`), and its pass-by-pass notes are `mock-notes.md` beside it.

To run the mock, serve the repo root (`python -m http.server 8765`) and open `/docs/superpowers/specs/2026-11-15-text-is-not-tone/mock-a7.html`. It fetches `stage.json` and the clips from `/public/assets/blog/didnt-say/`. Its footer stand-in needs the dev server on port 5179 for the hand images; everything else runs without it.

## Goal

Ship `src/content/blog/text-is-not-tone.md` with its own page, the way `hello-world`, `plan-a-ai` and the meaning series have one. The post argues that typing drops stress and tone, that speech is the more usable interface, and that this matters now that agents act on what we type. The page has to make the reader hear the stress move, then watch the typed version throw it away.

## What the reader gets, top to bottom

| Where | Element | Behaviour | Reduced motion |
|---|---|---|---|
| Top | Site header (floating nav), back chip, title, date | Title "Text != Tone": the words in Instrument Serif, "!=" in IBM Plex Mono with ligatures off, in the italic accent colour. No hero. | Same |
| After the opening paragraph | Stress list | Seven rows, one per stressed word. Each row is a `button`: the sentence with the stressed word lifted and heavier, a faint pitch trace, the meaning, a lucide `Volume2`. A tap plays that clip; words brighten at their real start times, the stressed word lifts at its real start, and the trace redraws with the sound. One row plays at a time; tapping the playing row stops it. | Rows play with nothing moving |
| "Now type it." paragraph | The fold | ScrollTrigger scrub, from the paragraph top at 68% of the viewport to 28%: lifted words settle, traces go straight, meanings fade, rows stack into one typed line with a caret. Reverses on scroll up. Reserved height, no pin. It tweens transforms, opacity, visibility and the margin around the stressed word, as approved in the mock. Folded rows are `inert`. Collapsed, the line plays `flat.mp3`. | No scrub; the list stays open and a static typed line sits under the paragraph |
| After "Then there's interrupting" | Forty sheets | "spoken" stops at a few of 40 when "no wait, not that" lands; "typed" changes all 40. Loops. | Shows the end counts |
| After the Mandarin paragraph | Tones figure | 妈 麻 马 骂 with tone contours in the page's pitch-line style; loops to toneless "ma"; the poem line goes to "shi" ×12 in step. | All four with toneless forms, both poem romanisations |
| After the Arabic paragraph | Harakat figure | كتب bare, then kataba / kutiba / kutub with harakat fading in, then back to bare. `lang="ar" dir="rtl"`. The overlay assumes equal advance widths, so it animates only after Noto Naskh Arabic has loaded; if the font has not loaded within the timeout, it shows the reduced-motion layout. | Bare word and all three readings |
| After the typing-speed paragraph | Rate cards | Three punched cards at 1, 3 and 100 holes a second. Loops. | One second's worth |
| End | Closing stage | 66svh, `#0b0a09`: the typed line bends into a glowing horizon, cut paper rises, then flattens again. Runs straight into the site footer on the same background. | Bent arc with its paper, static |

Every looping figure has one pause button and pauses offscreen. There are no control rows, no global sound toggle, and no typed arrows or glyphs anywhere.

## Shell integration

- **Route.** `src/routes/blog/post.tsx` gets one more early return, `if (post.slug === 'text-is-not-tone') return <TextTonePage post={post} image={image} />`, with a one-line comment in the style of its neighbours. The page renders `Meta`, the back chip, the title block, the prose and figures, `PostSignoff`, then the closing stage last.
- **Back chip.** Same `TLink` classes and `Magnetic` wrapper as `post.tsx`, with lucide `ArrowLeft` in place of the brackets. `blog.backToBlog` carries the brackets, so the chip uses a new key, `blog.textTone.back` ("back to blog").
- **Title and date.** The title is split on `!=`, so translated titles keep the mono operator with their own words. The date is formatted as in `plan-a-page.tsx:78`, with `timeZone: 'UTC'`, so it does not shift a day west of UTC and mismatch on hydration.
- **Footer.** The closing stage must be the last thing before `SiteFooter`, so `PostSignoff` sits above the stage. `App` renders the footer outside the page, so a class on the page root cannot reach it: the page adds `tone-night` to `document.documentElement` in an effect and removes it on unmount, as `hello-world-page.tsx` does with `vg-space`. Global CSS gains `.tone-night .site-footer { background-color: #0b0a09; }`, beside the `.vg-space` rule.
- **Grain.** The page has its own grain (absolute on the page block and the stage, as in the mock), so `App.tsx:75` excludes this route from `GrainShader`, as it does for Plan A and OpenJev. `App.tsx` also holds uncommitted work for the paused privacy page: stage only this hunk.
- **`.page-enter`.** Its lingering transform breaks `position: fixed` and ScrollTrigger pins (see `side-flourish.tsx`). Nothing in the page is fixed and nothing pins.
- **Theme.** Colours are CSS variables under the site's `.dark` class. The header's toggle drives the theme; the mock's own toggle is not ported.
- **Reduced motion and hydration.** `prefersReducedMotion()` returns false during prerender, so nothing calls it during render. The prerendered markup is the motion variant without pause buttons. A hook in `loop-pause.tsx` reads `prefersReducedMotion()` once in an effect and sets state, as `hello-world-page.tsx` does with its `pending` mode; every figure branches on that state. A change in the accessibility panel takes effect on the next load.
- **Pixel-me.** The post's frontmatter gets `pixel: thinking`, as the other essays have.

## Content and data

### Audio

Eight River clips (ElevenLabs `eleven_v4`, lead-in takes trimmed to the sentence) are in `public/assets/blog/didnt-say/`. `scripts/generate-stress-clips.mjs` only generates missing clips. Nothing autoplays.

The tap handler creates the `AudioContext` and calls `resume()` synchronously, before any await, because Safari only unlocks audio inside the gesture. Clips are then fetched, decoded and cached. A failed fetch or decode drops its cache entry and leaves the row at rest. On unmount, playback stops and the context closes.

### Stage data

`scripts/extract-stress-pitch.py` writes `src/data/text-tone-stage.json` (`words` with start/end, `f0`, `duration`, `src` per reading; the `loop`, `f0max` and `dbmax` fields and the looping-figure comments go). The eight `*.align.json` files are script inputs, so they move out of `public/` to `scripts/stress-align/`, and both scripts read and write them there. When the JSON moves, the mock's `STAGE` fetch changes to `/src/data/text-tone-stage.json`.

The page imports the JSON statically (about 15 KB). The site ships one entry chunk and no route is lazy, so there is no chunk check. `stage-data.ts` only types it.

The prerendered rows carry the button, the words, the meaning and an empty trace `svg`. Traces map time to x from each word's measured box, so they are drawn in `useGSAP` once the fonts have loaded.

### Markdown placeholders

The post body carries six placeholders, each as its own paragraph:

| Placeholder | Where in the post | Renders |
|---|---|---|
| `{{stress_list}}` | In place of the markdown list of seven | The stress list |
| `{{typed_line}}` | After "Now type it." | Nothing in the motion variant; the static typed line under reduced motion |
| `{{forty_sheets}}` | After "Then there's interrupting" | Forty sheets |
| `{{tones}}` | After the Mandarin paragraph | Tones figure |
| `{{harakat}}` | After the Arabic paragraph | Harakat figure |
| `{{rate_cards}}` | After the typing-speed paragraph | Rate cards |

Names use underscores because `translate-blog.mjs` matches `\{\{(\w+)\}\}`, and `\w` excludes the hyphen. Its check compares token sets, so translation cannot drop or rename a figure; it does not catch a moved one, which the verification below does. The fold anchors on the list's next sibling element, the "Now type it." paragraph.

`Markdown` in `src/components/markdown.tsx` takes no components and wraps its output in the shared `prose` classes, so the page runs its own `ReactMarkdown` (remark-gfm only), as `src/components/meaning/markdown.tsx` does, with these overrides:

- `p`: a paragraph that is exactly a placeholder renders its component. Any other paragraph stays prose.
- `a`: `href="#stat"` renders the stat span; any other link goes through `withSlash`. The translation pipeline keeps link targets and translates link text, as with the meaning series' `#ring` markers.
- Text: Arabic-script runs are wrapped in `<span lang="ar" dir="rtl">` in every locale. Han runs are wrapped in `<span lang="zh-Hans">` in every locale except `zh` and `ja`, where Han is the body text.
- Headings get ids as in the meaning renderer.

Script styles are scoped to attribute selectors under the page class (`.tt [lang="zh-Hans"]`), never global `:lang()`: on `/zh/` the document language is `zh-Hans`, and a global rule would set the whole page in the 16-glyph serif subset.

The stats marked `[…](#stat)` in the English post: "89%", "63%", "39 bits a second", "52 words a minute", "1 token a second", "150 words a minute", "3 tokens a second", "50 to 200 tokens a second", "59%", "78%", "93%".

### The seven readings and other strings

The list's sentence, stressed word, clip and pitch come from the stage data and stay English in every locale; stress-shift is an English device and the clips are English. Everything else the figures show goes under `blog.textTone.*` in the i18n files: the seven meanings, the figure and stage `aria-label`s, "Pause animation", the sheet and card labels, the Mandarin and Arabic glosses, the chip label and the English-only caption. Only the sentence, the pinyin, the transliterations and the scripts themselves stay untranslated.

The seven meanings, as the post has them: "Someone else said it.", "Flat denial.", "I might have hinted at it though.", "Someone else did.", "Maybe she just borrowed it.", "She took some money, just not *that* money.", "She took something else." The sixth carries an italic, rendered with `Trans` and an `<i>` component.

The row label is one template, `"Play: {{sentence}}, stressed on {{word}}. {{meaning}}"`, so the translator never sees the English sentence and `translate-ui.mjs`'s token check protects it. The collapsed line's label is `"Play: {{sentence}}, typed, with no stress"`.

`blog.textTone.englishOnly` is a caption the stress list renders when the locale is not `en`, saying the example only works in English and is left as is. `translate-blog.mjs` regenerates locale posts from the English source, so the caption cannot live in the markdown.

A new English key fails `pnpm test` until every locale has it (`catalogs.test.ts`, run by the pre-commit hook), so `en.json` and the `translate-ui.mjs` run land in one commit.

### Fonts

The page loads these itself, using the site's two-part pattern for per-locale fonts: a `<link>` added by id in an effect for client navigation (`App.tsx:55-64`), and the same link in the prerendered head when the path is this post in any locale (`main.tsx:95-103`).

- `Instrument+Serif` (regular)
- `Spectral:ital,wght@0,700;1,500`, which includes the Latin Extended subset for pinyin tone marks. The global request already has 400, 600 and italic 400.
- `IBM+Plex+Mono:ital,wght@1,500`, for the italic in the sixth meaning
- `Noto+Serif+SC:wght@500` with `text=` limited to the post's characters
- `Noto+Naskh+Arabic:wght@500`

`font-synthesis: none` is set on the prose column. `document.fonts.ready` resolves at once when a stylesheet has not arrived yet, so measuring code waits on `document.fonts.load()` for each face it depends on (Instrument Serif; Noto Naskh Arabic with the Arabic sample text; Noto Serif SC with the poem line), with a 3 s timeout.

### Inline styles

Italic is Spectral Italic 500 in rust (`#8a3a1c` / `#f0a47c`), bold is Spectral 700, links are blue (`#2f5f8f` / `#a9c7e6`) with an underline that thickens on hover, headings are Spectral 700, and stats are IBM Plex Mono 500 with tabular figures. The author saw these in a6 and a7 and approved them; the colours are new to the site and scoped to this page. Unstressed words at rest sit at 46% opacity, about 2.9:1 on light paper; the row's `aria-label` carries the sentence, so this is a visual choice only.

## Code layout

- `src/routes/blog/text-tone-page.tsx`: the page and its figure map.
- `src/components/text-tone/`: `markdown.tsx` (the renderer), `fonts.ts` (font links and `whenFonts`), `clips.ts` (the audio context, clip cache and one-at-a-time playback), `stress-list.tsx` (list, typed line, fold), `forty-sheets.tsx`, `tones-figure.tsx`, `harakat-figure.tsx`, `rate-cards.tsx`, `closing-stage.tsx`, `loop-pause.tsx` (the reduced-motion hook, the shared pause button and offscreen pausing), `stage-data.ts`, `text-tone.css` (imported statically by the page, as `detail-sundial.tsx` does).
- GSAP 3.15 plugins (DrawSVG, MorphSVG, CustomEase, ScrollTrigger) are registered at module scope with `gsap.registerPlugin`, as in `post-hero.tsx`. Timelines live in `useGSAP` with `contextSafe` handlers. React renders the word and character spans, so SplitText is not used. A width change, and only a width change, rebuilds a timeline while keeping its time and paused state. `ScrollTrigger.refresh()` runs after the fonts load and after the `.page-enter` animation ends (0.5 s). anime.js is not used.
- Not ported from the mock: its test hooks (`window.readings`, `window.collapse`, …), its theme toggle, its footer stand-in and Fontshare links, and the leftovers from a2 to a4: `MATS`, `NIGHT`, `DAY`, `pat`, `dots`, `hatch`, `greek`, `chalk`, `scribble`, `ledger`, `guilloche`, the `bloom` and `rough` filters, `st.lift/of/not`, `.pitch`, `audio.hold`, and the `.said`, `.gloss`, `.bookend`, `.meta` and `.spk` CSS. The closing stage uses only `CLOSE`, `layer`, `stack` and the `soft`, `lift` and `fibre` filters.

## Accessibility

- The pause button (lucide `Pause`/`Play`) keeps the label "Pause animation" and signals state with `aria-pressed` only. On the closing stage it is a sibling of the `role="img"` element, never inside it.
- Folded rows are `inert`, so they leave the tab order and the accessibility tree.

## Verification

- A unit test on the committed stage data: seven readings in sentence order, each with seven word spans, plus a flat entry.
- A unit test for the renderer: a paragraph that is exactly `{{tones}}` renders the figure, while one containing it among other text stays prose; a `#stat` link renders the stat span with no `href`.
- Day-to-day checks run on `vite dev`, because drafts drop out of the build (`posts.ts:47-50`). On the publish commit, with `draft` removed, `npm run build` prerenders `/blog/text-is-not-tone/` and every locale; the HTML contains the title, the first paragraph and all seven rows, and none of it contains `{{`.
- Browser check at 1280 and 390, light and dark: tap all seven rows (right clip, right word), scrub the fold down and up twice, the collapsed line plays flat, each loop pauses offscreen and on its button, no horizontal overflow, no console errors, no fixed elements, and the stage meets the footer with no seam. Then turn on reduced motion in the accessibility panel, reload, and repeat.
- Performance: scroll the closing stage at 4x CPU throttle. If it drops frames, rasterise the fibre layer and drop the shadow filter while the layers move.
- Translations: run `translate-blog.mjs` for the post and `translate-ui.mjs` for the new strings. `--check` passes, `^## ` counts match English, and in every locale file each placeholder sits alone on its line, in the English order.

## Out of scope

- A custom card in the blog index. The thumbnail (`text-is-not-tone-thumb.webp`) is wired; a hover card that moves the stress can come later.
- The mock's interruption copy beyond what the post says.

## Open before publishing

- Email study: checked against the paper (Kruger et al. 2005). Study 2 reports email receivers at an accuracy "indistinguishable from chance (50%)" against "nearly three-quarters" by voice; Study 3 reports email senders predicting 89.3% and achieving 62.8%. The post uses these figures.
- A Chinese reader checks the poem's first line, its pinyin and gloss, and an Arabic reader checks the three vowelled readings.
- The author plays the list once with sound on iOS Safari and once in Firefox; headless Chromium has no audio.
- The author approved the prose. The post stays `draft: true` until the checks above are done.
