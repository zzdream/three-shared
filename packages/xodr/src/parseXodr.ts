import { loadOpenDRIVEContent, getRoadData } from '@shared/wasm'

/**
 * 解析 XODR 数据
 * 这是主要的 API，业务项目应该使用这个方法
 * @param xodr XODR 文件内容（字符串）
 * @param step 步长，默认为 1
 * @returns 解析后的道路数据数组
 */
export async function parseXodrData(xodr: string, step: number = 1): Promise<any[]> {
	// 加载 OpenDRIVE 内容
	loadOpenDRIVEContent(xodr)
	// 获取道路数据
	const data = await getRoadData(step)
	return data
}
