import DefaultTheme, { VPLink } from "vitepress/theme"
import { h } from "vue"
import "./custom.css"
import CodeTree from "./components/CodeTree.vue"
import LearningGraph from "./components/LearningGraph.vue"
import MermaidDiagram from "./components/MermaidDiagram.vue"
import SidebarToggle from "./components/SidebarToggle.vue"

export default {
  extends: DefaultTheme,
  // 在默认布局底部注入全局侧边栏开关。
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "layout-bottom": () => h(SidebarToggle)
    }),
  /** 注册可在 Markdown 中直接使用的主题组件。 */
  enhanceApp({ app }: { app: { component: (name: string, component: unknown) => void } }) {
    app.component("CodeTree", CodeTree)
    app.component("LearningGraph", LearningGraph)
    app.component("MermaidDiagram", MermaidDiagram)
    app.component("VPLink", VPLink)
  }
}
