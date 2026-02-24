import { loadWasm } from '@shared/wasm'
import { loadXodrChunked, parseXodrData, renderXodrFaces, renderXodrLines, processLineData, drawObjects, drawSignals, drawTunnels, drawBridges, getCachedXodrData, cacheXodrData } from './index'
import type { ThreeEngine } from '@shared/core-engine'
import { GroundGrip, createGroup } from '@shared/core-engine'

/**
 * XODR 地图初始化配置选项
 */
export interface XodrMapInitializerOptions {
	/** 基础路径（如 process.env.VITE_P_TO_B） */
	basePath?: string
	/** WebAssembly 文件路径（相对于 basePath） */
	wasmPath?: string
	/** 模型 URL 映射 */
	modalToUrl?: Record<string, string>
	/** 缓存配置 */
	cache?: {
		/** 是否启用缓存 */
		enabled?: boolean
		/** 数据库名称 */
		database?: string
		/** 表名称 */
		table?: string
		/** 缓存字段名 */
		field?: string
		/** 缓存过期时间（毫秒） */
		expiresIn?: number | Date | null
		/** 是否自动删除过期数据 */
		autoDeleteExpired?: boolean
	}
	/** XODR 解析配置 */
	parseXodr?: {
		/** XODR 文件路径（相对于 basePath） */
		path?: string
		/** 解析步长，默认 4 */
		step?: number
		/** 分块加载配置 */
		chunked?: {
			/** 每块大小（字节），默认 5MB */
			chunkSize?: number
			/** 并发数，默认 3 */
			concurrency?: number
		}
	}
	/** 道路线条配置 */
	roadLine?: {
		/** 默认线条颜色 */
		color?: number
	}
	/** 信号配置 */
	signal?: {
		/** 信号状态列表 */
		states?: string[]
	}
	/** 隧道配置 */
	tunnel?: {
		/** 隧道模型路径 */
		path?: string
		/** 隧道颜色 */
		color?: number
		/** 隧道透明度 */
		opacity?: number
		/** 隧道步长 */
		step?: number
	}
	/** 桥梁配置 */
	bridge?: {
		/** 桥梁颜色 */
		color?: number
		/** 桥梁透明度 */
		opacity?: number
	}
	/** 地面配置 */
	ground?: {
		/** 地面贴图路径（相对于 basePath），默认 '/ground.jpg' */
		groundPath?: string
		/** 缩放因子，默认 50 */
		scaleFactor?: number
	}
	/** 天空配置 */
	sky?: {
		/** 天空 HDR 贴图路径（相对于 basePath），默认 '/sky.hdr' */
		skyPath?: string
		/** HDR Loader 适配器 */
		hdrLoaderAdapter?: any
	}
	/** 进度回调 */
	onProgress?: (loaded: number, total: number) => void
	/** 可见性控制配置 */
	visibilityControl?: {
		/** 是否启用自动可见性控制，默认 false */
		enabled?: boolean
		/** 高度阈值，相机高度小于等于此值时组可见，默认 400 */
		heightThreshold?: number
		/** 自定义可见性判断函数，优先级高于 heightThreshold */
		visibilityChecker?: (cameraHeight: number) => boolean
		/** 节流间隔（毫秒），避免频繁更新，默认 100ms */
		throttleMs?: number
		/** 
		 * 要控制的组配置（高级选项，通常不需要配置）
		 * 默认自动管理所有相关组（lanePathGroup、objectGroup、signalGroup）
		 */
		groups?: {
			/** 是否控制路线组，默认 true */
			lanePathGroup?: boolean
			/** 是否控制对象组，默认 true */
			objectGroup?: boolean
			/** 是否控制信号组，默认 true */
			signalGroup?: boolean
		}
	}
}

/**
 * XODR 地图初始化结果
 */
export interface XodrMapInitializerResult {
	/** 路面组 */
	graphPathGroup: any
	/** 路线组 */
	lanePathGroup: any
	/** 对象组 */
	objectGroup: any
	/** 信号组 */
	signalGroup: any
	/** 地面组 */
	ground: any | null
	/** 天空组 */
	sky: any | null
	/** 边界框 */
	boundingBox: any
}

/**
 * 内部使用的选项类型，确保所有嵌套对象都不是 undefined
 */
