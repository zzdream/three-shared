<template>
  <div class="index-container">
    <div ref="containerRef" class="three-container"></div>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  // import {  MODAL_TO_URL } from '@/utils/modelConst'
  import { MODAL_TO_URL } from '@/utils/imgConst'
  import * as THREE from 'three'
  import {
    initScene,
    initCamera,
    initRenderer,
    initControls,
    initLight,
    setupResizeListener,
    createAnimateLoop,
    setCenterAndCamera,
    GroundGrip
  } from '@shared/core-engine'
  import { loadWasm } from '@shared/wasm'
  import { loadXodrChunked, parseXodrData, renderXodrFaces, renderXodrLines, drawObjects, drawSignals, drawTunnels, drawBridges } from '@shared/xodr'
  const containerRef = ref<HTMLElement | null>(null)

  // Three.js 相关变量
  let scene: any = null
  let camera: any = null
  let renderer: any = null
  let controls: any = null
  let stopAnimate: (() => void) | null = null
  let cleanupResize: (() => void) | null = null
  let graphPathGroup: any // 路面组
  let lanePathGroup: any // 路线组
  let objectGroup: any // xodr 中的 object
  let signalGroup: any // xodr 中的 signal
  onMounted(() => {
    initThreeJS()
    init()
  })

  onBeforeUnmount(() => {
    // 清理 Three.js 资源
    if (stopAnimate) {
      stopAnimate()
    }
    if (cleanupResize) {
      cleanupResize()
    }
    if (controls) {
      controls.dispose()
    }
    if (renderer) {
      renderer.dispose()
      if (containerRef.value && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  })

  /**
   * 初始化 Three.js 场景
   */
  const initThreeJS = () => {
    if (!containerRef.value) return
    const container = containerRef.value
    // 1. 初始化场景
    scene = initScene({
      backgroundColor: 0xf7f7f8,
    })
    // 2. 初始化相机
    camera = initCamera(container, {
      fov: 55,
      position: [0, 30, 0],
      target: [0, 0, 0],
    })
    // 3. 初始化渲染器
    renderer = initRenderer(container, {
      antialias: true,
      logarithmicDepthBuffer: true,
      shadowMapEnabled: true,
    })
    // 4. 初始化控制器
    controls = initControls(camera, renderer, {
      enableRotate: true,
      enableZoom: true,
    })
    // 5. 初始化光照
    initLight(scene, {
      ambientIntensity: 3,
      directionalIntensity: 1,
    })

    // 6. 设置窗口大小监听
    cleanupResize = setupResizeListener(container, camera, renderer)

    // 7. 创建动画循环
    stopAnimate = createAnimateLoop(scene, camera, renderer, controls, () => {
      // 每帧执行的自定义逻辑
      // 根据相机高度控制 lanePathGroup 的可见性
      if (lanePathGroup) {
        lanePathGroup.visible = camera.position.y <= 400
      }
      if(objectGroup) {
        objectGroup.visible = camera.position.y <= 400
      }
      if(signalGroup) {
        signalGroup.visible = camera.position.y <= 400
      }
    })

    // 8. 初始化 groups
    graphPathGroup = createGroup()
    lanePathGroup = createGroup()
  }

  const init = async () => {
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
    const result = await drawSignals(MODAL_TO_URL, {
      isLoad: true,
      states: ['_0', '_1', '_2']
    }, {useCache: true, database: 'test', table: 'xodrData'}) as any
    signalGroup = result.signalGroup
    scene.add(signalGroup)
    const result2 = await drawObjects(MODAL_TO_URL, {useCache: true, database: 'test', table: 'xodrData'}) as any
    objectGroup = result2.objectGroup
    scene.add(objectGroup)
    const tunnelsGroup = await drawTunnels(MODAL_TO_URL.Tunnel, 2)
    objectGroup.add(tunnelsGroup)
    const bridgesGroup = await drawBridges(0xff0000)
    objectGroup.add(bridgesGroup)
  }

  /**
   * 解析并处理 XODR 地图数据
   */
  const drawRoadData = async (data: any[]) => {
    try {
      console.log(data, 'data')
      // 使用公共库封装的渲染函数
      renderXodrFaces(data, graphPathGroup, {})
      const { allRoadPoints } = renderXodrLines(data, lanePathGroup, {
        defaultLineColor: 0xffffff, // 业务项目可以自定义线条颜色
      }) as any
      // 计算视图中心并设置相机位置
      const { boundingBox} = setCenterAndCamera({ allRoadPoints, camera, controls })
      const groundGrip = new GroundGrip( {
        boundingBox,
        scaleFactor: 50,
        hdrLoaderAdapter: null
      })
      const ground = groundGrip.addGroud({url: process.env.VITE_P_TO_B + '/ground.jpg'})
      const sky = await groundGrip.addSky({url: process.env.VITE_P_TO_B + '/sky.hdr', isUseCache: true, database: 'sky', table: 'sky'})
      scene.add(ground)
      scene.add(sky)
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      // loading.value = false
    }
  }
  const createGroup = () => {
    const group = new (THREE as any).Group()
    scene.add(group)
    return group
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
