import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TLink } from '../../components/page-transition'
import { Github, Package, Globe, ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import { AimdTrack, Cascade, Cat, ForgettingCurves, Wiring } from '../../components/veil/diagrams'
import type { LayoutProps } from './layouts'

gsap.registerPlugin(ScrollTrigger)

const iconFor = (href: string) =>
  href.includes('github.com') ? Github : href.includes('npmjs.com') ? Package : Globe

const PROSE =
  'text-[17px] leading-[1.75] text-bone/80 [&>p]:my-6 [&>p]:max-w-[65ch] [&_strong]:text-bone [&_code]:rounded [&_code]:bg-bone/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-bone [&_a]:border-b [&_a]:border-gold/40 [&_a]:text-bone [&_a:hover]:border-gold [&_a:hover]:text-gold'

function Code({ children }: { children: string }) {
  return (
    <pre className="not-prose my-8 overflow-x-auto border border-bone/12 bg-bone/[0.02] px-5 py-5 font-mono text-[12.5px] leading-relaxed text-bone/75">
      {children}
    </pre>
  )
}

// Deterministic per-word ordering. Math.random would desync the prerendered
// HTML from the first client render.
function hash01(word: string, i: number) {
  let h = i * 2654435761
  for (let k = 0; k < word.length; k++) h = (h ^ word.charCodeAt(k)) * 16777619
  return ((h >>> 0) % 1000) / 1000
}

/* Text partway through being forgotten. Each word holds its own threshold, so
   raising `decay` erases the same words in the same order every time. An
   erased word keeps its box: the line loses its content, never its shape. The
   redaction marks sit at uneven insets and angles so they read as something
   drawn over the word rather than as a loading skeleton. */
function Decayed({ text, decay, seed = 0 }: { text: string; decay: number; seed?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => {
        const t = hash01(w, i + seed)
        const gone = decay > t
        const faded = !gone && decay > 0 && decay > t - 0.28
        const j = hash01(w, i + seed + 91)
        return (
          <span key={i} className={gone ? 'relative inline-block' : undefined}>
            <span
              className={
                gone
                  ? 'invisible'
                  : faded
                    ? 'text-bone/30 line-through decoration-bone/25 transition-colors duration-500'
                    : 'transition-colors duration-500'
              }
            >
              {w}
            </span>
            {gone && (
              <span
                aria-hidden
                className="absolute bg-bone/[0.11]"
                style={{
                  left: `${(j * 6 - 3).toFixed(1)}%`,
                  right: `${(j * 5 - 1).toFixed(1)}%`,
                  top: `${(0.12 + j * 0.12).toFixed(2)}em`,
                  bottom: `${(0.16 + (1 - j) * 0.1).toFixed(2)}em`,
                  transform: `rotate(${(j * 1.2 - 0.6).toFixed(2)}deg)`,
                }}
              />
            )}{' '}
          </span>
        )
      })}
    </>
  )
}

/* One line of an earlier session. `keep` is the fragment that survives every
   pass; read top to bottom, the kept fragments make a second sentence out of
   what the page is erasing. */
type Line = { text: string; keep?: string }

const RESIDUE: Line[] = [
  { text: 'the tenant resolver runs after the auth middleware, never before' },
  { text: 'the constraint you explained last week is the one that matters', keep: 'you explained' },
  { text: 'retry with a fresh token first, the 401 is not the real error' },
  { text: 'the summariser kept the imports and dropped the constraint', keep: 'dropped the constraint' },
  { text: 'pnpm workspace, so the lockfile lives at the root' },
  { text: 'attempt four failed the same way attempt two failed', keep: 'failed the same way' },
  { text: 'that migration already ran on staging on the 4th' },
  { text: 'keep the CLI local-first, nothing leaves the machine', keep: 'nothing leaves' },
  { text: 'the flake is the clock, not the assertion' },
  { text: 'goal: ship a memory layer with no model in the path', keep: 'a memory layer' },
  { text: 'sqlite-vec needs the prebuilt binary on node 22' },
  { text: 'do not touch the vendored shaders, tsc reads them through vendor.d.ts' },
]

