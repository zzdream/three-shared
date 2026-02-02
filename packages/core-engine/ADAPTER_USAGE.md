# HDR/RGBE Loader 适配器使用指南

## 概述

`GroundGrip` 类支持通过适配器模式来处理不同版本的 Three.js loader 差异：
- **r157**: 使用 `RGBELoader`
- **r182+**: 使用 `HDRLoader` (RGBELoader 的替代品)

## 使用方式

### 方式一：使用适配器包（推荐）

#### 对于 Three.js r182 项目

```typescript
import { GroundGrip } from '@shared/core-engine'
import { hdrEnvironmentLoaderAdapter } from '@shared/three-adapter-182'

const boundingBox = { min: { x: 0, y: 0, z: 0 }, max: { x: 100, y: 100, z: 100 } }
const groundGrip = new GroundGrip(boundingBox, {
  hdrLoaderAdapter: hdrEnvironmentLoaderAdapter,
  isUseCache: true,
  scaleFactor: 50
})
```

#### 对于 Three.js r157 项目

```typescript
import { GroundGrip } from '@shared/core-engine'
import { hdrEnvironmentLoaderAdapter } from '@shared/three-adapter-157'

const boundingBox = { min: { x: 0, y: 0, z: 0 }, max: { x: 100, y: 100, z: 100 } }
const groundGrip = new GroundGrip(boundingBox, {
  hdrLoaderAdapter: hdrEnvironmentLoaderAdapter,
  isUseCache: true,
  scaleFactor: 50
})
```

### 方式二：自动检测（向后兼容）

如果不提供适配器，系统会自动检测可用的 loader：

```typescript
import { GroundGrip } from '@shared/core-engine'

const boundingBox = { min: { x: 0, y: 0, z: 0 }, max: { x: 100, y: 100, z: 100 } }
// 自动检测并使用合适的 loader
const groundGrip = new GroundGrip(boundingBox, {
  isUseCache: true,
  scaleFactor: 50
})
```

### 方式三：兼容旧 API

旧的 API 仍然支持：

```typescript
// 旧 API: constructor(boundingBox, isUseCache, scaleFactor)
const groundGrip = new GroundGrip(boundingBox, true, 50)
```

## 适配器接口

```typescript
interface HDREnvironmentLoaderAdapter {
  createLoader(manager?: LoadingManager): HDRLoader | RGBELoader
  version: string
}
```

## 创建自定义适配器

如果需要支持其他版本或自定义 loader，可以实现自己的适配器：

```typescript
import type { HDREnvironmentLoaderAdapter } from '@shared/core-engine'
import { CustomLoader } from 'your-custom-loader'

const customAdapter: HDREnvironmentLoaderAdapter = {
  createLoader(manager?: any) {
    return new CustomLoader(manager)
  },
  version: 'custom'
}

const groundGrip = new GroundGrip(boundingBox, {
  hdrLoaderAdapter: customAdapter
})
```

## 优势

1. **类型安全**: 每个适配器都有明确的类型定义
2. **职责分离**: 版本特定的代码在适配器中，核心逻辑保持干净
3. **可测试**: 可以轻松 mock 适配器进行测试
4. **向后兼容**: 支持自动检测，无需修改现有代码
5. **灵活扩展**: 可以轻松添加新版本的适配器

