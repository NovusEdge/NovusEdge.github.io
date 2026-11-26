import type { ComponentType } from 'react'
import katex from 'katex'
import { DESIGN_FIGURES } from './design-figures'
import { FUN_FIGURES } from './fun-figures'
import { RESULTS_FIGURES } from './results-figures'
import { SCALE_FIGURES } from './scale-figures'
import { Fig, pace } from './kit'
import './problems.css'

function Tex({ children }: { children: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, { throwOnError: false }),
      }}
    />
  )
}

const signed = (n: number) => {
  const r = +n.toFixed(2)
  return `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r)}`
}

const RING = { x: 160, y: 126, r: 84 }
const onRing = (deg: number) => {
  const a = (deg * Math.PI) / 180
  return [+(RING.x + RING.r * Math.cos(a)).toFixed(1), +(RING.y + RING.r * Math.sin(a)).toFixed(1)] as const
}
// Degrees run clockwise from 3 o'clock, because SVG's y axis points down.
const arc = (from: number, to: number) => {
  const [x0, y0] = onRing(from)
  const [x1, y1] = onRing(to)
  return `M${x0},${y0} A${RING.r},${RING.r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1},${y1}`
}
const FULL_RING = `${arc(-90, 90)} A${RING.r},${RING.r} 0 0 1 ${onRing(-90).join(',')}`

function Chevron({ deg }: { deg: number }) {
  const [x, y] = onRing(deg)
  return <path className="sp-line" d="M-4,-5 L4,0 L-4,5" transform={`translate(${x},${y}) rotate(${deg + 90})`} />
}

// Both panels step on one clock, one frame per Fig beat. A code lap is the six steps below, so the
// placement side's first signal lands with SIGNAL / 6 code laps finished; a lap counts once its pass shows.
const LAP = ['write', 'build', '✗ error', 'fix', 'build', '✓ pass']
const FRAMES = 30
const QUIET = 2
const OPENS = 24
const SIGNAL = 27
const LAPS_AT_SIGNAL = Math.floor(SIGNAL / LAP.length)
const WAITS = [
  { until: 9, text: '5 min later' },
  { until: 16, text: '1 h later' },
  { until: FRAMES, text: 'next day' },
]
const LOOP_LABELS = Array.from({ length: FRAMES }, (_, f) =>
  f < QUIET
    ? 'both write'
    : f < OPENS
      ? 'code hears back every lap, placement hears nothing'
      : f < SIGNAL
        ? 'someone opens the editor'
        : `placement gets its first signal, ${LAPS_AT_SIGNAL} code laps in`,
)
const lit = (on: boolean) => (on ? 'sp-box sp-tint-a sp-heavy' : 'sp-box')
const shown = (on: boolean) => ({ visibility: on ? 'visible' : 'hidden' }) as const

