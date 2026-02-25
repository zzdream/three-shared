# @threejs-shared/protobuf

Protobuf 加载与缓存、WebSocket 收发、回放定时器封装，用于仿真监控等场景。

## 安装

```bash
pnpm add @threejs-shared/protobuf
```

**依赖**：`protobufjs ^7.0.0`、`@threejs-shared/xodr`（用于 `ProtobufPlaybackClient` 的 `loadXodr`）。

---

## 一、类型

### ProtobufType

```ts
import type { Type } from 'protobufjs'
export type ProtobufType = Type
```

即 `protobufjs` 的 `Type`，用于 `decode`/`encode`/`verify`/`create`。

### WebSocketStatus

```ts
enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}
```

### MessageFormat

```ts
enum MessageFormat {
  JSON = 'JSON',
  PROTOBUF = 'PROTOBUF',
  STRING = 'STRING'
}
```

### WebSocketManagerOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `autoReconnect?` | `boolean` | `false` | 是否自动重连 |
| `reconnectDelay?` | `number` | `3000` | 重连延迟（ms） |
| `maxReconnectAttempts?` | `number` | `5` | 最大重连次数 |
| `enableLog?` | `boolean` | `true` | 是否打日志 |

### WebSocketCallbacks

| 属性 | 类型 | 说明 |
|------|------|------|
| `onOpen?` | `() => void` | 连接打开 |
| `onMessage?` | `(data: any) => void` | 收到消息（已 decode） |
| `onError?` | `(error: Event) => void` | 错误 |
| `onClose?` | `(event: CloseEvent) => void` | 连接关闭 |
| `onReconnect?` | `(attempt: number) => void` | 重连尝试 |

### ProtoBufManagerOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableLog?` | `boolean` | `true` | 是否打日志 |

### ProtobufWebSocketClientConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| `protoPath` | `string` | Proto 文件 URL |
| `messageType` | `string` | 消息类型全名，如 `'SimulationMonitor.SimulationMonitorMsg'` |
| `wsUrl` | `string` | WebSocket URL |
| `wsOptions?` | `WebSocketManagerOptions` | WebSocket 选项 |
| `protoBufOptions?` | `ProtoBufManagerOptions` | ProtoBufManager 选项 |

### ProtobufPlaybackClientConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| `protoPath` | `string` | Proto 文件 URL |
| `messageType` | `string` | 如 `'SimulationMonitor.SimulationMonitorBag'`（含 frames 的 Bag） |
| `fileOptions` | `LoadXodrOptions` | 文件下载配置（url、header、responseType 等，来自 xodr） |
| `frequency?` | `number` | 播放帧率（帧/秒），默认 50 |
| `frameSize?` | `number` | 每帧返回数据条数，默认 1 |
| `protoBufOptions?` | `ProtoBufManagerOptions` | Proto 管理器选项 |

### ProtobufPlaybackCallbacks

| 属性 | 类型 | 说明 |
|------|------|------|
| `onFrame?` | `(frameData: any) => void` | 每帧数据 |
| `onProcess?` | `(currentSecond: number) => void` | 播放进度（当前秒） |
| `onComplete?` | `() => void` | 播放完成 |
| `onError?` | `(error: Error \| any) => void` | 错误 |

---

## 二、ProtoBufManager

加载并缓存 proto 类型，同一 proto+messageType 并发请求共享同一 Promise。

### 构造函数

```ts
constructor(options?: ProtoBufManagerOptions)
```

### 方法

#### loadProto

加载 proto 文件并返回指定消息类型。

```ts
loadProto(protoFilePath: string, messageType: string): Promise<ProtobufType>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `protoFilePath` | `string` | Proto 文件 URL |
| `messageType` | `string` | 消息类型全名，如 `'SimulationMonitor.SimulationMonitorMsg'` |

**返回值**：解析后的 `ProtobufType`（可 `decode`/`encode`/`verify`/`create`）。

**异常**：参数非法、请求失败、解析失败或类型不存在时抛出。

---

#### clearCache

清除已缓存的 proto 类型。

```ts
clearCache(protoFilePath?: string): void
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `protoFilePath` | `string` | 可选；若传则只清除该文件相关缓存，否则清空全部 |

---

#### getCacheSize

返回当前缓存的类型数量。

```ts
getCacheSize(): number
```

---

#### isCached

判断某 proto+messageType 是否已缓存。

```ts
isCached(protoFilePath: string, messageType: string): boolean
```

---

#### getCachedProtoFiles

返回已缓存的 proto 文件路径列表。

```ts
getCachedProtoFiles(): string[]
```

---

## 三、WebSocketManager

基于 Protobuf 的 WebSocket 连接：接收二进制自动 decode，发送支持 JSON/Protobuf/STRING。

### 构造函数

```ts
constructor(wsUrl: string, protobufType: ProtobufType, options?: WebSocketManagerOptions)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `wsUrl` | `string` | WebSocket 地址 |
| `protobufType` | `ProtobufType` | 用于解码接收消息、编码发送消息 |
| `options` | `WebSocketManagerOptions` | 可选 |

### 方法

#### connect

建立连接并注册回调。

```ts
connect(callbacks?: WebSocketCallbacks): void
```

已连接时直接返回；会先清理旧连接再新建。

---

#### send

发送消息。

```ts
send(message: object | string, format?: MessageFormat): void
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `object \| string` | - | 对象或 JSON 字符串（PROTOBUF 时会 verify+encode） |
| `format` | `MessageFormat` | `MessageFormat.PROTOBUF` | JSON / PROTOBUF / STRING |

