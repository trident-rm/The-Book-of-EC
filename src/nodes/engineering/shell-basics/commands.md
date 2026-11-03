# 命令、参数与工具探查

面对一个没用过的命令时，不需要先背下全部用法。先辨认命令结构，再确认实际工具，最后从工具自己的帮助中查证参数。

## 命令运行流程

以在 Git 仓库目录中输入以下命令并按下 Enter 为例。这里假设 `git` 对应已安装的 Git 可执行程序：

```sh
git log --oneline -n 5 --all
```

这条命令的运行过程可以概括为五步：

1. **解析输入**：Shell 识别命令名 `git`，以及 `log`、`--oneline`、`-n`、`5`、`--all` 五个参数。
2. **确定命令**：Shell 按自身的命令解析规则，查找 `git` 对应的可执行文件。不同 Shell 的搜索规则可能不同。
3. **启动程序**：Shell 启动 Git 进程，将解析后的参数交给它。新进程还会继承当前工作目录和环境变量。
4. **执行操作**：Git 按自己的规则解释 `log` 和各个参数，读取仓库和环境变量，执行操作并输出结果，或报告错误。参数的具体含义由 Git 决定。
5. **等待结束**：这是一次前台执行，Shell 会等待 Git 结束，接收其退出状态（用于报告执行结果），然后重新显示提示符，等待下一条输入。

`cd`、`pwd`、`echo` 这类命令则通常是 Shell 内置命令，而非外部程序，它们执行时不启动新进程。

## 参数的分割和解析

Shell 通常将空白字符作为参数的分隔符，成对的引号则可以把包含空格的文本组合成一个参数。

下面的示例中，每条命令之后的注释是预期的输出：

::: code-group

```powershell [PowerShell 5.1]
echo hello world         # echo 收到两个参数
# hello
# world

echo hello   world       # echo 收到两个参数
# hello
# world

echo "hello" "world"     # echo 收到两个参数
# hello
# world

echo "hello   world"     # echo 收到一个参数
# hello   world
```

```bash [Bash/Zsh]
echo hello world         # echo 收到两个参数
# hello world

echo hello   world       # echo 收到两个参数
# hello world

echo "hello" "world"     # echo 收到两个参数
# hello world

echo "hello   world"     # echo 收到一个参数
# hello   world
```

:::

Shell 把解析后的参数传递给 `echo` 来执行。前三条示例对于 `echo` 来说没有任何区别，Shell 交给它的都是
`hello` 和 `world` 两个参数。第四条示例中，`echo` 则只收到了
<code>hello &nbsp; world</code> 这一个参数。引号和空格在这里发挥的都是 Shell 的语法作用，而不是 `echo` 的功能，没有参与到输出中。

再来看一看路径的例子。假设当前目录下已有一个名为 `space dir` 的目录，比较下面两种写法：

```sh
cd space dir      # `space` 和 `dir` 分开传入
cd "space dir"    # `space dir` 作为一个路径传入
```

第一条没有把目录名作为一个整体传入，具体行为取决于当前 Shell；第二条将完整目录名作为一个参数传入，进入 `space dir` 目录。

<br>

那么该如何把引号本身作为参数的一部分传给程序呢？不同的 Shell 转义方式不同：

::: code-group

```powershell [PowerShell 5.1]
# PowerShell 中使用反引号转义：
echo `"hello`" `"world`"
# "hello"
# "world"

# 也可以用单双引号交替嵌套的方式：
echo "'hello' 'world'"
# 'hello' 'world'
```

```bash [Bash/Zsh]
# Bash/Zsh 中使用反斜杠转义：
echo \"hello\" \"world\"
# "hello" "world"

