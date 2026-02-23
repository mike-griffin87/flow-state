import { useCallback, useRef, useState, useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
  reconnectEdge,
  getSmoothStepPath,
  type Connection,
  type Node,
  type Edge,
  type OnMove,
  ConnectionMode,
} from '@xyflow/react'
import styled from 'styled-components'
import '@xyflow/react/dist/style.css'
import NodeLibrary from './components/NodeLibrary'
import { Block, TextNode, type BlockData } from './components/BlockNodes'
import ConnectorToolbar from './components/ConnectorToolbar'

// Apple-inspired styled components
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #ffffff;
`

const FlowContainer = styled.div<{ $isConnecting?: boolean }>`
  width: 100%;
  height: 100%;
  
  /* Fix cursor during connection dragging */
  ${props => props.$isConnecting && `
    .react-flow__container {
      cursor: crosshair !important;
    }
    
    .react-flow__node {
      cursor: crosshair !important;
    }
    
    .react-flow__handle {
      cursor: crosshair !important;
    }
  `}
  
  .react-flow__background {
    background-color: #f5f5f7;
  }
  
  .react-flow__controls {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #d1d1d6;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(20px);
  }
  
  .react-flow__controls-button {
    background: transparent;
    border: none;
    color: #1d1d1f;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
  
  .react-flow__minimap {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #d1d1d6;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(20px);
  }
  
  /* Hide React Flow attribution */
  .react-flow__attribution {
    display: none;
  }
  
  /* Handle dots - hidden by default, visible on hover */
  .handle-dot {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .block:hover .handle-dot {
    opacity: 1 !important;
  }
`

const ZoomIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px);
  z-index: 5;
  pointer-events: none;
`

const AlignmentGuide = styled.div<{ 
  $isHorizontal: boolean; 
  $position: number; 
}>`
  position: absolute;
  ${props => props.$isHorizontal 
    ? `
      left: 0;
      right: 0;
      top: ${props.$position}px;
      height: 1px;
      border-top: 1px dashed tomato;
    `
    : `
      top: 0;
      bottom: 0;
      left: ${props.$position}px;
      width: 1px;
      border-left: 1px dashed tomato;
    `
  }
  z-index: 1000;
  pointer-events: none;
`


const SpacingSegment = styled.div<{ 
  $x1: number; $y1: number; $x2: number; $y2: number; 
  $orientation: 'horizontal' | 'vertical' 
}>`
  position: absolute;
  ${props => props.$orientation === 'horizontal' 
    ? `
      left: ${Math.min(props.$x1, props.$x2)}px;
      top: ${props.$y1 - 1}px;
      width: ${Math.abs(props.$x2 - props.$x1)}px;
      height: 2px;
      background: tomato;
      border-top: 1px solid tomato;
      border-bottom: 1px solid tomato;
    `
    : `
      left: ${props.$x1 - 1}px;
      top: ${Math.min(props.$y1, props.$y2)}px;
      width: 2px;
      height: ${Math.abs(props.$y2 - props.$y1)}px;
      background: tomato;
      border-left: 1px solid tomato;
      border-right: 1px solid tomato;
    `
  }
  z-index: 1002;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    ${props => props.$orientation === 'horizontal'
      ? `
        left: -2px;
        top: -2px;
        width: 4px;
        height: 6px;
        border: 1px solid tomato;
        border-radius: 1px;
      `
      : `
        left: -2px;
        top: -2px;
        width: 6px;
        height: 4px;
        border: 1px solid tomato;
        border-radius: 1px;
      `
    }
    background: tomato;
  }
  
  &::after {
    content: '';
    position: absolute;
    ${props => props.$orientation === 'horizontal'
      ? `
        right: -2px;
        top: -2px;
        width: 4px;
        height: 6px;
        border: 1px solid tomato;
        border-radius: 1px;
      `
      : `
        left: -2px;
        bottom: -2px;
        width: 6px;
        height: 4px;
        border: 1px solid tomato;
        border-radius: 1px;
      `
    }
    background: tomato;
  }
`

const FlowContainerWithGuides = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const StyledNode = styled.div`
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  min-width: 120px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }
  
  &.selected {
    border-color: #007aff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
  }
`




const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, data }: any) => {
  const [isHovered, setIsHovered] = useState(false)
  
  // Use React Flow's getSmoothStepPath for better curves like your screenshot
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition || 'right',
    targetX,
    targetY,
    targetPosition: targetPosition || 'left',
    borderRadius: 10,
  })
  
  const handleEdgeClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    // Dispatch custom event to parent component
    window.dispatchEvent(new CustomEvent('edge-click', {
      detail: { edgeId: id, x: event.clientX, y: event.clientY }
    }))
  }, [id])
  
  const currentStyle = data?.lineType === 'dashed' ? '8,4' : 'none'
  const strokeColor = isHovered 
    ? (data?.lineColor ? `${data.lineColor}dd` : "#333") 
    : (data?.lineColor || style?.stroke || "#666")
  const strokeWidth = style?.strokeWidth || 2
  
  return (
    <>
      {/* Define chevron-style arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path
            d="M2,2 L6,4 L2,6"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      
      {/* Main path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={currentStyle}
        markerEnd={`url(#arrowhead-${id})`}
        style={{
          cursor: 'pointer'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleEdgeClick}
      />
      
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleEdgeClick}
      />
    </>
  )
}

// Custom node component
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <StyledNode className={selected ? 'selected' : ''}>
    {data.label}
  </StyledNode>
)

// Define node types
const nodeTypes = {
  custom: CustomNode,
  block: Block,
  textNode: TextNode,
}

// Define edge types
const edgeTypes = {
  default: CustomEdge,
  custom: CustomEdge,
  smoothstep: CustomEdge,
}



// Default line style and color
const DEFAULT_LINE_STYLE = {
  type: 'solid' as 'solid' | 'dashed',
  color: '#666666'
}

// Initial nodes - start with blank canvas
const initialNodes: Node<BlockData>[] = []

const initialEdges: Edge[] = []

// Default edge options - simplified for custom edge
const getDefaultEdgeOptions = (lineSettings: typeof DEFAULT_LINE_STYLE) => ({
  type: 'custom',
  data: {
    lineType: lineSettings.type,
    lineColor: lineSettings.color
  },
  style: {
    strokeWidth: 2,
    stroke: lineSettings.color,
    strokeDasharray: lineSettings.type === 'dashed' ? '5 5' : 'none'
  }
})

/* 
=== CRITICAL CONNECTION CONFIGURATION - DO NOT MODIFY ===
The following settings ensure connections work properly:
1. connectionMode: ConnectionMode.Loose
2. Double handles (source + target) on each side
3. isValidConnection callback prevents self-connections
4. onReconnect handlers enable drag-to-disconnect
Any changes to these may break connection functionality!
=== END CRITICAL SECTION ===
*/

function FlowComponent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { screenToFlowPosition, getViewport } = useReactFlow()
  const [nodeId, setNodeId] = useState(4) // Start from 4 since we have 3 initial nodes
  const [zoom, setZoom] = useState(1.25) // Default to 125%
  const [alignmentGuides, setAlignmentGuides] = useState<{
    horizontal?: { position: number; snapTo: number };
    vertical?: { position: number; snapTo: number };
  }>({})
  const [activeSpacingSnap, setActiveSpacingSnap] = useState<{
    x?: number;
    y?: number;
  }>({})
  const [activeSpacingSegments, setActiveSpacingSegments] = useState<{
    segments: Array<{
      orientation: 'horizontal' | 'vertical';
      x1: number; y1: number; x2: number; y2: number;
      label?: string;
    }>;
  }>({ segments: [] })
  const [isConnecting, setIsConnecting] = useState(false) // Track connection state
  const [connectorToolbarState, setConnectorToolbarState] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    edgeId: string | null;
  }>({ isOpen: false, x: 0, y: 0, edgeId: null })
  const [currentLineSettings, setCurrentLineSettings] = useState(DEFAULT_LINE_STYLE)
  const edgeReconnectSuccessful = useRef(true)
  const reconnectingEdge = useRef<Edge | null>(null)

  // Default viewport settings
  const defaultViewport = { x: 0, y: 0, zoom: 1.25 }

  // Spacing/Distribution Helper Functions
  const rowTolerance = 6
  const colTolerance = 6
  const spacingTolerance = 4

  const getRowCandidates = useCallback((draggedNode: Node, allNodes: Node[]) => {
    const draggedCenterY = draggedNode.position.y + ((draggedNode.measured?.height || 50) / 2)
    return allNodes.filter(node => {
      if (node.id === draggedNode.id) return false
      const nodeCenterY = node.position.y + ((node.measured?.height || 50) / 2)
      return Math.abs(nodeCenterY - draggedCenterY) <= rowTolerance
    })
  }, [])

  const getColumnCandidates = useCallback((draggedNode: Node, allNodes: Node[]) => {
    const draggedCenterX = draggedNode.position.x + ((draggedNode.measured?.width || 100) / 2)
    return allNodes.filter(node => {
      if (node.id === draggedNode.id) return false
      const nodeCenterX = node.position.x + ((node.measured?.width || 100) / 2)
      return Math.abs(nodeCenterX - draggedCenterX) <= colTolerance
    })
  }, [])

  const findHorizontalSpacingSnap = useCallback((draggedNode: Node, rowBlocks: Node[]) => {
    if (rowBlocks.length === 0) return null

    // Sort existing blocks (without dragged) by x position to detect patterns
    const existingBlocks = rowBlocks.sort((a, b) => a.position.x - b.position.x)
    const draggedLeft = draggedNode.position.x
    const draggedRight = draggedNode.position.x + (draggedNode.measured?.width || 100)
    const draggedWidth = draggedNode.measured?.width || 100
    const viewport = { x: defaultViewport.x, y: defaultViewport.y, zoom: zoom }

    let bestSnap = null
    let segments: any[] = []

    // Sort all blocks (including dragged) to find insertion point
    const allBlocks = [...existingBlocks, draggedNode].sort((a, b) => a.position.x - b.position.x)
    const draggedIndex = allBlocks.findIndex(block => block.id === draggedNode.id)
    
    const prev = draggedIndex > 0 ? allBlocks[draggedIndex - 1] : null
    const next = draggedIndex < allBlocks.length - 1 ? allBlocks[draggedIndex + 1] : null

    // Case 1: Block between two others - equalize spacing
    if (prev && next) {
      const prevRight = prev.position.x + (prev.measured?.width || 100)
      const nextLeft = next.position.x
      
      const totalSpace = nextLeft - prevRight
      const equalGap = (totalSpace - draggedWidth) / 2
      
      if (equalGap >= 0) {
        const newDraggedLeft = prevRight + equalGap
        const gapPrev = draggedLeft - prevRight
        const gapNext = nextLeft - draggedRight
        
        if (Math.abs(gapPrev - gapNext) <= spacingTolerance * 2) {
          const movement = Math.abs(newDraggedLeft - draggedLeft)
          bestSnap = { x: newDraggedLeft, movement, type: 'equalize' }
          
          const prevY = prev.position.y + (prev.measured?.height || 50) / 2
          const draggedY = draggedNode.position.y + (draggedNode.measured?.height || 50) / 2
          const nextY = next.position.y + (next.measured?.height || 50) / 2
          
          segments.push({
            orientation: 'horizontal' as const,
            x1: (prevRight * viewport.zoom) + viewport.x,
            y1: (prevY * viewport.zoom) + viewport.y,
            x2: ((newDraggedLeft) * viewport.zoom) + viewport.x,
            y2: (draggedY * viewport.zoom) + viewport.y,
            label: `${Math.round(equalGap)}px`
          })
          segments.push({
            orientation: 'horizontal' as const,
            x1: ((newDraggedLeft + draggedWidth) * viewport.zoom) + viewport.x,
            y1: (draggedY * viewport.zoom) + viewport.y,
            x2: (nextLeft * viewport.zoom) + viewport.x,
            y2: (nextY * viewport.zoom) + viewport.y,
            label: `${Math.round(equalGap)}px`
          })
        }
      }
    }
    // Case 2: Extend existing sequence (2+ blocks with consistent spacing)
    else if (existingBlocks.length >= 2) {
      // Find consistent spacing in existing sequence
      const gaps = []
      for (let i = 0; i < existingBlocks.length - 1; i++) {
        const leftRight = existingBlocks[i].position.x + (existingBlocks[i].measured?.width || 100)
        const rightLeft = existingBlocks[i + 1].position.x
        gaps.push(rightLeft - leftRight)
      }
      
      // Check if gaps are roughly equal (within tolerance)
      const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
      const isConsistent = gaps.every(gap => Math.abs(gap - averageGap) <= spacingTolerance)
      
      if (isConsistent && averageGap > 0) {
        const draggedY = draggedNode.position.y + (draggedNode.measured?.height || 50) / 2
        
        // Try extending to the right
        if (!next && prev) {
          const prevRight = prev.position.x + (prev.measured?.width || 100)
          const newDraggedLeft = prevRight + averageGap
          const movement = Math.abs(newDraggedLeft - draggedLeft)
          
          if (movement <= 50) { // Only suggest if reasonably close
            bestSnap = { x: newDraggedLeft, movement, type: 'extend-right' }
            
            const prevY = prev.position.y + (prev.measured?.height || 50) / 2
            segments.push({
              orientation: 'horizontal' as const,
              x1: (prevRight * viewport.zoom) + viewport.x,
              y1: (prevY * viewport.zoom) + viewport.y,
              x2: ((newDraggedLeft) * viewport.zoom) + viewport.x,
              y2: (draggedY * viewport.zoom) + viewport.y,
              label: `${Math.round(averageGap)}px`
            })
          }
        }
        
        // Try extending to the left (only if right extension wasn't better)
        if (!prev && next && (!bestSnap || bestSnap.movement > 25)) {
          const nextLeft = next.position.x
          const newDraggedLeft = nextLeft - averageGap - draggedWidth
          const movement = Math.abs(newDraggedLeft - draggedLeft)
          
          if (movement <= 50 && (!bestSnap || movement < bestSnap.movement)) {
            bestSnap = { x: newDraggedLeft, movement, type: 'extend-left' }
            
            const nextY = next.position.y + (next.measured?.height || 50) / 2
            segments = [{ // Reset segments for left extension
              orientation: 'horizontal' as const,
              x1: ((newDraggedLeft + draggedWidth) * viewport.zoom) + viewport.x,
              y1: (draggedY * viewport.zoom) + viewport.y,
              x2: (nextLeft * viewport.zoom) + viewport.x,
              y2: (nextY * viewport.zoom) + viewport.y,
              label: `${Math.round(averageGap)}px`
            }]
          }
        }
      }
    }

    return bestSnap ? { ...bestSnap, segments } : null
  }, [zoom, defaultViewport, spacingTolerance])

  const findVerticalSpacingSnap = useCallback((draggedNode: Node, colBlocks: Node[]) => {
    if (colBlocks.length === 0) return null

    // Sort existing blocks (without dragged) by y position to detect patterns
    const existingBlocks = colBlocks.sort((a, b) => a.position.y - b.position.y)
    const draggedTop = draggedNode.position.y
    const draggedBottom = draggedNode.position.y + (draggedNode.measured?.height || 50)
    const draggedHeight = draggedNode.measured?.height || 50
    const viewport = { x: defaultViewport.x, y: defaultViewport.y, zoom: zoom }

    let bestSnap = null
    let segments: any[] = []

    // Sort all blocks (including dragged) to find insertion point
    const allBlocks = [...existingBlocks, draggedNode].sort((a, b) => a.position.y - b.position.y)
    const draggedIndex = allBlocks.findIndex(block => block.id === draggedNode.id)
    
    const prev = draggedIndex > 0 ? allBlocks[draggedIndex - 1] : null
    const next = draggedIndex < allBlocks.length - 1 ? allBlocks[draggedIndex + 1] : null

    // Case 1: Block between two others - equalize spacing
    if (prev && next) {
      const prevBottom = prev.position.y + (prev.measured?.height || 50)
      const nextTop = next.position.y
      
      const totalSpace = nextTop - prevBottom
      const equalGap = (totalSpace - draggedHeight) / 2
      
      if (equalGap >= 0) {
        const newDraggedTop = prevBottom + equalGap
        const gapPrev = draggedTop - prevBottom
        const gapNext = nextTop - draggedBottom
        
        if (Math.abs(gapPrev - gapNext) <= spacingTolerance * 2) {
          const movement = Math.abs(newDraggedTop - draggedTop)
          bestSnap = { y: newDraggedTop, movement, type: 'equalize' }
          
          const prevX = prev.position.x + (prev.measured?.width || 100) / 2
          const draggedX = draggedNode.position.x + (draggedNode.measured?.width || 100) / 2
          const nextX = next.position.x + (next.measured?.width || 100) / 2
          
          segments.push({
            orientation: 'vertical' as const,
            x1: (prevX * viewport.zoom) + viewport.x,
            y1: (prevBottom * viewport.zoom) + viewport.y,
            x2: (draggedX * viewport.zoom) + viewport.x,
            y2: (newDraggedTop * viewport.zoom) + viewport.y,
            label: `${Math.round(equalGap)}px`
          })
          segments.push({
            orientation: 'vertical' as const,
            x1: (draggedX * viewport.zoom) + viewport.x,
            y1: ((newDraggedTop + draggedHeight) * viewport.zoom) + viewport.y,
            x2: (nextX * viewport.zoom) + viewport.x,
            y2: (nextTop * viewport.zoom) + viewport.y,
            label: `${Math.round(equalGap)}px`
          })
        }
      }
    }
    // Case 2: Extend existing sequence (2+ blocks with consistent spacing)
    else if (existingBlocks.length >= 2) {
      // Find consistent spacing in existing sequence
      const gaps = []
      for (let i = 0; i < existingBlocks.length - 1; i++) {
        const topBottom = existingBlocks[i].position.y + (existingBlocks[i].measured?.height || 50)
        const bottomTop = existingBlocks[i + 1].position.y
        gaps.push(bottomTop - topBottom)
      }
      
      // Check if gaps are roughly equal (within tolerance)
      const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
      const isConsistent = gaps.every(gap => Math.abs(gap - averageGap) <= spacingTolerance)
      
      if (isConsistent && averageGap > 0) {
        const draggedX = draggedNode.position.x + (draggedNode.measured?.width || 100) / 2
        
        // Try extending downward
        if (!next && prev) {
          const prevBottom = prev.position.y + (prev.measured?.height || 50)
          const newDraggedTop = prevBottom + averageGap
          const movement = Math.abs(newDraggedTop - draggedTop)
          
          if (movement <= 50) { // Only suggest if reasonably close
            bestSnap = { y: newDraggedTop, movement, type: 'extend-down' }
            
            const prevX = prev.position.x + (prev.measured?.width || 100) / 2
            segments.push({
              orientation: 'vertical' as const,
              x1: (prevX * viewport.zoom) + viewport.x,
              y1: (prevBottom * viewport.zoom) + viewport.y,
              x2: (draggedX * viewport.zoom) + viewport.x,
              y2: (newDraggedTop * viewport.zoom) + viewport.y,
              label: `${Math.round(averageGap)}px`
            })
          }
        }
        
        // Try extending upward (only if downward extension wasn't better)
        if (!prev && next && (!bestSnap || bestSnap.movement > 25)) {
          const nextTop = next.position.y
          const newDraggedTop = nextTop - averageGap - draggedHeight
          const movement = Math.abs(newDraggedTop - draggedTop)
          
          if (movement <= 50 && (!bestSnap || movement < bestSnap.movement)) {
            bestSnap = { y: newDraggedTop, movement, type: 'extend-up' }
            
            const nextX = next.position.x + (next.measured?.width || 100) / 2
            segments = [{ // Reset segments for upward extension
              orientation: 'vertical' as const,
              x1: (draggedX * viewport.zoom) + viewport.x,
              y1: ((newDraggedTop + draggedHeight) * viewport.zoom) + viewport.y,
              x2: (nextX * viewport.zoom) + viewport.x,
              y2: (nextTop * viewport.zoom) + viewport.y,
              label: `${Math.round(averageGap)}px`
            }]
          }
        }
      }
    }

    return bestSnap ? { ...bestSnap, segments } : null
  }, [zoom, defaultViewport, spacingTolerance])

  const chooseBestSnapCandidate = useCallback((horizontalCandidate: any, verticalCandidate: any) => {
    if (!horizontalCandidate && !verticalCandidate) return null
    if (!horizontalCandidate) return verticalCandidate
    if (!verticalCandidate) return horizontalCandidate

    // Choose based on smallest movement required
    if (horizontalCandidate.movement < verticalCandidate.movement) {
      return horizontalCandidate
    } else if (verticalCandidate.movement < horizontalCandidate.movement) {
      return verticalCandidate
    } else {
      // Equal movement, combine both
      return {
        x: horizontalCandidate.x,
        y: verticalCandidate.y,
        movement: horizontalCandidate.movement,
        segments: [...horizontalCandidate.segments, ...verticalCandidate.segments]
      }
    }
  }, [])

  // Enhanced alignment detection (simplified)
  const detectAlignmentsAndSpacing = useCallback((draggedNode: Node, allNodes: Node[]) => {
    // Alignment detection
    const SNAP_THRESHOLD = 8 // pixels
    
    const draggedBounds = {
      left: draggedNode.position.x,
      right: draggedNode.position.x + (draggedNode.measured?.width || 100),
      top: draggedNode.position.y,
      bottom: draggedNode.position.y + (draggedNode.measured?.height || 50),
      centerX: draggedNode.position.x + ((draggedNode.measured?.width || 100) / 2),
      centerY: draggedNode.position.y + ((draggedNode.measured?.height || 50) / 2)
    }

    type GuideInfo = { distance: number; guide: number; snapTo: number }
    let closestVertical: GuideInfo | null = null
    let closestHorizontal: GuideInfo | null = null

    allNodes.forEach(node => {
      if (node.id === draggedNode.id) return
      
      const nodeBounds = {
        left: node.position.x,
        right: node.position.x + (node.measured?.width || 100),
        top: node.position.y,
        bottom: node.position.y + (node.measured?.height || 50),
        centerX: node.position.x + ((node.measured?.width || 100) / 2),
        centerY: node.position.y + ((node.measured?.height || 50) / 2)
      }

      // Check vertical alignments - find closest
      const verticalChecks = [
        { dragged: draggedBounds.centerX, target: nodeBounds.centerX, type: 'center' },
        { dragged: draggedBounds.left, target: nodeBounds.left, type: 'left' },
        { dragged: draggedBounds.right, target: nodeBounds.right, type: 'right' },
        { dragged: draggedBounds.left, target: nodeBounds.right, type: 'leftToRight' },
        { dragged: draggedBounds.right, target: nodeBounds.left, type: 'rightToLeft' }
      ]

      verticalChecks.forEach(check => {
        const distance = Math.abs(check.dragged - check.target)
        if (distance < SNAP_THRESHOLD && (!closestVertical || distance < closestVertical.distance)) {
          const viewport = getViewport()
          const screenX = (check.target * viewport.zoom) + viewport.x
          let snapToX = check.target
          
          if (check.type === 'center') {
            snapToX = check.target - ((draggedNode.measured?.width || 100) / 2)
          } else if (check.type === 'right' || check.type === 'rightToLeft') {
            snapToX = check.target - (draggedNode.measured?.width || 100)
          } else if (check.type === 'leftToRight') {
            snapToX = check.target
          }
          
          closestVertical = { distance, guide: screenX, snapTo: snapToX }
        }
      })

      // Check horizontal alignments
      const horizontalChecks = [
        { dragged: draggedBounds.centerY, target: nodeBounds.centerY, type: 'center' },
        { dragged: draggedBounds.top, target: nodeBounds.top, type: 'top' },
        { dragged: draggedBounds.bottom, target: nodeBounds.bottom, type: 'bottom' },
        { dragged: draggedBounds.top, target: nodeBounds.bottom, type: 'topToBottom' },
        { dragged: draggedBounds.bottom, target: nodeBounds.top, type: 'bottomToTop' }
      ]

      horizontalChecks.forEach(check => {
        const distance = Math.abs(check.dragged - check.target)
        if (distance < SNAP_THRESHOLD && (!closestHorizontal || distance < closestHorizontal.distance)) {
          const viewport = getViewport()
          const screenY = (check.target * viewport.zoom) + viewport.y
          let snapToY = check.target
          
          if (check.type === 'center') {
            snapToY = check.target - ((draggedNode.measured?.height || 50) / 2)
          } else if (check.type === 'bottom' || check.type === 'bottomToTop') {
            snapToY = check.target - (draggedNode.measured?.height || 50)
          } else if (check.type === 'topToBottom') {
            snapToY = check.target
          }
          
          closestHorizontal = { distance, guide: screenY, snapTo: snapToY }
        }
      })
    })

    // Set alignment guides
    setAlignmentGuides({
      vertical: closestVertical ? {
        position: (closestVertical as GuideInfo).guide,
        snapTo: (closestVertical as GuideInfo).snapTo
      } : undefined,
      horizontal: closestHorizontal ? {
        position: (closestHorizontal as GuideInfo).guide,
        snapTo: (closestHorizontal as GuideInfo).snapTo
      } : undefined,
    })

    // Then, run spacing detection
    const rowCandidates = getRowCandidates(draggedNode, allNodes)
    const colCandidates = getColumnCandidates(draggedNode, allNodes)
    
    const horizontalSpacing = findHorizontalSpacingSnap(draggedNode, rowCandidates)
    const verticalSpacing = findVerticalSpacingSnap(draggedNode, colCandidates)
    
    const bestSpacing = chooseBestSnapCandidate(horizontalSpacing, verticalSpacing)
    
    if (bestSpacing) {
      setActiveSpacingSnap({
        x: bestSpacing.x,
        y: bestSpacing.y
      })
      setActiveSpacingSegments({
        segments: bestSpacing.segments || []
      })
    } else {
      setActiveSpacingSnap({})
      setActiveSpacingSegments({ segments: [] })
    }
  }, [getViewport, getRowCandidates, getColumnCandidates, findHorizontalSpacingSnap, findVerticalSpacingSnap, chooseBestSnapCandidate])

  // Custom node change handler with alignment detection
  const handleNodesChange = useCallback((changes: any[]) => {
    const dragChange = changes.find(change => change.type === 'position' && change.dragging)
    if (dragChange) {
      const draggedNode = nodes.find(node => node.id === dragChange.id)
      if (draggedNode) {
        const updatedNode = { ...draggedNode, position: dragChange.position }
        detectAlignmentsAndSpacing(updatedNode, nodes)
      }
    } else {
      setAlignmentGuides({})
      setActiveSpacingSnap({})
      setActiveSpacingSegments({ segments: [] })
    }
    return onNodesChange(changes)
  }, [nodes, onNodesChange, detectAlignmentsAndSpacing])

  const onConnect = useCallback(
    (params: Connection) => {
      // If we're in the middle of a reconnection, mark it as successful
      if (reconnectingEdge.current) {
        edgeReconnectSuccessful.current = true
        reconnectingEdge.current = null
      }
      const edgeWithSettings = { ...params, ...getDefaultEdgeOptions(currentLineSettings) }
      setEdges((eds) => addEdge(edgeWithSettings, eds))
      setIsConnecting(false) // Reset connection state
    },
    [setEdges, currentLineSettings, setCurrentLineSettings],
  )

  // Handle connection start (when user starts dragging from handle)
  const onConnectStart = useCallback(() => {
    setIsConnecting(true)
  }, [])

  // Handle connection end (when user stops dragging)
  const onConnectEnd = useCallback(() => {
    setIsConnecting(false)
  }, [])

  // Validate connections (optional: prevent loops, multiple connections, etc.)
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // Extract source and target regardless of type
      const sourceId = connection.source
      const targetId = connection.target
      
      // Prevent connecting a node to itself
      if (sourceId === targetId) {
        return false
      }
      
      // Allow all other connections (temporarily remove duplicate check)
      return true
    },
    [edges],
  )

  // Handle edge reconnection start
  const onReconnectStart = useCallback((_event: any, edge: Edge) => {
    edgeReconnectSuccessful.current = false
    reconnectingEdge.current = edge
  }, [])

  // Handle edge reconnection
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true
      reconnectingEdge.current = null
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
    },
    [setEdges],
  )

  // Handle edge reconnection end (for drag-to-disconnect)
  const onReconnectEnd = useCallback(
    (_event: any, edge: Edge) => {
      // If reconnection wasn't successful, remove the edge
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id))
      }
      
      // Reset state
      edgeReconnectSuccessful.current = true
      reconnectingEdge.current = null
    },
    [setEdges],
  )

  // Handle node drag start
  const onNodeDragStart = useCallback(() => {
    // Drag start handler - currently no action needed
  }, [])

  // Handle node drag stop - apply snapping
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      // Check for alignment snapping first (higher priority)
      let snapX = node.position.x
      let snapY = node.position.y
      let hasSnapped = false

      if (alignmentGuides.vertical?.snapTo !== undefined) {
        snapX = alignmentGuides.vertical.snapTo
        hasSnapped = true
      }

      if (alignmentGuides.horizontal?.snapTo !== undefined) {
        snapY = alignmentGuides.horizontal.snapTo
        hasSnapped = true
      }

      // If no alignment snap, check for spacing snapping
      if (!hasSnapped && (activeSpacingSnap.x !== undefined || activeSpacingSnap.y !== undefined)) {
        if (activeSpacingSnap.x !== undefined) {
          snapX = activeSpacingSnap.x
          hasSnapped = true
        }
        if (activeSpacingSnap.y !== undefined) {
          snapY = activeSpacingSnap.y
          hasSnapped = true
        }
      }

      // Apply snapping if any occurred
      if (hasSnapped) {
        setNodes(nds => nds.map(n => {
          if (n.id === node.id) {
            return {
              ...n,
              position: { x: snapX, y: snapY }
            }
          }
          return n
        }))
      }
      
      // Clear guides
      setAlignmentGuides({})
      setActiveSpacingSnap({})
      setActiveSpacingSegments({ segments: [] })
    },
    [alignmentGuides, activeSpacingSnap, setNodes]
  )
  
  // Handle drag start from node library
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData))
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  // Handle drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle double-click node adding
  const onNodeDoubleClick = useCallback((nodeType: string, nodeData: any) => {
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
    if (!reactFlowBounds) return

    // Find the rightmost existing node
    let position = { x: 100, y: 100 } // Default position
    
    if (nodes.length > 0) {
      const rightmostNode = nodes.reduce((rightmost, node) => {
        const nodeRight = node.position.x + (node.data?.width || 120)
        const rightmostRight = rightmost.position.x + (rightmost.data?.width || 120)
        return nodeRight > rightmostRight ? node : rightmost
      })
      
      // Position new node 150px to the right of the rightmost node
      position = {
        x: rightmostNode.position.x + (rightmostNode.data?.width || 120) + 150,
        y: rightmostNode.position.y
      }
    }
    
    const newNode = {
      id: nodeId.toString(),
      type: nodeType,
      position,
      data: { 
        ...nodeData,
        id: nodeId.toString() 
      },
    }
    
    setNodes((nds) => nds.concat(newNode))
    setNodeId((id) => id + 1)
  }, [nodes, nodeId, setNodes])

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      const nodeDataString = event.dataTransfer.getData('application/nodedata')

      console.log('Dropping node:', { type, nodeDataString }) // Debug log

      // Check if the dropped element is a valid node type
      if (!type || !nodeDataString) {
        console.log('Missing type or data:', { type, nodeDataString })
        return
      }

      let nodeData: BlockData
      try {
        nodeData = JSON.parse(nodeDataString)
        console.log('Parsed node data:', nodeData) // Debug log
      } catch (error) {
        console.log('Failed to parse node data:', error)
        return
      }

      // Convert screen coordinates to flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node<BlockData> = {
        id: `${nodeId}`,
        type: type, // Use the actual type from drag data
        position,
        data: {
          ...nodeData,
          label: type === 'textNode' ? nodeData.label : `${nodeData.label} ${nodeId}`, // Don't add number for text nodes
        },
      }

      console.log('Creating new node:', newNode) // Debug log

      setNodes((nds) => nds.concat(newNode))
      setNodeId((id) => id + 1)
    },
    [screenToFlowPosition, nodeId, setNodes],
  )

  // Handle viewport changes to update zoom percentage
  const onMove: OnMove = useCallback((_event, viewport) => {
    setZoom(viewport.zoom)
  }, [])

  // Close menu on canvas click
  const handleCanvasClick = useCallback(() => {
    if (connectorToolbarState.isOpen) {
      setConnectorToolbarState({ isOpen: false, x: 0, y: 0, edgeId: null })
    }
  }, [connectorToolbarState.isOpen])

  // Handle edge click events for popup
  useEffect(() => {
    const handleEdgeClick = (event: any) => {
      console.log('🎯 Edge click event received:', event.detail)
      const { edgeId, x, y } = event.detail
      setConnectorToolbarState({
        isOpen: true,
        x,
        y,
        edgeId
      })
    }
    
    window.addEventListener('edge-click', handleEdgeClick)
    return () => window.removeEventListener('edge-click', handleEdgeClick)
  }, [])

  // Handle edge updates from ConnectorToolbar
  const handleEdgeUpdate = useCallback((edgeId: string, updates: { lineType?: string; lineColor?: string }) => {
    setEdges(edges => edges.map(edge => {
      if (edge.id === edgeId) {
        const newData = { ...edge.data, ...updates }
        const newStyle = { ...edge.style }
        
        if (updates.lineType === 'dashed') {
          newStyle.strokeDasharray = '5 5'
        } else if (updates.lineType === 'solid') {
          newStyle.strokeDasharray = 'none'
        }
        
        if (updates.lineColor) {
          newStyle.stroke = updates.lineColor
        }
        
        return {
          ...edge,
          data: newData,
          style: newStyle
        }
      }
      return edge
    }))
    
    // Update current line settings to remember user's choice
    setCurrentLineSettings(prev => ({
      type: (updates.lineType as 'solid' | 'dashed') || prev.type,
      color: updates.lineColor || prev.color
    }))
  }, [setEdges])



  return (
    <Container>
      <NodeLibrary onDragStart={onDragStart} onNodeDoubleClick={onNodeDoubleClick} />
      <FlowContainerWithGuides>
        <FlowContainer ref={reactFlowWrapper} $isConnecting={isConnecting}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onMove={onMove}
            onNodeDragStart={onNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={handleCanvasClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            isValidConnection={isValidConnection}
            connectionMode={ConnectionMode.Loose}
            connectOnClick={false}
            connectionRadius={25}
            defaultEdgeOptions={getDefaultEdgeOptions(currentLineSettings)}
            defaultViewport={defaultViewport}
            preventScrolling={false}
            fitView={false}
            elevateEdgesOnSelect={false}
            disableKeyboardA11y={true}
            panOnDrag={true}
            zoomOnDoubleClick={false}
          >
            <Controls />
            {/* <MiniMap /> */}
            <Background 
              variant={BackgroundVariant.Lines}
              gap={0} 
              size={0} 
              color="transparent"
            />
          </ReactFlow>
        </FlowContainer>
        
        {/* Alignment guides */}
        {alignmentGuides.horizontal && (
          <AlignmentGuide 
            key={`horizontal-${alignmentGuides.horizontal.position}`}
            $isHorizontal={true}
            $position={alignmentGuides.horizontal.position}
          />
        )}
        {alignmentGuides.vertical && (
          <AlignmentGuide 
            key={`vertical-${alignmentGuides.vertical.position}`}
            $isHorizontal={false}
            $position={alignmentGuides.vertical.position}
          />
        )}
        
        {/* Spacing distribution guides - RED for debugging */}
        {activeSpacingSegments.segments.map((segment, index) => (
          <SpacingSegment
            key={`spacing-segment-${index}`}
            $x1={segment.x1}
            $y1={segment.y1}
            $x2={segment.x2}
            $y2={segment.y2}
            $orientation={segment.orientation}
          />
        ))}
        
        <ZoomIndicator>
          {Math.round(zoom * 100)}%
        </ZoomIndicator>
        
        {/* Connector Toolbar - appears when clicking connection lines */}
        <ConnectorToolbar
          isOpen={connectorToolbarState.isOpen}
          x={connectorToolbarState.x}
          y={connectorToolbarState.y}
          edgeId={connectorToolbarState.edgeId}
          edges={edges}
          onUpdateEdge={handleEdgeUpdate}
        />
      </FlowContainerWithGuides>
    </Container>
  )
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowComponent />
    </ReactFlowProvider>
  )
}

export default App
