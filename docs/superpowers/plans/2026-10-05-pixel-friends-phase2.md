# Pixel friends phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pixel-me levitates under the footer's neon "@"; a pointer click bursts the six contact links out as orbiting pixel bubbles with hover and keyboard focus, and the contact card stays as the keyboard and reduced-motion fallback.

**Architecture:** The approved mockup's drawing code becomes the art source (`tools/sprites/footer/`), and `export.py` writes two small sprites, `footer.json` and `bubble.json`. All motion rules are pure functions (`orbit.ts`, `footer-machine.ts`) with unit tests. `FooterFriend` is lazy-loaded inside `SiteFooter` with today's "@" button as its Suspense fallback, so the prerendered footer does not change; one ticker subscription moves the bubbles by `transform`.

**Tech Stack:** React 19, react-router, Vite, Tailwind v4, vitest (node environment; component tests are SSR-only via `renderToStaticMarkup`), Python 3 + Pillow sprite generators in `tools/sprites/`, pnpm, i18next.

**Spec:** `docs/superpowers/specs/2026-10-05-pixel-friends-phase2-design.md`

## Global Constraints

- Package manager is pnpm: `pnpm test`, `pnpm run build` (runs `tsc && vite build && node scripts/postbuild.mjs`). The pre-commit hook runs `tsc --noEmit`, `pnpm test` and `pnpm i18n:check`; never use `--no-verify`.
- Commits use `git commit -s`. No `Co-Authored-By` trailer, no AI attribution, no em-dashes in commit messages or user-visible text.
- Edit files with the Edit/Write tools, not sed or heredocs. `git mv` is fine for the rename.
- Every subagent runs on Sonnet.
- The footer friend renders nothing of its own on the server; the server and the first client render show today's "@" button.
- The footer never imports `me.json`; `footer.json`, `bubble.json` and the pet code stay out of the entry chunk.
- Sizes: desktop (min-width 768px) scale 3, orbit rx 260, ry 100, centre (0, 80), logo 30 px, label 13 px; phone scale 2, rx 150, ry 80, centre (0, 10), logo 20 px, label 12 px, glyph 40 px, a 150 px slot between the stacked hands.
- Orbit: 18 000 ms per turn; fly-out 900 ms (ease-out cubic) with a -2.4 rad spiral, staggered 45 ms; return 420 ms (ease-in cubic), staggered 40 ms; far side when `sin(angle) < -0.15` and reach > 0.6.
- Stacking inside the footer friend: glyph z 2, far bubble z 3, pixel-me z 4, near bubble z 6, focused bubble z 8.
- Twitter is renamed X (label and `https://x.com/0kaliasgar`) in both the card and the bubbles.
- Comments only for facts the code cannot show. Match the surrounding comment density.

## Review Focus

1. Clicking the "@" during the burst and again during the return: the bubbles must come back cleanly and burst again, with no orphan bubble left on screen. Pinned in Task 3 (machine) and checked in Task 6.
2. Navigating to another page with the bubbles open: the next page's footer is idle with no bubbles. Pinned in Task 3 (`reset`) and wired in Task 5.
3. Pressing Esc with focus on a bubble: the bubbles close and focus lands on the "@", not on `<body>`. Wired in Task 5, checked in Task 6.
4. Keyboard Enter on the "@" opens the card; an assistive-tech click with `detail >= 1` opens the burst, whose links are reachable by Tab. Pinned in Task 3 (`activation`).
5. Resizing across 768 px while open: bubbles follow the new layout instead of being stranded at old coordinates. Wired in Task 5 (positions recomputed every tick from the current layout), checked in Task 6.

---

### Task 0: Branch

Executed by the lead.

- [ ] **Step 1:**

```bash
git checkout --no-track -b pixel-friends-phase2 main
```

---

### Task 1: Contact links module, X rename, footer pin

**Files:**
- Create: `src/lib/contact-links.ts`, `src/lib/contact-links.test.ts`, `src/components/site-footer.test.tsx`
- Modify: `src/components/contact-card.tsx`

**Interfaces:**
- Produces: `type ContactId = 'email' | 'x' | 'github' | 'linkedin' | 'huggingface' | 'kofi'`, `type ContactLink = { id: ContactId; name: string; href: string }`, `CONTACT_LINKS: ContactLink[]`, `opensNewTab(l: ContactLink): boolean`.

- [ ] **Step 1: Pin today's footer server render (this test must pass before and after every later task)**

```tsx
// src/components/site-footer.test.tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../i18n'
import { SiteFooter } from './site-footer'

describe('SiteFooter server render', () => {
  it('prerenders the plain "@" button, the hands, the word and the credit', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <SiteFooter />
      </I18nextProvider>,
    )
    expect(html).toContain('aria-label="Get in touch"')
    expect(html).toContain('>@</span>')
    expect(html).toContain('get in touch')
    expect(html).toContain('hand-left.png')
    expect(html).toContain('hand-right.png')
    expect(html).toContain('Creation')
    expect(html).toContain('tab critters by')
    expect(html).not.toContain('footer-bubble')
  })
})
```

Run: `pnpm vitest run src/components/site-footer.test.tsx`
Expected: PASS against today's code. If the module fails to load in node (for example `@paper-design/shaders-react` touching `window` at import), stop and report it; do not change `site-footer.tsx` to make it pass.

- [ ] **Step 2: Write the failing contact-links test**

```ts
// src/lib/contact-links.test.ts
import { describe, expect, it } from 'vitest'
import { CONTACT_LINKS, opensNewTab } from './contact-links'

describe('CONTACT_LINKS', () => {
  it('lists the six links in card order with unique ids', () => {
    expect(CONTACT_LINKS.map((l) => l.id)).toEqual(['email', 'x', 'github', 'linkedin', 'huggingface', 'kofi'])
    expect(new Set(CONTACT_LINKS.map((l) => l.id)).size).toBe(6)
  })

  it('calls Twitter X and points at x.com', () => {
    const x = CONTACT_LINKS.find((l) => l.id === 'x')!
    expect(x).toEqual({ id: 'x', name: 'X', href: 'https://x.com/0kaliasgar' })
  })

  it('opens every link but email in a new tab', () => {
    expect(CONTACT_LINKS.filter(opensNewTab).map((l) => l.id)).toEqual(['x', 'github', 'linkedin', 'huggingface', 'kofi'])
  })
})
```

Run: `pnpm vitest run src/lib/contact-links.test.ts`
Expected: FAIL, cannot resolve `./contact-links`.

- [ ] **Step 3: Write `contact-links.ts`**

