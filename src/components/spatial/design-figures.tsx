import { useEffect, useRef, useState, type CSSProperties, type ComponentType, type ReactNode } from 'react'
import { animate } from 'framer-motion'
import { prefersReducedMotion } from '../../lib/motion'
import { Fig, Swap, iso, pace } from './kit'
import { RelationFigure } from './relation-figure'

const STAGES = [
  { title: ['voxel map'], sub: ['model never', 'sees this'], look: 'sp-box sp-dash' },
  { title: ['relations'], sub: ['what the', 'model reads'], look: 'sp-box' },
  { title: ['model'], sub: ['only box that', 'reads language'], look: 'sp-box sp-tint-a' },
  { title: ['abstract', 'actions'], sub: ['tool calls'], look: 'sp-box' },
  { title: ['solver'], sub: ['exact', 'positions'], look: 'sp-box' },
  { title: ['checks'], sub: ['invariants,', 'pass or fail'], look: 'sp-box' },
]
const BOX = { w: 104, h: 64 }
const FLOW_LABEL =
  'A pipeline: voxel map, relations, model, abstract actions, solver, checks. The voxel map is marked as something the model never sees, and the model is the only box that reads language. A dashed edge runs from the checks back to the model. A token travels through every stage, fails at the checks, returns to the model, goes through again and passes.'

// Drawn twice, left to right and top to bottom, from the same stage list. `lane` is where the
// loop back runs: below the row when wide, to the right of the column when tall.
function Flow({ tall }: { tall?: boolean }) {
  const box = (i: number) => (tall ? { x: 60, y: 8 + i * 84 } : { x: 8 + i * 118, y: 84 })
  const mid = (i: number) => ({ x: box(i).x + BOX.w / 2, y: box(i).y + BOX.h / 2 })
  const [first, model, checks] = [mid(0), mid(2), mid(5)]
  const lane = tall ? 212 : 204
  // The token's whole trip: through every stage, fail at the checks, back along the lane to the model, through again.
  const trip = tall
    ? `M${first.x},${first.y} V${checks.y} H${lane} V${model.y} H${model.x} V${checks.y}`
    : `M${first.x},${first.y} H${checks.x} V${lane} H${model.x} V${model.y} H${checks.x}`
  const span = (from: number, to: number, label: string) => {
    const x0 = box(from).x
    const x1 = box(to).x + BOX.w
    return (
      <g key={from}>
        <path className="sp-line sp-faint" d={`M${x0},62 V54 H${x1} V62`} />
        <text x={(x0 + x1) / 2} y="44" textAnchor="middle" className="sp-soft">
          {label}
        </text>
      </g>
    )
  }
  return (
    <svg className={tall ? 'sp-flow-tall' : 'sp-flow-wide'} viewBox={tall ? '0 0 250 500' : '0 0 716 236'} role="img" aria-label={FLOW_LABEL}>
      {!tall && [span(0, 1, 'geometry, in code'), span(2, 2, 'language'), span(3, 5, 'geometry, in code')]}
      {STAGES.slice(1).map((_, i) => (
        <path
          key={i}
          className="sp-line"
          d={tall ? `M${mid(i).x},${box(i).y + BOX.h} V${box(i + 1).y - 1} m-4,-5 l4,5 l4,-5` : `M${box(i).x + BOX.w},${mid(i).y} H${box(i + 1).x - 1} m-5,-4 l5,4 l-5,4`}
        />
      ))}
      <path
        className="sp-line sp-stroke-b sp-dash"
        d={tall ? `M${checks.x + BOX.w / 2},${checks.y} H${lane} V${model.y} H${model.x + BOX.w / 2 + 2}` : `M${checks.x},${checks.y + BOX.h / 2} V${lane} H${model.x} V${model.y + BOX.h / 2 + 2}`}
      />
      <path
        className="sp-line sp-stroke-b"
        d={tall ? `M${model.x + BOX.w / 2 + 8},${model.y - 5} l-7,5 l7,5` : `M${model.x - 5},${model.y + BOX.h / 2 + 8} l5,-7 l5,7`}
      />
      <text textAnchor="middle" transform={tall ? `translate(${lane + 16},${(model.y + checks.y) / 2}) rotate(90)` : `translate(${(model.x + checks.x) / 2},${lane + 18})`}>
        check failed: back to the model
      </text>
      {STAGES.map((stage, i) => (
        <g key={stage.title[0]}>
          <rect className={stage.look} x={box(i).x} y={box(i).y} width={BOX.w} height={BOX.h} rx="5" />
          {[...stage.title, ...stage.sub].map((line, n) => (
            <text key={line} x={mid(i).x} y={box(i).y + 23 + n * 15} textAnchor="middle" className={n < stage.title.length ? 'sp-strong' : 'sp-soft sp-small'}>
              {line}
            </text>
          ))}
        </g>
      ))}
      <text x={tall ? 26 : checks.x - 12} y={tall ? checks.y + 6 : box(5).y - 8} textAnchor="middle" className="sp-mark sp-mark--fail">
        ✕
      </text>
      <text x={tall ? 44 : checks.x + 12} y={tall ? checks.y + 6 : box(5).y - 8} textAnchor="middle" className="sp-mark sp-mark--pass">
        ✓
      </text>
      {/* At rest (reduced motion) the token stops on the last arrow, 96% of the way: at 100% it would sit on the checks' caption for good. */}
      <circle r="6" className="sp-token sp-token--pipe" style={{ offsetPath: `path("${trip}")`, '--rest': '96%' } as CSSProperties} />
    </svg>
  )
}

