import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/* Archive scenes in the Software Agency language: low-poly space props + a themed hero object + a tilted device
   with the real project on screen. One scene per URL hash; window.render() → transparent webp data URL. */

const W = 1500
const H = 1000

const PROJECTS = {
  queuestack: { glow: '#22c3e6', shot: 'queuestack.webp', url: 'marketplace.visualstudio.com', hero: checklist },
  heimdall: { glow: '#8b7cff', shot: 'heimdall.png', url: 'heimdall.yalochat.com', hero: shield },
  mernblog: { glow: '#4d7cff', shot: 'mernblog.webp', url: 'github.com/arrivaldo/Blog-app', hero: bucket },
  webtemplate: { glow: '#ff8a3d', shot: 'webtemplate.webp', url: 'npmjs.com/package/webtemplate-js', hero: packageBox },
  notes: { glow: '#3ddc84', shot: 'notes.png', url: 'quicknotes-io.vercel.app', hero: stickyNotes },
  docs: { glow: '#ff7ac8', shot: 'docs.png', url: 'docs-pi-app.vercel.app', hero: books },
  store: { glow: '#22c3e6', shot: 'store.webp', url: 'onlinegdb.com', hero: crates },
  arkanoid: { glow: '#ffb020', shot: 'arkanoid.webp', url: 'github.com/arrivaldo/Java-Arkanoid', hero: arkanoidSet },
  screenrec: { glow: '#ff5a5f', shot: 'screenrec.png', url: 'screen-recorder-apk.vercel.app', hero: recButton },
  convertio: { glow: '#7ef0ff', shot: 'convertio.png', url: 'convertio-file.vercel.app', hero: fileSwap },
  threefolio: { glow: '#c86cff', shot: 'threefolio.png', url: 'threefolio.vercel.app', hero: knot },
  reply: { glow: '#4d7cff', shot: 'reply.webp', url: 'github.com/arrivaldo/email-writer-spring-boot', hero: envelope },
  blog: { glow: '#4d7cff', shot: 'blog.png', url: 'code-toast-blog.vercel.app', hero: openBook },
  artist: { glow: '#ff7ac8', shot: 'artist.png', url: 'nedelka.vercel.app', hero: microphone },
  popular: { glow: '#4d7cff', shot: null, url: 'popularenlinea.com', hero: bankCard },
}

const id = location.hash.slice(1) || 'arkanoid'
const P = PROJECTS[id]
const GLOW = new THREE.Color(P.glow)

// ---------- helpers ----------
let seed = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

const gloss = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.25, ...o })
const glow = (color, k = 0.8) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.4 })
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat)

/** Low-poly rock: jittered icosahedron, flat-shaded, dark slate faces with warm/teal accents like the Agency rocks. */
function rock(radius, { detail = 1, squash = 1, accent = 0.22 } = {}) {
  let g = new THREE.IcosahedronGeometry(radius, detail)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i)
    v.multiplyScalar(0.7 + rnd() * 0.5)
    v.y *= squash
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  g = g.toNonIndexed()
  g.computeVertexNormals()
  const base = [new THREE.Color('#1e1f36'), new THREE.Color('#2a2b4c'), new THREE.Color('#34365e'), new THREE.Color('#171829')]
  const warm = [new THREE.Color('#b8561f'), new THREE.Color('#d9702c'), GLOW.clone().multiplyScalar(0.7)]
  const cols = []
  for (let f = 0; f < g.attributes.position.count / 3; f++) {
    const c = rnd() < accent ? warm[Math.floor(rnd() * warm.length)] : base[Math.floor(rnd() * base.length)]
    for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b)
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0.05 }))
}

function roundedRect(w, h, r) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** ShapeGeometry with 0–1 UVs across its bounding box (ShapeGeometry's own UVs are in shape units). */
function fitUV(g) {
  g.computeBoundingBox()
  const b = g.boundingBox
  const uv = g.attributes.uv
  const pos = g.attributes.position
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - b.min.x) / (b.max.x - b.min.x), (pos.getY(i) - b.min.y) / (b.max.y - b.min.y))
  return g
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

