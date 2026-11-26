import { useEffect, useRef, useState, type CSSProperties, type ComponentType, type ReactNode } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import { Fig, FigPause, pace } from './kit'
import './results.css'

const DIR = '/assets/blog/spatial/runs'

// Fig owns the loop but hands its children only the beat, so the video reads the figure's
// data-paused attribute to stop with it (pause button, hover, focus, off screen).
function Clip({ name, alt, active = true, pause = false, children }: { name: string; alt: string; active?: boolean; pause?: boolean; children?: ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [still, setStill] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return setStill(true)
    const el = ref.current!
    const fig = el.closest('.sp-fig')!
    // Its own observer, not only data-paused: Fig sets that attribute an effect later than this one
    // runs, and a play() in that gap would start downloading every clip on the page at load.
    let seen = false
    const sync = () => {
      // The rejections are the browser blocking autoplay, which leaves the poster up, and our own pause() landing mid-load.
      if (active && seen && !fig.hasAttribute('data-paused')) el.play().catch(() => {})
      else el.pause()
    }
    if (active) el.currentTime = 0
    const onScreen = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting
      sync()
    })
    onScreen.observe(el)
    const onPause = new MutationObserver(sync)
    onPause.observe(fig, { attributes: true, attributeFilter: ['data-paused'] })
    return () => {
      onScreen.disconnect()
      onPause.disconnect()
    }
  }, [active])

  return (
    <div className="sp-clip sp-media">
      {pause && <FigPause />}
      {still ? (
        <img src={`${DIR}/${name}.webp`} alt={alt} width="1600" height="900" loading="lazy" />
      ) : (
        <video ref={ref} muted playsInline loop preload="none" poster={`${DIR}/${name}.webp`} aria-label={alt} width="1600" height="900">
          <source src={`${DIR}/${name}.webm`} type="video/webm" />
          <source src={`${DIR}/${name}.mp4`} type="video/mp4" />
        </video>
      )}
      {children}
    </div>
  )
}

const VARIANTS = [
  { id: 'generic', title: 'Generic Godot MCP', short: 'generic', look: 'sp-box sp-tint-b' },
  { id: 'abstract', title: 'Abstract actions', short: 'abstract', look: 'sp-box sp-tint-a' },
]
// Measured once per run and copied from the run logs. `runs` is in VARIANTS order.
const RUNS = [
  {
    id: 'house',
    name: 'House',
    runs: [
      { seconds: 427, tokens: 40146, cost: 1.84, checks: 'no automated checks (looks right)' },
      { seconds: 96, tokens: 8397, cost: 0.69, checks: 'no automated checks (looks right)' },
    ],
  },
  {
    id: 'living-room',
    name: 'Living room',
    detail: ' (build + 3 vague follow-ups)',
    runs: [
      { seconds: 530, tokens: 54510, cost: 2.84, checks: '47 of 47' },
      { seconds: 149, tokens: 13894, cost: 0.99, checks: '47 of 47' },
    ],
  },
  {
    id: 'plate-puzzle',
    name: 'Plate puzzle',
    runs: [
      { seconds: 463, tokens: 44879, cost: 2.24, checks: "13 of 14: the trigger covers 18% of the plate's mesh" },
      { seconds: 84, tokens: 8099, cost: 0.59, checks: '14 of 14' },
    ],
  },
  {
    id: 'platformer',
    name: 'Platformer',
    runs: [
      { seconds: 566, tokens: 53835, cost: 2.38, checks: '9 of 9' },
      { seconds: 88, tokens: 8135, cost: 0.72, checks: '8 of 9: the route lets the player skip platforms, 2 jumps where 4 were asked for' },
    ],
  },
]
const clock = (seconds: number) => `${Math.floor(seconds / 60)} min ${seconds % 60} s`
const LONGEST = Math.max(...RUNS.flatMap((test) => test.runs.map((run) => run.seconds)))
const ROW = 68
const RUN_LABELS = RUNS.map((test) => test.name + (test.detail ?? ''))

