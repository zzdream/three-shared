// import type { AxiosRequestConfig, Canceler } from 'axios'
import axios from 'axios'
function getType(obj) {
  const _toString = Object.prototype.toString
  return _toString.call(obj).slice(8, -1).toLowerCase()
}
function isTypeOf(obj, type) {
  return getType(obj) === type
}
export const getPendingUrl = config => [config.method, config.url].join('&')

class AxiosCanceler {
  pendingMap = ''
  static instance = AxiosCanceler
  constructor() {
    this.pendingMap = new Map()
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new AxiosCanceler()
    }
    return this.instance
  }

  /**
   * 向 pandingMap 添加请求
   * @param { AxiosRequestConfig } config axios 请求参数
   */
  addPending(config) {
    this.removePending(config)
    const url = getPendingUrl(config)
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken(cancel => {
        if (!this.pendingMap.has(url)) {
          this.pendingMap.set(url, cancel)
        }
      })
  }
  // 删除 pendingMap 中请求
  removePending(config) {
    const url = getPendingUrl(config)
    if (this.pendingMap.has(url)) {
      const cancel = this.pendingMap.get(url)
      cancel && cancel('操作频繁，请稍后重试')
      this.pendingMap.delete(url)
    }
  }
  // 删除所有的请求
  removeAllPending() {
    this.pendingMap.forEach(cancel => {
      cancel && isTypeOf(cancel, 'function') && cancel()
    })
    this.pendingMap.clear()
  }
  // 重置 pendingMap
  reset() {
    this.pendingMap = new Map()
  }
}

export default AxiosCanceler.getInstance()
