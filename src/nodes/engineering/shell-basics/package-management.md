# 软件安装、包管理

安装软件时，应确认来源和版本、安装位置，以及后续由谁更新和卸载。同样能运行一个命令，背后的安装方式和维护责任可能不同。

## 常见的软件安装方式

| 方式             | 来源与版本                                       | 位置、权限和 `PATH`                               | 更新与卸载                                   |
| ---------------- | ------------------------------------------------ | ------------------------------------------------- | -------------------------------------------- |
| 安装器           | 通常从开发者官网下载，选择其提供的版本           | 按安装器选项配置；可能需要管理员权限              | 使用软件自身的更新功能、安装器或系统卸载入口 |
| 应用商店         | 使用商店收录的版本                               | 由商店与系统约定管理                              | 通常通过商店维护                             |
| 预编译程序压缩包 | 下载已编译好的程序，自己选择版本                 | 自行放置；命令行工具可能要手动配置 `PATH`         | 通常自行替换或删除文件，并清理相应配置       |
| 包管理器         | 从配置的软件源中选择可用版本                     | 遵循工具的目录与权限约定                          | 用对应包管理器升级、卸载                     |
| 安装脚本         | 从项目提供的地址获取脚本，再由脚本下载或构建程序 | 以执行者的权限运行，可能写入文件并修改 Shell 配置 | 按项目文档维护；有些工具提供自更新功能       |
| 从源码构建       | 获取源代码，可选择版本和构建选项                 | 需准备构建工具与依赖，安装位置由构建配置决定      | 自行维护，或借助打包工具管理                 |

这些方式可以组合。例如，包管理器也可能调用软件自己的安装器；关键是确认哪个工具记录并维护这次安装。

以 Node.js 为例，可以对照三种渠道：