/** Browser chrome + screenshot (cover, top-aligned) on a canvas. */
async function screenTexture() {
  const c = document.createElement('canvas')
  c.width = 1600
  c.height = 1000
  const x = c.getContext('2d')
  x.fillStyle = '#12141f'
  x.fillRect(0, 0, c.width, c.height)
  const bar = 58
  if (P.shot) {
    const img = await loadImage(`./archive-shots/${P.shot}`)
    const s = Math.max(c.width / img.width, (c.height - bar) / img.height)
    x.drawImage(img, (c.width - img.width * s) / 2, bar, img.width * s, img.height * s)
  } else drawBank(x, c.width, c.height, bar)
  x.fillStyle = '#1a1d2b'
  x.fillRect(0, 0, c.width, bar)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    x.fillStyle = col
    x.beginPath()
    x.arc(34 + i * 30, bar / 2, 9, 0, Math.PI * 2)
    x.fill()
  })
  x.fillStyle = '#262a3b'
  x.beginPath()
  x.roundRect(150, 13, 560, 32, 16)
  x.fill()
  x.fillStyle = '#9aa3b8'
  x.font = '500 19px Segoe UI, system-ui, sans-serif'
  x.fillText(P.url, 172, 36)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Popular en Línea doesn't load from here; a plain online-banking dashboard in its blue stands in. */
function drawBank(x, w, h, top) {
  x.fillStyle = '#f3f6fb'
  x.fillRect(0, top, w, h - top)
  x.fillStyle = '#0b3d91'
  x.fillRect(0, top, w, 96)
  x.fillStyle = '#fff'
  x.font = '700 38px Segoe UI, sans-serif'
  x.fillText('Popular', 60, top + 62)
  x.font = '500 22px Segoe UI, sans-serif'
  ;['Personas', 'Empresas', 'Préstamos', 'Tarjetas'].forEach((s, i) => x.fillText(s, 760 + i * 190, top + 58))
  const g = x.createLinearGradient(60, 0, 820, 0)
  g.addColorStop(0, '#0b3d91')
  g.addColorStop(1, '#2d6be0')
  x.fillStyle = g
  x.beginPath()
  x.roundRect(60, top + 140, 760, 300, 28)
  x.fill()
  x.fillStyle = 'rgba(255,255,255,.75)'
  x.font = '500 24px Segoe UI, sans-serif'
  x.fillText('Balance disponible', 110, top + 210)
  x.fillStyle = '#fff'
  x.font = '700 64px Segoe UI, sans-serif'
  x.fillText('RD$ 84,250.00', 110, top + 300)
  x.fillStyle = 'rgba(255,255,255,.6)'
  x.font = '500 22px Segoe UI, sans-serif'
  x.fillText('Cuenta de ahorro •••• 4821', 110, top + 380)
  ;[0, 1, 2].forEach((i) => {
    x.fillStyle = '#fff'
    x.beginPath()
    x.roundRect(60, top + 480 + i * 130, 760, 110, 20)
    x.fill()
    x.fillStyle = ['#d8e4fb', '#dff5ea', '#fde8d8'][i]
    x.beginPath()
    x.arc(125, top + 535 + i * 130, 30, 0, Math.PI * 2)
    x.fill()
    x.fillStyle = '#1b2130'
    x.font = '600 26px Segoe UI, sans-serif'
    x.fillText(['Transferencia', 'Pago de tarjeta', 'Depósito'][i], 180, top + 530 + i * 130)
    x.fillStyle = '#7a8499'
    x.font = '500 20px Segoe UI, sans-serif'
    x.fillText('Hoy', 180, top + 562 + i * 130)
  })
  x.fillStyle = '#fff'
  x.beginPath()
  x.roundRect(870, top + 140, 670, 720, 28)
  x.fill()
  x.fillStyle = '#1b2130'
  x.font = '600 28px Segoe UI, sans-serif'
  x.fillText('Movimientos', 920, top + 205)
  ;[180, 260, 220, 320, 280, 380, 340].forEach((v, i) => {
    x.fillStyle = i === 5 ? '#0b3d91' : '#c9d7f3'
    x.beginPath()
    x.roundRect(930 + i * 80, top + 780 - v, 46, v, 10)
    x.fill()
  })
}

// ---------- scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(1)
renderer.setSize(W, H)
renderer.setClearColor(0x000000, 0)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.95
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.3

const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100)
camera.position.set(0, 0.4, 10)
camera.lookAt(0, 0, 0)

scene.add(new THREE.HemisphereLight(0x9d8cff, 0x120a24, 0.55))
const key = new THREE.DirectionalLight(0xffe6cc, 1.9)
key.position.set(-4, 6, 6)
scene.add(key)
const rim = new THREE.DirectionalLight(0x6fdcff, 2.2)
rim.position.set(6, 2, -4)
scene.add(rim)
const accent = new THREE.PointLight(GLOW, 14, 9, 1.6)
accent.position.set(-1.2, 0.4, 2.4)
scene.add(accent)

