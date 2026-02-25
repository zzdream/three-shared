# @threejs-shared/core-engine

Three.js 引擎核心：不绑定具体 Three 版本，统一管理场景、相机、渲染器、控制器、光照、模型加载与 XODR 地面/天空等。

## 安装

```bash
pnpm add @threejs-shared/core-engine three
```

**peerDependencies**：`three >= 0.157.0`

---

## 一、ThreeEngine 与 EngineOptions

### EngineOptions

| 属性 | 类型 | 说明 |
|------|------|------|
| `scene?` | `SceneOptions` | 场景配置 |
| `camera?` | `CameraOptions` | 相机配置 |
| `renderer?` | `RendererOptions` | 渲染器配置 |
| `controls?` | `ControlsOptions` | 轨道控制器配置 |
| `light?` | `LightOptions` | 光照配置 |
| `animate?` | `{ callback?: AnimateCallback; autoStart?: boolean }` | 每帧回调；是否自动启动动画循环，默认 `false` |
| `resize?` | `{ enabled?: boolean; wait?: number }` | 是否监听窗口 resize；防抖延迟（ms），默认 200 |

### SceneOptions

| 属性 | 类型 | 默认值 |
|------|------|--------|
| `backgroundColor?` | `number \| string` | `0xf7f7f8` |

### CameraOptions

| 属性 | 类型 | 默认值 |
|------|------|--------|
| `fov?` | `number` | `55` |
| `near?` | `number` | `0.1` |
| `far?` | `number` | `500000` |
| `position?` | `{ x, y, z } \| [x, y, z]` | `(0, 30, 0)` |
| `target?` | `{ x, y, z } \| [x, y, z]` | `(0, 0, 0)` |

### RendererOptions

| 属性 | 类型 | 默认值 |
|------|------|--------|
| `antialias?` | `boolean` | `true` |
| `logarithmicDepthBuffer?` | `boolean` | `true` |
| `preserveDrawingBuffer?` | `boolean` | `true` |
| `powerPreference?` | `'default' \| 'high-performance' \| 'low-power'` | `'high-performance'`（Mac 上不传） |
| `shadowMapEnabled?` | `boolean` | `true` |

### ControlsOptions

| 属性 | 类型 | 默认值 |
|------|------|--------|
| `enableDamping?` | `boolean` | `true` |
| `dampingFactor?` | `number` | `0.05` |
| `screenSpacePanning?` | `boolean` | `false` |
| `minDistance?` | `number` | `0.5` |
| `maxDistance?` | `number` | `50000` |
| `maxPolarAngle?` | `number` | `Math.PI / 2` |
| `enableRotate?` | `boolean` | `false` |
| `enableZoom?` | `boolean` | `true` |
| `enablePan?` | `boolean` | `true` |

### LightOptions

| 属性 | 类型 | 默认值 |
|------|------|--------|
| `ambientColor?` | `number \| string` | `0xffffff` |
| `ambientIntensity?` | `number` | `3` |
| `directionalColor?` | `number \| string` | `0xffffff` |
| `directionalIntensity?` | `number` | `1` |
| `directionalPosition?` | `[number, number, number]` | `[1, 1, 1]` |

### AnimateCallback

```ts
type AnimateCallback = () => void
```

---

### ThreeEngine 类

#### 构造函数

```ts
constructor(container: HTMLElement, options?: EngineOptions)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `container` | `HTMLElement` | 挂载 canvas 的容器 |
| `options` | `EngineOptions` | 可选，见上 |

#### 只读属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `scene` | `any` | 场景 |
| `camera` | `any` | 相机 |
| `renderer` | `any` | 渲染器 |
| `controls` | `any` | OrbitControls |
| `light` | `any` | 平行光 |

#### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `start()` | `(): void` | 启动动画循环；已运行会告警 |
| `stop()` | `(): void` | 停止动画循环 |
| `setAnimateCallback(callback)` | `(callback: AnimateCallback): void` | 设置每帧回调 |
| `calculateViewCenter(allRoadPoints)` | `(allRoadPoints: any[]): { center, maxSize, boundingBox }` | 根据道路点计算视图中心、最大尺寸、包围盒 |
| `setCameraAndControls(allRoadPoints)` | `(allRoadPoints: any[]): { boundingBox }` | 根据道路点设置相机与控制器，返回包围盒 |
| `dispose()` | `(): void` | 停止动画、移除 resize 监听、销毁 controls/renderer、移除 DOM |
| `isAnimating` | `get`: `boolean` | 动画是否在运行 |

---

## 二、相机与控制器工具（cameraUtils）

### calculateViewCenter

根据道路点数组计算包围盒、中心和最大尺寸。

```ts
calculateViewCenter(allRoadPoints: any[]): { center: any; maxSize: number; boundingBox: any }
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `allRoadPoints` | `any[]` | 点数组（如 Vector3），非空 |