function Pipeline() {
  return (
    <Fig id="pipeline" caption="The model sits between two runs of exact code, and a failed check sends the action back to it.">
      <div className="sp-flow sp-fit">
        <Flow />
        <Flow tall />
      </div>
    </Fig>
  )
}

const ROOMS = { living_room: { x: 20, w: 180 }, kitchen: { x: 200, w: 120 } }
// `named` is who the object's own relation block mentions; chair_03's list is the block in the post.
// Ring 1 is drawn as a circle just past the farthest named object, so positions are chosen to keep
// every object that is not named outside that circle. Moving one means re-checking that.
// `side` is where the name goes when above the dot would put it on a wall, the frame or another name.
// The chair stands low in the room so that its circle, which has to reach the door, stays inside the drawing.
const SIDES = { above: [0, -12, 'middle'], below: [2, 20, 'start'], left: [-10, 4, 'end'], right: [12, 4, 'start'], 'above-right': [2, -12, 'start'] } as const
const LEVEL: { id: string; x: number; y: number; room: keyof typeof ROOMS; address: string; named: string[]; side?: keyof typeof SIDES }[] = [
  { id: 'chair_03', x: 75, y: 150, room: 'living_room', address: 'living_room/W-wall', named: ['table_01', 'window_01', 'sofa_01', 'door_02'], side: 'right' },
  { id: 'table_01', x: 75, y: 108, room: 'living_room', address: 'living_room/W-side', named: ['chair_03', 'window_01'] },
  { id: 'window_01', x: 22, y: 150, room: 'living_room', address: 'living_room/W-wall', named: ['chair_03', 'table_01'], side: 'above-right' },
  { id: 'sofa_01', x: 118, y: 180, room: 'living_room', address: 'living_room/centre', named: ['chair_03', 'door_02', 'shelf_01'], side: 'left' },
  { id: 'door_02', x: 75, y: 215, room: 'living_room', address: 'living_room/S-wall', named: ['sofa_01'] },
  { id: 'lamp_02', x: 160, y: 50, room: 'living_room', address: 'living_room/NE-corner', named: ['table_01'] },
  { id: 'shelf_01', x: 168, y: 190, room: 'living_room', address: 'living_room/SE-corner', named: ['sofa_01'] },
  { id: 'stool_02', x: 240, y: 125, room: 'kitchen', address: 'kitchen/W-side', named: ['sink_01'] },
  { id: 'sink_01', x: 290, y: 150, room: 'kitchen', address: 'kitchen/SE-corner', named: ['stool_02'], side: 'left' },
  { id: 'fridge_01', x: 300, y: 50, room: 'kitchen', address: 'kitchen/NE-corner', named: ['stool_02'], side: 'left' },
]
const TIER_LOOK = ['sp-tint-a sp-line sp-stroke-a sp-heavy', 'sp-fill-b', 'sp-box', 'sp-box sp-faint sp-dash']
const tierOf = (focus: (typeof LEVEL)[number], o: (typeof LEVEL)[number]) => (o.id === focus.id ? 0 : focus.named.includes(o.id) ? 1 : o.room === focus.room ? 2 : 3)
const object = (id: string) => LEVEL.find((o) => o.id === id)!
const inTier = (focus: (typeof LEVEL)[number], tier: number) => LEVEL.filter((o) => tierOf(focus, o) === tier).map((o) => o.id)
// The plan beats: which object is being edited, the one ring the beat picks out (none: every ring as
// it is), the beat's label, and the line under the drawing as [who or what, the fact].
const CHAIR = object('chair_03')
const PLAN_BEATS: { edit: string; tier?: number; label: string; readout: string[] }[] = [
  { edit: 'chair_03', label: 'editing chair_03: it gets its full relations', readout: ['focus', 'chair_03: full relations, ~50–150 tokens, plus its address, ~10'] },
  { edit: 'chair_03', tier: 1, label: 'ring 1, inside the circle: the objects its relations name', readout: ['ring 1', `${inTier(CHAIR, 1).join(', ')}: neighbour list and key relations`] },
  { edit: 'chair_03', tier: 2, label: 'ring 2, inside the dashed outline: the rest of its room', readout: ['ring 2', `${inTier(CHAIR, 2).join(', ')}: one cached summary`] },
  { edit: 'chair_03', tier: 3, label: 'beyond: the other rooms', readout: ['beyond', `${inTier(CHAIR, 3).join(', ')}: an address each, like kitchen/NE-corner, ~10 tokens`] },
  // The stool, because its circle stays inside the drawing and clear of every name; the sofa's runs off the bottom.
  {
    edit: 'stool_02',
    label: 'editing stool_02: the rings move with the edit',
    readout: ['total', `stool_02 in full · ${inTier(object('stool_02'), 1).length} in ring 1 · 1 room summary · ${inTier(object('stool_02'), 3).length} addresses: roughly 200 tokens`],
  },
]
const VOXEL_BEATS = [
  'underneath: the same rooms as voxels, built from the colliders',
  'what is chair_03 on, and what is it near? code reads it off the voxels',
  'does stool_02 fit beside sink_01? code tests its footprint against the free cells',
]
const VOXEL_NOTES = [
  '',
  'The cubes of chair_03 and of window_01 in the wall beside it are highlighted.',
  'The cube of stool_02 is highlighted, and so is one empty floor cell beside sink_01, marked as a fit.',
]
const LOD_BEATS = [...PLAN_BEATS.map((step) => step.label), ...VOXEL_BEATS]

