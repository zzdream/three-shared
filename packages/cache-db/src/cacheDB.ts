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
 */
export const initDB = (
  database: string,
  table: string,
  version: number = 1
): Promise<IDBDatabase> => {
  if (!database || typeof database !== 'string') {
    return Promise.reject(new Error('Database name must be a non-empty string'))
  }
  if (!table || typeof table !== 'string') {
    return Promise.reject(new Error('Table name must be a non-empty string'))
  }
  if (version < 1 || !Number.isInteger(version)) {
    return Promise.reject(new Error('Version must be a positive integer'))
  }
  if (!window.indexedDB) {
    return Promise.reject(
      new Error('IndexedDB is not supported in this browser')
    )
  }

  const cacheKey = `${database}_${version}`
  if (dbCache.has(cacheKey)) {
    const cachedDb = dbCache.get(cacheKey)!
    if (cachedDb.objectStoreNames.length >= 0) {
      return Promise.resolve(cachedDb)
    } else {
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
      db.onclose = () => { dbCache.delete(cacheKey) }
      db.onerror = (event) => { console.error('Database error:', event) }

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

const calculateExpiresAt = (expiresIn?: number | Date | null): number | null => {
  if (expiresIn === null || expiresIn === undefined) return null
  if (expiresIn instanceof Date) return expiresIn.getTime()
  if (typeof expiresIn === 'number') {
    if (expiresIn <= 0) throw new Error('ExpiresIn must be a positive number')
    return Date.now() + expiresIn
  }
  throw new Error('Invalid expiresIn format. Expected number, Date, or null')
}

const isExpired = (wrapper: CachedDataWrapper | null): boolean => {
  if (!wrapper) return true
  if (wrapper.expiresAt === null) return false
  return Date.now() > wrapper.expiresAt
}

export const cacheXodrData = async (
  params: CacheXodrDataParams
): Promise<void> => {
  const { database, table, field, data, expiresIn } = params

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
    const expiresAt = calculateExpiresAt(expiresIn)
    const wrapper: CachedDataWrapper = {
      data,
      createdAt: Date.now(),
      expiresAt,
    }

    const db = await initDB(database, table)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(table, 'readwrite')
      const store = transaction.objectStore(table)

      transaction.onerror = () => {
        reject(transaction.error || new Error('Transaction failed'))
      }
      transaction.onabort = () => reject(new Error('Transaction aborted'))

      const request = store.put(wrapper, field)
      request.onerror = () => reject(request.error || new Error('Put operation failed'))
      request.onsuccess = () => {
        transaction.oncomplete = () => resolve()
      }
    })
  } catch (error) {
    console.error('Error caching data:', error)
    throw error
  }
}

export const getCachedXodrData = async (
  params: GetCachedXodrDataParams
): Promise<any | null> => {
  const { database, table, field, autoDeleteExpired = true } = params

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
    const transactionMode = autoDeleteExpired ? 'readwrite' : 'readonly'

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(table, transactionMode)
      const store = transaction.objectStore(table)

      transaction.onerror = () => {
        reject(transaction.error || new Error('Transaction failed'))
      }
      transaction.onabort = () => reject(new Error('Transaction aborted'))

      const request = store.get(field)
      request.onerror = () => reject(request.error || new Error('Get operation failed'))
      request.onsuccess = () => {
        const result = request.result
        if (result === undefined) {
          resolve(null)
          return
        }
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
        if (isExpired(wrapper)) {
          if (autoDeleteExpired && transactionMode === 'readwrite') {
            const deleteRequest = store.delete(field)
            deleteRequest.onsuccess = () => {
              transaction.oncomplete = () => resolve(null)
            }
            deleteRequest.onerror = () => resolve(null)
          } else {
            resolve(null)
          }
          return
        }
        resolve(wrapper.data)
      }
    })
  } catch (error) {
    console.error('Error getting cached data:', error)
    return null
  }
}

export const deleteCachedXodrData = async (
  params: GetCachedXodrDataParams
): Promise<void> => {
  const { database, table, field } = params
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
      transaction.onerror = () => reject(transaction.error || new Error('Transaction failed'))
      transaction.onabort = () => reject(new Error('Transaction aborted'))
      const request = store.delete(field)
      request.onerror = () => reject(request.error || new Error('Delete operation failed'))
      request.onsuccess = () => {
        transaction.oncomplete = () => resolve()
      }
    })
  } catch (error) {
    console.error('Error deleting cached data:', error)
    throw error
  }
}

export const clearCachedXodrData = async (
  database: string,
  table: string
): Promise<void> => {
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
      transaction.onerror = () => reject(transaction.error || new Error('Transaction failed'))
      transaction.onabort = () => reject(new Error('Transaction aborted'))
      const request = store.clear()
      request.onerror = () => reject(request.error || new Error('Clear operation failed'))
      request.onsuccess = () => {
        transaction.oncomplete = () => resolve()
      }
    })
  } catch (error) {
    console.error('Error clearing cached data:', error)
    throw error
  }
}

export const closeDB = (database: string, version: number = 1): void => {
  const cacheKey = `${database}_${version}`
  const db = dbCache.get(cacheKey)
  if (db) {
    db.close()
    dbCache.delete(cacheKey)
  }
}

export const closeAllDB = (): void => {
  dbCache.forEach((db) => db.close())
  dbCache.clear()
}

export const cleanExpiredData = async (
  database: string,
  table: string
): Promise<number> => {
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

      transaction.onerror = () => reject(transaction.error || new Error('Transaction failed'))
      transaction.onabort = () => reject(new Error('Transaction aborted'))

      const request = store.openCursor()
      request.onerror = () => reject(request.error || new Error('Cursor operation failed'))
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          const value = cursor.value
          if (
            typeof value === 'object' &&
            value !== null &&
            'data' in value &&
            'createdAt' in value &&
            'expiresAt' in value
          ) {
            if (isExpired(value as CachedDataWrapper)) {
              keysToDelete.push(cursor.key as string)
            }
          }
          cursor.continue()
        } else {
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
              deleteRequest.onerror = () => resolveDelete()
            })
          })
          Promise.all(deletePromises).then(() => {
            transaction.oncomplete = () => resolve(deletedCount)
          })
        }
      }
    })
  } catch (error) {
    console.error('Error cleaning expired data:', error)
    throw error
  }
}

export const getCacheTTL = async (
  params: GetCachedXodrDataParams
): Promise<number | null> => {
  const { database, table, field } = params
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
      transaction.onerror = () => reject(transaction.error || new Error('Transaction failed'))
      transaction.onabort = () => reject(new Error('Transaction aborted'))
      const request = store.get(field)
      request.onerror = () => reject(request.error || new Error('Get operation failed'))
      request.onsuccess = () => {
        const result = request.result
        if (result === undefined) resolve(null)
        else if (
          typeof result !== 'object' ||
          result === null ||
          !('expiresAt' in result)
        ) {
          resolve(null)
        } else {
          const wrapper = result as CachedDataWrapper
          if (wrapper.expiresAt === null) resolve(null)
          else if (isExpired(wrapper)) resolve(null)
          else {
            const remaining = wrapper.expiresAt - Date.now()
            resolve(remaining > 0 ? remaining : null)
          }
        }
      }
    })
  } catch (error) {
    console.error('Error getting cache TTL:', error)
    return null
  }
}