type InternalOptions = Required<Pick<XodrMapInitializerOptions, 'basePath'>> & 
	Omit<XodrMapInitializerOptions, 'cache' | 'parseXodr' | 'roadLine' | 'signal' | 'tunnel' | 'bridge' | 'ground' | 'sky'> & {
		cache: Required<NonNullable<XodrMapInitializerOptions['cache']>>
		parseXodr: Required<NonNullable<XodrMapInitializerOptions['parseXodr']>> & {
			chunked: Required<NonNullable<NonNullable<XodrMapInitializerOptions['parseXodr']>['chunked']>>
		}
		roadLine?: XodrMapInitializerOptions['roadLine']
		signal?: XodrMapInitializerOptions['signal']
		tunnel?: XodrMapInitializerOptions['tunnel']
		bridge?: XodrMapInitializerOptions['bridge']
		ground?: XodrMapInitializerOptions['ground']
		sky?: XodrMapInitializerOptions['sky']
	}

/**
 * XODR 地图初始化器
 * 封装通用的 XODR 地图加载和渲染流程
 */
export class XodrMapInitializer {
	private engine: ThreeEngine
	private options: InternalOptions
	// 保存当前创建的组引用，用于清理
	private currentGroups: {
		graphPathGroup?: any
		lanePathGroup?: any
		objectGroup?: any
		signalGroup?: any
		ground?: any
		sky?: any
	} = {}
	// 可见性控制相关
	private visibilityControlEnabled: boolean = false
	private visibilityConfig: {
		heightThreshold: number
		visibilityChecker?: (cameraHeight: number) => boolean
		throttleMs: number
		groups: {
			lanePathGroup: boolean
			objectGroup: boolean
			signalGroup: boolean
		}
	} | null = null
	private lastVisibilityState: boolean | null = null
	private lastUpdateTime: number = 0
	private visibilityUpdateCallback: (() => void) | null = null

	constructor(engine: ThreeEngine, options: XodrMapInitializerOptions) {
		this.engine = engine
		this.options = {
			basePath: options.basePath,
			wasmPath: options.wasmPath ?? '/wasm/OdrHandle.js',
			modalToUrl: options.modalToUrl ?? {},
			cache: {
				enabled: options.cache?.enabled ?? false,
				database: options.cache?.database ?? 'xodrCache',
				table: options.cache?.table ?? 'xodrData',
				field: options.cache?.field ?? 'shandongceshichang0125.xodr',
				expiresIn: options.cache?.expiresIn,
				autoDeleteExpired: options.cache?.autoDeleteExpired ?? true,
			},
		parseXodr: {
			path: options.parseXodr?.path ?? '/road-all.xodr',
			step: options.parseXodr?.step ?? 4,
			chunked: {
				chunkSize: options.parseXodr?.chunked?.chunkSize ?? 5 * 1024 * 1024, // 5MB
				concurrency: options.parseXodr?.chunked?.concurrency ?? 3,
			},
		},
		roadLine: options.roadLine && Object.keys(options.roadLine).length > 0 ? {
			color: options.roadLine.color ?? 0xffffff,
		} : undefined,
		signal: options.signal && Object.keys(options.signal).length > 0 ? {
			states: options.signal.states ?? ['_0', '_1', '_2'],
		} : undefined,
		tunnel: options.tunnel && Object.keys(options.tunnel).length > 0 ? {
			path: options.tunnel.path,
			color: options.tunnel.color ?? 0xffff00,
			opacity: options.tunnel.opacity ?? 0.3,
			step: options.tunnel.step ?? 2,
		} : undefined,
		bridge: options.bridge && Object.keys(options.bridge).length > 0 ? {
			color: options.bridge.color ?? 0xff0000,
			opacity: options.bridge.opacity ?? 0.3,
		} : undefined,
		ground: options.ground && Object.keys(options.ground).length > 0 ? {
			groundPath: options.ground.groundPath ?? '/ground.jpg',
			scaleFactor: options.ground.scaleFactor ?? 50,
		} : undefined,
		sky: options.sky && Object.keys(options.sky).length > 0 ? {
			skyPath: options.sky.skyPath ?? '/sky.hdr',
			hdrLoaderAdapter: options.sky.hdrLoaderAdapter ?? null,
		} : undefined,
			onProgress: options.onProgress,
		} as InternalOptions

		// 初始化可见性控制配置
		if (options.visibilityControl?.enabled) {
			this.setupVisibilityControl(options.visibilityControl)
		}
	}

