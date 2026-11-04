# C/C++ 工具链与构建流程

C/C++ 源文件要经过编译、链接才能成为可执行程序。本节点从一条编译命令开始，逐步构建一个带静态库的多文件工程，再用 Make 和 CMake 管理同一组构建任务。

## 前置知识要求

开始学习本章之前，你应当：

1. 熟悉 C 语言基本语法（函数调用、头文件、基本的宏定义等），确保本章中出现的所有 C 语言代码都能清晰地理解。
2. 学习并理解了[命令行基础](../shell-basics/intro.md)。

## 实验约定

准备 GCC、Clang、GNU Binutils（`ar`、`nm`、`objdump`）、GNU Make、CMake 3.28 或更高版本，以及 Ninja。GCC 和 Clang 的环境中还需要可用的 C/C++ 标准库及开发头文件。

先确认工具入口：

```sh
command -v gcc clang g++ clang++ ar nm objdump make cmake ninja
gcc --version
clang --version
cmake --version
```

工具安装与环境配置相关问题请在学习了[软件安装、包管理](../shell-basics/package-management.md)后自行解决。

示例产物节选以 x86-64 Linux 为背景；工具版本、系统库和优化选项都会影响具体输出，验证时应比较文中指出的特征。