```ts
// src/lib/contact-links.ts
export type ContactId = 'email' | 'x' | 'github' | 'linkedin' | 'huggingface' | 'kofi'
export type ContactLink = { id: ContactId; name: string; href: string }

const EMAIL = 'khimanialiasgar@gmail.com'

// Icons live with each consumer: the card's are lottie clips, the footer bubbles' are plain SVG.
export const CONTACT_LINKS: ContactLink[] = [
  { id: 'email', name: 'Email', href: `mailto:${EMAIL}` },
  { id: 'x', name: 'X', href: 'https://x.com/0kaliasgar' },
  { id: 'github', name: 'GitHub', href: 'https://github.com/NovusEdge' },
  { id: 'linkedin', name: 'LinkedIn', href: 'https://www.linkedin.com/in/aliasgarkhimani/' },
  { id: 'huggingface', name: 'Hugging Face', href: 'https://huggingface.co/NovusEdge' },
  { id: 'kofi', name: 'Ko-fi', href: 'https://ko-fi.com/aliasgarkhimani' },
]

export const opensNewTab = (l: ContactLink) => l.id !== 'email'
```

- [ ] **Step 4: Make the card read it**

In `src/components/contact-card.tsx`:
- Remove `const EMAIL = ...`, the `ALL_SOCIALS` array and the `import twitter from 'react-useanimations/lib/twitter'` line.
- Change the simple-icons import to `import { siHuggingface, siKofi, siX } from 'simple-icons'`.
- Add `import { CONTACT_LINKS, opensNewTab, type ContactId } from '../lib/contact-links'`.
- Add, where `ALL_SOCIALS` was:

```tsx
const CARD_ICONS: Record<ContactId, { anim?: unknown; icon?: string }> = {
  email: { anim: mail },
  x: { icon: siX.path },
  github: { anim: github },
  linkedin: { anim: linkedin },
  huggingface: { icon: siHuggingface.path },
  kofi: { icon: siKofi.path },
}
```

- In `ContactOrbit`, replace `ALL_SOCIALS.length` with `CONTACT_LINKS.length` and the map with:

```tsx
      {CONTACT_LINKS.map((s, i) => {
        const angle = ((i / n) * 2 * Math.PI) - Math.PI / 2
        const x = center + radius * Math.cos(angle) - itemSize / 2
        const y = center + radius * Math.sin(angle) - itemSize / 2
        const { anim, icon } = CARD_ICONS[s.id]
        return (
          <a
            key={s.href}
            href={s.href}
            target={opensNewTab(s) ? '_blank' : undefined}
            rel="noopener noreferrer"
            data-orbit
            className="group absolute flex h-14 w-14 items-center justify-center rounded-full border border-bone/15 bg-charcoal/90 transition-all hover:scale-110 hover:border-gold"
            style={{ left: x, top: y }}
            title={s.name}
          >
            {anim ? (
              <UseAnimations animation={anim as never} size={28} strokeColor={ICON} autoplay={false} />
            ) : icon ? (
              <StaticIcon path={icon} size={28} />
            ) : null}
          </a>
        )
      })}
```

- [ ] **Step 5: Run the tests**

Run: `pnpm vitest run src/lib/contact-links.test.ts src/components/site-footer.test.tsx && pnpm exec tsc --noEmit -p .`
Expected: PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/contact-links.ts src/lib/contact-links.test.ts src/components/site-footer.test.tsx src/components/contact-card.tsx
git commit -s -m "Move the contact links into their own module and call Twitter X"
```

---

### Task 2: Footer sprites in the pipeline

**Files:**
- Rename: `tools/sprites/footer-mockups/` to `tools/sprites/footer/`
- Modify: `tools/sprites/export.py`, `src/lib/pet/sprite.ts`, `src/lib/pet/sprite.test.ts`
- Generated: `src/assets/sprites/footer.json`, `src/assets/sprites/bubble.json`

**Interfaces:**
- Produces: `Frame` gains `g?: number; ev?: 'flare' | 'emit'`; `Sprite` gains `anchor?: [number, number]`.
- `footer.json`: `{ w: 48, h: 66, palette, anchor: [24, 7], animations: { levitate: { loop: true, frames }, levitate_burst: { loop: false, frames } } }`. Every `levitate` frame has `g`; `levitate_burst` has exactly one frame with `ev: 'flare'` followed later by exactly one with `ev: 'emit'`.
- `bubble.json`: `{ w: 31, h: 31, palette, animations }` with the nine clips `grow`, `idle`, `pop`, `focus_in`, `focus`, `focus_out`, `recede_in`, `recede`, `recede_out`; `idle`, `focus` and `recede` loop.

- [ ] **Step 1: Rename the folder and check the preview still builds**

```bash
git mv tools/sprites/footer-mockups tools/sprites/footer
cd tools/sprites/footer && python3 build.py
```
Expected: it prints the three concepts' frame counts and writes `index.html`. If a path inside `art.py` or `build.py` pointed at the old folder name, fix it to work from the new location (the `ME` path to `tools/sprites/me` should be relative to the file). Do not change any drawing code. `index.html` and `data.json` are build output: add `tools/sprites/footer/index.html` and `tools/sprites/footer/data.json` to the repo's `.gitignore` if they are not ignored already, and delete `__pycache__` if it got tracked.

- [ ] **Step 2: Write the failing sprite tests**

Append to `src/lib/pet/sprite.test.ts` (keep its existing imports; add any of these that are missing):

```ts
import footerJson from '../../assets/sprites/footer.json'
import bubbleJson from '../../assets/sprites/bubble.json'

