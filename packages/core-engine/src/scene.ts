// three 是 peerDependency，类型定义由使用方项目的 @types/three 提供
// 使用 any 类型以避免类型检查错误，运行时由使用方项目提供正确的 three 版本
import * as THREE from 'three'

/**
 * 场景配置选项
 */
export interface SceneOptions {
	/** 背景色，默认为 0xf7f7f8 */
	backgroundColor?: number | string
}

/**
 * 初始化 Three.js 场景
 * @param options 场景配置选项
 * @returns 初始化后的场景对象
 */
export function initScene(options: SceneOptions = {}): any {
	const { backgroundColor = 0xf7f7f8 } = options

	const scene = new (THREE as any).Scene()
	scene.background = new (THREE as any).Color(backgroundColor)

	return scene
}

