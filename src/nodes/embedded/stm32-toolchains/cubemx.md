# STM32CubeMX

STM32CubeMX 用于选择芯片、配置引脚和外设，并生成初始化代码与工程文件。配置保存在 `.ioc` 中；它不是编译器，也不负责把程序烧录到板上。

本页只完成**安装经典 STM32CubeMX、成功启动、打开示例 `.ioc`**。引脚、时钟和外设怎样配置，以及怎样重新生成工程，随具体项目学习。

## 下载与安装经典版

打开 [STM32CubeMX 产品页](https://www.st.com.cn/zh/development-tools/stm32cubemx.html)，在下载区选择 **STM32CubeMX** 对应的平台包。本节点使用经典版，不选择 STM32CubeMX2。

| 平台    | 安装                                                                               | 启动                                |
| ------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| Windows | 解压下载包，运行 `SetupSTM32CubeMX-VERSION-Win.exe`；通常选择当前用户安装即可      | 开始菜单或安装器创建的快捷方式      |
| Linux   | 解压后为 `SetupSTM32CubeMX-VERSION` 添加执行权限，再运行安装器                     | 执行安装目录中的 `STM32CubeMX`      |
| macOS   | 选择 Intel / Apple Silicon 对应包，解压后运行其中的 `SetupSTM32CubeMX-VERSION.app` | 从 Launchpad 或安装后的应用入口启动 |

Linux 安装命令如下，先把 `VERSION` 替换为下载包的实际版本：

```sh
chmod u+x ./SetupSTM32CubeMX-VERSION
./SetupSTM32CubeMX-VERSION
```

系统与运行环境要求见[经典版官方安装说明](https://dev.st.com/stm32cube-docs/stm32cubemx/6.18.1/en/docs/markup/CubeMX_UserManual/chapters/03_3_installing_and_running_stm32cubemx.html)。CubeMX 从 6.2.0 起自带运行所需的 JRE，使用这些版本不必另行安装 Java；不要照搬旧教程中的 JVM 配置。macOS 还应核对该版说明列出的 Xcode 和文件访问权限要求。

安装后先启动应用，在 About 信息中确认名称为 STM32CubeMX，并记录版本。

## 打开 Demo-RM-C.ioc

准备好[总览页中的示例](./intro.md#配套示例-demo-rm-c)，在 CubeMX 中用 **File → Load Project** 打开项目根目录的 `Demo-RM-C.ioc`。示例文件记录的 CubeMX 版本为 6.17.0，芯片为 STM32F407IGH6 对应型号，固件包为 STM32Cube FW_F4 V1.28.3。

查看时建议使用示例副本。如果新版 CubeMX 提示迁移配置，按提示区分 **Continue** 与 **Migrate**：前者沿用原来的数据库版本，后者迁移到新版本；本次只查看，优先保留原配置。缺失的软件包若影响打开，按提示获取示例指定的版本。相关含义见[官方文件菜单说明](https://dev.st.com/stm32cube-docs/stm32cubemx/6.18.1/en/docs/markup/CubeMX_UserManual/chapters/04_4_stm32cubemx_user_interface.html)。

成功打开后，找到芯片名称和引脚视图，确认是预期的 STM32F407 配置；界面中的型号可能以 `STM32F407IGHx` 表示。完成查看后关闭，不必保存迁移结果或点击 Generate Code。

## 如果不能启动或打开文件

| 现象                     | 先检查什么                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------- |
| 安装器或应用不能启动     | 下载包是否匹配主机系统与架构，是否完整解压，Linux 文件是否有执行权限               |
| 能启动但无法读取 `.ioc`  | 是否选中实际文件，所在目录是否允许读取；macOS 按官方说明检查应用的文件访问权限     |
| 提示版本迁移或缺少软件包 | 区分应用版本、配置数据库和 STM32Cube 固件包，按提示保留或补齐示例所用版本          |
| 旧 `.ioc` 导入异常       | 查看所用版本的已知问题与修复说明；例如经典版 6.18.1 修复了 6.18.0 的旧文件导入问题 |

最后一项的修复记录见 [ST 的 6.18.1 发布说明](https://community.st.com/stm32-mpus-software-development-tools-138/stm32cubemx-6-18-1-is-released-167382)。无需通过修改示例的引脚、时钟或生成选项来处理安装问题。

## 自检与判据

- 经典 STM32CubeMX 能正常启动，版本可查。
- `Demo-RM-C.ioc` 能打开，芯片和引脚配置界面可见，目标与示例的 STM32F407IGH6 相符。
- 示例原有配置保持不变。本页不以生成代码或成功编译作为验收条件。
