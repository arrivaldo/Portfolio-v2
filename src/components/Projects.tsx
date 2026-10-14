import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { Project } from '../data'
import { Rich, useLang } from '../i18n'
import { gsap, prefersReducedMotion } from '../motion'
import { ArtCanvas } from './ArtCanvas'
import { CaseStudy } from './CaseStudy'
import { ArrowRight } from './Icons'
import { ProjectProof } from './ProjectProof'
import { SectionHead } from './SectionHead'

/**
 * Live backdrops behind the project cut-outs. Pick with ?art=dots|liquid|ambient|ascii|warp|holo|classic.
 * dots: rippling dot field pushed away by the cursor. liquid: aurora blobs, one follows the cursor.
 * ambient: blurred, saturated, slowly turning copy of the image itself (YouTube ambient mode).
 * ascii: the image as code characters, scrambling under the cursor. warp: starfield that jumps to hyperspace on hover.
 * holo: holographic foil that shifts with the cursor angle, image tilts in 3D.
 * Product-shot presentations (CSS only):
 * reflect: studio light cone + mirror reflection on a glossy floor. poster (default, chosen 2026-10-07): solid project colour (arch removed).
 * glass: frosted glass pedestal over vivid blobs, image breaking out of it. sticker: white die-cut outline, tilted.
 * classic: the original glow + dot grid.
 */
const ARTS = ['dots', 'liquid', 'ambient', 'ascii', 'warp', 'holo', 'reflect', 'poster', 'glass', 'sticker', 'classic'] as const
const artParam = new URLSearchParams(window.location.search).get('art')
const art = ARTS.find((a) => a === artParam) ?? 'poster'

/** holo: cursor position (%) for the foil sheen and a small 3D tilt for the image. */
function trackHolo(e: ReactPointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  el.style.setProperty('--mx', `${x * 100}%`)
  el.style.setProperty('--my', `${y * 100}%`)
  el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`)
  el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
}
function resetHolo(e: ReactPointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--ry', '0deg')
  e.currentTarget.style.setProperty('--rx', '0deg')
}

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
            <div
              className={`project__art project__art--${art}`}
              data-reveal-img
              onPointerMove={art === 'holo' ? trackHolo : undefined}
              onPointerLeave={art === 'holo' ? resetHolo : undefined}
            >
              {(art === 'dots' || art === 'liquid' || art === 'ascii' || art === 'warp') && (
                <ArtCanvas mode={art} color={p.glow} image={p.image} />
              )}
              {art === 'holo' && <span className="art-holo" aria-hidden="true" />}
              {art === 'ambient' && <img className="art-ambient" src={p.image} alt="" aria-hidden="true" />}
              <img src={p.image} alt={p.title} loading="lazy" decoding="async" />
              <span className="project__index">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="project__body" data-reveal-stagger>
              <h3 className="project__title">{p.title}</h3>
              <p className="project__summary">{p.summary}</p>
              <div className="project__metric">
                <p>
                  <strong>{p.metric.value}</strong>
                  {p.metric.label}
                </p>
                <ProjectProof project={p} />
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
