import { useState, useCallback, useRef } from 'react'
import { useNodesState, useEdgesState, useReactFlow, type Node, type Edge, type Connection } from '@xyflow/react'
import { DEFAULT_ZOOM, ALIGNMENT_THRESHOLD, SPACING_THRESHOLD } from '../constants/flow'
import type { AlignmentGuide, SpacingSnap, SpacingSegment, EdgeMenuState } from '../types/flow'

// Initial data - we'll extract this later from App.tsx
const initialNodes: Node[] = [
  { 
    id: '1', 
    type: 'block', 
    position: { x: 400, y: 100 }, 
    data: { label: 'Start' } 
  },
  { 
    id: '2', 
    type: 'block', 
    position: { x: 400, y: 250 }, 
    data: { label: 'Process' } 
  },
  { 
    id: '3', 
    type: 'block', 
    position: { x: 400, y: 400 }, 
    data: { label: 'End' } 
  }
]

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    type: 'interactive' 
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    type: 'interactive' 
  }
]

export function useFlowState() {
  // Core flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { screenToFlowPosition } = useReactFlow()
  
  // App state
  const [nodeId, setNodeId] = useState(4) // Start from 4 since we have 3 initial nodes
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Alignment & Spacing state
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

  // Edge menu state  
  const [edgeMenuState, setEdgeMenuState] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    edgeId: string | null;
  }>({ isOpen: false, x: 0, y: 0, edgeId: null })

  // Connection handling
  const edgeReconnectSuccessful = useRef(true)
  const reconnectingEdge = useRef<Edge | null>(null)

  // Connection callbacks
  const onConnect = useCallback((connection: Connection) => {
    // Connection logic will be moved here
  }, [setEdges])

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false
  }, [])

  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    edgeReconnectSuccessful.current = true
    // Reconnection logic will be moved here
  }, [setEdges])

  const onReconnectEnd = useCallback((_: any, edge: Edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id))
    }
    edgeReconnectSuccessful.current = true
  }, [setEdges])

  // Node management
  const addNewNode = useCallback((type: string, position?: { x: number; y: number }) => {
    const newPosition = position || screenToFlowPosition({ x: 250, y: 250 })
    
    const newNode: Node = {
      id: `${nodeId}`,
      type: 'block',
      position: newPosition,
      data: { label: type === 'text' ? 'New Text' : 'New Block' }
    }

    setNodes((nds) => nds.concat(newNode))
    setNodeId(nodeId + 1)
  }, [nodeId, setNodeId, setNodes, screenToFlowPosition])

  return {
    // State
    nodes,
    edges,
    nodeId,
    zoom,
    isConnecting,
    alignmentGuides,
    activeSpacingSnap,
    activeSpacingSegments,
    edgeMenuState,
    
    // Setters
    setNodes,
    setEdges,
    setNodeId,
    setZoom,
    setIsConnecting,
    setAlignmentGuides,
    setActiveSpacingSnap,
    setActiveSpacingSegments,
    setEdgeMenuState,
    
    // Callbacks
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnectStart,
    onReconnect,
    onReconnectEnd,
    addNewNode,
    
    // Refs
    edgeReconnectSuccessful,
    reconnectingEdge
  }
}