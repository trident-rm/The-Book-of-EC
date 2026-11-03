# 命令行基础

不同平台的命令行工具有不同的外观和功能，但它们都遵循同样的基本模型：一个终端窗口承载一个 Shell，Shell 读取用户输入的命令、解析参数并启动程序。

---

注意区分以下概念：

| 对象  | 作用                                  | Windows 上的例子        | Linux/macOS 上的例子                              |
| ----- | ------------------------------------- | ----------------------- | ------------------------------------------------- |
| 终端  | 显示文字并接收键盘输入的窗口          | Windows Terminal        | Terminal、<br>iTerm2、Ghostty、<br>GNOME Terminal |
| Shell | 读取命令、解析参数并启动程序          | PowerShell、`cmd.exe`   | sh、Bash、Zsh、Fish                               |
| 命令  | 交给 Shell 的一段文本                 | `git status`            | `git status`                                      |
| 程序  | 被 Shell 启动，实际执行工作的应用程序 | `git.exe`、`python.exe` | `git`、`python`                                   |

同一个终端可以承载不同的 Shell。比如，同一个 Windows Terminal 可以一个标签页运行 PowerShell，另一个标签页运行 `cmd.exe` 或 WSL 中的 Bash。

::: info 本节点的命令约定
本书优先使用 `ls`、`cd`、`pwd`、`mkdir`、`cp`、`mv`、`rm` 这些简短命令名称。在 Windows PowerShell 中，它们可能是别名或函数；在 Linux 和 macOS 中，它们通常是 Shell 内置命令或外部程序。同名不表示支持相同的参数，复制其他平台的命令前必须先确认实际运行的是什么。
:::

终端和 Shell 本质也都是应用程序。你可以使用操作系统默认自带的终端和 Shell，也可以安装使用第三方的终端和 Shell。不同的终端和 Shell 可能有不同的功能、外观和快捷键。

::: info
Windows 10/11 上通常默认自带的 Shell 有 `cmd.exe` 和 PowerShell 5.1。前者是较旧的 Windows 传统工具，笔者建议一般不再使用。

另外还可自行安装使用 PowerShell 7.x（也被称为 `pwsh`），它是微软重构的版本，跨平台、开源、功能更强大。
:::

## 一条命令如何运行

以 `git status --short` 为例，Shell 大致完成以下工作：

1. 将输入识别为命令名 `git` 和两个参数 `status`、`--short`。
2. 按 Shell 自己的规则和 `PATH` 查找 `git` 对应的程序。
3. 启动程序，并把参数、当前工作目录和环境变量交给它。
4. 等待程序结束，接收它报告的退出状态。

这个模型能解释许多常见问题：相对路径错误通常与当前工作目录有关，“找不到命令”通常发生在查找程序时，参数报错则说明程序多半已经成功启动。

## 准备

由于本节内容许多示例用到了 Git 作演示，推荐提前安装 [Git](https://git-scm.com/downloads) 并在终端中确认 `git --version` 能正确输出版本号。
