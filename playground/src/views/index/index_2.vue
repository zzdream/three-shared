<template>
  <div class="index-container">
    <div ref="containerRef" class="three-container"></div>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  // import {  MODAL_TO_URL } from '@/utils/modelConst'
  import { MODAL_TO_URL } from '@/utils/imgConst'

  import {
    ThreeEngine,
    createGroup,
    GroundGrip
  } from '@shared/core-engine'
  import { loadWasm } from '@shared/wasm'
  import { loadXodrChunked, parseXodrData, renderXodrFaces, renderXodrLines, drawObjects, drawSignals, drawTunnels, drawBridges } from '@shared/xodr'
  const containerRef = ref<HTMLElement | null>(null)

  // Three.js 相关变量
  let engine: ThreeEngine | null = null
  let graphPathGroup: any // 路面组
  let lanePathGroup: any // 路线组
  let objectGroup: any // xodr 中的 object
  let signalGroup: any // xodr 中的 signal
  onMounted(() => {
    initThreeJS()
    initXodr()
  })

  onBeforeUnmount(() => {
    // 清理 Three.js 资源
    if (engine) {
      engine.dispose()
      engine = null
    }
  })

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
          // 根据相机高度控制 lanePathGroup 的可见性
          if (!engine) return

          const cameraHeight = engine.camera.position.y
          const isVisible = cameraHeight <= 400

          if (lanePathGroup) {
            lanePathGroup.visible = isVisible
          }
          if (objectGroup) {
            objectGroup.visible = isVisible
          }
          if (signalGroup) {
            signalGroup.visible = isVisible
          }
        },
      },
      resize: {
        enabled: true, // 启用窗口大小监听
      },
    })

    // 初始化 groups
    graphPathGroup = createGroup()
    lanePathGroup = createGroup()
    // 将 groups 添加到场景
    engine.scene.add(graphPathGroup)
    engine.scene.add(lanePathGroup)
  }

  const initXodr = async () => {
    // 1. 加载 WebAssembly 模块
    await loadWasm(process.env.VITE_P_TO_B + '/wasm/OdrHandle.js')
    
    // // 缓存配置
    // const cacheConfig = { database: 'xodrCache', table: 'xodrData', field: 'road-all.xodr'}
    
    // // 尝试从缓存读取数据
    // const cachedData = await getCachedXodrData({
    //   ...cacheConfig,
    //   autoDeleteExpired: true, // 自动删除过期数据
    // })
    
    // if (cachedData) {
    //   drawRoadData(cachedData as any[])
    //   return
    // }
    
    // 2. 分块加载 XODR 文件（推荐用于 50-60MB 大文件）
    // 优势：分块下载、并发加载、更好的错误恢复、可控制内存占用
    const mapData = await loadXodrChunked({
      url: process.env.VITE_P_TO_B + '/road-all.xodr',
      chunkSize: 5 * 1024 * 1024, // 5MB 每块（适合 50-60MB 文件）
      concurrency: 3, // 并发 3 个请求（平衡速度和服务器压力）
      onProgress: (loaded, total) => {
        const percent = ((loaded / total) * 100).toFixed(1)
        console.log(`加载进度: ${percent}% (${(loaded / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB)`)
        // 可以在这里更新 UI 进度条
        // loadingProgress.value = parseFloat(percent)
      },
    })
    
    // mapData 此时是 string 类型
    const data = await parseXodrData(mapData, 4)
    
    // // 缓存数据，设置过期时间
    // // 方式1: 使用毫秒数（推荐）- 24小时后过期
    // await cacheXodrData({
    //   ...cacheConfig,
    //   data,
    //   expiresIn: 24 * 60 * 60 * 1000, // 24小时 = 86400000毫秒
    // })
    
    // 方式2: 使用 Date 对象指定具体过期时间
    // const tomorrow = new Date()
    // tomorrow.setDate(tomorrow.getDate() + 1) // 明天过期
    // await cacheXodrData({
    //   ...cacheConfig,
    //   data,
    //   expiresIn: tomorrow,
    // })
    
    // 方式3: 永不过期（默认行为，不传 expiresIn 即可）
    // await cacheXodrData({
    //   ...cacheConfig,
    //   data,
    //   // expiresIn: null, // 或者不传这个参数
    // })
    
    drawRoadData(data)

    // 添加信号组
    if (!engine) {
      console.error('Engine is not initialized')
      return
    }

    const result = await drawSignals(MODAL_TO_URL, {
      isLoad: true,
      states: ['_0', '_1', '_2'],
    }, { useCache: true, database: 'test', table: 'xodrData' }) as any
    signalGroup = result.signalGroup
    engine.scene.add(signalGroup)

    // 添加对象组
    const result2 = await drawObjects(MODAL_TO_URL, { useCache: true, database: 'test', table: 'xodrData' }) as any
    objectGroup = result2.objectGroup
    engine.scene.add(objectGroup)
    const tunnelsGroup = await drawTunnels(MODAL_TO_URL.Tunnel, 2)
    objectGroup.add(tunnelsGroup)
    const bridgesGroup = await drawBridges(0xff0000)
    objectGroup.add(bridgesGroup)
  }

  /**
   * 解析并处理 XODR 地图数据
   * @param data XODR 解析后的数据
   */
  const drawRoadData = async (data: any[]) => {
    // 类型安全检查
    if (!engine) {
      console.error('Engine is not initialized')
      return
    }

    try {
      console.log(data, 'data')

      // 1. 渲染路面
      renderXodrFaces(data, graphPathGroup, {})

      // 2. 渲染道路边界线
      const lineResult = renderXodrLines(data, lanePathGroup, {
        defaultLineColor: 0xffffff, // 业务项目可以自定义线条颜色
      })

      if (!lineResult?.allRoadPoints || lineResult.allRoadPoints.length === 0) {
        console.warn('No road points found, skipping camera setup')
        return
      }

      // 3. 计算视图中心并设置相机位置
      const { boundingBox } = engine.setCameraAndControls(lineResult.allRoadPoints)

      // 4. 创建地面和天空
      const groundGrip = new GroundGrip({
        boundingBox,
        scaleFactor: 50,
        hdrLoaderAdapter: null,
      })

      const ground = groundGrip.addGroud({
        url: process.env.VITE_P_TO_B + '/ground.jpg',
      })

      const sky = await groundGrip.addSky({
        url: process.env.VITE_P_TO_B + '/sky.hdr',
        isUseCache: true,
        database: 'sky',
        table: 'sky',
      })

      // 5. 添加到场景
      engine.scene.add(ground)
      engine.scene.add(sky)
    } catch (error) {
      console.error('Error processing XODR data:', error)
      // 可以在这里添加错误上报或用户提示
      // throw error // 如果需要向上传播错误
    } finally {
      // loading.value = false
    }
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
