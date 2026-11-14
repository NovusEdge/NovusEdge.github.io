# flocc detail page

A bespoke `/portfolio/flocc/` page. flocc's repo is private, so the page carries the project on its own.

## Thesis

The thinking stays with the owner; flocc executes. Brainstorming, the spec and the acceptance criteria are written by hand (with a separate agent). flocc takes an issue from Todo to a draft PR. The owner merges. The page sets this against the 2026 "software factory" talks that push toward lights-off autonomy, then lists the execution rules flocc encodes.

No employer is named anywhere on the page (site positioning rule). flocc is described as the owner's tool for running Claude on their own Linear issues.

## Wiring

- `src/routes/portfolio/content/flocc.tsx`: `ProjectContent` with the lede below and `sections: []`, registered in `content/index.ts` (this is what makes the index card link to the page).
- `src/routes/portfolio/detail-flocc.tsx`: the page, registered in `custom-pages.ts`.
- `src/routes/portfolio/flocc-flock.tsx`: the hero canvas.
- `src/routes/portfolio/flocc.css`: styles, all classes prefixed `fl-`.
- Follow `detail-docket.tsx` / `docket.css` for structure: own palette as CSS custom properties on `.fl` with a `.dark .fl` override, `--font-display`, `--font-prose`, `--font-mono`, `TLink` + `useLocalePath` for internal links, `prefersReducedMotion()` from `src/lib/motion.ts` (it also honours the site's a11y panel class).
- `p.links` is empty for flocc, so the masthead has no "project" link.
- No new dependencies. GSAP + ScrollTrigger are already installed.

Palette: same family as docket. Light: ground `#f5f2eb`, ink `#1a1a1a`, muted `#605e57`, accent `#916210`. Dark: ground `#1a1a1a`, ink `#f5f2eb`, muted `#aaa79f`, accent `#d4a03c`. "Yours" marks use ink, "flocc" marks use accent.

## Sections

### 1. Masthead + hero

Masthead: `← Portfolio`, wordmark `flocc 群`.

Hero is a band with the flock canvas behind the type.

- h1: `I do the thinking.` / `flocc does the rest.` (second line in accent)
- Lede (`c.lede`): flocc runs Claude Code sessions on Linear issues. I write the spec, it takes the issue from Todo to a draft pull request, and I merge. Everything between those two points is the factory.
- Text link: `Read the notes ↓` to `#notes`.

**Flock canvas** (`flocc-flock.tsx`): 2D canvas, ~150 boids (separation, alignment, cohesion), drawn as small accent-coloured chevrons pointing along velocity. A lane force toggles on a cycle: about 5 s free, then about 3 s where each bird is pulled toward the nearest of four horizontal lane lines and its velocity toward +x, then release. Pointer within ~90px repels birds gently. Wrap at edges. DPR-aware, resizes with its container (ResizeObserver). Pause the loop when the canvas is off-screen (IntersectionObserver) or `document.hidden`. Reduced motion: draw one static frame with the birds already in lanes, no loop. On `isMobile()` use ~70 birds. Canvas is `aria-hidden`; read the accent colour from the computed CSS variable so it follows the theme, and re-read on theme change (MutationObserver on `<html>` class, as `docket-flow.tsx` does).

### 2. The split (`01 · Who does what`)

Heading: `The thinking stays with me`

Body:

> I've been using Claude Code since it came out, and the part I'm surest about is that the thinking doesn't hand off. Brainstorming, the spec, what "done" means: those happen with me in the room, usually arguing with a separate agent until the acceptance criteria stop moving.
>
> flocc started because the part after that, the executing, was where my time was actually going. So it does that part and nothing else. An issue without acceptance criteria gets skipped with a comment saying why, and specs live in the repo, merged, because a session never follows a link.

**Lifecycle strip**: an `<ol>` of stages, horizontal on desktop, vertical under 768px.

| Stage | Owner | Caption |
|---|---|---|
| Spec | yours | Brainstorm, write it, merge it to the repo |
| Todo | yours | Label the issue, assign it, move it to Todo |
| Worktree | flocc | Fresh branch, `./setup`, as a separate Unix user |
| Test | flocc | A tester session writes tests that fail on wrong behaviour |
| Execute | flocc | A new session works from the issue and the tests |
| Check | flocc | The repo's own check, outside the agent's reach |
| Draft PR | flocc | The service pushes; the agent never can |
| Review | flocc | A fresh read-only session grades the diff |
| Merge | yours | I read it and merge by hand |

"Yours" stages: ink, with a `yours` tag. flocc stages: accent, with a `flocc` tag. A GSAP ScrollTrigger (scrub) moves a marker along the strip as the section scrolls through; under reduced motion the marker is hidden and all stages are fully drawn.

### 3. Against lights-off (`02 · The dark factory`)

Heading: `Not a dark factory`

Intro:

> The word for this in 2026 is a software factory, and most of the talk this year has been about turning the lights off.

Three pull quotes, each with attribution line and a link. Quotes are verbatim; do not edit them.

1. "I would define the software factory as the whole loop, the whole life cycle of developing software with autonomy, which doesn't mean just coding and generating code."
   Tereza Tížková, Factory · AI Engineer World's Fair 2026 · https://agents.conffab.com/worlds-fair/live/day-1-keynotes/sessions/1782843000.md
2. "I actually think agents really start to struggle after maybe three to six months, especially with the pace at which we can ship now."
   Dex Horthy, HumanLayer · "Harness Engineering is not Enough" · AI Engineer World's Fair 2026 · https://www.youtube.com/watch?v=Ib5GBkD555M
3. "A rule asks for behavior; a test supplies an observable result."
   Eric Zakariasson, Cursor · "Building your own software factory" · AI Engineer Europe 2026 (edited transcript) · https://ai.engineer/talks/building-your-own-software-factory

Between quote 1 and 2:

> Tížková's factory owns the whole loop, spec included. Horthy tried running one with nobody reading the code and spent the following months digging through it. His reason is the one I keep coming back to: "the cost function of bad architecture is measured in months and years." No test catches that, so somebody has to be thinking about it, and that somebody is me.

After quote 3:

> That line is most of flocc's design. Where I could turn an instruction into something the system enforces, I did.

**The ladder**: Dan Shapiro's five levels (https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/), six rungs 0 to 5 stacked bottom-up, each a number + short label:

- 0 Spicy autocomplete
- 1 Coding intern
- 2 Junior developer
- 3 Developer: "You spend your days reviewing code."
- 4 Engineering team: "You write a spec. You argue with it about the spec." … "check to see if the tests pass."
- 5 Dark software factory: "a black box that turns specs into software."

Rung 4 carries a `flocc` marker in accent. Rung 5 is drawn dimmer. Caption: `flocc stops at four on purpose. Five needs something that can tell bad design from working code, and that is still a person.` Source link under the ladder.

### 4. Field notes (`03 · Field notes`, `id="notes"`)

Heading: `What running agents taught me`

Ten cards in a two-column grid (one column on mobile), the portfolio's proof-sheet language: number, title, one sentence of mechanism. Each card is a `<details>`; the summary shows number + title, the open state shows the mechanism text. No invented anecdotes.

1. **Unattended agents can't ask.** Permission dialogs, AskUserQuestion and plan mode are denied by managed settings. Anything that needs me goes out as a question when the run ends, because a session waiting on an answer at 3am waits until morning.
2. **Agents don't push.** Sessions commit in their worktree. The service runs the check, pushes and opens the draft PR, so "done" means nothing until the check passes.
3. **Tests come from someone else.** A tester session writes the tests first. If the executor touches the tester's files, the run is rejected.
4. **Check main before blaming the branch.** When a check fails, the same check runs on the base branch. If main is broken too, the repo is held and no fixer burns a round on it.
5. **Every loop has a cap.** Two check-fix rounds, one review-fix round, three comment fixes a week, and usage thresholds before anything starts.
6. **Done is a command.** A session ends only by running `flocc done`. Finishing with no commits blocks as `no-changes`.
7. **State lives outside the context window.** Commits, a summary file and the Linear issue carry the run, so a crash or a compaction loses nothing.
8. **Nobody grades their own work.** The reviewer is a fresh, read-only session on the same worktree, checking the diff against each acceptance criterion.
9. **No criteria, no run.** An issue without an acceptance-criteria list is skipped with a comment. Specs live in the repo because sessions don't open attachments or follow links.
10. **Hooks are a courtesy; users are the wall.** The guard hook tells an agent early why a call is refused. The real boundary is Unix: the agent runs as its own user and cannot read the Linear key, the push token or the ledger.

### 5. Close

Label `Built for one`. `flocc 群`. Text: `A Go command on my desktop and a standard-library Python service on each host. Built for one owner running a few hosts, not a team sharing one service. The repo is private.` Stack line in mono: `Go · Python · Claude Code · Linear · systemd · tmux · Tailscale · Incus`. Link: `Back to portfolio`.

## Revision 2: patent sheet + Aero Shards (supersedes the palette and section styling above; copy and section order stand)

The page is styled as an old US patent (the IBM patents of the 1960s to 80s). Light theme is the printed sheet; dark theme is the blueprint (cyanotype) of the same drawing.

- **Palette.** Light: paper `#f3efe4`, ink `#141414`, muted ink `#5b574e`, hairline `color-mix(ink 22%)`. Dark (cyanotype): ground `#163a63`, ink `#eef3f8`, muted `#a9bdd3`. No accent colour in either; distinction comes from line weight, hatching and dashes.
- **Type.** IBM Plex Serif for body and headings, IBM Plex Mono for numerals, captions and the header strip. Load them the way the site already loads fonts (check for @fontsource or the existing font setup), scoped to this page.
- **Sheet frame.** A running header across the top in mono: `U.S. Patent   Nov. 14, 2026   Sheet 1 of 3   flocc`. Below it, a front-page block with bracketed INID codes: `[54]` title `SYSTEM FOR EXECUTING SPECIFIED SOFTWARE WORK WITH UNATTENDED AGENTS`, `[76] Inventor: A. Khimani, Finland`, `[57] ABSTRACT` holding the lede. The h1 (`I do the thinking. / flocc does the rest.`) stays as the big type; the second line in muted ink rather than an accent.
- **FIG. 1, hero.** React Bits Aero Shards (WebGPU, `vgpu`), vendored like the other react-bits components in `src/components/react-bits/bg/`, lazy-loaded on this page only. Monochrome: shards in ink, `lightMode` on the light theme, `markers: 'plus'`, `placement: 'full'`, glow low, vignette 0. Caption under the band: `FIG. 1`. If `navigator.gpu` is missing, `onError` fires, or reduced motion is on, render the existing flock instead (recoloured to ink, static under reduced motion).
- **Section headings** become patent headings in small caps serif: `DETAILED DESCRIPTION` (the split prose), `REFERENCES CITED` / prior art (the talks), `WHAT IS CLAIMED IS` (field notes).
- **FIG. 2, lifecycle.** A flowchart drawn as boxes with arrows and patent reference numerals (`102` Spec, `104` Todo, `106` Worktree ... `118` Merge), leader lines from numerals to boxes. The owner's boxes (Spec, Todo, Merge) are drawn with diagonal hatching and a legend: `hatched: performed by the inventor`. Horizontal on desktop, vertical under 1050px. The scroll marker becomes a small filled arrowhead travelling the flow line.
- **Prior art.** The three pull quotes are set as cited references, numbered `[1] [2] [3]`, quote in serif italic, citation line in mono. The connecting prose stays.
- **FIG. 3, ladder.** An elevation drawing: six rungs as horizontal lines with level numerals; a dimension line with arrowheads marks level 4 `flocc`; level 5 is drawn dashed (unbuilt). Shapiro quotes stay.
- **Claims.** The ten field notes become a numbered claims list in serif, all visible (no details toggles): number, the title in small caps, then the mechanism sentence. Copy unchanged.
- **Close.** Unchanged copy, set as the sheet's foot.
- **Agentation.** Add `agentation` as a devDependency and mount `<Agentation />` once at the app root under `import.meta.env.DEV`, so the owner can annotate the page in dev. It must not ship in the production bundle.

## Quality bar

- Light and dark themes, 375px to 1440px, no horizontal scroll.
- Reduced motion (OS setting and the site's a11y panel class): no canvas loop, no scrub.
- Keyboard: details/summary and links reachable with visible focus.
- `npm run build` passes (`tsc && vite build`); the route prerenders.
- Prose: no em-dashes, no new claims beyond this spec.
