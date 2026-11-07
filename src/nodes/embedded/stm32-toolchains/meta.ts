import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "embedded.stm32-toolchains",
  title: "STM32 工具链",
  summary: "准备 STM32 编译工具链与 CubeMX，理解烧录和调试分工，并用 OpenOCD 识别目标芯片。",
  prerequisites: ["c-cpp-engineering.build-systems"],
  parts: [
    { title: "工具总览与学习目标", path: "intro.md" },
    { title: "编译工具链与 CubeCLT", path: "compilers.md" },
    { title: "STM32CubeMX", path: "cubemx.md" },
    { title: "烧录与 OpenOCD", path: "flashing.md" },
    { title: "调试工具如何配合", path: "debugging.md" },
    { title: "编辑器与其他工具", path: "other-tools.md" }
  ]
} satisfies NodeDefinition
