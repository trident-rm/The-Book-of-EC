# 语言服务

**语言服务**为编辑器提供基于代码含义的补全、跳转、引用查找、重命名和诊断。例如，对 `calc_add` 执行重命名时，工具可以修改它的声明、定义及已识别的引用，并区分拼写相同却属于其他作用域的名字。

本节点以 [C/C++ 工具链与构建流程](../c-cpp-toolchain/intro.md)为基础，介绍辅助阅读和修改代码的工具。[下一页](formatting-and-checks.md)介绍格式化、静态检查与头文件依赖整理，可按需求分别选用。

## 编辑器、协议与实现

[clangd](https://clangd.llvm.org/features) 是一种 C/C++ **语言服务器**：它在后台分析代码，编辑器中的客户端负责传递编辑内容、发出请求并展示结果。例如，VS Code 的 [clangd 扩展](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)就是连接编辑器与 clangd 的客户端。

两者通过 **LSP（Language Server Protocol，语言服务器协议）**通信。它规定如何请求补全、返回跳转位置、报告诊断等，使同一个语言服务器可以接入不同编辑器。以 clangd 为例：

```mermaid
flowchart LR
    editor["编辑器中的客户端"] <-->|LSP| server["clangd 语言服务器"]
    project["工程的编译信息"] --> server
```

语言服务描述能力，clangd 是具体实现，LSP 是通信协议。[LSP 官方介绍](https://microsoft.github.io/language-server-protocol/)说明了编辑器与服务器的分工。

## clangd 如何理解工程

同一份源码使用不同的宏、头文件路径和语言标准，含义可能不同。实际构建通过 `-I`、`-D`、`-std` 等编译参数指定这些条件，clangd 也需要知道它们。

**编译数据库（compilation database）**通常以 `compile_commands.json` 保存，记录各源文件的编译命令和工作目录。它一般由构建系统或构建记录工具生成，让 clangd 等工具复用编译信息，通常无需手工维护。它记录的是如何编译源文件，不会自行执行构建。

clangd 通常从数据库取得每个文件的编译命令，再用于分析；简单文件也可以使用默认参数。数据库缺失、过期或对应另一组构建配置时，可能出现找不到头文件、条件编译分支判断错误等现象。[编译命令说明](https://clangd.llvm.org/design/compile-commands)解释了这些信息的来源和作用。

## 配置与实际编译器的差异

工程中的 `.clangd` 是 YAML 格式的配置文件，可以指定数据库位置、补充或移除分析参数，也可以调整诊断等行为。详见 [clangd 配置文档](https://clangd.llvm.org/config)。

例如，编译数据库（`compile_commands.json`）位于工程根目录的 `build/` 中时，就可以在根目录的 `.clangd` 中记录：

```yaml
CompileFlags:
  CompilationDatabase: build
```

遇到编译信息不适合 clangd 的情况，还可以通过 `CompileFlags.Add`、`CompileFlags.Remove` 等调整参数。这些设置影响 clangd 的分析，而不会同步修改项目的实际构建命令。

**即使编译信息齐全，clangd 也不能保证与实际编译器完全一致。** 它使用自己的 Clang 前端理解代码，GCC、MSVC 等实现的扩展和参数未必能被完全复现；为了及时响应，clangd 也会省略部分分析。`.clangd` 能帮助对齐上下文，但没法把 clangd 变成另一个编译器。编辑器诊断可能误报或漏报，仍需实际构建和测试验证。[clangd FAQ](https://clangd.llvm.org/faq#why-does-clangd-produce-false-or-missing-diagnostics) 给出了部分诊断差异的原因。

## 其他语言服务器

[Microsoft C/C++ 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)在 VS Code 中提供另一套 C/C++ IntelliSense 能力，包括补全、导航与诊断。它可以从编译器、编译数据库或 CMake Tools 等配置提供者取得工程信息，手动设置的入口是 `.vscode/c_cpp_properties.json`。[IntelliSense 配置说明](https://code.visualstudio.com/docs/cpp/configure-intellisense)用于了解各类信息如何接入。

一般来说，Microsoft C/C++ 扩展的基础配置比 clangd 扩展更简单、易上手，但后者提供的语言服务能力更丰富、可定制性更高。两者都可以在 VS Code 中使用，用户可根据需求选择。
