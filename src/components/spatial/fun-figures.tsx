import { useEffect, useRef, useState, type ComponentType } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import { Fig, FigPause, pace } from './kit'
import { JumpFootage } from './jump-footage'
import './fun.css'

// Names and values as they appear in Celeste's Source/Player/Player.cs. Speeds are px/s, y down.
const C = { JumpGraceTime: 0.1, UpwardCornerCorrection: 4, JumpSpeed: -105, VarJumpTime: 0.2, Gravity: 900, MaxFall: 160, MaxRun: 90 }
const FPS = 60
const SIZE = 8

// Ledge scene, in game px: the ledge ends at EDGE and the far platform starts at FAR. x is the
// player's left edge, because the player leaves the ground when its trailing edge passes the ledge;
// at MaxRun that makes x - EDGE a clock, 9 px per 0.1 s, and the time axis is drawn on it.
const EDGE = 30
const FAR = 78
const LEDGE = { scale: 3, ground: 176 }
const PRESS_FRAMES = [4, 8]

// ponytail: a jump held for the whole of VarJumpTime under plain gravity. Leaves out the half
// gravity near the apex and JumpHBoost; add them if the arc ever has to match the game frame for frame.
function leave(pressFrame: number) {
  const points = [[EDGE - 20, 0]]
  let [x, y, vy, hold] = [EDGE, 0, 0, 0]
  let press = [x, y]
  for (let frame = 0; y < 18; frame++) {
    points.push([x, y])
    if (frame === pressFrame) {
      press = [x, y]
      if (frame / FPS < C.JumpGraceTime) {
        vy = C.JumpSpeed
        hold = Math.round(C.VarJumpTime * FPS)
      }
    }
    if (hold > 0) hold--
    else vy = Math.min(C.MaxFall, vy + C.Gravity / FPS)
    x += C.MaxRun / FPS
    y += vy / FPS
    if (vy > 0 && y >= 0 && x + SIZE > FAR) {
      points.push([x, 0], [x + 10, 0])
      break
    }
  }
  const { scale, ground } = LEDGE
  // The path is the player's centre.
  const d = 'M' + points.map(([px, py]) => `${((px + SIZE / 2) * scale).toFixed(1)},${(ground + (py - SIZE / 2) * scale).toFixed(1)}`).join(' L')
  return { d, press: { x: press[0] * scale, y: ground + press[1] * scale }, at: (pressFrame / FPS).toFixed(2) }
}
const LEAVES = PRESS_FRAMES.map(leave)
const VERDICTS = [
  ['in the window', '→ it jumps'],
  ['too late', '→ it falls'],
]

// Corner scene, 5 units per game px. The player jumps straight up with its left side OVERLAP px
// under the block's corner. Player.cs then tries Position += (i, -1) for i = 1..UpwardCornerCorrection
// and takes the first that is free, so the shift is sideways and here equals the overlap.
const OVERLAP = 3
const CORNER = { scale: 5, ground: 220, blockLeft: 70, blockRight: 170, blockTop: 115, blockBottom: 140 }
const JUMP_HEIGHT = -C.JumpSpeed * C.VarJumpTime + C.JumpSpeed ** 2 / (2 * C.Gravity)

