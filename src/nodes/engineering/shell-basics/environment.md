# 环境变量、PATH 与命令运行

进程运行时不只有程序代码和参数。它还拥有当前工作目录以及一组环境变量。环境变量可以从父进程继承，也可以在进程运行期间修改。

## 环境变量属于进程

环境变量是字符串键值。程序用它们接收与运行环境有关的信息，例如工具搜索路径、语言区域或临时目录。

::: code-group

```powershell [PowerShell]
# 列出所有环境变量
Get-ChildItem Env:

# 读取单个环境变量
$env:USERNAME         # 当前用户名
$env:TEMP             # 系统用的临时目录
```

```bash [Bash/Zsh]
# 列出所有环境变量
env

# 读取单个环境变量
echo "$USER"          # 当前用户名
echo "$TMPDIR"        # 系统用的临时目录
```

:::

## `PATH` 是有顺序的目录列表

`PATH` 是一个有特殊作用的环境变量，它保存了一组目录。输入外部程序名而没有提供路径时，Shell 会用它查找程序；顺序靠前的同名程序可能遮蔽后面的版本。

::: code-group

```powershell [PowerShell]
$env:PATH -split [IO.Path]::PathSeparator
```

```bash [Bash/Zsh]
echo "$PATH" | tr ':' '\n'
```

:::

Windows 通常用分号分隔各项，Linux 和 macOS 通常用冒号。以上的命令将每一项分行输出，便于观察。

## Shell 在哪里查找程序

观察这条命令：

```sh
git status
```

`git` 对应一个外部程序，那么 Shell 需要找到这个程序的可执行文件在哪里。

首先，`git` 可以看作一个相对路径，等价于 `./git`。所以 Shell 会先寻找当前工作目录中名为 `git` 的可执行文件（Windows 上则是 `git.exe`）。如果没找到，那么 Shell 会在 `PATH` 列出的目录中依次查找，直到找到第一个匹配的可执行文件为止。

由此可看出几个问题：

- 没有指明路径的时候，程序所在目录必须被添加到 `PATH` 才能被 Shell 找到，否则会报“找不到命令”或“command not found”错误；
- 如果指明了程序所在路径，Shell 不会再去 `PATH` 中查找；
  ```sh
  ./git status         # 指明使用当前目录中的 git
  /usr/bin/git status  # 指明使用 /usr/bin 中的 git
  ```
- 如果 `PATH` 中有多个目录包含同名程序，Shell 只会运行第一个找到的版本。
  所以如果你在电脑上安装了同一个程序的多个不同版本，可以通过调整它们各自在 `PATH` 中的顺序来控制默认运行哪个版本。

## 查明实际运行的命令

“工具已经安装”不等于“当前 Shell 能找到预期版本”。应在正在使用的 Shell 中查询解析结果。

以下方法可用于查找当前 Shell 实际会运行的 `git` 是哪个命令：

::: code-group

```powershell [PowerShell]
Get-Command git
```

```bash [Bash/Zsh]
which git
```

:::

以下方式则可以列出所有可以检索到的同名候选项（包括因为优先级较低而被遮蔽的，比如在 `PATH` 中靠后的版本）：

::: code-group

```powershell [PowerShell]
where.exe git           # 不能用于别名、函数和 cmdlet
Get-Command git -All    # 还会显示类型
```

```bash [Bash/Zsh]
where git               # 只列出路径
type -a git             # 还会显示类型
```

:::

## 【自主学习】添加 `PATH`

由上述内容，你应当了解到：一个命令行应用程序，安装后，如果想在任意工作目录中方便地使用，需要将其可执行文件所在目录的路径添加到系统的 `PATH` 环境变量中。一些软件安装时，其安装脚本会帮我们完成这一步，但有一些则需要我们自己手动添加 `PATH`。

请自行查询相关资料学习：

1. 在你的系统环境中，如何将一个目录添加到 `PATH` 中？
2. 添加后，如何验证该目录是否已经成功添加到 `PATH` 中？
3. 有些应用是以压缩包的形式分发的，需要用户手动将解压后得到的应用目录放到合适的位置，并配置环境变量。很多应用目录内都有多个子目录、嵌套子目录、大量的各种文件，如何判断哪些目录需要添加到 `PATH` 中？

## 【检查题】

1. 应用进程通常在什么时刻加载环境变量？这意味着什么潜在的问题？为什么有些应用在安装时会提示“请重新打开终端或重启电脑”？
2. 在 Windows PowerShell 中，`where git` 和 `where.exe git` 为什么结果不同？
3. 如果你的电脑上有几个不同的 Python 项目，分别需要 Python 3.8、3.10 和 3.13，你该怎么办？根据本节知识，提出两种可行方案。
4. VS Code 提供了命令行工具 `code` 命令。想办法让 `code` 命令在你的 Shell 中正常可用。
