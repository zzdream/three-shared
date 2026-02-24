// import protobuf from 'protobufjs'

// /**
//  * Protobuf 管理器，用于加载和缓存 proto 文件
//  */
// export class ProtoBufManager {
//   private protoCache: Map<string, protobuf.Type> = new Map()

//   /**
//    * 加载 proto 文件并获取指定的消息类型
//    * @param protoFilePath proto 文件的路径（URL）
//    * @param messageType 消息类型名称（例如：'protobuf.WsFrameData'）
//    * @returns Promise<protobuf.Type> 解析后的消息类型
//    */
//   async loadProto(protoFilePath: string, messageType: string): Promise<protobuf.Type> {
//     const cacheKey = `${protoFilePath}-${messageType}`
//     if (this.protoCache.has(cacheKey)) {
//       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//       return this.protoCache.get(cacheKey)!
//     }
//     try {
//       const response = await fetch(protoFilePath)
//       if (!response.ok) {
//         throw new Error(`Failed to fetch proto file: ${response.statusText}`)
//       }
//       const content = await response.text()
//       const root = protobuf.parse(content).root
//       const messageTypeDefinition = root.lookupType(messageType)
//       if (!messageTypeDefinition) {
//         throw new Error(`Message type '${messageType}' not found in proto file`)
//       }
//       this.protoCache.set(cacheKey, messageTypeDefinition)
//       return messageTypeDefinition
//     } catch (error) {
//       console.error('Error loading proto file:', error)
//       throw error
//     }
//   }

//   /**
//    * 清除缓存
//    * @param protoFilePath 可选的 proto 文件路径，如果提供则只清除该文件的缓存，否则清除所有缓存
//    */
//   clearCache(protoFilePath?: string): void {
//     if (protoFilePath) {
//       const keysToDelete: string[] = []
//       this.protoCache.forEach((_, key) => {
//         if (key.startsWith(protoFilePath)) {
//           keysToDelete.push(key)
//         }
//       })
//       keysToDelete.forEach(key => this.protoCache.delete(key))
//     } else {
//       this.protoCache.clear()
//     }
//   }

//   /**
//    * 获取缓存的大小
//    */
//   getCacheSize(): number {
//     return this.protoCache.size
//   }
// }

import * as protobuf from 'protobufjs'
import type { ProtobufType } from './types'
import type { Root } from 'protobufjs'

/**
 * ProtoBufManager 配置选项
 */
export interface ProtoBufManagerOptions {
  /** 是否启用日志 */
  enableLog?: boolean
}

/**
 * Protobuf 管理器，用于加载和缓存 proto 文件
 * 
 * 特性：
 * - 自动缓存已加载的 proto 类型，避免重复加载
 * - 并发请求控制，同一 proto 文件的多次请求会共享同一个 Promise
 * - 完善的错误处理和参数验证
 * - 可配置的日志输出
 */
export class ProtoBufManager {
  /** 已加载的 proto 类型缓存 */
  private protoCache: Map<string, ProtobufType> = new Map()
  /** 正在加载的 Promise 缓存，用于并发控制 */
  private loadingPromises: Map<string, Promise<ProtobufType>> = new Map()
  /** 配置选项 */
  private options: Required<ProtoBufManagerOptions>

  constructor(options?: ProtoBufManagerOptions) {
    this.options = {
      enableLog: options?.enableLog ?? true,
    }
  }

  /**
   * 加载 proto 文件并获取指定的消息类型
   * 
   * @param protoFilePath proto 文件的路径（URL）
   * @param messageType 消息类型名称（例如：'protobuf.WsFrameData' 或 'SimulationMonitor.SimulationMonitorMsg'）
   * @returns Promise<ProtobufType> 解析后的消息类型
   * @throws {Error} 如果参数无效、文件加载失败、解析失败或消息类型不存在
   * 
   * @example
   * ```typescript
   * const manager = new ProtoBufManager()
   * const messageType = await manager.loadProto('/proto/SimulationMonitor.proto', 'SimulationMonitor.SimulationMonitorMsg')
   * ```
   */
  async loadProto(protoFilePath: string, messageType: string): Promise<ProtobufType> {
    // 参数验证
    if (!protoFilePath || typeof protoFilePath !== 'string') {
      throw new Error('protoFilePath must be a non-empty string')
    }
    if (!messageType || typeof messageType !== 'string') {
      throw new Error('messageType must be a non-empty string')
    }

    const cacheKey = `${protoFilePath}-${messageType}`

    // 如果已缓存，直接返回
    if (this.protoCache.has(cacheKey)) {
      this.log(`Using cached proto type: ${messageType}`)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.protoCache.get(cacheKey)!
    }

    // 如果正在加载，返回同一个 Promise（并发控制）
    if (this.loadingPromises.has(cacheKey)) {
      this.log(`Proto file is already loading: ${protoFilePath}, waiting...`)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.loadingPromises.get(cacheKey)!
    }

    // 创建加载 Promise
    const loadPromise = this.loadProtoInternal(protoFilePath, messageType, cacheKey)
    this.loadingPromises.set(cacheKey, loadPromise)

    try {
      const result = await loadPromise
      return result
    } finally {
      // 加载完成后移除 Promise 缓存
      this.loadingPromises.delete(cacheKey)
    }
  }

