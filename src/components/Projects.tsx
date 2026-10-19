import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { Project } from '../data'
import { Rich, useLang } from '../i18n'
import { gsap, prefersReducedMotion } from '../motion'
import { CaseStudy } from './CaseStudy'
import { ArrowRight } from './Icons'
import { ProjectProof } from './ProjectProof'
import { SectionHead } from './SectionHead'

/**
 * Recent projects as a sticky stack: each card pins near the top and the next one
 * slides over it, while the cards underneath shrink and dim. Followed by a compact archive.
 */
export function Projects() {
  const { t } = useLang()
  const list = useRef<HTMLDivElement>(null)
  const total = t.projects.length
  const [open, setOpen] = useState<Project | null>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 861px)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.project', list.current)
      cards.slice(0, -1).forEach((card, i) => {
        gsap.to(card, {
          scale: 0.9 + i * 0.02,
          '--shade': 0.55,
          ease: 'none',
          scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top top+=120', scrub: true },
        })
      })
    })
    return () => mm.revert()
  }, [total])

  return (
    <section className="projects" id="projects">
      <SectionHead label={t.ui.projectsLabel} title={t.ui.projectsTitle} lead={<Rich text={t.ui.projectsIntro} />} />

      <div className="projects__list" ref={list}>
        {t.projects.map((p, i) => (
          <article key={p.id} className="project" style={{ '--i': i, '--glow': p.glow } as CSSProperties}>
            <div className="project__art project__art--poster" data-reveal-img>
              <img src={p.image} alt={p.title} loading="lazy" decoding="async" />
              <span className="project__index">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="project__body" data-reveal-stagger>
              {p.client && (
                <p className="project__client">
                  <span>{t.ui.clientWork}</span> via {p.client.via} · {p.client.role} · {p.client.period}
                </p>
              )}
              <h3 className="project__title">{p.title}</h3>
              <p className="project__summary">{p.summary}</p>
              <div className="project__metric">
                <strong>{p.metric.value}</strong>
                <ProjectProof project={p} />
                <p>{p.metric.label}</p>
              </div>
              <div className="project__foot">
                <ul className="project__stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <button type="button" className="project__open" onClick={() => setOpen(p)} data-magnetic="0.2">
                  {t.ui.story.open}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <span className="project__shade" aria-hidden="true" />
          </article>
        ))}
      </div>

      <CaseStudy project={open} onClose={() => setOpen(null)} />
    </section>
  )
}
