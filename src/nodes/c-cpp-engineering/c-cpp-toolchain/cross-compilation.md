# 交叉编译

**交叉编译（cross-compilation）**是在一个平台上运行编译工具，生成供另一个平台运行的程序。这里的平台既包括操作系统，也包括 CPU 架构。

本页固定在 x86_64 Linux 上，分别为本机 Linux 和 x86_64 Windows 编译同一份程序：

| 构建方式 | 编译器运行的平台 | 生成程序的运行平台 |
| -------- | ---------------- | ------------------ |
| 本机编译 | x86_64 Linux     | x86_64 Linux       |
| 交叉编译 | x86_64 Linux     | x86_64 Windows     |

## 从 Linux 构建 Windows 程序

要执行下面的例子，需要在 Linux 上准备 GCC 与 MinGW-w64 组合的 Windows 交叉工具链，以及用于识别文件类型的 `file` 命令。[MinGW-w64 的 Debian / Ubuntu 指引](https://www.mingw-w64.org/getting-started/debian/)给出了这些发行版上的交叉工具链安装方法与编译示例。

安装后，确认工具入口：

```sh
command -v gcc x86_64-w64-mingw32-gcc file
```

在一个空目录中，将前文的加法程序保存为 `main.c`：

<<< ./assets/single-file/main.c{c}

先用本机 GCC 构建 Linux 程序并运行：

```sh
gcc -std=c17 main.c -o main-linux
./main-linux
```

预期输出：

```text
2 + 3 = 5
```

再在同一个 Linux 终端中，用交叉工具链构建 Windows 程序：

```sh
x86_64-w64-mingw32-gcc -std=c17 main.c -o main-windows.exe
```

`x86_64-w64-mingw32-gcc` 本身运行在 Linux 上，面向的却是 x86_64 Windows。它配套的头文件和库也服务于 Windows 目标。

## 查看产物并运行

用 `file` 查看两个文件的类型：

```sh
file main-linux main-windows.exe
```

具体输出随工具版本变化，关键字段应类似以下内容，省略号表示其他信息：

```text
main-linux:       ELF ... x86-64 ...
main-windows.exe: PE32+ ... x86-64 ...
```

`ELF` 和 `PE32+` 分别是本例 Linux 程序与 Windows 程序的文件格式标识。两者的 CPU 架构相同，面向的操作系统不同。文件内容决定了这些属性；把 `main-linux` 重命名为 `.exe` 不会改变它的运行平台。

将 `main-windows.exe` 复制到 x86_64 Windows，在文件所在目录打开 PowerShell，运行：

```powershell
.\main-windows.exe
```

它应输出同样的 `2 + 3 = 5`。有额外库依赖的程序，还需要在目标环境中提供相应的运行库。

本例源码只使用标准 C 接口，可以在两种平台上构建；使用平台专用接口的源码仍需适配目标平台，交叉编译不会自动完成这种适配。

同一操作系统也可能需要交叉编译，例如在 x86_64 Linux 上为 AArch64 Linux 编译程序，此时变化的是 CPU 架构。
