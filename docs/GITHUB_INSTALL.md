# three-shared 通过 GitHub 安装指南

## 一、包列表与子路径

| 包名 | 子路径 | 说明 |
|------|--------|------|
| `@shared/core-engine` | `packages/core-engine` | Three.js 引擎核心 |
| `@shared/xodr` | `packages/xodr` | XODR 解析与渲染 |
| `@shared/wasm` | `packages/wasm` | WASM 相关 |
| `@shared/protobuf` | `packages/protobuf` | Protobuf 管理 |
| `@shared/three-adapter-157` | `packages/adapters/three-157` | Three.js r157 适配器 |
| `@shared/three-adapter-182` | `packages/adapters/three-182` | Three.js r182 适配器 |

## 二、依赖关系

```
@shared/wasm          (无内部依赖)
@shared/core-engine   → @shared/xodr
@shared/xodr          → @shared/core-engine, @shared/wasm
@shared/protobuf      → @shared/xodr
@shared/three-adapter-157  → @shared/core-engine
@shared/three-adapter-182  → @shared/core-engine
```

**安装时需按依赖顺序，或一次性安装所需全部包。** 推荐：使用 three 0.182 时安装一组，使用 0.157 时安装另一组。

---

## 三、GitHub 仓库准备

### 3.1 创建 GitHub 仓库

1. 在 GitHub 创建仓库，如：`https://github.com/你的用户名/three-shared`
2. 本地添加 remote 并推送：

```bash
cd /path/to/three-shared
git remote add github git@github.com:你的用户名/three-shared.git
git push -u github master
# 或
git push -u github main
```

### 3.2 打 Tag 发版

```bash
# 打 tag
git tag v0.1.0

# 推送到 GitHub
git push github v0.1.0
```

### 3.3 从 Gitee 同步到 GitHub（可选）

若主仓库在 Gitee，可设 GitHub 为镜像，发版时同步：

```bash
git remote add github git@github.com:你的用户名/three-shared.git
git push github master
git push github v0.1.0
```

或用 GitHub Actions 做自动镜像（见下节）。

---

## 四、各项目安装方式

### 4.1 完整安装（Three.js 0.182 场景，如 playground）

```bash
pnpm add "@shared/core-engine@github:你的用户名/three-shared#v0.1.0:packages/core-engine" \
  "@shared/xodr@github:你的用户名/three-shared#v0.1.0:packages/xodr" \
  "@shared/wasm@github:你的用户名/three-shared#v0.1.0:packages/wasm" \
  "@shared/protobuf@github:你的用户名/three-shared#v0.1.0:packages/protobuf" \
  "@shared/three-adapter-182@github:你的用户名/three-shared#v0.1.0:packages/adapters/three-182"
```

### 4.2 单包安装

```bash
# 核心
pnpm add "@shared/core-engine@github:你的用户名/three-shared#v0.1.0:packages/core-engine"

# XODR
pnpm add "@shared/xodr@github:你的用户名/three-shared#v0.1.0:packages/xodr"

# WASM
pnpm add "@shared/wasm@github:你的用户名/three-shared#v0.1.0:packages/wasm"

# Protobuf
pnpm add "@shared/protobuf@github:你的用户名/three-shared#v0.1.0:packages/protobuf"

# 适配器 - Three 0.182
pnpm add "@shared/three-adapter-182@github:你的用户名/three-shared#v0.1.0:packages/adapters/three-182"

# 适配器 - Three 0.157
pnpm add "@shared/three-adapter-157@github:你的用户名/three-shared#v0.1.0:packages/adapters/three-157"
```

### 4.3 写入 package.json

```json
{
  "dependencies": {
    "@shared/core-engine": "github:你的用户名/three-shared#v0.1.0:packages/core-engine",
    "@shared/xodr": "github:你的用户名/three-shared#v0.1.0:packages/xodr",
    "@shared/wasm": "github:你的用户名/three-shared#v0.1.0:packages/wasm",
    "@shared/protobuf": "github:你的用户名/three-shared#v0.1.0:packages/protobuf",
    "@shared/three-adapter-182": "github:你的用户名/three-shared#v0.1.0:packages/adapters/three-182"
  }
}
```

---

## 五、版本说明

- `v0.1.0` 替换为实际 tag，如 `v0.2.0`
- 使用分支：把 `#v0.1.0` 换成 `#master` 或 `#main`
- 使用 commit：`#abc1234`（前 7 位 commit hash）

---

## 六、Peer 依赖

安装后需保证项目中有对应版本的 `three`：

- `@shared/three-adapter-182`：`three@0.182.x`
- `@shared/three-adapter-157`：`three@0.157.x`
- 其他：`three@>=0.157.0`

```bash
pnpm add three@0.182.0
```

---

## 七、Gitee → GitHub 自动同步（可选）

在 three-shared 根目录新建 `.github/workflows/sync-to-github.yml`：

```yaml
name: Sync to GitHub

on:
  push:
    tags:
      - 'v*'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Push to GitHub
        run: |
          git remote add github https://${{ secrets.GH_TOKEN }}@github.com/你的用户名/three-shared.git || true
          git push github ${{ github.ref_name }}
```

在 GitHub 仓库 Settings → Secrets 中配置 `GH_TOKEN`（有 repo 权限的 Personal Access Token）。  
每次在 Gitee 打 `v*` tag 并 push 后，由 Gitee 的 webhook 或定期任务触发该 workflow，将 tag 同步到 GitHub（具体触发方式按你实际 CI 调整）。

---

## 八、常见问题

### workspace:* 解析失败

包内使用 `workspace:*` 时，在非 monorepo 项目中可能解析失败。若出现依赖找不到，可尝试：

1. 一次性安装所有用到的 `@shared/*` 包，保证它们在 node_modules 中
2. 若仍有问题，可在 three-shared 发布前增加脚本，将 `workspace:*` 替换为 `^0.1.0` 等版本范围

### 国内网络

GitHub 较慢时，可配置镜像或代理，例如：

```bash
git config --global url."https://mirror.ghproxy.com/https://github.com/".insteadOf "https://github.com/"
```

或使用 VPN/代理。
