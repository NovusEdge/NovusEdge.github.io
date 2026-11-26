import katex from 'katex'
import { Fig, Swap, pace } from './kit'
import './relation.css'

// Metres and degrees, right-handed with y up: x runs east and z south. A model's front is +z at yaw 0,
// which puts +x on its left. The chair's yaw of 180 turns it to face north, at the table.
const CHAIR = { id: 'chair_03', position: [0.8, 0, 2.4], rotation: [0, 180, 0] }
const WINDOW = { id: 'window_01', position: [0, 1.2, 2], rotation: [0, 90, 0] }
const TABLE = { id: 'table_01', position: [0.8, 0, 1.2] }

const round = (n: number) => +n.toFixed(2)

// Where a point is on the floor from the chair's point of view: the offset in world axes, the same
// offset turned back by the chair's yaw into its own axes, and the words those bucket into.
function fromChair(to: number[]) {
  const [dx, dz] = [round(to[0] - CHAIR.position[0]), round(to[2] - CHAIR.position[2])]
  const yaw = (CHAIR.rotation[1] * Math.PI) / 180
  const left = round(dx * Math.cos(yaw) - dz * Math.sin(yaw))
  const ahead = round(dx * Math.sin(yaw) + dz * Math.cos(yaw))
  const metres = round(Math.hypot(left, ahead))
  const side = Math.abs(left) > Math.abs(ahead) ? (left > 0 ? 'left' : 'right') : ahead > 0 ? 'ahead' : 'behind'
  const bucket = metres < 1 ? '<1m' : `${Math.floor(metres)}-${Math.floor(metres) + 1}m`
  return { dx, dz, left, ahead, metres, side, bucket }
}
const SEEN = fromChair(WINDOW.position)

// The block in the post, character for character: key, separator, items.
const BLOCK: [string, string, string[]][] = [
  ['chair_03   ', '', ['living_room/W-wall, by window_01']],
  ['  on       ', '', ['floor']],
  ['  facing   ', '', ['table_01']],
  ['  near     ', ', ', ['window_01 (close)', 'sofa_01 (medium)']],
  ['  around   ', ' · ', ['ahead: table_01 1-2m', 'left: window_01 <1m', 'behind: door_02 2-3m']],
]
// The two items this figure derives. The numbers above have to produce them, and the table's too, or the drawing contradicts the block.
const DERIVED = [`${SEEN.side}: ${WINDOW.id} ${SEEN.bucket}`, `${WINDOW.id} (${SEEN.metres < 1 ? 'close' : 'medium'})`]
const table = fromChair(TABLE.position)
for (const item of [...DERIVED, `${table.side}: ${TABLE.id} ${table.bucket}`]) {
  if (!BLOCK.some(([, , items]) => items.includes(item))) throw new Error(`relation-view: the transforms give "${item}", which is not in the chair's block`)
}

const LABELS = [
  `where is ${WINDOW.id}, from ${CHAIR.id}'s point of view?`,
  'subtract the two positions: an offset, still in world axes',
  `turn it by the chair's yaw: ${SEEN.left} m to its left, ${SEEN.ahead} m ahead`,
  'bucket that into words: these are the lines the model reads',
  'roughly 200 tokens per object, against thousands for raw transforms',
]

// The plan shows the corner of the room by the window, 130 units to the metre.
const M = 130
const at = (p: number[]): [number, number] => [58 + p[0] * M, (p[2] - 0.86) * M]
const [CX, CY] = at(CHAIR.position)
const [WX, WY] = at(WINDOW.position)
const [TX, TY] = at(TABLE.position)
const REACH = Math.hypot(WX - CX, WY - CY)
const [UX, UY] = [(WX - CX) / REACH, (WY - CY) / REACH]
const HEAD = [
  [WX, WY],
  [WX - UX * 12 - UY * 5.5, WY - UY * 12 + UX * 5.5],
  [WX - UX * 12 + UY * 5.5, WY - UY * 12 - UX * 5.5],
]
  .map((p) => p.map((n) => n.toFixed(1)).join())
  .join(' ')
