import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { BlockToolbar } from './BlockToolbar'
import { ResizeHandle } from './ResizeHandle'

// Define the node data interface
export interface BlockData extends Record<string, unknown> {
  label: string;
  nodeType: 'start-end' | 'process' | 'decision' | 'input-output' | 'connector' | 'parent' | 'child' | 'transition' | 'finish' | 'text' | 'ellipse';
  shape?: string;
  description?: string;
  content?: string;
  isEditing?: boolean;
  fontSize?: number;
  width?: number;
  height?: number;
}

// Utility function to measure text width
const measureTextWidth = (text: string, fontSize: number): number => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (context) {
    context.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
    const metrics = context.measureText(text)
    return Math.ceil(metrics.width)
  }
  // Fallback estimation - more accurate
  return Math.ceil(text.length * fontSize * 0.65)
}

// Editable SVG shape components
const EditableStartEndNodeShape = ({ 
  label, 
  onEdit, 
  isEditing, 
  fontSize = 13, 
  width = 120,
  height = 60,
  onAutoResize
}: { 
  label: string, 
  onEdit: (text: string) => void, 
  isEditing: boolean, 
  fontSize?: number, 
  width?: number,
  height?: number,
  onAutoResize?: (width: number, height: number) => void
}) => {
  const handleTextChange = (newText: string) => {
    onEdit(newText)
    
    // Auto-resize if text is too wide
    if (onAutoResize && newText) {
      const textWidth = measureTextWidth(newText, fontSize)
      const minWidth = Math.max(120, textWidth + 40) // 40px padding
      if (minWidth > width) {
        onAutoResize(minWidth, height)
      }
    }
  }

  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-block'
    }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <ellipse cx={width/2} cy={height/2} rx={width/2-2} ry={height/2-2} fill="white" stroke="#666" strokeWidth="2"/>
      </svg>
      {isEditing ? (
        <input
          type="text"
          defaultValue={label}
          onBlur={(e) => handleTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextChange(e.currentTarget.value)}
          autoFocus
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontSize: `${fontSize}px`,
            fontWeight: '600',
            color: '#333',
            width: `${width-20}px`,
            outline: 'none'
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: `${fontSize}px`,
            fontWeight: '600',
            color: '#333',
            pointerEvents: 'none',
            userSelect: 'none',
            maxWidth: `${width-20}px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

const EditableProcessNodeShape = ({ 
  label, 
  onEdit, 
  isEditing, 
  fontSize = 13, 
  width = 120,
  height = 60,
  onAutoResize
}: { 
  label: string, 
  onEdit: (text: string) => void, 
  isEditing: boolean, 
  fontSize?: number, 
  width?: number,
  height?: number,
  onAutoResize?: (width: number, height: number) => void
}) => {
  const handleTextChange = (newText: string) => {
    onEdit(newText)
    
    // Auto-resize if text is too wide
    if (onAutoResize && newText) {
      const textWidth = measureTextWidth(newText, fontSize)
      const minWidth = Math.max(120, textWidth + 40) // 40px padding
      if (minWidth > width) {
        onAutoResize(minWidth, height)
      }
    }
  }

  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-block'
    }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <rect x="2" y="2" width={width-4} height={height-4} rx="4" fill="white" stroke="#666" strokeWidth="2"/>
      </svg>
      {isEditing ? (
        <input
          type="text"
          defaultValue={label}
          onBlur={(e) => handleTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextChange(e.currentTarget.value)}
          autoFocus
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontSize: `${fontSize}px`,
            fontWeight: '600',
            color: '#333',
            width: `${width-20}px`,
            outline: 'none'
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: `${fontSize}px`,
            fontWeight: '600',
            color: '#333',
            pointerEvents: 'none',
            userSelect: 'none',
            maxWidth: `${width-20}px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

const EditableDecisionNodeShape = ({ 
  label, 
  onEdit, 
  isEditing, 
  fontSize = 11, 
  size = 80
}: { 
  label: string, 
  onEdit: (text: string) => void, 
  isEditing: boolean, 
  fontSize?: number, 
  size?: number
}) => (
  <div style={{ 
    position: 'relative', 
    display: 'inline-block'
  }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <polygon points={`${size/2},2 ${size-2},${size/2} ${size/2},${size-2} 2,${size/2}`} fill="white" stroke="#666" strokeWidth="2"/>
    </svg>
    {isEditing ? (
      <input
        type="text"
        defaultValue={label}
        onBlur={(e) => onEdit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEdit(e.currentTarget.value)}
        autoFocus
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: 'none',
          background: 'transparent',
          textAlign: 'center',
          fontSize: `${fontSize}px`,
          fontWeight: '600',
          color: '#333',
          width: `${size-20}px`,
          outline: 'none'
        }}
      />
    ) : (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontSize: `${fontSize}px`,
          fontWeight: '600',
          color: '#333',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        {label}
      </div>
    )}
  </div>
)

const EditableConnectorNodeShape = ({ 
  label, 
  onEdit, 
  isEditing, 
  fontSize = 11, 
  size = 40
}: { 
  label: string, 
  onEdit: (text: string) => void, 
  isEditing: boolean, 
  fontSize?: number, 
  size?: number
}) => (
  <div style={{ 
    position: 'relative', 
    display: 'inline-block'
  }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <circle cx={size/2} cy={size/2} r={size/2-2} fill="white" stroke="#666" strokeWidth="2"/>
    </svg>
    {isEditing ? (
      <input
        type="text"
        defaultValue={label}
        onBlur={(e) => onEdit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEdit(e.currentTarget.value)}
        autoFocus
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: 'none',
          background: 'transparent',
          textAlign: 'center',
          fontSize: `${fontSize}px`,
          fontWeight: '600',
          color: '#333',
          width: `${size-10}px`,
          outline: 'none'
        }}
      />
    ) : (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontSize: `${fontSize}px`,
          fontWeight: '600',
          color: '#333',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        {label}
      </div>
    )}
  </div>
)

