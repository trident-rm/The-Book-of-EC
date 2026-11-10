import type { NodeDefinition } from "#content/nodes.ts"

export default {
  id: "embedded.stm32-toolchains",
  title: "STM32 工具链",
  summary: "准备 STM32 编译工具链与 CubeMX，理解烧录和调试分工，并用 OpenOCD 识别目标芯片。",
  // hidden: true,
  prerequisites: ["c-cpp-engineering.build-systems"],
  parts: [
    { title: "总览与介绍", path: "intro.md" },
    { title: "工具安装、环境配置", path: "install.md" },
    { title: "VS Code 开发环境（示例）", path: "vscode.md" }
  ]
} satisfies NodeDefinition
