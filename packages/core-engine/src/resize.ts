// /**
//  * 防抖函数的简单实现
//  */
// function debounce(func: () => void, wait: number): () => void {
// 	let timeout: ReturnType<typeof setTimeout> | null = null
// 	return function executedFunction() {
// 		const later = () => {
// 			timeout = null
// 			func()
// 		}
// 		if (timeout) {
// 			clearTimeout(timeout)
// 		}
// 		timeout = setTimeout(later, wait)
// 	}
// }

/**
 * 立即执行的防抖函数
 */
function debounceImmediate(func: () => void, wait: number): () => void {
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

let removeResizeListener: (() => void) | null = null

/**
 * 设置窗口大小变化监听器
 * @param container 容器元素
 * @param camera 相机对象（PerspectiveCamera 或 OrthographicCamera）
 * @param renderer 渲染器对象
 * @param wait 防抖延迟时间（毫秒），默认为 200
 * @returns 清理函数，用于移除监听器
 */
export function setupResizeListener(container: HTMLElement, camera: any, renderer: any, wait: number = 200): () => void {
	// 先移除之前的监听器，防止重复绑定
	if (removeResizeListener) {
		removeResizeListener()
	}

	const onResize = () => {
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
	}

	const debouncedOnResize = debounceImmediate(onResize, wait)

	// 添加事件监听
	window.addEventListener('resize', debouncedOnResize)

	// 返回清理函数
	removeResizeListener = () => {
		window.removeEventListener('resize', debouncedOnResize)
		removeResizeListener = null
	}

	return removeResizeListener
}

