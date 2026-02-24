import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { getCachedXodrData, cacheXodrData } from '@shared/xodr'

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
export const createCacheModalFBX = async (url: string, cache: { useCache: boolean, database: string, table: string }) => {
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
        return createModalFBX(blobUrl)
    } else {
        return createModalFBX(url)
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
              if (model.animations?.length) {
                const mixer = new (THREE as any).AnimationMixer(model)
                const action = mixer.clipAction(model.animations[0])
                action.reset().play()
              }
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
        return createModalGLB(blobUrl)
    } else {
        return createModalGLB(url)
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
                const mixer = new (THREE as any).AnimationMixer(model)
                gltf.animations.forEach((clip: any) => {
                  const action = mixer.clipAction(clip)
                  action.reset().play()
                })
              }
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
