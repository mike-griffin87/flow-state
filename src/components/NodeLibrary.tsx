import { useState } from 'react'
import styled from 'styled-components'

const LibraryContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  width: 240px;
  max-height: calc(100vh - 40px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  z-index: 10;
  padding: 16px;
  overflow-y: auto;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #f9f9f9;
  color: #1d1d1f;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007aff;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
  
  &::placeholder {
    color: #8e8e93;
  }
`

const LibraryTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`

const NodeGroup = styled.div`
  margin-bottom: 16px;
`

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 8px;
  
  &:hover {
    opacity: 0.7;
  }
`

const GroupTitle = styled.h4`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`

const CollapseIcon = styled.span`
  font-size: 12px;
  color: #8e8e93;
  transition: transform 0.2s ease;
  
  &.collapsed {
    transform: rotate(-90deg);
  }
`

const GroupContent = styled.div`
  overflow: hidden;
  transition: max-height 0.3s ease;
`

const NodeItem = styled.div`
  padding: 12px 16px;
  background: #f9f9f9;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: grab;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  transition: all 0.2s ease;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  
  &:hover {
    background: #f0f0f0;
    border-color: #d1d1d6;
    transform: translateY(-1px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    cursor: grabbing;
    transform: scale(0.98);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`

const ParentNode = styled(NodeItem)`
  background: linear-gradient(135deg, #007aff 0%, #005ce6 100%);
  color: white;
  border-color: #007aff;
  
  &:hover {
    background: linear-gradient(135deg, #005ce6 0%, #0040cc 100%);
    border-color: #005ce6;
  }
`

const ChildNode = styled(NodeItem)`
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  color: white;
  border-color: #34c759;
  
  &:hover {
    background: linear-gradient(135deg, #30d158 0%, #28cd41 100%);
    border-color: #30d158;
  }
`

export interface NodeLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: any) => void;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onDragStart }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const libraryStructure = {
    'Categories': {
      parent: { name: 'Categories', type: 'parent' },
      children: [
        { name: 'Category A', type: 'child' },
        { name: 'Category B', type: 'child' },
        { name: 'Category C', type: 'child' },
        { name: 'Category D', type: 'child' },
      ]
    }
  }

  const toggleGroup = (categoryName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }

  const getFilteredItems = (items: any[]) => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const isGroupVisible = (items: any[]) => {
    if (searchTerm) {
      return getFilteredItems(items).length > 0
    }
    return true
  }

  return (
    <LibraryContainer>
      <LibraryTitle>Node Library</LibraryTitle>
      
      <SearchInput
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {Object.entries(libraryStructure).map(([categoryName, groupData]) => {
        const allItems = [groupData.parent, ...groupData.children]
        const filteredItems = getFilteredItems(allItems)
        
        if (!isGroupVisible(allItems)) return null
        
        return (
          <NodeGroup key={categoryName}>
            <GroupHeader onClick={() => toggleGroup(categoryName.toLowerCase())}>
              <GroupTitle>{categoryName}</GroupTitle>
              <CollapseIcon className={collapsedGroups[categoryName.toLowerCase()] ? 'collapsed' : ''}>
                ▼
              </CollapseIcon>
            </GroupHeader>
            
            <GroupContent style={{ 
              maxHeight: collapsedGroups[categoryName.toLowerCase()] ? '0' : '500px',
              marginBottom: collapsedGroups[categoryName.toLowerCase()] ? '0' : '8px'
            }}>
              {/* Parent item */}
              {(!searchTerm || filteredItems.some(item => item.name === groupData.parent.name)) && (
                <ParentNode
                  draggable
                  onDragStart={(e) => onDragStart(e, 'block', { 
                    label: groupData.parent.name,
                    nodeType: groupData.parent.type
                  })}
                  style={{ marginBottom: '12px', fontWeight: '600' }}
                >
                  {groupData.parent.name} (Parent)
                </ParentNode>
              )}
              
              {/* Child items */}
              {getFilteredItems(groupData.children).map((item, index) => (
                <ChildNode
                  key={index}
                  draggable
                  onDragStart={(e) => onDragStart(e, 'block', { 
                    label: item.name,
                    nodeType: item.type
                  })}
                  style={{ marginLeft: '16px' }}
                >
                  {item.name}
                </ChildNode>
              ))}
            </GroupContent>
          </NodeGroup>
        )
      })}
      
      <NodeGroup>
        <GroupHeader onClick={() => toggleGroup('elements')}>
          <GroupTitle>Other Elements</GroupTitle>
          <CollapseIcon className={collapsedGroups.elements ? 'collapsed' : ''}>
            ▼
          </CollapseIcon>
        </GroupHeader>
        
        <GroupContent style={{ 
          maxHeight: collapsedGroups.elements ? '0' : '500px',
          marginBottom: collapsedGroups.elements ? '0' : '8px'
        }}>
          <NodeItem
            draggable
            onDragStart={(e) => onDragStart(e, 'textNode', { 
              label: 'Text Note',
              nodeType: 'text',
              content: 'type something'
            })}
          >
            Text Note
          </NodeItem>
          
          <NodeItem
            draggable
            onDragStart={(e) => onDragStart(e, 'block', { 
              label: 'Transition',
              nodeType: 'transition'
            })}
          >
            Transition
          </NodeItem>
          
          <NodeItem
            draggable
            onDragStart={(e) => onDragStart(e, 'block', { 
              label: 'Finish',
              nodeType: 'finish'
            })}
          >
            Finish
          </NodeItem>
        </GroupContent>
      </NodeGroup>
    </LibraryContainer>
  )
}

export default NodeLibrary