import { Rich, useLang } from '../i18n'
import { Circle } from './Circle'
import { SectionHead } from './SectionHead'
import { Counter } from './Stats'

/**
 * Bento layouts under comparison (same tiles, different grid). Pick with ?bento=a|b|c|d.
 * A: intro + numbers beside a wide photo, quote band, skills 2×2.
 * B: portrait photo on the left, numbers in one row, skills in four columns.
 * C: magazine spread — skills stacked left, photo + intro + quote centre, numbers stacked right.
 * D: tall photo with a "now" badge, intro + one numbers strip beside it,
 *    numbered skill columns with chips, quote as the closing band.
 * E: tall portrait on the right; intro, numbers row and skills 2×2 on the left; accent quote band.
 * F (default, chosen 2026-10-07): big photo on the left with the quote overlaid; intro + numbers 2×2 beside it.
 * Skill tiles removed 2026-10-07 (the k1–k4 areas in the other variants' CSS are now unused).
 */
const param = new URLSearchParams(window.location.search).get('bento')
const variant = ['a', 'b', 'c', 'd', 'e'].includes(param ?? '') ? param : 'f'

export function About() {
  const { lang, t } = useLang()
  const now = t.jobs[0]
  const locale = lang === 'es' ? 'es-MX' : 'en-US'

  return (
    <section className="about" id="about">
      <Circle size={760} style={{ top: 120, right: -330 }} speed={-0.2} depth={20} />

      <SectionHead label={t.ui.aboutLabel} title={t.ui.aboutTitle} lead={<Rich text={t.ui.aboutIntro} />} />

      <div className={`bento bento--${variant}`} data-reveal-stagger>
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

        <div className="bento__tile bento__photo">
          <img className="about__photo" src="/profile.webp" alt={t.profile.fullName} />
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
