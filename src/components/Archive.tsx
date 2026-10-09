import { useEffect, useRef, useState } from 'react'
import { socials } from '../data'
import { useLang } from '../i18n'
import { gsap, hasFinePointer, prefersReducedMotion } from '../motion'
import { ArrowUpRight } from './Icons'
import { SectionHead } from './SectionHead'

/** Compact list of smaller projects, its own page section, framed like a project card. */
export function Archive() {
  const { t } = useLang()
  const github = socials.find((s) => s.id === 'github')!.href
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)
  const preview = useRef<HTMLDivElement>(null)

  // Same floating card as Experience: trails the cursor and slides to the hovered project's image.
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
    <section className="archive-section" id="archive">
      <SectionHead
        label={t.ui.archiveLabel}
        title={t.ui.archiveTitle}
        aside={
          <a href={github} target="_blank" rel="noreferrer" className="archive__all" data-magnetic="0.2">
            {t.ui.viewAll}
            <ArrowUpRight size={14} />
          </a>
        }
      />
      <div className="archive">
        <ul className="archive__list" data-reveal-stagger onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
          {t.archive.map((p, i) => (
            <li key={p.name} onPointerEnter={() => setActive(i)}>
              <a href={p.href} target="_blank" rel="noreferrer" className="archive__row" data-cursor={t.ui.viewCase}>
                <span className="archive__name">
                  {p.name}
                  <small>{p.tagline}</small>
                </span>
                <span className="archive__desc">{p.description}</span>
                <span className="archive__stack">{p.stack.join(' · ')}</span>
                <ArrowUpRight size={18} className="archive__arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className={`work-preview${hovering ? ' is-visible' : ''}`} ref={preview} aria-hidden="true">
        <div className="work-preview__inner">
          <div className="work-preview__stack" style={{ transform: `translateY(${-active * 100}%)` }}>
            {t.archive.map((p) => (
              <div key={p.name} className="archive-preview__slide">
                <img src={p.image} alt="" loading="lazy" />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
