# three-shared 发布流程

首次发布前先登录：`npm login`，确认：`npm whoami`。scope 包发布时需加 `--access public`。

---

## 一、统一发布（一次发布所有包）

会发布所有 `@threejs-shared/*` 包（含 `cache-db`、`core-engine`、`xodr` 等），pnpm 按依赖顺序发布，无需单独先发 cache-db。

在**仓库根目录**执行：

```bash
# 1. 升版（patch=小版本 / minor=中版本 / major=大版本，选一个）
pnpm --filter '@threejs-shared/*' exec -- npm version patch --no-git-tag-version
# 或把 patch 换成 minor / major

# 2. 构建并发布
pnpm run publish:packages
```

按提示确认版本即可。

---

## 二、单包发布（只发布一个包）

在**仓库根目录**执行，把 `<包名>` 换成下面列表里的实际包名（如 `core-engine`、`xodr`）：

```bash
# 1. 升版
pnpm --filter @threejs-shared/<包名> exec -- npm version patch --no-git-tag-version

# 2. 构建
pnpm --filter @threejs-shared/<包名> run build

# 3. 发布
pnpm --filter @threejs-shared/<包名> publish --no-git-checks --access public
```

**可发布包名**：`cache-db`、`core-engine`、`wasm`、`xodr`、`protobuf`、`three-adapter-157`、`three-adapter-182`。

若该包依赖同仓库其它包，需先保证依赖包已发布到 npm。
