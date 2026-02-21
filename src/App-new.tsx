import { useCallback } from 'react'
import {
  ReactFlowProvider,
  useReactFlow,
  addEdge,
  type Connection,
} from '@xyflow/react'
import styled from 'styled-components'
import '@xyflow/react/dist/style.css'
import NodeLibrary from './components/NodeLibrary'
import { Block, TextNode } from './components/BlockNodes'
import { FlowCanvas } from './components/Canvas'
import { SettingsToolbar, ConnectorToolbar } from './components/toolbars'
import { InteractiveConnector } from './components/connectors'
import { useFlowState } from './hooks/useFlowState'
import { useConnectorToolbar } from './hooks/useConnectorToolbar'

// Apple-inspired styled components
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #ffffff;
`

// Node types
const nodeTypes = {
  block: Block,
  textNode: TextNode,
}

// Connector types - updated to use InteractiveConnector
const connectorTypes = {
  interactive: InteractiveConnector,
}

function FlowAppInner() {
  const flowState = useFlowState()
  const { screenToFlowPosition } = useReactFlow()
  const { 
    toolbarState, 
    openToolbar, 
    closeToolbar, 
    updateColor, 
    updateStyle 
  } = useConnectorToolbar()

  // Default viewport settings
  const defaultViewport = { x: 0, y: 0, zoom: 1.25 }

  // Connection handling
  const onConnect = useCallback((connection: Connection) => {
    const edgeOptions = {
      type: 'interactive',
      data: {
        lineType: 'solid',
        lineColor: '#666666'
      },
    }
    flowState.setEdges((eds) => addEdge({ ...connection, ...edgeOptions }, eds))
  }, [flowState.setEdges])

  // Handle connector clicks
  const handleConnectorClick = useCallback((event: React.MouseEvent, connectorId: string, color: string, style: 'solid' | 'dashed') => {
    openToolbar(event.clientX, event.clientY, connectorId, color, style)
  }, [openToolbar])

  // Handle connector color/style changes
  const handleColorChange = useCallback((color: string) => {
    updateColor(color)
    if (toolbarState.connectorId) {
      flowState.setEdges((edges) =>
        edges.map((edge) =>
          edge.id === toolbarState.connectorId
            ? { ...edge, data: { ...edge.data, lineColor: color } }
            : edge
        )
      )
    }
  }, [updateColor, toolbarState.connectorId, flowState.setEdges])

  const handleStyleChange = useCallback((style: 'solid' | 'dashed') => {
    updateStyle(style)
    if (toolbarState.connectorId) {
      flowState.setEdges((edges) =>
        edges.map((edge) =>
          edge.id === toolbarState.connectorId
            ? { ...edge, data: { ...edge.data, lineType: style } }
            : edge
        )
      )
    }
  }, [updateStyle, toolbarState.connectorId, flowState.setEdges])

  // Handle settings clicks
  const handleSettingsClick = useCallback((setting: string) => {
    console.log('Settings clicked:', setting)
    // TODO: Implement settings functionality
  }, [])

  // Handle node library drops  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = screenToFlowPosition({ x: event.clientX - 200, y: event.clientY - 200 })
      flowState.addNewNode(type, position)
    },
    [flowState.addNewNode, screenToFlowPosition]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Close connector toolbar when clicking outside
  const handleContainerClick = useCallback(() => {
    if (toolbarState.isOpen) {
      closeToolbar()
    }
  }, [toolbarState.isOpen, closeToolbar])

  // Create enhanced connector types with click handler
  const enhancedConnectorTypes = {
    ...connectorTypes,
    interactive: (props: any) => (
      <InteractiveConnector {...props} onConnectorClick={handleConnectorClick} />
    )
  }

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver} onClick={handleContainerClick}>
      {/* Settings Toolbar */}
      <SettingsToolbar onSettingsClick={handleSettingsClick} />

      {/* Main Flow Canvas */}
      <FlowCanvas
        nodes={flowState.nodes}
        edges={flowState.edges}
        isConnecting={flowState.isConnecting}
        alignmentGuides={flowState.alignmentGuides}
        activeSpacingSegments={flowState.activeSpacingSegments}
        onNodesChange={flowState.onNodesChange}
        onEdgesChange={flowState.onEdgesChange}
        onConnect={onConnect}
        onReconnectStart={flowState.onReconnectStart}
        onReconnect={flowState.onReconnect}
        onReconnectEnd={flowState.onReconnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={enhancedConnectorTypes}
        defaultViewport={defaultViewport}
      />

      {/* Connector Toolbar */}
      <ConnectorToolbar
        visible={toolbarState.isOpen}
        x={toolbarState.x}
        y={toolbarState.y}
        connectorId={toolbarState.connectorId}
        currentColor={toolbarState.currentColor}
        currentStyle={toolbarState.currentStyle}
        onColorChange={handleColorChange}
        onStyleChange={handleStyleChange}
        onClose={closeToolbar}
      />

      {/* Node Library */}
      <NodeLibrary onDragStart={(event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType)
        event.dataTransfer.effectAllowed = 'move'
      }} />
    </Container>
  )
}

function FlowApp() {
  return (
    <ReactFlowProvider>
      <FlowAppInner />
    </ReactFlowProvider>
  )
}

export default FlowApp