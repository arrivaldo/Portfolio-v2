import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { content, type Content, type Lang } from './data'

const STORAGE_KEY = 'lang'

type LangState = { lang: Lang; setLang: (l: Lang) => void; t: Content }

const LangContext = createContext<LangState | null>(null)

/** Each language has its own URL: "/" is English, "/es" Spanish (es/index.html carries the Spanish meta tags). */
const isSpanishPath = () => /^\/es\/?$/.test(location.pathname)
const pathFor = (lang: Lang) => (lang === 'es' ? '/es' : '/')

function getInitialLang(): Lang {
  // index.html already moved a Spanish visitor from "/" to "/es", so the URL is the answer; the rest is a fallback.
  if (isSpanishPath()) return 'es'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch {
    // storage unavailable — fall back to browser language
  }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang)
  const t = content[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
    // Keep the address bar and canonical URL on this language's page, so a shared link opens in the same language.
    const path = pathFor(lang)
    if ((location.pathname.replace(/\/+$/, '') || '/') !== path) history.replaceState(null, '', path + location.search + location.hash)
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = new URL(path, canonical.href).href
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [lang, t])

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}

/** Renders `*text*` as <em> and `\n` as a line break. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line.split('*').map((part, j) => (j % 2 ? <em key={j}>{part}</em> : part))}
        </span>
      ))}
    </>
  )
}
