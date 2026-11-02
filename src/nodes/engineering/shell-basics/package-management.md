# 包管理器与环境管理常识

包管理器用统一的命令搜索、安装、升级和卸载软件包，并根据包的信息处理依赖。依赖是软件所需的其他库或程序。相比逐个下载安装包，包管理器还能记录安装信息，方便后续维护。

不同系统和软件生态使用的工具不同，常见的有：

| 环境               | 常见包管理器                                              | 主要管理对象                                              |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| Windows            | WinGet、Scoop、Chocolatey                                 | 应用程序、命令行工具                                      |
| macOS              | Homebrew、MacPorts                                        | 命令行工具和库；Homebrew 也能通过 Cask 安装桌面应用       |
| Linux 发行版       | Debian/Ubuntu 的 apt、Fedora 的 dnf、Arch Linux 的 pacman | 发行版的软件包，包括系统组件、应用和库                    |
| Linux 跨发行版应用 | Snap、Flatpak                                             | 应用程序；与发行版的包管理器可以并用                      |
| Python（跨平台）   | pip                                                       | Python 库和用 Python 编写的工具，不负责安装 Python 解释器 |

**一台电脑可以同时使用多个包管理器，它们的软件覆盖范围并不相同。** 例如，用 WinGet 安装 Python 解释器，再用 pip 安装 Python 库，两者分工不同。即使都用于安装应用程序，也可能需要换一个工具或添加软件源才能找到所需软件。

## 软件源与镜像

软件源（仓库）提供包的信息及获取软件的途径。同一个包管理器可以配置多个软件源；“搜索不到”也可能只是当前配置的源没有收录：

- **VS Code**：Ubuntu 上可通过 Snap 安装；若要从软件源运行 `apt install code`，需要先添加微软的软件源。[VS Code 的 Linux 安装说明](https://code.visualstudio.com/docs/setup/linux) 给出了这两种方式及源的配置方法。
- **Spotify**：提供 Snap 包；用 apt 安装则需要先添加 Spotify 的软件源。[Spotify 的 Linux 安装说明](https://www.spotify.com/download/linux/) 可用于对照两种渠道。

镜像是仓库内容的同步副本，常用于改善下载速度或可达性。例如，pip 通常从 Python 软件包索引 PyPI 获取包，也可以使用它的镜像。更换同一仓库的镜像主要改变下载位置，不等于增加新的软件种类；镜像还可能有同步延迟。[清华 PyPI 镜像说明](https://mirrors.tuna.tsinghua.edu.cn/help/pypi/) 可用于了解临时使用和修改默认配置的区别。

## 为谁安装，由谁维护

用户级安装主要供当前用户使用，通常不需要管理员权限；系统级安装供多个用户使用，通常需要管理员权限。具体支持哪些范围、默认安装到哪里，由包管理器和软件的安装方式决定，不能只凭系统名称判断。

多个包管理器并用，不代表要让它们共同维护同一份文件。建议记住每个软件由谁安装，后续通过相应工具升级和卸载。若产生了多个安装副本，结合[上一节的命令路径与版本查询](./environment#查明实际运行的命令)，确认当前 Shell 实际运行的是哪一个。

Python 还要区分“解释器版本”和“库版本”。已安装 Python 且其中可用 pip 时，`python -m pip --version` 可以查看这个解释器使用的 pip 及其路径；其中的 `python` 应替换为当前环境中实际使用的解释器命令或路径。[pip 使用指南](https://pip.pypa.io/en/stable/user_guide/#running-pip) 解释了这种调用方式。项目需要独立的依赖时，可进一步学习 [Python 虚拟环境](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)，用来隔离不同项目的库。

## 【自主学习】认识自己的包管理器

选择适用于自己系统的一种工具，从官方资料中查找搜索、安装、升级、卸载和查看软件源的方法，再搜索一个常用软件，确认结果中的包名、版本和来源。可从 [WinGet 文档](https://learn.microsoft.com/windows/package-manager/winget/)、[Homebrew 手册](https://docs.brew.sh/Manpage) 或 [Ubuntu 包管理说明](https://documentation.ubuntu.com/server/how-to/software/package-management/) 开始；此处只需查询，不必实际安装。
