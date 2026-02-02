module.exports = {
  printWidth: 160, // 一行的字符数，如果超过会进行换行
  tabWidth: 2, // 一个tab代表几个空格数，默认就是2
  useTabs: false, // 是否启用tab取代空格符缩进，.editorconfig设置空格缩进，所以设置为false
  semi: false, // 行尾是否使用分号，默认为true
  singleQuote: true, // 字符串是否使用单引号
  trailingComma: 'none', // 对象或数组末尾是否添加逗号 none| es5| all
  jsxSingleQuote: true, // 在jsx里是否使用单引号，你看着办
  bracketSpacing: true, // 对象大括号直接是否有空格，默认为true，效果：{ foo: bar }
  arrowParens: 'avoid' // 箭头函数如果只有一个参数则省略括号
  // vueIndentScriptAndStyle: true, // Vue 文件脚本和样式标签缩进
  // quoteProps: 'as-needed', // 引用对象中的属性时，仅在需要时在对象属性周围添加引号。
  // bracketSameLine: false, // 将>多行 HTML（HTML、JSX、Vue、Angular）元素放在最后一行的末尾，而不是单独放在下一行（不适用于自闭合元素）。
  // insertPragma: false, // 插入编译指示
  // requirePragma: false, // 需要编译指示
  // proseWrap: 'never', // 如果散文超过打印宽度，则换行
  // htmlWhitespaceSensitivity: 'strict', // 所有标签周围的空格（或缺少空格）被认为是重要的。
  // endOfLine: 'lf', // 确保在文本文件中仅使用 ( \n)换行，常见于 Linux 和 macOS 以及 git repos 内部。
  // rangeStart: 0 // 格式化文件时，回到包含所选语句的第一行的开头。
}
