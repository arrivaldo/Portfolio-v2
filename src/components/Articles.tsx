import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { Article } from '../data'
import { useLang } from '../i18n'
import { hasFinePointer, prefersReducedMotion } from '../motion'
import { GlassShape } from './GlassShape'
import { ArrowLeft, ArrowRight } from './Icons'

const AUTOPLAY_MS = 5000

type CardProps = { article: Article; variant: 'main' | 'side' }

function ArticleCard({ article, variant }: CardProps) {
  const { t } = useLang()
  const media = useRef<HTMLDivElement>(null)
  const side = variant === 'side'

  // 3D tilt of the glass cover following the cursor.
  const onTilt = (e: PointerEvent<HTMLDivElement>) => {
    if (!hasFinePointer() || prefersReducedMotion()) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    media.current!.style.setProperty('--rx', `${-y * 14}deg`)
    media.current!.style.setProperty('--ry', `${x * 18}deg`)
    media.current!.style.setProperty('--gx', `${(x + 0.5) * 100}%`)
    media.current!.style.setProperty('--gy', `${(y + 0.5) * 100}%`)
  }
  const resetTilt = () => {
    media.current?.style.setProperty('--rx', '0deg')
    media.current?.style.setProperty('--ry', '0deg')
  }

  return (
    <article className={`card card--${variant}`} aria-hidden={side}>
      {!side && (
        <div className="card__media" onPointerMove={onTilt} onPointerLeave={resetTilt}>
          <div className="card__tilt" ref={media}>
            <GlassShape variant={article.id - 1} />
            <span className="card__glare" />
          </div>
        </div>
      )}
      <div className="card__body">
        <span className="card__meta">
          {article.tag} · {article.meta}
        </span>
        <h3 className="card__title">{article.title}</h3>
        <p className="card__text">{article.description}</p>
        <div className="card__actions">
          <a href={article.href} className="card__more" tabIndex={side ? -1 : 0}>
            {t.ui.readMore}
          </a>
          <a href={article.href} className="round round--light round--sm" tabIndex={side ? -1 : 0} aria-label={t.ui.readArticle}>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </article>
  )
}

export function Articles() {
  const { t } = useLang()
  const { articles } = t
  const [index, setIndex] = useState(0)
  // Which way the cards travel, so the enter animation matches the move.
  const [dir, setDir] = useState<'left' | 'right'>('right')
  const [paused, setPaused] = useState(false)
  // Explicit user stop (WCAG 2.2.2): autoplay stays off until they press play again.
  const [stopped, setStopped] = useState(false)
  const total = articles.length
  const at = (offset: number) => articles[(index + offset + total) % total]
  const prev = () => {
    setDir('right')
    setIndex((i) => (i - 1 + total) % total)
  }
  const next = () => {
    setDir('left')
    setIndex((i) => (i + 1) % total)
  }
  const dragStart = useRef<number | null>(null)

  // Autoplay: every few seconds the cards slide left to right. Restarts after any manual move.
  useEffect(() => {
    if (paused || stopped || prefersReducedMotion()) return
    const id = window.setTimeout(() => {
      if (!document.hidden) prev()
    }, AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [index, paused, stopped])

  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as Element).closest('a, button')) return
    dragStart.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (dragStart.current === null) return
    const dx = e.clientX - dragStart.current
    dragStart.current = null
    if (dx > 50) prev()
    else if (dx < -50) next()
  }

  return (
    <section className="articles-section" id="articles">
      <div
        className="articles"
        data-dir={dir}
        aria-roledescription="carousel"
        data-cursor="Drag"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prev()
          if (e.key === 'ArrowRight') next()
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (dragStart.current = null)}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="articles__side articles__side--left">
          <ArticleCard key={`prev-${index}`} article={at(-1)} variant="side" />
        </div>
        <ArticleCard key={`main-${index}`} article={at(0)} variant="main" />
        <div className="articles__side articles__side--right">
          <ArticleCard key={`next-${index}`} article={at(1)} variant="side" />
        </div>

        <button className="round round--ghost articles__nav articles__nav--prev" onClick={prev} aria-label={t.ui.prevArticle}>
          <ArrowLeft />
        </button>
        <button className="round round--ghost articles__nav articles__nav--next" onClick={next} aria-label={t.ui.nextArticle}>
          <ArrowRight />
        </button>
        <button
          className="articles__toggle"
          onClick={() => setStopped((s) => !s)}
          aria-label={stopped ? t.ui.playCarousel : t.ui.pauseCarousel}
          aria-pressed={stopped}
        >
          {stopped ? '▶' : '❚❚'}
        </button>
      </div>
    </section>
  )
}