// The voxel view of the same plan. A cell is 15 plan units, counted from the rooms' north-west corner,
// and each entry is [column, row, cells east, cells south, cells high]. Walls take the row and column
// just outside the floor; the south and east walls are left out because they would hide the rooms.
const CELL = 15
const VOXELS: Record<string, [number, number, number, number, number]> = {
  chair_03: [3, 8, 1, 1, 2],
  table_01: [3, 5, 2, 2, 1],
  window_01: [-1, 7, 1, 3, 2],
  sofa_01: [5, 10, 3, 2, 1],
  door_02: [3, 13, 2, 1, 3],
  lamp_02: [9, 2, 1, 1, 3],
  shelf_01: [10, 10, 1, 3, 3],
  stool_02: [14, 7, 1, 1, 1],
  sink_01: [18, 8, 1, 2, 2],
  fridge_01: [18, 1, 2, 2, 3],
}
const WALLS: (typeof VOXELS)[string][] = [
  [-1, -1, 21, 1, 2],
  [-1, 0, 1, 13, 2],
  [12, 0, 1, 9, 2],
]
// The free cell the stool is tested against: south of the sink, where no cube stands in front of it.
const FIT = [18, 10]
// The one line under the drawing, a beat at a time; between them the beats carry every fact a legend
// would. The two relations in the chair's answer are rows of its block in the post.
const READOUT = [
  ...PLAN_BEATS.map((step) => step.readout),
  ['voxels', 'underneath, built from the colliders and meshes: the model never sees them'],
  ['code answers', 'chair_03: on floor · near window_01 (close)'],
  ['code answers', 'stool_02 fits beside sink_01'],
]
// Names in the voxel view. Type on cube faces is unreadable, so each name sits on a paper plate in a
// corner the cubes never reach, with a leader to its object. `at` is where the leader meets the plate,
// in drawing units; the plate hangs from that point toward `hang` and is sized in em, because the type
// is 7.4 units on a desktop and 11.9 on a phone. The corners are checked against the phone size.
// `to` is the leader's other end: a plan position and a height in cells.
// `query` is which voxel beat the plate belongs to.
const PLATES: { query: number; text: string; at: number[]; hang: 'down' | 'up' | 'right'; to: number[] }[] = [
  { query: 0, text: 'living_room', at: [52, 174], hang: 'down', to: [110, 205, 0] },
  { query: 0, text: 'kitchen', at: [290, 205], hang: 'down', to: [312, 120, 0] },
  { query: 1, text: 'window_01', at: [41, 25], hang: 'up', to: [12.5, 147.5, 2] },
  // As near the chair as the plate gets while it stays off the floor and its leader clears the door and the sofa.
  { query: 1, text: 'chair_03', at: [56, 152], hang: 'down', to: [72.5, 155, 1] },
  { query: 2, text: 'stool_02', at: [150, 214], hang: 'down', to: [237.5, 140, 0.5] },
  { query: 2, text: 'fits', at: [214.7, 216], hang: 'down', to: [297.5, 185, 0] },
  { query: 2, text: 'sink_01', at: [262, 208], hang: 'right', to: [305, 155, 1] },
]
const VIEW = { x: 142, y: 40, unit: 0.7 }
const FLOOR_GRID = [...Array.from({ length: 19 }, (_, i) => `M${35 + i * CELL},20 V215`), ...Array.from({ length: 12 }, (_, j) => `M20,${35 + j * CELL} H320`)].join(' ')

