import { useState, useCallback } from 'react'
import { getSmoothStepPath, Position, type EdgeProps } from '@xyflow/react'

interface ConnectorData {
  lineColor?: string
  lineType?: 'solid' | 'dashed'
  [key: string]: any
}

interface InteractiveConnectorProps extends EdgeProps {
  data?: ConnectorData
  onConnectorClick?: (event: React.MouseEvent, connectorId: string, color: string, style: 'solid' | 'dashed') => void
}

export default function InteractiveConnector({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  data,
  onConnectorClick
}: InteractiveConnectorProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const [connectorPath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  })

  const lineColor = data?.lineColor || '#666666'
  const lineType = data?.lineType || 'solid'

  const handleConnectorClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    onConnectorClick?.(event, id, lineColor, lineType)
  }, [id, lineColor, lineType, onConnectorClick])

  return (
    <>
      {/* Main connector path */}
      <path
        id={id}
        d={connectorPath}
        stroke={lineColor}
        strokeWidth={isHovered ? 3 : 2}
        strokeDasharray={lineType === 'dashed' ? '8 4' : undefined}
        fill="none"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleConnectorClick}
      />
      
      {/* Hover effect */}
      {isHovered && (
        <path
          d={connectorPath}
          stroke="rgba(0, 122, 255, 0.3)"
          strokeWidth={8}
          fill="none"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </>
  )
}