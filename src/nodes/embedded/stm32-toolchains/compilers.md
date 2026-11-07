# 编译工具链与 CubeCLT

在电脑上为 STM32 构建程序，需要运行于电脑、生成 Arm 目标代码的交叉编译工具链。本节点从 ST 的 **STM32CubeCLT** 获取 GNU Tools for STM32、ST Arm Clang，以及 GNU 工具链附带的 GDB。

## 从 STM32CubeCLT 获取工具

[STM32CubeCLT 产品页](https://www.st.com.cn/zh/development-tools/stm32cubeclt.html)提供各平台下载。CLT 是命令行工具合集，除编译工具链外，还包含 STM32CubeProgrammer 命令行工具、ST-LINK GDB server 等。组件和版本应查所下载版本的[发行说明 RN0132](https://www.st.com/resource/en/release_note/rn0132-stm32cube-commandline-toolset-release-v1190-stmicroelectronics.pdf)，不能仅根据一台电脑已有的安装判断最新版包含什么。

CLT 也捆绑了 CMake、Ninja 等构建工具，较新版本还包含 GNU Make。**建议这些通用 C/C++ 工具独立安装、维护版本和更新**，供不同项目共用，避免依赖 STM32 工具链的目录和发布节奏；多个副本还可能因 `PATH` 顺序而选错。准备方法沿用[软件安装、包管理](../../engineering/shell-basics/package-management.md)与[构建系统](../../c-cpp-engineering/build-systems/intro.md)。

下面的目录示例来自 Linux 上的 CubeCLT 1.21.0，省略了无关目录；下载其他版本后应核对实际布局：

```text
CubeCLT 安装根目录/
├── GNU-tools-for-STM32/
│   ├── bin/                  arm-none-eabi-gcc、g++、gdb 等
│   ├── arm-none-eabi/        目标头文件、库等
│   └── lib/                  编译器支持文件等
├── st-arm-clang/
│   ├── bin/                  starm-clang、starm-clang++ 等
│   └── ...                   配套库、配置与文档
├── CMake/
├── Ninja/
├── STM32CubeProgrammer/
└── STLink-gdb-server/
```

这些目录共同组成可用的安装，不能只复制几个可执行文件。Linux 上的 `~/st/STM32CubeCLT-current` 也可以是使用者自己维护的版本链接，不能假定每台电脑都有这个路径。

## GNU Tools for STM32

GNU 工具的命令通常带有 `arm-none-eabi-` 前缀，表示这里面向 Arm 裸机、采用 EABI（嵌入式应用二进制接口）的工具，与为电脑本机生成程序的 `gcc`、`g++` 区分。具体到 Cortex-M4、浮点单元和调用约定，还要由工程参数选择。其中汇编、链接、归档和对象文件处理等工具来自 GNU Binutils。

| 入口或组件                                    | 用途                                               |
| --------------------------------------------- | -------------------------------------------------- |
| `arm-none-eabi-gcc`、`arm-none-eabi-g++`      | C / C++ 编译驱动，组织编译、汇编和链接             |
| `arm-none-eabi-as`、`arm-none-eabi-ld`        | 汇编器、链接器，通常由编译驱动间接调用             |
| `arm-none-eabi-ar`、`arm-none-eabi-nm`        | 管理静态库、查看符号                               |
| `arm-none-eabi-objdump`、`arm-none-eabi-size` | 查看机器代码、节信息和大小                         |
| `arm-none-eabi-objcopy`                       | 提取或转换目标文件内容，例如按需要生成 BIN / HEX   |
| 目标头文件、Newlib 等库与运行时               | 为目标程序提供编译和链接支持                       |
| `arm-none-eabi-gdb`                           | 调试客户端，准备方法见[调试工具页](./debugging.md) |

示例的 `cmake/gcc-arm-none-eabi.cmake` 设置这些入口，并通过 `-mcpu=cortex-m4`、`-mfpu=fpv4-sp-d16`、`-mfloat-abi=hard` 选择目标参数。它还选择链接脚本与库选项；这些都不是单凭安装一个编译器就能自动确定的。

## ST Arm Clang

ST Arm Clang 是 ST 面向 STM32 提供的 LLVM / Clang 工具链，C / C++ 入口分别是 `starm-clang`、`starm-clang++`。电脑上已有普通 `clang`，不等于已准备好这套发行工具及其目标库。

它支持两类工具组合：

| 组合      | 编译与汇编            | 链接器、库与运行时                                                         |
| --------- | --------------------- | -------------------------------------------------------------------------- |
| Hybrid    | ST Clang 与集成汇编器 | 使用 GNU 链接器和 GNU 工具链配套的库、运行时，因此两套工具链都需要安装     |
| Full LLVM | ST Clang 与集成汇编器 | 使用 LLVM 链接器和运行时；C 库可选择 Newlib 或 Picolibc，C++ 库使用 libc++ |

示例的 `cmake/starm-clang.cmake` 用 `STARM_TOOLCHAIN_CONFIG` 区分 `STARM_HYBRID`、`STARM_NEWLIB` 和 `STARM_PICOLIBC`，该文件默认选择 Picolibc。它只是一个可供工程选择的工具链文件；当前 `CMakePresets.json` 仍选择 GNU。

[ST Arm Clang 官方说明](https://dev.st.com/stm32cube-docs/stm32cubeide-vscode/latest/en/docs/markup/basic_concepts/starm-clang.html)给出了各组合的组件和迁移要求。切换时需要核对选项、链接脚本与库的兼容性，不能认为改一个编译器名称就完成了迁移。本页并列准备两套工具，不在这里修改示例的构建配置。

## 安装 CubeCLT

先按**运行工具的电脑**选择安装包；生成的 STM32 程序都是 Arm 目标代码，并不意味着电脑也应下载 Arm 主机包。

| 平台         | 推荐安装途径                                                                                     | 安装后记录                                                     |
| ------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Windows 原生 | 下载 Windows 安装包，解压并运行安装器，按提示完成安装                                            | CLT 安装根目录、两个工具链的 `bin` 目录；命令行使用 PowerShell |
| Linux        | Ubuntu 等 DEB 系统选择 DEB bundle，Fedora 等 RPM 系统选择 RPM bundle；其他环境核对通用安装包要求 | 主机架构、运行库要求及安装根目录                               |
| macOS        | 选择 Intel 或 Apple Silicon 对应包，解压后运行其中的 `.pkg` 安装器                               | 安装根目录及组件对应的主机架构                                 |

Linux bundle 通常以 `.sh` 结尾。进入下载文件所在目录，将下面的文件名替换为实际下载的 bundle，再运行：

```sh
sudo sh ./st-stm32cubeclt_VERSION_ARCHITECTURE.deb_bundle.sh
```

RPM 或通用包使用其实际文件名。各平台安装过程可参考[安装指南 UM3089](https://www.st.com/resource/en/user_manual/um3089-stm32cubeclt-installation-guide-stmicroelectronics.pdf)；该指南更新可能晚于软件，系统、架构与组件支持以对应版本发行说明为准。

## 只配置需要的命令目录

找到根目录中的 `GNU-tools-for-STM32/bin` 和 `st-arm-clang/bin`，检查里面确实有预期可执行文件。下面给出当前终端的临时配置：**先将第一行的根目录替换为你的实际安装路径**。

::: code-group

```powershell [Windows / PowerShell]
$stm32CltRoot = 'C:\ST\你的CubeCLT目录'
$env:PATH = "$stm32CltRoot\GNU-tools-for-STM32\bin;$stm32CltRoot\st-arm-clang\bin;$env:PATH"

Get-Command arm-none-eabi-gcc, arm-none-eabi-g++, starm-clang, starm-clang++ -All
```

```sh [Linux / macOS]
stm32_clt_root="/替换为实际的CubeCLT安装根目录"
export PATH="$stm32_clt_root/GNU-tools-for-STM32/bin:$stm32_clt_root/st-arm-clang/bin:$PATH"

type -a arm-none-eabi-gcc arm-none-eabi-g++ starm-clang starm-clang++
```

:::

确认路径后，再按[环境变量与 PATH](../../engineering/shell-basics/environment.md)的方法持久配置，并在新终端中复查。安装器可能已经修改 `PATH`；如果 `cmake`、`ninja` 或 `make` 被解析到 CLT 的捆绑目录，应调整入口顺序，使用自己独立维护的版本。

## 自检与判据

以下命令在三种平台的终端中相同：

```sh
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
starm-clang --version
starm-clang++ --version

arm-none-eabi-objdump --version
starm-lld -flavor gnu --version
starm-objcopy --version
```

预期每条命令均能打印版本，路径查询结果位于刚选定的两套工具链目录中。`starm-lld` 是通用链接器入口，这里用 `-flavor gnu` 指定 GNU 风格；工程中通常由编译驱动调用链接器。组件的版本号各自独立，例如 CLT 版本与 GCC 版本不会相同。

再查询 GNU 配套库的位置：

```sh
arm-none-eabi-gcc -print-file-name=libc.a
arm-none-eabi-g++ -print-file-name=libstdc++.a
```

输出应为安装目录中的库文件路径，并能在文件系统中找到对应文件；若只原样打印 `libc.a` 等名字，说明没有在当前搜索路径找到它。还应保留 GNU 工具链的目标头文件目录，以及 ST Arm Clang 的库、配置和支持文件。

这些检查确认命令可运行、入口正确且配套文件可查。工程能否完成链接，还取决于目标参数、所选库与工程配置；完整构建由后续实操验证。