// Every cube face that can be seen: a side is dropped when the next cell along is at least as tall.
// Sorted back to front, which in this view is by column plus row.
const FACES = (() => {
  const columns = new Map<string, { id: string; height: number }>()
  const fill = (id: string, [i, j, w, d, height]: number[]) => {
    for (let a = 0; a < w; a++) for (let b = 0; b < d; b++) columns.set(`${i + a},${j + b}`, { id, height })
  }
  WALLS.forEach((wall) => fill('wall', wall))
  Object.entries(VOXELS).forEach(([id, box]) => fill(id, box))
  const tall = (i: number, j: number) => columns.get(`${i},${j}`)?.height ?? 0
  return [...columns]
    .flatMap(([cell, { id, height }]) => {
      const [i, j] = cell.split(',').map(Number)
      const [x0, y0, x1, y1] = [20 + i * CELL, 20 + j * CELL, 20 + (i + 1) * CELL, 20 + (j + 1) * CELL]
      const faces: { side: string; points: number[][] }[] = []
      for (let k = 0; k < height; k++) {
        if (tall(i, j + 1) <= k) faces.push({ side: 'l', points: [[x0, y1, k], [x1, y1, k], [x1, y1, k + 1], [x0, y1, k + 1]] })
        if (tall(i + 1, j) <= k) faces.push({ side: 'r', points: [[x1, y0, k], [x1, y1, k], [x1, y1, k + 1], [x1, y0, k + 1]] })
      }
      faces.push({ side: 't', points: [[x0, y0, height], [x1, y0, height], [x1, y1, height], [x0, y1, height]] })
      return faces.map((face) => ({ ...face, id, depth: i + j }))
    })
    .sort((a, b) => a.depth - b.depth)
})()

function LodRings() {
  return (
    <Fig
      id="lod-rings"
      labels={LOD_BEATS}
      // A beat is never shorter than it takes to look over the plan. The two that start with a change of view wait it out as well.
      ms={pace(LOD_BEATS, 2400).map((ms, i) => ms + (i % PLAN_BEATS.length === 0 ? 1100 : 0))}
      // A reader who gets one frame gets the voxels: the plan and its rings are what the caption and the text describe.
      still={PLAN_BEATS.length}
      // The view tilts back to the plan by itself.
      fadeLoop={false}
      caption="Detail falls off with distance from the object being edited, the way render distance does in a game."
    >
      {(beat) => (
        <>
          <LodScene beat={beat} />
          <p className="sp-readout">
            <Swap show={beat} options={READOUT.map(([who]) => <b>{who}</b>)} />
            <Swap show={beat} options={READOUT.map(([, what]) => what)} />
          </p>
        </>
      )}
    </Fig>
  )
}

// Goes to `target` over 1.1 s instead of jumping, and reverses from wherever it is if the target changes on the way.
function useEased(target: number) {
  const [value, setValue] = useState(target)
  const last = useRef(target)
  useEffect(() => {
    if (last.current === target) return
    if (prefersReducedMotion()) {
      last.current = target
      return setValue(target)
    }
    const run = animate(last.current, target, {
      duration: 1.1,
      ease: 'easeInOut',
      onUpdate: (v) => {
        last.current = v
        setValue(v)
      },
    })
    return () => run.stop()
  }, [target])
  return value
}

