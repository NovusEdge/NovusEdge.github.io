# Text != Tone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `src/content/blog/text-is-not-tone.md` on its own bespoke page: a playable list of seven stressed readings that folds into one typed line, four silent looping figures, and a dark closing stage that runs into the site footer.

**Architecture:** A new early return in `src/routes/blog/post.tsx` renders `TextTonePage`. The page runs its own `ReactMarkdown`, which swaps six `{{placeholder}}` paragraphs for figure components. Figures are React-rendered DOM animated with GSAP inside `useGSAP`; a motion-mode context (pending, full, reduced) keeps prerendered markup identical to the first client render. Stage data is a static JSON import.

**Tech Stack:** React 19, react-router, react-i18next, react-markdown 10, GSAP 3.15 (ScrollTrigger, DrawSVG, MorphSVG, CustomEase) with `@gsap/react`, lucide-react, Vitest, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-15-text-is-not-tone-design.md`. The approved mock is `docs/superpowers/specs/2026-11-15-text-is-not-tone/mock-a7.html`; tasks port its code by line number.

## Global Constraints

- Package manager is pnpm. The pre-commit hook runs `pnpm tsc --noEmit && pnpm test && pnpm i18n:check`; a commit that fails it is not done.
- Commit with `git commit -s`. No `Co-Authored-By` line, no AI attribution, no em-dashes in commit messages.
- Never stage `vite.config.ts`, anything under `src/routes/privacy/`, or the privacy-route lines of `src/App.tsx`. Those belong to paused work that shares the working tree. Stage files by name, never `git add -A` or `git add .`.
- Change files with the Read, Edit and Write tools, not `sed -i`, heredocs or `cat >`.
- Every class name on this page starts with `tt-`, and every rule in `text-tone.css` is scoped under `.tt` (or `.tone-night` for the html-level rule in `global.css`). Tailwind owns short names like `static`, so an unprefixed class can collide.
- No `position: fixed` anywhere in the page and no ScrollTrigger `pin`: the `.page-enter` wrapper keeps a transform.
- Nothing calls `prefersReducedMotion()` during render. Components read the motion mode from `useMotion()`.
- No SplitText, no anime.js. React renders word and character spans.
- Icons come from `lucide-react`. No typed arrows or glyphs.
- Comments only carry facts the code cannot show: why, a constraint from outside the file, a bug it prevents. No paraphrase, no section banners.
- English-only content: the example sentence, its clips, the pinyin, the transliterations and the Chinese and Arabic script. Every other visible or spoken string goes through `t('blog.textTone.*')`.

## Review Focus

1. A reader taps row A, then row B before A's clip has loaded. Only B plays. (Test in Task 5, `clips.test.ts`.)
2. A reader scrolls into the fold while a row is playing. Playback stops at once and the rows cannot be tapped while they move. (Browser check in Task 10.)
3. A reader navigates away mid-clip or mid-loop. Audio stops, `tone-night` leaves `<html>`, the footer is charcoal again, and the next page logs no GSAP errors. (Browser check in Task 10.)
4. A reader opens `/zh/` or `/ja/`. Han in the translated prose is not wrapped in `lang="zh-Hans"` spans, so it keeps the locale's body face; Arabic is still wrapped right-to-left. (Test in Task 3, `markdown.test.tsx`.)
5. The Arabic font is blocked or slow. The harakat figure shows its static layout instead of a broken overlay, and the list's traces still draw once the font wait times out. (Browser check in Task 10, by blocking `fonts.gstatic.com`.)

---

### Task 1: Branch and commit the existing material

**Files:** none changed; this commits what earlier sessions left uncommitted.

- [ ] **Step 1: Branch**

```bash
git switch -c text-is-not-tone
```

- [ ] **Step 2: Stage the text-is-not-tone material by name**

```bash
git add .docket/ledger.jsonl src/content/thumbnails.json src/content/blog/text-is-not-tone.md \
  public/assets/blog/text-is-not-tone-thumb.webp public/assets/blog/didnt-say \
  scripts/generate-stress-clips.mjs scripts/extract-stress-pitch.py \
  docs/superpowers/specs/2026-11-15-text-is-not-tone-design.md docs/superpowers/specs/2026-11-15-text-is-not-tone \
  docs/superpowers/plans/2026-11-15-text-is-not-tone.md
