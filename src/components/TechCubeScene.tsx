import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { prefersReducedMotion, useScrolling } from '../motion'

/**
 * Ported from v1 (components/ui/TechCubeScene.tsx) and re-skinned with v2's system: monochrome materials
 * that follow the light/dark theme, the header's "E/" monogram on the faces, and electric-blue accents.
 * Built on plain three.js like LabGlobe — it used to sit on react-three-fiber + drei + postprocessing, which
 * added ~90 KB gzipped for one small scene. Loaded lazily; the Lab warms it offscreen after the intro
 * (see warmScenes in LabBento).
 */

type Theme = 'dark' | 'light'

/** Electric blue, the Lab's accent (the user asked for it on the cube and the globe, 2026-10-09). */
export const ELECTRIC = ['#5ce1ff', '#1f7aff', '#2d4bff']

/** Scene palette per theme, taken from the tokens in index.css. */
const PALETTE = {
  dark: {
    shell: '#0a0f1f',
    edge: '#5ce1ff',
    bracket: '#5ce1ff',
    bracketGlow: 0.7,
    ringOpacity: 0.2,
    platform: '#1a1a1a',
    platformEdge: '#3b3b3b',
    shadow: 0.6,
    ink: '#f1f1f1',
    ambient: 0.35,
    light: 2,
    bloom: true,
    sparkles: true,
  },
  light: {
    shell: '#f7f7f5',
    edge: '#1f7aff',
    bracket: '#1f7aff',
    bracketGlow: 0,
    ringOpacity: 0.28,
    platform: '#e6e6e3',
    platformEdge: '#bbbbbb',
    shadow: 0.3,
    ink: '#141414',
    ambient: 0.9,
    light: 0.8,
    bloom: false,
    sparkles: false,
  },
} as const

type Palette = (typeof PALETTE)[Theme]

/** Follows `data-theme` on <html>, which useTheme toggles. */
function useDocTheme(): Theme {
  const read = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  const [theme, setTheme] = useState(read)
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(read()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return theme
}

function easeOutBack(x: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/** Exponential smoothing toward a target that doesn't depend on frame rate (same as THREE.MathUtils.damp). */
const damp = THREE.MathUtils.damp

/** The header monogram (Logo.tsx paths, 44×44 space) painted onto a texture. */
function monogramTexture(p: Palette, theme: Theme) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  ctx.scale(512 / 44, 512 / 44)
  if (theme === 'dark') {
    ctx.shadowColor = '#1f7aff'
    ctx.shadowBlur = 2
  }
  ctx.strokeStyle = p.ink
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(22, 22, 21.25, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = p.ink
  ctx.fill(new Path2D('M11 12h12v4h-8v4h7v4h-7v4h8v4H11z'))
  const grad = ctx.createLinearGradient(25.5, 32, 35.5, 12)
  ELECTRIC.forEach((c, i) => grad.addColorStop(i / 2, c))
  ctx.fillStyle = grad
  ctx.fill(new Path2D('M25.5 32l6-20h4l-6 20z'))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Soft radial blob: the shadow under the platform and the sparkle sprite. */
function radialTexture(stops: [number, string][]) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  stops.forEach(([at, color]) => g.addColorStop(at, color))
  x.fillStyle = g
  x.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

/** A box with its outline (drei's <Edges> was EdgesGeometry + lines too). */
function outlinedBox(size: [number, number, number], material: THREE.Material, edge: string) {
  const geo = new THREE.BoxGeometry(...size)
  const mesh = new THREE.Mesh(geo, material)
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 15), new THREE.LineBasicMaterial({ color: edge }))
  lines.scale.setScalar(1.001)
  mesh.add(lines)
  return mesh
}

/** One per side face, so the mark is always visible while the cube turns. */
const SIDE_FACES: { position: [number, number, number]; rotationY: number }[] = [
  { position: [0, 0, 0.96], rotationY: 0 },
  { position: [0.96, 0, 0], rotationY: Math.PI / 2 },
  { position: [0, 0, -0.96], rotationY: Math.PI },
  { position: [-0.96, 0, 0], rotationY: -Math.PI / 2 },
]

const SPIN_DURATION = 1.3
/** Matched against screenshots of the R3F version: there the cube filled ~72% of the width it does at v1's distance. */
const CAMERA_PULLBACK = 1.38
const CUBE = 1.9
const SPARKLES = 14

type Ring = { pivot: THREE.Group; dots: THREE.Mesh[]; radius: number; speed: number }

function orbitalRing(radius: number, speed: number, count: number, p: Palette): Ring {
  const pivot = new THREE.Group()
  pivot.rotation.x = Math.PI / 2.4
  pivot.add(new THREE.Mesh(new THREE.TorusGeometry(radius, 0.005, 8, 96), new THREE.MeshBasicMaterial({ color: p.edge, transparent: true, opacity: p.ringOpacity, toneMapped: false })))
  const dotGeo = new THREE.SphereGeometry(0.035, 12, 12)
  const dots = Array.from({ length: count }, (_, i) => {
    const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: ELECTRIC[i % ELECTRIC.length], toneMapped: false }))
    pivot.add(dot)
    return dot
  })
  return { pivot, dots, radius, speed }
}

