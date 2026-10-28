---
layout: home

hero:
  name: "The Book of EC"
  text: "嵌入式电控学习图"
  tagline: 面向 RoboMaster 新成员，以学习节点和先修关系组织知识。
  actions:
    - theme: brand
      text: 打开学习图
      link: /map/
    - theme: alt
      text: 从问题开始
      link: /problems/

features:
  - title: 节点是正文
    details: 每个节点解决一个明确的学习或实践目标，可包含多个连续小节。
  - title: 关系决定路径
    details: 必需与建议先修构成学习图，不强加覆盖全书的线性顺序。
  - title: 观测验证理解
    details: 从检查题、练习、实验和真实故障中验证知识边界。
---

## 选择一个起点

不必先规划完整路线。选择与你当前任务最近的入口，再沿图补齐先修知识。

<div class="capability-map">
  <VPLink href="/nodes/engineering/shell-basics/"><strong>我要开始修改工程</strong><span>从命令、路径、工具查找和运行环境开始。</span></VPLink>
  <VPLink href="/nodes/embedded/circuit-basics/"><strong>我要开始接触硬件</strong><span>从供电、参考地和逻辑电平开始。</span></VPLink>
</div>

## 学习图

这是与“学习图”栏目相同的完整交互总图。选择节点查看先修和后续，或直接进入正文。

<LearningGraph />

## 按专题浏览

<div class="capability-map">
  <VPLink href="/map/topics/engineering"><strong>工程与协作</strong><span>命令行、版本管理与远程协作。</span></VPLink>
  <VPLink href="/map/topics/embedded"><strong>电子与嵌入式</strong><span>电路、电平与 MCU 结构。</span></VPLink>
</div>

## 从问题进入

遇到构建、上电、通信或控制问题时，先记录现象和观测，再从[问题排查](/problems/)定位相关节点。

::: info 本书的边界
本站负责学习关系、概念边界、训练任务和验证方法，不替代教材、芯片手册或实际工程文档。
:::
