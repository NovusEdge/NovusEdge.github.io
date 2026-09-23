import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { prefersReducedMotion } from '../lib/motion'

export type Section = { id: string; text: string }

const pct = (v: number) => `${String(Math.round(v)).padStart(3, '0')}%`

/**
 * The reading strip along the bottom of the viewport, with the contents behind
 * a toggle. It costs no horizontal space, which a rail beside the column does.
 *
 * Borrows the portal essay's `.op` classes so both strips stay one design. The
 * portal tracks per-module completion; this tracks one scroll position and the
 * section under the reading line, which is all a linear post needs.
 */
export function OpenJevProgress({ sections }: { sections: Section[] }) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(-1)
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // The server cannot render portals. Match its empty output during hydration.
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - innerHeight
      setTotal(scrollable > 0 ? Math.min(100, (scrollY / scrollable) * 100) : 0)
      // 40% down the viewport, the same reading line the other indexes use.
      const mark = innerHeight * 0.4
      let seen = -1
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top < mark) seen = i
      })
      setCurrent(seen)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [sections])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (panel.current?.contains(target) || button.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  if (!mounted || typeof document === 'undefined') return null

  const toggle = () => {
    setAnimate(!prefersReducedMotion())
    setOpen((o) => !o)
  }
  const jump = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    button.current?.focus()
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }
  const here = Math.max(0, current) + 1

  return createPortal(
    <div className="op oj-strip">
      <div className="op-progress">
        <span className="op-progress-k">{t('blog.portal.position')}</span>
        <span
          className="op-progress-v"
          role="progressbar"
          aria-label={t('blog.portal.readingPosition')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(total)}
        >
          {pct(total)}
        </span>
        <span className="op-progress-track" aria-hidden="true">
          <span className="op-progress-fill" style={{ transform: `scaleX(${total / 100})` }} />
        </span>
        <button
          ref={button}
          type="button"
          className="op-progress-btn"
          aria-expanded={open}
          aria-controls="oj-contents-panel"
          onClick={toggle}
        >
          <span className="op-progress-mod">
            {String(here).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
          </span>
          <span className="op-progress-btn-l">{t('blog.contents')}</span>
          <span className="op-progress-caret" aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div
          ref={panel}
          id="oj-contents-panel"
          className={animate ? 'op-contents op-contents-in' : 'op-contents'}
          role="region"
          aria-label={t('blog.contents')}
        >
          <p className="op-contents-head">
            <span>{t('blog.contents')}</span>
          </p>
          <ol>
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={current === i ? 'true' : undefined}
                  onClick={jump(s.id)}
                >
                  <span className="op-contents-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="op-contents-t">{s.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>,
    document.body
  )
}