function CornerScene() {
  const { scale, ground, blockLeft, blockRight, blockTop, blockBottom } = CORNER
  const size = SIZE * scale
  const left = blockRight - OVERLAP * scale
  const cx = left + size / 2
  const hit = blockBottom + size / 2
  const d = `M${cx},${ground - size / 2} V${hit} L${cx + OVERLAP * scale},${hit - scale} V${(ground - size / 2 - JUMP_HEIGHT * scale).toFixed(1)}`
  const zone = C.UpwardCornerCorrection * scale
  return (
    <>
      <rect className="sp-box sp-tint-b" x="-2" y={ground} width="364" height="24" />
      <rect className="sp-box sp-tint-b" x={blockLeft} y={blockTop} width={blockRight - blockLeft} height={blockBottom - blockTop} />
      <rect className="sp-tint-a" x={blockRight - zone} y={blockTop} width={zone} height={blockBottom - blockTop} />
      <rect className="sp-line sp-dash" x={left} y={blockBottom} width={size} height={size} rx="3" />
      <path className="sp-line sp-faint sp-dash" d={d} />
      <path className="sp-line sp-stroke-a sp-heavy" d={`M${left},${blockBottom} H${blockRight}`} />
      <text x="8" y="20" className="sp-strong">
        UpwardCornerCorrection = {C.UpwardCornerCorrection}
      </text>
      <text x="8" y="36" className="sp-soft sp-small">
        up to {C.UpwardCornerCorrection} px sideways
      </text>
      <text x={blockLeft + 4} y={blockTop - 7} className="sp-soft sp-small">
        ceiling
      </text>
      <text x={blockRight - zone - 4} y={blockBottom - 8} textAnchor="end" className="sp-small">
        {C.UpwardCornerCorrection} px
      </text>
      <text x={left - 8} y={blockBottom + 20} textAnchor="end" className="sp-soft">
        without the nudge
      </text>
      <text x={left - 8} y={blockBottom + 36} textAnchor="end" className="sp-soft">
        the jump ends here
      </text>
      <text x={blockRight + size + 8} y={blockBottom + 10}>
        clips by {OVERLAP} px
      </text>
      <text x={blockRight + size + 8} y={blockBottom + 26} className="sp-strong">
        → moved {OVERLAP} px over
      </text>
      <rect className="fun-player" x={-size / 2} y={-size / 2} width={size} height={size} rx="3" style={{ offsetPath: `path("${d}")` }} />
    </>
  )
}

function LedgeScene({ beat }: { beat: number }) {
  const { scale, ground } = LEDGE
  const size = SIZE * scale
  const edge = EDGE * scale
  const tick = C.JumpGraceTime * C.MaxRun * scale
  const { d, press, at } = LEAVES[beat]
  return (
    <>
      <rect className="sp-tint-a" x={edge} y="52" width={tick} height={ground - 52} />
      <rect className="sp-box sp-tint-b" x="-2" y={ground} width={edge + 2} height="70" />
      <rect className="sp-box sp-tint-b" x={FAR * scale} y={ground} width="130" height="70" />
      <text x="8" y={ground + 20} className="sp-soft sp-small">
        ledge
      </text>
      <text x={edge} y="14" className="sp-strong">
        JumpGraceTime = 0.1f
      </text>
      <text x="244" y="14" className="sp-soft sp-small">
        ≈ {Math.round(C.JumpGraceTime * C.MaxRun)} px at a run
      </text>
      <path className="sp-line" d={`M${edge},52 H${edge + tick * 3}` + [0, 1, 2, 3].map((i) => ` M${edge + tick * i},47 v10`).join('')} />
      {['0', '0.1', '0.2', '0.3'].map((label, i) => (
        <text key={label} x={edge + tick * i} y="40" textAnchor="middle">
          {label}
        </text>
      ))}
      <text x={edge + tick * 3 + 8} y="56" className="sp-soft sp-small">
        s after the ledge
      </text>
      {beat === 1 && <path className="sp-line sp-faint sp-dash" d={LEAVES[0].d} />}
      <path className="sp-line sp-dash" d={d} />
      <path className="sp-line" d={`M${press.x},52 V${press.y - size}`} />
      <rect className="sp-line sp-dash" x={press.x} y={press.y - size} width={size} height={size} rx="2" />
      <circle className="fun-dot" cx={press.x} cy="52" r="4" />
      {[`pressed ${at} s`, ...VERDICTS[beat]].map((line, i) => (
        <text key={line} x="354" y={72 + i * 16} textAnchor="end" className={i === 2 ? 'sp-strong' : undefined}>
          {line}
        </text>
      ))}
      <rect className="fun-player" x={-size / 2} y={-size / 2} width={size} height={size} rx="2" style={{ offsetPath: `path("${d}")` }} />
    </>
  )
}

const CELESTE_LABELS = [
  `A side view of a square player running off a ledge. A time axis starts at the ledge edge and its first 0.1 seconds are shaded: the grace window, JumpGraceTime = 0.1f. Jump is pressed at ${LEAVES[0].at} seconds, inside the window, with the player already in the air, and the jump still happens and carries it to the far platform.`,
  `The same ledge and the same 0.1 second window. Jump is pressed at ${LEAVES[1].at} seconds, just after the window closes, and nothing happens: the player falls into the gap.`,
  `A square player jumps straight up with its side ${OVERLAP} pixels under the corner of a ceiling block. Without correction the jump would end there. UpwardCornerCorrection = 4 lets the game shift the player sideways by up to 4 pixels, so it moves ${OVERLAP} pixels over and carries on up past the block.`,
]

