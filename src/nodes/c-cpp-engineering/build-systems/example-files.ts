import type { CodeTreeFile } from "../../../.vitepress/theme/components/CodeTree.vue"

import { sourceFiles } from "../_shared/example-files.ts"

export const makeFiles = [
  ...sourceFiles,
  { path: "Makefile", slot: "makefile" }
] satisfies readonly CodeTreeFile[]

export const cmakeFiles = [
  ...sourceFiles,
  { path: "CMakeLists.txt", slot: "cmake" }
] satisfies readonly CodeTreeFile[]

export const presetFiles = [
  ...cmakeFiles,
  { path: "CMakePresets.json", slot: "presets" }
] satisfies readonly CodeTreeFile[]

export const commandRunnerFiles = [
  ...presetFiles,
  { path: "Makefile", slot: "makefile" }
] satisfies readonly CodeTreeFile[]
