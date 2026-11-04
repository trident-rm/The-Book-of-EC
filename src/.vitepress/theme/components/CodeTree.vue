<script lang="ts">
export type CodeTreeFile = {
  path: string
  slot: string
}

type TreeNode = {
  path: string
  label: string
  file?: CodeTreeFile
  children: TreeNode[]
}

type TreeRow = {
  path: string
  label: string
  depth: number
  directory: boolean
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from "vue"

const props = withDefaults(
  defineProps<{
    title: string
    files: readonly CodeTreeFile[]
    initialFile?: string
    /** 仅设置初始状态，后续由组件内的展开按钮控制。 */
    initialSidebarExpanded?: boolean
  }>(),
  { initialSidebarExpanded: true }
)

const selectedPath = ref(props.initialFile ?? props.files[0]?.path)
const collapsed = ref(new Set<string>())
const activeFile = computed(
  () => props.files.find((file) => file.path === selectedPath.value) ?? props.files[0]
)

const resizeHandleWidth = 8
const sidebarId = useId()
const layout = ref<HTMLElement | null>(null)
const sidebarVisible = ref(props.initialSidebarExpanded)
const narrow = ref(false)
const resizing = ref(false)
const remSize = ref(16)
const layoutWidth = ref<number | null>(null)
// 保留用户设置，容器变窄时只限制实际显示宽度。
const preferredWidth = ref<number | null>(null)
const maximumWidth = computed(() =>
  Math.max(
    0,
    Math.min(
      20 * remSize.value,
      layoutWidth.value === null ? Infinity : (layoutWidth.value - resizeHandleWidth) / 2
    )
  )
)
const minimumWidth = computed(() => Math.min(9 * remSize.value, maximumWidth.value))
const sidebarWidth = computed(() => clampWidth(preferredWidth.value ?? 11 * remSize.value))
const layoutStyle = computed(() => ({
  "--code-tree-sidebar-width": layoutWidth.value === null ? "11rem" : `${sidebarWidth.value}px`,
  "--code-tree-resize-width": `${resizeHandleWidth}px`
}))

let viewportQuery: MediaQueryList | undefined
let observer: ResizeObserver | undefined
let measurementFrame: number | undefined
let drag: { pointerId: number; startX: number; startWidth: number; handle: HTMLElement } | undefined

const rows = computed(() => {
  const root: TreeNode[] = []
  for (const file of props.files) {
    const parts = file.path.split("/")
    let siblings = root
    for (let index = 0; index < parts.length; index++) {
      const path = parts.slice(0, index + 1).join("/")
      let node = siblings.find((item) => item.path === path)
      if (!node) {
        node = { path, label: parts[index], children: [] }
        siblings.push(node)
      }
      if (index === parts.length - 1) node.file = file
      siblings = node.children
    }
  }

  const result: TreeRow[] = []
  const visit = (nodes: TreeNode[], depth: number) => {
    const sorted = [...nodes].sort(
      (a, b) => Number(Boolean(a.file)) - Number(Boolean(b.file)) || a.label.localeCompare(b.label)
    )
    for (const node of sorted) {
      result.push({ path: node.path, label: node.label, depth, directory: !node.file })
      if (!collapsed.value.has(node.path)) visit(node.children, depth + 1)
    }
  }
  visit(root, 0)
  return result
})

function select(row: TreeRow) {
  if (!row.directory) {
    selectedPath.value = row.path
    return
  }
  const next = new Set(collapsed.value)
  if (next.has(row.path)) next.delete(row.path)
  else next.add(row.path)
  collapsed.value = next
}

function clampWidth(width: number) {
  return Math.min(maximumWidth.value, Math.max(minimumWidth.value, width))
}

function measureLayout() {
  if (!layout.value) return
  remSize.value = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  layoutWidth.value = layout.value.getBoundingClientRect().width
}

function stopResize() {
  const current = drag
  drag = undefined
  resizing.value = false
  if (current?.handle.hasPointerCapture(current.pointerId)) {
    current.handle.releasePointerCapture(current.pointerId)
  }
}

function toggleSidebar() {
  stopResize()
  sidebarVisible.value = !sidebarVisible.value
}

function startResize(event: PointerEvent) {
  if (drag || event.button !== 0 || !event.isPrimary || narrow.value || !sidebarVisible.value)
    return
  const handle = event.currentTarget
  if (!(handle instanceof HTMLElement)) return
  event.preventDefault()
  measureLayout()
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startWidth: sidebarWidth.value,
    handle
  }
  handle.setPointerCapture(event.pointerId)
  handle.focus()
  resizing.value = true
}

