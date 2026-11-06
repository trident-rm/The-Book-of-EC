import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "engineering.c-cpp-toolchain",
  title: "C/C++ 工具链与构建流程",
  summary: "标准与实现、编译产物、多文件与静态库，以及 Make、CMake 和增量构建。",
  prerequisites: ["engineering.shell-basics"],
  parts: [
    { title: "学习目标与准备", path: "intro.md" },
    { title: "标准、实现与工具链", path: "toolchains.md" },
    { title: "编译指令和构建流程", path: "single-file.md" },
    { title: "多文件构建", path: "multi-file.md" },
    { title: "构建系统：Makefile、CMake", path: "build-systems.md" }
  ]
} satisfies NodeDefinition
