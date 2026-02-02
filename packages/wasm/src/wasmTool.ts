/**
 * 解析 XODR 数据
 * 依赖 window.Module (WebAssembly 模块)
 * 
 * 使用前请确保已调用 loadWasm() 加载 WebAssembly 模块
 */
declare global {
	interface Window {
		Module: {
			onRuntimeInitialized?: () => void | Promise<void>
			cwrap?: (name: string, returnType: string, argTypes: string[] | string) => (...args: any[]) => any
			_malloc?: (size: number) => number
			_free?: (ptr: number) => void
			lengthBytesUTF8?: (str: string) => number
			stringToUTF8?: (str: string, outPtr: number, maxBytesToWrite: number) => void
			[key: string]: any
		}
	}
}
/**
 * 加载 OpenDRIVE 内容到 WebAssembly 模块
 * @param xodr XODR 文件内容（字符串）
 */
export function loadOpenDRIVEContent(xodr: string): void {
	// 分配内存并拷贝数据
	const lengthBytes = window.Module.lengthBytesUTF8!(xodr) + 1
	const stringOnWasmHeap = window.Module._malloc!(lengthBytes)
	window.Module.stringToUTF8!(xodr, stringOnWasmHeap, lengthBytes)
	// 调用 WebAssembly 函数
	const loadOpenDRIVEContent = window.Module.cwrap!('loadOpenDRIVEContent', 'string', ['number'])
	loadOpenDRIVEContent(stringOnWasmHeap)
	// 释放分配的内存
	window.Module._free!(stringOnWasmHeap)
}

/**
 * 获取所有道路数据
 * @param step 步长，默认为 1
 * @returns 解析后的道路数据数组
 */
export async function getRoadData(step: number = 1): Promise<any[]> {
	console.time('getRoadData')
	const getSingleRoadData = window.Module.cwrap!('getSingleRoadData', 'string', 'number')
	const data = []
	let result
	while ((result = getSingleRoadData(step))) {
	  data.push(JSON.parse(result))
	}
	console.timeEnd('getRoadData')
	return data
}
/**
 * 获取信号信息
 * @returns 信号信息列表
 */
export const getXodrSignalsInfo = async (): Promise<any[]> => {
	const getSignals = window.Module.cwrap!('getSignalsInfo', 'string', '')
	const result = getSignals()
	if (!result) {
		return []
	}
	const list = JSON.parse(result)
	return list
}

/**
 * 获取 XODR 对象信息
 * @returns 对象信息列表
 */
export const drawXodrObjects = async (): Promise<any[]> => {
	const getObjects = window.Module.cwrap!('getObjectsInfo', 'string', '')
	const result = getObjects()
	if (!result) {
		return []
	}
	const list = JSON.parse(result)
	return list
}
/**
 * 获取桥梁信息
 * @returns 桥梁信息列表
 */
export const getBridgesDrawInfo = async (): Promise<any>  => {
    const BridgesDrawInfo = window.Module.cwrap!('getBridgesDrawInfo', 'string', 'number')
    const result = BridgesDrawInfo(1)
    if (!result || result.includes('null')) return null
    console.log(JSON.parse(result))
  }
  
  /**
   * 获取隧道信息
   * @returns 隧道信息列表
   */
  export const getTunnelsDrawInfo = async (step: number): Promise<any>  => {
    const TunnelsDrawInfo = window.Module.cwrap!('getTunnelsDrawInfo', 'string', 'number')
    const result = TunnelsDrawInfo(step)
    if (!result || result.includes('null')) return null
    const list = JSON.parse(result)
    return list
}
  