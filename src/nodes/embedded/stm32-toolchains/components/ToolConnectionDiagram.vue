<script setup lang="ts">
import flashingSvg from "../assets/flashing-connection.svg?raw"
import debuggingSvg from "../assets/debugging-connection.svg?raw"

const props = defineProps<{ mode: "flashing" | "debugging" }>()

const diagrams = { flashing: flashingSvg, debugging: debuggingSvg }
</script>

<template>
  <div class="tool-connection-diagram" v-html="diagrams[props.mode]"></div>
</template>

<style scoped>
.tool-connection-diagram {
  margin: 1.5rem 0;
  overflow-x: auto;
}

.tool-connection-diagram :deep(svg) {
  display: block;
  width: 100%;
  min-width: 660px;
  height: auto;
}
</style>