git status --short
```

Expected: the staged list shows only the paths above. ` M src/App.tsx`, ` M vite.config.ts` and `?? src/routes/privacy/` stay unstaged.

- [ ] **Step 3: Commit**

```bash
git commit -s -m "Add the Text != Tone draft, its clips, spec and plan"
```

---

### Task 2: Stage data

**Files:**
- Modify: `scripts/extract-stress-pitch.py`, `scripts/generate-stress-clips.mjs`
- Move: `public/assets/blog/didnt-say/*.align.json` to `scripts/stress-align/`
- Create: `src/data/text-tone-stage.json` (generated)
- Delete: `public/assets/blog/didnt-say/stage.json`
- Create: `src/components/text-tone/stage-data.ts`, `src/components/text-tone/stage-data.test.ts`
- Modify: `docs/superpowers/specs/2026-11-15-text-is-not-tone/mock-a7.html:462`

**Interfaces:**
- Produces: `SENTENCE: string`, `READINGS: Reading[]`, `STRESSED: Reading[]` (seven, sentence order), `FLAT: Reading`, `clipUrl(src: string): string`, `clipKey(r: Reading): string` (`'i'`, `'didnt'`, …), `contour(r: Reading): Point[][]`, `ramp(anchors: [number, number][]): (t: number) => number`, `penEase(pts: TracePoint[]): (p: number) => number`; types `Word`, `Reading`, `Point = { t: number; h: number }`, `TracePoint = { t: number; x: number; y: number }`.

- [ ] **Step 1: Save the expected output before anything moves**

```bash
S=/tmp/claude-1000/-home-novusedge-Projects-Personal-NovusEdge-github-io/09a04afe-2533-44be-85bb-3f98d71ac79b/scratchpad
jq -c 'map(del(.loop) | .words |= map(del(.f0max, .dbmax)))' public/assets/blog/didnt-say/stage.json > $S/expected-stage.json
```

- [ ] **Step 2: Move the alignment files**

```bash
mkdir -p scripts/stress-align
git mv public/assets/blog/didnt-say/*.align.json scripts/stress-align/
```

- [ ] **Step 3: Update `scripts/generate-stress-clips.mjs`**

Read the file. Add `const ALIGN = 'scripts/stress-align'` beside `const OUT = 'public/assets/blog/didnt-say'` (line 14), and change the align write (line 72) to `` writeFileSync(`${ALIGN}/${clip.name}.align.json`, …) ``. If the script checks for existing align files anywhere else, point that check at `ALIGN` too. MP3s stay in `OUT`. Update the header comment if it names the align location.

- [ ] **Step 4: Update `scripts/extract-stress-pitch.py`**

Make these edits, keeping everything else:

```python
# Measures pitch and per-word timing in the clips from generate-stress-clips.mjs
# and writes src/data/text-tone-stage.json, which the text-is-not-tone page imports.
# Run: uv run --no-project --with praat-parselmouth python scripts/extract-stress-pitch.py
```

```python
CLIPS = Path("public/assets/blog/didnt-say")
ALIGN = Path("scripts/stress-align")
OUT = Path("src/data/text-tone-stage.json")
WORDS = ["I", "didn't", "say", "she", "stole", "the", "money"]
# (stressed word, clip name); None is the flat reading.
STAGE = [("I", "i"), ("didn't", "didnt"), ("say", "say"), ("she", "she"),
         ("stole", "stole"), ("the", "the"), ("money", "money"), (None, "flat")]
```

In `measure()`: read the align file from `ALIGN`, the mp3 from `CLIPS`, drop the intensity (`loud`, `db`) computation, and emit words as `{"word": word, "start": round(a, 3), "end": round(b, 3)}`. Remove `import math` if nothing else uses it. The last lines become:

```python
stage = [{"stress": word, "src": f"{name}.mp3", **measure(name)} for word, name in STAGE]
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(stage, separators=(",", ":")))
print("\n".join(f'{c["src"]:10} {c["duration"]}s' for c in stage))
```

- [ ] **Step 5: Regenerate and compare**

```bash
uv run --no-project --with praat-parselmouth python scripts/extract-stress-pitch.py
jq -c . src/data/text-tone-stage.json | diff - $S/expected-stage.json && echo SAME
git rm public/assets/blog/didnt-say/stage.json
```

Expected: eight lines from the script, then `SAME`. If `uv` or `ffmpeg` is missing, stop and report; do not hand-write the JSON.

- [ ] **Step 6: Point the mock at the new file**

In `docs/superpowers/specs/2026-11-15-text-is-not-tone/mock-a7.html:462`, change `fetch('/public/assets/blog/didnt-say/stage.json')` to `fetch('/src/data/text-tone-stage.json')`. The mock reads none of the removed fields.

- [ ] **Step 7: Write the failing test** `src/components/text-tone/stage-data.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { FLAT, READINGS, SENTENCE, STRESSED, clipKey, contour, ramp } from './stage-data'

const WORDS = SENTENCE.split(' ')

describe('stage data', () => {
  it('has the seven stressed readings in sentence order, then the flat one', () => {
    expect(STRESSED.map((r) => r.stress)).toEqual(WORDS)
    expect(READINGS).toHaveLength(8)
    expect(FLAT.src).toBe('flat.mp3')
    expect(STRESSED.map(clipKey)).toEqual(['i', 'didnt', 'say', 'she', 'stole', 'the', 'money'])
  })

  it('times every word of every reading, in order, inside the clip', () => {
    for (const r of READINGS) {
      expect(r.words.map((w) => w.word)).toEqual(WORDS)
      r.words.forEach((w, i) => {
        expect(w.end).toBeGreaterThan(w.start)
        if (i) expect(w.start).toBeGreaterThanOrEqual(r.words[i - 1].start)
      })
      expect(r.words.at(-1)!.end).toBeLessThanOrEqual(r.duration)
    }
  })

  it('turns each reading into voiced strokes within the trace height', () => {
    for (const r of READINGS) {
      const strokes = contour(r)
      expect(strokes.length).toBeGreaterThan(0)
      for (const g of strokes) {
        expect(g.length).toBeGreaterThan(2)
        for (const p of g) expect(Math.abs(p.h)).toBeLessThanOrEqual(1.3)
      }
    }
  })

  it('maps time through word anchors and clamps outside them', () => {
    const x = ramp([[0, 0], [1, 10], [2, 30]])
    expect([x(-1), x(0.5), x(1.5), x(5)]).toEqual([0, 5, 20, 30])
  })
})
```

- [ ] **Step 8: Run it to see it fail**

Run: `pnpm vitest run src/components/text-tone/stage-data.test.ts`
Expected: FAIL, cannot resolve `./stage-data`.

- [ ] **Step 9: Write `src/components/text-tone/stage-data.ts`**

```ts
import raw from '../../data/text-tone-stage.json'

export type Word = { word: string; start: number; end: number }
export type Reading = { stress: string | null; src: string; duration: number; words: Word[]; f0: [number, number][] }
export type Point = { t: number; h: number }
export type TracePoint = { t: number; x: number; y: number }

export const SENTENCE = "I didn't say she stole the money"
export const READINGS = raw as unknown as Reading[]
export const STRESSED = READINGS.filter((r) => r.stress !== null)
export const FLAT = READINGS.find((r) => r.stress === null)!
export const clipUrl = (src: string) => `/assets/blog/didnt-say/${src}`
// The i18n keys for the meanings are the clip names.
export const clipKey = (r: Reading) => r.src.replace(/\.mp3$/, '')

// f0 as semitones about the clip's own median, 9 semitones to full height. Normalising to each clip's
// range would draw the flat reading as tall as the stressed ones. Points more than 13 semitones out are
// octave errors from the tracker; gaps over 90 ms are unvoiced.
export function contour(r: Reading): Point[][] {
  const s = r.f0.map(([t, hz]) => [t, 12 * Math.log2(hz)] as const)
  const med = s.map((p) => p[1]).sort((a, b) => a - b)[s.length >> 1]
  const pts = s.filter((p) => Math.abs(p[1] - med) < 13).map(([t, v]) => ({ t, h: (v - med) / 9 }))
  const segs: Point[][] = [[]]
  pts.forEach((p, i) => {
    if (i && p.t - pts[i - 1].t > 0.09) segs.push([])
    segs.at(-1)!.push(p)
  })
  const at = (g: Point[], i: number) => g[Math.min(g.length - 1, Math.max(0, i))].h
  return segs
    .filter((g) => g.length > 2)
    .map((g) => g.map((p, i) => ({ t: p.t, h: Math.max(-1.3, Math.min(1.3, (at(g, i - 2) + at(g, i - 1) + p.h + at(g, i + 1) + at(g, i + 2)) / 5)) })))
}

export function ramp(a: [number, number][]) {
  return (t: number) => {
    if (t <= a[0][0]) return a[0][1]
    for (let i = 1; i < a.length; i++) {
      if (t <= a[i][0]) return a[i - 1][1] + ((a[i][1] - a[i - 1][1]) * (t - a[i - 1][0])) / (a[i][0] - a[i - 1][0] || 1)
    }
    return a.at(-1)![1]
  }
}

// DrawSVG draws by length; this ease turns playback time into drawn length so the pen stays under the sound.
export function penEase(pts: TracePoint[]) {
  const L = [0]
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
  const t0 = pts[0].t
  const span = pts.at(-1)!.t - t0
  return (p: number) => {
    const t = t0 + p * span
    let i = 1
    while (i < pts.length - 1 && pts[i].t < t) i++
    const f = Math.min(1, Math.max(0, (t - pts[i - 1].t) / (pts[i].t - pts[i - 1].t || 1)))
    return (L[i - 1] + (L[i] - L[i - 1]) * f) / L.at(-1)!
  }
}
```

- [ ] **Step 10: Run the test**

Run: `pnpm vitest run src/components/text-tone/stage-data.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 11: Commit**

```bash
git add scripts/extract-stress-pitch.py scripts/generate-stress-clips.mjs scripts/stress-align \
  src/data/text-tone-stage.json src/components/text-tone/stage-data.ts src/components/text-tone/stage-data.test.ts \
  docs/superpowers/specs/2026-11-15-text-is-not-tone/mock-a7.html
git add -u public/assets/blog/didnt-say
git commit -s -m "Move the stress stage data into src and type it"
```

---

### Task 3: Markdown renderer and post placeholders

**Files:**
- Create: `src/components/text-tone/markdown.tsx`, `src/components/text-tone/markdown.test.tsx`
- Modify: `src/content/blog/text-is-not-tone.md`

**Interfaces:**
- Produces: `TextToneMarkdown({ children: string; figures: Record<string, ReactNode>; locale: string }): JSX.Element`. `locale` is the content locale code (`'en'`, `'zh'`, …). Renders `<span class="tt-n">` for `[text](#stat)`.

- [ ] **Step 1: Write the failing test** `src/components/text-tone/markdown.test.tsx`

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TextToneMarkdown } from './markdown'

const figures = { tones: <div data-fig="tones" />, stress_list: <div data-fig="stress_list" /> }
const render = (md: string, locale = 'en') =>
  renderToStaticMarkup(<TextToneMarkdown figures={figures} locale={locale}>{md}</TextToneMarkdown>)

describe('TextToneMarkdown', () => {
  it('renders a paragraph that is exactly a placeholder as its figure', () => {
    const html = render('before\n\n{{tones}}\n\nafter')
    expect(html).toContain('<div data-fig="tones"></div>')
    expect(html).not.toContain('{{tones}}')
  })

  it('reads an underscored placeholder as one token, not emphasis', () => {
    expect(render('{{stress_list}}')).toContain('data-fig="stress_list"')
  })

  it('leaves a placeholder inside other text, or an unknown one, as prose', () => {
    expect(render('see {{tones}} here')).toContain('<p>see {{tones}} here</p>')
    expect(render('{{nope}}')).toContain('<p>{{nope}}</p>')
  })

  it('renders a #stat link as a stat span with no link', () => {
    const html = render('about [52 words a minute](#stat) today')
    expect(html).toContain('<span class="tt-n">52 words a minute</span>')
    expect(html).not.toContain('href="#stat"')
  })

  it('adds the trailing slash to internal links', () => {
    expect(render('[flocc](/portfolio/flocc)')).toContain('href="/portfolio/flocc/"')
  })

  it('marks Arabic runs right-to-left in every locale', () => {
    for (const locale of ['en', 'zh']) {
      expect(render('so كتب is', locale)).toContain('<span lang="ar" dir="rtl">كتب</span>')
    }
  })

  it('marks Han runs, the poem comma included, except where Han is the body text', () => {
    expect(render('opens with 石室诗士施氏，嗜狮 (x)')).toContain('<span lang="zh-Hans">石室诗士施氏，嗜狮</span>')
    expect(render('is 妈, mother', 'zh')).not.toContain('lang="zh-Hans"')
    expect(render('is 妈, mother', 'ja')).not.toContain('lang="zh-Hans"')
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run src/components/text-tone/markdown.test.tsx`
Expected: FAIL, cannot resolve `./markdown`.

- [ ] **Step 3: Write `src/components/text-tone/markdown.tsx`**

```tsx
import { Children, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { withSlash } from '../../i18n/paths'
import { headingId } from '../../lib/blog-headings'

const PLACEHOLDER = /^\{\{(\w+)\}\}$/
const ARABIC = /[؀-ۿ]/
// Han plus the fullwidth comma inside the poem line.
const RUNS = { all: /([؀-ۿ]+|[㐀-鿿，]+)/, arabic: /([؀-ۿ]+)/ }

// zh and ja set their whole body in Han, so only other locales mark Han runs; Arabic is marked everywhere.
function markScripts(children: ReactNode, han: boolean): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== 'string') return child
    return child.split(han ? RUNS.all : RUNS.arabic).map((part, i) =>
      i % 2 === 0 ? part : ARABIC.test(part) ? (
        <span key={i} lang="ar" dir="rtl">{part}</span>
      ) : (
        <span key={i} lang="zh-Hans">{part}</span>
      ),
    )
  })
}

export function TextToneMarkdown({ children, figures, locale }: { children: string; figures: Record<string, ReactNode>; locale: string }) {
  const han = locale !== 'zh' && locale !== 'ja'
  const components: Components = {
    p({ node, children: kids }) {
      const first = node?.children.length === 1 ? node.children[0] : undefined
      const name = first?.type === 'text' ? PLACEHOLDER.exec(first.value.trim())?.[1] : undefined
      if (name && name in figures) return <>{figures[name]}</>
      return <p>{markScripts(kids, han)}</p>
    },
    a({ href, children: kids }) {
      if (href === '#stat') return <span className="tt-n">{kids}</span>
      return <a href={href && withSlash(href)}>{kids}</a>
    },
    h2({ children: kids }) {
      return <h2 id={headingId(String(kids))}>{kids}</h2>
    },
  }
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  )
}
```

- [ ] **Step 4: Run the test**

Run: `pnpm vitest run src/components/text-tone/markdown.test.tsx`
Expected: PASS, 7 tests. If the Han test fails because `Children.map` re-keys the spans, compare against the rendered HTML, not React keys; the markup is what matters.

- [ ] **Step 5: Edit the post** `src/content/blog/text-is-not-tone.md`

Make only these changes; the prose is approved and stays word for word.

1. Frontmatter: add `pixel: thinking` on its own line after `draft: true`.
2. Replace the seven list lines (`- **I** didn't say…` through `- I didn't say she stole the **money**. She took something else.`) with one paragraph: `{{stress_list}}`.
3. After the paragraph starting "Now type it.", add a blank line and `{{typed_line}}` as its own paragraph.
4. After the paragraph starting "Then there's interrupting.", add `{{forty_sheets}}`.
5. After the paragraph starting "In Mandarin, pitch is part of the word itself.", add `{{tones}}`.
6. After the paragraph starting "Arabic goes the other way.", add `{{harakat}}`.
7. After the paragraph starting "The biggest typing study I could find", add `{{rate_cards}}`.
8. Mark the stats as `#stat` links, text unchanged: `about [89%](#stat) of the time`, `it landed about [63%](#stat)`, `about [39 bits a second](#stat)`, `was [52 words a minute](#stat)`, `about [1 token a second](#stat)`, `around [150 words a minute](#stat)`, `a bit over [3 tokens a second](#stat)`, `at [50 to 200 tokens a second](#stat)`, `got [59%](#stat)`, `got [78%](#stat)`, `People got [93%](#stat)`.

Every placeholder sits alone, with a blank line above and below.

- [ ] **Step 6: Check the edit**

```bash
grep -c '^{{[a-z_]*}}$' src/content/blog/text-is-not-tone.md   # 6
grep -o '](#stat)' src/content/blog/text-is-not-tone.md | wc -l  # 11
git diff --word-diff src/content/blog/text-is-not-tone.md | grep -v '#stat\|{{\|pixel' | grep '\[-\|{+' # no output
```

The last command lists any change that is not a placeholder, stat marker or the pixel line, apart from the removed list; the removed list lines are expected.

- [ ] **Step 7: Commit**

```bash
git add src/components/text-tone/markdown.tsx src/components/text-tone/markdown.test.tsx src/content/blog/text-is-not-tone.md
git commit -s -m "Render the Text != Tone figures from placeholders in the post"
```

---

### Task 4: UI strings in every locale

**Files:**
- Modify: `src/i18n/locales/en.json` and, by running the translator, `de.json`, `fi.json`, `ja.json`, `sv.json`, `zh.json`, plus the translator's lock file (whatever `git status` shows it wrote).

**Interfaces:**
- Produces: the `blog.textTone.*` keys below. Later tasks call them by these exact names.

- [ ] **Step 1: Add the English strings**

Insert after `"blog.meaning.soundOn"` in `src/i18n/locales/en.json`:

```json
  "blog.textTone.back": "back to blog",
  "blog.textTone.englishOnly": "This example only works in English, so it stays in English.",
  "blog.textTone.rowLabel": "Play: {{sentence}}, stressed on {{word}}. {{meaning}}",
  "blog.textTone.flatLabel": "Play: {{sentence}}, typed, with no stress",
  "blog.textTone.meaning.i": "Someone else said it.",
  "blog.textTone.meaning.didnt": "Flat denial.",
  "blog.textTone.meaning.say": "I might have hinted at it though.",
  "blog.textTone.meaning.she": "Someone else did.",
  "blog.textTone.meaning.stole": "Maybe she just borrowed it.",
  "blog.textTone.meaning.the": "She took some money, just not <i>that</i> money.",
  "blog.textTone.meaning.money": "She took something else.",
  "blog.textTone.pause": "Pause animation",
  "blog.textTone.sheetsLabel": "Forty files, twice. Spoken, \"no wait, not that\" stops the run after four files. Typed, the same words wait until all forty are changed.",
  "blog.textTone.spoken": "spoken",
  "blog.textTone.typed": "typed",
  "blog.textTone.noWait": "no wait, not that",
  "blog.textTone.changed": "{{n}} of 40 changed",
  "blog.textTone.tonesLabel": "Four Mandarin words, each with its tone drawn as a pitch line: mā, flat and high, mother; má, rising, hemp; mǎ, dipping, horse; mà, falling, to scold. Then the tones are removed: the four lines go flat and the four words become one syllable, ma. The poem line does the same and becomes shi twelve times.",
  "blog.textTone.mother": "mother",
  "blog.textTone.hemp": "hemp",
  "blog.textTone.horse": "horse",
  "blog.textTone.toScold": "to scold",
  "blog.textTone.harakatLabel": "The Arabic letters k-t-b written four times without vowels. The vowel marks fade in on three of them, giving kataba, he wrote; kutiba, it was written; and kutub, books. Then the marks fade out and all four are the same bare word again.",
  "blog.textTone.asWritten": "as written",
  "blog.textTone.heWrote": "he wrote",
  "blog.textTone.itWasWritten": "it was written",
  "blog.textTone.books": "books",
  "blog.textTone.ratesLabel": "Tokens per second as holes punched in cards. Typing punches about one hole a second, speaking about three, and a model fills a hundred-hole card every second.",
  "blog.textTone.typing": "typing",
  "blog.textTone.speaking": "speaking",
  "blog.textTone.aModel": "a model",
  "blog.textTone.typingWpm": "52 words a minute",
  "blog.textTone.typingTps": "about 1 token a second",
  "blog.textTone.speakingWpm": "150 words a minute",
  "blog.textTone.speakingTps": "about 3 tokens a second",
  "blog.textTone.modelTps": "50 to 200 tokens a second",
  "blog.textTone.shownAt": "shown at 100",
  "blog.textTone.clock": "one hole, one token · {{s}} s",
  "blog.textTone.stageLabel": "The typed sentence on a flat line. The line bends back into a horizon, the light comes up and layers of cut paper rise under it, then it goes flat again.",
```

- [ ] **Step 2: See the catalog test fail**

Run: `pnpm vitest run src/i18n/catalogs.test.ts`
Expected: FAIL, "carries exactly the English key set" for five locales.

- [ ] **Step 3: Translate**

Run: `pnpm i18n:translate`
Expected: the script translates the new keys into five locales. It needs `GEMINI_API_KEY` from `.env`; if it fails for lack of a key or network, stop and report.

- [ ] **Step 4: Check the translations**

```bash
pnpm vitest run src/i18n/catalogs.test.ts && pnpm i18n:check
for l in de fi ja sv zh; do jq -r '."blog.textTone.meaning.the", ."blog.textTone.rowLabel"' src/i18n/locales/$l.json; done
```

Expected: tests pass, the check passes, and each `meaning.the` keeps an `<i>…</i>` pair (if a locale dropped it, add the tags around the word that means "that" by hand) and each `rowLabel` keeps `{{sentence}}`, `{{word}}` and `{{meaning}}`.

- [ ] **Step 5: Commit**

```bash
git status --short src/i18n scripts   # find the lock file the translator wrote
git add src/i18n/locales/*.json <lock file from the line above>
git commit -s -m "Add the Text != Tone UI strings in every locale"
```

---

### Task 5: Page shell, motion mode, fonts and audio

**Files:**
- Create: `src/components/text-tone/loop-pause.tsx`, `src/components/text-tone/fonts.ts`, `src/components/text-tone/clips.ts`, `src/components/text-tone/clips.test.ts`, `src/components/text-tone/text-tone.css`, `src/routes/blog/text-tone-page.tsx`
- Modify: `src/routes/blog/post.tsx`, `src/styles/global.css`, `src/main.tsx`, `src/App.tsx` (one line, staged alone)

**Interfaces:**
- Consumes: `TextToneMarkdown` (Task 3), `clipUrl` (Task 2), `blog.textTone.back`, `blog.textTone.pause` (Task 4).
- Produces:
  - `loop-pause.tsx`: `type MotionMode = 'pending' | 'full' | 'reduced'`; `MotionContext`; `useMotion(): MotionMode`; `useMotionMode(): MotionMode`; `onWidthChange(fn: () => void): () => void`; `useLoop(host: RefObject<HTMLElement | null>, build: () => gsap.core.Timeline, ready?: boolean): { paused: boolean; toggle: () => void; running: boolean }`; `PauseButton({ paused, onToggle })`. Importing it registers ScrollTrigger, DrawSVG, MorphSVG, CustomEase and the eases `okOut`, `okInOut`, `okLift`.
  - `fonts.ts`: `FONT_LINKS: string[]`, `fontLinkId(i: number): string`, `ensureFontLinks(): Promise<void>`, `whenFonts(faces: [font: string, text?: string][], ms?: number): Promise<boolean>`.
  - `clips.ts`: `createClips(load?, makeContext?)` and the page singleton `clips` with `unlock()`, `buffer(src)`, `play(key: object, src: string, onStart: () => void, onEnd: () => void): Promise<void>`, `stop(): void`, `close(): void`.
  - `text-tone-page.tsx`: `TextTonePage({ post, image })` with a `FIGURES` map that later tasks extend.

- [ ] **Step 1: Write the failing audio test** `src/components/text-tone/clips.test.ts`

```ts
import { describe, expect, it, vi } from 'vitest'
import { createClips } from './clips'

function fakeContext() {
  const started: string[] = []
  const ctx = {
    resume: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    decodeAudioData: vi.fn(async (b: ArrayBuffer) => ({ length: b.byteLength }) as unknown as AudioBuffer),
    destination: {} as AudioDestinationNode,
    createBufferSource: vi.fn(() => {
      const node = {
        buffer: null as AudioBuffer | null,
        onended: null as (() => void) | null,
        connect: vi.fn(),
        start: vi.fn(() => started.push(String((node.buffer as unknown as { length: number }).length))),
        stop: vi.fn(),
      }
      return node as unknown as AudioBufferSourceNode
    }),
  }
  return { ctx, started }
}

const ok = (bytes: number) => Promise.resolve(new Response(new ArrayBuffer(bytes)))

describe('clips', () => {
  it('fetches a clip again after a failed load', async () => {
    const { ctx } = fakeContext()
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockImplementation(() => ok(8))
    const c = createClips(load, () => ctx)
    c.unlock()
    await expect(c.buffer('i.mp3')).rejects.toThrow('offline')
    await expect(c.buffer('i.mp3')).resolves.toBeDefined()
    expect(load).toHaveBeenCalledTimes(2)
    expect(load).toHaveBeenCalledWith('/assets/blog/didnt-say/i.mp3')
  })

  it('treats an HTTP error as a failed load', async () => {
    const { ctx } = fakeContext()
    const load = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 })).mockImplementation(() => ok(8))
    const c = createClips(load, () => ctx)
    c.unlock()
    await expect(c.buffer('i.mp3')).rejects.toThrow('404')
    await expect(c.buffer('i.mp3')).resolves.toBeDefined()
  })

  it('plays only the later of two taps when the first clip is still loading', async () => {
    const { ctx, started } = fakeContext()
    let release!: () => void
    const slow = new Promise<Response>((done) => (release = () => done(new Response(new ArrayBuffer(1)))))
    const load = vi.fn((url: string) => (url.endsWith('i.mp3') ? slow : ok(2)))
    const c = createClips(load, () => ctx)
    const a = {}, b = {}
    const first = c.play(a, 'i.mp3', vi.fn(), vi.fn())
    const second = c.play(b, 'say.mp3', vi.fn(), vi.fn())
    await second
    release()
    await first
    expect(started).toEqual(['2'])
  })

  it('stops the playing clip when the same key taps again, and calls its onEnd', async () => {
    const { ctx } = fakeContext()
    const c = createClips(() => ok(4), () => ctx)
    const key = {}, onEnd = vi.fn()
    await c.play(key, 'i.mp3', vi.fn(), onEnd)
    await c.play(key, 'i.mp3', vi.fn(), vi.fn())
    expect(onEnd).toHaveBeenCalledOnce()
    expect(ctx.createBufferSource).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run src/components/text-tone/clips.test.ts`
Expected: FAIL, cannot resolve `./clips`.

- [ ] **Step 3: Write `src/components/text-tone/clips.ts`**

```ts
import { clipUrl } from './stage-data'

type Ctx = Pick<AudioContext, 'resume' | 'close' | 'decodeAudioData' | 'createBufferSource' | 'destination'>
type Playing = { key: object; node: AudioBufferSourceNode; onEnd: () => void }

export function createClips(
  load: (url: string) => Promise<Response> = (url) => fetch(url),
  makeContext: () => Ctx = () => new AudioContext(),
) {
  let ctx: Ctx | null = null
  let current: Playing | null = null
  let seq = 0
  const cache = new Map<string, Promise<AudioBuffer>>()

  const api = {
    // Safari unlocks audio only inside the gesture, so this runs at the top of a tap, before any await.
    unlock() {
      ctx ??= makeContext()
      ctx.resume().catch(() => {})
      return ctx
    },
    buffer(src: string) {
      let p = cache.get(src)
      if (!p) {
        const c = ctx ?? api.unlock()
        p = load(clipUrl(src))
          .then((r) => {
            if (!r.ok) throw new Error(`${src}: ${r.status}`)
            return r.arrayBuffer()
          })
          .then((b) => c.decodeAudioData(b))
        cache.set(src, p)
        // A failed load is dropped, so the next tap fetches again.
        p.catch(() => cache.delete(src))
      }
      return p
    },
    // One clip at a time across the page. A tap on the playing key stops it; a tap that loses the
    // race to a later tap while its clip loads never starts.
    async play(key: object, src: string, onStart: () => void, onEnd: () => void) {
      const c = api.unlock()
      const again = current?.key === key
      api.stop()
      if (again) return
      const mine = ++seq
      let buf: AudioBuffer
      try {
        buf = await api.buffer(src)
      } catch {
        return
      }
      if (mine !== seq) return
      const node = c.createBufferSource()
      node.buffer = buf
      node.connect(c.destination)
      node.start()
      const me: Playing = { key, node, onEnd }
      current = me
      node.onended = () => current === me && api.stop()
      onStart()
    },
    stop() {
      const me = current
      current = null
      if (!me) return
      me.node.onended = null
      try {
        me.node.stop()
      } catch {
        // already ended
      }
      me.onEnd()
    },
    close() {
      seq++
      api.stop()
      ctx?.close().catch(() => {})
      ctx = null
      cache.clear()
    },
  }
  return api
}

export const clips = createClips()
```

- [ ] **Step 4: Run the audio test**

Run: `pnpm vitest run src/components/text-tone/clips.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write `src/components/text-tone/fonts.ts`**

```ts
const CJK = '妈麻马骂石室诗士施氏嗜狮誓食十，'

// Only what this page sets beyond the global request in index.html (Spectral 400/600/italic 400,
// Plex Mono upright). Spectral's latin-ext subset carries the pinyin tone marks.
export const FONT_LINKS = [
  'https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Spectral:ital,wght@0,700;1,500&family=IBM+Plex+Mono:ital,wght@1,500&display=swap',
  `https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500&text=${encodeURIComponent(CJK)}&display=swap`,
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@500&display=swap',
]
export const fontLinkId = (i: number) => `tt-font-${i}`

let links: Promise<void> | null = null

// Prerendered pages already carry these links in <head> (main.tsx); client navigation adds them here.
export function ensureFontLinks(): Promise<void> {
  links ??= Promise.all(
    FONT_LINKS.map((href, i) => {
      let el = document.getElementById(fontLinkId(i)) as HTMLLinkElement | null
      if (!el) {
        el = document.createElement('link')
        el.id = fontLinkId(i)
        el.rel = 'stylesheet'
        el.href = href
        document.head.appendChild(el)
      }
      if (el.sheet) return
      const link = el
      return new Promise<void>((done) => {
        link.addEventListener('load', () => done(), { once: true })
        link.addEventListener('error', () => done(), { once: true })
      })
    }),
  ).then(() => {})
  return links
}

// document.fonts.ready resolves at once while a stylesheet is still in flight, and fonts.load() finds
// no face before its stylesheet arrives, so this waits for the links first. False on timeout or failure.
export function whenFonts(faces: [font: string, text?: string][], ms = 3000): Promise<boolean> {
  if (typeof document === 'undefined') return Promise.resolve(false)
  const loaded = ensureFontLinks()
    .then(() => Promise.all(faces.map(([font, text]) => document.fonts.load(font, text))))
    .then(
      (sets) => sets.every((s) => s.length > 0),
      () => false,
    )
  return Promise.race([loaded, new Promise<boolean>((done) => setTimeout(() => done(false), ms))])
}
```

- [ ] **Step 6: Write `src/components/text-tone/loop-pause.tsx`**

```tsx
import { createContext, use, useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { prefersReducedMotion } from '../../lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, DrawSVGPlugin, MorphSVGPlugin)
if (typeof window !== 'undefined') {
  // One ease family for the page: okOut settles, okInOut travels, okLift overshoots a touch.
  CustomEase.create('okOut', '0.16, 1, 0.3, 1')
  CustomEase.create('okInOut', '0.76, 0, 0.24, 1')
  CustomEase.create('okLift', '0.3, 1.5, 0.5, 1')
}

export type MotionMode = 'pending' | 'full' | 'reduced'
export const MotionContext = createContext<MotionMode>('pending')
export const useMotion = () => use(MotionContext)

// prefersReducedMotion() is false during prerender, so it is read once after hydration. Until then
// every figure renders its motion markup without pause buttons, which is what the prerender emitted.
export function useMotionMode(): MotionMode {
  const [mode, setMode] = useState<MotionMode>('pending')
  useEffect(() => setMode(prefersReducedMotion() ? 'reduced' : 'full'), [])
  return mode
}

// Width only: the mobile URL bar changes the height on every scroll.
export function onWidthChange(fn: () => void) {
  let w = innerWidth
  const on = () => {
    if (innerWidth === w) return
    w = innerWidth
    fn()
  }
  addEventListener('resize', on)
  return () => removeEventListener('resize', on)
}

// A looping figure: built once `ready`, rebuilt on width change at the same time and paused state,
// paused while offscreen and while the reader has paused it.
export function useLoop(host: RefObject<HTMLElement | null>, build: () => gsap.core.Timeline, ready = true) {
  const mode = useMotion()
  const [paused, setPaused] = useState(false)
  const s = useRef({ tl: null as gsap.core.Timeline | null, user: false, vis: false })
  const apply = () => {
    const { tl, user, vis } = s.current
    if (tl) (user || !vis ? tl.pause() : tl.play())
  }
  useGSAP(
    (_, contextSafe) => {
      if (mode !== 'full' || !ready || !host.current) return
      const make = contextSafe!(() => {
        const t = s.current.tl?.time() ?? 0
        s.current.tl?.kill()
        s.current.tl = build().pause().time(t)
        apply()
      })
      make()
      ScrollTrigger.create({
        trigger: host.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (x) => {
          s.current.vis = x.isActive
          apply()
        },
      })
      const off = onWidthChange(make)
      return () => {
        off()
        s.current.tl = null
      }
    },
    { dependencies: [mode, ready], scope: host },
  )
  const toggle = () => {
    s.current.user = !s.current.user
    setPaused(s.current.user)
    apply()
  }
  return { paused, toggle, running: mode === 'full' && ready }
}

export function PauseButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  const { t } = useTranslation()
  const Icon = paused ? Play : Pause
  return (
    <button type="button" className="tt-pp" aria-label={t('blog.textTone.pause')} aria-pressed={paused} onClick={onToggle}>
      <Icon className="tt-ic" aria-hidden="true" />
    </button>
  )
}
```

- [ ] **Step 7: Write `src/routes/blog/text-tone-page.tsx`**

```tsx
import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft } from 'lucide-react'
import { TLink } from '../../components/page-transition'
import Magnetic from '../../components/react-bits/Magnetic'
import { PostSignoff } from '../../components/post-signoff'
import { TextToneMarkdown } from '../../components/text-tone/markdown'
import { MotionContext, useMotionMode } from '../../components/text-tone/loop-pause'
import { ensureFontLinks } from '../../components/text-tone/fonts'
import { clips } from '../../components/text-tone/clips'
import { Meta } from '../../lib/meta'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'
import '../../components/text-tone/text-tone.css'

const FIGURES: Record<string, ReactNode> = {}

export function TextTonePage({ post, image }: { post: Post; image?: string | null }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  const mode = useMotionMode()

  useEffect(() => {
    // The footer is App's, outside this page, so its night background hangs off <html>.
    const root = document.documentElement
    root.classList.add('tone-night')
    void ensureFontLinks()
    // .page-enter settles 0.5 s after mount; scroll positions measured before that are 14px off.
    const id = setTimeout(() => ScrollTrigger.refresh(), 600)
    return () => {
      root.classList.remove('tone-night')
      clearTimeout(id)
      clips.close()
    }
  }, [])

  const [before, after] = post.title.split('!=')
  const date = new Date(post.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <MotionContext value={mode}>
      <div className="tt" lang={post.contentLocale}>
        <Meta title={post.title} description={post.description || post.title} image={image} />
        <main className="tt-page">
          <div className="tt-col">
            <header className="tt-head">
              <Magnetic range={25}>
                <TLink
                  to={lp('/blog')}
                  className="group inline-flex items-center gap-2 rounded border border-charcoal/10 bg-bone-tint/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper-deep transition-colors hover:border-gold dark:border-bone/10 dark:bg-charcoal-tint/10 dark:text-paper dark:hover:border-gold"
                >
                  <ArrowLeft className="tt-ic transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                  {t('blog.textTone.back')}
                </TLink>
              </Magnetic>
              <h1>
                {after === undefined ? (
                  post.title
                ) : (
                  <>
                    {before.trim()} <span className="tt-ne">!=</span> {after.trim()}
                  </>
                )}
              </h1>
              <p className="tt-mono">
                <time dateTime={post.date}>{date}</time>
              </p>
            </header>
            <TextToneMarkdown figures={FIGURES} locale={post.contentLocale}>
              {post.content}
            </TextToneMarkdown>
            <PostSignoff variant={0} />
          </div>
        </main>
      </div>
    </MotionContext>
  )
}
```

- [ ] **Step 8: Write the base of `src/components/text-tone/text-tone.css`**

Port from `mock-a7.html` lines 17-37, 52-56, 83-87, 110-116, 125, 137-140 and 162, applying the global constraints (prefix `tt-`, scope under `.tt`). The result:

```css
.tt {
  --paper: #f3ecdd; --ink: #1f1d1a; --soft: #6f685c; --rule: #d3cab7; --card: #fbf7ec; --night: #0b0a09;
  --cream: #efe7d6; --gold: #d4a03c; --blue: #6b8cae; --coral: #e2573c;
  --link: #2f5f8f; --link-rule: #2f5f8f80; --mark: #8a3a1c;
  background: var(--night);
}
.dark .tt { --paper: #1a1917; --ink: #e9e2d3; --soft: #9a9283; --rule: #3a3732; --link: #a9c7e6; --link-rule: #a9c7e680; --mark: #f0a47c; }

.tt-page { position: relative; z-index: 1; background: var(--paper); color: var(--ink); font: 400 1.2rem/1.66 Spectral, Georgia, serif; box-shadow: 0 -18px 50px #000c, 0 18px 50px #000c; }
/* Absolute, not fixed: .page-enter keeps a transform, which makes fixed children absolute anyway. */
.tt-page::after, .tt-closing::after {
  content: ''; position: absolute; inset: 0; z-index: 5; pointer-events: none; opacity: .36;
  background: url(COPY THE data:image/svg+xml URL FROM mock-a7.html LINE 25 VERBATIM);
}
.tt-col { max-width: 56rem; margin: 0 auto; padding: 4.5rem 1.5rem 5rem; font-synthesis: none; }
.tt-col p { margin: 0 0 1.4em; }
.tt-col h2 { font: 700 2rem/1.15 Spectral, Georgia, serif; letter-spacing: -.012em; margin: 3.8rem 0 1.2rem; }
.tt-col em { font-style: italic; font-weight: 500; color: var(--mark); }
.tt-col strong { font-weight: 700; }
.tt-col p a { color: var(--link); text-decoration: underline; text-decoration-color: var(--link-rule); text-decoration-thickness: .09em; text-underline-offset: .2em; transition: text-decoration-color .15s, background-color .15s; }
.tt-col p a:hover, .tt-col p a:focus-visible { text-decoration-color: currentColor; text-decoration-thickness: .14em; background: color-mix(in srgb, var(--link) 12%, transparent); }
.tt-n { font: 500 .86em 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; white-space: nowrap; }
.tt-mono { font: 400 .76rem/1.45 'IBM Plex Mono', monospace; letter-spacing: .03em; }
.tt button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
.tt button:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }

.tt-head { margin-bottom: 3.2rem; color: var(--soft); }
.tt-head h1 { margin: 2.6rem 0 1.3rem; color: var(--ink); font: 400 clamp(3.3rem, 11.5vw, 8rem)/.98 'Instrument Serif', Georgia, serif; letter-spacing: -.02em; }
/* "!=" stays as typed: two characters in the mono, no ligature */
.tt-ne { font: 500 .62em 'IBM Plex Mono', monospace; font-variant-ligatures: none; letter-spacing: -.04em; color: var(--mark); vertical-align: .12em; margin: 0 .06em; }
.tt-head p { margin: 0; }

.tt-ic { width: 1em; height: 1em; flex: none; }
.tt-pp { position: absolute; right: .8rem; bottom: .8rem; z-index: 2; width: 2rem; height: 2rem; border-radius: 50%; opacity: .45; display: grid; place-items: center; }
.tt-pp:hover, .tt-pp:focus-visible { opacity: 1; background: color-mix(in srgb, currentColor 12%, transparent); }
.tt-pp:active { transform: scale(.92); }
.tt-pp .tt-ic { width: .95rem; height: .95rem; }
.tt-fig { margin: 3.2rem 0; position: relative; }
.tt-fig > .tt-pp { top: -.4rem; bottom: auto; right: -.3rem; color: var(--ink); }