const CELESTE_BEATS = ['pressed inside the 0.1 s grace window', 'pressed just after the window', 'corner correction']

function CelesteJump() {
  const [lap, setLap] = useState(0)
  const [loop] = useState(() => () => setLap((l) => l + 1))
  return (
    <Fig
      id="celeste-jump"
      ownPause
      caption="A jump from Celeste's launch trailer, slowed to half speed, with the 0.1 s grace window from the game's player code drawn past the end of the plank. The 4 px corner nudge is a drawing, because the trailer has no jump that shows it. Footage: Celeste (Maddy Makes Games), launch trailer from Maddy Thorson's YouTube channel."
    >
      <div className="sp-panels">
        <JumpFootage grace={C.JumpGraceTime} run={C.MaxRun} onLoop={loop} />
        <div>
          <div className="sp-fit fit-celeste">
            {/* Keyed by the video's lap so the player's one-shot run restarts each time the clip loops. */}
            <svg key={lap} viewBox="0 0 360 240" role="img" aria-label={CELESTE_LABELS[2]}>
              <CornerScene />
            </svg>
          </div>
          <p className="sp-beat jf-beat">the corner nudge, drawn to scale</p>
        </div>
      </div>
    </Fig>
  )
}

// The drawn version of the figure above. Point the 'celeste-jump' line in FUN_FIGURES at it to bring it back.
export function CelesteJumpDiagram() {
  return (
    <Fig
      id="celeste-jump"
      labels={CELESTE_BEATS}
      // The player's run takes 3.1 s from the start of a beat.
      ms={pace(CELESTE_BEATS, 3800)}
      caption="Two forgiveness tricks from Celeste's public player code: a jump still counts for 0.1 s after you run off the ledge, and the game nudges you up to 4 px sideways around a ceiling corner."
    >
      {(beat) => (
        // Keyed by beat so the player's one-shot run restarts when a beat comes round again.
        <div className="sp-fit fit-celeste">
          <svg key={beat} viewBox="0 0 360 240" role="img" aria-label={CELESTE_LABELS[beat]}>
            {beat === 2 ? <CornerScene /> : <LedgeScene beat={beat} />}
          </svg>
        </div>
      )}
    </Fig>
  )
}

// From runs/platformer/abstract-0/main.tscn in godot-checks, metres: box centres on the ground
// plane, the height of each walkable top, and box sizes along x and z. Every slab is 0.4 m thick.
const SLAB = { w: 3, d: 3, thick: 0.4 }
const SURFACES = [
  ...Array.from({ length: 6 }, (_, i) => ({ id: `Stairs_${i + 1}`, x: -5, z: -4.95 - 0.9 * i, top: 0.3 * (i + 1), w: 2, d: 0.9 })),
  { id: 'Landing', x: -5, z: -11.4, top: 2.1, ...SLAB },
  { id: 'Platform1', x: -5, z: -16.4, top: 2.6, ...SLAB },
  { id: 'Platform2', x: -10.5, z: -16.4, top: 2.6, ...SLAB },
  { id: 'Platform3', x: -10.5, z: -20.9, top: 3.4, ...SLAB },
  { id: 'Platform4', x: -16.5, z: -20.9, top: 2.9, ...SLAB },
]
const START = { x: -5, z: -3 }
const PLAYER = { speed: 5, jump_velocity: 6, gravity: 15 }
const REACH = { up: PLAYER.jump_velocity ** 2 / (2 * PLAYER.gravity), across: (PLAYER.speed * 2 * PLAYER.jump_velocity) / PLAYER.gravity }

// Top view turned so the route reads left to right: screen x runs along -z, screen y along -x.
const K = 17
const sx = (z: number) => (-z - 3) * K + 12
const sy = (x: number) => (-x - 3.5) * K + 30
const BOXES = Object.fromEntries(SURFACES.map((s) => [s.id, { ...s, bx: sx(s.z + s.d / 2), by: sy(s.x + s.w / 2), bw: s.d * K, bh: s.w * K }]))
const SLABS = SURFACES.filter((s) => s.w === SLAB.w)

