import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CRTEffect from 'vault66-crt-effect'
import 'vault66-crt-effect/style.css'
import { isMobile } from '../lib/motion'

type Props = {
  triggerId: string
  exitTriggerId?: string
}

type Phase = 'hidden' | 'center' | 'left'

export function EpistemicBanner({ triggerId, exitTriggerId }: Props) {
  const [phase, setPhase] = useState<Phase>('hidden')
  const [dismissed, setDismissed] = useState(false)
  const mobile = useRef(isMobile()).current

  useEffect(() => {
    if (mobile) return

    const checkPhase = () => {
      if (dismissed) return

      const trigger = document.getElementById(triggerId)
      const exitTrigger = exitTriggerId ? document.getElementById(exitTriggerId) : null

      if (!trigger) return

      const triggerRect = trigger.getBoundingClientRect()
      const exitRect = exitTrigger?.getBoundingClientRect()

      const entered = triggerRect.top < window.innerHeight * 0.4
      const exited = exitRect ? exitRect.top < window.innerHeight * 0.5 : false

      let newPhase: Phase = 'hidden'
      if (entered && !exited) newPhase = 'center'
      else if (entered && exited) newPhase = 'left'

      setPhase(newPhase)
    }

    window.addEventListener('scroll', checkPhase, { passive: true })
    checkPhase()
    return () => window.removeEventListener('scroll', checkPhase)
  }, [triggerId, exitTriggerId, mobile, dismissed])

  if (mobile) return null

  const isCenter = dismissed ? false : phase === 'center'
  const isLeft = dismissed || phase === 'left'
  const isVisible = phase !== 'hidden' || dismissed

  return createPortal(
    <div
      onClick={isCenter ? () => setDismissed(true) : undefined}
      style={{
        position: 'fixed',
        top: '50%',
        zIndex: 40,
        width: isLeft ? 'min(35vw, 260px)' : 'min(70vw, 450px)',
        pointerEvents: isCenter ? 'auto' : 'none',
        cursor: isCenter ? 'pointer' : 'default',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        left: isLeft ? '2rem' : '50%',
        transform: isLeft ? 'translateY(-50%)' : 'translate(-50%, -50%)',
        opacity: isVisible ? (isLeft ? 0.6 : 1) : 0,
      }}
      title={isCenter ? 'Click to dismiss' : undefined}
    >
      <CRTEffect
        theme="green"
        scanlineOpacity={0.25}
        scanlineThickness={2}
        scanlineGap={4}
        enableSweep
        sweepDuration={4}
        sweepStyle="classic"
        enableCurvature
        curvatureIntensity={0.4}
        enableVignette
        vignetteIntensity={0.5}
        enableGlow
        glowColor="rgba(0, 255, 100, 0.2)"
        enableEdgeGlow
        edgeGlowColor="rgba(0, 255, 100, 0.15)"
        enableFlicker
        flickerIntensity="low"
      >
        <div className="relative overflow-hidden rounded">
          <img
            src="/assets/blog/epistemic-banner.gif"
            alt=""
            className="w-full"
            style={{ filter: 'sepia(100%) hue-rotate(70deg) saturate(150%) brightness(0.9)' }}
          />
        </div>
      </CRTEffect>
    </div>,
    document.body
  )
}
