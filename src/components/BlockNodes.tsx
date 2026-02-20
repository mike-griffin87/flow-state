import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'

// Define the node data interface
export interface BlockData extends Record<string, unknown> {
  label: string;
  nodeType: 'parent' | 'child' | 'transition' | 'finish' | 'text';
  description?: string;
  content?: string;
  isEditing?: boolean;
}

// Single unified node component - completely plain React
export const Block = (props: any) => {
  console.log('Block props:', props) // Debug what props we get
  const { data, selected } = props
  // Unified subtext for all nodes
  const getSubtextByType = () => {
    return 'Block Item'
  }

  // Unified styling for all nodes
  const colors = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    color: '#1d1d1f'
  }
  
  const nodeStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '8px',
    minWidth: '100px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    position: 'relative',
    background: colors.background,
    color: colors.color,
    border: `1px solid ${colors.borderColor}`,
    boxShadow: selected ? '0 0 0 2px rgba(0, 122, 255, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
  }

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    marginBottom: '2px',
    fontSize: '13px',
    letterSpacing: '-0.01em'
  }

  const subtextStyle: React.CSSProperties = {
    fontSize: '11px',
    opacity: 0.6,
    fontWeight: 400,
    letterSpacing: '0.01em'
  }

  // Large connection areas positioned exactly at block edges
  const handleStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    width: 12,
    height: 12,
    // Position handles exactly at the border edge, not outside
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
    pointerEvents: 'none', // Don't interfere with connections
    zIndex: 10,
    position: 'absolute' as const,
  }

  return (
    <div 
      style={nodeStyle}
      className="block"
    >
      {/* Handles positioned exactly at edges for proper connection points */}
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

      {/* Visual dots for feedback - positioned outside block */}
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
      
      <div style={labelStyle}>{data.label}</div>
      <div style={subtextStyle}>{getSubtextByType()}</div>
      
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