import { useCallback } from 'react'
import styled from 'styled-components'
import { IconLineDashed, IconMinus } from '@tabler/icons-react'
import { LINE_COLORS } from '../../constants/flow'

const EdgeMenuContainer = styled.div<{ $x: number; $y: number; $visible: boolean }>`
  position: fixed;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  display: ${props => props.$visible ? 'block' : 'none'};
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 2000;
  min-width: 200px;
`

const MenuSection = styled.div`
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const MenuLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-bottom: 12px;
`

const ColorOption = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: ${props => props.$isSelected ? '2px solid #007aff' : '1px solid rgba(0, 0, 0, 0.1)'};
  background: ${props => props.$color};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`

const StyleOptions = styled.div`
  display: flex;
  gap: 8px;
`

const StyleOption = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${props => props.$isSelected ? '#007aff' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  background: ${props => props.$isSelected ? '#f0f8ff' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isSelected ? '#e6f4ff' : '#f5f5f7'};
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.$isSelected ? '#007aff' : '#1d1d1f'};
  }
`

interface EdgeMenuProps {
  visible: boolean
  x: number
  y: number
  edgeId: string | null
  currentColor: string
  currentStyle: 'solid' | 'dashed'
  onColorChange: (color: string) => void
  onStyleChange: (style: 'solid' | 'dashed') => void
  onClose: () => void
}

export default function EdgeMenu({
  visible,
  x,
  y,
  edgeId,
  currentColor,
  currentStyle,
  onColorChange,
  onStyleChange,
  onClose
}: EdgeMenuProps) {
  
  const handleColorClick = useCallback((color: string) => {
    onColorChange(color)
  }, [onColorChange])

  const handleStyleClick = useCallback((style: 'solid' | 'dashed') => {
    onStyleChange(style)
  }, [onStyleChange])

  return (
    <EdgeMenuContainer 
      $x={x} 
      $y={y} 
      $visible={visible}
      onClick={(e) => e.stopPropagation()}
    >
      <MenuSection>
        <MenuLabel>Line Color</MenuLabel>
        <ColorGrid>
          {LINE_COLORS.map((color) => (
            <ColorOption
              key={color.value}
              $color={color.value}
              $isSelected={currentColor === color.value}
              onClick={() => handleColorClick(color.value)}
              title={color.name}
            />
          ))}
        </ColorGrid>
      </MenuSection>
      
      <MenuSection>
        <MenuLabel>Line Style</MenuLabel>
        <StyleOptions>
          <StyleOption
            $isSelected={currentStyle === 'solid'}
            onClick={() => handleStyleClick('solid')}
            title="Solid Line"
          >
            <IconMinus />
          </StyleOption>
          <StyleOption
            $isSelected={currentStyle === 'dashed'}
            onClick={() => handleStyleClick('dashed')}
            title="Dashed Line"
          >
            <IconLineDashed />
          </StyleOption>
        </StyleOptions>
      </MenuSection>
    </EdgeMenuContainer>
  )
}