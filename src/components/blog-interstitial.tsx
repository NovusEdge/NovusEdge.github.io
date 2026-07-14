import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { isMobile } from '../lib/motion'

type Interstitial = {
  id: string
  src: string
  triggerId: string // heading ID that triggers appearance
  exitTriggerId?: string // heading ID that triggers slide-out
}

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

type Phase = 'hidden' | 'center' | 'left'

function PaperInterstitial({ src, phase, onDismiss }: { src: string; phase: Phase; onDismiss?: () => void }) {
  const style: CSSProperties = {
    position: 'fixed',
    top: '50%',
    zIndex: 4,
    width: phase === 'left' ? 'min(40vw, 280px)' : 'min(80vw, 500px)',
    pointerEvents: 'none',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(phase === 'hidden' && {
      left: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: 0,
    }),
    ...(phase === 'center' && {
      left: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: 1,
    }),
    ...(phase === 'left' && {
      left: '2rem',
      transform: 'translateY(-50%)',
      opacity: 0.7,
    }),
  }

  const clickable = phase === 'center' && onDismiss

  return (
    <div
      style={{ ...style, cursor: clickable ? 'pointer' : 'default', pointerEvents: clickable ? 'auto' : 'none' }}
      aria-hidden
      onClick={clickable ? onDismiss : undefined}
      title={clickable ? 'Click to dismiss' : undefined}
    >
      <div className="relative overflow-hidden rounded-lg shadow-2xl">
        <img src={src} alt="" className="w-full" />
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      </div>
    </div>
  )
}

export function BlogInterstitials({ interstitials }: { interstitials: Interstitial[] }) {
  const [phases, setPhases] = useState<Record<string, Phase>>({})
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({})
  const mobile = useRef(isMobile()).current

  useEffect(() => {
    if (mobile) return

    const checkPhase = () => {
      for (const i of interstitials) {
        // ponytail: skip scroll logic if manually dismissed
        if (dismissed[i.id]) continue

        const trigger = document.getElementById(i.triggerId)
        const exitTrigger = i.exitTriggerId ? document.getElementById(i.exitTriggerId) : null

        if (!trigger) continue

        const triggerRect = trigger.getBoundingClientRect()
        const exitRect = exitTrigger?.getBoundingClientRect()

        const entered = triggerRect.top < window.innerHeight * 0.4
        const exited = exitRect ? exitRect.top < window.innerHeight * 0.5 : false

        let phase: Phase = 'hidden'
        if (entered && !exited) phase = 'center'
        else if (entered && exited) phase = 'left'

        setPhases((prev) => ({ ...prev, [i.id]: phase }))
      }
    }

    window.addEventListener('scroll', checkPhase, { passive: true })
    checkPhase()
    return () => window.removeEventListener('scroll', checkPhase)
  }, [interstitials, mobile, dismissed])

  if (mobile) return null

  return (
    <>
      {interstitials.map((i) => (
        <PaperInterstitial
          key={i.id}
          src={i.src}
          phase={dismissed[i.id] ? 'left' : (phases[i.id] || 'hidden')}
          onDismiss={() => setDismissed((prev) => ({ ...prev, [i.id]: true }))}
        />
      ))}
    </>
  )
}
