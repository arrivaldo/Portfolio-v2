import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Step } from '../data'
import { Rich, useLang } from '../i18n'
import { useSpotlight } from '../motion'
import { Circle } from './Circle'
import { SectionHead } from './SectionHead'

const pad = (i: number) => String(i + 1).padStart(2, '0')

/** A few tags read as a summary; a long row of them read as noise. */
const MAX_TAGS = 3

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

/** Extra capability cards, taken from t.roles so both languages stay in sync. */
const extraRoles = ['product-engineer', 'business-architect']

/** Services as cards, 3 per row: the four services plus Senior Product Engineer and Business Architect. */
export function Process() {
  const { t } = useLang()
  const [ref, seen] = useSeen<HTMLDivElement>()
  const spot = useSpotlight<HTMLDivElement>('.svc-cube__card')
  const cards: Step[] = [
    ...t.process,
    ...extraRoles.flatMap((slug) => {
      const role = t.roles.find((r) => r.slug === slug)
      return role ? [{ title: role.title, text: role.description, tags: role.stack.slice(0, 5) }] : []
    }),
  ]

  return (
    <section className="process" id="process">
      <Circle size={420} style={{ top: 80, left: -220 }} speed={0.25} depth={30} />
      <SectionHead label={t.ui.processLabel} title={t.ui.processTitle} lead={<Rich text={t.ui.processIntro} />} />
      <div ref={ref} className={`svc-cube${seen ? ' is-in' : ''}`}>
        <div ref={spot} className="svc-cube__grid">
          {cards.map((s, i) => (
            <article key={s.title} className="svc-cube__card" style={{ '--i': i, '--col': (i % 3) - 1 } as CSSProperties}>
              <span className="services__num">{pad(i)}</span>
              <h3 className="svc-cube__title">{s.title}</h3>
              <p className="svc-cube__text">{s.text}</p>
              <ul className="services__tags">
                {s.tags.slice(0, MAX_TAGS).map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