describe('footer sprites', () => {
  const footer = footerJson as unknown as Sprite
  const bubble = bubbleJson as unknown as Sprite

  it('validate', () => {
    expect(validateSprite(footer)).toEqual([])
    expect(validateSprite(bubble)).toEqual([])
  })

  it('carry the glyph anchor and the bob on every levitate frame', () => {
    expect(footer.anchor).toEqual([24, 7])
    expect(footer.animations.levitate.loop).toBe(true)
    for (const f of footer.animations.levitate.frames) expect(typeof f.g).toBe('number')
  })

  it('flare before emit, once each, in the burst', () => {
    const evs = footer.animations.levitate_burst.frames.map((f) => f.ev ?? null).filter(Boolean)
    expect(evs).toEqual(['flare', 'emit'])
    expect(footer.animations.levitate_burst.loop).toBe(false)
  })

  it('has the nine bubble clips, looping only the held ones', () => {
    expect(Object.keys(bubble.animations).sort()).toEqual(
      ['focus', 'focus_in', 'focus_out', 'grow', 'idle', 'pop', 'recede', 'recede_in', 'recede_out'],
    )
    const loops = Object.entries(bubble.animations).filter(([, c]) => c.loop).map(([k]) => k).sort()
    expect(loops).toEqual(['focus', 'idle', 'recede'])
  })
})
```

Run: `pnpm vitest run src/lib/pet/sprite.test.ts`
Expected: FAIL, cannot resolve `footer.json`.

- [ ] **Step 3: Extend the types**

In `src/lib/pet/sprite.ts`, change the first line to:

```ts
export type Frame = { ms: number; px: string[]; typing?: boolean; g?: number; ev?: 'flare' | 'emit' }
```

and add `anchor?: [number, number]` to `Sprite` after `h: number`.

- [ ] **Step 4: Export the footer sprites**

In `tools/sprites/export.py`, add above `if __name__ == '__main__':`:

```python
def footer():
    """Pixel-me levitating under the footer's @, and the contact bubbles. The drawing
    code is the approved mockup's, used as is."""
    sys.path.insert(0, os.path.join(ROOT, 'footer'))
    import concepts  # noqa: E402
    import bubbles2  # noqa: E402
    from art import PAL  # noqa: E402

    def frames(seq):
        return [{k: f[k] for k in ('ms', 'px', 'g', 'ev') if k in f} for f in seq]

    me = {
        'w': 48, 'h': 66, 'palette': PAL,
        # where the CSS glyph's centre sits, in sprite px
        'anchor': [concepts.LEV_GLYPH[0], concepts.LEV_GLYPH[1] + concepts.LEV_OY],
        'animations': {
            'levitate': {'loop': True, 'frames': frames(concepts.lev_idle())},
            'levitate_burst': {'loop': False, 'frames': frames(concepts.lev_burst())},
        },
    }
    held = ('idle', 'focus', 'recede')
    bubble = {
        'w': bubbles2.BW, 'h': bubbles2.BH, 'palette': PAL,
        'animations': {k: {'loop': k in held, 'frames': frames(v)} for k, v in bubbles2.clips().items()},
    }
    return me, bubble
```

and in the `__main__` block, after the stoat line:

```python
    fm, fb = footer()
    write('footer.json', fm)
    write('bubble.json', fb)
```

If `PAL` is not a plain `dict[str, str]`, convert it to one (`{k: v for k, v in PAL.items()}`) and say so in the report.

- [ ] **Step 5: Build, export, test**

```bash
cd tools/sprites && python3 export.py && cd ../.. && pnpm vitest run src/lib/pet/sprite.test.ts
```
Expected: PASS. `git diff --stat src/assets/sprites/me.json src/assets/sprites/stoat.json` shows no change.

- [ ] **Step 6: Commit**

```bash
git add -A tools/sprites/footer tools/sprites/footer-mockups tools/sprites/export.py .gitignore src/lib/pet/sprite.ts src/lib/pet/sprite.test.ts src/assets/sprites/footer.json src/assets/sprites/bubble.json
git commit -s -m "Export the levitating pixel-me and the contact bubbles as sprites"
```

---

### Task 3: Orbit and state rules

**Files:**
- Create: `src/lib/pet/orbit.ts`, `src/lib/pet/orbit.test.ts`, `src/lib/pet/footer-machine.ts`, `src/lib/pet/footer-machine.test.ts`

**Interfaces:**
- Consumes: `Frame` (Task 2).
- Produces in `orbit.ts`: constants `TURN_MS`, `FLY_MS`, `RETURN_MS`, `FLY_STAGGER_MS`, `RETURN_STAGGER_MS`, `SPIRAL_RAD`, `FAR_SIN`; `type Mode = 'desk' | 'phone'`; `type Layout = { scale: number; rx: number; ry: number; around: [number, number]; logo: number }`; `LAYOUT: Record<Mode, Layout>`; `type Phase = { kind: 'fly'; t: number } | { kind: 'orbit' } | { kind: 'return'; t: number }`; `orbitAngle(i, n, orbitMs, flyMs: number | null): number`; `reach(p: Phase): number`; `bubbleAt(from: [number, number], l: Layout, ang: number, k: number): { x: number; y: number; far: boolean; ox: number }`; `snap(v: number, s: number): number`; `labelAlign(ox: number, l: Layout, mode: Mode): 'center' | 'start' | 'end'`; `figureCentreY(f: Frame, anchorY: number): number`.
- Produces in `footer-machine.ts`: `type FooterState = 'idle' | 'bursting' | 'open' | 'closing'`; `type FooterEvent = 'toggle' | 'dismiss' | 'reset' | 'burstEnd' | 'closeEnd'`; `footerNext(s, e): FooterState`; `activation(detail: number, reduced: boolean): 'card' | 'burst'`; `type BubbleMode = 'normal' | 'focus' | 'recede'`; `modeFor(i: number, focused: number | null): BubbleMode`; `bubbleQueue(from: BubbleMode, to: BubbleMode): string[]`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/pet/orbit.test.ts
import { describe, expect, it } from 'vitest'
import { bubbleAt, figureCentreY, FLY_MS, labelAlign, LAYOUT, orbitAngle, reach, RETURN_MS, snap, SPIRAL_RAD, TURN_MS } from './orbit'

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 6)

describe('orbitAngle', () => {
  it('starts bubble 0 at the top and spaces six bubbles 60 degrees apart', () => {
    close(orbitAngle(0, 6, 0, null), -Math.PI / 2)
    close(orbitAngle(1, 6, 0, null) - orbitAngle(0, 6, 0, null), Math.PI / 3)
  })

  it('turns once per TURN_MS', () => {
    close(orbitAngle(2, 6, TURN_MS, null) - orbitAngle(2, 6, 0, null), 2 * Math.PI)
  })

  it('spirals in while flying and lands on the orbit angle', () => {
    close(orbitAngle(0, 6, 0, 0) - orbitAngle(0, 6, 0, null), SPIRAL_RAD)
    close(orbitAngle(0, 6, 0, FLY_MS), orbitAngle(0, 6, 0, null))
  })
})

describe('reach', () => {
  it('grows from 0 to 1 over the fly-out, holds in orbit, and falls back to 0 on return', () => {
    expect(reach({ kind: 'fly', t: 0 })).toBe(0)
    expect(reach({ kind: 'fly', t: FLY_MS })).toBe(1)
    expect(reach({ kind: 'orbit' })).toBe(1)
    expect(reach({ kind: 'return', t: 0 })).toBe(1)
    expect(reach({ kind: 'return', t: RETURN_MS })).toBe(0)
  })
})

describe('bubbleAt', () => {
  const desk = LAYOUT.desk
  it('sits on the ellipse around the orbit centre at full reach', () => {
    const p = bubbleAt([0, 0], desk, 0, 1)
    close(p.x, desk.around[0] + desk.rx)
    close(p.y, desk.around[1])
  })

  it('sits at its start point at zero reach', () => {
    const p = bubbleAt([5, -9], desk, 1.2, 0)
    expect([p.x, p.y]).toEqual([5, -9])
  })

  it('is far only above the threshold and once mostly out', () => {
    expect(bubbleAt([0, 0], desk, -Math.PI / 2, 1).far).toBe(true)
    expect(bubbleAt([0, 0], desk, Math.PI / 2, 1).far).toBe(false)
    expect(bubbleAt([0, 0], desk, Math.asin(-0.1), 1).far).toBe(false)
    expect(bubbleAt([0, 0], desk, -Math.PI / 2, 0.5).far).toBe(false)
  })

  it('uses the phone ellipse', () => {
    const p = bubbleAt([0, 0], LAYOUT.phone, Math.PI, 1)
    close(p.x, -150)
    close(p.y, 10)
  })
})

describe('snap and labels', () => {
  it('snaps to the sprite scale', () => {
    expect(snap(7, 3)).toBe(6)
    expect(snap(8, 3)).toBe(9)
  })

  it('keeps labels centred on desktop and turns outer phone labels inward', () => {
    expect(labelAlign(250, LAYOUT.desk, 'desk')).toBe('center')
    expect(labelAlign(40, LAYOUT.phone, 'phone')).toBe('center')
    expect(labelAlign(140, LAYOUT.phone, 'phone')).toBe('end')
    expect(labelAlign(-140, LAYOUT.phone, 'phone')).toBe('start')
  })
})

describe('figureCentreY', () => {
  it('centres the painted rows, counting the glyph space above the head', () => {
    const f = { ms: 1, px: ['....', '.xx.', '.xx.', '....'] }
    expect(figureCentreY(f, 10)).toBe(1.5)
    expect(figureCentreY(f, 5)).toBe((-4 + 3) / 2)
  })
})
```