**异常**：未连接、格式不匹配或验证失败时抛出。

---

#### disconnect

关闭连接。

```ts
disconnect(code?: number, reason?: string): void
```

---

#### getStatus

返回当前连接状态。

```ts
getStatus(): WebSocketStatus
```

---

#### isConnected

是否已连接且 socket 为 OPEN。

```ts
isConnected(): boolean
```

---

#### setProtobufType

更换用于编解码的 Protobuf 类型。

```ts
setProtobufType(protobufType: ProtobufType): void
```

---

#### updateCallbacks

合并更新回调。

```ts
updateCallbacks(callbacks: WebSocketCallbacks): void
```

---

#### destroy

断开连接并清空回调和 Protobuf 引用。

```ts
destroy(): void
```

---

## 四、ProtobufWebSocketClient

封装「加载 Proto + 创建 WebSocket + 连接」流程，业务只需配置和回调。

### 构造函数

```ts
constructor(config: ProtobufWebSocketClientConfig)
```

### 方法

#### connect

加载 proto、创建 WebSocketManager 并连接。

```ts
connect(callbacks?: WebSocketCallbacks): Promise<void>
```

**异常**：加载 proto 或连接失败时抛出。

---

#### send

转发到内部 WebSocketManager。

```ts
send(message: object | string, format?: MessageFormat): void
```

**异常**：未先调用 `connect()` 或发送失败时抛出。

---

#### disconnect

断开连接。

```ts
disconnect(code?: number, reason?: string): void
```

---

#### destroy

销毁内部 WebSocketManager 并清空引用。

```ts
destroy(): void
```

---

## 五、TimerManager

按固定帧率从数据数组中取帧并回调，用于回放。

### 构造函数

```ts
constructor(dataArray?: Array<{ id: number; value: number }>, interval?: number, frameSize?: number)
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dataArray` | `Array<...>` | `[]` | 帧数据数组 |
| `interval` | `number` | `50` | 帧率（帧/秒），用于计算 `1000/interval` 为定时间隔 ms |
| `frameSize` | `number` | `1` | 每帧取几条数据 |

**注意**：`interval` 在构造函数里是“帧率”，内部用 `1000/interval` 作为 `setInterval` 的间隔（单位 ms）。

### 方法

#### connect

注册回调并立即 start。

```ts
connect(onFrame: FrameDataCallback, onProcess?: Callback, onComplete?: Callback): void
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `onFrame` | `(frameData: any) => void` | 每帧数据（单条时为 `frameData[0]`） |
| `onProcess?` | `(args?: any) => void` | 进度等，内部传 `currentSecond` |
| `onComplete?` | `() => void` | 播放结束 |

已运行时会告警并直接返回。

---

#### start

开始定时取帧并调用 onFrame/onProcess，到末尾调用 onComplete 并停止。

```ts
start(): void
```

---

#### startFrom

从指定“秒”对应的索引开始播放（索引 = startSecond * interval）。

```ts
startFrom(startSecond?: number): void
```

| 参数 | 类型 | 默认值 |
|------|------|--------|
| `startSecond` | `number` | `0` |

---

#### stop

停止定时器并置为暂停状态。

```ts
stop(): void
```

---

#### pause

暂停（不再推进索引，定时器仍在）。

```ts
pause(): void
```

---

#### resume

恢复推进。

```ts
resume(): void
```

---

#### reset

停止、索引归零、取消暂停并重新 start。

```ts
reset(): void
```

---

## 六、ProtobufPlaybackClient

封装「下载文件 → 用 Proto 解码 → 用 TimerManager 按帧回放」。

### 构造函数

```ts
constructor(config: ProtobufPlaybackClientConfig)
```

### 方法

#### loadAndPlay

下载 fileOptions 指定文件，用 proto 解码，创建 TimerManager 并 connect（开始播放）。

```ts
loadAndPlay(callbacks?: ProtobufPlaybackCallbacks): Promise<void>
```

| 回调 | 说明 |
|------|------|
| `onFrame` | 每帧数据（frameSize 条中的单条或数组，见 TimerManager） |
| `onProcess` | 当前秒数 |
| `onComplete` | 播放完成 |
| `onError` | 下载/解码/内部错误 |

**异常**：下载失败、解码失败或数据无 `frames` 数组时抛出。

---

#### start

开始播放（需已执行过 `loadAndPlay`）。

```ts
start(): void
```

**异常**：未先 `loadAndPlay` 时抛出。

---

#### startFrom

从指定秒数开始播放。

```ts
startFrom(startSecond: number): void
```

**异常**：未先 `loadAndPlay` 时抛出。

---

#### pause / resume / stop / reset

转发到内部 TimerManager。

```ts
pause(): void
resume(): void
stop(): void
reset(): void
```

未初始化时 `pause`/`resume`/`reset` 仅打警告。

---

#### destroy

停止并清空内部 TimerManager。

```ts
destroy(): void
```

---

#### getTimerManager

返回内部 TimerManager 实例（可能为 null）。

```ts
getTimerManager(): TimerManager | null
```

---

## 导出汇总

- **类**：`ProtoBufManager`, `WebSocketManager`, `ProtobufWebSocketClient`, `ProtobufPlaybackClient`, `TimerManager`
- **枚举**：`WebSocketStatus`, `MessageFormat`
- **类型**：`ProtobufType`, `WebSocketManagerOptions`, `WebSocketCallbacks`, `ProtobufWebSocketClientConfig`, `ProtobufPlaybackClientConfig`, `ProtobufPlaybackCallbacks`, `ProtoBufManagerOptions`
