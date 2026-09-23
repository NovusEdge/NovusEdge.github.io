import { useRef, useState, type ReactNode } from 'react'

// Numbers from roomful/experiments/charts.py, which drew the original PNGs.
const TIERS = ['all pairs', 'p<0.10', 'p<0.05', 'p<0.01', 'p<0.001']
const SPLITS = [
  { name: 'confirmatory 2015, the one I posted', short: 'confirmatory 2015', values: [0.704, 0.745, 0.763, 0.798, 0.841], mark: 'ox', dash: false },
  { name: 'holdout', short: 'holdout', values: [0.637, 0.654, 0.662, 0.675, 0.682], mark: 'ink', dash: false },
  { name: 'exploratory', short: 'exploratory', values: [0.624, 0.643, 0.656, 0.666, 0.703], mark: 'ink', dash: true },
] as const

// Arms, date ranges and pre-2015 shares from the table in the post.
const SPLIT_TABLE = [
  ['confirmatory', '51,891', '2013-01-24 to 2015-04-30', '83.5%'],
  ['holdout', '11,231', '2013-01-24 to 2015-04-29', '82.8%'],
  ['exploratory', '10,804', '2013-01-26 to 2015-04-29', '83.8%'],
]

const ABLATIONS = [
  { label: ['Phase 0', 'MSE'], value: 0.637, mark: 'muted' },
  { label: ['+ 28% data', 'MSE'], value: 0.724, mark: 'muted' },
  { label: ['+ rank loss', 'Bradley-Terry'], value: 0.775, mark: 'ox' },
  { label: ['+ both'], value: 0.787, mark: 'ox' },
  { label: ['+ DeBERTa', 'at lr 6e-6'], value: 0.812, mark: 'ox-deep' },
] as const

const CALIBRATION: [score: number, lift: number, lo: number, hi: number][] = [
  [-2.72, -19.1, -21.8, -18.1],
  [-1.65, -13.6, -16.0, -12.0],
  [-1.06, -8.2, -9.6, -7.5],
  [-0.6, -4.9, -6.0, -3.8],
  [-0.2, -0.7, -2.0, 0.0],
  [0.17, 1.2, -0.1, 2.1],
  [0.56, 3.7, 2.6, 4.9],
  [1.03, 10.0, 8.3, 11.0],
  [1.62, 11.1, 10.0, 12.8],
  [2.82, 21.8, 20.1, 23.8],
]

const W = 640
const H = 340
const M = { l: 52, r: 16, t: 14, b: 44 }
const PW = W - M.l - M.r
const PH = H - M.t - M.b

