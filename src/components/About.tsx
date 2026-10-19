import { Rich, useLang } from '../i18n'
import { useSpotlight } from '../motion'
import { Circle } from './Circle'
import { SectionHead } from './SectionHead'
import { Counter } from './Stats'

/** Bento: big photo on the left with the quote overlaid; intro + numbers 2×2 beside it. */
export function About() {
  const { lang, t } = useLang()
  const now = t.jobs[0]
  const locale = lang === 'es' ? 'es-MX' : 'en-US'
  // The quote is laid over the photo on desktop, so it would draw a second ring inside it.
  const spot = useSpotlight<HTMLDivElement>('.bento__tile:not(.bento__quote)')

  return (
    <section className="about" id="about">
      <Circle size={760} style={{ top: 120, right: -330 }} speed={-0.2} depth={20} />

      <SectionHead label={t.ui.aboutLabel} title={t.ui.aboutTitle} lead={<Rich text={t.ui.aboutIntro} />} />

      <div ref={spot} className="bento bento--f" data-reveal-stagger>
        <p className="bento__tile bento__intro">
          <Rich text={t.profile.intro} />
        </p>

        <div className="bento__stats">
          {t.stats.map((s, i) => (
            <div key={s.label} className="bento__tile bento__stat" style={{ gridArea: `s${i + 1}` }}>
              <Counter stat={s} locale={locale} />
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="bento__tile bento__photo" data-reveal-img>
          <img className="about__photo" src="/profile2.webp" alt={t.profile.fullName} />
          <span className="bento__now">
            <i aria-hidden="true" />
            {now.role} · {now.company}
            <small>{t.profile.city}</small>
          </span>
        </div>

        <blockquote className="bento__tile bento__quote">{t.profile.quote}</blockquote>
      </div>
    </section>
  )
}
