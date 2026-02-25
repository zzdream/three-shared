# three-shared Packages 文档总览

本仓库 `packages/` 下为可发布到 npm 的公共库，用于 Three.js 场景下的 XODR 地图、仿真回放、缓存与引擎封装等。本文档汇总各包功能与文档链接，每个包的**函数说明、参数、返回值与用法**见对应子文档。

---

## Playground（示例应用）

**[playground](./playground/)** 为本仓库的示例应用，用于演示各包在 Vue 3 + Vite + Three.js 下的集成方式（XODR 加载与渲染、仿真回放、引擎与 HDR 环境等）。运行方式与渲染效果见 [playground/README.md](./playground/README.md)。

---

## 包列表与文档

| 包名 | 说明 | 文档 |
|------|------|------|
| **@threejs-shared/cache-db** | IndexedDB 缓存（XODR 等），支持 TTL | [cache-db.md](./docs/packages/cache-db.md) |
| **@threejs-shared/three-adapter-157** | Three.js r157 的 HDR/RGBE Loader 适配 | [adapters.md](./docs/packages/adapters.md) |
| **@threejs-shared/three-adapter-182** | Three.js r182 的 HDR Loader 适配 | [adapters.md](./docs/packages/adapters.md) |
| **@threejs-shared/core-engine** | 引擎核心：场景/相机/渲染器/控制器/光照/模型/地面天空 | [core-engine.md](./docs/packages/core-engine.md) |
| **@threejs-shared/protobuf** | Proto 加载、WebSocket 收发、回放定时器 | [protobuf.md](./docs/packages/protobuf.md) |
| **@threejs-shared/wasm** | OpenDRIVE WASM 桥接：加载 WASM、注入 XODR、获取道路/信号/对象/隧道 | [wasm.md](./docs/packages/wasm.md) |
| **@threejs-shared/xodr** | XODR 加载/解析/渲染、对象与信号绘制、地图初始化器 | [xodr.md](./docs/packages/xodr.md) |

---

## 依赖关系（简要）

```
cache-db          （无包内依赖）
wasm              （无包内依赖）
core-engine       → cache-db
protobuf          → xodr（Playback 用 loadXodr）
xodr              → cache-db, core-engine, wasm
three-adapter-157 → core-engine
three-adapter-182 → core-engine
```

使用 **xodr** 或 **core-engine** 时需在业务项目安装 **three**（>= 0.157.0）；使用 **protobuf** 时需 **protobufjs**（^7.0.0）。

---

## 各包功能速览

- **cache-db**：`initDB`、`cacheXodrData`、`getCachedXodrData`、`deleteCachedXodrData`、`clearCachedXodrData`、`closeDB`、`closeAllDB`、`cleanExpiredData`、`getCacheTTL`；类型见文档。
- **adapters**：提供 `hdrEnvironmentLoaderAdapter`（r157 用 RGBELoader，r182 用 HDRLoader），供 `GroundGrip` 加载天空 HDR。
- **core-engine**：`ThreeEngine`、相机/控制器工具、几何与标线工具、FBX/GLB 加载（含缓存）、`GroundGrip`、HDR 适配器检测等。
- **protobuf**：`ProtoBufManager`、`WebSocketManager`、`ProtobufWebSocketClient`、`ProtobufPlaybackClient`、`TimerManager`；类型与回调见文档。
- **wasm**：`loadWasm`、`loadScript`、`loadOpenDRIVEContent`、`getRoadData`、`getXodrSignalsInfo`、`drawXodrObjects`、`getTunnelsDrawInfo`。
- **xodr**：`loadXodr`、`loadXodrChunked`、`parseXodrData`、`renderXodrFaces`、`renderXodrLines`、`drawObjects`、`drawSignals`、`drawTunnels`、`drawBridges`、缓存 API 再导出、`XodrMapInitializer`。

---

## 文档阅读说明

- 每个子文档（如 `cache-db.md`）内按**类型**与**API**组织，函数/方法均包含：
  - **签名**（含泛型）
  - **参数表**（名称、类型、是否必填、默认值、说明）
  - **返回值**与**异常**（若有）
  - **示例**（部分 API）
- 若某函数在源码中未从包入口导出，文档中会注明“未在 index 导出”或“需从子路径引用”。

---

## 发布

包发布流程见 [PUBLISH.md](./docs/PUBLISH.md)。
