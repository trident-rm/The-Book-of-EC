<script setup lang="ts">
import { commandRunnerFiles } from "./example-files.ts"
</script>

# Makefile 用作命令运行器

**命令运行器**将配置、构建、运行和清理组织成具名任务。本页用 Makefile 调用已有的 CMake 预设，把多条命令组合成 `build`、`run`、`clean` 三个入口。

沿用 [CMake Preset](cmake.md#cmake-preset) 一节中的五个文件，在工程根目录新增 `Makefile` 文件：

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

[Make 示例中的手写 Makefile](make.md) 直接记录 `.c`、`.o`、静态库和程序的依赖；这里的根目录 Makefile 只编排任务。外层 Make 执行任务命令，CMake 按预设选择配置，读取 `CMakeLists.txt` 并生成构建规则，`cmake --build` 再在构建目录中调用 Make。源码依赖交给 CMake 及其生成的规则管理。

依次体验这些入口：

```sh
make clean
make
make build
make run
make clean
```

除了 Makefile，也可以用 shell 脚本或其他语言实现类似的命令运行器。