function Runs() {
  return (
    <Fig
      id="runs"
      labels={RUN_LABELS}
      // A beat is two clips of a slow orbit and eight numbers, so it stays far longer than its label asks.
      ms={pace(RUN_LABELS, 6500)}
      ownPause
      caption="The same model and the same prompt built each of four tests twice, once through a generic Godot MCP and once through abstract actions."
    >
      {(beat) => (
        <>
          <div className="sp-swap sp-slides">
            {RUNS.map((test, i) => (
              <div key={test.id} className="sp-panels" style={{ visibility: i === beat ? 'visible' : 'hidden' }}>
                {VARIANTS.map((variant, v) => {
                  const run = test.runs[v]
                  return (
                    <div key={variant.id} className="sp-panel">
                      <p className="sp-title">{variant.title}</p>
                      <Clip
                        name={`${test.id}-${variant.id}`}
                        alt={`The camera orbits the ${test.name.toLowerCase()} built through ${variant.title.toLowerCase()}.`}
                        active={i === beat}
                        pause={v === 0}
                      />
                      <dl className="sp-tiers">
                        <dt>model time</dt>
                        <dd>{clock(run.seconds)}</dd>
                        <dt>output tokens</dt>
                        <dd>{run.tokens.toLocaleString('en-US')}</dd>
                        <dt>cost</dt>
                        <dd>${run.cost.toFixed(2)}</dd>
                        <dt>checks</dt>
                        <dd>{run.checks}</dd>
                      </dl>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <p className="sp-title sp-chart-title">Model time per test</p>
          <svg
            className="sp-fixed"
            style={{ '--h': `${RUNS.length * ROW - 6}px` } as CSSProperties}
            role="img"
            aria-label={`Paired bars of model time. ${RUNS.map((test) => `${test.name}: ${test.runs.map((run, v) => `${VARIANTS[v].short} ${clock(run.seconds)}`).join(', ')}`).join('. ')}.`}
          >
            {RUNS.map((test, i) => (
              <g key={test.id} transform={`translate(0,${i * ROW})`}>
                <text y="13" className={i === beat ? 'sp-strong' : 'sp-soft'}>
                  {test.name}
                </text>
                {test.runs.map((run, v) => {
                  const width = (run.seconds / LONGEST) * 100
                  const y = 20 + v * 22
                  // The generic bar is always long enough to hold its own label; the abstract one never is.
                  return (
                    <g key={v}>
                      <rect className={VARIANTS[v].look} y={y} width={`${width}%`} height="20" />
                      <text x={v === 0 ? 0 : `${width}%`} dx="7" y={y + 15} className="sp-small">
                        {VARIANTS[v].short} · {clock(run.seconds)}
                      </text>
                    </g>
                  )
                })}
              </g>
            ))}
          </svg>
          <p className="sp-note">One run per interface per test, Opus 5.5 at xhigh effort. A demo, not a benchmark.</p>
        </>
      )}
    </Fig>
  )
}

const RATES = [0.4, 0.89]
const ATTEMPTS = RATES.map((p) => 1 / p)
const approx = (n: number) => (+n.toFixed(2) === n ? `${n}` : `≈${n.toFixed(2)}`)
const FEWER = `≈${Math.round((1 - ATTEMPTS[1] / ATTEMPTS[0]) * 100)}% fewer attempts`
const SHORT_BAR = (ATTEMPTS[1] / ATTEMPTS[0]) * 100
const ATTEMPT_BEATS = [...RATES.map((p, i) => `p = ${p.toFixed(2)}: ${approx(ATTEMPTS[i])} attempts per accepted placement`), FEWER]

function Attempts() {
  return (
    <Fig
      id="attempts"
      labels={ATTEMPT_BEATS}
      rest={2}
      // The floor covers the 0.9 s a bar takes to grow, with time left to compare the two.
      ms={pace(ATTEMPT_BEATS, 2000)}
      caption="An accepted placement takes 1/p attempts on average, which assumes each retry is independent of the last."
    >
      {(beat) => (
        <svg
          className="sp-fixed"
          style={{ '--h': '112px' } as CSSProperties}
          role="img"
          aria-label={`Two bars of attempts per accepted placement: ${approx(ATTEMPTS[0])} at a success rate of ${RATES[0]}, and ${approx(ATTEMPTS[1])} at ${RATES[1]}. The gap between them is marked ${FEWER}.`}
        >
          {RATES.map((p, i) => {
            const y = i * 62
            return (
              <g key={p}>
                <text y={y + 13}>success rate p = {p.toFixed(2)}</text>
                {beat >= i && (
                  <>
                    <rect
                      className={`sp-box ${i === 0 ? 'sp-tint-b' : 'sp-tint-a'} ${beat === i ? 'sp-grow' : ''}`}
                      y={y + 20}
                      width={`${i === 0 ? 100 : SHORT_BAR}%`}
                      height="28"
                    />
                    <text dx="10" y={y + 38} className="sp-strong">
                      {approx(ATTEMPTS[i])} attempts
                    </text>
                  </>
                )}
              </g>
            )
          })}
          {beat === 2 && (
            <>
              <rect className="sp-clear sp-line sp-stroke-a sp-heavy sp-dash pl-ants" x={`${SHORT_BAR}%`} y="82" width={`${100 - SHORT_BAR}%`} height="28" />
              <text x={`${(SHORT_BAR + 100) / 2}%`} y="100" textAnchor="middle" className="sp-strong">
                {FEWER}
              </text>
            </>
          )}
        </svg>
      )}
    </Fig>
  )
}

// The Roof node of godot-house-figures/broken.tscn, verbatim.
const ROOF_NODE = [
  '[node name="Roof" type="MeshInstance3D" parent="House"]',
  'transform = Transform3D(0.9903, -0.1392, 0, 0.1392, 0.9903, 0, 0, 0, 1, 0.6, 2.95, 0.25)',
  'mesh = SubResource("Prism_roof")',
  'surface_material_override/0 = SubResource("Mat_roof")',
]
const BROKEN_BEATS = ['the roof is lopsided', 'in the scene file it is one valid transform', 'and the scene loads without a complaint']

function ValidBroken() {
  return (
    <Fig
      id="valid-broken"
      labels={BROKEN_BEATS}
      rest={2}
      // The clip is a slow orbit: a beat shorter than this changes before the roof has come round.
      ms={pace(BROKEN_BEATS, 2600)}
      ownPause
      caption="In this recreation of the house from the intro, the lopsided roof is one valid transform line and the scene loads without an error."
    >
      {(beat) => (
        <div className="sp-panels">
          <div className="sp-panel">
            <p className="sp-title">What you see</p>
            <Clip name="broken" alt="The camera orbits a small house whose roof is tilted and slid off its walls." pause>
              <div className="sp-ring" data-on={beat === 0 ? '' : undefined}>
                <span>Roof: tilted 8°</span>
              </div>
            </Clip>
          </div>
          <div className="sp-panel">
            <p className="sp-title">broken.tscn</p>
            <pre className="sp-code">
              {ROOF_NODE.map((line, i) => (
                <span key={line} className={i === 1 && beat === 1 ? 'sp-hit' : undefined} style={{ display: 'block' }}>
                  {line}
                </span>
              ))}
            </pre>
            <p className="sp-status">
              <span className={beat === 2 ? 'sp-hit' : undefined}>✓ loaded · 0 errors · 0 warnings</span>
            </p>
          </div>
        </div>
      )}
    </Fig>
  )
}

export const RESULTS_FIGURES: Record<string, ComponentType> = {
  runs: Runs,
  attempts: Attempts,
  'valid-broken': ValidBroken,
}
