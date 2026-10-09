import { socials } from '../data'
import { Rich, useLang } from '../i18n'
import { ArrowRight, SocialIcon } from './Icons'
import { RotatingWord } from './RotatingWord'

export function Hero() {
  const { t } = useLang()

  return (
    <section className="hero">
      <span className="circle-wrap" style={{ width: 200, height: 200, top: -110, right: -30 }} aria-hidden="true">
        <span className="circle" />
      </span>
      <span className="circle-wrap" style={{ width: 260, height: 260, top: 330, left: -120 }} aria-hidden="true">
        <span className="circle" />
      </span>

      <div className="hero__row">
        <h1 className="hero__title" aria-label={`${t.profile.role[0].join(' / ')} ${t.profile.role[1]}`}>
          <RotatingWord words={t.profile.role[0]} />
        </h1>
        <div className="cta">
          <a href="#projects" className="cta__pill">
            {t.ui.projects}
          </a>
          <a href="#projects" className="round round--light" aria-label={t.ui.projects}>
            <ArrowRight />
          </a>
        </div>
      </div>

      <div className="hero__row hero__row--bottom">
        <p className="hero__goal">
          <Rich text={t.profile.goal} />
        </p>
        <p className="hero__title" aria-hidden="true">
          {t.profile.role[1]}
        </p>
      </div>

      <ul className="socials">
        {socials.map((s) => (
          <li key={s.id}>
            <a className="social" href={s.href} target={s.id === 'email' ? undefined : '_blank'} rel="noreferrer">
              <SocialIcon id={s.id} />
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
