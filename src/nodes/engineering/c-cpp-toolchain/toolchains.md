# 标准、实现与工具链

语言**标准**规定程序的含义和**实现**必须满足的要求；**工具链**把这些规则落实为具体工具和库。

## 标准规定什么

C 和 C++ 是分别演进的语言，各自有标准。例如 C99、C11、C17、C23 等，以及 C++11、C++17、C++20、C++23 等。它们按年份编号。

**标准**覆盖语法、语义和标准库接口等内容。例如，C 标准规定 `int` 的最低取值范围、整数运算规则和 `printf` 的接口，但没有要求所有平台上的 `int` 宽度相同，也没有规定必须生成哪几条汇编指令。

有些行为，**标准**给出了几种可选的方案，具体采用哪种方案则由**实现**来决定，例如普通 `char` 的有符号性。有些行为属于未定义行为，例如有符号整数溢出后的行为是什么，是不被**标准**规定的；这意味着，无论发生什么都是符合标准规范的。

[WG14 官方页面](https://www.open-std.org/jtc1/sc22/wg14/)提供 C 标准及工作文档的入口；[GCC 的实现定义行为文档](https://gcc.gnu.org/onlinedocs/gcc/C-Implementation.html)说明 GCC 如何记录标准留给实现的选择。遇到具体行为时，应查对应实现和平台的说明。

## 一个工具链包含什么

**工具链（toolchain）**是一组配合完成构建的工具及支持库。常见组成包括：

| 组成               | 作用                                 | 本节点中的入口                 |
| ------------------ | ------------------------------------ | ------------------------------ |
| 编译器及其驱动程序 | 处理语言、生成代码，并协调各阶段     | `gcc`、`clang`                 |
| 汇编器             | 将汇编文本转换为目标文件             | GNU `as`，或编译器集成的汇编器 |
| 链接器             | 处理目标文件与库，生成最终产物       | GNU `ld`、LLVM `lld` 等        |
| 标准库与运行时支持 | 提供标准接口实现及程序运行所需的支持 | C 标准库、C++ 标准库等         |
| 辅助工具           | 创建归档、查看符号和机器代码         | `ar`、`nm`、`objdump`          |

日常说“用 GCC 编译”时，通常是在调用 `gcc` 驱动程序。它会依据输入文件和选项安排预处理、编译、汇编与链接。

## 常见实现与工具组合

| 名称        | 应怎样认识它                                             | 使用时关注的差异                                                                    |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| GCC         | GNU Compiler Collection，提供了 `gcc`、`g++`             | 支持的标准版本、GNU 扩展、选项和所配套的库                                          |
| LLVM／Clang | Clang 是 LLVM 项目的 C 家族编译器；LLVM 还提供其他工具   | 许多 GCC 风格选项可通用，但诊断、扩展和选项细节仍有差异；链接器与标准库也有多种组合 |
| MSVC        | 微软的 C/C++ 编译和构建工具体系，典型入口为 `cl`、`link` | 常见选项写作 `/I`、`/D`、`/O2`，还需核对 Windows 库与二进制约定                     |

Visual Studio 是 IDE，MSVC 是其中可以使用的工具体系。编辑器界面相同，也可能配置不同的工具链；应查看实际执行的命令。

MinGW-w64 提供 Windows 相关的头文件、导入库和支持库等，通常与 GCC 或 LLVM 组合。它与编译器处于不同层次。[WinLibs 安装示例](../shell-basics/package-management.md#案例二-winlibs)展示的就是一套打包好的组合。

[Clang 工具链文档](https://clang.llvm.org/docs/Toolchain.html)可用于核对其编译器、链接器和库的组合；[MSVC 构建参考](https://learn.microsoft.com/en-us/cpp/build/reference/c-cpp-building-reference)用于查找微软工具及选项；[MinGW-w64 官方介绍](https://www.mingw-w64.org/)说明它提供的支持内容。

## 差异会带来什么影响

### 源码与命令的可移植性

一段代码在某个环境中编译成功，只证明该环境接受了它。换环境时至少检查：

- **标准特性**：所需语言特性是否被当前工具版本支持，是否选择了正确的语言模式。
- **扩展和平台接口**：是否使用 GNU 扩展或操作系统接口。例如 `<unistd.h>` 属于 POSIX 接口，不能把它当作 ISO C 标准库的一部分。
- **选项**：宏定义、头文件路径、警告和优化选项的写法及含义是否相同。

### 二进制兼容性

拿到一个已经编译好的库，还要检查它能否和当前程序一起链接、运行。

**ABI（应用二进制接口）**描述二进制之间如何配合，例如参数怎样传递、数据怎样布局、符号怎样命名。兼容性还涉及目标平台、文件格式、编译选项和运行库。

选择同一语言标准不能保证 ABI 相同。

## 验证：扩展支持的实现差异

下面单独使用 C++17，对比 GCC 与 Clang 的扩展支持。以下结果实测于 Clang 18.1.3 和 GCC 13.3.0；其他版本的支持情况和诊断文字可能不同。

### 直接依赖实现扩展

将下面的代码保存为 `point.cpp`：

```cpp
#include <cstdio>

struct Point {
    int x;
    int y;
};

int main()
{
    Point point{2, 3};
    __builtin_dump_struct(&point, &std::printf);
    return 0;
}
```

用 Clang 编译并运行：

```sh
clang++ -std=c++17 point.cpp -o point-clang
./point-clang
```

```
Point {
  int x = 2
  int y = 3
}
```

再用 GCC 编译同一份源码：

```sh
g++ -std=c++17 point.cpp -o point-gcc
```

```
error: '__builtin_dump_struct' was not declared in this scope
```

两条命令选择了同一语言标准，结果仍不同。因为 `__builtin_dump_struct` 不属于标准 C++17，而是 Clang 提供的内建扩展，本例实测的 GCC 版本并不支持它。

[Clang](https://clang.llvm.org/docs/LanguageExtensions.html) 和 [GCC](https://gcc.gnu.org/onlinedocs/gcc/C-Extensions.html) 都各自提供了很多标准之外的扩展，以增强 C/C++ 的能力。但是这也带来了另一个问题：同一份代码在不同实现上可能有不同的行为，甚至无法编译也就是降低了**可移植性**。

### 用条件编译提供备用实现

将 `point.cpp` 改为：

```cpp
#include <cstdio>

#ifndef __has_builtin
#define __has_builtin(name) 0
#endif

struct Point {
    int x;
    int y;
};

int main()
{
    Point point{2, 3};

#if __has_builtin(__builtin_dump_struct)
    __builtin_dump_struct(&point, &std::printf);
#else
    std::printf("Point { x = %d, y = %d }\n", point.x, point.y);
#endif

    return 0;
}
```

**条件编译**在预处理时选择代码分支，未选中的分支不参与后续编译：

- `__has_builtin(name)` 检测当前实现是否支持指定内建函数，支持时结果为非零，否则为 `0`。
- 如果实现没有提供 `__has_builtin`，开头的 `#ifndef` 为它定义一个总是返回 `0` 的备用宏。
- `#if` 在支持扩展时保留自动打印；否则保留 `#else` 中手动打印字段的标准 C++ 代码。

重新分别编译并运行：

```sh
clang++ -std=c++17 point.cpp -o point-clang
./point-clang

g++ -std=c++17 point.cpp -o point-gcc
./point-gcc
```

这次两者都应成功。Clang 的输出与前面相同，GCC 的备用分支打印：

```
Point { x = 2, y = 3 }
```

两种实现都输出了相同的字段值，排版不同。以后某个实现增加了该扩展，能力探测也能自动选中扩展分支。

关于 `__has_builtin` 宏的详细说明可见：[Clang 的能力探测说明](https://clang.llvm.org/docs/LanguageExtensions.html#has-builtin)；[GCC 的 `__has_builtin` 文档](https://gcc.gnu.org/onlinedocs/cpp/_005f_005fhas_005fbuiltin.html)。

## C++ 的构建入口与库

C++ 源码通常使用 `g++`、`clang++` 构建，并通过 `-std=c++17` 等选项选择语言模式。`gcc` 能根据 `.cpp` 后缀识别 C++，但不会自动加入 C++ 标准库链接；`g++` 会加入。因此直接把命令中的 `g++` 替换为 `gcc` 可能在链接阶段失败。[GCC 的 C++ 编译说明](https://gcc.gnu.org/onlinedocs/gcc/Invoking-G_002b_002b.html)解释了这一差异。

C++ 标准库也有不同实现，例如 libstdc++ 和 libc++。选择编译器时，还要核对实际使用的标准库及 ABI 要求。
