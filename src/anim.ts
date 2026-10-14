import gsap from 'gsap'

/**
 * The page's motion language (editorial "mask", chosen 2026-10-11 over decode / blur / flip / sweep): letters rise
 * from behind their word's box, text blocks are uncovered bottom-up, and anything holding an image moves in whole —
 * images are never uncovered, blurred or scanned in, so they never look like they are still loading.
 */

/** Letter-level text entrance: titles, labels and the hero word. */
export function charsIn(chars: HTMLElement[], scale = 1) {
  return gsap.timeline().from(chars, { yPercent: 115, duration: 1.1 * scale, stagger: 0.022 * scale, ease: 'expo.out' })
}

const MEDIA = 'img, canvas, video, .glass, .lab-bento__scene' // the Lab scenes mount their canvas later
const hasMedia = (el: Element) => el.matches(MEDIA) || el.querySelector(MEDIA) !== null

/**
 * Block entrance (cards, paragraphs, rows, buttons). Opacity, never visibility, so controls stay focusable.
 * Text blocks are uncovered bottom-up as they rise; blocks holding media enter whole (mediaIn).
 */
export function blockIn(targets: gsap.TweenTarget, stagger = 0) {
  const all = gsap.utils.toArray<Element>(targets)
  const text = all.filter((el) => !hasMedia(el))
  const tl = gsap.timeline()
  if (text.length) tl.from(text, { clipPath: 'inset(100% 0% 0% 0%)', y: 50, duration: 1.2, stagger, ease: 'expo.out', clearProps: 'clipPath' }, 0)
  // Keep the stagger order across both groups.
  all.forEach((el, i) => hasMedia(el) && tl.add(mediaIn(el), i * stagger))
  return tl
}

/** Media (an image, or a card/box holding one) rises in whole — no clip, blur or steps. */
export function mediaIn(el: Element) {
  return gsap.timeline().from(el, { y: 70, opacity: 0, duration: 1.3, ease: 'expo.out' })
}