# 也可以用单双引号交替嵌套的方式：
echo "'hello' 'world'"
# 'hello' 'world'
```

:::

第一个命令中，`echo` 收到两个参数：`"hello"` 和 `"world"`；第二个命令中，`echo` 收到一个参数：`'hello' 'world'`。

<br>

更多引号规则可见：

- PowerShell 5.1: [about_Quoting_Rules](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-5.1)
- Bash Refernce Manual: [Quoting](https://www.gnu.org/software/bash/manual/html_node/Quoting.html)

## 参数的形式

观察下面这条命令：

```sh
git log --oneline -n 5 --all
```

Shell 会解析出 `log`、`--oneline`、`-n`、`5` 和 `--all` 这五个参数，传递给 Git。这些参数到底分别是什么意思，则取决于 Git 的设计。

理论上，各种参数长什么样子，程序想怎么规定都是可以的。但是大家一般会遵循一些常见约定，便于用户记忆和使用。

| 参数        | 参数类型  | 含义                       |
| ----------- | --------- | -------------------------- |
| `log`       | 子命令    | 显示 commit 历史记录       |
| `--oneline` | 长选项    | 每个 commit 只显示一行     |
| `-n`        | 短选项    | 用于指定输出的 commit 数量 |
| `5`         | `-n` 的值 | 只显示最新的 5 个 commit   |
| `--all`     | 长选项    | 显示所有分支的 commit      |

### 长选项、短选项

长选项指以两个连字符开头、具有较完整描述的选项，例如：

```sh
git --version
git --help

python --version
python --help
python --help-env
```

短选项以一个连字符开头，后跟一个字符，例如：

```bash
git -v
python -V
ls -a
```

有些程序支持将多个短选项连写在一起，例如：

```bash
ls -lAh
ls -l -A -h

rm -rf /path/to/directory
rm -r -f /path/to/directory
```

很多时候，长选项会有一个对应的短选项别名。例如：

```bash
# 查看 Git 版本：
git --version
git -v

# 查看 Python 版本：
python --version
python -V

# 强制递归地删除目录：
rm --recursive --force /path/to/directory
rm -rf /path/to/directory

# Git 拉取时删除远程已删除的分支：
git pull --prune
git pull -p
```

### 带值选项

有些选项接收一个或多个值，但不同程序传值的方式并不统一。常见的写法有：

- 选项和值用空格分开：

  ```sh
  git log -n 5
  ```

  Git 将 `5` 解释为 `-n` 的值。

- 等号连接选项和值：

  ```sh
  git log --max-count=5
  ```

  Shell 把 `--max-count=5` 作为一个参数传给 Git，Git 在其内部拆出选项名和值。

- 短选项和值直接连写：

  ```sh
  clang -Iinclude -DNDEBUG main.c
  ```

  Clang 将 `include` 解释为一个头文件搜索目录，`NDEBUG` 解释为一个宏定义。`-I`、`-D` 都是短选项，后面紧跟的文本就是它们的值。

- 重复选项以提供多个值：

  ```sh
  clang -Iinclude -Ithird_party/include main.c
  ```

  两次 `-I` 各提供一个目录：先后将 `include`、`third_party/include` 添加到头文件搜索路径中。

- 一个选项后跟多个值：

  ```sh
  cmake --build build --target app tests
  ```

  CMake 将 `build` 作为 `--build` 的值，`app`、`tests` 都作为 `--target` 的值。

<br>

以上的约定通常见于 Unix 系的工具和程序。Windows 系程序的形式通常则不一样，例如：

::: code-group

```powershell [PowerShell]
Get-Help Remove-Item                           # 查看帮助信息
Get-Help Get-ChildItem -Online                 # 联机查看

Get-ChildItem -?                               # 查看帮助信息
Remove-Item -?

Get-ChildItem -Path C:\Parent -Depth 3         # 列出目标下三层以内的所有文件和目录
Remove-Item "C:\path\to\dir" -Force -Recurse   # 递归地删除文件或目录
```

```cmd [CMD]
rem 这是一条注释

rem CMD 常用 `/?` 来查看帮助信息
ipconfig /?
waitfor /?

rem 最多等待 100 秒，收到 CopyDone 信号后立即返回
waitfor CopyDone /T 100