// Half a right angle either side of the chair's left, out to 1 m.
const D = M * Math.SQRT1_2

const tex = (source: string) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(source, { throwOnError: false }) }} />
const list = (v: number[]) => `[${v.join(', ')}]`
const shown = (on: boolean) => ({ opacity: on ? 1 : 0 })

function Plan({ beat }: { beat: number }) {
  const offset = beat >= 1
  const turned = beat >= 2
  const bucketed = beat >= 3
  return (
    <svg
      className="rv-plan"
      viewBox="0 0 340 330"
      role="img"
      aria-label={
        `Top-down plan of the corner of a room. ${WINDOW.id} is in the west wall, ${CHAIR.id} stands ${-SEEN.dx} m east of the wall, and ${TABLE.id} is north of the chair.` +
        (offset ? ' An arrow runs from the chair to the window.' : ' A dashed line with a question mark joins the chair and the window.') +
        (turned ? ` The chair faces north, so the arrow is ${SEEN.left} m to its left and ${SEEN.ahead} m ahead.` : '') +
        (bucketed ? ` The arrow ends inside the chair's left quarter and inside a ring 1 m from the chair.` : '')
      }
    >
      <defs>
        <clipPath id="rv-room">
          <rect x="58" y="0" width="282" height="330" />
        </clipPath>
      </defs>
      <rect className="rv-wall" x="46" y="0" width="12" height="330" />
      <rect className="sp-fill-b" x="46" y={WY - 0.8 * M} width="12" height={1.6 * M} />
      <text textAnchor="middle" className="sp-strong" transform={`translate(36,${WY}) rotate(-90)`}>
        {WINDOW.id}
      </text>
      <text textAnchor="middle" className="sp-soft" transform={`translate(18,${WY}) rotate(-90)`}>
        x {WINDOW.position[0]} · z {WINDOW.position[2]}
      </text>
      <rect className="sp-box" x={TX - 0.5 * M} y={TY - 0.3 * M} width={M} height={0.6 * M} rx="3" />
      <text x={TX} y={TY + 4} textAnchor="middle">
        {TABLE.id}
      </text>

      <g className="rv-fade" style={shown(true)}>
        <path className="sp-line" d="M268,56 H300 m-6,-4 l6,4 l-6,4 M268,56 V88 m-4,-6 l4,6 l4,-6" />
        <text x="306" y="60">
          x
        </text>
        <text x="268" y="102" textAnchor="middle">
          z
        </text>
        <text x="290" y="80" className="sp-soft">
          world
        </text>
      </g>

      <g clipPath="url(#rv-room)" className="rv-fade" style={shown(bucketed)}>
        <path className="sp-tint-a" d={`M${CX},${CY} L${CX - D},${CY - D} A${M},${M} 0 0 0 ${CX - D},${CY + D} Z`} />
        <path className="sp-line sp-faint sp-dash" d={`M${CX - D},${CY - D} L${CX + D},${CY + D} M${CX - D},${CY + D} L${CX + D},${CY - D}`} />
        <circle className="sp-line sp-dash" cx={CX} cy={CY} r={M} />
        <text x={CX - 62} y={CY + 44} textAnchor="middle" className="sp-strong">
          left
        </text>
        <text x={CX + 44} y={CY - 66} textAnchor="middle" className="sp-soft">
          ahead
        </text>
        <text x={CX + 72} y={CY + 4} textAnchor="middle" className="sp-soft">
          right
        </text>
        <text x={CX} y={CY + 96} textAnchor="middle" className="sp-soft">
          behind
        </text>
        <text x={CX + M + 6} y={CY + 4} className="sp-halo">
          1 m
        </text>
      </g>

      <g className="rv-fade" style={shown(beat === 0)}>
        <path className="sp-line sp-dash" d={`M${CX},${CY} L${WX},${WY}`} />
        <text x={(CX + WX) / 2} y={(CY + WY) / 2 - 10} textAnchor="middle" className="sp-mark sp-halo">
          ?
        </text>
      </g>

      <path className="sp-line sp-dash rv-fade" style={shown(offset && !bucketed)} d={`M${CX},${CY} V${WY} H${WX}`} />
      <rect className={offset ? 'sp-box sp-tint-a' : 'sp-box'} x={CX - 18} y={CY - 18} width="36" height="36" rx="4" />
      {/* Drawn at yaw 0, back to the north and front to the south, then turned by the yaw. Positive yaw is anticlockwise seen from above. */}
      <g className="rv-turn" style={{ ...shown(turned), transform: `translate(${CX}px, ${CY}px) rotate(${turned ? -CHAIR.rotation[1] : 0}deg)` }}>
        <path className="sp-line" style={{ strokeWidth: 5 }} d="M-12,-22 H12" />
        <path className="sp-line sp-heavy" d="M-7,23 l7,8 l7,-8" />
      </g>
      <text x={CX} y={CY + 38} textAnchor="middle" className="sp-strong sp-halo">
        {CHAIR.id}
      </text>
      <text x={CX} y={CY + 54} textAnchor="middle" className="sp-soft sp-halo">
        x {CHAIR.position[0]} · z {CHAIR.position[2]}
      </text>

      <path className="sp-line sp-heavy rv-draw" pathLength="1" style={{ ...shown(offset), strokeDashoffset: offset ? 0 : 1 }} d={`M${CX},${CY} L${WX - UX * 9},${WY - UY * 9}`} />
      <polygon className="rv-ink rv-fade" style={{ ...shown(offset), transitionDelay: offset ? '0.7s' : '0s' }} points={HEAD} />
      <circle className="rv-pivot" cx={CX} cy={CY} r="5" />
      <circle className="rv-pivot" cx={WX} cy={WY} r="5" />

      {[
        { x: (CX + WX) / 2, y: WY - 9, anchor: 'middle' as const, world: `x ${SEEN.dx}`.replace('-', '−'), own: `${SEEN.left} m left` },
        { x: CX + 9, y: (CY - 18 + WY) / 2 + 1, anchor: 'start' as const, world: `z ${SEEN.dz}`.replace('-', '−'), own: `${SEEN.ahead} m ahead` },
      ].map((leg) => (
        <g key={leg.anchor}>
          <text x={leg.x} y={leg.y} textAnchor={leg.anchor} className="sp-strong sp-halo rv-fade" style={shown(beat === 1)}>
            {leg.world}
          </text>
          <text x={leg.x} y={leg.y} textAnchor={leg.anchor} className="sp-strong sp-halo rv-fade" style={shown(beat === 2)}>
            {leg.own}
          </text>
        </g>
      ))}
      <text x={CX + 30} y={CY + 4} className="sp-soft sp-halo rv-fade" style={shown(beat === 2)}>
        yaw {CHAIR.rotation[1]}°
      </text>
      <text
        textAnchor="middle"
        className="sp-strong sp-halo rv-fade"
        style={shown(bucketed)}
        transform={`translate(${(CX + WX) / 2 - UY * 9},${(CY + WY) / 2 + UX * 9}) rotate(${(Math.atan2(-UY, -UX) * 180) / Math.PI})`}
      >
        {SEEN.metres} m
      </text>
    </svg>
  )
}