  /**
   * 内部加载方法
   */
  private async loadProtoInternal(
    protoFilePath: string,
    messageType: string,
    cacheKey: string
  ): Promise<ProtobufType> {
    try {
      this.log(`Loading proto file: ${protoFilePath}`)

      // 1. 获取 proto 文件内容
      let response: Response
      try {
        response = await fetch(protoFilePath)
      } catch (error) {
        throw new Error(
          `Failed to fetch proto file from "${protoFilePath}": ${error instanceof Error ? error.message : String(error)}`
        )
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch proto file: HTTP ${response.status} ${response.statusText}`
        )
      }

      // 2. 读取文件内容
      let content: string
      try {
        content = await response.text()
      } catch (error) {
        throw new Error(
          `Failed to read proto file content: ${error instanceof Error ? error.message : String(error)}`
        )
      }

      if (!content || content.trim().length === 0) {
        throw new Error('Proto file is empty')
      }

      // 3. 解析 proto 文件
      let root: Root
      try {
        root = protobuf.parse(content).root
      } catch (error) {
        throw new Error(
          `Failed to parse proto file: ${error instanceof Error ? error.message : String(error)}`
        )
      }

      // 4. 查找消息类型
      const messageTypeDefinition = root.lookupType(messageType)
      if (!messageTypeDefinition) {
        // 尝试列出可用的类型，帮助调试
        const availableTypes: string[] = []
        root.nestedArray.forEach((nested) => {
          if (nested instanceof protobuf.Type) {
            availableTypes.push(nested.fullName)
          } else if (nested instanceof protobuf.Namespace) {
            nested.nestedArray.forEach((nestedType) => {
              if (nestedType instanceof protobuf.Type) {
                availableTypes.push(nestedType.fullName)
              }
            })
          }
        })

        const availableTypesHint = availableTypes.length > 0
          ? ` Available types: ${availableTypes.slice(0, 10).join(', ')}${availableTypes.length > 10 ? '...' : ''}`
          : ''

        throw new Error(
          `Message type "${messageType}" not found in proto file.${availableTypesHint}`
        )
      }

      // 5. 缓存结果
      this.protoCache.set(cacheKey, messageTypeDefinition)
      this.log(`Successfully loaded proto type: ${messageType}`)

      return messageTypeDefinition
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`Error loading proto file: ${errorMessage}`, 'error')
      
      // 重新抛出错误，但使用更友好的错误信息
      throw error instanceof Error ? error : new Error(errorMessage)
    }
  }

  /**
   * 清除缓存
   * @param protoFilePath 可选的 proto 文件路径，如果提供则只清除该文件的缓存，否则清除所有缓存
   */
  clearCache(protoFilePath?: string): void {
    if (protoFilePath) {
      const keysToDelete: string[] = []
      this.protoCache.forEach((_, key) => {
        if (key.startsWith(protoFilePath)) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach((key) => {
        this.protoCache.delete(key)
        this.log(`Cleared cache for: ${key}`)
      })
      this.log(`Cleared ${keysToDelete.length} cache entries for proto file: ${protoFilePath}`)
    } else {
      const size = this.protoCache.size
      this.protoCache.clear()
      this.log(`Cleared all ${size} cache entries`)
    }
  }

  /**
   * 获取缓存的大小
   */
  getCacheSize(): number {
    return this.protoCache.size
  }

  /**
   * 检查指定 proto 类型是否已缓存
   * @param protoFilePath proto 文件路径
   * @param messageType 消息类型名称
   * @returns 是否已缓存
   */
  isCached(protoFilePath: string, messageType: string): boolean {
    const cacheKey = `${protoFilePath}-${messageType}`
    return this.protoCache.has(cacheKey)
  }

  /**
   * 获取所有已缓存的 proto 文件路径
   * @returns 已缓存的 proto 文件路径数组
   */
  getCachedProtoFiles(): string[] {
    const protoFiles = new Set<string>()
    this.protoCache.forEach((_, key) => {
      const protoFilePath = key.split('-').slice(0, -1).join('-')
      protoFiles.add(protoFilePath)
    })
    return Array.from(protoFiles)
  }

  /**
   * 日志输出
   */
  private log(message: string, level: 'log' | 'error' = 'log'): void {
    if (!this.options.enableLog) return

    const prefix = '[ProtoBufManager]'
    if (level === 'error') {
      console.error(prefix, message)
    } else {
      console.log(prefix, message)
    }
  }
}

