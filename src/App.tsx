import { Routes, Route } from 'react-router-dom'
import { Header } from './components/header'
import Landing from './routes/index'
import BlogIndex from './routes/blog/index'
import BlogPost from './routes/blog/post'
import PortfolioIndex from './routes/portfolio/index'
import ProjectPage from './routes/portfolio/project'
import ResearchIndex from './routes/research/index'
import PaperPage from './routes/research/paper'
import NotFound from './routes/not-found'

export default function App() {
  return (
    <>
      <Header />
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
