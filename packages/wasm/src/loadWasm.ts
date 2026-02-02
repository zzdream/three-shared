export const loadWasm = async (url: string): Promise<void> => {
	await loadScript(url, 'wasm-library')
	return new Promise((resolve) => {
		// 保存原有的回调（如果存在）
		const originalCallback = window.Module.onRuntimeInitialized
		window.Module.onRuntimeInitialized = async () => {
			// 调用原有的回调（如果存在）
			if (originalCallback && typeof originalCallback === 'function') {
				await originalCallback()
			}
			resolve(window.Module as any)
		}
	})
}

export function loadScript(src: string, id: string) {
	// 检查 script 是否已经加载
	if (document.getElementById(id)) {
		return Promise.resolve()
	}
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = src
		script.id = id
		script.onload = () => resolve(script)
		script.onerror = () => reject(new Error(`Failed to load the script ${src}`))
		document.head.appendChild(script)
	})
}