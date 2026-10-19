import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Lang } from '../data'
import { useLang } from '../i18n'
import { pauseScroll, resumeScroll, scrollToTarget } from '../motion'
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
  const [open, setOpen] = useState(false)
  // Where the toggle sits, so the menu's close button lands exactly on top of it.
  const [spot, setSpot] = useState<DOMRect | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  // Scroll only after the menu has closed and released the page scroll.
  const go = (e: MouseEvent, href: string) => {
    e.preventDefault()
    setOpen(false)
    requestAnimationFrame(() => scrollToTarget(href))
  }
  const openMenu = () => (setSpot(toggleRef.current!.getBoundingClientRect()), setOpen(true))

  // Mobile menu: freezes the page behind it and closes on Escape or when the screen grows to desktop.
  useEffect(() => {
    if (!open) return
    pauseScroll()
    document.documentElement.classList.add('menu-open')
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const desktop = matchMedia('(min-width: 861px)')
    const onResize = () => desktop.matches && setOpen(false)
    addEventListener('keydown', onKey)
    desktop.addEventListener('change', onResize)
    return () => {
      resumeScroll()
      document.documentElement.classList.remove('menu-open')
      removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onResize)
    }
  }, [open])

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

        <button ref={toggleRef} className="round menu-toggle" onClick={openMenu} aria-label={t.ui.menu.open} aria-expanded={open} aria-controls="mobile-menu">
          <i />
          <i />
          <i />
        </button>
      </div>

      {open &&
        createPortal(
          <div id="mobile-menu" className="menu" role="dialog" aria-modal="true" aria-label={t.ui.menu.open}>
            <button
              className="round menu-toggle is-open"
              onClick={() => setOpen(false)}
              aria-label={t.ui.menu.close}
              style={spot ? { position: 'fixed', top: spot.top, left: spot.left } : undefined}
              autoFocus
            >
              <i />
              <i />
              <i />
            </button>
            <nav aria-label="Mobile">
              {t.nav.map((link, i) => (
                <a key={link.href} href={link.href} onClick={(e) => go(e, link.href)} style={{ '--i': i } as CSSProperties}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="menu__foot">
              <a href={t.profile.resume} className="menu__resume" download>
                {t.ui.resume}
                <Download />
              </a>
              <div className="menu__lang">
                {languages.map((l) => (
                  <button key={l.id} className={l.id === lang ? 'is-active' : ''} onClick={() => setLang(l.id)} aria-pressed={l.id === lang}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  )
}