async function build() {
  // Device: dark slab tilted towards the hero, real project on screen, neon rim in the project colour.
  const device = new THREE.Group()
  const dw = 4
  const dh = 2.6
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(dw, dh, 0.16), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4 }),
    new THREE.MeshPhysicalMaterial({ color: '#0c0e1a', metalness: 0.6, roughness: 0.3, clearcoat: 1 }),
  )
  device.add(body)
  const screen = new THREE.Mesh(fitUV(new THREE.ShapeGeometry(roundedRect(dw - 0.14, dh - 0.14, 0.1), 12)), new THREE.MeshBasicMaterial({ map: await screenTexture(), toneMapped: false }))
  screen.position.z = 0.14
  device.add(screen)
  const edge = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(roundedRect(dw + 0.1, dh + 0.1, 0.21).getPoints(24).map((p) => new THREE.Vector3(p.x, p.y, 0.04)), true), 260, 0.03, 8, true),
    glow(new THREE.Color('#4a5cff').lerp(GLOW, 0.25), 1.6),
  )
  device.add(edge)
  // Soft halo behind the device, like the Agency tablet's blue-violet underglow.
  const halo = document.createElement('canvas')
  halo.width = halo.height = 256
  const hx = halo.getContext('2d')
  const hg = hx.createRadialGradient(128, 128, 20, 128, 128, 128)
  hg.addColorStop(0, `${P.glow}cc`)
  hg.addColorStop(0.5, `${P.glow}44`)
  hg.addColorStop(1, `${P.glow}00`)
  hx.fillStyle = hg
  hx.fillRect(0, 0, 256, 256)
  const haloTex = new THREE.CanvasTexture(halo)
  haloTex.colorSpace = THREE.SRGBColorSpace
  const haloMesh = new THREE.Mesh(new THREE.PlaneGeometry(dw * 1.35, dh * 1.45), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.55 }))
  haloMesh.position.set(0.25, -0.15, -0.25)
  device.add(haloMesh)
  device.position.set(1.0, -0.05, -0.4)
  device.rotation.set(0.04, -0.4, 0.015)
  scene.add(device)

  // Ringed low-poly planet peeking over the device's top-right corner.
  const planet = new THREE.Group()
  const ball = rock(0.85, { detail: 2, accent: 0 })
  ball.material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.6 })
  const pc = ball.geometry.attributes.color
  const pp = ball.geometry.attributes.position
  const top = new THREE.Color('#7a5cff')
  const bottom = new THREE.Color('#1b2a6b')
  for (let i = 0; i < pc.count; i += 3) {
    const y = (pp.getY(i) + pp.getY(i + 1) + pp.getY(i + 2)) / 3
    const c = bottom.clone().lerp(top, THREE.MathUtils.clamp(0.5 + y * 0.7, 0, 1)).lerp(GLOW, rnd() * 0.18)
    for (let k = 0; k < 3; k++) pc.setXYZ(i + k, c.r, c.g, c.b)
  }
  planet.add(ball)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.045, 12, 96), glow(GLOW.clone().lerp(new THREE.Color('#ff7ac8'), 0.35), 1.6))
  ring.scale.set(1, 1, 0.22)
  ring.rotation.set(Math.PI / 2.25, 0.25, -0.35)
  planet.add(ring)
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.016, 8, 96), glow('#8fb4ff', 1.2))
  ring2.scale.set(1, 1, 0.22)
  ring2.rotation.copy(ring.rotation)
  planet.add(ring2)
  planet.position.set(2.45, 1.3, -1.9)
  planet.scale.setScalar(0.85)
  scene.add(planet)

  // Pedestal rock under the hero, plus floating debris.
  const ped = rock(1.3, { detail: 2, squash: 0.55, accent: 0.2 })
  ped.position.set(-1.95, -1.85, 0.8)
  scene.add(ped)
  ;[
    [-3.6, 0.1, 0.2, 0.32],
    [3.45, -0.75, 0.9, 0.42],
    [-0.55, -2.05, 1.4, 0.2],
    [-1.0, 1.75, -0.6, 0.17],
    [0.6, -1.85, 0.4, 0.14],
    [-3.2, -1.65, 1.2, 0.16],
  ].forEach(([x, y, z, r]) => {
    const m = rock(r, { detail: 1, accent: 0.3 })
    m.position.set(x, y, z)
    m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3)
    scene.add(m)
  })

  const hero = P.hero()
  hero.scale.multiplyScalar(1.3)
  hero.position.multiplyScalar(1.3).add(new THREE.Vector3(-1.95, -1.38, 0.9))
  scene.add(hero)
}

