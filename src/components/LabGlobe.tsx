import { useEffect, useRef, useState } from 'react'
import { AmbientLight, BufferGeometry, Color, DirectionalLight, DoubleSide, Mesh, MeshLambertMaterial, PerspectiveCamera, PointLight, Scene, WebGLRenderer, type MeshPhongMaterial, type Object3D } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import ThreeGlobe from 'three-globe'
import countriesUrl from '../assets/globe.json?url'
import { V1_ARCS } from '../assets/globeArcs'
import { isScrolling, prefersReducedMotion, quiet } from '../motion'

// The hex-dot globe from portfolio v1 (components/ui/Globe.tsx + GridGlobe.tsx), rebuilt on plain three.js with
// v1's arcs and settings as they were: same routes, colours, stroke, dash timing and pulsing rings. Navy globe in
// dark (v1's own colour), pale blue in light. Lazy-loaded by the Lab bento; it only renders while on screen.
/** v1 drew from the first two of its three colours. */
const V1_COLORS = ['#06b6d4', '#3b82f6']
const ARC_TIME = 1000
const ARC_LENGTH = 0.9
const CAMERA_Z = 300

type Theme = 'light' | 'dark'

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

/** Country polygons are fetched as a separate, cacheable asset instead of being bundled into the JS. */
/**
 * three-globe draws the hex grid as one mesh — with its own material — per country: ~200 draw calls and shader
 * lookups every frame, which made the page stutter whenever the Lab was on screen. Once it has built them, fold
 * them into a single mesh with one material (same look) and hide the originals. Returns false until they exist.
 */
function mergeHexes(globe: Object3D, color: string, opacity: number) {
  const parts: Mesh[] = []
  globe.traverse((o) => {
    if ((o as { __globeObjType?: string }).__globeObjType === 'hexPolygon' && (o as Mesh).geometry?.getAttribute('position')) parts.push(o as Mesh)
  })
  if (!parts.length) return false
  const merged = new Mesh(
    mergeGeometries(parts.map((m) => m.geometry as BufferGeometry)),
    new MeshLambertMaterial({ color, opacity, transparent: opacity < 1, side: DoubleSide }),
  )
  parts[0].parent!.add(merged)
  parts.forEach((m) => (m.visible = false))
  return true
}

let countries: Promise<{ features: object[] }> | null = null
const loadCountries = () => (countries ??= fetch(countriesUrl).then((r) => r.json()))
/** Lets the Lab fetch the country data ahead of time, together with this chunk. */
export const preloadGlobeData = () => loadCountries()

