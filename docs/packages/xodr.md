# @threejs-shared/xodr

XODR（OpenDRIVE）解析与渲染：加载/分块加载 XODR、解析道路、渲染路面与标线、绘制对象与信号、隧道与桥梁、地图初始化器（含地面/天空与可见性控制）。依赖 `@threejs-shared/cache-db`、`@threejs-shared/core-engine`、`@threejs-shared/wasm`。

## 安装

```bash
pnpm add @threejs-shared/xodr @threejs-shared/cache-db @threejs-shared/core-engine @threejs-shared/wasm three
```

**peerDependencies**：`three >= 0.157.0`

---

## 一、加载与解析

### LoadXodrOptions

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | `string` | 是 | 请求 URL |
| `header?` | `Record<string, string>` | 否 | 请求头 |
| `responseType` | `'text' \| 'arrayBuffer' \| 'blob'` | 是 | 响应类型 |
| `useStreaming?` | `boolean` | 否 | 是否流式读取，默认 `true` |
| `onProgress?` | `(loaded: number, total?: number) => void` | 否 | 进度回调 |

### loadXodr

根据配置拉取 XODR（或二进制）并返回文本/ArrayBuffer/Blob。

```ts
loadXodr(options: LoadXodrOptions): Promise<string | Uint8Array | { blob: Blob; objectURL: string }>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `options` | `LoadXodrOptions` | 见上 |

**返回值**：  
- `responseType: 'text'` → `string`（流式或一次性）  
- `responseType: 'arrayBuffer'` → `Uint8Array`  
- `responseType: 'blob'` → `{ blob, objectURL }`

**异常**：请求失败或类型不支持时抛出。

---

### parseXodrData

将 XODR 字符串送入 WASM（loadOpenDRIVEContent）并按步长获取道路数据。

```ts
parseXodrData(xodr: string, step?: number): Promise<any[]>
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `xodr` | `string` | - | XODR 文件内容 |
| `step` | `number` | `1` | 解析步长 |

**返回值**：道路数据数组（来自 `@threejs-shared/wasm` 的 `getRoadData(step)`）。  
**前置**：需已调用 `loadWasm` 并完成初始化。

---

### LoadXodrChunkedOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | - | 文件 URL |
| `header?` | `Record<string, string>` | - | 请求头 |
| `chunkSize?` | `number` | 5MB | 每块字节数 |
| `concurrency?` | `number` | 3 | 并发块数 |
| `useCache?` | `boolean` | false | 是否使用缓存（当前实现未用） |
| `onProgress?` | `(loaded: number, total: number) => void` | - | 进度回调 |

### loadXodrChunked

分块 Range 请求大文件，合并为完整字符串；若 Range 失败则降级为流式 `loadXodr`。

```ts
loadXodrChunked(options: LoadXodrChunkedOptions): Promise<string>
```

**返回值**：完整 XODR 字符串。  
**异常**：HEAD 失败、块下载失败等会抛出；降级时使用 `loadXodr` 的异常行为。

---

## 二、渲染（renderXodr）

### processFaceData

将道路数据转为路面几何体数组（按车道类型上色）。

```ts
processFaceData(data: any[], defaultColor?: any): { roadsgeometry: any[] }
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | `any[]` | parseXodrData 返回的数据 |
| `defaultColor?` | `any` | 默认颜色（车道类型颜色表外的兜底） |

**返回值**：`{ roadsgeometry }`，元素为 BufferGeometry。

---

### processLineData

从道路数据提取边界线按颜色分组，并收集所有道路点。

```ts
processLineData(data: any[], defaultLineColor?: number): { allRoadPoints: any[]; linesByColor: Record<string|number, any> }
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `any[]` | - | 道路数据 |
| `defaultLineColor` | `number` | `0xffffff` | 默认线条颜色 |

**返回值**：`allRoadPoints` 可用于相机包围盒；`linesByColor` 为按颜色分的几何/材质集合。

---

### createLineSegments

根据 `linesByColor` 创建 LineSegments 并加入 group。

```ts
createLineSegments(group: any, linesByColor: Record<string | number, any>): void
```

---

### renderXodrFaces

渲染路面并加入 group。

