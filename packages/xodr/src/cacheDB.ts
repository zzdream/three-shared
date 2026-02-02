// IndexedDB 类型定义（使用标准类型，无需自定义）

// 缓存数据包装结构（用于存储过期时间）
interface CachedDataWrapper {
  data: any
  createdAt: number // 创建时间戳（毫秒）
  expiresAt: number | null // 过期时间戳（毫秒），null 表示永不过期
}

// 数据库配置接口
export interface CacheDBConfig {
  database: string
  table: string
  version?: number
}

// 缓存数据参数接口
export interface CacheXodrDataParams {
  database: string
  table: string
  field: string
  data: any
  /**
   * 过期时间，支持以下格式：
   * - number: 毫秒数，表示从当前时间开始多少毫秒后过期
   * - Date: 具体的过期时间点
   * - null: 永不过期（默认）
   */
  expiresIn?: number | Date | null
}

// 读取缓存参数接口
export interface GetCachedXodrDataParams {
  database: string
  table: string
  field: string
  /**
   * 是否自动删除过期数据，默认为 true
   */
  autoDeleteExpired?: boolean
}

// 数据库实例缓存，避免重复打开
const dbCache = new Map<string, IDBDatabase>()

/**
 * 初始化 IndexedDB
 * @param database 数据库名称
 * @param table 表（objectStore）名称
 * @param version 数据库版本号，默认为 1
 * @returns Promise<IDBDatabase>
 */
export const initDB = (
  database: string,
  table: string,
  version: number = 1
): Promise<IDBDatabase> => {
  // 参数验证
  if (!database || typeof database !== 'string') {
    return Promise.reject(new Error('Database name must be a non-empty string'))
  }
  if (!table || typeof table !== 'string') {
    return Promise.reject(new Error('Table name must be a non-empty string'))
  }
  if (version < 1 || !Number.isInteger(version)) {
    return Promise.reject(new Error('Version must be a positive integer'))
  }

  // 检查浏览器支持
  if (!window.indexedDB) {
    return Promise.reject(
      new Error('IndexedDB is not supported in this browser')
    )
  }

  const cacheKey = `${database}_${version}`
  
  // 如果数据库已经打开，直接返回缓存的实例
  if (dbCache.has(cacheKey)) {
    const cachedDb = dbCache.get(cacheKey)!
    // 检查数据库是否仍然有效（没有被关闭）
    if (cachedDb.objectStoreNames.length >= 0) {
      return Promise.resolve(cachedDb)
    } else {
      // 如果无效，从缓存中移除
      dbCache.delete(cacheKey)
    }
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database, version)

    request.onerror = () => {
      const error = request.error || new Error('Failed to open database')
      console.error('IndexedDB open error:', error)
      reject(error)
    }

    request.onsuccess = () => {
      const db = request.result
      
      // 监听数据库关闭事件，从缓存中移除
      db.onclose = () => {
        dbCache.delete(cacheKey)
      }

      // 监听数据库错误事件
      db.onerror = (event) => {
        console.error('Database error:', event)
      }

      // 验证表是否存在
      if (!db.objectStoreNames.contains(table)) {
        db.close()
        dbCache.delete(cacheKey)
        reject(
          new Error(
            `Object store "${table}" does not exist in database "${database}"`
          )
        )
        return
      }

      dbCache.set(cacheKey, db)
      resolve(db)
    }

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result

      // 如果表不存在，创建它
      if (!db.objectStoreNames.contains(table)) {
        try {
          db.createObjectStore(table)
        } catch (error) {
          console.error('Error creating object store:', error)
          reject(error)
        }
      }
    }

    request.onblocked = () => {
      console.warn(
        'Database upgrade blocked. Please close other tabs/windows using this database.'
      )
    }
  })
}

/**
 * 计算过期时间戳
 * @param expiresIn 过期时间配置
 * @returns 过期时间戳（毫秒），null 表示永不过期
 */
