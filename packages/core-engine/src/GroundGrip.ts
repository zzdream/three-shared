import * as THREE from 'three'
import { getCachedXodrData, cacheXodrData } from '@shared/xodr'
import type { HDREnvironmentLoaderAdapter } from './types/adapter'
import { autoDetectHDREnvironmentLoaderAdapter } from './utils/adapterDetector'

export interface GroundGripOptions {
  /** 包围盒 */
  boundingBox: any
  /** 缩放因子 */
  scaleFactor?: number
  /** HDR/RGBE Loader 适配器，如果不提供则自动检测 */
  hdrLoaderAdapter?: HDREnvironmentLoaderAdapter | null
}
export class GroundGrip {
  private boundingBox: any
  private roadMesh: any
  private skyTexture: any
  private resetBoundingBox: any
  private scaleFactor: number
  private hdrLoaderAdapter: HDREnvironmentLoaderAdapter | null
  constructor(
    options?: GroundGripOptions,
  ) {
    this.boundingBox = options?.boundingBox
    this.scaleFactor = options?.scaleFactor ?? 50
    this.hdrLoaderAdapter = options?.hdrLoaderAdapter ?? null
    this.resetBoundingBox = this.resetCalulateBoundingBox()
  }

  resetCalulateBoundingBox() {
    const size = 100
    const minx = this.boundingBox.min.x - size
    const miny = this.boundingBox.min.y - size
    const minz = this.boundingBox.min.z - size
    const maxx = this.boundingBox.max.x + size
    const maxy = this.boundingBox.max.y - size
    const maxz = this.boundingBox.max.z + size
    const centerX = (maxx + minx) / 2
    const centerY = (maxy + miny) / 2
    const centerZ = (maxz + minz) / 2
    const width = maxx - minx
    const length = maxz - minz
    const height = maxy - miny
    return { minx, maxx, minz, maxz, centerX, centerY, centerZ, width, length, height }
  }

  createGround(url: any) {
    // 计算地面尺寸
    const { centerX, centerZ, width, length } = this.resetBoundingBox
    // 载入草坪贴图
    const textureLoader = new (THREE as any).TextureLoader()
    const grassTexture = textureLoader.load(url)
    grassTexture.wrapS = (THREE as any).RepeatWrapping
    grassTexture.wrapT = (THREE as any).RepeatWrapping
    grassTexture.repeat.set(width / this.scaleFactor, length / this.scaleFactor)
    // 创建地面
    const groundMaterial = new (THREE as any).MeshStandardMaterial({ map: grassTexture, side: (THREE as any).DoubleSide })
    const ground = new (THREE as any).Mesh(new (THREE as any).PlaneGeometry(width, length), groundMaterial)
    ground.rotation.x = -Math.PI / 2 // 让地面水平铺在 XZ 平面上
    ground.receiveShadow = true // 允许阴影投射到地面
    ground.renderOrder = -1 // 设置渲染顺序，确保地面在其他物体之前渲染
    // 将地面居中到包围盒中心
    ground.position.set(centerX, -0.01, centerZ)
    return ground
  }
  // 创建天空球（动态计算大小）
  async createSky({url, isUseCache, database, table}: {url: string, isUseCache: boolean, database: string, table: string}) {
    const { centerX, centerZ, width, height, length } = this.resetBoundingBox
    const diagonal = Math.sqrt(width ** 2 + height ** 2 + length ** 2) // 计算对角线长度
    const skyRadius = diagonal * 1.2 // 适当放大天空球，避免边缘裁剪
    let URI = url
    if (isUseCache) {
      const cacheConfig = { database, table, field: url}
      let blob = await getCachedXodrData({
        ...cacheConfig,
        autoDeleteExpired: true, // 自动删除过期数据
      })
      if (!blob) {
        const response = await fetch(url)
        blob = await response.blob()
        await cacheXodrData({
          ...cacheConfig,
          data: blob,
          expiresIn: null
        })
      }
      URI = URL.createObjectURL(blob)
    }
    
    return new Promise(async (resolve, reject) => {
      try {
        // 获取适配器：优先使用注入的适配器，否则自动检测
        let adapter = this.hdrLoaderAdapter
        if (!adapter) {
          adapter = await autoDetectHDREnvironmentLoaderAdapter()
        }
        // 使用适配器创建 loader
        const loader = adapter.createLoader()
        loader.load(
          URI,
          (texture: any) => {
            URL.revokeObjectURL(URI)
            const skyGeometry = new (THREE as any).SphereGeometry(skyRadius, 32, 32)
            const material = new (THREE as any).MeshBasicMaterial({
              map: texture, // 将 HDR 图像作为材质贴图
              side: (THREE as any).BackSide // 使球体的内表面可见
            })
            // 创建球体对象并应用材质
            const sphere = new (THREE as any).Mesh(skyGeometry, material)
            // 将天空球居中到包围盒中心
            sphere.position.set(centerX, -0.01, centerZ)
            resolve(sphere)
          },
          undefined,
          (error: any) => {
            reject(error)
          }
        )
      } catch (error) {
        reject(error)
      }
    })
  }
  addGroud({url}: {url: string}) {
    this.roadMesh = this.createGround(url)
    return this.roadMesh // 添加地面
  } 
  async addSky({url, isUseCache, database, table}: {url: string, isUseCache: boolean, database: string, table: string}) {
    this.skyTexture = await this.createSky({url, isUseCache, database, table})
    return this.skyTexture
  }
}
