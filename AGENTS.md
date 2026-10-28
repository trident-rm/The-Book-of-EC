# AGENTS.md

## 项目目标

本项目使用 VitePress 维护面向 RoboMaster 新成员的嵌入式电控学习图。内容以学习节点和先修关系组织，不按传统章节强制规定一条线性路径。

## 开发约束

- 使用全局 Vite+（`vp`）作为工具入口：安装依赖用 `vp install`，运行项目脚本用 `vp run <script>`；底层 pnpm 由 `package.json` 的 `packageManager` 选择。
- 构建与检查继续使用项目独立的 VitePress、Oxfmt、Oxlint 和 `vue-tsc`，通过 `vp run` 调用现有脚本。
- 修改前先阅读相关页面和 `src/.vitepress/content/` 中的数据定义，保持正文、节点元数据、专题和导航一致。
- 学习节点位于 `src/nodes/<domain>/<slug>/`，元数据在同目录的 `meta.ts` 中声明。所有页面必须登记在 `parts` 中；首项是入口页，`path` 包含 `.md` 扩展名。
- 节点私有组件和静态资源分别放在该节点的 `components/`、`assets/` 中；资源文件名使用小写 kebab-case。教学组件由使用它的 Markdown 显式导入，不得注册为全局主题组件。
- 资源出现第二个节点使用者时才提升为共享资源。同一领域内共享资源放在 `src/nodes/<domain>/_shared/`，跨领域共享资源放在 `src/nodes/_shared/`；`.vitepress/theme/` 只保存站点级组件和样式。
- 图表等生成资源的源文件和产物放在所属节点的 `assets/` 中，生成工具放在 `scripts/` 中。
- 节点关系只使用 `required` 和 `recommended`。`required` 关系不得成环。
- 新节点 ID 必须先加入 `nodeIds`，再登记到中央注册表。节点 ID、概念、技术和专题成员必须使用现有 TypeScript 类型约束；不要用类型断言绕过检查。
- 优先做范围小、边界明确的修改。不要顺手重构无关代码或改写无关文章。
- 不提交构建产物、缓存、依赖目录或本地环境文件。

## 写作约束

- 语言简练、严谨，只保留帮助读者建立正确模型、完成操作或验证理解的信息。
- 先说明结论、约束或可观测事实，再解释原因；避免空泛引言、重复总结和无信息量的过渡句。
- 明确区分事实、假设、经验建议和待验证结论，不把近似描述写成普遍规律。
- 术语、单位、符号和代码标识保持一致。首次出现的必要术语应给出清晰定义。
- 示例必须服务于具体概念，并说明适用边界。不要为了篇幅增加无关示例。
- 操作步骤应可执行，验证方法应给出预期现象或判据。
- 链接到权威资料时说明其用途；正文不得简单堆砌链接代替解释。

## 验证流程

完成修改后依次运行：

```sh
vp run fmt
vp run check
vp run build
```

`vp run fmt` 会写入格式化结果；提交前必须检查这些改动。`vp run check` 包含格式检查、lint 和 Vue / TypeScript 类型检查，`vp run build` 会额外验证内容数据与内部链接。

## Agent skills

### Issue tracker

Issues are tracked in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five canonical labels with their default names. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses the single-context layout. See `docs/agents/domain.md`.
