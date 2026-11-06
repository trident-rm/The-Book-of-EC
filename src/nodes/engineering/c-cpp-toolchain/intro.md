# C/C++ 工具链与构建流程

C/C++ 源文件要经过编译、链接才能成为可执行程序。在工程项目中，源文件通常分布在多个目录，编译和链接的命令也非常复杂，因此需要构建系统来管理这些命令。

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
