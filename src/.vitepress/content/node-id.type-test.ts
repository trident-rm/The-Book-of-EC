import type { NodeDefinition, NodeId } from "./nodes.ts"

const validNodeId: NodeId = "embedded.mcu-structure"

// @ts-expect-error NodeId 只能取 nodeIds 中提前声明的值。
const unknownNodeId: NodeId = "embedded.unknown"

const validPrerequisites = ["engineering.shell-basics"] satisfies NodeDefinition["prerequisites"]

// @ts-expect-error 先修节点必须是已声明的 NodeId。
const invalidPrerequisites = ["engineering.unknown"] satisfies NodeDefinition["prerequisites"]

void validNodeId
void unknownNodeId
void validPrerequisites
void invalidPrerequisites
