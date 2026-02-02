import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import mdPlugin from 'vite-plugin-markdown'
// import { Mode } from 'vite-plugin-markdown'
import eslintPlugin from 'vite-plugin-eslint'
import svgLoader from 'vite-svg-loader'
import { createHtmlPlugin } from 'vite-plugin-html'
// import viteCompression from 'vite-plugin-compression'
// 自动导入vue中hook reactive ref等
import AutoImport from 'unplugin-auto-import/vite'
//自动导入ui-组件 比如说ant-design-vue  element-plus等
import Components from 'unplugin-vue-components/vite'
//ant-design-vue
// import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
// import {Plugin as importToCDN} from 'vite-plugin-cdn-import'    // 配置 cdn 加速  暂不需要
import { resolve } from 'path'
import vueJsx from '@vitejs/plugin-vue-jsx' // 配置vue使用jsx
// import path from 'path'
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '') // 加载环境变量
  return {
    define: {
      'process.env': env
    },
    base: env['VITE_BASE_STATIC_URL'], // 开发或生产环境服务的公共基础路径 需要与打包工具和 Router 路由的 base 保持一致
    resolve: {
      // 别名
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          // // // 自定义主题
          // modifyVars: {
          //   hack: 'true; @import "@/assets/styles/theme.less"'
          // },
          // modifyVars: env['VITE_ENV'] == 'dev' ? defaultTheme : darkTheme,
          javascriptEnabled: true
        }
      }
    },
    plugins: [
      vue({ reactivityTransform: true }),
      vueJsx(),
      svgLoader(),
      // mdPlugin({ mode: [Mode.VUE] }),
      createHtmlPlugin({
        inject: {
          data: {
            title_zh: env['VITE_TITLE']
          }
        }
      }),
      AutoImport({
        //安装后你会发现在组件中不用再导入ref，reactive等
        imports: [
          'vue',
          'vue-router',
          'pinia',
          {
            'vue-request': ['useRequest'],
            // 'ant-design-vue': ['message'],
            '@/hooks/api.ts': ['defineApi'],
            '@/api/index.ts': [['*', 'api']],
            '@/store/index.ts': [['*', 'store']]
          },
          {
            from: 'vue-request',
            imports: ['Service'],
            type: true
          }
        ],
        include: [/\.[tj]sx?$/, /\.vue$/], // 匹配的文件，也就是哪些后缀的文件需要自动引入
        eslintrc: {
          enabled: false, // 若没此json文件，先开启，生成后在关闭
          filepath: './.eslintrc-auto-import.json', // 设置eslintrc-auto-import.json生成路径 Default `./.eslintrc-auto-import.json`
          globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
        // resolvers: [AntDesignVueResolver({ resolveIcons: true })],
        dts: 'src/auto-import.d.ts' // 会在根目录生成auto-imports.d.ts，里面可以看到自动导入的api
      }),

      Components({
        globs: ['src/components/**/index.vue'] // 引入自定义组件
        // resolvers: [AntDesignVueResolver({ importStyle: 'less' })] // 如果需要自定义主题色，则需要配置importStyle: 'less',并安装less: npm install less --save-dev
      }),
      eslintPlugin({
        include: ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx'], // 检查的文件
        exclude: ['node_modules', 'dist', 'public', 'src/**/*.js'],
        cache: false,
        fix: true
      })
      // //开启gzip压缩  ng需要配合  体积不是很大不建议使用
      // viteCompression({
      //   verbose: true,
      //   disable: false,
      //   threshold: 10240,
      //   algorithm: 'gzip',
      //   ext: '.gz'
      // })
    ],
    build: {
      target: 'modules', //浏览器兼容性modules|esnext
      outDir: 'dist', // 指定输出路径
      assetsDir: 'assets', // 指定生成静态资源的存放路径
      minify: 'terser', // 混淆器,terser构建后文件体积更小
      sourcemap: true, // 构建后是否生成soutrce map文件
      cssCodeSplit: true, // 如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
      chunkSizeWarningLimit: 1500, //警报门槛，限制大文件大小B为单位
      terserOptions: {
        compress: {
          // drop_console: true, // 生产环境移除console
          // drop_debugger: true, // 生产环境移除debugger
          // pure_funcs: ['console.log']
        }
      },
      // 大文件切割 分包
      rollupOptions: {
        // input: {
        //   main: path.resolve(__dirname, 'index.html')
        //   // OdrHandle: path.resolve(__dirname, 'index.html')
        // },
        // treeshake: false,
        output: {
          // //静态资源分类打包
          // chunkFileNames: 'assets/js/[name]-[hash].js',
          // entryFileNames: 'assets/js/[name]-[hash].js',
          // assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          // manualChunks(id) {
          //   //静态资源分拆打包
          //   if (id.includes('node_modules')) {
          //     return id.toString().split('node_modules/')[1].split('/')[0].toString()
          //   }
          // }
          // 二
          // manualChunks() {
          //   return 'vendor'
          // },
          // entryFileNames: 'assets/js/index.js',
          // assetFileNames: 'assets/[ext]/[name].[ext]'
          manualChunks(id) {
            if (id.includes('node_modules/three')) {
              return 'three'
            }
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3007,
      open: true,
      // cors: true,
      // headers: {
      //   'Access-Control-Allow-Origin': '*' // 确保允许所有来源
      // },
      // 反向代理
      proxy: {
        '/api': {
          target: env['VITE_BASE_API'],
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        },
        '/output': {
          target: env['VITE_BASE_API'],
          secure: false, // 如果是https接口，需要配置这个参数
          changeOrigin: true
          // rewrite: path => path.replace(/^\/output/, '')
        },
        '/obs': {
          target: 'http://1.202.215.166:30080/',
          secure: false, // 如果是https接口，需要配置这个参数
          changeOrigin: true
          // rewrite: path => path.replace(/^\/output/, '')
        }
      }
    }
  }
})
