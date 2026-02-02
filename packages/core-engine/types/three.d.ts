/**
 * Three.js 类型声明
 * three 是 peerDependency，类型定义由使用方项目提供
 * 此文件仅用于避免 TypeScript 编译错误
 */
declare module 'three' {
  const THREE: any
  export = THREE
  export as namespace THREE
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


declare module 'three/examples/jsm/loaders/FBXLoader.js' {
	import { Object3D, LoadingManager } from 'three'

	export class FBXLoader {
		constructor(manager?: LoadingManager)
		load(
			url: string,
			onLoad?: (object: Object3D) => void,
			onProgress?: (event: ProgressEvent) => void,
			onError?: (error: Error) => void
		): void
		parse(data: ArrayBuffer | string, path: string): Object3D
	}
}

declare module 'three/examples/jsm/loaders/HDRLoader.js' {
	import { DataTexture, LoadingManager } from 'three'

	export class HDRLoader {
		constructor(manager?: LoadingManager)
		load(
			url: string,
			onLoad?: (texture: DataTexture) => void,
			onProgress?: (event: ProgressEvent) => void,
			onError?: (error: Error) => void
		): void
		parse(data: ArrayBuffer): DataTexture
	}
}

declare module 'three/examples/jsm/loaders/RGBELoader.js' {
	import { DataTexture, LoadingManager } from 'three'

	export class RGBELoader {
		constructor(manager?: LoadingManager)
		load(
			url: string,
			onLoad?: (texture: DataTexture) => void,
			onProgress?: (event: ProgressEvent) => void,
			onError?: (error: Error) => void
		): void
		parse(data: ArrayBuffer): DataTexture
	}
}

declare module 'three/examples/jsm/utils/BufferGeometryUtils.js' {
	/**
	 * 合并多个 BufferGeometry 为一个
	 * @param geometries 要合并的几何体数组
	 * @param useGroups 是否使用组（可选）
	 * @returns 合并后的几何体
	 */
	export function mergeGeometries(
		geometries: any[],
		useGroups?: boolean
	): any | null

	/**
	 * 合并多个 BufferGeometry 的顶点
	 * @param geometry 要合并的几何体
	 * @param tolerance 容差（可选）
	 * @returns 合并后的几何体
	 */
	export function mergeVertices(geometry: any, tolerance?: number): any
}

declare module 'three/examples/jsm/lines/Line2.js' {
	import { Object3D } from 'three'
	export class Line2 extends Object3D {
		constructor(geometry?: any, material?: any)
		geometry: any
		material: any
		computeLineDistances(): this
		raycast(raycaster: any, intersects: any): void
	}
}

declare module 'three/examples/jsm/lines/LineGeometry.js' {
	export class LineGeometry {
		setPositions(positions: number[]): void
		setColors(colors: number[]): void
		fromLine(line: any): this
		fromWireframeGeometry(geometry: any): this
		fromMesh(mesh: any): this
		fromEdgesGeometry(geometry: any): this
	}
}

declare module 'three/examples/jsm/lines/LineMaterial.js' {
	import { Vector2 } from 'three'
	export class LineMaterial {
		constructor(parameters?: {
			color?: number
			linewidth?: number
			dashed?: boolean
			dashScale?: number
			dashSize?: number
			gapSize?: number
			resolution?: Vector2
			alphaToCoverage?: boolean
			worldUnits?: boolean
		})
		color: number
		linewidth: number
		dashed: boolean
		dashScale: number
		dashSize: number
		gapSize: number
		resolution: Vector2
		alphaToCoverage: boolean
		worldUnits: boolean
		depthTest: boolean
		transparent: boolean
		opacity: number
	}
}
