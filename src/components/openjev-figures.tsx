import type { ReactNode } from 'react'

// Numbers from roomful/experiments/charts.py, which drew the original PNGs.
const TIERS = ['all pairs', 'p<0.10', 'p<0.05', 'p<0.01', 'p<0.001']
const SPLITS = [
  { name: 'confirmatory 2015, the one I posted', values: [0.704, 0.745, 0.763, 0.798, 0.841], mark: 'ox', dash: false },
  { name: 'holdout', values: [0.637, 0.654, 0.662, 0.675, 0.682], mark: 'ink', dash: false },
  { name: 'exploratory', values: [0.624, 0.643, 0.656, 0.666, 0.703], mark: 'ink', dash: true },
] as const

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

function Caption({ children }: { children: ReactNode }) {
  return <figcaption>{children}</figcaption>
}

function SplitsFigure() {
  const x = (i: number) => M.l + 24 + (i * (PW - 48)) / (TIERS.length - 1)
  const y = scale(0.48, 0.88, H - M.b, M.t)
  return (
    <>
      <svg className="oj-plot" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <YAxis ticks={[0.5, 0.6, 0.7, 0.8]} y={y} fmt={(v) => v.toFixed(2)} />
        <line className="oj-ref" x1={M.l} x2={W - M.r} y1={y(0.544)} y2={y(0.544)} />
        <text className="oj-note" x={W - M.r} y={y(0.544) - 6} textAnchor="end">published SOTA 0.544</text>
        <line className="oj-ref oj-ref-dot" x1={M.l} x2={W - M.r} y1={y(0.5)} y2={y(0.5)} />
        <text className="oj-note" x={W - M.r} y={y(0.5) - 6} textAnchor="end">chance</text>
        {SPLITS.map((s) => (
          <g key={s.name} className={`oj-series oj-${s.mark}${s.dash ? ' oj-dash' : ''}`}>
            <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={3.5} />
            ))}
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
      </svg>
      <Caption>Same weights, three splits of the same archive. Pairwise accuracy by how decisive the original test was.</Caption>
    </>
  )
}

function SplitStructureFigure() {
  // Fixed so the figure is identical on every render and in the prerender.
  const blocks = [
    [0.015, 1], [0.058, 0], [0.07, 1], [0.28, 0], [0.027, 1], [0.08, 0], [0.04, 1], [0.11, 0],
    [0.046, 1], [0.044, 0], [0.03, 1], [0.038, 0], [0.045, 1], [0.034, 0], [0.036, 1], [0.047, 0],
  ] as const
  const bx = 0
  const bw = W
  let at = 0
  return (
    <>
      <svg className="oj-plot" viewBox={`0 0 ${W} 250`} aria-hidden="true">
        <text className="oj-key" x={0} y={16}>What I assumed: a chronological split</text>
        <rect className="oj-train" x={bx} y={30} width={bw * 0.72} height={46} />
        <rect className="oj-test" x={bw * 0.72} y={30} width={bw * 0.28} height={46} />
        <text className="oj-inbar" x={bw * 0.36} y={53} textAnchor="middle" dominantBaseline="middle">train 2013–2014</text>
        <text className="oj-inbar" x={bw * 0.86} y={53} textAnchor="middle" dominantBaseline="middle">test 2015</text>

        <text className="oj-key" x={0} y={126}>What it is: tests assigned at random, both spanning 2013–2015</text>
        {blocks.map(([w, test], i) => {
          const x = at * bw
          at += w
          return <rect key={i} className={test ? 'oj-test' : 'oj-train'} x={x} y={140} width={w * bw} height={46} />
        })}
        <text className="oj-note" x={W / 2} y={228} textAnchor="middle">83% of every split predates 2015</text>
      </svg>
      <Caption>The split the benchmark assumed, against the one the archive ships.</Caption>
    </>
  )
}

function AblationsFigure() {
  const band = PW / ABLATIONS.length
  const y = scale(0.55, 0.86, H - M.b, M.t)
  const base = ABLATIONS[0].value
  return (
    <>
      <svg className="oj-plot" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <YAxis ticks={[0.6, 0.65, 0.7, 0.75, 0.8, 0.85]} y={y} fmt={(v) => v.toFixed(2)} />
        {ABLATIONS.map((a, i) => {
          const cx = M.l + band * (i + 0.5)
          const bw = band * 0.56
          return (
            <g key={i} className={`oj-bar oj-${a.mark}`}>
              <rect x={cx - bw / 2} y={y(a.value)} width={bw} height={y(0.55) - y(a.value)} />
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
      </svg>
      <Caption>The loss function beat more data, on fewer epochs. Pairwise accuracy on the holdout split.</Caption>
    </>
  )
}

function CalibrationFigure() {
  const x = scale(-3, 3.1, M.l, W - M.r)
  const y = scale(-24, 26, H - M.b, M.t)
  return (
    <>
      <svg className="oj-plot" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <YAxis ticks={[-20, -10, 0, 10, 20]} y={y} fmt={(v) => `${v > 0 ? '+' : ''}${v}%`} />
        <rect className="oj-shade" x={x(-0.35)} y={M.t} width={x(0.35) - x(-0.35)} height={PH} />
        <text className="oj-note" x={x(0)} y={M.t + 16} textAnchor="middle">model says</text>
        <text className="oj-note" x={x(0)} y={M.t + 30} textAnchor="middle">“these are the same”</text>
        <line className="oj-ref" x1={M.l} x2={W - M.r} y1={y(0)} y2={y(0)} />
        {CALIBRATION.map(([s, v, lo, hi]) => (
          <g key={s} className="oj-err">
            <line x1={x(s)} x2={x(s)} y1={y(lo)} y2={y(hi)} />
            <line x1={x(s) - 4} x2={x(s) + 4} y1={y(lo)} y2={y(lo)} />
            <line x1={x(s) - 4} x2={x(s) + 4} y1={y(hi)} y2={y(hi)} />
            <circle cx={x(s)} cy={y(v)} r={4.5} />
          </g>
        ))}
        {[-2, -1, 0, 1, 2, 3].map((t) => (
          <text key={t} className="oj-tick" x={x(t)} y={H - M.b + 20} textAnchor="middle">{t}</text>
        ))}
        <text className="oj-note" x={W - M.r} y={H - 4} textAnchor="end">model score</text>
      </svg>
      <Caption>What the score is worth: click rate against the test's baseline, with 90% intervals.</Caption>
    </>
  )
}

const DIR = '/assets/img/blog/decision-models'

export const OPENJEV_FIGURES: Record<string, ReactNode> = {
  [`${DIR}/splits.png`]: <SplitsFigure />,
  [`${DIR}/split-structure.png`]: <SplitStructureFigure />,
  [`${DIR}/ablations.png`]: <AblationsFigure />,
  [`${DIR}/calibration.png`]: <CalibrationFigure />,
}
