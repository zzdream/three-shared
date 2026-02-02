# 大文件分块加载方案对比（50-60MB XODR 文件）

## 方案对比

### 方案 1：流式加载（当前实现）✅ 推荐

**实现：** `loadXodr` / `loadXodrWithWorker`

**优点：**
- ✅ 实现简单，浏览器原生支持
- ✅ 自动分块读取（浏览器内部处理）
- ✅ 内存占用低（流式处理）
- ✅ 支持进度回调
- ✅ 无需服务器特殊配置

**缺点：**
- ⚠️ 单次 HTTP 请求，网络中断需要重试

**适用场景：**
- 文件大小：< 100MB
- 网络稳定
- **推荐用于大多数场景**

**性能：**
- 内存峰值：~文件大小（流式处理）
- 下载速度：取决于网络带宽

---

### 方案 2：HTTP Range 分块下载 ⭐ 适合超大文件

**实现：** `loadXodrChunked`

**优点：**
- ✅ 分块下载，减少单次请求压力
- ✅ 支持并发下载，提升速度
- ✅ 断点续传（可以只重试失败的块）
- ✅ 更好的错误恢复能力
- ✅ 可控制每块大小和并发数

**缺点：**
- ⚠️ 需要服务器支持 HTTP Range 请求
- ⚠️ 实现复杂度较高
- ⚠️ 最终仍需合并所有块（WebAssembly 需要完整文件）

**适用场景：**
- 文件大小：> 50MB
- 网络不稳定
- 需要更好的错误恢复
- **推荐用于超大文件（50MB+）**

**性能：**
- 内存峰值：~chunkSize × concurrency（可控制）
- 下载速度：取决于网络带宽和并发数

**使用示例：**
```typescript
const xodrContent = await loadXodrChunked({
  url: '/path/to/large-file.xodr',
  chunkSize: 5 * 1024 * 1024, // 5MB per chunk
  concurrency: 3, // 并发 3 个请求
  onProgress: (loaded, total) => {
    console.log(`加载进度: ${(loaded / total * 100).toFixed(1)}%`)
  }
})
```

---

### 方案 3：Worker 流式加载（当前实现）

**实现：** `loadXodrWithWorker`

**优点：**
- ✅ 不阻塞主线程 UI
- ✅ 流式加载，内存友好
- ✅ 支持进度回调

**缺点：**
- ⚠️ 单次 HTTP 请求
- ⚠️ 网络中断需要重试

**适用场景：**
- 文件大小：< 100MB
- 需要保持 UI 响应
- **推荐用于需要不阻塞 UI 的场景**

---

## 推荐方案

### 🎯 对于 50-60MB 的文件：

**首选：`loadXodrChunked`（HTTP Range 分块下载）**

**原因：**
1. ✅ 分块下载，减少单次请求压力
2. ✅ 并发下载，提升速度
3. ✅ 更好的错误恢复能力
4. ✅ 可控制内存占用（通过 chunkSize 和 concurrency）

**配置建议：**
```typescript
const xodrContent = await loadXodrChunked({
  url: process.env.VITE_P_TO_B + '/56m.xodr',
  chunkSize: 5 * 1024 * 1024, // 5MB 每块（适合 50-60MB 文件）
  concurrency: 3, // 并发 3 个请求（平衡速度和服务器压力）
  onProgress: (loaded, total) => {
    const percent = ((loaded / total) * 100).toFixed(1)
    console.log(`加载进度: ${percent}%`)
    // 更新 UI 进度条
  }
})
```

### 备选：`loadXodrWithWorker`（如果服务器不支持 Range 请求）

如果服务器不支持 HTTP Range 请求，使用 Worker 流式加载：

```typescript
const xodrContent = await loadXodrWithWorker({
  url: process.env.VITE_P_TO_B + '/56m.xodr',
  onProgress: (loaded, total) => {
    const percent = ((loaded / total) * 100).toFixed(1)
    console.log(`加载进度: ${percent}%`)
  }
})
```

---

## 性能对比（50-60MB 文件）

| 方案 | 内存峰值 | 下载速度 | 错误恢复 | 实现复杂度 | 推荐度 |
|------|---------|---------|---------|-----------|--------|
| 流式加载 | ~60MB | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Range 分块 | ~15MB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Worker 流式 | ~60MB | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 注意事项

1. **服务器配置**：确保服务器支持 HTTP Range 请求
   ```nginx
   # Nginx 配置示例
   location / {
     # 默认已支持 Range 请求
     # 确保文件大小正确（Content-Length）
   }
   ```

2. **内存优化**：
   - `chunkSize`: 5-10MB 适合大多数场景
   - `concurrency`: 2-4 个并发请求（避免服务器压力过大）

3. **网络优化**：
   - 启用服务器压缩（gzip/brotli）
   - 使用 CDN 加速

4. **最终限制**：
   - WebAssembly 需要完整文件才能解析
   - 分块下载后仍需合并（但内存占用更可控）

---

## 总结

**对于 50-60MB 的文件，推荐使用 `loadXodrChunked`：**

✅ **优势明显**：
- 分块下载，减少单次请求压力
- 并发下载，提升速度
- 更好的错误恢复能力
- 可控制内存占用

⚠️ **前提条件**：
- 服务器需要支持 HTTP Range 请求（大多数服务器默认支持）

如果服务器不支持 Range 请求，使用 `loadXodrWithWorker` 作为备选方案。

