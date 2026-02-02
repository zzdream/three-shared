/**
 * 动画循环回调函数
 */
export type AnimateCallback = () => void

/**
 * 创建动画循环函数
 * @param scene 场景对象
 * @param camera 相机对象
 * @param renderer 渲染器对象
 * @param controls 控制器对象（可选）
 * @param callback 每帧执行的回调函数（可选）
 * @returns 停止动画的函数
 */
export function createAnimateLoop(scene: any, camera: any, renderer: any, controls?: any, callback?: AnimateCallback): () => void {
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
 * 简单的动画循环函数（兼容旧的调用方式）
 * @param scene 场景对象
 * @param camera 相机对象
 * @param renderer 渲染器对象
 * @param controls 控制器对象（可选）
 * @param callback 每帧执行的回调函数（可选）
 */
export function animate(scene: any, camera: any, renderer: any, controls?: any, callback?: AnimateCallback): void {
	createAnimateLoop(scene, camera, renderer, controls, callback)
}