function moveResize(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) return
  preferredWidth.value = clampWidth(drag.startWidth + event.clientX - drag.startX)
}

function finishResize(event: PointerEvent) {
  if (drag?.pointerId === event.pointerId) stopResize()
}

function resetWidth() {
  stopResize()
  preferredWidth.value = null
}

function resizeWithKeyboard(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  let width: number
  switch (event.key) {
    case "ArrowLeft":
      width = sidebarWidth.value - remSize.value / 2
      break
    case "ArrowRight":
      width = sidebarWidth.value + remSize.value / 2
      break
    case "Home":
      width = minimumWidth.value
      break
    case "End":
      width = maximumWidth.value
      break
    default:
      return
  }
  event.preventDefault()
  stopResize()
  preferredWidth.value = clampWidth(width)
}

function handleViewportChange(event: MediaQueryListEvent) {
  narrow.value = event.matches
  stopResize()
}

onMounted(() => {
  viewportQuery = window.matchMedia("(max-width: 639px)")
  narrow.value = viewportQuery.matches
  viewportQuery.addEventListener("change", handleViewportChange)
  window.addEventListener("blur", stopResize)
  measureLayout()
  observer = new ResizeObserver(() => {
    // 下一帧更新列宽，避免代码换行引发同一轮 ResizeObserver 布局反馈。
    if (measurementFrame !== undefined) cancelAnimationFrame(measurementFrame)
    measurementFrame = requestAnimationFrame(() => {
      measurementFrame = undefined
      measureLayout()
    })
  })
  if (layout.value) observer.observe(layout.value)
})

onBeforeUnmount(() => {
  stopResize()
  observer?.disconnect()
  viewportQuery?.removeEventListener("change", handleViewportChange)
  window.removeEventListener("blur", stopResize)
  if (measurementFrame !== undefined) cancelAnimationFrame(measurementFrame)
})
</script>

<template>
  <section class="code-tree" :class="{ resizing }" :aria-label="`${title} 示例代码`">
    <div class="code-tree-heading">
      <span class="code-tree-title">{{ title }}</span>
      <button
        type="button"
        class="code-tree-toggle"
        :aria-expanded="sidebarVisible"
        :aria-controls="sidebarId"
        @click="toggleSidebar"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" />
          <path d="M8 3.5v13" />
        </svg>
        {{ sidebarVisible ? "收起文件树" : "展开文件树" }}
      </button>
    </div>
    <div
      ref="layout"
      class="code-tree-layout"
      :class="{ 'sidebar-hidden': !sidebarVisible }"
      :style="layoutStyle"
    >
      <nav
        v-show="sidebarVisible"
        :id="sidebarId"
        class="code-tree-files"
        :aria-label="`${title} 文件与目录`"
      >
        <ul>
          <li v-for="row in rows" :key="row.path">
            <button
              type="button"
              :class="{ selected: !row.directory && activeFile?.path === row.path }"
              :style="{ paddingInlineStart: `${0.6 + row.depth * 0.9}rem` }"
              :aria-current="!row.directory && activeFile?.path === row.path ? 'true' : undefined"
              :aria-expanded="row.directory ? !collapsed.has(row.path) : undefined"
              :aria-label="row.path"
              @click="select(row)"
            >
              <svg
                class="code-tree-icon"
                :class="{ expanded: row.directory && !collapsed.has(row.path) }"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path v-if="row.directory" d="m6 3 5 5-5 5" />
                <path v-else d="M4 1.5h5l3 3v10H4z M9 1.5v3h3 M6 8h4 M6 11h4" />
              </svg>
              <span>{{ row.label }}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div
        v-show="sidebarVisible && !narrow"
        class="code-tree-resize"
        role="separator"
        tabindex="0"
        aria-orientation="vertical"
        aria-label="调整文件树宽度"
        :aria-controls="sidebarId"
        :aria-valuemin="Math.round(minimumWidth)"
        :aria-valuemax="Math.round(maximumWidth)"
        :aria-valuenow="Math.round(sidebarWidth)"
        :aria-valuetext="`${Math.round(sidebarWidth)} 像素`"
        title="拖动或使用左右方向键调宽，双击恢复默认宽度"
        @pointerdown="startResize"
        @pointermove="moveResize"
        @pointerup="finishResize"
        @pointercancel="finishResize"
        @lostpointercapture="finishResize"
        @keydown="resizeWithKeyboard"
        @dblclick.prevent="resetWidth"
      />
      <div class="code-tree-panel">
        <div class="code-tree-filename">{{ activeFile?.path }}</div>
        <div class="code-tree-code">
          <div
            v-for="file in files"
            v-show="file.path === activeFile?.path"
            :key="file.path"
            class="code-tree-file"
            role="region"
            :aria-label="`${file.path} 代码`"
          >
            <slot :name="file.slot" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.code-tree {
  margin: 1.25rem 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-code-block-bg);
}

