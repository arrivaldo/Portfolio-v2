import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Dev-only helper to compare the saved hero title fonts. Not rendered in production builds.
 * Remove it (and the extra families in index.html) once a font is chosen.
 */
const options = [
  { name: 'Syne', family: "'Syne'", style: 'normal' },
  { name: 'Sora', family: "'Sora'", style: 'italic' },
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans'", style: 'italic' },
  { name: 'Instrument Sans', family: "'Instrument Sans'", style: 'italic' },
  { name: 'Archivo Expanded', family: "'Archivo'", style: 'italic', stretch: '125%', size: 'clamp(38px, 7.6vw, 92px)' },
]

// Production only ships the chosen face (index.html); the candidates load here, in dev.
const CANDIDATES =
  'https://fonts.googleapis.com/css2?family=Syne:wght@600&family=Sora:wght@600&family=Instrument+Sans:ital,wght@1,600&family=Archivo:ital,wdth,wght@1,125,600&display=swap'

export function FontPicker() {
  const [active, setActive] = useState(2)

  useEffect(() => {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: CANDIDATES })
    document.head.append(link)
    return () => link.remove()
  }, [])

  useEffect(() => {
    const o = options[active]
    const root = document.documentElement.style
    root.setProperty('--display', `${o.family}, system-ui, sans-serif`)
    root.setProperty('--display-style', o.style)
    root.setProperty('--display-weight', '600')
    root.setProperty('--display-stretch', o.stretch ?? '100%')
    root.setProperty('--display-size', o.size ?? 'clamp(44px, 8.8vw, 88px)')
  }, [active])

  // Portaled to <body> so no transformed ancestor can trap the fixed bar.
  return createPortal(
    <div className="font-picker" role="radiogroup" aria-label="Hero title font">
      {options.map((o, i) => (
        <button key={o.name} type="button" role="radio" aria-checked={i === active} className={i === active ? 'is-active' : ''} onClick={() => setActive(i)}>
          {i + 1}. {o.name}
        </button>
      ))}
    </div>,
    document.body,
  )
}
