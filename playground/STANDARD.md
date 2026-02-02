# 前端开发规范

在前端项目工程日益复杂的今天，一套完善的开发环境配置可以极大的提升开发效率，提高代码质量，方便多人合作，以及后期的项目迭代和维护。

## 一、用到的主要工具
1. vscode：统一前端编辑器。
2. editorconfig: 统一团队 vscode 编辑器默认配置。
3. prettier: 保存文件自动格式化代码。
4. eslint: 检测代码语法规范和错误。
5. lint-staged: 只检测暂存区文件代码，优化 eslint 检测速度。
6. husky/commitizen：git提交的检测和规范
7. tailwind：原子化的css框架，通过class就可以修改样式

## 二、目录结构
mock
| -- data.js         本地模拟接口  
src
| -- api             接口定义   
| -- assets          样式、图片、字体等资源   
| ---- iconfont   
| ---- images   
| ---- styles     
| -- components     公共基础组件   
| ---- table        每个组件一个目录，这里table是一个示例
| ------ demo.vue   组件使用demo
| ------ index.vue  组件定义
| ------ readme.md   组件说明
| -- hooks          公共hooks   
| -- layout         页面布局   
| -- router			    页面路由   
| -- store			    数据资源存储   
| -- types			    typescript的全局类型定义   
| -- utils				  通用工具   
| -- views			    
| ---- course           每个页面一个目录，尽量一个单词，多个单词用’-’连接 。这里 course 是一个示例  
| ------ components     页面级组件   
| ------ index.vue      以index.vue为默认页面   

## 三、命名规范
### 1. 文件和文件夹
使用`kebab-case`命名方式，尽量使用单个单词   

### 2. 变量
#### 2.1 命名规范
+ 普通变量：camlCase
+ 常量：全大写+下划线，如：CONSTANT_TYPES
+ 类名、枚举：PascalCase
+ 组件名：PascalCase
``` javascript
import SearchBar from '@/components/search-bar.vue'
```

#### 2.2 命名指南
不同的变量采用不同的命名方式
+ 属性名：用名词，如 userName
+ 函数名：用动词开头，如 setUserName， isAdmin，hasPermission，checkName
+ boolean属性或返回boolean的函数：用is，has，can等开头。如：isAdmin，hasPermission
+ 事件响应函数：onXXX

#### 2.3 API接口命名规范
 对函数前缀规范如下：
+ 获取数据：getXXX
+ 新建数据：addXXX
+ 编辑数据：updateXXX
+ 删除数据：deleteXXX

## 四、JavaScript文件规范
### import 规则
+ 先三方模块，后本地模块
+ 按字母顺序导入
+ 同种资源类型的放在一起
+ 同一个目录下的放在一起
+ 导入顺序：三方 -> 组件 -> JS -> CSS
+ 单独引入三方样式的，放在最末尾
``` javascript
// demo for import
import { createApp } from 'vue'    // 三方模块，按字母顺序
import App from './App.vue'         // 本地模块，按字母顺序
import router from './router'
import store from './store'
import '@/permission'               // import里无from
import '@/assets/css/global.css'  // 样式
import 'ant-design-vue/dist/antd.css'
```

### 注释
+ 工具类的函数`必须`写注释
+ 工具类函数`推荐`加上参数、返回值的demo，或调用demo

### 工具类
推荐工具类能支持智能提示

### 交互
主要目的是：用户的任何操作要有及时的响应交互
+ **接口异常** `必须`处理，增加toast提示等
+ **提交表单** 按钮增加loading或置灰等避免多次触发
+ **接口调用** 列表页等页面加载数据时，增加loading效果、数据为空时样式

### API
+ 本地环境使用vite.config.ts里的proxy
+ mock/data.js可以在本地模拟api
+ 其他环境使用.env进行配置
+ 使用defineApi函数定义api，以便支持智能提示

## 五、CSS规范
### 1. 文件命名
入口样式；index.less
重置样式：reset.less (覆盖浏览器的默认行为)
定制的组件库样式：antd.less
变量文件：variables.less

### 2.类命名
类名采用BEM模式
+ 多个单词用单个中横线（-）连接
+ 父节点与子节点用单个下划线（_）连接， 如 search_title
+ 类的不同状态用两个中横线(--)连接，如 search--active
+ 父子层级不超过三级

### TailWind
推荐使用 tailwind，内置了功能类优先的原子class，用户可以直接在HTML通过操作tailwind提供的class来使用CSS，提升开发效率

## 六、Git规范
`husky`可以帮助我们在执行 git commit 提交的时候，通过监听不同阶段的hook进行自定义操作。如：提交前进行 eslint 规范进行修复代码。   
.husky目录下可配置hooks，已配置的有：
1. pre-commit：githooks 之一， 在 commit 提交前使用 tsc 和 eslint 对语法进行检测。
2. commit-msg：githooks 之一，在 commit 提交前使用 commitlint 对 commit 备注信息进行检测。

### 分支规范
每个分支的readme文件说明分支的目的
+ master： 主分支，对应线上部署
+ test: 用于当前测试
+ feature/：新需求的开发分支
+ dev/*：每个开发者的临时分支，需最终合并到feature

流程： dev -> feature -> test -> master

### 提交规范
#### 1. 提交格式
commit文案格式：提交类型： 提交内容描述 （备注：冒号后面空格）
``` git commit -m "feat: xxx" ```

***提交类型如下：***
1. 'feat', // 新功能 feature
2. 'fix', // 修复 bug
3. 'docs', // 文档注释
4. 'style', // 代码格式(不影响代码运行的变动)
5. 'refactor', // 重构(既不增加新功能，也不是修复 bug)
6. 'perf', // 性能优化
7. 'test', // 增加测试
8. 'chore', // 构建过程或辅助工具的变动
9. 'revert', // 回退
10. 'build' // 打包

#### 2. 提交命令 git cz
`Commitizen`是一个帮助我们编写规范 commit message 的工具，可全局安装。
git cz 代替 git commit 需要全局安装 pnpm i commitizen -g
使用参考： https://blog.csdn.net/weixin_47980825/article/details/127473686

### troubleshooting
+ git commit没有触发husky，在.git/config文件[core]下增加 hooksPath
```
[core]
  hooksPath = .husky
```

## 七、插件安装

EditorConfig，Prettier，ESLint，Volar，Tailwind CSS IntelliSense, Ant Design Vue helper

## 八、vite 配置说明

1. 配置页面获取全局变量 process.env
2. 配置路径别名 src 为@
3. 配置自动导入 vue， vue-router， pinia 中的 api，页面无需再做引用
4. 配置 ant 按需加载
5. 配置打包大文件拆分和静态资源分类打包
6. 本地下采用 proxy 代理方式
7. 支持 gzip 压缩 ng 需要配合
8. 可配置 cdn 加速

## 九、页面权限
### 全局禁用左侧菜单
可通过layout文件在系统级别彻底禁用左侧菜单

### 菜单权限
+ 顶部菜单由API获取；   
+ 左侧菜单通过API接口获取，支持多级菜单，支持数据增删改的权限
``` javascript
 // 菜单结构
 [{ 
  title: 'Demo',   // 菜单名称
  path: '/demo',   // url路径，父级菜单也需要设置
  icon: 'AccountBookFilled', // 对应ant design ICON
  children: [
    { 
      title: '搜素、表格及权限', 
      path: '/table', 
      actions: ['add', 'edit'，'delete']  // 用户’新增，编辑，删除‘等权限设置
    }
  ]
 }]
 ```