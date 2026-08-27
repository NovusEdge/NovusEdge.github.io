import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { Header } from './components/header'
import GrainShader from './components/react-bits/GrainShader'
import Landing from './routes/index'
import AboutPage from './routes/about/index'
import BlogIndex from './routes/blog/index'
import BlogPost from './routes/blog/post'
import PortfolioIndex from './routes/portfolio/index'
import ProjectPage from './routes/portfolio/project'
import ResearchIndex from './routes/research/index'
import StackPage from './routes/stack/index'
import BlipsPage from './routes/blips/index'
import NotFound from './routes/not-found'
import { SiteFooter } from './components/site-footer'
import { AccessibilityPanel } from './components/accessibility-panel'
import ClickSpark from './components/react-bits/ClickSpark'
import { DEFAULT_LOCALE, PREFIXED_LOCALES, stripLocale, type Locale } from './i18n/paths'
import { LocaleContext } from './i18n/context'
import { i18nFor } from './i18n'
import { headState } from './lib/meta'

function LocaleTree({ locale }: { locale: Locale }) {
  const { pathname } = useLocation()
  const bare = stripLocale(pathname)

  // the prerender pass reads headState after render and writes lang onto <html>
  headState.lang = locale.htmlLang

  // block body, not an implicit-return arrow: a browser that patches scrollTo to
  // return a Promise (Brave, smooth-scroll extensions) would otherwise feed it to
  // React as the effect cleanup, and StrictMode's teardown throws "destroy is not a function".
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.documentElement.lang = locale.htmlLang
  }, [locale.htmlLang])

  // Hanzi has no coverage in the four base families, and a CJK face is far too large to
  // load for the four locales that never render one
  useEffect(() => {
    if (locale.code !== 'zh') return
    const id = 'noto-sans-sc'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap'
    document.head.appendChild(link)
  }, [locale.code])

  // remount + replay the fade-up per route; collapse /stack so its sub-views keep their own slide
  const key = bare.startsWith('/stack') ? '/stack' : pathname

  return (
    <I18nextProvider i18n={i18nFor(locale.code)}>
      <LocaleContext value={locale}>
        {/* landing is a self-contained dark cover with its own nav; header rides every other page */}
        {bare !== '/' && <Header />}
        <GrainShader />
        <div key={key} className="page-enter">
          {/* nested Routes match against the remainder of the parent path, so these are relative */}
          <Routes>
            <Route path="" element={<Landing />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="blog" element={<BlogIndex />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="portfolio" element={<PortfolioIndex />} />
            <Route path="portfolio/:slug" element={<ProjectPage />} />
            <Route path="research" element={<ResearchIndex />} />
            <Route path="stack" element={<StackPage />} />
            <Route path="stack/editorial" element={<StackPage />} />
            <Route path="stack/graph" element={<StackPage />} />
            <Route path="blips" element={<BlipsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {/* universal footer; /stack carries its own colophon (editorial) or runs immersive (graph) */}
        {!bare.startsWith('/stack') && <SiteFooter />}
        <AccessibilityPanel />
      </LocaleContext>
    </I18nextProvider>
  )
}

export default function App() {
  return (
    <ClickSpark sparkColor="#d4a03c" sparkCount={12} sparkSize={12} sparkRadius={20} extraScale={1.2}>
      <Routes>
        {PREFIXED_LOCALES.map((l) => (
          <Route key={l.code} path={`${l.code}/*`} element={<LocaleTree locale={l} />} />
        ))}
        <Route path="/*" element={<LocaleTree locale={DEFAULT_LOCALE} />} />
      </Routes>
    </ClickSpark>
  )
}
