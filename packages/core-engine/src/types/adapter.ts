/**
 * HDR/RGBE Loader 适配器接口
 * 用于支持不同版本的 Three.js loader
 */
export interface HDREnvironmentLoaderAdapter {
  /**
   * 创建 HDR/RGBE 环境贴图加载器实例
   * @param manager 可选的加载管理器
   * @returns Loader 实例
   */
  createLoader(manager?: any): any

  /**
   * 适配器版本标识
   */
  version: string
}

