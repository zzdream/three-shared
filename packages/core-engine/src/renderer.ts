// three 是 peerDependency，类型定义由使用方项目的 @types/three 提供
// 使用 any 类型以避免类型检查错误，运行时由使用方项目提供正确的 three 版本
import * as THREE from 'three'

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
 * 初始化 WebGL 渲染器
 * @param container 容器元素
 * @param options 渲染器配置选项
 * @returns 初始化后的渲染器对象
 */
export function initRenderer(container: HTMLElement, options: RendererOptions = {}): any {
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

