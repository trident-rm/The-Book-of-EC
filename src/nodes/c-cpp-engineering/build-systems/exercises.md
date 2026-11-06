# 自主实验

沿用[命令运行器示例](cmake.md#命令运行器)中的六文件项目，在 `calc-demo/` 根目录继续修改，依次完成以下两个任务。

## 任务一：为静态库增加功能

为示例工程增加减法功能：

1. 新建 `src/subtract.c`，定义 `int calc_subtract(int a, int b)`，返回 `a - b`。
2. 在 `calc.h` 中声明该函数，在 `main.c` 中调用并打印 `5 - 2 = 3`。
3. 将新源码加入 `add_library(calc STATIC ...)` 的列表；也可以用 `target_sources(calc PRIVATE src/subtract.c)` 追加。
4. 通过 `make run` 完成配置、构建和运行，根目录 Makefile 无需登记新源码。

**验收：**程序应保留加法日志和结果，增加减法结果。执行 `ar t build-debug/libcalc.a`，应能找到新加入的 `subtract.c.o`。再解释：为什么 `main.c` 能找到 `calc.h`，为什么它不需要直接知道 `libcalc.a` 的磁盘路径，以及日志宏为什么只加在 `calc` 上。

## 任务二：区分 Debug 与 Release 构建

实际工程通常为同一份源码保留不同的构建配置：Debug 方便定位问题，Release 侧重优化后的运行表现。它们已经是 CMake 的标准配置；本任务要完善的是本工程的日志策略、Release 预设和命令入口。

在本章使用的 Linux、GCC 环境中，未额外改动编译选项时，CMake 通常采用以下默认值：

| 配置      | 典型默认编译选项     | 对读者的影响                                                                                                                 |
| --------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Debug`   | `-g`；默认未启用优化 | 保留调试信息，便于设置断点、单步执行和查看变量                                                                               |
| `Release` | `-O3 -DNDEBUG`       | 启用较高等级优化；定义 `NDEBUG`，使标准断言宏 [`assert`](https://www.man7.org/linux/man-pages/man3/assert.3.html) 不执行检查 |

优化可能使代码重排、内联，导致单步顺序或变量显示与源码不完全对应。具体选项可以被工具链、环境和工程设置改变，应查看实际命令；Release 也可以另行启用调试信息。上述默认值可在 [CMake 的 GNU 编译器模块](https://github.com/Kitware/CMake/blob/v3.28.6/Modules/Compiler/GNU.cmake)中核对。

完成以下修改：

1. 修改 `CMakeLists.txt` 中添加日志宏的条件：Debug 下尊重 `CALC_TRACE` 开关，Release 下始终不启用日志，即使调用者指定了 `CALC_TRACE=ON`。可结合 `CMAKE_BUILD_TYPE`、`CALC_TRACE` 和 `if()` 判断；本实验统一使用表中的配置名拼写。
2. 在 `CMakePresets.json` 中增加名为 `release` 的配置预设：沿用 GCC 和 `Unix Makefiles`，将 `CMAKE_BUILD_TYPE` 设为 `Release`、`CALC_TRACE` 设为 `OFF`，使用独立的 `build-release/`。再增加同名构建预设，通过 `configurePreset` 关联它，并保留详细输出。原有 `debug` 预设仍默认开启日志。
3. 为根目录 Makefile 增加 `make release` 和 `make run-release`：前者依次执行 `release` 配置预设和构建预设，后者先构建再运行 `build-release/calc-demo`。
4. 让 `make clean` 同时删除 `build-debug/`、`build-release/`。保持两套目录独立，便于对照缓存、命令和产物。

**提示：**日志开关是本工程的策略，CMake 不会因为选择 Release 自动关闭自定义的 trace。保留现有警告选项，让构建配置提供调试、优化选项；若在 `target_compile_options()` 中对所有配置追加 `-O0`，会覆盖 Release 的优化设置。

**验收：**先清理，再分别构建并运行两种配置：

```sh
make clean
make run
make run-release
```

两者都应打印加法和减法结果，只有 Debug 输出加法日志。查看首次构建的详细命令：Debug 应带调试信息选项，Release 应带优化选项和 `NDEBUG` 宏。

再直接使用预设，并用命令行 `-D` 覆盖其中的日志选项，检验 `CMakeLists.txt` 中的日志规则：

```sh
cmake --preset debug -DCALC_TRACE=OFF
cmake --build --preset debug
./build-debug/calc-demo

cmake --preset release -DCALC_TRACE=ON
cmake --build --preset release
./build-release/calc-demo
```

这两次运行都应只打印计算结果，没有 trace。前者验证 Debug 可以关闭日志；后者验证 Release 的限制由 `CMakeLists.txt` 保证，而不只依赖预设传入的选项。

命令行的 `-D` 覆盖本次配置时预设提供的值，并写入对应构建目录的缓存。下次不带覆盖参数使用该配置预设时，会重新应用预设中明确声明的缓存值。
