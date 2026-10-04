# Pixel friends, phase 2: the footer "@"

Date: 2026-10-05. Status: design approved in conversation, awaiting written review.

Builds on the phase 1 and phase 3 specs (`2026-10-04-pixel-friends-phase1-design.md`, `2026-10-04-pixel-friends-phase3-design.md`). Everything there holds unless this spec says otherwise.

The client picked the "Levitate" concept from three Opus mockups and approved a second round with hover focus, readable labels and vector logos. The mockup sources live in `tools/sprites/footer-mockups/` (`python3 build.py` regenerates `index.html`); the approved one is `concepts.py`'s Levitate plus `bubbles2.py`, previewed in `out/lev_idle.png`, `out/lev_burst.png` and `out/bubbles.png`.

## What it looks like

Pixel-me sits cross-legged, palms up, levitating between the footer's two dithered hands, under the existing neon "@" glyph. The glyph stays the site's real text glyph, not pixel art.

Clicking opens a burst: the "@" flares and six bubbles spiral out into an orbit around pixel-me. Each bubble has a pixel-art body, a vector brand logo inside, and a real HTML text label beside it. The orbit takes 18 s per turn. Bubbles on the far side of the orbit dim, and the "@" sits behind them, so a far-side bubble can briefly cover the glyph (approved).

## When it shows

| Condition | Footer |
|---|---|
| Pixel friends on, no reduced motion | pixel-me levitates under the "@" |
| Pixel friends off | the footer as it is today: the "@" and the contact card |
| Reduced motion | pixel-me shown on the first frame of the idle loop; opening uses the card |

The layer renders nothing on the server. The prerendered footer is today's footer, and pixel-me appears after hydration.

## Opening and closing

| Trigger | Result |
|---|---|
| Pointer click on the "@" or on pixel-me | the burst and the orbit |
| Enter or Space on the focused "@" | the contact card, as today |
| Any trigger under reduced motion | the contact card |
| Esc, a click outside, or clicking the "@" again | the bubbles fly back into the "@" (`levitate_close`), then the idle loop resumes |

The contact card stays as the accessible fallback (client, 2026-10-05).

## Focus

Pointing at a bubble or tabbing to it pauses the orbit. The focused bubble grows by 2 px in drawn frames (about 40 ms each) with a white rim, and its logo scales 1.2x and turns rose. The other five shrink by 1 px and fade to 35%. Moving straight from one bubble to the next hands focus over without the ring snapping back. Leaving all bubbles restores them and resumes the orbit.

Each bubble is a real link (`<a href>` with its label as text), so Tab moves through them in list order, and they are reachable once the burst is open.

## Labels and logos

- Labels are HTML text in the site's mono font: 13 px on desktop and 12 px on phones, bone on a dark pill, rose when focused. Far-side bubbles dim but their labels stay at full contrast.
- Hugging Face and Ko-fi use the exact simple-icons paths the contact card uses. Email, Twitter, GitHub and LinkedIn use stroke icons in the style of the card's animated ones, since the card's own icons are lottie animations.

## Phones

Pixel-me sits between the stacked hands at 1x. That needs a 150 px slot where today only the 60 px "@" sits, so the footer grows by about 90 px on phones. The "@" shrinks to 40 px there to keep its gap above his head. The orbit radius shrinks to fit 390 px.

## Architecture

- `src/components/contact-card.tsx` exports its link list. The card and the bubbles both read it, so a new link appears in both.
- `src/components/pet/footer-friend.tsx` (new): `FooterFriend` mounts inside `SiteFooter` around the "@" button. It renders `null` on the server and until mounted, reads the pixel friends preference (`usePetPrefs`) and reduced motion, draws pixel-me with `PixelSprite`, and owns the open, focused and paused state.
- `src/lib/pet/orbit.ts` (new): a pure function from time, bubble index, bubble count and radius to a bubble's position and whether it is on the far side. Far side drives the dimming and the stacking order against the "@".
- Art goes through the existing pipeline in `tools/sprites/me/`: new clips `levitate` (loop), `levitate_burst` and `levitate_close` (one-shots), ported from the mockup scripts and built with `build.py`, exported with `export.py`, and shown playing in Chromium before acceptance. The bubble body (idle, grown and shrunk rims) is its own small sprite. The hair tuck never appears.
- Timing follows the earlier phases: true in-betweens at 40 to 60 ms per motion frame, slow loops at 1.75x, short one-shots at 1x with extra in-betweens. The mockup's idle loop runs about 1.6 s after the 1.75x tempo.
- `SiteFooter` keeps its current markup when the layer is absent, so the prerendered HTML does not change.

## Testing

- `orbit.ts`: positions around a turn, even spacing for six bubbles, the far-side flag at the top and bottom of the orbit, and a smaller radius.
- The card and the bubbles render the same links in the same order.
- `FooterFriend` renders nothing on the server, and the existing footer prerender stays unchanged.
- Sprite tests cover the new clips' frame sizes and palette letters.
- Browser check at 1440 and 390 px: idle, burst, hover focus, Tab focus through all six, Esc and click-outside close, pixel friends off, and reduced motion.
