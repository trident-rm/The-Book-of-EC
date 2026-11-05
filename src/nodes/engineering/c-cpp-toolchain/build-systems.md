<script setup lang="ts">
import { makeFiles, cmakeFiles, commandRunnerFiles } from "./example-files.ts"
</script>

# 构建系统：Makefile、CMake

## Makefile：记录依赖和命令

上一节中，每次修改都要求手动判断要执行哪些命令。命令又长又难记，依赖分析也容易出错。GNU Make 是一种构建工具，它将构建过程写成规则，帮我们自动完成分析和命令执行。

基本语法如下：

```makefile
目标: 前置依赖
	生成或更新目标的命令
```

目标文件不存在，或某个前置文件比它更新时，Make 会执行对应命令，并沿依赖关系更新后续目标。

本节沿用上一节的静态库方案，Make 的产物放在 `build-make/`，与手动构建的 `build/` 分开。在工程根目录新建 `Makefile`，从文件树中复制它的完整内容；其他三个文件沿用上一节的源码：

<CodeTree title="calc-demo · Make" :files="makeFiles" initial-file="Makefile" :initialSidebarExpanded="false">
<template #header>

<<< ./assets/calc-demo/include/calc.h{c}

</template>
<template #calc>

<<< ./assets/calc-demo/src/calc.c{c}

</template>
<template #main>

<<< ./assets/calc-demo/src/main.c{c}

</template>
<template #makefile>

<<< ./assets/calc-demo/makefile{makefile}

</template>
</CodeTree>

这份文件中：

1. `all` 是默认目标，最终要求生成 `build-make/calc-demo`。
2. 两个 `.o` 都依赖各自的 `.c` 和公共头文件；静态库依赖 `calc.o`，程序依赖 `main.o` 与静态库。
3. 规则下方就是上一节手动执行过的编译、归档和链接命令。

`$(CC)` 等写法引用 Make 变量。这里用 `CPPFLAGS` 保存预处理选项，用 `CFLAGS` 保存 C 编译选项；变量只有被命令引用后才起作用。`| build-make` 要求目录先存在，同时避免因目录时间戳变化而触发重编译。`.PHONY: all clean` 将两者声明为任务目标，避免同名文件影响执行。

第一次构建并运行：

```sh
make
./build-make/calc-demo
```

应看到两次编译、一次归档和一次链接，程序打印 `2 + 3 = 5`。再执行 `make`，应提示无需更新，且没有新的编译命令。

### 观察增量构建

用 `touch` 只更新时间戳，模拟输入文件发生变化：

```sh
touch src/main.c
make -n
make
```

`make -n` 预览本例将执行的命令。应只重新编译 `main.o`、重新链接程序，`calc.o` 与静态库沿用。

接着更新库实现的时间戳：

```sh
touch src/calc.c
make
```

应只重新编译 `calc.o`，更新 `libcalc.a` 并重新链接程序，`main.o` 沿用。这对应上一节依赖图中的 `calc.o → libcalc.a → 程序` 分支。

再修改公共头文件的时间戳：

```sh
touch include/calc.h
make
```

应重新编译两个 `.o`、更新归档并链接。即使头文件内容没有变化，时间戳依赖规则仍会要求重建。这说明 Make 依据声明的规则和文件时间判断更新，不分析 C 代码的语义。

本例直接列出头文件。工程扩大后，可以通过编译器生成依赖列表，例如用 GCC 的 `-MMD` 记录用户头文件依赖，再交给 Make 读取。

### 改了编译选项，也要使旧产物失效

对上面已经完成的构建执行：

```sh
make CPPFLAGS='-Iinclude -DCALC_TRACE=1'
./build-make/calc-demo
```

这份 Makefile 没有把编译命令变化登记为更新条件，普通 Make 也不会自动比较前后两次命令。其他输入未变时，本例不会重新编译，输出仍只有 `2 + 3 = 5`。

本例可以显式强制重建：

```sh
make -B CPPFLAGS='-Iinclude -DCALC_TRACE=1'
./build-make/calc-demo
```

本例的 `CPPFLAGS` 用于两个源码的编译，`-B` 会强制重新编译两个 `.o`、更新归档并链接。运行时应先输出日志，再输出计算结果。切回默认开关时也需要重建。实际工程可以用配置文件依赖、独立构建目录或其他机制管理配置变化；正确的增量构建不能只考虑 `.c` 文件。

### 清理构建产物

需要从头构建时，也可以先清理再构建：

```sh
make clean
make
./build-make/calc-demo
```

`clean` 目标执行 `rm -rf build-make`，删除本例的 Make 构建产物。下次 `make` 应重新创建目录，完成两次编译、一次归档和一次链接。

## CMake：用目标描述工程

