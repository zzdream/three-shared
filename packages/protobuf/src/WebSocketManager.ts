import type { Type as ProtobufType } from 'protobufjs'

/**
 * WebSocket 连接状态
 */
export enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

/**
 * 消息发送格式
 */
export enum MessageFormat {
  /** JSON 格式 */
  JSON = 'JSON',
  /** Protobuf 二进制格式 */
  PROTOBUF = 'PROTOBUF',
  /** 原始字符串格式 */
  STRING = 'STRING'
}

/**
 * WebSocket 管理器配置选项
 */
export interface WebSocketManagerOptions {
  /** 是否启用自动重连 */
  autoReconnect?: boolean
  /** 重连延迟时间（毫秒） */
  reconnectDelay?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 是否启用日志 */
  enableLog?: boolean
}

/**
 * WebSocket 事件回调
 */
export interface WebSocketCallbacks {
  /** 连接打开时的回调 */
  onOpen?: () => void
  /** 接收到消息时的回调 */
  onMessage?: (data: any) => void
  /** 连接错误时的回调 */
  onError?: (error: Event) => void
  /** 连接关闭时的回调 */
  onClose?: (event: CloseEvent) => void
  /** 重连时的回调 */
  onReconnect?: (attempt: number) => void
}

/**
 * WebSocket 管理器，用于管理基于 Protobuf 的 WebSocket 连接
 */
export class WebSocketManager {
  private socket: WebSocket | null = null
  private MessagePb: ProtobufType | null = null
  private wsUrl: string
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private options: Required<WebSocketManagerOptions>
  private callbacks: WebSocketCallbacks = {}

  constructor(wsUrl: string, protobufType: ProtobufType, options?: WebSocketManagerOptions) {
    this.wsUrl = wsUrl
    this.MessagePb = protobufType
    this.options = {
      autoReconnect: options?.autoReconnect ?? false,
      reconnectDelay: options?.reconnectDelay ?? 3000,
      maxReconnectAttempts: options?.maxReconnectAttempts ?? 5,
      enableLog: options?.enableLog ?? true
    }
  }

  /**
   * 连接 WebSocket
   * @param callbacks 事件回调
   */
  connect(callbacks?: WebSocketCallbacks): void {
    if (this.socket && this.status === WebSocketStatus.CONNECTED) {
      this.log('WebSocket is already connected')
      return
    }

    // 保存回调
    if (callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks }
    }

