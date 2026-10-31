import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import type { Project } from '../data'
import { Rich, useLang } from '../i18n'
import { hasFinePointer, prefersReducedMotion, scrollToTarget, useSpotlight } from '../motion'
import { Circle } from './Circle'
import { SectionHead } from './SectionHead'
import { ServiceGlyph } from './ServiceGlyph'

const pad = (i: number) => String(i + 1).padStart(2, '0')

/** Projects (t.projects ids) that show each card's service in practice, in card order. */
const PROOF = [
  ['claro360', 'incidents', 'ai-email'],
  ['yalo', 'ai-email'],
  ['munichre', 'yalo'],
  ['apesa', 'munichre'],
  ['yalo', 'incidents'],
  ['munichre'],
]

/** True once the element has scrolled into view. */
function useSeen<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setSeen(true)
      io.disconnect()
    }, { threshold })
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen] as const
}

/** Max card tilt toward the pointer, in degrees. */
const TILT = 6

/** Tilts the hovered card toward the pointer through the `rotate` property, so it never fights the reveal transform. */
function useTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const box = ref.current
    if (!box || !hasFinePointer() || prefersReducedMotion()) return
    let last: HTMLElement | null = null
    const reset = () => {
      if (last) last.style.rotate = ''
      last = null
    }
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('.svc-cube__card')
      if (card !== last) reset()
      if (!card) return
      last = card
      const r = card.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      card.style.rotate = `${-ny} ${nx} 0 ${Math.min(1, Math.hypot(nx, ny)) * TILT}deg`
    }
    box.addEventListener('pointermove', onMove)
    box.addEventListener('pointerleave', reset)
    return () => {
      box.removeEventListener('pointermove', onMove)
      box.removeEventListener('pointerleave', reset)
    }
  }, [ref])
}

/** "Proven in" row: project thumbnails that jump to the project in the Work section. */
function ProofRow({ label, projects }: { label: string; projects: Project[] }) {
  return (
    <div className="svc-proof">
      <span className="svc-proof__label">{label}</span>
      <ul className="svc-proof__list">
        {projects.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="svc-proof__item"
              title={p.title}
              style={{ '--glow': p.glow } as CSSProperties}
              onClick={(e) => {
                e.stopPropagation()
                scrollToTarget(`#project-${p.id}`)
              }}
            >
              <img src={p.image} alt="" loading="lazy" decoding="async" />
              <span>{p.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Extra capability cards, taken from t.roles so both languages stay in sync. */
const extraRoles = ['product-engineer', 'business-architect']

/** Services as neon cards, 3 per row: the four services plus Senior Product Engineer and Business Architect. */
export function Process() {
  const { t } = useLang()
  const [ref, seen] = useSeen<HTMLDivElement>()
  const spot = useSpotlight<HTMLDivElement>('.svc-cube__card')
  useTilt(spot)
  const cards = [
    ...t.process,
    ...extraRoles.flatMap((slug) => {
      const role = t.roles.find((r) => r.slug === slug)
      return role ? [{ title: role.title, text: role.description }] : []
    }),
  ].map((c, i) => ({
    ...c,
    projects: (PROOF[i] ?? []).flatMap((id) => t.projects.filter((p) => p.id === id)),
  }))

  return (
    <section className="process" id="process">
      <Circle size={420} style={{ top: 80, left: -220 }} speed={0.25} depth={30} />
      <SectionHead label={t.ui.processLabel} title={t.ui.processTitle} lead={<Rich text={t.ui.processIntro} />} />
      <div ref={ref} className={`svc-cube${seen ? ' is-in' : ''}`}>
        <div ref={spot} className="svc-cube__grid">
          {cards.map((s, i) => (
            <article key={s.title} className="svc-cube__card" style={{ '--i': i, '--col': (i % 3) - 1 } as CSSProperties}>
              <div className="svc-cube__top">
                <span className="svc-cube__glyph"><ServiceGlyph index={i} /></span>
                <span className="svc-cube__num">{pad(i)}</span>
              </div>
              <div className="svc-cube__body">
                <h3 className="svc-cube__title">{s.title}</h3>
                <p className="svc-cube__text">{s.text}</p>
                <ProofRow label={t.ui.processProof} projects={s.projects} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
