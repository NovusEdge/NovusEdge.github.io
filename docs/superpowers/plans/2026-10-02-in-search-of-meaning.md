# In Search of Meaning Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve every `in-search-of-meaning-*` post as a hand-drawn sketchbook page with a scroll-driven "two voices" set piece whose scribble tangle pulls into a figure's head.

**Architecture:** A bespoke route page (`MeaningPage`) like `PortalPage`, with its own markdown renderer (`MeaningMarkdown`) that turns headings, `[phrase](#ring)` links, `---` and a `[!voices]` blockquote into drawn SVG elements and the `Voices` stage. Geometry, scroll maths and data live in plain TypeScript modules under `src/lib/` with unit tests; the React components only wire them to the DOM inside effects, because every page is prerendered in Node.

**Tech Stack:** React 19, react-markdown + remark-gfm, Canvas 2D, SVG, Web Audio, vitest (Node environment, `renderToStaticMarkup`), Tailwind v4 global CSS.

**Spec:** `docs/superpowers/specs/2026-10-02-in-search-of-meaning-design.md`. Mockup: `docs/superpowers/mockups/in-search-of-meaning/combo.html`.

## Global Constraints

- Route: every slug starting with `in-search-of-meaning-` renders `MeaningPage`.
- Colours are site tokens only: paper `--color-bone` / dark `--color-charcoal`, ink the opposite, accent `--color-gold`.
- Prose and headings in `var(--font-prose)` (Supreme). Hand-lettering in Caveat at weights 500 and 700, falling back to `'Zen Kaku Gothic New', 'Noto Sans SC'` for CJK.
- Voices section is `420vh` with a sticky `100vh` stage. Phases: pull-in 0 to 0.16, lines 0.16 to 0.86, spill-out 0.88 to 1.
- Boil: three path variants per drawing, swapped every 125ms by one shared ticker. No SVG `feTurbulence` filters.
- The tangle canvas sits in a sticky layer (`sticky top-0 h-lvh -mb-[100lvh]`). Never `position: fixed` inside the route (`.page-enter` has a transform) and never portalled to `body`.
- Audio: owner clips only, panned 0.7 to the voice's side, toggle hidden unless a clip exists, off by default, English page only. No placeholder tones.
- Canvas, `requestAnimationFrame`, `IntersectionObserver`, `AudioContext` and `getComputedStyle` only inside effects. Prerendering runs the components in Node.
- Commits: `git commit -s`, no `Co-Authored-By` line, no em-dashes in messages.
- Do not edit `src/content/blog/in-search-of-meaning-01.md` or its translations. They are the owner's writing.

## Review Focus

- A translation mangles the `[!voices]` marker or the arrows: the block must fall back to an ordinary blockquote, never an empty stage. Test in Task 2.
- A reader jumps past the section (End key, anchor link, fast fling): only the newest line plays, never a burst of every clip. Test in Task 2.
- The site theme is toggled while the tangle is drawing: the canvas ink follows within a frame. Covered by the `MutationObserver` in Task 5 and checked in Task 7.
- JavaScript fails or has not hydrated: every voice line and the figure are visible, not stuck at opacity 0. Test in Task 5.
- The reader leaves the page mid-argument: the animation loop and any playing clip stop. Covered by effect cleanup in Task 5 and checked in Task 7.

---

### Task 0: Workspace

The current checkout is on `cli-tui-rebuild` with unrelated staged changes. Work on a new branch in a worktree off `main`.

- [ ] **Step 1: Create the worktree**

Use superpowers:using-git-worktrees to create branch `in-search-of-meaning` from `main`.

- [ ] **Step 2: Bring the design documents across and commit them**

From the original checkout, copy into the worktree at the same paths:

- `docs/superpowers/specs/2026-10-02-in-search-of-meaning-design.md`
- `docs/superpowers/plans/2026-10-02-in-search-of-meaning.md`
- `docs/superpowers/mockups/in-search-of-meaning/` (all files)

```bash
git add docs/superpowers/specs/2026-10-02-in-search-of-meaning-design.md docs/superpowers/plans/2026-10-02-in-search-of-meaning.md docs/superpowers/mockups/in-search-of-meaning
git commit -s -m "Add the In Search of Meaning page spec, plan and mockups"
```

- [ ] **Step 3: Copy the draft post for local preview, uncommitted**

Copy `src/content/blog/in-search-of-meaning-01.md` and `src/content/blog/translations/*/in-search-of-meaning-01.md` into the worktree. Do not `git add` them. Run `npm install` and `npm test` once to confirm a green baseline.

---

### Task 1: Data, slug routing helper and voice metadata

**Files:**
- Create: `src/lib/meaning-data.ts`
- Test: `src/lib/meaning-data.test.ts`

**Interfaces:**
- Produces: `MEANING_PREFIX`, `isMeaningSlug(slug: string): boolean`, `type DoodleKind = 'question' | 'spiral' | 'arrow' | 'star'`, `type Doodle = { after: string; kind: DoodleKind; side: 'left' | 'right' }`, `type VoiceMeta = { agit: number; audio?: string }`, `type MeaningPost`, `MEANING_POSTS: Record<string, MeaningPost>`, `voiceMeta(slug: string, index: number, count: number): VoiceMeta`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { isMeaningSlug, voiceMeta, MEANING_POSTS } from './meaning-data'

describe('isMeaningSlug', () => {
  it('matches the series prefix only', () => {
    expect(isMeaningSlug('in-search-of-meaning-01')).toBe(true)
    expect(isMeaningSlug('in-search-of-meaning-12')).toBe(true)
    expect(isMeaningSlug('plan-a-ai')).toBe(false)
    expect(isMeaningSlug('in-search-of-meaning')).toBe(false)
  })
})

