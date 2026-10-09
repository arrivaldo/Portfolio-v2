import type { Lang } from '../data'
import { useLang } from '../i18n'
import { useTheme } from '../useTheme'
import { Download, Moon, Sun } from './Icons'
import { Logo } from './Logo'
import { Scramble } from './Scramble'

const languages: { id: Lang; label: string }[] = [
  { id: 'en', label: 'En' },
  { id: 'es', label: 'Es' },
]

export function Header() {
  const { lang, setLang, t } = useLang()
  const { theme, toggle } = useTheme()
  const nextTheme = t.ui.themes[theme === 'dark' ? 'light' : 'dark']

  return (
    <header className="header" id="top">
      <a href="#top" className="header__name" aria-label={`${t.profile.firstName} ${t.profile.lastName}`} data-magnetic="0.3">
        <Logo />
      </a>

      <nav className="nav" aria-label="Main">
        {t.nav.map((link) => (
          <a key={link.href} href={link.href}>
            <Scramble text={link.label} play={false} hover duration={500} />
          </a>
        ))}
      </nav>

      <div className="header__end">
        <a href={t.profile.resume} className="resume-link" download data-magnetic="0.3">
          {t.ui.resume}
          <Download />
        </a>
        <button
          className="round theme-toggle"
          onClick={(e) => toggle(e)}
          aria-label={t.ui.switchTo(nextTheme)}
          title={t.ui.switchTo(nextTheme)}
          data-magnetic="0.4"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>

        <div className="lang">
          {languages.map((l) => (
            <button key={l.id} className={l.id === lang ? 'is-active' : ''} onClick={() => setLang(l.id)} aria-pressed={l.id === lang}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
