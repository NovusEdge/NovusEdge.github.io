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
          No arm is blessed in advance. The one that survives is the one receipts keep alive. Today the sheet has one
          issued note and no receipts, so nothing has been selected for yet.
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
  ['settle_due', 'take in what actually landed'],
  ['redecide_closed', 'keep the winners, kill the rest'],
  ['prune', 'drop the dead weight'],
  ['launch_new', 'open a new bet, keyed so it cannot double-fire'],
  ['execute', 'write the code, run it in the jail'],
  ['publish', 'put the product where a buyer can find it'],
  ['heartbeat', 'tell the kill switch it is still alive'],
]

export function Tick() {
  return (
    <Frame
      title="one tick"
      ref_="node/loop/agent.py · turn.py"
      foot={
        <>
          Settlement runs before the agent gets a turn, and no tool reaches it. A model that can see its own scoring
          function games it.
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
  ['supervisor.py', 'the plug', 'owns the node and kills the whole process group. Nothing walks away from the stop.'],
  ['node', 'the earner', 'picks the method, writes the code, spends the money. Reads the books, never writes them.'],
  ['gateway', 'the bank', 'holds the ledger, the policy engine, the judge and the keys. The node knocks on a socket.'],
]

export function Processes() {
  return (
    <Frame
      title="three processes"
      ref_="supervisor.py · gateway/server.py"
      foot={<>Every path into enforcement crosses a process boundary. Sealing it is a later stage.</>}
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
  ['allow', 'a permit matched and nothing forbade it', 'it runs', false],
  ['deny', 'a forbid matched', 'refused, and the audit row gets signed', false],
  ['escalate', 'nothing in the ruleset had an opinion', 'your call, 24 hours to make it', true],
]

export function Trichotomy() {
  return (
    <Frame
      title="one request, three outcomes"
      ref_="policies.cedar · gate.py"
      foot={
        <>
          Forbid overrides permit. The third outcome is the useful one: a request no policy has an opinion about goes
          to a person.
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
      foot={<>Sixteen fields reach the policy engine. Five come from the node, and none of those five is ever a limit.</>}
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
  ['a charge lands in stripe', 'polled without a cursor, since a refund never moves the timestamp a cursor would key on'],
  ['it carries an experiment id', 'no id, no revenue, and it never gets handed to whichever bet happens to be open'],
  ['it paid a rail you seeded', 'anything else falls out of the join'],
  ['it stuck', 'a refund flips the row back and the money leaves again'],
  ['fees come off the top', 'break-even is net. Gross is a story you tell yourself'],
]

export function Gauntlet() {
  return (
    <Frame
      title="what counts as revenue"
      ref_="gateway/receipts_stripe.py"
      foot={<>Every branch that fails lands on zero.</>}
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
          A test asserted that no tool reaches the settlement spine. The filesystem walked around it. The turn spent
          its whole request budget reading source and earned nothing.
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

/* Product-page furniture: the capability triad, the how-it-works steps, the
   spec block, and the availability block that sits where pricing would. */

export function Capabilities() {
  return (
    <div className="max-w-[60ch] space-y-4 text-[17px] leading-relaxed text-[#1f4536]/85">
      <p>
        The pot gets seeded once and never minted again. A node that wants a peer buys it out of its own slice, so the
        fleet can never outgrow the money. Nobody has to sit there watching it.
      </p>
      <p>
        Enforcement runs in another process. The agent reads the books and cannot write them, so a spend it should not
        make dies in sqlite instead of in a check it could talk its way past.
      </p>
      <p>
        Revenue is whatever Stripe says landed, minus fees. The node never grades its own work, and a charge with no
        experiment id on it is worth nothing.
      </p>
    </div>
  )
}

export function HowItWorks() {
  return (
    <div className="max-w-[60ch] space-y-4 text-[17px] leading-relaxed text-[#1f4536]/85">
      <p>
        The operator seeds a budget and a manifest. The node cannot change either. It picks a method, writes the code,
        and runs it in a jail that has one socket out.
      </p>
      <p>
        Every spend, publish, and execute crosses the gateway. Policy compares the amount against a lifetime sum the
        node cannot write. Receipts come from Stripe, matched to an experiment, netted of fees. The arm lives or dies
        on that number.
      </p>
    </div>
  )
}

const SPEC: [string, string][] = [
  ['runtime', 'python 3.12+, uv, single process per node'],
  ['agent', 'pydantic ai over litellm, gemini flash'],
  ['policy', 'cedar, 11 policies, forbid overrides permit'],
  ['state', 'sqlite, 18 tables, append-only audit rows'],
  ['payments', 'stripe charges; live secret keys are refused outright'],
  ['isolation', 'bwrap jail, own network namespace, one unix socket'],
  ['tests', '843 green across policy, node and gateway'],
  ['availability', 'private repository, no package, no install'],
]

export function Spec() {
  return (
    <dl className="grid gap-px bg-[#1f4536]/15 sm:grid-cols-2">
      {SPEC.map(([k, v]) => (
        <div key={k} className="bg-[#e9e4d4] px-5 py-4">
          <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#1f4536]/80">{k}</dt>
          <dd className="mt-1.5 font-mono text-[13.5px] leading-snug text-[#1f4536]">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

const SHIPPED = [
  'the safety floor and the gray-zone gates, green on both policy engines',
  'the out-of-process gateway, the jail and the credential vault',
  'receipt intake, wired to a live Stripe account and verified against real charges',
  'the convergence monitor, the attempt record and the kill switch',
]

const NEXT = [
  'a publishing channel, so what the node builds reaches a buyer',
  'break-even on one arm, which is the gate the whole roadmap hangs on',
  'the spawn path, once one node can pay for the next',
  'pinned placement, which seals the gateway boundary for good',
]

export function Availability() {
  return (
    <div className={`border ${RULE}`}>
      <div className="grid gap-px bg-[#1f4536]/15 md:grid-cols-2">
        <div className="bg-[#e9e4d4] px-6 py-6">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#2a6b46]">running now</h3>
          <ul className="mt-4 space-y-2.5">
            {SHIPPED.map((t) => (
              <li key={t} className="text-[15px] leading-relaxed text-[#1f4536]/80">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#dfd9c6] px-6 py-6">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#1f4536]">next up</h3>
          <ul className="mt-4 space-y-2.5">
            {NEXT.map((t) => (
              <li key={t} className="text-[15px] leading-relaxed text-[#1f4536]/80">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className={`border-t ${RULE} px-6 py-4 font-mono text-[12px] uppercase tracking-[0.16em] text-[#1f4536]/80`}>
        stage three of six · source private for now
      </p>
    </div>
  )
}

/* Unit economics. The burn is measured off live ticks; everything else is
   arithmetic on the shipped defaults, and the header says so. */
const ECON: [string, string, string][] = [
  ['burn', '$14 / month', 'measured per node, flash-tier model, one tick at a time'],
  ['runway', '20 experiments', 'a 500c slice at 25c a trial, before anything has to sell'],
  ['break-even', '1 subscriber', 'one seat at $19 a month clears the burn and the fees'],
  ['second node', '2 subscribers', 'the pot does not grow, so node two comes out of node one'],
]

export function Economics() {
  return (
    <Frame
      title="unit economics · projection"
      ref_="burn measured, the rest is arithmetic"
      foot={
        <>
          Assumes the burn we measured and a $19 seat. The point of the number is how small it is: one customer per
          node clears the bill, and everything past that funds the next node.
        </>
      }
    >
      <dl className={`divide-y ${HAIR}`}>
        {ECON.map(([k, v, note]) => (
          <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-x-5 px-5 py-4 sm:grid-cols-[9rem_10rem_1fr]">
            <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#1f4536]/80">{k}</dt>
            <dd className="font-mono text-[15px] tabular-nums text-[#2a6b46]">{v}</dd>
            <dd className="col-span-2 mt-1 text-[14.5px] leading-snug text-[#1f4536]/80 sm:col-span-1 sm:mt-0">
              {note}
            </dd>
          </div>
        ))}
      </dl>
    </Frame>
  )
}
