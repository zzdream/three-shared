import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import type { HDREnvironmentLoaderAdapter } from '@shared/core-engine'

/**
 * Three.js r182 适配器
 * 使用 HDRLoader 加载 HDR 环境贴图（RGBELoader 的替代品）
 */
export const hdrEnvironmentLoaderAdapter: HDREnvironmentLoaderAdapter = {
  createLoader(manager?: any) {
    return new HDRLoader(manager)
  },
  version: 'r182'
}

export default hdrEnvironmentLoaderAdapter

