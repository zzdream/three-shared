# @threejs-shared/wasm

OpenDRIVE (XODR) 的 WebAssembly 桥接：加载 WASM 脚本、将 XODR 内容注入模块并获取道路/信号/对象/隧道等数据。依赖业务提供的 `window.Module`（由 WASM 脚本注入）。

## 安装

```bash
pnpm add @threejs-shared/wasm
```

本包无 peer 依赖，但运行时需先通过 `loadWasm(url)` 加载业务提供的 WASM 脚本，该脚本会挂载 `window.Module`（含 `cwrap`、`_malloc`、`_free`、`lengthBytesUTF8`、`stringToUTF8`、`onRuntimeInitialized` 等）。

---

## 一、loadWasm（loadWasm.ts）

### loadWasm

动态插入 script 加载 WASM 库，并在 `Module.onRuntimeInitialized` 完成时 resolve。

```ts
loadWasm(url: string): Promise<void>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | WASM 库的 JS 入口 URL（如 `/wasm/OdrHandle.js`） |

**返回值**：`Promise<void>`，在 `window.Module.onRuntimeInitialized` 被调用后 resolve；若脚本已存在相同 id 则不再插入，仅等待初始化。

**说明**：会覆盖 `window.Module.onRuntimeInitialized`，在回调中先执行原有回调（若有），再 `resolve(window.Module)`。业务需保证 `window.Module` 在脚本加载后存在。

---

### loadScript

向页面插入指定 id 的 script，避免重复插入。

```ts
loadScript(src: string, id: string): Promise<HTMLScriptElement | void>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `src` | `string` | 脚本 URL |
| `id` | `string` | 脚本元素 id，已存在则直接 resolve |

**返回值**：加载完成后 resolve 该 script 元素；若已存在 id 则 resolve undefined。

**异常**：加载失败时 reject。

---

## 二、wasmTool（wasmTool.ts）

以下函数均依赖已初始化的 `window.Module`（即先调用 `loadWasm`）。内部通过 `Module.cwrap` 调用 C/WASM 导出。

### loadOpenDRIVEContent

将 XODR 字符串写入 WASM 堆并调用底层 `loadOpenDRIVEContent`，供后续 `getRoadData` 等使用。

```ts
loadOpenDRIVEContent(xodr: string): void
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `xodr` | `string` | 完整 XODR 文件内容 |

**说明**：内部会 `_malloc`、`stringToUTF8`、调用 cwrap 封装的 `loadOpenDRIVEContent`、再 `_free`。必须先调用此函数再调用 `getRoadData` 等。

---

### getRoadData

在已调用 `loadOpenDRIVEContent` 的前提下，按步长逐条获取道路数据，直到底层返回空。

```ts
getRoadData(step?: number): Promise<any[]>
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `step` | `number` | `1` | 步长，传给底层 `getSingleRoadData(step)` |

**返回值**：解析后的道路数据数组，每条为 `getSingleRoadData` 返回的 JSON 解析结果。控制台会输出 `data` 和 `'getSingleRoadData'`。

---

### getXodrSignalsInfo

获取信号信息列表。

```ts
getXodrSignalsInfo(): Promise<any[]>
```

**返回值**：底层 `getSignalsInfo()` 返回的 JSON 解析数组，无数据时为空数组 `[]`。

---

### drawXodrObjects

获取对象信息列表（用于绘制或业务逻辑）。

```ts
drawXodrObjects(): Promise<any[]>
```

**返回值**：底层 `getObjectsInfo()` 返回的 JSON 解析数组，无数据时为空数组 `[]`。

---

### getBridgesDrawInfo

获取桥梁绘制信息（内部调用 `getBridgesDrawInfo(1)`）。当前实现仅 `console.log` 解析结果，未 return。

```ts
getBridgesDrawInfo(): Promise<any>
```

**返回值**：无有效返回；若结果为 `null` 或包含 `'null'` 字符串则返回 `null`，否则仅打印。

---

### getTunnelsDrawInfo

获取隧道绘制信息。

```ts
getTunnelsDrawInfo(step?: number): Promise<any>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `step` | `number` | 传给底层 `getTunnelsDrawInfo(step)` |

**返回值**：底层返回的 JSON 解析结果；若为空或包含 `'null'` 则返回 `null`，否则返回解析后的列表（或单值）。

---

## 导出汇总

- **函数**：`loadWasm`, `loadOpenDRIVEContent`, `getRoadData`, `getXodrSignalsInfo`, `drawXodrObjects`, `getTunnelsDrawInfo`  
- `getBridgesDrawInfo` 在源码中存在，但未在 `index.ts` 中导出，若需使用需在业务侧从 `wasmTool` 自行引用或在本包 `index` 中补充导出。

---

## 使用顺序建议

1. 使用 `loadWasm(basePath + '/wasm/OdrHandle.js')` 加载并等待初始化。
2. 获取 XODR 字符串（例如通过 `@threejs-shared/xodr` 的 `loadXodr`/`loadXodrChunked`）。
3. 调用 `loadOpenDRIVEContent(xodrString)`。
4. 再调用 `getRoadData(step)`、`getXodrSignalsInfo()`、`drawXodrObjects()`、`getTunnelsDrawInfo(step)` 等获取数据。