describe('voiceMeta', () => {
  it('ramps agitation up and drops it on the last line when the post gives none', () => {
    const ramp = Array.from({ length: 8 }, (_, i) => voiceMeta('in-search-of-meaning-99', i, 8).agit)
    expect(ramp[0]).toBeCloseTo(0.2)
    expect(ramp[5]).toBeGreaterThan(ramp[1])
    expect(Math.max(...ramp)).toBeLessThanOrEqual(1)
    expect(ramp[7]).toBeCloseTo(0.12)
  })

  it('gives a single line a middling agitation', () => {
    expect(voiceMeta('in-search-of-meaning-99', 0, 1).agit).toBe(0.5)
  })

  it('prefers the post data and falls back per field', () => {
    MEANING_POSTS['in-search-of-meaning-test'] = { hero: { text: 'x' }, voices: [{ agit: 0.9, audio: '/a.mp3' }, { audio: '/b.mp3' }] }
    expect(voiceMeta('in-search-of-meaning-test', 0, 3)).toEqual({ agit: 0.9, audio: '/a.mp3' })
    expect(voiceMeta('in-search-of-meaning-test', 1, 3).audio).toBe('/b.mp3')
    expect(voiceMeta('in-search-of-meaning-test', 1, 3).agit).toBeGreaterThan(0)
    expect(voiceMeta('in-search-of-meaning-test', 2, 3).audio).toBeUndefined()
    delete MEANING_POSTS['in-search-of-meaning-test']
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/meaning-data.test.ts`
Expected: FAIL, cannot resolve `./meaning-data`.

- [ ] **Step 3: Write the implementation**

```ts
export const MEANING_PREFIX = 'in-search-of-meaning-'

export const isMeaningSlug = (slug: string) => slug.startsWith(MEANING_PREFIX) && slug.length > MEANING_PREFIX.length

export type DoodleKind = 'question' | 'spiral' | 'arrow' | 'star'
export type Doodle = { after: string; kind: DoodleKind; side: 'left' | 'right' }
export type VoiceMeta = { agit: number; audio?: string }

export type MeaningPost = {
  hero: { text: string; svg?: string }
  /** `after` is a headingId(); renaming the heading drops the doodle. */
  doodles?: Doodle[]
  /** By line index in the post's [!voices] block, so the markdown holds only translatable text. */
  voices?: Partial<VoiceMeta>[]
}

export const MEANING_POSTS: Record<string, MeaningPost> = {
  'in-search-of-meaning-01': { hero: { text: 'cogito, ergo sum' } },
}

// Rises to the peak three quarters of the way through, then the last line settles.
function defaultAgitation(index: number, count: number) {
  if (count <= 1) return 0.5
  if (index === count - 1) return 0.12
  return Math.min(1, 0.2 + (0.8 * index) / ((count - 1) * 0.75))
}

export function voiceMeta(slug: string, index: number, count: number): VoiceMeta {
  const given = MEANING_POSTS[slug]?.voices?.[index]
  return { agit: given?.agit ?? defaultAgitation(index, count), ...(given?.audio ? { audio: given.audio } : {}) }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/meaning-data.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/meaning-data.ts src/lib/meaning-data.test.ts
git commit -s -m "Add per-post data for the In Search of Meaning page"
```

---

### Task 2: Voices parsing and playback selection

**Files:**
- Create: `src/lib/meaning-voices.ts`
- Test: `src/lib/meaning-voices.test.ts`

**Interfaces:**
- Produces: `type VoiceSide = 'left' | 'right'`, `type VoiceLine = { side: VoiceSide; text: string }`, `nodeText(node: unknown): string`, `parseVoiceItem(text: string): VoiceLine | null`, `voicesFromNode(node: unknown): VoiceLine[] | null` (takes a hast `blockquote` element), `linesToPlay(prev: number, next: number, played: ReadonlySet<number>): number[]`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { linesToPlay, parseVoiceItem, voicesFromNode } from './meaning-voices'

const text = (value: string) => ({ type: 'text', value })
const el = (tagName: string, children: unknown[]) => ({ type: 'element', tagName, children })
const quote = (first: string, items: string[]) =>
  el('blockquote', [text('\n'), el('p', [text(first)]), text('\n'), el('ul', items.map((i) => el('li', [text(i)])))])

describe('parseVoiceItem', () => {
  it('reads the side from the leading arrow', () => {
    expect(parseVoiceItem('← You are thinking.')).toEqual({ side: 'left', text: 'You are thinking.' })
    expect(parseVoiceItem('  →   About what?  ')).toEqual({ side: 'right', text: 'About what?' })
  })
  it('drops an item without an arrow', () => {
    expect(parseVoiceItem('no arrow here')).toBeNull()
    expect(parseVoiceItem('→   ')).toBeNull()
  })
})

describe('voicesFromNode', () => {
  it('returns the lines of a [!voices] blockquote in order', () => {
    expect(voicesFromNode(quote('[!voices]', ['← one', '→ two', 'stray', '← three']))).toEqual([
      { side: 'left', text: 'one' },
      { side: 'right', text: 'two' },
      { side: 'left', text: 'three' },
    ])
  })
  it('leaves an ordinary blockquote alone', () => {
    expect(voicesFromNode(quote('Just a quote.', ['← one']))).toBeNull()
  })
  it('falls back to a blockquote when a translation lost every arrow', () => {
    expect(voicesFromNode(quote('[!voices]', ['- one', '* two']))).toBeNull()
  })
})

describe('linesToPlay', () => {
  it('plays the line that just appeared', () => {
    expect(linesToPlay(2, 3, new Set([0, 1]))).toEqual([2])
  })
  it('plays only the newest line after a jump', () => {
    expect(linesToPlay(0, 6, new Set())).toEqual([5])
  })
  it('never replays on the way back up or down again', () => {
    expect(linesToPlay(5, 4, new Set([4]))).toEqual([])
    expect(linesToPlay(4, 5, new Set([4]))).toEqual([])
  })
  it('plays nothing before the first line', () => {
    expect(linesToPlay(0, 0, new Set())).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/meaning-voices.test.ts`
Expected: FAIL, cannot resolve `./meaning-voices`.

- [ ] **Step 3: Write the implementation**

```ts
export type VoiceSide = 'left' | 'right'
export type VoiceLine = { side: VoiceSide; text: string }

const MARKER = '[!voices]'

type HastNode = { type?: string; tagName?: string; value?: string; children?: HastNode[] }

export function nodeText(node: unknown): string {
  const n = node as HastNode | null
  if (!n) return ''
  if (n.value) return n.value
  return (n.children ?? []).map(nodeText).join('')
}

export function parseVoiceItem(raw: string): VoiceLine | null {
  const m = raw.trim().match(/^([←→])\s*(.*)$/s)
  if (!m || !m[2].trim()) return null
  return { side: m[1] === '←' ? 'left' : 'right', text: m[2].trim() }
}

export function voicesFromNode(node: unknown): VoiceLine[] | null {
  const kids = ((node as HastNode | null)?.children ?? []).filter((c) => c.type === 'element')
  if (kids[0]?.tagName !== 'p' || nodeText(kids[0]).trim() !== MARKER) return null
  const lines = kids
    .filter((c) => c.tagName === 'ul' || c.tagName === 'ol')
    .flatMap((list) => (list.children ?? []).filter((c) => c.tagName === 'li'))
    .map((li) => parseVoiceItem(nodeText(li)))
    .filter((l): l is VoiceLine => l !== null)
  return lines.length ? lines : null
}

// A jump past several lines plays only the newest, so a fling or an anchor
// link never fires a burst of clips.
export function linesToPlay(prev: number, next: number, played: ReadonlySet<number>): number[] {
  if (next <= prev || next === 0 || played.has(next - 1)) return []
  return [next - 1]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/meaning-voices.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/meaning-voices.ts src/lib/meaning-voices.test.ts
git commit -s -m "Parse the voices block and pick which clip to play"
```

---

### Task 3: Tangle geometry and the boil ticker

**Files:**
- Create: `src/lib/meaning-tangle.ts`, `src/lib/boil.ts`
- Test: `src/lib/meaning-tangle.test.ts`, `src/lib/boil.test.ts`

**Interfaces:**
- Produces (`meaning-tangle.ts`): `rng(seed: number): () => number`, `type Pt = [number, number]`, `type Ellipse = { x: number; y: number; rx: number; ry: number }`, `type TangleCtx`, `makeStrokes(n: number, pts: number, seed: number): Pt[][]`, `drawTangle(ctx: TangleCtx, strokes: Pt[][], e: Ellipse, agit: number, frame: number, color: string, alpha: number, lineWidth: number): void`, `lerp(a, b, t)`, `smooth(a, b, x)`, `sectionProgress(top: number, height: number, vh: number): number`, `stagePhase(q: number, count: number): { m: number; shown: number }`, `presence(top: number, bottom: number, vh: number): number`, `ellipseAt(m: number, vw: number, vh: number, head: Ellipse): Ellipse`, `HEAD: Ellipse` (in figure coordinates, 280x380 box).
- Produces (`boil.ts`): `BOIL_MS = 125`, `onBoil(fn: (frame: number) => void): () => void`.

- [ ] **Step 1: Write the failing tests**

`src/lib/meaning-tangle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { drawTangle, ellipseAt, makeStrokes, presence, sectionProgress, stagePhase, type TangleCtx } from './meaning-tangle'

describe('makeStrokes', () => {
  it('is deterministic for a seed', () => {
    expect(makeStrokes(5, 20, 3)).toEqual(makeStrokes(5, 20, 3))
    expect(makeStrokes(5, 20, 3)).not.toEqual(makeStrokes(5, 20, 4))
  })
  it('stays roughly inside the unit circle', () => {
    for (const s of makeStrokes(40, 110, 5)) for (const [x, y] of s) expect(Math.hypot(x, y)).toBeLessThan(1.05)
  })
})

describe('drawTangle', () => {
  it('draws more and longer strokes when agitated', () => {
    const strokes = makeStrokes(80, 110, 5)
    const count = (agit: number) => {
      let n = 0
      let segs = 0
      const ctx: TangleCtx = {
        save() {}, restore() {}, beginPath() {}, moveTo() {}, quadraticCurveTo() { segs++ }, stroke() { n++ },
        strokeStyle: '', globalAlpha: 1, lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
      }
      drawTangle(ctx, strokes, { x: 0, y: 0, rx: 100, ry: 100 }, agit, 0, '#000', 1, 1)
      return { n, segs }
    }
    expect(count(0).n).toBe(20)
    expect(count(1).n).toBe(80)
    expect(count(1).segs).toBeGreaterThan(count(0).segs)
  })
})

describe('scroll maths', () => {
  it('maps a section scrolling past to 0..1', () => {
    expect(sectionProgress(100, 4200, 1000)).toBe(0)
    expect(sectionProgress(-1600, 4200, 1000)).toBe(0.5)
    expect(sectionProgress(-9000, 4200, 1000)).toBe(1)
  })
  it('pulls in, shows every line, then spills out', () => {
    expect(stagePhase(0, 8)).toEqual({ m: 0, shown: 0 })
    expect(stagePhase(0.16, 8)).toEqual({ m: 1, shown: 0 })
    expect(stagePhase(0.5, 8).shown).toBeGreaterThan(2)
    expect(stagePhase(0.86, 8)).toEqual({ m: 1, shown: 8 })
    expect(stagePhase(1, 8)).toEqual({ m: 0, shown: 8 })
  })
  it('fades the tangle in before the section and out after it', () => {
    expect(presence(1300, 5500, 1000)).toBe(0)
    expect(presence(0, 4200, 1000)).toBe(1)
    expect(presence(-4200, 0, 1000)).toBe(0)
  })
  it('moves the ellipse from the screen to the head', () => {
    const head = { x: 640, y: 300, rx: 62, ry: 78 }
    const at = ellipseAt(1, 1280, 900, head)
    for (const k of ['x', 'y', 'rx', 'ry'] as const) expect(at[k]).toBeCloseTo(head[k])
    expect(ellipseAt(0, 1280, 900, head).rx).toBeGreaterThan(900)
  })
})
```

`src/lib/boil.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOIL_MS, onBoil } from './boil'

afterEach(() => vi.useRealTimers())

describe('onBoil', () => {
  it('ticks every subscriber on one shared interval and stops when the last leaves', () => {
    vi.useFakeTimers()
    const a = vi.fn()
    const b = vi.fn()
    const offA = onBoil(a)
    const offB = onBoil(b)
    vi.advanceTimersByTime(BOIL_MS * 2)
    expect(a).toHaveBeenCalledTimes(2)
    expect(b).toHaveBeenCalledTimes(2)
    offA()
    offA()
    offB()
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(BOIL_MS * 4)
    expect(a).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/meaning-tangle.test.ts src/lib/boil.test.ts`
Expected: FAIL, cannot resolve the modules.

- [ ] **Step 3: Write `src/lib/meaning-tangle.ts`**

```ts
export type Pt = [number, number]
export type Ellipse = { x: number; y: number; rx: number; ry: number }
export type TangleCtx = Pick<CanvasRenderingContext2D, 'save' | 'restore' | 'beginPath' | 'moveTo' | 'quadraticCurveTo' | 'stroke'> & {
  strokeStyle: string | CanvasGradient | CanvasPattern
  globalAlpha: number
  lineWidth: number
  lineCap: CanvasLineCap
  lineJoin: CanvasLineJoin
}

/** The figure's head in its own 280x380 drawing box. */
export const HEAD: Ellipse = { x: 140, y: 140, rx: 62, ry: 78 }

export function rng(seed: number) {
  let s = seed >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}

// Random walks that steer back toward the centre at the rim, so the tangle
// fills whatever ellipse it is scaled into.
export function makeStrokes(n: number, pts: number, seed: number): Pt[][] {
  const r = rng(seed)
  const strokes: Pt[][] = []
  for (let k = 0; k < n; k++) {
    const a = r() * Math.PI * 2
    const rad = Math.sqrt(r()) * 0.85
    let x = Math.cos(a) * rad
    let y = Math.sin(a) * rad
    let ang = r() * Math.PI * 2
    const turn = 0.6 + r() * 1.4
    const p: Pt[] = []
    for (let i = 0; i < pts; i++) {
      ang += (r() - 0.5) * turn
      if (Math.hypot(x, y) > 0.86) {
        const diff = ((Math.atan2(-y, -x) - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI
        ang += diff * 0.5
      }
      x += Math.cos(ang) * 0.03
      y += Math.sin(ang) * 0.03
      p.push([x, y])
    }
    strokes.push(p)
  }
  return strokes
}

// A new frame value re-rolls the jitter; changing it a few times a second is the boil.
export function drawTangle(ctx: TangleCtx, strokes: Pt[][], e: Ellipse, agit: number, frame: number, color: string, alpha: number, lineWidth: number) {
  const count = Math.round(strokes.length * (0.25 + 0.75 * agit))
  const amp = 0.5 + agit * 2.2
  const r = rng(frame * 977 + 13)
  ctx.save()
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let k = 0; k < count; k++) {
    const s = strokes[k]
    const len = Math.floor(s.length * (0.4 + 0.6 * agit))
    ctx.beginPath()
    let px = 0
    let py = 0
    for (let i = 0; i < len; i++) {
      const X = e.x + s[i][0] * e.rx + (r() - 0.5) * amp
      const Y = e.y + s[i][1] * e.ry + (r() - 0.5) * amp
      if (i === 0) ctx.moveTo(X, Y)
      else ctx.quadraticCurveTo(px, py, (px + X) / 2, (py + Y) / 2)
      px = X
      py = Y
    }
    ctx.stroke()
  }
  ctx.restore()
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function smooth(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function sectionProgress(top: number, height: number, vh: number) {
  return Math.max(0, Math.min(1, -top / (height - vh)))
}

export function stagePhase(q: number, count: number) {
  const m = smooth(0, 0.16, q) * (1 - smooth(0.88, 1, q))
  const shown = Math.min(count, Math.floor(smooth(0.16, 0.86, q) * (count + 0.999)))
  return { m, shown }
}

export function presence(top: number, bottom: number, vh: number) {
  return smooth(1.3 * vh, 0, top) * smooth(0, 0.9 * vh, bottom)
}

export function ellipseAt(m: number, vw: number, vh: number, head: Ellipse): Ellipse {
  const R = Math.hypot(vw, vh) * 0.62
  return { x: lerp(vw / 2, head.x, m), y: lerp(vh / 2, head.y, m), rx: lerp(R, head.rx, m), ry: lerp(R, head.ry, m) }
}
```

- [ ] **Step 4: Write `src/lib/boil.ts`**

```ts
export const BOIL_MS = 125

const subscribers = new Set<(frame: number) => void>()
let timer: ReturnType<typeof setInterval> | undefined
let frame = 0

// One interval for every drawing on the page, so they boil in step and an
// off-screen drawing costs nothing.
export function onBoil(fn: (frame: number) => void) {
  subscribers.add(fn)
  timer ??= setInterval(() => {
    frame++
    subscribers.forEach((s) => s(frame))
  }, BOIL_MS)
  return () => {
    subscribers.delete(fn)
    if (!subscribers.size && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/meaning-tangle.test.ts src/lib/boil.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/meaning-tangle.ts src/lib/meaning-tangle.test.ts src/lib/boil.ts src/lib/boil.test.ts
git commit -s -m "Add the scribble tangle geometry and a shared boil ticker"
```

---

### Task 4: Drawn SVG primitives

**Files:**
- Create: `src/components/meaning/drawn.tsx`
- Test: `src/components/meaning/drawn.test.tsx`
- Modify: `src/styles/global.css` (append the `.ms` base and drawn rules)

**Interfaces:**
- Consumes: `rng` from `src/lib/meaning-tangle.ts`, `onBoil` from `src/lib/boil.ts`, `prefersReducedMotion` from `src/lib/motion.ts`, `DoodleKind` from `src/lib/meaning-data.ts`.
- Produces: `type DrawnKind = 'underline' | 'ring' | 'squiggle' | DoodleKind`, `jitterPath(d: string, amp: number, r: () => number): string`, `drawnVariants(kind: DrawnKind, w: number, h: number, seed: number): string[]` (always 3), `Drawn({ kind, accent?, seed?, delay?, className? })`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Drawn, drawnVariants, jitterPath, type DrawnKind } from './drawn'
import { rng } from '../../lib/meaning-tangle'

const KINDS: DrawnKind[] = ['underline', 'ring', 'squiggle', 'question', 'spiral', 'arrow', 'star']

describe('drawnVariants', () => {
  it.each(KINDS)('gives three distinct, repeatable paths for %s', (kind) => {
    const v = drawnVariants(kind, 300, 40, 7)
    expect(v).toHaveLength(3)
    expect(new Set(v).size).toBe(3)
    for (const d of v) expect(d.startsWith('M')).toBe(true)
    expect(drawnVariants(kind, 300, 40, 7)).toEqual(v)
  })
})

describe('jitterPath', () => {
  it('moves every coordinate by at most the amplitude', () => {
    const out = jitterPath('M 10 10 L 20 20', 1, rng(1))
    const nums = out.match(/-?\d+(\.\d+)?/g)!.map(Number)
    expect(nums).toHaveLength(4)
    nums.forEach((n, i) => expect(Math.abs(n - [10, 10, 20, 20][i])).toBeLessThanOrEqual(1))
  })
})

describe('Drawn', () => {
  it('renders a hidden, undrawn path that effects fill in on the client', () => {
    const html = renderToStaticMarkup(<Drawn kind="ring" accent />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('ms-draw-ring')
    expect(html).toContain('ms-accent')
    expect(html).toContain('pathLength="1"')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/meaning/drawn.test.tsx`
Expected: FAIL, cannot resolve `./drawn`.

- [ ] **Step 3: Write `src/components/meaning/drawn.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { onBoil } from '../../lib/boil'
import { rng } from '../../lib/meaning-tangle'
import { prefersReducedMotion } from '../../lib/motion'
import type { DoodleKind } from '../../lib/meaning-data'

export type DrawnKind = 'underline' | 'ring' | 'squiggle' | DoodleKind

export function jitterPath(d: string, amp: number, r: () => number) {
  return d.replace(/-?\d+(\.\d+)?/g, (n) => (parseFloat(n) + (r() - 0.5) * 2 * amp).toFixed(1))
}

function base(kind: DrawnKind, w: number, h: number, r: () => number): string {
  const j = (a: number) => (r() - 0.5) * a
  switch (kind) {
    case 'underline': {
      const y = h / 2
      const n = Math.max(3, Math.round(w / 60))
      let d = `M ${j(4)} ${y + j(3)}`
      for (let i = 1; i <= n; i++) {
        const x = (w * i) / n
        d += ` Q ${x - w / n / 2 + j(10)} ${y + j(6)} ${x + (i === n ? 8 : 0)} ${y + j(3)}`
      }
      return d
    }
    case 'ring': {
      // Overshoots its start and drifts up, the way a quick circle by hand does.
      const cx = w / 2
      const cy = h / 2
      let d = ''
      for (let i = 0; i <= 44; i++) {
        const a = -2.6 + (i / 40) * Math.PI * 2
        const wob = 1 + j(0.05)
        d += `${i ? ' L' : 'M'} ${cx + Math.cos(a) * (w / 2 - 2) * wob} ${cy + Math.sin(a) * (h / 2 - 2) * wob - i * 0.15}`
      }
      return d
    }
    case 'squiggle': {
      let d = `M ${w * 0.3} ${h / 2}`
      for (let x = w * 0.3; x < w * 0.7; x += 14) d += ` q 7 ${-14 + j(4)} 14 0`
      return d
    }
    case 'spiral': {
      let d = ''
      for (let i = 0; i < 90; i++) {
        const a = i * 0.24
        const rad = 2 + i * 0.36
        d += `${i ? ' L' : 'M'} ${35 + Math.cos(a) * rad} ${35 + Math.sin(a) * rad}`
      }
      return d
    }
    case 'question':
      return 'M 22 22 C 22 6 50 6 50 22 C 50 34 36 34 36 46 M 36 58 L 37 60'
    case 'arrow':
      return 'M 6 14 C 24 6 48 20 66 34 M 54 34 L 67 35 L 62 22'
    case 'star': {
      const c = w / 2
      return `M ${c - 18} 44 L ${c} 6 L ${c + 18} 44 L ${c - 22} 20 L ${c + 22} 20 Z`
    }
  }
}

export function drawnVariants(kind: DrawnKind, w: number, h: number, seed: number) {
  const d = base(kind, w, h, rng(seed))
  return [1, 2, 3].map((v) => jitterPath(d, 0.8, rng(seed * 31 + v * 7919)))
}

export function Drawn({ kind, accent, seed = 1, delay = 150, className = '' }: { kind: DrawnKind; accent?: boolean; seed?: number; delay?: number; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    const path = svg?.firstElementChild as SVGPathElement | null
    if (!svg || !path) return
    let variants: string[] = []
    const build = () => {
      const { width, height } = svg.getBoundingClientRect()
      variants = drawnVariants(kind, width, height, seed)
      path.setAttribute('d', variants[0])
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(svg)

    if (prefersReducedMotion()) {
      svg.classList.add('ms-drawn')
      return () => ro.disconnect()
    }

    let off = () => {}
    let timer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        off()
        if (!entry.isIntersecting) return
        timer = window.setTimeout(() => svg.classList.add('ms-drawn'), delay)
        off = onBoil((f) => path.setAttribute('d', variants[f % 3]))
      },
      { rootMargin: '0px 0px -25% 0px' },
    )
    io.observe(svg)
    return () => {
      ro.disconnect()
      io.disconnect()
      off()
      clearTimeout(timer)
    }
  }, [kind, seed, delay])

  return (
    <svg ref={ref} aria-hidden="true" className={`ms-draw ms-draw-${kind}${accent ? ' ms-accent' : ''}${className ? ` ${className}` : ''}`}>
      <path pathLength={1} />
    </svg>
  )
}
```

- [ ] **Step 4: Append the base and drawn rules to `src/styles/global.css`**

```css
/* In Search of Meaning. Ink and paper swap with the site theme; gold stays. */
.ms {
  --ms-paper: var(--color-bone);
  --ms-ink: var(--color-charcoal);
  --ms-accent: var(--color-gold);
  position: relative;
  overflow-x: clip;
  background: var(--ms-paper);
  color: var(--ms-ink);
}
.dark .ms {
  --ms-paper: var(--color-charcoal);
  --ms-ink: var(--color-bone);
}
.ms-draw { position: absolute; overflow: visible; pointer-events: none; }
.ms-draw path {
  fill: none;
  stroke: var(--ms-ink);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.1s cubic-bezier(0.6, 0.05, 0.3, 1);
}
.ms-draw.ms-accent path { stroke: var(--ms-accent); stroke-width: 2.4; }
.ms-draw.ms-drawn path { stroke-dashoffset: 0; }
.ms-draw-underline { left: 0; bottom: -10px; width: 100%; height: 14px; }
.ms-draw-ring { left: -14px; top: -10px; width: calc(100% + 28px); height: calc(100% + 20px); }
.ms-draw-squiggle, .ms-draw-star { inset: 0; width: 100%; height: 100%; }
.ms-doodle { top: 0; width: 70px; height: 70px; }
.ms-doodle-left { left: -120px; }
.ms-doodle-right { right: -120px; }
@media (max-width: 1000px) {
  .ms-doodle { display: none; }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/meaning/drawn.test.tsx`
Expected: PASS, 9 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/meaning/drawn.tsx src/components/meaning/drawn.test.tsx src/styles/global.css
git commit -s -m "Add hand-drawn SVG primitives that draw in and boil"
```

---

### Task 5: The voices stage

**Files:**
- Create: `src/components/meaning/voices.tsx`
- Test: `src/components/meaning/voices.test.tsx`
- Modify: `src/styles/global.css` (append the stage rules), `src/i18n/locales/en.json` (four keys)

**Interfaces:**
- Consumes: Tasks 1 to 3 (`VoiceMeta`, `VoiceLine`, `linesToPlay`, `HEAD`, `makeStrokes`, `drawTangle`, `sectionProgress`, `stagePhase`, `presence`, `ellipseAt`, `lerp`, `smooth`), `jitterPath` and `rng` for the figure boil, `onBoil`, `prefersReducedMotion`, `isMobile`.
- Produces: `TangleLayerContext: React.Context<RefObject<HTMLCanvasElement | null> | null>`, `Voices({ lines, meta, locale }: { lines: VoiceLine[]; meta: VoiceMeta[]; locale: string })`, `FIGURE_PATH: string`.

- [ ] **Step 1: Add the i18n keys to `src/i18n/locales/en.json`**

The file is a flat object with sorted keys. Add, in sorted position:

```json
"blog.meaning.figure": "A figure with a head full of scribbles, two voices arguing either side",
"blog.meaning.play": "Play this line",
"blog.meaning.soundOff": "sound off",
"blog.meaning.soundOn": "sound on",
```

The other four catalogs are filled by `scripts/translate-ui.mjs`, which needs `GEMINI_API_KEY`. Ask the owner for the env file path and run `node --env-file=<path> scripts/translate-ui.mjs`, or ask the owner to run it. Until it has run, `src/i18n/catalogs.test.ts` and `npm run i18n:check` fail on these keys. That is expected; do not add the keys to other catalogs by hand.

- [ ] **Step 2: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { Voices } from './voices'

const lines = [
  { side: 'left' as const, text: 'You are thinking.' },
  { side: 'right' as const, text: 'About what?' },
  { side: 'left' as const, text: 'Something is.' },
]
const quiet = lines.map(() => ({ agit: 0.3 }))
const voiced = [{ agit: 0.3, audio: '/a.mp3' }, { agit: 0.5 }, { agit: 0.1 }]

function render(meta = quiet, locale = 'en') {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <Voices lines={lines} meta={meta} locale={locale} />
    </I18nextProvider>,
  )
}

describe('Voices', () => {
  it('keeps the lines in reading order in one list, sides marked for layout', () => {
    const html = render()
    const order = ['You are thinking.', 'About what?', 'Something is.'].map((t) => html.indexOf(t))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(html.match(/<ol/g)).toHaveLength(1)
    expect(html).toContain('data-side="left"')
    expect(html).toContain('data-side="right"')
  })

  it('renders still, with every line visible, before hydration', () => {
    const html = render()
    expect(html).toContain('ms-still')
    expect(html).not.toContain('opacity:0')
  })

  it('labels the figure', () => {
    expect(render()).toContain('role="img"')
  })

  it('shows the sound toggle only on the English page with at least one clip', () => {
    expect(render(quiet, 'en')).not.toContain('ms-sound')
    expect(render(voiced, 'en')).toContain('ms-sound')
    expect(render(voiced, 'de')).not.toContain('ms-sound')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/components/meaning/voices.test.tsx`
Expected: FAIL, cannot resolve `./voices`.

- [ ] **Step 4: Write `src/components/meaning/voices.tsx`**

```tsx
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { onBoil } from '../../lib/boil'
import type { VoiceMeta } from '../../lib/meaning-data'
import { linesToPlay, type VoiceLine } from '../../lib/meaning-voices'
import { HEAD, drawTangle, ellipseAt, lerp, makeStrokes, presence, rng, sectionProgress, smooth, stagePhase } from '../../lib/meaning-tangle'
import { isMobile, prefersReducedMotion } from '../../lib/motion'
import { jitterPath } from './drawn'

/** The page's sticky canvas. The page owns it so the tangle can cover the whole screen. */
export const TangleLayerContext = createContext<RefObject<HTMLCanvasElement | null> | null>(null)

// Head and shoulders in a 280x380 box; HEAD is this head's ellipse.
export const FIGURE_PATH =
  'M 140 42 C 92 40 62 82 64 138 C 66 196 100 236 142 238 C 186 238 218 196 216 136 C 214 80 186 44 140 42 Z' +
  ' M 118 236 C 120 256 118 268 112 280 M 164 236 C 162 256 164 268 170 280' +
  ' M 112 280 C 70 288 34 310 22 372 M 170 280 C 212 288 248 310 258 372'

const inkColor = () => getComputedStyle(document.querySelector('.ms') ?? document.documentElement).getPropertyValue('--ms-ink').trim() || '#1a1a1a'

function lineOpacity(i: number, shown: number) {
  if (i >= shown) return 0
  const age = shown - 1 - i
  return age < 2 ? 1 : Math.max(0.18, 1 - age * 0.22)
}

export function Voices({ lines, meta, locale }: { lines: VoiceLine[]; meta: VoiceMeta[]; locale: string }) {
  const { t } = useTranslation()
  const layer = useContext(TangleLayerContext)
  // Rendered still on the server and before hydration, so nothing is hidden if JS never runs.
  const [mode, setMode] = useState<'still' | 'motion'>('still')
  const [sound, setSound] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const figRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const stillCanvas = useRef<HTMLCanvasElement>(null)
  const soundRef = useRef(false)
  const audioCtx = useRef<AudioContext | null>(null)
  const playing = useRef<HTMLAudioElement[]>([])
  const hasAudio = locale === 'en' && meta.some((m) => m.audio)

  const playLine = (i: number) => {
    const src = meta[i]?.audio
    const ac = audioCtx.current
    if (!src || !ac || !soundRef.current) return
    const el = new Audio(src)
    const pan = ac.createStereoPanner()
    pan.pan.value = lines[i].side === 'left' ? -0.7 : 0.7
    ac.createMediaElementSource(el).connect(pan).connect(ac.destination)
    playing.current.push(el)
    void el.play()
  }
  const playRef = useRef(playLine)
  playRef.current = playLine

  const toggleSound = () => {
    soundRef.current = !soundRef.current
    setSound(soundRef.current)
    audioCtx.current ??= new AudioContext()
    if (!soundRef.current) playing.current.forEach((a) => a.pause())
  }

  useEffect(() => {
    if (!prefersReducedMotion()) setMode('motion')
    return () => {
      playing.current.forEach((a) => a.pause())
      void audioCtx.current?.close()
    }
  }, [])

  // The figure boils with the page's drawings.
  useEffect(() => {
    if (mode !== 'motion' || !pathRef.current) return
    const path = pathRef.current
    const variants = [1, 2, 3].map((v) => jitterPath(FIGURE_PATH, 0.8, rng(v * 7919)))
    return onBoil((f) => path.setAttribute('d', variants[f % 3]))
  }, [mode])

  // Still mode: one tangle in the head, redrawn when the theme changes.
  useEffect(() => {
    const canvas = stillCanvas.current
    if (mode !== 'still' || !canvas) return
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const s = width / 280
      drawTangle(ctx, makeStrokes(46, 80, 11), { x: HEAD.x * s, y: HEAD.y * s, rx: HEAD.rx * s, ry: HEAD.ry * s }, 0.5, 0, inkColor(), 0.85, 1.3)
    }
    draw()
    const mo = new MutationObserver(draw)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [mode])

  // Motion mode: scroll drives the lines and the tangle on the page's sticky canvas.
  useEffect(() => {
    const canvas = layer?.current
    const section = sectionRef.current
    const fig = figRef.current
    const list = listRef.current
    if (mode !== 'motion' || !canvas || !section || !fig || !list) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const items = [...list.children] as HTMLElement[]
    const strokes = makeStrokes(80, 110, 5)
    const dpr = Math.min(devicePixelRatio || 1, isMobile() ? 1.5 : 2)
    const played = new Set<number>()
    let ink = inkColor()
    let agit = 0.15
    let lastShown = -1
    let raf = 0

    const clear = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const tick = (now: number) => {
      const vw = canvas.clientWidth
      const vh = canvas.clientHeight
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
        canvas.width = Math.round(vw * dpr)
        canvas.height = Math.round(vh * dpr)
      }
      const r = section.getBoundingClientRect()
      const { m, shown } = stagePhase(sectionProgress(r.top, r.height, vh), lines.length)
      if (shown !== lastShown) {
        items.forEach((el, i) => (el.style.opacity = String(lineOpacity(i, shown))))
        for (const i of linesToPlay(Math.max(0, lastShown), shown, played)) {
          played.add(i)
          playRef.current(i)
        }
        lastShown = shown
      }
      const pres = presence(r.top, r.bottom, vh)
      const target = m > 0.5 ? (shown ? meta[shown - 1].agit : 0.15) : r.top > 0 ? lerp(0.2, 0.7, pres) : 0.12
      agit += (target - agit) * 0.05

      const fr = fig.getBoundingClientRect()
      const s = fr.width / 280
      const cr = canvas.getBoundingClientRect()
      const head = { x: fr.left - cr.left + HEAD.x * s, y: fr.top - cr.top + HEAD.y * s, rx: HEAD.rx * s, ry: HEAD.ry * s }
      fig.style.setProperty('--ms-fig', String(smooth(0.5, 1, m)))

      clear()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const alpha = lerp((0.06 + agit * 0.12) * pres, 0.85, m)
      if (alpha > 0.005) drawTangle(ctx, strokes, ellipseAt(m, vw, vh, head), agit, Math.floor(now / (140 - agit * 85)), ink, alpha, lerp(1.4, 1.3, m))
      raf = requestAnimationFrame(tick)
    }

    // Runs only while the section is within reach of the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(raf)
        if (entry.isIntersecting) raf = requestAnimationFrame(tick)
        else clear()
      },
      { rootMargin: '130% 0px 90% 0px' },
    )
    io.observe(section)
    const mo = new MutationObserver(() => (ink = inkColor()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(raf)
      clear()
    }
  }, [mode, layer, lines, meta])

  return (
    <section ref={sectionRef} className={`ms-voices ${mode === 'still' ? 'ms-still' : 'ms-motion'}`} style={{ '--ms-n': lines.length } as CSSProperties}>
      <div className="ms-stage">
        <div ref={figRef} className="ms-figure" role="img" aria-label={t('blog.meaning.figure')}>
          <svg viewBox="0 0 280 380" aria-hidden="true">
            <path ref={pathRef} d={FIGURE_PATH} />
          </svg>
          {mode === 'still' && <canvas ref={stillCanvas} aria-hidden="true" />}
        </div>
        <ol ref={listRef} className="ms-voice-list">
          {lines.map((line, i) => (
            <li key={i} data-side={line.side} style={{ '--ms-row': i + 1 } as CSSProperties}>
              {line.text}
              {mode === 'still' && sound && meta[i]?.audio && (
                <button type="button" className="ms-play" aria-label={t('blog.meaning.play')} onClick={() => playLine(i)}>
                  ▸
                </button>
              )}
            </li>
          ))}
        </ol>
        {hasAudio && (
          <button type="button" className="ms-sound" aria-pressed={sound} onClick={toggleSound}>
            {sound ? t('blog.meaning.soundOn') : t('blog.meaning.soundOff')}
          </button>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Append the stage rules to `src/styles/global.css`**

```css
/* Full-bleed out of the 640px column. Each line gets its own grid row so the
   argument reads top to bottom, alternating sides, in DOM order. */
.ms-voices { position: relative; z-index: 1; width: 100vw; margin-left: calc(50% - 50vw); }
.ms-voices.ms-motion { height: 420vh; }
.ms-stage {
  display: grid;
  grid-template-columns: 1fr 280px 1fr;
  align-content: center;
  column-gap: 24px;
  row-gap: 10px;
  max-width: 1060px;
  margin: 0 auto;
  padding: 0 20px;
}
.ms-motion .ms-stage { position: sticky; top: 0; height: 100vh; }
.ms-still .ms-stage { padding-block: 10vh; }
.ms-figure { position: relative; grid-column: 2; grid-row: 1 / span var(--ms-n); align-self: center; width: 280px; height: 380px; }
.ms-figure svg, .ms-figure canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.ms-figure path { fill: none; stroke: var(--ms-ink); stroke-width: 2.2; stroke-linecap: round; }
.ms-motion .ms-figure svg { opacity: var(--ms-fig, 0); }
.ms-voice-list { display: contents; list-style: none; }
.ms-voice-list li {
  grid-row: var(--ms-row);
  margin: 0;
  max-width: 300px;
  font: 600 26px/1.15 'Caveat', 'Zen Kaku Gothic New', 'Noto Sans SC', cursive;
  transition: opacity 0.35s;
}
.ms-motion .ms-voice-list li { opacity: 0; }
.ms-voice-list li[data-side='left'] { grid-column: 1; justify-self: end; text-align: right; }
.ms-voice-list li[data-side='right'] { grid-column: 3; justify-self: start; color: var(--ms-accent); }
.ms-sound, .ms-play {
  background: none;
  border: 1.5px solid currentColor;
  border-radius: 16px;
  color: var(--ms-ink);
  font: 600 20px/1 'Caveat', cursive;
  cursor: pointer;
}
.ms-sound { position: absolute; top: 4vh; left: 50%; transform: translateX(-50%); padding: 4px 12px 6px; opacity: 0.6; }
.ms-sound[aria-pressed='true'] { opacity: 1; color: var(--ms-accent); }
.ms-still .ms-sound { position: static; transform: none; grid-column: 1 / -1; justify-self: center; }
.ms-play { margin-left: 8px; padding: 0 8px; font-size: 16px; }
@media (max-width: 760px) {
  .ms-stage { grid-template-columns: 1fr; }
  .ms-figure { grid-column: 1; grid-row: 1; justify-self: center; width: 176px; height: 240px; }
  .ms-voice-list li { grid-column: 1 !important; grid-row: calc(var(--ms-row) + 1); font-size: 22px; }
  .ms-voice-list li[data-side='left'] { justify-self: start; text-align: left; }
  .ms-voice-list li[data-side='right'] { justify-self: end; text-align: right; }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/components/meaning/voices.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 7: Commit**

```bash
git add src/components/meaning/voices.tsx src/components/meaning/voices.test.tsx src/styles/global.css src/i18n/locales/en.json
git commit -s -m "Add the two-voices stage with the scroll-driven tangle"
```

---

### Task 6: MeaningMarkdown

**Files:**
- Create: `src/components/meaning/markdown.tsx`
- Test: `src/components/meaning/markdown.test.tsx`
- Modify: `src/styles/global.css` (append the column rules)

**Interfaces:**
- Consumes: `blogHeadings` from `src/lib/blog-headings.ts`, `MEANING_POSTS`, `voiceMeta`, `Doodle` (Task 1), `voicesFromNode`, `nodeText` (Task 2), `Drawn` (Task 4), `Voices` (Task 5).
- Produces: `doodleLines(markdown: string, slug: string, doodles: Doodle[]): Map<number, Doodle>`, `MeaningMarkdown({ slug, locale, children }: { slug: string; locale: string; children: string })`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { MeaningMarkdown, doodleLines } from './markdown'

const SLUG = 'in-search-of-meaning-test'

function render(md: string) {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <MeaningMarkdown slug={SLUG} locale="en">{md}</MeaningMarkdown>
    </I18nextProvider>,
  )
}

describe('MeaningMarkdown', () => {
  it('underlines headings and keeps their ids', () => {
    const html = render('## The doubt\n\ntext')
    expect(html).toContain('id="the-doubt"')
    expect(html).toContain('ms-draw-underline')
  })

  it('rings a #ring link instead of linking it', () => {
    const html = render('to [demolish everything](#ring) and start')
    expect(html).toContain('class="ms-ring"')
    expect(html).toContain('ms-draw-ring')
    expect(html).not.toContain('href="#ring"')
  })

  it('draws a squiggle in place of a rule', () => {
    const html = render('one\n\n---\n\ntwo')
    expect(html).toContain('ms-divider')
    expect(html).not.toContain('<hr')
  })

  it('turns a [!voices] blockquote into the stage', () => {
    const html = render('> [!voices]\n> - ← one\n> - → two\n')
    expect(html).toContain('ms-voices')
    expect(html).not.toContain('<blockquote')
  })

  it('leaves other blockquotes as blockquotes', () => {
    expect(render('> Just a quote.')).toContain('<blockquote')
  })

  it('opens external links in a new tab', () => {
    expect(render('[x](https://example.com)')).toContain('target="_blank"')
  })
})

describe('doodleLines', () => {
  it('places a doodle on the first paragraph after its heading', () => {
    const md = '## One\n\nfirst\n\n## Two\n\n> quote\n\nsecond para\n'
    const map = doodleLines(md, SLUG, [{ after: 'two', kind: 'spiral', side: 'right' }])
    expect([...map.keys()]).toEqual([9])
  })

  it('ignores a doodle whose heading is gone', () => {
    expect(doodleLines('## One\n\ntext', SLUG, [{ after: 'renamed', kind: 'star', side: 'left' }]).size).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/meaning/markdown.test.tsx`
Expected: FAIL, cannot resolve `./markdown`.

- [ ] **Step 3: Write `src/components/meaning/markdown.tsx`**

```tsx
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blogHeadings, headingId } from '../../lib/blog-headings'
import { MEANING_POSTS, voiceMeta, type Doodle } from '../../lib/meaning-data'
import { voicesFromNode } from '../../lib/meaning-voices'
import { Drawn } from './drawn'
import { Voices } from './voices'

// Blocks a doodle cannot sit in: headings, quotes, lists, tables, fences, rules.
const NOT_PARAGRAPH = /^(#|>|[-*+] |\d+\. |\||```|---)/

export function doodleLines(markdown: string, slug: string, doodles: Doodle[]) {
  const lines = markdown.split('\n')
  const heads = blogHeadings(markdown, slug)
  const out = new Map<number, Doodle>()
  for (const d of doodles) {
    const head = heads.find((h) => h.id === d.after)
    if (!head) continue
    for (let i = head.line; i < lines.length; i++) {
      const text = lines[i].trim()
      if (!text) continue
      if (text.startsWith('## ')) break
      // A quote or list counts as its own block; skip past it to the next paragraph.
      if (NOT_PARAGRAPH.test(text)) continue
      out.set(i + 1, d)
      break
    }
  }
  return out
}

export function MeaningMarkdown({ slug, locale, children }: { slug: string; locale: string; children: string }) {
  const ids = new Map(blogHeadings(children, slug).map((h) => [h.line, h.id]))
  const doodles = doodleLines(children, slug, MEANING_POSTS[slug]?.doodles ?? [])

  const components: Components = {
    h2({ node, children: kids, ...props }) {
      const line = node?.position?.start.line ?? 0
      return (
        <h2 id={ids.get(line) ?? headingId(String(kids))} {...props}>
          {kids}
          <Drawn kind="underline" seed={line} />
        </h2>
      )
    },
    p({ node, children: kids, ...props }) {
      const d = doodles.get(node?.position?.start.line ?? 0)
      return (
        <p {...props}>
          {d && <Drawn kind={d.kind} seed={node?.position?.start.line} className={`ms-doodle ms-doodle-${d.side}`} />}
          {kids}
        </p>
      )
    },
    a({ href, children: kids, ...props }) {
      if (href === '#ring') {
        return (
          <span className="ms-ring">
            {kids}
            <Drawn kind="ring" accent />
          </span>
        )
      }
      const external = !!href && /^https?:\/\//.test(href)
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})} {...props}>
          {kids}
        </a>
      )
    },
    hr() {
      return (
        <div className="ms-divider" aria-hidden="true">
          <Drawn kind="squiggle" />
        </div>
      )
    },
    blockquote({ node, children: kids, ...props }) {
      const lines = voicesFromNode(node)
      if (!lines) return <blockquote {...props}>{kids}</blockquote>
      return <Voices lines={lines} meta={lines.map((_, i) => voiceMeta(slug, i, lines.length))} locale={locale} />
    },
  }

  return (
    <div className="ms-col ms-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
```

- [ ] **Step 4: Append the column rules to `src/styles/global.css`**

```css
.ms-col {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: var(--font-prose);
  font-size: 19px;
  line-height: 1.75;
}
.ms-prose h2 { position: relative; display: inline-block; font: 600 24px/1.3 var(--font-prose); margin: 2.4em 0 0.8em; }
.ms-prose p { position: relative; margin: 0 0 1.3em; }
/* Paper behind the prose so the tangle never crosses a line of text. */
.ms-prose p, .ms-prose h2 { background: var(--ms-paper); box-shadow: 0 0 28px 22px var(--ms-paper); }
.ms-prose a { text-decoration: underline; text-decoration-color: var(--ms-accent); text-underline-offset: 3px; }
.ms-prose blockquote { border-left: 2px solid var(--ms-accent); padding-left: 1em; font-style: italic; }
.ms-ring { position: relative; }
.ms-divider { position: relative; height: 40px; margin: 3em 0; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/meaning/markdown.test.tsx`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/meaning/markdown.tsx src/components/meaning/markdown.test.tsx src/styles/global.css
git commit -s -m "Render In Search of Meaning posts with drawn headings, rings and voices"
```

---

### Task 7: The page, the route and verification

**Files:**
- Create: `src/routes/blog/meaning-page.tsx`
- Test: `src/routes/blog/meaning-page.test.tsx`
- Modify: `src/routes/blog/post.tsx` (route the prefix, after the `what-did-we-all-miss` branch at line 94), `index.html:83` (add Caveat), `src/styles/global.css` (page rules)

**Interfaces:**
- Consumes: `isMeaningSlug`, `MEANING_POSTS` (Task 1), `Drawn` (Task 4), `TangleLayerContext` (Task 5), `MeaningMarkdown` (Task 6), `Meta`, `TLink`, `PostSignoff`, `useLocalePath`, `type Post`.
- Produces: `MeaningPage({ post, image }: { post: Post; image?: string | null })`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router'
import { i18nFor } from '../../i18n'
import { MeaningPage } from './meaning-page'
import type { Post } from '../../lib/posts'

const post = (slug: string): Post => ({
  slug,
  title: 'In Search of Meaning #1',
  date: '2026-09-16',
  tags: [],
  description: 'A brief note on meaning and purpose',
  content: '## The doubt\n\ntext',
  contentLocale: 'en',
})

function render(p: Post) {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <MemoryRouter>
        <MeaningPage post={p} />
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe('MeaningPage', () => {
  it('sets the hero from the post data and the title as the heading', () => {
    const html = render(post('in-search-of-meaning-01'))
    expect(html).toContain('cogito, ergo sum')
    expect(html).toMatch(/<h1[^>]*>In Search of Meaning #1<\/h1>/)
  })

  it('falls back to the description for an entry with no data', () => {
    expect(render(post('in-search-of-meaning-77'))).toContain('A brief note on meaning and purpose')
  })

  it('puts the tangle canvas in a hidden sticky layer', () => {
    expect(render(post('in-search-of-meaning-01'))).toMatch(/class="ms-tangle-layer" aria-hidden="true"><canvas/)
  })
})
```

If `MemoryRouter` is not exported by the installed `react-router`, check how `src/i18n/use-locale-path.test.ts` wraps routed components and use that.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/routes/blog/meaning-page.test.tsx`
Expected: FAIL, cannot resolve `./meaning-page`.

- [ ] **Step 3: Write `src/routes/blog/meaning-page.tsx`**

```tsx
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import type { Post } from '../../lib/posts'
import { MEANING_POSTS } from '../../lib/meaning-data'
import { Drawn } from '../../components/meaning/drawn'
import { MeaningMarkdown } from '../../components/meaning/markdown'
import { TangleLayerContext } from '../../components/meaning/voices'
import { PostSignoff } from '../../components/post-signoff'
import { useLocalePath } from '../../i18n/use-locale-path'

export function MeaningPage({ post, image }: { post: Post; image?: string | null }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const tangle = useRef<HTMLCanvasElement>(null)
  const hero = MEANING_POSTS[post.slug]?.hero ?? { text: post.description }

  return (
    <TangleLayerContext.Provider value={tangle}>
      <div className="ms" lang={post.contentLocale}>
        <Meta title={post.title} description={post.description || post.title} image={image} />
        <div className="ms-tangle-layer" aria-hidden="true">
          <canvas ref={tangle} />
        </div>

        <header className="ms-col">
          <nav className="ms-back">
            <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
          </nav>
          <h1 className="ms-kicker">{post.title}</h1>
          <p className="ms-hero">
            {hero.svg ? <img src={hero.svg} alt={hero.text} /> : hero.text}
            <Drawn kind="underline" accent delay={400} />
          </p>
        </header>

        <MeaningMarkdown slug={post.slug} locale={post.contentLocale}>
          {post.content}
        </MeaningMarkdown>

        <div className="ms-col">
          <div className="ms-end" aria-hidden="true">
            <Drawn kind="star" accent />
          </div>
        </div>

        <div className="ms-signoff">
          <PostSignoff variant={0} />
        </div>
      </div>
    </TangleLayerContext.Provider>
  )
}
```

- [ ] **Step 4: Append the page rules to `src/styles/global.css`**

```css
/* Sticky, not fixed: .page-enter carries a transform, so a fixed layer here
   would size itself to the whole page. */
.ms-tangle-layer { position: sticky; top: 0; height: 100lvh; margin-bottom: -100lvh; pointer-events: none; z-index: 0; }
.ms-tangle-layer canvas { display: block; width: 100%; height: 100%; }
.ms-back { padding-top: 6rem; font: 12px/1 var(--font-mono); letter-spacing: 0.2em; text-transform: uppercase; }
.ms-kicker { margin: 14vh 0 0; font: 600 12px/1 var(--font-prose); letter-spacing: 0.25em; text-transform: uppercase; opacity: 0.55; }
.ms-hero {
  position: relative;
  display: inline-block;
  margin: 6vh 0 10vh;
  font: 700 clamp(56px, 11vw, 104px)/1 'Caveat', 'Zen Kaku Gothic New', 'Noto Sans SC', cursive;
}
.ms-hero img { display: block; width: auto; height: 1em; }
.ms-end { position: relative; height: 50px; margin: 3em 0 20vh; }
.ms-signoff { position: relative; z-index: 1; max-width: 56rem; margin: 0 auto; padding: 0 1.5rem 6rem; }
```

- [ ] **Step 5: Route the prefix in `src/routes/blog/post.tsx`**

Add the imports next to the other page imports:

```tsx
import { MeaningPage } from './meaning-page'
import { isMeaningSlug } from '../../lib/meaning-data'
```

After the `what-did-we-all-miss` branch:

```tsx
  // The meaning series is a sketchbook still being drawn, with a set piece of
  // two voices arguing around a head full of scribbles.
  if (isMeaningSlug(post.slug)) return <MeaningPage post={post} image={image} />
```

- [ ] **Step 6: Load Caveat in `index.html`**

In the Google Fonts `href` at line 83, add `&family=Caveat:wght@500;700` before `&display=swap`.

- [ ] **Step 7: Run the page test and the full suite**

Run: `npx vitest run src/routes/blog/meaning-page.test.tsx`
Expected: PASS, 3 tests.

Run: `npx tsc --noEmit -p . && npm test`
Expected: type check clean. Tests all pass except `src/i18n/catalogs.test.ts` if the four `blog.meaning.*` keys from Task 5 have not been translated yet. Run the translation step from Task 5 Step 1 now if it is still pending, then `npm run i18n:check` and `npm test` must both pass.

- [ ] **Step 8: Commit**

```bash
git add src/routes/blog/meaning-page.tsx src/routes/blog/meaning-page.test.tsx src/routes/blog/post.tsx index.html src/styles/global.css src/i18n/locales
git commit -s -m "Serve the In Search of Meaning series on its sketchbook page"
```

- [ ] **Step 9: Verify in the browser**

The draft post copied in Task 0 has no headings or voices block yet. For this check only, write a scratch post at `src/content/blog/in-search-of-meaning-99.md` with `draft: true`, two `##` sections of a few paragraphs, a `[phrase](#ring)`, a `---`, and the eight placeholder voice lines from `docs/superpowers/mockups/in-search-of-meaning/scribble.js` in a `[!voices]` block. Delete it before the final commit.

Run `npm run dev` in the background and use the chrome-devtools tools:

1. At 1440x900, scroll from the top through the voices section and out the other side. The heading underlines and ring draw in. The tangle creeps in before the section, pulls into the head, lines appear in order, and the tangle spills out and fades. Scroll back up: lines fade back out in reverse.
2. Toggle the site theme mid-section. Paper, prose, drawings and the canvas ink all switch.
3. At 390x844 with mobile and touch emulation: the stage stacks, the figure is on top, nothing overflows horizontally (`document.documentElement.scrollWidth === innerWidth`).
4. With 4x CPU throttling, record a performance trace while scrolling through the voices section at 390x844. Frames hold near 60fps.
5. Set `a11y-reduced-motion` on `<html>` and reload: drawings are fully drawn and still, the voices section is short with every line visible and a still tangle in the head, no background tangle.
6. Navigate to `/blog` mid-section. The console shows no errors and the tangle canvas is gone.
7. Load the German page of the scratch post if a translation exists, or confirm with `docs/superpowers/mockups` that the arrows are the only side markers. The `[!voices]` marker check after a real `translate:blog` run belongs to the owner's content step.

- [ ] **Step 10: Remove the scratch post and confirm a clean tree**

```bash
rm src/content/blog/in-search-of-meaning-99.md
git status --short
```

Expected: only the uncommitted draft post files from Task 0 are listed.

---

## Owner follow-ups, outside this plan

- Decide whether *cogito, ergo sum* stays as the first line of the markdown now that it is the hero.
- Trace the hero lettering to SVG and set `hero.svg` in `MEANING_POSTS`.
- Record voice clips into `public/assets/blog/meaning/in-search-of-meaning-01/voice-NN.mp3` and list them under `voices` in `MEANING_POSTS`.
- Pick doodle placements once the essay has headings.
- After `npm run translate:blog`, check each translation kept `[!voices]` and the arrows.
