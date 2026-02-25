<template>
  <div class="index-container">
    <div ref="containerRef" class="three-container"></div>
    <button @click="switchXodr('/practice.xodr')" style="position: absolute; top: 10px; left: 10px; z-index: 1000;">切换XODR</button>
    <button @click="initProtobufWebSocket()" style="position: absolute; top: 10px; left: 100px; z-index: 1000;">仿真</button>
    <button @click="playback()" style="position: absolute; top: 10px; left: 150px; z-index: 1000;">回看</button>
    <button @click="loadModelFBX()" style="position: absolute; top: 10px; left: 200px; z-index: 1000;">fbx模型</button>
    <button @click="loadModelGLB()" style="position: absolute; top: 10px; left: 270px; z-index: 1000;">glb模型</button>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { MODAL_TO_URL, FBX_URL, GLB_URL } from '@/utils/modelConst'
  // import { MODAL_TO_URL } from '@/utils/imgConst'

  import { ThreeEngine, createModalGLB, createModalFBX } from '@threejs-shared/core-engine'
  import { XodrMapInitializer } from '@threejs-shared/xodr'
  import { ProtobufWebSocketClient, MessageFormat, ProtobufPlaybackClient } from '@threejs-shared/protobuf'
  import type { WebSocketCallbacks } from '@threejs-shared/protobuf'
  const containerRef = ref<HTMLElement | null>(null)

  // Three.js 相关变量
  let engine: ThreeEngine | null = null
  let initializer: XodrMapInitializer | null = null // 保存初始化器实例
  let Client: ProtobufWebSocketClient | null = null // 保存 Protobuf WebSocket 客户端实例

  // -----------------------------
  // 生命周期
  // -----------------------------
  onMounted(() => {
    initThreeJS()
    initXodr()
  })

  onBeforeUnmount(() => {
    // 清理 Protobuf WebSocket 客户端
    if (Client) {
      Client.disconnect()
      Client.destroy()
      Client = null
    }
    
    // 清理 Three.js 资源
    if (engine) {
      engine.dispose()
      engine = null
    }
  })

  // -----------------------------
  // Protobuf WebSocket 仿真
  // -----------------------------
  /**
   * 初始化 Protobuf WebSocket 连接
   * 
   * 使用 ProtobufWebSocketClient 封装类，简化代码：
   * - 自动加载 Proto 文件
   * - 自动创建 WebSocket 连接
   * - 只需配置参数和定义回调函数
   */
  const initProtobufWebSocket = async () => {
    try {
      // 创建 Protobuf WebSocket 客户端
      Client = new ProtobufWebSocketClient({
        // 业务配置
        // Proto 文件配置（不同项目只需修改这两处）
        protoPath: `${process.env.VITE_P_TO_B}/proto/ws_frame.proto`,
        messageType: 'protobuf.WsFrameData',
        // WebSocket 配置（不同项目只需修改 URL）
        wsUrl: 'ws://simpro02.saimo.cloud:32450/traffic_proxy/traffic_flow_render/?url=10.8.4.34:9104', // 替换为实际的 WebSocket URL
        // 技术配置
        // WebSocket 选项（可选，使用默认值）
        wsOptions: {
          autoReconnect: true, // 启用自动重连
          reconnectDelay: 3000, // 重连延迟 3 秒
          maxReconnectAttempts: 5, // 最大重连 5 次
          enableLog: false, // 启用日志
        },
        // ProtoBuf 管理器选项（可选）
        protoBufOptions: {
          enableLog: true, // 启用 ProtoBufManager 日志
        },
      })

      // 定义回调函数（业务逻辑在这里实现）
      const callbacks: WebSocketCallbacks = {
        onOpen: () => {
          console.log('WebSocket 连接成功')
          // 支持多种调用方式：
          // 1. 对象格式 + JSON
          Client?.send({ start: '1' }, MessageFormat.JSON)
          // 2. JSON 字符串格式
          // Client?.send('{"start":"1"}', MessageFormat.JSON)
          // 3. 原始字符串格式（直接发送字符串，不解析）
          // Client?.send('1111', MessageFormat.STRING)
          // 在这里可以执行连接成功后的业务逻辑
        },
        onMessage: async (receivedMessage) => {
          console.log('Received:', receivedMessage)
          // 在这里处理接收到的消息
          // 例如：处理仿真数据
          // const frameData = receivedMessage.simProToFrontEnd?.frame
          // if (frameData) {
          //   // 处理帧数据
          // }
        },
        onError: (error) => {
          console.error('WebSocket 错误:', error)
          // 在这里处理错误，例如显示错误提示
        },
        onClose: (event) => {
          console.log('WebSocket 连接关闭', { code: event.code, reason: event.reason })
          // 在这里处理连接关闭，例如清理资源
        },
        onReconnect: (attempt) => {
          console.log(`正在重连... (第 ${attempt} 次尝试)`)
          // 在这里可以显示重连提示
        },
      }

      // 连接（会自动加载 Proto 文件并建立 WebSocket 连接）
      await Client.connect(callbacks)
    } catch (error) {
      console.error('Protobuf WebSocket 初始化失败:', error)
      // 在这里可以显示错误提示给用户
    }
  }

  // -----------------------------
  // Protobuf 文件回放
  // -----------------------------
  /**
   * 加载 Protobuf 文件并开始回放（使用封装类）
   * 
   * 使用 ProtobufPlaybackClient 封装类，简化代码：
   * - 自动下载文件
   * - 自动加载 Proto 文件
   * - 自动解码和创建 TimerManager
   * - 统一的错误处理
   * - 只需配置参数和定义回调函数
   */
  const playback = async () => {
  try {
    const playbackClient = new ProtobufPlaybackClient({
      // Proto 文件配置
      protoPath: `${process.env.VITE_P_TO_B}/proto/SimulationMonitor.proto`,
      messageType: 'SimulationMonitor.SimulationMonitorBag',
      // 文件下载配置
      fileOptions: {
        url: process.env.VITE_P_TO_B + `/1800091_simpro.pb`,
        responseType: 'arrayBuffer',
        useStreaming: false,
        // header: {
        //   Authorization: `JWT ${localStorage.getItem('token') as string}`,
        //   'X-Project-Id': localStorage.getItem('X-Project-Id') as string || '',
        // }
      },
      // 播放配置
      frequency: 50,
    })

    // 加载并开始播放
    await playbackClient.loadAndPlay({
      onFrame: (frameData: any) => {
        console.log('Frame data:', frameData)
      },
      onProcess: (currentSecond: number) => {
        console.log('Current second:', currentSecond)
      },
      onComplete: () => {
        console.log('播放完成')
      },
      onError: (error) => {
        console.error('播放错误:', error)
      }
    })
  } catch (error) {
    console.error('加载 Protobuf 文件失败:', error)
  }
}

  // -----------------------------
  // Three.js 场景初始化
  // -----------------------------
  /**
   * 初始化 Three.js 场景
   */
  const initThreeJS = () => {
    if (!containerRef.value) return
    const container = containerRef.value

    // 创建 ThreeEngine 实例（统一管理所有 Three.js 对象）
    engine = new ThreeEngine(container, {
      scene: {
        backgroundColor: 0xf7f7f8,
      },
      camera: {
        fov: 55,
        position: [0, 30, 0],
        target: [0, 0, 0],
      },
      renderer: {
        antialias: true,
        logarithmicDepthBuffer: true,
        shadowMapEnabled: true,
      },
      controls: {
        enableRotate: true,
        enableZoom: true,
      },
      light: {
        ambientIntensity: 3,
        directionalIntensity: 1,
      },
      animate: {
        autoStart: true, // 自动启动动画循环
        callback: () => {
          // 每帧执行的自定义逻辑
          // 可见性控制会自动更新（如果已启用）
          initializer?.getVisibilityUpdateCallback()?.()
        },
      },
      resize: {
        enabled: true, // 启用窗口大小监听
      },
    })

  }

  /**
   * 初始化或重新加载 XODR 地图
   * @param xodrPath XODR 文件路径，如果不提供则使用默认路径
   */
  const initXodr = async (xodrPath?: string) => {
    if (!engine) {
      console.error('Engine is not initialized')
      return
    }

    try {
      // 如果还没有创建初始化器，则创建
      if (!initializer) {
        initializer = new XodrMapInitializer(engine, {
        basePath: process.env.VITE_P_TO_B || '',
        wasmPath: '/wasm/OdrHandle.js',
        modalToUrl: MODAL_TO_URL,
        // 可见性控制配置：根据相机高度自动控制组的可见性
        // 库内部会自动管理所有相关组，用户只需配置阈值即可， 只控制了线 和 object 和 signal
        visibilityControl: {
          enabled: true, // 启用自动可见性控制
          heightThreshold: 400, // 高度阈值，相机高度 <= 400 时组可见
          throttleMs: 100, // 节流间隔 100ms，避免频繁更新
          // groups: {
          //   lanePathGroup: true, // 控制路线组
          //   objectGroup: true, // 控制对象组
          //   signalGroup: true, // 控制信号组
          // },
        },
        cache: {
          enabled: false, // 启用缓存
          database: 'test',
          table: 'xodrData',
          field: 'road-all.xodr',
          // expiresIn: 24 * 60 * 60 * 1000, // 24小时后过期（可选）
          autoDeleteExpired: true,
        },
        // 配置项：XODR 解析相关配置
        parseXodr: {
          path: '/road-all.xodr',
          step: 4, // 解析步长
          chunked: {
            chunkSize: 5 * 1024 * 1024, // 5MB 每块
            concurrency: 3, // 并发 3 个请求
          },
        },
        // 配置项：道路线条相关配置
        roadLine: {
          // color 只有在 xodr 数据里的 color 为 standard 时才有效
          color: 0xffffff,
        },
        // 配置项：信号相关配置
        signal: {
          states: ['_0', '_1', '_2'],
        },
        // 配置项：隧道相关配置
        tunnel: {
          color: 0xffffff,
          opacity: 0.3,
          // 尽量和 parseXodr.step 一致
          step: 4,
          // 如果 path 为空，则绘制隧道轮廓，如果 path 不为空，则绘制隧道模型
          // path: MODAL_TO_URL.Tunnel,
        },
        // 配置项：桥梁相关配置
        bridge:  {
          color: 0xff0000,
          opacity: 0.3,
        },
        // 配置项：地面相关配置
        ground: {
          groundPath: '/ground.jpg',
          scaleFactor: 50,
        },
        // 配置项：天空相关配置
        sky: {
          skyPath: '/sky.hdr',
          hdrLoaderAdapter: null,
        },
        onProgress: (loaded, total) => {
          const percent = ((loaded / total) * 100).toFixed(1)
          console.log(`加载进度: ${percent}% (${(loaded / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB)`)
          // 可以在这里更新 UI 进度条
          // loadingProgress.value = parseFloat(percent)
        },
        })
      }

      // 执行初始化或重新加载，自动完成所有步骤
      const result = xodrPath 
        ? await initializer.reloadXodr(xodrPath) 
        : await initializer.initialize()

      // 可见性控制已通过配置自动启用，会在动画循环中自动更新

      console.log('XODR 地图初始化完成', result)
    } catch (error) {
      console.error('Error initializing XODR map:', error)
      // 可以在这里添加错误上报或用户提示
    }
  }
  

  /**
   * 切换 XODR 文件
   * @param xodrPath 新的 XODR 文件路径
   * @example
   * // 在组件外部调用：
   * // switchXodr('/new-road.xodr')
   */
  const switchXodr = async (xodrPath: string) => {
    await initXodr(xodrPath)
  }

  // 暴露方法供外部调用（如果需要）
  // 例如：在模板中可以通过 ref 调用，或者通过 props/emit 传递
  // 如果需要从父组件调用，可以取消下面的注释：
  // defineExpose({ switchXodr })
  
  // 导出函数供外部使用（例如通过事件或全局变量）
  // 如果不需要全局暴露，可以删除下面这行
  if (typeof window !== 'undefined') {
    (window as any).switchXodr = switchXodr
  }
  const loadModelGLB = async () => {
    const url = process.env.VITE_P_TO_B + (MODAL_TO_URL['自行车'] ?? GLB_URL['自行车'])
    const model = await createModalGLB(url) as any
    model.position.set(0, 0, 0)
    engine?.scene.add(model)
  }
  const loadModelFBX = async () => {
    const model = await createModalFBX(process.env.VITE_P_TO_B  + FBX_URL['自行车']) as any
    model.position.set(0, 0, 3)
    engine?.scene.add(model)
  }
</script>
<style lang="less">
  body {
    margin: 0 !important;
  }
  .index-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .three-container {
    width: 100%;
    height: 100%;
  }
</style>
