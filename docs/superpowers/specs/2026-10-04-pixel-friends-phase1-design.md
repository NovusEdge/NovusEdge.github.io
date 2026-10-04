# Pixel friends, phase 1: the stoat and the corner desk

Date: 2026-10-04. Status: approved in conversation, awaiting written review.

Supersedes `2026-10-04-pixel-pets-design.md` for everything about the resident pet. The client replaced the cat with the stoat and moved pixel-me off `/about` into a fixed corner desk. Engine pieces from the first plan carry over unchanged unless this spec says otherwise.

## Phases

| Phase | Scope |
|---|---|
| 1 (this spec) | The stoat as the resident pet, pixel-me at a bottom-left corner desk who sometimes walks, click-yourself settings, the stoat's 404 / loader / sign-off moments |
| 2 | Footer: pixel-me floating between the hands, arms spread, holding the "@"; clicking bursts the contact links out as pixel bubbles, replacing the contact card |
| 3 | Per-route personas: a thinking pose in a corner on special blog posts (no stoat), a scientist on `/research`, the desk bottom-right on `/portfolio` |

Phases 2 and 3 get their own specs.

## Cast and layout

A fixed layer on the bottom edge of every page, mounted beside `<AccessibilityPanel />` outside `.page-enter` (its transform breaks `position: fixed`).

| Piece | Where | Scale |
|---|---|---|
| Desk scene: pixel-me, laptop with scrolling code, neural net above | bottom-left corner | 2x; 1x below 640 px viewport width |
| Stoat | roams the full width of the bottom edge | 2x |

- The accessibility button moves from the bottom-left to the bottom-right. The pet layer sits under every button (`z-30` against `z-50`).
- The inline desk on `/about` is removed; the corner desk replaces it.
- If the 1x desk still crowds text at 390 px in the visual check, phones get no desk. That is a one-line switch, decided at the check.

## The stoat

The stoat sprite is 32x20 with `summer` and `winter` palettes. The coat follows the season: winter white November through March, summer brown otherwise. There is no coat setting.

### Behavior

The cat's reducer becomes a generic pet reducer (`pet-brain.ts`); only the clip mapping changes.

| Trigger | Stoat does |
|---|---|
| Page untouched | sit, then groom (~20 s), curl (~40 s), sleep (~60 s); sometimes naps on the desk instead |
| Cursor within ~200 px | periscope toward the cursor |
| Hover | startle (hop back, fur puffed) |
| Click | pounce hop or peek, at random; about 1 in 5 ignored |
| Route change or scroll | bounds to a new spot (bound is its walk and run) |
| Pixel-me walks | sometimes follows, then returns to what it was doing |
| Rare, random | zoomies: bounds the full width and back |

Napping on the desk uses the desk's slot `[64, 17, 32, 20]` in desk pixels, which is exactly the stoat's size.

### Micro-moments

Fixed-place stoats claim the stage, which hides the roaming stoat, so there is never more than one.

| Where | Clip |
|---|---|
| 404 page | confused, loop, with a bobbing "?" |
| Post loader (`Suspense` fallback) | chase_tail, loop |
| End of a blog post | happy, loop, with a small heart |

## Pixel-me at the desk

- Mostly at the desk: the existing 42-frame desk clip (typing, sip, beard, hair beats) with the neural net following its `typing` frames.
- Every 1 to 3 minutes, a chance to get up, walk along the bottom edge for a short distance, and come back. The stoat sometimes follows.
- While pixel-me is away the desk shows an empty chair.

## Settings

- Clicking pixel-me opens the pet panel. It has one switch: "Pixel friends: on / off". The separate pet button goes away.
- A hover hint near the desk and a keyboard-focusable handle keep the panel discoverable.
- When pixel friends are off, a small paw button stays in the bottom-left to turn them back on.
- Storage stays `localStorage` key `pet-prefs` inside try/catch. Old saved values with `cat: false` read as off.

## Motion and accessibility

- Reduced motion (`prefersReducedMotion()`): the desk shows a still frame, the stoat starts parked asleep, nothing wanders, and pixel-me never gets up.
- Sprites are decorative: `aria-hidden`, not focusable. The panel handle is the one focusable piece.
- The layer renders nothing on the server, so prerendered HTML does not change.

## Art

Every clip is hand-keyed by an Opus pixel-artist agent, with true in-between drawings at 40 to 60 ms per motion frame (holds may be longer). No interpolated midpoints left as seeded. Each clip is shown to the client playing in a Chromium window, in both coats where they apply, before it is accepted.

| Sprite | Existing, approved | New in phase 1 |
|---|---|---|
| Stoat (32x20) | bound, periscope, peek | sit, sit_down, groom, curl, sleep, wake, startle, pounce, chase_tail, confused, happy |
| Pixel-me | desk (42 frames), walk (16 frames) | stand_up and sit_down at the desk, desk_empty (desk and chair without pixel-me); walk re-timed if it reads choppy next to the stoat |

## Removed

- All cat art, the coat setting, and the planned stoat-visit code. The cat art stays in git history; the visit work is parked on branch `pixel-pets-parked`.

## Testing

- Unit tests for the pet reducer with the stoat clip mapping: the idle chain, reduced-motion start, viewport clamping.
- Unit tests for pixel-me's desk/walk state: never leaves under reduced motion; returns to the desk.
- Sprite JSON tests for every sprite: frame sizes and palette letters.
- Prerender test: the layer renders nothing on the server.
- Browser check at 1440 and 390 px: desk corner, roaming stoat, 404, a post end, reduced motion, panel open from clicking pixel-me.
