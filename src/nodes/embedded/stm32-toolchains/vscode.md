# VS Code 开发环境（示例）

本页提供两种示例的 VS Code 开发环境配置方案，它们各自独立。用户则需选择，也可自己修改、组合或扩展。

## 方案一：CMake 工程

该方案针对纯 CMake 工程项目，可定制性强、拓展性高、兼容性好。

CMake 工程不依赖于 VS Code，可直接在命令行或其他 IDE、编辑器中进行所有开发操作，也便于接入 Coding Agents、CI/CD 等自动化工具。VS Code 仅作为编辑器，接入语言服务、调试器、构建系统（一些 CMake 的图形化操作）。

#### 推荐扩展：

- [CMake Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools)：CMake 工程管理、构建和调试。（推荐关闭自动配置功能，它常常令人困惑）
- [clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) 或 [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)：提供C/C++ 语言服务。可先学习[语言服务](../../c-cpp-engineering/code-tools/language-services)。

#### 示例项目

[STM32CubeMX + CMake 工程](https://github.com/trident-rm/Demo-RM-C)

## 方案二：EIDE 工程

EIDE 是一个 VS Code 的嵌入式工程扩展，提供工程管理、构建和调试入口。相比 CMake，它更易上手。但使用 EIDE 意味着构建系统绑定在 VS Code 中，可能不便于在命令行或其他 IDE 中进行构建。

EIDE 在 Windows 中还支持安装常用工具链，包括 `arm-none-eabi-gcc`、`openocd` 等；但对 Linux 和 macOS 中工具链的安装支持有限，需自行另外安装和配置，其还需自行安装 dotnet SDK（EIDE 依赖 .NET 运行时）。

EIDE 可和 [clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)、[Microsoft C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)、[Cortex-Debug](https://marketplace.visualstudio.com/items?itemName=marus25.cortex-debug) 等扩展配合使用，它能自动提供这些扩展所需项目配置，故通常无需手动编写。参考说明：

- [Microsoft C/C++ 支持](https://em-ide.com/zh-cn/docs/notice/cpptools_cfg)
- [clangd 支持](https://discuss.em-ide.com/d/1112-clangd/2)
- [Cortex-Debug 支持](https://em-ide.com/zh-cn/docs/advance/debug_project)

#### 扩展要求：

- [EIDE](https://em-ide.com/)：嵌入式工程管理、构建和调试入口。
- [clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) 或 [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)：提供C/C++ 语言服务。

使用方式详见 [EIDE 文档](https://em-ide.com/docs/category/getting-started)。

#### 搭配 SMT32CubeMX：

由于 EIDE 使用自身的构建系统，而不是 CMake 或 Makefile 等通用工具，故需自行在 EIDE 中配置编译器、构建和烧录工具、编译指令等。

推荐让 CubeMX 生成 Makefile 工程，然后将其生成的 Makefile 文件加入 `.gitignore`，再改在 EIDE 中进行实际的构建配置。

::: info 为什么？

本方案只维护 EIDE 的构建配置。若同时维护 CubeMX 生成的另一套构建配置，新增源文件、修改宏定义或编译选项时就需要同步修改两处，容易遗漏并产生不一致。

选择 Makefile 工程，是因为它的构建描述集中在一个 `Makefile` 文件中；相比之下，[CubeMX 生成的 CMake 工程](https://dev.st.com/stm32cube-docs/stm32cubeide-vscode/latest/en/docs/markup/basic_concepts/cmake.html#stm32cubemx-generated-files)还包含 `cmake/`、`CMakeLists.txt`、`CMakePresets.json` 等文件和目录。前者更便于单独加入 `.gitignore`，避免未使用的构建配置被误认为项目的构建入口，也减少 CubeMX 重新生成时带来的无关版本变更。

这里忽略的仅是未使用的构建配置；源码、启动文件、链接脚本以及 EIDE 的工程配置仍应纳入版本管理。

:::

#### 示例项目

[STM32CubeMX + EIDE 工程](https://github.com/trident-rm/Demo-RM-C-EIDE)

EIDE 使用放在项目根目录的 `.eide/` 目录和 `.code-workspace` 文件保存工程配置。后者同时也是 VS Code 的工作区配置文件，EIDE 项目都应通过该文件打开。

## 其他扩展

嵌入式开发中，一些其他有用的扩展：

#### 调试支持

- [Serial Monitor](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-serial-monitor)：基本的串口收发功能
- [Cortex-Debug](https://marketplace.visualstudio.com/items?itemName=marus25.cortex-debug)：提供调试服务
- [RTOS Views](https://marketplace.visualstudio.com/items?itemName=mcu-debug.peripheral-viewer)：用于常见 RTOS 的调试
- [MemoryView](https://marketplace.visualstudio.com/items?itemName=mcu-debug.memory-view)：用于查看和编辑目标 MCU 的内存
- [Peripheral Viewer](https://marketplace.visualstudio.com/items?itemName=mcu-debug.peripheral-viewer)：STM32 外设寄存器查看器

#### 其他语言支持和分析

- [Map View Embedded](https://marketplace.visualstudio.com/items?itemName=charcoal141.map-view-embedded)：可视化 map 文件，提供符号搜索、内存占用分析等功能
- [GNU Linker Map files](https://marketplace.visualstudio.com/items?itemName=trond-snekvik.gnu-mapfiles)：GNU Linker Map 语言支持
- [LinkerScript](https://marketplace.visualstudio.com/items?itemName=ZixuanWang.linkerscript)：GNU linker script 语言支持
- [Arm Assembly](https://marketplace.visualstudio.com/items?itemName=dan-c-underwood.arm)：Arm 汇编语言支持
