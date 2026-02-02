# IndexedDB 缓存功能文档

`cacheDB.ts` 提供了基于 IndexedDB 的缓存功能，用于缓存 XODR 解析后的数据，支持过期时间（TTL）管理。

## 功能特性

- ✅ **IndexedDB 存储** - 使用浏览器原生 IndexedDB 存储缓存数据
- ✅ **过期时间管理** - 支持设置缓存过期时间，自动清理过期数据
- ✅ **向后兼容** - 兼容旧版本未包装的缓存数据格式
- ✅ **连接管理** - 自动管理数据库连接，避免重复打开
- ✅ **错误处理** - 完善的错误处理和事务管理
- ✅ **类型安全** - 完整的 TypeScript 类型定义

## 快速开始

### 基本使用

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

if (cachedData) {
  // 使用缓存数据
  console.log('使用缓存数据')
} else {
  // 缓存不存在或已过期，需要重新加载
  console.log('缓存未命中，重新加载数据')
}
```

## API 文档

### cacheXodrData

缓存 XODR 数据到 IndexedDB。

```typescript
cacheXodrData(params: CacheXodrDataParams): Promise<void>
```

#### 参数

```typescript
interface CacheXodrDataParams {
  database: string      // 数据库名称
  table: string        // 表（objectStore）名称
  field: string        // 字段名（作为 key）
  data: any            // 要缓存的数据
  expiresIn?: number | Date | null  // 过期时间（可选）
}
```

#### expiresIn 参数说明

- **`number`** - 毫秒数，表示从当前时间开始多少毫秒后过期
  ```typescript
  expiresIn: 3600000  // 1小时后过期
  expiresIn: 24 * 60 * 60 * 1000  // 24小时后过期
  expiresIn: 7 * 24 * 60 * 60 * 1000  // 7天后过期
  ```

- **`Date`** - 具体的过期时间点
  ```typescript
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  expiresIn: tomorrow  // 明天过期
  ```

- **`null` 或 `undefined`** - 永不过期（默认）
  ```typescript
  expiresIn: null  // 或省略此参数
  ```

#### 示例

```typescript
// 示例1: 缓存数据，1小时后过期
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  data: parsedData,
  expiresIn: 60 * 60 * 1000, // 1小时
})

// 示例2: 缓存数据，指定过期时间点
const expireDate = new Date('2024-12-31')
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  data: parsedData,
  expiresIn: expireDate,
})

// 示例3: 永久缓存（不设置过期时间）
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  data: parsedData,
  // expiresIn 不传或传 null
})
```

### getCachedXodrData

从 IndexedDB 读取缓存的 XODR 数据。

```typescript
getCachedXodrData(params: GetCachedXodrDataParams): Promise<any | null>
```

#### 参数

```typescript
interface GetCachedXodrDataParams {
  database: string              // 数据库名称
  table: string                // 表名称
  field: string                // 字段名（作为 key）
  autoDeleteExpired?: boolean   // 是否自动删除过期数据，默认为 true
}
```

#### 返回值

- **`any`** - 如果缓存存在且未过期，返回缓存的数据
- **`null`** - 如果缓存不存在、已过期或读取失败

#### 行为说明

1. **自动过期检查**：读取时会自动检查数据是否过期
2. **自动删除过期数据**：如果 `autoDeleteExpired` 为 `true`（默认），过期数据会被自动删除
3. **向后兼容**：如果读取到旧格式数据（没有时间戳包装），会直接返回原始数据

#### 示例

```typescript
// 示例1: 读取缓存（自动删除过期数据）
const data = await getCachedXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  autoDeleteExpired: true, // 默认值
})

if (data) {
  console.log('缓存命中，使用缓存数据')
} else {
  console.log('缓存未命中，需要重新加载')
}

// 示例2: 读取缓存（不删除过期数据）
const data = await getCachedXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  autoDeleteExpired: false, // 过期数据不会被删除
})
```

### deleteCachedXodrData

删除指定的缓存数据。

```typescript
deleteCachedXodrData(params: GetCachedXodrDataParams): Promise<void>
```

#### 参数

与 `getCachedXodrData` 相同。

#### 示例

```typescript
await deleteCachedXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
})
```

### clearCachedXodrData

清空指定表的所有缓存数据。

```typescript
clearCachedXodrData(database: string, table: string): Promise<void>
```

#### 示例

```typescript
await clearCachedXodrData('xodrCache', 'xodrData')
```

### cleanExpiredData

清理指定表中的所有过期数据。

```typescript
cleanExpiredData(database: string, table: string): Promise<number>
```

#### 返回值

返回清理的数据条数。

#### 示例

```typescript
// 清理所有过期数据
const deletedCount = await cleanExpiredData('xodrCache', 'xodrData')
console.log(`清理了 ${deletedCount} 条过期数据`)