```ts
// src/lib/pet/footer-machine.test.ts
import { describe, expect, it } from 'vitest'
import { activation, bubbleQueue, footerNext, modeFor, type FooterEvent, type FooterState } from './footer-machine'

describe('footerNext', () => {
  const rows: [FooterState, FooterEvent, FooterState][] = [
    ['idle', 'toggle', 'bursting'],
    ['idle', 'dismiss', 'idle'],
    ['bursting', 'toggle', 'closing'],
    ['bursting', 'dismiss', 'closing'],
    ['bursting', 'burstEnd', 'open'],
    ['open', 'toggle', 'closing'],
    ['open', 'dismiss', 'closing'],
    ['open', 'burstEnd', 'open'],
    ['closing', 'toggle', 'bursting'],
    ['closing', 'dismiss', 'closing'],
    ['closing', 'closeEnd', 'idle'],
    ['idle', 'reset', 'idle'],
    ['bursting', 'reset', 'idle'],
    ['open', 'reset', 'idle'],
    ['closing', 'reset', 'idle'],
  ]
  it.each(rows)('%s + %s -> %s', (s, e, next) => expect(footerNext(s, e)).toBe(next))
})

describe('activation', () => {
  it('sends keyboard clicks and reduced motion to the card, pointer clicks to the burst', () => {
    expect(activation(0, false)).toBe('card')
    expect(activation(1, false)).toBe('burst')
    expect(activation(2, false)).toBe('burst')
    expect(activation(1, true)).toBe('card')
  })
})

describe('bubble focus modes', () => {
  it('focuses one bubble and recedes the rest', () => {
    expect([0, 1, 2].map((i) => modeFor(i, 1))).toEqual(['recede', 'focus', 'recede'])
    expect(modeFor(0, null)).toBe('normal')
  })

  it('plays the leave clip, the enter clip, then the held loop', () => {
    expect(bubbleQueue('normal', 'focus')).toEqual(['focus_in', 'focus'])
    expect(bubbleQueue('focus', 'recede')).toEqual(['focus_out', 'recede_in', 'recede'])
    expect(bubbleQueue('recede', 'normal')).toEqual(['recede_out', 'idle'])
    expect(bubbleQueue('focus', 'focus')).toEqual([])
  })
})
```

Run: `pnpm vitest run src/lib/pet/orbit.test.ts src/lib/pet/footer-machine.test.ts`
Expected: FAIL, cannot resolve the modules.

- [ ] **Step 2: Write `orbit.ts`**

```ts
// src/lib/pet/orbit.ts
import type { Frame } from './sprite'

export const TURN_MS = 18000
export const FLY_MS = 900
export const RETURN_MS = 420
export const FLY_STAGGER_MS = 45
export const RETURN_STAGGER_MS = 40
export const SPIRAL_RAD = -2.4
export const FAR_SIN = -0.15

export type Mode = 'desk' | 'phone'
export type Layout = { scale: number; rx: number; ry: number; around: [number, number]; logo: number }

// CSS px from the footer friend's origin: the glyph on desktop, the figure's centre on phones
export const LAYOUT: Record<Mode, Layout> = {
  desk: { scale: 3, rx: 260, ry: 100, around: [0, 80], logo: 30 },
  phone: { scale: 2, rx: 150, ry: 80, around: [0, 10], logo: 20 },
}

export type Phase = { kind: 'fly'; t: number } | { kind: 'orbit' } | { kind: 'return'; t: number }

const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
const outCubic = (t: number) => 1 - (1 - t) ** 3
const inCubic = (t: number) => t ** 3

export function orbitAngle(i: number, n: number, orbitMs: number, flyMs: number | null) {
  const base = ((-90 + (i * 360) / n) * Math.PI) / 180 + (orbitMs / TURN_MS) * 2 * Math.PI
  return flyMs === null ? base : base + (1 - outCubic(clamp01(flyMs / FLY_MS))) * SPIRAL_RAD
}

export function reach(p: Phase) {
  if (p.kind === 'fly') return outCubic(clamp01(p.t / FLY_MS))
  if (p.kind === 'return') return 1 - inCubic(clamp01(p.t / RETURN_MS))
  return 1
}

export function bubbleAt(from: [number, number], l: Layout, ang: number, k: number) {
  const ox = l.rx * Math.cos(ang)
  const oy = l.ry * Math.sin(ang)
  return {
    x: from[0] + (l.around[0] + ox - from[0]) * k,
    y: from[1] + (l.around[1] + oy - from[1]) * k,
    far: Math.sin(ang) < FAR_SIN && k > 0.6,
    ox,
  }
}

export const snap = (v: number, s: number) => Math.round(v / s) * s

// On a 390 px phone the ellipse's sides leave no room for a centred label.
export function labelAlign(ox: number, l: Layout, mode: Mode): 'center' | 'start' | 'end' {
  if (mode === 'desk' || Math.abs(ox) <= l.rx / 2) return 'center'
  return ox > 0 ? 'end' : 'start'
}

// The glyph floats 9 sprite rows above its anchor, so the phone slot centres on both.
export function figureCentreY(f: Frame, anchorY: number) {
  let top = Infinity
  let bottom = -1
  f.px.forEach((row, y) => {
    if (/[^.]/.test(row)) {
      top = Math.min(top, y)
      bottom = y
    }
  })
  return (Math.min(top, anchorY - 9) + bottom + 1) / 2
}
```

