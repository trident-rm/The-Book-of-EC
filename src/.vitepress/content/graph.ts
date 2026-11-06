import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import type { Plugin } from "vite"
import { graphNodes, nodeIds, nodes, type NodeId } from "./nodes.ts"
import { graphTopics } from "./topics.ts"

/** 返回节点 ID 对应的源文件目录。 */
function nodeDirectory(source: string, id: NodeId) {
  return join(source, "nodes", ...id.split("."))
}

/** 收集节点目录中已经声明元数据的 ID。 */
function metadataNodeIds(source: string) {
  const root = join(source, "nodes")
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((domain) =>
      readdirSync(join(root, domain.name), { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() && existsSync(join(root, domain.name, entry.name, "meta.ts"))
        )
        .map((entry) => `${domain.name}.${entry.name}`)
    )
}

/** 校验节点元数据、页面、先修依赖和专题成员。 */
export function validateContent(source: string) {
  const declaredIds = new Set<string>(nodeIds)
  for (const id of metadataNodeIds(source)) {
    if (!declaredIds.has(id)) throw new Error(`节点元数据使用了未声明的 ID：${id}`)
  }

  for (const id of nodeIds) {
    const directory = nodeDirectory(source, id)
    if (!existsSync(join(directory, "meta.ts"))) {
      throw new Error(`节点元数据不存在：${id}`)
    }

    const node = nodes[id]
    const paths = new Set<string>()
    for (const part of node.parts) {
      if (paths.has(part.path)) throw new Error(`学习节点包含重复页面：${id}/${part.path}`)
      paths.add(part.path)
      if (!existsSync(join(directory, part.path))) {
        throw new Error(`学习节点页面不存在：${id}/${part.path}`)
      }
    }
  }

  const visiting = new Set<NodeId>()
  const visited = new Set<NodeId>()
  // visiting 表示当前递归路径；再次进入其中的节点即形成环。
  const visit = (id: NodeId) => {
    if (visiting.has(id)) throw new Error(`先修依赖存在环：${[...visiting, id].join(" → ")}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const prerequisite of nodes[id].prerequisites) visit(prerequisite)
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of nodeIds) visit(id)

  for (const topic of graphTopics()) {
    if (new Set(topic.members).size !== topic.members.length) {
      throw new Error(`专题包含重复成员：${topic.id}`)
    }
  }
}

/** 提供构建期校验和学习图虚拟模块。 */
export function learningGraphPlugin(source: string): Plugin {
  // \0 前缀标记该 ID 已由 Vite 插件解析，避免再次参与普通解析。
  const virtualId = "virtual:learning-graph"
  const resolvedId = `\0${virtualId}`

  return {
    name: "learning-graph",
    buildStart() {
      // 即使页面未引用虚拟模块，也要执行内容校验。
      validateContent(source)
    },
    resolveId(id) {
      return id === virtualId ? resolvedId : undefined
    },
    load(id) {
      if (id !== resolvedId) return undefined
      // 开发模式下每次加载都验证，及时发现内容变更导致的问题。
      validateContent(source)
      return `export default ${JSON.stringify({
        nodes: graphNodes(),
        topics: graphTopics()
      })}`
    }
  }
}
