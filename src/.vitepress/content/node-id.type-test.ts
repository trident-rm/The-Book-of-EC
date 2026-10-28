import type { NodeId } from "./nodes.ts"

const validNodeId: NodeId = "embedded.mcu-structure"

// @ts-expect-error NodeId 只能取 nodeIds 中提前声明的值。
const unknownNodeId: NodeId = "embedded.unknown"

const validRelation = { target: "engineering.shell-basics" } satisfies { target: NodeId }

// @ts-expect-error 关系目标必须是已声明的 NodeId。
const invalidRelation = { target: "engineering.unknown" } satisfies { target: NodeId }

void validNodeId
void unknownNodeId
void validRelation
void invalidRelation
