import { ProtoBufManager } from './ProtoBufManager'
import { WebSocketManager, WebSocketStatus, MessageFormat } from './WebSocketManager'
import type { ProtobufType } from './types'
import type { WebSocketManagerOptions, WebSocketCallbacks, ProtoBufManagerOptions } from './index'

/**
 * Protobuf WebSocket 客户端配置
 */
export interface ProtobufWebSocketClientConfig {
  /** Proto 文件路径 */
  protoPath: string
  /** 消息类型名称（例如：'SimulationMonitor.SimulationMonitorMsg'） */
  messageType: string
  /** WebSocket URL */
  wsUrl: string
  /** WebSocket 管理器选项 */
  wsOptions?: WebSocketManagerOptions
  /** ProtoBuf 管理器选项 */
  protoBufOptions?: ProtoBufManagerOptions
}

/**
 * Protobuf WebSocket 客户端
 * 
 * 这是一个高级封装类，将 ProtoBufManager 和 WebSocketManager 的使用流程封装起来，
 * 简化业务代码中的使用。业务代码只需要配置参数和定义回调函数即可。
 * 
 * @example
 * ```typescript
 * const client = new ProtobufWebSocketClient({
 *   protoPath: '/proto/SimulationMonitor.proto',
 *   messageType: 'SimulationMonitor.SimulationMonitorMsg',
 *   wsUrl: 'ws://localhost:8080',
 *   wsOptions: {
 *     autoReconnect: true,
 *     reconnectDelay: 3000,
 *   },
 *   protoBufOptions: {
 *     enableLog: true, // 控制 ProtoBufManager 的日志
 *   }
 * })
 * 
 * await client.connect({
 *   onOpen: () => {
 *     // 连接成功后可以在这里发送初始消息
 *     client.send({ frameRate: { frameRate: 20 } })
 *   },
 *   onMessage: (data) => {
 *     console.log('Received:', data)
 *   }
 * })
 * ```
 */
export class ProtobufWebSocketClient {
  private protoBufManager: ProtoBufManager
  public webSocketManager: WebSocketManager | null = null
  private config: ProtobufWebSocketClientConfig
  private protobufType: ProtobufType | null = null

  constructor(config: ProtobufWebSocketClientConfig) {
    this.config = config
    this.protoBufManager = new ProtoBufManager(config.protoBufOptions)
  }

  /**
   * 连接 WebSocket（会自动加载 Proto 文件）
   * @param callbacks 事件回调函数
   * @returns Promise<void>
   */
  async connect(callbacks?: WebSocketCallbacks): Promise<void> {
    try {
      // 加载 Proto 文件
      this.protobufType = await this.protoBufManager.loadProto(
        this.config.protoPath,
        this.config.messageType
      )
      
      // 创建 WebSocket 管理器
      this.webSocketManager = new WebSocketManager(
        this.config.wsUrl,
        this.protobufType,
        this.config.wsOptions
      )

      // 连接 WebSocket
      this.webSocketManager.connect(callbacks)
    } catch (error) {
      console.error('Protobuf WebSocket 连接失败:', error)
      throw error
    }
  }
  /**
   * 发送消息
   * @param message 要发送的消息对象或 JSON 字符串
   * @param format 消息格式，默认为 Protobuf 格式
   * @throws 如果连接未建立或消息验证失败
   */
  send(message: object | string, format: MessageFormat = MessageFormat.PROTOBUF): void {
    if (!this.webSocketManager) {
      throw new Error('WebSocket is not connected. Please call connect() first.')
    }
    this.webSocketManager.send(message, format)
  }

  /**
   * 断开连接
   * @param code 关闭代码
   * @param reason 关闭原因
   */
  disconnect(code?: number, reason?: string): void {
      if (this.webSocketManager) {
      this.webSocketManager.disconnect(code, reason)
      }
  }
  /**
   * 销毁客户端，清理所有资源
   */
  destroy(): void {
    if (this.webSocketManager) {
      this.webSocketManager.destroy()
      this.webSocketManager = null
    }
    this.protobufType = null
  }
}

