# Three.js 适配器（adapters）

为不同版本的 Three.js 提供 HDR/RGBE 环境贴图加载器适配，供 `@threejs-shared/core-engine` 的 `GroundGrip` 等使用。

## 包列表

| 包名 | 说明 | peerDependencies |
|------|------|------------------|
| `@threejs-shared/three-adapter-157` | Three.js r157，使用 RGBELoader | `three@0.157.x` |
| `@threejs-shared/three-adapter-182` | Three.js r182，使用 HDRLoader | `three@0.182.x` |

## 安装

按项目使用的 Three 版本二选一：

```bash
# Three.js 0.157.x
pnpm add @threejs-shared/three-adapter-157 three@0.157.x

# Three.js 0.182.x
pnpm add @threejs-shared/three-adapter-182 three@0.182.x
```

## 类型（来自 core-engine）

适配器需实现 `HDREnvironmentLoaderAdapter`：

```ts
interface HDREnvironmentLoaderAdapter {
  createLoader(manager?: any): any  // 返回 HDRLoader / RGBELoader 等实例
  version: string                   // 如 'r157' / 'r182'
}
```

---

## @threejs-shared/three-adapter-157

### 导出

**默认导出**：`hdrEnvironmentLoaderAdapter`

**具名导出**：`hdrEnvironmentLoaderAdapter`

### hdrEnvironmentLoaderAdapter

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `version` | `string` | `'r157'` |
| `createLoader(manager?)` | `(manager?: any) => any` | 返回 `RGBELoader` 实例，用于加载 HDR/RGBE 环境贴图 |

**示例**：

```ts
import hdrEnvironmentLoaderAdapter from '@threejs-shared/three-adapter-157'
import { GroundGrip } from '@threejs-shared/core-engine'

const groundGrip = new GroundGrip({
  boundingBox,
  hdrLoaderAdapter: hdrEnvironmentLoaderAdapter,
})
// 之后在 createSky / addSky 时会用该 loader 加载 HDR
```

---

## @threejs-shared/three-adapter-182

### 导出

**默认导出**：`hdrEnvironmentLoaderAdapter`

**具名导出**：`hdrEnvironmentLoaderAdapter`

### hdrEnvironmentLoaderAdapter

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `version` | `string` | `'r182'` |
| `createLoader(manager?)` | `(manager?: any) => any` | 返回 `HDRLoader` 实例（r182 推荐），用于加载 HDR 环境贴图 |

**示例**：

```ts
import hdrEnvironmentLoaderAdapter from '@threejs-shared/three-adapter-182'
import { GroundGrip } from '@threejs-shared/core-engine'

const groundGrip = new GroundGrip({
  boundingBox,
  hdrLoaderAdapter: hdrEnvironmentLoaderAdapter,
})
```

---

## 与 core-engine 配合

- `GroundGrip` 的 `createSky` / `addSky` 需要 HDR 加载器。若不传 `hdrLoaderAdapter`，core-engine 会通过 `autoDetectHDREnvironmentLoaderAdapter()` 尝试自动检测（当前实现为回退到 RGBELoader）。
- 在明确使用 r157 或 r182 时，建议直接传入对应 adapter，避免自动检测与版本不一致。
