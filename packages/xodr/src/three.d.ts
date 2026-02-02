/**
 * Three.js 类型声明
 * three 是 peerDependency，类型定义由使用方项目提供
 * 此文件仅用于避免 TypeScript 编译错误
 */
declare module 'three' {
  const THREE: any
  export = THREE
  export as namespace THREE
}

