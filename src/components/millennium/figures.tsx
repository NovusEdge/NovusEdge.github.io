import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import katex from 'katex'
import { ARCHIVE, ETH_C, ETH_CROSS, ON_LINE, PAGES, ZEROS, blowup, plot, smooth, subExponent } from './figure-data'
import { RESULTS } from './timeline-data'
import type { Slot } from './chapters'
import './figures.css'

const UNIT = { x: 0, y: 0, w: 100, h: 100 }

export function Tex({ children }: { children: string }) {
  return <span className="ml-tex" dangerouslySetInnerHTML={{ __html: katex.renderToString(children, { throwOnError: false }) }} />
}

// Plots are drawn in a 100 by 100 box stretched to the frame, with strokes that do not scale.
// Labels and markers are HTML placed by percentage, so type stays the same size on a phone.
const at = (x: number, y: number): CSSProperties => ({ left: `${x * 100}%`, bottom: `${y * 100}%` })

function Lab({ x, y, pin = 'l', className = '', children }: { x: number; y: number; pin?: 'l' | 'r' | 'c'; className?: string; children: ReactNode }) {
  return (
    <span className={`ml-lab ml-lab--${pin} ${className}`} style={at(x, y)}>
      {children}
    </span>
  )
}

export function Pill({ row }: { row: number }) {
  const r = RESULTS[row]
  return <span className={`ml-pill ml-pill--${r.tone}`}>{r.status}</span>
}

function EthFigure() {
  const crossY = ETH_C * ETH_CROSS
  return (
    <figure className="ml-fig ml-fig--eth" data-fig>
      <div className="ml-fig-body">
        <div className="ml-plot ml-eth-plot" role="img" aria-label="Chart: the exponent of the running time against the number of variables. Brute force is a straight diagonal. The Exponential Time Hypothesis draws a straight floor under it that no algorithm should get below. The new algorithm's curve bends and goes under that floor.">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="ml-hatch" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
                <line x1="0" y1="0" x2="0" y2="3.2" className="ml-eth-hatch" />
              </pattern>
            </defs>
            <polygon className="ml-eth-zone" points={`0,100 100,${100 - ETH_C * 100} 100,100`} fill="url(#ml-hatch)" />
            <line className="ml-eth-floor" x1="0" y1="100" x2="100" y2={100 - ETH_C * 100} />
            <line className="ml-eth-brute" x1="0" y1="100" x2="100" y2="0" />
          </svg>
          <svg className="ml-draw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="ml-eth-new" d={plot(subExponent, 0, 1, UNIT)} />
          </svg>
          <i className="ml-dot ml-eth-cross" style={at(ETH_CROSS, crossY)} />
          <Lab x={0.58} y={0.62} pin="r">
            brute force, <Tex>{'2^{n}'}</Tex>
          </Lab>
          <Lab x={0.985} y={0.03} pin="r" className="ml-lab--warn">
            ETH’s floor, <Tex>{'2^{cn}'}</Tex>
          </Lab>
          <Lab x={0.985} y={0.52} pin="r" className="ml-lab--gold ml-eth-tag">
            16 Oct, <Tex>{'2^{o(n)}'}</Tex>
          </Lab>
          <span className="ml-axis ml-axis--y">exponent of the running time</span>
          <span className="ml-axis ml-axis--x">variables, n</span>
        </div>
      </div>
      <figcaption className="ml-note">
        <p>
          Brute force tries every assignment: <Tex>{'2^{n}'}</Tex> of them. ETH said you can shave the exponent but never bend it, so every algorithm stays above some straight line{' '}
          <Tex>{'2^{cn}'}</Tex> with <Tex>{'c > 0'}</Tex>.
        </p>
        <p>
          <Tex>{'2^{o(n)}'}</Tex> means the exponent grows slower than any straight line, so it ends up under all of them.
        </p>
        <p className="ml-note-fine">Shapes only, not measurements. The gain reportedly only matters past millions of variables.</p>
      </figcaption>
    </figure>
  )
}

// The plot runs to t = 1.5 T and to 1.3 times the frame's height, so the smooth curve has room
// past T and the other one visibly leaves through the top.
const NS_SPAN = 1.5
const NS_TOP = 1.3
const nsFrame = { x: 0, y: 100 - 100 / NS_TOP, w: 100 / NS_SPAN, h: 100 / NS_TOP }
// The blowup curve stops where it leaves the top of the frame.
const NS_EXIT = 1 - (0.22 / NS_TOP) ** 2
const FORCE = [0.35, 0.8, 0.5, 1, 0.3, 0.7, 0.95, 0.45, 0.85, 0.6, 1, 0.4]

