import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "embedded.stm32-toolchains",
  title: "STM32 工具链",
  summary: "STM32 工具链与开发环境",
  prerequisites: ["c-cpp-engineering.build-systems"],
  parts: [{ title: "STM32 工具链与开发环境", path: "intro.md" }]
} satisfies NodeDefinition