	/**
	 * 清理当前场景中的组
	 * @param clearGroundAndSky 是否同时清理地面和天空，默认为 false
	 */
	private clearCurrentGroups() {
		// 从场景中移除所有组
		if (this.currentGroups.graphPathGroup) {
			this.engine.scene.remove(this.currentGroups.graphPathGroup)
			this.currentGroups.graphPathGroup = undefined
		}
		if (this.currentGroups.lanePathGroup) {
			this.engine.scene.remove(this.currentGroups.lanePathGroup)
			this.currentGroups.lanePathGroup = undefined
		}
		if (this.currentGroups.objectGroup) {
			this.engine.scene.remove(this.currentGroups.objectGroup)
			this.currentGroups.objectGroup = undefined
		}
		if (this.currentGroups.signalGroup) {
			this.engine.scene.remove(this.currentGroups.signalGroup)
			this.currentGroups.signalGroup = undefined
		}
		if (this.currentGroups.ground) {
			this.engine.scene.remove(this.currentGroups.ground)
			this.currentGroups.ground = undefined
		}
		if (this.currentGroups.sky) {
			this.engine.scene.remove(this.currentGroups.sky)
			this.currentGroups.sky = undefined
		}
	}

	/**
	 * 初始化 XODR 地图
	 * @param xodrPath 可选的 XODR 文件路径，如果不提供则使用配置中的路径
	 * @returns 返回渲染后的组和边界框
	 */
	async initialize(xodrPath?: string): Promise<XodrMapInitializerResult> {
		// 如果提供了新的 xodrPath，更新配置
		if (xodrPath) {
			this.options.parseXodr.path = xodrPath
			// 同时更新缓存字段名（如果启用缓存）
			if (this.options.cache.enabled) {
				// 从路径中提取文件名作为缓存字段名
				const fileName = xodrPath.split('/').pop() || xodrPath
				this.options.cache.field = fileName
			}
		}

		// 清理旧的组
		this.clearCurrentGroups()
		// 1. 加载 WebAssembly 模块
		await loadWasm(this.options.basePath + this.options.wasmPath)

		// 2. 创建组
		const graphPathGroup = createGroup()
		const lanePathGroup = createGroup()
		this.engine.scene.add(graphPathGroup)
		this.engine.scene.add(lanePathGroup)
		
		// 保存组引用
		this.currentGroups.graphPathGroup = graphPathGroup
		this.currentGroups.lanePathGroup = lanePathGroup

		// 3. 加载、解析和渲染 XODR 数据
		const { boundingBox } = await this.loadAndRenderXodr(graphPathGroup, lanePathGroup)

		// 4. 创建地面和天空
		const { ground, sky } = await this.createGroundAndSky(boundingBox)

		// 5. 加载信号组和对象组
		const { signalGroup, objectGroup } = await this.loadSignalsAndObjects()

		// 6. 初始化完成后，立即更新一次可见性（如果启用了可见性控制）
		// 确保初始状态正确，不经过节流
		if (this.visibilityControlEnabled) {
			this._updateVisibilityImmediate()
		}

		return {
			graphPathGroup,
			lanePathGroup,
			objectGroup,
			signalGroup,
			ground,
			sky,
			boundingBox,
		}
	}