// 可以定期执行清理任务
setInterval(async () => {
  const count = await cleanExpiredData('xodrCache', 'xodrData')
  if (count > 0) {
    console.log(`定期清理: 删除了 ${count} 条过期数据`)
  }
}, 60 * 60 * 1000) // 每小时清理一次
```

### getCacheTTL

获取缓存数据的剩余有效时间。

```typescript
getCacheTTL(params: GetCachedXodrDataParams): Promise<number | null>
```

#### 返回值

- **`number`** - 剩余有效时间（毫秒）
- **`null`** - 如果数据不存在、已过期或永不过期

#### 示例

```typescript
const ttl = await getCacheTTL({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
})

if (ttl === null) {
  console.log('缓存不存在、已过期或永不过期')
} else {
  const hours = Math.floor(ttl / (60 * 60 * 1000))
  const minutes = Math.floor((ttl % (60 * 60 * 1000)) / (60 * 1000))
  console.log(`缓存剩余有效时间: ${hours}小时 ${minutes}分钟`)
}
```

### closeDB

关闭指定的数据库连接。

```typescript
closeDB(database: string, version?: number): void
```

#### 示例

```typescript
closeDB('xodrCache', 1)
```

### closeAllDB

关闭所有数据库连接。

```typescript
closeAllDB(): void
```

#### 示例

```typescript
// 在应用退出时关闭所有连接
onBeforeUnmount(() => {
  closeAllDB()
})
```

## 完整使用示例

### 示例1: 带缓存的 XODR 加载流程

```typescript
import { loadXodrChunked, parseXodrData, cacheXodrData, getCachedXodrData } from '@shared/xodr'

const CACHE_CONFIG = {
  database: 'xodrCache',
  table: 'xodrData',
  field: '56m.xodr',
}

async function loadXodrWithCache() {
  // 1. 尝试从缓存读取
  const cachedData = await getCachedXodrData({
    ...CACHE_CONFIG,
    autoDeleteExpired: true,
  })

  if (cachedData) {
    console.log('✅ 使用缓存数据')
    return cachedData
  }

  // 2. 缓存未命中，重新加载
  console.log('⏳ 缓存未命中，开始加载...')
  
  const mapData = await loadXodrChunked({
    url: '/path/to/56m.xodr',
    chunkSize: 5 * 1024 * 1024,
    concurrency: 3,
    onProgress: (loaded, total) => {
      const percent = ((loaded / total) * 100).toFixed(1)
      console.log(`加载进度: ${percent}%`)
    },
  })

  // 3. 解析数据
  const data = await parseXodrData(mapData, 4)

  // 4. 缓存数据（24小时后过期）
  await cacheXodrData({
    ...CACHE_CONFIG,
    data,
    expiresIn: 24 * 60 * 60 * 1000, // 24小时
  })

  console.log('✅ 数据已缓存')
  return data
}
```

### 示例2: 使用不同过期策略

```typescript
// 策略1: 小文件永久缓存
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'small-road.xodr',
  data: smallData,
  // 不设置 expiresIn，永久缓存
})

// 策略2: 大文件短期缓存（1小时）
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'large-road.xodr',
  data: largeData,
  expiresIn: 60 * 60 * 1000, // 1小时
})

// 策略3: 临时文件（5分钟）
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'temp-road.xodr',
  data: tempData,
  expiresIn: 5 * 60 * 1000, // 5分钟
})
```

### 示例3: 缓存管理和监控

```typescript
import { getCacheTTL, cleanExpiredData } from '@shared/xodr'

// 检查缓存状态
async function checkCacheStatus(field: string) {
  const ttl = await getCacheTTL({
    database: 'xodrCache',
    table: 'xodrData',
    field,
  })

  if (ttl === null) {
    console.log(`缓存 ${field}: 不存在或已过期`)
  } else {
    const hours = (ttl / (60 * 60 * 1000)).toFixed(1)
    console.log(`缓存 ${field}: 剩余 ${hours} 小时`)
  }
}