// ---------- hero objects (stand on the pedestal; origin = pedestal top) ----------
function checklist() {
  const g = new THREE.Group()
  ;[0, 1, 2].forEach((i) => {
    const row = new THREE.Group()
    row.add(rbox(1.7, 0.42, 0.16, 0.08, gloss('#1d2236')))
    const box = rbox(0.28, 0.28, 0.1, 0.06, i < 2 ? glow(GLOW, 1.1) : gloss('#0f1322'))
    box.position.set(-0.6, 0, 0.1)
    row.add(box)
    if (i < 2) {
      const a = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.13, 0.05), gloss('#ffffff'))
      a.position.set(-0.645, -0.02, 0.17)
      a.rotation.z = 0.8
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.05), gloss('#ffffff'))
      b.position.set(-0.57, 0.02, 0.17)
      b.rotation.z = -0.6
      row.add(a, b)
    }
    const line = rbox(i === 2 ? 0.8 : 0.95, 0.08, 0.04, 0.02, gloss(i < 2 ? '#4a536f' : '#c9d1e0'))
    line.position.set(0.05, 0, 0.1)
    row.add(line)
    row.position.set(0, 0.55 + (2 - i) * 0.55, 0)
    g.add(row)
  })
  g.rotation.set(-0.05, 0.45, 0.04)
  return g
}

function shield() {
  const g = new THREE.Group()
  const s = new THREE.Shape()
  s.moveTo(0, 1.05)
  s.bezierCurveTo(0.45, 0.85, 0.8, 0.85, 0.85, 0.8)
  s.bezierCurveTo(0.9, 0.0, 0.6, -0.6, 0, -1.0)
  s.bezierCurveTo(-0.6, -0.6, -0.9, 0.0, -0.85, 0.8)
  s.bezierCurveTo(-0.8, 0.85, -0.45, 0.85, 0, 1.05)
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 6, curveSegments: 32 }), gloss('#6b5cff', { metalness: 0.35 }))
  g.add(body)
  const inner = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, curveSegments: 32 }), gloss('#1d1840'))
  inner.scale.setScalar(0.8)
  inner.position.z = 0.27
  g.add(inner)
  const bolt = new THREE.Shape()
  ;[[0.1, 0.6], [-0.3, -0.02], [-0.02, -0.02], [-0.12, -0.6], [0.32, 0.08], [0.04, 0.08], [0.1, 0.6]].forEach(([x, y], i) => (i ? bolt.lineTo(x, y) : bolt.moveTo(x, y)))
  const b = new THREE.Mesh(new THREE.ExtrudeGeometry(bolt, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02 }), glow('#7ef0ff', 1.6))
  b.position.z = 0.34
  g.add(b)
  g.position.y = 1.15
  g.rotation.set(0, 0.4, -0.06)
  return g
}

function bucket() {
  const g = new THREE.Group()
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.46, 0.95, 48, 1, true), gloss('#e25444', { side: THREE.DoubleSide }))
  b.position.y = 0.5
  g.add(b)
  const inside = new THREE.Mesh(new THREE.CircleGeometry(0.6, 48), gloss('#7a1f17'))
  inside.rotation.x = -Math.PI / 2
  inside.position.y = 0.6
  g.add(inside)
  const rimT = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 12, 64), gloss('#ff8a6b'))
  rimT.rotation.x = Math.PI / 2
  rimT.position.y = 0.97
  g.add(rimT)
  ;[0.3, 0.62].forEach((y) => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.5 + y * 0.12, 0.025, 8, 64), gloss('#b83a2e'))
    band.rotation.x = Math.PI / 2
    band.position.y = y
    g.add(band)
  })
  const cloud = new THREE.Group()
  ;[[0, 0, 0.42], [0.42, -0.08, 0.32], [-0.42, -0.1, 0.3], [0.2, 0.18, 0.3]].forEach(([x, y, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), gloss('#f2f5ff'))
    m.position.set(x, y, 0)
    cloud.add(m)
  })
  cloud.position.set(0.15, 2.05, 0)
  g.add(cloud)
  ;[['#4d7cff', -0.25, 1.45, 0.4], ['#3ddc84', 0.3, 1.25, -0.3]].forEach(([c, x, y, r]) => {
    const card = rbox(0.42, 0.32, 0.04, 0.04, gloss(c))
    card.position.set(x, y, 0.1)
    card.rotation.set(0.2, 0.3, r)
    g.add(card)
  })
  g.rotation.y = 0.3
  return g
}

