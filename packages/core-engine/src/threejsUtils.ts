/// <reference path="../types/three.d.ts" />
/// <reference path="../types/earcut.d.ts" />
import * as THREE from 'three'
import earcut from 'earcut'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
export const createGroup = () => {
    const group = new (THREE as any).Group()
    return group
}

// 画停车位
export const dreawPaking = (points: any[], color: any, group: any) => {
    const geometry = new (THREE as any).BufferGeometry()
    // points 应该是 [x1, y1, z1, x2, y2, z2, ...] 这样的数组
    geometry.setAttribute('position', new (THREE as any).Float32BufferAttribute(points, 3))
    // 普通线条材质（注意：在 WebGL1/2 下 linewidth 基本无效，始终是1px）
    const material = new (THREE as any).LineBasicMaterial({ color: color || 0xffffff, transparent: true })
    // 创建线条
    const line = new (THREE as any).Line(geometry, material)
    line.position.y = 0.001 + Math.random() / 10000
    // 添加到组
    group.add(line)
  }
  
export const createTexture = (img: any, item: { width: any; length: any; x: any; y: number; hdg: number }) => {
    // 使用TextureLoader加载图片
    const textureLoader = new (THREE as any).TextureLoader()
    const texture = textureLoader.load(img)
    
    // 设置纹理颜色空间，避免图片发白
    // Three.js r152+ 使用 colorSpace，旧版本使用 encoding
    if ('colorSpace' in texture) {
      texture.colorSpace = (THREE as any).SRGBColorSpace
    } else {
      texture.encoding = (THREE as any).sRGBEncoding
    }
    
    // 优化纹理过滤设置，减少锯齿
    // LinearMipmapLinearFilter: 当纹理缩小时使用线性过滤和 mipmap，减少锯齿
    // LinearFilter: 当纹理放大时使用线性过滤
    texture.minFilter = (THREE as any).LinearMipmapLinearFilter
    texture.magFilter = (THREE as any).LinearFilter
    texture.generateMipmaps = true
    // 设置纹理重复模式，避免边缘出现黑边
    texture.wrapS = (THREE as any).ClampToEdgeWrapping
    texture.wrapT = (THREE as any).ClampToEdgeWrapping
    
    // 创建一个平面几何体
    const geometry = new (THREE as any).PlaneGeometry(item.width, item.length) // 可以根据图片的宽高比调整尺寸
    // const geometry = new PlaneGeometry(3, 3) // 可以根据图片的宽高比调整尺寸
    // 创建材质并将加载的纹理作为材质的map
    const material = new (THREE as any).MeshBasicMaterial({ map: texture, transparent: true, opacity: 1.0 })
    // 创建网格（Mesh）
    const plane = new (THREE as any).Mesh(geometry, material)
    // 设置网格的位置
    plane.position.set(item.x, 0.01, -item.y) // 将x, y, z替换为你想要的坐标
    plane.rotation.x = -Math.PI / 2
    plane.rotation.z = item.hdg - Math.PI / 2
    return plane
}
  
// 导出一个函数CrosswalkLineRoadMark，用于绘制人行道的线段
export const CrosswalkLineRoadMark = (item: { vertexs: any[] }, group: { add: (arg0: any) => void }) => {
    // // 方式二：多个线段
    // 定义一个空数组sideWalkgeometryList，用于存储人行道的线段
    let sideWalkgeometryList = []
    // 如果item中有vertexs属性，并且vertexs的长度大于0
    if (item.vertexs && item.vertexs.length) {
      // 遍历vertexs中的每一个walks
      sideWalkgeometryList = item.vertexs.map(walks => {
        // 遍历walks中的每一个walk
        const walkLine = walks.map((walk: { x: any; y: any }) => {
          // 获取walk中的x和y坐标
          const { x, y } = walk
          // 返回一个新的Vector3对象，x坐标不变，y坐标取反
          return new (THREE as any).Vector3(x, -y)
        })
        // 调用createGeometry函数，将walkLine作为参数传入，返回一个新的几何体
        return createGeometry(walkLine, 0xffffff)
      })
    }
    group.add(mergeGeometries(sideWalkgeometryList, 1))
  }
