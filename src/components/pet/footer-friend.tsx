import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import footerJson from '../../assets/sprites/footer.json'
import bubbleJson from '../../assets/sprites/bubble.json'
import { CONTACT_LINKS, opensNewTab } from '../../lib/contact-links'
import { activation, footerNext, modeFor, type FooterEvent, type FooterState } from '../../lib/pet/footer-machine'
import { setFooterInView } from '../../lib/pet/footer-view'
import { bubbleAt, figureCentreY, FLY_MS, FLY_STAGGER_MS, labelAlign, LAYOUT, orbitAngle, reach, RETURN_MS, RETURN_STAGGER_MS, snap, type Mode } from '../../lib/pet/orbit'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import { useReducedMotion } from '../../lib/pet/reduced-motion'
import type { Frame, Sprite } from '../../lib/pet/sprite'
import { subscribe } from '../../lib/pet/ticker'
import { BUBBLE_ICONS } from './contact-icons'
import { ContactBubble } from './contact-bubble'
import { PixelSprite } from './pixel-sprite'

const ME = footerJson as unknown as Sprite
const BUBBLE = bubbleJson as unknown as Sprite
const N = CONTACT_LINKS.length
const DESK_QUERY = '(min-width: 768px)'

type Bub = { phase: 'fly' | 'orbit' | 'return' | 'gone'; age: number; from: [number, number] }