Makefile 可以用模式规则、自动依赖等机制管理更大的工程，但仍需维护源文件、编译要求、库依赖和相应规则。CMake 提供更高一层的描述：有哪些可执行程序和库，各自使用什么源码，又依赖谁。

本例用两个**目标（target）**建模：静态库目标 `calc`，以及依赖它的程序目标 `calc-demo`。CMake 将它们转换为所选构建系统的规则。

先区分几个概念：

| 概念                | 本例中的含义                                                 |
| ------------------- | ------------------------------------------------------------ |
| 源码目录            | 放置顶层 `CMakeLists.txt` 和源码的工程根目录                 |
| 构建目录            | 放置缓存、生成规则、目标文件及程序的独立目录                 |
| 目标                | 工程中的逻辑构建单元，如库 `calc`；名称不等于完整文件路径    |
| 生成器（generator） | 选择生成哪种构建系统，如 `Unix Makefiles`、`Ninja`           |
| 缓存变量            | 在构建目录的 `CMakeCache.txt` 中保存配置，后续配置时继续使用 |

### CMakeLists.txt

本例只需要三个源码／头文件和 `CMakeLists.txt`。在工程根目录新建 `CMakeLists.txt`：

<CodeTree title="calc-demo · CMake" :files="cmakeFiles" initial-file="CMakeLists.txt" :initialSidebarExpanded="false">
<template #header>

<<< ./assets/calc-demo/include/calc.h{c}

</template>
<template #calc>

<<< ./assets/calc-demo/src/calc.c{c}

</template>
<template #main>

<<< ./assets/calc-demo/src/main.c{c}

</template>
<template #cmake>

<<< ./assets/calc-demo/cmake-lists.txt{cmake}

</template>
</CodeTree>

这些 API 各自负责一件事：

| API                            | 作用                                                                    |
| ------------------------------ | ----------------------------------------------------------------------- |
| `cmake_minimum_required()`     | 声明最低 CMake 版本，并建立对应的策略基线                               |
| `project(... LANGUAGES C)`     | 声明工程并启用 C 语言                                                   |
| `set()`                        | 设置变量；这里用三个 `CMAKE_C_*` 变量为随后创建的目标初始化语言标准要求 |
| `option()`                     | 定义布尔缓存选项，给出描述与初始默认值                                  |
| `add_library(calc STATIC ...)` | 用列出的源码创建静态库目标                                              |
| `add_executable()`             | 用列出的源码创建可执行程序目标                                          |
| `target_include_directories()` | 为目标声明头文件搜索目录及传播范围                                      |
| `target_compile_options()`     | 为目标添加编译选项                                                      |
| `target_compile_definitions()` | 为目标添加预处理宏定义，参数中省略 `-D`                                 |
| `target_link_libraries()`      | 声明目标的链接依赖，并使用依赖目标提供的使用要求                        |

`CMAKE_C_STANDARD 17`、`CMAKE_C_STANDARD_REQUIRED ON` 和 `CMAKE_C_EXTENSIONS OFF` 共同要求本例使用 C17 模式，并关闭 GNU 扩展模式。

`${CMAKE_CURRENT_SOURCE_DIR}` 展开为当前 `CMakeLists.txt` 所在的源码目录。本例据此构造头文件目录的绝对路径，使它不依赖运行编译器时的工作目录。

### PRIVATE、PUBLIC 与 INTERFACE

头文件目录、宏定义等属性不仅影响目标自身，还可能成为使用该目标时需要的条件，即**使用要求（usage requirements）**。

| 范围        | 用于目标自身 | 传递给使用者 |
| ----------- | ------------ | ------------ |
| `PRIVATE`   | 是           | 否           |
| `PUBLIC`    | 是           | 是           |
| `INTERFACE` | 否           | 是           |

在本例中：

- `calc` 自己要包含 `calc.h`，调用它的 `main.c` 也要包含，所以头文件目录设为 `PUBLIC`。
- 日志宏只控制 `calc.c` 的内部代码，所以设为 `PRIVATE`。
- `calc-demo` 链接 `calc` 后，会获得它公开的头文件搜索目录，无需再重复声明。

`target_link_libraries(calc-demo PRIVATE calc)` 指定依赖目标，CMake 会安排所需的库构建和链接输入。

### 配置、生成与构建

选择 `Unix Makefiles` 生成器后，CMake 会在 `build-cmake/` 中生成自己的 Makefile，无需上一节手写的 Makefile。先配置并生成，再构建、运行：

```sh
cmake -S . -B build-cmake -G "Unix Makefiles" \
    -DCMAKE_C_COMPILER=gcc -DCMAKE_BUILD_TYPE=Debug -DCALC_TRACE=OFF
cmake --build build-cmake --verbose
./build-cmake/calc-demo
```