function TwoLoops() {
  return (
    <Fig id="two-loops" labels={LOOP_LABELS} rest={FRAMES - 1} ms={420} caption="Code gets an error back on every lap; a placement gets nothing until a person looks.">
      {(f) => {
        const step = f % LAP.length
        const quiet = f >= QUIET && f < OPENS
        return (
          <div className="sp-panels">
            <div className="sp-panel sp-fit fit-loops">
              <p className="sp-title">Code</p>
              <svg
                viewBox="0 0 320 276"
                role="img"
                aria-label="A closed loop of six steps: write, build, error, fix, build, tests pass. Each step lights up in turn and a lap counter in the middle ticks up. Every lap returns the error 'roof is not defined' and then a pass."
              >
                <path className="sp-line" d={FULL_RING} />
                {LAP.map((_, i) => (
                  <Chevron key={i} deg={-60 + i * 60} />
                ))}
                <text x={RING.x} y={RING.y - 10} textAnchor="middle" className="sp-soft">
                  lap
                </text>
                <text x={RING.x} y={RING.y + 12} textAnchor="middle" className="sp-mark">
                  {Math.floor(f / LAP.length) + 1}
                </text>
                {LAP.map((label, i) => {
                  const [x, y] = onRing(-90 + i * 60)
                  const w = label.length * 7.4 + 18
                  return (
                    <g key={i}>
                      <rect className={lit(i === step)} x={x - w / 2} y={y - 13} width={w} height="26" rx="5" />
                      <text x={x} y={y + 4} textAnchor="middle" className={i === step ? 'sp-strong' : undefined}>
                        {label}
                      </text>
                    </g>
                  )
                })}
                <text x={RING.x} y="262" textAnchor="middle" className="sp-strong" style={shown(step === 2 || step === 3)}>
                  ✗ error: roof is not defined
                </text>
                <text x={RING.x} y="262" textAnchor="middle" className="sp-strong" style={shown(step === 5)}>
                  ✓ tests pass
                </text>
              </svg>
            </div>
            <div className="sp-panel sp-fit fit-loops">
              <p className="sp-title">Placement</p>
              <svg
                viewBox="0 0 320 276"
                role="img"
                aria-label={`An open line of steps. Write, then saved: the scene file is valid. Then a long stretch that reports no error while the clock jumps from 5 minutes to an hour to the next day. Then someone opens the editor, with a thumbnail of the broken house, and only then the first signal: roof is lopsided. By then the code loop has finished ${LAPS_AT_SIGNAL} laps.`}
              >
                <path className="sp-line" d="M80,27 H105 m-5,-4 l5,4 l-5,4 M160,40 V57 m-4,-5 l4,5 l4,-5 M160,142 V159 m-4,-5 l4,5 l4,-5" />
                <rect className={lit(f === 0)} x="16" y="14" width="64" height="26" rx="5" />
                <text x="48" y="31" textAnchor="middle">
                  write
                </text>
                <rect className={lit(f === 1)} x="106" y="14" width="176" height="26" rx="5" />
                <text x="194" y="31" textAnchor="middle">
                  saved ✓ file is valid
                </text>
                <rect className={quiet ? 'sp-box sp-tint-a sp-dash' : 'sp-box sp-dash'} x="16" y="58" width="288" height="84" rx="5" />
                <text x="160" y="86" textAnchor="middle" className="sp-soft" style={shown(f >= QUIET)}>
                  {Array(quiet ? ((f - QUIET) % 3) + 1 : 3)
                    .fill('no error')
                    .join(' · ')}
                </text>
                <text x="160" y="120" textAnchor="middle" className="sp-mark" style={shown(f >= QUIET)}>
                  {WAITS.find((wait) => f < wait.until)!.text}
                </text>
                <rect className={lit(f >= OPENS && f < SIGNAL)} x="16" y="160" width="190" height="26" rx="5" />
                <text x="111" y="177" textAnchor="middle">
                  someone opens the editor
                </text>
                <g style={shown(f >= OPENS)}>
                  <image href="/assets/blog/spatial/menu/1.webp" x="216" y="160" width="88" height="50" preserveAspectRatio="xMidYMid slice" />
                  <rect className="sp-clear sp-line" x="216" y="160" width="88" height="50" />
                </g>
                <text x="16" y="232" className="sp-mark" style={shown(f >= SIGNAL)}>
                  ✗ roof is lopsided
                </text>
                <text x="160" y="262" textAnchor="middle" className="sp-strong" style={shown(f >= SIGNAL)}>
                  code: {Math.floor((f + 1) / LAP.length)} laps · placement: 1 signal
                </text>
              </svg>
            </div>
          </div>
        )
      }}
    </Fig>
  )
}

function TreeNode({ x, y, name, fact, on }: { x: number; y: number; name: string; fact: string; on: boolean }) {
  return (
    <g>
      <rect className={on ? 'sp-box sp-tint-a sp-heavy' : 'sp-box'} x={x} y={y} width={name.length * 7.4 + 18} height="24" rx="4" />
      <text x={x + 9} y={y + 16} className="sp-strong">
        {name}
      </text>
      {/* 18 in, so the Crate node's fact clears the tree's trunk line at x = 30. */}
      <text x={x + 18} y={y + 41} className={on ? undefined : 'sp-soft'}>
        {fact}
      </text>
    </g>
  )
}

