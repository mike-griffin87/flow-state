# Changelog

All notable changes to Flow-State will be documented in this file.

## [Unreleased]

### Added
- Professional Figma-style horizontal shape picker with clean icons
- Font size control toolbar with A/A/A sizing pattern (small/medium/large)
- Block resizing with corner handles and proper ReactFlow integration
- Auto-resize functionality when font size increases to prevent text overflow
- Intelligent positioning system prevents blocks from stacking on top of each other
- Viewport-aware alignment guides that work correctly at all zoom levels
- Support for 'ellipse' nodeType with proper rendering

### Fixed
- **Alignment Guides**: Complete overhaul of coordinate system for perfect horizontal and vertical alignment
- **React Console Errors**: Resolved all duplicate key warnings by using unique keys for components
- **Styled Components**: Fixed prop warnings by using $ prefixes ($active, $visible) to prevent DOM pollution
- **TypeScript Issues**: Resolved control flow analysis errors with proper type assertions
- **Toolbar Positioning**: Fixed BlockToolbar centering and positioning issues
- **Auto-resize**: Font size changes now trigger automatic block resizing to accommodate larger text
- **ReactFlow Integration**: Proper nodrag/nopan className usage for resize handles
- **Component Keys**: Added unique keys to ResizeHandle components to eliminate React warnings

### Changed
- Transformed vertical shape library into horizontal Figma-style picker
- Improved text measurement utility with canvas-based width calculation
- Enhanced toolbar components with custom positioning containers
- Streamlined component architecture by removing unused parameters and functions

### Technical
- Fixed viewport coordinate transformation for alignment guides using proper screen coordinates
- Improved TypeScript type safety with explicit GuideInfo type assertions
- Cleaned up all VS Code problems and console warnings
- Enhanced styled-components usage with transient props ($-prefixed)
- Optimized alignment guide rendering to use single viewport calls
- Added comprehensive error handling and type checking

### Removed
- Unused onClose parameter from ConnectorToolbar component
- Legacy component files and unused architectural experiments
- Console logging and debug code for production readiness

---

## Previous Entries

### Added
- Figma-like spacing distribution guides for even block distribution
- Smart horizontal and vertical distribution detection
- Enhanced snapping system that works with both alignment and spacing guides
- Dashed line styling for better visual distinction

### Fixed
- Spacing distribution now properly detects equal distribution positions
- Horizontal distribution snapping works correctly (like Figma)
- Distribution guides only show when dragged node approaches optimal spacing position
- Snapping priority: alignment guides take precedence over distribution guides

### Fixed
- Connection cursor issue: Added proper cursor state management during connection dragging
- Crosshair cursor now properly maintained throughout entire connection process
- Connection detection no longer interferes with cursor state
- Fixed overlapping handles causing connection drop conflicts
- Arrow direction now correctly points at target node (A → B instead of A ← B)

### Changed
- Alignment guide lines now use lighter, dashed styling for better aesthetics
- Guide lines are more subtle and less intrusive

### Technical
- Added `isConnecting` state to track connection dragging
- Implemented `onConnectStart` and `onConnectEnd` handlers
- Enhanced FlowContainer with conditional cursor styling during connections
- Removed duplicate target handles to prevent connection conflicts
- Changed arrow marker from `markerStart` to `markerEnd` for correct direction
- Added `spacingGuides` state for distribution guide management
- Enhanced `detectAlignments` function with spacing distribution detection

## [0.1.0] - 2026-02-20

### Added
- Initial Flow-State flowchart builder implementation
- Apple-inspired minimal design system
- React + TypeScript + Vite foundation
- @xyflow/react integration for flowchart functionality
- Smooth drag, drop, and zoom interactions
- Basic node library and block nodes components
- Project documentation and setup files
- Git repository initialized and connected to GitHub

### Changed
- Removed BJJ references from project documentation
- Updated project title to Flow-State throughout codebase

### Technical
- React 19.2.0 with TypeScript support
- Vite 7.3.1 for development and build tooling
- styled-components for CSS-in-JS styling
- ESLint configuration for code quality