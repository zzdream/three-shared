import {  getTunnelsDrawInfo } from '@threejs-shared/wasm'
import { createGroup, createModalFBX, createGeometry, mergeGeometries } from '@threejs-shared/core-engine'
import * as THREE from 'three'
// 隧道模型的基础宽度（单位：米）
let tunnelModelCache: any = null
const TUNNEL_MODEL_WIDTH = 7
export const drawBridgesOrTunnel = (pointsData: any[], color: number, group: { add: (arg0: any) => void }, opacity: number = 0.3) => {
  const roadsgeometry = []
  const pos = pointsData.map((p) => {
    return new THREE.Vector3(p.x, -p.y)
  })
  roadsgeometry.push(createGeometry(pos, color))
  group.add(mergeGeometries(roadsgeometry, opacity))
}

/**
 * 获取隧道信息
 * @returns 隧道信息列表
 * Tunnel 不传 就是绘制隧道轮廓，如果传了 就是绘制隧道模型
 */
export const drawTunnels = async (Tunnel: any, step: number = 2, color: number = 0x00ffff, opacity: number = 0.3): Promise<any>  => {
  const list = await getTunnelsDrawInfo(step)
  const tunnelGroup = createGroup()
  if (!list || list.length === 0) return null
  if (!Tunnel) {
    tunnelGroup.__type = 'tunnel'
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list[i].tunnels.length; j++) {
        const outs = list[i].tunnels[j].outline
        // 构建完整的曲线轮廓：沿 first 的所有点，然后沿 second 反向连接
        const outline: any[] = []
        // 添加 first 数组的所有点（从第一个到最后一个）
        if (Array.isArray(outs.first) && outs.first.length > 0) {
          outline.push(...outs.first)
        }
        // 添加 second 数组的所有点（从最后一个到第一个，反向）
        if (Array.isArray(outs.second) && outs.second.length > 0) {
          for (let k = outs.second.length - 1; k >= 0; k--) {
            outline.push(outs.second[k])
          }
        }
        // 确保轮廓闭合（添加第一个点以形成闭合多边形）
        if (outline.length > 0) {
          outline.push(outline[0])
        }
        drawBridgesOrTunnel(outline, color, tunnelGroup, opacity)
      }
    }
    return tunnelGroup
  }
  const tunnelModel = await ensureTunnelModel(Tunnel)
  // const tunnelDoorModel = await ensureTunnelDoorModel()
  if (!tunnelModel) return null
  tunnelGroup.__type = 'tunnel'
  list.forEach((item: { tunnels: any[] }) => {
    item.tunnels?.forEach((tunnel: { outline: any }) => {
      // centers 的第一个点使用 Tunnel_door 模型，其他点使用 Tunnel 模型
      const meshes = createTunnelInstancesFromOutline(tunnel.outline, tunnelModel)
      meshes.forEach((mesh: any) => tunnelGroup.add(mesh))
    })
  })
  if (!tunnelGroup.children.length) return null
  return tunnelGroup
}
const ensureTunnelModel = async (tunnelPath: any) => {
    if (tunnelModelCache) return tunnelModelCache
    if (!tunnelPath) {
      console.warn('Tunnel model path is missing in data.')
      return null
    }
    tunnelModelCache = await createModalFBX(tunnelPath)
    return tunnelModelCache
  }
  
  // const ensureTunnelDoorModel = async () => {
  //   if (tunnelDoorModelCache) return tunnelDoorModelCache
  //   const tunnelDoorPath = XODE_OBJ_SIGNAL?.Tunnel_door
  //   if (!tunnelDoorPath) {
  //     console.warn('Tunnel_door model path is missing in XODE_OBJ_SIGNAL.')
  //     return null
  //   }
  //   tunnelDoorModelCache = await createModalFBX(tunnelDoorPath)
  //   return tunnelDoorModelCache
  // }

  const normalizeTunnelOutline = (outline: { first: any; second: any; right: any }) => {
    if (!outline) return { left: [], right: [] }
    const left = Array.isArray(outline.first) ? outline.first : []
    const rightSource = outline.second || outline.right
    const right = Array.isArray(rightSource) ? rightSource : []
    return { left, right }
  }

  const buildTunnelCenters = (outline: any) => {
      const { left, right } = normalizeTunnelOutline(outline)
      const count = Math.min(left.length, right.length)
      const centers = []
      const widths = []
      for (let i = 0; i < count; i++) {
        const l = left[i]
        const r = right[i]
        if (!l || !r) continue
        const center = new (THREE as any).Vector3((l.x + r.x) / 2, ((l.z ?? 0) + (r.z ?? 0)) / 2, -((l.y + r.y) / 2))
        if (centers.length && centers[centers.length - 1].distanceTo(center) < 0.01) continue
        // 计算实际路宽：left 和 right 点之间的水平距离（在 XZ 平面上）
        const leftPoint = new (THREE as any).Vector3(l.x, 0, -l.y)
        const rightPoint = new (THREE as any).Vector3(r.x, 0, -r.y)
        const actualWidth = leftPoint.distanceTo(rightPoint)
        centers.push(center)
        widths.push(actualWidth)
      }
      return { centers, widths }
    }
  const createTunnelInstancesFromOutline = (outline: any, baseModel: any, firstModel = null) => {
    const { centers, widths } = buildTunnelCenters(outline)
    if (!centers.length || !baseModel) return []
    return centers.map((center, index) => {
      // 第一个点使用 firstModel（如果提供），其他点使用 baseModel
      const modelToUse = index === 0 && firstModel ? firstModel : baseModel
      const mesh = modelToUse.clone(true)
      mesh.position.copy(center)
      mesh.rotation.x = 0
      mesh.rotation.y = -computeHeadingFromCenters(centers, index)
      mesh.rotation.z = 0
      // 根据实际路宽计算缩放比例（模型宽度为 7m）
      const actualWidth = widths[index] || TUNNEL_MODEL_WIDTH
      const scale = actualWidth / TUNNEL_MODEL_WIDTH
      // 只在 X 和 Z 轴方向缩放（宽度方向），保持 Y 轴（高度）不变
      mesh.scale.set(scale, 1, scale)
      mesh.__outlineIndex = index
      return mesh
    })
  }

  const computeHeadingFromCenters = (centers: any[], index: number) => {
    const current = centers[index]
    if (!current) return 0
    const target = centers[index + 1] || centers[index - 1]
    if (!target) return 0
    const dx = target.x - current.x
    const dz = target.z - current.z
    if (!dx && !dz) return 0
    return Math.atan2(dz, dx)
  }


    /**
   * 获取桥梁信息
   * @returns 桥梁信息列表
   * 桥梁直接绘制，暂不支持模型
  */
  export const drawBridges = async (color: number = 0xffffff, opacity: number = 0.3): Promise<any>  => {
    const BridgesDrawInfo = window.Module.cwrap!('getBridgesDrawInfo', 'string', 'number')
    const bridgesGroup = createGroup()
    const result = BridgesDrawInfo(1)
    if (!result || result.includes('null')) return
    const list = JSON.parse(result)
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list[i].bridges.length; j++) {
        const outs = list[i].bridges[j].outline
        // 构建完整的曲线轮廓：沿 first 的所有点，然后沿 second 反向连接
        const outline: any[] = []
        // 添加 first 数组的所有点（从第一个到最后一个）
        if (Array.isArray(outs.first) && outs.first.length > 0) {
          outline.push(...outs.first)
        }
        // 添加 second 数组的所有点（从最后一个到第一个，反向）
        if (Array.isArray(outs.second) && outs.second.length > 0) {
          for (let k = outs.second.length - 1; k >= 0; k--) {
            outline.push(outs.second[k])
          }
        }
        // 确保轮廓闭合（添加第一个点以形成闭合多边形）
        if (outline.length > 0) {
          outline.push(outline[0])
        }
        drawBridgesOrTunnel(outline, color, bridgesGroup, opacity)
      }
    }
    return bridgesGroup
  }
  