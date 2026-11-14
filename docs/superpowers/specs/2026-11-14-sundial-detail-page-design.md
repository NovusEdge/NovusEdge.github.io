# sundial detail page

A bespoke `/portfolio/sundial/` page. The owner's frustration first: agent harnesses and LLM calls are time-stateless, so their agents were unreliable at wall-clock time and slow processes were hard for them. Then the research as their attempt to fix it, with honest results. Copy below is exact; lowercase sentence starts are intentional. Numbers come from `~/Projects/sundial/research/experiments/*.md` and the paper; do not add or round differently.

## Wiring

Same pattern as flocc and folo (`detail-flocc.tsx`, `detail-folo.tsx`, `content/*.tsx`, `custom-pages.ts`, `content/index.ts`, html-class footer repaint in `src/styles/global.css`). Files: `content/sundial.tsx` (lede = hero lede), `detail-sundial.tsx`, `sundial-dial.tsx` (the hero dial), `sundial.css` (prefix `sd-`). html class `sundial-sheet` repaints the site footer to the page ground in each theme. No new npm deps. The `sundial` entry in `src/content/projects.ts` has links (paper, hugging face); the masthead's outbound link is the paper.

## Look

A literal sundial on sunlit paper.

- Light: ground `#f3ead6`, ink `#2a2118`, muted `#6b5d4c`, rule `color-mix(ink 18%)`, accent ochre `#b8761a` (the sun, pass chips, the visitor clock).
- Dark (night): ground `#14161f`, ink `#ece4d2`, muted `#9a9384`, accent pale moon `#d9c58f`.
- Type: IM Fell English (headings and the wordmark, regular and italic) and IBM Plex Mono (times, numbers, the terminal, chips). Add IM Fell English and Spectral to the existing Google Fonts link in `index.html` (Plex Mono is already there from flocc). Body in Spectral (400, 400 italic, 600), 18px.

## Sections

### 1. Hero
- Masthead: `← Portfolio`, wordmark `sundial 時`, link `the paper ↗` (https://zenodo.org/records/23921544).
- h1: `My agents don't know` / `what time it is.`
- Lede: `harnesses and LLM calls are basically time-stateless. every call happens in this weird eternal present, so my agents were really unreliable at tracking wall-clock time, and a lot of slow processes ended up way harder for them than they should've been. sundial is me trying to fix that.`
- **Dial** (`sundial-dial.tsx`, SVG, beside the h1 on desktop, under it on mobile): a circular dial with hour lines 6 to 18, a gnomon, and a shadow whose angle is the visitor's local time (map 06:00 to 18:00 across the dial; outside those hours draw the shadow very faint). Updates every 30 s. Static under reduced motion (still the correct time, no transition).
- **Visitor clock**, mono, small, under the lede: `you've been here 02:14 · last scrolled 3 s ago` (live; mm:ss, then h:mm:ss past an hour). Under it: `a clock for you. the model never gets one of these.` `aria-live` off; it is decorative, mark the live numbers `aria-hidden` and give the line a static accessible label `time on page`.

### 2. What the model sees
Heading: `What the model sees`. Label: `illustrative`.

Two strips over one transcript of four turns:

1. `09:12` me: `kick off the eval and the docs subagent`
2. `09:13` `subagent started`
3. `09:53` `subagent finished` (note `40 min, usually 2`)
4. `22:41` me: `ok where were we?` (note `13 h later`)

Top strip `what happened`: turns placed on a real time axis 09:00 to 23:00, so the gaps are visible. Bottom strip `what the model sees`: the same four turns flush, no gaps, no times. On scroll into view the top strip's gaps collapse into the bottom one (GSAP, once); reduced motion shows both static.

Body: `to the model those four messages are back to back. it can't tell that the subagent took forty minutes when it usually takes two, or that I went to bed in between. so it either checks on things way too early or sits there way too long, and both waste time.`

### 3. The panel
Heading: `So I gave it a clock`. Body: `I built a small Claude Code mod that tells the model what time it is: a clock line, an away line, and a line for each running subagent or command saying how long it's been going, how long runs like it usually take, and the chance it finishes in the next five minutes.`

Terminal frame (mono, ink on a slightly darker ground), these lines verbatim (they are real panel output from a session):

```
[now 2026-11-14 18:39 · you were away 13 h 19 m]
subagent "Build flocc detail page": running 3 m · runs like this are usually done by 2 m · 67% chance it finishes in the next 5 m
Bash npx (background): running 14 m
```

Card beside it, chip `EXP-010 · running`: heading `Does it actually help?` Body: `half my sessions get the panel and half don't, picked by a hash of the session id, and it counts how often the model pokes at background work before it's done. it might be hard to see tho: the baseline found agents only check early about 0.05 times per item, so even if the panel stopped early checks completely, there's only about a 64% chance a test at 70 sessions per arm would catch it.`

### 4. What I've found so far
Heading: `What I've found so far`. Four cards in a 2x2 grid (one column on mobile). Each: experiment id, chip, question as heading, body.

1. `EXP-003` chip `provisional` · `How long will a tool call take?` · `a small text model reading the call lands within 2× of the real duration on 67.5% of calls, against 61.0% for just using each tool's median, and almost all of that is Bash. on subagents it's worse than the median, 40.3% against 59.8%, cause how long a subagent takes depends on the work, not the prompt.` Footnote mono: `70,565 calls, test week from 2026-10-21`.
2. `EXP-005` chip `provisional · H3 passed` · `When will this subagent finish?` · `while a subagent runs, what it's doing tells you more about when it ends than how long it's been going. that one passed. a sequence model edged out the hand-made features, but not by enough to call it.`
3. `EXP-007` chip `paper · 1 of 4 passed` · `Where should elapsed time go in?` · `I adapted Qwen3.5-2B eight ways at the same trainable parameter budget, from timestamps written in the text to time fed straight into the layers. plain text plus fine-tuning won.` Links: `zenodo ↗` https://zenodo.org/records/23921544, `doi ↗` https://doi.org/10.5281/zenodo.23921544, `model ↗` https://huggingface.co/NovusEdge/sundial-qwen3.5-2b-T-int.
4. `EXP-008` chip `provisional` · `Does it actually have a clock?` · `you can read elapsed time out of the trained model really well (ρ around 0.99), but you can also read it out of a control trained on shuffled times (0.81 to 0.92). so being decodable isn't the same as having learned a clock.`

### 5. Close
`sundial 時`. Text: `the repo's private, the paper and the model aren't.` Links: the paper, the model, `← Back to portfolio`. Stack mono: `Python · PyTorch · LoRA · Qwen3.5-2B · ModernBERT · Claude Code`.

## Quality bar
- Light and dark, 375 to 1440px, no horizontal scroll.
- Reduced motion (OS and the site's `a11y-reduced-motion` class via `prefersReducedMotion()`): no collapse animation, dial and clock still show correct values without transitions.
- `npm run build` passes; `/portfolio/sundial/` prerenders. The dial and visitor clock must not cause hydration mismatches: render a neutral state on the server and fill in on mount.
- No em-dashes in visible text.
