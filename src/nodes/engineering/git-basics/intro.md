<script setup lang="ts">
import GitDiagram from "#nodes/engineering/_shared/components/GitDiagram.vue"
</script>

# Git 基础

先修：[命令行基础](../shell-basics/intro)。本节点使用终端运行 Git 命令，并用 `mkdir`、`cd` 等命令操作工作目录。

Git 是版本管理工具。它把项目的不同状态组织成可以查看、切换和并行发展的版本历史。

<GitDiagram kind="uses" />

只有创建 commit 后，Git 才会保存对应版本；普通的文件修改不会自动成为版本记录。

## 学习路线

1. [首次 Git 配置](./setup)：让 Git 能够记录你的提交身份。
2. [创建仓库](./repositories)：用 `git init` 创建仓库，或用 `git clone` 获取已有仓库。
3. [创建 commit](./commits)：理解工作区、暂存区和本地仓库，完整保存一次修改。
4. [分支](./branches)：认识并行工作线与合并，并自行选择一套常用命令。
5. [.gitignore](./gitignore.md)：使用 `.gitignore` 排除特定文件。
