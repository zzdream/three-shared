import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import type { HDREnvironmentLoaderAdapter } from '@shared/core-engine'

/**
 * Three.js r157 适配器
 * 使用 RGBELoader 加载 HDR 环境贴图
 */
export const hdrEnvironmentLoaderAdapter: HDREnvironmentLoaderAdapter = {
  createLoader(manager?: any) {
    return new RGBELoader(manager)
  },
  version: 'r157'
}

export default hdrEnvironmentLoaderAdapter