```ts
renderXodrFaces(
  data: any[],
  group: any,
  options?: { opacity?: number; laneTypeColors?: Record<string, { r,g,b } | number> }
): { roadsgeometry?: any[] }
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | `any[]` | 道路数据 |
| `group` | `any` | 目标 Group |
| `options.opacity` | `number` | 默认 1.0 |
| `options.laneTypeColors` | `Record<...>` | 车道类型颜色覆盖 |

缺少 `data` 或 `group` 时只打日志并 return。

---

### renderXodrLines

渲染道路边界线并加入 group。

```ts
renderXodrLines(
  data: any[],
  group: any,
  options?: { defaultLineColor?: number }
): { allRoadPoints: any[]; linesByColor: Record<...> }
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | `any[]` | 道路数据 |
| `group` | `any` | 目标 Group |
| `options.defaultLineColor` | `number` | 默认 0xffffff |

缺少 `data` 或 `group` 时只打日志并 return。

---

## 三、对象与信号（drawXdorInfo）

### drawObjects

根据 WASM 对象信息和 `MODAL_TO_URL` 映射，绘制人行横道、网状线、停车位、图片/模型等，支持 FBX/GLB 缓存。

```ts
drawObjects(
  MODAL_TO_URL: any,
  cache: { useCache: boolean; database: string; table: string }
): Promise<{ objectGroup?: any; objectModel?: any } | void>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `MODAL_TO_URL` | `any` | 对象类型名到资源 URL 的映射 |
| `cache` | `{ useCache, database, table }` | IndexedDB 缓存配置 |

**返回值**：无对象时 return；有则 `{ objectGroup, objectModel }`。  
**依赖**：需已 `loadOpenDRIVEContent`，通常由 `parseXodrData` 或等效流程保证。

---

### drawSignals

根据 WASM 信号信息和 `MODAL_TO_URL` 绘制交通灯、标志等，支持多状态资源。

```ts
drawSignals(
  MODAL_TO_URL: any,
  isLoadStatuslight?: { isLoad: boolean; states: string[] },
  cache?: { useCache: boolean; database: string; table: string }
): Promise<{ signalGroup?: any; signalModel?: any } | void>
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `MODAL_TO_URL` | `any` | - | 信号/状态名到 URL 的映射 |
| `isLoadStatuslight` | `{ isLoad, states }` | `{ isLoad: true, states: ['_0','_1','_2'] }` | 是否加载状态灯及状态后缀 |
| `cache` | `{ useCache, database, table }` | - | 缓存配置 |

**返回值**：无信号时 return；有则 `{ signalGroup, signalModel }`。

---

## 四、隧道与桥梁（Tunnel）

### drawBridgesOrTunnel

根据轮廓点绘制桥梁/隧道平面（createGeometry + mergeGeometries）并加入 group。

```ts
drawBridgesOrTunnel(
  pointsData: any[],
  color: number,
  group: { add: (arg0: any) => void },
  opacity?: number
): void
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pointsData` | `any[]` | - | 轮廓点，含 x,y |
| `color` | `number` | - | 颜色 |
| `group` | `{ add }` | - | 目标 Group |
| `opacity` | `number` | 0.3 | 透明度 |

---

### drawTunnels

从 WASM 获取隧道信息，绘制轮廓或沿轮廓放置隧道模型。

