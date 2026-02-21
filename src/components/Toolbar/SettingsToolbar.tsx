import { useState } from 'react'
import styled from 'styled-components'
import { IconSettings } from '@tabler/icons-react'

const Toolbar = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #1d1d1f;
  }
`

const SettingsDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 44px;
  left: 0;
  background: #ffffff;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  padding: 8px 0;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1001;
`

const SettingsItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: #ffffff;
  text-align: left;
  font-size: 14px;
  color: #1d1d1f;
  cursor: pointer;
  display: block;
  
  &:hover {
    background: #f5f5f7;
  }
  
  &:active {
    background: #e5e5e7;
  }
`

interface SettingsToolbarProps {
  onSettingsClick?: (setting: string) => void
}

export default function SettingsToolbar({ onSettingsClick }: SettingsToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleItemClick = (setting: string) => {
    onSettingsClick?.(setting)
    setDropdownOpen(false)
  }

  return (
    <Toolbar>
      <div style={{ position: 'relative' }}>
        <ToolbarButton 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="Settings"
        >
          <IconSettings />
        </ToolbarButton>
        
        <SettingsDropdown $isOpen={dropdownOpen}>
          <SettingsItem onClick={() => handleItemClick('general')}>
            General
          </SettingsItem>
          <SettingsItem onClick={() => handleItemClick('appearance')}>
            Appearance
          </SettingsItem>
          <SettingsItem onClick={() => handleItemClick('export')}>
            Export
          </SettingsItem>
          <SettingsItem onClick={() => handleItemClick('import')}>
            Import
          </SettingsItem>
          <SettingsItem onClick={() => handleItemClick('help')}>
            Help
          </SettingsItem>
        </SettingsDropdown>
      </div>
    </Toolbar>
  )
}