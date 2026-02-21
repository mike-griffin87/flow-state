import { useState, useCallback } from 'react'

export interface ConnectorToolbarState {
  isOpen: boolean
  x: number
  y: number
  connectorId: string | null
  currentColor: string
  currentStyle: 'solid' | 'dashed'
}

export function useConnectorToolbar() {
  const [toolbarState, setToolbarState] = useState<ConnectorToolbarState>({
    isOpen: false,
    x: 0,
    y: 0,
    connectorId: null,
    currentColor: '#666666',
    currentStyle: 'solid'
  })

  const openToolbar = useCallback((x: number, y: number, connectorId: string, currentColor: string, currentStyle: 'solid' | 'dashed' = 'solid') => {
    setToolbarState({
      isOpen: true,
      x,
      y,
      connectorId,
      currentColor,
      currentStyle
    })
  }, [])

  const closeToolbar = useCallback(() => {
    setToolbarState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  const updateColor = useCallback((color: string) => {
    setToolbarState(prev => ({
      ...prev,
      currentColor: color
    }))
  }, [])

  const updateStyle = useCallback((style: 'solid' | 'dashed') => {
    setToolbarState(prev => ({
      ...prev,
      currentStyle: style
    }))
  }, [])

  return {
    toolbarState,
    openToolbar,
    closeToolbar,
    updateColor,
    updateStyle
  }
}