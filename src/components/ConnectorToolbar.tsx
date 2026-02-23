import { useState } from 'react'
import styled from 'styled-components'
import { IconMinus, IconLineDashed, IconCircleFilled } from '@tabler/icons-react'
import { type Edge } from '@xyflow/react'

interface ConnectorToolbarProps {
  isOpen: boolean
  x: number
  y: number
  edgeId: string | null
  edges: Edge[]
  onUpdateEdge: (edgeId: string, updates: { lineType?: string; lineColor?: string }) => void
}

// Custom toolbar container positioned above edges
const ToolbarContainer = styled.div<{ $isOpen: boolean; $x: number; $y: number }>`
  position: fixed;
  top: ${props => props.$y - 60}px;
  left: ${props => props.$x}px;
  transform: translateX(-50%);
  background: rgba(45, 45, 45, 0.98);
  border: 1px solid rgba(60, 60, 60, 0.8);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(40px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  gap: 3px;
  align-items: center;
  z-index: 1001;
  opacity: ${props => props.$isOpen ? 1 : 0};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transition: opacity 0.2s ease;
  white-space: nowrap;
`

// Edge styling buttons
const ToolbarButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: ${props => props.$isActive ? '#007aff' : 'rgba(70, 70, 70, 0.8)'};
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    transform: scale(1.02);
    background: ${props => props.$isActive ? '#0056b3' : '#007aff'};
  }
  
  &:active {
    transform: scale(0.98);
  }
`

const ColorButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: rgba(70, 70, 70, 0.8);
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    transform: scale(1.02);
    background: rgba(90, 90, 90, 0.8);
  }
  
  &:active {
    transform: scale(0.98);
  }
`

const ColorIndicator = styled(IconCircleFilled)<{ $color: string }>`
  width: 20px;
  height: 20px;
  color: ${props => props.$color};
`

const ColorPickerDropdown = styled.div`
  position: absolute;
  top: 54px;
  right: 6px;
  background: rgba(45, 45, 45, 0.98);
  border: 1px solid rgba(60, 60, 60, 0.8);
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(40px);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  z-index: 1001;
`

const ColorOption = styled.button<{ $color: string; $isActive?: boolean }>`
  width: 24px;
  height: 24px;
  border: 2px solid ${props => props.$isActive ? 'white' : 'transparent'};
  border-radius: 50%;
  background: ${props => props.$color};
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    transform: scale(0.9);
  }
`

// Predefined line colors
const LINE_COLORS = [
  { name: 'Gray', value: '#666666' },
  { name: 'Blue', value: '#007aff' },
  { name: 'Red', value: '#ff3b30' },
  { name: 'Green', value: '#34c759' },
  { name: 'Orange', value: '#ff9500' },
  { name: 'Purple', value: '#af52de' },
  { name: 'Pink', value: '#ff2d92' },
  { name: 'Yellow', value: '#ffcc00' },
  { name: 'Teal', value: '#5ac8fa' },
  { name: 'Indigo', value: '#5856d6' },
  { name: 'Brown', value: '#a2845e' },
  { name: 'Black', value: '#1d1d1f' },
]

export default function ConnectorToolbar({
  isOpen,
  x,
  y,
  edgeId,
  edges,
  onUpdateEdge
}: ConnectorToolbarProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  
  const currentEdge = edges.find(e => e.id === edgeId)
  const isDashed = currentEdge?.data?.lineType === 'dashed'
  const isSolid = currentEdge?.data?.lineType !== 'dashed'
  const currentColor: string = (currentEdge?.data?.lineColor as string) || '#666666'

  const handleDashedLine = () => {
    if (edgeId) {
      onUpdateEdge(edgeId, { lineType: 'dashed' })
    }
  }

  const handleSolidLine = () => {
    if (edgeId) {
      onUpdateEdge(edgeId, { lineType: 'solid' })
    }
  }

  const handleColorChange = (color: string) => {
    if (edgeId) {
      onUpdateEdge(edgeId, { lineColor: color })
      setColorPickerOpen(false)
    }
  }

  return (
    <ToolbarContainer $isOpen={isOpen} $x={x} $y={y}>
      {/* Dashed Line Button */}
      <ToolbarButton
        $isActive={isDashed}
        onClick={handleDashedLine}
        title="Dashed Line"
      >
        <IconLineDashed size={20} color="white" />
      </ToolbarButton>
      
      {/* Solid Line Button */}
      <ToolbarButton
        $isActive={isSolid}
        onClick={handleSolidLine}
        title="Solid Line"
      >
        <IconMinus size={20} color="white" />
      </ToolbarButton>
      
      {/* Color Button */}
      <ColorButton
        onClick={() => setColorPickerOpen(!colorPickerOpen)}
        title="Change Color"
      >
        <ColorIndicator $color={currentColor} />
      </ColorButton>
      
      {/* Color Picker Dropdown */}
      {colorPickerOpen && (
        <ColorPickerDropdown>
          {LINE_COLORS.map((color) => (
            <ColorOption
              key={color.value}
              $color={color.value}
              $isActive={currentColor === color.value}
              onClick={() => handleColorChange(color.value)}
              title={color.name}
            />
          ))}
        </ColorPickerDropdown>
      )}
    </ToolbarContainer>
  )
}