```ts
drawTunnels(
  Tunnel: any,
  step?: number,
  color?: number,
  opacity?: number
): Promise<any>
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `Tunnel` | `any` | - | 隧道模型 URL 或 null；null 只画轮廓，非 null 用模型沿轮廓实例化 |
| `step` | `number` | 2 | 传给 getTunnelsDrawInfo |
| `color` | `number` | 0x00ffff | 轮廓颜色 |
| `opacity` | `number` | 0.3 | 透明度 |

**返回值**：隧道 Group 或 null。

---

### drawBridges

从 WASM 获取桥梁信息并绘制轮廓（不支持模型）。

```ts
drawBridges(color?: number, opacity?: number): Promise<any>
```

| 参数 | 类型 | 默认值 |
|------|------|--------|
| `color` | `number` | 0xffffff |
| `opacity` | `number` | 0.3 |

**返回值**：桥梁 Group。**依赖**：`window.Module.cwrap('getBridgesDrawInfo', 'string', 'number')`。

---

## 五、缓存再导出

xodr 包从 `@threejs-shared/cache-db` 重新导出以下 API，便于统一从 xodr 使用：

- 函数：`cacheXodrData`, `getCachedXodrData`, `deleteCachedXodrData`, `clearCachedXodrData`, `closeDB`, `closeAllDB`, `cleanExpiredData`, `getCacheTTL`
- 类型：`CacheDBConfig`, `CacheXodrDataParams`, `GetCachedXodrDataParams`

用法与参数见 [cache-db 文档](./cache-db.md)。

---

## 六、XodrMapInitializer

一键完成：加载 WASM → 分块/加载 XODR → 解析 → 渲染路面与线 → 设置相机 → 地面/天空 → 对象/信号/隧道/桥梁，并支持按相机高度控制组可见性。

### XodrMapInitializerOptions

| 属性 | 类型 | 说明 |
|------|------|------|
| `basePath?` | `string` | 资源基础路径 |
| `wasmPath?` | `string` | WASM 脚本相对 basePath，默认 `/wasm/OdrHandle.js` |
| `modalToUrl?` | `Record<string, string>` | 对象/信号名到 URL 的映射 |
| `cache?` | `{ enabled?, database?, table?, field?, expiresIn?, autoDeleteExpired? }` | 缓存配置 |
| `parseXodr?` | `{ path?, step?, chunked?: { chunkSize?, concurrency? } }` | XODR 路径、步长、分块参数 |
| `roadLine?` | `{ color? }` | 道路线默认颜色 |
| `signal?` | `{ states? }` | 信号状态列表 |
| `tunnel?` | `{ path?, color?, opacity?, step? }` | 隧道模型与绘制参数 |
| `bridge?` | `{ color?, opacity? }` | 桥梁绘制参数 |
| `ground?` | `{ groundPath?, scaleFactor? }` | 地面贴图路径与缩放 |
| `sky?` | `{ skyPath?, hdrLoaderAdapter? }` | 天空 HDR 与 loader 适配器 |
| `onProgress?` | `(loaded: number, total: number) => void` | 加载进度 |
| `visibilityControl?` | `{ enabled?, heightThreshold?, visibilityChecker?, throttleMs?, groups? }` | 可见性控制 |

### XodrMapInitializerResult

| 属性 | 类型 | 说明 |
|------|------|------|
| `graphPathGroup` | `any` | 路面组 |
| `lanePathGroup` | `any` | 路线组 |
| `objectGroup` | `any` | 对象组 |
| `signalGroup` | `any` | 信号组 |
| `ground` | `any \| null` | 地面 Mesh 或 null |
| `sky` | `any \| null` | 天空 Mesh 或 null |
| `boundingBox` | `any` | 包围盒 |

### 构造函数

```ts
constructor(engine: ThreeEngine, options: XodrMapInitializerOptions)
```

---

### initialize

执行完整初始化流程；若传 `xodrPath` 会覆盖配置中的路径并更新缓存 field。

```ts
initialize(xodrPath?: string): Promise<XodrMapInitializerResult>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `xodrPath` | `string` | 可选，覆盖 parseXodr.path |

**流程概要**：清空旧组 → loadWasm → 创建 graphPathGroup/lanePathGroup → loadXodrChunked + parseXodrData → 可选缓存 → renderXodrFaces/renderXodrLines 或 processLineData → setCameraAndControls → createGroundAndSky → loadSignalsAndObjects（含 drawSignals、drawObjects、drawTunnels、drawBridges）→ 若启用可见性则立即更新一次。

**异常**：道路点为空时抛出。

---

### reloadXodr

更换 XODR 路径并重新执行加载与渲染（会清空地面/天空并重建）。

```ts
reloadXodr(xodrPath: string): Promise<XodrMapInitializerResult>
```

---

### enableVisibilityControl

启用根据相机高度控制路线/对象/信号组可见性；可传入与 `visibilityControl` 相同的配置片段。

```ts
enableVisibilityControl(config?: {
  heightThreshold?: number;
  visibilityChecker?: (cameraHeight: number) => boolean;
  throttleMs?: number;
  groups?: { lanePathGroup?: boolean; objectGroup?: boolean; signalGroup?: boolean };
}): void
```

---

### disableVisibilityControl

关闭可见性自动控制。

```ts
disableVisibilityControl(): void
```

---

### getVisibilityUpdateCallback

返回节流后的可见性更新函数，供在动画循环中调用；未启用时返回 null。

```ts
getVisibilityUpdateCallback(): (() => void) | null
```

---

## 导出汇总

- **加载/解析**：`loadXodr`, `parseXodrData`, `loadXodrChunked`  
- **类型**：`LoadXodrOptions`, `LoadXodrChunkedOptions`  
- **渲染**：`renderXodrFaces`, `renderXodrLines`, `processFaceData`, `processLineData`, `createLineSegments`  
- **绘制**：`drawObjects`, `drawSignals`, `drawTunnels`, `drawBridges`  
- **缓存**：见“五、缓存再导出”  
- **初始化器**：`XodrMapInitializer`，类型 `XodrMapInitializerOptions`, `XodrMapInitializerResult`
