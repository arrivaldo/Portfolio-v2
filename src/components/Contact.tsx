import { useEffect, useState } from 'react'
import { socials } from '../data'
import { Rich, useLang } from '../i18n'
import { Circle } from './Circle'
import { ContactForm } from './ContactForm'
import { ArrowUpRight, Download, SocialIcon } from './Icons'
import { SectionHead } from './SectionHead'

function LocalTime({ timeZone, lang }: { timeZone: string; lang: string }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(now)
  return <time dateTime={now.toISOString()}>{time}</time>
}

export function Contact() {
  const { lang, t } = useLang()
  const { profile } = t
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <>
      <section className="contact" id="contact">
        <Circle size={520} style={{ top: -120, right: -200 }} speed={-0.2} depth={40} />
        <SectionHead label={t.ui.contactLabel} title={t.ui.contactTitle.join(' ')} lead={<Rich text={t.ui.contactIntro} />} />

        <div className="contact__row">
          <a href={`mailto:${profile.email}`} className="contact__cta" data-reveal data-magnetic="0.3" data-cursor="Hi!">
            <span>{t.ui.contactCta}</span>
            <ArrowUpRight size={28} />
          </a>

          <div className="contact__info" data-reveal-stagger>
            <p className="contact__text">{t.ui.contactText}</p>
            <p className="contact__available">
              <span className="contact__dot" aria-hidden="true" />
              {profile.status}
            </p>
            <div className="contact__email">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <button className="contact__copy" onClick={copy} data-magnetic="0.3">
                {copied ? t.ui.copied : t.ui.copy}
              </button>
              <a href={profile.resume} className="contact__copy" download data-magnetic="0.3">
                {t.ui.resume} <Download size={12} />
              </a>
              <span className="visually-hidden" aria-live="polite">
                {copied ? t.ui.copied : ''}
              </span>
            </div>
            <ul className="contact__socials">
              {socials.filter((s) => s.id !== 'email').map((s) => (
                <li key={s.id}>
                  <a className="social" href={s.href} target={s.id === 'email' ? undefined : '_blank'} rel="noreferrer" data-magnetic="0.25">
                    <SocialIcon id={s.id} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ContactForm />
      </section>

      <footer className="footer" data-reveal-stagger>
        <span>
          © {new Date().getFullYear()} {profile.fullName}. {t.ui.rights}.
        </span>
        <span className="footer__time">
          {t.ui.localTime} · {profile.city} <LocalTime timeZone={profile.timeZone} lang={lang} />
        </span>
        <a href="#top" className="footer__top" data-magnetic="0.4">
          {t.ui.backToTop} ↑
        </a>
      </footer>
    </>
  )
}
