import type { ReactNode } from 'react'
import { RosetteDefs, RosetteRef } from './guilloche'

/* Plates for the money-mesh page. Every field name, constant and predicate is
   read from the repo. Laid out in DOM rather than SVG so labels stay readable
   at any width, and inked green on the page's paper ground. */

const RULE = 'border-[#1f4536]/25'
const HAIR = 'divide-[#1f4536]/15'

function Frame({ title, ref_, children, foot }: { title: string; ref_: string; children: ReactNode; foot?: ReactNode }) {
  return (
    <figure className={`not-prose border ${RULE}`}>
      <figcaption
        className={`flex flex-wrap items-center justify-between gap-3 border-b ${RULE} px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#1f4536]/80`}
      >
        <span>{title}</span>
        <span className="text-[#1f4536]/80">{ref_}</span>
      </figcaption>
      {children}
      {foot && (
        <div className={`border-t ${RULE} px-5 py-4 text-[14px] leading-relaxed text-[#1f4536]/80`}>{foot}</div>
      )}
    </figure>
  )
}

/* The mesh as a sheet of issued notes. One node exists; the rest are drawn as
   unissued plates, because a floor of earning agents is the design and not the
   current state. Method arms come from the repo's method space. */
const ARMS = [
  'metered api',
  'micro-saas',
  'digital product',
  'forecasting comp',
  'bounty',
  'kaggle arm',
  'affiliate content',
  'programmatic seo',
  'api resale',
  'retail arbitrage',
  'niche tool',
  'slop service',
]

