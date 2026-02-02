declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const vueComponent: DefineComponent<{}, {}, any>

  export default vueComponent
}

declare module '*.md' {
  import type { ComponentOptions } from 'vue'

  const Component: ComponentOptions

  export default Component
}
