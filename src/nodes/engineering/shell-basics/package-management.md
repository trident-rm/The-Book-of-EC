# 软件安装、包管理

安装软件时，需要确认程序和数据分别放在哪里、当前命令会运行哪个副本，以及由谁升级、卸载。

## 一个软件长什么样？

软件可以包含以下几类内容，具体有哪些取决于它的功能、平台和安装方式：

| 部分             | 用途                             | 例子                                       |
| ---------------- | -------------------------------- | ------------------------------------------ |
| 可执行程序或脚本 | 提供程序入口                     | `tectonic.exe`、`gcc.exe`、命令行启动脚本  |
| 库、模块和插件   | 提供程序运行时需要的其他代码     | DLL、Python 模块、编辑器扩展               |
| 随附资源         | 提供界面或功能所需的文件         | 图标、模板、字体、帮助文档                 |
| 配置             | 保存系统、用户或项目的设置       | 配置文件、项目中的 `.vscode/settings.json` |
| 数据和运行状态   | 保存需要持久保留的内容           | 数据库、历史记录、工作区状态               |
| 缓存和日志       | 复用下载或计算结果，记录运行情况 | 下载缓存、构建缓存、错误日志               |

简单工具的基本功能可能由一个可执行文件提供。例如，下文的 Tectonic Windows MSVC 压缩包只有 `tectonic.exe`，但实际排版还会下载支持文件并缓存。程序主体简单，不代表运行后只会留下一个文件。

复杂应用的文件往往分布在多个目录。以 Windows 上普通安装模式的 VS Code 为例：

| 内容                     | 常见默认位置                                |
| ------------------------ | ------------------------------------------- |
| 用户版程序及随附资源     | `%LOCALAPPDATA%\Programs\Microsoft VS Code` |
| 用户设置                 | `%APPDATA%\Code\User\settings.json`         |
| 用户安装的扩展           | `%USERPROFILE%\.vscode\extensions`          |
| 工作区状态、缓存和日志等 | 用户数据目录 `%APPDATA%\Code` 下的不同位置  |
| 项目设置                 | 项目目录中的 `.vscode\settings.json`        |

表中的 `%名称%` 是 Windows 文档中常见的环境变量写法；PowerShell 中读取对应值使用 `$env:名称`。这些路径用于说明文件分布，实际位置可能随配置和安装模式改变。

同一个软件还可能同时涉及：

- **系统范围**：供多个用户使用的程序、共享数据和系统配置。
- **用户范围**：当前用户的程序、偏好、缓存和状态。
- **项目范围**：某个工程的依赖、工具和配置。

