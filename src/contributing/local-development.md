---
title: 本地开发
prev: false
next: false
---

# 本地开发

项目使用全局 Vite+（`vp`）管理运行环境、依赖和脚本，站点由 VitePress 构建。先按 [Vite+ 官方安装指南](https://viteplus.dev/guide/)安装 `vp`，再在仓库根目录运行：

```sh
vp install
vp run dev
```

Node.js 版本要求和底层 pnpm 版本分别由 `package.json` 的 `engines.node`、`packageManager` 声明。运行 `vp env current` 可查看当前解析出的版本及其来源。

提交前运行：

```sh
vp run fmt
vp run check
vp run build
```

检查格式化结果后再提交。`check` 依次运行独立的 Oxfmt 格式检查、Oxlint 规则检查和 `vue-tsc` 类型检查；`build` 验证学习图内容与内部链接并构建站点。

这里的命令均通过 `vp run` 执行 `package.json` 中的项目脚本，保留现有检查配置和 VitePress 构建流程。
