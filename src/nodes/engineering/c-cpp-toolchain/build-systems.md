# Make、CMake 与 Ninja

Make 根据文件依赖决定执行哪些命令；CMake 用目标及其属性描述工程，再生成供 Make、Ninja 等工具执行的构建系统。两者可以配合使用。

以下继续在完整示例的 `calc-demo/` 根目录操作。手动构建使用 `build/`，Make 使用 `build-make/`，CMake 的各个配置使用独立目录。

## Makefile：记录依赖和命令

上一节的每次修改都要求手动判断要执行哪些命令。Makefile 将这种判断写成规则：

```makefile
目标: 前置依赖
	生成或更新目标的命令
```

目标文件不存在，或某个前置文件比它更新时，Make 会执行对应命令，并沿依赖关系更新后续目标。命令行通常必须以真正的 Tab 开头。

在工程根目录新建 `Makefile`，复制以下完整内容：

<<< ./assets/calc-demo/makefile{makefile}

读这份文件时，先看三件事：

1. `all` 是默认目标，最终要求生成 `build-make/calc-demo`。
2. 两个 `.o` 都依赖各自的 `.c` 和公共头文件；静态库依赖 `calc.o`，程序依赖 `main.o` 与静态库。
3. 规则下方就是上一节手动执行过的编译、归档和链接命令。

`$(CC)` 等写法引用 Make 变量。这里用 `CPPFLAGS` 保存预处理选项，用 `CFLAGS` 保存 C 编译选项；变量只有被命令引用后才起作用。`| build-make` 要求目录先存在，同时避免因目录时间戳变化而触发重编译。`.PHONY: all` 将 `all` 声明为任务名。

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

再修改公共头文件的时间戳：

```sh
touch include/calc.h
make
```

应重新编译两个 `.o`、更新归档并链接。即使头文件内容没有变化，时间戳依赖规则仍会要求重建。这说明 Make 依据声明的规则和文件时间判断更新，不分析 C 代码的语义。

本例直接列出头文件。工程扩大后，可以通过编译器生成依赖列表，例如用 GCC 的 `-MMD` 记录用户头文件依赖，再交给 Make 读取；漏登记的依赖不会自动得到修复。[GNU Make 手册](https://www.gnu.org/software/make/manual/make.html)可用于查询规则、文件时间与变量的含义，[GCC 预处理选项](https://gcc.gnu.org/onlinedocs/gcc/Preprocessor-Options.html)说明依赖文件如何生成。

### 改了编译选项，也要使旧产物失效

对上面已经完成的构建执行：

```sh
make CPPFLAGS='-Iinclude -DCALC_TRACE=1'
./build-make/calc-demo
```

这份 Makefile 没有把编译命令变化登记为更新条件，普通 Make 也不会自动比较前后两次命令。因此很可能没有重新编译，输出仍只有 `2 + 3 = 5`。

本例可以显式强制重建：

```sh
make -B CPPFLAGS='-Iinclude -DCALC_TRACE=1'
./build-make/calc-demo
```

这次应先输出日志，再输出计算结果。切回默认开关时也需要重建。实际工程可以用配置文件依赖、独立构建目录或其他机制管理配置变化；正确的增量构建不能只考虑 `.c` 文件。

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

在工程根目录新建 `CMakeLists.txt`，复制以下完整内容。其中警告选项约定用于 GCC／Clang：

<<< ./assets/calc-demo/cmake-lists.txt{cmake}

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

`CMAKE_C_STANDARD 17`、`CMAKE_C_STANDARD_REQUIRED ON` 和 `CMAKE_C_EXTENSIONS OFF` 共同要求本例使用 C17 模式，并关闭 GNU 扩展模式。它们不意味着编译器会拒绝所有扩展用法，仍需结合诊断选项。

`${CMAKE_CURRENT_SOURCE_DIR}` 展开为当前 `CMakeLists.txt` 所在的源码目录。本例据此构造头文件目录的绝对路径，使它不依赖运行编译器时的工作目录。

需要核对具体参数时，可从 [CMake 命令索引](https://cmake.org/cmake/help/latest/manual/cmake-commands.7.html)进入对应 API，而不必把所有命令语法一次记住。

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

`target_link_libraries(calc-demo PRIVATE calc)` 表达的是依赖目标。CMake 会安排所需的库构建和链接输入；源码仍然需要用 `#include` 获得声明。[CMake 构建系统文档](https://cmake.org/cmake/help/latest/manual/cmake-buildsystem.7.html)进一步解释目标及使用要求。

### 配置、生成与构建

先配置并生成 Unix Makefiles，再构建、运行：

```sh
cmake -S . -B build-cmake -G "Unix Makefiles" \
    -DCMAKE_C_COMPILER=gcc -DCMAKE_BUILD_TYPE=Debug -DCALC_TRACE=OFF
cmake --build build-cmake --verbose
./build-cmake/calc-demo
```

应生成 `build-cmake/libcalc.a` 和程序，运行打印 `2 + 3 = 5`。三项工作有不同职责：

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

本例通过 `if(CALC_TRACE)` 和 `target_compile_definitions()` 将两者连接起来。CMake 变量不会仅因同名就自动成为 C 宏。[`option()` 文档](https://cmake.org/cmake/help/latest/command/option.html)说明缓存选项的行为，[编译定义文档](https://cmake.org/cmake/help/latest/command/target_compile_definitions.html)说明如何将宏加到目标上。

观察详细构建输出：这次只需重编译 `calc.c`、更新库并重新链接；`main.c` 不受私有日志宏影响。CMake 生成的规则能处理本例中目标编译参数的变化，不能把前面那份手写 Makefile 的限制直接套到所有 Make 构建上。

CMake 还会为这些 C 文件安排头文件依赖追踪。可以再次 `touch src/main.c` 或 `touch include/calc.h`，然后构建，核对重编译范围是否符合上一节的依赖图。重新执行构建而输入未变时，应沿用产物。

### 修改这个工程

用下面的小任务检验是否能维护 CMake 工程：

1. 新建 `src/subtract.c`，定义 `int calc_subtract(int a, int b)`，返回 `a - b`。
2. 在 `calc.h` 中声明该函数，在 `main.c` 中调用并打印 `5 - 2 = 3`。
3. 将新源码加入 `add_library(calc STATIC ...)` 的列表；也可以用 `target_sources(calc PRIVATE src/subtract.c)` 追加。
4. 再次配置、构建并运行。应保留加法输出，增加减法输出；新目标文件应被纳入 `calc` 静态库。

再解释：为什么 `main.c` 能找到 `calc.h`，为什么它不需要直接知道 `libcalc.a` 的磁盘路径，以及日志宏为什么只加在 `calc` 上。

## Ninja：另一种构建后端

Ninja 也根据依赖执行构建命令，其构建文件通常由 CMake 等工具生成。沿用同一份源码和 `CMakeLists.txt`，换一个构建目录及生成器即可体验：

```sh
cmake -S . -B build-ninja -G Ninja \
    -DCMAKE_C_COMPILER=gcc -DCMAKE_BUILD_TYPE=Debug -DCALC_TRACE=OFF
cmake --build build-ninja
./build-ninja/calc-demo
```

CMake 这次生成 `build.ninja`，由 Ninja 执行。Ninja 还把命令变化纳入重建判定，但依赖仍需要准确描述。此处只需认识它的后端角色；[Ninja 手册](https://ninja-build.org/manual.html)介绍其设计和与 Make 的区别。