const scale = (lo: number, hi: number, a: number, b: number) => (v: number) => a + ((v - lo) / (hi - lo)) * (b - a)
const f3 = (v: number) => v.toFixed(3)
const pct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`

type Tip = { key: string; x: number; y: number; text: string }
type PlotProps = { active: Tip | null; set: ((tip: Tip | null) => void) | null }

/** Handlers that make a mark answer hover, tap and keyboard focus in the expanded view. */
function hit(tip: Tip, { active, set }: PlotProps) {
  if (!set) return {}
  return {
    className: `oj-hit${active?.key === tip.key ? ' is-active' : ''}`,
    tabIndex: 0,
    role: 'button',
    'aria-label': tip.text,
    onMouseEnter: () => set(tip),
    onFocus: () => set(tip),
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      set(tip)
    },
  }
}

function TipTag({ tip }: { tip: Tip | null }) {
  if (!tip) return null
  const w = tip.text.length * 6.6 + 16
  const x = Math.min(Math.max(tip.x - w / 2, 0), W - w)
  const y = tip.y - 36 < 0 ? tip.y + 14 : tip.y - 36
  return (
    <g className="oj-tip" pointerEvents="none">
      <rect x={x} y={y} width={w} height={24} rx={3} />
      <text x={x + w / 2} y={y + 12} textAnchor="middle" dominantBaseline="middle">
        {tip.text}
      </text>
    </g>
  )
}

function YAxis({ ticks, y, fmt }: { ticks: number[]; y: (v: number) => number; fmt: (v: number) => string }) {
  return (
    <g className="oj-axis-y">
      {ticks.map((t) => (
        <g key={t}>
          <line className="oj-grid" x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} />
          <text x={M.l - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">
            {fmt(t)}
          </text>
        </g>
      ))}
    </g>
  )
}

function Plot({ p, height = H, children }: { p: PlotProps; height?: number; children: ReactNode }) {
  return (
    <svg className="oj-plot" viewBox={`0 0 ${W} ${height}`} aria-hidden={p.set ? undefined : true} onClick={p.set ? () => p.set!(null) : undefined}>
      {children}
      <TipTag tip={p.active} />
    </svg>
  )
}

function SplitsPlot(p: PlotProps) {
  const x = (i: number) => M.l + 24 + (i * (PW - 48)) / (TIERS.length - 1)
  const y = scale(0.48, 0.88, H - M.b, M.t)
  return (
    <Plot p={p}>
      <YAxis ticks={[0.5, 0.6, 0.7, 0.8]} y={y} fmt={(v) => v.toFixed(2)} />
      <line className="oj-ref" x1={M.l} x2={W - M.r} y1={y(0.544)} y2={y(0.544)} />
      <text className="oj-note" x={W - M.r} y={y(0.544) - 6} textAnchor="end">published SOTA 0.544</text>
      <line className="oj-ref oj-ref-dot" x1={M.l} x2={W - M.r} y1={y(0.5)} y2={y(0.5)} />
      <text className="oj-note" x={W - M.r} y={y(0.5) - 6} textAnchor="end">chance</text>
      {SPLITS.map((s) => (
        <g key={s.name} className={`oj-series oj-${s.mark}${s.dash ? ' oj-dash' : ''}`}>
          <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
          {s.values.map((v, i) => {
            const tip = { key: `${s.short}-${i}`, x: x(i), y: y(v), text: `${s.short}, ${TIERS[i]}: ${f3(v)}` }
            return (
              <g key={i} {...hit(tip, p)}>
                <circle cx={x(i)} cy={y(v)} r={3.5} />
                {p.set && <circle className="oj-hit-area" cx={x(i)} cy={y(v)} r={12} />}
              </g>
            )
          })}
        </g>
      ))}
      {SPLITS.map((s, i) => (
        <g key={s.name} className={`oj-series oj-${s.mark}${s.dash ? ' oj-dash' : ''}`} transform={`translate(${M.l + 18} ${M.t + 10 + i * 18})`}>
          <line x1={0} x2={22} y1={0} y2={0} />
          <text className="oj-key" x={30} y={0} dominantBaseline="middle">{s.name}</text>
        </g>
      ))}
      {TIERS.map((t, i) => (
        <text key={t} className="oj-tick" x={x(i)} y={H - M.b + 20} textAnchor="middle">{t}</text>
      ))}
    </Plot>
  )
}

function SplitStructurePlot(p: PlotProps) {
  // Fixed so the figure is identical on every render and in the prerender.
  const blocks = [
    [0.015, 1], [0.058, 0], [0.07, 1], [0.28, 0], [0.027, 1], [0.08, 0], [0.04, 1], [0.11, 0],
    [0.046, 1], [0.044, 0], [0.03, 1], [0.038, 0], [0.045, 1], [0.034, 0], [0.036, 1], [0.047, 0],
  ] as const
  let at = 0
  return (
    <Plot p={p} height={250}>
      <text className="oj-key" x={0} y={16}>What I assumed: a chronological split</text>
      <rect className="oj-train" x={0} y={30} width={W * 0.72} height={46} />
      <rect className="oj-test" x={W * 0.72} y={30} width={W * 0.28} height={46} />
      <text className="oj-inbar" x={W * 0.36} y={53} textAnchor="middle" dominantBaseline="middle">train 2013–2014</text>
      <text className="oj-inbar" x={W * 0.86} y={53} textAnchor="middle" dominantBaseline="middle">test 2015</text>

      <text className="oj-key" x={0} y={126}>What it is: tests assigned at random, both spanning 2013–2015</text>
      {blocks.map(([w, test], i) => {
        const x = at * W
        at += w
        return <rect key={i} className={test ? 'oj-test' : 'oj-train'} x={x} y={140} width={w * W} height={46} />
      })}
      <text className="oj-note" x={W / 2} y={228} textAnchor="middle">83% of every split predates 2015</text>
    </Plot>
  )
}

function AblationsPlot(p: PlotProps) {
  const band = PW / ABLATIONS.length
  const y = scale(0.55, 0.86, H - M.b, M.t)
  const base = ABLATIONS[0].value
  return (
    <Plot p={p}>
      <YAxis ticks={[0.6, 0.65, 0.7, 0.75, 0.8, 0.85]} y={y} fmt={(v) => v.toFixed(2)} />
      {ABLATIONS.map((a, i) => {
        const cx = M.l + band * (i + 0.5)
        const bw = band * 0.56
        const delta = i ? ` (+${f3(a.value - base)})` : ''
        const tip = { key: `ab-${i}`, x: cx, y: y(a.value), text: `${a.label.join(' ')}: ${f3(a.value)}${delta}` }
        return (
          <g key={i} className={`oj-bar oj-${a.mark}`}>
            <rect x={cx - bw / 2} y={y(a.value)} width={bw} height={y(0.55) - y(a.value)} {...hit(tip, p)} />
            <text className="oj-val" x={cx} y={y(a.value) - (i ? 22 : 8)} textAnchor="middle">{f3(a.value)}</text>
            {i > 0 && (
              <text className="oj-delta" x={cx} y={y(a.value) - 7} textAnchor="middle">+{f3(a.value - base)}</text>
            )}
            {a.label.map((line, j) => (
              <text key={j} className="oj-tick" x={cx} y={H - M.b + 18 + j * 14} textAnchor="middle">{line}</text>
            ))}
          </g>
        )
      })}
    </Plot>
  )
}

function CalibrationPlot(p: PlotProps) {
  const x = scale(-3, 3.1, M.l, W - M.r)
  const y = scale(-24, 26, H - M.b, M.t)
  return (
    <Plot p={p}>
      <YAxis ticks={[-20, -10, 0, 10, 20]} y={y} fmt={(v) => `${v > 0 ? '+' : ''}${v}%`} />
      <rect className="oj-shade" x={x(-0.35)} y={M.t} width={x(0.35) - x(-0.35)} height={PH} />
      <text className="oj-note" x={x(0)} y={M.t + 16} textAnchor="middle">model says</text>
      <text className="oj-note" x={x(0)} y={M.t + 30} textAnchor="middle">“these are the same”</text>
      <line className="oj-ref" x1={M.l} x2={W - M.r} y1={y(0)} y2={y(0)} />
      {CALIBRATION.map(([s, v, lo, hi]) => {
        const tip = { key: `cal-${s}`, x: x(s), y: y(v), text: `score ${s.toFixed(2)}: ${pct(v)}, 90% ${lo.toFixed(1)} to ${hi.toFixed(1)}` }
        return (
          <g key={s} className="oj-err">
            <line x1={x(s)} x2={x(s)} y1={y(lo)} y2={y(hi)} />
            <line x1={x(s) - 4} x2={x(s) + 4} y1={y(lo)} y2={y(lo)} />
            <line x1={x(s) - 4} x2={x(s) + 4} y1={y(hi)} y2={y(hi)} />
            <g {...hit(tip, p)}>
              <circle cx={x(s)} cy={y(v)} r={4.5} />
              {p.set && <circle className="oj-hit-area" cx={x(s)} cy={y(v)} r={12} />}
            </g>
          </g>
        )
      })}
      {[-2, -1, 0, 1, 2, 3].map((t) => (
        <text key={t} className="oj-tick" x={x(t)} y={H - M.b + 20} textAnchor="middle">{t}</text>
      ))}
      <text className="oj-note" x={W - M.r} y={H - 4} textAnchor="end">model score</text>
    </Plot>
  )
}

type Chart = {
  caption: string
  Plot: (p: PlotProps) => ReactNode
  head: string[]
  rows: string[][]
}

const CHARTS: Record<string, Chart> = {
  splits: {
    caption: 'Same weights, three splits of the same archive',
    Plot: SplitsPlot,
    head: ['Tier', ...SPLITS.map((s) => s.short)],
    rows: TIERS.map((t, i) => [t, ...SPLITS.map((s) => f3(s.values[i]))]),
  },
  structure: {
    caption: 'What I assumed, and what it is',
    Plot: SplitStructurePlot,
    head: ['Split', 'Arms', 'Date range', 'Before 2015'],
    rows: SPLIT_TABLE,
  },
  ablations: {
    caption: 'The loss function beat more data, on fewer epochs',
    Plot: AblationsPlot,
    head: ['Run', 'Pairwise', 'vs Phase 0'],
    rows: ABLATIONS.map((a, i) => [a.label.join(', '), f3(a.value), i ? `+${f3(a.value - ABLATIONS[0].value)}` : '']),
  },
  calibration: {
    caption: 'What the score is worth, with 90% intervals',
    Plot: CalibrationPlot,
    head: ['Score', 'Click rate vs baseline', '90% interval'],
    rows: CALIBRATION.map(([s, v, lo, hi]) => [s.toFixed(2), pct(v), `${lo.toFixed(1)} to ${hi.toFixed(1)}`]),
  },
}

/**
 * The inline chart is a button; the dialog holds the same plot with live marks
 * and the numbers behind it. showModal() puts the dialog in the top layer, so
 * the page-enter transform on an ancestor cannot trap it.
 */
function ChartFigure({ chart }: { chart: Chart }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState<Tip | null>(null)
  const close = () => dialog.current?.close()
  return (
    <>
      <button type="button" className="oj-chart-open" aria-label={`Expand chart: ${chart.caption}`} onClick={() => dialog.current?.showModal()}>
        <chart.Plot active={null} set={null} />
        <span className="oj-chart-hint" aria-hidden="true">expand</span>
      </button>
      <figcaption>{chart.caption}</figcaption>
      <dialog
        ref={dialog}
        className="oj-dialog"
        aria-label={chart.caption}
        onClose={() => setActive(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        <div className="oj-dialog-body">
          <header className="oj-dialog-head">
            <p className="oj-dialog-caption">{chart.caption}</p>
            <button type="button" className="oj-dialog-close" onClick={close}>
              close
            </button>
          </header>
          <chart.Plot active={active} set={setActive} />
          <table>
            <thead>
              <tr>
                {chart.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>
    </>
  )
}

const DIR = '/assets/img/blog/decision-models'

export const OPENJEV_FIGURES: Record<string, ReactNode> = {
  [`${DIR}/splits.png`]: <ChartFigure chart={CHARTS.splits} />,
  [`${DIR}/split-structure.png`]: <ChartFigure chart={CHARTS.structure} />,
  [`${DIR}/ablations.png`]: <ChartFigure chart={CHARTS.ablations} />,
  [`${DIR}/calibration.png`]: <ChartFigure chart={CHARTS.calibration} />,
}
