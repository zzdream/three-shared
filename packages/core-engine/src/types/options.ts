/**
 * 场景配置选项
 */
export interface SceneOptions {
	/** 背景色，默认为 0xf7f7f8 */
	backgroundColor?: number | string
}

/**
 * 相机配置选项
 */
export interface CameraOptions {
	/** 视野角度（FOV），默认为 55 */
	fov?: number
	/** 近裁剪面，默认为 0.1 */
	near?: number
	/** 远裁剪面，默认为 50000 */
	far?: number
	/** 相机位置，默认为 (0, 30, 0) */
	position?: { x: number; y: number; z: number } | [number, number, number]
	/** 相机朝向的目标点，默认为 (0, 0, 0) */
	target?: { x: number; y: number; z: number } | [number, number, number]
}

/**
 * 渲染器配置选项
 */
export interface RendererOptions {
	/** 是否开启抗锯齿，默认为 true */
	antialias?: boolean
	/** 是否使用对数深度缓冲区，默认为 true */
	logarithmicDepthBuffer?: boolean
	/** 是否保留绘制缓冲区，默认为 true */
	preserveDrawingBuffer?: boolean
	/** 性能偏好，默认为 'high-performance' */
	powerPreference?: 'default' | 'high-performance' | 'low-power'
	/** 是否启用阴影，默认为 true */
	shadowMapEnabled?: boolean
}

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
 * 光照配置选项
 */
export interface LightOptions {
	/** 环境光颜色，默认为 0xffffff */
	ambientColor?: number | string
	/** 环境光强度，默认为 3 */
	ambientIntensity?: number
	/** 平行光颜色，默认为 0xffffff */
	directionalColor?: number | string
	/** 平行光强度，默认为 1 */
	directionalIntensity?: number
	/** 平行光位置，默认为 (1, 1, 1) */
	directionalPosition?: [number, number, number]
}

/**
 * 动画循环回调函数
 */
export type AnimateCallback = () => void

