import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Articles } from './components/Articles'
import { Analytics } from '@vercel/analytics/react'
import { Brands } from './components/Brands'
import { Chat } from './components/Chat'
import { Contact } from './components/Contact'
import { Cursor } from './components/Cursor'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Lab } from './components/Lab'
import { Preloader } from './components/Preloader'
import { Process } from './components/Process'
import { Projects } from './components/Projects'
import { ScrollProgress } from './components/ScrollProgress'
import { Testimonials } from './components/Testimonials'
import { Work } from './components/Work'
import { useLang } from './i18n'
import { ScrollTrigger, useIntro, useMagnetic, useParallax, usePauseOffscreen, useReveal, useSmoothScroll } from './motion'
import { Archive } from './components/Archive'

export default function App() {
  const [ready, setReady] = useState(false)
  const { lang, t } = useLang()

  useSmoothScroll(ready)
  useIntro(ready)
  useMagnetic()
  useParallax()
  useReveal()
  usePauseOffscreen()

  // Copy changes alter section heights — re-measure pinned/scrubbed triggers.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang])

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <a className="skip-link" href="#projects">
        {t.ui.skip}
      </a>
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <ScrollProgress />
      <Chat />
      <Analytics />

      <div className="page">
        <main className="frame">
          <Header />
          <Hero />
          <Articles />
          <Brands />
          <Projects />
          <Archive />
          <About />
          <Process />
          <Work />
          <Testimonials />
          <Lab />
          <Contact />
        </main>
      </div>
    </>
  )
}
