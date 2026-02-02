import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { getCachedXodrData, cacheXodrData } from '@shared/xodr'
const FbxLoader = new FBXLoader()
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
            console.log(error.message)
          }
        )
      } catch (error) {
        console.log(error)
      }
    })
  }
