import type { Node, Edge } from '@xyflow/react'

// Extended types for our specific use case
export interface FlowState {
  nodes: Node[]
  edges: Edge[]
  nodeId: number
  zoom: number
}

export interface AlignmentGuide {
  vertical: number[]
  horizontal: number[]
}

export interface SpacingSnap {
  axis: 'x' | 'y'
  targetGap: number
  alignedNodes: string[]
  guidePosition: number
}

export interface SpacingSegment {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  orientation: 'horizontal' | 'vertical'
}

export interface EdgeMenuState {
  visible: boolean
  x: number
  y: number
  edgeId: string
  currentColor: string
}

export type LineColor = {
  name: string
  value: string
}