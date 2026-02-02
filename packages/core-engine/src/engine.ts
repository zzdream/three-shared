// three 是 peerDependency，类型定义由使用方项目的 @types/three 提供
// 使用 any 类型以避免类型检查错误，运行时由使用方项目提供正确的 three 版本
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import type {
	SceneOptions,
	CameraOptions,
	RendererOptions,
	ControlsOptions,
	LightOptions,
	AnimateCallback,
} from './types/options'
import { calculateViewCenter, setupCameraAndControls } from './cameraUtils'

/**
 * 引擎配置选项
 */
export interface EngineOptions {
	/** 场景配置 */
	scene?: SceneOptions
	/** 相机配置 */
	camera?: CameraOptions
	/** 渲染器配置 */
	renderer?: RendererOptions
	/** 控制器配置 */
	controls?: ControlsOptions
	/** 光照配置 */
	light?: LightOptions
	/** 动画配置 */
	animate?: {
		/** 每帧执行的回调函数 */
		callback?: AnimateCallback
		/** 是否自动启动动画循环，默认为 false */
		autoStart?: boolean
	}
	/** 窗口大小监听配置 */
	resize?: {
		/** 是否启用窗口大小监听，默认为 true */
		enabled?: boolean
		/** 防抖延迟时间（毫秒），默认为 200 */
		wait?: number
	}
}

/**
 * Three.js 引擎核心类
 * 统一管理场景、相机、渲染器、控制器和光照
 */
export class ThreeEngine {
	/** 场景对象 */
	readonly scene: any
	/** 相机对象 */
	readonly camera: any
	/** 渲染器对象 */
	readonly renderer: any
	/** 控制器对象 */
	readonly controls: any
	/** 平行光对象 */
	readonly light: any

	private container: HTMLElement
	private stopAnimate: (() => void) | null = null
	private cleanupResize: (() => void) | null = null
	private isRunning: boolean = false
	private animateCallback: AnimateCallback | undefined

	/**
	 * 创建 Three.js 引擎实例
	 * @param container 容器元素
	 * @param options 引擎配置选项
	 */
	constructor(container: HTMLElement, options: EngineOptions = {}) {
		this.container = container

		// 初始化场景
		this.scene = this._initScene(options.scene)

		// 初始化相机
		this.camera = this._initCamera(container, options.camera)

		// 初始化渲染器
		this.renderer = this._initRenderer(container, options.renderer)

		// 初始化控制器
		this.controls = this._initControls(this.camera, this.renderer, options.controls)

		// 初始化光照
		this.light = this._initLight(this.scene, options.light)

		// 设置窗口大小监听
		if (options.resize?.enabled !== false) {
			this.cleanupResize = this._setupResizeListener(container, this.camera, this.renderer, options.resize?.wait)
		}

		// 保存动画回调
		this.animateCallback = options.animate?.callback

		// 自动启动动画循环
		if (options.animate?.autoStart) {
			this.start()
		}
	}

	/**
	 * 启动动画循环
	 */
	start(): void {
		if (this.isRunning) {
			console.warn('Animation loop is already running')
			return
		}

		this.isRunning = true
		this.stopAnimate = this._createAnimateLoop(
			this.scene,
			this.camera,
			this.renderer,
			this.controls,
			this.animateCallback
		)
	}

	/**
	 * 停止动画循环
	 */
	stop(): void {
		if (!this.isRunning) {
			return
		}

		this.isRunning = false
		if (this.stopAnimate) {
			this.stopAnimate()
			this.stopAnimate = null
		}
	}

	/**
	 * 设置动画回调函数
	 * @param callback 每帧执行的回调函数
	 */
	setAnimateCallback(callback: AnimateCallback): void {
		this.animateCallback = callback
	}

	/**
	 * 计算视图中心点
	 * @param allRoadPoints 所有道路点数组
	 * @returns 返回中心点、最大尺寸和边界框
	 */
	calculateViewCenter(allRoadPoints: any[]): { center: any; maxSize: number; boundingBox: any } {
		return calculateViewCenter(allRoadPoints)
	}

	/**
	 * 设置相机和控制器位置
	 * @param allRoadPoints 所有道路点数组
	 * @returns 返回边界框
	 */
	setCameraAndControls(allRoadPoints: any[]): { boundingBox: any } {
		if (!allRoadPoints || !Array.isArray(allRoadPoints) || allRoadPoints.length === 0) {
			throw new Error('Invalid input: allRoadPoints must be a non-empty array.')
		}

		const { center, maxSize, boundingBox } = calculateViewCenter(allRoadPoints)
		setupCameraAndControls(center, maxSize, this.camera, this.controls)

		return { boundingBox }
	}

	/**
	 * 销毁引擎，释放所有资源
	 */
	dispose(): void {
		// 停止动画循环
		this.stop()

		// 移除窗口大小监听
		if (this.cleanupResize) {
			this.cleanupResize()
			this.cleanupResize = null
		}

		// 销毁控制器
		if (this.controls) {
			this.controls.dispose()
		}

		// 销毁渲染器
		if (this.renderer) {
			this.renderer.dispose()
			// 移除 DOM 元素
			if (this.container && this.renderer.domElement.parentNode) {
				this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
			}
		}
	}

	/**
	 * 获取动画循环运行状态
	 */
	get isAnimating(): boolean {
		return this.isRunning
	}

	// ========== 私有方法：初始化函数 ==========

	/**
	 * 初始化场景
	 */
	private _initScene(options: SceneOptions = {}): any {
		const { backgroundColor = 0xf7f7f8 } = options

		const scene = new (THREE as any).Scene()
		scene.background = new (THREE as any).Color(backgroundColor)

		return scene
	}

