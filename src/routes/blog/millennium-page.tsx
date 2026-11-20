import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { TLink } from '../../components/page-transition'
import Magnetic from '../../components/react-bits/Magnetic'
import { Markdown } from '../../components/markdown'
import { PostSignoff } from '../../components/post-signoff'
import { AttractorStage } from '../../components/millennium/attractor-stage'
import { createScene, disposeScene, pose, showCount, turn, type Scene, type Zone } from '../../components/millennium/scene'
import { RESULTS } from '../../components/millennium/timeline-data'
import { Timeline, emphasised } from '../../components/millennium/timeline'
import { Figure } from '../../components/millennium/figures'
import { LOOKS, PLAIN, parsePost, splitTitle, type Block, type Chapter } from '../../components/millennium/chapters'
import { Meta } from '../../lib/meta'
import { isMobile, prefersReducedMotion } from '../../lib/motion'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'
import '../../components/millennium/millennium.css'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

const PROSE =
  'ml-prose prose prose-neutral prose-blog max-w-none leading-relaxed text-charcoal/80 dark:prose-invert dark:text-bone/85 prose-headings:mt-12 prose-headings:mb-6 prose-headings:font-display prose-p:my-6 prose-h2:text-4xl prose-h3:text-2xl'

// A different side of the figure in the window above each of the three problems.
const TURNS: [number, number][] = [
  [0.9, 0.25],
  [-0.8, -0.2],
  [1.7, 0.35],
]

type Motion = { reduced: boolean; pin: boolean }

