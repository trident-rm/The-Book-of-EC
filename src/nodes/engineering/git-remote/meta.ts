import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "engineering.git-remote",
  title: "Git 远程仓库与 GitHub 协作",
  summary: "连接远程仓库、同步分支，并通过 Fork 和 Pull Request 协作。",
  relations: [{ target: "engineering.git-basics", type: "required" }],
  parts: [
    { title: "Introduction", path: "intro.md" },
    { title: "连接远程仓库", path: "remotes.md" },
    { title: "同步仓库", path: "sync.md" },
    { title: "Fork 与 Pull Request", path: "collaboration.md" }
  ]
} satisfies NodeDefinition
