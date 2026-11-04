# C/C++ 工具链与构建流程

C/C++ 源文件要经过编译、链接才能成为可执行程序。本节点从一条编译命令开始，逐步构建一个带静态库的多文件工程，再用 Make 和 CMake 管理同一组构建任务。

## 学习目标与先修

完成后，你应能：

- 区分语言标准、编译器、工具链和构建工具，判断更换工具链时需要核对什么。
- 使用 GCC 或 Clang 构建单文件程序，解释宏定义、警告和优化选项。
- 识别预处理文本、汇编文本、目标文件和可执行文件。
- 手动编译多文件工程、创建并链接静态库，根据依赖关系判断重建范围。
- 读懂简单 Makefile，并为小型 CMake 工程添加源文件、头文件目录、宏定义和库依赖。

先完成[命令行基础](../shell-basics/intro.md)，并具备 C 基础：能够编写简单程序，理解函数的声明与定义。文中会解释头文件怎样参与构建。

## 实验约定

- 在 Linux 或 WSL 的 Linux 环境中操作，生成并运行当前环境下的程序。
- 除专门标注的 C++ 示例外，使用 C 和 GCC；语言模式显式设为 C17。
- 先用 `-O0` 观察产物，再与 `-O2` 比较。
- 命令在各示例的根目录执行。`build/`、`build-cmake/` 等目录只保存构建产物。

准备 GCC、Clang、GNU Binutils（`ar`、`nm`、`objdump`）、GNU Make、CMake 3.28 或更高版本，以及 Ninja。GCC 和 Clang 的环境中还需要可用的 C/C++ 标准库及开发头文件。

先确认工具入口：

```sh
command -v gcc clang g++ clang++ ar nm objdump make cmake ninja
gcc --version
clang --version
cmake --version
```

安装与 PATH 问题参见[软件安装、包管理](../shell-basics/package-management.md)。示例产物节选以 x86-64 Linux 为背景；工具版本、系统库和优化选项都会影响具体输出，验证时应比较文中指出的特征。

## 贯穿示例

程序调用 `calc_add(2, 3)`，打印 `2 + 3 = 5`。编译时开启 `CALC_TRACE` 后，会先打印 `[calc] add(2, 3)`。

正文会按步骤给出完整代码和文件路径，复制到自己的练习目录即可。单文件示例放在 `single-file/`，多文件工程放在 `calc-demo/`；最后一节分别用 Makefile 和 CMakeLists.txt 管理同一个多文件工程的构建。

## 学习路线

1. [标准、实现与工具链](./toolchains.md)：认识 GCC、Clang、MSVC 及其差异。
2. [单文件编译与四个阶段](./single-file.md)：从命令和选项追踪到各阶段产物。
3. [多文件、静态库与增量构建](./multi-file.md)：把一个源文件拆成有依赖关系的工程。
4. [Make、CMake 与 Ninja](./build-systems.md)：将构建命令和依赖交给工具管理。

## 完成判据

使用同一份源码完成手动构建、Make 构建和 CMake 构建，三者应产生相同的程序输出。你还应能解释两类故障的区别：编译时找不到 `calc.h`，以及链接时找不到 `calc_add` 的定义；修改源文件、公共头文件或日志开关后，能够预测并验证哪些步骤需要重做。
