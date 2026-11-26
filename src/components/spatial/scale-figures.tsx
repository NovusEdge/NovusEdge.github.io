import type { CSSProperties, ComponentType } from 'react'
import { Fig, pace } from './kit'
import './scale.css'

const num = (n: number) => n.toLocaleString('en-US')

// One roof centre, in metres from the scene origin, split along directions every engine agrees on.
// Each engine line below only renames those directions to its own axes and units:
// Godot is right-handed (+X right, +Y up, −Z forward), Unity left-handed (+X right, +Y up, +Z forward),
// Unreal left-handed (+X forward, +Y right, +Z up) in centimetres.
const ROOF = { right: 2, up: 3.2, forward: 1.5 }
const cm = (m: number) => Math.round(m * 100)
const ENGINES = [
  { name: 'Godot', rule: '+Y up, −Z forward, metres, Transform3D', value: `origin = Vector3(${ROOF.right}, ${ROOF.up}, ${-ROOF.forward})` },
  { name: 'Unity', rule: '+Y up, +Z forward, metres, left-handed', value: `position = Vector3(${ROOF.right}, ${ROOF.up}, ${ROOF.forward})` },
  { name: 'Unreal', rule: '+Z up, +X forward, centimetres, left-handed', value: `Location = FVector(${cm(ROOF.forward)}, ${cm(ROOF.right)}, ${cm(ROOF.up)})` },
]
const ADAPTER_BEATS = ['one call, no engine named', 'Godot: forward is −Z', 'Unity: same metres, Z flipped', 'Unreal: Z is up, in centimetres']
const CARD = { x: 44, w: 308, h: 84, y: (i: number) => 130 + i * 92 }
// An engine's rule is set on two lines, broken after its second comma: at 12px on a phone the longest is wider than the card.
const ruleLines = (rule: string) => {
  const cut = rule.indexOf(', ', rule.indexOf(', ') + 1) + 1
  return [rule.slice(0, cut), rule.slice(cut + 1)]
}

function Adapters() {
  return (
    // The floor covers the 1.1 s the dot takes to reach its card.
    <Fig id="adapters" labels={ADAPTER_BEATS} rest={3} ms={pace(ADAPTER_BEATS, 2200)} caption="In the design, a thin layer turns one attach call into the same placement written in each engine's own axes and units.">
      {(beat) => {
        const mid = (i: number) => CARD.y(i) + CARD.h / 2
        const trip = beat === 0 ? 'M180,38 V70' : `M22,112 V${mid(beat - 1)} H${CARD.x}`
        return (
          <div className="sp-fit fit-adapters">
          <svg
            viewBox="0 0 360 406"
            role="img"
            aria-label={`The call attach(roof, walls.top) enters a runtime layer that holds the roof's placement as ${ROOF.right} m right, ${ROOF.up} m up and ${ROOF.forward} m forward. The layer fans out to three engines. ${ENGINES.map((e) => `${e.name} (${e.rule}): ${e.value}`).join('. ')}.`}
          >
            <rect className="sp-box" x="70" y="8" width="220" height="30" rx="5" />
            <text x="180" y="28" textAnchor="middle" className="sp-strong">
              attach(roof, walls.top)
            </text>
            <path className="sp-line" d="M180,38 V69 m-4,-5 l4,5 l4,-5" />
            <rect className="sp-box sp-tint-a" x="8" y="70" width="344" height="42" rx="5" />
            <text x="180" y="88" textAnchor="middle" className="sp-strong">
              runtime layer
            </text>
            <text x="180" y="103" textAnchor="middle" className="sp-small">
              roof: {ROOF.right} m right, {ROOF.up} m up, {ROOF.forward} m forward
            </text>
            <path className="sp-line" d={`M22,112 V${mid(2)}`} />
            {ENGINES.map((engine, i) => {
              const y = CARD.y(i)
              return (
                <g key={engine.name}>
                  <path className="sp-line" d={`M22,${mid(i)} H${CARD.x - 1} m-5,-4 l5,4 l-5,4`} />
                  <rect className={beat === i + 1 ? 'sp-box sp-tint-a sp-heavy' : 'sp-box'} x={CARD.x} y={y} width={CARD.w} height={CARD.h} rx="5" />
                  <text x={CARD.x + 12} y={y + 20} className="sp-strong">
                    {engine.name}
                  </text>
                  {ruleLines(engine.rule).map((line, n) => (
                    <text key={line} x={CARD.x + 12} y={y + 37 + n * 16} className="sp-soft sp-small">
                      {line}
                    </text>
                  ))}
                  <text x={CARD.x + 12} y={y + 74} className="sp-strong" style={{ visibility: beat > i ? 'visible' : 'hidden' }}>
                    {engine.value}
                  </text>
                </g>
              )
            })}
            <circle key={beat} r="6" className="sc-dot" style={{ offsetPath: `path("${trip}")` }} />
          </svg>
          </div>
        )
      }}
    </Fig>
  )
}

