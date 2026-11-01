import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { jobAnchor } from '../data'
import { Rich, useLang } from '../i18n'
import { hasFinePointer, prefersReducedMotion, scrollToTarget, useSpotlight } from '../motion'
import { Circle } from './Circle'
import { SectionHead } from './SectionHead'
import { ServiceGlyph } from './ServiceGlyph'

const pad = (i: number) => String(i + 1).padStart(2, '0')

/** Where each card's service shows in practice, in card order: featured projects (t.projects ids) or roles in Experience (company). */
type ProofRef = { project: string } | { job: string }
const PROOF: ProofRef[][] = [
  [{ project: 'incidents' }, { job: 'NEORIS' }, { project: 'claro360' }],
  [{ project: 'yalo' }, { project: 'ai-email' }, { job: 'Casa Médica' }],
  [{ job: 'Casa Médica' }, { project: 'yalo' }, { job: 'Yalo.ai' }],
  [{ project: 'apesa' }, { project: 'munichre' }, { job: 'Rules Cube' }],
  [{ job: 'Casa Médica' }, { job: 'HSBC' }, { job: 'Yalo.ai' }],
  [{ project: 'munichre' }, { job: 'Rules Cube' }, { job: 'APESA Software' }],
]

/** A chip in the "Proven in" row: what it shows and where it scrolls to. */
type ProofItem = { key: string; title: string; image: string; glow: string; target: string }

/** Scrolls to a project or Experience row and briefly highlights it, so the jump is easy to follow. */
function jumpTo(target: string) {
  // Experience rows are short, so leave some of the section above them in view.
  scrollToTarget(target, target.startsWith('#job-') ? -160 : 0)
  const el = document.querySelector(target)
  if (!el) return
  el.classList.remove('is-flash')
  window.setTimeout(() => el.classList.add('is-flash'), 900)
  window.setTimeout(() => el.classList.remove('is-flash'), 3000)
}

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

/** How far the tilt moves toward its target each frame (0–1): low enough to glide, high enough to follow the pointer. */
const EASE = 0.18

/**
 * Tilts the hovered card toward the pointer through the `rotate` property, so it never fights the reveal transform.
 * The angle is eased in a rAF loop rather than by a CSS transition (which would restart on every pointer move), and the
 * pointer is measured against the card's layout box — its on-screen box changes as it tilts, which made the angle jitter.
 */
function useTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const box = ref.current
    if (!box || !hasFinePointer() || prefersReducedMotion()) return
    const state = new Map<HTMLElement, { x: number; y: number; tx: number; ty: number }>()
    let raf = 0
    const tick = () => {
      raf = 0
      state.forEach((s, card) => {
        s.x += (s.tx - s.x) * EASE
        s.y += (s.ty - s.y) * EASE
        const settled = Math.abs(s.tx - s.x) < 0.002 && Math.abs(s.ty - s.y) < 0.002
        if (settled && s.tx === 0 && s.ty === 0) {
          card.style.rotate = ''
          state.delete(card)
          return
        }
        card.style.rotate = `${-s.y} ${s.x} 0 ${Math.min(1, Math.hypot(s.x, s.y)) * TILT}deg`
      })
      if (state.size) raf = requestAnimationFrame(tick)
    }
    const aim = (card: HTMLElement, tx: number, ty: number) => {
      const s = state.get(card) ?? { x: 0, y: 0, tx: 0, ty: 0 }
      s.tx = tx
      s.ty = ty
      state.set(card, s)
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const release = (except?: HTMLElement) => state.forEach((_, card) => card !== except && aim(card, 0, 0))
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('.svc-cube__card')
      release(card ?? undefined)
      const parent = card?.offsetParent
      if (!card || !parent) return
      const p = parent.getBoundingClientRect()
      const nx = ((e.clientX - p.left - card.offsetLeft) / card.offsetWidth) * 2 - 1
      const ny = ((e.clientY - p.top - card.offsetTop) / card.offsetHeight) * 2 - 1
      aim(card, Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)))
    }
    const onLeave = () => release()
    box.addEventListener('pointermove', onMove)
    box.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      box.removeEventListener('pointermove', onMove)
      box.removeEventListener('pointerleave', onLeave)
    }
  }, [ref])
}

/** "Proven in" row: thumbnails that jump to the project in Work or the role in Experience. */
function ProofRow({ label, items }: { label: string; items: ProofItem[] }) {
  return (
    <div className="svc-proof">
      <span className="svc-proof__label">{label}</span>
      <ul className="svc-proof__list">
        {items.map((p) => (
          <li key={p.key}>
            <button
              type="button"
              className="svc-proof__item"
              title={p.title}
              style={{ '--glow': p.glow } as CSSProperties}
              onClick={(e) => {
                e.stopPropagation()
                jumpTo(p.target)
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

/** Services as neon cards, 3 per row. */
export function Process() {
  const { t } = useLang()
  const [ref, seen] = useSeen<HTMLDivElement>()
  const spot = useSpotlight<HTMLDivElement>('.svc-cube__card')
  useTilt(spot)
  const resolve = (ref: ProofRef): ProofItem[] => {
    if ('project' in ref) {
      const p = t.projects.find((x) => x.id === ref.project)
      return p ? [{ key: p.id, title: p.title, image: p.image, glow: p.glow, target: `#project-${p.id}` }] : []
    }
    const j = t.jobs.find((x) => x.company === ref.job)
    return j ? [{ key: j.company, title: j.company, image: j.logo, glow: '#2f6bff', target: `#${jobAnchor(j.company)}` }] : []
  }
  const cards = t.process.map((c, i) => ({ ...c, proof: (PROOF[i] ?? []).flatMap(resolve) }))

  return (
    <section className="process" id="process">
      <Circle size={420} style={{ top: 80, left: -220 }} speed={0.25} depth={30} />
      <SectionHead label={t.ui.processLabel} title={t.ui.processTitle} lead={<Rich text={t.ui.processIntro} />} />
      <div ref={ref} className={`svc-cube${seen ? ' is-in' : ''}`}>
        <div ref={spot} className="svc-cube__grid">
          {cards.map((s, i) => (
            <article key={s.title} className="svc-cube__card" style={{ '--i': i, '--col': (i % 3) - 1 } as CSSProperties}>
              <span className="svc-cube__ring" aria-hidden="true" />
              <div className="svc-cube__top">
                <span className="svc-cube__glyph"><ServiceGlyph index={i} /></span>
                <span className="svc-cube__num">{pad(i)}</span>
              </div>
              <div className="svc-cube__body">
                <h3 className="svc-cube__title">{s.title}</h3>
                <p className="svc-cube__text">{s.text}</p>
                <ProofRow label={t.ui.processProof} items={s.proof} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
