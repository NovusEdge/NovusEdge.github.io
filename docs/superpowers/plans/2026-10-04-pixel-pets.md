# Pixel Pets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A resident pixel cat on every page, a rare stoat visitor, cat micro-moments (404, loading, blog sign-off), and a pixel-me desk scene with a neural net on `/about`.

**Architecture:** Python generators in `tools/sprites/` export Clawd-format JSON into `src/assets/sprites/`. The site reads that JSON through one canvas component (`PixelSprite`) driven by one shared animation ticker. Cat and stoat behavior live in pure reducer modules under `src/lib/pet/` so they test without a DOM; thin React components wire them to the page. The engine ships first with the two approved clips (idle, walk) and falls back to `idle` for any clip not drawn yet, so the art tasks can land one at a time.

**Tech Stack:** React 19, TypeScript, Vite 7, vitest 4 (node environment, no DOM; components are tested with `renderToStaticMarkup`), react-i18next, Python 3 + Pillow 12 for the generators.

**Spec:** `docs/superpowers/specs/2026-10-04-pixel-pets-design.md`

## Global Constraints

- Sprites are drawn at 32x32 (cat), about 32x20 (stoat), 32x52 and 99x57 (pixel-me), and shown at an integer scale, 2x by default.
- Loops have 12 to 16 frames. Fast one-shots (swat, startle) may have fewer.
- Coats: `tuxedo`, `orange`, `black`, `shiny`, as palette swaps of one drawing.
- Pixel-me ships baked to outfit `sweater`, skin `light`. No other outfits or skins on the site.
- Walk cycles are hand-keyed pose by pose. Never generate legs with a parametric rig.
- Every new art clip is checked side by side against the sleek sitting idle for mass and proportion before it is accepted.
- The pet layer mounts outside `.page-enter` (its transform breaks `position: fixed` inside it).
- Reduced motion = `prefersReducedMotion()` from `src/lib/motion.ts` (covers both the OS setting and the site's `a11y-reduced-motion` class).
- Settings persist in `localStorage` key `pet-prefs`, read and written inside try/catch.
- UI strings go through react-i18next in all six locales. After adding English keys run `node --env-file=.env scripts/translate-ui.mjs`; the pre-commit hook runs `vitest run` and `translate-ui.mjs --check`.
- Commits use `git commit -s`, no `Co-Authored-By` line, no em-dashes in messages.
- Sprites are decorative: `aria-hidden`, not focusable.
- Prerendered HTML must not change because of the pet layer: it renders nothing on the server.

## Review Focus

1. **A sprite JSON with a clip the code asks for but the art has not drawn yet** (e.g. `groom` before Task 8 lands). Expected: the cat plays `idle` instead and one-shots end at once, no crash. Pinned in Task 1 (`resolveClip`) and Task 4.
2. **`localStorage` throws (Safari private mode, blocked site data) or holds garbage JSON.** Expected: defaults load, the page renders, nothing throws. Pinned in Task 3.
3. **Viewport narrower than the walk distance, or resized smaller while the cat is near the right edge.** Expected: the cat's x is clamped into the viewport on the next tick. Pinned in Task 4.
4. **Two cats on screen at once** (desk scene in view or 404 page, plus the wandering cat). Expected: the wandering cat hides while any stage claim is held, and comes back when it is released. Pinned in Task 2 (stage store) and Task 10.
5. **Tab hidden for minutes, then shown.** Expected: the ticker clamps the frame delta so the cat does not fast-forward through dozens of frames or teleport. Pinned in Task 2 (`clampDelta`).

---

## File Structure

| Path | Responsibility |
|---|---|
| `tools/sprites/styles/sleek/` | Sleek cat generator (idle). Moved from the spec reference folder. |
| `tools/sprites/walk-sleek/` | Hand-keyed walk generator; its `build.py` writes `cat.json` with idle + walk. |
| `tools/sprites/me/` | Pixel-me generator; `build.py` writes `me.json`. |
| `tools/sprites/cat-anims/` | One module per new cat clip (Tasks 8, 9). |
| `tools/sprites/stoat/` | Stoat generator (Task 13). |
| `tools/sprites/export.py` | Merges generator output into site JSON. |
| `src/assets/sprites/cat.json`, `me.json`, `stoat.json` | Site sprite data, checked in. |
| `src/lib/pet/sprite.ts` | Sprite types, `paletteFor`, `resolveClip`, `validateSprite`. |
| `src/lib/pet/player.ts` | Pure playhead: advance a clip by elapsed ms. |
| `src/lib/pet/ticker.ts` | One shared `requestAnimationFrame` loop with delta clamping. |
| `src/lib/pet/stage.ts` | Stage-claim store: micro-moments hide the wandering cat. |
| `src/lib/pet/prefs.ts` | Load and save pet settings. |
| `src/lib/pet/cat-brain.ts` | Pure cat state machine. |
| `src/lib/pet/stoat.ts` | Visit odds, season, script choice. |
| `src/lib/pet/neural-net.ts` | Node layout and pulse intensity for the desk net. |
| `src/components/pet/pixel-sprite.tsx` | Canvas renderer. |
| `src/components/pet/pet-layer.tsx` | Mounts the wandering cat and stoat, wires events. |
| `src/components/pet/pet-panel.tsx` | Settings button and panel. |
| `src/components/pet/stage-cat.tsx` | A fixed-place cat for micro-moments; claims the stage. |
| `src/components/pet/desk-scene.tsx` | Pixel-me desk, cat in the slot, neural net. |
| `src/components/pet/stoat-visitor.tsx` | Plays one stoat visit script. |

---

### Task 1: Sprite pipeline and sprite module

**Files:**
- Move: `docs/superpowers/specs/2026-10-04-pixel-pets/{styles,walk-sleek,me}` to `tools/sprites/`
- Move: `docs/superpowers/specs/2026-10-04-pixel-pets/chibi-suite-draft.json` to `tools/sprites/chibi-suite-draft.json`
- Create: `tools/sprites/export.py`, `tools/sprites/cat-anims/__init__.py`
- Create: `src/assets/sprites/cat.json`, `src/assets/sprites/me.json` (generated)
- Create: `src/lib/pet/sprite.ts`, `src/lib/pet/sprite.test.ts`
- Modify: `docs/superpowers/specs/2026-10-04-pixel-pets-design.md` (reference-set path)
- Modify: `.gitignore`

**Interfaces:**
- Produces:
  - `type Frame = { ms: number; px: string[]; typing?: boolean }`
  - `type Clip = { loop: boolean; frames: Frame[]; travel?: number; w?: number; h?: number; catSlot?: [number, number, number, number] }`
  - `type Sprite = { w: number; h: number; palette: Record<string, string>; palettes?: Record<string, Record<string, string>>; animations: Record<string, Clip> }`
  - `paletteFor(sprite: Sprite, variant?: string): Record<string, string>`
  - `resolveClip(sprite: Sprite, name: string): { name: string; clip: Clip; fallback: boolean }`
  - `clipSize(sprite: Sprite, clip: Clip): { w: number; h: number }`
  - `validateSprite(sprite: Sprite): string[]` (empty array = valid)
  - `import cat from '../../assets/sprites/cat.json'`, same for `me.json`

- [ ] **Step 1: Move the generators and fix the spec path**

```bash
mkdir -p tools/sprites
git mv docs/superpowers/specs/2026-10-04-pixel-pets/styles tools/sprites/styles
git mv docs/superpowers/specs/2026-10-04-pixel-pets/walk-sleek tools/sprites/walk-sleek
git mv docs/superpowers/specs/2026-10-04-pixel-pets/me tools/sprites/me
git mv docs/superpowers/specs/2026-10-04-pixel-pets/chibi-suite-draft.json tools/sprites/chibi-suite-draft.json
printf '__pycache__/\ntools/sprites/**/png/\n' >> .gitignore
```

In the spec, replace the sentence "Approved art and its generators are in `docs/superpowers/specs/2026-10-04-pixel-pets/`." with "Approved art and its generators are in `tools/sprites/`." and replace `chibi-suite-draft.json` mentions with `tools/sprites/chibi-suite-draft.json`.

Confirm the generators still run from their new home:

```bash
(cd tools/sprites/walk-sleek && python3 build.py) && (cd tools/sprites/me && python3 build.py)
```

Expected: both finish and rewrite `cat.json` / `me.json` in their own folders.

- [ ] **Step 2: Write the exporter**

`tools/sprites/cat-anims/__init__.py` is an empty file.

`tools/sprites/export.py`:

```python
"""Writes the site's sprite JSON. Run each generator's build.py first."""
import importlib
import json
import os
import pkgutil
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', '..', 'src', 'assets', 'sprites')

# Effect letters shared by every coat (z's, "?", heart, motion marks, mouth).
CAT_EFFECTS = {'U': '#e0707a', 'Z': '#aab0c8', 'Q': '#f2c94c', 'R': '#ff6b80', 'X': '#d8d8e0'}


def load(path):
    with open(os.path.join(ROOT, path)) as f:
        return json.load(f)


def write(name, data):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name), 'w') as f:
        json.dump(data, f, separators=(',', ':'))
        f.write('\n')


def cat():
    s = load('walk-sleek/cat.json')
    s['palette'] = {**s['palette'], **CAT_EFFECTS}
    for coat in s['palettes'].values():
        for k, v in CAT_EFFECTS.items():
            coat.setdefault(k, v)
    anims = os.path.join(ROOT, 'cat-anims')
    sys.path.insert(0, anims)
    for mod in sorted(m.name for m in pkgutil.iter_modules([anims])):
        s['animations'][mod] = importlib.import_module(mod).CLIP
    return s


def me():
    sys.path.insert(0, os.path.join(ROOT, 'me'))
    from lib import LAYERS  # noqa: E402
    import desk  # noqa: E402
    s = load('me/me.json')
    palette = {**s['palette'], **s['props']}
    layers = LAYERS['sweater']

    def flatten(fr):
        rows = [list(r) for r in fr['px']]
        for name in layers:
            for y, r in enumerate(fr.get('layers', {}).get(name, [])):
                for x, ch in enumerate(r):
                    if ch != '.':
                        rows[y][x] = ch
        return [''.join(r) for r in rows]

    anims = {}
    for name, clip in s['animations'].items():
        out = {k: v for k, v in clip.items() if k != 'frames'}
        out['frames'] = []
        for i, fr in enumerate(clip['frames']):
            f = {'ms': fr['ms'], 'px': flatten(fr)}
            if name == 'desk' and desk.DESK[i][0]['beat'] == 'type':
                f['typing'] = True
            out['frames'].append(f)
        if name == 'walk':
            out['travel'] = 1
        anims[name] = out
    return {'w': s['w'], 'h': s['h'], 'palette': palette, 'animations': anims}


if __name__ == '__main__':
    write('cat.json', cat())
    write('me.json', me())
    print('wrote', OUT)
```

Each module in `cat-anims/` is named after its clip (`groom.py` gives the `groom` clip) and exposes `CLIP = {'loop': bool, 'frames': [{'ms': int, 'px': [str, ...]}]}` drawn on the 32x32 canvas with the sleek letters plus `CAT_EFFECTS` letters.

Run it:

```bash
python3 tools/sprites/export.py
```

Expected: `wrote .../src/assets/sprites`, and `src/assets/sprites/cat.json` plus `me.json` exist.

- [ ] **Step 3: Write the failing sprite test**

`src/lib/pet/sprite.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import cat from '../../assets/sprites/cat.json'
import me from '../../assets/sprites/me.json'
import { clipSize, paletteFor, resolveClip, validateSprite, type Sprite } from './sprite'

const tiny: Sprite = {
  w: 2,
  h: 1,
  palette: { A: '#000000', B: '#ffffff' },
  palettes: { inv: { A: '#ffffff', B: '#000000' } },
  animations: { idle: { loop: true, frames: [{ ms: 100, px: ['AB'] }] } },
}

describe('sprite data', () => {
  it.each([
    ['cat', cat],
    ['me', me],
  ])('%s.json is internally consistent', (_, s) => {
    expect(validateSprite(s as Sprite)).toEqual([])
  })

  it('ships the approved cat clips and all four coats', () => {
    const s = cat as Sprite
    expect(Object.keys(s.animations)).toEqual(expect.arrayContaining(['idle', 'walk']))
    expect(Object.keys(s.palettes!).sort()).toEqual(['black', 'orange', 'shiny', 'tuxedo'])
    expect(s.animations.walk.travel).toBe(1)
  })

  it('marks typing frames on the desk and keeps the cat slot', () => {
    const desk = (me as Sprite).animations.desk
    expect(desk.frames.some((f) => f.typing)).toBe(true)
    expect(desk.frames.some((f) => !f.typing)).toBe(true)
    expect(desk.catSlot).toHaveLength(4)
  })
})

describe('validateSprite', () => {
  it('reports a row of the wrong width', () => {
    const bad = { ...tiny, animations: { idle: { loop: true, frames: [{ ms: 100, px: ['ABA'] }] } } }
    expect(validateSprite(bad)[0]).toMatch(/idle\[0\] row 0/)
  })

  it('reports a letter missing from the palette', () => {
    const bad = { ...tiny, animations: { idle: { loop: true, frames: [{ ms: 100, px: ['AZ'] }] } } }
    expect(validateSprite(bad)[0]).toMatch(/letter Z/)
  })

  it('reports a variant palette missing a base letter', () => {
    const bad = { ...tiny, palettes: { inv: { A: '#ffffff' } } }
    expect(validateSprite(bad)[0]).toMatch(/inv lacks B/)
  })

  it('uses a clip-level size when the clip has one', () => {
    const s = { ...tiny, animations: { wide: { loop: true, w: 3, h: 1, frames: [{ ms: 100, px: ['ABA'] }] } } }
    expect(validateSprite(s)).toEqual([])
    expect(clipSize(s, s.animations.wide)).toEqual({ w: 3, h: 1 })
  })
})

describe('paletteFor', () => {
  it('overrides the base with the variant', () => {
    expect(paletteFor(tiny, 'inv').A).toBe('#ffffff')
  })

  it('falls back to the base for an unknown variant', () => {
    expect(paletteFor(tiny, 'nope').A).toBe('#000000')
  })
})

describe('resolveClip', () => {
  it('returns the named clip when it exists', () => {
    expect(resolveClip(tiny, 'idle')).toMatchObject({ name: 'idle', fallback: false })
  })

  it('falls back to idle for a clip not drawn yet', () => {
    expect(resolveClip(tiny, 'groom')).toMatchObject({ name: 'idle', fallback: true })
  })
})
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npx vitest run src/lib/pet/sprite.test.ts`
Expected: FAIL, cannot resolve `./sprite`.

- [ ] **Step 5: Implement `src/lib/pet/sprite.ts`**

```ts
export type Frame = { ms: number; px: string[]; typing?: boolean }
export type Clip = {
  loop: boolean
  frames: Frame[]
  travel?: number
  w?: number
  h?: number
  catSlot?: [number, number, number, number]
}
export type Sprite = {
  w: number
  h: number
  palette: Record<string, string>
  palettes?: Record<string, Record<string, string>>
  animations: Record<string, Clip>
}

export const paletteFor = (s: Sprite, variant?: string) => ({ ...s.palette, ...(variant ? s.palettes?.[variant] : undefined) })

export const clipSize = (s: Sprite, c: Clip) => ({ w: c.w ?? s.w, h: c.h ?? s.h })

// The engine ships before every clip is drawn, so a missing clip plays idle.
export function resolveClip(s: Sprite, name: string) {
  const clip = s.animations[name]
  return clip ? { name, clip, fallback: false } : { name: 'idle', clip: s.animations.idle, fallback: true }
}

export function validateSprite(s: Sprite): string[] {
  const errors: string[] = []
  for (const [variant, pal] of Object.entries(s.palettes ?? {})) {
    for (const k of Object.keys(s.palette)) if (!(k in pal)) errors.push(`palette ${variant} lacks ${k}`)
  }
  for (const [name, clip] of Object.entries(s.animations)) {
    const { w, h } = clipSize(s, clip)
    clip.frames.forEach((f, i) => {
      if (f.px.length !== h) errors.push(`${name}[${i}] has ${f.px.length} rows, want ${h}`)
      f.px.forEach((row, y) => {
        if (row.length !== w) errors.push(`${name}[${i}] row ${y} is ${row.length} wide, want ${w}`)
        for (const ch of row) if (ch !== '.' && !(ch in s.palette)) errors.push(`${name}[${i}] uses letter ${ch} not in palette`)
      })
    })
  }
  return errors
}
```

If `tsconfig` rejects the JSON imports, add `"resolveJsonModule": true` to `compilerOptions` in `tsconfig.app.json` (check first; Vite templates usually have it).

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/lib/pet/sprite.test.ts`
Expected: PASS. If a real-data case fails, fix the exporter (Step 2), not the test.

- [ ] **Step 7: Commit**

```bash
git add tools/sprites src/assets/sprites src/lib/pet/sprite.ts src/lib/pet/sprite.test.ts .gitignore docs/superpowers/specs
git commit -s -m "Move the pet sprite generators into tools and export site JSON

The sleek cat, its hand-keyed walk and pixel-me move out of the spec
folder into tools/sprites. export.py writes the site's cat.json and
me.json; pixel-me ships baked to the sweater outfit, and desk frames
are tagged with typing so the neural net can follow them."
```

---

### Task 2: Playhead, ticker, stage store and the canvas renderer

**Files:**
- Create: `src/lib/pet/player.ts`, `src/lib/pet/player.test.ts`
- Create: `src/lib/pet/ticker.ts`, `src/lib/pet/stage.ts`, `src/lib/pet/stage.test.ts`
- Create: `src/components/pet/pixel-sprite.tsx`, `src/components/pet/pixel-sprite.test.tsx`

**Interfaces:**
- Consumes: `Sprite`, `Clip`, `paletteFor`, `clipSize`, `resolveClip` from Task 1.
- Produces:
  - `type Playhead = { frame: number; elapsed: number; done: boolean }`
  - `startPlayhead(): Playhead`
  - `advance(clip: Clip, p: Playhead, dt: number): { head: Playhead; stepped: number }` (`stepped` = frames advanced this call)
  - `clampDelta(dt: number): number` (max 100 ms)
  - `subscribe(fn: (dt: number) => void): () => void` (ticker)
  - `claimStage(): () => void`, `stageClaimed(): boolean`, `useStageClaimed(): boolean`, `useStageClaim(active: boolean): void`
  - `<PixelSprite sprite clip variant? scale? flip? playing? frame? onEnd? onStep? className? style? />` where `onStep(frames: number, frame: Frame)` fires on every frame advance

- [ ] **Step 1: Write the failing tests**

`src/lib/pet/player.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { advance, clampDelta, startPlayhead } from './player'
import type { Clip } from './sprite'

const clip = (loop: boolean): Clip => ({
  loop,
  frames: [
    { ms: 100, px: [] },
    { ms: 200, px: [] },
  ],
})

describe('advance', () => {
  it('holds a frame until its ms have passed', () => {
    const { head, stepped } = advance(clip(true), startPlayhead(), 99)
    expect(head.frame).toBe(0)
    expect(stepped).toBe(0)
  })

  it('steps across several frames in one large delta', () => {
    const { head, stepped } = advance(clip(true), startPlayhead(), 350)
    expect(head).toMatchObject({ frame: 0, elapsed: 50 })
    expect(stepped).toBe(2)
  })

  it('stops a one-shot on its last frame and marks it done', () => {
    const { head } = advance(clip(false), startPlayhead(), 1000)
    expect(head).toMatchObject({ frame: 1, done: true })
  })

  it('does nothing once a one-shot is done', () => {
    const done = advance(clip(false), startPlayhead(), 1000).head
    expect(advance(clip(false), done, 500)).toEqual({ head: done, stepped: 0 })
  })
})

describe('clampDelta', () => {
  it('caps a long pause at 100 ms so a hidden tab does not fast-forward', () => {
    expect(clampDelta(60_000)).toBe(100)
    expect(clampDelta(16)).toBe(16)
    expect(clampDelta(-5)).toBe(0)
  })
})
```

`src/lib/pet/stage.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { claimStage, stageClaimed } from './stage'

describe('stage claims', () => {
  it('is free until something claims it and free again after release', () => {
    expect(stageClaimed()).toBe(false)
    const release = claimStage()
    expect(stageClaimed()).toBe(true)
    release()
    expect(stageClaimed()).toBe(false)
  })

  it('stays claimed until every claimant releases', () => {
    const a = claimStage()
    const b = claimStage()
    a()
    expect(stageClaimed()).toBe(true)
    b()
    expect(stageClaimed()).toBe(false)
  })

  it('ignores a double release', () => {
    const a = claimStage()
    const b = claimStage()
    a()
    a()
    expect(stageClaimed()).toBe(true)
    b()
  })
})
```

`src/components/pet/pixel-sprite.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import cat from '../../assets/sprites/cat.json'
import { PixelSprite } from './pixel-sprite'
import type { Sprite } from '../../lib/pet/sprite'

describe('PixelSprite', () => {
  it('renders a hidden canvas sized to the clip at the given scale', () => {
    const html = renderToStaticMarkup(<PixelSprite sprite={cat as Sprite} clip="idle" scale={2} />)
    expect(html).toContain('<canvas')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('width:64px')
    expect(html).toContain('height:64px')
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/pet src/components/pet`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `player.ts`, `ticker.ts`, `stage.ts`**

`src/lib/pet/player.ts`:

```ts
import type { Clip } from './sprite'

export type Playhead = { frame: number; elapsed: number; done: boolean }

export const startPlayhead = (): Playhead => ({ frame: 0, elapsed: 0, done: false })

export const clampDelta = (dt: number) => Math.min(100, Math.max(0, dt))

export function advance(clip: Clip, p: Playhead, dt: number) {
  if (p.done) return { head: p, stepped: 0 }
  let { frame, elapsed } = p
  let stepped = 0
  elapsed += dt
  while (elapsed >= clip.frames[frame].ms) {
    if (!clip.loop && frame === clip.frames.length - 1) return { head: { frame, elapsed: 0, done: true }, stepped }
    elapsed -= clip.frames[frame].ms
    frame = (frame + 1) % clip.frames.length
    stepped++
  }
  return { head: { frame, elapsed, done: false }, stepped }
}
```

`src/lib/pet/ticker.ts`:

```ts
import { clampDelta } from './player'

const subs = new Set<(dt: number) => void>()
let raf = 0
let last = 0

function loop(now: number) {
  const dt = clampDelta(now - last)
  last = now
  for (const fn of subs) fn(dt)
  raf = subs.size ? requestAnimationFrame(loop) : 0
}

// One rAF loop for every sprite on the page, stopped when nothing listens.
export function subscribe(fn: (dt: number) => void) {
  subs.add(fn)
  if (!raf) {
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }
  return () => {
    subs.delete(fn)
  }
}
```

`src/lib/pet/stage.ts`:

```ts
import { useEffect, useSyncExternalStore } from 'react'

let claims = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const stageClaimed = () => claims > 0

// A micro-moment cat claims the stage so the wandering cat hides; never two cats.
export function claimStage() {
  claims++
  emit()
  let released = false
  return () => {
    if (released) return
    released = true
    claims--
    emit()
  }
}

export const useStageClaimed = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    stageClaimed,
    () => false,
  )

export function useStageClaim(active: boolean) {
  useEffect(() => (active ? claimStage() : undefined), [active])
}
```

- [ ] **Step 4: Implement `pixel-sprite.tsx`**

```tsx
import { useEffect, useRef, type CSSProperties } from 'react'
import { advance, startPlayhead } from '../../lib/pet/player'
import { clipSize, paletteFor, resolveClip, type Frame, type Sprite } from '../../lib/pet/sprite'
import { subscribe } from '../../lib/pet/ticker'

type Props = {
  sprite: Sprite
  clip: string
  variant?: string
  scale?: number
  flip?: boolean
  playing?: boolean
  frame?: number
  onEnd?: () => void
  onStep?: (frames: number, frame: Frame) => void
  className?: string
  style?: CSSProperties
}

const cache = new WeakMap<Sprite, Map<string, HTMLCanvasElement[]>>()

// Each frame is painted once per palette at 1x, then blitted scaled with smoothing off.
function framesFor(sprite: Sprite, clipName: string, variant?: string) {
  let bySprite = cache.get(sprite)
  if (!bySprite) cache.set(sprite, (bySprite = new Map()))
  const key = `${clipName}:${variant ?? ''}`
  const hit = bySprite.get(key)
  if (hit) return hit
  const { clip } = resolveClip(sprite, clipName)
  const { w, h } = clipSize(sprite, clip)
  const pal = paletteFor(sprite, variant)
  const out = clip.frames.map((f) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    f.px.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const col = pal[row[x]]
        if (row[x] === '.' || !col) continue
        ctx.fillStyle = col
        ctx.fillRect(x, y, 1, 1)
      }
    })
    return c
  })
  bySprite.set(key, out)
  return out
}

