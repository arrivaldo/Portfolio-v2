import type { CSSProperties } from 'react'
import { brands } from '../data'
import { useLang } from '../i18n'

/** "Trusted by" strip: client logos on an endless marquee, each sized to the same visual weight. */
export function Brands() {
  const { t } = useLang()

  return (
    <section className="brands" aria-label={t.ui.brandsLabel}>
      <div className="brands__label">
        <span className="brands__count">{t.ui.brandsCount(brands.length)}</span>
        <p>{t.ui.brandsLabel}</p>
      </div>
      <div className="brands__track">
        {/* Rendered twice for a seamless loop; the copy is hidden from assistive tech. */}
        {[0, 1].map((copy) => (
          <ul key={copy} className="brands__list" aria-hidden={copy === 1}>
            {brands.map((b) => (
              <li key={b.name}>
                {b.badge && <img src={b.badge.logo} alt="" style={{ '--h': b.badge.height } as CSSProperties} loading="lazy" decoding="async" />}
                <img src={b.logo} alt={copy === 0 ? b.name : ''} style={{ '--h': b.height } as CSSProperties} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
