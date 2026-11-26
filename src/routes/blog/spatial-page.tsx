import { Children, Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ArrowUp } from 'lucide-react'
import { TLink } from '../../components/page-transition'
import DecryptedText from '../../components/react-bits/DecryptedText'
import FlowingMenu from '../../components/react-bits/FlowingMenu'
import HalftoneReveal from '../../components/react-bits/HalftoneReveal'
import Magnetic from '../../components/react-bits/Magnetic'
import { PostSignoff } from '../../components/post-signoff'
import { FIGURES } from '../../components/spatial/figures'
import { SpatialHero } from '../../components/spatial/hero'
import { Meta } from '../../lib/meta'
import { headingId } from '../../lib/blog-headings'
import { prefersReducedMotion } from '../../lib/motion'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'
import './spatial-page.css'

// The data-wf-* attributes are the names the owner points at with Agentation while the post is a draft.

type Block = { kind: 'md'; text: string } | { kind: 'figure'; id?: string; text: string; n: number }
type Section = { id: string; title: string; blocks: Block[] }

function sections(md: string): Section[] {
  const out: Section[] = [{ id: 'intro', title: 'Intro', blocks: [] }]
  let buf: string[] = []
  let figures = 0
  const last = () => out[out.length - 1]
  const flush = () => {
    if (buf.join('').trim()) last().blocks.push({ kind: 'md', text: buf.join('\n') })
    buf = []
  }
  for (const line of md.split('\n')) {
    const h = /^## (.+)$/.exec(line)
    const f = /^\*\*\[FIGURE(?: ([\w-]+))?: (.+)\]\*\*$/.exec(line)
    if (h) {
      flush()
      out.push({ id: headingId(h[1]), title: h[1], blocks: [] })
    } else if (f) {
      flush()
      last().blocks.push({ kind: 'figure', id: f[1], text: f[2], n: ++figures })
    } else buf.push(line)
  }
  flush()
  return out
}

