import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "embedded.emb-c-basics",
  title: "C 语言嵌入式基础",
  summary: "使用 STM32 HAL 库进行嵌入式 C 开发。",
  prerequisites: ["embedded.stm32-toolchains"],
  parts: [{ title: "介绍", path: "intro.md" }]
} satisfies NodeDefinition