**异常**：空数组时抛出。

---

### setupCameraAndControls

根据中心与最大尺寸设置相机位置和控制器 target。

```ts
setupCameraAndControls(center: any, maxSize: number, camera: any, controls: any): void
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `center` | `any` | 视图中心（如 Vector3） |
| `maxSize` | `number` | 最大尺寸 |
| `camera` | `any` | 透视相机 |
| `controls` | `any` | OrbitControls |

**异常**：`camera` 或 `controls` 未提供时抛出。

---

### setCenterAndCamera

便捷函数：从道路点计算中心并设置相机与控制器。

```ts
setCenterAndCamera({ allRoadPoints, camera, controls }): { boundingBox }
```

| 参数属性 | 类型 | 说明 |
|----------|------|------|
| `allRoadPoints` | `any[]` | 道路点数组 |
| `camera` | `any` | 相机 |
| `controls` | `any` | 控制器 |

**返回值**：`{ boundingBox }`。

**异常**：缺少任一参数时抛出。

---

## 三、Three.js 工具（threejsUtils）

### createGroup

创建空的 `THREE.Group`。

```ts
createGroup(): any
```

---

### dreawPaking

绘制停车位线条（BufferGeometry + LineBasicMaterial）。

```ts
dreawPaking(points: any[], color: any, group: any): void
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `points` | `any[]` | 顶点数组，形如 `[x1,y1,z1, x2,y2,z2, ...]` |
| `color` | `any` | 颜色，默认 `0xffffff` |
| `group` | `any` | 要添加到的 Group |

---

### createTexture

根据图片 URL 和尺寸/位置创建带贴图的平面 Mesh。

```ts
createTexture(img: any, item: { width: any; length: any; x: any; y: number; hdg: number }): any
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `img` | `any` | 图片 URL |
| `item.width` | `any` | 平面宽 |
| `item.length` | `any` | 平面长 |
| `item.x` | `any` | 位置 x |
| `item.y` | `number` | 位置 y（会取反到 z） |
| `item.hdg` | `number` | 朝向（弧度） |

**返回值**：`THREE.Mesh`（PlaneGeometry + MeshBasicMaterial）。

---

### CrosswalkLineRoadMark

根据顶点数据绘制人行横道线段并加入 group。

```ts
CrosswalkLineRoadMark(item: { vertexs: any[] }, group: { add: (arg0: any) => void }): void
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `item.vertexs` | `any[]` | 顶点数组，每项为点数组 |
| `group` | `{ add }` | 目标 Group |

---

### MeshLineRoadMark

绘制网状标线：轮廓线 + 多段线段（Line2）。

```ts
MeshLineRoadMark(item: {
  outline: any[];
  outlineWidth: number;
  vertexs: any[];
  vertexsWidth: number;
}, group: { add: (arg0: any) => void }): void
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `item.outline` | `any[]` | 轮廓点，含 `x,y` |
| `item.outlineWidth` | `number` | 轮廓线宽 |
| `item.vertexs` | `any[]` | 多段线段顶点 |
| `item.vertexsWidth` | `number` | 线段宽度 |
| `group` | `{ add }` | 目标 Group |

---

### mergeGeometries

合并多个几何体为一个 Mesh（顶点色、双面、可选透明度）。

```ts
mergeGeometries(geometryList: any[], opacity?: number): any
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `geometryList` | `any[]` | - | BufferGeometry 数组 |
| `opacity` | `number` | `1.0` | 透明度 |

**返回值**：合并后的 Mesh（已旋转到 x-z 平面，renderOrder=0）。

---

### createGeometry

从平面顶点和颜色创建带三角剖分的 BufferGeometry（含顶点色）。