function chevrons(mat) {
  const g = new THREE.Group()
  const bar = (x, y, rz, h = 0.42) => {
    const m = rbox(0.1, h, 0.1, 0.04, mat)
    m.position.set(x, y, 0)
    m.rotation.z = rz
    g.add(m)
  }
  bar(-0.42, 0.1, -0.75)
  bar(-0.42, -0.1, 0.75)
  bar(0.42, 0.1, 0.75)
  bar(0.42, -0.1, -0.75)
  bar(0, 0, 0.35, 0.62)
  return g
}

function packageBox() {
  const g = new THREE.Group()
  const card = gloss('#d9894a', { roughness: 0.55, clearcoat: 0.3 })
  const box = rbox(1.3, 1.0, 1.3, 0.05, card)
  box.position.y = 0.5
  g.add(box)
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.01, 1.31), gloss('#cb3837'))
  tape.position.y = 0.5
  g.add(tape)
  ;[
    [0, 1.0, 0.65, 0.7, 0],
    [0, 1.0, -0.65, -0.7, 0],
  ].forEach(([x, y, z, rx]) => {
    const flap = rbox(1.28, 0.03, 0.62, 0.01, card)
    flap.geometry.translate(0, 0, Math.sign(z) * 0.31)
    flap.position.set(x, y, z)
    flap.rotation.x = rx
    g.add(flap)
  })
  const code = chevrons(glow('#ffb36b', 1.5))
  code.position.set(0, 1.75, 0)
  code.scale.setScalar(0.95)
  g.add(code)
  g.rotation.y = 0.55
  return g
}

function stickyNotes() {
  const g = new THREE.Group()
  ;[['#3ddc84', 0], ['#ffd23f', 1], ['#ff6fa8', 2]].forEach(([c, i]) => {
    const n = new THREE.Group()
    n.add(rbox(1.2, 1.2, 0.05, 0.03, gloss(c, { roughness: 0.5, clearcoat: 0.4 })))
    ;[0.25, 0.05, -0.15].forEach((y, k) => {
      const l = rbox(k === 2 ? 0.5 : 0.8, 0.07, 0.02, 0.01, gloss('#00000033', { color: new THREE.Color(c).multiplyScalar(0.6) }))
      l.position.set(k === 2 ? -0.15 : 0, y, 0.03)
      n.add(l)
    })
    n.position.set(-0.15 + i * 0.18, 0.75 + i * 0.32, i * 0.12)
    n.rotation.set(-0.15, 0.35, 0.18 - i * 0.16)
    g.add(n)
  })
  const pencil = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.5, 6), gloss('#ffc94d'))
  pencil.add(body)
  const wood = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 6), gloss('#f2d2a0'))
  wood.position.y = -0.88
  wood.rotation.x = Math.PI
  pencil.add(wood)
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 12), gloss('#333'))
  lead.position.y = -0.98
  lead.rotation.x = Math.PI
  pencil.add(lead)
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 16), gloss('#ff8fb1'))
  eraser.position.y = 0.84
  pencil.add(eraser)
  pencil.position.set(0.85, 1.0, 0.5)
  pencil.rotation.set(0.2, 0, -0.55)
  g.add(pencil)
  return g
}

function books() {
  const g = new THREE.Group()
  ;[['#ff7ac8', 0.0], ['#4d7cff', 0.12], ['#ffd23f', -0.08]].forEach(([c, r], i) => {
    const b = new THREE.Group()
    b.add(rbox(1.5, 0.26, 1.05, 0.04, gloss(c)))
    const pages = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.98), gloss('#f7f3ea', { roughness: 0.7, clearcoat: 0 }))
    pages.position.x = 0.07
    b.add(pages)
    b.position.y = 0.15 + i * 0.27
    b.rotation.y = r
    g.add(b)
  })
  const lens = new THREE.Group()
  const frame = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 16, 48), gloss('#2b2f45', { metalness: 0.6 }))
  lens.add(frame)
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.33, 48), new THREE.MeshPhysicalMaterial({ color: '#bfe9ff', transmission: 0.6, roughness: 0.05, transparent: true, opacity: 0.55 }))
  lens.add(glass)
  const handle = rbox(0.12, 0.6, 0.12, 0.05, gloss('#ff7ac8'))
  handle.position.set(0, -0.62, 0)
  lens.add(handle)
  lens.position.set(0.45, 1.65, 0.3)
  lens.rotation.set(0.1, -0.3, 0.6)
  g.add(lens)
  g.rotation.y = 0.35
  return g
}