const calculateExpiresAt = (expiresIn?: number | Date | null): number | null => {
  if (expiresIn === null || expiresIn === undefined) {
    return null // 永不过期
  }

  if (expiresIn instanceof Date) {
    return expiresIn.getTime()
  }

  if (typeof expiresIn === 'number') {
    if (expiresIn <= 0) {
      throw new Error('ExpiresIn must be a positive number')
    }
    return Date.now() + expiresIn
  }

  throw new Error('Invalid expiresIn format. Expected number, Date, or null')
}

/**
 * 检查数据是否过期
 * @param wrapper 缓存数据包装
 * @returns true 如果已过期，false 如果未过期或永不过期
 */
const isExpired = (wrapper: CachedDataWrapper | null): boolean => {
  if (!wrapper) {
    return true
  }

  if (wrapper.expiresAt === null) {
    return false // 永不过期
  }

  return Date.now() > wrapper.expiresAt
}

/**
 * 缓存 XODR 数据到 IndexedDB
 * @param params 缓存参数
 * @returns Promise<void>
 */
export const cacheXodrData = async (
  params: CacheXodrDataParams
): Promise<void> => {
  const { database, table, field, data, expiresIn } = params

  // 参数验证
  if (!database || typeof database !== 'string') {
    throw new Error('Database name must be a non-empty string')
  }
  if (!table || typeof table !== 'string') {
    throw new Error('Table name must be a non-empty string')
  }
  if (!field || typeof field !== 'string') {
    throw new Error('Field name must be a non-empty string')
  }
  if (data === undefined || data === null) {
    throw new Error('Data cannot be undefined or null')
  }

  try {
    // 计算过期时间
    const expiresAt = calculateExpiresAt(expiresIn)
    
    // 包装数据，包含时间戳信息
    const wrapper: CachedDataWrapper = {
      data,
      createdAt: Date.now(),
      expiresAt,
    }

    const db = await initDB(database, table)
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(table, 'readwrite')
      const store = transaction.objectStore(table)

      // 处理事务错误
      transaction.onerror = () => {
        const error = transaction.error || new Error('Transaction failed')
        console.error('Transaction error:', error)
        reject(error)
      }

      transaction.onabort = () => {
        reject(new Error('Transaction aborted'))
      }

      // 执行 put 操作
      const request = store.put(wrapper, field)

      request.onerror = () => {
        const error = request.error || new Error('Put operation failed')
        console.error('Put error:', error)
        reject(error)
      }

      request.onsuccess = () => {
        // 等待事务完成
        transaction.oncomplete = () => {
          resolve()
        }
      }
    })
  } catch (error) {
    console.error('Error caching data:', error)
    throw error
  }
}

/**
 * 从 IndexedDB 读取缓存的 XODR 数据
 * @param params 读取参数
 * @returns Promise<any | null> 返回缓存的数据，如果不存在或已过期则返回 null
 */
export const getCachedXodrData = async (
  params: GetCachedXodrDataParams
): Promise<any | null> => {
  const { database, table, field, autoDeleteExpired = true } = params

  // 参数验证
  if (!database || typeof database !== 'string') {
    throw new Error('Database name must be a non-empty string')
  }
  if (!table || typeof table !== 'string') {
    throw new Error('Table name must be a non-empty string')
  }
  if (!field || typeof field !== 'string') {
    throw new Error('Field name must be a non-empty string')
  }

  try {
    const db = await initDB(database, table)

    // 根据是否需要删除过期数据来决定事务模式
    const transactionMode = autoDeleteExpired ? 'readwrite' : 'readonly'

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(table, transactionMode)
      const store = transaction.objectStore(table)

      // 处理事务错误
      transaction.onerror = () => {
        const error = transaction.error || new Error('Transaction failed')
        console.error('Transaction error:', error)
        reject(error)
      }

      transaction.onabort = () => {
        reject(new Error('Transaction aborted'))
      }

      const request = store.get(field)

      request.onerror = () => {
        const error = request.error || new Error('Get operation failed')
        console.error('Get error:', error)
        reject(error)
      }

      request.onsuccess = () => {
        const result = request.result

        // 如果数据不存在
        if (result === undefined) {
          resolve(null)
          return
        }

        // 兼容旧数据格式（没有包装的数据）
        // 如果数据不是包装格式，直接返回（向后兼容）
        if (
          typeof result !== 'object' ||
          result === null ||
          !('data' in result) ||
          !('createdAt' in result) ||
          !('expiresAt' in result)
        ) {
          resolve(result)
          return
        }

        const wrapper = result as CachedDataWrapper

        // 检查是否过期
        if (isExpired(wrapper)) {
          // 如果过期且需要自动删除
          if (autoDeleteExpired && transactionMode === 'readwrite') {
            const deleteRequest = store.delete(field)
            deleteRequest.onsuccess = () => {
              transaction.oncomplete = () => {
                resolve(null)
              }
            }
            deleteRequest.onerror = () => {
              // 即使删除失败，也返回 null（因为数据已过期）
              resolve(null)
            }
          } else {
            resolve(null)
          }
          return
        }

        // 数据未过期，返回实际数据
        resolve(wrapper.data)
      }
    })
  } catch (error) {
    console.error('Error getting cached data:', error)
    // 读取失败时返回 null 而不是抛出错误，保持向后兼容
    return null
  }
}

