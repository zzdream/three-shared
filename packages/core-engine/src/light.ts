// three 是 peerDependency，类型定义由使用方项目的 @types/three 提供
// 使用 any 类型以避免类型检查错误，运行时由使用方项目提供正确的 three 版本
import * as THREE from 'three'

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
 * 初始化光照
 * @param scene 场景对象
 * @param options 光照配置选项
 * @returns 返回平行光对象
 */
export function initLight(scene: any, options: LightOptions = {}): any {
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

