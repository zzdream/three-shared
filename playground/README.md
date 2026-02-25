# Playground — Three.js 共享库示例应用

本目录为 **three-shared** 仓库的示例应用（Playground），用于演示各共享包在实际项目中的用法，便于集成与二次开发参考。

---

## 说明

Playground 基于 **Vue 3 + Vite + Three.js**，串联以下能力：

- **@threejs-shared/core-engine**：场景、相机、渲染器、控制器、光照、地面/天空（含 HDR）
- **@threejs-shared/xodr**：XODR 地图加载、解析与道路/标线/对象/信号渲染
- **@threejs-shared/wasm**：OpenDRIVE WASM 桥接，道路与隧道等数据
- **@threejs-shared/three-adapter-182**：Three.js r182 的 HDR 环境适配
- **@threejs-shared/protobuf**：Proto 与 WebSocket、仿真回放定时

通过本示例可快速查看引擎初始化、XODR 加载与渲染、仿真回放等完整流程。

---

## 运行方式

在仓库根目录安装依赖后，进入 playground 启动开发服务：

```bash
# 仓库根目录
pnpm install

cd playground
pnpm dev
```

构建与预览：

```bash
pnpm build
pnpm preview
```

---

## 渲染效果图

运行上述 `pnpm dev` 后，在浏览器中打开对应地址即可看到 3D 场景与 XODR 地图渲染效果。下方为示例效果图（可将本地运行后的真实截图替换 `overview/playground-preview.png` 以展示实际渲染效果）：

![Playground 运行效果](./overview/playground-preview.png)

---

## 演示视频

可将页面渲染/回放过程录制成视频并提交到仓库，其他人 clone 或在 GitHub 上打开仓库即可观看。

- **存放位置**：将视频与预览图统一放在本目录下的 `overview/` 中，例如 `playground/overview/video.mov`、`playground/overview/playground-preview.png`，提交并 push 到 GitHub。
- **观看方式**：在 GitHub 仓库中点击该文件即可在线播放；README 中链接为：
  - 视频已添加时：[观看演示视频](./overview/video.mov)

**录制方式**：使用系统录屏（如 macOS 的 QuickTime「文件 → 新建屏幕录制」、Windows 游戏栏 Win+G）或 [OBS](https://obsproject.com/) 录制浏览器中的 Playground 页面，导出为 MP4 后放入 `overview/video.mov` 并 `git add`、`git commit`、`git push`。若视频大于约 100MB，需使用 [Git LFS](https://git-lfs.github.com/) 或上传到 GitHub Releases 的附件中再在 README 里贴链接。

---

## 与各包文档的对应关系

- 引擎与地面/天空：[core-engine.md](../docs/packages/core-engine.md)
- XODR 加载与渲染：[xodr.md](../docs/packages/xodr.md)
- WASM 与 OpenDRIVE：[wasm.md](../docs/packages/wasm.md)
- Proto 与回放：[protobuf.md](../docs/packages/protobuf.md)
- HDR 适配器：[adapters.md](../docs/packages/adapters.md)
