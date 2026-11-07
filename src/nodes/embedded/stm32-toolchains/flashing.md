# 烧录与 OpenOCD

**烧录**是把固件内容写入目标程序存储区的过程。本例把程序写入 STM32 的片上 Flash（闪存），使它在断电后仍能保留。电脑上完成编译，只会产生固件文件；芯片获得新固件还需要一次写入操作。

本页先解释烧录，再安装 OpenOCD、连接探针并识别芯片。接板自检只查询目标与 Flash 信息，完整擦写和程序行为验证留到后续实操。

## 烧录改变了什么

**固件**是面向设备构建的程序及其配套数据。本例的 Flash 保存程序和需要持久保留的内容；SRAM（静态随机存取存储器）通常保存栈、变量等运行数据，断电后不再保留。烧录不会把源码交给芯片现场编译。

通常的固件写入包含以下步骤：

| 步骤     | 作用                                                              |
| -------- | ----------------------------------------------------------------- |
| 擦除     | 将需要更新的 Flash 区域恢复为可编程状态，通常按扇区等硬件粒度操作 |
| 写入     | 按固件的装载地址，将程序内容写入相应位置                          |
| 校验     | 比较目标中的内容与待写入内容是否一致                              |
| 复位运行 | 让芯片按启动配置重新开始执行程序                                  |

工具可能把这些步骤封装成一条命令，但校验通过只说明写入内容符合校验要求。程序是否按预期驱动外设、处理输入，仍需另行验证。从片上 Flash 启动时，芯片按启动配置取得复位入口并执行程序；详细启动流程在后续展开。

## 固件文件与写入地址

| 格式      | 保存了什么                                     | 使用时关注什么                                              |
| --------- | ---------------------------------------------- | ----------------------------------------------------------- |
| ELF       | 代码、数据、装载地址等，还可以有符号和调试信息 | 烧录工具提取需要装载的内容；调试信息可留在电脑上供 GDB 使用 |
| Intel HEX | 带地址等信息的文本记录                         | 目标地址与工程布局是否一致                                  |
| BIN       | 原始字节序列                                   | 文件本身不提供装载地址，需要另行指定                        |

ELF 不是整份按字节复制进 Flash；烧录工具按文件结构提取可装载内容与地址。后缀相同也不代表固件适合任意一块板。

示例的 Debug 配置预期产生 `build/Debug/Demo-RM-C.elf` 和 `.map` 文件：ELF 用于烧录、调试，`.map` 用于查看链接后的地址布局。该版本没有配置自动生成 BIN / HEX，不能把它们当作已有产物。