const components: Components = {
  h3: ({ children }) => <h3 id={headingId(String(children))}>{children}</h3>,
  strong: ({ children }) => {
    const first = Children.toArray(children)[0]
    const marker = typeof first === 'string' && /^\[(GAP|CHECK|NOTE):/.exec(first)
    if (!marker) return <strong>{children}</strong>
    return (
      <span data-wf-marker={marker[1]} className="spp-tag">
        {children}
      </span>
    )
  },
}

// One render per chapter in public/assets/blog/spatial/menu, named by chapter number.
const MENU_IMAGES = 8

const CHARACTER_CHAPTER = 'mechanics-ui-and-vibes'

// The order the next-chapter picture's 8x5 tiles clear in: 17 is coprime with 40, so stepping by
// it visits every tile once and looks scattered without a random number the server would not share.
const PEEK_ORDER = Array.from({ length: 40 }, (_, n) => (n * 17) % 40)

const chapterTitle = (i: number, title: string) => `Chapter ${i}: ${title}`
const chapterNumber = (i: number) => `Chapter ${String(i).padStart(2, '0')}`

type MoodName = 'frustrated' | 'confused' | 'lost' | 'away'
type MoodReader = { start(): void; stop(): void }
type MoodKit = { createMoodReader(options: { model: unknown; onReading(reading: { mood: MoodName | null }): void }): MoodReader }

// The kit and model are gitignored because their licence bars public repositories, so CI builds
// without them and these globs match nothing. A static import would fail tsc and the build there.
const MOOD_KIT: (() => Promise<MoodKit>) | undefined = Object.values(import.meta.glob<MoodKit>('../../mood-recognition/index.ts'))[0]
const MOOD_MODEL: (() => Promise<unknown>) | undefined = Object.values(
  import.meta.glob<unknown>('../../mood-recognition/MoodRecognition.json', { import: 'default' }),
)[0]

function useReaderMood(): MoodName | null {
  const [mood, setMood] = useState<MoodName | null>(null)
  useEffect(() => {
    if (!MOOD_KIT || !MOOD_MODEL) return
    let reader: MoodReader | undefined
    let cancelled = false
    Promise.all([MOOD_KIT(), MOOD_MODEL()]).then(([kit, model]) => {
      if (cancelled) return
      // Readings arrive every 66 ms; holding only the mood name means state changes, and the
      // page's markdown re-renders, only when the mood itself changes.
      reader = kit.createMoodReader({ model, onReading: (r) => setMood(r.mood) })
      reader.start()
    })
    return () => {
      cancelled = true
      reader?.stop()
    }
  }, [])
  return mood
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((b, i) => {
    if (b.kind === 'md')
      return (
        <ReactMarkdown key={i} remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
          {b.text}
        </ReactMarkdown>
      )
    const Figure = b.id ? FIGURES[b.id] : undefined
    if (Figure) return <Figure key={i} />
    return (
      <div key={i} data-wf-slot={`figure ${b.n}`} className="spp-pending not-prose">
        <span className="spp-kicker">Figure to come</span>
        <p>{b.text}</p>
      </div>
    )
  })
}

export function SpatialPage({ post, image }: { post: Post; image?: string | null }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  // The text before the first heading is chapter 0. Memoised: a new array each render would
  // re-run the hash effect, which sets state, which renders again.
  const chapters = useMemo(() => sections(post.content), [post.content])
  const mood = useReaderMood()
  const menuItems = useMemo(
    () => chapters.map((c, i) => ({ text: chapterTitle(i, c.title), image: `/assets/blog/spatial/menu/${i % MENU_IMAGES}.webp` })),
    [chapters],
  )
  // Chapter 0 is open on load with no target, so the page does not scroll itself on arrival.
  const [view, setView] = useState<{ chapter: number; target: string | null }>({ chapter: 0, target: null })
  const menuRef = useRef<HTMLDivElement>(null)

  // The post opens light whatever the reader's theme; index.html holds the same rule for a direct
  // load, so the prerendered page does not paint dark first. Leaving re-reads the stored theme
  // instead of putting back what was here on arrival: if the reader used the toggle on this
  // page, that choice is the one in localStorage and it should carry to the next page.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    // The footer is App's sibling of this page, so only a class up here reaches it: spatial-page.css
    // repaints it in the page's theme.
    root.classList.add('spp-page')
    return () => {
      root.classList.remove('spp-page')
      const theme = localStorage.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [])
  // Starts false so the first client render matches the prerendered HTML.
  const [fx, setFx] = useState(false)
  useEffect(() => setFx(!prefersReducedMotion()), [])
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const read = () => setDark(root.classList.contains('dark'))
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  const [menuInView, setMenuInView] = useState(true)
  // True while the last chapter's own "Back to chapters" pill or the site footer is on screen.
  // The floating pill would duplicate the first, and over the footer it would sit on the dither hands.
  const [nearEnd, setNearEnd] = useState(false)

  useEffect(() => {
    const onScreen = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target)
        else onScreen.delete(entry.target)
      }
      setNearEnd(onScreen.size > 0)
    })
    document.querySelectorAll('.spp-end, footer').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // A menu still below the fold counts as in view: on a phone it starts there, and the pill is
    // the way back to a menu the reader has passed, not one they have yet to reach.
    const observer = new IntersectionObserver(([entry]) => setMenuInView(entry.isIntersecting || entry.boundingClientRect.top > 0))
    observer.observe(menuRef.current!)
    return () => observer.disconnect()
  }, [])

  const backToChapters = () => {
    // preventScroll: focus would otherwise jump there first and cancel the smooth scroll.
    menuRef.current?.focus({ preventScroll: true })
    menuRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (view.target) document.getElementById(view.target)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [view])

  // Closed chapters are display:none, so the browser cannot scroll to a heading inside one.
  // Without this a #heading-id link into a closed chapter lands nowhere.
  useEffect(() => {
    const openHash = () => {
      let id = ''
      try {
        id = decodeURIComponent(location.hash.slice(1))
      } catch {
        return
      }
      const section = id ? document.getElementById(id)?.closest('[data-wf-section]') : null
      const chapter = chapters.findIndex((c) => c.id === section?.getAttribute('data-wf-section'))
      if (chapter >= 0) setView({ chapter, target: id })
    }
    openHash()
    window.addEventListener('hashchange', openHash)
    return () => window.removeEventListener('hashchange', openHash)
  }, [chapters])

  return (
    <div lang={post.contentLocale} className="spp mx-auto max-w-[80rem] px-6 pb-24 pt-10 lg:px-10">
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <nav data-wf-region="masthead" className="mb-12">
        <Magnetic range={25}>
          <TLink
            to={lp('/blog')}
            className="group inline-block rounded border border-charcoal/10 bg-bone-tint/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper-deep transition-colors hover:border-gold dark:border-bone/10 dark:bg-charcoal-tint/10 dark:text-paper dark:hover:border-gold"
          >
            {t('blog.backToBlog')}
          </TLink>
        </Magnetic>
      </nav>

      <aside data-wf-region="psa" className="spp-psa">
        <span className="spp-kicker">PSA</span>
        <p>
          I'm very opinionated about this one. If you think the way to go is just slapping on a better model, or leaning on whatever the model can already do
          natively, you can kindly fuck off :) Even when a model is already good at something, we should still be trying to make it more efficient, because why
          the fuck not?
        </p>
      </aside>

      <SpatialHero title={post.title} description={post.description} date={post.date} />

      <article
        data-wf-region="body"
        className="spp-body prose prose-lg prose-neutral max-w-none font-medium xl:prose-xl dark:prose-invert prose-headings:font-display prose-em:text-[#8a6116] dark:prose-em:text-gold"
      >
        <div ref={menuRef} tabIndex={-1} data-wf-region="chapters" className="spp-menu not-prose">
          <FlowingMenu
            items={menuItems}
            activeIndex={view.chapter}
            onItemClick={(_, i) => setView({ chapter: i, target: chapters[i].id })}
            ariaLabel="Chapters"
            align="left"
            showIndex
            indexStart={0}
            textColor="inherit"
            bgColor="transparent"
            marqueeBgColor="var(--color-gold)"
            marqueeTextColor="var(--color-charcoal)"
            borderColor="var(--spp-rule)"
          />
        </div>

        <div data-wf-region="chapter">
          {chapters.map((s, i) => {
            const open = view.chapter === i
            const next = chapters[i + 1]
            return (
              // React 19 treats `hidden` as a boolean and writes hidden="" whatever string it is given,
              // so hidden="until-found" never reaches the DOM. Closed chapters stay mounted so the
              // prerendered HTML carries their text, but find-in-page does not search them.
              <section key={s.id} id={s.id} data-wf-section={s.id} hidden={!open} className="spp-chapter">
                <header className="spp-chapter-head not-prose">
                  <span className="spp-kicker">{open && fx ? <DecryptedText text={chapterNumber(i)} speed={24} delay={120} /> : chapterNumber(i)}</span>
                  {/* One span a word, for the stylesheet's staggered rise. The spaces stay outside the
                      spans: at the end of an inline-block they would collapse and join the words. */}
                  <h2>
                    {s.title.split(' ').map((word, n) => (
                      <Fragment key={n}>
                        <span style={{ '--i': n } as CSSProperties}>{word}</span>{' '}
                      </Fragment>
                    ))}
                  </h2>
                </header>
                {s.id === CHARACTER_CHAPTER && (
                  <figure data-wf-slot="character reveal" className="spp-reveal not-prose">
                    {/* Mounted only while its chapter is open: at display:none the canvas would hold a WebGL context sized 1x1.
                        Literal hex, not tokens: the component resolves colours through a canvas, which cannot read var(). */}
                    <div>
                      {open && (
                        // Keyed by theme: the component reads its colours once.
                        <HalftoneReveal
                          key={String(dark)}
                          src="/assets/blog/spatial/link.webp"
                          fit="contain"
                          mode="color"
                          cellSize={3}
                          revealRadius={90}
                          inkColor={dark ? '#f5f2eb' : '#1a1a1a'}
                          paperColor={dark ? '#1a1a1a' : '#f5f2eb'}
                          accentColor="#d4a03c"
                        />
                      )}
                    </div>
                    <figcaption>Link, The Legend of Zelda: Tears of the Kingdom. Artwork © Nintendo</figcaption>
                  </figure>
                )}
                <Blocks blocks={s.blocks} />
                {next ? (
                  <button type="button" data-wf-control="next chapter" onClick={() => setView({ chapter: i + 1, target: next.id })} className="spp-next not-prose">
                    <span className="spp-kicker">Next · {chapterNumber(i + 1)}</span>
                    <b>{next.title}</b>
                    <span aria-hidden="true" className="spp-peek" style={{ backgroundImage: `url(${menuItems[i + 1].image})` }}>
                      {PEEK_ORDER.map((r, n) => (
                        <i key={n} style={{ '--r': r } as CSSProperties} />
                      ))}
                    </span>
                    <ArrowRight aria-hidden="true" strokeWidth={1.75} />
                  </button>
                ) : (
                  <div data-wf-slot="ending" className="not-prose">
                    <PostSignoff variant={0} />
                    <div className="spp-end">
                      <button type="button" data-wf-control="back to chapters" onClick={backToChapters} className="spp-pill">
                        <ArrowUp aria-hidden="true" strokeWidth={2.25} />
                        Back to chapters
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </article>

      {/* Centred: the post's thinking pixel-me holds bottom-left and the accessibility button bottom-right.
          Portalled to body: .page-enter carries a transform, which pins position:fixed to the page
          instead of the viewport. menuInView starts true, so this never renders on the server. */}
      {!menuInView &&
        createPortal(
          <button
            type="button"
            data-wf-region="back-to-chapters"
            data-mood={mood ?? undefined}
            data-off={nearEnd ? '' : undefined}
            onClick={backToChapters}
            className="spp spp-pill spp-top"
          >
            <ArrowUp aria-hidden="true" strokeWidth={2.25} />
            chapters
          </button>,
          document.body,
        )}
    </div>
  )
}