export function PixelSprite({ sprite, clip, variant, scale = 2, flip, playing = true, frame, onEnd, onStep, className, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const resolved = resolveClip(sprite, clip)
  const { w, h } = clipSize(sprite, resolved.clip)
  const cb = useRef({ onEnd, onStep })
  cb.current = { onEnd, onStep }

  useEffect(() => {
    const canvas = ref.current!
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1))
    canvas.width = w * scale * dpr
    canvas.height = h * scale * dpr
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    const frames = framesFor(sprite, clip, variant)
    const draw = (i: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(frames[i], 0, 0, canvas.width, canvas.height)
    }
    // A clip that is not drawn yet resolves to idle; a one-shot must still end.
    if (resolved.fallback && !sprite.animations[clip]?.loop) queueMicrotask(() => cb.current.onEnd?.())
    let head = startPlayhead()
    if (frame !== undefined || !playing) {
      draw(frame ?? 0)
      return
    }
    draw(0)
    return subscribe((dt) => {
      const next = advance(resolved.clip, head, dt)
      if (next.stepped) {
        draw(next.head.frame)
        cb.current.onStep?.(next.stepped, resolved.clip.frames[next.head.frame])
      }
      if (next.head.done && !head.done) cb.current.onEnd?.()
      head = next.head
    })
  }, [sprite, clip, variant, scale, playing, frame, w, h, resolved.clip, resolved.fallback])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ width: w * scale, height: h * scale, imageRendering: 'pixelated', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    />
  )
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/pet src/components/pet`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/pet src/components/pet
git commit -s -m "Add the pixel sprite renderer, shared ticker and stage claims

One rAF loop drives every sprite and clamps long gaps to 100 ms so a
backgrounded tab does not fast-forward. Frames are painted once per
palette and blitted at integer scale. Stage claims let a fixed-place
cat hide the wandering one."
```