应生成 `build-cmake/libcalc.a` 和程序，运行打印 `2 + 3 = 5`。

这里包含几个步骤：

1. **配置**：读取 `CMakeLists.txt`、处理变量和条件、确定工具链与目标属性。
2. **生成**：根据生成器，将目标及依赖写成 Makefile 等构建规则。前两个步骤由第一条命令完成。
3. **构建**：`cmake --build` 调用所选后端，后端再执行编译、归档和链接。`--verbose` 用于查看实际命令。

这里的 `Debug` 是单配置生成器使用的构建配置，与 `CALC_TRACE` 日志选项相互独立。缓存位于构建目录，重复配置同一目录会沿用未被覆盖的缓存值。需要换编译器或生成器时，使用新的构建目录。

`-S`、`-B`、`-G` 和构建模式的具体用途可查 [CMake 命令行文档](https://cmake.org/cmake/help/latest/manual/cmake.1.html)。

### 从 CMake 选项到 C 宏

重新配置同一个构建目录：

```sh
cmake -S . -B build-cmake -DCALC_TRACE=ON
cmake --build build-cmake --verbose
./build-cmake/calc-demo
```

现在应先输出日志，再输出结果。两个 `-D` 要区分：

| 命令                        | 设置的对象                  |
| --------------------------- | --------------------------- |
| `gcc -DCALC_TRACE=1 ...`    | 本次预处理的 C 宏           |
| `cmake -DCALC_TRACE=ON ...` | 构建目录中的 CMake 缓存变量 |

本例通过 `if(CALC_TRACE)` 和 `target_compile_definitions()` 将两者连接起来。

观察详细构建输出：这次只需重编译 `calc.c`、更新库并重新链接；`main.c` 不受私有日志宏影响。CMake 生成的规则也能处理本例中目标编译参数的变化。

CMake 还会为这些 C 文件安排头文件依赖追踪。可以分别 `touch src/main.c`、`touch src/calc.c` 或 `touch include/calc.h`，每次更新后都执行构建，按[上一节静态库方案的依赖图](./multi-file.md#增量构建)核对哪些目标文件、库和程序需要更新。CMake 使用的构建目录和目标文件名可以不同，依赖关系相同。重新执行构建而输入未变时，应沿用产物。

## Ninja：另一种构建后端

Ninja 也根据依赖执行构建命令，它可以代替 GNU Make，被 CMake 等工具使用。沿用同一份源码和 `CMakeLists.txt`，换一个构建目录及生成器即可体验：

```sh
cmake -S . -B build-ninja -G Ninja \
    -DCMAKE_C_COMPILER=gcc -DCMAKE_BUILD_TYPE=Debug -DCALC_TRACE=OFF
cmake --build build-ninja
./build-ninja/calc-demo
```

CMake 这次生成 `build.ninja`，由 Ninja 执行。Ninja 还把命令变化纳入重建判定，但依赖仍需要准确描述。

## 命令运行器

CMake 的配置命令包含生成器、构建目录和选项，重复输入比较繁琐。有没有办法可以简化呢？

沿用 [CMakeLists.txt](#cmakelists-txt) 一节中的四个文件，在工程根目录加入下面的新 `Makefile`：

<CodeTree title="calc-demo · 命令运行器" :files="commandRunnerFiles" initial-file="Makefile" :initialSidebarExpanded="false">
<template #header>

<<< ./assets/calc-demo/include/calc.h{c}

</template>
<template #calc>

<<< ./assets/calc-demo/src/calc.c{c}

</template>
<template #main>

<<< ./assets/calc-demo/src/main.c{c}

</template>
<template #cmake>

<<< ./assets/calc-demo/cmake-lists.txt{cmake}

</template>
<template #makefile>

<<< ./assets/calc-demo/command-runner-makefile{makefile}

</template>
</CodeTree>

| 命令                  | 作用                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------ |
| `make build` / `make` | 配置并构建 Debug；使用 GCC、`Unix Makefiles`、`build-debug/`，并设置 `CALC_TRACE=ON` |
| `make run`            | 先完成上述构建，再运行 `build-debug/calc-demo`                                       |
| `make clean`          | 删除 `build-debug/`，包括其中的缓存、生成规则和编译产物；目录不存在时也能成功        |

本页开头的手写 Makefile 直接记录 `.c`、`.o`、静态库和程序的依赖；这里的根目录 Makefile 只编排任务。外层 Make 执行任务命令，CMake 读取 `CMakeLists.txt` 并生成构建规则，`cmake --build` 再在构建目录中调用 Make。源码依赖交给 CMake 及其生成的规则管理。

依次体验这些入口：

```sh
make clean
make
make build
make run
make clean
```

除了 Makefile，也可以用 shell 脚本或其他语言实现类似的命令运行器。

## 自主实验

沿用[命令运行器示例](#命令运行器)中的五文件项目，在 `calc-demo/` 根目录继续修改，依次完成以下两个任务。

### 任务一：为静态库增加功能

为示例工程增加减法功能：

1. 新建 `src/subtract.c`，定义 `int calc_subtract(int a, int b)`，返回 `a - b`。
2. 在 `calc.h` 中声明该函数，在 `main.c` 中调用并打印 `5 - 2 = 3`。
3. 将新源码加入 `add_library(calc STATIC ...)` 的列表；也可以用 `target_sources(calc PRIVATE src/subtract.c)` 追加。
4. 通过 `make run` 完成配置、构建和运行，根目录 Makefile 无需登记新源码。

**验收：**程序应保留加法日志和结果，增加减法结果。执行 `ar t build-debug/libcalc.a`，应能找到新加入的 `subtract.c.o`。再解释：为什么 `main.c` 能找到 `calc.h`，为什么它不需要直接知道 `libcalc.a` 的磁盘路径，以及日志宏为什么只加在 `calc` 上。

### 任务二：区分 Debug 与 Release 构建

实际工程通常为同一份源码保留不同的构建配置：Debug 方便定位问题，Release 侧重优化后的运行表现。它们已经是 CMake 的标准配置；本任务要完善的是本工程的日志策略和命令入口。

在本章使用的 Linux、GCC 环境中，未额外改动编译选项时，CMake 通常采用以下默认值：

| 配置      | 典型默认编译选项     | 对读者的影响                                                                                                                 |
| --------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Debug`   | `-g`；默认未启用优化 | 保留调试信息，便于设置断点、单步执行和查看变量                                                                               |
| `Release` | `-O3 -DNDEBUG`       | 启用较高等级优化；定义 `NDEBUG`，使标准断言宏 [`assert`](https://www.man7.org/linux/man-pages/man3/assert.3.html) 不执行检查 |

优化可能使代码重排、内联，导致单步顺序或变量显示与源码不完全对应。具体选项可以被工具链、环境和工程设置改变，应查看实际命令；Release 也可以另行启用调试信息。上述默认值可在 [CMake 的 GNU 编译器模块](https://github.com/Kitware/CMake/blob/v3.28.6/Modules/Compiler/GNU.cmake)中核对。

本实验继续使用 `Unix Makefiles` 这一单配置生成器，在配置时通过 `CMAKE_BUILD_TYPE` 选择 `Debug` 或 `Release`；未设置时不能假定它就是 Debug。[CMake 构建配置文档](https://cmake.org/cmake/help/v3.28/manual/cmake-buildsystem.7.html#build-configurations)解释了配置的选择方式。

完成以下修改：

1. 修改 `CMakeLists.txt` 中添加日志宏的条件：Debug 下尊重 `CALC_TRACE` 开关，Release 下始终不启用日志，即使调用者指定了 `CALC_TRACE=ON`。可结合 `CMAKE_BUILD_TYPE`、`CALC_TRACE` 和 `if()` 判断；本实验统一使用表中的配置名拼写。
2. 为根目录 Makefile 增加 `make release` 和 `make run-release`：前者配置并构建 Release，使用独立的 `build-release/`，设置 `CALC_TRACE=OFF`；后者先构建再运行 Release 程序。原有 Debug 入口仍默认开启日志。
3. 让 `make clean` 同时删除 `build-debug/`、`build-release/`。保持两套目录独立，便于对照缓存、命令和产物。

**提示：**日志开关是本工程的策略，CMake 不会因为选择 Release 自动关闭自定义的 trace。保留现有警告选项，让构建配置提供调试、优化选项；若在 `target_compile_options()` 中对所有配置追加 `-O0`，会覆盖 Release 的优化设置。

**验收：**先清理，再分别构建并运行两种配置：

```sh
make clean
make run
make run-release
```

两者都应打印加法和减法结果，只有 Debug 输出加法日志。查看首次构建的详细命令：Debug 应带调试信息选项，Release 应带优化选项和 `NDEBUG` 宏。这个规模的示例不适合用单次运行耗时比较性能。

再绕过命令入口，直接检验 CMakeLists.txt 中的日志规则：

```sh
cmake -S . -B build-debug -DCMAKE_BUILD_TYPE=Debug -DCALC_TRACE=OFF
cmake --build build-debug
./build-debug/calc-demo

cmake -S . -B build-release -DCMAKE_BUILD_TYPE=Release -DCALC_TRACE=ON
cmake --build build-release
./build-release/calc-demo
```

这两次运行都应只打印计算结果，没有 trace。前者验证 Debug 可以关闭日志；后者验证 Release 的限制由 CMakeLists.txt 保证，而不只依赖根目录 Makefile 传入的选项。
