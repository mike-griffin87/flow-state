import { useState } from 'react'
import styled from 'styled-components'

const ShapeToolbar = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  z-index: 10;
`

const ShapeButton = styled.button<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: ${props => props.selected ? '#f0f0f0' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: #f5f5f5;
  }
  
  svg {
    width: 20px;
    height: 20px;
    stroke: #666;
    fill: none;
    stroke-width: 1.5;
  }
`

export interface NodeLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: any) => void;
  onNodeDoubleClick: (nodeType: string, nodeData: any) => void;
}

// Simple shape icons like Figma
const RectangleIcon = () => (
  <svg viewBox="0 0 20 20">
    <rect x="2" y="5" width="16" height="10" rx="1"/>
  </svg>
)

const CircleIcon = () => (
  <svg viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8"/>
  </svg>
)

const DiamondIcon = () => (
  <svg viewBox="0 0 20 20">
    <polygon points="10,2 18,10 10,18 2,10"/>
  </svg>
)

const TriangleIcon = () => (
  <svg viewBox="0 0 20 20">
    <polygon points="10,2 18,16 2,16"/>
  </svg>
)

const EllipseIcon = () => (
  <svg viewBox="0 0 20 20">
    <ellipse cx="10" cy="10" rx="8" ry="5"/>
  </svg>
)

const CylinderIcon = () => (
  <svg viewBox="0 0 20 20">
    <ellipse cx="10" cy="3" rx="7" ry="2"/>
    <path d="M3,3 L3,15 Q3,17 10,17 Q17,17 17,15 L17,3"/>
  </svg>
)

const shapes = [
  { icon: RectangleIcon, type: 'process', name: 'Rectangle' },
  { icon: CircleIcon, type: 'connector', name: 'Circle' },
  { icon: DiamondIcon, type: 'decision', name: 'Diamond' },
  { icon: TriangleIcon, type: 'start-end', name: 'Triangle' },
  { icon: EllipseIcon, type: 'ellipse', name: 'Ellipse' },
  { icon: CylinderIcon, type: 'input-output', name: 'Cylinder' }
]

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onDragStart, onNodeDoubleClick }) => {
  const [selectedShape, setSelectedShape] = useState<string | null>(null)

  const handleShapeClick = (shape: typeof shapes[0]) => {
    setSelectedShape(shape.type)
    onNodeDoubleClick('block', {
      label: shape.name,
      nodeType: shape.type,
      shape: shape.type
    })
  }

  const handleShapeDragStart = (event: React.DragEvent, shape: typeof shapes[0]) => {
    onDragStart(event, 'block', {
      label: shape.name,
      nodeType: shape.type,
      shape: shape.type
    })
  }

  return (
    <ShapeToolbar>
      {shapes.map((shape) => (
        <ShapeButton
          key={shape.type}
          selected={selectedShape === shape.type}
          draggable
          onDragStart={(e) => handleShapeDragStart(e, shape)}
          onClick={() => handleShapeClick(shape)}
          title={shape.name}
        >
          <shape.icon />
        </ShapeButton>
      ))}
    </ShapeToolbar>
  )
}

export default NodeLibrary