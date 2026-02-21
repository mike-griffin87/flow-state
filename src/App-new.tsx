import { useCallback, useRef, useState, useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  getSmoothStepPath,
  type Connection,
  type Node,
  type Edge,
  type OnMove,
} from '@xyflow/react'
import styled from 'styled-components'
import '@xyflow/react/dist/style.css'
import { IconSettings } from '@tabler/icons-react'
import NodeLibrary from './components/NodeLibrary'
import { Block, TextNode, type BlockData } from './components/BlockNodes'
import { FlowCanvas } from './components/Canvas'
import { useFlowState } from './hooks/useFlowState'
import { LINE_COLORS } from './constants/flow'

// Apple-inspired styled components
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #ffffff;
`

// Simplified toolbar for now - we'll extract this later
const Toolbar = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #1d1d1f;
  }
`

// Settings dropdown (simplified for now)
const SettingsDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 44px;
  left: 0;
  background: #ffffff;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  padding: 8px 0;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1001;
`

const SettingsItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: #ffffff;
  text-align: left;
  font-size: 14px;
  color: #1d1d1f;
  cursor: pointer;
  display: block;
  
  &:hover {
    background: #f5f5f7;
  }
  
  &:active {
    background: #e5e5e7;
  }
`

// Custom Edge Component (simplified from original)
const InteractiveEdge = ({ id, sourceX, sourceY, targetX, targetY, data }: any) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: 'bottom',
    targetPosition: 'top',
  })

  const handleEdgeClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    // Edge click logic will be handled here
  }, [id])

  return (
    <>
      <path
        id={id}
        d={edgePath}
        stroke={data?.lineColor || '#666666'}
        strokeWidth={isHovered ? 3 : 2}
        fill="none"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleEdgeClick}
      />
      {isHovered && (
        <path
          d={edgePath}
          stroke="rgba(0, 122, 255, 0.3)"
          strokeWidth={8}
          fill="none"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </>
  )
}

// Node types
const nodeTypes = {
  block: Block,
  textNode: TextNode,
}

// Edge types
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
  const [toolbarDropdownOpen, setToolbarDropdownOpen] = useState(false)
  const [currentLineSettings, setCurrentLineSettings] = useState(DEFAULT_LINE_STYLE)

  // Default viewport settings
  const defaultViewport = { x: 0, y: 0, zoom: 1.25 }

  // Connection handling
  const onConnect = useCallback((connection: Connection) => {
    const edgeOptions = {
      type: 'interactive',
      data: {
        lineType: currentLineSettings.type,
        lineColor: currentLineSettings.color
      },
    }
    flowState.setEdges((eds) => addEdge({ ...connection, ...edgeOptions }, eds))
  }, [flowState.setEdges, currentLineSettings])

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

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlowProvider>
        {/* Simplified Toolbar */}
        <Toolbar>
          <div style={{ position: 'relative' }}>
            <ToolbarButton 
              onClick={() => setToolbarDropdownOpen(!toolbarDropdownOpen)}
            >
              <IconSettings />
            </ToolbarButton>
            
            <SettingsDropdown $isOpen={toolbarDropdownOpen}>
              <SettingsItem onClick={() => setToolbarDropdownOpen(false)}>
                General
              </SettingsItem>
              <SettingsItem onClick={() => setToolbarDropdownOpen(false)}>
                Appearance
              </SettingsItem>
              <SettingsItem onClick={() => setToolbarDropdownOpen(false)}>
                Export
              </SettingsItem>
              <SettingsItem onClick={() => setToolbarDropdownOpen(false)}>
                Import
              </SettingsItem>
              <SettingsItem onClick={() => setToolbarDropdownOpen(false)}>
                Help
              </SettingsItem>
            </SettingsDropdown>
          </div>
        </Toolbar>

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
          edgeTypes={edgeTypes}
          defaultViewport={defaultViewport}
        />

        {/* Node Library */}
        <NodeLibrary />
      </ReactFlowProvider>
    </Container>
  )
}

export default FlowApp