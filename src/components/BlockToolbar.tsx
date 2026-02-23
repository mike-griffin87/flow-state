import React from 'react'
import styled from 'styled-components'

const FontButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.15s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`

interface BlockToolbarProps {
  visible: boolean;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  blockHeight?: number;
}

const fontSizeMap = {
  small: 10,
  medium: 13,
  large: 16
}

const ToolbarContainer = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(45, 45, 45, 0.98);
  border: 1px solid rgba(60, 60, 60, 0.8);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(40px);
  display: ${props => props.$visible ? 'flex' : 'none'};
  gap: 3px;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  transition: opacity 0.2s ease;
  white-space: nowrap;
`

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  visible,
  fontSize,
  onFontSizeChange
}) => {
  const currentSize = fontSize <= 11 ? 'small' : fontSize <= 14 ? 'medium' : 'large'

  return (
    <ToolbarContainer $visible={visible}>
      <FontButton
        $active={currentSize === 'small'}
        onClick={() => onFontSizeChange(fontSizeMap.small)}
        title="Small text"
        style={{ fontSize: '10px' }}
      >
        A
      </FontButton>
      <FontButton
        $active={currentSize === 'medium'}
        onClick={() => onFontSizeChange(fontSizeMap.medium)}
        title="Medium text"
        style={{ fontSize: '13px' }}
      >
        A
      </FontButton>
      <FontButton
        $active={currentSize === 'large'}
        onClick={() => onFontSizeChange(fontSizeMap.large)}
        title="Large text"
        style={{ fontSize: '16px' }}
      >
        A
      </FontButton>
    </ToolbarContainer>
  )
}