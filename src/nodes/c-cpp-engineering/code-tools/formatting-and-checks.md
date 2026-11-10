# 格式化与代码检查

代码排版不一致、写法可疑、头文件依赖混乱，是三类不同的问题。clang-format、clang-tidy 和 IWYU 分别提供对应的辅助能力，可以独立使用，也可以配合[语言服务](language-services.md)接入编辑器。

## clang-format：统一排版

clang-format 按规则调整缩进、空格、换行和花括号布局等。例如，下面的代码：

```c
int sum(int a,int b){return a+b;}
```

可以按选定风格排成：

```c
int sum(int a, int b) {
    return a + b;
}
```

具体结果由风格配置决定。clang-format 不需要编译数据库，它以 `.clang-format` 作为配置文件。`.clang-format` 是 YAML 格式，放在工程根目录对整个项目生效，也可以再放在子目录中来覆盖父目录的配置。它记录了缩进、空格、换行、花括号布局等规则，也可以指定排除的文件或目录。

示例 `.clang-format`：

```yaml
BasedOnStyle: LLVM
IndentWidth: 4
ColumnLimit: 100
AccessModifierOffset: -4
PointerAlignment: Left
DerivePointerAlignment: false
AlignConsecutiveMacros: Consecutive
AlignAfterOpenBracket: BlockIndent
AllowShortFunctionsOnASingleLine: Empty
BinPackArguments: false
BinPackParameters: OnePerLine
BreakAfterOpenBracketBracedList: true
BreakAfterOpenBracketFunction: true
BreakBeforeCloseBracketBracedList: true
BreakBeforeCloseBracketFunction: true
Cpp11BracedListStyle: true
IndentCaseLabels: true
PackConstructorInitializers: CurrentLine
```

具体可用规则详见[格式选项说明](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)，需注意核对所用 clang-format 版本。

`.clang-format-ignore` 文件也可用于排除不希望格式化的文件或目录。详见[文档](https://clang.llvm.org/docs/ClangFormat.html#clang-format-ignore)。

## clang-tidy：检查可疑写法

clang-tidy 基于 Clang 进行**静态检查**：不运行程序，按选定规则分析源码中的可疑写法、接口误用和部分性能问题，也能检查命名等约定。部分检查可以提供修改建议。

例如：

```c
double usage_ratio(int used, int total) {
    return used / total;
}
```

当 `used` 为 `3`、`total` 为 `8` 时，先执行整数除法，结果 `0` 再转换为 `double`。如果期望得到比例 `0.375`，就需要让除法在浮点类型上进行。启用 [`bugprone-integer-division`](https://clang.llvm.org/extra/clang-tidy/checks/bugprone/integer-division.html) 检查可以提示这类精度损失；是否符合原意，仍需读者判断。

YAML 格式的 `.clang-tidy` 文件用于选择检查，例如用 `Checks` 启用或关闭规则。此外，它还需要头文件路径、宏等编译信息，可以复用编译数据库 `compile_commands.json`。

示例 `.clang-tidy`（仅展示形式，不代表实际可用）：

```yaml
Checks: >
  -*,
  bugprone-*,
  clang-analyzer-*,
  misc-include-cleaner,
  performance-*,
  portability-*,
  readability-*,
  modernize-*,
  -modernize-use-std-print,
  -modernize-use-trailing-return-type,
  -modernize-use-auto,
  -portability-avoid-pragma-once,
WarningsAsErrors: ''
HeaderFilterRegex: '.*/(bsp|shared|robots|tests)/.*'
ExcludeHeaderFilterRegex: '.*/(shared/(math|algorithm)|bsp/src/(boards/[^/]+/\.\./\.\./)?hal/h7/usb)/.*'
FormatStyle: file
CheckOptions:
  misc-include-cleaner.IgnoreHeaders: 'external/.*;sys/.*'
  readability-identifier-naming.AbstractClassCase: CamelCase
  readability-identifier-naming.ClassCase: CamelCase
```

[clang-tidy 文档](https://clang.llvm.org/extra/clang-tidy/)。

## IWYU：理清头文件依赖

**IWYU（Include What You Use）**检查源文件使用的符号与头文件之间的关系，建议补充直接依赖、删除不需要的包含，并在适用时以类型的前置声明代替包含完整定义。

假设 `main.c` 只包含 `log.h`，却直接调用 `printf`；它能编译，是因为 `log.h` 恰巧又包含了 `<stdio.h>`。按 IWYU 倡导的方式，`main.c` 应直接包含 `<stdio.h>`，明确自己对 `printf` 声明的依赖。如果没有使用 `log.h` 提供的接口，还可以考虑移除它。这样以后调整 `log.h` 时，调用者更少受到间接依赖变化的影响。

IWYU 同样需要编译参数，可借助编译数据库批量分析。库的公共头文件与内部头文件之间的关系，必要时用 **`.imp` 映射文件**或源码中的 **`IWYU pragma` 注释**表达，详见[映射文件说明](https://github.com/include-what-you-use/include-what-you-use/blob/master/docs/IWYUMappings.md)与[注释说明](https://github.com/include-what-you-use/include-what-you-use/blob/master/docs/IWYUPragmas.md)；它们让工具了解“应该从哪个公共入口使用这个接口”等约定。

IWYU 约定理论上能很好地提升头文件依赖相关的代码质量，但遗憾的是许多老旧的第三方库并没有遵守 IWYU 的约定，常常引入大量警告，让 IWYU 检查的引入和配置十分困难。

## 与语言服务配合

clangd 已集成 clang-format 的格式化能力，也能读取 `.clang-tidy` 运行部分检查。因此，在编辑器里看到格式化或检查提示，并不意味着单独启动了这些命令行工具；独立工具也可用于批量处理或自动检查。[clangd 功能说明](https://clangd.llvm.org/features)列出了这些集成能力。

clangd 的 Include Cleaner 也能提示缺少或未使用的头文件，与独立的 IWYU 工具存在功能重叠，但它们是不同实现。[头文件管理说明](https://clangd.llvm.org/guides/include-cleaner)解释了 clangd 对直接依赖的要求。可以先使用当前环境已有的能力，再按项目需求引入独立工具；独立运行 clang-tidy、IWYU 时，仍需分别提供适合它们的编译信息，不能假定会沿用 `.clangd` 的设置。
