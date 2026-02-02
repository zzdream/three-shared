// three 是 peerDependency，类型定义由使用方项目的 @types/three 提供
// 使用 any 类型以避免类型检查错误，运行时由使用方项目提供正确的 three 版本
import * as THREE from 'three'

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
 * 初始化透视相机
 * @param container 容器元素
 * @param options 相机配置选项
 * @returns 初始化后的相机对象
 */
export function initCamera(container: HTMLElement, options: CameraOptions = {}): any {
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

