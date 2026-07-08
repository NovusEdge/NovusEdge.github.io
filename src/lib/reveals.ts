import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './motion'

gsap.registerPlugin(ScrollTrigger)

// ---- blog LIST reveal ----
// IntersectionObserver-driven (not ScrollTrigger): each row is hidden then revealed the
// instant it intersects, so nothing can get stranded off-screen. Returns a cleanup fn.
export function revealBlogList(root: HTMLElement | null): () => void {
  if (!root || prefersReducedMotion()) return () => {}

  const rows = gsap.utils.toArray<HTMLElement>('[data-post]', root)
  const lines = gsap.utils.toArray<HTMLElement>('[data-yearline]', root)

  rows.forEach((row, i) => {
    gsap.set(row, { opacity: 0, x: i % 2 ? 52 : -52 })
    const thumb = row.querySelector<HTMLElement>('[data-thumb]')
    if (thumb) gsap.set(thumb, { opacity: 0, scale: 1.12 })
  })
  gsap.set(lines, { scaleX: 0, transformOrigin: 'left center' })

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        io.unobserve(el)
        if (el.hasAttribute('data-yearline')) {
          gsap.to(el, { scaleX: 1, duration: 0.9, ease: 'power3.out' })
          continue
        }
        const thumb = el.querySelector<HTMLElement>('[data-thumb]')
        const tl = gsap.timeline()
        tl.to(el, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' })
        if (thumb) tl.to(thumb, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, '<')
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
  )

  rows.forEach((r) => io.observe(r))
  lines.forEach((l) => io.observe(l))
  return () => io.disconnect()
}

// ---- generic card reveal (portfolio/research grids) ----
// IntersectionObserver-driven fade-up; robust and can't strand cards. Returns cleanup.
export function revealCards(root: HTMLElement | null): () => void {
  if (!root || prefersReducedMotion()) return () => {}
  const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root)
  gsap.set(cards, { opacity: 0, y: 30 })
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        gsap.to(e.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  )
  cards.forEach((c) => io.observe(c))
  return () => io.disconnect()
}

// ---- blog POST content reveal ----
export const CONTENT_STYLES = ['fade', 'mask', 'focus'] as const
export type ContentStyle = (typeof CONTENT_STYLES)[number]

export function revealPostContent(root: HTMLElement | null, style: ContentStyle) {
  if (!root) return
  const blocks = Array.from(root.children) as HTMLElement[]
  blocks.forEach((el) => {
    if (style === 'fade') {
      gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      })
    } else if (style === 'mask') {
      gsap.from(el, {
        opacity: 0,
        clipPath: 'inset(0 0 100% 0)',
        y: 10,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      })
    } else {
      // focus: each block sharpens + brightens as it scrolls toward reading height
      gsap.fromTo(
        el,
        { opacity: 0.3, filter: 'blur(5px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 58%', scrub: true },
        },
      )
    }
  })
}
