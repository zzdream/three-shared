import { loadXodr, type LoadXodrOptions } from './loadXodr'
import { parseXodrData } from './parseXodr'
import { loadXodrChunked, type LoadXodrChunkedOptions } from './loadXodrChunked'
import {
	renderXodrFaces,
	renderXodrLines,
	processFaceData,
	processLineData,
	createLineSegments,
} from './renderXodr'
import { drawObjects, drawSignals } from './drawXdorInfo'
import {
	cacheXodrData,
	getCachedXodrData,
	deleteCachedXodrData,
	clearCachedXodrData,
	closeDB,
	closeAllDB,
	cleanExpiredData,
	getCacheTTL,
	type CacheDBConfig,
	type CacheXodrDataParams,
	type GetCachedXodrDataParams,
} from '@threejs-shared/cache-db'
import { drawTunnels, drawBridges } from './Tunnel'
export { loadXodr, parseXodrData, loadXodrChunked }
export type { LoadXodrOptions, LoadXodrChunkedOptions }
export {
	renderXodrFaces,
	renderXodrLines,
	processFaceData,
	processLineData,
	createLineSegments,
}
// 缓存 xodr api
export {
	cacheXodrData,
	getCachedXodrData,
	deleteCachedXodrData,
	clearCachedXodrData,
	closeDB,
	closeAllDB,
	cleanExpiredData,
	getCacheTTL,
}
export type { CacheDBConfig, CacheXodrDataParams, GetCachedXodrDataParams }

export { drawObjects, drawSignals, drawTunnels, drawBridges }

// XODR 地图初始化器
export { XodrMapInitializer } from './XodrMapInitializer'
export type { XodrMapInitializerOptions, XodrMapInitializerResult } from './XodrMapInitializer'