    // 清理之前的连接
    this.cleanup()
    try {
      this.status = WebSocketStatus.CONNECTING
      this.socket = new WebSocket(this.wsUrl)
      this.setupEventListeners()
    } catch (error) {
      this.status = WebSocketStatus.ERROR
      this.log('Failed to create WebSocket:', error)
      this.callbacks.onError?.(error as Event)
      throw error
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.addEventListener('open', () => {
      this.status = WebSocketStatus.CONNECTED
      this.reconnectAttempts = 0
      this.log('WebSocket connected')
      this.callbacks.onOpen?.()
    })

    this.socket.addEventListener('message', async (event: MessageEvent) => {
      if (!this.MessagePb) {
        this.log('Protobuf type is not set')
        return
      }

      try {
        const blob = event.data
        const buffer = await blob.arrayBuffer()
        const data = new Uint8Array(buffer)
        const receivedMessage = this.MessagePb.decode(data)
        this.callbacks.onMessage?.(receivedMessage)
      } catch (error) {
        this.log('Failed to decode message:', error)
        this.callbacks.onError?.(error as Event)
      }
    })

    this.socket.addEventListener('error', (error: Event) => {
      this.status = WebSocketStatus.ERROR
      this.log('WebSocket error:', error)
      this.callbacks.onError?.(error)
      
      // 如果启用了自动重连，尝试重连
      if (this.options.autoReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    })

    this.socket.addEventListener('close', (event: CloseEvent) => {
      this.status = WebSocketStatus.DISCONNECTED
      this.log('WebSocket closed', { code: event.code, reason: event.reason })
      this.callbacks.onClose?.(event)
      
      // 如果启用了自动重连且不是主动关闭，尝试重连
      if (
        this.options.autoReconnect &&
        this.reconnectAttempts < this.options.maxReconnectAttempts &&
        event.code !== 1000 // 1000 表示正常关闭
      ) {
        this.scheduleReconnect()
      }
    })
  }

  /**
   * 发送消息
   * @param message 要发送的消息对象或字符串
   * @param format 消息格式，默认为 Protobuf 格式
   * @throws 如果连接未建立或消息验证失败
   */
  send(message: object | string, format: MessageFormat = MessageFormat.PROTOBUF): void {
    if (!this.socket || this.status !== WebSocketStatus.CONNECTED) {
      throw new Error('WebSocket is not connected')
    }

    try {
      if (format === MessageFormat.STRING) {
        // 原始字符串格式发送，直接发送字符串
        if (typeof message !== 'string') {
          throw new Error('STRING format requires a string message')
        }
        this.socket.send(message)
        this.log('Message sent (STRING):', message)
      } else if (format === MessageFormat.JSON) {
        // JSON 格式发送
        if (typeof message === 'string') {
          // 如果是字符串，直接发送（假设已经是 JSON 字符串）
          this.socket.send(message)
          this.log('Message sent (JSON):', message)
        } else {
          // 如果是对象，序列化为 JSON 字符串
          const jsonString = JSON.stringify(message)
          this.socket.send(jsonString)
          this.log('Message sent (JSON):', message)
        }
      } else {
        // Protobuf 格式发送
        if (!this.MessagePb) {
          throw new Error('Protobuf type is not set')
        }

        // 如果传入的是字符串，解析为对象
        let messageObj: object
        if (typeof message === 'string') {
          try {
            messageObj = JSON.parse(message)
          } catch (error) {
            throw new Error(`Invalid JSON string for Protobuf: ${error}`)
          }
        } else {
          messageObj = message
        }

        // 验证数据是否符合 Protobuf 定义
        const errMsg = this.MessagePb.verify(messageObj)
        if (errMsg) {
          throw new Error(`Message verification failed: ${errMsg}`)
        }

        // 创建 Protobuf 消息
        const msg = this.MessagePb.create(messageObj)
        
        // 序列化消息为二进制格式
        const buffer = this.MessagePb.encode(msg).finish()
        
        // 通过 WebSocket 发送二进制数据
        this.socket.send(buffer)
        this.log('Message sent (Protobuf):', messageObj)
      }
    } catch (error) {
      this.log('Failed to send message:', error)
      throw error
    }
  }

  /**
   * 断开连接
   * @param code 关闭代码
   * @param reason 关闭原因
   */
  disconnect(code?: number, reason?: string): void {
    if (this.socket) {
      this.status = WebSocketStatus.DISCONNECTING
      this.socket.close(code ?? 1000, reason)
      this.cleanup()
      this.status = WebSocketStatus.DISCONNECTED
    }
  }

  /**
   * 获取当前连接状态
   */
  getStatus(): WebSocketStatus {
    return this.status
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.status === WebSocketStatus.CONNECTED && 
           this.socket?.readyState === WebSocket.OPEN
  }

  /**
   * 设置 Protobuf 类型
   */
  setProtobufType(protobufType: ProtobufType): void {
    this.MessagePb = protobufType
  }

  /**
   * 更新回调函数
   */
  updateCallbacks(callbacks: WebSocketCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * 计划重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts}`)
    
    this.callbacks.onReconnect?.(this.reconnectAttempts)

    this.reconnectTimer = setTimeout(() => {
      this.log(`Reconnecting... (attempt ${this.reconnectAttempts})`)
      try {
        this.socket = new WebSocket(this.wsUrl)
        this.setupEventListeners()
      } catch (error) {
        this.log('Reconnect failed:', error)
        if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }
    }, this.options.reconnectDelay)
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      // 移除所有事件监听器
      this.socket.onopen = null
      this.socket.onmessage = null
      this.socket.onerror = null
      this.socket.onclose = null
      
      // 如果连接还在，关闭它
      if (this.socket.readyState === WebSocket.OPEN || 
          this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close()
      }
      
      this.socket = null
    }
  }

  /**
   * 日志输出
   */
  private log(...args: any[]): void {
    if (this.options.enableLog) {
      console.log('[WebSocketManager]', ...args)
    }
  }

  /**
   * 销毁实例，清理所有资源
   */
  destroy(): void {
    this.disconnect()
    this.callbacks = {}
    this.MessagePb = null
    this.reconnectAttempts = 0
  }
}
