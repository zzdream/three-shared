/**
 * XODR 数据渲染相关函数
 * 依赖 Three.js 和 earcut
 */
// 使用 any 类型以避免类型检查错误，运行时由使用方项目提供正确的 three 版本
import * as THREE from 'three'
import { createGeometry, mergeGeometries } from '@shared/core-engine'

/**
 * 车道类型颜色映射
 */
const LANE_TYPE_COLORS: Record<string, { r: number; g: number; b: number }> = {
	driving: { r: 160, g: 160, b: 160 },
	stop: { r: 106, g: 90, b: 90 },
	shoulder: { r: 154, g: 199, b: 163 },
	biking: { r: 104, g: 200, b: 172 },
	sidewalk: { r: 188, g: 193, b: 203 },
	border: { r: 70, g: 82, b: 122 },
	restricted: { r: 133, g: 152, b: 103 },
	parking: { r: 96, g: 145, b: 212 },
	bidirectional: { r: 160, g: 160, b: 160 },
	median: { r: 133, g: 152, b: 103 },
	entry: { r: 224, g: 192, b: 195 },
	exit: { r: 165, g: 175, b: 194 },
	offRamp: { r: 165, g: 175, b: 194 },
	onRamp: { r: 224, g: 192, b: 195 },
	curb: { r: 149, g: 149, b: 149 },
	connectingRamp: { r: 2, g: 167, b: 240 },
	emergency: { r: 184, g: 122, b: 125 },
	none: { r: 190, g: 147, b: 120 },
}

/**
 * 处理面数据（路面几何体）
 */
export function processFaceData(data: any[], defaultColor?: any) {
	const roadsgeometry: any[] = []

	data.forEach((item: any) => {
		if (item.laneSection) {
			item.laneSection.forEach((laneSection: any) => {
				laneSection.lane.forEach((lane: any) => {
					if (+lane.id === 0) return

					const pos = lane.XYList.map((xy: any) => {
						const [x, y] = xy.split(' ').map(Number)
						return new (THREE as any).Vector3(x, -y)
					})

					// 根据车道类型获取颜色
					const color = defaultColor || LANE_TYPE_COLORS[lane.type]

					roadsgeometry.push(createGeometry(pos, color))
				})
			})
		}
	})

	return { roadsgeometry }
}

/**
 * 处理线数据（道路边界线）
 */
export function processLineData(data: any[], defaultLineColor: number = 0xffffff) {
	const linesByColor: Record<string | number, any> = {}
	const allRoadPoints: any[] = []

	data.forEach((item: any) => {
		if (!item.laneSection) return

		item.laneSection.forEach((itm: any) => {
			itm.lane.forEach((it: any) => {
				let pos: any[] = []

				it.borderXYList.forEach((ii: any) => {
					pos = []

					ii.forEach((i: any) => {
						allRoadPoints.push(new (THREE as any).Vector3(i.x, 0.001, -i.y))

						if (i.type === 1) {
							pos.push(new (THREE as any).Vector3(i.x, 0.001, -i.y))

							if (ii.length === pos.length) {
								addLine(pos, i.color === 'standard' ? defaultLineColor : i.color, linesByColor)
								pos = []
							} else {
								if (i === ii[ii.length - 1]) {
									pos.push(new (THREE as any).Vector3(i.x, 0.001, -i.y))
									addLine(pos, i.color === 'standard' ? defaultLineColor : i.color, linesByColor)
									pos = []
								}
							}
						} else {
							if (pos.length > 1) {
								pos.push(new (THREE as any).Vector3(i.x, 0.001, -i.y))
								addLine(pos, i.color === 'standard' ? defaultLineColor : i.color, linesByColor)
								pos = []
							}
						}
					})
				})
			})
		})
	})

	return { allRoadPoints, linesByColor }
}

/**
 * 添加线段
 */
function addLine(pos: any[], color: any, linesByColor: Record<string | number, any>) {
	if (!linesByColor[color]) {
		linesByColor[color] = {
			positions: [],
			material: new (THREE as any).LineBasicMaterial({ color, linewidth: 1 }),
			geometry: new (THREE as any).BufferGeometry(),
		}
	}

	pos.forEach((point: any, index: number) => {
		if (index < pos.length - 1) {
			linesByColor[color].positions.push(
				point.x,
				point.y,
				point.z,
				pos[index + 1].x,
				pos[index + 1].y,
				pos[index + 1].z
			)
		}
	})
}

/**
 * 创建线组（LineSegments）
 */
export function createLineSegments(group: any, linesByColor: Record<string | number, any>) {
	for (const color in linesByColor) {
		const lineInfo = linesByColor[color]
		lineInfo.geometry.setAttribute('position', new (THREE as any).Float32BufferAttribute(lineInfo.positions, 3))
		const lineSegments = new (THREE as any).LineSegments(lineInfo.geometry, lineInfo.material)
		group.add(lineSegments)
	}
}

/**
 * 渲染 XODR 面数据（路面）
 * @param data XODR 解析后的数据
 * @param group 要添加到的 Three.js Group
 * @param options 配置选项
 * @param options.opacity 透明度，默认为 1.0
 * @param options.laneTypeColors 车道类型颜色映射，由业务项目提供
 * @returns 返回处理后的几何体列表
 */
export function renderXodrFaces(
	data: any[],
	group: any,
	options: {
		opacity?: number
		laneTypeColors?: Record<string, { r: number; g: number; b: number } | number>
	} = {}
) {
	if(!data || !group) {
		console.error('renderXodrFaces: data or group is required')
		return
	}
	const { opacity = 1.0, laneTypeColors } = options
	const { roadsgeometry } = processFaceData(data, laneTypeColors)

	if (roadsgeometry && roadsgeometry.length > 0) {
		const mergedMesh = mergeGeometries(roadsgeometry, opacity)
		group.add(mergedMesh)
	}

	return { roadsgeometry }
}

/**
 * 渲染 XODR 线数据（道路边界线）
 * @param data XODR 解析后的数据
 * @param group 要添加到的 Three.js Group
 * @param options 配置选项
 * @param options.defaultLineColor 默认线条颜色，由业务项目提供，默认为 0xffffff
 * @returns 返回所有道路点数组（用于计算相机位置）
 */
export function renderXodrLines(
	data: any[],
	group: any,
	options: {
		defaultLineColor?: number
	} = {}
) {
	if(!data || !group) {
		console.error('renderXodrLines: data or group is required')
		return
	}
	const { defaultLineColor = 0xffffff } = options
	const { allRoadPoints, linesByColor } = processLineData(data, defaultLineColor)

	if (linesByColor && Object.keys(linesByColor).length > 0) {
		createLineSegments(group, linesByColor)
	}

	return { allRoadPoints, linesByColor }
}

