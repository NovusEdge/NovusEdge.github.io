import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import katex from 'katex'
import { ARCHIVE, ETH_C, ETH_CROSS, ON_LINE, PAGES, ZEROS, blowup, plot, smooth, subExponent, zetaOnLine } from './figure-data'
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

// One plot, because the claimed behaviour is the same in both results. What differs is whether an
// outside force is acting, so that is drawn as two lanes under the plot on the same time axis.
function NsLane({ forced }: { forced: boolean }) {
  const r = RESULTS[forced ? 4 : 7]
  return (
    <div className={`ml-ns-lane${forced ? ' ml-ns-lane--forced' : ''}`}>
      <div className="ml-ns-who">
        <p>
          <b>{forced ? 'Forced' : 'Unforced'}</b>
          <span className={`ml-pill ml-pill--${r.tone}`}>{r.status}</span>
        </p>
        <p>{forced ? 'September, OpenAI. A finely tuned outside force keeps pushing the fluid the whole way.' : '20 November, Alpöge and Buckmaster. Nothing pushes. This is the version Clay asks about.'}</p>
      </div>
      <div className="ml-ns-force" aria-hidden="true">
        <span>
          <Tex>{forced ? '\\textcolor{#f2a7a0}{f} \\neq 0' : '\\textcolor{#f2a7a0}{f} = 0'}</Tex>
        </span>
        <div>{forced && FORCE.map((h, i) => <i key={i} style={{ '--h': h } as CSSProperties} />)}</div>
      </div>
    </div>
  )
}

function NsFigure() {
  return (
    <figure className="ml-fig ml-fig--ns ml-fig--wide" data-fig>
      <div className="ml-fig-body">
        <div className="ml-ns-eq">
          <p>
            <Tex>{'\\partial_t u + (u\\cdot\\nabla)u = -\\nabla p + \\nu\\,\\Delta u + \\textcolor{#f2a7a0}{f}'}</Tex>
          </p>
          <p>
            The red <Tex>{'\\textcolor{#f2a7a0}{f}'}</Tex> is a force from outside the fluid. The two results differ in that term and nothing else.
          </p>
        </div>
        <div className="ml-ns">
          <div className="ml-ns-who ml-ns-key">
            <p>The question is what the fastest point in the fluid does over time.</p>
            <p className="ml-ns-key--gold">Blowup: it reaches infinity at a finite time T. Both results claim this.</p>
            <p className="ml-ns-key--blue">The other answer: it stays finite forever.</p>
          </div>
          <div className="ml-plot ml-ns-plot" role="img" aria-label="Chart: the fastest speed in the fluid against time. One curve stays bounded forever. The other climbs without limit as time approaches T.">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <line className="ml-ns-t" x1={100 / NS_SPAN} y1="100" x2={100 / NS_SPAN} y2="0" />
              <path className="ml-ns-smooth" d={plot((t) => smooth(t * NS_SPAN), 0, 1, { ...nsFrame, w: 100 })} />
            </svg>
            <svg className="ml-draw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="ml-ns-blow" d={plot(blowup, 0, NS_EXIT, nsFrame, 90)} />
            </svg>
            <Lab x={1 / NS_SPAN} y={0} pin="c" className="ml-lab--under">
              time <Tex>T</Tex>
            </Lab>
            <Lab x={0.56} y={0.5} pin="r" className="ml-lab--gold">
              blows up
            </Lab>
            <Lab x={0.99} y={0.3} pin="r" className="ml-lab--blue">
              stays smooth
            </Lab>
            <span className="ml-axis ml-axis--y">fastest point in the fluid</span>
          </div>
          <NsLane forced />
          <NsLane forced={false} />
        </div>
      </div>
      <figcaption className="ml-note ml-note--under">
        <p>The curve is the same for both because both claim the same thing. In September something outside was driving it. On 20 November the fluid is claimed to get there on its own.</p>
        <p className="ml-note-fine">Shapes only, not the computed solution. The force ticks are a picture of “tuned”, not data.</p>
      </figcaption>
    </figure>
  )
}

// The critical line from height 0 to 52, seen twice over one axis: from above, as the strip with
// its zeros, and from the side, as the size of zeta along the line.
const T_MAX = 52
const SAMPLES = Array.from({ length: 521 }, (_, i) => [i / 10, zetaOnLine(i / 10)] as const)
const SIZE_TOP = Math.ceil(Math.max(...SAMPLES.map(([, v]) => v)))
const SIZE_PATH = SAMPLES.map(([t, v], i) => `${i ? 'L' : 'M'}${((t / T_MAX) * 100).toFixed(2)} ${(100 - (v / SIZE_TOP) * 100).toFixed(2)}`).join('')
const fmt = (t: number) => t.toFixed(4)
const along = (t: number): CSSProperties => ({ left: `${(t / T_MAX) * 100}%`, '--t': t } as CSSProperties)