- [ ] **Step 3: Write `footer-machine.ts`**

```ts
// src/lib/pet/footer-machine.ts
export type FooterState = 'idle' | 'bursting' | 'open' | 'closing'
export type FooterEvent = 'toggle' | 'dismiss' | 'reset' | 'burstEnd' | 'closeEnd'

export function footerNext(s: FooterState, e: FooterEvent): FooterState {
  if (e === 'reset') return 'idle'
  switch (s) {
    case 'idle':
      return e === 'toggle' ? 'bursting' : 'idle'
    case 'bursting':
      return e === 'toggle' || e === 'dismiss' ? 'closing' : e === 'burstEnd' ? 'open' : s
    case 'open':
      return e === 'toggle' || e === 'dismiss' ? 'closing' : s
    case 'closing':
      return e === 'toggle' ? 'bursting' : e === 'closeEnd' ? 'idle' : s
  }
}

// A keyboard-activated button click has detail 0; pointers and most assistive tech report 1+.
export const activation = (detail: number, reduced: boolean): 'card' | 'burst' => (reduced || detail === 0 ? 'card' : 'burst')

export type BubbleMode = 'normal' | 'focus' | 'recede'

export const modeFor = (i: number, focused: number | null): BubbleMode =>
  focused === null ? 'normal' : i === focused ? 'focus' : 'recede'

const LEAVE: Record<BubbleMode, string | null> = { normal: null, focus: 'focus_out', recede: 'recede_out' }
const ENTER: Record<BubbleMode, [string | null, string]> = {
  normal: [null, 'idle'],
  focus: ['focus_in', 'focus'],
  recede: ['recede_in', 'recede'],
}

// Size changes are drawn frames, so a mode change plays its clips in order and holds the last.
export function bubbleQueue(from: BubbleMode, to: BubbleMode): string[] {
  if (from === to) return []
  return [LEAVE[from], ENTER[to][0], ENTER[to][1]].filter((c): c is string => c !== null)
}
```

- [ ] **Step 4: Run the tests**

Run: `pnpm vitest run src/lib/pet/orbit.test.ts src/lib/pet/footer-machine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pet/orbit.ts src/lib/pet/orbit.test.ts src/lib/pet/footer-machine.ts src/lib/pet/footer-machine.test.ts
git commit -s -m "Add the orbit and open-close rules for the footer bubbles"
```

---

### Task 4: Shared reduced-motion hook, footer-view store, corner steps away

**Files:**
- Create: `src/lib/pet/reduced-motion.ts`, `src/lib/pet/footer-view.ts`, `src/lib/pet/footer-view.test.ts`
- Modify: `src/components/pet/friends-layer.tsx`

**Interfaces:**
- Produces: `useReducedMotion(): boolean` (moved, behaviour unchanged); `setFooterInView(v: boolean): void`, `footerInView(): boolean`, `useFooterInView(): boolean`.

- [ ] **Step 1: Write the failing store test**

```ts
// src/lib/pet/footer-view.test.ts
import { describe, expect, it } from 'vitest'
import { footerInView, setFooterInView } from './footer-view'

describe('footer-view', () => {
  it('starts out of view and follows the setter', () => {
    expect(footerInView()).toBe(false)
    setFooterInView(true)
    expect(footerInView()).toBe(true)
    setFooterInView(false)
    expect(footerInView()).toBe(false)
  })
})
```

Run: `pnpm vitest run src/lib/pet/footer-view.test.ts`
Expected: FAIL, cannot resolve `./footer-view`.

- [ ] **Step 2: Write the store**

```ts
// src/lib/pet/footer-view.ts
import { useSyncExternalStore } from 'react'

let inView = false
const listeners = new Set<() => void>()

export const footerInView = () => inView

export const setFooterInView = (v: boolean) => {
  if (v === inView) return
  inView = v
  listeners.forEach((l) => l())
}

export const useFooterInView = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => inView,
    () => false,
  )
```

- [ ] **Step 3: Move `useReducedMotion`**

Cut the `useReducedMotion` function out of `src/components/pet/friends-layer.tsx` into a new `src/lib/pet/reduced-motion.ts`, exported, with its imports (`useEffect`, `useState` from react, `prefersReducedMotion` from `'../motion'`). Its body stays exactly as it is. Import it back into `friends-layer.tsx`, and remove imports there that are now unused.

- [ ] **Step 4: Fade the corner pixel-me while the footer friend is in view**

In `friends-layer.tsx`, import `useFooterInView` from `'../../lib/pet/footer-view'`. In `Friends`, add `const away = useFooterInView()`, and wrap the corner element (the `DeskCorner` / `PersonaCorner` conditional, not the `StoatRoamer`) in:

```tsx
        <div className="transition-opacity duration-300" style={{ opacity: away ? 0 : 1 }} inert={away} aria-hidden={away || undefined}>
          {/* existing DeskCorner / PersonaCorner conditional, unchanged */}
        </div>
```

The corner's children are `position: fixed`; an opacity wrapper does not change their containing block.

- [ ] **Step 5: Test and typecheck**

Run: `pnpm vitest run src/lib/pet src/components/pet && pnpm exec tsc --noEmit -p .`
Expected: PASS, no type errors (the existing `friends-layer.test.tsx` still finds nothing rendered on the server).

- [ ] **Step 6: Commit**

```bash
git add src/lib/pet/reduced-motion.ts src/lib/pet/footer-view.ts src/lib/pet/footer-view.test.ts src/components/pet/friends-layer.tsx
git commit -s -m "Let the corner pixel-me step away while the footer one is in view"
```

---

### Task 5: The footer friend

**Files:**
- Create: `src/components/pet/footer-friend.tsx`, `src/components/pet/contact-bubble.tsx`, `src/components/pet/contact-icons.tsx`, `src/components/pet/footer-friend.test.tsx`
- Modify: `src/components/site-footer.tsx`, `src/styles/global.css`, `src/i18n/locales/en.json` (and every other locale via `pnpm i18n:translate`)

**Interfaces:**
- Consumes: `CONTACT_LINKS`, `opensNewTab`, `ContactId` (Task 1); `footer.json`, `bubble.json`, `Frame.g/ev`, `Sprite.anchor` (Task 2); everything in `orbit.ts` and `footer-machine.ts` (Task 3); `useReducedMotion`, `setFooterInView` (Task 4); `usePetPrefs` from `src/lib/pet/prefs-store.ts`; `subscribe` from `src/lib/pet/ticker.ts`; `PixelSprite` from `./pixel-sprite`.
- Produces: `FooterFriend({ plain, onCard }: { plain: ReactNode; onCard: () => void })`.