function crates() {
  const g = new THREE.Group()
  const crate = (x, y, z, s, c, ry) => {
    const m = rbox(s, s, s, 0.06, gloss(c, { roughness: 0.45 }))
    m.position.set(x, y + s / 2, z)
    m.rotation.y = ry
    const band = new THREE.Mesh(new THREE.BoxGeometry(s + 0.01, s * 0.16, s + 0.01), gloss('#0f1a2e'))
    m.add(band)
    g.add(m)
  }
  crate(-0.35, 0, 0, 0.95, '#22c3e6', 0.35)
  crate(0.55, 0, 0.25, 0.7, '#4d7cff', -0.2)
  crate(0.05, 0.95, 0.05, 0.62, '#7ef0ff', 0.8)
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 48), gloss('#ffc63d', { metalness: 0.8, roughness: 0.25 }))
  coin.position.set(0.75, 1.75, 0.3)
  coin.rotation.set(Math.PI / 2, 0, 0.35)
  g.add(coin)
  const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 48), gloss('#e09a12', { metalness: 0.8 }))
  ringC.position.copy(coin.position).add(new THREE.Vector3(0, 0, 0.05))
  ringC.rotation.z = 0.35
  g.add(ringC)
  return g
}

function arkanoidSet() {
  const g = new THREE.Group()
  const paddle = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 1.1, 8, 24), glow('#ffb020', 0.6))
  paddle.rotation.z = Math.PI / 2
  paddle.position.y = 0.35
  g.add(paddle)
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 24), glow('#ffffff', 1.2))
  ball.position.set(0.55, 1.1, 0.2)
  g.add(ball)
  ;[0.12, 0.09, 0.06].forEach((r, i) => {
    const t = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshBasicMaterial({ color: '#7ef0ff', transparent: true, opacity: 0.55 - i * 0.15 }))
    t.position.set(0.3 - i * 0.24, 0.85 - i * 0.24, 0.2)
    g.add(t)
  })
  const cols = ['#ff3b47', '#ff7a1a', '#ffc400', '#19c96b', '#0fb5e0']
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++) {
      if (r === 2 && c === 1) continue
      const b = rbox(0.42, 0.2, 0.2, 0.05, gloss(cols[(r + c) % cols.length]))
      b.position.set(-0.7 + c * 0.47, 1.7 + r * 0.25, -0.1)
      g.add(b)
    }
  const loose = rbox(0.42, 0.2, 0.2, 0.05, gloss('#3ddc84'))
  loose.position.set(1.05, 1.3, 0.4)
  loose.rotation.set(0.4, 0.3, 0.6)
  g.add(loose)
  g.rotation.y = 0.3
  return g
}

function recButton() {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.3, 64), gloss('#161a2a', { metalness: 0.4 }))
  base.rotation.x = Math.PI / 2
  g.add(base)
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 16, 64), gloss('#e9ecf5', { metalness: 0.7 }))
  ringB.position.z = 0.16
  g.add(ringB)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 32), glow('#ff3b47', 0.9))
  dome.scale.z = 0.4
  dome.position.z = 0.15
  g.add(dome)
  const cur = new THREE.Shape()
  ;[[0, 0], [0, -0.62], [0.16, -0.48], [0.28, -0.74], [0.38, -0.69], [0.27, -0.44], [0.47, -0.44], [0, 0]].forEach(([x, y], i) => (i ? cur.lineTo(x, y) : cur.moveTo(x, y)))
  const cursor = new THREE.Mesh(new THREE.ExtrudeGeometry(cur, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02 }), gloss('#ffffff'))
  cursor.position.set(0.45, -0.15, 0.45)
  cursor.rotation.z = 0.15
  g.add(cursor)
  g.position.y = 1.15
  g.rotation.set(-0.12, 0.45, 0)
  return g
}