示例链接脚本 `STM32F407XX_FLASH.ld` 将 Flash 区域起点设为 `0x08000000`。这是该工程的布局约定；采用 bootloader 等其他布局时，需要按相应工程确定地址。文件格式和烧录操作的更多细节可查 [OpenOCD 稳定版烧录文档](https://openocd.org/doc-release/html/Flash-Programming.html)。

## OpenOCD、探针与 SWD

本例的访问链路是：

```text
电脑上的 OpenOCD → USB → 硬件探针 → SWD → STM32
```

**OpenOCD** 是电脑上的程序，负责目标访问、Flash 操作和调试服务；**探针**是连接电脑与目标的硬件；**SWD（Serial Wire Debug）**是 Arm 的调试接口，使用 SWDIO、SWCLK 等信号访问芯片。三者不能互相替代。

OpenOCD 可以直接完成烧录，也可以向 GDB 提供调试服务。调试客户端怎样接入见[下一页](./debugging.md)。

烧录还有其他途径，例如由芯片 bootloader 经 UART、USB DFU 接收程序，具体支持取决于器件和启动配置。因此，“烧录”并不专指使用探针或 SWD。

## 安装 OpenOCD

示例配置以 **OpenOCD 0.12.0** 为基准。先准备程序和随附的脚本，再运行版本与路径检查。

::: code-group

```powershell [Windows / Chocolatey]
# 已安装 Chocolatey；在具有安装权限的 PowerShell 中运行
choco install openocd
```

```sh [Linux / Debian、Ubuntu]
sudo apt update
sudo apt install openocd
```

```sh [macOS / Homebrew]
brew install open-ocd
```

:::

Windows 示例使用 [Chocolatey 社区包](https://community.chocolatey.org/packages/openocd)。也可从 [OpenOCD 0.12.0 发布页](https://github.com/openocd-org/openocd/releases/tag/v0.12.0)获取 Windows 预编译包 `openocd-v0.12.0-i686-w64-mingw32.tar.gz`，解压后把含 `openocd.exe` 的目录加入 `PATH`，保留配套 DLL 和脚本目录。包管理器的使用方法沿用[软件安装、包管理](../../engineering/shell-basics/package-management.md)；macOS 包名及稳定版信息见 [Homebrew 的 open-ocd 页面](https://formulae.brew.sh/formula/open-ocd)。

在后续实际使用的终端中检查：

::: code-group

```powershell [Windows / PowerShell]
Get-Command openocd -All
openocd --version
```

```sh [Linux / macOS]
type -a openocd
openocd --version
```

:::

预期能查到选定安装的命令，版本为与示例配套的 0.12.0。若使用其他版本，先核对配置兼容性；尤其不要把开发版程序、旧版配置和另一份安装中的 `scripts` 目录混在一起。

### Windows：USB 驱动

先确认设备管理器能正确识别探针的调试接口。ST-LINK 的驱动可从 [STSW-LINK009](https://www.st.com/en/development-tools/stsw-link009.html)获取，安装 CubeCLT 时也可能已经安装。

CMSIS-DAP 有 HID、USB bulk 等不同访问方式；J-Link 也需要核对 OpenOCD 使用的 USB 驱动。按实际探针和发行包说明准备，不能用“厂商软件能识别”代替 OpenOCD 的连接检查。需要配置 libusb / WinUSB 驱动时，只操作对应的调试接口；相关平台说明见 [OpenOCD 0.12.0 README](https://github.com/openocd-org/openocd/blob/v0.12.0/README)。

### Linux：USB 设备权限

普通用户需要有访问探针 USB 设备的权限，通常由 udev 规则配置。Debian / Ubuntu 包可用 `dpkg -L openocd` 检查是否已安装 `60-openocd.rules`，常见位置是 `/usr/lib/udev/rules.d/` 或 `/lib/udev/rules.d/`。

若没有规则，在下载目录获取与程序匹配的[官方规则文件](https://github.com/openocd-org/openocd/blob/v0.12.0/contrib/60-openocd.rules)，再安装、重载：

```sh
curl -fL https://raw.githubusercontent.com/openocd-org/openocd/v0.12.0/contrib/60-openocd.rules -o 60-openocd.rules
sudo install -m 644 60-openocd.rules /etc/udev/rules.d/60-openocd.rules
sudo udevadm control --reload
```

随后拔插探针。规则中的 `plugdev` 组和 `uaccess` 授权需结合发行版及当前用户会话检查；已有规则但仍报权限错误时，应先确认这一层。

macOS 使用对应主机架构的发行包，通过后面的连接命令检查 USB 访问；它不使用 Linux 的 udev 规则。

## 按实际探针选择示例配置

示例 `openocd/` 下有三套配置，三选一：

| 探针      | 文件                    | OpenOCD 0.12.0 中的接口与传输                                 |
| --------- | ----------------------- | ------------------------------------------------------------- |
| CMSIS-DAP | `openocd/cmsis-dap.cfg` | `interface/cmsis-dap.cfg`，使用 `swd`；示例 README 的默认选择 |
| ST-LINK   | `openocd/stlink.cfg`    | `interface/stlink.cfg`，使用 HLA 驱动与 `hla_swd`             |
| J-Link    | `openocd/jlink.cfg`     | `interface/jlink.cfg`，使用 `swd`                             |

三者都加载 `target/stm32f4x.cfg`：`interface` 描述电脑通过哪种探针访问目标，`target` 描述芯片。更换探针与更换芯片会影响不同配置。

该版本的 ST-LINK 配置使用 HLA。开发版 OpenOCD 的同名 `interface/stlink.cfg` 已改用其他驱动接口，旧 HLA 配置不能直接套用；这也是这里使用稳定版配套脚本的原因。迁移时查[开发版适配器配置说明](https://openocd.org/doc/html/Debug-Adapter-Configuration.html)，不要仅替换某一行传输名称。

## 接线与供电

先按实际板卡和探针文档确认连接器针序，断电接线，确认后再供电。示例仓库没有提供可据此确定连接器位置和针序的板卡接线图，不能仅凭项目名称猜针脚。

| 信号                               | 连接与作用                                    |
| ---------------------------------- | --------------------------------------------- |
| GND                                | 探针与目标共地                                |
| SWDIO                              | 连接目标的 SWD 数据线                         |
| SWCLK                              | 连接目标的 SWD 时钟线                         |
| VTref / 目标电压参考（若探针提供） | 按探针文档接目标 I/O 电源，供探针识别目标电平 |
| NRST（按需）                       | 硬件复位信号，使用方式需与复位配置配套        |

**目标电压参考输入与供电输出不是同一用途。** 板卡怎样供电、探针是否可以供电，都要查各自文档。目标和探针还应满足信号电平要求，相关概念见[电路基础](../circuit-basics/index.md)。

示例使用 `reset_config none`，不通过 NRST 硬件线复位，正常连接和软件复位按现有配置进行。某些连接恢复场景可能需要 NRST 和不同的复位配置，不能把这里的约定推广为“NRST 永远不需要”。

## 接板识别与判据

在项目根目录打开终端，按实际探针选择下面**一条**命令。命令在 PowerShell 和 Linux / macOS Shell 中相同：

::: code-group

```sh [CMSIS-DAP]
openocd -f openocd/cmsis-dap.cfg -c "init; targets; flash probe 0; shutdown"
```

```sh [ST-LINK]
openocd -f openocd/stlink.cfg -c "init; targets; flash probe 0; shutdown"
```

```sh [J-Link]
openocd -f openocd/jlink.cfg -c "init; targets; flash probe 0; shutdown"
```

:::

`-f` 加载配置；`-c` 中的命令依次初始化连接、列出目标、识别第 0 个 Flash bank（配置中声明的 Flash 存储区），最后退出。`flash probe 0` 是识别操作，不擦除或写入固件；其含义见[稳定版 Flash 命令文档](https://openocd.org/doc-release/html/Flash-Commands.html)。

成功应同时满足：

- 探针可访问，没有 USB 驱动、权限或找不到探针的错误。
- 目标检查成功，能识别 Cortex-M4 等目标信息，未出现目标通信失败。
- Flash 识别成功，芯片系列与 STM32F407 相符；本例 STM32F407IGH6 的 Flash 容量应为 1024 KiB。

具体日志文字随探针、版本变化，器件 ID 也可能由多个型号共用；完整型号还要对照板卡标注与资料核对，不要求日志完整打印 `STM32F407IGH6`。仅看见探针序列号，或进程最后退出，不足以证明芯片识别成功。

| 失败现象                 | 排查顺序                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------ |
| 找不到命令或 `.cfg`      | 实际命令路径、当前目录、程序与脚本是否配套；手动解压包必要时用 `-s` 指定脚本搜索目录 |
| 找不到探针、USB 权限错误 | USB 连接、Windows 驱动或 Linux udev 与用户权限                                       |
| 探针可见但目标通信失败   | 板卡供电、共地、SWDIO / SWCLK 接线与电平，再核对探针和芯片配置                       |
| 连接不稳定或复位相关错误 | 按板卡与探针要求检查 SWD 速率、复位条件及 NRST 接线与配置                            |

软件与配置能启动、USB 探针可见、目标芯片可访问，是逐层推进的检查。完成最后一层后，再进入后续的固件构建与实际烧录。
