# Pixel Friends Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The stoat becomes the site's only resident pet, and pixel-me works at a fixed bottom-left corner desk on every page, getting up now and then for a short walk. Clicking pixel-me opens the settings.

**Architecture:** The engine from the first pixel-pets plan stays: `PixelSprite`, the shared ticker, stage claims, prefs storage, the neural net. The cat's reducer becomes a generic pet reducer driving the stoat. A new pure reducer drives pixel-me's desk/walk cycle. One `FriendsLayer` component owns both reducers and renders the corner desk and the roaming stoat outside `.page-enter`. Art (Tasks 1 to 3) is drawn by Opus artist agents and gated on the client watching it play in Chromium. Code tasks fall back gracefully on clips not drawn yet, so art and code can land in any order.

**Tech Stack:** React 19, TypeScript, Vite 7, vitest 4 (node environment, no DOM; components are tested with `renderToStaticMarkup`), react-i18next, Tailwind 4, Python 3 + Pillow for sprite generators.

**Spec:** `docs/superpowers/specs/2026-10-04-pixel-friends-phase1-design.md`

## Global Constraints

- The stoat sprite is 32x20 with palettes `summer` and `winter`; the coat follows the season (winter November through March). No coat setting.
- Every stoat clip faces RIGHT, like `bound`. The site mirrors a clip when the stoat travels left.
- Pixel-me ships baked to outfit `sweater`, skin `light`. Me's `walk` faces right.
- Stoat shows at 2x. The desk shows at 2x, and 1x when the viewport is narrower than 640 px.
- New art: true hand-drawn in-betweens at 40 to 60 ms per motion frame (holds may be longer). No interpolated midpoints left as seeded. The client accepts each clip only after watching it play in a Chromium window.
- The pet layer mounts outside `.page-enter` (its transform breaks `position: fixed` inside it), beside `<AccessibilityPanel />` in `App.tsx`.
- Reduced motion = `prefersReducedMotion()` from `src/lib/motion.ts`.
- Settings persist in `localStorage` key `pet-prefs`, read and written inside try/catch. Shape `{ on: boolean }`; a saved `cat: false` from the old shape reads as off.
- UI strings go through react-i18next in all six locales. After changing English keys run `node --env-file=.env scripts/translate-ui.mjs`; the pre-commit hook runs `vitest run` and `translate-ui.mjs --check`.
- Sprites are decorative: `aria-hidden`, not focusable. The desk's settings button is the one focusable piece.
- The pet layer renders nothing on the server, so prerendered HTML does not change because of it.
- Commits use `git commit -s`, no `Co-Authored-By` line, no em-dashes in messages. Stage files by name; never `git add -A`.

## Review Focus

1. **A clip the code asks for is not drawn yet** (code tasks land before Tasks 1 to 3). Expected: the sprite plays `idle`, or its first clip when it has no `idle` (the stoat has none); one-shots end at once; nothing crashes. Pinned in Task 4.
2. **A 390 px viewport.** Expected: the desk drops to 1x, the stoat's room stays non-negative, and pixel-me's walk target stays inside the viewport. Pinned in Task 5 (clamp) and Task 6 (walk target clamp).
3. **A fixed-place stoat is on screen while the roaming stoat naps on the desk.** Expected: no stoat on the desk and none on the floor; never two stoats. Pinned in Task 5 (`stoatSpot`).
4. **Saved prefs from the cat era, garbage JSON, or storage that throws.** Expected: `{cat:false}` reads as off; garbage and throwing storage read as on; nothing throws. Pinned in Task 4.
5. **The pointer rests next to the stoat.** Expected: it periscopes toward the pointer at most once per 8 s, not in a constant loop. Pinned in Task 5.

---

## File Structure

| Path | Responsibility |
|---|---|
| `tools/sprites/stoat/` | Stoat generator; new clip modules in Tasks 1 and 2 |
| `tools/sprites/me/` | Pixel-me generator; new desk transitions in Task 3 |
| `tools/sprites/BRIEF.md` | Art brief, rewritten for the stoat and pixel-me in Task 1 |
| `src/lib/pet/sprite.ts` | `resolveClip` falls back to the first clip; `Clip.standAt` |
| `src/lib/pet/season.ts` | `isWinter`, `stoatCoat` |
| `src/lib/pet/prefs.ts`, `prefs-store.ts` | `{ on: boolean }` prefs |
| `src/lib/pet/pet-brain.ts` | Generic pet reducer (replaces `cat-brain.ts`) |
| `src/lib/pet/me-brain.ts` | Pixel-me desk/walk reducer |
| `src/lib/pet/panel-store.ts` | Open/close state shared by the desk and the panel |
| `src/components/pet/pet-panel.tsx` | One switch; paw button only when off |
| `src/components/pet/friends-layer.tsx` | Owns both reducers, events, mounts desk and stoat |
| `src/components/pet/desk-corner.tsx` | Fixed desk, neural net, napping stoat, walking pixel-me |
| `src/components/pet/stoat-roamer.tsx` | The floor stoat sprite |
| `src/components/pet/stage-pet.tsx` | Fixed-place stoat for 404, loader, sign-off (replaces `stage-cat.tsx`) |

---

### Task 1: Stoat art, resting set

**Files:**
- Modify: `tools/sprites/BRIEF.md`
- Create/modify: `tools/sprites/stoat/*.py`, `tools/sprites/stoat/stoat.json`, `tools/sprites/stoat/sheets/*.png`, `tools/sprites/stoat/preview.html`
- Modify: `src/assets/sprites/stoat.json` (via `python3 tools/sprites/export.py`), `src/lib/pet/sprite.test.ts`

