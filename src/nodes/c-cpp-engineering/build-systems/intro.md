# 构建系统：Make 与 CMake

本节点用 GNU Make 和 CMake 管理多文件 C 工程的构建：将依赖、目标和配置写入工程文件，由工具判断并执行需要更新的步骤。

## 学习目标

- 用 Make 规则描述编译、归档和链接的依赖，解释输入变化后哪些产物需要更新。
- 用 CMake 目标描述库与程序，区分目标自身的要求和传递给使用者的要求。
- 用 Preset 保存配置，用命令运行器编排配置、构建、运行和清理。

完成[自主实验](exercises.md)后，应能为库增加源码而无需改写构建入口，并通过独立的 Debug / Release 构建验证日志策略。

## 前置知识要求

先完成 [C/C++ 工具链与构建流程](../c-cpp-toolchain/intro.md)，能手动编译多个源文件、创建静态库并链接程序，理解头文件和编译选项也是构建输入。[多文件构建](../c-cpp-toolchain/multi-file.md)中的示例和依赖图是本节点的基础。

## 实验约定

本节点使用 Linux 和 GCC，沿用先修节点中的 GNU Binutils 环境，另外准备 GNU Make、CMake 3.28 或更高版本，以及 Ninja。

先确认工具入口和 CMake 版本：

```sh
command -v gcc ar make cmake ninja
cmake --version
```

工具安装与环境配置见[软件安装、包管理](../../engineering/shell-basics/package-management.md)。
