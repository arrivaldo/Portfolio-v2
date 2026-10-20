import { useEffect, useRef, useState } from 'react'
import { Rich, useLang } from '../i18n'
import { gsap, hasFinePointer, prefersReducedMotion } from '../motion'
import { SectionHead } from './SectionHead'

/** Stable 7-char "commit hash" per company, so each role reads like an entry in git log. */
const hash = (text: string) => {
  let h = 2166136261
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

export function Work() {
  const { t } = useLang()
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)
  const preview = useRef<HTMLDivElement>(null)

  // Floating card with the company logo and highlights that trails the cursor while hovering the list.
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return
    const el = preview.current!
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })
    const onMove = (e: PointerEvent) => {
      x(e.clientX)
      y(e.clientY)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <section className="work" id="experience">
      <SectionHead label={t.ui.workLabel} title={t.ui.workTitle} lead={<Rich text={t.ui.workIntro} />} />

      <ul className="work__list" data-reveal-rows=".work__row" onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
        {t.jobs.map((job, i) => (
          <li key={job.company} className={`work__row${i === active ? ' is-active' : ''}`} onPointerEnter={() => setActive(i)}>
            <div className="work__period">
              {job.period}
              <small>{hash(job.company)}</small>
            </div>
            <div className="work__company">
              <img src={job.logo} alt="" className="work__logo" loading="lazy" />
              {job.company}
            </div>
            <div className="work__role">{job.role}</div>
            {/* Phones have no hover preview, so the highlights sit in the row. */}
            {job.highlights.length > 0 && (
              <ul className="work__highlights">
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <footer className="work__total" data-reveal>
        <span className="work__build">
          <span aria-hidden="true">✓</span> {t.ui.build}
        </span>
        <br />
        {t.ui.workTotal}
        <br />
        <em>{t.profile.years}</em>
      </footer>

      <div className={`work-preview${hovering ? ' is-visible' : ''}`} ref={preview} aria-hidden="true">
        <div className="work-preview__inner">
          <div className="work-preview__stack" style={{ transform: `translateY(${-active * 100}%)` }}>
            {t.jobs.map((job) => (
              <div key={job.company} className="work-preview__slide">
                <div className="work-preview__head">
                  <img src={job.logo} alt="" />
                  <span>
                    <strong>{job.company}</strong>
                    {job.role}
                  </span>
                </div>
                <ul>
                  {job.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
