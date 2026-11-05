declare module "virtual:learning-graph" {
  /** 构建插件注入的学习图数据。 */
  const graph: {
    nodes: Array<{
      /** 节点的固定 ID。 */
      id: string
      /** 节点显示名称。 */
      title: string
      /** 节点学习目标的简述。 */
      summary: string
      /** 指向直接先修节点的关系。 */
      relations: Array<{
        /** 先修节点 ID。 */
        target: string
        /** 关系的强制程度。 */
        type: "required" | "recommended"
      }>
      /** 全部页面；首项为节点入口。 */
      parts: Array<{
        /** 页面在侧边栏中的标题。 */
        title: string
        /** 相对节点目录的 Markdown 文件路径。 */
        path: `${string}.md`
      }>
      /** 节点入口页路由。 */
      route: string
    }>
    topics: Array<{
      /** 专题注册表键。 */
      id: string
      /** 专题显示名称。 */
      title: string
      /** 专题包含的节点 ID。 */
      members: string[]
      /** 专题详情页路由。 */
      route: string
    }>
  }
  export default graph
}
