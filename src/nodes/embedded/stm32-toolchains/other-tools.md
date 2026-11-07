# 编辑器与其他工具

编辑器可以调用本节点准备的构建、烧录和调试工具。更换编辑器通常只需重新组织这些入口；更换编译工具链或工程管理方式，则还要核对目标参数、库、链接脚本和构建配置。

## 编辑器如何接入现有工具

以 VS Code 为例，几个常见扩展分别接入不同环节：

| 扩展或工具                                                     | 主要职责                                            | 仍需提供的外部工具或配置                 |
| -------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| [CMake Tools](https://github.com/microsoft/vscode-cmake-tools) | 选择 Preset、配置工程、调用构建                     | CMake、生成器和工程选定的编译工具链      |
| [Cortex-Debug](https://github.com/Marus/cortex-debug)          | 提供 Cortex-M 等目标的调试界面，调用 GDB 和调试服务 | GDB、OpenOCD 等服务、ELF、探针及目标配置 |
| [clangd](https://clangd.llvm.org/installation) 及其编辑器扩展  | 提供补全、诊断、跳转等语言服务                      | 文件的编译参数、头文件路径、宏和目标信息 |

安装扩展后，仍应确认它调用的可执行文件路径和参数与命令行自检一致。扩展可以协助获取或配置工具，但界面中出现了构建、调试按钮，不等于所有外部工具已经准备完成。

### 语言服务为什么需要工程配置

同一个 `#include`、宏或类型，在不同编译参数下可能有不同含义。clangd 需要知道目标架构、包含目录和宏定义，才能按工程的实际环境分析代码；它给出的编辑器诊断不等于构建已经执行。

示例的 `.clangd` 指定从 `build/Debug` 寻找编译数据库。工程配置后，CMake 可以在构建目录生成 `compile_commands.json`，记录各源文件使用的编译命令，供 clangd 等工具读取。在尚未生成该文件，或数据库仍对应旧配置时，语言服务可能找不到头文件或选错条件编译分支。[clangd 的编译命令说明](https://clangd.llvm.org/design/compile-commands)解释了这些参数如何影响分析。

本节点先认识这条关系；具体编辑器配置随同后续工程实操完成。

## 经典 IDE 与工程集成方案

下面这些工具用于理解旧工程和外部教程，团队主线不要求安装它们。

| 工具                                                                                            | 提供了什么                                                                    | 阅读相关工程时重点看什么                                                        |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [Keil MDK / µVision](https://developer.arm.com/Tools%20and%20Software/Keil%20MDK)               | MDK 开发套件包括编译工具、库和开发环境；经典 µVision 集成编辑、工程管理与调试 | `.uvprojx` 等工程配置、选用的 Arm 编译器版本、器件支持包与调试设置              |
| [IAR Embedded Workbench](https://www.iar.com/embedded-development-tools/iar-embedded-workbench) | 集成编译器、汇编器、链接器和 C-SPY 调试器等工具                               | `.ewp` 等工程文件、IAR 编译器与库、链接配置和调试设置                           |
| [STM32CubeIDE](https://www.st.com/en/development-tools/stm32cubeide.html)                       | ST 的集成开发环境，提供编辑、构建与调试入口                                   | 使用 Eclipse 版还是 VS Code 版，以及工程实际选择的工具链与构建方式              |
| [EIDE](https://em-ide.com/docs/intro/)                                                          | VS Code 的嵌入式工程扩展，管理工程并调用外部编译、烧录工具                    | EIDE 工程配置、编译器路径、构建与烧录器选择；调试由 Cortex-Debug 等扩展配合提供 |

Keil MDK、µVision 和 Arm 编译器属于不同层次。当前 MDK 也提供基于 VS Code 的 Keil Studio；经典 µVision 运行于 Windows，不能据此推断整个 MDK 套件只有 Windows 方案。ST Arm Clang 与 MDK 中的 Arm Compiler 也不是同一套发行工具，命令入口和支持库需分别核对。

IAR 和 MDK 的主机支持、许可范围随产品与版本而异。阅读旧教程时，应同时查看对应版本的官方要求，不能把某个免费版或试用版的限制套到所有版本上。

EIDE 本身是工程集成扩展，不是新的 C/C++ 编译器。它可以使用外部工具并提供部分工程导入能力，但导入后仍要检查源文件、编译参数、库和链接配置；成功打开工程不足以证明固件行为等价。[EIDE 官方简介](https://em-ide.com/docs/intro/)也区分了它的工程能力与外部扩展提供的调试能力。

## 其他烧录与调试工具

### STM32CubeProgrammer

[STM32CubeProgrammer](https://www.st.com/en/development-tools/stm32cubeprog.html)提供 STM32 存储区读取、擦除、写入与校验等功能，有图形界面和命令行入口。除 ST-LINK 的调试接口外，它还支持部分器件的 UART、USB DFU 等 bootloader 下载方式；实际可用接口由芯片、启动方式及硬件连接决定。

CubeCLT 附带其命令行工具，可以在安装目录中见到 `STM32_Programmer_CLI`。团队这里采用 OpenOCD 完成烧录与调试服务，知道 CubeProgrammer 的用途即可。

### ST-LINK GDB server

[ST-LINK GDB server](https://www.st.com/resource/en/user_manual/um2576-stm32cubeide-stlink-gdb-server-stmicroelectronics.pdf)也是电脑上的 GDB 远程服务，通过 ST-LINK 访问目标。它在调试链路中与 OpenOCD 承担相近的位置；ST-LINK 探针则是硬件。

CubeCLT 中已经包含这个服务程序，并不要求本节点改用它。判断一份教程采用哪条链路，应看实际启动的是 OpenOCD、ST-LINK GDB server 还是其他服务。

## 阅读其他工程时怎么定位

先找工程描述与构建命令，再找编译器、链接配置和烧录调试设置：

1. 工程由 `CMakeLists.txt`、Makefile，还是某种 IDE 工程文件描述？
2. 构建实际调用哪套编译器，面向什么芯片，使用哪些库和链接脚本？
3. 固件输出到哪里，烧录工具从哪个文件和地址写入？
4. 调试客户端连接什么服务，服务使用哪种探针和目标配置？

这些信息足以判断另一套工具替代了开发链路中的哪些部分，再决定需要保留或调整哪些配置。