// 导出一个函数MeshLineRoadMark，用于绘制网状线的线段
export const MeshLineRoadMark = (item: { outline: any[]; outlineWidth: number; vertexs: any[]; vertexsWidth: number }, group: { add: (arg0: any) => void }) => {
  // 创建一个组来包含所有线条
  const meshLineGroup = new (THREE as any).Group()
  
  // 处理 outline：将点连成一条连续的线
  if (item.outline && item.outline.length > 0) {
    const outlinePositions: any[] = []
    item.outline.forEach(point => {
      outlinePositions.push(point.x, 0.001, -point.y)
    })
    
    if (outlinePositions.length > 0) {
      const outlineGeometry = new LineGeometry()
      outlineGeometry.setPositions(outlinePositions)
      const outlineMaterial = new LineMaterial({ 
        color: 0xFFDD00, 
        linewidth: item.outlineWidth * 6
      })
      outlineMaterial.depthTest = false
      outlineMaterial.resolution.set(window.innerWidth, window.innerHeight)
      const outlineLine = new Line2(outlineGeometry, outlineMaterial)
      meshLineGroup.add(outlineLine)
    }
  }
  
  // 处理 vertexs：每个项连成一条独立的线段
  if (item.vertexs && item.vertexs.length > 0) {
    item.vertexs.forEach(vertexPair => {
      if (vertexPair && vertexPair.length >= 2) {
        // 每个 vertexPair 包含两个点，连成一条线段
        const segmentPositions: any[] = []
        vertexPair.forEach((point: { x: any; y: number }) => {
          segmentPositions.push(point.x, 0.001, -point.y)
        })
        
        if (segmentPositions.length > 0) {
          const segmentGeometry = new LineGeometry()
          segmentGeometry.setPositions(segmentPositions)
          // 使用 vertexPair 中第一个点的颜色，如果没有则使用白色
          const segmentColor = vertexPair[0]?.color || 0xffffff
          // 将颜色字符串转换为数字（如果是十六进制字符串）
          const colorValue = typeof segmentColor === 'string' 
            ? parseInt(segmentColor.replace('#', ''), 16) 
            : segmentColor
          const segmentMaterial = new LineMaterial({ 
            color: colorValue, 
            linewidth: item.vertexsWidth * 6
          })
          segmentMaterial.depthTest = false
          segmentMaterial.resolution.set(window.innerWidth, window.innerHeight)
          const segmentLine = new Line2(segmentGeometry, segmentMaterial)
          meshLineGroup.add(segmentLine)
        }
      }
    })
  }
  
  // 将合并的线条组添加到 group
  if (meshLineGroup.children.length > 0) {
    group.add(meshLineGroup)
  }
}
  /**
 * 创建几何体
 */
export function createGeometry(pos: any[], color: any, z: number = 0.01) {
	// 平面顶点（x1, y1, x2, y2, ..., xn, yn）
	const flatPoints = pos.map((p: any) => [p.x, p.y]).flat()
	// 三角形索引
	const indices = earcut(flatPoints)
	// 转为 Vector3 顶点数组
	const vertices = pos.map((p: any) => [p.x, p.y, 0]).flat()
	const geometry = new (THREE as any).BufferGeometry()
	geometry.setAttribute('position', new (THREE as any).Float32BufferAttribute(vertices, 3))
	geometry.setIndex(indices)
	geometry.computeVertexNormals()
	geometry.translate(0, z, 0)

	// 颜色处理
	if (color) {
		let vertexColor: any = null
		if (isRGBColor(color)) {
			const { r, g, b } = color
			vertexColor = new (THREE as any).Color(r / 255, g / 255, b / 255)
			vertexColor.convertSRGBToLinear()
		}
		if (isHexColor(color)) {
			vertexColor = new (THREE as any).Color(color)
		}
		if (vertexColor) {
			const colors: number[] = []
			for (let i = 0; i < pos.length; i++) {
				colors.push(vertexColor.r, vertexColor.g, vertexColor.b)
			}
			geometry.setAttribute('color', new (THREE as any).Float32BufferAttribute(colors, 3))
		}
	}

	return geometry
}
/**
 * 合并几何体
 */
export function mergeGeometries(geometryList: any[], opacity: number = 1.0) {
  console.log('mergeGeometries opacity', opacity)
	const attr = opacity != 1 ? { transparent: true, opacity } : {}
	const material = new (THREE as any).MeshBasicMaterial({
		vertexColors: true,
		side: (THREE as any).DoubleSide,
		...attr,
		depthTest: false,
	})

	// 使用 BufferGeometryUtils 合并几何体
	const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometryList)
	const mesh = new (THREE as any).Mesh(mergedGeometry, material)
	mesh.rotation.x = Math.PI / 2 // 将 Mesh 旋转到 x-z 平面
	mesh.renderOrder = 0

	return mesh
}
/**
 * 判断是否为十六进制颜色
 */
export function isHexColor(value: any): boolean {
	return typeof value === 'number' && value >= 0x000000 && value <= 0xffffff
}

/**
 * 判断是否为 RGB 颜色对象
 */
export function isRGBColor(value: any): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		'r' in value &&
		'g' in value &&
		'b' in value &&
		typeof value.r === 'number' &&
		typeof value.g === 'number' &&
		typeof value.b === 'number'
	)
}

export const createModelClone = (model: any, item: any) => {
    const clone = model.clone()
    clone.position.copy(new (THREE as any).Vector3(item.x, item.z || 0.01, -item.y))
    clone.rotation.copy(new (THREE as any).Euler(0, item.hdg, 0, 'XYZ'))
    clone.__attr = item
    return clone
}

