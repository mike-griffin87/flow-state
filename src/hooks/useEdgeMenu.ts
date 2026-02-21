import { useState, useCallback } from 'react'

export interface EdgeMenuState {
  isOpen: boolean
  x: number
  y: number
  edgeId: string | null
  currentColor: string
  currentStyle: 'solid' | 'dashed'
}

export function useEdgeMenu() {
  const [edgeMenuState, setEdgeMenuState] = useState<EdgeMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    edgeId: null,
    currentColor: '#666666',
    currentStyle: 'solid'
  })

  const openEdgeMenu = useCallback((x: number, y: number, edgeId: string, currentColor: string, currentStyle: 'solid' | 'dashed' = 'solid') => {
    setEdgeMenuState({
      isOpen: true,
      x,
      y,
      edgeId,
      currentColor,
      currentStyle
    })
  }, [])

  const closeEdgeMenu = useCallback(() => {
    setEdgeMenuState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  const updateEdgeColor = useCallback((color: string) => {
    setEdgeMenuState(prev => ({
      ...prev,
      currentColor: color
    }))
  }, [])

  const updateEdgeStyle = useCallback((style: 'solid' | 'dashed') => {
    setEdgeMenuState(prev => ({
      ...prev,
      currentStyle: style
    }))
  }, [])

  return {
    edgeMenuState,
    openEdgeMenu,
    closeEdgeMenu,
    updateEdgeColor,
    updateEdgeStyle
  }
}