import { useCallback, useState } from 'react'
import {
  ReactFlowProvider,
  addEdge,
  type Connection,
} from '@xyflow/react'
import styled from 'styled-components'
import '@xyflow/react/dist/style.css'
import NodeLibrary from './components/NodeLibrary'
import { Block, TextNode } from './components/BlockNodes'
import { FlowCanvas } from './components/Canvas'
import { SettingsToolbar } from './components/Toolbar'
import { EdgeMenu } from './components/EdgeMenu'
import { InteractiveEdge } from './components/Edges'
import { useFlowState } from './hooks/useFlowState'
import { useEdgeMenu } from './hooks/useEdgeMenu'

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

// Edge types - updated to use our new InteractiveEdge
const edgeTypes = {
  interactive: InteractiveEdge,
}

// Default line style
const DEFAULT_LINE_STYLE = {
  type: 'solid' as 'solid' | 'dashed',
  color: '#666666'
}

function FlowApp() {
  const flowState = useFlowState()
  const { 
    edgeMenuState, 
    openEdgeMenu, 
    closeEdgeMenu, 
    updateEdgeColor, 
    updateEdgeStyle 
  } = useEdgeMenu()

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

  // Handle edge clicks
  const handleEdgeClick = useCallback((event: React.MouseEvent, edgeId: string, color: string, style: 'solid' | 'dashed') => {
    openEdgeMenu(event.clientX, event.clientY, edgeId, color, style)
  }, [openEdgeMenu])

  // Handle edge color/style changes
  const handleEdgeColorChange = useCallback((color: string) => {
    updateEdgeColor(color)
    if (edgeMenuState.edgeId) {
      flowState.setEdges((edges) =>
        edges.map((edge) =>
          edge.id === edgeMenuState.edgeId
            ? { ...edge, data: { ...edge.data, lineColor: color } }
            : edge
        )
      )
    }
  }, [updateEdgeColor, edgeMenuState.edgeId, flowState.setEdges])

  const handleEdgeStyleChange = useCallback((style: 'solid' | 'dashed') => {
    updateEdgeStyle(style)
    if (edgeMenuState.edgeId) {
      flowState.setEdges((edges) =>
        edges.map((edge) =>
          edge.id === edgeMenuState.edgeId
            ? { ...edge, data: { ...edge.data, lineType: style } }
            : edge
        )
      )
    }
  }, [updateEdgeStyle, edgeMenuState.edgeId, flowState.setEdges])

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

      flowState.addNewNode(type, { x: event.clientX - 200, y: event.clientY - 200 })
    },
    [flowState.addNewNode]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Close edge menu when clicking outside
  const handleContainerClick = useCallback(() => {
    if (edgeMenuState.isOpen) {
      closeEdgeMenu()
    }
  }, [edgeMenuState.isOpen, closeEdgeMenu])

  // Create enhanced edge types with click handler
  const enhancedEdgeTypes = {
    ...edgeTypes,
    interactive: (props: any) => (
      <InteractiveEdge {...props} onEdgeClick={handleEdgeClick} />
    )
  }

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver} onClick={handleContainerClick}>
      <ReactFlowProvider>
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
          edgeTypes={enhancedEdgeTypes}
          defaultViewport={defaultViewport}
        />

        {/* Edge Menu */}
        <EdgeMenu
          visible={edgeMenuState.isOpen}
          x={edgeMenuState.x}
          y={edgeMenuState.y}
          edgeId={edgeMenuState.edgeId}
          currentColor={edgeMenuState.currentColor}
          currentStyle={edgeMenuState.currentStyle}
          onColorChange={handleEdgeColorChange}
          onStyleChange={handleEdgeStyleChange}
          onClose={closeEdgeMenu}
        />

        {/* Node Library */}
        <NodeLibrary onDragStart={(event, nodeType) => {
          event.dataTransfer.setData('application/reactflow', nodeType)
          event.dataTransfer.effectAllowed = 'move'
        }} />
      </ReactFlowProvider>
    </Container>
  )
}

export default FlowApp