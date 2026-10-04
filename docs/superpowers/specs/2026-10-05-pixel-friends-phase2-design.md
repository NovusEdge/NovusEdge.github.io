# Pixel friends, phase 2: the footer "@"

Date: 2026-10-05. Status: revised after an Opus review; awaiting the client's written review.

Builds on the phase 1 and phase 3 specs (`2026-10-04-pixel-friends-phase1-design.md`, `2026-10-04-pixel-friends-phase3-design.md`). Everything there holds unless this spec says otherwise. Phase 1 said the bubbles would replace the contact card; this spec keeps the card as the fallback.

The client picked the "Levitate" concept from three Opus mockups and approved a second round with hover focus, readable labels and vector logos. The mockup sources live in `tools/sprites/footer/` (named `footer-mockups/` until the implementation renames it): `python3 build.py` regenerates `index.html`, which plays every concept in a recreated footer at 1440 and 390 px. Levitate is `concepts.py` (pixel-me) plus `bubbles2.py` (the bubble body), and `index.tpl.html` holds the motion and focus logic this spec quotes. Judge the art from that page playing, not from the PNGs in `out/`.

## What it looks like

Pixel-me sits cross-legged, palms up, levitating between the footer's two dithered hands, under the existing neon "@" glyph. The glyph stays the site's real text glyph and bobs with him.

Clicking opens a burst: the "@" flares and six bubbles spiral out into an elliptical orbit around pixel-me. Each bubble has a pixel-art body, a vector brand logo inside, and a real HTML text label beside it. The orbit takes 18 s per turn. Bubbles behind pixel-me dim, and every bubble sits above the "@", so a bubble can briefly cover the glyph (approved).

While the footer friend is on screen, the corner pixel-me and his desk (or persona corner) fade out, and come back when the footer leaves the view (client). The stoat keeps roaming.

## Sizes

All numbers come from the approved mockup. "Art px" are sprite pixels; CSS px are art px times the scale.

| | Desktop (md and up) | Phone (below md) |
|---|---|---|
| Pixel-me scale | 3x | 2x |
| "@" glyph | today's `text-6xl` | 40 px |
| Orbit ellipse rx, ry (CSS px) | 260, 100 | 150, 80 |
| Orbit centre offset from pixel-me (x, y CSS px) | 0, 80 | 0, 10 |
| Bubble body | 31 x 31 art px, drawn at the pixel-me scale | same |
| Logo inside a bubble | 30 px | 20 px |
| Label | 13 px mono | 12 px mono |

The burst's spiral runs 900 ms and sweeps -2.4 rad into the orbit. On phones the ellipse plus a bubble and its label is wider than 390 px, so labels on the outer half of the ellipse flip to the inner side of their bubble. Check at 390 px that no label leaves the viewport.

The phone footer grows by about 90 px after hydration to fit pixel-me between the stacked hands. The shift is accepted: it happens at the very bottom of the page, before a visitor scrolls there (client).

## When it shows

| Condition | Footer |
|---|---|
| Pixel friends on, no reduced motion | pixel-me levitates under the "@" |
| Pixel friends off | today's footer: the "@" and the contact card |
| Reduced motion on | pixel-me on the idle loop's first frame, no bob, no flare; opening uses the card |

## Opening, closing, and the state machine

The "@" button decides by how it was activated: a click with `e.detail === 0` came from the keyboard (Enter or Space) and opens the contact card; any other click opens the burst. Under reduced motion every activation opens the card. Assistive tech that synthesises a click with `detail >= 1` lands in the burst, which is why the burst has the accessibility rules below.

| State | Event | Result |
|---|---|---|
| idle | pointer click on the "@" or on pixel-me | bursting |
| idle | keyboard activation, or any activation under reduced motion | contact card opens; stays idle |
| bursting | click on the "@" or pixel-me, Esc, click outside | closing |
| open | click on the "@" or pixel-me, Esc, click outside | closing |
| closing | click on the "@" or pixel-me | cancel the return, bursting again |
| bursting, open, closing | route change, pixel friends turned off, reduced motion turned on | idle at once, no animation |
| bursting, open | footer leaves the view | idle at once, no animation |
| bursting | spiral finishes | open |
| closing | last bubble reaches the "@" | idle |

"Click outside" means a `pointerdown` outside the `FooterFriend` container. The hands are outside it. Closing is code-driven, as in the mockup: each bubble tweens back to the glyph over 420 ms (ease-in cubic), staggered 40 ms. Pixel-me stays on his idle loop throughout; there is no closing clip.

## Accessibility of the burst

- The "@" button carries `aria-expanded` for the burst and keeps its accessible name.
- The bubbles are a list in a `<nav>` with a translated `aria-label`, placed right after the button in DOM order, so Tab reaches them next.
- Bubbles are unmounted while the burst is idle, not just hidden.
- Esc closes the burst. If focus was on a bubble when it closes, focus returns to the "@".
- Each bubble is an `<a href>` whose text is its label.

## Focus

Pointing at a bubble or tabbing to it pauses the orbit, and hovering pixel-me pauses it too. The focused bubble plays its focus clips: it grows by 2 art px (radius 11 to 13) over drawn frames about 40 ms each, gets a white rim, and its logo scales 1.2x and turns rose. The other five play their recede clips, shrinking 1 art px and fading to 35%. Leaving a bubble waits one tick before releasing focus, so moving straight to the next bubble hands focus over without the ring snapping back. Leaving all bubbles restores them and resumes the orbit.