function NsPanel({ forced }: { forced: boolean }) {
  return (
    <div className={`ml-ns-panel${forced ? ' ml-ns-panel--forced' : ''}`}>
      <p className="ml-ns-head">
        <b>{forced ? 'Forced' : 'Unforced'}</b>
        <Pill row={forced ? 4 : 7} />
      </p>
      <p className="ml-ns-sub">{forced ? 'September, OpenAI. Something outside keeps pushing the fluid.' : '20 November, Alpöge and Buckmaster. Nothing pushes. This is the one Clay asks about.'}</p>
      <div className="ml-plot ml-ns-plot" role="img" aria-label={`Chart: the fastest speed in the fluid against time, ${forced ? 'with' : 'without'} an outside force. One curve stays bounded forever. The other climbs without limit as time approaches T.`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line className="ml-ns-t" x1={100 / NS_SPAN} y1="100" x2={100 / NS_SPAN} y2="0" />
          <path className="ml-ns-smooth" d={plot((t) => smooth(t * NS_SPAN), 0, 1, { ...nsFrame, w: 100 })} />
        </svg>
        <svg className="ml-draw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="ml-ns-blow" d={plot(blowup, 0, NS_EXIT, nsFrame, 90)} />
        </svg>
        <Lab x={1 / NS_SPAN} y={0} pin="c" className="ml-lab--under">
          <Tex>T</Tex>
        </Lab>
        <Lab x={0.5} y={0.42} pin="r" className="ml-lab--gold">
          blows up
        </Lab>
        <Lab x={0.99} y={0.34} pin="r" className="ml-lab--blue">
          stays smooth
        </Lab>
        <span className="ml-axis ml-axis--y">
          fastest point, <Tex>{'\\max|u|'}</Tex>
        </span>
      </div>
      <div className="ml-ns-force" aria-hidden="true">
        <span>
          <Tex>{forced ? 'f(t)' : 'f = 0'}</Tex>
        </span>
        <div>{forced && FORCE.map((h, i) => <i key={i} style={{ '--h': h, '--i': i } as CSSProperties} />)}</div>
      </div>
    </div>
  )
}

function NsFigure() {
  return (
    <figure className="ml-fig ml-fig--ns ml-fig--wide" data-fig>
      <div className="ml-fig-body">
        <p className="ml-ns-eq">
          <Tex>{'\\partial_t u + (u\\cdot\\nabla)u = -\\nabla p + \\nu\\,\\Delta u + \\textcolor{#f2a7a0}{f}, \\qquad \\nabla\\cdot u = 0'}</Tex>
        </p>
        <div className="ml-ns-pair">
          <NsPanel forced />
          <NsPanel forced={false} />
        </div>
      </div>
      <figcaption className="ml-note ml-note--under">
        <p>
          Start with a smooth fluid and watch its fastest point. Either it stays finite forever, or it hits infinity at some finite time <Tex>T</Tex>. Both curves are the same in the two
          panels. What differs is <Tex>{'\\textcolor{#f2a7a0}{f}'}</Tex>, the outside force, and Clay’s version has none.
        </p>
        <p className="ml-note-fine">Shapes only, not the computed solution.</p>
      </figcaption>
    </figure>
  )
}

const IM_TOP = 53
const fmt = (t: number) => t.toFixed(4)

function RhFigure() {
  return (
    <figure className="ml-fig ml-fig--rh" data-fig>
      <div className="ml-fig-body ml-rh">
        <div className="ml-plot ml-rh-plot" role="img" aria-label={`Chart: the critical strip of the zeta function, between real part 0 and 1, with the line at real part one half. The first ten zeros all sit on that line, at heights ${ZEROS.map(fmt).join(', ')}.`}>
          <i className="ml-rh-strip" />
          <i className="ml-rh-line" />
          <i className="ml-rh-scan" />
          {[0, 10, 20, 30, 40, 50].map((t) => (
            <span key={t} className="ml-rh-tick" style={{ bottom: `${(t / IM_TOP) * 100}%` }}>
              {t}
            </span>
          ))}
          {ZEROS.map((t) => (
            <span key={t} className="ml-rh-zero" style={{ bottom: `${(t / IM_TOP) * 100}%`, '--t': t } as CSSProperties}>
              <i className="ml-dot" />
              <b>{fmt(t)}</b>
            </span>
          ))}
          <span className="ml-rh-re" style={{ left: '25%' }}>
            0
          </span>
          <span className="ml-rh-re ml-rh-re--half" style={{ left: '50%' }}>
            ½
          </span>
          <span className="ml-rh-re" style={{ left: '75%' }}>
            1
          </span>
          <span className="ml-axis ml-axis--y">
            height, <Tex>{'\\operatorname{Im}(s)'}</Tex>
          </span>
          <span className="ml-axis ml-axis--x">
            <Tex>{'\\operatorname{Re}(s)'}</Tex>
          </span>
        </div>
        <div className="ml-rh-read">
          <p>
            The zeta function <Tex>{'\\zeta(s)'}</Tex> has zeros that aren’t the boring ones, and every one of them is known to sit inside this strip, <Tex>{'0 < \\operatorname{Re}(s) < 1'}</Tex>.
          </p>
          <p>
            Riemann’s guess from 1859 is that they all sit dead on the middle line, <Tex>{'\\operatorname{Re}(s) = \\tfrac12'}</Tex>.
          </p>
          <p>These are the first ten. Trillions more have been computed, and every one is on the line. That was never going to prove it.</p>
          <div className="ml-share">
            <p>Share of zeros proven to be on the line</p>
            <ol>
              {ON_LINE.map((s, i) => (
                <li key={s.label} className={s.share === 100 ? 'ml-share--claim' : ''} style={{ '--w': `${s.share}%`, '--i': i } as CSSProperties}>
                  <i />
                  <span>
                    <b>{s.share === 100 ? 'all' : `${s.share}%`}</b> {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <figcaption className="ml-note">
        <p>Heights to four decimal places. Only the upper half is drawn; every zero has a mirror image below the axis.</p>
        <p className="ml-note-fine">The August share is the reviewed result in the timeline above. The last bar is Friday’s claim.</p>
      </figcaption>
    </figure>
  )
}

function ProofScale() {
  const [screens, setScreens] = useState<number | null>(null)
  useEffect(() => {
    const read = () => setScreens(Math.round(PAGES[2].pages / innerWidth))
    read()
    addEventListener('resize', read)
    return () => removeEventListener('resize', read)
  }, [])
  return (
    <figure className="ml-fig ml-fig--scale ml-fig--wide" data-fig>
      <div className="ml-fig-body">
        <ol className="ml-scale">
          {PAGES.map((p) => (
            <li key={p.what} className={'more' in p ? 'ml-scale--more' : ''}>
              <p>
                <b>
                  {p.pages.toLocaleString('en')}
                  {'more' in p && '+'}
                </b>{' '}
                pages <span>{p.what}</span>
              </p>
              <div className="ml-scale-run">
                {/* The book's bar fills the run: at a pixel a page its real end is far off screen either way. */}
                <i style={'more' in p ? undefined : { width: p.pages }} />
              </div>
            </li>
          ))}
        </ol>
        <p className="ml-scale-off">
          One pixel is one page. {screens ? `The last bar keeps going for about ${screens.toLocaleString('en')} more screens the width of yours.` : 'The last bar keeps going well past the edge of your screen.'}
        </p>
        <dl className="ml-archive">
          {ARCHIVE.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <figcaption className="ml-note ml-note--under">
        <p>The book was never posted. The Lean was, and the bottom row is all of it. File and line counts are from the independent mirror’s notes.</p>
      </figcaption>
    </figure>
  )
}

function LeanStatement() {
  return (
    <figure className="ml-fig ml-fig--lean" data-fig>
      <div className="ml-fig-body">
        <div className="ml-lean">
          <p className="ml-lean-file">Mathlib/NumberTheory/LSeries/RiemannZeta.lean</p>
          <pre>
            <code>
              <span className="ml-lean-doc">{'/-- A formal statement of the **Riemann hypothesis** – constructing a term of this type is worth a million dollars. -/'}</span>
              {'\n'}
              <span className="ml-lean-kw">def</span> <span className="ml-lean-name">RiemannHypothesis</span> : <span className="ml-lean-ty">Prop</span> :={'\n'}
              {'  ∀ (s : ℂ) (_ : riemannZeta s = 0) (_ : ¬∃ n : ℕ, s = -2 * (n + 1)) (_ : s ≠ 1), s.re = 1 / 2'}
            </code>
          </pre>
          <p className="ml-lean-file">Main.lean, the submission</p>
          <pre>
            <code>
              <span className="ml-lean-kw">theorem</span> <span className="ml-lean-name">riemannHypothesis</span> : <span className="ml-lean-ty">RiemannHypothesis</span> :={'\n'}
              {'  Formalism.VW.rh_of_every allChi'}
            </code>
          </pre>
        </div>
      </div>
      <figcaption className="ml-note">
        <p>The top block is Mathlib’s definition, comment included. It’s the whole statement: zeta is zero, it isn’t a trivial zero, it isn’t the pole, so the real part is a half.</p>
        <p>The bottom one is how the mirror’s notes describe the submission’s last step. Everything else sits behind those two names.</p>
        <p className="ml-note-fine">
          Lean’s three standard axioms are <code>propext</code>, <code>Classical.choice</code> and <code>Quot.sound</code>. A clean Comparator run lists those and nothing else.
        </p>
      </figcaption>
    </figure>
  )
}

const FIGURES: Record<Exclude<Slot, 'timeline'>, () => ReactNode> = {
  eth_figure: EthFigure,
  ns_figure: NsFigure,
  rh_figure: RhFigure,
  proof_scale: ProofScale,
  lean_statement: LeanStatement,
}

export function Figure({ name }: { name: Exclude<Slot, 'timeline'> }) {
  const F = FIGURES[name]
  return <F />
}