// The straight line across the gap between two boxes, and its length in metres. For Landing to
// Platform2 this gives 3.20, the figure check.json reports for that edge.
const across = (lo1: number, len1: number, lo2: number, len2: number) => {
  if (lo1 + len1 < lo2) return [lo1 + len1, lo2]
  if (lo2 + len2 < lo1) return [lo1, lo2 + len2]
  const mid = (Math.max(lo1, lo2) + Math.min(lo1 + len1, lo2 + len2)) / 2
  return [mid, mid]
}
function gap(from: string, to: string) {
  const [a, b] = [BOXES[from], BOXES[to]]
  const [x1, x2] = across(a.bx, a.bw, b.bx, b.bw)
  const [y1, y2] = across(a.by, a.bh, b.by, b.bh)
  return { d: `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`, metres: Math.hypot(x2 - x1, y2 - y1) / K }
}
type Edge = { from: string; to: string; x: number; y: number; anchor: 'start' | 'middle' | 'end' }
// The order the platforms were built in. Label positions are placed by hand, clear of the boxes.
const BUILT: Edge[] = [
  { from: 'Landing', to: 'Platform1', x: 197, y: 22, anchor: 'middle' },
  { from: 'Platform1', to: 'Platform2', x: 246, y: 106, anchor: 'start' },
  { from: 'Platform2', to: 'Platform3', x: 278, y: 190, anchor: 'middle' },
  { from: 'Platform3', to: 'Platform4', x: 310, y: 210, anchor: 'end' },
]
// check.json, goal-reachable: "ground -> Stairs_3 -> Stairs_6 -> Landing -> Platform2 -> Platform4".
const SHORTCUT: Edge[] = [
  { from: 'Landing', to: 'Platform2', x: 190, y: 112, anchor: 'end' },
  { from: 'Platform2', to: 'Platform4', x: 268, y: 208, anchor: 'end' },
]
const SKIPPED = ['Platform1', 'Platform3']
const BUILT_GAPS = BUILT.map((edge) => gap(edge.from, edge.to).metres)
const NOTES = [
  ['stairs, a landing, 4 platforms', '↑ is the height of each top'],
  [`jump reach: ${REACH.up.toFixed(1)} m up, ${REACH.across.toFixed(1)} m across`, `all ${BUILT.length} gaps are inside it`],
  [`fewest jumps: ${SHORTCUT.length}, the prompt asked for ${BUILT.length}`, 'P1 and P3 are never needed'],
  [`${SLABS.length} slabs, each ${SLAB.w} × ${SLAB.d} × ${SLAB.thick} m`, `gaps from ${Math.min(...BUILT_GAPS).toFixed(1)} to ${Math.max(...BUILT_GAPS).toFixed(1)} m`],
]
const short = (id: string) => (id === 'Landing' ? 'landing' : id.replace('Platform', 'P'))

function Jumps({ edges, look, mark = '' }: { edges: Edge[]; look: string; mark?: string | null }) {
  return edges.map((edge) => {
    const { d, metres } = gap(edge.from, edge.to)
    return (
      <g key={edge.to}>
        <path className={`sp-line ${look}`} d={d} />
        {mark !== null && (
          <text x={edge.x} y={edge.y} textAnchor={edge.anchor} className="sp-small sp-strong">
            {metres.toFixed(1)} m{mark}
          </text>
        )}
      </g>
    )
  })
}

const DIR = '/assets/blog/spatial/fun'

// Fig puts data-paused on the figure for the pause button, hover, focus and being off screen,
// so the video follows that attribute.
// The first change always comes: Fig sets the attribute as soon as it knows motion is allowed.
function RunVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [still, setStill] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion()) return setStill(true)
    const video = ref.current!
    const fig = video.closest('figure')!
    // A rejected play() here is our own pause() landing mid-load.
    const observer = new MutationObserver(() => (fig.hasAttribute('data-paused') ? video.pause() : video.play().catch(() => {})))
    observer.observe(fig, { attributes: true, attributeFilter: ['data-paused'] })
    return () => observer.disconnect()
  }, [])
  return (
    // Under reduced motion there is no pause button and nothing autoplays, so the native controls are the only way to watch it.
    <video
      ref={ref}
      className="fun-video"
      muted
      playsInline
      loop
      controls={still}
      preload="none"
      poster={`${DIR}/slop-platformer-poster.webp`}
      width="960"
      height="540"
      aria-label="The camera orbits the generated level: a blue capsule player beside a staircase that leads to a landing and four identical square platforms floating above flat green ground, with a yellow goal on the last one."
    >
      <source src={`${DIR}/slop-platformer.webm`} type="video/webm" />
      <source src={`${DIR}/slop-platformer.mp4`} type="video/mp4" />
    </video>
  )
}