```ts
createGeometry(pos: any[], color: any, z?: number): any
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pos` | `any[]` | - | 平面顶点，每项含 `x, y` |
| `color` | `any` | - | 十六进制或 `{ r, g, b }` |
| `z` | `number` | `0.01` | 底面 z 偏移 |

**返回值**：`THREE.BufferGeometry`。

---

### isHexColor

判断是否为十六进制颜色数。

```ts
isHexColor(value: any): boolean
```

---

### isRGBColor

判断是否为 `{ r, g, b }` 对象。

```ts
isRGBColor(value: any): boolean
```

---

### createModelClone

克隆模型并设置位置、旋转，附带 `__attr`。

```ts
createModelClone(model: any, item: any): any
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `model` | `any` | 源模型 |
| `item` | `any` | 含 `x, y, z?, hdg` |

**返回值**：克隆的模型，`position`、`rotation` 已设置，`__attr = item`。

---

## 四、模型加载（loadModal）

### createModalFBX

从 URL 加载 FBX 模型（无缓存）。

```ts
createModalFBX(blobUrl: string): Promise<any>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `blobUrl` | `string` | 模型 URL（可为 blob URL） |

**返回值**：Promise 解析为模型对象；若有动画会播放第一条。

---

### createCacheModalFBX

带 IndexedDB 缓存的 FBX 加载：先读缓存，无则 fetch 后写入缓存再加载。

```ts
createCacheModalFBX(url: string, cache: { useCache: boolean; database: string; table: string }): Promise<any>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | 模型 URL |
| `cache.useCache` | `boolean` | 是否用缓存 |
| `cache.database` | `string` | 缓存数据库名 |
| `cache.table` | `string` | 缓存表名 |

缓存过期：24 小时（86400000 ms）。

---

### createModalGLB

从 URL 加载 GLB 模型（无缓存，使用 DRACOLoader）。

```ts
createModalGLB(blobUrl: string): Promise<any>
```

**返回值**：Promise 解析为 `gltf.scene`；若有动画会播放全部。

---

### createCacheModalGLB

带缓存的 GLB 加载，参数同 `createCacheModalFBX`，过期 24 小时。

```ts
createCacheModalGLB(url: string, cache: { useCache: boolean; database: string; table: string }): Promise<any>
```

---

## 五、GroundGrip（地面与天空）

### GroundGripOptions

| 属性 | 类型 | 说明 |
|------|------|------|
| `boundingBox` | `any` | 包围盒（THREE.Box3） |
| `scaleFactor?` | `number` | 地面纹理缩放因子，默认 `50` |
| `hdrLoaderAdapter?` | `HDREnvironmentLoaderAdapter \| null` | HDR 加载器适配器，不传则自动检测 |

### GroundGrip 类

#### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `createGround(url)` | `(url: any): any` | 创建地面 Mesh（PlaneGeometry + 贴图），接收阴影，renderOrder=-1 |
| `createSky({ url, isUseCache, database, table })` | `(opts): Promise<any>` | 创建天空球（HDR 贴图），可选缓存；返回 Mesh |
| `addGroud({ url })` | `(opts): any` | 创建并保存地面，返回 roadMesh |
| `addSky({ url, isUseCache, database, table })` | `(opts): Promise<any>` | 创建并保存天空，返回 skyTexture Mesh |

---

## 六、适配器检测（utils/adapterDetector）

### autoDetectHDREnvironmentLoaderAdapter

自动检测可用的 HDR/RGBE Loader 适配器（当前实现为使用 RGBELoader）。

```ts
autoDetectHDREnvironmentLoaderAdapter(): Promise<HDREnvironmentLoaderAdapter>
```

**返回值**：实现 `HDREnvironmentLoaderAdapter` 的对象。

**异常**：若 HDRLoader 与 RGBELoader 均不可用则抛出。

---

## 七、类型导出

- `SceneOptions`, `CameraOptions`, `RendererOptions`, `ControlsOptions`, `LightOptions`, `AnimateCallback`（见上）
- `HDREnvironmentLoaderAdapter`：`{ createLoader(manager?), version }`

---

## 子路径导出

- `@threejs-shared/core-engine/adapter-hdr`：可选 HDR 适配相关（若存在）。
