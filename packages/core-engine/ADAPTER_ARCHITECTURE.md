# HDR/RGBE Loader 适配器架构设计

## 设计目标

支持不同版本的 Three.js loader，解决 `RGBELoader` 在 r182+ 中被 `HDRLoader` 替代的问题。

## 架构设计

### 1. 核心组件

```
@shared/core-engine
├── src/
│   ├── types/
│   │   └── adapter.ts          # 适配器接口定义
│   ├── utils/
│   │   └── adapterDetector.ts   # 自动检测适配器
│   └── GroundGrip.ts            # 支持适配器注入
└── ADAPTER_USAGE.md             # 使用文档

@shared/adapters/
├── three-157/
│   └── index.ts                 # r157 适配器（RGBELoader）
└── three-182/
    └── index.ts                 # r182 适配器（HDRLoader）
```

### 2. 接口设计

```typescript
interface HDREnvironmentLoaderAdapter {
  createLoader(manager?: LoadingManager): HDRLoader | RGBELoader
  version: string
}
```

### 3. 工作流程

```
用户代码
  ↓
GroundGrip 构造函数
  ↓
有适配器？ → 是 → 使用注入的适配器
  ↓ 否
自动检测适配器
  ↓
尝试 HDRLoader (r182+)
  ↓ 失败
回退到 RGBELoader (r157)
  ↓
创建 loader 实例
  ↓
加载 HDR 环境贴图
```

## 设计优势

### ✅ 职责分离
- **适配器**: 负责版本特定的 loader 创建
- **核心逻辑**: `GroundGrip` 专注于业务逻辑
- **自动检测**: 提供向后兼容的默认行为

### ✅ 类型安全
- 每个适配器都有明确的类型定义
- TypeScript 可以正确推断类型
- 编译时检查，减少运行时错误

### ✅ 可扩展性
- 添加新版本适配器只需实现接口
- 无需修改核心代码
- 支持自定义适配器

### ✅ 向后兼容
- 支持旧的 API: `new GroundGrip(box, true, 50)`
- 支持新的 API: `new GroundGrip(box, { adapter, ... })`
- 自动检测机制确保零配置使用

### ✅ 可测试性
- 适配器可以轻松 mock
- 核心逻辑与版本解耦
- 单元测试更简单

## 使用场景对比

### 场景一：明确指定版本（推荐）

```typescript
// r182 项目
import { hdrEnvironmentLoaderAdapter } from '@shared/three-adapter-182'
const grip = new GroundGrip(box, { hdrLoaderAdapter: hdrEnvironmentLoaderAdapter })
```

**优点**: 
- 类型安全
- 明确版本依赖
- 编译时检查

### 场景二：自动检测（向后兼容）

```typescript
// 不指定适配器，自动检测
const grip = new GroundGrip(box)
```

**优点**:
- 零配置
- 向后兼容
- 适合快速原型

**缺点**:
- 运行时检测，可能有性能开销
- 类型信息较少

## 实现细节

### 适配器实现

**three-157/index.ts**
```typescript
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
export const hdrEnvironmentLoaderAdapter = {
  createLoader(manager) { return new RGBELoader(manager) },
  version: 'r157'
}
```

**three-182/index.ts**
```typescript
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
export const hdrEnvironmentLoaderAdapter = {
  createLoader(manager) { return new HDRLoader(manager) },
  version: 'r182'
}
```

### 自动检测实现

```typescript
export async function autoDetectHDREnvironmentLoaderAdapter() {
  // 1. 尝试 HDRLoader (r182+)
  try {
    const hdrModule = await import('three/examples/jsm/loaders/HDRLoader.js')
    if (hdrModule.HDRLoader) {
      return { createLoader: (m) => new hdrModule.HDRLoader(m), version: 'auto-r182' }
    }
  } catch {}
  
  // 2. 回退到 RGBELoader (r157)
  try {
    const rgbeModule = await import('three/examples/jsm/loaders/RGBELoader.js')
    if (rgbeModule.RGBELoader) {
      return { createLoader: (m) => new rgbeModule.RGBELoader(m), version: 'auto-r157' }
    }
  } catch {}
  
  throw new Error('No compatible loader found')
}
```

## 未来扩展

### 支持更多版本
只需添加新的适配器包：
```
@shared/adapters/
├── three-157/
├── three-182/
└── three-200/  # 未来版本
```

### 支持其他 Loader
可以扩展适配器接口支持其他类型的 loader：
```typescript
interface LoaderAdapter {
  hdrEnvironment?: HDREnvironmentLoaderAdapter
  texture?: TextureLoaderAdapter
  // ...
}
```

## 总结

这个架构设计：
- ✅ 解决了版本兼容性问题
- ✅ 保持了代码的清晰和可维护性
- ✅ 提供了灵活的扩展机制
- ✅ 确保了向后兼容性
- ✅ 提升了类型安全性

