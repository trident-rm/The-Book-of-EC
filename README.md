# The Book of EC

面向 RoboMaster 新成员的嵌入式电控学习导航。项目用学习节点及其先修关系组织工程、编程、嵌入式、通信、控制和机器人实践知识。

## 本地开发

需要 Node.js 和 pnpm。安装依赖并启动开发服务器：

```sh
pnpm install
pnpm dev
```

常用指令：

| 指令             | 用途                          |
| ---------------- | ----------------------------- |
| `pnpm dev`       | 启动 VitePress 开发服务器     |
| `pnpm fmt`       | 格式化代码和文档              |
| `pnpm fmt:check` | 检查格式，不修改文件          |
| `pnpm lint`      | 检查主题和内容工具代码        |
| `pnpm typecheck` | 运行 TypeScript 类型检查      |
| `pnpm check`     | 依次运行格式、lint 和类型检查 |
| `pnpm build`     | 类型检查并构建站点            |
| `pnpm preview`   | 本地预览构建结果              |

## 开发流程

1. 阅读相关正文和 `src/contributing/` 中的维护说明。
2. 修改正文时，同步更新节点、专题或导航元数据。
3. 运行 `pnpm fmt`，检查格式化结果。
4. 运行 `pnpm check` 和 `pnpm build`。

新增学习节点时，在 `src/nodes/<domain>/<slug>/` 创建 Markdown 页面和 `meta.ts`，再将 ID 及静态导入加入 `src/.vitepress/content/nodes.ts`。`parts` 必须按阅读顺序列出全部页面，首项为入口页；加入专题则更新 `topics.ts`。完整规则见[维护本书](src/contributing/index.md)。

## 持续集成与发布

每次向分支 push 时，GitHub Actions 都会运行格式、lint、类型和构建检查。匹配 `v*.*.*` 的 tag push 也会触发检查，但 tag 必须严格符合 `v<MAJOR>.<MINOR>.<PATCH>`（例如 `v1.2.3`），否则 workflow 会失败；合法 tag 会在检查通过后部署 GitHub Pages。

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
