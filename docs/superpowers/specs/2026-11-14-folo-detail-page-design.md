# folo detail page

A bespoke `/portfolio/folo/` page. Purpose: "look at this cool thing I'm building". It sells folo as a product a visitor would want, then shows enough of the system under it to read as real engineering. The code is private; askfolo.com is the outbound link.

No employer is named. Present folo as the owner's project; no titles ("founder", "CTO").

## Wiring

Same pattern as the flocc page (read `src/routes/portfolio/detail-flocc.tsx`, `content/flocc.tsx`, `custom-pages.ts`, `content/index.ts`):

- `src/routes/portfolio/content/folo.tsx` (`lede` = the hero lede below, `sections: []`), registered in `content/index.ts`.
- `src/routes/portfolio/detail-folo.tsx`, registered in `custom-pages.ts`; `src/routes/portfolio/folo.css`, classes prefixed `fo-`.
- Repaint the site footer and chrome on this page the way flocc does (`flocc-sheet` class on `<html>`, rules in `src/styles/global.css`): class `folo-sheet`, footer on `#e9e4d9` with charcoal text in both themes.
- No new npm dependencies. GSAP + ScrollTrigger are installed.

## Look

Borrowed from askfolo.com, whose source is `~/Projects/askfolo/folo-site/public/index.html` (read its `<style>` block and the phone mock markup and reuse the approach, adapted to React; it is the owner's own code):

- Bone `#f2eee5`, bone light `#f9f7f1`, bone 2 `#e9e4d9`, ink/charcoal `#2b2a27`, ink 2 `#4f4d47`, ink 3 `#6f6b63`, rule `#d8d3c7`, accent red `#e0301e` (sparingly: one or two marks per screen), slate `#3f5f7d` for secondary marks.
- askfolo is light-only; this page stays light in both site themes (like askfolo, set `color-scheme: light` on the page root).
- Type: Funnel Display (headings, weight 500, letter-spacing -0.03em) and Funnel Sans (body 17px/1.5). Add both to the existing Google Fonts link in `index.html` (as flocc did for IBM Plex); use only under `.fo`.
- Labels in sentence case, never small caps. Tabular digits for times.

## Sections

### 1. Hero

- Masthead: `← Portfolio`, wordmark `folo`, link `askfolo.com ↗` (https://askfolo.com).
- h1: `Need something done?` / `Just talk to your folo.`
- Sub: `An on-call COO for founders.`
- Lede: `this is the thing I'm building right now. folo's a personal agent for founders: you talk to it, and it briefs you, follows up, reschedules, replies and puts your calls through. it's in private beta, and the waitlist's open.`
- Button-style link: `Join the waitlist ↗` to https://askfolo.com.

### 2. One day, as folo runs it

Heading: `One day, as folo runs it`. Intro: `here's a normal day with folo running it.`

Scroll-driven: a time rail on the left with six stops; a sticky phone frame on the right whose screen changes at each stop (crossfade). On mobile (<900px) and under reduced motion: no sticky, each stop is a time label followed by its phone screen, stacked.

Stops and screen content (copy taken from askfolo.com; keep it verbatim):

1. `07:30` `Morning call`. Screen: incoming call from folo, `00:14 · morning call`. folo says: `Three things today. Sana at ten is the one that matters.` List: `10:00 Sana · pilot call`, `14:00 Leah · 1:1`, `17:00 Investor update goes out`.
2. `09:58` `It calls you first`. Screen: folo calling, `calling · 2 min before Sana`, `This one matters. Pick up.` `Open with the start date.` Answer button.
3. `10:48` `Notes in, follow-up sent`. Screen: `After Sana`: `Meeting notes Shared`, `Commitments · 2 Logged`, `Follow-up · Sana Sent`; commitments `Pilot starts 1 December. Pricing sheet to Sana by Friday.`
4. `13:10` `Inbox handled`. Screen: inbox rows `Mikael Replied Re: invoice for October`, `Sana Replied Pilot start, a few questions`, `Stripe Filed Your payout is on the way`, `Jonas Replied Hiring loop for the backend role`, `Leah Replied Can we move Thursday?`, `Notion Filed Weekly digest`; footer `6 handled · 4 replied · 2 filed`.
5. `16:40` `Asked, answered, cited`. Screen: chat. Me: `what did they say about pricing?` folo: `€2k a month works for the pilot. Sana wants the annual number by Friday.` citation chip `call 10:14 · "two thousand a month is fine for the pilot"`. Me: `and the start date?` folo: `1 December, if the pilot scope holds. Her words at 10:16.`
6. `18:30` `Your day, handled`. Screen: `3 meetings captured`, `6 follow-ups sent`, `4 replies sent`, `1 call put through`, `Tomorrow starts with Leah at 09:00.`

### 3. Say who

Heading: `Say who. folo puts you through.` Sub: `you just say who, folo puts the call through, and after you hang up the two agents sort out the rest between themselves.`

Two phones side by side (stacked on mobile), stepping through three beats on a loop (static final beat under reduced motion), with a 01/02/03 step control:
1. `Hey folo, call Bob.` Left phone `Bob` `Calling…`.
2. `folo puts Alice through.` Both phones `Connected · 00:04`.
3. `Then their agents sort out the rest.` Both `Call ended · 04:12`, and between them the agent exchange: `Alice's folo` `Sharing notes from the call` / `Bob's folo` `Got them. Follow-up Thursday?` / `Alice's folo` `Thursday 14:00, on both calendars.`

### 4. What's under it

Heading: `What's under it`. Intro: `under the app it's a handful of small services, and most of my time so far has gone into the parts nobody sees: who's allowed to see what, and where every answer came from.`

Diagram (inline SVG or HTML/CSS boxes, left to right, stacks vertically on mobile):
`SMS · Telegram · phone app · voice calls` → `gateway` (who's calling, spend caps, outbound calls) → `one agent per person` → three boxes `records` (search with citations, scoped by role), `context` (memory of people and preferences), `meetings` (calendar sync, briefs) → `Postgres + pgvector`. A side branch from the agent to `model gateway` → `model picked per job`.

Four rules beside or below the diagram, numbered:
1. `Every answer cites its sources.`
2. `Each person only sees what they're allowed to see, filtered in the database, not the prompt.`
3. `Each service gets its own Postgres role and never imports another.`
4. `Logs never carry names, emails, phone numbers or message text.`

Status line under it: `it's in private beta, so none of this has run at scale yet.`

### 5. Close

`folo` wordmark. Text: `the code's private. if you're a founder and this sounds useful, get on the waitlist.` Link `askfolo.com ↗`. Stack in mono: `Python · FastAPI · Postgres + pgvector · Expo · Cloudflare Workers · ElevenLabs · Twilio · Nango · MCP`. Link `← Back to portfolio`.

## Revision 2: personal, "moves first" (supersedes Sections 1 to 4 above; Look, Wiring and Close stand)

The owner found the first build too close to askfolo.com. The page is now the owner's argument: the tools they tried (Inception and the rest) still felt turn-based, you type, it answers, nothing happens till you type again; folo is meant to move first. Copy below is exact; lowercase sentence starts are intentional.

### 1. Hero
- h1: `I wanted an assistant` / `that moves first.` (second line in ink 3)
- Sub: `folo, an on-call COO for founders.`
- Lede: `I tried Inception and pretty much everything else out there, and they all still felt turn-based. you type, it answers, and then nothing happens till you type again. so I started building folo.`
- `Join the waitlist ↗` (https://askfolo.com). Keep the tilted hero phone if it still fits; give the sub and lede proper spacing under the h1 (the first build crowded them).

### 2. Turn-based vs folo
Heading: `Same day, two assistants`. Two columns sharing one vertical time axis 07:00 to 18:30 (stacked on mobile: turn-based first). Each event is placed at its time, so the empty stretches are visible as empty space. Under each column a counter: `times I had to ask`.

Left, label `a turn-based assistant` with a small note `illustrative, not any one product`:
- `09:52` me: `what's my day look like?` / it: `You have 3 meetings: Sana at 10:00, Leah at 14:00, investor update at 17:00.`
- `11:20` me: `write a follow-up to Sana` / it: `Here's a draft. Want me to change anything?`
- `14:05` me: `did Leah reply?` / it: `I don't see a reply yet.`
- `16:40` me: `what did Sana say about pricing?` / it: `I don't have access to that call.`
- Between events, a faint dashed gap label `nothing happens`. Counter: `4`.

Right, label `folo`:
- `07:30` `Morning call: three things today, Sana's the one that matters.`
- `09:58` `Calls me two minutes before Sana.`
- `10:48` `Notes shared, follow-up to Sana sent.`
- `13:10` `Inbox handled: 4 replied, 2 filed.`
- `15:20` `Leah's 1:1 moved to Thursday.`
- `16:40` me: `what did they say about pricing?` / folo: `€2k a month works for the pilot.` with citation chip `call 10:14`.
- Counter: `1`.

On scroll into view, the two columns fill top to bottom in sync (GSAP ScrollTrigger, once, not scrubbed); reduced motion shows them filled.

### 3. The day, up close
Heading: `The same day, up close`. Keep the existing sticky-phone timeline and its six screens. Each stop gets a small tag: `folo, unprompted` for 07:30, 09:58, 10:48, 13:10, 18:30, and `I asked` for 16:40 (accent red only on the `I asked` tag). Reduce the empty scroll distance between stops on desktop so the rail does not leave screen-high blank gaps (roughly 60vh per stop).

### 4. Moving first, without going rogue
Heading: `Moving first, without going rogue`. Body:
- `the scary part of an assistant that acts on its own is that it acts on its own, so most of the work has gone into deciding where it's allowed to.`
- `routine stuff, follow-ups, holds, reschedules and replies, goes out without asking, each with its sources attached. it checks with me first before writing to someone new, or when a message has text in it that came from outside. and when the other person has folo too, the two agents sort out the follow-up between themselves after the call.`

Then the existing "What's under it" diagram and four rules (unchanged copy), with its intro line and the status line `it's in private beta, so none of this has run at scale yet.`

### Removed
The "Say who. folo puts you through." two-phone section is removed.

## Quality bar

- 375px to 1440px, no horizontal scroll. Light only.
- Reduced motion (OS setting and the site's `a11y-reduced-motion` class on `<html>`, via `prefersReducedMotion()`): no scrub, no loop; static stacked versions.
- Keyboard: step controls are buttons with `aria-pressed`, visible focus.
- `npm run build` passes; `/portfolio/folo/` prerenders.
- No em-dashes in visible text. Copy is exact; lowercase sentence starts are intentional.