/**
 * 删除指定的缓存数据
 * @param params 删除参数
 * @returns Promise<void>
 */
export const deleteCachedXodrData = async (
  params: GetCachedXodrDataParams
): Promise<void> => {
  const { database, table, field } = params

  // 参数验证
  if (!database || typeof database !== 'string') {
    throw new Error('Database name must be a non-empty string')
  }
  if (!table || typeof table !== 'string') {
    throw new Error('Table name must be a non-empty string')
  }
  if (!field || typeof field !== 'string') {
    throw new Error('Field name must be a non-empty string')
  }

  try {
    const db = await initDB(database, table)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(table, 'readwrite')
      const store = transaction.objectStore(table)

      transaction.onerror = () => {
        const error = transaction.error || new Error('Transaction failed')
        console.error('Transaction error:', error)
        reject(error)
      }

      transaction.onabort = () => {
        reject(new Error('Transaction aborted'))
      }

      const request = store.delete(field)

      request.onerror = () => {
        const error = request.error || new Error('Delete operation failed')
        console.error('Delete error:', error)
        reject(error)
      }

      request.onsuccess = () => {
        transaction.oncomplete = () => {
          resolve()
        }
      }
    })
  } catch (error) {
    console.error('Error deleting cached data:', error)
    throw error
  }
}

/**
 * 清空指定表的所有缓存数据
 * @param database 数据库名称
 * @param table 表名称
 * @returns Promise<void>
 */
export const clearCachedXodrData = async (
  database: string,
  table: string
): Promise<void> => {
  // 参数验证
  if (!database || typeof database !== 'string') {
    throw new Error('Database name must be a non-empty string')
  }
  if (!table || typeof table !== 'string') {
    throw new Error('Table name must be a non-empty string')
  }

  try {
    const db = await initDB(database, table)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(table, 'readwrite')
      const store = transaction.objectStore(table)

      transaction.onerror = () => {
        const error = transaction.error || new Error('Transaction failed')
        console.error('Transaction error:', error)
        reject(error)
      }

      transaction.onabort = () => {
        reject(new Error('Transaction aborted'))
      }

      const request = store.clear()

      request.onerror = () => {
        const error = request.error || new Error('Clear operation failed')
        console.error('Clear error:', error)
        reject(error)
      }

      request.onsuccess = () => {
        transaction.oncomplete = () => {
          resolve()
        }
      }
    })
  } catch (error) {
    console.error('Error clearing cached data:', error)
    throw error
  }
}

/**
 * 关闭数据库连接
 * @param database 数据库名称
 * @param version 数据库版本号，默认为 1
 */
export const closeDB = (database: string, version: number = 1): void => {
  const cacheKey = `${database}_${version}`
  const db = dbCache.get(cacheKey)
  if (db) {
    db.close()
    dbCache.delete(cacheKey)
  }
}

/**
 * 关闭所有数据库连接
 */
export const closeAllDB = (): void => {
  dbCache.forEach((db) => {
    db.close()
  })
  dbCache.clear()
}

/**
 * 清理指定表中的所有过期数据
 * @param database 数据库名称
 * @param table 表名称
 * @returns Promise<number> 返回清理的数据条数
 */