function ResidueLine({ line, decay, seed }: { line: Line; decay: number; seed: number }) {
  if (!line.keep) return <Decayed text={line.text} decay={decay} seed={seed} />
  const at = line.text.indexOf(line.keep)
  const before = line.text.slice(0, at)
  const after = line.text.slice(at + line.keep.length)
  return (
    <>
      {before && <Decayed text={before.trimEnd()} decay={decay} seed={seed} />}{' '}
      <span className="border-b border-gold/40 text-bone transition-colors duration-700">{line.keep}</span>{' '}
      {after && <Decayed text={after.trimStart()} decay={decay} seed={seed + 41} />}
    </>
  )
}

/* Both hero layers render from this so their line boxes match to the pixel:
   an erased word keeps an invisible copy of itself, so the decayed layer and
   the intact layer wrap identically and the recall disc lands on the word it
   is restoring. */
function Wall({ decay }: { decay: (i: number) => number }) {
  return (
    <div className="mx-auto max-w-6xl space-y-1">
      {[...RESIDUE, ...RESIDUE].map((l, i) => (
        <p key={i} className="truncate" style={{ paddingLeft: `${((i * 5) % 7) * 4}%` }}>
          <ResidueLine line={l} decay={decay(i)} seed={i * 3} />
        </p>
      ))}
    </div>
  )
}

function Rail({ side, progress, show }: { side: 'left' | 'right'; progress: number; show: number }) {
  const lines = side === 'left' ? RESIDUE.slice(0, 6) : RESIDUE.slice(6)
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-[14vh] hidden max-h-[72vh] w-[15vw] max-w-[16rem] select-none space-y-9 overflow-hidden font-mono text-[12px] leading-relaxed text-bone/30 transition-opacity duration-500 xl:block ${
        side === 'left' ? 'left-6 text-right' : 'right-6'
      }`}
      style={{
        opacity: show,
        maskImage: 'linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)',
      }}
    >
      {lines.map((l, i) => (
        <p key={l.text}>
          <ResidueLine line={l} decay={Math.min(1, progress * 1.3 + i * 0.05)} seed={i * 7} />
        </p>
      ))}
    </div>
  )
}

/* The page's one argument, made twice: the same recall with the session's
   memory intact, and after a compaction pass took its guess. */
const RECALL =
  'The auth middleware has to run before the tenant resolver, because the resolver reads the claim the middleware sets, and the fix you tried on Tuesday failed for exactly that reason.'

function Compaction() {
  const [compacted, setCompacted] = useState(true)
  return (
    <div className="not-prose border border-bone/12 bg-bone/[0.02]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bone/12 px-5 py-3 sm:px-7">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone/45">session two, turn one</span>
        <div className="flex border border-bone/15 font-mono text-[11px] uppercase tracking-[0.16em]">
          {[
            { k: true, label: 'after compaction' },
            { k: false, label: 'with veil' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setCompacted(o.k)}
              className={`px-3 py-1.5 transition-colors ${
                compacted === o.k ? 'bg-gold text-charcoal' : 'text-bone/55 hover:text-bone'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-7 sm:px-7">
        <p className={`text-[17px] leading-[1.85] ${compacted ? 'text-bone/70' : 'text-bone/85'}`}>
          <Decayed text={RECALL} decay={compacted ? 0.5 : 0} seed={3} />
        </p>
        <p className="mt-6 font-mono text-[12px] leading-relaxed text-bone/45">
          {compacted
            ? 'The summariser kept what scored well on its heuristic. The agent retries Tuesday.'
            : 'Nothing here was worth evicting yet. Stability held it.'}
        </p>
      </div>
    </div>
  )
}

/* Datasheet register: the numbers an argument rests on, ruled and aligned,
   rather than spent inside a sentence. */
