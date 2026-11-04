/** 学习节点由浅入深的层级顺序。 */
export const levels = ["intro", "core", "advanced", "integration"] as const

/** 节点可选的学习层级。 */
export type Level = (typeof levels)[number]

export const levelLabels: Record<Level, string> = {
  intro: "入门",
  core: "核心",
  advanced: "进阶",
  integration: "综合"
}

/** 节点可标注的概念词表。 */
export const concepts = [
  "array",
  "asynchronous-programming",
  "build-system",
  "bus-topology",
  "clock",
  "compilation",
  "concurrency",
  "CRC",
  "debugging",
  "DMA",
  "driver",
  "environment-variable",
  "error-handling",
  "feedback",
  "filesystem",
  "frame",
  "GPIO",
  "interrupt",
  "latency",
  "lifetime",
  "linking",
  "logic-level",
  "memory",
  "object",
  "ownership",
  "PID",
  "pinmux",
  "pointer",
  "power",
  "priority",
  "process",
  "protocol",
  "reset",
  "saturation",
  "sampling",
  "shared-state",
  "shell",
  "standard-stream",
  "startup",
  "state-estimation",
  "synchronization",
  "timer",
  "undefined-behavior",
  "version-control"
] as const

/** 概念词表中的合法值。 */
export type Concept = (typeof concepts)[number]

/** 节点可标注的技术词表。 */
export const technologies = [
  "C",
  "C++",
  "CAN",
  "Cargo",
  "Clang",
  "CMake",
  "Cortex-M",
  "Embassy",
  "FreeRTOS",
  "GCC",
  "Git",
  "GitHub",
  "I2C",
  "IMU",
  "Linux",
  "Make",
  "MCU",
  "motor",
  "MSVC",
  "Ninja",
  "PowerShell",
  "probe-rs",
  "RoboMaster",
  "Rust",
  "shell",
  "SPI",
  "STM32",
  "UART",
  "Windows"
] as const

/** 技术词表中的合法值。 */
export type Technology = (typeof technologies)[number]
