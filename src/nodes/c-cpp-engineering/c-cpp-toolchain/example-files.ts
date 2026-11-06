import type { CodeTreeFile } from "../../../.vitepress/theme/components/CodeTree.vue"

export const sourceFiles = [
  { path: "include/calc.h", slot: "header" },
  { path: "src/calc.c", slot: "calc" },
  { path: "src/main.c", slot: "main" }
] satisfies readonly CodeTreeFile[]

export const makeFiles = [
  ...sourceFiles,
  { path: "Makefile", slot: "makefile" }
] satisfies readonly CodeTreeFile[]

export const cmakeFiles = [
  ...sourceFiles,
  { path: "CMakeLists.txt", slot: "cmake" }
] satisfies readonly CodeTreeFile[]

export const commandRunnerFiles = [
  ...cmakeFiles,
  { path: "Makefile", slot: "makefile" }
] satisfies readonly CodeTreeFile[]