- 从 [Node.js 下载页](https://nodejs.org/en/download) 获取 Windows 的 `.msi` 或 macOS 的 `.pkg` 安装器，按引导安装。
- 从同一下载页获取预编译程序压缩包，解压后自行放置并配置命令搜索路径。注意区分它与需要编译的源码压缩包。
- 通过 Homebrew 的 `brew install node` 安装，后续用 `brew upgrade node`、`brew uninstall node` 维护。[Homebrew 的 Node.js 包页面](https://formulae.brew.sh/formula/node) 可用于核对该渠道提供的版本。

三种渠道提供的版本、路径和配套组件可能不同。应按项目要求选择版本，并分别确认 `node --version` 和 `npm --version` 的结果。

## 包管理器不只有一种

包管理器用统一的命令搜索、安装、升级和卸载软件包，并根据包的信息处理依赖。依赖是软件所需的其他库或程序。

| 环境               | 常见包管理器                                              | 主要管理对象                                              |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| Windows            | WinGet、Scoop、Chocolatey                                 | 应用程序、命令行工具                                      |
| macOS              | Homebrew、MacPorts                                        | 命令行工具和库；Homebrew 也能通过 Cask 安装桌面应用       |
| Linux 发行版       | Debian/Ubuntu 的 apt、Fedora 的 dnf、Arch Linux 的 pacman | 发行版的软件包，包括系统组件、应用和库                    |
| Linux 跨发行版应用 | Snap、Flatpak                                             | 应用程序；与发行版的包管理器可以并用                      |
| Python（跨平台）   | pip                                                       | Python 库和用 Python 编写的工具，不负责安装 Python 解释器 |
| Node.js（跨平台）  | npm、pnpm、Yarn                                           | JavaScript 生态的库和命令行工具                           |

**一台电脑可以同时使用多个包管理器，它们的软件覆盖范围并不相同。** 例如，用 WinGet 安装 Python，再用 pip 安装 Python 库；安装 Node.js 后，再用 npm 安装相应工具。即使都用于安装应用，也可能需要换一个工具或添加软件源才能找到所需软件。

## 常用命令示例

以下以工具已经安装为前提，分别演示不同操作，按需选用。

### 系统中的工具和应用

三组命令都以 Git 为例。apt 中的 `sudo` 用于以管理员权限执行操作；普通 Homebrew 包管理操作通常不需要它。

::: code-group

```powershell [Windows / WinGet]
winget search git
winget install --id Git.Git --exact      # 安装指定 ID 的包
winget upgrade --id Git.Git --exact      # 升级
winget uninstall --id Git.Git --exact    # 卸载
```

```bash [macOS / Homebrew]
brew search git
brew install git
brew upgrade git
brew uninstall git
```

```bash [Debian、Ubuntu / apt]
apt search git
sudo apt update         # 刷新仓库中的可用包信息
sudo apt install git    # 安装，或升级到当前源中的候选版本
sudo apt remove git
```

:::

`apt update` 刷新包信息，升级软件是另一项操作。搜索结果也可能包含多个候选，应先核对包名、来源和版本。具体参数可查阅 [WinGet 文档](https://learn.microsoft.com/windows/package-manager/winget/)、[Homebrew 手册](https://docs.brew.sh/Manpage) 和 [Ubuntu 包管理说明](https://documentation.ubuntu.com/server/how-to/software/package-management/)。

### Python 与 pip

Python 解释器和 Python 库有各自的版本。`python -m pip` 调用这个 Python 解释器对应的 pip，适合确认“库装进了哪个 Python 环境”。下面以已有的 Python 虚拟环境为例；其中的 `python` 应替换为当前环境中实际使用的解释器命令或路径。

```sh
python -m pip --version                    # 显示 pip 版本、路径及对应的 Python 版本
python -m pip install requests             # 安装 HTTP 请求库 Requests
python -m pip install --upgrade requests   # 升级
python -m pip uninstall requests           # 卸载
```

[pip 使用指南](https://pip.pypa.io/en/stable/user_guide/#running-pip) 解释了这种调用方式。[Python 虚拟环境](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/) 用来隔离不同项目的依赖，本节只需知道它的用途。

### Node.js 与 npm

Node.js 是在浏览器之外运行 JavaScript 的运行时；npm 是该生态的包管理器。许多 Node.js 安装渠道会同时提供 npm，可先分别查询版本：

```sh
node --version
npm --version
```

npm 可以安装库，也可以安装命令行工具。下面以代码格式化工具 Prettier 为例：

::: code-group

```sh [全局工具]
npm search prettier
npm install -g prettier
npm update -g prettier
npm uninstall -g prettier
```

```sh [项目内工具]
# 在已有的项目目录中操作
npm install --save-dev prettier    # 作为项目的开发工具安装
npx prettier --version            # 运行项目中的 Prettier，查看版本
npm uninstall prettier
```

:::

`-g` 表示装入当前 npm 的全局安装位置，便于跨目录使用，**不等于系统级安装**；相关可执行文件目录仍需在 `PATH` 中。项目内安装通常将包放入项目的 `node_modules`，工具可通过随 npm 提供的 `npx` 运行。若项目中缺少所需包，`npx` 可能下载到缓存后再执行。

pnpm、Yarn 也是这个生态的包管理器。进入已有项目时，应跟随项目指定的工具与安装说明。需要查证时，可阅读 [npm 安装命令](https://docs.npmjs.com/cli/v11/commands/npm-install/) 了解安装范围，或查看 [npm exec / npx 说明](https://docs.npmjs.com/cli/v11/commands/npm-exec/) 确认命令从哪里执行；项目依赖管理留待使用时展开。

## 下载并执行安装脚本

有些项目提供一条命令完成安装。例如，Python 工具 uv 的 [官方安装说明](https://docs.astral.sh/uv/getting-started/installation/) 给出了以下 Linux/macOS 用法：

::: code-group

```bash [下载并直接执行]
curl -LsSf https://astral.sh/uv/install.sh | sh
```

```bash [分开下载与执行]
curl -LsSf https://astral.sh/uv/install.sh -o uv-install.sh
# 阅读保存的脚本，确认后再执行
sh uv-install.sh
```

:::

`curl` 负责下载，第一种写法中的 `| sh` 将下载内容交给 Shell 执行。脚本以当前用户权限运行，可以继续下载程序、创建文件或修改 Shell 配置。使用前应确认地址来自项目官方文档，并了解它的安装位置和维护方法；“一条命令”只是在形式上简短。

## 软件源与镜像

软件源（仓库）提供包的信息及获取软件的途径。同一个包管理器可以配置多个软件源；“搜索不到”也可能只是当前配置的源没有收录：

- **VS Code**：Ubuntu 上可通过 Snap 安装；若要从软件源运行 `apt install code`，需要先添加微软的软件源。[VS Code 的 Linux 安装说明](https://code.visualstudio.com/docs/setup/linux) 给出了两种渠道及源的配置方法。
- **Spotify**：提供 Snap 包；用 apt 安装则需要先添加 Spotify 的软件源。[Spotify 的 Linux 安装说明](https://www.spotify.com/download/linux/) 可用于对照两种渠道。

pip 通常从 Python 软件包索引 PyPI 获取包，npm 通常使用 npm registry。镜像是仓库内容的同步副本，常用于改善下载速度或可达性。更换同一仓库的镜像主要改变下载位置，不等于增加新的软件种类；镜像还可能有同步延迟。[清华 PyPI 镜像说明](https://mirrors.tuna.tsinghua.edu.cn/help/pypi/) 可用于了解临时使用和修改默认配置的区别。

## 为谁安装，由谁维护

用户级安装主要供当前用户使用，通常不需要管理员权限；系统级安装供多个用户使用，通常需要管理员权限。具体范围和默认位置由工具与安装方式决定。

建议记住每个软件由谁安装，后续通过相应渠道升级和卸载。若产生了多个安装副本，结合[上一节的命令路径与版本查询](./environment#查明实际运行的命令)，确认当前 Shell 实际运行的是哪一个；切换安装渠道时，也应核对已有副本及其配置。

## 【自主学习】对照自己的安装方式

选择一个已经安装的软件，查询实际运行路径和版本，再查明它的安装渠道、更新和卸载方法。尝试解释：如果改用另一种渠道安装，哪些信息可能改变？为什么 npm 已经把工具装进项目，直接在 Shell 中输入工具名却未必能找到？