rem 在 C 盘下递归查找名为 test 的文件
where /r c:\ test
```

:::

## 学习陌生命令

### 帮助信息

遇到陌生程序、命令、选项时，可以先尝试查看它的帮助信息，确认它的功能和语法。

##### 如何打开帮助信息？

这取决于程序自身的设计，但也有一些惯例。常见的方式有：

```sh
# Git 的帮助入口：
git --help         # 长选项形式
git -h             # 短选项形式
git help           # 子命令形式

# 列出所有 Git 子命令：
git help -a

# 查询 Git 某一子命令的帮助（以 `log` 为例）：
git help log

# Python 的帮助入口：
python --help
python -h

# GCC、Clang、CMake 的帮助入口：
gcc --help
clang --help
cmake --help
```

注意：有些程序可能 `--help` 和 `-h` 显示的内容不同。

对于 PowerShell cmdlet 应优先使用 `Get-Help`：

```powershell
Get-Help Get-ChildItem
Get-Help ls              # PowerShell 中的 `ls` 是 `Get-ChildItem` 的别名
Get-Help Set-Location
Get-Help cd              # PowerShell 中的 `cd` 是 `Set-Location` 的别名
```

##### 如何读懂语法说明？

帮助信息中对语法规则的描述也有一些常见约定。以 Git 的帮助信息为例：

```sh
git --help
```

```
usage: git [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           [--config-env=<name>=<envvar>] <command> [<args>]

These are common Git commands used in various situations:

start a working area (see also: git help tutorial)
   clone     Clone a repository into a new directory
   init      Create an empty Git repository or reinitialize an existing one

work on the current change (see also: git help everyday)
   add       Add file contents to the index
   mv        Move or rename a file, a directory, or a symlink
   restore   Restore working tree files
...
```

usage 栏目列出了具体的语法结构。通常，方括号 `[]` 表示可选项，尖括号 `<>` 必选项，竖线 `|` 表示“或”的关系。上例中，我们可以看到：

- `[-v | --version]` 表示 `-v` 和 `--version` 是可选的，但它们不能同时出现（互斥）（毕竟它们是等价的）。
- `[-C <path>]` 表示 `-C` 后面必须跟一个值作为 `<path>`，但整个 `-C <path>` 是可选的。
- `-p`、`--paginate`、`-P`、`--no-pager` 也是四个互斥的可选项（它们控制同一个语义维度）。
- `<command>` 是必选项，表示必须指定一个子命令。子命令被列举在了下面的列表中，例如 `clone`、`init`、`add`、`mv` 等。

```sh
git add --help
```

```
usage: git add [<options>] [--] <pathspec>...

    -n, --[no-]dry-run    dry run
    -v, --[no-]verbose    be verbose
    -A, --[no-]all        add changes from all tracked and untracked files
...
```

对于 `add` 子命令：

- `<options>` 是选项（option），可以填写零个或多个。可用选项被列举在了下面：
  - `-n`、`--dry-run`、`--no-dry-run` 是一组互斥的选项；
  - `-v`、`--verbose`、`--no-verbose` 又是另一组互斥的选项。
- `<pathspec>` 是路径模式，需有至少一个。（`...` 表示可以填写多个）
- 中间的 `--` 是一个分隔符，表示后续的参数都被视为路径，而不是选项。当路径以 `-` 开头时，就需要用它来分隔，否则 Git 会误当作选项来解析。

### 版本信息

还有一个常见的需求是查询应用程序的版本。不同程序的写法也不统一，常见的形式有：

```sh
# Git 的版本信息：
git --version
git -v
git version        # 子命令形式也支持

# Python 的版本号：
python --version
python -V          # 注意是大写

# GCC、Clang、CMake 的版本信息：
gcc --version
clang --version
cmake --version
```

有时候，小写的 `-v` 是 `--verbose` 的缩写，表示“详细输出”，而不是版本信息。
