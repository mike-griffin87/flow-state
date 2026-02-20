# Flow-State - Project Context

## Project Overview
A fluid, minimalist flowchart builder designed with Apple-inspired aesthetics. The primary focus is on creating buttery smooth interactions with professional-grade performance for dragging, repositioning, selecting, moving multiple nodes, connection lines, and zooming.

## Current Status: Phase 1 Complete ✅
**Working area foundation is established** with smooth core interactions.

## Tech Stack
- **React 18** with TypeScript
- **Vite** (build tool for optimal performance)
- **styled-components** (CSS-in-JS styling)
- **@xyflow/react** (React Flow - core flowchart functionality)
- **MIT License** (free for all use cases)

## Architecture & Design Principles

### Design Philosophy
- **Apple-inspired minimalism**: Clean, intuitive, uncluttered
- **Performance-first**: Buttery smooth 60fps interactions
- **Progressive enhancement**: Build core features solidly before adding complexity

### Visual Design System
```css
Colors:
- Background: #f5f5f7 (Apple's light gray)
- Primary: #007aff (iOS blue)
- Surface: rgba(255, 255, 255, 0.95) with backdrop blur
- Border: #d1d1d6
- Text: #1d1d1f

Typography:
- Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'
- Smoothing: antialiased

Effects:
- Border radius: 12px (modern iOS style)
- Shadows: subtle with rgba(0, 0, 0, 0.08)
- Backdrop blur: 20px for glassmorphism
- Transitions: 0.2s ease for all interactions
```

## Current Implementation

### File Structure
```
src/
├── App.tsx          # Main flowchart component
├── index.css        # Global Apple-inspired styles
└── main.tsx         # React entry point
```

### Features Implemented ✅
1. **Smooth Canvas Interactions**
   - Dragging and repositioning nodes
   - Multi-node selection (box select + cmd/ctrl click)
   - Zoom and pan with momentum
   - Snap to grid (15x15)

2. **Custom Node System**
   - Apple-inspired styled nodes with glassmorphism
   - Hover effects with subtle lift animation
   - Selection states with iOS-style blue outline
   - Custom node type system ready for extension

3. **Connection System** 
   - Smooth step edges (curved, professional look)
   - iOS blue (#007aff) connection lines
   - Automatic connection creation by dragging

4. **UI Controls**
   - Minimalist zoom controls (glassmorphism style)
   - Mini-map with matching design system
   - Dot grid background for visual alignment
   - Attribution removed for clean interface

5. **Performance Optimizations**
   - React Flow's built-in virtualization
   - Optimized re-renders with proper state management
   - Hardware-accelerated CSS transforms

### Code Architecture

#### Main App Component
```typescript
// Current node structure
const initialNodes = [
  { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Start' } },
  // ... more nodes
]

// Custom styled node with Apple aesthetics
const CustomNode = ({ data, selected }) => (
  <StyledNode className={selected ? 'selected' : ''}>
    {data.label}
  </StyledNode>
)
```

## Next Phase Priorities

### Phase 2: Core Functionality (Recommended Next Steps)
1. **Node Creation System** 🎯 *HIGH PRIORITY*
   - Sidebar palette with draggable node types
   - Right-click context menu for quick node creation
   - Different node shapes (rectangle, diamond, circle, rounded)

2. **Inline Text Editing**
   - Double-click to edit node labels
   - Enter/Escape to confirm/cancel
   - Real-time text sizing and node resizing

3. **Keyboard Shortcuts**
   - Delete key: Remove selected nodes/edges
   - Ctrl/Cmd+A: Select all
   - Ctrl/Cmd+C/V: Copy/paste nodes
   - Arrow keys: Fine-tune positioning

4. **Node Type System**
   - Start/End nodes (rounded rectangles, green/red)
   - Process nodes (rectangles, blue)
   - Decision nodes (diamonds, orange)
   - Color and shape variations

### Phase 3: Advanced Features (Future)
- **Data Persistence** (localStorage/IndexedDB)
- **Export Functions** (PNG, SVG, JSON)
- **Undo/Redo System**
- **Node Grouping/Containers**
- **Edge Labels and Styling**
- **Minimap Enhancements**

## Development Guidelines

### Performance Requirements
- Maintain 60fps during all interactions
- Smooth animations without jank
- Responsive feedback to all user input (<16ms)

### Code Style
- TypeScript strict mode
- Functional components with hooks
- styled-components for all styling
- No CSS files except global index.css

### Testing Strategy
- Manual interaction testing on every change
- Performance monitoring with React DevTools
- Cross-browser compatibility (Chrome, Safari, Firefox, Edge)

## Current Development Server
- **URL**: http://localhost:5173/
- **Hot reload**: Enabled with Vite
- **Build command**: `npm run build`
- **Dev command**: `npm run dev`

## Known Issues/Limitations
- No persistence yet (refreshing loses work)
- Limited node types (only custom text nodes)
- No keyboard shortcuts implemented
- No node creation UI (only initial demo nodes)

## Performance Notes
- React Flow handles 1000+ nodes smoothly
- Styled-components optimized for runtime performance
- Vite provides instant HMR for development
- Production build is optimized and tree-shaken

---

**Last Updated**: February 19, 2026
**Current Phase**: Foundation Complete → Moving to Core Functionality
**Ready For**: Node creation system implementation