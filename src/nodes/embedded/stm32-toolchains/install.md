# 工具安装、环境配置

以下涉及到的安装、配置方法请参考[环境变量、PATH](../../engineering/shell-basics/environment.html)和[软件安装、包管理](../../engineering/shell-basics/package-management.md)。

## 通用 C/C++ 工具

请自行安装准备 CMake、Ninja、GNU Make、clangd。

## 从 STM32CubeCLT 获取工具链

STM32CubeCLT 是一个命令行工具合集，除编译工具链外，还包含 STM32CubeProgrammer 命令行工具、ST-LINK GDB server 等。

它也捆绑了 CMake、Ninja 等构建工具，较新版本还包含 GNU Make。**建议这些通用 C/C++ 工具独立安装、维护版本和更新**，供不同项目共用，避免依赖 STM32 工具链的目录和发布节奏；多个副本还可能因 `PATH` 顺序而选错。

下面的目录示例来自 Linux 上的 CubeCLT 1.21.0，省略了无关目录：

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

#### 操作：

1. 下载 [STM32CubeCLT](https://www.st.com.cn/zh/development-tools/stm32cubeclt.html)，解压到你希望的安装目录。
2. 将其中两个工具链的 `bin` 目录都添加到 `PATH`。
3. 检查可用性：

   ```sh
   # GNU Tools for STM32
   arm-none-eabi-gcc --version
   arm-none-eabi-g++ --version

   # ST Arm Clang
   starm-clang --version
   starm-clang++ --version
   ```

## 安装 STM32CubeMX

从 [STM32CubeMX 产品页](https://www.st.com.cn/zh/development-tools/stm32cubemx.html)下载（注意是 STM32CubeMX，而不是 STM32CubeMX2），安装。

## OpenOCD

从 [OpenOCD 官网](https://openocd.org/pages/getting-openocd.html)下载最新版本，或通过包管理器安装：

::: code-group

```powershell [Windows / Chocolatey]
choco install openocd
```

```bash [macOS, Linux / Homebrew]
brew install open-ocd
```

```bash [Ubuntu / apt]
sudo apt install openocd
```

:::

## 使用示例项目进行测试

克隆[示例项目](https://github.com/trident-rm/Demo-RM-C)到本地，按照 README 中的说明，尝试构建和烧录。

测试 CubeMX：使用 STM32CubeMX 打开示例项目根目录中的 `.ioc` 文件，检查是否能正确加载。
