# Plan A: the fence

A scroll-driven figure in the right rail of `/blog/plan-a-ai`. Implementation spec.

## What it is

A field of marks. The marks inside a drawn boundary are compute you can count.
The boundary draws itself early and then never changes again for the rest of the
page. What changes is everything around it: marks begin appearing outside, in
oxblood, untethered, and they keep multiplying until the counted interior is a
small box sitting in a field it never contained.

The figure carries the essay's argument. The fence does not fail, does not
break, does not leak. It works exactly as designed and becomes irrelevant.

## Why R3F

`@react-three/fiber` and `three` are already dependencies and already ship in the
bundle for the portfolio hero. R3F gives the composable JSX the figure needs:
`<Fence/>`, `<MarkField/>`, `<Sweep/>` as siblings under one `<Canvas>`.

`@react-three/drei` is **not** installed. Do not add it. Everything here is
plain three.js primitives.

Rejected: `ogl` (imperative, hand-rolled instancing), canvas 2D (not
composable), DOM nodes driven by framer-motion (hundreds of animated elements,
and it reads as web UI on a page that is pretending to be print).

## The tonal constraint

The page is a pastiche of a printed report. The figure must read as ink on
paper that happens to be GPU-drawn. Any hint of dimensionality kills it.

- `OrthographicCamera`, looking straight down the z axis.
- `MeshBasicMaterial` everywhere. No lights in the scene at all.
- `shadows={false}`, `gl={{ antialias: true, alpha: true }}`, `flat` on the
  Canvas so tone mapping is off.
- Canvas background stays transparent; the page's `#fffff8` shows through.
- No postprocessing. No bloom, no depth of field, no vignette.
- `pointer-events: none` on the canvas wrapper. The figure never takes a click
  and never traps scroll.

## Palette

Reuse the page tokens, hardcoded in the component since three.js needs numbers:

| role | hex |
| --- | --- |
| ink | `#111111` |
| oxblood | `#8b2a2a` |
| ground | `#fffff8` |
| fence | `#111111` at 0.30 blend toward ground |

There is no alpha channel anywhere in this figure. Opacity is faked by lerping
an instance's color toward `ground`. On an opaque cream page the result is
identical and it keeps every material opaque, which avoids instanced-transparency
sort order entirely.

## Layout: rail mode

The right margin currently belongs to the sidenotes. The rail only engages when
there is room for both, at viewport width ≥ 1700px. Below that the figure does
not mount at all, so phones and laptops never create a WebGL context.

Add one media query in `global.css`. Everything under 1700px stays exactly as it
is now.

```css
@media (min-width: 1700px) {
  .pa-shell { max-width: 1760px; }
  .pa-col   { width: 48%; }
  .pa-sn    { width: 44%; margin-right: -48%; }
  .pa-rail  { display: block; }
}
```

The sidenote numbers are percentages of `.pa-col`, so the two must move
together. With `width: 44%` and `margin-right: -48%` a note spans from 50% to
71% of the shell, which leaves 74% to 100% clear. `.pa-rail` sits in that band:
`position: sticky; top: 50%; transform: translateY(-50%); width: 24%;
margin-left: auto;` with `display: none` by default.

Square aspect. Target render size about 380 × 380 CSS px.

## Scene graph

```
<PlanAFence>                     // wrapper: media query gate, IntersectionObserver, reduced-motion branch
  <Canvas flat orthographic>
    <Fence     state={ref} />    // the boundary. Draws once at S1, static thereafter.
    <MarkField state={ref} />    // two InstancedMesh: filled circles, hollow rings
    <Sweep     state={ref} />    // the inspector pass. Only alive during S5.
  </Canvas>
  <figcaption/>                  // DOM, not WebGL. Swaps text per state.
</PlanAFence>
```

`state` is a `useRef`, never React state. A state change must not re-render the
React tree; `useFrame` reads the ref each frame and lerps toward it.

## Mark model

400 instances total, fixed for the life of the page. Marks move between the
interior and the exterior by retargeting, never by mounting or unmounting.

Per instance, held in plain `Float32Array`s:

- `pos` current x, y
- `target` destination x, y
- `color` current rgb
- `targetColor` rgb
- `scale` current, `targetScale`
- `hollow` 0 or 1, decides which InstancedMesh draws it

Two `InstancedMesh` objects share the array: one with `CircleGeometry(r, 12)`,
one with `RingGeometry(r * 0.55, r, 12)`. An instance is hidden from the mesh it
does not belong to by setting that instance's scale to 0. Both use
`instanceColor`.

