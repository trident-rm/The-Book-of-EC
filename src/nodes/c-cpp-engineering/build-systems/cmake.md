<script setup lang="ts">
import { cmakeFiles, presetFiles, commandRunnerFiles } from "./example-files.ts"
</script>

# CMake：用目标描述工程

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

## CMakeLists.txt

本例只需要三个源码／头文件和 `CMakeLists.txt`。在工程根目录新建 `CMakeLists.txt`：

<CodeTree title="calc-demo · CMake" :files="cmakeFiles" initial-file="CMakeLists.txt" :initialSidebarExpanded="false">
<template #header>

<<< ../_shared/assets/calc-demo/include/calc.h{c}

</template>
<template #calc>

<<< ../_shared/assets/calc-demo/src/calc.c{c}

</template>
<template #main>

<<< ../_shared/assets/calc-demo/src/main.c{c}

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
| `add_library(calc STATIC ...)` | 创建静态库目标（target）                                                |
| `add_executable()`             | 创建可执行程序目标（target）                                            |
| `target_include_directories()` | 为目标声明头文件搜索目录。相当于 `-I`                                   |
| `target_compile_options()`     | 为目标添加编译选项                                                      |
| `target_compile_definitions()` | 为目标添加预处理宏定义。相当于 `-D`                                     |
| `target_link_libraries()`      | 声明目标的链接依赖，并使用依赖目标提供的使用要求                        |

`CMAKE_C_STANDARD 17`、`CMAKE_C_STANDARD_REQUIRED ON` 和 `CMAKE_C_EXTENSIONS OFF` 共同要求本例使用 C17 模式，并关闭 GNU 扩展模式。

`${CMAKE_CURRENT_SOURCE_DIR}` 展开为当前 `CMakeLists.txt` 所在的源码目录。本例据此构造头文件目录的绝对路径，使它不依赖运行编译器时的工作目录。

## PRIVATE、PUBLIC 与 INTERFACE

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

## 配置、生成与构建

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

## 从 CMake 选项到 C 宏

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

CMake 还会为这些 C 文件安排头文件依赖追踪。可以分别 `touch src/main.c`、`touch src/calc.c` 或 `touch include/calc.h`，每次更新后都执行构建，并且只更新受影响的目标。

## CMake Preset

**Preset（预设）**将一组 CMake 配置或构建选项保存到文件中，供命令按名称使用。`CMakeLists.txt` 描述工程中的目标与要求；预设记录所选的生成器、构建目录、缓存变量等，免去重复输入长命令。

沿用前面的四个文件，在工程根目录新建 `CMakePresets.json`，注意文件名的大小写：

<CodeTree title="calc-demo · CMake Preset" :files="presetFiles" initial-file="CMakePresets.json" :initialSidebarExpanded="false">
<template #header>

<<< ../_shared/assets/calc-demo/include/calc.h{c}

</template>
<template #calc>

<<< ../_shared/assets/calc-demo/src/calc.c{c}

</template>
<template #main>

<<< ../_shared/assets/calc-demo/src/main.c{c}

</template>
<template #cmake>

<<< ./assets/calc-demo/cmake-lists.txt{cmake}

</template>
<template #presets>

<<< ./assets/calc-demo/cmake-presets.json{json}

</template>
</CodeTree>

`version` 是预设文件的格式版本，`8` 要求 CMake 3.28 或更高版本，与本章的环境约定一致。

| 字段               | 作用                                                            |
| ------------------ | --------------------------------------------------------------- |
| `configurePresets` | 定义配置预设；本例中有一个名为 `debug` 的预设                   |
| `generator`        | 对应配置命令的 `-G`，本例使用 `Unix Makefiles`                  |
| `binaryDir`        | 对应 `-B`，本例展开为源码目录下的 `build-debug/`                |
| `cacheVariables`   | 对应配置命令的 `-D`，设置编译器、构建配置和日志选项             |
| `buildPresets`     | 定义构建预设；通过 `configurePreset` 关联配置预设，确定构建目录 |
| `verbose`          | 设为 `true`，相当于构建命令的 `--verbose`                       |

