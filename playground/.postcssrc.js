module.exports = {
  plugins: {
    autoprefixer: {}
    // 'postcss-pxtorem': {
    //   //替换当前屏幕分辨率，所有大屏统一配成384均可使页面宽度占100%，装备中心为480
    //   // rootValue: 384, // 这是将像素单位转换为rem单位的基准值。例：一个元素的字体大小为24px，它将被转换为0.0625rem（24 / 384 = 0.0625）
    //   rootValue: 384,
    //   // minPixelValue: 2,
    //   propList: ['*'] // 这里指定了要进行单位转换的CSS属性。配置为['*']表示所有CSS属性都会被转换为rem单位。这意味着任何使用像素单位的CSS属性都将被转换。
    // }
  }
}