const K = 8
const pairs = (n: number) => (n * (n - 1)) / 2
const nearest = (n: number) => n * K
// Both axes are logarithmic: a decade of n is 146 px and a decade of relations is 40 px.
const nx = (n: number) => 48 + (Math.log10(n) - 1) * 146
const ry = (v: number) => 216 - (Math.log10(v) - 1) * 40
const curve = (f: (n: number) => number) =>
  Array.from({ length: 25 }, (_, i) => 10 ** (1 + i / 12))
    .map((n, i) => `${i ? 'L' : 'M'}${nx(n).toFixed(1)},${ry(f(n)).toFixed(1)}`)
    .join(' ')
// n(n−1)/2 = 8n when n − 1 = 16.
const EVEN = 2 * K + 1
const SCALING_BEATS = ['every pair: n(n−1)/2', `nearest neighbours only: n·k, k = ${K}`, `at 1,000 objects: ${num(pairs(1000))} against ${num(nearest(1000))}`]

function Scaling() {
  return (
    <Fig
      id="scaling"
      labels={SCALING_BEATS}
      rest={2}
      // The floor covers the 1.8 s a curve takes to draw.
      ms={pace(SCALING_BEATS, 2600)}
      caption={`Relations between every pair of objects grow with the square of the object count, and relations to each object's ${K} nearest neighbours grow in step with it.`}
    >
      {(beat) => {
        const near = { visibility: beat >= 1 ? 'visible' : 'hidden' } as const
        return (
          <div className="sp-fit fit-scaling">
          <svg
            // 14 units of headroom: the axis title and the top value sit above the 1M gridline.
            viewBox="0 -14 360 272"
            role="img"
            aria-label={`Relations to compute against the number of objects, from 10 to 1,000, both on logarithmic axes. Every pair: ${num(pairs(100))} at 100 objects and ${num(pairs(1000))} at 1,000. Nearest ${K} neighbours only: ${num(nearest(100))} at 100 objects and ${num(nearest(1000))} at 1,000. The two are equal at ${EVEN} objects.`}
          >
            {['10', '100', '1k', '10k', '100k', '1M'].map((label, i) => (
              <g key={label}>
                <path className="sp-line sp-faint" d={`M48,${216 - i * 40} H340`} />
                <text x="42" y={220 - i * 40} textAnchor="end" className="sp-soft sp-small">
                  {label}
                </text>
              </g>
            ))}
            {[10, 100, 1000].map((n) => (
              <text key={n} x={nx(n)} y="233" textAnchor="middle" className="sp-soft sp-small">
                {num(n)}
              </text>
            ))}
            <text x="194" y="252" textAnchor="middle" className="sp-soft sp-small">
              objects in the scene (n)
            </text>
            <text x="48" y="6" className="sp-soft sp-small">
              relations to compute
            </text>
            <path className="sp-line sp-heavy" d="M56,28 H76" />
            <text x="82" y="32" className="sp-small">
              every pair: n(n−1)/2
            </text>
            <g style={near}>
              <path className="sp-line sp-stroke-a sp-heavy" d="M56,44 H76" />
              <text x="82" y="48" className="sp-small">
                nearest {K}: n·k
              </text>
            </g>
            <path className={`sp-line sp-heavy${beat === 0 ? ' sc-draw' : ''}`} pathLength="1" d={curve(pairs)} />
            <path className={`sp-line sp-stroke-a sp-heavy${beat === 1 ? ' sc-draw' : ''}`} pathLength="1" d={curve(nearest)} style={near} />
            {[100, 1000].map((n) => (
              <g key={n}>
                <path className="sp-line sp-dash pl-ants" d={`M${nx(n)},${ry(pairs(n))} V${ry(nearest(n))}`} style={{ visibility: beat === 2 ? 'visible' : 'hidden' }} />
                <circle className="sp-box" cx={nx(n)} cy={ry(pairs(n))} r="4" />
                {/* Offsets keep each value clear of its own line and of the gridlines. */}
                <text x={nx(n) - (n === 100 ? 16 : 8)} y={ry(pairs(n)) - (n === 100 ? 0 : 18)} textAnchor="end" className="sp-strong">
                  {num(pairs(n))}
                </text>
                <g style={near}>
                  <circle className="sp-box sp-tint-a" cx={nx(n)} cy={ry(nearest(n))} r="4" />
                  <text x={n === 100 ? nx(n) + 8 : nx(n) - 6} y={ry(nearest(n)) + (n === 100 ? 18 : 24)} textAnchor={n === 100 ? 'start' : 'end'} className="sp-strong">
                    {num(nearest(n))}
                  </text>
                </g>
              </g>
            ))}
            <text x={nx(EVEN) + 10} y={ry(pairs(EVEN)) + 20} className="sp-soft sp-small" style={near}>
              equal at n = {EVEN}
            </text>
          </svg>
          </div>
        )
      }}
    </Fig>
  )
}

