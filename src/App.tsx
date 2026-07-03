import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { Header } from './components/header'
import { PageWipe } from './components/page-wipe'
import Landing from './routes/index'
import BlogIndex from './routes/blog/index'
import BlogPost from './routes/blog/post'
import PortfolioIndex from './routes/portfolio/index'
import ProjectPage from './routes/portfolio/project'
import ResearchIndex from './routes/research/index'
import PaperPage from './routes/research/paper'
import NotFound from './routes/not-found'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <>
      <Header />
      <PageWipe />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/portfolio" element={<PortfolioIndex />} />
        <Route path="/portfolio/:slug" element={<ProjectPage />} />
        <Route path="/research" element={<ResearchIndex />} />
        <Route path="/research/:slug" element={<PaperPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
