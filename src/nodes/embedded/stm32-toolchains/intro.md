# STM32 工具链与开发环境

本节点准备 STM32 开发会用到的软件，分清编译、构建、烧录与调试的职责。完成后，应能查询两套编译工具链的路径和版本，用经典 STM32CubeMX 打开示例配置，并通过 OpenOCD、探针和 SWD 识别目标芯片。

完整工程的生成、编译、烧录和断点调试留到后续实操。本节点先确认工具和连接可用。

## 团队工具清单

| 用途               | 采用的工具                        | 获取途径与选择                                                                                                    |
| ------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 芯片配置与工程生成 | STM32CubeMX（经典版）             | 从 [STM32CubeMX 产品页](https://www.st.com.cn/zh/development-tools/stm32cubemx.html)获取，选择 STM32CubeMX 下载项 |
| 交叉编译           | GNU Tools for STM32、ST Arm Clang | 从 [STM32CubeCLT 产品页](https://www.st.com.cn/zh/development-tools/stm32cubeclt.html)获取                        |
| 构建配置与生成     | CMake                             | 独立安装和维护版本                                                                                                |
| 执行构建规则       | GNU Make 或 Ninja                 | 独立安装和维护版本，按工程配置选择                                                                                |
| 烧录与调试服务     | OpenOCD                           | 使用与项目配置配套的稳定版程序及脚本                                                                              |
| 调试客户端         | `arm-none-eabi-gdb`               | 使用 CubeCLT 中 GNU 工具链附带的版本                                                                              |
| 硬件连接           | CMSIS-DAP、ST-LINK 或 J-Link 探针 | 按实际探针选择示例中的对应配置，经 SWD 连接 STM32                                                                 |

GNU 与 ST Arm Clang 是两套编译工具链；CMake 配合 Make 或 Ninja 管理构建。它们的职责不同，不能用“安装了 CMake”代替“已经准备好编译器”。CMake、Make、Ninja 的原理与用法见[构建系统](../../c-cpp-engineering/build-systems/intro.md)，这里仅补充 STM32 工具的准备。

## 工具如何配合

从工程配置到芯片运行，大致经过以下环节：

| 环节         | 谁完成                       | 输入与结果                                                        |
| ------------ | ---------------------------- | ----------------------------------------------------------------- |
| 生成工程     | CubeMX                       | 根据 `.ioc` 中的芯片配置，生成初始化代码和工程文件                |
| 准备构建规则 | CMake                        | 读取工程描述、工具链文件和构建配置，生成 Make 或 Ninja 使用的规则 |
| 构建固件     | Make 或 Ninja 调用编译工具链 | 编译、汇编、链接源码，得到 ELF 等产物                             |
| 烧录固件     | OpenOCD、探针                | 按固件的装载地址，将程序内容写入芯片的 Flash                      |
| 调试程序     | GDB、OpenOCD、探针           | 控制目标暂停或继续，观察寄存器、内存和源码位置                    |

CubeCLT 是分发这些工具中一部分的合集；IDE 是把编辑、构建和调试入口集成起来的开发环境。使用哪种编辑器，不改变这条链路中各工具的职责。

## 配套示例：Demo-RM-C

本节点使用 [Demo-RM-C 仓库](https://github.com/trident-rm/Demo-RM-C)，文件说明核对到版本 [`483fab4`](https://github.com/trident-rm/Demo-RM-C/tree/483fab4e121a3cb5b7c6c867825a769be65c7397)。可以[下载该版本的 ZIP](https://github.com/trident-rm/Demo-RM-C/archive/483fab4e121a3cb5b7c6c867825a769be65c7397.zip)并解压；后文的“项目根目录”指包含 `Demo-RM-C.ioc`、`CMakeLists.txt` 和 `openocd/` 的目录。

| 文件或目录                      | 在本节点中的用途                             |
| ------------------------------- | -------------------------------------------- |
| `Demo-RM-C.ioc`                 | 用 CubeMX 打开，确认目标芯片为 STM32F407IGH6 |
| `cmake/gcc-arm-none-eabi.cmake` | 识别 GNU 编译器、辅助工具及目标参数          |
| `cmake/starm-clang.cmake`       | 对照 ST Arm Clang 的入口与运行库配置         |
| `CMakePresets.json`             | 确认工程实际选择的工具链、生成器和构建目录   |
| `openocd/`                      | 按实际探针选择连接与芯片配置                 |
| `.clangd`                       | 观察编辑器语言服务如何寻找工程的编译参数     |

该版本的预设使用 **GNU + Ninja**；仓库中同时保留 ST Arm Clang 工具链文件，并不表示已有两套可直接切换的预设。Make 和 Ninja 都可以用于这类构建，具体工程要有相应配置。

## 阅读顺序与完成判据

| 顺序 | 页面                                   | 完成后应能确认                                                     |
| ---- | -------------------------------------- | ------------------------------------------------------------------ |
| 1    | [编译工具链与 CubeCLT](./compilers.md) | GNU 与 ST Arm Clang 的命令来自预期目录，版本可查，配套组件保留完整 |
| 2    | [STM32CubeMX](./cubemx.md)             | 经典 CubeMX 能启动，并打开示例的 `.ioc`                            |
| 3    | [烧录与 OpenOCD](./flashing.md)        | 说清烧录改变了什么，并接探针识别目标芯片                           |
| 4    | [调试工具如何配合](./debugging.md)     | GDB 能启动，能说明客户端、调试服务和探针的分工                     |
| 5    | [编辑器与其他工具](./other-tools.md)   | 能判断编辑器扩展、经典 IDE 和其他工具接管了哪些环节                |

软件部分覆盖 Windows 原生环境、Linux 和 macOS。接板自检还需要实际板卡、探针及其接线文档；电脑能识别 USB 探针，只完成了硬件链路的一部分。
