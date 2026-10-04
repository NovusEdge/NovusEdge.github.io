# Pixel friends phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pixel-me changes persona by route: a mirrored desk on /portfolio, a scientist on /research, and a thinking pose (with the stoat gone) on posts that opt in through frontmatter.

**Architecture:** One pure function, `personaFor(pathname)`, maps a URL to a persona. The friends layer reads it on every navigation: desk personas keep the phase 1 desk (mirrored for `desk-right`), and the other personas render a new `PersonaCorner` that loops one clip with a random one-shot beat. The stoat gets `leave`/`return` events and a `gone` mode. Corner placement for the accessibility button, paw button and pet panel comes from pure functions in `corners.ts`, with both /portfolio options (swap sides, lift the button) behind one constant until the client picks.

**Tech Stack:** React 19, react-router, Vite, Tailwind v4, vitest (node environment; component tests are SSR-only via `renderToStaticMarkup`), Python 3 + Pillow sprite generators in `tools/sprites/`, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-04-pixel-friends-phase3-design.md`

## Global Constraints

- Package manager is pnpm: `pnpm test`, `pnpm run build` (runs `tsc && vite build && node scripts/postbuild.mjs`).
- Commits use `git commit -s`. No `Co-Authored-By` trailer, no AI attribution, no em-dashes in commit messages or user-visible text.
- Edit files with the Edit/Write tools, not sed or heredocs.
- Every subagent runs on Sonnet. Art agents are briefed "you're a pixel artist" with `tools/sprites/BRIEF.md`.
- Pixel-me keeps the approved look: long black hair behind the back, beard, light skin, sweater.
- True in-betweens at 40 to 60 ms per motion frame; holds may be longer. Slow loops play at 1.75x (`ms / 1.75`); short one-shots keep 1x and get extra in-betweens instead.
- No new persona clip may be taller than the desk clip (57 px), so a corner never grows past the desk's height.
- The layer renders nothing on the server, and mounts outside `.page-enter` (its transform breaks `position: fixed`).
- Comments only for facts the code cannot show. Match the surrounding comment density.

## Review Focus

1. Landing on a thinking post as the first page of a visit: the stoat must be absent from the start, not run off screen on load. Pinned in Task 3.
2. Navigating thinking post, then a normal page, then a thinking post again before the stoat finishes leaving: a `return` while leaving must turn it around, and a `leave` while already leaving must not restart it. Pinned in Task 3.
3. Resizing the window while the stoat is gone or leaving: the tick clamp must not drag it back on screen. Pinned in Task 3.
4. Prerendered URLs end in a slash (`/blog/x/`, `/ja/blog/x/`): `personaFor` must treat them the same as the bare path. Pinned in Task 1.
5. Navigating from a page where the stoat naps on the desk to a page with no desk, or to the other corner: the stoat must wake on the floor instead of vanishing with the desk. Pinned in Task 1 (`stoatOnRoute`).

---

### Task 0: Land the phase 1 leftovers and the portfolio prune

Executed by the lead in the main session, not a subagent. Phase 3 builds on the `stoatSlot` rename, `hitTop` and the lazy stoat sprite from `pixel-phase1-leftovers`.

- [ ] **Step 1: Browser check with the client**

Run `pnpm dev` in the `pixel-phase1-leftovers` worktree (`.claude/worktrees/agent-a19e56a0376f9d9ac`), open it in Chromium, and show the client: the 404 page and post loader (stoat appears without a flash), shrinking the window while pixel-me walks (he sits down without a pop), and clicking pixel-me's head during stand_up.

- [ ] **Step 2: Merge both branches into main**

```bash
git checkout main
git merge --no-ff pixel-phase1-leftovers -m "Merge pixel friends phase 1 leftovers"
git merge --no-ff portfolio-prune -m "Merge portfolio prune"
pnpm test && pnpm run build
```
Expected: both pass. Then remove the two agent worktrees with `git worktree remove`.

- [ ] **Step 3: Branch for phase 3**

```bash
git checkout --no-track -b pixel-friends-phase3 main
```

---

### Task 1: Persona resolution

**Files:**
- Create: `src/lib/pet/persona.ts`
- Create: `src/lib/pet/persona.test.ts`
- Modify: `src/lib/posts.ts` (the `Post` type and `parsePost`)

**Interfaces:**
- Consumes: `stripLocale(pathname: string): string` from `src/i18n/paths.ts`; `posts: Post[]` from `src/lib/posts.ts`; `Mode`, `PetEvent` from `src/lib/pet/pet-brain.ts` (the `leave`/`return` event shapes are added in Task 3; this task only builds the event objects).
- Produces:
  - `type Persona = 'desk' | 'desk-right' | 'thinking' | 'scientist'`
  - `personaFor(pathname: string, list?: Pick<Post, 'slug' | 'pixel'>[]): Persona`
  - `atDesk(p: Persona): boolean`
  - `usePersona(): Persona` (reads `useLocation().pathname`)
  - `PERSONA_CLIPS: Record<'thinking' | 'scientist', { loop: string; beat: string }>`
  - `stoatOnRoute(was: Persona, next: Persona, mode: Mode, width: number, off: number, target: number): RouteEvent[]` where `RouteEvent` is `PetEvent` without `now`
  - `Post.pixel?: string`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/pet/persona.test.ts
import { describe, expect, it } from 'vitest'
import { atDesk, personaFor, stoatOnRoute } from './persona'

const list = [
  { slug: 'deep', pixel: 'thinking' },
  { slug: 'lab-notes', pixel: 'scientist' },
  { slug: 'odd', pixel: 'astronaut' },
  { slug: 'plain', pixel: undefined },
]

describe('personaFor', () => {
  it('maps the fixed routes', () => {
    expect(personaFor('/', list)).toBe('desk')
    expect(personaFor('/about', list)).toBe('desk')
    expect(personaFor('/research', list)).toBe('scientist')
    expect(personaFor('/portfolio', list)).toBe('desk-right')
    expect(personaFor('/portfolio/veil', list)).toBe('desk-right')
  })

  it('reads the pixel field from the post', () => {
    expect(personaFor('/blog/deep', list)).toBe('thinking')
    expect(personaFor('/blog/lab-notes', list)).toBe('scientist')
    expect(personaFor('/blog/plain', list)).toBe('desk')
    expect(personaFor('/blog', list)).toBe('desk')
  })

  it('falls back to the desk for unknown values and slugs', () => {
    expect(personaFor('/blog/odd', list)).toBe('desk')
    expect(personaFor('/blog/missing', list)).toBe('desk')
  })

  it('ignores the locale prefix and trailing slashes, so translations follow the English flag', () => {
    expect(personaFor('/ja/blog/deep', list)).toBe('thinking')
    expect(personaFor('/blog/deep/', list)).toBe('thinking')
    expect(personaFor('/de/research/', list)).toBe('scientist')
    expect(personaFor('/fi/portfolio/', list)).toBe('desk-right')
    expect(personaFor('/de/', list)).toBe('desk')
  })
})

describe('atDesk', () => {
  it('is true only for the desk personas', () => {
    expect(atDesk('desk')).toBe(true)
    expect(atDesk('desk-right')).toBe(true)
    expect(atDesk('thinking')).toBe(false)
    expect(atDesk('scientist')).toBe(false)
  })
})

describe('stoatOnRoute', () => {
  it('sends the stoat away on a thinking route and back after it', () => {
    expect(stoatOnRoute('desk', 'thinking', 'idle', 600, 32, 100)).toEqual([{ type: 'leave', width: 600, off: 32 }])
    expect(stoatOnRoute('thinking', 'desk', 'gone', 600, 32, 100)).toEqual([{ type: 'return', width: 600, off: 32, target: 100 }])
  })

  it('bounds somewhere new on an ordinary route change', () => {
    expect(stoatOnRoute('desk', 'desk', 'idle', 600, 32, 100)).toEqual([{ type: 'go', target: 100 }])
  })

  it('wakes a desk nap first when the desk goes away or changes corner', () => {
    expect(stoatOnRoute('desk', 'scientist', 'desk_nap', 600, 32, 100)).toEqual([{ type: 'input' }, { type: 'go', target: 100 }])
    expect(stoatOnRoute('desk', 'desk-right', 'desk_nap', 600, 32, 100)).toEqual([{ type: 'input' }, { type: 'go', target: 100 }])
    expect(stoatOnRoute('desk', 'desk', 'desk_nap', 600, 32, 100)).toEqual([{ type: 'go', target: 100 }])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/lib/pet/persona.test.ts`
