# 基础篇

写代码来操控 MCU 和外设的本质就是通过读写 CPU 和外设各自的寄存器来控制它们。

观看下面两则视频，了解相关概念：

> 只需快速看一遍，初步了解相关概念即可；可倍速观看，无需深究细节或实操跟做。

- [Bilibili - 寄存器映射](https://www.bilibili.com/video/BV1Vt411X7PK/?p=4)
- [Bilibili - C 语言寄存器封装](https://www.bilibili.com/video/BV1Vt411X7PK/?p=5)

业务代码中如果仍然直接操作寄存器，代码可读性和可维护性会很差。所以通常会把寄存器的读写操作按照语义封装成函数或宏，然后在业务代码中调用这些函数或宏来实现对 MCU 和外设的控制。HAL (Hardware Abstraction Layer) 就是这种封装的一个典型例子。接下来，我们将使用 ST 官方提供的 HAL 库来学习 MCU 和外设的控制。

::: warning 关于开发环境
以下提供的外部学习资料可能各自使用不同工具链和开发环境。请你在学习过程中统一使用 [STM32 工具链和开发环境](../stm32-toolchains/intro.md)中介绍的工具链和开发环境，即以下两种二选一：

- STM32CubeMX + `arm-none-eabi-gcc` + CMake + OpenOCD
- STM32CubeMX + `arm-none-eabi-gcc` + EIDE (VS Code) + OpenOCD

请自行注意外部材料所用的工具链和开发环境与上述两种工具链和开发环境的差异，并完成相应的迁移和适配工作。
:::

#### C 板官方文档

[入口链接](https://www.robomaster.com/zh-CN/products/components/general/development-board-type-c#downloads)

这不是教程，而是 C 板的官方数据手册、原理图等资料。

开发中经常需要查询这些资料来了解 MCU 和外设的功能、寄存器映射、引脚分配等信息。

#### C 板官方教程

[RoboMaster 开发板 C 型嵌入式软件教程文档](https://github.com/RoboMaster/Development-Board-C-Examples/blob/master/RoboMaster%E5%BC%80%E5%8F%91%E6%9D%BFC%E5%9E%8B%E5%B5%8C%E5%85%A5%E5%BC%8F%E8%BD%AF%E4%BB%B6%E6%95%99%E7%A8%8B%E6%96%87%E6%A1%A3.pdf)

官方 C 板嵌入式软件入门教程。

有针对 C 板、比较详细的 **CubeMX 配置步骤**，推荐参考。但是注意 CubeMX 的 Project 配置部分，应当选择我们需要工具链，而不是教程中使用的 Arm Keil MDK。

建议跳过 0.4.3 和 0.4.4 节。

### 顺序学习：

#### 0. C 语言基础

开始之前，请确保你已经掌握了 C 语言基础知识。

#### 1. 同济大学 SuperPower 战队 2025 电控组培训

[视频合集](https://www.bilibili.com/video/BV1d8pbesEKV)

**学习第一到三课**，结合 [C 板官方教程文档](#c-板官方教程)。

基于 C 板的培训视频。开发环境使用 CubeMX + CMake + VS Code，和我们推荐的工具链和开发环境较为接近。

但是他们可能会使用一部分 C++。我们还是推荐优先使用 C 语言，因为工程模板、基础库等都是 C 语言的，C/C++ 混合编程会增加学习难度。

#### 2. 中科大 RM 电控合集

[视频合集](https://www.bilibili.com/video/BV1hQ4y167ri)

**学习 2.2 到 3.12 节**，可跳过第 3.1 节。再后续的部分作为进阶内容，可自行学习。

相比于同济的培训视频，中科大的教程更详细、更深入，作为第二阶段的学习资料。

但是使用环境与我们的差异较大，硬件和软件都不相同，需注意迁移和适配。他们一开始使用 STM32F401CCU 的最小系统板，后又换为基于 STM32F427IIH 的某开发板。需注意和 C 板（STM32F407IGH6）之间的硬件差异。请结合 C 板官方教程文档和相关数据手册学习迁移到 C 板上。
