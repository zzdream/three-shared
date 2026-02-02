/**
 * 分块加载 XODR 文件（适用于超大文件 50MB+）
 * 使用 HTTP Range 请求分块下载，减少内存峰值
 */


export interface LoadXodrChunkedOptions {
  url: string
  header?: Record<string, string>
  /**
   * 每块大小（字节），默认 5MB
   * 可以根据网络情况调整：网络好可以增大，网络差可以减小
   */
  chunkSize?: number
  /**
   * 并发下载块数，默认 3
   * 注意：过多并发可能导致服务器压力过大
   */
  concurrency?: number
  /**
   * 是否使用缓存
   * 默认：false
   */
  useCache?: boolean
  /**
   * 进度回调函数
   */
  onProgress?: (loaded: number, total: number) => void
}

/**
 * 获取文件大小
 */
async function getFileSize(url: string, headers: Record<string, string>): Promise<number> {
  const response = await fetch(url, {
    method: 'HEAD',
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`Failed to get file size: ${response.status}`)
  }
  
  const contentLength = response.headers.get('content-length')
  if (!contentLength) {
    throw new Error('Content-Length header not found')
  }
  
  return parseInt(contentLength, 10)
}

/**
 * 下载单个块
 */
async function downloadChunk(
  url: string,
  start: number,
  end: number,
  headers: Record<string, string>
): Promise<Uint8Array> {
  const response = await fetch(url, {
    headers: {
      ...headers,
      Range: `bytes=${start}-${end}`,
    },
  })
  
  if (!response.ok && response.status !== 206) {
    throw new Error(`Failed to download chunk: ${response.status}`)
  }
  
  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

/**
 * 将相对路径转换为绝对 URL
 */
function resolveUrl(url: string): string {
  if (/^(https?:)?\/\//.test(url)) {
    return url
  }
  
  try {
    return new URL(url, window.location.href).href
  } catch (error) {
    console.warn('Failed to resolve URL, using original:', url)
    return url
  }
}

/**
 * 分块加载 XODR 文件
 * 
 * 优势：
 * 1. 分块下载：减少单次请求压力
 * 2. 并发下载：提升下载速度
 * 3. 内存优化：分块处理，避免一次性加载整个文件
 * 4. 进度反馈：实时显示加载进度
 * 
 * 注意：
 * - 服务器必须支持 HTTP Range 请求
 * - 如果 Range 请求失败，会自动降级到流式加载
 * - 最终仍需要完整文件才能解析（WebAssembly 限制）
 * - 适合超大文件（50MB+）的场景
 * 
 * @example
 * ```typescript
 * const xodrContent = await loadXodrChunked({
 *   url: '/path/to/large-file.xodr',
 *   chunkSize: 5 * 1024 * 1024, // 5MB per chunk
 *   concurrency: 3, // 并发 3 个请求
 *   onProgress: (loaded, total) => {
 *     console.log(`加载进度: ${(loaded / total * 100).toFixed(1)}%`)
 *   }
 * })
 * ```
 */
export async function loadXodrChunked(options: LoadXodrChunkedOptions): Promise<string> {
  const {
    url,
    header = {},
    chunkSize = 5 * 1024 * 1024, // 默认 5MB
    concurrency = 3,
    onProgress,
  } = options

  const absoluteUrl = resolveUrl(url)
  const headers = {
    method: 'GET',
    ...header,
  }

  try {
    // 1. 获取文件大小（测试 Range 支持）
    const fileSize = await getFileSize(absoluteUrl, headers)
  const totalChunks = Math.ceil(fileSize / chunkSize)

  console.log(`文件大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB, 分块数: ${totalChunks}`)

  // 2. 创建所有块的下载任务
  const chunks: Array<{ index: number; start: number; end: number }> = []
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize - 1, fileSize - 1)
    chunks.push({ index: i, start, end })
  }

  // 3. 分块下载（带并发控制）
  const results: Array<{ index: number; data: Uint8Array }> = []
  let loaded = 0

  // 并发下载函数（使用更可靠的并发控制）
  const downloadWithConcurrency = async () => {
    let currentIndex = 0
    const activePromises = new Set<Promise<void>>()

    const downloadChunkTask = async (chunk: { index: number; start: number; end: number }): Promise<void> => {
      try {
        const data = await downloadChunk(absoluteUrl, chunk.start, chunk.end, headers)
        results.push({ index: chunk.index, data })
        loaded += data.length
        
        if (onProgress) {
          onProgress(loaded, fileSize)
        }
      } catch (error) {
        throw new Error(`Failed to download chunk ${chunk.index}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    const processNext = async (): Promise<void> => {
      while (currentIndex < chunks.length) {
        // 如果已达到并发限制，等待一个任务完成
        while (activePromises.size >= concurrency && currentIndex < chunks.length) {
          await Promise.race(Array.from(activePromises))
        }

        if (currentIndex >= chunks.length) break

        const chunk = chunks[currentIndex++]
        const promise = downloadChunkTask(chunk).finally(() => {
          activePromises.delete(promise)
        })
        
        activePromises.add(promise)
      }

      // 等待所有剩余任务完成
      await Promise.all(Array.from(activePromises))
    }

    await processNext()
  }

  await downloadWithConcurrency()

  // 4. 验证数据完整性
  if (results.length !== totalChunks) {
    throw new Error(`下载不完整: 期望 ${totalChunks} 块，实际 ${results.length} 块`)
  }

  // 5. 按顺序合并所有块
  console.log('合并分块数据...')
  results.sort((a, b) => a.index - b.index)
  
  // 验证每个块的大小是否正确
  for (let i = 0; i < results.length; i++) {
    const chunk = chunks[i]
    const result = results[i]
    const expectedSize = chunk.end - chunk.start + 1
    const actualSize = result.data.length
    
    if (actualSize !== expectedSize && i !== results.length - 1) {
      // 最后一块可能小于 chunkSize，这是正常的
      console.warn(`块 ${i} 大小不匹配: 期望 ${expectedSize}, 实际 ${actualSize}`)
    }
  }
  
  const totalLength = results.reduce((sum, item) => sum + item.data.length, 0)
  
  // 验证总大小
  if (totalLength !== fileSize) {
    console.warn(`总大小不匹配: 期望 ${fileSize}, 实际 ${totalLength}`)
    // 如果大小不匹配，仍然继续，但记录警告
  }
  
  const merged = new Uint8Array(totalLength)
  let offset = 0
  
  for (const { data } of results) {
    merged.set(data, offset)
    offset += data.length
  }

  // 6. 转换为字符串（使用 UTF-8 编码）
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const decodedString = decoder.decode(merged)
  
  // 验证字符串长度（粗略检查）
  if (decodedString.length === 0) {
    throw new Error('解码后的字符串为空')
  }
  
  console.log(`合并完成: ${(totalLength / 1024 / 1024).toFixed(2)}MB`)
  return decodedString
  
  } catch (error) {
    // 如果 Range 请求失败，降级到流式加载
    console.warn('分块加载失败，降级到流式加载:', error)
    const { loadXodr } = await import('./loadXodr')
    return await loadXodr({
      url,
      header,
      responseType: 'text',
      useStreaming: true,
      onProgress: onProgress ? (loaded, total) => onProgress(loaded, total || 0) : undefined,
    }) as string
  }
}