export default function TechCubeScene({
  revealed = true,
  active = true,
  spinTrigger,
  onReady,
}: {
  revealed?: boolean
  /** Pauses rendering while the section is off screen. */
  active?: boolean
  spinTrigger?: number
  /** First frame is drawn (shaders compiled). */
  onReady?: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const theme = useDocTheme()
  // Holds still while the page scrolls, so the scroll gets the whole frame budget.
  const scrolling = useScrolling()
  // Props the render loop reads every frame, kept in refs so the scene isn't rebuilt when they change.
  const live = useRef({ revealed, running: active && !scrolling, spinTrigger: spinTrigger ?? 0, onReady })
  live.current.revealed = revealed
  live.current.running = active && !scrolling
  live.current.spinTrigger = spinTrigger ?? 0
  live.current.onReady = onReady
  const wake = useRef<() => void>(() => {})

  useEffect(() => {
    const el = host.current!
    const p = PALETTE[theme]
    const still = prefersReducedMotion()
    const disposables: { dispose: () => void }[] = []
    const track = <T extends { dispose: () => void }>(d: T) => (disposables.push(d), d)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping // react-three-fiber's default, which the palette was tuned under
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    // Same direction as v1's camera (6, 4, 7.6), pulled back so the cube sits at the size it had under react-three-fiber.
    camera.position.set(6, 4, 7.6).multiplyScalar(CAMERA_PULLBACK)

    // Local lighting instead of an HDR environment: no download from a third-party CDN to wait on.
    scene.add(new THREE.AmbientLight('#ffffff', p.ambient))
    const sun = new THREE.DirectionalLight('#ffffff', 0.6)
    sun.position.set(3, 5, 2)
    const spot = new THREE.SpotLight('#ffffff', 2 * p.light, 6, 0.3, 0.45, 2)
    spot.position.set(-1.8, 2.6, 1.5)
    spot.target.position.set(0, -0.97, 0)
    const back = new THREE.DirectionalLight('#ffffff', 0.35 * p.light)
    back.position.set(-4, 2, -3)
    scene.add(sun, spot, spot.target, new THREE.HemisphereLight('#ffffff', p.platform, p.ambient), back)

    // Assembly: everything scales in together when the Lab is revealed.
    const rig = new THREE.Group()
    rig.scale.setScalar(0.0001)
    scene.add(rig)

    // The cube, its corner brackets, monograms, a point light and the platform share one group so they turn together.
    const cube = new THREE.Group()
    rig.add(cube)
    const shell = outlinedBox([CUBE, CUBE, CUBE], new THREE.MeshStandardMaterial({ color: p.shell, transparent: true, opacity: 0.9, roughness: 0.35, metalness: 0.1 }), p.edge)
    cube.add(shell)
    const bracketGeo = new THREE.BoxGeometry(0.11, 0.11, 0.11)
    const bracketMat = new THREE.MeshStandardMaterial({ color: p.bracket, emissive: p.bracket, emissiveIntensity: p.bracketGlow, roughness: 0.4, metalness: 0.5 })
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const b = new THREE.Mesh(bracketGeo, bracketMat)
      b.position.set((sx * CUBE) / 2, (sy * CUBE) / 2, (sz * CUBE) / 2)
      cube.add(b)
    }
    const mono = track(monogramTexture(p, theme))
    const monoGeo = new THREE.PlaneGeometry(1.25, 1.25)
    const monoMat = new THREE.MeshBasicMaterial({ map: mono, transparent: true, toneMapped: false, depthWrite: false })
    for (const f of SIDE_FACES) {
      const m = new THREE.Mesh(monoGeo, monoMat)
      m.position.set(...f.position)
      m.rotation.y = f.rotationY
      cube.add(m)
    }
    const glow = new THREE.PointLight('#ffffff', p.light, 6)
    cube.add(glow)
    const platform = new THREE.Group()
    platform.position.y = -1.05
    const platformMat = new THREE.MeshStandardMaterial({ color: p.platform, roughness: 0.6, metalness: 0.2 })
    const top = outlinedBox([2.05, 0.16, 2.05], platformMat, p.platformEdge)
    const base = outlinedBox([2.55, 0.14, 2.55], platformMat, p.platformEdge)
    base.position.y = -0.22
    platform.add(top, base)
    cube.add(platform)

    const rings = [orbitalRing(2.0, 0.3, 3, p), orbitalRing(2.35, -0.2, 2, p)]
    rings.forEach((r) => rig.add(r.pivot))

    // Soft shadow under the platform: a radial gradient on a plane (a real contact shadow re-rendered the scene each frame).
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 4.6),
      new THREE.MeshBasicMaterial({ map: track(radialTexture([[0, 'rgba(0,0,0,1)'], [0.45, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']])), transparent: true, opacity: p.shadow, depthWrite: false, toneMapped: false }),
    )
    shadow.position.y = -1.36
    shadow.rotation.x = -Math.PI / 2
    rig.add(shadow)

    // Sparkles (dark only): a few drifting glints around the cube.
    let sparkles: THREE.Points | null = null
    const seeds = Array.from({ length: SPARKLES }, () => [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() * Math.PI * 2])
    if (p.sparkles && !still) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKLES * 3), 3))
      sparkles = new THREE.Points(
        geo,
        new THREE.PointsMaterial({ color: '#5ce1ff', size: 0.06, map: track(radialTexture([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']])), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
      )
      scene.add(sparkles)
    }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.autoRotate = !still
    controls.autoRotateSpeed = 1
    controls.rotateSpeed = 0.6
    controls.minPolarAngle = Math.PI / 3.4
    controls.maxPolarAngle = Math.PI / 1.85
    // OrbitControls claims every touch; let a vertical swipe still scroll the page on phones.
    renderer.domElement.style.touchAction = 'pan-y'

    let composer: EffectComposer | null = null
    if (p.bloom) {
      composer = new EffectComposer(renderer)
      composer.addPass(new RenderPass(scene, camera))
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.25, 0.15, 0.75))
      composer.addPass(new OutputPass())
    }

    const resize = () => {
      const w = el.clientWidth || 1
      const h = el.clientHeight || 1
      renderer.setSize(w, h, false)
      composer?.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // Hovering the cube speeds it up and brightens its light, as the R3F version did through pointer events.
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let hovered = false
    const onPointer = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      hovered = ray.intersectObject(shell, false).length > 0
    }
    const onLeave = () => (hovered = false)
    renderer.domElement.addEventListener('pointermove', onPointer)
    renderer.domElement.addEventListener('pointerleave', onLeave)

    const clock = new THREE.Clock()
    let progress = still ? 1 : 0
    let lastSpin = live.current.spinTrigger
    const spin = { active: false, t: 0, prev: 0 }

    const frame = (delta: number) => {
      const t = clock.elapsedTime
      if (live.current.revealed && progress < 1) progress = Math.min(1, progress + delta / 0.9)
      rig.scale.setScalar(Math.max(0.0001, easeOutBack(progress)))

      if (live.current.spinTrigger !== lastSpin) {
        lastSpin = live.current.spinTrigger
        Object.assign(spin, { active: true, t: 0, prev: 0 })
      }
      cube.rotation.x = damp(cube.rotation.x, 0, 4, delta)
      if (!still) cube.rotation.y += delta * (hovered ? 0.6 : 0.25)
      if (spin.active) {
        spin.t += delta
        const k = Math.min(spin.t / SPIN_DURATION, 1)
        const eased = 1 - Math.pow(1 - k, 3)
        cube.rotation.y += (eased - spin.prev) * Math.PI * 4
        spin.prev = eased
        if (k >= 1) spin.active = false
      }
      glow.intensity = (hovered ? 2 : 1) * p.light

      for (const r of rings) {
        r.dots.forEach((d, i) => {
          const a = t * r.speed + (i / r.dots.length) * Math.PI * 2
          d.position.set(Math.cos(a) * r.radius, 0, Math.sin(a) * r.radius)
        })
      }
      if (sparkles) {
        const pos = sparkles.geometry.getAttribute('position') as THREE.BufferAttribute
        seeds.forEach(([x, y, z, phase], i) => pos.setXYZ(i, x * 3.4 + Math.sin(t * 0.3 + phase) * 0.15, y * 3.4 + Math.sin(t * 0.45 + phase) * 0.2, z * 3.4))
        pos.needsUpdate = true
      }
      controls.update(delta)
      if (composer) composer.render(delta)
      else renderer.render(scene, camera)
    }

    let raf = 0
    const loop = () => {
      raf = 0
      const delta = Math.min(clock.getDelta(), 0.1)
      if (!live.current.running) return
      frame(delta)
      raf = requestAnimationFrame(loop)
    }
    // Restarted from outside when the section comes back on screen or the scroll stops.
    wake.current = () => {
      if (raf || !live.current.running) return
      clock.getDelta()
      raf = requestAnimationFrame(loop)
    }

    // The Lab mounts the cube offscreen ahead of time with its loop paused; draw one frame anyway so every shader
    // (bloom included) compiles now rather than on the first visible frame.
    const first = requestAnimationFrame(() => {
      frame(0)
      live.current.onReady?.()
      wake.current()
    })

    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(raf)
      wake.current = () => {}
      ro.disconnect()
      renderer.domElement.removeEventListener('pointermove', onPointer)
      renderer.domElement.removeEventListener('pointerleave', onLeave)
      controls.dispose()
      composer?.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        ;(Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose())
      })
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [theme])

  useEffect(() => wake.current(), [active, scrolling])

  return <div ref={host} style={{ width: '100%', height: '100%' }} />
}