.code-tree-heading,
.code-tree-filename {
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  line-height: 1.5;
}

.code-tree-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: var(--vp-c-bg-soft);
  font-weight: 600;
}

.code-tree-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-tree-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
  font-weight: 400;
  cursor: pointer;
}

.code-tree-toggle:hover {
  background: var(--vp-c-default-soft);
}

.code-tree-toggle svg {
  width: 1rem;
  height: 1rem;
}

.code-tree-layout {
  display: grid;
  grid-template-columns: var(--code-tree-sidebar-width, 11rem) var(--code-tree-resize-width) minmax(
      0,
      1fr
    );
}

.code-tree-layout.sidebar-hidden {
  grid-template-columns: minmax(0, 1fr);
}

.code-tree-files {
  min-width: 0;
  max-height: 34rem;
  padding: 0.5rem;
  overflow: auto;
  background: var(--vp-c-bg-alt);
}

.code-tree-files ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.code-tree-files li + li {
  margin-top: 0.15rem;
}

.code-tree-files button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.4rem;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
}

.code-tree-files button:hover {
  background: var(--vp-c-default-soft);
}

.code-tree-files button.selected {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.code-tree-files button:focus-visible,
.code-tree-toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}

.code-tree-resize {
  position: relative;
  background: var(--vp-c-bg-alt);
  cursor: col-resize;
  touch-action: none;
}

.code-tree-resize::before,
.code-tree-resize::after {
  position: absolute;
  left: 50%;
  width: 1px;
  background: var(--vp-c-divider);
  content: "";
}

.code-tree-resize::before {
  top: 0;
  bottom: 0;
}

.code-tree-resize::after {
  top: 50%;
  width: 3px;
  height: 1.5rem;
  border-radius: 2px;
  transform: translate(-1px, -50%);
}

.code-tree-resize:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}

.code-tree-resize:hover::after,
.code-tree-resize:focus-visible::after,
.code-tree.resizing .code-tree-resize::after {
  background: var(--vp-c-brand-1);
}

.code-tree.resizing :deep(*) {
  cursor: col-resize !important;
  user-select: none;
}

.code-tree-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

.code-tree-icon.expanded {
  transform: rotate(90deg);
}

.code-tree-panel {
  min-width: 0;
}

.code-tree-filename {
  overflow-wrap: anywhere;
  color: var(--vp-c-text-2);
}

.code-tree-code {
  max-height: 30rem;
  overflow: auto;
}

.code-tree-file :deep(div[class*="language-"]) {
  margin: 0;
  border-radius: 0;
}

@media (max-width: 639px) {
  .code-tree-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .code-tree-files {
    max-height: 12rem;
    border-bottom: 1px solid var(--vp-c-divider);
  }

  .code-tree-resize {
    display: none;
  }
}
</style>
