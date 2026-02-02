import axios from 'axios'
import AxiosCanceler from './cancelCancel'
// 处理错误信息

const errorInfo = status => {
  const errorMap = new Map([
    [400, '错误请求'],
    [401, '未授权，请重新登录'],
    [403, '拒绝访问'],
    [404, '请求错误，未找到该资源'],
    [405, '请求方法未允许'],
    [408, '请求超时'],
    [500, '服务器端出错'],
    [501, '网络未实现'],
    [502, '网络错误'],
    [503, '服务不可用'],
    [504, '网络超时'],
    [505, 'http版本不支持该请求']
  ])
  return errorMap.get(status) || `连接错误${status}`
}

export const getHeader = () => {
  return {
    // Authorization: `JWT ${localStorage.getItem(token)}`,
    // 'X-Project-Id': localStorage.getItem('X-Project-Id'),
    // 'Accept-Language': i18n.global.locale.value
  }
}

class AxiosRequest {
  // axios 实例
  instance = ''
  singleton = ''

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.VITE_API,
      timeout: 60 * 1000 * 3
    })
  }
  // 单例创建 AxiosRequest
  static getSingleton() {
    if (!this.singleton) {
      this.singleton = new AxiosRequest()
    }
    return this.singleton
  }

  // axios 拦截器
  getInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      config => {
        AxiosCanceler.removePending(config)
        AxiosCanceler.addPending(config)
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )
    // 返回拦截器
    this.instance.interceptors.response.use(
      res => {
        AxiosCanceler.removePending(res.config)
        if ([200, 201].includes(res.status)) {
          return res.data
        }
      },
      error => {
        const response = error?.response
        if (response?.status) {
          error.message = errorInfo(response?.status)
        }
        if (error.message.includes('timeout')) {
          error.message = '请求超时，请刷新网页重试'
        }
        return Promise.reject(error.message || '服务器错误，请稍后重试！')
      }
    )
  }
  // post 请求
  request(params) {
    return new Promise((resolve, reject) => {
      const { url, data = {}, method = 'POST', headers = {} } = params || {}
      const type = headers['content-type']
      Object.assign(headers, {
        'content-type': type || 'application/json',
        ...getHeader()
      })
      let postData = data
      if (type === 'multipart/form-data') {
        const formData = new FormData()
        for (let prop in data) {
          const value = data[prop]
          if (Array.isArray(value)) {
            value.forEach(v => formData.append(prop, v))
          } else {
            formData.append(prop, data[prop])
          }
        }
        postData = formData
      }

      this.instance
        .request({
          url,
          method,
          headers,
          data: ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase()) ? postData : null,
          params: method.toUpperCase() === 'GET' && typeof data == 'object' ? data : null
        })
        .then(res => {
          console.log(res)
          const { code, data = {}, msg, err } = res.data
          if (code === 0) {
            resolve(data)
          } else if (code === 100) {
            backLogin()
          } else if (code == 1512 || code == 1513) {
            reject(typeof msg === 'string' ? msg : err)
          } else if (code == 1511 || code == 1510) {
            reject(typeof msg === 'string' ? msg : err)
          } else {
            reject(typeof msg === 'string' ? msg : err)
          }
        })
        .catch(error => {
          console.log(error, 'error')
          if (error?.response?.status === 401) {
            // token过期跳到登录页
            localStorage.removeItem(token)
            backLogin()
          } else {
            reject(error)
          }
        })
    })
  }
}
export default AxiosRequest.getSingleton()


// export const fetchXodr = async (url, responseType = 'text') => {
//   const headers = {
//     method: 'GET',
//     ...getHeader()
//   }
//   const response = await fetch(url, { headers: headers })
//   if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
//   if (responseType === 'text') {
//     return response.text()
//   } else if (responseType === 'arrayBuffer') {
//     const arrayBuffer = await response.arrayBuffer()
//     return new Uint8Array(arrayBuffer)
//   } else if (responseType === 'blob') {
//     const blob = await response.blob()
//     const objectURL = URL.createObjectURL(blob)
//     return { blob, objectURL }
//   } else {
//     throw new Error('Unsupported response type')
//   }
// }