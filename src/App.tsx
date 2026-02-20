import { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
  reconnectEdge,
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

// Apple-inspired styled components
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #f5f5f7;
`

const FlowContainer = styled.div`
  width: 100%;
  height: 100%;
  
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

const AlignmentGuide = styled.div<{ $isHorizontal: boolean; $position: number }>`
  position: absolute;
  ${props => props.$isHorizontal 
    ? `
      left: 0;
      right: 0;
      top: ${props.$position}px;
      height: 1px;
    `
    : `
      top: 0;
      bottom: 0;
      left: ${props.$position}px;
      width: 1px;
    `
  }
  background: rgba(0, 122, 255, 0.8);
  box-shadow: 0 0 3px rgba(0, 122, 255, 0.3);
  z-index: 1000;
  pointer-events: none;
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

// Initial nodes - start with blank canvas
const initialNodes: Node<BlockData>[] = []

const initialEdges: Edge[] = []

// Default edge options with arrow markers
const defaultEdgeOptions = {
  type: 'smoothstep',
  markerStart: {
    type: 'arrow' as const,  // Use markerStart instead of markerEnd to fix direction
    width: 15,  // Smaller arrow
    height: 15,
    color: '#666',
  },
  style: {
    strokeWidth: 2,
    stroke: '#666',
  }
}

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
  const { screenToFlowPosition } = useReactFlow()
  const [nodeId, setNodeId] = useState(4) // Start from 4 since we have 3 initial nodes
  const [zoom, setZoom] = useState(1.25) // Default to 125%
  const [alignmentGuides, setAlignmentGuides] = useState<{
    horizontal?: { position: number; snapTo: number };
    vertical?: { position: number; snapTo: number };
  }>({})
  const edgeReconnectSuccessful = useRef(true)
  const reconnectingEdge = useRef<Edge | null>(null)

  // Default viewport settings
  const defaultViewport = { x: 0, y: 0, zoom: 1.25 }

  // Smart alignment detection with snapping
  const detectAlignments = useCallback((draggedNode: Node, allNodes: Node[]) => {
    const SNAP_THRESHOLD = 8 // pixels
    const viewport = { x: defaultViewport.x, y: defaultViewport.y, zoom: zoom }
    
    const draggedBounds = {
      left: draggedNode.position.x,
      right: draggedNode.position.x + (draggedNode.measured?.width || 100),
      top: draggedNode.position.y,
      bottom: draggedNode.position.y + (draggedNode.measured?.height || 50),
      centerX: draggedNode.position.x + ((draggedNode.measured?.width || 100) / 2),
      centerY: draggedNode.position.y + ((draggedNode.measured?.height || 50) / 2)
    }

    type AlignmentGuide = { distance: number; guide: number; snapTo: number }
    let closestVertical: AlignmentGuide | null = null
    let closestHorizontal: AlignmentGuide | null = null

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
          const screenX = (check.target * viewport.zoom) + viewport.x
          let snapToX = check.target
          
          // Calculate snap position based on alignment type
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

      // Check horizontal alignments - find closest
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
          const screenY = (check.target * viewport.zoom) + viewport.y
          let snapToY = check.target
          
          // Calculate snap position based on alignment type
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

    // Set only the closest guides with proper TypeScript handling
    const guides: {
      horizontal?: { position: number; snapTo: number };
      vertical?: { position: number; snapTo: number };
    } = {}
    
    if (closestVertical) {
      const v = closestVertical as AlignmentGuide // Type assertion to fix TypeScript
      guides.vertical = { position: v.guide, snapTo: v.snapTo }
    }
    
    if (closestHorizontal) {
      const h = closestHorizontal as AlignmentGuide // Type assertion to fix TypeScript
      guides.horizontal = { position: h.guide, snapTo: h.snapTo }
    }
    
    setAlignmentGuides(guides)
  }, [zoom, defaultViewport])

  // Custom node change handler with alignment detection
  const handleNodesChange = useCallback((changes: any[]) => {
    const dragChange = changes.find(change => change.type === 'position' && change.dragging)
    if (dragChange) {
      const draggedNode = nodes.find(node => node.id === dragChange.id)
      if (draggedNode) {
        const updatedNode = { ...draggedNode, position: dragChange.position }
        detectAlignments(updatedNode, nodes)
      }
    } else {
      setAlignmentGuides({})
    }
    return onNodesChange(changes)
  }, [nodes, onNodesChange, detectAlignments])

  const onConnect = useCallback(
    (params: Connection) => {
      // If we're in the middle of a reconnection, mark it as successful
      if (reconnectingEdge.current) {
        edgeReconnectSuccessful.current = true
        reconnectingEdge.current = null
      }
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges],
  )

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
      // Apply snapping if guides exist
      if (alignmentGuides.vertical?.snapTo !== undefined || alignmentGuides.horizontal?.snapTo !== undefined) {
        setNodes(nds => nds.map(n => {
          if (n.id === node.id) {
            return {
              ...n,
              position: {
                x: alignmentGuides.vertical?.snapTo !== undefined ? alignmentGuides.vertical.snapTo : n.position.x,
                y: alignmentGuides.horizontal?.snapTo !== undefined ? alignmentGuides.horizontal.snapTo : n.position.y
              }
            }
          }
          return n
        }))
      }
      
      setAlignmentGuides({})
    },
    [alignmentGuides, setNodes]
  )
  // Handle drag start from node library
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, nodeData: BlockData) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData))
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  // Handle drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

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

  return (
    <Container>
      <NodeLibrary onDragStart={onDragStart} />
      <FlowContainerWithGuides>
        <FlowContainer ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onMove={onMove}
            onNodeDragStart={onNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            connectionMode={ConnectionMode.Loose}
            connectOnClick={false}
            connectionRadius={25}
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={defaultViewport}
            preventScrolling={false}
            fitView={false}
          >
            <Controls />
            <MiniMap />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={10} 
              size={1} 
              color="#d1d1d6"
            />
          </ReactFlow>
        </FlowContainer>
        
        {/* Alignment guides */}
        {alignmentGuides.horizontal && (
          <AlignmentGuide 
            key="horizontal-guide"
            $isHorizontal={true}
            $position={alignmentGuides.horizontal.position}
          />
        )}
        {alignmentGuides.vertical && (
          <AlignmentGuide 
            key="vertical-guide"
            $isHorizontal={false}
            $position={alignmentGuides.vertical.position}
          />
        )}
        
        <ZoomIndicator>
          {Math.round(zoom * 100)}%
        </ZoomIndicator>
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
