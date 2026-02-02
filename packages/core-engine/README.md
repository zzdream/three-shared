# @shared/core-engine

Three.js 引擎核心基础功能封装，支持不同版本的 Three.js。

## 功能特性

- ✅ **场景初始化** (`initScene`)
- ✅ **相机初始化** (`initCamera`)
- ✅ **渲染器初始化** (`initRenderer`)
- ✅ **控制器初始化** (`initControls`)
- ✅ **光照初始化** (`initLight`)
- ✅ **窗口大小监听** (`setupResizeListener`)
- ✅ **动画循环** (`createAnimateLoop`, `animate`)

## 安装

```bash
pnpm add @shared/core-engine
```

## 使用示例

```typescript
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {
  initScene,
  initCamera,
  initRenderer,
  initControls,
  initLight,
  setupResizeListener,
  createAnimateLoop,
} from '@shared/core-engine'

// 1. 初始化场景
const scene = initScene({
  backgroundColor: 0xf7f7f8
})

// 2. 初始化相机
const container = document.getElementById('container')!
const camera = initCamera(container, {
  fov: 55,
  position: [0, 30, 0],
  target: [0, 0, 0]
})

// 3. 初始化渲染器
const renderer = initRenderer(container, {
  antialias: true,
  logarithmicDepthBuffer: true,
  shadowMapEnabled: true
})

// 4. 初始化控制器
const controls = initControls(OrbitControls, camera, renderer, {
  enableRotate: false,
  enableZoom: true
})

// 5. 初始化光照
const light = initLight(scene, {
  ambientIntensity: 3,
  directionalIntensity: 1
})

// 6. 设置窗口大小监听
const cleanupResize = setupResizeListener(container, camera, renderer)

// 7. 创建动画循环
const stopAnimate = createAnimateLoop(scene, camera, renderer, controls, () => {
  // 每帧执行的自定义逻辑
})

// 清理函数
function cleanup() {
  stopAnimate()
  cleanupResize()
}
```

## API 文档

### initScene

初始化 Three.js 场景。

```typescript
function initScene(options?: SceneOptions): Scene
```

**参数：**
- `options.backgroundColor`: 背景色（默认: `0xf7f7f8`）

### initCamera

初始化透视相机。

```typescript
function initCamera(container: HTMLElement, options?: CameraOptions): PerspectiveCamera
```

**参数：**
- `container`: 容器元素
- `options.fov`: 视野角度（默认: `55`）
- `options.near`: 近裁剪面（默认: `0.1`）
- `options.far`: 远裁剪面（默认: `50000`）
- `options.position`: 相机位置（默认: `[0, 30, 0]`）
- `options.target`: 相机朝向目标（默认: `[0, 0, 0]`）

### initRenderer

初始化 WebGL 渲染器。

```typescript
function initRenderer(container: HTMLElement, options?: RendererOptions): WebGLRenderer
```

**参数：**
- `container`: 容器元素
- `options.antialias`: 是否开启抗锯齿（默认: `true`）
- `options.logarithmicDepthBuffer`: 是否使用对数深度缓冲区（默认: `true`）
- `options.shadowMapEnabled`: 是否启用阴影（默认: `true`）

### initControls

初始化 OrbitControls 控制器。

```typescript
function initControls(OrbitControlsClass: any, camera: any, renderer: any, options?: ControlsOptions): OrbitControls
```

**参数：**
- `OrbitControlsClass`: OrbitControls 类
- `camera`: 相机对象
- `renderer`: 渲染器对象
- `options.enableRotate`: 是否启用旋转（默认: `false`）
- `options.enableZoom`: 是否启用缩放（默认: `true`）

### initLight

初始化光照。

```typescript
function initLight(scene: any, options?: LightOptions): DirectionalLight
```

**参数：**
- `scene`: 场景对象
- `options.ambientIntensity`: 环境光强度（默认: `3`）
- `options.directionalIntensity`: 平行光强度（默认: `1`）

### setupResizeListener

设置窗口大小变化监听器。

```typescript
function setupResizeListener(container: HTMLElement, camera: any, renderer: any, wait?: number): () => void
```

**参数：**
- `container`: 容器元素
- `camera`: 相机对象
- `renderer`: 渲染器对象
- `wait`: 防抖延迟时间（毫秒，默认: `200`）

**返回：** 清理函数

### createAnimateLoop

创建动画循环。

```typescript
function createAnimateLoop(scene: any, camera: any, renderer: any, controls?: any, callback?: AnimateCallback): () => void
```

**参数：**
- `scene`: 场景对象
- `camera`: 相机对象
- `renderer`: 渲染器对象
- `controls`: 控制器对象（可选）
- `callback`: 每帧执行的回调函数（可选）

**返回：** 停止动画的函数

### calculateViewCenter

计算视图中心点。

```typescript
function calculateViewCenter(allRoadPoints: Vector3[]): { center: Vector3, maxSize: number, boundingBox: Box3 }
```

**参数：**
- `allRoadPoints`: 所有道路点数组

**返回：**
- `center`: 中心点（Vector3）
- `maxSize`: 最大尺寸
- `boundingBox`: 边界框（Box3）

### setupCameraAndControls

设置相机和控制器位置，自动计算合适的相机距离。

```typescript
function setupCameraAndControls(center: Vector3, maxSize: number, camera: PerspectiveCamera, controls: OrbitControls): void
```

**参数：**
- `center`: 视图中心点（Vector3）
- `maxSize`: 视图最大尺寸
- `camera`: 相机对象
- `controls`: 控制器对象

## 版本兼容性

支持 **Three.js >= 0.157.0**，包括：
- ✅ Three.js r157
- ✅ Three.js r182
- ✅ 其他 >= 0.157.0 的版本

包内部直接引用 `three`，运行时使用使用方项目的 Three.js 版本，因此可以安全地支持多版本。

## 注意事项

1. **必须安装 Three.js**：使用方项目必须安装 `three` 作为依赖
2. **类型定义**：如果遇到类型错误，可以在使用方项目中安装 `@types/three`

