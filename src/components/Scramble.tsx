import { useEffect, useLayoutEffect, useRef } from 'react'
import { prefersReducedMotion } from '../motion'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXZ'

type Props = {
  text: string
  /** HTML tags only — React Three Fiber also registers 3D elements in JSX's intrinsic elements. */
  as?: keyof HTMLElementTagNameMap
  className?: string
  /** Scramble whenever this flips to true. */
  play?: boolean
  /** Re-scramble on hover. */
  hover?: boolean
  duration?: number
  delay?: number
}

/** Text that decodes from random glyphs into the real word — made for monospace type. */
export function Scramble({ text, as: Tag = 'span', className, play = true, hover = false, duration = 900, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const frame = useRef(0)

  const run = () => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    cancelAnimationFrame(frame.current)
    const start = performance.now() + delay
    const reveal = [...text].map((_, i) => (i / text.length) * duration * 0.75 + Math.random() * duration * 0.25)

    const tick = (now: number) => {
      const t = now - start
      let done = true
      el.textContent = [...text]
        .map((ch, i) => {
          if (ch === ' ' || t >= reveal[i]) return ch
          done = false
          return GLYPHS[(Math.random() * GLYPHS.length) | 0]
        })
        .join('')
      if (!done) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = text
  }, [text])

  useEffect(() => {
    if (play) run()
    return () => cancelAnimationFrame(frame.current)
  }, [play, text])

  return (
    <Tag className={className} onMouseEnter={hover ? run : undefined}>
      <span className="visually-hidden">{text}</span>
      <span ref={ref} aria-hidden="true" />
    </Tag>
  )
}
