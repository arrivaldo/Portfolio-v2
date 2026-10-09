import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../motion'

export type ArtMode = 'dots' | 'liquid' | 'ascii' | 'warp'

const RAMP = ' .:-=+*#%@'
const NOISE = '01<>/{}[];=+*'

const toRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Live backdrop behind a project cut-out, in the project's colour. Reacts to the cursor
 * and only animates while on screen.
 * dots: a dot field that ripples and gets pushed away by the cursor.
 * liquid: slow aurora blobs plus one that follows the cursor (blurred in CSS).
 * ascii: the project image itself, enlarged, rendered as code characters that flicker and scramble under the cursor.
 * warp: a starfield flying at the viewer that jumps to hyperspace on hover.
 */
export function ArtCanvas({ mode, color, image }: { mode: ArtMode; color: string; image?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const host = canvas.parentElement!
    const [r, g, b] = toRgb(color)
    // Partner hues for the aurora: the same channels rotated.
    const palette = [
      [r, g, b],
      [b, r, g],
      [Math.min(255, r + 70), Math.min(255, g + 70), Math.min(255, b + 70)],
    ]
    const still = prefersReducedMotion()
    const mouse = { x: 0, y: 0, k: 0, on: false }
    let w = 0
    let h = 0
    let raf = 0
    let visible = false

    const resize = () => {
      const rect = host.getBoundingClientRect()
      // The aurora is blurred anyway, so it renders at a fraction of the size.
      const scale = mode === 'liquid' ? 0.4 : Math.min(devicePixelRatio, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * scale))
      canvas.height = Math.max(1, Math.round(h * scale))
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      if (mode === 'ascii') buildAscii()
      if (still || !visible) draw(performance.now())
    }

    const drawDots = (t: number) => {
      const gap = 16
      const radius = 120
      const cx = w / 2
      const cy = h * 0.45
      const maxD = Math.hypot(cx, cy)
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const wave = Math.sin(x * 0.018 + t * 0.0011) + Math.cos(y * 0.024 - t * 0.0009)
          let px = x
          let py = y + wave * 2.5
          let near = 0
          if (mouse.k > 0.01) {
            const dx = px - mouse.x
            const dy = py - mouse.y
            const d = Math.hypot(dx, dy)
            if (d < radius && d > 0.001) {
              near = (1 - d / radius) ** 2 * mouse.k
              px += (dx / d) * near * 28
              py += (dy / d) * near * 28
            }
          }
          const centre = 1 - Math.hypot(x - cx, y - cy) / maxD
          const alpha = 0.06 + centre * 0.32 + (wave + 2) * 0.03 + near * 0.6
          const size = 0.9 + (wave + 2) * 0.18 + near * 2.2
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(alpha, 0.95)})`
          ctx.beginPath()
          ctx.arc(px, py, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const blob = (x: number, y: number, rad: number, [cr, cg, cb]: number[], a: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rad)
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`)
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
      ctx.fillStyle = grad
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2)
    }

    const drawLiquid = (t: number) => {
      const s = t * 0.00025
      const base = Math.min(w, h)
      ctx.globalCompositeOperation = 'lighter'
      blob(w * (0.35 + Math.sin(s * 1.3) * 0.18), h * (0.4 + Math.cos(s * 1.1) * 0.2), base * 0.55, palette[0], 0.5)
      blob(w * (0.65 + Math.cos(s * 0.9) * 0.2), h * (0.55 + Math.sin(s * 1.4) * 0.18), base * 0.5, palette[1], 0.38)
      blob(w * (0.5 + Math.sin(s * 1.7 + 2) * 0.25), h * (0.7 + Math.cos(s * 0.8 + 1) * 0.15), base * 0.4, palette[2], 0.28)
      if (mouse.k > 0.01) blob(mouse.x, mouse.y, base * 0.35, palette[2], 0.45 * mouse.k)
      ctx.globalCompositeOperation = 'source-over'
    }

    // ---- ascii: the image sampled into a character grid (density = alpha × luminance).
    const CW = 8
    const CH = 12
    const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono').trim() || 'monospace'
    let cols = 0
    let rows = 0
    let density = new Float32Array(0)
    const img = new Image()
    let imgReady = false

    const buildAscii = () => {
      if (!imgReady || !w || !h) return
      cols = Math.ceil(w / CW)
      rows = Math.ceil(h / CH)
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const octx = off.getContext('2d', { willReadFrequently: true })!
      // 'contain' fit, enlarged so the echo peeks out around the real cut-out.
      const fit = Math.min(w / img.naturalWidth, h / img.naturalHeight) * 1.3
      const dw = (img.naturalWidth * fit) / CW
      const dh = (img.naturalHeight * fit) / CH
      octx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh)
      const data = octx.getImageData(0, 0, cols, rows).data
      density = new Float32Array(cols * rows)
      for (let i = 0; i < density.length; i++) {
        const lum = (data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11) / 255
        density[i] = (data[i * 4 + 3] / 255) * (0.35 + lum * 0.65)
      }
    }

    let lastAscii = -1e9
    const drawAscii = (t: number) => {
      ctx.font = `11px ${mono}`
      ctx.textBaseline = 'top'
      const radius = 80
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const d = density[row * cols + col]
          const x = col * CW
          const y = row * CH
          // Stable pseudo-random per cell, so the empty area is a faint, fixed field of code.
          const seed = Math.abs(Math.sin(col * 12.9898 + row * 78.233)) % 1
          let near = 0
          if (mouse.k > 0.01) {
            const dist = Math.hypot(x - mouse.x, y - mouse.y)
            if (dist < radius) near = (1 - dist / radius) * mouse.k
          }
          let ch: string
          let alpha: number
          if (d > 0.04) {
            ch = RAMP[Math.min(RAMP.length - 1, Math.ceil(d * (RAMP.length - 1)))]
            alpha = 0.18 + d * 0.55
          } else if (seed < 0.3) {
            ch = NOISE[Math.floor(seed * 1000) % NOISE.length]
            alpha = 0.07
          } else if (near > 0.2) {
            ch = '.'
            alpha = 0
          } else continue
          if (Math.random() < 0.015 || near > 0.15) ch = NOISE[Math.floor(Math.random() * NOISE.length)]
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(alpha + near * 0.75, 1)})`
          ctx.fillText(ch, x, y)
        }
      }
      lastAscii = t
    }

    // ---- warp: stars in perspective; z goes 1 → 0 towards the viewer.
    const stars = Array.from({ length: 240 }, () => ({ x: 0, y: 0, z: Math.random(), pz: 0 }))
    const resetStar = (s: (typeof stars)[number], z = 1) => {
      s.x = Math.random() * 2 - 1
      s.y = Math.random() * 2 - 1
      s.z = z
      s.pz = z
    }
    stars.forEach((s) => resetStar(s, 0.05 + Math.random() * 0.95))

    const drawWarp = (moving: boolean) => {
      const cx = w / 2
      const cy = h * 0.45
      const speed = 0.0025 + mouse.k * 0.028
      ctx.lineCap = 'round'
      for (const s of stars) {
        s.pz = s.z
        if (moving) s.z -= speed
        if (s.z <= 0.02) resetStar(s)
        const sx = cx + (s.x / s.z) * cx * 0.5
        const sy = cy + (s.y / s.z) * cy * 0.5
        const px = cx + (s.x / s.pz) * cx * 0.5
        const py = cy + (s.y / s.pz) * cy * 0.5
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) {
          resetStar(s)
          continue
        }
        const near = 1 - s.z
        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(0.15 + near * 0.85, 1)})`
        ctx.lineWidth = 0.6 + near * 2
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx + 0.1, sy + 0.1)
        ctx.stroke()
      }
    }

    function draw(t: number, moving = false) {
      if (mode === 'ascii' && t - lastAscii < 70 && moving) return
      ctx.clearRect(0, 0, w, h)
      if (mode === 'dots') drawDots(t)
      else if (mode === 'liquid') drawLiquid(t)
      else if (mode === 'ascii') drawAscii(t)
      else drawWarp(moving)
    }

    if (mode === 'ascii' && image) {
      img.onload = () => {
        imgReady = true
        buildAscii()
        draw(performance.now())
      }
      img.src = image
    }

    const loop = (t: number) => {
      mouse.k += ((mouse.on ? 1 : 0) - mouse.k) * 0.08
      draw(t, true)
      raf = visible ? requestAnimationFrame(loop) : 0
    }

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.on = true
    }
    const onLeave = () => {
      mouse.on = false
    }

    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (still) return () => ro.disconnect()

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(loop)
    })
    io.observe(host)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [mode, color, image])

  return <canvas ref={ref} className="art-canvas" aria-hidden="true" />
}
