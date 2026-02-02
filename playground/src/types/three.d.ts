declare module 'three' {
  export * from 'three'
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera } from 'three'
  export class OrbitControls {
    constructor(camera: Camera, domElement: HTMLElement)
    enableDamping: boolean
    dampingFactor: number
    screenSpacePanning: boolean
    minDistance: number
    maxDistance: number
    maxPolarAngle: number
    enableRotate: boolean
    enableZoom: boolean
    enablePan: boolean
    target: { set: (x: number, y: number, z: number) => void }
    update(): void
    dispose(): void
  }
}

