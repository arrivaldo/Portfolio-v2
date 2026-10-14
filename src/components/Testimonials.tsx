import type { Testimonial } from '../data'
import { Rich, useLang } from '../i18n'
import { SectionHead } from './SectionHead'

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

function Row({ items, reverse }: { items: Testimonial[]; reverse?: boolean }) {
  return (
    <div className={`marquee${reverse ? ' marquee--reverse' : ''}`} data-reveal>
      {/* The list is rendered twice so the loop is seamless; the copy is hidden from assistive tech. */}
      {[0, 1].map((copy) => (
        <ul key={copy} className="marquee__list" aria-hidden={copy === 1}>
          {items.map((item) => (
            <li key={item.name} className="quote">
              <p className="quote__text">“{item.quote}”</p>
              <div className="quote__author">
                {item.photo ? (
                  <img className="quote__avatar" src={item.photo} alt="" loading="lazy" />
                ) : (
                  <span className="quote__avatar">{initials(item.name)}</span>
                )}
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.role}</small>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

export function Testimonials() {
  const { t } = useLang()
  const half = Math.ceil(t.testimonials.length / 2)

  return (
    <section className="testimonials">
      <SectionHead label={t.ui.testimonialsLabel} title={t.ui.testimonialsTitle} lead={<Rich text={t.ui.testimonialsIntro} />} />
      <Row items={t.testimonials.slice(0, half)} />
      <Row items={t.testimonials.slice(half)} reverse />
    </section>
  )
}
