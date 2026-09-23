# OpenJev Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve `/blog/fine-tuning-openjev-on-62695-ab-tests` on Plan A's paper with a scroll-linked leaderboard in the right rail.

**Architecture:** A new `OpenJevPage` mirrors `PlanAPage` and reuses its `.pa-*` layout classes and `PlanAMarkdown`. The board is an SVG whose rows, bars and parts are keyed by id; one pure module owns every number, state and heading id, and GSAP ScrollTrigger picks the state from heading positions exactly as the Plan A fence does. Below 1024px, and under reduced motion, the board renders once in its final state.

**Tech Stack:** React 19, react-router, Vite, Vitest, GSAP 3 + `@gsap/react` + ScrollTrigger, react-i18next, Tailwind v4 with hand CSS in `src/styles/global.css`.

**Spec:** `docs/superpowers/specs/2026-09-23-openjev-page-design.md`

## Global Constraints

- Palette is Plan A's tokens only: `--pa-ink`, `--pa-ground`, `--pa-ox`, `--pa-ox-mark`, `--pa-rule`. No hex values in the board markup or `.oj-*` CSS.
- Oxide marks this post's own entries; everything else is ink. No second accent.
- Humans render as a tick at 0.50 labelled "~chance", never as a 0.500 bar.
- Axis runs 0.40 to 0.85 with a dashed chance line at 0.50.
- Every number on the board appears verbatim in the post.
- Animate only transforms, opacity and SVG `width` attributes. Transitions 0.6s, stagger 0.05s, caption fade 0.4s.
- Reduced motion and widths below 1024px render state 6 with the state 5 caption and no ScrollTrigger.
- Heading ids come from `headingId()` in `src/lib/blog-headings.ts`.
- Commits use `git commit -s`, no `Co-Authored-By` trailer, no em-dashes in messages.
- UI strings live under `blog.openjev.*` in all five catalogs in `src/i18n/locales/`.

## Review Focus

- A renamed `##` heading in the post silently drops a board state. Task 2 tests every state heading id against the post.
- Code blocks in the post get curly quotes from `smarten()`, which breaks the Python snippet. Task 1 tests a fenced block keeps straight quotes.
- `PlanAMarkdown` hardcodes Plan A's slug for heading ids, so this post's headings get Plan A's anchors and no state ever triggers. Task 1 tests ids under a `slug` prop.
- A theme toggle mid-read leaves the board in the old palette if any colour is baked into markup. Task 3 tests the board markup has no hex colours.
- Fast scrolling back and forth fires transitions mid-tween, and rows end in the wrong place. Task 4 sets `overwrite: 'auto'` and its manual check scrolls up and down fast.

---

### Task 0: Remove the lab

The design lab at `/lab/openjev` was never committed. Its route sits in the uncommitted `src/App.tsx` diff, so any later commit of `App.tsx` would reference files that are not in the repo. Remove it before anything else.

The working tree also holds unrelated uncommitted changes: `src/lib/thumbnails.ts`, `src/content/blips/`, `public/assets/blog/openjev-thumb.gif`, `.docket/` and older specs. Leave them alone. Every commit in this plan names its paths explicitly.

**Files:**
- Delete: `src/routes/lab/`
- Modify: `src/App.tsx`

- [ ] **Step 1: Delete the lab and its route**

```bash
rm -r src/routes/lab
```

In `src/App.tsx`, remove the `OpenJevLab` constant and the comment above it, the `lab/openjev` `<Route>` block, `lazy` from the `react` import, and `&& !bare.startsWith('/lab')` from the grain line.

- [ ] **Step 2: Verify**

Run: `grep -rn "lab/openjev\|OpenJevLab" src; git diff --stat src/App.tsx; npx tsc --noEmit -p . && npm test`
Expected: grep prints nothing, `src/App.tsx` shows no diff, no type errors, all tests PASS. Nothing to commit.

---

### Task 1: Let PlanAMarkdown serve another post

`PlanAMarkdown` calls `blogHeadings(md, 'plan-a-ai')`, which maps this post's headings onto Plan A's canonical ids by index. `smarten()` splits only on single-backtick spans, so fenced code bodies get curly quotes.

**Files:**
- Modify: `src/components/plan-a-markdown.tsx:25-38` and `:261-269`
- Test: `src/components/plan-a-markdown.test.tsx` (create)

**Interfaces:**
- Produces: `PlanAMarkdown({ children, slug = 'plan-a-ai' }: { children: string; slug?: string })`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../i18n'
import { PlanAMarkdown } from './plan-a-markdown'

const SLUG = 'fine-tuning-openjev-on-62695-ab-tests'

function render(md: string, slug?: string) {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <PlanAMarkdown slug={slug}>{md}</PlanAMarkdown>
    </I18nextProvider>,
  )
}