function LodScene({ beat }: { beat: number }) {
  // 0 is the flat plan and 1 the voxel view. The plan tilts over the first half, then the voxels rise.
  const step: (typeof PLAN_BEATS)[number] | undefined = PLAN_BEATS[beat]
  const solid = !step
  const view = useEased(solid ? 1 : 0)
  const tilt = Math.min(1, view / 0.5)
  const rise = Math.max(0, view / 0.5 - 1)
  const query = solid ? beat - PLAN_BEATS.length : -1

  // The voxel beats keep the rings where the first beat has them, so the way back to it moves nothing but the view.
  const focus = step ? object(step.edit) : CHAIR
  const told = (tier: number) => inTier(focus, tier).join(', ') || 'nothing'
  const picked = (o: (typeof LEVEL)[number]) => step?.tier === undefined || tierOf(focus, o) === 0 || tierOf(focus, o) === step.tier
  const reach = Math.max(...LEVEL.filter((o) => tierOf(focus, o) === 1).map((o) => Math.hypot(o.x - focus.x, o.y - focus.y))) + 8
  const room = ROOMS[focus.room]

  const spot = (x: number, y: number, z = 0) => {
    const [ix, iy] = iso(x - 20, y - 20, z * CELL * rise, VIEW.unit)
    return [x + (VIEW.x + ix - x) * tilt, y + (VIEW.y + iy - y) * tilt]
  }
  // The floor is a plane, so everything lying on it takes one matrix; only labels and voxels are placed point by point.
  const [e, f] = spot(0, 0)
  const [ax, ay] = spot(1, 0)
  const [bx, by] = spot(0, 1)
  const floor = `matrix(${[ax - e, ay - f, bx - e, by - f, e, f].map((n) => n.toFixed(4)).join(' ')})`
  const lit = query === 1 ? ['chair_03', 'window_01'] : query === 2 ? ['stool_02'] : []
  // The plan's names ride the tilt, upright, and are gone before the first cube rises.
  const label = (x: number, y: number, text: string, look: string, side: keyof typeof SIDES = 'above') => {
    const [lx, ly] = spot(x, y)
    const [dx, dy, anchor] = SIDES[side]
    // Each name stands on a patch of the page colour, so a ring or an outline stops at the name and never runs through it.
    const width = text.length * 0.6 + 0.5
    return (
      <g key={text} transform={`translate(${(lx + dx).toFixed(1)},${(ly + dy).toFixed(1)})`} className={look} style={{ opacity: 1 - tilt }}>
        <rect className="sp-patch" x={`${{ start: -0.25, middle: -width / 2, end: 0.25 - width }[anchor]}em`} y="-1em" width={`${width}em`} height="1.35em" />
        <text textAnchor={anchor} className={look}>
          {text}
        </text>
      </g>
    )
  }
  const cube = ([i, j]: number[], side: string) => {
    const [x0, y0, x1, y1] = [20 + i * CELL, 20 + j * CELL, 20 + (i + 1) * CELL, 20 + (j + 1) * CELL]
    const corners = { l: [[x0, y1, 0], [x1, y1, 0], [x1, y1, 1], [x0, y1, 1]], r: [[x1, y0, 0], [x1, y1, 0], [x1, y1, 1], [x1, y0, 1]], t: [[x0, y0, 1], [x1, y0, 1], [x1, y1, 1], [x0, y1, 1]] }[side]!
    return corners.map(([x, y, z]) => spot(x, y, z).map((n) => n.toFixed(1)).join()).join(' ')
  }
  const plan = `A ring is centred on ${focus.id}, the object being edited, and reaches the objects its relations name: ${told(1)}. A dashed outline marks the rest of its room, the ${focus.room}: ${told(2)}. The other room holds ${told(3)}.`

  return (
    <div className="sp-fit fit-lod">
      <svg
        viewBox="0 0 340 236"
        role="img"
        aria-label={
          solid
            ? `The same living room and kitchen seen from above at an angle, with the walls and the ten objects built from small cubes on a grid floor. ${VOXEL_NOTES[query]} The ring and the dashed outline lie on the floor. ${plan}`
            : `Top-down plan of a living room and a kitchen with ten objects. ${plan}`
        }
      >
        <g transform={floor}>
          <path className="sp-frame" d="M20,20 H320 V215 H20 Z M200,20 V150" />
          <path className="sp-frame" style={{ opacity: tilt * 0.6, strokeWidth: 0.6 }} d={FLOOR_GRID} />
          {/* The rings are the model's side; they dim while the drawing is about the layer under them. */}
          <g style={{ opacity: 1 - 0.65 * rise }}>
            <rect className="sp-line sp-stroke-a sp-dash" x={room.x + 4} y="24" width={room.w - 8} height="187" />
            <circle className="sp-line sp-stroke-a sp-move" r={reach} style={{ transform: `translate(${focus.x}px, ${focus.y}px)` }} />
          </g>
          {/* The cells from the window's wall to the chair: the floor it stands on and the gap that makes it close. */}
          <rect className="sp-cue sp-tint-a sp-line sp-stroke-a" style={{ opacity: query === 1 ? 1 : 0 }} x="20" y={20 + VOXELS.chair_03[1] * CELL} width={(VOXELS.chair_03[0] + 1) * CELL} height={CELL} />
          <path
            className="sp-cue sp-line sp-stroke-a sp-dash"
            style={{ opacity: query === 2 ? 1 : 0 }}
            // East first, so the first leg leaves the stool on the side away from its leader.
            d={`M${20 + (VOXELS.stool_02[0] + 1) * CELL},${20 + (VOXELS.stool_02[1] + 0.5) * CELL} h${1.5 * CELL} V${20 + (FIT[1] + 0.5) * CELL} H${20 + FIT[0] * CELL}`}
          />
          {rise < 1 &&
            LEVEL.map((o) => {
              const tier = tierOf(focus, o)
              return <circle key={o.id} className={`sp-cue ${TIER_LOOK[tier]}`} style={{ opacity: (picked(o) ? 1 : 0.3) * (1 - rise) }} cx={o.x} cy={o.y} r={tier === 0 ? 8 : 6} />
            })}
        </g>
        {rise > 0 &&
          FACES.map((face, i) => (
            <polygon
              key={i}
              className={`sp-vox sp-vox--${face.side}${face.id === 'wall' ? ' sp-vox--wall' : lit.includes(face.id) ? ' sp-vox--lit' : ''}`}
              style={{ opacity: Math.min(1, rise * 3) }}
              points={face.points.map(([x, y, z]) => spot(x, y, z).map((n) => n.toFixed(1)).join()).join(' ')}
            />
          ))}
        {/* The stool's footprint, tried in the free cell. That cell is nearer the eye than every cube, so it is drawn last. */}
        {rise > 0 && ['l', 'r', 't'].map((side) => <polygon key={side} className="sp-cue sp-vox sp-vox--ghost" style={{ opacity: query === 2 ? rise : 0 }} points={cube(FIT, side)} />)}
        {tilt < 1 && (
          <>
            {label(28, 18, 'living_room', 'sp-soft', 'below')}
            {label(208, 18, 'kitchen', 'sp-soft', 'below')}
            {/* A beat about one ring sets that ring's names in full ink; no name is ever dimmed. */}
            {LEVEL.map((o) => label(o.x, o.y, o.id, o.id === focus.id || (step?.tier !== undefined && picked(o)) ? 'sp-strong sp-small' : 'sp-soft sp-small', o.side))}
          </>
        )}
        {rise > 0 && (
          <g style={{ opacity: rise }}>
            {PLATES.map((plate) => {
              const width = plate.text.length * 0.6 + 0.8
              const [cx, cy] = { down: [0, 0.8], up: [0, -0.8], right: [width / 2, 0] }[plate.hang]
              const [tx, ty] = spot(plate.to[0], plate.to[1], plate.to[2])
              return (
                <g key={plate.query + plate.text} className="sp-cue" style={{ opacity: plate.query === query ? 1 : 0 }}>
                  <path className="sp-leader" d={`M${plate.at.join()} L${tx.toFixed(1)},${ty.toFixed(1)}`} />
                  <circle className="sp-leader-end" cx={tx} cy={ty} r="1.6" />
                  <g transform={`translate(${plate.at.join()})`}>
                    <rect className="sp-plate" x={`${cx - width / 2}em`} y={`${cy - 0.8}em`} width={`${width}em`} height="1.6em" rx="1.5" />
                    <text x={`${cx}em`} y={`${cy}em`} textAnchor="middle" dominantBaseline="central" className="sp-strong">
                      {plate.text}
                    </text>
                  </g>
                </g>
              )
            })}
          </g>
        )}
      </svg>
    </div>
  )
}

