import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "engineering.shell-basics",
  title: "命令行基础",
  summary: "命令结构、文件导航、工具解析、运行环境与包管理常识。",
  level: "intro",
  estimatedTime: "3h",
  concepts: ["shell", "process", "filesystem", "environment-variable"],
  technologies: ["Windows", "Linux", "PowerShell", "shell"],
  relations: [],
  parts: [
    { title: "Introduction", path: "intro.md" },
    { title: "交互式 Shell 的基本操作", path: "interaction.md" },
    { title: "命令、参数与工具探查", path: "commands.md" },
    { title: "目录、路径与文件操作", path: "filesystem.md" },
    { title: "环境变量、PATH 与命令运行", path: "environment.md" },
    { title: "包管理器与环境管理常识", path: "package-management.md" }
  ]
} satisfies NodeDefinition