export function Spread() {
  return (
    <Frame
      title="the sheet · one issued, eleven unissued"
      ref_="north-star · method space"
      foot={
        <>
          The bandit is the filter. No arm is blessed in advance, and the one that survives is the one real receipts
          keep alive. Today the sheet holds a single issued note and no receipts, so nothing has been selected for
          yet.
        </>
      }
    >
      <RosetteDefs />
      <div className="grid gap-px bg-[#1f4536]/15 sm:grid-cols-2 lg:grid-cols-3">
        {ARMS.map((arm, i) => {
          // an unissued plate reads by its dashes and its tag, not by being
          // faded: dimming the card put its text under the contrast floor
          const issued = i === 0
          return (
            <div
              key={arm}
              className={`relative overflow-hidden px-4 py-4 ${issued ? 'bg-[#e9e4d4]' : 'bg-[#dfd9c6]'}`}
            >
              <RosetteRef className="pointer-events-none absolute -right-6 -top-5 h-[86px] w-[86px] opacity-60" />
              <div className="relative flex items-baseline justify-between gap-3">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#1f4536]/80">
                  MM-{String(i + 1).padStart(4, '0')}
                </span>
                <span
                  className={`border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] ${
                    issued ? 'border-[#2a6b46] text-[#2a6b46]' : 'border-dashed border-[#1f4536]/40 text-[#1f4536]/80'
                  }`}
                >
                  {issued ? 'issued' : 'unissued'}
                </span>
              </div>
              <p className="relative mt-2.5 font-mono text-[13px] text-[#1f4536]">{arm}</p>
              <dl className="relative mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11.5px] tabular-nums">
                <div>
                  <dt className="inline text-[#1f4536]/80">slice </dt>
                  <dd className="inline text-[#1f4536]/80">{issued ? '500c' : '—'}</dd>
                </div>
                <div>
                  <dt className="inline text-[#1f4536]/80">trial </dt>
                  <dd className="inline text-[#1f4536]/80">{issued ? '25c' : '—'}</dd>
                </div>
                <div>
                  <dt className="inline text-[#1f4536]/80">receipts </dt>
                  <dd className="inline text-[#2a6b46]">$0.00</dd>
                </div>
              </dl>
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

// the fixed pipeline a tick runs before any tool is reachable
const TICK = [
  ['settle_due', 'collect what the receipts say landed'],
  ['redecide_closed', 'keep or kill the arms that closed'],
  ['prune', 'drop what is not worth carrying'],
  ['launch_new', 'open an experiment, idempotency keyed to the launch'],
  ['execute', 'generate code and run it in the jail'],
  ['publish', 'put the thing somewhere a person could find it'],
  ['heartbeat', 'write the file the kill switch watches'],
]

export function Tick() {
  return (
    <Frame
      title="one tick"
      ref_="node/loop/agent.py · turn.py"
      foot={
        <>
          Settlement runs in Python before the agent gets a turn, and no tool reaches it. A model that can see its own
          scoring function games it, so the scoring happens where the model is not.
        </>
      }
    >
      <ol className={`divide-y ${HAIR}`}>
        {TICK.map(([step, what], i) => (
          <li key={step} className="grid grid-cols-[2rem_11rem_1fr] items-baseline gap-x-4 px-5 py-3">
            <span className="font-mono text-[11.5px] tabular-nums text-[#2a6b46]">{String(i + 1).padStart(2, '0')}</span>
            <span className="font-mono text-[13px] text-[#1f4536]">{step}</span>
            <span className="text-[14px] leading-snug text-[#1f4536]/80">{what}</span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

const PROCS: [string, string, string][] = [
  ['supervisor.py', 'the kill switch', 'spawns the node in its own process group and kills the group, so nothing survives the stop'],
  ['node', 'the agent loop', 'holds the ledger read-only, so a stray write fails in sqlite rather than at a policy check'],
  ['gateway', 'the enforcement point', 'owns the ledger, the policy engine, the harm judge and the vault; the node reaches it over a socket'],
]

export function Processes() {
  return (
    <Frame
      title="three processes"
      ref_="supervisor.py · gateway/server.py"
      foot={<>Every path into enforcement crosses a process boundary. Sealing that boundary is a later stage.</>}
    >
      <div className="grid gap-px bg-[#1f4536]/15 md:grid-cols-3">
        {PROCS.map(([name, role, what]) => (
          <div key={name} className="bg-[#e9e4d4] px-5 py-5">
            <p className="font-mono text-[13px] text-[#2a6b46]">{name}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#1f4536]/80">{role}</p>
            <p className="mt-3 text-[14px] leading-snug text-[#1f4536]/80">{what}</p>
          </div>
        ))}
      </div>
    </Frame>
  )
}

const OUTCOMES: [string, string, string, boolean][] = [
  ['allow', 'a permit matched, no forbid did', 'the action runs', false],
  ['deny', 'a forbid matched', 'refused, and the audit row is written', false],
  ['escalate', 'deny with an empty determining set', 'queued for the operator, 24 hour ttl', true],
]

export function Trichotomy() {
  return (
    <Frame
      title="one request, three outcomes"
      ref_="policies.cedar · gate.py"
      foot={
        <>
          Forbid overrides permit, so the keystones sit above every grant. The third outcome is the useful one: a
          request no policy has an opinion about goes to a person.
        </>
      }
    >
      <div className="grid gap-px bg-[#1f4536]/15 md:grid-cols-3">
        {OUTCOMES.map(([name, when, then, mark]) => (
          <div key={name} className="bg-[#e9e4d4] px-5 py-5">
            <span
              className={`inline-block border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ${
                mark ? 'border-[#2a6b46] text-[#2a6b46]' : 'border-[#1f4536]/40 text-[#1f4536]'
              }`}
            >
              {name}
            </span>
            <p className="mt-4 font-mono text-[12.5px] leading-snug text-[#1f4536]/80">{when}</p>
            <p className="mt-2 text-[14px] leading-snug text-[#1f4536]/80">{then}</p>
          </div>
        ))}
      </div>
    </Frame>
  )
}

type Origin = { key: string; label: string; note: string; fields: string[]; strong?: boolean; weak?: boolean }
const ORIGINS: Origin[] = [
  {
    key: 'ledger',
    label: 'ledger',
    note: 'summed from append-only rows the node cannot write',
    fields: ['spent_lifetime', 'net_earnings', 'recipient_is_owned_rail', 'template_allowlisted', 'amount_provenance_clean'],
    strong: true,
  },
  {
    key: 'manifest',
    label: 'manifest',
    note: 'seeded by the operator, resolved from the node id at the gateway',
    fields: ['budget_slice', 'capabilities', 'depth', 'substrate'],
  },
  {
    key: 'derived',
    label: 'derived in the policy point',
    note: 'computed from the action name, never accepted from the caller',
    fields: ['capability'],
  },
  {
    key: 'gateway',
    label: 'gateway',
    note: 'classified out of process, so the node cannot grade itself',
    fields: ['harm_class', 'tainted'],
  },
  {
    key: 'caller',
    label: 'from the caller',
    note: 'untrusted; each one is an operand and never a limit',
    fields: ['amount', 'recipient', 'session_id', 'idempotency_key', 'experiment_id'],
    weak: true,
  },
]

export function TrustMap() {
  return (
    <Frame
      title="who wrote this number"
      ref_="gate.py · build_context"
      foot={
        <>
          Sixteen fields reach the policy engine. Five come from the node, and not one of those five is ever a limit.
        </>
      }
    >
      <dl className={`divide-y ${HAIR}`}>
        {ORIGINS.map((o) => (
          <div key={o.key} className="grid gap-x-6 gap-y-3 px-5 py-5 lg:grid-cols-[14rem_1fr]">
            <dt>
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#1f4536]/85">{o.label}</p>
              <p className="mt-1.5 max-w-[26ch] text-[13.5px] leading-snug text-[#1f4536]/80">{o.note}</p>
            </dt>
            <dd className="flex flex-wrap gap-2 self-start">
              {o.fields.map((f) => (
                <span
                  key={f}
                  className={`border px-2.5 py-1 font-mono text-[12.5px] ${
                    o.strong
                      ? 'border-[#2a6b46] text-[#2a6b46]'
                      : o.weak
                        ? 'border-dashed border-[#1f4536]/30 text-[#1f4536]/80'
                        : 'border-[#1f4536]/35 text-[#1f4536]/85'
                  }`}
                >
                  {f}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Frame>
  )
}

const GAUNTLET: [string, string][] = [
  ['a charge lands in stripe', 'polled with no cursor, because a refund does not change a charge timestamp'],
  ['metadata carries an experiment_id', 'without it the charge is worth nothing, and it is never attributed to the only open experiment'],
  ['the recipient is a seeded owned rail', 'a rail nobody seeded drops out of the join'],
  ['status is succeeded', 'a later refund flips it back and the revenue leaves again'],
  ['fees come off', 'break-even is measured on net, never on gross'],
]

export function Gauntlet() {
  return (
    <Frame
      title="what counts as revenue"
      ref_="gateway/receipts_stripe.py"
      foot={<>Every branch that fails lands on zero. Nothing in the loop can report its own earnings.</>}
    >
      <ol className={`divide-y ${HAIR}`}>
        {GAUNTLET.map(([step, why], i) => (
          <li key={step} className="grid gap-x-5 gap-y-1 px-5 py-4 sm:grid-cols-[1.6rem_1fr_auto]">
            <span className="font-mono text-[12px] tabular-nums text-[#2a6b46]">{i + 1}</span>
            <div>
              <p className="font-mono text-[13px] text-[#1f4536]">{step}</p>
              <p className="mt-1 max-w-[58ch] text-[14px] leading-snug text-[#1f4536]/80">{why}</p>
            </div>
            <span className="self-start font-mono text-[11px] uppercase tracking-[0.18em] text-[#1f4536]/80 sm:text-right">
              else $0
            </span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

const ESCAPE: [string, string[]][] = [
  ['before', ['the child ran in the working directory it was launched from', 'the repo, the keys and the database were all readable', 'it read its own turn file, the harm judge and the receipt poller']],
  ['after', ['a tmpfs root under bwrap', 'read-only system files, one bound workspace', 'its own network namespace', 'a single socket out, and it dies with its parent']],
]

export function Escape() {
  return (
    <Frame
      title="the tick that read its own harness"
      ref_="gateway/sandbox.py"
      foot={
        <>
          A test asserted that no tool reaches the settlement spine. The filesystem walked around the test rather than
          through it, and the turn spent its whole request budget reading source and earned nothing.
        </>
      }
    >
      <div className="grid gap-px bg-[#1f4536]/15 md:grid-cols-2">
        {ESCAPE.map(([phase, items]) => (
          <div key={phase} className="bg-[#e9e4d4] px-5 py-5">
            <p
              className={`inline-block border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ${
                phase === 'before' ? 'border-[#1f4536]/35 text-[#1f4536]/80' : 'border-[#2a6b46] text-[#2a6b46]'
              }`}
            >
              {phase}
            </p>
            <ul className="mt-4 space-y-2">
              {items.map((t) => (
                <li key={t} className="font-mono text-[12.5px] leading-snug text-[#1f4536]/80">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Frame>
  )
}