function useMode(): Mode {
  const [desk, setDesk] = useState(() => matchMedia(DESK_QUERY).matches)
  useEffect(() => {
    const m = matchMedia(DESK_QUERY)
    const on = () => setDesk(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return desk ? 'desk' : 'phone'
}

export function FooterFriend({ plain, onCard }: { plain: ReactNode; onCard: () => void }) {
  const [prefs] = usePetPrefs()
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !prefs.on) return <>{plain}</>
  return <Levitate key={String(reduced)} reduced={reduced} onCard={onCard} />
}

function Levitate({ reduced, onCard }: { reduced: boolean; onCard: () => void }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navId = useId()
  const mode = useMode()
  const L = LAYOUT[mode]
  const S = L.scale
  const [ax, anchorY] = ME.anchor!
  const ay = mode === 'desk' ? anchorY : figureCentreY(ME.animations.levitate.frames[0], anchorY)
  const glyphY = (anchorY - ay) * S

  const [state, setState] = useState<FooterState>('idle')
  const send = (e: FooterEvent) => setState((s) => footerNext(s, e))
  const [spawned, setSpawned] = useState(false)
  const [ready, setReady] = useState<boolean[]>(() => CONTACT_LINKS.map(() => false))
  const [focused, setFocused] = useState<number | null>(null)
  const [inView, setInView] = useState(false)

  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const glyph = useRef<HTMLSpanElement>(null)
  const els = useRef<(HTMLLIElement | null)[]>([])
  const bubs = useRef<Bub[]>([])
  const orbitMs = useRef(0)
  const bob = useRef(0)
  const hoverMe = useRef(false)
  const hoverB = useRef<number | null>(null)
  const keyB = useRef<number | null>(null)
  const focusedRef = useRef<number | null>(null)
  const lastFrame = useRef(-1)
  const stateRef = useRef(state)
  stateRef.current = state

  const clip = state === 'bursting' ? 'levitate_burst' : 'levitate'
  useEffect(() => {
    lastFrame.current = -1
  }, [clip])

  const refocus = () => {
    const f = hoverB.current ?? keyB.current
    focusedRef.current = f
    setFocused(f)
  }

  const flare = () => {
    const el = glyph.current
    if (!el) return
    el.classList.remove('footer-flare')
    void el.offsetWidth
    el.classList.add('footer-flare')
  }

  const emit = () => {
    const from: [number, number] = [0, glyphY + bob.current * S]
    bubs.current = CONTACT_LINKS.map(() => ({ phase: 'fly', age: 0, from }))
    orbitMs.current = 0
    setReady(CONTACT_LINKS.map(() => false))
    setSpawned(true)
  }

  const onStep = (_: number, f: Frame) => {
    const frames = ME.animations[clip].frames
    const i = frames.indexOf(f)
    // a long frame gap can skip frames; fire every event passed over
    if (clip === 'levitate_burst') {
      for (let k = lastFrame.current + 1; k <= i; k++) {
        if (frames[k].ev === 'flare') flare()
        if (frames[k].ev === 'emit') emit()
      }
    }
    lastFrame.current = i
    bob.current = f.g ?? 0
    if (glyph.current) glyph.current.style.transform = `translateY(${bob.current * S}px)`
  }

  // side effects of entering each state
  const prev = useRef(state)
  useEffect(() => {
    const from = prev.current
    prev.current = state
    if (state === 'bursting' && from === 'closing') {
      setSpawned(false)
      bubs.current = []
    }
    if (state === 'closing') {
      if (!bubs.current.length) return send('closeEnd')
      for (const b of bubs.current) if (b.phase !== 'gone') Object.assign(b, { phase: 'return', age: 0 })
    }
    if (state === 'idle') {
      const hadFocus = !!root.current?.querySelector('nav')?.contains(document.activeElement)
      setSpawned(false)
      bubs.current = []
      hoverB.current = keyB.current = focusedRef.current = null
      setFocused(null)
      if (hadFocus) button.current?.focus()
    }
  }, [state])

  // one subscription moves every bubble
  useEffect(() => {
    if (!spawned || !inView) return
    return subscribe((dt) => {
      if (hoverMe.current === false && focusedRef.current === null) orbitMs.current += dt
      let live = 0
      bubs.current.forEach((b, i) => {
        const el = els.current[i]
        if (b.phase === 'gone' || !el) return
        live++
        b.age += dt
        const tt = b.age - i * (b.phase === 'return' ? RETURN_STAGGER_MS : FLY_STAGGER_MS)
        if (tt < 0) {
          if (b.phase === 'fly') el.style.visibility = 'hidden'
          return
        }
        el.style.visibility = 'visible'
        const k = reach(b.phase === 'fly' ? { kind: 'fly', t: tt } : b.phase === 'return' ? { kind: 'return', t: tt } : { kind: 'orbit' })
        const p = bubbleAt(b.from, L, orbitAngle(i, N, orbitMs.current, b.phase === 'fly' ? tt : null), k)
        const half = (BUBBLE.w * S) / 2
        el.style.transform = `translate(${snap(p.x - half, S)}px, ${snap(p.y - half, S)}px)`
        el.dataset.far = String(p.far)
        el.dataset.align = labelAlign(p.ox, L, mode)
        if (b.phase === 'fly' && tt >= FLY_MS) {
          b.phase = 'orbit'
          setReady((r) => r.map((v, j) => v || j === i))
        }
        if (b.phase === 'return' && tt >= RETURN_MS) {
          b.phase = 'gone'
          el.style.visibility = 'hidden'
        }
      })
      if (live === 0 && stateRef.current === 'closing') send('closeEnd')
    })
  }, [spawned, inView, L, S, mode])

  // the footer leaving the view, a route change, Esc and clicks outside
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting)
      setFooterInView(e.isIntersecting)
      if (!e.isIntersecting) send('reset')
    })
    io.observe(el)
    return () => {
      io.disconnect()
      setFooterInView(false)
    }
  }, [])

  const firstPath = useRef(true)
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false
      return
    }
    send('reset')
  }, [pathname])

  useEffect(() => {
    if (state === 'idle') return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && send('dismiss')
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && send('dismiss')
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [state])

  const open = state !== 'idle'
  return (
    <div ref={root} className="relative z-10 h-[150px] w-full shrink-0 md:absolute md:left-1/2 md:top-1/2 md:h-0 md:w-0">
      <div className="absolute left-1/2 top-1/2 h-0 w-0" data-focusing={focused !== null}>
        <button
          ref={button}
          type="button"
          onClick={(e) => {
            if (activation(e.detail, reduced) === 'card') {
              send('reset')
              onCard()
            } else send('toggle')
          }}
          aria-label={t('footer.getInTouchLabel')}
          aria-expanded={open}
          aria-controls={spawned ? navId : undefined}
          className="group absolute left-0 top-0 z-[2] font-body font-bold leading-none"
          style={{ fontSize: 20 * S, transform: `translate(-50%, -50%) translateY(${glyphY}px)` }}
        >
          <span ref={glyph} className="inline-block animate-neon text-rose-400 group-hover:animate-none group-hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]">
            @
          </span>
        </button>
        <div
          className="absolute z-[4] cursor-pointer"
          style={{ left: -ax * S, top: -ay * S }}
          onClick={() => (reduced ? onCard() : send('toggle'))}
          onMouseEnter={() => (hoverMe.current = true)}
          onMouseLeave={() => (hoverMe.current = false)}
        >
          <PixelSprite
            sprite={ME}
            clip={clip}
            scale={S}
            playing={!reduced && inView}
            frame={reduced ? 0 : undefined}
            onStep={onStep}
            onEnd={() => send('burstEnd')}
          />
        </div>
        {spawned && (
          <nav id={navId} aria-label={t('footer.contactLinks')}>
            <ul>
              {CONTACT_LINKS.map((l, i) => (
                <ContactBubble
                  key={l.id}
                  ref={(el) => {
                    els.current[i] = el
                  }}
                  sprite={BUBBLE}
                  scale={S}
                  logo={L.logo}
                  href={l.href}
                  newTab={opensNewTab(l)}
                  label={l.id === 'email' ? t('footer.email') : l.name}
                  icon={BUBBLE_ICONS[l.id]}
                  mode={modeFor(i, focused)}
                  ready={ready[i]}
                  focused={focused === i}
                  onEnter={() => {
                    hoverB.current = i
                    refocus()
                  }}
                  // leaving waits a tick so moving straight to the next bubble hands focus over
                  onLeave={() =>
                    setTimeout(() => {
                      if (hoverB.current === i) {
                        hoverB.current = null
                        refocus()
                      }
                    })
                  }
                  onFocus={() => {
                    keyB.current = i
                    refocus()
                  }}
                  onBlur={() =>
                    setTimeout(() => {
                      if (keyB.current === i) {
                        keyB.current = null
                        refocus()
                      }
                    })
                  }
                />
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}
