<script setup lang="ts">
import ToolConnectionDiagram from "./components/ToolConnectionDiagram.vue"
</script>

# 介绍

本章介绍 STM32 开发会用到的基本软件和环境。

## 1. 模板代码生成

嵌入式工程涉及到许多底层芯片、外设配置，这部分代码一般复杂繁琐、容易出错，所以通常使用一些图形化软件来生成模板代码（当然也并非不能完全自己手写）。

ST 官方为 STM32 系列芯片提供了 [STM32CubeMX](https://www.st.com/zh/development-tools/stm32cubemx.html) 工具，支持图形化配置芯片、外设和中间件，生成初始化代码和工程文件。

## 2. 编译工具链

STM32 是基于 Arm Cortex-M 内核的系列微控制器，需要支持 Arm 架构的交叉编译工具链。

国内嵌入式教学一般使用盗版的旧 Keil MDK 作为 IDE，其使用的 AC5 工具链十分老旧，C 标准支持有限，且不再更新。我们推荐使用开源的 GNU Tools for STM32 或 ST Arm Clang 工具链，这二者也被 STM32CubeMX 支持。

以下是一些常见的工具链：

### Arm GNU Toolchain

Arm GNU Toolchain 是 Arm 集成、验证并发布的 GNU 工具链，统一了原 GNU Arm Embedded Toolchain 和面向 A-profile 的发行线。

- [Arm 官方介绍](https://developer.arm.com/Tools%20and%20Software/GNU%20Toolchain)
- 免费开源、社区支持，适合跨厂商 Arm MCU 开发；STM32 使用 `arm-none-eabi` 裸机版本。
- 编译入口：`arm-none-eabi-gcc`、`arm-none-eabi-g++`
- GNU Binutils 提供汇编器 `arm-none-eabi-as`、链接器 `arm-none-eabi-ld` 等工具
- 链接脚本：[GNU ld 语法](https://sourceware.org/binutils/docs/ld/Scripts.html)（`.ld`）
- 目标库：Newlib（C 标准库）、Newlib-nano（精简版）、libstdc++（C++ 标准库）、libgcc
- 配套调试客户端：`arm-none-eabi-gdb`

`none` 指裸机、无操作系统；`eabi` 指 Embedded ABI（嵌入式应用二进制接口）。

### GNU Tools for STM32

GNU Tools for STM32 是 ST 维护的 GNU 工具链发行版，基于 Arm GNU Toolchain 的源码构建，并加入面向嵌入式开发和 STM32 工具集成的补丁。

- [ST 官方源码仓库](https://github.com/STMicroelectronics/gnu-tools-for-stm32)
- 核心组件开源，常用于 STM32CubeIDE 和 STM32CubeCLT 配套的工程。
- 编译入口：`arm-none-eabi-gcc`、`arm-none-eabi-g++`
- GNU Binutils 提供汇编器 `arm-none-eabi-as`、链接器 `arm-none-eabi-ld` 等工具
- 链接脚本：[GNU ld 语法](https://sourceware.org/binutils/docs/ld/Scripts.html)（`.ld`）
- 目标库：Newlib（C 标准库）、Newlib-nano（精简版）、libstdc++（C++ 标准库）、libgcc
- 配套调试客户端：`arm-none-eabi-gdb`

### ST Arm Clang

ST Arm Clang 是 ST 基于开源 LLVM / Clang 和 Arm Toolchain for Embedded 制作的 STM32 工具链，提供 Hybrid 和 Full LLVM 两种组合。

- [ST Arm Clang 官方说明](https://dev.st.com/stm32cube-docs/stm32cubeide-vscode/latest/en/docs/markup/basic_concepts/starm-clang.html)
- 可随 STM32CubeCLT 免费获取，用于 STM32 的 Clang 编译及 GNU 工程迁移。
- 编译入口：`starm-clang`、`starm-clang++`，内置汇编器
- Hybrid：使用 GNU `ld`、Newlib / Newlib-nano、libstdc++、libgcc，需同时安装 GNU 工具链。
- Full LLVM：使用 `starm-lld`、LLVM 运行时、libc++，C 库可选 Newlib 或 Picolibc。
- 链接脚本：Hybrid 用 GNU ld 语法；Full LLVM 用 [LLD 的 GNU 风格语法](https://lld.llvm.org/ELF/linker_script.html)，均常用 `.ld`，但两者存在兼容性差异。
- 链接时优化（LTO）：仅 Full LLVM 组合支持。

### Arm Toolchain for Embedded（ATfE）

Arm Toolchain for Embedded 是 Arm 发布的新一代 LLVM 嵌入式工具链，承接 LLVM Embedded Toolchain for Arm 项目。

- [Arm 官方介绍](https://developer.arm.com/Tools%20and%20Software/Arm%20Toolchain%20for%20Embedded)、[源码与组件说明](https://github.com/arm/arm-toolchain/blob/arm-software/arm-software/embedded/README.md)
- 面向 Arm 裸机开发；社区版免费开源，Professional 版提供 Arm 商业支持。
- 编译入口：`clang`、`clang++`，内置汇编器
- 链接器：LLD；辅助工具来自 LLVM。
- 链接脚本：[LLD 的 GNU ld 风格语法](https://lld.llvm.org/ELF/linker_script.html)（`.ld`），与 GNU ld 存在兼容性差异。
- 目标库：Picolibc / LLVM libc 等 C 库、libc++（C++ 标准库）、compiler-rt（运行时）；具体组合依发行版与配置而定。

### Arm Compiler 5（AC5）

Arm Compiler 5 是 Arm 的旧一代编译工具链，承接早期 RealView Compilation Tools（RVCT）工具体系。

- [AC5 用户手册](https://www.keil.com/support/man/docs/armcc/default.htm)
- 商业专有工具链，常见于旧 Keil MDK 工程。
- 编译入口：`armcc`
- 汇编器：`armasm`；链接器：`armlink`
- 链接脚本：[Arm 散布文件](https://www.keil.com/support/man/docs/uv4/uv4_dg_adsld.asp)（scatter file，`.sct`）
- 目标库：Arm C/C++ 库，C 库可选 Microlib（精简版）
- 辅助工具：`armar`（静态库管理）、`fromelf`（映像查看与转换）

### Arm Compiler 6（AC6）

Arm Compiler 6 用基于 LLVM / Clang 的 `armclang` 接替 AC5 的 `armcc`，后来称 Arm Compiler for Embedded。

- [Arm 官方迁移指南](https://documentation-service.arm.com/static/6526b901865a6e5928044f86)
- 基于开源编译器技术的商业工具链，常用于 Keil MDK 和 Arm Development Studio；链接器和库仍含专有组件。
- 编译入口：`armclang`，内置汇编器
- 链接器：`armlink`
- 链接脚本：沿用 AC5 的 [Arm 散布文件](https://www.keil.com/support/man/docs/uv4/uv4_dg_adsld.asp)（`.sct`）
- 目标库：Arm C/C++ 库，C 库可选 Microlib（精简版）
- 从 AC5 迁移时，需核对编译选项、语言扩展和内嵌汇编的差异。

### IAR Arm 工具链

IAR Arm 工具链由 IAR 开发，随 IAR Embedded Workbench for Arm（EWARM）或独立的 IAR Build Tools 提供。

- [IAR 工具总览](https://docs.iar.com/ewarm/10.1x/en/iar-c-c---development/introduction-to-the-iar-build-tools/the-iar-build-tools-an-overview.html)
- 商业授权，常用于 IAR 工程及需要厂商支持的产品开发。
- 编译入口：`iccarm`
- 汇编器：`iasmarm`；链接器：`ilinkarm`
- 链接脚本：[ILINK 链接配置文件](https://docs.iar.com/ewarm/10.1x/en/iar-c-c---development/the-linker-configuration-file/overview-of-the-linker-configuration-file.html)（`.icf`）
- 目标库与运行时：DLIB
- 配套调试器：C-SPY（随 EWARM 提供）

## 3. 构建系统

Keil MDK、IAR EWARM 等 IDE 内置了构建系统，使用它们可以直接在 IDE 中完成编译、链接和烧录，但它们绑定 IDE 和工具链。

我们推荐使用 CMake 配合 Ninja 管理构建，它现代化、兼容性更好、自定义程度高、可移植性更强。

## 4. 烧录与调试

嵌入式项目构建得到的 ELF、BIN 或 HEX 文件可供烧录工具读取，将程序写入 STM32 的 Flash。下面展示通过**调试探针**连接的常见方式，Host（主机）指运行开发工具的电脑。

**烧录工具**控制探针完成擦除、写入与校验：

<ToolConnectionDiagram mode="flashing" />

**调试客户端**提供断点、单步和变量查看等功能；**调试服务器**接收请求，并通过探针访问目标：

<ToolConnectionDiagram mode="debugging" />

不同的探针产品使用不同的协议，于是所需的上位机（Host）烧录/调试工具也不同：

| 设备／模式                                             | Host ↔ Probe 协议                                                       |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| ST-LINK，运行官方固件                                  | ST-LINK 专用协议                                                        |
| J-Link，默认模式                                       | J-Link 专用协议                                                         |
| 支持 CMSIS-DAP 模式的 J-Link，切换后                   | [CMSIS-DAP](https://arm-software.github.io/CMSIS-DAP/latest/index.html) |
| [DAPLink 固件](https://github.com/ARMmbed/DAPLink)探针 | CMSIS-DAP                                                               |

[OpenOCD](https://openocd.org/) 分别适配这些协议，所以 ST-LINK、J-Link 和 CMSIS-DAP 兼容探针它都能控制。