function RhFigure() {
  return (
    <figure className="ml-fig ml-fig--rh ml-fig--wide" data-fig>
      <div className="ml-fig-body">
        <div className="ml-rh" role="img" aria-label={`Chart in two parts over one axis, height from 0 to ${T_MAX}. Above: the critical strip between real part 0 and 1, with ten zeros marked on the middle line at heights ${ZEROS.map(fmt).join(', ')}. Below: the size of zeta along that line, which drops to zero at each of those heights.`}>
          <div className="ml-rh-strip">
            <span className="ml-rh-re ml-rh-re--name" style={{ top: 0 }}>
              <Tex>{'\\operatorname{Re}(s)'}</Tex>
            </span>
            <span className="ml-rh-re" style={{ top: 0 }}>
              <Tex>{'1'}</Tex>
            </span>
            <span className="ml-rh-re ml-rh-re--half" style={{ top: '50%' }}>
              <Tex>{'\\tfrac12'}</Tex>
            </span>
            <span className="ml-rh-re" style={{ top: '100%' }}>
              <Tex>{'0'}</Tex>
            </span>
            {ZEROS.map((t) => (
              <span key={t} className="ml-rh-zero" style={along(t)}>
                <b>{fmt(t)}</b>
                <i className="ml-dot" />
              </span>
            ))}
          </div>
          <div className="ml-plot ml-rh-size">
            <svg className="ml-draw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="ml-rh-fill" d={`${SIZE_PATH}L100 100L0 100Z`} />
              <path className="ml-rh-curve" d={SIZE_PATH} />
            </svg>
            {ZEROS.map((t) => (
              <i key={t} className="ml-rh-drop" style={along(t)} />
            ))}
            {Array.from({ length: SIZE_TOP + 1 }, (_, v) => (
              <span key={v} className="ml-rh-tick ml-rh-tick--y" style={{ bottom: `${(v / SIZE_TOP) * 100}%` }}>
                {v}
              </span>
            ))}
            {[0, 10, 20, 30, 40, 50].map((t) => (
              <span key={t} className="ml-rh-tick ml-rh-tick--x" style={{ left: `${(t / T_MAX) * 100}%` }}>
                {t}
              </span>
            ))}
            <span className="ml-axis ml-axis--y">
              size of zeta on the line, <Tex>{'|\\zeta(\\tfrac12 + it)|'}</Tex>
            </span>
            <span className="ml-axis ml-axis--x">
              height <Tex>t</Tex>
            </span>
          </div>
        </div>
        <div className="ml-rh-below">
          <div className="ml-rh-read">
            <p>
              The top band is the critical strip seen from above, laid on its side. Every zero of zeta that isn’t a trivial one is known to sit somewhere in that band. Riemann’s guess from 1859 is that
              they all sit on the gold line through the middle.
            </p>
            <p>
              The curve underneath is the size of zeta as you walk along that line. It touches zero ten times before height 52, at the ten heights marked. Trillions more have been computed and every one
              is on the line, which was never going to prove it.
            </p>
          </div>
          <div className="ml-share">
            <h3>Share of zeros proven to be on the line</h3>
            <ol>
              {ON_LINE.map((s, i) => (
                <li key={s.label} className={s.share === 100 ? 'ml-share--claim' : ''} style={{ '--w': `${s.share}%`, '--i': i } as CSSProperties}>
                  <span>{s.label}</span>
                  <div>
                    <i />
                    <b>{s.share}%</b>
                  </div>
                </li>
              ))}
            </ol>
            <p className="ml-share-axis" aria-hidden="true">
              {[0, 25, 50, 75, 100].map((v) => (
                <span key={v}>{v}%</span>
              ))}
            </p>
          </div>
        </div>
      </div>
      <figcaption className="ml-note ml-note--under">
        <p>The curve is computed, not drawn: zeta evaluated every tenth of a unit of height. Zero heights are to four decimal places. Only the upper half is shown; every zero has a mirror image below.</p>
        <p className="ml-note-fine">The first two bars are the reviewed August result. The hatched one is Friday’s claim, still pending.</p>
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
