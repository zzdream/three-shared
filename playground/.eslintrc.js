module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    './.eslintrc-auto-import.json'
  ],
  overrides: [],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true // 开启jsx模板支持
    }
  },
  plugins: ['vue', '@typescript-eslint'],
  // ignorePatterns: ['./src/assets/iconfont/iconfont.js'],
  rules: {
    //关闭组件命名规则
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-inferrable-types': 0, // 关闭ts类型推断
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/ban-types': 'off',
    // 禁止未使用的变量 https://typescript-eslint.io/rules/no-unused-vars
    '@typescript-eslint/no-unused-vars': 'error',
    // 带有默认值的函数参数在最后 https://typescript-eslint.io/rules/default-param-last
    '@typescript-eslint/default-param-last': 'error',
    'no-eval': 2, //不允许使用eval
    'no-var': 'error', // 禁止使用 var
    'no-debugger': 'off',
    'no-undef': 'off'
  }
}
