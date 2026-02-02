import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
/**
 * 控制器配置选项
 */
export interface ControlsOptions {
	/** 是否启用阻尼效果，默认为 true */
	enableDamping?: boolean
	/** 阻尼系数，默认为 0.05 */
	dampingFactor?: number
	/** 是否禁用屏幕空间平移，默认为 true */
	screenSpacePanning?: boolean
	/** 相机离目标点的最小距离，默认为 0.5 */
	minDistance?: number
	/** 相机离目标点的最大距离，默认为 40000 */
	maxDistance?: number
	/** 相机的仰角范围，默认为 Math.PI / 2 */
	maxPolarAngle?: number
	/** 是否启用旋转，默认为 false */
	enableRotate?: boolean
	/** 是否启用缩放，默认为 true */
	enableZoom?: boolean
	/** 是否启用平移，默认为 true */
	enablePan?: boolean
}

/**
 * 初始化 OrbitControls 控制器
//  * @param OrbitControlsClass OrbitControls 类
 * @param camera 相机对象
 * @param renderer 渲染器对象
 * @param options 控制器配置选项
 * @returns 初始化后的控制器对象
 */
export function initControls(camera: any, renderer: { domElement: HTMLElement }, options: ControlsOptions = {}): any {
	const {
		enableDamping = true,
		dampingFactor = 0.05,
		screenSpacePanning = false,
		minDistance = 0.5,
		maxDistance = 40000,
		maxPolarAngle = Math.PI / 2,
		enableRotate = false,
		enableZoom = true,
		enablePan = true,
	} = options

	const controls = new OrbitControls(camera, renderer.domElement)

	controls.enableDamping = enableDamping
	controls.dampingFactor = dampingFactor
	controls.screenSpacePanning = screenSpacePanning
	controls.minDistance = minDistance
	controls.maxDistance = maxDistance
	controls.maxPolarAngle = maxPolarAngle
	controls.enableRotate = enableRotate
	controls.enableZoom = enableZoom
	controls.enablePan = enablePan

	return controls
}

