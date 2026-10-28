import type { NodeId } from "./nodes.ts"

/** 专题注册项的公共结构。 */
type TopicShape = {
  /** 专题页显示名称。 */
  title: string
  /** 专题覆盖内容的简述。 */
  summary: string
  /** 专题包含的节点，顺序用于展示。 */
  members: readonly NodeId[]
}

/** 保留专题键的字面量类型，同时校验成员节点。 */
function defineTopics<const Registry extends Record<string, TopicShape>>(registry: Registry) {
  return registry
}

export const topics = defineTopics({
  engineering: {
    title: "工程与协作",
    summary: "命令行、版本管理与远程协作的工程基础。",
    members: ["engineering.shell-basics", "engineering.git-basics", "engineering.git-remote"]
  },
  embedded: {
    title: "电子与嵌入式",
    summary: "电路与电平约束，以及 MCU 的基本结构。",
    members: ["embedded.circuit-basics", "embedded.mcu-structure"]
  }
})

/** 专题注册表中的合法键。 */
export type TopicId = keyof typeof topics

/** 前端使用的专题数据。 */
export type GraphTopic = (typeof topics)[TopicId] & {
  /** 专题注册表键。 */
  id: TopicId
  /** 专题详情页路由。 */
  route: string
}

/** 将专题注册表转换为前端可直接消费的列表。 */
export function graphTopics(): GraphTopic[] {
  return (Object.entries(topics) as [TopicId, (typeof topics)[TopicId]][]).map(([id, topic]) => ({
    ...topic,
    id,
    route: `/map/topics/${id}`
  }))
}
