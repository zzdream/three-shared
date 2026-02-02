# @shared/xodr

XODR 数据解析和渲染功能包，用于 Three.js 场景中渲染 OpenDRIVE 格式的道路数据。

## 功能特性

- ✅ **XODR 文件加载** - 支持从 URL 加载 XODR 文件
- ✅ **XODR 数据解析** - 使用 WebAssembly 解析 XODR 数据
- ✅ **路面渲染** - 渲染道路路面几何体
- ✅ **道路边界线渲染** - 渲染道路边界线和标记线
- ✅ **IndexedDB 缓存** - 支持缓存解析后的数据，带过期时间管理
- ✅ **多版本 Three.js 支持** - 支持 Three.js >= 0.157.0

## 安装

```bash
# 在 monorepo 中通过 workspace 引用
# 确保已安装 three 作为 peerDependency
npm install three@^0.157.0  # 或 three@^0.182.0
```

## 使用示例

### 基本使用

```typescript
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { loadWasm } from '@shared/wasm'
import { loadXodr, parseXodrData, renderXodrFaces, renderXodrLines } from '@shared/xodr'
import { calculateViewCenter, setupCameraAndControls } from '@shared/core-engine'

// 1. 加载 WebAssembly 模块（必须先加载）
await loadWasm('/path/to/OdrHandle.js')

// 2. 加载 XODR 文件
const xodrText = await loadXodr({
  url: '/path/to/road.xodr',
  responseType: 'text',
})

// 3. 解析 XODR 数据
const data = await parseXodrData(xodrText as string)

// 4. 创建 Group 用于渲染
const roadGroup = new THREE.Group()
const lineGroup = new THREE.Group()
scene.add(roadGroup)
scene.add(lineGroup)

// 5. 渲染路面
renderXodrFaces(data, roadGroup, {
  opacity: 1.0,
})

// 6. 渲染道路边界线
const { allRoadPoints } = renderXodrLines(data, lineGroup, {
  defaultLineColor: 0xffffff,
})

// 7. 计算视图中心并设置相机位置
if (allRoadPoints.length > 0) {
  const { center, maxSize } = calculateViewCenter(allRoadPoints)
  setupCameraAndControls(center, maxSize, camera, controls)
}
```

### 自定义车道颜色

```typescript
renderXodrFaces(data, roadGroup, {
  opacity: 0.9,
  laneTypeColors: {
    driving: { r: 160, g: 160, b: 160 },
    stop: { r: 106, g: 90, b: 90 },
    shoulder: { r: 154, g: 199, b: 163 },
    biking: { r: 104, g: 200, b: 172 },
    sidewalk: { r: 188, g: 193, b: 203 },
    // ... 更多车道类型
  },
})
```

## API 文档

### loadXodr

加载 XODR 文件。

```typescript
loadXodr(options: {
  url: string
  header?: Record<string, string>
  responseType: 'text' | 'arrayBuffer' | 'blob'
}): Promise<string | Uint8Array | { blob: Blob, objectURL: string }>
```

### parseXodrData

解析 XODR 数据（需要先加载 WebAssembly 模块）。

```typescript
parseXodrData(xodr: string, step?: number): Promise<any[]>
```

**前置条件：** 必须先调用 `loadWasm()` 加载 WebAssembly 模块

### renderXodrFaces

渲染 XODR 面数据（路面）。

```typescript
renderXodrFaces(
  data: any[],
  group: Group,
  options?: {
    opacity?: number
    laneTypeColors?: Record<string, { r: number; g: number; b: number } | number>
  }
): { roadsgeometry: BufferGeometry[] }
```

### renderXodrLines

渲染 XODR 线数据（道路边界线）。

```typescript
renderXodrLines(
  data: any[],
  group: Group,
  options?: {
    defaultLineColor?: number
  }
): { allRoadPoints: Vector3[], linesByColor: Record<string | number, any> }
```

### 缓存功能

提供基于 IndexedDB 的缓存功能，支持过期时间管理。

```typescript
import { cacheXodrData, getCachedXodrData } from '@shared/xodr'

// 缓存数据（24小时后过期）
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  data: parsedData,
  expiresIn: 24 * 60 * 60 * 1000, // 24小时
})

// 读取缓存
const cachedData = await getCachedXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
})
```

**详细文档请参考：[CACHE.md](./CACHE.md)**

## 车道类型颜色映射

默认的车道类型颜色映射：

```typescript
const LANE_TYPE_COLORS = {
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
```

可以通过 `laneTypeColors` 选项自定义颜色。

## 依赖

- `three` (peerDependency) - Three.js 库，版本 >= 0.157.0
- `@shared/core-engine` - Three.js 引擎核心功能
- `earcut` - 用于多边形三角化

## 文档

- **[CACHE.md](./CACHE.md)** - IndexedDB 缓存功能详细文档
- **[CHUNKED_LOADING.md](./CHUNKED_LOADING.md)** - 分块加载功能文档
- **[PERFORMANCE.md](./PERFORMANCE.md)** - 性能优化指南

## 注意事项

1. **WebAssembly 模块**：使用 `parseXodrData` 前必须先调用 `loadWasm()` 加载 WebAssembly 模块
2. **BufferGeometryUtils**：需要从 Three.js 导入 `BufferGeometryUtils`（包内部使用）
3. **Three.js 版本**：支持 Three.js >= 0.157.0，运行时使用使用方项目的 Three.js 版本
4. **缓存功能**：缓存功能基于 IndexedDB，需要浏览器支持。详细使用请参考 [CACHE.md](./CACHE.md)

