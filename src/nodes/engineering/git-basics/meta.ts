import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "engineering.git-basics",
  title: "Git 基础",
  summary: "版本管理、仓库、commit 与分支基础。",
  relations: [{ target: "engineering.shell-basics", type: "recommended" }],
  parts: [
    { title: "Introduction", path: "intro.md" },
    { title: "首次 Git 配置", path: "setup.md" },
    { title: "创建仓库", path: "repositories.md" },
    { title: "创建 commit", path: "commits.md" },
    { title: "分支", path: "branches.md" },
    { title: "使用 .gitignore 文件", path: "gitignore.md" }
  ]
} satisfies NodeDefinition
