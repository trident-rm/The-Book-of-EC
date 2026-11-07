# STM32 工具链与开发环境

## 团队工具清单

| 用途               | 采用的工具                        | 获取途径与选择                                                                                                         |
| ------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 芯片配置与工程生成 | STM32CubeMX（经典版）             | 从 [STM32CubeMX](https://www.st.com.cn/zh/development-tools/stm32cubemx.html) 获取。注意选择 STM32CubeMX，而不是 STM32CubeMX2 |
| 交叉编译           | GNU Tools for STM32、ST Arm Clang | 从 [STM32CubeCLT](https://www.st.com.cn/zh/development-tools/stm32cubeclt.html) 获取               |
| 构建配置与生成     | CMake                             | 推荐通过独立发行包或包管理器安装                                                                                           |
| 执行构建规则       | GNU Make 或 Ninja                 | 推荐通过独立发行包或包管理器安装                                                          |
| 烧录与调试服务     | OpenOCD                           | Chocolatey、Homebrew、APT 等包管理器                                                                                     |
| 调试客户端         | `arm-none-eabi-gdb`               | 使用 CubeCLT 中的工具，通过 OpenOCD 连接目标                                                                           |
| 硬件连接           | CMSIS-DAP、ST-LINK 或 J-Link 探针 | 根据手头探针选择示例仓库中的对应配置                                                                                   |

## 工具如何配合

- 工程生成：CubeMX 根据芯片配置与 `.ioc` 文件生成初始化代码及工程文件。
- 固件构建：CMake 生成构建规则，Make 或 Ninja 调用选定的编译工具链，得到 ELF 等产物。
- 固件烧录：OpenOCD 读取固件，经硬件探针和 SWD 将程序内容写入芯片。
- 程序调试：GDB 经 OpenOCD 和探针控制目标、读取状态；编辑器可以作为这些工具的操作入口。
- 区分工具的职责、发行工具合集和 IDE，避免把 CubeCLT、编译器、CubeMX 当作同一类软件。

## 配套示例：Demo-RM-C

示例项目见：[Demo-RM-C](https://github.com/trident-rm/Demo-RM-C)。

| 已有文件或配置                                             | 在本节点中的用途                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| `Demo-RM-C.ioc`                                            | 识别目标 STM32F407IGH6、CubeMX 配置及工程生成选项              |
| `cmake/gcc-arm-none-eabi.cmake`、`cmake/starm-clang.cmake` | 对照 GNU 与 ST Arm Clang 的工具入口及组成                      |
| `CMakePresets.json`                                        | 观察现有 GNU + Ninja 配置，以及 Debug / Release 构建目录       |
| `openocd/`                                                 | 按实际探针选择 CMSIS-DAP、ST-LINK 或 J-Link 配置，完成芯片识别 |

现有预设选择 GNU + Ninja。
