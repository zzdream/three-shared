#!/bin/bash
# three-shared 发版脚本：打 tag 并推送到 Gitee 和 GitHub
# 用法: ./scripts/release.sh v0.1.0

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "用法: ./scripts/release.sh <版本号>"
  echo "示例: ./scripts/release.sh v0.1.0"
  exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  有未提交的更改，请先 commit"
  git status --short
  exit 1
fi

echo "📦 创建 tag: $VERSION"
git tag "$VERSION"

echo ""
echo "请执行以下命令推送到远程："
echo ""
echo "  # 推送到 Gitee"
echo "  git push origin $VERSION"
echo ""
echo "  # 推送到 GitHub（若已配置 github remote）"
echo "  git push github $VERSION"
echo ""
echo "或一次推送两个："
echo "  git push origin $VERSION && git push github $VERSION"
echo ""

read -p "是否立即推送到 origin？[y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push origin "$VERSION"
  if git remote get-url github &>/dev/null; then
    read -p "是否推送到 GitHub？[y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git push github "$VERSION"
    fi
  fi
fi

echo ""
echo "✅ 完成！其他项目可安装："
echo "  pnpm add \"@shared/core-engine@github:zzdream/three-shared#$VERSION:packages/core-engine\""
echo "  详见 docs/GITHUB_INSTALL.md"
