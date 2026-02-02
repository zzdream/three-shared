<template>
  <div class="index-container">
    <div ref="containerRef" class="three-container"></div>
    <button @click="switchXodr('/11.xodr')" style="position: absolute; top: 10px; left: 10px; z-index: 1000;">切换XODR</button>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  // import {  MODAL_TO_URL } from '@/utils/modelConst'
  import { MODAL_TO_URL } from '@/utils/imgConst'

  import {
    ThreeEngine,
  } from '@shared/core-engine'
  import { XodrMapInitializer } from '@shared/xodr'
  const containerRef = ref<HTMLElement | null>(null)

  // Three.js 相关变量
  let engine: ThreeEngine | null = null
  let initializer: XodrMapInitializer | null = null // 保存初始化器实例
  // 以下变量由 XodrMapInitializer 初始化后赋值，用于后续控制可见性等操作
  let lanePathGroup: any // 路线组（用于控制可见性）
  let objectGroup: any // xodr 中的 object（用于控制可见性）
  let signalGroup: any // xodr 中的 signal（用于控制可见性）
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

  }

  /**
   * 初始化或重新加载 XODR 地图
   * @param xodrPath XODR 文件路径，如果不提供则使用默认路径
   */
  const initXodr = async (xodrPath?: string) => {
    console.log('initXodr', xodrPath, initializer)
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
        xodrPath: '/road-all.xodr',
        modalToUrl: MODAL_TO_URL,
        cache: {
          enabled: true, // 启用缓存
          database: 'test',
          table: 'xodrData',
          field: 'road-all.xodr',
          // expiresIn: 24 * 60 * 60 * 1000, // 24小时后过期（可选）
          autoDeleteExpired: true,
        },
        chunked: {
          chunkSize: 5 * 1024 * 1024, // 5MB 每块
          concurrency: 3, // 并发 3 个请求
        },
        parse: {
          step: 4, // 解析步长
        },
        render: {
          defaultLineColor: 0xffffff,
          signalStates: ['_0', '_1', '_2'],
          tunnelPath: MODAL_TO_URL.Tunnel,
          bridgeColor: 0xff0000,
        },
        ground: {
          enabled: true,
          groundPath: '/ground.jpg',
          skyPath: '/sky.hdr',
          scaleFactor: 50,
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

      // 保存返回的组引用，用于后续控制可见性等操作
      // graphPathGroup 是路面组，通常不需要动态控制可见性，所以不保存
      lanePathGroup = result.lanePathGroup
      objectGroup = result.objectGroup
      signalGroup = result.signalGroup

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