// Metres, x east and z south, with the west wall at x = 0. The chair, window and table sit where
// relation-figure.tsx puts them: that figure derives the block's relations from these positions.
const ROOM = [
  { id: 'chair_03', position: [0.8, 0, 2.4] },
  { id: 'table_01', position: [0.8, 0, 1.2] },
  { id: 'window_01', position: [0, 1.2, 2] },
  { id: 'sofa_01', position: [3, 0, 4] },
  { id: 'door_02', position: [0.8, 0, 5] },
]
const PX = 44
const plan = (m: number) => 14 + m * PX
const PLAN_AT: Record<string, [number, number]> = Object.fromEntries(
  ROOM.map((o): [string, [number, number]] => [o.id, [plan(o.position[0]), plan(o.position[2])]]),
)

function RoomPlan({ lit, floor, note, under, over }: { lit: (id: string) => boolean; floor?: boolean; note: string; under?: ReactNode; over?: ReactNode }) {
  const look = (id: string, base: string) => (lit(id) ? `${base} sp-tint-a sp-stroke-a sp-heavy` : base)
  const [cx, cy] = PLAN_AT.chair_03
  return (
    <svg
      viewBox="0 0 292 250"
      role="img"
      aria-label={`Top-down plan of the living room. The chair is near the west wall and faces the table to its north. The window is in the west wall on the chair's left, the door is in the south wall behind it, and the sofa is to the south-east. ${note}`}
    >
      <rect className={floor ? 'sp-frame sp-tint-a' : 'sp-frame'} x={plan(0)} y={plan(0)} width={6 * PX} height={5 * PX} />
      {under}
      <path className={look('window_01', 'sp-line sp-stroke-b sp-heavy')} d={`M${plan(0)},${plan(1.2)} V${plan(2.8)}`} />
      <text className="sp-small" x={plan(0) + 6} y={plan(2.8) + 12}>
        window_01
      </text>
      <rect className={look('table_01', 'sp-box')} x={plan(0.3)} y={plan(0.8)} width={PX} height={0.8 * PX} />
      <text className="sp-small" x={plan(1.4)} y={plan(1.25)}>
        table_01
      </text>
      <rect className={look('chair_03', 'sp-box')} x={cx - 11} y={cy - 11} width="22" height="22" rx="3" />
      <path className="sp-line" d={`M${cx - 5},${cy - 14} l5,-6 l5,6`} />
      <text className="sp-small" x={cx + 18} y={cy + 4}>
        chair_03
      </text>
      <rect className={look('sofa_01', 'sp-box')} x={plan(3) - 0.4 * PX} y={plan(4) - 0.8 * PX} width={0.8 * PX} height={1.6 * PX} />
      <text className="sp-small" x={plan(3.5)} y={plan(4) + 4}>
        sofa_01
      </text>
      <path className={look('door_02', 'sp-line sp-stroke-b sp-heavy')} d={`M${plan(0.4)},${plan(5)} H${plan(1.2)}`} />
      <text className="sp-small" x={plan(1.3)} y={plan(5) - 6}>
        door_02
      </text>
      {over}
    </svg>
  )
}