export const cleanExpiredData = async (
  database: string,
  table: string
): Promise<number> => {
  // 参数验证
  if (!database || typeof database !== 'string') {
    throw new Error('Database name must be a non-empty string')
  }
  if (!table || typeof table !== 'string') {
    throw new Error('Table name must be a non-empty string')
  }

  try {
    const db = await initDB(database, table)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(table, 'readwrite')
      const store = transaction.objectStore(table)
      const keysToDelete: string[] = []

      transaction.onerror = () => {
        const error = transaction.error || new Error('Transaction failed')
        console.error('Transaction error:', error)
        reject(error)
      }

      transaction.onabort = () => {
        reject(new Error('Transaction aborted'))
      }

      // 遍历所有数据
      const request = store.openCursor()

      request.onerror = () => {
        const error = request.error || new Error('Cursor operation failed')
        console.error('Cursor error:', error)
        reject(error)
      }

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

        if (cursor) {
          const value = cursor.value

          // 检查是否是包装格式的数据
          if (
            typeof value === 'object' &&
            value !== null &&
            'data' in value &&
            'createdAt' in value &&
            'expiresAt' in value
          ) {
            const wrapper = value as CachedDataWrapper

            // 如果过期，添加到删除列表
            if (isExpired(wrapper)) {
              keysToDelete.push(cursor.key as string)
            }
          }

          cursor.continue()
        } else {
          // 遍历完成，删除所有过期的数据
          if (keysToDelete.length === 0) {
            resolve(0)
            return
          }

          let deletedCount = 0
          const deletePromises = keysToDelete.map((key) => {
            return new Promise<void>((resolveDelete) => {
              const deleteRequest = store.delete(key)
              deleteRequest.onsuccess = () => {
                deletedCount++
                resolveDelete()
              }
              deleteRequest.onerror = () => {
                resolveDelete() // 即使失败也继续
              }
            })
          })

          Promise.all(deletePromises).then(() => {
            transaction.oncomplete = () => {
              resolve(deletedCount)
            }
          })
        }
      }
    })
  } catch (error) {
    console.error('Error cleaning expired data:', error)
    throw error
  }
}

/**
 * 获取缓存数据的剩余有效时间
 * @param params 读取参数
 * @returns Promise<number | null> 返回剩余毫秒数，null 表示不存在、已过期或永不过期
 */
export const getCacheTTL = async (
  params: GetCachedXodrDataParams
): Promise<number | null> => {
  const { database, table, field } = params

  // 参数验证
  if (!database || typeof database !== 'string') {
    throw new Error('Database name must be a non-empty string')
  }
  if (!table || typeof table !== 'string') {
    throw new Error('Table name must be a non-empty string')
  }
  if (!field || typeof field !== 'string') {
    throw new Error('Field name must be a non-empty string')
  }

  try {
    const db = await initDB(database, table)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(table, 'readonly')
      const store = transaction.objectStore(table)

      transaction.onerror = () => {
        const error = transaction.error || new Error('Transaction failed')
        console.error('Transaction error:', error)
        reject(error)
      }

      transaction.onabort = () => {
        reject(new Error('Transaction aborted'))
      }

      const request = store.get(field)

      request.onerror = () => {
        const error = request.error || new Error('Get operation failed')
        console.error('Get error:', error)
        reject(error)
      }

      request.onsuccess = () => {
        const result = request.result

        // 如果数据不存在
        if (result === undefined) {
          resolve(null)
          return
        }

        // 如果不是包装格式，返回 null
        if (
          typeof result !== 'object' ||
          result === null ||
          !('expiresAt' in result)
        ) {
          resolve(null)
          return
        }

        const wrapper = result as CachedDataWrapper

        // 如果永不过期
        if (wrapper.expiresAt === null) {
          resolve(null)
          return
        }

        // 如果已过期
        if (isExpired(wrapper)) {
          resolve(null)
          return
        }

        // 计算剩余时间
        const remaining = wrapper.expiresAt - Date.now()
        resolve(remaining > 0 ? remaining : null)
      }
    })
  } catch (error) {
    console.error('Error getting cache TTL:', error)
    return null
  }
}