function fileCard(color) {
  const f = new THREE.Group()
  const s = new THREE.Shape()
  s.moveTo(-0.4, -0.52)
  s.lineTo(0.4, -0.52)
  s.lineTo(0.4, 0.3)
  s.lineTo(0.18, 0.52)
  s.lineTo(-0.4, 0.52)
  s.lineTo(-0.4, -0.52)
  f.add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }), gloss(color)))
  const corner = new THREE.Shape()
  corner.moveTo(0.18, 0.52)
  corner.lineTo(0.18, 0.3)
  corner.lineTo(0.4, 0.3)
  const c = new THREE.Mesh(new THREE.ExtrudeGeometry(corner, { depth: 0.02, bevelEnabled: false }), gloss('#ffffff'))
  c.position.z = 0.1
  f.add(c)
  ;[0.0, -0.18].forEach((y, k) => {
    const l = rbox(k ? 0.35 : 0.55, 0.07, 0.02, 0.01, gloss('#ffffff', { transparent: true, opacity: 0.85 }))
    l.position.set(k ? -0.1 : 0, y, 0.1)
    f.add(l)
  })
  return f
}

function fileSwap() {
  const g = new THREE.Group()
  const a = fileCard('#6b4dff')
  a.position.set(-0.55, 0.75, 0)
  a.rotation.set(0, 0.35, 0.12)
  const b = fileCard('#0fb5e0')
  b.position.set(0.55, 1.35, 0.35)
  b.rotation.set(0, 0.25, -0.1)
  g.add(a, b)
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 12, 48, Math.PI * 0.9), glow('#7ef0ff', 1.8))
  arc.position.set(0, 1.6, 0.6)
  arc.rotation.z = 0.25
  g.add(arc)
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 16), glow('#7ef0ff', 1.8))
  head.position.set(-0.6 * Math.cos(0.25) - 0.05, 1.6 - 0.6 * Math.sin(0.25) - 0.1, 0.6)
  head.rotation.z = Math.PI + 0.1
  g.add(head)
  return g
}

function knot() {
  const g = new THREE.Group()
  const k = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.17, 220, 32), new THREE.MeshPhysicalMaterial({ color: '#c86cff', metalness: 0.4, roughness: 0.15, iridescence: 1, iridescenceIOR: 1.6, clearcoat: 1 }))
  k.position.y = 1.2
  g.add(k)
  const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.05, 1)), new THREE.LineBasicMaterial({ color: '#7ef0ff', transparent: true, opacity: 0.7 }))
  cage.position.y = 1.2
  cage.rotation.set(0.3, 0.4, 0)
  g.add(cage)
  return g
}

function envelope() {
  const g = new THREE.Group()
  const env = new THREE.Group()
  env.add(rbox(1.5, 0.98, 0.12, 0.05, gloss('#f2f5ff')))
  const flap = new THREE.Shape()
  flap.moveTo(-0.75, 0.49)
  flap.lineTo(0.75, 0.49)
  flap.lineTo(0, -0.12)
  flap.lineTo(-0.75, 0.49)
  const f = new THREE.Mesh(new THREE.ExtrudeGeometry(flap, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }), gloss('#c9d6ff'))
  f.position.z = 0.07
  env.add(f)
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32), glow('#4d7cff', 1))
  seal.rotation.x = Math.PI / 2
  seal.position.set(0, -0.08, 0.12)
  env.add(seal)
  env.position.y = 0.8
  env.rotation.set(-0.1, 0.4, -0.08)
  g.add(env)
  const plane = new THREE.Group()
  const wing = (side) => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(-1, side * 0.42)
    s.lineTo(-0.82, 0)
    s.lineTo(0, 0)
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), gloss('#4d7cff', { side: THREE.DoubleSide }))
    m.rotation.x = side * 0.35
    return m
  }
  plane.add(wing(1), wing(-1))
  plane.scale.setScalar(0.85)
  plane.position.set(0.9, 1.95, 0.4)
  plane.rotation.set(0.3, -0.5, 0.35)
  g.add(plane)
  ;[0, 1, 2, 3].forEach((i) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: '#9db4ff' }))
    d.position.set(0.0 - i * 0.22, 1.7 - i * 0.12, 0.4)
    g.add(d)
  })
  return g
}

