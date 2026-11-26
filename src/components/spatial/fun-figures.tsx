import { useEffect, useRef, useState, type ComponentType, type RefObject } from 'react'
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

const DIR = '/assets/blog/spatial/fun'

// Fig puts data-paused on the figure for the pause button, hover, focus and being off screen,
// so the video follows that attribute.
// The first change always comes: Fig sets the attribute as soon as it knows motion is allowed.
function useFollowFig(ref: RefObject<HTMLVideoElement | null>) {
  const [still, setStill] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion()) return setStill(true)
    const video = ref.current!
    const fig = video.closest('figure')!
    // A rejected play() here is our own pause() landing mid-load.
    const observer = new MutationObserver(() => (fig.hasAttribute('data-paused') ? video.pause() : video.play().catch(() => {})))
    observer.observe(fig, { attributes: true, attributeFilter: ['data-paused'] })
    return () => observer.disconnect()
  }, [ref])
  return still
}

function RunVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const still = useFollowFig(ref)
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

// ori-bash.webm/.mp4 is 6.6 s of the Ginso Tree climb in Ori and the Blind Forest, 960 × 540, no HUD.
// Times are seconds of the clip and positions are px in its frame, read off frames 66 and 170: the
// pink shot Ori is bashing, and the way the game's own white arrow points. The camera drifts a
// little while Ori aims, so each mark sits where the shot is at the middle of its window.
const BASHES = [
  { from: 1.7, to: 2.3, slow: [1.9, 2.4], ring: [237, 232], arrow: [265, 232, 415, 232], label: { x: 290, y: 178, side: 'right' } },
  { from: 5.3, to: 5.85, slow: [5.45, 5.95], ring: [712, 278], arrow: [716, 252, 742, 120], label: { x: 700, y: 140, side: 'left' } },
] as const
const RING = 24

function OriClip({ marks }: { marks: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const still = useFollowFig(ref)
  const [bash, setBash] = useState(-1)

  useEffect(() => {
    const video = ref.current!
    // The marks follow the frame the video shows. The clip runs at half speed through each Bash so
    // there is time to read them; requestVideoFrameCallback also fires on seeks while paused.
    const show = (t: number) => {
      setBash(BASHES.findIndex((b) => t >= b.from && t <= b.to))
      video.playbackRate = BASHES.some((b) => t >= b.slow[0] && t <= b.slow[1]) ? 0.5 : 1
    }
    let handle = 0
    const perFrame = 'requestVideoFrameCallback' in video
    const tick = (_now: number, frame?: VideoFrameCallbackMetadata) => {
      show(frame?.mediaTime ?? video.currentTime)
      handle = perFrame ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick)
    }
    handle = perFrame ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick)
    return () => (perFrame ? video.cancelVideoFrameCallback(handle) : cancelAnimationFrame(handle))
  }, [])

  return (
    <div className="sp-media fun-ori">
      <video
        ref={ref}
        className="fun-video"
        muted
        playsInline
        loop
        controls={still}
        preload="none"
        poster={`${DIR}/ori-bash.webp`}
        width="960"
        height="540"
        aria-label="Ori, a small white spirit, climbs a vertical room in the Ginso Tree. A red flower-like enemy at the top left fires glowing pink shots. Ori aims at the first shot and Bashes off it, launching sideways to the next ledge, then Bashes off a second shot to launch upward and climb another level."
      >
        <source src={`${DIR}/ori-bash.webm`} type="video/webm" />
        <source src={`${DIR}/ori-bash.mp4`} type="video/mp4" />
      </video>
      <div className="fun-ori-marks" data-bash={marks ? bash : -1} aria-hidden="true">
        <svg viewBox="0 0 960 540">
          <defs>
            <marker id="fun-ori-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" />
            </marker>
          </defs>
          {BASHES.map((b, i) => (
            <g key={i} data-n={i}>
              <circle cx={b.ring[0]} cy={b.ring[1]} r={RING} />
              <path d={`M${b.arrow[0]},${b.arrow[1]} L${b.arrow[2]},${b.arrow[3]}`} markerEnd="url(#fun-ori-head)" />
            </g>
          ))}
        </svg>
        {BASHES.map((b, i) => (
          <span key={i} data-n={i} className={`jf-label fun-ori-label fun-ori-label--${b.label.side}`} style={{ left: `${b.label.x / 9.6}%`, top: `${b.label.y / 5.4}%` }}>
            Bash off its shot
          </span>
        ))}
      </div>
      <div className="fun-ori-gone" data-on={!marks ? '' : undefined} aria-hidden="true">
        no enemy, no shots, no way up
      </div>
    </div>
  )
}

const SLOP_BEATS = ['both climb to a goal', 'ours: identical blocks, every jump passes its check', "Ori: the way up is the enemy's own shots", 'take the enemy out and that route is gone']

function SlopPlatformer() {
  return (
    <Fig
      id="slop-platformer"
      labels={SLOP_BEATS}
      ms={pace(SLOP_BEATS, 2800)}
      ownPause
      caption={
        <>
          The level our abstract-actions run built, next to the Ginso Tree in Ori and the Blind Forest, where the way up is the enemy's own projectiles. Footage: Carrot Helper on YouTube. Ori and the Blind Forest © Microsoft Corporation. Used under Microsoft's{' '}
            <a href="https://www.xbox.com/en-US/developers/rules" target="_blank" rel="noreferrer">
              Game Content Usage Rules
            </a>
            ; not endorsed by or affiliated with Microsoft.
        </>
      }
    >
      {(beat) => (
        <div className="sp-panels fun-slop" data-beat={beat}>
          <div className="sp-media fun-ours">
            <FigPause />
            <RunVideo />
          </div>
          <OriClip marks={beat !== 3} />
        </div>
      )}
    </Fig>
  )
}

export const FUN_FIGURES: Record<string, ComponentType> = {
  'celeste-jump': CelesteJump,
  'slop-platformer': SlopPlatformer,
}
