import { loadWasm } from '@shared/wasm'
import { loadXodrChunked, parseXodrData, renderXodrFaces, renderXodrLines, drawObjects, drawSignals, drawTunnels, drawBridges, getCachedXodrData, cacheXodrData } from './index'
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
	/** XODR 文件路径（相对于 basePath） */
	xodrPath?: string
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
	/** 分块加载配置 */
	chunked?: {
		/** 每块大小（字节），默认 5MB */
		chunkSize?: number
		/** 并发数，默认 3 */
		concurrency?: number
	}
	/** 解析配置 */
	parse?: {
		/** 解析步长，默认 4 */
		step?: number
	}
	/** 渲染配置 */
	render?: {
		/** 默认线条颜色 */
		defaultLineColor?: number
		/** 信号状态列表 */
		signalStates?: string[]
		/** 隧道模型路径 */
		tunnelPath?: string
		/** 桥梁颜色 */
		bridgeColor?: number
	}
	/** 地面配置 */
	ground?: {
		/** 是否启用地面和天空，默认 true */
		enabled?: boolean
		/** 地面贴图路径（相对于 basePath），默认 '/ground.jpg' */
		groundPath?: string
		/** 天空 HDR 贴图路径（相对于 basePath），默认 '/sky.hdr' */
		skyPath?: string
		/** 缩放因子，默认 50 */
		scaleFactor?: number
		/** HDR Loader 适配器 */
		hdrLoaderAdapter?: any
	}
	/** 进度回调 */
	onProgress?: (loaded: number, total: number) => void
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
	/** 边界框 */
	boundingBox: any
}

/**
 * 内部使用的选项类型，确保所有嵌套对象都不是 undefined
 */