export function MillenniumPage({ post, image }: { post: Post; image?: string | null }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  const root = useRef<HTMLDivElement>(null)
  // Unknown until mounted: the prerender and first paint are the list layout with no canvas.
  const [motion, setMotion] = useState<Motion | null>(null)
  const scene = useMemo<Scene | null>(() => (motion ? createScene(motion.reduced) : null), [motion?.reduced])
  const zone = useRef<Zone | null>(null)
  const count = useRef(1)

  const { lead, chapters } = useMemo(() => parsePost(post.content), [post.content])
  const [main, aside] = splitTitle(post.title)
  const date = new Date(post.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

  useEffect(() => {
    // The page is dark in either theme; borrowing the site's dark class restyles the nav and
    // sign-off to match. Only a class this page added is taken away again.
    const html = document.documentElement
    const added = !html.classList.contains('dark')
    html.classList.add('ml-night', 'dark')
    const wide = matchMedia('(min-width: 900px) and (min-height: 600px)')
    const read = () => {
      const reduced = prefersReducedMotion()
      setMotion({ reduced, pin: !reduced && !isMobile() && wide.matches })
    }
    read()
    wide.addEventListener('change', read)
    // .page-enter settles 0.5 s after mount; scroll positions measured before that are 14px off.
    const id = setTimeout(() => ScrollTrigger.refresh(), 600)
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      wide.removeEventListener('change', read)
      clearTimeout(id)
      html.classList.remove('ml-night')
      if (added) html.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    if (scene) return () => disposeScene(scene)
  }, [scene])

  const onCount = useCallback(
    (n: number) => {
      count.current = n
      if (scene && zone.current === 'timeline') showCount(scene, n)
    },
    [scene],
  )

  // One reader of scroll position decides which zone owns the figure. Reading rects, not
  // enter/leave events, so a reload or an anchor jump lands in the right state too.
  useGSAP(
    () => {
      if (!scene || !motion) return
      const el = root.current!
      const zones = gsap.utils.toArray<HTMLElement>('[data-zone]', el)
      const windows = gsap.utils.toArray<HTMLElement>('.ml-window', el)
      const heads = gsap.utils.toArray<HTMLElement>('[data-chapter]', el)
      const links = gsap.utils.toArray<HTMLElement>('.ml-rail a', el)
      const narrow = () => innerWidth < 900 || innerWidth < innerHeight
      let chapter: string | undefined
      const resolve = () => {
        const h = innerHeight
        const line = h * 0.55
        let current: string | undefined
        for (const c of heads) if (c.getBoundingClientRect().top <= h * 0.5) current = c.dataset.chapter
        if (current !== chapter) {
          chapter = current
          links.forEach((a) => (a.dataset.chapterLink === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')))
        }
        // A window owns the figure for as long as it fills the middle of the screen, not only while it crosses one line.
        const open = windows.some((w) => {
          const r = w.getBoundingClientRect()
          return r.top < h * 0.8 && r.bottom > h * 0.2
        })
        const hit = zones.find((z) => {
          const r = z.getBoundingClientRect()
          return r.top <= line && r.bottom > line
        })
        const next = open ? 'open' : ((hit?.dataset.zone as Zone | undefined) ?? zone.current ?? 'hero')
        if (next === zone.current) return
        zone.current = next
        el.dataset.zone = next
        pose(scene, next, next === 'timeline' ? !motion.pin : narrow())
        showCount(scene, next === 'timeline' ? count.current : RESULTS.length)
      }
      zone.current = null
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: resolve, onRefresh: resolve })
      resolve()

      if (motion.reduced) return
      windows.forEach((w, i) => {
        const [yaw, pitch] = TURNS[i % TURNS.length]
        const [backYaw, backPitch] = i ? TURNS[(i - 1) % TURNS.length] : [0, 0]
        ScrollTrigger.create({ trigger: w, start: 'top 85%', onEnter: () => turn(scene, yaw, pitch), onLeaveBack: () => turn(scene, backYaw, backPitch) })
      })
    },
    { scope: root, dependencies: [scene, motion?.pin], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      if (!motion || motion.reduced) return
      const el = root.current!

      // Hero: the title rises out of its own lines while the figure draws itself; the hedge lands a beat late.
      const hero = gsap.timeline({ defaults: { ease: 'expo.out' } })
      SplitText.create('.ml-title-main', {
        type: 'lines,chars',
        mask: 'lines',
        autoSplit: true,
        onSplit: (s) => gsap.from(s.chars, { yPercent: 118, duration: 1.15, ease: 'expo.out', stagger: 0.016, delay: 0.15 }),
      })
      hero
        .from('.ml-prob', { opacity: 0, yPercent: 55, rotate: -7, duration: 0.9, ease: 'back.out(2.2)' }, 1.25)
        .from('.ml-date time', { clipPath: 'inset(0 100% 0 0)', duration: 0.7, ease: 'steps(14)' }, 1.5)
        .from('.ml-back', { opacity: 0, duration: 0.8 }, 0.4)

      // Pull quotes: the gold rules draw across, then the words come up line by line.
      gsap.utils.toArray<HTMLElement>('.ml-prose blockquote[class]', el).forEach((quote) => {
        const [line, credit] = Array.from(quote.querySelectorAll('p'))
        if (!line) return
        const st = { trigger: quote, start: 'top 80%', once: true }
        gsap.from(quote, { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'expo.out', scrollTrigger: st })
        SplitText.create(line, {
          type: 'lines,words',
          mask: 'lines',
          autoSplit: true,
          onSplit: (s) => gsap.from(s.words, { yPercent: 110, duration: 0.95, ease: 'expo.out', stagger: 0.035, delay: 0.25, scrollTrigger: st }),
        })
        if (credit) gsap.from(credit, { opacity: 0, letterSpacing: '0.6em', duration: 1.2, ease: 'expo.out', delay: 0.7, scrollTrigger: st })
      })

      // Figures are drawn in their final state; .ml--live hides the parts that play, and this starts them.
      gsap.utils.toArray<HTMLElement>('[data-fig]', el).forEach((fig) => {
        ScrollTrigger.create({ trigger: fig, start: 'top 72%', once: true, onEnter: () => fig.setAttribute('data-in', '') })
      })
    },
    { scope: root, dependencies: [motion?.reduced], revertOnUpdate: true },
  )

  const live = !!motion && !motion.reduced
  const jump = (e: MouseEvent, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: live ? 'smooth' : 'auto', block: 'start' })
  }

  const row = (block: Block, key: number, sources: Chapter['sources'] | null) =>
    block.kind === 'slot' ? (
      block.name !== 'timeline' && <Figure key={key} name={block.name} />
    ) : (
      <div key={key} className="ml-row">
        <div className={PROSE}>
          <Markdown>{block.text}</Markdown>
        </div>
        {sources && sources.length > 0 && (
          <aside className="ml-note ml-sources">
            <p>Sources</p>
            <ol>
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url}>{s.host}</a>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>
    )

  const chapter = (ch: Chapter) => {
    const look = LOOKS[ch.id] ?? PLAIN
    // The timeline runs the full width of the page, so it splits the chapter's sheet in two around it.
    const cut = ch.blocks.findIndex((b) => b.kind === 'slot' && b.name === 'timeline')
    const runs = cut < 0 ? [ch.blocks] : [ch.blocks.slice(0, cut), ch.blocks.slice(cut + 1)]
    const firstText = ch.blocks.findIndex((b) => b.kind === 'md')
    return (
      <section key={ch.id} className="ml-ch" data-chapter={ch.id} aria-labelledby={ch.id}>
        {look.opens === 'window' && <div className="ml-window" data-zone="open" aria-hidden="true" />}
        {look.opens === 'still' && (
          <div className="ml-still" data-zone="still">
            <div className="ml-still-frame">
              <i />
              <i />
              <i />
              <i />
              <p className="ml-still-note">Frame held. Verdicts pending.</p>
            </div>
          </div>
        )}
        {runs.map((run, r) => (
          <div key={r}>
            {r > 0 && <Timeline layout={motion?.pin ? 'pin' : 'list'} live={live} onCount={onCount} />}
            <div className={`ml-sheet${look.paper ? ' ml-sheet--paper' : ''}`} data-zone={look.zone}>
              <div className="ml-grid">
                {r === 0 && (
                  <header className="ml-head">
                    <h2 id={ch.id}>
                      {ch.title}
                      {ch.aside && <span className="ml-head-aside"> {ch.aside}</span>}
                    </h2>
                    {look.kanji && (
                      <span className="ml-kanji" lang="ja" aria-hidden="true">
                        {look.kanji}
                      </span>
                    )}
                    {look.results && (
                      <ul className="ml-status">
                        {look.results.map((i) => (
                          <li key={i}>
                            <span className={`ml-pill ml-pill--${RESULTS[i].tone}`}>{RESULTS[i].status}</span>
                            <time>{RESULTS[i].when}</time>
                            <span>{emphasised(RESULTS[i].what)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </header>
                )}
                {run.map((b) => {
                  const i = ch.blocks.indexOf(b)
                  return row(b, i, i === firstText ? ch.sources : null)
                })}
              </div>
            </div>
          </div>
        ))}
      </section>
    )
  }

  return (
    <div ref={root} className={`ml dark${motion?.reduced ? ' ml--reduced' : ''}${live ? ' ml--live' : ''}`} lang={post.contentLocale}>
      <Meta title={post.title} description={post.description || post.title} image={image} />
      {scene && <AttractorStage scene={scene} />}
      <article className="ml-body">
        <header className="ml-hero" data-zone="hero">
          <div className="ml-back">
            <Magnetic range={25}>
              <TLink
                to={lp('/blog')}
                className="group inline-block rounded border border-charcoal/10 bg-bone-tint/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper-deep transition-colors hover:border-gold dark:border-bone/10 dark:bg-charcoal-tint/10 dark:text-paper dark:hover:border-gold"
              >
                {t('blog.backToBlog')}
              </TLink>
            </Magnetic>
          </div>
          <div>
            <h1>
              <span className="ml-title-main">{main}</span>
              {aside && (
                <>
                  {' '}
                  <span className="ml-prob">{aside}</span>
                </>
              )}
            </h1>
            <p className="ml-date">
              <time dateTime={post.date}>{date}</time>
            </p>
          </div>
        </header>

        <nav className="ml-rail" aria-label="Sections">
          <ol>
            {chapters.map((ch) => {
              const look = LOOKS[ch.id] ?? PLAIN
              return (
                <li key={ch.id}>
                  <a href={`#${ch.id}`} data-chapter-link={ch.id} onClick={(e) => jump(e, ch.id)}>
                    <span lang="ja" aria-hidden="true">
                      {look.kanji}
                    </span>
                    {look.short ?? ch.title}
                  </a>
                </li>
              )
            })}
          </ol>
        </nav>

        {(post.description || lead) && (
          <div className="ml-sheet ml-sheet--lead" data-zone="read">
            <div className="ml-grid">
              {post.description && <p className="ml-stand">{post.description}</p>}
              {lead && row({ kind: 'md', text: lead }, 0, null)}
            </div>
          </div>
        )}

        {chapters.map(chapter)}

        <div className="ml-sheet ml-sheet--end">
          <PostSignoff variant={0} />
        </div>
      </article>
    </div>
  )
}