**Interfaces:**
- Produces: stoat clips `sit` (loop), `sit_down` (one-shot), `groom` (loop), `curl` (loop), `sleep` (loop), `wake` (one-shot) in `stoat.json`; effect letters `Z` (sleep z's), `Q` ("?"), `R` (heart) in the base palette and both coat palettes.

- [ ] **Step 1: Rewrite the brief's character section.** In `tools/sprites/BRIEF.md`, replace the "The character" section and the cat-specific rules with: the stoat in `tools/sprites/stoat/` (approved clips `bound`, `periscope`, `peek`; look at `sheets/*.png` first), 32x20 canvas, palettes `summer`/`winter` as swaps of one drawing, every clip faces right like `bound`, feet on the bottom row, hand-keyed legs (no rig), true in-betweens at 40 to 60 ms per motion frame, and output as new modules inside the stoat generator writing `tools/sprites/stoat/stoat.json`. Keep the "You're a pixel artist" opening and the self-check section. Add: "Build a self-contained `tools/sprites/stoat/preview.html` that loops every stoat clip in both coats at 6x on `#f5f1ea`, with a speed control (0.5x, 1x, 2x) and a strip where `bound` travels across the page."

- [ ] **Step 2: Dispatch the art agent** (Opus) with `BRIEF.md` and this list. One-shots start and end on `sit` frame 0 unless noted.
  - `sit`: loop, upright sit, breathing, a tail flick, one blink, 16 to 24 frames.
  - `sit_down`: one-shot, from `bound`'s landing pose to `sit` frame 0.
  - `groom`: loop, washes face and a forepaw, 16 to 24 frames.
  - `curl`: loop, curled loaf with breathing and a slow blink.
  - `sleep`: loop, curled tight, eyes shut, rising `Z` letters, breathing.
  - `wake`: one-shot, `sleep` frame 0 to a stretch to `sit` frame 0.
  - Add `Z`, `Q`, `R` to the base palette and both coats (`Z` a soft blue-grey, `Q` gold, `R` pink).

- [ ] **Step 3: Client review gate.** Open `tools/sprites/stoat/preview.html` with `setsid chromium --new-window file://<abs path> &`. Accept each clip only on the client's approval; send rejected clips back to the same agent with the client's words.

- [ ] **Step 4: Export and test.** Update the expected list in `sprite.test.ts`'s `ships the stoat clips in both coats` test to the sorted clip names now in `stoat.json`, then run:

```bash
python3 tools/sprites/export.py && npx vitest run src/lib/pet/sprite.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tools/sprites/BRIEF.md tools/sprites/stoat src/assets/sprites/stoat.json src/lib/pet/sprite.test.ts
git commit -s -m "Draw the stoat's resting clips

Sit, sit down, groom, curl, sleep and wake, hand keyed with in-betweens
and approved playing in the browser."
```

---

### Task 2: Stoat art, reactions and moments

**Files:** as Task 1.

**Interfaces:**
- Produces: stoat clips `startle`, `pounce` (one-shots), `chase_tail`, `confused`, `happy` (loops).

- [ ] **Step 1: Dispatch the art agent** (Opus, same brief) with:
  - `startle`: one-shot, quick hop back with fur puffed, 8 to 14 frames.
  - `pounce`: one-shot, wiggle, hop forward, land, back to `sit` frame 0 at the same footprint (the site does not move the stoat for it).
  - `chase_tail`: loop, spins after its tail; constant size across views.
  - `confused`: loop, head tilts both ways, a bobbing `Q` above.
  - `happy`: loop, slow blink, tail up, a small rising `R` heart.

- [ ] **Step 2: Client review gate.** As Task 1 Step 3.

- [ ] **Step 3: Export and test.** As Task 1 Step 4.

- [ ] **Step 4: Commit**

```bash
git add tools/sprites/stoat src/assets/sprites/stoat.json src/lib/pet/sprite.test.ts
git commit -s -m "Draw the stoat's reactions and moments

Startle, pounce, chase tail, confused and happy, hand keyed with
in-betweens and approved playing in the browser."
```

---

### Task 3: Pixel-me desk transitions

**Files:**
- Modify: `tools/sprites/me/*.py`, `tools/sprites/me/me.json`
- Modify: `src/assets/sprites/me.json` (via export), `src/lib/pet/sprite.test.ts`

**Interfaces:**
- Produces in `me.json`, each with `w: 99, h: 57` like `desk`:
  - `desk_empty`: loop (one frame is fine; the laptop code may keep scrolling), the desk and chair without pixel-me.
  - `stand_up`: one-shot from `desk` frame 0 to pixel-me standing beside the chair, ending on the drawn desk_empty background plus pixel-me in `walk` frame 0's pose. Carries `standAt: [x, y]`, the desk-pixel position of the 32x52 me sprite's top-left on the last frame.
  - `sit_down`: one-shot, the reverse, ending on `desk` frame 0.
  - `walk` may be re-timed with in-betweens if it reads choppy next to the stoat; it must keep facing right and keep `travel: 1`.

- [ ] **Step 1: Dispatch the art agent** (Opus) with `BRIEF.md` (pixel-me section: approved art in `tools/sprites/me/`, light skin, sweater, long hair behind the back) and the list above. The export (`tools/sprites/export.py` `me()`) copies every non-frame clip key, so `standAt` passes through.

- [ ] **Step 2: Client review gate.** The agent builds `tools/sprites/me/preview.html` playing `desk`, `stand_up`, `desk_empty` with the walking sprite crossing out and back, and `sit_down`, as one sequence. Open it in Chromium; accept on approval only.

- [ ] **Step 3: Add the me clip test** to `src/lib/pet/sprite.test.ts` inside `describe('sprite data')`:

```ts
  it('has the desk transitions for pixel-me', () => {
    const a = (me as unknown as Sprite).animations
    for (const n of ['desk_empty', 'stand_up', 'sit_down']) expect(a[n]).toMatchObject({ w: 99, h: 57 })
    expect(a.stand_up.standAt).toHaveLength(2)
  })
```

Run: `python3 tools/sprites/export.py && npx vitest run src/lib/pet/sprite.test.ts`. Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tools/sprites/me src/assets/sprites/me.json src/lib/pet/sprite.test.ts
git commit -s -m "Let pixel-me stand up from the desk and sit back down"
```

---

### Task 4: Sprite fallback, season and on/off prefs

**Files:**
- Modify: `src/lib/pet/sprite.ts`, `src/lib/pet/sprite.test.ts`
- Create: `src/lib/pet/season.ts`, `src/lib/pet/season.test.ts`
- Modify: `src/lib/pet/prefs.ts`, `src/lib/pet/prefs.test.ts`, `src/lib/pet/prefs-store.ts`

**Interfaces:**
- Produces:
  - `Clip` gains `standAt?: [number, number]`.
  - `resolveClip(s, name)` falls back to `idle`, else the first clip.
  - `isWinter(d: Date): boolean`, `stoatCoat(d: Date): 'summer' | 'winter'`
  - `type PetPrefs = { on: boolean }`, `loadPetPrefs(storage?)`, `savePetPrefs(p, storage?)`, `PREFS_KEY = 'pet-prefs'`
  - `usePetPrefs(): [PetPrefs, (next: PetPrefs) => void]` (server snapshot `{ on: false }`)

Consumers of the old `PetPrefs` (`cat`, `coat`, `stoat`) break until Tasks 7 to 10 replace them. Keep the build green in this task by changing only these call sites: `src/components/pet/pet-layer.tsx` (`prefs.cat` to `prefs.on`, drop `coat`, pass `variant={undefined}`), `src/components/pet/stage-cat.tsx` and `desk-scene.tsx` (`prefs.cat` to `prefs.on`, `prefs.coat` to `undefined`), and `pet-panel.tsx` (render only the on/off `Choice` bound to `on`; delete the coat and stoat choices and `COATS`/`FREQS` imports). These files are replaced later; the edits only keep tsc and the suite passing.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/pet/sprite.test.ts` inside `describe('resolveClip')`:

```ts
  it('falls back to the first clip when the sprite has no idle', () => {
    const s: Sprite = { w: 1, h: 1, palette: { A: '#000' }, animations: { bound: { loop: true, frames: [{ ms: 50, px: ['A'] }] } } }
    expect(resolveClip(s, 'sit')).toMatchObject({ name: 'bound', fallback: true })
  })
```

`src/lib/pet/season.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isWinter, stoatCoat } from './season'

describe('season', () => {
  it('counts November through March as winter', () => {
    expect(isWinter(new Date(2026, 10, 1))).toBe(true)
    expect(isWinter(new Date(2027, 2, 31))).toBe(true)
    expect(isWinter(new Date(2026, 3, 1))).toBe(false)
    expect(isWinter(new Date(2026, 9, 31))).toBe(false)
  })

  it('puts the stoat in white for winter', () => {
    expect(stoatCoat(new Date(2026, 11, 1))).toBe('winter')
    expect(stoatCoat(new Date(2026, 6, 1))).toBe('summer')
  })
})
```

Replace `src/lib/pet/prefs.test.ts` with:

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
  it('is on by default', () => {
    expect(loadPetPrefs(memory())).toEqual({ on: true })
  })

  it('keeps a saved off', () => {
    expect(loadPetPrefs(memory({ [PREFS_KEY]: JSON.stringify({ on: false }) }))).toEqual({ on: false })
  })

  it('reads a cat-era off as off', () => {
    expect(loadPetPrefs(memory({ [PREFS_KEY]: JSON.stringify({ cat: false, coat: 'black', stoat: 'off' }) }))).toEqual({ on: false })
  })

  it('survives garbage, non-object JSON, throwing storage and no storage', () => {
    expect(loadPetPrefs(memory({ [PREFS_KEY]: '{nope' }))).toEqual({ on: true })
    expect(loadPetPrefs(memory({ [PREFS_KEY]: '5' }))).toEqual({ on: true })
    expect(loadPetPrefs(throwing)).toEqual({ on: true })
    expect(loadPetPrefs(null)).toEqual({ on: true })
    expect(() => savePetPrefs({ on: false }, throwing)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/pet/sprite.test.ts src/lib/pet/season.test.ts src/lib/pet/prefs.test.ts`
Expected: FAIL (fallback returns undefined clip; `./season` not found; prefs shape differs).

- [ ] **Step 3: Implement**

In `src/lib/pet/sprite.ts`, add `standAt?: [number, number]` to `Clip`, and replace `resolveClip` and its comment with:

```ts
// The engine ships before every clip is drawn, so a missing clip plays idle,
// or the first clip for a sprite without one (the stoat).
export function resolveClip(s: Sprite, name: string) {
  const clip = s.animations[name]
  if (clip) return { name, clip, fallback: false }
  const fb = s.animations.idle ? 'idle' : Object.keys(s.animations)[0]
  return { name: fb, clip: s.animations[fb], fallback: true }
}
```

`src/lib/pet/season.ts`:

```ts
export const isWinter = (d: Date) => {
  const m = d.getMonth()
  return m >= 10 || m <= 2
}

export const stoatCoat = (d: Date) => (isWinter(d) ? 'winter' : 'summer')
```

`src/lib/pet/prefs.ts`:

```ts
export type PetPrefs = { on: boolean }

export const PREFS_KEY = 'pet-prefs'

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

export function loadPetPrefs(storage: Storage | null = browserStorage()): PetPrefs {
  let saved: unknown = null
  try {
    saved = JSON.parse(storage?.getItem(PREFS_KEY) ?? 'null')
  } catch {
    saved = null
  }
  const o = saved && typeof saved === 'object' ? (saved as Record<string, unknown>) : {}
  // prefs saved before the stoat replaced the cat carry `cat` instead of `on`
  return { on: o.on !== false && o.cat !== false }
}
```

In `src/lib/pet/prefs-store.ts`, replace the comment above `current` with `// One loaded value per page view, shared by the layer and the settings panel.` and set `const SERVER: PetPrefs = { on: false }`.

Then make the call-site edits listed above this task's steps.

- [ ] **Step 4: Run the full suite and tsc**

Run: `npx vitest run && npx tsc --noEmit -p .`
Expected: PASS, no type errors. Delete any old prefs-store or panel test assertion that names `coat` or `stoat` only if it cannot compile; say which in the report.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet src/components/pet
git commit -s -m "Reduce pet settings to one switch and dress the stoat by season

Prefs become a single on/off, reading an old cat-off as off. A sprite
without an idle clip falls back to its first clip."
```

---

### Task 5: Generic pet brain

**Files:**
- Create: `src/lib/pet/pet-brain.ts`, `src/lib/pet/pet-brain.test.ts`

**Interfaces:**
- Produces:
  - `type Mode = 'idle' | 'groom' | 'loaf' | 'sleep' | 'wake' | 'walk' | 'run' | 'sit_down' | 'startle' | 'pounce' | 'peek' | 'periscope' | 'zoomies' | 'parked' | 'desk_nap'`
  - `type PetState = { mode: Mode; x: number; dir: 1 | -1; target: number | null; lastInput: number; lastNear: number; zoomLeg: 0 | 1; home: number; napAtDesk: boolean }` (x, target in stoat sprite px)
  - `type PetEvent` = `tick {now,width,roll,desk:number|null}` | `input {now}` | `hover {now}` | `near {now,dir}` | `click {now,roll}` | `go {now,target}` | `follow {now,target,roll}` | `step {now,px}` | `end {now}`
  - `initPet(now, x, reduced): PetState`, `petReducer(s, e): PetState`, `clipFor(mode): string`, `stoatSpot(mode, claimed): 'floor' | 'desk' | null`
  - Constants `GROOM_AFTER = 20_000`, `LOAF_AFTER = 40_000`, `SLEEP_AFTER = 60_000`, `RUN_OVER = 24`, `ZOOMIES_PER_TICK = 0.00002`, `IGNORE_CLICK = 0.2`, `POUNCE_THRESHOLD = 0.6`, `DESK_NAP_CHANCE = 0.4`, `FOLLOW_CHANCE = 0.5`, `NEAR_COOLDOWN = 8_000`

`cat-brain.ts` stays until Task 10 deletes it.

- [ ] **Step 1: Write the failing test** `src/lib/pet/pet-brain.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { clipFor, initPet, NEAR_COOLDOWN, petReducer, stoatSpot, type PetEvent, type PetState } from './pet-brain'

const run = (s: PetState, ...events: PetEvent[]) => events.reduce(petReducer, s)
const tick = (now: number, roll = 1, width = 500, desk: number | null = null): PetEvent => ({ type: 'tick', now, width, roll, desk })

describe('idle chain', () => {
  it('sits, grooms, curls, then sleeps as the page sits untouched', () => {
    const s = initPet(0, 100, false)
    expect(run(s, tick(19_000)).mode).toBe('idle')
    expect(run(s, tick(21_000)).mode).toBe('groom')
    expect(run(s, tick(41_000)).mode).toBe('loaf')
    expect(run(s, tick(61_000)).mode).toBe('sleep')
  })

  it('wakes on input and settles back to idle', () => {
    const woke = run(initPet(0, 100, false), tick(61_000), { type: 'input', now: 62_000 })
    expect(woke.mode).toBe('wake')
    expect(run(woke, { type: 'end', now: 63_000 }).mode).toBe('idle')
  })
})

describe('desk nap', () => {
  it('sometimes walks to the desk to sleep instead of sleeping where it is', () => {
    const going = run(initPet(0, 100, false), tick(61_000, 0.1, 500, 30))
    expect(going).toMatchObject({ mode: 'run', target: 30, napAtDesk: true })
    const arrived = run(going, { type: 'step', now: 62_000, px: 70 })
    expect(arrived).toMatchObject({ mode: 'desk_nap', x: 30, target: null, napAtDesk: false })
    expect(run(arrived, { type: 'input', now: 63_000 }).mode).toBe('wake')
  })

  it('sleeps on the floor when there is no desk or the roll misses', () => {
    expect(run(initPet(0, 100, false), tick(61_000, 0.1, 500, null)).mode).toBe('sleep')
    expect(run(initPet(0, 100, false), tick(61_000, 0.9, 500, 30)).mode).toBe('sleep')
  })

  it('stays napping through route changes', () => {
    const napping = run(initPet(0, 30, false), tick(61_000, 0.1, 500, 30))
    expect(napping.mode).toBe('desk_nap')
    expect(run(napping, { type: 'go', now: 62_000, target: 200 }).mode).toBe('desk_nap')
  })
})

describe('reactions', () => {
  it('startles on hover, and not while asleep', () => {
    expect(run(initPet(0, 100, false), { type: 'hover', now: 1 }).mode).toBe('startle')
    expect(run(initPet(0, 100, false), tick(61_000), { type: 'hover', now: 61_500 }).mode).toBe('sleep')
  })

  it('ignores some clicks, pounces or peeks on the rest', () => {
    const s = initPet(0, 100, false)
    expect(run(s, { type: 'click', now: 1, roll: 0.1 }).mode).toBe('idle')
    expect(run(s, { type: 'click', now: 1, roll: 0.4 }).mode).toBe('pounce')
    expect(run(s, { type: 'click', now: 1, roll: 0.9 }).mode).toBe('peek')
  })

  it('periscopes toward a near pointer at most once per cooldown', () => {
    const s = initPet(0, 100, false)
    const looked = run(s, { type: 'near', now: 10_000, dir: -1 })
    expect(looked).toMatchObject({ mode: 'periscope', dir: -1 })
    const settled = run(looked, { type: 'end', now: 12_000 })
    expect(run(settled, { type: 'near', now: 12_000, dir: 1 }).mode).toBe('idle')
    expect(run(settled, { type: 'near', now: 10_000 + NEAR_COOLDOWN, dir: 1 }).mode).toBe('periscope')
  })
})

describe('moving', () => {
  it('walks to a near target and bounds to a far one, facing the way it goes', () => {
    const s = initPet(0, 100, false)
    expect(run(s, { type: 'go', now: 1, target: 110 })).toMatchObject({ mode: 'walk', dir: 1 })
    expect(run(s, { type: 'go', now: 1, target: 10 })).toMatchObject({ mode: 'run', dir: -1 })
  })

  it('sits down on arrival without overshooting', () => {
    const walking = run(initPet(0, 100, false), { type: 'go', now: 1, target: 103 })
    const s = run(walking, { type: 'step', now: 2, px: 2 }, { type: 'step', now: 3, px: 2 })
    expect(s).toMatchObject({ mode: 'sit_down', x: 103, target: null })
  })

  it('follows pixel-me only on a good roll and only while resting awake', () => {
    const s = initPet(0, 100, false)
    expect(run(s, { type: 'follow', now: 1, target: 200, roll: 0.1 })).toMatchObject({ mode: 'run', target: 200 })
    expect(run(s, { type: 'follow', now: 1, target: 200, roll: 0.9 }).mode).toBe('idle')
    expect(run(s, tick(61_000), { type: 'follow', now: 61_500, target: 200, roll: 0.1 }).mode).toBe('sleep')
  })

  it('clamps into a viewport that shrank under it, even when parked', () => {
    expect(run(initPet(0, 900, false), tick(1, 1, 300)).x).toBe(300)
    expect(run(initPet(0, 900, true), tick(1, 1, 300))).toMatchObject({ mode: 'parked', x: 300 })
    expect(run(initPet(0, 100, false), tick(1, 1, -10)).x).toBe(0)
  })

  it('does zoomies to one edge and back on a rare tick', () => {
    const z = run(initPet(0, 100, false), tick(1_000, 0))
    expect(z).toMatchObject({ mode: 'zoomies', target: 500, dir: 1 })
    const back = run(z, { type: 'step', now: 2_000, px: 400 })
    expect(back).toMatchObject({ mode: 'zoomies', target: 100, dir: -1 })
    expect(run(back, { type: 'step', now: 3_000, px: 400 }).mode).toBe('sit_down')
  })
})

describe('reduced motion', () => {
  it('starts parked and ignores everything', () => {
    const s = initPet(0, 100, true)
    const after = run(s, tick(90_000, 0, 500, 30), { type: 'hover', now: 1 }, { type: 'go', now: 2, target: 0 }, { type: 'click', now: 3, roll: 0.5 }, { type: 'near', now: 4, dir: 1 })
    expect(after.mode).toBe('parked')
  })
})

describe('clips and placement', () => {
  it('maps modes to stoat clips', () => {
    expect(clipFor('idle')).toBe('sit')
    expect(clipFor('loaf')).toBe('curl')
    expect(clipFor('walk')).toBe('bound')
    expect(clipFor('run')).toBe('bound')
    expect(clipFor('zoomies')).toBe('bound')
    expect(clipFor('parked')).toBe('sleep')
    expect(clipFor('desk_nap')).toBe('sleep')
    expect(clipFor('pounce')).toBe('pounce')
  })

  it('never shows the roaming stoat while a fixed-place stoat holds the stage', () => {
    expect(stoatSpot('idle', false)).toBe('floor')
    expect(stoatSpot('desk_nap', false)).toBe('desk')
    expect(stoatSpot('idle', true)).toBeNull()
    expect(stoatSpot('desk_nap', true)).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/pet/pet-brain.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement** `src/lib/pet/pet-brain.ts`:

```ts
export type Mode =
  | 'idle' | 'groom' | 'loaf' | 'sleep' | 'wake' | 'walk' | 'run' | 'sit_down'
  | 'startle' | 'pounce' | 'peek' | 'periscope' | 'zoomies' | 'parked' | 'desk_nap'
export type PetState = {
  mode: Mode
  x: number
  dir: 1 | -1
  target: number | null
  lastInput: number
  lastNear: number
  zoomLeg: 0 | 1
  home: number
  napAtDesk: boolean
}
export type PetEvent =
  | { type: 'tick'; now: number; width: number; roll: number; desk: number | null }
  | { type: 'input'; now: number }
  | { type: 'hover'; now: number }
  | { type: 'near'; now: number; dir: 1 | -1 }
  | { type: 'click'; now: number; roll: number }
  | { type: 'go'; now: number; target: number }
  | { type: 'follow'; now: number; target: number; roll: number }
  | { type: 'step'; now: number; px: number }
  | { type: 'end'; now: number }

export const GROOM_AFTER = 20_000
export const LOAF_AFTER = 40_000
export const SLEEP_AFTER = 60_000
export const RUN_OVER = 24
export const ZOOMIES_PER_TICK = 0.00002
export const IGNORE_CLICK = 0.2
export const POUNCE_THRESHOLD = 0.6
export const DESK_NAP_CHANCE = 0.4
export const FOLLOW_CHANCE = 0.5
export const NEAR_COOLDOWN = 8_000

const RESTING: Mode[] = ['idle', 'groom', 'loaf', 'sleep']
const AWAKE_RESTING: Mode[] = ['idle', 'groom', 'loaf']
const ONE_SHOTS: Mode[] = ['wake', 'sit_down', 'startle', 'pounce', 'peek', 'periscope']
const CLIPS: Partial<Record<Mode, string>> = {
  idle: 'sit',
  loaf: 'curl',
  walk: 'bound',
  run: 'bound',
  zoomies: 'bound',
  parked: 'sleep',
  desk_nap: 'sleep',
}

export const clipFor = (m: Mode) => CLIPS[m] ?? m

export const stoatSpot = (m: Mode, claimed: boolean) => (claimed ? null : m === 'desk_nap' ? 'desk' : 'floor')

export const initPet = (now: number, x: number, reduced: boolean): PetState => ({
  mode: reduced ? 'parked' : 'idle',
  x,
  dir: -1,
  target: null,
  lastInput: now,
  lastNear: -Infinity,
  zoomLeg: 0,
  home: x,
  napAtDesk: false,
})

const restingMode = (idleFor: number): Mode =>
  idleFor >= SLEEP_AFTER ? 'sleep' : idleFor >= LOAF_AFTER ? 'loaf' : idleFor >= GROOM_AFTER ? 'groom' : 'idle'

const heading = (from: number, to: number): 1 | -1 => (to >= from ? 1 : -1)

function moveTo(s: PetState, target: number, now: number): PetState {
  const d = Math.abs(target - s.x)
  return { ...s, mode: d > RUN_OVER ? 'run' : 'walk', target, dir: heading(s.x, target), lastInput: now, napAtDesk: false }
}

export function petReducer(s: PetState, e: PetEvent): PetState {
  if (s.mode === 'parked' && e.type !== 'tick') return s
  switch (e.type) {
    case 'tick': {
      const room = Math.max(0, e.width)
      const x = Math.min(Math.max(0, s.x), room)
      if (s.mode === 'parked' || s.mode === 'desk_nap') return { ...s, x }
      const next = { ...s, x, home: Math.min(s.home, room), target: s.target === null ? null : Math.max(0, Math.min(room, s.target)) }
      if (next.mode === 'idle' && e.roll < ZOOMIES_PER_TICK) {
        return { ...next, mode: 'zoomies', target: room, dir: heading(x, room), zoomLeg: 0, home: x }
      }
      if (!RESTING.includes(next.mode)) return next
      const mode = restingMode(e.now - next.lastInput)
      if (mode === 'sleep' && next.mode !== 'sleep' && e.desk !== null && e.roll < DESK_NAP_CHANCE) {
        const desk = Math.max(0, Math.min(room, e.desk))
        if (Math.abs(desk - x) < 1) return { ...next, mode: 'desk_nap' }
        return { ...next, mode: Math.abs(desk - x) > RUN_OVER ? 'run' : 'walk', target: desk, dir: heading(x, desk), napAtDesk: true }
      }
      return { ...next, mode }
    }
    case 'input':
      if (s.mode === 'sleep' || s.mode === 'desk_nap') return { ...s, mode: 'wake', lastInput: e.now }
      if (RESTING.includes(s.mode)) return { ...s, mode: 'idle', lastInput: e.now }
      return { ...s, lastInput: e.now, napAtDesk: false }
    case 'hover':
      return AWAKE_RESTING.includes(s.mode) ? { ...s, mode: 'startle', lastInput: e.now } : s
    case 'near':
      if (!AWAKE_RESTING.includes(s.mode) || e.now - s.lastNear < NEAR_COOLDOWN) return s
      return { ...s, mode: 'periscope', dir: e.dir, lastNear: e.now, lastInput: e.now }
    case 'click':
      if (!AWAKE_RESTING.includes(s.mode)) return s
      if (e.roll < IGNORE_CLICK) return { ...s, mode: 'idle', lastInput: e.now }
      return { ...s, mode: e.roll < POUNCE_THRESHOLD ? 'pounce' : 'peek', lastInput: e.now }
    case 'go': {
      if (s.mode === 'zoomies' || s.mode === 'desk_nap') return s
      const target = Math.max(0, e.target)
      return Math.abs(target - s.x) < 1 ? s : moveTo(s, target, e.now)
    }
    case 'follow': {
      if (!AWAKE_RESTING.includes(s.mode) || e.roll >= FOLLOW_CHANCE) return s
      const target = Math.max(0, e.target)
      return Math.abs(target - s.x) < 1 ? s : moveTo(s, target, e.now)
    }
    case 'step': {
      if (s.target === null) return s
      const x = s.dir === 1 ? Math.min(s.target, s.x + e.px) : Math.max(s.target, s.x - e.px)
      if (x !== s.target) return { ...s, x }
      if (s.mode === 'zoomies' && s.zoomLeg === 0) return { ...s, x, zoomLeg: 1, target: s.home, dir: heading(x, s.home) }
      if (s.napAtDesk) return { ...s, x, mode: 'desk_nap', target: null, napAtDesk: false, zoomLeg: 0 }
      return { ...s, x, mode: 'sit_down', target: null, zoomLeg: 0, lastInput: e.now }
    }
    case 'end':
      return ONE_SHOTS.includes(s.mode) ? { ...s, mode: 'idle', lastInput: e.now } : s
  }
}
```

Note the desk-nap arrival keeps `lastInput` old on purpose, so the next tick does not pull the stoat out of the nap; `tick` returns early for `desk_nap`.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/pet/pet-brain.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/pet-brain.ts src/lib/pet/pet-brain.test.ts
git commit -s -m "Generalise the pet brain for the stoat

Idle, groom, curl and sleep as before, with naps on pixel-me's desk,
a periscope toward a nearby pointer, pounce or peek on click, and a
chance to follow pixel-me when he goes for a walk."
```

---

### Task 6: Pixel-me brain

**Files:**
- Create: `src/lib/pet/me-brain.ts`, `src/lib/pet/me-brain.test.ts`

**Interfaces:**
- Produces:
  - `type MeMode = 'still' | 'desk' | 'standing' | 'walking' | 'returning' | 'sitting'`
  - `type MeState = { mode: MeMode; x: number; home: number; target: number | null; dir: 1 | -1; nextWalk: number }` (x, home, target in desk-scale px from the desk's left edge)
  - `type MeEvent = { type: 'tick'; now: number; width: number; roll: number } | { type: 'end'; now: number; roll: number } | { type: 'step'; px: number }` (`width` = rightmost x the me sprite may reach)
  - `initMe(now, home, reduced, roll): MeState`, `meReducer(s, e): MeState`, `meClips(mode): { desk: string; walker: boolean }`
  - Constants `WALK_EVERY_MIN = 60_000`, `WALK_EVERY_MAX = 180_000`, `WALK_MIN = 40`, `WALK_MAX = 120`

- [ ] **Step 1: Write the failing test** `src/lib/pet/me-brain.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { initMe, meClips, meReducer, WALK_EVERY_MAX, WALK_EVERY_MIN, WALK_MAX, WALK_MIN, type MeEvent, type MeState } from './me-brain'

const run = (s: MeState, ...events: MeEvent[]) => events.reduce(meReducer, s)
const HOME = 70

describe('desk and walk cycle', () => {
  it('works at the desk until the next walk is due', () => {
    const s = initMe(0, HOME, false, 0)
    expect(s).toMatchObject({ mode: 'desk', x: HOME, nextWalk: WALK_EVERY_MIN })
    expect(run(s, { type: 'tick', now: WALK_EVERY_MIN - 1, width: 1000, roll: 0 }).mode).toBe('desk')
    expect(run(s, { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 0 })).toMatchObject({ mode: 'standing', target: HOME + WALK_MIN })
  })

  it('stands, walks out, comes back, sits down, and schedules the next walk', () => {
    const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 1 })
    expect(due.target).toBe(HOME + WALK_MAX)
    const walking = run(due, { type: 'end', now: 61_000, roll: 0 })
    expect(walking).toMatchObject({ mode: 'walking', dir: 1 })
    const turned = run(walking, { type: 'step', px: WALK_MAX })
    expect(turned).toMatchObject({ mode: 'returning', x: HOME + WALK_MAX, target: HOME, dir: -1 })
    const back = run(turned, { type: 'step', px: WALK_MAX })
    expect(back).toMatchObject({ mode: 'sitting', x: HOME, target: null })
    const seated = run(back, { type: 'end', now: 100_000, roll: 1 })
    expect(seated).toMatchObject({ mode: 'desk', nextWalk: 100_000 + WALK_EVERY_MAX })
  })

  it('keeps the walk inside a narrow viewport', () => {
    const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: HOME + 10, roll: 1 })
    expect(due.target).toBe(HOME + 10)
  })

  it('turns back if the viewport shrinks under a walk', () => {
    const walking = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 1 }, { type: 'end', now: 61_000, roll: 0 }, { type: 'step', px: 50 })
    expect(run(walking, { type: 'tick', now: 62_000, width: HOME + 20, roll: 0 })).toMatchObject({ mode: 'returning', x: HOME + 20, target: HOME })
  })

  it('never leaves the desk under reduced motion', () => {
    const s = initMe(0, HOME, true, 0)
    expect(run(s, { type: 'tick', now: 10 * WALK_EVERY_MAX, width: 1000, roll: 0 }, { type: 'end', now: 1, roll: 0 }).mode).toBe('still')
  })

  it('maps modes to the desk clip and the walker', () => {
    expect(meClips('desk')).toEqual({ desk: 'desk', walker: false })
    expect(meClips('still')).toEqual({ desk: 'desk', walker: false })
    expect(meClips('standing')).toEqual({ desk: 'stand_up', walker: false })
    expect(meClips('walking')).toEqual({ desk: 'desk_empty', walker: true })
    expect(meClips('returning')).toEqual({ desk: 'desk_empty', walker: true })
    expect(meClips('sitting')).toEqual({ desk: 'sit_down', walker: false })
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/pet/me-brain.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement** `src/lib/pet/me-brain.ts`:

```ts
export type MeMode = 'still' | 'desk' | 'standing' | 'walking' | 'returning' | 'sitting'
export type MeState = { mode: MeMode; x: number; home: number; target: number | null; dir: 1 | -1; nextWalk: number }
export type MeEvent =
  | { type: 'tick'; now: number; width: number; roll: number }
  | { type: 'end'; now: number; roll: number }
  | { type: 'step'; px: number }

export const WALK_EVERY_MIN = 60_000
export const WALK_EVERY_MAX = 180_000
export const WALK_MIN = 40
export const WALK_MAX = 120

const nextWalkAt = (now: number, roll: number) => now + WALK_EVERY_MIN + roll * (WALK_EVERY_MAX - WALK_EVERY_MIN)

export const initMe = (now: number, home: number, reduced: boolean, roll: number): MeState => ({
  mode: reduced ? 'still' : 'desk',
  x: home,
  home,
  target: null,
  dir: 1,
  nextWalk: nextWalkAt(now, roll),
})

export function meClips(mode: MeMode) {
  if (mode === 'standing') return { desk: 'stand_up', walker: false }
  if (mode === 'sitting') return { desk: 'sit_down', walker: false }
  if (mode === 'walking' || mode === 'returning') return { desk: 'desk_empty', walker: true }
  return { desk: 'desk', walker: false }
}

export function meReducer(s: MeState, e: MeEvent): MeState {
  if (s.mode === 'still') return s
  switch (e.type) {
    case 'tick': {
      const width = Math.max(s.home, e.width)
      if (s.mode === 'desk' && e.now >= s.nextWalk) {
        return { ...s, mode: 'standing', target: Math.min(width, Math.round(s.home + WALK_MIN + e.roll * (WALK_MAX - WALK_MIN))) }
      }
      if (s.mode === 'walking' && s.x >= width) return { ...s, mode: 'returning', x: width, target: s.home, dir: -1 }
      if (s.mode === 'returning' && s.x > width) return { ...s, x: width }
      return s
    }
    case 'end':
      if (s.mode === 'standing') return { ...s, mode: 'walking', dir: 1 }
      if (s.mode === 'sitting') return { ...s, mode: 'desk', nextWalk: nextWalkAt(e.now, e.roll) }
      return s
    case 'step': {
      if (s.mode === 'walking' && s.target !== null) {
        const x = Math.min(s.target, s.x + e.px)
        return x === s.target ? { ...s, x, mode: 'returning', target: s.home, dir: -1 } : { ...s, x }
      }
      if (s.mode === 'returning') {
        const x = Math.max(s.home, s.x - e.px)
        return x === s.home ? { ...s, x, mode: 'sitting', target: null } : { ...s, x }
      }
      return s
    }
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/pet/me-brain.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/me-brain.ts src/lib/pet/me-brain.test.ts
git commit -s -m "Model pixel-me's desk and walk cycle

He works at the desk, gets up every one to three minutes for a short
walk inside the viewport, and sits back down. Reduced motion keeps him
at the desk."
```

---

### Task 7: Settings panel opened from the desk; accessibility button to the right

**Files:**
- Create: `src/lib/pet/panel-store.ts`
- Modify: `src/components/pet/pet-panel.tsx`, `src/components/pet/pet-panel.test.tsx`
- Modify: `src/components/accessibility-panel.tsx:79,87`
- Modify: `src/i18n/locales/en.json` and, via the script, the other locales and `src/i18n/translations.lock.json`

**Interfaces:**
- Produces: `openPetPanel(): void`, `closePetPanel(): void`, `usePetPanelOpen(): boolean`; `<PetPanel />` (no props).

- [ ] **Step 1: Update the English keys** in `src/i18n/locales/en.json`: delete `pet.cat`, `pet.coat`, `pet.coat.tuxedo`, `pet.coat.orange`, `pet.coat.black`, `pet.coat.shiny`, `pet.stoat`, `pet.stoat.off`, `pet.stoat.rare`, `pet.stoat.normal`; set `"pet.settings": "Pixel friends settings"` and `"pet.title": "Pixel friends"`; add `"pet.friends": "Pixel friends"`. Keep `pet.close`, `pet.on`, `pet.off`, and `about.desk.alt` (still used by `desk-scene.tsx` until Task 8 deletes both).

- [ ] **Step 2: Write the failing test.** Replace `src/components/pet/pet-panel.test.tsx` with:

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { PetPanel } from './pet-panel'

describe('PetPanel', () => {
  it('renders nothing on the server', () => {
    expect(
      renderToStaticMarkup(
        <I18nextProvider i18n={i18nFor('en')}>
          <PetPanel />
        </I18nextProvider>,
      ),
    ).toBe('')
  })

  it('has its labels in English', () => {
    const t = i18nFor('en').t
    expect(t('pet.settings')).toBe('Pixel friends settings')
    expect(t('pet.friends')).toBe('Pixel friends')
  })
})
```

Run: `npx vitest run src/components/pet/pet-panel.test.tsx`. Expected: FAIL (the panel renders its toggle on the server).

- [ ] **Step 3: Implement** `src/lib/pet/panel-store.ts`:

```ts
import { useSyncExternalStore } from 'react'

let open = false
const listeners = new Set<() => void>()
const set = (v: boolean) => {
  open = v
  listeners.forEach((l) => l())
}

export const openPetPanel = () => set(true)
export const closePetPanel = () => set(false)

export const usePetPanelOpen = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => open,
    () => false,
  )
```

Replace `src/components/pet/pet-panel.tsx` with:

```tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PawPrint, X } from 'lucide-react'
import { closePetPanel, openPetPanel, usePetPanelOpen } from '../../lib/pet/panel-store'
import { usePetPrefs } from '../../lib/pet/prefs-store'

export function PetPanel() {
  const { t } = useTranslation()
  const open = usePetPanelOpen()
  const [prefs, setPrefs] = usePetPrefs()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePetPanel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!mounted) return null
  return (
    <>
      {/* with the friends off there is no desk to click, so a paw stands in for it */}
      {!prefs.on && (
        <button
          type="button"
          aria-label={t('pet.settings')}
          aria-expanded={open}
          onClick={() => (open ? closePetPanel() : openPetPanel())}
          className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/20 bg-bone shadow-lg transition-transform hover:scale-105 dark:border-bone/20 dark:bg-charcoal"
        >
          <PawPrint className="h-5 w-5 text-charcoal dark:text-bone" />
        </button>
      )}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={closePetPanel} />
          <div
            role="dialog"
            aria-label={t('pet.title')}
            className="fixed bottom-32 left-4 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-charcoal/20 bg-bone p-4 shadow-xl dark:border-bone/20 dark:bg-charcoal"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider">{t('pet.title')}</h2>
              <button type="button" autoFocus aria-label={t('pet.close')} onClick={closePetPanel} className="text-charcoal/60 hover:text-charcoal dark:text-bone/60 dark:hover:text-bone">
                <X className="h-4 w-4" />
              </button>
            </div>
            <fieldset className="mt-3">
              <legend className="mb-1.5 font-mono text-xs uppercase tracking-wider text-charcoal/60 dark:text-bone/60">{t('pet.friends')}</legend>
              <div className="flex gap-1.5">
                {([true, false] as const).map((on) => (
                  <button
                    key={String(on)}
                    type="button"
                    aria-pressed={prefs.on === on}
                    onClick={() => setPrefs({ on })}
                    className="rounded border border-charcoal/20 px-2.5 py-1 text-sm aria-pressed:border-gold aria-pressed:bg-gold/15 dark:border-bone/20"
                  >
                    {t(on ? 'pet.on' : 'pet.off')}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </>
      )}
    </>
  )
}
```

In `src/components/accessibility-panel.tsx`, change `fixed bottom-6 left-6` (line 79) to `fixed bottom-6 right-6` and `fixed bottom-20 left-6` (line 87) to `fixed bottom-20 right-6`.

- [ ] **Step 4: Translate and test**

Run: `node --env-file=.env scripts/translate-ui.mjs && node scripts/translate-ui.mjs --check && npx vitest run`
Expected: translations current; all tests PASS. If the script fails for network or key reasons, report BLOCKED with its output; never hand-write translations.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/panel-store.ts src/components/pet/pet-panel.tsx src/components/pet/pet-panel.test.tsx src/components/accessibility-panel.tsx src/i18n
git commit -s -m "Open the pet settings from the desk and move accessibility right

The panel holds one switch for the pixel friends. A paw button shows
only while they are off, since then there is no desk to click."
```

---

### Task 8: Friends layer: corner desk, walking pixel-me, roaming stoat

**Files:**
- Create: `src/components/pet/friends-layer.tsx`, `src/components/pet/friends-layer.test.tsx`, `src/components/pet/desk-corner.tsx`, `src/components/pet/stoat-roamer.tsx`
- Modify: `src/App.tsx` (replace `PetLayer` with `FriendsLayer`), `src/routes/about/index.tsx` (remove the Desk block and its import)
- Delete: `src/components/pet/desk-scene.tsx`, `src/components/pet/desk-scene.test.tsx`; remove `about.desk.alt` from `en.json` and re-run the translate script

**Interfaces:**
- Consumes: `petReducer`, `initPet`, `clipFor`, `stoatSpot` (Task 5); `meReducer`, `initMe`, `meClips` (Task 6); `openPetPanel` (Task 7); `usePetPrefs` (Task 4); `stoatCoat` (Task 4); `useStageClaimed`; `PixelSprite`; `NET`, `pulseLevel`, `edgeGlow`; `subscribe`; `stoat.json`, `me.json`.
- Produces: `<FriendsLayer />`; `STOAT_SCALE = 2`; `DESK_LEFT = 16` (css px).

- [ ] **Step 1: Write the failing test** `src/components/pet/friends-layer.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { FriendsLayer } from './friends-layer'

describe('FriendsLayer', () => {
  it('renders nothing on the server so prerendered HTML is unchanged', () => {
    expect(
      renderToStaticMarkup(
        <MemoryRouter>
          <FriendsLayer />
        </MemoryRouter>,
      ),
    ).toBe('')
  })
})
```

Run: `npx vitest run src/components/pet/friends-layer.test.tsx`. Expected: FAIL, module not found.

- [ ] **Step 2: Implement** `src/components/pet/stoat-roamer.tsx`:

```tsx
import { clipFor, type PetEvent, type PetState } from '../../lib/pet/pet-brain'
import type { Sprite } from '../../lib/pet/sprite'
import { PixelSprite } from './pixel-sprite'

type Send = (e: DistributiveOmit<PetEvent, 'now'>) => void
type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never

export function StoatRoamer({ sprite, state, send, coat, scale }: { sprite: Sprite; state: PetState; send: Send; coat: string; scale: number }) {
  const clip = clipFor(state.mode)
  const travel = sprite.animations[clip]?.travel ?? 1
  return (
    <div
      style={{ position: 'fixed', left: state.x * scale, bottom: 0, zIndex: 30, lineHeight: 0, pointerEvents: 'auto' }}
      onPointerEnter={() => send({ type: 'hover' })}
      onClick={() => send({ type: 'click', roll: Math.random() })}
    >
      <PixelSprite
        sprite={sprite}
        clip={clip}
        variant={coat}
        scale={scale}
        // every stoat clip faces right
        flip={state.dir === -1}
        playing={state.mode !== 'parked'}
        onStep={(n) => state.target !== null && send({ type: 'step', px: n * travel })}
        onEnd={() => send({ type: 'end' })}
      />
    </div>
  )
}
```

`src/components/pet/desk-corner.tsx` (the `NetCanvas` moves here from `desk-scene.tsx` unchanged):

```tsx
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { prefersReducedMotion } from '../../lib/motion'
import { meClips, type MeEvent, type MeState } from '../../lib/pet/me-brain'
import { edgeGlow, NET, pulseLevel } from '../../lib/pet/neural-net'
import type { Sprite } from '../../lib/pet/sprite'
import { subscribe } from '../../lib/pet/ticker'
import { PixelSprite } from './pixel-sprite'

export const DESK_LEFT = 16
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

type Props = {
  me: Sprite
  stoat: Sprite
  scale: number
  state: MeState
  send: (e: MeEvent) => void
  reduced: boolean
  napping: boolean
  coat: string
  onOpen: () => void
}

export function DeskCorner({ me, stoat, scale, state, send, reduced, napping, coat, onOpen }: Props) {
  const { t } = useTranslation()
  const typing = useRef(false)
  const desk = me.animations.desk
  const [SX, SY, , SH] = desk.catSlot!
  const DW = desk.w!
  const DH = desk.h!
  const clips = meClips(state.mode)
  const standTop = me.animations.stand_up?.standAt?.[1] ?? DH - me.h
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label={t('pet.settings')}
        className="group fixed bottom-0 z-30 block leading-none focus-visible:outline-2 focus-visible:outline-gold"
        style={{ left: DESK_LEFT, width: DW * scale, height: DH * scale }}
      >
        <span aria-hidden="true" className="relative block" style={{ width: DW * scale, height: DH * scale }}>
          <PixelSprite
            sprite={me}
            clip={clips.desk}
            scale={scale}
            playing={!reduced}
            frame={reduced ? 0 : undefined}
            onStep={(_, f) => {
              typing.current = !!f.typing
            }}
            onEnd={() => send({ type: 'end', now: performance.now(), roll: Math.random() })}
          />
          <NetCanvas scale={scale} typing={typing} />
          {napping && (
            <PixelSprite sprite={stoat} clip="sleep" variant={coat} scale={scale} playing={!reduced} style={{ position: 'absolute', left: SX * scale, top: (SY + SH - stoat.h) * scale }} />
          )}
        </span>
        <span className="pointer-events-none absolute bottom-full left-2 mb-1 whitespace-nowrap rounded border border-charcoal/20 bg-bone px-2 py-0.5 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-bone/20 dark:bg-charcoal">
          {t('pet.settings')}
        </span>
      </button>
      {clips.walker && (
        <div style={{ position: 'fixed', left: DESK_LEFT + state.x * scale, bottom: (DH - standTop - me.h) * scale, zIndex: 30, lineHeight: 0, pointerEvents: 'none' }}>
          <PixelSprite
            sprite={me}
            clip="walk"
            scale={scale}
            // me's walk faces right
            flip={state.dir === -1}
            onStep={(n) => send({ type: 'step', px: n * (me.animations.walk.travel ?? 1) })}
          />
        </div>
      )}
    </>
  )
}
```

`src/components/pet/friends-layer.tsx`:

```tsx
import { useEffect, useReducer, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import meJson from '../../assets/sprites/me.json'
import stoatJson from '../../assets/sprites/stoat.json'
import { prefersReducedMotion } from '../../lib/motion'
import { initMe, meReducer, type MeEvent } from '../../lib/pet/me-brain'
import { openPetPanel } from '../../lib/pet/panel-store'
import { initPet, petReducer, stoatSpot, type PetEvent } from '../../lib/pet/pet-brain'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import { stoatCoat } from '../../lib/pet/season'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaimed } from '../../lib/pet/stage'
import { DeskCorner, DESK_LEFT } from './desk-corner'
import { StoatRoamer } from './stoat-roamer'

// both JSON files infer tuples (catSlot, standAt) as number[]
const ME = meJson as unknown as Sprite
const STOAT = stoatJson as unknown as Sprite
export const STOAT_SCALE = 2
const NARROW = '(max-width: 639px)'
const NEAR_RADIUS = 200
const SCROLL_SETTLE = 600
const SCROLL_GO_EVERY = 8000

type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never

const stoatRoom = () => Math.max(0, Math.floor(window.innerWidth / STOAT_SCALE) - STOAT.w)

function useDeskScale() {
  const [scale, setScale] = useState(() => (window.matchMedia(NARROW).matches ? 1 : 2))
  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const on = () => setScale(mq.matches ? 1 : 2)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return scale
}

function Friends() {
  const reduced = useRef(prefersReducedMotion()).current
  const deskScale = useDeskScale()
  const claimed = useStageClaimed()
  const coat = stoatCoat(new Date())
  const home = ME.animations.stand_up?.standAt?.[0] ?? 0
  const [pet, petDispatch] = useReducer(petReducer, null, () => initPet(performance.now(), Math.max(0, stoatRoom() - 40), reduced))
  const [me, meDispatch] = useReducer(meReducer, null, () => initMe(performance.now(), home, reduced, Math.random()))
  const petNow = (e: DistributiveOmit<PetEvent, 'now'>) => petDispatch({ now: performance.now(), ...e } as PetEvent)
  const latest = useRef({ pet, deskScale })
  latest.current = { pet, deskScale }
  const { pathname } = useLocation()
  const first = useRef(true)

  // stoat px of the desk's stoat slot, and the rightmost x pixel-me may walk to
  const deskStoatX = () => Math.floor((DESK_LEFT + ME.animations.desk.catSlot![0] * latest.current.deskScale) / STOAT_SCALE)
  const meRoom = () => Math.floor((window.innerWidth - DESK_LEFT) / latest.current.deskScale) - ME.w

  useEffect(() => {
    const id = setInterval(() => {
      petNow({ type: 'tick', width: stoatRoom(), roll: Math.random(), desk: deskStoatX() })
      meDispatch({ type: 'tick', now: performance.now(), width: meRoom(), roll: Math.random() })
    }, 1000)
    const input = () => petNow({ type: 'input' })
    const move = (e: PointerEvent) => {
      input()
      const p = latest.current.pet
      const cx = (p.x + STOAT.w / 2) * STOAT_SCALE
      const cy = window.innerHeight - (STOAT.h / 2) * STOAT_SCALE
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < NEAR_RADIUS) petNow({ type: 'near', dir: e.clientX < cx ? -1 : 1 })
    }
    let settle: ReturnType<typeof setTimeout> | undefined
    let lastGo = -Infinity
    const scroll = () => {
      input()
      clearTimeout(settle)
      settle = setTimeout(() => {
        const now = performance.now()
        if (now - lastGo < SCROLL_GO_EVERY) return
        lastGo = now
        petNow({ type: 'go', target: Math.floor(Math.random() * stoatRoom()) })
      }, SCROLL_SETTLE)
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('keydown', input)
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      clearInterval(id)
      clearTimeout(settle)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('keydown', input)
      window.removeEventListener('scroll', scroll)
    }
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    petNow({ type: 'go', target: Math.floor(Math.random() * stoatRoom()) })
  }, [pathname])

  useEffect(() => {
    if (me.mode !== 'walking' || me.target === null) return
    petNow({ type: 'follow', target: Math.floor((DESK_LEFT + me.target * deskScale) / STOAT_SCALE), roll: Math.random() })
  }, [me.mode])

  const spot = stoatSpot(pet.mode, claimed)
  return (
    <>
      <DeskCorner me={ME} stoat={STOAT} scale={deskScale} state={me} send={meDispatch} reduced={reduced} napping={spot === 'desk'} coat={coat} onOpen={openPetPanel} />
      {spot === 'floor' && <StoatRoamer sprite={STOAT} state={pet} send={petNow} coat={coat} scale={STOAT_SCALE} />}
    </>
  )
}

export function FriendsLayer() {
  const [prefs] = usePetPrefs()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !prefs.on) return null
  return <Friends />
}
```

`DeskCorner`'s `send` receives `MeEvent` with `now` already filled in `onEnd`; `step` needs no `now`.

- [ ] **Step 3: Wire it up and remove the /about desk**

In `src/App.tsx`, replace `import { PetLayer } from './components/pet/pet-layer'` with `import { FriendsLayer } from './components/pet/friends-layer'` and `<PetLayer />` with `<FriendsLayer />`.

In `src/routes/about/index.tsx`, delete the `{/* Desk */}` block (the `div` with `data-card` wrapping `<DeskScene scale={3} />`) and the `DeskScene` import. Delete `src/components/pet/desk-scene.tsx` and `desk-scene.test.tsx`. Remove `about.desk.alt` from `en.json` and run `node --env-file=.env scripts/translate-ui.mjs`.

- [ ] **Step 4: Run the suite and tsc**

Run: `npx vitest run && npx tsc --noEmit -p .`
Expected: PASS, including `src/prerender.test.tsx` and the `/about` prerender case.

- [ ] **Step 5: Browser check.** Skip if the chrome-devtools MCP is locked; the controller runs it with a headless Chromium screenshot (`chromium --headless=new --no-sandbox --user-data-dir=<scratch> --window-size=1280,800 --virtual-time-budget=6000 --screenshot=<file> http://localhost:5199/blog`) and checks the desk in the bottom-left, the stoat on the floor, and the accessibility button bottom-right.

- [ ] **Step 6: Commit**

```bash
git add src/components/pet src/App.tsx src/routes/about/index.tsx src/i18n
git commit -s -m "Put pixel-me's desk in the corner of every page with the stoat

The desk sits bottom left (1x on phones), pixel-me gets up now and then
for a short walk, and the stoat roams the floor, naps on the desk and
sometimes follows him. Clicking the desk opens the settings."
```

---

### Task 9: Fixed-place stoat for the 404, loader and sign-off

**Files:**
- Create: `src/components/pet/stage-pet.tsx`, `src/components/pet/stage-pet.test.tsx`
- Modify: `src/routes/not-found.tsx:5,16`, `src/App.tsx:20,78`, `src/components/post-signoff.tsx:4,209`
- Delete: `src/components/pet/stage-cat.tsx`, `src/components/pet/stage-cat.test.tsx`

**Interfaces:**
- Consumes: `PixelSprite`, `useStageClaim`, `usePetPrefs`, `stoatCoat`, `prefersReducedMotion`, `stoat.json`.
- Produces: `<StagePet clip: string; scale?: number; className?: string />` (default scale 3).

- [ ] **Step 1: Write the failing test** `src/components/pet/stage-pet.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StagePet } from './stage-pet'

describe('StagePet', () => {
  it('reserves the stoat-sized box on the server without drawing', () => {
    const html = renderToStaticMarkup(<StagePet clip="confused" scale={3} />)
    expect(html).toContain('width:96px')
    expect(html).toContain('height:60px')
    expect(html).not.toContain('<canvas')
  })
})
```

Run: `npx vitest run src/components/pet/stage-pet.test.tsx`. Expected: FAIL, module not found.

- [ ] **Step 2: Implement** `src/components/pet/stage-pet.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import stoat from '../../assets/sprites/stoat.json'
import { prefersReducedMotion } from '../../lib/motion'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import { stoatCoat } from '../../lib/pet/season'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaim } from '../../lib/pet/stage'
import { PixelSprite } from './pixel-sprite'

const SPRITE = stoat as unknown as Sprite

export function StagePet({ clip, scale = 3, className }: { clip: string; scale?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [prefs] = usePetPrefs()
  useEffect(() => setMounted(true), [])
  const show = mounted && prefs.on
  useEffect(() => {
    const el = ref.current
    if (!el || !show || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [show])
  useStageClaim(show && visible)
  // the box is reserved only until mount, so turning the friends off leaves no gap
  if (mounted && !prefs.on) return null
  return (
    <div ref={ref} className={className} style={{ width: SPRITE.w * scale, height: SPRITE.h * scale }}>
      {show && <PixelSprite sprite={SPRITE} clip={clip} variant={stoatCoat(new Date())} scale={scale} playing={!prefersReducedMotion()} />}
    </div>
  )
}
```

- [ ] **Step 3: Wire the three places.** Replace `StageCat` with `StagePet` (import path `./components/pet/stage-pet`, `../components/pet/stage-pet`, `./pet/stage-pet`) in `App.tsx`, `not-found.tsx` and `post-signoff.tsx`, keeping each `clip`, `scale` and `className` as they are. Delete `stage-cat.tsx` and `stage-cat.test.tsx`.

- [ ] **Step 4: Run the suite**

Run: `npx vitest run && npx tsc --noEmit -p .`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/pet src/App.tsx src/routes/not-found.tsx src/components/post-signoff.tsx
git commit -s -m "Put the stoat on the 404 page, the post loader and the sign-off

Each fixed-place stoat hides the roaming one while it is on screen, and
leaves no empty box when the friends are off."
```

---

### Task 10: Remove the cat

**Files:**
- Delete: `src/assets/sprites/cat.json`, `src/lib/pet/cat-brain.ts`, `src/lib/pet/cat-brain.test.ts`, `src/components/pet/pet-layer.tsx`, `src/components/pet/pet-layer.test.tsx`
- Delete: `tools/sprites/cat-anims/`, `tools/sprites/styles/`, `tools/sprites/walk-sleek/`, `tools/sprites/chibi-suite-draft.json`, `tools/sprites/run-draft/` (only if nothing under `tools/sprites/stoat/` or `tools/sprites/me/` imports from them; check with `grep -rn "cat-anims\|walk-sleek\|styles\|catkit\|run-draft" tools/sprites/stoat tools/sprites/me tools/sprites/export.py`)
- Modify: `tools/sprites/export.py`, `src/lib/pet/sprite.test.ts`, `.gitignore` (drop the `tools/sprites/**/png/` line only if no generator writes `png/` anymore)

- [ ] **Step 1: Confirm nothing in `src/` still imports the cat**

Run: `grep -rn "cat-brain\|cat.json\|pet-layer\|stage-cat\|desk-scene" src`
Expected: only the files being deleted.

- [ ] **Step 2: Trim the exporter.** In `tools/sprites/export.py`, delete `CAT_EFFECTS`, `cat()`, the `pkgutil` and `importlib` imports, and the `write('cat.json', cat())` line, so `__main__` writes `me.json` and `stoat.json`.

- [ ] **Step 3: Trim the sprite test.** In `src/lib/pet/sprite.test.ts`, remove the `cat` import, its row in the `it.each` table, and the `ships the approved cat clips and all four coats` test.

- [ ] **Step 4: Delete the files** listed above with `git rm -r`.

- [ ] **Step 5: Run everything**

Run: `python3 tools/sprites/export.py && git diff --stat src/assets/sprites && npx vitest run && npx tsc --noEmit -p . && npm run build`
Expected: the exporter rewrites nothing (no diff in `src/assets/sprites`), tests PASS, build finishes with prerendered pages.

- [ ] **Step 6: Commit**

```bash
git add -A tools/sprites src/assets/sprites src/lib/pet src/components/pet .gitignore
git commit -s -m "Remove the cat

The stoat replaced it as the resident pet; the cat art stays in the
history."
```

(`git add -A` scoped to these paths is needed to stage the deletions.)

---

### Task 11: Final verification

**Files:** none new.

- [ ] **Step 1: Full suite and build**

Run: `npx vitest run && npm run build`
Expected: all tests pass; prerendered pages build.

- [ ] **Step 2: Browser pass** with the dev server (`npx vite --port 5199`), at 1440 and 390 px wide (headless Chromium screenshots, and the client's own Chromium window):
  - `/`, `/blog`, `/portfolio`: desk bottom-left (1x at 390 px), stoat on the floor, accessibility button bottom-right and not covered.
  - Click the desk: the panel opens; switch off: desk and stoat vanish and the paw appears; switch on again from the paw.
  - `/does-not-exist`: confused stoat, no roaming stoat.
  - A blog post end: happy stoat; the roaming stoat hides while it is on screen.
  - Accessibility panel set to Reduced: still desk, parked sleeping stoat, nothing wanders.
  - `/about`: the inline desk is gone.

- [ ] **Step 3: Whole-branch review** on Opus (per the client), then the finish: merge `pixel-pets` into `main` and push, confirming with the client at the moment of pushing.
