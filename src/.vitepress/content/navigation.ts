import type { DefaultTheme } from "vitepress"
import { nodeIds, nodePartRoute, nodeRoute, nodes } from "./nodes.ts"
import { graphTopics } from "./topics.ts"

/** 生成固定栏目及多页节点的侧边栏。 */
export function createSidebar(): DefaultTheme.Sidebar {
  const sidebar: DefaultTheme.SidebarMulti = {
    "/map/": [
      {
        text: "学习图",
        items: [
          { text: "总览", link: "/map/" },
          {
            text: "专题",
            collapsed: false,
            items: graphTopics().map((topic) => ({ text: topic.title, link: topic.route }))
          }
        ]
      }
    ],
    "/reference/": [
      {
        text: "参考资料",
        items: [
          { text: "概览", link: "/reference/" },
          { text: "如何读技术资料", link: "/reference/reading-docs" },
          { text: "术语与检索词", link: "/reference/glossary" }
        ]
      }
    ],
    "/contributing/": [
      {
        text: "维护本书",
        items: [
          { text: "概览", link: "/contributing/" },
          { text: "内容模型", link: "/contributing/content-model" },
          { text: "编写学习节点", link: "/contributing/writing-nodes" },
          { text: "元数据", link: "/contributing/metadata" },
          { text: "本地开发", link: "/contributing/local-development" }
        ]
      }
    ]
  }

  for (const id of nodeIds) {
    const node = nodes[id]
    // 单页节点无需单独生成侧边栏分组。
    if (node.parts.length === 1) continue
    const route = nodeRoute(id)
    sidebar[route] = [
      {
        text: node.title,
        items: node.parts.map((part) => ({
          text: part.title,
          link: nodePartRoute(id, part.path)
        }))
      }
    ]
  }

  return sidebar
}
