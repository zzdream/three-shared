// 支持智能提示的api的hook
import { AxiosRequestConfig } from 'axios'
import http from '../utils/http/index.js'

type ActionValue = AxiosRequestConfig | ((payload?: any) => Promise<any>)

type Actions<A> = {
  [K in keyof A]: ActionValue
}

type Results<A> = {
  [K in keyof A]: (data?: any) => Promise<any>
}

/**
 * 1. 定义api函数
 * // 支持三种方式
 * import { defineApi } from '../hooks/api'
 * export const useTestApi = defineApi({
    get: 'http://127.0.0.1:8000/items',     // 1. 无参数的简单get
    post: { url: 'http://127.0.0.1:8000/items', method: 'POST' }, // 2. 跟axios配置相同
    put: (data) =>   // 3. 自定义请求函数
      http.request({
        url: 'http://127.0.0.1:8000/items',
        method: 'POST',
        data
      })
  })
 *
 * 2. 使用API, 使用时支持智能提示
 * import { useTestApi } from '@/api/test-api'
 * const testApi = useTestApi()
   testapi.get()
   testapi.post({ "name": "Angel", "age": 10 })
 *
 * @param action：{ string: string | AxioxRequestConfig | Function}
 * @returns Function: { string: Function }
 */
export function defineApi<A>(action: Actions<A>): () => Results<A> {
  return () => {
    const results = {} as { [key: string]: Function }
    for (const [key, value] of Object.entries<ActionValue>(action)) {
      if (typeof value === 'function') {
        // 自定义请求函数
        results[key] = value
      } else {
        // 与axios一样的请求配置
        let { url } = value
        if (url && url?.indexOf('/{') > -1) {
          // url里含有变量 /scene/scenes/{sid}
          url = url.split('{')[0]
          results[key] = (data: any) => http.request({ ...value, url: url + (data.id || data) + '/', data: data.data })
        } else {
          results[key] = (data: any) => http.request({ ...value, url, data })
        }
      }
    }
    return results as Results<A>
  }
}
