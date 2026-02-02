import {  getXodrSignalsInfo, drawXodrObjects } from '@shared/wasm'
import { createGroup, CrosswalkLineRoadMark, MeshLineRoadMark, createTexture, dreawPaking,createModelClone, createCacheModalFBX } from '@shared/core-engine'
export const drawObjects = async (MODAL_TO_URL: any, cache: { useCache: boolean, database: string, table: string }) => {
    const objectList = await drawXodrObjects()
    const objectModel: any = {}
    console.log('objectList', objectList)
    if (!objectList?.length) {
        console.log('objectList is empty')
        return
    }
    const objectGroup = createGroup()
    // 并行处理异步操作
    const asyncTasks = []
    for (const { objects } of objectList) {
      if (!objects) continue
      for (const item of objects) {
        const key = item.name
        if (key == 'Crosswalk_Line') {
          // 人行横道 需要绘制 不需要模型
          CrosswalkLineRoadMark(item, objectGroup)
        } else if (key == 'Mesh_Line') {
          MeshLineRoadMark(item, objectGroup)
        } else if (['CustomParkingSpace', 'Parking_5m', 'Parking_6m', 'Parking_45deg', 'Parking_60deg'].includes(key)) {
          const vertexs = item.vertexs[0]
          const color = vertexs[0]?.color || 0xffffff
          // 定义四个点的坐标
          const points = vertexs.flatMap(({ x, y }: any) => [x, 0, -y]).concat([vertexs[0].x, 0, -vertexs[0].y]) // 连接首尾点
          dreawPaking(points, color, objectGroup)
          if (item?.repeatObjects?.length) {
            item.repeatObjects.forEach((it: any) => {
              const re_vertexs = it.vertexs
              const re_points = re_vertexs.flatMap(({ x, y }: any) => [x, 0, -y]).concat([re_vertexs[0].x, 0, -re_vertexs[0].y]) // 连接首尾点
              dreawPaking(re_points, color, objectGroup)
            })
          }
        } else {
          if (key == 'Tunnel_door') continue
          const resourcePath = MODAL_TO_URL[key]
          if (!resourcePath) {
            console.log(key, '未找到对应的资源')
            continue
          }
          // 判断是图片还是模型：根据文件扩展名
          const pathStr = String(resourcePath)
          const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(pathStr)
          const isModel = /\.(fbx|FBX|glb|gltf)$/i.test(pathStr)
          if (isImage) {
            // 如果是图片，使用 createTexture
            if (!objectModel[key]) {
              objectModel[key] = await createTexture(resourcePath, item)
              objectGroup.add(objectModel[key] )
            }
            const imageClone = objectModel[key].clone()
            imageClone.position.set(item.x, item.z || 0.01, -item.y)
            imageClone.rotation.x = -Math.PI / 2
            imageClone.rotation.z = (item.hdg || 0) - Math.PI / 2
            // objectGroup.add(createTexture(resourcePath, item))
          } else if (isModel) {
            // 如果是模型，使用模型加载逻辑
            if (objectModel[key]) {
              objectGroup.add(createModelClone(objectModel[key], item))
            } else {
              const task = (async () => {
                objectModel[key] = await createCacheModalFBX(resourcePath, cache)
                objectGroup.add(createModelClone(objectModel[key], item))
              })()
              asyncTasks.push(task)
            }
          } else {
            console.log(key, '资源类型无法识别:', pathStr)
          }
        }
      }
    }
    await Promise.all(asyncTasks)
    return {objectGroup, objectModel}
}
export const drawSignals = async (MODAL_TO_URL: any, isLoadStatuslight:{
  isLoad: boolean,
  states: string[]
} = {
  isLoad: true,
  states: ['_0', '_1', '_2']
}, cache: { useCache: boolean, database: string, table: string }) => {
    const traffic_light_type = [
        '车道信号灯',
        '横排全方位灯',
        '横向右转灯',
        '横向直行灯',
        '横向左转灯',
        '竖排全方位灯',
        '竖排直行灯',
        '竖排左转灯',
        '竖排右转灯',
        '单车指示灯',
        '竖排人行灯',
        '双色指示灯'
      ]
    const signalList = await getXodrSignalsInfo()
    console.log('signalList', signalList)
    if (!signalList?.length) {
        console.log('signalList is empty')
        return
    }
    const signalGroup = createGroup()
    const signalModel: any = {}
    const loadTrafficSignModel = async (key: string, item: any) => {
      if (MODAL_TO_URL[key]?.indexOf('.') == -1) return null
      if (!MODAL_TO_URL[key]) {
        console.log(key, 'key')
      }
      const resourcePath = MODAL_TO_URL[key]
      // 判断是图片还是模型：根据文件扩展名
      const pathStr = String(resourcePath)
      const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(pathStr)
      const isModel = /\.(fbx|FBX|glb|gltf)$/i.test(pathStr)
      
      if (isImage) {
        // 如果是图片，预加载并克隆（和模型一样的逻辑）
        if (!signalModel[key]) {
          signalModel[key] = await createTexture(resourcePath, item)
        }
        const imageClone = signalModel[key].clone()
        imageClone.__attr = item
        imageClone.position.set(item.x, item.z || 0.01, -item.y)
        imageClone.rotation.x = -Math.PI / 2
        imageClone.rotation.z = (item.hdg || 0) - Math.PI / 2
        return imageClone
      } else if (isModel) {
        // 如果是模型，使用模型加载逻辑
        if (!signalModel[key]) {
          signalModel[key] = await createCacheModalFBX(resourcePath, cache)
        }
        const modelClone = signalModel[key].clone()
        modelClone.__attr = item
        modelClone.position.set(item.x, item.z || 0, -item.y)
        modelClone.rotation.set(0, item.hdg || 0, 0, 'XYZ')
        return modelClone
      } else {
        console.log(key, '资源类型无法识别:', pathStr)
        return null
      }
    }
    const loadTrafficLightModels = async (name: string, item: any) => {
      const key = `${name}`
      const modelClone = await loadTrafficSignModel(key, item)
      if (modelClone) {
        modelClone.__status = undefined // 无状态
        signalGroup.add(modelClone)
      }
      // 预加载状态灯（包括图片和模型）
      if (isLoadStatuslight?.isLoad) {
        const states = isLoadStatuslight?.states
        await Promise.all(
          states.map(async (state: string) => {
            const stateKey = `${name}${state}`
            if (MODAL_TO_URL[stateKey] && MODAL_TO_URL[stateKey]?.indexOf('.') >= 0) {
              const stateResourcePath = MODAL_TO_URL[stateKey]
              const statePathStr = String(stateResourcePath)
              const isStateImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(statePathStr)
              const isStateModel = /\.(fbx|FBX|glb|gltf)$/i.test(statePathStr)
              
              if (isStateImage && !signalModel[stateKey]) {
                // 预加载状态图片
                signalModel[stateKey] = await createTexture(stateResourcePath, item)
                signalModel[stateKey].__attr = item
              } else if (isStateModel && !signalModel[stateKey]) {
                // 预加载状态模型
                signalModel[stateKey] = await createCacheModalFBX(stateResourcePath, cache)
                signalModel[stateKey].__attr = item
              }
            }
          })
        )
      }
    }
    const promises = signalList.flatMap(
      (group: any) =>
        group.signals?.map(async (item: any) => {
          const name = item.name
          item.length = item.height
          // 交通灯
          if (traffic_light_type.includes(name)) {
            await loadTrafficLightModels(name, item)
          // 交通标志
          } else {
            const modelClone = await loadTrafficSignModel(name, item)
            if (modelClone) signalGroup.add(modelClone)
          }
        }) || []
    )
    await Promise.all(promises)
    return {signalGroup, signalModel}
}