Bubble clips, ported from `bubbles2.py`: `grow`, `idle` (a wobble), `pop`, `focus_in`, `focus`, `focus_out`, `recede_in`, `recede`, `recede_out`. The enter and leave sequence follows `index.tpl.html` (the focus handler around lines 361 to 373).

## Stacking

All layers render inside the existing hands container (`relative z-10` in `site-footer.tsx`), which is one stacking context. From the bottom up:

1. the "@" glyph
2. far-side bubbles
3. pixel-me
4. near-side bubbles
5. the focused bubble

A bubble is far-side when `sin(angle) < -0.15` and its fly-out is past 60%. Far-side is measured against pixel-me, not against the "@".

## The "@" glyph

- The bob comes from each idle frame's `g` value and moves an inner `<span>`, so the button's centring transforms stay as they are.
- The flare is the mockup's 0.5 s `flare` keyframe, triggered by the burst clip's `flare` event. It does not run under reduced motion.
- The "Get in touch" hover label under the "@" is hidden while the footer friend is present, since pixel-me sits there.
- The scroll-driven hand movement (`handOffset`) stays.

## Labels and logos

- Labels come from `src/lib/contact-links.ts`. Brand names stay untranslated. "Email" and the bubble list's `aria-label` go through `t()`, and translate-ui is rerun for the new keys.
- Twitter is renamed X, in both the card and the bubbles (client).
- Hugging Face and Ko-fi use the exact simple-icons paths the card uses. Email, X, GitHub and LinkedIn use stroke icons in the style of the card's animated ones, since the card's own icons are lottie animations. The icons live with the bubbles, not in `contact-links.ts`.

## Architecture

- `src/lib/contact-links.ts` (new) holds the six links as `{ id, name, href }`. The card maps each id to its lottie clip or simple-icon and the bubbles map it to a vector icon, so the card's lazy imports stay out of the footer.
- `src/components/pet/footer-friend.tsx` (new): `FooterFriend` is loaded with `lazy()`, the same way `FriendsLayer` is, so the footer sprites and the pet code never reach the main bundle. It renders `null` on the server and until mounted, reads `usePetPrefs` and the reduced-motion hook, draws pixel-me with `PixelSprite`, and owns the state machine and focus state.
- `src/lib/pet/reduced-motion.ts` (new): the `useReducedMotion` hook moves here from `friends-layer.tsx` and is exported for both layers.
- `src/lib/pet/orbit.ts` (new): a pure function from time, bubble index, bubble count, the ellipse and the fly-out progress to a bubble's position and its far-side flag.
- `src/lib/pet/footer-view.ts` (new): a small store that `FooterFriend` sets from its own IntersectionObserver. `FriendsLayer` reads it to fade the corner pixel-me out while the footer friend is in view.
- Performance: while the footer is out of view, `FooterFriend` unsubscribes the sprite and the orbit from the ticker. One ticker subscription drives all six bubbles, they move by `transform` only, and their positions snap to the sprite scale, as in the mockup.

## Sprite pipeline

- `tools/sprites/footer-mockups/` is renamed `tools/sprites/footer/` and becomes the art's source of truth: the approved drawing code is used as is, not ported. `export.py` gains a footer step that writes two new sprites: `src/assets/sprites/footer.json` (pixel-me's `levitate` loop and `levitate_burst` one-shot from `concepts.py`, 48 x 66 art px, plus the glyph anchor) and `src/assets/sprites/bubble.json` (the nine clips from `bubbles2.py`). The footer never loads `me.json`.
- Each frame carries two extra fields the code needs: `g` (the "@" bob in art px) and `ev` (`'flare'` or `'emit'`, the moments the glyph flares and the bubbles leave). `export.py` copies both, and the `Frame` type in `src/lib/pet/sprite.ts` gains them as optional fields; `Sprite` gains an optional `anchor`.
- Art follows the earlier phases: true in-betweens at 40 to 60 ms per motion frame, slow loops at 1.75x, short one-shots at 1x with extra in-betweens. No hair tuck.
- The art is already approved, so the export lands first and the code builds on the real sprites.

## Testing

- Before any change, a test pins `SiteFooter`'s server render (key substrings), so "the prerendered footer does not change" has something to check.
- `orbit.ts`: positions around a turn, even spacing for six bubbles, the `sin < -0.15` far-side threshold, and both ellipses.
- The "@" branch: `detail === 0` opens the card, `detail >= 1` opens the burst, reduced motion always opens the card.
- The state machine: every row of the table above.
- Bubbles are absent from the server render and from the DOM while idle.
- The card and the bubbles render the same links in the same order from `contact-links.ts`.
- `FooterFriend` renders nothing on the server.
- Sprite tests cover the new clips, the `g`/`ev` fields and `bubble.json`.
- A build check that the footer sprites are not in the entry chunk.
- Browser check at 1440 and 390 px: idle, burst, hover focus, Tab through all six, Esc and click-outside close, the corner pixel-me fading out at the footer, pixel friends off, reduced motion.