const LANES = {
  code: { x: 8, w: 188, title: 'deterministic code', facts: ['order of ms', 'free', 'same answer every time'] },
  model: { x: 204, w: 148, title: 'model call', facts: ['order of seconds', 'costs tokens', 'answer can vary'] },
}
const CHECKS: { lines: string[]; lane: keyof typeof LANES; y: number; label: string }[] = [
  { lines: ['overlap'], lane: 'code', y: 124, label: 'overlap: deterministic code' },
  { lines: ['supported'], lane: 'code', y: 156, label: 'supported: deterministic code' },
  { lines: ['inside-room'], lane: 'code', y: 188, label: 'inside-room: deterministic code' },
  { lines: ['facing'], lane: 'code', y: 220, label: 'facing: deterministic code' },
  { lines: ['trigger-matches-mesh'], lane: 'code', y: 252, label: 'trigger-matches-mesh: deterministic code' },
  { lines: ['compile check', 'Roslyn, no engine'], lane: 'code', y: 284, label: 'compile check: Roslyn, before anything touches the engine' },
  { lines: ['“does this look', 'like a kitchen?”'], lane: 'model', y: 124, label: '“does this look like a kitchen?”: the one model call' },
]
const INBOX = { x: 180, y: 8 }
const CHECK_BEATS = CHECKS.map((check) => check.label)

