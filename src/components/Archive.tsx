import { useEffect, useRef, useState } from 'react'
import { socials } from '../data'
import { useLang } from '../i18n'
import { gsap, hasFinePointer, prefersReducedMotion } from '../motion'
import { CaseStudy, type CaseData } from './CaseStudy'
import { ArrowRight, ArrowUpRight } from './Icons'
import { SectionHead } from './SectionHead'

/** On mobile only the first MOBILE_LIMIT rows show until "View more" is tapped. */
const MOBILE_LIMIT = 10

/** Compact list of smaller projects, its own page section, framed like a project card. A row opens the same case-study modal as the featured projects. */
export function Archive() {
  const { t } = useLang()
  const github = socials.find((s) => s.id === 'github')!.href
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [open, setOpen] = useState<CaseData | null>(null)
  const [expanded, setExpanded] = useState(false)
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
        <ul className={`archive__list${expanded ? ' is-expanded' : ''}`} id="archive-list" data-reveal-stagger onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
          {t.archive.map((p, i) => (
            <li key={p.name} className={i >= MOBILE_LIMIT ? 'archive__extra' : undefined} onPointerEnter={() => setActive(i)}>
              <button
                type="button"
                className="archive__row"
                data-cursor={t.ui.viewCase}
                onClick={() => setOpen({ title: p.name, kicker: p.tagline, image: p.image, glow: p.glow, href: p.href, stack: p.stack, story: p.story })}
              >
                <span className="archive__name">
                  {p.name}
                  <small>{p.tagline}</small>
                </span>
                <span className="archive__desc">{p.description}</span>
                <span className="archive__stack">{p.stack.join(' · ')}</span>
                <ArrowUpRight size={18} className="archive__arrow" />
              </button>
            </li>
          ))}
        </ul>
        {t.archive.length > MOBILE_LIMIT && (
          <button type="button" className={`archive__more${expanded ? ' is-open' : ''}`} onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} aria-controls="archive-list">
            {expanded ? t.ui.showLess : t.ui.showMore}
            <ArrowRight size={16} />
          </button>
        )}
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

      <CaseStudy project={open} onClose={() => setOpen(null)} />
    </section>
  )
}