- [ ] **Step 1: Write the failing server-render test**

```tsx
// src/components/pet/footer-friend.test.tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { FooterFriend } from './footer-friend'

describe('FooterFriend', () => {
  it('renders only the plain button on the server', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <I18nextProvider i18n={i18nFor('en')}>
          <FooterFriend plain={<button>@</button>} onCard={() => {}} />
        </I18nextProvider>
      </MemoryRouter>,
    )
    expect(html).toBe('<button>@</button>')
  })
})
```

Run: `pnpm vitest run src/components/pet/footer-friend.test.tsx`
Expected: FAIL, cannot resolve `./footer-friend`.

- [ ] **Step 2: Add the strings**

In `src/i18n/locales/en.json`, next to the other `footer.*` keys, add:

```json
  "footer.email": "Email",
  "footer.contactLinks": "Contact links",
```

Then run `pnpm i18n:translate` (it reads the Gemini key from `.env`; if it fails for lack of a key, stop and report NEEDS_CONTEXT rather than hand-writing translations), and confirm `pnpm i18n:check` passes.

- [ ] **Step 3: Write the icons**

```tsx
// src/components/pet/contact-icons.tsx
import type { ReactNode } from 'react'
import { siHuggingface, siKofi, siX } from 'simple-icons'
import type { ContactId } from '../../lib/contact-links'

const stroke = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
const solid = (d: string) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d={d} />
  </svg>
)

// Stroke icons in the style of the card's lottie glyphs, which cannot be reused as plain SVG.
export const BUBBLE_ICONS: Record<ContactId, ReactNode> = {
  email: (
    <svg {...stroke}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  x: solid(siX.path),
  github: (
    <svg {...stroke}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),
  linkedin: (
    <svg {...stroke}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  huggingface: solid(siHuggingface.path),
  kofi: solid(siKofi.path),
}
```

- [ ] **Step 4: Write the bubble**

```tsx
// src/components/pet/contact-bubble.tsx
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { bubbleQueue, type BubbleMode } from '../../lib/pet/footer-machine'
import type { Sprite } from '../../lib/pet/sprite'
import { PixelSprite } from './pixel-sprite'

type Props = {
  ref: Ref<HTMLLIElement>
  sprite: Sprite
  scale: number
  logo: number
  href: string
  newTab: boolean
  label: string
  icon: ReactNode
  mode: BubbleMode
  ready: boolean
  focused: boolean
  onEnter: () => void
  onLeave: () => void
  onFocus: () => void
  onBlur: () => void
}

export function ContactBubble({ ref, sprite, scale, logo, href, newTab, label, icon, mode, ready, focused, onEnter, onLeave, onFocus, onBlur }: Props) {
  const [queue, setQueue] = useState(['grow', 'idle'])
  const shown = useRef<BubbleMode>('normal')
  useEffect(() => {
    // size changes wait until the bubble has finished flying out
    if (!ready || shown.current === mode) return
    setQueue(bubbleQueue(shown.current, mode))
    shown.current = mode
  }, [mode, ready])

  return (
    <li ref={ref} className="footer-bubble absolute left-0 top-0" data-ready={ready} data-focus={focused} style={{ visibility: 'hidden' }}>
      <a
        href={href}
        target={newTab ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="relative block outline-none"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <PixelSprite sprite={sprite} clip={queue[0]} scale={scale} className="block" onEnd={() => setQueue((q) => (q.length > 1 ? q.slice(1) : q))} />
        <span className="footer-logo" style={{ width: logo, height: logo }}>
          {icon}
        </span>
        <span className="footer-label">{label}</span>
      </a>
    </li>
  )
}
```

- [ ] **Step 5: Write the footer friend**