	/**
	 * 初始化相机
	 */
	private _initCamera(container: HTMLElement, options: CameraOptions = {}): any {
		const { fov = 55, near = 0.1, far = 50000, position, target } = options

		const aspect = container.clientWidth / container.clientHeight
		const camera = new (THREE as any).PerspectiveCamera(fov, aspect, near, far)

		// 设置相机位置
		if (position) {
			if (Array.isArray(position)) {
				camera.position.set(position[0], position[1], position[2])
			} else {
				camera.position.set(position.x, position.y, position.z)
			}
		} else {
			camera.position.set(0, 30, 0)
		}

		// 设置相机朝向
		if (target) {
			if (Array.isArray(target)) {
				camera.lookAt(target[0], target[1], target[2])
			} else {
				camera.lookAt(target.x, target.y, target.z)
			}
		} else {
			camera.lookAt(0, 0, 0)
		}

		return camera
	}

	/**
	 * 初始化渲染器
	 */
	private _initRenderer(container: HTMLElement, options: RendererOptions = {}): any {
		const {
			antialias = true,
			logarithmicDepthBuffer = true,
			preserveDrawingBuffer = true,
			powerPreference = 'high-performance',
			shadowMapEnabled = true,
		} = options

		// 检测是否为 Mac（Mac 上可能不支持 powerPreference）
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

		const renderer = new (THREE as any).WebGLRenderer({
			antialias,
			logarithmicDepthBuffer,
			preserveDrawingBuffer,
			powerPreference: isMac ? undefined : powerPreference,
		})

		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(container.clientWidth, container.clientHeight)

		if (shadowMapEnabled) {
			renderer.shadowMap.enabled = true
			if ((THREE as any).PCFSoftShadowMap) {
				renderer.shadowMap.type = (THREE as any).PCFSoftShadowMap
			}
		}

		container.appendChild(renderer.domElement)

		return renderer
	}

	/**
	 * 初始化控制器
	 */
	private _initControls(camera: any, renderer: { domElement: HTMLElement }, options: ControlsOptions = {}): any {
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

	/**
	 * 初始化光照
	 */
	private _initLight(scene: any, options: LightOptions = {}): any {
		const {
			ambientColor = 0xffffff,
			ambientIntensity = 3,
			directionalColor = 0xffffff,
			directionalIntensity = 1,
			directionalPosition = [1, 1, 1],
		} = options

		// 添加环境光
		const ambientLight = new (THREE as any).AmbientLight(ambientColor, ambientIntensity)
		scene.add(ambientLight)

		// 添加平行光
		const directionalLight = new (THREE as any).DirectionalLight(directionalColor, directionalIntensity)
		directionalLight.position.set(directionalPosition[0], directionalPosition[1], directionalPosition[2]).normalize()
		scene.add(directionalLight)

		return directionalLight
	}

	/**
	 * 创建动画循环
	 */
	private _createAnimateLoop(
		scene: any,
		camera: any,
		renderer: any,
		controls?: any,
		callback?: AnimateCallback
	): () => void {
		let animationId: number | null = null
		let isRunning = true

		const animate = () => {
			if (!isRunning) return

			animationId = requestAnimationFrame(animate)

			// 执行自定义回调
			if (callback) {
				callback()
			}

			// 更新控制器
			if (controls) {
				controls.update()
			}

			// 渲染场景
			renderer.render(scene, camera)
		}

		// 开始动画循环
		animate()

		// 返回停止动画的函数
		return () => {
			isRunning = false
			if (animationId !== null) {
				cancelAnimationFrame(animationId)
				animationId = null
			}
		}
	}

	/**
	 * 设置窗口大小变化监听器
	 */
	private _setupResizeListener(container: HTMLElement, camera: any, renderer: any, wait: number = 200): () => void {
		const debouncedOnResize = this._debounceImmediate(() => {
			// 更新相机宽高比（仅对 PerspectiveCamera 有效）
			if ('aspect' in camera) {
				camera.aspect = container.clientWidth / container.clientHeight
				camera.updateProjectionMatrix()
			} else if ('left' in camera && 'right' in camera && 'top' in camera && 'bottom' in camera) {
				// 对于 OrthographicCamera，需要更新左右上下边界
				const aspect = container.clientWidth / container.clientHeight

				// 获取当前的垂直半尺寸（通常等于 top 的绝对值）
				// 如果 top 不存在，使用默认值 20
				const halfSize = Math.abs(camera.top) || 20

				// 更新 OrthographicCamera 的边界
				// 保持垂直范围不变，只调整水平范围以适应新的宽高比
				camera.left = -halfSize * aspect
				camera.right = halfSize * aspect
				camera.top = halfSize
				camera.bottom = -halfSize

				camera.updateProjectionMatrix()
			}

			// 更新渲染器大小
			renderer.setSize(container.clientWidth, container.clientHeight)
		}, wait)

		// 添加事件监听
		window.addEventListener('resize', debouncedOnResize)

		// 返回清理函数
		return () => {
			window.removeEventListener('resize', debouncedOnResize)
		}
	}

	/**
	 * 立即执行的防抖函数
	 */
	private _debounceImmediate(func: () => void, wait: number): () => void {
		let timeout: ReturnType<typeof setTimeout> | null = null
		let immediate = true

		return function executedFunction() {
			const callNow = immediate && !timeout

			if (timeout) {
				clearTimeout(timeout)
			}
			timeout = setTimeout(() => {
				timeout = null
				immediate = true
			}, wait)

			if (callNow) {
				immediate = false
				func()
			}
		}
	}
}

