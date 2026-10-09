import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { prefersReducedMotion } from './motion'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // storage unavailable — fall back to system preference
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  /** Switches theme with a circular reveal expanding from the click point (View Transitions API). */
  const toggle = (origin?: { clientX: number; clientY: number }) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    const apply = () => {
      flushSync(() => setTheme(next))
      root.dataset.theme = next
    }

    if (!document.startViewTransition || prefersReducedMotion()) {
      apply()
      return
    }

    const x = origin?.clientX ?? innerWidth / 2
    const y = origin?.clientY ?? innerHeight / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    root.classList.add('theme-switching')
    const transition = document.startViewTransition(apply)
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.7, 0, .25, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    transition.finished.finally(() => root.classList.remove('theme-switching'))
  }

  return { theme, toggle }
}