	/**
	 * 加载、解析和渲染 XODR 数据
	 * @param graphPathGroup 路面组
	 * @param lanePathGroup 路线组
	 * @returns 返回边界框
	 */
	private async loadAndRenderXodr(graphPathGroup: any, lanePathGroup: any): Promise<{ boundingBox: any }> {
		// 加载 XODR 文件
		const mapData = await loadXodrChunked({
			url: this.options.basePath + this.options.parseXodr.path,
			chunkSize: this.options.parseXodr.chunked.chunkSize,
			concurrency: this.options.parseXodr.chunked.concurrency,
			onProgress: this.options.onProgress,
		})

		// 解析 XODR 数据
		const data = await parseXodrData(mapData, this.options.parseXodr.step)

		// 缓存数据
		if (this.options.cache.enabled) {
			await cacheXodrData({
				database: this.options.cache.database,
				table: this.options.cache.table,
				field: this.options.cache.field,
				data,
				expiresIn: this.options.cache.expiresIn,
			})
		}

		// 渲染路面
		renderXodrFaces(data, graphPathGroup, {})
		
		// 如果配置了 roadLine，则渲染道路线条
		let allRoadPoints: any[] = []
		if (this.options.roadLine) {
			const lineResult = renderXodrLines(data, lanePathGroup, {
				defaultLineColor: this.options.roadLine.color ?? 0xffffff,
			})
			allRoadPoints = lineResult?.allRoadPoints || []
		} else {
			// 即使不渲染线条，也需要提取道路点用于设置相机位置
			const { allRoadPoints: extractedPoints } = processLineData(data, 0xffffff)
			allRoadPoints = extractedPoints || []
		}

		if (!allRoadPoints || allRoadPoints.length === 0) {
			throw new Error('No road points found in XODR data')
		}

		// 计算视图中心并设置相机位置
		const { boundingBox } = this.engine.setCameraAndControls(allRoadPoints)

		return { boundingBox }
	}

	/**
	 * 创建地面和天空
	 * @param boundingBox 边界框
	 * @returns 返回地面和天空对象
	 */
	private async createGroundAndSky(boundingBox: any): Promise<{ ground: any; sky: any }> {
		let ground: any = null
		let sky: any = null
		
		// 如果同时需要地面和天空，只实例化一次 GroundGrip
		if (this.options.ground || this.options.sky) {
			const groundGrip = new GroundGrip({
				boundingBox,
				// 地面需要 scaleFactor，天空不需要，所以优先使用 ground 的配置
				scaleFactor: this.options.ground?.scaleFactor ?? 50,
				// 天空需要 hdrLoaderAdapter，地面不需要，所以优先使用 sky 的配置
				hdrLoaderAdapter: this.options.sky?.hdrLoaderAdapter ?? null,
			})

			// 创建地面（如果配置了 ground）
			if (this.options.ground) {
				ground = groundGrip.addGroud({
					url: this.options.basePath + this.options.ground.groundPath,
				})

				if (ground) {
					this.engine.scene.add(ground)
				}
				
				// 保存地面引用
				this.currentGroups.ground = ground
			}

			// 创建天空（如果配置了 sky）
			if (this.options.sky) {
				sky = await groundGrip.addSky({
					url: this.options.basePath + this.options.sky.skyPath,
					isUseCache: this.options.cache.enabled,
					database: this.options.cache.database,
					table: this.options.cache.table,
				})

				if (sky) {
					this.engine.scene.add(sky)
				}
				
				// 保存天空引用
				this.currentGroups.sky = sky
			}
		}

		return { ground, sky }
	}

	/**
	 * 加载信号组和对象组
	 * @returns 返回信号组和对象组
	 */
	private async loadSignalsAndObjects(): Promise<{ signalGroup: any; objectGroup: any }> {
		let signalGroup: any = null
		let objectGroup: any = null

		// 添加信号组
		if (this.options.signal && this.options.modalToUrl && Object.keys(this.options.modalToUrl).length > 0) {
			const signalResult = await drawSignals(
				this.options.modalToUrl,
				{
					isLoad: true,
					states: this.options.signal.states ?? ['_0', '_1', '_2'],
				},
				{
					useCache: this.options.cache.enabled,
					database: this.options.cache.database,
					table: this.options.cache.table,
				}
			) as any

			if (signalResult?.signalGroup) {
				signalGroup = signalResult.signalGroup
				this.engine.scene.add(signalGroup)
				// 保存信号组引用
				this.currentGroups.signalGroup = signalGroup
			}
		}

		// 添加对象组
		if (this.options.modalToUrl && Object.keys(this.options.modalToUrl).length > 0) {
			const objectResult = await drawObjects(this.options.modalToUrl, {
				useCache: this.options.cache.enabled,
				database: this.options.cache.database,
				table: this.options.cache.table,
			}) as any

			if (objectResult?.objectGroup) {
				objectGroup = objectResult.objectGroup
				this.engine.scene.add(objectGroup)
				// 保存对象组引用
				this.currentGroups.objectGroup = objectGroup
				
				// 添加隧道（如果配置了 tunnel）
				if (this.options.tunnel) {
					const tunnelsGroup = await drawTunnels(
						this.options.tunnel.path, 
						this.options.tunnel.step ?? 2, 
						this.options.tunnel.color ?? 0xffff00, 
						this.options.tunnel.opacity ?? 0.3
					)
					if (tunnelsGroup) {
						objectGroup.add(tunnelsGroup)
					}
				}

				// 添加桥梁（如果配置了 bridge）
				if (this.options.bridge) {
					const bridgesGroup = await drawBridges(
						this.options.bridge.color ?? 0xff0000, 
						this.options.bridge.opacity ?? 0.3
					)
					if (bridgesGroup) {
						objectGroup.add(bridgesGroup)
					}
				}
			}
		}

		return { signalGroup, objectGroup }
	}