type InternalOptions = Required<Pick<XodrMapInitializerOptions, 'basePath'>> & 
	Omit<XodrMapInitializerOptions, 'cache' | 'chunked' | 'parse' | 'render' | 'ground'> & {
		cache: Required<NonNullable<XodrMapInitializerOptions['cache']>>
		chunked: Required<NonNullable<XodrMapInitializerOptions['chunked']>>
		parse: Required<NonNullable<XodrMapInitializerOptions['parse']>>
		render: Required<NonNullable<XodrMapInitializerOptions['render']>>
		ground: Required<NonNullable<XodrMapInitializerOptions['ground']>>
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

	constructor(engine: ThreeEngine, options: XodrMapInitializerOptions) {
		this.engine = engine
		this.options = {
			basePath: options.basePath,
			wasmPath: options.wasmPath ?? '/wasm/OdrHandle.js',
			xodrPath: options.xodrPath ?? '/road-all.xodr',
			modalToUrl: options.modalToUrl ?? {},
			cache: {
				enabled: options.cache?.enabled ?? false,
				database: options.cache?.database ?? 'xodrCache',
				table: options.cache?.table ?? 'xodrData',
				field: options.cache?.field ?? 'road-all.xodr',
				expiresIn: options.cache?.expiresIn,
				autoDeleteExpired: options.cache?.autoDeleteExpired ?? true,
			},
			chunked: {
				chunkSize: options.chunked?.chunkSize ?? 5 * 1024 * 1024, // 5MB
				concurrency: options.chunked?.concurrency ?? 3,
			},
			parse: {
				step: options.parse?.step ?? 4,
			},
			render: {
				defaultLineColor: options.render?.defaultLineColor ?? 0xffffff,
				signalStates: options.render?.signalStates ?? ['_0', '_1', '_2'],
				tunnelPath: options.render?.tunnelPath,
				bridgeColor: options.render?.bridgeColor ?? 0xff0000,
			},
			ground: {
				enabled: options.ground?.enabled ?? true,
				groundPath: options.ground?.groundPath ?? '/ground.jpg',
				skyPath: options.ground?.skyPath ?? '/sky.hdr',
				scaleFactor: options.ground?.scaleFactor ?? 50,
				hdrLoaderAdapter: options.ground?.hdrLoaderAdapter ?? null,
			},
			onProgress: options.onProgress,
		} as InternalOptions
	}

	/**
	 * 清理当前场景中的组
	 */
	private clearCurrentGroups() {
		// 从场景中移除所有组（不包括 ground 和 sky，它们不需要更换）
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
		// ground 和 sky 不清理，保持原样
	}

	/**
	 * 初始化 XODR 地图
	 * @param xodrPath 可选的 XODR 文件路径，如果不提供则使用配置中的路径
	 * @returns 返回渲染后的组和边界框
	 */
	async initialize(xodrPath?: string): Promise<XodrMapInitializerResult> {
		// 如果提供了新的 xodrPath，更新配置
		if (xodrPath) {
			this.options.xodrPath = xodrPath
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

		// 4. 创建地面和天空（可选，只在第一次初始化时创建）
		if (this.options.ground.enabled) {
			const groundGrip = new GroundGrip({
				boundingBox,
				scaleFactor: this.options.ground.scaleFactor,
				hdrLoaderAdapter: this.options.ground.hdrLoaderAdapter,
			})

			const ground = groundGrip.addGroud({
				url: this.options.basePath + this.options.ground.groundPath,
			})

			const sky = await groundGrip.addSky({
				url: this.options.basePath + this.options.ground.skyPath,
				isUseCache: this.options.cache.enabled,
				database: this.options.cache.database,
				table: this.options.cache.table,
			})

			if (ground) {
				this.engine.scene.add(ground)
			}
			if (sky) {
				this.engine.scene.add(sky)
			}
			
			// 保存地面和天空引用
			this.currentGroups.ground = ground
			this.currentGroups.sky = sky
		}

		// 5. 加载信号组和对象组
		const { signalGroup, objectGroup } = await this.loadSignalsAndObjects()

		return {
			graphPathGroup,
			lanePathGroup,
			objectGroup,
			signalGroup,
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
			url: this.options.basePath + this.options.xodrPath,
			chunkSize: this.options.chunked.chunkSize,
			concurrency: this.options.chunked.concurrency,
			onProgress: this.options.onProgress,
		})

		// 解析 XODR 数据
		const data = await parseXodrData(mapData, this.options.parse.step)

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

		// 渲染路面和道路边界线
		renderXodrFaces(data, graphPathGroup, {})
		const lineResult = renderXodrLines(data, lanePathGroup, {
			defaultLineColor: this.options.render.defaultLineColor,
		})

		if (!lineResult?.allRoadPoints || lineResult.allRoadPoints.length === 0) {
			throw new Error('No road points found in XODR data')
		}

		// 计算视图中心并设置相机位置
		const { boundingBox } = this.engine.setCameraAndControls(lineResult.allRoadPoints)

		return { boundingBox }
	}

	/**
	 * 加载信号组和对象组
	 * @returns 返回信号组和对象组
	 */
	private async loadSignalsAndObjects(): Promise<{ signalGroup: any; objectGroup: any }> {
		let signalGroup: any = null
		let objectGroup: any = null

		// 添加信号组
		if (this.options.modalToUrl && Object.keys(this.options.modalToUrl).length > 0) {
			const signalResult = await drawSignals(
				this.options.modalToUrl,
				{
					isLoad: true,
					states: this.options.render.signalStates,
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

				// 添加隧道
				if (this.options.render.tunnelPath) {
					const tunnelsGroup = await drawTunnels(this.options.render.tunnelPath, 2)
					if (tunnelsGroup) {
						objectGroup.add(tunnelsGroup)
					}
				}

				// 添加桥梁
				const bridgesGroup = await drawBridges(this.options.render.bridgeColor)
				if (bridgesGroup) {
					objectGroup.add(bridgesGroup)
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
		this.options.xodrPath = xodrPath
		// 同时更新缓存字段名（如果启用缓存）
		if (this.options.cache.enabled) {
			// 从路径中提取文件名作为缓存字段名
			const fileName = xodrPath.split('/').pop() || xodrPath
			this.options.cache.field = fileName
		}

		// 清理旧的组（不包括 ground 和 sky）
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

		// 2. 加载信号组和对象组
		const { signalGroup, objectGroup } = await this.loadSignalsAndObjects()

		return {
			graphPathGroup,
			lanePathGroup,
			objectGroup,
			signalGroup,
			boundingBox,
		}
	}
}

