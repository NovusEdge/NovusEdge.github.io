# Pixel friends, phase 3: per-route personas

Date: 2026-10-04. Status: approved in conversation, awaiting written review.

Builds on `2026-10-04-pixel-friends-phase1-design.md`. Everything there holds unless this spec says otherwise.

## Personas

| Persona | Where | Pixel-me | Stoat |
|---|---|---|---|
| `desk` | every route not listed below | phase 1 corner desk, bottom-left, gets up and walks | roams |
| `desk-right` | `/portfolio` and its detail pages | the desk mirrored into the bottom-right corner, walks left | roams |
| `thinking` | blog posts whose English frontmatter has `pixel: thinking` | sits on the floor in the bottom-left corner, chin in hand; never gets up | absent |
| `scientist` | `/research` | stands in the bottom-left corner in a lab coat with a clipboard; never walks | roams |

Thinking and scientist are ambient loops. They do not react to scrolling or reading: the special posts run their own effects and the sprite should stay out of their way.

## Choosing the persona

`personaFor(pathname): Persona` in `src/lib/pet/persona.ts` is the only place routes map to personas.

- It strips the locale prefix (`/de/blog/x` reads as `/blog/x`).
- For `/blog/:slug` it looks the slug up in `posts` from `src/lib/posts.ts`. English posts are loaded eagerly there, so the lookup is synchronous and needs no extra fetch. Only the English frontmatter counts, the same rule `draft` already follows; translations inherit it.
- `parsePost` gains `pixel?: string`. The value names a persona, so a later post can ask for `scientist` with no new code. An unknown value falls back to `desk`.
- Unknown slugs and drafts filtered out of production fall back to `desk`.

`Friends` in `friends-layer.tsx` calls `personaFor` on every `pathname` change and passes the result down.

## Switching on navigation

- Entering a `thinking` route: the stoat bounds off the nearest screen edge and stays away until a route with a stoat. Under reduced motion it disappears without the bound.
- Leaving it: the stoat bounds back in from the nearest edge, which reuses the existing route-change `go`.
- Pixel-me snaps to the new persona. A walk in progress is dropped; there is no transition clip.
- The desk's get-up-and-walk timer runs only in `desk` and `desk-right`.
- Fixed-place stoats (404, loader, post sign-off) keep claiming the stage as in phase 1. On a thinking post the sign-off stoat does not appear, since that post has no stoat.

## /portfolio: corner swap

The desk moving bottom-right collides with the accessibility button. At the browser check the client chose to swap sides: on `desk-right` routes the accessibility button moves to the bottom-left, and the paw button and the pet panel move to the bottom-right with the desk. The alternative, lifting the accessibility button above the desk, was dropped.

The sides come from `deskSide` and `a11ySide` in `src/lib/pet/corners.ts`. The friends layer, the accessibility panel and the pet panel all read them, so they cannot disagree.

The mirrored desk is the phase 1 desk drawn with `flip`. The laptop's scrolling code then reads backwards. The client accepted the mirrored laptop text at the check, so the laptop screen frames were not redrawn.

## Unchanged from phase 1

- Clicking pixel-me opens the pet panel in every persona, through the same focusable handle. The handle's hit area follows the persona's painted rows.
- The off switch and paw button work as now.
- Reduced motion shows frame 0 of the active persona.
- Phones get every persona at 1x.
- The layer renders nothing on the server and mounts outside `.page-enter`.

## Art

Pixel-me keeps the approved look: long black hair behind the back, beard, light skin, sweater. Clips are drawn at the desk clips' height, with true in-betweens at 40 to 60 ms per motion frame and longer holds where they read better. Slow loops use the 1.75x tempo from phase 1; short busy one-shots keep 1x and get extra in-betweens instead.

| Batch | Clip | Kind | Content |
|---|---|---|---|
| 1 | `think` | loop | floor-sit, chin in hand; a thought bubble rises and fills with "..." one dot at a time, then fades; blink and chin-tap beats |
| 1 | `think_q` | one-shot | a "?" in the same thought-bubble style pops and fades; played from the loop at random |
| 1 | `desk` | loop | the hair-tuck beat is removed (client, 2026-10-05); no clip has one |
| 2 | `lab` | loop | standing, lab coat, goggles pushed up, clipboard; writing and pen-tap beats |
| 2 | `lab_squint` | one-shot | holds the clipboard up, squints, goggles down and back up; played at random |
| 2 if needed | desk laptop screen | frames | readable code on the mirrored desk |

Art agents run on Sonnet. Each batch is shown to the client playing in a Chromium window before it is accepted.

## Testing

- `personaFor`: each listed route, locale prefixes, a post with and without `pixel: thinking`, an unknown `pixel` value, an unknown slug, a translated post following the English flag.
- Reducers: no walking in `thinking` or `scientist`; the stoat leaves on a thinking route and returns after; a mid-walk persona change snaps.
- Sprite JSON tests cover the new clips' frame sizes and palette letters.
- The existing prerender test still finds nothing rendered on the server.
- Browser check at 1440 and 390 px: a thinking post, `/research`, `/portfolio` with options A and B side by side, reduced motion, and the panel opening from each persona.

## Known minor gaps

Found in review and judged safe to ship (2026-10-05). None changes behaviour a visitor would notice today; each says when it would start to matter.

Stoat brain (`src/lib/pet/pet-brain.ts`):

- `tick` skips the x clamp whenever the stoat has a target, so the code relies on every resting mode clearing `target`. True today (`step` arrival and `desk_nap` set it to `null`); no test pins it. A new resting mode that keeps a target would let the stoat drift off-screen on resize.
- Resizing the window mid-walk leaves `dir` stale, so the stoat snaps to its clamped target on the next step instead of walking there.
- Widening the window while the stoat leaves to the right leaves its exit target at the old `width + off`, which can be on screen: it stops visibly, then vanishes.
- Under reduced motion, `return` parks the stoat but leaves `home` and `lastInput` from before it left. Harmless while a parked stoat ignores everything but ticks.
- `stoatRoom()` is called twice in the friends layer's `[pathname]` effect. Cheap and pure.

Corners and sprites:

- `PersonaCorner` sizes its box and hit area from the loop clip only. Fine while each beat matches its loop (`think_q` 34x47, `lab_squint` 34x49); a larger beat would paint outside the box.
- `PersonaCorner`'s beat cut-in, return to the loop and reduced-motion frame are covered only by the browser check, not by tests.
- The desk reads the viewport width during render. Safe only because the layer mounts after hydration.
- The napping stoat is mirrored along with the right-hand desk. The client accepted the look.

Tests and process:

- The me-brain reduced-motion `reset` test passed before `reset` existed; it guards the early return for `still`, not the new case.
- The `hitTop` test for the think clip mentions the desk's clear rows in its title but never reads `CLEAR_ROWS`.
- The lift option's class literals were tied to `DESK_LIFT_PX` only by a comment. Moot: lift was deleted.
- One batch of pet-brain tests was appended with a shell heredoc instead of the edit tools. No code consequence.