	/**
	 * 重新加载 XODR 文件
	 * @param xodrPath 新的 XODR 文件路径
	 * @returns 返回渲染后的组和边界框
	 */
	async reloadXodr(xodrPath: string): Promise<XodrMapInitializerResult> {
		// 更新配置
		this.options.parseXodr.path = xodrPath
		// 同时更新缓存字段名（如果启用缓存）
		if (this.options.cache.enabled) {
			// 从路径中提取文件名作为缓存字段名
			const fileName = xodrPath.split('/').pop() || xodrPath
			this.options.cache.field = fileName
		}

		// 清理旧的组（包括 ground 和 sky，因为会重新创建）
		this.clearCurrentGroups()

		// 重新创建组
		const graphPathGroup = createGroup()
		const lanePathGroup = createGroup()
		this.engine.scene.add(graphPathGroup)
		this.engine.scene.add(lanePathGroup)
		
		// 保存组引用
		this.currentGroups.graphPathGroup = graphPathGroup
		this.currentGroups.lanePathGroup = lanePathGroup

		// 1. 加载、解析和渲染 XODR 数据
		const { boundingBox } = await this.loadAndRenderXodr(graphPathGroup, lanePathGroup)

		// 2. 创建地面和天空
		const { ground, sky } = await this.createGroundAndSky(boundingBox)

		// 4. 加载信号组和对象组
		const { signalGroup, objectGroup } = await this.loadSignalsAndObjects()

		// 5. 初始化完成后，立即更新一次可见性（如果启用了可见性控制）
		// 确保初始状态正确，不经过节流
		if (this.visibilityControlEnabled) {
			this._updateVisibilityImmediate()
		}

		return {
			graphPathGroup,
			lanePathGroup,
			objectGroup,
			signalGroup,
			ground,
			sky,
			boundingBox,
		}
	}

	/**
	 * 设置可见性控制配置
	 * @param config 可见性控制配置
	 */
	private setupVisibilityControl(config: {
		enabled?: boolean
		heightThreshold?: number
		visibilityChecker?: (cameraHeight: number) => boolean
		throttleMs?: number
		groups?: {
			lanePathGroup?: boolean
			objectGroup?: boolean
			signalGroup?: boolean
		}
	}): void {
		this.visibilityControlEnabled = true
		this.visibilityConfig = {
			heightThreshold: config.heightThreshold ?? 400,
			visibilityChecker: config.visibilityChecker,
			throttleMs: config.throttleMs ?? 100,
			// 处理用户自定义的 groups 配置
			// 如果用户传入了 false，则使用 false；如果未传入或传入 undefined，则默认为 true
			// 例如：{ lanePathGroup: false } 只会控制 objectGroup 和 signalGroup
			groups: {
				lanePathGroup: config.groups?.lanePathGroup ?? true,
				objectGroup: config.groups?.objectGroup ?? true,
				signalGroup: config.groups?.signalGroup ?? true,
			},
		}

		// 创建节流更新函数
		this.visibilityUpdateCallback = () => {
			this._updateVisibilityWithThrottle()
		}

		// 注册到引擎的动画循环（如果引擎支持）
		// 注意：这里需要引擎提供注册回调的机制，暂时通过手动调用
	}