// 定期清理过期数据
function setupCacheCleanup() {
  // 每小时清理一次
  setInterval(async () => {
    try {
      const count = await cleanExpiredData('xodrCache', 'xodrData')
      if (count > 0) {
        console.log(`清理了 ${count} 条过期缓存`)
      }
    } catch (error) {
      console.error('清理缓存失败:', error)
    }
  }, 60 * 60 * 1000)
}

// 应用启动时执行
setupCacheCleanup()
```

## 时间常量参考

为了方便使用，这里提供一些常用的时间常量：

```typescript
// 时间常量（毫秒）
const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000, // 约30天
}

// 使用示例
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  data: parsedData,
  expiresIn: TIME_CONSTANTS.DAY, // 1天
})
```

## 注意事项

### 1. 浏览器兼容性

IndexedDB 在现代浏览器中都有良好支持，但需要注意：
- IE 10+ 支持
- Safari 8+ 支持
- Chrome、Firefox、Edge 完全支持

### 2. 存储限制

- IndexedDB 的存储限制因浏览器而异，通常为：
  - Chrome: 可用磁盘空间的 60%
  - Firefox: 可用磁盘空间的 50%
  - Safari: 1GB（移动端可能更少）

### 3. 数据格式兼容性

- 新版本的数据会被包装成 `{ data, createdAt, expiresAt }` 格式
- 旧版本未包装的数据仍然可以正常读取（向后兼容）
- 建议统一使用新格式以获得过期时间支持

### 4. 错误处理

所有函数都包含完善的错误处理：
- 参数验证错误会抛出异常
- IndexedDB 操作错误会被捕获并记录
- `getCachedXodrData` 在错误时返回 `null`（保持向后兼容）

### 5. 性能考虑

- 数据库连接会被缓存，避免重复打开
- 读取操作使用 `readonly` 事务（如果不需要删除过期数据）
- 写入操作使用 `readwrite` 事务
- 批量清理过期数据时，会先收集所有过期 key，然后批量删除

### 6. 最佳实践

1. **合理设置过期时间**
   - 小文件可以永久缓存
   - 大文件设置较短的过期时间（如 1-24 小时）
   - 临时数据设置很短的过期时间（如 5-15 分钟）

2. **定期清理过期数据**
   - 使用 `cleanExpiredData` 定期清理
   - 避免缓存无限增长

3. **错误处理**
   - 始终处理可能的错误
   - 缓存失败不应该影响主流程

4. **监控缓存状态**
   - 使用 `getCacheTTL` 监控缓存状态
   - 记录缓存命中率

## 类型定义

```typescript
// 缓存数据参数接口
export interface CacheXodrDataParams {
  database: string
  table: string
  field: string
  data: any
  expiresIn?: number | Date | null
}

// 读取缓存参数接口
export interface GetCachedXodrDataParams {
  database: string
  table: string
  field: string
  autoDeleteExpired?: boolean
}

// 数据库配置接口
export interface CacheDBConfig {
  database: string
  table: string
  version?: number
}
```

## 常见问题

### Q: 如何判断缓存是否命中？

A: `getCachedXodrData` 返回 `null` 表示缓存未命中（不存在或已过期），返回数据表示缓存命中。

### Q: 过期数据会自动删除吗？

A: 默认情况下，`getCachedXodrData` 会自动删除过期数据（`autoDeleteExpired: true`）。如果设置为 `false`，过期数据不会被删除，但读取时会返回 `null`。

### Q: 如何批量清理过期数据？

A: 使用 `cleanExpiredData` 函数可以清理指定表中的所有过期数据。

### Q: 缓存的数据格式是什么？

A: 新版本的数据会被包装成：
```typescript
{
  data: any,           // 实际数据
  createdAt: number,    // 创建时间戳（毫秒）
  expiresAt: number | null  // 过期时间戳（毫秒），null 表示永不过期
}
```

### Q: 旧版本的缓存数据还能用吗？

A: 可以，代码会自动检测数据格式。如果是旧格式（没有包装），会直接返回原始数据，保持向后兼容。

### Q: 如何设置永久缓存？

A: 不传 `expiresIn` 参数，或传 `null`：
```typescript
await cacheXodrData({
  database: 'xodrCache',
  table: 'xodrData',
  field: 'road.xodr',
  data: parsedData,
  // expiresIn 不传或传 null
})
```

## 更新日志

### v1.0.0
- ✅ 初始版本
- ✅ 支持基本的缓存读写操作
- ✅ 支持过期时间管理
- ✅ 支持自动清理过期数据
- ✅ 向后兼容旧数据格式
- ✅ 完善的错误处理和类型定义