`${sourceDir}` 和 `${presetName}` 是预设文件的宏，分别展开为源码目录和当前预设名。这里用它们为不同配置安排独立目录，分别保存缓存和产物。预设名 `debug` 可以自定；实际选择 Debug 配置的是 `CMAKE_BUILD_TYPE` 的值。

在工程根目录列出配置预设，再配置、构建和运行：

```sh
cmake --list-presets
cmake --preset debug
cmake --build --preset debug
./build-debug/calc-demo
```

第一条命令应列出 `debug`。配置和构建预设可以同名，由命令区分；运行程序应先输出加法日志，再打印 `2 + 3 = 5`。

构建预设通过关联的配置预设找到构建目录，但不会先按它执行配置。首次使用或修改配置预设后，应先运行 `cmake --preset debug`，再构建。

团队共用的配置放在 `CMakePresets.json` 中，随源码提交；机器路径等个人配置可放在 `CMakeUserPresets.json` 中，并将后者加入 `.gitignore`。预设记录配置选择，本例仍要求 Linux、GCC 和 GNU Make 环境已准备好。[CMake Preset 手册](https://cmake.org/cmake/help/v3.28/manual/cmake-presets.7.html)用于查询完整字段，以及继承、条件和工作流等扩展用法。

## Ninja：另一种构建后端

Ninja 也根据依赖执行构建命令，它可以代替 GNU Make，被 CMake 等工具使用。沿用同一份源码和 `CMakeLists.txt`，这里显式指定生成器和构建目录，便于观察后端切换：

```sh
cmake -S . -B build-ninja -G Ninja \
    -DCMAKE_C_COMPILER=gcc -DCMAKE_BUILD_TYPE=Debug -DCALC_TRACE=OFF
cmake --build build-ninja
./build-ninja/calc-demo
```

CMake 这次生成 `build.ninja`，由 Ninja 执行。Ninja 还把命令变化纳入重建判定，但依赖仍需要准确描述。

## 命令运行器

Preset 保存了 CMake 选项，配置、构建、运行仍需要多条命令。命令运行器可以把这些操作编排成固定任务，并提供清理入口。

沿用 [CMake Preset](#cmake-preset) 一节中的五个文件，将工程根目录的 `Makefile` 写成下面的内容：

<CodeTree title="calc-demo · 命令运行器" :files="commandRunnerFiles" initial-file="Makefile" :initialSidebarExpanded="false">
<template #header>

<<< ../_shared/assets/calc-demo/include/calc.h{c}

</template>
<template #calc>

<<< ../_shared/assets/calc-demo/src/calc.c{c}

</template>
<template #main>

<<< ../_shared/assets/calc-demo/src/main.c{c}

</template>
<template #cmake>

<<< ./assets/calc-demo/cmake-lists.txt{cmake}

</template>
<template #presets>

<<< ./assets/calc-demo/cmake-presets.json{json}

</template>
<template #makefile>

<<< ./assets/calc-demo/command-runner-makefile{makefile}

</template>
</CodeTree>

| 命令                  | 作用                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| `make build` / `make` | 依次使用 `debug` 配置预设和构建预设；产物放在 `build-debug/`，默认开启日志    |
| `make run`            | 先完成上述构建，再运行 `build-debug/calc-demo`                                |
| `make clean`          | 删除 `build-debug/`，包括其中的缓存、生成规则和编译产物；目录不存在时也能成功 |

[前一页的手写 Makefile](make.md) 直接记录 `.c`、`.o`、静态库和程序的依赖；这里的根目录 Makefile 只编排任务。外层 Make 执行任务命令，CMake 按预设选择配置，读取 `CMakeLists.txt` 并生成构建规则，`cmake --build` 再在构建目录中调用 Make。源码依赖交给 CMake 及其生成的规则管理。

依次体验这些入口：

```sh
make clean
make
make build
make run
make clean
```

除了 Makefile，也可以用 shell 脚本或其他语言实现类似的命令运行器。
