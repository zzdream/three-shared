import { ProtoBufManager } from './ProtoBufManager'
import { TimerManager } from './TimerManager'
import type { ProtoBufManagerOptions } from './ProtoBufManager'
import type { LoadXodrOptions } from '@threejs-shared/xodr'
import { loadXodr } from '@threejs-shared/xodr'

/**
 * Protobuf 回放客户端回调函数
 */
export interface ProtobufPlaybackCallbacks {
  /** 每帧数据回调 */
  onFrame?: (frameData: any) => void
  /** 播放进度回调（当前秒数） */
  onProcess?: (currentSecond: number) => void
  /** 播放完成回调 */
  onComplete?: () => void
  /** 错误回调 */
  onError?: (error: Error | any) => void
}

/**
 * Protobuf 回放客户端配置
 */
export interface ProtobufPlaybackClientConfig {
  /** Proto 文件路径 */
  protoPath: string
  /** 消息类型名称（例如：'SimulationMonitor.SimulationMonitorBag'） */
  messageType: string
  /** 文件下载配置（URL、请求头等） */
  fileOptions: LoadXodrOptions
  /** 播放频率（帧/秒，FPS），默认 50。例如：50 表示每秒播放 50 帧，即每 20ms 触发一次帧回调 */
  frequency?: number
  /** 每帧返回的数据量，默认 1。例如：1 表示每次 onFrame 回调接收 1 个帧数据对象；2 表示每次接收 2 个帧数据对象 */
  frameSize?: number
  /** ProtoBuf 管理器选项 */
  protoBufOptions?: ProtoBufManagerOptions
}

/**
 * Protobuf 回放客户端
 * 
 * 这是一个高级封装类，将 Protobuf 文件下载、解码和 TimerManager 的使用流程封装起来，
 * 简化业务代码中的使用。业务代码只需要配置参数和定义回调函数即可。
 * 
 * @example
 * ```typescript
 * const client = new ProtobufPlaybackClient({
 *   protoPath: '/proto/SimulationMonitor.proto',
 *   messageType: 'SimulationMonitor.SimulationMonitorBag',
 *   fileOptions: {
 *     url: '/api/simpro/simtask/pb/download/?task_id=14532&scene_id=1276197',
 *     responseType: 'arrayBuffer',
 *     useStreaming: false,
 *     header: {
 *       Authorization: `JWT ${token}`,
 *       'X-Project-Id': projectId,
 *     }
 *   },
 *   frequency: 50,
 * })
 * 
 * await client.loadAndPlay({
 *   onFrame: (frameData) => {
 *     console.log('Frame data:', frameData)
 *   },
 *   onProcess: (currentSecond) => {
 *     console.log('Current second:', currentSecond)
 *   },
 *   onComplete: () => {
 *     console.log('Playback completed')
 *   },
 *   onError: (error) => {
 *     console.error('Error:', error)
 *   }
 * })
 * ```
 */
export class ProtobufPlaybackClient {
  private protoBufManager: ProtoBufManager
  private timerManager: TimerManager | null = null
  private config: ProtobufPlaybackClientConfig

  constructor(config: ProtobufPlaybackClientConfig) {
    this.config = config
    this.protoBufManager = new ProtoBufManager(config.protoBufOptions)
  }

  /**
   * 加载 Protobuf 文件并开始播放
   * @param callbacks 事件回调函数
   * @returns Promise<void>
   */
  async loadAndPlay(callbacks?: ProtobufPlaybackCallbacks): Promise<void> {
    try {
      // 1. 下载文件
      const fileContent = await loadXodr(this.config.fileOptions) as ArrayBuffer | Uint8Array

      // 2. 加载 Proto 文件
      const protobufType = await this.protoBufManager.loadProto(
        this.config.protoPath,
        this.config.messageType
      )

      // 3. 解码文件内容
      let decodedData: any
      try {
        decodedData = protobufType.decode(fileContent as Uint8Array)
      } catch (decodeError) {
        // 如果解码失败，尝试解析为 JSON 错误消息
        try {
          const decoder = new TextDecoder('utf-8')
          const rawText = decoder.decode(fileContent as ArrayBuffer)
          const errorData = JSON.parse(rawText)
          const error = new Error(errorData?.err || 'Failed to decode protobuf file')
          callbacks?.onError?.(error)
          throw error
        } catch (jsonError) {
          const error = decodeError instanceof Error 
            ? decodeError 
            : new Error('Failed to decode protobuf file')
          callbacks?.onError?.(error)
          throw error
        }
      }

      // 4. 创建 TimerManager 并开始播放
      // frequency: 播放频率（帧/秒，FPS），默认 50，表示每秒播放 50 帧数据
      // 例如：frequency = 50 表示每 20ms（1000ms / 50）触发一次帧回调
      const frequency = this.config.frequency || 50
      // frameSize: 每帧返回的数据量，默认 1，表示每次回调返回 1 个帧数据对象
      // 例如：frameSize = 1 表示每次 onFrame 回调接收 1 个帧数据；frameSize = 2 表示每次接收 2 个帧数据
      const frameSize = this.config.frameSize || 1
      
      if (!decodedData.frames || !Array.isArray(decodedData.frames)) {
        throw new Error('Decoded data does not contain a valid "frames" array')
      }

      this.timerManager = new TimerManager(decodedData.frames, frequency, frameSize)
      
      this.timerManager.connect(
        (frameData: any) => {
          callbacks?.onFrame?.(frameData)
        },
        (currentSecond: number) => {
          callbacks?.onProcess?.(currentSecond)
        },
        () => {
          callbacks?.onComplete?.()
        }
      )
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      callbacks?.onError?.(err)
      throw err
    }
  }

  /**
   * 开始播放（如果已加载）
   */
  start(): void {
    if (!this.timerManager) {
      throw new Error('TimerManager is not initialized. Please call loadAndPlay() first.')
    }
    this.timerManager.start()
  }

  /**
   * 从指定秒数开始播放
   * @param startSecond 起始秒数
   */
  startFrom(startSecond: number): void {
    if (!this.timerManager) {
      throw new Error('TimerManager is not initialized. Please call loadAndPlay() first.')
    }
    this.timerManager.startFrom(startSecond)
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (!this.timerManager) {
      console.warn('TimerManager is not initialized. Cannot pause.')
      return
    }
    this.timerManager.pause()
  }

  /**
   * 继续播放
   */
  resume(): void {
    if (!this.timerManager) {
      console.warn('TimerManager is not initialized. Cannot resume.')
      return
    }
    this.timerManager.resume()
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.timerManager) {
      this.timerManager.stop()
    }
  }

  /**
   * 重置播放器（可重新开始）
   */
  reset(): void {
    if (!this.timerManager) {
      console.warn('TimerManager is not initialized. Cannot reset.')
      return
    }
    this.timerManager.reset()
  }

  /**
   * 销毁客户端，清理所有资源
   */
  destroy(): void {
    if (this.timerManager) {
      this.timerManager.stop()
      this.timerManager = null
    }
  }

  /**
   * 获取 TimerManager 实例（用于高级操作）
   */
  getTimerManager(): TimerManager | null {
    return this.timerManager
  }
}