export default function LabGlobe({ active = true }: { active?: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const loop = useRef<{ start: () => void; stop: () => void } | null>(null)
  const theme = useDocTheme()

  useEffect(() => {
    const el = host.current!
    const dark = theme === 'dark'
    const still = prefersReducedMotion()

    const renderer = new WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // 2× costs ~78% more pixels for no visible gain at this size
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
    el.appendChild(renderer.domElement)

    const scene = new Scene()
    const camera = new PerspectiveCamera(50, 1, 180, 1800)
    scene.add(new AmbientLight(dark ? '#38bdf8' : '#ffffff', dark ? 0.6 : 1.4))
    const left = new DirectionalLight('#ffffff', dark ? 1 : 0.8)
    left.position.set(-400, 100, 400)
    const top = new DirectionalLight('#ffffff', dark ? 1 : 0.8)
    top.position.set(-200, 500, 200)
    const point = new PointLight('#ffffff', 0.8)
    point.position.set(-200, 500, 200)
    scene.add(left, top, point)

    const arcs = V1_ARCS.map(([order, startLat, startLng, endLat, endLng, arcAlt], i) => ({ order, startLat, startLng, endLat, endLng, arcAlt, color: V1_COLORS[i % 2] }))
    // Ring sources: every distinct arc end, fading in its arc's colour (as in v1).
    const rgb = (hex: string) => [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16)).join(', ')
    const ends = arcs
      .flatMap((a) => [
        { lat: a.startLat, lng: a.startLng, color: a.color },
        { lat: a.endLat, lng: a.endLng, color: a.color },
      ])
      .filter((p, i, all) => all.findIndex((q) => q.lat === p.lat && q.lng === p.lng) === i)
    const globe = new ThreeGlobe()
      .showAtmosphere(true)
      .atmosphereColor(dark ? '#ffffff' : '#5ce1ff')
      .atmosphereAltitude(0.1)
      .arcsData(arcs)
      .arcColor('color')
      .arcAltitude('arcAlt')
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(ARC_LENGTH)
      .arcDashInitialGap((d) => (d as { order: number }).order)
      .arcDashGap(15)
      .arcDashAnimateTime(still ? 0 : ARC_TIME)
      .ringColor((d: object) => (t: number) => `rgba(${rgb((d as { color: string }).color)}, ${1 - t})`)
      .ringMaxRadius(3)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(ARC_TIME * ARC_LENGTH)
    const material = globe.globeMaterial() as MeshPhongMaterial
    material.color = new Color(dark ? '#062056' : '#e8f0ff')
    material.emissive = new Color(dark ? '#062056' : '#d6e4ff')
    material.emissiveIntensity = 0.1
    material.shininess = 0.9
    scene.add(globe)
    // Building the hex grid and then merging it are the two long tasks here: each waits for a pause in the scroll.
    let warm = 0
    let alive = true
    loadCountries().then(async (geo) => {
      await quiet()
      if (!alive) return
      globe
        .hexPolygonsData(geo.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .hexPolygonsTransitionDuration(0)
        .hexPolygonColor(() => (dark ? 'rgba(255,255,255,0.7)' : 'rgba(31,122,255,0.55)'))
      // three-globe builds the layer asynchronously: wait for it, merge it, then draw once so the merged material
      // compiles now, while the globe is still offscreen, rather than on its first visible frame.
      let tries = 0
      const settle = async () => {
        await quiet()
        if (!alive) return
        if (mergeHexes(globe, dark ? '#ffffff' : '#1f7aff', dark ? 0.7 : 0.55) || ++tries > 40) renderer.render(scene, camera)
        else warm = window.setTimeout(settle, 100)
      }
      warm = window.setTimeout(settle, 100)
    })
    // Every 2 s a random ~80% of the arc ends pulse, like v1.
    const pulse = () => globe.ringsData(ends.filter(() => Math.random() < 0.8))
    if (!still) pulse()
    const rings = still ? 0 : window.setInterval(pulse, 2000)

    // Same start as v1: camera on +z, facing Europe and Africa, where most of the arcs fly.
    camera.position.set(0, 0, CAMERA_Z)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableZoom = false
    controls.autoRotate = !still
    controls.autoRotateSpeed = 0.6
    controls.minPolarAngle = Math.PI / 3.5
    controls.maxPolarAngle = Math.PI - Math.PI / 3
    // OrbitControls sets touch-action: none; let vertical swipes keep scrolling the page on phones.
    renderer.domElement.style.touchAction = 'pan-y'

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // The render loop runs only while the bento is on screen.
    let raf = 0
    // Frames are skipped while the page scrolls (the globe holds still for a moment) so the scroll stays smooth.
    const frame = () => {
      if (!isScrolling()) {
        controls.update()
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    }
    loop.current = {
      start: () => (raf ||= requestAnimationFrame(frame)),
      stop: () => {
        cancelAnimationFrame(raf)
        raf = 0
      },
    }

    return () => {
      loop.current?.stop()
      loop.current = null
      clearInterval(rings)
      clearTimeout(warm)
      alive = false
      ro.disconnect()
      controls.dispose()
      globe._destructor()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [theme])

  useEffect(() => {
    if (active) loop.current?.start()
    else loop.current?.stop()
  }, [active, theme])

  return <div ref={host} className="lab-globe" />
}
