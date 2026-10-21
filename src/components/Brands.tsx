import { useEffect, useRef, type CSSProperties } from 'react'
import { brands } from '../data'
import { useLang } from '../i18n'
import { prefersReducedMotion } from '../motion'

/** One full lap of the list, in seconds (the old CSS marquee speed). */
const LAP_S = 108
/** How fast a fling loses speed: fraction of velocity kept per second. */
const FRICTION = 0.04

/**
 * Endless marquee that can also be dragged (mouse or touch) and flung with inertia.
 * Drives both copies' transforms from one rAF loop; pauses when off screen or under a resting mouse.
 */
function useDragMarquee() {
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = track.current!
    // Reduced motion: no autoplay; the CSS turns the strip into a plain horizontal scroller instead.
    if (prefersReducedMotion()) return
    const lists = Array.from(el.querySelectorAll<HTMLElement>('.brands__list'))
    let x = 0
    let v = 0 // fling velocity, px/s
    let hover = false
    let drag: { id: number; last: number; t: number; moved: boolean } | null = null
    let raf = 0
    let prev = 0

    const render = () => {
      const w = lists[0].offsetWidth
      if (w) x = ((x % w) - w) % w // keep x in (-w, 0] so the copy always covers the gap
      for (const l of lists) l.style.transform = `translate3d(${x}px, 0, 0)`
    }
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      if (!drag) {
        const auto = hover ? 0 : lists[0].offsetWidth / LAP_S
        x += (v - auto) * dt
        v *= Math.pow(FRICTION, dt)
        if (Math.abs(v) < 1) v = 0
      }
      render()
      raf = requestAnimationFrame(tick)
    }
    const start = () => {
      if (raf) return
      prev = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return
      drag = { id: e.pointerId, last: e.clientX, t: e.timeStamp, moved: false }
      v = 0
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.last
      if (!drag.moved && Math.abs(dx) < 3) return
      if (!drag.moved) {
        drag.moved = true
        el.setPointerCapture(e.pointerId)
        el.classList.add('is-dragging')
      }
      const dt = Math.max((e.timeStamp - drag.t) / 1000, 1 / 240)
      x += dx
      v = v * 0.2 + (dx / dt) * 0.8 // smoothed so one jittery event doesn't decide the fling
      drag.last = e.clientX
      drag.t = e.timeStamp
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      // Released after holding still: no fling.
      if (e.timeStamp - drag.t > 80) v = 0
      if (!drag.moved) v = 0
      drag = null
      el.classList.remove('is-dragging')
    }
    const enter = (e: PointerEvent) => e.pointerType === 'mouse' && (hover = true)
    const leave = (e: PointerEvent) => e.pointerType === 'mouse' && (hover = false)

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    io.observe(el)

    return () => {
      stop()
      io.disconnect()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  return track
}

/** "Trusted by" strip: client logos on an endless, draggable marquee, each sized to the same visual weight. */
export function Brands() {
  const { t } = useLang()
  const track = useDragMarquee()

  return (
    <section className="brands" aria-label={t.ui.brandsLabel} data-reveal-stagger data-reveal-start="top bottom">
      <div className="brands__label">
        <span className="brands__count">{t.ui.brandsCount(brands.length)}</span>
        <p>{t.ui.brandsLabel}</p>
      </div>
      <div className="brands__track" ref={track} data-cursor="Drag">
        {/* Rendered twice for a seamless loop; the copy is hidden from assistive tech. */}
        {[0, 1].map((copy) => (
          <ul key={copy} className="brands__list" aria-hidden={copy === 1}>
            {brands.map((b) => (
              <li key={b.name}>
                {b.badge && <img src={b.badge.logo} alt="" style={{ '--h': b.badge.height } as CSSProperties} loading="lazy" decoding="async" draggable={false} />}
                <img src={b.logo} alt={copy === 0 ? b.name : ''} style={{ '--h': b.height } as CSSProperties} loading="lazy" decoding="async" draggable={false} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
