import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  type Node,
  type Edge,
  type OnMove,
} from '@xyflow/react'
import styled from 'styled-components'

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
`

const AlignmentGuide = styled.div<{ 
  $isHorizontal: boolean; 
  $position: number 
}>`
  position: absolute;
  ${props => props.$isHorizontal 
    ? `
      left: 0;
      right: 0;
      top: ${props.$position}px;
      height: 2px;
      border-top: 2px dashed rgba(255, 0, 0, 0.8);
    `
    : `
      top: 0;
      bottom: 0;
      left: ${props.$position}px;
      width: 2px;
      border-left: 2px dashed rgba(255, 0, 0, 0.8);
    `
  }
  z-index: 1001;
  pointer-events: none;
`

const SpacingSegmentStyled = styled.div<{ 
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
      background: rgba(255, 100, 0, 0.9);
      border-top: 1px solid rgba(255, 100, 0, 1);
      border-bottom: 1px solid rgba(255, 100, 0, 1);
    `
    : `
      left: ${props.$x1 - 1}px;
      top: ${Math.min(props.$y1, props.$y2)}px;
      width: 2px;
      height: ${Math.abs(props.$y2 - props.$y1)}px;
      background: rgba(255, 100, 0, 0.9);
      border-left: 1px solid rgba(255, 100, 0, 1);
      border-right: 1px solid rgba(255, 100, 0, 1);
    `
  }
  z-index: 1002;
  pointer-events: none;
`

interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  isConnecting: boolean
  alignmentGuides: {
    horizontal?: { position: number; snapTo: number };
    vertical?: { position: number; snapTo: number };
  }
  activeSpacingSegments: {
    segments: Array<{
      orientation: 'horizontal' | 'vertical';
      x1: number; y1: number; x2: number; y2: number;
      label?: string;
    }>;
  }
  onNodesChange: any
  onEdgesChange: any
  onConnect: any
  onReconnectStart: any
  onReconnect: any
  onReconnectEnd: any
  onMove?: OnMove
  nodeTypes: any
  edgeTypes: any
  defaultViewport: { x: number; y: number; zoom: number }
}

export default function FlowCanvas({
  nodes,
  edges,
  isConnecting,
  alignmentGuides,
  activeSpacingSegments,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onReconnectStart,
  onReconnect,
  onReconnectEnd,
  onMove,
  nodeTypes,
  edgeTypes,
  defaultViewport
}: FlowCanvasProps) {

  return (
    <FlowContainer $isConnecting={isConnecting}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnectStart={onReconnectStart}
        onReconnect={onReconnect}
        onReconnectEnd={onReconnectEnd}
        onMove={onMove}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={defaultViewport}
        fitView={false}
        snapToGrid={false}
        snapGrid={[15, 15]}
        attributionPosition="top-right"
        maxZoom={4}
        minZoom={0.2}
        onConnectStart={() => {
          // Handle connection start if needed
        }}
        onConnectEnd={() => {
          // Handle connection end if needed
        }}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} style={{ opacity: 0 }} />
        
        {/* Alignment Guides */}
        {alignmentGuides.horizontal && (
          <AlignmentGuide 
            $isHorizontal={true}
            $position={alignmentGuides.horizontal.position} 
          />
        )}
        {alignmentGuides.vertical && (
          <AlignmentGuide 
            $isHorizontal={false}
            $position={alignmentGuides.vertical.position} 
          />
        )}
        
        {/* Spacing Segments */}
        {activeSpacingSegments.segments.map((segment, index) => (
          <SpacingSegmentStyled
            key={index}
            $x1={segment.x1}
            $y1={segment.y1}
            $x2={segment.x2}
            $y2={segment.y2}
            $orientation={segment.orientation}
          />
        ))}
      </ReactFlow>
    </FlowContainer>
  )
}