const FACTS = [
  'the transform: on the Crate node, in main.tscn',
  'the mesh: on a child node',
  'the collider: on another child, with its own offset',
  'the behaviour: in crate.gd, a different file',
]

function ObjectFacts() {
  return (
    <Fig
      id="object-facts"
      labels={FACTS}
      rest={3}
      ms={pace(FACTS)}
      caption="One crate's facts sit in four places across two files, so an agent has to open all four to know what the crate does."
    >
      {(beat) => (
        <div className="sp-fit fit-facts">
          <svg
            viewBox="0 0 360 326"
            role="img"
            aria-label={`A node tree inside main.tscn: the Crate node holds the transform, its child MeshInstance3D holds the mesh, and its child CollisionShape3D holds a shape with its own offset. A script link leaves the Crate node for a second file, crate.gd, which holds the behaviour. Highlighted: ${FACTS[beat]}.`}
          >
            <text x="8" y="16" className="sp-strong">
              main.tscn
            </text>
            <rect className="sp-frame" x="6" y="24" width="348" height="186" rx="6" />
            <path className="sp-line" d="M30,62 V164 M30,106 H50 M30,164 H50" />
            <TreeNode x={20} y={38} name="Crate (RigidBody3D)" fact="transform: position, rotation, scale" on={beat === 0} />
            <TreeNode x={50} y={94} name="MeshInstance3D" fact="mesh: the box you see" on={beat === 1} />
            <TreeNode x={50} y={152} name="CollisionShape3D" fact="shape, with its own offset" on={beat === 2} />
            <path className={beat === 3 ? 'sp-line sp-stroke-b sp-heavy sp-dash pl-ants' : 'sp-line sp-stroke-b sp-dash pl-ants'} d="M180,50 H338 V246" />
            <path className="sp-line sp-stroke-b" d="M333,239 L338,247 L343,239" />
            <text x="330" y="232" textAnchor="end" className="sp-soft">
              script
            </text>
            <text x="8" y="246" className="sp-strong">
              crate.gd
            </text>
            <rect className={beat === 3 ? 'sp-frame sp-tint-a sp-stroke-b sp-heavy' : 'sp-frame sp-stroke-b'} x="6" y="254" width="348" height="64" rx="6" />
            <text x="20" y="280">
              behaviour: what happens when
            </text>
            <text x="20" y="298">
              the crate lands on a plate
            </text>
          </svg>
        </div>
      )}
    </Fig>
  )
}

const GROUND = 170
const CRATE = { x: 150, y: 102, w: 60, h: 60 }
const PLATE = { x: 120, y: 162, w: 120, h: 8 }
const TRIGGER = { w: 120, h: 34, offsetX: 228 }
// The door slides sideways behind the wall, so nothing in the drawing needs room above it.
const SIDE_WALL = { x: 6, w: 30, top: 86 }
const DOOR = { x: SIDE_WALL.x + SIDE_WALL.w + 2, w: 24, slide: -(SIDE_WALL.w - 2) }
const PLATE_BEATS = [
  'mesh: the crate sits on the plate',
  'collider: the same shape as the mesh',
  'trigger: offset from the plate, so the door stays shut',
  'the trigger slides under the mesh',
  'the crate overlaps the trigger, so the door opens',
]

