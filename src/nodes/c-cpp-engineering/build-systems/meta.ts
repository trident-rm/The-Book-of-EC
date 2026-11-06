import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "c-cpp-engineering.build-systems",
  title: "构建系统：Make 与 CMake",
  summary: "用 Make 和 CMake 管理依赖与增量构建，用 Preset 保存配置，并编排构建任务。",
  prerequisites: ["c-cpp-engineering.c-cpp-toolchain"],
  parts: [
    { title: "学习目标与准备", path: "intro.md" },
    { title: "Makefile：记录依赖和命令", path: "make.md" },
    { title: "CMake：用目标描述工程", path: "cmake.md" },
    { title: "自主实验", path: "exercises.md" }
  ]
} satisfies NodeDefinition
