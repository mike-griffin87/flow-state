import { useState, useCallback } from 'react'
import { getSmoothStepPath, Position, type EdgeProps } from '@xyflow/react'

interface InteractiveEdgeData {
  lineColor?: string
  lineType?: 'solid' | 'dashed'
  [key: string]: any
}

interface InteractiveEdgeProps extends EdgeProps {
  data?: InteractiveEdgeData
  onEdgeClick?: (event: React.MouseEvent, edgeId: string, color: string, style: 'solid' | 'dashed') => void
}

export default function InteractiveEdge({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  data,
  onEdgeClick
}: InteractiveEdgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  })

  const lineColor = data?.lineColor || '#666666'
  const lineType = data?.lineType || 'solid'

  const handleEdgeClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    onEdgeClick?.(event, id, lineColor, lineType)
  }, [id, lineColor, lineType, onEdgeClick])

  return (
    <>
      {/* Main edge path */}
      <path
        id={id}
        d={edgePath}
        stroke={lineColor}
        strokeWidth={isHovered ? 3 : 2}
        strokeDasharray={lineType === 'dashed' ? '8 4' : undefined}
        fill="none"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleEdgeClick}
      />
      
      {/* Hover effect */}
      {isHovered && (
        <path
          d={edgePath}
          stroke="rgba(0, 122, 255, 0.3)"
          strokeWidth={8}
          fill="none"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </>
  )
}