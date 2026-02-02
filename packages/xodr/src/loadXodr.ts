export interface LoadXodrOptions {
  url: string
  header?: Record<string, string>
  responseType: 'text' | 'arrayBuffer' | 'blob'
  /**
   * 是否使用流式加载（推荐用于大文件）
   * 默认：true
   */
  useStreaming?: boolean
  /**
   * 进度回调函数
   * @param loaded 已加载的字节数
   * @param total 总字节数（如果可用）
   */
  onProgress?: (loaded: number, total?: number) => void
}

/**
 * 流式读取文本（适用于大文件）
 */
async function streamText(
  response: Response,
  onProgress?: (loaded: number, total?: number) => void
): Promise<string> {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : undefined

  if (!reader) {
    throw new Error('Response body is not readable')
  }

  let loaded = 0
  let chunks: string[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      loaded += value.length
      chunks.push(decoder.decode(value, { stream: true }))
      // 调用进度回调
      if (onProgress) {
        onProgress(loaded, total)
      }
    }
  } finally {
    reader.releaseLock()
  }

  return chunks.join('')
}

/**
 * 流式读取 ArrayBuffer（适用于大文件）
 */
async function streamArrayBuffer(
  response: Response,
  onProgress?: (loaded: number, total?: number) => void
): Promise<Uint8Array> {
  const reader = response.body?.getReader()
  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : undefined

  if (!reader) {
    throw new Error('Response body is not readable')
  }

  let loaded = 0
  const chunks: Uint8Array[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      loaded += value.length
      chunks.push(value)
      
      // 调用进度回调
      if (onProgress) {
        onProgress(loaded, total)
      }
    }
  } finally {
    reader.releaseLock()
  }

  // 合并所有 chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

export const loadXodr = async (options: LoadXodrOptions) => {
  const { url, header, responseType, useStreaming = true, onProgress } = options
  
  const headers = {
    method: 'GET',
    ...header,
  }
  
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  // 如果服务器支持压缩，浏览器会自动解压
  // 确保服务器配置了 gzip/brotli 压缩可以显著提升大文件加载速度

  if (responseType === 'text') {
    if (useStreaming) {
      return streamText(response, onProgress)
    } else {
      // 传统方式：一次性加载
      const text = await response.text()
      const contentLength = response.headers.get('content-length')
      if (onProgress && contentLength) {
        onProgress(parseInt(contentLength, 10), parseInt(contentLength, 10))
      }
      return text
    }
  } else if (responseType === 'arrayBuffer') {
    if (useStreaming) {
      return streamArrayBuffer(response, onProgress)
    } else {
      // 传统方式：一次性加载
      const arrayBuffer = await response.arrayBuffer()
      const contentLength = response.headers.get('content-length')
      if (onProgress && contentLength) {
        onProgress(parseInt(contentLength, 10), parseInt(contentLength, 10))
      }
      return new Uint8Array(arrayBuffer)
    }
  } else if (responseType === 'blob') {
    // Blob 类型使用传统方式（浏览器会自动处理流式）
    const blob = await response.blob()
    const contentLength = response.headers.get('content-length')
    if (onProgress && contentLength) {
      onProgress(parseInt(contentLength, 10), parseInt(contentLength, 10))
    }
    const objectURL = URL.createObjectURL(blob)
    return { blob, objectURL }
  } else {
    throw new Error('Unsupported response type')
  }
}