function openBook() {
  const g = new THREE.Group()
  ;[-1, 1].forEach((side) => {
    const half = new THREE.Group()
    const cover = rbox(0.9, 0.05, 1.2, 0.02, gloss('#4d7cff'))
    cover.position.x = side * 0.45
    half.add(cover)
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.08, 1.12), gloss('#f7f3ea', { roughness: 0.7, clearcoat: 0 }))
    pages.position.set(side * 0.44, 0.06, 0)
    half.add(pages)
    half.rotation.z = side * 0.22
    g.add(half)
  })
  g.children.forEach((h) => (h.position.y = 0.3))
  const braces = new THREE.Group()
  const brace = (sx) => {
    const pts = [[0.05, 0.42], [-0.05, 0.4], [-0.1, 0.3], [-0.1, 0.08], [-0.2, 0], [-0.1, -0.08], [-0.1, -0.3], [-0.05, -0.4], [0.05, -0.42]].map(([x, y]) => new THREE.Vector3(x * sx, y, 0))
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.045, 10), glow('#9b8cff', 1.5))
  }
  const l = brace(1)
  l.position.x = -0.3
  const r = brace(-1)
  r.position.x = 0.3
  braces.add(l, r)
  braces.position.set(0, 1.45, 0)
  g.add(braces)
  const mug = new THREE.Group()
  mug.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.55, 40), gloss('#1d2140')))
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.045, 12, 32), gloss('#1d2140'))
  handle.position.x = 0.3
  mug.add(handle)
  mug.position.set(1.05, 0.3, 0.45)
  g.add(mug)
  g.rotation.set(0.25, 0.35, 0)
  return g
}

function microphone() {
  const g = new THREE.Group()
  const mic = new THREE.Group()
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 40, 28), gloss('#cfd5e6', { metalness: 0.8, roughness: 0.35 }))
  head.position.y = 0.95
  mic.add(head)
  const grille = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(0.375, 12, 8)), new THREE.LineBasicMaterial({ color: '#6b7390' }))
  grille.position.y = 0.95
  mic.add(grille)
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.1, 40), glow('#ff7ac8', 0.9))
  band.position.y = 0.62
  mic.add(band)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 1.0, 40), gloss('#1d1b2e', { metalness: 0.5 }))
  body.position.y = 0.08
  mic.add(body)
  mic.position.set(-0.2, 0.55, 0)
  mic.rotation.z = 0.28
  g.add(mic)
  const vinyl = new THREE.Group()
  vinyl.add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 64), new THREE.MeshStandardMaterial({ color: '#141418', roughness: 0.45, metalness: 0.2, envMapIntensity: 0.4 })))
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 48), gloss('#ff7ac8'))
  vinyl.add(label)
  vinyl.position.set(0.75, 1.7, -0.3)
  vinyl.rotation.set(1.2, 0.3, 0.2)
  g.add(vinyl)
  const note = (x, y, s) => {
    const n = new THREE.Group()
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), glow('#ffb3d1', 1))
    dot.scale.set(1.25, 0.9, 0.8)
    n.add(dot)
    const stem = rbox(0.04, 0.42, 0.04, 0.015, glow('#ffb3d1', 1))
    stem.position.set(0.11, 0.2, 0)
    n.add(stem)
    n.position.set(x, y, 0.5)
    n.scale.setScalar(s)
    n.rotation.z = -0.2
    g.add(n)
  }
  note(0.8, 0.75, 1)
  note(-0.95, 1.85, 0.8)
  return g
}

function bankCard() {
  const g = new THREE.Group()
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 320
  const x = c.getContext('2d')
  const grad = x.createLinearGradient(0, 0, 512, 320)
  grad.addColorStop(0, '#0b3d91')
  grad.addColorStop(1, '#3a7bff')
  x.fillStyle = grad
  x.fillRect(0, 0, 512, 320)
  x.fillStyle = 'rgba(255,255,255,.9)'
  x.font = '600 26px Segoe UI, sans-serif'
  x.fillText('•••• •••• •••• 4821', 40, 230)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const card = new THREE.Group()
  card.add(rbox(1.6, 1.0, 0.05, 0.08, gloss('#0b3d91')))
  const face = new THREE.Mesh(fitUV(new THREE.ShapeGeometry(roundedRect(1.56, 0.96, 0.07), 8)), new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.3, clearcoat: 1 }))
  face.position.z = 0.027
  card.add(face)
  const chip = rbox(0.24, 0.18, 0.02, 0.03, gloss('#ffc63d', { metalness: 0.8 }))
  chip.position.set(-0.5, 0.12, 0.04)
  card.add(chip)
  card.position.set(-0.1, 1.25, 0.1)
  card.rotation.set(-0.2, 0.5, 0.2)
  g.add(card)
  ;[0, 1, 2, 3].forEach((i) => {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 48), gloss('#ffc63d', { metalness: 0.8, roughness: 0.25 }))
    coin.position.set(0.7 + (i % 2) * 0.03, 0.05 + i * 0.09, 0.45)
    g.add(coin)
  })
  return g
}

await build()
renderer.render(scene, camera)
window.render = () => {
  renderer.render(scene, camera)
  return renderer.domElement.toDataURL('image/webp', 0.9)
}
window.ready = true