const CLICK_BEATS = [
  'a click lands on the chair',
  'id: which object it hit',
  'world point: exactly where the click landed',
  'relations: what is around that object',
  'screenshot: the view at that moment',
  '"move that up a bit": "that" is this reference',
  'a click on empty floor: no id, still a point and its surroundings',
]
// World points in the same metres as ROOM. The second one is bare floor in the north-east of the room.
const CLICKS = {
  object: { id: 'chair_03', point: [0.9, 0.4, 2.3], relations: ['on floor', 'facing table_01', 'left: window_01 <1m'] },
  floor: { id: null, point: [4.5, 0, 1.5], relations: ['on floor', 'in living_room/NE-corner', 'nearest: sofa_01 2-3m'] },
}

function ClickReference() {
  return (
    <Fig
      id="click-reference"
      labels={CLICK_BEATS}
      rest={5}
      ms={pace(CLICK_BEATS, 2000)}
      caption="A click hands the model an exact reference in place of a description: what was hit, where, what is around it and what the view looked like."
    >
      {(beat) => {
        const onFloor = beat === 6
        const click = onFloor ? CLICKS.floor : CLICKS.object
        // On the floor click every field is already filled; on the object click they arrive one beat each.
        const built = (n: number) => onFloor || beat >= n
        // Both clicks' values share one cell per field, so the card keeps its height while it fills and when it swaps.
        const field = (n: number, value: (c: typeof click) => ReactNode) => (
          <Swap options={[value(CLICKS.object), value(CLICKS.floor)]} show={built(n) ? (onFloor ? 1 : 0) : -1} />
        )
        const [px, pz] = [plan(click.point[0]), plan(click.point[2])]
        return (
          <div className="sp-panels">
            <div className="sp-panel sp-fit fit-room">
              <p className="sp-title">The scene</p>
              <RoomPlan
                lit={(id) => id === click.id}
                note={`A cursor has clicked ${click.id ?? 'an empty spot on the floor'}.`}
                over={
                  <g className="sp-move" style={{ transform: `translate(${px}px, ${pz}px)` }}>
                    <circle className="sp-line sp-stroke-a sp-heavy" r="9" />
                    <path className="sp-box" d="M0,0 V16 L4.5,12 L7.5,18 L10,17 L7,11 H12 Z" />
                  </g>
                }
              />
            </div>
            <div className="sp-panel">
              <p className="sp-title">The reference the model receives</p>
              <dl className="sp-tiers">
                <dt>id</dt>
                <dd>{field(1, (c) => c.id ?? 'none: nothing was hit')}</dd>
                <dt>point</dt>
                <dd>{field(2, (c) => `(${c.point.join(', ')})`)}</dd>
                <dt>relations</dt>
                <dd>{field(3, (c) => c.relations.map((line) => <div key={line}>{line}</div>))}</dd>
                <dt>screenshot</dt>
                <dd>
                  {field(4, (c) => (
                    <svg className="sp-thumb" viewBox="0 0 96 60" aria-hidden="true">
                      <rect className="sp-box" x="1" y="1" width="94" height="58" rx="3" />
                      <path className="sp-line sp-faint" d="M1,40 H95 M20,40 V18 H44 V40 M58,40 V26 H86 V40" />
                      <circle className="sp-line sp-stroke-a" cx={c.id ? 32 : 70} cy={c.id ? 30 : 50} r="5" />
                    </svg>
                  ))}
                </dd>
              </dl>
              <p className="sp-chat" style={{ visibility: beat === 5 ? 'visible' : 'hidden' }}>
                “move <span className="sp-hit">that</span> up a bit”: <span className="sp-hit">that</span> = {CLICKS.object.id} at ({CLICKS.object.point.join(', ')})
              </p>
            </div>
          </div>
        )
      }}
    </Fig>
  )
}

const SNAP = { x: 122, y: 90 }
const SOCKET_BEATS = ['apart: wall-top accepts roof-edge', 'attach(roof, walls.top): tags agree, snapped', 'attach(fence, walls.top): wrong tag, refused']

function Socket({ x, y, up, tag }: { x: number; y: number; up: boolean; tag?: { text: string; dy: number } }) {
  const tip = up ? -18 : 18
  return (
    <g transform={`translate(${x},${y})`}>
      <path className="sp-line sp-stroke-b sp-heavy" d={`M0,0 V${tip} m-4,${up ? 6 : -6} l4,${up ? -6 : 6} l4,${up ? 6 : -6}`} />
      <circle className="sp-fill-b" r="4.5" />
      {tag && (
        <text x="0" y={tag.dy} textAnchor="middle" className="sp-strong sp-small">
          {tag.text}
        </text>
      )}
    </g>
  )
}