`useFrame` lerps `pos`, `color` and `scale` toward their targets with a per
instance stagger derived from its index, so a transition reads as the field
settling rather than every mark snapping at once. Suggested: `damp` factor 0.08,
stagger up to 250ms.

## States

One state per essay section, keyed to the `h2` ids already emitted by
`plan-a-page.tsx`. Interior count means marks inside the fence.

| # | section id | interior | exterior | what changes |
| --- | --- | --- | --- | --- |
| S0 | `sixty-days` | 2 | 0 | Two ink marks, close together, centre frame. Nothing else. An echo of the masthead runway. |
| S1 | `what-plan-a-actually-says` | 220 | 0 | The fence draws itself. Marks fill it in a regular lattice. Ordered, countable. |
| S2 | `the-thing-that-doesnt-need-compute` | 220 | 30 | First oxblood marks appear outside, at irregular positions, with no line connecting them to anything. Interior untouched. |
| S3 | `publishing-the-recipe-isnt-publishing-the-meal` | 220 | 70 | Interior marks turn hollow. Still there, still counted, contents unknown. |
| S4 | `when-exactly-is-research-done` | 220 | 110 | A quarter of the interior marks blend 55% toward ground. Declared, not yet published, and no rule says when. |
| S5 | `verification-is-a-comfort-not-a-control` | 220 | 160 | A sweep line crosses the interior once, left to right. Marks it passes flash to full ink and decay back. It stops dead at the fence and never crosses it. |
| S6 | `mutually-assured-compute-destruction` | 220 | 200 | Exterior keeps growing. Nothing else moves. The quietest section stays quiet. |
| S7 | `the-part-i-actually-like` | 220 | 230 | The interior lattice loosens from a dense block into an even distribution across the full fence area. Same marks, same fence, better arranged. |
| S8 | `their-open-questions-my-half-answers` | 220 | 280 | Exterior marks begin organising into a loose lattice of their own. Structure growing where nobody is counting. |
| S9 | `what-i-actually-think` | 220 | 320 | Everything stills. The fence is intact and small against a field it never held. |

`two-layers-because-i-got-this-wrong-once-already` holds S8. Scrolling up runs
the same table backwards via `onEnterBack`.

Exterior positions: Poisson-ish jitter on a coarse grid so the field looks
scattered without clumping. Seed it once at mount and keep it stable, so
scrolling up and back down returns marks to the same places.

## Driving it

GSAP `ScrollTrigger`, already a dependency and already used through
`@gsap/react` elsewhere in this codebase.

- One trigger per section, `start: 'top 60%'`, `end: 'bottom 60%'`.
- `onEnter` and `onEnterBack` write the state index to the ref and call
  `invalidate()`.
- `Canvas frameloop="demand"`. The `useFrame` loop calls `invalidate()` on every
  frame where any lerp is still further than epsilon `0.001` from its target,
  and stops otherwise. The GPU goes idle between sections.
- Pause entirely when the rail leaves the viewport, via `IntersectionObserver`.
- Kill every trigger on unmount.

## Caption

DOM text under the canvas, swapped with the state. Same type as
`.pa-runway figcaption`. Keep each to one line.

S1 "every chip, counted" · S2 "the first ones nobody counts" · S3 "visible,
contents unknown" · S5 "the sweep stops at the wall" · S7 "same compute,
arranged better" · S9 "the fence never broke"

Fade the swap over 200ms. Other states keep the previous caption.

## Reduced motion

`prefers-reduced-motion: reduce` renders S9 as a single static frame. No
ScrollTriggers, no lerping, one render, then stop. S9 alone still carries the
argument, which is why it is the fallback.

## Accessibility

The canvas is decorative and gets `aria-hidden="true"`. The figure's content
reaches assistive tech through a visually hidden paragraph that states the
argument in words, mirroring the S9 caption. The essay never depends on the
figure.

## Files

| file | change |
| --- | --- |
| `src/components/plan-a-fence.tsx` | new. The wrapper, the three scene components, the state table. |
| `src/routes/blog/plan-a-page.tsx` | mount `<PlanAFence/>` in a `.pa-rail` element after the body column. |
| `src/styles/global.css` | the `min-width: 1700px` block above, plus `.pa-rail { display: none }` in the base. |

## Acceptance

- At 1920px the fence and the sidenotes never overlap, at any scroll position.
- At 1699px the rail is absent and the current layout is byte-identical to today.
- Scrolling the full essay and back returns every mark to its S0 arrangement.
- The fence geometry is written once and never touched after S1. Assert this in
  review by confirming no code path mutates fence vertices.
- `npx tsc --noEmit` clean.
- No new entry in `package.json`.