describe('PlanAMarkdown', () => {
  it('takes heading ids from the post it is given', () => {
    expect(render('## The setup\n\ntext\n\n## And yet', SLUG)).toContain('id="and-yet"')
  })

  it('keeps Plan A ids by default', () => {
    expect(render('## The Timing')).toContain('id="the-timing"')
  })

  it('leaves quotes inside fenced code straight', () => {
    const html = render('He said "hi".\n\n```python\ntok("x")\n```', SLUG)
    expect(html).toContain('tok(&quot;x&quot;)')
    expect(html).toContain('“hi”')
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/components/plan-a-markdown.test.tsx`
Expected: FAIL. The first test finds `id="what-plan-a-says"` or similar, and the third finds `tok(“x”)`.

- [ ] **Step 3: Implement**

In `smarten`, add fenced blocks to the protected split, longest alternative first:

```ts
function smarten(md: string): string {
  return md
    .split(/(```[\s\S]*?```|`[^`]*`|\]\([^)]*\))/g)
```

Leave the rest of the function as it is. Replace `PlanAMarkdown`:

```tsx
export function PlanAMarkdown({ children, slug = 'plan-a-ai' }: { children: string; slug?: string }) {
  const md = smarten(children)
  const heads = new Map(blogHeadings(md, slug).map((head) => [head.line, head.id]))
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildComponents(citationIndex(md), heads)}>
      {md}
    </ReactMarkdown>
  )
}
```

Update the comment above `smarten` so it names fenced blocks alongside code spans and link destinations.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/components/plan-a-markdown.test.tsx src/lib/blog-headings.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/plan-a-markdown.tsx src/components/plan-a-markdown.test.tsx
git commit -s -m "Let the paper markdown take a slug and leave fenced code alone"
```

---

### Task 2: The board's data and states

**Files:**
- Create: `src/lib/openjev-data.ts`
- Test: `src/lib/openjev-data.test.ts`

**Interfaces:**
- Produces: `OPENJEV_SLUG`, `REPO_URL`, `AXIS`, `ROWS`, `RowId`, `ROW_IDS`, `STATES`, `State`, `STATE_HEADINGS`, `STATIC_STATE`, `STATIC_CAPTION`, `BANDS`, `LOSS`, `BIG`, `ROW_H`, `ROWS_TOP`, `stateAt(tops: Map<string, number>, line: number): number`, `rowLayout(k: number): Record<RowId, { shown: boolean; y: number; frac: number }>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { posts } from './posts'
import { blogHeadings } from './blog-headings'
import { BANDS, BIG, LOSS, OPENJEV_SLUG, ROWS, STATES, STATE_HEADINGS, rowLayout, stateAt } from './openjev-data'

const post = posts.find((p) => p.slug === OPENJEV_SLUG)!

describe('openjev board data', () => {
  it('finds the post', () => {
    expect(post).toBeDefined()
  })

  it('keys every state to a heading the post still has', () => {
    const ids = blogHeadings(post.content, OPENJEV_SLUG).map((h) => h.id)
    for (const [id] of STATE_HEADINGS) expect(ids, id).toContain(id)
  })

  it('maps the last heading to the last state', () => {
    expect(STATE_HEADINGS.at(-1)![1]).toBe(STATES.length - 1)
  })

  it('shows only numbers the post states', () => {
    const shown = [
      ...Object.values(ROWS).flatMap((r) => ('display' in r ? [r.display] : [])),
      ...BANDS.map((b) => b.display),
      ...LOSS.liveDisplay,
      LOSS.deadDisplay,
      BIG.display,
    ]
    for (const n of shown) expect(post.content, n).toContain(n)
  })

  it('orders every state by score, empty rows last', () => {
    for (const s of STATES) {
      const values = s.rows.map((id) => ROWS[id].value ?? -Infinity)
      expect(values).toEqual([...values].sort((a, b) => b - a))
    }
  })

  it('draws humans as a tick with no bar', () => {
    expect(ROWS.humans.mark).toBe('tick')
    expect(rowLayout(0).humans.frac).toBe(0)
  })

  it('places shown rows in order and hides the rest', () => {
    const lay = rowLayout(0)
    expect(lay.claim).toMatchObject({ shown: true, y: 30 })
    expect(lay.sota).toMatchObject({ shown: true, y: 58 })
    expect(lay.email.shown).toBe(false)
  })

  it('picks the last heading above the line', () => {
    const tops = new Map([['the-setup', -400], ['and-yet', 200], ['the-time-machine-that-only-travels-sideways', 900]])
    expect(stateAt(tops, 480)).toBe(1)
    expect(stateAt(new Map(), 480)).toBe(0)
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/lib/openjev-data.test.ts`
Expected: FAIL with "Failed to resolve import ./openjev-data"

- [ ] **Step 3: Implement**

```ts
export const OPENJEV_SLUG = 'fine-tuning-openjev-on-62695-ab-tests'
export const REPO_URL = 'https://huggingface.co/NovusEdge/ctr-rank-deberta-v3-large'

// Pairwise accuracy on held-out Upworthy pairs. Chance is 0.5.
export const AXIS = { min: 0.4, max: 0.85, chance: 0.5 } as const

export type Mark = 'ours' | 'ink' | 'struck' | 'tick' | 'empty'

type Row = { label?: string; labelKey?: string; value: number | null; display?: string; displayKey?: string; mark: Mark }

export const ROWS = {
  claim: { label: 'ModernBERT, 2015 tail', value: 0.704, display: '0.704', mark: 'ours' },
  withdrawn: { labelKey: 'blog.openjev.withdrawn', value: 0.704, display: '0.704', mark: 'struck' },
  holdout: { label: 'ModernBERT, holdout', value: 0.637, display: '0.637', mark: 'ours' },
  exploratory: { label: 'ModernBERT, exploratory', value: 0.624, display: '0.624', mark: 'ours' },
  phase0: { label: 'MSE', value: 0.637, display: '0.637', mark: 'ours' },
  moreData: { label: 'MSE, more data', value: 0.724, display: '0.724', mark: 'ours' },
  rank: { label: 'Bradley-Terry', value: 0.775, display: '0.775', mark: 'ours' },
  rankMore: { label: 'Bradley-Terry, more data', value: 0.787, display: '0.787', mark: 'ours' },
  deberta: { label: 'OpenJev DeBERTa', value: 0.812, display: '0.812', mark: 'ours' },
  sota: { label: 'Linguistic features', value: 0.544, display: '0.544', mark: 'ink' },
  humans: { labelKey: 'blog.openjev.humans', value: 0.5, displayKey: 'blog.openjev.nearChance', mark: 'tick' },
  llama: { label: 'Llama-3-8B LoRA', value: 0.469, display: '0.469', mark: 'ink' },
  email: { labelKey: 'blog.openjev.email', value: null, displayKey: 'blog.openjev.noData', mark: 'empty' },
} satisfies Record<string, Row>

export type RowId = keyof typeof ROWS
export const ROW_IDS = Object.keys(ROWS) as RowId[]

export type State = { rows: RowId[]; bands?: true; loss?: true; big?: true }

const FINAL: RowId[] = ['deberta', 'sota', 'humans', 'llama']

export const STATES: State[] = [
  { rows: ['claim', 'sota', 'humans', 'llama'] },
  { rows: ['withdrawn', 'holdout', 'exploratory', 'sota', 'humans', 'llama'] },
  { rows: [], bands: true },
  { rows: ['withdrawn', 'holdout', 'sota', 'humans', 'llama'] },
  { rows: ['deberta', 'rankMore', 'rank', 'moreData', 'phase0', 'sota', 'humans', 'llama'], loss: true },
  { rows: FINAL, big: true },
  { rows: [...FINAL, 'email'], big: true },
]

// Reduced motion and small screens get the final board and the takeaway caption.
export const STATIC_STATE = 6
export const STATIC_CAPTION = 5

// Share of each split's arms dated before 2015. All three span Jan 2013 to Apr 2015.
export const BANDS = [
  { label: 'confirmatory', share: 0.835, display: '83.5%' },
  { label: 'holdout', share: 0.828, display: '82.8%' },
  { label: 'exploratory', share: 0.838, display: '83.8%' },
] as const

// The post gives four checkpoints for the live run and no step positions.
export const LOSS = {
  dead: Math.log(2),
  deadDisplay: '-log(0.5)',
  live: [0.709, 0.682, 0.62, 0.36],
  liveDisplay: ['0.709', '0.682', '0.620', '0.360'],
} as const

export const BIG = { display: '90.3%' } as const

// Ids are headingId() of the post's ## headings. Renaming a heading drops its
// state, so the test in openjev-data.test.ts reads them back from the post.
export const STATE_HEADINGS: [id: string, state: number][] = [
  ['the-setup', 0],
  ['and-yet', 1],
  ['the-time-machine-that-only-travels-sideways', 2],
  ['two-hypotheses-both-backwards', 3],
  ['the-part-that-actually-mattered', 4],
  ['but-what-does-0812-actually-mean', 5],
  ['okay-heres-where-i-ruin-it', 6],
]

export function stateAt(tops: Map<string, number>, line: number): number {
  let state = 0
  for (const [id, k] of STATE_HEADINGS) {
    const top = tops.get(id)
    if (top !== undefined && top <= line) state = k
  }
  return state
}

export const ROW_H = 28
export const ROWS_TOP = 30

export function rowLayout(k: number): Record<RowId, { shown: boolean; y: number; frac: number }> {
  const rows = STATES[k].rows
  const out = {} as Record<RowId, { shown: boolean; y: number; frac: number }>
  for (const id of ROW_IDS) {
    const row = ROWS[id]
    const i = rows.indexOf(id)
    const frac =
      row.value === null || row.mark === 'tick'
        ? 0
        : Math.min(1, Math.max(0, (row.value - AXIS.min) / (AXIS.max - AXIS.min)))
    out[id] = { shown: i >= 0, y: ROWS_TOP + Math.max(i, 0) * ROW_H, frac }
  }
  return out
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/lib/openjev-data.test.ts`
Expected: PASS. If "shows only numbers the post states" fails, the post changed. Stop and ask the owner which number is current. Do not edit the post.

- [ ] **Step 5: Commit**

```bash
git add src/lib/openjev-data.ts src/lib/openjev-data.test.ts
git commit -s -m "Add the OpenJev board states and the numbers behind them"
```

---

### Task 3: The board figure, static

**Files:**
- Create: `src/components/openjev-board.tsx`
- Modify: `src/i18n/locales/en.json`, `de.json`, `fi.json`, `ja.json`, `zh.json`
- Modify: `src/styles/global.css` (append after the Plan A block, before the portal block at the `/* Orientation portal` banner)
- Test: `src/components/openjev-board.test.tsx`

**Interfaces:**
- Consumes: everything from Task 2.
- Produces: `OpenJevBoard({ state, animate }: { state: number; animate: boolean })`, `OpenJevStatic()`, `OpenJevTable()`, constant `BAR_W`.

- [ ] **Step 1: Add the English keys**

Add to `src/i18n/locales/en.json`, next to the `blog.planA.*` keys:

```json
"blog.openjev.weights": "the weights",
"blog.openjev.typeset": "Set on Plan A's paper. Every number on the board is in the text.",
"blog.openjev.costLabel": "The first run cost about 40 cents. The whole project cost about 4 dollars.",
"blog.openjev.costFirst": "first run, 25 minutes on one L4",
"blog.openjev.costLast": "the whole project",
"blog.openjev.board": "The board",
"blog.openjev.caption.0": "Sixteen points over the published number.",
"blog.openjev.caption.1": "Two splits it never saw agree with each other.",
"blog.openjev.caption.2": "All three splits cover the same dates.",
"blog.openjev.caption.3": "Leakage and label noise both point the wrong way.",
"blog.openjev.caption.4": "Changing the loss beat adding data by double.",
"blog.openjev.caption.5": "The claim worth making is 90.3%.",
"blog.openjev.caption.6": "All of it is one publisher, 2013 to 2015.",
"blog.openjev.chance": "chance",
"blog.openjev.humans": "Humans",
"blog.openjev.nearChance": "~chance",
"blog.openjev.withdrawn": "withdrawn: 2015 tail",
"blog.openjev.email": "email subject lines",
"blog.openjev.noData": "no public data",
"blog.openjev.preShare": "share of arms before 2015",
"blog.openjev.bigLabel": "avoids the worst variant",
"blog.openjev.lossDead": "lr 2e-5: flat at -log(0.5) for 4,804 steps",
"blog.openjev.lossLive": "lr 6e-6: four logged checkpoints, evenly spaced",
"blog.openjev.tableCaption": "Pairwise accuracy on held-out Upworthy pairs",
"blog.openjev.entry": "Entry",
"blog.openjev.score": "Score"
```

- [ ] **Step 2: Translate the keys**

Run: `npm run i18n:translate`
Then: `npm run i18n:check`
Expected: the check passes and `de.json`, `fi.json`, `ja.json`, `zh.json` carry every new key. If the translate script fails because `$HOME/Projects/goob/.env` or its Gemini key is missing, stop and ask the owner. Do not hand-write four translations.

- [ ] **Step 3: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../i18n'
import { OpenJevBoard, OpenJevStatic } from './openjev-board'

function render(node: React.ReactNode) {
  return renderToStaticMarkup(<I18nextProvider i18n={i18nFor('en')}>{node}</I18nextProvider>)
}

function group(html: string, id: string): string {
  return html.match(new RegExp(`<g data-row="${id}"[^>]*>(.*?)</g>`))![0]
}

describe('OpenJevBoard', () => {
  it('shows the first claim and hides the email row at the start', () => {
    const html = render(<OpenJevBoard state={0} animate={false} />)
    expect(group(html, 'claim')).toContain('opacity="1"')
    expect(group(html, 'email')).toContain('opacity="0"')
  })

  it('draws humans as a tick with no bar', () => {
    const html = group(render(<OpenJevBoard state={5} animate={false} />), 'humans')
    expect(html).not.toContain('data-bar')
    expect(html).toContain('~chance')
  })

  it('carries no baked-in colours, so the theme toggle repaints it', () => {
    expect(render(<OpenJevBoard state={4} animate={false} />)).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it('renders the final board with the takeaway caption and a data table', () => {
    const html = render(<OpenJevStatic />)
    expect(html).toContain('The claim worth making is 90.3%.')
    expect(html).toContain('no public data')
    expect(html).toContain('<table')
  })
})
```

- [ ] **Step 4: Run it and confirm it fails**

Run: `npx vitest run src/components/openjev-board.test.tsx`
Expected: FAIL with "Failed to resolve import ./openjev-board"

- [ ] **Step 5: Implement the board**

```tsx
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  AXIS,
  BANDS,
  BIG,
  LOSS,
  ROWS,
  ROW_H,
  ROW_IDS,
  ROWS_TOP,
  STATES,
  STATIC_CAPTION,
  STATIC_STATE,
  rowLayout,
  type RowId,
} from '../lib/openjev-data'

const W = 380
const BAR_X = 168
export const BAR_W = 160
const ROWS_END = ROWS_TOP + 8 * ROW_H
const PARTS_Y = ROWS_END + 16
const H = PARTS_Y + 104
const xAt = (v: number) => BAR_X + ((v - AXIS.min) / (AXIS.max - AXIS.min)) * BAR_W
const lossY = (l: number) => PARTS_Y + 18 + ((0.75 - l) / 0.45) * 64
const lossX = (i: number) => 24 + (i * (W - 48)) / 3

const PARTS = ['axis', 'bands', 'loss', 'big'] as const
type Part = (typeof PARTS)[number]

function partsOf(k: number): Record<Part, boolean> {
  const s = STATES[k]
  return { axis: !s.bands, bands: !!s.bands, loss: !!s.loss, big: !!s.big }
}

function BoardRow({ id, y, frac, shown }: { id: RowId; y: number; frac: number; shown: boolean }) {
  const { t } = useTranslation()
  const row: { label?: string; labelKey?: string; display?: string; displayKey?: string; mark: string } = ROWS[id]
  const label = row.labelKey ? t(row.labelKey) : row.label
  const value = row.displayKey ? t(row.displayKey) : row.display
  const mid = ROW_H / 2
  return (
    <g data-row={id} className={`oj-row oj-${row.mark}`} transform={`translate(0 ${y})`} opacity={shown ? 1 : 0}>
      <text className="oj-label" x={0} y={mid} dominantBaseline="middle">
        {label}
      </text>
      {row.mark === 'tick' && <line x1={xAt(AXIS.chance)} x2={xAt(AXIS.chance)} y1={5} y2={ROW_H - 5} />}
      {row.mark === 'empty' && <line x1={BAR_X} x2={BAR_X + BAR_W} y1={mid} y2={mid} />}
      {row.mark !== 'tick' && row.mark !== 'empty' && (
        <rect data-bar x={BAR_X} y={7} height={ROW_H - 14} width={frac * BAR_W} />
      )}
      <text className="oj-value" x={W} y={mid} dominantBaseline="middle" textAnchor="end">
        {value}
      </text>
    </g>
  )
}

/**
 * React draws the geometry of the state the board mounted in and never again.
 * Once animated, GSAP owns every row's transform, opacity and bar width, so a
 * re-render that wrote those attributes would snap rows mid-tween.
 */
export function OpenJevBoard({ state, animate }: { state: number; animate: boolean }) {
  const { t } = useTranslation()
  const svg = useRef<SVGSVGElement>(null)
  const mounted = useRef(state)
  const prev = useRef(state)
  const drawn = animate ? mounted.current : state
  const lay = rowLayout(drawn)
  const parts = partsOf(drawn)

  useGSAP(
    () => {
      const el = svg.current
      if (!animate || !el || prev.current === state) return
      const from = rowLayout(prev.current)
      const to = rowLayout(state)
      const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'power2.out', overwrite: 'auto' } })
      ROW_IDS.forEach((id, i) => {
        const g = el.querySelector<SVGGElement>(`[data-row="${id}"]`)!
        const bar = g.querySelector('[data-bar]')
        const at = i * 0.05
        const width = to[id].frac * BAR_W
        if (to[id].shown && !from[id].shown) {
          tl.set(g, { y: to[id].y }, 0)
          if (bar) tl.set(bar, { attr: { width: 0 } }, 0)
          tl.to(g, { opacity: 1 }, at)
          if (bar) tl.to(bar, { attr: { width } }, at)
        } else if (!to[id].shown && from[id].shown) {
          tl.to(g, { opacity: 0, duration: 0.3 }, 0)
        } else if (to[id].shown) {
          tl.to(g, { y: to[id].y }, at)
          if (bar) tl.to(bar, { attr: { width } }, at)
        }
      })
      const a = partsOf(prev.current)
      const b = partsOf(state)
      for (const part of PARTS) {
        if (a[part] === b[part]) continue
        tl.to(el.querySelector(`[data-part="${part}"]`), { opacity: b[part] ? 1 : 0, duration: 0.4 }, b[part] ? 0.2 : 0)
      }
      prev.current = state
    },
    { dependencies: [state, animate], scope: svg },
  )

  return (
    <svg ref={svg} className="oj-board" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(`blog.openjev.caption.${state}`)}>
      <g data-part="axis" opacity={parts.axis ? 1 : 0}>
        <line className="oj-chance" x1={xAt(AXIS.chance)} x2={xAt(AXIS.chance)} y1={ROWS_TOP - 6} y2={ROWS_END} />
        <text className="oj-axis" x={xAt(AXIS.chance)} y={ROWS_TOP - 12} textAnchor="middle">
          {t('blog.openjev.chance')}
        </text>
      </g>

      {ROW_IDS.map((id) => (
        <BoardRow key={id} id={id} {...lay[id]} />
      ))}

      <g data-part="bands" opacity={parts.bands ? 1 : 0}>
        <text className="oj-axis" x={0} y={ROWS_TOP - 12}>
          {t('blog.openjev.preShare')}
        </text>
        {BANDS.map((b, i) => {
          const y = ROWS_TOP + i * ROW_H * 1.6
          return (
            <g key={b.label} transform={`translate(0 ${y})`}>
              <text className="oj-label" x={0} y={ROW_H / 2} dominantBaseline="middle">
                {b.label}
              </text>
              <rect className="oj-band-bg" x={BAR_X} y={7} height={ROW_H - 14} width={BAR_W} />
              <rect className="oj-band" x={BAR_X} y={7} height={ROW_H - 14} width={b.share * BAR_W} />
              <text className="oj-value" x={W} y={ROW_H / 2} dominantBaseline="middle" textAnchor="end">
                {b.display}
              </text>
            </g>
          )
        })}
      </g>

      <g data-part="loss" opacity={parts.loss ? 1 : 0}>
        <line className="oj-dead" x1={0} x2={W} y1={lossY(LOSS.dead)} y2={lossY(LOSS.dead)} />
        <text className="oj-axis" x={0} y={lossY(LOSS.dead) - 6}>
          {t('blog.openjev.lossDead')}
        </text>
        <polyline className="oj-live" points={LOSS.live.map((l, i) => `${lossX(i)},${lossY(l)}`).join(' ')} />
        {LOSS.live.map((l, i) => (
          <g key={i}>
            <circle className="oj-live-pt" cx={lossX(i)} cy={lossY(l)} r={2.5} />
            <text className="oj-axis" x={lossX(i)} y={lossY(l) + 13} textAnchor="middle">
              {LOSS.liveDisplay[i]}
            </text>
          </g>
        ))}
        <text className="oj-axis" x={W} y={H - 4} textAnchor="end">
          {t('blog.openjev.lossLive')}
        </text>
      </g>

      <g data-part="big" opacity={parts.big ? 1 : 0}>
        <text className="oj-big" x={0} y={PARTS_Y + 50}>
          {BIG.display}
        </text>
        <text className="oj-label" x={0} y={PARTS_Y + 74}>
          {t('blog.openjev.bigLabel')}
        </text>
      </g>
    </svg>
  )
}

export function OpenJevTable() {
  const { t } = useTranslation()
  return (
    <table className="sr-only">
      <caption>{t('blog.openjev.tableCaption')}</caption>
      <thead>
        <tr>
          <th>{t('blog.openjev.entry')}</th>
          <th>{t('blog.openjev.score')}</th>
        </tr>
      </thead>
      <tbody>
        {ROW_IDS.map((id) => {
          const row: { label?: string; labelKey?: string; display?: string; displayKey?: string } = ROWS[id]
          return (
            <tr key={id}>
              <td>{row.labelKey ? t(row.labelKey) : row.label}</td>
              <td>{row.displayKey ? t(row.displayKey) : row.display}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function OpenJevStatic() {
  const { t } = useTranslation()
  return (
    <figure className="oj-figure">
      <p className="pa-fence-head">{t('blog.openjev.board')}</p>
      <OpenJevBoard state={STATIC_STATE} animate={false} />
      <figcaption>{t(`blog.openjev.caption.${STATIC_CAPTION}`)}</figcaption>
      <OpenJevTable />
    </figure>
  )
}
```

- [ ] **Step 6: Add the board CSS**

Append to `src/styles/global.css`, directly after the Plan A block:

```css
/* OpenJev: Plan A's paper, with a leaderboard in the rail. Colours come from
   the --pa tokens only, so the site theme toggle repaints the board. */
.oj-figure {
  margin: 0;
  width: 100%;
}
.oj-figure figcaption {
  min-height: 1.45em;
  margin-top: 0.6em;
  font-size: 0.85em;
  color: color-mix(in srgb, var(--pa-ink) 75%, transparent);
}
.oj-board {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  font-family: var(--font-mono);
  font-size: 10.5px;
}
.oj-board text {
  fill: var(--pa-ink);
}
.oj-board .oj-label,
.oj-board .oj-axis {
  fill: color-mix(in srgb, var(--pa-ink) 70%, transparent);
}
.oj-ours rect {
  fill: var(--pa-ox-mark);
}
.oj-board .oj-ours .oj-value {
  fill: var(--pa-ox);
}
.oj-ink rect {
  fill: color-mix(in srgb, var(--pa-ink) 55%, var(--pa-ground));
}
.oj-struck rect {
  fill: color-mix(in srgb, var(--pa-ink) 18%, var(--pa-ground));
}
.oj-board .oj-struck text {
  text-decoration: line-through;
  fill: color-mix(in srgb, var(--pa-ink) 50%, transparent);
}
.oj-tick line {
  stroke: var(--pa-ink);
  stroke-width: 1.5;
}
.oj-empty line {
  stroke: var(--pa-rule);
  stroke-dasharray: 3 3;
}
.oj-board .oj-empty text {
  font-style: italic;
}
.oj-chance {
  stroke: color-mix(in srgb, var(--pa-ink) 45%, transparent);
  stroke-dasharray: 2 3;
}
.oj-band-bg {
  fill: color-mix(in srgb, var(--pa-ink) 10%, var(--pa-ground));
}
.oj-band {
  fill: var(--pa-ox-mark);
}
.oj-dead {
  stroke: color-mix(in srgb, var(--pa-ink) 55%, transparent);
  stroke-width: 1.5;
}
.oj-live {
  fill: none;
  stroke: var(--pa-ox-mark);
  stroke-width: 1.5;
}
.oj-live-pt {
  fill: var(--pa-ox-mark);
}
.oj-board .oj-big {
  font-family: 'ET Book', Georgia, serif;
  font-size: 44px;
  fill: var(--pa-ox);
}
.oj-inline {
  margin: 2.5rem 0;
}
@media (min-width: 1024px) {
  .oj-inline {
    display: none;
  }
}
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/components/openjev-board.test.tsx src/i18n/catalogs.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/openjev-board.tsx src/components/openjev-board.test.tsx src/i18n/locales src/i18n/translations.lock.json src/styles/global.css
git commit -s -m "Draw the OpenJev board as ink on Plan A's paper"
```

---

### Task 4: Drive the board from the scroll

**Files:**
- Modify: `src/components/openjev-board.tsx` (append)

**Interfaces:**
- Consumes: `OpenJevBoard`, `OpenJevTable` from Task 3; `STATE_HEADINGS`, `STATIC_STATE`, `STATIC_CAPTION`, `stateAt` from Task 2.
- Produces: `OpenJevRail()`, which renders nothing below 1024px.

- [ ] **Step 1: Implement the rail figure**

Add these imports to the top of `src/components/openjev-board.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/motion'
import { STATE_HEADINGS, stateAt } from '../lib/openjev-data'

gsap.registerPlugin(ScrollTrigger)
```

Merge them with the existing imports so each module is imported once. Then append:

```tsx
function headingTops(): Map<string, number> {
  return new Map(STATE_HEADINGS.map(([id]) => [id, document.getElementById(id)?.getBoundingClientRect().top ?? Infinity]))
}

const readState = () => stateAt(headingTops(), window.innerHeight * 0.6)

function RailFigure() {
  const { t } = useTranslation()
  const [reduced] = useState(prefersReducedMotion)
  // Mounts client-side only, so the headings exist and the first state snaps
  // instead of animating up from state 0 on a mid-page load.
  const [state, setState] = useState(() => (reduced ? STATIC_STATE : readState()))
  const caption = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reduced) return
      // A reflow can cross several headings in one update, so read the current
      // section instead of counting callbacks.
      ScrollTrigger.create({
        trigger: '.pa-body',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: () => setState(readState()),
        onRefresh: () => setState(readState()),
      })
    },
    { dependencies: [reduced], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      if (!reduced && caption.current) gsap.fromTo(caption.current, { opacity: 0 }, { opacity: 1, duration: 0.4, overwrite: 'auto' })
    },
    { dependencies: [state] },
  )

  return (
    <figure className="oj-figure">
      <p className="pa-fence-head">{t('blog.openjev.board')}</p>
      <OpenJevBoard state={state} animate={!reduced} />
      <figcaption ref={caption}>{t(`blog.openjev.caption.${reduced ? STATIC_CAPTION : state}`)}</figcaption>
      <OpenJevTable />
    </figure>
  )
}

export function OpenJevRail() {
  const [enabled, setEnabled] = useState(false)

  // Read at mount rather than at render: the route is prerendered in Node.
  useEffect(() => {
    const mq = matchMedia('(min-width: 1024px)')
    const sync = () => setEnabled(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return enabled ? <RailFigure /> : null
}
```

- [ ] **Step 2: Typecheck and rerun the board tests**

Run: `npx tsc --noEmit -p . && npx vitest run src/components/openjev-board.test.tsx`
Expected: no type errors, tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/openjev-board.tsx
git commit -s -m "Move the OpenJev board with the section being read"
```

The rail has no page to sit on until Task 5, so its scroll behaviour is checked there.

---

### Task 5: The page

**Files:**
- Create: `src/routes/blog/openjev-page.tsx`
- Modify: `src/routes/blog/post.tsx:21-24` (imports) and `:78-88` (slug routing)
- Modify: `src/App.tsx:63-64` (grain shader)
- Modify: `src/styles/global.css` (append `.pa` table and code rules after the `.oj-*` block)
- Test: `src/prerender.test.tsx`

**Interfaces:**
- Consumes: `PlanAMarkdown` with `slug` (Task 1), `OPENJEV_SLUG`, `REPO_URL` (Task 2), `OpenJevStatic` (Task 3), `OpenJevRail` (Task 4).
- Produces: `OpenJevPage({ post, image }: { post: Post; image?: string | null })`

- [ ] **Step 1: Write the failing test**

Append inside the `describe('blog prerendering')` block in `src/prerender.test.tsx`, and add `import { OPENJEV_SLUG } from './lib/openjev-data'` at the top:

```tsx
  it('renders the OpenJev board inline for readers without the rail', async () => {
    const page = await prerender({ url: `/blog/${OPENJEV_SLUG}` })

    expect(page.html).toContain('class="oj-board"')
    expect(page.html).toContain('~chance')
    expect(page.html).toContain('id="the-part-that-actually-mattered"')
    expect(page.html).toContain('pa-body')
    expect(page.html).not.toMatch(/<canvas\b/)
  })
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/prerender.test.tsx -t OpenJev`
Expected: FAIL. The page renders through the shared post shell, so `oj-board` is missing.

- [ ] **Step 3: Implement the page**

Create `src/routes/blog/openjev-page.tsx`:

```tsx
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { blogHeadings } from '../../lib/blog-headings'
import { PlanAMarkdown } from '../../components/plan-a-markdown'
import { OpenJevRail, OpenJevStatic } from '../../components/openjev-board'
import { REPO_URL } from '../../lib/openjev-data'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'

/**
 * The first run cost 40 cents and the project cost 4 dollars, drawn to scale
 * like Plan A's runway. The first mark sits a tenth of the way along.
 */
function CostStrip() {
  const { t } = useTranslation()
  const first = 0.4 + (99.2 * 0.4) / 4
  return (
    <figure className="pa-runway">
      <svg viewBox="-2 0 104 26" className="w-full" role="img" aria-label={t('blog.openjev.costLabel')}>
        <line x1="0.4" y1="13" x2="99.6" y2="13" stroke="color-mix(in srgb, var(--pa-ink) 30%, transparent)" strokeWidth="0.3" />
        <line x1="0.4" y1="13" x2={first} y2="13" stroke="var(--pa-ox)" strokeWidth="1.1" />
        <circle cx="0.4" cy="13" r="1.1" fill="var(--pa-ox)" />
        <circle cx={first} cy="13" r="1.1" fill="var(--pa-ox)" />
        <circle cx="99.6" cy="13" r="1.1" fill="none" stroke="color-mix(in srgb, var(--pa-ink) 45%, transparent)" strokeWidth="0.35" />
        <text x={first} y="7.6" fontSize="3.1" fill="var(--pa-ink)" textAnchor="middle">$0.40</text>
        <text x="0.4" y="21.5" fontSize="2.7" fill="color-mix(in srgb, var(--pa-ink) 60%, transparent)" textAnchor="start">{t('blog.openjev.costFirst')}</text>
        <text x="99.6" y="7.6" fontSize="3.1" fill="var(--pa-ink)" textAnchor="end">$4</text>
        <text x="99.6" y="21.5" fontSize="2.7" fill="color-mix(in srgb, var(--pa-ink) 60%, transparent)" textAnchor="end">{t('blog.openjev.costLast')}</text>
      </svg>
    </figure>
  )
}

export function OpenJevPage({ post, image }: { post: Post; image?: string | null }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  const toc = blogHeadings(post.content, post.slug)

  useEffect(() => {
    document.documentElement.classList.add('plan-a-paper')
    return () => document.documentElement.classList.remove('plan-a-paper')
  }, [])

  return (
    <div className="pa" lang={post.contentLocale}>
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <div className="pa-shell pb-24 pt-8">
        <nav className="pa-masthead">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
          <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
            {t('blog.openjev.weights')}
          </a>
        </nav>

        <header className="pa-head">
          <div className="pa-col">
            <h1>{post.title}</h1>
            <p className="pa-byline">
              NovusEdge
              <span className="pa-byline-sep">·</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
              </time>
            </p>
            <p className="pa-standfirst">{post.description}</p>
          </div>
          <CostStrip />
        </header>

        <hr />

        <nav className="pa-col pa-contents" aria-label={t('blog.contents')}>
          <h2>{t('blog.contents')}</h2>
          <ol>
            {toc.map((h, i) => (
              <li key={h.id}>
                <span className="pa-contents-n">{String(i + 1).padStart(2, '0')}</span>
                <a href={`#${h.id}`}>{h.text.replace(/\*/g, '')}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="pa-col oj-inline">
          <OpenJevStatic />
        </div>

        <div className="pa-spread">
          <div className="pa-col pa-body">
            <PlanAMarkdown slug={post.slug}>{post.content}</PlanAMarkdown>
          </div>
          <div className="pa-rail">
            <OpenJevRail />
          </div>
        </div>

        <hr />

        <footer className="pa-col pa-end">
          <p>{t('blog.openjev.typeset')}</p>
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </footer>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Route the slug**

In `src/routes/blog/post.tsx`, add beside the other page imports:

```tsx
import { OpenJevPage } from './openjev-page'
import { OPENJEV_SLUG } from '../../lib/openjev-data'
```

Add after the Plan A branch:

```tsx
  // The OpenJev release sits on Plan A's paper with a leaderboard that gets
  // revised as the post corrects its own first number.
  if (post.slug === OPENJEV_SLUG) return <OpenJevPage post={post} image={image} />
```

In `src/App.tsx`, import `OPENJEV_SLUG` from `./lib/openjev-data` and replace the grain line:

```tsx
        {/* The paper pages keep their surface free of the site's grain overlay. */}
        {bare !== '/blog/plan-a-ai' && bare !== `/blog/${OPENJEV_SLUG}` && <GrainShader />}
```

- [ ] **Step 5: Add table and code styles to the paper**

Append after the `.oj-*` block in `src/styles/global.css`:

```css
/* Plan A has no tables or code blocks. The OpenJev post has both. */
.pa table {
  width: 100%;
  margin: 1.6em 0;
  border-collapse: collapse;
  font-size: 0.85em;
  font-variant-numeric: tabular-nums;
}
.pa th,
.pa td {
  padding: 0.45em 0.8em 0.45em 0;
  border-bottom: 1px solid var(--pa-rule);
  text-align: left;
}
.pa td:not(:first-child),
.pa th:not(:first-child) {
  text-align: right;
}
.pa th {
  font-weight: 400;
  font-size: 0.82em;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--pa-ink) 60%, transparent);
  border-bottom-color: var(--pa-ink);
}
.pa pre {
  margin: 1.6em 0;
  padding: 0.9em 1.1em;
  border-left: 2px solid var(--pa-ox-mark);
  overflow-x: auto;
  font-size: 0.78em;
  line-height: 1.55;
}
.pa pre code {
  background: none;
  padding: 0;
}
@media (max-width: 640px) {
  .pa table {
    display: block;
    overflow-x: auto;
  }
}
```

- [ ] **Step 6: Run the tests**

Run: `npx tsc --noEmit -p . && npm test`
Expected: no type errors, all tests PASS

- [ ] **Step 7: Check it in the browser**

With `npm run dev` running, capture both widths into the session scratchpad:

```bash
S=/tmp/claude-1000/-home-novusedge-Projects-Personal-NovusEdge-github-io/e0b5221e-4d40-4229-b534-d1de05f4bdb3/scratchpad
chromium --headless=new --disable-gpu --hide-scrollbars --window-size=1440,2400 --virtual-time-budget=6000 --screenshot=$S/oj-desktop.png "http://localhost:5173/blog/fine-tuning-openjev-on-62695-ab-tests"
chromium --headless=new --disable-gpu --hide-scrollbars --window-size=390,2400 --virtual-time-budget=6000 --screenshot=$S/oj-mobile.png "http://localhost:5173/blog/fine-tuning-openjev-on-62695-ab-tests"
chromium --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --window-size=1440,2400 --virtual-time-budget=6000 --screenshot=$S/oj-reduced.png "http://localhost:5173/blog/fine-tuning-openjev-on-62695-ab-tests"
```

Read all three images. Expected: at 1440 the board sits in the rail at state 0 with no inline board. At 390 the inline board shows 0.812 and the email row, with no horizontal scroll. The reduced shot shows the rail at the final board.

Then ask the owner to scroll the page in a real browser, down and back up fast, in both themes. Headless screenshots cannot show scroll states.

- [ ] **Step 8: Commit**

```bash
git add src/routes/blog/openjev-page.tsx src/routes/blog/post.tsx src/App.tsx src/styles/global.css src/prerender.test.tsx
git commit -s -m "Serve the OpenJev post on Plan A's paper with the board in the rail"
```