function Sockets() {
  return (
    <Fig id="sockets" labels={SOCKET_BEATS} rest={1} ms={pace(SOCKET_BEATS, 2200)} caption="A socket is a position, an orientation and a tag, and the solver only joins two sockets whose tags agree.">
      {(beat) => {
        const snapped = beat >= 1
        const refused = beat === 2
        return (
          <div className="sp-fit fit-sockets">
            <svg
              viewBox="0 0 340 246"
              role="img"
              aria-label={`Side view of two walls, a roof slab and a fence panel. The left wall's top edge has a socket tagged wall-top that accepts roof-edge. The roof's socket is tagged roof-edge and the roof is ${
                snapped ? 'snapped onto the walls, socket to socket' : 'floating above the walls, tilted'
              }. The fence's socket is tagged fence-post${refused ? ', and its attach call is refused' : ''}.`}
            >
              <path className="sp-line" d="M8,200 H332" />
              <rect className="sp-box" x={SNAP.x - 12} y={SNAP.y} width="24" height={200 - SNAP.y} />
              <rect className="sp-box" x={SNAP.x + 124} y={SNAP.y} width="24" height={200 - SNAP.y} />
              {/* Line steps in em: the type is 7.7 units on a desktop and 12 on a phone. */}
              <text x="142" y="110" className="sp-strong sp-small">
                wall-top
                <tspan x="142" dy="1.3em" className="sp-soft sp-small">
                  accepts
                </tspan>
                <tspan x="142" dy="1.3em" className="sp-soft sp-small">
                  roof-edge
                </tspan>
              </text>
              <rect className="sp-box" x="22" y="156" width="56" height="44" />
              <path className="sp-line sp-faint" d="M36,156 V200 M50,156 V200 M64,156 V200" />
              <Socket x={50} y={156} up tag={{ text: 'fence-post', dy: 62 }} />
              {refused && (
                <g>
                  <path className="sp-line sp-dash pl-ants" d={`M50,134 Q70,84 ${SNAP.x - 8},${SNAP.y - 6}`} />
                  <path className="sp-line sp-heavy" d="M72,92 l10,10 m0,-10 l-10,10" />
                </g>
              )}
              <Socket x={SNAP.x} y={SNAP.y} up />
              <text x={SNAP.x - 18} y={SNAP.y - 41} textAnchor="end" className="sp-strong sp-small">
                {snapped ? 'snapped' : 'apart'}
              </text>
              {refused && (
                <text x="8" y="238" className="sp-strong sp-small">
                  refused: wall-top does not accept fence-post
                </text>
              )}
              <g className="sp-move" style={{ transformOrigin: `${SNAP.x}px ${SNAP.y}px`, transform: snapped ? 'none' : 'translate(30px, -36px) rotate(-7deg)' }}>
                <rect className="sp-box sp-tint-a" x={SNAP.x - 32} y={SNAP.y - 16} width="200" height="16" />
                <Socket x={SNAP.x} y={SNAP.y} up={false} tag={{ text: 'roof-edge', dy: -22 }} />
              </g>
            </svg>
          </div>
        )
      }}
    </Fig>
  )
}

const RUNGS = [
  {
    call: 'build_house()',
    verdict: 'too high',
    gist: 'the model just picks a generator',
    model: 'Which generator to call.',
    code: 'Which pieces there are and where every one of them goes.',
  },
  {
    call: 'attach(roof, walls.top)',
    verdict: 'the middle',
    gist: 'the model picks, code does the math',
    model: 'Which roof goes on which walls.',
    code: 'The exact position and rotation that join the two.',
  },
  {
    call: 'set_position(x, y, z)',
    verdict: 'too low',
    gist: 'the model does the coordinate math',
    model: 'Which object to move, and all three numbers.',
    code: 'Nothing. It writes the numbers down.',
  },
]

const RUNG_BEATS = RUNGS.map((rung) => `${rung.call}: ${rung.verdict}`)

function ActionLadder() {
  return (
    <Fig
      id="action-ladder"
      labels={RUNG_BEATS}
      rest={1}
      // A rung is three short sentences, which its label's three words do not account for.
      ms={pace(RUNG_BEATS, 2800)}
      caption="The useful rung is the one where the model still makes the choice and code still does the math."
    >
      {(beat) => (
        <ol className="sp-ladder">
          {RUNGS.map((rung, i) => (
            <li key={rung.call} className={`sp-rung${i === 1 ? ' sp-rung--fit' : ''}${i === beat ? ' sp-rung--on' : ''}`}>
              <div>
                <code>{rung.call}</code>
                <p>
                  <strong>{rung.verdict}:</strong> {rung.gist}
                </p>
              </div>
              <div>
                <p className="sp-title">The model decides</p>
                <p>{rung.model}</p>
              </div>
              <div>
                <p className="sp-title">Code decides</p>
                <p>{rung.code}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Fig>
  )
}

export const DESIGN_FIGURES: Record<string, ComponentType> = {
  pipeline: Pipeline,
  'lod-rings': LodRings,
  'relation-view': RelationFigure,
  'click-reference': ClickReference,
  sockets: Sockets,
  'action-ladder': ActionLadder,
}