Expected: FAIL, cannot resolve `./persona`.

- [ ] **Step 3: Add `pixel` to posts**

In `src/lib/posts.ts`, add `pixel?: string` to the `Post` type after `draft?: boolean`, and in `parsePost` add after the `draft` line:

```ts
    pixel: (data.pixel as string) || undefined,
```

Translations are parsed by the same function, but `personaFor` only reads the eager English `posts` list, so a translation's frontmatter never decides the persona.

- [ ] **Step 4: Write `persona.ts`**

```ts
// src/lib/pet/persona.ts
import { useLocation } from 'react-router'
import { stripLocale } from '../../i18n/paths'
import { posts, type Post } from '../posts'
import type { Mode, PetEvent } from './pet-brain'

export type Persona = 'desk' | 'desk-right' | 'thinking' | 'scientist'
type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never
export type RouteEvent = DistributiveOmit<PetEvent, 'now'>

const POST_PERSONAS: Persona[] = ['thinking', 'scientist']

export const PERSONA_CLIPS = {
  thinking: { loop: 'think', beat: 'think_q' },
  scientist: { loop: 'lab', beat: 'lab_squint' },
} as const

export function personaFor(pathname: string, list: Pick<Post, 'slug' | 'pixel'>[] = posts): Persona {
  const path = stripLocale(pathname).replace(/\/+$/, '') || '/'
  if (path === '/research') return 'scientist'
  if (path === '/portfolio' || path.startsWith('/portfolio/')) return 'desk-right'
  const slug = path.match(/^\/blog\/([^/]+)$/)?.[1]
  const pixel = slug ? list.find((p) => p.slug === slug)?.pixel : undefined
  return POST_PERSONAS.includes(pixel as Persona) ? (pixel as Persona) : 'desk'
}

export const atDesk = (p: Persona) => p === 'desk' || p === 'desk-right'

export const usePersona = () => personaFor(useLocation().pathname)

export function stoatOnRoute(was: Persona, next: Persona, mode: Mode, width: number, off: number, target: number): RouteEvent[] {
  if (next === 'thinking') return [{ type: 'leave', width, off }]
  if (was === 'thinking') return [{ type: 'return', width, off, target }]
  // a napping stoat is drawn inside the desk, so it has to wake before the desk moves or goes
  const wake: RouteEvent[] = mode === 'desk_nap' && was !== next ? [{ type: 'input' }] : []
  return [...wake, { type: 'go', target }]
}
```

`tsc` will reject the `leave`/`return` objects until Task 3 adds those events. If Task 3 is not merged yet, run only vitest for this task; vitest does not typecheck.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm vitest run src/lib/pet/persona.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/pet/persona.ts src/lib/pet/persona.test.ts src/lib/posts.ts
git commit -s -m "Pick pixel-me's persona from the route"
```

---

### Task 2: Pixel-me snaps on a persona change

**Files:**
- Modify: `src/lib/pet/me-brain.ts`
- Test: `src/lib/pet/me-brain.test.ts`

**Interfaces:**
- Produces: `MeEvent` gains `{ type: 'reset'; now: number; roll: number }`. It puts pixel-me back at the desk at home, drops any walk, and schedules the next walk. Under reduced motion (`still`) it changes nothing.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/pet/me-brain.test.ts`:

```ts
describe('persona change', () => {
  it('snaps a walk back to the desk', () => {
    const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 0 })
    const walking = run(due, { type: 'wrap' }, { type: 'end', now: 1, roll: 0 }, { type: 'step', px: 8 })
    expect(walking.mode).toBe('walking')
    const s = run(walking, { type: 'reset', now: 5000, roll: 0 })
    expect(s).toMatchObject({ mode: 'desk', x: HOME, target: null, dir: 1, nextWalk: 5000 + WALK_EVERY_MIN })
  })

  it('leaves a reduced-motion pixel-me alone', () => {
    const s = initMe(0, HOME, true, 0)
    expect(run(s, { type: 'reset', now: 5000, roll: 0 })).toBe(s)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/lib/pet/me-brain.test.ts`
