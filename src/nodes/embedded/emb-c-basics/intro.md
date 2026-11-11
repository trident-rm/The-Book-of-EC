# C 语言嵌入式基础

一块开发板最核心的结构层级是怎样的？

以 ST 的 NUCLEO-F401RE 开发板为例，它的关键层级可见下图：

![开发板拆解图](assets/dev-board.png)

开发板上有众多设备，其中最核心的便是 MCU，也称单片机。NUCLEO-F401RE 开发板上使用的 MCU 是 STM32F401RE，它是 ST 公司生产的一款 32 位 ARM Cortex-M4 内核的微控制器。Cortex-M4 是 Arm 公司设计的处理器内核，它实现了 Armv7E-M 架构规范。
