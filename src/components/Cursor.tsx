import { useEffect, useRef } from 'react'
import { gsap, hasFinePointer, prefersReducedMotion } from '../motion'

/**
 * Custom cursor: a dot plus a trailing ring. The ring grows over links/buttons
 * and turns into a labelled disc over elements with `data-cursor="Label"`.
 *
 * A modal <dialog> renders in the browser's top layer, above any z-index, so while one is open the cursor is moved
 * inside it (and back when it closes). Living in the dialog also keeps its difference blend working on the panel.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return
    const root = document.documentElement
    const ringEl = ring.current!
    const dotEl = dot.current!
    root.classList.add('has-cursor')

    const ringX = gsap.quickTo(ringEl, 'x', { duration: 0.45, ease: 'power3' })
    const ringY = gsap.quickTo(ringEl, 'y', { duration: 0.45, ease: 'power3' })
    const dotX = gsap.quickTo(dotEl, 'x', { duration: 0.08, ease: 'power3' })
    const dotY = gsap.quickTo(dotEl, 'y', { duration: 0.08, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      ringX(e.clientX)
      ringY(e.clientY)
      dotX(e.clientX)
      dotY(e.clientY)
      ringEl.classList.add('is-visible')
      dotEl.classList.add('is-visible')

      const target = e.target as Element
      const labelled = target.closest?.<HTMLElement>('[data-cursor]')
      const interactive = target.closest?.('a, button, [role="button"]')
      ringEl.classList.toggle('is-label', !!labelled)
      ringEl.classList.toggle('is-hover', !labelled && !!interactive)
      dotEl.classList.toggle('is-hidden', !!labelled)
      if (labelled) label.current!.textContent = labelled.dataset.cursor ?? ''
    }
    const onLeave = () => {
      ringEl.classList.remove('is-visible')
      dotEl.classList.remove('is-visible')
    }
    const onDown = () => ringEl.classList.add('is-down')
    const onUp = () => ringEl.classList.remove('is-down')

    // Follow modal dialogs: whichever is open hosts the cursor; with none open it goes back home.
    const layerEl = layer.current!
    const home = layerEl.parentElement!
    const host = () => {
      const open = document.querySelector('dialog[open]')
      const target = open ?? home
      if (layerEl.parentElement !== target) target.appendChild(layerEl)
    }
    const mo = new MutationObserver(host)
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })

    window.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      root.classList.remove('has-cursor')
      mo.disconnect()
      if (layerEl.parentElement !== home) home.appendChild(layerEl)
      window.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    // display: contents, so the wrapper adds no box; it only lets the pair move into a dialog as one node.
    <div className="cursor-layer" ref={layer} style={{ display: 'contents' }}>
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span className="cursor-ring__label" ref={label} />
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </div>
  )
}
