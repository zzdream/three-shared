import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { getCachedXodrData, cacheXodrData } from '@threejs-shared/cache-db'
import { attachFbxAnimationMixer, attachGlbAnimationMixer } from './skeletonAnimation'

const FbxLoader = new FBXLoader()

// 创建 DRACOLoader 实例并配置解码器路径
const dracoLoader = new DRACOLoader()
// 使用 CDN 路径，也可以配置为本地路径
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
// 或者使用 npm 包路径（如果安装了 three/examples/jsm/libs/draco）
// dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/')

// 创建 GLTFLoader 并配置 DRACOLoader
const GltfLoader = new GLTFLoader()
GltfLoader.setDRACOLoader(dracoLoader)

// 内存缓存：已解析的模型（同一会话内复用，避免重复解析）
const fbxModelCache = new Map<string, { clone(recursive?: boolean): unknown; animations?: any[] }>()
const glbModelCache = new Map<string, { clone(recursive?: boolean): unknown; userData?: any }>()

/**
 * 每帧在渲染前调用一次，更新场景中所有已挂载的骨骼动画 Mixer（createModalFBX / createCacheModalFBX / GLB 等同理）
 * @param delta 秒，建议 THREE.Clock.getDelta()
 */
export const createCacheModalFBX = async (url: string, cache: { useCache: boolean, database: string, table: string }) => {
    // 命中内存缓存时直接返回克隆体，跳过网络和解析
    const cached = fbxModelCache.get(url)
    if (cached) {
        const cloned = (cached as any).clone(true) as any
        if (!cloned.animations?.length && (cached as any).animations?.length) {
            cloned.animations = (cached as any).animations.slice()
        }
        // clone 后骨骼是新的，必须在克隆体上新建 Mixer，否则原模型的 mixer 不会驱动克隆
        attachFbxAnimationMixer(cloned)
        return cloned as Awaited<ReturnType<typeof createModalFBX>>
    }

    let blob: Blob
    const { useCache, database, table } = cache || { useCache: false, database: 'test', table: 'xodrData' }
    if (useCache) {
        // 缓存配置
        const cacheConfig = { database, table, field: url}
        // 尝试从缓存读取数据
        blob = await getCachedXodrData({
            ...cacheConfig,
            autoDeleteExpired: true, // 自动删除过期数据
        })
        if (!blob) {
            const response = await fetch(url)
            blob = await response.blob()
            await cacheXodrData({
                ...cacheConfig,
                data: blob,
                expiresIn: 24 * 60 * 60 * 1000, // 24小时 = 86400000毫秒
            })
        }
        const blobUrl = URL.createObjectURL(blob)
        const model = await createModalFBX(blobUrl)
        fbxModelCache.set(url, model as { clone(recursive?: boolean): unknown })
        return model
    } else {
        const model = await createModalFBX(url)
        fbxModelCache.set(url, model as { clone(recursive?: boolean): unknown })
        return model
    }
}
export const createModalFBX = (blobUrl: string) => {
    return new Promise((resolve, reject) => {
      try {
        FbxLoader.load(
          blobUrl,
            (model: any) => {
            try {
              model.renderOrder = 1
              URL.revokeObjectURL(blobUrl) // 清除临时 URL
              attachFbxAnimationMixer(model)
              resolve(model)
            } catch (e) {
              console.log(blobUrl, 'blobUrl')
            }
          },
          undefined, // 进度回调（可选）
          (error: { message: string }) => {
            // console.log(error.message)
          }
        )
      } catch (error) {
        console.log(error)
      }
    })
  }

export const createCacheModalGLB = async (url: string, cache: { useCache: boolean, database: string, table: string }) => {
    // 命中内存缓存时直接返回克隆体，跳过网络和解析
    const cached = glbModelCache.get(url)
    if (cached) {
        const cloned = (cached as any).clone(true) as any
        attachGlbAnimationMixer(cloned, (cached as any).userData?.__glbAnimations)
        return cloned as Awaited<ReturnType<typeof createModalGLB>>
    }

    let blob: Blob
    const { useCache, database, table } = cache || { useCache: false, database: 'test', table: 'xodrData' }
    if (useCache) {
        // 缓存配置
        const cacheConfig = { database, table, field: url}
        // 尝试从缓存读取数据
        blob = await getCachedXodrData({
            ...cacheConfig,
            autoDeleteExpired: true, // 自动删除过期数据
        })
        if (!blob) {
            const response = await fetch(url)
            blob = await response.blob()
            await cacheXodrData({
                ...cacheConfig,
                data: blob,
                expiresIn: 24 * 60 * 60 * 1000, // 24小时 = 86400000毫秒
            })
        }
        const blobUrl = URL.createObjectURL(blob)
        const model = await createModalGLB(blobUrl)
        glbModelCache.set(url, model as { clone(recursive?: boolean): unknown })
        return model
    } else {
        const model = await createModalGLB(url)
        glbModelCache.set(url, model as { clone(recursive?: boolean): unknown })
        return model
    }
}

export const createModalGLB = (blobUrl: string) => {
    return new Promise((resolve, reject) => {
      try {
        GltfLoader.load(
          blobUrl,
            (gltf: any) => {
            try {
              const model = gltf.scene
              model.renderOrder = 1
              URL.revokeObjectURL(blobUrl) // 清除临时 URL
              if (gltf.animations?.length) {
                if (!model.userData) model.userData = {}
                model.userData.__glbAnimations = gltf.animations.slice()
                attachGlbAnimationMixer(model, gltf.animations)
              }
              model.traverse((child: any)=>{
                if(child.isMesh){
                  const mat = child.material
                  if(mat.map){
                    mat.map.colorSpace = THREE.SRGBColorSpace
                  }
                  if(mat.metalness !== undefined){
                    mat.metalness *= 0.7
                    // mat.roughness = Math.min(mat.roughness + 0.1, 1)
                  }
                }
              })
              resolve(model)
            } catch (e) {
              console.log(blobUrl, 'blobUrl', e)
              reject(e)
            }
          },
          undefined, // 进度回调（可选）
          (error: { message: string }) => {
            console.log(error.message)
            reject(error)
          }
        )
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  }