---

### Task 3: Pet settings storage

**Files:**
- Create: `src/lib/pet/prefs.ts`, `src/lib/pet/prefs.test.ts`

**Interfaces:**
- Produces:
  - `type Coat = 'tuxedo' | 'orange' | 'black' | 'shiny'`, `COATS: readonly Coat[]`
  - `type StoatFreq = 'off' | 'rare' | 'normal'`
  - `type PetPrefs = { cat: boolean; coat: Coat; stoat: StoatFreq }`
  - `loadPetPrefs(storage?: Storage | null, rand?: () => number): PetPrefs`
  - `savePetPrefs(p: PetPrefs, storage?: Storage | null): void`
  - `PREFS_KEY = 'pet-prefs'`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { loadPetPrefs, PREFS_KEY, savePetPrefs } from './prefs'

function memory(initial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(initial))
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    get length() {
      return m.size
    },
  }
}

const throwing: Storage = {
  ...memory(),
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('loadPetPrefs', () => {
  it('picks a random coat on the first visit and remembers it', () => {
    const s = memory()
    const first = loadPetPrefs(s, () => 0.99)
    expect(first).toEqual({ cat: true, coat: 'shiny', stoat: 'normal' })
    expect(JSON.parse(s.getItem(PREFS_KEY)!).coat).toBe('shiny')
    expect(loadPetPrefs(s, () => 0).coat).toBe('shiny')
  })

  it('keeps saved values', () => {
    const s = memory({ [PREFS_KEY]: JSON.stringify({ cat: false, coat: 'black', stoat: 'off' }) })
    expect(loadPetPrefs(s)).toEqual({ cat: false, coat: 'black', stoat: 'off' })
  })

  it('replaces an unknown coat or frequency', () => {
    const s = memory({ [PREFS_KEY]: JSON.stringify({ cat: true, coat: 'calico', stoat: 'always' }) })
    expect(loadPetPrefs(s, () => 0)).toEqual({ cat: true, coat: 'tuxedo', stoat: 'normal' })
  })

  it('survives garbage JSON', () => {
    expect(loadPetPrefs(memory({ [PREFS_KEY]: '{nope' }), () => 0).coat).toBe('tuxedo')
  })

  it('survives storage that throws, and without storage at all', () => {
    expect(loadPetPrefs(throwing, () => 0)).toEqual({ cat: true, coat: 'tuxedo', stoat: 'normal' })
    expect(loadPetPrefs(null, () => 0).cat).toBe(true)
    expect(() => savePetPrefs({ cat: true, coat: 'orange', stoat: 'rare' }, throwing)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/pet/prefs.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `prefs.ts`**

```ts
export const COATS = ['tuxedo', 'orange', 'black', 'shiny'] as const
export type Coat = (typeof COATS)[number]
export type StoatFreq = 'off' | 'rare' | 'normal'
export type PetPrefs = { cat: boolean; coat: Coat; stoat: StoatFreq }

export const PREFS_KEY = 'pet-prefs'
const FREQS: StoatFreq[] = ['off', 'rare', 'normal']

const browserStorage = () => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function savePetPrefs(p: PetPrefs, storage: Storage | null = browserStorage()) {
  try {
    storage?.setItem(PREFS_KEY, JSON.stringify(p))
  } catch {
    // blocked storage: the choice lasts for this page view only
  }
}

export function loadPetPrefs(storage: Storage | null = browserStorage(), rand: () => number = Math.random): PetPrefs {
  let saved: Partial<PetPrefs> = {}
  try {
    saved = JSON.parse(storage?.getItem(PREFS_KEY) ?? '{}') ?? {}
  } catch {
    saved = {}
  }
  const known = COATS.includes(saved.coat as Coat)
  const prefs: PetPrefs = {
    cat: saved.cat !== false,
    coat: known ? (saved.coat as Coat) : COATS[Math.floor(rand() * COATS.length)],
    stoat: FREQS.includes(saved.stoat as StoatFreq) ? (saved.stoat as StoatFreq) : 'normal',
  }
  if (!known) savePetPrefs(prefs, storage)
  return prefs
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/pet/prefs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/prefs.ts src/lib/pet/prefs.test.ts
git commit -s -m "Store pet settings with a random first coat

The coat is picked at random on a first visit and remembered. Storage
that throws or holds garbage falls back to defaults."
```

---

### Task 4: Cat brain

**Files:**
- Create: `src/lib/pet/cat-brain.ts`, `src/lib/pet/cat-brain.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure).
- Produces:
  - `type Mode = 'idle' | 'groom' | 'loaf' | 'sleep' | 'wake' | 'walk' | 'run' | 'sit_down' | 'startle' | 'pounce' | 'swat' | 'zoomies' | 'parked'`
  - `type CatState = { mode: Mode; x: number; dir: 1 | -1; target: number | null; lastInput: number; zoomLeg: 0 | 1; home: number }` (x and target in sprite px from the left edge; `home` is where zoomies return to)
  - Arriving anywhere ends in `sit_down`, a one-shot that `end` turns into `idle`.
  - `type CatEvent =`
    - `{ type: 'tick'; now: number; width: number; roll: number }` (width = viewport width in sprite px minus the sprite width)
    - `{ type: 'input'; now: number }`
    - `{ type: 'hover'; now: number }`
    - `{ type: 'click'; now: number; roll: number }`
    - `{ type: 'go'; now: number; target: number }`
    - `{ type: 'step'; now: number; px: number }` (sprite px travelled since the last step)
    - `{ type: 'end'; now: number }` (a one-shot clip finished)
    - `{ type: 'stoat'; now: number; dir: 1 | -1; roll: number }`
  - `initCat(now: number, x: number, reduced: boolean): CatState`
  - `catReducer(s: CatState, e: CatEvent): CatState`
  - `clipFor(mode: Mode): string`
  - `lookPose(cat: { x: number; y: number }, pointer: { x: number; y: number } | null, radius: number): 'left' | 'center' | 'right' | 'up' | null`
  - Constants: `GROOM_AFTER = 20_000`, `LOAF_AFTER = 40_000`, `SLEEP_AFTER = 60_000`, `RUN_OVER = 24`, `ZOOMIES_PER_TICK = 0.00002`, `IGNORE_CLICK = 0.2`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { catReducer, clipFor, initCat, lookPose, type CatEvent, type CatState } from './cat-brain'

const run = (s: CatState, ...events: CatEvent[]) => events.reduce(catReducer, s)
const tick = (now: number, roll = 1, width = 500): CatEvent => ({ type: 'tick', now, width, roll })

describe('idle chain', () => {
  it('idles, grooms, loafs, then sleeps as the page sits untouched', () => {
    const s = initCat(0, 100, false)
    expect(run(s, tick(19_000)).mode).toBe('idle')
    expect(run(s, tick(21_000)).mode).toBe('groom')
    expect(run(s, tick(41_000)).mode).toBe('loaf')
    expect(run(s, tick(61_000)).mode).toBe('sleep')
  })

  it('restarts the chain on input, and wakes a sleeping cat first', () => {
    const asleep = run(initCat(0, 100, false), tick(61_000))
    const woke = run(asleep, { type: 'input', now: 62_000 })
    expect(woke.mode).toBe('wake')
    expect(run(woke, { type: 'end', now: 63_000 }).mode).toBe('idle')
    expect(run(woke, { type: 'end', now: 63_000 }, tick(70_000)).mode).toBe('idle')
  })
})

describe('reactions', () => {
  it('startles on hover, then settles back to idle', () => {
    const s = run(initCat(0, 100, false), { type: 'hover', now: 1 })
    expect(s.mode).toBe('startle')
    expect(run(s, { type: 'end', now: 2 }).mode).toBe('idle')
  })

  it('does not startle while asleep', () => {
    const s = run(initCat(0, 100, false), tick(61_000), { type: 'hover', now: 61_500 })
    expect(s.mode).toBe('sleep')
  })

  it('ignores some clicks, pounces or swats on the rest', () => {
    const s = initCat(0, 100, false)
    expect(run(s, { type: 'click', now: 1, roll: 0.1 }).mode).toBe('idle')
    expect(run(s, { type: 'click', now: 1, roll: 0.4 }).mode).toBe('pounce')
    expect(run(s, { type: 'click', now: 1, roll: 0.9 }).mode).toBe('swat')
  })
})

describe('moving', () => {
  it('walks to a near target and runs to a far one, facing the way it goes', () => {
    const s = initCat(0, 100, false)
    expect(run(s, { type: 'go', now: 1, target: 110 })).toMatchObject({ mode: 'walk', dir: 1 })
    expect(run(s, { type: 'go', now: 1, target: 10 })).toMatchObject({ mode: 'run', dir: -1 })
  })

  it('moves by the stepped px and sits on arrival without overshooting', () => {
    const walking = run(initCat(0, 100, false), { type: 'go', now: 1, target: 103 })
    const s = run(walking, { type: 'step', now: 2, px: 2 }, { type: 'step', now: 3, px: 2 })
    expect(s).toMatchObject({ mode: 'sit_down', x: 103, target: null })
    expect(run(s, { type: 'end', now: 4 }).mode).toBe('idle')
  })

  it('clamps into a viewport that shrank under it', () => {
    const s = run(initCat(0, 900, false), tick(1, 1, 300))
    expect(s.x).toBe(300)
  })

  it('does zoomies to one edge and back on a rare tick', () => {
    const z = run(initCat(0, 100, false), tick(1_000, 0))
    expect(z).toMatchObject({ mode: 'zoomies', target: 500, dir: 1 })
    const back = run(z, { type: 'step', now: 2_000, px: 400 })
    expect(back).toMatchObject({ mode: 'zoomies', target: 100, dir: -1 })
    expect(run(back, { type: 'step', now: 3_000, px: 400 }).mode).toBe('sit_down')
  })
})

describe('stoat', () => {
  it('startles an awake cat and sometimes chases', () => {
    const s = initCat(0, 100, false)
    expect(run(s, { type: 'stoat', now: 1, dir: 1, roll: 0.9 }).mode).toBe('startle')
    expect(run(s, { type: 'stoat', now: 1, dir: 1, roll: 0.1 }).mode).toBe('zoomies')
  })

  it('leaves a sleeping cat asleep', () => {
    const s = run(initCat(0, 100, false), tick(61_000), { type: 'stoat', now: 61_100, dir: 1, roll: 0.1 })
    expect(s.mode).toBe('sleep')
  })
})

describe('reduced motion', () => {
  it('starts parked and ignores everything', () => {
    const s = initCat(0, 100, true)
    const after = run(s, tick(90_000, 0), { type: 'hover', now: 1 }, { type: 'go', now: 2, target: 0 }, { type: 'click', now: 3, roll: 0.5 })
    expect(after.mode).toBe('parked')
    expect(clipFor('parked')).toBe('sleep')
  })
})

describe('lookPose', () => {
  it('looks toward a near pointer and ignores a far one', () => {
    const cat = { x: 100, y: 100 }
    expect(lookPose(cat, { x: 40, y: 100 }, 200)).toBe('left')
    expect(lookPose(cat, { x: 160, y: 100 }, 200)).toBe('right')
    expect(lookPose(cat, { x: 100, y: 20 }, 200)).toBe('up')
    expect(lookPose(cat, { x: 105, y: 110 }, 200)).toBe('center')
    expect(lookPose(cat, { x: 900, y: 100 }, 200)).toBeNull()
    expect(lookPose(cat, null, 200)).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/pet/cat-brain.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `cat-brain.ts`**

```ts
export type Mode = 'idle' | 'groom' | 'loaf' | 'sleep' | 'wake' | 'walk' | 'run' | 'sit_down' | 'startle' | 'pounce' | 'swat' | 'zoomies' | 'parked'
export type CatState = { mode: Mode; x: number; dir: 1 | -1; target: number | null; lastInput: number; zoomLeg: 0 | 1; home: number }
export type CatEvent =
  | { type: 'tick'; now: number; width: number; roll: number }
  | { type: 'input'; now: number }
  | { type: 'hover'; now: number }
  | { type: 'click'; now: number; roll: number }
  | { type: 'go'; now: number; target: number }
  | { type: 'step'; now: number; px: number }
  | { type: 'end'; now: number }
  | { type: 'stoat'; now: number; dir: 1 | -1; roll: number }

export const GROOM_AFTER = 20_000
export const LOAF_AFTER = 40_000
export const SLEEP_AFTER = 60_000
export const RUN_OVER = 24
export const ZOOMIES_PER_TICK = 0.00002
export const IGNORE_CLICK = 0.2

const RESTING: Mode[] = ['idle', 'groom', 'loaf', 'sleep']
const ONE_SHOTS: Mode[] = ['wake', 'sit_down', 'startle', 'pounce', 'swat']

export const clipFor = (m: Mode) => (m === 'parked' ? 'sleep' : m === 'zoomies' ? 'run' : m)

export const initCat = (now: number, x: number, reduced: boolean): CatState => ({
  mode: reduced ? 'parked' : 'idle',
  x,
  dir: -1,
  target: null,
  lastInput: now,
  zoomLeg: 0,
  home: x,
})

const restingMode = (idleFor: number): Mode =>
  idleFor >= SLEEP_AFTER ? 'sleep' : idleFor >= LOAF_AFTER ? 'loaf' : idleFor >= GROOM_AFTER ? 'groom' : 'idle'

const heading = (from: number, to: number): 1 | -1 => (to >= from ? 1 : -1)

export function catReducer(s: CatState, e: CatEvent): CatState {
  if (s.mode === 'parked') return s
  switch (e.type) {
    case 'tick': {
      const room = Math.max(0, e.width)
      const x = Math.min(Math.max(0, s.x), room)
      // a stoat chase aims past the edge; the room clamps it
      if (s.target !== null && s.target > room) s = { ...s, target: room }
      if (s.mode === 'idle' && e.roll < ZOOMIES_PER_TICK) {
        return { ...s, x, mode: 'zoomies', target: e.width, dir: heading(x, e.width), zoomLeg: 0, home: x }
      }
      if (!RESTING.includes(s.mode)) return { ...s, x }
      return { ...s, x, mode: restingMode(e.now - s.lastInput) }
    }
    case 'input':
      if (s.mode === 'sleep') return { ...s, mode: 'wake', lastInput: e.now }
      return RESTING.includes(s.mode) ? { ...s, mode: 'idle', lastInput: e.now } : { ...s, lastInput: e.now }
    case 'hover':
      return s.mode === 'sleep' || !RESTING.includes(s.mode) ? s : { ...s, mode: 'startle', lastInput: e.now }
    case 'click':
      if (!RESTING.includes(s.mode) || s.mode === 'sleep') return s
      if (e.roll < IGNORE_CLICK) return { ...s, mode: 'idle', lastInput: e.now }
      return { ...s, mode: e.roll < 0.6 ? 'pounce' : 'swat', lastInput: e.now }
    case 'go': {
      if (s.mode === 'zoomies') return s
      const d = Math.abs(e.target - s.x)
      if (d < 1) return s
      return { ...s, mode: d > RUN_OVER ? 'run' : 'walk', target: e.target, dir: heading(s.x, e.target), lastInput: e.now }
    }
    case 'step': {
      if (s.target === null) return s
      const x = s.dir === 1 ? Math.min(s.target, s.x + e.px) : Math.max(s.target, s.x - e.px)
      if (x !== s.target) return { ...s, x }
      if (s.mode === 'zoomies' && s.zoomLeg === 0) return { ...s, x, zoomLeg: 1, target: s.home, dir: heading(x, s.home) }
      return { ...s, x, mode: 'sit_down', target: null, zoomLeg: 0, lastInput: e.now }
    }
    case 'end':
      return ONE_SHOTS.includes(s.mode) ? { ...s, mode: 'idle', lastInput: e.now } : s
    case 'stoat':
      if (s.mode === 'sleep' || !RESTING.includes(s.mode)) return s
      if (e.roll < 0.5) {
        const edge = e.dir === 1 ? Number.MAX_SAFE_INTEGER : 0
        return { ...s, mode: 'zoomies', target: edge, dir: e.dir, zoomLeg: 0, home: s.x, lastInput: e.now }
      }
      return { ...s, mode: 'startle', lastInput: e.now }
  }
}

export function lookPose(cat: { x: number; y: number }, pointer: { x: number; y: number } | null, radius: number) {
  if (!pointer) return null
  const dx = pointer.x - cat.x
  const dy = pointer.y - cat.y
  if (Math.hypot(dx, dy) > radius) return null
  if (-dy > Math.abs(dx) && -dy > 24) return 'up'
  if (Math.abs(dx) < 24) return 'center'
  return dx < 0 ? 'left' : 'right'
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/pet/cat-brain.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/cat-brain.ts src/lib/pet/cat-brain.test.ts
git commit -s -m "Add the cat's behavior as a pure reducer

Untouched pages walk the cat through idle, groom, loaf and sleep;
input wakes it. Hover startles, clicks pounce or swat with one in five
ignored, route changes send it walking or running, and a rare tick
starts zoomies. Reduced motion parks it asleep and ignores events."
```

---

### Task 5: Pet layer in the app shell

**Files:**
- Create: `src/components/pet/pet-layer.tsx`, `src/components/pet/pet-layer.test.tsx`
- Create: `src/lib/pet/prefs-store.ts`
- Modify: `src/App.tsx:92` (mount beside `<AccessibilityPanel />`)

**Interfaces:**
- Consumes: `PixelSprite` (Task 2), `useStageClaimed` (Task 2), `loadPetPrefs`, `savePetPrefs`, `PetPrefs` (Task 3), `initCat`, `catReducer`, `clipFor`, `lookPose` (Task 4), `prefersReducedMotion` (`src/lib/motion.ts`), `cat.json`.
- Produces:
  - `usePetPrefs(): [PetPrefs, (next: PetPrefs) => void]` in `prefs-store.ts` (shared between the layer and the panel)
  - `<PetLayer />` (no props)
  - `SCALE = 2` exported from `pet-layer.tsx`
  - `catBus`: `{ emit(e: { type: 'stoat'; dir: 1 | -1 }): void; on(fn): () => void }` exported from `pet-layer.tsx` for the stoat visitor (Task 14)

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { PetLayer } from './pet-layer'

describe('PetLayer', () => {
  it('renders nothing on the server so prerendered HTML is unchanged', () => {
    expect(
      renderToStaticMarkup(
        <MemoryRouter>
          <PetLayer />
        </MemoryRouter>,
      ),
    ).toBe('')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/pet/pet-layer.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `prefs-store.ts`**

```ts
import { useSyncExternalStore } from 'react'
import { loadPetPrefs, savePetPrefs, type PetPrefs } from './prefs'

let current: PetPrefs | null = null
const listeners = new Set<() => void>()
const get = () => (current ??= loadPetPrefs())
const SERVER: PetPrefs = { cat: false, coat: 'tuxedo', stoat: 'off' }

export function usePetPrefs(): [PetPrefs, (next: PetPrefs) => void] {
  const prefs = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    get,
    () => SERVER,
  )
  const set = (next: PetPrefs) => {
    current = next
    savePetPrefs(next)
    listeners.forEach((l) => l())
  }
  return [prefs, set]
}
```

- [ ] **Step 4: Implement `pet-layer.tsx`**

```tsx
import { useEffect, useReducer, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import cat from '../../assets/sprites/cat.json'
import { catReducer, clipFor, initCat, lookPose, type CatEvent } from '../../lib/pet/cat-brain'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaimed } from '../../lib/pet/stage'
import { prefersReducedMotion } from '../../lib/motion'
import { PixelSprite } from './pixel-sprite'

export const SCALE = 2
const SPRITE = cat as Sprite
const W = SPRITE.w

type BusEvent = { type: 'stoat'; dir: 1 | -1 }
const busSubs = new Set<(e: BusEvent) => void>()
export const catBus = {
  emit: (e: BusEvent) => busSubs.forEach((fn) => fn(e)),
  on: (fn: (e: BusEvent) => void) => {
    busSubs.add(fn)
    return () => {
      busSubs.delete(fn)
    }
  },
}

const roomWidth = () => Math.max(0, Math.floor(window.innerWidth / SCALE) - W)

function Cat({ coat }: { coat: string }) {
  const [state, dispatch] = useReducer(catReducer, null, () =>
    initCat(performance.now(), roomWidth() - 8, prefersReducedMotion()),
  )
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const { pathname } = useLocation()
  const first = useRef(true)
  const send = (e: Omit<CatEvent, 'now'> & Partial<Pick<CatEvent, 'now'>>) =>
    dispatch({ now: performance.now(), ...e } as CatEvent)

  useEffect(() => {
    const id = setInterval(() => send({ type: 'tick', width: roomWidth(), roll: Math.random() }), 1000)
    const input = () => send({ type: 'input' })
    const move = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY })
      input()
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('keydown', input)
    window.addEventListener('scroll', input, { passive: true })
    const off = catBus.on((e) => send({ type: 'stoat', dir: e.dir, roll: Math.random() }))
    return () => {
      clearInterval(id)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('keydown', input)
      window.removeEventListener('scroll', input)
      off()
    }
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    send({ type: 'go', target: Math.floor(Math.random() * roomWidth()) })
  }, [pathname])

  const left = state.x * SCALE
  const top = window.innerHeight - SPRITE.h * SCALE
  const pose = state.mode === 'idle' ? lookPose({ x: left + (W * SCALE) / 2, y: top + 16 }, pointer, 200) : null
  const lookFrame = pose ? ['left', 'center', 'right', 'up'].indexOf(pose) : undefined
  const clip = pose && SPRITE.animations.look ? 'look' : clipFor(state.mode)
  const travel = SPRITE.animations[clip]?.travel ?? 1

  return (
    <div
      style={{ position: 'fixed', left, bottom: 0, zIndex: 30, pointerEvents: 'auto' }}
      onPointerEnter={() => send({ type: 'hover' })}
      onClick={() => send({ type: 'click', roll: Math.random() })}
    >
      <PixelSprite
        sprite={SPRITE}
        clip={clip}
        variant={coat}
        scale={SCALE}
        // the sit faces left and the walk faces right
        flip={clip === 'walk' || clip === 'run' ? state.dir === -1 : state.dir === 1}
        playing={state.mode !== 'parked'}
        frame={clip === 'look' ? lookFrame : undefined}
        onStep={(n) => state.target !== null && send({ type: 'step', px: n * travel })}
        onEnd={() => send({ type: 'end' })}
      />
    </div>
  )
}

export function PetLayer() {
  const [prefs] = usePetPrefs()
  const claimed = useStageClaimed()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !prefs.cat || claimed) return null
  return <Cat coat={prefs.coat} />
}
```

Note: `onStep` sends travelled px only while the cat has a target, so the idle and groom loops never move it.

- [ ] **Step 5: Mount it in `App.tsx`**

Add the import beside the other component imports:

```tsx
import { PetLayer } from './components/pet/pet-layer'
```

and render it directly after `<AccessibilityPanel />` (line 92):

```tsx
        <AccessibilityPanel />
        <PetLayer />
```

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run`
Expected: PASS, including `src/prerender.test.tsx` (the layer renders nothing on the server).

- [ ] **Step 7: Check it in the browser**

Run `npm run dev` in the background, open `http://localhost:5173/blog` with the chrome-devtools tools, take a screenshot. Expected: an orange, tuxedo, black or shiny sitting cat at the bottom right. Navigate to `/portfolio`: the cat walks or runs to a new spot and sits. Hover it: it plays idle (startle is not drawn yet, so the fallback ends at once). Wait 70 seconds: it stays on idle until the groom/loaf/sleep clips exist, then those play.

- [ ] **Step 8: Commit**

```bash
git add src/components/pet src/lib/pet/prefs-store.ts src/App.tsx
git commit -s -m "Mount the wandering cat outside the page transition

The cat sits on the bottom edge, walks or runs to a new spot on every
route change, and plays idle for any clip not drawn yet. It mounts
after the page-enter wrapper because that wrapper's transform would
pin a fixed element to the page instead of the viewport."
```

---

### Task 6: Settings panel

**Files:**
- Create: `src/components/pet/pet-panel.tsx`, `src/components/pet/pet-panel.test.tsx`
- Modify: `src/App.tsx` (mount `<PetPanel />` after `<PetLayer />`)
- Modify: `src/i18n/locales/en.json` and, via the script, the other five locales and `src/i18n/translations.lock.json`

**Interfaces:**
- Consumes: `usePetPrefs` (Task 5), `COATS`, `PetPrefs` (Task 3).
- Produces: `<PetPanel />`.

- [ ] **Step 1: Add the English keys**

Insert into `src/i18n/locales/en.json` (keys are flat; keep the file sorted the way the script writes it):

```json
  "pet.settings": "Pet settings",
  "pet.title": "Pets",
  "pet.close": "Close",
  "pet.cat": "Cat",
  "pet.on": "On",
  "pet.off": "Off",
  "pet.coat": "Coat",
  "pet.coat.tuxedo": "Tuxedo",
  "pet.coat.orange": "Orange",
  "pet.coat.black": "Black",
  "pet.coat.shiny": "Shiny",
  "pet.stoat": "Stoat visits",
  "pet.stoat.off": "Never",
  "pet.stoat.rare": "Rarely",
  "pet.stoat.normal": "Sometimes",
```

- [ ] **Step 2: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { PetPanel } from './pet-panel'

describe('PetPanel', () => {
  it('renders a labelled, closed toggle button', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <PetPanel />
      </I18nextProvider>,
    )
    expect(html).toContain('aria-label="Pet settings"')
    expect(html).toContain('aria-expanded="false"')
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/components/pet/pet-panel.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement `pet-panel.tsx`**

The accessibility button sits at `bottom-6 left-6`; this one sits beside it at `left-20`, styled to match.

```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PawPrint, X } from 'lucide-react'
import { COATS, type PetPrefs } from '../../lib/pet/prefs'
import { usePetPrefs } from '../../lib/pet/prefs-store'

const FREQS: PetPrefs['stoat'][] = ['off', 'rare', 'normal']

function Choice<T extends string>({ label, value, options, text, onPick }: { label: string; value: T; options: readonly T[]; text: (v: T) => string; onPick: (v: T) => void }) {
  return (
    <fieldset className="mt-3">
      <legend className="mb-1.5 font-mono text-xs uppercase tracking-wider text-charcoal/60 dark:text-bone/60">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onPick(o)}
            className="rounded border border-charcoal/20 px-2.5 py-1 text-sm aria-pressed:border-gold aria-pressed:bg-gold/15 dark:border-bone/20"
          >
            {text(o)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function PetPanel() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = usePetPrefs()
  const set = (patch: Partial<PetPrefs>) => setPrefs({ ...prefs, ...patch })

  return (
    <>
      <button
        type="button"
        aria-label={t('pet.settings')}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 left-20 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/20 bg-bone shadow-lg transition-transform hover:scale-105 dark:border-bone/20 dark:bg-charcoal"
      >
        <PawPrint className="h-5 w-5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="dialog" aria-label={t('pet.title')} className="fixed bottom-20 left-20 z-50 w-72 rounded-lg border border-charcoal/20 bg-bone p-4 shadow-xl dark:border-bone/20 dark:bg-charcoal">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider">{t('pet.title')}</h2>
              <button type="button" aria-label={t('pet.close')} onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <Choice label={t('pet.cat')} value={prefs.cat ? 'on' : 'off'} options={['on', 'off'] as const} text={(v) => t(`pet.${v}`)} onPick={(v) => set({ cat: v === 'on' })} />
            <Choice label={t('pet.coat')} value={prefs.coat} options={COATS} text={(v) => t(`pet.coat.${v}`)} onPick={(coat) => set({ coat })} />
            <Choice label={t('pet.stoat')} value={prefs.stoat} options={FREQS} text={(v) => t(`pet.stoat.${v}`)} onPick={(stoat) => set({ stoat })} />
          </div>
        </>
      )}
    </>
  )
}
```

Check `lucide-react` exports `PawPrint` (`grep -o "PawPrint" node_modules/lucide-react/dist/lucide-react.d.ts | head -1`). If not, use `Cat`.

Mount in `App.tsx` after `<PetLayer />`:

```tsx
        <PetLayer />
        <PetPanel />
```

- [ ] **Step 5: Translate**

Run: `node --env-file=.env scripts/translate-ui.mjs`
Expected: the five other locale files and `translations.lock.json` gain the `pet.*` keys. Then `node scripts/translate-ui.mjs --check` prints `translations are current`.

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run`
Expected: PASS, including `src/i18n/catalogs.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/components/pet src/App.tsx src/i18n
git commit -s -m "Add a pet settings panel beside the accessibility button

Visitors can turn the cat off, pick its coat and set how often the
stoat visits. Labels are translated into all six locales."
```

---

### Task 7: Art briefing kit

**Files:**
- Create: `tools/sprites/BRIEF.md`

**Interfaces:**
- Produces: the brief that every art subagent in Tasks 8, 9 and 13 is given verbatim.

- [ ] **Step 1: Write the brief**

```markdown
# Pixel art brief

You're a pixel artist. You've animated quadrupeds for indie games, you know the Animator's Survival Kit quadruped walk and Muybridge's cat plates, and you are your own harshest critic. You draw with code (character grids rendered to PNG), but every pose is placed by hand and judged with your eyes.

## The character
The sleek cat in `tools/sprites/styles/sleek/` (sitting idle) and `tools/sprites/walk-sleek/` (hand-keyed walk). Both are approved by the client; match them. Look at `styles/sleek/contact-sheet.png` and `walk-sleek/contact-sheet.png` before drawing anything.

## Rules the client has enforced
- No parametric leg rig. Legs are hand-typed drawings per pose, like `walk-sleek/legs.py`.
- Real cat anatomy: digitigrade, high hock on the hind leg, elbow tucked on the fore leg, wrist folds back on the lift.
- Healthy house-cat mass. The client rejected a walk as "malnourished, too thin" and the next one as a ball. Check every pose side by side with the sitting idle.
- Loops are 12 to 16 frames. One-shots may be shorter if more frames make them slow.
- 32x32 canvas, the sleek letters, plus effect letters U (mouth/tongue), Z (sleep z's), Q ("?"), R (heart/blush), X (motion marks). Coats are palette swaps only.

## Output
One module per clip in `tools/sprites/cat-anims/<clip>.py` exposing `CLIP = {'loop': bool, 'frames': [{'ms': int, 'px': [32 strings of 32 chars]}]}`. Static pose sets (look) are a non-looping clip with one frame per pose, in the order given in the task.
Render a contact sheet per clip, all four coats, 6x, frame numbers and ms, to `tools/sprites/cat-anims/sheets/<clip>.png`, and a side-by-side of a mid frame next to the sitting idle at 6x to `sheets/<clip>-vs-sit.png`.

## Self-check
Render and LOOK with the Read tool after every pass. Redraw rather than patch. Run `python3 tools/sprites/export.py && npx vitest run src/lib/pet/sprite.test.ts` before reporting; it must pass.

## Report
Paths, frames and ms per clip, what works, what is weak. Do not message anyone except your lead.
```

- [ ] **Step 2: Commit**

```bash
git add tools/sprites/BRIEF.md
git commit -s -m "Write the pixel art brief the art agents work from"
```

---

### Task 8: Cat art, batch 1 (resting and moving)

**Files:**
- Create: `tools/sprites/cat-anims/{run,sit_down,loaf,sleep,wake,groom,look}.py`, `tools/sprites/cat-anims/sheets/*.png`
- Modify: `src/assets/sprites/cat.json` (re-exported)

**Interfaces:**
- Consumes: `tools/sprites/BRIEF.md` (Task 7), `export.py` merge (Task 1).
- Produces: clips `run`, `sit_down`, `loaf`, `sleep`, `wake`, `groom`, `look` in `cat.json`. `look` has exactly 4 frames in the order left, center, right, up (Task 5 indexes them that way).

- [ ] **Step 1: Dispatch the art agent**

Dispatch one Opus subagent with the full text of `tools/sprites/BRIEF.md`, then this task list:

- `run`: loop, side view facing right like the walk, a calm-cat gallop, 12 frames, `travel` 2 (add `'travel': 2` to `CLIP`). Same planted-paw rule as the walk at 2 px per frame.
- `sit_down`: one-shot, walk pose to the sleek sit, 8 to 12 frames.
- `loaf`: loop, paws tucked, slow breathing, one slow blink, 12 to 16 frames.
- `sleep`: loop, curled, rising Z's, breathing, 12 to 16 frames.
- `wake`: one-shot, sleep to stretch (front legs out, rump up) to yawn to sit, 12 to 16 frames.
- `groom`: loop, licks a raised forepaw and washes the face. The bent foreleg must be hand-drawn (the chibi draft failed with a stick arm). 12 to 16 frames.
- `look`: 4 static frames from the sleek sit: head turned left, center, right, up.

Motion reference only (do not copy its style): `tools/sprites/chibi-suite-draft.json`.

- [ ] **Step 2: Client review gate**

Show the user every `sheets/<clip>.png` and `<clip>-vs-sit.png`. A clip is accepted only on the user's approval. Send rejected clips back to the same agent with the user's words.

- [ ] **Step 3: Export and test**

Run: `python3 tools/sprites/export.py && npx vitest run src/lib/pet`
Expected: PASS.

- [ ] **Step 4: Check in the browser**

With `npm run dev`, leave a page untouched for 70 s: the cat grooms, loafs, then sleeps; move the mouse: it wakes. Navigate between pages far apart on screen: it runs.

- [ ] **Step 5: Commit**

```bash
git add tools/sprites/cat-anims src/assets/sprites/cat.json
git commit -s -m "Draw the cat's resting and moving clips

Run, sit down, loaf, sleep, wake, groom and the four look poses, hand
keyed in the sleek style and approved against the sitting idle."
```

---

### Task 9: Cat art, batch 2 (reactions and moments)

**Files:**
- Create: `tools/sprites/cat-anims/{startle,swat,pounce,chase_tail,confused,happy}.py`, sheets
- Modify: `src/assets/sprites/cat.json`

**Interfaces:**
- Consumes: as Task 8.
- Produces: clips `startle`, `swat`, `pounce` (one-shots), `chase_tail`, `confused`, `happy` (loops) in `cat.json`.

- [ ] **Step 1: Dispatch the art agent**

Same brief, this task list:

- `startle`: one-shot, arched back, puffed fur and tail, small hop. Ears flatten without reading as horns at 1x. 6 to 10 frames.
- `swat`: one-shot, a quick hand-drawn bent-foreleg swipe to the side. 6 to 10 frames.
- `pounce`: one-shot, a visible butt wiggle, leap, land. 10 to 14 frames.
- `chase_tail`: loop, spins after its tail. Keep the size constant across side, front and back views (the chibi draft jumped in size). 12 frames.
- `confused`: loop, head tilts both ways, one ear drops, a bobbing "?" (letter Q) above. 12 to 16 frames.
- `happy`: loop, slow blink, tail up, a small rising heart (letter R). 12 to 16 frames.

- [ ] **Step 2: Client review gate**

As Task 8 Step 2.

- [ ] **Step 3: Export and test**

Run: `python3 tools/sprites/export.py && npx vitest run src/lib/pet`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tools/sprites/cat-anims src/assets/sprites/cat.json
git commit -s -m "Draw the cat's reactions and micro-moment clips

Startle, swat, pounce, chase tail, confused and happy, hand keyed in
the sleek style and approved against the sitting idle."
```

---

### Task 10: Micro-moments

**Files:**
- Create: `src/components/pet/stage-cat.tsx`, `src/components/pet/stage-cat.test.tsx`
- Modify: `src/routes/not-found.tsx`, `src/App.tsx:75` (the `Suspense` fallback), `src/components/post-signoff.tsx:204-212`

**Interfaces:**
- Consumes: `PixelSprite` (Task 2), `useStageClaim` (Task 2), `usePetPrefs` (Task 5), `prefersReducedMotion`, clips from Task 9.
- Produces: `<StageCat clip: string; scale?: number; className?: string />`. Claims the stage only while visible (IntersectionObserver, threshold 0.3). Renders a fixed-size empty box on the server so layout does not jump.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StageCat } from './stage-cat'

describe('StageCat', () => {
  it('reserves its box on the server without drawing', () => {
    const html = renderToStaticMarkup(<StageCat clip="confused" scale={3} />)
    expect(html).toContain('width:96px')
    expect(html).toContain('height:96px')
    expect(html).not.toContain('<canvas')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/pet/stage-cat.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `stage-cat.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import cat from '../../assets/sprites/cat.json'
import { prefersReducedMotion } from '../../lib/motion'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaim } from '../../lib/pet/stage'
import { PixelSprite } from './pixel-sprite'

const SPRITE = cat as Sprite

export function StageCat({ clip, scale = 3, className }: { clip: string; scale?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [prefs] = usePetPrefs()
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const show = mounted && prefs.cat
  useStageClaim(show && visible)
  return (
    <div ref={ref} className={className} style={{ width: SPRITE.w * scale, height: SPRITE.h * scale }}>
      {show && <PixelSprite sprite={SPRITE} clip={clip} variant={prefs.coat} scale={scale} playing={!prefersReducedMotion()} />}
    </div>
  )
}
```

- [ ] **Step 4: Wire the three places**

`src/routes/not-found.tsx`: import `StageCat` and add it above the tag, inside the `<section>`:

```tsx
        <StageCat clip="confused" scale={3} className="mb-6" />
        <MonoTag>{t('notFound.tag')}</MonoTag>
```

`src/App.tsx`: the blog post `Suspense` fallback becomes the tail chase:

```tsx
                <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><StageCat clip="chase_tail" scale={3} /></div>}>
```

`src/components/post-signoff.tsx`: render the happy cat above the flourish:

```tsx
export function PostSignoff({ variant }: { variant: number }) {
  const Flourish = VARIANTS[variant] ?? Terminal
  return (
    <div className="mt-20 flex flex-col items-center gap-6 border-t border-charcoal/10 pt-14 dark:border-bone/10">
      <StageCat clip="happy" scale={2} />
      {/* key remounts on variant switch so the flourish replays */}
      <Flourish key={variant} />
    </div>
  )
}
```

- [ ] **Step 5: Run the full suite**

Run: `npx vitest run`
Expected: PASS. The prerender tests still pass because `StageCat` draws nothing on the server; the 404 and post HTML only gain an empty sized `<div>`.

- [ ] **Step 6: Check in the browser**

Open `/does-not-exist`: a confused cat above the 404 text and no wandering cat. Open a blog post and scroll to the end: the happy cat appears and the wandering cat hides; scroll back up: the wandering cat returns. Turn the cat off in the settings panel: both disappear.

- [ ] **Step 7: Commit**

```bash
git add src/components/pet src/routes/not-found.tsx src/App.tsx src/components/post-signoff.tsx
git commit -s -m "Put the cat on the 404 page, the post loader and the sign-off

Each fixed-place cat claims the stage while it is on screen, so the
wandering cat steps out and there is never more than one."
```

---

### Task 11: Neural net

**Files:**
- Create: `src/lib/pet/neural-net.ts`, `src/lib/pet/neural-net.test.ts`

**Interfaces:**
- Produces:
  - `type Net = { nodes: { x: number; y: number }[]; edges: [number, number][] }`
  - `NET: Net` (6 nodes, layers 2-3-1, coordinates in sprite px inside a 24x12 box)
  - `pulseLevel(prev: number, typing: boolean, dt: number): number` (0..1; rises toward 1 at 1/150 per ms while typing, decays toward 0 at 1/400 per ms otherwise)
  - `edgeGlow(level: number, edgeIndex: number, t: number): number` (0..1, a travelling pulse per edge offset by index)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { edgeGlow, NET, pulseLevel } from './neural-net'

describe('neural net', () => {
  it('has six nodes, every edge pointing at real nodes', () => {
    expect(NET.nodes).toHaveLength(6)
    for (const [a, b] of NET.edges) {
      expect(NET.nodes[a]).toBeDefined()
      expect(NET.nodes[b]).toBeDefined()
    }
  })

  it('rises while typing and settles within half a second of a break', () => {
    let level = 0
    for (let i = 0; i < 20; i++) level = pulseLevel(level, true, 16)
    expect(level).toBeGreaterThan(0.9)
    for (let i = 0; i < 32; i++) level = pulseLevel(level, false, 16)
    expect(level).toBe(0)
  })

  it('never leaves 0..1', () => {
    expect(pulseLevel(1, true, 1000)).toBe(1)
    expect(pulseLevel(0, false, 1000)).toBe(0)
    for (let t = 0; t < 2000; t += 37) {
      const g = edgeGlow(1, 3, t)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThanOrEqual(1)
    }
  })

  it('is dark when the level is zero', () => {
    expect(edgeGlow(0, 0, 500)).toBe(0)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/pet/neural-net.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `neural-net.ts`**

```ts
export type Net = { nodes: { x: number; y: number }[]; edges: [number, number][] }

export const NET: Net = {
  nodes: [
    { x: 2, y: 3 },
    { x: 2, y: 9 },
    { x: 12, y: 1 },
    { x: 12, y: 6 },
    { x: 12, y: 11 },
    { x: 22, y: 6 },
  ],
  edges: [
    [0, 2], [0, 3], [0, 4],
    [1, 2], [1, 3], [1, 4],
    [2, 5], [3, 5], [4, 5],
  ],
}

export function pulseLevel(prev: number, typing: boolean, dt: number) {
  const next = typing ? prev + dt / 150 : prev - dt / 400
  return Math.min(1, Math.max(0, next))
}

// A bright spot travels along each edge; the index offset keeps edges out of step.
export function edgeGlow(level: number, edgeIndex: number, t: number) {
  const phase = ((t / 700 + edgeIndex * 0.37) % 1 + 1) % 1
  return level * (0.25 + 0.75 * Math.max(0, Math.sin(phase * Math.PI)))
}
```

Check the settle test: from ~1, 32 frames of 16 ms is 512 ms, and decay at 1/400 per ms reaches 0 after 400 ms, so the level is exactly 0 by then.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/pet/neural-net.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/neural-net.ts src/lib/pet/neural-net.test.ts
git commit -s -m "Model the desk neural net's pulse

The net brightens within about 150 ms of typing and goes dark 400 ms
into a break, following the desk sprite's typing frames."
```

---

### Task 12: Desk scene on /about

**Files:**
- Create: `src/components/pet/desk-scene.tsx`, `src/components/pet/desk-scene.test.tsx`
- Modify: `src/routes/about/index.tsx:231-236` (after the "Now status" line)

**Interfaces:**
- Consumes: `PixelSprite` (Task 2, `onStep` gives the current `Frame` with `typing`), `useStageClaim` (Task 2), `usePetPrefs` (Task 5), `NET`, `pulseLevel`, `edgeGlow` (Task 11), `subscribe` (ticker), `me.json`, `cat.json` (`sleep` clip from Task 8).
- Produces: `<DeskScene scale?: number />`, default scale 3.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { DeskScene } from './desk-scene'

describe('DeskScene', () => {
  it('reserves the desk box on the server and labels it', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <DeskScene scale={3} />
      </I18nextProvider>,
    )
    expect(html).toContain('width:297px')
    expect(html).toContain('height:171px')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Aliasgar at the desk, typing, with a cat asleep beside the laptop"')
    expect(html).not.toContain('<canvas')
  })
})
```

Add the key to `src/i18n/locales/en.json`:

```json
  "about.desk.alt": "Aliasgar at the desk, typing, with a cat asleep beside the laptop",
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/pet/desk-scene.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `desk-scene.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import cat from '../../assets/sprites/cat.json'
import me from '../../assets/sprites/me.json'
import { prefersReducedMotion } from '../../lib/motion'
import { edgeGlow, NET, pulseLevel } from '../../lib/pet/neural-net'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaim } from '../../lib/pet/stage'
import { subscribe } from '../../lib/pet/ticker'
import { PixelSprite } from './pixel-sprite'

const ME = me as Sprite
const CAT = cat as Sprite
const DESK = ME.animations.desk
const DW = DESK.w!
const DH = DESK.h!
// the cat is left-aligned in the slot and stands on its floor, so the width is unused
const [SX, SY, , SH] = DESK.catSlot!
// the net floats in the clear rows above the laptop
const NET_X = 40
const NET_Y = 0

function NetCanvas({ scale, typing }: { scale: number; typing: { current: boolean } }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    c.width = 24 * scale
    c.height = 12 * scale
    const ctx = c.getContext('2d')!
    let level = 0
    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      NET.edges.forEach(([a, b], i) => {
        const g = edgeGlow(level, i, t)
        ctx.strokeStyle = `rgba(125, 196, 228, ${0.15 + 0.7 * g})`
        ctx.lineWidth = scale / 2
        ctx.beginPath()
        ctx.moveTo((NET.nodes[a].x + 0.5) * scale, (NET.nodes[a].y + 0.5) * scale)
        ctx.lineTo((NET.nodes[b].x + 0.5) * scale, (NET.nodes[b].y + 0.5) * scale)
        ctx.stroke()
      })
      ctx.fillStyle = `rgba(242, 201, 76, ${0.4 + 0.6 * level})`
      for (const n of NET.nodes) ctx.fillRect(n.x * scale, n.y * scale, scale, scale)
    }
    if (prefersReducedMotion()) {
      draw()
      return
    }
    return subscribe((dt) => {
      t += dt
      level = pulseLevel(level, typing.current, dt)
      draw()
    })
  }, [scale, typing])
  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', left: NET_X * scale, top: NET_Y * scale, width: 24 * scale, height: 12 * scale }} />
}

export function DeskScene({ scale = 3 }: { scale?: number }) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const typing = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [prefs] = usePetPrefs()
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const reduced = mounted && prefersReducedMotion()
  const catHere = mounted && prefs.cat
  useStageClaim(catHere && visible)

  return (
    <div ref={ref} role="img" aria-label={t('about.desk.alt')} style={{ position: 'relative', width: DW * scale, height: DH * scale }}>
      {mounted && (
        <>
          <PixelSprite
            sprite={ME}
            clip="desk"
            scale={scale}
            playing={!reduced}
            frame={reduced ? 0 : undefined}
            onStep={(_, f) => {
              typing.current = !!f.typing
            }}
          />
          <NetCanvas scale={scale} typing={typing} />
          {catHere && (
            <PixelSprite
              sprite={CAT}
              clip="sleep"
              variant={prefs.coat}
              scale={scale}
              playing={!reduced}
              style={{ position: 'absolute', left: SX * scale, top: (SY + SH - CAT.h) * scale }}
            />
          )}
        </>
      )}
    </div>
  )
}
```

Then translate the new key: `node --env-file=.env scripts/translate-ui.mjs`.

- [ ] **Step 4: Place it on /about**

In `src/routes/about/index.tsx`, after the "Now status" `div` (ends at line 236), add:

```tsx
        {/* Desk */}
        <div data-card className="mt-10 flex justify-center">
          <DeskScene scale={3} />
        </div>
```

with `import { DeskScene } from '../../components/pet/desk-scene'`.

- [ ] **Step 5: Run the full suite**

Run: `npx vitest run`
Expected: PASS, including the `/about` ProfilePage prerender test.

- [ ] **Step 6: Check in the browser**

Open `/about` and scroll to the desk: pixel-me types, sips, strokes the beard and tucks the hair; code scrolls on the screen; the net brightens while typing and dims on breaks; the cat sleeps on the far end of the desk in the chosen coat, and the wandering cat is gone until the desk scrolls out of view. With the accessibility panel set to Reduced: a still frame and a static net.

- [ ] **Step 7: Commit**

```bash
git add src/components/pet/desk-scene.tsx src/components/pet/desk-scene.test.tsx src/routes/about/index.tsx src/i18n
git commit -s -m "Put the pixel-me desk scene on the about page

Pixel-me types, sips and tucks back the hair under a small neural net that
brightens with the typing frames, and the site cat sleeps on the desk
while the scene is on screen."
```

---

### Task 13: Stoat art

**Files:**
- Create: `tools/sprites/stoat/stoat.py`, `tools/sprites/stoat/build.py`, sheets
- Modify: `tools/sprites/export.py` (write `stoat.json`), `src/lib/pet/sprite.test.ts` (validate it)
- Create: `src/assets/sprites/stoat.json`

**Interfaces:**
- Consumes: `tools/sprites/BRIEF.md`.
- Produces: `stoat.json` with `w` 32, `h` 20, palettes `summer` and `winter`, clips `bound` (loop, `travel` 2), `periscope` (one-shot), `war_dance` (one-shot), `peek` (one-shot).

- [ ] **Step 1: Dispatch the art agent**

Dispatch one Opus subagent with `BRIEF.md`, replacing "The character" with:

> A stoat (Mustela erminea), drawn to sit beside the sleek cat in the same style and outline treatment. 32x20 canvas. Long low body, short legs, small rounded ears, black tail tip in both coats. Palettes: `summer` (brown back, cream belly) and `winter` (all white, the Finnish kärppä, black tail tip). Clips: `bound` (the arched-back inchworm lope, loop, 12 frames, 2 px travel per frame, hand-keyed legs), `periscope` (pops up from below the canvas bottom, stands on hind legs, looks left and right, drops, 12 to 16 frames), `war_dance` (frantic twisting hops, 12 to 16 frames), `peek` (head rises from the bottom edge, blinks, drops, 10 to 14 frames). Output `tools/sprites/stoat/build.py` writing `tools/sprites/stoat/stoat.json` in the same JSON format, plus contact sheets.

- [ ] **Step 2: Client review gate**

Show the user the stoat contact sheets, including one frame of the stoat next to the cat's sit at the same scale. Accept on approval only.

- [ ] **Step 3: Export and validate**

Add to `export.py`'s `__main__`:

```python
    write('stoat.json', load('stoat/stoat.json'))
```

Add to the `it.each` table in `src/lib/pet/sprite.test.ts`:

```ts
import stoat from '../../assets/sprites/stoat.json'
// ...
    ['stoat', stoat],
```

and a test:

```ts
  it('ships the stoat clips in both coats', () => {
    const s = stoat as Sprite
    expect(Object.keys(s.animations).sort()).toEqual(['bound', 'peek', 'periscope', 'war_dance'])
    expect(Object.keys(s.palettes!).sort()).toEqual(['summer', 'winter'])
  })
```

Run: `python3 tools/sprites/export.py && npx vitest run src/lib/pet/sprite.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tools/sprites/stoat tools/sprites/export.py src/assets/sprites/stoat.json src/lib/pet/sprite.test.ts
git commit -s -m "Draw the stoat in summer brown and winter white

Bound, periscope, war dance and peek, hand keyed to sit beside the
sleek cat."
```

---

### Task 14: Stoat visits

**Files:**
- Create: `src/lib/pet/stoat.ts`, `src/lib/pet/stoat.test.ts`
- Create: `src/components/pet/stoat-visitor.tsx`
- Modify: `src/components/pet/pet-layer.tsx` (mount the visitor, roll on route change)

**Interfaces:**
- Consumes: `StoatFreq` (Task 3), `catBus`, `SCALE` (Task 5), `PixelSprite` (Task 2), `prefersReducedMotion`, `stoat.json` (Task 13).
- Produces:
  - `isWinter(d: Date): boolean` (November through March)
  - `visitChance(freq: StoatFreq, d: Date): number` (`off` 0; `normal` 1/6, winter 1/3; `rare` 1/12, winter 1/6)
  - `type Script = 'bound' | 'periscope' | 'peek' | 'squat'`
  - `pickScript(roll: number, cat: 'awake' | 'asleep' | 'away' | 'off'): Script`
  - `<StoatVisitor script: Script; coat: 'summer' | 'winter'; onDone: () => void />`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { isWinter, pickScript, visitChance } from './stoat'

describe('season', () => {
  it('counts November through March as winter', () => {
    expect(isWinter(new Date('2026-11-01'))).toBe(true)
    expect(isWinter(new Date('2027-03-31'))).toBe(true)
    expect(isWinter(new Date('2026-04-01'))).toBe(false)
    expect(isWinter(new Date('2026-10-31'))).toBe(false)
  })
})

describe('visitChance', () => {
  it('doubles in winter and is zero when off', () => {
    const summer = new Date('2026-07-01')
    const winter = new Date('2026-12-01')
    expect(visitChance('normal', summer)).toBeCloseTo(1 / 6)
    expect(visitChance('normal', winter)).toBeCloseTo(1 / 3)
    expect(visitChance('rare', summer)).toBeCloseTo(1 / 12)
    expect(visitChance('rare', winter)).toBeCloseTo(1 / 6)
    expect(visitChance('off', winter)).toBe(0)
  })
})

describe('pickScript', () => {
  it('squats in the cat spot only while the cat is away', () => {
    expect(pickScript(0.0, 'away')).toBe('squat')
    expect(pickScript(0.0, 'awake')).not.toBe('squat')
  })

  it('spreads the other visits across bound, periscope and peek', () => {
    expect(pickScript(0.1, 'awake')).toBe('bound')
    expect(pickScript(0.6, 'awake')).toBe('periscope')
    expect(pickScript(0.9, 'awake')).toBe('peek')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/pet/stoat.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `stoat.ts`**

```ts
import type { StoatFreq } from './prefs'

export type Script = 'bound' | 'periscope' | 'peek' | 'squat'

export const isWinter = (d: Date) => {
  const m = d.getMonth()
  return m >= 10 || m <= 2
}

export function visitChance(freq: StoatFreq, d: Date) {
  if (freq === 'off') return 0
  const base = freq === 'rare' ? 1 / 12 : 1 / 6
  return isWinter(d) ? base * 2 : base
}

export function pickScript(roll: number, cat: 'awake' | 'asleep' | 'away' | 'off'): Script {
  if (cat === 'away' && roll < 0.3) return 'squat'
  if (roll < 0.5) return 'bound'
  if (roll < 0.8) return 'periscope'
  return 'peek'
}
```

Check: `pickScript(0.1, 'awake')` returns `bound`; `pickScript(0.0, 'away')` returns `squat`.

- [ ] **Step 4: Implement `stoat-visitor.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import stoat from '../../assets/sprites/stoat.json'
import type { Sprite } from '../../lib/pet/sprite'
import type { Script } from '../../lib/pet/stoat'
import { catBus, SCALE } from './pet-layer'
import { PixelSprite } from './pixel-sprite'

const S = stoat as Sprite

export function StoatVisitor({ script, coat, onDone }: { script: Script; coat: 'summer' | 'winter'; onDone: () => void }) {
  const dir: 1 | -1 = useRef<1 | -1>(Math.random() < 0.5 ? 1 : -1).current
  const room = Math.floor(window.innerWidth / SCALE)
  const [x, setX] = useState(script === 'bound' ? (dir === 1 ? -S.w : room) : Math.floor(Math.random() * (room - S.w)))
  const [clip, setClip] = useState(script === 'bound' ? 'bound' : script === 'squat' ? 'periscope' : script)
  const told = useRef(false)

  useEffect(() => {
    if (script === 'bound' && !told.current) {
      told.current = true
      catBus.emit({ type: 'stoat', dir })
    }
  }, [script, dir])

  return (
    <div
      style={{ position: 'fixed', left: x * SCALE, bottom: 0, zIndex: 31, pointerEvents: script === 'peek' ? 'auto' : 'none' }}
      onClick={() => script === 'peek' && setClip('war_dance')}
    >
      <PixelSprite
        sprite={S}
        clip={clip}
        variant={coat}
        scale={SCALE}
        flip={dir === -1}
        onStep={(n) => {
          if (clip !== 'bound') return
          setX((v) => {
            const next = v + dir * n * (S.animations.bound.travel ?? 2)
            if (next < -S.w || next > room) onDone()
            return next
          })
        }}
        onEnd={onDone}
      />
    </div>
  )
}
```

- [ ] **Step 5: Mount it in the pet layer**

In `PetLayer`, roll once per route change and render the visitor:

```tsx
import { pickScript, visitChance, isWinter, type Script } from '../../lib/pet/stoat'
import { StoatVisitor } from './stoat-visitor'
// inside PetLayer, before the early return:
  const { pathname } = useLocation()
  const [visit, setVisit] = useState<Script | null>(null)
  useEffect(() => {
    if (!mounted || prefersReducedMotion() || visit) return
    if (Math.random() >= visitChance(prefs.stoat, new Date())) return
    setVisit(pickScript(Math.random(), !prefs.cat ? 'off' : claimed ? 'away' : 'awake'))
  }, [pathname, mounted])
```

and change the return so the stoat shows even when the cat is off or hidden:

```tsx
  if (!mounted) return null
  return (
    <>
      {prefs.cat && !claimed && <Cat coat={prefs.coat} />}
      {visit && <StoatVisitor script={visit} coat={isWinter(new Date()) ? 'winter' : 'summer'} onDone={() => setVisit(null)} />}
    </>
  )
```

Keep the server render empty: `mounted` is false on the server, so the existing `PetLayer` test still expects `''`.

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Check in the browser**

Set stoat to "Sometimes" and temporarily force a visit by running `localStorage.setItem('pet-prefs', JSON.stringify({cat:true,coat:'orange',stoat:'normal'}))` and reloading several pages. Expected over a few navigations: a stoat bounds across and the cat startles or chases; a periscope pops up and drops; a peek war-dances when clicked. In November to March the stoat is white.

- [ ] **Step 8: Commit**

```bash
git add src/lib/pet/stoat.ts src/lib/pet/stoat.test.ts src/components/pet
git commit -s -m "Let the stoat visit

A visit is rolled per page view, one in six by default and twice that
from November to March, when the stoat wears its white coat. A bounding
stoat startles the cat or sets it chasing, and a peeking one war-dances
if caught."
```

---

### Task 15: Final verification

**Files:** none new.

- [ ] **Step 1: Full suite and build**

Run: `npx vitest run && npm run build`
Expected: all tests pass; the build finishes with prerendered pages.

- [ ] **Step 2: Browser pass**

With `npm run preview`, check each with chrome-devtools screenshots at 1440 and 390 px wide:
- `/`, `/blog`, `/portfolio`: the cat sits on the bottom edge, never over the accessibility or pet buttons' click targets (they are `z-50`, the cat `z-30`).
- `/about`: desk scene, net, cat on the desk, no wandering cat while it is in view.
- `/does-not-exist`: confused cat.
- A blog post end: happy cat.
- Accessibility panel set to Reduced: the cat is parked asleep, the desk is still, no stoat.
- Pet panel: each coat switches the cat and the desk cat; Cat off removes every cat.

- [ ] **Step 3: Report**

List anything that failed with screenshots; do not mark the plan done until each check passes.