例如，系统级安装的编辑器仍可为每个用户分别保存设置。Linux 中遵循 XDG 约定的软件常把配置、数据、缓存放在 `~/.config`、`~/.local/share`、`~/.cache`；macOS 应用也常使用 `~/Library` 下的相应目录。这些是约定，不是所有软件必须遵守的固定布局。[XDG 目录规范](https://specifications.freedesktop.org/basedir/latest/)解释了这些类别的用途。

环境变量和 Windows 注册表也可以保存配置或定位信息。例如，`PATH` 保存命令搜索目录，注册表可以记录程序路径、文件关联和系统集成设置。它们保存的是值和记录，程序文件仍位于文件系统中。

## 常见的软件安装方式

| 方式             | 安装时主要做什么                                       | 后续通常由谁维护                   |
| ---------------- | ------------------------------------------------------ | ---------------------------------- |
| 预编译程序压缩包 | 下载已经构建好的程序，解压、放置并配置入口             | 使用者替换版本、删除文件和入口配置 |
| 安装脚本         | 执行项目或第三方提供的脚本，自动下载、解压、构建或配置 | 依脚本和项目约定，可能有自更新命令 |
| 从源码编译       | 准备工具链和依赖，构建源码并安装产物                   | 使用者，或接管产物的打包工具       |
| 包管理器         | 从配置的软件源获取包，处理依赖并记录安装信息           | 对应包管理器                       |
| 安装器           | 运行 `.exe`、`.msi`、`.pkg` 等安装程序                 | 软件自身、安装器或系统卸载入口     |
| 应用商店         | 从商店获取并安装应用                                   | 商店与应用自身                     |

## 压缩包分发

下载前先区分预编译程序包与源码包，并核对操作系统、CPU 架构和运行依赖。解压后应保留程序要求的目录结构，`PATH` 中只加入需要提供命令入口的目录。

### 案例一：Tectonic

Tectonic 是一个现代化的 TeX 排版工具，它的本体只有一个单独的可执行文件 `tectonic`（在 Windows 上是 `tectonic.exe`），从 [Tectonic 官方 Releases](https://github.com/tectonic-typesetting/tectonic/releases/latest) 选择符合本机的版本，下载解压后即可得到。

将得到的可执行文件放到一个合适的地方后，若想要日常在 Shell 中能方便地直接通过 `tectonic` 命令调用它，则需要把它所在的目录添加到 `PATH` 中。添加后即可验证：

```sh
tectonic --version
```

虽然 Tectonic 的本体只有一个可执行文件，但使用过程中，它还会下载缓存一些支持文件。这些缓存文件会被放在哪里，由你的操作系统环境决定，具体可参考[Tectonic 缓存说明](https://tectonic-typesetting.github.io/book/latest/getting-started/first-document.html#cache)。

**卸载**

根据以上的说明可以发现，如果想要彻底地移除 Tectonic，除了删除本体可执行文件 `tectonic` 或 `tectonic.exe` 以外，还需要删除缓存文件和 `PATH` 中的相关项目，甚至还可能有其他相关的环境变量。

### 案例二：WinLibs

WinLibs 提供面向 Windows 的 GCC、MinGW-w64 等工具。GCC 是编译器集合，MinGW-w64 提供 Windows 目标所需的头文件、库等支持；它们共同组成工具链。

从[WinLibs 官网](https://www.winlibs.com/)选择适合本机的正式发行包。本例使用 Win64/x86_64、UCRT、POSIX 的 ZIP 包，不需要附带 LLVM 的变体，解压后保存在 `C:\Tools\winlibs` 中，目录内容大致如下：

```
C:\Tools\winlibs\mingw64\
├── bin\                       gcc.exe、g++.exe 等命令及运行库
├── include\                   头文件
├── lib\                       库文件
└── ...                        其他工具链目录
```

验证一下：

```powershell
& C:\Tools\winlibs\mingw64\bin\gcc.exe --version
& C:\Tools\winlibs\mingw64\bin\g++.exe --version
```

想要直接使用 `gcc`、`g++` 等命令，就需要把 `bin\` 目录加入 `PATH`：

```powershell
$env:PATH = "C:\Tools\winlibs\mingw64\bin;$env:PATH"     # 仅对本次 Shell 会话有效
Get-Command gcc
gcc --version
```

## 脚本安装

安装脚本把若干操作自动串起来：识别平台、下载发行包、解压到约定目录、创建命令入口，有时还会修改 Shell 配置。

以 uv 为例，它是一个现代化的 Python 包和环境管理工具。[uv 独立安装器](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer)提供了通过脚本安装 uv 的说明。以 Linux/macOS 为例：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

`curl` 下载 Shell 脚本（一个 `.sh` 文件），`| sh` 把下载内容交给 Shell 执行。也可以分开下载、阅读和执行：

```bash
# 下载保存到名为 uv-install.sh 的文件
curl -LsSf https://astral.sh/uv/install.sh -o uv-install.sh
# 阅读脚本并确认来源、安装位置和配置操作后
sh uv-install.sh
```

在默认设置下，安装器把程序放入用户的 `~/.local/bin`，并可能修改 Shell 配置。按照安装输出提示重新打开终端或加载配置，再验证：

```bash
uv --version
command -v uv
```

应显示版本，且路径对应本次安装位置。自定义安装目录、禁用自动修改 `PATH` 等选项见 [uv 安装器配置](https://docs.astral.sh/uv/reference/installer/)；使用这些选项后可能需要自行完成入口配置。

**升级**

除了用脚本（独立安装器）安装以外，uv 还提供了几种其他安装方式。升级 uv 的方法取决于其一开始的安装方式，参考 [uv 升级说明](https://docs.astral.sh/uv/getting-started/installation/#upgrading-uv)。

**卸载**

uv 也会在几个不同的地方存放文件。想要彻底移除 uv，参考 [uv 卸载说明](https://docs.astral.sh/uv/getting-started/installation/#uninstallation)。

## 从源码编译安装

有时候，应用可能没有提供所需平台上的预编译包，或者你想要修改特定功能或优化编译选项的版本，这时就需要自己从源码编译安装。

下载程序源代码后，你还需下载、配置好编译所需的环境，然后才能正常构建。构建成功后，再把产物放到合适的目录，并配置命令入口。

## 包管理器

包管理器统一提供软件包的获取和维护接口，通常还会处理依赖、记录版本与安装文件。**依赖**是软件运行或构建所需的其他库、程序。

### 常见的工具与操作

不同管理器覆盖的软件不同。一台电脑可以同时使用多个管理器，例如用系统管理器安装 Python，再用 Python 工具管理项目依赖。

| 环境               | 常见工具                                                  |
| ------------------ | --------------------------------------------------------- |
| Windows            | WinGet、Scoop、Chocolatey                                 |
| macOS              | Homebrew、MacPorts                                        |
| Linux 发行版       | Debian/Ubuntu 的 apt、Fedora 的 dnf、Arch Linux 的 pacman |
| Linux 上的其他渠道 | Snap、Flatpak、Homebrew                                   |
| 语言生态           | npm、pip、uv、Cargo 等，职责见后文                        |

_注：对于上述的某些工具，包管理只是它们的众多功能之一。_

以文本搜索工具 ripgrep 为例，包名通常是 `ripgrep`，命令名是 `rg`。[ripgrep 官方安装说明](https://github.com/burntsushi/ripgrep#installation)中提供许多种不同包管理器、不同平台的安装方法，安装后用 `rg --version` 及实际命令路径验证。

使用包管理器来管理软件通常非常便利。以下列出了一些常用操作（不同的包管理器不一样，但逻辑是相通的）：

::: code-group

```powershell [Windows / Chocolatey]
# 搜索 ripgrep 相关的包
choco search ripgrep

# 安装
choco install ripgrep

# 列出所有安装了的包
choco list

# 查看已安装的 ripgrep 详情
choco info ripgrep

# 升级和卸载
choco upgrade ripgrep
choco uninstall ripgrep

# 列出所有可升级的包
choco outdated
```

```powershell [Windows / WinGet]
# 搜索 ripgrep 相关的包
winget search ripgrep

# 安装（需指明具体的包名/ID）
winget install --id BurntSushi.ripgrep.MSVC

# 列出所有安装了的包
winget list

# 查看已安装的 ripgrep 详情
winget show ripgrep

# 升级和卸载
winget upgrade --id BurntSushi.ripgrep.MSVC
winget uninstall --id BurntSushi.ripgrep.MSVC

# 列出所有可升级的包
winget list --upgrade-available
```

```bash [macOS, Linux / Homebrew]
# 搜索 ripgrep 相关的包
brew search ripgrep

# 安装
brew install ripgrep

# 列出所有安装了的包
brew list

# 查看 ripgrep 详情
brew info ripgrep

# 升级和卸载
brew upgrade ripgrep
brew uninstall ripgrep

# 列出所有可升级的包
brew outdated
```

```bash [Ubuntu / apt]
# 搜索 ripgrep 相关的包
apt search ripgrep

# 安装（需要管理员权限）
sudo apt install ripgrep

# 列出所有安装了的包
apt list

# 查看 ripgrep 详情
apt show ripgrep

# 升级和卸载
sudo apt install --only-upgrade ripgrep
sudo apt remove ripgrep

# 列出所有可升级的包
apt list --upgradable
```

:::

安装后通常即可直接使用，不用再配置 `PATH`，也不用重启 Shell：

```sh
rg --version
rg --help
```

### 为什么通常不用逐个配置 PATH？

便利来自**统一放置命令入口**。例如，发行版包常把命令装入已经在 `PATH` 中的目录；Homebrew 会在自己的前缀目录下组织软件，再提供统一入口。配置好这类入口后，新增软件通常可以复用它们。

这仍有前提：包管理器自身的入口目录已经可用，安装的包也按相应约定提供命令。Homebrew 初次安装可能需要配置 `shellenv`，不链接到默认前缀的 keg-only 包可能还需单独配置；WinGet 也会受到上游安装器行为影响。[Homebrew 的 keg-only 说明](https://docs.brew.sh/FAQ#what-does-keg-only-mean)给出了这类例外。

因此，安装后仍应检查版本和实际命令路径。管理器报告安装成功，不保证当前 Shell 已经选中预期副本。

### 软件源、第三方源与镜像

**软件源**提供软件包的信息和获取位置。管理器根据所配置的源，才能知道有哪些包、版本和依赖。

- **默认源**：工具或发行版默认配置的来源。例如 Ubuntu 的发行版仓库、pip 默认使用的 PyPI、npm 默认使用的 npm registry。
- **第三方源**：额外的发布渠道，可能增加软件或提供另一组版本。例如 VS Code 的 apt 安装方式需要配置微软提供的源，具体方法见 [VS Code Linux 安装说明](https://code.visualstudio.com/docs/setup/linux)。
- **镜像**：某个仓库内容的同步副本，常用于改善下载速度或可达性，可能有同步延迟。

更换同一仓库的镜像主要改变获取位置；原仓库没有的包或版本，不会仅因换镜像而出现。添加另一个源则可能改变可选软件、版本和维护方。

准备好相应的 npm 或 Python/pip 后，可以查询配置：

```sh
npm config get registry
python -m pip config list
```

前者显示当前 npm registry；后者列出 pip 的配置项，没有显式配置项时仍可能使用默认值。这里的 `python` 应明确指向要操作的 Python 环境。

例如，在项目虚拟环境中，可以只对一次安装指定 PyPI 镜像：

```sh
python -m pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple requests
```

这不会修改以后所有命令的默认源。虚拟环境的创建见后文；[清华 PyPI 镜像说明](https://mirrors.tuna.tsinghua.edu.cn/help/pypi/)解释了该地址的用法。若需要永久配置，应先确认作用范围，再查 [pip 配置说明](https://pip.pypa.io/en/stable/topics/configuration/)或 [npm 配置说明](https://docs.npmjs.com/cli/configuring-npm/npmrc/)。

### 用户与系统、项目与全局

安装范围和管理工具是两个维度：

| 范围   | 常见用途                       | 权限与位置                       |
| ------ | ------------------------------ | -------------------------------- |
| 系统级 | 供多个用户使用的程序、系统组件 | 通常写入系统目录，需要管理员权限 |
| 用户级 | 当前用户的日常工具             | 通常写入用户可管理的位置         |
| 项目内 | 某个项目的依赖和开发工具       | 与项目配置、选定环境关联         |

apt 通常管理系统级软件，包被安装在系统目录中，所以前面的修改操作使用 `sudo` 提升权限。Homebrew 的普通包操作通常不使用 `sudo`，因为它一般把包安装在用户目录中。

在语言生态中，**global 通常表示相对于项目的全局安装范围，不等于系统级安装**。例如 npm 的 global 使用配置的 `prefix`，该前缀既可能位于用户目录，也可能位于系统目录。

npm 是 Node.js 生态中的一个管理软件包的工具。

以代码格式化工具 Prettier 为例：

::: code-group

```sh [作为日常全局工具]
# 安装 Prettier 到全局范围
npm install --global prettier
prettier --version

# 列出全局安装的包
npm list --global

# 升级和卸载（全局范围）
npm update --global prettier
npm uninstall --global prettier
```

```sh [作为项目开发工具]
# 在一个新建的练习目录中初始化项目
npm init -y

# 安装 Prettier 到项目依赖中（作为开发依赖）
npm install --save-dev prettier

# 执行项目中安装的 Prettier
npm exec -- prettier --version

# 升级和卸载（项目中）
npm update prettier
npm uninstall prettier
```

:::

全局工具的入口目录在 `PATH` 中；项目内安装通常把包放在项目中的 `node_modules/` 目录，它不在 `PATH` 中，应使用 `npm exec` 运行其中的工具。

### 卸载后还可能会留下文件

包管理器主要维护它所记录的程序和依赖。用户和程序后来创建的配置、缓存、数据库和项目文件，不一定被包管理器所记录。

例如：[uv 卸载说明](https://docs.astral.sh/uv/getting-started/installation/#uninstallation)。

## 如何选择安装和管理方式？

**经验建议：在满足版本、平台和项目要求的前提下，优先使用自己已经熟悉、维护方便的包管理渠道。** 选择时可以依次检查：

| 要解决的问题                 | 判断方法                                           |
| ---------------------------- | -------------------------------------------------- |
| 有没有需要的软件和版本？     | 查看该渠道的包信息，确认功能、架构和版本要求       |
| 是否适合当前权限和安装范围？ | 确认系统、用户、项目范围，以及是否允许修改系统目录 |
| 谁负责后续升级、卸载？       | 优先选择能清楚记录和维护这次安装的渠道             |
| 需要同时保留多个版本吗？     | 考虑版本管理器、独立目录和项目环境                 |
| 是否要复现团队环境？         | 跟随项目指定的工具、版本声明和锁文件               |
| 下载、构建和磁盘成本如何？   | 分别考虑网络、预编译产物、缓存复用和重复安装       |

支持的软件及版本因渠道而异。例如，Ubuntu 24.04 的默认仓库中 Clang 工具链版本通常只到 22，如果想用 apt 安装更新的 Clang 版本，则会比较麻烦。

不同包管理器的管理机制不同，也可能带来效率的差异。例如，pnpm 的[共享存储设计](https://pnpm.io/motivation)和 uv 的[缓存机制](https://docs.astral.sh/uv/concepts/cache/)让它们通常比 npm 和 pip 更节省磁盘空间和下载时间。

### 案例一：Codex CLI

[Codex CLI 官方安装说明](https://github.com/openai/codex#installing-and-running-codex-cli)提供独立安装脚本、npm、Homebrew 和 Release 发行包等渠道。选择不同的渠道安装后，可执行文件 `codex` 的位置可能不同，后续的升级和卸载方式也不同。

除了官方列出的安装方式，有时候可能还有其他的渠道。比如官方提供了 npm 安装，这就意味着所有支持 Node.js 生态 npm registry 的包管理器都可以安装 Codex CLI，例如 pnpm、Yarn、Vite+ 等。

选择安装方式时，应当考虑到以上各种因素，选择适合自己环境或团队要求的方法。

### 案例二：Python，解释器、工具与项目环境

Python 的版本管理可以拆成三个问题：

| 需求                       | 含义                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| 不同版本的 Python 解释器   | 不同的项目可能需要不同版本的 Python。需要有一种便捷的方式，在不同的项目中使用对应的版本，又互不影响 |
| 为某个项目安装依赖         | 不同的项目所需的依赖、库和工具可能不同，需要为每个项目创建独立的虚拟环境，分别安装对应的依赖和工具  |
| 使用全局的 Python CLI 工具 | 有时候也需要一些跨项目、全局使用的工具                                                              |

要实现上述需求，有许多不同的方案。下面列出两种方案对比：

| 需求                       | 方案一                                                                                              | 方案二                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 不同版本的 Python 解释器   | 从官网、Homebrew、apt 等渠道安装多个不同版本的 Python，手动解决冲突问题，在项目中使用对应版本的命令 | `uv python` 管理受支持的 Python 发行版本，项目中由 uv 自动选择对应版本                                                |
| 为某个项目安装依赖         | 使用所选解释器创建 venv，再在其中使用 pip 安装所有所需依赖                                          | `uv venv` 创建虚拟环境，再用 uv 安装所需依赖和工具。uv 会复用缓存，以前在其他项目中安装过的相同版本的依赖不会重复安装 |
| 使用全局的 Python CLI 工具 | 把某个版本的 Python 当成全局默认版本，在它的全局环境中安装所需工具，并手动管理入口和依赖冲突        | `uv tool` 为工具建立全局独立环境并提供入口                                                                            |

哪种方式通常更优，高下立判。

## 一些常见的生态和工具

这里列举一些常见不同生态中的工具。

### Python 生态

[官方本家](https://www.python.org/)

| 工具                                                     | 主要职责与适用边界                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------ |
| [pyenv](https://github.com/pyenv/pyenv)                  | 管理 Python 版本；官方项目不支持原生 Windows，pyenv-win 是另一项目 |
| [pip](https://pip.pypa.io/)                              | Python 的默认包管理器。给选定的 Python 包环境安装、升级、移除包    |
| [Poetry](https://python-poetry.org/docs/)                | 管理 Python 项目的依赖、锁文件和环境等。不管理 Python 版本         |
| [uv](https://docs.astral.sh/uv/)                         | 管理 Python 版本、工具环境、项目环境与依赖，需区分各组命令的对象   |
| [conda](https://docs.conda.io/projects/conda/en/stable/) | 管理环境及 Python、非 Python 依赖，常用于数据科学和机器学习项目    |

[PyPI](https://pypi.org/) 是常用的 Python 包索引。pip、uv、Poetry 等可以从中获取包，但 conda 的 channel 是另一套包渠道。

### Node.js 生态

[官方本家](https://nodejs.org/)

| 工具                                 | 主要职责与适用边界                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| [nvm](https://github.com/nvm-sh/nvm) | 在 POSIX Shell 中管理 Node.js 版本；原生 Windows 的 nvm-windows 是另一个项目 |
| [fnm](https://github.com/Schniz/fnm) | 跨平台管理 Node.js 版本，安装后需按所用 Shell 配置初始化                     |
| [npm](https://docs.npmjs.com/)       | Node.js 自带的默认包管理器。管理项目依赖，也支持全局 CLI 工具。              |
| [pnpm](https://pnpm.io/)             | npm 主流上位替代品，使用共享存储等机制优化效率                               |
| [Yarn](https://yarnpkg.com/)         | pnpm 的竞争者；现代 Yarn 的默认 PnP 布局可以不生成 `node_modules`            |
| [Vite+](https://viteplus.dev/)       | 野心勃勃的新晋 JavaScript 开发工具。管理 Node.js 和包管理器。                |

[npm registry](https://www.npmjs.com/) 是 Node.js 生态常用的公共包服务，npm、pnpm、Yarn、Vite+ 等可以从中获取包。版本管理器与包管理器可以配合使用；例如 nvm 的不同 Node.js 版本还可能关联不同的全局 npm 工具，应分别检查。

### Rust 生态

[官方本家](https://www.rust-lang.org/)

| 工具                                                           | 主要职责与适用边界                                                          |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [rustup](https://rust-lang.github.io/rustup/)                  | 安装、切换 Rust 编译工具链                                                  |
| [Cargo](https://doc.rust-lang.org/cargo/)                      | 管理 Rust 项目依赖并构建项目；`cargo install` 也能从源码构建并安装 CLI 工具 |
| [cargo-binstall](https://github.com/cargo-bins/cargo-binstall) | 优先寻找预编译 CLI 产物，必要时可能回退到源码构建                           |

[crates.io](https://crates.io/) 是 Rust 常用的公共包仓库。
