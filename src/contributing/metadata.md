---
title: 元数据
prev: false
next: false
---

# 元数据

节点元数据位于各节点目录的 `meta.ts`，专题和公共类型位于 `src/.vitepress/content/`。这些声明由 TypeScript 在编辑和检查阶段约束。

## 节点 ID

全部固定 ID 在 `nodes.ts` 的 `nodeIds` 中统一声明，例如 `embedded.mcu-structure`，`NodeId` 从该数组推导。每个 `meta.ts` 必须声明自己的 `id`；关系目标和专题成员只能使用已有 `NodeId`。

## 节点字段

- `title`、`summary`：图中展示的名称和摘要。
- `id`：与所在节点目录对应的固定 ID。
- `level`：`intro`、`core`、`advanced` 或 `integration`。
- `estimatedTime`：完成节点的大致时间。
- `concepts`、`technologies`：图内筛选使用的固定标签。
- `relations`：指向必需或建议先修节点。
- `parts`：节点全部页面的标题、Markdown 文件路径与线性顺序；首项为入口页，路径包含 `.md` 扩展名。

## 专题成员

专题使用 `members` 声明节点集合。数组仅用于保存集合，不表达阅读顺序；不得包含重复节点。

## 构建验证

中央注册表静态导入全部 `meta.ts`，因此不需要额外的元数据生成命令。TypeScript 负责检查 ID、标签、字段取值和 Markdown 路径扩展名；构建阶段继续检查 `NodeId` 与元数据目录是否一致、已登记页面是否存在、重复页面、重复专题成员和必需依赖环。
