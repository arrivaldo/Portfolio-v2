import { useEffect, useRef } from 'react'
import type { Stat } from '../data'
import { gsap, prefersReducedMotion } from '../motion'

/** Counts up to the stat's value the first time it scrolls into view. */
export function Counter({ stat, locale }: { stat: Stat; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current!
    const fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: stat.decimals ?? 0, maximumFractionDigits: stat.decimals ?? 0 })
    const write = (v: number) => (el.textContent = `${stat.prefix ?? ''}${fmt.format(v)}${stat.suffix ?? ''}`)
    if (prefersReducedMotion()) {
      write(stat.value)
      return
    }
    write(0)
    const obj = { v: 0 }
    const tween = gsap.to(obj, {
      v: stat.value,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: () => write(obj.v),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [stat, locale])

  return <span className="stat__value" ref={ref} />
}
