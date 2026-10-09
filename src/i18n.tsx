import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { content, type Content, type Lang } from './data'

const STORAGE_KEY = 'lang'

type LangState = { lang: Lang; setLang: (l: Lang) => void; t: Content }

const LangContext = createContext<LangState | null>(null)

function getInitialLang(): Lang {
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
