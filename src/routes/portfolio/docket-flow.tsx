import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../lib/motion'
import { LockKeyhole, RotateCcw, Ticket, Hotel, MapPin, CalendarDays, FileCheck2, FileQuestion, Wallet, Users, Clock } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

type Wire = { id: string; path: string }

export function DecisionFlow({ tracked, consequences }: { tracked: boolean; consequences: string[][] }) {
  const board = useRef<HTMLDivElement>(null)
  const [wires, setWires] = useState<Wire[]>([])
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(prefersReducedMotion())
    sync()
    query.addEventListener('change', sync)
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => { query.removeEventListener('change', sync); observer.disconnect() }
  }, [])

  useEffect(() => {
    const root = board.current
    if (!root) return
    const measure = () => {
      const bounds = root.getBoundingClientRect()
      const point = (name: string, bottom: boolean) => {
        const element = root.querySelector<HTMLElement>(`[data-node="${name}"]`)!
        const rect = element.getBoundingClientRect()
        return { x: rect.left + rect.width / 2 - bounds.left, y: (bottom ? rect.bottom : rect.top) - bounds.top }
      }
      const connect = (id: string, from: string, to: string): Wire => {
        const a = point(from, true)
        const b = point(to, false)
        const middle = a.y + (b.y - a.y) * 0.52
        return { id, path: `M${a.x},${a.y} C${a.x},${middle} ${b.x},${middle} ${b.x},${b.y}` }
      }
      const next = [connect('handoff', 'premise', 'choice'), ...[0, 1, 2].map(i => connect(`branch-${i}`, 'choice', `leaf-${i}`))]
      setWires(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    root.querySelectorAll<HTMLElement>('[data-node]').forEach(node => observer.observe(node))
    measure()
    return () => observer.disconnect()
  }, [tracked])

  useGSAP(() => {
    const root = board.current
    if (!root || !wires.length) return
    const paths = [...root.querySelectorAll<SVGPathElement>('.dk-wire-active')]
    const packets = [...root.querySelectorAll<SVGCircleElement>('.dk-wire-packet')]
    const leaves = [...root.querySelectorAll<HTMLElement>('.dk-flow-module')]
    const status = root.querySelector<HTMLElement>('.dk-flow-status')!
    const choice = root.querySelector<HTMLElement>('[data-node="choice"]')!
    const finish = tracked ? 'Four decisions. Three agents working from the same plan.' : 'The agents find options. The options no longer fit the plan.'
    status.textContent = finish
    if (reduced || prefersReducedMotion()) {
      if (!tracked) {
        const length = paths[0].getTotalLength()
        gsap.set(paths[0], { strokeDasharray: `${length} ${length}`, strokeDashoffset: length * 0.65 })
      }
      return
    }

    const flow = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top 78%', once: true },
      onComplete: () => { status.textContent = finish },
    })
    const travel = (index: number, start: number, duration: number, reach = 1) => {
      const path = paths[index]
      const packet = packets[index]
      const length = path.getTotalLength()
      const position = { progress: 0 }
      flow.set(path, { strokeDasharray: `${length} ${length}`, strokeDashoffset: length }, 0)
      flow.set(packet, { opacity: 0 }, 0)
      flow.set(packet, { opacity: 1 }, start)
      flow.to(path, { strokeDashoffset: length * (1 - reach), duration, ease: 'none' }, start)
      flow.to(position, { progress: reach, duration, ease: 'none', onUpdate: () => {
        const p = path.getPointAtLength(position.progress * length)
        packet.setAttribute('cx', String(p.x))
        packet.setAttribute('cy', String(p.y))
      } }, start)
      flow.to(packet, { opacity: 0, duration: 0.18 }, start + duration)
    }
    flow.set(leaves, { opacity: 0.32 }, 0)
    flow.set(choice, { opacity: 0.4 }, 0)
    flow.fromTo('.dk-trip-rule svg', { opacity: 0.35 }, { opacity: 1, duration: 0.4, stagger: 0.1 }, 0)
    flow.call(() => { status.textContent = 'Four decisions need to reach the next agents.' }, [], 0)
    travel(0, 0.2, 0.95, tracked ? 1 : 0.35)
    flow.call(() => { status.textContent = tracked ? 'The agents receive the decisions and their reasons.' : 'The agents only get told to find a good deal.' }, [], 1.2)
    flow.to(choice, { opacity: 1, duration: 0.35 }, 1.3)
    paths.slice(1).forEach((_, index) => {
      const start = 1.8 + index * 0.22
      travel(index + 1, start, 0.75)
      flow.to(leaves[index], { opacity: 1, duration: 0.3 }, start + 0.65)
    })
  }, { scope: board, dependencies: [wires, tracked, reduced], revertOnUpdate: true })

  return (
    <div className={`dk-flow-board ${tracked ? 'dk-flow-recorded' : 'dk-flow-lost'}`} ref={board}>
      <svg className="dk-flow-wires" aria-hidden="true">
        {wires.map(wire => (
          <g key={wire.id} className={wire.id === 'handoff' ? 'dk-wire-handoff' : ''}>
            <path className="dk-wire-base" d={wire.path} />
            <path className="dk-wire-active" d={wire.path} />
            <circle className="dk-wire-packet" r="4" />
          </g>
        ))}
      </svg>
      <div className="dk-trip-rules" data-node="premise" role="group" aria-label="Four decisions for the team trip">
        <div className="dk-trip-rule"><CalendarDays aria-hidden="true" /><h3>Refundable only</h3><p>Dates may change</p></div>
        <div className="dk-trip-rule"><Wallet aria-hidden="true" /><h3>€3,000 total</h3><p>Whole-trip budget</p></div>
        <div className="dk-trip-rule"><Users aria-hidden="true" /><h3>Six travelers</h3><p>Include everyone</p></div>
        <div className="dk-trip-rule"><Clock aria-hidden="true" /><h3>Arrive by 18:00</h3><p>Dinner together</p></div>
      </div>
      <div className="dk-flow-transfer"><span>{tracked ? <FileCheck2 aria-hidden="true" /> : <FileQuestion aria-hidden="true" />}{tracked ? 'Decisions carried forward' : 'Decisions lost'}</span></div>
      <div className="dk-flow-choice" data-node="choice">
        {tracked ? <RotateCcw aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
        <h3>{tracked ? 'Follow the plan' : 'Find a good deal'}</h3>
      </div>
      <div className="dk-flow-modules" aria-live="polite">
        {consequences.map(([area, title, detail], index) => (
          <div className="dk-flow-module" data-node={`leaf-${index}`} key={area}>
            {index === 0 ? <Ticket aria-hidden="true" /> : index === 1 ? <Hotel aria-hidden="true" /> : <MapPin aria-hidden="true" />}
            <h4>{title}</h4>
            <span className="dk-flow-outcome">{tracked ? ['Before dinner', 'Dates can change', 'Budget fits'][index] : ['Arrives too late', 'Dates locked in', 'Trip over budget'][index]}</span>
            <p className="sr-only">{detail}</p>
          </div>
        ))}
      </div>
      <p className="dk-flow-status" aria-live="off">{tracked ? 'Four decisions. Three agents working from the same plan.' : 'The agents find options. The options no longer fit the plan.'}</p>
    </div>
  )
}
