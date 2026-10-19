// Stand-in for `three/webgpu` (see vite.config.ts). three-globe imports it only for its heatmap layer, which the
// Lab globe doesn't use; the real module is a second full build of three.js (~2.4 MB of code).
const unavailable = () => {
  throw new Error('three/webgpu is stubbed out in this build')
}
export class WebGPURenderer {
  constructor() {
    unavailable()
  }
}
export class StorageInstancedBufferAttribute {
  constructor() {
    unavailable()
  }
}