	/**
	 * 启用可见性自动控制
	 * @param config 可见性控制配置
	 */
	enableVisibilityControl(config?: {
		heightThreshold?: number
		visibilityChecker?: (cameraHeight: number) => boolean
		throttleMs?: number
		groups?: {
			lanePathGroup?: boolean
			objectGroup?: boolean
			signalGroup?: boolean
		}
	}): void {
		if (config) {
			this.setupVisibilityControl({
				enabled: true,
				...config,
			})
		} else {
			this.visibilityControlEnabled = true
		}
	}

	/**
	 * 禁用可见性自动控制
	 */
	disableVisibilityControl(): void {
		this.visibilityControlEnabled = false
		this.visibilityUpdateCallback = null
	}

	/**
	 * 获取可见性更新回调函数（用于注册到动画循环）
	 * @returns 回调函数，如果未启用则返回 null
	 */
	getVisibilityUpdateCallback(): (() => void) | null {
		return this.visibilityUpdateCallback
	}

	/**
	 * 立即更新可见性（不经过节流，用于初始化时）
	 */
	private _updateVisibilityImmediate(): void {
		if (!this.visibilityControlEnabled || !this.visibilityConfig || !this.engine?.camera) {
			return
		}

		const cameraHeight = this.engine.camera.position.y
		
		// 使用自定义判断函数或默认的高度阈值判断
		let isVisible: boolean
		if (this.visibilityConfig.visibilityChecker) {
			isVisible = this.visibilityConfig.visibilityChecker(cameraHeight)
		} else {
			isVisible = cameraHeight <= this.visibilityConfig.heightThreshold
		}

		// 更新状态缓存
		this.lastVisibilityState = isVisible
		this.lastUpdateTime = Date.now()

		// 根据用户配置的 groups 更新组的可见性
		// 只更新用户指定要控制的组，且该组已创建
		const { groups } = this.visibilityConfig
		
		// 更新路线组（如果用户配置了要控制且组已创建）
		if (groups.lanePathGroup && this.currentGroups.lanePathGroup) {
			this.currentGroups.lanePathGroup.visible = isVisible
		}
		
		// 更新对象组（如果用户配置了要控制且组已创建）
		if (groups.objectGroup && this.currentGroups.objectGroup) {
			this.currentGroups.objectGroup.visible = isVisible
		}
		
		// 更新信号组（如果用户配置了要控制且组已创建）
		if (groups.signalGroup && this.currentGroups.signalGroup) {
			this.currentGroups.signalGroup.visible = isVisible
		}
	}

	/**
	 * 带节流的可见性更新（内部方法）
	 */
	private _updateVisibilityWithThrottle(): void {
		if (!this.visibilityControlEnabled || !this.visibilityConfig || !this.engine?.camera) {
			return
		}

		const now = Date.now()
		// 节流检查
		if (now - this.lastUpdateTime < this.visibilityConfig.throttleMs) {
			return
		}

		const cameraHeight = this.engine.camera.position.y
		
		// 使用自定义判断函数或默认的高度阈值判断
		let isVisible: boolean
		if (this.visibilityConfig.visibilityChecker) {
			isVisible = this.visibilityConfig.visibilityChecker(cameraHeight)
		} else {
			isVisible = cameraHeight <= this.visibilityConfig.heightThreshold
		}

		// 状态缓存：避免重复设置相同的可见性
		if (this.lastVisibilityState === isVisible) {
			return
		}

		this.lastVisibilityState = isVisible
		this.lastUpdateTime = now

		// 根据用户配置的 groups 更新组的可见性
		// 只更新用户指定要控制的组，且该组已创建
		const { groups } = this.visibilityConfig
		
		// 更新路线组（如果用户配置了要控制且组已创建）
		if (groups.lanePathGroup && this.currentGroups.lanePathGroup) {
			this.currentGroups.lanePathGroup.visible = isVisible
		}
		
		// 更新对象组（如果用户配置了要控制且组已创建）
		if (groups.objectGroup && this.currentGroups.objectGroup) {
			this.currentGroups.objectGroup.visible = isVisible
		}
		
		// 更新信号组（如果用户配置了要控制且组已创建）
		if (groups.signalGroup && this.currentGroups.signalGroup) {
			this.currentGroups.signalGroup.visible = isVisible
		}
	}
}
