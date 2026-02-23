import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

const Handle = styled.div<{ $position: string }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0, 122, 255, 0.9);
  border: 2px solid white;
  border-radius: 50%;
  cursor: ${props => {
    switch (props.$position) {
      case 'top-left':
      case 'bottom-right':
        return 'nw-resize';
      case 'top-right':
      case 'bottom-left':
        return 'ne-resize';
      default:
        return 'pointer';
    }
  }};
  z-index: 1000;
  pointer-events: auto;
  
  ${props => {
    switch (props.$position) {
      case 'top-left':
        return 'top: -6px; left: -6px;';
      case 'top-right':
        return 'top: -6px; right: -6px;';
      case 'bottom-left':
        return 'bottom: -6px; left: -6px;';
      case 'bottom-right':
        return 'bottom: -6px; right: -6px;';
      default:
        return '';
    }
  }}
  
  &:hover {
    background: rgba(0, 122, 255, 1);
    transform: scale(1.2);
  }
`

interface ResizeHandleProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onResize: (width: number, height: number) => void;
  currentWidth: number;
  currentHeight: number;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  position,
  onResize,
  currentWidth,
  currentHeight
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = currentWidth
    const startHeight = currentHeight
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault()
      moveEvent.stopPropagation()
      
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      
      let newWidth = startWidth
      let newHeight = startHeight
      
      // Calculate new dimensions based on handle position
      switch (position) {
        case 'bottom-right':
          newWidth = startWidth + deltaX
          newHeight = startHeight + deltaY
          break
        case 'bottom-left':
          newWidth = startWidth - deltaX
          newHeight = startHeight + deltaY
          break
        case 'top-right':
          newWidth = startWidth + deltaX
          newHeight = startHeight - deltaY
          break
        case 'top-left':
          newWidth = startWidth - deltaX
          newHeight = startHeight - deltaY
          break
      }
      
      // Maintain aspect ratio if shift is held
      if (moveEvent.shiftKey) {
        const aspectRatio = startWidth / startHeight
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio
        } else {
          newWidth = newHeight * aspectRatio
        }
      }
      
      // Apply minimum size constraints
      newWidth = Math.max(60, newWidth)
      newHeight = Math.max(40, newHeight)
      
      onResize(newWidth, newHeight)
    }
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault()
      upEvent.stopPropagation()
      
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('mouseup', handleMouseUp, true)
    }
    
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseup', handleMouseUp, true)
  }, [position, onResize, currentWidth, currentHeight])

  return (
    <Handle
      $position={position}
      className="nodrag nopan"
      onMouseDown={handleMouseDown}
      style={{
        opacity: isDragging ? 1 : 0.8,
        transform: isDragging ? 'scale(1.2)' : 'scale(1)'
      }}
    />
  )
}