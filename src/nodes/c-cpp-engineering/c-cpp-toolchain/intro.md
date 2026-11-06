# C/C++ 工具链与构建流程

本节点学习 C/C++ 程序如何从源码生成可执行文件：区分标准与实现，查看编译产物，手动完成多文件编译、静态库归档和链接，并识别交叉编译的构建平台与目标平台。

## 前置知识要求

开始学习本章之前，你应当：

1. 熟悉 C 语言基本语法（函数调用、头文件、基本的宏定义等），确保本章中出现的所有 C 语言代码都能清晰地理解。
2. 学习并理解了[命令行基础](../../engineering/shell-basics/intro.md)。

## 实验约定

准备 GCC、Clang 和 GNU Binutils（`ar`、`nm`、`objdump`）。GCC 和 Clang 的环境中还需要可用的 C/C++ 标准库及开发头文件。

先确认工具入口：

```sh
command -v gcc clang g++ clang++ ar nm objdump
gcc --version
clang --version
```

工具安装与环境配置相关问题请在学习了[软件安装、包管理](../../engineering/shell-basics/package-management.md)后自行解决。
