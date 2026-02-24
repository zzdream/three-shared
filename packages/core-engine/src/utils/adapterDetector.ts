import type { HDREnvironmentLoaderAdapter } from '../types/adapter'

/**
 * 自动检测并返回可用的 HDR/RGBE Loader 适配器
 * 优先使用 HDRLoader (r182+)，如果不存在则回退到 RGBELoader (r157)
 */
export async function autoDetectHDREnvironmentLoaderAdapter(): Promise<HDREnvironmentLoaderAdapter> {
  // 优先尝试使用 HDRLoader (r182+)
  // try {
  //   const hdrModule = await import('three/examples/jsm/loaders/HDRLoader.js' as any)
  //   if ((hdrModule as any).HDRLoader) {
  //     return {
  //       createLoader(manager?: any) {
  //         return new (hdrModule as any).HDRLoader(manager)
  //       },
  //       version: 'auto-detected-r182'
  //     }
  //   }
  // } catch (e) {
  //   // HDRLoader 不存在，继续尝试 RGBELoader
  // }

  // 回退到 RGBELoader (r157)
  try {
    const rgbeModule = await import('three/examples/jsm/loaders/RGBELoader.js' as any)
    if ((rgbeModule as any).RGBELoader) {
      return {
        createLoader(manager?: any) {
          return new (rgbeModule as any).RGBELoader(manager)
        },
        version: 'auto-detected-r157'
      }
    }
  } catch (e) {
    // RGBELoader 也不存在
  }

  throw new Error(
    'Neither HDRLoader nor RGBELoader is available. ' +
    'Please ensure you are using Three.js r157 or later, ' +
    'or provide a custom adapter.'
  )
}