function PlateLayers() {
  return (
    <Fig
      id="plate-layers"
      labels={PLATE_BEATS}
      rest={2}
      ms={pace(PLATE_BEATS)}
      caption="The crate sits on the plate you can see, but the door listens to a trigger box that is somewhere else."
    >
      {(beat) => {
        const triggerX = beat >= 3 ? PLATE.x : TRIGGER.offsetX
        const overlaps = triggerX < CRATE.x + CRATE.w && triggerX + TRIGGER.w > CRATE.x
        // One beat behind the overlap, so the slide and the door read as cause then effect.
        const open = overlaps && beat >= 4
        // Where the crate is inside the trigger box.
        const hit = {
          x: Math.max(CRATE.x, triggerX),
          y: GROUND - TRIGGER.h,
          w: CRATE.w,
          h: CRATE.y + CRATE.h - (GROUND - TRIGGER.h),
        }
        return (
          <div className="sp-fit fit-plate">
            <svg
              viewBox="0 74 360 121"
              role="img"
              aria-label={`Side view of a crate resting on a pressure plate, with a sliding door in a wall to the left. ${
                beat < 2
                  ? 'The door is shut.'
                  : overlaps
                    ? `The plate's trigger box is under the plate, so the crate overlaps it and the door ${open ? 'is open' : 'is about to open'}.`
                    : "The plate's trigger box is offset to the right of the plate, so the crate does not overlap it and the door is shut."
              }`}
            >
              <path className="sp-line" d={`M8,${GROUND} H352`} />
              <rect className="sp-frame" x={DOOR.x - 2} y={SIDE_WALL.top} width={DOOR.w + 4} height={GROUND - SIDE_WALL.top} />
              <rect
                className={beat === 2 ? 'sp-box sp-tint-b pl-door pl-rattle' : 'sp-box sp-tint-b pl-door'}
                x={DOOR.x}
                y={SIDE_WALL.top + 3}
                width={DOOR.w}
                height={GROUND - SIDE_WALL.top - 3}
                style={{ transform: `translateX(${open ? DOOR.slide : 0}px)` }}
              />
              {/* Drawn after the door: the open door is hidden behind it. */}
              <rect className="sp-box pl-wall" x={SIDE_WALL.x} y={SIDE_WALL.top} width={SIDE_WALL.w} height={GROUND - SIDE_WALL.top} />
              {/* Turned on its side: at phone size the word is as wide as the wall. */}
              <text textAnchor="middle" className="sp-soft" transform={`translate(${SIDE_WALL.x + SIDE_WALL.w / 2 + 4},${(SIDE_WALL.top + GROUND) / 2}) rotate(-90)`}>
                wall
              </text>
              <text x="8" y={GROUND + 17} className={open || beat === 2 ? 'sp-strong' : undefined}>
                door: {open ? 'open' : 'shut'}
              </text>
              <rect className="sp-box" {...{ x: PLATE.x, y: PLATE.y, width: PLATE.w, height: PLATE.h }} />
              <g className={beat === 0 ? 'pl-drop' : undefined}>
                <rect
                  className="sp-box"
                  {...{
                    x: CRATE.x,
                    y: CRATE.y,
                    width: CRATE.w,
                    height: CRATE.h,
                  }}
                />
                <path className="sp-line sp-faint" d={`M${CRATE.x},${CRATE.y} l${CRATE.w},${CRATE.h} M${CRATE.x + CRATE.w},${CRATE.y} l${-CRATE.w},${CRATE.h}`} />
                <text x={CRATE.x + CRATE.w / 2} y={CRATE.y - 5} textAnchor="middle">
                  crate
                </text>
              </g>
              <text x={PLATE.x + PLATE.w / 2} y={GROUND + 17} textAnchor="middle">
                plate
              </text>
              {beat >= 2 && (
                <g className="pl-slide pl-in" style={{ transform: `translateX(${triggerX}px)` }}>
                  <rect
                    className={beat < 4 ? 'sp-tint-a sp-line sp-stroke-a sp-dash pl-ants' : 'sp-tint-a sp-line sp-stroke-a sp-dash'}
                    x="0"
                    y={GROUND - TRIGGER.h}
                    width={TRIGGER.w}
                    height={TRIGGER.h}
                    fillOpacity="0.6"
                  />
                  {/* Under the plate the label would sit on the crate, so it fades as the box slides in. */}
                  <text x={TRIGGER.w / 2} y={GROUND - TRIGGER.h - 5} textAnchor="middle" className="sp-soft pl-fade" style={{ opacity: beat === 2 ? 1 : 0 }}>
                    trigger
                  </text>
                </g>
              )}
              {open && <rect className="pl-hit" x={hit.x} y={hit.y} width={hit.w} height={hit.h} />}
              {beat >= 1 && (
                <g className="pl-in">
                  {[PLATE, CRATE].map((part) => (
                    <rect
                      key={part.y}
                      className={beat === 1 ? 'sp-clear sp-line sp-stroke-b sp-heavy sp-dash pl-ants' : 'sp-clear sp-line sp-stroke-b sp-heavy sp-dash'}
                      {...{
                        x: part.x,
                        y: part.y,
                        width: part.w,
                        height: part.h,
                      }}
                    />
                  ))}
                </g>
              )}
            </svg>
          </div>
        )
      }}
    </Fig>
  )
}

type Pivot = 'centre' | 'corner'
const WALL = { span: 4, height: 3, thick: 0.3 }
const BODIES = [
  { name: 'roof', x: 0, y: WALL.height, w: WALL.span, h: 0.4 },
  { name: 'crate', x: 5, y: 0, w: 1, h: 1 },
]
const M = 34
const mx = (m: number) => 86 + m * M
const my = (m: number) => 150 - m * M

// Where the body ends up: the sum picks a position for the assumed pivot, then the engine hangs
// the body off that position by its actual pivot. Offsets are the body's min corner against the intent.
const miss = (body: (typeof BODIES)[number], assumed: Pivot, actual: Pivot) =>
  assumed === actual ? [0, 0] : assumed === 'centre' ? [body.w / 2, body.h / 2] : [-body.w / 2, -body.h / 2]

const verdict = (body: (typeof BODIES)[number], d: number[]) => `${body.name}: ${d[0] === 0 && d[1] === 0 ? 'where it should be' : `off by (${signed(d[0])}, ${signed(d[1])}) m`}`

function PivotPanel({ title, assumed, actual }: { title: string; assumed: Pivot; actual: Pivot }) {
  const landed = BODIES.map((body) => ({
    body,
    d: miss(body, assumed, actual),
  }))
  const right = assumed === actual
  return (
    <div className="sp-panel sp-fit fit-pivot">
      <p className="sp-title">{title}</p>
      <svg
        viewBox="0 0 320 196"
        role="img"
        aria-label={
          right
            ? 'Side view of two walls with the roof resting on top of them and a crate resting on the ground beside them.'
            : `Side view of two walls. ${landed.map(({ body, d }) => `The ${body.name} is ${Math.abs(d[0])} m too far ${d[0] > 0 ? 'right' : 'left'} and ${Math.abs(d[1])} m too ${d[1] > 0 ? 'high' : 'low'}`).join('. ')}.`
        }
      >
        <path className="sp-line" d={`M6,${my(0)} H314`} />
        <text x="8" y={my(0) + 14} className="sp-soft sp-small">
          y = 0
        </text>
        <text x={mx(WALL.span / 2)} y={my(WALL.height / 2)} textAnchor="middle" className="sp-soft sp-small">
          walls {WALL.height} m
        </text>
        {[0, WALL.span - WALL.thick].map((x) => (
          <rect key={x} className="sp-box" x={mx(x)} y={my(WALL.height)} width={WALL.thick * M} height={WALL.height * M} />
        ))}
        {landed.map(({ body, d }) => (
          <g key={body.name}>
            <rect className="sp-clear sp-line sp-faint sp-dash" x={mx(body.x)} y={my(body.y + body.h)} width={body.w * M} height={body.h * M} />
            <g className="sp-move" style={{ transform: `translate(${d[0] * M}px, ${-d[1] * M}px)` }}>
              <rect className="sp-tint-a sp-line" x={mx(body.x)} y={my(body.y + body.h)} width={body.w * M} height={body.h * M} />
              <circle className="sp-fill-b" r="4.5" cx={mx(body.x + (actual === 'centre' ? body.w / 2 : 0))} cy={my(body.y + (actual === 'centre' ? body.h / 2 : 0))} />
            </g>
          </g>
        ))}
        {/* Verdicts keep fixed slots, above the walls and under the ground line, so only the bodies move. */}
        <text x={mx(WALL.span / 2)} y="12" textAnchor="middle" className="sp-strong sp-small">
          {verdict(landed[0].body, landed[0].d)}
        </text>
        <text x="314" y="190" textAnchor="end" className="sp-strong sp-small">
          {verdict(landed[1].body, landed[1].d)}
        </text>
      </svg>
    </div>
  )
}

const ASSUMED: Pivot[] = ['centre', 'corner']
const PIVOT_BEATS = ASSUMED.map((pivot) => `the sum assumes the pivot is at the ${pivot}`)
// An invisible fraction, so the lines without one are as tall as the lines with one and the panels below do not move.
const STRUT = '\\vphantom{\\tfrac{1}{2}}'

function PivotSum() {
  const roof = BODIES[0]
  return (
    <Fig
      id="pivot-sum"
      labels={PIVOT_BEATS}
      ms={pace(PIVOT_BEATS)}
      caption="The sum for the roof's position is correct for the pivot it assumes, and the roof is off by half its own size whenever the real pivot is the other one."
    >
      {(beat) => {
        const assumed = ASSUMED[beat]
        const sum =
          assumed === 'centre'
            ? [
                `x = x_{\\text{wall}} + \\tfrac{w}{2} = 0 + \\tfrac{${roof.w}}{2} = ${roof.w / 2}`,
                `y = h_{\\text{wall}} + \\tfrac{t}{2} = ${WALL.height} + \\tfrac{${roof.h}}{2} = ${WALL.height + roof.h / 2}`,
              ]
            : [`x = x_{\\text{wall}} = 0 ${STRUT}`, `y = h_{\\text{wall}} = ${WALL.height} ${STRUT}`]
        return (
          <>
            <div className="sp-sum">
              {sum.map((line) => (
                <p key={line}>
                  <Tex>{line}</Tex>
                </p>
              ))}
            </div>
            <div className="sp-panels">
              <PivotPanel title="Pivot really at a corner" assumed={assumed} actual="corner" />
              <PivotPanel title="Pivot really at the centre (Godot's BoxMesh)" assumed={assumed} actual="centre" />
            </div>
          </>
        )
      }}
    </Fig>
  )
}

const SPOT = { x: 165, y: 140, turn: 120 }
const BIT = 1.5
const PX_PER_M = 60
// Unit vectors on screen (y down) for "right" in each frame. The camera looks up-left, so its right is up-right.
const RIGHTS = {
  camera: { label: "the camera's right", dir: [Math.SQRT1_2, -Math.SQRT1_2] },
  own: {
    label: 'its own right',
    dir: [Math.cos((SPOT.turn * Math.PI) / 180), Math.sin((SPOT.turn * Math.PI) / 180)],
  },
  world: { label: 'world +X', dir: [1, 0] },
} as const
type Right = keyof typeof RIGHTS
const FRAME_BEATS: {
  right: Right
  name: string
  widthM: number
  label: string
}[] = [
  {
    right: 'camera',
    name: 'chair',
    widthM: 0.5,
    label: 'right as the camera sees it',
  },
  {
    right: 'own',
    name: 'chair',
    widthM: 0.5,
    label: 'right as the chair faces',
  },
  { right: 'world', name: 'chair', widthM: 0.5, label: 'right along world +X' },
  {
    right: 'camera',
    name: 'sofa',
    widthM: 1,
    label: 'a bigger object: "a bit" grows with it',
  },
]

function Seat({ size, ghost }: { size: number; ghost?: boolean }) {
  const half = size / 2
  return (
    <>
      <rect className={ghost ? 'sp-clear sp-line sp-stroke-a sp-heavy sp-dash pl-ants' : 'sp-box'} x={-half} y={-half} width={size} height={size} rx="3" />
      <rect className={ghost ? 'sp-clear sp-line sp-stroke-a' : 'sp-box sp-tint-b'} x={-half} y={half - 6} width={size} height="6" />
    </>
  )
}

function Frames() {
  return (
    <Fig
      id="frames"
      labels={FRAME_BEATS.map((b) => b.label)}
      ms={pace(FRAME_BEATS.map((b) => b.label))}
      caption="The same instruction moves the chair to three different places, depending on whose right it is, and how far depends on what is being moved."
    >
      {(beat) => {
        const { right, name, widthM } = FRAME_BEATS[beat]
        const size = widthM * PX_PER_M
        const reach = BIT * size
        const end = (r: Right) => [SPOT.x + RIGHTS[r].dir[0] * reach, SPOT.y + RIGHTS[r].dir[1] * reach]
        const [tx, ty] = end(right)
        const [ux, uy] = RIGHTS[right].dir
        const [dx, dz] = [ux, uy].map((c) => (c * reach) / PX_PER_M)
        const angle = (Math.atan2(uy, ux) * 180) / Math.PI
        return (
          <div className="sp-fit fit-frames">
            <svg
              viewBox="0 0 340 272"
              role="img"
              aria-label={`Top-down view of a room with a window in the top wall, a camera in the bottom right corner looking up and left, and a ${name} turned 120 degrees. Moving the ${name} a bit to the right along ${RIGHTS[right].label} shifts it ${signed(dx)} m in x and ${signed(dz)} m in z.`}
            >
              <rect className="sp-frame" x="20" y="20" width="300" height="220" />
              <path className="sp-line sp-stroke-b sp-heavy" d="M190,20 H260" />
              {/* Outside the wall: inside the room the sofa's ghost lands on it. */}
              <text x="225" y="13" textAnchor="middle">
                window
              </text>
              <path className="sp-line" d="M34,34 H64 M34,34 V64 M59,30 L64,34 L59,38 M30,59 L34,64 L38,59" />
              <text x="70" y="38">
                x
              </text>
              <text x="30" y="78">
                z
              </text>
              <g transform="translate(285,215) rotate(-45)">
                <path className="sp-line sp-faint" d="M0,-14 L-34,-80 M0,-14 L34,-80" />
                <path className="sp-box" d="M-8,-6 H8 V6 H-8 Z M-5,-6 L0,-14 L5,-6" />
              </g>
              <text x="285" y="236" textAnchor="middle">
                camera
              </text>
              {(Object.keys(RIGHTS) as Right[])
                .filter((r) => r !== right)
                .map((r) => (
                  <path key={r} className="sp-line sp-faint sp-dash" d={`M${SPOT.x},${SPOT.y} L${end(r).join(',')}`} />
                ))}
              <g
                className="sp-move"
                style={{
                  transform: `translate(${tx}px, ${ty}px) rotate(${SPOT.turn}deg)`,
                }}
              >
                <Seat size={size} ghost />
              </g>
              <g transform={`translate(${SPOT.x},${SPOT.y}) rotate(${SPOT.turn})`}>
                <Seat size={size} />
              </g>
              <path className="sp-line sp-stroke-a sp-heavy" d={`M${SPOT.x},${SPOT.y} L${tx},${ty}`} />
              <path className="sp-line sp-stroke-a sp-heavy" d="M-8,-5 L0,0 L-8,5" transform={`translate(${tx},${ty}) rotate(${angle})`} />
              {/* The readout has one slot under the room: on the arrow it turned with every beat and sat on the furniture. */}
              <text className="sp-strong" textAnchor="middle" x="170" y="262">
                {BIT} × {name} width = {BIT * widthM} m
              </text>
            </svg>
          </div>
        )
      }}
    </Fig>
  )
}

export const FIGURES: Record<string, ComponentType> = {
  'two-loops': TwoLoops,
  'object-facts': ObjectFacts,
  'plate-layers': PlateLayers,
  'pivot-sum': PivotSum,
  frames: Frames,
  ...DESIGN_FIGURES,
  ...RESULTS_FIGURES,
  ...FUN_FIGURES,
  ...SCALE_FIGURES,
}