function Spec({ title, rows }: { title: string; rows: [string, string, string][] }) {
  return (
    <div className="not-prose border border-bone/12">
      <div className="border-b border-bone/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-bone/45">
        {title}
      </div>
      <dl className="divide-y divide-bone/[0.08]">
        {rows.map(([k, v, note]) => (
          <div key={k} className="grid grid-cols-[7rem_1fr] gap-x-5 px-5 py-3.5 sm:grid-cols-[8rem_9rem_1fr]">
            <dt className="font-mono text-[12px] uppercase tracking-[0.16em] text-bone/50">{k}</dt>
            <dd className="font-mono text-[13px] tabular-nums text-gold">{v}</dd>
            <dd className="col-span-2 mt-1 text-[14px] leading-snug text-bone/65 sm:col-span-1 sm:mt-0">{note}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const WEIGHTS: [string, number][] = [
  ['relevance', 0.3],
  ['recency', 0.25],
  ['frequency', 0.15],
  ['structure', 0.15],
  ['cognitive', 0.15],
]

function Weights() {
  return (
    <div className="not-prose border border-bone/12">
      <div className="border-b border-bone/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-bone/45">
        score weights · fixed
      </div>
      <div className="space-y-3 px-5 py-5">
        {WEIGHTS.map(([name, w]) => (
          <div key={name} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-4">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-bone/60">{name}</span>
            <span className="h-[7px] bg-bone/[0.07]">
              <span className="block h-full bg-gold/70" style={{ width: `${(w / 0.3) * 100}%` }} />
            </span>
            <span className="text-right font-mono text-[13px] tabular-nums text-bone/70">{w.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ATTEMPTS: [string, string, string, string][] = [
  ['01', 'reorder mounts in app.ts', 'FAIL', '4a91c0'],
  ['02', 'init resolver in bootstrap', 'FAIL', '7bd233'],
  ['03', 'reorder mounts in app.ts', 'FAIL', '4a91c0'],
  ['04', 'resolver re-reads the header', 'PARTIAL', '0c11ab'],
  ['05', 'reorder mounts in app.ts', 'FAIL', '4a91c0'],
]
const REPEAT = '4a91c0'

/* The convergence monitor as the document it is, not as a paragraph about it.
   The repeated fingerprint is the only gold on the page's lower half. */
function Ledger() {
  return (
    <div className="not-prose overflow-x-auto border border-bone/12 bg-bone/[0.02]">
      <div className="flex items-center justify-between gap-4 border-b border-bone/12 px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone/45">
          goal · auth-middleware-ordering
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone/35">attempt record</span>
      </div>
      <table className="w-full min-w-[34rem] font-mono text-[12.5px]">
        <tbody className="divide-y divide-bone/[0.08]">
          {ATTEMPTS.map(([n, what, outcome, fp]) => {
            const repeat = fp === REPEAT
            return (
              <tr key={n} className={repeat ? 'text-bone/80' : 'text-bone/55'}>
                <td className="py-3 pl-5 pr-4 tabular-nums text-bone/35">{n}</td>
                <td className="py-3 pr-4">{what}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`border px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] ${
                      outcome === 'FAIL' ? 'border-bone/25 text-bone/70' : 'border-bone/15 text-bone/45'
                    }`}
                  >
                    {outcome}
                  </span>
                </td>
                <td className={`py-3 pr-5 tabular-nums ${repeat ? 'text-gold' : 'text-bone/35'}`}>e:{fp}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-bone/12 px-5 py-4">
        <span className="font-mono text-[12px] text-bone/55">
          convergence: <span className="text-gold">3× e:{REPEAT}</span> on one goal
        </span>
        <span
          data-stamp
          className="border-2 border-gold px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-gold"
          style={{ transform: 'rotate(-2.5deg)' }}
        >
          hard stop
        </span>
      </div>
    </div>
  )
}

/* The page's closing line strikes out the thing it says stops happening. */
function Verdict() {
  return (
    <div className="not-prose border-l-2 border-gold py-1 pl-6">
      <p className="font-display text-xl font-medium leading-snug text-bone sm:text-2xl">
        With the failure record in place, an agent stops{' '}
        <span className="text-bone/40 line-through decoration-gold/60 decoration-2">
          retrying a fix that already failed
        </span>
        .
      </p>
    </div>
  )
}

// Real escalation levels and thresholds from the convergence monitor.
const ESCALATION: [string, string, string][] = [
  ['level 1', '3× repeat', 'the same error pattern three times; a warning goes into the context'],
  ['level 2', '5 failures', 'five consecutive failures on one goal; the harness gets a callback'],
  ['level 3', '10 turns', 'no measurable progress, or fifteen attempts; halt'],
]

// name plus the real one-line description from the tool schema
const TOOLS: [string, string][] = [
  ['veil_recall', 'search memory by semantic query or tag, and get IDs back to act on'],
  ['veil_promote', 'bring an item into active context so it is visible every turn'],
  ['veil_demote', 'take an item out of active context; it stays in memory for later recall'],
  ['veil_remember', 'store an insight, a decision, or a fact for later'],
  ['veil_pin', 'lock an item in context; pinned items survive eviction under pressure'],
  ['veil_unpin', 'unlock a pinned item and let it be evicted again'],
  ['veil_forget', 'delete something from every tier; this one cannot be undone'],
  ['veil_hydrate', 'expand a stub into its full content when the summary is not enough'],
  ['veil_history', 'search past sessions, not just this one'],
  ['veil_turn_meta', 'classify this turn: decision, exploration, action, correction, status, intent'],
  ['veil_conflicts', 'list beliefs that contradict each other on the same subject'],
  ['veil_resolve_conflict', 'pick which belief wins; the loser gets retracted'],
]

function ToolChips() {
  const [open, setOpen] = useState(0)
  return (
    <div className="not-prose my-8">
      <ul className="flex flex-wrap gap-2">
        {TOOLS.map(([name], i) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className={`rounded px-2 py-1 font-mono text-[12.5px] transition-colors ${
                i === open ? 'bg-gold text-charcoal' : 'bg-bone/10 text-bone/75 hover:bg-bone/20 hover:text-bone'
              }`}
            >
              {TOOLS[i][0]}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-l-2 border-gold/50 pl-4 text-[15px] leading-relaxed text-bone/65">{TOOLS[open][1]}</p>
    </div>
  )
}

const TURN_TYPES: [string, string, string][] = [
  ['correction', '0.00', 'you told the agent it was wrong; never evictable'],
  ['intent', '0.00', 'what the session is for'],
  ['decision', '0.10', 'a call that was made'],
  ['action', '0.60', 'a thing that got done'],
  ['status', '0.70', 'a report on the doing'],
  ['exploration', '0.80', 'looking around; first out'],
]

const STORE: [string, string, string][] = [
  ['memory_events', 'append only', 'assert, retract, reinforce; nothing is ever updated in place'],
  ['current_beliefs', 'projection', 'the readable present, rebuildable from the log'],
  ['memory_vectors', 'vec0 float[768]', 'sqlite-vec index for semantic recall'],
  ['memory_fts', 'fts5 mirror', 'kept in sync by insert and delete triggers'],
]

const STATS: [string, string][] = [
  ['30k', 'lines in the context engine'],
  ['358', 'test files'],
  ['12', 'tools the model can call'],
  ['0', 'model calls in the memory path'],
]

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'what-compaction-misses',
    title: 'what compaction misses',
    body: (
      <>
        <p>
          A session with no memory relearns the codebase every time it starts. It rediscovers a constraint you
          explained last week. It retries a fix that already failed.
        </p>
        <p>
          Compaction does not fix this. The summariser keeps whatever looks important by a fixed heuristic and drops
          the rest, and the dropped part matters more often than the tool assumes.
        </p>
        <div className="my-12">
          <Compaction />
        </div>
        <p>
          Veil replaces that summariser with an eviction system. Every piece of context carries its own decay
          schedule, so no single pass wipes a session.
        </p>
      </>
    ),
  },
  {
    id: 'install',
    title: 'install',
    body: (
      <>
        <p>It ships as a global npm package and takes over the session you run it in.</p>
        <Code>{`npm install -g @engrammic/veil
cd your-project
veil`}</Code>
        <p>
          It runs local-first on <code>sqlite-vec</code> embeddings, with the embedder in-process and Ollama as a
          fallback. Nothing about the codebase leaves the machine, and it works with the network off.
        </p>
      </>
    ),
  },
  {
    id: 'in-the-loop',
    title: 'where it sits in the agent',
    body: (
      <>
        <p>
          Veil is a fork of{' '}
          <a href="https://github.com/badlogic/pi-mono" target="_blank" rel="noopener noreferrer">
            pi-mono
          </a>
          , Mario Zechner&rsquo;s agent
          harness, not a plugin on top of one. The memory layer runs inside the loop: a manifest of what is currently
          loaded gets appended to the system prompt, and every tool call passes through capture, scoring and
          eviction on the way in and out.
        </p>
        <div className="my-12">
          <Wiring />
        </div>
        <Code>{`const harness = new VeilHarness({ dbPath: '.veil/context.db' })
const config: AgentLoopConfig = {
  ...baseConfig,
  ...harness.getHooks(),
}`}</Code>
        <p>
          The model gets twelve tools of its own, so recall and forgetting are things it can ask for rather than
          things that only happen to it.
        </p>
        <ToolChips />
      </>
    ),
  },
  {
    id: 'decay',
    title: 'how memory decays',
    body: (
      <>
        <p>
          Most cache eviction runs a plain age check: old enough, gone. Veil scores memory with FSRS instead, the
          scheduler behind spaced-repetition flashcard apps. Each item holds a stability in days, and retrievability
          falls from it on a power curve, calibrated so an item is still at 0.9 when it reaches its own stability.
        </p>
        <div className="my-12">
          <ForgettingCurves />
        </div>
        <p>
          Recall pushes stability up, and the push is largest for an item recalled when its retrievability had
          already fallen. A memory the agent nearly lost but still needed gets promoted hardest. The same curve runs
          twice with different horizons: stability caps at seven days in the live context window and at a year in the
          durable store.
        </p>
      </>
    ),
  },
  {
    id: 'scoring',
    title: 'scoring without a model',
    body: (
      <>
        <p>
          Deciding what a piece of context is worth never calls the LLM. Five metadata signals combine at fixed
          weights, and the whole thing is arithmetic.
        </p>
        <div className="my-12">
          <Weights />
        </div>
        <p>
          Recency is FSRS retrievability. Frequency is a log-scaled access count. Relevance is Jaccard overlap
          between the item&rsquo;s tags and the current task. Structure asks whether the item points into the code
          graph. Cognitive weight tracks whether the item was in context when things went well or badly. Procedural
          items then get a 1.2 multiplier, anything you loaded by hand gets 1.5, and pinned items take a flat boost.
        </p>
        <p>
          The score comes out the same twice in a row given the same inputs, which a model call cannot promise.
        </p>
      </>
    ),
  },
  {
    id: 'eviction',
    title: 'eviction',
    body: (
      <>
        <p>
          Eviction runs in three stages, and each one has a real predicate rather than a budget someone guessed.
        </p>
        <div className="my-12">
          <Cascade />
        </div>
        <p>
          The threshold that decides what counts as low enough moves on its own, borrowing the AIMD shape from TCP
          congestion control. Nobody sets an eviction budget by hand; the threshold finds its own level from how the
          session is going.
        </p>
        <div className="my-12">
          <AimdTrack />
        </div>
      </>
    ),
  },
  {
    id: 'turns',
    title: 'the conversation forgets too',
    body: (
      <>
        <p>
          Turns get the same treatment as context items. The last twelve are protected outright. Older ones score by
          what kind of turn they were, and a turn the current one still refers to gets rescued: cosine similarity
          above 0.7 against a recent turn cuts its eviction score.
        </p>
        <div className="my-12">
          <Spec title="turn weights · higher goes first" rows={TURN_TYPES} />
        </div>
        <p>
          Corrections and intent sit at zero. The codebase treats being told it was wrong as something you never say
          twice.
        </p>
      </>
    ),
  },
  {
    id: 'failure-memory',
    title: 'failed attempts get remembered',
    body: (
      <>
        <p>
          Veil keeps a record of every attempt against a goal: what the agent did, the target, the outcome, and a
          normalised fingerprint of the error. That fingerprint lets the same failure get recognised as the same
          failure even when the message text drifts.
        </p>
        <div className="my-12">
          <Ledger />
        </div>
        <p>
          A convergence monitor watches the record and escalates in levels. Progress counts as a pass, a partial, a
          different error pattern, or a different file touched. Anything else is the agent going in circles.
        </p>
        <div className="my-12">
          <Spec title="convergence monitor" rows={ESCALATION} />
        </div>
        <div className="my-12">
          <Verdict />
        </div>
      </>
    ),
  },
  {
    id: 'storage',
    title: 'nothing is deleted',
    body: (
      <>
        <p>
          Evicted context is demoted, not dropped. It moves out of the prompt into the warm cache at{' '}
          <code>.veil/context.db</code>, and out of there into cold storage, which hands back a pointer the agent can
          follow. The durable store underneath is an event log: the tape is the truth and everything else is derived
          from it.
        </p>
        <div className="my-12">
          <Spec title="durable store · schema v2" rows={STORE} />
        </div>
        <p>
          Contradictions are not resolved quietly. Two beliefs that disagree are stored with their full provenance,
          down to the tool call and the session that produced them, and handed to the model to settle.
        </p>
      </>
    ),
  },
  {
    id: 'the-cat',
    title: 'and there is a cat',
    body: (
      <>
        <p>
          The status bar carries one character of memory state. It is the smallest possible UI for a system whose
          whole job is invisible, and it is the part people notice first.
        </p>
        <div className="my-12">
          <Cat />
        </div>
        <p>
          Evicted context does not vanish silently either. The tool calls it came from go dim in the transcript, so
          you watch the agent forget instead of finding out later.
        </p>
      </>
    ),
  },
  {
    id: 'what-it-is-made-of',
    title: 'what it is made of',
    body: (
      <>
        <p>What that adds up to, at the version currently published:</p>
        <dl className="not-prose my-8 grid grid-cols-2 gap-px bg-bone/[0.08] sm:grid-cols-4">
          {STATS.map(([v, k]) => (
            <div key={k} className="bg-charcoal px-4 py-5">
              <dd className="font-display text-3xl font-black tabular-nums leading-none text-bone">{v}</dd>
              <dt className="mt-2.5 font-mono text-[11px] uppercase leading-snug tracking-[0.16em] text-bone/55">
                {k}
              </dt>
            </div>
          ))}
        </dl>
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-bone/40">
          v0.2.0 · mit · node ≥ 22.19 · typescript · sqlite-vec · forked from pi-mono
        </p>
      </>
    ),
  },
]

export default function Veil({ p, c }: LayoutProps) {
  const scope = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLElement>(null)
  const lens = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [heroDecay, setHeroDecay] = useState(0)
  const still = prefersReducedMotion()

  useEffect(() => {
    if (still || !scope.current) return
    const ctx = gsap.context(() => {
      const secs = gsap.utils.toArray<HTMLElement>('[data-sec]', scope.current)
      gsap.set(secs, { opacity: 0, y: 24 })
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            io.unobserve(e.target)
            gsap.to(e.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
            const stamp = e.target.querySelector('[data-stamp]')
            if (stamp) {
              gsap.fromTo(
                stamp,
                { scale: 1.6, rotate: -14, opacity: 0 },
                { scale: 1, rotate: -2.5, opacity: 1, duration: 0.45, ease: 'back.out(2)', delay: 0.35 },
              )
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
      )
      secs.forEach((s) => io.observe(s))
      return () => io.disconnect()
    }, scope)
    return () => ctx.revert()
  }, [c, still])

  // the rails forget as the reader descends; the hero wall forgets as it leaves
  useEffect(() => {
    if (still || !scope.current || !hero.current) return
    const page = ScrollTrigger.create({
      trigger: scope.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const q = Math.round(self.progress * 24) / 24
        setProgress((v) => (v === q ? v : q))
      },
    })
    const band = ScrollTrigger.create({
      trigger: hero.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        const q = Math.round(self.progress * 20) / 20
        setHeroDecay((v) => (v === q ? v : q))
      },
    })
    return () => {
      page.kill()
      band.kill()
    }
  }, [still])

  // recall lens: the disc follows the pointer through CSS vars, so moving it
  // never re-renders the hero's several hundred word spans
  useEffect(() => {
    const el = lens.current
    const band = hero.current
    if (!el || !band || still || matchMedia('(pointer: coarse)').matches) return
    let frame = 0
    const move = (e: PointerEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const r = band.getBoundingClientRect()
        el.style.setProperty('--lx', `${e.clientX - r.left}px`)
        el.style.setProperty('--ly', `${e.clientY - r.top}px`)
        el.style.opacity = '1'
      })
    }
    const leave = () => {
      el.style.opacity = '0'
    }
    band.addEventListener('pointermove', move)
    band.addEventListener('pointerleave', leave)
    return () => {
      band.removeEventListener('pointermove', move)
      band.removeEventListener('pointerleave', leave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [still])

  return (
    <main className="relative bg-charcoal text-bone" ref={scope}>
      <Rail side="left" progress={progress} show={Math.min(1, heroDecay * 2.5)} />
      <Rail side="right" progress={progress} show={Math.min(1, heroDecay * 2.5)} />

      <section ref={hero} className="relative min-h-[94vh] overflow-hidden">
        {/* an earlier session, erasing as the hero scrolls away; what stays
            behind reads, top to bottom, as a sentence of its own */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none px-6 pt-28 font-mono text-[12px] leading-[2.6] text-bone/[0.22] sm:text-[13.5px]"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 3%, black 16%, black 74%, transparent 96%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 3%, black 16%, black 74%, transparent 96%)',
          }}
        >
          <Wall decay={(i) => Math.min(1, 0.14 + heroDecay * 1.05 + (i % 5) * 0.04)} />
        </div>

        {/* the same wall intact, revealed only inside a disc that tracks the
            pointer: what the page forgot comes back where the reader looks */}
        <div
          aria-hidden
          ref={lens}
          className="pointer-events-none absolute inset-0 hidden select-none px-6 pt-28 font-mono text-[12px] leading-[2.6] text-bone/70 opacity-0 transition-opacity duration-500 lg:block sm:text-[13.5px]"
          style={{
            maskImage: 'radial-gradient(circle 150px at var(--lx, -999px) var(--ly, -999px), black 0%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(circle 150px at var(--lx, -999px) var(--ly, -999px), black 0%, transparent 72%)',
          }}
        >
          <Wall decay={() => 0} />
        </div>

        {/* the title reads over the wall only because this clears a hole in it */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(62% 52% at 30% 58%, var(--veil-scrim) 0%, var(--veil-scrim) 46%, transparent 100%)',
            ['--veil-scrim' as string]: 'color-mix(in srgb, var(--color-charcoal) 94%, transparent)',
          }}
        />

        <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-36 lg:pt-44">
          <TLink
            to="/portfolio"
            aria-label="Back to portfolio"
            title="Back to portfolio"
            className="group inline-flex h-9 w-9 items-center justify-center rounded border border-bone/15 bg-charcoal/80 text-bone/50 transition-colors hover:border-gold hover:text-gold"
          >
            <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
          </TLink>

          <h1 className="mt-12 flex items-baseline gap-4 font-display text-6xl font-black text-bone md:text-8xl">
            Veil
            {p.jp && <span className="font-display text-3xl font-normal text-bone/20">{p.jp}</span>}
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-relaxed text-bone/75">{c.lede}</p>

          <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.2em] text-bone/35">{p.tech.join(' · ')}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {p.links.map((l) => {
              const Icon = iconFor(l.href)
              return (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded border border-gold bg-gold/10 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-charcoal"
                >
                  <Icon className="h-4 w-4" /> {l.label}
                </a>
              )
            })}
          </div>

          <p className="mt-10 hidden font-mono text-[11px] uppercase tracking-[0.22em] text-bone/30 lg:block">
            move the cursor over the page it forgot
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} data-sec className="scroll-mt-32 pt-10 first:pt-4">
            <div className={PROSE}>{s.body}</div>
          </section>
        ))}

        <footer data-sec className="mb-24 mt-20 flex items-center justify-between border-t border-bone/10 pt-10">
          <span aria-hidden className="select-none font-display text-3xl text-bone/10">
            {p.jp}
          </span>
          <TLink
            to="/portfolio"
            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-bone/50 transition-colors hover:text-gold"
          >
            back to portfolio
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </TLink>
        </footer>
      </div>
    </main>
  )
}