Expected: FAIL on the `reset` cases (the reducer returns `undefined` for an unknown event, so `toMatchObject` fails).

- [ ] **Step 3: Implement**

In `src/lib/pet/me-brain.ts`, add to the `MeEvent` union:

```ts
  | { type: 'reset'; now: number; roll: number }
```

and add a case to `meReducer`'s switch, after `case 'wrap'`:

```ts
    case 'reset':
      return { ...s, mode: 'desk', x: s.home, target: null, dir: 1, nextWalk: nextWalkAt(e.now, e.roll) }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/lib/pet/me-brain.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/me-brain.ts src/lib/pet/me-brain.test.ts
git commit -s -m "Let pixel-me snap back to the desk when the persona changes"
```

---

### Task 3: The stoat leaves and comes back

**Files:**
- Modify: `src/lib/pet/pet-brain.ts`
- Test: `src/lib/pet/pet-brain.test.ts`

**Interfaces:**
- Produces:
  - `Mode` gains `'gone'`. `PetState` gains `leaving: boolean` and `still: boolean`.
  - `PetEvent` gains `{ type: 'leave'; now: number; width: number; off: number }` and `{ type: 'return'; now: number; width: number; off: number; target: number }`. `width` is the stoat room (`stoatRoom()`), `off` is the sprite width in stoat px.
  - `initPet(now: number, x: number, reduced: boolean, away = false): PetState`. `away` starts the stoat `gone`.
  - `stoatSpot(m: Mode, claimed: boolean)` returns `null` for `gone`.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/pet/pet-brain.test.ts` (it already imports `initPet`, `petReducer` and `stoatSpot`; add any missing imports):

```ts
describe('leaving and coming back', () => {
  const W = 600
  const OFF = 32
  const walkOut = (s: PetState) => {
    let t = s
    for (let i = 0; i < 400 && t.mode !== 'gone'; i++) t = petReducer(t, { type: 'step', now: 1, px: 4 })
    return t
  }

  it('bounds off the nearer edge and is gone when it gets there', () => {
    const left = petReducer(initPet(0, 100, false), { type: 'leave', now: 1, width: W, off: OFF })
    expect(left).toMatchObject({ mode: 'run', target: -OFF, leaving: true, dir: -1 })
    const right = petReducer(initPet(0, 500, false), { type: 'leave', now: 1, width: W, off: OFF })
    expect(right).toMatchObject({ target: W + OFF, dir: 1 })
    const gone = walkOut(left)
    expect(gone).toMatchObject({ mode: 'gone', leaving: false, target: null })
    expect(stoatSpot(gone.mode, false)).toBeNull()
  })

  it('ignores everything but steps while leaving, and everything but return while gone', () => {
    const leaving = petReducer(initPet(0, 100, false), { type: 'leave', now: 1, width: W, off: OFF })
    for (const e of [
      { type: 'input', now: 2 },
      { type: 'go', now: 2, target: 300 },
      { type: 'click', now: 2, roll: 0.9 },
      { type: 'tick', now: 2, width: W, roll: 0, desk: null },
    ] as PetEvent[]) expect(petReducer(leaving, e)).toBe(leaving)
    expect(petReducer(leaving, { type: 'leave', now: 2, width: W, off: OFF })).toBe(leaving)
    const gone = walkOut(leaving)
    expect(petReducer(gone, { type: 'go', now: 3, target: 300 })).toBe(gone)
    expect(petReducer(gone, { type: 'tick', now: 3, width: 50, roll: 0, desk: null })).toBe(gone)
  })

  it('keeps its off-screen position through a resize', () => {
    const leaving = walkOut(petReducer(initPet(0, 100, false), { type: 'leave', now: 1, width: W, off: OFF }))
    expect(petReducer(leaving, { type: 'tick', now: 2, width: 200, roll: 0, desk: null }).x).toBe(-OFF)
  })

  it('comes back in from the edge nearer its target', () => {
    const gone = walkOut(petReducer(initPet(0, 100, false), { type: 'leave', now: 1, width: W, off: OFF }))
    const back = petReducer(gone, { type: 'return', now: 2, width: W, off: OFF, target: 450 })
    expect(back).toMatchObject({ x: W + OFF, target: 450, dir: -1, leaving: false })
    expect(['walk', 'run']).toContain(back.mode)
  })

  it('turns around when told to return while still leaving', () => {
    const leaving = petReducer(petReducer(initPet(0, 100, false), { type: 'leave', now: 1, width: W, off: OFF }), { type: 'step', now: 1, px: 40 })
    const back = petReducer(leaving, { type: 'return', now: 2, width: W, off: OFF, target: 300 })
    expect(back).toMatchObject({ x: 60, target: 300, dir: 1, leaving: false })
  })

  it('starts gone when the first page has no stoat', () => {
    const s = initPet(0, 100, false, true)
    expect(s.mode).toBe('gone')
    expect(stoatSpot(s.mode, false)).toBeNull()
  })

  it('under reduced motion disappears and reappears without moving', () => {
    const parked = initPet(0, 100, true)
    const gone = petReducer(parked, { type: 'leave', now: 1, width: W, off: OFF })
    expect(gone.mode).toBe('gone')
    expect(petReducer(gone, { type: 'return', now: 2, width: W, off: OFF, target: 300 })).toMatchObject({ mode: 'parked', x: 300 })
    expect(initPet(0, 100, true, true).mode).toBe('gone')
  })

  it('a return with nothing to return from changes nothing', () => {
    const s = initPet(0, 100, false)
    expect(petReducer(s, { type: 'return', now: 1, width: W, off: OFF, target: 300 })).toBe(s)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/lib/pet/pet-brain.test.ts`
Expected: FAIL on every case in the new `describe`.

- [ ] **Step 3: Implement**

In `src/lib/pet/pet-brain.ts`:

Add `'gone'` to the `Mode` union, and `leaving: boolean` and `still: boolean` to `PetState`.

Add to the `PetEvent` union:

```ts
  | { type: 'leave'; now: number; width: number; off: number }
  | { type: 'return'; now: number; width: number; off: number; target: number }
```

Replace `stoatSpot` and `initPet`:

```ts
export const stoatSpot = (m: Mode, claimed: boolean) => (claimed || m === 'gone' ? null : m === 'desk_nap' ? 'desk' : 'floor')

export const initPet = (now: number, x: number, reduced: boolean, away = false): PetState => ({
  mode: away ? 'gone' : reduced ? 'parked' : 'idle',
  x,
  dir: -1,
  target: null,
  lastInput: now,
  lastNear: -Infinity,
  zoomLeg: 0,
  home: x,
  napAtDesk: false,
  returnTo: null,
  leaving: false,
  still: reduced,
})
```

Add above `petReducer`:

```ts
const offEdge = (toward: number, width: number, off: number) => (toward < width / 2 ? -off : width + off)

function leave(s: PetState, e: Extract<PetEvent, { type: 'leave' }>): PetState {
  if (s.mode === 'gone' || s.leaving) return s
  if (s.still) return { ...s, mode: 'gone', target: null, returnTo: null }
  return { ...moveTo(s, offEdge(s.x, e.width, e.off), e.now), mode: 'run', leaving: true }
}

function comeBack(s: PetState, e: Extract<PetEvent, { type: 'return' }>): PetState {
  if (s.mode !== 'gone' && !s.leaving) return s
  const target = Math.max(0, Math.min(e.width, e.target))
  if (s.still) return { ...s, mode: 'parked', x: target, target: null }
  const x = s.leaving ? s.x : offEdge(target, e.width, e.off)
  return moveTo({ ...s, x, leaving: false }, target, e.now)
}
```

At the top of `petReducer`, replace the first line with:

```ts
  if (e.type === 'leave') return leave(s, e)
  if (e.type === 'return') return comeBack(s, e)
  if (s.mode === 'gone') return s
  // the tick clamp would pull a leaving stoat back on screen
  if (s.leaving && e.type !== 'step') return s
  if (s.mode === 'parked' && e.type !== 'tick') return s
```

In `case 'step'`, directly after `if (x !== s.target) return { ...s, x }`, add:

```ts
      if (s.leaving) return { ...s, x, mode: 'gone', target: null, leaving: false }
```

- [ ] **Step 4: Run the whole pet suite**

Run: `pnpm vitest run src/lib/pet`
Expected: PASS, including the existing pet-brain tests (the new state fields are additive).

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit -p .`
Expected: no errors. Task 1's `stoatOnRoute` now typechecks too.

- [ ] **Step 6: Commit**

```bash
git add src/lib/pet/pet-brain.ts src/lib/pet/pet-brain.test.ts
git commit -s -m "Let the stoat leave the page and come back"
```

---

### Task 4: Art batch 1, the thinking persona

Dispatch a Sonnet art agent. Runs in parallel with Tasks 1 to 3; the code falls back to the `idle` clip until these clips exist (`resolveClip` in `src/lib/pet/sprite.ts`).

**Files:**
- Create: `tools/sprites/me/personas.py`
- Modify: `tools/sprites/me/build.py`
- Regenerated: `tools/sprites/me/me.json`, `tools/sprites/me/preview.html`, `tools/sprites/me/contact-sheet.png`

**Interfaces:**
- Produces in `personas.py`: `THINK_W`, `THINK_H`, `PROPS` (a dict of any new palette letters, merged into the sprite's props), and `think(L)`, `think_q(L)`, each returning `[(rows, ms)]` for a layer tuple `L`, the same shape as the functions in `transitions.py`.
- Produces in `me.json`: clips `think` (loop) and `think_q` (one-shot), each with `w: THINK_W`, `h: THINK_H`.

- [ ] **Step 1: Brief the artist**

Prompt (Sonnet): "You're a pixel artist. Read `tools/sprites/BRIEF.md` (its rules apply to pixel-me too), then the approved pixel-me art in `tools/sprites/me/` (`desk.py`, `walk.py`, `transitions.py`, and `contact-sheet.png`). Draw two clips in a new `tools/sprites/me/personas.py`:
- `think`: a loop. Pixel-me sits on the floor, knees up, chin in hand, thinking. Beats: a blink, a hair tuck behind the ear, a slow shift of the chin. Mostly holds; this is calm.
- `think_q`: a one-shot that starts and ends on `think` frame 0. A small '?' bubble pops above his head, holds, and fades.
Canvas `THINK_W` x `THINK_H`, your choice, at most 57 tall, feet on the bottom row. Same look as the desk clips: long black hair behind the back, beard, light skin, sweater. Put any new palette letters in a `PROPS` dict in `personas.py`. Key ms at 40 to 60 per motion frame with longer holds; `build.py` plays the `think` loop at 1.75x and `think_q` at 1x. Register both clips in `build.py` (see the step below), run `cd tools/sprites/me && python3 build.py`, and LOOK at the contact sheet and `preview.html` after every pass. Do not run `tools/sprites/export.py`."

- [ ] **Step 2: Register the clips in `build.py`** (the artist does this; the code is given so it matches the site's expectations)

```python
import front, walk, desk, transitions, personas

TEMPO = 1.75  # slow loops play faster, the same rule as the stoat's resting clips
```

In `build()`:

```python
    ps = {n: frames(lambda L, n=n: [(r, ms, {}) for r, ms in getattr(personas, n)(L)])
          for n in ('think', 'think_q')}
    for f in ps['think']:
        f['ms'] = int(f['ms'] / TEMPO + 0.5)
    assert ps['think_q'][0]['px'] == ps['think'][0]['px'], 'think_q must start on think frame 0'
    assert ps['think_q'][-1]['px'] == ps['think'][0]['px'], 'think_q must end on think frame 0'
    think_box = {'w': personas.THINK_W, 'h': personas.THINK_H}
```

Change `'props': desk.PROPS,` to `'props': {**desk.PROPS, **personas.PROPS},`, and add to `'animations'`:

```python
            'think': {'loop': True, **think_box, 'frames': ps['think']},
            'think_q': {'loop': False, **think_box, 'frames': ps['think_q']},
```

In `contact_sheet`, add `'think': 8, 'think_q': 8` to `per_row`, and change `palette(o, skin, desk.PROPS)` to `palette(o, skin, {**desk.PROPS, **personas.PROPS})`.

- [ ] **Step 3: Client gate**

The lead opens `tools/sprites/me/preview.html` in Chromium and shows both clips playing to the client. Redraw until the client approves. Then:

```bash
cd tools/sprites/me && python3 build.py && cd .. && python3 export.py
pnpm vitest run src/lib/pet/sprite.test.ts
```
Expected: the sprite tests pass (`validateSprite` checks frame sizes and palette letters for every clip, including the new ones).

- [ ] **Step 4: Commit**

```bash
git add tools/sprites/me src/assets/sprites/me.json
git commit -s -m "Draw pixel-me thinking"
```

---

### Task 5: Art batch 2, the scientist

Same agent setup as Task 4, after batch 1 is approved so the artist can reuse its setup.

**Files:**
- Modify: `tools/sprites/me/personas.py`, `tools/sprites/me/build.py`
- Regenerated: as in Task 4

**Interfaces:**
- Produces in `personas.py`: `LAB_W`, `LAB_H`, `lab(L)`, `lab_squint(L)`, plus any new letters in `PROPS`.
- Produces in `me.json`: clips `lab` (loop) and `lab_squint` (one-shot), each `w: LAB_W`, `h: LAB_H`.

- [ ] **Step 1: Brief the artist**

Prompt (Sonnet): "You're a pixel artist. Same rules and files as the thinking batch (read `tools/sprites/BRIEF.md` and `tools/sprites/me/personas.py`). Add to `personas.py`:
- `lab`: a loop. Pixel-me stands in a white lab coat over the sweater, goggles pushed up on his forehead, holding a clipboard. Beats: writing on the clipboard, tapping the pen.
- `lab_squint`: a one-shot starting and ending on `lab` frame 0. He holds the clipboard up, squints at it, pulls the goggles down, then pushes them back up.
Canvas `LAB_W` x `LAB_H`, at most 57 tall, feet on the bottom row. Keep the hair, beard and skin. New letters (coat white and shade, goggle lens, clipboard) go in `PROPS`. Register as below, build, LOOK after every pass. Do not run `export.py`."

- [ ] **Step 2: Register in `build.py`**

Extend the `ps` tuple to `('think', 'think_q', 'lab', 'lab_squint')`, apply the tempo loop to `ps['lab']` as well as `ps['think']`, and add:

```python
    assert ps['lab_squint'][0]['px'] == ps['lab'][0]['px'], 'lab_squint must start on lab frame 0'
    assert ps['lab_squint'][-1]['px'] == ps['lab'][0]['px'], 'lab_squint must end on lab frame 0'
    lab_box = {'w': personas.LAB_W, 'h': personas.LAB_H}
```

```python
            'lab': {'loop': True, **lab_box, 'frames': ps['lab']},
            'lab_squint': {'loop': False, **lab_box, 'frames': ps['lab_squint']},
```

and `'lab': 8, 'lab_squint': 8` in `per_row`.

- [ ] **Step 3: Client gate**

As in Task 4: play in Chromium, redraw until approved, then `python3 build.py`, `python3 ../export.py`, `pnpm vitest run src/lib/pet/sprite.test.ts`.

- [ ] **Step 4: Commit**

```bash
git add tools/sprites/me src/assets/sprites/me.json
git commit -s -m "Draw pixel-me as a scientist"
```

---

### Task 6: Corner placement

**Files:**
- Create: `src/lib/pet/corners.ts`
- Create: `src/lib/pet/corners.test.ts`

**Interfaces:**
- Consumes: `Persona` from `src/lib/pet/persona.ts`.
- Produces:
  - `type Side = 'left' | 'right'`, `type CornerMode = 'swap' | 'lift'`, `CORNER_MODE: CornerMode`
  - `deskSide(p: Persona): Side`
  - `pawSide(p: Persona, mode?: CornerMode): Side`
  - `panelSide(p: Persona, friendsOn: boolean, mode?: CornerMode): Side`
  - `a11yCorner(p: Persona, friendsOn: boolean, mode?: CornerMode): { side: Side; lifted: boolean }`
  - `DESK_LIFT_PX = { wide: 138, narrow: 81 }`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/pet/corners.test.ts
import { describe, expect, it } from 'vitest'
import meJson from '../../assets/sprites/me.json'
import { a11yCorner, DESK_LIFT_PX, deskSide, panelSide, pawSide } from './corners'

describe('corners', () => {
  it('puts the desk on the right only on desk-right routes', () => {
    expect(deskSide('desk')).toBe('left')
    expect(deskSide('thinking')).toBe('left')
    expect(deskSide('scientist')).toBe('left')
    expect(deskSide('desk-right')).toBe('right')
  })

  it('swap: the accessibility button and paw trade corners on desk-right', () => {
    expect(a11yCorner('desk-right', true, 'swap')).toEqual({ side: 'left', lifted: false })
    expect(a11yCorner('desk-right', false, 'swap')).toEqual({ side: 'left', lifted: false })
    expect(pawSide('desk-right', 'swap')).toBe('right')
    expect(panelSide('desk-right', true, 'swap')).toBe('right')
    expect(panelSide('desk-right', false, 'swap')).toBe('right')
  })

  it('lift: the button rises above the desk only while the desk is there', () => {
    expect(a11yCorner('desk-right', true, 'lift')).toEqual({ side: 'right', lifted: true })
    expect(a11yCorner('desk-right', false, 'lift')).toEqual({ side: 'right', lifted: false })
    expect(pawSide('desk-right', 'lift')).toBe('left')
    expect(panelSide('desk-right', true, 'lift')).toBe('right')
    expect(panelSide('desk-right', false, 'lift')).toBe('left')
  })

  it('every other persona keeps the phase 1 corners in both modes', () => {
    for (const mode of ['swap', 'lift'] as const) {
      for (const p of ['desk', 'thinking', 'scientist'] as const) {
        expect(a11yCorner(p, true, mode)).toEqual({ side: 'right', lifted: false })
        expect(pawSide(p, mode)).toBe('left')
        expect(panelSide(p, true, mode)).toBe('left')
      }
    }
  })

  it('lifts by the desk height plus the 24 px gap at both desk scales', () => {
    const h = meJson.animations.desk.h
    expect(DESK_LIFT_PX).toEqual({ wide: h * 2 + 24, narrow: h + 24 })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/lib/pet/corners.test.ts`
Expected: FAIL, cannot resolve `./corners`.

- [ ] **Step 3: Implement**

```ts
// src/lib/pet/corners.ts
import type { Persona } from './persona'

export type Side = 'left' | 'right'
export type CornerMode = 'swap' | 'lift'

// Both /portfolio options ship until the client picks one at the browser check;
// the other branch is deleted then.
export const CORNER_MODE: CornerMode = 'swap'

// Tailwind needs literal class names, so components hard-code these heights;
// the test ties them to the desk clip.
export const DESK_LIFT_PX = { wide: 138, narrow: 81 }

export const deskSide = (p: Persona): Side => (p === 'desk-right' ? 'right' : 'left')

export const pawSide = (p: Persona, mode = CORNER_MODE): Side => (p === 'desk-right' && mode === 'swap' ? 'right' : 'left')

export const panelSide = (p: Persona, friendsOn: boolean, mode = CORNER_MODE): Side => (friendsOn ? deskSide(p) : pawSide(p, mode))

export function a11yCorner(p: Persona, friendsOn: boolean, mode = CORNER_MODE): { side: Side; lifted: boolean } {
  if (p !== 'desk-right') return { side: 'right', lifted: false }
  if (mode === 'swap') return { side: 'left', lifted: false }
  return { side: 'right', lifted: friendsOn }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/lib/pet/corners.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/corners.ts src/lib/pet/corners.test.ts
git commit -s -m "Work out which corner each pixel friends control sits in"
```

---

### Task 7: The mirrored desk

**Files:**
- Modify: `src/components/pet/desk-corner.tsx`
- Test: `src/components/pet/desk-corner.test.ts` (created by the leftovers branch; extend it)

**Interfaces:**
- Consumes: `Side` from `src/lib/pet/corners.ts`.
- Produces:
  - `deskX(side: Side, x: number, w: number, scale: number, vw: number): number`, the screen-left px of a span drawn at desk-pixel `x` with width `w`.
  - `hitTop(sprite: Sprite, clip: string, cap?: number): number` (cap defaults to `CLEAR_ROWS`).
  - `DeskCorner` gains a `side: Side` prop.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/pet/desk-corner.test.ts` (import `deskX` and `DESK_LEFT` alongside `hitTop`):

```ts
describe('deskX', () => {
  it('measures from the left edge for a left desk', () => {
    expect(deskX('left', 10, 32, 2, 1000)).toBe(DESK_LEFT + 20)
  })

  it('mirrors from the right edge for a right desk', () => {
    // the span's right edge sits x desk pixels in from the desk's right edge
    expect(deskX('right', 10, 32, 2, 1000)).toBe(1000 - DESK_LEFT - (10 + 32) * 2)
    expect(deskX('right', 0, 99, 1, 400) + 99).toBe(400 - DESK_LEFT)
  })
})

describe('hitTop cap', () => {
  it('can search the whole clip when no cap applies', () => {
    expect(hitTop(ME, 'desk', Infinity)).toBeLessThanOrEqual(hitTop(ME, 'desk'))
  })
})
```

(`ME` is whatever name the existing test gives the imported `me.json`; reuse it.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/components/pet/desk-corner.test.ts`
Expected: FAIL, `deskX` is not exported.

- [ ] **Step 3: Implement**

In `src/components/pet/desk-corner.tsx`:

Add `import type { Side } from '../../lib/pet/corners'`.

Give `hitTop` a cap parameter:

```ts
export const hitTop = (sprite: Sprite, clip: string, cap = CLEAR_ROWS) =>
  sprite.animations[clip].frames.reduce((top, f) => {
    const y = f.px.findIndex((r) => /[^.]/.test(r))
    return y >= 0 ? Math.min(top, y) : top
  }, cap)
```

Add below `hitTop`:

```ts
export const deskX = (side: Side, x: number, w: number, scale: number, vw: number) =>
  side === 'left' ? DESK_LEFT + x * scale : vw - DESK_LEFT - (x + w) * scale
```

Add `side: Side` to `Props` and to the destructured parameters. Then change:

- the button's `style` from `{ left: DESK_LEFT, ... }` to `{ [side]: DESK_LEFT, width: DW * scale, height: DH * scale }`
- the inner `aria-hidden` span's `style` to add `transform: side === 'right' ? 'scaleX(-1)' : undefined` (this flips the desk, the net and a napping stoat together)
- the hover hint's `left-2` to `${side === 'left' ? 'left-2' : 'right-2'}` inside a template literal
- the walker `div`'s `left` to `deskX(side, state.x, me.w, scale, window.innerWidth)`
- the walker's `flip` to `side === 'left' ? state.dir === -1 : state.dir === 1`, and update its comment to: `// me's walk faces right; a right-corner desk walks away to the left`

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/components/pet`
Expected: PASS. `tsc` fails in `friends-layer.tsx` until Task 9 passes `side`; that is expected.

- [ ] **Step 5: Commit**

```bash
git add src/components/pet/desk-corner.tsx src/components/pet/desk-corner.test.ts
git commit -s -m "Let the desk sit in either bottom corner"
```

---

### Task 8: The persona corner

**Files:**
- Create: `src/components/pet/persona-corner.tsx`
- Create: `src/components/pet/persona-corner.test.tsx`

**Interfaces:**
- Consumes: `hitTop`, `DESK_LEFT` from `desk-corner.tsx`; `resolveClip`, `clipSize`, `Sprite` from `src/lib/pet/sprite.ts`; `PixelSprite`; `usePetPanelOpen` from `src/lib/pet/panel-store.ts`.
- Produces: `PersonaCorner({ me, loop, beat, scale, reduced, onOpen })` and `BEAT_CHANCE = 0.2`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/pet/persona-corner.test.tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import meJson from '../../assets/sprites/me.json'
import type { Sprite } from '../../lib/pet/sprite'
import { PersonaCorner } from './persona-corner'

const ME = meJson as unknown as Sprite

describe('PersonaCorner', () => {
  it('renders a labelled settings button even before its clips are drawn', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <PersonaCorner me={ME} loop="no_such_clip" beat="also_missing" scale={2} reduced onOpen={() => {}} />
      </I18nextProvider>,
    )
    expect(html).toContain('aria-label="Pixel friends settings"')
    expect(html).toContain('aria-haspopup="dialog"')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/pet/persona-corner.test.tsx`
Expected: FAIL, cannot resolve `./persona-corner`.

- [ ] **Step 3: Implement**

```tsx
// src/components/pet/persona-corner.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePetPanelOpen } from '../../lib/pet/panel-store'
import { clipSize, resolveClip, type Sprite } from '../../lib/pet/sprite'
import { DESK_LEFT, hitTop } from './desk-corner'
import { PixelSprite } from './pixel-sprite'

export const BEAT_CHANCE = 0.2

type Props = { me: Sprite; loop: string; beat: string; scale: number; reduced: boolean; onOpen: () => void }

export function PersonaCorner({ me, loop, beat, scale, reduced, onOpen }: Props) {
  const { t } = useTranslation()
  const open = usePetPanelOpen()
  const [clip, setClip] = useState(loop)
  useEffect(() => setClip(loop), [loop])
  const shown = resolveClip(me, clip)
  const base = resolveClip(me, loop)
  const { w, h } = clipSize(me, base.clip)
  const top = hitTop(me, base.name, h)
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('pet.settings')}
      aria-haspopup="dialog"
      aria-expanded={open}
      className="group pointer-events-none fixed bottom-0 z-30 block leading-none focus-visible:outline-2 focus-visible:outline-gold"
      style={{ left: DESK_LEFT, width: w * scale, height: h * scale }}
    >
      <span aria-hidden="true" className="pointer-events-none relative block" style={{ width: w * scale, height: h * scale }}>
        <PixelSprite
          sprite={me}
          clip={shown.name}
          scale={scale}
          playing={!reduced}
          frame={reduced ? 0 : undefined}
          onStep={(_, f) => {
            // beats start and end on the loop's frame 0, so they can only cut in there
            if (clip === loop && f === base.clip.frames[0] && Math.random() < BEAT_CHANCE) setClip(beat)
          }}
          onEnd={() => setClip(loop)}
        />
      </span>
      <span className="absolute left-0 cursor-pointer" style={{ top: top * scale, width: w * scale, height: (h - top) * scale, pointerEvents: 'auto' }} />
      <span className="pointer-events-none absolute bottom-full left-2 mb-1 whitespace-nowrap rounded border border-charcoal/20 bg-bone px-2 py-0.5 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-bone/20 dark:bg-charcoal">
        {t('pet.settings')}
      </span>
    </button>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/pet/persona-corner.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/pet/persona-corner.tsx src/components/pet/persona-corner.test.tsx
git commit -s -m "Add the corner for pixel-me's standalone personas"
```

---

### Task 9: Wire personas into the friends layer

**Files:**
- Modify: `src/components/pet/friends-layer.tsx`

**Interfaces:**
- Consumes: `usePersona`, `atDesk`, `PERSONA_CLIPS`, `stoatOnRoute`, `type Persona` (Task 1); `meReducer` `reset` (Task 2); `initPet(..., away)`, `stoatSpot` (Task 3); `deskSide` (Task 6); `deskX`, `DeskCorner` `side` prop (Task 7); `PersonaCorner` (Task 8).

- [ ] **Step 1: Implement**

In `src/components/pet/friends-layer.tsx`:

Add imports:

```ts
import { deskSide } from '../../lib/pet/corners'
import { atDesk, PERSONA_CLIPS, stoatOnRoute, usePersona } from '../../lib/pet/persona'
import { DeskCorner, DESK_LEFT, deskX } from './desk-corner'
import { PersonaCorner } from './persona-corner'
```

(`DESK_LEFT` stays imported; `meRoom` still uses it.)

At the top of `Friends`, before the `useReducer` calls:

```ts
  const persona = usePersona()
  const side = deskSide(persona)
  const desked = atDesk(persona)
```

Change the pet initialiser so a first visit to a thinking post starts without a stoat:

```ts
  const [pet, petDispatch] = useReducer(petReducer, null, () => initPet(performance.now(), Math.max(0, stoatRoom() - 40), reduced, persona === 'thinking'))
```

Extend `latest`:

```ts
  const latest = useRef({ pet, deskScale, side, desked })
  latest.current = { pet, deskScale, side, desked }
```

Replace `deskStoatX` so it follows the desk's corner and returns `null` when there is no desk to nap on:

```ts
  const deskStoatX = () => {
    const { side, desked, deskScale } = latest.current
    if (!desked) return null
    const [sx, , sw] = ME.animations.desk.stoatSlot!
    return Math.floor(deskX(side, sx, sw, deskScale, window.innerWidth) / STOAT_SCALE)
  }
```

In the interval, only tick pixel-me's walk brain at a desk:

```ts
      if (latest.current.desked) meDispatch({ type: 'tick', now: performance.now(), width: meRoom(), roll: Math.random() })
```

Replace the `[pathname]` effect:

```ts
  const was = useRef(persona)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const prev = was.current
    was.current = persona
    if (prev !== persona) meDispatch({ type: 'reset', now: performance.now(), roll: Math.random() })
    const target = Math.floor(Math.random() * stoatRoom())
    for (const e of stoatOnRoute(prev, persona, latest.current.pet.mode, stoatRoom(), STOAT.w, target)) petNow(e)
  }, [pathname])
```

In the follow effect, mirror the target with the desk:

```ts
    petNow({ type: 'follow', target: Math.floor(deskX(side, me.target, ME.w, deskScale, window.innerWidth) / STOAT_SCALE), roll: Math.random() })
```

Replace the returned JSX:

```tsx
  const spot = stoatSpot(pet.mode, claimed)
  return (
    <>
      {desked ? (
        <DeskCorner me={ME} stoat={STOAT} scale={deskScale} side={side} state={me} send={meDispatch} reduced={reduced} napping={spot === 'desk'} coat={coat} onOpen={openPetPanel} />
      ) : (
        <PersonaCorner me={ME} {...PERSONA_CLIPS[persona as keyof typeof PERSONA_CLIPS]} scale={deskScale} reduced={reduced} onOpen={openPetPanel} />
      )}
      {spot === 'floor' && <StoatRoamer sprite={STOAT} state={pet} send={petNow} coat={coat} scale={STOAT_SCALE} />}
    </>
  )
```

- [ ] **Step 2: Typecheck and test**

Run: `pnpm exec tsc --noEmit -p . && pnpm test`
Expected: both pass, including the existing `friends-layer.test.tsx` (the layer still renders nothing on the server).

- [ ] **Step 3: Commit**

```bash
git add src/components/pet/friends-layer.tsx
git commit -s -m "Switch pixel-me's persona and the stoat by route"
```

---

### Task 10: Controls follow the corners

**Files:**
- Modify: `src/components/accessibility-panel.tsx:79` and `:87`
- Modify: `src/components/pet/pet-panel.tsx:32` and `:43`

**Interfaces:**
- Consumes: `usePersona` (Task 1); `a11yCorner`, `pawSide`, `panelSide` (Task 6); `usePetPrefs` from `src/lib/pet/prefs-store.ts`.

- [ ] **Step 1: Accessibility button and panel**

In `src/components/accessibility-panel.tsx`, import `usePersona`, `a11yCorner` and `usePetPrefs`, and in the component body add:

```ts
  const [petPrefs] = usePetPrefs()
  const corner = a11yCorner(usePersona(), petPrefs.on)
  const x = corner.side === 'left' ? 'left-6' : 'right-6'
  // DESK_LIFT_PX in corners.ts: the desk is 2x above 640 px and 1x below
  const lift = corner.lifted ? 'bottom-[138px] max-sm:bottom-[81px]' : 'bottom-6'
  const panelLift = corner.lifted ? 'bottom-[194px] max-sm:bottom-[137px]' : 'bottom-20'
```

Change the button's class string from `fixed bottom-6 right-6 z-50 ...` to a template literal starting `` `fixed ${lift} ${x} z-50 ...` `` with the rest unchanged, and the panel's from `fixed bottom-20 right-6 z-50 ...` to `` `fixed ${panelLift} ${x} z-50 ...` ``.

If the prerendered HTML differs from the first client render on `/portfolio` (the server cannot read `pet-prefs` from localStorage), the button jumps once on load. Note it for the browser check; it only affects `lift` mode.

- [ ] **Step 2: Paw button and pet panel**

In `src/components/pet/pet-panel.tsx`, import `usePersona`, `pawSide` and `panelSide`, and add after `usePetPrefs`:

```ts
  const persona = usePersona()
  const paw = pawSide(persona) === 'left' ? 'left-6' : 'right-6'
  const panel = panelSide(persona, prefs.on) === 'left' ? 'left-4' : 'right-4'
```

Change the paw button's `fixed bottom-6 left-6 z-50 ...` to `` `fixed bottom-6 ${paw} z-50 ...` `` and the dialog's `fixed bottom-32 left-4 z-50 ...` to `` `fixed bottom-32 ${panel} z-50 ...` ``.

`PetPanel` is rendered inside the router in `App.tsx`; confirm that, since `usePersona` calls `useLocation`.

- [ ] **Step 3: Test and build**

Run: `pnpm test && pnpm run build`
Expected: both pass. The existing SSR tests for `PetPanel` wrap it only in `I18nextProvider`; if `useLocation` now throws there, wrap the render in `<MemoryRouter>` as `friends-layer.test.tsx` does.

- [ ] **Step 4: Commit**

```bash
git add src/components/accessibility-panel.tsx src/components/pet/pet-panel.tsx src/components/pet/pet-panel.test.tsx
git commit -s -m "Move the accessibility and paw buttons with the desk"
```

---

### Task 11: No sign-off stoat on thinking posts

**Files:**
- Modify: `src/components/post-signoff.tsx:205-209`

- [ ] **Step 1: Implement**

Import `usePersona` from `../lib/pet/persona`. At the top of `PostSignoff`:

```ts
  const thinking = usePersona() === 'thinking'
```

and change `<StagePet clip="happy" scale={2} />` to `{!thinking && <StagePet clip="happy" scale={2} />}`.

- [ ] **Step 2: Test and build**

Run: `pnpm test && pnpm run build`
Expected: both pass. If a test renders `PostSignoff` without a router, wrap it in `<MemoryRouter>`.

- [ ] **Step 3: Commit**

```bash
git add src/components/post-signoff.tsx
git commit -s -m "Keep the stoat off the end of thinking posts"
```

---

### Task 12: Browser check, the /portfolio pick, and review

Executed by the lead with the client.

- [ ] **Step 1: Mark a post for the check**

Add `pixel: thinking` to one post's frontmatter on the branch (ask the client which; a bespoke-page post such as `plan-a-ai` is a good test because it has its own effects).

- [ ] **Step 2: Browser check in Chromium at 1440 and 390 px**

Show the client, playing: the thinking post (no stoat, think loop, the "?" beat), arriving at it from another page (the stoat bounds off) and leaving it (the stoat bounds back), `/research` (scientist loop and squint), `/portfolio` (mirrored desk, the walk going left, the laptop text), reduced motion on each, and the settings panel opening from each persona. Check there is no horizontal scrollbar while the stoat leaves to the right.

Then switch `CORNER_MODE` to `'lift'` and show `/portfolio` again, with pixel friends on and off. The client picks.

- [ ] **Step 3: Delete the losing option**

Remove the `CornerMode` type, `CORNER_MODE`, the `mode` parameters, the losing branch in `a11yCorner`/`pawSide`, its tests, and (if `swap` wins) `DESK_LIFT_PX`, its test and the `lift`/`panelLift` classes. If the mirrored laptop text read wrong, dispatch a Sonnet art agent to redraw only the laptop screen frames for a `desk` variant used when `side === 'right'`, with its own client gate.

- [ ] **Step 4: Final review and merge**

Dispatch a Sonnet reviewer over the whole branch against the spec. Fix findings, run `pnpm test && pnpm run build`, then merge to main with `git merge --no-ff` and push after the client says so.
