---
title: 编写学习节点
prev: false
next: false
---

# 编写学习节点

## 新增节点

1. 在 `src/.vitepress/content/nodes.ts` 的 `nodeIds` 中声明节点 ID。
2. 在 `src/nodes/<domain>/<slug>/` 编写 Markdown 页面，并创建包含该 ID 的 `meta.ts`。
3. 在 `nodes.ts` 中静态导入元数据并加入中央注册表。
4. 按阅读顺序将全部页面加入 `parts`，入口页放在首项，`path` 包含 `.md` 扩展名。
5. 如需进入专题，在 `topics.ts` 的 `members` 中加入节点 ID。
6. 运行 `vp run fmt`、`vp run check` 和 `vp run build`，并检查格式化结果。

## 入口页建议

`parts` 首项指定入口页，不要求使用固定文件名。入口页应明确该节点解决什么问题或要求完成什么任务、核心边界是什么，以及读者如何验证理解或成果。内容较长时拆入附属页，不要为了统一模板创建空页面。

## 拆分边界

当一部分内容需要独立阅读、具有明确标题，或需要单独练习和验证时，可以拆成附属页。附属页仍属于同一个学习节点，不会成为学习图顶点。

## 节点资源

节点私有的 Vue 组件和静态资源与正文放在同一节点目录，并分别进入 `components/` 和 `assets/`：

```text
src/nodes/<domain>/<slug>/
├── index.md
├── meta.ts
├── components/
│   └── ExampleDiagram.vue
└── assets/
    └── example-diagram.svg
```

Markdown 显式导入教学组件。节点内组件使用相对路径，静态资源也使用相对于当前页面或组件的路径。资源文件名使用小写 kebab-case。

资源只有在出现第二个节点的实际使用者时才提升为共享资源。同一领域内共享资源放在 `src/nodes/<domain>/_shared/`；跨领域共享资源放在 `src/nodes/_shared/`。共享目录内部仍按 `components/` 和 `assets/` 分类。不要因为预计以后可能复用，就提前把资源放入共享目录。

`.vitepress/theme/` 只保存站点布局、全站导航、通用渲染能力等站点级组件和样式。表达某个学习内容的组件即使被多个页面使用，也不属于主题。图表等生成资源的源文件和产物放在所属节点的 `assets/`，通用生成工具放在 `scripts/`。

修改 `src/nodes/**/assets/*.wavedrom.json5` 图表源文件后，运行 `vp run diagrams:generate`。生成器会自动发现这些源文件，在相同目录写入同名 SVG；生成后应检查源文件和 SVG 的差异是否符合预期。

## 站内链接

正文中的普通站内链接使用 Markdown 链接语法。自定义 HTML 布局需要包裹复杂内容时，使用全局注册的 `<VPLink href="/path">`，不要直接写根路径 `<a href="/path">`；`VPLink` 会根据部署配置补充 `base` 和页面扩展名。