const EditableInputOutputNodeShape = ({ 
  label, 
  onEdit, 
  isEditing, 
  fontSize = 13, 
  width = 120,
  height = 60,
  onAutoResize
}: { 
  label: string, 
  onEdit: (text: string) => void, 
  isEditing: boolean, 
  fontSize?: number, 
  width?: number,
  height?: number,
  onAutoResize?: (width: number, height: number) => void
}) => {
  const handleTextChange = (newText: string) => {
    onEdit(newText)
    
    // Auto-resize if text is too wide
    if (onAutoResize && newText) {
      const textWidth = measureTextWidth(newText, fontSize)
      const minWidth = Math.max(120, textWidth + 40) // 40px padding
      if (minWidth > width) {
        onAutoResize(minWidth, height)
      }
    }
  }

  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-block'
    }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <polygon points={`${width*0.16},2 ${width-2},2 ${width*0.83},${height-2} 2,${height-2}`} fill="white" stroke="#666" strokeWidth="2"/>
      </svg>
      {isEditing ? (
        <input
          type="text"
          defaultValue={label}
          onBlur={(e) => handleTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextChange(e.currentTarget.value)}
          autoFocus
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontSize: `${fontSize}px`,
            fontWeight: '600',
            color: '#333',
            width: `${width-20}px`,
            outline: 'none'
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: `${fontSize}px`,
            fontWeight: '600',
            color: '#333',
            pointerEvents: 'none',
            userSelect: 'none',
            maxWidth: `${width-20}px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

// Single unified node component with proper SVG boundaries and editable text
export const Block = (props: any) => {
  const { data, selected, id } = props
  const { getNodes, setNodes } = useReactFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  
  // Get current fontSize from data with defaults
  const fontSize = data.fontSize || (data.nodeType === 'decision' || data.nodeType === 'connector' ? 11 : 13)
  const width = data.width || (data.nodeType === 'decision' || data.nodeType === 'connector' ? 80 : 120)
  const height = data.height || (data.nodeType === 'decision' || data.nodeType === 'connector' ? 80 : 60)
  
  // Handle text editing
  const handleTextEdit = useCallback((newText: string) => {
    setIsEditing(false)
    const nodes = getNodes()
    setNodes(nodes.map(node => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...node.data,
            label: newText
          }
        }
      }
      return node
    }))
  }, [id, setNodes, getNodes])

  // Handle font size change
  const handleFontSizeChange = useCallback((newFontSize: number) => {
    const nodes = getNodes()
    setNodes(nodes.map(node => {
      if (node.id === id) {
        // Calculate new width based on text and new font size
        const textWidth = measureTextWidth(node.data.label || '', newFontSize)
        const minWidth = Math.max(120, textWidth + 40) // 40px padding
        
        return {
          ...node,
          data: {
            ...node.data,
            fontSize: newFontSize,
            width: Math.max(node.data.width || width, minWidth)
          }
        }
      }
      return node
    }))
  }, [id, setNodes, getNodes, width])

  // Handle resize
  const handleResize = useCallback((newWidth: number, newHeight: number) => {
    const nodes = getNodes()
    setNodes(nodes.map(node => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...node.data,
            width: Math.max(60, newWidth),
            height: Math.max(40, newHeight)
          }
        }
      }
      return node
    }))
  }, [id, setNodes, getNodes])

  // Handle double click to start editing
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])
  
  // Get the appropriate SVG shape with label
  const getNodeShape = () => {
    const label = data.label || data.nodeType
    
    switch (data.nodeType) {
      case 'start-end':
      case 'ellipse':
        return <EditableStartEndNodeShape label={label} onEdit={handleTextEdit} isEditing={isEditing} fontSize={fontSize} width={width} height={height} onAutoResize={handleResize} />
      case 'process':
        return <EditableProcessNodeShape label={label} onEdit={handleTextEdit} isEditing={isEditing} fontSize={fontSize} width={width} height={height} onAutoResize={handleResize} />
      case 'decision':
        return <EditableDecisionNodeShape label={label} onEdit={handleTextEdit} isEditing={isEditing} fontSize={fontSize} size={Math.max(width, height)} />
      case 'input-output':
        return <EditableInputOutputNodeShape label={label} onEdit={handleTextEdit} isEditing={isEditing} fontSize={fontSize} width={width} height={height} onAutoResize={handleResize} />
      case 'connector':
        return <EditableConnectorNodeShape label={label} onEdit={handleTextEdit} isEditing={isEditing} fontSize={fontSize} size={Math.max(width, height)} />
      default:
        return <EditableProcessNodeShape label={label} onEdit={handleTextEdit} isEditing={isEditing} fontSize={fontSize} width={width} height={height} onAutoResize={handleResize} />
    }
  }

  // Container style - minimal, just for positioning
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
    filter: selected ? 'drop-shadow(0 0 0 3px rgba(0, 122, 255, 0.3))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
  }

  // Handle styling for connection points
  const handleStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    width: 12,
    height: 12,
  }

  // Visual dots that appear on hover
  const visibleHandleStyle: React.CSSProperties = {
    background: 'rgba(0, 122, 255, 0.9)',
    border: '2px solid white',
    width: 8,
    height: 8,
    borderRadius: '50%',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none' as const,
    zIndex: 10,
    position: 'absolute' as const,
  }

  return (
    <div 
      style={containerStyle}
      className="block"
      onDoubleClick={handleDoubleClick}
    >
      
      {/* Resize handles - appear when selected */}
      {selected && !isEditing && (
        <>
          <ResizeHandle 
            key="bottom-right"
            position="bottom-right"
            onResize={handleResize}
            currentWidth={width}
            currentHeight={height}
          />
          <ResizeHandle 
            key="bottom-left"
            position="bottom-left"
            onResize={handleResize}
            currentWidth={width}
            currentHeight={height}
          />
          <ResizeHandle 
            key="top-right"
            position="top-right"
            onResize={handleResize}
            currentWidth={width}
            currentHeight={height}
          />
          <ResizeHandle 
            key="top-left"
            position="top-left"
            onResize={handleResize}
            currentWidth={width}
            currentHeight={height}
          />
        </>
      )}
      
      {/* Connection handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top"
        style={handleStyle}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left"
        style={handleStyle}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        style={handleStyle}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        style={handleStyle}
      />

      {/* Visual handle indicators */}
      <div 
        className="handle-dot handle-dot-top"
        style={{
          ...visibleHandleStyle,
          top: -6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <div 
        className="handle-dot handle-dot-left"
        style={{
          ...visibleHandleStyle,
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <div 
        className="handle-dot handle-dot-bottom"
        style={{
          ...visibleHandleStyle,
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <div 
        className="handle-dot handle-dot-right"
        style={{
          ...visibleHandleStyle,
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      
      {/* The SVG shape with integrated text */}
      {getNodeShape()}
      
      {/* Block Toolbar - appears when selected */}
      <BlockToolbar 
        visible={selected && !isEditing}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        blockHeight={height}
      />
    </div>
  )
}

// Text node component for editable text blocks
export const TextNode = (props: any) => {
  console.log('TextNode props:', props) // Debug what props we get
  const { setNodes } = useReactFlow()
  const { id, data, selected } = props
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState((data?.content) || 'type something')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle double click to start editing
  const handleDoubleClick = useCallback(() => {
    console.log('Double clicked text node', { id, data }) // Debug log
    setIsEditing(true)
  }, [id, data])

  // Handle blur to stop editing and save content
  const handleBlur = useCallback(() => {
    console.log('Saving content', { id, content }) // Debug log
    setIsEditing(false)
    // Update the node data
    if (id) {
      setNodes(nodes => nodes.map(node => {
        if (node.id === id) {
          console.log('Updating node', node.id, 'with content:', content) // Debug log
          return {
            ...node,
            data: { ...node.data, content }
          }
        }
        return node
      }))
    }
  }, [content, id, setNodes])

  // Handle key press (save on Enter + Ctrl/Cmd)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleBlur()
    }
  }, [handleBlur])

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const nodeStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '8px',
    width: '200px', // Same width as other blocks
    minHeight: '40px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 400,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#1d1d1f',
    border: `1px solid ${isEditing ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 0, 0, 0.1)'}`,
    boxShadow: selected ? '0 0 0 2px rgba(0, 122, 255, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
    cursor: isEditing ? 'text' : 'pointer'
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    resize: 'none',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: 'inherit',
    lineHeight: '1.4',
    minHeight: '16px'
  }

  const displayTextStyle: React.CSSProperties = {
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    minHeight: '16px'
  }

  // Large connection areas positioned exactly at block edges
  const handleStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    width: 12,
    height: 12,
  }

  // Small visible dots that appear on hover
  const visibleHandleStyle: React.CSSProperties = {
    background: 'rgba(0, 122, 255, 0.9)',
    border: '2px solid white',
    width: 8,
    height: 8,
    borderRadius: '50%',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
    zIndex: 10,
    position: 'absolute' as const,
  }

  return (
    <div 
      style={nodeStyle}
      className="text-node"
      onDoubleClick={handleDoubleClick}
    >
      {/* Handles positioned exactly at edges */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top"
        style={handleStyle}
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top-target"
        style={handleStyle}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        style={handleStyle}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right-target"
        style={handleStyle}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        style={handleStyle}
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom-target"
        style={handleStyle}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left"
        style={handleStyle}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left-target"
        style={handleStyle}
      />

      {/* Content area */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={textareaStyle}
          rows={Math.max(1, content.split('\n').length)}
          placeholder="type something"
        />
      ) : (
        <div style={displayTextStyle}>
          {content}
        </div>
      )}

      {/* Visible handle dots on hover */}
      <div 
        className="handle-dot handle-dot-top"
        style={{
          ...visibleHandleStyle,
          top: -6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <div 
        className="handle-dot handle-dot-right"
        style={{
          ...visibleHandleStyle,
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <div 
        className="handle-dot handle-dot-bottom"
        style={{
          ...visibleHandleStyle,
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <div 
        className="handle-dot handle-dot-left"
        style={{
          ...visibleHandleStyle,
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}