/* Attribute selectors under .tt, never :lang(): on /zh/ the whole document is zh-Hans. */
.tt [lang="zh-Hans"] { font-family: 'Noto Serif SC', 'Songti SC', serif; font-weight: 500; }
.tt [lang="ar"] { font-family: 'Noto Naskh Arabic', 'Geeza Pro', serif; font-weight: 500; }
.tt-col p [lang="ar"] { font-size: 1.35em; line-height: 1; }

@media (max-width: 640px) { .tt-page { font-size: 1.08rem; } .tt-col h2 { font-size: 2.1rem; } }
```

Replace the `url(COPY …)` placeholder with the exact `url("data:image/svg+xml,…")` value from `mock-a7.html:25`.

- [ ] **Step 9: Route the post** in `src/routes/blog/post.tsx`

Add `import { TextTonePage } from './text-tone-page'` beside the other page imports, and after the `hello-world` early return:

```tsx
  // Typing keeps the words and drops the stress, so this page lets you hear the seven readings
  // before folding them into the one line a text box would send.
  if (post.slug === 'text-is-not-tone') return <TextTonePage post={post} image={image} />
```

- [ ] **Step 10: Footer rule** in `src/styles/global.css`

After the `.vg-space .site-footer` rule (around line 2535):

```css
.tone-night .site-footer { background-color: #0b0a09; }
```

- [ ] **Step 11: Prerendered font links** in `src/main.tsx`

After the `if (headState.lang === 'zh-Hans') { … }` block:

```ts
  if (stripLocale(pathname) === '/blog/text-is-not-tone') {
    const { FONT_LINKS, fontLinkId } = await import('./components/text-tone/fonts')
    FONT_LINKS.forEach((href, i) => elements.push({ type: 'link', props: { rel: 'stylesheet', id: fontLinkId(i), href } }))
  }
```

- [ ] **Step 12: Grain exclusion** in `src/App.tsx:75`

Change the line to:

```tsx
        {bare !== '/blog/plan-a-ai' && bare !== `/blog/${OPENJEV_SLUG}` && bare !== '/blog/text-is-not-tone' && <GrainShader />}
```

and update the comment above it to `{/* The paper pages carry their own grain, or none, so they skip the site's overlay. */}`.

- [ ] **Step 13: Check**

```bash
pnpm tsc --noEmit && pnpm test && pnpm build 2>&1 | tail -5
```

Expected: all pass. The build prerenders every route, which imports `loop-pause.tsx` under Node, so a module-scope crash shows here even though the post is still a draft. Then run `pnpm dev`, open `http://localhost:5173/blog/text-is-not-tone/` (drafts show under dev) and confirm: the title renders as "Text != Tone" with a mono "!=", the prose renders with visible `{{stress_list}}`-style paragraphs where figures will go (expected until Tasks 6-9), the footer is `#0b0a09`, there is no site grain, `<html>` has `tone-night`, and navigating to `/blog/` removes it. If a browser tool is not available to you, say so in your report instead of claiming the check.

- [ ] **Step 14: Commit, staging only the grain line of `App.tsx`**

`App.tsx` also holds the paused privacy route. Stage a copy of `HEAD`'s file with only the grain edit:

```bash
S=/tmp/claude-1000/-home-novusedge-Projects-Personal-NovusEdge-github-io/09a04afe-2533-44be-85bb-3f98d71ac79b/scratchpad
git show HEAD:src/App.tsx > $S/App.tsx
```

Apply the Step 12 edit to `$S/App.tsx` with the Edit tool, then:

```bash
git update-index --cacheinfo 100644,$(git hash-object -w $S/App.tsx),src/App.tsx
git diff --cached src/App.tsx   # only the grain line and its comment
git add src/components/text-tone/loop-pause.tsx src/components/text-tone/fonts.ts src/components/text-tone/clips.ts \
  src/components/text-tone/clips.test.ts src/components/text-tone/text-tone.css src/routes/blog/text-tone-page.tsx \
  src/routes/blog/post.tsx src/styles/global.css src/main.tsx
git commit -s -m "Add the Text != Tone page shell"
git diff src/App.tsx   # the privacy lines remain, unstaged
```

---

### Task 6: Stress list, typed line and the fold

**Files:**
- Create: `src/components/text-tone/stress-list.tsx`, `src/components/text-tone/stress-list.test.tsx`
- Modify: `src/components/text-tone/text-tone.css` (append), `src/routes/blog/text-tone-page.tsx` (`FIGURES`)

**Interfaces:**
- Consumes: `STRESSED`, `FLAT`, `SENTENCE`, `clipKey`, `contour`, `ramp`, `penEase`, `Reading` (Task 2); `clips` (Task 5); `whenFonts` (Task 5); `useMotion`, `onWidthChange` (Task 5); keys `blog.textTone.rowLabel`, `flatLabel`, `meaning.*`, `englishOnly` (Task 4).
- Produces: `StressList()`, `TypedLine()`.

- [ ] **Step 1: Write the failing test** `src/components/text-tone/stress-list.test.tsx`

```tsx
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { LocaleContext } from '../../i18n/context'
import { LOCALES } from '../../i18n/paths'
import { MotionContext, type MotionMode } from './loop-pause'
import { StressList, TypedLine } from './stress-list'

function render(node: ReactNode, mode: MotionMode = 'pending', code = 'en') {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor(code)}>
      <LocaleContext value={LOCALES.find((l) => l.code === code)!}>
        <MotionContext value={mode}>{node}</MotionContext>
      </LocaleContext>
    </I18nextProvider>,
  )
}

describe('StressList', () => {
  it('prerenders seven playable rows labelled with the stressed word and its meaning', () => {
    const html = render(<StressList />)
    expect(html.match(/<button/g)).toHaveLength(7)
    expect(html).toContain('stressed on she. Someone else did."')
    expect(html).toContain('<strong class="tt-em"><span class="tt-w">money</span></strong>.')
    expect(html).toContain('<span class="tt-w">money.</span>')
  })

  it('sets the italic in the sixth meaning and keeps it out of the label', () => {
    const html = render(<StressList />)
    expect(html).toContain('just not <em>that</em> money.')
    expect(html).toContain('just not that money."')
  })

  it('captions the example as English-only outside English', () => {
    expect(render(<StressList />)).not.toContain('tt-note')
    expect(render(<StressList />, 'pending', 'fi')).toContain('tt-note')
  })
})

describe('TypedLine', () => {
  it('renders only under reduced motion', () => {
    expect(render(<TypedLine />, 'pending')).toBe('')
    expect(render(<TypedLine />, 'full')).toBe('')
    expect(render(<TypedLine />, 'reduced')).toContain('typed, with no stress')
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run src/components/text-tone/stress-list.test.tsx`
Expected: FAIL, cannot resolve `./stress-list`.

- [ ] **Step 3: Write `src/components/text-tone/stress-list.tsx`**

The playback and fold are ports of `mock-a7.html:490-597`; the mapping is in the comments of this step, not in the code.

```tsx
import { Fragment, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Trans, useTranslation } from 'react-i18next'
import { Volume2 } from 'lucide-react'
import { useLocale } from '../../i18n/context'
import { clips } from './clips'
import { whenFonts } from './fonts'
import { onWidthChange, useMotion } from './loop-pause'
import { FLAT, SENTENCE, STRESSED, clipKey, contour, penEase, ramp, type Reading, type TracePoint } from './stage-data'

const WORDS = SENTENCE.split(' ')
const REST = { yPercent: -15, scale: 1.12, '--k': 1 }

type Row = {
  e: Reading
  b: HTMLButtonElement
  s: HTMLElement
  words: HTMLElement[]
  k: number
  em: HTMLElement
  g: HTMLElement
  tr: SVGSVGElement
  label: string
  strokes: TracePoint[][]
  paths: SVGPathElement[]
  tl?: gsap.core.Timeline
}

const plain = (s: string) => s.replace(/<\/?i>/g, '')

function useLabels() {
  const { t } = useTranslation()
  return {
    row: (r: Reading) =>
      t('blog.textTone.rowLabel', { sentence: SENTENCE, word: r.stress, meaning: plain(t(`blog.textTone.meaning.${clipKey(r)}`)) }),
    flat: t('blog.textTone.flatLabel', { sentence: SENTENCE }),
  }
}

function Sentence({ k }: { k: number }) {
  return WORDS.map((w, j) => {
    const last = j === WORDS.length - 1
    const word = <span className="tt-w">{last && j !== k ? `${w}.` : w}</span>
    return (
      <Fragment key={j}>
        {j > 0 && ' '}
        {j === k ? <strong className="tt-em">{word}</strong> : word}
        {last && j === k && '.'}
      </Fragment>
    )
  })
}

export function StressList() {
  const { t } = useTranslation()
  const locale = useLocale()
  const mode = useMotion()
  const labels = useLabels()
  const wrap = useRef<HTMLDivElement>(null)
  const playRef = useRef<(i: number) => void>(() => {})

  useGSAP(
    (_, contextSafe) => {
      if (mode === 'pending' || !wrap.current) return
      const list = wrap.current.querySelector<HTMLElement>('.tt-readings')!
      const rows: Row[] = [...list.querySelectorAll<HTMLButtonElement>('.tt-rd')].map((b, i) => ({
        e: STRESSED[i],
        b,
        s: b.querySelector<HTMLElement>('.tt-s')!,
        words: [...b.querySelectorAll<HTMLElement>('.tt-w')],
        k: i,
        em: b.querySelector<HTMLElement>('.tt-em')!,
        g: b.querySelector<HTMLElement>('.tt-g')!,
        tr: b.querySelector<SVGSVGElement>('.tt-tr')!,
        label: b.getAttribute('aria-label')!,
        strokes: [],
        paths: [],
      }))
      const last = rows.at(-1)!
      const para = wrap.current.nextElementSibling as HTMLElement | null
      let typed = false
      let instant = false
      let alive = true

      // A pitch trace under each line, laid out against that line's own words (mock 505-512).
      const trace = () =>
        rows.forEach((r) => {
          const sr = r.s.getBoundingClientRect()
          const H = r.tr.clientHeight || 18
          const x = ramp(
            r.e.words.flatMap((w, j) => {
              const wr = r.words[j].getBoundingClientRect()
              return [[w.start, wr.left - sr.left], [w.end, wr.right - sr.left]] as [number, number][]
            }),
          )
          r.strokes = contour(r.e).map((g) => g.map((p) => ({ t: p.t, x: x(p.t), y: H / 2 - (p.h / 1.3) * (H / 2 - 1.5) })))
          r.tr.setAttribute('viewBox', `0 0 ${sr.width} ${H}`)
          r.tr.innerHTML = r.strokes.map((g) => `<path d="M${g.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}"/>`).join('')
          r.paths = [...r.tr.querySelectorAll('path')]
        })

      // Back to how a row sits when nothing plays (mock 518-522).
      const settle = contextSafe!((r: Row) => {
        if (!alive || mode === 'reduced') return
        if (typed) return void gsap.set(r.words, { opacity: 1 })
        const duration = instant ? 0 : 0.3
        gsap.to(r.words, { opacity: (j: number) => (j === r.k ? 1 : 0.46), duration, overwrite: 'auto' })
        gsap.to(r.words[r.k], { ...REST, duration, ease: 'okOut', overwrite: 'auto' })
        gsap.set(r.paths, { drawSVG: '100%' })
      })

      // Every word brightens as it is spoken; the stressed one lifts when it starts (mock 541-547).
      const animate = contextSafe!((r: Row, e: Reading) => {
        if (mode === 'reduced') return
        const tl = (r.tl = gsap.timeline())
        tl.set(r.words, { opacity: 0.46 }, 0)
        if (e === FLAT) {
          e.words.forEach((w, j) => tl.to(r.words[j], { opacity: 1, duration: 0.16, ease: 'okOut' }, w.start))
          return
        }
        tl.set(r.words[r.k], { yPercent: 0, scale: 1, '--k': 0 }, 0)
        r.e.words.forEach((w, j) =>
          j === r.k
            ? tl.to(r.words[j], { ...REST, opacity: 1, duration: 0.42, ease: 'okLift' }, w.start)
            : tl.to(r.words[j], { opacity: 1, duration: 0.16, ease: 'okOut' }, w.start),
        )
        r.strokes.forEach((g, j) =>
          tl.fromTo(r.paths[j], { drawSVG: '0%' }, { drawSVG: '100%', duration: g.at(-1)!.t - g[0].t, ease: penEase(g) }, g[0].t),
        )
      })

      playRef.current = (i: number) => {
        const r = rows[i]
        void clips.play(
          r,
          (typed ? FLAT : r.e).src,
          () => {
            r.b.classList.add('tt-on')
            animate(r, typed ? FLAT : r.e)
          },
          () => {
            r.tl?.kill()
            r.b.classList.remove('tt-on')
            settle(r)
          },
        )
      }
      const stopNow = () => {
        instant = true
        clips.stop()
        instant = false
      }

      rows.forEach((r) => gsap.set(r.words[r.k], REST))

      let ctl: gsap.core.Timeline | undefined
      // The "typed" point, made by the list itself (mock 566-574).
      const setTyped = (p: number) => {
        if (p > 0.02 && !typed) stopNow()
        list.classList.toggle('tt-moving', p > 0.02 && p < 0.97)
        const t = p >= 0.97
        if (t === typed) return
        stopNow()
        typed = t
        list.classList.toggle('tt-typed', t)
        last.b.setAttribute('aria-label', t ? labels.flat : last.label)
        rows.slice(0, -1).forEach((r) => (r.b.inert = t))
      }

      // Port of mock 575-596. Reserved height, no pin: the list keeps its height and the rows move.
      const build = contextSafe!(() => {
        ctl?.scrollTrigger?.kill()
        ctl?.kill()
        stopNow()
        typed = false
        list.classList.remove('tt-typed', 'tt-moving')
        gsap.set(rows.flatMap((r) => [r.b, r.em, r.g, ...r.words]), { clearProps: 'transform,opacity,visibility,marginLeft,marginRight' })
        rows.forEach((r) => {
          gsap.set(r.words[r.k], REST)
          r.b.inert = false
        })
        last.b.setAttribute('aria-label', last.label)
        trace()
        if (!para) return
        const caret = last.s.querySelector('.tt-caret')!
        const H = last.tr.clientHeight || 18
        const top = last.b.getBoundingClientRect().top
        last.tr.insertAdjacentHTML('beforeend', `<path class="tt-rule" d="M0,${H / 2} L${last.s.getBoundingClientRect().width.toFixed(1)},${H / 2}"/>`)
        ctl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: para, start: 'top 68%', end: 'top 28%', scrub: 0.4, onUpdate: (st) => setTyped(st.progress) },
        })
        rows.forEach((r, i) => {
          const lag = i * 0.012
          ctl!
            .fromTo(r.words[r.k], REST, { yPercent: 0, scale: 1, '--k': 0, duration: 0.3, ease: 'okInOut' }, lag)
            .fromTo(r.em, { marginLeft: '.2em', marginRight: '.2em' }, { marginLeft: '0em', marginRight: '0em', duration: 0.3, ease: 'okInOut' }, lag)
            .fromTo(r.g, { opacity: 1 }, { opacity: 0, duration: 0.22 }, 0)
            .fromTo(r.words, { opacity: (j: number) => (j === r.k ? 1 : 0.46) }, { opacity: 1, duration: 0.4 }, 0.3)
          r.strokes.forEach((g, j) =>
            ctl!.fromTo(
              r.paths[j],
              { morphSVG: r.paths[j].getAttribute('d')! },
              { morphSVG: `M${g[0].x.toFixed(1)},${H / 2} L${g.at(-1)!.x.toFixed(1)},${H / 2}`, duration: 0.3, ease: 'okInOut' },
              lag,
            ),
          )
          if (r !== last)
            ctl!
              .fromTo(r.b, { y: 0 }, { y: top - r.b.getBoundingClientRect().top, duration: 0.5, ease: 'okInOut' }, 0.32 + lag)
              .fromTo(r.b, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0.87)
        })
        ctl
          .fromTo(last.tr.querySelector('.tt-rule'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.86)
          .fromTo(caret, { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.97)
          .set({}, {}, 1)
      })

      const draw = mode === 'full' ? build : contextSafe!(trace)
      void whenFonts([['400 1em "Instrument Serif"']]).then(() => {
        if (!alive) return
        draw()
        ScrollTrigger.refresh()
      })
      const off = onWidthChange(draw)
      return () => {
        alive = false
        off()
        clips.stop()
      }
    },
    { dependencies: [mode], scope: wrap },
  )

  return (
    <div className="tt-list" ref={wrap}>
      {locale.code !== 'en' && <p className="tt-note tt-mono">{t('blog.textTone.englishOnly')}</p>}
      <ul className="tt-readings">
        {STRESSED.map((r, i) => (
          <li key={r.src}>
            <button type="button" className="tt-rd" aria-label={labels.row(r)} onClick={() => playRef.current(i)}>
              <span className="tt-s">
                <Sentence k={i} />
                {i === STRESSED.length - 1 && <i className="tt-caret" aria-hidden="true" />}
              </span>
              <svg className="tt-tr" aria-hidden="true" />
              <span className="tt-g tt-mono">
                <Trans i18nKey={`blog.textTone.meaning.${clipKey(r)}`} components={{ i: <em /> }} />
              </span>
              <Volume2 className="tt-ic tt-ear" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Under reduced motion the list stays open, and the typed version is this static line under "Now type it."
export function TypedLine() {
  const mode = useMotion()
  const labels = useLabels()
  const btn = useRef<HTMLButtonElement>(null)
  const key = useRef({}).current
  if (mode !== 'reduced') return null
  return (
    <p className="tt-readings tt-one">
      <button
        ref={btn}
        type="button"
        className="tt-rd"
        aria-label={labels.flat}
        onClick={() =>
          void clips.play(
            key,
            FLAT.src,
            () => btn.current?.classList.add('tt-on'),
            () => btn.current?.classList.remove('tt-on'),
          )
        }
      >
        <span className="tt-s">
          {SENTENCE}.<i className="tt-caret" aria-hidden="true" />
        </span>
        <Volume2 className="tt-ic tt-ear" aria-hidden="true" />
      </button>
    </p>
  )
}
```

The `tt-rule` path is appended once per build into an `svg` whose other paths `trace()` replaces, so `trace()` (which sets `innerHTML`) also clears the old rule. Keep that order: `trace()` before the `insertAdjacentHTML`.

- [ ] **Step 4: Run the test**

Run: `pnpm vitest run src/components/text-tone/stress-list.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Append the list CSS** to `text-tone.css` (port of mock 57-82)

```css
.tt-readings { list-style: none; margin: 2.4rem 0 2.8rem; padding: 0; border-top: 1px solid var(--rule); }
.tt-readings li { display: block; padding: 0; border: 0; }
.tt-rd { display: grid; grid-template-columns: max-content minmax(0, 1fr) auto; column-gap: 2rem; align-items: baseline; width: 100%; text-align: left; padding: 1rem .3rem .55rem; border-bottom: 1px solid var(--rule); }
.tt-rd:hover { background: color-mix(in srgb, var(--ink) 4%, transparent); }
.tt-s { grid-area: 1 / 1; color: var(--ink); font: 400 clamp(1.45rem, 3.4vw, 2.2rem)/1.15 'Instrument Serif', Georgia, serif; letter-spacing: -.01em; white-space: nowrap; }
.tt-s .tt-w { display: inline-block; opacity: .46; -webkit-text-stroke: calc(var(--k, 0) * .018em) currentColor; }
/* The stressed word at rest. GSAP takes these values over once the page is live. */
.tt-readings .tt-em { display: inline-block; font-weight: 400; margin: 0 .2em; }
.tt-readings .tt-em .tt-w { opacity: 1; --k: 1; transform: translateY(-15%) scale(1.12); }
.tt-g { grid-area: 1 / 2; color: var(--soft); font-size: .8rem; }
.tt-ear { grid-area: 1 / 3; align-self: center; width: 1rem; height: 1rem; opacity: .32; }
.tt-tr { grid-area: 2 / 1; width: 100%; height: 1.15rem; margin-top: .1rem; overflow: visible; opacity: .3; }
.tt-tr path { fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.tt-rd:hover .tt-ear, .tt-rd:focus-visible .tt-ear, .tt-rd.tt-on .tt-ear, .tt-rd.tt-on .tt-tr { opacity: 1; }
.tt-caret { display: inline-block; width: .05em; height: .78em; margin-left: .07em; background: currentColor; vertical-align: -.06em; opacity: 0; }
.tt-one { margin: 0 0 2.8rem; }
.tt-one .tt-caret { opacity: 1; }
.tt-one .tt-s { grid-column: 1 / 3; }
.tt-readings.tt-moving .tt-rd, .tt-readings.tt-typed li:not(:last-child) .tt-rd { pointer-events: none; }
.tt-readings.tt-typed li:last-child .tt-tr { opacity: .55; }
@media (prefers-reduced-motion: no-preference) { .tt-typed .tt-caret { animation: tt-blink 1.1s steps(1) infinite; } }
@keyframes tt-blink { 50% { opacity: 0; } }
.tt-note { color: var(--soft); margin: 0 0 .8rem; }
@media (max-width: 640px) {
  .tt-rd { grid-template-columns: minmax(0, 1fr) auto; }
  .tt-g { grid-area: 3 / 1; margin-top: .25rem; }
  .tt-ear { grid-area: 1 / 2; }
}
```

- [ ] **Step 6: Wire the figures** in `src/routes/blog/text-tone-page.tsx`

```tsx
import { StressList, TypedLine } from '../../components/text-tone/stress-list'

const FIGURES: Record<string, ReactNode> = {
  stress_list: <StressList />,
  typed_line: <TypedLine />,
}
```

- [ ] **Step 7: Check**

Run: `pnpm tsc --noEmit && pnpm test`
Expected: PASS. Then in `pnpm dev` at `/blog/text-is-not-tone/`: tap rows 1, 4 and 7 (right clip, right word lifts, trace redraws), tap a playing row (stops), scroll the fold down and up twice, tap the collapsed line (flat clip), and check no console errors. Report what you could and could not check.

- [ ] **Step 8: Commit**

```bash
git add src/components/text-tone/stress-list.tsx src/components/text-tone/stress-list.test.tsx \
  src/components/text-tone/text-tone.css src/routes/blog/text-tone-page.tsx
git commit -s -m "Add the playable stress list and its fold into one typed line"
```

---

### Task 7: Forty sheets and rate cards

**Files:**
- Create: `src/components/text-tone/forty-sheets.tsx`, `src/components/text-tone/rate-cards.tsx`, `src/components/text-tone/figures.test.tsx`
- Modify: `src/components/text-tone/text-tone.css` (append), `src/routes/blog/text-tone-page.tsx` (`FIGURES`)

**Interfaces:**
- Consumes: `useLoop`, `PauseButton`, `useMotion` (Task 5); keys from Task 4.
- Produces: `FortySheets()`, `RateCards()`; the shared test helper `render(node, mode)` in `figures.test.tsx`, which Tasks 8 and 9 extend.

- [ ] **Step 1: Write the failing test** `src/components/text-tone/figures.test.tsx`

```tsx
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { MotionContext, type MotionMode } from './loop-pause'
import { FortySheets } from './forty-sheets'
import { RateCards } from './rate-cards'

const render = (node: ReactNode, mode: MotionMode = 'pending') =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <MotionContext value={mode}>{node}</MotionContext>
    </I18nextProvider>,
  )
const count = (html: string, s: string) => html.split(s).length - 1

describe('FortySheets', () => {
  it('prerenders forty sheets a row with no pause button', () => {
    const html = render(<FortySheets />)
    expect(count(html, '<i')).toBe(80)
    expect(html).not.toContain('tt-pp')
  })

  it('shows the end counts under reduced motion', () => {
    const html = render(<FortySheets />, 'reduced')
    expect(count(html, 'tt-lit')).toBe(44)
    expect(html).toContain('4 of 40 changed')
    expect(html).toContain('40 of 40 changed')
  })

  it('gets one pause button when it loops', () => {
    expect(count(render(<FortySheets />, 'full'), 'aria-pressed="false"')).toBe(1)
  })
})

describe('RateCards', () => {
  it('prerenders one card each for typing and speaking and a stack of five for the model', () => {
    const html = render(<RateCards />)
    expect(count(html, 'class="tt-card"')).toBe(7)
    expect(html).toContain('one hole, one token · 0 s')
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run src/components/text-tone/figures.test.tsx`
Expected: FAIL, cannot resolve `./forty-sheets`.

- [ ] **Step 3: Write `src/components/text-tone/forty-sheets.tsx`** (port of mock 620-639)

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { PauseButton, useLoop, useMotion } from './loop-pause'

const STOP = 4
const RATE = 40 / 6
const ON = { backgroundColor: '#e2573c', rotationX: 180 }

// Both rows hear "no wait, not that" at the same moment. Only the spoken one can use it.
export function FortySheets() {
  const { t } = useTranslation()
  const mode = useMotion()
  const fig = useRef<HTMLElement>(null)
  const loop = useLoop(fig, () => {
    const [A, B] = [...fig.current!.querySelectorAll('.tt-run')].map((r) => ({
      files: [...r.querySelectorAll<HTMLElement>('.tt-files i')],
      slip: r.querySelector<HTMLElement>('.tt-slip')!,
      count: r.querySelector<HTMLElement>('.tt-count')!,
    }))
    const counts = (a: number, b: number) => {
      A.count.textContent = t('blog.textTone.changed', { n: a })
      B.count.textContent = t('blog.textTone.changed', { n: b })
    }
    gsap.set([...A.files, ...B.files, A.slip, B.slip], { clearProps: 'all' })
    counts(0, 0)
    const o = { t: 0 }
    const said = STOP / RATE
    return gsap
      .timeline({ repeat: -1, repeatDelay: 2.6 })
      .set([A.slip, B.slip], { autoAlpha: 0 }, 0)
      .to(o, { t: 6, duration: 6, ease: 'none', onUpdate: () => counts(Math.min(STOP, Math.floor(o.t * RATE)), Math.min(40, Math.floor(o.t * RATE))) }, 0)
      .to(A.files.slice(0, STOP), { ...ON, duration: 0.3, ease: 'okOut', stagger: 1 / RATE }, 0)
      .to(B.files, { ...ON, duration: 0.3, ease: 'okOut', stagger: 1 / RATE }, 0)
      .fromTo(A.slip, { autoAlpha: 0, y: -16, rotation: -9 }, { autoAlpha: 1, y: 0, rotation: -2, duration: 0.45, ease: 'okLift' }, said)
      .fromTo(B.slip, { autoAlpha: 0, y: -16, rotation: -9 }, { autoAlpha: 0.4, y: -5, rotation: -6, duration: 0.45, ease: 'okOut' }, said)
      .to(B.slip, { autoAlpha: 1, y: 0, rotation: -2, duration: 0.45, ease: 'okLift' }, 6.25)
  })
  const reduced = mode === 'reduced'
  const run = (key: 'spoken' | 'typed', lit: number) => (
    <div className="tt-run">
      <header>
        <b>{t(`blog.textTone.${key}`)}</b>
        <span className="tt-slip tt-mono">{t('blog.textTone.noWait')}</span>
        <span className="tt-count tt-mono">{reduced ? t('blog.textTone.changed', { n: lit }) : null}</span>
      </header>
      <div className="tt-files">
        {Array.from({ length: 40 }, (_, i) => (
          <i key={i} className={reduced && i < lit ? 'tt-lit' : undefined} />
        ))}
      </div>
    </div>
  )
  return (
    <figure ref={fig} className="tt-fig" role="group" aria-label={t('blog.textTone.sheetsLabel')}>
      <div className="tt-runs">
        {run('spoken', STOP)}
        {run('typed', 40)}
      </div>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </figure>
  )
}
```

The count spans render no children outside reduced motion, so React never overwrites the text GSAP writes into them.

- [ ] **Step 4: Write `src/components/text-tone/rate-cards.tsx`** (port of mock 601-618)

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { PauseButton, useLoop, useMotion } from './loop-pause'

const SECS = 5
const LANES = [
  { rate: 1, name: 'typing', lines: ['typingWpm', 'typingTps'] },
  { rate: 3, name: 'speaking', lines: ['speakingWpm', 'speakingTps'] },
  { rate: 100, name: 'aModel', lines: ['modelTps', 'shownAt'] },
] as const

// One hole per token at the real rates. The model finishes a hundred-hole card every second.
export function RateCards() {
  const { t } = useTranslation()
  const mode = useMotion()
  const fig = useRef<HTMLElement>(null)
  const clock = useRef<HTMLElement>(null)

  const paint = (time: number) => {
    fig.current?.querySelectorAll('.tt-pile').forEach((pile, p) =>
      [...pile.children].forEach((card, i) => {
        const n = Math.min(100, Math.max(0, Math.floor(LANES[p].rate * time) - i * 100))
        const el = card as HTMLElement
        const [full, rest] = [...el.children] as HTMLElement[]
        el.style.visibility = n || !i ? 'visible' : 'hidden'
        full.style.height = `calc(var(--c) * ${Math.floor(n / 10)})`
        Object.assign(rest.style, { width: `calc(var(--c) * ${n % 10})`, height: n % 10 ? 'var(--c)' : '0' })
      }),
    )
    if (clock.current) clock.current.textContent = t('blog.textTone.clock', { s: Math.min(SECS, Math.floor(time)) })
  }

  useEffect(() => {
    if (mode === 'reduced') paint(1)
  })

  const loop = useLoop(fig, () => {
    const o = { t: 0 }
    paint(0)
    const stack = [...fig.current!.querySelectorAll('.tt-pile')[2].children]
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2 }).to(o, { t: SECS, duration: SECS, ease: 'none', onUpdate: () => paint(o.t) }, 0)
    stack.forEach((card, i) =>
      tl.fromTo(
        card,
        { y: -34, rotation: 0, x: 0 },
        { y: -i * 7, x: -i * 6, rotation: [0, 2.5, -2, 3.5, -1][i], duration: 0.5, ease: 'okOut', immediateRender: false },
        i,
      ),
    )
    return tl
  })

  return (
    <figure ref={fig} className="tt-fig" role="group" aria-label={t('blog.textTone.ratesLabel')}>
      <div className="tt-cards">
        {LANES.map((l) => (
          <div key={l.name} className="tt-lane">
            <div className="tt-pile">
              {Array.from({ length: l.rate > 10 ? SECS : 1 }, (_, i) => (
                <div key={i} className="tt-card">
                  <i />
                  <i />
                </div>
              ))}
            </div>
            <b>{t(`blog.textTone.${l.name}`)}</b>
            <small className="tt-mono">
              {t(`blog.textTone.${l.lines[0]}`)}
              <br />
              {t(`blog.textTone.${l.lines[1]}`)}
            </small>
          </div>
        ))}
      </div>
      <figcaption ref={clock} className="tt-mono">
        {t('blog.textTone.clock', { s: 0 })}
      </figcaption>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </figure>
  )
}
```

- [ ] **Step 5: Run the test**

Run: `pnpm vitest run src/components/text-tone/figures.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 6: Append the CSS** (port of mock 127-136 and 164-172, plus the reduced-motion sheet state)

```css
.tt-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 clamp(.8rem, 4vw, 3rem); max-width: 44rem; margin-inline: auto; padding: 1.6rem 0 0; --c: clamp(8px, 2.05vw, 13px); }
.tt-lane { display: grid; justify-items: center; align-content: start; }
.tt-pile { position: relative; width: calc(var(--c) * 10 + 14px); height: calc(var(--c) * 10 + 14px); margin: 2.2rem 0 1.5rem; }
.tt-card { position: absolute; inset: 0; padding: 7px; background: var(--card); border-radius: 2px; box-shadow: 0 1px 0 #0003, 0 9px 14px -8px #000a; }
.tt-card::before { content: ''; position: absolute; top: 0; right: 0; border: calc(var(--c) * .55) solid; border-color: var(--paper) var(--paper) #0000 #0000; }
.tt-card i { display: block; height: 0; background: radial-gradient(circle, #23201c 34%, #0000 38%) 0 0 / var(--c) var(--c); }
.tt-lane b { font: 400 1.7rem/1 'Instrument Serif', serif; }
.tt-lane small { color: var(--soft); text-align: center; margin-top: .35rem; }
.tt-cards + figcaption { text-align: center; color: var(--soft); padding-top: 1.1rem; }

.tt-runs { display: grid; gap: 1.6rem; max-width: 46rem; margin-inline: auto; padding-top: 1.4rem; }
.tt-run header { display: flex; align-items: center; gap: .8rem; min-height: 2.1rem; color: var(--soft); }
.tt-run header b { font: 400 1.7rem/1 'Instrument Serif', serif; color: var(--ink); }
.tt-run header span:last-child { margin-left: auto; }
.tt-slip { background: var(--card); color: #1f1d1a; padding: .2rem .55rem; box-shadow: 0 6px 10px -6px #000a; transform: rotate(-2deg); }
.tt-files { display: grid; grid-template-columns: repeat(20, 1fr); gap: 5px; margin-top: .5rem; perspective: 600px; }
.tt-files i { aspect-ratio: 3 / 4; background: var(--card); border-radius: 1.5px; box-shadow: 0 4px 6px -4px #0009; }
.tt-files i.tt-lit { background: var(--coral); transform: rotateX(180deg); }
@media (max-width: 640px) { .tt-files { grid-template-columns: repeat(10, 1fr); } }
```

- [ ] **Step 7: Wire the figures** in `text-tone-page.tsx`: import both and add `forty_sheets: <FortySheets />` and `rate_cards: <RateCards />` to `FIGURES`.

- [ ] **Step 8: Check**

Run: `pnpm tsc --noEmit && pnpm test`
Expected: PASS. In `pnpm dev`, both figures loop, pause offscreen, and pause and resume on their button. Report what you could and could not check.

- [ ] **Step 9: Commit**

```bash
git add src/components/text-tone/forty-sheets.tsx src/components/text-tone/rate-cards.tsx src/components/text-tone/figures.test.tsx \
  src/components/text-tone/text-tone.css src/routes/blog/text-tone-page.tsx
git commit -s -m "Add the forty-sheets and rate-card figures"
```

---

### Task 8: Mandarin tones and Arabic harakat figures

**Files:**
- Create: `src/components/text-tone/tones-figure.tsx`, `src/components/text-tone/harakat-figure.tsx`
- Modify: `src/components/text-tone/figures.test.tsx` (append), `src/components/text-tone/text-tone.css` (append), `src/routes/blog/text-tone-page.tsx` (`FIGURES`)

**Interfaces:**
- Consumes: `useLoop`, `PauseButton`, `useMotion` (Task 5), `whenFonts` (Task 5), keys from Task 4.
- Produces: `TonesFigure()`, `HarakatFigure()`.

- [ ] **Step 1: Append the failing tests** to `figures.test.tsx`

```tsx
import { TonesFigure } from './tones-figure'
import { HarakatFigure } from './harakat-figure'

describe('TonesFigure', () => {
  it('prerenders four toned words and the poem, all marked as Chinese', () => {
    const html = render(<TonesFigure />)
    expect(count(html, 'class="tt-tone"')).toBe(4)
    expect(count(html, 'lang="zh-Hans"')).toBe(5)
    expect(html).toContain('Shíshì shīshì Shī Shì')
    expect(html).not.toContain('tt-static')
  })

  it('shows every form at once under reduced motion', () => {
    expect(render(<TonesFigure />, 'reduced')).toContain('tt-static')
  })
})

describe('HarakatFigure', () => {
  it('prerenders the bare word four times and three vowelled readings, all right-to-left', () => {
    const html = render(<HarakatFigure />)
    expect(count(html, 'class="tt-vw"')).toBe(4)
    expect(count(html, 'class="tt-hk"')).toBe(3)
    expect(count(html, 'lang="ar" dir="rtl"')).toBe(7)
  })

  it('shows every reading at once under reduced motion', () => {
    expect(render(<HarakatFigure />, 'reduced')).toContain('tt-static')
  })
})
```

Merge the new imports into the import block at the top of the file.

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run src/components/text-tone/figures.test.tsx`
Expected: FAIL, cannot resolve `./tones-figure`.

- [ ] **Step 3: Write `src/components/text-tone/tones-figure.tsx`** (port of mock 641-674; markup from mock 248-259)

```tsx
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { whenFonts } from './fonts'
import { PauseButton, useLoop, useMotion } from './loop-pause'

const TONES = [
  { han: '妈', marked: 'mā', d: 'M8,6 L92,6', gloss: 'mother' },
  { han: '麻', marked: 'má', d: 'M8,24 C36,23 62,14 92,4', gloss: 'hemp' },
  { han: '马', marked: 'mǎ', d: 'M8,30 C28,40 44,42 54,38 C70,31 82,18 92,12', gloss: 'horse' },
  { han: '骂', marked: 'mà', d: 'M8,4 C36,8 66,26 92,40', gloss: 'toScold' },
] as const
const LEVEL = 'M8,22 L92,22'
const POEM = {
  han: '石室诗士施氏，嗜狮，誓食十狮',
  marked: 'Shíshì shīshì Shī Shì, shì shī, shì shí shí shī',
  bare: 'shi shi shi shi shi shi, shi shi, shi shi shi shi',
}

// Four words that differ only by tone. Take the tones away and the four fold into one syllable:
// the same move as the English list.
export function TonesFigure() {
  const { t } = useTranslation()
  const mode = useMotion()
  const fig = useRef<HTMLElement>(null)
  const [fonts, setFonts] = useState(false)
  useEffect(() => {
    if (mode === 'full') void whenFonts([['500 1em "Noto Serif SC"', '妈'], ['italic 500 1em Spectral', 'ā']]).then(() => setFonts(true))
  }, [mode])

  const loop = useLoop(
    fig,
    () => {
      const root = fig.current!
      const cells = [...root.querySelectorAll<HTMLElement>('.tt-tone')]
      const q = (s: string) => cells.map((c) => c.querySelector<HTMLElement>(s)!)
      const paths = cells.map((c) => c.querySelector('path')!)
      const han = q('.tt-han'), gl = q('.tt-gl'), marked = q('.tt-py i'), bare = q('.tt-py i + i')
      const poem = root.querySelector('.tt-poem')!
      const [pm, pb] = [...poem.querySelectorAll<HTMLElement>('.tt-py i')]
      const ph = poem.querySelector<HTMLElement>('.tt-han')!
      gsap.set([...cells, ...han, ...gl, ...marked, ...bare, ph, pm, pb], { clearProps: 'transform,opacity,visibility' })
      paths.forEach((p, i) => p.setAttribute('d', TONES[i].d))
      const box = root.querySelector('.tt-tones')!.getBoundingClientRect()
      const cx = box.left + box.width / 2, cy = box.top + box.height / 2
      const to = cells.map((c) => {
        const r = c.getBoundingClientRect()
        return { x: cx - r.left - r.width / 2, y: cy - r.top - r.height / 2 }
      })
      const up = -han[0].offsetHeight * 0.82, S = 2.4, R = S + 4.6
      const tl = gsap
        .timeline({ repeat: -1 })
        .to(paths, { morphSVG: LEVEL, duration: 0.7, ease: 'okInOut', stagger: 0.06 }, S)
        .to([...marked, pm], { opacity: 0, duration: 0.3, ease: 'okOut' }, S)
        .to([...bare, pb], { opacity: 1, duration: 0.3, ease: 'okOut' }, S + 0.2)
        .to([...han, ...gl], { opacity: 0, duration: 0.5, ease: 'okOut' }, S + 0.6)
        .to(ph, { opacity: 0.13, duration: 0.5, ease: 'okOut' }, S + 0.6)
        .to(cells, { x: (i) => to[i].x, y: (i) => to[i].y, duration: 0.85, ease: 'okInOut' }, S + 1.1)
        .to(bare, { y: up, duration: 0.85, ease: 'okInOut' }, S + 1.1)
        .to(cells.slice(1), { autoAlpha: 0, duration: 0.12 }, S + 1.9)
        .to(cells.slice(1), { autoAlpha: 1, duration: 0.12 }, R)
        .to(cells, { x: 0, y: 0, duration: 0.85, ease: 'okInOut' }, R + 0.05)
        .to(bare, { y: 0, duration: 0.85, ease: 'okInOut' }, R + 0.05)
        .to([...han, ...gl, ph], { opacity: 1, duration: 0.5, ease: 'okOut' }, R + 0.7)
        .to([...bare, pb], { opacity: 0, duration: 0.3, ease: 'okOut' }, R + 0.9)
        .to([...marked, pm], { opacity: 1, duration: 0.3, ease: 'okOut' }, R + 1.05)
      paths.forEach((p, i) => tl.to(p, { morphSVG: TONES[i].d, duration: 0.7, ease: 'okInOut' }, R + 0.9 + i * 0.06))
      return tl.set({}, {}, R + 2)
    },
    fonts,
  )

  return (
    <figure ref={fig} className={`tt-fig tt-lang${mode === 'reduced' ? ' tt-static' : ''}`} role="group" aria-label={t('blog.textTone.tonesLabel')}>
      <div className="tt-tones">
        {TONES.map((x) => (
          <div key={x.han} className="tt-tone">
            <svg className="tt-tc" viewBox="0 0 100 44" aria-hidden="true">
              <path d={x.d} />
            </svg>
            <span className="tt-han" lang="zh-Hans">{x.han}</span>
            <span className="tt-py"><i>{x.marked}</i><i>ma</i></span>
            <span className="tt-gl tt-mono">{t(`blog.textTone.${x.gloss}`)}</span>
          </div>
        ))}
      </div>
      <div className="tt-poem">
        <span className="tt-han" lang="zh-Hans">{POEM.han}</span>
        <span className="tt-py"><i>{POEM.marked}</i><i>{POEM.bare}</i></span>
      </div>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </figure>
  )
}
```

- [ ] **Step 4: Write `src/components/text-tone/harakat-figure.tsx`** (port of mock 676-691; markup from mock 263-270)

```tsx
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { whenFonts } from './fonts'
import { PauseButton, useLoop, useMotion } from './loop-pause'

const BARE = 'كتب'
const READINGS = [
  { marked: null, tr: 'k-t-b', gloss: 'asWritten' },
  { marked: 'كَتَبَ', tr: 'kataba', gloss: 'heWrote' },
  { marked: 'كُتِبَ', tr: 'kutiba', gloss: 'itWasWritten' },
  { marked: 'كُتُب', tr: 'kutub', gloss: 'books' },
] as const

// The same three consonants every time. The vowel marks arrive on three of them and make three words,
// then leave, and the page is back to what is normally written.
export function HarakatFigure() {
  const { t } = useTranslation()
  const mode = useMotion()
  const fig = useRef<HTMLElement>(null)
  const [font, setFont] = useState<boolean | null>(null)
  useEffect(() => {
    if (mode === 'full') void whenFonts([['500 1em "Noto Naskh Arabic"', BARE]]).then(setFont)
  }, [mode])
  // The marked word is laid over the bare one, which needs equal advance widths; only Noto Naskh
  // Arabic is checked for that, so without it the figure shows every reading at once.
  const still = mode === 'reduced' || font === false

  const loop = useLoop(
    fig,
    () => {
      const cells = [...fig.current!.querySelectorAll<HTMLElement>('.tt-vw')].slice(1)
      const hk = cells.map((c) => c.querySelector<HTMLElement>('.tt-hk')!)
      const labels = cells.map((c) => [c.querySelector<HTMLElement>('.tt-py')!, c.querySelector<HTMLElement>('.tt-gl')!])
      const under = cells.map((c) => c.querySelector<HTMLElement>('.tt-ar > span')!)
      gsap.set([...hk, ...labels.flat(), ...under], { clearProps: 'opacity' })
      const tl = gsap.timeline({ repeat: -1 }).set([...hk, ...labels.flat()], { opacity: 0 }, 0)
      // Fade the marked word in over the bare one, then switch the bare one off: two stacked copies
      // draw the letters heavier than their neighbour.
      cells.forEach((_, i) =>
        tl
          .to(hk[i], { opacity: 1, duration: 0.7, ease: 'okOut' }, 1 + i * 1.4)
          .set(under[i], { opacity: 0 }, 1.7 + i * 1.4)
          .to(labels[i], { opacity: 1, duration: 0.5, ease: 'okOut' }, 1.15 + i * 1.4),
      )
      return tl
        .set(under, { opacity: 1 }, 7.2)
        .to([...hk, ...labels.flat()], { opacity: 0, duration: 0.8, ease: 'okInOut' }, 7.2)
        .set({}, {}, 9)
    },
    font === true,
  )

  return (
    <figure ref={fig} className={`tt-fig tt-lang${still ? ' tt-static' : ''}`} role="group" aria-label={t('blog.textTone.harakatLabel')}>
      <div className="tt-vowels">
        {READINGS.map((w) => (
          <div key={w.tr} className="tt-vw">
            <span className="tt-ar">
              <span lang="ar" dir="rtl">{BARE}</span>
              {w.marked && <span className="tt-hk" lang="ar" dir="rtl">{w.marked}</span>}
            </span>
            <span className="tt-py"><i>{w.tr}</i></span>
            <span className="tt-gl tt-mono">{t(`blog.textTone.${w.gloss}`)}</span>
          </div>
        ))}
      </div>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </figure>
  )
}
```

- [ ] **Step 5: Run the tests**

Run: `pnpm vitest run src/components/text-tone/figures.test.tsx`
Expected: PASS, 8 tests.

- [ ] **Step 6: Append the CSS** (port of mock 141-161)

```css
.tt-lang { padding: 1.7rem 0 1.5rem; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.tt-tones, .tt-vowels { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.4rem .5rem; justify-items: center; }
.tt-tone, .tt-vw { display: grid; justify-items: center; row-gap: .1rem; }
.tt-tc { width: clamp(4rem, 9vw, 6.2rem); height: auto; overflow: visible; }
.tt-tc path { fill: none; stroke: var(--ink); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.tt-han { font-size: clamp(3rem, 8vw, 4.6rem); line-height: 1.2; }
.tt-py { display: grid; justify-items: center; text-align: center; font: italic 500 1.3rem/1.35 Spectral, Georgia, serif; color: var(--mark); }
.tt-py i { grid-area: 1 / 1; }
/* the toneless form, set as typed text */
.tt-py i + i { opacity: 0; font: 500 1.05rem/1.7 'IBM Plex Mono', monospace; color: var(--ink); }
.tt-tone .tt-py i + i { font-size: 1.35rem; line-height: 1.3; }
.tt-gl { color: var(--soft); font-size: .78rem; text-align: center; }
.tt-poem { display: grid; justify-items: center; row-gap: .35rem; margin-top: 1.9rem; }
.tt-poem .tt-han { font-size: clamp(1.35rem, 4.6vw, 2.2rem); letter-spacing: .05em; }
.tt-poem .tt-py { font-size: 1.05rem; }
.tt-poem .tt-py i + i { font-size: .88rem; text-wrap: balance; }
.tt-ar { position: relative; display: inline-block; font-size: clamp(3.1rem, 8.6vw, 5.2rem); line-height: 2.05; }
.tt-hk { position: absolute; inset: 0; text-align: center; opacity: 0; }
.tt-vw .tt-py { margin-top: -.7rem; }
/* every form at once: reduced motion, or the Arabic face never arrived */
.tt-static .tt-py i { grid-area: auto; }
.tt-static .tt-py i + i, .tt-static .tt-hk { opacity: 1; }
.tt-static .tt-hk { position: static; }
.tt-static .tt-ar:has(.tt-hk) > span:first-child { display: none; }
@media (max-width: 560px) { .tt-tones, .tt-vowels { grid-template-columns: repeat(2, 1fr); } }
```

`.tt-static .tt-hk { position: static }` and hiding the bare copy differ from the mock (which kept the overlay and set the bare copy's opacity to 0): without the Arabic face the overlay can be misaligned, so the static layout uses only the marked word.

- [ ] **Step 7: Wire the figures** in `text-tone-page.tsx`: `tones: <TonesFigure />`, `harakat: <HarakatFigure />`.

- [ ] **Step 8: Check**

Run: `pnpm tsc --noEmit && pnpm test`
Expected: PASS. In `pnpm dev`, both figures loop and pause; the four Mandarin cells fold to one "ma" and open again; the Arabic marks fade in on three words. Report what you could and could not check.

- [ ] **Step 9: Commit**

```bash
git add src/components/text-tone/tones-figure.tsx src/components/text-tone/harakat-figure.tsx \
  src/components/text-tone/figures.test.tsx src/components/text-tone/text-tone.css src/routes/blog/text-tone-page.tsx
git commit -s -m "Add the Mandarin tones and Arabic harakat figures"
```

---

### Task 9: Closing stage

**Files:**
- Create: `src/components/text-tone/closing-stage.tsx`
- Modify: `src/components/text-tone/figures.test.tsx` (append), `src/components/text-tone/text-tone.css` (append), `src/routes/blog/text-tone-page.tsx`

**Interfaces:**
- Consumes: `useLoop`, `PauseButton`, `useMotion`, `onWidthChange` (Task 5), `whenFonts` (Task 5), `blog.textTone.stageLabel`.
- Produces: `ClosingStage()`, rendered by the page after `</main>`, as the last element before the site footer.

- [ ] **Step 1: Append the failing test** to `figures.test.tsx`

```tsx
import { ClosingStage } from './closing-stage'

describe('ClosingStage', () => {
  it('draws seven bands of paper under the arc', () => {
    expect(count(render(<ClosingStage />), '<circle')).toBe(7)
  })

  it('keeps the pause button outside the image role', () => {
    const html = render(<ClosingStage />, 'full')
    const img = html.indexOf('role="img"')
    const imgEnd = html.indexOf('</p></div>', img)
    const button = html.indexOf('<button')
    expect(img).toBeGreaterThan(-1)
    expect(button).toBeGreaterThan(imgEnd)
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run src/components/text-tone/figures.test.tsx`
Expected: FAIL, cannot resolve `./closing-stage`.

- [ ] **Step 3: Write `src/components/text-tone/closing-stage.tsx`** (port of mock 353-358, 422, 425-458, 693-718; filters from mock 200-205)

```tsx
import { Fragment, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { whenFonts } from './fonts'
import { PauseButton, onWidthChange, useLoop, useMotion } from './loop-pause'

// Stage units: 1000 wide at any size, the arc's top at (500, 0), a circle of radius RV.
const RV = 1300
const EDGE = RV - Math.sqrt(RV * RV - 700 * 700)
const ARC = `M-200,${EDGE.toFixed(1)} A${RV},${RV} 0 0 1 1200,${EDGE.toFixed(1)}`
const FLAT = 'M-200,0 L1200,0'
// Thin bands on the horizon that end in the footer's own black, so nothing is cut off at the join.
const BANDS = ['#d4a03c', '#efe6d2', '#6b8cae', '#e2d6bd', '#d4a03c', '#efe6d2', '#0b0a09']
const LINE = 'I didn’t say she stole the money'
const FRAC = 0.46
const UNSEATED = { x: 0, y: 0, rotation: 0, scale: 1 }

type Seat = { y: number; r: number }

// The typed line gets its curve, its light and its paper back, then loses them again.
export function ClosingStage() {
  const { t } = useTranslation()
  const mode = useMotion()
  const stage = useRef<HTMLDivElement>(null)
  const [fonts, setFonts] = useState(false)
  useEffect(() => {
    if (mode !== 'pending') void whenFonts([['400 1em "Instrument Serif"']]).then(() => setFonts(true))
  }, [mode])

  // Size the sentence to the stage, then seat every letter on the circle: dropped by the sagitta at
  // its x and turned to the tangent.
  const layout = () => {
    const el = stage.current!
    const line = el.querySelector<HTMLElement>('.tt-line')!
    const chars = [...line.querySelectorAll<HTMLElement>('.tt-c')]
    const w = el.clientWidth, h = el.clientHeight, s = w / 1000, top = Math.round(h * (1 - FRAC))
    el.querySelector('svg')!.setAttribute('viewBox', `0 0 ${w} ${h}`)
    el.querySelector('.tt-space')!.setAttribute('transform', `translate(0 ${top}) scale(${s})`)
    gsap.set(chars, { clearProps: 'transform' })
    line.style.fontSize = '100px'
    const fs = Math.min(w * 0.08, (100 * w * (w < 640 ? 0.92 : 0.86)) / line.offsetWidth)
    line.style.fontSize = `${fs}px`
    line.style.top = `${top}px`
    const lr = line.getBoundingClientRect(), mid = lr.left + lr.width / 2
    const seats = new Map<Element, Seat>()
    for (const c of chars) {
      const r = c.getBoundingClientRect()
      const th = Math.asin((r.left + r.width / 2 - mid) / (RV * s))
      seats.set(c, { y: RV * s * (1 - Math.cos(th)), r: (th * 180) / Math.PI })
    }
    gsap.set(chars, { transformOrigin: '50% 78%' })
    const seated = { x: 0, y: (_: number, c: Element) => seats.get(c)!.y, rotation: (_: number, c: Element) => seats.get(c)!.r, scale: 1 }
    return { chars, seated }
  }

  // Reduced motion: the bent arc with its paper, still.
  useGSAP(
    () => {
      if (mode !== 'reduced' || !fonts) return
      const place = () => {
        const { chars, seated } = layout()
        gsap.set(chars, seated)
      }
      place()
      return onWidthChange(place)
    },
    { dependencies: [mode, fonts], scope: stage },
  )

  const loop = useLoop(
    stage,
    () => {
      const el = stage.current!
      const arc = el.querySelector<SVGPathElement>('.tt-arc')!
      const rim = el.querySelector<SVGPathElement>('.tt-rim')!
      const shade = el.querySelector<SVGGElement>('.tt-dress')!
      const layers = [...el.querySelectorAll('.tt-under circle')]
      gsap.set([arc, rim, shade, ...layers], { clearProps: 'all' })
      arc.setAttribute('d', ARC)
      const { chars, seated } = layout()
      gsap.set(chars, seated)
      const e = { duration: 1.4, ease: 'okInOut' }
      return gsap
        .timeline({ repeat: -1 })
        .fromTo(arc, { morphSVG: FLAT }, { morphSVG: ARC, ...e }, 1.2)
        .fromTo(chars, UNSEATED, { ...seated, ...e, stagger: { each: 0.012, from: 'center' } }, 1.2)
        .fromTo(shade, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.7)
        .to(shade, { autoAlpha: 0, duration: 0.5 }, 7.6)
        .fromTo(layers, { attr: { cy: RV + 1000 } }, { attr: { cy: RV }, duration: 1.3, ease: 'okOut', stagger: 0.08 }, 1.7)
        .fromTo(rim, { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 1.4, ease: 'okOut' }, 2)
        .to(rim, { autoAlpha: 0, duration: 0.8, ease: 'okInOut' }, 7)
        .to(layers, { attr: { cy: RV + 1000 }, duration: 1.1, ease: 'okInOut', stagger: { each: 0.05, from: 'end' } }, 7)
        .fromTo(arc, { morphSVG: ARC }, { morphSVG: FLAT, immediateRender: false, ...e }, 7.5)
        .to(chars, { ...UNSEATED, ...e, stagger: { each: 0.012, from: 'edges' } }, 7.5)
        .set({}, {}, 9.4)
    },
    fonts,
  )

  return (
    <div className="tt-closing">
      <div ref={stage} className="tt-stage tt-end" role="img" aria-label={t('blog.textTone.stageLabel')}>
        <svg aria-hidden="true">
          <defs>
            <filter id="tt-soft"><feGaussianBlur stdDeviation="9" /></filter>
            <filter id="tt-lift" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="-5" stdDeviation="7" floodOpacity=".34" />
            </filter>
            {/* tt-fibre: mock-a7.html:205's `fibre` filter, attributes camelCased for JSX */}
            <clipPath id="tt-clip"><path d={`${ARC} L1200,950 L-200,950 Z`} /></clipPath>
          </defs>
          <g className="tt-space">
            <path className="tt-rim" d={ARC} />
            <g className="tt-under" clipPath="url(#tt-clip)">
              {BANDS.map((fill, i) => (
                <circle key={i} cx="500" cy={RV} r={RV - i * 17} fill={fill} filter="url(#tt-lift)" />
              ))}
              <g className="tt-dress">
                <rect className="tt-fibre" x="-200" y="-10" width="1400" height="960" filter="url(#tt-fibre)" />
                <path className="tt-shade" d={ARC} transform="translate(0,-6)" />
              </g>
            </g>
            <path className="tt-arc" d={ARC} />
          </g>
        </svg>
        <p className="tt-line" aria-hidden="true">
          {LINE.split(' ').map((word, i) => (
            <Fragment key={i}>
              {i > 0 && ' '}
              <span className="tt-w">
                {[...word].map((ch, j) => (
                  <span key={j} className="tt-c">{ch}</span>
                ))}
              </span>
            </Fragment>
          ))}
        </p>
      </div>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </div>
  )
}
```

Replace the `tt-fibre` JSX comment with the filter itself: read `mock-a7.html:205`, copy the `<filter id="fibre" …>` element, rename its id to `tt-fibre`, and camelCase its attributes for JSX (`baseFrequency`, `numOctaves`, `stdDeviation`, `colorInterpolationFilters`, …). Remove the comment once the filter is in.

- [ ] **Step 4: Run the test**

Run: `pnpm vitest run src/components/text-tone/figures.test.tsx`
Expected: PASS, 10 tests.

- [ ] **Step 5: Append the CSS** (port of mock 39-49 and 174-177; the footer stand-in is not ported)

```css
.tt-closing { position: relative; background: var(--night); }
.tt-stage { position: relative; overflow: hidden; background: var(--night); --word: var(--cream); }
.tt-stage > svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.tt-arc { fill: none; stroke: var(--word); stroke-width: 1.4; vector-effect: non-scaling-stroke; }
.tt-shade { fill: none; stroke: #000; stroke-opacity: .38; stroke-width: 22; filter: url(#tt-soft); }
.tt-fibre { mix-blend-mode: multiply; opacity: .5; }
.tt-rim { fill: none; stroke: #f2c46c; stroke-width: 14; filter: url(#tt-soft); opacity: .55; }
.tt-line { position: absolute; left: 50%; top: 54%; margin: 0; white-space: nowrap; transform: translate(-50%, calc(-100% + .2em)); color: var(--word); font: 400 3rem/1 'Instrument Serif', Georgia, serif; letter-spacing: -.012em; }
.tt-line .tt-w, .tt-line .tt-c { display: inline-block; }
.tt-end { height: 66vh; height: 66svh; min-height: 24rem; }
.tt-end::after { content: ''; position: absolute; inset: auto 0 0; height: 24%; pointer-events: none; background: linear-gradient(transparent, var(--night)); }
.tt-closing > .tt-pp { color: var(--cream); }
```

- [ ] **Step 6: Render the stage last** in `text-tone-page.tsx`: import `ClosingStage` and render `<ClosingStage />` after `</main>`, inside the `.tt` div, so it is the last element before App's footer.

- [ ] **Step 7: Check**

Run: `pnpm tsc --noEmit && pnpm test`
Expected: PASS. In `pnpm dev`, the stage loops at the bottom, the footer follows with no seam on the same `#0b0a09`, and the pause button works. Report what you could and could not check.

- [ ] **Step 8: Commit**

```bash
git add src/components/text-tone/closing-stage.tsx src/components/text-tone/figures.test.tsx \
  src/components/text-tone/text-tone.css src/routes/blog/text-tone-page.tsx
git commit -s -m "Add the closing stage that runs into the footer"
```

---

### Task 10: Verification and translations (main session)

**Files:** `src/content/blog/translations/*/text-is-not-tone.md` (generated), plus fixes the checks turn up.

- [ ] **Step 1: Build check with the draft flag off, not committed**

Remove `draft: true` from the post with Edit, then:

```bash
pnpm build 2>&1 | tail -5
for f in dist/blog/text-is-not-tone/index.html dist/*/blog/text-is-not-tone/index.html; do
  echo "$f: $(grep -c 'class="tt-rd"' $f) rows, $(grep -c '{{' $f) braces, $(grep -c 'tt-font-0' $f) font link"
done
```

Expected: each English file shows 7 rows (`grep -o` count, not lines, if they share a line), 0 braces and the font link; the title and first paragraph are present. Restore `draft: true` with Edit before anything is committed.

- [ ] **Step 2: Browser check** at 1280 and 390, light and dark, per the spec's Verification section and the Review Focus list above: all seven rows, the fold twice each way, the collapsed line, each loop pausing offscreen and on its button, no horizontal overflow, no console errors, no fixed elements, the stage-to-footer join. Then the accessibility panel's reduced motion, reload, repeat. Then block `fonts.gstatic.com` and reload (harakat shows its static layout). Then navigate to `/blog/` mid-clip (audio stops, footer charcoal, no errors). Then scroll the stage at 4x CPU throttle.

- [ ] **Step 3: Translate the post**

```bash
pnpm translate:blog && pnpm translate:blog:check
for l in de fi ja sv zh; do f=src/content/blog/translations/$l/text-is-not-tone.md; echo "$l $(grep -c '^## ' $f) $(grep -o '^{{[a-z_]*}}$' $f | tr '\n' ' ')"; done
```

Expected: five `## ` headings per locale (English has five), and the six placeholders alone on their lines in English order: `stress_list typed_line forty_sheets tones harakat rate_cards`.

- [ ] **Step 4: Whole-branch review** on Opus against the spec and this plan; fix what it confirms.

- [ ] **Step 5: Commit** the translations and any fixes, staging by name.

---

### Task 11: Publish (the author's call)

Gate: the author confirms the native-reader check of the Chinese and Arabic and the iOS Safari and Firefox sound pass, or says to ship without them.

- [ ] Remove `draft: true`, rerun `pnpm translate:blog:check` and the Task 10 Step 1 build check, commit, merge to `main`, push.

---

### Task 12: Cleanup

- [ ] Stop the preview server on `127.0.0.1:8765` (`ss -ltnp | grep 8765`, then kill that python process).
- [ ] Delete the old scratch mocks and pages under `/tmp/claude-1000/-home-novusedge-Projects-Personal-NovusEdge-github-io/ea46bb96-8705-4eb1-a6fa-efaeb335fc8a/scratchpad/` (`listen.html`, `record.html`, `didnt.html`, `didnt-alt/`, `thumb/`, `ok-fine-mocks/`, `review/`, `shots/`).
- [ ] Sweep the repo: `git status --short` shows nothing from this work; `grep -rn "didnt-say/stage.json\|align.json" src public scripts docs` finds only the script paths. Keep `scripts/generate-stress-clips.mjs` and `scripts/extract-stress-pitch.py`.