function CheckCosts() {
  return (
    <Fig
      id="check-costs"
      labels={CHECK_BEATS}
      rest={CHECKS.length - 1}
      // The floor covers the 1.3 s a chip takes to drop into its lane.
      ms={pace(CHECK_BEATS, 1700)}
      caption="Every check with an exact answer runs as code, which leaves the model the one question that needs judgement."
    >
      {(beat) => (
        <div className="sp-fit fit-checks">
        <svg
          viewBox="0 0 360 342"
          role="img"
          aria-label={`Two lanes. Deterministic code: order of milliseconds, free, the same answer every time. Model call: order of seconds, costs tokens, the answer can vary. Sorted so far: ${CHECKS.slice(0, beat + 1)
            .map((check) => `${check.lines.join(' ')} in ${LANES[check.lane].title}`)
            .join('; ')}.`}
        >
          {Object.values(LANES).map((lane) => (
            <g key={lane.title}>
              <rect className="sp-frame" x={lane.x} y="46" width={lane.w} height="288" rx="6" />
              <text x={lane.x + 10} y="66" className="sp-strong">
                {lane.title}
              </text>
              {lane.facts.map((fact, i) => (
                <text key={fact} x={lane.x + 10} y={82 + i * 15} className="sp-soft sp-small">
                  {fact}
                </text>
              ))}
            </g>
          ))}
          {CHECKS.map((check, i) => {
            const lane = LANES[check.lane]
            const [x, w, h] = [lane.x + 8, lane.w - 16, check.lines.length > 1 ? 40 : 26]
            return (
              <g
                key={check.label}
                className={beat === i ? 'sc-drop' : undefined}
                style={{ visibility: beat >= i ? 'visible' : 'hidden', '--dx': `${INBOX.x - (x + w / 2)}px`, '--dy': `${INBOX.y - check.y}px` } as CSSProperties}
              >
                <rect className={check.lane === 'model' ? 'sp-box sp-tint-a' : 'sp-box'} x={x} y={check.y} width={w} height={h} rx="5" />
                {check.lines.map((line, n) => (
                  <text key={line} x={x + w / 2} y={check.y + 17 + n * 15} textAnchor="middle" className={n === 1 && check.lane === 'code' ? 'sp-soft sp-small' : 'sp-strong'}>
                    {line}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
        </div>
      )}
    </Fig>
  )
}

// The guesses are illustrative: the three failures are the ones the post lists for moving objects.
const SETUPS = [
  { id: 'A', guess: 'falls' },
  { id: 'B', guess: 'holds' },
  { id: 'C', guess: 'clips' },
  { id: 'D', guess: 'falls' },
  { id: 'E', guess: 'holds' },
  { id: 'F', guess: 'clips' },
]
const PICK = 'B'
const WORLD_BEATS = ['candidates: many possible setups', 'a world model predicts each one and prunes', 'you pick one of the survivors', 'the engine simulates that one exactly']

function WorldModel() {
  return (
    <Fig
      id="world-model"
      labels={WORLD_BEATS}
      rest={3}
      ms={pace(WORLD_BEATS, 2200)}
      caption="A world model screens many candidate setups before the pick, and the engine gives the exact answer for the one that was picked."
    >
      {(beat) => {
        const pickY = 92 + SETUPS.findIndex((s) => s.id === PICK) * 30
        // The pick is at x = 200: everything after it has 160 units, which holds its longest line at 12px on a phone.
        return (
          <div className="sp-fit fit-world">
          <svg
            viewBox="0 0 360 280"
            role="img"
            aria-label={`A timeline split by the moment you pick a setup. Before the pick, a world model, fast and approximate, predicts what each of ${SETUPS.length} candidate setups will do: ${SETUPS.map((s) => `${s.id} ${s.guess}`).join(', ')}. The ones predicted to fail are pruned and setup ${PICK} is picked. After the pick, the engine simulates setup ${PICK} exactly.`}
          >
            <path className="sp-line" d="M8,28 H351 m-6,-4 l6,4 l-6,4" />
            <text x="8" y="17" className="sp-soft">
              before you pick
            </text>
            <text x="200" y="17" textAnchor="middle" className="sp-strong">
              pick
            </text>
            <text x="352" y="17" textAnchor="end" className="sp-soft">
              after
            </text>
            <path className="sp-line sp-stroke-a sp-heavy sp-dash pl-ants" d="M200,28 V272" />
            <text x="8" y="50" className="sp-strong">
              world model
            </text>
            <text x="8" y="65" className="sp-soft sp-small">
              fast and approximate,
            </text>
            <text x="8" y="80" className="sp-soft sp-small">
              so it screens many
            </text>
            <text x="214" y="50" className="sp-strong">
              engine
            </text>
            <text x="214" y="65" className="sp-soft sp-small">
              exact, for the one
            </text>
            <text x="214" y="80" className="sp-soft sp-small">
              you picked
            </text>
            {SETUPS.map((setup, i) => {
              const y = 92 + i * 30
              const out = setup.guess !== 'holds'
              const picked = setup.id === PICK && beat >= 2
              return (
                <g key={setup.id} className="sc-fade" style={{ opacity: out && beat >= 1 ? 0.55 : 1 }}>
                  <rect className={picked ? 'sp-box sp-tint-a sp-heavy' : 'sp-box'} x="8" y={y} width="78" height="24" rx="4" />
                  <text x="47" y={y + 16} textAnchor="middle">
                    setup {setup.id}
                  </text>
                  <g style={{ visibility: beat >= 1 ? 'visible' : 'hidden' }}>
                    <path className="sp-line" d={`M90,${y + 12} H117 m-5,-4 l5,4 l-5,4`} />
                    <text x="124" y={y + 16} className={out ? undefined : 'sp-strong'}>
                      ≈ {setup.guess}
                    </text>
                    {out && <path className="sp-line" d={`M4,${y + 12} H90`} />}
                  </g>
                </g>
              )
            })}
            <path className="sp-line sp-heavy" d={`M182,${pickY + 12} H219 m-6,-5 l6,5 l-6,5`} style={{ visibility: beat >= 2 ? 'visible' : 'hidden' }} />
            <g className="sc-fade" style={{ opacity: beat >= 3 ? 1 : 0 }}>
              <rect className="sp-box sp-tint-a sp-heavy" x="222" y={pickY} width="78" height="24" rx="4" />
              <text x="261" y={pickY + 16} textAnchor="middle">
                setup {PICK}
              </text>
              <text x="214" y={pickY + 44} className="sp-strong">
                simulated exactly
              </text>
            </g>
          </svg>
          </div>
        )
      }}
    </Fig>
  )
}

// Counts and splits come from Qwen/Qwen2.5-7B-Instruct's tokenizer.json over one fixed scene state:
// 10 objects, each a position, a quaternion and a linear velocity, 100 float32 values in all.
// Digits and bits tokenize one character per token, so only the JSON sample needs its split spelled out.
const SAMPLE_BITS = '11000001001100011100110000101001'
const ENCODINGS = [
  {
    title: 'JSON',
    count: 811,
    note: 'compact, 4 decimals',
    sampleOf: "object 0's position",
    pieces: ['{"', 'id', '":', '0', ',"', 'position', '":[-', '1', '1', '.', '1', '1', '2', '3', ',', '1', '.', '5', '8', '6', '8', ',', '4', '.', '0', '5', '4', ']}'],
  },
  { title: 'Plain digits', count: 704, note: 'space-separated, 4 decimals', sampleOf: 'the same three numbers', pieces: [...'-11.1123 1.5868 4.0540'] },
  { title: 'Bits', count: 3299, note: 'space-separated; 3,200 unspaced', sampleOf: 'the first of them, −11.1123, as a float32', pieces: [...SAMPLE_BITS] },
]
const MOST = Math.max(...ENCODINGS.map((e) => e.count))
const TOKEN_BEATS = [...ENCODINGS.map((e) => `${e.title}: ${num(e.count)} tokens`), 'the same 100 numbers, three costs']

function TokenCount() {
  return (
    <Fig
      id="token-count"
      labels={TOKEN_BEATS}
      rest={3}
      // Each beat has a count, a meter and a token split to take in, which its three-word label does not account for.
      ms={pace(TOKEN_BEATS, 2400)}
      caption="Qwen's tokenizer spends a token on every digit and every bit, so the same 100 numbers cost 811 tokens as JSON, 704 as plain digits and 3,299 as bits."
    >
      {(beat) => (
        <div className="sp-panels">
          {ENCODINGS.map((encoding, i) => (
            <div key={encoding.title} className={`sp-panel sc-enc${beat === i || beat === 3 ? ' sc-enc--on' : ''}`}>
              <p className="sp-title">{encoding.title}</p>
              <p className="sc-count">
                <strong>{num(encoding.count)}</strong>tokens: {encoding.note}
              </p>
              <div className="sc-meter" aria-hidden="true">
                <span style={{ transform: `scaleX(${beat >= i ? encoding.count / MOST : 0})` }} />
              </div>
              <p className="sc-count">
                {encoding.sampleOf}: {encoding.pieces.length} tokens
              </p>
              <p className="sc-pieces" role="img" aria-label={`${encoding.pieces.join('')}, split into ${encoding.pieces.length} tokens`}>
                {encoding.pieces.map((piece, n) => (
                  <span key={n}>{piece === ' ' ? '␣' : piece}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
      )}
    </Fig>
  )
}

export const SCALE_FIGURES: Record<string, ComponentType> = {
  adapters: Adapters,
  scaling: Scaling,
  'check-costs': CheckCosts,
  'world-model': WorldModel,
  'token-count': TokenCount,
}