```tsx
// src/components/pet/footer-friend.tsx
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import footerJson from '../../assets/sprites/footer.json'
import bubbleJson from '../../assets/sprites/bubble.json'
import { CONTACT_LINKS, opensNewTab } from '../../lib/contact-links'
import { activation, footerNext, modeFor, type FooterEvent, type FooterState } from '../../lib/pet/footer-machine'
import { setFooterInView } from '../../lib/pet/footer-view'
import { bubbleAt, figureCentreY, FLY_MS, FLY_STAGGER_MS, labelAlign, LAYOUT, orbitAngle, reach, RETURN_MS, RETURN_STAGGER_MS, snap, type Mode } from '../../lib/pet/orbit'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import { useReducedMotion } from '../../lib/pet/reduced-motion'
import type { Frame, Sprite } from '../../lib/pet/sprite'
import { subscribe } from '../../lib/pet/ticker'
import { BUBBLE_ICONS } from './contact-icons'
import { ContactBubble } from './contact-bubble'
import { PixelSprite } from './pixel-sprite'

const ME = footerJson as unknown as Sprite
const BUBBLE = bubbleJson as unknown as Sprite
const N = CONTACT_LINKS.length
const DESK_QUERY = '(min-width: 768px)'

type Bub = { phase: 'fly' | 'orbit' | 'return' | 'gone'; age: number; from: [number, number] }

function useMode(): Mode {
  const [desk, setDesk] = useState(() => matchMedia(DESK_QUERY).matches)
  useEffect(() => {
    const m = matchMedia(DESK_QUERY)
    const on = () => setDesk(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return desk ? 'desk' : 'phone'
}

export function FooterFriend({ plain, onCard }: { plain: ReactNode; onCard: () => void }) {
  const [prefs] = usePetPrefs()
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !prefs.on) return <>{plain}</>
  return <Levitate key={String(reduced)} reduced={reduced} onCard={onCard} />
}

function Levitate({ reduced, onCard }: { reduced: boolean; onCard: () => void }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navId = useId()
  const mode = useMode()
  const L = LAYOUT[mode]
  const S = L.scale
  const [ax, anchorY] = ME.anchor!
  const ay = mode === 'desk' ? anchorY : figureCentreY(ME.animations.levitate.frames[0], anchorY)
  const glyphY = (anchorY - ay) * S

  const [state, setState] = useState<FooterState>('idle')
  const send = (e: FooterEvent) => setState((s) => footerNext(s, e))
  const [spawned, setSpawned] = useState(false)
  const [ready, setReady] = useState<boolean[]>(() => CONTACT_LINKS.map(() => false))
  const [focused, setFocused] = useState<number | null>(null)
  const [inView, setInView] = useState(false)

  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const glyph = useRef<HTMLSpanElement>(null)
  const els = useRef<(HTMLLIElement | null)[]>([])
  const bubs = useRef<Bub[]>([])
  const orbitMs = useRef(0)
  const bob = useRef(0)
  const hoverMe = useRef(false)
  const hoverB = useRef<number | null>(null)
  const keyB = useRef<number | null>(null)
  const focusedRef = useRef<number | null>(null)
  const lastFrame = useRef(-1)
  const stateRef = useRef(state)
  stateRef.current = state

  const clip = state === 'bursting' ? 'levitate_burst' : 'levitate'
  useEffect(() => {
    lastFrame.current = -1
  }, [clip])

  const refocus = () => {
    const f = hoverB.current ?? keyB.current
    focusedRef.current = f
    setFocused(f)
  }

  const flare = () => {
    const el = glyph.current
    if (!el) return
    el.classList.remove('footer-flare')
    void el.offsetWidth
    el.classList.add('footer-flare')
  }

  const emit = () => {
    const from: [number, number] = [0, glyphY + bob.current * S]
    bubs.current = CONTACT_LINKS.map(() => ({ phase: 'fly', age: 0, from }))
    orbitMs.current = 0
    setReady(CONTACT_LINKS.map(() => false))
    setSpawned(true)
  }

  const onStep = (_: number, f: Frame) => {
    const frames = ME.animations[clip].frames
    const i = frames.indexOf(f)
    // a long frame gap can skip frames; fire every event passed over
    if (clip === 'levitate_burst') {
      for (let k = lastFrame.current + 1; k <= i; k++) {
        if (frames[k].ev === 'flare') flare()
        if (frames[k].ev === 'emit') emit()
      }
    }
    lastFrame.current = i
    bob.current = f.g ?? 0
    if (glyph.current) glyph.current.style.transform = `translateY(${bob.current * S}px)`
  }

  // side effects of entering each state
  const prev = useRef(state)
  useEffect(() => {
    const from = prev.current
    prev.current = state
    if (state === 'bursting' && from === 'closing') {
      setSpawned(false)
      bubs.current = []
    }
    if (state === 'closing') {
      if (!bubs.current.length) return send('closeEnd')
      for (const b of bubs.current) if (b.phase !== 'gone') Object.assign(b, { phase: 'return', age: 0 })
    }
    if (state === 'idle') {
      const hadFocus = !!root.current?.querySelector('nav')?.contains(document.activeElement)
      setSpawned(false)
      bubs.current = []
      hoverB.current = keyB.current = focusedRef.current = null
      setFocused(null)
      if (hadFocus) button.current?.focus()
    }
  }, [state])

  // one subscription moves every bubble
  useEffect(() => {
    if (!spawned || !inView) return
    return subscribe((dt) => {
      if (hoverMe.current === false && focusedRef.current === null) orbitMs.current += dt
      let live = 0
      bubs.current.forEach((b, i) => {
        const el = els.current[i]
        if (b.phase === 'gone' || !el) return
        live++
        b.age += dt
        const tt = b.age - i * (b.phase === 'return' ? RETURN_STAGGER_MS : FLY_STAGGER_MS)
        if (tt < 0) {
          if (b.phase === 'fly') el.style.visibility = 'hidden'
          return
        }
        el.style.visibility = 'visible'
        const k = reach(b.phase === 'fly' ? { kind: 'fly', t: tt } : b.phase === 'return' ? { kind: 'return', t: tt } : { kind: 'orbit' })
        const p = bubbleAt(b.from, L, orbitAngle(i, N, orbitMs.current, b.phase === 'fly' ? tt : null), k)
        const half = (BUBBLE.w * S) / 2
        el.style.transform = `translate(${snap(p.x - half, S)}px, ${snap(p.y - half, S)}px)`
        el.dataset.far = String(p.far)
        el.dataset.align = labelAlign(p.ox, L, mode)
        if (b.phase === 'fly' && tt >= FLY_MS) {
          b.phase = 'orbit'
          setReady((r) => r.map((v, j) => v || j === i))
        }
        if (b.phase === 'return' && tt >= RETURN_MS) {
          b.phase = 'gone'
          el.style.visibility = 'hidden'
        }
      })
      if (live === 0 && stateRef.current === 'closing') send('closeEnd')
    })
  }, [spawned, inView, L, S, mode])

  // the footer leaving the view, a route change, Esc and clicks outside
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting)
      setFooterInView(e.isIntersecting)
      if (!e.isIntersecting) send('reset')
    })
    io.observe(el)
    return () => {
      io.disconnect()
      setFooterInView(false)
    }
  }, [])

  const firstPath = useRef(true)
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false
      return
    }
    send('reset')
  }, [pathname])

  useEffect(() => {
    if (state === 'idle') return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && send('dismiss')
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && send('dismiss')
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [state])

  const open = state !== 'idle'
  return (
    <div ref={root} className="relative z-10 h-[150px] w-full shrink-0 md:absolute md:left-1/2 md:top-1/2 md:h-0 md:w-0">
      <div className="absolute left-1/2 top-1/2 h-0 w-0" data-focusing={focused !== null}>
        <button
          ref={button}
          type="button"
          onClick={(e) => {
            if (activation(e.detail, reduced) === 'card') {
              send('reset')
              onCard()
            } else send('toggle')
          }}
          aria-label={t('footer.getInTouchLabel')}
          aria-expanded={open}
          aria-controls={spawned ? navId : undefined}
          className="group absolute left-0 top-0 z-[2] font-body font-bold leading-none"
          style={{ fontSize: 20 * S, transform: `translate(-50%, -50%) translateY(${glyphY}px)` }}
        >
          <span ref={glyph} className="inline-block animate-neon text-rose-400 group-hover:animate-none group-hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]">
            @
          </span>
        </button>
        <div
          className="absolute z-[4] cursor-pointer"
          style={{ left: -ax * S, top: -ay * S }}
          onClick={() => (reduced ? onCard() : send('toggle'))}
          onMouseEnter={() => (hoverMe.current = true)}
          onMouseLeave={() => (hoverMe.current = false)}
        >
          <PixelSprite
            sprite={ME}
            clip={clip}
            scale={S}
            playing={!reduced && inView}
            frame={reduced ? 0 : undefined}
            onStep={onStep}
            onEnd={() => send('burstEnd')}
          />
        </div>
        {spawned && (
          <nav id={navId} aria-label={t('footer.contactLinks')}>
            <ul>
              {CONTACT_LINKS.map((l, i) => (
                <ContactBubble
                  key={l.id}
                  ref={(el) => {
                    els.current[i] = el
                  }}
                  sprite={BUBBLE}
                  scale={S}
                  logo={L.logo}
                  href={l.href}
                  newTab={opensNewTab(l)}
                  label={l.id === 'email' ? t('footer.email') : l.name}
                  icon={BUBBLE_ICONS[l.id]}
                  mode={modeFor(i, focused)}
                  ready={ready[i]}
                  focused={focused === i}
                  onEnter={() => {
                    hoverB.current = i
                    refocus()
                  }}
                  // leaving waits a tick so moving straight to the next bubble hands focus over
                  onLeave={() =>
                    setTimeout(() => {
                      if (hoverB.current === i) {
                        hoverB.current = null
                        refocus()
                      }
                    })
                  }
                  onFocus={() => {
                    keyB.current = i
                    refocus()
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      if (keyB.current === i) {
                        keyB.current = null
                        refocus()
                      }
                    })
                  }
                />
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}
```

