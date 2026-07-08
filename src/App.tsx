import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { Header } from './components/header'
import { PageWipe } from './components/page-wipe'
import GrainShader from './components/react-bits/GrainShader'
import Landing from './routes/index'
import BlogIndex from './routes/blog/index'
import BlogPost from './routes/blog/post'
import PortfolioIndex from './routes/portfolio/index'
import ResearchIndex from './routes/research/index'
import StackPage from './routes/stack/index'
import NotFound from './routes/not-found'
import { SiteFooter } from './components/site-footer'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <>
      {/* landing is a self-contained dark cover with its own nav; header rides every other page */}
      {pathname !== '/' && <Header />}
      <PageWipe />
      <GrainShader />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/portfolio" element={<PortfolioIndex />} />
        <Route path="/research" element={<ResearchIndex />} />
        <Route path="/stack" element={<StackPage />} />
        <Route path="/stack/editorial" element={<StackPage />} />
        <Route path="/stack/graph" element={<StackPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* universal footer; /stack carries its own colophon (editorial) or runs immersive (graph) */}
      {!pathname.startsWith('/stack') && <SiteFooter />}
    </>
  )
}
