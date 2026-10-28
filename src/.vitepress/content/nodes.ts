import embeddedCircuitBasics from "#nodes/embedded/circuit-basics/meta.ts"
import embeddedMcuStructure from "#nodes/embedded/mcu-structure/meta.ts"
import engineeringGitBasics from "#nodes/engineering/git-basics/meta.ts"
import engineeringGitRemote from "#nodes/engineering/git-remote/meta.ts"
import engineeringShellBasics from "#nodes/engineering/shell-basics/meta.ts"
import type { Concept, Level, Technology } from "./taxonomy.ts"

/** 全部合法节点 ID。 */
export const nodeIds = [
  "engineering.shell-basics",
  "engineering.git-basics",
  "engineering.git-remote",
  "embedded.circuit-basics",
  "embedded.mcu-structure"
] as const

/** 合法节点 ID。 */
export type NodeId = (typeof nodeIds)[number]

/** 先修关系的强制程度。 */
export type RelationType = "required" | "recommended"

/** 节点 Markdown 文件的相对路径。 */
export type MarkdownPath = `${string}.md`

/** 节点页面的导航信息。 */
export type NodePart = {
  /** 页面在侧边栏中的标题。 */
  title: string
  /** 相对节点目录的 Markdown 文件路径。 */
  path: MarkdownPath
}

/** 单个节点的完整元数据。 */
export type NodeDefinition = {
  /** 节点的固定 ID。 */
  id: NodeId
  /** 节点显示名称。 */
  title: string
  /** 节点学习目标的简述。 */
  summary: string
  /** 建议学习阶段。 */
  level: Level
  /** 完成节点的大致用时。 */
  estimatedTime: string
  /** 节点覆盖的概念。 */
  concepts: readonly Concept[]
  /** 节点涉及的技术。 */
  technologies: readonly Technology[]
  /** 指向直接先修节点的关系。 */
  relations: readonly {
    /** 先修节点 ID。 */
    target: NodeId
    /** 关系的强制程度。 */
    type: RelationType
  }[]
  /** 全部页面；首项为节点入口。 */
  parts: readonly [NodePart, ...NodePart[]]
}

/** 由各节点目录中的元数据组成的中央注册表。 */
export const nodes = {
  [engineeringShellBasics.id]: engineeringShellBasics,
  [engineeringGitBasics.id]: engineeringGitBasics,
  [engineeringGitRemote.id]: engineeringGitRemote,
  [embeddedCircuitBasics.id]: embeddedCircuitBasics,
  [embeddedMcuStructure.id]: embeddedMcuStructure
} satisfies Record<NodeId, NodeDefinition>

/** 前端使用的节点数据。 */
export type GraphNode = NodeDefinition & {
  /** 节点入口页路由。 */
  route: string
}

/** 将点分隔的节点 ID 转换为节点目录路由。 */
export function nodeRoute(id: NodeId) {
  return `/nodes/${id.replaceAll(".", "/")}/`
}

/** 将节点内的 Markdown 路径转换为页面路由。 */
export function nodePartRoute(id: NodeId, path: MarkdownPath) {
  const page = path.slice(0, -".md".length)
  const routePath = page === "index" ? "" : page.replace(/\/index$/, "/")
  return `${nodeRoute(id)}${routePath}`
}

/** 生成按中文标题排序的前端节点列表。 */
export function graphNodes(): GraphNode[] {
  return nodeIds
    .map((id) => ({ ...nodes[id], route: nodePartRoute(id, nodes[id].parts[0].path) }))
    .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"))
}