Notes for the implementer:
- `send('reset')` inside the IntersectionObserver callback and effects is fine: `footerNext` ignores no-op transitions.
- If `tsc` rejects `inert` or the `ref` prop typing, fix the typing without changing behaviour and note it.
- If `react-hooks/exhaustive-deps` lint complains, follow the file's existing pattern (`friends-layer.tsx` uses refs the same way); do not add dependencies that would restart the ticker subscription every render.

- [ ] **Step 6: Add the styles**

Append to `src/styles/global.css`, outside any `@layer` so these win over the `animate-neon` utility:

```css
/* footer friend: the @ flares when pixel-me sends the contact bubbles out */
@keyframes footer-flare {
  0% { filter: drop-shadow(0 0 3px currentColor); color: #fb7185; }
  25% { filter: drop-shadow(0 0 14px currentColor) drop-shadow(0 0 4px #fff); color: #ffe4e6; }
  100% { filter: drop-shadow(0 0 3px currentColor); color: #fb7185; }
}
.footer-flare { animation: footer-flare 0.5s ease-out; }

.footer-bubble { z-index: 6; }
.footer-bubble[data-far='true'] { z-index: 3; }
.footer-bubble canvas { display: block; transition: opacity 0.18s ease; }
/* depth dims the bubble, never the label */
.footer-bubble[data-far='true'] canvas,
.footer-bubble[data-far='true'] .footer-logo { opacity: 0.5; }
.footer-logo {
  position: absolute; left: 50%; top: 50%; display: block; pointer-events: none; color: #e8e4da;
  transform: translate(-50%, -50%) scale(1); transition: transform 0.18s ease, color 0.18s ease;
}
.footer-logo svg { display: block; width: 100%; height: 100%; }
.footer-label {
  position: absolute; left: 50%; top: calc(100% - 4px); transform: translateX(-50%);
  white-space: nowrap; pointer-events: none; opacity: 0;
  font: 500 13px/1 var(--font-mono); letter-spacing: 0.02em; color: #f5f2eb;
  background: #141414; border: 1px solid #f5f2eb24; border-radius: 999px; padding: 4px 8px 5px;
  transition: opacity 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}
.footer-bubble[data-align='end'] .footer-label { left: auto; right: 0; transform: none; }
.footer-bubble[data-align='start'] .footer-label { left: 0; transform: none; }
@media (max-width: 767px) {
  .footer-label { font-size: 12px; padding: 3px 7px 4px; }
}
.footer-bubble[data-ready='true'] .footer-label { opacity: 1; }
[data-focusing='true'] .footer-bubble canvas,
[data-focusing='true'] .footer-logo { opacity: 0.35; }
[data-focusing='true'] .footer-logo { transform: translate(-50%, -50%) scale(0.9); }
[data-focusing='true'] .footer-bubble[data-ready='true'] .footer-label { opacity: 0.45; }
[data-focusing='true'] .footer-bubble[data-focus='true'] { z-index: 8; }
[data-focusing='true'] .footer-bubble[data-focus='true'] canvas,
[data-focusing='true'] .footer-bubble[data-focus='true'] .footer-logo { opacity: 1; }
[data-focusing='true'] .footer-bubble[data-focus='true'] .footer-logo { transform: translate(-50%, -50%) scale(1.2); color: #fb7185; }
[data-focusing='true'] .footer-bubble[data-focus='true'] .footer-label { opacity: 1; color: #fb7185; border-color: #fb718599; }
```

Check that `--font-mono` is the variable the site's `font-mono` utility uses (grep `global.css`); use the real name.

- [ ] **Step 7: Mount it in the footer**

In `src/components/site-footer.tsx`:
- Change the first import to include `useCallback`.
- Below the `ContactCard` lazy line add:

```tsx
// the pet chunk and the footer sprites load after hydration, never with the page
const FooterFriend = lazy(() => import('./pet/footer-friend').then((m) => ({ default: m.FooterFriend })))
```

- In `SiteFooter`, add `const openCard = useCallback(() => setOpen(true), [])`, and move the existing `<button ...>...</button>` (with both spans, unchanged except `onClick={openCard}`) into a constant `const at = (...)` above the `return`.
- Replace the button's place in the JSX with:

```tsx
        <Suspense fallback={at}>
          <FooterFriend plain={at} onCard={openCard} />
        </Suspense>
```

- [ ] **Step 8: Test, typecheck, build**

Run: `pnpm vitest run src/components/pet/footer-friend.test.tsx src/components/site-footer.test.tsx && pnpm test && pnpm run build`
Expected: all pass. The site-footer pin from Task 1 passes unchanged.

- [ ] **Step 9: Commit**

```bash
git add src/components/pet/footer-friend.tsx src/components/pet/contact-bubble.tsx src/components/pet/contact-icons.tsx src/components/pet/footer-friend.test.tsx src/components/site-footer.tsx src/styles/global.css src/i18n
git commit -s -m "Float pixel-me under the footer @ and send the contact links out as bubbles"
```

---

### Task 6: Bundle check, browser check, review

Executed by the lead with the client.

- [ ] **Step 1: The footer sprites stay out of the entry chunk**

```bash
pnpm run build
entry=$(grep -o 'assets/index-[^"]*\.js' dist/index.html | head -1)
grep -c 'levitate_burst' "dist/$entry"
grep -l 'levitate_burst' dist/assets/*.js
```
Expected: the count is `0`, and `levitate_burst` appears only in a non-entry chunk.

- [ ] **Step 2: Browser check in Chromium at 1440 and 390 px**

Show the client, playing: idle levitate under the "@"; a click bursting the bubbles; hover focus and Tab focus through all six; Esc with focus on a bubble (focus lands on the "@"); a click outside; clicking during the burst and again during the return (Review Focus 1); navigating with the bubbles open (Review Focus 2); resizing across 768 px while open (Review Focus 5); Enter on the "@" opening the card; the corner pixel-me fading out at the footer and back when scrolling up; pixel friends off (today's footer); reduced motion (still frame, card on click). Check phone labels stay inside 390 px.

- [ ] **Step 3: Final review and merge**

Dispatch a Sonnet reviewer over the whole branch against the spec. Fix findings, run `pnpm test && pnpm run build`, then merge to main with `git merge --no-ff` and push after the client says so.
