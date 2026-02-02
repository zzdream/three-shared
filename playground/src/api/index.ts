/**
 * 已通过vite的auto import自动导入，使用时通过变量‘apis’就可以直接访问
 * demo：api.user
 * note: 使用defineApi定义接口时注意末尾的函数调用
 */

export const user = defineApi({
  // login: { url: '/auth/login/', method: 'post' }
})()

export const overview = defineApi({})()
