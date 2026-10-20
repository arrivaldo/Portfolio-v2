import gsap from 'gsap'

/**
 * The page's motion language (editorial "mask", chosen 2026-10-11 over decode / blur / flip / sweep): letters rise
 * from behind their word's box, and blocks slide in from the side of the screen they sit on ("sides", chosen
 * 2026-10-18 over slide / flip / focus / down / zoom, after the bottom-up rise was dropped). Images are never
 * uncovered, blurred or scanned in, so they never look like they are still loading.
 */

/** Letter-level text entrance: titles, labels and the hero word. */
export function charsIn(chars: HTMLElement[], scale = 1) {
  return gsap.timeline().from(chars, { yPercent: 115, duration: 1.1 * scale, stagger: 0.022 * scale, ease: 'expo.out' })
}

const MEDIA = 'img, canvas, video, .glass, .lab-bento__scene' // the Lab scenes mount their canvas later
const hasMedia = (el: Element) => el.matches(MEDIA) || el.querySelector(MEDIA) !== null

/** Which edge a block is nearer to: -1 left half of the viewport, 1 right half. */
const side = (el: Element) => {
  const r = el.getBoundingClientRect()
  return r.left + r.width / 2 < window.innerWidth / 2 ? -1 : 1
}

/**
 * Block entrance (cards, paragraphs, rows, buttons): slides in from the nearer edge. Opacity, never visibility, so
 * controls stay focusable. Blocks holding media use mediaIn.
 */
export function blockIn(targets: gsap.TweenTarget, stagger = 0) {
  const all = gsap.utils.toArray<Element>(targets)
  const tl = gsap.timeline()
  // Each block gets its own tween so it can measure its side; stagger keeps the original order.
  all.forEach((el, i) => tl.add(hasMedia(el) ? mediaIn(el) : gsap.from(el, { opacity: 0, x: side(el) * 70, duration: 1.1, ease: 'power3.out' }), i * stagger))
  return tl
}

/**
 * List-row entrance (Archive, Experience): each row's top rule draws itself left to right, and the row's cells
 * follow it in, one after another. Rows need `--draw: 1` and a ::before rule scaled by it (see the row CSS).
 */
export function rowsIn(rows: Element[]) {
  const tl = gsap.timeline()
  const gap = Math.min(0.09, 1.2 / Math.max(rows.length, 1)) // long lists still finish in about a second
  rows.forEach((row, i) => {
    tl.from(row, { '--draw': 0, duration: 0.9, ease: 'power3.inOut' }, i * gap)
    tl.from(row.children, { opacity: 0, x: -28, duration: 0.8, stagger: 0.06, ease: 'power3.out' }, i * gap + 0.15)
  })
  return tl
}

/** Media (an image, or a card/box holding one) slides in whole from the nearer edge — no clip, blur or steps. */
export function mediaIn(el: Element) {
  return gsap.timeline().from(el, { opacity: 0, x: side(el) * 90, duration: 1.3, ease: 'power3.out' })
}
