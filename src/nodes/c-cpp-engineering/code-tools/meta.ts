import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "c-cpp-engineering.code-tools",
  title: "C/C++ 代码辅助工具",
  summary: "认识语言服务、代码格式化、静态检查与头文件依赖整理，按需求选择工具。",
  prerequisites: ["c-cpp-engineering.c-cpp-toolchain"],
  parts: [
    { title: "语言服务", path: "language-services.md" },
    { title: "格式化与代码检查", path: "formatting-and-checks.md" }
  ]
} satisfies NodeDefinition
