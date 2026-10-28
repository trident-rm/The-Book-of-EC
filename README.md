# The Book of EC

面向 RoboMaster 新成员的嵌入式电控学习导航。项目用学习节点及其先修关系组织工程、编程、嵌入式、通信、控制和机器人实践知识。

## 本地开发

项目使用全局 Vite+（`vp`）管理运行环境、依赖和任务。先按 [Vite+ 官方安装指南](https://viteplus.dev/guide/)安装 `vp`，再在仓库根目录安装依赖并启动开发服务器：

```sh
vp install
vp run dev
```

`vp` 从 `package.json` 的 `engines.node` 读取 Node.js 版本要求，从 `packageManager` 读取底层 pnpm 版本；`pnpm-lock.yaml` 继续锁定依赖。运行 `vp env current` 可查看实际版本及其来源。`pnpm-workspace.yaml` 关闭 pnpm 自行管理运行时和包管理器版本，统一交给 `vp` 选择。

项目脚本使用 `vp run <script>` 执行，继续调用独立的 Oxfmt、Oxlint、`vue-tsc` 和 VitePress。

常用指令：

| 指令                       | 用途                           |
| -------------------------- | ------------------------------ |
| `vp run dev`               | 启动 VitePress 开发服务器      |
| `vp run fmt`               | 格式化代码和文档               |
| `vp run fmt:check`         | 检查格式，不修改文件           |
| `vp run lint`              | 检查主题和内容工具代码         |
| `vp run typecheck`         | 运行 Vue / TypeScript 类型检查 |
| `vp run check`             | 依次运行格式、lint 和类型检查  |
| `vp run build`             | 构建站点并验证内容与内部链接   |
| `vp run preview`           | 本地预览构建结果               |
| `vp run diagrams:generate` | 从 WaveDrom 源文件生成 SVG     |

## 开发流程

1. 阅读相关正文和 `src/contributing/` 中的维护说明。
2. 修改正文时，同步更新节点、专题或导航元数据。
3. 运行 `vp run fmt`，检查格式化结果。
4. 运行 `vp run check` 和 `vp run build`。

新增学习节点时，在 `src/nodes/<domain>/<slug>/` 创建 Markdown 页面和 `meta.ts`，再将 ID 及静态导入加入 `src/.vitepress/content/nodes.ts`。`parts` 必须按阅读顺序列出全部页面，首项为入口页；加入专题则更新 `topics.ts`。完整规则见[维护本书](src/contributing/index.md)。

## 持续集成与发布

GitHub Actions 通过 `voidzero-dev/setup-vp` 安装固定版本的 Vite+、读取项目环境声明并缓存依赖，再使用 `vp install --frozen-lockfile` 安装依赖。

每次向分支 push 时，CI 都会运行格式、lint、类型和构建检查。匹配 `v*.*.*` 的 tag push 也会触发检查，但 tag 必须严格符合 `v<MAJOR>.<MINOR>.<PATCH>`（例如 `v1.2.3`），否则 workflow 会失败；合法 tag 会在检查通过后部署 GitHub Pages，并创建 GitHub Release。

手动触发 workflow 时跳过格式、lint 和类型检查，直接构建并部署所选 ref。

## 架构

```text
src/
├── nodes/                 学习节点正文及其私有、共享资源
├── map/                   总学习图和专题入口
├── reference/             阅读方法、术语和检索词
├── contributing/          内容模型与维护说明
└── .vitepress/
    ├── content/           节点、专题、分类、导航和构建验证
    ├── theme/             站点级组件与样式
    └── config.ts          VitePress 配置
```

各节点的 `meta.ts` 是元数据来源；`nodes.ts` 统一声明节点 ID、公共类型和静态导入注册表。构建插件会检查 `NodeId` 与元数据目录是否一致、已登记页面是否存在、页面和专题成员是否重复，以及必需先修关系是否成环。导航由注册表和专题数据生成，正文与元数据必须保持一致。

节点私有组件和静态资源与正文共置；出现跨节点复用后，才提升到相应领域的 `_shared` 目录。`.vitepress/theme/` 不存放教学内容资源。完整约定见[编写学习节点](src/contributing/writing-nodes.md)。

更具体的开发和写作约束见 [AGENTS.md](AGENTS.md)。
