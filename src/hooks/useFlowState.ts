import { useState, useCallback, useRef } from 'react'
import { useNodesState, useEdgesState, useReactFlow, addEdge, reconnectEdge, type Node, type Edge, type Connection } from '@xyflow/react'
import { DEFAULT_ZOOM } from '../constants/flow'

// Initial data - start with blank canvas for now
const initialNodes: Node[] = []

const initialEdges: Edge[] = []

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
    setEdges((eds) => addEdge(connection, eds))
  }, [setEdges])

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false
  }, [])

  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    edgeReconnectSuccessful.current = true
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
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