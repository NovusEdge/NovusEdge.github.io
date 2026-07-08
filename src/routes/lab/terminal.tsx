import { useEffect, useRef, useState } from 'react'
import { Meta } from '../../lib/meta'
import { LabNav } from './nav'
import { DOMAINS, STACK, LANGS, LANG_TOTAL } from '../stack/data'

// each stack group as a manifest section; commands read straight off the data
const GROUPS = Object.fromEntries(STACK.map((g) => [g.label.split(' ')[0], g])) as Record<string, (typeof STACK)[number]>
const REPO_TOTAL = LANG_TOTAL

type Line = { text: string; tone?: 'ok' | 'gold' | 'dim' | 'err' }

const BOOT: Line[] = [
  { text: 'novusedge@arch:~$ ./stack --init', tone: 'dim' },
  { text: '[  ok  ] loading identity: Aliasgar Khimani', tone: 'ok' },
  { text: `[  ok  ] mounting ${REPO_TOTAL} repositories`, tone: 'ok' },
  { text: '[  ok  ] focus modules: offsec, epistemics, privacy-hw, chaos', tone: 'ok' },
  { text: '[  ok  ] host: arch linux (riced, obviously)', tone: 'ok' },
  { text: '', tone: 'dim' },
  { text: "welcome. type `help` and hit enter.", tone: 'gold' },
]

function bar(n: number, total: number, width = 14) {
  const f = Math.round((n / total) * width)
  return '[' + '█'.repeat(f) + '░'.repeat(width - f) + ']'
}

function run(cmd: string): Line[] {
  const [c, ...rest] = cmd.trim().split(/\s+/)
  const arg = rest.join(' ').toLowerCase()
  switch (c.toLowerCase()) {
    case '':
      return []
    case 'help':
      return [
        { text: 'commands:', tone: 'gold' },
        { text: '  ls / stack          list stack groups' },
        { text: '  cat <group>         show a group (langs, systems, web, ai, hardware)' },
        { text: '  focus               specialization domains' },
        { text: '  langs               repo language distribution' },
        { text: '  whoami              the short version' },
        { text: '  clear               wipe the screen' },
      ]
    case 'ls':
    case 'stack':
      return [
        { text: 'stack groups:', tone: 'gold' },
        ...STACK.map((g) => ({ text: `  ${g.label.padEnd(16)} ${g.jp}  (${g.items.length})` })),
        { text: 'run `cat <group>` for contents', tone: 'dim' },
      ]
    case 'cat': {
      const key = arg.split(' ')[0]
      const g = GROUPS[key] || STACK.find((s) => s.label.startsWith(key))
      if (!g) return [{ text: `cat: ${arg}: no such group. try \`ls\``, tone: 'err' }]
      return [
        { text: `# ${g.label} ${g.jp}`, tone: 'gold' },
        ...g.items.map((t) => ({ text: `  • ${t.name}` })),
      ]
    }
    case 'focus':
      return DOMAINS.flatMap((d) => [
        { text: `${d.jp}  ${d.title}`, tone: 'gold' as const },
        { text: `    ${d.blurb}`, tone: 'dim' as const },
      ])
    case 'langs':
      return [
        { text: 'repos by language:', tone: 'gold' },
        ...LANGS.map((l) => ({ text: `  ${l.name.padEnd(11)} ${bar(l.n, LANG_TOTAL)} ${l.n}` })),
      ]
    case 'whoami':
      return [
        { text: 'intelligence architect. i build cognitive infrastructure for agents.', tone: 'gold' },
        { text: 'breaking things to see how they work, teaching machines what they know.', tone: 'dim' },
      ]
    case 'clear':
      return [{ text: '__clear__' }]
    case 'sudo':
      return [{ text: 'nice try.', tone: 'err' }]
    default:
      return [{ text: `command not found: ${c}. try \`help\``, tone: 'err' }]
  }
}

const toneClass: Record<NonNullable<Line['tone']>, string> = {
  ok: 'text-emerald-400/80',
  gold: 'text-gold',
  dim: 'text-bone/45',
  err: 'text-red-400/80',
}

export default function LabTerminal() {
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [hist, setHist] = useState<string[]>([])
  const [hi, setHi] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // boot sequence reveals line by line
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setLines((l) => [...l, BOOT[i]])
      i++
      if (i >= BOOT.length) clearInterval(id)
    }, 320)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const submit = () => {
    const cmd = input
    const echo: Line = { text: `novusedge@arch:~$ ${cmd}`, tone: 'dim' }
    const out = run(cmd)
    if (out[0]?.text === '__clear__') {
      setLines([])
    } else {
      setLines((l) => [...l, echo, ...out])
    }
    if (cmd.trim()) setHist((h) => [cmd, ...h])
    setHi(-1)
    setInput('')
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit()
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHi((p) => {
        const n = Math.min(p + 1, hist.length - 1)
        if (hist[n] !== undefined) setInput(hist[n])
        return n
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHi((p) => {
        const n = Math.max(p - 1, -1)
        setInput(n === -1 ? '' : hist[n])
        return n
      })
    }
  }

  return (
    <>
      <Meta title="Lab · Terminal" description="Stack page as an interactive shell." />
      <LabNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-28" onClick={() => inputRef.current?.focus()}>
        <div className="overflow-hidden rounded-xl border border-gold/20 bg-[#0e0e0e] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-2 font-mono text-[11px] text-bone/40">novusedge@arch — stack.sh</span>
          </div>
          <div ref={scrollRef} className="h-[62vh] overflow-y-auto p-5 font-mono text-[13px] leading-relaxed">
            {lines.map((l, i) => (
              <div key={i} className={`whitespace-pre-wrap ${l.tone ? toneClass[l.tone] : 'text-bone/85'}`}>
                {l.text || ' '}
              </div>
            ))}
            <div className="flex items-center text-bone/85">
              <span className="text-gold">novusedge@arch:~$</span>
              <input
                ref={inputRef}
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                spellCheck={false}
                className="ml-2 flex-1 bg-transparent font-mono text-[13px] text-bone/85 caret-gold outline-none"
                aria-label="terminal input"
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-center font-mono text-[11px] text-charcoal/40 dark:text-bone/40">
          try: help · ls · cat ai · focus · langs · whoami
        </p>
      </main>
    </>
  )
}
