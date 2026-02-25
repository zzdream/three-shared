# @threejs-shared/cache-db

基于 IndexedDB 的缓存库，用于存储 XODR 等数据，支持过期时间（TTL）。

## 安装

```bash
npm install @threejs-shared/cache-db
# 或
pnpm add @threejs-shared/cache-db
```

## 类型定义

### CacheDBConfig

数据库配置。

| 属性 | 类型 | 说明 |
|------|------|------|
| `database` | `string` | 数据库名称 |
| `table` | `string` | 对象存储（表）名称 |
| `version?` | `number` | 数据库版本，可选 |

### CacheXodrDataParams

写入缓存时的参数。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `database` | `string` | 是 | 数据库名称 |
| `table` | `string` | 是 | 对象存储名称 |
| `field` | `string` | 是 | 存储字段/键名 |
| `data` | `any` | 是 | 要缓存的数据（不能为 `undefined` 或 `null`） |
| `expiresIn?` | `number \| Date \| null` | 否 | 过期时间：`number` 为从当前起毫秒数；`Date` 为过期时间点；`null` 表示永不过期（默认） |

### GetCachedXodrDataParams

读取缓存时的参数。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `database` | `string` | 是 | 数据库名称 |
| `table` | `string` | 是 | 对象存储名称 |
| `field` | `string` | 是 | 存储字段/键名 |
| `autoDeleteExpired?` | `boolean` | 否 | 是否在读取到过期数据时自动删除，默认 `true` |

---

## API 函数

### initDB

初始化并打开 IndexedDB。若已打开同库同版本则复用连接。

```ts
initDB(database: string, table: string, version?: number): Promise<IDBDatabase>
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `database` | `string` | - | 数据库名称，非空 |
| `table` | `string` | - | 对象存储名称，非空 |
| `version` | `number` | `1` | 数据库版本，正整数 |

**返回值**：`Promise<IDBDatabase>` 打开的数据库实例。

**异常**：`database`/`table` 为空、`version` 非法、浏览器不支持 IndexedDB、或对象存储不存在时抛出 `Error`。

---

### cacheXodrData

将数据写入缓存，可设置过期时间。

```ts
cacheXodrData(params: CacheXodrDataParams): Promise<void>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `params` | `CacheXodrDataParams` | 见上方类型定义 |

**异常**：参数校验失败或事务失败时抛出。

**示例**：

```ts
import { cacheXodrData } from '@threejs-shared/cache-db'

await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  data: { roads: [] },
  expiresIn: 24 * 60 * 60 * 1000, // 24 小时后过期
})
```

---

### getCachedXodrData

从缓存读取数据。若已过期且 `autoDeleteExpired` 为 `true`，会删除该条并返回 `null`。

```ts
getCachedXodrData(params: GetCachedXodrDataParams): Promise<any | null>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `params` | `GetCachedXodrDataParams` | 见上方类型定义 |

**返回值**：`Promise<any | null>` 缓存的数据，不存在或已过期时为 `null`。出错时返回 `null` 并打日志。

**示例**：

```ts
import { getCachedXodrData } from '@threejs-shared/cache-db'

const data = await getCachedXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  autoDeleteExpired: true,
})
```

---

### deleteCachedXodrData

删除指定键的缓存条目。

```ts
deleteCachedXodrData(params: GetCachedXodrDataParams): Promise<void>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `params` | `GetCachedXodrDataParams` | 至少需 `database`、`table`、`field` |

**异常**：参数非法或事务失败时抛出。

---

### clearCachedXodrData

清空指定数据库下某张表的所有缓存。

```ts
clearCachedXodrData(database: string, table: string): Promise<void>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `database` | `string` | 数据库名称 |
| `table` | `string` | 对象存储名称 |

**异常**：参数非法或事务失败时抛出。

---

### closeDB

关闭指定数据库连接（从内部缓存移除并 `close`）。

```ts
closeDB(database: string, version?: number): void
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `database` | `string` | - | 数据库名称 |
| `version` | `number` | `1` | 数据库版本 |

---

### closeAllDB

关闭当前已缓存的所有数据库连接。

```ts
closeAllDB(): void
```

---

### cleanExpiredData

扫描指定表，删除所有已过期的缓存条目（仅删除带 `expiresAt` 且已过期的包装数据）。

```ts
cleanExpiredData(database: string, table: string): Promise<number>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `database` | `string` | 数据库名称 |
| `table` | `string` | 对象存储名称 |

**返回值**：`Promise<number>` 本次删除的条数。

**异常**：参数非法或事务失败时抛出。

---

### getCacheTTL

获取指定键剩余有效时间（毫秒）。无过期、不存在或已过期时返回 `null`。

```ts
getCacheTTL(params: GetCachedXodrDataParams): Promise<number | null>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `params` | `GetCachedXodrDataParams` | 至少需 `database`、`table`、`field`（`autoDeleteExpired` 不影响 TTL 查询） |

**返回值**：`Promise<number | null>` 剩余毫秒数，或 `null`。

---

## 使用注意

- 仅在浏览器环境使用（依赖 `window.indexedDB`）。
- 首次使用某库/表时需先通过 `initDB` 打开；若在 `onupgradeneeded` 中未创建对象存储，需在升级时创建，否则会报错。
- 存储格式为 `{ data, createdAt, expiresAt }`，业务只应通过本库 API 读写，不要直接操作原始存储结构。
