import React from 'react'
import styled from 'styled-components'

interface FloatingToolbarProps {
  isOpen: boolean
  x?: number
  y?: number
  onClose?: () => void
  children: React.ReactNode
  className?: string
}

const ToolbarContainer = styled.div<{ $isOpen: boolean; $x?: number; $y?: number }>`
  position: ${props => props.$x !== undefined ? 'fixed' : 'absolute'};
  top: ${props => props.$x !== undefined ? `${props.$y}px` : '48px'};
  left: ${props => props.$x !== undefined ? `${props.$x}px` : 'auto'};
  right: ${props => props.$x !== undefined ? 'auto' : '0'};
  background: rgba(45, 45, 45, 0.98);
  border: 1px solid rgba(60, 60, 60, 0.8);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(40px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  gap: 3px;
  align-items: center;
  z-index: 9999;
  min-width: auto;
`

export default function FloatingToolbar({ 
  isOpen, 
  x, 
  y, 
  onClose, 
  children, 
  className 
}: FloatingToolbarProps) {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && onClose) {
        const target = event.target as Element
        if (!target.closest('[data-floating-toolbar]')) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <ToolbarContainer 
      $isOpen={isOpen} 
      $x={x} 
      $y={y}
      className={className}
      data-floating-toolbar
    >
      {children}
    </ToolbarContainer>
  )
}