const BARS = Array.from({ length: 100 }, (_, i) => <rect key={i} className="rv-ink" x={(i % 10) * 12} y={Math.floor(i / 10) * 6} width="9" height="3" />)

const TEXT = [
  {
    title: 'What the engine stores',
    body: (
      <>
        <div className="rv-raw">{[CHAIR, WINDOW].map((o) => `${o.id}\n  position  ${list(o.position)}\n  rotation  ${list(o.rotation)}\n`).join('')}</div>
        <p className="rv-note">Metres and degrees. No line says which side of the chair the window is on.</p>
      </>
    ),
  },
  {
    title: 'Step 1: subtract',
    body: (
      <>
        <div className="sp-sum">
          <p>{tex(`\\mathbf{d} = \\mathbf{p}_\\text{window} - \\mathbf{p}_\\text{chair}`)}</p>
          <p>{tex(`= (${WINDOW.position[0]},\\ ${WINDOW.position[2]}) - (${CHAIR.position[0]},\\ ${CHAIR.position[2]})`)}</p>
          <p>{tex(`= (${SEEN.dx},\\ ${SEEN.dz})`)}</p>
        </div>
        <p className="rv-note">On the floor, so x and z only. That is an offset in the world's axes, and the chair's left and right are not in it yet.</p>
      </>
    ),
  },
  {
    title: 'Step 2: turn by the yaw',
    body: (
      <>
        <div className="sp-sum">
          <p>{tex(`R_y(-${CHAIR.rotation[1]}^\\circ)\\,\\mathbf{d} = (${SEEN.left},\\ ${SEEN.ahead})`)}</p>
          <p>{tex(`\\lVert\\mathbf{d}\\rVert = \\sqrt{${Math.abs(SEEN.left)}^2 + ${Math.abs(SEEN.ahead)}^2} \\approx ${SEEN.metres}\\ \\text{m}`)}</p>
        </div>
        <p className="rv-note">
          Now it is in the chair's own axes:{' '}
          <b>
            {SEEN.left} m to its left, {SEEN.ahead} m ahead
          </b>
          .
        </p>
      </>
    ),
  },
  {
    title: 'What the model reads',
    body: (
      <>
        <div>
          {BLOCK.map(([key, sep, items]) => (
            <div key={key} className="rv-row">
              <span>{key}</span>
              <span>
                {items.map((item, i) => (
                  <span key={item}>
                    {i > 0 && sep}
                    <span className={`${items.length > 1 ? 'rv-item' : ''} ${DERIVED.includes(item) ? 'sp-hit' : ''}`}>{item}</span>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="rv-note">
          Mostly to its left, so <b>left</b>. {SEEN.metres} m is under a metre, so <b>{SEEN.bucket}</b> and <b>close</b>.
        </p>
      </>
    ),
  },
  {
    title: 'What it costs',
    body: (
      <>
        <div className="rv-vs">
          <svg className="rv-glyph" viewBox="0 0 117 57" aria-hidden="true">
            {BARS}
          </svg>
          <svg className="rv-glyph" viewBox="0 0 117 57" aria-hidden="true">
            {[52, 30, 44, 86, 117].map((w, i) => (
              <rect key={i} className="rv-ink" x={i ? 8 : 0} y={30 + i * 6} width={i ? w - 8 : w} height="3" />
            ))}
          </svg>
          <p>raw transforms, 100 objects</p>
          <p>relation view, per object</p>
          <p>
            <strong>thousands of tokens</strong>
          </p>
          <p>
            <strong>roughly 200 tokens</strong>
          </p>
        </div>
        <p className="rv-note">And every relation is something code can check, the way it worked this one out.</p>
      </>
    ),
  },
]

export function RelationFigure() {
  return (
    <Fig
      id="relation-view"
      labels={LABELS}
      rest={3}
      // Each beat has a block of text to read beside the drawing, which the label's own length does not account for.
      ms={pace(LABELS, 4400)}
      // Every part of the plan fades or draws its own way back to the first beat.
      fadeLoop={false}
      caption="Getting from two transforms to “the window is on my left” takes a subtraction and a rotation. Code does that once, exactly, and the model reads the answer as words."
    >
      {(beat) => (
        <div className="rv">
          <Plan beat={beat} />
          <div className="rv-text">
            <Swap
              show={beat}
              options={TEXT.map(({ title, body }) => (
                <>
                  <p className="sp-title">{title}</p>
                  {body}
                </>
              ))}
            />
          </div>
        </div>
      )}
    </Fig>
  )
}
