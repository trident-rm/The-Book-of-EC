<script setup lang="ts">
import { makeFiles } from "./example-files.ts"
</script>

# Makefile：记录依赖和命令

[多文件构建](../c-cpp-toolchain/multi-file.md)中，每次修改都要求手动判断要执行哪些命令。命令又长又难记，依赖分析也容易出错。GNU Make 是一种构建工具，它将构建过程写成规则，帮我们自动完成分析和命令执行。

基本语法如下：

```makefile
目标: 前置依赖
	生成或更新目标的命令
```

目标文件不存在，或某个前置文件比它更新时，Make 会执行对应命令，并沿依赖关系更新后续目标。

本页沿用该示例的静态库方案，Make 的产物放在 `build-make/`，与手动构建的 `build/` 分开。在工程根目录创建文件树中的四个文件：

<CodeTree title="calc-demo · Make" :files="makeFiles" initial-file="Makefile">
<template #header>

<<< ../_shared/assets/calc-demo/include/calc.h{c}

</template>
<template #calc>

<<< ../_shared/assets/calc-demo/src/calc.c{c}

</template>
<template #main>

<<< ../_shared/assets/calc-demo/src/main.c{c}

</template>
<template #makefile>

<<< ./assets/calc-demo/makefile{makefile}

</template>
</CodeTree>

这份文件中：

1. `all` 是默认目标，最终要求生成 `build-make/calc-demo`。
2. 两个 `.o` 都依赖各自的 `.c` 和公共头文件；静态库依赖 `calc.o`，程序依赖 `main.o` 与静态库。
3. 规则下方就是手动构建时执行过的编译、归档和链接命令。

`$(CC)` 等写法引用 Make 变量。这里用 `CPPFLAGS` 保存预处理选项，用 `CFLAGS` 保存 C 编译选项；变量只有被命令引用后才起作用。`| build-make` 要求目录先存在，同时避免因目录时间戳变化而触发重编译。`.PHONY: all clean` 将两者声明为任务目标，避免同名文件影响执行。

第一次构建并运行：

```sh
make
./build-make/calc-demo
```

应看到两次编译、一次归档和一次链接，程序打印 `2 + 3 = 5`。再执行 `make`，应提示无需更新，且没有新的编译命令。

## 观察增量构建

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

应只重新编译 `calc.o`，更新 `libcalc.a` 并重新链接程序，`main.o` 沿用。这对应[多文件构建依赖图](../c-cpp-toolchain/multi-file.md#增量构建)中的 `calc.o → libcalc.a → 程序` 分支。

再修改公共头文件的时间戳：

```sh
touch include/calc.h
make
```

应重新编译两个 `.o`、更新归档并链接。即使头文件内容没有变化，时间戳依赖规则仍会要求重建。这说明 Make 依据声明的规则和文件时间判断更新，不分析 C 代码的语义。

本例直接列出头文件。工程扩大后，可以通过编译器生成依赖列表，例如用 GCC 的 `-MMD` 记录用户头文件依赖，再交给 Make 读取。

## 改了编译选项，也要使旧产物失效

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

## 清理构建产物

需要从头构建时，也可以先清理再构建：

```sh
make clean
make
./build-make/calc-demo
```

`clean` 目标执行 `rm -rf build-make`，删除本例的 Make 构建产物。下次 `make` 应重新创建目录，完成两次编译、一次归档和一次链接。
