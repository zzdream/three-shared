// three 是 peerDependency，类型定义由使用方项目的 @types/three 提供
// 使用 any 类型以避免类型检查错误，运行时由使用方项目提供正确的 three 版本
import * as THREE from 'three'

/**
 * 相机和控制器工具函数
 */

/**
 * 计算视图中心点
 * @param allRoadPoints 所有道路点数组
 * @returns 返回中心点、最大尺寸和边界框
 */
export function calculateViewCenter(allRoadPoints: any[]) {
	if (!allRoadPoints || !Array.isArray(allRoadPoints) || allRoadPoints.length === 0) {
		throw new Error('Invalid input: allRoadPoints must be a non-empty array.')
	}

	const boundingBox = new (THREE as any).Box3().setFromPoints(allRoadPoints)
	const center = boundingBox.getCenter(new (THREE as any).Vector3())
	const size = boundingBox.getSize(new (THREE as any).Vector3())
	const maxSize = size.length()

	return { center, maxSize, boundingBox }
}

/**
 * 设置相机和控制器位置
 * @param center 视图中心点（Vector3）
 * @param maxSize 视图最大尺寸
 * @param camera 相机对象
 * @param controls 控制器对象
 */
export function setupCameraAndControls(center: any, maxSize: number, camera: any, controls: any) {
	if (!camera || !controls) {
		throw new Error('Camera and controls must be provided.')
	}

	// 获取相机的fov（视场角度）
	const fov = camera.fov * (Math.PI / 180) // 将fov从度转换为弧度

	// 为了简化计算，假设想要的视角包含整个边界框的对角线
	// 使用简单的三角函数来估算理想的距离。这里我们假设相机完全面向目标
	// tan(fov / 2) = (maxSize / 2) / distance
	const distance = maxSize / 2 / Math.tan(fov / 2)

	// 使用计算出的distance设置相机位置
	camera.position.set(center.x, center.y + distance, center.z)
	camera.lookAt(center.x, center.y, center.z)

	// 更新OrbitControls
	controls.target.set(center.x, center.y, center.z)
	controls.update()
}

/**
 * 设置相机和控制器位置（便捷函数）
 * @param allRoadPoints 所有道路点数组
 * @param camera 相机对象
 * @param controls 控制器对象
 * @returns 返回边界框
 */
export const setCenterAndCamera = ({ allRoadPoints, camera, controls }: { allRoadPoints: any[]; camera: any; controls: any }) => {
	if (!allRoadPoints || !camera || !controls) {
		throw new Error('Invalid input: allRoadPoints, camera and controls must be provided.')
	}
	const { center, maxSize, boundingBox } = calculateViewCenter(allRoadPoints)
	setupCameraAndControls(center, maxSize, camera, controls)
	return { boundingBox }
}