const SLOP_BEATS = ['the level', 'every jump passes its check', 'but the route skips platforms', `and every platform is the same ${SLAB.w} × ${SLAB.d} m`]

function SlopPlatformer() {
  const goal = BOXES.Platform4
  return (
    <Fig
      id="slop-platformer"
      labels={SLOP_BEATS}
      rest={2}
      // Each beat has a two-line note in the drawing to read, and the clip beside it to glance at.
      ms={pace(SLOP_BEATS, 2800)}
      ownPause
      caption="The level our abstract-actions run built passes every per-jump check, but two of its four identical platforms can be skipped."
    >
      {(beat) => (
        <div className="sp-panels fun-slop">
          <div className="sp-fit fit-slop">
          <svg
            viewBox="0 0 360 296"
            role="img"
            aria-label={`Top view of the generated level. Six stair steps lead to a landing, then four platforms follow in an L-shaped line with the goal on the last. The landing and all four platforms are identical ${SLAB.w} by ${SLAB.d} metre slabs. The gaps along the built order are ${BUILT_GAPS.map((m) => m.toFixed(1)).join(', ')} metres and each is within the player's jump. A shorter route goes from the landing straight to Platform2 and from there to Platform4, skipping Platform1 and Platform3.`}
          >
            <circle className="sp-fill-b" cx={sx(START.z)} cy={sy(START.x)} r="6" />
            <text x="4" y={sy(START.x) + 30} className="sp-soft sp-small">
              start
            </text>
            <text x={(BOXES.Stairs_1.bx + BOXES.Landing.bx) / 2} y="28" textAnchor="middle" className="sp-soft sp-small">
              stairs
            </text>
            {SURFACES.map((s) => {
              const box = BOXES[s.id]
              const slab = s.w === SLAB.w
              const skipped = beat === 2 && SKIPPED.includes(s.id)
              const cx = box.bx + box.bw / 2
              return (
                <g key={s.id}>
                  <rect className={!slab ? 'sp-box' : skipped ? 'sp-box sp-dash' : beat === 3 ? 'sp-box sp-tint-a' : 'sp-box sp-tint-b'} x={box.bx} y={box.by} width={box.bw} height={box.bh} />
                  {slab && (
                    <>
                      <text x={cx} y={box.by + 16} textAnchor="middle" className="sp-small sp-strong">
                        {short(s.id)}
                      </text>
                      <text x={cx} y={box.by + 44} textAnchor="middle" className={beat === 3 ? 'sp-small sp-strong' : 'sp-small sp-soft'}>
                        {beat === 3 ? `${s.w} × ${s.d} m` : skipped ? 'skipped' : `↑ ${s.top.toFixed(1)} m`}
                      </text>
                    </>
                  )}
                </g>
              )
            })}
            <rect className="fun-dot" x={goal.bx + goal.bw / 2 - 5} y={goal.by + goal.bh / 2 - 5} width="10" height="10" />
            {/* Under its box: beside it the word ran into the note on the left. */}
            <text x={goal.bx + goal.bw / 2} y={goal.by + goal.bh + 13} textAnchor="middle" className="sp-soft sp-small">
              goal
            </text>
            {beat === 1 && <Jumps edges={BUILT} look="" mark=" ✓" />}
            {beat === 2 && <Jumps edges={BUILT} look="sp-faint sp-dash" mark={null} />}
            {beat === 2 && <Jumps edges={SHORTCUT} look="sp-stroke-a sp-heavy" />}
            {NOTES[beat].map((line, i) => (
              <text key={line} x="12" y={246 + i * 16} className={i === 0 ? 'sp-small sp-strong' : 'sp-small sp-soft'}>
                {line}
              </text>
            ))}
          </svg>
          </div>
          <div className="sp-media">
            <FigPause />
            <RunVideo />
          </div>
        </div>
      )}
    </Fig>
  )
}

export const FUN_FIGURES: Record<string, ComponentType> = {
  'celeste-jump': CelesteJump,
  'slop-platformer': SlopPlatformer,
}
